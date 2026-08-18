// [임시] 홈 피드 · 추천 프로필 목업 — API 연동 후 서버 추천 결과로 교체
import {
  PARKSOJIN_PROFILE, LEEJUNHYUK_PROFILE, CHOISUNYOUNG_PROFILE, YOONJISOO_PROFILE,
  KWONMINSEOK_PROFILE, LIMJIYEON_PROFILE, HANSANGHOON_PROFILE, OHYERIM_PROFILE,
  JUNGWONHO_PROFILE, BAEKHYUNJIN_PROFILE,
} from '@/lib/mocks/publicProfiles'

export type FeedProfile = {
  linkId: string | null
  name: string
  title: string
  avatarImage?: string
  fallbackColor?: string
  /** 파스텔 배경 폴백일 때만 지정 — 없으면 Avatar가 흰 텍스트로 렌더링 */
  fallbackTextColor?: string
}

const PASTEL_TEXT = '#6C7786'

function fromProfile(p: { linkId: string; name: string; title: string; avatarColor: string }): FeedProfile {
  return { linkId: p.linkId, name: p.name, title: p.title, fallbackColor: p.avatarColor }
}

export const NEW_PROFILES: FeedProfile[] = [
  { linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', avatarImage: '/images/jimin-profile-5x4.jpg' },
  { linkId: 'mk', name: '강명구', title: 'Byth CEO', avatarImage: '/images/MK_img.jpeg' },
  { linkId: null, name: '박서연', title: 'UX 디자이너', fallbackColor: '#F0F5FF', fallbackTextColor: PASTEL_TEXT },
  { linkId: null, name: '최유진', title: 'AI 연구원', fallbackColor: '#F4F2FE', fallbackTextColor: PASTEL_TEXT },
  { linkId: null, name: '한다은', title: '투자심사역', fallbackColor: '#EFF9FF', fallbackTextColor: PASTEL_TEXT },
]

// 활발하게 활동중 — 좌우 스크롤, 최대 10명
export const ACTIVE_PROFILES: FeedProfile[] = [
  { linkId: 'gangminjun', name: '강민준', title: 'Product Owner', avatarImage: '/images/mj1.jpg' },
  { linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', avatarImage: '/images/jimin-profile-5x4.jpg' },
  fromProfile(PARKSOJIN_PROFILE),
  fromProfile(CHOISUNYOUNG_PROFILE),
  fromProfile(YOONJISOO_PROFILE),
  fromProfile(KWONMINSEOK_PROFILE),
  fromProfile(LIMJIYEON_PROFILE),
  fromProfile(HANSANGHOON_PROFILE),
  fromProfile(OHYERIM_PROFILE),
  fromProfile(JUNGWONHO_PROFILE),
]

// 추천 프로필 — 홈 화면에는 앞 4명만 미리보기로 노출
export const RECOMMENDED_PREVIEW: FeedProfile[] = [
  { linkId: 'mk', name: '강명구', title: 'Byth CEO', avatarImage: '/images/MK_img.jpeg' },
  { linkId: 'gangminjun', name: '강민준', title: 'B2B SaaS Product Owner · 스타트업 공동창업자', avatarImage: '/images/mj1.jpg' },
  { linkId: null, name: '김영선', title: 'CMO · 패션 이커머스', fallbackColor: '#F0F5FF', fallbackTextColor: PASTEL_TEXT },
  { linkId: null, name: '이준혁', title: '변호사 · 스타트업 전문', fallbackColor: '#F4F2FE', fallbackTextColor: PASTEL_TEXT },
]

// 추천 프로필 전체 목록 — /recommended 무한 스크롤에서 사용
export const RECOMMENDED_ALL: FeedProfile[] = [
  ...RECOMMENDED_PREVIEW,
  { linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', avatarImage: '/images/jimin-profile-5x4.jpg' },
  fromProfile(PARKSOJIN_PROFILE),
  fromProfile(LEEJUNHYUK_PROFILE),
  fromProfile(CHOISUNYOUNG_PROFILE),
  fromProfile(YOONJISOO_PROFILE),
  fromProfile(KWONMINSEOK_PROFILE),
  fromProfile(LIMJIYEON_PROFILE),
  fromProfile(HANSANGHOON_PROFILE),
  fromProfile(OHYERIM_PROFILE),
  fromProfile(JUNGWONHO_PROFILE),
  fromProfile(BAEKHYUNJIN_PROFILE),
]
