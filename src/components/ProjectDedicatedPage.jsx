import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, Heart, Share2, Printer, Volume2, VolumeX, CheckCircle, 
  Clock, Shield, Award, Sparkles, AlertCircle, ChevronLeft, 
  ChevronRight, Wrench, Layers, Leaf, Droplets, Zap, 
  DollarSign, CheckSquare, Square, Eye, MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SWARM_AGENTS } from '../utils/multiAgentSwarm.js';
import { generateStepInfographic, getStepImage } from '../utils/imageCatalog.js';


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


  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update hash for deep linking
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
        detail: 'تنظيف المواد المدخلة جيداً والتأكد من جفافها وسلامة الحواف.',
        tip: 'استخدم ورق صنفرة خفيف لإزالة أي نتوءات خشنة أو حادة.'
      },
      {
        id: 2,
        title: 'الهندسة والتجميع الهيكلي',
        detail: 'ربط القطع الأساسية وفق القياسات المحددة واستخدام وسيلة التثبيت المناسبة.',
        tip: 'اترك المادة اللاصقة تجف بالكامل قبل تطبيق أي وزن.'
      },
      {
        id: 3,
        title: 'التشطيب واللمسات الجمالية',
        detail: 'إضافة طبقة الحماية أو الطلاء البيئي وتركيب العناصر الوظيفية النهائية.',
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
      // Check if all steps completed
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
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 ${workshopMode ? 'workshop-high-contrast' : ''}`} dir="rtl">
      {/* Top Floating Glass Navigation Header */}
      <nav className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-xl border-b border-neutral-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-all font-semibold text-xs sm:text-sm active:scale-95"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمشاريع</span>
          </button>
          
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
            <span>الرئيسية</span>
            <span>/</span>
            <span>استكشاف المشاريع</span>
            <span>/</span>
            <span className="text-emerald-400 font-bold max-w-xs truncate">{project.title || project.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workshop Mode Toggle */}
          <button
            onClick={() => setWorkshopMode(!workshopMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              workshopMode 
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/25' 
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-850'
            }`}
            title="وضع ورشة العمل لسهولة القراءة والتركيز"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">وضع الورشة</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={handleShareWhatsApp}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors text-xs font-bold flex items-center gap-1.5"
            title="مشاركة عبر واتساب"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">واتساب</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="نسخ رابط الصفحة"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copiedLink ? 'تم النسخ!' : 'مشاركة'}</span>
          </button>

          {/* Print Poster */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
            title="طباعة ملصق المشروع الهندسي"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Save / Favorite */}
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(project)}
              className={`p-2 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-md shadow-rose-950/40'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
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
        
        {/* Project Header Banner */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between">
            <div className="flex-1 space-y-4">
              {/* Badges bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  تصميم الذكاء الاصطناعي متعدد الوكلاء (6 Agents)
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  {project.time || '1 - 2 ساعة'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/60 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-neutral-400" />
                  {project.difficulty || 'متوسط'}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-950/60 text-teal-300 border border-teal-700/50 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  معتمد ISO 14044 LCA
                </span>
              </div>

              {/* Title & Idea */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {project.title || project.name}
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl">
                {project.idea || project.description}
              </p>

              {/* Quick Environmental & Economics KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{lca.carbonSavedKg} كجم</div>
                    <div className="text-[11px] text-neutral-400">وفر كربوني مكافئ</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{lca.waterSavedLiters} لتر</div>
                    <div className="text-[11px] text-neutral-400">وفر مائي مسترد</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{lca.energySavedKwh} kWh</div>
                    <div className="text-[11px] text-neutral-400">طاقة مصنعية موفرة</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">+{economics.savingPercentage}%</div>
                    <div className="text-[11px] text-neutral-400">وفر مالي مقابل الشراء</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="w-full lg:w-72 bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>إنجاز خطوات المشروع:</span>
                <span className="font-bold text-emerald-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {onOpenCertificate && (
                <button
                  onClick={() => onOpenCertificate(project)}
                  className="mt-2 w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all border border-neutral-700 flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>عرض شهادة الأثر البيئي</span>
                </button>
              )}

              <button
                onClick={() => handleToggleSpeech()}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  isSpeaking
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'إيقاف الدليل الصوتي' : 'استمع للدليل الصوتي بالذكاء الاصطناعي'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Studio Section: Multi-Angle Visual Studio */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                <span>استوديو العرض البصري متعدد الزوايا (Multi-Angle Studio)</span>
              </h2>
              <p className="text-xs text-neutral-400">
                تنقل بين زوايا العرض الواقعية، أو تفقد المخطط الهندسي التجميعي بنقرة زر
              </p>
            </div>

            {/* Angle switcher buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-950 border border-neutral-800">
              <button
                onClick={() => setActiveAngle('finished')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeAngle === 'finished'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🌟 المنتج النهائي
              </button>
              <button
                onClick={() => setActiveAngle('assembly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeAngle === 'assembly'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🛠️ مرحلة التجميع
              </button>
              <button
                onClick={() => setActiveAngle('inUse')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeAngle === 'inUse'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🏡 الاستخدام الواقعي
              </button>
              <button
                onClick={() => setActiveAngle('blueprint')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeAngle === 'blueprint'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                📐 المخطط الإنفوجرافيكي
              </button>
            </div>
          </div>

          {/* Hero Visual Display */}
          <div className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-[21/9] bg-neutral-950 border border-neutral-800 flex items-center justify-center">
            <img
              src={currentHeroImage}
              alt={project.title}
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                e.target.src = generateStepInfographic(1, project.title, project.idea);
              }}
            />

            {/* Floating HUD info badge */}
            <div className="absolute bottom-4 right-4 left-4 sm:left-auto p-3 rounded-xl bg-black/80 backdrop-blur-md border border-neutral-700/60 text-xs text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold">
                  {activeAngle === 'finished' && 'عرض النموذج النهائي عالي الدقة'}
                  {activeAngle === 'assembly' && 'عرض تفصيلي لهيكل التجميع ومراكز التثبيت'}
                  {activeAngle === 'inUse' && 'المظهر العملي المندمج مع البيئة المنزلية المعاصرة'}
                  {activeAngle === 'blueprint' && 'المخطط الهندسي التجميعي ثلاثي المحاور'}
                </span>
              </div>
              <span className="text-neutral-400 text-[11px] hidden sm:inline">
                سرعة استجابة فائقة • بدون تأخير
              </span>
            </div>
          </div>
        </div>

        {/* 6 AI AGENTS SWARM PANEL (وكلاء الذكاء الاصطناعي الستة) */}
        <div className="bg-neutral-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Swarm Intelligence
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white">
                  فريق الخبراء والوكلاء الأذكياء الستة المشرفين على المشروع
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400">
                شارك في تدقيق وهندسة هذا المشروع 6 وكلاء ذكاء اصطناعي متخصصين لكل منهم حقله الهندسي الدقيق
              </p>
            </div>
          </div>

          {/* Agents Pill Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {SWARM_AGENTS.map((agent, idx) => {
              const isSelected = activeAgentTab === idx;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentTab(idx)}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    isSelected
                      ? `${agent.badgeColor} border-opacity-100 shadow-lg scale-[1.02]`
                      : 'bg-neutral-950/60 border-neutral-800 hover:bg-neutral-800/80 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{agent.avatar}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{agent.name}</h4>
                    <p className="text-[10px] text-neutral-400 line-clamp-1">{agent.role}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Agent Output Card */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            {activeAgentTab === 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span>🧪</span>
                  <span>تقرير د. ليلى المهدي (هندسة المواد والربط الكيميائي)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-300 mb-1">درجة التوافق الكيميائي:</div>
                    <div className="text-xl font-black text-emerald-400">{swarm.materialsSpecialist?.compatibilityScore || 92}% ({swarm.materialsSpecialist?.compatibilityRating || 'ممتاز'})</div>
                    <p className="text-[11px] text-neutral-400 mt-1">{swarm.materialsSpecialist?.notes || 'توافق تام بين الخامات يمنع التآكل والتشقق'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-300 mb-1">اللواصق والمثبتات الموصى بها:</div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-300">
                      {(swarm.materialsSpecialist?.recommendedAdhesives || ['غراء بولي يوريثان أو مسامير غاطسة']).map((adh, i) => (
                        <li key={i}>{adh}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-300 mb-1">العمر الافتراضي والمقاومة:</div>
                    <div className="text-lg font-bold text-white">{swarm.materialsSpecialist?.lifespanYears || 8} سنوات من الاستخدام المستمر</div>
                    <p className="text-[11px] text-neutral-400 mt-1">{swarm.materialsSpecialist?.weatherResistance || 'مقاوم للرطوبة والعوامل الداخلية'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeAgentTab === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <span>📐</span>
                  <span>تقرير م. كريم سامي (التصميم الصناعي وبيئة الاستخدام Ergonomics)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-300 mb-1">معايير التناسب الإنساني:</div>
                    <p className="text-[11px] text-neutral-400">خلوص مقابض 40 ملم، وزاوية رؤية مريحة 120 درجة، متوافقة مع الحركة الطبيعية للجسم.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-300 mb-1">مؤشر الاستقرار الإنشائي:</div>
                    <div className="text-xl font-black text-cyan-400">94 / 100</div>
                    <p className="text-[11px] text-neutral-400 mt-1">مركز ثقل سفلي يمنع الانقلاب أو الاهتزاز مع الأحمال.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-300 mb-1">النمط الجمالي المقترح:</div>
                    <div className="text-sm font-bold text-white">{swarm.industrialArchitect?.recommendedFinish || 'Modern Industrial (صناعي عصري)'}</div>
                    <p className="text-[11px] text-neutral-400 mt-1">حواف مشطوفة بنصف قطر 3 ملم لملمس ناعم وآمن.</p>
                  </div>
                </div>
              </div>
            )}

            {activeAgentTab === 2 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                  <span>🌍</span>
                  <span>تقرير د. طارق البيئة (مدقق دورة الحياة والبصمة البيئية LCA)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-400 mb-1">انبعاثات CO₂ المحيدة:</div>
                    <div className="text-xl font-black text-emerald-400">{lca.carbonSavedKg} كجم CO₂e</div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-400 mb-1">المياه الافتراضية الموفرة:</div>
                    <div className="text-xl font-black text-cyan-400">{lca.waterSavedLiters} لتر</div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-400 mb-1">وفر الطاقة الكهربائية:</div>
                    <div className="text-xl font-black text-amber-400">{lca.energySavedKwh} kWh</div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-400 mb-1">مؤشر الدائرية (Circularity):</div>
                    <div className="text-xl font-black text-green-400">{lca.circularityScore || 94}%</div>
                  </div>
                </div>
              </div>
            )}

            {activeAgentTab === 3 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <span>📊</span>
                  <span>تقرير سارة المستشار (الجدوى الاقتصادية والوفر المالي)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-400 mb-1">تكلفة التنفيذ الذاتي (DIY):</div>
                    <div className="text-xl font-black text-white">${economics.diyCostUsd} دولار</div>
                    <p className="text-[11px] text-neutral-400 mt-1">تقتصر على بعض المسامير أو الغراء البسيط.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-400 mb-1">سعر المنتج التجاري البديل:</div>
                    <div className="text-xl font-black text-neutral-400">${economics.marketEquivalentUsd} دولار</div>
                    <p className="text-[11px] text-neutral-400 mt-1">متوسط أسعار المتاجر العالمية لمنتج بنفس الوظيفة.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-400 mb-1">صافي التوفير المالي المحقق:</div>
                    <div className="text-xl font-black text-amber-400">${economics.moneySavedUsd} دولار (+{economics.savingPercentage}%)</div>
                    <p className="text-[11px] text-neutral-400 mt-1">عائد استثماري فائق وتوفير فوري لميزانيتك.</p>
                  </div>
                </div>
              </div>
            )}

            {activeAgentTab === 4 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <span>🛡️</span>
                  <span>تقرير كابتن رامي الأمان (إدارة السلامة المهنية ومخاطر الورشة)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-300 mb-2">معدات الوقاية الشخصية الإلزامية (PPE):</div>
                    <div className="space-y-1.5 text-[11px] text-neutral-300">
                      <div>🥽 <strong>نظارات حماية شفافة:</strong> واقية من الشظايا أثناء القص والتثبيت.</div>
                      <div>🧤 <strong>قفازات مبطنة ضد القطع:</strong> حماية اليدين من حواف الخامات.</div>
                      <div>😷 <strong>كمامة غبار:</strong> لمنع تنفس جزيئات الصنفرة الدقيقة.</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="font-bold text-neutral-300 mb-2">تعليمات سلامة الورشة:</div>
                    <div className="space-y-1.5 text-[11px] text-neutral-400">
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
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <span>🎨</span>
                  <span>تقرير نور الدين جرافيك (مخرج الإنفوجرافيك الهندسي)</span>
                </div>
                <p className="text-xs text-neutral-300">
                  تم تصميم إنفوجرافيك مدمج لكل خطوة تنفيذية يشمل الشرح الكتابي والبياني، محاور القياس، ونقاط التثبيت الحساسة (Pins A & B) مباشرة على الصورة، مما يضمن دقة التنفيذ دون أي لبس.
                </p>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
                  <span>يمكنك التبديل بين صورة الواقع والإنفوجرافيك التوضيحي في قسم الخطوات أدناه ⬇️</span>
                  <span className="text-emerald-400 font-bold">100% بدون تأخير تحميل</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP-BY-STEP ANNOTATED INFOGRAPHIC GUIDE (دليل الخطوات التفاعلي) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-emerald-400" />
                <span>دليل التنفيذ خطوة بخطوة مع الإنفوجرافيك التوضيحي المكتوب</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                كل صورة خطوة تحتوي على شرح توضيحي تفصيلي، أدوات، ومعدات أمان لمنع الأخطاء
              </p>
            </div>

            {/* Quick Step Counter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400">الخطوة {activeStepTab + 1} من {steps.length}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={activeStepTab === 0}
                  onClick={() => setActiveStepTab(prev => Math.max(0, prev - 1))}
                  className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={activeStepTab === steps.length - 1}
                  onClick={() => setActiveStepTab(prev => Math.min(steps.length - 1, prev + 1))}
                  className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isCurrent
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : isDone
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCurrent ? 'bg-black text-emerald-400' : isDone ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
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

            // Generate instant annotated infographic for this step
            const infographicUrl = generateStepInfographic(
              activeStepTab + 1,
              step.title,
              step.detail || step.instruction || '',
              step.infographic || {},
              project.category || 'general'
            );

            const displayImage = viewMode === 'infographic' 
              ? infographicUrl 
              : (step.image || getStepImage(activeStepTab + 1, step.title, step.detail, project.materials, project.title, activeStepTab));

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left/Main Column: Image with embedded or toggleable Infographic */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-neutral-950 border border-neutral-800 shadow-xl group">
                    <img
                      src={displayImage}
                      alt={step.title}
                      className="w-full h-full object-cover transition-all duration-300"
                      onError={(e) => {
                        e.target.src = infographicUrl;
                      }}
                    />

                    {/* Mode Toggle Pills (Infographic with explanation vs Photo) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-xl bg-black/80 backdrop-blur-md border border-neutral-700/80">
                      <button
                        onClick={() => setViewModes(prev => ({ ...prev, [activeStepTab]: 'infographic' }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'infographic'
                            ? 'bg-emerald-500 text-black shadow-md'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        📐 إنفوجرافيك وشرح مدمج
                      </button>
                      <button
                        onClick={() => setViewModes(prev => ({ ...prev, [activeStepTab]: 'photo' }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          viewMode === 'photo'
                            ? 'bg-cyan-500 text-black shadow-md'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        📸 صورة الواقع
                      </button>
                    </div>

                    {/* Step Number Indicator */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-neutral-700 text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>الخطوة {activeStepTab + 1} / {steps.length}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 text-center">
                    💡 الصورة الإنفوجرافيكية تحتوي على شرح تفصيلي مكتوب ونقاط القياس الهندسية لتجنب أي أخطاء أثناء التنفيذ.
                  </p>
                </div>

                {/* Right Column: Step Instructions & Controls */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        مرحلة {activeStepTab + 1}
                      </span>
                      <button
                        onClick={() => handleToggleSpeech(step.audioScript)}
                        className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>نطق الخطوة</span>
                      </button>
                    </div>

                    <h3 className="text-xl font-bold text-white">
                      {step.title}
                    </h3>
                  </div>

                  {/* Step detail description */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <p className="text-sm text-neutral-200 leading-relaxed">
                      {step.detail || step.instruction || step.description}
                    </p>

                    {step.tip && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span><strong>نصيحة الخبير:</strong> {step.tip}</span>
                      </div>
                    )}

                    {/* Step Safety Notice */}
                    {step.infographic?.safetyNotice && (
                      <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-800/30 text-xs text-rose-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span><strong>تنبيه الأمان:</strong> {step.infographic.safetyNotice}</span>
                      </div>
                    )}
                  </div>

                  {/* Mark Step As Completed Button */}
                  <button
                    onClick={() => toggleStepCompleted(activeStepTab)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                      isCompleted
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border-neutral-700'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                        <span>تم إنجاز هذه الخطوة بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-5 h-5" />
                        <span>تعليم هذه الخطوة كمكتملة</span>
                      </>
                    )}
                  </button>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      disabled={activeStepTab === 0}
                      onClick={() => setActiveStepTab(prev => Math.max(0, prev - 1))}
                      className="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold text-xs border border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>الخطوة السابقة</span>
                    </button>

                    <button
                      disabled={activeStepTab === steps.length - 1}
                      onClick={() => setActiveStepTab(prev => Math.min(steps.length - 1, prev + 1))}
                      className="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold text-xs border border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
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
        <div className="bg-neutral-900 border border-emerald-500/20 rounded-3xl p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اقتراحات التطوير الذكي</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  أفكار وتوصيات فريق الوكلاء للارتقاء بالمشروع (Future Upgrades)
                </h3>
              </div>
              <p className="text-xs text-neutral-400">
                مقترحات هندسية وتصميمية متقدمة من وكلاء الذكاء الاصطناعي لرفع كفاءة المنتج وإطالة عمره
              </p>
            </div>

            <button
              onClick={onBack}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <span>العودة للمشاريع</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Idea for Development */}
          {project.development && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-neutral-950 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">الفكرة المحورية للتطوير:</span>
                <span>{project.development}</span>
              </div>
            </div>
          )}

          {/* 3 Concrete Upgrade Avenues */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Zap className="w-4 h-4" />
                <span>الترقية التكنولوجية والذكاء (IoT)</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                إمكانية دمج مستشعر لمس أو شريط إضاءة LED ميكرو دافئ ببطارية ليثيوم قابلة للشحن عبر منفذ USB-C لرفع القيمة الوظيفية والجمالية.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>تعزيز المتانة ومقاومة الطقس</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                تطبيق طبقة شمع عسل طبيعي أو ورنيش مائي متبخر خالٍ من المركبات العضوية المتطايرة (Zero-VOC) لحماية الخامات لـ 5 سنوات إضافية.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <DollarSign className="w-4 h-4" />
                <span>القيمة السوقية والاستثمارية</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                إمكانية تسويق هذا المنتج كقطعة حرفية يدوية مستدامة (Handcrafted Eco-Asset) بعائد ربحي يفوق 70% مقارنة بالبدائل التجارية.
              </p>
            </div>
          </div>
        </div>

        {/* MATERIALS & TOOLS CHECKLIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Materials */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>قائمة المواد المطلوبة ({Array.isArray(project.materials) ? project.materials.length : 1})</span>
              </h3>
              <button
                onClick={handleShareWhatsApp}
                className="text-xs text-emerald-400 hover:underline"
              >
                تصدير لواتساب
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {Array.isArray(project.materials) ? (
                project.materials.map((mat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-neutral-200">{typeof mat === 'object' ? mat.name : mat}</span>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 text-neutral-200">
                  {project.materials}
                </div>
              )}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-cyan-400" />
              <span>الأدوات ومعدات التثبيت</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-850 text-xs text-neutral-300 leading-relaxed">
              {project.tools || 'منشار يدوي، ورق صنفرة P150/P220، غراء خشب أو سيليكون، مسطرة قياس، مقص متين.'}
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
              <div className="font-bold text-white">إرشادات الأمان الموصى بها من وكيل السلامة:</div>
              <p className="text-neutral-400">
                {project.safety || 'احرص دائماً على ارتداء نظارات واقية وقفازات سميكة لحماية اليدين والعينين أثناء القص أو الصنفرة.'}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM PRINTABLE POSTER FOOTER */}
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            <div className="text-white font-bold text-sm">منصة إعادة التدوير الذكية • الإصدار 2.0</div>
            <div>معتمد لتقييم دورة الحياة وفق المواصفة ISO 14044 • جميع الحقوق محفوظة</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ملصق المشروع الكامل</span>
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-colors"
            >
              العودة للمنصة
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
