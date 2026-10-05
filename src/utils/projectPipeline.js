/**
 * Two-stage AI project pipeline (via the OpenRouter gateway):
 *   1. IDEATE  — brainstorm 8 distinct concepts, self-scored; keep the best 3 with different archetypes.
 *   2. DEVELOP — write a full, numeric, photo-ready build manual for each of the 3 (in parallel).
 * Then map the result to the project shape the UI already understands.
 */

import { callAi } from './aiGateway.js';
import { getProjectGallery } from './imageCatalog.js';
import { orchestrateProjectSwarm } from './multiAgentSwarm.js';
import { requestImage, heroSpec } from './aiImageStore.js';

const joinNonEmpty = (parts, sep) => parts.filter(Boolean).join(sep);

function toAppProject({ dev, concept, index, userMaterials }) {
  const materialsText = dev.materialsList
    .map(m => (m.quantity ? `${m.item} (${m.quantity})` : m.item))
    .join('، ');
  const toolsText = dev.toolsList.map(t => t.name).join('، ');

  const fallbackGallery = (() => {
    const g = getProjectGallery(dev.name, materialsText || userMaterials, index);
    // http(s) URLs only: heavy SVG data URLs are re-rendered on demand and must not bloat localStorage
    return { finished: g.finished, assembly: g.assembly, inUse: g.inUse };
  })();

  const steps = dev.steps.map((s, i) => {
    const num = i + 1;
    const detail = joinNonEmpty([
      s.goal,
      s.actions.join('\n'),
      s.measurements ? `الأبعاد والأرقام: ${s.measurements}` : ''
    ], '\n');
    return {
      id: num,
      title: s.title,
      phase: s.phase,
      goal: s.goal,
      actions: s.actions,
      measurements: s.measurements,
      detail,
      tip: s.tip,
      warning: s.warning,
      checkpoint: s.checkpoint,
      minutes: s.minutes,
      imagePrompt: s.imagePrompt,
      // the page renders the Arabic infographic on demand; real pictures come from the image store
      image: '',
      infographicUrl: '',
      photoUrl: '',
      completed: false
    };
  });

  const savings = Math.max(0, dev.cost.marketEquivalentUsd - dev.cost.diyUsd);
  const safetyText = joinNonEmpty([
    dev.safety.ppe && `معدات الوقاية: ${dev.safety.ppe}`,
    dev.safety.hazards.length && `المخاطر: ${dev.safety.hazards.join('، ')}`,
    dev.safety.childNote && `للأطفال: ${dev.safety.childNote}`
  ], ' — ');

  const base = {
    id: `proj-ai-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    name: dev.name,
    title: dev.name,
    tagline: dev.tagline,
    story: dev.story,
    idea: dev.idea,
    principle: dev.principle,
    materials: materialsText,
    materialsList: dev.materialsList,
    tools: toolsText,
    toolsList: dev.toolsList,
    dimensions: dev.dimensions,
    time: dev.time,
    difficulty: dev.difficulty,
    safety: safetyText,
    safetyDetails: dev.safety,
    results: dev.results,
    development: dev.upgrades.join(' • '),
    upgrades: dev.upgrades,
    troubleshooting: dev.troubleshooting,
    sustainability: dev.sustainability.explanation
      ? `${dev.sustainability.explanation}${dev.sustainability.co2SavedKg ? ` (≈ ${dev.sustainability.co2SavedKg} كغ CO₂)` : ''}`
      : '',
    co2SavedKg: dev.sustainability.co2SavedKg || undefined,
    wasteDivertedKg: dev.sustainability.wasteDivertedKg,
    estimatedCost: dev.cost.diyUsd ? `${dev.cost.diyUsd}$` : undefined,
    aiConcept: {
      archetype: concept.archetype,
      mechanism: concept.mechanism,
      scores: concept.scores,
      rankScore: concept.rankScore
    },
    // image generation inputs (the pictures themselves live in IndexedDB)
    visualBible: dev.visualBible,
    imagePrompts: {
      hero: dev.heroImagePrompt,
      assembly: dev.assemblyImagePrompt || dev.heroImagePrompt,
      lifestyle: dev.lifestyleImagePrompt || dev.heroImagePrompt
    },
    fallbackGallery,
    gallery: { ...fallbackGallery },
    multiAngleViews: { ...fallbackGallery },
    generatedImage: fallbackGallery.finished,
    image: fallbackGallery.finished,
    activeGalleryView: 'finished',
    metrics: {
      feasibilityScore: dev.engineering.feasibilityScore,
      durabilityYears: dev.engineering.durability || '—',
      estimatedSavings: savings ? `${savings} دولار تقريباً` : '—',
      bondingGuide: {
        adhesive: dev.engineering.adhesive,
        cuttingTechnique: dev.engineering.cutting,
        safetyGear: dev.engineering.safetyGear || dev.safety.ppe
      }
    },
    parsedSteps: steps,
    steps,
    isAiDeveloped: true
  };

  const enriched = orchestrateProjectSwarm(base, userMaterials);

  // The model's own safety warning / checkpoint beat the keyword-based swarm defaults.
  enriched.steps = enriched.steps.map((st, i) => ({
    ...st,
    infographic: {
      ...(st.infographic || {}),
      ...(st.warning ? { safetyNotice: st.warning } : {}),
      ...(st.checkpoint ? { qualityCheckMetric: st.checkpoint } : {})
    },
    qualityCheck: st.checkpoint || st.qualityCheck,
    audioScript: joinNonEmpty([
      `المرحلة ${i + 1}: ${st.title}.`,
      st.goal,
      ...(st.actions || []),
      st.warning && `تنبيه: ${st.warning}`,
      st.checkpoint && `للتأكد: ${st.checkpoint}`
    ], ' ')
  }));
  enriched.parsedSteps = enriched.steps;
  return enriched;
}

/**
 * @param {{materials:string,userLevel:string,projectType:string,onProgress?:(p:{phase:string,message:string,done?:number,total?:number})=>void,onHeroReady?:(projectId:string,view:string,url:string)=>void}} opts
 */
export async function generateProjectsWithAi({ materials, userLevel, projectType, onProgress, onHeroReady }) {
  const say = (phase, message, extra = {}) => onProgress?.({ phase, message, ...extra });

  say('ideate', 'عصف ذهني: ابتكار 8 أفكار مختلفة وتقييم كل فكرة…');
  const ideation = await callAi('ideate', { materials, level: userLevel, type: projectType, count: 8 }, { timeoutMs: 100000 });
  const concepts = ideation.concepts || [];
  if (concepts.length === 0) throw new Error('لم تُنتج مرحلة العصف الذهني أفكاراً');

  say('select', `تم اختيار أقوى ${concepts.length} أفكار: ${concepts.map(c => c.name).join(' • ')}`, { done: 0, total: concepts.length });

  let finished = 0;
  const results = await Promise.allSettled(concepts.map(async (concept, index) => {
    const out = await callAi('develop', { materials, concept, level: userLevel, type: projectType }, { timeoutMs: 150000 });
    finished++;
    say('develop', `كتابة الدليل التفصيلي… اكتمل ${finished} من ${concepts.length}`, { done: finished, total: concepts.length });
    return toAppProject({ dev: out.project, concept, index, userMaterials: materials });
  }));

  const projects = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  if (projects.length === 0) {
    const reason = results.find(r => r.status === 'rejected')?.reason;
    throw new Error(reason?.message || 'تعذر تطوير الأفكار إلى مشاريع كاملة');
  }

  // Warm the hero pictures in the background; the UI patches itself when each one lands.
  say('images', 'بدء توليد الصور الرئيسية للمشاريع…');
  projects.forEach((p, i) => {
    const spec = heroSpec(p, 'finished');
    if (!spec) return;
    requestImage(spec, { priority: 100 - i })
      .then(url => onHeroReady?.(p.id, 'finished', url))
      .catch(err => console.warn('hero image failed:', err.message));
  });

  return {
    success: true,
    projects,
    failedCount: results.length - projects.length,
    followUpQuestions: [
      `ما الأدوات المتوفرة لديك فعلاً من هذه القائمة: ${(projects[0].toolsList || []).slice(0, 3).map(t => t.name).join('، ') || 'أدوات القص والتثبيت'}؟`,
      'هل تريد نسخة أبسط أو أسرع من أحد هذه المشاريع؟',
      'أين ستضع المنتج النهائي (المنزل، الشرفة، المكتب، الفصل)؟ يمكنني تكييف التصميم والمقاسات.'
    ]
  };
}
