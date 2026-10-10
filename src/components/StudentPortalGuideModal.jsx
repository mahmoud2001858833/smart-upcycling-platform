import React, { useState } from 'react';
import { 
  X, 
  Lightbulb, 
  BookOpen, 
  FileText, 
  Award, 
  Calculator, 
  ShieldCheck, 
  Clock, 
  QrCode, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';

export default function StudentPortalGuideModal({ isOpen, onClose }) {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  if (!isOpen) return null;

  const features = [
    {
      id: 'projects',
      title: 'مشاريع معارض العلوم المنهجية (STEM Projects)',
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      tag: 'مناهج العلوم والفيزياء والكيمياء',
      summary: 'مشاريع تطبيقية مصنفة لأربع مراحل تعليمية (ابتدائي، متوسط، ثانوي، جامعي) تربط العلوم النظرية بالحياة اليومية.',
      targetAudience: 'الطلاب والمعلمون ومنسقو الأنشطة المدرسية',
      learningOutcomes: [
        'تطبيق المنهج العلمي: وضع فرضية تجريبية (Hypothesis) واختبارها عملياً.',
        'فهم فيزياء المواد وكيمياء اللواصق وقوانين الحركة وديناميكا الحرارة.',
        'تحويل النفايات إلى وسائل تعليمية ونماذج أولية منخفضة التكلفة.'
      ],
      howToUse: 'اختر مرحلتك التعليمية من شريط الفلترة، استعرض المشاريع المناسبة لعمرك، ثم انقر على "تطبيق المشروع" لفتح خطوات العمل المفصلة أو توليد تقرير مختبر.'
    },
    {
      id: 'lab-report',
      title: 'مختبر التقارير العلمية الآلي (Lab Report Generator)',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      tag: 'جاهز للطباعة والتحكيم الأكاديمي',
      summary: 'أداة ذكية تصيغ تقريراً علمياً كاملاً بصيغة أكاديمية موحدة بمجرد اختيار أي مشروع في البوابة.',
      targetAudience: 'المشاركون في المعارض العلمية، مسابقات STEM، وواجبات العلوم',
      learningOutcomes: [
        'تدريب الطالب على التوثيق العلمي الدقيق وفق معايير IEEE و APA.',
        'تدوين المتغيرات المستقلة والتابعة، أدوات القياس، ومصادر الخطأ التجريبي.',
        'توثيق وفر الكربون والكتلة المحولة بالأرقام والرسوم البيانية.'
      ],
      howToUse: 'انقر على زر "توليد تقرير المختبر (Lab Report)" في أي بطاقة مشروع، ستفتح نافذة تحتوي على التقرير الأكاديمي جاهزاً للمراجعة والتنزيل أو الطباعة كـ PDF.'
    },
    {
      id: 'rubric',
      title: 'مصفوفة تقييم المعلم الرسمية (Rubric 100pt)',
      icon: <Award className="w-5 h-5 text-amber-600" />,
      tag: 'معايير تقييم دولية معتمدة',
      summary: 'استمارة تحكيم تفاعلية بـ 100 درجة مخصصة للمعلمين ولجان المعارض لتقييم المشاريع بموضوعية وشفافية.',
      targetAudience: 'المعلمون، لجان التحكيم، والطلاب للتقييم الذاتي (Self-Assessment)',
      learningOutcomes: [
        'أصالة الفكرة وحل المشكلات الهندسية (25 درجة).',
        'الأثر البيئي وحساب خفض البصمة الكربونية (25 درجة).',
        'معايير السلامة واستبدال الأدوات الخطرة (25 درجة).',
        'العرض التقديمي وجودة النموذج الأولي (25 درجة).'
      ],
      howToUse: 'اضغط على زر "مصفوفة التقييم (Rubric)" لتحديد درجات كل معيار، وحساب النتيجة النهائية وطباعة كشف الدرجات الرسمي للطالب.'
    },
    {
      id: 'calculator',
      title: 'حاسبة القص والكميات الهندسية (Cutting & Yield Calculator)',
      icon: <Calculator className="w-5 h-5 text-purple-600" />,
      tag: 'تقليل الهدر وتعظيم الاستفادة',
      summary: 'حاسبة هندسية تحسب للطالب أفضل اتجاه لتقطيع ألواح الكرتون أو الخشب لاستخراج أكبر عدد قطع ممكن مع حساب نسبة الهدر بدقة.',
      targetAudience: 'الطلاب أثناء مرحلة التخطيط والقص، وورش التصنيع المدرسي',
      learningOutcomes: [
        'استيعاب مفاهيم المساحة السطحية وتوزيع الأبعاد الهندسية (2D Packing).',
        'غرس ثقافة تقليل الهدر المادي والمالي قبل البدء بالقص الفعلي.',
        'حساب دقيق لعدد الألواح الخام المطلوبة للنشاط الصفي.'
      ],
      howToUse: 'انتقل لتبويب "حاسبة القص والكميات"، أدخل أبعاد اللوح المتوفر لديك وأبعاد القطعة المطلوبة والعدد، وستعطيك الحاسبة كفاءة التقطيع ونسبة الهدر فوراً.'
    },
    {
      id: 'safety-substitutions',
      title: 'دليل البدائل الآمنة للأدوات الصفية (Safe Tool Substitutions)',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      tag: 'أمان مدرسي 100% خالي من المخاطر',
      summary: 'جدول بدائل هندسية يحول الأدوات الخطرة (المشارط الحادة، مسدس الغراء الساخن، المثاقب، البخاخات) إلى بدائل صفية آمنة.',
      targetAudience: 'معلمو الصفوف الابتدائية والمتوسطة وأولياء الأمور في المنزل',
      learningOutcomes: [
        'الوقاية الكاملة من الإصابات والحروق الحرارية داخل الصفوف والمنازل.',
        'استخدام مواد لاصقة عضوية بديلة كغراء النشا وغراء الخشب المائي.',
        'تعلم تقنيات الطي والضغط الميكانيكي بدلاً من القطع الحاد المباشر.'
      ],
      howToUse: 'استعرض تبويب "دليل البدائل الآمنة" قبل بدء أي مشروع لاختيار الأدوات البديلة المناسبة لمرحلة الطالب العمرية.'
    },
    {
      id: 'volunteer-hours',
      title: 'سجل واعتماد ساعات التطوع البيئي (Volunteer Hours Tracker)',
      icon: <Clock className="w-5 h-5 text-teal-600" />,
      tag: 'متطلب خدمة المجتمع المدرسية',
      summary: 'نظام رقمي لتسجيل ساعات العمل البيئي التي يقضيها الطالب في جمع وفرز وإعادة تدوير الخامات ليتم اعتمادها رسمياً.',
      targetAudience: 'طلاب المرحلتين الثانوية والجامعية ومتطلبات التخرج المجتمعي',
      learningOutcomes: [
        'تعزيز روح المبادرة والمسؤولية المجتمعية تجاه البيئة المحلية.',
        'توثيق رقمي لساعات التطوع وربطها بكمية النفايات التي تم تحويلها.',
        'إصدار سجل رسمي معتمد يمكن إرفاقه في السيرة الذاتية وملف التقديم للجامعات.'
      ],
      howToUse: 'سجل المشاريع التي نفذتها في تبويب "ساعات التطوع"، واضغط "توثيق واعتماد الساعات" لزيادة رصيدك البيئي في قاعدة البيانات.'
    },
    {
      id: 'qr-certificate',
      title: 'شهادة الإنجاز الموثقة بالباركود (QR Verified Eco Certificate)',
      icon: <QrCode className="w-5 h-5 text-slate-800" />,
      tag: 'باركود فحص سحابي مباشر',
      summary: 'شهادة إنجاز رقمية تصدر للطالب وتحتوي على رمز QR حقيقي. بمجرد مسح الرمز بكاميرا أي هاتف، يفتح نظام التحقق الرسمي ويعرض بيانات الطالب والمشروع.',
      targetAudience: 'الطلاب المتميزون، المعلمون لتقديم الجوائز، والجهات المحكمة',
      learningOutcomes: [
        'تكريم الطالب وتقدير جهوده الملموسة في حماية البيئة وخفض الانبعاثات.',
        'إثبات رسمي لمصداقية الإنجاز دون إمكانية التزوير بفضل الباركود المرجعي.',
        'إمكانية انتقال المحكّم أو ولي الأمر مباشرة من الباركود إلى استوديو المشروع لمشاهدة الخطوات والأثر.'
      ],
      howToUse: 'عند إتمام أي مشروع أو تقييم LCA، اضغط "عرض وطباعة شهادة الإنجاز". يمكنك تعديل اسم الطالب ومسح الباركود بهاتفك للتأكد من ربطه المباشر بالمنصة.'
    }
  ];

  const currentFeature = features[activeFeatureIndex];

  return (
    <div 
      className="fixed inset-0 z-[10070] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 10070 }}
    >
      <div 
        className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        style={{ width: '100%', maxWidth: '900px', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Lightbulb className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  دليل وشرح ميزات البوابة الأكاديمية والمدرسية
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                  دليل المعلم والطالب 📖
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                تعرف على كيفية استثمار كل أداة في الصف، معارض العلوم، ومسابقات STEM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700 cursor-pointer"
            title="إغلاق الدليل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout: Sidebar tabs + Content area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-72 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 p-3 sm:p-4 overflow-y-auto space-y-1.5 flex-shrink-0 max-h-48 md:max-h-full">
            <span className="text-[11px] font-bold text-slate-400 px-2 block mb-1">
              اختر ميزة لاستعراض شرحها:
            </span>
            {features.map((feat, idx) => {
              const isSelected = activeFeatureIndex === idx;
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => setActiveFeatureIndex(idx)}
                  className={`w-full p-2.5 rounded-2xl text-right transition-all flex items-center gap-2.5 cursor-pointer text-xs font-bold ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-400/50 shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <span className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0">
                    {feat.icon}
                  </span>
                  <div className="flex-1 truncate">
                    <span className="block truncate">{feat.title}</span>
                    <span className="text-[10px] text-slate-400 block font-normal truncate">
                      {feat.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Feature Detail Area */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-6 bg-slate-50 dark:bg-slate-950">
            {/* Title & Tag */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-black border border-emerald-300 dark:border-emerald-700">
                  {currentFeature.tag}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  الفئة المستهدفة: <strong>{currentFeature.targetAudience}</strong>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{currentFeature.title}</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                {currentFeature.summary}
              </p>
            </div>

            {/* Learning Outcomes & Objectives */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>المخرجات التعليمية والمهارات المكتسبة:</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {currentFeature.learningOutcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practical How to Use Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800/80 border border-amber-200 dark:border-emerald-900 space-y-2">
              <h4 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>كيفية الاستخدام في الحصة الصفية أو المنزل:</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {currentFeature.howToUse}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>معاً لترسيخ الابتكار الأخضر في المدارس والجامعات.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            فهمت، العودة للبوابة
          </button>
        </div>
      </div>
    </div>
  );
}
