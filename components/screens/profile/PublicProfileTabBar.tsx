'use client'

/**
 * PublicProfileTabBar
 *
 * 공개 프로필 탭 네비게이션 (나 / 라이프 / 관계).
 * - owner / visitor 모두 동일한 탭 구조를 가짐
 * - 선택된 탭은 인디고 배경 + 스프링 애니메이션으로 표시
 * - 탭 상태는 부모(page.tsx)의 useState로 관리 — URL 변경 없음
 *
 * TODO(tabs): 탭 추가 시 TABS 배열에만 항목 추가하면 됨
 */

import { motion } from 'framer-motion'

export type PublicProfileTabId = 'who' | 'life' | 'reputation'

const TABS: Array<{ id: PublicProfileTabId; label: string }> = [
  { id: 'who', label: '나' },
  { id: 'life', label: '라이프' },
  { id: 'reputation', label: '관계' },
] as const

export function PublicProfileTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: PublicProfileTabId
  onTabChange: (tab: PublicProfileTabId) => void
}) {
  return (
    <div className="px-5 pt-3 pb-3">
      <div className="glass-card rounded-[20px] p-1.5">
        <div className="grid grid-cols-3 gap-1">
          {TABS.map((tab) => {
            const selected = tab.id === activeTab
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
                <span className={`relative z-10 ${selected ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
