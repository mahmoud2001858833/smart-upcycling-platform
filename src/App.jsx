import React, { useState, useRef, useMemo, useEffect, lazy, Suspense } from 'react';
import confetti from 'canvas-confetti';
import {
  Recycle, Lightbulb, Star, Send, ArrowLeft, Camera, Loader2,
  Clock, Leaf, ChevronDown,
  Share2, BookOpen, Target, Shield, CheckCircle,
  Trophy, Calculator, Check, Trash2, Award, Printer,
  CheckCheck, QrCode, Sparkles, MessageSquare,
  X, Database, LogIn, LogOut, HelpCircle, Layers,
  Grid, Eye, BarChart2, GraduationCap, Menu,
  AlertCircle, RotateCcw, Activity, Bot, Wand2, Plus, Download, Play,
  Smartphone, WifiOff, TrendingUp, Cpu
} from 'lucide-react';
import SidebarNav from './components/SidebarNav.jsx';
import GenerationProgressPanel from './components/GenerationProgressPanel.jsx';
import ViewLoadingFallback from './components/ViewLoadingFallback.jsx';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import {
  COMMON_MATERIALS,
  USER_LEVELS,
  PROJECT_TYPES,
  fetchAiProjects,
  regenerateSpecificGalleryView,
  regenerateStepImage,
  sendChatMessageToAi,
  getStoredGeminiApiKey
} from './utils/aiProjectEngine.js';
import { calculateCollectiveOffset } from './utils/lcaCalculator.js';
import { PRESET_SCENARIOS } from './data/presetScenarios.js';
import { 
  INSPIRATION_SUGGESTIONS, 
  COMPANION_SUGGESTIONS_MAP, 
  PROJECT_CUSTOMIZATION_SUGGESTIONS 
} from './data/inspirationSuggestions.js';
import { useAuth } from './context/AuthContext';
import { streamChatMessage } from './utils/resilientAiStream.js';

