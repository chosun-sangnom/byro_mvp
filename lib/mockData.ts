// Compatibility exports for existing imports.
// TODO: Migrate callers to `@/lib/mocks/*` directly once the mock layer is removed.

export { AI_BIO_CANDIDATES } from './mocks/bioCandidates'
export { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from './mocks/highlights'
export { EXPERIENCE_KEYWORDS, KEYWORD_GROUPS } from './mocks/keywords'
export {
  getProfileAvatar,
  getPublicProfileByUsername,
  JIMIN_PROFILE,
  MK_PROFILE,
  SAMPLE_PROFILE,
} from './mocks/publicProfiles'
export { INSTAGRAM_PROFILE, LINKEDIN_PROFILE, MK_LINKEDIN_PROFILE } from './mocks/socialProfiles'
