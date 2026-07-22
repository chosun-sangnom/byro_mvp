'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { AdminRole } from '@/types/admin'

const ROLE_RANK: Record<AdminRole, number> = { viewer: 0, operator: 1, admin: 2, owner: 3 }

export function hasRole(current: AdminRole | undefined, required: AdminRole) {
  if (!current) return false
  return ROLE_RANK[current] >= ROLE_RANK[required]
}

export function AdminCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border-default)', boxShadow: 'var(--shadow-card)' }}
    >
      {children}
    </div>
  )
}

export function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[18px] font-black tracking-tight" style={{ color: 'var(--color-text-strong)' }}>
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      )}
    </div>
  )
}

type BadgeTone = 'success' | 'info' | 'danger' | 'warn' | 'neutral'

const BADGE_TONES: Record<BadgeTone, { bg: string; text: string }> = {
  success: { bg: 'var(--color-state-success-bg)', text: 'var(--color-state-success-text)' },
  info: { bg: 'var(--color-state-info-bg)', text: 'var(--color-state-info-text)' },
  danger: { bg: 'var(--color-state-danger-bg)', text: 'var(--color-state-danger-text)' },
  warn: { bg: 'var(--color-state-warn-bg)', text: 'var(--color-state-warn-text)' },
  neutral: { bg: 'var(--color-bg-soft)', text: 'var(--color-text-secondary)' },
}

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const t = BADGE_TONES[tone]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold whitespace-nowrap"
      style={{ backgroundColor: t.bg, color: t.text }}
    >
      {label}
    </span>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </div>
      {description && (
        <div className="mt-1.5 text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {description}
        </div>
      )}
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
      style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-surface)' }}
    >
      <Search size={16} color="var(--color-text-tertiary)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[14px] outline-none"
        style={{ color: 'var(--color-text-primary)' }}
      />
    </div>
  )
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th
      className="px-3 py-2.5 text-left text-[12px] font-bold whitespace-nowrap"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      {children}
    </th>
  )
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-3 text-[13px] align-middle ${className}`} style={{ color: 'var(--color-text-primary)' }}>
      {children}
    </td>
  )
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--color-border-default)' }}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-0 h-full w-full max-w-[440px] overflow-y-auto border-l"
            style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border-default)' }}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4"
              style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border-soft)' }}
            >
              <h3 className="text-[16px] font-black" style={{ color: 'var(--color-text-strong)' }}>
                {title}
              </h3>
              <button onClick={onClose} className="icon-button">
                <X size={18} color="var(--color-text-secondary)" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40"
      style={{ backgroundColor: checked ? 'var(--color-accent-dark)' : 'var(--color-bg-muted)' }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

const ROLE_LOCK_LABEL: Record<AdminRole, string> = { viewer: '뷰어', operator: '운영', admin: '관리자', owner: '소유자' }

export function RoleLockNotice({ required }: { required: AdminRole }) {
  const label = ROLE_LOCK_LABEL[required]
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
      style={{ backgroundColor: 'var(--color-bg-soft)', color: 'var(--color-text-tertiary)' }}
    >
      <Lock size={12} />
      {label} 권한 이상 필요
    </div>
  )
}
