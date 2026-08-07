'use client'

import { ChevronRight, FileText, Megaphone, Shield, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NavBar, showToast } from '@/components/ui'

type PolicyItem = {
  id: string
  icon: React.ElementType
  label: string
}

const POLICY_ITEMS: PolicyItem[] = [
  { id: 'terms', icon: FileText, label: '이용약관' },
  { id: 'privacy', icon: Shield, label: '개인정보 처리방침' },
  { id: 'notice', icon: Megaphone, label: '공지사항' },
  { id: 'release', icon: Sparkles, label: '릴리즈노트' },
]

export default function PoliciesScreen() {
  const router = useRouter()

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="약관 및 정책" onBack={() => router.back()} />

      <div className="flex flex-col pb-[calc(env(safe-area-inset-bottom)+32px)]">
        {POLICY_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => showToast('준비 중이에요')}
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
