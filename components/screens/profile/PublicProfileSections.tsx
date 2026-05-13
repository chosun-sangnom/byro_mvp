'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import { RememberNetworkGraph } from '@/components/highlights/RememberNetworkGraph'
import type { ContactChannel } from '@/types'

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
            className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]"
          >
            더보기
          </button>
        )}
      </div>
    </AnimatedSection>
  )
}

export function ProfileRememberSection({
  total,
  industries,
}: {
  total: number
  industries: Array<{ name: string; ratio: number }>
}) {
  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.02}>
      <SectionTitle title="리멤버 네트워크" />
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Remember</div>
            <div className="mt-0.5 text-[18px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">명함 기반 관계 네트워크</div>
          </div>
          <div className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
            총 {total}명
          </div>
        </div>
        <RememberNetworkGraph total={total} industries={industries} />
      </div>
    </AnimatedSection>
  )
}


export function ProfileConnectSection({
  isOwnerMode,
  alreadySubmitted,
  contactChannels,
  onRequestFeedback,
  onLeaveExperience,
  onChannelClick,
}: {
  isOwnerMode: boolean
  alreadySubmitted: boolean
  contactChannels: ContactChannel[]
  onRequestFeedback: () => void
  onLeaveExperience: () => void
  onChannelClick: (channel: ContactChannel) => void
}) {
  return (
    <AnimatedSection className="px-5 pt-6 pb-8" delay={0.1}>
      <SectionTitle title="Connect" />
      {!isOwnerMode && (
        <div className="mb-6 flex gap-2">
          <motion.button
            onClick={onRequestFeedback}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex-1 rounded-full border border-[var(--color-border-default)] py-2.5 text-[13px] font-semibold text-[var(--color-text-secondary)]"
          >
            피드백 요청
          </motion.button>
          <motion.button
            onClick={onLeaveExperience}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex-1 rounded-full py-2.5 text-[13px] font-semibold"
            style={alreadySubmitted
              ? { border: '1px solid var(--color-border-default)', color: 'var(--color-text-secondary)' }
              : { backgroundColor: 'var(--color-accent-dark)', color: '#fff' }}
          >
            {alreadySubmitted ? '경험 남겼어요 ✓' : '경험 남겨요'}
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
