import React from 'react';
import {
  Lightbulb,
  GraduationCap,
  Calculator,
  Database,
  Star,
  Send,
  Award,
  X,
  Trophy,
  CheckCircle,
  Sparkles,
  Leaf,
  Activity,
  Compass,
  Wifi,
  WifiOff,
  Smartphone,
  TrendingUp
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

export default function SidebarNav({
  activeTab,
  setActiveTab,
  savedProjectsCount = 0,
  projectContextForChat = null,
  environmentalPoints = 0,
  completedProjects = 0,
  impactCo2 = 0,
  hasGeminiKey = false,
  onOpenGeminiKeyModal,
  isOpen = false,
  onClose,
  isAdmin = false,
  onOpenTour
}) {
  const isOnline = useOnlineStatus();

  const navItems = [
    {
      id: 'tour',
      label: 'عن مُدام (الجولة التعريفية 🎬)',
      icon: Compass,
      badge: 'جديد'
    },
    {
      id: 'generator',
      label: 'مولد المشاريع',
      icon: Lightbulb,
      badge: null
    },
    {
      id: 'students',
      label: 'بوابة الطلاب والمدارس 🎓',
      icon: GraduationCap,
      badge: null
    },
    {
      id: 'calculator',
      label: 'حاسبة الأثر (LCA)',
      icon: Calculator,
      badge: null
    },
    {
      id: 'forecasting',
      label: 'التنبؤ البيئي الذكي 🔮',
      icon: TrendingUp,
      badge: 'جديد'
    },
    {
      id: 'directory',
      label: 'دليل الـ 150 مصدراً',
      icon: Database,
      badge: null
    },
    {
      id: 'saved',
      label: `المحفوظة (${savedProjectsCount})`,
      icon: Star,
      badge: savedProjectsCount > 0 ? savedProjectsCount : null
    },
    {
      id: 'chat',
      label: 'اسأل الخبير',
      icon: Send,
      badge: projectContextForChat ? '🎯 استشارة' : null
    },
    {
      id: 'certificate',
      label: 'شهادة الإنجاز',
      icon: Award,
      badge: null
    },
    ...(isAdmin ? [{
      id: 'admin',
      label: 'لوحة التحكم',
      icon: Activity,
      badge: null
    }] : [])
  ];

  const handleSelectTab = (tabId) => {
    if (tabId === 'tour') {
      if (onOpenTour) onOpenTour();
      if (onClose) onClose();
      return;
    }
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside className={`mudam-sidebar ${isOpen ? 'open' : ''}`} dir="rtl" aria-label="شريط التنقل الجانبي">
        {/* Brand & Logo Header */}
        <div className="sidebar-brand-header">
          <div 
            className="sidebar-brand-box" 
            onClick={() => handleSelectTab('generator')}
            role="button"
            tabIndex={0}
          >
            <img 
              src="/mudam-logo.png" 
              alt="شعار مُدام" 
              className="sidebar-logo-img"
            />
            <div className="sidebar-brand-text">
              <h1 className="sidebar-brand-title">مُدام</h1>
              <p className="sidebar-brand-subtitle">منصة التدوير والاستدامة</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button 
            type="button" 
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="إغلاق القائمة الجانبية"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav-links">
          <span className="sidebar-nav-section-title">الأقسام الرئيسية</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.id)}
              >
                <div className="sidebar-nav-item-content">
                  <Icon size={19} className="sidebar-nav-icon" />
                  <span className="sidebar-nav-label">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`sidebar-nav-badge ${isActive ? 'badge-active' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Student Stats Widget */}
        <div className="sidebar-footer-widget">
          <div className="sidebar-stats-card">
            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">
                <Trophy size={14} className="text-amber-500" />
                <span>النقاط البيئية</span>
              </span>
              <strong className="sidebar-stat-value text-emerald-600">
                {environmentalPoints}
              </strong>
            </div>

            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">
                <CheckCircle size={14} className="text-blue-500" />
                <span>المشاريع المنجزة</span>
              </span>
              <strong className="sidebar-stat-value text-slate-800">
                {completedProjects}
              </strong>
            </div>

            {impactCo2 > 0 && (
              <div className="sidebar-stat-row">
                <span className="sidebar-stat-label">
                  <Leaf size={14} className="text-emerald-500" />
                  <span>الوفر الكربوني</span>
                </span>
                <strong className="sidebar-stat-value text-emerald-700">
                  {impactCo2.toFixed(1)} كغ CO₂
                </strong>
              </div>
            )}
          </div>

          {/* PWA Offline-Ready Pill */}
          <div 
            style={{ 
              marginTop: '0.65rem',
              padding: '0.55rem 0.75rem',
              borderRadius: '10px',
              backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.25)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.74rem'
            }}
            title={isOnline ? 'المنصة تدعم العمل وتصفح المشاريع دون إنترنت (PWA)' : 'أنت الآن في وضع عدم الاتصال - تصفح المشاريع متاح'}
          >
            {isOnline ? (
              <>
                <Smartphone size={14} className="text-emerald-600" />
                <div style={{ flex: 1, lineHeight: 1.25 }}>
                  <span style={{ fontWeight: 700, color: '#065f46', display: 'block' }}>تطبيق PWA مثبت ومتاح</span>
                  <span style={{ color: '#047857', fontSize: '0.68rem' }}>يعمل ويحفظ بدون إنترنت</span>
                </div>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-rose-600" />
                <div style={{ flex: 1, lineHeight: 1.25 }}>
                  <span style={{ fontWeight: 700, color: '#991b1b', display: 'block' }}>وضع عدم الاتصال (Offline)</span>
                  <span style={{ color: '#b91c1c', fontSize: '0.68rem' }}>المشاريع المحفوظة متاحة</span>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
