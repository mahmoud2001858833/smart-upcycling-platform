import React, { useEffect, useState } from 'react';
import { Check, Loader2, Lightbulb, PenLine, Image as ImageIcon } from 'lucide-react';

const STAGES = [
  { key: 'ideate', icon: Lightbulb, title: 'عصف ذهني', desc: 'ابتكار 8 أفكار مختلفة وتقييم كل فكرة' },
  { key: 'develop', icon: PenLine, title: 'كتابة الدليل التفصيلي', desc: 'قياسات دقيقة ونقطة تحقق لكل مرحلة' },
  { key: 'images', icon: ImageIcon, title: 'رسم الصور', desc: 'صورة المنتج وصورة لكل مرحلة' }
];

const PHASE_TO_STAGE = { ideate: 0, select: 1, develop: 1, images: 2 };

const ARCHETYPE_AR = {
  lighting: 'إضاءة', furniture: 'أثاث', garden: 'زراعة', kinetic: 'حركة', sound: 'صوت',
  storage: 'تخزين', wearable: 'إكسسوار', educational: 'تعليمي'
};

export default function GenerationProgress({ progress, materials = '' }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const active = PHASE_TO_STAGE[progress?.phase] ?? 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(1, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const concepts = progress?.concepts || [];

  return (
    <div className="gen-progress" role="status" aria-live="polite">
      <div className="gen-progress-head">
        <span className="gen-progress-badge"><Loader2 size={15} className="animate-spin" /> الذكاء الاصطناعي يعمل على مشاريعك</span>
        <span className="gen-progress-time">{mm}:{ss}</span>
      </div>
      {materials && <p className="gen-progress-materials">الخامات: {materials}</p>}

      <ol className="gen-stages">
        {STAGES.map((st, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'pending';
          const Icon = st.icon;
          return (
            <li key={st.key} className={`gen-stage ${state}`}>
              <span className="gen-stage-dot">{state === 'done' ? <Check size={15} /> : <Icon size={15} />}</span>
              <span className="gen-stage-text">
                <strong>{st.title}</strong>
                <small>
                  {st.key === 'develop' && progress?.total
                    ? `اكتمل ${progress.done || 0} من ${progress.total}`
                    : st.desc}
                </small>
              </span>
            </li>
          );
        })}
      </ol>

      {concepts.length > 0 && (
        <div className="gen-concepts">
          <span className="gen-concepts-label">الأفكار المختارة:</span>
          {concepts.map((c, i) => (
            <span key={i} className="gen-concept-chip">
              {c.name}
              {ARCHETYPE_AR[c.archetype] && <em>{ARCHETYPE_AR[c.archetype]}</em>}
            </span>
          ))}
        </div>
      )}

      <div className="gen-skeleton-grid" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <div key={i} className="gen-skeleton-card">
            <div className="gen-skeleton-img" />
            <div className="gen-skeleton-line w70" />
            <div className="gen-skeleton-line w90" />
            <div className="gen-skeleton-line w50" />
          </div>
        ))}
      </div>
    </div>
  );
}
