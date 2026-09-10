'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Lock } from 'lucide-react'
import type { ContactChannel, Experience, RememberTopValue } from '@/types'

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
      <div className="rounded-3xl border p-4" style={{ borderColor: '#DEE4EC' }}>
        <p className="text-[14px] font-medium" style={{ color: '#6C7786' }}>평판</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-[18px] font-bold" style={{ color: '#0D0D0D' }}>누적 평판</p>
          <span className="shrink-0 rounded-md px-1.5 py-1 text-[12px] font-bold" style={{ background: '#F0F5FF', color: '#25313D' }}>
            총 {totalKeywordCount}개
          </span>
        </div>
        {isEmpty ? (
          <p className="mt-3 py-1 text-center text-[13px]" style={{ color: '#A8B1BD' }}>아직 받은 평판이 없어요</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {keywordCounts.map((item) => (
              <div
                key={item.keyword}
                className="flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[14px] font-medium"
                style={{ borderColor: '#DEE4EC', color: '#25313D' }}
              >
                {item.keyword}
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AnimatedSection>
  )
}

// 실제 프로필 사진이 없는 작성자는 이니셜 아바타로 표시 — 순서대로 이 팔레트를 순환
const FEEDBACK_AVATAR_PALETTE = ['#F4F2FE', '#EFF9FF', '#F5F6F7']

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
      <div className="rounded-3xl border p-4" style={{ borderColor: '#DEE4EC' }}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[18px] font-bold" style={{ color: '#0D0D0D' }}>함께한 사람들이 남긴 피드백</p>
          <span className="shrink-0 rounded-md px-1.5 py-1 text-[12px] font-bold" style={{ background: '#F0F5FF', color: '#25313D' }}>
            총 {profile.guestbook.length}개
          </span>
        </div>

        {profile.guestbook.length === 0 ? (
          <p className="mt-4 py-1 text-center text-[13px]" style={{ color: '#A8B1BD' }}>아직 받은 피드백이 없어요</p>
        ) : (
          <div className="mt-4 space-y-4">
            {featuredGuestbook.map((entry, i) => {
              const avatar = getProfileAvatar(entry.linkId)
              return (
                <div key={entry.id}>
                  <button
                    onClick={() => onGuestbookEntryClick(entry.linkId)}
                    className="flex w-full items-start gap-2.5 text-left"
                  >
                    {avatar ? (
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatar} alt={entry.authorName} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ background: FEEDBACK_AVATAR_PALETTE[i % FEEDBACK_AVATAR_PALETTE.length] }}
                      >
                        <span className="text-[14px] font-bold" style={{ color: '#6C7786' }}>{entry.authorName.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[14px] font-semibold" style={{ color: '#0D0D0D' }}>{entry.authorName}</span>
                        {avatar && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src="/images/reputation-verified-badge.svg" alt="" className="h-3 w-3" />
                        )}
                        <span className="ml-1 text-[12px] font-medium" style={{ color: '#6C7786' }}>{entry.date}</span>
                      </div>
                      <p className="mt-1 text-[14px] font-medium line-clamp-2" style={{ color: '#475058' }}>{entry.message}</p>
                    </div>
                  </button>
                  {i < featuredGuestbook.length - 1 && <div className="mt-4 h-px" style={{ background: '#DEE4EC' }} />}
                </div>
              )
            })}
          </div>
        )}

        {profile.guestbook.length > 0 && (
          <button
            onClick={onOpenGuestbook}
            className="mt-4 flex w-full items-center justify-center gap-0.5 text-[14px] font-semibold"
            style={{ color: '#475058' }}
          >
            피드백 전체 보기
            <ChevronRight size={20} style={{ color: '#475058' }} />
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

/**
 * 최빈값 3축 카드 (SCRUM-124)
 *
 * 회사·산업군·직함에서 각각 독립적으로 1위 값을 뽑는다. 세 축은 서로 종속되지
 * 않는다 — "1위 회사의 1위 직함" 같은 관계가 아니라 각 축에서 따로 센 값이라,
 * 축끼리 비교하거나 합산하면 안 된다.
 *
 * 그래서 세로 리스트가 아니라 가로 3분할이다. 세로로 쌓으면 위에서 아래로
 * 순위처럼 읽히는데, 셋은 동등한 별개 집계다. 비율·막대도 쓰지 않는다(축끼리
 * 비교하라는 오독을 부름). 총합은 섹션 부제가 이미 말해주므로 값별 "N명"만.
 *
 * 단위는 '장'이 아니라 '명'이다 — 집계 원본은 명함이지만, 읽는 사람이 알고 싶은
 * 건 "카카오 사람 중 아는 사람이 몇인가"이지 명함이 몇 장인가가 아니다.
 */
function RememberTopValuesCard({
  total,
  rows,
}: {
  total: number
  rows: Array<{ label: string; value: RememberTopValue }>
}) {
  if (rows.length === 0 || total === 0) return null

  return (
    <div className="rounded-[16px] border border-[#DEE4EC] px-4 pb-4 pt-3.5">
      <p className="text-[14px] font-bold text-[#0D0D0D]">이런 사람을 많이 알아요</p>
      <p className="mt-1 text-[12px] text-[#6C7786]">
        회사·산업군·직함을 각각 따로 세었어요
      </p>

      <div className="mt-3 flex">
        {rows.map(({ label, value }, i) => (
          <div
            key={label}
            className={`min-w-0 flex-1 ${i > 0 ? 'border-l border-[#EDF1F6] pl-3' : ''} ${i < rows.length - 1 ? 'pr-3' : ''}`}
          >
            <span
              className="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-[1.4]"
              style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-dark)' }}
            >
              {label}
            </span>
            {/* 회사·직함 이름은 8자까지 온다 — 3분할 칸에선 자르지 말고 어절 단위로 접는다 */}
            <p className="mt-1.5 break-keep text-[14px] font-bold leading-[1.35] tracking-[-0.01em] text-[#0D0D0D]">
              {value.name}
            </p>
            <p className="mt-1 text-[12px] font-bold text-[#6C7786]">
              {value.count.toLocaleString()}명
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfileRememberSection({
  total,
  industries,
  isLoggedIn,
  viewerNetworkDomains,
  viewerName,
  isOwner = false,
  mutualCompanies,
  topCompany,
  topIndustry,
  topRole,
}: {
  total: number
  industries: Array<{ name: string; ratio: number; count?: number }>
  isLoggedIn: boolean
  viewerNetworkDomains?: string[]
  viewerName?: string
  isOwner?: boolean
  mutualCompanies?: string[]
  topCompany?: RememberTopValue
  topIndustry?: RememberTopValue
  topRole?: RememberTopValue
}) {
  const topValueRows = [
    { label: '회사', value: topCompany },
    { label: '산업군', value: topIndustry },
    { label: '직함', value: topRole },
  ].filter((r): r is { label: string; value: RememberTopValue } => !!r.value)

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
      // 이 블록은 "내 관심 분야와 얼마나 겹치나"(밀도)만 말한다.
      // 직함 구성은 위의 최빈값 3축이 이미 세고 있어서, 여기서 또 세면
      // 같은 값을 다르게 집계한 두 숫자가 나란히 놓여 서로를 부정한다.
      const headline = `${domain} 쪽에 아는 사람이 ${count}명이에요.`
      return { domain, entryName: entry.name, percentile, headline, count }
    })
    .filter((v): v is { domain: string; entryName: string; percentile: number; headline: string; count: number } => v !== null)
    // 프리셋 + 직접입력이 같은 업종에 겹치는 경우(예: "IT/테크"와 직접 추가한 "테크"가 같은 업종에 매칭) 중복 제거
    .filter((item, i, arr) => arr.findIndex((x) => x.entryName === item.entryName) === i)
    .sort((a, b) => a.percentile - b.percentile)

  const showPersonalized = isLoggedIn && (viewerNetworkDomains?.length ?? 0) > 0
  const isEmpty = total === 0

  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.02}>
      <SectionTitle
        title="리멤버 네트워크"
        subtitle={isEmpty ? undefined : `지금까지 ${total.toLocaleString()}명을 리멤버했어요`}
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

          <RememberTopValuesCard total={total} rows={topValueRows} />

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

const CONTACT_ICON_SRC = {
  phone: '/images/contact/phone.svg',
  email: '/images/contact/email.svg',
  messenger: '/images/contact/messenger.svg',
}

export function ContactActionButton({
  channel,
  onClick,
}: {
  channel: ContactChannel
  onClick: () => void
}) {
  const iconSrc = CONTACT_ICON_SRC[channel.id] ?? CONTACT_ICON_SRC.messenger

  return (
    <motion.button
      onClick={onClick}
      disabled={!channel.enabled}
      whileTap={channel.enabled ? { scale: 0.88 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={['flex flex-col items-center gap-2', channel.enabled ? '' : 'opacity-30 pointer-events-none'].join(' ')}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={iconSrc} alt="" className="size-14" />
      <span className="text-[14px] font-medium text-black">{channel.label}</span>
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
      <SectionTitle
        title="경험"
        subtitle={isEmpty ? undefined : `함께한 사람들의 경험 ${experiences.length}개`}
      />
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden">
        {isEmpty ? (
          <p className="px-4 py-6 text-center text-[13px] text-[var(--color-text-tertiary)]">아직 남겨진 경험이 없어요</p>
        ) : (
          <>
            <div className="divide-y divide-[var(--color-border-soft)] px-4 pt-2">
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
