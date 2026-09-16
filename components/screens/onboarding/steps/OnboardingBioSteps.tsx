'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Images, Network, UserSearch } from 'lucide-react'
import { useFeloreStore } from '@/store/useFeloreStore'
import { Button } from '@/components/ui'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'
import { JIMIN_PROFILE, SAMPLE_PROFILE, getPublicProfileByUsername } from '@/lib/mocks/publicProfiles'
import {
  ContactActionButton,
  ProfileFeedbackSection,
  ProfileRememberSection,
  ProfileReputationSummarySection,
} from '@/components/screens/profile/PublicProfileSections'
import { ProfileHighlightsSection } from '@/components/screens/profile/PublicProfileHighlightsSection'
import { ProfileSnsSection } from '@/components/screens/profile/PublicProfileSnsSection'
import { Collage, LAYOUTS, pickCollageEntries } from '@/components/screens/profile/PublicProfileLifeSection'
import { ProfileHeroCard } from '@/components/screens/profile/PublicProfileHeroSection'
import { PublicProfileWhoIAmSection } from '@/components/screens/profile/PublicProfileWhoIAmSection'
import { SavedProfileRow } from '@/components/screens/archive/Archive'
import { flattenVibe } from '@/lib/vibeItems'
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

// ─── Mini preview components (Figma "온보딩 가이드" 목업 기준) ──────────────────

// 기본정보 — 실제 PublicProfileWhoIAmSection 재사용(이지민 자기소개·성향). 자기소개 →
// 성향 순서로 한 글자씩 써지는 타이핑 애니메이션. 실제 컴포넌트가 렌더링할 문자열을
// 타이핑 진행률만큼 잘라 넘기는 방식이라 UI 자체는 100% 실제 컴포넌트 그대로다.
const TYPE_SPEED = 22

function PreviewBasicInfo() {
  const bioSource = JIMIN_PROFILE.bio
  const personalitySource = JIMIN_PROFILE.whoIAm.personality
  const bio = useTypewriter(bioSource, { startDelay: 200, speed: TYPE_SPEED })
  const personalityDelay = 200 + bioSource.length * TYPE_SPEED + 300
  const personality = useTypewriter(personalitySource, { startDelay: personalityDelay, speed: TYPE_SPEED })
  return <PublicProfileWhoIAmSection bio={bio} whoIAm={{ mbti: JIMIN_PROFILE.whoIAm.mbti, personality }} />
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
    <ProfileHighlightsSection
      groupedHighlights={groupedHighlights}
      username="jiminlee"
      primaryHighlightOverrides={{}}
      getHighlightOpen={(key) => openKeys.has(key)}
      onToggleHighlight={() => {}}
    />
  )
}

// 바이브 — 콘텐츠 그리드 전체가 아니라 무드보드(콜라주)만, 카드가 하나씩 올라오는 스태거 애니메이션
function PreviewLife() {
  const [collage] = useState(() => {
    const entries = flattenVibe(JIMIN_PROFILE.life)
    return {
      entries: pickCollageEntries(entries),
      layout: LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)],
    }
  })
  return <Collage entries={collage.entries} layout={collage.layout} onOpen={() => {}} animated />
}

// SNS — 실제 ProfileSnsSection 재사용, 인스타그램+링크드인 둘 다 노출(링크드인은 데모용 임의 값)
function PreviewSNS() {
  return (
    <ProfileSnsSection
      instagramConnected
      linkedinConnected
      instagram={{ username: JIMIN_PROFILE.instagram.username, profileUrl: JIMIN_PROFILE.instagram.profileUrl }}
      linkedin={{ profileUrl: 'https://www.linkedin.com/in/jiminlee' }}
    />
  )
}

