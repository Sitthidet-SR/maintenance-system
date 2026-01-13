import { ReactNode } from 'react';
import { Wrench } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-br from-slate-50 via-white to-violet-50 dark:from-background dark:via-background dark:to-muted/20 p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/20 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      
      {/* Branding - floating above */}
      <div className="mb-8 flex items-center gap-2 z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Wrench className="h-6 w-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-violet-600 bg-clip-text text-transparent">
          Maintenance System
        </span>
      </div>

      {children}
    </div>
  );
}
