'use client';

import { useTranslations } from 'next-intl';

interface EthicalLayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  declaredIntuition: string;
  onDeclaredIntuitionChange: (value: string) => void;
}

export function EthicalLayersModal({
  isOpen,
  onClose,
  declaredIntuition,
  onDeclaredIntuitionChange,
}: EthicalLayersModalProps) {
  const t = useTranslations('editor.studio.ethicalLayers');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Layer 1: Declared Intuition */}
          <div>
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('layer1.title')}</h4>
              <p className="text-xs text-gray-500">
                {t('layer1.description')}
              </p>
            </div>
            <textarea
              value={declaredIntuition}
              onChange={(e) => onDeclaredIntuitionChange(e.target.value)}
              placeholder={t('layer1.placeholder')}
              className="w-full min-h-[150px] px-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              maxLength={500}
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {t('layer1.onChainNote')}
              </p>
              <span className="text-xs text-gray-400">
                {declaredIntuition.length} / 500 {t('layer1.characters')}
              </span>
            </div>
          </div>

          {/* Layer 2: Linguistic Mediation */}
          <div className="pt-4 border-t border-gray-200">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('layer2.title')}</h4>
              <p className="text-xs text-gray-500">
                {t('layer2.description')}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
              <p className="text-sm text-gray-600">
                {t('layer2.autoApplied')}
              </p>
            </div>
          </div>

          {/* Layer 3: Coherence Monitoring */}
          <div className="pt-4 border-t border-gray-200">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('layer3.title')}</h4>
              <p className="text-xs text-gray-500">
                {t('layer3.description')}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
              <p className="text-sm text-gray-600">
                {t('layer3.howToUse')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </div>
  );
}


