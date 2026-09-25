import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Clock,
  DollarSign,
  Leaf,
  Wrench,
  BookOpen,
  Shield,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  CheckCircle,
  Check,
  Star,
  Share2,
  CheckCheck,
  Maximize2,
  Download,
  RefreshCw,
  Loader2,
  MessageSquare,
  Award,
  Printer,
  Layers
} from 'lucide-react';
import { handleImageFallback, generateSvgBlueprint } from '../utils/imageCatalog.js';

export default function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onSaveProject,
  isSaved,
  onShareProject,
  isCopied,
  onMarkCompleted,
  onConsultExpert,
  onOpenCertificate,
  onSwitchGalleryView,
  onRegenerateView,
  isRegenerating,
  onToggleStep,
  onOpenLightbox
}) {
  // Active inner tab: 'overview' | 'steps' | 'engineering' | 'sustainability' | 'safety'
  const [modalTab, setModalTab] = useState('overview');
  const [loadedImgUrl, setLoadedImgUrl] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Active gallery image
  const activeView = project?.activeGalleryView || 'finished';
  const activeImageUrl = project?.gallery?.[activeView] || project?.generatedImage;

  if (!isOpen || !project) return null;

  const currentDisplayImage = activeImageUrl || generateSvgBlueprint(project.name, project.materials, activeView);
  const isImgLoading = loadedImgUrl !== currentDisplayImage;

  // Step calculations
  const stepsList = project.parsedSteps || [];
  const completedStepsCount = stepsList.filter(s => s.completed).length;
  const totalStepsCount = stepsList.length;
  const progressPercent = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="project-detail-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="project-detail-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================
            STICKY MODAL TOP BAR
            ============================================================ */}
        <header className="project-detail-top-bar">
          <div className="project-detail-title-group">
            <div className="project-title-icon-wrap">
              <Lightbulb size={22} />
            </div>
            <div>
              <div className="project-detail-badges-row">
                <span className="badge-difficulty">{project.difficulty || 'متوسط'}</span>
                <span className="badge-time">
                  <Clock size={12} />
                  <span>{project.time || 'ساعتان'}</span>
                </span>
                {project.metrics?.feasibilityScore && (
                  <span className="badge-feasibility">
                    <Target size={12} />
                    <span>جدوى التنفيذ {project.metrics.feasibilityScore}%</span>
                  </span>
                )}
                {isSaved && (
                  <span className="badge-saved-indicator">
                    <Star size={11} fill="currentColor" />
                    <span>محفوظ بالسحابة</span>
                  </span>
                )}
              </div>
              <h2 className="project-detail-heading">{project.name}</h2>
            </div>
          </div>

          {/* Action buttons on top bar */}
          <div className="project-detail-top-actions">
            <button
              type="button"
              className={`btn-detail-action ${isSaved ? 'saved' : ''}`}
              onClick={() => onSaveProject(project)}
              title={isSaved ? 'المشروع محفوظ لديك' : 'حفظ المشروع في المفضلة'}
            >
              <Star size={16} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'محفوظ' : 'حفظ'}</span>
            </button>

            <button
              type="button"
              className="btn-detail-action"
              onClick={() => onShareProject(project)}
              title="مشاركة تفاصيل المشروع"
            >
              {isCopied ? <CheckCheck size={16} color="var(--emerald-primary)" /> : <Share2 size={16} />}
              <span>{isCopied ? 'تم النسخ!' : 'مشاركة'}</span>
            </button>

            <button
              type="button"
              className="btn-detail-action print-btn"
              onClick={handlePrint}
              title="طباعة الدليل التنفيذي"
            >
              <Printer size={16} />
              <span>طباعة</span>
            </button>

            <button
              type="button"
              className="btn-detail-close"
              onClick={onClose}
              aria-label="إغلاق النافذة"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ============================================================
            NAVIGATION TABS INSIDE MODAL
            ============================================================ */}
        <nav className="project-detail-nav-tabs">
          <button
            type="button"
            className={`detail-tab-btn ${modalTab === 'overview' ? 'active' : ''}`}
            onClick={() => setModalTab('overview')}
          >
            <Sparkles size={15} />
            <span>نظرة عامة واستوديو الصور</span>
          </button>

          <button
            type="button"
            className={`detail-tab-btn ${modalTab === 'steps' ? 'active' : ''}`}
            onClick={() => setModalTab('steps')}
          >
            <CheckCircle size={15} />
            <span>دليل خطوات التنفيذ</span>
            {totalStepsCount > 0 && (
              <span className="detail-tab-counter">
                {completedStepsCount}/{totalStepsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`detail-tab-btn ${modalTab === 'engineering' ? 'active' : ''}`}
            onClick={() => setModalTab('engineering')}
          >
            <Wrench size={15} />
            <span>الهندسة والمواد والتوافق</span>
          </button>

          <button
            type="button"
            className={`detail-tab-btn ${modalTab === 'sustainability' ? 'active' : ''}`}
            onClick={() => setModalTab('sustainability')}
          >
            <Leaf size={15} />
            <span>الأثر البيئي والشهادة</span>
          </button>

          <button
            type="button"
            className={`detail-tab-btn ${modalTab === 'safety' ? 'active' : ''}`}
            onClick={() => setModalTab('safety')}
          >
            <Shield size={15} />
            <span>السلامة وتطوير الفكرة</span>
          </button>
        </nav>

        {/* ============================================================
            MODAL CONTENT BODY
            ============================================================ */}
        <div className="project-detail-body">
          {/* ========================================================
              TAB 1: OVERVIEW & MULTI-ANGLE AI STUDIO
              ======================================================== */}
          {modalTab === 'overview' && (
            <div className="detail-tab-content fade-in">
              {/* AI Visual Showcase Studio */}
              <div className="modal-gallery-showcase">
                {/* 3 Camera Angle Switcher */}
                <div className="gallery-nav-tabs">
                  <button
                    type="button"
                    className={`gallery-tab-btn ${activeView === 'finished' ? 'active' : ''}`}
                    onClick={() => onSwitchGalleryView('finished')}
                  >
                    <Sparkles size={14} color="var(--emerald-primary)" />
                    <span>1. المنتج النهائي المكتمل</span>
                  </button>

                  <button
                    type="button"
                    className={`gallery-tab-btn ${activeView === 'assembly' ? 'active' : ''}`}
                    onClick={() => onSwitchGalleryView('assembly')}
                  >
                    <Wrench size={14} color="var(--navy-light)" />
                    <span>2. مراحل التجميع والقص</span>
                  </button>

                  <button
                    type="button"
                    className={`gallery-tab-btn ${activeView === 'inUse' ? 'active' : ''}`}
                    onClick={() => onSwitchGalleryView('inUse')}
                  >
                    <Leaf size={14} color="#ca8a04" />
                    <span>3. الاستخدام الواقعي بالديكور</span>
                  </button>
                </div>

                {/* Main Image Frame */}
                <div className="modal-gallery-frame">
                  {isImgLoading && (
                    <div className="modal-gallery-skeleton">
                      <div className="skeleton-shimmer-bar" />
                      <div className="modal-gallery-loader">
                        <Loader2 size={24} className="spin-animate" />
                        <span>جاري تحميل المشهد البصري فائق الدقة...</span>
                      </div>
                    </div>
                  )}

                  <img
                    src={currentDisplayImage}
                    alt={`${project.name} - ${activeView}`}
                    className={`modal-gallery-img ${isImgLoading ? 'loading' : 'loaded'}`}
                    onLoad={() => setLoadedImgUrl(currentDisplayImage)}
                    onError={(e) => {
                      setLoadedImgUrl(currentDisplayImage);
                      handleImageFallback(e, project.name, project.materials, activeView);
                    }}
                  />

                  {/* High-Tech Angle Tag */}
                  <div className="modal-gallery-angle-tag">
                    <Sparkles size={12} color="#34d399" />
                    <span>
                      {activeView === 'finished' && 'معاينة المنتج المكتمل (Ultra-HD)'}
                      {activeView === 'assembly' && 'مخطط التجميع الفني (Assembly)'}
                      {activeView === 'inUse' && 'الاستخدام الديكوري الواقعي (In-Situ)'}
                    </span>
                  </div>

                  {/* Floating Frame Tools */}
                  <div className="modal-gallery-tools">
                    <button
                      type="button"
                      className="btn-gallery-tool"
                      onClick={() => onOpenLightbox({
                        url: currentDisplayImage,
                        title: project.name,
                        subtitle: activeView === 'finished' ? 'صورة المنتج النهائي المكتمل' : activeView === 'assembly' ? 'رسم ومخطط ورشة العمل لمراحل التجميع والقص' : 'صورة واقعية للمنتج في البيئة المنزلية'
                      })}
                      title="تكبير الصورة بالحجم الكامل"
                    >
                      <Maximize2 size={13} />
                      <span>تكبير</span>
                    </button>

                    <a
                      href={currentDisplayImage}
                      download={`${project.name}-${activeView}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-gallery-tool"
                      title="تنزيل الصورة بجودة عالية"
                    >
                      <Download size={13} />
                      <span>تنزيل</span>
                    </a>
                  </div>
                </div>

                {/* Gallery Caption & Regenerate Bar */}
                <div className="gallery-caption-bar">
                  <div className="gallery-caption-text">
                    <Sparkles size={14} color="var(--emerald-primary)" />
                    <span>
                      {activeView === 'finished' && 'المشهد الأول: معاينة المنتج المكتمل بإضاءة ستوديو احترافية فائقة الدقة'}
                      {activeView === 'assembly' && 'المشهد الثاني: رسم ومخطط ورشة العمل لطريقة قص وربط المواد وتجميعها'}
                      {activeView === 'inUse' && 'المشهد الثالث: لقطة ديكورية واقعية للمنتج وهو مستخدم في المنزل أو الحديقة'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-regenerate-view"
                    onClick={() => onRegenerateView(activeView)}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <Loader2 size={13} className="spin-animate" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    <span>
                      {isRegenerating ? 'جاري التوليد...' : 'توليد زاوية بديلة بالذكاء الاصطناعي'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Executive Metrics Dashboard */}
              {project.metrics && (
                <div className="detail-metrics-grid">
                  <div className="detail-metric-card green">
                    <div className="detail-metric-icon">
                      <Target size={22} />
                    </div>
                    <div className="detail-metric-data">
                      <span className="metric-label">قابلية التنفيذ المنزلي</span>
                      <strong className="metric-value">{project.metrics.feasibilityScore}%</strong>
                      <span className="metric-hint">أدوات متوفرة وخامات آمنة</span>
                    </div>
                  </div>

                  <div className="detail-metric-card blue">
                    <div className="detail-metric-icon">
                      <Clock size={22} />
                    </div>
                    <div className="detail-metric-data">
                      <span className="metric-label">العمر التشغيلي المتوقع</span>
                      <strong className="metric-value">{project.metrics.durabilityYears || 'سنتان'}</strong>
                      <span className="metric-hint">مقاومة العوامل والاستهلاك</span>
                    </div>
                  </div>

                  <div className="detail-metric-card gold">
                    <div className="detail-metric-icon">
                      <DollarSign size={22} />
                    </div>
                    <div className="detail-metric-data">
                      <span className="metric-label">الوفر المالي التقديري</span>
                      <strong className="metric-value">{project.metrics.estimatedSavings || '15 - 35 $'}</strong>
                      <span className="metric-hint">مقارنة ببدائل السوق الجاهزة</span>
                    </div>
                  </div>

                  <div className="detail-metric-card emerald">
                    <div className="detail-metric-icon">
                      <Leaf size={22} />
                    </div>
                    <div className="detail-metric-data">
                      <span className="metric-label">وفر الكربون التقديري</span>
                      <strong className="metric-value">{project.metrics.co2SavedKg || '1.85'} كغ CO₂</strong>
                      <span className="metric-hint">وفق منهجية تقييم LCA</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Concept & Specifications */}
              <div className="detail-cards-grid">
                <div className="detail-info-card full-width">
                  <div className="detail-card-header">
                    <Target size={18} color="var(--emerald-primary)" />
                    <h4>فكرة المشروع والرؤية الهندسية</h4>
                  </div>
                  <p className="detail-card-text">{project.idea}</p>
                </div>

                <div className="detail-info-card">
                  <div className="detail-card-header">
                    <BookOpen size={18} color="var(--emerald-primary)" />
                    <h4>المواد المطلوبة للتشغيل</h4>
                  </div>
                  <p className="detail-card-text">{project.materials}</p>
                </div>

                <div className="detail-info-card">
                  <div className="detail-card-header">
                    <Wrench size={18} color="var(--navy-light)" />
                    <h4>الأدوات والعدد اللازمة</h4>
                  </div>
                  <p className="detail-card-text">{project.tools}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: INTERACTIVE STEPS & CHECKLIST
              ======================================================== */}
          {modalTab === 'steps' && (
            <div className="detail-tab-content fade-in">
              <div className="steps-control-panel">
                <div className="steps-progress-info">
                  <div className="steps-progress-texts">
                    <span className="steps-progress-title">
                      مستوى إنجاز خطوات المشروع: {progressPercent}%
                    </span>
                    <span className="steps-progress-count">
                      {completedStepsCount} من أصل {totalStepsCount} خطوة منجزة
                    </span>
                  </div>
                  <div className="steps-progress-bar-bg">
                    <div 
                      className="steps-progress-fill" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                </div>

                {progressPercent === 100 && (
                  <div className="steps-completed-celebration-banner">
                    <CheckCircle size={20} color="#059669" />
                    <span>رائع جداً! تم إكمال جميع خطوات المشروع بنجاح. يمكنك الآن تأكيد الإنجاز الرسمي ونيل +30 نقطة بيئية!</span>
                  </div>
                )}
              </div>

              {/* Interactive Steps List */}
              {stepsList.length > 0 ? (
                <div className="interactive-steps-container">
                  {stepsList.map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className={`step-interactive-card ${step.completed ? 'completed' : ''}`}
                    >
                      <button
                        type="button"
                        className={`step-interactive-check-btn ${step.completed ? 'checked' : ''}`}
                        onClick={() => onToggleStep(step.id)}
                        aria-label={step.completed ? 'إلغاء إكمال الخطوة' : 'تحديد الخطوة كمكتملة'}
                      >
                        {step.completed ? <Check size={18} strokeWidth={3} /> : <span>{idx + 1}</span>}
                      </button>

                      <div className="step-interactive-body">
                        <div className="step-interactive-header-row">
                          <span className="step-tag-pill">المرحلة {idx + 1}</span>
                          <h4 className="step-interactive-title">{step.title}</h4>
                        </div>

                        <p className="step-interactive-desc">{step.detail}</p>

                        {step.tip && (
                          <div className="step-tip-callout">
                            <Lightbulb size={15} className="flex-shrink-0" />
                            <div>
                              <strong>نصيحة الخبير التقنية:</strong> {step.tip}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="steps-plain-text-box">
                  <div style={{ whiteSpace: 'pre-line' }}>{project.steps}</div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 3: ENGINEERING, BONDING MATRIX & CHEMISTRY
              ======================================================== */}
          {modalTab === 'engineering' && (
            <div className="detail-tab-content fade-in">
              {/* Bonding & Chemistry Matrix */}
              {project.metrics?.bondingGuide && (
                <div className="engineering-matrix-panel">
                  <div className="engineering-panel-title">
                    <Shield size={20} color="var(--emerald-primary)" />
                    <h3>مصفوفة التوافق الكيميائي والهندسي للمواد</h3>
                  </div>

                  <div className="engineering-matrix-grid">
                    <div className="matrix-item-card">
                      <div className="matrix-item-icon adhesive">
                        <Layers size={20} />
                      </div>
                      <div className="matrix-item-content">
                        <strong>المادة اللاصقة / وسيلة الربط:</strong>
                        <p>{project.metrics.bondingGuide.adhesive}</p>
                      </div>
                    </div>

                    <div className="matrix-item-card">
                      <div className="matrix-item-icon cutting">
                        <Wrench size={20} />
                      </div>
                      <div className="matrix-item-content">
                        <strong>تقنية التشكيل والقص الآمن:</strong>
                        <p>{project.metrics.bondingGuide.cuttingTechnique}</p>
                      </div>
                    </div>

                    <div className="matrix-item-card">
                      <div className="matrix-item-icon safety">
                        <Shield size={20} />
                      </div>
                      <div className="matrix-item-content">
                        <strong>أدوات الوقاية والسلامة (PPE):</strong>
                        <p>{project.metrics.bondingGuide.safetyGear}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scientific / Environmental Principle */}
              {project.principle && (
                <div className="detail-info-card full-width">
                  <div className="detail-card-header">
                    <Sparkles size={18} color="var(--navy-primary)" />
                    <h4>المبدأ العلمي والفيزيائي للمشروع</h4>
                  </div>
                  <p className="detail-card-text" style={{ whiteSpace: 'pre-line' }}>
                    {project.principle}
                  </p>
                </div>
              )}

              {/* Expected Results */}
              {project.results && (
                <div className="detail-info-card full-width">
                  <div className="detail-card-header">
                    <Target size={18} color="var(--gold-primary)" />
                    <h4>المواصفات والنتائج العملية المتوقعة</h4>
                  </div>
                  <p className="detail-card-text" style={{ whiteSpace: 'pre-line' }}>
                    {project.results}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 4: SUSTAINABILITY & LCA IMPACT
              ======================================================== */}
          {modalTab === 'sustainability' && (
            <div className="detail-tab-content fade-in">
              <div className="sustainability-full-panel">
                <div className="sustainability-panel-header">
                  <div className="sustainability-leaf-icon">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h3>الأثر البيئي وتقييم دورة الحياة (LCA Impact)</h3>
                    <p>متوافق مع المعايير الدولية للإدارة البيئية ISO 14040 و ISO 14044</p>
                  </div>
                </div>

                <div className="sustainability-description-box">
                  {project.sustainability ? (
                    <div style={{ whiteSpace: 'pre-line' }}>{project.sustainability}</div>
                  ) : (
                    <p>
                      يساهم هذا المشروع في تحويل النفايات الصلبة مباشرة إلى منتج وظيفي بديل عن المنتجات التجارية المستهلكة للمواد الخام والطاقة،
                      مما يخفض انبعاثات مكبات النفايات بنسبة تصل إلى 85% للخامات المستعملة.
                    </p>
                  )}
                </div>

                {/* ISO Certificate Quick Issue Callout */}
                <div className="certificate-callout-box">
                  <div className="certificate-callout-text">
                    <Award size={28} color="var(--emerald-primary)" />
                    <div>
                      <h4>هل أكملت أو تنوي تنفيذ هذا المشروع؟</h4>
                      <p>يمكنك استخراج وتوليد الشهادة البيئية المعتمدة رسمياً لهذا المشروع مع الباركود الموثق ورقم الاعتماد البيئي.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-issue-cert-modal"
                    onClick={() => {
                      onOpenCertificate(project);
                      onClose();
                    }}
                  >
                    <Award size={16} />
                    <span>إصدار الشهادة البيئية فوراً</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: SAFETY & FUTURE DEVELOPMENT
              ======================================================== */}
          {modalTab === 'safety' && (
            <div className="detail-tab-content fade-in">
              {/* Safety Warning Banner */}
              {project.safety && (
                <div className="safety-warning-banner-modal">
                  <div className="safety-warning-header">
                    <AlertTriangle size={22} color="#dc2626" />
                    <h4>إرشادات السلامة الوقائية والتحذيرات الصارمة</h4>
                  </div>
                  <div className="safety-warning-body" style={{ whiteSpace: 'pre-line' }}>
                    {project.safety}
                  </div>
                </div>
              )}

              {/* Ideas for Future Development */}
              {project.development && (
                <div className="detail-info-card full-width">
                  <div className="detail-card-header">
                    <Lightbulb size={18} color="var(--gold-primary)" />
                    <h4>كيف يمكن تطوير وتوسيع المشروع مستقبلاً؟</h4>
                  </div>
                  <p className="detail-card-text" style={{ whiteSpace: 'pre-line' }}>
                    {project.development}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================
            STICKY MODAL FOOTER ACTIONS
            ============================================================ */}
        <footer className="project-detail-footer">
          <div className="footer-secondary-actions">
            <button
              type="button"
              className="btn-footer-chat"
              onClick={() => {
                onConsultExpert(project);
                onClose();
              }}
            >
              <MessageSquare size={16} />
              <span>استشر الخبير الذكي حول المشروع</span>
            </button>

            <button
              type="button"
              className="btn-footer-cert"
              onClick={() => {
                onOpenCertificate(project);
                onClose();
              }}
            >
              <Award size={16} />
              <span>الشهادة المعتمدة</span>
            </button>
          </div>

          <div className="footer-primary-actions">
            <button
              type="button"
              className="btn-footer-complete"
              onClick={() => onMarkCompleted(project)}
            >
              <CheckCircle size={17} />
              <span>تأكيد الإنجاز الرسمي (+30 نقطة)</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
