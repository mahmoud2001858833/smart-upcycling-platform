import React, { useState } from 'react';
import { 
  X, CheckCircle, AlertCircle, HelpCircle, Sparkles, 
  Award, ArrowRight, RotateCcw, Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StudentQuizModal({ isOpen, onClose, project, onAddPoints }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // 3 Tailored educational questions based on project context
  const questions = [
    {
      id: 1,
      question: `ما هو الأثر البيئي الأساسي لإنقاذ (${Array.isArray(project?.materials) ? project.materials[0] : (project?.materials || 'المواد')}) من الطمر في المكبات؟`,
      options: [
        { text: 'منع انبعاث غاز الميثان واحتجاز الكربون داخل دورة استخدام جديدة.', correct: true },
        { text: 'زيادة مساحة المكبات العمومية وزيادة رطوبة التربة.', correct: false },
        { text: 'تسريع عملية التحلل الكيميائي عبر الحرق الحراري.', correct: false }
      ],
      explanation: 'إعادة التدوير والتحويل (Upcycling) تمنع وصول المواد للمكبات حيث تتحلل لاهوائياً وتطلق غازات دفيئة خطيرة مثل الميثان وثاني أكسيد الكربون.'
    },
    {
      id: 2,
      question: 'لماذا يعتبر مفهوم (إعادة التدوير التصاعدي Upcycling) أكثر كفاءة من التدوير التقليدي (Recycling)؟',
      options: [
        { text: 'لأنه يستهلك طاقة كهربائية ومياه أقل بكثير ويحافظ على بنية المادة الأصلية ويعطيها قيمة أعلى.', correct: true },
        { text: 'لأنه يتطلب مصانع صهر ثقيلة وإعادة تشكيل حراري عند 1000 درجة.', correct: false },
        { text: 'لأنه ينتج مواد أقل جودة من المادة الخام الأصلية.', correct: false }
      ],
      explanation: 'الـ Upcycling يرفع من قيمة القطعة دون الحاجة لصهرها أو فرمها صناعياً، مما يوفر أكثر من 85% من الطاقة المصنعية المستهلكة.'
    },
    {
      id: 3,
      question: 'ما هو معيار السلامة الأهم الذي يجب على الطالب التحقق منه قبل استخدام المواد في الغرفة الصفية أو المنزل؟',
      options: [
        { text: 'التأكد من نظافة وجفاف المواد، خلوها من بقايا كيماوية، وصنفرة الحواف لتجنب الجروح.', correct: true },
        { text: 'استخدام أشد اللواصق الكيميائية حرارة وسرعة دون تهوية المكان.', correct: false },
        { text: 'قص المواد بدون تثبيتها بملزمة أو مسطرة معدنية.', correct: false }
      ],
      explanation: 'السلامة الميدانية هي الركيزة الأولى: تنظيف المواد، فحص خلوها من الملوثات، واستخدام أدوات آمنة مع ارتداء القفازات الواقية.'
    }
  ];

  if (!isOpen || !project) return null;

  const currentQ = questions[currentQIndex];
  const isAnswered = selectedAnswers[currentQIndex] !== undefined;

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQIndex]: idx
    }));
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setShowResults(true);
      // Count score
      let correctCount = 0;
      questions.forEach((q, qIdx) => {
        const userChoice = selectedAnswers[qIdx];
        if (userChoice !== undefined && q.options[userChoice]?.correct) {
          correctCount++;
        }
      });
      if (correctCount >= 2) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        if (onAddPoints) onAddPoints(correctCount * 10);
      }
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setShowResults(false);
  };

  // Calculate results
  let correctTotal = 0;
  questions.forEach((q, idx) => {
    if (q.options[selectedAnswers[idx]]?.correct) correctTotal++;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <Brain className="w-5 h-5 text-purple-700" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                تحدي المعرفة البيئية السريع للطلاب (STEM Quiz)
              </h3>
              <p className="text-xs text-slate-500">
                اختبر فهمك العلمي للمشروع واكسب نقاطاً إضافية في رصيدك
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!showResults ? (
            <div className="space-y-5">
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>السؤال {currentQIndex + 1} من {questions.length}</span>
                <span className="text-purple-700 font-bold">10 نقاط لكل إجابة صحيحة 🌱</span>
              </div>

              {/* Question title */}
              <h4 className="text-base font-black text-slate-900 leading-relaxed">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isChosen = selectedAnswers[currentQIndex] === oIdx;
                  let optStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800';
                  
                  if (isAnswered) {
                    if (opt.correct) {
                      optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs';
                    } else if (isChosen) {
                      optStyle = 'bg-rose-50 border-rose-300 text-rose-950';
                    } else {
                      optStyle = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-3.5 rounded-2xl border text-right text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${optStyle}`}
                    >
                      <span className="leading-relaxed font-medium">{opt.text}</span>
                      {isAnswered && opt.correct && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                      {isAnswered && isChosen && !opt.correct && (
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation note when answered */}
              {isAnswered && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-1 animate-fade-in">
                  <strong className="block font-bold text-purple-800">💡 التعليل العلمي المنهجي:</strong>
                  <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>{currentQIndex === questions.length - 1 ? 'عرض النتيجة النهائية' : 'السؤال التالي'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">
                  {correctTotal >= 2 ? 'رائع جداً! معرفة بيئية متقدمة 🌟' : 'محاولة جيدة، يمكنك المحاولة مجدداً 🌱'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  أجبت بشكل صحيح على {correctTotal} من أصل {questions.length} أسئلة علمية.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1 text-emerald-950 font-bold max-w-sm mx-auto">
                <span>+ {correctTotal * 10} نقطة بيئية مضافة لمحفظتك الأكاديمية! 🎓</span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة التحدي</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  متابعة العمل بالمشروع
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
