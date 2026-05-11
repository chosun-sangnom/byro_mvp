'use client'

import { Dumbbell, Trophy } from 'lucide-react'
import type { LifeMediaItem, PublicProfileLife } from '@/types'

// ─── Primitives ──────────────────────────────────────────────

function ClusterLabel({ label, description }: { label: string; description: string }) {
  return (
    <div className="px-5">
      <p className="text-[13px] font-bold text-[var(--color-text-primary)]">{label}</p>
      <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">{description}</p>
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-2 px-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
      {label}
    </p>
  )
}

// ─── Media card horizontal scroll ────────────────────────────
// portrait (80×112): 영화, 책, 연극 / square (80×80): 음악

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
                <img src={item.posterUrl} alt={item.label} className="h-full w-full object-cover" />
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
// landscape (148×96): 맛집, 카페

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
                <img src={item.posterUrl} alt={item.label} className="h-full w-full object-cover" />
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

// ─── Chip row card ────────────────────────────────────────────

interface ChipRowDef {
  icon: React.ReactNode
  label: string
  chips: string[]
}

function ChipCard({ rows }: { rows: ChipRowDef[] }) {
  const visible = rows.filter((r) => r.chips.length > 0)
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
          <div className="mt-2 flex flex-wrap gap-1.5">
            {row.chips.map((chip) => (
              <span key={chip} className="chip-metric">{chip}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function InlineChips({ chips }: { chips: string[] }) {
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 px-5">
      {chips.map((chip) => (
        <span key={chip} className="chip-metric">{chip}</span>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export function PublicProfileLifeSection({ life }: { life?: PublicProfileLife }) {
  if (!life) return null

  const hasActivity =
    (life.daily.exercise?.length ?? 0) > 0 || (life.tastes.teams?.length ?? 0) > 0
  const hasCulture =
    life.tastes.movies.length > 0 ||
    life.tastes.music.length > 0 ||
    life.tastes.books.length > 0 ||
    (life.tastes.plays?.length ?? 0) > 0
  const hasPlace =
    life.tastes.restaurants.length > 0 ||
    life.tastes.cafes.length > 0 ||
    life.places.travelDestinations.length > 0

  if (!hasActivity && !hasCulture && !hasPlace) return null

  return (
    <div className="space-y-8 pb-8 pt-6">

      {/* 활동 — 같이 할 수 있는 것 */}
      {hasActivity && (
        <div className="space-y-3">
          <ClusterLabel label="활동" description="같이 할 수 있는 것" />
          <ChipCard
            rows={[
              { icon: <Dumbbell size={13} />, label: '운동', chips: life.daily.exercise ?? [] },
              { icon: <Trophy size={13} />, label: '응원하는 팀', chips: life.tastes.teams ?? [] },
            ]}
          />
        </div>
      )}

      {/* 문화 — 같이 이야기할 수 있는 것 */}
      {hasCulture && (
        <div className="space-y-4">
          <ClusterLabel label="문화" description="같이 이야기할 수 있는 것" />
          {life.tastes.movies.length > 0 && (
            <div>
              <SectionLabel label="영화" />
              <MediaScroll items={life.tastes.movies} aspect="portrait" />
            </div>
          )}
          {life.tastes.music.length > 0 && (
            <div>
              <SectionLabel label="음악" />
              <MediaScroll items={life.tastes.music} aspect="square" />
            </div>
          )}
          {life.tastes.books.length > 0 && (
            <div>
              <SectionLabel label="책" />
              <MediaScroll items={life.tastes.books} aspect="portrait" />
            </div>
          )}
          {(life.tastes.plays?.length ?? 0) > 0 && (
            <div>
              <SectionLabel label="연극" />
              <MediaScroll items={life.tastes.plays!} aspect="portrait" />
            </div>
          )}
        </div>
      )}

      {/* 장소 — 같이 갈 수 있는 곳 */}
      {hasPlace && (
        <div className="space-y-4">
          <ClusterLabel label="장소" description="같이 갈 수 있는 곳" />
          {life.tastes.restaurants.length > 0 && (
            <div>
              <SectionLabel label="맛집" />
              <PlaceScroll items={life.tastes.restaurants} />
            </div>
          )}
          {life.tastes.cafes.length > 0 && (
            <div>
              <SectionLabel label="카페" />
              <PlaceScroll items={life.tastes.cafes} />
            </div>
          )}
          {life.places.travelDestinations.length > 0 && (
            <div>
              <SectionLabel label="여행지" />
              <InlineChips chips={life.places.travelDestinations} />
            </div>
          )}
        </div>
      )}

    </div>
  )
}
