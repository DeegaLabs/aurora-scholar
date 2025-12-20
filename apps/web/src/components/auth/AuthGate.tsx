'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { authChallenge, authVerify } from '@/lib/auth/api';
import { getAuthToken } from '@/lib/auth/token';
import { useToast } from '@/components/ui/toast';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
);

const PUBLIC_PATHS = new Set<string>(['/', '/journal']);

function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map((x) => stableStringify(x)).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const { publicKey, connected, signMessage } = useWallet();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [ready, setReady] = useState(false);

  const requiresAuth = useMemo(() => !PUBLIC_PATHS.has(pathname), [pathname]);
  
  // Use refs to access latest values without causing dependency issues
  const connectedRef = useRef(connected);
  const publicKeyRef = useRef(publicKey);
  const signMessageRef = useRef(signMessage);
  const isSigningInRef = useRef(isSigningIn);
  const toastRef = useRef(toast);

  useEffect(() => {
    connectedRef.current = connected;
    publicKeyRef.current = publicKey;
    signMessageRef.current = signMessage;
    isSigningInRef.current = isSigningIn;
    toastRef.current = toast;
  }, [connected, publicKey, signMessage, isSigningIn, toast]);

  const authenticate = async () => {
    if (!connectedRef.current || !publicKeyRef.current || !signMessageRef.current) {
      return false;
    }

    if (isSigningInRef.current) return false;
    setIsSigningIn(true);

    try {
      const wallet = publicKeyRef.current.toBase58();
      const ch = await authChallenge(wallet);
      // Must match backend canonicalization (stableStringify) or signature will fail.
      const message = stableStringify({
        domain: 'aurora-scholar',
        action: 'auth',
        wallet,
        nonce: ch.nonce,
      });
      const sigBytes = await signMessageRef.current(new TextEncoder().encode(message));
      await authVerify({ wallet, nonce: ch.nonce, signatureBytes: sigBytes });
      return true;
    } catch (e: any) {
      toastRef.current({ type: 'error', title: 'Auth', message: e?.message || 'Falha no login por wallet.' });
      return false;
    } finally {
      setIsSigningIn(false);
    }
  };

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

      const success = await authenticate();
      if (!cancelled) setReady(success);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [requiresAuth, connected, publicKey, signMessage, toast]);

  // Listen for refresh auth events (when JWT expires)
  useEffect(() => {
    const handleRefreshAuth = async () => {
      if (!connectedRef.current || !publicKeyRef.current || !signMessageRef.current) {
        return;
      }

      // Clear old token and re-authenticate
      const { clearAuthToken } = await import('@/lib/auth/token');
      clearAuthToken();
      
      const success = await authenticate();
      if (success) {
        toastRef.current({
          type: 'success',
          title: 'Autenticação',
          message: 'Token renovado com sucesso.',
        });
      }
    };

    window.addEventListener('aurora:refresh-auth', handleRefreshAuth);
    return () => {
      window.removeEventListener('aurora:refresh-auth', handleRefreshAuth);
    };
  }, []);

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


