import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let toastId = 0;
const listeners: ((toast: Toast) => void)[] = [];

export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const id = `toast-${toastId++}`;
  const toast: Toast = { id, message, type };
  listeners.forEach(listener => listener(toast));
  return id;
};

export function MinimalToastContainer() {
  const [currentToast, setCurrentToast] = useState<Toast | null>(null);

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      setCurrentToast(toast);
      setTimeout(() => {
        setCurrentToast(null);
      }, 3000);
    };

    listeners.push(handleToast);
    return () => {
      listeners.splice(listeners.indexOf(handleToast), 1);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <AnimatePresence>
        {currentToast && (
          <motion.div
            key={currentToast.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap"
          >
            {currentToast.type === 'success' && <span>✓</span>}
            {currentToast.type === 'error' && <span>✕</span>}
            {currentToast.type === 'warning' && <span>⚠</span>}
            {currentToast.type === 'info' && <span>ℹ</span>}
            <span>{currentToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
