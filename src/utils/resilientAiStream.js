/**
 * Resilient Streaming Chat Client for AI Expert
 * Incorporates the gateway-first architecture:
 * 1. Resilient Chunk Reassembly Buffer (prevents JSON parse crashes on fragmented SSE chunks)
 * 2. Dual-schema parsing (OpenAI-compatible choices[0].delta.content & Google candidates[0].content.parts[0].text)
 * 3. Model Cascade Failover (tries fast/high-quota models sequentially)
 * 4. Multi-transport fallback (Cloud gateway -> personal Gemini key -> honest 'unavailable' message; never canned answers)
 */

import { callAi } from './aiGateway.js';
import { getStoredGeminiApiKey, buildAssistantProject, AI_UNAVAILABLE_MESSAGE } from './aiProjectEngine.js';

const getOpenRouterKey = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('openrouter_api_key') || import.meta.env?.VITE_OPENROUTER_API_KEY || '';
};

const CANDIDATE_GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash'];

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

  // 1. The platform's own server (key kept server-side): knows the whole project, the current step and the platform
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
    console.warn('Gateway chat unavailable, trying direct keys:', gatewayErr.message);
  }

  // 2. Optional personal Gemini key stored in this browser
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

  // 2b. Try OpenRouter direct streaming if key exists
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

  // 3. Honest message instead of a pre-written answer
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
    await new Promise(r => setTimeout(r, 18));
  }
  return fullText;
}
