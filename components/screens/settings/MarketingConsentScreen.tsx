'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { NavBar } from '@/components/ui'

export default function MarketingConsentScreen() {
  const router = useRouter()
  const agreedMarketing = useByroStore((s) => s.agreedMarketing)
  const setAgreedMarketing = useByroStore((s) => s.setAgreedMarketing)

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="마케팅 정보 수신 동의" onBack={() => router.back()} />

      <div className="px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-4 text-[13px] leading-relaxed text-[var(--color-text-secondary)] mb-6">
          <p className="mb-3">
            (예시) Byro는 신규 기능 안내, 이벤트·프로모션 정보를 이메일 또는 앱 알림으로 보내드릴 수 있어요.
          </p>
          <p>
            수신에 동의하지 않아도 서비스 이용에는 아무런 제한이 없으며, 언제든 이 화면에서 동의를 철회할 수 있어요.
            (실제 약관 전문은 추후 업데이트될 예정이에요.)
          </p>
        </div>

        <button
          onClick={() => setAgreedMarketing(!agreedMarketing)}
          className="flex items-center justify-between w-full rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-4"
        >
          <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">마케팅 정보 수신</span>
          <div
            className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors"
            style={{ backgroundColor: agreedMarketing ? 'var(--color-accent-dark)' : 'var(--color-border-default)' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
              style={{ left: agreedMarketing ? '22px' : '2px' }}
            />
          </div>
        </button>
      </div>
    </div>
  )
}
