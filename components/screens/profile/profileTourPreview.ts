'use client'

import { useFeloreStore } from '@/store/useFeloreStore'
import type { PublicProfileLife } from '@/types'

const EMPTY_LIFE: PublicProfileLife = {
  daily: { exercise: [], pets: [] },
  tastes: { movies: [], music: [], books: [], plays: [], restaurants: [], cafes: [] },
  albumPhotos: [],
}

// [임시] 목업은 가입 완료 시 샘플 데이터로 프로필을 채우므로, 투어 동안만 내 프로필을
// 가입 직후처럼 빈 상태로 보여준다. Prod는 실제로 빈 프로필이라 이 처리가 필요 없음
export function useTourEmptyPreview(isOwner: boolean) {
  const pending = useFeloreStore((s) => s.profileTourPending)
  return isOwner && pending
}

type TourPreviewable = {
  bio?: string
  whoIAm?: unknown
  manualHighlights: unknown[]
  life?: PublicProfileLife
  instagramConnected: boolean
  linkedinConnected: boolean
  youtubeConnected?: boolean
  tiktokConnected?: boolean
  rememberHighlight: { total: number; industries: unknown[] }
  reputationKeywords?: unknown[]
  guestbook: unknown[]
  tabSummaries?: unknown
}

export function toTourEmptyProfile<T extends TourPreviewable>(profile: T): T {
  return {
    ...profile,
    bio: '',
    whoIAm: undefined,
    manualHighlights: [],
    life: EMPTY_LIFE,
    instagramConnected: false,
    linkedinConnected: false,
    youtubeConnected: false,
    tiktokConnected: false,
    rememberHighlight: {
      ...profile.rememberHighlight,
      total: 0,
      industries: [],
      topCompany: undefined,
      topIndustry: undefined,
      topRole: undefined,
      mutualCompanies: [],
      insight: undefined,
    },
    reputationKeywords: [],
    guestbook: [],
    tabSummaries: undefined,
  }
}
