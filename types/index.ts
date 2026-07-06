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
  | 'talk'
  | 'collab'
  | 'publish'
  | 'article-interview'
  | 'education'
  | 'award'
  | 'patent'
  | 'license'
  | 'volunteer'
  | 'other'

export type OnboardingStep = 'login' | 'terms' | 'verify' | 'basicinfo' | 'profile' | 'complete'

export interface Highlight {
  id: string
  categoryId: HighlightCategoryId
  icon: HighlightIconId
  title: string
  subtitle: string
  description: string
  year: string
  verified?: boolean
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
  personality?: string
}

export interface LifeMediaItem {
  label: string
  sublabel?: string
  // TODO(real API): posterUrl from TMDB (movies), 알라딘 API (books, 무료 5000건/일), Spotify (music), Kakao Maps / Google Places (restaurants/cafes)
  posterUrl?: string
  // TODO(real API): Spotify 30s preview URL
  previewUrl?: string
}

export interface KemiMatchItem {
  label: string
  category: 'taste' | 'place' | 'lifestyle' | 'identity'
}

export interface KemiLockedBlock {
  index: number          // 블록 인덱스 (1~5)
  missingItems: string[] // 이 블록을 열기 위해 필요한 항목들
}

export interface KemiData {
  matchCount: number
  matchItems: KemiMatchItem[]
  // TODO(AI): Replace aiCopy with LLM-generated conversation starter based on full profile match context
  aiCopy: string
  // [임시] 목업 전용. 실제 구현 시 viewer 프로필 완성도 기반으로 서버에서 계산
  completenessPercent: number
  lockedBlocks: KemiLockedBlock[]  // 블록별 잠금 이유
  // 완성도 바 하단 힌트용 전체 부족 항목 (lockedBlocks에서 파생 가능하지만 편의상 유지)
  missingItems: string[]
}

export interface PublicProfileLife {
  daily: {
    exercise: LifeMediaItem[]
    pet?: string
    petName?: string
    petImage?: string
  }
  tastes: {
    movies: LifeMediaItem[]
    music: LifeMediaItem[]
    books: LifeMediaItem[]
    plays?: LifeMediaItem[]
    restaurants: LifeMediaItem[]
    cafes: LifeMediaItem[]
  }
  albumPhotos?: string[]
}

export interface RememberIndustry {
  name: string
  ratio: number
  count?: number
}

export interface RememberInsight {
  recentMeetings: number
  recentMonths: number
  topIndustryName: string
  topIndustryPercent: number
  growthIndustryName: string
  growthFrom: number
  growthTo: number
  growthPeriodLabel: string
}

export interface RememberHighlight {
  total: number
  industries: RememberIndustry[]
  topIndustryRanks?: RememberIndustry[]
  topIndustryRoles?: RememberIndustry[]
  insight?: RememberInsight
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
  rememberHighlight: RememberHighlight
  heroTheme?: HeroTheme
  contactChannels?: ContactChannel[]
  manualHighlights: Highlight[]
  experiences: Experience[]
  savedProfiles: SavedProfile[]
  recentProfiles: RecentProfile[]
  receivedRequests: ReceivedRequest[]
  reputationKeywords?: ReputationKeyword[]
  guestbook?: GuestbookEntry[]
  kemi?: KemiData
  tabVisibility?: TabVisibility
  isPaidUser?: boolean
}

export type TabVisibilityLevel = 'public' | 'private'

export interface TabVisibility {
  who: TabVisibilityLevel
  vibe: TabVisibilityLevel
  network: TabVisibilityLevel
}

export interface UserState {
  name: string
  realName?: string
  activityName?: string
  activityNameChangedAt?: string
  linkId: string
  randomLinkId?: string
  customLinkId?: string
  isPaidUser?: boolean
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
  networkDomain?: string
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
