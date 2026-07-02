'use client'

import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Camera, ChevronRight, Plus, X, Zap } from 'lucide-react'
import { Button, NavBar, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { useByroStore } from '@/store/useByroStore'
import type { LifeMediaItem, PublicProfileLife } from '@/types'
import { ExercisePicker } from './ExercisePicker'
import { MusicSearchPicker } from './MusicSearchPicker'
import { MediaSearchPicker } from './MediaSearchPicker'
import { PlacePicker } from './PlacePicker'

// ─── Types ────────────────────────────────────────────────────────────────────

type LifeView = 'hub' | 'pet' | 'activity' | 'culture' | 'place' | 'album'

const PET_OPTIONS = ['없음', '강아지', '고양이', '소형 포유류', '조류', '파충류', '어류', '기타']

const FREE_LIMIT = 5

function countLifeItems(life: PublicProfileLife): number {
  return (
    life.daily.exercise.length +
    life.tastes.movies.length +
    life.tastes.music.length +
    life.tastes.books.length +
    (life.tastes.plays?.length ?? 0) +
    life.tastes.restaurants.length +
    life.tastes.cafes.length
  )
}

// ─── Pro 업그레이드 모달 ───────────────────────────────────────────────────────

function ProUpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <button className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="닫기" />
      <div className="relative w-full rounded-t-3xl bg-[var(--color-bg-surface)] px-6 pt-6 pb-10">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: 'var(--color-accent-dark)' }}
        >
          <Zap size={22} className="text-white" />
        </div>
        <p className="mb-1 text-[18px] font-bold text-[var(--color-text-primary)]">Pro로 업그레이드</p>
        <p className="mb-6 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
          Pro 플랜으로 업그레이드하면 카테고리별 최대 5개씩,
          제한 없이 라이프를 채울 수 있어요.
        </p>
        <Button onClick={onClose}>곧 출시 예정이에요</Button>
        <button
          onClick={onClose}
          className="mt-3 w-full py-2 text-sm text-[var(--color-text-tertiary)]"
        >
          닫기
        </button>
      </div>
    </div>
  )
}

// ─── 슬롯 배너 ────────────────────────────────────────────────────────────────

function SlotBadge({
  remaining,
  onUpgrade,
}: {
  remaining: number
  onUpgrade: () => void
}) {
  return (
    <div className="mx-5 mt-3 flex items-center justify-between rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-4 py-2.5">
      {remaining > 0 ? (
        <span className="text-[12px] font-semibold text-[var(--color-text-secondary)]">
          슬롯 {remaining}개 남음
          <span className="ml-1.5 font-normal text-[var(--color-text-tertiary)]">· Free 플랜</span>
        </span>
      ) : (
        <>
          <span className="text-[12px] font-semibold" style={{ color: 'var(--color-state-danger-text, #ef4444)' }}>
            슬롯이 모두 찼어요
          </span>
          <button
            onClick={onUpgrade}
            className="flex items-center gap-1 text-[12px] font-bold"
            style={{ color: 'var(--color-accent-dark)' }}
          >
            <Zap size={11} />
            Pro 업그레이드
          </button>
        </>
      )}
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SubScreen({
  title,
  onBack,
  onSave,
  children,
  slotBadge,
}: {
  title: string
  onBack: () => void
  onSave: () => void
  children: ReactNode
  slotBadge?: ReactNode
}) {
  return (
    <div className="flex h-full flex-col">
      <NavBar title={title} onBack={onBack} />
      {slotBadge}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">{children}</div>
      <div className="border-t border-[var(--color-border-soft)] px-5 pb-5 pt-3">
        <Button onClick={onSave}>저장</Button>
      </div>
    </div>
  )
}

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold text-[var(--color-text-secondary)]">{label}</p>
      {children}
    </div>
  )
}

// ─── Sub-screens ──────────────────────────────────────────────────────────────

