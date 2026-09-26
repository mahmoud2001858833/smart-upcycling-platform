import React, { useState } from 'react';
import { 
  X, Printer, CheckCircle, Award, Star, Shield, 
  Sparkles, Layers, Sliders, ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StudentRubricModal({ isOpen, onClose, project, user }) {
  const [studentName, setStudentName] = useState(user?.user_metadata?.full_name || 'طالب مبتكر');
  const [evaluatorName, setEvaluatorName] = useState('أستاذ التقييم والأنشطة المدرسية');
  
  // 5 standard criteria (20 points each = 100 max)
  const [scores, setScores] = useState({
    innovation: 18,
    durability: 19,
    environmentalImpact: 20,
    safetyCompliance: 19,
    presentationAndDoc: 18
  });

  const [teacherFeedback, setTeacherFeedback] = useState(
    'مشروع ممتاز ومكتمل الأركان الهندسية والبيئية. أظهر الطالب وعياً بيئياً رفيعاً مع التزام كامل بإجراءات السلامة المنزلية واستخدام بدائل آمنة.'
  );

  if (!isOpen || !project) return null;

  const totalScore = Object.values(scores).reduce((a, b) => a + Number(b), 0);

  const getGradeRating = (tot) => {
    if (tot >= 95) return { label: 'امتياز مع مرتبة الشرف البيئية ⭐', color: '#047857', badge: 'A+' };
    if (tot >= 85) return { label: 'ممتاز جداً 🌟', color: '#059669', badge: 'A' };
    if (tot >= 75) return { label: 'جيد جداً 🌿', color: '#0284c7', badge: 'B' };
    return { label: 'مقبول وقابل للتطوير 🌱', color: '#d97706', badge: 'C' };
  };

  const rating = getGradeRating(totalScore);

  const handleScoreChange = (key, val) => {
    setScores(prev => ({
      ...prev,
      [key]: Math.min(20, Math.max(0, Number(val)))
    }));
  };

  const handleCelebrate = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Award className="w-5 h-5 text-amber-700" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                استمارة تقييم المعلم الرسمية لمشروع التدوير (Evaluation Rubric)
              </h3>
              <p className="text-xs text-slate-500">
                معايير تحكيم أكاديمية معتمدة من 100 درجة للمدارس والمعارض العلمية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكشف</span>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 printable-document">
          
          {/* Top Info Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-1 text-center sm:text-right">
              <div><strong>المشروع المقيم:</strong> {project.name || project.title}</div>
              <div><strong>الطالب المنفّذ:</strong> {studentName}</div>
              <div><strong>المعلم المحكّم:</strong> {evaluatorName}</div>
            </div>

            <div className="p-3 bg-white border border-emerald-300 rounded-xl text-center shadow-xs flex items-center gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block">المجموع النهائي:</span>
                <span className="text-3xl font-black text-emerald-700">{totalScore}</span>
                <span className="text-xs text-slate-400"> / 100</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black block" style={{ color: rating.color }}>{rating.badge}</span>
                <span className="text-[11px] font-bold text-slate-600">{rating.label}</span>
              </div>
            </div>
          </div>

          {/* 5 Assessment Criteria Rows */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>معايير التقييم الخمسة (20 درجة لكل معيار):</span>
            </h4>

            {/* Criteria 1: Innovation */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block font-bold">1. الابتكار والأصالة الهندسية (Creativity & Originality)</strong>
                  <span className="text-slate-500 text-[11px]">توظيف ذكي للمواد وتحويلها لوظيفة غير تقليدية</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={scores.innovation} 
                    onChange={e => handleScoreChange('innovation', e.target.value)}
                    className="accent-emerald-600 w-28 cursor-pointer"
                  />
                  <span className="font-mono font-black text-emerald-800 text-sm w-7 text-left">{scores.innovation}/20</span>
                </div>
              </div>
            </div>

            {/* Criteria 2: Durability */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block font-bold">2. المتانة وجودة الصنع والتشطيب (Craftsmanship & Durability)</strong>
                  <span className="text-slate-500 text-[11px]">قوة التثبيت، استواء الأسطح، والقدرة على تحمل الاستعمال</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={scores.durability} 
                    onChange={e => handleScoreChange('durability', e.target.value)}
                    className="accent-emerald-600 w-28 cursor-pointer"
                  />
                  <span className="font-mono font-black text-emerald-800 text-sm w-7 text-left">{scores.durability}/20</span>
                </div>
              </div>
            </div>

            {/* Criteria 3: Eco Impact */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block font-bold">3. الأثر البيئي وتقليل الهدر (Environmental Benefit)</strong>
                  <span className="text-slate-500 text-[11px]">حجم النفايات المحيدة وتوفير الموارد واحتساب البصمة</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={scores.environmentalImpact} 
                    onChange={e => handleScoreChange('environmentalImpact', e.target.value)}
                    className="accent-emerald-600 w-28 cursor-pointer"
                  />
                  <span className="font-mono font-black text-emerald-800 text-sm w-7 text-left">{scores.environmentalImpact}/20</span>
                </div>
              </div>
            </div>

            {/* Criteria 4: Safety Compliance */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block font-bold">4. معايير الأمان والسلامة الشخصية (Safety Protocol)</strong>
                  <span className="text-slate-500 text-[11px]">ارتداء معدات الحماية، استخدام بدائل غير سامة، وخلو الحواف من الخطر</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={scores.safetyCompliance} 
                    onChange={e => handleScoreChange('safetyCompliance', e.target.value)}
                    className="accent-emerald-600 w-28 cursor-pointer"
                  />
                  <span className="font-mono font-black text-emerald-800 text-sm w-7 text-left">{scores.safetyCompliance}/20</span>
                </div>
              </div>
            </div>

            {/* Criteria 5: Presentation */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block font-bold">5. التوثيق والتقرير والعرض (Documentation & Presentation)</strong>
                  <span className="text-slate-500 text-[11px]">اكتمال التقرير البحثي، الصور، ودقة شرح الخطوات</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={scores.presentationAndDoc} 
                    onChange={e => handleScoreChange('presentationAndDoc', e.target.value)}
                    className="accent-emerald-600 w-28 cursor-pointer"
                  />
                  <span className="font-mono font-black text-emerald-800 text-sm w-7 text-left">{scores.presentationAndDoc}/20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Feedback Box */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-800 block">ملاحظات وتوصيات المعلم المشرف:</label>
            <textarea 
              value={teacherFeedback}
              onChange={e => setTeacherFeedback(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed focus:outline-emerald-600"
            />
          </div>

          {/* Actions & Celebration */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCelebrate}
              className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 text-emerald-700" />
              <span>اعتماد الدرجة وتهنئة الطالب 🎉</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer shadow-xs"
            >
              حفظ الاستمارة وإغلاق
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
