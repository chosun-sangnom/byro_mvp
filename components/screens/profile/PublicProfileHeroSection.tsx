'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, MessageCircle, Pencil, Share2, Sparkles, X } from 'lucide-react'
import { ActionMenu, ActionMenuItem, BottomSheet, TextArea, showToast } from '@/components/ui'
import { shareOrCopy } from '@/lib/share'
import { useFeloreStore } from '@/store/useFeloreStore'
import type { PersonaReason } from '@/lib/personaGen'

const CUSTOM_LINK_ID_REGEX = /^[a-z0-9_]{2,20}$/

type HeroTheme = {
  cover: string
  avatar: string
}

const PROFILE_REPORT_REASONS = [
  '허위 프로필이에요',
  '부적절한 사진이 있어요',
  '스팸 · 광고성 계정이에요',
  '기타',
]

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
  onContactClick,
  onOwnerEdit,
}: {
  profile: {
    name: string
    title?: string
    linkId?: string
    headline?: string
    age?: number
    birthDate?: string
    showAge?: boolean
    mbti?: string
    avatarColor?: string
    avatarImage?: string
    profileImages?: string[]
    isVerified?: boolean
  }
  heroTheme: HeroTheme
  personaText?: string
  personaReasons?: PersonaReason[]
  personaImage?: string
  isOwner?: boolean
  isBookmarked?: boolean
  onBookmarkClick?: () => void
  onContactClick?: () => void
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
        onContactClick={onContactClick}
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
            className="fixed inset-0 z-[100] bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGalleryOpen(false)}
          >
            <div className="relative mx-auto h-full w-full max-w-[430px]" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setGalleryOpen(false)}
                className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/40 backdrop-blur-[10px]"
              >
                <X size={20} className="text-white" />
              </button>

              <div className="flex h-full w-full flex-col items-center justify-center px-8">
                <div className="relative flex w-full max-w-[360px] items-center justify-center">
                  {/* 라이트박스는 카드 비율로 크롭하지 않고 원본 비율 그대로, 뷰포트 안에서 최대치로 보여준다 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeImage}
                    alt={`${profile.name} 확대 사진`}
                    className="max-h-[70vh] w-auto max-w-full rounded-[24px] object-contain"
                  />

                  {galleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)}
                        className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 backdrop-blur-[10px]"
                      >
                        <ChevronLeft size={20} className="text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((i) => (i + 1) % galleryImages.length)}
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 backdrop-blur-[10px]"
                      >
                        <ChevronRight size={20} className="text-white" />
                      </button>
                    </>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <p className="mt-4 text-[14px] font-medium text-white/40">
                    {activeImageIndex + 1}/{galleryImages.length}
                  </p>
                )}
              </div>
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
 * → 편집: 푸터 "Felore 편집" 버튼 (PublicProfileShell)
 * → 소셜 관리: /me 페이지
 *
 * TODO(profile-image): 프로필 사진 업로드/크롭 플로우 연동
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
  onContactClick,
  onOwnerEdit,
  demoPulseContact,
}: {
  profile: {
    name: string
    title?: string
    linkId?: string
    age?: number
    birthDate?: string
    showAge?: boolean
    headline?: string
    mbti?: string
    avatarColor?: string
    avatarImage?: string
    profileImages?: string[]
    isPaidUser?: boolean
    isVerified?: boolean
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
  onContactClick?: () => void
  onOwnerEdit?: () => void
  /** [임시] 온보딩 가이드 데모 전용 — 연락하기 아이콘을 탭한 것처럼 한 번 스케일 펄스 */
  demoPulseContact?: boolean
}) {
  const [personaSheetOpen, setPersonaSheetOpen] = useState(false)
  const [personaSharing, setPersonaSharing] = useState(false)
  const personaCardRef = useRef<HTMLDivElement>(null)

  const store = useFeloreStore()
  const [linkEditSheetOpen, setLinkEditSheetOpen] = useState(false)
  const [customLinkInput, setCustomLinkInput] = useState('')
  const [customLinkError, setCustomLinkError] = useState(false)
  const randomLinkId = store.user?.randomLinkId ?? store.user?.linkId ?? profile.linkId ?? ''

  const handleOpenLinkEdit = () => {
    if (!profile.isPaidUser) {
      showToast('유료 플랜에서만 사용할 수 있는 기능이에요.', 'error')
      return
    }
    setCustomLinkInput(store.user?.customLinkId ?? '')
    setCustomLinkError(false)
    setLinkEditSheetOpen(true)
  }

  const handleSaveCustomLinkId = () => {
    const trimmed = customLinkInput.trim().toLowerCase()
    if (trimmed && !CUSTOM_LINK_ID_REGEX.test(trimmed)) {
      setCustomLinkError(true)
      return
    }
    setCustomLinkError(false)
    store.setCustomLinkId(trimmed || null)
    setLinkEditSheetOpen(false)
    showToast(trimmed ? '링크가 변경됐어요!' : '기본 링크로 복원했어요')
  }

  const handlePersonaShare = async () => {
    if (!personaCardRef.current || personaSharing) return
    setPersonaSharing(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(personaCardRef.current, { scale: 2, useCORS: true, logging: false })
      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { resolve(); return }
          const file = new File([blob], `felore-persona-${profile.name}.png`, { type: 'image/png' })
          try {
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ files: [file], title: `${profile.name}님의 AI 페르소나`, text: `felore에서 ${profile.name}님의 AI 페르소나를 확인했어요!` })
            } else {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = `felore-persona-${profile.name}.png`; a.click()
              URL.revokeObjectURL(url)
              showToast('이미지가 저장됐어요')
            }
          } catch { /* 공유 취소 */ }
          resolve()
        }, 'image/png')
      })
    } catch {
      showToast('공유에 실패했어요', 'error')
    } finally {
      setPersonaSharing(false)
    }
  }
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)
  const [reportSheetOpen, setReportSheetOpen] = useState(false)
  const [reportReasons, setReportReasons] = useState<string[]>([])
  const [reportDetail, setReportDetail] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const showAge = typeof profile.age === 'number' && profile.showAge !== false
  const hasPersonaData = !!personaReasons && personaReasons.length > 0

  const closeReportSheet = () => {
    setReportSheetOpen(false)
    setReportReasons([])
    setReportDetail('')
  }

  const toggleReportReason = (reason: string) => {
    setReportReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    )
  }

  const handleSubmitReport = () => {
    if (reportReasons.length === 0) return
    closeReportSheet()
    showToast('신고가 접수됐어요')
  }

  return (
    <div className="relative h-[468px] overflow-hidden rounded-[var(--radius-hero)] bg-[#121212] text-white">


        {/* AI 페르소나 바텀시트 — createPortal로 transform 컨텍스트 탈출 */}
        {hasPersonaData && mounted && createPortal(
          <BottomSheet open={personaSheetOpen} onClose={() => setPersonaSheetOpen(false)}>
            <div className="flex flex-col gap-6 px-4 pb-6">
              {/* 캡처 대상 카드 */}
              <div ref={personaCardRef} style={{ backgroundColor: '#ffffff' }}>
                {/* [임시] AI 이미지 생성 모델 연동 전 placeholder 이미지 */}
                {personaImage && (
                  <div className="relative h-[190px] w-full shrink-0 overflow-hidden rounded-[12px] bg-[#F5F6F7]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={personaImage} alt="AI 페르소나 이미지" className="h-full w-full object-cover" />
                    <div className="absolute right-4 top-4 rounded-[6px] bg-black/80 px-1.5 py-1 text-[12px] font-bold text-white backdrop-blur-[10px]">
                      AI 생성
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <Sparkles size={14} style={{ color: '#25313D' }} />
                    <span className="text-[12px] font-bold" style={{ color: '#25313D' }}>AI 페르소나</span>
                    <span className="rounded-[4px] px-1 py-0.5 text-[8px] font-bold" style={{ background: '#F0F5FF', color: '#25313D' }}>매주 업데이트됨</span>
                  </div>
                  <p className="text-[18px] font-bold leading-[1.35]" style={{ color: '#0D0D0D' }}>{personaText}</p>
                </div>
              </div>

              {/* 생성 근거 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-[16px] font-bold" style={{ color: '#0D0D0D' }}>생성 근거</p>
                  <p className="text-[12px] font-medium" style={{ color: '#6C7786' }}>{profile.name} · felore.io</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {personaReasons.map((reason) => (
                    <div
                      key={reason.category}
                      className="flex items-center justify-between rounded-[12px] border px-4 py-4"
                      style={{ borderColor: '#DEE4EC' }}
                    >
                      <span className="text-[14px] font-semibold" style={{ color: '#6C7786' }}>{reason.category}</span>
                      <span className="text-[14px] font-medium" style={{ color: '#25313D' }}>{reason.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 저장 / 공유 버튼 */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePersonaShare}
                  disabled={personaSharing}
                  className="flex flex-1 items-center justify-center rounded-full border py-4 text-[14px] font-bold transition-opacity active:opacity-70 disabled:opacity-50"
                  style={{ borderColor: '#DEE4EC', color: '#25313D' }}
                >
                  {personaSharing ? '저장 중…' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={handlePersonaShare}
                  disabled={personaSharing}
                  className="flex flex-1 items-center justify-center rounded-full bg-black py-4 text-[14px] font-bold text-white transition-opacity active:opacity-70 disabled:opacity-50"
                >
                  {personaSharing ? '공유 중…' : '공유'}
                </button>
              </div>
            </div>
          </BottomSheet>,
          document.body
        )}

        {/* 프로필 신고 바텀시트 — createPortal로 transform 컨텍스트 탈출 */}
        {mounted && createPortal(
          <BottomSheet open={reportSheetOpen} onClose={closeReportSheet}>
            <div className="px-5 pb-6">
              <div className="mb-2 text-[18px] font-bold tracking-[-0.54px] text-[#0d0d0d]">
                프로필 신고
              </div>
              <p className="mb-5 text-[14px] leading-relaxed tracking-[-0.28px] text-[#475058]">
                {profile.name}님의 프로필을 신고해요. 사유를 선택해주세요.
              </p>

              <div className="mb-4 flex flex-col gap-4">
                {PROFILE_REPORT_REASONS.map((reason) => {
                  const checked = reportReasons.includes(reason)
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => toggleReportReason(reason)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[6px]"
                        style={{ backgroundColor: checked ? '#25313d' : '#f5f6f7' }}
                      >
                        {checked && <Check size={12} strokeWidth={3} className="text-white" />}
                      </span>
                      <span className="text-[16px] font-medium tracking-[-0.32px] text-[#25313d]">
                        {reason}
                      </span>
                    </button>
                  )
                })}
              </div>

              <TextArea
                value={reportDetail}
                onChange={setReportDetail}
                placeholder="구체적인 내용을 적어주시면 검토에 도움이 돼요 (선택)"
                maxLength={300}
                rows={3}
              />

              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={reportReasons.length === 0}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-black py-4 text-[16px] font-semibold tracking-[-0.48px] text-white transition-opacity disabled:opacity-50"
              >
                제출하기
              </button>
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

          {!isOwner && (
            <>
              {/* 북마크 — 카드 상단 왼쪽 */}
              {onBookmarkClick && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onBookmarkClick() }}
                  data-tour="bookmark"
                  className="absolute left-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.8)] bg-[rgba(102,102,102,0.4)] backdrop-blur-[10px]"
                >
                  {isBookmarked
                    ? <BookmarkCheck size={18} className="text-white" />
                    : <Bookmark size={18} className="text-white" />
                  }
                </button>
              )}
              {/* 연락하기 + 더보기 — 카드 상단 오른쪽 */}
              <div className="absolute right-4 top-4 z-10 flex gap-2">
                {onContactClick && (
                  <motion.button
                    type="button"
                    aria-label="연락하기"
                    onClick={(e) => { e.stopPropagation(); onContactClick() }}
                    animate={demoPulseContact ? { scale: [1, 1, 0.82, 1] } : undefined}
                    transition={demoPulseContact ? { duration: 0.9, times: [0, 0.55, 0.75, 1], ease: [0.22, 1, 0.36, 1] } : undefined}
                    className="flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.8)] bg-[rgba(102,102,102,0.4)] backdrop-blur-[10px]"
                  >
                    <MessageCircle size={18} className="text-white" />
                  </motion.button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMoreSheetOpen((v) => !v) }}
                  className="flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.8)] bg-[rgba(102,102,102,0.4)] text-[18px] font-bold leading-none text-white backdrop-blur-[10px]"
                >
                  ···
                </button>
                <ActionMenu open={moreSheetOpen} onClose={() => setMoreSheetOpen(false)}>
                  <ActionMenuItem
                    label="공유하기"
                    onClick={async () => {
                      await shareOrCopy({ title: `${profile.name}의 펠로어`, url: window.location.href })
                      setMoreSheetOpen(false)
                    }}
                  />
                  <ActionMenuItem
                    label="프로필 신고"
                    danger
                    onClick={() => { setMoreSheetOpen(false); setReportSheetOpen(true) }}
                  />
                </ActionMenu>
              </div>
            </>
          )}

          {/* 공유 — 오너 전용, 카드 좌상단 */}
          {isOwner && activeImage && (
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation()
                await shareOrCopy({ title: `${profile.name}의 펠로어`, url: window.location.href })
              }}
              className="absolute left-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.8)] bg-[rgba(102,102,102,0.4)] backdrop-blur-[10px]"
            >
              <Share2 size={18} className="text-white" />
            </button>
          )}

          {/* 편집 아이콘 — 오너 전용, 카드 우상단 */}
          {isOwner && onOwnerEdit && (
            <button
              type="button"
              onClick={onOwnerEdit}
              className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.8)] bg-[rgba(102,102,102,0.4)] backdrop-blur-[10px]"
            >
              <Pencil size={18} className="text-white" />
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
            {profile.isVerified && (
              <BadgeCheck
                size={20}
                className="mb-2 shrink-0 fill-[#3B82F6] text-white"
                strokeWidth={2.5}
              />
            )}
            {profile.isPaidUser && (
              <div className="mb-2 rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm border border-white/20">
                <span className="text-[10px] font-black tracking-widest text-white/90">PRO</span>
              </div>
            )}
          </div>

          {(showAge || profile.mbti) && (
            <div className="mt-1 flex items-center gap-1">
              {profile.mbti && (
                <span className="flex h-[21px] items-center rounded-full bg-[rgba(102,102,102,0.4)] px-2 text-[14px] text-white/85 backdrop-blur-[10px]">
                  {profile.mbti}
                </span>
              )}
              {showAge && (
                <span className="text-[14px] text-white/85">
                  {profile.age}세
                  {profile.birthDate && (
                    <span className="ml-1">
                      ({profile.birthDate.replace(/-/g, '.')})
                    </span>
                  )}
                </span>
              )}
            </div>
          )}

          {personaText && (
            hasPersonaData ? (
              <button
                type="button"
                onClick={() => setPersonaSheetOpen(true)}
                data-tour="persona"
                className="border-beam mt-2 flex w-full items-center gap-2 rounded-[16px] border border-white/50 bg-[rgba(102,102,102,0.4)] py-3 pl-3 pr-4 backdrop-blur-[10px]"
              >
                <span className="min-w-0 flex-1 text-left text-[14px] font-medium leading-[1.35] text-white">{personaText}</span>
                <span
                  className="ml-1 flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-1 text-[13px] font-medium text-white"
                  style={{ backgroundImage: 'linear-gradient(110deg, #0088FF 0%, #34C759 100%)' }}
                >
                  <Sparkles size={12} />AI
                </span>
              </button>
            ) : (
              <div data-tour="persona" className="mt-2 flex w-full items-center gap-2 rounded-[16px] border border-white/20 bg-[rgba(102,102,102,0.25)] py-3 pl-3 pr-4 backdrop-blur-[10px]">
                <span className="min-w-0 flex-1 text-left text-[14px] font-medium text-white/40">{personaText}</span>
              </div>
            )
          )}

          <div className="mt-2.5 flex items-center gap-1">
            <span className="text-[11px] font-semibold text-white/38">
              felore.io/{profile.linkId}
            </span>
            {isOwner && (
              <button
                type="button"
                onClick={handleOpenLinkEdit}
                className="flex h-4 w-4 items-center justify-center text-white/38 active:opacity-60"
                aria-label="프로필 링크 편집"
              >
                <Pencil size={11} />
              </button>
            )}
          </div>
        </div>

        {isOwner && createPortal(
          <BottomSheet
            open={linkEditSheetOpen}
            onClose={() => { setLinkEditSheetOpen(false); setCustomLinkError(false) }}
          >
          <div className="flex flex-col gap-6 px-4 pb-6 pt-3">
            <div className="flex flex-col gap-2 w-full">
              <p className="text-[18px] font-bold text-[#0D0D0D]">프로필 링크 편집</p>
              <p className="text-[14px] font-medium leading-[1.5] text-[#475058]">
                나만의 링크를 설정하면 felore.io/내이름 형태로 프로필을 공유할 수 있어요. 유료 이용 종료 시 기본 링크로 자동 복원돼요.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <p className="text-[14px] font-semibold text-[#0D0D0D]">
                기본 링크<span className="text-[#6C7786]">(변경 불가)</span>
              </p>
              <div className="flex items-center gap-2.5 rounded-full border border-[#DEE4EC] bg-[#F5F6F7] px-4 py-3">
                <span className="text-[14px] font-medium text-[#A8B1BD]">felore.io/{randomLinkId}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <p className="text-[14px] font-semibold text-[#0D0D0D]">커스텀 링크</p>
              <div
                className={[
                  'flex items-center gap-2.5 rounded-full border bg-white px-4 py-3',
                  customLinkError ? 'border-[#FF4242]' : 'border-[#DEE4EC]',
                ].join(' ')}
              >
                <span className="text-[14px] font-medium text-[#A8B1BD] flex-shrink-0">felore.io/</span>
                <input
                  type="text"
                  value={customLinkInput}
                  onChange={(e) => { setCustomLinkInput(e.target.value.toLowerCase()); setCustomLinkError(false) }}
                  placeholder="예: gangminjun"
                  maxLength={20}
                  className="flex-1 min-w-0 bg-transparent text-[14px] font-medium text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                />
              </div>
              {customLinkError && (
                <p className="text-[12px] font-medium text-[#FF4242]">올바른 커스텀 링크 형식을 입력해주세요.</p>
              )}
              <p className="text-[12px] font-medium text-[#6C7786]">영문 소문자, 숫자, _만 사용, 2~20자</p>
            </div>

            <div className="flex items-start gap-2 w-full">
              <button
                onClick={() => { setLinkEditSheetOpen(false); setCustomLinkError(false) }}
                className="flex-1 rounded-full border border-[#DEE4EC] px-6 py-3 text-[14px] font-bold text-[#25313D]"
              >
                취소
              </button>
              <button
                onClick={handleSaveCustomLinkId}
                className="flex-1 rounded-full bg-black px-6 py-3 text-[14px] font-bold text-white"
              >
                저장
              </button>
            </div>
            {store.user?.customLinkId && (
              <button
                onClick={() => { store.setCustomLinkId(null); setCustomLinkInput(''); setCustomLinkError(false); setLinkEditSheetOpen(false); showToast('기본 링크로 복원했어요') }}
                className="-mt-2 w-full text-center text-[13px] font-medium text-[#A8B1BD]"
              >
                기본 링크로 복원
              </button>
            )}
          </div>
          </BottomSheet>,
          document.body
        )}
      </div>
  )
}


