'use client'

import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Image as ImageIcon, Plus, X, Zap } from 'lucide-react'
import { Button, NavBar, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { useFeloreStore } from '@/store/useFeloreStore'
import type { LifeMediaItem, Pet, PublicProfileLife } from '@/types'
import { ExercisePicker } from './ExercisePicker'
import { MusicSearchPicker } from './MusicSearchPicker'
import { MediaSearchPicker } from './MediaSearchPicker'
import { PlacePicker } from './PlacePicker'

// ─── Types ────────────────────────────────────────────────────────────────────

type LifeView = 'hub' | 'pet' | 'activity' | 'culture' | 'place' | 'album'

const PET_OPTIONS = ['강아지', '고양이', '기타']
const PET_MAX = 5

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

// ─── 슬롯 배너 ────────────────────────────────────────────────────────────────

function SlotBadge({
  remaining,
}: {
  remaining: number
}) {
  return (
    <div className="mx-5 mt-4 flex gap-1.5 rounded-[24px] bg-[#F0F5FF] py-3 pl-3 pr-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/ai-tools/ocr-info.svg" alt="" className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <p className={['text-[13px] font-bold', remaining > 0 ? 'text-[#0D0D0D]' : 'text-[#FF4242]'].join(' ')}>
          {remaining > 0 ? (
            <>
              슬롯 {remaining}개 남음
              <span className="ml-1.5 font-medium text-[#6C7786]">· Free 플랜</span>
            </>
          ) : (
            '슬롯이 모두 찼어요'
          )}
        </p>
        <p className="mt-1 text-[12px] font-medium leading-[1.5] text-[#475058]">
          Free는 반려동물 제외 최대 5개, Pro는 카테고리별 무제한이에요
        </p>
      </div>
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
    <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
      <NavBar title="" onBack={onBack} onClose={onBack} />
      <div className="px-5 pt-2">
        <h1 className="text-[22px] font-bold text-[#0D0D0D]">{title}</h1>
      </div>
      {slotBadge}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-6 space-y-6">{children}</div>
      <div className="px-5 pb-6">
        <Button onClick={onSave}>저장</Button>
      </div>
    </div>
  )
}

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[14px] font-semibold text-[#0D0D0D]">{label}</p>
      {children}
    </div>
  )
}

// ─── Sub-screens ──────────────────────────────────────────────────────────────

function PetCard({
  pet,
  onChange,
  onRemove,
}: {
  pet: Pet
  onChange: (patch: Partial<Pet>) => void
  onRemove: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('이미지 파일만 업로드할 수 있어요', 'error'); return }
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === 'string') onChange({ image: reader.result }) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="relative rounded-[16px] border border-[#DEE4EC] p-4">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F6F7]"
      >
        <X size={14} className="text-[#6C7786]" />
      </button>

      <div className="space-y-4 pr-8">
        <FieldBlock label="종류">
          <div className="flex flex-wrap gap-2">
            {PET_OPTIONS.map((option) => {
              const selected = option === pet.type
              return (
                <button
                  key={option}
                  onClick={() => onChange({ type: option })}
                  className={[
                    'rounded-full px-4 py-2 text-[14px] font-semibold transition-colors',
                    selected ? 'bg-[#0D0D0D] text-white' : 'bg-[#F5F6F7] text-[#6C7786]',
                  ].join(' ')}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </FieldBlock>

        <FieldBlock label="이름">
          <input
            value={pet.name ?? ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="예: 몽이"
            className="w-full rounded-full border border-[#DEE4EC] bg-white px-4 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
          />
        </FieldBlock>

        <FieldBlock label="사진">
          <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
          {pet.image ? (
            <div className="relative h-[140px] w-[140px]">
              <div className="h-full w-full overflow-hidden rounded-[20px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pet.image} alt="반려동물" className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => onChange({ image: undefined })}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[140px] w-[140px] flex-col items-center justify-center gap-2 rounded-[20px] bg-[#F5F6F7]"
            >
              <ImageIcon size={32} className="text-[#A8B1BD]" />
              <span className="text-[14px] font-semibold text-[#25313D]">눌러서 등록</span>
            </button>
          )}
        </FieldBlock>
      </div>
    </div>
  )
}

function PetView({
  life,
  onSave,
}: {
  life: PublicProfileLife
  onSave: (daily: PublicProfileLife['daily']) => void
}) {
  const [pets, setPets] = useState<Pet[]>(life.daily.pets ?? [])

  const updatePet = (id: string, patch: Partial<Pet>) =>
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const removePet = (id: string) =>
    setPets((prev) => prev.filter((p) => p.id !== id))

  const addPet = () => {
    if (pets.length >= PET_MAX) return
    setPets((prev) => [...prev, { id: `pet-${Date.now()}-${prev.length}`, type: PET_OPTIONS[0] }])
  }

  return (
    <SubScreen
      title="반려동물"
      onBack={() => onSave(life.daily)}
      onSave={() => {
        onSave({ ...life.daily, pets: pets.length ? pets : undefined })
        showToast('반려동물이 저장됐어요')
      }}
    >
      <div className="space-y-4">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onChange={(patch) => updatePet(pet.id, patch)}
            onRemove={() => removePet(pet.id)}
          />
        ))}
      </div>

      {pets.length < PET_MAX && (
        <button
          type="button"
          onClick={addPet}
          className="flex w-full items-center justify-center gap-1.5 rounded-[16px] border-2 border-dashed border-[#DEE4EC] py-4 text-[14px] font-semibold text-[#6C7786]"
        >
          <Plus size={16} />
          반려동물 추가
        </button>
      )}
    </SubScreen>
  )
}

