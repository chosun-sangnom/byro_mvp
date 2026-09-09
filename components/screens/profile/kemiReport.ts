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
  Highlight,
  KemiArchetype,
  KemiAxisId,
  KemiAxisReport,
  KemiPurpose,
  KemiReport,
  PublicProfile,
  PublicProfileLife,
  PublicProfileWhoIAm,
  ReputationKeyword,
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

// 상단 요약 카드 — 비교 가능한 축의 매칭 강도를 한 문장으로 요약한다.
// "정보가 부족하다" 같은 표현은 절대 쓰지 않는다. 항상 유형명 + 근거 + 결론으로.
function buildArchetype(purpose: KemiPurpose, target: PublicProfile, axes: KemiAxisReport[]): KemiArchetype {
  const comparable = axes.filter((a) => !a.locked && !a.partial)
  const ranked = [...comparable].sort((a, b) => b.strength - a.strength)
  const avg = comparable.length
    ? comparable.reduce((sum, a) => sum + a.strength, 0) / comparable.length
    : 42

  const strongLabels = ranked.filter((a) => a.strength >= 35).slice(0, 2).map((a) => a.label)
  const reason = strongLabels.length > 0
    ? `${strongLabels.join('·')} 궁합이 잘 맞아서`
    : purpose === 'work' ? '일하는 결이 통해서' : '지내는 결이 통해서'

  const tiers = purpose === 'work'
    ? [
        { min: 66, name: '환상의 팀', grade: '최고의 궁합', tail: '함께 일하면 시너지가 크게 나요.' },
        { min: 46, name: '손발 맞는 사이', grade: '좋은 궁합', tail: '조금만 맞추면 매끄럽게 굴러가요.' },
        { min: 26, name: '보완하는 사이', grade: '무난한 궁합', tail: '방식이 달라 오히려 서로 빈 곳을 채워줘요.' },
        { min: -1, name: '색다른 조합', grade: '알아갈수록 좋은 궁합', tail: '결이 다른 만큼 새로운 시야를 주고받아요.' },
      ]
    : [
        { min: 66, name: '단짝형', grade: '최고의 궁합', tail: `${target.name}님과는 편하게 가까워질 수 있어요.` },
        { min: 46, name: '잘 맞는 사이', grade: '좋은 궁합', tail: '무리하지 않아도 자연스럽게 어울려요.' },
        { min: 26, name: '천천히 가까워지는 사이', grade: '무난한 궁합', tail: '몇 번 만나면 금방 편해지는 사이예요.' },
        { min: -1, name: '색다른 매력', grade: '알아갈수록 좋은 궁합', tail: '취향과 리듬이 달라 알아가는 재미가 있어요.' },
      ]
  const tier = tiers.find((t) => avg >= t.min)!

  return {
    name: tier.name,
    verdict: `${reason} ${tier.tail}`,
    grade: tier.grade,
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

export function buildKemiReport(
  purpose: KemiPurpose,
  viewer: KemiViewer,
  target: PublicProfile,
  opts?: { forceLifeLock?: boolean },
): KemiReport {
  const axes: KemiAxisReport[] = [
    buildCareerAxis(purpose, viewer, target),
    buildReputationAxis(purpose, target),
    buildPersonalityAxis(purpose, viewer.whoIAm, target),
    // [임시] forceLifeLock — 뷰어 미입력으로 생활 축이 잠기는 패턴을 보여주기 위한 목업 스위치
    opts?.forceLifeLock
      ? viewerLockedAxis('life', ['바이브(생활) 1개'])
      : buildLifeAxis(purpose, viewer.life, target),
    buildTasteAxis(purpose, viewer.life, target),
  ]

  return {
    axes,
    archetype: buildArchetype(purpose, target, axes),
    ...buildNotes(purpose, target, axes),
  }
}

// ── 내 케미리포트 (나와 잘 맞는 사람, 5축) ────────────────────────────────────
// 상대가 없는 "나 혼자" 리포트라 협업/관계 구분이 필요 없다 — 축마다 나의 유형
// (직군/MBTI/생활 패턴)을 짚고, 통계적으로 "이런 나는 이런 사람과 잘 어울린다"를
// 잘 맞는 유형 / 조심할 유형으로 안내한다.

export interface SelfKemiAxis {
  id: KemiAxisId
  label: string
  lead: string
  /** 이 축에서 나와 잘 맞는 사람의 특징 */
  matchWith: string[]
  /** 이 축에서 부딪히기 쉬운 사람의 특징 */
  clashWith: string[]
  locked: boolean
  missingItems: string[]
}

function selfLockedAxis(id: KemiAxisId, missingItems: string[]): SelfKemiAxis {
  return { id, label: AXIS_META[id].label, lead: '', matchWith: [], clashWith: [], locked: true, missingItems }
}

interface CareerArchetype {
  match: RegExp
  label: string
  matchWith: string[]
  clashWith: string[]
}

const CAREER_ARCHETYPES: CareerArchetype[] = [
  {
    match: /대표|창업|오너|CEO|공동창업/i,
    label: '오너·창업자형',
    matchWith: ['큰 그림을 흔들림 없이 실행으로 옮겨주는 꼼꼼한 실무형과 시너지가 나요.', '결정 속도에 발맞춰주는 사람과 함께할 때 일이 빠르게 굴러가요.'],
    clashWith: ['모든 걸 합의로만 정하려는 사람과는 답답함을 느낄 수 있어요.'],
  },
  {
    // '프로덕트 디자이너'가 PM으로 잡히지 않도록 디자이너를 먼저 검사
    match: /디자이너|디자인|Design/i,
    label: '디자이너형',
    matchWith: ['피드백을 구체적으로, 이유와 함께 주는 사람과 편하게 일해요.', '완성도의 가치를 알아주는 사람과 호흡이 잘 맞아요.'],
    clashWith: ['취향으로 뭉뚱그려 지적하는 사람과는 예민해질 수 있어요.'],
  },
  {
    match: /PM|프로덕트|기획|Product/i,
    label: 'PM·기획형',
    matchWith: ['방향만 주면 알아서 파고드는 실행형과 잘 맞아요.', '근거와 데이터로 대화하는 사람과 호흡이 잘 맞아요.'],
    clashWith: ['즉흥적으로 판을 자주 바꾸는 사람과는 계획이 계속 어그러질 수 있어요.'],
  },
  {
    match: /개발|엔지니어|Engineer|Developer/i,
    label: '개발자형',
    matchWith: ['맥락과 이유를 미리 정리해서 전달해주는 사람과 편하게 일해요.', '기준과 약속을 지키는 사람과 신뢰가 빠르게 쌓여요.'],
    clashWith: ['근거 없이 밀어붙이거나 방향을 자주 바꾸는 사람과는 부딪힐 수 있어요.'],
  },
  {
    match: /마케팅|브랜드|Marketing|Brand/i,
    label: '마케팅·브랜드형',
    matchWith: ['아이디어를 숫자로 검증해주는 분석형과 균형이 잘 맞아요.', '빠른 실험을 함께 즐기는 사람과 에너지가 잘 통해요.'],
    clashWith: ['정해진 절차만 고집하는 사람과는 속도가 안 맞을 수 있어요.'],
  },
  {
    match: /세일즈|영업|사업개발|Sales|BD/i,
    label: '세일즈·사업개발형',
    matchWith: ['맺어온 관계 뒤를 촘촘하게 챙겨주는 운영형과 잘 맞아요.', '거절에도 함께 담담한 사람과 오래 갑니다.'],
    clashWith: ['숫자 압박에 예민하게 반응하는 사람과는 서로 지칠 수 있어요.'],
  },
  {
    match: /투자|심사역|VC|파트너/i,
    label: '투자·심사역형',
    matchWith: ['핵심을 짧게 정리해서 말해주는 사람과 대화가 잘 통해요.', '리스크를 솔직하게 먼저 공유하는 사람과 신뢰가 쌓여요.'],
    clashWith: ['근거 없이 확신만 앞세우는 사람과는 거리가 생기기 쉬워요.'],
  },
  {
    match: /변호사|회계사|컨설턴트|컨설팅|Consultant/i,
    label: '전문직·컨설팅형',
    matchWith: ['논리적인 대화를 즐기고 근거를 챙기는 사람과 잘 맞아요.', '원칙을 존중하는 사람과 신뢰가 오래 갑니다.'],
    clashWith: ['즉흥적으로 규칙을 건너뛰는 사람과는 답답함을 느낄 수 있어요.'],
  },
  {
    match: /크리에이터|콘텐츠|작가|Creator|유튜브/i,
    label: '크리에이터·콘텐츠형',
    matchWith: ['꾸준함으로 기복을 받쳐주는 안정적인 사람과 잘 맞아요.', '자기 색깔을 존중해주는 사람과 편하게 어울려요.'],
    clashWith: ['모든 걸 정량 지표로만 재려는 사람과는 결이 안 맞을 수 있어요.'],
  },
]

const DEFAULT_CAREER_ARCHETYPE: Omit<CareerArchetype, 'match'> = {
  label: '전문가형',
  matchWith: ['서로의 전문 영역을 존중하고 배우려는 사람과 잘 맞아요.', '맡은 건 끝까지 하는 책임감 있는 사람과 신뢰가 쌓여요.'],
  clashWith: ['익숙한 방식을 갑자기 뒤엎으려는 사람과는 조율할 시간이 필요해요.'],
}

function buildSelfCareerAxis(title: string, manualHighlights: Highlight[]): SelfKemiAxis {
  const roleText = [
    title,
    ...manualHighlights.filter((h) => h.categoryId === 'career-role').map((h) => (h.metadata?.role as string) ?? h.subtitle),
  ].join(' ').trim()

  if (!roleText) return selfLockedAxis('career', ['활동명 직함 또는 하이라이트(경력)'])

  const archetype = CAREER_ARCHETYPES.find((a) => a.match.test(roleText)) ?? DEFAULT_CAREER_ARCHETYPE

  return {
    id: 'career',
    label: AXIS_META.career.label,
    lead: `${title ? `${title}(으)로 활동하는` : '지금 하는 일로 보면'} 당신은 ${archetype.label}이에요. 일로 만나는 사람 중엔 이런 결이 잘 맞아요.`,
    matchWith: archetype.matchWith,
    clashWith: archetype.clashWith,
    locked: false,
    missingItems: [],
  }
}

function buildSelfReputationAxis(keywords: ReputationKeyword[]): SelfKemiAxis {
  if (keywords.length === 0) return selfLockedAxis('reputation', ['평판 키워드 1개 이상'])

  const [top, second] = keywords

  return {
    id: 'reputation',
    label: AXIS_META.reputation.label,
    lead: `주변에선 당신을 "${top.keyword}"로 가장 많이 기억해요${second ? `, "${second.keyword}"도 자주 나오고요` : ''}.`,
    matchWith: [
      `"${top.keyword}"라는 인상을 편하게 받아들이고 비슷한 신뢰를 돌려주는 사람과 오래 갑니다.`,
    ],
    clashWith: [
      '첫인상만으로 사람을 판단하는 사람과는 진짜 모습을 보여주기까지 시간이 걸려요.',
    ],
    locked: false,
    missingItems: [],
  }
}

function buildSelfPersonalityAxis(whoIAm?: PublicProfileWhoIAm): SelfKemiAxis {
  if (!whoIAm) return selfLockedAxis('personality', ['MBTI'])

  const { mbti, extrovert, thinking, judging } = getMbtiTraits(whoIAm.mbti)

  return {
    id: 'personality',
    label: AXIS_META.personality.label,
    lead: `${mbti}${whoIAm.personality ? ` · "${whoIAm.personality}"` : ''} — 성향으로 보면 이런 사람과 균형이 잘 맞아요.`,
    matchWith: [
      extrovert
        ? '차분하게 중심을 잡아주는 내향적인 사람과 텐션이 잘 맞아요.'
        : '분위기를 먼저 열어주는 외향적인 사람과 함께 있으면 편해요.',
      thinking
        ? '감정을 살뜰히 챙겨주는 사람과 서로 부족한 면을 채워줘요.'
        : '결정을 분명하게 내려주는 사람과 함께할 때 든든해요.',
    ],
    clashWith: [
      judging
        ? '계획을 자주 뒤엎는 즉흥적인 사람과는 스트레스를 받을 수 있어요.'
        : '모든 걸 미리 정해두려는 사람과는 답답함을 느낄 수 있어요.',
    ],
    locked: false,
    missingItems: [],
  }
}

function buildSelfLifeAxis(life?: PublicProfileLife): SelfKemiAxis {
  const signals = getLifestyleSignals(life)
  const hasPet = !!life?.daily.pets?.length

  if (!signals.exercise && !signals.place && !hasPet) return selfLockedAxis('life', ['바이브(생활) 1개'])

  const secondMatch = signals.exercise
    ? `${signals.exercise} 같은 활동을 함께 즐기는 사람과 쉽게 가까워져요.`
    : hasPet
      ? '반려동물을 키우는 사람과는 공감대가 빨리 생겨요.'
      : `${signals.place ?? '자주 가는 동네'}가 겹치는 사람과 금방 친해져요.`

  return {
    id: 'life',
    label: AXIS_META.life.label,
    lead: `일상은 ${signals.exercise ?? signals.place ?? '자기만의 루틴'} 위주로 흘러가요. 생활이 겹치는 사람과 자연스럽게 자주 보게 돼요.`,
    matchWith: [
      '생활 반경이나 활동 시간대가 겹치는 사람과는 따로 애쓰지 않아도 자주 마주쳐요.',
      secondMatch,
    ],
    clashWith: [
      '활동 시간대나 리듬이 정반대인 사람과는 일부러 시간을 맞춰야 볼 수 있어요.',
    ],
    locked: false,
    missingItems: [],
  }
}

function buildSelfTasteAxis(life?: PublicProfileLife): SelfKemiAxis {
  const hook = getTasteHook(life)
  if (!hook) return selfLockedAxis('taste', ['바이브(취향) 1개'])

  const genreCount = (['movies', 'music', 'books', 'plays'] as const)
    .filter((key) => (life?.tastes[key]?.length ?? 0) > 0).length
  const wide = genreCount >= 3

  return {
    id: 'taste',
    label: AXIS_META.taste.label,
    lead: `${hook} 같은 취향을 보면 ${wide ? '여러 장르를 폭넓게 즐기는' : '좋아하는 걸 깊이 파는'} 편이에요.`,
    matchWith: [
      wide
        ? '취향의 폭이 넓어서 어떤 취향의 사람과도 대화가 잘 통해요.'
        : `${hook} 쪽을 똑같이 좋아하는 사람과는 처음부터 할 얘기가 많아요.`,
    ],
    clashWith: [
      wide
        ? '하나에 깊이 빠져 있는 사람에겐 가볍게 느껴질 수도 있어요.'
        : '취향이 아예 다른 사람과는 공통 화제를 찾는 데 시간이 걸려요.',
    ],
    locked: false,
    missingItems: [],
  }
}

export function buildSelfKemiAxes(input: {
  title: string
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
  manualHighlights: Highlight[]
  reputationKeywords?: ReputationKeyword[]
}): SelfKemiAxis[] {
  return [
    buildSelfCareerAxis(input.title, input.manualHighlights),
    buildSelfReputationAxis(input.reputationKeywords ?? []),
    buildSelfPersonalityAxis(input.whoIAm),
    buildSelfLifeAxis(input.life),
    buildSelfTasteAxis(input.life),
  ]
}
