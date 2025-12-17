'use client';

import { useState, useEffect } from 'react';
import { aiAssistantAnalyze } from '@/lib/api/aiAssistant';

interface SuggestStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export function SuggestStructureModal({ isOpen, onClose, content }: SuggestStructureModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    if (!content.trim()) {
      setSuggestions(['Comece a escrever para receber sugestões de estrutura.']);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const data = await aiAssistantAnalyze({ text: content });
        const s = (data.suggestions || []).map((x) => x.text).filter(Boolean);
        if (!cancelled) setSuggestions(s.length ? s : ['Nenhuma sugestão encontrada.']);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Falha ao analisar estrutura.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, content]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Sugerir Estrutura</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Analisando estrutura...</p>
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

