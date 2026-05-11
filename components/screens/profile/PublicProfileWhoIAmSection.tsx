'use client'

import { useState } from 'react'
import type { PublicProfileLife, PublicProfileWhoIAm } from '@/types'
import { SectionTitle } from '@/components/screens/profile/PublicProfileSections'
import { PublicProfileCompatibilitySheet } from '@/components/screens/profile/PublicProfileCompatibilitySheet'

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
  name,
  whoIAm,
  life,
}: {
  name: string
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
}) {
  const [reportOpen, setReportOpen] = useState(false)

  if (!whoIAm) return null
  const petText = life?.daily.petName
    ? `${life.daily.pet} · ${life.daily.petName}`
    : life?.daily.pet ?? '없음'

  return (
    <>
      <div className="px-5 pt-6 pb-2">
        <SectionTitle title="나" subtitle='MBTI와 반려동물, 그리고 궁합 보기로 이 사람의 기본 결을 보여줍니다.' />

        <div className="grid grid-cols-2 gap-3">
          <IdentityRow label="MBTI" value={whoIAm.mbti} />
          <IdentityRow label="반려동물" value={petText} />
        </div>

        <div className="mt-4 rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.04)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">궁합 리포트</div>
              <div className="mt-1 text-[15px] font-semibold text-[var(--color-text-primary)]">MBTI · 사주 · 라이프스타일을 함께 읽는 분석</div>
              <p className="mt-2 text-[12px] leading-[1.6] text-[var(--color-text-secondary)]">
                이성, 사업 파트너, 친구 · 동료 관점으로 관계의 흐름을 다르게 해석해요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="rounded-full bg-[var(--color-accent-dark)] px-3 py-2 text-[12px] font-semibold text-white"
            >
              궁합 보기
            </button>
          </div>
        </div>
      </div>

      <PublicProfileCompatibilitySheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        profileName={name}
        whoIAm={whoIAm}
        life={life}
      />
    </>
  )
}
