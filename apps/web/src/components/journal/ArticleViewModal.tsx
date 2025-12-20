'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getApiBaseUrl } from '@/lib/api/baseUrl';

interface ArticleViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  arweaveId: string;
  title: string;
  author: string;
  timestamp: number;
  contentHash: string;
  onVerify?: () => void;
}

interface ArticleContent {
  title: string;
  content: string;
  declaredIntuition: string;
  author: string;
  aiScope: string;
  timestamp: number | null;
  contentHash: string | null;
  intuitionHash: string | null;
}

function formatDate(ts: number | null) {
  if (!ts) return '';
  const d = new Date(ts * 1000); // on-chain timestamp in seconds
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function short(s: string, n = 8) {
  if (!s) return '';
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}

export function ArticleViewModal({
  isOpen,
  onClose,
  arweaveId,
  title: initialTitle,
  author,
  timestamp: initialTimestamp,
  contentHash: initialContentHash,
  onVerify,
}: ArticleViewModalProps) {
  const t = useTranslations('article.view');
  const [content, setContent] = useState<ArticleContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isOpen || !arweaveId) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/articles/${encodeURIComponent(arweaveId)}/content`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
        if (!cancelled) {
          setContent(json?.data || null);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || t('loadError'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, arweaveId, retryCount]);

  const handleDownload = () => {
    if (!content) return;
    const data = {
      title: content.title,
      content: content.content,
      declaredIntuition: content.declaredIntuition,
      author: content.author,
      aiScope: content.aiScope,
      timestamp: content.timestamp,
      contentHash: content.contentHash,
      intuitionHash: content.intuitionHash,
      arweaveId,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title || 'article'}-${arweaveId.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const displayTitle = content?.title || initialTitle;
  const displayTimestamp = content?.timestamp || initialTimestamp;
  const displayContentHash = content?.contentHash || initialContentHash;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">{t('loading')}</p>
            </div>
          ) : error ? (
            <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 rounded-lg px-4 py-3 text-sm space-y-3">
              <div>
                <p className="font-medium mb-1">{t('processingTitle')}</p>
                <p className="text-xs text-yellow-700">
                  {t('processingNote')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => {
                    setRetryCount((prev) => prev + 1);
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('retry')}
                </button>
                <a
                  href={`https://viewblock.io/arweave/tx/${arweaveId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-yellow-800 border border-yellow-300 rounded-md hover:bg-yellow-100"
                >
                  {t('checkStatus')}
                </a>
                <a
                  href={`https://arweave.net/${arweaveId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-yellow-800 border border-yellow-300 rounded-md hover:bg-yellow-100"
                >
                  {t('viewOnArweave')}
                </a>
              </div>
              {retryCount > 0 && (
                <p className="text-xs text-yellow-600 italic">
                  {t('retryNote', { count: retryCount })}
                </p>
              )}
            </div>
          ) : content ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{displayTitle}</h1>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t('author')}: </span>
                  <span className="text-gray-600">{short(author, 12)}</span>
                </div>
                {displayTimestamp && (
                  <div>
                    <span className="font-medium text-gray-700">{t('publishedAt')}: </span>
                    <span className="text-gray-600">{formatDate(displayTimestamp)}</span>
                  </div>
                )}
                {displayContentHash && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">{t('contentHash')}: </span>
                    <span className="text-gray-600 font-mono text-xs">{displayContentHash}</span>
                  </div>
                )}
                {content.intuitionHash && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">{t('intuitionHash')}: </span>
                    <span className="text-gray-600 font-mono text-xs">{content.intuitionHash}</span>
                  </div>
                )}
                {content.aiScope && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">{t('aiScope')}: </span>
                    <span className="text-gray-600">{content.aiScope}</span>
                  </div>
                )}
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">{t('arweaveId')}: </span>
                  <a
                    href={`https://arweave.net/${arweaveId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-mono text-xs"
                  >
                    {arweaveId}
                  </a>
                </div>
              </div>

              {/* Declared Intuition */}
              {content.declaredIntuition && (
                <div className="p-4 bg-gray-50 border-l-4 border-gray-900 rounded">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {t('declaredIntuition')}
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{content.declaredIntuition}</p>
                </div>
              )}

              {/* Article Content */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('content')}</h3>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.content || '<p class="text-gray-400">No content available.</p>' }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={!content}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('download')}
          </button>
          <div className="flex gap-3">
            {onVerify && (
              <button
                onClick={onVerify}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
              >
                {t('verify')}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

