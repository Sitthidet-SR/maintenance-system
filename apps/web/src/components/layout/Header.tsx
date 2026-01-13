'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/stores';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from './MobileSidebar';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 bg-background/60 backdrop-blur-xl px-6 transition-all duration-200">
      {/* Left side: Mobile menu */}
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden -ml-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r border-border/40 bg-background/80 backdrop-blur-xl">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 w-full max-w-md">
        <div className="relative group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <Input
            type="search"
            placeholder={t.header.searchPlaceholder}
            className="pl-10 h-10 rounded-full border-border/40 bg-muted/50 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 w-full"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        <LanguageSwitcher />
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-muted/60 hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                </span>
              )}
              <span className="sr-only">{t.header.notifications}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl border-border/40 shadow-xl bg-card/95 backdrop-blur-sm">
            <DropdownMenuLabel className="flex items-center justify-between p-4 pb-2">
              <span className="font-semibold">{t.header.notifications}</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs text-primary hover:text-primary/80"
                  onClick={markAllAsRead}
                >
                  {t.header.markAllRead}
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <ScrollArea className="h-[350px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-2">
                   <Bell className="h-8 w-8 opacity-20" />
                   <p className="text-sm">{t.header.noNotifications}</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer mx-1 my-1 rounded-lg transition-colors ${
                      !notification.read ? 'bg-primary/5' : 'hover:bg-muted/40'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className={`text-sm ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
