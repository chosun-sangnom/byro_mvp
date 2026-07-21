// 백오피스 목업 데이터. 실제 Supabase 연동 전까지 사용하는 고정 시드 데이터.
// linkId/name은 lib/mocks/publicProfiles.ts 의 회원과 맞춰 두어 회원관리↔신고↔인증 화면이 서로 참조 가능하게 함.
import type {
  AdminOperator,
  AdminUserRow,
  AiBioConfig,
  AiKemiConfig,
  AiPersonaConfig,
  AiSearchConfig,
  AiVirtualProfileConfig,
  AuditLogEntry,
  CsTicket,
  EventSpec,
  FaqItem,
  FeedbackReport,
  FunnelStep,
  InflowChannelStat,
  ManualPlanGrant,
  PaymentRecord,
  RetentionCohort,
  SanctionRecord,
  Subscription,
  VerificationItem,
} from '@/types/admin'

export const ADMIN_OPERATORS: AdminOperator[] = [
  { id: 'op-1', name: '김도윤', role: 'viewer', email: 'doyoon.kim@byro.io' },
  { id: 'op-2', name: '이서연', role: 'operator', email: 'seoyeon.lee@byro.io' },
  { id: 'op-3', name: '박관리', role: 'admin', email: 'admin@byro.io' },
]

export const MOCK_USER_ROWS: AdminUserRow[] = [
  { linkId: 'gangminjun', name: '강민준', email: 'gangminjun@byro.io', joinedAt: '2026-01-08', isPaidUser: false, isVerified: true, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'mk', name: '강명구', email: 'mk@byro.io', joinedAt: '2025-11-22', isPaidUser: true, isVerified: true, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'jiminlee', name: '이지민', email: 'jiminlee@byro.io', joinedAt: '2026-02-14', isPaidUser: false, isVerified: false, sanctionStatus: '정상', reportCount: 1 },
  { linkId: 'parksojin', name: '박소진', email: 'parksojin@byro.io', joinedAt: '2025-09-30', isPaidUser: true, isVerified: true, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'leejunhyuk', name: '이준혁', email: 'leejunhyuk@byro.io', joinedAt: '2026-03-02', isPaidUser: false, isVerified: false, sanctionStatus: '경고', reportCount: 2 },
  { linkId: 'choisunyoung', name: '최선영', email: 'choisunyoung@byro.io', joinedAt: '2025-12-19', isPaidUser: true, isVerified: true, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'yoonjisoo', name: '윤지수', email: 'yoonjisoo@byro.io', joinedAt: '2026-04-05', isPaidUser: false, isVerified: false, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'kwonminseok', name: '권민석', email: 'kwonminseok@byro.io', joinedAt: '2026-01-27', isPaidUser: false, isVerified: true, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'limjiyeon', name: '임지연', email: 'limjiyeon@byro.io', joinedAt: '2025-10-11', isPaidUser: false, isVerified: false, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'hansanghoon', name: '한상훈', email: 'hansanghoon@byro.io', joinedAt: '2026-05-19', isPaidUser: true, isVerified: false, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'ohyerim', name: '오예림', email: 'ohyerim@byro.io', joinedAt: '2026-06-01', isPaidUser: false, isVerified: false, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'jungwonho', name: '정원호', email: 'jungwonho@byro.io', joinedAt: '2025-08-14', isPaidUser: true, isVerified: true, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'baekhyunjin', name: '백현진', email: 'baekhyunjin@byro.io', joinedAt: '2025-07-02', isPaidUser: true, isVerified: true, sanctionStatus: '정상', reportCount: 0 },
  { linkId: 'sohnminho', name: '손민호', email: 'sohnminho@byro.io', joinedAt: '2026-06-28', isPaidUser: false, isVerified: false, sanctionStatus: '일시정지', reportCount: 4 },
  { linkId: 'honggildong', name: '홍길동', email: 'honggildong@byro.io', joinedAt: '2026-07-15', isPaidUser: false, isVerified: false, sanctionStatus: '정상', reportCount: 0 },
]

