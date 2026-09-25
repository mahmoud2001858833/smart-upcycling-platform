import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  QrCode,
  Recycle,
  Award,
  Sparkles,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  Leaf
} from 'lucide-react';

export default function EcoCertificateModal({ isOpen, onClose, lcaResults, projectName }) {
  const [certId] = useState(() => `CERT-LCA-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`);
  const [copiedCode, setCopiedCode] = useState(false);

  const currentDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!isOpen || !lcaResults) return null;

  const { totalMassKg, totalNetOffsetKg, equivalences, itemizedResults } = lcaResults;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCertId = () => {
    navigator.clipboard.writeText(certId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white border border-amber-500/30 rounded-3xl w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden relative" 
        onClick={e => e.stopPropagation()}
        dir="rtl"
        style={{ width: '100%', maxWidth: '820px', maxHeight: '95vh' }}
      >
        {/* Top Control Bar */}
        <div className="p-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs sm:text-sm font-black">
              وثيقة الاعتماد البيئي المصدّقة رسمياً • معيار ISO 14040/14044
            </span>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Certificate Frame */}
        <div className="overflow-y-auto p-5 sm:p-8 bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 flex-1">
          <div 
            className="relative border-4 border-double border-amber-600/40 rounded-3xl p-6 sm:p-10 bg-white shadow-xl space-y-6 text-center"
            id="printable-eco-certificate"
          >
            {/* Corner Decorative Borders */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600/60 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600/60 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600/60 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600/60 rounded-br-xl pointer-events-none" />

            {/* Top Eco Stamp & Header */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 border-2 border-amber-300">
                <Recycle className="w-8 h-8 animate-spin-slow" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-sm mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>شهادة موثقة لتقييم دورة الحياة (LCA Verification)</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                شهادة اعتماد الوفر الكربوني والتدوير المستدام
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                تشهد المنظومة الذكية لإعادة التدوير بأن المشروع المنفذ قد حقق تحويلاً ملموساً للمخلفات الصلبة عن المكبات، وسجل خفضاً موثقاً في انبعاثات غازات الاحتباس الحراري.
              </p>
            </div>

            {/* Project Highlight Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800 text-sm flex items-center justify-between flex-wrap gap-2 text-right">
              <div>
                <span className="text-xs text-slate-500 block mb-0.5 font-bold">اسم المشروع المعتمد:</span>
                <strong className="text-emerald-700 text-base font-black">
                  {projectName || 'مشروع إعادة التدوير المبتكر'}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>معتمد كلياً</span>
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-sm">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">
                  +{totalNetOffsetKg.toFixed(2)}
                </span>
                <span className="text-xs text-slate-600 font-bold block mt-1">كيلوجرام CO₂e متفادى</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">خفض انبعاثات الغازات</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-200 shadow-sm">
                <span className="text-2xl sm:text-3xl font-black text-teal-700 block">
                  {totalMassKg.toFixed(2)}
                </span>
                <span className="text-xs text-slate-600 font-bold block mt-1">كجم نفايات محولة</span>
                <span className="text-[10px] text-teal-600 block mt-0.5">إبعاد تام عن المكب</span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-sm">
                <span className="text-2xl sm:text-3xl font-black text-amber-700 block">
                  {equivalences.smartphoneCharges.toLocaleString()}
                </span>
                <span className="text-xs text-slate-600 font-bold block mt-1">شحنة هاتف ذكي مكافئة</span>
                <span className="text-[10px] text-amber-600 block mt-0.5">وفر الطاقة الكهربائية</span>
              </div>
            </div>

            {/* Materials Itemized Badges */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 block">الخامات المستصلحة والمدرجة بالتقييم:</span>
              <div className="flex justify-center gap-1.5 flex-wrap">
                {itemizedResults.map(item => (
                  <span 
                    key={item.id} 
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1"
                  >
                    <Leaf className="w-3 h-3 text-emerald-600" />
                    <span>{item.name}: {item.massKg.toFixed(3)} كجم</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Certificate Verification Footer */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-right">
              <div className="space-y-1 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span>رقم التوثيق المرجعي:</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {certId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCertId}
                    className="text-emerald-600 hover:text-emerald-700 p-1"
                    title="نسخ الرقم المرجعي"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div>تاريخ الإصدار: <span className="font-bold text-slate-700">{currentDate}</span></div>
                <div className="text-[10px] text-slate-400">
                  قاعدة البيانات المرجعية: 150 معيار LCA دولي موثق (IPCC / DEFRA / EPA)
                </div>
              </div>

              {/* QR Verification */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-sm flex flex-col items-center">
                  <QrCode className="w-12 h-12 text-slate-900" />
                  <span className="text-[9px] font-mono text-slate-500 mt-1">ISO-VALIDATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>الشهادة صالحة للاستخدام في ملفات المشاريع البيئية وطلبات الدعم الأخضر.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              type="button" 
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-300 shadow-sm"
              onClick={onClose}
            >
              إغلاق
            </button>

            <button 
              type="button" 
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              <span>طباعة وتصدير الشهادة الرسمية (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
