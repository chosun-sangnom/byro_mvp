'use client'

import type { PublicProfileLife, PublicProfileWhoIAm } from '@/types'

export type CompatibilityMode = 'romance' | 'business' | 'friend'

type SajuProfile = {
  alias: string
  summary: string
  modeCopy: Record<CompatibilityMode, string>
  caution: Record<CompatibilityMode, string>
}

const SAJU_PROFILES: Record<string, SajuProfile> = {
  경금: {
    alias: '기준이 분명한 금의 결',
    summary: '판단이 빠르고 기준이 선명해서 사람을 볼 때도 태도와 일관성을 중요하게 읽는 타입입니다.',
    modeCopy: {
      romance: '감정의 크기보다 태도의 안정감과 신뢰 신호가 보여야 호감이 커지는 편입니다.',
      business: '역할과 책임이 명확한 파트너십에서 속도가 붙고, 결정을 오래 미루지 않는 편입니다.',
      friend: '말수보다 행동과 약속 이행으로 신뢰를 쌓는 친구형 흐름이 강합니다.',
    },
    caution: {
      romance: '애매한 신호가 길어지면 마음이 빨리 닫힐 수 있습니다.',
      business: '기준 없이 오락가락하는 협업은 피로감이 크게 느껴질 수 있습니다.',
      friend: '겉도는 인사만 반복되면 관계를 얕게 판단할 가능성이 있습니다.',
    },
  },
  임수: {
    alias: '흐름을 읽는 물의 결',
    summary: '사람과 상황의 맥락을 빠르게 읽고 판을 넓히는 성향이라, 관계를 연결하는 감각이 좋은 타입입니다.',
    modeCopy: {
      romance: '대화가 유연하게 흐르고 감정선이 자연스러울 때 케미가 커지는 편입니다.',
      business: '변수 대응과 네트워킹이 필요한 협업에서 강점이 크게 드러납니다.',
      friend: '상대의 텐션을 읽어 관계 온도를 맞추는 데 능숙한 편입니다.',
    },
    caution: {
      romance: '리듬이 끊기면 흥미가 다른 데로 빠르게 흐를 수 있습니다.',
      business: '방향 정의 없이 아이디어만 많아지면 실행 밀도가 떨어질 수 있습니다.',
      friend: '넓게 연결되는 대신 깊이가 얕아질 수 있어 후속 약속이 중요합니다.',
    },
  },
  정화: {
    alias: '온도를 만드는 불의 결',
    summary: '분위기와 감정을 밝히는 힘이 있고, 관계의 온도를 빠르게 만드는 데 강점이 있는 타입입니다.',
    modeCopy: {
      romance: '호감 신호와 감정 교류가 분명할수록 빠르게 가까워지는 흐름이 강합니다.',
      business: '브랜딩, 설득, 대외 커뮤니케이션이 필요한 자리에서 존재감이 크게 보입니다.',
      friend: '사람을 편하게 만들고 자리를 환하게 여는 친구형 케미가 강합니다.',
    },
    caution: {
      romance: '반응이 무덤덤하면 에너지가 빠르게 가라앉을 수 있습니다.',
      business: '관계 톤은 좋은데 실행 기준이 흐리면 기대치가 어긋날 수 있습니다.',
      friend: '분위기만 좋고 구체적인 다음 액션이 없으면 관계가 가볍게 남을 수 있습니다.',
    },
  },
}

export function getSajuProfile(sajuType: string): SajuProfile {
  return SAJU_PROFILES[sajuType] ?? {
    alias: `${sajuType}의 결`,
    summary: '관계에서 보여주는 결을 읽기 위해 사주 타입을 참고한 상태입니다.',
    modeCopy: {
      romance: '감정 템포와 신뢰 신호를 함께 읽는 관계형 흐름으로 해석됩니다.',
      business: '역할과 책임의 배분, 협업 리듬을 함께 보는 타입으로 해석됩니다.',
      friend: '공통 취향과 생활 반경을 매개로 가까워지는 흐름으로 해석됩니다.',
    },
    caution: {
      romance: '신호가 애매하면 해석 차이가 생길 수 있습니다.',
      business: '역할 정의가 늦어지면 합이 흐려질 수 있습니다.',
      friend: '가벼운 연결만 남고 깊이가 생기지 않을 수 있습니다.',
    },
  }
}

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
    ?? life?.tastes.sports[0]
    ?? life?.daily.exercise[0]?.label
    ?? null
  )
}

export function getSignalChips(whoIAm: PublicProfileWhoIAm, life?: PublicProfileLife) {
  return [
    whoIAm.mbti,
    whoIAm.sajuType,
    life?.places.neighborhoods[0],
    life?.daily.exercise[0]?.label,
    life?.tastes.music[0]?.label,
    life?.tastes.cafes[0]?.label,
  ].filter(Boolean) as string[]
}

export function getLifestyleSignals(life?: PublicProfileLife) {
  return {
    activity:
      life?.daily.exercise[0]?.label
      ?? life?.tastes.teams?.[0]?.label
      ?? life?.tastes.sports[0]
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
      ?? life?.places.neighborhoods[0]
      ?? life?.places.travelDestinations[0]?.label
      ?? null,
    neighborhood: life?.places.neighborhoods[0] ?? null,
    exercise: life?.daily.exercise[0]?.label ?? null,
    tasteHook: getTasteHook(life),
  }
}
