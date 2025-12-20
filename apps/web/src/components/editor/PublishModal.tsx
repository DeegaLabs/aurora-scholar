'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { useTranslations } from 'next-intl';
import { buildPublishArticleIx, deriveArticlePda } from '@/lib/solana/auroraProgram';
import { useToast } from '@/components/ui/toast';
import { getAuthHeader } from '@/lib/auth/api';
import { aesGcmEncrypt, bytesToBase64 as bytesToBase64Local } from '@/lib/crypto/aesGcm';
import { getApiBaseUrl } from '@/lib/api/baseUrl';

function formatUnknownError(err: any): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || 'Error';
  if (typeof err?.message === 'string') return err.message;
  if (typeof err?.error?.message === 'string') return err.error.message;
  if (typeof err?.cause?.message === 'string') return err.cause.message;
  try {
    return JSON.stringify(err, null, 2);
  } catch {
    return String(err);
  }
}

function hexToBytes(hex: string) {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length !== 64) throw new Error('Invalid hash length (expected 32 bytes hex)');
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function sha256HexBrowser(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map((x) => stableStringify(x)).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

function bytesToBase64(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  declaredIntuition: string;
  title?: string;
  onSuccess?: () => void;
}

export function PublishModal({
  isOpen,
  onClose,
  content,
  declaredIntuition,
  title: initialTitle = '',
  onSuccess,
}: PublishModalProps) {
  const t = useTranslations('publish');
  const { connection } = useConnection();
  const { publicKey, wallet, signMessage, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [aiScope, setAiScope] = useState('Grammar checking and style suggestions only');
  const [isPublishing, setIsPublishing] = useState(false);
  const [step, setStep] = useState<'form' | 'uploading' | 'publishing' | 'success'>('form');
  const [successInfo, setSuccessInfo] = useState<{ arweaveUrl: string; explorerUrl: string } | null>(null);

  // Update title when modal opens or initialTitle changes
  useEffect(() => {
    if (isOpen && initialTitle) {
      setTitle(initialTitle);
    }
  }, [isOpen, initialTitle]);

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!publicKey) {
      toast({ type: 'error', title: 'Wallet', message: t('errors.walletRequired') });
      return;
    }
    if (!wallet || !sendTransaction) {
      toast({ type: 'error', title: 'Wallet', message: t('errors.walletNoTransaction') });
      return;
    }
    if (!signMessage) {
      toast({ type: 'error', title: 'Wallet', message: t('errors.walletNoSignMessage') });
      return;
    }
    if (!title.trim()) {
      toast({ type: 'error', title: 'Validation', message: t('errors.titleRequired') });
      return;
    }
    if (!content.trim()) {
      toast({ type: 'error', title: 'Validation', message: t('errors.contentRequired') });
      return;
    }
    if (!declaredIntuition.trim()) {
      toast({ type: 'error', title: 'Validation', message: t('errors.intuitionRequired') });
      return;
    }

    setIsPublishing(true);
    setStep('uploading');

    try {
      const createdAt = new Date().toISOString();
      const contentHash = await sha256HexBrowser(content);
      const intuitionHash = await sha256HexBrowser(declaredIntuition);

      const author = publicKey.toBase58();
      const canonicalPayload = stableStringify({
        author,
        title,
        contentHash,
        intuitionHash,
        aiScope: aiScope || '',
        isPublic: Boolean(isPublic),
        createdAt,
      });

      // If the user rejects, we stop here (no API call with missing signature).
      const signatureBytes = await signMessage(new TextEncoder().encode(canonicalPayload));
      const signature = bytesToBase64(signatureBytes);

      // If private, encrypt payload (ciphertext goes to Arweave; key stored server-side encrypted-at-rest).
      let articleKeyB64: string | null = null;
      let encryptedPayload: any = null;
      if (!isPublic) {
        const keyBytes = crypto.getRandomValues(new Uint8Array(32));
        articleKeyB64 = bytesToBase64Local(keyBytes);
        encryptedPayload = await aesGcmEncrypt({
          keyBytes32: keyBytes,
          plaintextJson: { content, declaredIntuition, title, aiScope },
        });
      }

      // Step 1: Upload to Arweave via API (Irys)
      const uploadResponse = await fetch(`${getApiBaseUrl()}/api/articles/publish/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          author,
          title,
          content,
          declaredIntuition,
          aiScope,
          isPublic,
          ...(isPublic
            ? {}
            : {
                articleKey: articleKeyB64,
                encryptedPayload,
              }),
          // Backend currently requires signature at top-level + signedPayload.createdAt (MVP).
          signature,
          signedPayload: { createdAt },
          // Also include signature inside signedPayload for forward-compat (harmless extra field).
          signedPayloadSignature: signature,
        }),
      });

      if (!uploadResponse.ok) {
        const text = await uploadResponse.text();
        throw new Error(text || 'Failed to upload to Arweave');
      }

      const prep = await uploadResponse.json();
      const arweaveId = prep?.data?.arweaveId || prep?.arweaveId;
      const arweaveUrl = prep?.data?.arweaveUrl || prep?.arweaveUrl;
      const contentHashHex = prep?.data?.contentHash || prep?.contentHash;
      const intuitionHashHex = prep?.data?.intuitionHash || prep?.intuitionHash;
      if (!arweaveId || !contentHashHex || !intuitionHashHex) throw new Error('Invalid prepare response');

      setStep('publishing');

      // Step 2: Publish to Solana on-chain (wallet signs)
      const contentHashBytes = hexToBytes(contentHashHex);
      const intuitionHashBytes = hexToBytes(intuitionHashHex);
      const [articlePda] = deriveArticlePda(publicKey, contentHashBytes);

      const ix = buildPublishArticleIx({
        article: articlePda,
        author: publicKey,
        contentHash: contentHashBytes,
        intuitionHash: intuitionHashBytes,
        arweaveId,
        title,
        aiScope: aiScope || '',
        isPublic: Boolean(isPublic),
      });

      const tx = new Transaction().add(ix);
      // Make the transaction explicit/stable before handing to wallet-adapter.
      tx.feePayer = publicKey;
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = latestBlockhash.blockhash;

      // Validate message compilation early to surface actionable errors.
      // If this throws, the issue is with instruction encoding / accounts, not wallet-adapter.
      tx.compileMessage();

      // Preflight simulation (no signature verification) to extract useful logs instead of "Unexpected error".
      try {
        // Use VersionedTransaction for simulation (web3.js stable overload).
        const v0msg = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: tx.instructions,
        }).compileToV0Message();
        const vtx = new VersionedTransaction(v0msg);

        // Optional: fee/rent sanity check to avoid opaque wallet errors.
        const [balance, feeInfo, rentExempt] = await Promise.all([
          connection.getBalance(publicKey, 'processed'),
          connection.getFeeForMessage(v0msg, 'processed'),
          connection.getMinimumBalanceForRentExemption(574, 'processed'), // Article::SPACE ~= 574 bytes
        ]);
        const feeLamports = feeInfo.value ?? 0;
        const estimatedNeed = rentExempt + feeLamports;
        if (balance < estimatedNeed) {
          toast({
            type: 'error',
            title: t('errors.insufficientBalance'),
            message: t('errors.balanceMessage', {
              balance: (balance / 1e9).toFixed(4),
              estimated: (estimatedNeed / 1e9).toFixed(4),
            }),
            durationMs: 12000,
          });
          setIsPublishing(false);
          setStep('form');
          return;
        }

        const sim = await connection.simulateTransaction(vtx, {
          sigVerify: false,
          commitment: 'processed',
        });
        if (sim.value.err) {
          // eslint-disable-next-line no-console
          console.error('Publish simulation failed', sim.value.err, sim.value.logs);
          toast({
            type: 'error',
            title: t('errors.simulationFailed'),
            message: t('errors.simulationError', {
              error: JSON.stringify(sim.value.err),
              logs: (sim.value.logs || []).slice(-30).join('\n'),
            }),
            durationMs: 12000,
          });
          setIsPublishing(false);
          setStep('form');
          return;
        }
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('Simulation threw', e);
        // Continue; some RPCs/extensions can block simulation.
      }

      let sig: string;
      try {
        sig = await sendTransaction(tx, connection, { skipPreflight: false, maxRetries: 3 });
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error('sendTransaction threw', e, { keys: e ? Object.keys(e) : [] });
        throw e;
      }
      await connection.confirmTransaction(
        {
          signature: sig,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'confirmed'
      );

      const explorerUrl = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
      setSuccessInfo({ arweaveUrl: arweaveUrl || `https://arweave.net/${arweaveId}`, explorerUrl });
      setStep('success');
      toast({ type: 'success', title: t('success'), message: t('success') });

      // Clear localStorage
      localStorage.removeItem('aurora-editor-content');
      localStorage.removeItem('aurora-editor-intuition');

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        onClose();
        window.location.href = isPublic ? '/journal' : '/dashboard';
      }, 2000);
    } catch (error: any) {
      // Surface more context in dev; keep alert concise.
      // eslint-disable-next-line no-console
      console.error('Publish failed', error);
      toast({
        type: 'error',
        title: t('errors.publishFailed'),
        message: formatUnknownError(error),
        durationMs: 8000,
      });
      setIsPublishing(false);
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {step === 'form' && (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('titleLabel')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('titlePlaceholder')}
                  className="w-full px-4 py-2 rounded-md focus:outline-none"
                  maxLength={128}
                />
              </div>

              {/* AI Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('aiScope')}
                </label>
                <textarea
                  value={aiScope}
                  onChange={(e) => setAiScope(e.target.value)}
                  placeholder={t('aiScopePlaceholder')}
                  className="w-full px-4 py-2 rounded-md focus:outline-none min-h-[80px]"
                  maxLength={256}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('aiScopeNote')}
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('visibility')}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{t('public')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{t('private')}</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 'uploading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-700">{t('uploading')}</p>
            </div>
          )}

          {step === 'publishing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-700">{t('publishing')}</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">{t('success')}</p>
              {successInfo?.explorerUrl ? (
                <div className="mt-3 text-sm">
                  <a className="text-blue-600 hover:underline" href={successInfo.explorerUrl} target="_blank" rel="noreferrer">
                    {t('viewExplorer')}
                  </a>
                </div>
              ) : null}
              {successInfo?.arweaveUrl ? (
                <div className="mt-1 text-sm">
                  <a className="text-blue-600 hover:underline" href={successInfo.arweaveUrl} target="_blank" rel="noreferrer">
                    {t('viewArweave')}
                  </a>
                </div>
              ) : null}
              <p className="text-sm text-gray-500 mt-2">{t('redirecting')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handlePublish}
              disabled={!title.trim() || isPublishing}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('publishButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

