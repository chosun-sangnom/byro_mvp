'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { Button } from '@/components/ui'

function PreviewByroIntro() {
  return (
    <div className="rounded-[26px] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-4 shadow-[0_16px_40px_rgba(17,17,17,0.06)]">
      <div className="rounded-[18px] bg-[var(--color-bg-muted)] p-3 mb-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] mb-2">Profile Card</div>
        <div className="rounded-[16px] bg-white/90 px-3 py-3">
          <div className="text-[15px] font-black text-[var(--color-text-strong)]">강민준 · 31</div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">대화가 이어지는 라이프 프로필</div>
        </div>
      </div>
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-2">
        <div className="rounded-[18px] bg-[var(--color-bg-muted)] p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-2">라이프</div>
          <div className="grid gap-1" style={{ gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: '54px 40px' }}>
            <div className="rounded-[12px] bg-white/85 px-2 py-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">러닝</div>
            <div className="rounded-[12px] bg-white/85 px-2 py-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">재즈</div>
            <div className="rounded-[12px] bg-white/85 px-2 py-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">성수</div>
            <div className="rounded-[12px] bg-white/85 px-2 py-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">도쿄</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="rounded-[18px] bg-[var(--color-bg-muted)] p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-2">관계</div>
            <div className="flex flex-wrap gap-1">
              <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">신뢰가 가요</span>
              <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">대화가 편해요</span>
            </div>
          </div>
          <div className="rounded-[18px] bg-[var(--color-bg-muted)] p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-2">SNS</div>
            <div className="text-[11px] font-semibold text-[var(--color-text-secondary)]">Instagram · LinkedIn 연결</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const FILL_SUGGESTIONS = [
  { emoji: '💼', label: '하이라이트', desc: '경력·학력·수상·자격증', section: 'highlight' },
  { emoji: '🎵', label: '바이브', desc: '취향·운동·여행·음식', section: 'vibe' },
  { emoji: '📱', label: 'SNS', desc: '인스타·링크드인 연동', section: 'sns' },
  { emoji: '📞', label: '연락수단', desc: '전화·이메일·카카오', section: 'contact' },
]

// ── CompleteStep ──────────────────────────────────────────────────────────────

export function CompleteStep() {
  const store = useByroStore()
  const router = useRouter()
  const linkId = store.user?.linkId || store.linkId || 'myongkoo'

  useEffect(() => {
    if (!store.isLoggedIn) {
      store.completeOnboarding()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col h-full px-5 py-7">
      <div className="flex-1 overflow-y-auto">
        <div className="pt-5">
          <p className="text-[26px] font-black leading-[1.18] text-[var(--color-text-strong)] mb-3">
            회원가입이 완료됐어요!
          </p>
          <p className="text-[20px] font-black leading-[1.22] mb-3" style={{ color: 'var(--color-accent-dark)' }}>
            이제 나만의 Byro를<br />채워보세요
          </p>
          <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-6">
            프로필을 채울수록 첫 만남이 더 풍부해져요.
          </p>

          <PreviewByroIntro />

          <div className="mt-6 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] overflow-hidden divide-y divide-[var(--color-border-soft)]">
            {FILL_SUGGESTIONS.map((item) => (
              <button
                key={item.section}
                onClick={() => router.push(`/me?section=${item.section}`)}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-left active:bg-[var(--color-bg-soft)] transition-colors"
              >
                <span className="text-[20px] flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                  <p className="text-[12px] text-[var(--color-text-tertiary)]">{item.desc}</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-[var(--color-text-tertiary)] opacity-40">
                  <path d="M5 2.5L9.5 7L5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-6">
        <Button onClick={() => router.replace(`/${linkId}`)}>내 프로필 보기</Button>
        <Button variant="outline" onClick={() => router.replace('/me?edit=true')}>프로필 편집하기</Button>
      </div>
    </div>
  )
}
