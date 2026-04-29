import type { ContactChannel, Highlight, HighlightCategoryId, HighlightGroupId, HighlightIconId } from '@/types'

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

export const MK_LINKEDIN_PROFILE = {
  name: '강명구',
  profileUrl: 'https://www.linkedin.com/in/myongkoo-kang/',
  aiSummary: '스타트업/비즈니스 리더 성격이 강하고 업무·리더십·산업 인사이트를 드러내는 활동이 주를 이룹니다. 최근에는 공간지능·공간컴퓨팅·피지컬 AI 관련 강연과 대외 활동 언급이 확인됩니다.',
  previewImage: '/images/MK_Linkedin_v2.png',
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
export const HIGHLIGHT_GROUPS: Array<{ id: HighlightGroupId; label: string }> = [
  { id: 'career', label: '커리어' },
  { id: 'achievement', label: '업적' },
  { id: 'lifestyle', label: '라이프스타일' },
]

export const HIGHLIGHT_CATEGORIES: Array<{
  id: HighlightCategoryId
  icon: HighlightIconId
  label: string
  group: HighlightGroupId
  certificationOnly?: boolean
}> = [
  { id: 'career-role', icon: 'briefcase', label: '경력', group: 'career' },
  { id: 'education-history', icon: 'book-open', label: '학력', group: 'career' },
  { id: 'career-continuity', icon: 'briefcase', label: '커리어 지속성', group: 'career', certificationOnly: true },
  { id: 'corporate-longevity', icon: 'building2', label: '법인 영속성', group: 'career', certificationOnly: true },
  { id: 'remember-network', icon: 'users', label: '리멤버 네트워크', group: 'career', certificationOnly: true },
  { id: 'talk', icon: 'mic', label: '강연 / 연설', group: 'career' },
  { id: 'collab', icon: 'handshake', label: '협업 프로젝트', group: 'career' },
  { id: 'education', icon: 'book-open', label: '강의 / 교육', group: 'career' },
  { id: 'publish', icon: 'book-open', label: '출판 / 기고', group: 'achievement' },
  { id: 'article-interview', icon: 'file-text', label: '기사 / 인터뷰', group: 'achievement' },
  { id: 'award', icon: 'trophy', label: '수상 / 표창', group: 'achievement' },
  { id: 'patent', icon: 'book-open', label: '특허 / 연구', group: 'achievement' },
  { id: 'license', icon: 'badge-check', label: '자격증 / 수료', group: 'achievement' },
  { id: 'airline-mileage', icon: 'plane', label: '항공 마일리지', group: 'lifestyle', certificationOnly: true },
  { id: 'volunteer', icon: 'globe', label: '봉사 / 사회공헌', group: 'lifestyle' },
  { id: 'other', icon: 'pencil', label: '기타', group: 'lifestyle' },
]

// ─── 로그인 기본 샘플 유저
export const SAMPLE_PROFILE = {
  linkId: 'gangminjun',
  name: '강민준',
  title: 'B2B SaaS Product Owner · 스타트업 공동창업자',
  avatarColor: '#DCC5B6',
  avatarImage: '',
  headline: '커뮤니티 기반 성장을 설계하는 B2B SaaS 빌더',
  school: 'KAIST 경영학과 졸업',
  bio: 'B2B SaaS 분야에서 5년간 Product Owner로 활동해 온 강민준입니다. 파트너십을 통해 성장을 만들어가는 것을 즐깁니다.',
  heroTheme: {
    cover: 'from-[#B69B8B] via-[#836F66] to-[#121212]',
    avatar: 'from-[#DCC5B6] to-[#8F7265]',
  },
  contactChannels: [
    { id: 'phone', label: '전화', value: '010-9482-1158', href: 'tel:01094821158', enabled: true },
    { id: 'email', label: '이메일', value: 'gangminjun@byro.io', href: 'mailto:gangminjun@byro.io', enabled: true },
    { id: 'kakao', label: '카카오', value: 'gangminjun.kakao', href: 'https://open.kakao.com/o/sgangminjun', enabled: true },
  ] as ContactChannel[],
  selectedKeywords: ['전문적인', '신뢰할 수 있는', '통찰력 있는', '실행력 있는', '창의적인'],
  instagramConnected: true,
  linkedinConnected: true,
  instagram: {
    username: INSTAGRAM_PROFILE.username,
    profileUrl: INSTAGRAM_PROFILE.profileUrl,
    aiSummary: INSTAGRAM_PROFILE.aiSummary,
    posts: INSTAGRAM_PROFILE.posts,
  },
  linkedin: {
    profileUrl: LINKEDIN_PROFILE.profileUrl,
    aiSummary: LINKEDIN_PROFILE.aiSummary,
    previewImage: '/images/linkedsample.png',
  },
  careerHighlight: { avgYears: 4.2, vsIndustryPercent: 128 },
  corporateHighlight: {
    companyCount: 2,
    averageOperatingYears: 5,
    summary: '2개 법인 · 정상 운영 중',
    companies: [
      { name: 'Byro Inc.', startYear: 2020, endYear: null, years: 6, status: '정상 운영' },
      { name: 'MKG Studio', startYear: 2022, endYear: null, years: 4, status: '정상 운영' },
    ],
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
    {
      id: 'mh0',
      categoryId: 'career-role',
      icon: 'briefcase',
      title: 'Byro',
      subtitle: '경력 · 재직 중',
      description: '스타트업 제품 전략과 파트너십 기반 성장을 설계하고 있습니다.',
      year: '2022 - 현재',
      metadata: { status: '재직 중', role: 'B2B SaaS Product Owner' },
    },
    {
      id: 'mh0-0',
      categoryId: 'career-role',
      icon: 'briefcase',
      title: 'ABC Labs',
      subtitle: '경력 · 직접 입력',
      description: '초기 제품 기획과 파트너십 운영을 담당하며 서비스의 첫 시장 적합성을 검증했습니다.',
      year: '2020 - 2022',
      metadata: { status: '종료', role: 'Product Owner' },
    },
    {
      id: 'mh0-1',
      categoryId: 'education-history',
      icon: 'book-open',
      title: 'KAIST',
      subtitle: '학력 · 졸업',
      description: 'KAIST에서 제품과 비즈니스를 함께 이해하는 관점의 기반을 다진 전공입니다.',
      year: '2020',
      metadata: { status: '졸업', role: '경영학과', degree: '학사', schoolType: '대학교' },
    },
    { id: 'mh1', categoryId: 'talk', icon: 'mic', title: 'TEDx Seoul 2023', subtitle: '강연 / 연설 · 직접 입력', description: '신뢰 기반 네트워킹의 미래를 주제로 강연', year: '2023' },
    { id: 'mh2', categoryId: 'collab', icon: 'handshake', title: '일본 파트너사 협업 프로젝트', subtitle: '협업 프로젝트 · 직접 입력', description: '6개월 간 일본 파트너사와 B2B 제품 공동 개발', year: '2022' },
    { id: 'mh3', categoryId: 'award', icon: 'trophy', title: 'K-Startup Excellence 2024', subtitle: '수상 / 표창 · 직접 입력', description: '초기 스타트업 성장 전략 부문 우수 사례로 선정', year: '2024' },
  ] as Highlight[],
  experiences: [
    { id: 'e1', authorName: '김지수', isAnonymous: false, keywords: ['전문적인', '통찰력 있는'], message: '정말 통찰력 있는 분이에요. 같이 일하고 싶다!', date: '2일 전' },
    { id: 'e2', authorName: null, isAnonymous: true, keywords: ['신뢰할 수 있는', '실행력 있는'], message: '', date: '5일 전' },
    { id: 'e3', authorName: '박소연', isAnonymous: false, keywords: ['창의적인'], message: '아이디어가 넘치는 분입니다 👏', date: '1주 전' },
  ],
  savedProfiles: [
    { id: 'p1', linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', memo: '비즈니스 살롱 2026.03 · 마케팅 인사이트 굿', savedAt: '3일 전' },
    { id: 'p2', linkId: 'mk', name: '강명구', title: 'Byth CEO', memo: '', savedAt: '1주 전' },
    { id: 'p3', linkId: 'kimdohyeon', name: '김도현', title: '독립 재무설계사', memo: '', savedAt: '2주 전' },
  ],
  recentProfiles: [
    { id: 'p1', linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', viewedAt: '방금 전' },
    { id: 'p4', linkId: 'mk', name: '강명구', title: 'Byth CEO', viewedAt: '1시간 전' },
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
    { id: 'g2', linkId: 'mk', authorName: '강명구', message: '실행력이 정말 대단하신 분.', date: '1주 전' },
    { id: 'g3', linkId: 'kimdohyeon', authorName: '김도현', message: '대화가 구체적이고 믿음이 가는 분이었어요.', date: '2주 전' },
    { id: 'g4', linkId: 'chijiwon', authorName: '최지원', message: '비즈니스 관점이 선명해서 배우는 포인트가 많았습니다.', date: '3주 전' },
  ],
}

export const MK_PROFILE = {
  linkId: 'mk',
  name: '강명구',
  title: 'Byth CEO',
  avatarColor: '#D4CABF',
  avatarImage: '/images/MK_img.jpeg',
  headline: 'Entrepreneur, Writer, Connector',
  school: '',
  bio: 'Entrepreneur, Writer, Connector. Byth에서 Byro 만들고 운영하고 있어요.',
  heroTheme: {
    cover: 'from-[#8D887D] via-[#57534D] to-[#0E0E0E]',
    avatar: 'from-[#D8D0C7] to-[#8C8278]',
  },
  contactChannels: [
    { id: 'phone', label: '전화', value: '010-3221-1042', href: 'tel:01032211042', enabled: true },
    { id: 'email', label: '이메일', value: 'mk@byth.io', href: 'mailto:mk@byth.io', enabled: true },
    { id: 'kakao', label: '카카오', value: 'epicmkk', href: 'https://open.kakao.com/o/smkbyth', enabled: true },
  ] as ContactChannel[],
  selectedKeywords: ['진정성 있는', '전문적인', '실행력 있는', '신뢰할 수 있는', '통찰력 있는'],
  instagramConnected: true,
  linkedinConnected: true,
  instagram: {
    username: 'epicmkk',
    profileUrl: 'https://www.instagram.com/epicmkk/',
    aiSummary: '일상 사진에 생각이나 감상을 붙이는 에세이형 포스팅이 주를 이룹니다. 일상, 관계, 자기 생각 정리, 글쓰기와 작업 이야기 비중이 크고 사색적이고 담백한 톤의 포스팅을 지향합니다.',
    posts: [
      { id: 'mk1', imageUrl: '/images/mk-instagram/post-1.png', caption: '동네 아저씨', timestamp: '2일 전' },
      { id: 'mk2', imageUrl: '/images/mk-instagram/post-2.png', caption: '아키라 키드', timestamp: '4일 전' },
      { id: 'mk3', imageUrl: '/images/mk-instagram/post-3.png', caption: '틈과 여백', timestamp: '6일 전' },
      { id: 'mk4', imageUrl: '/images/mk-instagram/post-4.png', caption: '자존감, 자존심, 자신감', timestamp: '1주 전' },
      { id: 'mk5', imageUrl: '/images/mk-instagram/post-5.png', caption: '음악적 재능', timestamp: '9일 전' },
      { id: 'mk6', imageUrl: '/images/mk-instagram/post-6.png', caption: '게임의 법칙', timestamp: '11일 전' },
      { id: 'mk7', imageUrl: '/images/mk-instagram/post-7.png', caption: '안녕, 친구', timestamp: '2주 전' },
      { id: 'mk8', imageUrl: '/images/mk-instagram/post-8.png', caption: '역경극복', timestamp: '2주 전' },
      { id: 'mk9', imageUrl: '/images/mk-instagram/post-9.png', caption: 'PM의 자질', timestamp: '3주 전' },
      { id: 'mk10', imageUrl: '/images/mk-instagram/post-10.png', caption: '청춘의 가요', timestamp: '3주 전' },
    ],
  },
  linkedin: MK_LINKEDIN_PROFILE,
  careerHighlight: { avgYears: 4.8, vsIndustryPercent: 146 },
  corporateHighlight: {
    companyCount: 1,
    years: 2,
    summary: '1개 법인 · 정상 운영 중',
    companies: [
      { name: 'Byth', startYear: 2025, endYear: null, years: 2, status: '정상 운영' },
    ],
  },
  rememberHighlight: {
    total: 1691,
    industries: [
      { name: 'IT/테크', ratio: 17, count: 286 },
      { name: '금융/투자', ratio: 16, count: 263 },
      { name: '대기업/제조', ratio: 13, count: 212 },
      { name: '마케팅/PR', ratio: 9, count: 144 },
      { name: '블록체인', ratio: 7, count: 118 },
      { name: '미디어/언론', ratio: 6, count: 104 },
      { name: '컨설팅/법률', ratio: 6, count: 102 },
      { name: '교육/연구', ratio: 5, count: 88 },
    ],
  },
  manualHighlights: [
    {
      id: 'mkh0',
      categoryId: 'career-role',
      icon: 'briefcase',
      title: 'Byth',
      subtitle: '경력 · 재직 중',
      description: 'Byth를 만들고 운영하며 브랜드와 제품 방향을 총괄하고 있습니다.',
      year: '2025 - 현재',
      metadata: { status: '재직 중', role: 'CEO' },
    },
    {
      id: 'mkh0-1',
      categoryId: 'education-history',
      icon: 'book-open',
      title: '연세대학교',
      subtitle: '학력 · 졸업',
      description: '연세대학교에서 조직과 비즈니스를 바라보는 기반을 다진 전공입니다.',
      year: '2018',
      metadata: { status: '졸업', role: '경영학', degree: '학사', schoolType: '대학교' },
    },
    { id: 'mkh1', categoryId: 'education', icon: 'book-open', title: '아이젠하워 펠로우십', subtitle: '교육 · 직접 입력', description: '전 세계 유망한 리더들을 선정해 미국 현지 연수와 교류 기회를 제공하는 리더십 프로그램에 선발되었습니다.', year: '2026' },
    { id: 'mkh2', categoryId: 'award', icon: 'trophy', title: '월드와이드 웹소설 공모전 · 우수상 수상', subtitle: '수상 / 표창 · 직접 입력', description: '중앙일보 주최 공모전에서 <무진장>이라는 작품으로 우수상을 수상했습니다.', year: '2024' },
    { id: 'mkh3', categoryId: 'publish', icon: 'book-open', title: '당신의 엔진을 뜨겁게 달궈라', subtitle: '출판 / 기고 · 직접 입력', description: '대학생들에게 열정 있는 삶을 권고하는 자기개발서입니다.', year: '2025' },
    {
      id: 'mkh4',
      categoryId: 'article-interview',
      icon: 'file-text',
      title: '강명구 코인원 부대표 "가상자산, 전통 금융 시장에 새 문법 제시"',
      subtitle: '기사 / 인터뷰 · 직접 입력',
      description: '가상자산 시장의 현황과 미래에 대한 조망을 제시한 인터뷰입니다.',
      year: '2022',
      linkUrl: 'https://zdnet.co.kr/view/?no=20221018103937',
      sourceLabel: 'ZDNet Korea',
    },
  ] as Highlight[],
  reputationKeywords: [
    { keyword: '진정성 있는', count: 9 },
    { keyword: '전문적인', count: 7 },
    { keyword: '실행력 있는', count: 6 },
    { keyword: '신뢰할 수 있는', count: 5 },
    { keyword: '통찰력 있는', count: 4 },
  ],
  guestbook: [
    { id: 'mkg1', linkId: 'jiminlee', authorName: '이지민', message: '큰 방향을 빠르게 정리하고 실제 실행으로 옮기는 힘이 분명한 분이에요.', date: '2일 전' },
    { id: 'mkg2', linkId: 'gangminjun', authorName: '강민준', message: '생각이 깊은데 실행이 느리지 않아서 같이 일할 때 추진력이 좋았습니다.', date: '5일 전' },
    { id: 'mkg3', linkId: 'kimdohyeon', authorName: '김도현', message: '사람을 연결하는 방식이 자연스럽고 진정성이 느껴졌어요.', date: '1주 전' },
    { id: 'mkg4', linkId: 'chijiwon', authorName: '최지원', message: '비즈니스 맥락을 읽는 힘이 좋아서 대화가 늘 선명했습니다.', date: '2주 전' },
  ],
}

// ─── 이지민 공개 프로필
export const JIMIN_PROFILE = {
  linkId: 'jiminlee',
  name: '이지민',
  title: '스타트업 마케터 4년 경력',
  avatarColor: '#D8C4B2',
  avatarImage: '/images/jimin-profile-5x4.jpg',
  headline: '브랜드와 사람을 연결하는 스타트업 마케터',
  school: '연세대학교 경영학 학사',
  bio: '스타트업 생태계에서 브랜드와 사람을 연결하는 마케터입니다. 브랜드의 방향성과 사람들의 경험이 자연스럽게 이어지도록 설계하는 일을 좋아하고, 성장 전략과 커뮤니티 빌딩에도 꾸준히 관심을 두고 있습니다.',
  heroTheme: {
    cover: 'from-[#B9A597] via-[#7F6A61] to-[#101010]',
    avatar: 'from-[#D8C4B2] to-[#8A7167]',
  },
  contactChannels: [
    { id: 'phone', label: '전화', value: '010-2437-1022', href: 'tel:01024371022', enabled: true },
    { id: 'email', label: '이메일', value: 'jimin@byro.io', href: 'mailto:jimin@byro.io', enabled: true },
    { id: 'kakao', label: '카카오', value: 'jimin.marketer', href: 'https://open.kakao.com/o/sjimin', enabled: true },
  ] as ContactChannel[],
  selectedKeywords: ['전문적인', '신뢰할 수 있는', '통찰력 있는', '창의적인'],
  instagramConnected: true,
  linkedinConnected: false,
  corporateHighlight: {
    companyCount: 1,
    years: 4,
    summary: '1개 법인 · 정상 운영 중',
    companies: [
      { name: 'Jimin Brand Lab', startYear: 2022, endYear: null, years: 4, status: '정상 운영' },
    ],
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
    {
      id: 'jh0',
      categoryId: 'career-role',
      icon: 'briefcase',
      title: 'Brand Lab',
      subtitle: '경력 · 재직 중',
      description: '브랜드와 사람을 연결하는 마케팅과 커뮤니티 빌딩을 담당하고 있습니다.',
      year: '2022 - 현재',
      metadata: { status: '재직 중', role: '스타트업 마케터' },
    },
    {
      id: 'jh1',
      categoryId: 'education-history',
      icon: 'book-open',
      title: '연세대학교',
      subtitle: '학력 · 졸업',
      description: '연세대학교에서 브랜드 전략과 사용자 이해를 함께 다진 전공입니다.',
      year: '2021',
      metadata: { status: '졸업', role: '경영학', degree: '학사', schoolType: '대학교' },
    },
  ] as Highlight[],
  reputationKeywords: [
    { keyword: '전문적인', count: 5 },
    { keyword: '신뢰할 수 있는', count: 4 },
    { keyword: '통찰력 있는', count: 2 },
    { keyword: '창의적인', count: 1 },
  ],
  guestbook: [
    { id: 'jg1', linkId: 'gangminjun', authorName: '강민준', message: '정말 통찰력 있는 분이에요.', date: '2일 전' },
    { id: 'jg2', linkId: 'mk', authorName: '강명구', message: '브랜딩 감각이 좋아서 같이 일하고 싶은 분입니다.', date: '5일 전' },
    { id: 'jg3', linkId: 'chijiwon', authorName: '최지원', message: '사람을 편하게 연결하는 힘이 있어요.', date: '1주 전' },
    { id: 'jg4', linkId: 'kimdohyeon', authorName: '김도현', message: '마케팅 관점이 실무적이라 대화가 특히 좋았습니다.', date: '2주 전' },
  ],
}

export function getPublicProfileByUsername(username: string) {
  if (username === 'jiminlee') return JIMIN_PROFILE
  if (username === 'mk') return MK_PROFILE
  return SAMPLE_PROFILE
}

export function getProfileAvatar(linkId: string) {
  if (linkId === 'jiminlee') return '/images/jimin-profile-5x4.jpg'
  if (linkId === 'mk') return '/images/MK_img.jpeg'
  return ''
}
