'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ToastCtx {
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} })

function ToastViewport({ messages }: { messages: Array<{ id: number; msg: string }> }) {
  return (
    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 z-50 pointer-events-none px-4">
      <AnimatePresence>
        {messages.map(({ id, msg }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="text-sm px-4 py-2 rounded-full shadow-lg max-w-[300px] text-center border"
            style={{
              backgroundColor: 'var(--color-bg-soft)',
              color: 'var(--color-text-strong)',
              borderColor: 'var(--color-border-default)',
            }}
          >
            {msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function useToastMessages() {
  const [messages, setMessages] = useState<Array<{ id: number; msg: string }>>([])
  const counter = useRef(0)

  const showToast = useCallback((msg: string) => {
    const id = ++counter.current
    setMessages((prev) => [...prev, { id, msg }])
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

let singletonShowToast: ((msg: string) => void) | null = null

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

export function showToast(msg: string) {
  singletonShowToast?.(msg)
}
