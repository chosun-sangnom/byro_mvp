'use client'

import { useRouter } from 'next/navigation'
import { Copy, Share2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { showToast } from '@/components/ui'
import { shareOrCopy } from '@/lib/share'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import { ProfileConnectSection } from '@/components/screens/profile/PublicProfileSections'
import { ProfileHeroSection } from '@/components/screens/profile/PublicProfileHeroSection'
import { ProfileSnsSection } from '@/components/screens/profile/PublicProfileSnsSection'
import { ProfileHighlightsSection } from '@/components/screens/profile/PublicProfileHighlightsSection'

interface PublicProfileProps {
  username: string
  mode?: 'public' | 'owner'
}


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
    ownerHighlights: store.highlights,
  })
  const {
    heroTheme,
    contactChannels,
  } = profile

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

  const publicProfileUrl = `https://byro.io/${profile.linkId}`

  const handleCopyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl)
      showToast('프로필 링크를 복사했어요')
    } catch {
      showToast('링크 복사에 실패했어요')
    }
  }

  const handleShareProfile = () => shareOrCopy({
    title: `${profile.name}의 Byro`,
    text: `${profile.name}의 Byro 프로필을 확인해보세요.`,
    url: publicProfileUrl,
  })

  const handleLogout = () => {
    store.logout()
    window.location.replace('/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 상단 네비 */}
      <div className="flex items-center px-4 h-12 border-b border-[var(--color-border-soft)] bg-[var(--color-glass-mid)] backdrop-blur-md flex-shrink-0">
        <button onClick={() => router.back()} className="text-sm text-[var(--color-text-secondary)] mr-2">‹</button>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-[0.18em]">{isOwnerMode ? 'My Byro' : 'Public Profile'}</div>
          <div className="text-xs text-[var(--color-text-secondary)] truncate">byro.io/{profile.linkId}</div>
        </div>
        {!isOwnerMode ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('공유 링크를 준비 중이에요')}
              className="icon-button"
            >
              <Share2 size={14} color="var(--color-text-tertiary)" />
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
              <Copy size={14} color="var(--color-text-tertiary)" />
            </button>
            <button
              onClick={handleShareProfile}
              className="icon-button"
              aria-label="프로필 공유"
            >
              <Share2 size={14} color="var(--color-text-tertiary)" />
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
        />

        {/* ─── SNS 섹션 ─────────────────────────────── */}
        <ProfileSnsSection
          instagramConnected={profile.instagramConnected}
          linkedinConnected={profile.linkedinConnected}
          instagram={profile.instagram}
          linkedin={profile.linkedin}
        />

        <ProfileHighlightsSection
          groupedHighlights={groupedHighlights}
          username={username}
          primaryHighlightOverrides={store.primaryHighlightOverrides}
          getHighlightOpen={(key) => store.hlOpenStates[key] ?? false}
          onToggleHighlight={(key) => store.toggleHlOpen(key)}
        />

        <ProfileConnectSection
          isOwnerMode={isOwnerMode}
          contactChannels={contactChannels}
          onRequestFeedback={() => showToast('피드백 요청을 보냈어요!')}
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

    </div>
  )
}
