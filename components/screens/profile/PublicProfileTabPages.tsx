'use client'

import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'


import type { Highlight } from '@/types'
import { getNormalizedPublicProfile, computeTabAccess, type TabAccessLevel } from '@/components/screens/profile/publicProfileData'
import {
  ProfileFeedbackSection,
  ProfileRememberSection,
  ProfileReputationSummarySection,
} from '@/components/screens/profile/PublicProfileSections'
import { getPublicProfileByUsername } from '@/lib/mocks/publicProfiles'
import { ProfileSnsSection } from '@/components/screens/profile/PublicProfileSnsSection'
import { ProfileHighlightsSection } from '@/components/screens/profile/PublicProfileHighlightsSection'
import { PublicProfileLifeSection } from '@/components/screens/profile/PublicProfileLifeSection'
import { PublicProfileWhoIAmSection } from '@/components/screens/profile/PublicProfileWhoIAmSection'

const AIRLINE_BADGE_LABELS = {
  global_business: '글로벌 비즈니스',
  active_business: '액티브 비즈니스',
  business_traveler: '비즈니스 이동형',
} as const

function usePublicProfileTabData(username: string) {
  const store = useByroStore()
  const isOwnerMode = store.isLoggedIn && store.user?.linkId === username
  const isConnected = store.connectedProfiles.some((p) => p.linkId === username)
  const profile = getNormalizedPublicProfile({
    username,
    user: store.user,
    ownerHighlights: store.highlights,
    ownerTabVisibility: store.tabVisibility,
  })
  const tabAccessCtx = { isOwner: isOwnerMode, isLoggedIn: store.isLoggedIn, isConnected }
  const tabAccess = {
    who: computeTabAccess(profile.tabVisibility, 'who', tabAccessCtx),
    life: computeTabAccess(profile.tabVisibility, 'life', tabAccessCtx),
    reputation: computeTabAccess(profile.tabVisibility, 'reputation', tabAccessCtx),
  }
  const corporateHighlight = profile.corporateHighlight
  const airlineHighlight = profile.airlineHighlight
  const airlineBadgeLabel = AIRLINE_BADGE_LABELS[airlineHighlight.badgeLevel as keyof typeof AIRLINE_BADGE_LABELS] ?? null
  const showCareerHighlight = username !== 'mk'
  const showAirlineHighlight = !['jiminlee', 'mk', 'gangminjun'].includes(username)

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

  const keywordCounts = [...profile.reputationKeywords]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => ({
      keyword: item.keyword,
      count: item.count,
    }))
  const totalKeywordCount = keywordCounts.reduce((sum, item) => sum + item.count, 0)
  const featuredGuestbook = profile.guestbook.slice(0, 3)

  return {
    store,
    profile,
    groupedHighlights,
    corporateHighlight,
    airlineHighlight,
    airlineBadgeLabel,
    keywordCounts,
    totalKeywordCount,
    featuredGuestbook,
    tabAccess,
  }
}

function LockedTabContent({
  access,
  onLogin,
}: {
  access: TabAccessLevel
  onLogin: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-bg-soft)] flex items-center justify-center mb-4">
        <Lock size={22} className="text-[var(--color-text-tertiary)]" />
      </div>
      {access === 'login-required' ? (
        <>
          <p className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1.5">로그인이 필요해요</p>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
            이 섹션은 로그인한 사용자만 볼 수 있어요.
          </p>
          <button
            onClick={onLogin}
            className="rounded-full px-6 py-2.5 text-[13px] font-semibold text-white"
            style={{ backgroundColor: 'var(--color-accent-dark)' }}
          >
            로그인하기
          </button>
        </>
      ) : (
        <>
          <p className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1.5">연결된 사람만 볼 수 있어요</p>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
            연결 요청을 수락하면 이 섹션을 확인할 수 있어요.
          </p>
        </>
      )}
    </div>
  )
}

export function PublicProfileWhoTabPage({
  username,
}: {
  username: string
}) {
  const router = useRouter()
  const { store, profile, groupedHighlights, corporateHighlight, airlineHighlight, airlineBadgeLabel, tabAccess } = usePublicProfileTabData(username)

  if (tabAccess.who !== 'visible') {
    return <LockedTabContent access={tabAccess.who} onLogin={() => router.push('/signup')} />
  }

  return (
    <>
      <PublicProfileWhoIAmSection
        whoIAm={profile.whoIAm}
        bio={profile.bio}
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
      <ProfileSnsSection
        instagramConnected={profile.instagramConnected}
        linkedinConnected={profile.linkedinConnected}
        youtubeConnected={profile.youtubeConnected}
        tiktokConnected={profile.tiktokConnected}
        instagram={profile.instagram}
        linkedin={profile.linkedin}
        youtube={profile.youtube}
        tiktok={profile.tiktok}
      />
    </>
  )
}

export function PublicProfileLifeTabPage({
  username,
}: {
  username: string
}) {
  const router = useRouter()
  const { profile, tabAccess } = usePublicProfileTabData(username)

  if (tabAccess.life !== 'visible') {
    return <LockedTabContent access={tabAccess.life} onLogin={() => router.push('/signup')} />
  }

  return <PublicProfileLifeSection life={profile.life} />
}

export function PublicProfileReputationTabPage({
  username,
}: {
  username: string
}) {
  const router = useRouter()
  const { profile, keywordCounts, totalKeywordCount, featuredGuestbook, tabAccess } = usePublicProfileTabData(username)

  if (tabAccess.reputation !== 'visible') {
    return <LockedTabContent access={tabAccess.reputation} onLogin={() => router.push('/signup')} />
  }

  const getProfileAvatar = (linkId: string) => {
    const p = getPublicProfileByUsername(linkId)
    return p?.profileImages?.[0] ?? p?.avatarImage ?? ''
  }

  return (
    <div className="pb-6">
      <ProfileRememberSection
        total={profile.rememberHighlight.total}
        industries={profile.rememberHighlight.industries}
        insight={profile.rememberHighlight.insight}
      />
      <ProfileReputationSummarySection
        keywordCounts={keywordCounts}
        totalKeywordCount={totalKeywordCount}
      />
      <ProfileFeedbackSection
        profile={profile}
        featuredGuestbook={featuredGuestbook}
        getProfileAvatar={getProfileAvatar}
        onGuestbookEntryClick={(linkId) => router.push(`/${linkId}`)}
        onOpenGuestbook={() => router.push(`/${profile.linkId}/feedback`)}
      />
    </div>
  )
}
