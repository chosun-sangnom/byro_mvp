'use client'

import type { LifeMediaItem, PublicProfileLife } from '@/types'

function BlockHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 pb-3 pt-6">
      <span className="text-[12px] font-black uppercase tracking-[0.12em] text-[var(--color-text-primary)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--color-border-default)]" />
    </div>
  )
}

function MediaScroll({ items, aspect = 'portrait' }: { items: LifeMediaItem[]; aspect?: 'portrait' | 'square' }) {
  if (!items.length) return null
  const h = aspect === 'portrait' ? 112 : 84

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => (
          <div key={item.label} className="w-20 flex-shrink-0">
            <div className="overflow-hidden rounded-[12px] bg-[var(--color-bg-muted)]" style={{ height: h }}>
              {item.posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.posterUrl} alt={item.label} className="h-full w-full object-cover" />
              )}
            </div>
            <p className="mt-1.5 truncate text-[11px] font-semibold leading-snug text-[var(--color-text-primary)]">
              {item.label}
            </p>
            {item.sublabel && (
              <p className="truncate text-[10px] leading-snug text-[var(--color-text-tertiary)]">
                {item.sublabel}
              </p>
            )}
          </div>
        ))}
        <div className="w-2 flex-shrink-0" />
      </div>
    </div>
  )
}

function PlaceScroll({ items }: { items: LifeMediaItem[] }) {
  if (!items.length) return null

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => (
          <div key={item.label} className="w-[140px] flex-shrink-0">
            <div className="h-[88px] overflow-hidden rounded-[12px] bg-[var(--color-bg-muted)]">
              {item.posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.posterUrl} alt={item.label} className="h-full w-full object-cover" />
              )}
            </div>
            <p className="mt-1.5 truncate text-[12px] font-semibold text-[var(--color-text-primary)]">
              {item.label}
            </p>
            {item.sublabel && (
              <p className="truncate text-[10px] text-[var(--color-text-tertiary)]">{item.sublabel}</p>
            )}
          </div>
        ))}
        <div className="w-2 flex-shrink-0" />
      </div>
    </div>
  )
}

function ChipRow({ chips }: { chips: string[] }) {
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 px-5">
      {chips.map((chip) => (
        <span key={chip} className="chip-metric">{chip}</span>
      ))}
    </div>
  )
}

export function PublicProfileLifeSection({ life }: { life?: PublicProfileLife }) {
  if (!life) return null

  const activityChips = [...(life.daily.exercise ?? []), ...(life.tastes.teams ?? [])]
  const hasActivity = activityChips.length > 0

  const hasCulture =
    life.tastes.movies.length > 0 ||
    life.tastes.music.length > 0 ||
    life.tastes.books.length > 0 ||
    (life.tastes.plays?.length ?? 0) > 0

  const portraitItems = [
    ...life.tastes.movies,
    ...life.tastes.books,
    ...(life.tastes.plays ?? []),
  ]

  const placeItems = [...life.tastes.restaurants, ...life.tastes.cafes]
  const hasPlace = placeItems.length > 0 || life.places.travelDestinations.length > 0

  return (
    <div className="pb-10 pt-2">

      {hasActivity && (
        <>
          <BlockHeader label="활동" />
          <ChipRow chips={activityChips} />
        </>
      )}

      {hasCulture && (
        <>
          <BlockHeader label="문화" />
          {portraitItems.length > 0 && <MediaScroll items={portraitItems} aspect="portrait" />}
          {life.tastes.music.length > 0 && (
            <div className={portraitItems.length > 0 ? 'mt-3' : ''}>
              <MediaScroll items={life.tastes.music} aspect="square" />
            </div>
          )}
        </>
      )}

      {hasPlace && (
        <>
          <BlockHeader label="장소" />
          <PlaceScroll items={placeItems} />
          {life.places.travelDestinations.length > 0 && (
            <div className="mt-3">
              <ChipRow chips={life.places.travelDestinations} />
            </div>
          )}
        </>
      )}

    </div>
  )
}
