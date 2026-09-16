'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { Brain, Images, Network, Sparkles, UserSearch } from 'lucide-react'
import { useFeloreStore } from '@/store/useFeloreStore'
import { Avatar, Button } from '@/components/ui'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'
import { JIMIN_PROFILE, SAMPLE_PROFILE, getPublicProfileByUsername } from '@/lib/mocks/publicProfiles'
import {
  ProfileConnectSection,
  ProfileFeedbackSection,
  ProfileRememberSection,
  ProfileReputationSummarySection,
} from '@/components/screens/profile/PublicProfileSections'
import { ProfileHighlightsSection } from '@/components/screens/profile/PublicProfileHighlightsSection'
import { ProfileSnsSection } from '@/components/screens/profile/PublicProfileSnsSection'
import type { Highlight } from '@/types'

// SCRUM-148: 온보딩 가이드 미리보기는 이지민(/jiminlee) 실제 목업 데이터를 그대로 써서
// 실제 서비스 화면과 같은 컴포넌트를 재사용한다 (스크린샷이 아니라 라이브 컴포넌트 + 진입 애니메이션).
function buildGroupedHighlights(manualHighlights: Highlight[]) {
  return HIGHLIGHT_GROUPS.map((group) => {
    const manualItems = manualHighlights.filter(
      (item) => HIGHLIGHT_CATEGORIES.find((category) => category.id === item.categoryId)?.group === group.id,
    )
    const manualGroups = Array.from(new Map(
      manualItems.map((item) => [item.categoryId, manualItems.filter((manual) => manual.categoryId === item.categoryId)]),
    ).entries()).map(([categoryId, items]) => ({
      kind: 'manual-group' as const,
      categoryId,
      items,
    }))
    return { ...group, items: manualGroups }
  }).filter((group) => group.items.length > 0)
}

// 타이핑 애니메이션 — 기본정보 슬라이드에서 예시 문구가 한 글자씩 써지는 느낌
function useTypewriter(text: string, { speed = 28, startDelay = 0 }: { speed?: number; startDelay?: number } = {}) {
  const [output, setOutput] = useState('')
  useEffect(() => {
    let i = 0
    let interval: ReturnType<typeof setInterval> | null = null
    setOutput('')
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setOutput(text.slice(0, i))
        if (i >= text.length && interval) clearInterval(interval)
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(start)
      if (interval) clearInterval(interval)
    }
  }, [text, speed, startDelay])
  return output
}

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

// ─── Mini preview components (Figma "온보딩 가이드" 목업 기준) ──────────────────

// 기본정보 — 예시 문구가 한 글자씩 써지는 타이핑 애니메이션 (MBTI → 성향 순서로)
const MBTI_EXAMPLE = 'ENFP · 재기발랄한 활동가'
const PERSONALITY_EXAMPLE = '관계·소통 스타일을 알려줘요'
const TYPE_SPEED = 28

function PreviewBasicInfo() {
  const mbti = useTypewriter(MBTI_EXAMPLE, { startDelay: 200, speed: TYPE_SPEED })
  const personalityDelay = 200 + MBTI_EXAMPLE.length * TYPE_SPEED + 300
  const personality = useTypewriter(PERSONALITY_EXAMPLE, { startDelay: personalityDelay, speed: TYPE_SPEED })
  return (
    <MenuCard>
      <MenuRow icon={<Brain size={18} className="text-[#6C7786]" />} title="MBTI" sub={mbti || ' '} />
      <MenuDivider />
      <MenuRow icon={<Sparkles size={18} className="text-[#6C7786]" />} title="성향" sub={personality || ' '} />
    </MenuCard>
  )
}

// 하이라이트 — 실제 ProfileHighlightsSection 재사용(이지민 경력·학력) + 잠시 후 토글이 저절로 펼쳐지는 데모
function PreviewHighlight() {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())
  useEffect(() => {
    const t = setTimeout(() => setOpenKeys(new Set(['group_career-role_jiminlee'])), 900)
    return () => clearTimeout(t)
  }, [])
  const groupedHighlights = buildGroupedHighlights(JIMIN_PROFILE.manualHighlights)
  return (
    <div className="-mx-5">
      <ProfileHighlightsSection
        groupedHighlights={groupedHighlights}
        username="jiminlee"
        primaryHighlightOverrides={{}}
        getHighlightOpen={(key) => openKeys.has(key)}
        onToggleHighlight={() => {}}
      />
    </div>
  )
}

// 바이브보드 — 이지민의 실제 취향 데이터로 카드가 하나씩 떠오르는 스태거 애니메이션
const vibeContainer = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }
const vibeItem: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

