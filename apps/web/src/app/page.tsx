'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Home() {
  const t = useTranslations();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="aurora-gradient absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {t('common.appName')}
            </h1>
            <p className="mt-4 text-xl text-aurora">
              {t('common.tagline')}
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              {t('home.hero.subtitle')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/editor"
                className="rounded-md bg-aurora px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-aurora-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurora"
              >
                {t('home.hero.cta')}
              </Link>
              <Link
                href="/journal"
                className="text-lg font-semibold leading-6 text-gray-900 hover:text-aurora"
              >
                {t('home.hero.viewJournal')} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('home.features.title')}
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* AI Feature */}
            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 text-4xl">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('home.features.ai.title')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('home.features.ai.description')}
              </p>
            </div>

            {/* Blockchain Feature */}
            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 text-4xl">⛓️</div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('home.features.blockchain.title')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('home.features.blockchain.description')}
              </p>
            </div>

            {/* Storage Feature */}
            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 text-4xl">💾</div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('home.features.storage.title')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('home.features.storage.description')}
              </p>
            </div>

            {/* Privacy Feature */}
            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 text-4xl">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('home.features.privacy.title')}
              </h3>
              <p className="mt-2 text-gray-600">
                {t('home.features.privacy.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              © 2024 Aurora Scholar. Built on Solana.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                GitHub
              </a>
              <a
                href="https://solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                Solana
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
