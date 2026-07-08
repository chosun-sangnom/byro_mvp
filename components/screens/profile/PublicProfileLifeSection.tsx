'use client'

import { createPortal } from 'react-dom'
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import type { LifeMediaItem, PublicProfileLife } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type AspectType = 'portrait' | 'square' | 'place'

type VibeItem = LifeMediaItem & {
  category: string
  aspectType: AspectType
  isMusic: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type GridSlot = { col: string; row: string }
type LayoutPattern = {
  columns: string
  rows: string
  slots: [GridSlot, GridSlot, GridSlot, GridSlot, GridSlot, GridSlot]
}

const LAYOUTS: LayoutPattern[] = [
  {
    // 좌측 tall
    columns: '3fr 2fr 2fr',
    rows: '2fr 3fr 2fr',
    slots: [
      { col: '1', row: '1 / 3' },
      { col: '2 / 4', row: '1' },
      { col: '2', row: '2' },
      { col: '3', row: '2' },
      { col: '2 / 4', row: '3' },
      { col: '1', row: '3' },
    ],
  },
  {
    // 우측 tall
    columns: '2fr 2fr 3fr',
    rows: '2fr 3fr 2fr',
    slots: [
      { col: '3', row: '1 / 3' },
      { col: '1 / 3', row: '1' },
      { col: '1', row: '2' },
      { col: '2', row: '2' },
      { col: '1 / 3', row: '3' },
      { col: '3', row: '3' },
    ],
  },
  {
    // 상단 파노라마
    columns: '1fr 1fr 1fr',
    rows: '4fr 3fr 3fr',
    slots: [
      { col: '1 / 4', row: '1' },
      { col: '1', row: '2' },
      { col: '2', row: '2' },
      { col: '3', row: '2' },
      { col: '1 / 3', row: '3' },
      { col: '3', row: '3' },
    ],
  },
  {
    // 좌측 하단 tall
    columns: '3fr 2fr 2fr',
    rows: '2fr 2fr 3fr',
    slots: [
      { col: '1', row: '2 / 4' },
      { col: '1', row: '1' },
      { col: '2 / 4', row: '1' },
      { col: '2', row: '2' },
      { col: '3', row: '2' },
      { col: '2 / 4', row: '3' },
    ],
  },
]

function buildVibeItemsRandom(life: PublicProfileLife): VibeItem[] {
  const candidates: VibeItem[] = []

  const pet = life.daily.pet
  if (pet && pet !== '없음') {
    candidates.push({
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
    [life.tastes.restaurants, '맛집', 'place', false],
    [life.tastes.cafes, '카페', 'place', false],
  ]

  // 카테고리당 1개 랜덤 뽑기 (이미지 있는 것 우선)
  for (const [arr, category, aspectType, isMusic] of sources) {
    if (!arr.length) continue
    const withImage = arr.filter((item) => item.posterUrl)
    const pool = withImage.length > 0 ? withImage : arr
    const picked = pool[Math.floor(Math.random() * pool.length)]
    candidates.push({ ...picked, category, aspectType, isMusic })
  }

  // Fisher-Yates 셔플
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  return candidates.slice(0, 6)
}

function getItemId(item: LifeMediaItem) {
  return item.label + (item.sublabel ?? '')
}


const CATEGORY_COLORS: Record<string, string> = {
  영화: '#3B82F6',
  음악: '#22C55E',
  책: '#F59E0B',
  뮤지컬: '#A855F7',
  운동: '#EF4444',
  맛집: '#EC4899',
  카페: '#92400E',
  반려동물: '#FB923C',
}

// ─── Vibe Board ───────────────────────────────────────────────────────────────

function VibeCard({
  item,
  playingId,
  isPlaying,
  onMusicToggle,
}: {
  item: VibeItem
  playingId: string | null
  isPlaying: boolean
  onMusicToggle: (item: LifeMediaItem) => void
}) {
  const id = getItemId(item)
  const active = item.isMusic && playingId === id
  const color = CATEGORY_COLORS[item.category] ?? 'var(--color-accent-dark)'

  const inner = (
    // 카드가 그리드 셀을 꽉 채우도록 h-full w-full 사용
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {item.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.posterUrl}
          alt={item.label}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: `${color}18` }} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div
        className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: `${color}CC` }}
      >
        {item.category}
      </div>

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
                  style={{ height: 10, animation: 'musicBar 0.8s ease-in-out infinite', animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
      <button className="h-full w-full text-left" onClick={() => onMusicToggle(item)}>
        {inner}
      </button>
    )
  }

  return <div className="h-full">{inner}</div>
}

