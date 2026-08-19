'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BadgeCheck, Images, Network, UserSearch } from 'lucide-react'
import { useFeloreStore } from '@/store/useFeloreStore'
import { Button } from '@/components/ui'

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
    { label: '☕ 카페', style: { gridColumn: '2 / 4', gridRow: '3' } },
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

function PreviewNetwork() {
  const industries = [
    { name: 'IT/스타트업', pct: 58 },
    { name: '금융', pct: 22 },
    { name: '컨설팅', pct: 13 },
    { name: '제조', pct: 7 },
  ]
  return (
    <div className="rounded-[18px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Remember</div>
          <div className="text-[17px] font-black tracking-tight text-[var(--color-text-strong)]">명함 기반 네트워크</div>
        </div>
        <div className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">총 247명</div>
      </div>
      <div className="space-y-2">
        {industries.map(({ name, pct }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="w-16 flex-shrink-0 text-[11px] text-[var(--color-text-tertiary)]">{name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-muted)]">
              <div className="h-full rounded-full bg-[var(--color-accent-dark)] opacity-60" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-6 text-right text-[10px] font-semibold text-[var(--color-text-tertiary)]">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewReputation() {
  const keywords = [
    { kw: '실행력', cnt: 12 },
    { kw: '신뢰감', cnt: 9 },
    { kw: '창의적', cnt: 7 },
    { kw: '꼼꼼함', cnt: 6 },
    { kw: '리더십', cnt: 4 },
  ]
  return (
    <div className="rounded-[18px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Reputation</div>
          <div className="text-[17px] font-black tracking-tight text-[var(--color-text-strong)]">누적 평판</div>
        </div>
        <div className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">총 38</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map(({ kw, cnt }) => (
          <span key={kw} className="chip-metric">
            {kw} <span className="font-black text-[var(--color-text-strong)]">{cnt}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function PreviewConnect() {
  const profiles = [
    { initial: '김', name: '김철수', sub: 'B2B Sales · 5년차', savedAt: '어제' },
    { initial: '이', name: '이지현', sub: '브랜드 마케터 · 3년차', savedAt: '3일 전' },
    { initial: '박', name: '박준혁', sub: 'iOS 개발자 · 7년차', savedAt: '1주 전' },
  ]
  return (
    <div className="rounded-[18px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] divide-y divide-[var(--color-border-soft)]">
      {profiles.map((p) => (
        <div key={p.name} className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-[12px] font-bold text-[var(--color-text-secondary)] flex-shrink-0">{p.initial}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">{p.name}</div>
            <div className="text-[11px] text-[var(--color-text-tertiary)]">{p.sub}</div>
          </div>
          <div className="text-[10px] text-[var(--color-text-tertiary)]">{p.savedAt}</div>
        </div>
      ))}
    </div>
  )
}

function PreviewSNS() {
  const rows = [
    { icon: '▶', iconColor: '#FF0000', title: 'YouTube', sub: '구독자 기반 콘텐츠 연결', connected: false },
    { icon: 'in', iconColor: '#0A66C2', title: 'LinkedIn', sub: 'linkedin.com/in/myongkoo', connected: true },
    { icon: '📷', iconColor: '#E1306C', title: 'Instagram', sub: '@myongkoo', connected: true },
    { icon: 'T', iconColor: '#000', title: 'TikTok', sub: '준비 중', connected: false },
  ]
  return (
    <div className="rounded-[18px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 divide-y divide-[var(--color-border-soft)]">
      {rows.map((row) => (
        <div key={row.title} className="flex items-center gap-3 py-3">
          <span className="text-[13px] font-black w-[18px] text-center flex-shrink-0" style={{ color: row.iconColor }}>{row.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">{row.title}</div>
            <div className={`text-[11px] truncate ${row.connected ? 'text-[var(--color-accent-dark)]' : 'text-[var(--color-text-tertiary)]'}`}>{row.sub}</div>
          </div>
          {row.connected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-state-success-text)] flex-shrink-0" />}
        </div>
      ))}
    </div>
  )
}

function PreviewContact() {
  return (
    <div className="space-y-2">
      {[
        { label: '010-1234-5678' },
        { label: 'kakao_myongkoo' },
        { label: 'hello@felore.io' },
      ].map(({ label }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-3">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{label}</span>
        </div>
      ))}
    </div>
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
    Preview: PreviewHighlight,
    title: '하이라이트',
    tags: ['경력', '학력', '수상', '자격증'],
    value: '먼저 보여주고 싶은 이력과 강점을 정리해보세요',
    ctaLabel: '하이라이트 채우러 가기',
    ctaRoute: '/me?section=highlight',
  },
  {
    Preview: PreviewLife,
    title: '바이브',
    tags: ['취향', '운동', '플레이스', '음식'],
    value: '취향과 일상을 채우면 첫 대화 소재가 생겨요',
    ctaLabel: '바이브 채우러 가기',
    ctaRoute: '/me?section=vibe',
  },
  {
    Preview: PreviewSNS,
    title: 'SNS',
    tags: ['인스타그램', '링크드인', '유튜브', '틱톡'],
    value: '자주 쓰는 채널을 연결하면 나다움이 더 잘 보여요',
    ctaLabel: 'SNS 연동하러 가기',
    ctaRoute: '/me?section=sns',
  },
  {
    Preview: PreviewContact,
    title: '연락수단',
    tags: ['전화', '이메일', '메신저'],
    value: '연락 가능한 수단을 남겨두면 실제 만남으로 이어져요',
    ctaLabel: '연락처 추가하러 가기',
    ctaRoute: '/me?section=contact',
  },
  {
    Preview: PreviewNetwork,
    title: '네트워크',
    tags: ['리멤버 명함', '공통 인맥'],
    value: '쌓아온 네트워크를 보여주면 연결 고리가 더 선명해져요',
  },
  {
    Preview: PreviewReputation,
    title: '평판',
    tags: ['경험 키워드', '방명록'],
    value: '다른 사람이 남긴 신뢰 신호가 프로필을 더 단단하게 해줘요',
  },
  {
    Preview: PreviewConnect,
    title: '저장한 프로필',
    tags: ['프로필 저장', '나중에 보기', '최근 본 프로필'],
    value: '관심 있는 프로필을 저장하고 언제든 다시 볼 수 있어요',
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
          <div className="pt-2">
            <div className="mb-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-2">
                {slide} / {GUIDE_SLIDES.length}
              </p>
              <h2 className="text-[28px] font-black leading-[1.15] text-[var(--color-text-strong)] mb-2">{guide.title}</h2>
              <p className="text-[15px] font-semibold text-[var(--color-accent-dark)] leading-snug">{guide.value}</p>
            </div>

            <div className="pointer-events-none mb-5">
              <guide.Preview />
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5">
                {guide.tags.map((tag) => (
                  <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
                    {tag}
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