export const MOCK_SANCTION_HISTORY: SanctionRecord[] = [
  { id: 'sc-1', linkId: 'leejunhyuk', status: '경고', reason: '피드백 신고 인용 1회 (명예훼손/모욕)', actor: '이서연', createdAt: '2026-06-02' },
  { id: 'sc-2', linkId: 'leejunhyuk', status: '경고', reason: '피드백 신고 인용 2회 (스팸/광고)', actor: '이서연', createdAt: '2026-07-10' },
  {
    id: 'sc-3',
    linkId: 'sohnminho',
    status: '일시정지',
    reason: '반복 신고 인용 누적 4회, 자동 산정',
    actor: '시스템',
    createdAt: '2026-07-16',
    suspendUntil: '2026-08-15',
  },
]

export const MOCK_REPORTS: FeedbackReport[] = [
  {
    id: 'rp-1',
    targetLinkId: 'gangminjun',
    targetOwnerName: '강민준',
    feedbackMessage: '이 사람 실제로는 전혀 다르게 행동함. 믿지 마세요.',
    feedbackAuthorName: null,
    isAnonymous: true,
    reason: '명예훼손/모욕',
    reportedAt: '2026-07-18 14:22',
    status: 'pending',
    ipMasked: '121.***.***.44',
  },
  {
    id: 'rp-2',
    targetLinkId: 'mk',
    targetOwnerName: '강명구',
    feedbackMessage: '카톡으로 투자 상담 받으실 분 010-****-****로 연락주세요.',
    feedbackAuthorName: '이준혁',
    feedbackAuthorLinkId: 'leejunhyuk',
    isAnonymous: false,
    reason: '스팸/광고',
    reportedAt: '2026-07-17 09:05',
    status: 'pending',
    ipMasked: '210.***.***.117',
  },
  {
    id: 'rp-3',
    targetLinkId: 'parksojin',
    targetOwnerName: '박소진',
    feedbackMessage: '본명이랑 다니는 회사 여기 다 적어놓을게요: OOO...',
    feedbackAuthorName: null,
    isAnonymous: true,
    reason: '개인정보 노출',
    reportedAt: '2026-07-15 21:40',
    status: 'pending',
    ipMasked: '58.***.***.9',
  },
  {
    id: 'rp-4',
    targetLinkId: 'leejunhyuk',
    targetOwnerName: '이준혁',
    feedbackMessage: '거래 사기 조심하세요 진짜',
    feedbackAuthorName: '윤지수',
    feedbackAuthorLinkId: 'yoonjisoo',
    isAnonymous: false,
    reason: '명예훼손/모욕',
    reportedAt: '2026-07-10 11:02',
    status: 'resolved',
    verdict: '인용',
    resolvedBy: '이서연',
    resolvedAt: '2026-07-10 15:40',
    ipMasked: '112.***.***.201',
  },
  {
    id: 'rp-5',
    targetLinkId: 'choisunyoung',
    targetOwnerName: '최선영',
    feedbackMessage: '이 분과 미팅했는데 정말 인사이트가 좋았어요.',
    feedbackAuthorName: '백현진',
    feedbackAuthorLinkId: 'baekhyunjin',
    isAnonymous: false,
    reason: '기타',
    reportedAt: '2026-07-05 08:12',
    status: 'resolved',
    verdict: '기각',
    resolvedBy: '박관리',
    resolvedAt: '2026-07-05 10:00',
    ipMasked: '175.***.***.63',
  },
]

