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

export type OnboardingStep =
  | 'login'
  | 'verify'
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

export interface ProfileHeaderMeta {
  residence: string
  mood: string
  availability: string
}

export interface PublicProfileWhoIAm {
  mbti: string
  bloodType: string
  sajuType: string
  aiStyleSummary: string[]
  relationshipStatus: string
  children: string
  religion: string
}

export interface LifeMediaItem {
  label: string
  sublabel?: string
  // TODO(real API): posterUrl from TMDB (movies/books), Spotify (music), Kakao Maps / Google Places (restaurants/cafes)
  posterUrl?: string
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
}

export interface PublicProfileLife {
  daily: {
    exercise: string[]
    pet: string
    petName?: string
    petImage?: string
  }
  tastes: {
    movies: LifeMediaItem[]
    music: LifeMediaItem[]
    books: LifeMediaItem[]
    plays?: LifeMediaItem[]
    games: string[]
    sports: string[]
    teams?: string[]
    celebrities: string[]
    diet: string
    restaurants: LifeMediaItem[]
    cafes: LifeMediaItem[]
  }
  places: {
    neighborhoods: string[]
    travelDestinations: string[]
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
  headerMeta?: ProfileHeaderMeta
  whoIAm?: PublicProfileWhoIAm
  sajuProfile?: SajuProfileInput
  life?: PublicProfileLife
  selectedKeywords: string[]
  avatarColor?: string
  avatarImage?: string
  instagramConnected: boolean
  linkedinConnected: boolean
  instagram?: InstagramProfile
  linkedin?: LinkedInProfile
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
  reputationKeywords?: ReputationKeyword[]
  guestbook?: GuestbookEntry[]
  kemi?: KemiData
}

export interface SajuProfileInput {
  birthDate: string
  birthTime: string
  birthPlace: string
  calendarType: 'solar' | 'lunar'
  isBirthTimeUnknown?: boolean
  showAge?: boolean
}

export interface UserState {
  name: string
  linkId: string
  title: string
  headline?: string
  school: string
  bio: string
  headerMeta?: ProfileHeaderMeta
  selectedKeywords: string[]
  avatarColor?: string
  avatarImage?: string
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
  sajuProfile?: SajuProfileInput
  contactChannels?: ContactChannel[]
}
