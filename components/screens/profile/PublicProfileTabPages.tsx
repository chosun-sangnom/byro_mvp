'use client'

import { Lock } from 'lucide-react'
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

function LockedTabContent({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-bg-soft)] flex items-center justify-center mb-4">
        <Lock size={22} className="text-[var(--color-text-tertiary)]" />
      </div>
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
    </div>
  )
}

export function PublicProfileWhoTabPage({
  username,
}: {
  username: string
}) {
  const router = useRouter()
  const { store, profile, groupedHighlights, tabAccess } = usePublicProfileTabData(username)

  if (tabAccess.who !== 'visible') {
    return <LockedTabContent onLogin={() => router.push('/signup')} />
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
  const router = useRouter()
  const { profile, tabAccess } = usePublicProfileTabData(username)

  if (tabAccess.life !== 'visible') {
    return <LockedTabContent onLogin={() => router.push('/signup')} />
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
    return <LockedTabContent onLogin={() => router.push('/signup')} />
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
