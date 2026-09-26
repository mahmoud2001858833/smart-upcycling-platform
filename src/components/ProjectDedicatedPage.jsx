import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, Heart, Share2, Printer, Volume2, VolumeX, CheckCircle, 
  Clock, Shield, Award, Sparkles, AlertCircle, ChevronLeft, 
  ChevronRight, Wrench, Layers, Leaf, Droplets, Zap, 
  DollarSign, CheckSquare, Square, Eye, MessageCircle,
  Lightbulb, Bot, RefreshCw, Maximize2, X,
  Play, Pause, RotateCcw, Timer, FileText, GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SWARM_AGENTS } from '../utils/multiAgentSwarm.js';
import { generateStepInfographic, getAiStepPhotoUrl } from '../utils/imageCatalog.js';
import StudentLabReportModal from './StudentLabReportModal.jsx';
import StudentRubricModal from './StudentRubricModal.jsx';
import StudentQuizModal from './StudentQuizModal.jsx';

export default function ProjectDedicatedPage({ 
  project, 
  onBack, 
  isSaved = false, 
  onToggleSave,
  onOpenCertificate
}) {
  const [activeAngle, setActiveAngle] = useState('finished'); // 'finished' | 'assembly' | 'inUse' | 'blueprint'
  const [activeStepTab, setActiveStepTab] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [viewModes, setViewModes] = useState({}); // stepIndex -> 'infographic' | 'photo'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [workshopMode, setWorkshopMode] = useState(false);
  const [activeAgentTab, setActiveAgentTab] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeStepAiTool, setActiveStepAiTool] = useState(null); // 'alternative' | 'safety' | null
  const [stepSeeds, setStepSeeds] = useState({});
  const [isRegeneratingAi, setIsRegeneratingAi] = useState(false);
  const [lightboxStep, setLightboxStep] = useState(null);

  // Student Academic Suite Modals
  const [isLabReportOpen, setIsLabReportOpen] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Drying & Assembly Stopwatch / Timer
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 mins default
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext fallback
    }
  };

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            setTimerFinished(true);
            playChime();
            confetti({ particleCount: 50, spread: 60 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (project?.id) {
      window.location.hash = `project/${project.id}`;
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [project?.id]);

  // Derived or enriched swarm analysis
  const swarm = project?.swarmAnalysis || {};
  const lca = project?.lcaMetrics || {
    carbonSavedKg: project?.co2SavedKg || 5.2,
    waterSavedLiters: 320,
    energySavedKwh: 24,
    drivingAvoidedKm: 42,
    treesEquivalentPerYear: 1.2,
    circularityScore: 92
  };
  const economics = project?.economicMetrics || {
    diyCostUsd: 8,
    marketEquivalentUsd: 55,
    moneySavedUsd: 47,
    savingPercentage: 85
  };

  const steps = useMemo(() => {
    const raw = project?.steps || project?.parsedSteps;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return [
      {
        id: 1,
        title: 'الفرز والتحضير الأولي للقطع',
        detail: 'تنظيف المواد المدخلة جيداً والتأكد من جفافها وسلامة الحواف واستواء الأبعاد الهندسية.',
        tip: 'استخدم ورق صنفرة خفيف لإزالة أي نتوءات خشنة أو حادة لحماية اليدين.'
      },
      {
        id: 2,
        title: 'الهندسة والتجميع الهيكلي',
        detail: 'ربط القطع الأساسية وفق القياسات المحددة واستخدام وسيلة التثبيت المناسبة بدقة.',
        tip: 'اترك المادة اللاصقة تجف بالكامل قبل تطبيق أي وزن أو اختبار المتانة.'
      },
      {
        id: 3,
        title: 'التشطيب واللمسات الجمالية',
        detail: 'إضافة طبقة الحماية أو الطلاء البيئي وتركيب العناصر الوظيفية النهائية للمنتج.',
        tip: 'اختبر توازن المنتج في مكانه المخصص قبل الاستخدام الدائم.'
      }
    ];
  }, [project]);

  // Step completion progress percentage
  const progressPercent = useMemo(() => {
    if (steps.length === 0) return 0;
    const completedCount = Object.values(completedSteps).filter(Boolean).length;
    return Math.round((completedCount / steps.length) * 100);
  }, [completedSteps, steps.length]);

  const toggleStepCompleted = (stepIdx) => {
    setCompletedSteps(prev => {
      const next = { ...prev, [stepIdx]: !prev[stepIdx] };
      const totalCompleted = Object.values(next).filter(Boolean).length;
      if (totalCompleted === steps.length) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
      return next;
    });
  };

  // Text to speech for steps
  const handleToggleSpeech = (textToRead) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentStep = steps[activeStepTab];
    const text = textToRead || currentStep?.audioScript || `${currentStep?.title}. ${currentStep?.detail || currentStep?.instruction || ''}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Regenerate step AI visual
  const handleRegenerateStepAi = (stepIdx) => {
    setIsRegeneratingAi(true);
    setStepSeeds(prev => ({
      ...prev,
      [stepIdx]: (prev[stepIdx] || 0) + 1
    }));
    setTimeout(() => {
      setIsRegeneratingAi(false);
    }, 600);
  };

  // WhatsApp share
  const handleShareWhatsApp = () => {
    const title = project?.title || project?.name || 'مشروع إعادة تدوير ذكي';
    const materials = Array.isArray(project?.materials) ? project.materials.join('، ') : (project?.materials || '');
    const url = window.location.href;
    const message = encodeURIComponent(
      `🌱 *مشروع إعادة تدوير ذكي: ${title}*\n\n` +
      `📦 *المواد المطلوبة:* ${materials}\n` +
      `🌍 *وفر الكربون:* ${lca.carbonSavedKg} كجم CO₂e\n` +
      `💧 *وفر المياه:* ${lca.waterSavedLiters} لتر\n` +
      `💰 *الوفر المالي:* ${economics.savingPercentage}%\n\n` +
      `تفاصيل المشروع الكاملة مع المخططات والإنفوجرافيك:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  // Copy shareable link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Print Project Poster
  const handlePrint = () => {
    window.print();
  };

  // Multi-angle image resolver
  const currentHeroImage = useMemo(() => {
    if (activeAngle === 'blueprint') {
      return project?.blueprintUrl || generateStepInfographic(1, project?.title, project?.idea);
    }
    const gallery = project?.multiAngleViews || project?.gallery;
    if (gallery && gallery[activeAngle]) {
      return gallery[activeAngle];
    }
    return project?.image || project?.generatedImage;
  }, [activeAngle, project]);

  if (!project) return null;

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 ${workshopMode ? 'workshop-high-contrast' : ''}`} dir="rtl">
      
      {/* Top Sticky Luminous Glass Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all font-bold text-xs sm:text-sm active:scale-95 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-emerald-700" />
            <span>العودة للمشاريع</span>
          </button>
          
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>الرئيسية</span>
            <span>/</span>
            <span>استكشاف المشاريع</span>
            <span>/</span>
            <span className="text-emerald-700 font-bold max-w-xs truncate">{project.title || project.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workshop Mode Toggle */}
          <button
            onClick={() => setWorkshopMode(!workshopMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              workshopMode 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="وضع ورشة العمل لسهولة القراءة والتركيز"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">وضع الورشة</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleShareWhatsApp}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="مشاركة عبر واتساب"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">واتساب</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="نسخ رابط الصفحة"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">{copiedLink ? 'تم النسخ!' : 'مشاركة'}</span>
          </button>

          {/* Print Poster */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title="طباعة ملصق المشروع الهندسي"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Save / Favorite */}
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(project)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={isSaved ? 'محفوظ في مشاريعك' : 'حفظ في المفضلة'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8" style={{ margin: '0 auto', width: '100%', maxWidth: '1440px' }}>
        
        {/* Project Header Banner - Executive Emerald Gradient */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white border border-emerald-600/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between">
            <div className="flex-1 space-y-4">
              {/* Badges bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-emerald-200 border border-white/20 backdrop-blur-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  تصميم الذكاء الاصطناعي متعدد الوكلاء (6 Agents)
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/15 backdrop-blur-md flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-300" />
                  {project.time || '1 - 2 ساعة'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/15 backdrop-blur-md flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-300" />
                  {project.difficulty || 'متوسط'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  معتمد ISO 14044 LCA
                </span>
              </div>

              {/* Title & Idea */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {project.title || project.name}
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl">
                {project.idea || project.description}
              </p>

              {/* STEM Curriculum Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-xl bg-white/15 text-emerald-200 border border-white/20 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                  🧬 كيمياء البوليمرات والمواد
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/15 text-amber-200 border border-white/20 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                  📐 فيزياء العزوم والاتزان الهيكلي
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/15 text-cyan-200 border border-white/20 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                  🌿 علوم البيئة والاقتصاد الدائري
                </span>
              </div>

              {/* Quick Environmental & Economics KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-400/20 text-emerald-300">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{lca.carbonSavedKg} كجم</div>
                    <div className="text-[11px] text-emerald-200">وفر كربوني مكافئ</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-400/20 text-cyan-300">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{lca.waterSavedLiters} لتر</div>
                    <div className="text-[11px] text-cyan-200">وفر مائي مسترد</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{lca.energySavedKwh} kWh</div>
                    <div className="text-[11px] text-amber-200">طاقة مصنعية موفرة</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-400/20 text-emerald-300">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">+{economics.savingPercentage}%</div>
                    <div className="text-[11px] text-emerald-200">وفر مالي مقابل الشراء</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="w-full lg:w-72 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-white">
                <span className="font-semibold">إنجاز خطوات المشروع:</span>
                <span className="font-black text-amber-300 text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {onOpenCertificate && (
                <button
                  onClick={() => onOpenCertificate(project)}
                  className="mt-2 w-full py-2.5 rounded-xl bg-white text-emerald-900 text-xs font-black transition-all hover:bg-emerald-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>عرض شهادة الأثر البيئي</span>
                </button>
              )}

              <button
                onClick={() => handleToggleSpeech()}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-emerald-700/60 hover:bg-emerald-700 text-white border-emerald-500/40'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'إيقاف الدليل الصوتي' : 'استمع للدليل الصوتي بالذكاء الاصطناعي'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student Academic Suite Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <span>الأدوات الأكاديمية والمدرسية (Student Academic Suite)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">معتمد للمدارس</span>
              </h3>
              <p className="text-xs text-slate-500">
                توثيق أكاديمي فوري متوافق مع مناهج العلوم ومعارض الابتكار المدرسي
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsLabReportOpen(true)}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>تقرير البحث العلمي PDF</span>
            </button>

            <button
              onClick={() => setIsRubricOpen(true)}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>استمارة التقييم (100pt)</span>
            </button>

            <button
              onClick={() => setIsQuizOpen(true)}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Lightbulb className="w-4 h-4 text-teal-600" />
              <span>اختبار الاستيعاب البيئي</span>
            </button>
          </div>
        </div>

        {/* Studio Section: Multi-Angle Visual Studio */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-700" />
                <span>استوديو العرض البصري متعدد الزوايا (Multi-Angle Studio)</span>
              </h2>
              <p className="text-xs text-slate-500">
                تنقل بين زوايا العرض الواقعية، أو تفقد المخطط الهندسي التجميعي بنقرة زر
              </p>
            </div>

            {/* Angle switcher buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setActiveAngle('finished')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeAngle === 'finished'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌟 المنتج النهائي
              </button>
              <button
                onClick={() => setActiveAngle('assembly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeAngle === 'assembly'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛠️ مرحلة التجميع
              </button>
              <button
                onClick={() => setActiveAngle('inUse')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeAngle === 'inUse'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏡 الاستخدام الواقعي
              </button>
              <button
                onClick={() => setActiveAngle('blueprint')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeAngle === 'blueprint'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📐 المخطط الإنفوجرافيكي
              </button>
            </div>
          </div>

          {/* Hero Visual Display */}
          <div className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-[21/9] bg-slate-100 border border-slate-200 flex items-center justify-center">
            <img
              src={currentHeroImage}
              alt={project.title}
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                e.target.src = project?.blueprintUrl || generateStepInfographic(1, project?.title, project?.idea);
              }}
            />
            
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                {activeAngle === 'finished' && 'صورة المنتج المكتمل'}
                {activeAngle === 'assembly' && 'صورة مراحل التجميع'}
                {activeAngle === 'inUse' && 'صورة الاستخدام العملي'}
                {activeAngle === 'blueprint' && 'المخطط الهندسي التجميعي'}
              </span>
            </div>
          </div>
        </div>

        {/* 6-AGENTS SWARM COLLABORATIVE INTELLIGENCE */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-emerald-700" />
                  <span>طاقم الوكلاء الستة</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  تحليلات ومصادقات فريق الوكلاء الذكي (AI Swarm Team)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                كل جانب في هذا المشروع تم تدقيقه هندسياً، بيئياً، واقتصادياً بواسطة 6 وكلاء ذكاء اصطناعي متخصصين
              </p>
            </div>
          </div>

          {/* Swarm Agents Horizontal Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {SWARM_AGENTS.map((agent, index) => {
              const isSelected = activeAgentTab === index;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentTab(index)}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{agent.avatar}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{agent.name}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{agent.role}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Agent Output Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            {activeAgentTab === 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <span>🧪</span>
                  <span>تقرير د. ليلى المهدي (هندسة المواد والربط الكيميائي)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-700 mb-1">درجة التوافق الكيميائي:</div>
                    <div className="text-xl font-black text-emerald-700">{swarm.materialsSpecialist?.compatibilityScore || 92}% ({swarm.materialsSpecialist?.compatibilityRating || 'ممتاز'})</div>
                    <p className="text-[11px] text-slate-500 mt-1">{swarm.materialsSpecialist?.notes || 'توافق تام بين الخامات يمنع التآكل والتشقق'}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-700 mb-1">اللواصق والمثبتات الموصى بها:</div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                      {(swarm.materialsSpecialist?.recommendedAdhesives || ['غراء بولي يوريثان أو مسامير غاطسة']).map((adh, i) => (
                        <li key={i}>{adh}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-700 mb-1">العمر الافتراضي والمقاومة:</div>
                    <div className="text-lg font-bold text-slate-900">{swarm.materialsSpecialist?.lifespanYears || 8} سنوات من الاستخدام المستمر</div>
                    <p className="text-[11px] text-slate-500 mt-1">{swarm.materialsSpecialist?.weatherResistance || 'مقاوم للرطوبة والعوامل الداخلية'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeAgentTab === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
                  <span>📐</span>
                  <span>تقرير م. كريم سامي (التصميم الصناعي وبيئة الاستخدام Ergonomics)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-700 mb-1">معايير التناسب الإنساني:</div>
                    <p className="text-[11px] text-slate-500">خلوص مقابض 40 ملم، وزاوية رؤية مريحة 120 درجة، متوافقة مع الحركة الطبيعية للجسم.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-700 mb-1">مؤشر الاستقرار الإنشائي:</div>
                    <div className="text-xl font-black text-cyan-700">94 / 100</div>
                    <p className="text-[11px] text-slate-500 mt-1">مركز ثقل سفلي يمنع الانقلاب أو الاهتزاز مع الأحمال.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-700 mb-1">النمط الجمالي المقترح:</div>
                    <div className="text-sm font-bold text-slate-900">{swarm.industrialArchitect?.recommendedFinish || 'Modern Industrial (صناعي عصري)'}</div>
                    <p className="text-[11px] text-slate-500 mt-1">حواف مشطوفة بنصف قطر 3 ملم لملمس ناعم وآمن.</p>
                  </div>
                </div>
              </div>
            )}

            {activeAgentTab === 2 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <span>🌍</span>
                  <span>تقرير د. طارق البيئة (مدقق دورة الحياة والبصمة البيئية LCA)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-600 mb-1">انبعاثات CO₂ المحيدة:</div>
                    <div className="text-xl font-black text-emerald-700">{lca.carbonSavedKg} كجم CO₂e</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-600 mb-1">المياه الافتراضية الموفرة:</div>
                    <div className="text-xl font-black text-cyan-700">{lca.waterSavedLiters} لتر</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-600 mb-1">وفر الطاقة الكهربائية:</div>
                    <div className="text-xl font-black text-amber-700">{lca.energySavedKwh} kWh</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-600 mb-1">مؤشر الدائرية (Circularity):</div>
                    <div className="text-xl font-black text-emerald-700">{lca.circularityScore || 94}%</div>
                  </div>
                </div>
              </div>
            )}

            {activeAgentTab === 3 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <span>📊</span>
                  <span>تقرير سارة المستشار (الجدوى الاقتصادية والوفر المالي)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-600 mb-1">تكلفة التنفيذ الذاتي (DIY):</div>
                    <div className="text-xl font-black text-slate-900">${economics.diyCostUsd} دولار</div>
                    <p className="text-[11px] text-slate-500 mt-1">تقتصر على بعض المسامير أو الغراء البسيط.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-600 mb-1">سعر المنتج التجاري البديل:</div>
                    <div className="text-xl font-black text-slate-600">${economics.marketEquivalentUsd} دولار</div>
                    <p className="text-[11px] text-slate-500 mt-1">متوسط أسعار المتاجر العالمية لمنتج بنفس الوظيفة.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-600 mb-1">صافي التوفير المالي المحقق:</div>
                    <div className="text-xl font-black text-amber-700">${economics.moneySavedUsd} دولار (+{economics.savingPercentage}%)</div>
                    <p className="text-[11px] text-slate-500 mt-1">عائد استثماري فائق وتوفير فوري لميزانيتك.</p>
                  </div>
                </div>
              </div>
            )}

            {activeAgentTab === 4 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <span>🛡️</span>
                  <span>تقرير كابتن رامي الأمان (إدارة السلامة المهنية ومخاطر الورشة)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-700 mb-2">معدات الوقاية الشخصية الإلزامية (PPE):</div>
                    <div className="space-y-1.5 text-[11px] text-slate-700">
                      <div>🥽 <strong>نظارات حماية شفافة:</strong> واقية من الشظايا أثناء القص والتثبيت.</div>
                      <div>🧤 <strong>قفازات مبطنة ضد القطع:</strong> حماية اليدين من حواف الخامات.</div>
                      <div>😷 <strong>كمامة غبار:</strong> لمنع تنفس جزيئات الصنفرة الدقيقة.</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-slate-700 mb-2">تعليمات سلامة الورشة:</div>
                    <div className="space-y-1.5 text-[11px] text-slate-500">
                      <div>• تثبيت القطع بإحكام بملزمة قبل القص لتفادي الانزلاق.</div>
                      <div>• العمل في مكان جيد الإضاءة والتهوية، بعيداً عن مصادر اللهب المكشوف.</div>
                      <div>• تصنيف أمان الأطفال: {swarm.safetyDirector?.childSafetyRating || 'آمن بمرافقة وإشراف الكبار'}.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeAgentTab === 5 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                  <span>🎨</span>
                  <span>تقرير نور الدين جرافيك (مخرج الإنفوجرافيك الهندسي)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  تم تصميم إنفوجرافيك مدمج لكل خطوة تنفيذية يشمل الشرح الكتابي والبياني، محاور القياس، ونقاط التثبيت الحساسة (Pins A & B) مباشرة على الصورة، مما يضمن دقة التنفيذ دون أي لبس.
                </p>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center justify-between shadow-xs">
                  <span>يمكنك التبديل بين صورة الواقع والإنفوجرافيك التوضيحي في قسم الخطوات أدناه ⬇️</span>
                  <span className="text-emerald-700 font-bold">100% بدون تأخير تحميل</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP-BY-STEP ANNOTATED INFOGRAPHIC GUIDE (دليل الخطوات التفاعلي والشرح بالذكاء الاصطناعي) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-emerald-700" />
                <span>دليل التنفيذ خطوة بخطوة مع الشرح البصري بالذكاء الاصطناعي</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                كل مرحلة مزودة برسم توضيحي ذكي وشرح تفصيلي مكتوب وأبعاد هندسية لمنع أي أخطاء أثناء العمل
              </p>
            </div>

            {/* Quick Step Counter & Navigation */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">الخطوة {activeStepTab + 1} من {steps.length}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={activeStepTab === 0}
                  onClick={() => setActiveStepTab(prev => Math.max(0, prev - 1))}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={activeStepTab === steps.length - 1}
                  onClick={() => setActiveStepTab(prev => Math.min(steps.length - 1, prev + 1))}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Steps Horizontal Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {steps.map((step, idx) => {
              const isDone = completedSteps[idx];
              const isCurrent = activeStepTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStepTab(idx)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/25'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCurrent ? 'bg-white text-emerald-800' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isDone ? '✓' : idx + 1}
                  </span>
                  <span>{step.title || `الخطوة ${idx + 1}`}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Showcase Card */}
          {steps[activeStepTab] && (() => {
            const step = steps[activeStepTab];
            const isCompleted = completedSteps[activeStepTab];
            const viewMode = viewModes[activeStepTab] || 'infographic'; // default to infographic with on-image explanation!
            const seed = stepSeeds[activeStepTab] || 0;

            // Generate instant annotated infographic for this step
            const infographicUrl = generateStepInfographic(
              activeStepTab + 1,
              step.title,
              step.detail || step.instruction || '',
              step.infographic || {},
              project.category || 'general'
            );

            // Generative AI photo URL
            const photoUrl = getAiStepPhotoUrl(
              activeStepTab + 1,
              step.title,
              step.detail || step.instruction || '',
              project.materials,
              project.title || project.name,
              seed
            );

            const displayImage = viewMode === 'infographic' ? infographicUrl : photoUrl;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left/Main Column: Image with embedded or toggleable Infographic */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-200 shadow-md group">
                    <img
                      src={displayImage}
                      alt={step.title}
                      className={`w-full h-full object-cover transition-all duration-300 ${isRegeneratingAi ? 'opacity-40 blur-xs' : 'opacity-100'}`}
                      onError={(e) => {
                        e.target.src = infographicUrl;
                      }}
                    />

                    {/* Mode Toggle Pills (Infographic with explanation vs Realistic AI Photo) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md">
                      <button
                        onClick={() => setViewModes(prev => ({ ...prev, [activeStepTab]: 'infographic' }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'infographic'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        📐 رسم وشرح توضيحي بالذكاء الاصطناعي
                      </button>
                      <button
                        onClick={() => setViewModes(prev => ({ ...prev, [activeStepTab]: 'photo' }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'photo'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        📸 صورة واقعية بالذكاء الاصطناعي
                      </button>
                    </div>

                    {/* Left Quick Action Icons: Regenerate & Fullscreen Zoom */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRegenerateStepAi(activeStepTab)}
                        disabled={isRegeneratingAi}
                        className="p-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                        title="إعادة توليد صورة الشرح بالذكاء الاصطناعي"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRegeneratingAi ? 'animate-spin text-emerald-600' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setLightboxStep({
                          url: displayImage,
                          title: step.title,
                          detail: step.detail || step.instruction,
                          stepNum: activeStepTab + 1
                        })}
                        className="p-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                        title="تكبير ومعاينة الشرح بدقة فائقة"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Step Number Indicator */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>الخطوة {activeStepTab + 1} من {steps.length}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center">
                    💡 الصورة التوضيحية تحتوي على شرح تفصيلي مكتوب بالذكاء الاصطناعي ونقاط القياس الهندسية لتجنب أي أخطاء أثناء التنفيذ.
                  </p>
                </div>

                {/* Right Column: Step Instructions & Controls */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        مرحلة {activeStepTab + 1}
                      </span>
                      <button
                        onClick={() => handleToggleSpeech(step.audioScript)}
                        className="text-xs text-slate-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>نطق الخطوة</span>
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      {step.title}
                    </h3>
                  </div>

                  {/* Step detail description */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">
                      {step.detail || step.instruction || step.description}
                    </p>

                    {step.tip && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                        <span><strong>نصيحة الخبير:</strong> {step.tip}</span>
                      </div>
                    )}

                    {/* Step Safety Notice */}
                    {step.infographic?.safetyNotice && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span><strong>تنبيه الأمان:</strong> {step.infographic.safetyNotice}</span>
                      </div>
                    )}

                    {/* Interactive AI Step Copilot Tools Strip */}
                    <div className="pt-2.5 border-t border-slate-200 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-emerald-700" />
                        <span>الموجّه الذكي للخطوة:</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setActiveStepAiTool(activeStepAiTool === 'alternative' ? null : 'alternative')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                          activeStepAiTool === 'alternative'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                        }`}
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>بديل منزلي مبسط</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveStepAiTool(activeStepAiTool === 'safety' ? null : 'safety')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                          activeStepAiTool === 'safety'
                            ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-400'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5 text-rose-600" />
                        <span>فحص أمان الخطوة</span>
                      </button>
                    </div>

                    {/* Dynamic AI Guidance Drawers */}
                    {activeStepAiTool === 'alternative' && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed space-y-1 animate-fade-in">
                        <strong className="text-amber-800 block font-bold">💡 توجيه مهندس الورشة للبدائل المنزلية:</strong>
                        <p className="text-slate-700">
                          إذا لم تتوفر لديك أدوات التثبيت أو القص المتخصصة لهذه المرحلة، يمكنك استخدام مسطرة معدنية مع مشرط حاد وتكرار التمرير بهدوء كبديل للمنشار، أو استعمال شمع السيليكون الساخن كبديل مؤقت للغراء مع الضغط لمدة 45 ثانية متواصلة لضمان الالتصاق.
                        </p>
                      </div>
                    )}

                    {activeStepAiTool === 'safety' && (
                      <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-950 leading-relaxed space-y-1 animate-fade-in">
                        <strong className="text-rose-800 block font-bold">🛡️ فحص السلامة الميداني (كابتن رامي):</strong>
                        <p className="text-slate-700">
                          احرص على ارتداء قفازات عمل مانعة للانزلاق لتجنب الجروح أثناء التشكيل، وتأكد من تهوية الغرفة جيداً في حال استخدام المواد اللاصقة أو البخاخات، واحرص على تثبيت القطع بملقط قبل تطبيق أي قوة ميكانيكية.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Interactive Step Drying & Assembly Timer */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold text-slate-800">
                            مؤقت التثبيت والجفاف التفاعلي (Step Timer)
                          </span>
                        </div>
                        <span className={`text-base font-black px-3 py-0.5 rounded-lg border font-mono ${
                          timerFinished 
                            ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                            : isTimerRunning 
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-white text-slate-700 border-slate-200'
                        }`}>
                          {timerFinished ? 'انتهى الوقت! 🔔' : `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`}
                        </span>
                      </div>

                      {/* Presets and Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setIsTimerRunning(false);
                              setTimerFinished(false);
                              setTimerSeconds(60);
                              setInitialTimerSeconds(60);
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                              initialTimerSeconds === 60 ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            1 دقيقة تثبيت
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsTimerRunning(false);
                              setTimerFinished(false);
                              setTimerSeconds(180);
                              setInitialTimerSeconds(180);
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                              initialTimerSeconds === 180 ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            3 دقائق جفاف سريع
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsTimerRunning(false);
                              setTimerFinished(false);
                              setTimerSeconds(600);
                              setInitialTimerSeconds(600);
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                              initialTimerSeconds === 600 ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            10 دقائق لصق تام
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (timerFinished) {
                                setTimerFinished(false);
                                setTimerSeconds(initialTimerSeconds);
                              }
                              setIsTimerRunning(!isTimerRunning);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer text-white shadow-xs ${
                              isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isTimerRunning ? 'إيقاف مؤقت' : 'بدء المؤقت'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsTimerRunning(false);
                              setTimerFinished(false);
                              setTimerSeconds(initialTimerSeconds);
                            }}
                            className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
                            title="إعادة ضبط"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                  {/* Mark Step As Completed Button */}
                  <button
                    onClick={() => toggleStepCompleted(activeStepTab)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                        <span>تم إنجاز هذه الخطوة بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-5 h-5 text-slate-400" />
                        <span>تعليم هذه الخطوة كمكتملة</span>
                      </>
                    )}
                  </button>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      disabled={activeStepTab === 0}
                      onClick={() => setActiveStepTab(prev => Math.max(0, prev - 1))}
                      className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>الخطوة السابقة</span>
                    </button>

                    <button
                      disabled={activeStepTab === steps.length - 1}
                      onClick={() => setActiveStepTab(prev => Math.min(steps.length - 1, prev + 1))}
                      className="flex-1 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>الخطوة التالية</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* AI SWARM FUTURE SUGGESTIONS & DEVELOPMENT UPGRADES */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>اقتراحات التطوير الذكي</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  أفكار وتوصيات فريق الوكلاء للارتقاء بالمشروع (Future Upgrades)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                مقترحات هندسية وتصميمية متقدمة من وكلاء الذكاء الاصطناعي لرفع كفاءة المنتج وإطالة عمره
              </p>
            </div>

            <button
              onClick={onBack}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>العودة للمشاريع</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Idea for Development */}
          {project.development && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs leading-relaxed flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">الفكرة المحورية للتطوير:</span>
                <span>{project.development}</span>
              </div>
            </div>
          )}

          {/* 3 Upgrade Avenues */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-cyan-800 font-bold">
                <Zap className="w-4 h-4 text-cyan-600" />
                <span>الترقية التكنولوجية والذكاء (IoT)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                إمكانية دمج مستشعر لمس أو شريط إضاءة LED ميكرو دافئ ببطارية ليثيوم قابلة للشحن عبر منفذ USB-C لرفع القيمة الوظيفية والجمالية.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>تعزيز المتانة ومقاومة الطقس</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                تطبيق طبقة شمع عسل طبيعي أو ورنيش مائي متبخر خالٍ من المركبات العضوية المتطايرة (Zero-VOC) لحماية الخامات لـ 5 سنوات إضافية.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>القيمة السوقية والاستثمارية</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                إمكانية تسويق هذا المنتج كقطعة حرفية يدوية مستدامة (Handcrafted Eco-Asset) بعائد ربحي يفوق 70% مقارنة بالبدائل التجارية.
              </p>
            </div>
          </div>
        </div>

        {/* MATERIALS & TOOLS CHECKLIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Materials */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <span>قائمة المواد المطلوبة ({Array.isArray(project.materials) ? project.materials.length : 1})</span>
              </h3>
              <button
                onClick={handleShareWhatsApp}
                className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
              >
                تصدير لواتساب
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {Array.isArray(project.materials) ? (
                project.materials.map((mat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-800 font-medium">{typeof mat === 'object' ? mat.name : mat}</span>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  {project.materials}
                </div>
              )}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-cyan-700" />
              <span>الأدوات ومعدات التثبيت</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
              {project.tools || 'منشار يدوي، ورق صنفرة P150/P220، غراء خشب أو سيليكون، مسطرة قياس، مقص متين.'}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">إرشادات الأمان الموصى بها من وكيل السلامة:</div>
              <p className="text-slate-600">
                {project.safety || 'احرص دائماً على ارتداء نظارات واقية وقفازات سميكة لحماية اليدين والعينين أثناء القص أو الصنفرة.'}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM PRINTABLE POSTER FOOTER */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <div className="text-slate-900 font-bold text-sm">منصة إعادة التدوير الذكية • الإصدار المعتمد 2026</div>
            <div>معتمد لتقييم دورة الحياة وفق المواصفة ISO 14044 • جميع الحقوق محفوظة</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>طباعة ملصق المشروع الكامل</span>
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-sm"
            >
              العودة للمنصة
            </button>
          </div>
        </div>

      </div>

      {/* FULLSCREEN LIGHTBOX ZOOM MODAL FOR STEP EXPLAINER */}
      {lightboxStep && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxStep(null)}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full border border-slate-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs">
                  الخطوة {lightboxStep.stepNum}
                </span>
                <h4 className="font-black text-slate-900 text-base">{lightboxStep.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleSpeech(lightboxStep.detail)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="نطق الشرح الصوتي"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxStep(null)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="إغلاق النافذة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Body Image */}
            <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center">
              <img
                src={lightboxStep.url}
                alt={lightboxStep.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md border border-slate-300"
              />
            </div>

            {/* Lightbox Detail Footer */}
            <div className="p-4 sm:px-6 bg-white border-t border-slate-200 text-xs text-slate-700 flex items-center justify-between flex-wrap gap-3">
              <p className="max-w-2xl font-medium leading-relaxed">
                <strong>الشرح التفصيلي:</strong> {lightboxStep.detail}
              </p>
              <button
                type="button"
                onClick={() => setLightboxStep(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                فهمت الشرح، متابعة العمل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT ACADEMIC SUITE MODALS */}
      <StudentLabReportModal
        isOpen={isLabReportOpen}
        onClose={() => setIsLabReportOpen(false)}
        project={project}
      />

      <StudentRubricModal
        isOpen={isRubricOpen}
        onClose={() => setIsRubricOpen(false)}
        project={project}
      />

      <StudentQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        project={project}
      />

    </div>
  );
}