export const MOCK_VERIFICATIONS: VerificationItem[] = [
  {
    id: 'vf-1',
    type: '학력 인증',
    linkId: 'yoonjisoo',
    applicantName: '윤지수',
    submittedAt: '2026-07-19 10:30',
    status: 'pending',
    documentLabel: '졸업증명서.pdf',
    detail: 'OCR 파싱 실패 — 학교명/전공 필드 인식 오류',
  },
  {
    id: 'vf-2',
    type: '학력 인증',
    linkId: 'hansanghoon',
    applicantName: '한상훈',
    submittedAt: '2026-07-18 16:02',
    status: 'pending',
    documentLabel: '재학증명서.jpg',
    detail: 'OCR 파싱 실패 — 저해상도 이미지',
  },
  {
    id: 'vf-3',
    type: '가상 프로필 클레임',
    linkId: 'honggildong',
    applicantName: '홍길동',
    submittedAt: '2026-07-17 13:10',
    status: 'pending',
    documentLabel: '본인확인_신분증.pdf',
    detail: '본인 소유 프로필 클레임 요청 — 지인이 대신 생성한 가상 프로필',
  },
  {
    id: 'vf-4',
    type: '학력 인증',
    linkId: 'ohyerim',
    applicantName: '오예림',
    submittedAt: '2026-07-08 09:44',
    status: 'approved',
    documentLabel: '졸업증명서.pdf',
    detail: 'OCR 파싱 실패 — 발급일자 인식 오류',
    reviewedBy: '이서연',
    reviewedAt: '2026-07-08 14:20',
  },
  {
    id: 'vf-5',
    type: '학력 인증',
    linkId: 'kwonminseok',
    applicantName: '권민석',
    submittedAt: '2026-07-02 11:15',
    status: 'rejected',
    documentLabel: '수료증.jpg',
    detail: 'OCR 파싱 실패 — 문서 형식 인식 불가',
    reviewedBy: '이서연',
    reviewedAt: '2026-07-02 17:00',
    rejectReason: '정규 학위 서류가 아님(수료증)',
  },
]

export const MOCK_TICKETS: CsTicket[] = [
  {
    id: 'cs-1',
    category: '결제',
    linkId: 'mk',
    authorName: '강명구',
    authorEmail: 'mk@byro.io',
    content: 'Pro 결제가 중복으로 2번 청구됐어요. 확인 부탁드립니다.',
    createdAt: '2026-07-19 18:20',
    status: '접수',
  },
  {
    id: 'cs-2',
    category: '신고',
    authorName: '박소진',
    authorEmail: 'parksojin@byro.io',
    content: '제 프로필에 개인정보가 노출된 피드백을 신고했는데 아직도 안 지워졌어요.',
    createdAt: '2026-07-18 12:03',
    status: '처리 중',
    assignee: '이서연',
  },
  {
    id: 'cs-3',
    category: '계정',
    authorName: '정원호',
    authorEmail: 'jungwonho@byro.io',
    content: 'linkId를 변경하고 싶은데 방법을 모르겠어요.',
    createdAt: '2026-07-16 09:55',
    status: '완료',
    reply: '마이페이지 > 계정 설정에서 커스텀 링크(Pro 전용)로 변경하실 수 있습니다.',
    repliedAt: '2026-07-16 11:30',
    assignee: '이서연',
  },
  {
    id: 'cs-4',
    category: '기타',
    authorName: '임지연',
    authorEmail: 'limjiyeon@byro.io',
    content: '앱 다크모드 지원 계획 있나요?',
    createdAt: '2026-07-12 20:11',
    status: '완료',
    reply: '현재는 지원하지 않지만 로드맵에 반영 검토하겠습니다. 소중한 의견 감사합니다.',
    repliedAt: '2026-07-13 09:40',
    assignee: '김도윤',
  },
]

