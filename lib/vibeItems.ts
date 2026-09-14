import type { AlbumPhoto, LifeMediaItem, Pet, PublicProfileLife } from '@/types'

// 바이브 카드 어댑터 — 저장 구조(daily/tastes/albumPhotos)는 그대로 두고,
// UI는 전 항목을 "카드 한 장" 리스트로 평탄화해 최신순으로 다룬다.

export const VIBE_CAPTION_MAX = 200

export type VibeKind = 'movie' | 'music' | 'book' | 'play' | 'exercise' | 'restaurant' | 'cafe' | 'pet' | 'photo'
export type VibeGroup = 'content' | 'place' | 'exercise' | 'pet' | 'photo'
export type MediaKind = Exclude<VibeKind, 'pet' | 'photo'>

export const VIBE_GROUPS: Array<{ id: VibeGroup; label: string; description: string }> = [
  { id: 'content', label: '콘텐츠', description: '영화 · 음악 · 책 · 공연' },
  { id: 'place', label: '장소', description: '맛집 · 카페' },
  { id: 'exercise', label: '운동', description: '즐겨 하는 운동' },
  { id: 'pet', label: '반려동물', description: '함께 사는 친구' },
  { id: 'photo', label: '사진', description: '일상 · 취미 · 공간' },
]

export const VIBE_KIND_META: Record<VibeKind, { label: string; group: VibeGroup; color: string; captionPlaceholder: string }> = {
  movie: { label: '영화', group: 'content', color: '#3B82F6', captionPlaceholder: '왜 좋았는지, 뭘 느꼈는지 남겨보세요' },
  music: { label: '음악', group: 'content', color: '#22C55E', captionPlaceholder: '이 곡을 들으면 떠오르는 순간이 있나요?' },
  book: { label: '책', group: 'content', color: '#F59E0B', captionPlaceholder: '왜 읽었는지, 뭘 느꼈는지 남겨보세요' },
  play: { label: '공연', group: 'content', color: '#A855F7', captionPlaceholder: '어떤 장면이 기억에 남았나요?' },
  exercise: { label: '운동', group: 'exercise', color: '#EF4444', captionPlaceholder: '언제부터, 얼마나 즐기고 있나요?' },
  restaurant: { label: '맛집', group: 'place', color: '#EC4899', captionPlaceholder: '어떤 메뉴를, 언제 찾는지 알려주세요' },
  cafe: { label: '카페', group: 'place', color: '#92400E', captionPlaceholder: '이 카페에서 주로 뭘 하나요?' },
  pet: { label: '반려동물', group: 'pet', color: '#FB923C', captionPlaceholder: '우리 아이 자랑을 마음껏 해주세요' },
  photo: { label: '사진', group: 'photo', color: '#64748B', captionPlaceholder: '이 사진에 담긴 이야기를 적어보세요' },
}

export interface VibeEntry {
  key: string
  kind: VibeKind
  index: number
  label?: string
  sublabel?: string
  imageUrl?: string
  caption?: string
  addedAt?: string
}

export type NewVibeItem =
  | { kind: MediaKind; item: LifeMediaItem }
  | { kind: 'pet'; pet: Pet }
  | { kind: 'photo'; photo: AlbumPhoto }

export const EMPTY_LIFE: PublicProfileLife = {
  daily: { exercise: [], pets: [] },
  tastes: { movies: [], music: [], books: [], plays: [], restaurants: [], cafes: [] },
  albumPhotos: [],
}

const MEDIA_KINDS: MediaKind[] = ['movie', 'music', 'book', 'play', 'exercise', 'restaurant', 'cafe']

const TASTE_KEY: Record<Exclude<MediaKind, 'exercise'>, keyof PublicProfileLife['tastes']> = {
  movie: 'movies',
  music: 'music',
  book: 'books',
  play: 'plays',
  restaurant: 'restaurants',
  cafe: 'cafes',
}

export function getMediaList(life: PublicProfileLife, kind: MediaKind): LifeMediaItem[] {
  if (kind === 'exercise') return life.daily.exercise
  return life.tastes[TASTE_KEY[kind]] ?? []
}

