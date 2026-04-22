'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Bookmark, Mail, MessageCircle, Phone, Send, Share2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import {
  Button, Chip, BottomSheet, Modal, TextArea, InfoBox, showToast,
} from '@/components/ui'
import {
  SAMPLE_PROFILE, JIMIN_PROFILE, INSTAGRAM_PROFILE, EXPERIENCE_KEYWORDS,
} from '@/lib/mockData'

interface PublicProfileProps {
  username: string
  mode?: 'public' | 'owner'
  onOpenArchive?: () => void
  onOpenManage?: () => void
}

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
    : { companyCount: 1, years: 4, summary: '창업 4년차 · 정상 운영 중 · 폐업 이력 없음' }
  const airlineHighlight = 'airlineHighlight' in rawProfile
    ? rawProfile.airlineHighlight
    : { tierSummary: '대한항공 모닝캄', badgeLevel: 'business_traveler', airlines: [{ name: '대한항공', tier: '모닝캄' }] }
  const airlineBadgeLabel = {
    global_business: '🌍 글로벌 비즈니스',
    active_business: '✈️ 액티브 비즈니스',
    business_traveler: '🗺️ 비즈니스 이동형',
  }[airlineHighlight.badgeLevel] ?? null

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

  // SNS 토글
  const igOpen = store.snsOpenStates['instagram_' + username] ?? false
  const liOpen = store.snsOpenStates['linkedin_' + username] ?? false

  // 하이라이트 토글
  const careerOpen = store.hlOpenStates['career_' + username] ?? false
  const rememberOpen = store.hlOpenStates['remember_' + username] ?? false
  const corporateOpen = store.hlOpenStates['corporate_' + username] ?? false
  const airlineOpen = store.hlOpenStates['airline_' + username] ?? false

  useEffect(() => {
    setBioExpanded(false)
  }, [profile.bio, username])

  useEffect(() => {
    const checkOverflow = () => {
      const element = bioRef.current
      if (!element) return
      setBioOverflowing(element.scrollHeight - element.clientHeight > 2)
    }

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

  return (
    <div className="flex flex-col h-full">
      {/* 상단 네비 */}
      <div className="flex items-center px-4 h-12 border-b border-[#EBEBEB] bg-white/92 backdrop-blur-sm flex-shrink-0">
        <button onClick={() => router.back()} className="text-sm text-[#555] mr-2">‹</button>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-[#AAA] uppercase tracking-[0.18em]">{isOwnerMode ? 'My Byro' : 'Public Profile'}</div>
          <div className="text-xs text-[#555] truncate">byro.io/@{profile.linkId}</div>
        </div>
        {!isOwnerMode && (
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
                'w-8 h-8 flex items-center justify-center rounded-xl border',
                bookmarked ? 'bg-[#0A0A0A] border-[#0A0A0A]' : 'bg-white border-[#ddd]',
              ].join(' ')}
            >
              <Bookmark size={14} color={bookmarked ? '#fff' : '#555'} />
            </button>
            <button
              onClick={() => showToast('공유 링크를 준비 중이에요')}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#ddd] bg-white"
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
          <div className="rounded-[34px] bg-[#F7F4F1] p-[7px] shadow-[0_16px_36px_rgba(0,0,0,0.08)]">
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

            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#999] mb-2">신뢰 키워드</div>
              <div className="flex flex-wrap gap-1.5">
                {keywordCounts.map((item) => (
                  <span key={item.keyword} className="rounded-full border border-[#E4E4E4] bg-[#F6F6F6] px-2.5 py-1 text-[11px] text-[#555]">
                    {item.keyword} <span className="text-[#8A8A8A]">{item.count}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-[#EBEBEB] bg-white px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-black text-[#111]">방명록</div>
                <div className="text-[11px] text-[#AAA]">최근 {profile.guestbook.length}개</div>
              </div>
              <div className="space-y-2.5">
                {featuredGuestbook.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => router.push('/jiminlee')}
                    className="flex w-full gap-2.5 rounded-[18px] border border-[#F0F0F0] bg-[#FCFCFC] px-3 py-3 text-left"
                  >
                    {entry.authorName === '이지민' ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/jimin-profile-5x4.jpg" alt={`${entry.authorName} 프로필 사진`} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-xs font-bold text-[#555] flex-shrink-0">
                        {entry.authorName.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-[#222]">{entry.authorName}</div>
                        <div className="text-[10px] text-[#BBB]">{entry.date}</div>
                      </div>
                      <div className="text-xs text-[#666] mt-1 line-clamp-2">{entry.message}</div>
                    </div>
                  </button>
                ))}
              </div>
              {profile.guestbook.length > 3 && (
                <button
                  onClick={() => router.push(`/${profile.linkId}/guestbook`)}
                  className="mt-3 w-full rounded-[16px] border border-[#E5E5E5] px-3 py-2.5 text-xs font-semibold text-[#555]"
                >
                  전체 방명록 보기
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── SNS 섹션 ─────────────────────────────── */}
        <div className="px-5 py-4">
          <SectionTitle
            title="SNS"
            subtitle={`${Number(profile.instagramConnected) + Number(profile.linkedinConnected)}개 연동됨`}
          />

          {profile.instagramConnected && (
            <div className="mb-2 rounded-[22px] border border-[#EBEBEB] overflow-hidden">
              <button
                onClick={() => store.toggleSnsOpen('instagram_' + username)}
                className="flex items-center w-full px-4 py-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/Instagram.svg" alt="Instagram" className="w-5 h-5 mr-2 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold">Instagram
                    <span className="ml-1.5 text-[10px] font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-full px-2 py-0.5">연동됨</span>
                  </div>
                  <div className="text-xs text-[#0D47A1]">instagram.com/{profile.instagram.username}</div>
                </div>
                {igOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
              </button>
              {igOpen && (
                <div className="px-4 pb-4">
                  <div className="rounded-2xl bg-[#FAFAFA] border border-[#F0F0F0] px-3 py-3 mb-3">
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
            <div className="mb-2 rounded-[22px] border border-[#EBEBEB] overflow-hidden">
              <button
                onClick={() => store.toggleSnsOpen('linkedin_' + username)}
                className="flex items-center w-full px-4 py-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/linkedin.png" alt="LinkedIn" className="w-5 h-5 mr-2 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold">LinkedIn
                    <span className="ml-1.5 text-[10px] font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-full px-2 py-0.5">연동됨</span>
                  </div>
                  <div className="text-xs text-[#0D47A1]">career summary available</div>
                </div>
                {liOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
              </button>
              {liOpen && (
                <div className="px-4 pb-4">
                  <div className="rounded-2xl bg-[#FAFAFA] border border-[#F0F0F0] px-3 py-3 mb-3">
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
          <SectionTitle title="하이라이트" subtitle={`인증 4개 · 직접 입력 ${profile.manualHighlights.length}개`} />

          {/* 커리어 지속성 */}
          <div className="mb-2 rounded-[22px] border border-[#EBEBEB] overflow-hidden">
            <button
              onClick={() => store.toggleHlOpen('career_' + username)}
              className="flex items-center w-full px-4 py-3"
            >
              <span className="text-base mr-2">💼</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold">커리어 지속성
                  <span className="ml-1.5 text-[10px] font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-full px-2 py-0.5">인증됨</span>
                </div>
                <div className="text-xs text-[#888]">평균 대비 128% 장기 재직</div>
              </div>
              {careerOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
            </button>
            {careerOpen && (
              <div className="bg-[#FAFAFA] border-t border-[#F1F1F1] p-4">
                <div className="text-xs text-[#888] mb-2">평균 재직 기간</div>
                <div className="h-1.5 bg-[#e0e0e0] rounded-full mb-1.5">
                  <div className="h-full bg-[#0A0A0A] rounded-full" style={{ width: '72%' }} />
                </div>
                <div className="text-right text-xs text-[#555] font-bold mb-3">평균 대비 128% 장기 재직</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-[#eee] rounded-xl p-3 text-center">
                    <div className="text-xl font-black">{profile.careerHighlight.avgYears}년</div>
                    <div className="text-xs text-[#888] mt-0.5">본인 평균</div>
                  </div>
                  <div className="bg-[#f5fff5] border border-[#c8e6c9] rounded-xl p-3 text-center">
                    <div className="text-xl font-black text-[#1A7A1A]">+{profile.careerHighlight.vsIndustryPercent}%</div>
                    <div className="text-xs text-[#888] mt-0.5">업계 평균 대비</div>
                  </div>
                </div>
                <div className="text-xs text-[#bbb] text-right mt-2">건강보험공단 기준 · 2026.04 인증</div>
              </div>
            )}
          </div>

          {/* 리멤버 네트워크 */}
          <div className="mb-2 rounded-[22px] border border-[#EBEBEB] overflow-hidden">
            <button
              onClick={() => store.toggleHlOpen('remember_' + username)}
              className="flex items-center w-full px-4 py-3"
            >
              <span className="text-base mr-2">🤝</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold">리멤버 직업 네트워크
                  <span className="ml-1.5 text-[10px] font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-full px-2 py-0.5">인증됨</span>
                </div>
                <div className="text-xs text-[#888]">스타트업·마케팅 중심 인맥</div>
              </div>
              {rememberOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
            </button>
            {rememberOpen && (
              <div className="bg-[#FAFAFA] border-t border-[#F1F1F1] p-4">
                {/* 버블 다이어그램 */}
                <svg viewBox="0 0 200 150" className="w-full h-auto mb-2">
                  <circle cx="100" cy="75" r="20" fill="#333" stroke="#fff" strokeWidth="2"/>
                  <text x="100" y="79" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">나</text>
                  {profile.rememberHighlight.industries.map((ind, i) => {
                    const positions = [
                      { cx: 100, cy: 22, r: 18 },
                      { cx: 168, cy: 75, r: 15 },
                      { cx: 100, cy: 128, r: 13 },
                      { cx: 32, cy: 75, r: 14 },
                    ]
                    const pos = positions[i] ?? { cx: 100, cy: 22, r: 14 }
                    return (
                      <g key={ind.name}>
                        <line x1="100" y1="75" x2={pos.cx} y2={pos.cy} stroke="#ccc" strokeWidth="1"/>
                        <circle cx={pos.cx} cy={pos.cy} r={pos.r} fill={['#111','#444','#666','#999'][i] ?? '#888'} stroke="#fff" strokeWidth="2"/>
                        <text x={pos.cx} y={pos.cy - 3} textAnchor="middle" fontSize="6" fill="#fff">{ind.name}</text>
                        <text x={pos.cx} y={pos.cy + 6} textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700">{ind.ratio}%</text>
                      </g>
                    )
                  })}
                </svg>
                <div className="text-xs text-[#bbb] text-right">리멤버 명함 기준 · 총 {profile.rememberHighlight.total}명</div>
              </div>
            )}
          </div>

          {/* 법인 영속성 */}
          <div className="mb-2 rounded-[22px] border border-[#EBEBEB] overflow-hidden">
            <button
              onClick={() => store.toggleHlOpen('corporate_' + username)}
              className="flex items-center w-full px-4 py-3"
            >
              <span className="text-base mr-2">🏢</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold">법인 영속성
                  <span className="ml-1.5 text-[10px] font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-full px-2 py-0.5">인증됨</span>
                </div>
                <div className="text-xs text-[#888]">{corporateHighlight.summary}</div>
              </div>
              {corporateOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
            </button>
            {corporateOpen && (
              <div className="bg-[#FAFAFA] border-t border-[#F1F1F1] p-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white border border-[#eee] rounded-xl p-3 text-center">
                    <div className="text-xl font-black">{corporateHighlight.companyCount}개</div>
                    <div className="text-xs text-[#888] mt-0.5">운영 법인</div>
                  </div>
                  <div className="bg-white border border-[#eee] rounded-xl p-3 text-center">
                    <div className="text-xl font-black">{'averageOperatingYears' in corporateHighlight ? corporateHighlight.averageOperatingYears : corporateHighlight.years}년</div>
                    <div className="text-xs text-[#888] mt-0.5">운영 기간</div>
                  </div>
                  <div className="bg-[#f5fff5] border border-[#c8e6c9] rounded-xl p-3 text-center">
                    <div className="text-sm font-black text-[#1A7A1A]">정상 운영</div>
                    <div className="text-xs text-[#888] mt-0.5">폐업 이력 없음</div>
                  </div>
                </div>
                <div className="text-xs text-[#bbb] text-right mt-2">법인 등기 기준 · 2026.04 인증</div>
              </div>
            )}
          </div>

          {/* 항공 마일리지 */}
          <div className="mb-2 rounded-[22px] border border-[#EBEBEB] overflow-hidden">
            <button
              onClick={() => store.toggleHlOpen('airline_' + username)}
              className="flex items-center w-full px-4 py-3"
            >
              <span className="text-base mr-2">✈️</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold">항공 마일리지
                  <span className="ml-1.5 text-[10px] font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-full px-2 py-0.5">인증됨</span>
                </div>
                <div className="text-xs text-[#888]">{airlineHighlight.tierSummary}</div>
              </div>
              {airlineOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
            </button>
            {airlineOpen && (
              <div className="bg-[#FAFAFA] border-t border-[#F1F1F1] p-4">
                {airlineBadgeLabel && (
                  <div className="inline-flex items-center rounded-full border border-[#E5E5E5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#333] mb-3">
                    {airlineBadgeLabel}
                  </div>
                )}
                <div className="space-y-2">
                  {airlineHighlight.airlines.map((airline) => (
                    <div key={airline.name} className="flex items-center justify-between rounded-xl border border-[#eee] bg-white px-3 py-2.5">
                      <div className="text-xs text-[#888]">{airline.name}</div>
                      <div className="text-sm font-bold">{airline.tier}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-[#bbb] text-right mt-2">항공사 회원등급 기준 · 2026.04 인증</div>
              </div>
            )}
          </div>

          {/* 직접 입력 하이라이트 */}
          {profile.manualHighlights.map((hl) => {
            const isOpen = store.hlOpenStates[hl.id + '_' + username] ?? false
            return (
              <div key={hl.id} className="mb-2 rounded-[22px] border border-[#EBEBEB] overflow-hidden">
                <button
                  onClick={() => store.toggleHlOpen(hl.id + '_' + username)}
                  className="flex items-center w-full px-4 py-3"
                >
                  <span className="mr-2">{hl.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold">{hl.title}</div>
                    <div className="text-xs text-[#888]">{hl.subtitle}</div>
                  </div>
                  {hl.year && <span className="text-xs text-[#888] mr-2">{hl.year}</span>}
                  {isOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                </button>
                {isOpen && hl.description && (
                  <div className="bg-[#FAFAFA] border-t border-[#F1F1F1] px-4 py-3 text-xs text-[#333] leading-relaxed">
                    <div className="font-bold mb-1">{hl.icon} {hl.title}</div>
                    <div>{hl.description}</div>
                    <div className="text-[#888] mt-1">{hl.year}년 · {hl.subtitle.split('·')[0].trim()} · 직접 입력 (미인증)</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="px-5 pt-2 pb-6">
          <div className="rounded-[26px] border border-[#EBEBEB] bg-[#FAFAFA] px-4 py-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#999] mb-3">Connect</div>
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
            <div className="grid grid-cols-4 gap-3">
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
              {EXPERIENCE_KEYWORDS.map((kw) => (
                <Chip
                  key={kw} label={kw}
                  selected={store.experienceKeywords.includes(kw)}
                  onClick={() => {
                    if (!store.experienceKeywords.includes(kw) && store.experienceKeywords.length >= 5) {
                      showToast('키워드는 최대 5개까지 선택할 수 있어요'); return
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
              {EXPERIENCE_KEYWORDS.map((kw) => (
                <Chip key={kw} label={kw} dark
                  selected={store.experienceKeywords.includes(kw)}
                  onClick={() => {
                    if (!store.experienceKeywords.includes(kw) && store.experienceKeywords.length >= 5) {
                      showToast('키워드는 최대 5개까지 선택할 수 있어요'); return
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
          {store.isLoggedIn ? (
            <>
              <InfoBox variant="info">이지민 님에게 경험 요청을 보내보세요.</InfoBox>
              <div className="mt-4 space-y-2">
                <Button onClick={() => { showToast('이지민 님에게 경험 요청을 보냈어요!'); setExpDoneModal(false) }}>
                  이지민 님에게 경험 요청하기
                </Button>
                <Button variant="outline" onClick={() => setExpDoneModal(false)}>프로필로 돌아가기</Button>
              </div>
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

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3">
      <div className="text-xs font-bold text-[#888] uppercase tracking-wider">{title}</div>
      <div className="text-xs text-[#AAA] mt-1">{subtitle}</div>
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
    telegram: Send,
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
