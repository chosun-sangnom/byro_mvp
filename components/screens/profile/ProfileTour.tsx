'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { useFeloreStore } from '@/store/useFeloreStore'
import type { PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'

export const PROFILE_TOUR_DEMO_LINK_ID = 'jiminlee'

type TourStep = {
  target: string
  tab?: PublicProfileTabId
  title: string
  body: string
  benefit: string
}

export const PROFILE_TOUR_STEPS: TourStep[] = [
  {
    target: 'persona',
    title: 'AI 페르소나',
    body: 'AI가 내 프로필을 읽고 나를 한 문장으로 소개해요. 방문자가 가장 먼저 보게 되는 문장이에요.',
    benefit: '직함과 바이브 취향을 채울수록 더 나다운 문장으로 바뀌어요.',
  },
  {
    target: 'kemi',
    title: '케미 리포트',
    body: '다섯 가지 기준으로 내가 어떤 사람과 잘 맞는지 분석해 줘요.',
    benefit: '프로필을 채운 만큼 분석이 정확해지고, 다른 사람 프로필에 들어가면 나와의 케미도 바로 보여줘요.',
  },
  {
    target: 'whoiam',
    tab: 'who',
    title: '나',
    body: 'MBTI와 성격으로 내가 어떤 결의 사람인지 보여줘요.',
    benefit: '성격 정보를 채우면 케미 리포트가 나와 결이 맞는 사람을 더 정확히 찾아줘요.',
  },
  {
    target: 'highlight',
    tab: 'who',
    title: '하이라이트',
    body: '경력과 학력처럼 나를 증명하는 이력을 모아 보여주는 곳이에요.',
    benefit: '하이라이트를 잘 채워두면 케미 리포트의 커리어 분석이 훨씬 정교해져요.',
  },
  {
    target: 'sns',
    tab: 'who',
    title: 'SNS',
    body: '인스타그램이나 링크드인 같은 계정을 연결해 한곳에서 보여줘요.',
    benefit: '방문자가 프로필에서 바로 내 계정으로 넘어갈 수 있어요.',
  },
  {
    target: 'vibe',
    tab: 'vibe',
    title: '바이브',
    body: '취향과 일상을 사진과 함께 모아두는 공간이에요.',
    benefit: '바이브를 채우면 케미 리포트의 생활과 취향 분석에 반영되고, AI 페르소나도 더 나다워져요.',
  },
  {
    target: 'network',
    tab: 'network',
    title: '리멤버 네트워크',
    body: '내 인맥이 어떤 회사와 업계에 모여 있는지 보여줘요.',
    benefit: '방문자는 나와 겹치는 회사 인맥을 한눈에 볼 수 있어서 대화를 시작하기 쉬워져요.',
  },
  {
    target: 'experience',
    title: '경험 남기기',
    body: '함께 일해본 사람의 프로필에서 평판 키워드와 피드백을 남길 수 있어요.',
    benefit: '나도 경험을 받으면 평판 키워드가 프로필에 쌓이고, 케미 리포트의 평판 분석에 반영돼요.',
  },
  {
    target: 'bookmark',
    title: '저장하기',
    body: '다시 보고 싶은 프로필은 메모와 함께 저장해 두세요.',
    benefit: '저장한 프로필은 아카이브에서 언제든 다시 찾아볼 수 있어요.',
  },
]

export const PROFILE_TOUR_DEMO_START = PROFILE_TOUR_STEPS.findIndex((s) => s.target === 'experience')

const FIND_TIMEOUT_MS = 1500
const PAD = 8
const GAP = 12
const DIM = 'rgba(13,13,13,0.62)'

type Rect = { top: number; left: number; width: number; height: number }
type Frame = { left: number; width: number }

function findScrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node
    node = node.parentElement
  }
  return null
}

