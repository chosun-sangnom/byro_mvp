'use client'

import { useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { AdminCard, RoleLockNotice, SectionHeading, StatusBadge, TableShell, Td, Th, hasRole } from '@/components/admin/ui'
import { Button } from '@/components/ui'
import { MOCK_DASH_STATS } from '@/lib/mocks/adminMocks'
import type { SubscriptionStatus, PaymentStatus } from '@/types/admin'

const SUB_TONE: Record<SubscriptionStatus, 'success' | 'warn' | 'neutral'> = { 활성: 'success', '해지 예약': 'warn', 만료: 'neutral' }
const PAY_TONE: Record<PaymentStatus, 'success' | 'danger' | 'neutral' | 'warn'> = {
  결제완료: 'success',
  결제실패: 'danger',
  취소: 'neutral',
  환불: 'warn',
}

export default function BillingScreen() {
  const adminUser = useAdminStore((s) => s.adminUser)
  const subscriptions = useAdminStore((s) => s.subscriptions)
  const payments = useAdminStore((s) => s.payments)
  const planGrants = useAdminStore((s) => s.planGrants)
  const refundPayment = useAdminStore((s) => s.refundPayment)
  const grantPlan = useAdminStore((s) => s.grantPlan)
  const canBill = hasRole(adminUser?.role, 'admin')

  const [grantLinkId, setGrantLinkId] = useState('')
  const [grantDays, setGrantDays] = useState('30')
  const [grantReason, setGrantReason] = useState('')

  const proCount = subscriptions.filter((s) => s.status === '활성').length

  return (
    <div>
      <SectionHeading title="결제 관리" description="Pro 구독 현황, 결제 내역, 환불·수동 플랜 부여를 처리합니다. (BILL-01~05)" />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <AdminCard>
          <div className="text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>MRR (BILL-05)</div>
          <div className="mt-1.5 text-[20px] font-black" style={{ color: 'var(--color-text-strong)' }}>₩{MOCK_DASH_STATS.mrr.toLocaleString()}</div>
        </AdminCard>
        <AdminCard>
          <div className="text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>활성 Pro 구독자</div>
          <div className="mt-1.5 text-[20px] font-black" style={{ color: 'var(--color-text-strong)' }}>{proCount}명</div>
        </AdminCard>
        <AdminCard>
          <div className="text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Free → Pro 전환율</div>
          <div className="mt-1.5 text-[20px] font-black" style={{ color: 'var(--color-text-strong)' }}>4.4%</div>
        </AdminCard>
      </div>

      <div className="mb-6">
        <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>구독 현황 (BILL-01)</div>
        <TableShell>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <Th>회원</Th>
              <Th>상태</Th>
              <Th>시작일</Th>
              <Th>다음 결제일</Th>
              <Th>금액</Th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td className="font-bold">{s.name} <span className="font-normal" style={{ color: 'var(--color-text-tertiary)' }}>@{s.linkId}</span></Td>
                <Td><StatusBadge label={s.status} tone={SUB_TONE[s.status]} /></Td>
                <Td>{s.startedAt}</Td>
                <Td>{s.nextBillingAt ?? '—'}</Td>
                <Td>₩{s.amount.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>

      <div className="mb-6">
        <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>결제 내역 (BILL-02, BILL-03)</div>
        <TableShell>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <Th>회원</Th>
              <Th>금액</Th>
              <Th>상태</Th>
              <Th>PG 거래 ID</Th>
              <Th>결제일</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td className="font-bold">{p.name} <span className="font-normal" style={{ color: 'var(--color-text-tertiary)' }}>@{p.linkId}</span></Td>
                <Td>₩{p.amount.toLocaleString()}</Td>
                <Td><StatusBadge label={p.status} tone={PAY_TONE[p.status]} /></Td>
                <Td className="font-mono">{p.pgTransactionId}</Td>
                <Td>{p.paidAt}</Td>
                <Td>
                  {p.status === '결제완료' && canBill && (
                    <button onClick={() => refundPayment(p.id)} className="text-[12.5px] font-bold" style={{ color: 'var(--color-state-danger-text)' }}>
                      환불 처리
                    </button>
                  )}
                  {p.status === '결제완료' && !canBill && <RoleLockNotice required="admin" />}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>

      <AdminCard>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>수동 플랜 부여 (BILL-04)</div>
          {!canBill && <RoleLockNotice required="admin" />}
        </div>
        <p className="mb-3 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>보상 · CS 대응용으로 Pro 기간을 수동 부여합니다.</p>
        <div className="mb-2 flex gap-2">
          <input
            disabled={!canBill}
            value={grantLinkId}
            onChange={(e) => setGrantLinkId(e.target.value)}
            placeholder="linkId"
            className="w-[160px] rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
            style={{ borderColor: 'var(--color-border-default)' }}
          />
          <input
            disabled={!canBill}
            type="number"
            value={grantDays}
            onChange={(e) => setGrantDays(e.target.value)}
            placeholder="일수"
            className="w-[100px] rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
            style={{ borderColor: 'var(--color-border-default)' }}
          />
          <input
            disabled={!canBill}
            value={grantReason}
            onChange={(e) => setGrantReason(e.target.value)}
            placeholder="사유 (필수)"
            className="flex-1 rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
            style={{ borderColor: 'var(--color-border-default)' }}
          />
        </div>
        <Button
          size="sm"
          fullWidth={false}
          disabled={!canBill || !grantLinkId.trim() || !grantReason.trim()}
          onClick={() => {
            grantPlan(grantLinkId.trim(), Number(grantDays) || 30, grantReason.trim())
            setGrantLinkId('')
            setGrantReason('')
          }}
        >
          플랜 부여
        </Button>

        {planGrants.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: 'var(--color-border-soft)' }}>
            {planGrants.map((g) => (
              <div key={g.id} className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                @{g.linkId} · {g.days}일 · {g.reason} · {g.actor} · {g.grantedAt}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  )
}
