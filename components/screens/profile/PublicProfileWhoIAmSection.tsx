'use client'

import { Sparkles } from 'lucide-react'
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

function BioBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">자기소개</div>
      <p className="mt-1.5 text-[14px] leading-[1.65] text-[var(--color-text-primary)]">{text}</p>
    </div>
  )
}

function PersonalityBlock({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">성향</div>
        <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: 'var(--color-accent-bg)' }}>
          <Sparkles size={9} style={{ color: 'var(--color-accent-dark)' }} />
          <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent-dark)' }}>AI 생성</span>
        </div>
      </div>
      <p className="text-[14px] leading-[1.65] text-[var(--color-text-primary)]">{text}</p>
    </div>
  )
}

export function PublicProfileWhoIAmSection({
  whoIAm,
  bio,
}: {
  whoIAm?: PublicProfileWhoIAm
  bio?: string
}) {
  if (!whoIAm && !bio) return null

  return (
    <div className="px-5 pt-6 pb-2">
      <SectionTitle
        title="나"
        subtitle="MBTI와 생활감 있는 정보로 프로필의 기본 결을 정리합니다."
      />
      <div className="grid grid-cols-1 gap-3">
        {bio && <BioBlock text={bio} />}
        {whoIAm && <IdentityRow label="MBTI" value={whoIAm.mbti} />}
        {whoIAm?.personality && <PersonalityBlock text={whoIAm.personality} />}
      </div>
    </div>
  )
}
