'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getAuroraProgram, deriveArticlePda, SYSTEM_PROGRAM_ID } from '@/lib/solana/auroraProgram';

function hexToBytes(hex: string) {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length !== 64) throw new Error('Invalid hash length (expected 32 bytes hex)');
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  declaredIntuition: string;
  onSuccess?: () => void;
}

export function PublishModal({
  isOpen,
  onClose,
  content,
  declaredIntuition,
  onSuccess,
}: PublishModalProps) {
  const { connection } = useConnection();
  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [aiScope, setAiScope] = useState('Grammar checking and style suggestions only');
  const [isPublishing, setIsPublishing] = useState(false);
  const [step, setStep] = useState<'form' | 'uploading' | 'publishing' | 'success'>('form');
  const [successInfo, setSuccessInfo] = useState<{ arweaveUrl: string; explorerUrl: string } | null>(null);

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!publicKey) {
      alert('Please connect your wallet to publish');
      return;
    }
    if (!wallet || !signTransaction || !signAllTransactions) {
      alert('Wallet does not support signing');
      return;
    }
    if (!title.trim()) {
      alert('Please provide a title for your article');
      return;
    }
    if (!content.trim()) {
      alert('Please add content to your article');
      return;
    }
    if (!declaredIntuition.trim()) {
      alert('Please add your declared intuition before publishing');
      return;
    }

    setIsPublishing(true);
    setStep('uploading');

    try {
      // Step 1: Upload to Arweave via API (Irys)
      const uploadResponse = await fetch('http://localhost:3001/api/articles/publish/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          declaredIntuition,
          aiScope,
          isPublic,
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
      // wallet-adapter wallet implements the minimal Anchor wallet interface (publicKey + signTransaction + signAllTransactions)
      const anchorWallet = {
        publicKey,
        signTransaction: signTransaction as any,
        signAllTransactions: signAllTransactions as any,
      } as any;

      const program = getAuroraProgram(connection as any, anchorWallet);
      const contentHashBytes = hexToBytes(contentHashHex);
      const intuitionHashBytes = hexToBytes(intuitionHashHex);
      const [articlePda] = deriveArticlePda(publicKey, contentHashBytes);

      const sig = await program.methods
        .publishArticle(Array.from(contentHashBytes), Array.from(intuitionHashBytes), arweaveId, title, aiScope, isPublic)
        .accounts({
          article: articlePda,
          author: publicKey,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .rpc();

      const explorerUrl = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
      setSuccessInfo({ arweaveUrl: arweaveUrl || `https://arweave.net/${arweaveId}`, explorerUrl });
      setStep('success');

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
      alert(`Publishing failed: ${error.message}`);
      setIsPublishing(false);
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Publish Article</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {step === 'form' && (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter article title"
                  className="w-full px-4 py-2 rounded-md focus:outline-none"
                  maxLength={128}
                />
              </div>

              {/* AI Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Scope
                </label>
                <textarea
                  value={aiScope}
                  onChange={(e) => setAiScope(e.target.value)}
                  placeholder="Describe how AI was used (e.g., 'Grammar checking only')"
                  className="w-full px-4 py-2 rounded-md focus:outline-none min-h-[80px]"
                  maxLength={256}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be registered on-chain for transparency.
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Public (appears in journal)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Private (accessible via link)</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 'uploading' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-700">Uploading to Arweave...</p>
            </div>
          )}

          {step === 'publishing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-700">Publishing to Solana blockchain...</p>
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
              <p className="text-gray-700 font-medium">Article published successfully!</p>
              {successInfo?.explorerUrl ? (
                <div className="mt-3 text-sm">
                  <a className="text-blue-600 hover:underline" href={successInfo.explorerUrl} target="_blank" rel="noreferrer">
                    Ver no Solana Explorer
                  </a>
                </div>
              ) : null}
              {successInfo?.arweaveUrl ? (
                <div className="mt-1 text-sm">
                  <a className="text-blue-600 hover:underline" href={successInfo.arweaveUrl} target="_blank" rel="noreferrer">
                    Ver no Arweave
                  </a>
                </div>
              ) : null}
              <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
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
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!title.trim() || isPublishing}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

