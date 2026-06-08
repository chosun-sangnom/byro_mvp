'use client'

import { useState } from 'react'
import { Bell, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import SearchScreen from '@/components/screens/search/SearchScreen'
import NotificationModal from '@/components/layout/NotificationModal'

export default function AppHeader() {
  const router = useRouter()
  const { user, isLoggedIn, connectionRequests } = useByroStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notiOpen, setNotiOpen] = useState(false)

  const initials = user?.name ? user.name.slice(0, 2) : 'BY'
  const hasUnread = connectionRequests.length > 0

  return (
    <>
      <header className="flex items-center justify-between px-5 h-14 bg-[var(--color-bg-page)] border-b border-[var(--color-border-soft)] flex-shrink-0">
        <span className="text-[18px] font-black tracking-tight text-[var(--color-text-strong)]">
          Byro
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="검색"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => setNotiOpen(true)}
            className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="알림"
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {isLoggedIn ? (
            <button
              onClick={() => router.push('/me')}
              className="ml-1 w-8 h-8 rounded-full overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
              aria-label="내 바이로"
            >
              {user?.avatarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ backgroundColor: user?.avatarColor ?? 'var(--color-accent-dark)' }}
                >
                  {initials}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={() => router.push('/signup')}
              className="ml-1 w-8 h-8 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-[var(--color-text-tertiary)] hover:opacity-80 transition-opacity"
              aria-label="로그인"
            >
              <span className="text-[11px] font-bold">?</span>
            </button>
          )}
        </div>
      </header>

      {searchOpen && (
        <div className="absolute inset-0 z-50 bg-[var(--color-bg-page)]">
          <SearchScreen onClose={() => setSearchOpen(false)} />
        </div>
      )}

      {notiOpen && (
        <NotificationModal onClose={() => setNotiOpen(false)} />
      )}
    </>
  )
}
