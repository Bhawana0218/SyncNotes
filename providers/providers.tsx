'use client';

import React, { useEffect, useState } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR, only wrap with SessionProvider
  if (!isMounted) {
    return (
      <NextAuthSessionProvider>
        {children}
      </NextAuthSessionProvider>
    );
  }

  // After hydration, wrap with both providers
  return (
    <NextAuthSessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        storageKey="theme"
        forcedTheme={undefined}
      >
        {children}
      </NextThemesProvider>
    </NextAuthSessionProvider>
  );
}
