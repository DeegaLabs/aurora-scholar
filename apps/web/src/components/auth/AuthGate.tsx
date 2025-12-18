'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { authChallenge, authVerify } from '@/lib/auth/api';
import { getAuthToken } from '@/lib/auth/token';
import { useToast } from '@/components/ui/toast';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
);

const PUBLIC_PATHS = new Set<string>(['/', '/journal']);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const { publicKey, connected, signMessage } = useWallet();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [ready, setReady] = useState(false);

  const requiresAuth = useMemo(() => !PUBLIC_PATHS.has(pathname), [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!requiresAuth) {
        setReady(true);
        return;
      }

      if (!connected || !publicKey) {
        setReady(false);
        return;
      }

      // Already have token
      const existing = getAuthToken();
      if (existing) {
        setReady(true);
        return;
      }

      if (!signMessage) {
        toast({
          type: 'error',
          title: 'Wallet',
          message: 'Sua wallet não suporta assinatura de mensagem (signMessage).',
        });
        setReady(false);
        return;
      }

      if (isSigningIn) return;
      setIsSigningIn(true);

      try {
        const wallet = publicKey.toBase58();
        const ch = await authChallenge(wallet);
        const message = JSON.stringify({
          domain: 'aurora-scholar',
          action: 'auth',
          wallet,
          nonce: ch.nonce,
        });
        const sigBytes = await signMessage(new TextEncoder().encode(message));
        await authVerify({ wallet, nonce: ch.nonce, signatureBytes: sigBytes });
        if (!cancelled) setReady(true);
      } catch (e: any) {
        toast({ type: 'error', title: 'Auth', message: e?.message || 'Falha no login por wallet.' });
        if (!cancelled) setReady(false);
      } finally {
        if (!cancelled) setIsSigningIn(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [requiresAuth, connected, publicKey, signMessage, toast, isSigningIn]);

  if (!requiresAuth) return <>{children}</>;

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 bg-white">
          <div className="text-lg font-semibold text-gray-900">Conectar wallet</div>
          <p className="mt-2 text-sm text-gray-600">
            Para acessar esta página, conecte sua wallet.
          </p>
          <div className="mt-4">
            <WalletMultiButton />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Páginas públicas: <span className="font-mono">/</span> e <span className="font-mono">/journal</span>
          </div>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 bg-white">
          <div className="text-lg font-semibold text-gray-900">Autenticando…</div>
          <p className="mt-2 text-sm text-gray-600">
            Assine a mensagem na wallet para continuar.
          </p>
          <div className="mt-4">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


