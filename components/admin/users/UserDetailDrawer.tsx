'use client'

import { useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { Drawer, StatusBadge } from '@/components/admin/ui'
import { Button } from '@/components/ui'
import type { AdminUserRow, SanctionStatus } from '@/types/admin'

const SANCTION_TONE: Record<SanctionStatus, 'success' | 'warn' | 'danger'> = {
  정상: 'success',
  경고: 'warn',
  일시정지: 'danger',
  영구정지: 'danger',
}

const SANCTION_OPTIONS: SanctionStatus[] = ['정상', '경고', '일시정지', '영구정지']

export default function UserDetailDrawer({ user, onClose }: { user: AdminUserRow | null; onClose: () => void }) {
  const setSanction = useAdminStore((s) => s.setSanction)
  const forceWithdraw = useAdminStore((s) => s.forceWithdraw)
  const sanctionHistory = useAdminStore((s) => s.sanctionHistory)

  const [status, setStatus] = useState<SanctionStatus>('정상')
  const [reason, setReason] = useState('')
  const [suspendUntil, setSuspendUntil] = useState('')
  const [withdrawReason, setWithdrawReason] = useState('')
  const [showWithdraw, setShowWithdraw] = useState(false)

  if (!user) return null
  const history = sanctionHistory.filter((h) => h.linkId === user.linkId)

  return (
    <Drawer open={!!user} onClose={onClose} title="회원 상세">
      <div className="mb-5">
        <div className="text-[16px] font-black" style={{ color: 'var(--color-text-strong)' }}>
          {user.name}
        </div>
        <div className="text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>
          @{user.linkId} · {user.email}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <StatusBadge label={user.isPaidUser ? 'Pro' : 'Free'} tone={user.isPaidUser ? 'info' : 'neutral'} />
          <StatusBadge label={user.isVerified ? '본인인증 완료' : '본인인증 미완료'} tone={user.isVerified ? 'success' : 'neutral'} />
          <StatusBadge label={user.sanctionStatus} tone={SANCTION_TONE[user.sanctionStatus]} />
        </div>
        <div className="mt-2 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
          가입일 {user.joinedAt} · 받은 신고 {user.reportCount}건
        </div>
      </div>

      <div className="mb-5 rounded-2xl border p-4" style={{ borderColor: 'var(--color-border-default)' }}>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
            제재 상태 관리 (USER-02)
          </div>
        </div>

        <div className="mb-2 flex flex-wrap gap-1.5">
          {SANCTION_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatus(opt)}
              className="rounded-full border px-3 py-1.5 text-[12px] font-bold disabled:opacity-40"
              style={{
                borderColor: status === opt ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                backgroundColor: status === opt ? 'var(--color-accent-bg)' : 'transparent',
                color: status === opt ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {status === '일시정지' && (
          <input
            type="date"
            value={suspendUntil}
            onChange={(e) => setSuspendUntil(e.target.value)}
            className="mb-2 w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
            style={{ borderColor: 'var(--color-border-default)' }}
          />
        )}

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="사유 입력 (필수)"
          rows={2}
          className="mb-2 w-full rounded-lg border px-3 py-2 text-[13px] disabled:opacity-50"
          style={{ borderColor: 'var(--color-border-default)' }}
        />

        <Button
          size="sm"
          disabled={!reason.trim()}
          onClick={() => {
            setSanction(user.linkId, status, reason.trim(), suspendUntil || undefined)
            setReason('')
          }}
        >
          제재 상태 적용
        </Button>

        {history.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: 'var(--color-border-soft)' }}>
            {history.map((h) => (
              <div key={h.id} className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{h.status}</span> · {h.reason} · {h.actor} · {h.createdAt}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-state-danger-bg)' }}>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[13px] font-bold" style={{ color: 'var(--color-state-danger-text)' }}>
            탈퇴 처리 (USER-03)
          </div>
        </div>
        {!showWithdraw ? (
          <Button variant="danger" size="sm" onClick={() => setShowWithdraw(true)}>
            운영자 강제 탈퇴
          </Button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder="탈퇴 사유 입력 (필수)"
              rows={2}
              className="w-full rounded-lg border px-3 py-2 text-[13px]"
              style={{ borderColor: 'var(--color-border-default)' }}
            />
            <Button
              variant="danger"
              size="sm"
              disabled={!withdrawReason.trim()}
              onClick={() => {
                forceWithdraw(user.linkId, withdrawReason.trim())
                onClose()
              }}
            >
              탈퇴 확정
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  )
}
