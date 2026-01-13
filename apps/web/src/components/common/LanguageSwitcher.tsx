'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg border border-border/40">
      <Button
        variant={locale === 'th' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 px-2 text-xs font-medium"
        onClick={() => setLocale('th')}
      >
        🇹🇭 TH
      </Button>
      <Button
        variant={locale === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 px-2 text-xs font-medium"
        onClick={() => setLocale('en')}
      >
        🇬🇧 EN
      </Button>
    </div>
  );
}
