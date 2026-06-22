# 아키텍처 & 라우팅

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 상태 관리 | Zustand + `zustand/persist` (localStorage) |
| 스타일 | Tailwind CSS + CSS 변수 (다크 테마) |
| 백엔드 | Supabase (스키마 완료, API 연동 미완) |
| 배포 | Vercel |

## 라우트 구조

```
/                          홈 (로그인/회원가입 진입)
/signup                    온보딩 (4단계)
/me                        내 바이로
  ?edit=true               → 편집 모드(manage 화면)로 진입
/[username]                공개 프로필
  /                        → 나 탭 (기본)
  /life                    → 라이프 탭
  /reputation              → 관계 탭
  /feedback                → 피드백 전체 보기
  /guestbook               → 방명록 전체 보기
/archive                   아카이브 (저장됨 / 최근 본)
```

## 핵심 화면 컴포넌트

| 컴포넌트 | 경로 | 역할 |
|----------|------|------|
| `PublicProfileShell` | `components/screens/profile/PublicProfileShell.tsx` | 공개 프로필 전체 레이아웃 (탭바 + CTA + 케미) |
| `MyByro` | `components/screens/me/MyByro.tsx` | 내 바이로 화면 분기 |
| `OnboardingScreen` | `components/screens/onboarding/OnboardingScreen.tsx` | 온보딩 오케스트레이터 |
| `Archive` | `components/screens/archive/Archive.tsx` | 아카이브 (저장됨 / 최근 본) |

## 공통 UI 컴포넌트 (`components/ui/`)

| 컴포넌트 | 용도 |
|----------|------|
| `Button` | variant: primary / outline / ghost / kakao / google / naver / danger |
| `NavBar` | 상단 내비게이션 (뒤로가기 + 타이틀 + 우측 슬롯) |
| `StepBar` | 온보딩 단계 표시 (dot 형태) |
| `BottomSheet` | 하단 드로어 (애니메이션 포함) |
| `Modal` | 중앙 다이얼로그 |
| `TextArea` | 다중 줄 입력 (maxLength 지원) |
| `CheckRow` | 체크박스 행 |
| `showToast(msg)` | 싱글턴 토스트 알림 |

## 목업 데이터

API 연동 전까지 모든 프로필 데이터는 `lib/mocks/publicProfiles.ts`의 정적 객체에서 온다.

| 목업 | linkId | 설명 |
|------|--------|------|
| `SAMPLE_PROFILE` | `gangminjun` | 로그인 시 사용되는 기본 사용자 |
| `MK_PROFILE` | `mk` | 서브 사용자 |
| `JIMINLEE_PROFILE` | `jiminlee` | 추가 테스트용 사용자 |

`getPublicProfileByUsername(username)` — username으로 목업 프로필 조회.
