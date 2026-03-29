'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { RouteLoadingBar } from '@/components/RouteLoadingBar';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange={false}
      >
        <RouteLoadingBar />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(3,7,8,0.9)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(34,211,238,0.2)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22d3ee', secondary: '#000' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
