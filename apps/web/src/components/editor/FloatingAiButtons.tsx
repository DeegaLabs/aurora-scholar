'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';

interface FloatingAiButtonsProps {
  editor: Editor | null;
  enabled?: boolean;
  onHelpWrite?: () => void;
  onSuggestStructure?: () => void;
  onCheckCoherence?: () => void;
  onMoreOptions?: () => void;
}

export function FloatingAiButtons({
  editor,
  enabled = true,
  onHelpWrite,
  onSuggestStructure,
  onCheckCoherence,
  onMoreOptions,
}: FloatingAiButtonsProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  if (!enabled || !editor) {
    return null;
  }

  return (
    <div className="absolute right-4 top-1/2 z-50 flex flex-col gap-3 pointer-events-none" style={{ transform: 'translateY(-50%)' }}>
      {/* Help Write Button */}
      {onHelpWrite && (
        <div className="relative group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHelpWrite();
            }}
            onMouseEnter={() => setHoveredButton('help-write')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors pointer-events-auto"
            title="Help me write"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {/* Tooltip */}
          {hoveredButton === 'help-write' && (
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none">
              Help me write
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          )}
        </div>
      )}

      {/* Suggest Structure Button */}
      {onSuggestStructure && (
        <div className="relative group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSuggestStructure();
            }}
            onMouseEnter={() => setHoveredButton('suggest-structure')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors pointer-events-auto"
            title="Suggest structure"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
          </button>
          {/* Tooltip */}
          {hoveredButton === 'suggest-structure' && (
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none">
              Suggest structure
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          )}
        </div>
      )}

      {/* Check Coherence Button */}
      {onCheckCoherence && (
        <div className="relative group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckCoherence();
            }}
            onMouseEnter={() => setHoveredButton('check-coherence')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors pointer-events-auto"
            title="Check coherence"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {/* Tooltip */}
          {hoveredButton === 'check-coherence' && (
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none">
              Check coherence
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          )}
        </div>
      )}

      {/* More Options Button */}
      {onMoreOptions && (
        <div className="relative group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoreOptions();
            }}
            onMouseEnter={() => setHoveredButton('more-options')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors pointer-events-auto"
            title="More options"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {/* Tooltip */}
          {hoveredButton === 'more-options' && (
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none">
              More options
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
