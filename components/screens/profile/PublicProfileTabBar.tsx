'use client'

import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import type { TabAccessLevel } from '@/components/screens/profile/publicProfileData'

export type PublicProfileTabId = 'who' | 'vibe' | 'network'

const TABS: Array<{ id: PublicProfileTabId; label: string }> = [
  { id: 'who', label: 'WHO' },
  { id: 'vibe', label: 'VIBE' },
  { id: 'network', label: 'NETWORK' },
] as const

export function PublicProfileTabBar({
  activeTab,
  onTabChange,
  tabAccess,
}: {
  activeTab: PublicProfileTabId
  onTabChange: (tab: PublicProfileTabId) => void
  tabAccess?: Partial<Record<PublicProfileTabId, TabAccessLevel>>
}) {
  return (
    <div className="px-5 pt-3 pb-3">
      <div className="glass-card rounded-[20px] p-1.5">
        <div className="grid grid-cols-3 gap-1">
          {TABS.map((tab) => {
            const selected = tab.id === activeTab
            const access = tabAccess?.[tab.id] ?? 'visible'
            const isLocked = access === 'locked'
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className="relative overflow-hidden rounded-[16px] px-3 py-3 text-center text-[13px] font-semibold"
              >
                {selected && (
                  <motion.div
                    layoutId="public-profile-tab-indicator"
                    className="absolute inset-0 rounded-[14px] bg-[var(--color-accent-dark)]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className={`relative z-10 flex items-center justify-center gap-1 ${selected ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
                  {tab.label}
                  {isLocked && <Lock size={10} className="opacity-60" />}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
