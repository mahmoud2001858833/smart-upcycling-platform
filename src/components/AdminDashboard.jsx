import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Clock, Coins, Eye, FolderOpen, Image as ImageIcon, RefreshCw, Search, Users, X, AlertTriangle } from 'lucide-react';
import { callAi } from '../utils/aiGateway.js';

const nf = new Intl.NumberFormat('ar-EG');
const usd = n => (n == null ? '—' : `$${Number(n).toFixed(n < 1 ? 3 : 2)}`);
const fmtDate = iso => { try { return new Date(iso).toLocaleString('ar', { dateStyle: 'short', timeStyle: 'short' }); } catch { return iso || ''; } };

function fmtDuration(ms) {
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
  const parts = [];
  if (d) parts.push(`${nf.format(d)} يوم`);
  if (h) parts.push(`${nf.format(h)} ساعة`);
  if (!d) parts.push(`${nf.format(mm)} دقيقة`);
  return parts.join(' و ');
}

const LEVEL = {
  normal: { label: 'طبيعي', cls: 'ok' },
  busy: { label: 'ضغط متوسط', cls: 'warn' },
  heavy: { label: 'ضغط عالٍ', cls: 'warn' },
  closed: { label: 'متوقف', cls: 'bad' }
};

function Stat({ icon, label, value, hint, tone }) {
  return (
    <div className={`adm-stat ${tone ? `is-${tone}` : ''}`}>
      <span className="adm-stat-icon">{icon}</span>
      <div>
        <div className="adm-stat-value">{value}</div>
        <div className="adm-stat-label">{label}</div>
        {hint && <div className="adm-stat-hint">{hint}</div>}
      </div>
    </div>
  );
}

