'use client'

import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Camera, ChevronRight } from 'lucide-react'
import { Button, NavBar, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { useByroStore } from '@/store/useByroStore'
import type { LifeMediaItem, PublicProfileLife } from '@/types'
import { ExercisePicker } from './ExercisePicker'
import { SportsTeamPicker } from './SportsTeamPicker'
import { MusicSearchPicker } from './MusicSearchPicker'
import { MediaSearchPicker } from './MediaSearchPicker'
import { PlacePicker } from './PlacePicker'
import { TravelPicker } from './TravelPicker'

// ─── Types ────────────────────────────────────────────────────────────────────

type LifeView = 'hub' | 'pet' | 'activity' | 'culture' | 'place' | 'travel'

const PET_OPTIONS = ['없음', '강아지', '고양이', '소형 포유류', '조류', '파충류', '어류', '기타']

// ─── Shared sub-components ────────────────────────────────────────────────────

function SubScreen({
  title,
  onBack,
  onSave,
  children,
}: {
  title: string
  onBack: () => void
  onSave: () => void
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col">
      <NavBar title={title} onBack={onBack} />
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
}: {
  life: PublicProfileLife
  onSave: (daily: PublicProfileLife['daily'], teams: LifeMediaItem[]) => void
}) {
  const [exercise, setExercise] = useState<LifeMediaItem[]>(life.daily.exercise)
  const [teams, setTeams] = useState<LifeMediaItem[]>(life.tastes.teams ?? [])

  return (
    <SubScreen
      title="활동"
      onBack={() => onSave(life.daily, life.tastes.teams ?? [])}
      onSave={() => onSave({ ...life.daily, exercise }, teams)}
    >
      <FieldBlock label="즐기는 운동">
        <ExercisePicker selected={exercise} onChange={setExercise} />
      </FieldBlock>

      <FieldBlock label="응원하는 스포츠팀">
        <SportsTeamPicker selected={teams} onChange={setTeams} />
      </FieldBlock>
    </SubScreen>
  )
}

function CultureView({
  life,
  onSave,
}: {
  life: PublicProfileLife
  onSave: (tastes: Partial<PublicProfileLife['tastes']>) => void
}) {
  const [movies, setMovies] = useState<LifeMediaItem[]>(life.tastes.movies)
  const [music, setMusic] = useState<LifeMediaItem[]>(life.tastes.music)
  const [books, setBooks] = useState<LifeMediaItem[]>(life.tastes.books)
  const [plays, setPlays] = useState<LifeMediaItem[]>(life.tastes.plays ?? [])

  return (
    <SubScreen
      title="문화"
      onBack={() => onSave({})}
      onSave={() => onSave({ movies, music, books, plays })}
    >
      <FieldBlock label="영화">
        <MediaSearchPicker type="movie" selected={movies} onChange={setMovies} />
      </FieldBlock>
      <FieldBlock label="음악">
        <MusicSearchPicker selected={music} onChange={setMusic} />
      </FieldBlock>
      <FieldBlock label="책">
        <MediaSearchPicker type="book" selected={books} onChange={setBooks} />
      </FieldBlock>
      <FieldBlock label="공연 · 연극">
        <MediaSearchPicker type="play" selected={plays} onChange={setPlays} />
      </FieldBlock>
    </SubScreen>
  )
}

function PlaceView({
  life,
  onSave,
}: {
  life: PublicProfileLife
  onSave: (tastes: Partial<PublicProfileLife['tastes']>) => void
}) {
  const [restaurants, setRestaurants] = useState<LifeMediaItem[]>(life.tastes.restaurants)
  const [cafes, setCafes] = useState<LifeMediaItem[]>(life.tastes.cafes)

  return (
    <SubScreen
      title="플레이스"
      onBack={() => onSave({})}
      onSave={() => onSave({ restaurants, cafes })}
    >
      <FieldBlock label="맛집">
        <PlacePicker type="restaurant" selected={restaurants} onChange={setRestaurants} />
      </FieldBlock>
      <FieldBlock label="카페">
        <PlacePicker type="cafe" selected={cafes} onChange={setCafes} />
      </FieldBlock>
    </SubScreen>
  )
}

function TravelView({
  life,
  onSave,
}: {
  life: PublicProfileLife
  onSave: (destinations: LifeMediaItem[]) => void
}) {
  const [destinations, setDestinations] = useState<LifeMediaItem[]>(life.places.travelDestinations)

  return (
    <SubScreen
      title="여행"
      onBack={() => onSave(life.places.travelDestinations)}
      onSave={() => onSave(destinations)}
    >
      <TravelPicker selected={destinations} onChange={setDestinations} />
    </SubScreen>
  )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

function LifeHub({
  life,
  onNavigate,
  onBack,
}: {
  life: PublicProfileLife
  onNavigate: (view: LifeView) => void
  onBack: () => void
}) {
  const exerciseCount = life.daily.exercise.length
  const teamsCount = life.tastes.teams?.length ?? 0
  const cultureCount = life.tastes.movies.length + life.tastes.music.length + life.tastes.books.length + (life.tastes.plays?.length ?? 0)
  const foodCount = life.tastes.restaurants.length + life.tastes.cafes.length
  const travelCount = life.places.travelDestinations.length

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
      meta: exerciseCount + teamsCount > 0
        ? [exerciseCount > 0 && `운동 ${exerciseCount}`, teamsCount > 0 && `팀 ${teamsCount}`].filter(Boolean).join(' · ')
        : null,
      nudge: '같은 운동이나 팀을 좋아하면 바로 친해져요',
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
      view: 'travel',
      emoji: '✈️',
      title: '여행',
      meta: travelCount > 0 ? `${travelCount}곳` : null,
      nudge: '가본 곳 또는 가고 싶은 곳 모두 좋아요',
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <NavBar title="라이프 편집" onBack={onBack} />
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
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function LifeManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const [view, setView] = useState<LifeView>('hub')
  const [life, setLife] = useState<PublicProfileLife>(store.user?.life ?? SAMPLE_PROFILE.life)

  const saveAndBack = () => {
    store.updateUserLife(life)
    showToast('라이프 정보가 저장됐어요')
    onBack()
  }

  const updateDaily = (daily: PublicProfileLife['daily']) => {
    setLife((prev) => ({ ...prev, daily }))
    setView('hub')
  }

  const updateActivityTeams = (daily: PublicProfileLife['daily'], teams: LifeMediaItem[]) => {
    setLife((prev) => ({ ...prev, daily, tastes: { ...prev.tastes, teams } }))
    setView('hub')
  }

  const updateTastes = (tastes: Partial<PublicProfileLife['tastes']>) => {
    setLife((prev) => ({ ...prev, tastes: { ...prev.tastes, ...tastes } }))
    setView('hub')
  }

  const updateTravel = (travelDestinations: LifeMediaItem[]) => {
    setLife((prev) => ({ ...prev, places: { ...prev.places, travelDestinations } }))
    setView('hub')
  }

  if (view === 'pet')      return <PetView      life={life} onSave={updateDaily} />
  if (view === 'activity') return <ActivityView life={life} onSave={updateActivityTeams} />
  if (view === 'culture')  return <CultureView  life={life} onSave={updateTastes} />
  if (view === 'place')    return <PlaceView    life={life} onSave={updateTastes} />
  if (view === 'travel')   return <TravelView   life={life} onSave={updateTravel} />

  return <LifeHub life={life} onNavigate={setView} onBack={saveAndBack} />
}
