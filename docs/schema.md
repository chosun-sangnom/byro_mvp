# DB 스키마 & TypeScript 타입

## DB 스키마 (Supabase PostgreSQL)

마이그레이션 파일: `supabase/migrations/0001_initial_schema.sql`
프로젝트: `ymkhswpdsylnrdchytja` (Supabase, Oceania-Sydney 리전)

---

### 공통 (항상 전체 공개)

#### `users`

기본 공개 정보. RLS 없이 항상 전체 공개.

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
| `contact_channels` | jsonb | `ContactChannel[]` |
| `tab_visibility` | jsonb | `{ who, life, reputation }` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-update trigger |

---

### 나(Who) 탭 — `tab_visibility.who` 기준

#### `user_who_i_am`

MBTI 등 나 자신 정보. 케미 매칭에 활용.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `user_id` | uuid PK → users | |
| `mbti` | text | |
| `updated_at` | timestamptz | auto-update trigger |

#### `highlights`

수동 하이라이트 목록. 카테고리별로 `is_primary`로 대표 지정.

**슬롯 정책**: Free 전체 3개 / Pro 100개

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
| `verified` | boolean | 인증 배지 여부 (경력·학력만 해당) |
| `link_url` | text | 기사/인터뷰만 지원 |
| `source_label` | text | 매체명 등 |

#### `user_sns`

SNS 연동 데이터.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `user_id` | uuid PK → users | |
| `instagram_connected` | boolean | |
| `linkedin_connected` | boolean | |
| `youtube_connected` | boolean | |
| `tiktok_connected` | boolean | |
| `instagram` | jsonb | `{ username, profileUrl, posts }` |
| `linkedin` | jsonb | `{ profileUrl, ... }` |
| `youtube` | jsonb | `{ channelName, channelUrl }` |
| `tiktok` | jsonb | `{ username, profileUrl }` |
| `updated_at` | timestamptz | auto-update trigger |

---

### 라이프(Life) 탭 — `tab_visibility.life` 기준

**슬롯 정책**: Free 전체 5개 / Pro 카테고리별 최대 5개 (무제한)

#### `user_life`

일상/취향/장소 데이터.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `user_id` | uuid PK → users | |
| `daily` | jsonb | `{ exercise[], pet, petName }` |
| `tastes` | jsonb | `{ movies[], music[], books[], cafes[], restaurants[] }` |
| `updated_at` | timestamptz | auto-update trigger |

---

### 평판(Reputation) 탭 — `tab_visibility.reputation` 기준

#### `experiences`

경험 남기기 데이터.

**작성 자격**:
- 평판 탭이 `public`이면 로그인 유저 누구나 + 비로그인 유저(익명 처리)
- 평판 탭이 `connected`이면 연결된 사람만 *(연결 기능 제거 후 정책 재확정 예정)*

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | |
| `target_link_id` | text | 대상 프로필의 link_id |
| `author_user_id` | uuid FK → users (nullable) | 비회원이면 null |
| `author_name` | text (nullable) | 익명이면 null |
| `is_anonymous` | boolean | |
| `keywords` | text[] | 최대 3개 |
| `message` | text | |
| `ip_address` | text | 익명 악용 방지용 저장 |
| `created_at` | timestamptz | 24h rate limit 체크에 활용 |

---

### RLS 정책 요약

| 테이블 | 읽기 | 쓰기 |
|--------|------|------|
| users | 전체 공개 | 본인만 |
| user_who_i_am | tab_visibility.who 따름 | 본인만 |
| highlights | tab_visibility.who 따름 | 본인만 |
| user_sns | tab_visibility.who 따름 | 본인만 |
| user_life | tab_visibility.life 따름 | 본인만 |
| experiences | tab_visibility.reputation 따름 | 로그인 유저는 항상 / 비회원은 reputation=public인 프로필만 |

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
  calendarType?: 'solar' | 'lunar'
  showAge?: boolean
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
  manualHighlights: Highlight[]
  experiences: Experience[]
  reputationKeywords?: ReputationKeyword[]
  guestbook?: GuestbookEntry[]
  kemi?: KemiData
  tabVisibility?: TabVisibility
  // SNS
  instagram?: InstagramProfile
  linkedin?: LinkedInProfile
  contactChannels?: ContactChannel[]
}

// 로그인 사용자 편집 상태
interface UserState {
  name: string; linkId: string; title: string; school: string; bio: string
  birthDate?: string; birthTime?: string
  calendarType?: 'solar' | 'lunar'; showAge?: boolean
  whoIAm?: PublicProfileWhoIAm; life?: PublicProfileLife
  contactChannels?: ContactChannel[]
  tabVisibility?: TabVisibility
  avatarColor?: string; avatarImage?: string; profileImages?: string[]
}
```

### 중요 타입들

```typescript
type OnboardingStep = 'login' | 'basicinfo' | 'profile' | 'complete'

type TabVisibilityLevel = 'public' | 'connected' | 'private'
interface TabVisibility { who: TabVisibilityLevel; life: TabVisibilityLevel; reputation: TabVisibilityLevel }

interface Highlight {
  id: string; categoryId: HighlightCategoryId; icon: string
  title: string; subtitle: string; description: string; year: string
  verified?: boolean; linkUrl?: string; sourceLabel?: string
}

interface Experience {
  id: string; authorName: string | null; isAnonymous: boolean
  keywords: string[]; message: string; date: string
}
```

### 하이라이트 카테고리

**그룹** (`HighlightGroupId`): `'career' | 'achievement' | 'lifestyle'`

**카테고리** (`HighlightCategoryId`):
- career: `career-role`, `education-history`, `talk`, `collab`, `education`
- achievement: `publish`, `article-interview`, `award`, `patent`, `license`
- lifestyle: `volunteer`, `other`

**제거된 카테고리** (MVP 범위 제외):
- ~~`career-continuity`~~ (커리어 지속성)
- ~~`corporate-longevity`~~ (법인 영속성)
- ~~`airline-mileage`~~ (항공 마일리지)
- ~~`remember-network`~~ → 관계 탭으로 이동

### 인증 지원 카테고리

| 카테고리 | 인증 방식 |
|----------|----------|
| `career-role` | 건강보험공단 API (카카오 본인인증 → 직장가입자 이력 조회) |
| `education-history` | OCR (졸업증명서) 또는 학교 이메일 인증 |
| 나머지 | 인증 없음, 수동 입력만 |

---

## API 연동 TODO

현재 모든 데이터는 localStorage(Zustand)에서 관리. API 연동 시 교체 필요한 지점:

| 파일 | 교체 대상 | 교체 방향 |
|------|----------|----------|
| `publicProfileData.ts` | `getPublicProfileByUsername()` | `supabase.from('users').select()` |
| `useByroStore.ts` | `login()`, `completeOnboarding()` | Supabase Auth |
| `useByroStore.ts` | `submitExperience()` | `supabase.from('experiences').insert()` |
| `useByroStore.ts` | `highlights` CRUD | `supabase.from('highlights')` |
