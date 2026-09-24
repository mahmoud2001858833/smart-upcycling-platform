import React from 'react';
import { 
  Recycle, 
  Sun, 
  Moon, 
  Layers, 
  Compass, 
  Calculator, 
  Database,
  Award,
  Sparkles
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  totalOffsetKg,
  onOpenCertificate 
}) {
  return (
    <header className="header-wrapper">
      <div className="header-container">
        {/* Logo and Brand */}
        <div className="logo-section" onClick={() => setActiveTab('scanner')}>
          <div className="logo-icon-box">
            <Recycle size={26} strokeWidth={2.2} />
          </div>
          <div className="logo-text">
            <h1>خبير إعادة التدوير الذكي</h1>
            <p>Smart Upcycling & Carbon Offset Engine</p>
          </div>
        </div>

        {/* Central Navigation Pills */}
        <nav className="nav-pills" aria-label="أقسام المنصة">
          <button 
            className={`nav-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            <Layers size={17} />
            <span>مسح الخامات والمشاريع</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <Compass size={17} />
            <span>دليل التنفيذ والموجهات</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={17} />
            <span>حاسبة الأثر (LCA)</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            <Database size={17} />
            <span>دليل الـ 150 مصدراً</span>
          </button>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Running Offset Counter Badge */}
          <div className="running-offset-badge" title="صافي انبعاثات الكربون المتفاداة حالياً">
            <Sparkles size={16} />
            <span>الوفر:</span>
            <span className="num">+{totalOffsetKg.toFixed(2)} kg CO₂e</span>
          </div>

          {/* Certificate Action */}
          <button 
            className="btn-secondary" 
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
            onClick={onOpenCertificate}
            title="استخراج وتنزيل شهادة الأثر البيئي المعتمدة"
          >
            <Award size={16} color="#10b981" />
            <span>الشهادة</span>
          </button>

          {/* Theme Toggle */}
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="تبديل وضع الألوان"
            title={theme === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
