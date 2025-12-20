'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { aiAssistantAnalyze } from '@/lib/api/aiAssistant';
import { EthicalLayersModal } from './EthicalLayersModal';

interface GenerativeCardProps {
  title: string;
  icon: React.ReactNode;
  onGenerate: () => void;
  isLoading: boolean;
  result: string | null;
  error: string | null;
}

function GenerativeCard({ title, icon, onGenerate, isLoading, result, error }: GenerativeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (result || error) {
      setIsExpanded(true);
    }
  }, [result, error]);

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header - Clickable to generate */}
      <button
        onClick={() => {
          if (!isExpanded && !isLoading) {
            onGenerate();
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
        disabled={isLoading}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <div className="text-gray-600">{icon}</div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {(result || error) && (
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {/* Generated Content */}
      {(isExpanded && (result || error)) && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{result}</div>
          )}
        </div>
      )}
    </div>
  );
}

interface ExpandableCardProps {
  title: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

function ExpandableCard({ title, icon, defaultExpanded = false, children }: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <div className="text-gray-600">{icon}</div>}
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

interface AiGuidancePanelProps {
  content: string;
  declaredIntuition: string;
  onDeclaredIntuitionChange?: (value: string) => void;
  onOpenChat?: () => void;
  sources?: unknown[];
}

export function AiGuidancePanel({ 
  content, 
  declaredIntuition, 
  onDeclaredIntuitionChange, 
  onOpenChat,
  sources,
}: AiGuidancePanelProps) {
  const t = useTranslations('editor.studio');
  const locale = useLocale();
  const [suggestStructureLoading, setSuggestStructureLoading] = useState(false);
  const [suggestStructureResult, setSuggestStructureResult] = useState<string | null>(null);
  const [suggestStructureError, setSuggestStructureError] = useState<string | null>(null);

  const [checkCoherenceLoading, setCheckCoherenceLoading] = useState(false);
  const [checkCoherenceResult, setCheckCoherenceResult] = useState<string | null>(null);
  const [checkCoherenceError, setCheckCoherenceError] = useState<string | null>(null);
  const [isEthicalLayersModalOpen, setIsEthicalLayersModalOpen] = useState(false);

  const handleSuggestStructure = async () => {
    if (!content.trim()) {
      setSuggestStructureResult(t('suggestStructure.emptyContent'));
      return;
    }

    setSuggestStructureLoading(true);
    setSuggestStructureError(null);
    setSuggestStructureResult(null);

    try {
      const data = await aiAssistantAnalyze({ text: content, sources, locale });
      // Filter for structure suggestions first, then fallback to all suggestions
      const structureSuggestions = (data.suggestions || [])
        .filter((x: any) => x.type === 'structure')
        .map((x: any) => x.text)
        .filter(Boolean);
      
      // If no structure-specific suggestions, use all suggestions
      const allSuggestions = structureSuggestions.length > 0 
        ? structureSuggestions 
        : (data.suggestions || []).map((x: any) => x.text).filter(Boolean);
      
      // If still no suggestions, check warnings or provide helpful message
      if (allSuggestions.length === 0) {
        const warnings = (data.warnings || []).filter(Boolean);
        const alerts = (data.authenticityAlerts || []).filter(Boolean);
        
        if (warnings.length > 0 || alerts.length > 0) {
          const messages = [...warnings, ...alerts].join('\n\n');
          setSuggestStructureResult(`⚠️ ${messages}\n\n${t('suggestStructure.noSuggestions')}`);
        } else {
          // Provide a helpful message about what structure suggestions should include
          setSuggestStructureResult(
            `📝 ${t('suggestStructure.noSuggestions')}\n\n` +
            `Dica: Adicione mais conteúdo ao seu texto para receber sugestões de estrutura. ` +
            `Sugestões de estrutura incluem: organização de seções, ordem de argumentos, ` +
            `transições entre parágrafos e hierarquia de ideias.`
          );
        }
      } else {
        setSuggestStructureResult(allSuggestions.join('\n\n'));
      }
    } catch (e: any) {
      setSuggestStructureError(e?.message || t('suggestStructure.error'));
    } finally {
      setSuggestStructureLoading(false);
    }
  };

  const handleCheckCoherence = async () => {
    if (!declaredIntuition.trim()) {
      setCheckCoherenceResult(t('checkCoherence.noIntuition'));
      return;
    }

    if (!content.trim()) {
      setCheckCoherenceResult(t('checkCoherence.noContent'));
      return;
    }

    setCheckCoherenceLoading(true);
    setCheckCoherenceError(null);
    setCheckCoherenceResult(null);

    try {
      const data = await aiAssistantAnalyze({ text: content, sources, locale });
      const alerts = (data.suggestions || []).map((x: any) => x.text).filter(Boolean);
      setCheckCoherenceResult(
        alerts.length 
          ? `${t('checkCoherence.resultPrefix')}\n\n${alerts.join('\n\n')}`
          : t('checkCoherence.noAlerts')
      );
    } catch (e: any) {
      setCheckCoherenceError(e?.message || t('checkCoherence.error'));
    } finally {
      setCheckCoherenceLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Chat Card - Opens Modal */}
        <ExpandableCard
          title={t('chat.title')}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          defaultExpanded={false}
        >
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              {t('chat.description')}
            </p>
            <button
              onClick={onOpenChat}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
            >
              {t('chat.openChat')}
            </button>
          </div>
        </ExpandableCard>

        {/* Suggest Structure Card - Generates below */}
        <GenerativeCard
          title={t('suggestStructure.title')}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
          }
          onGenerate={handleSuggestStructure}
          isLoading={suggestStructureLoading}
          result={suggestStructureResult}
          error={suggestStructureError}
        />

        {/* Check Coherence Card - Generates below */}
        <GenerativeCard
          title={t('checkCoherence.title')}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onGenerate={handleCheckCoherence}
          isLoading={checkCoherenceLoading}
          result={checkCoherenceResult}
          error={checkCoherenceError}
        />

        {/* Ethical Layers Card - Opens Modal */}
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
          <button
            onClick={() => setIsEthicalLayersModalOpen(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h4 className="text-sm font-semibold text-gray-900">{t('ethicalLayers.title')}</h4>
            </div>
            <div className="flex items-center gap-2">
              {declaredIntuition && (
                <span className="text-xs text-gray-500">
                  {declaredIntuition.length} / 500
                </span>
              )}
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Ethical Layers Modal */}
      <EthicalLayersModal
        isOpen={isEthicalLayersModalOpen}
        onClose={() => setIsEthicalLayersModalOpen(false)}
        declaredIntuition={declaredIntuition}
        onDeclaredIntuitionChange={(value) => onDeclaredIntuitionChange?.(value)}
      />
    </div>
  );
}

