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
    <div className="rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-3">
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
      <SectionTitle
        title="나"
        subtitle="MBTI와 생활감 있는 정보로 프로필의 기본 결을 정리합니다."
      />
      <div className="grid grid-cols-1 gap-3">
        <IdentityRow label="MBTI" value={whoIAm.mbti} />
      </div>
    </div>
  )
}
