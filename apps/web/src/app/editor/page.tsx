'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Editor } from '@/components/editor/Editor';
import { IntuitionField } from '@/components/editor/IntuitionField';
import { AiSidebar } from '@/components/editor/AiSidebar';
import { PublishModal } from '@/components/editor/PublishModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
// Wallet integration will be added in Task 10
// import { useWallet } from '@solana/wallet-adapter-react';

export default function EditorPage() {
  const t = useTranslations('editor');
  // TODO: Add wallet integration in Task 10
  const publicKey = null;
  const connected = false;
  const [content, setContent] = useState<string>('');
  const [declaredIntuition, setDeclaredIntuition] = useState<string>('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);

  // Auto-save to localStorage
  useEffect(() => {
    const savedContent = localStorage.getItem('aurora-editor-content');
    const savedIntuition = localStorage.getItem('aurora-editor-intuition');
    
    if (savedContent) setContent(savedContent);
    if (savedIntuition) setDeclaredIntuition(savedIntuition);
  }, []);

  useEffect(() => {
    if (content) {
      localStorage.setItem('aurora-editor-content', content);
    }
  }, [content]);

  useEffect(() => {
    if (declaredIntuition) {
      localStorage.setItem('aurora-editor-intuition', declaredIntuition);
    }
  }, [declaredIntuition]);

  const handlePublish = () => {
    if (!connected || !publicKey) {
      alert(t('walletRequired'));
      return;
    }
    setIsPublishModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-display font-semibold text-gray-900">
              {t('title')}
            </h1>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {isAiSidebarOpen ? t('hideAi') : t('showAi')}
              </button>
              <button
                onClick={handlePublish}
                disabled={!connected || !content.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('publish')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Editor */}
          <div className={`${isAiSidebarOpen ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}>
            <div className="space-y-6">
              {/* Declared Intuition Field (Layer 1) */}
              <IntuitionField
                value={declaredIntuition}
                onChange={setDeclaredIntuition}
                placeholder={t('intuitionPlaceholder')}
              />

              {/* Main Editor */}
              <div className="border border-gray-200 rounded-lg bg-white">
                <Editor
                  content={content}
                  onChange={setContent}
                  placeholder={t('editorPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Right Column - AI Sidebar */}
          {isAiSidebarOpen && (
            <div className="lg:col-span-1">
              <AiSidebar
                content={content}
                declaredIntuition={declaredIntuition}
              />
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          content={content}
          declaredIntuition={declaredIntuition}
        />
      )}
    </div>
  );
}

