'use client'

/**
 * 케미 리포트 (5축 재설계) — 목업 리포트 생성 로직
 *
 * [임시] MBTI + 하이라이트 + 평판 키워드 + 바이브 데이터 기반 규칙 생성.
 * TODO(real API): GAP-8(케미 존·서버 매칭) — 실제 매칭 알고리즘/BE 연동 시 교체.
 *
 * 축 순서는 항상 career → reputation → personality → life → taste 로 고정한다.
 * (레이더 차트 각도가 이 순서에 의존)
 */

import type {
  KemiArchetype,
  KemiAxisId,
  KemiAxisReport,
  KemiPurpose,
  KemiReport,
  PublicProfile,
  PublicProfileLife,
  PublicProfileWhoIAm,
} from '@/types'
import { getLifestyleSignals, getMbtiTraits, getTasteHook } from './profileAnalysis'

export interface KemiViewer {
  name: string
  title: string
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
}

export const AXIS_ORDER: KemiAxisId[] = ['career', 'reputation', 'personality', 'life', 'taste']

export const AXIS_META: Record<KemiAxisId, { label: string; question: string; signalKind: 'same' | 'complement' }> = {
  career: { label: '커리어', question: '일로 만나면 뭐가 되나', signalKind: 'complement' },
  reputation: { label: '평판', question: '남들과 어떻게 지냈나', signalKind: 'complement' },
  personality: { label: '성격', question: '사람 자체가 맞나', signalKind: 'same' },
  life: { label: '생활', question: '일상이 겹치나', signalKind: 'same' },
  taste: { label: '취향', question: '같이 뭘 보고 듣나', signalKind: 'same' },
}

export const AXIS_WEIGHTS: Record<KemiPurpose, Record<KemiAxisId, number>> = {
  work: { career: 35, reputation: 25, personality: 20, life: 12, taste: 8 },
  relationship: { taste: 28, life: 27, personality: 25, reputation: 12, career: 8 },
}

export function computeKemiScore(axes: KemiAxisReport[], purpose: KemiPurpose): number {
  const weights = AXIS_WEIGHTS[purpose]
  const total = axes.reduce((sum, axis) => sum + axis.strength * (weights[axis.id] / 100), 0)
  return Math.max(0, Math.min(100, Math.round(total)))
}

function lockedAxis(id: KemiAxisId, missingItems: string[]): KemiAxisReport {
  return {
    ...AXIS_META[id],
    id,
    strength: 0,
    lead: '',
    signals: [],
    evidence: '',
    locked: true,
    missingItems,
  }
}

function buildCareerAxis(viewerTitle: string, target: PublicProfile): KemiAxisReport {
  const careerHighlight = target.manualHighlights.find((h) => h.categoryId === 'career-role')
  if (!careerHighlight) return lockedAxis('career', ['하이라이트(경력) 1개'])

  const role = (careerHighlight.metadata?.role as string) ?? careerHighlight.subtitle
  const isCurrent = /현재|재직/.test(careerHighlight.subtitle) || /현재/.test(careerHighlight.year)

  return {
    ...AXIS_META.career,
    id: 'career',
    strength: isCurrent ? 78 : 62,
    lead: `${target.name}님은 ${careerHighlight.title}에서 ${role}로 일하고 있고, 당신은 ${viewerTitle || '지금 하는 일'}(으)로 활동 중이라 서로 다른 축을 맡고 있어요.`,
    signals: [
      { tone: 'good', text: `역할이 겹치지 않아서 서로의 영역을 침범할 일이 적어요 — ${role} × ${viewerTitle || '당신의 일'}.` },
      { tone: 'good', text: `${careerHighlight.year} 기준 경력이 이어지고 있어서 커리어 리듬을 맞추기 좋은 시점이에요.` },
      { tone: 'watch', text: '산업·직무가 다르면 초반엔 서로의 용어와 맥락을 맞추는 시간이 필요할 수 있어요.' },
    ],
    evidence: `하이라이트 · ${careerHighlight.title}`,
    locked: false,
    missingItems: [],
  }
}

