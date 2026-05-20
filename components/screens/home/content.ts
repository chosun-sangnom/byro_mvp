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
    icon: CreditCard,
    title: '명함만 봐선 그 사람을 모르겠어요.',
    description: '이름, 직함, 연락처. 그게 전부다. 어떤 일을 해온 사람인지, 어떤 사람인지는 여전히 모른다.',
  },
  {
    icon: Search,
    title: '처음 만난 사람을 믿기가 어려워요.',
    description: '좋은 인상을 받아도 확인할 방법이 없다. 진짜 어떤 사람인지는 시간이 지나봐야 안다.',
  },
  {
    icon: MessageCircle,
    title: '통하는 사람인지 대화 전엔 몰라요.',
    description: '취향이 같고 경험이 겹쳐도, 물어보기 전까지는 알 수 없다. 공통점은 늘 대화 이후에 발견된다.',
  },
]

export const solutionSteps: Array<{
  icon: HomeIcon
  title: string
  description: string
}> = [
  {
    icon: User,
    title: '나를 입체적으로 보여주는 한 페이지',
    description: '커리어부터 취향, 검증된 경험까지. 여기저기 흩어진 나를 하나의 링크로 정리한다.',
  },
  {
    icon: Sparkles,
    title: '상대방과 겹치는 것이 바로 드러난다',
    description: '상대의 Byro를 열면 공통점이 자동으로 표시된다. 같은 업계, 같은 취향, 같은 MBTI — 대화 소재가 먼저 보인다.',
  },
  {
    icon: MessageCircle,
    title: '경험이 쌓이면 신뢰가 생긴다',
    description: '함께 일한 사람, 대화를 나눈 사람이 남긴 평판 키워드가 프로필에 쌓인다. 말이 아닌 기록으로 증명한다.',
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
    scenario: '만나기 전에 Byro를 교환한다. 종합 궁합도 나쁘지 않고, 좋아하는 동네도 겹친다.',
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
    name: '커리어 · 소셜 플랫폼',
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
    color: 'from-[#3B82F6] to-[#2563EB]',
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
