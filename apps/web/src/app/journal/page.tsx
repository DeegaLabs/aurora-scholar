'use client';

import { useEffect, useMemo, useState } from 'react';
import { SearchFilter, type JournalFilters } from '@/components/journal/SearchFilter';
import { ArticleCard } from '@/components/journal/ArticleCard';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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

function getApiBaseUrl() {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  if (envUrl) return envUrl;

  // Dev fallback: API usually runs on 3001; avoid calling the Next server (e.g. 3002).
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3001';

  // Prod fallback: assume same-origin (e.g. behind a reverse proxy)
  return '';
}

export default function JournalPage() {
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
        if (!cancelled) setError(e?.message || 'Falha ao carregar artigos.');
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
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700">AS</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">On-Chain Journal</h1>
                <p className="text-xs text-gray-500">Artigos públicos publicados no Solana + Arweave</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/editor" className="text-sm text-gray-700 hover:text-gray-900">
                Editor
              </a>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <SearchFilter value={filters} onChange={setFilters} authors={authors} />

          {isLoading ? (
            <div className="text-sm text-gray-600">Carregando artigos…</div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-600">Nenhum artigo público encontrado.</div>
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
                  onVerify={() => alert('Verificação ainda é placeholder no backend.')}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



