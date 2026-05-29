import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastItem = ToastInput & {
  id: string
  open: boolean
}

type ToastContextValue = {
  toast: (toast: ToastInput) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-white text-emerald-950 dark:border-emerald-900/70 dark:bg-card dark:text-emerald-50',
  error: 'border-red-200 bg-white text-red-950 dark:border-red-900/70 dark:bg-card dark:text-red-50',
  info: 'border-border bg-white text-foreground dark:bg-card',
}

const iconStyles: Record<ToastVariant, string> = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-primary',
}

const ToastIcon: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = React.useCallback((input: ToastInput) => {
    const id = crypto.randomUUID()
    setToasts((current) => [
      ...current.slice(-3),
      {
        variant: 'info',
        duration: 4000,
        ...input,
        id,
        open: true,
      },
    ])
  }, [])

  const value = React.useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast({ title, description, variant: 'success' }),
      error: (title, description) => toast({ title, description, variant: 'error', duration: 6000 }),
      info: (title, description) => toast({ title, description, variant: 'info' }),
    }),
    [toast],
  )

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((item) => {
          const variant = item.variant ?? 'info'
          const Icon = ToastIcon[variant]

          return (
            <ToastPrimitive.Root
              key={item.id}
              open={item.open}
              duration={item.duration}
              onOpenChange={(open) => {
                if (!open) removeToast(item.id)
              }}
              className={cn(
                'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 pr-10 shadow-lg transition-all',
                'data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full data-[state=open]:fade-in-0',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
                variantStyles[variant],
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconStyles[variant])} />
              <div className="grid gap-1">
                <ToastPrimitive.Title className="text-sm font-semibold leading-none">
                  {item.title}
                </ToastPrimitive.Title>
                {item.description ? (
                  <ToastPrimitive.Description className="text-sm leading-snug text-muted-foreground">
                    {item.description}
                  </ToastPrimitive.Description>
                ) : null}
              </div>
              <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
                <X className="h-4 w-4" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          )
        })}
        <ToastPrimitive.Viewport className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 outline-none sm:right-5 sm:top-5" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
