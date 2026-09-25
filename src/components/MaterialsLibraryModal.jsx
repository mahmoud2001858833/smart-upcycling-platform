import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, X, Check, Layers, 
  ArrowRight, ShieldCheck, Flame, Droplets, Sparkles
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
    // Map initial selected strings to IDs if matching
    const initialIds = new Set();
    initialSelected.forEach(item => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 

        className="bg-neutral-900 border border-emerald-500/30 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl shadow-emerald-950/50 overflow-hidden relative"
        dir="rtl"
      >
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-start justify-between gap-4 bg-neutral-900/90 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                مكتبة المواد الموسعة للاستدامة والتصنيع الذكي
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{COMPREHENSIVE_MATERIALS.length} مادة معتمدة</span>
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-3xl">
              تصفح واختر المواد المتاحة لديك بدقة، وسيقوم نظام التقييم الذكي بفحص التوافق الكيميائي والميكانيكي للربط، وحساب البصمة الكربونية والمائية فورياً.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors border border-neutral-700/50"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 bg-neutral-950/40 flex flex-col gap-3 relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، النوع، الاستخدام الشائع، أو الخصائص (مثلاً: إطارات، خشب، باليت، PET)..."
                className="w-full pr-10 pl-9 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-neutral-500 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400 hidden md:inline">
                النتائج ({filteredMaterials.length})
              </span>
              <button
                onClick={handleSelectAllFiltered}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                تحديد المعروض
              </button>
              {selectedItemIds.size > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-rose-950/40 text-rose-400 border border-neutral-700/60 hover:border-rose-800 transition-colors"
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span>🌐 الكل</span>
              <span className="text-[11px] opacity-80">({categoryCounts.all || 0})</span>
            </button>

            {MATERIAL_CATEGORIES.map(cat => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span>{cat.icon} {cat.label}</span>
                  <span className="text-[11px] opacity-85">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Difficulty Quick Filter */}
          <div className="flex items-center gap-2 pt-1 text-xs text-neutral-400">
            <span className="text-[11px]">مستوى الصعوبة:</span>
            {['all', 'سهل', 'متوسط', 'متقدم'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                  selectedDifficulty === diff
                    ? 'bg-neutral-800 text-emerald-400 border-emerald-500/50'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-neutral-200'
                }`}
              >
                {diff === 'all' ? 'جميع المستويات' : diff}
              </button>
            ))}
          </div>
        </div>


        {/* Modal Body: Materials Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative z-10 custom-scrollbar">
          {filteredMaterials.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h3 className="text-base font-bold text-neutral-300">لم يتم العثور على أي مادة مطابقة</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                جرب تغيير كلمة البحث أو اختيار تصنيف آخر للوصول لجميع المواد المتاحة.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-xs text-emerald-400 underline hover:text-emerald-300"
              >
                إعادة ضبط عوامل التصفية
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredMaterials.map(mat => {
                const isSelected = selectedItemIds.has(mat.id);
                const thumb = getMaterialThumbnail(mat);

                return (
                  <div
                    key={mat.id}
                    onClick={() => toggleMaterial(mat.id)}
                    className={`cursor-pointer rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/60 scale-[1.01]'
                        : 'bg-neutral-900/90 hover:bg-neutral-850 border-neutral-800 hover:border-neutral-700 hover:shadow-lg'
                    }`}
                  >
                    {/* Material Thumbnail Image Banner */}
                    <div className="relative h-28 w-full overflow-hidden bg-neutral-950">
                      <img
                        src={thumb}
                        alt={mat.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/40 pointer-events-none" />

                      {/* Category Pill Tag */}
                      <span className="absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded-full font-bold bg-black/75 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                        {mat.category}
                      </span>

                      {/* Selection checkbox indicator */}
                      <div className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isSelected 
                          ? 'bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/40 scale-105' 
                          : 'border-neutral-500/70 bg-black/60 group-hover:border-white'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 mb-1">
                          {mat.name}
                        </h4>

                        {/* Quick Specs / Footprints */}
                        <div className="grid grid-cols-2 gap-1.5 my-2 text-[10px] bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/60">
                          <div className="flex items-center gap-1 text-emerald-400" title="البصمة الكربونية للكيلوجرام">
                            <Flame className="w-3 h-3 flex-shrink-0" />
                            <span>{mat.carbonIntensityKgCO2ePerKg} كجم CO₂</span>
                          </div>
                          <div className="flex items-center gap-1 text-cyan-400" title="البصمة المائية للكيلوجرام">
                            <Droplets className="w-3 h-3 flex-shrink-0" />
                            <span>{mat.waterFootprintLPerKg} لتر ماء</span>
                          </div>
                        </div>

                        {/* Tips / Safety Note */}
                        <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                          {mat.tips || mat.commonUses}
                        </p>
                      </div>

                      {/* Bottom Metadata Badges */}
                      <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          mat.difficulty === 'سهل' || mat.difficulty === 'سهل جداً'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                            : mat.difficulty === 'متوسط'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                            : 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
                        }`}>
                          {mat.difficulty}
                        </span>

                        <span className="text-neutral-400 font-mono text-[10px]">
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
          <div className="px-5 py-3.5 bg-neutral-950 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className={`p-2.5 rounded-2xl flex items-center justify-center font-black text-sm border ${
                compatibilityAnalysis.status === 'optimal'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : compatibilityAnalysis.status === 'warning'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-rose-500/20 border-rose-500 text-rose-400'
              }`}>
                {compatibilityAnalysis.score}%
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>تقييم التوافق الميكانيكي والكيميائي: {compatibilityAnalysis.rating}</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 max-w-xl line-clamp-1">
                  {compatibilityAnalysis.notes}
                </p>
              </div>
            </div>

            {/* Recommendations Pill */}
            <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
              {compatibilityAnalysis.bondingRecommendations.slice(0, 2).map((rec, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                  💡 {rec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-900/95 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300 w-full sm:w-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              تم اختيار <strong className="text-white font-bold">{selectedItemIds.size}</strong> مادة من أصل {COMPREHENSIVE_MATERIALS.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedItemIds.size === 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                selectedItemIds.size > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 active:scale-95'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <span>تأكيد الاختيار وإضافتها للمشروع ({selectedItemIds.size})</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
