import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const COLORS = {
    success: { bg: '#F0FDF4', border: '#86EFAC', color: '#166534', icon: '✓' },
    error:   { bg: '#FFF1F2', border: '#FDA4AF', color: '#9F1239', icon: '✕' },
    info:    { bg: '#EFF6FF', border: '#93C5FD', color: '#1E40AF', icon: 'ℹ' },
    warning: { bg: '#FFFBEB', border: '#FCD34D', color: '#92400E', icon: '⚠' },
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.625rem',
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => {
          const s = COLORS[toast.type] || COLORS.success;
          return (
            <div
              key={toast.id}
              className="fade-in"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1.125rem',
                background: s.bg, border: `1px solid ${s.border}`,
                borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                color: s.color, fontWeight: 600, fontSize: '0.9rem',
                maxWidth: '360px', pointerEvents: 'all', cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onClick={() => removeToast(toast.id)}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{s.icon}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.addToast;
};

export default ToastContext;
