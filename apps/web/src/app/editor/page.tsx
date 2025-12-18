'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Editor } from '@/components/editor/Editor';
import { AiGuidancePanel } from '@/components/editor/AiGuidancePanel';
import { PublishModal } from '@/components/editor/PublishModal';
import { PreviewModal } from '@/components/editor/PreviewModal';
import { AiChatModal } from '@/components/editor/AiChatModal';
import { DeclaredSources, Source } from '@/components/editor/DeclaredSources';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { HelpWriteModal } from '@/components/editor/HelpWriteModal';
import { SuggestStructureModal } from '@/components/editor/SuggestStructureModal';
import { CheckCoherenceModal } from '@/components/editor/CheckCoherenceModal';
import { RefinementMenu } from '@/components/editor/RefinementMenu';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function EditorPage() {
  const t = useTranslations('editor');
  const { publicKey, connected } = useWallet();
  const [content, setContent] = useState<string>('');
  const [declaredIntuition, setDeclaredIntuition] = useState<string>('');
  const [sources, setSources] = useState<Source[]>([]);
  const [articleTitle, setArticleTitle] = useState<string>('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAiChatModalOpen, setIsAiChatModalOpen] = useState(false);
  const [isHelpWriteModalOpen, setIsHelpWriteModalOpen] = useState(false);
  const [isSuggestStructureModalOpen, setIsSuggestStructureModalOpen] = useState(false);
  const [isCheckCoherenceModalOpen, setIsCheckCoherenceModalOpen] = useState(false);
  const [isRefinementMenuOpen, setIsRefinementMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [floatingButtonsEnabled, setFloatingButtonsEnabled] = useState(true);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    const savedContent = localStorage.getItem('aurora-editor-content');
    const savedIntuition = localStorage.getItem('aurora-editor-intuition');
    const savedSources = localStorage.getItem('aurora-editor-sources');
    const savedTitle = localStorage.getItem('aurora-editor-title');
    const savedFloatingButtons = localStorage.getItem('aurora-editor-floating-buttons');
    
    if (savedContent) setContent(savedContent);
    if (savedIntuition) setDeclaredIntuition(savedIntuition);
    if (savedTitle) setArticleTitle(savedTitle);
    if (savedSources) {
      try {
        setSources(JSON.parse(savedSources));
      } catch {
        // Ignore parse errors
      }
    }
    if (savedFloatingButtons !== null) {
      setFloatingButtonsEnabled(savedFloatingButtons === 'true');
    }
  }, []);

  useEffect(() => {
    if (content) {
      setIsSaving(true);
      const timer = setTimeout(() => {
        localStorage.setItem('aurora-editor-content', content);
        setLastSaved(new Date());
        setIsSaving(false);
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timer);
    }
  }, [content]);

  useEffect(() => {
    if (declaredIntuition) {
      localStorage.setItem('aurora-editor-intuition', declaredIntuition);
    }
  }, [declaredIntuition]);

  useEffect(() => {
    if (sources.length > 0) {
      localStorage.setItem('aurora-editor-sources', JSON.stringify(sources));
    }
  }, [sources]);

  useEffect(() => {
    if (articleTitle) {
      localStorage.setItem('aurora-editor-title', articleTitle);
    }
  }, [articleTitle]);

  useEffect(() => {
    localStorage.setItem('aurora-editor-floating-buttons', String(floatingButtonsEnabled));
  }, [floatingButtonsEnabled]);

  const handleAddSource = (source: Source) => {
    setSources((prev) => [...prev, source]);
  };

  const handleRemoveSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePublish = () => {
    if (!connected || !publicKey) {
      alert(t('walletRequired'));
      return;
    }
    if (!content.trim()) {
      alert('Please add content to your article');
      return;
    }
    setIsPublishModalOpen(true);
  };

  const handlePreview = () => {
    setIsPreviewModalOpen(true);
  };

  const getWordCount = (text: string) => {
    const htmlText = text.replace(/<[^>]*>/g, '');
    return htmlText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Logo/Icon */}
              <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {/* Title Input */}
              <input
                type="text"
                value={articleTitle || ''}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder="Untitled article"
                className="w-64 px-2 py-1 text-lg font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded focus:ring-1 focus:ring-gray-300"
                maxLength={128}
              />
            </div>
            <div className="flex items-center gap-4">
              <WalletMultiButton />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Sources */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-sm font-semibold text-gray-900">Sources</h2>
              </div>
            </div>
            <DeclaredSources
              sources={sources}
              onAddSource={handleAddSource}
              onRemoveSource={handleRemoveSource}
            />
          </div>
        </div>

        {/* Center Column - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Main Editor */}
            <div className="border border-gray-200 rounded-lg bg-white shadow-sm relative overflow-visible">
              <Editor
                content={content}
                onChange={setContent}
                placeholder={t('editorPlaceholder')}
                floatingButtonsEnabled={floatingButtonsEnabled}
                onHelpWrite={() => setIsHelpWriteModalOpen(true)}
                onSuggestStructure={() => setIsSuggestStructureModalOpen(true)}
                onCheckCoherence={() => setIsCheckCoherenceModalOpen(true)}
                onMoreOptions={() => setIsRefinementMenuOpen(true)}
              />
              {/* Word count */}
              {content && (
                <div className="border-t border-gray-200 px-6 py-2 text-xs text-gray-500">
                  {getWordCount(content)} words
                </div>
              )}
            </div>
          </div>
          
          {/* Footer - Save status and actions */}
          <div className="border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-end gap-4">
            {/* Save indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>
            <button
              onClick={handlePreview}
              disabled={!content.trim()}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('preview')}
            </button>
            <button
              onClick={handlePublish}
              disabled={!connected || !content.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!content.trim() ? 'Add content to publish' : !connected ? t('walletRequired') : ''}
            >
              {t('publish')}
            </button>
          </div>
        </div>

        {/* Right Column - AI Guidance */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          <AiGuidancePanel
            content={content}
            declaredIntuition={declaredIntuition}
            onDeclaredIntuitionChange={setDeclaredIntuition}
            onOpenChat={() => setIsAiChatModalOpen(true)}
            floatingButtonsEnabled={floatingButtonsEnabled}
            onFloatingButtonsEnabledChange={setFloatingButtonsEnabled}
          />
        </div>
      </div>

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          content={content}
          declaredIntuition={declaredIntuition}
          onSuccess={() => {
            // Clear localStorage on successful publish
            localStorage.removeItem('aurora-editor-content');
            localStorage.removeItem('aurora-editor-intuition');
            localStorage.removeItem('aurora-editor-sources');
            localStorage.removeItem('aurora-editor-title');
          }}
        />
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={articleTitle || 'Untitled Article'}
          content={content}
          declaredIntuition={declaredIntuition}
        />
      )}

      {/* AI Chat Modal */}
      {isAiChatModalOpen && (
        <AiChatModal
          isOpen={isAiChatModalOpen}
          onClose={() => setIsAiChatModalOpen(false)}
          content={content}
          declaredIntuition={declaredIntuition}
          sources={sources}
        />
      )}

      {/* Help Write Modal */}
      {isHelpWriteModalOpen && (
        <HelpWriteModal
          isOpen={isHelpWriteModalOpen}
          onClose={() => {
            setIsHelpWriteModalOpen(false);
          }}
          content={content}
          declaredIntuition={declaredIntuition}
          sources={sources}
        />
      )}

      {/* Suggest Structure Modal */}
      {isSuggestStructureModalOpen && (
        <SuggestStructureModal
          isOpen={isSuggestStructureModalOpen}
          onClose={() => setIsSuggestStructureModalOpen(false)}
          content={content}
          sources={sources}
        />
      )}

      {/* Check Coherence Modal */}
      {isCheckCoherenceModalOpen && (
        <CheckCoherenceModal
          isOpen={isCheckCoherenceModalOpen}
          onClose={() => setIsCheckCoherenceModalOpen(false)}
          content={content}
          declaredIntuition={declaredIntuition}
          sources={sources}
        />
      )}

      {/* Refinement Menu */}
      {isRefinementMenuOpen && (
        <RefinementMenu
          isOpen={isRefinementMenuOpen}
          onClose={() => setIsRefinementMenuOpen(false)}
          onAction={(action) => {
            console.log('Refinement action:', action);
            // TODO: Implement refinement actions
          }}
        />
      )}
    </div>
  );
}
