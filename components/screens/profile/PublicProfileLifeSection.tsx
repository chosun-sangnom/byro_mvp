'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Coffee,
  Dumbbell,
  GlassWater,
  Home,
  MapPin,
  PawPrint,
  Plane,
  Sparkles,
  Tv,
  UserRound,
  Utensils,
  BriefcaseBusiness,
  CigaretteOff,
} from 'lucide-react'
import type { PublicProfileLife } from '@/types'
import { SectionTitle } from '@/components/screens/profile/PublicProfileSections'

function LifeSummary({
  life,
}: {
  life: PublicProfileLife
}) {
  const workStyle = life.daily.workStyle.slice(0, 2).join(' · ')
  const exercises = life.daily.exercise.slice(0, 2).join(' · ')
  const drinks = life.daily.drinkType?.join(' · ')

  return (
    <div className="rounded-[28px] border border-[var(--color-border-default)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
        <Sparkles size={14} />
        <span>Life Snapshot</span>
      </div>
      <p className="mt-3 text-[15px] leading-[1.65] text-[var(--color-text-primary)]">
        {`평소 ${workStyle} 리듬으로 지내고, 운동은 ${life.daily.exerciseFrequency} ${exercises}을(를) 즐깁니다. `}
        {`커피는 하루 ${life.daily.coffee} 정도, 술은 ${life.daily.alcohol}${drinks ? ` ${drinks} 위주` : ''}입니다.`}
      </p>
    </div>
  )
}

function LifeStatCard({
  label,
  value,
  icon,
  badges,
}: {
  label: string
  value: string
  icon: React.ReactNode
  badges?: string[]
}) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border-soft)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        <span className="text-[var(--color-text-secondary)]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2 text-[15px] font-semibold text-[var(--color-text-primary)]">{value}</div>
      {badges && badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span key={badge} className="chip-metric">{badge}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function LifeTagBlock({
  label,
  items,
  icon,
}: {
  label: string
  items: string[]
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.04)] px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        <span className="text-[var(--color-text-secondary)]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="chip-metric">{item}</span>
        ))}
      </div>
    </div>
  )
}

function LifeAccordionRow({
  label,
  items,
  icon,
  initiallyOpen = false,
}: {
  label: string
  items: string[]
  icon: React.ReactNode
  initiallyOpen?: boolean
}) {
  const [open, setOpen] = useState(initiallyOpen)

  return (
    <div className="rounded-[22px] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
            <span className="text-[var(--color-text-secondary)]">{icon}</span>
            <span>{label}</span>
          </div>
          <div className="mt-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
            {items.slice(0, 2).join(' · ')}
            {items.length > 2 ? ` 외 ${items.length - 2}` : ''}
          </div>
        </div>
        <span className="flex-shrink-0 text-[var(--color-text-tertiary)]">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--color-border-soft)] px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span key={item} className="chip-metric">{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LifePlaceRow({
  label,
  items,
  icon,
}: {
  label: string
  items: string[]
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border-default)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        <span className="text-[var(--color-text-secondary)]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="chip-metric">{item}</span>
        ))}
      </div>
    </div>
  )
}

export function PublicProfileLifeSection({
  life,
}: {
  life?: PublicProfileLife
}) {
  if (!life) return null

  return (
    <>
      <div className="px-5 pt-6 pb-2">
        <LifeSummary life={life} />
      </div>

      <div className="px-5 pt-5 pb-2">
        <SectionTitle title="일상" subtitle="하루 루틴과 생활 패턴" />
        <div className="grid grid-cols-2 gap-3">
          <LifeStatCard label="사는 방식" value={life.daily.housingType} icon={<Home size={14} />} />
          <LifeStatCard label="근무 방식" value={life.daily.workStyle.join(' · ')} icon={<BriefcaseBusiness size={14} />} />
          <LifeStatCard label="운동 빈도" value={life.daily.exerciseFrequency} icon={<Dumbbell size={14} />} />
          <LifeStatCard
            label="술은"
            value={life.daily.alcohol}
            icon={<GlassWater size={14} />}
            badges={life.daily.drinkType}
          />
          <LifeStatCard label="담배" value={life.daily.smoking} icon={<CigaretteOff size={14} />} />
          <LifeStatCard label="커피" value={`하루 ${life.daily.coffee}`} icon={<Coffee size={14} />} />
        </div>
        <div className="mt-4">
          <LifeTagBlock label="하는 운동" items={life.daily.exercise} icon={<Dumbbell size={14} />} />
        </div>
        <div className="mt-4">
          <LifeStatCard
            label="반려동물"
            value={life.daily.petName ? `${life.daily.pet} · ${life.daily.petName}` : life.daily.pet}
            icon={<PawPrint size={14} />}
          />
        </div>
      </div>

      <div className="px-5 pt-6 pb-2">
        <SectionTitle title="취향" subtitle="구체적으로 좋아하는 것들" />
        <div className="space-y-4">
          <LifeAccordionRow label="영화 · 드라마" items={life.tastes.movies} icon={<Tv size={14} />} initiallyOpen />
          <LifeAccordionRow label="음악" items={life.tastes.music} icon={<Sparkles size={14} />} />
          <LifeAccordionRow label="책" items={life.tastes.books} icon={<UserRound size={14} />} />
          <LifeAccordionRow label="게임" items={life.tastes.games} icon={<Sparkles size={14} />} />
          <LifeAccordionRow label="스포츠" items={life.tastes.sports} icon={<Dumbbell size={14} />} />
          <LifeAccordionRow label="최애" items={life.tastes.celebrities} icon={<UserRound size={14} />} />
          <LifeStatCard label="식단" value={life.tastes.diet} icon={<Utensils size={14} />} />
          <LifeAccordionRow label="맛집" items={life.tastes.restaurants} icon={<Utensils size={14} />} />
          <LifeAccordionRow label="카페" items={life.tastes.cafes} icon={<Coffee size={14} />} />
        </div>
      </div>

      <div className="px-5 pt-6 pb-8">
        <SectionTitle title="장소" subtitle="자주 가는 곳과 여행지" />
        <div className="space-y-4">
          <LifePlaceRow label="자주 가는 곳" items={life.places.neighborhoods} icon={<MapPin size={14} />} />
          <LifePlaceRow label="여행지" items={life.places.travelDestinations} icon={<Plane size={14} />} />
        </div>
      </div>
    </>
  )
}
