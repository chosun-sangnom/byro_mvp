'use client'

import { useState } from 'react'
import { PawPrint } from 'lucide-react'
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
  name,
  whoIAm,
  life,
  isOwnerMode = false,
}: {
  name: string
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
  isOwnerMode?: boolean
}) {
  const [reportOpen, setReportOpen] = useState(false)

  if (!whoIAm) return null
  const pet = life?.daily.pet
  const hasPet = Boolean(pet && pet !== '없음')
  const petValue = hasPet ? pet ?? '' : ''

  return (
    <>
      <div className="px-5 pt-6 pb-2">
        <SectionTitle
          title="나"
          subtitle={isOwnerMode
            ? 'MBTI와 생활감 있는 정보로 내 프로필의 기본 결을 정리합니다.'
            : 'MBTI와 생활감 있는 정보, 그리고 궁합 보기로 이 사람의 기본 결을 보여줍니다.'}
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

        {!isOwnerMode && (
          <div className="mt-4 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
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
        )}
      </div>

      {!isOwnerMode && (
        <PublicProfileCompatibilitySheet
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          profileName={name}
          whoIAm={whoIAm}
          life={life}
        />
      )}
    </>
  )
}