function PetView({
  life,
  onSave,
}: {
  life: PublicProfileLife
  onSave: (daily: PublicProfileLife['daily']) => void
}) {
  const [pet, setPet] = useState(life.daily.pet)
  const [petName, setPetName] = useState(life.daily.petName ?? '')
  const [petImage, setPetImage] = useState(life.daily.petImage ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('이미지 파일만 업로드할 수 있어요'); return }
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === 'string') setPetImage(reader.result) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <SubScreen
      title="반려동물"
      onBack={() => onSave(life.daily)}
      onSave={() => onSave({
        ...life.daily,
        pet,
        petName: pet === '없음' ? undefined : petName.trim() || undefined,
        petImage: pet === '없음' ? undefined : petImage || undefined,
      })}
    >
      <FieldBlock label="종류">
        <div className="flex flex-wrap gap-2">
          {PET_OPTIONS.map((option) => {
            const selected = option === pet
            return (
              <button
                key={option}
                onClick={() => setPet(option)}
                className="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
                style={{
                  borderColor: selected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                  background: selected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                  color: selected ? '#fff' : 'var(--color-text-secondary)',
                }}
              >
                {option}
              </button>
            )
          })}
        </div>
      </FieldBlock>

      {pet !== '없음' && (
        <>
          <FieldBlock label="이름">
            <input
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="예: 몽이"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
          </FieldBlock>

          <FieldBlock label="사진">
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] flex items-center justify-center"
            >
              {petImage
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={petImage} alt="반려동물" className="h-full w-full object-cover" />
                : <Camera size={22} className="text-[var(--color-text-tertiary)]" />
              }
            </button>
            {petImage && (
              <button onClick={() => setPetImage('')} className="mt-2 text-xs text-[var(--color-state-danger-text)]">
                사진 제거
              </button>
            )}
          </FieldBlock>
        </>
      )}
    </SubScreen>
  )
}

function ActivityView({
  life,
  onSave,
  isPro,
  freeSlots,
  onUpgrade,
}: {
  life: PublicProfileLife
  onSave: (daily: PublicProfileLife['daily']) => void
  isPro: boolean
  freeSlots: number
  onUpgrade: () => void
}) {
  const [exercise, setExercise] = useState<LifeMediaItem[]>(life.daily.exercise)

  const exerciseMax = isPro ? 5 : Math.min(5, freeSlots)
  const freeRemaining = isPro ? undefined : Math.max(0, freeSlots - exercise.length)

  return (
    <SubScreen
      title="활동"
      onBack={() => onSave(life.daily)}
      onSave={() => onSave({ ...life.daily, exercise })}
      slotBadge={freeRemaining !== undefined
        ? <SlotBadge remaining={freeRemaining} onUpgrade={onUpgrade} />
        : undefined
      }
    >
      <FieldBlock label="즐기는 운동">
        <ExercisePicker selected={exercise} onChange={setExercise} maxItems={exerciseMax} />
      </FieldBlock>
    </SubScreen>
  )
}

function CultureView({
  life,
  onSave,
  isPro,
  freeSlots,
  onUpgrade,
}: {
  life: PublicProfileLife
  onSave: (tastes: Partial<PublicProfileLife['tastes']>) => void
  isPro: boolean
  freeSlots: number
  onUpgrade: () => void
}) {
  const [movies, setMovies] = useState<LifeMediaItem[]>(life.tastes.movies)
  const [music, setMusic] = useState<LifeMediaItem[]>(life.tastes.music)
  const [books, setBooks] = useState<LifeMediaItem[]>(life.tastes.books)
  const [plays, setPlays] = useState<LifeMediaItem[]>(life.tastes.plays ?? [])

  const totalHere = movies.length + music.length + books.length + plays.length
  const movieMax  = isPro ? 5 : Math.min(5, Math.max(0, freeSlots - (totalHere - movies.length)))
  const musicMax  = isPro ? 5 : Math.min(5, Math.max(0, freeSlots - (totalHere - music.length)))
  const bookMax   = isPro ? 5 : Math.min(5, Math.max(0, freeSlots - (totalHere - books.length)))
  const playMax   = isPro ? 5 : Math.min(5, Math.max(0, freeSlots - (totalHere - plays.length)))
  const freeRemaining = isPro ? undefined : Math.max(0, freeSlots - totalHere)

  return (
    <SubScreen
      title="문화"
      onBack={() => onSave({})}
      onSave={() => onSave({ movies, music, books, plays })}
      slotBadge={freeRemaining !== undefined
        ? <SlotBadge remaining={freeRemaining} onUpgrade={onUpgrade} />
        : undefined
      }
    >
      <FieldBlock label="영화">
        <MediaSearchPicker type="movie" selected={movies} onChange={setMovies} maxItems={movieMax} />
      </FieldBlock>
      <FieldBlock label="음악">
        <MusicSearchPicker selected={music} onChange={setMusic} maxItems={musicMax} />
      </FieldBlock>
      <FieldBlock label="책">
        <MediaSearchPicker type="book" selected={books} onChange={setBooks} maxItems={bookMax} />
      </FieldBlock>
      <FieldBlock label="공연 · 연극">
        <MediaSearchPicker type="play" selected={plays} onChange={setPlays} maxItems={playMax} />
      </FieldBlock>
    </SubScreen>
  )
}

