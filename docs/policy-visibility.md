# 공개 프로필 공개 범위 정책

## 1. 탭 공개 설정 (WHO / VIBE / NETWORK)

### 공개 범위 레벨

| 레벨 | 값 | 대상 |
|------|----|------|
| 전체공개 | `public` | 누구나 (비로그인 포함) |
| 비공개 | `private` | 본인(오너)만 |

프로필 카드(이름·직함·사진) 등 히어로 영역은 공개 범위 설정과 무관하게 **항상 전체공개**된다.

---

## 2. 탭별 공개 범위 정책

### 2-1. 방문자 유형별 접근 규칙

| 방문자 상태 | `public` 탭 | `private` 탭 |
|-------------|------------|-------------|
| 본인 (오너) | 열람 가능 | 열람 가능 |
| 그 외 전원 (비로그인 · 로그인 · 저장 여부 무관) | 열람 가능 | 탭 표시 + 잠금 화면 |

로그인 여부와 아카이브 저장 여부는 **접근 판정에 영향을 주지 않는다.** (`computeTabAccess()`는 오너 여부와 탭 레벨만 판단)

### 2-2. 탭 잠금 처리 방식

`private` 탭은 **탭을 숨기지 않는다.** 탭바에 자물쇠 아이콘과 함께 표시되며, 클릭 시 콘텐츠 영역에 잠금 화면을 노출한다.

- 잠금 화면 문구: "비공개 콘텐츠예요 — 프로필 주인이 이 섹션을 비공개로 설정했어요."

### 2-3. 소급 적용

공개 범위 변경 시 **즉시 적용**된다. 기존에 열람 가능했던 방문자도 변경 즉시 차단된다.

### 2-4. 변경 알림

공개 범위 변경 시 기존에 열람 가능했던 방문자에게 **알림을 발송하지 않는다.**

---

## 3. 케미 존 공개 정책

- **비로그인**: 케미 존은 표시되되 내용은 blur 처리 + "로그인하면 케미가 보여요" 넛지 노출. 탭 공개 범위와 별도로 독립 적용.
- **오너 본인**: 방문자 케미 대신 "내 케미 리포트" 진입 카드 표시.
- **케미 공유 알림**: 케미 결과를 외부(카카오톡 등)로 공유해도 프로필 주인에게 알림이 가지 않음.
- **케미 비활성화**: 프로필 주인이 케미 기능을 끄는 옵션을 제공하지 않음. 케미는 항상 활성 상태.

---

## 4. 비로그인 방문자 액션

- 저장(북마크) 버튼은 로그인 방문자에게만 노출된다.
- 피드백 요청 등 로그인 필요 액션 탭 시 로그인 모달(`LoginModal`)을 표시한다.
- 경험 남기기는 비로그인도 가능하며 익명으로 처리된다.

---

## 5. 구현 위치

| 항목 | 파일 |
|------|------|
| 공개 범위 타입 | `types/index.ts` — `TabVisibilityLevel` (`'public' \| 'private'`), `TabVisibility` (`{ who, vibe, network }`) |
| 탭 접근권 계산 | `components/screens/profile/publicProfileData.ts` — `computeTabAccess()` |
| 탭바 잠금 아이콘 | `components/screens/profile/PublicProfileTabBar.tsx` |
| 탭 콘텐츠 잠금 화면 | `components/screens/profile/PublicProfileTabPages.tsx` — `LockedTabContent` |
| 로그인 모달 | `components/screens/profile/LoginModal.tsx` |
| 공개 범위 설정 UI | `components/screens/me/support-screens/VisibilitySettingScreen.tsx` |
| 목업 기본값 | `lib/mocks/publicProfiles.ts` — 각 프로필의 `tabVisibility` 필드 |

### 목업 프로필 공개 범위 기본값

| 프로필 | who | vibe | network |
|--------|-----|------|---------|
| 강민준 (gangminjun) | public | private | public |
| 강명구 (mk) | public | public | private |
| 이지민 (jiminlee) | public | public | public |
