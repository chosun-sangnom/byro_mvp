export interface ReputationKeywordGroup {
  category: string
  keywords: string[]
}

export const REPUTATION_KEYWORD_GROUPS: ReputationKeywordGroup[] = [
  {
    category: '관계',
    keywords: [
      '주변에 소개하고 싶어요',
      '먼저 챙겨줘요',
    ],
  },
  {
    category: '분위기',
    keywords: [
      '같이 있으면 에너지가 올라가요',
      '어떤 자리든 자연스럽게 녹아들어요',
      '유머 감각이 좋아요',
    ],
  },
  {
    category: '신뢰',
    keywords: [
      '믿고 맡길 수 있어요',
      '솔직하게 말해줘요',
      '어려울 때 생각나는 사람이에요',
    ],
  },
  {
    category: '인상',
    keywords: [
      '분위기가 있어요',
      '카리스마가 느껴져요',
      '스타일이 세련됐어요',
    ],
  },
  {
    category: '일·실행',
    keywords: [
      '일 처리가 빠르고 깔끔해요',
      '아이디어가 늘 신선해요',
      '전문성이 느껴져요',
    ],
  },
  {
    category: '인사이트',
    keywords: [
      '대화하면 생각이 넓어져요',
      '트렌드에 밝아요',
    ],
  },
]

export const REPUTATION_KEYWORDS = REPUTATION_KEYWORD_GROUPS.flatMap((group) => group.keywords)
