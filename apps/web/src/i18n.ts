import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from cookie first, then from request
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  let locale = cookieLocale || (await requestLocale) || 'en';
  
  // Map 'pt' to 'pt-BR' for file lookup, but keep locale as 'pt'
  const localeFile = locale === 'pt' ? 'pt-BR' : locale;
  
  return {
    locale,
    messages: (await import(`../messages/${localeFile}.json`)).default,
  };
});
