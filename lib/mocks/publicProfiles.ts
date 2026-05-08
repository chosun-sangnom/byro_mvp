import type { ContactChannel, Highlight } from '@/types'
import { INSTAGRAM_PROFILE, LINKEDIN_PROFILE, MK_LINKEDIN_PROFILE } from '@/lib/mocks/socialProfiles'

// Temporary profile fixtures for local development and design iteration.
// TODO(real API): Replace these with profile detail/read-model responses from
// the backend. Verified highlights, guestbook, reputation aggregates, and
// connected SNS summaries should come from their respective APIs, not this file.

export const SAMPLE_PROFILE = {
  linkId: 'gangminjun',
  name: '강민준',
  title: 'B2B SaaS Product Owner · 스타트업 공동창업자',
  avatarColor: '#DCC5B6',
  avatarImage: '',
  headline: '커뮤니티 기반 성장을 설계하는 B2B SaaS 빌더',
  school: 'KAIST 경영학과 졸업',
  bio: 'B2B SaaS 분야에서 5년간 Product Owner로 활동해 온 강민준입니다. 파트너십을 통해 성장을 만들어가는 것을 즐깁니다.',
  headerMeta: {
    residence: '성수동',
    mood: '집중 모드',
    availability: '오늘 저녁 커피챗 가능',
  },
  whoIAm: {
    mbti: 'ENTJ',
    bloodType: 'A형',
    sajuCompatibilityLabel: '사주 궁합 보기',
    aiStyleSummary: ['신뢰감 있는 인상', '차분한 리더형 무드', '깔끔한 프로페셔널 스타일'],
    relationshipStatus: '좋은 대화에 열려 있음',
    children: '자녀 없음',
    religion: '무교',
  },
  life: {
    daily: {
      exercise: ['러닝', '골프'],
      pet: '없음',
    },
    tastes: {
      movies: ['머니볼', '소셜 네트워크', '나 홀로 집에 2'],
      music: ['혁오 - Tomboy', '검정치마 - Everything', '김동률 - Replay'],
      books: ['린 스타트업', '제로 투 원', '좋은 전략 나쁜 전략'],
      games: ['EA SPORTS FC'],
      sports: ['축구', '골프'],
      celebrities: ['유재석', '아이유'],
      diet: '일반식',
      restaurants: ['성수 우육미엔', '압구정 뜸들이다'],
      cafes: ['센터커피', '프릳츠 원서점'],
    },
    places: {
      neighborhoods: ['성수동', '한남동', '서촌'],
      travelDestinations: ['도쿄', '교토', '샌프란시스코'],
    },
  },
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
      { name: '마케팅', ratio: 24 },
      { name: 'IT', ratio: 22 },
      { name: '투자', ratio: 16 },
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
    { id: 'mh2-1', categoryId: 'education', icon: 'book-open', title: '스타트업 PM 부트캠프', subtitle: '강의 / 교육 · 직접 입력', description: '초기 PM을 위한 문제 정의와 실험 설계 세션을 진행했습니다.', year: '2024' },
    { id: 'mh3', categoryId: 'award', icon: 'trophy', title: 'K-Startup Excellence 2024', subtitle: '수상 / 표창 · 직접 입력', description: '초기 스타트업 성장 전략 부문 우수 사례로 선정', year: '2024', metadata: { issuer: 'K-Startup' } },
    { id: 'mh4', categoryId: 'publish', icon: 'book-open', title: '작게 시작하는 B2B SaaS', subtitle: '출판 / 기고 · 직접 입력', description: '초기 B2B SaaS 팀이 첫 고객을 만나기까지의 실험 과정을 정리한 기고문입니다.', year: '2025', sourceLabel: 'Byro Journal', linkUrl: 'https://byro.io/articles/b2b-saas-start' },
    { id: 'mh5', categoryId: 'article-interview', icon: 'file-text', title: '강민준 Product Owner, 작은 팀의 실행력에 대해 말하다', subtitle: '기사 / 인터뷰 · 직접 입력', description: '적은 리소스로도 제품 가설을 빠르게 검증하는 팀 운영 방식에 대한 인터뷰입니다.', year: '2024', sourceLabel: 'Startup Today', linkUrl: 'https://byro.io/articles/gangminjun-interview' },
    { id: 'mh6', categoryId: 'patent', icon: 'book-open', title: '네트워크 신뢰도 기반 프로필 매칭 시스템', subtitle: '특허 / 연구 · 직접 입력', description: '', year: '2024', metadata: { registrationNumber: '10-2024-0012345' } },
    { id: 'mh7', categoryId: 'license', icon: 'badge-check', title: 'GAIQ', subtitle: '자격증 / 수료 · 직접 입력', description: '', year: '2023', metadata: { issuer: 'Google', expiryYear: '2026' } },
    { id: 'mh8', categoryId: 'volunteer', icon: 'globe', title: '청소년 창업 멘토링', subtitle: '봉사 / 사회공헌 · 직접 입력', description: '지역 청소년을 대상으로 문제 정의와 팀 프로젝트 멘토링을 진행했습니다.', year: '2023' },
    { id: 'mh9', categoryId: 'other', icon: 'pencil', title: '로컬 커뮤니티 살롱 운영', subtitle: '기타 · 직접 입력', description: '제품, 커리어, 브랜딩을 주제로 소규모 오프라인 살롱을 운영하고 있습니다.', year: '2024' },
  ] as Highlight[],
  // TODO(real API): Replace with viewer-relative kemi payload from /profiles/:id/kemi?viewer_id=... endpoint
  kemi: {
    matchCount: 4,
    matchItems: [
      { label: '아이유', category: 'taste' },
      { label: '한남동', category: 'place' },
      { label: '서촌', category: 'place' },
      { label: '일반식', category: 'lifestyle' },
    ],
    // TODO(AI): Replace with LLM-generated conversation starter based on full profile match context
    aiCopy: '아이유를 좋아하고 한남동과 서촌을 자주 찾는 분이에요. 동네 얘기나 좋아하는 음악으로 먼저 말 걸어보세요.',
  },
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
  reputationKeywords: [
    { keyword: '전문적인', count: 8 },
    { keyword: '신뢰할 수 있는', count: 6 },
    { keyword: '통찰력 있는', count: 4 },
    { keyword: '실행력 있는', count: 3 },
    { keyword: '창의적인', count: 2 },
  ],
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
  headerMeta: {
    residence: '한남동',
    mood: '사색 모드',
    availability: '늦은 밤 산책 환영',
  },
  whoIAm: {
    mbti: 'ENTP',
    bloodType: 'B형',
    sajuCompatibilityLabel: '궁합 먼저 보기',
    aiStyleSummary: ['카리스마 있는 인상', '깊은 눈빛의 사색형', '내추럴한 블랙 스타일'],
    relationshipStatus: '자연스러운 연결 선호',
    children: '자녀 없음',
    religion: '무교',
  },
  life: {
    daily: {
      exercise: ['골프', '웨이트', '산책'],
      pet: '없음',
    },
    tastes: {
      movies: ['인턴', '월터의 상상은 현실이 된다', '헤어질 결심'],
      music: ['잔나비 - 주저하는 연인들을 위해', '성시경 - 희재', 'Coldplay - Yellow'],
      books: ['당신의 엔진을 뜨겁게 달궈라', '원씽', '사피엔스'],
      games: ['문명', 'FC'],
      sports: ['골프', '축구'],
      celebrities: ['손흥민', '전도연'],
      diet: '일반식',
      restaurants: ['몽탄', '금돼지식당'],
      cafes: ['테라로사', '블루보틀'],
    },
    places: {
      neighborhoods: ['한남동', '압구정', '성수동'],
      travelDestinations: ['뉴욕', '런던', '파리'],
    },
  },
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
  // TODO(real API): Replace with viewer-relative kemi payload from /profiles/:id/kemi?viewer_id=... endpoint
  kemi: {
    matchCount: 5,
    matchItems: [
      { label: '골프', category: 'lifestyle' },
      { label: '축구', category: 'taste' },
      { label: '성수동', category: 'place' },
      { label: 'FC 온라인', category: 'taste' },
      { label: '일반식', category: 'lifestyle' },
    ],
    // TODO(AI): Replace with LLM-generated conversation starter based on full profile match context
    aiCopy: '골프와 축구를 즐기고 성수동을 자주 찾는 분이에요. FC 얘기나 성수 맛집으로 바로 들어가도 어색하지 않아요.',
  },
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

