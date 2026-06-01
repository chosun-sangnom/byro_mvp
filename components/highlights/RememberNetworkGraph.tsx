'use client'

import { Users, BarChart2, TrendingUp } from 'lucide-react'
import type { RememberInsight } from '@/types'

function Bar({ percent, muted }: { percent: number; muted?: boolean }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-border-default)' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(Math.max(percent, 0), 100)}%`,
          background: muted ? 'var(--color-text-tertiary)' : 'var(--color-accent-dark)',
        }}
      />
    </div>
  )
}

export function RememberNetworkGraph({
  total,
  insight,
}: {
  total: number
  industries?: { name: string; ratio: number; count?: number }[]
  insight?: RememberInsight
}) {
  if (!insight) {
    return (
      <div className="rounded-xl px-4 py-3" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}>
        <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>리멤버 명함 기준 · 총 {total}명</span>
      </div>
    )
  }

  const meetingPercent = Math.round((insight.recentMeetings / total) * 100)
  const growthDelta = insight.growthTo - insight.growthFrom

  return (
    <div
      className="rounded-xl px-4 py-3.5"
      style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}
    >
      <div className="divide-y" style={{ borderColor: 'var(--color-border-soft)' }}>

        {/* 최근 만남 */}
        <div className="flex gap-2.5 pb-3">
          <Users size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                최근 {insight.recentMonths}개월 신규 만남
              </span>
              <span className="text-[13px] font-black flex-shrink-0" style={{ color: 'var(--color-text-primary)' }}>
                {insight.recentMeetings}명
              </span>
            </div>
            <Bar percent={meetingPercent} />
            <div className="mt-1 text-right text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              전체 {total}명 중 {meetingPercent}%
            </div>
          </div>
        </div>

        {/* 업종 비율 */}
        <div className="flex gap-2.5 py-3">
          <BarChart2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                {insight.topIndustryName} 집중도
              </span>
              <span className="text-[13px] font-black flex-shrink-0" style={{ color: 'var(--color-text-primary)' }}>
                {insight.topIndustryPercent}%
              </span>
            </div>
            <Bar percent={insight.topIndustryPercent} />
            <div className="mt-1 text-right text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              전체 네트워크 중 업종 1위
            </div>
          </div>
        </div>

        {/* 업종 성장 */}
        <div className="flex gap-2.5 pt-3">
          <TrendingUp size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                {insight.growthIndustryName} · {insight.growthPeriodLabel}
              </span>
              <span className="text-[13px] font-black flex-shrink-0" style={{ color: 'var(--color-accent-dark)' }}>
                +{growthDelta}%p
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-4 flex-shrink-0 text-[9px] text-right" style={{ color: 'var(--color-text-tertiary)' }}>전</span>
                <Bar percent={insight.growthFrom} muted />
                <span className="w-6 flex-shrink-0 text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>{insight.growthFrom}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 flex-shrink-0 text-[9px] text-right font-bold" style={{ color: 'var(--color-accent-dark)' }}>후</span>
                <Bar percent={insight.growthTo} />
                <span className="w-6 flex-shrink-0 text-[10px] font-bold" style={{ color: 'var(--color-accent-dark)' }}>{insight.growthTo}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-3 text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
        리멤버 명함 기준 · 총 {total}명
      </div>
    </div>
  )
}
