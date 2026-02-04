'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Package,
  Bell,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Icons ────────────────────────────────────────────────────────────────────

const iconMap: Record<ToastType, { icon: typeof CheckCircle; bg: string; color: string; border: string }> = {
  success: { icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-200' },
  error:   { icon: XCircle,     bg: 'bg-red-50',   color: 'text-red-600',   border: 'border-red-200' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-200' },
  info:    { icon: Info,         bg: 'bg-blue-50',  color: 'text-blue-600',  border: 'border-blue-200' },
};

// ── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (options: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = options.duration ?? 4000;
      const newToast: Toast = { ...options, id, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) => addToast({ type: 'success', title, description }),
    [addToast]
  );
  const error = useCallback(
    (title: string, description?: string) => addToast({ type: 'error', title, description, duration: 6000 }),
    [addToast]
  );
  const warning = useCallback(
    (title: string, description?: string) => addToast({ type: 'warning', title, description, duration: 5000 }),
    [addToast]
  );
  const info = useCallback(
    (title: string, description?: string) => addToast({ type: 'info', title, description }),
    [addToast]
  );

  const confirmFn = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({ options, resolve });
      });
    },
    []
  );

  const handleConfirm = useCallback(
    (value: boolean) => {
      if (confirmState) {
        confirmState.resolve(value);
        setConfirmState(null);
      }
    },
    [confirmState]
  );

  return (
    <ToastContext.Provider
      value={{ toast: addToast, success, error, warning, info, confirm: confirmFn }}
    >
      {children}

      {/* ── Toast Container ───────────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const style = iconMap[t.type];
            const Icon = style.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`pointer-events-auto bg-white rounded-xl shadow-lg border ${style.border} overflow-hidden`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className={`shrink-0 h-9 w-9 rounded-lg ${style.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                    {t.description && (
                      <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">{t.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeToast(t.id)}
                    className="shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                {/* Progress bar */}
                {(t.duration ?? 4000) > 0 && (
                  <div className="h-0.5 bg-gray-100">
                    <motion.div
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: (t.duration ?? 4000) / 1000, ease: 'linear' }}
                      className={`h-full ${
                        t.type === 'success' ? 'bg-green-500' :
                        t.type === 'error' ? 'bg-red-500' :
                        t.type === 'warning' ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => handleConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className={`mx-auto mb-4 h-14 w-14 rounded-full flex items-center justify-center ${
                  confirmState.options.variant === 'danger' ? 'bg-red-100' : 'bg-primary-100'
                }`}>
                  <AlertTriangle className={`h-7 w-7 ${
                    confirmState.options.variant === 'danger' ? 'text-red-600' : 'text-primary-600'
                  }`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {confirmState.options.title}
                </h3>
                {confirmState.options.description && (
                  <p className="text-sm text-gray-600 mb-6 whitespace-pre-line">
                    {confirmState.options.description}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(false)}
                    className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {confirmState.options.cancelLabel || 'Annuler'}
                  </button>
                  <button
                    onClick={() => handleConfirm(true)}
                    className={`flex-1 px-5 py-2.5 font-semibold rounded-xl transition-colors ${
                      confirmState.options.variant === 'danger'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {confirmState.options.confirmLabel || 'Confirmer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
