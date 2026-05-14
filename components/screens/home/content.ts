import type { ComponentType } from 'react'
import {
  Briefcase,
  Building2,
  CreditCard,
  Heart,
  MessageCircle,
  Rocket,
  Search,
  Sparkles,
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
    icon: MessageCircle,
    title: '스몰토크가 생각보다 어렵습니다',
    description: '처음 만난 사람과 대화를 이어가는 건 쉽지 않다. 어색한 침묵, 형식적인 질문들.',
  },
  {
    icon: CreditCard,
    title: '명함엔 이름과 직함뿐입니다',
    description: '명함엔 연락처만, SNS엔 콘텐츠만 있다. 그 사람 자체를 알 수 있는 정보가 없다.',
  },
  {
    icon: Search,
    title: '공통점을 찾기까지 시간이 걸립니다',
    description: '사실 겹치는 게 있어도 대화하기 전엔 알 수 없다. 공통점을 발견하기까지 한참이 걸린다.',
  },
]

export const solutionSteps: Array<{
  icon: HomeIcon
  title: string
  description: string
}> = [
  {
    icon: User,
    title: '나를 설명하는 정보를 한 프로필에',
    description: '커리어, 라이프스타일, 검증된 하이라이트, 평판 키워드까지. 흩어져 있던 정보를 하나의 링크로.',
  },
  {
    icon: Sparkles,
    title: 'Kemi Glow — 공통점이 즉시 보인다',
    description: '상대방의 Byro를 열면, 나와 겹치는 항목이 시각적으로 강조된다. 같은 대학, 같은 동네, 같은 MBTI를 한눈에.',
  },
  {
    icon: MessageCircle,
    title: 'Kemi Report — 맥락 기반 해석을 제공한다',
    description: '단순 공통점 나열이 아니라, 전체 맥락을 묶어 해석해준다. 미팅 전에 리포트를 보고 들어가면 첫 마디부터 다르다.',
  },
]

export const useCases: Array<{
  icon: HomeIcon
  title: string
  scenario: string
  highlight: string
}> = [
  {
    icon: Users,
    title: '네트워킹 행사',
    scenario: '행사 끝나고 명함 다섯 장을 받았다. 다음날 Byro 링크를 하나씩 열어본다. 세 명은 겹치는 게 별로 없다.',
    highlight: '한 명은 같은 고향, 같은 업종, 취향도 비슷하다. 그 사람한테만 카톡을 보낸다. 어색하지 않다.',
  },
  {
    icon: Briefcase,
    title: '비즈니스 미팅',
    scenario: '처음 만나는 잠재 파트너와 미팅이 잡혔다. 미팅 전날 상대 Byro를 확인한다. 전 직장이 겹치고, 관심사도 비슷하다.',
    highlight: '"혹시 카카오 계셨던 거 맞죠?" — 본론 들어가기 전에 이미 분위기가 풀렸다.',
  },
  {
    icon: Heart,
    title: '소개팅',
    scenario: '만나기 전에 Byro를 교환한다. 사주 궁합도 나쁘지 않고, 좋아하는 동네도 겹친다.',
    highlight: '어색한 첫 질문을 건너뛰고 바로 공통점 얘기부터 시작할 수 있다.',
  },
]

export const comparisons: Array<{
  icon: HomeIcon
  name: string
  color: string
  isHighlight?: boolean
  description: string
  missing?: string
  highlight?: string
}> = [
  {
    icon: Building2,
    name: 'LinkedIn / SNS',
    color: 'from-blue-500 to-blue-600',
    description: '커리어나 콘텐츠는 있지만',
    missing: '라이프스타일, 성향, 공통점은 알 수 없다',
  },
  {
    icon: CreditCard,
    name: '명함 앱',
    color: 'from-gray-400 to-gray-500',
    description: '이름, 직함, 연락처만 있다',
    missing: '저장하고 끝 — 관계로 이어지는 맥락이 없다',
  },
  {
    icon: Sparkles,
    name: 'Byro',
    color: 'from-[#3DD6B2] to-[#1DC8A0]',
    isHighlight: true,
    description: '커리어 + 라이프스타일 + 검증된 평판',
    highlight: '만나는 순간 공통점이 보이고, 대화의 재료가 생긴다',
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

export const targetUsers: Array<{ icon: HomeIcon; label: string; description: string }> = [
  { icon: Users, label: '네트워킹을 자주 하는 사람', description: '행사 후 관계를 이어가고 싶은 사람' },
  { icon: Briefcase, label: '비즈니스 미팅이 잦은 사람', description: '첫인상이 결과에 영향을 미치는 사람' },
  { icon: Rocket, label: '창업가 · 프리랜서', description: '나를 설명해야 하는 상황이 많은 사람' },
  { icon: Heart, label: '새로운 인연을 만드는 사람', description: '소개팅, 동호회, 커뮤니티 활동' },
]
