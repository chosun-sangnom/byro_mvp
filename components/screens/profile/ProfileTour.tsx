'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { useFeloreStore } from '@/store/useFeloreStore'
import type { PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'
import {
  PreviewBasicInfo,
  PreviewHighlight,
  PreviewLife,
  PreviewNetwork,
  PreviewPersona,
  PreviewSNS,
} from '@/components/screens/profile/ProfileDemoPreviews'

export const PROFILE_TOUR_DEMO_LINK_ID = 'jiminlee'

type TourStep = {
  target: string
  tab?: PublicProfileTabId
  /** 눌림 인터랙션을 줄 버튼 문구. 없으면 대상 안의 첫 버튼, 그것도 없으면 대상 자체 */
  press?: string
  title: string
  desc: string
  /** 채운 모습 예시 — 이지민 데모 데이터로 렌더한 실제 프로필 컴포넌트 */
  Example?: ComponentType
  exampleScale?: number
  /** 히어로 카드처럼 아래쪽(이름·페르소나)이 핵심인 예시는 아래 기준으로 자름 */
  exampleAnchor?: 'top' | 'bottom'
  howLabel: string
  how: string
  benefit: string
}

export const PROFILE_TOUR_STEPS: TourStep[] = [
  {
    target: 'persona',
    title: 'AI 페르소나',
    desc: 'AI가 나를 한 문장으로 소개해 줘요.',
    Example: PreviewPersona,
    exampleScale: 0.62,
    exampleAnchor: 'bottom',
    howLabel: '만드는 법',
    how: '직함과 바이브를 채우면 자동으로 만들어져요.',
    benefit: '처음 보는 사람도 나를 한눈에 알아봐요.',
  },
  {
    target: 'kemi',
    press: '리포트 보기',
    title: '케미 리포트',
    desc: '나와 잘 맞는 사람을 다섯 가지 기준으로 분석해요.',
    howLabel: '보는 법',
    how: '프로필을 채운 뒤 리포트 보기를 눌러요.',
    benefit: '채운 항목이 많을수록 분석이 정확해져요.',
  },
  {
    target: 'whoiam',
    tab: 'who',
    title: '나',
    desc: '자기소개와 MBTI로 나를 보여주는 곳이에요.',
    Example: PreviewBasicInfo,
    howLabel: '채우는 법',
    how: 'MBTI를 고르고 성격을 한두 문장으로 적어요.',
    benefit: '케미 리포트가 결이 맞는 사람을 찾아줘요.',
  },
  {
    target: 'highlight',
    tab: 'who',
    title: '하이라이트',
    desc: '경력과 학력으로 나를 증명하는 곳이에요.',
    Example: PreviewHighlight,
    howLabel: '채우는 법',
    how: '이력서나 링크드인 캡처를 올리면 자동으로 채워져요.',
    benefit: '케미 리포트의 커리어 분석이 정확해져요.',
  },
  {
    target: 'sns',
    tab: 'who',
    title: 'SNS',
    desc: '내 SNS 계정을 프로필에 연결해요.',
    Example: PreviewSNS,
    howLabel: '채우는 법',
    how: '연결할 계정을 골라 연동하면 끝이에요.',
    benefit: '방문자가 내 계정으로 바로 넘어가요.',
  },
  {
    target: 'vibe',
    tab: 'vibe',
    title: '바이브',
    desc: '좋아하는 것들로 내 취향과 일상을 보여줘요.',
    Example: PreviewLife,
    exampleScale: 0.5,
    howLabel: '채우는 법',
    how: '좋아하는 것을 카드로 올리고 한 줄 남겨요.',
    benefit: '취향이 겹치는 사람과 대화거리가 생겨요.',
  },
  {
    target: 'network',
    tab: 'network',
    title: '리멤버 네트워크',
    desc: '리멤버 명함으로 내 인맥 분포를 보여줘요.',
    Example: PreviewNetwork,
    howLabel: '채우는 법',
    how: '리멤버에서 명함을 엑셀로 내보내 올려요.',
    benefit: '겹치는 인맥으로 대화를 시작하기 쉬워요.',
  },
  {
    target: 'bookmark',
    title: '저장하기',
    desc: '다시 보고 싶은 사람은 저장해 두세요.',
    howLabel: '저장하는 법',
    how: '저장 버튼을 누르고 만난 곳을 메모해요.',
    benefit: '아카이브에서 언제든 다시 찾아봐요.',
  },
  {
    target: 'visitor-kemi',
    press: '리포트 보기',
    title: '나와의 케미',
    desc: '상대 프로필에선 나와 얼마나 잘 맞는지 보여줘요.',
    howLabel: '보는 법',
    how: '리포트 보기를 누르면 자세한 분석이 열려요.',
    benefit: '공통점으로 자연스럽게 대화를 시작해요.',
  },
  {
    target: 'experience',
    title: '경험 남기기',
    desc: '함께한 사람에게 평판 키워드와 피드백을 남겨요.',
    howLabel: '남기는 법',
    how: '키워드를 고르고 피드백을 적어요. 익명도 돼요.',
    benefit: '나도 받으면 평판이 쌓이고 케미 분석에 반영돼요.',
  },
]

export const PROFILE_TOUR_DEMO_START = PROFILE_TOUR_STEPS.findIndex((s) => s.target === 'bookmark')
/** 모든 단계를 본 뒤 내 프로필로 돌아와 띄우는 마무리 카드 */
export const PROFILE_TOUR_FINISH_STEP = PROFILE_TOUR_STEPS.length

const FIND_TIMEOUT_MS = 1500
const PAD = 8
const GAP = 12
const DIM = 'rgba(13,13,13,0.62)'
const EXAMPLE_HEIGHT = 136

type Rect = { top: number; left: number; width: number; height: number }
type Frame = { left: number; width: number }
type Phase = 'move' | 'spot'
type PressPoint = { x: number; y: number }

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// 부드러운 스크롤이 끝날 때까지(위치가 연속으로 안 바뀔 때까지) 대기, 최대 1초
async function waitForScrollSettle(el: HTMLElement) {
  let prevTop = el.getBoundingClientRect().top
  let stableCount = 0
  const startedAt = performance.now()
  while (performance.now() - startedAt < 1000) {
    await wait(80)
    const top = el.getBoundingClientRect().top
    stableCount = Math.abs(top - prevTop) < 1 ? stableCount + 1 : 0
    if (stableCount >= 2) return
    prevTop = top
  }
}

// 안내 카드 속 예시(실제 컴포넌트)에도 같은 data-tour가 있을 수 있어 오버레이 밖에서만 찾음
function queryOutsideOverlay(selector: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(selector))
  return all.find((el) => !el.closest('[data-tour-overlay]')) ?? null
}

