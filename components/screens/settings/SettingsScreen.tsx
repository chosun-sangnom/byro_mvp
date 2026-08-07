'use client'

import { useState } from 'react'
import {
  ChevronRight, FileText, Globe, HelpCircle,
  Info, Megaphone, Shield, Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NavBar, InquirySheet, showToast } from '@/components/ui'

type SettingsItem = {
  id: string
  icon: React.ElementType
  label: string
  trailing?: string
  onClick?: () => void
}

export default function SettingsScreen() {
  const router = useRouter()
  const [inquiryOpen, setInquiryOpen] = useState(false)

  const settingsItems: SettingsItem[] = [
    { id: 'lang', icon: Globe, label: '언어 전환', onClick: () => showToast('준비 중이에요') },
    { id: 'inquiry', icon: HelpCircle, label: '문의하기', onClick: () => setInquiryOpen(true) },
    { id: 'terms', icon: FileText, label: '이용약관', onClick: () => showToast('준비 중이에요') },
    { id: 'privacy', icon: Shield, label: '개인정보 처리방침', onClick: () => showToast('준비 중이에요') },
    { id: 'notice', icon: Megaphone, label: '공지사항', onClick: () => showToast('준비 중이에요') },
    { id: 'release', icon: Sparkles, label: '릴리즈노트', onClick: () => showToast('준비 중이에요') },
    { id: 'version', icon: Info, label: '버전정보', trailing: 'v1.0.0' },
  ]

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="설정" onBack={() => router.back()} />

      <div className="px-4 mt-4 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <div className="rounded-2xl overflow-hidden border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] divide-y divide-[var(--color-border-soft)]">
          {settingsItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                disabled={!item.onClick}
                className="flex items-center gap-3.5 w-full px-4 py-4 text-left active:bg-[var(--color-bg-muted)] transition-colors disabled:active:bg-transparent"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-bg-muted)' }}
                >
                  <Icon size={16} className="text-[var(--color-text-secondary)]" />
                </div>
                <span className="flex-1 text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</span>
                {item.trailing ? (
                  <span className="text-[12px] text-[var(--color-text-tertiary)]">{item.trailing}</span>
                ) : (
                  <ChevronRight size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0 opacity-50" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 문의하기 — 로그인 여부 무관 */}
      <InquirySheet open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  )
}
