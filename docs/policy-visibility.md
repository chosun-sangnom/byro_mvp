# 공개 프로필 공개 범위 정책

## 1. 탭 공개 설정 (나 / 라이프 / 관계)

### 공개 범위 레벨

| 레벨 | 값 | 대상 |
|------|----|------|
| 전체공개 | `public` | 누구나 (비로그인 포함) |
| 아카이브에 저장한 사람만 | `archived` | 로그인 상태이며 해당 프로필을 자신의 아카이브에 저장한 사용자 |
| 비공개 | `private` | 본인(오너)만 |

> **제거된 레벨**: ~~`connected` (연결된 사람만)~~ — 연결(Connection) 기능 제거로 삭제.  
> **제거된 레벨**: ~~친구공개~~ — 기획 단계에서 제거.

프로필 카드(이름·직함·사진)는 공개 범위 설정과 무관하게 **항상 전체공개**된다.

---

## 2. 탭별 공개 범위 정책

### 2-1. 방문자 유형별 접근 규칙

| 방문자 상태 | `public` 탭 | `archived` 탭 | `private` 탭 |
|-------------|------------|----------------|-------------|
| 비로그인 | 전체 공개 | 탭 표시 + 내용 잠금 (로그인 유도) | 탭 숨김 |
| 로그인 (미저장) | 전체 공개 | 탭 표시 + 내용 잠금 (저장 유도) | 탭 숨김 |
| 로그인 + 아카이브에 저장함 | 전체 공개 | 전체 공개 | 탭 숨김 |
| 본인 (오너) | 전체 공개 | 전체 공개 | 전체 공개 |

### 2-2. 탭 잠금 처리 방식

`archived` 탭은 **탭을 숨기지 않는다.** 탭바에 자물쇠 아이콘과 함께 표시되며, 클릭 시 콘텐츠 영역에 안내 화면을 노출한다.

- **비로그인 방문자**: "로그인이 필요해요" 안내 + 로그인 버튼
- **로그인 후 미저장 방문자**: "아카이브에 저장한 사람만 볼 수 있어요" 안내

### 2-3. 소급 적용

공개 범위 변경 시 **즉시 적용**된다. 기존에 열람 가능했던 방문자도 변경 즉시 차단된다.

### 2-4. 변경 알림

공개 범위 변경 시 기존에 열람 가능했던 방문자에게 **알림을 발송하지 않는다.**

---

## 3. 케미 존 공개 정책

- **비로그인 차단**: 케미는 로그인한 사용자만 볼 수 있음. 비로그인 방문자에게는 케미 존 자체가 표시되지 않음. 탭 공개 범위와 별도로 독립 적용.
- **케미 공유 알림**: 케미 결과를 외부(카카오톡 등)로 공유해도 프로필 주인에게 알림이 가지 않음.
- **케미 비활성화**: 프로필 주인이 케미 기능을 끄는 옵션을 제공하지 않음. 케미는 항상 활성 상태.

---

## 4. 비로그인 방문자 CTA

비로그인 방문자가 프로필을 방문했을 때 하단 CTA는 **"로그인하고 저장하기"** 버튼으로 표시하며, 로그인 페이지로 이동시킨다.

---

## 5. 구현 위치

| 항목 | 파일 |
|------|------|
| 공개 범위 타입 | `types/index.ts` — `TabVisibilityLevel` (`'public' \| 'archived' \| 'private'`), `TabVisibility` |
| 탭 접근권 계산 | `components/screens/profile/publicProfileData.ts` — `computeTabAccess()` |
| 탭바 잠금 아이콘 | `components/screens/profile/PublicProfileTabBar.tsx` |
| 탭 콘텐츠 잠금 화면 | `components/screens/profile/PublicProfileTabPages.tsx` — `LockedTabContent` |
| 비로그인 CTA | `components/screens/profile/PublicProfileShell.tsx` |
| 공개 범위 설정 UI | `components/screens/me/support-screens/VisibilitySettingScreen.tsx` |
| 목업 기본값 | `lib/mocks/publicProfiles.ts` — 각 프로필의 `tabVisibility` 필드 |

### 목업 프로필 공개 범위 기본값

| 프로필 | 나 | 라이프 | 관계 |
|--------|-----|--------|------|
| 강민준 (gangminjun) | public | archived | public |
| 강명구 (mk) | public | public | archived |
| 이지민 (jiminlee) | public | public | public |
