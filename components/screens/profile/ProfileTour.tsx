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
  /** 채운 모습 예시 — 가입 직후엔 섹션이 비어 있으니 어떻게 보일지 보여줌 */
  example?: string[]
  howLabel?: string
  how: string
  benefitLabel?: string
  benefit: string
}

export const PROFILE_TOUR_STEPS: TourStep[] = [
  {
    target: 'persona',
    title: 'AI 페르소나',
    body: 'AI가 내 프로필을 읽고 나를 한 문장으로 소개해 줘요. 방문자가 내 프로필에서 가장 먼저 읽는 문장이에요.',
    example: ['러닝하고 혁오 듣는 스타트업 마케터'],
    howLabel: '이렇게 만들어져요',
    how: '따로 쓰지 않아도 돼요. 직함과 바이브를 채우면 AI가 알아서 문장을 만들어요.',
    benefit: '처음 보는 사람도 이 한 문장만으로 내가 어떤 사람인지 바로 감을 잡아요.',
  },
  {
    target: 'kemi',
    title: '케미 리포트',
    body: '커리어, 평판, 성격, 생활, 취향 다섯 가지로 내가 어떤 사람과 잘 맞는지 분석해 줘요.',
    example: ['아이유를 좋아하고 한남동을 자주 찾는 분이에요. 같은 동네 카페 얘기로 대화를 시작해 보세요.'],
    howLabel: '이렇게 봐요',
    how: '프로필을 채운 뒤 리포트 보기를 누르면 돼요. 채운 항목이 많을수록 열리는 분석도 많아져요.',
    benefit: '다른 사람 프로필에 들어가면 나와의 케미가 바로 보여서, 잘 맞는 사람을 금방 알아볼 수 있어요.',
  },
  {
    target: 'whoiam',
    tab: 'who',
    title: '나',
    body: '자기소개와 MBTI, 성격으로 내가 어떤 사람인지 보여주는 곳이에요.',
    example: ['ENTJ', '관계에서 처음엔 거리를 두지만 신뢰가 쌓이면 깊이 연결되는 편이에요.'],
    how: '빈 칸을 눌러 MBTI를 고르고, 내 성격을 한두 문장으로 적어 보세요.',
    benefit: '케미 리포트의 성격 분석에 쓰여서, 나와 결이 맞는 사람을 더 정확히 찾아줘요.',
  },
  {
    target: 'highlight',
    tab: 'who',
    title: '하이라이트',
    body: '경력, 학력, 활동, 성과처럼 나를 증명하는 이력을 모아 보여줘요.',
    example: ['경력: Brand Lab 스타트업 마케터 (2022~현재)', '학력: 연세대학교 경영학 학사'],
    how: '이력서나 링크드인 화면을 캡처해 올리면 경력과 학력이 자동으로 채워져요. 직접 입력해도 돼요.',
    benefit: '케미 리포트의 커리어 분석이 정교해지고, 처음 만난 사람에게 내 이력을 일일이 설명하지 않아도 돼요.',
  },
  {
    target: 'sns',
    tab: 'who',
    title: 'SNS',
    body: '인스타그램, 링크드인, 유튜브, 틱톡 계정을 프로필에 연결해요.',
    example: ['Instagram @jimin_lee'],
    how: '빈 칸을 누르고 연결할 계정을 골라 연동하면 돼요.',
    benefit: '방문자가 프로필에서 바로 내 계정으로 넘어가 나를 더 깊이 알아볼 수 있어요.',
  },
  {
    target: 'vibe',
    tab: 'vibe',
    title: '바이브',
    body: '좋아하는 음악, 영화, 책, 운동, 맛집을 카드로 모아 내 취향과 일상을 보여주는 곳이에요.',
    example: ['운동: 러닝, 주말마다 한강 10km', '음악: 혁오의 Tomboy'],
    how: '좋아하는 것을 카드로 올리고, 왜 좋은지 한 줄씩 남겨 보세요.',
    benefit: '케미 리포트의 생활과 취향 분석에 반영되고, 취향이 겹치는 사람과 나눌 대화거리가 생겨요.',
  },
  {
    target: 'network',
    tab: 'network',
    title: '리멤버 네트워크',
    body: '리멤버에 쌓인 명함으로 내 인맥이 어떤 회사와 업계에 모여 있는지 보여줘요.',
    example: ['지금까지 183명을 리멤버했어요', '가장 많은 회사는 카카오, 산업군은 스타트업이에요'],
    how: '리멤버 앱에서 명함을 엑셀로 내보낸 뒤 파일을 올리면 돼요. 개인별 명함 정보는 저장하지 않아요.',
    benefit: '방문자가 나와 겹치는 회사 인맥을 볼 수 있어서, 공통 지인을 계기로 대화를 시작하기 쉬워져요.',
  },
  {
    target: 'experience',
    title: '경험 남기기',
    body: '함께 일해봤거나 만나본 사람의 프로필에 평판 키워드와 피드백을 남길 수 있어요.',
    howLabel: '이렇게 남겨요',
    how: '경험 남기기를 눌러 어울리는 키워드를 고르고 피드백을 적으면 돼요. 익명으로도 남길 수 있어요.',
    benefitLabel: '이런 점이 좋아요',
    benefit: '나도 경험을 받으면 평판 키워드가 프로필에 쌓여 신뢰를 보여주고, 케미 리포트의 평판 분석에도 반영돼요.',
  },
  {
    target: 'bookmark',
    title: '저장하기',
    body: '다시 보고 싶은 사람의 프로필을 저장해 둘 수 있어요.',
    howLabel: '이렇게 저장해요',
    how: '프로필 왼쪽 위 저장 버튼을 누르고, 어디서 만났는지 메모를 남겨 보세요.',
    benefitLabel: '저장하면 좋은 점',
    benefit: '저장한 프로필은 아카이브에 모여서, 언제 어디서 만난 사람인지 나중에 바로 찾아볼 수 있어요.',
  },
]

