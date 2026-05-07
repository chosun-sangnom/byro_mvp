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
