import React, { useState, useRef, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Recycle, Lightbulb, Star, Send, ArrowLeft, Camera, Loader2,
  Clock, Leaf, ChevronDown,
  Share2, BookOpen, Target, Shield, CheckCircle,
  Trophy, Calculator, Check, Trash2, Award, Printer,
  CheckCheck, QrCode, Sparkles, MessageSquare,
  X, Database, LogIn, LogOut, HelpCircle
} from 'lucide-react';
import {
  COMMON_MATERIALS,
  USER_LEVELS,
  PROJECT_TYPES,
  fetchAiProjects,
  regenerateSpecificGalleryView,
  sendChatMessageToAi
} from './utils/aiProjectEngine.js';
import { calculateCollectiveOffset } from './utils/lcaCalculator.js';
import { PRESET_SCENARIOS } from './data/presetScenarios.js';
import CarbonCalculatorView from './components/CarbonCalculatorView.jsx';
import LcaDirectoryBrowser from './components/LcaDirectoryBrowser.jsx';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import ProjectDetailModal from './components/ProjectDetailModal.jsx';
import {
  getSavedProjects,
  saveProjectToCloud,
  deleteProjectFromCloud,
  getUserProfileStats,
  updateUserProfileStats
} from './utils/supabaseSync.js';
import './index.css';

