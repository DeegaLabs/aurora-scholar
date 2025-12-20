'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Editor } from '@/components/editor/Editor';
import { AiGuidancePanel } from '@/components/editor/AiGuidancePanel';
import { PublishModal } from '@/components/editor/PublishModal';
import { PreviewModal } from '@/components/editor/PreviewModal';
import { AiChatModal } from '@/components/editor/AiChatModal';
import { DeclaredSources, Source } from '@/components/editor/DeclaredSources';
import { ExpandableSideCard } from '@/components/editor/ExpandableSideCard';
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { HelpWriteModal } from '@/components/editor/HelpWriteModal';
import { SuggestStructureModal } from '@/components/editor/SuggestStructureModal';
import { CheckCoherenceModal } from '@/components/editor/CheckCoherenceModal';
import { RefinementMenu } from '@/components/editor/RefinementMenu';
import { useWallet } from '@solana/wallet-adapter-react';

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
  const [sourcesExpanded, setSourcesExpanded] = useState(true);
  const [studioExpanded, setStudioExpanded] = useState(true);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleMeasureRef = useRef<HTMLSpanElement>(null);
  const [titleWidth, setTitleWidth] = useState(200);

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

  // Measure title width
  useEffect(() => {
    if (titleMeasureRef.current) {
      const width = titleMeasureRef.current.offsetWidth;
      setTitleWidth(Math.max(200, width + 20));
    }
  }, [articleTitle]);

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <Image
                src="/logo-mini.png"
                alt="Aurora Scholar"
                width={32}
                height={32}
                className="object-contain flex-shrink-0"
              />
              {/* Title Input - Expands with text */}
              <div className="relative inline-block">
                <span
                  ref={titleMeasureRef}
                  className="invisible absolute whitespace-pre text-lg font-medium px-2 py-1 pointer-events-none"
                  aria-hidden="true"
                >
                  {articleTitle || 'Untitled article'}
                </span>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={articleTitle || ''}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="Untitled article"
                  className="px-2 py-1 text-lg font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded focus:ring-1 focus:ring-gray-300"
                  style={{
                    width: `${titleWidth}px`,
                  }}
                  maxLength={128}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
              >
                Dashboard
              </Link>
              <Link
                href="/journal"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition"
              >
                Journal
              </Link>
              <WalletInfo />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Suspended Cards */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Card - Sources */}
        <ExpandableSideCard
          title="Fontes"
          icon={
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          isExpanded={sourcesExpanded}
          onToggle={() => setSourcesExpanded(!sourcesExpanded)}
          position="left"
        >
          <div className="p-4">
            <DeclaredSources
              sources={sources}
              onAddSource={handleAddSource}
              onRemoveSource={handleRemoveSource}
            />
          </div>
        </ExpandableSideCard>

        {/* Center Card - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 relative overflow-visible min-h-full flex flex-col">
              <div className="flex-1">
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
              </div>
              {/* Word count */}
              {content && (
                <div className="border-t border-gray-200 px-6 py-2 text-xs text-gray-500">
                  {getWordCount(content)} words
                </div>
              )}
              {/* Footer - Save status and actions */}
              <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-4">
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
          </div>
        </div>

        {/* Right Card - Estúdio */}
        <ExpandableSideCard
          title="Estúdio"
          icon={
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          isExpanded={studioExpanded}
          onToggle={() => setStudioExpanded(!studioExpanded)}
          position="right"
        >
          <AiGuidancePanel
            content={content}
            declaredIntuition={declaredIntuition}
            onDeclaredIntuitionChange={setDeclaredIntuition}
            onOpenChat={() => setIsAiChatModalOpen(true)}
            floatingButtonsEnabled={floatingButtonsEnabled}
            onFloatingButtonsEnabledChange={setFloatingButtonsEnabled}
          />
        </ExpandableSideCard>
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
