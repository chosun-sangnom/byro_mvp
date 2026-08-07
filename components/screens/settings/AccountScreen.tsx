'use client'

import { ChevronRight, FileText, Megaphone, Shield, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { NavBar, showToast } from '@/components/ui'

type AccountItem = {
  id: string
  icon: React.ElementType
  label: string
  description?: string
  onClick: () => void
}

export default function AccountScreen() {
  const router = useRouter()
  const isLoggedIn = useByroStore((s) => s.isLoggedIn)
  const agreedMarketing = useByroStore((s) => s.agreedMarketing)

  const items: AccountItem[] = [
    { id: 'terms', icon: FileText, label: '이용약관', onClick: () => showToast('준비 중이에요') },
    { id: 'privacy', icon: Shield, label: '개인정보 처리방침', onClick: () => showToast('준비 중이에요') },
    ...(isLoggedIn
      ? [
          {
            id: 'marketing',
            icon: Megaphone,
            label: '마케팅 정보 수신 동의',
            description: agreedMarketing ? '동의함' : '동의 안 함',
            onClick: () => router.push('/settings/account/marketing'),
          },
          {
            id: 'withdraw',
            icon: UserX,
            label: '회원탈퇴',
            onClick: () => router.push('/settings/account/withdraw'),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="약관 및 계정" onBack={() => router.back()} />

      <div className="flex flex-col pb-[calc(env(safe-area-inset-bottom)+32px)]">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex items-center gap-3.5 w-full px-5 py-4 text-left border-b border-[var(--color-border-soft)] active:bg-[var(--color-bg-muted)] transition-colors"
            >
              <Icon size={20} className="text-[var(--color-text-secondary)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                {item.description && (
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5">{item.description}</p>
                )}
              </div>
              <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0 opacity-60" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
