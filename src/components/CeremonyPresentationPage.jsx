import React, { useRef, useState } from 'react';
import { Maximize2, Presentation } from 'lucide-react';

/** View-only page that plays the MUDAM ceremony deck inside the platform. */
export default function CeremonyPresentationPage() {
  const boxRef = useRef(null);
  const frameRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const goFull = () => {
    const el = boxRef.current;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
    setTimeout(() => frameRef.current?.focus(), 200);
  };

  return (
    <section className="ceremony-page" dir="rtl">
      <header className="ceremony-head">
        <div>
          <h2><Presentation size={22} /> عرض الحفل</h2>
          <p>عرض مشروع مُدام للمشاهدة. اضغط داخل العرض ثم استخدم أسهم لوحة المفاتيح للتنقل بين الشرائح.</p>
        </div>
        <button type="button" className="ceremony-full-btn" onClick={goFull}>
          <Maximize2 size={16} /> ملء الشاشة
        </button>
      </header>
      <div className="ceremony-stage" ref={boxRef}>
        {!loaded && <div className="ceremony-loading">جارٍ تحميل العرض...</div>}
        <iframe
          ref={frameRef}
          title="عرض مشروع مُدام"
          src="/presentation/mudam-presentation.html"
          sandbox="allow-scripts allow-same-origin"
          allow="fullscreen"
          allowFullScreen
          onLoad={() => { setLoaded(true); frameRef.current?.focus(); }}
        />
      </div>
    </section>
  );
}
