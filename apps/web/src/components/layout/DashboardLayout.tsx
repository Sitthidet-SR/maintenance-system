'use client';

import { ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '@/components/ui/sonner';
import { initSocket, disconnectSocket } from '@/lib/socket';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  useEffect(() => {
    // Delay socket connection to avoid React Strict Mode / HMR remount issues
    const timer = setTimeout(() => {
      initSocket();
    }, 500);

    return () => {
      clearTimeout(timer);
      disconnectSocket();
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden md:pl-72 transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
