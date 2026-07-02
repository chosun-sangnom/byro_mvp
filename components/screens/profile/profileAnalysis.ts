'use client'

import type { PublicProfileLife, PublicProfileWhoIAm } from '@/types'

export type CompatibilityMode = 'romance' | 'business' | 'friend'

export function getMbtiTraits(mbtiRaw: string) {
  const mbti = mbtiRaw.toUpperCase()

  return {
    mbti,
    extrovert: mbti.startsWith('E'),
    intuitive: mbti[1] === 'N',
    thinking: mbti[2] === 'T',
    judging: mbti[3] === 'J',
  }
}

export function getTasteHook(life?: PublicProfileLife) {
  return (
    life?.tastes.cafes[0]?.label
    ?? life?.tastes.restaurants[0]?.label
    ?? life?.tastes.music[0]?.label
    ?? life?.tastes.movies[0]?.label
    ?? life?.tastes.books[0]?.label
    ?? life?.daily.exercise[0]?.label
    ?? null
  )
}

export function getSignalChips(whoIAm: PublicProfileWhoIAm, life?: PublicProfileLife) {
  return [
    whoIAm.mbti,
    life?.daily.exercise[0]?.label,
    life?.tastes.music[0]?.label,
    life?.tastes.cafes[0]?.label,
  ].filter(Boolean) as string[]
}

export function getLifestyleSignals(life?: PublicProfileLife) {
  return {
    activity:
      life?.daily.exercise[0]?.label
      ?? null,
    culture:
      life?.tastes.movies[0]?.label
      ?? life?.tastes.music[0]?.label
      ?? life?.tastes.books[0]?.label
      ?? life?.tastes.plays?.[0]?.label
      ?? null,
    place:
      life?.tastes.cafes[0]?.label
      ?? life?.tastes.restaurants[0]?.label
      ?? null,
    neighborhood: null,
    exercise: life?.daily.exercise[0]?.label ?? null,
    tasteHook: getTasteHook(life),
  }
}
