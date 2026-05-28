'use client'

import { Users, TrendingUp, BarChart2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import type { RememberInsight } from '@/types'

function InsightCard({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-[18px] px-4 py-4"
      style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-soft)' }}
    >
      <div
        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}
      >
        <Icon size={14} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function NetworkInsightSheet({
  open,
  onClose,
  total,
  insight,
}: {
  open: boolean
  onClose: () => void
  total: number
  insight: RememberInsight
}) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-8">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
            Network Insight
          </p>
          <h3 className="mt-1.5 text-[22px] font-black leading-[1.2]" style={{ color: 'var(--color-text-primary)' }}>
            네트워크 인사이트
          </h3>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
            리멤버 명함 {total}명 기준
          </p>
        </div>

        <div className="space-y-3">
          {/* 총 만남 수 */}
          <InsightCard icon={Users}>
            <p className="text-[13px] font-semibold leading-[1.55]" style={{ color: 'var(--color-text-primary)' }}>
              최근 {insight.recentMonths}개월 동안{' '}
              <span className="text-[17px] font-black" style={{ color: 'var(--color-accent-dark)' }}>
                {insight.recentMeetings}명
              </span>
              을 만났어요
            </p>
          </InsightCard>

          {/* 업종 비율 */}
          <InsightCard icon={BarChart2}>
            <p className="text-[13px] font-semibold leading-[1.55]" style={{ color: 'var(--color-text-primary)' }}>
              만난 사람의{' '}
              <span className="text-[17px] font-black" style={{ color: 'var(--color-accent-dark)' }}>
                {insight.topIndustryPercent}%
              </span>
              가 {insight.topIndustryName}예요
            </p>
          </InsightCard>

          {/* 업종 성장 */}
          <InsightCard icon={TrendingUp}>
            <p className="mb-2 text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {insight.growthIndustryName} 비율이 {insight.growthPeriodLabel}간 늘었어요
            </p>
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-[13px] font-black"
                style={{ background: 'var(--color-bg-soft)', color: 'var(--color-text-secondary)' }}
              >
                {insight.growthFrom}%
              </span>
              <span className="text-[13px]" style={{ color: 'var(--color-accent-dark)' }}>→</span>
              <span
                className="rounded-full px-3 py-1 text-[13px] font-black"
                style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}
              >
                {insight.growthTo}%
              </span>
              <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
                +{insight.growthTo - insight.growthFrom}%p
              </span>
            </div>
          </InsightCard>
        </div>
      </div>
    </BottomSheet>
  )
}
