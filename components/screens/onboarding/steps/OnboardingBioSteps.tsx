'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, showToast } from '@/components/ui'

const GUIDE_SLIDES = [
  {
    emoji: '⚡',
    title: '하이라이트',
    tags: ['경력', '학력', '수상', '자격증'],
    value: '만나기 전부터 신뢰가 생겨요',
    detail: '경력과 학력을 채우면 처음 보는 사람도\n당신이 어떤 사람인지 한눈에 알 수 있어요.',
  },
  {
    emoji: '🌿',
    title: '라이프',
    tags: ['취향', '운동', '여행지', '음식'],
    value: '취향이 겹치면 첫 대화가 자연스러워져요',
    detail: '좋아하는 음악·영화·카페·여행지를 공유하면\n공통점을 찾기 쉬워져요.',
  },
  {
    emoji: '🤝',
    title: '네트워크',
    tags: ['리멤버 명함', '공통 인맥'],
    value: '공통 인맥이 보이면 연결 고리가 생겨요',
    detail: '리멤버 명함을 기반으로\n공통 인맥이 자동으로 집계돼요.',
  },
  {
    emoji: '⭐',
    title: '평판',
    tags: ['경험 키워드', '방명록'],
    value: '다른 사람이 남긴 키워드가 나를 증명해줘요',
    detail: '함께 일한 사람들이 남긴 키워드가 쌓이면\n나만의 평판이 만들어져요.',
  },
  {
    emoji: '📱',
    title: '연락수단',
    tags: ['전화', '이메일', '카카오'],
    value: '연락 수단이 없으면 만남으로 이어지기 어려워요',
    detail: '전화번호나 카카오를 연결해두면\n프로필을 본 사람이 바로 연락할 수 있어요.',
  },
]

const TOTAL = GUIDE_SLIDES.length + 1

export function Step9Complete() {
  const store = useByroStore()
  const router = useRouter()
  const linkId = store.linkId || 'myongkoo'
  const [slide, setSlide] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

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

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const diff = touchStartX - e.changedTouches[0].clientX
    if (diff > 50) goNext()
    else if (diff < -50) goPrev()
    setTouchStartX(null)
  }

  const isLastSlide = slide === TOTAL - 1
  const guide = slide > 0 ? GUIDE_SLIDES[slide - 1] : null

  return (
    <div
      className="flex flex-col h-full px-5 py-6 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide 0: Complete */}
      {slide === 0 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="mb-4 text-[var(--color-state-success-text)]">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="text-2xl font-black mb-2 text-[var(--color-text-strong)]">바이로 준비 완료!</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">링크로 바로 공유할 수 있어요.</p>
          <div className="w-full flex items-center bg-[var(--color-bg-muted)] border border-[var(--color-border-soft)] rounded-xl px-4 py-3">
            <span className="flex-1 text-sm text-[var(--color-text-primary)] text-left">byro.io/@{linkId}</span>
            <button onClick={handleCopy} className="text-xs font-bold text-[var(--color-accent-dark)] ml-3 flex-shrink-0">복사</button>
          </div>
        </div>
      )}

      {/* Guide slides */}
      {guide && (
        <div className="flex-1 flex flex-col justify-center items-center text-center px-2">
          <div className="text-5xl mb-6">{guide.emoji}</div>
          <h2 className="text-2xl font-black mb-1 text-[var(--color-text-strong)]">{guide.title}</h2>
          <p className="text-sm font-semibold text-[var(--color-accent-dark)] mb-5">{guide.value}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {guide.tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed whitespace-pre-line">{guide.detail}</p>
        </div>
      )}

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 py-5">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`rounded-full transition-all duration-200 ${
              i === slide
                ? 'w-5 h-1.5 bg-[var(--color-accent-dark)]'
                : 'w-1.5 h-1.5 bg-[var(--color-border-default)]'
            }`}
          />
        ))}
      </div>

      {/* Bottom buttons */}
      {isLastSlide ? (
        <div className="space-y-3">
          <Button onClick={() => router.replace('/me?edit=true')}>프로필 꾸미러 가기</Button>
          <Button variant="outline" onClick={() => router.replace('/me')}>나중에 채울게요</Button>
        </div>
      ) : slide === 0 ? (
        <Button onClick={goNext}>프로필 소개 보기</Button>
      ) : (
        <div className="flex gap-3">
          <Button variant="outline" onClick={goPrev}>이전</Button>
          <Button onClick={goNext}>다음</Button>
        </div>
      )}
    </div>
  )
}
