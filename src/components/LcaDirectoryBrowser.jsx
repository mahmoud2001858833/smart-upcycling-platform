import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  Filter, 
  ExternalLink, 
  Check, 
  FileJson,
  Layers,
  Sparkles
} from 'lucide-react';
import lcaData from '../data/lcaDatabase.json';

const CATEGORIES = [
  { key: 'ALL', label: 'كافة المصادر (150 مرجعاً)' },
  { key: 'Plastics & Polymers', label: '1. البلاستيك والبوليمرات (1–30)' },
  { key: 'Paper, Pulp & Cardboard', label: '2. الورق والكرتون (31–55)' },
  { key: 'Metals', label: '3. المعادن وخردة الصلب (56–75)' },
  { key: 'Textiles & Fabrics', label: '4. المنسوجات والأقمشة (76–95)' },
  { key: 'Glass & Ceramics', label: '5. الزجاج والخزف (96–115)' },
  { key: 'Electronic Waste & Household Components', label: '6. النفايات الإلكترونية (116–135)' },
  { key: 'Organic & Miscellaneous Waste / Landfill', label: '7. المطامر والنفايات العضوية (136–150)' },
];

export default function LcaDirectoryBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSourceDetail, setSelectedSourceDetail] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filtered and searched data
  const filteredData = useMemo(() => {
    return lcaData.filter(item => {
      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        item.source_id.toLowerCase().includes(q) ||
        item.authority.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q) ||
        item.application_context.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleCategoryChange = (key) => {
    setSelectedCategory(key);
    setCurrentPage(1);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lcaData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "verified_150_lca_carbon_benchmark_sources.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopySourceJson = (src) => {
    navigator.clipboard.writeText(JSON.stringify(src, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="directory-section">
      <div className="glass-card glow-card directory-box">
        {/* Section Header */}
        <div className="section-heading" style={{ marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem' }}>
              <Database size={24} color="#06b6d4" />
              <span>دليل البصمة الكربونية المرجعي (150 مصدراً معتمداً عالمياً)</span>
            </h3>
            <p style={{ fontSize: '0.88rem' }}>
              مصفوفة الانبعاثات القياسية المعتمدة من IPCC, US EPA WARM, DEFRA, Ecoinvent, ADEME, Sphera GaBi, World Bank.
            </p>
          </div>

          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleExportJson}
            title="تصدير قاعدة بيانات الـ 150 مصدراً بصيغة JSON"
          >
            <Download size={16} />
            <span>تصدير المصفوفة (JSON)</span>
          </button>
        </div>

        {/* Search and Category Filter Controls */}
        <div className="directory-controls-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon-pos" />
            <input 
              type="text" 
              className="search-input-field"
              placeholder="ابحث بالهيئة الدولية (مثل IPCC, EPA, DEFRA) أو كود المادة (SRC-PLAS) أو الوصف..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="category-chips-list">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                type="button"
                className={`category-chip-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span>عرض {paginatedData.length} من أصل {filteredData.length} مصدراً مطابقاً (إجمالي القاعدة: 150)</span>
          <span>الصفحة {currentPage} من {Math.max(1, totalPages)}</span>
        </div>

        {/* Table of 150 Sources */}
        <div className="lca-table-responsive">
          <table className="lca-table">
            <thead>
              <tr>
                <th>كود المصدر</th>
                <th>الفئة الرئيسية</th>
                <th>الهيئة / المنظمة المعتمدة</th>
                <th>نطاق القياس والخامة</th>
                <th>معامل الانبعاث (kg CO₂e / kg)</th>
                <th>سياق التطبيق بالمنصة</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr 
                  key={item.source_id}
                  onClick={() => setSelectedSourceDetail(item)}
                  style={{ cursor: 'pointer' }}
                  title="انقر لعرض تفاصيل التوثيق وسياق التطبيق"
                >
                  <td>
                    <span className="src-id-badge">{item.source_id}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{item.authority}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {item.scope}
                    </span>
                  </td>
                  <td>
                    <span className="emission-factor-val">
                      {item.emission_factor_kg_co2e_per_kg.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.application_context.slice(0, 75)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              السابق
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                className={`step-indicator-btn ${currentPage === page ? 'active' : ''}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button 
              type="button" 
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* Source Detail Modal */}
      {selectedSourceDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedSourceDetail(null)}>
          <div className="glass-card" style={{ maxWidth: '640px', width: '100%', padding: '2rem', background: 'var(--bg-card-solid)', border: '2px solid var(--border-accent)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="src-id-badge" style={{ fontSize: '1rem' }}>{selectedSourceDetail.source_id}</span>
                <span className="badge badge-emerald">{selectedSourceDetail.category}</span>
              </div>
              <button className="btn-secondary" style={{ padding: '0.2rem 0.6rem' }} onClick={() => setSelectedSourceDetail(null)}>
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>{selectedSourceDetail.authority}</h3>
            
            <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>نطاق التغطية والمادة:</strong>
                <p style={{ color: 'var(--text-primary)', marginTop: '0.2rem' }}>{selectedSourceDetail.scope}</p>
              </div>

              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>معامل الانبعاث المعتمد:</strong>
                <div className="emission-factor-val" style={{ fontSize: '1.4rem', display: 'block', marginTop: '0.2rem' }}>
                  {selectedSourceDetail.emission_factor_kg_co2e_per_kg} kg CO₂e / kg
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>سياق التطبيق في المنصة:</strong>
                <p style={{ color: 'var(--emerald-400)', background: 'rgba(16, 185, 129, 0.08)', padding: '0.8rem', borderRadius: 'var(--radius-md)', marginTop: '0.2rem', fontSize: '0.85rem' }}>
                  {selectedSourceDetail.application_context}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => handleCopySourceJson(selectedSourceDetail)}
              >
                {copiedJson ? <Check size={14} color="#10b981" /> : <FileJson size={14} />}
                <span>{copiedJson ? 'تم النسخ' : 'نسخ كائن JSON'}</span>
              </button>

              <button 
                type="button"
                className="btn-submit-action"
                onClick={() => setSelectedSourceDetail(null)}
              >
                <span>إغلاق</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