function withMediaList(life: PublicProfileLife, kind: MediaKind, items: LifeMediaItem[]): PublicProfileLife {
  if (kind === 'exercise') return { ...life, daily: { ...life.daily, exercise: items } }
  return { ...life, tastes: { ...life.tastes, [TASTE_KEY[kind]]: items } }
}

// 예전 persisted 데이터는 앨범 사진이 URL 문자열 배열이었다
export function normalizeAlbumPhotos(photos?: Array<AlbumPhoto | string>): AlbumPhoto[] {
  return (photos ?? []).map((photo) => (typeof photo === 'string' ? { url: photo } : photo))
}

export function flattenVibe(life?: PublicProfileLife): VibeEntry[] {
  if (!life) return []
  const entries: VibeEntry[] = []

  for (const kind of MEDIA_KINDS) {
    getMediaList(life, kind).forEach((item, index) => {
      entries.push({
        key: `${kind}:${index}`,
        kind,
        index,
        label: item.label,
        sublabel: item.sublabel,
        imageUrl: item.posterUrl,
        caption: item.caption,
        addedAt: item.addedAt,
      })
    })
  }
  ;(life.daily.pets ?? []).forEach((pet, index) => {
    entries.push({
      key: `pet:${index}`,
      kind: 'pet',
      index,
      label: pet.name ?? pet.type,
      sublabel: pet.name ? pet.type : undefined,
      imageUrl: pet.image,
      caption: pet.caption,
      addedAt: pet.addedAt,
    })
  })
  normalizeAlbumPhotos(life.albumPhotos).forEach((photo, index) => {
    entries.push({
      key: `photo:${index}`,
      kind: 'photo',
      index,
      imageUrl: photo.url,
      caption: photo.caption,
      addedAt: photo.addedAt,
    })
  })

  return entries
    .map((entry, order) => ({ entry, order }))
    .sort((a, b) => {
      if (a.entry.addedAt && b.entry.addedAt) return b.entry.addedAt.localeCompare(a.entry.addedAt)
      if (a.entry.addedAt) return -1
      if (b.entry.addedAt) return 1
      return a.order - b.order
    })
    .map(({ entry }) => entry)
}

export function hasMediaLabel(life: PublicProfileLife, kind: MediaKind, label: string): boolean {
  return getMediaList(life, kind).some((item) => item.label === label)
}

export function addVibeItem(life: PublicProfileLife, input: NewVibeItem): PublicProfileLife {
  const addedAt = new Date().toISOString()
  if (input.kind === 'pet') {
    return { ...life, daily: { ...life.daily, pets: [...(life.daily.pets ?? []), { ...input.pet, addedAt }] } }
  }
  if (input.kind === 'photo') {
    return { ...life, albumPhotos: [...normalizeAlbumPhotos(life.albumPhotos), { ...input.photo, addedAt }] }
  }
  return withMediaList(life, input.kind, [...getMediaList(life, input.kind), { ...input.item, addedAt }])
}

function patchEntry(
  life: PublicProfileLife,
  entry: VibeEntry,
  patch: { caption?: string } | null,
): PublicProfileLife {
  const apply = <T extends { caption?: string }>(items: T[]): T[] =>
    patch === null
      ? items.filter((_, i) => i !== entry.index)
      : items.map((item, i) => (i === entry.index ? { ...item, ...patch } : item))

  if (entry.kind === 'pet') {
    return { ...life, daily: { ...life.daily, pets: apply(life.daily.pets ?? []) } }
  }
  if (entry.kind === 'photo') {
    return { ...life, albumPhotos: apply(normalizeAlbumPhotos(life.albumPhotos)) }
  }
  return withMediaList(life, entry.kind, apply(getMediaList(life, entry.kind)))
}

export function updateVibeCaption(life: PublicProfileLife, entry: VibeEntry, caption?: string): PublicProfileLife {
  return patchEntry(life, entry, { caption: caption?.trim() || undefined })
}

export function removeVibeEntry(life: PublicProfileLife, entry: VibeEntry): PublicProfileLife {
  return patchEntry(life, entry, null)
}
