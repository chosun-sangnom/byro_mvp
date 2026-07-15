# 상태 전이 (State Machines)

## 1. 온보딩 플로우

```
login → terms → verify → basicinfo → profile → complete
```

| 단계 | 컴포넌트 | 내용 |
|------|----------|------|
| `login` | `Step1Login` | Kakao / Google / Naver OAuth 버튼 |
| `terms` | `StepTermsAgreement` | 약관 동의 |
| `verify` | `Step2Verify` | 본인인증 |
| `basicinfo` | `Step2BasicInfo` | 이름·생년월일 입력 |
| `profile` | `Step4Profile` | MBTI 등 프로필 입력 |
| `complete` | `Step9Complete` | 가입 완료 |

`StepBar`는 `terms`~`profile` 구간을 4단계로 표시한다 (`total={4}`).

**전환 액션**
- `nextStep()` — 다음 단계
- `prevStep()` — 이전 단계
- `goToStep(step)` — 특정 단계 점프
- `completeOnboarding()` — `isLoggedIn: true`, `UserState` 생성, highlights 시드

**완료 후 상태**: `isLoggedIn: true`, `user: UserState`, `highlights`가 SAMPLE_PROFILE 기본값으로 초기화 (`highlightsInitialized: true`)

---

## 2. MyByro 화면 전환

**초기 화면**: URL에 `?edit=true`이면 `manage`, 아니면 `preview`

```
preview
  ├─ 탭 변경 → activeTab: 'who' | 'vibe' | 'network' 갱신
  └─ 편집 버튼 → manage

manage
  ├─ 뒤로가기 → preview
  ├─ 기본 정보 편집 → editBasic
  ├─ 나는 어떤 사람 편집 → editWhoIAm
  ├─ 하이라이트 관리 → editHighlight
  ├─ 라이프 관리 → editLife
  ├─ 네트워크 관리 → editNetwork
  ├─ 평판 관리 → editReputation
  ├─ SNS 연동 → editSNS
  ├─ 연락 수단 → editContact
  ├─ 공개 설정 → editVisibility
  └─ [임시] 목업 초기화 → store.resetToMockDefaults()

editBasic | editWhoIAm | editHighlight | editLife | editNetwork |
editReputation | editSNS | editContact | editVisibility
  └─ 뒤로가기 → manage
```

**로그아웃 흐름**: `manage` 화면 → `store.logout()` → `window.location.replace('/')`

---

## 3. 경험 남기기 (1일 1회 제한)

```
alreadySubmitted 체크
  ├─ true (24시간 이내 제출 이력 있음)
  │   └─ "오늘 이미 경험을 남겼어요" 토스트
  └─ false
      └─ ExperienceBottomSheet 열림
          ├─ 키워드 선택 (최대 3개)
          ├─ 메시지 입력 (선택)
          ├─ 익명/실명 토글
          └─ 제출
              ├─ store.submitExperience(profileLinkId, exp)
              ├─ store.markExpSubmitted(profileLinkId)  → expSubmittedAt 타임스탬프 저장
              └─ ExperienceDoneModal 표시
```

**rate limit 계산**:
```typescript
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const submittedAt = store.expSubmittedAt[profile.linkId]
const alreadySubmitted = !!submittedAt && (Date.now() - submittedAt < ONE_DAY_MS)
```

---

## 4. 케미(Kemi) 로딩 상태

케미 분석은 처음 프로필을 볼 때 1.5초 로딩 후 "계산 완료"로 캐싱.

```
프로필 진입 (PublicProfileShell)
  └─ useEffect: kemiComputedProfiles에 linkId 없으면
      └─ kemiLoading: true + 1500ms 타이머
          └─ store.markKemiComputed(linkId) → kemiComputedProfiles에 추가
              └─ kemiLoading: false, 케미 카드 표시
```

**캐시 무효화**: `updateUserWhoIAm()` 또는 `updateUserLife()` 호출 시 `kemiComputedProfiles: []` 리셋.

---

## 5. 스토어 버전 히스토리

| 버전 | 주요 변경 |
|------|----------|
| 11 | 초기 구조 |
| 12 | `expSubmittedProfiles: string[]` → `expSubmittedAt: Record<string, number>` (24h 제한) |
| 16 | 연결(Connection) 기능 제거, 아카이브 구조 단순화 |
| 19 | **현재 버전** (17~19 세부 이력은 git 히스토리 참조) |
