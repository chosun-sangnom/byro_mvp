// Temporary keyword catalogs used during onboarding and profile editing.
// TODO(real API): Replace with keyword taxonomy/config metadata delivered by
// the onboarding bootstrap endpoint or admin-managed configuration.

export const KEYWORD_GROUPS = [
  { category: '신뢰 / 인성', keywords: ['신뢰할 수 있는', '진정성 있는', '책임감 있는', '따뜻한', '정직한', '윤리적인', '배려있는'] },
  { category: '전문성 / 역량', keywords: ['전문적인', '통찰력 있는', '논리적인', '창의적인', '실력있는', '문제해결력 있는', '분석적인'] },
  { category: '업무 스타일', keywords: ['실행력 있는', '꼼꼼한', '전략적인', '추진력 있는', '체계적인', '결단력 있는', '도전적인', '효율적인', '집중력 있는'] },
  { category: '관계 / 네트워킹', keywords: ['사교적인', '협력적인', '리더십 있는', '소통을 잘하는', '팀플레이어', '네트워크가 넓은'] },
  { category: '외형 / 인상', keywords: ['스마트한', '세련된', '카리스마 있는', '유쾌한', '친근한'] },
]

export const EXPERIENCE_KEYWORDS = [
  '전문적인', '신뢰할 수 있는', '통찰력 있는', '실행력 있는',
  '유쾌한', '진정성 있는', '배려있는', '창의적인', '소통을 잘하는',
]
