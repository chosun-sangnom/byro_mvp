'use client'

import type { LifeMediaItem, PublicProfileLife } from '@/types'

function MicroLabel({ label }: { label: string }) {
  return (
    <p className="px-5 text-[10px] text-[var(--color-text-tertiary)]">{label}</p>
  )
}

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

function ChipGroup({ chips }: { chips: string[] }) {
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 px-5">
      {chips.map((chip) => (
        <span key={chip} className="chip-metric">{chip}</span>
      ))}
    </div>
  )
}

function LabeledItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <MicroLabel label={label} />
      {children}
    </div>
  )
}

export function PublicProfileLifeSection({ life }: { life?: PublicProfileLife }) {
  if (!life) return null

  return (
    <div className="space-y-6 pb-8 pt-6">
      {life.daily.exercise.length > 0 && (
        <LabeledItem label="운동">
          <ChipGroup chips={life.daily.exercise} />
        </LabeledItem>
      )}
      {(life.tastes.teams?.length ?? 0) > 0 && (
        <LabeledItem label="응원하는 팀">
          <ChipGroup chips={life.tastes.teams!} />
        </LabeledItem>
      )}
      {life.tastes.movies.length > 0 && (
        <LabeledItem label="영화">
          <MediaScroll items={life.tastes.movies} aspect="portrait" />
        </LabeledItem>
      )}
      {life.tastes.music.length > 0 && (
        <LabeledItem label="음악">
          <MediaScroll items={life.tastes.music} aspect="square" />
        </LabeledItem>
      )}
      {life.tastes.books.length > 0 && (
        <LabeledItem label="책">
          <MediaScroll items={life.tastes.books} aspect="portrait" />
        </LabeledItem>
      )}
      {(life.tastes.plays?.length ?? 0) > 0 && (
        <LabeledItem label="연극">
          <MediaScroll items={life.tastes.plays!} aspect="portrait" />
        </LabeledItem>
      )}
      {life.tastes.restaurants.length > 0 && (
        <LabeledItem label="맛집">
          <PlaceScroll items={life.tastes.restaurants} />
        </LabeledItem>
      )}
      {life.tastes.cafes.length > 0 && (
        <LabeledItem label="카페">
          <PlaceScroll items={life.tastes.cafes} />
        </LabeledItem>
      )}
      {life.places.travelDestinations.length > 0 && (
        <LabeledItem label="여행지">
          <ChipGroup chips={life.places.travelDestinations} />
        </LabeledItem>
      )}
    </div>
  )
}