function VibeBoard({
  items,
  layout,
  playingId,
  isPlaying,
  onMusicToggle,
}: {
  items: VibeItem[]
  layout: LayoutPattern
  playingId: string | null
  isPlaying: boolean
  onMusicToggle: (item: LifeMediaItem) => void
}) {
  if (items.length === 0) return null

  return (
    <div className="px-4 pt-4 pb-2">
      <div
        className="grid w-full gap-1.5"
        style={{
          aspectRatio: '1/1',
          gridTemplateColumns: layout.columns,
          gridTemplateRows: layout.rows,
        }}
      >
        {items.map((item, i) => (
          <div key={i} style={{ gridColumn: layout.slots[i].col, gridRow: layout.slots[i].row }}>
            <VibeCard item={item} playingId={playingId} isPlaying={isPlaying} onMusicToggle={onMusicToggle} />
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
    <div className="fixed inset-x-0 bottom-20 z-50 px-4">
      <div
        className="mx-auto w-full max-w-[430px] overflow-hidden rounded-2xl shadow-xl"
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const [{ vibeItems, vibeLayout }] = useState(() => ({
    vibeItems: life ? buildVibeItemsRandom(life) : [],
    vibeLayout: LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)],
  }))

  if (!life) return null

  const exercise = life.daily.exercise ?? []
  const pet = life.daily.pet
  const hasPet = !!pet && pet !== '없음'
  const hasActivity = exercise.length > 0 || hasPet
  const hasCulture =
    life.tastes.movies.length > 0 ||
    life.tastes.music.length > 0 ||
    life.tastes.books.length > 0 ||
    (life.tastes.plays?.length ?? 0) > 0
  const placeItems = [...life.tastes.restaurants, ...life.tastes.cafes]
  const hasPlace = placeItems.length > 0

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

      <BlockHeader label="바이브보드" />
      <VibeBoard
        items={vibeItems}
        layout={vibeLayout}
        playingId={playingId}
        isPlaying={isPlaying}
        onMusicToggle={handleMusicToggle}
      />

      {(hasActivity || hasCulture || hasPlace) && <SectionDivider />}

      {hasActivity && (
        <>
          <BlockHeader label="활동" />
          {exercise.length > 0 && (
            <div className={hasPet ? 'mb-4' : undefined}>
              <SubHeader label="운동" />
              <SquareScroll items={exercise} />
            </div>
          )}
          {hasPet && (
            <div>
              <SubHeader label="반려동물" />
              <SquareScroll
                items={[
                  {
                    label: life.daily.petName ?? pet,
                    sublabel: life.daily.petName ? pet : undefined,
                    posterUrl: life.daily.petImage,
                  },
                ]}
              />
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
            <div>
              <SubHeader label="카페" />
              <PlaceScroll items={life.tastes.cafes} />
            </div>
          )}
        </>
      )}

      {life.albumPhotos && life.albumPhotos.length > 0 && (
        <>
          <SectionDivider />
          <BlockHeader label="앨범" />
          <div className="px-5 pb-6">
            <div className="grid grid-cols-3 gap-1.5">
              {life.albumPhotos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="aspect-square overflow-hidden rounded-xl bg-[var(--color-bg-muted)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`사진 ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {lightboxIndex !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
          onClick={() => setLightboxIndex(null)}
        >
          <div className="flex items-center justify-end px-4 pt-4 pb-2">
            <button
              onClick={() => setLightboxIndex(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <X size={18} className="text-white" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxIndex((i) => i !== null && i > 0 ? i - 1 : i)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              aria-label="이전"
            >
              <ChevronLeft size={22} className="text-white" />
            </button>
            <div className="mx-3 flex-1 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={life.albumPhotos?.[lightboxIndex] ?? ''}
                alt={`사진 ${lightboxIndex + 1}`}
                className="max-h-[70vh] w-full rounded-2xl object-contain"
              />
            </div>
            <button
              onClick={() => setLightboxIndex((i) => i !== null && life.albumPhotos && i < life.albumPhotos.length - 1 ? i + 1 : i)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              aria-label="다음"
            >
              <ChevronRight size={22} className="text-white" />
            </button>
          </div>
          <div className="pb-8 text-center text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {(lightboxIndex ?? 0) + 1} / {life.albumPhotos?.length ?? 0}
          </div>
        </div>,
        document.body
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
