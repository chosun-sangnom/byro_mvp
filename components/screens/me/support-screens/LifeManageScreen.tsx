'use client'

import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Camera } from 'lucide-react'
import { Button, InfoBox, NavBar, TextArea, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { useByroStore } from '@/store/useByroStore'
import type { LifeMediaItem, PublicProfileLife } from '@/types'

const PET_OPTIONS = ['없음', '강아지', '고양이', '기타']


function formatMedia(items: LifeMediaItem[]) {
  return items
    .map((item) => (item.sublabel ? `${item.label} | ${item.sublabel}` : item.label))
    .join('\n')
}

function parseMedia(value: string, previous: LifeMediaItem[]) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelPart, ...sublabelParts] = line.split('|')
      const label = labelPart.trim()
      const sublabel = sublabelParts.join('|').trim() || undefined
      const preserved = previous.find((item) => item.label === label)
      return {
        label,
        sublabel,
        posterUrl: preserved?.posterUrl,
      }
    })
}

export function LifeManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const initialLife: PublicProfileLife = store.user?.life ?? SAMPLE_PROFILE.life
  const [pet, setPet] = useState(initialLife.daily.pet)
  const [petName, setPetName] = useState(initialLife.daily.petName ?? '')
  const [petImage, setPetImage] = useState(initialLife.daily.petImage ?? '')
  const petFileInputRef = useRef<HTMLInputElement>(null)
  const [exercise, setExercise] = useState(formatMedia(initialLife.daily.exercise))
  const [teams, setTeams] = useState(formatMedia(initialLife.tastes.teams ?? []))
  const [movies, setMovies] = useState(formatMedia(initialLife.tastes.movies))
  const [music, setMusic] = useState(formatMedia(initialLife.tastes.music))
  const [books, setBooks] = useState(formatMedia(initialLife.tastes.books))
  const [plays, setPlays] = useState(formatMedia(initialLife.tastes.plays ?? []))
  const [restaurants, setRestaurants] = useState(formatMedia(initialLife.tastes.restaurants))
  const [cafes, setCafes] = useState(formatMedia(initialLife.tastes.cafes))
  const [travelDestinations, setTravelDestinations] = useState<LifeMediaItem[]>(
    initialLife.places.travelDestinations.length > 0
      ? initialLife.places.travelDestinations
      : []
  )
  const travelFileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleSave = () => {
    const nextLife: PublicProfileLife = {
      daily: {
        ...initialLife.daily,
        pet,
        petName: pet === '없음' ? undefined : petName.trim() || undefined,
        petImage: pet === '없음' ? undefined : petImage || undefined,
        exercise: parseMedia(exercise, initialLife.daily.exercise),
      },
      tastes: {
        ...initialLife.tastes,
        movies: parseMedia(movies, initialLife.tastes.movies),
        music: parseMedia(music, initialLife.tastes.music),
        books: parseMedia(books, initialLife.tastes.books),
        plays: parseMedia(plays, initialLife.tastes.plays ?? []),
        teams: parseMedia(teams, initialLife.tastes.teams ?? []),
        restaurants: parseMedia(restaurants, initialLife.tastes.restaurants),
        cafes: parseMedia(cafes, initialLife.tastes.cafes),
      },
      places: {
        ...initialLife.places,
        travelDestinations: travelDestinations.filter((d) => d.label.trim()),
      },
    }

    store.updateUserLife(nextLife)
    showToast('라이프 정보가 저장됐어요')
    onBack()
  }

  const handlePetFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setPetImage(reader.result)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleTravelPhotoChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTravelDestinations((prev) =>
          prev.map((item, i) => (i === index ? { ...item, posterUrl: reader.result as string } : item))
        )
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleTravelLabelChange = (index: number, value: string) => {
    setTravelDestinations((prev) =>
      prev.map((item, i) => (i === index ? { ...item, label: value } : item))
    )
  }

  const handleTravelAdd = () => {
    setTravelDestinations((prev) => [...prev, { label: '' }])
  }

  const handleTravelRemove = (index: number) => {
    setTravelDestinations((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex h-full flex-col">
      <NavBar title="라이프 편집" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <InfoBox variant="warn">
          공개 프로필에서는 <span className="font-semibold">활동 · 문화 · 장소</span> 3개 블록으로 뭉쳐서 보여집니다.
          세부 항목은 여기서 따로 입력하고, 미디어/장소는 <span className="font-semibold">한 줄에 하나씩</span> 적어 주세요.
          보조 정보는 <span className="font-semibold">이름 | 설명</span> 형식으로 적으면 됩니다.
        </InfoBox>

        <Section title="활동">
          <TextAreaField label="좋아하는 운동" value={exercise} onChange={setExercise} placeholder={'러닝\n골프'} />
          <TextAreaField label="응원하는 스포츠팀" value={teams} onChange={setTeams} placeholder={'LG 트윈스 | KBO\n토트넘 홋스퍼 | EPL\nT1 | e스포츠'} />
          <InputField label="반려동물">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {PET_OPTIONS.map((option) => {
                  const selected = option === pet
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPet(option)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                      style={{
                        borderColor: selected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                        background: selected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                        color: selected ? '#ffffff' : 'var(--color-text-secondary)',
                      }}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              {pet !== '없음' && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => petFileInputRef.current?.click()}
                    className="relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] flex items-center justify-center"
                  >
                    {petImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={petImage} alt="반려동물 사진" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={18} className="text-[var(--color-text-tertiary)]" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-1 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white font-semibold">변경</span>
                    </div>
                  </button>
                  <input
                    ref={petFileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePetFileChange}
                  />
                  <div className="flex-1">
                    <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">반려동물 이름</label>
                    <input
                      value={petName}
                      onChange={(event) => setPetName(event.target.value)}
                      placeholder="예: 몽이"
                      className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </InputField>
        </Section>

        <Section title="문화">
          <TextAreaField label="영화" value={movies} onChange={setMovies} placeholder={'머니볼\n소셜 네트워크'} />
          <TextAreaField label="음악" value={music} onChange={setMusic} placeholder={'Tomboy | 혁오\nEverything | 검정치마'} />
          <TextAreaField label="책" value={books} onChange={setBooks} placeholder={'린 스타트업\n제로 투 원'} />
          <TextAreaField label="연극" value={plays} onChange={setPlays} placeholder={'렛미플라이\n레드북'} />
        </Section>

        <Section title="장소">
          <TextAreaField label="맛집" value={restaurants} onChange={setRestaurants} placeholder={'성수 우육미엔 | 성수동\n압구정 뜸들이다 | 압구정'} />
          <TextAreaField label="카페" value={cafes} onChange={setCafes} placeholder={'센터커피 | 성수동\n프릳츠 원서점 | 서촌'} />
          <InputField label="여행지">
            <div className="space-y-2">
              {travelDestinations.map((dest, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => travelFileInputRefs.current[index]?.click()}
                    className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] flex items-center justify-center"
                  >
                    {dest.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={dest.posterUrl} alt={dest.label} className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={16} className="text-[var(--color-text-tertiary)]" />
                    )}
                  </button>
                  <input
                    ref={(el) => { travelFileInputRefs.current[index] = el }}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleTravelPhotoChange(index, e)}
                  />
                  <input
                    value={dest.label}
                    onChange={(e) => handleTravelLabelChange(index, e.target.value)}
                    placeholder="예: 도쿄"
                    className="flex-1 border border-[var(--color-border-default)] rounded-xl px-3 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleTravelRemove(index)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-tertiary)]"
                    style={{ backgroundColor: 'var(--color-bg-muted)' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleTravelAdd}
                className="w-full rounded-xl border border-dashed border-[var(--color-border-default)] py-2.5 text-sm text-[var(--color-text-tertiary)]"
              >
                + 여행지 추가
              </button>
            </div>
          </InputField>
        </Section>
      </div>

      <div className="border-t border-[var(--color-border-soft)] px-5 pb-5 pt-3">
        <Button onClick={handleSave}>저장</Button>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="mt-5">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">{title}</div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function InputField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold text-[var(--color-text-secondary)]">{label}</div>
      {children}
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <InputField label={label}>
      <TextArea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        maxLength={600}
      />
    </InputField>
  )
}
