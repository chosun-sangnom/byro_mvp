import { flattenVibe, VIBE_KIND_META } from '@/lib/vibeItems'
import type { PublicProfileLife, PublicProfileWhoIAm, RememberHighlight, ReputationKeyword } from '@/types'

// [임시] 탭별 한 줄 요약 자동 생성 목업 — 규칙 기반.
// TODO(real API): 탭 데이터가 바뀔 때 서버에서 LLM으로 생성·캐싱하고 공개 프로필 응답에 포함.
// 사용자가 직접 고친 값(tabSummaries)이 있으면 그 문장이 우선한다.

function firstSentence(text: string, max = 60): string {
  const sentence = text.split(/(?<=[.!?。])\s|\n/)[0].trim()
  return sentence.length > max ? `${sentence.slice(0, max - 1)}…` : sentence
}

export function autoWhoSummary(profile: {
  title?: string
  headline?: string
  whoIAm?: PublicProfileWhoIAm
}): string | undefined {
  if (profile.whoIAm?.personality) {
    const lead = firstSentence(profile.whoIAm.personality)
    return profile.whoIAm.mbti ? `${profile.whoIAm.mbti} · ${lead}` : lead
  }
  if (profile.headline) return profile.headline
  return profile.title || undefined
}

export function autoVibeSummary(life?: PublicProfileLife): string | undefined {
  const entries = flattenVibe(life).filter((e) => e.label && e.kind !== 'photo')
  if (entries.length === 0) return undefined

  const bits: string[] = []
  const seenGroups = new Set<string>()
  for (const entry of entries) {
    const group = VIBE_KIND_META[entry.kind].group
    if (seenGroups.has(group)) continue
    seenGroups.add(group)
    bits.push(group === 'content' ? `${VIBE_KIND_META[entry.kind].label} 「${entry.label}」` : entry.label!)
    if (bits.length === 3) break
  }
  return `${bits.join(' · ')} — 이런 취향으로 채워진 일상`
}

export function autoNetworkSummary(
  remember?: RememberHighlight,
  keywords?: ReputationKeyword[],
): string | undefined {
  const industry = remember?.topIndustry?.name
  const topKeyword = [...(keywords ?? [])].sort((a, b) => b.count - a.count)[0]?.keyword

  if (industry && topKeyword) return `${industry} 분야 사람들과 가장 많이 연결돼 있고, "${topKeyword}"라는 피드백을 가장 많이 받았어요`
  if (industry) return `${industry} 분야 사람들과 가장 많이 연결돼 있어요`
  if (topKeyword) return `"${topKeyword}"라는 피드백을 가장 많이 받았어요`
  return undefined
}
