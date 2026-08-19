'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'loading'

interface ToastCtx {
  showToast: (msg: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} })

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'loading') {
    return (
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
        <Loader2 size={18} className="animate-spin text-white/70" />
      </span>
    )
  }
  return (
    <span
      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: variant === 'success' ? '#22C55E' : '#EF4444' }}
    >
      {variant === 'success' ? (
        <Check size={13} strokeWidth={3} color="#fff" />
      ) : (
        <span className="text-[11px] font-black leading-none text-white">!</span>
      )}
    </span>
  )
}

function ToastViewport({ messages }: { messages: Array<{ id: number; msg: string; variant: ToastVariant }> }) {
  return (
    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 z-[200] pointer-events-none px-4">
      <AnimatePresence>
        {messages.map(({ id, msg, variant }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2.5 text-sm font-semibold px-4 py-3 rounded-full shadow-lg max-w-[320px]"
            style={{ backgroundColor: '#27272B', color: '#fff' }}
          >
            <ToastIcon variant={variant} />
            <span className="truncate">{msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function useToastMessages() {
  const [messages, setMessages] = useState<Array<{ id: number; msg: string; variant: ToastVariant }>>([])
  const counter = useRef(0)

  const showToast = useCallback((msg: string, variant: ToastVariant = 'success') => {
    const id = ++counter.current
    setMessages((prev) => [...prev, { id, msg, variant }])
    setTimeout(() => {
      setMessages((prev) => prev.filter((item) => item.id !== id))
    }, 2000)
  }, [])

  return { messages, showToast }
}

export function ToastProvider({ children }: { children?: ReactNode }) {
  const { messages, showToast } = useToastMessages()

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastViewport messages={messages} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

let singletonShowToast: ((msg: string, variant?: ToastVariant) => void) | null = null

export function ToastSingleton({ children }: { children?: ReactNode }) {
  const { messages, showToast } = useToastMessages()

  useEffect(() => {
    singletonShowToast = showToast
    return () => {
      singletonShowToast = null
    }
  }, [showToast])

  return (
    <>
      {children}
      <ToastViewport messages={messages} />
    </>
  )
}

export function showToast(msg: string, variant?: ToastVariant) {
  singletonShowToast?.(msg, variant)
}