function PlaceView({
  life,
  onSave,
  isPro,
  freeSlots,
  onUpgrade,
}: {
  life: PublicProfileLife
  onSave: (tastes: Partial<PublicProfileLife['tastes']>) => void
  isPro: boolean
  freeSlots: number
  onUpgrade: () => void
}) {
  const [restaurants, setRestaurants] = useState<LifeMediaItem[]>(life.tastes.restaurants)
  const [cafes, setCafes] = useState<LifeMediaItem[]>(life.tastes.cafes)

  const totalHere = restaurants.length + cafes.length
  const restaurantMax = isPro ? 5 : Math.min(5, Math.max(0, freeSlots - (totalHere - restaurants.length)))
  const cafeMax       = isPro ? 5 : Math.min(5, Math.max(0, freeSlots - (totalHere - cafes.length)))
  const freeRemaining = isPro ? undefined : Math.max(0, freeSlots - totalHere)

  return (
    <SubScreen
      title="플레이스"
      onBack={() => onSave({})}
      onSave={() => onSave({ restaurants, cafes })}
      slotBadge={freeRemaining !== undefined
        ? <SlotBadge remaining={freeRemaining} onUpgrade={onUpgrade} />
        : undefined
      }
    >
      <FieldBlock label="맛집">
        <PlacePicker type="restaurant" selected={restaurants} onChange={setRestaurants} maxItems={restaurantMax} />
      </FieldBlock>
      <FieldBlock label="카페">
        <PlacePicker type="cafe" selected={cafes} onChange={setCafes} maxItems={cafeMax} />
      </FieldBlock>
    </SubScreen>
  )
}

function AlbumView({
  life,
  onSave,
}: {
  life: PublicProfileLife
  onSave: (photos: string[]) => void
}) {
  const [photos, setPhotos] = useState<string[]>(life.albumPhotos ?? [])

  return (
    <SubScreen
      title="앨범"
      onBack={() => onSave(life.albumPhotos ?? [])}
      onSave={() => onSave(photos)}
    >
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-[var(--color-bg-muted)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`사진 ${i + 1}`} className="h-full w-full object-cover" />
            <button
              onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}
        {/* [임시] 실제 업로드 미구현 — 최대 9장 */}
        {photos.length < 9 && (
          <button
            onClick={() => showToast('사진 업로드는 준비 중이에요')}
            className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1"
            style={{ borderColor: 'var(--color-border-default)' }}
          >
            <Plus size={22} className="text-[var(--color-text-tertiary)]" />
            <span className="text-[11px] text-[var(--color-text-tertiary)]">추가</span>
          </button>
        )}
      </div>
      <p className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">
        나를 잘 표현하는 사진을 자유롭게 올려보세요. 취미, 일상, 좋아하는 공간 등 무엇이든 괜찮아요. (최대 9장)
      </p>
    </SubScreen>
  )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

