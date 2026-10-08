import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in Mudam platform:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          dir="rtl" 
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d1b17 0%, #162a24 100%)',
            color: '#ffffff',
            padding: '2rem',
            fontFamily: 'Cairo, sans-serif'
          }}
        >
          <div 
            style={{
              maxWidth: '560px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '2.5rem',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}
            >
              <AlertCircle size={32} />
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              حدث خطأ أثناء تحميل الواجهة
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              واجه المتصفح صعوبة في معالجة إحدى البيانات المحفوظة محلياً أو أحد المكونات. يمكنك إعادة تحميل الصفحة أو إعادة التعيين.
            </p>

            {this.state.error && (
              <pre 
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.8rem',
                  color: '#f87171',
                  textAlign: 'left',
                  direction: 'ltr',
                  overflowX: 'auto',
                  maxHeight: '120px',
                  marginBottom: '1.75rem'
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  background: '#10b981',
                  color: '#ffffff',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <RotateCcw size={16} />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                مسح البيانات المؤقتة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
