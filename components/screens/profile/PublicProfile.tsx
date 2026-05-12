'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Copy, Share2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { showToast } from '@/components/ui'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'
import { REPUTATION_KEYWORD_GROUPS } from '@/lib/mocks/reputationKeywords'
import type { Highlight } from '@/types'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import {
  ProfileConnectSection,
  ProfileHeroSection,
  ProfileSnsSection,
} from '@/components/screens/profile/PublicProfileSections'
import { ProfileHighlightsSection } from '@/components/screens/profile/PublicProfileHighlightsSection'
import {
  ExperienceBottomSheet,
  ExperienceDoneModal,
  SaveProfileMemoSheet,
} from '@/components/screens/profile/PublicProfileOverlays'

interface PublicProfileProps {
  username: string
  mode?: 'public' | 'owner'
}

const AIRLINE_BADGE_LABELS = {
  global_business: '글로벌 비즈니스',
  active_business: '액티브 비즈니스',
  business_traveler: '비즈니스 이동형',
} as const

export default function PublicProfile({
  username,
  mode = 'public',
}: PublicProfileProps) {
  const router = useRouter()
  const store = useByroStore()
  const isOwnerMode = mode === 'owner'
  const profile = getNormalizedPublicProfile({
    username,
    user: store.user,
  })
  const {
    heroTheme,
    contactChannels,
    corporateHighlight,
    airlineHighlight,
  } = profile
  const airlineBadgeLabel = AIRLINE_BADGE_LABELS[airlineHighlight.badgeLevel as keyof typeof AIRLINE_BADGE_LABELS] ?? null
  const topRememberIndustry = [...profile.rememberHighlight.industries].sort((a, b) => b.ratio - a.ratio)[0]
  const showCareerHighlight = username !== 'mk'
  const showAirlineHighlight = !['jiminlee', 'mk'].includes(username)

  const [expSheetOpen, setExpSheetOpen] = useState(false)
  const [expDoneModal, setExpDoneModal] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [memoSheetOpen, setMemoSheetOpen] = useState(false)
  const [memoText, setMemoText] = useState('')
  const [bioExpanded, setBioExpanded] = useState(false)
  const [bioOverflowing, setBioOverflowing] = useState(false)
  const bioRef = useRef<HTMLParagraphElement | null>(null)
  const verifiedHighlights: Highlight[] = [
    ...(showCareerHighlight ? [{
      id: `verified-career-${username}`,
      categoryId: 'career-continuity' as const,
      icon: 'briefcase' as const,
      title: '커리어 지속성',
      subtitle: `평균 ${profile.careerHighlight.avgYears}년 재직`,
      description: '업계 평균 대비 더 길게 축적된 재직 이력을 보여줍니다.',
      year: '',
    }] : []),
    {
      id: `verified-corporate-${username}`,
      categoryId: 'corporate-longevity',
      icon: 'building2',
      title: '법인 영속성',
      subtitle: `${'averageOperatingYears' in corporateHighlight ? corporateHighlight.averageOperatingYears : corporateHighlight.years}년째 정상 운영 중`,
      description: '법인 운영 기간과 정상 운영 여부를 확인한 항목입니다.',
      year: '',
    },
    {
      id: `verified-remember-${username}`,
      categoryId: 'remember-network',
      icon: 'users',
      title: '리멤버 네트워크',
      subtitle: topRememberIndustry ? `${topRememberIndustry.name} 네트워크 다수, ${topRememberIndustry.ratio}%` : '리멤버 명함 기반 직업 네트워크',
      description: '명함 기반 직업 네트워크 구성이 인증되어 공개됩니다.',
      year: '',
    },
    ...(showAirlineHighlight ? [{
      id: `verified-airline-${username}`,
      categoryId: 'airline-mileage' as const,
      icon: 'plane' as const,
      title: '항공 마일리지',
      subtitle: airlineHighlight.tierSummary,
      description: '항공사 회원 등급으로 이동성과 출장 경험을 보여줍니다.',
      year: '',
    }] : []),
  ]
  const groupedHighlights = HIGHLIGHT_GROUPS.map((group) => {
    const verifiedItems = verifiedHighlights
      .filter((item) => HIGHLIGHT_CATEGORIES.find((category) => category.id === item.categoryId)?.group === group.id)
      .map((item) => ({ kind: 'verified' as const, item }))

    const manualItems = profile.manualHighlights.filter(
      (item) => HIGHLIGHT_CATEGORIES.find((category) => category.id === item.categoryId)?.group === group.id,
    )

    const manualGroups = Array.from(new Map(
      manualItems.map((item) => [item.categoryId, manualItems.filter((manual) => manual.categoryId === item.categoryId)]),
    ).entries()).map(([categoryId, items]) => ({
      kind: 'manual-group' as const,
      categoryId,
      items,
    }))

    return {
      ...group,
      items: [...verifiedItems, ...manualGroups],
    }
  }).filter((group) => group.items.length > 0)

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

  const handleLogout = () => {
    store.logout()
    window.location.replace('/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 상단 네비 */}
      <div className="flex items-center px-4 h-12 border-b border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.78)] backdrop-blur-md flex-shrink-0">
        <button onClick={() => router.back()} className="text-sm text-[var(--color-text-secondary)] mr-2">‹</button>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-[0.18em]">{isOwnerMode ? 'My Byro' : 'Public Profile'}</div>
          <div className="text-xs text-[var(--color-text-secondary)] truncate">byro.io/@{profile.linkId}</div>
        </div>
        {!isOwnerMode ? (
          <div className="flex items-center gap-3">
            {store.isLoggedIn && (
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
                  bookmarked ? 'bg-[var(--color-accent-dark)] border-[var(--color-accent-dark)]' : '',
                ].join(' ')}
              >
                <Bookmark size={14} color={bookmarked ? '#111111' : '#B5AEA3'} />
              </button>
            )}
            <button
              onClick={() => showToast('공유 링크를 준비 중이에요')}
              className="icon-button"
            >
              <Share2 size={14} color="#B5AEA3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-[var(--color-text-secondary)]"
              aria-label="로그아웃"
            >
              로그아웃
            </button>
            <button
              onClick={handleCopyProfileLink}
              className="icon-button"
              aria-label="프로필 링크 복사"
            >
              <Copy size={14} color="#B5AEA3" />
            </button>
            <button
              onClick={handleShareProfile}
              className="icon-button"
              aria-label="프로필 공유"
            >
              <Share2 size={14} color="#B5AEA3" />
            </button>
          </div>
        )}
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 프로필 헤더 */}
        <ProfileHeroSection
          profile={profile}
          heroTheme={heroTheme}
          bioExpanded={bioExpanded}
          bioOverflowing={bioOverflowing}
          bioRef={bioRef}
          onToggleBio={() => setBioExpanded((prev) => !prev)}
        />

        {/* ─── SNS 섹션 ─────────────────────────────── */}
        <ProfileSnsSection
          instagramConnected={profile.instagramConnected}
          linkedinConnected={profile.linkedinConnected}
          instagram={profile.instagram}
          linkedin={profile.linkedin}
          igOpen={igOpen}
          liOpen={liOpen}
          onToggleInstagram={() => store.toggleSnsOpen(`instagram_${username}`)}
          onToggleLinkedIn={() => store.toggleSnsOpen(`linkedin_${username}`)}
        />

        <ProfileHighlightsSection
          profile={profile}
          corporateHighlight={corporateHighlight}
          airlineHighlight={airlineHighlight}
          airlineBadgeLabel={airlineBadgeLabel}
          groupedHighlights={groupedHighlights}
          username={username}
          primaryHighlightOverrides={store.primaryHighlightOverrides}
          getHighlightOpen={(key) => store.hlOpenStates[key] ?? false}
          onToggleHighlight={(key) => store.toggleHlOpen(key)}
        />

        <ProfileConnectSection
          isOwnerMode={isOwnerMode}
          alreadySubmitted={alreadySubmitted}
          contactChannels={contactChannels}
          onRequestFeedback={() => showToast('피드백 요청을 보냈어요!')}
          onLeaveExperience={() => {
            if (alreadySubmitted) {
              showToast('이미 경험을 남겼어요')
              return
            }
            setExpSheetOpen(true)
          }}
          onChannelClick={(channel) => {
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

        <div className="h-24" />
      </div>

      <ExperienceBottomSheet
        open={expSheetOpen}
        profileName={profile.name}
        currentUserName={store.user?.name}
        isLoggedIn={store.isLoggedIn}
        experienceKeywordGroups={REPUTATION_KEYWORD_GROUPS}
        selectedKeywords={store.experienceKeywords}
        experienceMessage={store.experienceMessage}
        onToggleKeyword={(keyword) => {
          if (!store.experienceKeywords.includes(keyword) && store.experienceKeywords.length >= 3) {
            showToast('키워드는 최대 3개까지 선택할 수 있어요')
            return
          }
          store.setExperienceKeyword(keyword)
        }}
        onMessageChange={store.setExperienceMessage}
        onSubmit={handleExpSubmit}
        onLogin={() => {
          setExpSheetOpen(false)
          store.login()
        }}
        onClose={() => setExpSheetOpen(false)}
      />

      <SaveProfileMemoSheet
        open={memoSheetOpen}
        profileName={profile.name}
        memoText={memoText}
        onMemoChange={setMemoText}
        onSave={() => {
          setBookmarked(true)
          setMemoSheetOpen(false)
          showToast('프로필을 저장했어요!')
        }}
        onClose={() => setMemoSheetOpen(false)}
      />

      <ExperienceDoneModal
        open={expDoneModal}
        profileName={profile.name}
        isLoggedIn={store.isLoggedIn}
        onRequestExperience={() => {
          setExpDoneModal(false)
          showToast(`${profile.name} 님에게 경험 요청을 보냈어요!`)
        }}
        onCreateByro={() => {
          setExpDoneModal(false)
          router.push('/onboarding')
        }}
        onLogin={() => {
          setExpDoneModal(false)
          store.login()
        }}
        onClose={() => setExpDoneModal(false)}
      />
    </div>
  )
}
