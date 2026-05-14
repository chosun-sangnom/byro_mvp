'use client'

import { useRef, useState } from 'react'
import { Pause, PawPrint, Play, X } from 'lucide-react'
import type { LifeMediaItem, PublicProfileLife } from '@/types'

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

// ─── Portrait scroll (영화 · 책 · 뮤지컬 — 2:3) ──────────────────────────────

function PortraitScroll({ items }: { items: LifeMediaItem[] }) {
  if (!items.length) return null
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => (
          <div key={item.label + (item.sublabel ?? '')} className="w-[76px] flex-shrink-0">
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

// ─── Square scroll (운동 · 스포츠팀 — 1:1) ───────────────────────────────────

function SquareScroll({ items }: { items: LifeMediaItem[] }) {
  if (!items.length) return null
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => (
          <div key={item.label + (item.sublabel ?? '')} className="w-[76px] flex-shrink-0">
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

// ─── Place scroll (맛집 · 카페 · 여행지 — 4:3) ───────────────────────────────

function PlaceScroll({ items }: { items: LifeMediaItem[] }) {
  if (!items.length) return null
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-5">
        {items.map((item) => (
          <div key={item.label + (item.sublabel ?? '')} className="w-[136px] flex-shrink-0">
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

// ─── Music scroll (음악 — 1:1 + play button) ─────────────────────────────────

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
          const id = item.label + (item.sublabel ?? '')
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
                  className="absolute inset-0 flex items-center justify-center rounded-[12px] transition-opacity"
                  style={{ backgroundColor: active ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.28)' }}
                >
                  {active && isPlaying ? (
                    <Pause size={22} className="text-white drop-shadow" />
                  ) : (
                    <Play size={22} className="translate-x-0.5 text-white drop-shadow" />
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
                          animation: `musicBar 0.8s ease-in-out infinite`,
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
        style={{
          width: `${progress * 100}%`,
          backgroundColor: 'var(--color-accent-dark)',
        }}
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
          {isPlaying ? (
            <Pause size={15} className="text-white" />
          ) : (
            <Play size={15} className="translate-x-0.5 text-white" />
          )}
        </button>
        <button onClick={onClose} className="flex-shrink-0 p-1">
          <X size={16} className="text-[var(--color-text-tertiary)]" />
        </button>
      </div>
    </div>
  )
}

// ─── Pet card ─────────────────────────────────────────────────────────────────

function PetCard({ pet, petName, petImage }: { pet: string; petName?: string; petImage?: string }) {
  return (
    <div className="mx-5 mt-4 mb-2 rounded-[22px] border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-4 py-4">
      <div className="flex items-center gap-3">
        {petImage ? (
          <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[18px] border border-[var(--color-border-soft)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={petImage} alt={`${petName ?? pet} 사진`} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-bg-muted)]">
            <PawPrint size={24} className="text-[var(--color-text-secondary)]" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">반려동물</div>
          <div className="mt-1 text-[17px] font-semibold text-[var(--color-text-primary)]">
            {petName ? `${pet} · ${petName}` : pet}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function PublicProfileLifeSection({ life }: { life?: PublicProfileLife }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [playingTrack, setPlayingTrack] = useState<LifeMediaItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

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
  const placeItems = [...life.tastes.restaurants, ...life.tastes.cafes]
  const hasPlace = placeItems.length > 0 || life.places.travelDestinations.length > 0

  const handleMusicToggle = (item: LifeMediaItem) => {
    const id = item.label + (item.sublabel ?? '')
    const audio = audioRef.current
    if (!audio) return

    if (playingId === id) {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play()
        setIsPlaying(true)
      }
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
          if (!audio || !audio.duration) return
          setProgress(audio.currentTime / audio.duration)
        }}
        onEnded={() => {
          setIsPlaying(false)
          setProgress(1)
        }}
      />

      {hasPet && (
        <PetCard pet={pet ?? ''} petName={life.daily.petName} petImage={life.daily.petImage} />
      )}

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
              <MusicScroll
                items={life.tastes.music}
                playingId={playingId}
                isPlaying={isPlaying}
                onToggle={handleMusicToggle}
              />
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
