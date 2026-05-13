'use client'

import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'outline' | 'ghost' | 'kakao' | 'google' | 'naver' | 'danger'
  size?: 'sm' | 'md'
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  style?: CSSProperties
}

const BUTTON_VARIANTS: Record<string, string> = {
  primary: 'active:opacity-85',
  outline: 'border active:opacity-85',
  ghost: 'bg-transparent active:opacity-75',
  kakao: 'bg-[#FEE500] text-[#333] active:opacity-85',
  google: 'border active:opacity-85',
  naver: 'bg-[#03C75A] text-white active:opacity-85',
  danger: 'border active:opacity-85',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  disabled,
  onClick,
  className = '',
  type = 'button',
  style,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97, filter: 'brightness(0.88)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={[
        'rounded-xl font-semibold select-none whitespace-nowrap',
        size === 'md' ? 'px-5 py-3 text-[14px]' : 'px-3.5 py-2 text-[13px]',
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary,
        className,
      ].join(' ')}
      style={{
        backgroundColor:
          variant === 'primary'
            ? 'var(--color-accent-dark)'
            : variant === 'outline'
              ? 'transparent'
              : variant === 'google'
                ? 'var(--color-bg-surface)'
                : variant === 'danger'
                  ? 'var(--color-state-danger-bg)'
                  : variant === 'ghost'
                    ? 'transparent'
                    : undefined,
        color:
          variant === 'primary'
            ? '#ffffff'
            : variant === 'outline'
              ? 'var(--color-text-secondary)'
              : variant === 'ghost'
                ? 'var(--color-text-tertiary)'
                : variant === 'google'
                  ? 'var(--color-text-primary)'
                  : variant === 'danger'
                    ? 'var(--color-state-danger-text)'
                    : undefined,
        borderColor:
          variant === 'outline'
            ? 'var(--color-border-default)'
            : variant === 'google'
              ? 'var(--color-border-default)'
              : variant === 'danger'
                ? 'rgba(198,40,40,0.28)'
                : undefined,
        boxShadow:
          variant === 'primary' && !disabled
            ? '0 0 18px rgba(29,200,160,0.30), 0 2px 8px rgba(29,200,160,0.18)'
            : undefined,
        ...style,
      }}
    >
      {children}
    </motion.button>
  )
}

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
}

export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={[
        'px-3 py-1.5 rounded-full text-xs font-semibold border select-none',
        selected
          ? 'border-[var(--color-accent-dark)] text-white'
          : 'bg-[var(--color-bg-soft)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]',
      ].join(' ')}
      style={selected ? { backgroundColor: 'var(--color-accent-dark)' } : undefined}
    >
      {label}
    </motion.button>
  )
}
