import { HIGHLIGHT_CATEGORIES, SAMPLE_PROFILE } from '@/lib/mockData'

export type HighlightManageMode = 'list' | 'picker' | 'group' | 'form' | 'cert'
export type YearPickerTarget = 'career-start' | 'career-end' | 'education-start' | 'education-end' | 'education-year'
export type HighlightManageCategory = (typeof HIGHLIGHT_CATEGORIES)[number]

export const CERTIFICATION_ITEMS = [
  {
    categoryId: 'career-continuity',
    icon: 'briefcase',
    title: '커리어 지속성',
    summary: '본인확인 후 자동으로 재직 이력을 불러와요',
    pickerDescription: '본인확인 후 건강보험공단 기준 장기 재직 이력을 자동으로 불러와요',
    automated: true,
  },
  {
    categoryId: 'corporate-longevity',
    icon: 'building2',
    title: '법인 영속성',
    summary: '본인확인 후 법인 운영 정보를 자동으로 불러와요',
    pickerDescription: '본인확인 후 법인 운영 기간과 정상 운영 여부를 자동으로 불러와요',
    automated: true,
  },
  {
    categoryId: 'remember-network',
    icon: 'users',
    title: '리멤버 직업 네트워크',
    summary: '리멤버 명함 파일과 이메일로 직업 네트워크를 인증해요',
    pickerDescription: '리멤버 명함 파일을 메일로 보내면 직업 네트워크를 인증해요',
    automated: false,
    emailLabel: '리멤버 명함 내보내기 파일',
  },
  {
    categoryId: 'airline-mileage',
    icon: 'plane',
    title: '항공 마일리지',
    summary: '본인확인 후 항공사 등급 정보를 자동으로 불러와요',
    pickerDescription: '본인확인 후 항공사 회원 등급을 자동으로 불러와요',
    automated: true,
  },
] as const

export type CertificationItem = (typeof CERTIFICATION_ITEMS)[number]

const sampleTopRememberIndustry = [...SAMPLE_PROFILE.rememberHighlight.industries].sort((a, b) => b.ratio - a.ratio)[0]

export const VERIFIED_HIGHLIGHT_SUMMARIES: Record<string, string> = {
  'career-continuity': `평균 ${SAMPLE_PROFILE.careerHighlight.avgYears}년 재직`,
  'corporate-longevity': SAMPLE_PROFILE.corporateHighlight.summary,
  'remember-network': sampleTopRememberIndustry ? `${sampleTopRememberIndustry.name} 네트워크 다수, ${sampleTopRememberIndustry.ratio}%` : '리멤버 명함 기반 직업 네트워크',
  'airline-mileage': SAMPLE_PROFILE.airlineHighlight.tierSummary,
}

export interface HighlightCategoryCardEntry {
  kind: 'manual' | 'verified'
  category: HighlightManageCategory
  title: string
  meta: string
  countLabel: string
}

export interface HighlightCategoryCardGroup {
  id: string
  label: string
  items: HighlightCategoryCardEntry[]
}
