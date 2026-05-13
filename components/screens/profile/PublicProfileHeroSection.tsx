'use client'

import type { RefObject } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

type HeroTheme = {
  cover: string
  avatar: string
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
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-accent-bg-subtle)_0%,transparent_68%)]" />
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
    <div className="hero-card border border-[var(--color-border-default)] bg-[var(--color-glass-strong)] p-[8px] backdrop-blur-sm">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-primary)]"
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
