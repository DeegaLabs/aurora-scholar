'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SearchFilter, type JournalFilters } from '@/components/journal/SearchFilter';
import { ArticleCard } from '@/components/journal/ArticleCard';
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { SettingsButton } from '@/components/editor/SettingsButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/components/ui/toast';

type ApiListResponse = {
  items: Array<{
    title: string;
    author: string;
    timestamp: number;
    contentHash: string;
    arweaveId: string;
    aiScope?: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

import { getApiBaseUrl } from '@/lib/api/baseUrl';

export default function JournalPage() {
  const { connected } = useWallet();
  const { toast } = useToast();
  const t = useTranslations('journal');
  const tEditor = useTranslations('editor');
  const [data, setData] = useState<ApiListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JournalFilters>({ query: '', author: '', sort: 'newest' });

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const url = `${getApiBaseUrl()}/api/articles?page=1&limit=100`;
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
        const payload = json?.data as ApiListResponse;
        if (!cancelled) setData(payload);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || t('loadError'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const items = data?.items || [];

  const authors = useMemo(() => items.map((i) => i.author), [items]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    let list = items.slice();

    if (filters.author) {
      list = list.filter((i) => i.author === filters.author);
    }

    if (q) {
      list = list.filter((i) => {
        return (i.title || '').toLowerCase().includes(q) || (i.author || '').toLowerCase().includes(q);
      });
    }

    list.sort((a, b) => (filters.sort === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
    return list;
  }, [items, filters]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/logo-mini.png"
                  alt="Aurora Scholar"
                  width={32}
                  height={32}
                  className="object-contain cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">{t('title')}</h1>
                <p className="text-xs text-gray-500">{t('subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link
                href="/editor"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
              >
                {tEditor('title')}
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
              >
                {tEditor('dashboard')}
              </Link>
              <SettingsButton />
              <WalletInfo />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <SearchFilter value={filters} onChange={setFilters} authors={authors} />

          {isLoading ? (
            <div className="text-sm text-gray-600">{t('loading')}</div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-600">{t('noPublicArticles')}</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => (
                <ArticleCard
                  key={`${a.author}:${a.contentHash}`}
                  title={a.title}
                  author={a.author}
                  timestamp={a.timestamp}
                  contentHash={a.contentHash}
                  arweaveId={a.arweaveId}
                  onVerify={async () => {
                    try {
                      const res = await fetch(`${getApiBaseUrl()}/api/articles/${encodeURIComponent(a.arweaveId)}/verify`, {
                        method: 'POST',
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
                      const verified = Boolean(json?.data?.verified);
                      toast({
                        type: verified ? 'success' : 'error',
                        title: verified ? t('verified') : t('notVerified'),
                        message: String(json?.data?.message || (verified ? t('verification.ok') : t('verification.failed'))),
                        durationMs: 8000,
                      });
                    } catch (e: any) {
                      toast({
                        type: 'error',
                        title: t('verification.title'),
                        message: e?.message || t('verification.verifyError'),
                        durationMs: 8000,
                      });
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



