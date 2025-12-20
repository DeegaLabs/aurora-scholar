'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';

export interface Source {
  id: string;
  type: 'pdf' | 'link' | 'video' | 'audio' | 'text';
  name: string;
  url?: string;
  text?: string;
  file?: File;
  uploaded: boolean;
}

interface DeclaredSourcesProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (id: string) => void;
}

const MAX_SOURCES = 300;

export function DeclaredSources({ sources, onAddSource, onRemoveSource }: DeclaredSourcesProps) {
  const t = useTranslations('editor.sources');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStep, setModalStep] = useState<'main' | 'link' | 'youtube' | 'text'>('main');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkUrls, setLinkUrls] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const handleAddMultipleLinks = () => {
    if (!linkUrls.trim()) {
      alert(t('modal.urlsLabel').replace('*', '').trim() + ' é obrigatório');
      return;
    }

    const urls = linkUrls
      .split(/[\n\s]+/)
      .map(url => url.trim())
      .filter(url => url.length > 0 && (url.startsWith('http://') || url.startsWith('https://')));

    if (urls.length === 0) {
      alert('Por favor, forneça URLs válidas');
      return;
    }

    urls.forEach((url, index) => {
      const newSource: Source = {
        id: `${Date.now()}-${index}`,
        type: 'link',
        name: url,
        url: url,
        uploaded: false,
      };
      onAddSource(newSource);
    });

    setLinkUrls('');
    setModalStep('main');
    setShowAddModal(false);
  };

  const handleAddYouTube = () => {
    if (!linkUrl.trim()) {
      alert(t('modal.youtubeLabel').replace('*', '').trim() + ' é obrigatório');
      return;
    }

    const newSource: Source = {
      id: Date.now().toString(),
      type: 'video',
      name: `YouTube: ${linkUrl}`,
      url: linkUrl,
      uploaded: false,
    };

    onAddSource(newSource);
    setLinkUrl('');
    setModalStep('main');
    setShowAddModal(false);
  };

  const handleAddText = () => {
    if (!pastedText.trim()) {
      alert(t('modal.textLabel').replace('*', '').trim() + ' é obrigatório');
      return;
    }

    const newSource: Source = {
      id: Date.now().toString(),
      type: 'text',
      name: `Text: ${pastedText.substring(0, 50)}${pastedText.length > 50 ? '...' : ''}`,
      text: pastedText,
      uploaded: false,
    };

    onAddSource(newSource);
    setPastedText('');
    setModalStep('main');
    setShowAddModal(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const fileType = file.type.includes('pdf') ? 'pdf' :
                      file.type.includes('video') ? 'video' :
                      file.type.includes('audio') ? 'audio' : 'text';

      const newSource: Source = {
        id: `${Date.now()}-${file.name}`,
        type: fileType,
        name: file.name,
        file,
        uploaded: false,
      };

      onAddSource(newSource);
    });

    setShowAddModal(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'link':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const resetModal = () => {
    setModalStep('main');
    setLinkUrl('');
    setLinkUrls('');
    setPastedText('');
    setIsDragging(false);
  };

  return (
    <>
      <div className="bg-white">
        {/* Always expanded in sidebar layout */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {sources.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {sources.length}/{MAX_SOURCES}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
            {/* Add Source Button */}
            <button
              onClick={() => {
                setShowAddModal(true);
                resetModal();
              }}
              className="w-full px-4 py-3 text-sm font-medium text-gray-900 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('addSources')}
            </button>

            {/* Sources List */}
            {sources.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-gray-600 flex-shrink-0">
                        {getSourceIcon(source.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {source.name}
                        </p>
                        {source.url && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{source.url}</p>
                        )}
                        {source.uploaded && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {t('processed')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveSource(source.id)}
                      className="ml-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      title={t('remove')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">{t('savedSources')}</p>
                <p className="text-xs mt-1">{t('clickToAdd')}</p>
              </div>
            )}
        </div>
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => { setShowAddModal(false); resetModal(); }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {modalStep !== 'main' && (
                  <button
                    onClick={() => setModalStep('main')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalStep === 'main' ? t('modal.title') :
                   modalStep === 'link' ? t('modal.siteUrls') :
                   modalStep === 'youtube' ? t('modal.youtubeUrl') :
                   t('modal.pasteText')}
                </h3>
              </div>
              <button
                onClick={() => { setShowAddModal(false); resetModal(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {modalStep === 'main' && (
                <div className="space-y-6">
                  {/* Intro Text */}
                  <p className="text-sm text-gray-600">
                    {t('modal.intro')}
                  </p>

                  {/* File Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-300'
                    }`}
                  >
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900 mb-1">{t('modal.uploadSources')}</p>
                    <p className="text-xs text-gray-500 mb-4">
                      {t('modal.dragDrop')} <button onClick={() => fileInputRef.current?.click()} className="text-gray-900 underline">{t('modal.selectFile')}</button> {t('modal.toUpload')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('modal.supportedTypes')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      accept=".pdf,.txt,.md,.docx,.mp3,.wav,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                    />
                  </div>

                  {/* Source Options Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Google Drive (Placeholder) */}
                    <button
                      onClick={() => alert('Google Drive integration coming soon')}
                      className="p-4 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-center transition-colors"
                    >
                      <svg className="w-6 h-6 mx-auto mb-2 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.376 11.023L12 5.5l4.624 5.523H7.376zM12 18.5L7.376 12.977h9.248L12 18.5z"/>
                      </svg>
                      <p className="text-xs font-medium text-gray-700">{t('modal.googleDrive')}</p>
                    </button>

                    {/* Link */}
                    <button
                      onClick={() => setModalStep('link')}
                      className="p-4 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-center transition-colors"
                    >
                      <svg className="w-6 h-6 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <p className="text-xs font-medium text-gray-700">{t('modal.site')}</p>
                    </button>

                    {/* YouTube */}
                    <button
                      onClick={() => setModalStep('youtube')}
                      className="p-4 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-center transition-colors"
                    >
                      <svg className="w-6 h-6 mx-auto mb-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <p className="text-xs font-medium text-gray-700">{t('modal.youtube')}</p>
                    </button>

                    {/* Paste Text */}
                    <button
                      onClick={() => {
                        setModalStep('text');
                        setTimeout(() => textInputRef.current?.focus(), 100);
                      }}
                      className="p-4 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-center transition-colors col-span-3"
                    >
                      <svg className="w-6 h-6 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-xs font-medium text-gray-700">{t('modal.pasteText')}</p>
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 'link' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {t('modal.intro')}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('modal.urlsLabel')}
                    </label>
                    <textarea
                      value={linkUrls}
                      onChange={(e) => setLinkUrls(e.target.value)}
                      placeholder={t('modal.urlsPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[120px] font-mono text-sm"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">{t('modal.urlsNotes')}</p>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      <li>{t('modal.urlsNote1')}</li>
                      <li>{t('modal.urlsNote2')}</li>
                      <li>{t('modal.urlsNote3')}</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleAddMultipleLinks}
                    disabled={!linkUrls.trim()}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('modal.insert')}
                  </button>
                </div>
              )}

              {modalStep === 'youtube' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {t('modal.intro')}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('modal.youtubeLabel')}
                    </label>
                    <div className="relative">
                      <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder={t('modal.youtubePlaceholder')}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">{t('modal.urlsNotes')}</p>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      <li>{t('modal.youtubeNote1')}</li>
                      <li>{t('modal.youtubeNote2')}</li>
                      <li>{t('modal.youtubeNote3')}</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleAddYouTube}
                    disabled={!linkUrl.trim()}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('modal.insert')}
                  </button>
                </div>
              )}

              {modalStep === 'text' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {t('modal.intro')}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('modal.textLabel')}
                    </label>
                    <textarea
                      ref={textInputRef}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={t('modal.textPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[200px]"
                    />
                  </div>
                  <button
                    onClick={handleAddText}
                    disabled={!pastedText.trim()}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('modal.insert')}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {t('modal.sourceLimit')}: {sources.length}/{MAX_SOURCES}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
