# 어드민 ↔ 프론트 데이터 매핑

백오피스(`app/admin`) 목업 데이터(`lib/mocks/adminMocks.ts`, `types/admin.ts`)와 프론트 앱 데이터(`types/index.ts`, `useByroStore`, `docs/schema.md`)의 관계 정리. 어드민 타입은 프론트 타입을 재사용하지 않고 **완전히 별도로 설계**되어 있으며, 두 데이터는 `linkId` 문자열 값으로만 서로 참조된다(FK 아님, 목업이라 값만 맞춰둠).

## 결론 (연동 시 필요 작업 요약)

| 어드민 도메인 | 프론트/DB에 이미 존재 | 신규 테이블 필요 | 비고 |
|------|:---:|:---:|------|
| 회원관리 (`AdminUserRow`) | 부분 (`users`) | - | `isPaidUser`/`sanctionStatus`/`reportCount`는 파생값, 원본 없음 |
| 제재 이력 (`SanctionRecord`) | ✗ | ✓ `sanctions` | |
| 피드백 신고 (`FeedbackReport`) | 부분 (`experiences`) | ✓ `feedback_reports` | 신고 원본(`message`)은 `experiences`, 신고 자체는 신규 |
| 프로필 신고 (`ProfileReport`) | ✗ | ✓ `profile_reports` | |
| 인증 심사 (`VerificationItem`) | 부분 (`highlights.verified`) | ✓ `verification_requests` | 심사 큐/서류는 신규, 승인 결과만 기존 컬럼에 반영 |
| CS 티켓 (`CsTicket`, `FaqItem`) | ✗ | ✓ `cs_tickets`, `faqs` | |
| 결제/구독 (`Subscription`, `PaymentRecord`, `ManualPlanGrant`) | ✗ | ✓ `subscriptions`, `payments`, `plan_grants` | `users.is_paid_user` 파생 필드는 이 테이블들의 집계 |
| 분석 (`InflowChannelStat`, `FunnelStep`, `RetentionCohort`) | ✗ | ✓ 이벤트 로그 (`EVENT_SPECS` 참고) | 별도 analytics 파이프라인(GA4/Amplitude 등) 필요, RDB 테이블 아닐 수 있음 |
| AI 설정 (`AiPersonaConfig` 등 5종) | ✗ | ✓ `admin_ai_config` (1행 or key-value) | 특정 유저와 무관한 전역 설정값 |
| 운영자/가입승인/감사로그 (`AdminOperator`, `AdminJoinRequest`, `AuditLogEntry`) | ✗ | ✓ `admin_operators`, `admin_join_requests`, `admin_audit_log` | 어드민 전용, 일반 `users`와 별개 |

**핵심**: 어드민 목업의 절반 이상은 프론트 데이터의 "다른 표현"이 아니라 **프론트에 아예 없는 신규 엔티티**다. 프론트 쪽엔 신고 접수함/제재 이력/결제 내역/CS 같은 개념 자체가 없다(신고하기 액션만 있고 저장은 안 됨 — 아래 상세 참고).

---

## 도메인별 상세

### 1. 회원관리 — `AdminUserRow`

| 어드민 필드 | 프론트/DB 대응 | 상태 |
|------|------|------|
| `linkId`, `name` | `users.link_id`, `users.name` | 기존 컬럼 |
| `email` | ✗ | `users`엔 email 컬럼 없음(Supabase Auth의 `auth.users.email` 참조 필요) |
| `joinedAt` | `users.created_at` | 기존 컬럼 |
| `isPaidUser` | ✗ | `subscriptions` 활성 여부로 파생 (신규 테이블) |
| `isVerified` | `highlights.verified` 존재 여부로 파생 가능 | `PublicProfile.isVerified`와 동일 개념이나 집계 로직 없음 |
| `sanctionStatus` | ✗ | `sanctions` 최신 레코드로 파생 (신규 테이블) |
| `reportCount` | ✗ | `feedback_reports` + `profile_reports` 집계 (신규 테이블) |

### 2. 제재 — `SanctionRecord`

프론트에는 제재/정지 개념 자체가 없음 (로그인 차단 로직 미구현). 신규 `sanctions` 테이블 필요. `linkId`로 `users` 참조.

### 3. 신고 — `FeedbackReport` / `ProfileReport`

- **`FeedbackReport.feedbackMessage`**: 실제로는 `experiences.message`(피드백 원문)를 인용하는 것이어야 함. 현재 목업은 `Experience.id` 참조 없이 텍스트를 중복 저장하고 있음 — 실제 구현 시 `feedback_reports.experience_id → experiences.id` FK로 원본을 조인해서 보여줘야 함.
- 신고 사유(`FeedbackReportReason`/`ProfileReportReason`)는 앱의 실제 신고 시트(`ReputationManageScreen.tsx`, `PublicProfileHeroSection.tsx`)와 문구를 맞춰둔 상태(2026-07-29 기준 일치 확인됨).
- 프론트에는 "신고하기" 액션의 저장 로직이 없음(UI만 존재하거나 미구현) — 신고 제출 시 `feedback_reports`/`profile_reports`에 insert하는 백엔드 작업이 선행되어야 어드민 큐가 실제로 채워짐.

