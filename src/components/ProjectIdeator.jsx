import React from 'react';
import { 
  ShieldAlert, 
  Wrench, 
  Clock, 
  CheckCircle, 
  ArrowLeft, 
  Sparkles,
  Leaf,
  Layers,
  Palette
} from 'lucide-react';

export default function ProjectIdeator({ 
  projects, 
  selectedProjectId, 
  onSelectProject, 
  onProceedToGuide 
}) {
  return (
    <div className="projects-section">
      {/* Strict Safety & Feasibility Guardrail Banner */}
      <div className="safety-alert-banner">
        <ShieldAlert size={26} className="alert-icon" />
        <div className="safety-alert-content">
          <h4>معيار السلامة والجدوى الصارم (Strict Safety Guardrail)</h4>
          <p>
            تلتزم المنصة بحظر أي معالجة تنطوي على صهر حراري مباشر لبلاستيك PET أو PVC لتفادي انبعاث غازات الديوكسينات السامة والكلور،
            كما يُحظر حرق أو تسخين المكونات الإلكترونية واستخدام مواد لاصقة كيميائية متبخرة في أماكن مغلقة. كافة المشاريع أدناه تعتمد
            على القص الميكانيكي البارد والربط الآمن القابل للتنفيذ المنزلي والمدرسي.
          </p>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-heading" style={{ marginBottom: '1.2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>
            <Sparkles size={24} color="#10b981" />
            <span>محرك ابتكار المشاريع البيئية (Project Ideation Engine)</span>
          </h3>
          <p style={{ fontSize: '0.88rem' }}>
            تم توليد 3 مسارات متباينة بناءً على تركيبة الخامات المفحوصة، اختر المشروع لعرض دليل التنفيذ التفصيلي:
          </p>
        </div>
      </div>

      {/* 3 Project Tracks Grid */}
      <div className="projects-grid">
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProjectId;
          
          let trackClass = 'track-functional';
          let TrackIcon = Wrench;
          if (proj.track === 'creative') {
            trackClass = 'track-creative';
            TrackIcon = Palette;
          } else if (proj.track === 'community') {
            trackClass = 'track-community';
            TrackIcon = Leaf;
          }

          return (
            <div 
              key={proj.id}
              className={`glass-card project-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectProject(proj.id)}
            >
              <div className="project-card-header">
                <span className={`track-badge ${trackClass}`}>
                  <TrackIcon size={14} style={{ display: 'inline', marginLeft: 4 }} />
                  {proj.trackLabel}
                </span>
                {isSelected && (
                  <span className="badge badge-emerald">
                    <CheckCircle size={14} />
                    <span>المشروع النشط</span>
                  </span>
                )}
              </div>

              <h4>{proj.title}</h4>
              <p className="project-card-sub">{proj.titleEn}</p>

              <p className="summary">{proj.summary}</p>

              {/* Tools and Guardrail Highlights */}
              <div style={{ margin: '0.8rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>الأدوات الإضافية:</strong> {proj.toolsNeeded.slice(0, 3).join('، ')}...
                </div>
                <div style={{ color: 'var(--emerald-400)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>معيار الأمان:</strong> {proj.safetyStatus}
                </div>
              </div>

              <div className="project-meta-row">
                <div className="meta-item">
                  <Clock size={15} />
                  <span>{proj.duration}</span>
                </div>
                <div className="meta-item">
                  <Layers size={15} />
                  <span>{proj.difficulty}</span>
                </div>
                <div className="meta-item" style={{ marginRight: 'auto' }}>
                  <button 
                    type="button"
                    className="btn-submit-action"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(proj.id);
                      onProceedToGuide();
                    }}
                  >
                    <span>عرض الخطوات</span>
                    <ArrowLeft size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
