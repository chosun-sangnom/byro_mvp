# 데이터 파이프라인 & 공통점 감지

## 1. 프로필 데이터 파이프라인

API 연동 전까지 모든 프로필은 목업 → 스토어 → UI 방향으로 흐른다.

```
lib/mocks/publicProfiles.ts
  └─ getPublicProfileByUsername(username): PublicProfile
      └─ buildEditableOwnerProfile(username, baseProfile, user?)
          │  (로그인 유저가 본인 프로필 볼 때 store.user 필드로 덮어씀)
          └─ rawProfile: PublicProfile
              └─ getNormalizedPublicProfile({ username, user?, ownerHighlights? })
                  │  (fallback 채우기 + age 계산 + highlights 병합)
                  └─ NormalizedPublicProfile
                      └─ UI 컴포넌트
```

### buildEditableOwnerProfile

`user.linkId === username`이면 owner로 판단하고 아래 필드를 스토어 값으로 덮어씀:

- 기본 정보: `name`, `title`, `headline`, `school`, `bio`, `headerMeta`
- 이미지: `avatarColor`, `avatarImage`, `profileImages`
- 신원: `whoIAm`, `birthDate`, `birthTime`, `birthPlace`, `calendarType`, `showAge`
- 라이프: `life`
- 연락: `contactChannels`

### getNormalizedPublicProfile

다음을 추가로 처리:

| 처리 | 설명 |
|------|------|
| `manualHighlights` | owner이고 `ownerHighlights` 전달 시 스토어 하이라이트 사용 |
| `age` | `birthDate`로부터 만 나이 계산 |
| `instagram` | fallback username/profileUrl/aiSummary/posts 채움 |
| `linkedin` | fallback profileUrl/previewImage 채움 |
| `heroTheme` | 없으면 그라디언트 fallback |
| `contactChannels` | 없으면 빈 배열 |
| `corporateHighlight` | 없으면 더미 법인 데이터 |
| `airlineHighlight` | 없으면 기본 항공 데이터 |
| `reputationKeywords` | 없으면 빈 배열 |
| `guestbook` | 없으면 빈 배열 |

---

## 2. 하이라이트 CRUD 흐름

```
최초 로그인 (login() 또는 completeOnboarding())
  └─ highlightsInitialized가 false면
      └─ store.highlights = SAMPLE_PROFILE.manualHighlights (시드)
          └─ highlightsInitialized: true

이후 편집 (HighlightManageScreen)
  ├─ store.addHighlight(h)
  ├─ store.updateHighlight(id, h)
  └─ store.removeHighlight(id)

프로필 표시 시
  └─ getNormalizedPublicProfile({ ownerHighlights: store.highlights })
      └─ store.highlights가 비어있지 않으면 목업 대신 스토어 하이라이트 사용
```

**편집 가능 여부 판단** (`MyByroHighlightManageScreen`):
```typescript
const allManualHighlights = store.highlightsInitialized
  ? store.highlights
  : [...SAMPLE_PROFILE.manualHighlights, ...store.highlights]
const editableHighlightIds = new Set(allManualHighlights.map(h => h.id))
```

---

## 3. 공통점 감지 (케미 알고리즘)

두 프로필 간 공통 관심사를 항목별로 비교해 `KemiData`를 생성한다.

### 비교 대상 데이터

| 카테고리 | 필드 | 비고 |
|----------|------|------|
| **정체성** | MBTI, 혈액형, 종교, 자녀 유무 | `whoIAm` |
| **취향** | 영화, 음악, 책, 운동, 카페, 음식점, 스포츠팀 | `life.tastes` |
| **장소** | 동네, 여행지 | `life.places` |
| **라이프스타일** | 운동 종류, 반려동물, 식단 | `life.daily` |

### 매칭 로직 (`getSignalChips`, `getLifestyleSignals`)

```typescript
// profileAnalysis.ts
export function getSignalChips(whoIAm, life?) {
  return [
    whoIAm.mbti,
    life?.places.neighborhoods[0],
    life?.daily.exercise[0]?.label,
    life?.tastes.music[0]?.label,
    life?.tastes.cafes[0]?.label,
  ].filter(Boolean)
}

export function getLifestyleSignals(life?) {
  return {
    activity: life?.daily.exercise[0]?.label ?? life?.tastes.sports[0],
    culture:  life?.tastes.movies[0]?.label ?? life?.tastes.music[0]?.label,
    place:    life?.tastes.cafes[0]?.label  ?? life?.places.neighborhoods[0],
    neighborhood: life?.places.neighborhoods[0],
    exercise: life?.daily.exercise[0]?.label,
    tasteHook: getTasteHook(life),
  }
}
```

### KemiData 타입

```typescript
interface KemiData {
  matchCount: number           // 일치 항목 수
  matchItems: KemiMatchItem[]  // 일치 항목 목록
  aiCopy: string               // AI 생성 대화 시작 문구 (현재 목업)
}

interface KemiMatchItem {
  label: string
  category: 'taste' | 'place' | 'lifestyle' | 'identity'
}
```

> **TODO**: 현재 `kemi` 값은 목업에 하드코딩. 실제 구현 시 두 프로필의 `life`/`whoIAm` 필드를 서버에서 비교해 생성.

---

## 4. 평판(Reputation) 데이터 흐름

```
경험 제출 (ExperienceBottomSheet)
  └─ store.submitExperience(profileLinkId, { keywords, message, authorName, isAnonymous })
      └─ submittedExperiences[profileLinkId]에 추가

프로필 평판 탭 표시
  └─ submittedExps = store.submittedExperiences[profile.linkId] ?? []
      └─ allExperiences = [...submittedExps, ...profile.experiences]
          └─ ProfileExperienceSection에 렌더링
```

**키워드 카운트 집계** (상위 5개만 표시):
```typescript
const keywordCounts = [...profile.reputationKeywords]
  .sort((a, b) => b.count - a.count)
  .slice(0, 5)
```

> **TODO**: API 연동 후 `submittedExperiences`의 키워드도 `reputationKeywords` 카운트에 반영 필요.

---

## 5. 스토어 persist 구성

```typescript
persist(store, {
  name: 'byro-store',
  version: 16,
  migrate: (persistedState) => { /* 버전 마이그레이션 */ },
  partialize: (state) => ({
    // 저장됨: 로그인 상태, 유저 정보, 하이라이트, 경험 등
    // 저장 안 됨: kemiComputedProfiles (매 세션 재계산)
    // 삭제됨: sentRequestLinkIds, connectionRequests, connectedProfiles (연결 기능 제거)
  }),
})
```