function buildReputationAxis(target: PublicProfile): KemiAxisReport {
  const keywords = target.reputationKeywords ?? []
  if (keywords.length === 0) return lockedAxis('reputation', ['평판 키워드 1개 이상'])

  const [top, second] = keywords
  const totalCount = keywords.reduce((sum, k) => sum + k.count, 0)

  return {
    ...AXIS_META.reputation,
    id: 'reputation',
    strength: Math.min(90, 45 + totalCount * 2),
    lead: `주변에서는 "${top.keyword}"라는 말을 가장 많이 남겼어요${second ? `, "${second.keyword}"도 자주 나와요` : ''}.`,
    signals: [
      { tone: 'good', text: `"${top.keyword}"라는 평판이 ${top.count}건 쌓여 있어서 처음 만나도 신뢰가 앞서요.` },
      ...(second
        ? ([{ tone: 'good', text: `"${second.keyword}"라는 평도 함께 있어서 한 가지 인상으로만 굳어져 있진 않아요.` }] as const)
        : []),
      { tone: 'watch', text: totalCount < 10 ? '아직 표본이 많지 않은 편이라 초기 인상 위주로 쌓인 평판일 수 있어요.' : '평판은 결국 실제로 겪어봐야 확인되는 부분이라 첫 만남 전엔 참고 정도로만 보세요.' },
    ],
    evidence: `평판 키워드 ${keywords.length}건`,
    locked: false,
    missingItems: [],
  }
}

function buildPersonalityAxis(viewerWhoIAm: PublicProfileWhoIAm, target: PublicProfile): KemiAxisReport {
  if (!target.whoIAm) return lockedAxis('personality', ['MBTI'])

  const me = getMbtiTraits(viewerWhoIAm.mbti)
  const them = getMbtiTraits(target.whoIAm.mbti)
  const sameExtrovert = me.extrovert === them.extrovert
  const sameThinking = me.thinking === them.thinking
  const sameJudging = me.judging === them.judging
  const sameCount = [sameExtrovert, sameThinking, sameJudging].filter(Boolean).length

  const signals: KemiAxisReport['signals'] = [
    sameExtrovert
      ? { tone: 'good', text: `둘 다 ${me.extrovert ? '먼저 대화를 여는' : '천천히 가까워지는'} 편이라 텐션 차이가 크지 않아요.` }
      : { tone: 'watch', text: `${me.extrovert ? '당신은 먼저 나서는' : '당신은 천천히 다가가는'} 편이고 ${target.name}님은 반대라 대화 속도를 맞추는 시간이 필요해요.` },
    sameThinking
      ? { tone: 'good', text: '판단 기준(논리 vs 감정)이 비슷해서 의견이 갈려도 대화로 잘 풀려요.' }
      : { tone: 'watch', text: '의사결정 기준이 달라서(논리 vs 감정) 같은 상황도 다르게 읽을 수 있어요.' },
    sameJudging
      ? { tone: 'good', text: '계획을 세우는 방식이 비슷해서 약속·일정 감각이 잘 맞아요.' }
      : { tone: 'watch', text: '계획형과 즉흥형이 갈려서 일정 잡는 스타일에 차이가 있을 수 있어요.' },
  ]

  const personalityLine = target.whoIAm.personality

  return {
    ...AXIS_META.personality,
    id: 'personality',
    strength: sameCount * 25 + 15,
    lead: `${target.name}님은 ${them.mbti}, 당신은 ${me.mbti} — ${sameCount >= 2 ? '기질이 비슷한 편' : '서로 다른 결을 가진 편'}이에요.${personalityLine ? ` "${personalityLine}"` : ''}`,
    signals,
    evidence: 'MBTI · 성향',
    locked: false,
    missingItems: [],
  }
}

function buildLifeAxis(viewerLife: PublicProfileLife | undefined, target: PublicProfile): KemiAxisReport {
  const targetLife = target.life
  const hasLifeData = !!targetLife && (
    targetLife.daily.exercise.length > 0
    || targetLife.tastes.cafes.length > 0
    || targetLife.tastes.restaurants.length > 0
  )
  if (!hasLifeData) return lockedAxis('life', ['바이브(생활) 1개'])

  const me = getLifestyleSignals(viewerLife)
  const them = getLifestyleSignals(targetLife)
  const sameExercise = !!me.exercise && me.exercise === them.exercise
  const samePlace = !!me.place && me.place === them.place

  const signals: KemiAxisReport['signals'] = []
  if (sameExercise) signals.push({ tone: 'good', text: `둘 다 ${me.exercise}을(를) 즐겨서 같이 움직일 확률이 높아요.` })
  if (samePlace) signals.push({ tone: 'good', text: `자주 가는 장소(${me.place})가 겹쳐서 우연히 마주칠 만한 생활 반경이에요.` })
  if (signals.length === 0) {
    signals.push({ tone: 'watch', text: `${target.name}님은 ${them.exercise ?? them.place ?? '다른 루틴'} 위주라 생활 반경이 자연스럽게 겹치진 않아요.` })
  }
  signals.push({ tone: 'watch', text: '생활 루틴이 다르면 약속을 미리 맞춰야 자주 볼 수 있어요.' })

  return {
    ...AXIS_META.life,
    id: 'life',
    strength: (sameExercise ? 40 : 0) + (samePlace ? 40 : 0) + 15,
    lead: `${target.name}님의 일상은 ${them.exercise ?? '일상 루틴'}과 ${them.place ?? '단골 장소'} 위주예요.`,
    signals,
    evidence: '바이브 · 생활',
    locked: false,
    missingItems: [],
  }
}

