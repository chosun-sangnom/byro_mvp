'use client'

export function CareerContinuityChart({
  avgYears,
  vsIndustryPercent,
}: {
  avgYears: number
  vsIndustryPercent: number
}) {
  const industryYears = Number((avgYears / (1 + vsIndustryPercent / 100)).toFixed(1))
  const maxYears = Math.max(avgYears, industryYears, 1)
  const selfWidth = `${(avgYears / maxYears) * 100}%`
  const industryWidth = `${(industryYears / maxYears) * 100}%`

  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-sm font-bold text-[var(--color-text-strong)]">평균 재직 기간 비교</div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">건강보험공단 기준으로 업계 평균과 비교해요</div>
        </div>
        <div className="rounded-full bg-[var(--color-state-success-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-state-success-text)]">
          +{vsIndustryPercent}%
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[var(--color-text-strong)]">나</span>
            <span className="font-black text-[var(--color-text-strong)]">{avgYears}년</span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--color-bg-muted)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--color-accent-dark)]" style={{ width: selfWidth }} />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[var(--color-text-secondary)]">업계 평균</span>
            <span className="font-semibold text-[var(--color-text-secondary)]">{industryYears}년</span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--color-bg-muted)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--color-border-default)]" style={{ width: industryWidth }} />
          </div>
        </div>
      </div>
    </div>
  )
}
