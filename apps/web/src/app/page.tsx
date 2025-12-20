'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Header from '@/components/Header';
import { BrainIcon, EditIcon, CheckCircleIcon } from '@/components/icons';

export default function Home() {
  const t = useTranslations('home');

  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section - Com vídeo de fundo */}
        <section className="relative overflow-hidden min-h-screen flex items-end">
          {/* Vídeo de fundo - 16:9 HD */}
          <div className="absolute inset-0 w-full h-full z-0 bg-black">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full"
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center center',
                width: '100%',
                height: '100%'
              }}
            >
              <source src="/logo-video.mp4" type="video/mp4" />
            </video>
          </div>
          
          {/* Overlay sutil para legibilidade do texto */}
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          
          {/* Overlay para esconder marca d'água "Veo" no canto inferior esquerdo */}
          <div className="absolute bottom-0 left-0 w-32 h-16 bg-black/40 backdrop-blur-sm z-10"></div>
          
          {/* Conteúdo sobre o vídeo */}
          <div className="relative z-20 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full pb-20 sm:pb-24 lg:pb-32">
            <div className="text-center">
              <h1 className="mx-auto max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-tight whitespace-pre-line drop-shadow-lg">
                {t('hero.title')}
              </h1>
              
              <p className="mx-auto mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg leading-relaxed text-white/90 drop-shadow-md">
                {t('hero.description')}
              </p>
              
              <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link
                  href="/editor"
                  className="w-full sm:w-auto rounded-md bg-white px-6 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 transition shadow-lg"
                >
                  {t('hero.startWriting')}
                </Link>
                <Link
                  href="/journal"
                  className="w-full sm:w-auto inline-flex items-center justify-center text-sm font-medium text-white hover:text-white/80 transition border border-white/50 rounded-md px-6 py-2.5 backdrop-blur-sm"
                >
                  {t('hero.viewJournal')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - As Três Camadas do PRD */}
        <section id="features" className="border-b border-gray-200 bg-white py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 text-left">
                {t('features.label')}
              </h2>
              <p className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-gray-900 sm:text-4xl text-left">
                {t('features.title')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Layer 01 - Intuição Declarada */}
              <div className="group border border-gray-200 bg-white p-6 sm:p-8 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                <div className="mb-4">
                  <div className="flex h-12 w-12 items-center justify-center text-gray-900">
                    <BrainIcon className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {t('features.layer01.label')}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">
                  {t('features.layer01.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('features.layer01.description')}
                </p>
              </div>

              {/* Layer 02 - Mediação Linguística Assistida */}
              <div className="group border border-gray-200 bg-white p-6 sm:p-8 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                <div className="mb-4">
                  <div className="flex h-12 w-12 items-center justify-center text-gray-900">
                    <EditIcon className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {t('features.layer02.label')}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">
                  {t('features.layer02.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('features.layer02.description')}
                </p>
              </div>

              {/* Layer 03 - Monitoria de Coerência */}
              <div className="group border border-gray-200 bg-white p-6 sm:p-8 hover:border-gray-300 hover:shadow-sm transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="mb-4">
                  <div className="flex h-12 w-12 items-center justify-center text-gray-900">
                    <CheckCircleIcon className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {t('features.layer03.label')}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">
                  {t('features.layer03.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('features.layer03.description')}
                </p>
              </div>
            </div>

            {/* Princípios Éticos */}
            <div className="mt-16 sm:mt-24 max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {t('features.principles.label')}
                </h2>
                <p className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {t('features.principles.title')}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-gray-900" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">{t('features.principles.principle1')}</span>
                    {t('features.principles.principle1Detail')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-gray-900" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">{t('features.principles.principle2')}</span>
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-gray-900" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">{t('features.principles.principle3')}</span>
                    {t('features.principles.principle3Detail')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-gray-900" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">{t('features.principles.principle4')}</span>
                    {t('features.principles.principle4Detail')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Fluxo Funcional do Usuário (9 passos do PRD) */}
        <section className="border-b border-gray-200 bg-gray-50 py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 text-left">
                {t('flow.label')}
              </h2>
              <p className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-gray-900 sm:text-4xl text-left">
                {t('flow.title')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {/* Step 1 */}
              <div className="relative border-l-2 border-gray-900 pl-6 pb-8 md:pb-0">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  1
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-1">
                  {t('flow.step01.label')}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 font-display">{t('flow.step01.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('flow.step01.description')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative border-l-2 border-gray-900 pl-6 pb-8 md:pb-0">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  2
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-1">
                  {t('flow.step02.label')}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 font-display">{t('flow.step02.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('flow.step02.description')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative border-l-2 border-gray-900 pl-6 pb-8 md:pb-0">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  3
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-1">
                  {t('flow.step03.label')}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 font-display">{t('flow.step03.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('flow.step03.description')}
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative border-l-2 border-gray-900 pl-6 pb-8 md:pb-0">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  4
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-1">
                  {t('flow.step04.label')}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 font-display">{t('flow.step04.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('flow.step04.description')}
                </p>
              </div>

              {/* Step 5 */}
              <div className="relative border-l-2 border-gray-900 pl-6 pb-8 md:pb-0">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  5
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-1">
                  {t('flow.step05.label')}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 font-display">{t('flow.step05.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('flow.step05.description')}
                </p>
              </div>

              {/* Step 6 */}
              <div className="relative border-l-2 border-gray-900 pl-6 pb-8 md:pb-0">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  6
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-1">
                  {t('flow.step06.label')}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 font-display">{t('flow.step06.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('flow.step06.description')}
                </p>
              </div>

              {/* Step 7 */}
              <div className="relative border-l-2 border-gray-900 pl-6 pb-8 md:pb-0">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  7
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-1">
                  {t('flow.step07.label')}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 font-display">{t('flow.step07.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('flow.step07.description')}
                </p>
              </div>

              {/* Step 8 */}
              <div className="relative border-l-2 border-gray-900 pl-6 pb-8 md:pb-0">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  8
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-1">
                  {t('flow.step08.label')}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 font-display">{t('flow.step08.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('flow.step08.description')}
                </p>
              </div>

              {/* Step 9 */}
              <div className="relative border-l-2 border-gray-900 pl-6 pb-8 md:pb-0">
                <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  9
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 mt-1">
                  {t('flow.step09.label')}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 font-display">{t('flow.step09.title')}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {t('flow.step09.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Minimalista */}
        <footer className="bg-white py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <p className="text-sm text-gray-500 text-center sm:text-left">
                {t('footer.copyright')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                <a
                  href="https://github.com/deegalabs/aurora-scholar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-900 transition"
                >
                  {t('footer.github')}
                </a>
                <a
                  href="https://solana.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-900 transition"
                >
                  {t('footer.solana')}
                </a>
                <a
                  href="/docs"
                  className="text-sm text-gray-500 hover:text-gray-900 transition"
                >
                  {t('footer.documentation')}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
