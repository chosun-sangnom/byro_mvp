'use client'

import { ShieldCheck } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { RoleLockNotice, SectionHeading, TableShell, Td, Th, hasRole } from '@/components/admin/ui'
import type { AdminRole } from '@/types/admin'

const ROLE_LABEL: Record<AdminRole, string> = { viewer: '뷰어 (조회만)', operator: '운영 (신고·문의·인증 처리)', admin: '관리자 (결제·제재·IP 열람 포함 전체)' }
const ROLES: AdminRole[] = ['viewer', 'operator', 'admin']

export default function AdminSettingsScreen() {
  const adminUser = useAdminStore((s) => s.adminUser)
  const operators = useAdminStore((s) => s.operators)
  const setOperatorRole = useAdminStore((s) => s.setOperatorRole)
  const auditLog = useAdminStore((s) => s.auditLog)
  const canManageRoles = hasRole(adminUser?.role, 'admin')

  return (
    <div>
      <SectionHeading title="권한·감사" description="운영자 역할을 관리하고 모든 처리 이력을 감사합니다. (ADMN-01~03)" />

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
              return (
                <tr key={op.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                  <Td className="font-bold">{op.name}{isSelf ? ' (나)' : ''}</Td>
                  <Td>{op.email}</Td>
                  <Td>
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
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </TableShell>
      </div>

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
