// Byro 백오피스(어드민) 전용 타입. 일반 사용자 타입(types/index.ts)과 분리 관리.
// 근거: docs 노션 "백오피스 기획 v1.0"

export type AdminRole = 'viewer' | 'operator' | 'admin'

export interface AdminOperator {
  id: string
  name: string
  role: AdminRole
  email: string
}

export type SanctionStatus = '정상' | '경고' | '일시정지' | '영구정지'

export interface SanctionRecord {
  id: string
  linkId: string
  status: SanctionStatus
  reason: string
  actor: string
  createdAt: string
  suspendUntil?: string
}

export type ReportReason = '허위 내용' | '명예훼손/모욕' | '스팸/광고' | '개인정보 노출' | '기타'
export type ReportVerdict = '기각' | '인용'

export interface FeedbackReport {
  id: string
  targetLinkId: string
  targetOwnerName: string
  feedbackMessage: string
  feedbackAuthorName: string | null
  feedbackAuthorLinkId?: string
  isAnonymous: boolean
  reason: ReportReason
  reportedAt: string
  status: 'pending' | 'resolved'
  verdict?: ReportVerdict
  resolvedBy?: string
  resolvedAt?: string
  // 관리자 권한에서만 열람 가능한 마스킹된 IP (익명 피드백 IP 차단용)
  ipMasked: string
}

export type VerificationType = '학력 인증' | '가상 프로필 클레임'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface VerificationItem {
  id: string
  type: VerificationType
  linkId: string
  applicantName: string
  submittedAt: string
  status: VerificationStatus
  documentLabel: string
  detail: string
  reviewedBy?: string
  reviewedAt?: string
  rejectReason?: string
}

export type TicketCategory = '계정' | '결제' | '신고' | '기타'
export type TicketStatus = '접수' | '처리 중' | '완료'

export interface CsTicket {
  id: string
  category: TicketCategory
  linkId?: string
  authorName: string
  authorEmail: string
  content: string
  createdAt: string
  status: TicketStatus
  reply?: string
  repliedAt?: string
  assignee?: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  updatedAt: string
}

export type SubscriptionStatus = '활성' | '해지 예약' | '만료'

export interface Subscription {
  id: string
  linkId: string
  name: string
  status: SubscriptionStatus
  startedAt: string
  nextBillingAt?: string
  amount: number
}

export type PaymentStatus = '결제완료' | '결제실패' | '취소' | '환불'

export interface PaymentRecord {
  id: string
  linkId: string
  name: string
  amount: number
  status: PaymentStatus
  pgTransactionId: string
  paidAt: string
}

export interface ManualPlanGrant {
  id: string
  linkId: string
  days: number
  reason: string
  actor: string
  grantedAt: string
}

export interface AuditLogEntry {
  id: string
  actor: string
  action: string
  target: string
  reason?: string
  createdAt: string
}

export interface AdminUserRow {
  linkId: string
  name: string
  email: string
  joinedAt: string
  isPaidUser: boolean
  isVerified: boolean
  sanctionStatus: SanctionStatus
  reportCount: number
}

export type InflowChannel = '직접' | '프로필 공유 링크' | '검색유입' | 'SNS' | '광고'

export interface InflowChannelStat {
  channel: InflowChannel
  visits: number
  signupStarts: number
  signupCompletes: number
}

export interface FunnelStep {
  step: string
  entered: number
  dropRate: number
}

export interface RetentionCohort {
  cohort: string
  size: number
  d1: number
  d7: number
  d30: number
}

export interface EventSpec {
  name: string
  timing: string
  params: string
}

// AI 관리 (AI-01~03) — 근거: Notion "AI 정책" 문서
export type AiFeatureKey = 'persona' | 'bio' | 'kemi' | 'search' | 'virtual'
export type AiFeatureStatus = '규칙 기반 구현' | '미구현(스텁)' | '미구현(목업 고정값)' | '실제 LLM 연동(OpenAI)'

export interface AiWeightItem {
  key: string
  label: string
  weight: number
}

export interface AiPersonaConfig {
  enabled: boolean
  status: AiFeatureStatus
  autoRefreshWeekly: boolean
  manualEditAllowed: boolean
  weights: AiWeightItem[]
  emptyStateText: string
  updatedBy?: string
  updatedAt?: string
}

export interface AiBioConfig {
  enabled: boolean
  status: AiFeatureStatus
  regenerateOnEveryClick: boolean
  maxLength: number
  weights: AiWeightItem[]
  promptTemplate: string
  updatedBy?: string
  updatedAt?: string
}

export interface AiKemiConfig {
  enabled: boolean
  status: AiFeatureStatus
  cacheInvalidateOnProfileEdit: boolean
  weights: AiWeightItem[]
  copyPromptTemplate: string
  updatedBy?: string
  updatedAt?: string
}

export interface AiSearchCategoryConfig {
  key: string
  label: string
  enabled: boolean
  replacementApi: string
  promptDraft: string
}

export interface AiSearchConfig {
  enabled: boolean
  status: AiFeatureStatus
  model: string
  temperature: number
  maxTokens: number
  categories: AiSearchCategoryConfig[]
  updatedBy?: string
  updatedAt?: string
}

export interface AiSourceTypeItem {
  key: string
  label: string
  allowed: boolean
}

export interface AiVirtualProfileConfig {
  enabled: boolean
  status: AiFeatureStatus
  disclaimerText: string
  sourceTypes: AiSourceTypeItem[]
  updatedBy?: string
  updatedAt?: string
}
