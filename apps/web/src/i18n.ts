import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  try {
    // Try to get locale from cookie first, then from request
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
    let locale = cookieLocale || (await requestLocale) || 'en';
    
    // Map 'pt' to 'pt-BR' for file lookup, but keep locale as 'pt'
    const localeFile = locale === 'pt' ? 'pt-BR' : (locale === 'en' ? 'en' : 'en');
    
    // Ensure we have a valid locale
    if (!['en', 'pt', 'pt-BR'].includes(locale)) {
      locale = 'en';
    }
    
    const messages = (await import(`../messages/${localeFile}.json`)).default;
    
    return {
      locale,
      messages,
    };
  } catch (error) {
    console.error('Error loading i18n config:', error);
    // Fallback to English
    const messages = (await import(`../messages/en.json`)).default;
    return {
      locale: 'en',
      messages,
    };
  }
});
