'use client';

import { useState, useEffect } from 'react';
import { aiAssistantAnalyze } from '@/lib/api/aiAssistant';

interface CheckCoherenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  declaredIntuition: string;
}

export function CheckCoherenceModal({ isOpen, onClose, content, declaredIntuition }: CheckCoherenceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ aligned: boolean; alerts: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setResults(null);

    const hasIntuition = declaredIntuition.trim().length > 0;
    const hasContent = content.trim().length > 0;

    if (!hasIntuition) {
      setResults({
        aligned: false,
        alerts: ['Nenhuma intenção declarada encontrada. Preencha no painel “Ethical Layers”.'],
      });
      return;
    }

    if (!hasContent) {
      setResults({
        aligned: false,
        alerts: ['Nenhum conteúdo encontrado. Comece a escrever para verificar coerência.'],
      });
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        // O backend ainda não tem um endpoint dedicado de coerência.
        // Por enquanto, usamos /analyze e apresentamos as sugestões como alertas.
        const data = await aiAssistantAnalyze({ text: content });
        const alerts = (data.suggestions || []).map((x) => x.text).filter(Boolean);
        if (!cancelled) {
          setResults({
            aligned: true,
            alerts: alerts.length ? alerts : ['Nenhum alerta encontrado.'],
          });
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Falha ao checar coerência.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, content, declaredIntuition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Checagem de Coerência</h3>
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
              <p className="text-sm text-gray-600">Checando coerência...</p>
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          ) : results ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${results.aligned ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {results.aligned ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <h4 className={`text-sm font-semibold ${results.aligned ? 'text-green-900' : 'text-yellow-900'}`}>
                    {results.aligned ? 'Coerente' : 'Atenção necessária'}
                  </h4>
                </div>
              </div>
              <div className="space-y-2">
                {results.alerts.map((alert, index) => (
                  <div key={index} className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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