function buildTasteAxis(viewerLife: PublicProfileLife | undefined, target: PublicProfile): KemiAxisReport {
  const targetHook = getTasteHook(target.life)
  if (!targetHook) return lockedAxis('taste', ['바이브(취향) 1개'])

  const overlap = (['movies', 'music', 'books'] as const)
    .map((key) => {
      const mine = new Set((viewerLife?.tastes[key] ?? []).map((item) => item.label))
      return target.life?.tastes[key].find((item) => mine.has(item.label))?.label
    })
    .find(Boolean)

  const signals: KemiAxisReport['signals'] = [
    overlap
      ? { tone: 'good', text: `${overlap}을(를) 똑같이 좋아해요 — 정확히 겹치는 취향이에요.` }
      : { tone: 'watch', text: `${target.name}님은 ${targetHook}을(를) 즐기는데, 당신 취향과 겹치는 지점은 아직 뚜렷하지 않아요.` },
    overlap
      ? { tone: 'good', text: '취향 대화 소재가 바로 있어서 처음부터 대화가 쉽게 이어져요.' }
      : { tone: 'watch', text: '서로 취향을 소개하며 알아가는 재미로 접근하면 좋아요.' },
  ]

  return {
    ...AXIS_META.taste,
    id: 'taste',
    strength: overlap ? 82 : 35,
    lead: `같이 뭘 보고 듣는지로 보면, ${target.name}님은 ${targetHook} 쪽이에요.`,
    signals,
    evidence: '바이브 · 취향',
    locked: false,
    missingItems: [],
  }
}

function buildArchetypes(target: PublicProfile, axes: KemiAxisReport[]): Record<KemiPurpose, KemiArchetype> {
  const unlockedCount = axes.filter((a) => !a.locked).length
  const readyEnough = unlockedCount >= 4

  return {
    work: {
      name: readyEnough ? '상호보완형' : '탐색형',
      verdict: readyEnough
        ? `일로 만나면 ${target.name}님과 서로 빈 곳을 채워주는 조합이에요.`
        : `아직 정보가 적어서 ${target.name}님과의 협업 궁합은 더 채워져야 뚜렷해져요.`,
      grade: readyEnough ? '채워주는 사이' : '더 알아갈 사이',
    },
    relationship: {
      name: readyEnough ? '편안한 동행형' : '탐색형',
      verdict: readyEnough
        ? `사적으로는 ${target.name}님과 무리하지 않고 편하게 어울릴 수 있는 사이예요.`
        : `아직 정보가 적어서 ${target.name}님과 얼마나 편할지는 더 지켜봐야 해요.`,
      grade: readyEnough ? '편한 사이' : '더 알아갈 사이',
    },
  }
}

export function buildKemiReport(viewer: KemiViewer, target: PublicProfile): KemiReport | null {
  // whoIAm(MBTI)이 아예 없으면 어떤 축도 근거를 만들 수 없어 리포트 자체를 생성하지 않는다.
  if (!target.whoIAm) return null

  const viewerWhoIAm: PublicProfileWhoIAm = viewer.whoIAm ?? { mbti: 'ENFP' }

  const axes: KemiAxisReport[] = [
    buildCareerAxis(viewer.title, target),
    buildReputationAxis(target),
    buildPersonalityAxis(viewerWhoIAm, target),
    buildLifeAxis(viewer.life, target),
    buildTasteAxis(viewer.life, target),
  ]

  const unlocked = axes.filter((a) => !a.locked)
  const strongest = [...unlocked].sort((a, b) => b.strength - a.strength).slice(0, 2)

  return {
    axes,
    archetypeByPurpose: buildArchetypes(target, axes),
    goodNote: strongest.length > 0
      ? `${strongest.map((a) => a.label).join('·')}이(가) 강하게 맞아떨어지는 조합이에요.`
      : '아직 강하게 맞아떨어지는 축은 뚜렷하지 않아요.',
    watchNote: '서로 다른 영역은 알아가는 데 약간의 시간이 필요할 수 있어요 — 상대의 흠이 아니라 이 조합의 특성이에요.',
  }
}
