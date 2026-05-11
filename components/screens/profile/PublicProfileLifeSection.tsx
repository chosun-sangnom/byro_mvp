'use client'

import type { ReactNode } from 'react'
import { BookOpen, Dumbbell, MapPin } from 'lucide-react'
import type { LifeMediaItem, PublicProfileLife } from '@/types'

type LifeCluster = {
  title: string
  summary: string
  chips: string[]
  icon: ReactNode
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)))
}

function mediaLabels(items?: LifeMediaItem[]) {
  return (items ?? []).map((item) => item.label)
}

function buildSummary(items: string[], fallback: string) {
  if (items.length === 0) return fallback
  if (items.length === 1) return `${items[0]}처럼 지금 좋아하는 것들이 보여요.`
  if (items.length === 2) return `${items[0]}, ${items[1]}처럼 대화가 이어지기 좋은 취향이에요.`
  return `${items.slice(0, 3).join(', ')}처럼 공통점을 찾기 쉬운 항목들이 모여 있어요.`
}

function LifeClusterCard({ cluster }: { cluster: LifeCluster }) {
  if (cluster.chips.length === 0) return null

  return (
    <div className="surface-card-soft mx-5 px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        <span className="text-[var(--color-text-secondary)]">{cluster.icon}</span>
        <span>{cluster.title}</span>
      </div>
      <p className="mt-2 text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">{cluster.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {cluster.chips.map((chip, index) => (
          <span key={`${cluster.title}-${index}`} className="chip-metric">
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

export function PublicProfileLifeSection({ life }: { life?: PublicProfileLife }) {
  if (!life) return null

  const activityItems = unique([
    ...life.daily.exercise,
    ...(life.tastes.teams ?? []),
  ])
  const cultureItems = unique([
    ...mediaLabels(life.tastes.movies),
    ...mediaLabels(life.tastes.music),
    ...mediaLabels(life.tastes.books),
    ...mediaLabels(life.tastes.plays),
  ])
  const placeItems = unique([
    ...mediaLabels(life.tastes.restaurants),
    ...mediaLabels(life.tastes.cafes),
    ...life.places.travelDestinations,
  ])

  const clusters: LifeCluster[] = [
    {
      title: '활동',
      icon: <Dumbbell size={13} />,
      chips: activityItems,
      summary: buildSummary(activityItems, '좋아하는 운동과 응원하는 팀이 아직 없어요.'),
    },
    {
      title: '문화',
      icon: <BookOpen size={13} />,
      chips: cultureItems,
      summary: buildSummary(cultureItems, '좋아하는 문화생활이 아직 없어요.'),
    },
    {
      title: '장소',
      icon: <MapPin size={13} />,
      chips: placeItems,
      summary: buildSummary(placeItems, '좋아하는 장소가 아직 없어요.'),
    },
  ]

  return (
    <div className="space-y-4 pb-8 pt-6">
      {clusters.map((cluster) => (
        <LifeClusterCard key={cluster.title} cluster={cluster} />
      ))}
    </div>
  )
}
