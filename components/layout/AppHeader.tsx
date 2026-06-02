'use client'

import { Bell, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'

export default function AppHeader() {
  const router = useRouter()
  const { user, isLoggedIn } = useByroStore()

  const initials = user?.name
    ? user.name.slice(0, 2)
    : 'BY'

  return (
    <header className="flex items-center justify-between px-5 h-14 bg-[var(--color-bg-page)] border-b border-[var(--color-border-soft)] flex-shrink-0">
      <span className="text-[18px] font-black tracking-tight text-[var(--color-text-strong)]">
        Byro
      </span>

      <div className="flex items-center gap-1">
        {/* 검색 */}
        <button
          onClick={() => router.push('/search')}
          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="검색"
        >
          <Search size={20} />
        </button>

        {/* 알림 */}
        <button
          className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="알림"
        >
          <Bell size={20} />
          {/* [임시] 알림 배지 — 실제 알림 연동 전 고정 표시 */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* 마이페이지 아바타 */}
        {isLoggedIn ? (
          <button
            onClick={() => router.push('/me')}
            className="ml-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold transition-opacity hover:opacity-80"
            style={{ backgroundColor: user?.avatarColor ?? 'var(--color-accent-dark)' }}
            aria-label="내 바이로"
          >
            {initials}
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
  )
}