export const MOCK_FAQ: FaqItem[] = [
  { id: 'faq-1', question: '피드백을 삭제하고 싶어요', answer: '내 바이로 > 피드백 관리에서 개별 삭제하거나 신고할 수 있습니다.', updatedAt: '2026-06-20' },
  { id: 'faq-2', question: '공개 범위는 어떻게 설정하나요', answer: 'WHO/VIBE/NETWORK 탭별로 공개/비공개 2단계로 설정할 수 있습니다.', updatedAt: '2026-06-11' },
  { id: 'faq-3', question: '익명으로 피드백을 남겼는데 상대가 알 수 있나요', answer: '아니오. 운영자를 포함해 누구도 익명 작성자를 식별할 수 없습니다.', updatedAt: '2026-05-30' },
]

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', linkId: 'mk', name: '강명구', status: '활성', startedAt: '2025-11-22', nextBillingAt: '2026-08-22', amount: 9900 },
  { id: 'sub-2', linkId: 'parksojin', name: '박소진', status: '활성', startedAt: '2025-09-30', nextBillingAt: '2026-07-30', amount: 9900 },
  { id: 'sub-3', linkId: 'choisunyoung', name: '최선영', status: '해지 예약', startedAt: '2025-12-19', nextBillingAt: '2026-07-19', amount: 9900 },
  { id: 'sub-4', linkId: 'hansanghoon', name: '한상훈', status: '활성', startedAt: '2026-05-19', nextBillingAt: '2026-08-19', amount: 9900 },
  { id: 'sub-5', linkId: 'jungwonho', name: '정원호', status: '만료', startedAt: '2025-08-14', amount: 9900 },
  { id: 'sub-6', linkId: 'baekhyunjin', name: '백현진', status: '활성', startedAt: '2025-07-02', nextBillingAt: '2026-08-02', amount: 9900 },
]

export const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: 'pay-1', linkId: 'mk', name: '강명구', amount: 9900, status: '결제완료', pgTransactionId: 'toss_20260722_0091', paidAt: '2026-07-22' },
  { id: 'pay-2', linkId: 'parksojin', name: '박소진', amount: 9900, status: '결제완료', pgTransactionId: 'toss_20260630_0042', paidAt: '2026-06-30' },
  { id: 'pay-3', linkId: 'choisunyoung', name: '최선영', amount: 9900, status: '결제실패', pgTransactionId: 'toss_20260619_0117', paidAt: '2026-06-19' },
  { id: 'pay-4', linkId: 'hansanghoon', name: '한상훈', amount: 9900, status: '결제완료', pgTransactionId: 'toss_20260619_0055', paidAt: '2026-06-19' },
  { id: 'pay-5', linkId: 'jungwonho', name: '정원호', amount: 9900, status: '취소', pgTransactionId: 'toss_20260514_0008', paidAt: '2026-05-14' },
]

export const MOCK_PLAN_GRANTS: ManualPlanGrant[] = [
  { id: 'grant-1', linkId: 'yoonjisoo', days: 30, reason: 'CS 대응 보상 (버그로 인한 불편)', actor: '이서연', grantedAt: '2026-06-25' },
]

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'audit-1', actor: '이서연', action: '신고 처리(인용)', target: '피드백 rp-4 · 이준혁', reason: '명예훼손/모욕 확인', createdAt: '2026-07-10 15:40' },
  { id: 'audit-2', actor: '박관리', action: '신고 처리(기각)', target: '피드백 rp-5 · 최선영', reason: '신고 사유 불충분', createdAt: '2026-07-05 10:00' },
  { id: 'audit-3', actor: '이서연', action: '인증 승인', target: '학력 인증 vf-4 · 오예림', createdAt: '2026-07-08 14:20' },
  { id: 'audit-4', actor: '이서연', action: '인증 반려', target: '학력 인증 vf-5 · 권민석', reason: '정규 학위 서류가 아님(수료증)', createdAt: '2026-07-02 17:00' },
  { id: 'audit-5', actor: '이서연', action: '플랜 수동 부여', target: '윤지수 · 30일', reason: 'CS 대응 보상 (버그로 인한 불편)', createdAt: '2026-06-25' },
]

// ── DASH ────────────────────────────────────────────────────────────────────
export const MOCK_DASH_STATS = {
  totalUsers: 4821,
  newUsersToday: 37,
  dau: 612,
  wau: 2148,
  mau: 3960,
  profileViews: 18240,
  experiencesSubmitted: 892,
  mrr: 3910500,
}

