'use client';

import { useLocale } from 'next-intl';

export default function Header() {
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    // Force a full page reload to ensure locale change is applied
    window.location.reload();
  };

  return (
    <header className="fixed top-0 right-0 z-50 p-6">
      <div className="flex items-center space-x-2 text-sm">
        <button
          onClick={() => switchLocale('en')}
          className={`font-medium transition ${
            locale === 'en' 
              ? 'text-gray-900 underline underline-offset-4' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          EN
        </button>
        <span className="text-gray-300">/</span>
        <button
          onClick={() => switchLocale('pt')}
          className={`font-medium transition ${
            locale === 'pt' 
              ? 'text-gray-900 underline underline-offset-4' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          PT
        </button>
      </div>
    </header>
  );
}
