# DB 스키마 & TypeScript 타입

## DB 스키마 (Supabase PostgreSQL)

마이그레이션 파일: `supabase/migrations/0001_initial_schema.sql`
프로젝트: `ymkhswpdsylnrdchytja` (Supabase, Oceania-Sydney 리전)

### 테이블 구조

#### `users`

프로필의 핵심 데이터. `id`는 Supabase Auth의 `auth.uid()`와 동일.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | = auth.uid() |
| `link_id` | text UNIQUE | @username |
| `name` | text | |
| `title` | text | 직함 |
| `headline` | text | 한 줄 소개 |
| `school` | text | |
| `bio` | text | 자기소개 |
| `bio_mode` | text | `'ai' \| 'manual'` |
| `birth_date` | text | YYYY-MM-DD |
| `birth_time` | text | HH:MM |
| `birth_place` | text | |
| `calendar_type` | text | `'solar' \| 'lunar'` |
| `show_age` | boolean | |
| `avatar_url` | text | |
| `profile_images` | jsonb | string[] |
| `header_meta` | jsonb | `{ residence, mood, availability }` |
| `who_i_am` | jsonb | `PublicProfileWhoIAm` |
| `life` | jsonb | `PublicProfileLife` |
| `contact_channels` | jsonb | `ContactChannel[]` |
| `tab_visibility` | jsonb | `{ who, life, reputation }` |
| `instagram_connected` | boolean | |
| `linkedin_connected` | boolean | |
| `youtube_connected` | boolean | |
| `tiktok_connected` | boolean | |
| `instagram` | jsonb | `InstagramProfile` |
| `linkedin` | jsonb | `LinkedInProfile` |
| `youtube` | jsonb | `{ channelName, channelUrl }` |
| `tiktok` | jsonb | `{ username, profileUrl }` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-update trigger |

#### `highlights`

사용자의 수동 하이라이트 목록. 카테고리별로 is_primary로 대표 지정.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | |
| `user_id` | uuid FK → users | |
| `category_id` | text | `HighlightCategoryId` 참조 |
| `icon` | text | lucide 아이콘 이름 |
| `title` | text | |
| `subtitle` | text | |
| `description` | text | |
| `year` | text | |
| `sort_order` | integer | |
| `is_primary` | boolean | 카테고리 내 대표 여부 |

#### `connections`

두 사용자 간 연결 요청 및 상태.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | |
| `from_user_id` | uuid FK → users | 요청 보낸 사람 |
| `to_user_id` | uuid FK → users | 요청 받은 사람 |
| `status` | text | `'pending' \| 'accepted' \| 'rejected'` |
| `message` | text | 연결 요청 메시지 |
| UNIQUE | (from_user_id, to_user_id) | 중복 요청 방지 |

#### `experiences`

경험 남기기 데이터. 비회원도 제출 가능하므로 `target_link_id`는 text.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | |
| `target_link_id` | text | 대상 프로필의 link_id |
| `author_user_id` | uuid FK → users (nullable) | 비회원이면 null |
| `author_name` | text (nullable) | 익명이면 null |
| `is_anonymous` | boolean | |
| `keywords` | text[] | 최대 3개 |
| `message` | text | |
| `created_at` | timestamptz | 24h rate limit 체크에 활용 |

### RLS 정책 요약

| 테이블 | 읽기 | 쓰기 |
|--------|------|------|
| users | 전체 공개 | 본인만 |
| highlights | tab_visibility.who 설정 따름 (public/connected/private) | 본인만 |
| connections | 당사자만 | 요청자 생성, 당사자 수정 |
| experiences | tab_visibility.reputation 설정 따름 (public/connected/private) | 로그인 유저는 항상 / 비회원은 reputation=public인 프로필만 |

---

## TypeScript 핵심 타입 (`types/index.ts`)

### 도메인 모델

```typescript
// 공개 프로필 (목업 + 정규화 데이터)
interface PublicProfile {
  linkId: string
  name: string
  title: string
  bio: string
  birthDate?: string
  birthTime?: string
  birthPlace?: string
  calendarType?: 'solar' | 'lunar'
  showAge?: boolean
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
  manualHighlights: Highlight[]
  // ... 카리어/법인/항공/리멤버 하이라이트
  // ... 경험/방명록/평판키워드
  // ... SNS 연동
  // ... 연결/저장 목록
}

// 로그인 사용자 편집 상태
interface UserState {
  name: string; linkId: string; title: string; school: string; bio: string
  birthDate?: string; birthTime?: string; birthPlace?: string
  calendarType?: 'solar' | 'lunar'; showAge?: boolean
  whoIAm?: PublicProfileWhoIAm; life?: PublicProfileLife
  contactChannels?: ContactChannel[]
  tabVisibility?: TabVisibility
  avatarColor?: string; avatarImage?: string; profileImages?: string[]
  headerMeta?: ProfileHeaderMeta
}
```

### 중요 타입들

```typescript
type OnboardingStep = 'login' | 'verify' | 'linkid' | 'profile' | 'complete'

type TabVisibilityLevel = 'public' | 'connected' | 'private'
interface TabVisibility { who: TabVisibilityLevel; life: TabVisibilityLevel; reputation: TabVisibilityLevel }

interface Highlight {
  id: string; categoryId: HighlightCategoryId; icon: string
  title: string; subtitle: string; description: string; year: string
}

interface Experience {
  id: string; authorName: string | null; isAnonymous: boolean
  keywords: string[]; message: string; date: string
}

interface ConnectionRequest {
  id: string; linkId: string; name: string; title: string
  message: string; requestedAt: string
}

interface PublicProfileWhoIAm {
  mbti: string; bloodType: string; aiStyleSummary: string[]
  relationshipStatus: string; children: string; religion: string
}
```

### 하이라이트 카테고리

**그룹** (`HighlightGroupId`): `'career' | 'achievement' | 'lifestyle'`

**카테고리** (`HighlightCategoryId`):
- career: `career-role`, `education-history`, `career-continuity`, `corporate-longevity`, `talk`, `collab`, `education`
- achievement: `publish`, `article-interview`, `award`, `patent`, `license`
- lifestyle: `airline-mileage`, `volunteer`, `other`

---

## API 연동 TODO

현재 모든 데이터는 localStorage(Zustand)에서 관리. API 연동 시 교체 필요한 지점:

| 파일 | 교체 대상 | 교체 방향 |
|------|----------|----------|
| `publicProfileData.ts` | `getPublicProfileByUsername()` | `supabase.from('users').select()` |
| `useByroStore.ts` | `login()`, `completeOnboarding()` | Supabase Auth |
| `useByroStore.ts` | `submitExperience()` | `supabase.from('experiences').insert()` |
| `useByroStore.ts` | `sendConnectionRequest()` 등 | `supabase.from('connections').insert()` |
| `useByroStore.ts` | `highlights` CRUD | `supabase.from('highlights')` |
