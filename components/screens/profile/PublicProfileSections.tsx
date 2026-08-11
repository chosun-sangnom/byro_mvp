'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Lock, Mail, MessageCircle, Phone } from 'lucide-react'
import type { CareerTimeline, ContactChannel, Experience, RememberIndustry } from '@/types'
import { generateNetworkInsight } from '@/lib/networkInsight'

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
      <SectionTitle title="평판" />
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4">
        {isEmpty ? (
          <p className="py-1 text-center text-[13px] text-[var(--color-text-tertiary)]">아직 받은 평판이 없어요</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Reputation</div>
                <div className="mt-0.5 text-[22px] font-black tracking-[-0.04em] text-[var(--color-text-strong)]">누적 평판</div>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                총 {totalKeywordCount}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {keywordCounts.map((item) => (
                <span key={item.keyword} className="chip-metric">
                  {item.keyword} <span className="ml-1 font-black text-[var(--color-text-strong)]">{item.count}</span>
                </span>
              ))}
            </div>
          </>
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
      <SectionTitle title="피드백" />
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Feedback</div>
            <div className="mt-0.5 text-[18px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">함께한 사람들이 남긴 메모</div>
          </div>
          <div className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
            {profile.guestbook.length}개
          </div>
        </div>

        {profile.guestbook.length === 0 ? (
          <p className="py-1 text-center text-[13px] text-[var(--color-text-tertiary)]">아직 방명록이 없어요</p>
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
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-xs font-bold text-[var(--color-text-secondary)]">
                    {entry.authorName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">{entry.authorName}</div>
                    <div className="text-[10px] text-[var(--color-text-tertiary)]">{entry.date}</div>
                  </div>
                  <div className="mt-1 text-[13px] leading-6 text-[var(--color-text-secondary)] line-clamp-2">{entry.message}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {profile.guestbook.length > 0 && (
          <button
            onClick={onOpenGuestbook}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-left active:opacity-70"
          >
            <span className="text-[12px] font-semibold text-[var(--color-text-secondary)]">
              피드백 전체보기
            </span>
            <ChevronRight className="h-4 w-4 text-[var(--color-text-tertiary)]" />
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

// 시간순 데이터이므로 카테고리 다색이 아니라 단일 톤(연함→진함) 시퀀셜 컬러 사용
const ERA_TONE_OPACITY = [0.38, 0.68, 1]

function CareerTimelineCard({ timeline }: { timeline: CareerTimeline }) {
  if (timeline.yearly.length === 0) return null
  const maxCount = Math.max(...timeline.yearly.map((y) => y.count))
  const barAreaHeight = 64

  const eraGroups = timeline.eras.map((era, eraIndex) => ({
    era,
    years: timeline.yearly.filter((y) => y.eraIndex === eraIndex),
  }))

  return (
    <div className="rounded-[16px] border border-[#DEE4EC] px-4 py-3">
      <p className="text-[14px] font-bold text-[#0D0D0D]">
        명함이 기록한 {timeline.years}년의 커리어
      </p>
      <p className="mt-1 text-[12px] text-[#6C7786]">
        누구를 만났는지가 어디에 있었는지를 말해줘요
      </p>

      <div className="mt-4 flex items-end gap-2.5" style={{ height: barAreaHeight }}>
        {eraGroups.map(({ era, years }, eraIndex) => (
          <div key={era.yearRange} className="flex flex-1 items-end gap-[2px]">
            {years.map((y) => {
              const barHeight = maxCount > 0 ? Math.max(Math.round((y.count / maxCount) * barAreaHeight), 5) : 5
              return (
                <div
                  key={y.year}
                  className="flex-1 rounded-t-[3px]"
                  style={{
                    height: barHeight,
                    backgroundColor: `color-mix(in srgb, var(--color-accent-dark) ${ERA_TONE_OPACITY[eraIndex] * 100}%, transparent)`,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2.5">
        {eraGroups.map(({ era }) => (
          <div key={era.yearRange} className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-[#0D0D0D]">{era.yearRange}</p>
            <p className="truncate text-[10px] text-[#6C7786]">{era.domainLabel} · {era.count}명</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfileRememberSection({
  profileName,
  total,
  industries,
  topIndustryRanks,
  topIndustryRoles,
  isLoggedIn,
  viewerNetworkDomain,
  viewerName,
  isOwner = false,
  mutualCompanies,
  careerTimeline,
  insightPercentile,
}: {
  profileName: string
  total: number
  industries: Array<{ name: string; ratio: number; count?: number }>
  topIndustryRanks?: RememberIndustry[]
  topIndustryRoles?: RememberIndustry[]
  isLoggedIn: boolean
  viewerNetworkDomain?: string
  viewerName?: string
  isOwner?: boolean
  mutualCompanies?: string[]
  careerTimeline?: CareerTimeline
  insightPercentile?: number
}) {
  const showPersonalized = isLoggedIn && !!viewerNetworkDomain

  const insight = showPersonalized
    ? generateNetworkInsight({ profileName, total, industries, topIndustryRanks, topIndustryRoles, viewerDomain: viewerNetworkDomain! })
    : null

  const topIndustry = industries[0]
  const topIndustryCount = topIndustry?.count ?? Math.round(total * (topIndustry?.ratio ?? 0) / 100)
  const topRank = topIndustryRanks?.[0]
  const topRankCount = topRank ? Math.round(topIndustryCount * topRank.ratio / 100) : 0

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

          {careerTimeline && <CareerTimelineCard timeline={careerTimeline} />}

          {insight && !isOwner ? (
            /* 타인 프로필 — 관심 도메인 인사이트 */
            <div className="rounded-[16px] px-4 py-3.5" style={{ background: 'var(--color-accent-soft)' }}>
              <p className="text-[15px] font-bold leading-[1.5] text-[#0D0D0D]">
                {topIndustry ? (
                  <>
                    {topIndustry.name} 쪽에 {topIndustryCount}명
                    {topRank && <>, 그중 {topRank.name}이 {topRankCount}명입니다.</>}
                    {!topRank && '이에요.'}
                  </>
                ) : insight.text}
              </p>
              {typeof insightPercentile === 'number' && (
                <p className="mt-1.5 text-[13px] font-semibold" style={{ color: 'var(--color-accent-dark)' }}>
                  {viewerName ? `${viewerName}님 ` : ''}관심 분야에서 상위 {insightPercentile}% 수준의 인맥 밀도예요.
                </p>
              )}
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
