'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { RoleLockNotice, SectionHeading, StatusBadge, TableShell, Td, Th, hasRole } from '@/components/admin/ui'
import { Button } from '@/components/ui'
import type { AdminRole } from '@/types/admin'

const ROLE_LABEL: Record<AdminRole, string> = {
  viewer: '뷰어 (조회만)',
  operator: '운영 (신고·문의·인증 처리)',
  admin: '관리자 (결제·제재·IP 열람 포함 전체)',
  owner: '소유자 (전체 권한 + 위임)',
}
const ROLES: AdminRole[] = ['viewer', 'operator', 'admin']
const GRANTABLE_ROLES: AdminRole[] = ['viewer', 'operator', 'admin']

export default function AdminSettingsScreen() {
  const adminUser = useAdminStore((s) => s.adminUser)
  const operators = useAdminStore((s) => s.operators)
  const setOperatorRole = useAdminStore((s) => s.setOperatorRole)
  const auditLog = useAdminStore((s) => s.auditLog)
  const joinRequests = useAdminStore((s) => s.joinRequests)
  const approveJoinRequest = useAdminStore((s) => s.approveJoinRequest)
  const rejectJoinRequest = useAdminStore((s) => s.rejectJoinRequest)
  const transferOwnership = useAdminStore((s) => s.transferOwnership)
  const canManageRoles = hasRole(adminUser?.role, 'admin')
  const isOwner = adminUser?.role === 'owner'

  const [pickedRole, setPickedRole] = useState<Record<string, AdminRole>>({})
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null)
  const [transferReason, setTransferReason] = useState('')

  const pendingRequests = joinRequests.filter((r) => r.status === 'pending')
  const reviewedRequests = joinRequests.filter((r) => r.status !== 'pending')

  return (
    <div>
      <SectionHeading title="권한·감사" description="가입 신청을 승인하고 운영자 역할을 관리하며 모든 처리 이력을 감사합니다. (ADMN-01~05)" />

      <div
        className="mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-[12.5px]"
        style={{ borderColor: 'var(--color-state-info-bg)', backgroundColor: 'var(--color-state-info-bg)', color: 'var(--color-state-info-text)' }}
      >
        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
        <span>
          익명 보호 원칙 (ADMN-03): 백오피스 전 화면에서 익명 작성자의 계정 정보는 표시되지 않습니다. IP는 관리자 권한에서만 열람할 수 있습니다.
          (신고·제재 화면의 익명 피드백 처리에 적용됨)
        </span>
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>가입 신청 (ADMN-04)</div>
          {!isOwner && <RoleLockNotice required="owner" />}
        </div>
        <TableShell>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <Th>이름</Th>
              <Th>이메일</Th>
              <Th>사유</Th>
              <Th>신청일</Th>
              <Th>부여할 역할</Th>
              <Th>처리</Th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  대기 중인 가입 신청이 없습니다
                </td>
              </tr>
            )}
            {pendingRequests.map((req) => {
              const role = pickedRole[req.id] ?? 'viewer'
              const isRejecting = rejectingId === req.id
              return (
                <tr key={req.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                  <Td className="font-bold">{req.name}</Td>
                  <Td>{req.email}</Td>
                  <Td>{req.reason ?? '—'}</Td>
                  <Td>{req.requestedAt}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      {GRANTABLE_ROLES.map((r) => (
                        <button
                          key={r}
                          disabled={!isOwner}
                          onClick={() => setPickedRole((s) => ({ ...s, [req.id]: r }))}
                          className="rounded-full border px-2.5 py-1 text-[11.5px] font-bold disabled:opacity-40"
                          style={{
                            borderColor: role === r ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                            backgroundColor: role === r ? 'var(--color-accent-bg)' : 'transparent',
                            color: role === r ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                          }}
                        >
                          {ROLE_LABEL[r]}
                        </button>
                      ))}
                    </div>
                  </Td>
                  <Td>
                    {isRejecting ? (
                      <div className="space-y-1.5">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="반려 사유 (필수)"
                          rows={2}
                          className="w-full min-w-[160px] rounded-lg border px-2.5 py-1.5 text-[12.5px] outline-none"
                          style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}
                        />
                        <div className="flex gap-1.5">
                          <Button
                            variant="danger"
                            size="sm"
                            fullWidth={false}
                            disabled={!rejectReason.trim()}
                            onClick={() => {
                              rejectJoinRequest(req.id, rejectReason.trim())
                              setRejectingId(null)
                              setRejectReason('')
                            }}
                          >
                            반려 확정
                          </Button>
                          <Button variant="outline" size="sm" fullWidth={false} onClick={() => { setRejectingId(null); setRejectReason('') }}>
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth={false}
                          disabled={!isOwner}
                          onClick={() => approveJoinRequest(req.id, role)}
                        >
                          승인
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth={false}
                          disabled={!isOwner}
                          onClick={() => setRejectingId(req.id)}
                        >
                          거절
                        </Button>
                      </div>
                    )}
                  </Td>
                </tr>
              )
            })}
            {reviewedRequests.map((req) => (
              <tr key={req.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td>{req.name}</Td>
                <Td>{req.email}</Td>
                <Td>{req.reason ?? '—'}</Td>
                <Td>{req.requestedAt}</Td>
                <Td>—</Td>
                <Td>
                  <StatusBadge
                    label={req.status === 'approved' ? `승인됨 · ${req.reviewedBy ?? ''}` : `반려됨 · ${req.rejectReason ?? ''}`}
                    tone={req.status === 'approved' ? 'success' : 'danger'}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>운영자 계정·역할 (ADMN-01)</div>
          {!canManageRoles && <RoleLockNotice required="admin" />}
        </div>
        <TableShell>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <Th>이름</Th>
              <Th>이메일</Th>
              <Th>역할</Th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => {
              const isSelf = op.id === adminUser?.id
              const isOwnerRow = op.role === 'owner'
              return (
                <tr key={op.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                  <Td className="font-bold">{op.name}{isSelf ? ' (나)' : ''}</Td>
                  <Td>{op.email}</Td>
                  <Td>
                    {isOwnerRow ? (
                      <StatusBadge label="소유자 (위임으로만 변경 가능)" tone="info" />
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {ROLES.map((r) => (
                          <button
                            key={r}
                            disabled={!canManageRoles || isSelf}
                            onClick={() => setOperatorRole(op.id, r)}
                            className="rounded-full border px-2.5 py-1 text-[11.5px] font-bold disabled:opacity-40"
                            style={{
                              borderColor: op.role === r ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                              backgroundColor: op.role === r ? 'var(--color-accent-bg)' : 'transparent',
                              color: op.role === r ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                            }}
                          >
                            {ROLE_LABEL[r]}
                          </button>
                        ))}
                      </div>
                    )}
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </TableShell>
      </div>

      {isOwner && (
        <div className="mb-8">
          <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>소유자 위임 (ADMN-05)</div>
          <div
            className="rounded-2xl border p-4 text-[12.5px]"
            style={{ borderColor: 'var(--color-state-danger-bg)', color: 'var(--color-text-secondary)' }}
          >
            <p className="mb-3">
              소유자 권한을 다른 운영자에게 넘기면 나는 즉시 관리자로 전환되고, 되돌리려면 새 소유자가 다시 위임해야 합니다.
            </p>
            <div className="space-y-2">
              {operators
                .filter((op) => op.id !== adminUser?.id)
                .map((op) => {
                  const isTarget = transferTargetId === op.id
                  return (
                    <div key={op.id} className="rounded-xl border p-3" style={{ borderColor: 'var(--color-border-default)' }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{op.name}</div>
                          <div className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>{op.email} · 현재 {ROLE_LABEL[op.role]}</div>
                        </div>
                        {!isTarget && (
                          <Button
                            variant="danger"
                            size="sm"
                            fullWidth={false}
                            onClick={() => { setTransferTargetId(op.id); setTransferReason('') }}
                          >
                            소유자로 위임
                          </Button>
                        )}
                      </div>
                      {isTarget && (
                        <div className="mt-2.5 space-y-1.5">
                          <textarea
                            value={transferReason}
                            onChange={(e) => setTransferReason(e.target.value)}
                            placeholder="위임 사유 (필수)"
                            rows={2}
                            className="w-full rounded-lg border px-2.5 py-1.5 text-[12.5px] outline-none"
                            style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}
                          />
                          <div className="flex gap-1.5">
                            <Button
                              variant="danger"
                              size="sm"
                              fullWidth={false}
                              disabled={!transferReason.trim()}
                              onClick={() => {
                                transferOwnership(op.id, transferReason.trim())
                                setTransferTargetId(null)
                                setTransferReason('')
                              }}
                            >
                              위임 확정
                            </Button>
                            <Button variant="outline" size="sm" fullWidth={false} onClick={() => { setTransferTargetId(null); setTransferReason('') }}>
                              취소
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>감사 로그 (ADMN-02, 수정 불가)</div>
        <TableShell>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <Th>일시</Th>
              <Th>처리자</Th>
              <Th>액션</Th>
              <Th>대상</Th>
              <Th>사유</Th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((a) => (
              <tr key={a.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td>{a.createdAt}</Td>
                <Td className="font-bold">{a.actor}</Td>
                <Td>{a.action}</Td>
                <Td>{a.target}</Td>
                <Td>{a.reason ?? '—'}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>
    </div>
  )
}
