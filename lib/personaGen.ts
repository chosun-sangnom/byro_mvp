// [임시] 클라이언트 사이드 템플릿 기반 페르소나 생성
// 실제 구현 시 서버사이드 LLM 호출로 교체 (평판+라이프 전체 컨텍스트 기반)

import type { PublicProfile } from '@/types'

export type PersonaReason = {
  category: string
  value: string
}

export type PersonaResult = {
  text: string
  reasons: PersonaReason[]
}

export function generatePersona(profile: PublicProfile): PersonaResult {
  const reasons: PersonaReason[] = []

  const music = profile.life?.tastes.music[0]
  const exercise = profile.life?.daily.exercise[0]
  const cafe = profile.life?.tastes.cafes[0]
  const book = profile.life?.tastes.books[0]
  const topKeyword = profile.reputationKeywords?.[0]?.keyword ?? ''
  const title = profile.title ?? profile.headline ?? ''

  // 직함에서 핵심 단어 추출
  const titleShort = extractTitleCore(title)

  if (music) reasons.push({ category: '음악 취향', value: `${music.sublabel ?? music.label}` })
  if (exercise) reasons.push({ category: '운동', value: exercise.label })
  if (cafe) reasons.push({ category: '자주 찾는 카페', value: cafe.label })
  if (book) reasons.push({ category: '읽는 책', value: book.label })
  if (topKeyword) reasons.push({ category: '가장 많이 받은 평판', value: topKeyword })
  if (titleShort) reasons.push({ category: '직함', value: titleShort })

  const text = buildSentence({ music, exercise, cafe, book, topKeyword, titleShort })

  return { text, reasons }
}

function extractTitleCore(title: string): string {
  // "Product Owner · Byro 팀" → "Product Owner"
  // "스타트업 마케터 4년 경력" → "스타트업 마케터"
  return title.split(/[·,]/)[0].replace(/\d+년.*/, '').trim()
}

function buildSentence({
  music,
  exercise,
  cafe,
  book,
  topKeyword,
  titleShort,
}: {
  music?: { label: string; sublabel?: string }
  exercise?: { label: string }
  cafe?: { label: string }
  book?: { label: string }
  topKeyword: string
  titleShort: string
}): string {
  const title = titleShort || '전문가'

  // 데이터 조합에 따라 다른 템플릿 선택
  if (music && exercise) {
    const artist = music.sublabel ?? music.label
    return `${exercise.label}하고 ${artist} 듣는 ${title}`
  }
  if (music && cafe) {
    const artist = music.sublabel ?? music.label
    return `${cafe.label}에서 ${artist} 듣는 ${title}`
  }
  if (exercise && book) {
    return `${exercise.label}하고 ${book.label} 읽는 ${title}`
  }
  if (music) {
    const artist = music.sublabel ?? music.label
    return `${artist} 들으며 일하는 ${title}`
  }
  if (exercise) {
    return `${exercise.label}로 에너지를 채우는 ${title}`
  }
  if (cafe) {
    return `${cafe.label} 즐겨 찾는 ${title}`
  }
  if (topKeyword) {
    const simplified = topKeyword.replace(/이에요|해요|있어요|가 있어요/, '').trim()
    return `${simplified} ${title}`
  }
  return title
}
