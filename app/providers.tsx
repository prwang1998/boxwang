'use client';

import { ThemeProvider } from './theme-context';
import { ToastProvider } from './toast-context';
import VisualEffects from './visual-effects';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <VisualEffects />
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
