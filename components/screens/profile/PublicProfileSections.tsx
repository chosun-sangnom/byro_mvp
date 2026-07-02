'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Lock, Mail, MessageCircle, Phone, Sparkles } from 'lucide-react'
import type { ContactChannel, Experience, RememberIndustry } from '@/types'
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
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">{title}</div>
      {subtitle && <div className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">{subtitle}</div>}
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
  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.04}>
      <SectionTitle title="평판" />
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4">
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

function MiniBar({ ratio, accent }: { ratio: number; accent?: boolean }) {
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(ratio, 100)}%`,
          background: accent ? 'var(--color-accent-dark)' : 'var(--color-text-tertiary)',
          opacity: accent ? 1 : 0.5,
        }}
      />
    </div>
  )
}

function BreakdownList({ items, accent, total }: { items: RememberIndustry[]; accent?: boolean; total?: number }) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const count = item.count ?? (total ? Math.round(total * item.ratio / 100) : undefined)
        return (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-[80px] shrink-0 truncate text-[11px] text-[var(--color-text-secondary)]">{item.name}</span>
            <MiniBar ratio={item.ratio} accent={accent} />
            <span className="w-7 shrink-0 text-right text-[11px] font-semibold text-[var(--color-text-secondary)]">{item.ratio}%</span>
            {count !== undefined && (
              <span className="w-8 shrink-0 text-right text-[10px] text-[var(--color-text-tertiary)]">{count}명</span>
            )}
          </div>
        )
      })}
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
  isOwner = false,
}: {
  profileName: string
  total: number
  industries: Array<{ name: string; ratio: number; count?: number }>
  topIndustryRanks?: RememberIndustry[]
  topIndustryRoles?: RememberIndustry[]
  isLoggedIn: boolean
  viewerNetworkDomain?: string
  isOwner?: boolean
}) {
  const topIndustry = industries[0]
  const showPersonalized = isLoggedIn && !!viewerNetworkDomain

  const insight = showPersonalized
    ? generateNetworkInsight({ profileName, total, industries, topIndustryRanks, topIndustryRoles, viewerDomain: viewerNetworkDomain! })
    : null

  const topIndustryCount = topIndustry?.count ?? Math.round(total * (topIndustry?.ratio ?? 0) / 100)

  const viewerDomainEntry = showPersonalized ? industries.find((i) => i.name === viewerNetworkDomain) : undefined
  const viewerDomainRatio = viewerDomainEntry?.ratio ?? 0
  const viewerDomainCount = viewerDomainEntry?.count ?? Math.round(total * viewerDomainRatio / 100)

  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.02}>
      <SectionTitle title="리멤버 네트워크" />

      {/* 고정 섹션 — 항상 노출 */}
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Remember</div>
            <div className="mt-0.5 text-[16px] font-black tracking-[-0.02em] text-[var(--color-text-strong)]">명함 기반 관계 네트워크</div>
          </div>
          <div className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)] shrink-0">
            총 {total}명
          </div>
        </div>

        {/* 관심 도메인 */}
        {viewerNetworkDomain && (
          <div className="flex items-center gap-1.5 -mt-1">
            <span className="text-[11px] text-[var(--color-text-tertiary)]">관심 도메인</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">:</span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-accent-dark)' }}>{viewerNetworkDomain}</span>
          </div>
        )}

        {/* 1위 산업 */}
        {topIndustry && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">주요 산업</p>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[var(--color-text-primary)]">{topIndustry.name}</span>
              <MiniBar ratio={topIndustry.ratio} accent />
              <span className="shrink-0 text-[13px] font-black" style={{ color: 'var(--color-accent-dark)' }}>{topIndustry.ratio}%</span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">전체 {total}명 중 {topIndustryCount}명</p>
          </div>
        )}

        {/* 직무 분포 (직급보다 위) */}
        {topIndustryRoles && topIndustryRoles.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">{topIndustry?.name} · 직무</p>
            <BreakdownList items={topIndustryRoles} total={topIndustryCount} />
          </div>
        )}

        {/* 직급 분포 */}
        {topIndustryRanks && topIndustryRanks.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">{topIndustry?.name} · 직급</p>
            <BreakdownList items={topIndustryRanks} total={topIndustryCount} />
          </div>
        )}
      </div>

      {/* 개인화 인사이트 — 조건부 */}
      <div className="mt-3">
        {insight && !isOwner ? (
          /* 타인 프로필 — 관심 도메인 인사이트 */
          <div
            className="rounded-[18px] px-4 py-4"
            style={insight.isMatch
              ? { background: 'linear-gradient(135deg, var(--color-accent-bg), var(--color-bg-surface))', border: '1px solid color-mix(in srgb, var(--color-accent-dark) 40%, transparent)' }
              : { background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)' }
            }
          >
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles size={13} style={{ color: insight.isMatch ? 'var(--color-accent-dark)' : 'var(--color-text-tertiary)' }} />
              <span
                className="text-[11px] font-bold"
                style={{ color: insight.isMatch ? 'var(--color-accent-dark)' : 'var(--color-text-tertiary)' }}
              >
                {insight.isMatch ? '관심 도메인 매치' : '내 관심 도메인 인사이트'}
              </span>
            </div>
            {/* 뷰어 관심 도메인 비율 미니바 */}
            <div className="mb-3 flex items-center gap-2">
              <span
                className="shrink-0 text-[11px] font-semibold"
                style={{ color: insight.isMatch ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)' }}
              >
                {viewerNetworkDomain}
              </span>
              <MiniBar ratio={viewerDomainRatio} accent={insight.isMatch} />
              <span className="shrink-0 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                {viewerDomainRatio}%
              </span>
              <span className="shrink-0 text-[10px] text-[var(--color-text-tertiary)]">
                {viewerDomainCount}명
              </span>
            </div>
            <p className="text-[13px] leading-[1.65] text-[var(--color-text-primary)]">{insight.text}</p>
          </div>
        ) : !isOwner ? (
          /* 블러 넛지 — 비로그인 or 관심 도메인 미설정 (본인 프로필 제외) */
          <div className="relative overflow-hidden rounded-[18px]" style={{ minHeight: 80 }}>
            <div className="px-4 py-4 space-y-2 select-none pointer-events-none" aria-hidden>
              <div className="h-3 rounded-full bg-[var(--color-bg-muted)]" style={{ width: '85%' }} />
              <div className="h-3 rounded-full bg-[var(--color-bg-muted)]" style={{ width: '60%' }} />
            </div>
            <div className="absolute inset-0 backdrop-blur-md bg-[var(--color-bg-page)]/60 rounded-[18px]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
              <Lock size={15} className="mb-1.5 text-[var(--color-text-tertiary)]" />
              <p className="text-[12px] font-semibold text-[var(--color-text-secondary)]">
                {isLoggedIn ? '관심 도메인을 설정하면 맞춤 인사이트를 볼 수 있어요' : '로그인하면 맞춤 네트워크 인사이트를 볼 수 있어요'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
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
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={['flex flex-col items-center gap-2', channel.enabled ? '' : 'opacity-30'].join(' ')}
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
  if (experiences.length === 0) return null

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
