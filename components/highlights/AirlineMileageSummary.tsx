'use client'

import { BadgeCheck, Plane } from 'lucide-react'

type AirlineTier = {
  name: string
  tier: string
}

export function AirlineMileageSummary({
  badgeLabel,
  tierSummary,
  airlines,
}: {
  badgeLabel?: string | null
  tierSummary: string
  airlines: AirlineTier[]
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
              <Plane size={16} />
            </span>
            <div className="text-sm font-bold text-[var(--color-text-strong)]">항공 등급 인증</div>
          </div>
          <div className="mt-2 text-[12px] leading-5 text-[var(--color-text-secondary)]">{tierSummary}</div>
        </div>
        {badgeLabel && (
          <div className="shrink-0 rounded-full bg-[var(--color-state-info-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-state-info-text)]">
            {badgeLabel}
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {airlines.map((airline) => (
          <div
            key={airline.name}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-muted)] px-3.5 py-3"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">{airline.name}</div>
              <div className="mt-1 text-[14px] font-bold text-[var(--color-text-strong)]">{airline.tier}</div>
            </div>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-[var(--color-state-success-text)] border border-[var(--color-border-default)]">
              <BadgeCheck size={14} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
