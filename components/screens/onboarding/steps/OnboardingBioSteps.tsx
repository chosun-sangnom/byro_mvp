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
        { label: 'hello@byro.io' },
      ].map(({ label }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-3">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{label}</span>
        </div>
      ))}
    </div>
  )
}

function PreviewByroIntro() {
  return (
    <div className="rounded-[26px] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] p-4 shadow-[0_16px_40px_rgba(17,17,17,0.06)]">
      <div className="rounded-[18px] bg-[var(--color-bg-muted)] p-3 mb-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)] mb-2">Profile Card</div>
        <div className="rounded-[16px] bg-white/90 px-3 py-3">
          <div className="text-[15px] font-black text-[var(--color-text-strong)]">강민준 · 31</div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">대화가 이어지는 라이프 프로필</div>
        </div>
      </div>
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-2">
        <div className="rounded-[18px] bg-[var(--color-bg-muted)] p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-2">라이프</div>
          <div className="grid gap-1" style={{ gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: '54px 40px' }}>
            <div className="rounded-[12px] bg-white/85 px-2 py-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">러닝</div>
            <div className="rounded-[12px] bg-white/85 px-2 py-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">재즈</div>
            <div className="rounded-[12px] bg-white/85 px-2 py-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">성수</div>
            <div className="rounded-[12px] bg-white/85 px-2 py-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">도쿄</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="rounded-[18px] bg-[var(--color-bg-muted)] p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-2">관계</div>
            <div className="flex flex-wrap gap-1">
              <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">신뢰가 가요</span>
              <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">대화가 편해요</span>
            </div>
          </div>
          <div className="rounded-[18px] bg-[var(--color-bg-muted)] p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-2">SNS</div>
            <div className="text-[11px] font-semibold text-[var(--color-text-secondary)]">Instagram · LinkedIn 연결</div>
          </div>
        </div>
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
  ctaLabel?: string
  ctaRoute?: string
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    Preview: PreviewHighlight,
    title: '하이라이트',
    tags: ['경력', '학력', '수상', '자격증'],
    value: '만나기 전부터 신뢰가 생겨요',
    ctaLabel: '하이라이트 채우러 가기',
    ctaRoute: '/me?section=highlight',
  },
  {
    Preview: PreviewLife,
    title: '라이프',
    tags: ['취향', '운동', '여행지', '음식'],
    value: '취향이 겹치면 첫 대화가 자연스러워져요',
    ctaLabel: '라이프 채우러 가기',
    ctaRoute: '/me?section=life',
  },
  {
    Preview: PreviewNetwork,
    title: '네트워크',
    tags: ['리멤버 명함', '공통 인맥'],
    value: '공통 인맥이 보이면 연결 고리가 생겨요',
  },
  {
    Preview: PreviewReputation,
    title: '평판',
    tags: ['경험 키워드', '방명록'],
    value: '다른 사람이 남긴 키워드가 나를 증명해줘요',
  },
  {
    Preview: PreviewConnect,
    title: '연결',
    tags: ['평판 요청', '친구 연결', '비공개 공유'],
    value: '연결된 사람에게 더 많은 나를 보여줄 수 있어요',
  },
  {
    Preview: PreviewSNS,
    title: 'SNS',
    tags: ['인스타그램', '링크드인', '유튜브', '틱톡'],
    value: '인스타·링크드인 연동으로 나다움이 더 드러나요',
    ctaLabel: 'SNS 연동하러 가기',
    ctaRoute: '/me?section=sns',
  },
  {
    Preview: PreviewContact,
    title: '연락수단',
    tags: ['전화', '이메일', '카카오'],
    value: '연락 수단이 없으면 만남으로 이어지기 어려워요',
    ctaLabel: '연락처 추가하러 가기',
    ctaRoute: '/me?section=contact',
  },
]

const TOTAL = GUIDE_SLIDES.length + 1

// ─── Main component ───────────────────────────────────────────────────────────

export function Step9Complete() {
  const store = useByroStore()
  const router = useRouter()
  const linkId = store.user?.linkId || store.linkId || 'myongkoo'
  const [slide, setSlide] = useState(0)
  const [showIntroText, setShowIntroText] = useState(false)
  const [showIntroPreview, setShowIntroPreview] = useState(false)

  useEffect(() => {
    if (!store.isLoggedIn) {
      store.completeOnboarding()
    }
  }, [store])

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

  const handleCopy = () => {
    navigator.clipboard.writeText(`byro.io/@${linkId}`).catch(() => {})
    showToast('링크가 복사됐어요!')
  }

  const goNext = () => { if (slide < TOTAL - 1) setSlide(slide + 1) }
  const goPrev = () => { if (slide > 0) setSlide(slide - 1) }

  const isLastSlide = slide === TOTAL - 1
  const guide = slide > 0 ? GUIDE_SLIDES[slide - 1] : null

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
        {slide === 0 ? (
          <>
            <div className={`transition-all duration-500 ${showIntroText ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <p className="text-[21px] font-black leading-snug mb-3" style={{ color: 'var(--color-accent-dark)' }}>
                이제 자유롭게 나를 표현하는
                <br />
                Byro를 만들어보세요!
              </p>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
                어떤 사람인지, 어떤 취향을 가졌는지, 어떤 관계를 맺고 있는지
                <br />
                Byro 안에서 한눈에 보여줄 수 있어요.
              </p>
            </div>

            <div className={`transition-all duration-500 ${showIntroPreview ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
              <PreviewByroIntro />
            </div>
          </>
        ) : guide ? (
          <>
            <div className="pointer-events-none mb-5">
              <guide.Preview />
            </div>

            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-1">
                {slide} / {GUIDE_SLIDES.length}
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
          </>
        ) : null}
      </div>

      {/* Bottom buttons */}
      {slide === 0 ? (
        <div className="space-y-2.5 pt-4">
          <Button onClick={goNext}>자세히보기</Button>
          <Button variant="outline" onClick={() => router.replace(`/${linkId}`)}>나중에 할게요</Button>
        </div>
      ) : isLastSlide ? (
        <div className="space-y-2.5">
          {guide?.ctaRoute && (
            <Button onClick={() => router.replace(guide.ctaRoute!)}>{guide.ctaLabel}</Button>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev}>이전</Button>
            <Button onClick={() => router.replace('/me?edit=true')}>내 바이로 채우러 가기</Button>
          </div>
          <Button variant="outline" onClick={() => router.replace(`/${linkId}`)}>나중에 할게요</Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {guide?.ctaRoute && (
            <Button onClick={() => router.replace(guide.ctaRoute!)}>{guide.ctaLabel}</Button>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={goPrev}>이전</Button>
            <Button onClick={goNext}>다음</Button>
          </div>
        </div>
      )}
    </div>
  )
}
