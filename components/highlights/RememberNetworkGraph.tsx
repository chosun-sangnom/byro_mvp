'use client'

import { Users, BarChart2, TrendingUp } from 'lucide-react'
import type { RememberInsight } from '@/types'

function InsightBar({ percent, accent }: { percent: number; accent?: boolean }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(Math.max(percent, 0), 100)}%`,
          background: accent ? 'var(--color-accent-dark)' : 'var(--color-text-tertiary)',
        }}
      />
    </div>
  )
}

function InsightRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-3.5 py-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={11} className="text-[var(--color-text-tertiary)]" />
        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{label}</span>
      </div>
      {children}
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
      <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
        <span className="text-[11px] text-[var(--color-text-tertiary)]">리멤버 명함 기준 · 총 {total}명</span>
      </div>
    )
  }

  const meetingPercent = Math.round((insight.recentMeetings / total) * 100)
  const growthDelta = insight.growthTo - insight.growthFrom

  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
      <div className="mb-3 text-sm font-bold text-[var(--color-text-strong)]">네트워크 인사이트</div>

      <div className="space-y-2">
        {/* 최근 만남 */}
        <InsightRow icon={Users} label={`최근 ${insight.recentMonths}개월 신규 만남`}>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[18px] font-black text-[var(--color-text-primary)]">{insight.recentMeetings}명</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">전체의 {meetingPercent}%</span>
          </div>
          <InsightBar percent={meetingPercent} accent />
        </InsightRow>

        {/* 업종 비율 */}
        <InsightRow icon={BarChart2} label={`${insight.topIndustryName} 집중도`}>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[18px] font-black text-[var(--color-text-primary)]">{insight.topIndustryPercent}%</span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">업종 1위</span>
          </div>
          <InsightBar percent={insight.topIndustryPercent} accent />
        </InsightRow>

        {/* 업종 성장 */}
        <InsightRow icon={TrendingUp} label={`${insight.growthIndustryName} · ${insight.growthPeriodLabel} 변화`}>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[11px] text-[var(--color-text-secondary)]">비율 변화</span>
            <span className="text-[13px] font-black text-[var(--color-state-success-text)]">+{growthDelta}%p</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 shrink-0 text-right text-[10px] text-[var(--color-text-tertiary)]">전</span>
              <InsightBar percent={insight.growthFrom} />
              <span className="w-7 shrink-0 text-[10px] text-[var(--color-text-tertiary)]">{insight.growthFrom}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 shrink-0 text-right text-[10px] font-bold text-[var(--color-accent-dark)]">후</span>
              <InsightBar percent={insight.growthTo} accent />
              <span className="w-7 shrink-0 text-[10px] font-bold text-[var(--color-accent-dark)]">{insight.growthTo}%</span>
            </div>
          </div>
        </InsightRow>
      </div>

      <div className="mt-3 border-t border-[var(--color-border-soft)] pt-3 text-[11px] text-[var(--color-text-tertiary)]">
        리멤버 명함 기준 · 총 {total}명
      </div>
    </div>
  )
}
