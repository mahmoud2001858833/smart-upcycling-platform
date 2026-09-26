import React, { useState, useRef, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Recycle, Lightbulb, Star, Send, ArrowLeft, Camera, Loader2,
  Clock, Leaf, ChevronDown,
  Share2, BookOpen, Target, Shield, CheckCircle,
  Trophy, Calculator, Check, Trash2, Award, Printer,
  CheckCheck, QrCode, Sparkles, MessageSquare,
  X, Database, LogIn, LogOut, HelpCircle, Layers,
  Plus, Wand2, Bot, Download,
  Grid, Eye, BarChart2
} from 'lucide-react';
import {
  COMMON_MATERIALS,
  USER_LEVELS,
  PROJECT_TYPES,
  fetchAiProjects,
  regenerateSpecificGalleryView,
  regenerateStepImage,
  sendChatMessageToAi
} from './utils/aiProjectEngine.js';
import { calculateCollectiveOffset } from './utils/lcaCalculator.js';
import { PRESET_SCENARIOS } from './data/presetScenarios.js';
import { 
  INSPIRATION_SUGGESTIONS, 
  COMPANION_SUGGESTIONS_MAP, 
  PROJECT_CUSTOMIZATION_SUGGESTIONS 
} from './data/inspirationSuggestions.js';
import CarbonCalculatorView from './components/CarbonCalculatorView.jsx';
import LcaDirectoryBrowser from './components/LcaDirectoryBrowser.jsx';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import MaterialsLibraryModal from './components/MaterialsLibraryModal.jsx';
import ProjectDedicatedPage from './components/ProjectDedicatedPage.jsx';
import EcoCertificateModal from './components/EcoCertificateModal.jsx';

import {
  getSavedProjects,
  saveProjectToCloud,
  deleteProjectFromCloud,
  getUserProfileStats,
  updateUserProfileStats
} from './utils/supabaseSync.js';
import { handleImageFallback, generateSvgBlueprint, preloadProjectImages } from './utils/imageCatalog.js';
import './index.css';

