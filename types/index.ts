export type OnboardingStep =
  | 'login'
  | 'verify'
  | 'linkid'
  | 'keywords'
  | 'sns'
  | 'highlight'
  | 'bio-select'
  | 'bio-ai'
  | 'complete'

export interface Highlight {
  id: string
  icon: string
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

export interface PublicProfile {
  linkId: string
  name: string
  title: string
  school: string
  bio: string
  selectedKeywords: string[]
  instagramConnected: boolean
  linkedinConnected: boolean
  careerHighlight: { avgYears: number; vsIndustryPercent: number }
  rememberHighlight: {
    total: number
    industries: { name: string; ratio: number }[]
  }
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
}
