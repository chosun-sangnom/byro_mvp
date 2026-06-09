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

export function getVirtualProfileById(id: string): VirtualProfile | null {
  if (id === 'kim-youngseok-bonanza') return VIRTUAL_KIM_YOUNGSEOK
  return null
}
