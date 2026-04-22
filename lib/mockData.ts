import type { ContactChannel } from '@/types'

// ─── Instagram 프로필 (sss_uuo)
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

// ─── LinkedIn 프로필 (myongkoo-kang)
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

// ─── AI 자기소개 후보 (랜덤 선택)
export const AI_BIO_CANDIDATES = [
  'B2B SaaS 분야에서 5년간 Product Owner로 활동해 온 강명구입니다. 전문성과 신뢰를 바탕으로 팀을 이끌며 비즈니스 성장을 만들어가는 것을 즐깁니다. 마케팅에도 관심이 많아 콜드스타트 문제를 고민하고 있습니다. 주말마다 골프를 즐기고 있어 라운딩 제안도 환영합니다.',
  'Growth 전략과 커뮤니티 기반 마케팅으로 스타트업 성장을 이끌어온 강명구입니다. 파트너십을 통해 새로운 가치를 만들어가는 것을 즐기며, 신뢰 기반 네트워크가 최고의 자산이라 생각합니다.',
  '창업 3년차 스타트업 대표 강명구입니다. 5년간의 B2B SaaS 경험을 바탕으로 사람과 사람을 연결하는 서비스를 만들고 있습니다. TEDx 강연자이기도 하며 네트워킹과 비즈니스 성장에 관심이 많습니다.',
]

// ─── 키워드 그룹
export const KEYWORD_GROUPS = [
  { category: '신뢰 / 인성', keywords: ['신뢰할 수 있는', '진정성 있는', '책임감 있는', '따뜻한', '정직한', '윤리적인', '배려있는'] },
  { category: '전문성 / 역량', keywords: ['전문적인', '통찰력 있는', '논리적인', '창의적인', '실력있는', '문제해결력 있는', '분석적인'] },
  { category: '업무 스타일', keywords: ['실행력 있는', '꼼꼼한', '전략적인', '추진력 있는', '체계적인', '결단력 있는', '도전적인', '효율적인', '집중력 있는'] },
  { category: '관계 / 네트워킹', keywords: ['사교적인', '협력적인', '리더십 있는', '소통을 잘하는', '팀플레이어', '네트워크가 넓은'] },
  { category: '외형 / 인상', keywords: ['스마트한', '세련된', '카리스마 있는', '유쾌한', '친근한'] },
]

// ─── 경험 남기기 키워드
export const EXPERIENCE_KEYWORDS = [
  '전문적인', '신뢰할 수 있는', '통찰력 있는', '실행력 있는',
  '유쾌한', '진정성 있는', '배려있는', '창의적인', '소통을 잘하는',
]

// ─── 하이라이트 카테고리
export const HIGHLIGHT_CATEGORIES = [
  { id: 'talk',      icon: '🎤', label: '강연 / 연설' },
  { id: 'collab',    icon: '🤝', label: '협업 프로젝트' },
  { id: 'award',     icon: '🏆', label: '수상 / 표창' },
  { id: 'publish',   icon: '📝', label: '출판 / 기고' },
  { id: 'volunteer', icon: '🌱', label: '봉사 / 사회공헌' },
  { id: 'edu',       icon: '📚', label: '강의 / 교육' },
  { id: 'other',     icon: '⭐', label: '기타' },
]

