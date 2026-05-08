'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSelectedLayoutSegment } from 'next/navigation'

const TABS = [
  { id: 'who', label: '나', href: '' },
  { id: 'life', label: '라이프', href: '/life' },
  { id: 'reputation', label: '평판', href: '/reputation' },
] as const

export function PublicProfileTabBar({
  username,
}: {
  username: string
}) {
  const segment = useSelectedLayoutSegment()
  const activeTab = segment === 'life' || segment === 'reputation' ? segment : 'who'

  return (
    <div className="px-5 pt-3 pb-3">
      <div className="glass-card rounded-[20px] p-1.5">
        <div className="grid grid-cols-3 gap-1">
          {TABS.map((tab) => {
            const selected = tab.id === activeTab
            return (
              <Link
                key={tab.id}
                href={`/${username}${tab.href}`}
                className="relative overflow-hidden rounded-[16px] px-3 py-3 text-center text-[13px] font-semibold"
              >
                {selected && (
                  <motion.div
                    layoutId="public-profile-tab-indicator"
                    className="absolute inset-0 rounded-[14px] bg-[var(--color-accent-dark)]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className={`relative z-10 ${selected ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
