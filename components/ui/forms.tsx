'use client'

import type { ReactNode } from 'react'

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
          checked
            ? 'border-[var(--color-accent-dark)]'
            : 'bg-transparent border-[var(--color-border-default)]',
        ].join(' ')}
        style={checked ? { backgroundColor: 'var(--color-accent-dark)' } : undefined}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="flex-1">
        <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
        {sublabel && <div className="text-xs text-[var(--color-text-tertiary)]">{sublabel}</div>}
      </div>
      {onDetail && (
        <button onClick={onDetail} className="text-[var(--color-text-tertiary)] text-sm">›</button>
      )}
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
      <div
        className="h-full bg-[var(--color-accent-dark)] rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

interface InfoBoxProps {
  children: ReactNode
  variant?: 'info' | 'warn' | 'success'
}

const INFO_STYLES: Record<string, string> = {
  info: 'border-[var(--color-border-default)] text-[var(--color-state-info-text)]',
  warn: 'border-[var(--color-border-default)] text-[var(--color-text-secondary)]',
  success: 'border-[var(--color-border-default)] text-[var(--color-state-success-text)]',
}

export function InfoBox({ children, variant = 'info' }: InfoBoxProps) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-xs bg-[var(--color-bg-soft)] ${INFO_STYLES[variant]}`}>
      {children}
    </div>
  )
}

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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={[
          'w-full rounded-xl border px-3 py-2.5 text-sm resize-none outline-none transition-colors',
          dark
            ? 'bg-[var(--color-bg-soft)] border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent-dark)]'
            : 'bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent-dark)]',
        ].join(' ')}
      />
      {maxLength && (
        <div className={`text-right text-xs mt-1 ${dark ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'}`}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  )
}
