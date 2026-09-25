import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, X, Check, Layers, 
  ArrowRight, ShieldCheck, Flame, Droplets, Sparkles, Filter,
  Wand2, Bot
} from 'lucide-react';

import { 
  MATERIAL_CATEGORIES, 
  COMPREHENSIVE_MATERIALS, 
  evaluateMaterialsCompatibility,
  getMaterialThumbnail
} from '../data/materialsLibrary.js';

// Pre-configured AI Curated Synergistic Bundles
const AI_CURATED_BUNDLES = [
  {
    id: 'luxe_lighting',
    icon: '💡',
    name: 'توليفة الإضاءة الفاخرة',
    desc: 'خشب مشاتيح + برطمانات زجاج + إضاءة LED',
    tag: 'الأعلى طلباً',
    materialNames: ['خشب مشاتيح (Pallet Wood)', 'برطمانات زجاجية', 'سلك كهربائي ومصباح LED']
  },
  {
    id: 'smart_planter',
    icon: '🌿',
    name: 'توليفة الزراعة الحضرية الذكية',
    desc: 'قارورة بلاستيكية + حبل قطني + وعاء فخار',
    tag: 'وفر مائي 90%',
    materialNames: ['قارورة بلاستيكية', 'حبل قطني', 'أصيص أو وعاء فخاري مكسور']
  },
  {
    id: 'heavy_furniture',
    icon: '🪑',
    name: 'توليفة الأثاث العضوي المتين',
    desc: 'إطارات سيارات + حبال قنب + ألواح خشب',
    tag: 'متانة 8 سنوات',
    materialNames: ['إطارات سيارات مطاطية', 'حبال قنب متينة', 'خشب مشاتيح (Pallet Wood)']
  },
  {
    id: 'desk_organizer',
    icon: '📐',
    name: 'منظمات المكتب العصرية',
    desc: 'كرتون مقوى + علب صفيح + بقايا جلد',
    tag: 'تنفيذ سريع',
    materialNames: ['كرتون مقوى عالي الكثافة', 'علب صفيح معدنية', 'بقايا أقمشة وجينز']
  }
];

