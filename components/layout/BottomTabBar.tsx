'use client'

import { Archive, Home, Search, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/components/ui'

const TABS = [
  { id: 'home', icon: Home, label: '홈', href: '/', match: (p: string) => p === '/', requiresAuth: false },
  { id: 'search', icon: Search, label: '검색', href: '/search', match: (p: string) => p.startsWith('/search'), requiresAuth: false },
  { id: 'archive', icon: Archive, label: '아카이브', href: '/archive', match: (p: string) => p.startsWith('/archive'), requiresAuth: true },
  { id: 'settings', icon: Settings, label: '설정', href: '/settings', match: (p: string) => p.startsWith('/settings'), requiresAuth: false },
]

export default function BottomTabBar() {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const { isLoggedIn } = useAuth()

  const handleTabClick = (tab: (typeof TABS)[number]) => {
    if (tab.requiresAuth && !isLoggedIn) {
      showToast('로그인이 필요한 기능이에요')
      setTimeout(() => router.push('/signup'), 500)
      return
    }
    router.push(tab.href)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div className="mx-auto w-full max-w-[430px] px-6 pb-[calc(env(safe-area-inset-bottom)+14px)]">
        <div
          className="flex items-center justify-around gap-1 rounded-full border pointer-events-auto shadow-xl backdrop-blur-xl"
          style={{
            backgroundColor: 'var(--color-glass-mid)',
            borderColor: 'var(--color-border-soft)',
            padding: '8px 10px',
          }}
        >
          {TABS.map((tab) => {
            const active = tab.match(pathname)
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTabClick(tab)}
                aria-label={tab.label}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{
                  width: 48,
                  height: 40,
                  backgroundColor: active ? 'var(--color-accent-soft)' : 'transparent',
                  color: active ? 'var(--color-accent-dark)' : 'var(--color-text-tertiary)',
                }}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
