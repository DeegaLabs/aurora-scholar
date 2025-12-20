'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslations } from 'next-intl';
import { ArticleCard } from '@/components/journal/ArticleCard';
import { ArticleViewModal } from '@/components/journal/ArticleViewModal';
import { SearchFilter, type JournalFilters } from '@/components/journal/SearchFilter';
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { SettingsButton } from '@/components/editor/SettingsButton';
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

import { getApiBaseUrl } from '@/lib/api/baseUrl';

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const t = useTranslations('dashboard');
  const tEditor = useTranslations('editor');

  const [data, setData] = useState<ApiListResponse | null>(null);
  const [dbArticles, setDbArticles] = useState<MyDbArticle[]>([]);
  const [accessModalArticle, setAccessModalArticle] = useState<MyDbArticle | null>(null);
  const [viewerWallet, setViewerWallet] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<'24h' | '7d' | '30d' | 'unlimited'>('24h');
  const [grants, setGrants] = useState<Array<any>>([]);
  const [isGrantBusy, setIsGrantBusy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JournalFilters>({ query: '', author: '', sort: 'newest' });
  const [viewingArticle, setViewingArticle] = useState<typeof filtered[0] | null>(null);

  async function copyPrivateLink(articleId: string) {
    if (!articleId) return;
    const url = `${window.location.origin}/private/${articleId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ type: 'success', title: t('accessModal.privateLink'), message: t('linkCopied') });
    } catch {
      // Fallback
      const ok = window.prompt(`${t('accessModal.copy')}:`, url);
      if (ok !== null) toast({ type: 'info', title: t('accessModal.privateLink'), message: t('copyLinkManually') });
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
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || t('loadError'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

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
      toast({ type: 'error', title: t('grants.title'), message: e?.message || t('grants.loadError') });
    }
  }

  useEffect(() => {
    if (!accessModalArticle?.id) return;
    refreshGrants(accessModalArticle.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessModalArticle?.id]);

  async function handleCreateGrant(articleId: string) {
    if (!articleId) return toast({ type: 'error', title: t('grants.title'), message: t('grants.invalidArticle') });
    if (!viewerWallet.trim()) return toast({ type: 'error', title: t('grants.title'), message: t('grants.viewerWalletRequired') });
    try {
      setIsGrantBusy(true);
      const res = await fetch(`${getApiBaseUrl()}/api/access-control/grants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ articleId, viewerWallet: viewerWallet.trim(), expiresIn }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
      toast({ type: 'success', title: t('grants.title'), message: t('grants.granted') });
      setViewerWallet('');
      await refreshGrants(articleId);
    } catch (e: any) {
      toast({ type: 'error', title: t('grants.title'), message: e?.message || t('grants.grantError') });
    } finally {
      setIsGrantBusy(false);
    }
  }

  async function handleRevokeGrant(articleId: string, vw: string) {
    try {
      setIsGrantBusy(true);
      const res = await fetch(`${getApiBaseUrl()}/api/access-control/grants/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ articleId, viewerWallet: vw }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
      toast({ type: 'success', title: t('grants.title'), message: t('grants.revoked') });
      await refreshGrants(articleId);
    } catch (e: any) {
      toast({ type: 'error', title: t('grants.title'), message: e?.message || t('grants.revokeError') });
    } finally {
      setIsGrantBusy(false);
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

  const myPrivateArticles = useMemo(() => dbArticles.filter((a) => !a.isPublic), [dbArticles]);

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
                href="/journal"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
              >
                {tEditor('journal')}
              </Link>
              <SettingsButton />
              <WalletInfo />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {myPrivateArticles.length > 0 ? (
            <div className="space-y-3">
              {myPrivateArticles.map((a) => (
                <div key={a.id} className="border border-gray-200 rounded-lg bg-white p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{a.title || 'Untitled'}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span>{t('status')}: {a.status}</span>
                        <span>{t('created')}: {new Date(a.createdAt).toLocaleDateString()}</span>
                        <span className="font-mono">
                          {t('id')}: {a.id.slice(0, 6)}…{a.id.slice(-6)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`/private/${a.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-white"
                        title={t('openAsViewer')}
                      >
                        {t('open')}
                      </a>
                      <button
                        onClick={() => {
                          setAccessModalArticle(a);
                          setViewerWallet('');
                          setExpiresIn('24h');
                          setGrants([]);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
                      >
                        {t('manageAccess')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <SearchFilter value={filters} onChange={setFilters} authors={[]} />

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
                  onVerify={() => toast({ type: 'info', title: t('verification.title'), message: t('verification.placeholder') })}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {accessModalArticle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 truncate">{t('accessModal.title')}</h2>
                <p className="mt-1 text-xs text-gray-600 truncate">{accessModalArticle.title || 'Untitled'}</p>
              </div>
              <button
                onClick={() => setAccessModalArticle(null)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('accessModal.close')}
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-700">{t('accessModal.privateLink')}</div>
                  <div className="mt-0.5 text-xs text-gray-600 font-mono truncate">
                    {typeof window !== 'undefined'
                      ? `${window.location.origin}/private/${accessModalArticle.id}`
                      : `/private/${accessModalArticle.id}`}
                  </div>
                </div>
                <button
                  onClick={() => copyPrivateLink(accessModalArticle.id)}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-white"
                >
                  {t('accessModal.copy')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('accessModal.viewerWallet')}</label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={viewerWallet}
                    onChange={(e) => setViewerWallet(e.target.value)}
                    placeholder={t('accessModal.viewerWalletPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('accessModal.duration')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value as any)}
                  >
                    <option value="24h">24h</option>
                    <option value="7d">{t('accessModal.duration7d')}</option>
                    <option value="30d">{t('accessModal.duration30d')}</option>
                    <option value="unlimited">{t('accessModal.durationUnlimited')}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => refreshGrants(accessModalArticle.id)}
                  className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isGrantBusy}
                >
                  {t('accessModal.refresh')}
                </button>
                <button
                  onClick={() => handleCreateGrant(accessModalArticle.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGrantBusy}
                >
                  {t('accessModal.grant')}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs font-semibold text-gray-700 mb-2">{t('accessModal.grantedAccess')}</div>
                {grants.length === 0 ? (
                  <div className="text-sm text-gray-600">{t('accessModal.noGrants')}</div>
                ) : (
                  <div className="space-y-2">
                    {grants.map((g) => (
                      <div key={g.id} className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
                        <div className="text-sm text-gray-800">
                          <div className="font-mono text-xs">{g.viewerWallet}</div>
                          <div className="text-xs text-gray-500">
                            {g.revokedAt
                              ? t('accessModal.revoked')
                              : g.expiresAt
                                ? `${t('accessModal.expires')}: ${new Date(g.expiresAt).toLocaleString()}`
                                : t('accessModal.unlimited')}
                          </div>
                        </div>
                        {!g.revokedAt ? (
                          <button
                            onClick={() => handleRevokeGrant(accessModalArticle.id, g.viewerWallet)}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isGrantBusy}
                          >
                            {t('accessModal.revoke')}
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Article View Modal */}
      {viewingArticle && (
        <ArticleViewModal
          isOpen={!!viewingArticle}
          onClose={() => setViewingArticle(null)}
          arweaveId={viewingArticle.arweaveId}
          title={viewingArticle.title}
          author={viewingArticle.author}
          timestamp={viewingArticle.timestamp}
          contentHash={viewingArticle.contentHash}
          onVerify={() => toast({ type: 'info', title: t('verification.title'), message: t('verification.placeholder') })}
        />
      )}
    </div>
  );
}


