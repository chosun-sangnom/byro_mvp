'use client'

export function CareerContinuityChart({
  avgYears,
}: {
  avgYears: number
  vsIndustryPercent?: number
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
      <div className="mb-3 text-sm font-bold text-[var(--color-text-strong)]">평균 재직 기간</div>
      <div className="mb-3 flex items-baseline gap-1">
        <span className="text-[28px] font-black text-[var(--color-text-primary)]">{avgYears}</span>
        <span className="text-[13px] font-semibold text-[var(--color-text-secondary)]">년</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
        <div
          className="h-full rounded-full bg-[var(--color-accent-dark)]"
          style={{ width: `${Math.min((avgYears / 10) * 100, 100)}%` }}
        />
      </div>
      <div className="mt-2 text-right text-[11px] text-[var(--color-text-tertiary)]">최대 10년 기준</div>
    </div>
  )
}
