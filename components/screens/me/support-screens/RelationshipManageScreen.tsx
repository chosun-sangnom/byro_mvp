'use client'

import { ChevronRight } from 'lucide-react'
import { NavBar } from '@/components/ui'
import { REPUTATION_KEYWORD_GROUPS } from '@/lib/mocks/reputationKeywords'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

interface RelationshipManageScreenProps {
  onBack: () => void
  onEditNetwork: () => void
  onEditReputation: () => void
  onEditGuestbook: () => void
}

export function RelationshipManageScreen({
  onBack,
  onEditNetwork,
  onEditReputation,
  onEditGuestbook,
}: RelationshipManageScreenProps) {
  const totalReputationCount = SAMPLE_PROFILE.reputationKeywords.reduce((sum, item) => sum + item.count, 0)
  const visibleReputationCount = SAMPLE_PROFILE.reputationKeywords.filter((item) =>
    REPUTATION_KEYWORD_GROUPS.some((group) => group.keywords.includes(item.keyword)),
  ).length

  const rows = [
    {
      title: '네트워크',
      meta: `${SAMPLE_PROFILE.rememberHighlight.total}명 리멤버 네트워크`,
      onClick: onEditNetwork,
    },
    {
      title: '평판',
      meta: `누적 ${totalReputationCount}회 · 상위 ${visibleReputationCount}개 키워드`,
      onClick: onEditReputation,
    },
    {
      title: '방명록',
      meta: `${SAMPLE_PROFILE.guestbook.length}개 메시지 관리`,
      onClick: onEditGuestbook,
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <NavBar title="관계 관리" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-xs leading-relaxed text-[var(--color-text-tertiary)] mb-4">
          사람과 연결되는 정보를 한 곳에서 관리하세요.
        </div>

        <div className="settings-shell overflow-hidden p-2.5">
          {rows.map((row, index) => (
            <button
              key={row.title}
              onClick={row.onClick}
              className={`settings-row flex w-full items-center gap-4 px-4 py-3.5 text-left ${index > 0 ? 'mt-2' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">{row.title}</div>
                <div className="mt-1 text-[11px] leading-[1.5] text-white/48">{row.meta}</div>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white/56">
                <ChevronRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
