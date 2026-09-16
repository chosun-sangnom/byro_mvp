'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Brain, Images, Network, Sparkles, UserSearch } from 'lucide-react'
import { useFeloreStore } from '@/store/useFeloreStore'
import { Button } from '@/components/ui'

// ─── Shared "menu" list card (하이라이트/SNS/연락수단/저장한 프로필 공통 패턴) ──────────

function MenuCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-stretch overflow-hidden rounded-[12px] border border-[#DEE4EC] px-4">
      {children}
    </div>
  )
}

function MenuDivider() {
  return <div className="h-px w-full flex-shrink-0 bg-[#DEE4EC]" />
}

function MenuRow({ icon, boxed = true, title, sub, trailing }: { icon: ReactNode; boxed?: boolean; title: string; sub: string; trailing?: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between gap-3 py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {boxed ? (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#F5F6F7]">{icon}</div>
        ) : (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">{icon}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0D0D0D]">{title}</p>
          <p className="truncate text-xs font-medium text-[#6C7786]">{sub}</p>
        </div>
      </div>
      {trailing}
    </div>
  )
}

function StatusChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className="flex-shrink-0 rounded-[6px] px-1.5 py-1 text-xs font-bold"
      style={{ backgroundColor: active ? '#EEFBF2' : '#F5F6F7', color: active ? '#11C34B' : '#6C7786' }}
    >
      {label}
    </span>
  )
}

// ─── Mini preview components (Figma "온보딩 가이드" 목업 기준) ──────────────────

function PreviewBasicInfo() {
  return (
    <MenuCard>
      <MenuRow icon={<Brain size={18} className="text-[#6C7786]" />} title="MBTI" sub="예: ENFP · 재기발랄한 활동가" />
      <MenuDivider />
      <MenuRow icon={<Sparkles size={18} className="text-[#6C7786]" />} title="성향" sub="관계·소통 스타일을 알려줘요" />
    </MenuCard>
  )
}

// SCRUM-148: 손그림 UI 안내 대신 실제 화면 스크린샷 사용
function ScreenshotFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full overflow-hidden rounded-[12px] border" style={{ borderColor: '#DEE4EC' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="block w-full" />
    </div>
  )
}

function PreviewHighlight() {
  return <ScreenshotFrame src="/images/onboarding-guide-screens/highlight.png" alt="하이라이트 화면 예시" />
}

function PreviewLife() {
  return <ScreenshotFrame src="/images/onboarding-guide-screens/vibe.png" alt="바이브보드 화면 예시" />
}

function PreviewSNS() {
  return <ScreenshotFrame src="/images/onboarding-guide-screens/sns.png" alt="SNS 연동 화면 예시" />
}

function PreviewContact() {
  const rows = [
    { icon: '/images/onboarding-guide/contact-phone.svg', title: '전화', sub: '비활성화됨', status: '비활성', active: false },
    { icon: '/images/onboarding-guide/contact-email.svg', title: '이메일', sub: 'gangminjun@byro.io', status: '활성', active: true },
    { icon: '/images/onboarding-guide/contact-kakao.svg', title: '카카오', sub: '비활성화됨', status: '활성', active: true },
  ]
  return (
    <MenuCard>
      {rows.map((row, i) => (
        <div key={row.title} className="contents">
          {i > 0 && <MenuDivider />}
          <MenuRow
            // eslint-disable-next-line @next/next/no-img-element
            icon={<img src={row.icon} alt="" className="h-10 w-10" />}
            boxed={false}
            title={row.title}
            sub={row.sub}
            trailing={<StatusChip label={row.status} active={row.active} />}
          />
        </div>
      ))}
    </MenuCard>
  )
}

function PreviewNetwork() {
  return <ScreenshotFrame src="/images/onboarding-guide-screens/network.png" alt="리멤버 네트워크 화면 예시" />
}

function PreviewFeedback() {
  return <ScreenshotFrame src="/images/onboarding-guide-screens/feedback.png" alt="평판·피드백 화면 예시" />
}

function PreviewConnect() {
  return <ScreenshotFrame src="/images/onboarding-guide-screens/connect.png" alt="저장한 프로필 화면 예시" />
}