export default function App() {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);
  const [isMaterialsLibraryOpen, setIsMaterialsLibraryOpen] = useState(false);
  const [activeCertModalProject, setActiveCertModalProject] = useState(null);
  const fileInputRef = useRef(null);
  const userDropdownRef = useRef(null);


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
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);

  // Projects & UI states
  const [projects, setProjects] = useState([]);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [generatingImageFor, setGeneratingImageFor] = useState(null);
  const [regeneratingStepId, setRegeneratingStepId] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [materialSelectTab, setMaterialSelectTab] = useState('packs'); // 'packs' | 'grid' | 'custom'
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
      content: 'أهلاً بك! أنا خبير إعادة التدوير والاستدامة البيئية الذكي V3. يمكنني مساعدتك في تحليل أي خامات، واقتراح طرق الربط والقص الآمنة، وابتكار تصاميم متعددة الصور لكل فكرة.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Selected Project for Official Certificate
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

  // Handle clicking a Project Customization Suggestion
  const handleCustomizationSuggestion = (sug, project) => {
    const target = project || projects[0] || selectedProjectModal;
    setProjectContextForChat(target);
    setActiveTab('chat');
    const prompt = sug.promptTemplate(target);
    setChatInput(prompt);
    showToast(`💡 تم تحضير استشارة الخبير الذكي حول الاقتراح!`, 'info');
  };

  // Environmental impact calculations
  const impact = useMemo(() => {
    const wasteReduced = completedProjects * 0.75;
    const co2Saved = completedProjects * 1.65;
    return { wasteReduced, co2Saved };
  }, [completedProjects]);


  // Generate Projects with Live AI Engine
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
    setLoadingStep('تحليل بنية المواد والخواص الفيزيائية عبر Gemini AI...');

    try {
      const materialsString = allMaterials.join('، ');
      const res = await fetchAiProjects({
        materials: materialsString,
        userLevel,
        projectType
      });

      if (res.success && res.projects?.length > 0) {
        setProjects(res.projects);
        setActiveSpotlightIndex(0);
        res.projects.forEach(p => preloadProjectImages(p));
        setFollowUpQuestions(res.followUpQuestions || []);
        setCertificateProject(res.projects[0]);
        setEnvironmentalPoints(p => p + 15);

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
        showToast('تعذر توليد المشاريع، يرجى المحاولة مجدداً', 'error');
      }
    } catch (err) {
      console.error('Error generating AI projects:', err);
      showToast('حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي: ' + (err.message || ''), 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

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
    setLoadingStep('الذكاء الاصطناعي يدير هندسة المشروع ويوزع المهام على الوكلاء الستة...');
    try {
      const res = await fetchAiProjects({
        materials: topScenario.materials.join('، '),
        userLevel: topScenario.difficulty || 'متوسط',
        projectType: topScenario.type || 'ديكور منزلي'
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
      showToast('حدث خطأ أثناء التوجيه الذاتي للذكاء الاصطناعي', 'error');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
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

  // Consult AI Expert specifically about this project
  const handleConsultExpertForProject = (project) => {
    setProjectContextForChat(project);
    setActiveTab('chat');
    const introQuery = `أود استشارتك حول مشروع "${project.name}" المصنوع من (${project.materials}). كيف أبدأ بالتنفيذ العملي بأعلى درجات الأمان والمتانة؟`;
    setChatInput(introQuery);
  };

  // Save Project with Supabase Cloud Sync
  const handleSaveProject = async (project) => {
    if (savedProjects.some(p => p.name === project.name || (project.id && p.id === project.id))) {
      showToast('هذا المشروع محفوظ لديك بالفعل!', 'info');
      return;
    }
    const res = await saveProjectToCloud(user?.id, project);
    setSavedProjects(prev => [res.savedProject, ...prev]);
    showToast(`تم حفظ مشروع "${project.name}" في قائمتك المفضلة! ⭐`);
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

  // Send message in Live AI Expert Chat
  const handleSendChatMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const updatedHistory = [...chatMessages, { role: 'user', content: userText }];
    setChatMessages(updatedHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const reply = await sendChatMessageToAi({
        question: userText,
        conversationHistory: updatedHistory,
        projectContext: projectContextForChat
      });
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'نعتذر، حدث خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Click on a Follow-up Question
  const handleAskFollowUp = async (question) => {
    setActiveTab('chat');
    const updatedHistory = [...chatMessages, { role: 'user', content: question }];
    setChatMessages(updatedHistory);
    setIsChatLoading(true);

    try {
      const reply = await sendChatMessageToAi({
        question,
        conversationHistory: updatedHistory,
        projectContext: projectContextForChat
      });
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsChatLoading(false);
    }
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
            <span>المنظومة الوطنية الرسمية لإعادة التدوير • معتمد وفق مواصفة ISO 14044 وبروتوكول GHG العالمي</span>
          </div>
          <div className="notice-left">
            <span>SMART UPCYCLING EXPERT V3 • MULTI-IMAGE AI SUITE</span>
          </div>
        </div>

        {/* Main Header Row */}
        <div className="top-bar-main">
          {/* Logo & Seal */}
          <div className="official-brand" onClick={() => setActiveTab('generator')}>
            <div className="brand-emblem-box">
              <Recycle size={26} strokeWidth={2.4} />
            </div>
            <div className="brand-titles">
              <h1>خبير إعادة التدوير والاستدامة الذكي</h1>
              <p>Smart Recycling Project Advisor V3 • ذكاء اصطناعي تفاعلي متعدد المشاهد</p>
            </div>
          </div>

          {/* Points & Completed Projects Badges */}
          <div className="points-badges-row">
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
                        {user.user_metadata?.is_guest ? 'حساب تجريبي' : 'عضو معتمد'}
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
                            setActiveTab('certificate');
                            setIsUserDropdownOpen(false);
                          }}
                        >
                          <Award size={16} />
                          <span>الشهادة البيئية المعتمدة</span>
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
          MAIN BODY CONTAINER
          ============================================================ */}
      <main className="official-main-content">
        {/* Navigation Tabs Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="official-nav-tabs" style={{ maxWidth: '920px', width: '100%', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              className={`official-nav-btn ${activeTab === 'generator' ? 'active' : ''}`}
              onClick={() => setActiveTab('generator')}
              style={{ flex: '1 1 auto', justifyContent: 'center' }}
            >
              <Lightbulb size={16} />
              <span>مولد المشاريع</span>
            </button>

            <button
              className={`official-nav-btn ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculator')}
              style={{ flex: '1 1 auto', justifyContent: 'center' }}
            >
              <Calculator size={16} />
              <span>حاسبة الأثر (LCA)</span>
            </button>

            <button
              className={`official-nav-btn ${activeTab === 'directory' ? 'active' : ''}`}
              onClick={() => setActiveTab('directory')}
              style={{ flex: '1 1 auto', justifyContent: 'center' }}
            >
              <Database size={16} />
              <span>دليل الـ 150 مصدراً</span>
            </button>

            <button
              className={`official-nav-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
              style={{ flex: '1 1 auto', justifyContent: 'center' }}
            >
              <Star size={16} />
              <span>المحفوظة ({savedProjects.length})</span>
            </button>

            <button
              className={`official-nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
              style={{ flex: '1 1 auto', justifyContent: 'center' }}
            >
              <Send size={16} />
              <span>اسأل الخبير {projectContextForChat ? '🎯' : ''}</span>
            </button>

            <button
              className={`official-nav-btn ${activeTab === 'certificate' ? 'active' : ''}`}
              onClick={() => setActiveTab('certificate')}
              style={{ flex: '1 1 auto', justifyContent: 'center' }}
            >
              <Award size={16} />
              <span>الشهادة المعتمدة</span>
            </button>
          </div>
        </div>

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
            TAB 1: GENERATOR TAB (INPUTS & DYNAMIC PROJECTS)
            ============================================================ */}
        {activeTab === 'generator' && (
          <div className="intake-layout-grid">
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

              {/* AI Autonomous Mission Director Banner (الموجّه الذكي الفعّال للمنظومة) */}
              <div className="ai-mission-director-banner">
                <div className="ai-mission-director-content">
                  <div className="ai-mission-avatar-pulse">
                    <Bot size={22} />
                  </div>
                  <div className="ai-mission-text-block">
                    <div className="ai-mission-badge-row">
                      <span className="ai-mission-pill">الموجّه الذكي الفعّال • AI Autonomous Director</span>
                      <span className="ai-mission-status-dot">6 وكلاء متخصصين بتنسيق حي</span>
                    </div>
                    <h4 className="ai-mission-headline">
                      {selectedMaterials.length === 0
                        ? 'دع الذكاء الاصطناعي يتولى القيادة الكاملة ويختار الخامات ويصنع المشروع الأمثل لك'
                        : `يتابع فريق الوكلاء اختيارك لـ (${selectedMaterials.length} خامات). انقر للتوجيه الذاتي أو تابع التخصيص.`}
                    </h4>
                    <p className="ai-mission-sub">
                      {selectedMaterials.length === 0
                        ? 'يقوم منسق الوكلاء باختيار التوليفة الهندسية الأعلى جدوى والأنسب لبيئتك ويدير عملية التصنيع والتوثيق فورياً.'
                        : 'تم تدقيق التوافق الميكانيكي للخامات، وفريق التصميم مستعد لإطلاق استوديو التوليد المتكامل.'}
                    </p>
                  </div>
                </div>

                <div className="ai-mission-action-wrap">
                  <button
                    type="button"
                    onClick={handleAiAutoPilot}
                    disabled={isLoading}
                    className="btn-ai-autopilot"
                    title="الذكاء الاصطناعي يختار التوليفة والإعدادات ويولد المشروع فوراً بنقرة واحدة"
                  >
                    <Wand2 size={16} />
                    <span>التوجيه الذاتي الكامل (1-Click Auto-Pilot)</span>
                  </button>
                </div>
              </div>

              {/* Modern Selection Studio Tabs (أرقى وأسهل تجربة اختيار) */}
              <div className="selection-studio-tabs">
                <button
                  type="button"
                  className={`studio-tab-btn ${materialSelectTab === 'packs' ? 'active' : ''}`}
                  onClick={() => setMaterialSelectTab('packs')}
                >
                  <Sparkles size={15} />
                  <span>حزم أفكار جاهزة (Packs)</span>
                </button>
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
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>جاهز لتوليد المشاريع المعتمدة</span>
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
                    <span>🚀 ابتكار مشاريع ومعرض صور ثلاثي عبر طاقم الـ 6 وكلاء أذكياء</span>
                  </>
                )}
              </button>
            </div>

            {/* Left Column: Generated Projects Display */}
            <div>
              {projects.length === 0 ? (
                <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
                  <Recycle size={56} color="var(--border-strong)" style={{ margin: '0 auto 1.25rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    بانتظار إدخال موادك
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                    اختر المواد أو اكتبها واضغط على زر الابتكار ليقوم الذكاء الاصطناعي بتوليد مشاريع حصرية لكل طلب مع 3 صور فنية عالية الدقة (المنتج المكتمل، مراحل التجميع، والاستخدام الواقعي).
                  </p>
                </div>
              ) : (
                <div>
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
                    const activeImageUrl = activeProj.gallery?.[activeView] || activeProj.generatedImage;
                    const isSaved = savedProjects.some(p => p.name === activeProj.name || (activeProj.id && p.id === activeProj.id));
                    const stepsCount = activeProj.parsedSteps ? activeProj.parsedSteps.length : 0;
                    const materialsList = typeof activeProj.materials === 'string'
                      ? activeProj.materials.split(/[,،]/).map(m => m.trim()).filter(Boolean)
                      : (Array.isArray(activeProj.materials) ? activeProj.materials : []);

                    return (
                      <div className="spotlight-showcase-card">
                        {/* Media Container with multi-angle gallery */}
                        <div className="spotlight-media-container">
                          <img
                            src={activeImageUrl || generateSvgBlueprint(activeProj.name, activeProj.materials, activeView)}
                            alt={activeProj.name}
                            className="spotlight-hero-img"
                            loading="lazy"
                            onError={(e) => handleImageFallback(e, activeProj.name, activeProj.materials, activeView)}
                          />

                          {/* Top Badges */}
                          <div className="spotlight-badges-tag">
                            <span className="spotlight-badge cert">تدوير معتمد ISO 14044</span>
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

                          {/* 3-Angle Gallery Switcher Directly On Photo */}
                          <div className="spotlight-angles-bar">
                            <button
                              type="button"
                              className={`spotlight-angle-btn ${activeView === 'finished' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSwitchGalleryView(activeSpotlightIndex, 'finished');
                              }}
                            >
                              ✨ المنتج النهائي
                            </button>
                            <button
                              type="button"
                              className={`spotlight-angle-btn ${activeView === 'assembly' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSwitchGalleryView(activeSpotlightIndex, 'assembly');
                              }}
                            >
                              🔧 مراحل التجميع
                            </button>
                            <button
                              type="button"
                              className={`spotlight-angle-btn ${activeView === 'inUse' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSwitchGalleryView(activeSpotlightIndex, 'inUse');
                              }}
                            >
                              🏡 بالاستخدام الواقعي
                            </button>
                          </div>
                        </div>

                        {/* Spotlight Content Body */}
                        <div className="spotlight-content-body">
                          <div className="spotlight-header-row">
                            <div>
                              <span className="spotlight-mini-tag">المشروع رقم {activeSpotlightIndex + 1} من أصل {projects.length}</span>
                              <h2 className="spotlight-title">{activeProj.name}</h2>
                            </div>
                            <span className="spotlight-pts-pill">+35 نقطة بيئية 🌱</span>
                          </div>

                          <p className="spotlight-description">{activeProj.idea}</p>

                          {/* 4 Core KPI Tiles */}
                          <div className="spotlight-kpi-grid">
                            <div className="spotlight-kpi-tile emerald">
                              <Leaf size={20} />
                              <div>
                                <span className="kpi-num">{activeProj.metrics?.co2SavedKg || '2.4'} كغ</span>
                                <span className="kpi-sub">وفر كربوني (CO₂)</span>
                              </div>
                            </div>
                            <div className="spotlight-kpi-tile cyan">
                              <Trophy size={20} />
                              <div>
                                <span className="kpi-num">{activeProj.metrics?.estimatedSavings || '$25'}</span>
                                <span className="kpi-sub">الوفر المالي التقديري</span>
                              </div>
                            </div>
                            <div className="spotlight-kpi-tile blue">
                              <Shield size={20} />
                              <div>
                                <span className="kpi-num">{activeProj.metrics?.durabilityYears || '3+'} سنوات</span>
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

                          {/* 6 AI Agents Swarm Verification Strip */}
                          <div className="spotlight-swarm-strip">
                            🤖 مصادق هندسياً من طاقم الـ 6 وكلاء: خبير الخامات • كبير المهندسين • مدقق السلامة • محلل دورة الحياة (LCA)
                          </div>

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
                              <span>الشهادة المعتمدة</span>
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
                        const activeImageUrl = project.gallery?.[activeView] || project.generatedImage;
                        const isSaved = savedProjects.some(p => p.name === project.name || (project.id && p.id === project.id));
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
                              <img
                                src={activeImageUrl || generateSvgBlueprint(project.name, project.materials, activeView)}
                                alt={project.name}
                                className="project-card-cover-img"
                                loading="lazy"
                                onError={(e) => handleImageFallback(e, project.name, project.materials, activeView)}
                              />

                              <div className="project-card-badges-overlay">
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
                                  <span>تدوير معتمد ISO 14044</span>
                                </span>
                                <span className="project-card-points-tag">+30 نقطة 🌱</span>
                              </div>

                              <h3 className="project-card-headline">{project.name}</h3>

                              <p className="project-card-snippet">
                                {project.idea}
                              </p>

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
                                    <span className="kpi-val">{project.metrics.estimatedSavings || '15-25$'}</span>
                                  </div>
                                  <div className="mini-kpi">
                                    <span className="kpi-label">العمر الافتراضي</span>
                                    <span className="kpi-val">{project.metrics.durabilityYears || 'سنتان'}</span>
                                  </div>
                                  <div className="mini-kpi">
                                    <span className="kpi-label">وفر الكربون</span>
                                    <span className="kpi-val emerald">{project.metrics.co2SavedKg || '1.8'} كغ</span>
                                  </div>
                                </div>
                              )}

                              <div className="project-card-swarm-badge">
                                <span className="swarm-badge-pill">
                                  🤖 تدقيق ومصادقة 6 وكلاء أذكياء (المواد • الهندسة • الأثر)
                                </span>
                              </div>

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
                                <div className="compare-th-title">{proj.name}</div>
                                <span className="compare-th-badge">خيار #{idx + 1}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
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
                              <td key={idx} className="compare-metric-val highlight">{proj.metrics?.co2SavedKg || '2.0'} كغ CO₂</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">الوفر المالي التقديري</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val highlight">{proj.metrics?.estimatedSavings || '$20'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">نسبة الجدوى الهندسية</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val">{proj.metrics?.feasibilityScore || '90'}%</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">العمر الافتراضي للمنتج</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val">{proj.metrics?.durabilityYears || 'سنتان'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="compare-metric-label">مراحل التنفيذ المصورة</td>
                            {projects.map((proj, idx) => (
                              <td key={idx} className="compare-metric-val">{proj.parsedSteps ? proj.parsedSteps.length : 0} مراحل معتمدة</td>
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
                        <Sparkles size={18} color="var(--emerald-primary)" />
                        <h4>🔮 اقتراحات ذكية لتطوير وتخصيص المشاريع المولدة:</h4>
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
            TAB: LCA CARBON CALCULATOR
            ============================================================ */}
        {activeTab === 'calculator' && (
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
        )}

        {/* ============================================================
            TAB: 150 LCA BENCHMARK DIRECTORY
            ============================================================ */}
        {activeTab === 'directory' && (
          <LcaDirectoryBrowser />
        )}

        {/* ============================================================
            TAB 2: SAVED PROJECTS
            ============================================================ */}
        {activeTab === 'saved' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>مشاريعك المحفوظة ({savedProjects.length})</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  قائمتك المختارة من مشاريع إعادة التدوير المبتكرة المزامنة سحابياً مع حسابك
                </p>
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
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>اسأل خبير الاستدامة الذكي (Gemini AI Advisor)</h3>
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
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role}`}>
                  {msg.content}
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span>خبير الذكاء الاصطناعي يحلل استفسارك ويكتب الإجابة...</span>
                </div>
              )}
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>وثيقة الاعتماد البيئي والوفر الكربوني الرسمي</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>شهادة رقمية رسمية معتمدة وفق المعايير البيئية الدولية ISO 14044</p>
              </div>

              <button 
                className="btn-print-official" 
                onClick={() => {
                  triggerCelebration();
                  window.print();
                }}
              >
                <Printer size={18} />
                <span>طباعة الوثيقة الرسمية (Print / PDF)</span>
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
                <h2>شهادة اعتماد الوفر الكربوني والتحويل المستدام</h2>
                <span className="cert-subtitle-en">OFFICIAL CERTIFICATE OF CARBON OFFSET & CIRCULAR UPCYCLING</span>
              </div>

              <div className="cert-body-text">
                تشهد المنظومة الوطنية لإعادة التدوير والاستدامة البيئية الذكية بأن المشارك{user?.user_metadata?.full_name ? ` (${user.user_metadata.full_name})` : user?.email ? ` (${user.email})` : ''} قد أنجز بنجاح
                مشروع إعادة التدوير المبتكر بالذكاء الاصطناعي:
                <br />
                <strong style={{ fontSize: '1.3rem', color: 'var(--navy-primary)', display: 'block', margin: '0.75rem 0' }}>
                  {certificateProject ? (certificateProject.name || certificateProject.title) : 'مشروع إعادة تدوير بيئي متعدد الخامات'}
                </strong>
                والذي تم تصميمه وتنفيذه وفق مواصفات الاقتصاد الدائري المعتمدة عالمياً.
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
                    التوثيق البصري الرسمي للمنتج المنجز
                  </div>
                </div>
              )}

              {/* Impact Verified Table */}
              <div className="cert-impact-table">
                <div className="cert-impact-cell">
                  <span>إجمالي الوفر الكربوني المعتمد</span>
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
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>تاريخ الاعتماد: {currentDate}</span>
                </div>
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
          <ProjectDedicatedPage
            project={selectedProjectModal}
            onBack={() => {
              setSelectedProjectModal(null);
              window.location.hash = '';
            }}
            isSaved={Array.isArray(savedProjects) && savedProjects.some(p => p.name === selectedProjectModal.name || (selectedProjectModal.id && p.id === selectedProjectModal.id))}
            onToggleSave={handleSaveProject}
            onOpenCertificate={(proj) => {
              setActiveCertModalProject(proj);
            }}
          />
        </div>
      )}

      {/* ============================================================
          OFFICIAL ECO CERTIFICATE MODAL POPUP
          ============================================================ */}
      {activeCertModalProject && (
        <EcoCertificateModal
          isOpen={Boolean(activeCertModalProject)}
          onClose={() => setActiveCertModalProject(null)}
          projectName={activeCertModalProject.name || activeCertModalProject.title}
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
      )}

      {/* ============================================================
          EXPANDED MATERIALS LIBRARY MODAL (مكتبة المواد الموسعة)
          ============================================================ */}
      <MaterialsLibraryModal
        key={isMaterialsLibraryOpen ? 'open' : 'closed'}
        isOpen={isMaterialsLibraryOpen}
        onClose={() => setIsMaterialsLibraryOpen(false)}
        initialSelected={selectedMaterials}
        onApplyMaterials={handleApplyLibraryMaterials}
      />


      {/* ============================================================
          SUPABASE AUTHENTICATION MODAL
          ============================================================ */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* ============================================================
          OFFICIAL FOOTER
          ============================================================ */}
      <footer className="official-app-footer">
        <div className="footer-inner-content">
          <div>
            <strong>خبير إعادة التدوير الذكي V3 • المنظومة الوطنية المعتمدة</strong>
            <p style={{ margin: '0.25rem 0 0' }}>جميع الحقوق محفوظة للمملكة © 2026</p>
          </div>

          <div className="footer-compliance-badges">
            <span className="std-tag">ISO 14044 LCA Compliant</span>
            <span className="std-tag">GHG Protocol Scope 3</span>
            <span className="std-tag">Gemini AI Engine Powered</span>
            <span className="std-tag">Multi-Image Visual Suite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
