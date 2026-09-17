'use client'

import Link from 'next/link'
import { Sparkles, X, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useToastStore } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

export function ToastContainer() {
  const { toast, hideToast } = useToastStore()

  if (!toast) return null

  const isWarning = toast.variant === 'warning' || toast.message.includes('Free tier limit')

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] p-4 rounded-xl bg-card border border-primary/30 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/30 mt-0.5">
          {isWarning ? <Sparkles className="h-4 w-4" /> : <Info className="h-4 w-4" />}
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground leading-relaxed">
            {toast.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {toast.actionUrl && (
          <Link href={toast.actionUrl} onClick={hideToast}>
            <Button size="sm" variant="primary" className="h-7 text-xs font-bold gap-1 px-3 shadow-xs">
              <Sparkles className="h-3 w-3" />
              <span>{toast.actionLabel || 'Upgrade to Pro'}</span>
            </Button>
          </Link>
        )}
        <button
          onClick={hideToast}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
