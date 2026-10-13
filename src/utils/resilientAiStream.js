/**
 * Resilient Streaming Chat Client for AI Expert (4-Layer Defense Architecture)
 * 
 * 1. Model Cascade Failover (tries fast/high-quota models sequentially)
 * 2. Triple Transport Fallback (OpenRouter Stream -> Google Native SSE -> Cloud Gateway -> Verified Knowledge Engine)
 * 3. Resilient Chunk Reassembly Buffer (prevents JSON parse crashes on fragmented SSE chunks)
 * 4. Dual-schema parsing (OpenAI-compatible choices[0].delta.content & Google candidates[0].content.parts[0].text)
 */

import { callAi } from './aiGateway.js';
import { getStoredGeminiApiKey, buildAssistantProject, answerSustainabilityKnowledge, AI_UNAVAILABLE_MESSAGE } from './aiProjectEngine.js';

const getOpenRouterKey = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('openrouter_api_key') || import.meta.env?.VITE_OPENROUTER_API_KEY || '';
};

// High-quota, fast response candidate models for Google Native SSE
const CANDIDATE_GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest'
];

// Cascade failover models for OpenRouter streaming
const CANDIDATE_OPENROUTER_MODELS = [
  'google/gemini-2.5-flash',
  'google/gemini-2.0-flash-001',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat',
  'google/gemini-flash-1.5',
  'google/gemini-2.0-flash-lite:free'
];

/**
 * Resilient buffer line parser
 * Assembles broken SSE lines without throwing JSON syntax errors
 */
async function processSseStream(response, onChunk, signal) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullAccumulated = '';

  while (true) {
    if (signal?.aborted) break;
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
        // Dual schema support: OpenAI format vs Google Native format
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
 * Stream chat reply with 4-tier resilient defense architecture
 */
export async function streamChatMessage({
  question,
  conversationHistory = [],
  projectContext = null,
  onChunk,
  signal
}) {
  const systemPrompt = `أنت "مستشار مُدام" الذكي: خبير إعادة التدوير الإبداعي، تقييم دورة الحياة (LCA)، والاقتصاد الدائري في منصة مُدام (MUDAM).
تحدث باللغة العربية بأسلوب راقٍ، مهني، علمي، وملهم. قدم حلولاً عملية لربط وقص وتشكيل المواد ومعايير الأمان وحسابات الكربون LCA.${
    projectContext ? `\nالمستخدم يستشيرك حالياً بخصوص مشروع "${projectContext.name}"، المصنوع من (${projectContext.materials}). فكرة المشروع: ${projectContext.idea}.` : ''
  }`;

  // ----------------------------------------------------
  // Layer 1: OpenRouter Direct Streaming with Model Cascade
  // ----------------------------------------------------
  const orKey = getOpenRouterKey();
  if (orKey) {
    const msgs = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: question }
    ];

    for (const model of CANDIDATE_OPENROUTER_MODELS) {
      if (signal?.aborted) break;
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${orKey}`
          },
          body: JSON.stringify({
            model,
            messages: msgs,
            stream: true,
            temperature: 0.7,
            max_tokens: 1800
          }),
          signal
        });

        if (res.ok && res.body) {
          const text = await processSseStream(res, onChunk, signal);
          if (text && text.trim().length > 0) return text;
        }
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        console.warn(`OpenRouter cascade model ${model} failed, switching to next:`, e.message);
      }
    }
  }

  // ----------------------------------------------------
  // Layer 2: Google Native SSE with Model Cascade Failover
  // ----------------------------------------------------
  const geminiKey = getStoredGeminiApiKey();
  if (geminiKey) {
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

    for (const model of CANDIDATE_GEMINI_MODELS) {
      if (signal?.aborted) break;
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
          }),
          signal
        });

        if (res.ok && res.body) {
          const text = await processSseStream(res, onChunk, signal);
          if (text && text.trim().length > 0) return text;
        }
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        console.warn(`Gemini cascade model ${model} stream error, trying next:`, err.message);
      }
    }
  }

  // ----------------------------------------------------
  // Layer 3: Cloud Edge Gateway (Server-side key)
  // ----------------------------------------------------
  try {
    const out = await callAi('chat', {
      question,
      history: conversationHistory,
      project: buildAssistantProject(projectContext),
      focusStep: projectContext?.focusStep || null
    }, { timeoutMs: 60000 });
    if (out.reply) return simulateStreaming(out.reply, onChunk, signal);
  } catch (gatewayErr) {
    if (gatewayErr?.name === 'AbortError') throw gatewayErr;
    console.warn('Gateway chat unavailable, activating resilience layer:', gatewayErr.message);
  }

  // ----------------------------------------------------
  // Layer 4: Resilient Knowledge & LCA Synthesis Engine
  // (Guarantees zero dropped answers for sustainability inquiries)
  // ----------------------------------------------------
  const expertAnswer = answerSustainabilityKnowledge(question);
  if (expertAnswer) {
    return simulateStreaming(expertAnswer, onChunk, signal);
  }

  // Fallback graceful advisory response
  return simulateStreaming(AI_UNAVAILABLE_MESSAGE, onChunk, signal);
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
    await new Promise(r => setTimeout(r, 14));
  }
  return fullText;
}
