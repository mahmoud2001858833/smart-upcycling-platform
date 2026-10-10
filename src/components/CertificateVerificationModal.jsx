import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  ExternalLink, 
  X, 
  Award, 
  Leaf, 
  Sparkles, 
  User, 
  School, 
  Calendar, 
  FileCheck, 
  ArrowLeft,
  Share2
} from 'lucide-react';

export default function CertificateVerificationModal({
  isOpen,
  onClose,
  verificationData,
  onOpenProjectStudio,
  onOpenStudentPortal
}) {
  if (!isOpen || !verificationData) return null;

  const {
    certId = 'CERT-LCA-VERIFIED-2026',
    studentName = 'طالب الابتكار البيئي',
    projectName = 'مشروع إعادة التدوير المبتكر',
    co2 = '3.50',
    mass = '2.10',
    kwh = '450',
    school = 'مدرسة التميز والاستدامة الخضراء',
    date = new Date().toLocaleDateString('ar-EG')
  } = verificationData;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `شهادة إنجاز بيئي موثقة - ${studentName}`,
        text: `تم التحقق بنجاح من إنجاز مشروع "${projectName}" للطالب/ة ${studentName} مع توفير ${co2} كجم CO2e عبر منصة مُدام!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط التحقق المباشر إلى الحافظة!');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10060] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 10060 }}
    >
      <div 
        className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        style={{ width: '100%', maxWidth: '680px', maxHeight: '92vh' }}
      >
        {/* Header with Verification Trust Banner */}
        <div className="p-4 sm:px-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  بوابة التحقق الرسمي من الشهادات
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold border border-emerald-400/30">
                  شهادة أصلية موثقة ✓
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                المنصة الوطنية الذكية لإعادة التدوير • نظام التحقق السحابي
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
            title="إغلاق نافذة التحقق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
          
          {/* Main Success Verification Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border-2 border-emerald-500/30 shadow-md text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />
            
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide block">
                توثيق معتمد من قاعدة بيانات LCA
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                شهادة إنجاز بيئي وحساب أثر كربوني صالحة
              </h2>
            </div>

            {/* Verification Code Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-mono font-black text-slate-800 dark:text-slate-200">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>الرقم المرجعي: {certId}</span>
            </div>
          </div>

          {/* Student & Project Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] font-bold">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                اسم الطالب / المبتكر المكرّم:
              </span>
              <p className="font-black text-slate-900 dark:text-white text-base">
                {studentName}
              </p>
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                طالب بيئي موثق 🎓
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] font-bold">
                <School className="w-3.5 h-3.5 text-emerald-600" />
                المدرسة / الجهة التعليمية:
              </span>
              <p className="font-black text-slate-900 dark:text-white text-base">
                {school}
              </p>
              <span className="text-[10px] text-slate-400 block">
                برنامج الاستدامة ومعارض العلوم المدرسية
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 sm:col-span-2">
              <span className="text-slate-400 flex items-center gap-1 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                المشروع المنجز والمقيّم هندسياً:
              </span>
              <p className="font-black text-emerald-700 dark:text-emerald-400 text-base sm:text-lg">
                {projectName}
              </p>
            </div>
          </div>

          {/* Environmental Impact Offsets Row */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-lg sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 block">
                +{co2}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block">
                كجم CO₂e خفض كربوني
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
              <span className="text-lg sm:text-2xl font-black text-teal-700 dark:text-teal-400 block">
                {mass}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block">
                كجم خامات محولة
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-lg sm:text-2xl font-black text-amber-700 dark:text-amber-400 block">
                {kwh}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 block">
                شحنة هاتف مكافئة
              </span>
            </div>
          </div>

          {/* Verification Metadata Footnote */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>تاريخ التوثيق: <strong>{date}</strong></span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة الرابط</span>
            </button>
          </div>
        </div>

        {/* Action Buttons to Navigate to Project & Student */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-300 dark:border-slate-700"
          >
            إغلاق نافذة التحقق
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenStudentPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStudentPortal();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>ملف الطالب وساعات التطوع</span>
              </button>
            )}

            {onOpenProjectStudio && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProjectStudio(verificationData);
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>فتح استوديو المشروع المعتمد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
