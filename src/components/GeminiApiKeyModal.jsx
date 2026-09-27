import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Check, Trash2, ExternalLink, X, ShieldCheck, Zap } from 'lucide-react';
import { getStoredGeminiApiKey, setStoredGeminiApiKey } from '../utils/aiProjectEngine.js';

export default function GeminiApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredGeminiApiKey();
      setApiKey(stored || '');
      setIsSaved(Boolean(stored));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredGeminiApiKey(apiKey);
    setIsSaved(Boolean(apiKey.trim()));
    if (onKeySaved) {
      onKeySaved(apiKey.trim());
    }
    onClose();
  };

  const handleClear = () => {
    setStoredGeminiApiKey('');
    setApiKey('');
    setIsSaved(false);
    if (onKeySaved) {
      onKeySaved('');
    }
  };

  return (
    <div className="modal-backdrop-custom" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="modal-content-luminous max-w-xl w-full p-6 text-right" 
        onClick={e => e.stopPropagation()}
        dir="rtl"
        style={{ borderRadius: '24px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">محرك Google Gemini AI المباشر</h2>
              <p className="text-xs font-medium text-slate-500">توليد حي فوري غير مقيد لمشاريع إعادة التدوير</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="my-5 p-4 rounded-2xl border transition-all" style={{
          backgroundColor: isSaved ? '#f0fdf4' : '#f8fafc',
          borderColor: isSaved ? '#bbf7d0' : '#e2e8f0'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isSaved ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-sm font-bold text-slate-800">
                {isSaved ? '🟢 متصل بسحابة Google Gemini 1.5 Flash الحية' : '⚡ المحرك التوليدي الحي الفوري نشط (بدون مفتاح)'}
              </span>
            </div>
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> مفتاح معتمد
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {isSaved 
              ? 'يتم إرسال كافة طلبات توليد المشاريع واستشارات الخبير الذكي مباشرة إلى نموذج Gemini 1.5 Flash لابتكار مشاريع حية لكل طلب دون أي قوالب مسبقة.'
              : 'المنصة تستخدم محرك التوليد الحي الداخلي لابتكار مشاريع حصرية لكل طلب. يمكنك ربط مفتاحك المجاني من Google للوصول لقوة نموذج Gemini الكاملة مجاناً!'}
          </p>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block">
            مفتاح Gemini API (Google AI Studio Key):
          </label>
          <div className="relative">
            <input 
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pl-24 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              dir="ltr"
            />
            <div className="absolute left-2 top-2.5 flex items-center gap-1">
              <button 
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-xs font-semibold px-2 py-1 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
              >
                {showKey ? 'إخفاء' : 'إظهار'}
              </button>
            </div>
          </div>
        </div>

        {/* Free Link Tutorial */}
        <div className="mt-4 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600 shrink-0" />
            <span>احصل على مفتاحك مجاناً 100% وبدون بطاقة ائتمان من Google AI Studio:</span>
          </div>
          <a 
            href="https://aistudio.google.com/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline shrink-0 mr-2"
          >
            <span>الحصول على مفتاح</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {isSaved && (
            <button 
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>إزالة المفتاح</span>
            </button>
          )}
          <div className="flex items-center gap-2 mr-auto">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
            >
              إلغاء
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>تفعيل وحفظ المفتاح</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