export const JIMIN_PROFILE = {
  linkId: 'jiminlee',
  name: '이지민',
  title: '스타트업 마케터 4년 경력',
  avatarColor: '#D8C4B2',
  avatarImage: '/images/jimin-profile-5x4.jpg',
  headline: '브랜드와 사람을 연결하는 스타트업 마케터',
  school: '연세대학교 경영학 학사',
  bio: '스타트업 생태계에서 브랜드와 사람을 연결하는 마케터입니다. 브랜드의 방향성과 사람들의 경험이 자연스럽게 이어지도록 설계하는 일을 좋아하고, 성장 전략과 커뮤니티 빌딩에도 꾸준히 관심을 두고 있습니다.',
  headerMeta: {
    residence: '한남동',
    mood: '산책 가고 싶은 날',
    availability: '오늘의 펑 열려 있음',
  },
  whoIAm: {
    mbti: 'ENFP',
    bloodType: 'O형',
    sajuCompatibilityLabel: '사주 궁합 보기',
    aiStyleSummary: ['밝은 첫인상', '부드러운 페미닌 무드', '감각적인 블랙 자켓 스타일'],
    relationshipStatus: '설레는 대화 환영',
    children: '자녀 없음',
    religion: '기독교',
  },
  life: {
    daily: {
      exercise: ['필라테스', '산책'],
      pet: '없음',
    },
    tastes: {
      movies: ['이터널 선샤인', '작은 아씨들', '비포 선셋'],
      music: ['백예린 - Square', 'NewJeans - Ditto', 'Crush - Beautiful'],
      books: ['아무튼, 여름', '보통의 언어들', '불편한 편의점'],
      games: ['심즈'],
      sports: ['테니스', '야구'],
      celebrities: ['아이유', '한소희'],
      diet: '일반식',
      restaurants: ['진작다이닝', '을지다락'],
      cafes: ['오츠커피', '레이어드'],
    },
    places: {
      neighborhoods: ['한남동', '연남동', '서촌'],
      travelDestinations: ['오사카', '런던', '제주'],
    },
  },
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
  // TODO(real API): Replace with viewer-relative kemi payload from /profiles/:id/kemi?viewer_id=... endpoint
  kemi: {
    matchCount: 3,
    matchItems: [
      { label: '아이유', category: 'taste' },
      { label: '한남동', category: 'place' },
      { label: '일반식', category: 'lifestyle' },
    ],
    // TODO(AI): Replace with LLM-generated conversation starter based on full profile match context
    aiCopy: '아이유를 좋아하고 한남동을 자주 찾는 분이에요. 같은 동네 카페 얘기로 자연스럽게 시작해보세요.',
  },
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

// TODO(real API): Replace this mock selector with a profile lookup against the public profile endpoint.
export function getPublicProfileByUsername(username: string) {
  if (username === 'jiminlee') return JIMIN_PROFILE
  if (username === 'mk') return MK_PROFILE
  return SAMPLE_PROFILE
}

// TODO(real API): Replace this with avatar URLs returned by the profile/media service.
export function getProfileAvatar(linkId: string) {
  if (linkId === 'jiminlee') return '/images/jimin-profile-5x4.jpg'
  if (linkId === 'mk') return '/images/MK_img.jpeg'
  return ''
}
