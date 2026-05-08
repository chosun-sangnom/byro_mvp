'use client'

import {
  BookOpen,
  Coffee,
  Dumbbell,
  Film,
  Gamepad2,
  MapPin,
  Music2,
  PawPrint,
  Plane,
  Star,
  Trophy,
  Utensils,
} from 'lucide-react'
import type { PublicProfileLife } from '@/types'

interface LifeRowDef {
  icon: React.ReactNode
  label: string
  chips?: string[]
  value?: string
}

function LifeSection({
  label,
  rows,
}: {
  label: string
  rows: LifeRowDef[]
}) {
  const visible = rows.filter((r) => (r.chips?.length ?? 0) > 0 || !!r.value)
  if (!visible.length) return null

  return (
    <div>
      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <div className="surface-card-soft">
        {visible.map((row, i) => (
          <div
            key={row.label}
            className={`px-4 py-4${i < visible.length - 1 ? ' border-b border-[var(--color-border-soft)]' : ''}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
              <span className="text-[var(--color-text-secondary)]">{row.icon}</span>
              <span>{row.label}</span>
            </div>
            {row.chips && row.chips.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {row.chips.map((chip) => (
                  <span key={chip} className="chip-metric">{chip}</span>
                ))}
              </div>
            )}
            {row.value && (
              <p className="mt-2 text-[14px] font-semibold text-[var(--color-text-primary)]">{row.value}</p>
            )}
          </div>
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

  const petText = life.daily.petName
    ? `${life.daily.pet} · ${life.daily.petName}`
    : life.daily.pet

  return (
    <div className="px-5 pt-6 pb-8 space-y-6">
      <LifeSection
        label="일상"
        rows={[
          { icon: <Dumbbell size={13} />, label: '운동', chips: life.daily.exercise },
          { icon: <PawPrint size={13} />, label: '반려동물', value: petText },
        ]}
      />

      <LifeSection
        label="미디어"
        rows={[
          { icon: <Film size={13} />, label: '영화 · 드라마', chips: life.tastes.movies },
          { icon: <Music2 size={13} />, label: '음악', chips: life.tastes.music },
          { icon: <BookOpen size={13} />, label: '책', chips: life.tastes.books },
          { icon: <Gamepad2 size={13} />, label: '게임', chips: life.tastes.games },
        ]}
      />

      <LifeSection
        label="라이프스타일"
        rows={[
          { icon: <Trophy size={13} />, label: '스포츠', chips: life.tastes.sports },
          { icon: <Star size={13} />, label: '최애', chips: life.tastes.celebrities },
          { icon: <Utensils size={13} />, label: '식단', value: life.tastes.diet },
        ]}
      />

      <LifeSection
        label="장소"
        rows={[
          { icon: <Utensils size={13} />, label: '맛집', chips: life.tastes.restaurants },
          { icon: <Coffee size={13} />, label: '카페', chips: life.tastes.cafes },
          { icon: <MapPin size={13} />, label: '자주 가는 곳', chips: life.places.neighborhoods },
          { icon: <Plane size={13} />, label: '여행지', chips: life.places.travelDestinations },
        ]}
      />
    </div>
  )
}