function PreviewLife() {
  const { daily, tastes } = JIMIN_PROFILE.life
  const items = [
    { key: 'exercise', color: '#11C34B', label: '운동', name: daily.exercise[0].label, sub: undefined, src: daily.exercise[0].posterUrl },
    { key: 'movie', color: '#6541F2', label: '영화', name: tastes.movies[0].label, sub: tastes.movies[0].sublabel, src: tastes.movies[0].posterUrl },
    { key: 'music', color: '#F4832F', label: '음악', name: tastes.music[0].label, sub: tastes.music[0].sublabel, src: tastes.music[0].posterUrl },
    { key: 'book', color: '#0657FF', label: '책', name: tastes.books[0].label, sub: tastes.books[0].sublabel, src: tastes.books[0].posterUrl },
    { key: 'restaurant', color: '#FF6B00', label: '맛집', name: tastes.restaurants[0].label, sub: tastes.restaurants[0].sublabel, src: tastes.restaurants[0].posterUrl },
    { key: 'cafe', color: '#1DAEFF', label: '카페', name: tastes.cafes[0].label, sub: tastes.cafes[0].sublabel, src: tastes.cafes[0].posterUrl },
  ]
  return (
    <div>
      <p className="mb-2 text-[13.5px] font-bold text-[#0D0D0D]">무드보드</p>
      <motion.div variants={vibeContainer} initial="hidden" animate="show" className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <motion.div key={item.key} variants={vibeItem} className="relative aspect-square overflow-hidden rounded-[14px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 from-[10%] to-transparent to-[60%]" />
            <span
              className="absolute left-2 top-2 rounded-[6px] px-1.5 py-0.5 text-[9px] font-bold text-white"
              style={{ backgroundColor: item.color }}
            >
              {item.label}
            </span>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="truncate text-[11px] font-semibold text-white">{item.name}</p>
              {item.sub && <p className="truncate text-[10px] text-white/85">{item.sub}</p>}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// SNS — 실제 ProfileSnsSection 재사용 (이지민 Instagram 연동)
function PreviewSNS() {
  return (
    <div className="-mx-5">
      <ProfileSnsSection
        instagramConnected
        linkedinConnected={false}
        instagram={{ username: JIMIN_PROFILE.instagram.username, profileUrl: JIMIN_PROFILE.instagram.profileUrl }}
        linkedin={{ profileUrl: '' }}
      />
    </div>
  )
}

// 연락수단 — 실제 ProfileConnectSection 재사용 (이지민 전화·이메일·카카오)
function PreviewContact() {
  return (
    <div className="-mx-5">
      <ProfileConnectSection
        isOwnerMode={false}
        contactChannels={JIMIN_PROFILE.contactChannels}
        onRequestFeedback={() => {}}
        onChannelClick={() => {}}
      />
    </div>
  )
}

// 네트워크 — 실제 ProfileRememberSection 재사용 (이지민 리멤버 네트워크 통계)
function PreviewNetwork() {
  const r = JIMIN_PROFILE.rememberHighlight
  return (
    <div className="-mx-5">
      <ProfileRememberSection
        total={r.total}
        industries={r.industries}
        isLoggedIn={false}
        isOwner={false}
        mutualCompanies={r.mutualCompanies}
        topCompany={r.topCompany}
        topIndustry={r.topIndustry}
        topRole={r.topRole}
      />
    </div>
  )
}

// 피드백 — 실제 ProfileReputationSummarySection + ProfileFeedbackSection 재사용 (이지민 평판·방명록)
function PreviewFeedback() {
  const keywordCounts = [...JIMIN_PROFILE.reputationKeywords]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => ({ keyword: item.keyword, count: item.count }))
  const totalKeywordCount = keywordCounts.reduce((sum, item) => sum + item.count, 0)
  const featuredGuestbook = JIMIN_PROFILE.guestbook.slice(0, 3)
  return (
    <div className="-mx-5">
      <ProfileReputationSummarySection keywordCounts={keywordCounts} totalKeywordCount={totalKeywordCount} />
      <ProfileFeedbackSection
        profile={{ guestbook: { length: JIMIN_PROFILE.guestbook.length } }}
        featuredGuestbook={featuredGuestbook}
        getProfileAvatar={(linkId) => getPublicProfileByUsername(linkId)?.avatarImage ?? ''}
        onGuestbookEntryClick={() => {}}
        onOpenGuestbook={() => {}}
      />
    </div>
  )
}

// 저장한 프로필 — 실제 아카이브 화면과 같은 카드로 하나씩 나타나는 스태거 애니메이션
const connectContainer = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const connectItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

function PreviewConnect() {
  const profiles = SAMPLE_PROFILE.savedProfiles.slice(0, 4)
  return (
    <motion.div
      variants={connectContainer}
      initial="hidden"
      animate="show"
      className="overflow-hidden rounded-[24px] border-[0.66px] border-[#DEE4EC]"
    >
      {profiles.map((p, i) => {
        const meta = getPublicProfileByUsername(p.linkId)
        return (
          <motion.div
            key={p.id}
            variants={connectItem}
            className={['flex flex-col gap-3 px-4 py-4', i < profiles.length - 1 ? 'border-b border-[#DEE4EC]' : ''].join(' ')}
          >
            <div className="flex items-center gap-2.5">
              <Avatar
                name={p.name}
                src={meta?.avatarImage}
                color={meta?.avatarColor}
                textColor={meta?.avatarImage ? undefined : '#6C7786'}
                size={44}
              />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[#0D0D0D]">{p.name}</p>
                {p.title && <p className="truncate text-[12px] font-medium text-[#6C7786]">{p.title}</p>}
              </div>
            </div>
            {p.memo && (
              <div className="flex items-center rounded-lg bg-[#F0F5FF] py-2.5 pl-3 pr-4">
                <span className="truncate text-[12px] font-medium text-[#25313D]">{p.memo}</span>
              </div>
            )}
          </motion.div>
        )
      })}
    </motion.div>
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
  const scrollRef = useRef<HTMLDivElement>(null)

  // SCRUM-148: 미리보기가 재사용하는 실제 섹션들은 whileInView로 등장 애니메이션을 트리거하는데,
  // 슬라이드가 이미 화면 안에 있는 채로 마운트되면 최초 교차 판정이 누락되는 경우가 있다.
  // window를 1px 살짝 흔들어 IntersectionObserver가 다시 판정하게 만든다 — 하이라이트처럼
  // 마운트 후 토글이 열려 내용이 길어지는 경우까지 잡도록 약간의 지연을 두고 한 번 더 흔든다.
  useEffect(() => {
    const nudge = () => {
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      scrollRef.current?.dispatchEvent(new Event('scroll'))
    }
    const raf = requestAnimationFrame(nudge)
    const t = setTimeout(nudge, 1100)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [slide])

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
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
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
