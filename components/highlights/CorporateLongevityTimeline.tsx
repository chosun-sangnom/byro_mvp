'use client'

type CorporateCompany = {
  name: string
  startYear: number
  endYear?: number | null
  years: number
  status: string
}

export function CorporateLongevityTimeline({
  summary,
  companies,
  footer = '폐업 이력 없음',
}: {
  summary: string
  companies: CorporateCompany[]
  footer?: string
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
      <div className="mb-4">
        <div className="text-sm font-bold text-[var(--color-text-strong)]">법인 운영 이력</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{summary}</div>
      </div>

      <div className="space-y-2.5">
        {companies.map((company) => (
          <div
            key={`${company.name}-${company.startYear}`}
            className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-muted)] px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{company.name}</div>
                <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                  {company.startYear} — {company.endYear ?? '현재'}
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-[var(--color-state-success-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-state-success-text)]">
                {company.status}
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
              <div className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                운영 {company.years}년
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[var(--color-border-soft)] pt-3 text-[11px] text-[var(--color-text-tertiary)]">
        {footer}
      </div>
    </div>
  )
}
