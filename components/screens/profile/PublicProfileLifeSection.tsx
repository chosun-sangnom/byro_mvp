'use client'

import {
  Dumbbell,
  Gamepad2,
  MapPin,
  PawPrint,
  Plane,
  Star,
  Trophy,
  Utensils,
} from 'lucide-react'
import type { LifeMediaItem, PublicProfileLife } from '@/types'

// ─── Primitives ──────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-3 px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
      {label}
    </p>
  )
}

// ─── Media card horizontal scroll ────────────────────────────
// Used for movies, music, books — portrait (80×112) or square (80×80)

function MediaScroll({
  items,
  aspect = 'portrait',
}: {
  items: LifeMediaItem[]
  aspect?: 'portrait' | 'square'
}) {
  if (!items.length) return null
  const h = aspect === 'portrait' ? 112 : 80

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => (
          <div key={item.label} className="w-20 flex-shrink-0">
            <div
              className="overflow-hidden rounded-[12px] bg-[var(--color-bg-muted)]"
              style={{ height: h }}
            >
              {item.posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.posterUrl}
                  alt={item.label}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {item.sublabel && (
              <p className="mt-1.5 truncate text-[10px] leading-snug text-[var(--color-text-tertiary)]">
                {item.sublabel}
              </p>
            )}
            <p className={`truncate text-[11px] font-semibold leading-snug text-[var(--color-text-primary)] ${item.sublabel ? '' : 'mt-1.5'}`}>
              {item.label}
            </p>
          </div>
        ))}
        <div className="w-3 flex-shrink-0" />
      </div>
    </div>
  )
}

// ─── Place card horizontal scroll ────────────────────────────
// Used for restaurants, cafes — landscape (148×96)

function PlaceScroll({ items }: { items: LifeMediaItem[] }) {
  if (!items.length) return null

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => (
          <div key={item.label} className="w-[148px] flex-shrink-0">
            <div className="h-[96px] overflow-hidden rounded-[14px] bg-[var(--color-bg-muted)]">
              {item.posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.posterUrl}
                  alt={item.label}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {item.sublabel && (
              <p className="mt-1.5 text-[10px] text-[var(--color-text-tertiary)]">{item.sublabel}</p>
            )}
            <p className={`truncate text-[12px] font-semibold text-[var(--color-text-primary)] ${item.sublabel ? '' : 'mt-1.5'}`}>
              {item.label}
            </p>
          </div>
        ))}
        <div className="w-3 flex-shrink-0" />
      </div>
    </div>
  )
}

// ─── Badge-style row card ─────────────────────────────────────
// Used for items without images — exercise, sports, celebrities, diet, places

interface LifeRowDef {
  icon: React.ReactNode
  label: string
  chips?: string[]
  value?: string
}

function LifeSection({ rows }: { rows: LifeRowDef[] }) {
  const visible = rows.filter((r) => (r.chips?.length ?? 0) > 0 || !!r.value)
  if (!visible.length) return null

  return (
    <div className="surface-card-soft mx-5">
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
  )
}

// ─── Main ─────────────────────────────────────────────────────

export function PublicProfileLifeSection({ life }: { life?: PublicProfileLife }) {
  if (!life) return null

  const petText = life.daily.petName
    ? `${life.daily.pet} · ${life.daily.petName}`
    : life.daily.pet

  return (
    <div className="space-y-7 pb-8 pt-6">
      {/* 일상 */}
      {(life.daily.exercise.length > 0 || !!life.daily.pet) && (
        <div>
          <SectionLabel label="일상" />
          <LifeSection
            rows={[
              { icon: <Dumbbell size={13} />, label: '운동', chips: life.daily.exercise },
              { icon: <PawPrint size={13} />, label: '반려동물', value: petText },
            ]}
          />
        </div>
      )}

      {/* 영화·드라마 */}
      {life.tastes.movies.length > 0 && (
        <div>
          <SectionLabel label="영화 · 드라마" />
          <MediaScroll items={life.tastes.movies} aspect="portrait" />
        </div>
      )}

      {/* 음악 */}
      {life.tastes.music.length > 0 && (
        <div>
          <SectionLabel label="음악" />
          <MediaScroll items={life.tastes.music} aspect="square" />
        </div>
      )}

      {/* 책 */}
      {life.tastes.books.length > 0 && (
        <div>
          <SectionLabel label="책" />
          <MediaScroll items={life.tastes.books} aspect="portrait" />
        </div>
      )}

      {/* 라이프스타일 */}
      {(life.tastes.sports.length > 0 || life.tastes.games.length > 0 || life.tastes.celebrities.length > 0 || !!life.tastes.diet) && (
        <div>
          <SectionLabel label="라이프스타일" />
          <LifeSection
            rows={[
              { icon: <Trophy size={13} />, label: '스포츠', chips: life.tastes.sports },
              { icon: <Gamepad2 size={13} />, label: '게임', chips: life.tastes.games },
              { icon: <Star size={13} />, label: '최애', chips: life.tastes.celebrities },
              { icon: <Utensils size={13} />, label: '식단', value: life.tastes.diet },
            ]}
          />
        </div>
      )}

      {/* 맛집 */}
      {life.tastes.restaurants.length > 0 && (
        <div>
          <SectionLabel label="맛집" />
          <PlaceScroll items={life.tastes.restaurants} />
        </div>
      )}

      {/* 카페 */}
      {life.tastes.cafes.length > 0 && (
        <div>
          <SectionLabel label="카페" />
          <PlaceScroll items={life.tastes.cafes} />
        </div>
      )}

      {/* 장소 */}
      {(life.places.neighborhoods.length > 0 || life.places.travelDestinations.length > 0) && (
        <div>
          <SectionLabel label="장소" />
          <LifeSection
            rows={[
              { icon: <MapPin size={13} />, label: '자주 가는 곳', chips: life.places.neighborhoods },
              { icon: <Plane size={13} />, label: '여행지', chips: life.places.travelDestinations },
            ]}
          />
        </div>
      )}
    </div>
  )
}
