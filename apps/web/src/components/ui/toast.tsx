'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

export type ToastInput = {
  type?: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
};

type ToastItem = Required<Pick<ToastInput, 'message'>> & {
  id: string;
  type: ToastType;
  title?: string;
  durationMs: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function colorClasses(type: ToastType) {
  switch (type) {
    case 'success':
      return { bar: 'bg-green-600', bg: 'bg-white', border: 'border-green-200', title: 'text-green-900' };
    case 'error':
      return { bar: 'bg-red-600', bg: 'bg-white', border: 'border-red-200', title: 'text-red-900' };
    case 'info':
    default:
      return { bar: 'bg-gray-900', bg: 'bg-white', border: 'border-gray-200', title: 'text-gray-900' };
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const item: ToastItem = {
        id,
        type: input.type ?? 'info',
        title: input.title,
        message: input.message,
        durationMs: input.durationMs ?? 4500,
      };

      setItems((prev) => [item, ...prev].slice(0, 5));
      timers.current[id] = window.setTimeout(() => remove(id), item.durationMs);
    },
    [remove]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {items.map((t) => {
          const c = colorClasses(t.type);
          return (
            <div
              key={t.id}
              className={`relative overflow-hidden rounded-lg border ${c.border} ${c.bg} shadow-lg`}
              role="status"
              aria-live="polite"
            >
              <div className={`h-1 w-full ${c.bar}`} />
              <div className="p-3 pr-10">
                {t.title ? <div className={`text-sm font-semibold ${c.title}`}>{t.title}</div> : null}
                <div className="mt-0.5 text-sm text-gray-700 whitespace-pre-wrap">{t.message}</div>
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                aria-label="Fechar"
              >
                Fechar
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}



