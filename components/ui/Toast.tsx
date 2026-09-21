'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Info, X } from 'lucide-react';

type Tone = 'success' | 'info';

interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastContextValue {
  notify: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_AFTER = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('common');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: Tone = 'success') => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), DISMISS_AFTER);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Announced politely so a screen reader hears the confirmation without
          losing the user's place. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-5 sm:items-end sm:px-6 sm:pb-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="border-border bg-charcoal text-bg shadow-lift pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3"
            >
              <span
                aria-hidden="true"
                className={
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ' +
                  (toast.tone === 'success' ? 'bg-success' : 'bg-accent')
                }
              >
                {toast.tone === 'success' ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  <Info className="size-3" strokeWidth={3} />
                )}
              </span>

              <p className="flex-1 text-sm leading-snug">{toast.message}</p>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="text-bg/60 hover:text-bg -m-1 rounded p-1 transition-colors"
                aria-label={t('closeNotification')}
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }
  return context;
}
