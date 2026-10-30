import React from 'react';
import { SHOWCASE_PROJECT as P } from '../data/showcaseProject.js';

const Block = ({ title, children }) => (
  <section className="sc-block">
    <h4 className="sc-block-title">{title}</h4>
    {children}
  </section>
);

export default function ShowcaseProject() {
  const total = P.steps.reduce((a, s) => a + s.minutes, 0);
  return (
    <article id="showcase-project" className="showcase-project" dir="rtl">
      <header className="sc-head">
        <span className="sc-badge">مشروع نموذجي مُعدّ مسبقاً (غير مولَّد الآن)</span>
        <h3 className="sc-title">{P.name}</h3>
        <p className="sc-tagline">{P.tagline}</p>
      </header>

      <div className="sc-images">
        {P.images.map(img => (
          <figure key={img.src} className="sc-figure">
            <img src={img.src} alt={img.caption} loading="lazy" />
            <figcaption>{img.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="sc-stats">
        {P.stats.map(s => (
          <div key={s.label} className="sc-stat"><span>{s.label}</span><strong>{s.value}</strong></div>
        ))}
      </div>

      <Block title="القصة والفكرة"><p>{P.story}</p></Block>
      <Block title="المبدأ العلمي"><p>{P.principle}</p></Block>

      <div className="sc-two">
        <Block title="الخامات">
          <ul className="sc-list">{P.materials.map(m => <li key={m.item}><b>{m.item}</b><span> — {m.role}</span></li>)}</ul>
          <p className="sc-mini"><b>مستلزمات:</b> {P.supplies.join('، ')}</p>
        </Block>
        <Block title="الأدوات">
          <ul className="sc-list">{P.tools.map(t => <li key={t}>{t}</li>)}</ul>
        </Block>
      </div>

      <Block title={`الخطوات بالتفصيل (${P.steps.length} مراحل، المجموع ${Math.floor(total / 60)} ساعات و${total % 60} دقيقة)`}>
        <ol className="sc-steps">
          {P.steps.map((s, i) => (
            <li key={s.title} className="sc-step">
              <div className="sc-step-head">
                <span className="sc-step-num">{i + 1}</span>
                <strong>{s.title}</strong>
                <span className="sc-step-time">{s.minutes} دقيقة</span>
              </div>
              <ul className="sc-actions">{s.actions.map(a => <li key={a}>{a}</li>)}</ul>
              <div className="sc-step-meta">
                <p><b>القياسات:</b> {s.measurements}</p>
                <p><b>نصيحة:</b> {s.tip}</p>
                <p className="sc-warn"><b>تحذير:</b> {s.warning}</p>
                <p className="sc-check"><b>نقطة تحقق:</b> {s.checkpoint}</p>
              </div>
            </li>
          ))}
        </ol>
      </Block>

      <Block title="التجربة العلمية">
        <ul className="sc-list">
          <li><b>الفرضية:</b> {P.experiment.hypothesis}</li>
          <li><b>المتغير المستقل:</b> {P.experiment.independent}</li>
          <li><b>المتغير التابع:</b> {P.experiment.dependent}</li>
          <li><b>العوامل الثابتة:</b> {P.experiment.constants}</li>
          <li><b>العينة الضابطة:</b> {P.experiment.control}</li>
          <li><b>ما يدحض الفرضية:</b> {P.experiment.disproves}</li>
        </ul>
        <p className="sc-mini">{P.experiment.note}</p>
      </Block>

      <Block title="السلامة">
        <ul className="sc-list">{P.safety.map(s => <li key={s}>{s}</li>)}</ul>
      </Block>
    </article>
  );
}
