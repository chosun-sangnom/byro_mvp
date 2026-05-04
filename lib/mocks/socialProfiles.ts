// Temporary social fixtures used by onboarding/profile previews.
// TODO(real API): Replace these with connected social account payloads
// plus server-generated summaries and preview assets.

export const INSTAGRAM_PROFILE = {
  username: 'sss_uuo',
  profileUrl: 'https://www.instagram.com/sss_uuo/',
  biography: 'B2B SaaS / Product Owner / 창업 3년차 🚀',
  followersCount: 1240,
  aiSummary: '스타트업 마케팅과 비즈니스 네트워킹 콘텐츠를 주로 공유합니다. 팀 문화와 Growth 전략에 관심이 많으며, 주말 골프를 통한 커뮤니티 형성도 즐깁니다.',
  posts: [
    { id: '1', imageUrl: 'https://picsum.photos/seed/byro_ig1/400/400', caption: '비즈니스 네트워킹 행사 🤝 #networking #startup', timestamp: '2일 전' },
    { id: '2', imageUrl: 'https://picsum.photos/seed/byro_ig2/400/400', caption: '팀과 함께한 하루 💪 #team #buildinginpublic', timestamp: '4일 전' },
    { id: '3', imageUrl: 'https://picsum.photos/seed/byro_ig3/400/400', caption: 'Growth hacking 세션 📈 #growth #marketing', timestamp: '1주 전' },
    { id: '4', imageUrl: 'https://picsum.photos/seed/byro_ig4/400/400', caption: '주말 골프 라운딩 ⛳ #golf #weekend', timestamp: '2주 전' },
    { id: '5', imageUrl: 'https://picsum.photos/seed/byro_ig5/400/400', caption: 'TEDx 준비 중 🎤 #tedx #speaking', timestamp: '3주 전' },
    { id: '6', imageUrl: 'https://picsum.photos/seed/byro_ig6/400/400', caption: '팀 회식 🍜 #team #dinner', timestamp: '1달 전' },
  ],
}

export const LINKEDIN_PROFILE = {
  name: '강명구 (Myongkoo Kang)',
  profileUrl: 'https://www.linkedin.com/in/myongkoo-kang/',
  headline: 'B2B SaaS Product Owner | 스타트업 공동창업자 | Byro',
  aiSummary: 'Growth 마케팅과 B2B SaaS 제품 전략을 중심으로 활동하며, 스타트업 초기 마케팅 구조 설계 경험이 풍부합니다. 커뮤니티 기반 마케팅 사례를 자주 공유합니다.',
  recentPosts: [
    { id: '0', text: '오프라인에서 만난 신뢰를 온라인 프로필로 어떻게 이어붙일지 정리했습니다. 명함 이후의 프로필은 정보가 아니라 맥락을 남겨야 한다고 생각합니다.', likes: 267, date: '1일 전' },
    { id: '1', text: 'B2B SaaS에서 신뢰(Trust)가 왜 가장 강력한 성장 엔진인지 정리했습니다. CAC를 40% 낮춘 커뮤니티 기반 마케팅 실험기...', likes: 148, date: '3일 전' },
    { id: '2', text: 'Byro 개발 일지 #3 — 타인이 검증하고 채워주는 프로필 구조가 왜 더 신뢰를 만드는지에 대해...', likes: 203, date: '1주 전' },
  ],
}

export const MK_LINKEDIN_PROFILE = {
  name: '강명구',
  profileUrl: 'https://www.linkedin.com/in/myongkoo-kang/',
  aiSummary: '스타트업/비즈니스 리더 성격이 강하고 업무·리더십·산업 인사이트를 드러내는 활동이 주를 이룹니다. 최근에는 공간지능·공간컴퓨팅·피지컬 AI 관련 강연과 대외 활동 언급이 확인됩니다.',
  previewImage: '/images/MK_Linkedin_v2.png',
}
