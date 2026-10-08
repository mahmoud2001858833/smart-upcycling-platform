import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Compass, Palette, ShieldCheck, Loader2 } from 'lucide-react';

const GENERATION_STAGES = [
  {
    step: 1,
    title: 'تحليل الخامات والمواد',
    detail: 'نحلل بنية المواد المدخلة وخصائصها الكيميائية والفيزيائية وطرق الربط الآمنة...',
    icon: Brain,
    percent: 22
  },
  {
    step: 2,
    title: 'هندسة وابتكار المشاريع',
    detail: 'نصمم 3 مشاريع متباينة (عملي نفعي، علمي تجريبي، وإبداعي فني) مخصصة لخاماتك...',
    icon: Compass,
    percent: 54
  },
  {
    step: 3,
    title: 'صياغة الخطوات وإرشادات السلامة',
    detail: 'نرتّب المراحل التنفيذية المتسلسلة والمخططات التوضيحية وتنبيهات الوقاية...',
    icon: ShieldCheck,
    percent: 78
  },
  {
    step: 4,
    title: 'توليد المشاهد البصرية وحساب الأثر',
    detail: 'نبتكر المشاهد البصرية ونحسب مؤشرات الجدوى والوفر الكربوني وفق منهجية LCA...',
    icon: Palette,
    percent: 92
  }
];

export default function GenerationProgressPanel({ onCancel }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(12);

  // Progressive rotating status messages and smooth progress increment
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStageIdx(prev => {
        if (prev < GENERATION_STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 6500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const target = GENERATION_STAGES[currentStageIdx]?.percent || 90;
        if (prev < target) return prev + 1;
        if (prev < 95) return prev + 0.3;
        return prev;
      });
    }, 250);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [currentStageIdx]);

  const currentStage = GENERATION_STAGES[currentStageIdx];
  const IconComponent = currentStage.icon;

  return (
    <div className="generation-progress-wrapper" dir="rtl">
      {/* Main Progress Card */}
      <div className="generation-progress-card">
        {/* Glow Header */}
        <div className="progress-card-header">
          <div className="progress-icon-badge">
            <IconComponent className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h3 className="progress-title">
              الذكاء الاصطناعي يبتكر مشاريعك الآن
            </h3>
            <p className="progress-subtitle">
              توليد حي حصري يستند إلى المواد والمهارات التي اخترتها
            </p>
          </div>
          <div className="progress-percentage-tag">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill"
            style={{ width: `${Math.min(96, Math.max(8, progress))}%` }}
          />
        </div>

        {/* Current Stage Highlight */}
        <div className="current-stage-box">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            <strong className="text-sm text-slate-800">
              المرحلة {currentStage.step} من 4: {currentStage.title}
            </strong>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {currentStage.detail}
          </p>
        </div>

        {/* Stage Timeline Steps */}
        <div className="progress-stages-timeline">
          {GENERATION_STAGES.map((stg, i) => {
            const isDone = i < currentStageIdx;
            const isCurrent = i === currentStageIdx;
            return (
              <div 
                key={stg.step} 
                className={`timeline-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''}`}
              >
                <div className="timeline-step-dot">
                  {isDone ? '✓' : stg.step}
                </div>
                <span className="timeline-step-label">{stg.title}</span>
              </div>
            );
          })}
        </div>

        {/* Friendly Time Notice */}
        <div className="progress-notice-footer">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            تستغرق هندسة المشاريع عادة من 15 إلى 35 ثانية لإنتاج خطط وخطوات دقيقة ومخططات توضيحية.
          </span>
        </div>
      </div>

      {/* Skeleton Cards Preview (Simulates upcoming 3 projects) */}
      <div className="skeletons-preview-container">
        <span className="skeletons-preview-title">
          جاري تجهيز بطاقات المشاريع الثلاثة...
        </span>

        <div className="skeletons-grid">
          {[
            { label: 'المشروع 1: عملي ونفعي', time: 'سهل • 30 دقيقة' },
            { label: 'المشروع 2: علمي وتجريبي', time: 'متوسط • 45 دقيقة' },
            { label: 'المشروع 3: إبداعي وفني', time: 'مبتكر • 60 دقيقة' }
          ].map((item, index) => (
            <div key={index} className="skeleton-project-card">
              <div className="skeleton-image-placeholder animate-shimmer">
                <span className="skeleton-placeholder-badge">{item.label}</span>
              </div>
              <div className="skeleton-content-area">
                <div className="skeleton-line title animate-shimmer" />
                <div className="skeleton-line snippet animate-shimmer" />
                <div className="skeleton-line snippet short animate-shimmer" />
                <div className="skeleton-footer-row">
                  <div className="skeleton-badge-pill animate-shimmer" />
                  <div className="skeleton-badge-pill animate-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
