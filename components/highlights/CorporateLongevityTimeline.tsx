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
  const maxYears = Math.max(...companies.map((company) => company.years), 1)

  return (
    <div className="rounded-[22px] border border-[#E7E2DC] bg-white px-4 py-4">
      <div className="mb-4">
        <div className="text-sm font-bold text-[var(--color-text-strong)]">법인 운영 이력</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{summary}</div>
      </div>

      <div className="space-y-4">
        {companies.map((company) => (
          <div key={`${company.name}-${company.startYear}`}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-[var(--color-text-strong)]">{company.name}</div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">
                  {company.startYear} - {company.endYear ?? '현재'}
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-[#E8F5EC] px-2.5 py-1 text-[11px] font-semibold text-[#217A43]">
                {company.status}
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-[#F1EFEC]">
              <div
                className="h-full rounded-full bg-[#111111]"
                style={{ width: `${(company.years / maxYears) * 100}%` }}
              />
            </div>

            <div className="mt-1.5 text-right text-[11px] font-semibold text-[var(--color-text-secondary)]">
              {company.years}년 운영
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[#F1ECE6] pt-3 text-[11px] text-[var(--color-text-tertiary)]">
        {footer}
      </div>
    </div>
  )
}
