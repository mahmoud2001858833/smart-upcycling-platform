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
  Activity
} from 'lucide-react';

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
  isAdmin = false
}) {
  const navItems = [
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
        </div>
      </aside>
    </>
  );
}