export default function App() {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);
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
  const [copiedIndex, setCopiedIndex] = useState(null);

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
      alert('يرجى اختيار أو كتابة المواد المتوفرة لديك ليولد الذكاء الاصطناعي مشاريع مخصصة لها');
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
        setFollowUpQuestions(res.followUpQuestions || []);
        setExpandedProject(0); // expand first project by default
        setCertificateProject(res.projects[0]);
        setEnvironmentalPoints(p => p + 15);
      } else {
        alert('تعذر توليد المشاريع، يرجى المحاولة مجدداً');
      }
    } catch (err) {
      console.error('Error generating AI projects:', err);
      alert('حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي: ' + (err.message || ''));
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
          setExpandedProject(0);
          setCertificateProject(res.projects[0]);
          setEnvironmentalPoints(p => p + 20);
          showToast('تم فحص وتحليل الصورة واستخراج المشاريع بنجاح! 📸');
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

              {/* Common Materials Chips */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  المواد الشائعة (انقر للاختيار):
                </label>
                <div className="material-chips-wrapper">
                  {COMMON_MATERIALS.map(mat => {
                    const isSelected = selectedMaterials.includes(mat);
                    return (
                      <button
                        type="button"
                        key={mat}
                        className={`material-chip-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleMaterial(mat)}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                        <span>{mat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Materials Input */}
              <div className="official-textarea-container">
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  مواد إضافية (أو اكتب بحرية):
                </label>
                <textarea
                  className="official-textarea"
                  placeholder="مثال: علب حليب أطفال، براميل زيت، إطارات سيارات، شماعات سلك، قمصان صوف..."
                  value={materials}
                  onChange={e => setMaterials(e.target.value)}
                />
              </div>

              {/* Select Options: User Level & Project Type */}
              <div className="form-select-row">
                <div className="form-group-field">
                  <label>مستوى المستخدم:</label>
                  <select
                    className="official-select-control"
                    value={userLevel}
                    onChange={e => setUserLevel(e.target.value)}
                  >
                    {USER_LEVELS.map(lvl => (
                      <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-field">
                  <label>نوع المشاريع المفضل:</label>
                  <select
                    className="official-select-control"
                    value={projectType}
                    onChange={e => setProjectType(e.target.value)}
                  >
                    {PROJECT_TYPES.map(typ => (
                      <option key={typ.value} value={typ.value}>{typ.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hidden File Input for Image Upload */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageUpload}
              />

              {/* Camera Upload Button */}
              <button
                type="button"
                className="btn-upload-camera"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera size={18} />
                <span>📸 ارفع صورة للمواد المتوفرة عندك لتحليلها بالذكاء الاصطناعي</span>
              </button>

              {/* Uploaded Image Preview Chip */}
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
                    <span>{loadingStep || 'جاري التحليل وتوليد معرض الصور بالذكاء الاصطناعي...'}</span>
                  </>
                ) : (
                  <>
                    <Lightbulb size={18} />
                    <span>🚀 ابتكر مشاريع ومعرض صور ثلاثي بالذكاء الاصطناعي</span>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--emerald-primary)' }}>
                      ✨ تم توليد {projects.length} مشاريع مخصصة مع معرض صور ثلاثي لكل مشروع:
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ⚡ مدعوم بـ Google Gemini & Generative Visual AI
                    </span>
                  </div>

                  {/* Modern Responsive Showcase Grid */}
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
                          {/* Image Cover Container */}
                          <div className="project-card-cover-wrap">
                            {activeImageUrl ? (
                              <img
                                src={activeImageUrl}
                                alt={project.name}
                                className="project-card-cover-img"
                                loading="lazy"
                              />
                            ) : (
                              <div className="project-card-cover-fallback">
                                <Lightbulb size={36} color="var(--emerald-primary)" />
                              </div>
                            )}

                            {/* Gradient Overlay & Badges */}
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

                            {/* Floating Quick Action Icons */}
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

                          {/* Card Content Details */}
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

                            {/* Materials chips */}
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

                            {/* Mini KPIs Strip */}
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

                            {/* Primary CTA Button */}
                            <div className="project-card-cta-row">
                              <button
                                type="button"
                                className="btn-open-project-modal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProjectModal(project);
                                }}
                              >
                                <span>عرض تفاصيل المشروع الكاملة</span>
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

                  {/* Follow-up Questions Section */}
                  {followUpQuestions.length > 0 && (
                    <div style={{ marginTop: '2.5rem', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <HelpCircle size={18} color="var(--emerald-primary)" />
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>أسئلة ذكية لتخصيص أدق لمشروعك القادم:</h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {followUpQuestions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            onClick={() => handleAskFollowUp(q)}
                            style={{
                              padding: '0.75rem 1rem',
                              background: 'var(--bg-surface-soft)',
                              borderRadius: '8px',
                              fontSize: '0.86rem',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: '1px solid transparent',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'var(--emerald-primary)';
                              e.currentTarget.style.background = '#ffffff';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'transparent';
                              e.currentTarget.style.background = 'var(--bg-surface-soft)';
                            }}
                          >
                            <span>{q}</span>
                            <ArrowLeft size={14} color="var(--emerald-primary)" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                        src={proj.gallery?.finished || proj.generatedImage || proj.image_url || '/step1.jpg'}
                        alt={proj.name || proj.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
              {certificateProject?.gallery?.finished && (
                <div style={{ maxWidth: '420px', margin: '1rem auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-sm)' }}>
                  <img
                    src={certificateProject.gallery.finished}
                    alt={certificateProject.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
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
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{lightboxImage.title}</h4>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{lightboxImage.subtitle}</span>
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setLightboxImage(null)}
              >
                <X size={18} />
              </button>
            </div>
            <img src={lightboxImage.url} alt={lightboxImage.title} />
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
          DEDICATED PROJECT DETAIL POP-UP MODAL (صفحة المشروع المنبثقة)
          ============================================================ */}
      <ProjectDetailModal
        project={selectedProjectModal}
        isOpen={!!selectedProjectModal}
        onClose={() => setSelectedProjectModal(null)}
        onSaveProject={handleSaveProject}
        isSaved={selectedProjectModal ? savedProjects.some(p => p.name === selectedProjectModal.name || (selectedProjectModal.id && p.id === selectedProjectModal.id)) : false}
        onShareProject={(proj) => handleShareProject(proj, projects.findIndex(p => p.name === proj.name))}
        isCopied={copiedIndex !== null}
        onMarkCompleted={handleMarkCompleted}
        onConsultExpert={handleConsultExpertForProject}
        onOpenCertificate={(proj) => {
          setCertificateProject(proj);
          setActiveTab('certificate');
        }}
        onSwitchGalleryView={(viewKey) => handleSwitchGalleryView(null, viewKey)}
        onRegenerateView={(viewKey) => handleRegenerateView(selectedProjectModal, null, viewKey)}
        isRegenerating={!!generatingImageFor}
        onToggleStep={(stepId) => handleToggleStep(null, stepId)}
        onOpenLightbox={setLightboxImage}
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
