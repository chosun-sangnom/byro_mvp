'use client'

import { useMemo, useState } from 'react'
import { Ban, Info } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { AdminCard, EmptyState, RoleLockNotice, SectionHeading, StatusBadge, TableShell, Td, Th, hasRole } from '@/components/admin/ui'
import { Button } from '@/components/ui'
import type { FeedbackReport, SanctionStatus } from '@/types/admin'

const NEXT_SANCTION: Record<SanctionStatus, SanctionStatus> = {
  정상: '경고',
  경고: '일시정지',
  일시정지: '영구정지',
  영구정지: '영구정지',
}

function ReportRow({ report }: { report: FeedbackReport }) {
  const adminUser = useAdminStore((s) => s.adminUser)
  const resolveReport = useAdminStore((s) => s.resolveReport)
  const blockIp = useAdminStore((s) => s.blockIp)
  const setSanction = useAdminStore((s) => s.setSanction)
  const users = useAdminStore((s) => s.users)
  const canOperate = hasRole(adminUser?.role, 'operator')
  const canSeeIp = hasRole(adminUser?.role, 'admin')

  const targetUser = users.find((u) => u.linkId === report.feedbackAuthorLinkId)

  const handleCite = () => {
    resolveReport(report.id, '인용')
    if (!report.isAnonymous && targetUser) {
      const next = NEXT_SANCTION[targetUser.sanctionStatus]
      setSanction(targetUser.linkId, next, `피드백 신고 인용 (${report.reason}) — 자동 산정`)
    }
  }

  return (
    <AdminCard className="mb-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge label={report.reason} tone="warn" />
            {report.isAnonymous && <StatusBadge label="익명" tone="neutral" />}
            {report.status === 'resolved' && (
              <StatusBadge label={`처리완료 · ${report.verdict}`} tone={report.verdict === '인용' ? 'danger' : 'neutral'} />
            )}
          </div>
          <div className="mt-1.5 text-[13.5px]" style={{ color: 'var(--color-text-primary)' }}>
            &ldquo;{report.feedbackMessage}&rdquo;
          </div>
          <div className="mt-1 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
            대상: {report.targetOwnerName} · 작성자: {report.isAnonymous ? '식별 불가(익명)' : report.feedbackAuthorName} · 신고일시 {report.reportedAt}
          </div>
        </div>
      </div>

      {report.isAnonymous && (
        <div
          className="mb-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px]"
          style={{ backgroundColor: 'var(--color-bg-soft)', color: 'var(--color-text-tertiary)' }}
        >
          <Info size={13} />
          익명 작성자는 운영자도 식별할 수 없습니다 (평판 리뷰 정책). 계정 제재 불가 — IP 차단만 가능합니다.
          {canSeeIp ? <span className="ml-1 font-mono">{report.ipMasked}</span> : <RoleLockNotice required="admin" />}
        </div>
      )}

      {report.status === 'pending' ? (
        canOperate ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" fullWidth={false} onClick={() => resolveReport(report.id, '기각')}>
              기각 (피드백 복구)
            </Button>
            <Button size="sm" variant="danger" fullWidth={false} onClick={handleCite}>
              인용 (삭제 확정{!report.isAnonymous ? ' + 제재' : ''})
            </Button>
            {report.isAnonymous && canSeeIp && (
              <Button size="sm" variant="outline" fullWidth={false} onClick={() => blockIp(report.id)} className="flex items-center gap-1">
                <Ban size={13} /> IP 차단
              </Button>
            )}
          </div>
        ) : (
          <RoleLockNotice required="operator" />
        )
      ) : (
        <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {report.resolvedBy} · {report.resolvedAt} 처리
        </div>
      )}
    </AdminCard>
  )
}

export default function ReportsScreen() {
  const reports = useAdminStore((s) => s.reports)
  const sanctionHistory = useAdminStore((s) => s.sanctionHistory)
  const [tab, setTab] = useState<'pending' | 'resolved'>('pending')

  const list = useMemo(() => {
    const filtered = reports.filter((r) => r.status === tab)
    return [...filtered].sort((a, b) => a.reportedAt.localeCompare(b.reportedAt))
  }, [reports, tab])

  return (
    <div>
      <SectionHeading title="신고·제재" description="프로필 주인이 신고한 피드백을 검토해 기각 또는 인용 처리합니다. (RPRT-01~03)" />

      <div className="mb-4 flex gap-1 rounded-full border p-1 w-fit" style={{ borderColor: 'var(--color-border-default)' }}>
        {(['pending', 'resolved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-full px-4 py-1.5 text-[13px] font-bold"
            style={{
              backgroundColor: tab === t ? 'var(--color-accent-dark)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            {t === 'pending' ? '미처리' : '처리완료'} {t === 'pending' ? `(${reports.filter((r) => r.status === 'pending').length})` : ''}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <AdminCard>
          <EmptyState title={tab === 'pending' ? '대기 중인 신고가 없어요' : '처리된 신고가 없어요'} />
        </AdminCard>
      ) : (
        list.map((r) => <ReportRow key={r.id} report={r} />)
      )}

      <div className="mt-8">
        <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
          제재 이력 (RPRT-02)
        </div>
        {sanctionHistory.length === 0 ? (
          <AdminCard>
            <EmptyState title="제재 이력이 없어요" />
          </AdminCard>
        ) : (
          <TableShell>
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Th>회원</Th>
                <Th>제재 상태</Th>
                <Th>사유</Th>
                <Th>처리자</Th>
                <Th>일시</Th>
              </tr>
            </thead>
            <tbody>
              {sanctionHistory.map((h) => (
                <tr key={h.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                  <Td>@{h.linkId}</Td>
                  <Td>
                    <StatusBadge label={h.status} tone={h.status === '정상' ? 'success' : h.status === '경고' ? 'warn' : 'danger'} />
                  </Td>
                  <Td>{h.reason}</Td>
                  <Td>{h.actor}</Td>
                  <Td>{h.createdAt}{h.suspendUntil ? ` (~${h.suspendUntil})` : ''}</Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </div>
    </div>
  )
}
