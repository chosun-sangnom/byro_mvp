'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, ChevronDown, ChevronUp, Bookmark, Copy, Mail, MessageCircle, Phone, Share2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import {
  Button, Chip, BottomSheet, Modal, TextArea, showToast,
} from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { CareerContinuityChart } from '@/components/highlights/CareerContinuityChart'
import { CorporateLongevityTimeline } from '@/components/highlights/CorporateLongevityTimeline'
import {
  SAMPLE_PROFILE, JIMIN_PROFILE, INSTAGRAM_PROFILE, LINKEDIN_PROFILE, HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS,
} from '@/lib/mockData'
import type { Highlight, HighlightIconId } from '@/types'

interface PublicProfileProps {
  username: string
  mode?: 'public' | 'owner'
  onOpenArchive?: () => void
  onOpenManage?: () => void
}

const AIRLINE_BADGE_LABELS = {
  global_business: '글로벌 비즈니스',
  active_business: '액티브 비즈니스',
  business_traveler: '비즈니스 이동형',
} as const

export default function PublicProfile({
  username,
  mode = 'public',
  onOpenArchive,
  onOpenManage,
}: PublicProfileProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const store = useByroStore()
  const isOwnerMode = mode === 'owner'

  // username에 따라 프로필 데이터 선택
  const isJimin = username === 'jiminlee'
  const isOwnProfile = store.user?.linkId === username
  const baseProfile = isJimin ? JIMIN_PROFILE : SAMPLE_PROFILE
  const rawProfile = isOwnProfile && store.user
    ? {
      ...baseProfile,
      name: store.user.name,
      linkId: store.user.linkId,
      title: store.user.title,
      school: store.user.school,
      bio: store.user.bio,
      selectedKeywords: store.user.selectedKeywords,
      avatarColor: store.user.avatarColor ?? baseProfile.avatarColor,
      avatarImage: store.user.avatarImage || baseProfile.avatarImage,
      contactChannels: store.user.contactChannels ?? baseProfile.contactChannels,
    }
    : baseProfile

  // 공통 필드 정규화
  const profile = {
    ...rawProfile,
    instagram: isJimin ? JIMIN_PROFILE.instagram : {
      username: INSTAGRAM_PROFILE.username,
      profileUrl: INSTAGRAM_PROFILE.profileUrl,
      aiSummary: INSTAGRAM_PROFILE.aiSummary,
      posts: INSTAGRAM_PROFILE.posts,
    },
    reputationKeywords: rawProfile.reputationKeywords,
    guestbook: rawProfile.guestbook,
  }
  const heroTheme = 'heroTheme' in rawProfile
    ? rawProfile.heroTheme
    : {
      cover: 'from-[#B69B8B] via-[#836F66] to-[#121212]',
      avatar: 'from-[#DCC5B6] to-[#8F7265]',
    }
  const contactChannels = 'contactChannels' in rawProfile ? rawProfile.contactChannels : []
  const corporateHighlight = 'corporateHighlight' in rawProfile
    ? rawProfile.corporateHighlight
    : {
      companyCount: 1,
      years: 4,
      summary: '창업 4년차 · 정상 운영 중 · 폐업 이력 없음',
      companies: [
        { name: 'Byro Studio', startYear: 2022, endYear: null, years: 4, status: '정상 운영' },
      ],
    }
  const airlineHighlight = 'airlineHighlight' in rawProfile
    ? rawProfile.airlineHighlight
    : { tierSummary: '대한항공 모닝캄', badgeLevel: 'business_traveler', airlines: [{ name: '대한항공', tier: '모닝캄' }] }
  const airlineBadgeLabel = AIRLINE_BADGE_LABELS[airlineHighlight.badgeLevel as keyof typeof AIRLINE_BADGE_LABELS] ?? null

  const [expSheetOpen, setExpSheetOpen] = useState(false)
  const [expDoneModal, setExpDoneModal] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [memoSheetOpen, setMemoSheetOpen] = useState(false)
  const [memoText, setMemoText] = useState('')
  const [bioExpanded, setBioExpanded] = useState(false)
  const [bioOverflowing, setBioOverflowing] = useState(false)
  const bioRef = useRef<HTMLParagraphElement | null>(null)
  const keywordCounts = profile.selectedKeywords
    .slice(0, 5)
    .map((keyword) => ({
      keyword,
      count: profile.reputationKeywords.find((item) => item.keyword === keyword)?.count ?? 0,
    }))
  const featuredGuestbook = profile.guestbook.slice(0, 3)
  const experienceOptions = profile.selectedKeywords.slice(0, 4)
  const verifiedHighlights: Highlight[] = [
    {
      id: `verified-career-${username}`,
      categoryId: 'career-continuity',
      icon: 'briefcase',
      title: '커리어 지속성',
      subtitle: `건강보험공단 기준 · 2026.04 인증`,
      description: '업계 평균 대비 더 길게 축적된 재직 이력을 보여줍니다.',
      year: '',
    },
    {
      id: `verified-corporate-${username}`,
      categoryId: 'corporate-longevity',
      icon: 'building2',
      title: '법인 영속성',
      subtitle: corporateHighlight.summary,
      description: '법인 운영 기간과 정상 운영 여부를 확인한 항목입니다.',
      year: '',
    },
    {
      id: `verified-remember-${username}`,
      categoryId: 'remember-network',
      icon: 'users',
      title: '리멤버 네트워크',
      subtitle: '리멤버 명함 기반 직업 네트워크',
      description: '명함 기반 직업 네트워크 구성이 인증되어 공개됩니다.',
      year: '',
    },
    ...(!isJimin ? [{
      id: `verified-airline-${username}`,
      categoryId: 'airline-mileage' as const,
      icon: 'plane' as const,
      title: '항공 마일리지',
      subtitle: airlineHighlight.tierSummary,
      description: '항공사 회원 등급으로 이동성과 출장 경험을 보여줍니다.',
      year: '',
    }] : []),
  ]
  const groupedHighlights = HIGHLIGHT_GROUPS.map((group) => ({
    ...group,
    items: [...verifiedHighlights, ...profile.manualHighlights].filter(
      (item) => HIGHLIGHT_CATEGORIES.find((category) => category.id === item.categoryId)?.group === group.id,
    ),
  })).filter((group) => group.items.length > 0)

  // SNS 토글
  const igOpen = store.snsOpenStates['instagram_' + username] ?? false
  const liOpen = store.snsOpenStates['linkedin_' + username] ?? false

  useEffect(() => {
    setBioExpanded(false)
  }, [profile.bio, username])

  useEffect(() => {
    const checkOverflow = () => {
      const element = bioRef.current
      if (!element) return
      setBioOverflowing(element.scrollHeight - element.clientHeight > 2)
    }

    if (bioExpanded) return
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [profile.bio, bioExpanded])

  const handleExpSubmit = () => {
    if (store.experienceKeywords.length === 0) {
      showToast('키워드를 하나 이상 선택해주세요')
      return
    }
    store.markExpSubmitted(profile.linkId)
    store.clearExperience()
    setExpSheetOpen(false)
    setExpDoneModal(true)
  }

  const alreadySubmitted = store.expSubmittedProfiles.includes(profile.linkId)
  const publicProfileUrl = `https://byro.io/@${profile.linkId}`

  const handleCopyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl)
      showToast('프로필 링크를 복사했어요')
    } catch {
      showToast('링크 복사에 실패했어요')
    }
  }

  const handleShareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name}의 Byro`,
          text: `${profile.name}의 Byro 프로필을 확인해보세요.`,
          url: publicProfileUrl,
        })
        return
      }
      await navigator.clipboard.writeText(publicProfileUrl)
      showToast('공유 기능을 지원하지 않아 링크를 복사했어요')
    } catch {
      showToast('공유를 취소했어요')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 상단 네비 */}
      <div className="flex items-center px-4 h-12 border-b border-[#EBEBEB] bg-white/92 backdrop-blur-sm flex-shrink-0">
        <button onClick={() => router.back()} className="text-sm text-[#555] mr-2">‹</button>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-[#AAA] uppercase tracking-[0.18em]">{isOwnerMode ? 'My Byro' : 'Public Profile'}</div>
          <div className="text-xs text-[#555] truncate">byro.io/@{profile.linkId}</div>
        </div>
        {!isOwnerMode ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (bookmarked) {
                  setBookmarked(false)
                  showToast('저장 취소됐어요')
                } else {
                  setMemoSheetOpen(true)
                }
              }}
              className={[
                'icon-button',
                bookmarked ? 'bg-[#0A0A0A] border-[#0A0A0A]' : 'bg-white border-[#ddd]',
              ].join(' ')}
            >
              <Bookmark size={14} color={bookmarked ? '#fff' : '#555'} />
            </button>
            <button
              onClick={() => showToast('공유 링크를 준비 중이에요')}
              className="icon-button"
            >
              <Share2 size={14} color="#555" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyProfileLink}
              className="icon-button"
              aria-label="프로필 링크 복사"
            >
              <Copy size={14} color="#555" />
            </button>
            <button
              onClick={handleShareProfile}
              className="icon-button"
              aria-label="프로필 공유"
            >
              <Share2 size={14} color="#555" />
            </button>
          </div>
        )}
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 프로필 헤더 */}
        <div className="px-5 pt-4 pb-3">
          <div className="hero-card bg-[var(--color-bg-soft)] p-[7px]">
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
                <div className="flex items-center gap-1.5">
                  <div className="text-[29px] font-black tracking-[-0.04em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.24)]">{profile.name}</div>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#43C07A] text-[10px] font-black text-white shadow-[0_8px_20px_rgba(67,192,122,0.35)]">✓</span>
                </div>
                <div className="mt-1 text-[15px] font-medium text-white/72">{profile.title}</div>
                <div className="mt-4 max-w-[318px] rounded-[18px] border border-white/12 bg-white/10 px-4 py-3 text-[15px] leading-[1.52] text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[8px]">
                  <p ref={bioRef} className={bioExpanded ? '' : 'line-clamp-3'}>
                    {profile.bio}
                  </p>
                  {bioOverflowing && (
                    <button
                      onClick={() => setBioExpanded((prev) => !prev)}
                      className="mt-2 text-xs font-semibold text-white/82"
                    >
                      {bioExpanded ? '접기' : '더보기'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isOwnerMode && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={onOpenArchive}
                  className="flex-1 rounded-[18px] border border-[#D8D8D8] bg-white px-4 py-3 text-sm font-semibold text-[#555]"
                >
                  아카이브
                </button>
                <button
                  onClick={onOpenManage}
                  className="flex-1 rounded-[18px] bg-[#111] px-4 py-3 text-sm font-semibold text-white"
                >
                  Byro 편집
                </button>
              </div>
            )}

            <div className="surface-card mt-4 px-4 py-4">
              <div>
                <div className="text-sm font-black text-[var(--color-text-strong)]">누적 평판</div>
                <div className="micro-text mt-0.5">키워드와 최근 방명록으로 신뢰도를 보여줘요</div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {keywordCounts.map((item) => (
                  <span key={item.keyword} className="chip-metric">
                    {item.keyword} <span className="ml-1 font-black text-[#111]">{item.count}</span>
                  </span>
                ))}
              </div>

              <div className="mt-4 divide-y divide-[#F1F1F1]">
                {featuredGuestbook.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => router.push('/jiminlee')}
                    className="flex w-full gap-2.5 py-3 text-left first:pt-0 last:pb-0"
                  >
                    {entry.authorName === '이지민' ? (
                      <div className="mt-0.5 h-8 w-8 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/jimin-profile-5x4.jpg" alt={`${entry.authorName} 프로필 사진`} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="mt-0.5 h-8 w-8 rounded-full bg-[#e0e0e0] flex items-center justify-center text-xs font-bold text-[#555] flex-shrink-0">
                        {entry.authorName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-[#222]">{entry.authorName}</div>
                        <div className="text-[10px] text-[#BBB]">{entry.date}</div>
                      </div>
                      <div className="mt-1 text-sm leading-relaxed text-[#555] line-clamp-2">{entry.message}</div>
                    </div>
                  </button>
                ))}
              </div>

              {profile.guestbook.length > 0 && (
                <button
                  onClick={() => router.push(`/${profile.linkId}/guestbook`)}
                  className="mt-4 w-full rounded-[var(--radius-md)] border px-3 py-2.5 text-xs font-semibold"
                  style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}
                >
                  더보기
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── SNS 섹션 ─────────────────────────────── */}
        <div className="px-5 py-4">
          <SectionTitle
            title="SNS"
          />

          {profile.instagramConnected && (
            <div className="mb-2 overflow-hidden rounded-[22px] border" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-surface)' }}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => store.toggleSnsOpen('instagram_' + username)}
                  className="flex min-w-0 flex-1 items-center text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/Instagram.svg" alt="Instagram" className="w-5 h-5 mr-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold">Instagram
                      <span className="ml-1.5 text-[10px] font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-full px-2 py-0.5">연동됨</span>
                    </div>
                    <a
                      href={profile.instagram.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block truncate text-xs text-[#0D47A1] underline-offset-2 hover:underline"
                    >
                      instagram.com/{profile.instagram.username}
                    </a>
                  </div>
                </button>
                <button
                  onClick={() => store.toggleSnsOpen('instagram_' + username)}
                  className="flex-shrink-0 p-1"
                  aria-label={igOpen ? '인스타그램 섹션 접기' : '인스타그램 섹션 펼치기'}
                >
                  {igOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                </button>
              </div>
              {igOpen && (
                <div className="px-4 pb-4">
                  <div className="surface-card-soft mb-3 rounded-2xl px-3 py-3">
                    <div className="text-[11px] text-[#888] mb-1">AI 요약</div>
                    <p className="text-xs text-[#555] leading-relaxed">{profile.instagram.aiSummary}</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {profile.instagram.posts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => window.open(profile.instagram.profileUrl, '_blank')}
                        className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[#e8e8e8]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#aaa] text-right mt-1">최근 게시물 미리보기</p>
                </div>
              )}
            </div>
          )}

          {profile.linkedinConnected && (
            <div className="mb-2 overflow-hidden rounded-[22px] border" style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-surface)' }}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => store.toggleSnsOpen('linkedin_' + username)}
                  className="flex min-w-0 flex-1 items-center text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/linkedin.png" alt="LinkedIn" className="w-5 h-5 mr-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold">LinkedIn
                      <span className="ml-1.5 text-[10px] font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-full px-2 py-0.5">연동됨</span>
                    </div>
                    <a
                      href={LINKEDIN_PROFILE.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block truncate text-xs text-[#0D47A1] underline-offset-2 hover:underline"
                    >
                      {LINKEDIN_PROFILE.profileUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </button>
                <button
                  onClick={() => store.toggleSnsOpen('linkedin_' + username)}
                  className="flex-shrink-0 p-1"
                  aria-label={liOpen ? '링크드인 섹션 접기' : '링크드인 섹션 펼치기'}
                >
                  {liOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                </button>
              </div>
              {liOpen && (
                <div className="px-4 pb-4">
                  <div className="surface-card-soft mb-3 rounded-2xl px-3 py-3">
                    <div className="text-[11px] text-[#888] mb-1">AI 요약</div>
                    <p className="text-xs text-[#555] leading-relaxed">
                      Growth 마케팅과 B2B SaaS 제품 전략을 중심으로 활동하며, 스타트업 초기 마케팅 구조 설계 경험이 풍부합니다.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-xl border border-[#EFEFEF] overflow-hidden">
                      <div className="px-3 pt-2.5 pb-1 text-[11px] text-[#888]">최근 게시물</div>
                      <div className="relative max-h-48 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/linkedsample.png" alt="LinkedIn 최근 게시물" className="w-full" />
                        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!profile.instagramConnected && !profile.linkedinConnected && (
            <p className="text-sm text-[#888]">연동된 SNS가 없습니다.</p>
          )}
        </div>

        {/* ─── 하이라이트 섹션 ─────────────────────── */}
        <div className="px-5 py-4">
          <SectionTitle title="하이라이트" />

          <div className="space-y-6">
            {groupedHighlights.map((group) => (
              <div key={group.id}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="text-xs font-semibold text-[#8E867E]">{group.label} {group.items.length}개</div>
                  <div className="h-px flex-1 bg-[#E7E2DC]" />
                </div>
                {group.items.length > 0 ? (
                  <div className="space-y-2">
                    {group.items.map((hl) => {
                      const isVerified = hl.id.startsWith('verified-')
                      const toggleKey = `${hl.id}_${username}`
                      const isOpen = store.hlOpenStates[toggleKey] ?? false
                      const category = HIGHLIGHT_CATEGORIES.find((item) => item.id === hl.categoryId)
                      return (
                        <div key={hl.id} className="overflow-hidden rounded-[22px] border border-[#E7E2DC] bg-white">
                          <button
                            onClick={() => store.toggleHlOpen(toggleKey)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left"
                          >
                            <span className="flex h-11 w-8 items-center justify-center text-[var(--color-text-strong)]">
                              <HighlightIcon id={hl.icon as HighlightIconId} size={18} />
                            </span>
                            <div className="min-w-0 flex-1">
                              {isVerified ? (
                                <>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[15px] font-bold text-[var(--color-text-strong)]">{hl.title}</span>
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#217A43] shadow-[0_2px_8px_rgba(17,17,17,0.08)]">
                                      <BadgeCheck size={12} />
                                    </span>
                                  </div>
                                  <div className="micro-text mt-0.5">{hl.subtitle}</div>
                                </>
                              ) : (
                                <>
                                  <div className="text-[15px] font-bold text-[var(--color-text-strong)]">
                                    {category?.label ?? '직접 입력'}
                                  </div>
                                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{hl.title}</span>
                                    {hl.year && (
                                      <span className="text-[11px] text-[var(--color-text-tertiary)]">{hl.year}</span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                            {isOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                          </button>
                          {isOpen && (
                            <div className="border-t border-[#F1ECE6] bg-[#FBFAF8] px-4 py-4">
                              {hl.categoryId === 'career-continuity' && (
                                <CareerContinuityChart
                                  avgYears={profile.careerHighlight.avgYears}
                                  vsIndustryPercent={profile.careerHighlight.vsIndustryPercent}
                                />
                              )}
                              {hl.categoryId === 'remember-network' && (
                                <>
                                  <svg viewBox="0 0 200 150" className="w-full h-auto mb-2">
                                    <circle cx="100" cy="75" r="20" fill="#333" stroke="#fff" strokeWidth="2" />
                                    <text x="100" y="79" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">나</text>
                                    {profile.rememberHighlight.industries.map((ind, index) => {
                                      const positions = [
                                        { cx: 100, cy: 22, r: 18 },
                                        { cx: 168, cy: 75, r: 15 },
                                        { cx: 100, cy: 128, r: 13 },
                                        { cx: 32, cy: 75, r: 14 },
                                      ]
                                      const pos = positions[index] ?? { cx: 100, cy: 22, r: 14 }
                                      return (
                                        <g key={ind.name}>
                                          <line x1="100" y1="75" x2={pos.cx} y2={pos.cy} stroke="#ccc" strokeWidth="1" />
                                          <circle cx={pos.cx} cy={pos.cy} r={pos.r} fill={['#111', '#444', '#666', '#999'][index] ?? '#888'} stroke="#fff" strokeWidth="2" />
                                          <text x={pos.cx} y={pos.cy - 3} textAnchor="middle" fontSize="6" fill="#fff">{ind.name}</text>
                                          <text x={pos.cx} y={pos.cy + 6} textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700">{ind.ratio}%</text>
                                        </g>
                                      )
                                    })}
                                  </svg>
                                  <div className="text-xs text-[#bbb] text-right">리멤버 명함 기준 · 총 {profile.rememberHighlight.total}명</div>
                                </>
                              )}
                              {hl.categoryId === 'corporate-longevity' && (
                                <CorporateLongevityTimeline
                                  summary={corporateHighlight.summary}
                                  companies={corporateHighlight.companies}
                                />
                              )}
                              {hl.categoryId === 'airline-mileage' && (
                                <div>
                                  {airlineBadgeLabel && (
                                    <div className="mb-3 inline-flex items-center rounded-full border border-[#E5E5E5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#333]">
                                      {airlineBadgeLabel}
                                    </div>
                                  )}
                                  <div className="space-y-2">
                                    {airlineHighlight.airlines.map((airline) => (
                                      <div key={airline.name} className="flex items-center justify-between rounded-2xl border border-[#E7E2DC] bg-white px-4 py-3">
                                        <div className="text-sm text-[var(--color-text-secondary)]">{airline.name}</div>
                                        <div className="text-sm font-bold text-[var(--color-text-strong)]">{airline.tier}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {!isVerified && (
                                <div className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                                  {hl.description || '세부 설명이 아직 없어요.'}
                                  <div className="micro-text mt-2">
                                    {category?.label ?? hl.subtitle}
                                    {hl.year ? ` · ${hl.year}` : ''}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[#E7E2DC] bg-white px-4 py-10 text-center text-sm text-[#A29B93]">
                    아직 {group.label.toLowerCase()}이 없어요
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pt-2 pb-6">
          <SectionTitle title="Connect" />
            {!isOwnerMode && (
              <div className="flex gap-2 mb-4">
                <Button variant="outline" onClick={() => showToast('피드백 요청을 보냈어요!')}>피드백 요청</Button>
                <Button
                  onClick={() => {
                    if (alreadySubmitted) { showToast('이미 경험을 남겼어요'); return }
                    setExpSheetOpen(true)
                  }}
                  variant={alreadySubmitted ? 'outline' : 'primary'}
                >
                  {alreadySubmitted ? '경험 남겼어요 ✓' : '+ 경험 남기기'}
                </Button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {contactChannels.map((channel) => (
                <ContactActionButton
                  key={channel.id}
                  channel={channel}
                  onClick={() => {
                    if (!channel.enabled) {
                      showToast(isOwnerMode ? 'Byro 편집에서 연동을 활성화해 주세요' : '비활성화된 연락 수단이에요')
                      return
                    }
                    if (!channel.href) {
                      showToast('연결 정보를 준비 중이에요')
                      return
                    }
                    window.open(channel.href, channel.href.startsWith('http') ? '_blank' : '_self')
                  }}
                />
              ))}
            </div>
        </div>

        <div className="h-24" />
      </div>

      {/* ─── 경험 남기기 바텀시트 ────────────────── */}
      <BottomSheet open={expSheetOpen} onClose={() => setExpSheetOpen(false)} dark={!store.isLoggedIn}>
        {store.isLoggedIn ? (
          <div className="px-5 pb-6">
            <div className="text-sm font-black mb-1">{profile.name}에게 경험 남기기</div>
            <div className="text-xs text-[#888] mb-4">{store.user?.name ?? '나'}으로 남겨져요</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {experienceOptions.map((kw) => (
                <Chip
                  key={kw} label={kw}
                  selected={store.experienceKeywords.includes(kw)}
                  onClick={() => {
                    if (!store.experienceKeywords.includes(kw) && store.experienceKeywords.length >= 3) {
                      showToast('키워드는 최대 3개까지 선택할 수 있어요'); return
                    }
                    store.setExperienceKeyword(kw)
                  }}
                />
              ))}
            </div>
            <div className="text-xs text-[#888] mb-1">한마디 (선택)</div>
            <TextArea value={store.experienceMessage} onChange={store.setExperienceMessage}
              placeholder="이 분과의 경험을 한마디로 남겨보세요" maxLength={100} rows={3} />
            <div className="mt-4 text-xs text-[#888] mb-3">{store.user?.name ?? '나'}으로 남기기</div>
            <Button onClick={handleExpSubmit}>경험 남기기</Button>
          </div>
        ) : (
          <div className="px-5 pb-6">
            <div className="text-sm font-black text-white mb-1">{profile.name}에게 경험 남기기</div>
            <div className="text-xs text-[#aaa] mb-4">익명 사용자로 남겨져요</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {experienceOptions.map((kw) => (
                <Chip key={kw} label={kw} dark
                  selected={store.experienceKeywords.includes(kw)}
                  onClick={() => {
                    if (!store.experienceKeywords.includes(kw) && store.experienceKeywords.length >= 3) {
                      showToast('키워드는 최대 3개까지 선택할 수 있어요'); return
                    }
                    store.setExperienceKeyword(kw)
                  }}
                />
              ))}
            </div>
            <TextArea value={store.experienceMessage} onChange={store.setExperienceMessage}
              placeholder="이 분과의 경험을 한마디로 남겨보세요" maxLength={100} rows={3} dark />
            <div className="mt-4">
              <button onClick={handleExpSubmit} className="w-full bg-white text-[#0A0A0A] font-bold py-3 rounded-xl text-sm mb-3">
                경험 남기기
              </button>
              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-[#333]" />
                <span className="text-xs text-[#666]">이름으로 남기고 싶다면</span>
                <div className="flex-1 h-px bg-[#333]" />
              </div>
              <button onClick={() => { setExpSheetOpen(false); router.push('/onboarding') }}
                className="w-full border border-[#555] text-white font-bold py-3 rounded-xl text-sm">
                로그인하기
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* ─── 프로필 저장 메모 바텀시트 ──────────── */}
      <BottomSheet open={memoSheetOpen} onClose={() => setMemoSheetOpen(false)}>
        <div className="px-5 pb-6">
          <div className="text-sm font-black mb-1">프로필 저장</div>
          <div className="text-xs text-[#888] mb-4">{profile.name} · {profile.title}</div>
          <div className="text-xs text-[#555] mb-1">메모 (선택)</div>
          <TextArea
            value={memoText}
            onChange={setMemoText}
            placeholder="어디서 만났는지, 어떤 분인지 메모해두세요"
            maxLength={80}
            rows={3}
          />
          <div className="mt-4 space-y-2">
            <Button onClick={() => {
              setBookmarked(true)
              setMemoSheetOpen(false)
              showToast('프로필을 저장했어요!')
            }}>저장하기</Button>
            <Button variant="ghost" onClick={() => setMemoSheetOpen(false)}>취소</Button>
          </div>
        </div>
      </BottomSheet>

      {/* ─── 경험 완료 모달 ─────────────────────── */}
      <Modal open={expDoneModal} onClose={() => setExpDoneModal(false)}>
        <div className="text-center">
          <div className="text-3xl mb-3">🤝</div>
          <div className="text-sm font-black mb-3">경험을 남겼어요!</div>
          <div className="meta-text mb-4">{profile.name} 님의 평판이 쌓였어요!</div>
          {store.isLoggedIn ? (
            <>
              <Button variant="outline" onClick={() => setExpDoneModal(false)}>프로필로 돌아가기</Button>
            </>
          ) : (
            <>
              <div className="border border-[#EBEBEB] rounded-xl p-3 my-3 text-left">
                <div className="text-xs font-bold mb-2">나도 평판을 받고 싶다면?</div>
                <div className="space-y-2">
                  <Button onClick={() => { setExpDoneModal(false); router.push('/onboarding') }}>내 Byro 만들기</Button>
                  <Button variant="outline" onClick={() => { setExpDoneModal(false); router.push('/onboarding') }}>로그인하기</Button>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setExpDoneModal(false)}>프로필로 돌아가기</Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-4">
      <div className="text-[17px] font-bold tracking-[-0.02em] text-[var(--color-text-strong)]">{title}</div>
      {subtitle && <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">{subtitle}</div>}
    </div>
  )
}

function ContactActionButton({
  channel,
  onClick,
}: {
  channel: { id: string; label: string; value: string; href?: string; enabled: boolean }
  onClick: () => void
}) {
  const iconMap = {
    phone: Phone,
    email: Mail,
    kakao: MessageCircle,
  }
  const Icon = iconMap[channel.id as keyof typeof iconMap] ?? MessageCircle

  return (
    <button
      onClick={onClick}
      className={[
        'text-center transition-colors',
        channel.enabled ? 'text-[#222]' : 'text-[#B4B4B4]',
      ].join(' ')}
    >
      <div className={[
        'mx-auto mb-1.5 flex h-11 w-11 items-center justify-center rounded-full border',
        channel.enabled
          ? 'border-[#E7E7E7] bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)]'
          : 'border-[#EFEFEF] bg-white/70',
      ].join(' ')}>
        <Icon size={16} />
      </div>
      <div className="text-[11px] font-semibold">{channel.label}</div>
    </button>
  )
}
