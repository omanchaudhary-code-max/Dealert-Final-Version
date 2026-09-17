import { create } from 'zustand'

export interface ToastData {
  id?: string
  message: string
  actionUrl?: string
  actionLabel?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

interface ToastStore {
  toast: ToastData | null
  showToast: (data: ToastData) => void
  hideToast: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  showToast: (data) => set({ toast: { id: String(Date.now()), ...data } }),
  hideToast: () => set({ toast: null }),
}))

export function useToast() {
  const store = useToastStore()
  return store
}
