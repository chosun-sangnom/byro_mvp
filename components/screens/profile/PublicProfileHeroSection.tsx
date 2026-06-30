'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Download, Pencil, Share2, Sparkles, X } from 'lucide-react'
import { ActionMenu, ActionMenuItem, BottomSheet, showToast } from '@/components/ui'
import { shareOrCopy } from '@/lib/share'
import type { PersonaReason } from '@/lib/personaGen'

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
  personaText,
  personaReasons,
  personaImage,
  isOwner,
  isBookmarked,
  onBookmarkClick,
  onOwnerEdit,
}: {
  profile: {
    name: string
    title?: string
    linkId?: string
    headline?: string
    age?: number
    avatarColor?: string
    avatarImage?: string
    profileImages?: string[]
  }
  heroTheme: HeroTheme
  personaText?: string
  personaReasons?: PersonaReason[]
  personaImage?: string
  isOwner?: boolean
  isBookmarked?: boolean
  onBookmarkClick?: () => void
  onOwnerEdit?: () => void
}) {
  const galleryImages = normalizeProfileImages(profile.profileImages, profile.avatarImage)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const profileImagesKey = profile.profileImages?.join('|') ?? ''

  useEffect(() => {
    setActiveImageIndex(0)
  }, [profile.linkId, profile.avatarImage, profileImagesKey])

  const mainImage = galleryImages[0]
  const activeImage = galleryImages[activeImageIndex] ?? mainImage

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
        activeImage={mainImage}
        onOpenGallery={() => {
          setActiveImageIndex(0)
          setGalleryOpen(true)
        }}
        personaText={personaText}
        personaReasons={personaReasons}
        personaImage={personaImage}
        isOwner={isOwner}
        isBookmarked={isBookmarked}
        onBookmarkClick={onBookmarkClick}
        onOwnerEdit={onOwnerEdit}
      />

      {galleryImages.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-2 px-1">
          {[1, 2, 3].map((index) => {
            const image = galleryImages[index]
            if (!image) return null
            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setActiveImageIndex(index)
                  setGalleryOpen(true)
                }}
                className={[
                  'relative aspect-square overflow-hidden rounded-[18px] border bg-[var(--color-bg-soft)]',
                  activeImageIndex === index && galleryOpen
                    ? 'border-[var(--color-text-primary)] ring-1 ring-[var(--color-border-default)]'
                    : 'border-[var(--color-border-default)]',
                ].join(' ')}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`${profile.name} 서브 사진 ${index}`} className="h-full w-full object-cover" />
              </button>
            )
          })}
        </div>
      )}

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
  activeImage,
  onOpenGallery,
  personaText,
  personaReasons,
  personaImage,
  isOwner,
  isBookmarked,
  onBookmarkClick,
  onOwnerEdit,
}: {
  profile: {
    name: string
    title?: string
    linkId?: string
    age?: number
    birthDate?: string
    showAge?: boolean
    headline?: string
    avatarColor?: string
    avatarImage?: string
    profileImages?: string[]
    isPaidUser?: boolean
  }
  heroTheme: HeroTheme
  activeImage?: string
  onOpenGallery?: () => void
  personaText?: string
  personaReasons?: PersonaReason[]
  personaImage?: string
  isOwner?: boolean
  isBookmarked?: boolean
  onBookmarkClick?: () => void
  onOwnerEdit?: () => void
}) {
  const [personaSheetOpen, setPersonaSheetOpen] = useState(false)
  const [personaSharing, setPersonaSharing] = useState(false)
  const personaCardRef = useRef<HTMLDivElement>(null)

  const handlePersonaShare = async () => {
    if (!personaCardRef.current || personaSharing) return
    setPersonaSharing(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(personaCardRef.current, { scale: 2, useCORS: true, logging: false })
      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { resolve(); return }
          const file = new File([blob], `byro-persona-${profile.name}.png`, { type: 'image/png' })
          try {
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ files: [file], title: `${profile.name}님의 AI 페르소나`, text: `byro에서 ${profile.name}님의 AI 페르소나를 확인했어요!` })
            } else {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `byro-persona-${profile.name}.png`; a.click()
              URL.revokeObjectURL(url)
              showToast('이미지가 저장됐어요')
            }
          } catch { /* 공유 취소 */ }
          resolve()
        }, 'image/png')
      })
    } catch {
      showToast('공유에 실패했어요')
    } finally {
      setPersonaSharing(false)
    }
  }
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const showAge = typeof profile.age === 'number' && profile.showAge !== false

  return (
    <div className="hero-card border border-[var(--color-border-default)] bg-[var(--color-glass-strong)] p-[8px] backdrop-blur-sm">
      <div className="relative h-[452px] overflow-hidden rounded-[30px] bg-[#121212] text-white ring-1 ring-black/4">


        {/* AI 페르소나 바텀시트 — createPortal로 transform 컨텍스트 탈출 */}
        {personaReasons && mounted && createPortal(
          <BottomSheet open={personaSheetOpen} onClose={() => setPersonaSheetOpen(false)}>
            <div className="pb-8">
              {/* 캡처 대상 카드 */}
              <div ref={personaCardRef} style={{ backgroundColor: '#ffffff' }}>
                {/* [임시] AI 이미지 생성 모델 연동 전 placeholder 이미지 */}
                {personaImage && (
                  <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-t-[inherit]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={personaImage} alt="AI 페르소나 이미지" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
                      <Sparkles size={9} className="text-white/60" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-white/60">AI generated</span>
                    </div>
                  </div>
                )}

                <div className="px-5 pt-5">
                  <div className="mb-5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: '#9CA3AF' }}>
                      <Sparkles size={11} />
                      <span>AI 페르소나</span>
                      <span className="rounded-full px-2 py-0.5 text-[9px]" style={{ background: '#F3F4F6' }}>매주 업데이트됨</span>
                    </div>
                    <p className="mt-3 text-[22px] font-black leading-[1.2]" style={{ color: '#111827' }}>{personaText}</p>
                    <p className="mt-1.5 text-[12px]" style={{ color: '#6B7280' }}>{profile.name} · byro.io</p>
                  </div>
                </div>
              </div>

              {/* 생성 근거 (캡처 제외) */}
              <div className="px-5">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>생성 근거</p>
                  {personaReasons.map((reason) => (
                    <div
                      key={reason.category}
                      className="flex items-center justify-between rounded-[14px] px-4 py-3"
                      style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-soft)' }}
                    >
                      <span className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{reason.category}</span>
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>{reason.value}</span>
                    </div>
                  ))}
                </div>

                {/* 저장 / 공유 버튼 */}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={handlePersonaShare}
                    disabled={personaSharing}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
                    style={{ background: 'var(--color-accent-bg-subtle)', border: '1px solid var(--color-accent-border-soft)', color: 'var(--color-accent-dark)' }}
                  >
                    <Download size={13} />
                    {personaSharing ? '저장 중…' : '저장'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePersonaShare}
                    disabled={personaSharing}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] py-2.5 text-[13px] font-semibold text-white transition-opacity active:opacity-70 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)' }}
                  >
                    <Share2 size={13} />
                    {personaSharing ? '공유 중…' : '공유'}
                  </button>
                </div>
              </div>
            </div>
          </BottomSheet>,
          document.body
        )}

        <div className="relative h-full">
          {activeImage ? (
            <button
              type="button"
              onClick={onOpenGallery}
              className="relative block h-full w-full overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeImage} alt={`${profile.name} 프로필 사진`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_24%,rgba(0,0,0,0.10)_58%,rgba(0,0,0,0.74)_100%)]" />
              {!isOwner && (
                <>
                  {/* 북마크 — 카드 상단 왼쪽 */}
                  {onBookmarkClick && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onBookmarkClick() }}
                      className="absolute left-4 top-4 rounded-full border border-white/14 bg-black/38 p-2 backdrop-blur-sm"
                    >
                      {isBookmarked
                        ? <BookmarkCheck size={18} className="text-white" />
                        : <Bookmark size={18} className="text-white/88" />
                      }
                    </button>
                  )}
                  {/* 더보기 — 카드 상단 오른쪽 */}
                  <div className="absolute right-4 top-4">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMoreSheetOpen((v) => !v) }}
                      className="rounded-full border border-white/14 bg-black/38 px-3 py-1.5 text-[13px] font-bold text-white/88 backdrop-blur-sm leading-none"
                    >
                      ···
                    </button>
                    <ActionMenu open={moreSheetOpen} onClose={() => setMoreSheetOpen(false)}>
                      <ActionMenuItem
                        label="공유하기"
                        onClick={async () => {
                          await shareOrCopy({ title: `${profile.name}의 바이로`, url: window.location.href })
                          setMoreSheetOpen(false)
                        }}
                      />
                      {/* [임시] 프로필 신고 API 미연동 */}
                      <ActionMenuItem
                        label="프로필 신고"
                        danger
                        onClick={() => { setMoreSheetOpen(false); showToast('신고가 접수됐어요') }}
                      />
                    </ActionMenu>
                  </div>
                </>
              )}
            </button>
          ) : (
            <div className="relative h-full overflow-hidden">
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

          {/* 편집 아이콘 — 오너 전용, 카드 우상단 */}
          {isOwner && onOwnerEdit && (
            <button
              type="button"
              onClick={onOwnerEdit}
              className="absolute right-4 top-4 z-10 flex flex-col items-center gap-1 rounded-[14px] border border-white/14 bg-black/38 px-2.5 py-2 backdrop-blur-sm"
            >
              <Pencil size={16} className="text-white/88" />
              <span className="text-[10px] font-semibold text-white/72 leading-none">편집</span>
            </button>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
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
            {profile.isPaidUser && (
              <div className="mb-2 rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm border border-white/20">
                <span className="text-[10px] font-black tracking-widest text-white/90">PRO</span>
              </div>
            )}
          </div>

          {showAge && (
            <div className="mt-0.5 text-[13px] font-semibold text-white/50">
              {profile.age}세
              {profile.birthDate && (
                <span className="ml-1 font-normal">
                  ({profile.birthDate.replace(/-/g, '.')})
                </span>
              )}
            </div>
          )}

          {personaText && (
            <button
              type="button"
              onClick={personaReasons ? () => setPersonaSheetOpen(true) : undefined}
              className="mt-2 flex items-center gap-1.5 rounded-full border border-white/14 bg-black/28 px-3 py-1.5 backdrop-blur-sm"
            >
              <Sparkles size={11} className="text-white/60 shrink-0" />
              <span className="text-[12px] font-medium italic text-white/80">{personaText}</span>
              {personaReasons && (
                <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/50">AI</span>
              )}
            </button>
          )}

          <div className="mt-2.5 text-[11px] font-semibold text-white/38">
            byro.io/{profile.linkId}
          </div>
        </div>
      </div>
    </div>
  )
}

