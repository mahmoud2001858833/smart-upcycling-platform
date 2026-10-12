import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Send, Loader2, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';
import { callAi } from '../utils/aiGateway.js';

const SUGGESTIONS = [
  'ما أكبر مادة تؤثر في نتيجتي ولماذا؟',
  'كيف أرفع أثري البيئي بدون شراء أي شيء؟',
  'هل التدوير الصناعي أفضل من إعادة استخدام هذه المواد في البيت؟'
];

/** AI analyst for the carbon calculator. Numbers are re-computed on the server; the model only explains them. */
export default function ImpactAiPanel({ lcaResults }) {
  const [state, setState] = useState({ loading: false, data: null, error: '' });
  const [question, setQuestion] = useState('');
  const [thread, setThread] = useState([]); // follow-up Q&A
  const items = useMemo(() => (lcaResults?.itemizedResults || []).map(i => ({
    name: i.name, nameEn: i.nameEn, category: i.category, authority: i.authority,
    massKg: i.massKg, virginFactor: i.virginFactor, landfillFactor: i.landfillFactor, processFactor: i.processFactor
  })), [lcaResults]);
  const signature = JSON.stringify(items);

  // the analysis belongs to one set of materials: drop it when the materials change
  useEffect(() => { setState({ loading: false, data: null, error: '' }); setThread([]); }, [signature]);

  const run = async (q = '') => {
    setState(s => ({ ...s, loading: true, error: '' }));
    try {
      const res = await callAi('impact', { items, question: q || undefined }, { timeoutMs: 90000 });
      if (q) setThread(t => [...t, { q, a: res.analysis?.answer || 'لا توجد إجابة.' }]);
      setState(s => ({ loading: false, data: q && s.data ? s.data : res, error: '' }));
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e?.message || 'تعذّر التحليل الآن، حاول لاحقاً.' }));
    }
  };

  const ask = e => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || state.loading) return;
    setQuestion('');
    run(q);
  };

  const a = state.data?.analysis;
  const box = { background: 'var(--bg-surface-soft)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '1rem' };

  return (
    <div style={{ marginTop: '1.5rem', ...box }} data-testid="impact-ai-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
          <Sparkles size={18} color="#10b981" />
          <span>محلل الأثر الذكي</span>
        </div>
        <button type="button" className="btn-submit-action" onClick={() => run('')} disabled={state.loading} data-testid="impact-ai-run">
          {state.loading && !a ? <Loader2 size={16} className="spin-animate" /> : <Sparkles size={16} />}
          <span>{a ? 'أعد التحليل' : 'حلّل أثري بالذكاء الاصطناعي'}</span>
        </button>
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
        تُحسب الأرقام بمعادلة LCA ثم يشرحها الذكاء الاصطناعي ويقترح كيف ترفع أثرك. لا يخترع أرقاماً من عنده.
      </p>

      {state.error && <p role="alert" style={{ color: '#ef4444', fontSize: '0.88rem', marginTop: '0.7rem' }}>{state.error}</p>}

      {a && (
        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.9rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--emerald-primary, #10b981)' }}>{a.headline}</div>
            <p style={{ margin: '0.4rem 0 0', lineHeight: 1.8 }}>{a.summary}</p>
          </div>

          {a.drivers?.length > 0 && (
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontWeight: 700, marginBottom: '0.4rem' }}><TrendingUp size={16} /> أكبر المساهمين في أثرك</div>
              {a.drivers.map((d, i) => (
                <div key={i} style={{ marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span>{d.material}</span><span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(d.sharePct)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.max(2, d.sharePct))}%`, height: '100%', background: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.why}</div>
                </div>
              ))}
            </div>
          )}

          {a.improvements?.length > 0 && (
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontWeight: 700, marginBottom: '0.4rem' }}><Lightbulb size={16} /> كيف ترفع أثرك</div>
              <ol style={{ margin: 0, paddingInlineStart: '1.2rem', display: 'grid', gap: '0.5rem' }}>
                {a.improvements.map((x, i) => (
                  <li key={i}><strong>{x.title}</strong> — {x.how}{x.expectedEffect && <em style={{ color: 'var(--text-muted)' }}> ({x.expectedEffect})</em>}</li>
                ))}
              </ol>
            </div>
          )}

          {a.fact && <div style={{ fontSize: '0.88rem' }}>💡 {a.fact}</div>}

          {a.caveats?.length > 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontWeight: 700 }}><AlertTriangle size={14} /> حدود الدقة</div>
              <ul style={{ margin: '0.3rem 0 0', paddingInlineStart: '1.2rem' }}>{a.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}

          {thread.map((t, i) => (
            <div key={i} style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.6rem' }}>
              <div style={{ fontWeight: 700 }}>س: {t.q}</div>
              <div style={{ lineHeight: 1.8 }}>{t.a}</div>
            </div>
          ))}

          <form onSubmit={ask} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={question} onChange={e => setQuestion(e.target.value)} maxLength={500}
              placeholder="اسأل عن أثرك أو موادك…" aria-label="سؤال عن الأثر"
              style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid var(--border-medium)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            />
            <button type="submit" className="btn-submit-action" disabled={state.loading || !question.trim()} aria-label="إرسال">
              {state.loading ? <Loader2 size={16} className="spin-animate" /> : <Send size={16} />}
            </button>
          </form>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} type="button" disabled={state.loading} onClick={() => run(s)}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', borderRadius: 999, border: '1px solid var(--border-medium)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