function ActivityView({
  life,
  onSave,
  isPro,
  freeSlots,
}: {
  life: PublicProfileLife
  onSave: (daily: PublicProfileLife['daily']) => void
  isPro: boolean
  freeSlots: number
}) {
  const [exercise, setExercise] = useState<LifeMediaItem[]>(life.daily.exercise)

  const exerciseMax = isPro ? Infinity : Math.min(5, freeSlots)
  const freeRemaining = isPro ? undefined : Math.max(0, freeSlots - exercise.length)

  return (
    <SubScreen
      title="활동"
      onBack={() => onSave(life.daily)}
      onSave={() => {
        onSave({ ...life.daily, exercise })
        showToast('활동이 저장됐어요')
      }}
      slotBadge={freeRemaining !== undefined
        ? <SlotBadge remaining={freeRemaining} />
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
}: {
  life: PublicProfileLife
  onSave: (tastes: Partial<PublicProfileLife['tastes']>) => void
  isPro: boolean
  freeSlots: number
}) {
  const [movies, setMovies] = useState<LifeMediaItem[]>(life.tastes.movies)
  const [music, setMusic] = useState<LifeMediaItem[]>(life.tastes.music)
  const [books, setBooks] = useState<LifeMediaItem[]>(life.tastes.books)
  const [plays, setPlays] = useState<LifeMediaItem[]>(life.tastes.plays ?? [])

  const totalHere = movies.length + music.length + books.length + plays.length
  const movieMax  = isPro ? Infinity : Math.min(5, Math.max(0, freeSlots - (totalHere - movies.length)))
  const musicMax  = isPro ? Infinity : Math.min(5, Math.max(0, freeSlots - (totalHere - music.length)))
  const bookMax   = isPro ? Infinity : Math.min(5, Math.max(0, freeSlots - (totalHere - books.length)))
  const playMax   = isPro ? Infinity : Math.min(5, Math.max(0, freeSlots - (totalHere - plays.length)))
  const freeRemaining = isPro ? undefined : Math.max(0, freeSlots - totalHere)

  return (
    <SubScreen
      title="문화"
      onBack={() => onSave({})}
      onSave={() => {
        onSave({ movies, music, books, plays })
        showToast('문화가 저장됐어요')
      }}
      slotBadge={freeRemaining !== undefined
        ? <SlotBadge remaining={freeRemaining} />
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
}: {
  life: PublicProfileLife
  onSave: (tastes: Partial<PublicProfileLife['tastes']>) => void
  isPro: boolean
  freeSlots: number
}) {
  const [restaurants, setRestaurants] = useState<LifeMediaItem[]>(life.tastes.restaurants)
  const [cafes, setCafes] = useState<LifeMediaItem[]>(life.tastes.cafes)

  const totalHere = restaurants.length + cafes.length
  const restaurantMax = isPro ? Infinity : Math.min(5, Math.max(0, freeSlots - (totalHere - restaurants.length)))
  const cafeMax       = isPro ? Infinity : Math.min(5, Math.max(0, freeSlots - (totalHere - cafes.length)))
  const freeRemaining = isPro ? undefined : Math.max(0, freeSlots - totalHere)

  return (
    <SubScreen
      title="플레이스"
      onBack={() => onSave({})}
      onSave={() => {
        onSave({ restaurants, cafes })
        showToast('플레이스가 저장됐어요')
      }}
      slotBadge={freeRemaining !== undefined
        ? <SlotBadge remaining={freeRemaining} />
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
      onSave={() => {
        onSave(photos)
        showToast('앨범이 저장됐어요')
      }}
    >
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-[16px] bg-[#F5F6F7]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`사진 ${i + 1}`} className="h-full w-full object-cover" />
            <button
              onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}
        {/* [임시] 실제 업로드 미구현 — 최대 9장 */}
        {photos.length < 9 && (
          <button
            onClick={() => showToast('사진 업로드는 준비 중이에요')}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[16px] border-2 border-dashed border-[#DEE4EC]"
          >
            <Plus size={22} className="text-[#A8B1BD]" />
            <span className="text-[11px] font-medium text-[#A8B1BD]">추가</span>
          </button>
        )}
      </div>
      <p className="text-[12px] font-medium leading-[1.5] text-[#6C7786]">
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
  const petCount = life.daily.pets?.length ?? 0

  const rows: Array<{ view: LifeView; title: string; meta: string | null; nudge: string }> = [
    {
      view: 'pet',
      title: '반려동물',
      meta: petCount > 0
        ? life.daily.pets!.map((p) => p.name ?? p.type).join(' · ')
        : null,
      nudge: '반려동물이 있으면 공통 화제가 생겨요',
    },
    {
      view: 'activity',
      title: '활동',
      meta: exerciseCount > 0 ? `운동 ${exerciseCount}` : null,
      nudge: '같은 운동을 좋아하면 바로 친해져요',
    },
    {
      view: 'culture',
      title: '문화',
      meta: cultureCount > 0 ? `${cultureCount}개` : null,
      nudge: '영화·음악·책 취향은 가장 좋은 대화 소재예요',
    },
    {
      view: 'place',
      title: '플레이스',
      meta: foodCount > 0 ? `맛집 ${life.tastes.restaurants.length} · 카페 ${life.tastes.cafes.length}` : null,
      nudge: '좋아하는 동네 맛집을 공유해보세요',
    },
    {
      view: 'album',
      title: '앨범',
      meta: albumCount > 0 ? `${albumCount}장` : null,
      nudge: '취미, 일상, 좋아하는 공간을 사진으로 보여줘요',
    },
  ]

  return (
    <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
      <NavBar title="" onBack={onBack} onClose={onBack} />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-5 pt-2">
          <h1 className="text-[22px] font-bold text-[#0D0D0D]">바이브 편집</h1>
          <p className="mt-2 text-[16px] font-medium leading-[1.5] text-[#475058]">
            취향과 라이프스타일을 채우면 나와 잘 맞는 사람을 더 정확히 찾을 수 있어요.
          </p>
        </div>

        {/* Free 슬롯 배너 */}
        {!isPro && <SlotBadge remaining={freeRemaining} />}

        <div className="mx-5 mt-4 overflow-hidden rounded-[12px] border border-[#DEE4EC] px-4">
          {rows.map((row, i) => (
            <button
              key={row.view}
              type="button"
              onClick={() => onNavigate(row.view)}
              className={[
                'flex w-full items-center justify-between py-4 text-left',
                i < rows.length - 1 ? 'border-b border-[#DEE4EC]' : '',
              ].join(' ')}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#0D0D0D]">{row.title}</p>
                {row.meta
                  ? <p className="mt-0.5 text-[12px] font-bold text-[#0D0D0D]">{row.meta}</p>
                  : <p className="mt-0.5 text-[12px] font-medium text-[#6C7786]">{row.nudge}</p>
                }
              </div>
              <ChevronRight size={20} className="shrink-0 text-[#A8B1BD]" />
            </button>
          ))}
        </div>

        {/* Free: Pro 플랜 비교 안내 */}
        {!isPro && (
          <div className="mx-5 mb-6 mt-3 flex items-center justify-between rounded-[12px] bg-[#F5F6F7] px-4 py-3">
            <div>
              <p className="text-[12px] font-semibold text-[#0D0D0D]">Free · {FREE_LIMIT}개 슬롯</p>
              <p className="mt-0.5 text-[11px] font-medium text-[#6C7786]">반려동물 제외, 활동·문화·플레이스 합산 최대 5개</p>
              <p className="text-[11px] font-medium text-[#6C7786]">Pro는 카테고리별 무제한</p>
            </div>
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1.5 rounded-full bg-[#0D0D0D] px-3 py-1.5 text-[12px] font-bold text-white"
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
  const router = useRouter()
  const store = useFeloreStore()
  const isPro = store.user?.isPaidUser ?? false
  const [view, setView] = useState<LifeView>('hub')
  const [life, setLife] = useState<PublicProfileLife>(store.user?.life ?? SAMPLE_PROFILE.life)

  const saveAndBack = () => {
    store.updateUserLife(life)
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

  const handleUpgrade = () => {
    store.updateUserLife(life)
    router.push('/settings?screen=upgrade')
  }

  if (view === 'pet')
    return <PetView life={life} onSave={updateDaily} />
  if (view === 'activity')
    return <ActivityView life={life} onSave={updateDaily} isPro={isPro} freeSlots={activityFreeSlots} />
  if (view === 'culture')
    return <CultureView life={life} onSave={updateTastes} isPro={isPro} freeSlots={cultureFreeSlots} />
  if (view === 'place')
    return <PlaceView life={life} onSave={updateTastes} isPro={isPro} freeSlots={placeFreeSlots} />
  if (view === 'album')
    return <AlbumView life={life} onSave={updateAlbum} />

  return (
    <LifeHub life={life} onNavigate={setView} onBack={saveAndBack} isPro={isPro} onUpgrade={handleUpgrade} />
  )
}
