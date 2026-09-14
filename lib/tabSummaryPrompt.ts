import type { PublicProfileLife, PublicProfileWhoIAm, RememberHighlight, ReputationKeyword } from '@/types'

// 탭별 한 줄 요약 AI 프롬프트 빌더 (SCRUM-122) — 표면 정보만 참고해 40자 내외 한 문장을 생성하도록 유도한다.

function joinLines(header: string[], bits: string[]): string {
  return [...header, '', '참고 정보:', bits.length ? `- ${bits.join(', ')}` : '- (아직 채워진 항목 없음)'].join('\n')
}

export function buildWhoSummaryPrompt(profile: {
  title?: string
  headline?: string
  whoIAm?: PublicProfileWhoIAm
  bio?: string
}): string {
  const bits: string[] = []
  if (profile.title) bits.push(`직함 ${profile.title}`)
  if (profile.headline) bits.push(`헤드라인 ${profile.headline}`)
  if (profile.whoIAm?.mbti) bits.push(`MBTI ${profile.whoIAm.mbti}`)
  if (profile.whoIAm?.personality) bits.push(`성향 "${profile.whoIAm.personality}"`)
  if (profile.bio) bits.push(`자기소개 "${profile.bio}"`)

  return joinLines(
    [
      '아래 정보를 참고해서 이 사람을 소개하는 한 문장(40자 내외)을 만들어줘.',
      '프로필 ME 탭 상단에 노출되는 한 줄 요약이야. 과장 없이 담백하게, 완성된 문장 하나만 줘.',
    ],
    bits,
  )
}

export function buildVibeSummaryPrompt(life?: PublicProfileLife): string {
  const bits: string[] = []
  if (life) {
    life.tastes.movies.forEach((m) => bits.push(`영화 ${m.label}`))
    life.tastes.music.forEach((m) => bits.push(`음악 ${m.label}`))
    life.tastes.books.forEach((m) => bits.push(`책 ${m.label}`))
    ;(life.tastes.plays ?? []).forEach((m) => bits.push(`공연 ${m.label}`))
    life.daily.exercise.forEach((m) => bits.push(`운동 ${m.label}`))
    life.tastes.restaurants.forEach((m) => bits.push(`맛집 ${m.label}`))
    life.tastes.cafes.forEach((m) => bits.push(`카페 ${m.label}`))
    ;(life.daily.pets ?? []).forEach((p) => bits.push(`반려동물 ${p.name ?? p.type}`))
  }

  return joinLines(
    [
      '아래 취향·라이프스타일 정보를 참고해서 이 사람의 바이브를 한 문장(40자 내외)으로 표현해줘.',
      '프로필 VIBE 탭 상단에 노출되는 한 줄 요약이야. 나열식 말고 느낌 있게, 완성된 문장 하나만 줘.',
    ],
    bits,
  )
}

export function buildNetworkSummaryPrompt(
  rememberHighlight?: RememberHighlight,
  reputationKeywords?: ReputationKeyword[],
): string {
  const bits: string[] = []
  if (rememberHighlight?.topCompany) bits.push(`주요 소속 ${rememberHighlight.topCompany.name}`)
  if (rememberHighlight?.topIndustry) bits.push(`주요 업종 ${rememberHighlight.topIndustry.name}`)
  if (rememberHighlight?.topRole) bits.push(`주요 직함 ${rememberHighlight.topRole.name}`)
  ;[...(reputationKeywords ?? [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .forEach((k) => bits.push(`평판 키워드 ${k.keyword}`))

  return joinLines(
    [
      '아래 네트워크·평판 정보를 참고해서 이 사람의 대외 평판을 한 문장(40자 내외)으로 표현해줘.',
      '프로필 PEOPLE 탭 상단에 노출되는 한 줄 요약이야. 과장 없이 담백하게, 완성된 문장 하나만 줘.',
    ],
    bits,
  )
}
