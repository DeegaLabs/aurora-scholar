'use client';

interface RefinementMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAction?: (action: string) => void;
}

export function RefinementMenu({ isOpen, onClose, onAction }: RefinementMenuProps) {

  if (!isOpen) return null;

  const actions = [
    { id: 'shorten', label: 'Suggest shortening', icon: 'X' },
    { id: 'detail', label: 'Suggest detailing', icon: '↔' },
    { id: 'formal', label: 'Suggest more formal tone', icon: '💼' },
    { id: 'informal', label: 'Suggest more informal tone', icon: '👕' },
    { id: 'bullets', label: 'Suggest bullet points', icon: '•' },
    { id: 'summarize', label: 'Suggest summary', icon: '⏱' },
  ];

  const handleAction = (actionId: string) => {
    if (onAction) {
      onAction(actionId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Refinement Options</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            Select text in the editor, then choose a refinement option. I will suggest improvements - you decide what to apply.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

