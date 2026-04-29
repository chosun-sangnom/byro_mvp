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
    <div className="rounded-[22px] border border-[#E7E2DC] bg-white px-4 py-4">
      <div className="mb-4">
        <div className="text-sm font-bold text-[var(--color-text-strong)]">법인 운영 이력</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{summary}</div>
      </div>

      <div className="rounded-[22px] border border-[#ECE6DF] bg-[var(--color-bg-soft)] px-4 py-3">
        {companies.map((company) => (
          <div
            key={`${company.name}-${company.startYear}`}
            className={companies.indexOf(company) > 0 ? 'border-t border-[#E7E2DC] pt-3 mt-3' : ''}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold text-[var(--color-text-strong)]">{company.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                    {company.startYear} - {company.endYear ?? '현재'}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">운영 {company.years}년</span>
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-[#E8F5EC] px-2.5 py-1 text-[11px] font-semibold text-[#217A43]">
                {company.status}
              </div>
            </div>

            <div className="micro-text mt-2">
              법인 영속성 · {company.startYear} - {company.endYear ?? '현재'}
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
