'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useTheme } from './theme-context';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const getBg = (type: ToastType) => {
    if (isLight) {
      if (type === 'error') return 'rgba(220,38,38,0.08)';
      if (type === 'success') return 'rgba(22,163,74,0.1)';
      return 'rgba(255,255,255,0.92)';
    }
    if (type === 'error') return 'rgba(220,38,38,0.12)';
    if (type === 'success') return 'rgba(22,163,74,0.12)';
    return 'rgba(26,26,26,0.88)';
  };

  const getBorder = (type: ToastType) => {
    if (isLight) {
      if (type === 'error') return '1px solid rgba(220,38,38,0.18)';
      if (type === 'success') return '1px solid rgba(22,163,74,0.2)';
      return '1px solid rgba(180,150,100,0.2)';
    }
    if (type === 'error') return '1px solid rgba(220,38,38,0.25)';
    if (type === 'success') return '1px solid rgba(22,163,74,0.25)';
    return '1px solid rgba(255,255,255,0.08)';
  };

  const getColor = (type: ToastType) => {
    if (isLight) {
      if (type === 'error') return '#991b1b';
      if (type === 'success') return '#166534';
      return '#2c2418';
    }
    if (type === 'error') return '#f87171';
    if (type === 'success') return '#4ade80';
    return '#f5f0eb';
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-xl animate-slide-up"
            style={{
              background: getBg(t.type),
              border: getBorder(t.type),
              color: getColor(t.type),
            }}
          >
            {t.type === 'success' && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t.type === 'error' && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {t.type === 'info' && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