function pickPressElement(target: HTMLElement, pressText?: string): HTMLElement {
  if (target.tagName === 'BUTTON') return target
  const buttons = Array.from(target.querySelectorAll<HTMLElement>('button'))
  if (pressText) {
    const match = buttons.find((b) => b.textContent?.includes(pressText))
    if (match) return match
  }
  return buttons[0] ?? target
}

function findScrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node
    node = node.parentElement
  }
  return null
}

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

function TourExample({ step }: { step: TourStep }) {
  const { Example } = step
  if (!Example) return null
  const scale = step.exampleScale ?? 0.8
  const anchorBottom = step.exampleAnchor === 'bottom'
  return (
    <div className="relative mt-3 overflow-hidden rounded-[14px] bg-[#F4F6F8]" style={{ height: EXAMPLE_HEIGHT }}>
      <div
        className="pointer-events-none absolute left-0"
        style={{
          width: `${100 / scale}%`,
          transform: `scale(${scale})`,
          transformOrigin: anchorBottom ? 'bottom left' : 'top left',
          ...(anchorBottom ? { bottom: 0 } : { top: 0 }),
        }}
      >
        <Example />
      </div>
      {!anchorBottom && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#F4F6F8] to-transparent" />
      )}
      <span className="absolute right-2 top-2 rounded-full bg-[#0D0D0D]/75 px-2 py-0.5 text-[11px] font-semibold text-white">
        예시
      </span>
    </div>
  )
}

