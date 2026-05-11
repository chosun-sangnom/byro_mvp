'use client'

import type { LifeMediaItem, PublicProfileLife } from '@/types'

function BlockHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 pb-1 pt-6">
      <span className="text-[12px] font-black uppercase tracking-[0.12em] text-[var(--color-text-primary)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--color-border-default)]" />
    </div>
  )
}

function SubHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 px-5 pb-0.5 pt-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
      {count != null && count > 0 && (
        <span className="text-[10px] text-[var(--color-text-tertiary)] opacity-50">{count}</span>
      )}
    </div>
  )
}

function ArchiveRow({
  item,
  shape,
  isLast,
}: {
  item: LifeMediaItem
  shape: 'portrait' | 'square' | 'landscape'
  isLast: boolean
}) {
  const dims =
    shape === 'portrait'
      ? { w: 40, h: 56 }
      : shape === 'landscape'
        ? { w: 64, h: 44 }
        : { w: 44, h: 44 }

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 ${
        !isLast ? 'border-b border-[var(--color-border-soft)]' : ''
      }`}
    >
      <div
        className="flex-shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-bg-muted)]"
        style={{ width: dims.w, height: dims.h }}
      >
        {item.posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.posterUrl} alt={item.label} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
          {item.label}
        </p>
        {item.sublabel && (
          <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-tertiary)]">
            {item.sublabel}
          </p>
        )}
      </div>
    </div>
  )
}

function ArchiveBlock({ items, shape }: { items: LifeMediaItem[]; shape: 'portrait' | 'square' | 'landscape' }) {
  if (!items.length) return null
  return (
    <>
      {items.map((item, i) => (
        <ArchiveRow key={item.label} item={item} shape={shape} isLast={i === items.length - 1} />
      ))}
    </>
  )
}

function ChipRow({ chips }: { chips: string[] }) {
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 px-5 py-3">
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

  const hasPlace =
    life.tastes.restaurants.length > 0 ||
    life.tastes.cafes.length > 0 ||
    life.places.travelDestinations.length > 0

  return (
    <div className="pb-10 pt-2">

      {/* 활동 */}
      {hasActivity && (
        <>
          <BlockHeader label="활동" />
          <ChipRow chips={activityChips} />
        </>
      )}

      {/* 문화 */}
      {hasCulture && (
        <>
          <BlockHeader label="문화" />
          {life.tastes.movies.length > 0 && (
            <>
              <SubHeader label="영화" count={life.tastes.movies.length} />
              <ArchiveBlock items={life.tastes.movies} shape="portrait" />
            </>
          )}
          {life.tastes.music.length > 0 && (
            <>
              <SubHeader label="음악" count={life.tastes.music.length} />
              <ArchiveBlock items={life.tastes.music} shape="square" />
            </>
          )}
          {life.tastes.books.length > 0 && (
            <>
              <SubHeader label="책" count={life.tastes.books.length} />
              <ArchiveBlock items={life.tastes.books} shape="portrait" />
            </>
          )}
          {(life.tastes.plays?.length ?? 0) > 0 && (
            <>
              <SubHeader label="공연" count={life.tastes.plays!.length} />
              <ArchiveBlock items={life.tastes.plays!} shape="portrait" />
            </>
          )}
        </>
      )}

      {/* 장소 */}
      {hasPlace && (
        <>
          <BlockHeader label="장소" />
          {life.tastes.restaurants.length > 0 && (
            <>
              <SubHeader label="맛집" count={life.tastes.restaurants.length} />
              <ArchiveBlock items={life.tastes.restaurants} shape="landscape" />
            </>
          )}
          {life.tastes.cafes.length > 0 && (
            <>
              <SubHeader label="카페" count={life.tastes.cafes.length} />
              <ArchiveBlock items={life.tastes.cafes} shape="landscape" />
            </>
          )}
          {life.places.travelDestinations.length > 0 && (
            <>
              <SubHeader label="여행" count={life.places.travelDestinations.length} />
              <ChipRow chips={life.places.travelDestinations} />
            </>
          )}
        </>
      )}

    </div>
  )
}
