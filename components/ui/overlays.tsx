'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

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
      <div className="px-4 pb-6">
        <div className="mb-4 px-1 text-[18px] font-bold text-[#0D0D0D]">{title}</div>
        <div className="max-h-[44dvh] overflow-y-auto scrollbar-hide rounded-[24px] border border-[#DEE4EC] px-4">
          {options.map((option, index) => {
            const selected = value === option
            return (
              <button
                key={option}
                onClick={() => {
                  onSelect(option)
                  onClose()
                }}
                className={[
                  'flex w-full items-center py-4 text-left',
                  index < options.length - 1 ? 'border-b border-[#DEE4EC]' : '',
                ].join(' ')}
              >
                <span className={['text-[16px]', selected ? 'font-bold text-[#0D0D0D]' : 'font-medium text-[#25313D]'].join(' ')}>
                  {option}
                </span>
              </button>
            )
          })}
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
  widthClassName?: string
}

export function Modal({ open, onClose, children, widthClassName = 'w-[272px]' }: ModalProps) {
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
            className={`relative rounded-2xl p-5 z-10 border ${widthClassName}`}
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
