'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArticleCard } from '@/components/journal/ArticleCard';
import { SearchFilter, type JournalFilters } from '@/components/journal/SearchFilter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useToast } from '@/components/ui/toast';
import { getAuthHeader } from '@/lib/auth/api';

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

type MyDbArticle = {
  id: string;
  title: string;
  contentHash: string;
  arweaveId: string | null;
  isPublic: boolean;
  status: string;
  createdAt: string;
  publishedAt: string | null;
};

function getApiBaseUrl() {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  if (envUrl) return envUrl;
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3001';
  return '';
}

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const { toast } = useToast();

  const [data, setData] = useState<ApiListResponse | null>(null);
  const [dbArticles, setDbArticles] = useState<MyDbArticle[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [viewerWallet, setViewerWallet] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<'24h' | '7d' | '30d' | 'unlimited'>('24h');
  const [grants, setGrants] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JournalFilters>({ query: '', author: '', sort: 'newest' });

  const selectedArticle = useMemo(
    () => dbArticles.find((a) => a.id === selectedArticleId) || null,
    [dbArticles, selectedArticleId]
  );

  async function copyPrivateLink() {
    if (!selectedArticleId) return;
    const url = `${window.location.origin}/private/${selectedArticleId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ type: 'success', title: 'Link', message: 'Link copiado.' });
    } catch {
      // Fallback
      const ok = window.prompt('Copie o link:', url);
      if (ok !== null) toast({ type: 'info', title: 'Link', message: 'Copie o link manualmente.' });
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        // Public/on-chain list (journal-style, best effort)
        const author = publicKey.toBase58();
        const url = `${getApiBaseUrl()}/api/articles?page=1&limit=200&author=${encodeURIComponent(author)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (res.ok) {
          const payload = json?.data as ApiListResponse;
          if (!cancelled) setData(payload);
        }

        // DB list (includes private) - requires auth header
        const mineRes = await fetch(`${getApiBaseUrl()}/api/articles/mine`, {
          headers: { ...getAuthHeader() },
        });
        const mineJson = await mineRes.json();
        if (!mineRes.ok) throw new Error(mineJson?.message || mineJson?.error || `HTTP ${mineRes.status}`);
        const items = (mineJson?.data?.items || []) as MyDbArticle[];
        if (!cancelled) {
          setDbArticles(items);
          if (!selectedArticleId && items[0]?.id) setSelectedArticleId(items[0].id);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Falha ao carregar seus artigos.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicKey, selectedArticleId]);

  async function refreshGrants(articleId: string) {
    if (!articleId) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/access-control/grants?articleId=${encodeURIComponent(articleId)}`, {
        headers: { ...getAuthHeader() },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
      setGrants(json?.data?.items || []);
    } catch (e: any) {
      toast({ type: 'error', title: 'Grants', message: e?.message || 'Falha ao carregar grants.' });
    }
  }

  useEffect(() => {
    refreshGrants(selectedArticleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArticleId]);

  async function handleCreateGrant() {
    if (!selectedArticleId) return toast({ type: 'error', title: 'Grants', message: 'Selecione um artigo.' });
    if (!viewerWallet.trim()) return toast({ type: 'error', title: 'Grants', message: 'Informe a wallet do viewer.' });
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/access-control/grants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ articleId: selectedArticleId, viewerWallet: viewerWallet.trim(), expiresIn }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
      toast({ type: 'success', title: 'Grants', message: 'Acesso concedido.' });
      setViewerWallet('');
      await refreshGrants(selectedArticleId);
    } catch (e: any) {
      toast({ type: 'error', title: 'Grants', message: e?.message || 'Falha ao conceder acesso.' });
    }
  }

  async function handleRevokeGrant(vw: string) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/access-control/grants/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ articleId: selectedArticleId, viewerWallet: vw }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
      toast({ type: 'success', title: 'Grants', message: 'Acesso revogado.' });
      await refreshGrants(selectedArticleId);
    } catch (e: any) {
      toast({ type: 'error', title: 'Grants', message: e?.message || 'Falha ao revogar.' });
    }
  }

  const items = data?.items || [];

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    let list = items.slice();
    if (q) {
      list = list.filter((i) => (i.title || '').toLowerCase().includes(q));
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
                <h1 className="text-sm font-semibold text-gray-900">Meu Dashboard</h1>
                <p className="text-xs text-gray-500">Seus artigos públicos (on-chain) e controles de privacidade</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/journal" className="text-sm text-gray-700 hover:text-gray-900">
                Journal
              </a>
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
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">Privado (controle de acesso)</div>
              <p className="mt-1 text-sm text-gray-600">
                Conceda acesso por wallet (24h/7d/30d/ilimitado) e revogue quando quiser.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Artigo</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {dbArticles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.isPublic ? 'public' : 'private'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duração</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value as any)}
                >
                  <option value="24h">24h</option>
                  <option value="7d">7 dias</option>
                  <option value="30d">30 dias</option>
                  <option value="unlimited">Ilimitado</option>
                </select>
              </div>
            </div>

            {selectedArticle && !selectedArticle.isPublic ? (
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-700">Link privado (viewer)</div>
                  <div className="mt-0.5 text-xs text-gray-600 font-mono truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/private/${selectedArticleId}` : `/private/${selectedArticleId}`}
                  </div>
                </div>
                <button
                  onClick={copyPrivateLink}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-white"
                >
                  Copiar
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Viewer wallet</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={viewerWallet}
                  onChange={(e) => setViewerWallet(e.target.value)}
                  placeholder="Base58 (ex: 4U8U3o...)"
                />
              </div>
              <button
                onClick={handleCreateGrant}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
              >
                Conceder
              </button>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">Acessos concedidos</div>
              {grants.length === 0 ? (
                <div className="text-sm text-gray-600">Nenhum grant para este artigo.</div>
              ) : (
                <div className="space-y-2">
                  {grants.map((g) => (
                    <div key={g.id} className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
                      <div className="text-sm text-gray-800">
                        <div className="font-mono text-xs">{g.viewerWallet}</div>
                        <div className="text-xs text-gray-500">
                          {g.revokedAt ? 'revogado' : g.expiresAt ? `expira: ${new Date(g.expiresAt).toLocaleString()}` : 'ilimitado'}
                        </div>
                      </div>
                      {!g.revokedAt ? (
                        <button
                          onClick={() => handleRevokeGrant(g.viewerWallet)}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Revogar
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <SearchFilter value={filters} onChange={setFilters} authors={[]} />

          {isLoading ? (
            <div className="text-sm text-gray-600">Carregando seus artigos…</div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-600">Nenhum artigo público encontrado para sua wallet.</div>
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
                  onVerify={() => toast({ type: 'info', title: 'Verificação', message: 'Verificação ainda é placeholder no backend.' })}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


