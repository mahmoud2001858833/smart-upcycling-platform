import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Lightbulb, 
  ShieldCheck, 
  Wrench, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { sendChatMessageToAi } from '../utils/aiProjectEngine';

export default function InlineConsultationModal({
  isOpen,
  onClose,
  project,
  initialQuery = '',
  onOpenFullChat,
  geminiApiKey = ''
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize or reset when opened
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInput('');
      setIsLoading(false);
      return;
    }

    const defaultPrompt = initialQuery || (project 
      ? `أود استشارتك حول مشروع "${project.name || project.title}" المصنوع من (${typeof project.materials === 'string' ? project.materials : project.materials?.join?.(', ') || 'الخامات المستصلحة'}). كيف أنفذه بأعلى درجات المتانة والأمان وبأقل تكلفة؟`
      : 'كيف يمكنني تحسين استدامة مشروعي وإعادة تدوير خاماته بأمان؟');

    const initialUserMsg = { role: 'user', content: defaultPrompt };
    setMessages([initialUserMsg]);
    setIsLoading(true);

    // Call AI consultation immediately
    (async () => {
      try {
        const reply = await sendChatMessageToAi({
          question: defaultPrompt,
          conversationHistory: [initialUserMsg],
          projectContext: project,
          geminiApiKey
        });
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } catch (err) {
        console.error('Consultation error:', err);
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: 'حدث خطأ مؤقت في جلب الاستشارة. يرجى تجربة إعادة إرسال السؤال أو التحقق من الاتصال.' 
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    })();

    // ESC to close
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, initialQuery, project]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const newHistory = [...messages, { role: 'user', content: query }];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessageToAi({
        question: query,
        conversationHistory: newHistory,
        projectContext: project,
        geminiApiKey
      });
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Follow-up error:', err);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: 'نعتذر، تعذر الرد حالياً. يرجى إعادة المحاولة.' }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickPrompts = [
    'ما هي أفضل وسيلة لصق أو تثبيت متينة؟',
    'كيف أقص الخامة بأمان تام وبدون أدوات حادة؟',
    'ما هي خطوات مقاومة الرطوبة والعوامل الجوية؟',
    'كيف أحسب التكلفة التقريبية والوفر المالي؟'
  ];

  return (
    <div 
      className="fixed inset-0 z-[10050] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 10050 }}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/40 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  استشارة الخبير البيئي والهندسي (نفس الصفحة)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                  مباشر ومخصص
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate max-w-[280px] sm:max-w-md">
                {project ? `المشروع: ${project.name || project.title}` : 'استشارة تدوير فورية'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullChat && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullChat(messages[messages.length - 1]?.content || initialQuery);
                }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700"
                title="فتح في تبويب المحادثة الكاملة"
              >
                <span>المحادثة الكاملة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
              title="إغلاق الاستشارة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-950/60">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-xs font-black shadow-md mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div 
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                  msg.role === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-none ml-auto'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                {/* Message Content formatted with linebreaks and bold bullets */}
                <div className="space-y-2 whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {msg.role === 'assistant' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>موثق هندسياً وبيئياً</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, idx)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors py-0.5 px-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                      title="نسخ نص الاستشارة"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex-shrink-0 flex items-center justify-center text-xs font-black shadow-md mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-slate-500 text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/80 text-white flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>الخبير يحلل خصائص الخامات ومعايير التنفيذ الآمن...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Follow-up Chips */}
        <div className="p-2 sm:px-4 bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-400 font-bold px-1 whitespace-nowrap flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-emerald-600" />
            <span>أسئلة مقترحة:</span>
          </span>
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              type="button"
              disabled={isLoading}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب استفسارك للخبير هنا (مثلاً: ما بديل الغراء الساخن؟ كيف أضمن المتانة؟)..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50 active:scale-95 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>إرسال</span>
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
