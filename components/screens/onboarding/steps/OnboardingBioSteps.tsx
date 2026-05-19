'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, CheckCircle2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, showToast } from '@/components/ui'

// ─── Mini preview components ──────────────────────────────────────────────────

function PreviewHighlight() {
  const items = [
    { emoji: '💼', title: 'Product Owner', sub: '스타트업 · 5년' },
    { emoji: '🎓', title: '연세대학교 경영학과', sub: '2015 졸업' },
    { emoji: '🏆', title: '우수 스타트업 대상', sub: '중기부 · 2023' },
  ]
  return (
    <div className="rounded-[18px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 divide-y divide-[var(--color-border-soft)]">
      {items.map((item) => (
        <div key={item.title} className="flex items-center gap-3 py-3">
          <span className="text-[18px] flex-shrink-0">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{item.title}</div>
            <div className="text-[11px] text-[var(--color-text-tertiary)]">{item.sub}</div>
          </div>
          <BadgeCheck size={14} className="flex-shrink-0 text-[var(--color-accent-dark)]" />
        </div>
      ))}
    </div>
  )
}

function PreviewLife() {
  const cells = [
    { label: '🐶 코코', style: { gridColumn: '1', gridRow: '1 / 3' } },
    { label: '🎵 재즈', style: { gridColumn: '2 / 4', gridRow: '1' } },
    { label: '🏃 러닝', style: { gridColumn: '2', gridRow: '2' } },
    { label: '🍣 스시', style: { gridColumn: '3', gridRow: '2' } },
    { label: '✈️ 도쿄', style: { gridColumn: '2 / 4', gridRow: '3' } },
    { label: '📚 경제학', style: { gridColumn: '1', gridRow: '3' } },
  ]
  return (
    <div
      className="grid w-full overflow-hidden rounded-[18px] gap-1"
      style={{ gridTemplateColumns: '3fr 2fr 2fr', gridTemplateRows: '2fr 3fr 2fr', aspectRatio: '1' }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          style={cell.style}
          className="bg-[var(--color-bg-muted)] flex items-end p-2 overflow-hidden"
        >
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] leading-tight">{cell.label}</span>
        </div>
      ))}
    </div>
  )
}

function PreviewConnect() {
  return (
    <div className="space-y-2">
      <div className="rounded-[18px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-[13px] font-bold text-[var(--color-text-secondary)] flex-shrink-0">김</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">김철수</div>
            <div className="text-[11px] text-[var(--color-text-tertiary)]">B2B Sales · 5년차</div>
          </div>
          <div className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]">연결 안 됨</div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 rounded-full border border-[var(--color-border-default)] py-2 text-[12px] font-semibold text-[var(--color-text-secondary)]">평판 요청</button>
          <button className="flex-1 rounded-full py-2 text-[12px] font-semibold text-white bg-[var(--color-accent-dark)]">연결하기</button>
        </div>
      </div>
      <div className="rounded-[14px] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-3">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-[var(--color-accent-dark)] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">이</div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">이지현</div>
          </div>
          <div className="rounded-full px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent-dark)]" style={{ background: 'color-mix(in srgb, var(--color-accent-dark) 12%, transparent)' }}>연결됨</div>
        </div>
        <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">연결된 친구는 비공개로 설정한 탭도 볼 수 있어요</p>
      </div>
    </div>
  )
}

// ─── Slide data ───────────────────────────────────────────────────────────────

interface GuideSlide {
  Preview: () => JSX.Element
  title: string
  tags: string[]
  value: string
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    Preview: PreviewHighlight,
    title: '나',
    tags: ['MBTI', '반려동물', '하이라이트'],
    value: '어떤 사람인지 빠르게 보여주는 탭이에요',
  },
  {
    Preview: PreviewLife,
    title: '라이프',
    tags: ['활동', '문화', '장소'],
    value: '공통점과 스몰토크 소재를 만드는 탭이에요',
  },
  {
    Preview: PreviewConnect,
    title: '관계',
    tags: ['네트워크', '평판', 'SNS'],
    value: '신뢰와 연결을 더하는 탭이에요',
  },
]

const TOTAL = GUIDE_SLIDES.length

// ─── Main component ───────────────────────────────────────────────────────────

export function Step9Complete() {
  const store = useByroStore()
  const router = useRouter()
  const linkId = store.user?.linkId || store.linkId || 'myongkoo'
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (!store.isLoggedIn) {
      store.completeOnboarding()
    }
  }, [store])

  const handleCopy = () => {
    navigator.clipboard.writeText(`byro.io/@${linkId}`).catch(() => {})
    showToast('링크가 복사됐어요!')
  }

  const goNext = () => { if (slide < TOTAL - 1) setSlide(slide + 1) }
  const goPrev = () => { if (slide > 0) setSlide(slide - 1) }

  const isFirstSlide = slide === 0
  const isLastSlide = slide === TOTAL - 1
  const guide = GUIDE_SLIDES[slide]

  return (
    <div className="flex flex-col h-full px-5 py-6">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center bg-[var(--color-bg-muted)] border border-[var(--color-border-soft)] rounded-xl px-4 py-2.5 mb-5">
          <CheckCircle2 size={14} className="text-[var(--color-state-success-text)] mr-2 flex-shrink-0" />
          <span className="flex-1 text-sm text-[var(--color-text-primary)]">byro.io/@{linkId}</span>
          <button onClick={handleCopy} className="text-xs font-bold text-[var(--color-accent-dark)] ml-3 flex-shrink-0">복사</button>
        </div>

        <h2 className="text-[22px] font-black text-[var(--color-text-strong)] leading-snug mb-1">
          프로필이 만들어졌어요
        </h2>
        <p className="text-[19px] font-black leading-snug mb-3" style={{ color: 'var(--color-accent-dark)' }}>
          이제 Byro를 채워보세요
        </p>

        <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
          `나`, `라이프`, `관계` 세 가지 탭을 채우면
          <br />
          만난 사람이 더 쉽게 기억하고 대화를 시작할 수 있어요.
        </p>

        <div className="pointer-events-none mb-5">
          <guide.Preview />
        </div>

        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-1">
            {slide + 1} / {GUIDE_SLIDES.length}
          </p>
          <h2 className="text-xl font-black mb-1.5 text-[var(--color-text-strong)]">{guide.title}</h2>
          <p className="text-sm font-semibold text-[var(--color-accent-dark)] mb-4">{guide.value}</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {guide.tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      {isFirstSlide ? (
        <div className="space-y-2.5 pt-4">
          <Button onClick={goNext}>다음</Button>
          <Button variant="outline" onClick={() => router.replace(`/${linkId}`)}>나중에 할게요</Button>
        </div>
      ) : isLastSlide ? (
        <div className="space-y-2.5">
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev}>이전</Button>
            <Button onClick={() => router.replace('/me?edit=true')}>내 바이로 채우러 가기</Button>
          </div>
          <Button variant="outline" onClick={() => router.replace(`/${linkId}`)}>나중에 할게요</Button>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button variant="outline" onClick={goPrev}>이전</Button>
          <Button onClick={goNext}>다음</Button>
        </div>
      )}
    </div>
  )
}
