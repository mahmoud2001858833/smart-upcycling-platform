/**
 * OpenRouter core — server-side only.
 *
 * Pure ESM with no Deno/Node-specific APIs, so the same file runs in:
 *   - the Supabase Edge Function  (supabase/functions/ai-gateway/index.ts)
 *   - the Vite dev server         (vite.config.js, local development)
 *
 * The OpenRouter key is passed in by the host (a secret / .env.local value).
 * It must never be shipped to the browser.
 */

import { cfConfig, hasCloudflare, cloudflareImage } from './cloudflare.js';
import { geminiConfig, hasGemini, geminiText, geminiImage, freeImage } from './gemini.js';

const OPENROUTER_API = 'https://openrouter.ai/api/v1';
const OPENROUTER_URL = `${OPENROUTER_API}/chat/completions`;

/** Error with a machine-readable code and HTTP status, mapped by the hosts. */
export class GatewayError extends Error {
  constructor(message, { status = 500, code = 'ERROR' } = {}) {
    super(message);
    this.name = 'GatewayError';
    this.status = status;
    this.code = code;
  }
}

/** Accumulates what a request cost, so the platform can log it. */
export const newMeter = () => ({ cost: 0, tokens: 0, calls: 0 });

export function addUsage(meter, data) {
  if (!meter) return;
  meter.calls += 1;
  const u = data?.usage;
  if (!u) return;
  const c = Number(u.cost);
  if (Number.isFinite(c)) meter.cost += c;
  meter.tokens += Number(u.total_tokens) || ((Number(u.prompt_tokens) || 0) + (Number(u.completion_tokens) || 0));
}

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

export function resolveConfig(env = {}) {
  const list = (v, fallback) =>
    (v ? String(v).split(',').map(s => s.trim()).filter(Boolean) : fallback);

  return {
    // Cheap + fast: brainstorming many concepts.
    ideationModels: list(env.OPENROUTER_IDEATION_MODEL, [
      'google/gemini-3.8-flash',
      'anthropic/claude-opus-5.5'
    ]),
    // Strongest available: writing the full project manual.
    developModels: list(env.OPENROUTER_DEVELOP_MODEL, [
      'anthropic/claude-opus-5.5',
      'google/gemini-3.8-flash'
    ]),
    chatModels: list(env.OPENROUTER_CHAT_MODEL, [
      'google/gemini-3.8-flash',
      'anthropic/claude-opus-5.5'
    ]),
    // Must be models that can OUTPUT images. Verify on openrouter.ai/models
    // (filter: Output modalities -> Image) and override with the env var.
    imageModels: list(env.OPENROUTER_IMAGE_MODEL, [
      'google/gemini-2.5-flash-image'
    ]),
    // paid model for the 2x2 stage-guide sheets (e.g. the exact OpenRouter slug of GPT Image); falls back to imageModels
    guideImageModels: [...list(env.OPENROUTER_GUIDE_IMAGE_MODEL, []), ...list(env.OPENROUTER_IMAGE_MODEL, ['google/gemini-2.5-flash-image'])],
    cloudflare: cfConfig(env),
    gemini: geminiConfig(env),
    apiBase: env.OPENROUTER_API_BASE || OPENROUTER_API,
    baseUrl: env.OPENROUTER_BASE_URL || (env.OPENROUTER_API_BASE ? `${env.OPENROUTER_API_BASE}/chat/completions` : OPENROUTER_URL),
    // Resolution for the main pictures. 2K/4K only apply to image models that support them.
    imageSize: env.OPENROUTER_IMAGE_SIZE || '2K',
    siteUrl: env.OPENROUTER_SITE_URL || 'https://smart-upcycling-platform.local',
    siteName: env.OPENROUTER_SITE_NAME || 'Smart Upcycling Platform'
  };
}

/* ------------------------------------------------------------------ */
/* Low-level OpenRouter call with model fallback                        */
/* ------------------------------------------------------------------ */

async function postOpenRouter({ apiKey, config, body, timeoutMs }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(config.baseUrl || OPENROUTER_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': config.siteUrl,
        'X-Title': config.siteName
      },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* keep raw text for the error */ }
    return { status: res.status, ok: res.ok, data, raw: text };
  } finally {
    clearTimeout(timer);
  }
}

function errorMessage(r) {
  return r.data?.error?.message || r.raw?.slice(0, 300) || `HTTP ${r.status}`;
}

export async function chat({
  apiKey, config, models, messages, meter = null,
  json = false, temperature = 0.8, maxTokens = 8000, timeoutMs = 100000, role = 'text'
}) {
  const gem = config.gemini;
  const gemOn = hasGemini(gem);
  if (!apiKey && !gemOn) throw new GatewayError('لم يُضبط أي مفتاح ذكاء اصطناعي على الخادم (OPENROUTER_API_KEY أو GEMINI_API_KEY)', { status: 503, code: 'NO_KEY' });
  // who goes first: the assistant always prefers Gemini; ideate/develop follow TEXT_PROVIDER
  const geminiFirst = gemOn && (!apiKey || role === 'chat' || gem.textProvider === 'gemini');
  const viaGemini = async () => {
    const model = role === 'develop' ? gem.developModel : gem.model;
    const r = await geminiText({ cfg: gem, model, messages, json, temperature, maxTokens, timeoutMs });
    addUsage(meter, { usage: r.usage });
    return { text: r.text, model: r.model };
  };
  if (geminiFirst) {
    try { return await viaGemini(); } catch (e) {
      if (!apiKey) throw new GatewayError(`تعذر الاتصال بـ Gemini: ${e.message}`, { status: 503, code: e.code === 'BAD_KEY' ? 'BAD_KEY' : 'AI_FAILED' });
      /* fall through to OpenRouter */
    }
  }
  try {
    return await chatOpenRouter({ apiKey, config, models, messages, meter, json, temperature, maxTokens, timeoutMs });
  } catch (e) {
    if (gemOn && !geminiFirst) { try { return await viaGemini(); } catch { /* report the first error */ } }
    throw e;
  }
}

