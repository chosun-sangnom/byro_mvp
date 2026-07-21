'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type {
  AdminOperator,
  AdminRole,
  AdminUserRow,
  AiBioConfig,
  AiKemiConfig,
  AiPersonaConfig,
  AiSearchConfig,
  AiVirtualProfileConfig,
  AuditLogEntry,
  CsTicket,
  FaqItem,
  FeedbackReport,
  ManualPlanGrant,
  PaymentRecord,
  ReportVerdict,
  SanctionRecord,
  SanctionStatus,
  Subscription,
  TicketStatus,
  VerificationItem,
} from '@/types/admin'
import {
  ADMIN_OPERATORS,
  MOCK_AI_BIO_CONFIG,
  MOCK_AI_KEMI_CONFIG,
  MOCK_AI_PERSONA_CONFIG,
  MOCK_AI_SEARCH_CONFIG,
  MOCK_AI_VIRTUAL_CONFIG,
  MOCK_AUDIT_LOG,
  MOCK_FAQ,
  MOCK_PAYMENTS,
  MOCK_PLAN_GRANTS,
  MOCK_REPORTS,
  MOCK_SANCTION_HISTORY,
  MOCK_SUBSCRIPTIONS,
  MOCK_TICKETS,
  MOCK_USER_ROWS,
  MOCK_VERIFICATIONS,
} from '@/lib/mocks/adminMocks'

function nowLabel() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

interface AdminStore {
  // 세션 (ADMN-01)
  adminUser: AdminOperator | null
  hasHydrated: boolean
  setHasHydrated: (hydrated: boolean) => void
  login: (operator: AdminOperator) => void
  logout: () => void

  // USER
  users: AdminUserRow[]
  setSanction: (linkId: string, status: SanctionStatus, reason: string, suspendUntil?: string) => void
  forceWithdraw: (linkId: string, reason: string) => void

  // RPRT
  reports: FeedbackReport[]
  sanctionHistory: SanctionRecord[]
  resolveReport: (id: string, verdict: ReportVerdict) => void
  blockIp: (reportId: string) => void

  // VRFY
  verifications: VerificationItem[]
  approveVerification: (id: string) => void
  rejectVerification: (id: string, reason: string) => void

  // BILL
  subscriptions: Subscription[]
  payments: PaymentRecord[]
  planGrants: ManualPlanGrant[]
  refundPayment: (id: string) => void
  grantPlan: (linkId: string, days: number, reason: string) => void

  // CS
  tickets: CsTicket[]
  faq: FaqItem[]
  updateTicketStatus: (id: string, status: TicketStatus) => void
  replyTicket: (id: string, reply: string) => void
  addFaq: (question: string, answer: string) => void
  removeFaq: (id: string) => void

  // ADMN
  operators: AdminOperator[]
  auditLog: AuditLogEntry[]
  setOperatorRole: (id: string, role: AdminRole) => void
  appendAudit: (action: string, target: string, reason?: string) => void

  // AI
  aiPersonaConfig: AiPersonaConfig
  aiBioConfig: AiBioConfig
  aiKemiConfig: AiKemiConfig
  aiSearchConfig: AiSearchConfig
  aiVirtualConfig: AiVirtualProfileConfig
  updatePersonaConfig: (patch: Partial<AiPersonaConfig>, changeSummary: string) => void
  updateBioConfig: (patch: Partial<AiBioConfig>, changeSummary: string) => void
  updateKemiConfig: (patch: Partial<AiKemiConfig>, changeSummary: string) => void
  updateSearchConfig: (patch: Partial<AiSearchConfig>, changeSummary: string) => void
  toggleSearchCategory: (key: string, enabled: boolean) => void
  updateVirtualConfig: (patch: Partial<AiVirtualProfileConfig>, changeSummary: string) => void
  toggleVirtualSourceType: (key: string, allowed: boolean) => void
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      adminUser: null,
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      login: (operator) => set({ adminUser: operator }),
      logout: () => set({ adminUser: null }),

      users: MOCK_USER_ROWS,
      setSanction: (linkId, status, reason, suspendUntil) => {
        const actor = get().adminUser?.name ?? '알수없음'
        set((s) => ({
          users: s.users.map((u) => (u.linkId === linkId ? { ...u, sanctionStatus: status } : u)),
          sanctionHistory: [
            { id: uuidv4(), linkId, status, reason, actor, createdAt: nowLabel(), suspendUntil },
            ...s.sanctionHistory,
          ],
        }))
        get().appendAudit(`제재 상태 변경(${status})`, `회원 ${linkId}`, reason)
      },
      forceWithdraw: (linkId, reason) => {
        set((s) => ({ users: s.users.filter((u) => u.linkId !== linkId) }))
        get().appendAudit('강제 탈퇴', `회원 ${linkId}`, reason)
      },