// ─── 샘플 공개 프로필 (myongkoo)
export const SAMPLE_PROFILE = {
  linkId: 'myongkoo',
  name: '강명구',
  title: 'B2B SaaS Product Owner · 스타트업 공동창업자',
  avatarColor: '#DCC5B6',
  avatarImage: '',
  headline: '커뮤니티 기반 성장을 설계하는 B2B SaaS 빌더',
  school: 'KAIST 경영학과 졸업',
  bio: 'B2B SaaS 분야에서 5년간 Product Owner로 활동해 온 강명구입니다. 파트너십을 통해 성장을 만들어가는 것을 즐깁니다.',
  heroTheme: {
    cover: 'from-[#B69B8B] via-[#836F66] to-[#121212]',
    avatar: 'from-[#DCC5B6] to-[#8F7265]',
  },
  contactChannels: [
    { id: 'phone', label: '전화', value: '010-9482-1158', href: 'tel:01094821158', enabled: true },
    { id: 'email', label: '이메일', value: 'myongkoo@byro.io', href: 'mailto:myongkoo@byro.io', enabled: true },
    { id: 'kakao', label: '카카오', value: 'myongkoo.kakao', href: 'https://open.kakao.com/o/smyongkoo', enabled: true },
    { id: 'telegram', label: '텔레그램', value: '@myongkoo', href: 'https://t.me/myongkoo', enabled: false },
  ] as ContactChannel[],
  selectedKeywords: ['전문적인', '신뢰할 수 있는', '통찰력 있는', '실행력 있는', '창의적인'],
  instagramConnected: true,
  linkedinConnected: true,
  careerHighlight: { avgYears: 4.2, vsIndustryPercent: 128 },
  corporateHighlight: {
    companyCount: 2,
    averageOperatingYears: 5,
    summary: '2개 법인 · 평균 운영 5년 · 모두 정상 운영 중',
  },
  rememberHighlight: {
    total: 247,
    industries: [
      { name: '스타트업', ratio: 38 },
      { name: '마케팅',   ratio: 24 },
      { name: 'IT',      ratio: 22 },
      { name: '투자',    ratio: 16 },
    ],
  },
  airlineHighlight: {
    tierSummary: '대한항공 모닝캄 · 아시아나 다이아몬드',
    badgeLevel: 'global_business',
    airlines: [
      { name: '대한항공', tier: '모닝캄' },
      { name: '아시아나', tier: '다이아몬드' },
    ],
  },
  manualHighlights: [
    { id: 'mh1', icon: '🎤', title: 'TEDx Seoul 2023', subtitle: '강연 / 연설 · 직접 입력', description: '신뢰 기반 네트워킹의 미래를 주제로 강연', year: '2023' },
    { id: 'mh2', icon: '🌏', title: '일본 파트너사 협업 프로젝트', subtitle: '협업 프로젝트 · 직접 입력', description: '6개월 간 일본 파트너사와 B2B 제품 공동 개발', year: '2022' },
  ],
  experiences: [
    { id: 'e1', authorName: '김지수', isAnonymous: false, keywords: ['전문적인', '통찰력 있는'], message: '정말 통찰력 있는 분이에요. 같이 일하고 싶다!', date: '2일 전' },
    { id: 'e2', authorName: null, isAnonymous: true, keywords: ['신뢰할 수 있는', '실행력 있는'], message: '', date: '5일 전' },
    { id: 'e3', authorName: '박소연', isAnonymous: false, keywords: ['창의적인'], message: '아이디어가 넘치는 분입니다 👏', date: '1주 전' },
  ],
  savedProfiles: [
    { id: 'p1', linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', memo: '비즈니스 살롱 2026.03 · 마케팅 인사이트 굿', savedAt: '3일 전' },
    { id: 'p2', linkId: 'parkseoyeon', name: '박서연', title: '콘텐츠 크리에이터', memo: '', savedAt: '1주 전' },
    { id: 'p3', linkId: 'kimdohyeon', name: '김도현', title: '독립 재무설계사', memo: '', savedAt: '2주 전' },
  ],
  recentProfiles: [
    { id: 'p1', linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', viewedAt: '방금 전' },
    { id: 'p4', linkId: 'parkseoyeon', name: '박서연', title: '콘텐츠 크리에이터', viewedAt: '1시간 전' },
    { id: 'p5', linkId: 'chijiwon', name: '최지원', title: 'VC 심사역', viewedAt: '3시간 전' },
  ],
  receivedRequests: [
    { id: 'r1', linkId: 'jiminlee', name: '이지민', message: '"같이 일해봤는데 꼭 남겨주세요 🙏"', requestedAt: '방금 전' },
    { id: 'r2', linkId: 'chijiwon', name: '최지원', message: null, requestedAt: '2일 전' },
  ],
  // 평판 키워드 집계 (공개 프로필용)
  reputationKeywords: [
    { keyword: '전문적인', count: 8 },
    { keyword: '신뢰할 수 있는', count: 6 },
    { keyword: '통찰력 있는', count: 4 },
    { keyword: '실행력 있는', count: 3 },
    { keyword: '창의적인', count: 2 },
  ],
  // 방명록
  guestbook: [
    { id: 'g1', linkId: 'jiminlee', authorName: '이지민', message: '정말 인사이트 넘치는 분.', date: '3일 전' },
    { id: 'g2', linkId: 'parkseoyeon', authorName: '박서연', message: '실행력이 정말 대단하신 분.', date: '1주 전' },
  ],
}

// ─── 이지민 공개 프로필
export const JIMIN_PROFILE = {
  linkId: 'jiminlee',
  name: '이지민',
  title: '스타트업 마케터 4년 경력',
  avatarColor: '#D8C4B2',
  avatarImage: '',
  headline: '브랜드와 사람을 연결하는 스타트업 마케터',
  school: '연세대학교 경영학과 졸업',
  bio: '스타트업 생태계에서 브랜드와 사람을 연결하는 마케터입니다.',
  heroTheme: {
    cover: 'from-[#B9A597] via-[#7F6A61] to-[#101010]',
    avatar: 'from-[#D8C4B2] to-[#8A7167]',
  },
  contactChannels: [
    { id: 'phone', label: '전화', value: '010-2437-1022', href: 'tel:01024371022', enabled: true },
    { id: 'email', label: '이메일', value: 'jimin@byro.io', href: 'mailto:jimin@byro.io', enabled: true },
    { id: 'kakao', label: '카카오', value: 'jimin.marketer', href: 'https://open.kakao.com/o/sjimin', enabled: true },
    { id: 'telegram', label: '텔레그램', value: '@jimin_connect', href: 'https://t.me/jimin_connect', enabled: false },
  ] as ContactChannel[],
  selectedKeywords: ['전문적인', '신뢰할 수 있는', '통찰력 있는'],
  instagramConnected: true,
  linkedinConnected: false,
  corporateHighlight: {
    companyCount: 1,
    years: 4,
    summary: '창업 4년차 · 정상 운영 중 · 폐업 이력 없음',
  },
  airlineHighlight: {
    tierSummary: '대한항공 모닝캄',
    badgeLevel: 'business_traveler',
    airlines: [
      { name: '대한항공', tier: '모닝캄' },
    ],
  },
  instagram: {
    username: 'jimin_lee',
    profileUrl: 'https://www.instagram.com/jimin_lee/',
    aiSummary: '스타트업 마케팅과 브랜딩 콘텐츠를 주로 공유합니다. 성장 전략과 커뮤니티 빌딩에 관심이 많습니다.',
    posts: [
      { id: '1', imageUrl: 'https://picsum.photos/seed/jimin_ig1/400/400', caption: '마케팅 전략 세션 🎯', timestamp: '1일 전' },
      { id: '2', imageUrl: 'https://picsum.photos/seed/jimin_ig2/400/400', caption: '팀 워크숍 💡', timestamp: '3일 전' },
      { id: '3', imageUrl: 'https://picsum.photos/seed/jimin_ig3/400/400', caption: '콘퍼런스 참석 🌐', timestamp: '1주 전' },
      { id: '4', imageUrl: 'https://picsum.photos/seed/jimin_ig4/400/400', caption: '스타트업 네트워킹 🤝', timestamp: '2주 전' },
      { id: '5', imageUrl: 'https://picsum.photos/seed/jimin_ig5/400/400', caption: '브랜딩 작업 ✨', timestamp: '3주 전' },
      { id: '6', imageUrl: 'https://picsum.photos/seed/jimin_ig6/400/400', caption: '팀 점심 🍱', timestamp: '1달 전' },
    ],
  },
  careerHighlight: { avgYears: 4.2, vsIndustryPercent: 128 },
  rememberHighlight: {
    total: 183,
    industries: [
      { name: '스타트업', ratio: 38 },
      { name: '마케팅', ratio: 24 },
      { name: 'IT', ratio: 22 },
      { name: '투자', ratio: 16 },
    ],
  },
  manualHighlights: [
    { id: 'jh1', icon: '🎤', title: 'TEDx Seoul 2023', subtitle: '강연 / 연설 · 직접 입력', description: '기술과 사람의 연결에 대해 강연', year: '2023' },
  ],
  reputationKeywords: [
    { keyword: '전문적인', count: 5 },
    { keyword: '신뢰할 수 있는', count: 4 },
    { keyword: '통찰력 있는', count: 2 },
  ],
  guestbook: [
    { id: 'jg1', linkId: 'myongkoo', authorName: '강민준', message: '정말 통찰력 있는 분이에요.', date: '2일 전' },
  ],
}