function LifeHub({
  life,
  onNavigate,
  onBack,
  isPro,
  onUpgrade,
}: {
  life: PublicProfileLife
  onNavigate: (view: LifeView) => void
  onBack: () => void
  isPro: boolean
  onUpgrade: () => void
}) {
  const exerciseCount = life.daily.exercise.length
  const cultureCount = life.tastes.movies.length + life.tastes.music.length + life.tastes.books.length + (life.tastes.plays?.length ?? 0)
  const foodCount = life.tastes.restaurants.length + life.tastes.cafes.length
  const albumCount = life.albumPhotos?.length ?? 0

  const totalCount = exerciseCount + cultureCount + foodCount
  const freeRemaining = Math.max(0, FREE_LIMIT - totalCount)

  const rows: Array<{ view: LifeView; emoji: string; title: string; meta: string | null; nudge: string }> = [
    {
      view: 'pet',
      emoji: '🐾',
      title: '반려동물',
      meta: life.daily.pet !== '없음'
        ? [life.daily.pet, life.daily.petName].filter(Boolean).join(' · ')
        : null,
      nudge: '반려동물이 있으면 공통 화제가 생겨요',
    },
    {
      view: 'activity',
      emoji: '🏃',
      title: '활동',
      meta: exerciseCount > 0 ? `운동 ${exerciseCount}` : null,
      nudge: '같은 운동을 좋아하면 바로 친해져요',
    },
    {
      view: 'culture',
      emoji: '🎬',
      title: '문화',
      meta: cultureCount > 0 ? `${cultureCount}개` : null,
      nudge: '영화·음악·책 취향은 가장 좋은 대화 소재예요',
    },
    {
      view: 'place',
      emoji: '📍',
      title: '플레이스',
      meta: foodCount > 0 ? `맛집 ${life.tastes.restaurants.length} · 카페 ${life.tastes.cafes.length}` : null,
      nudge: '좋아하는 동네 맛집을 공유해보세요',
    },
    {
      view: 'album',
      emoji: '🖼️',
      title: '앨범',
      meta: albumCount > 0 ? `${albumCount}장` : null,
      nudge: '취미, 일상, 좋아하는 공간을 사진으로 보여줘요',
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <NavBar title="바이브 편집" onBack={onBack} />

      {/* Free 슬롯 배너 */}
      {!isPro && <SlotBadge remaining={freeRemaining} onUpgrade={onUpgrade} />}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-5 mt-4 overflow-hidden rounded-2xl border border-[var(--color-border-soft)]">
          {rows.map((row, i) => (
            <button
              key={row.view}
              onClick={() => onNavigate(row.view)}
              className={[
                'flex w-full items-center gap-4 px-5 py-4 text-left transition-colors active:bg-white/[0.03]',
                i < rows.length - 1 ? 'border-b border-[var(--color-border-soft)]' : '',
              ].join(' ')}
            >
              <span className="text-2xl flex-shrink-0">{row.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{row.title}</p>
                {row.meta
                  ? <p className="mt-0.5 text-[12px] font-medium text-[var(--color-accent-dark)]">{row.meta}</p>
                  : <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">💡 {row.nudge}</p>
                }
              </div>
              <ChevronRight size={14} className="flex-shrink-0 text-[var(--color-text-tertiary)] opacity-30" />
            </button>
          ))}
        </div>

        {/* Free: Pro 플랜 비교 안내 */}
        {!isPro && (
          <div className="mx-5 mt-3 mb-4 flex items-center justify-between rounded-xl bg-[var(--color-bg-soft)] px-4 py-3">
            <div>
              <p className="text-[12px] font-semibold text-[var(--color-text-secondary)]">Free · {FREE_LIMIT}개 슬롯</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">Pro는 카테고리별 최대 5개</p>
            </div>
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ background: 'var(--color-accent-dark)' }}
            >
              <Zap size={11} />
              업그레이드
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function LifeManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const isPro = store.user?.isPaidUser ?? false
  const [view, setView] = useState<LifeView>('hub')
  const [life, setLife] = useState<PublicProfileLife>(store.user?.life ?? SAMPLE_PROFILE.life)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const saveAndBack = () => {
    store.updateUserLife(life)
    showToast('바이브 정보가 저장됐어요')
    onBack()
  }

  const updateDaily = (daily: PublicProfileLife['daily']) => {
    setLife((prev) => ({ ...prev, daily }))
    setView('hub')
  }

  const updateTastes = (tastes: Partial<PublicProfileLife['tastes']>) => {
    setLife((prev) => ({ ...prev, tastes: { ...prev.tastes, ...tastes } }))
    setView('hub')
  }

  const updateAlbum = (albumPhotos: string[]) => {
    setLife((prev) => ({ ...prev, albumPhotos }))
    setView('hub')
  }

  // Free 플랜: 각 서브뷰에 할당 가능한 최대 슬롯 수 계산 (다른 카테고리 항목 제외)
  const total = countLifeItems(life)
  const activityCount = life.daily.exercise.length
  const cultureCount  = life.tastes.movies.length + life.tastes.music.length + life.tastes.books.length + (life.tastes.plays?.length ?? 0)
  const placeCount    = life.tastes.restaurants.length + life.tastes.cafes.length

  const activityFreeSlots = Math.max(0, FREE_LIMIT - (total - activityCount))
  const cultureFreeSlots  = Math.max(0, FREE_LIMIT - (total - cultureCount))
  const placeFreeSlots    = Math.max(0, FREE_LIMIT - (total - placeCount))

  const handleUpgrade = () => setShowUpgrade(true)

  if (view === 'pet')
    return <PetView life={life} onSave={updateDaily} />
  if (view === 'activity')
    return <ActivityView life={life} onSave={updateDaily} isPro={isPro} freeSlots={activityFreeSlots} onUpgrade={handleUpgrade} />
  if (view === 'culture')
    return <CultureView life={life} onSave={updateTastes} isPro={isPro} freeSlots={cultureFreeSlots} onUpgrade={handleUpgrade} />
  if (view === 'place')
    return <PlaceView life={life} onSave={updateTastes} isPro={isPro} freeSlots={placeFreeSlots} onUpgrade={handleUpgrade} />
  if (view === 'album')
    return <AlbumView life={life} onSave={updateAlbum} />

  return (
    <>
      <LifeHub life={life} onNavigate={setView} onBack={saveAndBack} isPro={isPro} onUpgrade={handleUpgrade} />
      {showUpgrade && <ProUpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
