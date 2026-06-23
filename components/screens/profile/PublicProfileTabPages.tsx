'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'


import { getNormalizedPublicProfile, computeTabAccess } from '@/components/screens/profile/publicProfileData'
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

function usePublicProfileTabData(username: string) {
  const store = useByroStore()
  const isOwnerMode = store.isLoggedIn && store.user?.linkId === username
  const profile = getNormalizedPublicProfile({
    username,
    user: store.user,
    ownerHighlights: store.highlights,
    ownerTabVisibility: store.tabVisibility,
  })
  const tabAccessCtx = { isOwner: isOwnerMode, isLoggedIn: store.isLoggedIn }
  const tabAccess = {
    who: computeTabAccess(profile.tabVisibility, 'who', tabAccessCtx),
    life: computeTabAccess(profile.tabVisibility, 'life', tabAccessCtx),
    reputation: computeTabAccess(profile.tabVisibility, 'reputation', tabAccessCtx),
  }

  const groupedHighlights = HIGHLIGHT_GROUPS.map((group) => {
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
      items: manualGroups,
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
    keywordCounts,
    totalKeywordCount,
    featuredGuestbook,
    tabAccess,
  }
}

export function PublicProfileWhoTabPage({
  username,
}: {
  username: string
}) {
  const { store, profile, groupedHighlights, tabAccess } = usePublicProfileTabData(username)

  if (tabAccess.who !== 'visible') {
    return null
  }

  return (
    <>
      <PublicProfileWhoIAmSection
        whoIAm={profile.whoIAm}
        bio={profile.bio}
      />
      <ProfileHighlightsSection
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
  const { profile, tabAccess } = usePublicProfileTabData(username)

  if (tabAccess.life !== 'visible') {
    return null
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
    return null
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
