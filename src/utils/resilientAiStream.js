/**
 * Resilient Streaming Chat Client for AI Expert
 * Incorporates the 4-layer defense architecture:
 * 1. Resilient Chunk Reassembly Buffer (prevents JSON parse crashes on fragmented SSE chunks)
 * 2. Dual-schema parsing (OpenAI-compatible choices[0].delta.content & Google candidates[0].content.parts[0].text)
 * 3. Model Cascade Failover (tries fast/high-quota models sequentially)
 * 4. Multi-transport fallback (SSE stream -> Direct API -> Cloud gateway -> Contextual AI Knowledge Base)
 */

import { callAi } from './aiGateway.js';
import { getStoredGeminiApiKey } from './aiProjectEngine.js';

const getOpenRouterKey = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('openrouter_api_key') || import.meta.env?.VITE_OPENROUTER_API_KEY || '';
};

const CANDIDATE_GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-2.5-flash'
];

/**
 * Resilient buffer line parser
 * Assembles broken SSE lines without throwing JSON syntax errors
 */
async function processSseStream(response, onChunk) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullAccumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || !line.trim()) continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') break;

      try {
        const parsed = JSON.parse(jsonStr);
        // Dual schema support
        const content = parsed.choices?.[0]?.delta?.content 
                     ?? parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (content) {
          fullAccumulated += content;
          if (onChunk) onChunk(content, fullAccumulated);
        }
      } catch {
        // Resilient recovery: Put back the truncated line into buffer and wait for next chunk
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  return fullAccumulated;
}

/**
 * Stream chat reply with multi-layer fallback
 */
export async function streamChatMessage({
  question,
  conversationHistory = [],
  projectContext = null,
  onChunk,
  signal
}) {
  const systemPrompt = `أنت خبير واستشاري الذكاء الاصطناعي لإعادة التدوير والاستدامة البيئية والهندسة الدائرية في منصة مُدام (MUDAM).
تحدث باللغة العربية بأسلوب راقٍ، مهني، علمي، وملهم. قدم حلولاً عملية لربط وقص وتشكيل المواد ومعايير الأمان وحسابات الكربون LCA.${
    projectContext ? `\nالمستخدم يستشيرك حالياً بخصوص مشروع "${projectContext.name}"، المصنوع من (${projectContext.materials}). فكرة المشروع: ${projectContext.idea}.` : ''
  }`;

  // 1. Try Streaming via Direct Gemini API if API key exists (Cascade failover)
  const geminiKey = getStoredGeminiApiKey();
  if (geminiKey) {
    for (const model of CANDIDATE_GEMINI_MODELS) {
      try {
        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'أهلاً بك! أنا في خدمتك لتقديم أفضل الاستشارات الهندسية والبيئية لمنصة مُدام.' }] }
        ];

        for (const msg of conversationHistory) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
        contents.push({ role: 'user', parts: [{ text: question }] });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.7 }
          }),
          signal
        });

        if (res.ok && res.body) {
          const text = await processSseStream(res, onChunk);
          if (text && text.trim().length > 0) return text;
        }
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        console.warn(`Gemini model ${model} stream error, trying next:`, err.message);
      }
    }
  }

  // 2. Try OpenRouter direct streaming if key exists
  const orKey = getOpenRouterKey();
  if (orKey) {
    try {
      const msgs = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        { role: 'user', content: question }
      ];

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${orKey}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite:free',
          messages: msgs,
          stream: true
        }),
        signal
      });

      if (res.ok && res.body) {
        const text = await processSseStream(res, onChunk);
        if (text && text.trim().length > 0) return text;
      }
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      console.warn('OpenRouter direct stream failed:', e.message);
    }
  }

  // 3. Fallback to Cloud Gateway (non-streaming or batch reply)
  try {
    const out = await callAi('chat', {
      question,
      history: conversationHistory,
      project: projectContext ? { name: projectContext.name, materials: projectContext.materials, idea: projectContext.idea } : null
    }, { timeoutMs: 50000 });

    if (out.reply) {
      // Simulate smooth typing chunk by chunk for consistency
      return simulateStreaming(out.reply, onChunk, signal);
    }
  } catch (gatewayErr) {
    console.warn('Gateway chat fallback error:', gatewayErr.message);
  }

  // 4. Ultimate Contextual Fallback Knowledge Base with Smooth Stream Simulation
  const fallbackReply = generateContextualReply(question, projectContext);
  return simulateStreaming(fallbackReply, onChunk, signal);
}

/**
 * Simulates real-time character typing for non-streaming fallback sources
 */
async function simulateStreaming(fullText, onChunk, signal) {
  let accumulated = '';
  const words = fullText.split(/(\s+)/);
  for (const w of words) {
    if (signal?.aborted) break;
    accumulated += w;
    if (onChunk) onChunk(w, accumulated);
    await new Promise(r => setTimeout(r, 18));
  }
  return fullText;
}

