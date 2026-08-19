'use client'

import { motion } from 'framer-motion'
import { NavBar, showToast } from '@/components/ui'
import type { TabVisibility, TabVisibilityLevel } from '@/types'

const SECTIONS: Array<{ id: keyof TabVisibility; label: string; desc: string }> = [
  { id: 'who',     label: 'WHO',     desc: '하이라이트 · 자기소개' },
  { id: 'vibe',    label: 'VIBE',    desc: '취향 · 활동 · 장소' },
  { id: 'network', label: 'NETWORK', desc: '평판 · 방명록' },
]

function VisibilityToggle({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className="relative h-[28px] w-[68px] flex-shrink-0 overflow-hidden rounded-full p-[2px]"
      animate={{ backgroundColor: checked ? '#000000' : '#dee4ec' }}
      transition={{ duration: 0.15 }}
    >
      <motion.span
        className="pointer-events-none absolute left-[2px] top-1/2 flex h-[24px] w-[32px] -translate-y-1/2 items-center justify-center text-[12px] font-medium tracking-[-0.24px] text-white"
        animate={{ opacity: checked ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        공개
      </motion.span>
      <motion.span
        className="absolute top-1/2 h-[24px] w-[32px] -translate-y-1/2 rounded-full bg-white"
        animate={{ left: checked ? 34 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
      />
    </motion.button>
  )
}

export function VisibilitySettingScreen({
  tabVisibility,
  onUpdate,
  onBack,
}: {
  tabVisibility: TabVisibility
  onUpdate: (tab: keyof TabVisibility, level: TabVisibilityLevel) => void
  onBack: () => void
}) {
  const handleToggle = (id: keyof TabVisibility, label: string) => {
    const next: TabVisibilityLevel = tabVisibility[id] === 'public' ? 'private' : 'public'
    onUpdate(id, next)
    showToast(`${label} 섹션이 ${next === 'public' ? '전체공개' : '비공개'}로 저장되었어요.`)
  }

  return (
    <div className="flex h-full flex-col">
      <NavBar title="공개 설정" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* 안내 */}
        <p className="text-[15px] leading-[1.5] tracking-[-0.3px] text-[#475058]">
          프로필 각 섹션의 공개 범위를 설정할 수 있어요.
          <br />
          프로필 카드는 항상 전체공개예요.
        </p>

        {/* 섹션별 설정 */}
        <div className="overflow-hidden rounded-[24px] border-[0.66px] border-[#dee4ec]">
          {SECTIONS.map(({ id, label, desc }, i) => (
            <div
              key={id}
              className={[
                'flex items-center justify-between px-4 py-4',
                i < SECTIONS.length - 1 ? 'border-b border-[#dee4ec]' : '',
              ].join(' ')}
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold tracking-[-0.28px] text-[#0d0d0d]">{label}</p>
                <p className="mt-0.5 text-[12px] font-medium tracking-[-0.24px] text-[#6c7786]">{desc}</p>
              </div>
              <VisibilityToggle
                checked={tabVisibility[id] === 'public'}
                onClick={() => handleToggle(id, label)}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
