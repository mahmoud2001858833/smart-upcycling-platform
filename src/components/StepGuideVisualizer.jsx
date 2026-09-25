import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  CheckCheck, 
  ArrowRight, 
  ArrowLeft, 
  Wrench,
  Sparkles
} from 'lucide-react';

export default function StepGuideVisualizer({ project, onBackToProjects }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});

  if (!project || !project.steps || project.steps.length === 0) {
    return (
      <div className="glass-card step-guide-box" style={{ textAlign: 'center', padding: '3rem' }}>
        <p>الرجاء اختيار مشروع من قسم المسح والمشاريع أولاً.</p>
        <button className="btn-submit-action" onClick={onBackToProjects} style={{ marginTop: '1rem' }}>
          <span>العودة للمشاريع</span>
        </button>
      </div>
    );
  }

  const steps = project.steps;
  const currentStep = steps[currentStepIdx] || steps[0];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentStep.imagePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const toggleStepCompleted = (idx) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="step-guide-section">
      <div className="glass-card glow-card step-guide-box">
        {/* Top Header */}
        <div className="step-timeline-header">
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '0.4rem' }}>
              {project.trackLabel}
            </span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>{project.title}</h2>
            <p style={{ fontSize: '0.88rem' }}>{project.titleEn}</p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={onBackToProjects}>
              <ArrowRight size={16} />
              <span>تبديل المشروع</span>
            </button>
          </div>
        </div>

        {/* Required Tools Bar */}
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '0.9rem 1.2rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald-400)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Wrench size={16} />
            <span>قائمة الأدوات المطلوبة:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {project.toolsNeeded.map((tool, idx) => (
              <span key={idx} className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Step Progression Pills */}
        <div className="step-indicators-nav" style={{ marginBottom: '2rem' }}>
          {steps.map((step, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isDone = completedSteps[idx];
            return (
              <button
                key={step.stepNumber}
                type="button"
                className={`step-indicator-btn ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                onClick={() => setCurrentStepIdx(idx)}
              >
                {isDone ? <Check size={14} color="#10b981" /> : <span>{step.stepNumber}</span>}
                <span>الخطوة {step.stepNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Step Details & Blueprint Grid */}
        <div className="step-details-grid">
          {/* Left Column: Instructions and Copyable Prompt */}
          <div className="step-info-col">
            <span className="step-number-tag">المرحلة {currentStep.stepNumber} من {steps.length}</span>
            <h3>{currentStep.title}</h3>
            <p className="step-desc">{currentStep.description}</p>

            {/* Complete Step Checkbox */}
            <label style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              cursor: 'pointer', 
              fontSize: '0.88rem',
              color: completedSteps[currentStepIdx] ? 'var(--emerald-400)' : 'var(--text-secondary)',
              marginTop: '0.4rem'
            }}>
              <input 
                type="checkbox" 
                checked={!!completedSteps[currentStepIdx]} 
                onChange={() => toggleStepCompleted(currentStepIdx)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--emerald-500)' }}
              />
              <span>تحديد هذه الخطوة كمكتملة</span>
            </label>

            {/* Dedicated Midjourney/Flux/SDXL Prompt Card */}
            <div className="image-prompt-card">
              <div className="prompt-card-header">
                <span>
                  <Sparkles size={14} />
                  <span>موجه توليد المشهد (Midjourney / SDXL Prompt):</span>
                </span>
                <button 
                  type="button" 
                  className="copy-prompt-btn"
                  onClick={handleCopyPrompt}
                  title="نسخ الموجه للمحفظة"
                >
                  {copiedPrompt ? (
                    <>
                      <CheckCheck size={14} color="#10b981" />
                      <span style={{ color: '#10b981' }}>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>نسخ الموجه</span>
                    </>
                  )}
                </button>
              </div>

              <div className="prompt-text-code">
                {currentStep.imagePrompt}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Blueprint Render */}
          <div className="blueprint-visual-frame">
            <div className="blueprint-grid-overlay"></div>
            <span className="blueprint-badge">Blueprint Schematic v2.4</span>

            {/* Dynamic Step Schematic SVG Illustration */}
            <svg 
              viewBox="0 0 340 240" 
              style={{ width: '100%', maxWidth: '320px', height: 'auto', zIndex: 1 }}
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Common Blueprint Grid Elements */}
              <circle cx="170" cy="120" r="95" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
              <line x1="20" y1="120" x2="320" y2="120" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="6 6" opacity="0.3" />
              <line x1="170" y1="20" x2="170" y2="220" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="6 6" opacity="0.3" />

              {/* Step Specific Renderings */}
              {currentStepIdx === 0 && (
                <g>
                  {/* Bottle cutaway */}
                  <rect x="130" y="50" width="80" height="140" rx="20" stroke="#38bdf8" strokeWidth="2.5" fill="rgba(56, 189, 248, 0.08)" />
                  <path d="M150 50 L150 35 L190 35 L190 50" stroke="#38bdf8" strokeWidth="2" />
                  {/* Horizontal cut line */}
                  <line x1="110" y1="110" x2="230" y2="110" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="6 3" />
                  <polygon points="105,110 115,105 115,115" fill="#f43f5e" />
                  <polygon points="235,110 225,105 225,115" fill="#f43f5e" />
                  <text x="170" y="102" fill="#f43f5e" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">CUT LINE (1/3 H)</text>
                  {/* Measurement labels */}
                  <text x="75" y="113" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Δh = 12cm</text>
                </g>
              )}

              {currentStepIdx === 1 && (
                <g>
                  {/* Denim fabric wicking strips */}
                  <rect x="90" y="95" width="160" height="45" rx="4" stroke="#3b82f6" strokeWidth="2" fill="rgba(59, 130, 246, 0.15)" />
                  {/* Weave pattern */}
                  <line x1="90" y1="110" x2="250" y2="110" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="90" y1="125" x2="250" y2="125" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 2" />
                  {/* Capillary arrows */}
                  <path d="M120 160 L120 145" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M170 160 L170 145" stroke="#10b981" strokeWidth="2" />
                  <path d="M220 160 L220 145" stroke="#10b981" strokeWidth="2" />
                  <text x="170" y="80" fill="#60a5fa" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">COTTON DENIM TWILL (25cm x 2.5cm)</text>
                  <text x="170" y="180" fill="#10b981" fontSize="9" fontFamily="sans-serif" textAnchor="middle">CAPILLARY FLUID CONDUCTION</text>
                </g>
              )}

              {currentStepIdx === 2 && (
                <g>
                  {/* Inverted Funnel & Reservoir Assembly */}
                  <rect x="135" y="120" width="70" height="80" rx="8" stroke="#38bdf8" strokeWidth="2" fill="rgba(6, 182, 212, 0.1)" />
                  {/* Water reservoir */}
                  <rect x="137" y="160" width="66" height="38" rx="4" fill="rgba(14, 165, 233, 0.3)" />
                  {/* Inverted funnel */}
                  <path d="M120 70 L220 70 L180 135 L160 135 Z" stroke="#38bdf8" strokeWidth="2" fill="rgba(56, 189, 248, 0.15)" />
                  {/* Wick passing through */}
                  <path d="M170 85 Q165 130 170 180" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
                  <text x="170" y="60" fill="#38bdf8" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">UPPER SOIL CHAMBER</text>
                  <text x="170" y="215" fill="#0284c7" fontSize="9" fontFamily="sans-serif" textAnchor="middle">WATER RESERVOIR (250ml)</text>
                </g>
              )}

              {currentStepIdx === 3 && (
                <g>
                  {/* Cardboard Tray with Denim wrap */}
                  <rect x="80" y="90" width="180" height="70" rx="8" stroke="#f59e0b" strokeWidth="2" fill="rgba(245, 158, 11, 0.1)" />
                  <rect x="90" y="85" width="160" height="80" rx="6" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" fill="none" />
                  <circle cx="115" cy="125" r="18" stroke="#06b6d4" strokeWidth="1.5" />
                  <circle cx="170" cy="125" r="18" stroke="#06b6d4" strokeWidth="1.5" />
                  <circle cx="225" cy="125" r="18" stroke="#06b6d4" strokeWidth="1.5" />
                  <text x="170" y="70" fill="#f59e0b" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">CARDBOARD MODULAR REINFORCED BASE</text>
                  <text x="170" y="190" fill="#60a5fa" fontSize="9" fontFamily="sans-serif" textAnchor="middle">WRAPPED WITH RAW DENIM FABRIC</text>
                </g>
              )}

              {currentStepIdx >= 4 && (
                <g>
                  {/* Final thriving planter */}
                  <rect x="135" y="125" width="70" height="70" rx="6" stroke="#38bdf8" strokeWidth="2" fill="rgba(6, 182, 212, 0.15)" />
                  <path d="M120 75 L220 75 L180 135 L160 135 Z" stroke="#38bdf8" strokeWidth="2" fill="rgba(56, 189, 248, 0.2)" />
                  <path d="M170 90 Q165 130 170 170" stroke="#3b82f6" strokeWidth="4" />
                  {/* Sprouted plant */}
                  <path d="M170 75 C160 50 140 45 140 35 C155 35 168 55 170 75" fill="#10b981" />
                  <path d="M170 75 C180 50 200 45 200 35 C185 35 172 55 170 75" fill="#34d399" />
                  <circle cx="170" cy="30" r="4" fill="#fbbf24" />
                  <text x="170" y="215" fill="#10b981" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">AUTONOMOUS 14-DAY WICKING ACTIVE</text>
                </g>
              )}
            </svg>

            <p style={{ fontSize: '0.78rem', color: 'var(--cyan-400)', marginTop: '0.8rem', zIndex: 1 }}>
              مخطط هندسي تقني للمرحلة رقم {currentStep.stepNumber}
            </p>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="step-nav-footer">
          <button 
            type="button" 
            className="btn-secondary"
            disabled={currentStepIdx === 0}
            onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
          >
            <ArrowRight size={16} />
            <span>الخطوة السابقة</span>
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            الخطوة {currentStepIdx + 1} من {steps.length}
          </span>

          <button 
            type="button" 
            className="btn-submit-action"
            onClick={() => {
              if (currentStepIdx < steps.length - 1) {
                setCurrentStepIdx(prev => prev + 1);
              } else {
                onBackToProjects();
              }
            }}
          >
            <span>{currentStepIdx === steps.length - 1 ? 'اكتمال كافة المراحل' : 'الخطوة التالية'}</span>
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
