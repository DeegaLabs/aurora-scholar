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

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!articleId) return;
      if (!publicKey || !signMessage) return;
      setIsLoading(true);

      try {
        // 1) Fetch metadata (requires auth and grant/author)
        const metaRes = await fetch(`${getApiBaseUrl()}/api/articles/${encodeURIComponent(articleId)}`, {
          headers: { ...getAuthHeader() },
        });
        const metaJson = await metaRes.json();
        if (!metaRes.ok) throw new Error(metaJson?.error || metaJson?.message || `HTTP ${metaRes.status}`);
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
        if (!chRes.ok) throw new Error(chJson?.error || chJson?.message || `HTTP ${chRes.status}`);
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
        if (!claimRes.ok) throw new Error(claimJson?.error || claimJson?.message || `HTTP ${claimRes.status}`);
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
        toast({ type: 'error', title: 'Privado', message: e?.message || 'Falha ao abrir artigo privado.' });
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


