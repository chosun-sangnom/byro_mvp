'use client'

import type { ReactNode, RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Mail, MessageCircle, Phone, Play } from 'lucide-react'
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

type HeroTheme = {
  cover: string
  avatar: string
}

type InstagramSectionData = {
  username: string
  profileUrl: string
  aiSummary: string
  posts: Array<{
    id: string
    imageUrl: string
    caption: string
  }>
}

type LinkedInSectionData = {
  profileUrl: string
  aiSummary: string
  previewImage: string
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

export function ProfileHeroSection({
  profile,
  heroTheme,
  bioExpanded,
  bioOverflowing,
  bioRef,
  onToggleBio,
  isOwnerMode,
  onEditMood,
  onEditPung,
}: {
  profile: {
    name: string
    title?: string
    linkId?: string
    headline?: string
    age?: number
    bio: string
    avatarColor?: string
    avatarImage?: string
    headerMeta?: {
      mood?: string
      availability?: string
    }
  }
  heroTheme: HeroTheme
  bioExpanded: boolean
  bioOverflowing: boolean
  bioRef: RefObject<HTMLParagraphElement>
  onToggleBio: () => void
  isOwnerMode?: boolean
  onEditMood?: () => void
  onEditPung?: () => void
}) {
  return (
    <motion.div
      className="relative px-5 pt-4 pb-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: SECTION_EASE }}
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(75,108,245,0.14)_0%,transparent_68%)]" />
      <ProfileHeroCard
        profile={profile}
        heroTheme={heroTheme}
        bioExpanded={bioExpanded}
        bioOverflowing={bioOverflowing}
        bioRef={bioRef}
        onToggleBio={onToggleBio}
        isOwnerMode={isOwnerMode}
        onEditMood={onEditMood}
        onEditPung={onEditPung}
      />
    </motion.div>
  )
}

/**
 * ProfileHeroCard
 *
 * 프로필 최상단 히어로 카드.
 * - 프로필 사진 있을 때: 풀블리드 이미지 + 그라디언트 오버레이
 * - 프로필 사진 없을 때: 테마 그라디언트 배경 + 이니셜 아바타
 * - 하단: 이름 + 인증 뱃지 + bio 글래스 카드
 *
 * owner 전용 편집/아카이브 버튼은 제거됨.
 * → 편집: 푸터 "Byro 편집" 버튼 (PublicProfileShell)
 * → 소셜 관리: /me 페이지
 *
 * TODO(profile-image): 프로필 사진 업로드/크롭 플로우 연동
 * TODO(verified): BadgeCheck 표시 조건을 인증 여부 필드로 제어
 */
