import type { ComponentType } from 'react'
import {
  Award,
  Boxes,
  Briefcase,
  Building2,
  CreditCard,
  Crown,
  FileText,
  Globe2,
  Lightbulb,
  Link as LinkIcon,
  Link2,
  Megaphone,
  Rocket,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'

type HomeIcon = ComponentType<{ className?: string }>

export const problems: Array<{
  icon: HomeIcon
  title: string
  description: string
}> = [
  {
    icon: CreditCard,
    title: '명함은 너무 얕습니다',
    description: '이름, 직함, 회사는 보여주지만 어떤 사람인지 전달되지 않습니다.',
  },
  {
    icon: Building2,
    title: 'SNS는 비즈니스 맥락에 맞지 않습니다',
    description: '개인적인 콘텐츠와 섞여있고, 첫인상을 만들기엔 정리되지 않았습니다.',
  },
  {
    icon: Sparkles,
    title: '신뢰와 평판은 흩어져 있습니다',
    description: '경험, 관계, 인상, 활동 이력이 한 곳에 정리되어 있지 않습니다.',
  },
]

export const solutionSteps: Array<{
  icon: HomeIcon
  title: string
  items: string[]
}> = [
  {
    icon: Link2,
    title: '연결하기',
    items: ['SNS 연결', '라이프 입력', '하이라이트 추가'],
  },
  {
    icon: Sparkles,
    title: '정리하기',
    items: ['AI가 자기소개 초안 생성', '프로필을 더 명확한 정체성으로 구조화'],
  },
  {
    icon: TrendingUp,
    title: '쌓이기',
    items: ['평판 키워드 누적', '방명록/피드백 축적', '관계 속 신뢰 자산이 계속 쌓임'],
  },
]

export const highlightCards: Array<{
  icon: HomeIcon
  label: string
  value: string
  gradient: string
}> = [
  {
    icon: Briefcase,
    label: '커리어 지속성',
    value: '평균 대비 128% 장기 재직',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    label: '리멤버 네트워크',
    value: '스타트업 중심 인맥 구조',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Award,
    label: '강연 / 협업 경험',
    value: 'TEDx Seoul 발표',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: FileText,
    label: '특허 / 출판',
    value: '등록 특허 보유',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Globe2,
    label: '글로벌 활동',
    value: '최근 3년간 국제 활동 이력 다수',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Crown,
    label: '프리미엄 멤버십',
    value: '상위 등급 멤버십 보유',
    gradient: 'from-amber-500 to-yellow-500',
  },
]

export const comparisons: Array<{
  icon: HomeIcon
  name: string
  color: string
  isHighlight?: boolean
  features: Array<{ text: string; available: boolean }>
}> = [
  {
    icon: CreditCard,
    name: '전통 명함',
    color: 'from-gray-400 to-gray-500',
    features: [
      { text: '이름, 직함, 연락처', available: true },
      { text: '신뢰 검증', available: false },
      { text: '평판 정보', available: false },
      { text: '오프라인 활용', available: true },
    ],
  },
  {
    icon: Building2,
    name: 'SNS 프로필',
    color: 'from-blue-600 to-blue-700',
    features: [
      { text: '정제된 정보', available: false },
      { text: '신뢰 검증', available: false },
      { text: '평판 정보', available: true },
      { text: '오프라인 활용', available: false },
    ],
  },
  {
    icon: Sparkles,
    name: 'Byro',
    color: 'from-indigo-600 to-purple-600',
    isHighlight: true,
    features: [
      { text: '정제된 정보', available: true },
      { text: '신뢰 검증', available: true },
      { text: '평판 정보', available: true },
      { text: '오프라인 활용', available: true },
    ],
  },
]

export const uiElements: Array<{
  icon: HomeIcon
  title: string
  description: string
}> = [
  {
    icon: User,
    title: '프로필 헤더',
    description: '간결하고 인상적인 첫인상',
  },
  {
    icon: Lightbulb,
    title: 'AI 자기소개',
    description: '핵심만 담은 명확한 소개',
  },
  {
    icon: Star,
    title: '검증 하이라이트',
    description: '신뢰를 만드는 증거들',
  },
  {
    icon: LinkIcon,
    title: 'SNS 연결',
    description: '모든 채널을 한 곳에',
  },
]

export const reputationKeywords = [
  '믿고 맡길 수 있어요',
  '대화하면 생각이 넓어져요',
  '전문성이 느껴져요',
  '주변에 소개하고 싶어요',
  '일 처리가 빠르고 깔끔해요',
  '유머 감각이 좋아요',
  '스타일이 세련됐어요',
  '트렌드에 밝아요',
]

export const testimonials = [
  {
    text: '함께 프로젝트를 진행하면서 정말 많이 배웠어요. 체계적이고 빠른 분이에요',
    author: '박지민',
    role: 'Product Designer',
  },
  {
    text: '비즈니스 감각이 뛰어나고 신뢰할 수 있는 파트너입니다',
    author: '최민수',
    role: 'Startup Founder',
  },
]

export const targetUsers: Array<{ icon: HomeIcon; label: string }> = [
  { icon: Rocket, label: '창업가' },
  { icon: Boxes, label: '프로덕트 매니저' },
  { icon: Megaphone, label: '마케터' },
  { icon: TrendingUp, label: '투자자' },
  { icon: Users, label: '사업개발' },
  { icon: Settings, label: '운영 리더' },
]
