import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { SolanaWalletProvider } from '@/components/wallet/SolanaWalletProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '600', '700'],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Aurora Scholar - Ethical Academic Writing',
  description:
    'Monitoria Assistida de Escrita Acadêmica Ética. IA que organiza, traduz e audita coerência - nunca escreve por você.',
  keywords: ['blockchain', 'solana', 'academic', 'publishing', 'AI', 'arweave', 'ethical writing'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locale = 'en';
  let messages = {};
  
  try {
    locale = await getLocale();
    messages = await getMessages();
  } catch (error) {
    console.error('Error loading locale/messages:', error);
    // Fallback to English
    messages = (await import('../../messages/en.json')).default;
  }

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <SolanaWalletProvider>{children}</SolanaWalletProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
