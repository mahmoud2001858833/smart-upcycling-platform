import React, { useState } from 'react';
import {
  Play,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Layers,
  Award,
  Users,
  Compass,
  Cpu,
  Zap,
  BarChart3,
  BookOpen,
  ChevronDown
} from 'lucide-react';

export default function PlatformTourModal({ isOpen, onClose, onStartExploring }) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  if (!isOpen) return null;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pillars = [
    {
      icon: Cpu,
      title: 'محرك التوليد الهندسي الحي',
      description: 'تحليل دقيق لأي خامات تملكها وتوليد 3 مشاريع واقعية حصرية لكل طلب مع نسب قياسية وأبعاد دقيقة.'
    },
    {
      icon: Leaf,
      title: 'حاسبة الأثر الكربوني (LCA)',
      description: 'تقييم بيئي حقيقي يستند إلى بروتوكول GHG العالمي ومواصفات ISO 14044 لاحتساب الوفر في الكربون والماء والطاقة.'
    },
    {
      icon: Layers,
      title: 'موسوعة الـ 61+ خامة ودليل المصادر',
      description: 'قاعدة بيانات متكاملة بالمعايير الكيميائية والتوافق الفيزيائي مع مصادر موثقة تشمل EPA WARM و DEFRA.'
    },
    {
      icon: Award,
      title: 'شهادة إنجاز بيئي رقمية',
      description: 'شهادة تحفيزية رقمية مخصصة برقم مرجعي فريد لكل مشروع منجز لتوثيق المساهمة في الاقتصاد الدائري.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'اختر أو أدخل خاماتك',
      desc: 'سواء كانت علب ألمنيوم، عبوات زجاجية، أقمشة، كرتون، أو إلكترونيات تالفة.'
    },
    {
      num: '02',
      title: 'الذكاء الاصطناعي يبتكر ويدقق',
      desc: 'يصمم المشروع ويفحص التوافق الكيميائي والسلامة الإنشائية ومعدات الوقاية.'
    },
    {
      num: '03',
      title: 'دليل تصنيع خطوة بخطوة',
      desc: 'شرح كتابي وقياسات ونقاط تحقق ومؤقت تجفيف لإرشادك خلال كل مرحلة.'
    },
    {
      num: '04',
      title: 'وثّق أثرك البيئي واحتفل',
      desc: 'احصل على نقاط الاستدامة وشهادة الإنجاز الرقمية بمقدار الوفر الكربوني المحقق.'
    }
  ];

  return (
    <div className="tour-modal-backdrop" onClick={onClose} dir="rtl">
      <div 
        className="tour-modal-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar */}
        <header className="tour-modal-header">
          <div className="tour-header-brand">
            <img src="/mudam-logo.png" alt="شعار مُدام" className="tour-brand-logo" />
            <div>
              <h2 className="tour-brand-title">مُدام • MUDAM</h2>
              <span className="tour-brand-sub">منصة التدوير الذكي والاستدامة البيئية</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="tour-close-btn"
            title="إغلاق والعودة للتطبيق"
          >
            ✕
          </button>
        </header>

        {/* Scrollable Content Container with Smooth Scroll */}
        <div className="tour-scroll-body">
          {/* Hero Section with Luxury Glassmorphism */}
          <section className="tour-hero-section">
            <div className="tour-hero-badge">
              <Sparkles size={14} className="text-emerald-400" />
              <span>جولة استكشافية شاملة في منظومة مُدام</span>
            </div>
            <h1 className="tour-hero-headline">
              نحو مستقبل دائري يحوّل النفايات إلى <span className="tour-gradient-text">ابتكارات حية ذات قيمة</span>
            </h1>
            <p className="tour-hero-description">
              منصة ذكية متكاملة تجمع بين قوة الذكاء الاصطناعي التوليدي والتقييم البيئي العلمي الصارم 
              وفق منهجيات ISO 14044 وبروتوكول GHG لتمكين الأفراد والمدارس من قيادة التغيير البيئي.
            </p>

            {/* Quick Action Navigation */}
            <div className="tour-hero-actions">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onStartExploring) onStartExploring();
                }}
                className="tour-btn-primary"
              >
                <span>ابدأ استخدام المنصة فوراً</span>
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('tour-video-section')}
                className="tour-btn-secondary"
              >
                <Play size={16} />
                <span>شاهد العرض التعريفي</span>
              </button>
            </div>

            <div className="tour-scroll-indicator" onClick={() => scrollToSection('tour-video-section')}>
              <span>اسحب للأسفل لاكتشاف المنظومة</span>
              <ChevronDown size={18} className="animate-bounce" />
            </div>
          </section>

          {/* Video Showcase Section */}
          <section id="tour-video-section" className="tour-section tour-video-wrapper">
            <div className="tour-section-head">
              <span className="tour-tag">العرض المرئي الرسمي</span>
              <h2 className="tour-section-title">فيديو تعريفي بالمنصة</h2>
              <p className="tour-section-subtitle">
                شاهد كيف تعمل منصة مُدام في تحويل الخامات اليومية إلى مشاريع عملية مع حساب الأثر الكربوني بدقة.
              </p>
            </div>

            <div className="tour-video-frame">
              {isPlayingVideo ? (
                <div className="tour-video-player">
                  <video 
                    controls 
                    autoPlay 
                    className="w-full h-full rounded-2xl"
                    poster="/mudam-logo.png"
                  >
                    <source src="/mudam-presentation.mp4" type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو مباشرة.
                  </video>
                </div>
              ) : (
                <div 
                  className="tour-video-poster" 
                  onClick={() => setIsPlayingVideo(true)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="tour-video-overlay" />
                  <div className="tour-play-button">
                    <Play size={32} fill="currentColor" />
                  </div>
                  <div className="tour-poster-info">
                    <span className="tour-poster-pill">فيديو العرض التقديمي • 2026</span>
                    <h3 className="tour-poster-title">مُدام: هندسة التدوير الذكي بالذكاء الاصطناعي</h3>
                    <p className="tour-poster-meta">انقر للتشغيل والاستماع للشرح التفصيلي</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Core Pillars Grid */}
          <section className="tour-section">
            <div className="tour-section-head">
              <span className="tour-tag">الأعمدة التقنية والعلمية</span>
              <h2 className="tour-section-title">أربع ركائز ترتكز عليها منصة مُدام</h2>
            </div>

            <div className="tour-pillars-grid">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={idx} className="tour-pillar-card">
                    <div className="tour-pillar-icon-box">
                      <Icon size={24} />
                    </div>
                    <h3 className="tour-pillar-title">{pillar.title}</h3>
                    <p className="tour-pillar-desc">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Step-by-Step Experience Workflow */}
          <section className="tour-section tour-workflow-section">
            <div className="tour-section-head">
              <span className="tour-tag">رحلة المستخدم السلسة</span>
              <h2 className="tour-section-title">كيف تستفيد من المنصة في 4 خطوات بسيطة؟</h2>
            </div>

            <div className="tour-steps-row">
              {steps.map((st, i) => (
                <div key={i} className="tour-step-card">
                  <div className="tour-step-badge">{st.num}</div>
                  <h4 className="tour-step-title">{st.title}</h4>
                  <p className="tour-step-desc">{st.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Academic & Supervised Innovation Team */}
          <section className="tour-section tour-team-section">
            <div className="tour-team-box">
              <div className="tour-team-header">
                <Users size={24} className="text-emerald-400" />
                <h3 className="tour-team-headline">فريق العمل والإشراف الأكاديمي</h3>
              </div>
              <p className="tour-team-sub">
                مشروع ابتكاري نوعي في توظيف الذكاء الاصطناعي التطبيقي لخدمة التنمية المستدامة والاقتصاد الدائري:
              </p>
              
              <div className="tour-team-members">
                <div className="tour-member-card">
                  <div className="tour-member-avatar">👨‍💻</div>
                  <div className="tour-member-info">
                    <h4>محمود محمد جوارنة</h4>
                    <span>مطور ومبتكر المنظومة والحلول البرمجية</span>
                  </div>
                </div>

                <div className="tour-member-card">
                  <div className="tour-member-avatar">🎓</div>
                  <div className="tour-member-info">
                    <h4>أ. محمد قاسم جوارنة</h4>
                    <span>الإشراف الأكاديمي والتأطير المنهجي والتوجيه العام</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="tour-final-cta">
            <h2 className="tour-cta-headline">مستعد لتجربة ابتكارك الأول وتحييد الكربون؟</h2>
            <p className="tour-cta-sub">
              انتقل الآن لمولد المشاريع وابدأ بتحويل الخامات المتوفرة لديك إلى منتج استثنائي.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onStartExploring) onStartExploring();
              }}
              className="tour-btn-primary large"
            >
              <span>دخول المنصة وتوليد المشاريع</span>
              <ArrowRight size={20} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
