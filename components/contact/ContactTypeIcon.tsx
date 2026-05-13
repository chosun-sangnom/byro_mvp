'use client'

import { Mail, MessageCircle, Phone } from 'lucide-react'
import type { ContactChannel } from '@/types'

type ContactTypeIconVariant = 'themed' | 'mono'

const ICON_MAP = {
  phone: Phone,
  email: Mail,
  kakao: MessageCircle,
} as const

export function ContactTypeIcon({
  channelId,
  enabled,
  variant = 'themed',
}: {
  channelId: ContactChannel['id']
  enabled: boolean
  variant?: ContactTypeIconVariant
}) {
  const Icon = ICON_MAP[channelId] ?? MessageCircle
  const palette = variant === 'mono'
    ? {
      enabled: 'bg-[var(--color-text-strong)] text-white',
      disabled: 'bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]',
    }
    : {
      enabled: 'bg-[var(--color-accent-dark)] text-white',
      disabled: 'bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]',
    }

  return (
    <div
      className={[
        'flex h-10 w-10 items-center justify-center rounded-xl',
        enabled ? palette.enabled : palette.disabled,
      ].join(' ')}
    >
      <Icon size={16} />
    </div>
  )
}
