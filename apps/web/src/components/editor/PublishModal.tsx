'use client';

import { useState } from 'react';
// Wallet integration will be added in Task 10
// import { useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';

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
  // TODO: Add wallet integration in Task 10
  const publicKey = null;
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [aiScope, setAiScope] = useState('Grammar checking and style suggestions only');
  const [isPublishing, setIsPublishing] = useState(false);
  const [step, setStep] = useState<'form' | 'uploading' | 'publishing' | 'success'>('form');

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!publicKey) {
      alert('Please connect your wallet to publish');
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

    setIsPublishing(true);
    setStep('uploading');

    try {
      // Step 1: Upload to Arweave
      const uploadResponse = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title,
          declaredIntuition,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to Arweave');
      }

      const { arweaveId } = await uploadResponse.json();
      setStep('publishing');

      // Step 2: Publish to Solana
      // TODO: This will be implemented when wallet integration is added (Task 10)
      const publishResponse = await fetch('/api/blockchain/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: publicKey ? String(publicKey) : '',
          content,
          declaredIntuition,
          arweaveId,
          title,
          aiScope,
          isPublic,
        }),
      });

      if (!publishResponse.ok) {
        throw new Error('Failed to publish to blockchain');
      }

      const { transactionId: _transactionId } = await publishResponse.json();
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[80px]"
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
              <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
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

