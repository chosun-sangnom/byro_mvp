'use client'

import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'


import { getNormalizedPublicProfile, computeTabAccess } from '@/components/screens/profile/publicProfileData'
import { useProfileOwner } from '@/hooks/useProfileOwner'
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
  const { isOwner: isOwnerMode, isLoggedIn } = useProfileOwner(username)
  const profile = getNormalizedPublicProfile({
    username,
    user: store.user,
    ownerHighlights: store.highlights,
    ownerTabVisibility: store.tabVisibility,
  })
  const tabAccessCtx = { isOwner: isOwnerMode, isLoggedIn }
  const tabAccess = {
    who: computeTabAccess(profile.tabVisibility, 'who', tabAccessCtx),
    vibe: computeTabAccess(profile.tabVisibility, 'vibe', tabAccessCtx),
    network: computeTabAccess(profile.tabVisibility, 'network', tabAccessCtx),
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

function LockedTabContent() {
  return (
    <div className="relative overflow-hidden">
      <div className="px-5 py-6 space-y-3 select-none pointer-events-none" aria-hidden>
        {[80, 60, 72, 48, 64].map((w, i) => (
          <div key={i} className="h-4 rounded-full bg-[var(--color-bg-soft)]" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="absolute inset-0 backdrop-blur-md bg-[var(--color-bg-page)]/60" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-bg-soft)] border border-[var(--color-border-default)] flex items-center justify-center mb-4">
          <Lock size={22} className="text-[var(--color-text-tertiary)]" />
        </div>
        <p className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1.5">비공개 콘텐츠예요</p>
        <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
          프로필 주인이 이 섹션을 비공개로 설정했어요.
        </p>
      </div>
    </div>
  )
}

export function PublicProfileWhoTabPage({
  username,
}: {
  username: string
}) {
  const { store, profile, groupedHighlights, tabAccess } = usePublicProfileTabData(username)

  if (tabAccess.who !== 'visible') {
    return <LockedTabContent />
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
  const { isOwner: isOwnerMode } = useProfileOwner(username)

  if (tabAccess.vibe !== 'visible') {
    return <LockedTabContent />
  }

  return <PublicProfileLifeSection life={profile.life} isOwner={isOwnerMode} />
}

export function PublicProfileReputationTabPage({
  username,
}: {
  username: string
}) {
  const router = useRouter()
  const { store, profile, keywordCounts, totalKeywordCount, featuredGuestbook, tabAccess } = usePublicProfileTabData(username)

  if (tabAccess.network !== 'visible') {
    return <LockedTabContent />
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
        topIndustryRanks={profile.rememberHighlight.topIndustryRanks}
        topIndustryRoles={profile.rememberHighlight.topIndustryRoles}
        isLoggedIn={store.isLoggedIn}
        viewerNetworkDomain={store.user?.networkDomain}
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
