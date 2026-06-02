'use client';

import { ThemeProvider } from './theme-context';
import { ToastProvider } from './toast-context';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
