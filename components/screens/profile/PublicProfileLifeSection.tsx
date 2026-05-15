'use client'

import { useRef, useState } from 'react'
import { Pause, Play, X } from 'lucide-react'
import type { LifeMediaItem, PublicProfileLife } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type AspectType = 'portrait' | 'square' | 'place'

type VibeItem = LifeMediaItem & {
  category: string
  aspectType: AspectType
  isMusic: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildVibeItems(life: PublicProfileLife): VibeItem[] {
  const result: VibeItem[] = []

  const pet = life.daily.pet
  if (pet && pet !== '없음') {
    result.push({
      label: life.daily.petName ?? pet,
      sublabel: life.daily.petName ? pet : undefined,
      posterUrl: life.daily.petImage,
      category: '반려동물',
      aspectType: 'square',
      isMusic: false,
    })
  }

  const sources: [LifeMediaItem[], string, AspectType, boolean][] = [
    [life.tastes.movies, '영화', 'portrait', false],
    [life.tastes.music, '음악', 'square', true],
    [life.tastes.books, '책', 'portrait', false],
    [life.tastes.plays ?? [], '뮤지컬', 'portrait', false],
    [life.daily.exercise, '운동', 'square', false],
    [life.tastes.teams ?? [], '스포츠팀', 'square', false],
    [life.tastes.restaurants, '맛집', 'place', false],
    [life.tastes.cafes, '카페', 'place', false],
    [life.places.travelDestinations, '여행지', 'place', false],
  ]

  const maxLen = Math.max(...sources.map(([arr]) => arr.length), 0)

  for (let i = 0; i < maxLen; i++) {
    for (const [arr, category, aspectType, isMusic] of sources) {
      if (arr[i]) result.push({ ...arr[i], category, aspectType, isMusic })
    }
  }

  return result
}

function getItemId(item: LifeMediaItem) {
  return item.label + (item.sublabel ?? '')
}

const ASPECT_CLASS: Record<AspectType, string> = {
  portrait: 'aspect-[2/3]',
  square: 'aspect-square',
  place: 'aspect-[4/3]',
}

const CATEGORY_COLORS: Record<string, string> = {
  영화: '#3B82F6',
  음악: '#22C55E',
  책: '#F59E0B',
  뮤지컬: '#A855F7',
  운동: '#EF4444',
  스포츠팀: '#F97316',
  맛집: '#EC4899',
  카페: '#92400E',
  여행지: '#0D9488',
  반려동물: '#FB923C',
}

// ─── Vibe Board ───────────────────────────────────────────────────────────────

function VibeCard({
  item,
  aspectClass,
  playingId,
  isPlaying,
  onMusicToggle,
}: {
  item: VibeItem
  aspectClass: string
  playingId: string | null
  isPlaying: boolean
  onMusicToggle: (item: LifeMediaItem) => void
}) {
  const id = getItemId(item)
  const active = item.isMusic && playingId === id
  const color = CATEGORY_COLORS[item.category] ?? 'var(--color-accent-dark)'

  const inner = (
    <div className={`relative w-full overflow-hidden rounded-2xl ${aspectClass}`}>
      {item.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.posterUrl}
          alt={item.label}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${color}18` }}
        />
      )}

      {/* gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* category badge */}
      <div
        className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: `${color}CC` }}
      >
        {item.category}
      </div>

      {/* music play overlay */}
      {item.isMusic && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: active ? `${color}DD` : 'rgba(0,0,0,0.45)' }}
          >
            {active && isPlaying ? (
              <Pause size={16} className="text-white" />
            ) : (
              <Play size={16} className="translate-x-0.5 text-white" />
            )}
          </div>
          {active && isPlaying && (
            <div className="absolute bottom-8 flex justify-center gap-[3px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-white"
                  style={{
                    height: 10,
                    animation: 'musicBar 0.8s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* label */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="truncate text-[12px] font-semibold leading-tight text-white drop-shadow">
          {item.label}
        </p>
        {item.sublabel && (
          <p className="truncate text-[10px] text-white/70">{item.sublabel}</p>
        )}
      </div>
    </div>
  )

  if (item.isMusic) {
    return (
      <button className="w-full text-left" onClick={() => onMusicToggle(item)}>
        {inner}
      </button>
    )
  }

  return <div>{inner}</div>
}

type CardSlot = { item: VibeItem; colSpan: 1 | 2; aspectClass: string }

function buildCardSlots(items: VibeItem[]): CardSlot[] {
  const slots: CardSlot[] = []
  const GROUP = 5

  for (let g = 0; g < items.length; g += GROUP) {
    const group = items.slice(g, g + GROUP)
    const isOdd = Math.floor(g / GROUP) % 2 === 1

    if (group.length >= 2) {
      const [first, second, ...rest] = group
      // 4:3 큰 카드 + 2:3 세로 카드는 3열 그리드에서 높이가 수학적으로 동일
      if (isOdd) {
        slots.push({ item: second, colSpan: 1, aspectClass: 'aspect-[2/3]' })
        slots.push({ item: first,  colSpan: 2, aspectClass: 'aspect-[4/3]' })
      } else {
        slots.push({ item: first,  colSpan: 2, aspectClass: 'aspect-[4/3]' })
        slots.push({ item: second, colSpan: 1, aspectClass: 'aspect-[2/3]' })
      }
      for (const item of rest) {
        slots.push({ item, colSpan: 1, aspectClass: 'aspect-square' })
      }
    } else {
      slots.push({ item: group[0], colSpan: 2, aspectClass: 'aspect-[4/3]' })
    }
  }

  return slots
}

function VibeBoard({
  items,
  playingId,
  isPlaying,
  onMusicToggle,
}: {
  items: VibeItem[]
  playingId: string | null
  isPlaying: boolean
  onMusicToggle: (item: LifeMediaItem) => void
}) {
  if (items.length === 0) return null

  const slots = buildCardSlots(items)

  return (
    <div className="px-5 pt-4 pb-2">
      <div className="grid grid-cols-3 gap-2">
        {slots.map(({ item, colSpan, aspectClass }) => (
          <div key={getItemId(item) + item.category} className={colSpan === 2 ? 'col-span-2' : 'col-span-1'}>
            <VibeCard
              item={item}
              aspectClass={aspectClass}
              playingId={playingId}
              isPlaying={isPlaying}
              onMusicToggle={onMusicToggle}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section & Sub-category headers ──────────────────────────────────────────

function BlockHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 pb-3 pt-6">
      <span className="text-[13px] font-black uppercase tracking-[0.12em] text-[var(--color-text-primary)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--color-border-default)]" />
    </div>
  )
}

function SubHeader({ label }: { label: string }) {
  return (
    <p className="mb-2.5 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
      {label}
    </p>
  )
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-2">
      <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        전체
      </span>
      <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
    </div>
  )
}

// ─── Scroll rows ──────────────────────────────────────────────────────────────

function PortraitScroll({ items }: { items: LifeMediaItem[] }) {
  if (!items.length) return null
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => (
          <div key={getItemId(item)} className="w-[76px] flex-shrink-0">
            <div className="h-[114px] w-[76px] overflow-hidden rounded-[12px] bg-[var(--color-bg-muted)]">
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

function SquareScroll({ items }: { items: LifeMediaItem[] }) {
  if (!items.length) return null
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => (
          <div key={getItemId(item)} className="w-[76px] flex-shrink-0">
            <div className="h-[76px] w-[76px] overflow-hidden rounded-[12px] bg-[var(--color-bg-muted)]">
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
          <div key={getItemId(item)} className="w-[136px] flex-shrink-0">
            <div className="h-[102px] w-[136px] overflow-hidden rounded-[12px] bg-[var(--color-bg-muted)]">
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

function MusicScroll({
  items,
  playingId,
  isPlaying,
  onToggle,
}: {
  items: LifeMediaItem[]
  playingId: string | null
  isPlaying: boolean
  onToggle: (item: LifeMediaItem) => void
}) {
  if (!items.length) return null
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => {
          const id = getItemId(item)
          const active = playingId === id
          return (
            <div key={id} className="w-[76px] flex-shrink-0">
              <button
                onClick={() => onToggle(item)}
                className="relative h-[76px] w-[76px] overflow-hidden rounded-[12px] bg-[var(--color-bg-muted)]"
              >
                {item.posterUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.posterUrl} alt={item.label} className="h-full w-full object-cover" />
                )}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-[12px]"
                  style={{ backgroundColor: active ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.28)' }}
                >
                  {active && isPlaying ? (
                    <Pause size={20} className="text-white drop-shadow" />
                  ) : (
                    <Play size={20} className="translate-x-0.5 text-white drop-shadow" />
                  )}
                </div>
                {active && isPlaying && (
                  <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-[3px]">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-[3px] rounded-full bg-white"
                        style={{
                          height: 10,
                          animation: 'musicBar 0.8s ease-in-out infinite',
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
              <p className="mt-1.5 truncate text-[11px] font-semibold leading-snug text-[var(--color-text-primary)]">
                {item.label}
              </p>
              {item.sublabel && (
                <p className="truncate text-[10px] leading-snug text-[var(--color-text-tertiary)]">
                  {item.sublabel}
                </p>
              )}
            </div>
          )
        })}
        <div className="w-2 flex-shrink-0" />
      </div>
    </div>
  )
}

// ─── Mini player ──────────────────────────────────────────────────────────────

function MiniPlayer({
  track,
  isPlaying,
  progress,
  onToggle,
  onClose,
}: {
  track: LifeMediaItem
  isPlaying: boolean
  progress: number
  onToggle: () => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 overflow-hidden rounded-2xl shadow-xl"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-default)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="h-0.5 transition-all duration-300"
        style={{ width: `${progress * 100}%`, backgroundColor: 'var(--color-accent-dark)' }}
      />
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg-muted)]">
          {track.posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.posterUrl} alt={track.label} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[var(--color-text-strong)]">{track.label}</p>
          {track.sublabel && (
            <p className="truncate text-[11px] text-[var(--color-text-tertiary)]">{track.sublabel}</p>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-accent-dark)' }}
        >
          {isPlaying ? <Pause size={15} className="text-white" /> : <Play size={15} className="translate-x-0.5 text-white" />}
        </button>
        <button onClick={onClose} className="flex-shrink-0 p-1">
          <X size={16} className="text-[var(--color-text-tertiary)]" />
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PublicProfileLifeSection({ life }: { life?: PublicProfileLife }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [playingTrack, setPlayingTrack] = useState<LifeMediaItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  if (!life) return null

  const exercise = life.daily.exercise ?? []
  const teams = life.tastes.teams ?? []
  const hasActivity = exercise.length > 0 || teams.length > 0
  const hasCulture =
    life.tastes.movies.length > 0 ||
    life.tastes.music.length > 0 ||
    life.tastes.books.length > 0 ||
    (life.tastes.plays?.length ?? 0) > 0
  const placeItems = [...life.tastes.restaurants, ...life.tastes.cafes]
  const hasPlace = placeItems.length > 0 || life.places.travelDestinations.length > 0

  const vibeItems = buildVibeItems(life)

  const handleMusicToggle = (item: LifeMediaItem) => {
    const id = getItemId(item)
    const audio = audioRef.current
    if (!audio) return

    if (playingId === id) {
      if (isPlaying) { audio.pause(); setIsPlaying(false) }
      else { audio.play(); setIsPlaying(true) }
      return
    }

    audio.src = item.previewUrl ?? ''
    audio.currentTime = 0
    setPlayingId(id)
    setPlayingTrack(item)
    setProgress(0)
    audio.play().then(() => setIsPlaying(true)).catch(() => {})
  }

  const handleClose = () => {
    audioRef.current?.pause()
    setPlayingId(null)
    setPlayingTrack(null)
    setIsPlaying(false)
    setProgress(0)
  }

  return (
    <div className="pb-32 pt-2">
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          const audio = audioRef.current
          if (!audio?.duration) return
          setProgress(audio.currentTime / audio.duration)
        }}
        onEnded={() => { setIsPlaying(false); setProgress(1) }}
      />

      <VibeBoard
        items={vibeItems}
        playingId={playingId}
        isPlaying={isPlaying}
        onMusicToggle={handleMusicToggle}
      />

      {(hasActivity || hasCulture || hasPlace) && <SectionDivider />}

      {hasActivity && (
        <>
          <BlockHeader label="활동" />
          {exercise.length > 0 && (
            <div className="mb-4">
              <SubHeader label="운동" />
              <SquareScroll items={exercise} />
            </div>
          )}
          {teams.length > 0 && (
            <div>
              <SubHeader label="스포츠팀" />
              <SquareScroll items={teams} />
            </div>
          )}
        </>
      )}

      {hasCulture && (
        <>
          <BlockHeader label="문화" />
          {life.tastes.movies.length > 0 && (
            <div className="mb-4">
              <SubHeader label="영화" />
              <PortraitScroll items={life.tastes.movies} />
            </div>
          )}
          {life.tastes.music.length > 0 && (
            <div className="mb-4">
              <SubHeader label="음악" />
              <MusicScroll items={life.tastes.music} playingId={playingId} isPlaying={isPlaying} onToggle={handleMusicToggle} />
            </div>
          )}
          {life.tastes.books.length > 0 && (
            <div className="mb-4">
              <SubHeader label="책" />
              <PortraitScroll items={life.tastes.books} />
            </div>
          )}
          {(life.tastes.plays?.length ?? 0) > 0 && (
            <div>
              <SubHeader label="뮤지컬 · 연극" />
              <PortraitScroll items={life.tastes.plays ?? []} />
            </div>
          )}
        </>
      )}

      {hasPlace && (
        <>
          <BlockHeader label="장소" />
          {life.tastes.restaurants.length > 0 && (
            <div className="mb-4">
              <SubHeader label="맛집" />
              <PlaceScroll items={life.tastes.restaurants} />
            </div>
          )}
          {life.tastes.cafes.length > 0 && (
            <div className="mb-4">
              <SubHeader label="카페" />
              <PlaceScroll items={life.tastes.cafes} />
            </div>
          )}
          {life.places.travelDestinations.length > 0 && (
            <div>
              <SubHeader label="여행지" />
              <PlaceScroll items={life.places.travelDestinations} />
            </div>
          )}
        </>
      )}

      {playingTrack && (
        <MiniPlayer
          track={playingTrack}
          isPlaying={isPlaying}
          progress={progress}
          onToggle={() => {
            const audio = audioRef.current
            if (!audio) return
            if (isPlaying) { audio.pause(); setIsPlaying(false) }
            else { audio.play(); setIsPlaying(true) }
          }}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
