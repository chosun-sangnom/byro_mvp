'use client'

import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  Globe,
  Handshake,
  type LucideIcon,
  Mic,
  Pencil,
  Plane,
  Trophy,
  Users,
} from 'lucide-react'
import type { HighlightIconId } from '@/types'

const ICON_MAP = {
  briefcase: Briefcase,
  users: Users,
  building2: Building2,
  plane: Plane,
  mic: Mic,
  handshake: Handshake,
  trophy: Trophy,
  'book-open': BookOpen,
  globe: Globe,
  pencil: Pencil,
  'badge-check': BadgeCheck,
} as const satisfies Record<HighlightIconId, LucideIcon>

export function HighlightIcon({
  id,
  size = 18,
  className,
  strokeWidth = 2,
}: {
  id: HighlightIconId
  size?: number
  className?: string
  strokeWidth?: number
}) {
  const Icon = ICON_MAP[id] ?? Pencil
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />
}
