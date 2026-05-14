'use client'

import { useEffect, useState, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

type HeroTheme = {
  cover: string
  avatar: string
}

function normalizeProfileImages(images?: string[], avatarImage?: string) {
  const merged = [...(images ?? [])]
  if (!merged[0] && avatarImage) merged[0] = avatarImage
  return merged.filter(Boolean).slice(0, 4)
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
    profileImages?: string[]
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
    profileImages?: string[]
    headerMeta?: {
      mood?: string
      availability?: string
    }
    sajuProfile?: {
      showAge?: boolean
      birthDate?: string
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
  const galleryImages = normalizeProfileImages(profile.profileImages, profile.avatarImage)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const profileImagesKey = profile.profileImages?.join('|') ?? ''

  useEffect(() => {
    setActiveImageIndex(0)
  }, [profile.linkId, profile.avatarImage, profileImagesKey])

  const showAge = typeof profile.age === 'number' && profile.sajuProfile?.showAge !== false
  const mood = profile.headerMeta?.mood
  const pung = profile.headerMeta?.availability
  const activeImage = galleryImages[activeImageIndex] ?? galleryImages[0]

  const MoodPill = onEditMood ? 'button' : 'span'
  const PungPill = onEditPung ? 'button' : 'span'

  return (
    <>
      <div className="hero-card border border-[var(--color-border-default)] bg-[var(--color-glass-strong)] p-[8px] backdrop-blur-sm">
        <div className="overflow-hidden rounded-[30px] bg-[#121212] text-white ring-1 ring-black/4">
          <div className="relative">
            {activeImage ? (
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="relative block h-[332px] w-full overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeImage} alt={`${profile.name} 프로필 사진`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_30%,rgba(0,0,0,0.22)_100%)]" />
                <div className="absolute right-4 top-4 rounded-full border border-white/14 bg-black/38 px-3 py-1 text-[11px] font-semibold text-white/88 backdrop-blur-sm">
                  탭해서 크게 보기
                </div>
              </button>
            ) : (
              <div className="relative h-[332px] overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-b ${heroTheme.cover}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.24),rgba(255,255,255,0)_36%),linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_24%,rgba(0,0,0,0.08)_56%,rgba(0,0,0,0.76)_100%)]" />
                <div className="absolute left-1/2 top-[18%] h-[180px] w-[180px] -translate-x-1/2 overflow-hidden rounded-[40px] border border-white/22 bg-gradient-to-br from-white/18 to-white/3 shadow-[0_28px_72px_rgba(0,0,0,0.18)] backdrop-blur-[6px]">
                  <div
                    className={`h-full w-full bg-gradient-to-br ${heroTheme.avatar}`}
                    style={{ backgroundColor: profile.avatarColor }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[72px] font-black text-[#4E3B32]/55">
                    {profile.name.charAt(0)}
                  </div>
                </div>
              </div>
            )}

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-3 gap-2 px-3 pb-3 pt-3">
                {[1, 2, 3].map((index) => {
                  const image = galleryImages[index]
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (!image) return
                        setActiveImageIndex(index)
                      }}
                      className={[
                        'relative aspect-square overflow-hidden rounded-[18px] border bg-white/6',
                        activeImageIndex === index
                          ? 'border-white/46 ring-1 ring-white/24'
                          : 'border-white/10',
                      ].join(' ')}
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={`${profile.name} 서브 사진 ${index}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] font-semibold text-white/36">
                          비어 있음
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-[linear-gradient(180deg,#161616_0%,#101010_100%)] px-5 pb-5 pt-4">
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

            {showAge && (
              <div className="mt-0.5 text-[13px] font-semibold text-white/50">
                {profile.age}세
                {profile.sajuProfile?.birthDate && (
                  <span className="ml-1 font-normal">
                    ({profile.sajuProfile.birthDate.replace(/-/g, '.')})
                  </span>
                )}
              </div>
            )}

            <div className={`text-[13px] font-medium text-white/68 ${showAge ? 'mt-1' : 'mt-2'}`}>
              {profile.title}
            </div>

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

      <AnimatePresence>
        {galleryOpen && activeImage && (
          <motion.div
            className="fixed inset-0 z-[90] bg-black/92 px-4 pb-6 pt-[max(24px,env(safe-area-inset-top))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mx-auto flex h-full w-full max-w-[420px] flex-col">
              <div className="flex items-center justify-between pb-4">
                <div className="text-sm font-semibold text-white/68">
                  사진 {activeImageIndex + 1} / {galleryImages.length}
                </div>
                <button
                  type="button"
                  onClick={() => setGalleryOpen(false)}
                  className="rounded-full border border-white/12 bg-white/6 p-2 text-white/92"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-1 items-center justify-center">
                <div className="w-full overflow-hidden rounded-[28px] bg-white/4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeImage} alt={`${profile.name} 확대 사진`} className="h-full max-h-[70vh] w-full object-cover" />
                </div>
              </div>

              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 pt-4">
                  {galleryImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={[
                        'relative aspect-square overflow-hidden rounded-[16px] border bg-white/6',
                        activeImageIndex === index ? 'border-white/50 ring-1 ring-white/20' : 'border-white/10',
                      ].join(' ')}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={`${profile.name} 썸네일 ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
