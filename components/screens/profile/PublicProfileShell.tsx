'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Share2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { showToast } from '@/components/ui'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import { ProfileHeroCard } from '@/components/screens/profile/PublicProfileSections'
import { PublicProfileHeaderMeta } from '@/components/screens/profile/PublicProfileHeaderMeta'
import { PublicProfileTabBar } from '@/components/screens/profile/PublicProfileTabBar'

export function PublicProfileShell({
  username,
  children,
}: {
  username: string
  children: ReactNode
}) {
  const router = useRouter()
  const store = useByroStore()
  const profile = getNormalizedPublicProfile({
    username,
    user: store.user,
  })

  const [bookmarked, setBookmarked] = useState(false)
  const [bioExpanded, setBioExpanded] = useState(false)
  const [bioOverflowing, setBioOverflowing] = useState(false)
  const bioRef = useRef<HTMLParagraphElement | null>(null)

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

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 flex-shrink-0 items-center border-b border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.78)] px-4 backdrop-blur-md">
        <button onClick={() => router.back()} className="mr-2 text-sm text-[var(--color-text-secondary)]">‹</button>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Public Profile</div>
          <div className="truncate text-xs text-[var(--color-text-secondary)]">byro.io/@{profile.linkId}</div>
        </div>
        <div className="flex items-center gap-3">
          {store.isLoggedIn && (
            <button
              onClick={() => {
                setBookmarked((prev) => !prev)
                showToast(bookmarked ? '저장 취소됐어요' : '프로필을 저장했어요!')
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
      </div>

      <div className="flex-shrink-0">
        <div className="relative px-5 pt-4 pb-1">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(75,108,245,0.14)_0%,transparent_68%)]" />
          <ProfileHeroCard
            profile={profile}
            heroTheme={profile.heroTheme}
            isOwnerMode={false}
            bioExpanded={bioExpanded}
            bioOverflowing={bioOverflowing}
            bioRef={bioRef}
            onToggleBio={() => setBioExpanded((prev) => !prev)}
          />
        </div>
        <PublicProfileHeaderMeta meta={profile.headerMeta} />
        <PublicProfileTabBar username={username} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