export default function MaterialsLibraryModal({ 
  isOpen, 
  onClose, 
  initialSelected = [], 
  onApplyMaterials 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [aiAssistantActive, setAiAssistantActive] = useState(true);

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

  // Dynamic AI Material Scientist Advice
  const aiScientistAdvice = useMemo(() => {
    if (selectedMaterialsList.length === 0) {
      return {
        speaker: 'د. ليلى المهدي (خبير هندسة المواد والروابط الكيميائية)',
        message: 'أهلاً بك! يمكنك تصفح الخامات أدناه أو النقر على إحدى التوليفات الذكية المعدة مسبقاً للبدء بأقوى تركيبة ذات جدوى تصنيعية عالية.',
        tone: 'neutral'
      };
    }
    if (selectedMaterialsList.length === 1) {
      const first = selectedMaterialsList[0];
      return {
        speaker: 'د. ليلى المهدي (خبير هندسة المواد)',
        message: `اختيار موفق لخامة (${first.name}). أقترح إضافة وسيلة تثبيت متوافقة كالغراء أو مسامير صلب لضمان متانة تزيد عن 5 سنوات.`,
        tone: 'advisory'
      };
    }
    if (compatibilityAnalysis) {
      return {
        speaker: 'د. ليلى المهدي (فحص التوافق اللحظي)',
        message: compatibilityAnalysis.notes || `توافق ممتاز بنسبة ${compatibilityAnalysis.score}%. التوليفة جاهزة للتصنيع المستدام بأعلى كفاءة.`,
        tone: compatibilityAnalysis.status === 'optimal' ? 'success' : 'warning'
      };
    }
    return {
      speaker: 'د. ليلى المهدي (خبير المواد)',
      message: 'الخامات المختارة متكاملة فيزيائياً وميكانيكياً.',
      tone: 'neutral'
    };
  }, [selectedMaterialsList, compatibilityAnalysis]);

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

  // Apply an AI Curated Bundle
  const handleApplyAiBundle = (bundle) => {
    const next = new Set();
    bundle.materialNames.forEach(name => {
      const found = COMPREHENSIVE_MATERIALS.find(m => m.name === name || m.id === name);
      if (found) next.add(found.id);
    });
    setSelectedItemIds(next);
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
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/80 backdrop-blur-lg animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
    >
      <div 
        className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative"
        dir="rtl"
        style={{ width: '100%', maxWidth: '1240px', maxHeight: '94vh' }}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-white relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm">
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
              استكشف الخامات المتوفرة لديك مع صور عالية الجودة. يقوم وكيل هندسة المواد بفحص التوافق الكيميائي والميكانيكي اللحظي وحساب الوفر البيئي تلقائياً.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border border-slate-200/80 active:scale-95"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Auto-Curator Section (الذكاء الاصطناعي المسيّر للمواد) */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-emerald-100 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-600 text-white">
                <Wand2 className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-black text-slate-900">
                توليفات الذكاء الاصطناعي الذاتية (1-Click AI Curated Bundles):
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline">
                مختارة ومجربة هندسياً
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAiAssistantActive(!aiAssistantActive)}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{aiAssistantActive ? 'إخفاء توجيهات الوكيل' : 'إظهار توجيهات الوكيل'}</span>
            </button>
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AI_CURATED_BUNDLES.map(bundle => (
              <button
                type="button"
                key={bundle.id}
                onClick={() => handleApplyAiBundle(bundle)}
                className="p-2.5 rounded-2xl bg-white/90 hover:bg-white border border-emerald-200/70 hover:border-emerald-500 text-right transition-all shadow-sm hover:shadow group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{bundle.icon}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100/60 text-emerald-800 font-bold">
                    {bundle.tag}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {bundle.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {bundle.desc}
                </div>
              </button>
            ))}
          </div>

          {/* AI Scientist Dynamic Commentary Banner */}
          {aiAssistantActive && (
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200/80 text-xs flex items-start gap-2.5 shadow-sm animate-fade-in">
              <span className="text-base flex-shrink-0 mt-0.5">🧪</span>
              <div className="flex-1">
                <span className="font-bold text-emerald-900 block text-[11px] mb-0.5">
                  {aiScientistAdvice.speaker}:
                </span>
                <span className="text-slate-700 text-[11px] leading-relaxed">
                  {aiScientistAdvice.message}
                </span>
              </div>
            </div>
          )}
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

        {/* Scrollable Materials Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {filteredMaterials.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Layers className="w-12 h-12 mx-auto text-slate-300 opacity-80" />
              <h3 className="text-base font-bold text-slate-700">لم يتم العثور على خامات مطابقة</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرب تغيير كلمة البحث أو إعادة تعيين تصفية التصنيفات ومستوى الصعوبة.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedDifficulty('all'); }}
                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                إعادة ضبط البحث
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMaterials.map(mat => {
                const isSelected = selectedItemIds.has(mat.id);
                const thumbUrl = getMaterialThumbnail(mat);

                return (
                  <div
                    key={mat.id}
                    onClick={() => toggleMaterial(mat.id)}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col group relative ${
                      isSelected
                        ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/30 shadow-md translate-y-[-2px]'
                        : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md'
                    }`}
                  >
                    {/* Material Image Banner */}
                    <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src={thumbUrl}
                        alt={mat.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      
                      {/* Selection Badge Checkmark */}
                      <div className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow ${
                        isSelected
                          ? 'bg-emerald-600 text-white scale-100'
                          : 'bg-white/80 backdrop-blur-sm text-transparent border border-slate-300 group-hover:border-emerald-500'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      {/* Category Badge on Image */}
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200 text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                        <span>{mat.icon}</span>
                        <span>{mat.category}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                          <span>{mat.name}</span>
                        </h4>
                        
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {mat.tips || mat.properties || 'خامة ممتازة لإعادة التدوير والتشكيل المنزلي.'}
                        </p>
                      </div>

                      {/* Eco Metrics Tags */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5 text-emerald-700 font-bold" title="وفر الكربون المتوقع">
                            <Flame className="w-3 h-3 text-emerald-600" />
                            <span>+{mat.carbonSavedKg || 1.2} كجم</span>
                          </span>
                          
                          {mat.waterSavedLiters && (
                            <span className="flex items-center gap-0.5 text-cyan-700 font-bold" title="وفر المياه">
                              <Droplets className="w-3 h-3 text-cyan-600" />
                              <span>+{mat.waterSavedLiters} لتر</span>
                            </span>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          mat.difficulty === 'سهل' || mat.difficulty === 'سهل جداً'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : mat.difficulty === 'متوسط'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {mat.difficulty}
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
