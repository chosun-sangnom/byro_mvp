'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'
import { getProfileAvatar } from '@/lib/mocks/publicProfiles'
import type { Highlight } from '@/types'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import {
  ProfileFeedbackSection,
  ProfileRememberSection,
  ProfileReputationSummarySection,
} from '@/components/screens/profile/PublicProfileSections'
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
  const profile = getNormalizedPublicProfile({
    username,
    user: store.user,
  })
  const corporateHighlight = profile.corporateHighlight
  const airlineHighlight = profile.airlineHighlight
  const airlineBadgeLabel = AIRLINE_BADGE_LABELS[airlineHighlight.badgeLevel as keyof typeof AIRLINE_BADGE_LABELS] ?? null
  const showCareerHighlight = username !== 'mk'
  const showAirlineHighlight = !['jiminlee', 'mk'].includes(username)

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
  }
}

export function PublicProfileWhoTabPage({
  username,
}: {
  username: string
}) {
  const { store, profile, groupedHighlights, corporateHighlight, airlineHighlight, airlineBadgeLabel } = usePublicProfileTabData(username)

  return (
    <>
      <PublicProfileWhoIAmSection
        whoIAm={profile.whoIAm}
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
        instagram={profile.instagram}
        linkedin={profile.linkedin}
      />
    </>
  )
}

export function PublicProfileLifeTabPage({
  username,
}: {
  username: string
}) {
  const { profile } = usePublicProfileTabData(username)
  return <PublicProfileLifeSection life={profile.life} />
}

export function PublicProfileReputationTabPage({
  username,
}: {
  username: string
}) {
  const router = useRouter()
  const { profile, keywordCounts, totalKeywordCount, featuredGuestbook } = usePublicProfileTabData(username)

  return (
    <div className="pb-6">
      <ProfileRememberSection
        total={profile.rememberHighlight.total}
        industries={profile.rememberHighlight.industries}
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
        onOpenGuestbook={() => router.push(`/${profile.linkId}/guestbook`)}
      />
    </div>
  )
}
