'use client'

import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NavBar, showToast } from '@/components/ui'

const LANGUAGES = [
  { id: 'ko', label: '한국어' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' },
]

export default function LanguageScreen() {
  const router = useRouter()

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="언어" onBack={() => router.back()} />

      <div className="flex flex-col pb-[calc(env(safe-area-inset-bottom)+32px)]">
        {LANGUAGES.map((lang) => {
          const selected = lang.id === 'ko'
          return (
            <button
              key={lang.id}
              onClick={() => { if (!selected) showToast('준비 중이에요') }}
              className="flex items-center justify-between w-full px-5 py-4 text-left border-b border-[var(--color-border-soft)] active:bg-[var(--color-bg-muted)] transition-colors"
            >
              <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{lang.label}</span>
              {selected && <Check size={18} className="text-[var(--color-accent-dark)]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
