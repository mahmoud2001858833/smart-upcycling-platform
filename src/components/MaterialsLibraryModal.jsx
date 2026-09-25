import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, X, Check, Layers, 
  ArrowRight, ShieldCheck, Flame, Droplets, Sparkles, Filter
} from 'lucide-react';

import { 
  MATERIAL_CATEGORIES, 
  COMPREHENSIVE_MATERIALS, 
  evaluateMaterialsCompatibility,
  getMaterialThumbnail
} from '../data/materialsLibrary.js';

export default function MaterialsLibraryModal({ 
  isOpen, 
  onClose, 
  initialSelected = [], 
  onApplyMaterials 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Track selected material names/ids
  const [selectedItemIds, setSelectedItemIds] = useState(() => {
    const initialIds = new Set();
    (initialSelected || []).forEach(item => {
      const match = COMPREHENSIVE_MATERIALS.find(
        m => m.name.toLowerCase() === item.toLowerCase() || m.id.toLowerCase() === item.toLowerCase()
      );
      if (match) initialIds.add(match.id);
    });
    return initialIds;
  });

  // Filter materials based on search query, category, and difficulty
  const filteredMaterials = useMemo(() => {
    return COMPREHENSIVE_MATERIALS.filter(material => {
      const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || material.difficulty === selectedDifficulty;
      
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || (
        material.name.toLowerCase().includes(q) ||
        material.category.toLowerCase().includes(q) ||
        (material.searchTags && material.searchTags.some(t => t.toLowerCase().includes(q))) ||
        (material.tips && material.tips.toLowerCase().includes(q))
      );

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: COMPREHENSIVE_MATERIALS.length };
    COMPREHENSIVE_MATERIALS.forEach(m => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Selected material objects
  const selectedMaterialsList = useMemo(() => {
    return COMPREHENSIVE_MATERIALS.filter(m => selectedItemIds.has(m.id));
  }, [selectedItemIds]);

  // Real-time bonding & mechanical compatibility analysis
  const compatibilityAnalysis = useMemo(() => {
    if (selectedMaterialsList.length < 2) return null;
    return evaluateMaterialsCompatibility(selectedMaterialsList);
  }, [selectedMaterialsList]);

  // Toggle selection
  const toggleMaterial = (id) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      filteredMaterials.forEach(m => next.add(m.id));
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedItemIds(new Set());
  };

  const handleConfirm = () => {
    const selectedNames = selectedMaterialsList.map(m => m.name);
    onApplyMaterials(selectedNames, selectedMaterialsList);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
    >
      <div 
        className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        dir="rtl"
        style={{ width: '100%', maxWidth: '1200px', maxHeight: '92vh' }}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-white relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                مكتبة الخامات والمواد المستدامة
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{COMPREHENSIVE_MATERIALS.length} خامة مصنفة</span>
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              تصفح واختر المواد المتوفرة لديك مع صور توضيحية، وسيقوم نظام التقييم الذكي بفحص التوافق الكيميائي والميكانيكي للربط وحساب وفر الكربون فورياً.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200/60"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col gap-3 relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، النوع، الاستخدام الشائع، أو الخصائص (مثلاً: خشب، زجاج، كرتون، إطارات، باليت)..."
                className="w-full pr-10 pl-9 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden md:inline font-semibold">
                المعروض: {filteredMaterials.length}
              </span>
              <button
                onClick={handleSelectAllFiltered}
                className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 hover:border-emerald-400 transition-colors flex items-center gap-1.5 font-bold shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                تحديد المعروض
              </button>
              {selectedItemIds.size > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 hover:border-rose-300 transition-colors font-bold shadow-sm"
                >
                  إلغاء الكل ({selectedItemIds.size})
                </button>
              )}
            </div>
          </div>

          {/* Categories Pill Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>🌐 الكل</span>
              <span className="text-[11px] opacity-90 font-mono">({categoryCounts.all || 0})</span>
            </button>

            {MATERIAL_CATEGORIES.map(cat => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-sm ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.icon} {cat.label}</span>
                  <span className="text-[11px] opacity-90 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Difficulty Quick Filter */}
          <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-600">
            <span className="text-[11px] font-bold flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              مستوى الصعوبة:
            </span>
            {['all', 'سهل', 'متوسط', 'متقدم'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                  selectedDifficulty === diff
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {diff === 'all' ? 'جميع المستويات' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Materials Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 relative z-10 custom-scrollbar">
          {filteredMaterials.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white text-slate-400 flex items-center justify-center mx-auto text-2xl shadow-sm border border-slate-200">
                🔍
              </div>
              <h3 className="text-base font-bold text-slate-800">لم يتم العثور على أي خامة مطابقة</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرب تغيير كلمة البحث أو اختيار تصنيف آخر للوصول لجميع المواد المتاحة.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-xs text-emerald-700 font-bold underline hover:text-emerald-800"
              >
                إعادة ضبط عوامل التصفية
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMaterials.map(mat => {
                const isSelected = selectedItemIds.has(mat.id);
                const thumb = getMaterialThumbnail(mat);

                return (
                  <div
                    key={mat.id}
                    onClick={() => toggleMaterial(mat.id)}
                    className={`cursor-pointer rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'bg-emerald-50/50 border-2 border-emerald-600 shadow-lg shadow-emerald-600/15 ring-2 ring-emerald-500/20 scale-[1.01]'
                        : 'bg-white hover:bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    {/* Material Thumbnail Image Banner */}
                    <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src={thumb}
                        alt={mat.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-black/20 pointer-events-none" />

                      {/* Category Pill Tag */}
                      <span className="absolute top-2.5 right-2.5 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/60">
                        {mat.category}
                      </span>

                      {/* Selection checkbox indicator */}
                      <div className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isSelected 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-105' 
                          : 'border-white/80 bg-white/80 group-hover:border-emerald-500 shadow-sm'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
                          {mat.name}
                        </h4>

                        {/* Quick Specs / Footprints */}
                        <div className="grid grid-cols-2 gap-1.5 my-2 text-[11px]">
                          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/70 p-1.5 rounded-lg text-emerald-800 font-bold" title="البصمة الكربونية للكيلوجرام">
                            <Flame className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                            <span>{mat.carbonIntensityKgCO2ePerKg} كجم CO₂</span>
                          </div>
                          <div className="flex items-center gap-1 bg-cyan-50 border border-cyan-200/70 p-1.5 rounded-lg text-cyan-800 font-bold" title="البصمة المائية للكيلوجرام">
                            <Droplets className="w-3.5 h-3.5 flex-shrink-0 text-cyan-600" />
                            <span>{mat.waterFootprintLPerKg} لتر ماء</span>
                          </div>
                        </div>

                        {/* Tips / Safety Note */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {mat.tips || mat.commonUses}
                        </p>
                      </div>

                      {/* Bottom Metadata Badges */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          mat.difficulty === 'سهل' || mat.difficulty === 'سهل جداً'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : mat.difficulty === 'متوسط'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {mat.difficulty}
                        </span>

                        <span className="text-slate-600 font-bold font-mono text-[11px]">
                          قابلية: {mat.recyclabilityScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time Bonding & Mechanical Compatibility Evaluator Dock */}
        {compatibilityAnalysis && (
          <div className="px-5 py-3.5 bg-emerald-50 border-t border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className={`p-2.5 rounded-2xl flex items-center justify-center font-black text-sm border shadow-sm ${
                compatibilityAnalysis.status === 'optimal'
                  ? 'bg-white border-emerald-500 text-emerald-700'
                  : compatibilityAnalysis.status === 'warning'
                  ? 'bg-white border-amber-500 text-amber-700'
                  : 'bg-white border-rose-500 text-rose-700'
              }`}>
                {compatibilityAnalysis.score}%
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>تقييم التوافق الميكانيكي والكيميائي: {compatibilityAnalysis.rating}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 max-w-xl line-clamp-1">
                  {compatibilityAnalysis.notes}
                </p>
              </div>
            </div>

            {/* Recommendations Pill */}
            <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
              {compatibilityAnalysis.bondingRecommendations.slice(0, 2).map((rec, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-emerald-200 font-bold shadow-sm">
                  💡 {rec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 w-full sm:w-auto font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              تم اختيار <strong className="text-emerald-700 font-bold">{selectedItemIds.size}</strong> خامة من أصل {COMPREHENSIVE_MATERIALS.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedItemIds.size === 0}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                selectedItemIds.size > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>تأكيد واستخدام المواد المحددة ({selectedItemIds.size})</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