      reports: MOCK_REPORTS,
      sanctionHistory: MOCK_SANCTION_HISTORY,
      resolveReport: (id, verdict) => {
        const actor = get().adminUser?.name ?? '알수없음'
        const report = get().reports.find((r) => r.id === id)
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id
              ? { ...r, status: 'resolved', verdict, resolvedBy: actor, resolvedAt: nowLabel() }
              : r,
          ),
        }))
        if (report && verdict === '인용' && !report.isAnonymous && report.feedbackAuthorName) {
          get().appendAudit('신고 처리(인용)', `피드백 ${id} · ${report.targetOwnerName}`, report.reason)
        } else if (report) {
          get().appendAudit(`신고 처리(${verdict})`, `피드백 ${id} · ${report.targetOwnerName}`, report.reason)
        }
      },
      blockIp: (reportId) => {
        const report = get().reports.find((r) => r.id === reportId)
        get().appendAudit('IP 차단', `${report?.ipMasked ?? ''} (피드백 ${reportId})`, '익명 피드백 신고 인용 — 계정 제재 불가, IP 차단만 적용')
      },

      verifications: MOCK_VERIFICATIONS,
      approveVerification: (id) => {
        const actor = get().adminUser?.name ?? '알수없음'
        const item = get().verifications.find((v) => v.id === id)
        set((s) => ({
          verifications: s.verifications.map((v) =>
            v.id === id ? { ...v, status: 'approved', reviewedBy: actor, reviewedAt: nowLabel() } : v,
          ),
          users: s.users.map((u) => (u.linkId === item?.linkId ? { ...u, isVerified: true } : u)),
        }))
        get().appendAudit('인증 승인', `${item?.type} ${id} · ${item?.applicantName}`)
      },
      rejectVerification: (id, reason) => {
        const actor = get().adminUser?.name ?? '알수없음'
        const item = get().verifications.find((v) => v.id === id)
        set((s) => ({
          verifications: s.verifications.map((v) =>
            v.id === id
              ? { ...v, status: 'rejected', reviewedBy: actor, reviewedAt: nowLabel(), rejectReason: reason }
              : v,
          ),
        }))
        get().appendAudit('인증 반려', `${item?.type} ${id} · ${item?.applicantName}`, reason)
      },

      subscriptions: MOCK_SUBSCRIPTIONS,
      payments: MOCK_PAYMENTS,
      planGrants: MOCK_PLAN_GRANTS,
      refundPayment: (id) => {
        const payment = get().payments.find((p) => p.id === id)
        set((s) => ({
          payments: s.payments.map((p) => (p.id === id ? { ...p, status: '환불' } : p)),
        }))
        get().appendAudit('환불 처리', `결제 ${id} · ${payment?.name}`, `${payment?.amount.toLocaleString()}원`)
      },
      grantPlan: (linkId, days, reason) => {
        const actor = get().adminUser?.name ?? '알수없음'
        const user = get().users.find((u) => u.linkId === linkId)
        set((s) => ({
          planGrants: [
            { id: uuidv4(), linkId, days, reason, actor, grantedAt: nowLabel() },
            ...s.planGrants,
          ],
          users: s.users.map((u) => (u.linkId === linkId ? { ...u, isPaidUser: true } : u)),
        }))
        get().appendAudit('플랜 수동 부여', `${user?.name ?? linkId} · ${days}일`, reason)
      },

      tickets: MOCK_TICKETS,
      faq: MOCK_FAQ,
      updateTicketStatus: (id, status) => {
        set((s) => ({ tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) }))
        get().appendAudit('문의 상태 변경', `티켓 ${id} → ${status}`)
      },
      replyTicket: (id, reply) => {
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id ? { ...t, reply, repliedAt: nowLabel(), status: '완료' as TicketStatus } : t,
          ),
        }))
        get().appendAudit('문의 답변 발송', `티켓 ${id}`)
      },
      addFaq: (question, answer) => {
        set((s) => ({
          faq: [{ id: uuidv4(), question, answer, updatedAt: nowLabel().slice(0, 10) }, ...s.faq],
        }))
      },
      removeFaq: (id) => set((s) => ({ faq: s.faq.filter((f) => f.id !== id) })),

      operators: ADMIN_OPERATORS,
      auditLog: MOCK_AUDIT_LOG,
      setOperatorRole: (id, role) => {
        set((s) => ({ operators: s.operators.map((o) => (o.id === id ? { ...o, role } : o)) }))
        get().appendAudit('운영자 역할 변경', `${id} → ${role}`)
      },
      appendAudit: (action, target, reason) => {
        const actor = get().adminUser?.name ?? '시스템'
        set((s) => ({
          auditLog: [{ id: uuidv4(), actor, action, target, reason, createdAt: nowLabel() }, ...s.auditLog],
        }))
      },

      aiPersonaConfig: MOCK_AI_PERSONA_CONFIG,
      aiBioConfig: MOCK_AI_BIO_CONFIG,
      aiKemiConfig: MOCK_AI_KEMI_CONFIG,
      updatePersonaConfig: (patch, changeSummary) => {
        const actor = get().adminUser?.name ?? '알수없음'
        set((s) => ({ aiPersonaConfig: { ...s.aiPersonaConfig, ...patch, updatedBy: actor, updatedAt: nowLabel() } }))
        get().appendAudit('AI 페르소나 설정 변경', 'AI 관리 · 페르소나', changeSummary)
      },
      updateBioConfig: (patch, changeSummary) => {
        const actor = get().adminUser?.name ?? '알수없음'
        set((s) => ({ aiBioConfig: { ...s.aiBioConfig, ...patch, updatedBy: actor, updatedAt: nowLabel() } }))
        get().appendAudit('AI 자기소개 설정 변경', 'AI 관리 · 자기소개', changeSummary)
      },
      updateKemiConfig: (patch, changeSummary) => {
        const actor = get().adminUser?.name ?? '알수없음'
        set((s) => ({ aiKemiConfig: { ...s.aiKemiConfig, ...patch, updatedBy: actor, updatedAt: nowLabel() } }))
        get().appendAudit('케미 리포트 설정 변경', 'AI 관리 · 케미 리포트', changeSummary)
      },

      aiSearchConfig: MOCK_AI_SEARCH_CONFIG,
      aiVirtualConfig: MOCK_AI_VIRTUAL_CONFIG,
      updateSearchConfig: (patch, changeSummary) => {
        const actor = get().adminUser?.name ?? '알수없음'
        set((s) => ({ aiSearchConfig: { ...s.aiSearchConfig, ...patch, updatedBy: actor, updatedAt: nowLabel() } }))
        get().appendAudit('AI 검색 설정 변경', 'AI 관리 · AI 검색', changeSummary)
      },
      toggleSearchCategory: (key, enabled) => {
        const actor = get().adminUser?.name ?? '알수없음'
        const category = get().aiSearchConfig.categories.find((c) => c.key === key)
        set((s) => ({
          aiSearchConfig: {
            ...s.aiSearchConfig,
            categories: s.aiSearchConfig.categories.map((c) => (c.key === key ? { ...c, enabled } : c)),
            updatedBy: actor,
            updatedAt: nowLabel(),
          },
        }))
        get().appendAudit('AI 검색 카테고리 사용 변경', 'AI 관리 · AI 검색', `${category?.label ?? key} ${enabled ? 'ON' : 'OFF'}`)
      },
      updateVirtualConfig: (patch, changeSummary) => {
        const actor = get().adminUser?.name ?? '알수없음'
        set((s) => ({ aiVirtualConfig: { ...s.aiVirtualConfig, ...patch, updatedBy: actor, updatedAt: nowLabel() } }))
        get().appendAudit('가상 프로필 설정 변경', 'AI 관리 · 가상 프로필', changeSummary)
      },
      toggleVirtualSourceType: (key, allowed) => {
        const actor = get().adminUser?.name ?? '알수없음'
        const sourceType = get().aiVirtualConfig.sourceTypes.find((s) => s.key === key)
        set((s) => ({
          aiVirtualConfig: {
            ...s.aiVirtualConfig,
            sourceTypes: s.aiVirtualConfig.sourceTypes.map((st) => (st.key === key ? { ...st, allowed } : st)),
            updatedBy: actor,
            updatedAt: nowLabel(),
          },
        }))
        get().appendAudit('가상 프로필 출처 허용 변경', 'AI 관리 · 가상 프로필', `${sourceType?.label ?? key} ${allowed ? '허용' : '금지'}`)
      },
    }),
    {
      name: 'byro-admin-store',
      version: 1,
      partialize: (state) => ({
        adminUser: state.adminUser,
        users: state.users,
        reports: state.reports,
        sanctionHistory: state.sanctionHistory,
        verifications: state.verifications,
        subscriptions: state.subscriptions,
        payments: state.payments,
        planGrants: state.planGrants,
        tickets: state.tickets,
        faq: state.faq,
        operators: state.operators,
        auditLog: state.auditLog,
        aiPersonaConfig: state.aiPersonaConfig,
        aiBioConfig: state.aiBioConfig,
        aiKemiConfig: state.aiKemiConfig,
        aiSearchConfig: state.aiSearchConfig,
        aiVirtualConfig: state.aiVirtualConfig,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