// Dynamic Code Splitting via React.lazy() for fast initial bundle
const CarbonCalculatorView = lazy(() => import('./components/CarbonCalculatorView.jsx'));
const SmartEnvironmentalForecasting = lazy(() => import('./components/SmartEnvironmentalForecasting.jsx'));
const LcaDirectoryBrowser = lazy(() => import('./components/LcaDirectoryBrowser.jsx'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const MaterialsLibraryModal = lazy(() => import('./components/MaterialsLibraryModal.jsx'));
const ProjectDedicatedPage = lazy(() => import('./components/ProjectDedicatedPage.jsx'));
const EcoCertificateModal = lazy(() => import('./components/EcoCertificateModal.jsx'));
const StudentPortalSection = lazy(() => import('./components/StudentPortalSection.jsx'));
const StudentLabReportModal = lazy(() => import('./components/StudentLabReportModal.jsx'));
const StudentRubricModal = lazy(() => import('./components/StudentRubricModal.jsx'));
const StudentQuizModal = lazy(() => import('./components/StudentQuizModal.jsx'));
const PlatformTourPage = lazy(() => import('./components/PlatformTourPage.jsx'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard.jsx'));
const InlineConsultationModal = lazy(() => import('./components/InlineConsultationModal.jsx'));
const CertificateVerificationModal = lazy(() => import('./components/CertificateVerificationModal.jsx'));

import {
  getSavedProjects,
  saveProjectToCloud,
  deleteProjectFromCloud,
  getUserProfileStats,
  updateUserProfileStats,
  normalizeProjectTitle
} from './utils/supabaseSync.js';
import { handleImageFallback, generateSvgBlueprint, preloadProjectImages } from './utils/imageCatalog.js';
import { ProjectCover, ViewThumb } from './components/AiImage.jsx';
import GenerationProgress from './components/GenerationProgress.jsx';
import CapacityBanner from './components/CapacityBanner.jsx';
import { isLimitError } from './utils/aiGateway.js';
import { usePlatformStatus } from './hooks/usePlatformStatus.js';
import './index.css';
import './polish.css';

// Resilient check to see if a project is already saved in the user's list
function isProjectSaved(list, p) {
  if (!Array.isArray(list) || !p) return false;
  const pTitle = (p.title || p.name || '').trim();
  const pNorm = normalizeProjectTitle(pTitle);
  return list.some(item => {
    if (p.id && item.id && item.id === p.id) return true;
    const itemNorm = normalizeProjectTitle(item.title || item.name || '');
    return itemNorm && itemNorm === pNorm;
  });
}

const ARCHETYPE_AR = {
  lighting: 'إضاءة', furniture: 'أثاث', garden: 'زراعة ذكية', kinetic: 'حركة وميكانيكا', sound: 'صوت',
  storage: 'تخزين وتنظيم', wearable: 'إكسسوار', educational: 'تعليمي وعلمي'
};

function projectCo2(p) {
  const v = p?.co2SavedKg ?? p?.lcaMetrics?.carbonSavedKg ?? p?.metrics?.co2SavedKg;
  if (v == null || Number.isNaN(Number(v))) return null;
  return String(Math.round(Number(v) * 10) / 10);
}

function bestProjectIndex(list) {
  let best = -1;
  let bestScore = -1;
  list.forEach((p, i) => {
    const sc = p?.aiConcept?.rankScore;
    if (typeof sc === 'number' && sc > bestScore) { bestScore = sc; best = i; }
  });
  return best;
}

const SCORE_LABELS = [
  ['wow', 'إبهار'],
  ['novelty', 'ابتكار'],
  ['usefulness', 'فائدة'],
  ['feasibility', 'سهولة التنفيذ']
];

function ConceptMeters({ scores }) {
  if (!scores) return null;
  return (
    <div className="concept-meters">
      {SCORE_LABELS.map(([k, label]) => {
        const v = Math.max(0, Math.min(10, Number(scores[k]) || 0));
        return (
          <div key={k} className="concept-meter">
            <span className="concept-meter-label">{label}</span>
            <span className="concept-meter-track"><span style={{ width: `${v * 10}%` }} /></span>
            <span className="concept-meter-val">{v}/10</span>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const { user, session, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);
  const [isMaterialsLibraryOpen, setIsMaterialsLibraryOpen] = useState(false);
  const [activeCertModalProject, setActiveCertModalProject] = useState(null);
  const [activeLabReportProject, setActiveLabReportProject] = useState(null);
  const [activeRubricProject, setActiveRubricProject] = useState(null);
  const [activeQuizProject, setActiveQuizProject] = useState(null);
  const [isGeminiKeyModalOpen, setIsGeminiKeyModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(() => Boolean(getStoredGeminiApiKey()));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [inlineConsultation, setInlineConsultation] = useState({
    isOpen: false,
    project: null,
    query: ''
  });
  const [verificationData, setVerificationData] = useState(null);
  const fileInputRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Listen for #verify hash in URL for real scannable QR verification
  useEffect(() => {
    const handleCheckHash = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#verify')) {
        const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
        const params = new URLSearchParams(queryStr);
        setVerificationData({
          certId: params.get('cert') || 'CERT-LCA-VERIFIED-2026',
          studentName: params.get('student') || 'طالب الابتكار البيئي',
          projectName: params.get('project') || 'مشروع إعادة التدوير المبتكر',
          co2: params.get('co2') || '3.50',
          mass: params.get('mass') || '2.10',
          kwh: params.get('kwh') || '450',
          school: params.get('school') || 'المنصة الوطنية للتدوير والاستدامة',
          date: params.get('date') || new Date().toLocaleDateString('ar-EG')
        });
      }
    };

    handleCheckHash();
    window.addEventListener('hashchange', handleCheckHash);
    return () => window.removeEventListener('hashchange', handleCheckHash);
  }, []);


  // Handle click outside for user profile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Server-verified platform state: capacity banner + whether this viewer is the admin
  const platform = usePlatformStatus(session?.access_token || null);
  const isOnline = useOnlineStatus();

  // Main navigation tab: 'generator' | 'calculator' | 'directory' | 'saved' | 'chat' | 'certificate'
  const [activeTab, setActiveTab] = useState('generator');

  // Toast feedback state
  const [toast, setToast] = useState(null);

  // Input states
  const [materials, setMaterials] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([
    'زجاج',
    'خشب',
    'علب ألمنيوم'
  ]);
  const [userLevel, setUserLevel] = useState('adult');
  const [projectType, setProjectType] = useState('practical');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [genProgress, setGenProgress] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const resultsRef = useRef(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);

  // Projects & UI states
  const [projects, setProjects] = useState([]);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [generatingImageFor, setGeneratingImageFor] = useState(null);
  const [regeneratingStepId, setRegeneratingStepId] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [materialSelectTab, setMaterialSelectTab] = useState('grid'); // 'grid' | 'custom' | 'packs'
  const [projectsViewMode, setProjectsViewMode] = useState('spotlight'); // 'spotlight' | 'grid' | 'compare'
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState(0);

  // LCA Calculator State
  const [currentPresetId, setCurrentPresetId] = useState(PRESET_SCENARIOS[0].id);
  const [calculatorMaterials, setCalculatorMaterials] = useState(() => PRESET_SCENARIOS[0].materials);
  const lcaResults = useMemo(() => calculateCollectiveOffset(calculatorMaterials), [calculatorMaterials]);

  const handleSelectPresetScenario = (scenario) => {
    setCurrentPresetId(scenario.id);
    setCalculatorMaterials(scenario.materials);
    showToast(`تم تطبيق حسابات سيناريو "${scenario.title}"! 📊`);
  };

  // V3 Upgraded Interactive States
  const [lightboxImage, setLightboxImage] = useState(null); // { url, title, subtitle }
  const [projectContextForChat, setProjectContextForChat] = useState(null);

  // Gamification & Environmental Impact
  const [completedProjects, setCompletedProjects] = useState(1);
  const [environmentalPoints, setEnvironmentalPoints] = useState(40);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Celebration Confetti helper
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  // Sync projects and stats with Supabase cloud
  useEffect(() => {
    let isMounted = true;
    async function syncData() {
      if (user?.id) {
        const cloudProjects = await getSavedProjects(user.id);
        if (isMounted) setSavedProjects(cloudProjects);
        const stats = await getUserProfileStats(user.id);
        if (isMounted) {
          setEnvironmentalPoints(stats.points);
          setCompletedProjects(stats.completed);
        }
      } else {
        const localProjects = await getSavedProjects(null);
        if (isMounted) setSavedProjects(localProjects);
      }
    }
    syncData();
    return () => { isMounted = false; };
  }, [user]);

  // Deep-linking URL hash sync for dedicated project pages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#project/')) {
        const projId = hash.replace('#project/', '');
        const allList = [...projects, ...savedProjects];
        const found = allList.find(p => p.id === projId || p.name === projId);
        if (found) {
          setSelectedProjectModal(found);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [projects, savedProjects]);

  const handleApplyLibraryMaterials = (selectedNames) => {
    if (selectedNames && selectedNames.length > 0) {
      setSelectedMaterials(selectedNames);
      showToast(`🌿 تم تحديد ${selectedNames.length} مادة من المكتبة الموسعة بنجاح!`, 'success');
    }
  };


  // Chat with Expert State
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'أهلاً بك! أنا المساعد البيئي الذكي لمنصة مُدام. يمكنني مساعدتك في تحليل أي خامات، واقتراح طرق الربط والقص الآمنة، وتطوير أفكار مبتكرة لكل مشروع.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Selected Project for Eco Certificate
  const [certificateProject, setCertificateProject] = useState(null);

  // Certificate metadata - fixed state prevents React purity warnings
  const [certId] = useState(() => `SA-LCA-2026-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const currentDate = useMemo(() => new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), []);

  // Toggle material chip
  const toggleMaterial = (mat) => {
    setSelectedMaterials(prev =>
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  // Dynamic Companion Material Suggestions based on active selection
  const companionSuggestions = useMemo(() => {
    const list = new Set();
    const currentText = [...selectedMaterials, materials].join(' ').toLowerCase();

    Object.keys(COMPANION_SUGGESTIONS_MAP).forEach(key => {
      if (currentText.includes(key.toLowerCase())) {
        COMPANION_SUGGESTIONS_MAP[key].forEach(sug => {
          if (!selectedMaterials.includes(sug)) {
            list.add(sug);
          }
        });
      }
    });
    return Array.from(list).slice(0, 5);
  }, [selectedMaterials, materials]);

  // Handle clicking an Inspiration Suggestion Card
  const handleApplyInspiration = (sug) => {
    setSelectedMaterials(sug.materials);
    setUserLevel(sug.userLevel || 'adult');
    setProjectType(sug.projectType || 'practical');
    showToast(`✨ تم تطبيق اقتراح "${sug.title}" بنجاح! جاهز لابتكار المشاريع 🚀`, 'success');
  };

  // Handle adding a companion suggested material
  const handleAddCompanionMaterial = (mat) => {
    if (!selectedMaterials.includes(mat)) {
      setSelectedMaterials(prev => [...prev, mat]);
      showToast(`➕ تم إضافة خامة "${mat}" المقترحة ذكياً!`, 'success');
    }
  };

  // Handle clicking a Project Customization Suggestion (On-Page Inline Consultation)
  const handleCustomizationSuggestion = (sug, project) => {
    const target = project || projects[0] || selectedProjectModal;
    const prompt = sug.promptTemplate(target);
    setInlineConsultation({
      isOpen: true,
      project: target,
      query: prompt
    });
    showToast(`💡 تم فتح استشارة الخبير الذكي في نفس الصفحة!`, 'info');
  };

  // Environmental impact calculations
  const impact = useMemo(() => {
    const wasteReduced = completedProjects * 0.75;
    const co2Saved = completedProjects * 1.65;
    return { wasteReduced, co2Saved };
  }, [completedProjects]);


  // Patch a project's hero picture when the AI image finishes (kept in memory only, never saved)
  const patchProjectHero = (projectId, view, url) => {
    const apply = (p) => {
      if (!p || p.id !== projectId) return p;
      const key = view === 'finished' ? 'finished' : view;
      const gallery = { ...(p.gallery || {}), [key]: url };
      const multi = { ...(p.multiAngleViews || {}), [key]: url };
      return {
        ...p,
        gallery,
        multiAngleViews: multi,
        ...(key === 'finished' ? { generatedImage: url, image: url } : {})
      };
    };
    setProjects(prev => prev.map(apply));
    setSelectedProjectModal(prev => (prev ? apply(prev) : prev));
  };

  // Generate Projects with Live AI Engine (with 60-second timeout & safe retry)
  const handleGenerateProjects = async () => {
    const allMaterials = [...selectedMaterials];
    if (materials.trim()) {
      const extra = materials.split(/[،,\n]+/).map(m => m.trim()).filter(Boolean);
      allMaterials.push(...extra);
    }

    if (allMaterials.length === 0) {
      showToast('يرجى اختيار أو كتابة المواد المتوفرة لديك ليولد الذكاء الاصطناعي مشاريع مخصصة لها', 'info');
      return;
    }

    setIsLoading(true);
    setGenProgress({ phase: 'ideate', message: 'عصف ذهني…', materials: allMaterials.join('، ') });
    setGenerationError(null);
    setLoadingStep('تحليل بنية المواد والخواص الفيزيائية وتوزيع المهام...');

    // 60-second timeout controller
    let timeoutId = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('TIMEOUT_60S'));
      }, 60000);
    });

    try {
      const materialsString = allMaterials.join('، ');
      const fetchPromise = fetchAiProjects({
        materials: materialsString,
        userLevel,
        projectType,
        onProgress: (p) => { setLoadingStep(p.message); setGenProgress(prev => ({ ...(prev || {}), ...p })); }
      });
      // Race between API call and 60-second timeout
      const res = await Promise.race([fetchPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      if (res?.notice) showToast(res.notice, 'info');
      if (res && res.usedFallback) {
        showToast('تعذر الوصول لمحرك الذكاء الاصطناعي المتقدم فاستُخدم المولّد البديل: ' + (res.fallbackReason || ''), 'info');
      }

      if (res && res.success && res.projects?.length > 0) {
        setProjects(res.projects);
        setActiveSpotlightIndex(0);
        res.projects.forEach(p => preloadProjectImages(p));
        setFollowUpQuestions(res.followUpQuestions || []);
        setCertificateProject(res.projects[0]);
        setEnvironmentalPoints(p => p + 15);
        setGenerationError(null);

        // Auto-save all generated projects to Saved Projects list safely
        try {
          for (const proj of res.projects) {
            await saveProjectToCloud(user?.id, proj);
          }
          const updatedSaved = await getSavedProjects(user?.id);
          setSavedProjects(updatedSaved);
        } catch (saveErr) {
          console.warn('Auto-save warning:', saveErr);
        }

        showToast(`✨ تم ابتكار ${res.projects.length} مشاريع وحفظها تلقائياً في قائمة المحفوظات!`);
      } else {
        setGenerationError('تعذّر التوليد، يرجى المحاولة مرة أخرى.');
        showToast('تعذر توليد المشاريع، يرجى المحاولة مجدداً', 'error');
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('Error generating AI projects:', err);
      if (err.message === 'TIMEOUT_60S') {
        setGenerationError('استغرقت العملية أكثر من 60 ثانية نظراً للضغط على محرك الذكاء الاصطناعي. موادك وخياراتك ما زالت محفوظة، اضغط أدناه لإعادة المحاولة.');
        showToast('تعذّر التوليد، تجاوزت العملية المهلة المحددة (60 ثانية)', 'error');
      } else if (isLimitError(err)) {
        setGenerationError(err.message);
        showToast(err.message, 'info');
      } else {
        setGenerationError('تعذّر التوليد، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ' + (err.message || 'حاول مرة أخرى'));
        showToast('حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي', 'error');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
      setGenProgress(null);
    }
  };

  // Bring the results area into view when generation starts (so progress is visible) and when it ends
  const wasLoadingRef = useRef(false);
  useEffect(() => {
    if (isLoading && !wasLoadingRef.current) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  // AI Auto-Pilot: The AI takes full autonomous steering and generates the optimal project!
  const handleAiAutoPilot = async () => {
    const topScenario = INSPIRATION_SUGGESTIONS[0] || {
      title: 'وحدة إضاءة ديكورية فاخرة',
      materials: ['خشب مشاتيح', 'برطمانات زجاجية'],
      difficulty: 'متوسط',
      type: 'ديكور منزلي'
    };
    setSelectedMaterials(topScenario.materials);
    setUserLevel(topScenario.difficulty || 'متوسط');
    setProjectType(topScenario.type || 'ديكور منزلي');
    showToast(`🤖 تولى الذكاء الاصطناعي القيادة الكاملة واختار: "${topScenario.title}"! جاري هندسة المشاريع...`, 'success');
    
    setIsLoading(true);
    setGenProgress({ phase: 'ideate', message: 'عصف ذهني…', materials: topScenario.materials.join('، ') });
    setLoadingStep('الذكاء الاصطناعي يدير هندسة المشروع ويوزع المهام على الوكلاء الستة...');
    try {
      const res = await fetchAiProjects({
        materials: topScenario.materials.join('، '),
        userLevel: topScenario.difficulty || 'متوسط',
        projectType: topScenario.type || 'ديكور منزلي',
        onProgress: (p) => { setLoadingStep(p.message); setGenProgress(prev => ({ ...(prev || {}), ...p })); }
      });
      if (res.success && res.projects?.length > 0) {
        setProjects(res.projects);
        setActiveSpotlightIndex(0);
        res.projects.forEach(p => preloadProjectImages(p));
        setFollowUpQuestions(res.followUpQuestions || []);
        setCertificateProject(res.projects[0]);
        setEnvironmentalPoints(p => p + 25);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        try {
          for (const proj of res.projects) {
            await saveProjectToCloud(user?.id, proj);
          }
          const updatedSaved = await getSavedProjects(user?.id);
          setSavedProjects(updatedSaved);
        } catch (saveErr) {
          console.warn('Auto-save warning:', saveErr);
        }
        showToast('🚀 تم إنجاز التوجيه الذاتي وتوليد وحفظ المشاريع الفاخرة بنجاح!');
      }
    } catch (err) {
      console.error(err);
      showToast(isLimitError(err) ? err.message : 'حدث خطأ أثناء التوجيه الذاتي للذكاء الاصطناعي', isLimitError(err) ? 'info' : 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
      setGenProgress(null);
    }
  };

  // Switch Gallery View (finished | assembly | inUse)
  const handleSwitchGalleryView = (projectIndex, viewKey) => {
    setProjects(prev => prev.map((p, idx) => {
      const match = typeof projectIndex === 'number' 
        ? idx === projectIndex 
        : (selectedProjectModal && (p.id === selectedProjectModal.id || p.name === selectedProjectModal.name));
      if (match) {
        return {
          ...p,
          activeGalleryView: viewKey,
          generatedImage: p.gallery?.[viewKey] || p.generatedImage
        };
      }
      return p;
    }));

    if (selectedProjectModal) {
      setSelectedProjectModal(prev => prev ? ({
        ...prev,
        activeGalleryView: viewKey,
        generatedImage: prev.gallery?.[viewKey] || prev.generatedImage
      }) : null);
    }
  };

  // Regenerate Specific Gallery View via AI
  const handleRegenerateView = async (project, projectIndex, viewKey) => {
    const proj = project || selectedProjectModal;
    if (!proj) return;
    const projIdx = typeof projectIndex === 'number' 
      ? projectIndex 
      : projects.findIndex(p => p.id === proj.id || p.name === proj.name);

    setGeneratingImageFor(`${projIdx >= 0 ? projIdx : 'modal'}-${viewKey}`);
    try {
      const res = await regenerateSpecificGalleryView({
        projectName: proj.name,
        projectIdea: proj.idea,
        projectMaterials: proj.materials,
        viewType: viewKey
      });

      if (res.success && res.imageUrl) {
        setProjects(prev => prev.map((p, idx) => {
          if (idx === projIdx || p.id === proj.id || p.name === proj.name) {
            const updatedGallery = {
              ...p.gallery,
              [viewKey]: res.imageUrl
            };
            return {
              ...p,
              gallery: updatedGallery,
              generatedImage: res.imageUrl
            };
          }
          return p;
        }));

        setSelectedProjectModal(prev => {
          if (!prev) return null;
          return {
            ...prev,
            gallery: {
              ...prev.gallery,
              [viewKey]: res.imageUrl
            },
            generatedImage: res.imageUrl
          };
        });

        setEnvironmentalPoints(p => p + 5);
        showToast('تم توليد مشهد بصري جديد بنجاح! 🎨');
      }
    } catch (err) {
      console.error('Error regenerating gallery view:', err);
      showToast('تعذر توليد الصورة، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setGeneratingImageFor(null);
    }
  };

  // Toggle Step Checkbox in Interactive Mode
  const handleToggleStep = (projectIndex, stepId) => {
    setProjects(prev => prev.map((p, idx) => {
      const match = typeof projectIndex === 'number' 
        ? idx === projectIndex 
        : (selectedProjectModal && (p.id === selectedProjectModal.id || p.name === selectedProjectModal.name));

      if (match && Array.isArray(p.parsedSteps)) {
        let gainedPoints = false;
        const updatedSteps = p.parsedSteps.map(st => {
          if (st.id === stepId) {
            if (!st.completed) gainedPoints = true;
            return { ...st, completed: !st.completed };
          }
          return st;
        });

        if (gainedPoints) {
          setEnvironmentalPoints(pts => pts + 5);
        }

        return { ...p, parsedSteps: updatedSteps };
      }
      return p;
    }));

    if (selectedProjectModal && Array.isArray(selectedProjectModal.parsedSteps)) {
      setSelectedProjectModal(prev => {
        if (!prev) return null;
        const updatedSteps = prev.parsedSteps.map(st => {
          if (st.id === stepId) {
            return { ...st, completed: !st.completed };
          }
          return st;
        });
        return { ...prev, parsedSteps: updatedSteps };
      });
    }
  };

  // Regenerate Step-specific image via AI
  const handleRegenerateStepImage = async (project, stepId) => {
    const targetProject = project || selectedProjectModal;
    if (!targetProject) return;

    setRegeneratingStepId(stepId);
    try {
      const currentStep = targetProject.parsedSteps?.find(s => s.id === stepId);
      const res = await regenerateStepImage({
        projectName: targetProject.name,
        stepNumber: stepId,
        stepTitle: currentStep?.title || '',
        projectMaterials: targetProject.materials,
        currentUrl: currentStep?.image || ''
      });

      if (res.success && res.imageUrl) {
        const updatedSteps = (targetProject.parsedSteps || []).map(s => {
          if (s.id === stepId) {
            return { ...s, image: res.imageUrl };
          }
          return s;
        });

        // Update in projects list
        setProjects(prev => prev.map(p => {
          if (p.id === targetProject.id || p.name === targetProject.name) {
            return { ...p, parsedSteps: updatedSteps };
          }
          return p;
        }));

        // Update in selected modal
        setSelectedProjectModal(prev => prev ? ({ ...prev, parsedSteps: updatedSteps }) : null);

        showToast(`تم تحديث وتوليد صورة جديدة للمرحلة ${stepId} بنجاح! 🎨`);
      }
    } catch (err) {
      console.error('Error regenerating step image:', err);
      showToast('تعذر تجديد صورة الخطوة، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setRegeneratingStepId(null);
    }
  };

  // Consult AI Expert specifically about this project (On-Page Inline Consultation)
  const handleConsultExpertForProject = (project) => {
    const target = project || selectedProjectModal || projects[0];
    const materialsStr = typeof target?.materials === 'string' ? target.materials : (target?.materials?.join?.(', ') || 'الخامات المستصلحة');
    const introQuery = `أود استشارتك حول مشروع "${target?.name || target?.title || 'مشروعي'}" المصنوع من (${materialsStr}). كيف أبدأ بالتنفيذ العملي بأعلى درجات الأمان والمتانة وبأقل تكلفة؟`;
    setInlineConsultation({
      isOpen: true,
      project: target,
      query: introQuery
    });
    showToast(`💡 تم فتح استشارة الخبير في نفس الصفحة!`, 'info');
  };

  // Save Project with Supabase Cloud Sync
  const handleSaveProject = async (project) => {
    if (!project) return;
    const projTitle = (project.title || project.name || '').trim();
    if (isProjectSaved(savedProjects, project)) {
      showToast('هذا المشروع محفوظ لديك بالفعل!', 'info');
      return;
    }
    const res = await saveProjectToCloud(user?.id, project);
    const updated = await getSavedProjects(user?.id);
    setSavedProjects(updated);
    showToast(`تم حفظ مشروع "${projTitle}" في قائمتك المفضلة! ⭐`);
  };

  // Delete Project from Cloud & Local
  const handleDeleteSavedProject = async (projectId, projectIdx) => {
    await deleteProjectFromCloud(user?.id, projectId);
    setSavedProjects(prev => prev.filter((p, i) => (projectId ? p.id !== projectId : i !== projectIdx)));
    showToast('تم إزالة المشروع من المحفوظات.', 'info');
  };

  // Mark Completed with Confetti & Gamification
  const handleMarkCompleted = (project) => {
    const newCompleted = completedProjects + 1;
    const newPoints = environmentalPoints + 30;
    setCompletedProjects(newCompleted);
    setEnvironmentalPoints(newPoints);
    setCertificateProject(project);
    triggerCelebration();
    showToast(`تهانينا! 🎉 أنجزت مشروع "${project.name}" ونلت +30 نقطة بيئية!`);
    updateUserProfileStats(user?.id, {
      points: newPoints,
      completed: newCompleted,
      co2Saved: newCompleted * 1.65
    });
  };

  // Share / Copy Project
  const handleShareProject = (project, idx) => {
    const shareText = `مشروع إعادة تدوير ذكي: ${project.name}\nالفكرة: ${project.idea}\nالمواد: ${project.materials}\nالأدوات: ${project.tools}\nالخطوات: ${project.steps}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopiedIndex(idx);
      showToast('تم نسخ تفاصيل المشروع إلى الحافظة بنجاح! 📋');
      setTimeout(() => setCopiedIndex(null), 2500);
    });
  };

  // Send message in Live AI Expert Chat with Resilient Streaming
  const handleSendChatMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const updatedHistory = [...chatMessages, { role: 'user', content: userText }];
    // Add empty assistant placeholder for real-time streaming accumulation
    setChatMessages([...updatedHistory, { role: 'assistant', content: '' }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      await streamChatMessage({
        question: userText,
        conversationHistory: updatedHistory,
        projectContext: projectContextForChat,
        onChunk: (_chunk, accumulated) => {
          setChatMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
            }
            return updated;
          });
        }
      });
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant' && !updated[lastIdx].content) {
          updated[lastIdx] = { ...updated[lastIdx], content: 'نعتذر، حدث تعثر أثناء الاتصال بنموذج الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.' };
        }
        return updated;
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  // Click on a Follow-up Question (On-Page Inline Consultation)
  const handleAskFollowUp = (question) => {
    const target = projectContextForChat || projects[0] || selectedProjectModal;
    setInlineConsultation({
      isOpen: true,
      project: target,
      query: question
    });
    showToast(`💡 تم فتح استشارة الخبير في نفس الصفحة!`, 'info');
  };

  // Handle Real Image Upload & Multimodal Analysis
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingStep('جاري قراءة وتحليل الصورة بالذكاء الاصطناعي...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setUploadedImagePreview(base64);
      try {
        const res = await fetchAiProjects({
          imageBase64: base64,
          userLevel,
          projectType
        });
        if (res.success && res.projects?.length > 0) {
          setProjects(res.projects);
          setFollowUpQuestions(res.followUpQuestions || []);
          setCertificateProject(res.projects[0]);
          setEnvironmentalPoints(p => p + 20);

          // Auto-save all generated projects to Saved Projects list immediately
          for (const proj of res.projects) {
            await saveProjectToCloud(user?.id, proj);
          }
          const updatedSaved = await getSavedProjects(user?.id);
          setSavedProjects(updatedSaved);

          showToast(`📸 تم فحص صورتك وابتكار ${res.projects.length} مشاريع وحفظها تلقائياً بالمحفوظات!`);
        }
      } catch (err) {
        console.error('Error analyzing uploaded image:', err);
        showToast('تعذر استكمال فحص الصورة، تم استخدام المولد المطور.', 'info');
      } finally {
        setIsLoading(false);
        setLoadingStep('');
      }
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="app-container">
      {/* ============================================================
          OFFICIAL INSTITUTIONAL TOP BAR
          ============================================================ */}
      <header className="official-top-bar">
        {/* Accreditation Notice Strip */}
        <div className="top-bar-notice">
          <div className="notice-right">
            <Shield size={14} color="#34d399" />
            <span>يستند إلى منهجية ISO 14044 وبروتوكول GHG لتقييم دورة الحياة</span>
          </div>
          <div className="notice-left">
            <span>مُدام • منصة التدوير الذكي</span>
          </div>
        </div>

        {/* Main Header Row */}
        <div className="top-bar-main">
          {/* Mobile Sidebar Toggle & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="sidebar-mobile-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(prev => !prev)}
              aria-label="فتح القائمة الجانبية"
              title="فتح القائمة الجانبية"
            >
              <Menu size={20} />
            </button>

            <div className="official-brand" onClick={() => setActiveTab('generator')}>
              <img 
                src="/mudam-logo.png" 
                alt="شعار مُدام" 
                className="h-10 w-10 rounded-lg object-contain shadow-sm"
                style={{ height: '40px', width: '40px', borderRadius: '8px', objectFit: 'contain' }}
              />
              <div className="brand-titles">
                <h1>مُدام</h1>
                <p>منصة التدوير الذكي والاستدامة البيئية</p>
              </div>
            </div>
          </div>

          {/* Points & Completed Projects Badges */}
          <div className="points-badges-row">
            <button
              type="button"
              onClick={() => setActiveTab('tour')}
              className="btn-platform-tour-trigger"
              title="جولة تعريفية بالمنصة وفيديو العرض التقديمي"
            >
              <Play size={13} fill="currentColor" />
              <span>عن مُدام (الجولة 🎬)</span>
            </button>

            <span className="eco-point-badge">
              <Trophy size={15} />
              <span>{environmentalPoints} نقطة بيئية</span>
            </span>

            <span className="eco-point-badge blue">
              <CheckCircle size={15} />
              <span>{completedProjects} مشروع منجز</span>
            </span>

            {impact.co2Saved > 0 && (
              <span className="official-live-badge">
                <Leaf size={14} />
                <span>وفرت: {impact.co2Saved.toFixed(1)} كغ CO₂</span>
              </span>
            )}

            <span 
              className={`eco-point-badge ${isOnline ? 'green' : 'amber'}`}
              title={isOnline ? 'تطبيق ويب تقدمي (PWA) يدعم حفظ وتصفح المشاريع دون إنترنت' : 'أنت الآن في وضع عدم الاتصال (Offline) - التصفح محفوظ'}
              style={!isOnline ? { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' } : {}}
            >
              {isOnline ? <Smartphone size={14} /> : <WifiOff size={14} />}
              <span>{isOnline ? 'PWA متاح دون إنترنت' : 'وضع أوفلاين'}</span>
            </span>

            {/* Supabase Authentication Section */}
            <div className="auth-header-actions" ref={userDropdownRef}>
              {user ? (
                <div className="user-profile-menu-container">
                  <button 
                    type="button"
                    className={`user-profile-pill ${isUserDropdownOpen ? 'active' : ''}`}
                    onClick={() => setIsUserDropdownOpen(prev => !prev)}
                    aria-expanded={isUserDropdownOpen}
                    aria-haspopup="true"
                    title="ملفي الشخصي وإحصائيات الاستدامة"
                  >
                    <div className="user-avatar-circle">
                      {user.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                      <span className="user-online-dot"></span>
                    </div>
                    <div className="user-info-text">
                      <span className="user-name-display">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      <span className="user-role-badge">
                        {user.user_metadata?.is_guest ? 'حساب تجريبي' : 'عضو نشط'}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`user-dropdown-arrow ${isUserDropdownOpen ? 'rotated' : ''}`} />
                  </button>

                  {/* Elegant Floating Dropdown */}
                  {isUserDropdownOpen && (
                    <div className="user-dropdown-menu">
                      <div className="user-dropdown-header">
                        <div className="user-dropdown-avatar-lg">
                          {user.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-dropdown-meta">
                          <h4 className="user-dropdown-fullname">
                            {user.user_metadata?.full_name || 'خبير الاستدامة'}
                          </h4>
                          <span className="user-dropdown-email" dir="ltr">{user.email}</span>
                          <span className={`user-dropdown-status-tag ${user.user_metadata?.is_guest ? 'guest' : 'verified'}`}>
                            {user.user_metadata?.is_guest ? '🧪 وضع الضيف التجريبي' : '🛡️ حساب موثق بسحابة Supabase'}
                          </span>
                        </div>
                      </div>

                      <div className="user-dropdown-stats-grid">
                        <div className="user-dropdown-stat-card">
                          <span className="stat-label">نقاط الأثر</span>
                          <strong className="stat-val">{environmentalPoints} 🌱</strong>
                        </div>
                        <div className="user-dropdown-stat-card">
                          <span className="stat-label">المشاريع</span>
                          <strong className="stat-val">{completedProjects} 🎯</strong>
                        </div>
                        <div className="user-dropdown-stat-card">
                          <span className="stat-label">المحفوظات</span>
                          <strong className="stat-val">{savedProjects.length} 💾</strong>
                        </div>
                      </div>

                      <div className="user-dropdown-links">
                        <button
                          type="button"
                          className="user-dropdown-item"
                          onClick={() => {
                            setActiveTab('saved');
                            setIsUserDropdownOpen(false);
                          }}
                        >
                          <Star size={16} />
                          <span>المشاريع المحفوظة سحابياً</span>
                          <span className="dropdown-counter">{savedProjects.length}</span>
                        </button>

                        <button
                          type="button"
                          className="user-dropdown-item"
                          onClick={() => {
                            setActiveTab('calculator');
                            setIsUserDropdownOpen(false);
                          }}
                        >
                          <Calculator size={16} />
                          <span>حاسبة أثر الكربون (LCA)</span>
                        </button>

                        <button
                          type="button"
                          className="user-dropdown-item"
                          onClick={() => {
                            setActiveTab('forecasting');
                            setIsUserDropdownOpen(false);
                          }}
                        >
                          <TrendingUp size={16} />
                          <span>أداة التنبؤ البيئي الذكية</span>
                        </button>

                        <button
                          type="button"
                          className="user-dropdown-item"
                          onClick={() => {
                            setActiveTab('certificate');
                            setIsUserDropdownOpen(false);
                          }}
                        >
                          <Award size={16} />
                          <span>شهادة الإنجاز البيئي</span>
                        </button>
                      </div>

                      <div className="user-dropdown-footer">
                        <button
                          type="button"
                          className="user-dropdown-logout-btn"
                          onClick={async () => {
                            setIsUserDropdownOpen(false);
                            await signOut();
                            showToast('تم تسجيل الخروج بنجاح. نتمنى لك يوماً مستداماً! 👋', 'info');
                          }}
                        >
                          <LogOut size={16} />
                          <span>تسجيل الخروج من الحساب</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="btn-auth-login" 
                  onClick={() => setIsAuthModalOpen(true)}
                  title="تسجيل الدخول أو إنشاء حساب"
                >
                  <LogIn size={15} />
                  <span>تسجيل الدخول</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          MUDAM APP SIDEBAR & MAIN VIEWPORT LAYOUT
          ============================================================ */}
      <div className="mudam-layout-wrapper">
        {/* Modern Vertical Sidebar Navigation */}
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedProjectsCount={savedProjects.length}
          projectContextForChat={projectContextForChat}
          environmentalPoints={environmentalPoints}
          completedProjects={completedProjects}
          impactCo2={impact.co2Saved}
          hasGeminiKey={hasGeminiKey}
          onOpenGeminiKeyModal={() => setIsGeminiKeyModalOpen(true)}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isAdmin={platform.isAdmin}
          onOpenTour={() => setActiveTab('tour')}
        />

        {/* Main Viewport Container */}
        <div className="mudam-main-viewport">
          <main className="official-main-content">

        {/* Environmental Impact Counter Banner */}
        {completedProjects > 0 && (
          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.25rem 2rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--emerald-primary)', fontWeight: 800, fontSize: '1.6rem' }}>
                  <Calculator size={22} />
                  <span>{impact.wasteReduced.toFixed(1)} كغ</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>نفايات تم تحويلها عن المكب</span>
              </div>

              <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--emerald-primary)', fontWeight: 800, fontSize: '1.6rem' }}>
                  <Leaf size={22} />
                  <span>{impact.co2Saved.toFixed(1)} كغ</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>انبعاثات CO₂ تم توفيرها</span>
              </div>

              <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--gold-primary)', fontWeight: 800, fontSize: '1.6rem' }}>
                  <Sparkles size={22} />
                  <span>V3 Multi-AI</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>معرض ثلاثي الصور لكل مشروع</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: OFFICIAL PLATFORM TOUR & PRESENTATION SHOWCASE (عن مُدام)
            ============================================================ */}
        {activeTab === 'tour' && (
          <Suspense fallback={<ViewLoadingFallback message="جاري تحميل الجولة التعريفية الشاملة..." />}>
            <PlatformTourPage onStartExploring={() => setActiveTab('generator')} />
          </Suspense>
        )}

        {/* ============================================================
            TAB 1: GENERATOR TAB (INPUTS & DYNAMIC PROJECTS)
            ============================================================ */}
        {activeTab === 'generator' && (
          <div className={`intake-layout-grid ${(projects.length > 0 || isLoading) ? 'has-results' : ''}`}>
            {/* Right Column: Inputs Section (RTL) */}
            <div className="intake-main-panel">
              <div className="panel-section-title">
                <h3>
                  <BookOpen size={20} color="var(--emerald-primary)" />
                  <span>أدخل المواد المتوفرة لديك</span>
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
                اختر من قائمة المواد الشائعة أو أدخل أي مواد يدوياً ليقوم الذكاء الاصطناعي بابتكار مشاريع وتوليد 3 صور لكل مشروع:
              </p>


              {/* Modern Selection Studio Tabs (ترتيب الخيارات: المكتبة أولاً ثم إدخال حر ثم حزم أفكار) */}
              <div className="selection-studio-tabs">
                <button
                  type="button"
                  className={`studio-tab-btn ${materialSelectTab === 'grid' ? 'active' : ''}`}
                  onClick={() => setMaterialSelectTab('grid')}
                >
                  <Layers size={15} />
                  <span>المكتبة والخامات (61+ مادة)</span>
                </button>
                <button
                  type="button"
                  className={`studio-tab-btn ${materialSelectTab === 'custom' ? 'active' : ''}`}
                  onClick={() => setMaterialSelectTab('custom')}
                >
                  <Camera size={15} />
                  <span>إدخال حر ومسح بالكاميرا</span>
                </button>
                <button
                  type="button"
                  className={`studio-tab-btn ${materialSelectTab === 'packs' ? 'active' : ''}`}
                  onClick={() => setMaterialSelectTab('packs')}
                >
                  <Sparkles size={15} />
                  <span>حزم أفكار جاهزة (Packs)</span>
                </button>
              </div>

              {/* Tab 1: Ready Inspiration Packs */}
              {materialSelectTab === 'packs' && (
                <div className="studio-tab-pane">
                  <div className="inspiration-cards-grid-v2">
                    {INSPIRATION_SUGGESTIONS.map(sug => (
                      <div
                        key={sug.id}
                        className="inspiration-card-pill-v2"
                        onClick={() => handleApplyInspiration(sug)}
                        title={`تطبيق مواد: ${sug.materials.join(' + ')}`}
                        role="button"
                        tabIndex={0}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span className="inspiration-pill-badge" style={{ color: sug.color, borderColor: `${sug.color}40`, backgroundColor: sug.bgTint }}>
                              {sug.badge}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sug.userLevel === 'child' ? 'عائلي' : 'احترافي'}</span>
                          </div>
                          <h5 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.3rem' }}>{sug.title}</h5>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 0.6rem' }}>{sug.description}</p>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {sug.materials.map((m, mi) => (
                            <span key={mi} className="mini-mat-tag">{m}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Materials Grid & 61+ Library Modal Trigger */}
              {materialSelectTab === 'grid' && (
                <div className="studio-tab-pane">
                  <div 
                    className="materials-library-trigger-card" 
                    onClick={() => setIsMaterialsLibraryOpen(true)}
                    role="button"
                    tabIndex={0}
                    style={{ marginBottom: '1rem' }}
                  >
                    <div className="trigger-card-content">
                      <div className="trigger-badge">
                        <Sparkles size={13} />
                        <span>المكتبة الشاملة V3</span>
                      </div>
                      <h4 className="trigger-title">
                        📚 تصفح موسوعة الـ 61+ خامة (صور مصغرة وفحص توافق فوري)
                      </h4>
                      <p className="trigger-desc">
                        تصفح الخامات المصنفة (بلاستيك، خشب، معادن، أقمشة، إلكترونيات) مع حسابات البصمة والتوافق الكيميائي.
                      </p>
                    </div>
                    <div className="trigger-card-action">
                      <span className="btn-explore-library">
                        <span>فتح المكتبة</span>
                        <Layers size={16} />
                      </span>
                    </div>
                  </div>

                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    خامات سريعة الاختيار بنقرة واحدة:
                  </label>
                  <div className="material-quick-chips-grid">
                    {COMMON_MATERIALS.map(mat => {
                      const isSelected = selectedMaterials.includes(mat);
                      return (
                        <button
                          type="button"
                          key={mat}
                          className={`material-quick-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleMaterial(mat)}
                        >
                          <span className="check-dot">
                            {isSelected ? <Check size={11} strokeWidth={3} /> : '+'}
                          </span>
                          <span>{mat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Custom Text & Camera Scanner */}
              {materialSelectTab === 'custom' && (
                <div className="studio-tab-pane">
                  <div className="official-textarea-container" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      اكتب أي مواد تملكها بحرية:
                    </label>
                    <textarea
                      className="official-textarea"
                      placeholder="مثال: علب حليب أطفال، براميل زيت، إطارات سيارات، شماعات سلك، قمصان صوف..."
                      value={materials}
                      onChange={e => setMaterials(e.target.value)}
                    />
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageUpload}
                  />

                  <button
                    type="button"
                    className="btn-upload-camera"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Camera size={18} />
                    <span>📸 ارفع صورة للمواد المتوفرة عندك لتحليلها بالذكاء الاصطناعي</span>
                  </button>

                  {uploadedImagePreview && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--emerald-light)', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid var(--emerald-border)', marginTop: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={uploadedImagePreview} 
                          alt="معاينة الصورة المرفوعة" 
                          style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--emerald-primary)' }} 
                        />
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald-primary)', display: 'block' }}>تم فحص وتحليل الصورة بالذكاء الاصطناعي</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>جاهز لتوليد المشاريع البيئية</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setUploadedImagePreview(null); showToast('تمت إزالة الصورة المرفوعة', 'info'); }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                        title="إزالة الصورة"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Active Selected Materials Tray */}
              {selectedMaterials.length > 0 ? (
                <div className="selected-materials-bar">
                  <div className="selected-materials-header">
                    <div className="selected-materials-title">
                      <Leaf size={15} color="#059669" />
                      <span>المواد المحددة لمشروعك ({selectedMaterials.length}):</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMaterials([])}
                      className="btn-clear-selected-materials"
                      title="مسح جميع المواد المحددة"
                    >
                      مسح الكل
                    </button>
                  </div>
                  <div className="selected-materials-pills-list">
                    {selectedMaterials.map((mat) => (
                      <span key={mat} className="selected-material-pill">
                        <span className="pill-dot" />
                        <span className="pill-name">{mat}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMaterials(prev => prev.filter(m => m !== mat));
                          }}
                          className="pill-remove-btn"
                          title={`إزالة ${mat}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Dynamic Companion Material Suggestions */}
                  {companionSuggestions.length > 0 && (
                    <div className="companion-suggestions-strip">
                      <div className="companion-strip-label">
                        <Wand2 size={13} color="#059669" />
                        <span>خامات مكملة مقترحة ذكياً للدمج:</span>
                      </div>
                      <div className="companion-pills-list">
                        {companionSuggestions.map(mat => (
                          <button
                            type="button"
                            key={mat}
                            onClick={() => handleAddCompanionMaterial(mat)}
                            className="companion-pill-btn"
                            title={`إضافة ${mat} للمشروع`}
                          >
                            <Plus size={12} />
                            <span>{mat}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="selected-materials-empty-hint">
                  💡 لم يتم تحديد أي خامات بعد. اختر حزمة ملهمة أو انقر على الخامات في التبويبات أعلاه.
                </div>
              )}

              {/* Modern Segmented Preferences Controls */}
              <div className="preferences-segmented-box">
                <div className="segmented-control-group">
                  <span className="segmented-label">مستوى المنفّذ:</span>
                  <div className="segmented-pills-row">
                    {USER_LEVELS.map(lvl => (
                      <button
                        key={lvl.value}
                        type="button"
                        className={`segmented-pill-btn ${userLevel === lvl.value ? 'active' : ''}`}
                        onClick={() => setUserLevel(lvl.value)}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="segmented-control-group">
                  <span className="segmented-label">طابع ونوع المشروع:</span>
                  <div className="segmented-pills-row">
                    {PROJECT_TYPES.map(typ => (
                      <button
                        key={typ.value}
                        type="button"
                        className={`segmented-pill-btn ${projectType === typ.value ? 'active' : ''}`}
                        onClick={() => setProjectType(typ.value)}
                      >
                        {typ.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <CapacityBanner capacity={platform.capacity} />

              {/* Generate Projects CTA */}
              <button
                type="button"
                className="cta-analyze-btn"
                onClick={handleGenerateProjects}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{loadingStep || 'جاري التحليل وتوليد المشاريع عبر 6 وكلاء ذكاء اصطناعي...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-amber-300" />
                    <span>ابتكار مشاريع بالذكاء الاصطناعي</span>
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '0.65rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                <span>
                  عصف ذهني لـ 8 أفكار ← اختيار أقوى 3 ← دليل تنفيذ بقياسات دقيقة ← صور واضحة لكل مرحلة
                </span>
              </div>
            </div>

            {/* Left Column: Generated Projects Display */}
            <div>
              {isLoading ? (
                <GenerationProgressPanel onCancel={() => setIsLoading(false)} />
              ) : generationError ? (
                <div className="generation-error-card" dir="rtl">
                  <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    تعذّر التوليد، حاول مرة أخرى
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-4">
                    {generationError}
                  </p>
                  <button
                    type="button"
                    className="btn-retry-generation"
                    onClick={handleGenerateProjects}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة المحاولة بنفس المواد والخيارات</span>
                  </button>
                </div>
              ) : projects.length === 0 ? (
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
                  <Recycle size={56} color="var(--border-strong)" style={{ margin: '0 auto 1.25rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    بانتظار إدخال موادك
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                    اختر المواد أو اكتبها واضغط على زر الابتكار ليقوم الذكاء الاصطناعي بتوليد مشاريع حصرية لكل طلب مع 3 صور فنية عالية الدقة (المنتج المكتمل، مراحل التجميع، والاستخدام الواقعي).
                  </p>
                </div>
              ) : projects.length === 0 ? null : (
                <div className={isLoading ? 'results-refreshing' : ''}>
                  {/* Top Projects View Toolbar with 3 Display Modes */}
                  <div className="projects-view-toolbar">
                    <div className="projects-count-tag">
                      <Sparkles size={17} color="var(--emerald-primary)" />
                      <span>المشاريع المولدة ({projects.length} مشاريع ذكية):</span>
                    </div>

                    <div className="projects-mode-pills">
                      <button
                        type="button"
                        className={`mode-pill-btn ${projectsViewMode === 'spotlight' ? 'active' : ''}`}
                        onClick={() => setProjectsViewMode('spotlight')}
                        title="العرض الفاخر السينمائي مع استوديو الزوايا"
                      >
                        <Eye size={14} />
                        <span>العرض الفاخر (Spotlight)</span>
                      </button>
                      <button
                        type="button"
                        className={`mode-pill-btn ${projectsViewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setProjectsViewMode('grid')}
                        title="شبكة البطاقات المتعددة"
                      >
                        <Grid size={14} />
                        <span>شبكة البطاقات (Cards)</span>
                      </button>
                      <button
                        type="button"
                        className={`mode-pill-btn ${projectsViewMode === 'compare' ? 'active' : ''}`}
                        onClick={() => setProjectsViewMode('compare')}
                        title="مصفوفة المقارنة الفنية والبيئية الشاملة"
                      >
                        <BarChart2 size={14} />
                        <span>المقارنة الذكية (Matrix)</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Project Navigation Ribbon */}
                  <div className="project-selector-strip">
                    {projects.map((proj, idx) => (
                      <button
                        key={proj.id || idx}
                        type="button"
                        className={`project-selector-item ${(projectsViewMode === 'spotlight' && activeSpotlightIndex === idx) ? 'active' : ''}`}
                        onClick={() => {
                          setActiveSpotlightIndex(idx);
                          if (projectsViewMode !== 'spotlight') {
                            setProjectsViewMode('spotlight');
                          }
                        }}
                      >
                        <span className="selector-num">{idx + 1}</span>
                        <span className="selector-title">{proj.name}</span>
                        {proj.metrics?.feasibilityScore && (
                          <span className="selector-score">⭐ {proj.metrics.feasibilityScore}%</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* MODE 1: LUXURY SPOTLIGHT STUDIO */}
                  {projectsViewMode === 'spotlight' && (() => {
                    const activeProj = projects[activeSpotlightIndex] || projects[0];
                    if (!activeProj) return null;
                    const activeView = activeProj.activeGalleryView || 'finished';
                    const isSaved = isProjectSaved(savedProjects, activeProj);
                    const stepsCount = activeProj.parsedSteps ? activeProj.parsedSteps.length : 0;
                    const materialsList = typeof activeProj.materials === 'string'
                      ? activeProj.materials.split(/[,،]/).map(m => m.trim()).filter(Boolean)
                      : (Array.isArray(activeProj.materials) ? activeProj.materials : []);

                    return (
                      <div className="spotlight-showcase-card">
                        <div className="spotlight-media-col">
                        {/* Media Container with multi-angle gallery */}
                        <div className="spotlight-media-container">
                          <ProjectCover
                            project={activeProj}
                            view={activeView}
                            className="spotlight-hero-wrap"
                            imgClassName="spotlight-hero-img"
                          />

                          {/* Top Badges */}
                          <div className="spotlight-badges-tag">
                            <span className="spotlight-badge cert">منهجية ISO 14044</span>
                            <span className="spotlight-badge diff">{activeProj.difficulty || 'متوسط'}</span>
                            {activeProj.metrics?.feasibilityScore && (
                              <span className="spotlight-badge score">⭐ {activeProj.metrics.feasibilityScore}% جدوى</span>
                            )}
                          </div>

                          {/* Top Action Overlay Buttons */}
                          <div className="spotlight-top-controls">
                            <button
                              type="button"
                              className={`spotlight-overlay-btn ${isSaved ? 'saved' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveProject(activeProj);
                              }}
                              title={isSaved ? 'المشروع محفوظ بالمفضلة' : 'حفظ بالمفضلة'}
                            >
                              <Star size={16} fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              type="button"
                              className="spotlight-overlay-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareProject(activeProj, activeSpotlightIndex);
                              }}
                              title="مشاركة ونسخ الرابط"
                            >
                              {copiedIndex === activeSpotlightIndex ? <CheckCheck size={16} color="#10b981" /> : <Share2 size={16} />}
                            </button>
                          </div>

                        </div>

                        {/* Angle thumbnails */}
                        <div className="spotlight-angle-thumbs">
                          {['finished', 'assembly', 'inUse'].map(v => (
                            <ViewThumb
                              key={v}
                              project={activeProj}
                              view={v}
                              active={activeView === v}
                              onClick={() => handleSwitchGalleryView(activeSpotlightIndex, v)}
                            />
                          ))}
                        </div>
                        {Array.isArray(activeProj.parsedSteps) && activeProj.parsedSteps.length > 0 && activeProj.isAiDeveloped && (
                            <div className="spotlight-steps-timeline">
                              <span className="mats-label">مراحل التنفيذ:</span>
                              <ol>
                                {activeProj.parsedSteps.map((st, si) => (
                                  <li key={si}>
                                    <span className="tl-num">{si + 1}</span>
                                    <span className="tl-title">{st.title}</span>
                                    {st.minutes ? <span className="tl-min">{st.minutes} دقيقة</span> : null}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}


                        </div>

                        {/* Spotlight Content Body */}
                        <div className="spotlight-content-body">
                          <div className="spotlight-header-row">
                            <div>
                              <span className="spotlight-mini-tag">المشروع رقم {activeSpotlightIndex + 1} من أصل {projects.length}</span>
                              <h2 className="spotlight-title">{activeProj.name}</h2>
                              {activeProj.tagline && <p className="spotlight-tagline">{activeProj.tagline}</p>}
                            </div>
                            <div className="spotlight-pill-stack">
                              {activeProj.aiConcept?.archetype && ARCHETYPE_AR[activeProj.aiConcept.archetype] && (
                                <span className="spotlight-archetype-pill">{ARCHETYPE_AR[activeProj.aiConcept.archetype]}</span>
                              )}
                              {activeSpotlightIndex === bestProjectIndex(projects) && projects.length > 1 && (
                                <span className="spotlight-best-pill">★ الأعلى تقييماً</span>
                              )}
                              <span className="spotlight-pts-pill">+35 نقطة بيئية 🌱</span>
                            </div>
                          </div>

                          <p className="spotlight-description">{activeProj.idea}</p>
                          {activeProj.story && <p className="spotlight-story">{activeProj.story}</p>}

                          {/* 4 Core KPI Tiles */}
                          <div className="spotlight-kpi-grid">
                            <div className="spotlight-kpi-tile emerald">
                              <Leaf size={20} />
                              <div>
                                <span className="kpi-num">{projectCo2(activeProj) ?? '—'} كغ</span>
                                <span className="kpi-sub">وفر كربوني (CO₂)</span>
                              </div>
                            </div>
                            <div className="spotlight-kpi-tile cyan">
                              <Trophy size={20} />
                              <div>
                                <span className="kpi-num">{activeProj.metrics?.estimatedSavings || '—'}</span>
                                <span className="kpi-sub">الوفر المالي التقديري</span>
                              </div>
                            </div>
                            <div className="spotlight-kpi-tile blue">
                              <Shield size={20} />
                              <div>
                                <span className="kpi-num">{activeProj.metrics?.durabilityYears || '—'}</span>
                                <span className="kpi-sub">العمر الافتراضي</span>
                              </div>
                            </div>
                            <div className="spotlight-kpi-tile amber">
                              <Clock size={20} />
                              <div>
                                <span className="kpi-num">{activeProj.time || 'ساعتان'}</span>
                                <span className="kpi-sub">مدة التنفيذ المقدرة</span>
                              </div>
                            </div>
                          </div>

                          {activeProj.wowFactor && (
                            <div style={{ margin: '0.75rem 0', padding: '0.7rem 0.9rem', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.85rem', fontWeight: 700 }}>
                              ✨ {activeProj.wowFactor}
                            </div>
                          )}

                          {/* Materials Preview Chips */}
                          {materialsList.length > 0 && (
                            <div className="spotlight-materials-preview">
                              <span className="mats-label">الخامات المستعملة:</span>
                              <div className="mats-chips-wrap">
                                {materialsList.map((m, mi) => (
                                  <span key={mi} className="spotlight-mat-chip">{m}</span>
                                ))}
                                {stepsCount > 0 && (
                                  <span className="spotlight-steps-chip">📋 {stepsCount} خطوات إرشادية مصورة</span>
                                )}
                              </div>
                            </div>
                          )}

                          {activeProj.aiConcept?.scores ? (
                            <div className="spotlight-concept-box">
                              <span className="mats-label">لماذا اختارها الذكاء الاصطناعي؟</span>
                              {activeProj.aiConcept.mechanism && (
                                <p className="spotlight-mechanism">💡 {activeProj.aiConcept.mechanism}</p>
                              )}
                              <ConceptMeters scores={activeProj.aiConcept.scores} />
                            </div>
                          ) : (
                            <div className="spotlight-swarm-strip">
                              🤖 مصادق هندسياً من طاقم الـ 6 وكلاء: خبير الخامات • كبير المهندسين • مدقق السلامة • محلل دورة الحياة (LCA)
                            </div>
                          )}

                          {/* Action CTA Buttons */}
                          <div className="spotlight-cta-row">
                            <button
                              type="button"
                              className="btn-open-dedicated-spotlight"
                              onClick={() => setSelectedProjectModal(activeProj)}
                            >
                              <span>دخول استوديو التنفيذ الكامل والخطوات المصورة</span>
                              <ArrowLeft size={18} />
                            </button>
                            <button
                              type="button"
                              className="btn-spotlight-consult"
                              onClick={() => handleConsultExpertForProject(activeProj)}
                            >
                              <MessageSquare size={16} />
                              <span>استشارة الخبير الذكي</span>
                            </button>
                            <button
                              type="button"
                              className="btn-spotlight-cert"
                              onClick={() => setActiveCertModalProject(activeProj)}
                            >
                              <Award size={16} />
                              <span>شهادة الإنجاز</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* MODE 2: CARDS GRID VIEW */}
                  {projectsViewMode === 'grid' && (
                    <div className="projects-showcase-grid">
                      {projects.map((project, index) => {
                        const activeView = project.activeGalleryView || 'finished';
                        const isSaved = isProjectSaved(savedProjects, project);
                        const stepsCount = project.parsedSteps ? project.parsedSteps.length : 0;
                        const materialsList = typeof project.materials === 'string'
                          ? project.materials.split(/[,،]/).map(m => m.trim()).filter(Boolean).slice(0, 3)
                          : (Array.isArray(project.materials) ? project.materials.slice(0, 3) : []);

                        return (
                          <div
                            key={project.id || index}
                            className="project-showcase-card"
                            onClick={() => setSelectedProjectModal(project)}
                          >
                            <div className="project-card-cover-wrap">
                              <ProjectCover
                                project={project}
                                view={activeView}
                                className="project-card-cover-ai"
                                imgClassName="project-card-cover-img"
                              />

                              <div className="project-card-badges-overlay">
                                {index === bestProjectIndex(projects) && projects.length > 1 && (
                                  <span className="badge-best-card">★ الأعلى تقييماً</span>
                                )}
                                <span className="badge-difficulty-card">
                                  {project.difficulty || 'متوسط'}
                                </span>
                                <span className="badge-time-card">
                                  <Clock size={11} />
                                  <span>{project.time || 'ساعتان'}</span>
                                </span>
                                {project.metrics?.feasibilityScore && (
                                  <span className="badge-feasibility-card">
                                    <Target size={11} />
                                    <span>{project.metrics.feasibilityScore}% جدوى</span>
                                  </span>
                                )}
                              </div>

                              <div className="project-card-hover-actions">
                                <button
                                  type="button"
                                  className={`card-quick-action-btn ${isSaved ? 'saved' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveProject(project);
                                  }}
                                  title={isSaved ? 'المشروع محفوظ' : 'حفظ في المفضلة'}
                                >
                                  <Star size={15} fill={isSaved ? 'currentColor' : 'none'} />
                                </button>

                                <button
                                  type="button"
                                  className="card-quick-action-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareProject(project, index);
                                  }}
                                  title="مشاركة ونسخ"
                                >
                                  {copiedIndex === index ? <CheckCheck size={15} color="#10b981" /> : <Share2 size={15} />}
                                </button>
                              </div>
                            </div>

                            <div className="project-card-main-content">
                              <div className="project-card-category-strip">
                                <span className="project-card-eco-pill">
                                  <Leaf size={12} />
                                  <span>منهجية ISO 14044</span>
                                </span>
                                <span className="project-card-points-tag">+30 نقطة 🌱</span>
                              </div>

                              <h3 className="project-card-headline">{project.name}</h3>
                              {project.tagline && <p className="project-card-tagline">{project.tagline}</p>}

                              <p className="project-card-snippet">
                                {project.idea}
                              </p>
                              {project.wowFactor && (
                                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', margin: '0.4rem 0 0' }}>
                                  ✨ {project.wowFactor}
                                </p>
                              )}

                              {materialsList.length > 0 && (
                                <div className="project-card-materials-chips">
                                  {materialsList.map((m, mIdx) => (
                                    <span key={mIdx} className="material-mini-chip">
                                      {m}
                                    </span>
                                  ))}
                                  {stepsCount > 0 && (
                                    <span className="steps-mini-chip">
                                      {stepsCount} مراحل
                                    </span>
                                  )}
                                </div>
                              )}

                              {project.metrics && (
                                <div className="project-card-metrics-strip">
                                  <div className="mini-kpi">
                                    <span className="kpi-label">الوفر المالي</span>
                                    <span className="kpi-val">{project.metrics.estimatedSavings || '—'}</span>
                                  </div>
                                  <div className="mini-kpi">
                                    <span className="kpi-label">العمر الافتراضي</span>
                                    <span className="kpi-val">{project.metrics.durabilityYears || '—'}</span>
                                  </div>
                                  <div className="mini-kpi">
                                    <span className="kpi-label">وفر الكربون</span>
                                    <span className="kpi-val emerald">{projectCo2(project) ?? '—'} كغ</span>
                                  </div>
                                </div>
                              )}

                              {project.aiConcept?.archetype ? (
                                <div className="project-card-swarm-badge">
                                  <span className="swarm-badge-pill">
                                    💡 {ARCHETYPE_AR[project.aiConcept.archetype] || 'فكرة مبتكرة'}
                                    {project.aiConcept.mechanism ? ` • ${project.aiConcept.mechanism}` : ''}
                                  </span>
                                </div>
                              ) : (
                                <div className="project-card-swarm-badge">
                                  <span className="swarm-badge-pill">
                                    🤖 تدقيق ومصادقة 6 وكلاء أذكياء (المواد • الهندسة • الأثر)
                                  </span>
                                </div>
                              )}

                              <div className="project-card-cta-row">
                                <button
                                  type="button"
                                  className="btn-open-project-modal"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProjectModal(project);
                                  }}
                                >
                                  <span>عرض صفحة المشروع المستقلة</span>
                                  <ArrowLeft size={16} />
                                </button>

                                <button
                                  type="button"
                                  className="btn-quick-consult"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConsultExpertForProject(project);
                                  }}
                                  title="استشارة الخبير الذكي حول هذا المشروع"
                                >
                                  <MessageSquare size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* MODE 3: SIDE-BY-SIDE COMPARISON MATRIX */}
                  {projectsViewMode === 'compare' && (
                    <div className="project-comparison-table-wrap">
                      <table className="project-comparison-table">
                        <thead>
                          <tr>
                            <th>المعيار والمواصفة الفنية</th>
                            {projects.map((proj, idx) => (
                              <th key={proj.id || idx}>
                                <div className="compare-th-thumb">
                                  <ProjectCover project={proj} view="finished" />
                                </div>
                                <div className="compare-th-title">{proj.name}</div>
                                <span className="compare-th-badge">
                                  {idx === bestProjectIndex(projects) && projects.length > 1 ? '★ الأعلى تقييماً' : `خيار #${idx + 1}`}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {projects.some(p => p.aiConcept?.archetype) && (
                            <tr>
                              <td className="compare-metric-label">نوع الفكرة</td>
                              {projects.map((proj, idx) => (
                                <td key={idx} className="compare-metric-val">{ARCHETYPE_AR[proj.aiConcept?.archetype] || '—'}</td>
                              ))}
                            </tr>
                          )}
                          {projects.some(p => p.aiConcept?.scores) && (
                            <tr>
                              <td className="compare-metric-label">تقييم الذكاء الاصطناعي</td>
                              {projects.map((proj, idx) => (
                                <td key={idx} className="compare-metric-val"><ConceptMeters scores={proj.aiConcept?.scores} /></td>
                              ))}
                            </tr>
                          )}
                          {projects.some(p => p.estimatedCost) && (
                            <tr>
                              <td className="compare-metric-label">تكلفة التنفيذ الفعلية</td>
                              {projects.map((proj, idx) => (
                                <td key={idx} className="compare-metric-val">{proj.estimatedCost || '—'}</td>
                              ))}
                            </tr>
                          )}
                          <tr>
                            <td className="compare-metric-label">مستوى الصعوبة والتنفيذ</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val">{proj.difficulty || 'متوسط'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">زمن التنفيذ المقدر</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val">{proj.time || 'ساعتان'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">وفر الانبعاثات (CO₂)</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val highlight">{projectCo2(proj) ?? '—'} كغ CO₂</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">الوفر المالي التقديري</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val highlight">{proj.metrics?.estimatedSavings || '—'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">نسبة الجدوى الهندسية</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val">{proj.metrics?.feasibilityScore ?? '—'}%</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">العمر الافتراضي للمنتج</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val">{proj.metrics?.durabilityYears || '—'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">مراحل التنفيذ المصورة</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val">{proj.parsedSteps ? proj.parsedSteps.length : 0} مراحل تنفيذية</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">إجراء فوري</td>
                            {projects.map((proj, idx) => (
                              <td key={idx}>
                                <button
                                  type="button"
                                  className="btn-compare-action"
                                  onClick={() => setSelectedProjectModal(proj)}
                                >
                                  <span>فتح استوديو المشروع</span>
                                  <ArrowLeft size={14} />
                                </button>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Smart Customization & AI Suggestions Section */}
                  <div className="smart-customization-section">
                    <div className="customization-header">
                      <div className="customization-title">
                        <Cpu size={18} color="var(--emerald-primary)" />
                        <h4>اقتراحات هندسية ذكية لتطوير وتخصيص المشاريع المولدة:</h4>
                      </div>
                      <span className="customization-badge">اختر اقتراحاً لبدء استشارة هندسية فورية وتخصيص المشروع</span>
                    </div>

                    <div className="customization-cards-grid">
                      {PROJECT_CUSTOMIZATION_SUGGESTIONS.map(sug => (
                        <div
                          key={sug.id}
                          className="customization-card"
                          onClick={() => handleCustomizationSuggestion(sug, projects[0])}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="customization-card-info">
                            <h5>{sug.title}</h5>
                            <p>{sug.subtitle}</p>
                          </div>
                          <span className="btn-apply-suggestion">
                            <span>استشارة حول الاقتراح</span>
                            <ArrowLeft size={14} />
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Follow-up Questions as Interactive Refinement Chips */}
                    {followUpQuestions.length > 0 && (
                      <div className="follow-up-refinement-box">
                        <span className="refinement-label">
                          <HelpCircle size={14} color="var(--emerald-primary)" />
                          <span>أسئلة ومسارات تخصيص إضافية:</span>
                        </span>
                        <div className="refinement-chips-wrap">
                          {followUpQuestions.map((q, qIdx) => (
                            <button
                              type="button"
                              key={qIdx}
                              onClick={() => handleAskFollowUp(q)}
                              className="refinement-chip-btn"
                            >
                              <span>{q}</span>
                              <ArrowLeft size={13} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: STUDENT & ACADEMIC HUB (بوابة الطلاب والمدارس)
            ============================================================ */}
        {activeTab === 'admin' && platform.isAdmin && (
          <Suspense fallback={<ViewLoadingFallback message="جاري تحميل لوحة التحكم الإدارية..." />}>
            <AdminDashboard />
          </Suspense>
        )}

        {activeTab === 'students' && (
          <Suspense fallback={<ViewLoadingFallback message="جاري تحميل بوابة الطلاب والمدارس (STEM Lab)..." />}>
            <StudentPortalSection
              onSelectProject={(project) => {
                setSelectedProjectModal(project);
              }}
              onOpenLabReport={(project) => {
                setActiveLabReportProject(project);
              }}
              onOpenRubric={(project) => {
                setActiveRubricProject(project);
              }}
              onOpenQuiz={(project) => {
                setActiveQuizProject(project);
              }}
              user={user}
            />
          </Suspense>
        )}

        {/* ============================================================
            TAB: LCA CARBON CALCULATOR
            ============================================================ */}
        {activeTab === 'calculator' && (
          <Suspense fallback={<ViewLoadingFallback message="جاري تحميل حاسبة الأثر وتقييم دورة الحياة (LCA)..." />}>
            <CarbonCalculatorView 
              lcaResults={lcaResults} 
              presets={PRESET_SCENARIOS}
              currentScenarioId={currentPresetId}
              onSelectPreset={handleSelectPresetScenario}
              onOpenCertificate={() => {
                setActiveTab('certificate');
                triggerCelebration();
              }} 
            />
          </Suspense>
        )}

        {/* ============================================================
            TAB: SMART ENVIRONMENTAL FORECASTING (أداة التنبؤ البيئي الذكية)
            ============================================================ */}
        {activeTab === 'forecasting' && (
          <SmartEnvironmentalForecasting 
            onConsultInline={(queryText, context) => {
              setInlineConsultation({
                isOpen: true,
                project: context,
                query: queryText
              });
            }}
            onNavigateToExpertChat={(initialQuestion) => {
              setActiveTab('chat');
              if (initialQuestion) {
                setChatInput(initialQuestion);
              }
            }}
          />
        )}

        {/* ============================================================
            TAB: 150 LCA BENCHMARK DIRECTORY
            ============================================================ */}
        {activeTab === 'directory' && (
          <Suspense fallback={<ViewLoadingFallback message="جاري تحميل دليل الـ 150 مرجعاً ومعاملات الانبعاثات..." />}>
            <LcaDirectoryBrowser />
          </Suspense>
        )}

        {/* ============================================================
            TAB 2: SAVED PROJECTS
            ============================================================ */}
        {activeTab === 'saved' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>مشاريعك المحفوظة ({savedProjects.length})</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  قائمتك المختارة من مشاريع إعادة التدوير المبتكرة المزامنة سحابياً والمتاحة بدون إنترنت
                </p>
              </div>
            </div>

            {/* PWA Offline-Availability Banner */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.85rem', 
                backgroundColor: isOnline ? '#f0fdf4' : '#fef2f2', 
                border: `1px solid ${isOnline ? '#bbf7d0' : '#fecaca'}`, 
                borderRadius: '14px', 
                padding: '0.9rem 1.25rem', 
                marginBottom: '1.5rem', 
                fontSize: '0.83rem', 
                color: isOnline ? '#065f46' : '#991b1b',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              <Smartphone size={22} className={isOnline ? 'text-emerald-600' : 'text-rose-600'} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.15rem' }}>
                  ⚡ ميزة التصفح دون إنترنت (PWA Offline Capability):
                </strong>
                <span>
                  كافة مشاريعك المحفوظة، وخطوات التنفيذ، والمخططات مخزنة في ذاكرة جهازك. يمكنك فتحها وتطبيقها بالكامل حتى في حال انقطاع اتصال الإنترنت.
                </span>
              </div>
            </div>

            {savedProjects.length === 0 ? (
              <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center' }}>
                <Star size={48} color="var(--border-strong)" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>لا توجد مشاريع محفوظة بعد</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  يمكنك حفظ أي مشروع مبتكر أثناء تصفح المشاريع المقترحة للرجوع إليه في أي وقت ومزامنته سحابياً.
                </p>
                <button
                  type="button"
                  className="btn-action-outline"
                  onClick={() => setActiveTab('generator')}
                >
                  <Lightbulb size={16} />
                  <span>انتقل لإنشاء المشاريع</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {savedProjects.map((proj, sIdx) => (
                  <div 
                    key={proj.id || sIdx} 
                    style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onClick={() => setSelectedProjectModal(proj)}
                  >
                    <div style={{ width: '100%', height: '180px', background: '#0f172a', position: 'relative' }}>
                      <img
                        src={proj.gallery?.finished || proj.generatedImage || proj.image_url || generateSvgBlueprint(proj.name || proj.title, proj.materials || '', 'finished')}
                        alt={proj.name || proj.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => handleImageFallback(e, proj.name || proj.title, proj.materials || '', 'finished')}
                      />
                      <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem' }}>
                        <span className="badge-difficulty-card">{proj.difficulty || 'متوسط'}</span>
                      </div>
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        {proj.name || proj.title}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem', height: '3.6em', overflow: 'hidden' }}>
                        {proj.idea || proj.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProjectModal(proj);
                          }}
                          style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald-border)', color: 'var(--emerald-primary)', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <span>عرض تفاصيل المشروع الكاملة</span>
                          <ArrowLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSavedProject(proj.id, sIdx);
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          title="حذف من المحفوظات"
                        >
                          <Trash2 size={14} />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: CHAT WITH RECYCLING EXPERT
            ============================================================ */}
        {activeTab === 'chat' && (
          <div className="expert-chat-card">
            {/* Chat Header */}
            <div className="chat-card-top">
              <div className="brand-emblem-box" style={{ width: 44, height: 44 }}>
                <Recycle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>اسأل خبير الاستدامة والتدوير الذكي</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {projectContextForChat ? (
                    <span style={{ color: 'var(--emerald-primary)', fontWeight: 700 }}>
                      🎯 الدردشة مرتبطة بمشروعك الحالي: "{projectContextForChat.name}"
                    </span>
                  ) : (
                    'استفسر عن أي مادة، طرق القص، أدوات الربط، أو معايير السلامة والتصميم'
                  )}
                </p>
              </div>

              {projectContextForChat && (
                <button
                  type="button"
                  onClick={() => setProjectContextForChat(null)}
                  style={{
                    marginRight: 'auto',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  إلغاء ربط المشروع
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="chat-messages-area">
              {chatMessages.map((msg, i) => {
                if (msg.role === 'assistant' && !msg.content && isChatLoading && i === chatMessages.length - 1) {
                  return (
                    <div key={i} className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>خبير الذكاء الاصطناعي يحلل استفسارك ويبدأ التدفق المباشر...</span>
                    </div>
                  );
                }
                if (!msg.content && msg.role === 'assistant') return null;

                const isCurrentlyStreaming = isChatLoading && i === chatMessages.length - 1 && msg.role === 'assistant';

                return (
                  <div key={i} className={`chat-bubble ${msg.role}`}>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {msg.content}
                      {isCurrentlyStreaming && <span className="ai-stream-cursor">▌</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="chat-input-bar">
              <input
                type="text"
                className="chat-text-input"
                placeholder={projectContextForChat ? `اسأل عن تفاصيل تنفيذ "${projectContextForChat.name}"...` : "اكتب سؤالك هنا للخبير (مثلاً: كيف أقص الزجاج بأمان؟ ما بديل الغراء الساخن؟)..."}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button type="submit" className="btn-send-chat" disabled={isChatLoading}>
                {isChatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>{isChatLoading ? 'انتظر...' : 'إرسال'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================
            TAB 4: OFFICIAL CERTIFICATE & AUDIT (ISO 14044)
            ============================================================ */}
        {activeTab === 'certificate' && (
          <div className="official-certificate-container">
            {/* Top Certificate Actions */}
            <div className="cert-action-bar-top">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>وثيقة إنجاز بيئي وحساب الوفر الكربوني</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>شهادة إنجاز بيئي رقمية تستند إلى مبادئ تقييم دورة الحياة (LCA)</p>
              </div>

              <button 
                className="btn-print-official" 
                onClick={() => {
                  triggerCelebration();
                  window.print();
                }}
              >
                <Printer size={18} />
                <span>طباعة شهادة الإنجاز (Print / PDF)</span>
              </button>
            </div>

            {/* Official Formal Certificate Paper Frame */}
            <div className="official-certificate-paper">
              <div className="cert-guilloche-border" />
              <div className="cert-guilloche-inner" />

              <div className="cert-header-institutional">
                <div className="cert-emblem-seal">
                  <Shield size={36} />
                </div>
                <h2>شهادة إنجاز بيئي وحساب الوفر الكربوني</h2>
                <span className="cert-subtitle-en">DIGITAL CERTIFICATE OF CARBON OFFSET & CIRCULAR UPCYCLING</span>
              </div>

              <div className="cert-body-text">
                تشهد منصة مُدام للتدوير الذكي والاستدامة البيئية بأن المشارك{user?.user_metadata?.full_name ? ` (${user.user_metadata.full_name})` : user?.email ? ` (${user.email})` : ''} قد أنجز بنجاح
                مشروع إعادة التدوير المبتكر بالذكاء الاصطناعي:
                <br />
                <strong style={{ fontSize: '1.3rem', color: 'var(--navy-primary)', display: 'block', margin: '0.75rem 0' }}>
                  {certificateProject ? (certificateProject.name || certificateProject.title) : 'مشروع إعادة تدوير بيئي متعدد الخامات'}
                </strong>
                والذي تم تصميمه وتنفيذه وفق مبادئ الاقتصاد الدائري وتقييم دورة الحياة.
              </div>

              {/* Certificate Image Feature if Available */}
              {certificateProject && (
                <div style={{ maxWidth: '420px', margin: '1rem auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-sm)' }}>
                  <img
                    src={certificateProject.gallery?.finished || certificateProject.generatedImage || generateSvgBlueprint(certificateProject.name, certificateProject.materials, 'finished')}
                    alt={certificateProject.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    onError={(e) => handleImageFallback(e, certificateProject.name, certificateProject.materials, 'finished')}
                  />
                  <div style={{ background: '#f8fafc', padding: '0.4rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    التوثيق البصري للمنتج المنجز
                  </div>
                </div>
              )}

              {/* Impact Verified Table */}
              <div className="cert-impact-table">
                <div className="cert-impact-cell">
                  <span>إجمالي الوفر الكربوني المحسوب</span>
                  <h4>{impact.co2Saved.toFixed(2)} كغ CO₂</h4>
                  <small>مكافئ غازات الاحتباس الحراري</small>
                </div>

                <div className="cert-impact-cell">
                  <span>النفايات المحولة عن المرادم</span>
                  <h4>{impact.wasteReduced.toFixed(2)} كغ</h4>
                  <small>مواد صلبة معاد استخدامها</small>
                </div>

                <div className="cert-impact-cell">
                  <span>مجموع النقاط البيئية</span>
                  <h4>{environmentalPoints} نقطة</h4>
                  <small>تصنيف: ممارس استدامة متقدم</small>
                </div>
              </div>

              {/* Footer Signatures and Audit Code */}
              <div className="cert-footer-audit">
                <div className="cert-audit-signatures">
                  <div className="signature-block">
                    <div className="signature-line" />
                    <span className="signature-role">رئيس هيئة تقييم دورة الحياة (LCA)</span>
                  </div>
                  <div className="signature-block">
                    <div className="signature-line" />
                    <span className="signature-role">المستشار البيئي للذكاء الاصطناعي</span>
                  </div>
                </div>

                <div className="cert-qr-box">
                  <QrCode size={48} color="var(--navy-primary)" />
                  <span className="cert-serial-code">{certId}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>تاريخ الإصدار: {currentDate}</span>
                </div>
              </div>

              {/* Motivational Disclaimer Note */}
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                شهادة تحفيزية صادرة عن منصة مُدام، وليست شهادة رسمية معتمدة
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================
          LIGHTBOX MODAL FOR ULTRA HIGH RES IMAGE PREVIEWS
          ============================================================ */}
      {lightboxImage && (
        <div className="lightbox-backdrop" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <div className="lightbox-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="#34d399" />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{lightboxImage.title}</h4>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{lightboxImage.subtitle}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={lightboxImage.url}
                  download={`${lightboxImage.title}.jpg`}
                  className="lightbox-close-btn"
                  title="تنزيل الصورة بدقة كاملة"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Download size={15} />
                </a>
                <button
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => setLightboxImage(null)}
                  title="إغلاق النافذة"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              onError={(e) => handleImageFallback(e, lightboxImage.title, '', 'finished')}
            />
          </div>
        </div>
      )}

      {/* ============================================================
          INTERACTIVE TOAST FEEDBACK NOTIFICATIONS
          ============================================================ */}
      {toast && (
        <div className={`toast-banner ${toast.type}`}>
          <Sparkles size={16} color="#34d399" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* ============================================================
          DEDICATED FULL PROJECT PAGE (صفحة المشروع الخاصة المنبثقة)
          ============================================================ */}
      {selectedProjectModal && (
        <div 
          className="dedicated-page-overlay" 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 9999, 
            overflowY: 'auto', 
            backgroundColor: '#f8fafc', 
            width: '100vw', 
            height: '100vh' 
          }}
        >
          <Suspense fallback={<ViewLoadingFallback message="جاري تجهيز صفحة ومخططات المشروع..." />}>
            <ProjectDedicatedPage
              project={selectedProjectModal}
              onBack={() => {
                setSelectedProjectModal(null);
                window.location.hash = '';
              }}
              isSaved={isProjectSaved(savedProjects, selectedProjectModal)}
              onToggleSave={handleSaveProject}
              onOpenCertificate={(proj) => {
                setActiveCertModalProject(proj);
              }}
            />
          </Suspense>
        </div>
      )}

      {/* ============================================================
          OFFICIAL ECO CERTIFICATE MODAL POPUP
          ============================================================ */}
      {activeCertModalProject && (
        <Suspense fallback={null}>
          <EcoCertificateModal
            isOpen={Boolean(activeCertModalProject)}
            onClose={() => setActiveCertModalProject(null)}
            projectName={activeCertModalProject.name || activeCertModalProject.title}
            project={activeCertModalProject}
            user={user}
            lcaResults={{
              totalMassKg: activeCertModalProject.massKg || 2.45,
              totalNetOffsetKg: activeCertModalProject.co2SavedKg || (activeCertModalProject.metrics?.co2SavedKg ? parseFloat(activeCertModalProject.metrics.co2SavedKg) : 5.8),
              equivalences: {
                smartphoneCharges: 640,
                treeDaysOffset: 85,
                carKmEquivalent: 46
              },
              itemizedResults: (typeof activeCertModalProject.materials === 'string'
                ? activeCertModalProject.materials.split(/[،,]+/)
                : (activeCertModalProject.materials || ['خامات مستصلحة'])
              ).map((m, idx) => ({
                id: idx,
                name: typeof m === 'string' ? m.trim() : (m.name || 'خامة مستصلحة'),
                massKg: 0.82
              }))
            }}
          />
        </Suspense>
      )}

      {/* ============================================================
          INLINE PROJECT CONSULTATION MODAL (ON-PAGE EXPERT DIALOG)
          ============================================================ */}
      {inlineConsultation.isOpen && (
        <Suspense fallback={null}>
          <InlineConsultationModal
            isOpen={inlineConsultation.isOpen}
            onClose={() => setInlineConsultation({ isOpen: false, project: null, query: '' })}
            project={inlineConsultation.project}
            initialQuery={inlineConsultation.query}
            geminiApiKey={getStoredGeminiApiKey()}
            onOpenFullChat={(lastMsg) => {
              setProjectContextForChat(inlineConsultation.project);
              setActiveTab('chat');
              setChatInput(lastMsg || '');
            }}
          />
        </Suspense>
      )}

      {/* ============================================================
          OFFICIAL QR CERTIFICATE VERIFICATION MODAL
          ============================================================ */}
      {verificationData && (
        <Suspense fallback={null}>
          <CertificateVerificationModal
            isOpen={Boolean(verificationData)}
            onClose={() => {
              setVerificationData(null);
              if (window.location.hash.startsWith('#verify')) {
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
              }
            }}
            verificationData={verificationData}
            onOpenStudentPortal={() => {
              setActiveTab('academic');
              setVerificationData(null);
              if (window.location.hash.startsWith('#verify')) {
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
              }
            }}
            onOpenProjectStudio={(data) => {
              const matched = projects.find(p => (p.name || p.title) === data.projectName)
                || savedProjects.find(p => (p.name || p.title) === data.projectName)
                || {
                  id: 'verified-' + Date.now(),
                  name: data.projectName,
                  title: data.projectName,
                  idea: `مشروع معتمد تم توثيقه وحساب وفره الكربوني (+${data.co2} كجم CO2e) للطالب ${data.studentName}.`,
                  materials: 'خامات ومخلفات منزلية مستصلحة ومقيمة بمعايير LCA',
                  time: 'ساعتان ونصف',
                  difficulty: 'متوسط',
                  metrics: { co2SavedKg: data.co2, wasteReducedKg: data.mass },
                  parsedSteps: [
                    { title: 'جمع وفرز الخامات المطلوبة', detail: 'فرز الخامات المعتمدة وتجهيز مساحة العمل الآمنة.' },
                    { title: 'القص والتشكيل الأولي', detail: 'تنفيذ التقطيع وفق حاسبة الكفاءة لتقليل الهدر.' },
                    { title: 'التجميع والتثبيت النهائي', detail: 'استخدام وسيلة الربط الآمنة غير السامة وفحص المتانة.' }
                  ]
                };
              setSelectedProjectModal(matched);
              setVerificationData(null);
              if (window.location.hash.startsWith('#verify')) {
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
              }
            }}
          />
        </Suspense>
      )}

      {/* ============================================================
          EXPANDED MATERIALS LIBRARY MODAL (مكتبة المواد الموسعة)
          ============================================================ */}
      {isMaterialsLibraryOpen && (
        <Suspense fallback={null}>
          <MaterialsLibraryModal
            isOpen={isMaterialsLibraryOpen}
            onClose={() => setIsMaterialsLibraryOpen(false)}
            initialSelected={selectedMaterials}
            onApplyMaterials={handleApplyLibraryMaterials}
          />
        </Suspense>
      )}


      {/* ============================================================
          SUPABASE AUTHENTICATION MODAL
          ============================================================ */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
          />
        </Suspense>
      )}

      {/* ============================================================
          STUDENT & ACADEMIC SUITE GLOBAL MODALS
          ============================================================ */}
      {activeLabReportProject && (
        <Suspense fallback={null}>
          <StudentLabReportModal
            isOpen={Boolean(activeLabReportProject)}
            onClose={() => setActiveLabReportProject(null)}
            project={activeLabReportProject}
            user={user}
          />
        </Suspense>
      )}

      {activeRubricProject && (
        <Suspense fallback={null}>
          <StudentRubricModal
            isOpen={Boolean(activeRubricProject)}
            onClose={() => setActiveRubricProject(null)}
            project={activeRubricProject}
            user={user}
          />
        </Suspense>
      )}

      {activeQuizProject && (
        <Suspense fallback={null}>
          <StudentQuizModal
            isOpen={Boolean(activeQuizProject)}
            onClose={() => setActiveQuizProject(null)}
            project={activeQuizProject}
          />
        </Suspense>
      )}

      {/* ============================================================
          OFFICIAL FOOTER
          ============================================================ */}
      <footer className="official-app-footer">
        <div className="footer-inner-content">
          <div>
            <strong>مُدام • منصة التدوير الذكي والاستدامة البيئية</strong>
            <p style={{ margin: '0.25rem 0 0' }}>جميع الحقوق محفوظة © 2026</p>
          </div>

          <div className="footer-compliance-badges">
            <span className="std-tag">ISO 14044 LCA Compliant</span>
            <span className="std-tag">GHG Protocol Scope 3</span>
            <span className="std-tag">Multi-AI Smart Engine</span>
            <span className="std-tag">PWA Offline Enabled</span>
          </div>
        </div>
      </footer>
        </div> {/* End mudam-main-viewport */}
      </div>   {/* End mudam-layout-wrapper */}
    </div>
  );
}
