'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ToastCtx {
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} })

function ToastViewport({ messages }: { messages: Array<{ id: number; msg: string }> }) {
  return (
    <div className="absolute bottom-5 left-0 right-0 z-50 flex flex-col items-center gap-2 px-3.5 pointer-events-none">
      <AnimatePresence>
        {messages.map(({ id, msg }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="flex min-h-8 w-full max-w-[220px] items-center gap-2 rounded-full px-3 py-2 text-left text-[10px] font-medium leading-[14px] shadow-lg"
            style={{
              backgroundColor: '#303030',
              color: '#FFFFFF',
            }}
          >
            <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-[#26C65A]">
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                <path d="M1 3L3 5L7 1" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="min-w-0">{msg}</span>
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
