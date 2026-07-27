import { showToast } from "@/components/shared/MinimalToast"

import { useCallback, useMemo } from "react";

// Adapter for backwards compatibility with old useToast hook
function useToast() {
  const toastFunc = useCallback((props: any) => {
    const message = props.description || props.title || 'Action completed'
    const type = props.variant === 'destructive' ? 'error' : 'success'
    showToast(message, type)
    return { id: '', dismiss: () => {}, update: () => {} }
  }, []);

  const dismissFunc = useCallback(() => {}, []);

  return useMemo(() => ({
    toasts: [],
    toast: toastFunc,
    dismiss: dismissFunc,
  }), [toastFunc, dismissFunc]);
}

// Direct toast function for backwards compatibility
function toast(props: any) {
  const message = props.description || props.title || 'Action completed'
  const type = props.variant === 'destructive' ? 'error' : 'success'
  showToast(message, type)
  return { id: '', dismiss: () => {}, update: () => {} }
}

export { useToast, toast, showToast }
