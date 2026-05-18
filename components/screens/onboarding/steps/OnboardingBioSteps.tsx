'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, showToast } from '@/components/ui'

export function Step9Complete() {
  const store = useByroStore()
  const router = useRouter()
  const linkId = store.linkId || 'myongkoo'

  useEffect(() => {
    if (!store.isLoggedIn) {
      store.completeOnboarding()
    }
  }, [store])

  const handleCopy = () => {
    navigator.clipboard.writeText(`byro.io/@${linkId}`).catch(() => {})
    showToast('링크가 복사됐어요!')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-6 items-center text-center">
      <div className="w-full rounded-[30px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-5 py-7 mb-5">
        <div className="mb-4 flex justify-center text-[var(--color-state-success-text)]">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-black mb-2 text-[var(--color-text-strong)]">바이로 준비 완료!</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-5">링크로 바로 공유할 수 있어요.</p>

        <div className="w-full flex items-center bg-[var(--color-bg-muted)] border border-[var(--color-border-soft)] rounded-xl px-4 py-3">
          <span className="flex-1 text-sm text-[var(--color-text-primary)] text-left">byro.io/@{linkId}</span>
          <button onClick={handleCopy} className="text-xs font-bold text-[var(--color-accent-dark)] ml-3 flex-shrink-0">복사</button>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-[var(--color-border-soft)] px-5 py-4 mb-5 text-left">
        <p className="text-[13px] font-bold text-[var(--color-text-primary)] mb-2">지금 채우면 좋은 것들</p>
        <div className="space-y-1.5">
          {['라이프 — 취향·운동·여행지', '하이라이트 — 경력·학력·수상', '연락수단 — 전화·이메일·카카오'].map((item) => (
            <p key={item} className="text-[12px] text-[var(--color-text-tertiary)]">· {item}</p>
          ))}
        </div>
      </div>

      <div className="w-full space-y-3">
        <Button onClick={() => router.replace('/me?edit=true')}>프로필 꾸미러 가기</Button>
        <Button variant="outline" onClick={() => router.replace('/me')}>나중에 채울게요</Button>
      </div>
    </div>
  )
}
