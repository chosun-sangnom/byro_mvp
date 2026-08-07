'use client'

import { ChevronRight, FileText, Globe, HelpCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/ui'

type SettingsItem = {
  id: string
  icon: React.ElementType
  label: string
  description?: string
  href: string
}

const SETTINGS_ITEMS: SettingsItem[] = [
  { id: 'lang', icon: Globe, label: '언어', description: '한국어', href: '/settings/language' },
  { id: 'policies', icon: FileText, label: '약관 및 정책', href: '/settings/policies' },
  { id: 'inquiry', icon: HelpCircle, label: '문의하기', description: '궁금한 점이나 불편한 점을 남겨주세요', href: '/settings/inquiry' },
]

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="설정" onBack={() => router.back()} />

      <div className="px-5 pt-3 pb-1 text-right">
        <span className="text-[11px] text-[var(--color-text-tertiary)]">버전 정보 · v1.0.0</span>
      </div>

      <div className="flex flex-col pb-[calc(env(safe-area-inset-bottom)+32px)]">
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
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
