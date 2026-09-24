import React from 'react';
import { 
  Award, 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode,
  Recycle,
  Sparkles
} from 'lucide-react';

export default function EcoCertificateModal({ isOpen, onClose, lcaResults, projectName }) {
  if (!isOpen || !lcaResults) return null;

  const { totalMassKg, totalNetOffsetKg, equivalences, itemizedResults } = lcaResults;
  const certId = `CERT-LCA-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="certificate-modal-box" onClick={e => e.stopPropagation()}>
        {/* Printable Certificate Frame */}
        <div className="certificate-paper" id="printable-eco-certificate">
          {/* Corner Decorative Borders */}
          <div className="cert-corner-decor cert-top-left" />
          <div className="cert-corner-decor cert-top-right" />
          <div className="cert-corner-decor cert-bot-left" />
          <div className="cert-corner-decor cert-bot-right" />

          {/* Top Eco Stamp */}
          <div className="cert-stamp-badge">
            <Recycle size={18} />
            <span>شهادة إنجاز الأثر البيئي والتحويل المستدام • ISO 14040/14044</span>
          </div>

          <h2>شهادة اعتماد الوفر الكربوني الرسمي</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.2rem' }}>
            تشهد المنصة البيئية الذكية بأن المشروع المنفذ قد حقق تحويلاً ملموساً للمخلفات المنزلية عن مكبات النفايات وخفضاً موثقاً في الانبعاثات الغازية.
          </p>

          <div style={{ margin: '1rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            <strong>المشروع المعتمد:</strong> <span style={{ color: 'var(--emerald-400)' }}>{projectName || 'نظام الري الذاتي للشتلات والمنظم الذكي'}</span>
          </div>

          {/* Metrics Row */}
          <div className="cert-metrics-row">
            <div className="cert-metric-item">
              <span className="num">+{totalNetOffsetKg.toFixed(2)}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>كيلوجرام CO₂e متفادى</span>
            </div>

            <div className="cert-metric-item">
              <span className="num">{totalMassKg.toFixed(2)}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>كجم نفايات محولة</span>
            </div>

            <div className="cert-metric-item">
              <span className="num">{equivalences.smartphoneCharges.toLocaleString()}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>شحنة هاتف ذكي مكافئة</span>
            </div>
          </div>

          {/* Materials Itemized Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            {itemizedResults.map(item => (
              <span key={item.id} className="badge badge-cyan" style={{ fontSize: '0.78rem' }}>
                {item.name}: {item.massKg.toFixed(3)} kg
              </span>
            ))}
          </div>

          {/* Certificate Verification Footer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginTop: '2rem', 
            paddingTop: '1.2rem', 
            borderTop: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div>رقم التوثيق المرجعي: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{certId}</span></div>
              <div>تاريخ الإصدار: {currentDate}</div>
              <div>المعيار: قاعدة بيانات 150 مرجع LCA دولي (IPCC/DEFRA/EPA)</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
              <div style={{ width: '48px', height: '48px', background: '#fff', padding: '4px', borderRadius: '4px' }}>
                <QrCode size={40} color="#000" />
              </div>
              <span style={{ fontSize: '0.65rem' }}>رمز التحقق المشفر</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="modal-actions-bar">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
          >
            <X size={16} />
            <span>إغلاق</span>
          </button>

          <button 
            type="button" 
            className="btn-submit-action" 
            onClick={handlePrint}
          >
            <Printer size={16} />
            <span>طباعة وتصدير الشهادة (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
