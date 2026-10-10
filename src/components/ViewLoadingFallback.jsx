import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function ViewLoadingFallback({ message = 'جاري تحميل القسم...' }) {
  return (
    <div 
      className="view-loading-fallback-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '340px',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        direction: 'rtl'
      }}
    >
      <div 
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: '3px solid rgba(16, 185, 129, 0.15)',
          borderTopColor: 'var(--emerald-primary, #059669)',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem'
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#065f46', fontWeight: 700, fontSize: '0.95rem' }}>
        <Sparkles size={16} />
        <span>{message}</span>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem', marginBotttom: 0 }}>
        منظومة مُدام الذكية • تحميل معياري سريع
      </p>
    </div>
  );
}