async function chatOpenRouter({
  apiKey, config, models, messages, meter = null,
  json = false, temperature = 0.8, maxTokens = 8000, timeoutMs = 100000
}) {
  let lastErr = null;

  for (const model of models) {
    const base = { model, messages, temperature, max_tokens: maxTokens, usage: { include: true } };
    const attempts = json ? [{ ...base, response_format: { type: 'json_object' } }, base] : [base];

    for (const body of attempts) {
      let r;
      try {
        r = await postOpenRouter({ apiKey, config, body, timeoutMs });
      } catch (e) {
        lastErr = new Error(`${model}: ${e.name === 'AbortError' ? 'انتهت المهلة' : e.message}`);
        break; // try next model
      }
      if (r.ok) {
        const content = r.data?.choices?.[0]?.message?.content;
        const text = Array.isArray(content)
          ? content.map(p => p?.text || '').join('')
          : (content || '');
        addUsage(meter, r.data);
        if (text) return { text, model };
        lastErr = new Error(`${model}: استجابة فارغة`);
        break;
      }
      lastErr = new Error(`${model}: ${errorMessage(r)}`);
      // 400/422 usually means response_format unsupported -> retry same model without it
      if ((r.status === 400 || r.status === 422) && body.response_format) continue;
      // Auth / credit problems will not be fixed by another model
      if (r.status === 402) throw new GatewayError('رصيد الذكاء الاصطناعي انتهى', { status: 503, code: 'NO_CREDIT' });
      if (r.status === 401) throw new GatewayError('مفتاح الذكاء الاصطناعي على الخادم غير صالح', { status: 503, code: 'BAD_KEY' });
      break;
    }
  }
  throw lastErr || new Error('فشل الاتصال بـ OpenRouter');
}

