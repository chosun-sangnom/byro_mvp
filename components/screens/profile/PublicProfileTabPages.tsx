'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { showToast } from '@/components/ui'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'
import { getProfileAvatar } from '@/lib/mocks/publicProfiles'
import type { Highlight } from '@/types'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import {
  ProfileConnectSection,
  ProfileReputationSummarySection,
  ProfileSnsSection,
} from '@/components/screens/profile/PublicProfileSections'
import { ProfileHighlightsSection } from '@/components/screens/profile/PublicProfileHighlightsSection'
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
  const topRememberIndustry = [...profile.rememberHighlight.industries].sort((a, b) => b.ratio - a.ratio)[0]
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

  const keywordCounts = profile.selectedKeywords
    .slice(0, 5)
    .map((keyword) => ({
      keyword,
      count: profile.reputationKeywords.find((item) => item.keyword === keyword)?.count ?? 0,
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

function PlaceholderCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="px-5 pt-6 pb-8">
      <div className="glass-card rounded-[24px] border border-[var(--color-border-default)] px-5 py-5">
        <div className="text-[16px] font-semibold text-[var(--color-text-strong)]">{title}</div>
        <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">{description}</p>
      </div>
    </div>
  )
}

export function PublicProfileWhoTabPage({
  username,
}: {
  username: string
}) {
  const { store, profile, groupedHighlights, corporateHighlight, airlineHighlight, airlineBadgeLabel } = usePublicProfileTabData(username)
  const igOpen = store.snsOpenStates[`instagram_${username}`] ?? false
  const liOpen = store.snsOpenStates[`linkedin_${username}`] ?? false

  return (
    <>
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
      <PublicProfileWhoIAmSection whoIAm={profile.whoIAm} />
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
    </>
  )
}

export function PublicProfileLifeTabPage() {
  return (
    <PlaceholderCard
      title="라이프 탭 구조 준비"
      description="여기에 주거형태, 근무유형, 운동, 술, 담배, 커피, 반려동물과 취향/장소 섹션을 순서대로 붙일 예정입니다. 현재는 탭 라우팅과 고정 헤더 구조만 먼저 잡아둔 상태입니다."
    />
  )
}

export function PublicProfileReputationTabPage({
  username,
}: {
  username: string
}) {
  const router = useRouter()
  const { store, profile, keywordCounts, totalKeywordCount, featuredGuestbook } = usePublicProfileTabData(username)
  const alreadySubmitted = store.expSubmittedProfiles.includes(profile.linkId)

  return (
    <>
      <div className="px-5 pt-6 pb-2">
        <ProfileReputationSummarySection
          profile={profile}
          keywordCounts={keywordCounts}
          totalKeywordCount={totalKeywordCount}
          featuredGuestbook={featuredGuestbook}
          getProfileAvatar={getProfileAvatar}
          onGuestbookEntryClick={(linkId) => router.push(`/${linkId}`)}
          onOpenGuestbook={() => router.push(`/${profile.linkId}/guestbook`)}
        />
      </div>
      <ProfileConnectSection
        isOwnerMode={false}
        alreadySubmitted={alreadySubmitted}
        contactChannels={profile.contactChannels}
        onRequestFeedback={() => showToast('피드백 요청을 보냈어요!')}
        onLeaveExperience={() => showToast('경험 남기기 구조는 다음 단계에서 연결할 예정입니다.')}
        onChannelClick={(channel) => {
          if (!channel.enabled) {
            showToast('비활성화된 연락 수단이에요')
            return
          }
          if (!channel.href) {
            showToast('연결 정보를 준비 중이에요')
            return
          }
          window.open(channel.href, channel.href.startsWith('http') ? '_blank' : '_self')
        }}
      />
    </>
  )
}
