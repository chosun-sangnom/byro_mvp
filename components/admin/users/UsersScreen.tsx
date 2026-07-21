'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAdminStore } from '@/store/useAdminStore'
import { AdminCard, EmptyState, SearchInput, SectionHeading, StatusBadge, TableShell, Td, Th } from '@/components/admin/ui'
import UserDetailDrawer from '@/components/admin/users/UserDetailDrawer'
import type { SanctionStatus } from '@/types/admin'

const SANCTION_TONE: Record<SanctionStatus, 'success' | 'warn' | 'danger'> = {
  정상: 'success',
  경고: 'warn',
  일시정지: 'danger',
  영구정지: 'danger',
}

export default function UsersScreen() {
  const users = useAdminStore((s) => s.users)
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
  const selected = users.find((u) => u.linkId === selectedLinkId) ?? null

  useEffect(() => {
    const focus = searchParams.get('focus')
    if (focus) setSelectedLinkId(focus)
  }, [searchParams])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.linkId.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  }, [users, query])

  return (
    <div>
      <SectionHeading title="회원 관리" description="이름/linkId/이메일로 검색하고 제재 상태·탈퇴를 처리합니다. (USER-01~03)" />

      <div className="mb-4 max-w-[380px]">
        <SearchInput value={query} onChange={setQuery} placeholder="이름, linkId, 이메일 검색" />
      </div>

      {filtered.length === 0 ? (
        <AdminCard>
          <EmptyState title="검색 결과가 없어요" description="다른 검색어로 다시 시도해 보세요." />
        </AdminCard>
      ) : (
        <TableShell>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border-soft)' }}>
              <Th>이름</Th>
              <Th>linkId</Th>
              <Th>가입일</Th>
              <Th>플랜</Th>
              <Th>본인인증</Th>
              <Th>제재 상태</Th>
              <Th>받은 신고</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.linkId} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-soft)' }}>
                <Td className="font-bold">{u.name}</Td>
                <Td>@{u.linkId}</Td>
                <Td>{u.joinedAt}</Td>
                <Td>
                  <StatusBadge label={u.isPaidUser ? 'Pro' : 'Free'} tone={u.isPaidUser ? 'info' : 'neutral'} />
                </Td>
                <Td>
                  <StatusBadge label={u.isVerified ? '완료' : '미완료'} tone={u.isVerified ? 'success' : 'neutral'} />
                </Td>
                <Td>
                  <StatusBadge label={u.sanctionStatus} tone={SANCTION_TONE[u.sanctionStatus]} />
                </Td>
                <Td>{u.reportCount}건</Td>
                <Td>
                  <button
                    onClick={() => setSelectedLinkId(u.linkId)}
                    className="text-[12.5px] font-bold"
                    style={{ color: 'var(--color-accent-dark)' }}
                  >
                    상세보기
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <UserDetailDrawer user={selected} onClose={() => setSelectedLinkId(null)} />
    </div>
  )
}