export function extractJson(text) {
  if (!text) throw new Error('نص فارغ');
  let t = String(text).replace(/```(?:json)?/gi, '').trim();
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('لا يوجد JSON في الاستجابة');
  t = t.slice(first, last + 1);
  try {
    return JSON.parse(t);
  } catch {
    // tolerate trailing commas
    return JSON.parse(t.replace(/,\s*([}\]])/g, '$1'));
  }
}

/* ------------------------------------------------------------------ */
/* Prompts                                                             */
/* ------------------------------------------------------------------ */

const LEVEL_TEXT = {
  child: 'children aged 6-12 (NO sharp blades, NO heat tools, NO power tools; adult supervision assumed; bright and playful results)',
  teen: 'teenagers 13-17 (light hand tools allowed, adult nearby for heat/power tools)',
  adult: 'adults (hand and basic power tools allowed)',
  all: 'a mixed family audience (provide an easy path; mark adult-only steps clearly)'
};

const TYPE_TEXT = {
  practical: 'practical, everyday-useful objects',
  scientific: 'science-driven projects that demonstrate a real physical/chemical/biological principle and can be tested',
  artistic: 'art and interior-decor pieces with strong visual identity',
  group: 'collaborative projects for a classroom/team where several people build parts and combine them',
  all: 'any category — but keep the three final picks very different from each other'
};

function levelText(v) { return LEVEL_TEXT[v] || String(v || LEVEL_TEXT.adult); }
function typeText(v) { return TYPE_TEXT[v] || String(v || TYPE_TEXT.all); }

const DESIGNER_PERSONA = `You are a world-class upcycling designer and circular-economy engineer — think of the product sense of Dieter Rams, the hands-on rigor of a master woodworker/metalworker, and the clarity of the best DIY instructors.
You know real material properties (PET, HDPE, glass, aluminium, corrugated cardboard, denim, plywood, steel cans...), how they cut, bond, bend, crack, burn, rust and age.
You NEVER invent physically impossible builds. Every measurement, tool and technique you give must work in a normal home workshop.`;

export function buildIdeationMessages({ materials, level, type, count = 8, avoid = [] }) {
  const system = `${DESIGNER_PERSONA}

TASK: Brainstorm ${count} genuinely distinct upcycling project concepts that use the user's materials.

HARD RULES
1. Every concept must be built mainly from the user's materials. In "usesMaterials" copy the user's own wording for each material it really uses (never invent materials the user did not list; cheap supplies like glue or screws are not materials). A concept that ignores the user's materials is a failure.
2. BAN the clichés unless radically elevated into something new: plain pencil holder, basic flower pot, generic organizer box, bottle-cap picture, plain lantern. If you use a familiar category, the twist must be obvious.
3. Aim for "I would pay for this" perceived value: a result that looks like a designed product, not a school craft.
4. Spread the ${count} concepts across DIFFERENT archetypes (examples: lighting, furniture, smart-garden / hydroponics, kinetic or science toy, sound / acoustic object, storage system, wearable / accessory, climate / water / energy helper, game / educational kit, wall art with function). No two concepts may share an archetype.
5. Must be buildable at home with common tools in under 1 day. Respect the audience safety limits.
6. Think about the CLEVER MECHANISM: a physical principle, a joint, a trick of the material that makes the idea feel inventive (e.g. capillary wicking, Helmholtz resonance, living hinges in PET, solar chimney, counterweights).
7. INNOVATION TEST: before keeping a concept ask "have I seen this exact thing on a craft blog?". If yes, replace it with something that combines two of the user's materials in a way that creates a NEW function.
8. Be honest in your scores. Do not give every concept 9s.

AUDIENCE: ${levelText(level)}
CATEGORY PREFERENCE: ${typeText(type)}
${avoid.length ? `DO NOT repeat these earlier ideas: ${avoid.join(' | ')}` : ''}

OUTPUT: valid JSON only, no markdown. Names/pitches in elegant Modern Standard Arabic.
{
  "concepts": [
    {
      "name": "اسم قصير جذاب",
      "archetype": "one English word from the examples above",
      "pitch": "جملتان تشرحان الفكرة ولماذا هي مدهشة",
      "mechanism": "الحيلة الفيزيائية/الهندسية التي تجعلها ذكية",
      "usesMaterials": ["..."],
      "whyNotCliche": "ما الذي يميزها عن الفكرة المعتادة",
      "scores": { "wow": 1-10, "novelty": 1-10, "usefulness": 1-10, "feasibility": 1-10 }
    }
  ]
}`;

  const user = `المواد المتوفرة لدى المستخدم:\n${materials}\n\nابتكر الآن ${count} أفكاراً مختلفة جذرياً.`;
  return [{ role: 'system', content: system }, { role: 'user', content: user }];
}

export function buildDevelopMessages({ materials, concept, level, type }) {
  const system = `${DESIGNER_PERSONA}

TASK: Turn the chosen concept into a COMPLETE, premium build manual that a motivated beginner can follow without guessing.

QUALITY BAR
- Write like an editor at a top design magazine crossed with a precise engineer: vivid but exact. No filler, no generic sentences like "make sure it is firm".
- Every step has concrete numbers: dimensions in cm/mm, counts, angles, drying/curing times, grit sizes, screw sizes, temperatures where relevant.
- Each step is split into short numbered micro-actions (3-6 actions) so it can be followed with dirty hands.
- Give a checkpoint per step: how the builder KNOWS the step is correct (what it should look/feel/measure like).
- Include a real troubleshooting section with failures that actually happen with these materials.
- Safety must match the audience. Name the real hazards (glass edges, solvent fumes, hot glue burns, sharp metal burrs, ...).
- 6 to 9 steps, in a logical order: preparation → measuring/cutting → forming → assembly → finishing → test.
- Use ONLY the user's materials as the main body; extra supplies (glue, screws, paint, LED strip...) go in the list flagged "supply": true and must be cheap and common.
- Numbers must be internally consistent (the parts you cut must add up to the finished dimensions you state).

IMAGE PROMPTS (for an image model, written in ENGLISH)
- "visualBible": ONE dense paragraph (60-100 words) that describes the finished object precisely and permanently — overall shape and proportions, each material and where it is used, exact colour names, finish (matte/gloss/raw), approximate size in cm, and 2-3 distinguishing details. It is prepended to every image so the object looks identical in all pictures, so be concrete, never vague.
- Each step "imagePrompt": it MUST illustrate exactly what that step's "actions" tell the builder to do, so someone reading the step and looking at the picture sees the same thing. Name the real materials of this project (not generic words like "material"), the real tool, and one visible measurement or mark from the step. Describe ONLY what the camera sees at that stage: the exact state of the partially built object (which parts exist, which are still loose), the one specific tool or material in use, the hands doing the action (no faces), and what the viewer should notice. 40-70 words, concrete and visual. The LAST step shows the completed object being tested. Never request text, labels, logos or watermarks inside the image.
- "heroImagePrompt" (finished, beautiful, styled shot), "assemblyImagePrompt" (flat-lay / exploded layout of all parts and tools before assembly), "lifestyleImagePrompt" (the object in use in a real home setting).

AUDIENCE: ${levelText(level)}
CATEGORY: ${typeText(type)}

OUTPUT: valid JSON only, no markdown. All human-facing text in elegant, clear Modern Standard Arabic (numbers may use Western digits). Image prompts in English.
{
  "name": "اسم المشروع (حتى 8 كلمات)",
  "tagline": "عبارة تسويقية قصيرة",
  "story": "3-4 جمل: المشكلة التي يحلها + وصف حسي للنتيجة النهائية",
  "idea": "فقرة أنيقة تشرح التصميم وكيف تتكامل الخامات",
  "principle": "المبدأ العلمي/الهندسي الذي يجعل التصميم يعمل، بشرح مبسط",
  "materialsList": [ { "item": "...", "quantity": "...", "preparation": "كيف تُجهَّز", "role": "دورها في التصميم", "supply": false } ],
  "toolsList": [ { "name": "...", "purpose": "...", "alternative": "بديل متاح" } ],
  "dimensions": "الأبعاد النهائية مع أي أبعاد حرجة",
  "steps": [
    {
      "title": "عنوان يبدأ بفعل",
      "phase": "تحضير | قص | تشكيل | تجميع | تشطيب | اختبار",
      "goal": "الهدف من المرحلة في جملة",
      "actions": ["1) ...", "2) ..."],
      "measurements": "الأبعاد والأرقام الحرجة لهذه المرحلة",
      "tip": "نصيحة محترف محددة",
      "warning": "تحذير أمان محدد أو سلسلة فارغة",
      "checkpoint": "كيف تتأكد أن المرحلة صحيحة",
      "minutes": 20,
      "imagePrompt": "English visual description of this stage"
    }
  ],
  "troubleshooting": [ { "problem": "...", "fix": "..." } ],
  "upgrades": ["تطوير 1", "تطوير 2", "تطوير 3"],
  "safety": { "ppe": "معدات الوقاية", "hazards": ["..."], "childNote": "ملاحظة للأطفال" },
  "time": "المدة الكلية",
  "difficulty": "سهل | متوسط | متقدم",
  "cost": { "diyUsd": 0, "marketEquivalentUsd": 0 },
  "results": "ماذا ستحصل عليه وكيف سيبدو ويعمل",
  "engineering": {
    "feasibilityScore": 0,
    "durability": "العمر التشغيلي المتوقع",
    "adhesive": "أفضل وسيلة ربط لهذه الخامات",
    "cutting": "أفضل تقنية قص",
    "safetyGear": "معدات الأمان المطلوبة"
  },
  "sustainability": { "co2SavedKg": 0, "wasteDivertedKg": 0, "explanation": "كيف حُسب الأثر" },
  "visualBible": "English paragraph",
  "heroImagePrompt": "English",
  "assemblyImagePrompt": "English",
  "lifestyleImagePrompt": "English"
}`;

  const user = `المواد المتوفرة:\n${materials}\n\nالفكرة المختارة:\n${JSON.stringify(concept, null, 2)}\n\nاكتب الدليل الكامل الآن.`;
  return [{ role: 'system', content: system }, { role: 'user', content: user }];
}

/* ------------------------------------------------------------------ */
/* Ranking + normalisation + validation                                 */
/* ------------------------------------------------------------------ */

const num = (v, d = 5) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(10, Math.max(1, n)) : d;
};

export function scoreConcept(c) {
  const s = c?.scores || {};
  return num(s.wow) * 0.35 + num(s.novelty) * 0.25 + num(s.usefulness) * 0.2 + num(s.feasibility) * 0.2;
}

/** Highest-scoring concepts with different archetypes. */
export function pickTopConcepts(concepts = [], n = 3) {
  const valid = concepts.filter(c => c && c.name && c.pitch);
  const ranked = [...valid].sort((a, b) => scoreConcept(b) - scoreConcept(a));
  const picked = [];
  const usedArchetypes = new Set();
  for (const c of ranked) {
    const a = String(c.archetype || '').toLowerCase().trim();
    if (a && usedArchetypes.has(a)) continue;
    picked.push({ ...c, rankScore: Number(scoreConcept(c).toFixed(2)) });
    usedArchetypes.add(a);
    if (picked.length === n) return picked;
  }
  for (const c of ranked) {
    if (picked.length === n) break;
    if (!picked.some(p => p.name === c.name)) picked.push({ ...c, rankScore: Number(scoreConcept(c).toFixed(2)) });
  }
  return picked;
}

const str = (v, d = '') => (typeof v === 'string' ? v.trim() : (v == null ? d : String(v)));
const arr = v => (Array.isArray(v) ? v : (v ? [v] : []));

/** Returns { project, problems }. problems.length > 0 means "needs repair". */
export function normalizeDeveloped(raw) {
  const problems = [];
  const r = raw || {};

  const steps = arr(r.steps).map((s, i) => {
    const actions = arr(s?.actions).map(a => str(a)).filter(Boolean);
    return {
      title: str(s?.title, `المرحلة ${i + 1}`),
      phase: str(s?.phase),
      goal: str(s?.goal),
      actions,
      measurements: str(s?.measurements),
      tip: str(s?.tip),
      warning: str(s?.warning),
      checkpoint: str(s?.checkpoint),
      minutes: Math.max(1, Math.round(Number(s?.minutes) || 15)),
      imagePrompt: str(s?.imagePrompt)
    };
  });

  if (!str(r.name)) problems.push('name is missing');
  if (steps.length < 5) problems.push(`only ${steps.length} steps; need 6 to 9`);
  steps.forEach((s, i) => {
    if (s.actions.length < 2) problems.push(`step ${i + 1} has fewer than 2 actions`);
    if (!s.imagePrompt) problems.push(`step ${i + 1} is missing imagePrompt`);
  });
  if (arr(r.materialsList).length < 2) problems.push('materialsList needs at least 2 items');
  if (!str(r.visualBible)) problems.push('visualBible is missing');
  if (!str(r.heroImagePrompt)) problems.push('heroImagePrompt is missing');

  const eng = r.engineering || {};
  const sus = r.sustainability || {};
  const safety = r.safety || {};
  const cost = r.cost || {};

  const project = {
    name: str(r.name),
    tagline: str(r.tagline),
    story: str(r.story),
    idea: str(r.idea),
    principle: str(r.principle),
    materialsList: arr(r.materialsList).map(m => ({
      item: str(m?.item), quantity: str(m?.quantity), preparation: str(m?.preparation),
      role: str(m?.role), supply: Boolean(m?.supply)
    })).filter(m => m.item),
    toolsList: arr(r.toolsList).map(t => ({
      name: str(t?.name), purpose: str(t?.purpose), alternative: str(t?.alternative)
    })).filter(t => t.name),
    dimensions: str(r.dimensions),
    steps,
    troubleshooting: arr(r.troubleshooting).map(t => ({ problem: str(t?.problem), fix: str(t?.fix) })).filter(t => t.problem),
    upgrades: arr(r.upgrades).map(u => str(u)).filter(Boolean),
    safety: {
      ppe: str(safety.ppe), hazards: arr(safety.hazards).map(h => str(h)).filter(Boolean), childNote: str(safety.childNote)
    },
    time: str(r.time),
    difficulty: str(r.difficulty, 'متوسط'),
    cost: { diyUsd: Number(cost.diyUsd) || 0, marketEquivalentUsd: Number(cost.marketEquivalentUsd) || 0 },
    results: str(r.results),
    engineering: {
      feasibilityScore: Math.min(100, Math.max(0, Math.round(Number(eng.feasibilityScore) || 85))),
      durability: str(eng.durability), adhesive: str(eng.adhesive),
      cutting: str(eng.cutting), safetyGear: str(eng.safetyGear)
    },
    sustainability: {
      co2SavedKg: Number(sus.co2SavedKg) || 0,
      wasteDivertedKg: Number(sus.wasteDivertedKg) || 0,
      explanation: str(sus.explanation)
    },
    visualBible: str(r.visualBible),
    heroImagePrompt: str(r.heroImagePrompt),
    assemblyImagePrompt: str(r.assemblyImagePrompt),
    lifestyleImagePrompt: str(r.lifestyleImagePrompt)
  };

  return { project, problems };
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

const clip = (s, n) => String(s || '').slice(0, n);

const normAr = t => String(t || '').toLowerCase()
  .replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

/** Stem-ish tokens of the user's materials ("زجاجات بلاستيكية" -> زجاج, بلاستيك). */
function materialTokens(materials) {
  return [...new Set(
    normAr(materials).split(/[^\p{L}\p{N}]+/u)
      .map(w => w.replace(/^(ال|و)/, '').replace(/(ات|ون|ين|ان|ه|ي|ية)$/, ''))
      .filter(w => w.length >= 3)
  )];
}

/**
 * Drop concepts that do not use any of the entered materials (the model sometimes drifts).
 * Only filters when enough concepts remain, so a vague input never leaves the user with nothing.
 */
export function keepConceptsUsingMaterials(concepts, materials, need = 3) {
  const tokens = materialTokens(materials);
  if (!tokens.length) return concepts;
  const uses = c => {
    const text = normAr(`${(c.usesMaterials || []).join(' ')} ${c.pitch || ''} ${c.name || ''}`);
    return tokens.filter(t => text.includes(t)).length;
  };
  const withUse = concepts.filter(c => (c.usesMaterials || []).length && uses(c) > 0);
  return withUse.length >= need ? withUse : concepts;
}

export async function ideate({ apiKey, config, materials, level, type, count = 8, avoid = [], take = 3, meter = null }) {
  const mats = clip(materials, 1500);
  if (!mats.trim()) throw new Error('المواد مطلوبة');
  const { text, model } = await chat({
    apiKey, config, meter, models: config.ideationModels,
    messages: buildIdeationMessages({ materials: mats, level, type, count, avoid: avoid.slice(0, 12) }),
    json: true, temperature: 1.0, maxTokens: 6000, timeoutMs: 80000
  });
  const data = extractJson(text);
  const concepts = keepConceptsUsingMaterials(arr(data.concepts), mats, Math.max(1, Math.min(3, Number(take) || 3)));
  const top = pickTopConcepts(concepts, Math.max(1, Math.min(3, Number(take) || 3)));
  if (top.length === 0) throw new Error('لم يُنتج العصف الذهني أفكاراً صالحة');
  return { top, all: concepts, model };
}

export async function develop({ apiKey, config, materials, concept, level, type, meter = null }) {
  const mats = clip(materials, 1500);
  const messages = buildDevelopMessages({ materials: mats, concept, level, type });

  const first = await chat({
    apiKey, config, meter, models: config.developModels, messages, role: 'develop',
    json: true, temperature: 0.7, maxTokens: 14000, timeoutMs: 120000
  });

  let parsed;
  let outcome;
  try {
    parsed = extractJson(first.text);
    outcome = normalizeDeveloped(parsed);
  } catch (e) {
    outcome = { project: null, problems: [`the output was not valid JSON (${e.message})`] };
  }

  if (outcome.problems.length === 0) return { project: outcome.project, model: first.model, repaired: false };

  // One repair round: show the model exactly what failed.
  const repair = await chat({
    apiKey, config, meter, models: [first.model, ...config.developModels.filter(m => m !== first.model)],
    messages: [
      ...messages,
      { role: 'assistant', content: first.text.slice(0, 20000) },
      { role: 'user', content: `Your JSON failed validation:\n- ${outcome.problems.join('\n- ')}\n\nReturn the COMPLETE corrected JSON object (same schema, nothing else).` }
    ],
    json: true, temperature: 0.5, maxTokens: 14000, timeoutMs: 120000
  });
  const fixed = normalizeDeveloped(extractJson(repair.text));
  // Accept the repaired result if it is usable even if not perfect.
  if (fixed.project.steps.length >= 4 && fixed.project.name) {
    return { project: fixed.project, model: repair.model, repaired: true, remaining: fixed.problems };
  }
  throw new Error(`تعذر إنتاج مشروع مكتمل: ${fixed.problems.slice(0, 3).join('؛ ')}`);
}

const IMAGE_STYLE = {
  hero: 'High-end editorial product photograph, full-frame camera, 85mm lens, soft diffused window light from the left with gentle fill, subtle natural contact shadow, clean neutral styled surface (pale oak, light concrete or linen), 3/4 front angle, the object fills about 60% of the frame, crisp focus on material texture and edges, natural true-to-life colours, magazine quality.',
  assembly: 'Top-down knolling flat-lay on a light workbench, every part and tool placed with even spacing and right angles, soft shadowless daylight, realistic relative scale, sharp focus across the whole frame, high detail.',
  lifestyle: 'Warm lifestyle photograph in a real, tastefully styled home interior, natural daylight, shallow depth of field, the object in everyday use as the clear subject, no visible faces.',
  step: 'Clear instructional how-to photograph, 3/4 overhead angle, tidy light-wood workbench, bright even daylight, sharp focus on the hands-on action with only hands visible (no faces); the work-in-progress object and the single tool in use are the heroes of the frame; clean uncluttered background.'
};

const IMAGE_ASPECT = { hero: '4:3', assembly: '4:3', lifestyle: '4:3', step: '3:2', guide: '1:1' };

/** Grid for a stage sheet: columns x rows (read right-to-left, step 1 top-right). */
export function guideGrid(n) {
  if (n <= 2) return { cols: 2, rows: 1 };
  if (n <= 4) return { cols: 2, rows: 2 };
  if (n <= 6) return { cols: 3, rows: 2 };
  if (n <= 8) return { cols: 4, rows: 2 };
  return { cols: 3, rows: 3 };
}

/** ONE large sheet with every stage in its own panel. Only a numeral badge: no words (image models garble text). */
export function composeGuidePrompt({ projectName = '', material = '', visualBible = '', steps = [] }) {
  const list = steps.slice(0, 9);
  const { cols, rows } = guideGrid(list.length);
  const panels = list.map(st => `Panel ${st.n}: ${clip(st.text, 90)}${st.detail ? ` — ${clip(st.detail, 150)}` : ''}`).join('\n');
  return clip(`A clean, easy-to-understand visual build guide for ONE specific handmade upcycled product, as a single large image divided into ${list.length} equal panels in a grid of ${cols} columns by ${rows} rows, with generous white gutters between panels. Panels read right-to-left: panel 1 is top-right, then continue leftwards, then the next row.
THE PRODUCT (identical in every panel): ${clip(visualBible || projectName, 600)}
Project name: ${clip(projectName, 90)}. Built from: ${clip(material, 200)} — the real recycled materials must be clearly recognizable in every panel (not generic or substituted).
What each panel shows (use it only to decide the picture; the Arabic is context, do NOT write it):
${panels}
Rules for every panel: one single clear subject, large and centered; a close-up of hands doing exactly that stage with the correct tool and the actual materials; simple uncluttered neutral background; consistent lighting, colours and style across panels; realistic semi-photographic instructional illustration; the work-in-progress state must visibly progress from panel to panel until the finished product appears in the last panel.
TEXT: the ONLY text allowed is a small clean numeral badge in the top-right corner of each panel showing its stage number (1, 2, 3 …). Absolutely no other words, letters, captions, titles, labels or logos anywhere. Normal quality.`, 2600);
}

/** Final-product photo for the paid image model: the product and its real materials come first. */
export function composeHeroPrompt({ projectName = '', visualBible = '', prompt = '', materials = '' }) {
  return clip(`Professional product photograph of ONE specific handmade upcycled product.
Product name: ${clip(projectName, 90)}.
What it is: ${clip(visualBible || prompt, 700)}
It is visibly built from these recycled materials: ${clip(materials, 220)}. The recycled material must be clearly recognizable in the product itself (for example aluminium drink cans must look like aluminium cans), never replaced by plain ceramic, wood or generic shapes.
Extra detail: ${clip(prompt, 400)}
Style: ${IMAGE_STYLE.hero}
No text, letters, numbers, logos or watermarks.`, 2200);
}

const IMAGE_AVOID = 'Avoid: any text, letters, numbers, logos, watermarks, borders, collage or split-screen, cartoon or CGI look, plastic sheen, distorted hands or extra fingers, floating objects, impossible geometry.';

export function composeImagePrompt({ kind = 'step', visualBible = '', prompt = '', stageLabel = '', isFinal = false, hasReference = false, stage = null, projectName = '' }) {
  if (kind === 'guide') return prompt; // already the full, server-built instruction
  const style = IMAGE_STYLE[kind] || IMAGE_STYLE.step;
  const lines = [
    style,
    `The project object (keep it IDENTICAL in every image): ${visualBible}`
  ];
  if (hasReference) {
    lines.push(
      isFinal || kind !== 'step'
        ? 'A reference photo of this exact project is attached: match its materials, colours, proportions and finish exactly.'
        : 'A reference photo of the FINISHED project is attached. Use it ONLY to keep the same materials, colours, proportions and finish. Do NOT show the finished object: draw the partially built state described below.'
    );
  }
  if (projectName) lines.push(`Project: ${projectName}.`);
  if (stageLabel) lines.push(`Build stage: ${stageLabel}.`);
  if (stage && kind === 'step') {
    // the written instructions are the source of truth: the picture must match them, not just the short visual prompt
    const detail = [
      stage.title && `Stage title (Arabic): ${stage.title}`,
      stage.goal && `Goal: ${stage.goal}`,
      stage.actions?.length && `What the builder does in this stage:\n${stage.actions.map(a => `- ${a}`).join('\n')}`,
      stage.measurements && `Key measurements: ${stage.measurements}`,
      stage.checkpoint && `The finished state of this stage looks like: ${stage.checkpoint}`
    ].filter(Boolean).join('\n');
    if (detail) lines.push(`STAGE INSTRUCTIONS THE PICTURE MUST MATCH EXACTLY (show the work being done in these actions, the parts and tool named in them, and nothing from later stages):\n${detail}`);
  }
  lines.push(`Show exactly this: ${prompt}`);
  lines.push('Photorealistic. ' + IMAGE_AVOID);
  return clip(lines.join('\n'), 3500);
}

function pickImageUrl(message) {
  const imgs = message?.images;
  if (Array.isArray(imgs) && imgs.length) {
    const u = imgs[0]?.image_url?.url || imgs[0]?.url;
    if (u) return u;
  }
  if (Array.isArray(message?.content)) {
    for (const part of message.content) {
      const u = part?.image_url?.url;
      if (u) return u;
    }
  }
  return null;
}

const validReference = u => typeof u === 'string' && /^data:image\/(png|jpe?g|webp);base64,/.test(u) && u.length < 1_500_000;

export async function generateImage(args) {
  const { apiKey, config, kind = 'step', visualBible, prompt, aspect, referenceImage, stageLabel, isFinal, stage = null, projectName = '', meter = null } = args;
  const gem = config.gemini;
  const cf = config.cloudflare;
  if (!apiKey && !hasGemini(gem) && !hasCloudflare(cf)) throw new GatewayError('لم يُضبط أي مفتاح ذكاء اصطناعي على الخادم (OPENROUTER_API_KEY أو GEMINI_API_KEY)', { status: 503, code: 'NO_KEY' });
  const viaGemini = async () => {
    const useRef = validReference(referenceImage);
    const text = composeImagePrompt({ kind, visualBible, prompt, stageLabel, isFinal, hasReference: useRef, stage, projectName });
    const r = await geminiImage({ cfg: gem, text, referenceImage: useRef ? referenceImage : null, aspect: aspect || IMAGE_ASPECT[kind] || '4:3' });
    addUsage(meter, { usage: { total_tokens: 0, cost: 0 } });
    return { imageUrl: r.imageUrl, model: r.model, usedReference: useRef, size: null };
  };
  const viaFree = async () => {
    const text = composeImagePrompt({ kind, visualBible, prompt, stageLabel, isFinal, hasReference: false, stage, projectName });
    const r = await freeImage({ text, aspect: aspect || IMAGE_ASPECT[kind] || '4:3' });
    addUsage(meter, { usage: { total_tokens: 0, cost: 0 } });
    return { imageUrl: r.imageUrl, model: r.model, usedReference: false, size: null };
  };
  const errs = [];
  // the paid GPT Image model (Cloudflare Workers AI) draws the stage sheet and the final-product picture
  if ((kind === 'guide' || kind === 'hero') && hasCloudflare(cf)) {
    try {
      const text = kind === 'guide' ? prompt : composeHeroPrompt({ projectName, visualBible, prompt, materials: args.materials });
      const size = kind === 'guide' && (args.guideCount || 0) > 4 ? '1536x1024' : cf.size;
      const r = await cloudflareImage({ cfg: { ...cf, size }, prompt: text });
      addUsage(meter, { usage: { total_tokens: 0, cost: 0 } });
      return { imageUrl: r.imageUrl, model: r.model, usedReference: false, size: '1K' };
    } catch (e) { errs.push(e); }
  }
  if (apiKey) {
    try { return await generateImageOpenRouter(args); } catch (e) { errs.push(e); if (e?.code === 'NO_KEY') errs.pop(); }
  }
  if (hasGemini(gem)) {
    try { return await viaGemini(); } catch (e) { errs.push(e); }
  }
  if (gem.freeImages === true) {
    try { return await viaFree(); } catch (e) { errs.unshift(new Error(`free: ${e.message}`)); }
  }
  const first = errs.find(e => e?.status) || errs[0];
  const code = errs.some(e => e?.code === 'BAD_KEY') ? 'BAD_KEY' : (first?.code || 'AI_FAILED');
  throw new GatewayError(`تعذر توليد الصورة: ${errs.map(e => e.message).join(' | ').slice(0, 600)}`, { status: first?.status && first.status >= 400 ? first.status : 503, code });
}

async function generateImageOpenRouter({ apiKey, config, kind = 'step', visualBible, prompt, aspect, referenceImage, stageLabel, isFinal, hd = true, stage = null, projectName = '', meter = null }) {
  const useRef = validReference(referenceImage);
  const ratio = aspect || IMAGE_ASPECT[kind] || '4:3';
  // main pictures in high resolution; per-step pictures stay at 1K to keep costs sane
  const size = hd && kind !== 'step' && kind !== 'guide' ? config.imageSize : '1K';
  let lastErr = null;

  for (const model of (kind === 'guide' ? config.guideImageModels : config.imageModels)) {
    // most capable request first, then progressively simpler ones
    const variants = [];
    if (useRef) variants.push({ ref: true, cfg: 'size' }, { ref: true, cfg: 'aspect' });
    variants.push({ ref: false, cfg: 'size' }, { ref: false, cfg: 'aspect' }, { ref: false, cfg: 'none' });

    for (const v of variants) {
      const text = composeImagePrompt({ kind, visualBible, prompt, stageLabel, isFinal, hasReference: v.ref, stage, projectName });
      const imageConfig = v.cfg === 'size'
        ? { aspect_ratio: ratio, image_size: size }
        : v.cfg === 'aspect' ? { aspect_ratio: ratio } : null;
      const body = {
        model,
        messages: [{
          role: 'user',
          content: v.ref
            ? [{ type: 'text', text }, { type: 'image_url', image_url: { url: referenceImage } }]
            : text
        }],
        modalities: ['image', 'text'],
        usage: { include: true },
        ...(imageConfig ? { image_config: imageConfig } : {})
      };
      let r;
      try {
        r = await postOpenRouter({ apiKey, config, body, timeoutMs: 120000 });
      } catch (e) {
        lastErr = new Error(`${model}: ${e.name === 'AbortError' ? 'انتهت المهلة' : e.message}`);
        break;
      }
      if (r.ok) {
        addUsage(meter, r.data);
        const url = pickImageUrl(r.data?.choices?.[0]?.message);
        if (url) return { imageUrl: url, model, usedReference: v.ref, size: v.cfg === 'size' ? size : null };
        lastErr = new Error(`${model}: لم يُرجع صورة`);
        break;
      }
      lastErr = new Error(`${model}: ${errorMessage(r)}`);
      if (r.status === 402) throw new GatewayError('رصيد الذكاء الاصطناعي انتهى', { status: 503, code: 'NO_CREDIT' });
      if (r.status === 401) throw new GatewayError('مفتاح الذكاء الاصطناعي على الخادم غير صالح', { status: 503, code: 'BAD_KEY' });
      if (r.status === 400 || r.status === 422) continue; // try the simpler variant
      break;
    }
  }
  throw lastErr || new Error('تعذر توليد الصورة');
}

/** What the advisor knows about the platform itself (kept factual: no invented numbers). */
export const PLATFORM_KNOWLEDGE = `=== عن منصة مُدام (MUDAM) ===
مُدام منصة عربية لإعادة التدوير الإبداعي (Upcycling): تحوّل المخلفات المنزلية إلى منتجات مفيدة، وتحسب الأثر البيئي، وتمنح نقاطاً وشهادات.
الأقسام في القائمة الجانبية:
- عن مُدام (الجولة التعريفية): جولة مصورة تشرح المنصة.
- مولد المشاريع: يكتب المستخدم موادّه (أو يختارها)، ويحدد المستوى (طفل/مراهق/بالغ/كافة المستويات) ونوع المشروع (عملي، علمي، فني، جماعي/مدرسي، كافة الأنواع)، ويضغط «ابتكار مشاريع بالذكاء الاصطناعي». يعصف الذكاء الاصطناعي 8 أفكار ويختار أقواها (حتى 3 مشاريع، وقد تقل عند الازدحام أو محدودية الموارد)، ثم يكتب لكل مشروع دليل تنفيذ بخطوات وقياسات وأدوات وسلامة وتكلفة ووفر كربوني.
- صفحة المشروع («دخول استوديو التنفيذ الكامل»): خطوات مرقمة، وكل خطوة فيها شرح وقياسات ونصيحة وتنبيه أمان ومؤقت ولائحة إنجاز. لا توجد صور افتراضية: تُنشأ الصورة فقط عند الضغط على «إنشاء صورة» (للمنتج النهائي، والتجميع، والاستخدام، ولكل مرحلة)، وتُبنى من وصف المشروع ونص المرحلة.
- بوابة الطلاب والمدارس: محتوى ومشاريع للطلاب والمعلمين وأدوات تقييم.
- حاسبة الأثر (LCA): تقدّر الوفر الكربوني ووزن النفايات المحوّلة وفق منهجية ISO 14040/14044.
- التنبؤ البيئي الذكي: يحلل استهلاك الكهرباء والمياه والنقل والنفايات ويقارن بمتوسطات الأردن.
- دليل الـ 150 مصدراً: دليل مراجع ومعاملات LCA.
- المحفوظة: المشاريع التي حفظها المستخدم (النجمة).
- اسأل الخبير: هذه المحادثة.
- شهادة الإنجاز: شهادة بيئية بوفر كربوني ورمز QR يمكن التحقق منه.
- النقاط البيئية والمشاريع المنجزة والوفر الكربوني تظهر في الشريط الجانبي. المنصة تعمل كتطبيق ويب (PWA) ويمكن استخدام بعض الأجزاء دون إنترنت.
- حسابات المستخدمين تتيح حفظ المشاريع والشهادات. هناك حدود يومية لعدد التوليدات والصور والاستشارات للجميع.
قواعد: عند سؤال المستخدم عن المنصة أو أين يجد شيئاً، أجب من المعلومات أعلاه فقط؛ إن لم تكن متأكداً فقل ذلك ولا تخترع ميزات أو أرقاماً.`;

const listLines = (v, n, max) => (Array.isArray(v) ? v : []).slice(0, n).map(x => clip(typeof x === 'string' ? x : (x?.name || x?.title || JSON.stringify(x)), max));

/** Compact, trustworthy text version of everything we know about the project. */
export function projectDossier(project, focusStep = null) {
  if (!project) return '';
  const L = [];
  L.push(`اسم المشروع: ${clip(project.name, 120)}`);
  if (project.materials) L.push(`المواد المُدخلة: ${clip(project.materials, 400)}`);
  if (project.idea) L.push(`الفكرة: ${clip(project.idea, 800)}`);
  if (project.difficulty) L.push(`الصعوبة: ${clip(project.difficulty, 40)} | الوقت: ${clip(project.time, 60)} | التكلفة: ${clip(project.cost, 60)}`);
  const mats = listLines(project.materialsList, 20, 120);
  if (mats.length) L.push(`قائمة المواد:\n- ${mats.join('\n- ')}`);
  const tools = listLines(project.tools, 20, 80);
  if (tools.length) L.push(`الأدوات: ${tools.join('، ')}`);
  const safety = listLines(project.safety, 10, 200);
  if (safety.length) L.push(`السلامة:\n- ${safety.join('\n- ')}`);
  const steps = (Array.isArray(project.steps) ? project.steps : []).slice(0, 14);
  if (steps.length) {
    L.push('المراحل:\n' + steps.map((st, i) => {
      const acts = listLines(st.actions, 8, 220).join(' ؛ ');
      return `${i + 1}. ${clip(st.title, 100)}${st.goal ? ` [الهدف: ${clip(st.goal, 220)}]` : ''}${acts ? ` — ${acts}` : ''}${st.measurements ? ` {القياسات: ${clip(st.measurements, 220)}}` : ''}${st.tip ? ` (نصيحة: ${clip(st.tip, 160)})` : ''}`;
    }).join('\n'));
  }
  if (focusStep && (focusStep.title || focusStep.index != null)) {
    L.push(`\nالمستخدم يتصفح الآن المرحلة${focusStep.index != null ? ` رقم ${Number(focusStep.index) + 1}` : ''}: ${clip(focusStep.title, 100)}. أسئلته غالباً عنها ما لم يقل غير ذلك.`);
  }
  return L.join('\n').slice(0, 9000);
}

export async function chatReply({ apiKey, config, question, history = [], project = null, focusStep = null, meter = null }) {
  let system = `أنت "مستشار مُدام" الذكي: خبير إعادة التدوير الإبداعي والهندسة الدائرية والسلامة، وتعرف المنصة كلها (انظر «عن منصة مُدام» أدناه)${project ? '، وأنت أيضاً المسؤول عن المشروع المفتوح حالياً وتعرف تفاصيله' : ''}.
- لا تكرر جواباً عاماً: اقرأ سؤال المستخدم وسجل المحادثة جيداً وأجب عن السؤال نفسه بتحديد، ولا تعيد ما قلته سابقاً. إن كان السؤال غامضاً فاسأل سؤالاً توضيحياً واحداً قصيراً.
- أجب بالعربية الفصحى المبسطة بأسلوب ودود ومهني وموجز، وافهم سؤال المستخدم ولو كان غير دقيق.
- اربط كل إجابة بمواد هذا المشروع ومراحله الفعلية، وقدّم أرقاماً وقياسات عملية وبدائل بسيطة إن لم تتوفر مادة أو أداة.
- إن كان السؤال عن مرحلة فاشرحها خطوة بخطوة بلغة مبسطة مع سبب كل خطوة وخطأ شائع يجب تجنبه.
- حذّر من أي خطر حقيقي (قطع، كيماويات، كهرباء، حمل ثقيل). لا تخترع تفاصيل غير موجودة في المشروع؛ وإن لم تكن متأكداً فقل ذلك.`;
  system += `\n\n${PLATFORM_KNOWLEDGE}`;
  const dossier = projectDossier(project, focusStep);
  if (dossier) system += `\n\n=== ملف المشروع ===\n${dossier}`;
  // the client already includes the question as the last history item: do not send it twice
  const past = history.slice(-12);
  if (past.length && past[past.length - 1]?.role !== 'assistant' && clip(past[past.length - 1]?.content, 2000) === clip(question, 2000)) past.pop();
  const messages = [
    { role: 'system', content: system },
    ...past.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: clip(m.content, 2000)
    })),
    { role: 'user', content: clip(question, 2000) }
  ];
  const { text, model } = await chat({
    apiKey, config, meter, models: config.chatModels, messages, role: 'chat',
    temperature: 0.7, maxTokens: 2000, timeoutMs: 60000
  });
  return { reply: text, model };
}


/* ---------------- Impact calculator analyst ---------------- */

const nonNeg = (v, max = 1e6) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0; };

/** Re-computes the LCA numbers server-side so the model can only reason about verified figures. */
export function prepareImpact(rawItems = []) {
  const items = (Array.isArray(rawItems) ? rawItems : []).slice(0, 15).map(m => {
    const massKg = nonNeg(m.massKg, 10000);
    const virginFactor = nonNeg(m.virginFactor, 500);
    const landfillFactor = nonNeg(m.landfillFactor, 500);
    const processFactor = m.processFactor == null ? 0.005 : nonNeg(m.processFactor, 500);
    const virgin = massKg * virginFactor, landfill = massKg * landfillFactor, proc = massKg * processFactor;
    return {
      name: clip(m.name || m.nameEn, 80), category: clip(m.category, 40), authority: clip(m.authority, 60),
      massKg: +massKg.toFixed(4), virginFactor, landfillFactor, processFactor,
      virginAvoidedKg: +virgin.toFixed(4), landfillAvoidedKg: +landfill.toFixed(4), processKg: +proc.toFixed(4),
      netKg: +Math.max(0, virgin + landfill - proc).toFixed(4)
    };
  }).filter(i => i.name && i.massKg > 0);
  const sum = k => +items.reduce((a, i) => a + i[k], 0).toFixed(4);
  const total = { massKg: sum('massKg'), virginAvoidedKg: sum('virginAvoidedKg'), landfillAvoidedKg: sum('landfillAvoidedKg'), processKg: sum('processKg'), netKg: sum('netKg') };
  items.forEach(i => { i.sharePct = total.netKg ? +(100 * i.netKg / total.netKg).toFixed(1) : 0; });
  return { items, total };
}

export async function impactAnalysis({ apiKey, config, items, question = '', projectName = '', meter = null }) {
  const data = prepareImpact(items);
  if (!data.items.length) throw new GatewayError('أضف مادة واحدة على الأقل لتحليل أثرها', { status: 400, code: 'BAD_REQUEST' });
  const system = `أنت محلل أثر بيئي (تقييم دورة الحياة LCA) داخل منصة "مُدام" لإعادة التدوير الإبداعي. تشرح لشخص غير متخصص بالعربية المبسطة وبدقة علمية.
قواعد صارمة:
- استخدم فقط الأرقام الواردة في الجدول المحسوب أدناه؛ لا تخترع أرقاماً ولا مصادر. الأرقام بوحدة kg CO2e.
- المعادلة: الصافي = (انبعاثات المادة البكر المتفادية + انبعاثات المكب المتفادية) − انبعاثات المعالجة المنزلية.
- لا تبالغ: وضّح أن العوامل متوسطات عالمية وأن الأثر الفعلي يتغير حسب المنتج والمنطقة وطريقة التدوير البديلة (التدوير الصناعي أفضل من المكب أحياناً).
- التوصيات يجب أن تكون عملية وقابلة للتنفيذ في المنزل وترتبط بمواد المستخدم بالاسم، ومرتبة حسب أثرها المتوقع.
- لا تخلط بين kg وg، وقرّب الأرقام بذكاء (3 خانات كحد أقصى).
أعد JSON فقط بهذا الشكل:
{"headline":"جملة واحدة تلخص النتيجة بالأرقام","summary":"فقرة قصيرة (3-4 جمل)","drivers":[{"material":"..","sharePct":0,"why":"سبب كبر/صغر مساهمة هذه المادة"}],"improvements":[{"title":"..","how":"خطوات عملية","expectedEffect":"وصف كمي أو نوعي حذر"}],"caveats":["..",".."],"fact":"معلومة علمية قصيرة ومفيدة متعلقة بمواده","answer":"إجابة مباشرة عن سؤال المستخدم إن وُجد وإلا سلسلة فارغة"}`;
  const user = `${projectName ? `المشروع: ${clip(projectName, 120)}\n` : ''}الجدول المحسوب (موثوق):\n${JSON.stringify(data)}\n${question ? `\nسؤال المستخدم: ${clip(question, 600)}` : '\nلا يوجد سؤال محدد.'}`;
  const { text, model } = await chat({
    apiKey, config, meter, models: config.chatModels, role: 'chat', json: true,
    temperature: 0.4, maxTokens: 2500, timeoutMs: 60000,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
  });
  const j = extractJson(text) || {};
  const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
  return {
    model, totals: data.total, items: data.items,
    analysis: {
      headline: clip(j.headline, 300), summary: clip(j.summary, 1200),
      drivers: arr(j.drivers, 6).map(d => ({ material: clip(d?.material, 80), sharePct: Number(d?.sharePct) || 0, why: clip(d?.why, 400) })),
      improvements: arr(j.improvements, 5).map(d => ({ title: clip(d?.title, 120), how: clip(d?.how, 500), expectedEffect: clip(d?.expectedEffect, 300) })),
      caveats: arr(j.caveats, 4).map(x => clip(x, 300)), fact: clip(j.fact, 400), answer: clip(j.answer, 1500)
    }
  };
}

/** Single entry used by both hosts. */
export async function handleAction({ action, payload = {}, apiKey, env = {} }) {
  const config = resolveConfig(env);
  switch (action) {
    case 'ideate': {
      const r = await ideate({ apiKey, config, ...payload });
      return { success: true, concepts: r.top, allConcepts: r.all, model: r.model };
    }
    case 'develop': {
      if (!payload.concept) throw new Error('concept مطلوب');
      const r = await develop({ apiKey, config, ...payload });
      return { success: true, project: r.project, model: r.model, repaired: r.repaired };
    }
    case 'image': {
      if (!payload.prompt) throw new Error('prompt مطلوب');
      const r = await generateImage({ apiKey, config, ...payload });
      return { success: true, imageUrl: r.imageUrl, model: r.model };
    }
    case 'chat': {
      const r = await chatReply({ apiKey, config, ...payload });
      return { success: true, reply: r.reply, model: r.model };
    }
    case 'health':
      return { success: true, hasKey: Boolean(apiKey), models: {
        ideation: config.ideationModels, develop: config.developModels, image: config.imageModels
      } };
    default:
      throw new Error(`إجراء غير معروف: ${action}`);
  }
}
