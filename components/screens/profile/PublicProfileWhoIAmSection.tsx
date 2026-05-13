'use client'

import { PawPrint } from 'lucide-react'
import type { PublicProfileLife, PublicProfileWhoIAm } from '@/types'
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

function PetCard({
  pet,
  petName,
  petImage,
}: {
  pet: string
  petName?: string
  petImage?: string
}) {
  return (
    <div className="mt-3 rounded-[22px] border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-4 py-4">
      <div className="flex items-center gap-3">
        {petImage ? (
          <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)]">
            <img src={petImage} alt={`${petName ?? pet} 사진`} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)]">
            <PawPrint size={24} className="text-[var(--color-text-secondary)]" />
          </div>
        )}

        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">반려동물</div>
          <div className="mt-1 text-[17px] font-semibold text-[var(--color-text-primary)]">
            {petName ? `${pet} · ${petName}` : pet}
          </div>
          <p className="mt-1 text-[12px] leading-[1.6] text-[var(--color-text-secondary)]">
            {petImage
              ? '프로필의 분위기를 더 잘 보여주는 생활감 있는 정보예요.'
              : '함께 사는 존재만으로도 이 사람의 생활 리듬이 더 선명해집니다.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export function PublicProfileWhoIAmSection({
  whoIAm,
  life,
}: {
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
}) {
  if (!whoIAm) return null
  const pet = life?.daily.pet
  const hasPet = Boolean(pet && pet !== '없음')
  const petValue = hasPet ? pet ?? '' : ''

  return (
    <>
      <div className="px-5 pt-6 pb-2">
        <SectionTitle
          title="나"
          subtitle="MBTI와 생활감 있는 정보로 프로필의 기본 결을 정리합니다."
        />

        <div className="grid grid-cols-1 gap-3">
          <IdentityRow label="MBTI" value={whoIAm.mbti} />
        </div>

        {hasPet && (
          <PetCard
            pet={petValue}
            petName={life?.daily.petName}
            petImage={life?.daily.petImage}
          />
        )}

      </div>
    </>
  )
}
