'use client';

import { useTranslations } from 'next-intl';

interface ArticleCardProps {
  title: string;
  author: string;
  timestamp: number;
  contentHash: string;
  arweaveId: string;
  onView?: () => void;
  onVerify?: () => void;
}

function formatDate(ts: number) {
  if (!ts) return '';
  const d = new Date(ts * 1000); // on-chain timestamp in seconds
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function short(s: string, n = 6) {
  if (!s) return '';
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}

export function ArticleCard({ title, author, timestamp, contentHash, arweaveId, onView, onVerify }: ArticleCardProps) {
  const t = useTranslations('journal.card');
  const arweaveUrl = arweaveId ? `https://arweave.net/${arweaveId}` : '';

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!arweaveUrl) return;
    window.open(arweaveUrl, '_blank');
  };

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white p-5 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{title || t('untitled')}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>{t('author')}: {short(author, 8)}</span>
            {timestamp ? <span>{t('date')}: {formatDate(timestamp)}</span> : null}
            {contentHash ? <span>{t('hash')}: {short(contentHash, 8)}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {arweaveUrl ? (
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-white"
              title={t('downloadTitle')}
            >
              {t('download')}
            </button>
          ) : null}

          {onVerify && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVerify();
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
              title={t('verifyTitle')}
            >
              {t('verify')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}




