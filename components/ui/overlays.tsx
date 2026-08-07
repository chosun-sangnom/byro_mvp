'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useByroStore } from '@/store/useByroStore'
import { useAdminStore } from '@/store/useAdminStore'
import type { TicketCategory } from '@/types/admin'
import { Button } from './buttons'
import { TextArea } from './forms'
import { showToast } from './toast'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
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
          <div className="absolute inset-x-0 bottom-0 z-50 px-3 sm:px-4" onClick={(event) => event.stopPropagation()}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="mx-auto w-full max-w-[430px] rounded-t-2xl max-h-[80dvh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),16px)] border-t border-x"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-default)',
              }}
            >
              <div className="w-8 h-1 rounded-full mx-auto mt-3 mb-2 bg-[var(--color-border-default)]" />
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
  open,
  onClose,
  title,
  value,
  options,
  onSelect,
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
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
                  style={{
                    backgroundColor: selected ? 'var(--color-accent-dark)' : 'transparent',
                    color: selected ? '#ffffff' : 'var(--color-text-primary)',
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

// ─── ActionMenu ───────────────────────────────────────────────────────────────
// … 버튼 근처에 뜨는 작은 플로팅 메뉴.
// 부모에 `position: relative` 필요. align으로 좌/우 정렬 제어.

interface ActionMenuProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  align?: 'right' | 'left'
}

export function ActionMenu({ open, onClose, children, align = 'right' }: ActionMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={`absolute z-50 top-full mt-1.5 min-w-[160px] overflow-hidden rounded-2xl border ${align === 'right' ? 'right-0' : 'left-0'}`}
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border-default)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
              transformOrigin: align === 'right' ? 'top right' : 'top left',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ActionMenuItemProps {
  label: string
  onClick: () => void
  danger?: boolean
}

export function ActionMenuItem({ label, onClick, danger }: ActionMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-4 py-3 text-[14px] font-semibold text-left transition-colors active:bg-[var(--color-bg-soft)] border-b last:border-b-0"
      style={{
        color: danger ? 'var(--color-state-danger-text)' : 'var(--color-text-primary)',
        borderColor: 'var(--color-border-soft)',
      }}
    >
      {label}
    </button>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
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
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl p-5 w-[272px] z-10 border"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border-default)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const INQUIRY_CATEGORIES: TicketCategory[] = ['계정', '결제', '신고', '기타']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface InquirySheetProps {
  open: boolean
  onClose: () => void
}

export function InquirySheet({ open, onClose }: InquirySheetProps) {
  const user = useByroStore((s) => s.user)
  const isLoggedIn = useByroStore((s) => s.isLoggedIn)
  const addTicket = useAdminStore((s) => s.addTicket)

  const [category, setCategory] = useState<TicketCategory | null>(null)
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const valid = category !== null && EMAIL_REGEX.test(email) && content.trim().length > 0

  const handleClose = () => {
    setCategory(null)
    setEmail('')
    setContent('')
    onClose()
  }

  const handleSubmit = () => {
    if (!category || !valid) return
    addTicket({
      category,
      content: content.trim(),
      authorName: isLoggedIn && user?.name ? user.name : '비회원',
      authorEmail: email.trim(),
    })
    showToast('문의가 접수됐어요')
    handleClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <div className="px-5 pb-8">
        <p className="text-[18px] font-black text-[var(--color-text-strong)] mb-1">문의하기</p>
        <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
          궁금한 점이나 불편한 점을 남겨주시면 답변을 이메일로 보내드려요.
        </p>

        <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-2 uppercase tracking-[0.08em]">문의 유형</p>
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {INQUIRY_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="rounded-xl py-2.5 text-[13px] font-semibold border transition-colors"
              style={{
                borderColor: category === c ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                backgroundColor: category === c ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                color: category === c ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-2 uppercase tracking-[0.08em]">답변받을 이메일</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@byro.io"
          className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-[14px] outline-none mb-4"
        />

        <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-2 uppercase tracking-[0.08em]">문의 내용</p>
        <TextArea
          value={content}
          onChange={setContent}
          placeholder="무엇을 도와드릴까요?"
          maxLength={1000}
          rows={5}
        />

        <div className="mt-5">
          <Button onClick={handleSubmit} disabled={!valid}>문의 접수하기</Button>
        </div>
      </div>
    </BottomSheet>
  )
}