function Bars({ series, field, label }) {
  const max = Math.max(1, ...series.map(d => d[field]));
  return (
    <div className="adm-chart" role="img" aria-label={label}>
      <div className="adm-chart-title">{label}</div>
      <div className="adm-bars">
        {series.map(d => (
          <div key={d.date} className="adm-bar-col" title={`${d.date}: ${d[field]}`}>
            <span className="adm-bar-num">{d[field] || ''}</span>
            <span className="adm-bar" style={{ height: `${Math.max(3, (d[field] / max) * 100)}%` }} />
            <span className="adm-bar-day">{d.date.slice(8)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectModal({ id, onClose }) {
  const [row, setRow] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    callAi('admin_project', { id }).then(r => setRow(r.project)).catch(e => setErr(e.message));
  }, [id]);
  const p = row?.project;
  return (
    <div className="adm-modal-back" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="adm-modal-x" onClick={onClose} aria-label="إغلاق"><X size={18} /></button>
        {err && <p className="adm-error">{err}</p>}
        {!row && !err && <p>جاري التحميل…</p>}
        {row && (
          <>
            <h3>{row.name}</h3>
            <p className="adm-muted">{fmtDate(row.created_at)} • {row.user_email || 'زائر'} • {row.model} • {usd(row.cost_usd)}</p>
            <p><strong>المواد:</strong> {row.materials}</p>
            {p?.tagline && <p><em>{p.tagline}</em></p>}
            {p?.idea && <p>{p.idea}</p>}
            {p?.materialsList?.length > 0 && (
              <><h4>المواد</h4><ul>{p.materialsList.map((m, i) => <li key={i}>{m.item}{m.quantity ? ` — ${m.quantity}` : ''}</li>)}</ul></>
            )}
            {p?.steps?.length > 0 && (
              <><h4>الخطوات ({p.steps.length})</h4><ol>{p.steps.map((s, i) => <li key={i}><strong>{s.title}</strong>{s.goal ? ` — ${s.goal}` : ''}</li>)}</ol></>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [list, setList] = useState({ items: [], total: 0, pageSize: 20 });
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setData(await callAi('admin_stats', { tzOffsetMin: -new Date().getTimezoneOffset() }));
      setError('');
    } catch (e) { setError(e.message); }
    setBusy(false);
  }, []);

  const loadProjects = useCallback(async () => {
    try { setList(await callAi('admin_projects', { page, q })); } catch (e) { setError(e.message); }
  }, [page, q]);

  useEffect(() => { load(); const t = setInterval(load, 60_000); return () => clearInterval(t); }, [load]);
  useEffect(() => { const t = setTimeout(loadProjects, q ? 300 : 0); return () => clearTimeout(t); }, [loadProjects, q]);

  const lvl = LEVEL[data?.capacity?.level] || LEVEL.normal;
  const pages = Math.max(1, Math.ceil(list.total / (list.pageSize || 20)));
  const series = useMemo(() => data?.stats?.series || [], [data]);

  if (error && !data) return <div className="adm-wrap"><p className="adm-error" data-testid="admin-error">{error}</p></div>;
  if (!data) return <div className="adm-wrap"><p>جاري تحميل لوحة التحكم…</p></div>;

  const { platform, totals, runway, credit, stats } = data;
  const s7 = stats.last7d;

  return (
    <div className="adm-wrap" data-testid="admin-dashboard">
      <div className="adm-head">
        <div>
          <h2>لوحة التحكم</h2>
          <p className="adm-muted">تظهر لحسابك فقط • تتحدث كل دقيقة • التخزين: {platform.storage === 'supabase' ? 'قاعدة البيانات' : 'ذاكرة مؤقتة (تُمسح عند إعادة التشغيل)'}</p>
        </div>
        <button type="button" className="adm-btn" onClick={load} disabled={busy}><RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> تحديث</button>
      </div>

      <div className="adm-grid">
        <Stat icon={<Clock size={20} />} label="مدة عمل المنصة" value={fmtDuration(platform.uptimeMs)} hint={`منذ ${fmtDate(platform.since)}`} />
        <Stat
          icon={<Coins size={20} />}
          label="مشاريع يمكن إنتاجها بالرصيد المتبقي"
          value={runway.projects == null ? 'غير معروف' : nf.format(runway.projects)}
          hint={runway.remainingUsd == null
            ? 'الرصيد غير معروف: ضع حد صرف على مفتاح OpenRouter أو أضف OPENROUTER_MANAGEMENT_KEY'
            : `الرصيد ${usd(runway.remainingUsd)} • كلفة المشروع ${usd(runway.perProjectUsd)}${runway.estimated ? ' (تقدير)' : ''} • صور ≈ ${runway.images == null ? '—' : nf.format(runway.images)}`}
          tone={runway.projects != null && runway.projects < 10 ? 'bad' : null}
        />
        <Stat icon={<Activity size={20} />} label="حالة الضغط الآن" value={lvl.label} hint={`${nf.format(data.capacity.pressure)} عملية في آخر ${data.capacity.thresholds.windowSec} ثانية • المنتَج الآن ${data.capacity.projects} مشاريع${data.capacity.imagesAllowed ? '' : ' • الصور متوقفة'}`} tone={lvl.cls} />
        <Stat icon={<FolderOpen size={20} />} label="كل المشاريع المنتجة" value={nf.format(totals.projects)} hint={`${nf.format(totals.generations)} عملية توليد`} />
        <Stat icon={<Eye size={20} />} label="الزيارات (كلها)" value={nf.format(totals.visits)} hint={`آخر 24 ساعة: ${nf.format(stats.last24h.visits)} • 7 أيام: ${nf.format(s7.visits)}`} />
        <Stat icon={<Users size={20} />} label="زوار مختلفون (7 أيام)" value={nf.format(s7.visitors)} hint={`30 يوماً: ${nf.format(stats.last30d.visitors)}`} />
        <Stat icon={<ImageIcon size={20} />} label="الصور المولّدة" value={nf.format(totals.images)} hint={`7 أيام: ${nf.format(s7.images)}`} />
        <Stat icon={<Coins size={20} />} label="الصرف (7 / 30 يوماً)" value={`${usd(s7.cost)} / ${usd(stats.last30d.cost)}`} hint={credit.known ? `المستخدم الكلي ${usd(credit.usage)}` : undefined} />
      </div>

      {data.capacity.reasons?.length > 0 && (
        <div className={`capacity-banner is-${data.capacity.level}`}><AlertTriangle size={18} /><div>{data.capacity.reasons.join(' • ')}</div></div>
      )}

      <div className="adm-charts">
        <Bars series={series} field="visits" label="الزيارات آخر 14 يوماً" />
        <Bars series={series} field="projects" label="المشاريع المنتجة آخر 14 يوماً" />
      </div>

      <section className="adm-card">
        <h3>آخر الزيارات</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>الوقت</th><th>الزائر</th><th>الجهاز</th><th>الدولة</th><th>المصدر</th><th>الصفحة</th></tr></thead>
            <tbody>
              {data.recentVisits.length === 0 && <tr><td colSpan="6" className="adm-muted">لا زيارات بعد</td></tr>}
              {data.recentVisits.map((v, i) => (
                <tr key={i}>
                  <td>{fmtDate(v.at)}</td>
                  <td>{v.who || `زائر ${v.visitor || v.ip || ''}`}</td>
                  <td>{v.device || '—'}</td><td>{v.country || '—'}</td><td>{v.from || 'مباشر'}</td><td dir="ltr">{v.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-head">
          <h3>جميع المشاريع المنتجة ({nf.format(list.total)})</h3>
          <label className="adm-search"><Search size={15} /><input value={q} onChange={e => { setPage(0); setQ(e.target.value); }} placeholder="ابحث بالاسم أو المواد" /></label>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>التاريخ</th><th>المشروع</th><th>المواد</th><th>الطالب</th><th>الكلفة</th></tr></thead>
            <tbody>
              {list.items.length === 0 && <tr><td colSpan="5" className="adm-muted">لا مشاريع</td></tr>}
              {list.items.map(p => (
                <tr key={p.id} className="is-click" onClick={() => setOpenId(p.id)}>
                  <td>{fmtDate(p.created_at)}</td><td><strong>{p.name}</strong></td>
                  <td className="adm-clip">{p.materials}</td><td>{p.user_email || 'زائر'}</td><td>{usd(p.cost_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="adm-pager">
          <button type="button" className="adm-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>السابق</button>
          <span>{nf.format(page + 1)} / {nf.format(pages)}</span>
          <button type="button" className="adm-btn" disabled={page + 1 >= pages} onClick={() => setPage(p => p + 1)}>التالي</button>
        </div>
      </section>

      {data.recentErrors.length > 0 && (
        <section className="adm-card">
          <h3>آخر الأخطاء</h3>
          <ul className="adm-errors">{data.recentErrors.map((e, i) => <li key={i}><strong>{e.kind}</strong> {fmtDate(e.at)} — {e.message || '—'}</li>)}</ul>
        </section>
      )}

      {openId && <ProjectModal id={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
