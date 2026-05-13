'use client'

import { PawPrint } from 'lucide-react'
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

function SubHeader({ label }: { label: string }) {
  return (
    <p className="mb-2 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
      {label}
    </p>
  )
}


function PetCard({ pet, petName, petImage }: { pet: string; petName?: string; petImage?: string }) {
  return (
    <div className="mx-5 mt-2 mb-2 rounded-[22px] border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-4 py-4">
      <div className="flex items-center gap-3">
        {petImage ? (
          <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
        </div>
      </div>
    </div>
  )
}

export function PublicProfileLifeSection({ life }: { life?: PublicProfileLife }) {
  if (!life) return null

  const pet = life.daily.pet
  const hasPet = Boolean(pet && pet !== '없음')
  const exercise = life.daily.exercise ?? []
  const teams = life.tastes.teams ?? []
  const hasActivity = exercise.length > 0 || teams.length > 0

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

      {hasPet && (
        <PetCard
          pet={pet ?? ''}
          petName={life.daily.petName}
          petImage={life.daily.petImage}
        />
      )}

      {hasActivity && (
        <>
          <BlockHeader label="활동" />
          {exercise.length > 0 && (
            <div className="mb-3">
              <SubHeader label="운동" />
              <MediaScroll items={exercise} aspect="square" />
            </div>
          )}
          {teams.length > 0 && (
            <div>
              <SubHeader label="스포츠팀" />
              <MediaScroll items={teams} aspect="square" />
            </div>
          )}
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
              <PlaceScroll items={life.places.travelDestinations} />
            </div>
          )}
        </>
      )}

    </div>
  )
}
