import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  KeyRound,
  Recycle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp, resetPassword, signInWithGoogle, signInAsGuest } = useAuth();
  
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [shake, setShake] = useState(false);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode) => {
    setError(null);
    setSuccessMessage(null);
    setMode(newMode);
  };

  const triggerErrorShake = (errMsg) => {
    setError(errMsg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  // Convert technical errors into friendly Arabic messages
  const formatErrorMessage = (err) => {
    const msg = (err?.message || err?.error_description || '').toLowerCase();
    if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.';
    }
    if (msg.includes('user already registered') || msg.includes('user_already_exists')) {
      return 'هذا البريد الإلكتروني مسجل بالفعل في المنصة. يمكنك تسجيل الدخول مباشرة.';
    }
    if (msg.includes('password should be at least')) {
      return 'يجب أن تتكون كلمة المرور من 6 خانات على الأقل.';
    }
    if (msg.includes('email not confirmed')) {
      return 'يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل إلى صندوق الوارد (أو تجربة وضع الضيف).';
    }
    if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
      return 'تم تجاوز الحد المسموح من المحاولات مؤقتاً. يرجى الانتظار دقيقة ثم المحاولة ثانية.';
    }
    if (msg.includes('network') || msg.includes('failed to fetch')) {
      return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
    }
    return err?.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب. يرجى إعادة المحاولة.';
  };

  // Password strength meter calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'ضعيفة جداً', color: '#ef4444' };
      case 2:
        return { score: 50, label: 'مقبولة', color: '#f97316' };
      case 3:
        return { score: 75, label: 'جيدة وقوية', color: '#059669' };
      case 4:
        return { score: 100, label: 'ممتازة وفائقة الأمان', color: '#046A38' };
      default:
        return { score: 0, label: '', color: '' };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  // Email regex validation
  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation checks
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      triggerErrorShake('يرجى إدخال البريد الإلكتروني.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      triggerErrorShake('صيغة البريد الإلكتروني غير صحيحة (مثال: name@domain.com)');
      return;
    }

    if (mode === 'signin') {
      if (!password) {
        triggerErrorShake('يرجى إدخال كلمة المرور.');
        return;
      }
      setLoading(true);
      try {
        await signIn(trimmedEmail, password);
        onClose();
        resetForm();
      } catch (err) {
        triggerErrorShake(formatErrorMessage(err));
      } finally {
        setLoading(false);
      }
    } else if (mode === 'signup') {
      if (!fullName.trim()) {
        triggerErrorShake('يرجى إدخال اسمك الكريم أو اللقب المهني.');
        return;
      }
      if (!password || password.length < 6) {
        triggerErrorShake('يجب ألا تقل كلمة المرور عن 6 خانات.');
        return;
      }
      if (password !== confirmPassword) {
        triggerErrorShake('كلمتا المرور غير متطابقتين. يرجى التأكد من كتابتهما بدقة.');
        return;
      }
      setLoading(true);
      try {
        const data = await signUp(trimmedEmail, password, { 
          full_name: fullName.trim(),
          remember_me: rememberMe
        });
        
        if (data?.user && !data?.session) {
          setSuccessMessage('تم إنشاء الحساب بنجاح! تم إرسال رسالة تأكيد إلى بريدك الإلكتروني لتفعيل الحساب.');
        } else {
          setSuccessMessage('أهلاً بك! تم إنشاء حسابك البيئي وتسجيل الدخول بنجاح.');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1200);
        }
      } catch (err) {
        triggerErrorShake(formatErrorMessage(err));
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(trimmedEmail);
        setSuccessMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح. تفقد صندوق الوارد.');
      } catch (err) {
        triggerErrorShake(formatErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      triggerErrorShake(formatErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  // Instant Guest Demo Login Handler
  const handleGuestSignIn = async () => {
    setError(null);
    setGuestLoading(true);
    try {
      await signInAsGuest();
      setSuccessMessage('تم تسجيل الدخول في وضع الضيف التجريبي بنجاح!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 700);
    } catch (err) {
      triggerErrorShake(formatErrorMessage(err));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className={`auth-modal-card ${shake ? 'animate-shake' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="auth-modal-close" 
          onClick={onClose} 
          aria-label="إغلاق النافذة"
        >
          <X size={19} />
        </button>

        {/* Brand Header */}
        <div className="auth-modal-header">
          <div className="auth-brand-badge">
            <div className="auth-brand-icon-pulse">
              <Recycle size={28} className="auth-recycle-svg" />
            </div>
            <span className="auth-system-tag">بوابة الوصول الآمنة</span>
          </div>

          <h3 className="auth-modal-title">
            {mode === 'signin' && 'مرحباً بك في منصة خبير الاستدامة'}
            {mode === 'signup' && 'انضم إلى مجتمع رواد الاقتصاد الدائري'}
            {mode === 'forgot' && 'استعادة كلمة المرور'}
          </h3>

          <p className="auth-modal-subtitle">
            {mode === 'signin' && 'سجّل دخولك لمزامنة مشاريعك سحابياً، وحساب أثر الكربون، وإصدار الشهادات.'}
            {mode === 'signup' && 'أنشئ حسابك البيئي المعتمد واستفد من جميع أدوات التدوير الذكي والـ LCA.'}
            {mode === 'forgot' && 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً مشفراً لتعيين كلمة مرور جديدة.'}
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        {mode !== 'forgot' && (
          <div className="auth-tabs-container">
            <div className="auth-tabs-pill">
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => switchMode('signin')}
              >
                <LogIn size={15} />
                <span>تسجيل الدخول</span>
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => switchMode('signup')}
              >
                <UserPlus size={15} />
                <span>حساب جديد</span>
              </button>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {error && (
          <div className="auth-alert error" role="alert">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div className="auth-alert-content">
              <strong>تنبيه:</strong> {error}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success" role="status">
            <CheckCircle size={18} className="flex-shrink-0" />
            <div className="auth-alert-content">{successMessage}</div>
          </div>
        )}

        {/* Fast Guest Mode Option & Social Login (Only in Signin/Signup) */}
        {mode !== 'forgot' && (
          <div className="auth-quick-access-section">
            {/* Instant Demo Account Access */}
            <button
              type="button"
              className="auth-guest-quick-btn"
              onClick={handleGuestSignIn}
              disabled={guestLoading || loading}
              title="دخول فوري بدون إنشاء حساب لتجربة المنصة بكامل ميزاتها"
            >
              <div className="auth-guest-btn-content">
                <div className="auth-guest-icon-wrap">
                  {guestLoading ? <Loader2 size={16} className="spin-animate" /> : <Sparkles size={16} />}
                </div>
                <div className="auth-guest-texts">
                  <span className="auth-guest-title">دخول سريع كـ ضيف تجريبي (1-Click Demo)</span>
                  <span className="auth-guest-desc">استكشف المولد، الحاسبة، والشهادات فوراً بدون بريد</span>
                </div>
              </div>
              <ArrowRight size={16} className="auth-guest-arrow" />
            </button>

            {/* Social Google Login Button */}
            <button
              type="button"
              className="auth-social-google-btn"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <Loader2 size={16} className="spin-animate" />
              ) : (
                <svg className="google-svg-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              )}
              <span>متابعة بواسطة حساب Google</span>
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>أو عبر البريد الإلكتروني</span>
            </div>
          </div>
        )}

        {/* Main Interactive Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name for Signup */}
          {mode === 'signup' && (
            <div className="auth-input-group">
              <label htmlFor="auth-fullName">الاسم الكامل / الصفة المهنية</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-field-icon" />
                <input
                  id="auth-fullName"
                  type="text"
                  placeholder="مثال: م. أحمد عبد العزيز"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="auth-input-group">
            <label htmlFor="auth-email">البريد الإلكتروني المعتمد</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-field-icon" />
              <input
                id="auth-email"
                type="email"
                required
                dir="ltr"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {email.length > 3 && !isValidEmail(email) && (
              <span className="auth-field-hint error">صيغة البريد الإلكتروني غير مكتملة</span>
            )}
          </div>

          {/* Password (for Signin & Signup) */}
          {mode !== 'forgot' && (
            <div className="auth-input-group">
              <div className="auth-input-label-row">
                <label htmlFor="auth-password">كلمة المرور</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchMode('forgot')}
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-field-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Real-time Password Strength Meter on Signup */}
              {mode === 'signup' && password.length > 0 && (
                <div className="auth-password-strength-container">
                  <div className="auth-strength-bar-bg">
                    <div 
                      className="auth-strength-bar-fill" 
                      style={{ 
                        width: `${passwordStrength.score}%`,
                        backgroundColor: passwordStrength.color 
                      }}
                    />
                  </div>
                  <div className="auth-strength-info">
                    <span className="auth-strength-text" style={{ color: passwordStrength.color }}>
                      قوة كلمة المرور: {passwordStrength.label}
                    </span>
                    <span className="auth-strength-hint">
                      {password.length < 8 ? 'يُفضل 8 خانات فأكثر' : 'طول مناسب ومحمي'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password for Signup */}
          {mode === 'signup' && (
            <div className="auth-input-group">
              <label htmlFor="auth-confirmPassword">تأكيد كلمة المرور</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-field-icon" />
                <input
                  id="auth-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <div className={`auth-match-indicator ${password === confirmPassword ? 'matched' : 'mismatched'}`}>
                  {password === confirmPassword ? (
                    <>
                      <Check size={14} />
                      <span>كلمتا المرور متطابقتان تماماً</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} />
                      <span>كلمتا المرور غير متطابقتين بعد</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Remember me & Security Guarantee */}
          {mode !== 'forgot' && (
            <div className="auth-options-row">
              <label className="auth-remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="auth-custom-checkbox"></span>
                <span>تذكر تسجيل دخولي على هذا الجهاز</span>
              </label>

              <div className="auth-encryption-pill" title="اتصال مشفر 256-bit SSL عبر Supabase Auth">
                <ShieldCheck size={14} />
                <span>جلسة مشفرة</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading || googleLoading || guestLoading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animate" />
                <span>جاري التحقق والاتصال...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <LogIn size={18} />
                <span>تسجيل الدخول للمنصة</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus size={18} />
                <span>إنشاء الحساب وتفعيل المزامنة</span>
              </>
            ) : (
              <>
                <KeyRound size={18} />
                <span>إرسال رابط إعادة التعيين</span>
              </>
            )}
          </button>
        </form>

        {/* Footer / Switch links */}
        <div className="auth-modal-footer">
          {mode === 'forgot' ? (
            <button
              type="button"
              className="auth-link-btn center"
              onClick={() => switchMode('signin')}
            >
              العودة إلى تسجيل الدخول
            </button>
          ) : (
            <p>
              {mode === 'signin' ? (
                <>
                  ليس لديك حساب حتى الآن؟{' '}
                  <button
                    type="button"
                    className="auth-link-btn inline"
                    onClick={() => switchMode('signup')}
                  >
                    إنشاء حساب بيئي مجاني
                  </button>
                </>
              ) : (
                <>
                  لديك حساب بالفعل؟{' '}
                  <button
                    type="button"
                    className="auth-link-btn inline"
                    onClick={() => switchMode('signin')}
                  >
                    تسجيل الدخول الآن
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
