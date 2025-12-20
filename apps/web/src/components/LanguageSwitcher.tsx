'use client';

import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    // Force a full page reload to ensure locale change is applied
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-1 text-sm">
      <button
        onClick={() => switchLocale('en')}
        className={`font-medium transition ${
          locale === 'en' 
            ? 'text-white underline underline-offset-4' 
            : 'text-white/60 hover:text-white/80'
        }`}
      >
        EN
      </button>
      <span className="text-white/40">/</span>
      <button
        onClick={() => switchLocale('pt')}
        className={`font-medium transition ${
          locale === 'pt' 
            ? 'text-white underline underline-offset-4' 
            : 'text-white/60 hover:text-white/80'
        }`}
      >
        PT
      </button>
    </div>
  );
}


