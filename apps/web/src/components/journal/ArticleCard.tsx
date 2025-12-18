'use client';

interface ArticleCardProps {
  title: string;
  author: string;
  timestamp: number;
  contentHash: string;
  arweaveId: string;
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

export function ArticleCard({ title, author, timestamp, contentHash, arweaveId, onVerify }: ArticleCardProps) {
  const arweaveUrl = arweaveId ? `https://arweave.net/${arweaveId}` : '';

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{title || 'Untitled'}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>Autor: {short(author, 8)}</span>
            {timestamp ? <span>Data: {formatDate(timestamp)}</span> : null}
            {contentHash ? <span>Hash: {short(contentHash, 8)}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {arweaveUrl ? (
            <a
              href={arweaveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-white"
              title="Ver conteúdo no Arweave"
            >
              Ver
            </a>
          ) : null}

          <button
            onClick={onVerify}
            className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
            title="Verificar autenticidade (placeholder)"
          >
            Verificar
          </button>
        </div>
      </div>
    </div>
  );
}



