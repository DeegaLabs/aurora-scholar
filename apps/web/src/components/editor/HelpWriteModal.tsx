'use client';

import { useState } from 'react';
import { aiAssistantChat } from '@/lib/api/aiAssistant';

interface HelpWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  declaredIntuition: string;
}

export function HelpWriteModal({ isOpen, onClose, content, declaredIntuition }: HelpWriteModalProps) {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const question = [
        'Preciso de ajuda para escrever (sem você escrever o texto por mim).',
        declaredIntuition ? `Minha intenção declarada é: "${declaredIntuition}".` : null,
        `Pedido: ${description}`,
        'Responda apenas com orientação: estrutura, passos, perguntas-guia e checklist.',
      ]
        .filter(Boolean)
        .join('\n');

      const data = await aiAssistantChat({
        question,
        text: content || '',
      });

      setResult(data.answer);
    } catch (e: any) {
      setError(e?.message || 'Falha ao consultar a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Me ajude a escrever</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Descreva o que você quer escrever..."
            className="w-full px-4 py-3 rounded-md focus:outline-none min-h-[120px] resize-none"
            autoFocus
          />

          {error && (
            <div className="mt-4 border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-900 whitespace-pre-wrap">
              {result}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={!description.trim() || isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analisando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}
