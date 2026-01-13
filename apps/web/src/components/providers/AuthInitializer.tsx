'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const initialized = useRef(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    // Small delay to ensure zustand persist has hydrated
    const timeout = setTimeout(() => {
      setHasHydrated(true);
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (hasHydrated && !initialized.current) {
      initialized.current = true;
      checkAuth();
    }
  }, [hasHydrated, checkAuth]);

  useEffect(() => {
    // Only redirect after hydration and loading is complete
    if (!hasHydrated || isLoading) return;

    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/login');
    }
    
    // Redirect authenticated users away from public routes
    if (isAuthenticated && PUBLIC_ROUTES.includes(pathname)) {
      router.push('/dashboard');
    }
  }, [hasHydrated, isLoading, isAuthenticated, pathname, router]);

  // Show loading spinner while hydrating or checking auth on protected routes
  if ((!hasHydrated || isLoading) && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground animate-pulse">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
