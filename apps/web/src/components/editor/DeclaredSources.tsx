'use client';

import { useState } from 'react';

export interface Source {
  id: string;
  type: 'pdf' | 'link' | 'video' | 'audio' | 'text';
  name: string;
  url?: string;
  file?: File;
  uploaded: boolean;
}

interface DeclaredSourcesProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (id: string) => void;
}

export function DeclaredSources({ sources, onAddSource, onRemoveSource }: DeclaredSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sourceType, setSourceType] = useState<'pdf' | 'link' | 'video' | 'audio' | 'text'>('link');
  const [linkUrl, setLinkUrl] = useState('');
  const [sourceName, setSourceName] = useState('');

  const handleAddLink = () => {
    if (!linkUrl.trim() || !sourceName.trim()) {
      alert('Please provide both name and URL');
      return;
    }

    const newSource: Source = {
      id: Date.now().toString(),
      type: sourceType,
      name: sourceName,
      url: linkUrl,
      uploaded: false,
    };

    onAddSource(newSource);
    setLinkUrl('');
    setSourceName('');
    setShowAddModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.includes('pdf') ? 'pdf' :
                    file.type.includes('video') ? 'video' :
                    file.type.includes('audio') ? 'audio' : 'text';

    const newSource: Source = {
      id: Date.now().toString(),
      type: fileType,
      name: file.name,
      file,
      uploaded: false,
    };

    onAddSource(newSource);
    setShowAddModal(false);
  };

  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'link':
        return '🔗';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📝';
    }
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg bg-white p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Declared Sources
            </h3>
            <p className="text-xs text-gray-500">
              Upload PDFs, links, videos, or audio. AI will use only these as reference.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sources.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {sources.length} source{sources.length !== 1 ? 's' : ''}
              </span>
            )}
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Show
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {/* Sources List */}
            {sources.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">{getSourceIcon(source.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {source.name}
                        </p>
                        {source.url && (
                          <p className="text-xs text-gray-500 truncate">{source.url}</p>
                        )}
                        {source.uploaded && (
                          <span className="text-xs text-green-600">✓ Processed</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveSource(source.id)}
                      className="ml-2 text-gray-400 hover:text-red-600"
                      title="Remove source"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Source Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Source
            </button>
          </div>
        )}
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Source</h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Source Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Type
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as Source['type'])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="link">Link</option>
                  <option value="pdf">PDF File</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="text">Text File</option>
                </select>
              </div>

              {/* Link Input */}
              {sourceType === 'link' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="Source name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </>
              )}

              {/* File Upload */}
              {(sourceType === 'pdf' || sourceType === 'video' || sourceType === 'audio' || sourceType === 'text') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept={
                      sourceType === 'pdf' ? '.pdf' :
                      sourceType === 'video' ? 'video/*' :
                      sourceType === 'audio' ? 'audio/*' :
                      '.txt,.md'
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setLinkUrl('');
                    setSourceName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                {sourceType === 'link' && (
                  <button
                    onClick={handleAddLink}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

