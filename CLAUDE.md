# Byro — Claude Code Context

## 프로젝트 개요

비즈니스 프로필 SNS 앱. Next.js 14 App Router, 완전 프론트엔드. Vercel 배포 예정.
백엔드는 Supabase (미연동 상태 — 현재 모든 데이터는 Zustand + localStorage).

## 핵심 규칙

- **커밋 후 즉시 push** — 매 작업마다 commit & push
- **목업 디자인 보존** — 기능 구현 시 기존 목업 UI 훼손 금지
- **사주(사주팔자) 관련 코드 없음** — 생년월일/생시는 단순 날짜 필드로만 취급
- **임시 기능 주석** — dev-only 기능은 반드시 `// [임시]` 주석

## 폴더 구조

```
app/                  Next.js 라우트
components/
  screens/
    onboarding/       온보딩 4단계 플로우
    profile/          공개 프로필 (PublicProfileShell 중심)
    me/               내 바이로 (MyByro 중심)
    archive/          아카이브 (저장됨 / 최근 본)
  ui/                 공통 컴포넌트 (Button, BottomSheet, NavBar 등)
lib/
  mocks/              목업 데이터 (SAMPLE_PROFILE 등)
  supabase/           Supabase 클라이언트 (미연동)
store/
  useByroStore.ts     Zustand 전역 상태 (version 19)
types/index.ts        전체 TypeScript 타입 정의
supabase/migrations/  DB 마이그레이션 SQL
docs/                 기술 문서
```

## 자세한 문서

- [아키텍처 & 라우팅](docs/architecture.md)
- [상태 전이](docs/state-machines.md)
- [데이터 파이프라인 & 공통점 감지](docs/data-pipeline.md)
- [DB 스키마](docs/schema.md)
- [공개 범위 정책](docs/policy-visibility.md)
- [하이라이트 항목 설계](docs/policy-highlights.md)
- [평판 리뷰 정책](docs/policy-reputation.md)
- [알림 정책](docs/policy-notifications.md)
