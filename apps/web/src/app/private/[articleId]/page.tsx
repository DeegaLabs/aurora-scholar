'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAuthHeader } from '@/lib/auth/api';
import { base64ToBytes, aesGcmDecrypt, bytesToBase64 } from '@/lib/crypto/aesGcm';
import { useToast } from '@/components/ui/toast';

function getApiBaseUrl() {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  if (envUrl) return envUrl;
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3001';
  return '';
}

function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map((x) => stableStringify(x)).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

export default function PrivateArticlePage() {
  const params = useParams() as any;
  const articleId = String(params?.articleId || '');
  const { publicKey, signMessage } = useWallet();
  const { toast } = useToast();

  const [title, setTitle] = useState<string>('');
  const [arweaveId, setArweaveId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<string>('');
  const [intuition, setIntuition] = useState<string>('');
  const [uiError, setUiError] = useState<{ kind: 'none' | 'access' | 'notfound' | 'unknown'; message: string } | null>(null);

  async function copyAccessRequest() {
    if (!publicKey) return;
    const viewerWallet = publicKey.toBase58();
    const link = `${window.location.origin}/private/${articleId}`;
    const msg =
      `Aurora Scholar — solicitação de acesso\n\n` +
      `ArticleId: ${articleId}\n` +
      `Viewer wallet: ${viewerWallet}\n` +
      `Link: ${link}\n\n` +
      `Pode conceder acesso (Privado B) para essa wallet?`;
    try {
      await navigator.clipboard.writeText(msg);
      toast({ type: 'success', title: 'Solicitação', message: 'Mensagem copiada.' });
    } catch {
      window.prompt('Copie a mensagem:', msg);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!articleId) return;
      if (!publicKey || !signMessage) return;
      setIsLoading(true);
      setUiError(null);

      try {
        // 1) Fetch metadata (requires auth and grant/author)
        const metaRes = await fetch(`${getApiBaseUrl()}/api/articles/${encodeURIComponent(articleId)}`, {
          headers: { ...getAuthHeader() },
        });
        const metaJson = await metaRes.json();
        if (!metaRes.ok) {
          const msg = metaJson?.error || metaJson?.message || `HTTP ${metaRes.status}`;
          if (!cancelled) {
            if (metaRes.status === 404) setUiError({ kind: 'notfound', message: msg });
            else if (metaRes.status === 403) setUiError({ kind: 'access', message: msg });
            else setUiError({ kind: 'unknown', message: msg });
          }
          return;
        }
        const meta = metaJson?.data;
        if (!meta?.arweaveId) throw new Error('Artigo sem arweaveId');
        if (!cancelled) {
          setTitle(meta.title || '');
          setArweaveId(meta.arweaveId || '');
        }

        // 2) Challenge (validates grant exists)
        const chRes = await fetch(`${getApiBaseUrl()}/api/access-control/key/challenge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ articleId }),
        });
        const chJson = await chRes.json();
        if (!chRes.ok) {
          const msg = chJson?.error || chJson?.message || `HTTP ${chRes.status}`;
          if (!cancelled) {
            if (chRes.status === 403) setUiError({ kind: 'access', message: msg });
            else setUiError({ kind: 'unknown', message: msg });
          }
          return;
        }
        const nonce = chJson?.data?.nonce as string;
        if (!nonce) throw new Error('Challenge inválido');

        // 3) Sign claim message
        const wallet = publicKey.toBase58();
        const message = stableStringify({
          domain: 'aurora-scholar',
          action: 'access-key',
          wallet,
          articleId,
          nonce,
        });
        const sigBytes = await signMessage(new TextEncoder().encode(message));
        const signature = bytesToBase64(sigBytes);

        // 4) Claim key
        const claimRes = await fetch(`${getApiBaseUrl()}/api/access-control/key/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ articleId, nonce, signature }),
        });
        const claimJson = await claimRes.json();
        if (!claimRes.ok) {
          const msg = claimJson?.error || claimJson?.message || `HTTP ${claimRes.status}`;
          if (!cancelled) {
            if (claimRes.status === 403) setUiError({ kind: 'access', message: msg });
            else setUiError({ kind: 'unknown', message: msg });
          }
          return;
        }
        const keyB64 = claimJson?.data?.key as string;
        if (!keyB64) throw new Error('Key ausente');
        const keyBytes = base64ToBytes(keyB64);

        // 5) Fetch ciphertext from Arweave and decrypt locally
        const arRes = await fetch(`https://arweave.net/${encodeURIComponent(meta.arweaveId)}`);
        if (!arRes.ok) throw new Error(`Falha ao buscar Arweave (${arRes.status})`);
        const arJson = await arRes.json();

        // Expect { content: { encrypted:true, ivB64, ciphertextB64, ... } } from our storage format
        const enc = arJson?.content;
        if (!enc?.encrypted || !enc?.ivB64 || !enc?.ciphertextB64) throw new Error('Payload criptografado inválido');

        const plain = await aesGcmDecrypt({
          keyBytes32: keyBytes,
          ivB64: enc.ivB64,
          ciphertextB64: enc.ciphertextB64,
        });

        if (!cancelled) {
          setContent(String(plain?.content || ''));
          setIntuition(String(plain?.declaredIntuition || ''));
        }
      } catch (e: any) {
        if (!cancelled) setUiError({ kind: 'unknown', message: e?.message || 'Falha ao abrir artigo privado.' });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [articleId, publicKey, signMessage, toast]);

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
                <h1 className="text-sm font-semibold text-gray-900">Artigo privado</h1>
                <p className="text-xs text-gray-500 font-mono">{articleId}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-sm text-gray-700 hover:text-gray-900">
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {isLoading ? (
            <div className="text-sm text-gray-600">Descriptografando…</div>
          ) : uiError && uiError.kind !== 'none' ? (
            <div className="border border-gray-200 rounded-lg bg-white p-5 space-y-3">
              <div className="text-sm font-semibold text-gray-900">
                {uiError.kind === 'access' ? 'Sem acesso' : uiError.kind === 'notfound' ? 'Não encontrado' : 'Erro'}
              </div>
              <div className="text-sm text-gray-700">
                {uiError.kind === 'access'
                  ? 'Você não tem permissão para abrir este artigo. Peça ao autor para conceder acesso à sua wallet.'
                  : uiError.kind === 'notfound'
                    ? 'Este artigo não existe (ou o link está incorreto).'
                    : 'Falha ao carregar o artigo.'}
              </div>
              <div className="text-xs text-gray-500 font-mono">{uiError.message}</div>

              {uiError.kind === 'access' && publicKey ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="text-xs font-semibold text-gray-700">Sua wallet (viewer)</div>
                  <div className="mt-1 text-xs text-gray-600 font-mono break-all">{publicKey.toBase58()}</div>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <a href="/dashboard" className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50">
                  Ir para Dashboard
                </a>
                {uiError.kind === 'access' && publicKey ? (
                  <button
                    onClick={copyAccessRequest}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
                  >
                    Solicitar acesso
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="text-lg font-semibold text-gray-900">{title || 'Sem título'}</div>
                {arweaveId ? <div className="mt-1 text-xs text-gray-500 font-mono">{arweaveId}</div> : null}
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="text-sm font-semibold text-gray-900">Declared Intuition</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{intuition}</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="text-sm font-semibold text-gray-900">Conteúdo</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{content}</div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}


