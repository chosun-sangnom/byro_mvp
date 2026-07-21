'use client'

import { useMemo, useState } from 'react'
import { FileText, Info } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { AdminCard, EmptyState, RoleLockNotice, SectionHeading, StatusBadge, hasRole } from '@/components/admin/ui'
import { Button } from '@/components/ui'
import type { VerificationItem, VerificationType } from '@/types/admin'

const STATUS_TONE = { pending: 'warn', approved: 'success', rejected: 'danger' } as const
const STATUS_LABEL = { pending: '검토 대기', approved: '승인', rejected: '반려' } as const

function VerificationRow({ item }: { item: VerificationItem }) {
  const adminUser = useAdminStore((s) => s.adminUser)
  const approveVerification = useAdminStore((s) => s.approveVerification)
  const rejectVerification = useAdminStore((s) => s.rejectVerification)
  const canOperate = hasRole(adminUser?.role, 'operator')
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  return (
    <AdminCard className="mb-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge label={item.type} tone="info" />
            <StatusBadge label={STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
          </div>
          <div className="mt-1.5 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {item.applicantName} <span className="font-normal" style={{ color: 'var(--color-text-tertiary)' }}>@{item.linkId}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>
            <FileText size={13} />
            {item.status === 'pending' ? item.documentLabel : <span style={{ color: 'var(--color-text-tertiary)' }}>서류 파기됨 (처리 완료)</span>}
          </div>
          <div className="mt-1 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {item.detail}
          </div>
          <div className="mt-1 text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
            제출일 {item.submittedAt}
            {item.reviewedAt ? ` · ${item.reviewedBy} 처리 ${item.reviewedAt}` : ''}
            {item.rejectReason ? ` · 반려 사유: ${item.rejectReason}` : ''}
          </div>
        </div>
      </div>

      {item.status === 'pending' &&
        (canOperate ? (
          rejecting ? (
            <div className="space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="반려 사유 입력 (필수)"
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-[13px]"
                style={{ borderColor: 'var(--color-border-default)' }}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" fullWidth={false} onClick={() => setRejecting(false)}>
                  취소
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  fullWidth={false}
                  disabled={!reason.trim()}
                  onClick={() => rejectVerification(item.id, reason.trim())}
                >
                  반려 확정
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" fullWidth={false} onClick={() => approveVerification(item.id)}>
                승인
              </Button>
              <Button size="sm" variant="outline" fullWidth={false} onClick={() => setRejecting(true)}>
                반려
              </Button>
            </div>
          )
        ) : (
          <RoleLockNotice required="operator" />
        ))}
    </AdminCard>
  )
}

export default function VerificationScreen() {
  const verifications = useAdminStore((s) => s.verifications)
  const [type, setType] = useState<VerificationType>('학력 인증')

  const list = useMemo(
    () => verifications.filter((v) => v.type === type).sort((a) => (a.status === 'pending' ? -1 : 1)),
    [verifications, type],
  )

  return (
    <div>
      <SectionHeading title="인증 검토" description="OCR 파싱 오류 건과 가상 프로필 클레임 요청을 수동 검토합니다. (VRFY-01, VRFY-02)" />

      <div
        className="mb-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-[12.5px]"
        style={{ borderColor: 'var(--color-state-info-bg)', backgroundColor: 'var(--color-state-info-bg)', color: 'var(--color-state-info-text)' }}
      >
        <Info size={16} className="mt-0.5 shrink-0" />
        서류는 검토 중에만 보관되며 처리 완료 즉시 파기됩니다.
      </div>

      <div className="mb-4 flex gap-1 rounded-full border p-1 w-fit" style={{ borderColor: 'var(--color-border-default)' }}>
        {(['학력 인증', '가상 프로필 클레임'] as VerificationType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="rounded-full px-4 py-1.5 text-[13px] font-bold"
            style={{
              backgroundColor: type === t ? 'var(--color-accent-dark)' : 'transparent',
              color: type === t ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <AdminCard>
          <EmptyState title="검토할 항목이 없어요" />
        </AdminCard>
      ) : (
        list.map((v) => <VerificationRow key={v.id} item={v} />)
      )}
    </div>
  )
}