export const MOCK_PENDING_QUEUES = {
  reportsPending: MOCK_REPORTS.filter((r) => r.status === 'pending').length,
  verificationsPending: MOCK_VERIFICATIONS.filter((v) => v.status === 'pending').length,
  ticketsUnanswered: MOCK_TICKETS.filter((t) => t.status !== '완료').length,
}

// ── ANLY ────────────────────────────────────────────────────────────────────
export const MOCK_INFLOW_CHANNELS: InflowChannelStat[] = [
  { channel: '프로필 공유 링크', visits: 5230, signupStarts: 890, signupCompletes: 612 },
  { channel: '직접', visits: 3110, signupStarts: 420, signupCompletes: 301 },
  { channel: '검색유입', visits: 1980, signupStarts: 210, signupCompletes: 134 },
  { channel: 'SNS', visits: 1420, signupStarts: 260, signupCompletes: 172 },
  { channel: '광고', visits: 640, signupStarts: 95, signupCompletes: 41 },
]

export const MOCK_SIGNUP_FUNNEL: FunnelStep[] = [
  { step: '소셜 로그인', entered: 1875, dropRate: 0 },
  { step: '약관 동의', entered: 1640, dropRate: 12.5 },
  { step: '본인인증', entered: 1390, dropRate: 15.2 },
]

export const MOCK_ONBOARDING_FUNNEL: FunnelStep[] = [
  { step: '기본정보', entered: 1260, dropRate: 0 },
  { step: '프로필', entered: 1198, dropRate: 4.9 },
  { step: 'SNS', entered: 1042, dropRate: 13.0 },
  { step: '연락 수단', entered: 989, dropRate: 5.1 },
  { step: '하이라이트', entered: 861, dropRate: 12.9 },
  { step: '자기소개', entered: 820, dropRate: 4.8 },
  { step: '완료', entered: 797, dropRate: 2.8 },
]

export const MOCK_RETENTION: RetentionCohort[] = [
  { cohort: '2026-06 가입', size: 512, d1: 61, d7: 34, d30: 21 },
  { cohort: '2026-05 가입', size: 480, d1: 58, d7: 31, d30: 19 },
  { cohort: '2026-04 가입', size: 455, d1: 55, d7: 29, d30: 18 },
]

export const MOCK_CORE_ACTION_FUNNEL: FunnelStep[] = [
  { step: '프로필 저장', entered: 2210, dropRate: 0 },
  { step: '경험 남기기', entered: 892, dropRate: 59.6 },
  { step: '케미 조회', entered: 1540, dropRate: 30.3 },
  { step: 'Pro 전환', entered: 214, dropRate: 86.1 },
]

export const EVENT_SPECS: EventSpec[] = [
  { name: 'profile_view', timing: '공개 프로필 진입', params: 'link_id, ref, is_logged_in' },
  { name: 'signup_start', timing: '소셜 로그인 버튼 탭', params: 'provider' },
  { name: 'signup_complete', timing: '본인인증 완료/건너뛰기', params: 'verified' },
  { name: 'onboarding_step', timing: '온보딩 각 단계 진입', params: 'step, skipped' },
  { name: 'onboarding_complete', timing: 'linkId 발급 완료', params: '—' },
  { name: 'profile_save', timing: '아카이브 저장', params: 'target_link_id' },
  { name: 'experience_submit', timing: '경험 남기기 제출', params: 'keyword_count, has_feedback, is_anonymous' },
  { name: 'feedback_request_send', timing: '피드백 요청 발송', params: '—' },
  { name: 'kemi_view', timing: '케미 카드 노출', params: 'match_count' },
  { name: 'share_profile', timing: '프로필 공유 액션', params: 'channel' },
  { name: 'search', timing: '검색 실행', params: 'result_count, has_virtual' },
  { name: 'upgrade_view', timing: 'Pro 비교표/업그레이드 모달 노출', params: 'trigger (슬롯 초과 등)' },
  { name: 'purchase_complete', timing: '결제 완료', params: 'plan, amount' },
]

