'use client'

import type { PublicProfileWhoIAm } from '@/types'
import { SectionTitle } from '@/components/screens/profile/PublicProfileSections'

function IdentityRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[18px] border border-[var(--color-border-soft)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-1 text-[15px] font-semibold text-[var(--color-text-primary)]">{value}</div>
    </div>
  )
}

export function PublicProfileWhoIAmSection({
  whoIAm,
}: {
  whoIAm?: PublicProfileWhoIAm
}) {
  if (!whoIAm) return null

  return (
    <div className="px-5 pt-6 pb-2">
      <SectionTitle title="Who I am" subtitle='MBTI, 혈액형, 사주궁합, AI 사진 분석과 개인 기본값을 모은 섹션' />

      <div className="grid grid-cols-2 gap-3">
        <IdentityRow label="MBTI" value={whoIAm.mbti} />
        <IdentityRow label="혈액형" value={whoIAm.bloodType} />
        <IdentityRow label="연애상태" value={whoIAm.relationshipStatus} />
        <IdentityRow label="자녀" value={whoIAm.children} />
        <div className="col-span-2">
          <IdentityRow label="종교" value={whoIAm.religion} />
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.04)] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">사주궁합</div>
            <div className="mt-1 text-[15px] font-semibold text-[var(--color-text-primary)]">{whoIAm.sajuCompatibilityLabel}</div>
          </div>
          <button className="rounded-full bg-[var(--color-accent-dark)] px-3 py-2 text-[12px] font-semibold text-white">
            보기
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.04)] px-4 py-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">AI 사진 분석</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {whoIAm.aiStyleSummary.map((item) => (
            <span key={item} className="chip-metric">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
