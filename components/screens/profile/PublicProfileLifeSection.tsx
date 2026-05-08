'use client'

import type { PublicProfileLife } from '@/types'
import { SectionTitle } from '@/components/screens/profile/PublicProfileSections'

function LifeField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[18px] border border-[var(--color-border-soft)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-[var(--color-text-primary)]">{value}</div>
    </div>
  )
}

function LifeChipGroup({
  label,
  items,
}: {
  label: string
  items: string[]
}) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.04)] px-4 py-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">{label}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="chip-metric">{item}</span>
        ))}
      </div>
    </div>
  )
}

export function PublicProfileLifeSection({
  life,
}: {
  life?: PublicProfileLife
}) {
  if (!life) return null

  return (
    <>
      <div className="px-5 pt-6 pb-2">
        <SectionTitle title="일상" subtitle="하루 루틴과 생활 패턴" />
        <div className="grid grid-cols-2 gap-3">
          <LifeField label="주거형태" value={life.daily.housingType} />
          <LifeField label="근무유형" value={life.daily.workStyle} />
          <LifeField label="술" value={life.daily.alcohol} />
          <LifeField label="담배" value={life.daily.smoking} />
          <LifeField label="커피" value={life.daily.coffee} />
          <LifeField label="반려동물" value={life.daily.pet} />
        </div>
        <div className="mt-4">
          <LifeChipGroup label="하는 운동" items={life.daily.exercise} />
        </div>
      </div>

      <div className="px-5 pt-6 pb-2">
        <SectionTitle title="취향" subtitle="구체적으로 좋아하는 것들" />
        <div className="space-y-4">
          <LifeChipGroup label="영화 · 드라마" items={life.tastes.movies} />
          <LifeChipGroup label="음악" items={life.tastes.music} />
          <LifeChipGroup label="책" items={life.tastes.books} />
          <LifeChipGroup label="게임" items={life.tastes.games} />
          <LifeChipGroup label="스포츠" items={life.tastes.sports} />
          <LifeChipGroup label="최애" items={life.tastes.celebrities} />
          <LifeField label="식단" value={life.tastes.diet} />
          <LifeChipGroup label="맛집" items={life.tastes.restaurants} />
          <LifeChipGroup label="카페" items={life.tastes.cafes} />
        </div>
      </div>

      <div className="px-5 pt-6 pb-8">
        <SectionTitle title="장소" subtitle="자주 가는 곳과 여행지" />
        <div className="space-y-4">
          <LifeChipGroup label="자주 가는 곳" items={life.places.neighborhoods} />
          <LifeChipGroup label="여행지" items={life.places.travelDestinations} />
        </div>
      </div>
    </>
  )
}
