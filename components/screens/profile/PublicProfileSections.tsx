'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Lock, Mail, MessageCircle, Phone } from 'lucide-react'
import type { CareerTimeline, ContactChannel, Experience, RememberIndustry } from '@/types'

const SECTION_EASE = [0.22, 1, 0.36, 1] as const

type GuestbookPreview = {
  id: string
  linkId: string
  authorName: string
  message: string
  date: string
}

type KeywordCount = {
  keyword: string
  count: number
}


export function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-4">
      <div className="text-[18px] font-bold text-[#0D0D0D]">{title}</div>
      {subtitle && <div className="mt-1 text-[14px] text-[#6C7786]">{subtitle}</div>}
    </div>
  )
}

export function ProfileReputationSummarySection({
  keywordCounts,
  totalKeywordCount,
}: {
  keywordCounts: KeywordCount[]
  totalKeywordCount: number
}) {
  const isEmpty = keywordCounts.length === 0

  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.04}>
      <SectionTitle
        title="평판"
        subtitle={isEmpty ? undefined : `키워드 ${totalKeywordCount}개가 모였어요`}
      />
      <div className="rounded-[16px] border border-[#DEE4EC] px-4 py-3">
        {isEmpty ? (
          <p className="py-1 text-center text-[13px] text-[#6C7786]">아직 받은 평판이 없어요</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywordCounts.map((item) => (
              <span
                key={item.keyword}
                className="rounded-full px-3 py-1.5 text-[13px] font-semibold"
                style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-dark)' }}
              >
                {item.keyword} <span className="ml-1 font-bold text-[#0D0D0D]">{item.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </AnimatedSection>
  )
}

export function ProfileFeedbackSection({
  profile,
  featuredGuestbook,
  getProfileAvatar,
  onGuestbookEntryClick,
  onOpenGuestbook,
}: {
  profile: {
    guestbook: { length: number }
  }
  featuredGuestbook: GuestbookPreview[]
  getProfileAvatar: (linkId: string) => string
  onGuestbookEntryClick: (linkId: string) => void
  onOpenGuestbook: () => void
}) {
  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.06}>
      <SectionTitle
        title="피드백"
        subtitle={profile.guestbook.length > 0 ? `함께한 사람들이 남긴 메모 ${profile.guestbook.length}개` : undefined}
      />
      <div className="rounded-[16px] border border-[#DEE4EC] px-4 py-3">
        {profile.guestbook.length === 0 ? (
          <p className="py-1 text-center text-[13px] text-[#6C7786]">아직 방명록이 없어요</p>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)]">
            {featuredGuestbook.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onGuestbookEntryClick(entry.linkId)}
                className="flex w-full gap-2.5 py-3 text-left first:pt-0 last:pb-0"
              >
                {getProfileAvatar(entry.linkId) ? (
                  <div className="mt-0.5 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[var(--color-bg-soft)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getProfileAvatar(entry.linkId)} alt={`${entry.authorName} 프로필 사진`} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-xs font-bold text-[#6C7786]">
                    {entry.authorName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-semibold text-[#0D0D0D]">{entry.authorName}</div>
                    <div className="text-[10px] text-[#6C7786]">{entry.date}</div>
                  </div>
                  <div className="mt-1 text-[13px] leading-6 text-[#475058] line-clamp-2">{entry.message}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {profile.guestbook.length > 0 && (
          <button
            onClick={onOpenGuestbook}
            className="mt-3 flex w-full items-center justify-between rounded-[12px] border border-[#DEE4EC] px-4 py-3 text-left active:opacity-70"
          >
            <span className="text-[12px] font-semibold text-[#475058]">
              피드백 전체보기
            </span>
            <ChevronRight className="h-4 w-4 text-[#6C7786]" />
          </button>
        )}
      </div>
    </AnimatedSection>
  )
}

// ─── ProfileRememberSection ────────────────────────────────────────────────────

function MutualCompaniesCard({ companies }: { companies: string[] }) {
  if (companies.length === 0) return null
  const visible = companies.slice(0, 5)
  const remaining = companies.length - visible.length

  return (
    <div className="rounded-[16px] border border-[#DEE4EC] px-4 py-3">
      <p className="text-[14px] font-bold text-[#0D0D0D]">
        두 분 모두 연결된 회사 {companies.length}곳
      </p>
      <p className="mt-1 text-[12px] text-[#6C7786]">
        이 회사들에서 만난 사람 이야기로 대화를 시작해보세요
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {visible.map((name) => (
          <span
            key={name}
            className="rounded-full px-3 py-1.5 text-[13px] font-semibold"
            style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-dark)' }}
          >
            {name}
          </span>
        ))}
        {remaining > 0 && (
          <span className="rounded-full bg-[var(--color-bg-muted)] px-3 py-1.5 text-[13px] font-semibold text-[#6C7786]">
            +{remaining}곳
          </span>
        )}
      </div>
    </div>
  )
}

// 관심 도메인은 카테고리(정체성) 데이터이므로 시퀀셜이 아니라 카테고리 팔레트 사용.
// validate_palette.js로 색맹 안전성 확인된 블루/그린/오렌지 조합.
const DOMAIN_TREND_COLORS = ['#2563EB', '#0E8F50', '#D95F00']

// [임시] 실제로는 명함 저장 날짜 기준 연도별 집계로 교체.
// 지금은 누적 총량을 연도 수만큼 나눠 최근으로 갈수록 증가하는 추세로 합성.
function buildDomainYearlySeries(years: number[], count: number, seed: number): number[] {
  const avgPerYear = count / Math.max(years.length, 1)
  return years.map((_, i) => {
    const progress = years.length > 1 ? i / (years.length - 1) : 1
    const growth = 0.55 + progress * 0.9
    const jitter = ((seed * (i + 1) * 13) % 7) - 3
    return Math.max(1, Math.round(avgPerYear * growth + jitter))
  })
}

type TrendSeries = { name: string; color: string; values: number[]; total: number }

function CareerTimelineCard({
  timeline,
  trendSeries,
}: {
  timeline: CareerTimeline
  trendSeries?: TrendSeries[]
}) {
  if (timeline.yearly.length === 0) return null

  const years = timeline.yearly.map((y) => y.year)
  const hasTrend = trendSeries && trendSeries.length > 0
  const chartWidth = 296
  const chartHeight = 88
  // 끝점에 작은 원 마커를 그릴 여백만 확보 (숫자 라벨은 범례에서 보여주므로 넓은 여백 불필요)
  const plotWidth = chartWidth - 4
  const maxValue = hasTrend ? Math.max(1, ...trendSeries.flatMap((s) => s.values)) : 1
  const stepX = years.length > 1 ? plotWidth / (years.length - 1) : 0
  const valueToY = (v: number) => chartHeight - (v / maxValue) * (chartHeight - 6) - 3

  const toPoints = (values: number[]) =>
    values
      .map((v, i) => {
        const x = years.length > 1 ? i * stepX : plotWidth / 2
        return `${x},${valueToY(v)}`
      })
      .join(' ')

  return (
    <div className="rounded-[16px] border border-[#DEE4EC] px-4 py-3">
      <p className="text-[14px] font-bold text-[#0D0D0D]">
        명함이 기록한 {timeline.years}년의 커리어
      </p>
      <p className="mt-1 text-[12px] text-[#6C7786]">
        누구를 만났는지가 어디에 있었는지를 말해줘요
      </p>

      {hasTrend && (
        <>
          <svg
            className="mt-4"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height={chartHeight}
            preserveAspectRatio="none"
          >
            {trendSeries.map((s) => (
              <polyline
                key={s.name}
                points={toPoints(s.values)}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {trendSeries.map((s) => (
              <circle
                key={s.name}
                cx={plotWidth}
                cy={valueToY(s.values[s.values.length - 1])}
                r={2.5}
                fill={s.color}
              />
            ))}
          </svg>
          <div className="mt-2 flex justify-between text-[11px] text-[#6C7786]">
            <span>{years[0]}</span>
            <span>{years[years.length - 1]}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            {trendSeries.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                <p className="text-[12px] text-[#475058]">
                  <span className="font-bold text-[#0D0D0D]">{s.name}</span> · {s.total}명
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function ProfileRememberSection({
  total,
  industries,
  topIndustryRanks,
  isLoggedIn,
  viewerNetworkDomains,
  viewerName,
  isOwner = false,
  mutualCompanies,
  careerTimeline,
}: {
  total: number
  industries: Array<{ name: string; ratio: number; count?: number }>
  topIndustryRanks?: RememberIndustry[]
  isLoggedIn: boolean
  viewerNetworkDomains?: string[]
  viewerName?: string
  isOwner?: boolean
  mutualCompanies?: string[]
  careerTimeline?: CareerTimeline
}) {
  const topIndustry = industries[0]
  const topRank = topIndustryRanks?.[0]

  // 도메인별 인사이트 — 겹치는 업종이 있는 관심 도메인만, 밀도 좋은 순으로.
  // "IT" vs "IT/테크", "투자" vs "금융/투자"처럼 표기가 완전히 같진 않아도
  // '/'로 나눈 토큰이 하나라도 겹치면 같은 업종으로 인정.
  const domainInsights = (viewerNetworkDomains ?? [])
    .map((domain) => {
      const domainTokens = domain.split('/')
      const entry = industries.find(
        (i) => i.name === domain || i.name.split('/').some((t) => domainTokens.includes(t))
      )
      if (!entry) return null
      const count = entry.count ?? Math.round(total * entry.ratio / 100)
      const percentile = Math.max(3, Math.round(35 - entry.ratio * 0.6))
      const isTop = entry.name === topIndustry?.name
      const rankCount = isTop && topRank ? Math.round(count * topRank.ratio / 100) : 0
      const headline = isTop && topRank
        ? `${domain} 쪽에 ${count}명, 그중 ${topRank.name}이 ${rankCount}명입니다.`
        : `${domain} 쪽에 ${count}명입니다.`
      return { domain, entryName: entry.name, percentile, headline, count }
    })
    .filter((v): v is { domain: string; entryName: string; percentile: number; headline: string; count: number } => v !== null)
    // 프리셋 + 직접입력이 같은 업종에 겹치는 경우(예: "IT/테크"와 직접 추가한 "테크"가 같은 업종에 매칭) 중복 제거
    .filter((item, i, arr) => arr.findIndex((x) => x.entryName === item.entryName) === i)
    .sort((a, b) => a.percentile - b.percentile)

  // 커리어 그래프 — 뷰어의 관심 도메인이 아니라 이 사람 명함의 실제 업종 Top3
  const topIndustries = [...industries].sort((a, b) => b.ratio - a.ratio).slice(0, 3)
  const trendYears = careerTimeline?.yearly.map((y) => y.year) ?? []
  const trendSeries = trendYears.length > 1
    ? topIndustries.map((item, i) => {
        const count = item.count ?? Math.round(total * item.ratio / 100)
        return {
          name: item.name,
          color: DOMAIN_TREND_COLORS[i],
          values: buildDomainYearlySeries(trendYears, count, i + 1),
          total: count,
        }
      })
    : []

  const showPersonalized = isLoggedIn && (viewerNetworkDomains?.length ?? 0) > 0
  const isEmpty = total === 0

  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.02}>
      <SectionTitle
        title="리멤버 네트워크"
        subtitle={isEmpty ? undefined : `지금까지 명함 ${total}명을 리멤버했어요`}
      />

      {isEmpty ? (
        <p className="rounded-[16px] border border-[#DEE4EC] py-6 text-center text-[13px] text-[#6C7786]">
          아직 리멤버 활동이 없어요
        </p>
      ) : (
        <div className="space-y-3">
          {!isOwner && mutualCompanies && mutualCompanies.length > 0 && (
            <MutualCompaniesCard companies={mutualCompanies} />
          )}

          {careerTimeline && (
            <CareerTimelineCard
              timeline={careerTimeline}
              trendSeries={!isOwner ? trendSeries : undefined}
            />
          )}

          {showPersonalized && !isOwner && domainInsights.length > 0 ? (
            /* 타인 프로필 — 관심 도메인별 인사이트 (밀도 좋은 순, 막대+문장으로 전부 표시) */
            <div className="rounded-[16px] px-4 py-3.5" style={{ background: 'var(--color-accent-soft)' }}>
              {domainInsights.map((item, i) => {
                const barWidth = Math.max(12, Math.min(100, 100 - item.percentile * 2))
                return (
                  <div
                    key={item.domain}
                    className={i > 0 ? 'mt-3 border-t pt-3' : undefined}
                    style={i > 0 ? { borderColor: 'var(--color-accent-border-soft)' } : undefined}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-[#0D0D0D]">{item.domain}</span>
                      <span className="shrink-0 text-[12px] font-semibold" style={{ color: 'var(--color-accent-dark)' }}>
                        상위 {item.percentile}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/70">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${barWidth}%`, background: 'var(--color-accent-dark)' }}
                      />
                    </div>
                    <p className="mt-2 text-[13px] leading-[1.5] text-[#475058]">
                      {item.headline}
                    </p>
                    {viewerName && (
                      <p className="mt-0.5 text-[11px] leading-[1.5] text-[#8A93A3]">
                        {viewerName}님 관심 분야에서 상위 {item.percentile}% 수준의 인맥 밀도예요.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : showPersonalized && !isOwner ? (
            /* 관심 도메인은 있지만 이 프로필과 겹치는 업종이 없는 경우 */
            <div className="rounded-[16px] border border-[#DEE4EC] px-4 py-3.5">
              <p className="text-[13px] text-[#6C7786]">
                설정한 관심 분야와 겹치는 인맥 정보가 아직 없어요.
              </p>
            </div>
          ) : !isOwner ? (
            /* 블러 넛지 — 비로그인 or 관심 도메인 미설정 (본인 프로필 제외) */
            <div className="relative overflow-hidden rounded-[16px]" style={{ minHeight: 80 }}>
              <div className="px-4 py-4 space-y-2 select-none pointer-events-none" aria-hidden>
                <div className="h-3 rounded-full bg-[var(--color-bg-muted)]" style={{ width: '85%' }} />
                <div className="h-3 rounded-full bg-[var(--color-bg-muted)]" style={{ width: '60%' }} />
              </div>
              <div className="absolute inset-0 backdrop-blur-md bg-[var(--color-bg-page)]/60 rounded-[16px]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                <Lock size={15} className="mb-1.5 text-[#6C7786]" />
                <p className="text-[12px] font-semibold text-[#25313D]">
                  {isLoggedIn ? '관심 도메인을 설정하면 맞춤 인사이트를 볼 수 있어요' : '로그인하면 맞춤 네트워크 인사이트를 볼 수 있어요'}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </AnimatedSection>
  )
}


export function ProfileConnectSection({
  isOwnerMode,
  contactChannels,
  onRequestFeedback,
  onChannelClick,
}: {
  isOwnerMode: boolean
  contactChannels: ContactChannel[]
  onRequestFeedback: () => void
  onChannelClick: (channel: ContactChannel) => void
}) {
  return (
    <AnimatedSection className="px-5 pt-6 pb-8" delay={0.1}>
      <SectionTitle title="Connect" />
      {!isOwnerMode && (
        <div className="mb-6">
          <motion.button
            onClick={onRequestFeedback}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-full rounded-full border border-[var(--color-border-default)] py-2.5 text-[13px] font-semibold text-[var(--color-text-secondary)]"
          >
            피드백 요청
          </motion.button>
        </div>
      )}
      <div className="flex justify-around">
        {contactChannels.map((channel) => (
          <ContactActionButton key={channel.id} channel={channel} onClick={() => onChannelClick(channel)} />
        ))}
      </div>
    </AnimatedSection>
  )
}


export function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.42, ease: SECTION_EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function ContactActionButton({
  channel,
  onClick,
}: {
  channel: ContactChannel
  onClick: () => void
}) {
  const iconMap = {
    phone: Phone,
    email: Mail,
    kakao: MessageCircle,
  }
  const Icon = iconMap[channel.id] ?? MessageCircle

  return (
    <motion.button
      onClick={onClick}
      disabled={!channel.enabled}
      whileTap={channel.enabled ? { scale: 0.88 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={['flex flex-col items-center gap-2', channel.enabled ? '' : 'opacity-30 pointer-events-none'].join(' ')}
    >
      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-muted)]">
        <Icon size={18} color="var(--color-text-secondary)" />
      </div>
      <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{channel.label}</span>
    </motion.button>
  )
}

export function ProfileExperienceSection({
  experiences,
  onViewAll,
}: {
  experiences: Experience[]
  onViewAll: () => void
}) {
  const isEmpty = experiences.length === 0
  const preview = experiences.slice(0, 5)

  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.08}>
      <SectionTitle title="경험" />
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Experience</div>
            <div className="mt-0.5 text-[18px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">함께한 사람들의 경험</div>
          </div>
          <div className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
            {experiences.length}개
          </div>
        </div>

        {isEmpty ? (
          <p className="px-4 pb-4 text-center text-[13px] text-[var(--color-text-tertiary)]">아직 남겨진 경험이 없어요</p>
        ) : (
          <>
            <div className="divide-y divide-[var(--color-border-soft)] px-4">
              {preview.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>

            <div className="px-4 pb-4 pt-3">
              <button
                onClick={onViewAll}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-left active:opacity-70"
              >
                <span className="text-[12px] font-semibold text-[var(--color-text-secondary)]">경험 전체보기</span>
                <ChevronRight className="h-4 w-4 text-[var(--color-text-tertiary)]" />
              </button>
            </div>
          </>
        )}
      </div>
    </AnimatedSection>
  )
}

function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <div className="py-3.5 first:pt-2 last:pb-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[11px] font-bold text-[var(--color-text-secondary)]">
            {experience.isAnonymous ? '익' : (experience.authorName?.charAt(0) ?? '?')}
          </div>
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
            {experience.isAnonymous ? '익명' : (experience.authorName ?? '익명')}
          </span>
        </div>
        <span className="text-[10px] text-[var(--color-text-tertiary)]">{experience.date}</span>
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {experience.keywords.map((kw) => (
          <span
            key={kw}
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}
          >
            {kw}
          </span>
        ))}
      </div>
      {experience.message && (
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{experience.message}</p>
      )}
    </div>
  )
}
