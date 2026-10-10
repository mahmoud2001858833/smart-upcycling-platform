import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  Database,
  FileCheck2,
  ExternalLink,
  GraduationCap,
  Scale,
  Check,
  HelpCircle,
  WifiOff,
  Download,
  Smartphone
} from 'lucide-react';

export default function PlatformTourPage({ onStartExploring }) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const platformStats = [
    { value: 'ISO 14044', label: 'منهجية تقييم دورة الحياة (LCA)', icon: Scale },
    { value: 'GHG Scope 3', label: 'بروتوكول غازات الاحتباس العالمي', icon: Leaf },
    { value: '61+ خامة', label: 'موسوعة المواد والمطابقة الكيميائية', icon: Layers },
    { value: '150 مصدر', label: 'قاعدة بيانات انبعاثات EPA & DEFRA', icon: Database },
    { value: 'PWA Ready', label: 'يعمل دون اتصال إنترنت (تطبيق تقدمي)', icon: Smartphone }
  ];

  const features = [
    {
      icon: Cpu,
      title: 'محرك التوليد الهندسي الحي (Bespoke AI)',
      desc: 'تحليل فيزيائي وكيميائي للخامات المدخلة وتوليد 3 مشاريع عملية حصرية لكل طلب مع نسب قياسية وأبعاد تنفيذية دقيقة بدون قوالب جاهزة.'
    },
    {
      icon: Leaf,
      title: 'حاسبة الأثر وتقييم دورة الحياة (LCA Engine)',
      desc: 'احتساب كمية الانبعاثات الكربونية المحيدة (kg CO₂e)، والوفر المائي، والطاقة الكهربائية ومؤشر الاقتصاد الدائري مقارنة بالإنتاج العذري ومكبات النفايات.'
    },
    {
      icon: Smartphone,
      title: 'تطبيق ويب تقدمي (PWA) وتصفح دون إنترنت',
      desc: 'إمكانية تثبيت المنصة كتطبيق مستقل على الهاتف والحاسوب، وتصفح مشاريعك المحفوظة وخطوات التنفيذ والأدلة حتى في حالة انقطاع اتصال الإنترنت بالكامل.'
    },
    {
      icon: Database,
      title: 'دليل الـ 150 مصدراً ومعاملات الانبعاثات',
      desc: 'دليل علمي شفاف يربط كل خامة بمعامل انبعاثاتها ومصدره الدولي المعتمد مثل US EPA WARM v16 و UK DEFRA/DESNZ لضمان النزاهة العلمية.'
    },
    {
      icon: Layers,
      title: 'موسوعة الـ 61+ خامة وفحص التوافق',
      desc: 'فحص مسبق لمدى توافق المواد مع بعضها كيميائياً وميكانيكياً واقتراح اللواصق وأدوات القص المناسبة لكل نوع بدقة تامة.'
    },
    {
      icon: GraduationCap,
      title: 'بوابة الطلاب والمدارس وتقارير المختبر STEM',
      desc: 'توليد تقرير تجربة علمية (Lab Report) ونماذج تقييم روبريك (Rubric) واختبارات مفاهيم بيئية موجهة لمدارس ومعلمي العلوم.'
    },
    {
      icon: Award,
      title: 'شهادة الإنجاز البيئي الرقمية الموثقة',
      desc: 'شهادة رقمية تحفيزية تصدر باسم المبتكر والمشروع مع كود QR ورقم مرجعي فريد يوثق كمية الكربون المحيدة بدقة.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'تحديد الخامات المتوفرة',
      desc: 'اختر المواد من المكتبة الشاملة أو أدخلها كتابياً أو التقط صورة بالكاميرا.'
    },
    {
      step: '02',
      title: 'التوليد والتدقيق الهندسي',
      desc: 'يقوم الذكاء الاصطناعي بابتكار 3 حلول عملية والتأكد من السلامة والتوافق الإنشائي.'
    },
    {
      step: '03',
      title: 'دليل التصنيع والمخطط الإرشادي',
      desc: 'خطوات مفصلة بالأبعاد والأدوات، مع مؤقت تجفيف، ورسوم توضيحية ونقاط تحقق.'
    },
    {
      step: '04',
      title: 'توثيق الأثر وإصدار الشهادة',
      desc: 'احتساب الوفر البيئي التراكمي وإصدار شهادة إنجاز بيئية وتقرير مختبر قابل للطباعة.'
    }
  ];

  const standards = [
    {
      title: 'معايير ISO 14040 / 14044',
      desc: 'تطبيق المراحل الأربع لتقييم دورة الحياة (LCA): تحديد الهدف والنطاق، تحليل حصر البيانات، تقييم الأثر البيئي، وتفسير النتائج.'
    },
    {
      title: 'بروتوكول الغازات الدفيئة (GHG Protocol)',
      desc: 'حساب الانبعاثات غير المباشرة الناتجة عن سلاسل التوريد والنفايات (Scope 3) ومقارنتها بالانبعاثات المتجنبة نتيجة التدوير.'
    },
    {
      title: 'وكالة حماية البيئة الأمريكية (US EPA WARM)',
      desc: 'الاعتماد على معاملات نموذج تقليص النفايات الإصدار 16 لتقدير انبعاثات التصنيع العذري وإعادة التدوير لكل مادة.'
    },
    {
      title: 'وزارة البيئة البريطانية (UK DEFRA / DESNZ)',
      desc: 'استخدام جداول تحويل انبعاثات غازات الاحتباس الحراري السنوية الموثقة عالمياً للمواد الاستهلاكية الشائعة.'
    }
  ];

  const faqs = [
    {
      q: 'ما هي منصة مُدام (MUDAM)؟',
      a: 'مُدام هي منظومة ذكية متخصصة في هندسة التدوير التوليدي، تحوّل المخلفات اليومية المنزلية والمدرسية إلى أصول ومشاريع عملية ومفيدة باستخدام الذكاء الاصطناعي مع قياس دقيق للأثر الكربوني.'
    },
    {
      q: 'هل المشاريع الناتجة تعتمد على قوالب جاهزة مسبقاً؟',
      a: 'لا، يقوم محرك الذكاء الاصطناعي بابتكار حلول هندسية وتصميمية متوافقة خصيصاً مع الخامات التي تملكها في كل مرة تطلب فيها التوليد.'
    },
    {
      q: 'كيف يتم حساب الوفر الكربوني والأثر البيئي؟',
      a: 'نستخدم معادلة التقييم المعتمدة عالمياً: (انبعاثات الإنتاج العذري للمادة ناقصاً انبعاثات التدوير والتعديل، مضافاً إليها الانبعاثات المتجنبة من مكبات النفايات) استناداً لمصادر EPA و DEFRA.'
    },
    {
      q: 'من يقف خلف تطوير وإشراف هذه المنصة؟',
      a: 'طوّرت المنصة بواسطة المبتكر محمود محمد جوارنة، بإشراف وتأطير منهجي وأكاديمي من الأستاذ محمد قاسم جوارنة.'
    }
  ];

  return (
    <div className="official-tour-page" dir="rtl">
      {/* 1. Hero Section */}
      <section className="tour-hero-block">
        <div className="tour-hero-inner">
          <div className="tour-official-badge">
            <span className="badge-pulse" />
            <Sparkles size={14} className="text-emerald-700" />
            <span>الجولة الرسمية الشاملة • منظومة مُدام للاستدامة والتدوير الذكي</span>
          </div>

          <h1 className="tour-main-heading">
            منصة ذكية تحوّل المخلفات إلى <span className="text-emerald-highlight">حلول هندسية عملية</span> وموثقة بيئياً
          </h1>

          <p className="tour-main-desc">
            تجمع منصة <strong>مُدام (MUDAM)</strong> بين هندسة الذكاء الاصطناعي التوليدي والتقييم العلمي الصارم 
            لدورة الحياة (LCA) وفق مواصفات <strong>ISO 14044</strong> وبروتوكول <strong>GHG العالمي</strong>، 
            لتمكين المجتمعات والمدارس من تبني الاقتصاد الدائري بطريقة تطبيقية قابلة للقياس.
          </p>

          {/* Quick CTA Actions */}
          <div className="tour-hero-buttons">
            <button
              type="button"
              onClick={onStartExploring}
              className="btn-tour-cta-primary"
            >
              <span>دخول مولد المشاريع والتطبيق المباشر</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('tour-video-anchor')}
              className="btn-tour-cta-outline"
            >
              <Play size={16} fill="currentColor" />
              <span>مشاهدة العرض التعريفي (فيديو)</span>
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="tour-metrics-grid">
            {platformStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="tour-metric-card">
                  <div className="metric-icon-box">
                    <Icon size={20} />
                  </div>
                  <div className="metric-text-box">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Official Video Presentation Section */}
      <section id="tour-video-anchor" className="tour-content-section bg-soft-tint">
        <div className="tour-section-header">
          <span className="tour-category-tag">العرض المرئي التوثيقي</span>
          <h2 className="tour-section-title">فيديو العرض التقديمي والشرح الشامل للمنصة</h2>
          <p className="tour-section-subtitle">
            شاهد تجربة استخدام المنصة من مرحلة رصد الخامات وتوليد المشاريع وحتى استخراج تقرير المختبر وشهادة الإنجاز البيئي.
          </p>
        </div>

        <div className="tour-video-card">
          {isPlayingVideo ? (
            <div className="video-player-container">
              <video 
                controls 
                autoPlay 
                playsInline
                className="tour-html-video"
                poster="/mudam-logo.png"
              >
                <source src="/mudam-presentation.mp4" type="video/mp4" />
                <source src="/1007(2).mov" type="video/quicktime" />
                متصفحك لا يدعم تشغيل الفيديو المباشر. يمكنك تحميل الملف أدناه.
              </video>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#065f46', fontWeight: 600 }}>
                  <Sparkles size={14} />
                  <span>فيديو العرض التقديمي الموثق (1007(2)) • دقة فائقة</span>
                </span>
                <a 
                  href="/1007(2).mov" 
                  download="عرض-منصة-مدام-1007(2).mov"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#047857', textDecoration: 'none', fontWeight: 600 }}
                  title="تحميل ملف الفيديو الأصلي بدقة فائقة من سطح المكتب"
                >
                  <Download size={14} />
                  <span>تحميل النسخة الأصلية (1007(2).mov)</span>
                </a>
              </div>
            </div>
          ) : (
            <div 
              className="tour-video-placeholder"
              onClick={() => setIsPlayingVideo(true)}
              role="button"
              tabIndex={0}
            >
              <div className="video-play-orb">
                <Play size={34} fill="currentColor" />
              </div>
              <div className="video-placeholder-caption">
                <span className="video-tag-pill">عرض تقديمي رسمي • 2026 (1007(2).mov)</span>
                <h3>شاهد كيف تعمل خوارزميات التدوير الذكي في مُدام</h3>
                <p>انقر لتشغيل الفيديو والشرح العملي المباشر</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Core Pillars & Features Section */}
      <section className="tour-content-section">
        <div className="tour-section-header">
          <span className="tour-category-tag">القدرات والوظائف الذكية</span>
          <h2 className="tour-section-title">أهم مزايا وأدوات منصة مُدام</h2>
          <p className="tour-section-subtitle">
            منظومة متكاملة تخدم الأفراد، البيوت، وطلبة المدارس والمحكمين بأدوات تحليل وتوثيق فورية.
          </p>
        </div>

        <div className="tour-features-grid">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="tour-feature-card">
                <div className="feature-icon-wrapper">
                  <Icon size={24} />
                </div>
                <h3 className="feature-card-title">{item.title}</h3>
                <p className="feature-card-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Methodology & Data Sources Section */}
      <section className="tour-content-section bg-soft-tint">
        <div className="tour-section-header">
          <span className="tour-category-tag">المنهجية العلمية والنزاهة الأكاديمية</span>
          <h2 className="tour-section-title">الأسس العلمية ومعايير الحساب البيئي</h2>
          <p className="tour-section-subtitle">
            تعتمد المنصة على معايير دولية محايدة لضمان دقة وموثوقية أرقام الوفر الكربوني والأثر البيئي.
          </p>
        </div>

        <div className="tour-standards-grid">
          {standards.map((std, idx) => (
            <div key={idx} className="tour-standard-card">
              <div className="standard-check-badge">
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <h4 className="standard-card-title">{std.title}</h4>
                <p className="standard-card-desc">{std.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. User Workflow Experience */}
      <section className="tour-content-section">
        <div className="tour-section-header">
          <span className="tour-category-tag">آلية العمل المتسلسلة</span>
          <h2 className="tour-section-title">رحلة الابتكار في 4 خطوات عملية</h2>
          <p className="tour-section-subtitle">
            خطوات ميسرة وواضحة ترشد المستخدم من اللحظة الأولى وحتى إتمام المشروع وتوثيق الإنجاز.
          </p>
        </div>

        <div className="tour-workflow-steps">
          {workflowSteps.map((ws, i) => (
            <div key={i} className="workflow-step-box">
              <span className="workflow-number">{ws.step}</span>
              <h4 className="workflow-step-title">{ws.title}</h4>
              <p className="workflow-step-desc">{ws.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Academic Team & Supervision */}
      <section className="tour-content-section bg-soft-tint">
        <div className="tour-team-container">
          <div className="tour-section-header" style={{ marginBottom: '1.5rem' }}>
            <span className="tour-category-tag">الإشراف والتطوير الأكاديمي</span>
            <h2 className="tour-section-title">فريق العمل والقيادة البحثية</h2>
            <p className="tour-section-subtitle">
              تطوير حلول وطنية مستدامة توظف الذكاء الاصطناعي لخدمة أهداف التنمية المستدامة (SDGs).
            </p>
          </div>

          <div className="team-cards-flex">
            <div className="official-team-card">
              <div className="team-avatar-icon">👨‍💻</div>
              <div className="team-details">
                <h3 className="team-name">محمود محمد جوارنة</h3>
                <span className="team-role-pill">مطور ومبتكر المنظومة والحلول البرمجية</span>
                <p className="team-bio">
                  تطوير كامل الواجهات ومحركات التحليل التوليدي وربط خوارزميات تقييم دورة الحياة وقواعد البيانات.
                </p>
              </div>
            </div>

            <div className="official-team-card">
              <div className="team-avatar-icon">🎓</div>
              <div className="team-details">
                <h3 className="team-name">أ. محمد قاسم جوارنة</h3>
                <span className="team-role-pill">الإشراف الأكاديمي والتأطير المنهجي والتوجيه العام</span>
                <p className="team-bio">
                  التوجيه الاستراتيجي، تدقيق الأطر التربوية والعلمية للمشروع، ومواءمته مع أهداف التعليم البيئي.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="tour-content-section">
        <div className="tour-section-header">
          <span className="tour-category-tag">الأسئلة الشائعة</span>
          <h2 className="tour-section-title">إجابات حول منظومة مُدام</h2>
        </div>

        <div className="tour-faqs-container">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className={`tour-faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => setActiveFaq(isOpen ? null : idx)}
              >
                <div className="tour-faq-question">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={18} className="text-emerald-700" />
                    <h4>{faq.q}</h4>
                  </div>
                  <ChevronDown size={18} className={`faq-arrow ${isOpen ? 'rotate' : ''}`} />
                </div>
                {isOpen && (
                  <div className="tour-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Bottom Direct Navigation CTA */}
      <section className="tour-bottom-cta">
        <div className="cta-inner-card">
          <h2 className="cta-title">ابدأ رحلتك المستدامة مع منصة مُدام الآن</h2>
          <p className="cta-desc">
            اختر خاماتك ودع الذكاء الاصطناعي يصمم لك دليلاً تنفيذياً متكاملاً مع حساب دقيق للأثر الكربوني.
          </p>
          <button
            type="button"
            onClick={onStartExploring}
            className="btn-tour-cta-primary large"
          >
            <span>الانتقال لمولد المشاريع (تجربة حية)</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
