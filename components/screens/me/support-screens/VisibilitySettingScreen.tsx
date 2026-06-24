'use client'

import { ChevronDown } from 'lucide-react'
import { NavBar } from '@/components/ui'
import type { TabVisibility, TabVisibilityLevel } from '@/types'

const VISIBILITY_OPTIONS: Array<{ value: TabVisibilityLevel; label: string; desc: string }> = [
  { value: 'public',  label: '전체공개', desc: '누구나 볼 수 있어요' },
  { value: 'private', label: '비공개',   desc: '나만 볼 수 있어요'   },
]

const SECTIONS: Array<{ id: keyof TabVisibility; label: string; desc: string }> = [
  { id: 'who',        label: 'WHO',     desc: '하이라이트 · 자기소개' },
  { id: 'life',       label: 'VIBE',    desc: '취향 · 장소 · 활동'   },
  { id: 'reputation', label: 'NETWORK', desc: '평판 · 방명록'        },
]

export function VisibilitySettingScreen({
  tabVisibility,
  onUpdate,
  onBack,
}: {
  tabVisibility: TabVisibility
  onUpdate: (tab: keyof TabVisibility, level: TabVisibilityLevel) => void
  onBack: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <NavBar title="공개 설정" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* 안내 */}
        <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
          프로필의 각 섹션을 누가 볼 수 있는지 설정할 수 있어요. 프로필 카드(이름·직함·사진)는 항상 전체공개예요.
        </p>

        {/* 섹션별 설정 */}
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border-soft)]">
          {/* 프로필 카드 — 고정 */}
          <div className="flex items-center px-5 py-4 border-b border-[var(--color-border-soft)]">
            <div>
              <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">프로필 카드</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">이름 · 직함 · 사진</p>
            </div>
            <span className="ml-auto rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--color-accent-dark)]">
              항상 전체공개
            </span>
          </div>

          {/* 탭별 설정 */}
          {SECTIONS.map(({ id, label, desc }, i) => (
            <div
              key={id}
              className={[
                'flex items-center gap-3 px-5 py-4',
                i < SECTIONS.length - 1 ? 'border-b border-[var(--color-border-soft)]' : '',
              ].join(' ')}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{label}</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">{desc}</p>
              </div>
              <div className="relative flex-shrink-0">
                <select
                  value={tabVisibility[id]}
                  onChange={(e) => onUpdate(id, e.target.value as TabVisibilityLevel)}
                  className="appearance-none cursor-pointer rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] py-1.5 pl-3 pr-7 text-[12px] font-semibold text-[var(--color-text-primary)] outline-none"
                >
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              </div>
            </div>
          ))}
        </div>

        {/* 옵션 설명 */}
        <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-5 py-4 space-y-2.5">
          {VISIBILITY_OPTIONS.map((opt) => (
            <div key={opt.value} className="flex items-start gap-3">
              <span className="mt-0.5 min-w-[52px] text-[12px] font-bold text-[var(--color-text-primary)]">{opt.label}</span>
              <span className="text-[12px] text-[var(--color-text-secondary)]">{opt.desc}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