function generateContextualReply(question, projectContext) {
  const qLower = question.toLowerCase();
  
  if (qLower.includes('لاصق') || qLower.includes('غراء') || qLower.includes('تثبيت') || qLower.includes('تلزيق')) {
    return `بناءً على المعايير الهندسية للمواد المستدامة في منصة مُدام:
• **لربط الزجاج بالمعادن أو البلاستيك:** يُنصح باستخدام لاصق الإيبوكسي ثنائي التركيب (Epoxy 2-Part) أو السيليكون الهيكلي الشفاف RTV.
• **للأخشاب والكرتون:** غراء الخشب المائي (PVA) يقدم رابطة أقوى من ألياف الخشب نفسها إذا تُرك تحت الضغط لـ 4 ساعات.
• **للبلاستيك المرن (PET/PP):** تجنب مسدس الشمع الساخن جداً لأنه قد يشوه العبوات؛ يُفضل غراء البولي يوريثان أو التثبيت الميكانيكي بالبراغي الدقيقة.`;
  }
  
  if (qLower.includes('قص') || qLower.includes('قطع') || qLower.includes('حواف') || qLower.includes('منشار')) {
    return `إرشادات السلامة والقص الدقيق:
1. **الزجاج:** لا تحاول كسر الزجاج بالمطرقة! استخدم قاطع زجاج بعجلة كربيد التنجستن مع زيت التزليق، ثم طبق صدمة حرارية (ماء مغلي يليه ماء مثلج) لينفصل بسلاسة.
2. **علب الألمنيوم والصلب:** استخدم مقص صاج ميكانيكي (Tin Snips) واثنِ الحواف الداخلية بمقدار 3 مم بمساعدة زرادية مسطحة لتفادي أي جروح قطعية.
3. **الكرتون:** استخدم دائماً مسطرة معدنية ومشرطاً فائق الحدة بزاوية 45 درجة لتفادي تمزق الألياف.`;
  }

  if (qLower.includes('كربون') || qLower.includes('وفر') || qLower.includes('أثر') || qLower.includes('lca') || qLower.includes('تنبؤ')) {
    return `وفقاً لمعايير تقييم دورة الحياة (ISO 14040/14044):
• كل كيلوجرام من خردة الألمنيوم المعاد تدويرها يوفر قرابة **9.1 كغ من مكافئ CO₂** مقارنة بالتعدين البكر، ويوفر 95% من الطاقة الكهربائية!
• تحويل الكرتون عن المرادم يمنع تحلله اللاهوائي الذي ينتج غاز الميثان.
• يمكنك استخدام أداة **"التنبؤ البيئي الذكية"** الجديدة في المنصة لتحليل الاستهلاك الشامل (كهرباء، مياه، نقل، ونفايات) مع مقارنة دقيقة لمحافظات الأردن!`;
  }

  if (qLower.includes('طلاء') || qLower.includes('دهان') || qLower.includes('تلوين') || qLower.includes('صبغ')) {
    return `للحفاظ على البيئة مع الحصول على مظهر جمالي يدوم:
• اختر دائماً دهانات الأكريليك المائية الخالية من المركبات العضوية المتطايرة (Low-VOC / Zero-VOC).
• قبل طلاء المعادن أو البلاستيك الأملس، قم بصنفرة خفيفة بحبيبات 220 لزيادة الالتصاق، ثم طبق طبقة أساس (Primer) مخصصة.
• لتشطيب الخشب وحمايته، زيت بذر الكتان الطبيعي (Linseed Oil) أو شمع العسل يمنح حماية ممتازة ولمعة دافئة صديقة للبيئة.`;
  }

  if (projectContext) {
    return `بخصوص مشروع "${projectContext.name}":
فكرة متميزة جداً! للارتقاء بهذا المشروع المصنوع من (${projectContext.materials})، نوصي بالتركيز على جودة التشطيب ومقاومة الرطوبة وثبات التوصيلات الميكانيكية. هل ترغب في تفاصيل إضافية حول اختبار المتانة أو تحسين الوفر الكربوني؟`;
  }

  return `شكراً لاستشارتك! تحويل المخلفات المنزلية إلى أصول نفعية يحقق هدفين متلازمين: توفير مالي ملموس وخفض انبعاثات الكربون المتسببة في الاحتباس الحراري.

نصيحتنا الهندسية في منصة مُدام: ابدأ بالفرز الدقيق والتنظيف التام، واعتمد على قوة الربط الميكانيكي (البراغي والتعشيق) قبل الاعتماد الكلي على اللواصق لضمان استدامة المنتج لسنوات طويلة.`;
}
