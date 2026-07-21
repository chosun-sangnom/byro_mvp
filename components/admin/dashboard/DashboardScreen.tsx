'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, BadgeCheck, MessageCircle, ShieldAlert } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { MOCK_DASH_STATS } from '@/lib/mocks/adminMocks'
import { AdminCard, SectionHeading } from '@/components/admin/ui'

type Period = 'day' | 'week' | 'month'
const PERIOD_LABEL: Record<Period, string> = { day: '일', week: '주', month: '월' }
const PERIOD_FACTOR: Record<Period, number> = { day: 1, week: 6.4, month: 24.8 }

export default function DashboardScreen() {
  const router = useRouter()
  const [period, setPeriod] = useState<Period>('day')
  const reportsPending = useAdminStore((s) => s.reports.filter((r) => r.status === 'pending').length)
  const verificationsPending = useAdminStore((s) => s.verifications.filter((v) => v.status === 'pending').length)
  const ticketsUnanswered = useAdminStore((s) => s.tickets.filter((t) => t.status !== '완료').length)

  const f = PERIOD_FACTOR[period]
  const metrics = [
    { label: '신규 가입자', value: Math.round(MOCK_DASH_STATS.newUsersToday * f) },
    { label: '누적 가입자', value: MOCK_DASH_STATS.totalUsers },
    { label: 'DAU', value: MOCK_DASH_STATS.dau },
    { label: 'WAU', value: MOCK_DASH_STATS.wau },
    { label: 'MAU', value: MOCK_DASH_STATS.mau },
    { label: '프로필 조회수', value: Math.round(MOCK_DASH_STATS.profileViews * (f / 4 + 0.4)) },
    { label: '경험 남기기 수', value: Math.round(MOCK_DASH_STATS.experiencesSubmitted * (f / 4 + 0.4)) },
    { label: 'MRR', value: MOCK_DASH_STATS.mrr, isCurrency: true },
  ]

  const queues = [
    { code: 'RPRT', label: '신고 대기', count: reportsPending, href: '/admin/reports', icon: ShieldAlert },
    { code: 'VRFY', label: '인증 검토 대기', count: verificationsPending, href: '/admin/verification', icon: BadgeCheck },
    { code: 'CS', label: '미답변 문의', count: ticketsUnanswered, href: '/admin/cs', icon: MessageCircle },
  ]

  return (
    <div>
      <SectionHeading title="대시보드" description="서비스 운영 현황을 한눈에 확인합니다." />

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold" style={{ color: 'var(--color-state-danger-text)' }}>
          <AlertTriangle size={15} />
          처리 대기 알림 (DASH-02)
        </div>
        <div className="grid grid-cols-3 gap-3">
          {queues.map((q) => {
            const Icon = q.icon
            return (
              <button
                key={q.code}
                onClick={() => router.push(q.href)}
                className="text-left"
              >
                <AdminCard className={q.count > 0 ? 'border-[var(--color-state-danger-text)]' : ''}>
                  <div className="flex items-center justify-between">
                    <Icon size={18} color={q.count > 0 ? 'var(--color-state-danger-text)' : 'var(--color-text-tertiary)'} />
                    <span
                      className="text-[22px] font-black"
                      style={{ color: q.count > 0 ? 'var(--color-state-danger-text)' : 'var(--color-text-tertiary)' }}
                    >
                      {q.count}
                    </span>
                  </div>
                  <div className="mt-2 text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {q.label}
                  </div>
                </AdminCard>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
          핵심 지표 요약 (DASH-01)
        </div>
        <div className="flex gap-1 rounded-full border p-1" style={{ borderColor: 'var(--color-border-default)' }}>
          {(['day', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="rounded-full px-3 py-1 text-[12px] font-bold"
              style={{
                backgroundColor: period === p ? 'var(--color-accent-dark)' : 'transparent',
                color: period === p ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {metrics.map((m) => (
          <AdminCard key={m.label}>
            <div className="text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
              {m.label}
            </div>
            <div className="mt-1.5 text-[20px] font-black" style={{ color: 'var(--color-text-strong)' }}>
              {m.isCurrency ? `₩${m.value.toLocaleString()}` : m.value.toLocaleString()}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}