// AI 관리 초기값 — 근거: Notion "AI 정책" 문서 (페르소나·자기소개 가중치). 케미 리포트는 정책 문서에
// 가중치가 아직 확정되지 않아 lib/profileAnalysis.ts의 신호 카테고리(정체성/라이프스타일/취향)를 기준으로 임시값 부여.
export const MOCK_AI_PERSONA_CONFIG: AiPersonaConfig = {
  enabled: true,
  status: '규칙 기반 구현',
  autoRefreshWeekly: true,
  manualEditAllowed: false,
  weights: [
    { key: 'reputation', label: '평판 키워드', weight: 35 },
    { key: 'title', label: '직함', weight: 25 },
    { key: 'music', label: '음악', weight: 10 },
    { key: 'exercise', label: '운동', weight: 10 },
    { key: 'cafe', label: '카페', weight: 10 },
    { key: 'book', label: '책', weight: 10 },
  ],
  emptyStateText: '아직 페르소나를 만들 근거가 부족해요',
  updatedBy: '이서연',
  updatedAt: '2026-07-13 11:20',
}

export const MOCK_AI_BIO_CONFIG: AiBioConfig = {
  enabled: false,
  status: '미구현(스텁)',
  regenerateOnEveryClick: true,
  maxLength: 300,
  weights: [
    { key: 'highlight', label: '하이라이트', weight: 35 },
    { key: 'title', label: '직함', weight: 30 },
    { key: 'reputation', label: '평판 키워드', weight: 25 },
    { key: 'existingBio', label: '기존 자기소개', weight: 10 },
  ],
  promptTemplate: '다음 정보를 바탕으로 80~150자 분량의 자기소개를 3~5문장, 자연스러운 존댓말로 작성해줘.',
  updatedBy: '이서연',
  updatedAt: '2026-07-10 09:40',
}

export const MOCK_AI_KEMI_CONFIG: AiKemiConfig = {
  enabled: false,
  status: '미구현(목업 고정값)',
  cacheInvalidateOnProfileEdit: true,
  weights: [
    { key: 'identity', label: '정체성 (MBTI · 동네 등)', weight: 40 },
    { key: 'lifestyle', label: '라이프스타일 (운동 · 카페 등)', weight: 35 },
    { key: 'taste', label: '취향 (음악 · 책 등)', weight: 25 },
  ],
  copyPromptTemplate: '두 프로필의 공통점을 바탕으로 자연스러운 대화 시작 문구를 1문장으로 제안해줘.',
  updatedBy: '박관리',
  updatedAt: '2026-06-25 16:00',
}

