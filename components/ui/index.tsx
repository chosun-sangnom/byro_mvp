'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X } from 'lucide-react'

// ─── Design tokens ───────────────────────────────────────
// primary: #0A0A0A  accent: #E8A000  border: #EBEBEB
// muted: #888  danger: #E53935  kakao: #FEE500
// success: bg #E6F5E6 text #1A7A1A
// info:    bg #E3F2FD text #0D47A1
// warn:    bg #FFF8E6 text #7A5A00

// ─── Toast ───────────────────────────────────────────────
interface ToastCtx {
  showToast: (msg: string) => void
}
const ToastContext = createContext<ToastCtx>({ showToast: () => {} })

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [messages, setMessages] = useState<{ id: number; msg: string }[]>([])
  const counter = useRef(0)

  const showToast = useCallback((msg: string) => {
    const id = ++counter.current
    setMessages((prev) => [...prev, { id, msg }])
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }, 2000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 z-50 pointer-events-none">
        <AnimatePresence>
          {messages.map(({ id, msg }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0A0A0A] text-white text-sm px-4 py-2 rounded-full shadow-lg max-w-[300px] text-center"
            >
              {msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

// Singleton showToast for non-React contexts
let _showToast: ((msg: string) => void) | null = null

export function ToastSingleton({ children }: { children?: React.ReactNode }) {
  const [messages, setMessages] = useState<{ id: number; msg: string }[]>([])
  const counter = useRef(0)

  const showToast = useCallback((msg: string) => {
    const id = ++counter.current
    setMessages((prev) => [...prev, { id, msg }])
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }, 2000)
  }, [])

  useEffect(() => {
    _showToast = showToast
    return () => { _showToast = null }
  }, [showToast])

  return (
    <>
      {children}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 z-50 pointer-events-none px-4">
        <AnimatePresence>
          {messages.map(({ id, msg }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0A0A0A] text-white text-sm px-4 py-2 rounded-full shadow-lg max-w-[300px] text-center"
            >
              {msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

export function showToast(msg: string) {
  _showToast?.(msg)
}

// ─── Button ──────────────────────────────────────────────
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'ghost' | 'kakao' | 'google' | 'naver' | 'danger'
  size?: 'sm' | 'md'
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  style?: React.CSSProperties
}

const BUTTON_VARIANTS: Record<string, string> = {
  primary: 'text-white active:opacity-80',
  outline: 'bg-white border active:opacity-80',
  ghost: 'bg-transparent active:opacity-70',
  kakao: 'bg-[#FEE500] text-[#333] active:opacity-80',
  google: 'bg-white border active:opacity-80',
  naver: 'bg-[#03C75A] text-white active:opacity-80',
  danger: 'bg-white border active:opacity-80',
}

export function Button({
  children, variant = 'primary', size = 'md', fullWidth = true,
  disabled, onClick, className = '', type = 'button', style,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-[var(--radius-md)] font-bold active:scale-[0.97] transition-all duration-100 select-none',
        size === 'md' ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-xs',
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary,
        className,
      ].join(' ')}
      style={{
        backgroundColor:
          variant === 'primary' ? 'var(--color-accent-dark)'
            : variant === 'ghost' ? 'transparent'
              : undefined,
        color:
          variant === 'outline' ? 'var(--color-accent-dark)'
            : variant === 'ghost' ? 'var(--color-text-secondary)'
              : variant === 'google' ? 'var(--color-text-primary)'
                : variant === 'danger' ? 'var(--color-state-danger-text)'
                  : undefined,
        borderColor:
          variant === 'outline' ? 'var(--color-accent-dark)'
            : variant === 'google' ? 'var(--color-border-default)'
              : variant === 'danger' ? 'var(--color-state-danger-text)'
                : undefined,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ─── Chip ────────────────────────────────────────────────
interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  dark?: boolean
}

export function Chip({ label, selected, onClick, dark }: ChipProps) {
  if (dark) {
    return (
      <button
        onClick={onClick}
        className={[
          'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-100 select-none',
          selected
            ? 'bg-white text-[#0A0A0A] border-white'
            : 'bg-transparent text-[#aaa] border-[#444]',
        ].join(' ')}
      >
        {label}
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-100 select-none',
        selected
          ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
          : 'bg-[#f8f8f8] text-[#333] border-[#ddd]',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

// ─── NavBar ──────────────────────────────────────────────
interface NavBarProps {
  title?: string
  onBack?: () => void
  onClose?: () => void
  right?: React.ReactNode
}

export function NavBar({ title, onBack, onClose, right }: NavBarProps) {
  return (
    <div className="flex items-center px-4 h-12 border-b border-[#EBEBEB] bg-white flex-shrink-0">
      {onBack && (
        <button onClick={onBack} className="mr-2 p-1 -ml-1 text-[#555]">
          <ChevronLeft size={20} />
        </button>
      )}
      {title && <span className="text-sm font-bold flex-1">{title}</span>}
      {!title && <div className="flex-1" />}
      {right && <div className="ml-auto">{right}</div>}
      {onClose && !right && (
        <button onClick={onClose} className="ml-auto p-1 text-[#555]">
          <X size={18} />
        </button>
      )}
    </div>
  )
}

// ─── StepBar ─────────────────────────────────────────────
interface StepBarProps {
  current: number   // 1-based
  total?: number
}

export function StepBar({ current, total = 7 }: StepBarProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2 px-4 flex-shrink-0">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1
        if (stepNum === current) {
          return <div key={i} className="h-1.5 w-7 rounded-full bg-[#0A0A0A]" />
        } else if (stepNum < current) {
          return <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#555]" />
        } else {
          return <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#ddd]" />
        }
      })}
    </div>
  )
}

// ─── BottomSheet ─────────────────────────────────────────
interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  dark?: boolean
}

export function BottomSheet({ open, onClose, children, dark }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/45"
            onClick={onClose}
          />
          <div className="absolute inset-x-0 bottom-0 z-50 px-3 sm:px-4" onClick={(e) => e.stopPropagation()}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={[
                'mx-auto w-full max-w-[430px] rounded-t-2xl max-h-[80dvh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),16px)]',
                dark ? 'bg-[#1a1a1a]' : 'bg-white',
              ].join(' ')}
            >
              <div className={[
                'w-8 h-1 rounded-full mx-auto mt-3 mb-2',
                dark ? 'bg-[#555]' : 'bg-[#ddd]',
              ].join(' ')} />
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

interface YearPickerSheetProps {
  open: boolean
  onClose: () => void
  title: string
  value?: string
  options: string[]
  onSelect: (value: string) => void
}

export function YearPickerSheet({
  open, onClose, title, value, options, onSelect,
}: YearPickerSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="mb-4 text-[18px] font-black text-[var(--color-text-strong)]">{title}</div>
        <div className="max-h-[44dvh] overflow-y-auto rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] p-2">
          <div className="space-y-1">
            {options.map((option) => {
              const selected = value === option
              return (
                <button
                  key={option}
                  onClick={() => {
                    onSelect(option)
                    onClose()
                  }}
                  className="flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left"
                  style={{
                    backgroundColor: selected ? 'var(--color-accent-dark)' : 'transparent',
                    color: selected ? '#fff' : 'var(--color-text-primary)',
                  }}
                >
                  <span className="text-sm font-semibold">{option}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

// ─── Modal ───────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/45"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="relative bg-white rounded-2xl p-5 w-[260px] z-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── CheckRow ────────────────────────────────────────────
interface CheckRowProps {
  label: string
  sublabel?: string
  checked: boolean
  onToggle: () => void
  onDetail?: () => void
}

export function CheckRow({ label, sublabel, checked, onToggle, onDetail }: CheckRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <button
        onClick={onToggle}
        className={[
          'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all',
          checked ? 'bg-[#0A0A0A] border-[#0A0A0A]' : 'bg-white border-[#ccc]',
        ].join(' ')}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="flex-1">
        <span className="text-sm text-[#333]">{label}</span>
        {sublabel && <div className="text-xs text-[#888]">{sublabel}</div>}
      </div>
      {onDetail && (
        <button onClick={onDetail} className="text-[#aaa] text-sm">›</button>
      )}
    </div>
  )
}

// ─── ProgressBar ─────────────────────────────────────────
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#0A0A0A] rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ─── InfoBox ─────────────────────────────────────────────
interface InfoBoxProps {
  children: React.ReactNode
  variant?: 'info' | 'warn' | 'success'
}

const INFO_STYLES: Record<string, string> = {
  info: 'bg-[#E3F2FD] border-[#90CAF9] text-[#0D47A1]',
  warn: 'bg-[#FFF8E6] border-[#FFD54F] text-[#7A5A00]',
  success: 'bg-[#E6F5E6] border-[#A5D6A7] text-[#1A7A1A]',
}

export function InfoBox({ children, variant = 'info' }: InfoBoxProps) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs ${INFO_STYLES[variant]}`}>
      {children}
    </div>
  )
}

// ─── TextArea ────────────────────────────────────────────
interface TextAreaProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
  rows?: number
  dark?: boolean
}

export function TextArea({ value, onChange, placeholder, maxLength, rows = 4, dark }: TextAreaProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={[
          'w-full rounded-xl border px-3 py-2.5 text-sm resize-none outline-none transition-colors',
          dark
            ? 'bg-[#2a2a2a] border-[#444] text-white placeholder:text-[#666] focus:border-[#888]'
            : 'bg-[#fafafa] border-[#ddd] text-[#333] placeholder:text-[#aaa] focus:border-[#0A0A0A]',
        ].join(' ')}
      />
      {maxLength && (
        <div className={`text-right text-xs mt-1 ${dark ? 'text-[#666]' : 'text-[#aaa]'}`}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────
export function Divider({ thick }: { thick?: boolean }) {
  if (thick) return <div className="h-2 bg-[#f0f0f0] -mx-4 my-3" />
  return <div className="h-px bg-[#EBEBEB] my-3" />
}

// ─── Avatar ──────────────────────────────────────────────
export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const char = name.charAt(0)
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-base'
  return (
    <div className={`${sizeClass} rounded-full bg-[#e0e0e0] flex items-center justify-center font-bold text-[#555] flex-shrink-0`}>
      {char}
    </div>
  )
}

// ─── AiBounce (loading dots) ─────────────────────────────
export function AiBounce() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-[#0A0A0A]"
          style={{
            animation: `bounceDot 1s ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