export const PROFILE_TOUR_DEMO_START = PROFILE_TOUR_STEPS.findIndex((s) => s.target === 'experience')
/** 모든 단계를 본 뒤 내 프로필로 돌아와 띄우는 마무리 카드 */
export const PROFILE_TOUR_FINISH_STEP = PROFILE_TOUR_STEPS.length

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
  const isFinish = stepIndex === PROFILE_TOUR_FINISH_STEP
  // 내 프로필 → 데모 프로필 라우팅 중에는 딤만 유지
  const waitingForDemo = mode === 'owner' && stepIndex >= PROFILE_TOUR_DEMO_START && !isFinish

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
    setProfileTourStep(next)
    if (next === PROFILE_TOUR_FINISH_STEP) {
      if (ownerLinkId) router.replace(`/${ownerLinkId}`)
      return
    }
    if (mode === 'owner' && next === PROFILE_TOUR_DEMO_START) {
      router.push(`/${PROFILE_TOUR_DEMO_LINK_ID}`)
    }
  }

  const start = () => {
    endProfileTour()
    onTabChange?.('who')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        // 프로필은 문서 전체가 스크롤되는 구조라 scrollIntoView로 창까지 포함해 끌어옴.
        // 안내 카드가 길어서 대상은 화면 위쪽에 두고 카드를 그 아래에 띄움
        el.style.scrollMarginTop = '16px'
        el.scrollIntoView({ block: 'start', behavior: 'smooth' })
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
            방금 둘러본 섹션을 하나씩 채우면서 나를 표현해 보세요. 채울수록 케미 리포트는 정확해지고, AI 페르소나는 더 나다워져요.
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
            className="absolute rounded-[20px] bg-white px-4 pb-4 pt-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
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
            <p className="mt-1.5 text-[17px] font-bold text-[#0D0D0D]">{step.title}</p>
            <p className="mt-1 text-[13px] leading-[1.5] text-[#475058]">{step.body}</p>
            {step.example && (
              <div className="mt-2.5 rounded-[12px] border border-dashed border-[#CBD3DE] px-3 py-2">
                <p className="text-[11px] font-semibold text-[#8A949E]">예시</p>
                {step.example.map((line) => (
                  <p key={line} className="mt-0.5 text-[13px] font-medium leading-[1.5] text-[#25313D]">{line}</p>
                ))}
              </div>
            )}
            <div className="mt-2.5">
              <p className="text-[12px] font-bold text-[#0D0D0D]">{step.howLabel ?? '이렇게 채워요'}</p>
              <p className="mt-0.5 text-[13px] leading-[1.5] text-[#475058]">{step.how}</p>
            </div>
            <div className="mt-2.5 rounded-[12px] bg-[#F4F6F8] px-3 py-2">
              <p className="flex items-center gap-1 text-[12px] font-bold text-[var(--color-accent-dark)]">
                <Sparkles size={12} className="shrink-0" />
                {step.benefitLabel ?? '채우면 좋은 점'}
              </p>
              <p className="mt-0.5 text-[13px] font-medium leading-[1.5] text-[var(--color-accent-dark)]">{step.benefit}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
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