// AI 검색(app/api/ai-search/route.ts) — 실제 OpenAI(gpt-4o-mini) 연동. 마이 바이로 편집의
// 장소·미디어·음악 검색 피커(PlacePicker/MediaSearchPicker/MusicSearchPicker)에서 사용.
// promptDraft는 route.ts의 SYSTEM_PROMPTS를 그대로 옮긴 참고용 초안 — 여기서 수정해도 코드 배포 전까진 실제 반영되지 않음.
export const MOCK_AI_SEARCH_CONFIG: AiSearchConfig = {
  enabled: true,
  status: '실제 LLM 연동(OpenAI)',
  model: 'gpt-4o-mini',
  temperature: 0.1,
  maxTokens: 600,
  categories: [
    {
      key: 'movie',
      label: '영화',
      enabled: true,
      replacementApi: 'TMDB 연동 예정 (GET /3/search/movie)',
      promptDraft:
        'You are a Korean movie search assistant. Given a partial or full query (may be in Korean), return the 5 most relevant movies.\nRespond ONLY with valid JSON: {"items":[{"id":"tmdb-123","title":"한국어제목","subtitle":"감독","detail":"개봉연도","posterUrl":null}]}\nUse the Korean release title. If you know the TMDB numeric ID, use "tmdb-{id}" format.',
    },
    {
      key: 'book',
      label: '책',
      enabled: true,
      replacementApi: '알라딘 Open API 연동 예정',
      promptDraft:
        'You are a book search assistant fluent in Korean. Given a query, return the 5 most relevant books.\nRespond ONLY with valid JSON: {"items":[{"id":"book-1","title":"제목","subtitle":"저자","detail":"출판사","posterUrl":null}]}',
    },
    {
      key: 'play',
      label: '공연',
      enabled: true,
      replacementApi: '전용 API 없음 — AI 검색 계속 사용',
      promptDraft:
        'You are a Korean musical and theater search assistant. Given a query, return the 5 most relevant musicals or plays staged in Korea.\nRespond ONLY with valid JSON: {"items":[{"id":"play-1","title":"공연명","subtitle":"공연장","detail":"초연연도 또는 공연기간","posterUrl":null}]}',
    },
    {
      key: 'music',
      label: '음악',
      enabled: true,
      replacementApi: 'Spotify 연동 예정 (GET /v1/search)',
      promptDraft:
        'You are a music search assistant. Given a query (may be Korean song title or artist name), return the 5 most relevant songs.\nRespond ONLY with valid JSON: {"items":[{"id":"track-1","title":"곡명","subtitle":"아티스트","detail":"앨범","posterUrl":null}]}',
    },
    {
      key: 'restaurant',
      label: '맛집',
      enabled: true,
      replacementApi: 'Kakao Local API 연동 예정',
      promptDraft:
        'You are a Korean restaurant search assistant. Given a query (restaurant name or neighborhood), return 5 relevant restaurants in Korea.\nRespond ONLY with valid JSON: {"items":[{"id":"r-1","title":"식당명","subtitle":"동네 또는 주소","detail":"음식 종류","posterUrl":null}]}',
    },
    {
      key: 'cafe',
      label: '카페',
      enabled: true,
      replacementApi: 'Kakao Local API 연동 예정',
      promptDraft:
        'You are a Korean cafe search assistant. Given a query, return 5 relevant cafes in Korea.\nRespond ONLY with valid JSON: {"items":[{"id":"c-1","title":"카페명","subtitle":"동네 또는 주소","detail":"특징","posterUrl":null}]}',
    },
    {
      key: 'travel',
      label: '여행지',
      enabled: true,
      replacementApi: '전용 API 미정',
      promptDraft:
        'You are a travel destination search assistant. Given a partial query (may be Korean), return 5 relevant travel destinations.\nRespond ONLY with valid JSON: {"items":[{"id":"city-1","title":"도시명(한국어)","subtitle":"국가","detail":"지역","posterUrl":null}]}',
    },
  ],
  updatedBy: '박관리',
  updatedAt: '2026-07-15 14:00',
}

// 가상 프로필(components/screens/profile/VirtualProfilePage.tsx) — 비가입자를 공개 정보로 구조화한
// 추정 프로필. lib/mocks/virtualProfiles.ts에 3건 고정 목업, 실제 생성 로직 없음.
// 클레임(본인 인증) 심사는 별도로 인증 검토(VRFY-02) 화면에서 처리됨.
export const MOCK_AI_VIRTUAL_CONFIG: AiVirtualProfileConfig = {
  enabled: true,
  status: '미구현(목업 고정값)',
  disclaimerText: 'AI가 구조화한 추정 프로필입니다',
  sourceTypes: [
    { key: 'news', label: '뉴스 기사', allowed: true },
    { key: 'org_page', label: '회사·기관 소개 페이지', allowed: true },
    { key: 'public_sns', label: '공개 SNS 게시물', allowed: true },
    { key: 'award_db', label: '수상·이력 데이터베이스', allowed: true },
    { key: 'private_paid', label: '비공개·유료 데이터', allowed: false },
  ],
  updatedBy: '박관리',
  updatedAt: '2026-06-10 10:00',
}
