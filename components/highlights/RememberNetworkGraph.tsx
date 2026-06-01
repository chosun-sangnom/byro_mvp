'use client'

import { Users, BarChart2, TrendingUp } from 'lucide-react'
import type { RememberInsight } from '@/types'

function InsightRow({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-[16px] px-4 py-3.5"
      style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-soft)' }}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}
        >
          <Icon size={11} />
        </span>
        <span className="text-[11px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function Bar({ percent, muted }: { percent: number; muted?: boolean }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-border-default)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(percent, 100)}%`,
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
      <div
        className="rounded-xl px-4 py-4"
        style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}
      >
        <div className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>리멤버 명함 기준 · 총 {total}명</div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}
    >
      <div className="mb-3 space-y-2.5">
        {/* 최근 만남 */}
        <InsightRow icon={Users} title={`최근 ${insight.recentMonths}개월 만남`}>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="text-[20px] font-black" style={{ color: 'var(--color-accent-dark)' }}>
              {insight.recentMeetings}명
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>새로운 연결</span>
          </div>
          <Bar percent={Math.round((insight.recentMeetings / total) * 100)} />
        </InsightRow>

        {/* 업종 비율 */}
        <InsightRow icon={BarChart2} title={`${insight.topIndustryName} 집중도`}>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="text-[20px] font-black" style={{ color: 'var(--color-accent-dark)' }}>
              {insight.topIndustryPercent}%
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>만난 사람 중</span>
          </div>
          <Bar percent={insight.topIndustryPercent} />
        </InsightRow>

        {/* 업종 성장 */}
        <InsightRow icon={TrendingUp} title={`${insight.growthIndustryName} 비율 변화 · ${insight.growthPeriodLabel}`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 text-right text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>이전</span>
              <div className="flex-1"><Bar percent={insight.growthFrom} muted /></div>
              <span className="w-7 text-[11px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>{insight.growthFrom}%</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-7 text-right text-[11px] font-bold" style={{ color: 'var(--color-accent-dark)' }}>현재</span>
              <div className="flex-1"><Bar percent={insight.growthTo} /></div>
              <span className="w-7 text-[11px] font-black" style={{ color: 'var(--color-accent-dark)' }}>{insight.growthTo}%</span>
            </div>
          </div>
        </InsightRow>
      </div>

      <div className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>리멤버 명함 기준 · 총 {total}명</div>
    </div>
  )
}