### 4. 인증 심사 — `VerificationItem`

- `type: '학력 인증'` → 최종 승인 시 `highlights` 테이블의 해당 row에 `verified = true` 반영 (대상 `category_id = 'education-history'`).
- `type: '가상 프로필 클레임'` → 가상 프로필(`lib/mocks/virtualProfiles.ts`, 고정 목업 3건, 실제 생성 로직 없음)을 실사용자 계정으로 전환하는 프로세스. 대응하는 DB 테이블이 없음 — 가상 프로필 자체가 `users` row가 아니므로, 클레임 승인 시 신규 `users` row 생성 + 가상 프로필 콘텐츠 이관 로직 필요.
- 심사 큐/서류(`documentLabel`, `detail`)는 신규 `verification_requests` 테이블 필요 (OCR 결과는 `types/index.ts`의 `OcrResult` 타입과 연결 가능).

### 5. CS — `CsTicket` / `FaqItem`

프론트에 문의 제출 화면·FAQ 화면이 있는지 여부와 무관하게, 현재 DB엔 대응 테이블 없음. 완전 신규.

### 6. 결제/구독 — `Subscription` / `PaymentRecord` / `ManualPlanGrant`

- 프론트 `UserState.isPaidUser`(현재 로컬 상태 플래그)가 이 세 테이블의 최종 파생값이 되어야 함.
- `PaymentRecord.hasUsedProContent`는 최근 커밋(`Change: Pro 구독 환불 정책...`)에서 정의한 청약철회 판단 기준 — "구독 전용 콘텐츠 이용 여부"를 어떤 이벤트로 판단할지(예: VIBE/NETWORK 탭 중 Pro 전용 슬롯 사용 여부) 아직 구현 로직 없음. **정책은 확정, 판단 로직은 미정.**
- PG(토스 등) 연동 자체가 없으므로 `pgTransactionId`는 실제 결제 붙기 전까진 목업 문자열.

### 7. 분석 — `InflowChannelStat` / `FunnelStep` / `RetentionCohort` / `EventSpec`

- `EVENT_SPECS`는 이벤트 발생 시점/파라미터 스펙 초안일 뿐, 실제 트래킹 코드가 어디에도 삽입되어 있지 않음.
- 이 도메인은 RDB 테이블 매핑이 아니라 **이벤트 트래킹 인프라(GA4/Amplitude/자체 로그 등) 선정 → SDK 삽입 → 집계 파이프라인** 순서로 별도 작업이 필요. 어드민 화면은 그 집계 결과를 읽기만 하는 뷰가 됨.

### 8. AI 관리 — `AiPersonaConfig` / `AiBioConfig` / `AiKemiConfig` / `AiSearchConfig` / `AiVirtualProfileConfig`

- 특정 유저 데이터가 아니라 **전역 설정값**(가중치, 프롬프트 템플릿, on/off 토글). 신규 `admin_ai_config` 성격의 테이블(또는 key-value 설정 테이블) 1종으로 5개 기능 설정을 관리 가능.
- 실제로 코드에 반영되어 동작하는 것은 `search`(AI 검색, `app/api/ai-search/route.ts`, OpenAI 연동)뿐. `promptDraft`를 어드민에서 수정해도 route.ts의 `SYSTEM_PROMPTS`엔 반영 안 됨(주석에 명시됨) — 실제 연동하려면 route.ts가 DB 설정값을 읽도록 바꿔야 함.
- `persona`/`bio`/`kemi`/`virtual`는 전부 미구현 또는 규칙 기반 — 어드민 설정 화면은 "향후 구현될 로직의 파라미터 사전 정의" 성격.

### 9. 운영자/가입승인/감사로그 — `AdminOperator` / `AdminJoinRequest` / `AuditLogEntry`

일반 `users`와 완전히 분리된 어드민 전용 계정 체계. 프론트 데이터와 무관, 신규 테이블 3종 필요.

---

## 개발자 전달용 한 줄 요약

> 어드민 목업은 프론트 데이터를 그대로 재사용하는 게 아니라, **프론트 데이터를 참조는 하되(주로 `linkId` 매칭) 실제로는 절반 이상이 아직 DB에 없는 신규 엔티티**다. 연동 순서는 (1) 위 표의 신규 테이블부터 `supabase/migrations`에 추가 → (2) 프론트 액션(신고하기, 결제 등)이 해당 테이블에 실제로 insert하도록 구현 → (3) 어드민은 그 테이블을 읽고 쓰는 CRUD로 전환, 순서로 진행하면 됨.