const WELCOME_FEATURES = [
  {
    key: 'who',
    Icon: UserSearch,
    gradientStops: [
      { offset: '20%', color: '#FF383C' },
      { offset: '100%', color: '#FFCC00' },
    ],
    title: 'WHO',
    desc: '내가 어떤 사람인지, 또 어떤 유형의 사람과 잘 맞는지 읽어줍니다.',
  },
  {
    key: 'vibe',
    Icon: Images,
    gradientStops: [
      { offset: '0%', color: '#34C759' },
      { offset: '100%', color: '#0088FF' },
    ],
    title: 'VIBE',
    desc: '나의 취향과 취미, 철학과 관점을 담은 나만의 바이브를 보여줍니다.',
  },
  {
    key: 'network',
    Icon: Network,
    gradientStops: [
      { offset: '20%', color: '#6155F5' },
      { offset: '100%', color: '#FF2D55' },
    ],
    title: 'NETWORK',
    desc: '주요 산업, 직무, 직급 등 나를 둘러싼 비즈니스 네트워크를 보여줍니다.',
  },
] as const

function WelcomeFeatureCard() {
  return (
    <div className="flex flex-col gap-10 rounded-[24px] border border-[#DEE4EC] bg-[rgba(255,255,255,0.8)] px-4 py-6">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          {WELCOME_FEATURES.map((f) => (
            <linearGradient key={f.key} id={`welcome-${f.key}-gradient`} x1="0%" y1="0%" x2={f.key === 'vibe' ? '0%' : '100%'} y2={f.key === 'vibe' ? '100%' : '0%'}>
              {f.gradientStops.map((stop) => (
                <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          ))}
        </defs>
      </svg>
      {WELCOME_FEATURES.map((f) => (
        <div key={f.key} className="flex items-start gap-2">
          <div className="flex h-10 w-[60px] flex-shrink-0 items-center justify-center">
            <f.Icon size={36} strokeWidth={1.6} color={`url(#welcome-${f.key}-gradient)`} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-black">{f.title}</p>
            <p className="mt-2.5 text-[13px] leading-[1.5] text-black/80">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Slide data ───────────────────────────────────────────────────────────────

interface GuideSlide {
  Preview: () => JSX.Element
  title: string
  tags: string[]
  value: string
  note?: string
  ctaLabel?: string
  ctaRoute?: string
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    Preview: PreviewBasicInfo,
    title: '기본정보',
    tags: ['MBTI', '성향'],
    value: 'MBTI와 성향을 채워두면 나와 잘 맞는 사람을 더 쉽게 찾을 수 있어요.',
    ctaLabel: '기본정보 채우러 가기',
    ctaRoute: '/me?section=whoiam',
  },
  {
    Preview: PreviewHighlight,
    title: '하이라이트',
    tags: ['경력', '학력', '수상', '자격증'],
    value: '먼저 보여주고싶은 이력과 강점을 정리해보세요.',
    note: '경력·학력은 스크린샷으로 채우거나, 건강보험공단 직장 이력 조회로 자동으로 채우고 인증받을 수 있어요.',
    ctaLabel: '하이라이트 채우러 가기',
    ctaRoute: '/me?section=highlight',
  },
  {
    Preview: PreviewLife,
    title: '바이브',
    tags: ['취향', '운동', '여행지', '음식'],
    value: '취향과 일상을 채우면 첫 대화 소재가 생겨요.',
    ctaLabel: '바이브 채우러 가기',
    ctaRoute: '/me?section=vibe',
  },
  {
    Preview: PreviewSNS,
    title: 'SNS',
    tags: ['인스타그램', '링크드인', '유튜브', '틱톡'],
    value: '자주 쓰는 채널을 연결하면 나다움이 더 잘 보여요.',
    ctaLabel: 'SNS 연동하러 가기',
    ctaRoute: '/me?section=sns',
  },
  {
    Preview: PreviewContact,
    title: '연락수단',
    tags: ['전화', '이메일', '카카오'],
    value: '연락 가능한 수단을 남겨두면 실제 만남으로 이어져요.',
    ctaLabel: '연락처 추가하러 가기',
    ctaRoute: '/me?section=contact',
  },
  {
    Preview: PreviewNetwork,
    title: '네트워크',
    tags: ['리멤버 명함', '공통 인맥'],
    value: '쌓아온 네트워크를 보여주면 연결 고리가 더 선명해져요.',
    note: '나중에 내 펠로어 > 네트워크에서 언제든 설정할 수 있어요.',
  },
  {
    Preview: PreviewFeedback,
    title: '피드백',
    tags: ['경험 키워드', '방명록'],
    value: '다른 사람이 남긴 신뢰 신호가 프로필을 더 단단하게 해줘요.',
  },
  {
    Preview: PreviewConnect,
    title: '저장한 프로필',
    tags: ['프로필 저장', '나중에 보기', '최근 본 프로필'],
    value: '관심 있는 프로필을 저장하고 언제든 다시 볼 수 있어요.',
  },
]

const TOTAL = GUIDE_SLIDES.length + 1

// ─── Main component ───────────────────────────────────────────────────────────

export function Step9Complete() {
  const store = useFeloreStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkId = store.user?.linkId || store.linkId || 'myongkoo'
  const welcomeName = store.user?.realName || store.onboardingName || '회원'
  const initialGuide = Number(searchParams.get('guide') ?? '0')
  const [slide, setSlide] = useState(Number.isFinite(initialGuide) ? Math.min(Math.max(initialGuide, 0), TOTAL - 1) : 0)
  const [showIntroText, setShowIntroText] = useState(false)
  const [showIntroPreview, setShowIntroPreview] = useState(false)

  useEffect(() => {
    if (!store.isLoggedIn) {
      store.completeOnboarding()
    }
  }, [store])

  useEffect(() => {
    const guideParam = Number(searchParams.get('guide') ?? '0')
    if (!Number.isFinite(guideParam)) return
    const nextSlide = Math.min(Math.max(guideParam, 0), TOTAL - 1)
    setSlide(nextSlide)
  }, [searchParams])

  useEffect(() => {
    if (slide !== 0) return
    setShowIntroText(false)
    setShowIntroPreview(false)
    const textTimer = window.setTimeout(() => setShowIntroText(true), 80)
    const previewTimer = window.setTimeout(() => setShowIntroPreview(true), 320)
    return () => {
      window.clearTimeout(textTimer)
      window.clearTimeout(previewTimer)
    }
  }, [slide])

  const goNext = () => { if (slide < TOTAL - 1) setSlide(slide + 1) }
  const goPrev = () => { if (slide > 0) setSlide(slide - 1) }
  const getGuideReturnRoute = () => {
    if (slide >= TOTAL - 1) return `/${linkId}`
    return `/signup?guide=${slide + 1}`
  }

  const isLastSlide = slide === TOTAL - 1
  const guide = slide > 0 ? GUIDE_SLIDES[slide - 1] : null

  return (
    <div className="flex flex-1 flex-col min-h-0 px-5 py-7">
      <div className="flex-1 overflow-y-auto">
        {slide === 0 ? (
          <div className="pt-5">
            <div className={`transition-all duration-500 ${showIntroText ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <p className="mb-2 text-[22px] font-bold leading-[1.35] tracking-[-0.03em] text-[#0D0D0D]">
                {welcomeName}님 환영합니다!
              </p>
              <p className="text-[16px] font-medium leading-[1.5] tracking-[-0.02em] text-[#475058]">
                이제 자유롭게 나를 표현하는 Felore를 만들어보세요!
              </p>
            </div>

            <div className={`mt-12 transition-all duration-500 ${showIntroPreview ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
              <WelcomeFeatureCard />
            </div>
          </div>
        ) : guide ? (
          <div className="pt-5">
            <div className="mb-12 flex flex-col gap-2">
              <p className="text-[16px] font-medium tracking-[-0.02em] text-[#6C7786]">
                {slide}/{GUIDE_SLIDES.length}
              </p>
              <h2 className="text-[22px] font-bold leading-[1.35] tracking-[-0.03em] text-[#0D0D0D]">{guide.title}</h2>
              <p className="text-[16px] font-medium leading-[1.5] tracking-[-0.02em] text-[#475058]">{guide.value}</p>
              {guide.note && (
                <p className="text-xs leading-relaxed text-[#6C7786]">{guide.note}</p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="pointer-events-none">
                <guide.Preview />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {guide.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#25313D] px-2.5 py-1.5 text-sm font-bold text-white">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom buttons */}
      {slide === 0 ? (
        <div className="space-y-3 pt-6">
          <Button onClick={goNext}>Felore 채우기</Button>
          <Button variant="outline" onClick={() => router.replace(`/${linkId}`)} style={{ borderRadius: 9999 }}>나중에 할게요</Button>
        </div>
      ) : isLastSlide ? (
        <div className="space-y-3 pt-5">
          {guide?.ctaRoute && (
            <Button onClick={() => router.replace(`${guide.ctaRoute!}&returnTo=${encodeURIComponent(getGuideReturnRoute())}`)}>
              {guide.ctaLabel}
            </Button>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} style={{ borderRadius: 9999 }}>이전</Button>
            <Button onClick={() => router.replace(`/${linkId}`)}>완료</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pt-5">
          {guide?.ctaRoute && (
            <Button onClick={() => router.replace(`${guide.ctaRoute!}&returnTo=${encodeURIComponent(getGuideReturnRoute())}`)}>
              {guide.ctaLabel}
            </Button>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev} style={{ borderRadius: 9999 }}>이전</Button>
            <Button onClick={goNext}>다음</Button>
          </div>
        </div>
      )}
    </div>
  )
}
