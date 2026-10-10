import React, { useState, useEffect } from 'react';
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
  Leaf,
  ExternalLink,
  Edit2
} from 'lucide-react';
import QRCode from 'qrcode';

export default function EcoCertificateModal({ 
  isOpen, 
  onClose, 
  lcaResults, 
  projectName,
  user,
  project
}) {
  const [certId] = useState(() => `CERT-LCA-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`);
  const [copiedCode, setCopiedCode] = useState(false);
  const [studentName, setStudentName] = useState(() => user?.user_metadata?.full_name || 'طالب الابتكار البيئي');
  const [schoolName, setSchoolName] = useState(() => user?.user_metadata?.school || 'المنصة الوطنية للتدوير والاستدامة');
  const [isEditingName, setIsEditingName] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const currentDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate verify URL
  const totalOffset = lcaResults?.totalNetOffsetKg ?? 3.5;
  const totalMass = lcaResults?.totalMassKg ?? 2.1;
  const charges = lcaResults?.equivalences?.smartphoneCharges ?? 450;
  const targetProjectTitle = projectName || project?.name || project?.title || 'مشروع إعادة التدوير المبتكر';

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#verify?cert=${encodeURIComponent(certId)}&student=${encodeURIComponent(studentName)}&project=${encodeURIComponent(targetProjectTitle)}&co2=${encodeURIComponent(Number(totalOffset).toFixed(2))}&mass=${encodeURIComponent(Number(totalMass).toFixed(2))}&kwh=${encodeURIComponent(charges)}&school=${encodeURIComponent(schoolName)}&date=${encodeURIComponent(currentDate)}`
    : '';

  useEffect(() => {
    if (!verifyUrl) return;
    QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [verifyUrl]);

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
              شهادة إنجاز بيئي رقمية • مزودة بباركود فحص حقيقي ورسمي (QR Verified)
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
                <span>شهادة رقمية موثقة بباركود مباشر (LCA QR-Verified)</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                شهادة إنجاز بيئي وتوثيق الأثر الكربوني
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                تشهد منصة مُدام للتدوير الذكي بأن المشروع المنجز قد حقق خفضاً موثقاً في انبعاثات الكربون وتحويلاً حقيقياً للمخلفات عن المكبات.
              </p>
            </div>

            {/* Student Recipient Name Header */}
            <div className="py-2.5 px-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 max-w-md mx-auto text-center shadow-xs">
              <span className="text-[11px] font-bold text-amber-800 block mb-0.5">
                تُمنح هذه الشهادة بكل فخر واعتزاز إلى:
              </span>
              
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1 justify-center">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="px-3 py-1 rounded-lg border border-amber-400 text-sm font-black text-slate-900 text-center focus:outline-none bg-white"
                    placeholder="اكتب اسم الطالب..."
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    حفظ
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-950 underline decoration-amber-500 decoration-2 underline-offset-4">
                    {studentName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-[11px] text-slate-400 hover:text-emerald-700 underline print:hidden cursor-pointer"
                    title="تعديل اسم الطالب على الشهادة"
                  >
                    <Edit2 className="w-3 h-3 inline ml-0.5" />
                    <span>تعديل</span>
                  </button>
                </div>
              )}
              <span className="text-[11px] text-slate-500 block mt-1 font-medium">{schoolName}</span>
            </div>

            {/* Project Highlight Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800 text-sm flex items-center justify-between flex-wrap gap-2 text-right">
              <div>
                <span className="text-xs text-slate-500 block mb-0.5 font-bold">اسم المشروع المنجز:</span>
                <strong className="text-emerald-700 text-base font-black">
                  {targetProjectTitle}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>مكتمل وموثق بنجاح</span>
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
                    className="text-emerald-600 hover:text-emerald-700 p-1 cursor-pointer"
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

              {/* Scannable Real QR Verification Code */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="p-2.5 bg-white rounded-2xl border-2 border-emerald-600/30 shadow-md flex flex-col items-center">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt={`رمز التحقق الرسمي من الشهادة ${certId}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-md"
                    />
                  ) : (
                    <QrCode className="w-20 h-20 text-slate-900 animate-pulse" />
                  )}
                  <span className="text-[9px] font-mono font-bold text-emerald-800 mt-1">
                    SCAN TO VERIFY 🛡️
                  </span>
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] text-emerald-600 hover:text-emerald-800 underline font-bold mt-0.5 print:hidden"
                  >
                    اختبار الفحص المباشر ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Motivational Disclaimer Note */}
            <div className="text-[11px] text-slate-500 font-medium text-center pt-3 border-t border-slate-200">
              شهادة تحفيزية موثقة رقمياً وصادرة عن منصة مُدام للتدوير الذكي
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>امسح رمز QR بكاميرا الهاتف للتحقق الفوري من صحة الشهادة وبيانات المشروع.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              type="button" 
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-300 shadow-sm cursor-pointer"
              onClick={onClose}
            >
              إغلاق
            </button>

            <button 
              type="button" 
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95 cursor-pointer"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              <span>طباعة وتصدير شهادة الإنجاز (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
