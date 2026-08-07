'use client'

import { ChevronRight, FileText, Megaphone, Shield, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { NavBar, showToast } from '@/components/ui'

type AccountItem =
  | { id: string; icon: React.ElementType; label: string; type: 'nav'; onClick: () => void }
  | { id: string; icon: React.ElementType; label: string; type: 'toggle'; checked: boolean; onToggle: () => void }

export default function AccountScreen() {
  const router = useRouter()
  const isLoggedIn = useByroStore((s) => s.isLoggedIn)
  const agreedMarketing = useByroStore((s) => s.agreedMarketing)
  const setAgreedMarketing = useByroStore((s) => s.setAgreedMarketing)

  const items: AccountItem[] = [
    { id: 'terms', icon: FileText, label: '이용약관', type: 'nav', onClick: () => showToast('준비 중이에요') },
    { id: 'privacy', icon: Shield, label: '개인정보 처리방침', type: 'nav', onClick: () => showToast('준비 중이에요') },
    ...(isLoggedIn
      ? [
          {
            id: 'marketing',
            icon: Megaphone,
            label: '마케팅 정보 수신 동의',
            type: 'toggle' as const,
            checked: agreedMarketing,
            onToggle: () => setAgreedMarketing(!agreedMarketing),
          },
          {
            id: 'withdraw',
            icon: UserX,
            label: '회원탈퇴',
            type: 'nav' as const,
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
          if (item.type === 'toggle') {
            return (
              <button
                key={item.id}
                onClick={item.onToggle}
                className="flex items-center gap-3.5 w-full px-5 py-4 text-left border-b border-[var(--color-border-soft)] active:bg-[var(--color-bg-muted)] transition-colors"
              >
                <Icon size={20} className="text-[var(--color-text-secondary)] flex-shrink-0" />
                <span className="flex-1 text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</span>
                <div
                  className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors"
                  style={{ backgroundColor: item.checked ? 'var(--color-accent-dark)' : 'var(--color-border-default)' }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                    style={{ left: item.checked ? '22px' : '2px' }}
                  />
                </div>
              </button>
            )
          }
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex items-center gap-3.5 w-full px-5 py-4 text-left border-b border-[var(--color-border-soft)] active:bg-[var(--color-bg-muted)] transition-colors"
            >
              <Icon size={20} className="text-[var(--color-text-secondary)] flex-shrink-0" />
              <span className="flex-1 text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</span>
              <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0 opacity-60" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
