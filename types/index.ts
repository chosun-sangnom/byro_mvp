export type HighlightIconId =
  | 'briefcase'
  | 'users'
  | 'building2'
  | 'plane'
  | 'mic'
  | 'handshake'
  | 'trophy'
  | 'book-open'
  | 'file-text'
  | 'globe'
  | 'pencil'
  | 'badge-check'

export type HighlightGroupId = 'career' | 'achievement' | 'lifestyle'

export type HighlightCategoryId =
  | 'career-role'
  | 'education-history'
  | 'career-continuity'
  | 'remember-network'
  | 'corporate-longevity'
  | 'talk'
  | 'collab'
  | 'publish'
  | 'article-interview'
  | 'education'
  | 'award'
  | 'patent'
  | 'license'
  | 'airline-mileage'
  | 'volunteer'
  | 'other'

export type OnboardingStep = 'login' | 'basicinfo' | 'profile' | 'complete'

export interface Highlight {
  id: string
  categoryId: HighlightCategoryId
  icon: HighlightIconId
  title: string
  subtitle: string
  description: string
  year: string
  metadata?: Record<string, string | boolean>
  linkUrl?: string
  thumbnailUrl?: string
  sourceLabel?: string
}

export interface Experience {
  id: string
  authorName: string | null
  isAnonymous: boolean
  keywords: string[]
  message: string
  date: string
}

export interface SavedProfile {
  id: string
  linkId: string
  name: string
  title: string
  memo: string
  savedAt: string
}

export interface RecentProfile {
  id: string
  linkId: string
  name: string
  title: string
  viewedAt: string
}

export interface ReceivedRequest {
  id: string
  linkId: string
  name: string
  message: string | null
  requestedAt: string
}

export interface ConnectionRequest {
  id: string
  linkId: string
  name: string
  title: string
  message: string | null
  requestedAt: string
}

export interface ContactChannel {
  id: 'phone' | 'email' | 'kakao'
  label: string
  value: string
  href?: string
  enabled: boolean
}

export interface InstagramPost {
  id: string
  imageUrl: string
  caption: string
  timestamp?: string
}

export interface InstagramProfile {
  username: string
  profileUrl: string
  aiSummary: string
  posts: InstagramPost[]
}

export interface LinkedInPost {
  id: string
  text: string
  likes: number
  date: string
}

export interface LinkedInProfile {
  profileUrl: string
  aiSummary: string
  previewImage?: string
  recentPosts?: LinkedInPost[]
}

export interface HeroTheme {
  cover: string
  avatar: string
}


export interface PublicProfileWhoIAm {
  mbti: string
}

export interface LifeMediaItem {
  label: string
  sublabel?: string
  // TODO(real API): posterUrl from TMDB (movies/books), Spotify (music), Kakao Maps / Google Places (restaurants/cafes)
  posterUrl?: string
  // TODO(real API): Spotify 30s preview URL
  previewUrl?: string
}

export interface KemiMatchItem {
  label: string
  category: 'taste' | 'place' | 'lifestyle' | 'identity'
}

export interface KemiData {
  matchCount: number
  matchItems: KemiMatchItem[]
  // TODO(AI): Replace aiCopy with LLM-generated conversation starter based on full profile match context
  aiCopy: string
  // [임시] 목업 전용. 실제 구현 시 viewer 프로필 완성도 기반으로 서버에서 계산
  completenessPercent: number
  lockedBlocks: number[]   // 잠긴 블록 인덱스 (1~5)
  missingTasteCount: number
}

export interface PublicProfileLife {
  daily: {
    exercise: LifeMediaItem[]
    pet: string
    petName?: string
    petImage?: string
  }
  tastes: {
    movies: LifeMediaItem[]
    music: LifeMediaItem[]
    books: LifeMediaItem[]
    plays?: LifeMediaItem[]
    teams?: LifeMediaItem[]
    restaurants: LifeMediaItem[]
    cafes: LifeMediaItem[]
  }
  places: {
    travelDestinations: LifeMediaItem[]
  }
}

export interface CareerHighlight {
  avgYears: number
  vsIndustryPercent: number
}

export interface RememberIndustry {
  name: string
  ratio: number
}

export interface RememberHighlight {
  total: number
  industries: RememberIndustry[]
}

export interface CorporateCompany {
  name: string
  startYear: number
  endYear: number | null
  years: number
  status: string
}

export interface CorporateHighlight {
  companyCount: number
  summary: string
  companies: CorporateCompany[]
  averageOperatingYears?: number
  years?: number
}

export interface AirlineMembership {
  name: string
  tier: string
}

export interface AirlineHighlight {
  tierSummary: string
  badgeLevel: string
  airlines: AirlineMembership[]
}

export interface ReputationKeyword {
  keyword: string
  count: number
}

export interface GuestbookEntry {
  id: string
  linkId: string
  authorName: string
  message: string
  date: string
}

export interface PublicProfile {
  linkId: string
  name: string
  age?: number
  title: string
  headline?: string
  school: string
  bio: string
  whoIAm?: PublicProfileWhoIAm
  birthDate?: string
  birthTime?: string
  calendarType?: 'solar' | 'lunar'
  showAge?: boolean
  life?: PublicProfileLife
  avatarColor?: string
  avatarImage?: string
  profileImages?: string[]
  instagramConnected: boolean
  linkedinConnected: boolean
  youtubeConnected?: boolean
  tiktokConnected?: boolean
  instagram?: InstagramProfile
  linkedin?: LinkedInProfile
  youtube?: { channelName: string; channelUrl: string }
  tiktok?: { username: string; profileUrl: string }
  careerHighlight: CareerHighlight
  rememberHighlight: RememberHighlight
  heroTheme?: HeroTheme
  contactChannels?: ContactChannel[]
  corporateHighlight?: CorporateHighlight
  airlineHighlight?: AirlineHighlight
  manualHighlights: Highlight[]
  experiences: Experience[]
  savedProfiles: SavedProfile[]
  recentProfiles: RecentProfile[]
  receivedRequests: ReceivedRequest[]
  connectionRequests: ConnectionRequest[]
  reputationKeywords?: ReputationKeyword[]
  guestbook?: GuestbookEntry[]
  kemi?: KemiData
}

export type TabVisibilityLevel = 'public' | 'connected' | 'private'

export interface TabVisibility {
  who: TabVisibilityLevel
  life: TabVisibilityLevel
  reputation: TabVisibilityLevel
}

export interface UserState {
  name: string
  linkId: string
  title: string
  headline?: string
  school: string
  bio: string
  avatarColor?: string
  avatarImage?: string
  profileImages?: string[]
  whoIAm?: PublicProfileWhoIAm
  birthDate?: string
  birthTime?: string
  calendarType?: 'solar' | 'lunar'
  showAge?: boolean
  life?: PublicProfileLife
  contactChannels?: ContactChannel[]
  tabVisibility?: TabVisibility
  isVerified?: boolean
}

// ── OCR 결과 타입 ──────────────────────────────────────────────────────────────
export type OcrCareer = {
  company: string
  role: string
  startYear: string
  endYear: string
  status: '재직 중' | '종료'
}

export type OcrEducation = {
  school: string
  major: string
  degree: string
  schoolType: '대학교' | '대학원' | '고등학교' | '기타'
  status: '졸업' | '재학' | '중퇴'
  startYear: string
  endYear: string
}

export type OcrResult = {
  source: 'linkedin' | 'remember' | 'unknown'
  careers: OcrCareer[]
  educations: OcrEducation[]
}
