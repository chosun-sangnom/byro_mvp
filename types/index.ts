export type HighlightIconId =
  | 'briefcase'
  | 'users'
  | 'building2'
  | 'plane'
  | 'mic'
  | 'handshake'
  | 'trophy'
  | 'book-open'
  | 'globe'
  | 'pencil'
  | 'badge-check'

export type HighlightGroupId = 'career' | 'achievement' | 'lifestyle'

export type HighlightCategoryId =
  | 'career-continuity'
  | 'remember-network'
  | 'corporate-longevity'
  | 'talk'
  | 'collab'
  | 'publish'
  | 'education'
  | 'award'
  | 'patent'
  | 'license'
  | 'airline-mileage'
  | 'volunteer'
  | 'other'

export type OnboardingStep =
  | 'login'
  | 'verify'
  | 'basic-info'
  | 'linkid'
  | 'keywords'
  | 'sns'
  | 'contact'
  | 'highlight'
  | 'bio-select'
  | 'bio-ai'
  | 'complete'

export interface Highlight {
  id: string
  categoryId: HighlightCategoryId
  icon: HighlightIconId
  title: string
  subtitle: string
  description: string
  year: string
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

export interface PublicProfile {
  linkId: string
  name: string
  title: string
  headline?: string
  school: string
  bio: string
  selectedKeywords: string[]
  avatarColor?: string
  avatarImage?: string
  instagramConnected: boolean
  linkedinConnected: boolean
  careerHighlight: { avgYears: number; vsIndustryPercent: number }
  rememberHighlight: {
    total: number
    industries: { name: string; ratio: number }[]
  }
  heroTheme?: {
    cover: string
    avatar: string
  }
  contactChannels?: ContactChannel[]
  manualHighlights: Highlight[]
  experiences: Experience[]
  savedProfiles: SavedProfile[]
  recentProfiles: RecentProfile[]
  receivedRequests: ReceivedRequest[]
}

export interface UserState {
  name: string
  linkId: string
  title: string
  school: string
  bio: string
  selectedKeywords: string[]
  avatarColor?: string
  avatarImage?: string
  contactChannels?: ContactChannel[]
}
