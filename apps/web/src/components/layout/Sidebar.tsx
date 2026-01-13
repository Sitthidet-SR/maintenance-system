'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  LogOut,
  Wrench,
  ChevronRight,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();
  const router = useRouter();

  const navigation = [
    { name: t.sidebar.dashboard, href: '/dashboard', icon: LayoutDashboard, roles: [] },
    { name: t.sidebar.tickets, href: '/tickets', icon: Ticket, roles: [] },
    { name: t.sidebar.users, href: '/users', icon: Users, roles: ['ADMIN'] },
    { name: t.sidebar.settings, href: '/settings', icon: Settings, roles: [] },
  ];

  const filteredNavItems = navigation.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return user && item.roles.includes(user.role);
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-72 backdrop-blur-xl bg-white/60 dark:bg-slate-950/60 border-r border-slate-200/50 dark:border-slate-800/50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col">
      {/* Logo Area */}
      <div className="flex items-center h-20 px-8 border-b border-slate-200/30 dark:border-slate-800/30">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-primary to-violet-500 text-white shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              Maintenance
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
              System v1.0
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-8 px-4">
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-12 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-primary")} />
                  <span className="font-medium text-[15px]">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-3 h-2 w-2 rounded-full bg-white/40 ring-4 ring-white/10" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile - Bottom */}
      <div className="p-4 border-t border-slate-200/30 dark:border-slate-800/30 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-sm group-hover:border-primary/20 transition-colors">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                    {user?.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full text-left">
                    {user?.email}
                  </span>
                </div>
                <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
             <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/settings">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t.sidebar.profile}</span>
                </Link>
               </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t.sidebar.logout}</span>
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
