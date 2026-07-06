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
  avatarImage: '/images/mj1.jpg',
  profileImages: [
    '/images/mj1.jpg',
    '/images/mj2.jpg',
  ],
  headline: '커뮤니티 기반 성장을 설계하는 B2B SaaS 빌더',
  school: 'KAIST 경영학과 졸업',
  bio: 'B2B SaaS 분야에서 5년간 Product Owner로 활동해 온 강민준입니다. 파트너십을 통해 성장을 만들어가는 것을 즐깁니다.',
  whoIAm: {
    mbti: 'ENFP',
    personality: '관계에서 처음엔 거리를 두지만 신뢰가 쌓이면 깊이 연결되는 편이에요. 일할 때는 방향이 먼저고, 실행은 빠르게 가는 스타일입니다.',
  },
  birthDate: '1992-06-14',
  birthTime: '08:30',
  calendarType: 'solar' as const,
  showAge: true,
  life: {
    daily: {
      exercise: [
        { label: '필라테스', posterUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=80&h=80&q=75&fit=crop&auto=format' },
      ],
    },
    tastes: {
      // TODO(real API): posterUrl from TMDB API — image.tmdb.org/t/p/w185/{poster_path}
      movies: [
        { label: '이터널 선샤인', sublabel: '2004', posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '작은 아씨들', sublabel: '2019', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=80&h=112&q=75&fit=crop&auto=format' },
      ],
      // TODO(real API): posterUrl from Spotify API — i.scdn.co album art URL
      music: [
        { label: 'Square', sublabel: '백예린', posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&q=75&fit=crop&auto=format' },
        { label: 'Ditto', sublabel: 'NewJeans', posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&q=75&fit=crop&auto=format' },
      ],
      // TODO(real API): posterUrl from 알라딘 API — cover image URL
      books: [
        { label: '아무튼, 여름', sublabel: '위고', posterUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '보통의 언어들', sublabel: '김이나', posterUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=80&h=112&q=75&fit=crop&auto=format' },
      ],
      // TODO(real API): posterUrl from Kakao Maps / Google Places photo API
      restaurants: [
        { label: '진작다이닝', sublabel: '한남동', posterUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=148&h=96&q=75&fit=crop&auto=format' },
      ],
      // TODO(real API): posterUrl from Kakao Maps / Google Places photo API
      cafes: [
        { label: '오츠커피', sublabel: '한남동', posterUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=148&h=96&q=75&fit=crop&auto=format' },
      ],
    },
    albumPhotos: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&q=80&fit=crop',
    ],
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
  rememberHighlight: {
    total: 247,
    industries: [
      { name: '스타트업', ratio: 38, count: 94 },
      { name: '마케팅', ratio: 24, count: 59 },
      { name: 'IT', ratio: 22, count: 54 },
      { name: '투자', ratio: 16, count: 40 },
    ],
    topIndustryRanks: [
      { name: '대표/임원', ratio: 45 },
      { name: '팀장/부장', ratio: 30 },
      { name: '과장/차장', ratio: 15 },
      { name: '사원/주임', ratio: 10 },
    ],
    topIndustryRoles: [
      { name: '기획/PM', ratio: 40 },
      { name: '개발', ratio: 30 },
      { name: '마케팅', ratio: 18 },
      { name: '디자인', ratio: 12 },
    ],
    insight: {
      recentMeetings: 34,
      recentMonths: 3,
      topIndustryName: '스타트업',
      topIndustryPercent: 38,
      growthIndustryName: 'IT·개발',
      growthFrom: 14,
      growthTo: 22,
      growthPeriodLabel: '최근 6개월',
    },
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
      id: 'mh0-2',
      categoryId: 'career-role',
      icon: 'briefcase',
      title: '라인플러스',
      subtitle: '경력 · 건강보험공단 인증',
      description: '라인 메신저 B2B 파트너십 프로덕트를 담당하며 대규모 사용자 기반 제품을 기획했습니다.',
      year: '2018 - 2020',
      verified: true,
      metadata: { status: '종료', role: '프로덕트 매니저', startYear: '2018', endYear: '2020' },
    },
    {
      id: 'mh0-3',
      categoryId: 'career-role',
      icon: 'briefcase',
      title: '카카오',
      subtitle: '경력 · 건강보험공단 인증',
      description: '카카오톡 비즈니스 서비스 기획을 담당하며 커머스·광고 파트너십 제품을 설계했습니다.',
      year: '2016 - 2018',
      verified: true,
      metadata: { status: '종료', role: '서비스 기획자', startYear: '2016', endYear: '2018' },
    },
    {
      id: 'mh0-4',
      categoryId: 'career-role',
      icon: 'briefcase',
      title: '그린랩스',
      subtitle: '경력 · 직접 입력',
      description: '농업 데이터 플랫폼 초기 멤버로 제품 방향성 수립과 파일럿 운영에 참여했습니다.',
      year: '2015 - 2016',
      metadata: { status: '종료', role: '프로덕트 기획자', startYear: '2015', endYear: '2016' },
    },
    {
      id: 'mh0-1',
      categoryId: 'education-history',
      icon: 'book-open',
      title: 'KAIST',
      subtitle: '학력 · 졸업',
      description: 'KAIST에서 제품과 비즈니스를 함께 이해하는 관점의 기반을 다진 전공입니다.',
      year: '2012 - 2016',
      metadata: { status: '졸업', role: '경영학과', degree: '학사', schoolType: '대학교' },
    },
    {
      id: 'mh0-5',
      categoryId: 'education-history',
      icon: 'book-open',
      title: '고려대학교',
      subtitle: '학력 · 대학원',
      description: '경영전문대학원에서 기술 기반 비즈니스 모델과 전략경영을 심화 연구했습니다.',
      year: '2020 - 2022',
      verified: true,
      metadata: { status: '졸업', role: '경영전문대학원 MBA', degree: '석사', schoolType: '대학원' },
    },
    { id: 'mh3', categoryId: 'award', icon: 'trophy', title: 'K-Startup Excellence 2024', subtitle: '수상 / 표창 · 직접 입력', description: '초기 스타트업 성장 전략 부문 우수 사례로 선정', year: '2024', metadata: { issuer: 'K-Startup' } },
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
    // [임시] 목업 기본값
    completenessPercent: 80,
    lockedBlocks: [
      { index: 5, missingItems: ['취향 1개'] },
    ],
    missingItems: ['취향 1개'],
  },
  experiences: [
    { id: 'e1', authorName: '김지수', isAnonymous: false, keywords: ['전문성이 느껴져요', '대화하면 생각이 넓어져요'], message: '대화하면 생각이 넓어지고 일도 깔끔하게 풀어가는 분이에요.', date: '2일 전' },
    { id: 'e2', authorName: null, isAnonymous: true, keywords: ['믿고 맡길 수 있어요', '일 처리가 빠르고 깔끔해요'], message: '', date: '5일 전' },
    { id: 'e3', authorName: '박소연', isAnonymous: false, keywords: ['아이디어가 늘 신선해요'], message: '새로운 관점과 아이디어를 계속 주는 분입니다.', date: '1주 전' },
  ],
  savedProfiles: [
    { id: 'p1', linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', memo: '비즈니스 살롱 2026.03 · 마케팅 인사이트 굿', savedAt: '3일 전' },
    { id: 'p2', linkId: 'mk', name: '강명구', title: 'Byth CEO', memo: '', savedAt: '1주 전' },
    { id: 'p3', linkId: 'kimdohyeon', name: '김도현', title: '독립 재무설계사', memo: '', savedAt: '2주 전' },
    { id: 'p4', linkId: 'parksojin', name: '박소진', title: 'Product Designer · Toss', memo: 'UX 리서치 방법론 공유 부탁드리기로 함', savedAt: '2주 전' },
    { id: 'p5', linkId: 'leejunhyuk', name: '이준혁', title: 'Series B 스타트업 CTO', memo: '', savedAt: '3주 전' },
    { id: 'p6', linkId: 'choisunyoung', name: '최선영', title: 'VC 심사역 · Primer Partners', memo: '포트폴리오 공유 받기로 함', savedAt: '3주 전' },
    { id: 'p7', linkId: 'yoonjisoo', name: '윤지수', title: '브랜드 디렉터 · 올리브영', memo: '2026 컬래버 미팅', savedAt: '1개월 전' },
    { id: 'p8', linkId: 'kwonminseok', name: '권민석', title: '데이터 사이언티스트 · 카카오', memo: '', savedAt: '1개월 전' },
    { id: 'p9', linkId: 'limjiyeon', name: '임지연', title: 'HR 컨설턴트', memo: '채용 전략 미팅에서 만남', savedAt: '1개월 전' },
    { id: 'p10', linkId: 'hansanghoon', name: '한상훈', title: '글로벌 세일즈 매니저 · Adobe', memo: '', savedAt: '2개월 전' },
    { id: 'p11', linkId: 'ohyerim', name: '오예림', title: '콘텐츠 크리에이터 · 독립', memo: '유튜브 협업 제안 검토 중', savedAt: '2개월 전' },
    { id: 'p12', linkId: 'jungwonho', name: '정원호', title: '의료 AI 스타트업 대표', memo: '', savedAt: '2개월 전' },
    { id: 'p13', linkId: 'baekhyunjin', name: '백현진', title: '전략 컨설턴트 · McKinsey', memo: '', savedAt: '3개월 전' },
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
    { keyword: '전문성이 느껴져요', count: 8 },
    { keyword: '믿고 맡길 수 있어요', count: 6 },
    { keyword: '대화하면 생각이 넓어져요', count: 4 },
    { keyword: '일 처리가 빠르고 깔끔해요', count: 3 },
    { keyword: '아이디어가 늘 신선해요', count: 2 },
  ],
  guestbook: [
    { id: 'g1', linkId: 'jiminlee', authorName: '이지민', message: '정말 인사이트 넘치는 분.', date: '3일 전' },
    { id: 'g2', linkId: 'mk', authorName: '강명구', message: '실행력이 정말 대단하신 분.', date: '1주 전' },
    { id: 'g3', linkId: 'kimdohyeon', authorName: '김도현', message: '대화가 구체적이고 믿음이 가는 분이었어요.', date: '2주 전' },
    { id: 'g4', linkId: 'chijiwon', authorName: '최지원', message: '비즈니스 관점이 선명해서 배우는 포인트가 많았습니다.', date: '3주 전' },
  ],
  tabVisibility: { who: 'public', vibe: 'private', network: 'public' },
}

export const MK_PROFILE = {
  linkId: 'mk',
  name: '강명구',
  title: 'Byth CEO',
  avatarColor: '#D4CABF',
  avatarImage: '/images/MK_img.jpeg',
  profileImages: [
    '/images/MK_img.jpeg',
    '/images/mk-photo-2.jpg',
  ],
  headline: 'Entrepreneur, Writer, Connector',
  school: '',
  bio: 'Entrepreneur, Writer, Connector. Byth에서 Byro 만들고 운영하고 있어요.',
  whoIAm: {
    mbti: 'ENTP',
  },
  birthDate: '1988-11-03',
  birthTime: '22:15',
  calendarType: 'solar' as const,
  showAge: true,
  life: {
    daily: {
      exercise: [
        { label: '골프', posterUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=80&h=80&q=75&fit=crop&auto=format' },
        { label: '웨이트', posterUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&h=80&q=75&fit=crop&auto=format' },
        { label: '산책', posterUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=80&h=80&q=75&fit=crop&auto=format' },
      ],
      pet: '고양이',
      petName: '모카',
      petImage: 'https://images.unsplash.com/photo-1533743983-6db3e3d99df4?w=160&h=160&q=75&fit=crop&auto=format',
    },
    tastes: {
      movies: [
        { label: '인턴', sublabel: '2015', posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '월터의 상상은 현실이 된다', sublabel: '2013', posterUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '헤어질 결심', sublabel: '2022', posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=80&h=112&q=75&fit=crop&auto=format' },
      ],
      music: [
        { label: '주저하는 연인들을 위해', sublabel: '잔나비', posterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=80&h=80&q=75&fit=crop&auto=format' },
        { label: '희재', sublabel: '성시경', posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&q=75&fit=crop&auto=format' },
        { label: 'Yellow', sublabel: 'Coldplay', posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&q=75&fit=crop&auto=format' },
      ],
      books: [
        { label: '당신의 엔진을 뜨겁게 달궈라', sublabel: '권도균', posterUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '원씽', sublabel: '게리 켈러', posterUrl: 'https://images.unsplash.com/photo-1495741545814-2d7f4d75ea09?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '사피엔스', sublabel: '유발 하라리', posterUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=80&h=112&q=75&fit=crop&auto=format' },
      ],
      plays: [
        { label: '웃는 남자', sublabel: '뮤지컬', posterUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=80&h=112&q=75&fit=crop&auto=format' },
      ],
      restaurants: [
        { label: '몽탄', sublabel: '한남동', posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=148&h=96&q=75&fit=crop&auto=format' },
        { label: '금돼지식당', sublabel: '한남동', posterUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=148&h=96&q=75&fit=crop&auto=format' },
      ],
      cafes: [
        { label: '테라로사', sublabel: '여러 지점', posterUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=148&h=96&q=75&fit=crop&auto=format' },
        { label: '블루보틀', sublabel: '성수동', posterUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=148&h=96&q=75&fit=crop&auto=format' },
      ],
    },
    albumPhotos: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1553484771-47a3aba16a77?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&q=80&fit=crop',
    ],
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
  instagramConnected: true,
  linkedinConnected: true,
  youtubeConnected: true,
  tiktokConnected: true,
  youtube: {
    channelName: '강민준',
    channelUrl: 'https://www.youtube.com/@epicmkk',
  },
  tiktok: {
    username: 'epicmkk',
    profileUrl: 'https://www.tiktok.com/@epicmkk',
  },
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
    topIndustryRanks: [
      { name: '부장/이사', ratio: 42 },
      { name: '차장', ratio: 28 },
      { name: '과장', ratio: 18 },
      { name: '대리/사원', ratio: 12 },
    ],
    topIndustryRoles: [
      { name: '개발/엔지니어', ratio: 45 },
      { name: '기획/PM', ratio: 25 },
      { name: '데이터', ratio: 18 },
      { name: '영업/BD', ratio: 12 },
    ],
    insight: {
      recentMeetings: 58,
      recentMonths: 3,
      topIndustryName: '금융·투자',
      topIndustryPercent: 29,
      growthIndustryName: 'VC·심사역',
      growthFrom: 9,
      growthTo: 27,
      growthPeriodLabel: '최근 6개월',
    },
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
  // [임시] 강명구: 프로필 미입력 가정 — 전체 블록 잠금 목업 (케미 정책 문서 4-1절: 상대 데이터 부족 시 공통점 없음)
  kemi: {
    matchCount: 0,
    matchItems: [],
    // TODO(AI): Replace with LLM-generated conversation starter based on full profile match context
    aiCopy: '아직 케미를 분석할 정보가 부족해요. 프로필을 채우면 공통점을 확인할 수 있어요.',
    completenessPercent: 0,
    lockedBlocks: [
      { index: 1, missingItems: ['MBTI 또는 취향 1종'] },
      { index: 2, missingItems: ['MBTI', '취향 2종'] },
      { index: 3, missingItems: ['취향 3종', '여행지 1개'] },
      { index: 4, missingItems: ['직무', '하이라이트 1개'] },
      { index: 5, missingItems: ['성향', '취향 5종'] },
    ],
    missingItems: ['MBTI', '성향', '취향 5종', '여행지 1개', '직무', '하이라이트 1개'],
  },
  reputationKeywords: [
    { keyword: '어려울 때 생각나는 사람이에요', count: 9 },
    { keyword: '전문성이 느껴져요', count: 7 },
    { keyword: '일 처리가 빠르고 깔끔해요', count: 6 },
    { keyword: '믿고 맡길 수 있어요', count: 5 },
    { keyword: '대화하면 생각이 넓어져요', count: 4 },
  ],
  guestbook: [
    { id: 'mkg1', linkId: 'jiminlee', authorName: '이지민', message: '큰 방향을 빠르게 정리하고 실제 실행으로 옮기는 힘이 분명한 분이에요.', date: '2일 전' },
    { id: 'mkg2', linkId: 'gangminjun', authorName: '강민준', message: '생각이 깊은데 실행이 느리지 않아서 같이 일할 때 추진력이 좋았습니다.', date: '5일 전' },
    { id: 'mkg3', linkId: 'kimdohyeon', authorName: '김도현', message: '사람을 연결하는 방식이 자연스럽고 진정성이 느껴졌어요.', date: '1주 전' },
    { id: 'mkg4', linkId: 'chijiwon', authorName: '최지원', message: '비즈니스 맥락을 읽는 힘이 좋아서 대화가 늘 선명했습니다.', date: '2주 전' },
  ],
  tabVisibility: { who: 'public', vibe: 'public', network: 'private' },
}

export const JIMIN_PROFILE = {
  linkId: 'jiminlee',
  name: '이지민',
  title: '스타트업 마케터 4년 경력',
  avatarColor: '#D8C4B2',
  avatarImage: '/images/jimin-profile-5x4.jpg',
  profileImages: [
    '/images/jimin-profile-5x4.jpg',
    '/images/jimin-photo-2.jpg',
    '/images/jimin-photo-3.jpg',
    '/images/jimin-photo-4.jpg',
  ],
  headline: '브랜드와 사람을 연결하는 스타트업 마케터',
  school: '연세대학교 경영학 학사',
  bio: '스타트업 생태계에서 브랜드와 사람을 연결하는 마케터입니다. 브랜드의 방향성과 사람들의 경험이 자연스럽게 이어지도록 설계하는 일을 좋아하고, 성장 전략과 커뮤니티 빌딩에도 꾸준히 관심을 두고 있습니다.',
  whoIAm: {
    mbti: 'ENTJ',
    // [임시] 목업 성향 데이터
    personality: '관계에서 처음엔 거리를 두지만 신뢰가 쌓이면 깊이 연결되는 편이에요. 일할 때는 방향이 먼저고, 실행은 빠르게 가는 스타일입니다.',
  },
  birthDate: '1995-03-27',
  birthTime: '19:20',
  calendarType: 'solar' as const,
  showAge: true,
  life: {
    daily: {
      exercise: [
        { label: '러닝', posterUrl: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=80&h=80&q=75&fit=crop&auto=format' },
        { label: '골프', posterUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=80&h=80&q=75&fit=crop&auto=format' },
      ],
      pet: '없음',
    },
    tastes: {
      // TODO(real API): posterUrl from TMDB API — image.tmdb.org/t/p/w185/{poster_path}
      movies: [
        { label: '머니볼', sublabel: '2011', posterUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '소셜 네트워크', sublabel: '2010', posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '나 홀로 집에 2', sublabel: '1992', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=80&h=112&q=75&fit=crop&auto=format' },
      ],
      // TODO(real API): posterUrl from Spotify API — i.scdn.co album art URL
      music: [
        { label: 'Tomboy', sublabel: '혁오', posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&q=75&fit=crop&auto=format' },
        { label: 'Everything', sublabel: '검정치마', posterUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=80&h=80&q=75&fit=crop&auto=format' },
        { label: 'Replay', sublabel: '김동률', posterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=80&h=80&q=75&fit=crop&auto=format' },
      ],
      // TODO(real API): posterUrl from 알라딘 API — cover image URL
      books: [
        { label: '린 스타트업', sublabel: '에릭 리스', posterUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '제로 투 원', sublabel: '피터 틸', posterUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=80&h=112&q=75&fit=crop&auto=format' },
        { label: '좋은 전략 나쁜 전략', sublabel: '리처드 루멜트', posterUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=80&h=112&q=75&fit=crop&auto=format' },
      ],
      plays: [
        { label: '렛미플라이', sublabel: '뮤지컬', posterUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=80&h=112&q=75&fit=crop&auto=format' },
      ],
      // TODO(real API): posterUrl from Kakao Maps / Google Places photo API
      restaurants: [
        { label: '성수 우육미엔', sublabel: '성수동', posterUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=148&h=96&q=75&fit=crop&auto=format' },
        { label: '압구정 뜸들이다', sublabel: '압구정', posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=148&h=96&q=75&fit=crop&auto=format' },
      ],
      // TODO(real API): posterUrl from Kakao Maps / Google Places photo API
      cafes: [
        { label: '센터커피', sublabel: '성수동', posterUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=148&h=96&q=75&fit=crop&auto=format' },
        { label: '프릳츠 원서점', sublabel: '서촌', posterUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=148&h=96&q=75&fit=crop&auto=format' },
      ],
    },
    albumPhotos: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1521334884684-d80222895322?w=400&h=400&q=80&fit=crop',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&q=80&fit=crop',
    ],
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
  instagramConnected: true,
  linkedinConnected: false,
  instagram: {
    username: 'jimin_lee',
    profileUrl: 'https://www.instagram.com/jimin_lee/',
    aiSummary: '스타트업 마케팅과 브랜딩 콘텐츠를 주로 공유합니다. 성장 전략과 커뮤니티 빌딩에 관심이 많습니다.',
    posts: [
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&q=75&fit=crop&auto=format', caption: '마케팅 전략 세션 🎯', timestamp: '1일 전' },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=400&h=400&q=75&fit=crop&auto=format', caption: '팀 워크숍 💡', timestamp: '3일 전' },
      { id: '3', imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=400&q=75&fit=crop&auto=format', caption: '콘퍼런스 참석 🌐', timestamp: '1주 전' },
      { id: '4', imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=400&q=75&fit=crop&auto=format', caption: '스타트업 네트워킹 🤝', timestamp: '2주 전' },
      { id: '5', imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&q=75&fit=crop&auto=format', caption: '브랜딩 작업 ✨', timestamp: '3주 전' },
      { id: '6', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&q=75&fit=crop&auto=format', caption: '팀 점심 🍱', timestamp: '1달 전' },
    ],
  },
  rememberHighlight: {
    total: 183,
    industries: [
      { name: '스타트업', ratio: 38, count: 70 },
      { name: '마케팅', ratio: 24, count: 44 },
      { name: 'IT', ratio: 22, count: 40 },
      { name: '투자', ratio: 16, count: 29 },
    ],
    topIndustryRanks: [
      { name: '대표/공동창업자', ratio: 40 },
      { name: '팀장', ratio: 30 },
      { name: '팀원', ratio: 20 },
      { name: '인턴', ratio: 10 },
    ],
    topIndustryRoles: [
      { name: '마케팅', ratio: 45 },
      { name: '기획', ratio: 30 },
      { name: '영업/BD', ratio: 15 },
      { name: '기타', ratio: 10 },
    ],
    insight: {
      recentMeetings: 21,
      recentMonths: 3,
      topIndustryName: '마케팅',
      topIndustryPercent: 24,
      growthIndustryName: '스타트업',
      growthFrom: 18,
      growthTo: 38,
      growthPeriodLabel: '최근 6개월',
    },
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
    completenessPercent: 100,
    lockedBlocks: [],
    missingItems: [],
  },
  reputationKeywords: [
    { keyword: '전문성이 느껴져요', count: 5 },
    { keyword: '믿고 맡길 수 있어요', count: 4 },
    { keyword: '대화하면 생각이 넓어져요', count: 2 },
    { keyword: '스타일이 세련됐어요', count: 1 },
  ],
  guestbook: [
    { id: 'jg1', linkId: 'gangminjun', authorName: '강민준', message: '대화하면 생각이 넓어지는 분이에요.', date: '2일 전' },
    { id: 'jg2', linkId: 'mk', authorName: '강명구', message: '브랜딩 감각이 좋아서 같이 일하고 싶은 분입니다.', date: '5일 전' },
    { id: 'jg3', linkId: 'chijiwon', authorName: '최지원', message: '사람을 편하게 연결하는 힘이 있어요.', date: '1주 전' },
    { id: 'jg4', linkId: 'kimdohyeon', authorName: '김도현', message: '마케팅 관점이 실무적이라 대화가 특히 좋았습니다.', date: '2주 전' },
  ],
  tabVisibility: { who: 'public', vibe: 'public', network: 'public' },
}

// ─── 박소진 ───────────────────────────────────────────────────────────────────
// 엣지케이스: 전탭 공개, Instagram 연결, IT/테크 네트워크
export const PARKSOJIN_PROFILE = {
  linkId: 'parksojin',
  name: '박소진',
  title: 'Product Designer · Toss',
  headline: '금융을 더 직관적으로 · UX + Product',
  school: '홍익대학교 시각디자인',
  bio: '금융 경험을 더 쉽고 직관적으로 만드는 데 집중하고 있어요. UX 리서치와 프로덕트 전략을 연결하는 디자이너예요.',
  avatarColor: '#7B9FE8', avatarImage: undefined, profileImages: [] as string[],
  whoIAm: { mbti: 'INFJ' },
  instagramConnected: true,
  linkedinConnected: false,
  rememberHighlight: {
    total: 312,
    industries: [
      { name: 'IT/테크', ratio: 40, count: 125 },
      { name: '금융', ratio: 25, count: 78 },
      { name: '스타트업', ratio: 22, count: 69 },
      { name: '디자인/에이전시', ratio: 13, count: 40 },
    ],
    topIndustryRanks: [
      { name: '시니어/리드', ratio: 38 },
      { name: '매니저/PL', ratio: 30 },
      { name: '주니어', ratio: 22 },
      { name: '인턴', ratio: 10 },
    ],
    topIndustryRoles: [
      { name: '디자인', ratio: 45 },
      { name: '개발', ratio: 30 },
      { name: '기획/PM', ratio: 20 },
      { name: '기타', ratio: 5 },
    ],
  },
  life: {
    daily: { exercise: [{ label: '필라테스' }] },
    tastes: {
      movies: [{ label: '콜 미 바이 유어 네임', sublabel: '루카 구아다니노' }, { label: '그랜드 부다페스트 호텔', sublabel: '웨스 앤더슨' }],
      music: [{ label: '검정치마', sublabel: '조휴일', previewUrl: '' }, { label: 'NewJeans', sublabel: 'Hanni', previewUrl: '' }],
      books: [{ label: '디자인의 디자인', sublabel: '하라 켄야' }, { label: '보이지 않는 고릴라', sublabel: '크리스토퍼 차브리스' }],
      plays: [],
      restaurants: [{ label: '마루 by 누룩', sublabel: '서울 마포' }],
      cafes: [{ label: '펠트커피', sublabel: '서울 마포' }, { label: '어니언', sublabel: '성수' }],
    },
  },
  manualHighlights: [
    { id: 'psj0', categoryId: 'career-role', icon: 'briefcase', title: 'Toss (비바리퍼블리카)', subtitle: '경력 · 재직 중', description: '금융 서비스의 사용자 경험 전반을 설계하고, UX 리서치를 통해 프로덕트 방향을 함께 정의하고 있어요.', year: '2021 - 현재', metadata: { status: '재직 중', role: 'Product Designer' } },
    { id: 'psj1', categoryId: 'career-role', icon: 'briefcase', title: 'NAVER', subtitle: '경력 · 종료', description: '네이버 쇼핑 UX팀에서 모바일 커머스 인터페이스를 설계했습니다.', year: '2018 - 2021', metadata: { status: '종료', role: 'UX Designer' } },
    { id: 'psj2', categoryId: 'education-history', icon: 'book-open', title: '홍익대학교', subtitle: '학력 · 졸업', description: '시각디자인학과 졸업. 타이포그래피와 인터랙션 디자인 전공.', year: '2014 - 2018', metadata: { status: '졸업', degree: '학사', schoolType: '대학교' } },
  ] as Highlight[],
  kemi: {
    matchCount: 3,
    matchItems: [
      { label: '필라테스', category: 'taste' },
      { label: '성수', category: 'place' },
      { label: '검정치마', category: 'taste' },
    ],
    aiCopy: '필라테스를 즐기고 성수를 자주 찾는 디자이너예요. 좋아하는 카페나 디자인 이야기로 대화를 시작해보세요.',
    completenessPercent: 85,
    lockedBlocks: [],
    missingItems: [],
  },
  experiences: [
    { id: 'psje1', authorName: '김태양', isAnonymous: false, keywords: ['전문성이 느껴져요', '아이디어가 늘 신선해요'], message: '디자인 관점이 정말 날카롭고 사용자 입장에서 항상 생각하는 분이에요.', date: '1주 전' },
  ],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [
    { keyword: '전문성이 느껴져요', count: 11 },
    { keyword: '아이디어가 늘 신선해요', count: 7 },
    { keyword: '디테일이 살아있어요', count: 5 },
  ],
  guestbook: [
    { id: 'psjg1', linkId: 'leejunhyuk', authorName: '이준혁', message: '디자인 피드백이 항상 명확하고 설득력 있어요.', date: '2주 전' },
  ],
  rememberHighlight_ref: '',
  contactChannels: [
    { id: 'email', label: '이메일', value: 'sojin@toss.im', href: 'mailto:sojin@toss.im', enabled: true },
    { id: 'kakao', label: '카카오', value: 'sojin_design', enabled: false },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'public' as const, vibe: 'public' as const, network: 'public' as const },
}

// ─── 이준혁 ───────────────────────────────────────────────────────────────────
// 엣지케이스: 바이브 탭 비공개, 라이프 데이터 없음, 스타트업 네트워크(강민준과 겹침)
export const LEEJUNHYUK_PROFILE = {
  linkId: 'leejunhyuk',
  name: '이준혁',
  title: 'CTO · Series B 스타트업',
  headline: '기술로 제품을 만드는 사람',
  school: 'KAIST 전산학부',
  bio: '빠르게 성장하는 팀에서 기술 기반을 다지는 일을 해요. 개발 문화와 시스템 설계에 진심입니다.',
  avatarColor: '#4A7B5E', avatarImage: undefined, profileImages: [] as string[],
  whoIAm: { mbti: 'INTJ' },
  instagramConnected: false,
  linkedinConnected: true,
  rememberHighlight: {
    total: 428,
    industries: [
      { name: '스타트업', ratio: 45, count: 193 },
      { name: 'IT/테크', ratio: 30, count: 128 },
      { name: '투자/VC', ratio: 15, count: 64 },
      { name: '기타', ratio: 10, count: 43 },
    ],
    topIndustryRanks: [
      { name: 'CTO/VPE', ratio: 38 },
      { name: '시니어 엔지니어', ratio: 35 },
      { name: '미들', ratio: 20 },
      { name: '주니어', ratio: 7 },
    ],
    topIndustryRoles: [
      { name: '개발/엔지니어', ratio: 60 },
      { name: '기획/PM', ratio: 25 },
      { name: '인프라/DevOps', ratio: 15 },
    ],
  },
  life: undefined,
  manualHighlights: [
    { id: 'ljh0', categoryId: 'career-role', icon: 'briefcase', title: 'Flexi (플렉시)', subtitle: '경력 · 재직 중', description: 'B2B SaaS 플랫폼의 기술 전반을 총괄. 마이크로서비스 아키텍처 설계 및 개발팀 빌딩을 주도하고 있어요.', year: '2022 - 현재', metadata: { status: '재직 중', role: 'CTO' } },
    { id: 'ljh1', categoryId: 'career-role', icon: 'briefcase', title: 'Kakao', subtitle: '경력 · 종료', description: '카카오 서버 플랫폼팀에서 대용량 트래픽 처리 시스템을 개발했습니다.', year: '2018 - 2022', metadata: { status: '종료', role: 'Backend Engineer' } },
    { id: 'ljh2', categoryId: 'education-history', icon: 'book-open', title: 'KAIST', subtitle: '학력 · 졸업', description: '전산학부 졸업. 분산 시스템과 알고리즘 전공.', year: '2014 - 2018', metadata: { status: '졸업', degree: '학사', schoolType: '대학교' } },
  ] as Highlight[],
  kemi: {
    matchCount: 2,
    matchItems: [
      { label: '스타트업 생태계', category: 'identity' },
      { label: '기획/PM 관심', category: 'identity' },
    ],
    aiCopy: '스타트업에서 기술을 이끄는 분이에요. 개발 문화나 팀 빌딩 경험으로 대화를 시작해보세요.',
    completenessPercent: 60,
    lockedBlocks: [{ index: 3, missingItems: ['취향 2개'] }, { index: 4, missingItems: ['장소 1개'] }, { index: 5, missingItems: ['라이프스타일 1개'] }],
    missingItems: ['취향 2개', '장소 1개'],
  },
  experiences: [
    { id: 'ljhe1', authorName: null, isAnonymous: true, keywords: ['전문성이 느껴져요', '믿고 맡길 수 있어요'], message: '기술적 판단력이 탁월하고 팀을 잘 이끄는 분이에요.', date: '3일 전' },
  ],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [
    { keyword: '전문성이 느껴져요', count: 14 },
    { keyword: '믿고 맡길 수 있어요', count: 9 },
    { keyword: '일 처리가 빠르고 깔끔해요', count: 6 },
  ],
  guestbook: [
    { id: 'ljhg1', linkId: 'parksojin', authorName: '박소진', message: '개발팀과 소통하는 방식이 명확하고 협업하기 너무 좋아요.', date: '1주 전' },
  ],
  contactChannels: [
    { id: 'email', label: '이메일', value: 'jh@flexi.io', href: 'mailto:jh@flexi.io', enabled: true },
    { id: 'kakao', label: '카카오', value: '', enabled: false },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'public' as const, vibe: 'private' as const, network: 'public' as const },
}

// ─── 최선영 ───────────────────────────────────────────────────────────────────
// 엣지케이스: 네트워크 탭 비공개, 라이프 있음
export const CHOISUNYOUNG_PROFILE = {
  linkId: 'choisunyoung',
  name: '최선영',
  title: 'VC 심사역 · Primer Partners',
  headline: '초기 스타트업 투자 · B2B SaaS · 딥테크',
  school: '연세대학교 경영학',
  bio: '초기 스타트업을 발굴하고 성장시키는 일을 해요. B2B SaaS와 딥테크에 관심이 많아요.',
  avatarColor: '#C47A5A', avatarImage: undefined, profileImages: [] as string[],
  whoIAm: { mbti: 'ENTJ' },
  instagramConnected: false,
  linkedinConnected: true,
  rememberHighlight: {
    total: 589,
    industries: [
      { name: '투자/VC', ratio: 42, count: 247 },
      { name: '스타트업', ratio: 32, count: 188 },
      { name: 'IT/테크', ratio: 16, count: 94 },
      { name: '컨설팅', ratio: 10, count: 59 },
    ],
    topIndustryRanks: [
      { name: '심사역/파트너', ratio: 50 },
      { name: '어소시에이트', ratio: 28 },
      { name: '대표/임원', ratio: 15 },
      { name: '기타', ratio: 7 },
    ],
    topIndustryRoles: [
      { name: '투자심사', ratio: 55 },
      { name: '포트폴리오 지원', ratio: 25 },
      { name: 'IR/BD', ratio: 20 },
    ],
  },
  life: {
    daily: { exercise: [{ label: '테니스' }] },
    tastes: {
      movies: [{ label: '파친코', sublabel: 'Apple TV+' }],
      music: [{ label: 'Radiohead', sublabel: 'Thom Yorke', previewUrl: '' }],
      books: [{ label: 'Zero to One', sublabel: '피터 틸' }, { label: '하드씽', sublabel: '벤 호로위츠' }],
      plays: [],
      restaurants: [{ label: '밍글스', sublabel: '서울 강남' }],
      cafes: [{ label: 'Fritz Coffee', sublabel: '서울 마포' }],
    },
  },
  manualHighlights: [
    { id: 'csy0', categoryId: 'career-role', icon: 'briefcase', title: 'Primer Partners', subtitle: '경력 · 재직 중', description: '초기 단계 B2B SaaS·딥테크 스타트업 발굴 및 투자심사, 포트폴리오 성장 지원을 담당하고 있어요.', year: '2020 - 현재', metadata: { status: '재직 중', role: '심사역' } },
    { id: 'csy1', categoryId: 'career-role', icon: 'briefcase', title: 'McKinsey & Company', subtitle: '경력 · 종료', description: '전략 컨설턴트로 금융·테크 분야 클라이언트를 지원했습니다.', year: '2016 - 2020', metadata: { status: '종료', role: 'Consultant' } },
    { id: 'csy2', categoryId: 'education-history', icon: 'book-open', title: '연세대학교', subtitle: '학력 · 졸업', description: '경영학과 졸업. 재무·전략 전공.', year: '2012 - 2016', metadata: { status: '졸업', degree: '학사', schoolType: '대학교' } },
  ] as Highlight[],
  kemi: null,
  experiences: [
    { id: 'csye1', authorName: '이준혁', isAnonymous: false, keywords: ['전문성이 느껴져요', '대화하면 생각이 넓어져요'], message: '스타트업 생태계를 정말 넓게 보시는 분이에요.', date: '2주 전' },
  ],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [
    { keyword: '전문성이 느껴져요', count: 18 },
    { keyword: '대화하면 생각이 넓어져요', count: 12 },
    { keyword: '믿고 맡길 수 있어요', count: 8 },
  ],
  guestbook: [
    { id: 'csyg1', linkId: 'leejunhyuk', authorName: '이준혁', message: '투자 관점이 날카롭고 스타트업 이해도가 정말 높아요.', date: '3주 전' },
  ],
  contactChannels: [
    { id: 'email', label: '이메일', value: 'sy@primer.vc', href: 'mailto:sy@primer.vc', enabled: true },
    { id: 'kakao', label: '카카오', value: '', enabled: false },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'public' as const, vibe: 'public' as const, network: 'private' as const },
}

// ─── 윤지수 ───────────────────────────────────────────────────────────────────
// 엣지케이스: WHO 탭 비공개, 바이브/네트워크는 공개
export const YOONJISOO_PROFILE = {
  linkId: 'yoonjisoo',
  name: '윤지수',
  title: '브랜드 디렉터 · 올리브영',
  headline: '브랜드가 일상에 스며드는 방식',
  school: '이화여자대학교 소비자학',
  bio: '브랜드가 사람들의 일상에 자연스럽게 스며드는 방식을 설계해요. 전략과 감성 사이 어딘가를 걷는 중이에요.',
  avatarColor: '#9B6B9E', avatarImage: undefined, profileImages: [] as string[],
  whoIAm: { mbti: 'ENFP' },
  instagramConnected: true,
  linkedinConnected: false,
  rememberHighlight: {
    total: 276,
    industries: [
      { name: '마케팅/PR', ratio: 35, count: 97 },
      { name: '유통/리테일', ratio: 28, count: 77 },
      { name: '뷰티/패션', ratio: 22, count: 61 },
      { name: '미디어', ratio: 15, count: 41 },
    ],
    topIndustryRanks: [
      { name: '디렉터/본부장', ratio: 32 },
      { name: '매니저/팀장', ratio: 38 },
      { name: '주임/대리', ratio: 22 },
      { name: '인턴', ratio: 8 },
    ],
    topIndustryRoles: [
      { name: '브랜드 마케팅', ratio: 48 },
      { name: '콘텐츠', ratio: 28 },
      { name: '퍼포먼스', ratio: 15 },
      { name: '기타', ratio: 9 },
    ],
  },
  life: {
    daily: { exercise: [{ label: '요가' }], pet: '고양이', petName: '모카' },
    tastes: {
      movies: [{ label: '비포 선라이즈', sublabel: '리처드 링클레이터' }, { label: '아멜리에', sublabel: '장 피에르 쥬네' }],
      music: [{ label: 'MUNA', sublabel: 'Silk Chiffon', previewUrl: '' }, { label: '새소년', sublabel: '난춘', previewUrl: '' }],
      books: [{ label: '82년생 김지영', sublabel: '조남주' }],
      plays: [{ label: '킹키부츠', sublabel: '뮤지컬' }],
      restaurants: [{ label: '권숙수', sublabel: '서울 강남' }, { label: '오프레코드', sublabel: '서울 마포' }],
      cafes: [{ label: '카페 노티드', sublabel: '청담' }, { label: '테라로사', sublabel: '강릉' }],
    },
    albumPhotos: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop',
    ],
  },
  manualHighlights: [
    { id: 'yjg0', categoryId: 'career-role', icon: 'briefcase', title: 'CJ 올리브영', subtitle: '경력 · 재직 중', description: '헬스앤뷰티 리테일 브랜드의 전략 방향과 캠페인 전체를 총괄하고 있어요.', year: '2019 - 현재', metadata: { status: '재직 중', role: '브랜드 디렉터' } },
    { id: 'yjg1', categoryId: 'career-role', icon: 'briefcase', title: 'Amorepacific', subtitle: '경력 · 종료', description: '이니스프리 브랜드 마케팅팀에서 글로벌 캠페인을 담당했습니다.', year: '2015 - 2019', metadata: { status: '종료', role: '브랜드 매니저' } },
  ] as Highlight[],
  kemi: {
    matchCount: 2,
    matchItems: [
      { label: '요가', category: 'taste' },
      { label: '파리', category: 'place' },
    ],
    aiCopy: '요가를 즐기고 파리를 꿈꾸는 브랜드 디렉터예요. 브랜드 이야기나 여행 경험으로 대화를 시작해보세요.',
    completenessPercent: 90,
    lockedBlocks: [],
    missingItems: [],
  },
  experiences: [
    { id: 'yjge1', authorName: '박소진', isAnonymous: false, keywords: ['아이디어가 늘 신선해요', '대화하면 생각이 넓어져요'], message: '브랜드를 보는 시각이 정말 독특하고 배울 게 많은 분이에요.', date: '5일 전' },
  ],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [
    { keyword: '아이디어가 늘 신선해요', count: 13 },
    { keyword: '대화하면 생각이 넓어져요', count: 9 },
    { keyword: '전문성이 느껴져요', count: 7 },
  ],
  guestbook: [],
  contactChannels: [
    { id: 'email', label: '이메일', value: 'jisoo.yoon@cj.net', href: 'mailto:jisoo.yoon@cj.net', enabled: true },
    { id: 'kakao', label: '카카오', value: 'jisoo_brand', enabled: true },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'private' as const, vibe: 'public' as const, network: 'public' as const },
}

// ─── 권민석 ───────────────────────────────────────────────────────────────────
// 엣지케이스: 전탭 공개, 스타트업 네트워크 강민준(SAMPLE)과 겹침
export const KWONMINSEOK_PROFILE = {
  linkId: 'kwonminseok',
  name: '권민석',
  title: '데이터 사이언티스트 · 카카오',
  headline: '데이터로 의사결정을 돕는 사람',
  school: '서울대학교 통계학',
  bio: '데이터로 의사결정을 돕는 사람이에요. ML 모델링과 데이터 파이프라인 설계를 주로 해요.',
  avatarColor: '#E8B84B', avatarImage: undefined, profileImages: [] as string[],
  whoIAm: { mbti: 'INTP' },
  instagramConnected: false,
  linkedinConnected: true,
  rememberHighlight: {
    total: 203,
    industries: [
      { name: 'IT/테크', ratio: 35, count: 71 },
      { name: '스타트업', ratio: 28, count: 57 },
      { name: 'AI/ML', ratio: 22, count: 45 },
      { name: '금융', ratio: 15, count: 30 },
    ],
    topIndustryRanks: [
      { name: '시니어 엔지니어', ratio: 40 },
      { name: '리드/헤드', ratio: 30 },
      { name: '미들', ratio: 20 },
      { name: '주니어', ratio: 10 },
    ],
    topIndustryRoles: [
      { name: '데이터 사이언스', ratio: 50 },
      { name: '개발', ratio: 30 },
      { name: 'ML/AI', ratio: 20 },
    ],
  },
  life: {
    daily: { exercise: [{ label: '수영' }, { label: '헬스' }] },
    tastes: {
      movies: [{ label: '인터스텔라', sublabel: '크리스토퍼 놀란' }],
      music: [{ label: 'Radiohead', sublabel: 'OK Computer', previewUrl: '' }, { label: 'Bon Iver', sublabel: 'Skinny Love', previewUrl: '' }],
      books: [{ label: '생각에 관한 생각', sublabel: '다니엘 카너먼' }, { label: '넛지', sublabel: '리처드 탈러' }, { label: 'Factfulness', sublabel: '한스 로슬링' }],
      plays: [],
      restaurants: [{ label: '을지로 양지설렁탕', sublabel: '서울 중구' }],
      cafes: [{ label: '블루보틀', sublabel: '성수' }],
    },
  },
  manualHighlights: [
    { id: 'kms0', categoryId: 'career-role', icon: 'briefcase', title: 'Kakao', subtitle: '경력 · 재직 중', description: '카카오 추천 시스템팀에서 개인화 알고리즘 개선과 A/B 테스트 프레임워크를 개발하고 있어요.', year: '2020 - 현재', metadata: { status: '재직 중', role: 'Data Scientist' } },
    { id: 'kms1', categoryId: 'career-role', icon: 'briefcase', title: 'Coupang', subtitle: '경력 · 종료', description: '쿠팡 물류 최적화 팀에서 수요 예측 모델을 개발했습니다.', year: '2017 - 2020', metadata: { status: '종료', role: 'Data Analyst' } },
    { id: 'kms2', categoryId: 'education-history', icon: 'book-open', title: '서울대학교', subtitle: '학력 · 졸업', description: '통계학과 졸업. 머신러닝·베이지안 통계 전공.', year: '2013 - 2017', metadata: { status: '졸업', degree: '학사', schoolType: '대학교' } },
    { id: 'kms3', categoryId: 'publish', icon: 'file-text', title: 'KDD 2023 논문 게재', subtitle: '출판/논문 · 직접 입력', description: '개인화 추천 시스템 개선 관련 논문을 KDD 2023에 게재했습니다.', year: '2023', metadata: {} },
  ] as Highlight[],
  kemi: {
    matchCount: 3,
    matchItems: [
      { label: 'Bon Iver', category: 'taste' },
      { label: '수영', category: 'taste' },
      { label: 'LA 레이커스', category: 'taste' },
    ],
    aiCopy: '데이터로 세상을 보는 분이에요. 책이나 음악 취향이 겹치면 바로 통할 것 같아요.',
    completenessPercent: 75,
    lockedBlocks: [{ index: 5, missingItems: ['장소 1개'] }],
    missingItems: ['장소 1개'],
  },
  experiences: [
    { id: 'kmse1', authorName: null, isAnonymous: true, keywords: ['전문성이 느껴져요'], message: '데이터 분석 인사이트가 탁월해요.', date: '1주 전' },
  ],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [
    { keyword: '전문성이 느껴져요', count: 16 },
    { keyword: '대화하면 생각이 넓어져요', count: 8 },
    { keyword: '믿고 맡길 수 있어요', count: 5 },
  ],
  guestbook: [
    { id: 'kmsg1', linkId: 'leejunhyuk', authorName: '이준혁', message: '데이터 기반 의사결정을 팀 문화로 만드는 데 정말 큰 도움이 됐어요.', date: '1개월 전' },
  ],
  contactChannels: [
    { id: 'email', label: '이메일', value: 'minseok.kwon@kakao.com', href: 'mailto:minseok.kwon@kakao.com', enabled: true },
    { id: 'kakao', label: '카카오', value: '', enabled: false },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'public' as const, vibe: 'public' as const, network: 'public' as const },
}

// ─── 임지연 ───────────────────────────────────────────────────────────────────
// 엣지케이스: 스파스 프로필 — 하이라이트 없음, 라이프 최소, 네트워크 소규모
export const LIMJIYEON_PROFILE = {
  linkId: 'limjiyeon',
  name: '임지연',
  title: 'HR 컨설턴트',
  headline: '',
  school: '고려대학교 심리학',
  bio: '사람과 조직이 더 잘 일할 수 있도록 돕고 있어요.',
  avatarColor: '#8A9BA8', avatarImage: undefined, profileImages: [] as string[],
  whoIAm: undefined,
  instagramConnected: false,
  linkedinConnected: false,
  rememberHighlight: {
    total: 47,
    industries: [
      { name: '컨설팅', ratio: 30, count: 14 },
      { name: '교육/HR', ratio: 28, count: 13 },
      { name: '스타트업', ratio: 22, count: 10 },
      { name: '기타', ratio: 20, count: 10 },
    ],
    topIndustryRanks: [
      { name: '매니저', ratio: 45 },
      { name: '시니어', ratio: 30 },
      { name: '주니어', ratio: 25 },
    ],
    topIndustryRoles: [
      { name: 'HR/조직', ratio: 55 },
      { name: '컨설팅', ratio: 30 },
      { name: '기타', ratio: 15 },
    ],
  },
  life: {
    daily: { exercise: [] },
    tastes: {
      movies: [],
      music: [],
      books: [{ label: '채식주의자', sublabel: '한강' }],
      plays: [],
      restaurants: [],
      cafes: [],
    },
  },
  manualHighlights: [] as Highlight[],
  kemi: null,
  experiences: [],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [],
  guestbook: [],
  contactChannels: [
    { id: 'email', label: '이메일', value: 'jiyeon.lim@gmail.com', href: 'mailto:jiyeon.lim@gmail.com', enabled: true },
    { id: 'kakao', label: '카카오', value: '', enabled: false },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'public' as const, vibe: 'public' as const, network: 'public' as const },
}

// ─── 한상훈 ───────────────────────────────────────────────────────────────────
// 엣지케이스: LinkedIn 연결, IT/테크 네트워크 강명구(MK)와 겹침
export const HANSANGHOON_PROFILE = {
  linkId: 'hansanghoon',
  name: '한상훈',
  title: '글로벌 세일즈 매니저 · Adobe',
  headline: 'Enterprise Sales · APAC · B2B',
  school: '성균관대학교 국제경영',
  bio: '엔터프라이즈 소프트웨어 세일즈 7년 차. APAC 시장 파트너십 구축과 B2B 딜 클로징을 담당하고 있어요.',
  avatarColor: '#E06B4A', avatarImage: undefined, profileImages: [] as string[],
  whoIAm: { mbti: 'ESTP' },
  instagramConnected: false,
  linkedinConnected: true,
  rememberHighlight: {
    total: 534,
    industries: [
      { name: 'IT/테크', ratio: 38, count: 203 },
      { name: '미디어/광고', ratio: 25, count: 134 },
      { name: '마케팅', ratio: 20, count: 107 },
      { name: '기타', ratio: 17, count: 90 },
    ],
    topIndustryRanks: [
      { name: '매니저/디렉터', ratio: 42 },
      { name: '시니어', ratio: 30 },
      { name: '주임/대리', ratio: 18 },
      { name: 'C레벨', ratio: 10 },
    ],
    topIndustryRoles: [
      { name: '영업/BD', ratio: 50 },
      { name: '마케팅', ratio: 28 },
      { name: '파트너십', ratio: 22 },
    ],
  },
  life: {
    daily: { exercise: [{ label: '골프' }, { label: '러닝' }] },
    tastes: {
      movies: [{ label: '탑건: 매버릭', sublabel: '조셉 코신스키' }],
      music: [{ label: 'Bruno Mars', sublabel: 'The Lazy Song', previewUrl: '' }],
      books: [{ label: 'Never Split the Difference', sublabel: '크리스 보스' }],
      plays: [],
      restaurants: [{ label: '하코야', sublabel: '서울 강남' }],
      cafes: [{ label: '스타벅스 리저브', sublabel: '서울 강남' }],
    },
  },
  manualHighlights: [
    { id: 'hsh0', categoryId: 'career-role', icon: 'briefcase', title: 'Adobe', subtitle: '경력 · 재직 중', description: 'Creative Cloud 및 Document Cloud 엔터프라이즈 계정 APAC 세일즈를 담당하고 있어요.', year: '2020 - 현재', metadata: { status: '재직 중', role: 'Senior Account Executive' } },
    { id: 'hsh1', categoryId: 'career-role', icon: 'briefcase', title: 'Salesforce', subtitle: '경력 · 종료', description: 'CRM 솔루션 엔터프라이즈 영업을 담당했습니다.', year: '2017 - 2020', metadata: { status: '종료', role: 'Account Executive' } },
    { id: 'hsh2', categoryId: 'education-history', icon: 'book-open', title: '성균관대학교', subtitle: '학력 · 졸업', description: '국제경영학과 졸업.', year: '2013 - 2017', metadata: { status: '졸업', degree: '학사', schoolType: '대학교' } },
  ] as Highlight[],
  kemi: {
    matchCount: 2,
    matchItems: [
      { label: '골프', category: 'taste' },
      { label: '싱가포르', category: 'place' },
    ],
    aiCopy: '골프와 글로벌 비즈니스를 즐기는 세일즈 전문가예요. 해외 시장이나 영업 전략으로 대화를 시작해보세요.',
    completenessPercent: 70,
    lockedBlocks: [{ index: 4, missingItems: ['취향 1개'] }, { index: 5, missingItems: ['장소 1개'] }],
    missingItems: ['취향 1개', '장소 1개'],
  },
  experiences: [
    { id: 'hshe1', authorName: '최선영', isAnonymous: false, keywords: ['믿고 맡길 수 있어요', '일 처리가 빠르고 깔끔해요'], message: '딜 클로징 능력이 정말 탁월해요.', date: '3일 전' },
  ],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [
    { keyword: '믿고 맡길 수 있어요', count: 12 },
    { keyword: '일 처리가 빠르고 깔끔해요', count: 9 },
    { keyword: '전문성이 느껴져요', count: 6 },
  ],
  guestbook: [
    { id: 'hshg1', linkId: 'choisunyoung', authorName: '최선영', message: '어떤 상황에서도 딜을 이끌어가는 추진력이 인상적이에요.', date: '1주 전' },
  ],
  contactChannels: [
    { id: 'email', label: '이메일', value: 'sanghoon.han@adobe.com', href: 'mailto:sanghoon.han@adobe.com', enabled: true },
    { id: 'kakao', label: '카카오', value: 'sanghoon_sales', enabled: true },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'public' as const, vibe: 'public' as const, network: 'public' as const },
}

// ─── 오예림 ───────────────────────────────────────────────────────────────────
// 엣지케이스: 네트워크 탭 비공개, Instagram 연결, 바이브 풍부
export const OHYERIM_PROFILE = {
  linkId: 'ohyerim',
  name: '오예림',
  title: '콘텐츠 크리에이터 · 독립',
  headline: '일상 속 작은 영감을 영상으로',
  school: '중앙대학교 미디어커뮤니케이션',
  bio: '브이로그와 라이프스타일 콘텐츠를 만들어요. 일상 속 작은 영감을 영상으로 담아내고 있어요.',
  avatarColor: '#E87B8A', avatarImage: undefined, profileImages: [] as string[],
  whoIAm: { mbti: 'ISFP' },
  instagramConnected: true,
  linkedinConnected: false,
  rememberHighlight: {
    total: 138,
    industries: [
      { name: '미디어/콘텐츠', ratio: 42, count: 58 },
      { name: '마케팅/PR', ratio: 28, count: 39 },
      { name: '뷰티/패션', ratio: 18, count: 25 },
      { name: '기타', ratio: 12, count: 16 },
    ],
    topIndustryRanks: [
      { name: '프리랜서/독립', ratio: 48 },
      { name: '매니저', ratio: 28 },
      { name: '주니어', ratio: 15 },
      { name: '인턴', ratio: 9 },
    ],
    topIndustryRoles: [
      { name: '콘텐츠 제작', ratio: 55 },
      { name: '마케팅', ratio: 25 },
      { name: 'PD/편집', ratio: 20 },
    ],
  },
  life: {
    daily: { exercise: [{ label: '필라테스' }] },
    tastes: {
      movies: [{ label: '리틀 포레스트', sublabel: '임순례' }, { label: '미드나잇 인 파리', sublabel: '우디 앨런' }, { label: '비포 선셋', sublabel: '리처드 링클레이터' }],
      music: [{ label: 'IU (아이유)', sublabel: '밤편지', previewUrl: '' }, { label: 'Novo Amor', sublabel: 'Birthplace', previewUrl: '' }],
      books: [{ label: '나는 나로 살기로 했다', sublabel: '김수현' }, { label: '어린 왕자', sublabel: '생텍쥐페리' }],
      plays: [],
      restaurants: [{ label: '이태원 경양식', sublabel: '서울 용산' }],
      cafes: [{ label: '어니언', sublabel: '성수' }, { label: '카페 할아버지', sublabel: '서울 마포' }],
    },
    albumPhotos: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=400&fit=crop',
    ],
  },
  manualHighlights: [
    { id: 'oyr0', categoryId: 'career-role', icon: 'pencil', title: '독립 크리에이터', subtitle: '경력 · 재직 중', description: '라이프스타일·일상 브이로그 채널 운영. 구독자 12만. 뷰티·여행 브랜드 협업.', year: '2021 - 현재', metadata: { status: '재직 중', role: 'Content Creator' } },
    { id: 'oyr1', categoryId: 'career-role', icon: 'briefcase', title: 'W미디어', subtitle: '경력 · 종료', description: '영상 콘텐츠 기획 및 제작을 담당했습니다.', year: '2019 - 2021', metadata: { status: '종료', role: 'PD' } },
  ] as Highlight[],
  kemi: {
    matchCount: 3,
    matchItems: [
      { label: '필라테스', category: 'taste' },
      { label: '교토', category: 'place' },
      { label: '아이유', category: 'taste' },
    ],
    aiCopy: '필라테스를 즐기고 교토를 좋아하는 크리에이터예요. 영상이나 여행 이야기로 대화를 시작해보세요.',
    completenessPercent: 95,
    lockedBlocks: [],
    missingItems: [],
  },
  experiences: [
    { id: 'oyre1', authorName: '윤지수', isAnonymous: false, keywords: ['아이디어가 늘 신선해요'], message: '콘텐츠 감각이 정말 뛰어나고 협업하면 늘 새로운 게 나와요.', date: '4일 전' },
  ],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [
    { keyword: '아이디어가 늘 신선해요', count: 20 },
    { keyword: '대화하면 생각이 넓어져요', count: 11 },
    { keyword: '전문성이 느껴져요', count: 6 },
  ],
  guestbook: [
    { id: 'oyrg1', linkId: 'yoonjisoo', authorName: '윤지수', message: '콘텐츠 하나하나에 감성과 기획이 다 담겨있어요.', date: '2주 전' },
  ],
  contactChannels: [
    { id: 'email', label: '이메일', value: 'yerim@creator.io', href: 'mailto:yerim@creator.io', enabled: true },
    { id: 'kakao', label: '카카오', value: 'yerim_creates', enabled: true },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'public' as const, vibe: 'public' as const, network: 'private' as const },
}

// ─── 정원호 ───────────────────────────────────────────────────────────────────
// 엣지케이스: WHO + VIBE 모두 비공개, 네트워크만 공개
export const JUNGWONHO_PROFILE = {
  linkId: 'jungwonho',
  name: '정원호',
  title: '의료 AI 스타트업 대표',
  headline: '의사 출신 창업자 · 의료 AI',
  school: '서울대학교 의학과',
  bio: '의료 현장의 문제를 AI로 해결하는 스타트업을 운영하고 있어요. 의사 출신 창업자예요.',
  avatarColor: '#3D7A8A', avatarImage: undefined, profileImages: [] as string[],
  whoIAm: { mbti: 'ENTJ' },
  instagramConnected: false,
  linkedinConnected: true,
  rememberHighlight: {
    total: 364,
    industries: [
      { name: '의료/바이오', ratio: 40, count: 146 },
      { name: '스타트업', ratio: 28, count: 102 },
      { name: 'AI/테크', ratio: 20, count: 73 },
      { name: '투자', ratio: 12, count: 44 },
    ],
    topIndustryRanks: [
      { name: '교수/전문의', ratio: 38 },
      { name: '전공의/일반의', ratio: 32 },
      { name: '연구원', ratio: 20 },
      { name: '기타', ratio: 10 },
    ],
    topIndustryRoles: [
      { name: '임상/진료', ratio: 45 },
      { name: '연구/개발', ratio: 30 },
      { name: '의료경영', ratio: 15 },
      { name: '기타', ratio: 10 },
    ],
  },
  life: {
    daily: { exercise: [{ label: '테니스' }] },
    tastes: {
      movies: [],
      music: [],
      books: [{ label: '호모 데우스', sublabel: '유발 하라리' }],
      plays: [],
      restaurants: [],
      cafes: [],
    },
  },
  manualHighlights: [
    { id: 'jwh0', categoryId: 'career-role', icon: 'briefcase', title: 'MedAI (메드에이아이)', subtitle: '경력 · 재직 중', description: '영상의학과 AI 진단 보조 솔루션을 개발하는 스타트업 창업. 병원 EMR 연동 및 FDA 인증을 준비 중이에요.', year: '2022 - 현재', metadata: { status: '재직 중', role: '대표' } },
    { id: 'jwh1', categoryId: 'career-role', icon: 'briefcase', title: '서울아산병원', subtitle: '경력 · 종료', description: '영상의학과 전공의 과정 이수 후 전문의 취득.', year: '2016 - 2022', metadata: { status: '종료', role: '영상의학과 전문의' } },
    { id: 'jwh2', categoryId: 'education-history', icon: 'book-open', title: '서울대학교', subtitle: '학력 · 졸업', description: '의학과 졸업.', year: '2009 - 2016', metadata: { status: '졸업', degree: '박사', schoolType: '대학원' } },
  ] as Highlight[],
  kemi: null,
  experiences: [
    { id: 'jwhe1', authorName: null, isAnonymous: true, keywords: ['전문성이 느껴져요', '믿고 맡길 수 있어요'], message: '의료와 기술을 모두 이해하는 드문 분이에요.', date: '5일 전' },
  ],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [
    { keyword: '전문성이 느껴져요', count: 22 },
    { keyword: '믿고 맡길 수 있어요', count: 14 },
    { keyword: '대화하면 생각이 넓어져요', count: 9 },
  ],
  guestbook: [
    { id: 'jwhg1', linkId: 'choisunyoung', authorName: '최선영', message: '의료 도메인 전문성과 스타트업 마인드를 동시에 갖춘 분이에요.', date: '1개월 전' },
  ],
  contactChannels: [
    { id: 'email', label: '이메일', value: 'wonho@medai.kr', href: 'mailto:wonho@medai.kr', enabled: true },
    { id: 'kakao', label: '카카오', value: '', enabled: false },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'private' as const, vibe: 'private' as const, network: 'public' as const },
}

// ─── 백현진 ───────────────────────────────────────────────────────────────────
// 엣지케이스: isPaidUser(PRO), LinkedIn 연결, 전탭 공개, 풀 프로필
export const BAEKHYUNJIN_PROFILE = {
  linkId: 'baekhyunjin',
  name: '백현진',
  title: '전략 컨설턴트 · McKinsey',
  headline: 'Strategy · Digital Transformation · Manufacturing',
  school: '서울대학교 경제학',
  bio: '전략 컨설팅과 디지털 트랜스포메이션을 전문으로 해요. 제조·금융·유통 분야 프로젝트 경험이 많아요.',
  avatarColor: '#2C3E6B', avatarImage: undefined, profileImages: [] as string[],
  isPaidUser: true,
  whoIAm: { mbti: 'ESTJ' },
  instagramConnected: false,
  linkedinConnected: true,
  rememberHighlight: {
    total: 872,
    industries: [
      { name: '컨설팅', ratio: 35, count: 305 },
      { name: '금융/투자', ratio: 28, count: 244 },
      { name: '대기업/제조', ratio: 22, count: 192 },
      { name: '스타트업', ratio: 15, count: 131 },
    ],
    topIndustryRanks: [
      { name: '파트너/디렉터', ratio: 40 },
      { name: '매니저', ratio: 35 },
      { name: '컨설턴트/어소시에이트', ratio: 20 },
      { name: '애널리스트', ratio: 5 },
    ],
    topIndustryRoles: [
      { name: '전략 컨설팅', ratio: 50 },
      { name: '디지털/테크', ratio: 28 },
      { name: '운영/프로세스', ratio: 22 },
    ],
  },
  life: {
    daily: { exercise: [{ label: '골프' }, { label: '수영' }] },
    tastes: {
      movies: [{ label: '쇼생크 탈출', sublabel: '프랭크 다라본트' }],
      music: [{ label: 'Miles Davis', sublabel: 'Kind of Blue', previewUrl: '' }],
      books: [{ label: 'Good Strategy Bad Strategy', sublabel: '리처드 루멜트' }, { label: '총·균·쇠', sublabel: '재레드 다이아몬드' }, { label: 'The Innovator\'s Dilemma', sublabel: '클레이턴 크리스텐슨' }],
      plays: [],
      restaurants: [{ label: '정식당', sublabel: '서울 강남' }, { label: '나카', sublabel: '서울 청담' }],
      cafes: [{ label: 'Onyx Coffee Lab', sublabel: '서울 강남' }],
    },
  },
  manualHighlights: [
    { id: 'bhj0', categoryId: 'career-role', icon: 'briefcase', title: 'McKinsey & Company', subtitle: '경력 · 재직 중', description: '전략 및 디지털 트랜스포메이션 컨설팅. 제조·금융·유통 분야 클라이언트 대상 대형 프로젝트 리드.', year: '2016 - 현재', metadata: { status: '재직 중', role: 'Engagement Manager' } },
    { id: 'bhj1', categoryId: 'education-history', icon: 'book-open', title: '서울대학교', subtitle: '학력 · 졸업', description: '경제학과 졸업. 계량경제·금융경제 전공.', year: '2010 - 2014', metadata: { status: '졸업', degree: '학사', schoolType: '대학교' } },
    { id: 'bhj2', categoryId: 'education-history', icon: 'book-open', title: 'Harvard Business School', subtitle: '학력 · 졸업', description: 'MBA 졸업. 전략·운영 전공.', year: '2014 - 2016', verified: true, metadata: { status: '졸업', degree: '석사', schoolType: '대학원' } },
    { id: 'bhj3', categoryId: 'talk', icon: 'mic', title: 'TEDxSeoul 2024 연사', subtitle: '강연/발표 · 직접 입력', description: '디지털 전환 시대의 전략 프레임워크에 대해 발표했습니다.', year: '2024', metadata: {} },
    { id: 'bhj4', categoryId: 'award', icon: 'trophy', title: 'Global Strategy Award 2023', subtitle: '수상 / 표창 · 직접 입력', description: 'APAC 최우수 전략 컨설팅 프로젝트 선정', year: '2023', metadata: {} },
  ] as Highlight[],
  kemi: {
    matchCount: 4,
    matchItems: [
      { label: '골프', category: 'taste' },
      { label: '뉴욕', category: 'place' },
      { label: 'Miles Davis', category: 'taste' },
      { label: '전략/비즈니스', category: 'identity' },
    ],
    aiCopy: '골프와 재즈를 즐기는 전략 컨설턴트예요. 비즈니스 전략이나 책 이야기로 대화를 시작해보세요.',
    completenessPercent: 100,
    lockedBlocks: [],
    missingItems: [],
  },
  experiences: [
    { id: 'bhje1', authorName: '최선영', isAnonymous: false, keywords: ['전문성이 느껴져요', '대화하면 생각이 넓어져요', '믿고 맡길 수 있어요'], message: '전략적 사고가 정말 날카롭고 실행력도 뛰어난 분이에요.', date: '1주 전' },
    { id: 'bhje2', authorName: null, isAnonymous: true, keywords: ['믿고 맡길 수 있어요'], message: '복잡한 문제를 단순명쾌하게 정리해주는 분입니다.', date: '2주 전' },
  ],
  savedProfiles: [], recentProfiles: [], receivedRequests: [],
  reputationKeywords: [
    { keyword: '전문성이 느껴져요', count: 31 },
    { keyword: '대화하면 생각이 넓어져요', count: 22 },
    { keyword: '믿고 맡길 수 있어요', count: 18 },
    { keyword: '일 처리가 빠르고 깔끔해요', count: 11 },
    { keyword: '아이디어가 늘 신선해요', count: 7 },
  ],
  guestbook: [
    { id: 'bhjg1', linkId: 'choisunyoung', authorName: '최선영', message: '전략 프레임워크를 이렇게 명확하게 구사하는 분은 처음이에요.', date: '2주 전' },
    { id: 'bhjg2', linkId: 'leejunhyuk', authorName: '이준혁', message: '디지털 트랜스포메이션 방향에 대한 인사이트가 정말 날카로웠어요.', date: '1개월 전' },
  ],
  contactChannels: [
    { id: 'email', label: '이메일', value: 'hyunjin.baek@mckinsey.com', href: 'mailto:hyunjin.baek@mckinsey.com', enabled: true },
    { id: 'kakao', label: '카카오', value: '', enabled: false },
    { id: 'phone', label: '전화', value: '', enabled: false },
  ] as ContactChannel[],
  tabVisibility: { who: 'public' as const, vibe: 'public' as const, network: 'public' as const },
}

// TODO(real API): Replace this mock selector with a profile lookup against the public profile endpoint.
export function getPublicProfileByUsername(username: string) {
  if (username === 'jiminlee') return JIMIN_PROFILE
  if (username === 'mk') return MK_PROFILE
  if (username === 'parksojin') return PARKSOJIN_PROFILE
  if (username === 'leejunhyuk') return LEEJUNHYUK_PROFILE
  if (username === 'choisunyoung') return CHOISUNYOUNG_PROFILE
  if (username === 'yoonjisoo') return YOONJISOO_PROFILE
  if (username === 'kwonminseok') return KWONMINSEOK_PROFILE
  if (username === 'limjiyeon') return LIMJIYEON_PROFILE
  if (username === 'hansanghoon') return HANSANGHOON_PROFILE
  if (username === 'ohyerim') return OHYERIM_PROFILE
  if (username === 'jungwonho') return JUNGWONHO_PROFILE
  if (username === 'baekhyunjin') return BAEKHYUNJIN_PROFILE
  return SAMPLE_PROFILE
}

// TODO(real API): Replace this with avatar URLs returned by the profile/media service.
export function getProfileAvatar(linkId: string) {
  if (linkId === 'jiminlee') return '/images/jimin-profile-5x4.jpg'
  if (linkId === 'mk') return '/images/MK_img.jpeg'
  return ''
}
