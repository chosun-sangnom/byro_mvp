'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, User } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { AdminCard, EmptyState, RoleLockNotice, SectionHeading, StatusBadge, hasRole } from '@/components/admin/ui'
import { Button, Chip } from '@/components/ui'
import type { CsTicket, TicketCategory, TicketStatus } from '@/types/admin'

const STATUS_TONE: Record<TicketStatus, 'warn' | 'info' | 'success'> = { 접수: 'warn', '처리 중': 'info', 완료: 'success' }
const CATEGORIES: TicketCategory[] = ['계정', '결제', '신고', '기타']

function TicketRow({ ticket }: { ticket: CsTicket }) {
  const router = useRouter()
  const adminUser = useAdminStore((s) => s.adminUser)
  const updateTicketStatus = useAdminStore((s) => s.updateTicketStatus)
  const replyTicket = useAdminStore((s) => s.replyTicket)
  const canOperate = hasRole(adminUser?.role, 'operator')
  const [reply, setReply] = useState(ticket.reply ?? '')

  return (
    <AdminCard className="mb-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge label={ticket.category} tone="neutral" />
            <StatusBadge label={ticket.status} tone={STATUS_TONE[ticket.status]} />
          </div>
          <div className="mt-1.5 text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {ticket.authorName} <span className="font-normal" style={{ color: 'var(--color-text-tertiary)' }}>{ticket.authorEmail}</span>
          </div>
          <div className="mt-1 text-[13px]" style={{ color: 'var(--color-text-primary)' }}>{ticket.content}</div>
          <div className="mt-1 text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>접수 {ticket.createdAt}{ticket.assignee ? ` · 담당 ${ticket.assignee}` : ''}</div>
        </div>
        {ticket.linkId && (
          <button
            onClick={() => router.push(`/admin/users?focus=${ticket.linkId}`)}
            className="flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[12px] font-bold"
            style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-accent-dark)' }}
          >
            <User size={13} /> 회원 상세
          </button>
        )}
      </div>

      {canOperate ? (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {(['접수', '처리 중', '완료'] as TicketStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => updateTicketStatus(ticket.id, s)}
                className="rounded-full border px-3 py-1 text-[12px] font-bold"
                style={{
                  borderColor: ticket.status === s ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                  backgroundColor: ticket.status === s ? 'var(--color-accent-bg)' : 'transparent',
                  color: ticket.status === s ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="답변 작성 (발송 시 이메일로 전달됩니다)"
            rows={2}
            className="w-full rounded-lg border px-3 py-2 text-[13px]"
            style={{ borderColor: 'var(--color-border-default)' }}
          />
          <Button size="sm" fullWidth={false} disabled={!reply.trim()} onClick={() => replyTicket(ticket.id, reply.trim())}>
            답변 발송
          </Button>
          {ticket.reply && (
            <div className="rounded-lg px-3 py-2 text-[12.5px]" style={{ backgroundColor: 'var(--color-bg-soft)', color: 'var(--color-text-secondary)' }}>
              {ticket.reply} <span style={{ color: 'var(--color-text-tertiary)' }}>· {ticket.repliedAt} 발송</span>
            </div>
          )}
        </div>
      ) : (
        <RoleLockNotice required="operator" />
      )}
    </AdminCard>
  )
}

export default function CsScreen() {
  const tickets = useAdminStore((s) => s.tickets)
  const faq = useAdminStore((s) => s.faq)
  const addFaq = useAdminStore((s) => s.addFaq)
  const removeFaq = useAdminStore((s) => s.removeFaq)
  const [category, setCategory] = useState<TicketCategory | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const filtered = useMemo(() => (category ? tickets.filter((t) => t.category === category) : tickets), [tickets, category])

  return (
    <div>
      <SectionHeading title="문의" description="앱 내 문의 티켓을 관리하고 FAQ를 운영합니다. (CS-01~03)" />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Chip label="전체" selected={category === null} onClick={() => setCategory(null)} />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <AdminCard>
          <EmptyState title="문의가 없어요" />
        </AdminCard>
      ) : (
        filtered.map((t) => <TicketRow key={t.id} ticket={t} />)
      )}

      <div className="mt-8">
        <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>FAQ 관리 (CS-03)</div>
        <AdminCard className="mb-3">
          <div className="mb-2 flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문"
              className="flex-1 rounded-lg border px-3 py-2 text-[13px]"
              style={{ borderColor: 'var(--color-border-default)' }}
            />
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="답변"
            rows={2}
            className="mb-2 w-full rounded-lg border px-3 py-2 text-[13px]"
            style={{ borderColor: 'var(--color-border-default)' }}
          />
          <Button
            size="sm"
            fullWidth={false}
            disabled={!question.trim() || !answer.trim()}
            onClick={() => {
              addFaq(question.trim(), answer.trim())
              setQuestion('')
              setAnswer('')
            }}
          >
            <span className="flex items-center gap-1"><Plus size={14} /> FAQ 등록</span>
          </Button>
        </AdminCard>

        {faq.map((f) => (
          <AdminCard key={f.id} className="mb-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[13.5px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{f.question}</div>
                <div className="mt-1 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>{f.answer}</div>
                <div className="mt-1 text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>수정 {f.updatedAt}</div>
              </div>
              <button onClick={() => removeFaq(f.id)} className="icon-button shrink-0">
                <Trash2 size={15} color="var(--color-state-danger-text)" />
              </button>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}
