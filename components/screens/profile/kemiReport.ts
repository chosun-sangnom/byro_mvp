'use client'

/**
 * 케미 리포트 (5축 재설계) — 목업 리포트 생성 로직
 *
 * [임시] MBTI + 하이라이트 + 평판 키워드 + 바이브 데이터 기반 규칙 생성.
 * TODO(real API): GAP-8(케미 존·서버 매칭) — 실제 매칭 알고리즘/BE 연동 시 교체.
 *
 * 목적(협업/관계)은 단순 가중치뿐 아니라 문구 자체의 "결"을 바꾼다 —
 * 협업 = 이 사람과 일할 때 결, 관계 = 이 사람과 친구가 될 때 결.
 * 축 순서는 항상 career → reputation → personality → life → taste 로 고정한다.
 * (레이더 차트 각도가 이 순서에 의존, 레이더 강도(strength)는 목적과 무관)
 *
 * 축별 상태는 우선순위 순으로 하나만 적용된다:
 *   1. locked  — 뷰어 자신의 정보가 없어서 비교 자체가 불가 (블러+넛지, 뷰어가 채우면 열림)
 *   2. partial — 상대 정보가 없거나(빈 값) 상대가 비공개 탭으로 설정해서 양방향 비교는 못 하지만,
 *                뷰어 쪽 정보만으로 안내 (예: 강명구님처럼 NETWORK 탭이 비공개인 경우)
 *   3. full    — 양쪽 다 있어서 정상적인 두 사람 비교
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

function viewerLockedAxis(id: KemiAxisId, missingItems: string[]): KemiAxisReport {
  return {
    ...AXIS_META[id],
    id,
    strength: 0,
    lead: '',
    goodPoints: [],
    watchPoints: [],
    locked: true,
    partial: false,
    missingItems,
  }
}

function partialAxis(
  id: KemiAxisId,
  reason: 'empty' | 'private',
  lead: string,
  goodPoints: string[],
): KemiAxisReport {
  return {
    ...AXIS_META[id],
    id,
    strength: 0,
    lead,
    goodPoints,
    watchPoints: [],
    locked: false,
    partial: true,
    partialReason: reason,
    missingItems: [],
  }
}

// ── 커리어 ──────────────────────────────────────────────────────────────
function buildCareerAxis(purpose: KemiPurpose, viewer: KemiViewer, target: PublicProfile): KemiAxisReport {
  const viewerTitle = viewer.title?.trim()
  if (!viewerTitle) return viewerLockedAxis('career', ['활동 중인 일·직함'])

  const whoLocked = target.tabVisibility?.who === 'private'
  const careerHighlight = whoLocked ? undefined : target.manualHighlights.find((h) => h.categoryId === 'career-role')

  if (!careerHighlight) {
    const reason: 'empty' | 'private' = whoLocked ? 'private' : 'empty'
    const reasonText = whoLocked
      ? `${target.name}님이 이 정보를 비공개로 설정해둬서 경력을 비교하지 못했어요.`
      : `${target.name}님이 아직 경력 정보를 입력하지 않아서 비교하지 못했어요.`
    return partialAxis('career', reason,
      `${reasonText} 하지만 당신은 ${viewerTitle}(으)로 활동하고 있으니, 그 경험을 살려 이 관계를 이끌어볼 수 있어요.`,
      [purpose === 'work'
        ? `당신의 ${viewerTitle} 경험이면 처음 만나는 자리에서도 방향을 먼저 제안해볼 수 있어요.`
        : `당신의 ${viewerTitle} 경험을 편하게 얘깃거리로 꺼내볼 수 있어요.`])
  }

  const role = (careerHighlight.metadata?.role as string) ?? careerHighlight.subtitle
  const isCurrent = /현재|재직/.test(careerHighlight.subtitle) || /현재/.test(careerHighlight.year)

  if (purpose === 'work') {
    return {
      ...AXIS_META.career,
      id: 'career',
      strength: isCurrent ? 78 : 62,
      lead: `${target.name}님은 ${careerHighlight.title}에서 ${role}로 일하고, 당신은 ${viewerTitle}(으)로 활동 중이라 일로 만나면 서로 다른 축을 맡게 되는 조합이에요.`,
      goodPoints: [
        `역할이 겹치지 않아서 ${role} × ${viewerTitle} 조합이 서로의 빈 곳을 채워줘요.`,
        `${careerHighlight.year} 기준 경력이 이어지고 있어서 지금이 함께 움직이기 좋은 시점이에요.`,
      ],
      watchPoints: [
        '산업·직무가 다르면 초반엔 서로의 용어와 맥락을 맞추는 시간이 필요해요.',
      ],
      locked: false,
      partial: false,
      missingItems: [],
    }
  }

  return {
    ...AXIS_META.career,
    id: 'career',
    strength: isCurrent ? 78 : 62,
    lead: `친구로 보면 일 얘기보다 서로 사는 이야기가 더 궁금해질 사이예요. ${target.name}님은 ${careerHighlight.title}에서 ${role}로 바쁘게 지내고 있어요.`,
    goodPoints: [
      '하는 일이 겹치지 않아서 일 얘기를 안 해도 부담 없이 편하게 만날 수 있어요.',
      '서로 다른 세계 이야기를 들려줄 수 있어서 만날 때마다 새로운 얘깃거리가 생겨요.',
    ],
    watchPoints: [
      '바쁜 시기가 서로 다르면 약속을 미리 맞춰야 자주 볼 수 있어요.',
    ],
    locked: false,
    partial: false,
    missingItems: [],
  }
}

// ── 평판 ────────────────────────────────────────────────────────────────
function buildReputationAxis(purpose: KemiPurpose, target: PublicProfile): KemiAxisReport {
  const networkLocked = target.tabVisibility?.network === 'private'
  const keywords = networkLocked ? [] : (target.reputationKeywords ?? [])

  if (keywords.length === 0) {
    const reason: 'empty' | 'private' = networkLocked ? 'private' : 'empty'
    const reasonText = networkLocked
      ? `${target.name}님이 평판 정보를 비공개로 설정해둬서 분석하지 못했어요.`
      : `아직 ${target.name}님에 대한 평판이 쌓이지 않아서 분석하지 못했어요.`
    return partialAxis('reputation', reason,
      `${reasonText} 평판은 상대적인 축이라 지금은 미리 비교할 수 없지만, 실제로 만나보면서 서로에 대한 인상을 직접 쌓아가면 돼요.`,
      [])
  }

  const [top, second] = keywords
  const totalCount = keywords.reduce((sum, k) => sum + k.count, 0)
  const strength = Math.min(90, 45 + totalCount * 2)

  if (purpose === 'work') {
    return {
      ...AXIS_META.reputation,
      id: 'reputation',
      strength,
      lead: `함께 일해본 사람들 사이에서는 "${top.keyword}"라는 말이 가장 많이 나와요. 실무에서 이런 평판은 협업 신뢰의 기반이 돼요.`,
      goodPoints: [
        `"${top.keyword}"라는 평판이 ${top.count}건 쌓여 있어서 첫 프로젝트부터 믿고 맡기기 좋아요.`,
        ...(second ? [`"${second.keyword}"라는 평도 함께 있어서 한 가지 강점으로만 굳어져 있진 않아요.`] : []),
      ],
      watchPoints: [
        totalCount < 10
          ? '아직 표본이 많지 않은 편이라 실제 협업에서 다시 확인이 필요해요.'
          : '평판은 결국 실제로 함께 일해봐야 확인되는 부분이라 참고 정도로만 보세요.',
      ],
      locked: false,
      partial: false,
      missingItems: [],
    }
  }

  return {
    ...AXIS_META.reputation,
    id: 'reputation',
    strength,
    lead: `주변 사람들에게는 "${top.keyword}"라는 인상을 주는 편이라, 친구로서도 편하게 기댈 수 있는 사람이에요.`,
    goodPoints: [
      `"${top.keyword}"라는 말을 듣는 사람이라 사적으로도 믿음이 가요.`,
      ...(second ? [`"${second.keyword}"라는 평도 있어서 여러 면에서 좋은 인상을 주는 편이에요.`] : []),
    ],
    watchPoints: [
      '평판은 결국 직접 겪어봐야 아는 부분이라, 첫 만남 전엔 가벼운 참고로만 두세요.',
    ],
    locked: false,
    partial: false,
    missingItems: [],
  }
}

// ── 성격 ────────────────────────────────────────────────────────────────
function buildPersonalityAxis(purpose: KemiPurpose, viewerWhoIAm: PublicProfileWhoIAm | undefined, target: PublicProfile): KemiAxisReport {
  if (!viewerWhoIAm) return viewerLockedAxis('personality', ['MBTI(나의 성향)'])

  const me = getMbtiTraits(viewerWhoIAm.mbti)
  const whoLocked = target.tabVisibility?.who === 'private'
  const targetWhoIAm = whoLocked ? undefined : target.whoIAm

  if (!targetWhoIAm) {
    const reason: 'empty' | 'private' = whoLocked ? 'private' : 'empty'
    const reasonText = whoLocked
      ? `${target.name}님이 이 정보를 비공개로 설정해둬서 성향을 비교하지 못했어요.`
      : `${target.name}님이 아직 MBTI·성향을 입력하지 않아서 비교하지 못했어요.`
    return partialAxis('personality', reason,
      `${reasonText} 당신은 ${me.mbti} 성향이니, ${purpose === 'work' ? '이 판단 스타일을 먼저 밝히고 시작하면 협업 합의가 빨라져요.' : '이 성향을 먼저 보여주면 상대도 편하게 다가올 수 있어요.'}`,
      [purpose === 'work'
        ? `${me.thinking ? '기준과 판단을 먼저 정리해서 제안하면' : '분위기와 합의를 먼저 챙기면'} 첫 협업에서 신뢰를 빨리 얻을 수 있어요.`
        : `${me.extrovert ? '먼저 말을 걸어보면' : '천천히 곁을 내주면'} 관계를 자연스럽게 열어갈 수 있어요.`])
  }

  const them = getMbtiTraits(targetWhoIAm.mbti)
  const sameExtrovert = me.extrovert === them.extrovert
  const sameThinking = me.thinking === them.thinking
  const sameJudging = me.judging === them.judging
  const sameCount = [sameExtrovert, sameThinking, sameJudging].filter(Boolean).length
  const personalityLine = targetWhoIAm.personality

  if (purpose === 'work') {
    return {
      ...AXIS_META.personality,
      id: 'personality',
      strength: sameCount * 25 + 15,
      lead: `${target.name}님은 ${them.mbti}, 당신은 ${me.mbti} — 업무 판단 방식으로 보면 ${sameCount >= 2 ? '기질이 비슷해서 손발이 빨리 맞는 편' : '서로 다른 결이라 스타일 차이를 먼저 확인해볼 편'}이에요.`,
      goodPoints: [
        sameThinking
          ? '판단 기준(논리 vs 감정)이 비슷해서 의견이 갈려도 회의에서 대화로 잘 풀려요.'
          : '판단 기준이 달라서 서로 놓치기 쉬운 부분을 상대가 짚어줄 수 있어요.',
        sameJudging
          ? '계획을 세우는 방식이 비슷해서 마감·일정 감각이 잘 맞아요.'
          : '계획형과 즉흥형이 섞여 있어서 일정은 촘촘하게, 대응은 유연하게 갈 수 있어요.',
      ],
      watchPoints: [
        sameExtrovert
          ? '둘 다 비슷한 텐션이라 속도를 늦추는 역할이 따로 필요할 수 있어요.'
          : `${me.extrovert ? '당신은 빠르게 치고 나가는' : '당신은 신중하게 검토하는'} 편이고 ${target.name}님은 반대라 회의 속도를 맞추는 합의가 필요해요.`,
      ],
      locked: false,
      partial: false,
      missingItems: [],
    }
  }

  return {
    ...AXIS_META.personality,
    id: 'personality',
    strength: sameCount * 25 + 15,
    lead: `${target.name}님은 ${them.mbti}, 당신은 ${me.mbti} — 편하게 어울리는 텐션으로 보면 ${sameCount >= 2 ? '기질이 비슷한 편' : '서로 다른 결을 가진 편'}이에요.${personalityLine ? ` "${personalityLine}"` : ''}`,
    goodPoints: [
      sameExtrovert
        ? `둘 다 ${me.extrovert ? '먼저 대화를 여는' : '천천히 가까워지는'} 편이라 텐션 차이 없이 편하게 어울려요.`
        : '한쪽이 먼저 말을 걸고 한쪽이 받아주는 조합이라 대화가 끊기지 않아요.',
      sameJudging
        ? '약속을 대하는 방식이 비슷해서 만남 계획을 잡을 때 스트레스가 적어요.'
        : '한쪽이 계획하고 한쪽이 즉흥으로 즐기면서 서로의 빈틈을 채워줘요.',
    ],
    watchPoints: [
      sameThinking
        ? '둘 다 논리로 접근하는 편이라 가끔은 감정적인 위로가 아쉬울 수 있어요.'
        : '의사결정 기준이 달라서 같은 상황도 다르게 받아들일 수 있어요.',
    ],
    locked: false,
    partial: false,
    missingItems: [],
  }
}

// ── 생활 ────────────────────────────────────────────────────────────────
function buildLifeAxis(purpose: KemiPurpose, viewerLife: PublicProfileLife | undefined, target: PublicProfile): KemiAxisReport {
  const me = getLifestyleSignals(viewerLife)
  if (!me.exercise && !me.place) return viewerLockedAxis('life', ['바이브(생활) 1개'])

  const vibeLocked = target.tabVisibility?.vibe === 'private'
  const targetLife = vibeLocked ? undefined : target.life
  const hasLifeData = !!targetLife && (
    targetLife.daily.exercise.length > 0
    || targetLife.tastes.cafes.length > 0
    || targetLife.tastes.restaurants.length > 0
  )

  if (!hasLifeData) {
    const reason: 'empty' | 'private' = vibeLocked ? 'private' : 'empty'
    const reasonText = vibeLocked
      ? `${target.name}님이 라이프(바이브) 탭을 비공개로 설정해둬서 생활 반경을 비교하지 못했어요.`
      : `${target.name}님이 아직 라이프(바이브) 정보를 채우지 않아서 비교하지 못했어요.`
    const myThing = me.exercise ?? me.place ?? '일상'
    return partialAxis('life', reason,
      `${reasonText} 당신은 ${myThing} 위주로 지내니, 그 리듬을 먼저 보여주면 돼요.`,
      [purpose === 'work'
        ? `당신의 ${myThing} 루틴에 맞춰 미팅 시간대를 제안해볼 수 있어요.`
        : `${myThing}을(를) 먼저 공유하면서 만날 핑계를 만들어볼 수 있어요.`])
  }

  const them = getLifestyleSignals(targetLife)
  const sameExercise = !!me.exercise && me.exercise === them.exercise
  const samePlace = !!me.place && me.place === them.place
  const strength = (sameExercise ? 40 : 0) + (samePlace ? 40 : 0) + 15

  if (purpose === 'work') {
    return {
      ...AXIS_META.life,
      id: 'life',
      strength,
      lead: `${target.name}님의 일상은 ${them.exercise ?? '일상 루틴'}과 ${them.place ?? '단골 장소'} 위주예요. 일로 만날 때도 생활 반경이 겹치면 미팅 잡기가 한결 편해요.`,
      goodPoints: samePlace
        ? [`자주 가는 장소(${me.place})가 겹쳐서 미팅이나 가벼운 미팅 후 자리를 잡기 편해요.`]
        : [`생활 반경은 다르지만 그만큼 새로운 동네에서 미팅을 잡아볼 핑계가 생겨요.`],
      watchPoints: [
        '일과 시간대나 루틴이 다르면 미팅 시간을 조율하는 데 신경 써야 해요.',
      ],
      locked: false,
      partial: false,
      missingItems: [],
    }
  }

  const signals: string[] = []
  if (sameExercise) signals.push(`둘 다 ${me.exercise}을(를) 즐겨서 같이 움직일 확률이 높아요.`)
  if (samePlace) signals.push(`자주 가는 장소(${me.place})가 겹쳐서 우연히 마주칠 만한 생활 반경이에요.`)
  if (signals.length === 0) signals.push(`서로 다른 루틴이라 일부러 시간을 내야 자주 볼 수 있는 사이예요.`)

  return {
    ...AXIS_META.life,
    id: 'life',
    strength,
    lead: `${target.name}님의 일상은 ${them.exercise ?? '일상 루틴'}과 ${them.place ?? '단골 장소'} 위주예요. 친구로 지내려면 이 생활 반경이 얼마나 겹치는지가 중요해요.`,
    goodPoints: signals,
    watchPoints: [
      '생활 루틴이 다르면 약속을 미리 맞춰야 자주 볼 수 있어요.',
    ],
    locked: false,
    partial: false,
    missingItems: [],
  }
}

// ── 취향 ────────────────────────────────────────────────────────────────
function buildTasteAxis(purpose: KemiPurpose, viewerLife: PublicProfileLife | undefined, target: PublicProfile): KemiAxisReport {
  const myHook = getTasteHook(viewerLife)
  if (!myHook) return viewerLockedAxis('taste', ['바이브(취향) 1개'])

  const vibeLocked = target.tabVisibility?.vibe === 'private'
  const targetHook = vibeLocked ? undefined : getTasteHook(target.life)

  if (!targetHook) {
    const reason: 'empty' | 'private' = vibeLocked ? 'private' : 'empty'
    const reasonText = vibeLocked
      ? `${target.name}님이 라이프(바이브) 탭을 비공개로 설정해둬서 취향을 비교하지 못했어요.`
      : `${target.name}님이 아직 취향 정보를 채우지 않아서 비교하지 못했어요.`
    return partialAxis('taste', reason,
      `${reasonText} 당신은 ${myHook} 쪽을 좋아하니, 그 취향을 먼저 꺼내보면 돼요.`,
      [purpose === 'work'
        ? `${myHook} 얘기로 미팅 전후 가벼운 스몰토크를 열어볼 수 있어요.`
        : `${myHook}을(를) 먼저 소개하면서 다음 약속거리를 만들어볼 수 있어요.`])
  }

  const overlap = (['movies', 'music', 'books'] as const)
    .map((key) => {
      const mine = new Set((viewerLife?.tastes[key] ?? []).map((item) => item.label))
      return target.life?.tastes[key].find((item) => mine.has(item.label))?.label
    })
    .find(Boolean)
  const strength = overlap ? 82 : 35

  if (purpose === 'work') {
    return {
      ...AXIS_META.taste,
      id: 'taste',
      strength,
      lead: `같이 뭘 보고 듣는지로 보면 ${target.name}님은 ${targetHook} 쪽이에요. 일로 만난 사이에서는 회의 전후 가벼운 아이스브레이킹 소재로 딱이에요.`,
      goodPoints: overlap
        ? [`${overlap}을(를) 똑같이 좋아해서 미팅 전 스몰토크 소재가 바로 있어요.`]
        : [`취향은 다르지만 서로 소개하면서 미팅 분위기를 풀 소재로 쓰기 좋아요.`],
      watchPoints: [
        '업무 관계에서는 취향이 안 맞아도 큰 문제가 되진 않아요 — 참고만 하세요.',
      ],
      locked: false,
      partial: false,
      missingItems: [],
    }
  }

  return {
    ...AXIS_META.taste,
    id: 'taste',
    strength,
    lead: `같이 뭘 보고 듣는지로 보면, ${target.name}님은 ${targetHook} 쪽이에요. 친구 사이에서는 이게 바로 다음 약속의 이유가 돼요.`,
    goodPoints: overlap
      ? [`${overlap}을(를) 똑같이 좋아해요 — 정확히 겹치는 취향이라 대화가 쉽게 이어져요.`, '취향 대화 소재가 바로 있어서 처음부터 함께 할 거리가 많아요.']
      : [`${target.name}님은 ${targetHook}을(를) 즐기는데, 서로 취향을 소개하며 알아가는 재미로 접근하면 좋아요.`],
    watchPoints: overlap ? [] : ['겹치는 지점이 아직 뚜렷하지 않아서 몇 번 만나며 취향을 맞춰가야 해요.'],
    locked: false,
    partial: false,
    missingItems: [],
  }
}

function buildArchetype(purpose: KemiPurpose, target: PublicProfile, axes: KemiAxisReport[]): KemiArchetype {
  const comparableCount = axes.filter((a) => !a.locked && !a.partial).length
  const readyEnough = comparableCount >= 4

  if (purpose === 'work') {
    return {
      name: readyEnough ? '상호보완형' : '탐색형',
      verdict: readyEnough
        ? `일로 만나면 ${target.name}님과 서로 빈 곳을 채워주는 조합이에요.`
        : `아직 정보가 적어서 ${target.name}님과의 협업 궁합은 더 채워져야 뚜렷해져요.`,
      grade: readyEnough ? '채워주는 사이' : '더 알아갈 사이',
    }
  }

  return {
    name: readyEnough ? '편안한 동행형' : '탐색형',
    verdict: readyEnough
      ? `사적으로는 ${target.name}님과 무리하지 않고 편하게 어울릴 수 있는 사이예요.`
      : `아직 정보가 적어서 ${target.name}님과 얼마나 편할지는 더 지켜봐야 해요.`,
    grade: readyEnough ? '편한 사이' : '더 알아갈 사이',
  }
}

function buildNotes(purpose: KemiPurpose, target: PublicProfile, axes: KemiAxisReport[]): { goodNote: string; watchNote: string } {
  // 양쪽 다 있어야 진짜 "궁합"을 말할 수 있음 — locked(뷰어 미입력)·partial(상대 없음/비공개)은 제외
  const comparable = axes.filter((a) => !a.locked && !a.partial)
  const purposeWord = purpose === 'work' ? '함께 일할 때' : '친구로 지낼 때'

  if (comparable.length === 0) {
    return {
      goodNote: `아직 ${target.name}님과 직접 비교할 수 있는 정보가 부족해요. 서로 프로필을 더 채우면 구체적인 궁합을 볼 수 있어요.`,
      watchNote: '지금은 판단할 근거 자체가 부족해서, 직접 만나보며 알아가는 게 가장 정확해요.',
    }
  }

  const ranked = [...comparable].sort((a, b) => b.strength - a.strength)
  const strongest = ranked.slice(0, 2)
  const watchPool = [...ranked].reverse().filter((a) => a.watchPoints.length > 0)
  const weakest = (watchPool.length > 2 ? watchPool.slice(0, 2) : watchPool)

  const goodLabels = strongest.map((a) => a.label).join('·')
  const goodDetail = strongest
    .map((a) => a.goodPoints[0])
    .filter((text): text is string => !!text)
    .join(' ')
  const goodTail = purpose === 'work'
    ? '따로 애쓰지 않아도 자연스럽게 시너지가 나는 조합이에요.'
    : '무리하지 않아도 편하게 가까워지는 조합이에요.'

  const goodNote = `${purposeWord} 특히 ${goodLabels} 쪽에서 궁합이 강하게 맞아떨어져요. ${goodDetail} ${target.name}님과는 ${goodTail}`

  const watchLabels = weakest.map((a) => a.label).join('·')
  const watchDetail = weakest
    .map((a) => a.watchPoints[0])
    .filter((text): text is string => !!text)
    .join(' ')
  const watchTail = purpose === 'work'
    ? '서로 다른 방식을 미리 맞춰두면 오히려 협업의 강점이 될 수 있어요.'
    : '천천히 알아가면서 서로의 속도에 맞추면 자연스럽게 풀려요.'

  const watchNote = weakest.length > 0
    ? `반면 ${watchLabels} 쪽은 결이 좀 달라요. ${watchDetail} 다만 이건 ${target.name}님의 흠이 아니라 이 조합만의 특성이에요 — ${watchTail}`
    : `지금 확인된 축들은 대체로 잘 맞는 편이라 크게 조심할 지점은 없어요. 다만 어떤 관계든 ${watchTail}`

  return { goodNote, watchNote }
}

export function buildKemiReport(purpose: KemiPurpose, viewer: KemiViewer, target: PublicProfile): KemiReport {
  const axes: KemiAxisReport[] = [
    buildCareerAxis(purpose, viewer, target),
    buildReputationAxis(purpose, target),
    buildPersonalityAxis(purpose, viewer.whoIAm, target),
    buildLifeAxis(purpose, viewer.life, target),
    buildTasteAxis(purpose, viewer.life, target),
  ]

  return {
    axes,
    archetype: buildArchetype(purpose, target, axes),
    ...buildNotes(purpose, target, axes),
  }
}