// 연락수단 — 연락 버튼 그리드를 바로 보여주는 대신, 실제 프로필 히어로 카드에서
// 우상단 "연락하기" 아이콘을 탭하는 애니메이션을 재생한 뒤 실제 연락처 시트를 여는
// 2단계 데모(SCRUM-127에서 만든 실제 흐름 그대로)
function PreviewContact() {
  const [sheetOpen, setSheetOpen] = useState(false)
  useEffect(() => {
    const openTimer = setTimeout(() => setSheetOpen(true), 1300)
    return () => clearTimeout(openTimer)
  }, [])
  return (
    <div className="px-5">
      {/* 실제 BottomSheet(z-[80], 전체화면)는 가이드 하단 이전/다음 버튼까지 덮어버리므로,
          데모에서는 히어로 카드 영역 안에서만 슬라이드업하는 축소 버전을 보여준다. */}
      <div className="relative overflow-hidden rounded-[var(--radius-hero)]">
        <ProfileHeroCard
          profile={{ ...JIMIN_PROFILE, mbti: JIMIN_PROFILE.whoIAm.mbti }}
          heroTheme={JIMIN_PROFILE.heroTheme}
          activeImage={JIMIN_PROFILE.profileImages[0]}
          onContactClick={() => {}}
          demoPulseContact
        />
        <AnimatePresence>
          {sheetOpen && (
            <>
              <motion.div
                className="absolute inset-0 z-10 bg-black/45"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="absolute inset-x-0 bottom-0 z-10 rounded-t-2xl px-5 pb-6 pt-3"
                style={{ backgroundColor: 'var(--color-bg-surface)' }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-[var(--color-border-default)]" />
                <div className="mb-5 text-[18px] font-bold text-[#0D0D0D]">
                  {JIMIN_PROFILE.name}님에게 연락하기
                </div>
                <div className="flex justify-around">
                  {JIMIN_PROFILE.contactChannels.map((channel) => (
                    <ContactActionButton key={channel.id} channel={channel} onClick={() => {}} />
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// 네트워크 — 실제 ProfileRememberSection 재사용 (이지민 리멤버 네트워크 통계).
// 공유 컴포넌트 자체 여백(pt-6)은 그대로 두고, 가이드 슬라이드에서만 상단 여백을 보정.
function PreviewNetwork() {
  const r = JIMIN_PROFILE.rememberHighlight
  return (
    <div className="-mt-4">
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
    .slice(0, 3)
    .map((item) => ({ keyword: item.keyword, count: item.count }))
  const totalKeywordCount = keywordCounts.reduce((sum, item) => sum + item.count, 0)
  const featuredGuestbook = JIMIN_PROFILE.guestbook.slice(0, 2)
  return (
    <>
      <ProfileReputationSummarySection keywordCounts={keywordCounts} totalKeywordCount={totalKeywordCount} />
      <ProfileFeedbackSection
        profile={{ guestbook: { length: JIMIN_PROFILE.guestbook.length } }}
        featuredGuestbook={featuredGuestbook}
        getProfileAvatar={(linkId) => getPublicProfileByUsername(linkId)?.avatarImage ?? ''}
        onGuestbookEntryClick={() => {}}
        onOpenGuestbook={() => {}}
      />
    </>
  )
}

// 저장한 프로필 — 실제 아카이브 화면과 같은 카드로 하나씩 나타나는 스태거 애니메이션
const connectContainer = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const connectItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

// 저장한 프로필 — 실제 SavedProfileRow(아카이브 화면과 동일 컴포넌트) 재사용, 하나씩 나타나는 스태거
function PreviewConnect() {
  const profiles = SAMPLE_PROFILE.savedProfiles.slice(0, 4)
  return (
    <motion.div
      variants={connectContainer}
      initial="hidden"
      animate="show"
      className="overflow-hidden rounded-[24px] border-[0.66px] border-[#DEE4EC]"
    >
      {profiles.map((p, i) => (
        <motion.div key={p.id} variants={connectItem}>
          <SavedProfileRow profile={p} isLast={i === profiles.length - 1} onOpen={() => {}} onMenuClick={() => {}} />
        </motion.div>
      ))}
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
