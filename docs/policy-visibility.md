# 공개 프로필 공개 범위 정책

> **수정 예정**: 연결(Connection) 기능 제거에 따라 "연결된 사람만" 레벨 처리 방식이 재검토 중.  
> 현재 문서는 기존 정책 기준이며, 확정 후 갱신 예정.

## 1. 탭 공개 설정 (나 / 라이프 / 관계)

### 공개 범위 레벨

| 레벨 | 값 | 대상 |
|------|----|------|
| 전체공개 | `public` | 누구나 (비로그인 포함) |
| 연결된 사람만 | `connected` | 로그인 + 해당 프로필과 연결된 사용자 *(재검토 중)* |
| 비공개 | `private` | 본인만 |

### 방문자별 탭 접근 규칙

| 방문자 상태 | `public` 탭 | `connected` 탭 | `private` 탭 |
|-------------|------------|----------------|-------------|
| 비로그인 | 전체 공개 | 탭 표시 + 내용 잠금 (로그인 유도) | 탭 숨김 |
| 로그인 (미연결) | 전체 공개 | 탭 표시 + 내용 잠금 (연결 유도) | 탭 숨김 |
| 로그인 + 연결됨 | 전체 공개 | 전체 공개 | 탭 숨김 |
| 본인 (오너) | 전체 공개 | 전체 공개 | 전체 공개 |

- **탭 잠금 처리**: `connected`로 설정된 탭은 탭바에 자물쇠 아이콘(🔒)과 함께 표시. 클릭 시 콘텐츠 영역에 로그인/연결 요청 안내 화면 노출.
- **케미 존**: 비로그인 방문자는 케미를 볼 수 없음 (탭 공개 범위와 별도로 로그인 필수).
- **소급 적용**: 탭 공개 범위 변경 시 기존에 볼 수 있었던 방문자도 즉시 차단됨.
- **비공개 전환 알림 없음**: 프로필 비공개 전환 시 알림 발송 없음.

### 프로필 카드는 항상 전체공개

이름, 직함, 사진(Hero 영역)은 공개 범위 설정과 무관하게 항상 모든 방문자에게 공개.

---

## 2. 케미 존 공개 정책

- **비로그인 차단**: 케미는 로그인한 사용자만 볼 수 있음. 비로그인 방문자에게는 케미 존 자체가 표시되지 않음.
- **공유 시 알림 없음**: 케미 결과를 외부(카카오톡 등)로 공유해도 프로필 주인에게 알림이 가지 않음.
- **비활성화 불가**: 프로필 주인이 케미 기능을 끄는 옵션 없음. 케미는 항상 활성 상태.

---

## 3. 구현 위치

| 항목 | 파일 |
|------|------|
| 공개 범위 타입 | `types/index.ts` — `TabVisibilityLevel`, `TabVisibility` |
| 탭 접근권 계산 | `components/screens/profile/publicProfileData.ts` — `computeTabAccess()` |
| 탭바 잠금 아이콘 | `components/screens/profile/PublicProfileTabBar.tsx` |
| 탭 콘텐츠 잠금 화면 | `components/screens/profile/PublicProfileTabPages.tsx` — `LockedTabContent` |
| 비로그인 CTA | `components/screens/profile/PublicProfileShell.tsx` — "로그인하고 연결하기" |
| 공개 범위 설정 UI | `components/screens/me/support-screens/VisibilitySettingScreen.tsx` |
| 목업 기본값 | `lib/mocks/publicProfiles.ts` — 각 프로필의 `tabVisibility` 필드 |

### 목업 프로필 공개 범위 기본값

| 프로필 | 나 | 라이프 | 관계 |
|--------|-----|--------|------|
| 강민준 (gangminjun) | public | connected | public |
| 강명구 (mk) | public | public | connected |
| 이지민 (jiminlee) | public | public | public |
