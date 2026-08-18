'use client'

import { ChevronLeft, X } from 'lucide-react'
import type { ReactNode } from 'react'

interface NavBarProps {
  title?: string
  onBack?: () => void
  onClose?: () => void
  right?: ReactNode
}

export function NavBar({ title, onBack, onClose, right }: NavBarProps) {
  return (
    <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] bg-[var(--color-glass-mid)] backdrop-blur-md flex-shrink-0">
      {onBack && (
        <button onClick={onBack} className="-ml-1 mr-3 p-1 text-[var(--color-text-secondary)]">
          <ChevronLeft size={20} />
        </button>
      )}
      <span className="flex-1 text-[15px] font-black text-[var(--color-text-primary)]">{title}</span>
      {right}
      {!right && onClose && (
        <button onClick={onClose} className="p-1 text-[var(--color-text-secondary)]">
          <X size={18} />
        </button>
      )}
    </div>
  )
}

interface StepBarProps {
  current: number
  total?: number
}

export function StepBar({ current, total = 7 }: StepBarProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2 px-4 flex-shrink-0">
      {Array.from({ length: total }).map((_, index) => {
        const stepNum = index + 1
        if (stepNum === current) {
          return <div key={index} className="h-1.5 w-7 rounded-full bg-[var(--color-text-strong)]" />
        }
        if (stepNum < current) {
          return <div key={index} className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-secondary)]" />
        }
        return <div key={index} className="h-1.5 w-1.5 rounded-full bg-[var(--color-border-default)]" />
      })}
    </div>
  )
}
