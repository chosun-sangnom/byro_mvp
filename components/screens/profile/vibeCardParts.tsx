'use client'

import {
  BookOpen,
  Clapperboard,
  Coffee,
  Dumbbell,
  Image as ImageIcon,
  Music,
  PawPrint,
  Theater,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { VIBE_KIND_META, type VibeEntry, type VibeKind } from '@/lib/vibeItems'

const KIND_ICONS: Record<VibeKind, LucideIcon> = {
  movie: Clapperboard,
  music: Music,
  book: BookOpen,
  play: Theater,
  exercise: Dumbbell,
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  pet: PawPrint,
  photo: ImageIcon,
}

export function VibeKindIcon({ kind, size = 20, color }: { kind: VibeKind; size?: number; color?: string }) {
  const Icon = KIND_ICONS[kind]
  return <Icon size={size} color={color ?? VIBE_KIND_META[kind].color} />
}

export function VibeImage({ entry, iconSize = 24 }: { entry: Pick<VibeEntry, 'kind' | 'imageUrl' | 'label'>; iconSize?: number }) {
  if (entry.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={entry.imageUrl} alt={entry.label ?? ''} className="h-full w-full object-cover" />
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: `${VIBE_KIND_META[entry.kind].color}1F` }}
    >
      <VibeKindIcon kind={entry.kind} size={iconSize} />
    </div>
  )
}

export function VibeKindBadge({ kind }: { kind: VibeKind }) {
  const meta = VIBE_KIND_META[kind]
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold leading-[1.4] text-white"
      style={{ backgroundColor: `${meta.color}CC` }}
    >
      {meta.label}
    </span>
  )
}
