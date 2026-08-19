'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BadgeCheck, ChevronRight, Images, Mail, MessageCircle, Network, Phone, UserSearch } from 'lucide-react'
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

function MenuRow({ icon, title, sub, trailing }: { icon: ReactNode; title: string; sub: string; trailing?: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between gap-3 py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#F5F6F7] text-[18px]">{icon}</div>
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

function CardHeader({ label, title, badge }: { label: string; title: string; badge: string }) {
  return (
    <div className="mb-5 flex w-full flex-col gap-1">
      <p className="text-sm font-medium text-[#6C7786]">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-[18px] font-bold text-[#0D0D0D]">{title}</p>
        <span className="flex-shrink-0 rounded-[6px] bg-[#25313D] px-1.5 py-1 text-xs font-bold text-white">{badge}</span>
      </div>
    </div>
  )
}

// ─── Mini preview components (Figma "온보딩 가이드" 목업 기준) ──────────────────

function PreviewBasicInfo() {
  return (
    <MenuCard>
      <MenuRow icon="🧠" title="MBTI" sub="예: ENFP · 재기발랄한 활동가" trailing={<ChevronRight size={24} className="flex-shrink-0 text-[#A8B1BD]" />} />
      <MenuDivider />
      <MenuRow icon="✨" title="성향" sub="관계·소통 스타일을 알려줘요" trailing={<ChevronRight size={24} className="flex-shrink-0 text-[#A8B1BD]" />} />
    </MenuCard>
  )
}

function PreviewHighlight() {
  const items = [
    { emoji: '💼', title: 'Product Owner', sub: '스타트업 · 5년' },
    { emoji: '🎓', title: '연세대학교 경영학과', sub: '2015 졸업' },
    { emoji: '🏆', title: '우수 스타트업 대상', sub: '중기부 · 2023' },
  ]
  return (
    <MenuCard>
      {items.map((item, i) => (
        <div key={item.title} className="contents">
          {i > 0 && <MenuDivider />}
          <MenuRow icon={item.emoji} title={item.title} sub={item.sub} trailing={<ChevronRight size={24} className="flex-shrink-0 text-[#A8B1BD]" />} />
        </div>
      ))}
    </MenuCard>
  )
}

function PreviewLife() {
  const Cell = ({ color, label, name, sub, className }: { color: string; label: string; name: string; sub?: string; className: string }) => (
    <div className={`relative flex flex-col justify-end overflow-hidden rounded-[6px] bg-[var(--color-bg-muted)] p-1.5 ${className}`}>
      <span className="absolute left-1.5 top-1.5 rounded-[6px] px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ backgroundColor: color }}>
        {label}
      </span>
      <p className="truncate text-[9px] font-semibold text-[#0D0D0D]">{name}</p>
      {sub && <p className="truncate text-[8px] text-[#6C7786]">{sub}</p>}
    </div>
  )
  return (
    <div className="flex h-[220px] w-full gap-1">
      <div className="grid flex-[1.4] grid-rows-[1.4fr_1fr] gap-1">
        <Cell color="#0657FF" label="책" name="보통의 언어들" sub="김하나" className="" />
        <div className="grid grid-cols-2 gap-1">
          <Cell color="#F4832F" label="카페" name="오츠커피" sub="한남동" className="" />
          <Cell color="#11C34B" label="운동" name="필라테스" className="" />
        </div>
      </div>
      <div className="grid flex-1 grid-rows-[1.3fr_1fr] gap-1">
        <Cell color="#6541F2" label="영화" name="작은 아씨들" sub="2019" className="" />
        <Cell color="#FF4242" label="애완동물" name="보리" sub="강아지" className="" />
      </div>
    </div>
  )
}

function PreviewSNS() {
  const rows = [
    { icon: '📷', iconColor: '#E1306C', title: 'Instagram', sub: '@myongkoo', status: '연동됨', active: true },
    { icon: 'in', iconColor: '#0A66C2', title: 'LinkedIn', sub: 'linkedin.com/in/myongkoo', status: '연동됨', active: true },
    { icon: '▶', iconColor: '#FF0000', title: 'YouTube', sub: '구독자 기반 콘텐츠 연결', status: '미연동', active: false },
    { icon: 'T', iconColor: '#000', title: 'TikTok', sub: '준비 중', status: '미연동', active: false },
  ]
  return (
    <MenuCard>
      {rows.map((row, i) => (
        <div key={row.title} className="contents">
          {i > 0 && <MenuDivider />}
          <MenuRow
            icon={<span className="text-[15px] font-black" style={{ color: row.iconColor }}>{row.icon}</span>}
            title={row.title}
            sub={row.sub}
            trailing={<StatusChip label={row.status} active={row.active} />}
          />
        </div>
      ))}
    </MenuCard>
  )
}

function PreviewContact() {
  const rows = [
    { Icon: Phone, title: '전화', sub: '비활성화됨', status: '비활성', active: false },
    { Icon: Mail, title: '이메일', sub: 'gangminjun@byro.io', status: '활성', active: true },
    { Icon: MessageCircle, title: '카카오', sub: '비활성화됨', status: '활성', active: true },
  ]
  return (
    <MenuCard>
      {rows.map((row, i) => (
        <div key={row.title} className="contents">
          {i > 0 && <MenuDivider />}
          <MenuRow icon={<row.Icon size={18} className="text-[#6C7786]" />} title={row.title} sub={row.sub} trailing={<StatusChip label={row.status} active={row.active} />} />
        </div>
      ))}
    </MenuCard>
  )
}

function PreviewNetwork() {
  return (
    <div className="w-full rounded-[12px] border border-[#DEE4EC] p-4">
      <CardHeader label="리멤버 네트워크" title="명함 기반 관계 네트워크" badge="총 247명" />
      <svg viewBox="0 0 280 110" className="w-full" fill="none">
        <polyline points="0,70 40,90 80,60 120,75 160,50 200,85 240,20 280,60" stroke="#0657FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="0,55 40,80 80,70 120,55 160,65 200,45 240,55 280,50" stroke="#25313D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <polyline points="0,90 40,60 80,85 120,65 160,80 200,60 240,75 280,70" stroke="#A8B1BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="mt-3 flex items-center gap-3">
        {[
          { color: '#0657FF', label: 'IT/테크', count: 112 },
          { color: '#25313D', label: '금융/투자', count: 94 },
          { color: '#A8B1BD', label: '교육/연구', count: 53 },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] font-medium text-[#6C7786]">{item.label} {item.count}명</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewFeedback() {
  const rows = [
    [{ kw: '실행력', cnt: 12 }, { kw: '신뢰감', cnt: 9 }, { kw: '창의적', cnt: 7 }],
    [{ kw: '꼼꼼함', cnt: 6 }, { kw: '리더십', cnt: 4 }],
  ]
  return (
    <div className="w-full rounded-[12px] border border-[#DEE4EC] p-4">
      <CardHeader label="평판" title="누적 평판" badge="총 38개" />
      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-1.5">
            {row.map(({ kw, cnt }) => (
              <span key={kw} className="flex items-center gap-1.5 rounded-full border border-[#DEE4EC] bg-white px-3.5 py-2 text-sm text-[#25313D]">
                <span className="font-medium">{kw}</span>
                <span className="font-semibold">{cnt}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewConnect() {
  const profiles = [
    { initial: '김', bg: '#F0F5FF', name: '김철수', sub: 'B2B Sales · 5년차', savedAt: '어제', verified: true },
    { initial: '이', bg: '#F4F2FE', name: '이지현', sub: '브랜드 마케터 · 3년차', savedAt: '3일 전', verified: false },
    { initial: '박', bg: '#FEF3EA', name: '박준혁', sub: 'iOS 개발자 · 7년차', savedAt: '1주 전', verified: false },
  ]
  return (
    <MenuCard>
      {profiles.map((p, i) => (
        <div key={p.name} className="contents">
          {i > 0 && <MenuDivider />}
          <div className="flex w-full items-center justify-between gap-3 py-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#6C7786]" style={{ backgroundColor: p.bg }}>
                {p.initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="truncate text-sm font-semibold text-[#0D0D0D]">{p.name}</p>
                  {p.verified && <BadgeCheck size={12} className="flex-shrink-0 text-[#0657FF]" />}
                </div>
                <p className="truncate text-xs font-medium text-[#6C7786]">{p.sub}</p>
              </div>
            </div>
            <p className="flex-shrink-0 text-xs font-medium text-[#6C7786]">{p.savedAt}</p>
          </div>
        </div>
      ))}
    </MenuCard>
  )
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
                이제 자유롭게 나를 표현하는 FELORE를 만들어보세요!
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
