// [임시] 미가입자 가상 프로필 목업 — 실제 구현 시 크롤링 + GPT 서머라이저 결과물로 교체

export type VirtualHighlightIcon = 'trophy' | 'briefcase' | 'mic' | 'file-text' | 'book-open'

export type VirtualHighlight = {
  id: string
  icon: VirtualHighlightIcon
  label: string
  sublabel?: string
  year?: string
  linkUrl?: string
  sourceLabel?: string
}

export type VirtualProfile = {
  id: string
  name: string
  title: string
  tags: string[]
  avatarInitials: string
  avatarColor: string
  heroTheme: {
    cover: string
    avatar: string
  }
  bio?: string
  highlights: VirtualHighlight[]
  kemiPreviewCount: number
  sourceLabel: string
  snsSources?: { label: string; url: string }[]
}

export const VIRTUAL_KIM_YOUNGSEOK: VirtualProfile = {
  id: 'kim-youngseok-bonanza',
  name: '김영석',
  title: '보난자팩토리 대표이사',
  tags: ['가상자산', '블록체인', '핀테크'],
  avatarInitials: '김영',
  avatarColor: '#2D4A8A',
  heroTheme: {
    cover: 'from-[#1A2F6E] via-[#111827] to-[#0D0D0D]',
    avatar: 'from-[#2D4A8A] to-[#1A2F6E]',
  },
  bio: '가상자산 업계에서 활동하는 기업인. 보난자팩토리 대표이사로 재직 중이며, 블록체인 생태계 발전에 기여해왔다.',
  highlights: [
    {
      id: 'vkh1',
      icon: 'trophy',
      label: '2024 블록체인 어워드 수상',
      sublabel: '가상자산 산업 발전 기여 부문',
      year: '2024',
    },
    {
      id: 'vkh2',
      icon: 'briefcase',
      label: '전) 코인원 사업개발팀',
      sublabel: '가상자산 거래소 사업 개발',
      year: '2020 - 2022',
    },
    {
      id: 'vkh3',
      icon: 'mic',
      label: 'KBW 2023 연사',
      sublabel: 'Korea Blockchain Week · 메인 컨퍼런스',
      year: '2023',
    },
    {
      id: 'vkh4',
      icon: 'file-text',
      label: '가상자산, 전통 금융 시장에 새 문법 제시',
      sublabel: '인터뷰 기사',
      year: '2022',
      linkUrl: 'https://zdnet.co.kr/view/?no=20221018103937',
      sourceLabel: 'ZDNet Korea',
    },
  ],
  kemiPreviewCount: 3,
  sourceLabel: '뉴스 · 인터뷰 기반 공개 정보',
}

export const VIRTUAL_KIM_YOUNGSEOK_VC: VirtualProfile = {
  id: 'kim-youngseok-sparklabs',
  name: '김영석',
  title: 'VC 심사역 · 스파크랩',
  tags: ['스타트업', '투자', 'VC'],
  avatarInitials: '김영',
  avatarColor: '#3D6B5E',
  heroTheme: {
    cover: 'from-[#1E4035] via-[#111F1A] to-[#0D0D0D]',
    avatar: 'from-[#3D6B5E] to-[#1E4035]',
  },
  highlights: [
    {
      id: 'vkvc1',
      icon: 'briefcase',
      label: 'VC 심사역 · 스파크랩',
      sublabel: '초기 스타트업 투자 심사',
      year: '2021 - 현재',
    },
    {
      id: 'vkvc2',
      icon: 'briefcase',
      label: '전) 카카오벤처스 투자팀',
      sublabel: 'Series A · B 투자 심사',
      year: '2018 - 2021',
    },
    {
      id: 'vkvc3',
      icon: 'book-open',
      label: '서울대학교 경영학',
      sublabel: '경영학과 학사',
      year: '2016',
    },
  ],
  kemiPreviewCount: 2,
  sourceLabel: '뉴스 · LinkedIn 기반 공개 정보',
}

export const VIRTUAL_KIM_YOUNGSEOK_WRITER: VirtualProfile = {
  id: 'kim-youngseok-writer',
  name: '김영석',
  title: '소설가 · 에세이스트',
  tags: ['문학', '에세이', '창작'],
  avatarInitials: '김영',
  avatarColor: '#7A4A3A',
  heroTheme: {
    cover: 'from-[#4A2A1E] via-[#1A1210] to-[#0D0D0D]',
    avatar: 'from-[#7A4A3A] to-[#4A2A1E]',
  },
  highlights: [
    {
      id: 'vkw1',
      icon: 'book-open',
      label: '장편소설 『우리가 헤어지는 계절』 출간',
      sublabel: '민음사 · 2023 올해의 책 선정',
      year: '2023',
    },
    {
      id: 'vkw2',
      icon: 'trophy',
      label: '한국문학상 중편 부문 수상',
      sublabel: '2022 한국문학상',
      year: '2022',
    },
    {
      id: 'vkw3',
      icon: 'mic',
      label: '서울국제도서전 초청 강연',
      sublabel: '창작 프로세스와 문학의 사회적 역할',
      year: '2023',
    },
  ],
  kemiPreviewCount: 2,
  sourceLabel: '출판사 · 문학상 공개 정보',
}

export const ALL_VIRTUAL_PROFILES = [
  VIRTUAL_KIM_YOUNGSEOK,
  VIRTUAL_KIM_YOUNGSEOK_VC,
  VIRTUAL_KIM_YOUNGSEOK_WRITER,
]

export function getVirtualProfileById(id: string): VirtualProfile | null {
  return ALL_VIRTUAL_PROFILES.find((p) => p.id === id) ?? null
}
