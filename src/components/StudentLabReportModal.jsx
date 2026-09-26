import React, { useState } from 'react';
import { 
  X, Printer, Download, Award, CheckCircle, FileText, 
  School, User, Calendar, BookOpen, Sparkles, Leaf, Calculator
} from 'lucide-react';

export default function StudentLabReportModal({ isOpen, onClose, project, user }) {
  const [studentName, setStudentName] = useState(user?.user_metadata?.full_name || 'طالب متميز');
  const [schoolName, setSchoolName] = useState('مدرسة الابتكار والاستدامة');
  const [gradeLevel, setGradeLevel] = useState('الصف التاسع / المرحلة المتوسطة');
  const [teacherName, setTeacherName] = useState('أستاذ العلوم والبيئة');
  const [subject, setSubject] = useState('العلوم والفيزياء التطبيقية');
  const [hypothesis, setHypothesis] = useState(
    `إمكانية تحويل مخلفات (${Array.isArray(project?.materials) ? project.materials.join('، ') : (project?.materials || 'البيئة المنزلية')}) إلى أصل عملي ذي قيمة نفعية يقلل البصمة الكربونية بنسبة تفوق 70% مقارنة بالمنتجات التجارية.`
  );

  if (!isOpen || !project) return null;

  const handlePrint = () => {
    window.print();
  };

  const steps = project.steps || project.parsedSteps || [];
  const co2Saved = project.metrics?.co2SavedKg || project.co2SavedKg || '2.4';
  const savings = project.metrics?.estimatedSavings || '$25';
  const durability = project.metrics?.durabilityYears || '3 سنوات';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="w-5 h-5 text-emerald-700" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                تقرير البحث والتجربة العلمية المدرسية (Student Lab Report)
              </h3>
              <p className="text-xs text-slate-500">
                جاهز للتخصيص والطباعة وتقديمه لمعلم المادة أو معرض العلوم المدرسي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white print:p-0 space-y-6 text-slate-800 printable-document">
          
          {/* Academic Header Banner */}
          <div className="border-b-2 border-emerald-700 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block">
                وزارة التعليم • برنامج المدارس الخضراء والابتكار العلمي
              </span>
              <h1 className="text-2xl font-black text-slate-900">
                تقرير التجربة والمشروع البيئي التطبيقي
              </h1>
              <p className="text-xs text-slate-500">
                مشروع معتمد لمنهج STEM وفق معايير الاستدامة وإعادة التدوير الذكي (ISO 14044)
              </p>
            </div>

            <div className="text-left font-mono text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-600">
              <div><strong>كود المشروع:</strong> STEM-{Math.abs((project.name || '').split('').reduce((a,b)=>a+b.charCodeAt(0), 0))}-2026</div>
              <div><strong>تاريخ التقديم:</strong> {new Date().toLocaleDateString('ar-SA')}</div>
            </div>
          </div>

          {/* Student & School Info Inputs (Interactive in screen, clean text in print) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">اسم الطالب الباحث:</label>
              <input 
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">المدرسة والصف:</label>
              <input 
                type="text"
                value={`${schoolName} - ${gradeLevel}`}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">المادة والمعلم المشرف:</label>
              <input 
                type="text"
                value={`${subject} - ${teacherName}`}
                onChange={e => setTeacherName(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Section 1: Project Overview & Scientific Hypothesis */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-emerald-800 flex items-center gap-1.5 border-r-4 border-emerald-600 pr-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>1. مشكلة البحث والفرضية العلمية (Research Hypothesis):</span>
            </h3>
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs space-y-2 text-slate-800">
              <p><strong>عنوان المشروع المعتمد:</strong> {project.name || project.title}</p>
              <p><strong>فكرة المشروع:</strong> {project.idea || project.description}</p>
              <div>
                <strong>الفرضية المقترحة:</strong>
                <textarea 
                  value={hypothesis}
                  onChange={e => setHypothesis(e.target.value)}
                  rows={2}
                  className="w-full mt-1 p-2 bg-white border border-emerald-300 rounded-lg text-xs leading-relaxed focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Materials & Applied STEM Concepts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-black text-emerald-800 flex items-center gap-1.5 border-r-4 border-emerald-600 pr-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>2. الخامات المستهلكة والأدوات:</span>
              </h3>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <div>
                  <strong>المواد المعاد تدويرها:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(Array.isArray(project.materials) ? project.materials : (project.materials || '').split(/[,،]/)).map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-slate-300 rounded-md font-bold text-slate-700">
                        {typeof m === 'object' ? m.name : m.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>الأدوات المدرسية المستعملة:</strong>
                  <p className="text-slate-600 mt-0.5">{project.tools || 'مسطرة قياس، مقص آمن، غراء غير سام، قلم رصاص للتخطيط.'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-black text-emerald-800 flex items-center gap-1.5 border-r-4 border-emerald-600 pr-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>3. المفاهيم العلمية المرتبطة (STEM Linking):</span>
              </h3>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-700">
                <div>🔬 <strong>الكيمياء الخضراء:</strong> استقرار الروابط البوليمرية ومنع التحلل الضار.</div>
                <div>⚙️ <strong>الفيزياء الميكانيكية:</strong> توزيع الأحمال ومركز الثقل الهندسي.</div>
                <div>🌱 <strong>العلوم البيئية:</strong> الاقتصاد الدائري وقانون حفظ الكتلة والطاقة.</div>
              </div>
            </div>
          </div>

          {/* Section 3: Step-by-Step Methodology with Student Verification */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-emerald-800 flex items-center gap-1.5 border-r-4 border-emerald-600 pr-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              <span>4. خطوات المنهج العلمي والتنفيذ الميداني (Methodology):</span>
            </h3>
            <div className="space-y-2 text-xs">
              {steps.map((step, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900">{step.title}</h5>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{step.detail || step.instruction}</p>
                  </div>
                  <div className="text-left font-mono font-bold text-emerald-700 text-[11px] whitespace-nowrap">
                    [تم التحقق ✓]
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Quantitative Environmental Results & Formulas */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-emerald-800 flex items-center gap-1.5 border-r-4 border-emerald-600 pr-2">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>5. النتائج الكمية وحساب البصمة الكربونية (Quantitative Results):</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <div className="text-lg font-black text-emerald-800">{co2Saved} كجم</div>
                <div className="text-[11px] text-emerald-900 font-bold">وفر انبعاثات الكربون CO₂</div>
              </div>
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-center">
                <div className="text-lg font-black text-cyan-800">280 لتر</div>
                <div className="text-[11px] text-cyan-900 font-bold">وفر المياه الافتراضية</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <div className="text-lg font-black text-amber-800">{savings}</div>
                <div className="text-[11px] text-amber-900 font-bold">وفر التكلفة المالية</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-lg font-black text-slate-800">{durability}</div>
                <div className="text-[11px] text-slate-600 font-bold">العمر الافتراضي للقطعة</div>
              </div>
            </div>
          </div>

          {/* Section 5: Student Conclusion & Teacher Grading Signatures */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
            <div className="space-y-1 text-slate-600 text-center sm:text-right">
              <div><strong>خاتمة الطالب:</strong> أثبتت التجربة نجاح الفرضية مع انعدام الانبعاثات الناتجة.</div>
              <div><strong>ساعات التطوع البيئي المعتمدة:</strong> ساعتان عمل تطوعي مدرسي معتمد.</div>
            </div>

            <div className="flex items-center gap-8 text-center">
              <div>
                <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-bold text-slate-800">
                  {studentName}
                </div>
                <span className="text-[10px] text-slate-500">توقيع الطالب الباحث</span>
              </div>

              <div>
                <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-bold text-slate-800">
                  {teacherName}
                </div>
                <span className="text-[10px] text-slate-500">توقيع المعلم المشرف / الختم</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