// 스크롤 영역 밖(고정 헤더·탭바 뒤)으로 삐져나간 부분은 잘라서 강조
function measureVisible(el: HTMLElement): Rect | null {
  const r = el.getBoundingClientRect()
  let top = r.top - PAD
  let bottom = r.bottom + PAD
  const scrollParent = findScrollParent(el)
  if (scrollParent) {
    const s = scrollParent.getBoundingClientRect()
    top = Math.max(top, s.top)
    bottom = Math.min(bottom, s.bottom)
  }
  top = Math.max(top, 0)
  bottom = Math.min(bottom, window.innerHeight)
  if (bottom - top < 8) return null
  return { top, left: r.left - PAD, width: r.width + PAD * 2, height: bottom - top }
}

function sameRect(a: Rect | null, b: Rect | null) {
  if (!a || !b) return a === b
  return Math.abs(a.top - b.top) < 0.5 && Math.abs(a.left - b.left) < 0.5
    && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5
}

export function ProfileTour({
  mode,
  onTabChange,
}: {
  mode: 'owner' | 'demo'
  onTabChange?: (tab: PublicProfileTabId) => void
}) {
  const router = useRouter()
  const stepIndex = useFeloreStore((s) => s.profileTourStep)
  const ownerLinkId = useFeloreStore((s) => s.user?.linkId)
  const setProfileTourStep = useFeloreStore((s) => s.setProfileTourStep)
  const endProfileTour = useFeloreStore((s) => s.endProfileTour)

  const step = PROFILE_TOUR_STEPS[stepIndex]
  // 내 프로필 → 데모 프로필 라우팅 중에는 딤만 유지
  const waitingForDemo = mode === 'owner' && stepIndex >= PROFILE_TOUR_DEMO_START
  const isLast = stepIndex === PROFILE_TOUR_STEPS.length - 1

  const [rect, setRect] = useState<Rect | null>(null)
  const [frame, setFrame] = useState<Frame | null>(null)
  const [tooltipHeight, setTooltipHeight] = useState(220)
  const targetRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const finish = () => {
    endProfileTour()
    if (mode === 'demo' && ownerLinkId) router.replace(`/${ownerLinkId}`)
  }

  const goNext = () => {
    // 퇴장 애니메이션 중인 이전 카드의 버튼이 눌려 단계를 두 번 넘기는 것 방지
    if (useFeloreStore.getState().profileTourStep !== stepIndex) return
    const next = stepIndex + 1
    if (next >= PROFILE_TOUR_STEPS.length) {
      finish()
      return
    }
    setProfileTourStep(next)
    if (mode === 'owner' && next >= PROFILE_TOUR_DEMO_START) {
      router.push(`/${PROFILE_TOUR_DEMO_LINK_ID}`)
    }
  }
  const goNextRef = useRef(goNext)
  goNextRef.current = goNext

  // 단계 전환: 탭 이동 → 대상 요소 찾기 → 스크롤 영역 안으로 끌어오기. 대상이 없으면(빈 섹션 등) 건너뜀
  useEffect(() => {
    if (!step || waitingForDemo) return
    targetRef.current = null
    setRect(null)
    if (step.tab) onTabChange?.(step.tab)

    let cancelled = false
    let raf = 0
    const startedAt = performance.now()
    const tryFind = () => {
      if (cancelled) return
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
      if (el && el.getBoundingClientRect().height >= 8) {
        targetRef.current = el
        // 프로필은 문서 전체가 스크롤되는 구조라 scrollIntoView로 창까지 포함해 끌어옴
        const isTall = el.getBoundingClientRect().height > window.innerHeight * 0.5
        el.style.scrollMarginTop = '24px'
        el.scrollIntoView({ block: isTall ? 'start' : 'center', behavior: 'smooth' })
        return
      }
      if (performance.now() - startedAt > FIND_TIMEOUT_MS) {
        goNextRef.current()
        return
      }
      raf = requestAnimationFrame(tryFind)
    }
    raf = requestAnimationFrame(tryFind)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex])

  // 스크롤·등장 애니메이션 중에도 강조 영역이 대상을 따라가도록 매 프레임 측정
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = targetRef.current
      const nextRect = el && el.isConnected ? measureVisible(el) : null
      setRect((prev) => (sameRect(prev, nextRect) ? prev : nextRect))

      const frameEl = document.querySelector<HTMLElement>('[data-tour-frame]')
      if (frameEl) {
        const f = frameEl.getBoundingClientRect()
        const nextFrame = { left: f.left, width: f.width }
        setFrame((prev) => (prev && prev.left === nextFrame.left && prev.width === nextFrame.width ? prev : nextFrame))
      }

      const h = tooltipRef.current?.offsetHeight
      if (h) setTooltipHeight((prev) => (prev === h ? prev : h))

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!step) return null
  if (waitingForDemo) return <div className="fixed inset-0 z-[95]" style={{ background: DIM }} />

  const viewportHeight = typeof window === 'undefined' ? 800 : window.innerHeight
  let spot = rect
  let tooltipPosition: { top?: number; bottom?: number } = { bottom: 24 }
  if (rect) {
    const need = tooltipHeight + GAP * 2
    const spaceBelow = viewportHeight - (rect.top + rect.height)
    if (spaceBelow >= need) {
      tooltipPosition = { top: rect.top + rect.height + GAP }
    } else if (rect.top >= need) {
      tooltipPosition = { bottom: viewportHeight - rect.top + GAP }
    } else {
      // 화면을 거의 채우는 긴 섹션은 윗부분만 강조하고 그 아래에 안내 카드
      spot = { ...rect, height: Math.max(80, viewportHeight - rect.top - need) }
      tooltipPosition = { top: spot.top + spot.height + GAP }
    }
  }

  const isDemoStep = stepIndex >= PROFILE_TOUR_DEMO_START
  const frameLeft = (frame?.left ?? 0) + 16
  const frameWidth = (frame?.width ?? 0) - 32

  return (
    <div className="fixed inset-0 z-[95]" onClick={(e) => e.stopPropagation()}>
      <style>{`@keyframes profileTourPulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.08)}}`}</style>

      {spot ? (
        <motion.div
          className="pointer-events-none absolute rounded-[18px]"
          initial={false}
          animate={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          style={{ boxShadow: `0 0 0 9999px ${DIM}` }}
        >
          <span
            className="absolute inset-0 rounded-[18px] border-2 border-white"
            style={{ animation: 'profileTourPulse 1.4s ease-out infinite' }}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0" style={{ background: DIM }} />
      )}

      <AnimatePresence mode="wait">
        {rect && frame && (
          <motion.div
            key={stepIndex}
            ref={tooltipRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="absolute rounded-[20px] bg-white p-5 shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
            style={{ left: frameLeft, width: frameWidth, ...tooltipPosition }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#8A949E]">
                {isDemoStep ? '다른 사람 프로필에서' : '내 프로필'}
              </span>
              <div className="flex gap-1">
                {PROFILE_TOUR_STEPS.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: i === stepIndex ? 14 : 6, background: i === stepIndex ? '#0D0D0D' : '#D9DEE3' }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-[18px] font-bold text-[#0D0D0D]">{step.title}</p>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-[#475058]">{step.body}</p>
            <div className="mt-3 flex gap-2 rounded-[12px] bg-[#F4F6F8] px-3 py-2.5">
              <Sparkles size={14} className="mt-[3px] shrink-0 text-[var(--color-accent-dark)]" />
              <p className="text-[13px] font-medium leading-[1.5] text-[var(--color-accent-dark)]">{step.benefit}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {isLast ? <span /> : (
                <button type="button" onClick={finish} className="text-[13px] font-medium text-[#8A949E]">
                  건너뛰기
                </button>
              )}
              <Button size="sm" fullWidth={false} onClick={goNext}>
                {isLast ? '완료' : '다음'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
