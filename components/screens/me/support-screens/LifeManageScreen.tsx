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
  const [exercise, setExercise] = useState(formatMedia(initialLife.daily.exercise))
  const [teams, setTeams] = useState(formatMedia(initialLife.tastes.teams ?? []))
  const [movies, setMovies] = useState(formatMedia(initialLife.tastes.movies))
  const [music, setMusic] = useState(formatMedia(initialLife.tastes.music))
  const [books, setBooks] = useState(formatMedia(initialLife.tastes.books))
  const [plays, setPlays] = useState(formatMedia(initialLife.tastes.plays ?? []))
  const [restaurants, setRestaurants] = useState(formatMedia(initialLife.tastes.restaurants))
  const [cafes, setCafes] = useState(formatMedia(initialLife.tastes.cafes))
  const [travelDestinations, setTravelDestinations] = useState(formatMedia(initialLife.places.travelDestinations))

  const handleSave = () => {
    const nextLife: PublicProfileLife = {
      daily: {
        ...initialLife.daily,
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
        travelDestinations: parseMedia(travelDestinations, initialLife.places.travelDestinations),
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
          공개 프로필에서는 <span className="font-semibold">활동 · 문화 · 장소</span> 3개 블록으로 뭉쳐서 보여집니다.
          세부 항목은 여기서 따로 입력하고, 미디어/장소는 <span className="font-semibold">한 줄에 하나씩</span> 적어 주세요.
          보조 정보는 <span className="font-semibold">이름 | 설명</span> 형식으로 적으면 됩니다.
        </InfoBox>

        <Section title="활동">
          <TextAreaField label="좋아하는 운동" value={exercise} onChange={setExercise} placeholder={'러닝\n골프'} />
          <TextAreaField label="응원하는 스포츠팀" value={teams} onChange={setTeams} placeholder={'LG 트윈스 | KBO\n토트넘 홋스퍼 | EPL\nT1 | e스포츠'} />
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
          <TextAreaField label="여행지" value={travelDestinations} onChange={setTravelDestinations} placeholder={'도쿄\n교토\n샌프란시스코'} />
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