export function ProfileHeroCard({
  profile,
  heroTheme,
  bioRef,
  bioExpanded,
  bioOverflowing,
  onToggleBio,
  isOwnerMode = false,
  onEditMood,
  onEditPung,
}: {
  profile: {
    name: string
    title?: string
    linkId?: string
    age?: number
    headline?: string
    bio: string
    avatarColor?: string
    avatarImage?: string
    headerMeta?: {
      mood?: string
      availability?: string
    }
    sajuProfile?: {
      showAge?: boolean
    }
  }
  heroTheme: HeroTheme
  bioRef: RefObject<HTMLParagraphElement>
  bioExpanded?: boolean
  bioOverflowing?: boolean
  onToggleBio?: () => void
  isOwnerMode?: boolean
  onEditMood?: () => void
  onEditPung?: () => void
}) {
  const showAge = typeof profile.age === 'number' && profile.sajuProfile?.showAge !== false
  const mood = profile.headerMeta?.mood
  const pung = profile.headerMeta?.availability

  const MoodPill = onEditMood ? 'button' : 'span'
  const PungPill = onEditPung ? 'button' : 'span'

  return (
    <div className="hero-card border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.92)] p-[8px] backdrop-blur-sm">
      <div className="relative h-[452px] overflow-hidden rounded-[30px] text-white ring-1 ring-black/4">
        {profile.avatarImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.avatarImage} alt={`${profile.name} 프로필 사진`} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_24%,rgba(0,0,0,0.10)_58%,rgba(0,0,0,0.74)_100%)]" />
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-b ${heroTheme.cover}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.24),rgba(255,255,255,0)_36%),linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_24%,rgba(0,0,0,0.08)_56%,rgba(0,0,0,0.76)_100%)]" />
            <div className="absolute left-1/2 top-[16%] h-[196px] w-[196px] -translate-x-1/2 overflow-hidden rounded-[40px] border border-white/22 bg-gradient-to-br from-white/18 to-white/3 shadow-[0_28px_72px_rgba(0,0,0,0.18)] backdrop-blur-[6px]">
              <div
                className={`h-full w-full bg-gradient-to-br ${heroTheme.avatar}`}
                style={{ backgroundColor: profile.avatarColor }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[72px] font-black text-[#4E3B32]/55">
                {profile.name.charAt(0)}
              </div>
            </div>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 p-5">
          {/* 이름 + 인증 뱃지 */}
          <div className="flex items-end gap-2">
            <div
              className="text-[38px] font-black leading-[1.08] tracking-[-0.05em]"
              style={{
                background: 'linear-gradient(170deg, #FFFFFF 40%, rgba(255,255,255,0.68) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.32))',
              }}
            >
              {profile.name}
            </div>
          </div>

          {/* 나이 */}
          {showAge && (
            <div className="mt-0.5 text-[13px] font-semibold text-white/50">
              {profile.age}세
            </div>
          )}

          {/* 직함 */}
          <div className={`text-[13px] font-medium text-white/68 ${showAge ? 'mt-1' : 'mt-2'}`}>
            {profile.title}
          </div>

          {/* 오늘의 기분 */}
          {(mood || isOwnerMode) && (
            <div className="mt-2.5">
              <MoodPill
                {...(onEditMood ? { type: 'button' as const, onClick: onEditMood } : {})}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/85 backdrop-blur-sm"
              >
                <span className="text-white/42">✦</span>
                <span>{mood || '오늘의 기분 선택'}</span>
              </MoodPill>
            </div>
          )}

          {/* bio */}
          <div className="mt-2.5 max-w-[318px] rounded-[18px] border border-white/12 bg-white/10 px-4 py-3 text-[15px] leading-[1.52] text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[8px]">
            <p ref={bioRef} className={bioExpanded ? undefined : 'line-clamp-2'}>
              {profile.bio}
            </p>
            {(bioOverflowing || bioExpanded) && onToggleBio && (
              <button
                type="button"
                onClick={onToggleBio}
                className="mt-1.5 flex items-center gap-0.5 text-[12px] font-semibold text-white/55"
              >
                {bioExpanded ? '접기' : '더보기'}
                {bioExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>

          {/* 펑 (한마디) */}
          {(pung || isOwnerMode) && (
            <div className="mt-2">
              <PungPill
                {...(onEditPung ? { type: 'button' as const, onClick: onEditPung } : {})}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(75,108,245,0.45)] bg-[rgba(75,108,245,0.18)] px-3 py-1 text-[12px] font-semibold text-white/90"
              >
                <span>💬</span>
                <span>{pung || '펑 열기'}</span>
              </PungPill>
            </div>
          )}

          <div className="mt-2.5 text-[11px] font-semibold text-white/38">
            @{profile.linkId}
          </div>
        </div>
      </div>
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
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
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
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
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
      <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
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

export function ProfileSnsSection({
  instagramConnected,
  linkedinConnected,
  instagram,
  linkedin,
  igOpen,
  liOpen,
  onToggleInstagram,
  onToggleLinkedIn,
}: {
  instagramConnected: boolean
  linkedinConnected: boolean
  instagram: InstagramSectionData
  linkedin: LinkedInSectionData
  igOpen: boolean
  liOpen: boolean
  onToggleInstagram: () => void
  onToggleLinkedIn: () => void
}) {
  return (
    <AnimatedSection className="px-5 pt-6 pb-2">
      <SectionTitle title="SNS" />
      <div className="divide-y divide-[var(--color-border-soft)]">
        <StaticSnsRow
          icon={<Play size={15} color="#FF0000" />}
          title="YouTube"
          subtitle="연결 정보 준비 중"
        />
        <StaticSnsRow
          icon={<span className="text-[13px] font-black text-black">T</span>}
          title="TikTok"
          subtitle="연결 정보 준비 중"
        />
        {instagramConnected ? (
          <div>
            <button onClick={onToggleInstagram} className="flex w-full items-center gap-3.5 py-3.5 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/Instagram.svg" alt="Instagram" className="h-[18px] w-[18px] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">Instagram</div>
                <a
                  href={instagram.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="mt-0.5 block text-[12px] text-[var(--color-accent-dark)] underline-offset-2 hover:underline"
                >
                  @{instagram.username}
                </a>
              </div>
              {igOpen ? <ChevronUp size={14} color="#8B857C" /> : <ChevronDown size={14} color="#8B857C" />}
            </button>
            <AnimatePresence initial={false}>
              {igOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pl-8">
                    <p className="mb-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{instagram.aiSummary}</p>
                    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-0.5">
                      {instagram.posts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => window.open(instagram.profileUrl, '_blank')}
                          className="h-[84px] w-[84px] flex-shrink-0 overflow-hidden rounded-[10px] bg-[var(--color-bg-soft)]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.imageUrl} alt={post.caption} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <StaticSnsRow
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/Instagram.svg" alt="Instagram" className="h-[18px] w-[18px]" />
            }
            title="Instagram"
            subtitle="연결된 계정이 없습니다"
          />
        )}
        {linkedinConnected ? (
          <div>
            <button onClick={onToggleLinkedIn} className="flex w-full items-center gap-3.5 py-3.5 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/linkedin.png" alt="LinkedIn" className="h-[18px] w-[18px] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">LinkedIn</div>
                <a
                  href={linkedin.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="mt-0.5 block truncate text-[12px] text-[var(--color-accent-dark)] underline-offset-2 hover:underline"
                >
                  {linkedin.profileUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
              {liOpen ? <ChevronUp size={14} color="#8B857C" /> : <ChevronDown size={14} color="#8B857C" />}
            </button>
            <AnimatePresence initial={false}>
              {liOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pl-8">
                    <p className="mb-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{linkedin.aiSummary}</p>
                    <div className="overflow-hidden rounded-[10px] border border-[var(--color-border-soft)]">
                      <div className="relative max-h-48 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={linkedin.previewImage} alt="LinkedIn 최근 게시물" className="w-full" />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-bg-page)] to-transparent" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <StaticSnsRow
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/linkedin.png" alt="LinkedIn" className="h-[18px] w-[18px]" />
            }
            title="LinkedIn"
            subtitle="연결된 계정이 없습니다"
          />
        )}
      </div>
    </AnimatedSection>
  )
}

function StaticSnsRow({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3.5 py-3.5">
      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">{title}</div>
        <div className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">{subtitle}</div>
      </div>
    </div>
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


function AnimatedSection({
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