export function ProfileTour({
  mode,
  activeTab,
  onTabChange,
}: {
  mode: 'owner' | 'demo'
  activeTab?: PublicProfileTabId
  onTabChange?: (tab: PublicProfileTabId) => void
}) {
  const router = useRouter()
  const stepIndex = useFeloreStore((s) => s.profileTourStep)
  const ownerLinkId = useFeloreStore((s) => s.user?.linkId)
  const setProfileTourStep = useFeloreStore((s) => s.setProfileTourStep)
  const endProfileTour = useFeloreStore((s) => s.endProfileTour)

  const step = PROFILE_TOUR_STEPS[stepIndex]
  const isFinish = stepIndex === PROFILE_TOUR_FINISH_STEP
  // 내 프로필 → 데모 프로필 라우팅 중에는 딤만 유지
  const waitingForDemo = mode === 'owner' && stepIndex >= PROFILE_TOUR_DEMO_START && !isFinish

  const [phase, setPhase] = useState<Phase>('move')
  const [pressKey, setPressKey] = useState<number | null>(null)
  const [pressPoint, setPressPoint] = useState<PressPoint | null>(null)
  const pressElRef = useRef<HTMLElement | null>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const [frame, setFrame] = useState<Frame | null>(null)
  const [tooltipHeight, setTooltipHeight] = useState(320)
  const targetRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const activeTabRef = useRef(activeTab)
  activeTabRef.current = activeTab

  const finish = () => {
    endProfileTour()
    if (mode === 'demo' && ownerLinkId) router.replace(`/${ownerLinkId}`)
  }

  const goNext = () => {
    // 퇴장 애니메이션 중인 이전 카드의 버튼이 눌려 단계를 두 번 넘기는 것 방지
    if (useFeloreStore.getState().profileTourStep !== stepIndex) return
    const next = stepIndex + 1
    setProfileTourStep(next)
    if (next === PROFILE_TOUR_FINISH_STEP) {
      if (ownerLinkId) router.replace(`/${ownerLinkId}`)
      return
    }
    if (mode === 'owner' && next === PROFILE_TOUR_DEMO_START) {
      router.push(`/${PROFILE_TOUR_DEMO_LINK_ID}`)
    }
  }
  const goNextRef = useRef(goNext)
  goNextRef.current = goNext

  const start = () => {
    endProfileTour()
    onTabChange?.('who')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 단계 진행: 딤 걷기 → (필요하면 탭 버튼 눌림 후 탭 전환) → 대상으로 스크롤 → 대상 버튼 눌림 → 딤 + 안내 카드
  useEffect(() => {
    if (!step || waitingForDemo || isFinish) return
    let cancelled = false

    const pressOn = async (el: HTMLElement) => {
      pressElRef.current = el
      setPressKey(Date.now())
      el.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(0.94)' }, { transform: 'scale(1)' }],
        { duration: 420, easing: 'ease-out' },
      )
      await wait(650)
      pressElRef.current = null
      setPressKey(null)
    }

    const findTarget = async () => {
      const startedAt = performance.now()
      while (!cancelled && performance.now() - startedAt < FIND_TIMEOUT_MS) {
        const el = queryOutsideOverlay(`[data-tour="${step.target}"]`)
        if (el && el.getBoundingClientRect().height >= 8) return el
        await wait(50)
      }
      return null
    }

    const run = async () => {
      setPhase('move')
      targetRef.current = null
      await wait(250)
      if (cancelled) return

      if (step.tab && step.tab !== activeTabRef.current) {
        const tabButton = queryOutsideOverlay(`[data-tour-tab="${step.tab}"]`)
        if (tabButton) {
          tabButton.scrollIntoView({ block: 'center', behavior: 'smooth' })
          await waitForScrollSettle(tabButton)
          if (cancelled) return
          await pressOn(tabButton)
          if (cancelled) return
        }
        onTabChange?.(step.tab)
        await wait(350)
        if (cancelled) return
      }

      const el = await findTarget()
      if (cancelled) return
      if (!el) {
        goNextRef.current()
        return
      }
      targetRef.current = el
      // 프로필은 문서 전체가 스크롤되는 구조라 scrollIntoView로 창까지 포함해 끌어옴.
      // 안내 카드가 길어서 대상은 화면 위쪽에 두고 카드를 그 아래에 띄움
      el.style.scrollMarginTop = '16px'
      el.scrollIntoView({ block: 'start', behavior: 'smooth' })
      await waitForScrollSettle(el)
      if (cancelled) return
      await pressOn(pickPressElement(el, step.press))
      if (cancelled) return
      setPhase('spot')
    }
    run()
    return () => {
      cancelled = true
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

      const pressEl = pressElRef.current
      if (pressEl) {
        const p = pressEl.getBoundingClientRect()
        const nextPoint = { x: p.left + p.width / 2, y: p.top + p.height / 2 }
        setPressPoint((prev) => (prev && Math.abs(prev.x - nextPoint.x) < 0.5 && Math.abs(prev.y - nextPoint.y) < 0.5 ? prev : nextPoint))
      }

      const h = tooltipRef.current?.offsetHeight
      if (h) setTooltipHeight((prev) => (prev === h ? prev : h))

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // 데모 프로필 → 내 프로필로 돌아가는 동안엔 딤만 유지하고 마무리 카드는 내 프로필에서 띄움
  if (isFinish && mode === 'demo') return <div className="fixed inset-0 z-[95]" style={{ background: DIM }} />
  if (isFinish) {
    return (
      <div className="fixed inset-0 z-[95] flex items-center justify-center" style={{ background: DIM }}>
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-4 flex w-full max-w-[398px] flex-col items-center rounded-[24px] bg-white px-6 pb-6 pt-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-[#F4F6F8]">
            <Sparkles size={22} className="text-[var(--color-accent-dark)]" />
          </span>
          <p className="mt-4 text-[20px] font-bold leading-[1.4] text-[#0D0D0D]">이제 펠로어를 시작해 볼까요?</p>
          <p className="mt-2 text-[14px] leading-[1.6] text-[#475058]">
            방금 둘러본 섹션을 하나씩 채우면서
            <br />
            나를 표현해 보세요.
          </p>
          <div className="mt-6 w-full">
            <Button onClick={start}>시작하기</Button>
          </div>
        </motion.div>
      </div>
    )
  }
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
  const spotVisible = phase === 'spot' && !!spot

  return (
    <div data-tour-overlay className="fixed inset-0 z-[95]" onClick={(e) => e.stopPropagation()}>
      <style>{`@keyframes profileTourPulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.08)}}`}</style>

      {spot && (
        <motion.div
          className="pointer-events-none absolute rounded-[18px]"
          initial={false}
          animate={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height, opacity: spotVisible ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 34, opacity: { duration: 0.3 } }}
          style={{ boxShadow: `0 0 0 9999px ${DIM}` }}
        >
          <span
            className="absolute inset-0 rounded-[18px] border-2 border-white"
            style={{ animation: 'profileTourPulse 1.4s ease-out infinite' }}
          />
        </motion.div>
      )}

      {/* 버튼을 누르는 손가락 탭 인터랙션 */}
      <AnimatePresence>
        {pressKey !== null && pressPoint && (
          <motion.div
            key={pressKey}
            className="pointer-events-none absolute"
            style={{ left: pressPoint.x, top: pressPoint.y }}
            exit={{ opacity: 0 }}
          >
            <motion.span
              className="absolute -left-7 -top-7 size-14 rounded-full border-2 border-[#0D0D0D]/40"
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute -left-4 -top-4 size-8 rounded-full bg-[#0D0D0D]/30"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0.85] }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {spotVisible && frame && (
          <motion.div
            key={stepIndex}
            ref={tooltipRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="absolute rounded-[20px] bg-white px-4 pb-4 pt-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
            style={{ left: frameLeft, width: frameWidth, ...tooltipPosition }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#8A949E]">
                {isDemoStep ? '다른 사람 프로필에서' : '내 프로필'}
              </span>
              <span className="text-[12px] font-semibold text-[#8A949E]">
                <span className="text-[#0D0D0D]">{stepIndex + 1}</span> / {PROFILE_TOUR_STEPS.length}
              </span>
            </div>
            <p className="mt-1 text-[17px] font-bold text-[#0D0D0D]">{step.title}</p>
            <p className="mt-0.5 text-[13px] leading-[1.5] text-[#475058]">{step.desc}</p>
            <TourExample step={step} />
            <dl className="mt-3 space-y-1.5">
              <div className="flex gap-2">
                <dt className="w-[64px] shrink-0 text-[12px] font-bold leading-[1.6] text-[#0D0D0D]">{step.howLabel}</dt>
                <dd className="text-[13px] leading-[1.5] text-[#475058]">{step.how}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-[64px] shrink-0 text-[12px] font-bold leading-[1.6] text-[var(--color-accent-dark)]">좋은 점</dt>
                <dd className="text-[13px] font-medium leading-[1.5] text-[var(--color-accent-dark)]">{step.benefit}</dd>
              </div>
            </dl>
            <div className="mt-3.5 flex items-center justify-between">
              <button type="button" onClick={finish} className="text-[13px] font-medium text-[#8A949E]">
                건너뛰기
              </button>
              <Button size="sm" fullWidth={false} onClick={goNext}>
                다음
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
