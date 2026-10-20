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
  variant = 'pill',
}: {
  activeTab: PublicProfileTabId
  onTabChange: (tab: PublicProfileTabId) => void
  tabAccess?: Partial<Record<PublicProfileTabId, TabAccessLevel>>
  /** [임시] UI 개편 시안 — 'underline'은 알약 대신 글자 아래 밑줄로 선택 표시 */
  variant?: 'pill' | 'underline'
}) {
  if (variant === 'underline') {
    return (
      <div className="flex border-b border-[#DEE4EC] px-5">
        {TABS.map((tab) => {
          const selected = tab.id === activeTab
          const isLocked = (tabAccess?.[tab.id] ?? 'visible') === 'locked'
          return (
            <button
              key={tab.id}
              type="button"
              data-tour-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1 py-3.5 text-[14px] font-semibold ${selected ? 'text-[#0D0D0D]' : 'text-[#A8B1BD]'}`}
            >
              {tab.label}
              {isLocked && <Lock size={10} className="opacity-60" />}
              {selected && (
                <motion.div
                  layoutId="public-profile-tab-underline"
                  className="absolute inset-x-0 -bottom-px h-[2px] bg-[#0D0D0D]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="px-5 pt-3 pb-3">
      <div className="rounded-full bg-[#F5F6F7] p-1">
        <div className="grid grid-cols-3 gap-1">
          {TABS.map((tab) => {
            const selected = tab.id === activeTab
            const access = tabAccess?.[tab.id] ?? 'visible'
            const isLocked = access === 'locked'
            return (
              <button
                key={tab.id}
                type="button"
                data-tour-tab={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative overflow-hidden rounded-full px-6 py-2 text-center text-[14px] font-semibold"
              >
                {selected && (
                  <motion.div
                    layoutId="public-profile-tab-indicator"
                    className="absolute inset-0 rounded-full bg-black"
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
