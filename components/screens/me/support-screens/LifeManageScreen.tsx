'use client'

import { useState, type ReactNode } from 'react'
import { Button, InfoBox, TextArea, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { useByroStore } from '@/store/useByroStore'
import type { LifeMediaItem, PublicProfileLife } from '@/types'

function parseList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatList(items: string[]) {
  return items.join(', ')
}

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
  const [exercise, setExercise] = useState(formatList(initialLife.daily.exercise))
  const [pet, setPet] = useState(initialLife.daily.pet)
  const [petName, setPetName] = useState(initialLife.daily.petName ?? '')
  const [movies, setMovies] = useState(formatMedia(initialLife.tastes.movies))
  const [music, setMusic] = useState(formatMedia(initialLife.tastes.music))
  const [books, setBooks] = useState(formatMedia(initialLife.tastes.books))
  const [games, setGames] = useState(formatList(initialLife.tastes.games))
  const [sports, setSports] = useState(formatList(initialLife.tastes.sports))
  const [celebrities, setCelebrities] = useState(formatList(initialLife.tastes.celebrities))
  const [diet, setDiet] = useState(initialLife.tastes.diet)
  const [restaurants, setRestaurants] = useState(formatMedia(initialLife.tastes.restaurants))
  const [cafes, setCafes] = useState(formatMedia(initialLife.tastes.cafes))
  const [neighborhoods, setNeighborhoods] = useState(formatList(initialLife.places.neighborhoods))
  const [travelDestinations, setTravelDestinations] = useState(formatList(initialLife.places.travelDestinations))

  const handleSave = () => {
    const nextLife: PublicProfileLife = {
      daily: {
        exercise: parseList(exercise),
        pet,
        petName: pet === '없음' ? undefined : petName.trim() || undefined,
      },
      tastes: {
        movies: parseMedia(movies, initialLife.tastes.movies),
        music: parseMedia(music, initialLife.tastes.music),
        books: parseMedia(books, initialLife.tastes.books),
        games: parseList(games),
        sports: parseList(sports),
        celebrities: parseList(celebrities),
        diet: diet.trim(),
        restaurants: parseMedia(restaurants, initialLife.tastes.restaurants),
        cafes: parseMedia(cafes, initialLife.tastes.cafes),
      },
      places: {
        neighborhoods: parseList(neighborhoods),
        travelDestinations: parseList(travelDestinations),
      },
    }

    store.updateUserLife(nextLife)
    showToast('라이프 정보가 저장됐어요')
    onBack()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 flex-shrink-0 items-center border-b border-[var(--color-border-soft)] px-5">
        <button onClick={onBack} className="mr-3 text-xl leading-none text-[var(--color-text-secondary)]">‹</button>
        <span className="text-base font-black text-[var(--color-text-strong)]">라이프 편집</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <InfoBox variant="warn">
          쉼표로 여러 값을 나눌 수 있고, 미디어/장소는 <span className="font-semibold">한 줄에 하나씩</span> 입력하세요.
          보조 정보는 <span className="font-semibold">이름 | 설명</span> 형식으로 적으면 됩니다.
        </InfoBox>

        <Section title="일상">
          <InputField label="운동">
            <input
              value={exercise}
              onChange={(event) => setExercise(event.target.value)}
              placeholder="예: 러닝, 골프"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
          </InputField>

          <InputField label="반려동물">
            <div className="flex flex-wrap gap-2">
              {['없음', '강아지', '고양이', '기타'].map((option) => {
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
          </InputField>

          {pet !== '없음' && (
            <InputField label="반려동물 이름">
              <input
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                placeholder="예: 몽이"
                className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
              />
            </InputField>
          )}
        </Section>

        <Section title="취향">
          <TextAreaField label="영화 · 드라마" value={movies} onChange={setMovies} placeholder={'머니볼\n소셜 네트워크'} />
          <TextAreaField label="음악" value={music} onChange={setMusic} placeholder={'Tomboy | 혁오\nEverything | 검정치마'} />
          <TextAreaField label="책" value={books} onChange={setBooks} placeholder={'린 스타트업\n제로 투 원'} />
          <InputField label="게임">
            <input
              value={games}
              onChange={(event) => setGames(event.target.value)}
              placeholder="예: EA SPORTS FC, 심즈"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
          </InputField>
          <InputField label="스포츠">
            <input
              value={sports}
              onChange={(event) => setSports(event.target.value)}
              placeholder="예: 축구, 골프"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
          </InputField>
          <InputField label="최애">
            <input
              value={celebrities}
              onChange={(event) => setCelebrities(event.target.value)}
              placeholder="예: 아이유, 유재석"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
          </InputField>
          <InputField label="식단">
            <input
              value={diet}
              onChange={(event) => setDiet(event.target.value)}
              placeholder="예: 일반식"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
          </InputField>
          <TextAreaField label="맛집" value={restaurants} onChange={setRestaurants} placeholder={'성수 우육미엔 | 성수동\n압구정 뜸들이다 | 압구정'} />
          <TextAreaField label="카페" value={cafes} onChange={setCafes} placeholder={'센터커피 | 성수동\n프릳츠 원서점 | 서촌'} />
        </Section>

        <Section title="장소">
          <InputField label="자주 가는 곳">
            <input
              value={neighborhoods}
              onChange={(event) => setNeighborhoods(event.target.value)}
              placeholder="예: 성수동, 한남동, 서촌"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
          </InputField>
          <InputField label="여행지">
            <input
              value={travelDestinations}
              onChange={(event) => setTravelDestinations(event.target.value)}
              placeholder="예: 도쿄, 교토, 샌프란시스코"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
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
