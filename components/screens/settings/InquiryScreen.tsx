'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar, Button, TextArea, showToast } from '@/components/ui'
import { useByroStore } from '@/store/useByroStore'
import { useAdminStore } from '@/store/useAdminStore'
import type { TicketCategory } from '@/types/admin'

const INQUIRY_CATEGORIES: TicketCategory[] = ['계정', '결제', '신고', '기타']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function InquiryScreen() {
  const router = useRouter()
  const user = useByroStore((s) => s.user)
  const isLoggedIn = useByroStore((s) => s.isLoggedIn)
  const addTicket = useAdminStore((s) => s.addTicket)

  const [category, setCategory] = useState<TicketCategory | null>(null)
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const valid = category !== null && EMAIL_REGEX.test(email) && content.trim().length > 0

  const handleSubmit = () => {
    if (!category || !valid) return
    addTicket({
      category,
      content: content.trim(),
      authorName: isLoggedIn && user?.name ? user.name : '비회원',
      authorEmail: email.trim(),
    })
    showToast('문의가 접수됐어요')
    router.back()
  }

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="문의하기" onBack={() => router.back()} />

      <div className="px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
          궁금한 점이나 불편한 점을 남겨주시면 답변을 이메일로 보내드려요.
        </p>

        <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-2 uppercase tracking-[0.08em]">문의 유형</p>
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {INQUIRY_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="rounded-xl py-2.5 text-[13px] font-semibold border transition-colors"
              style={{
                borderColor: category === c ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                backgroundColor: category === c ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                color: category === c ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-2 uppercase tracking-[0.08em]">답변받을 이메일</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@byro.io"
          className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-[14px] outline-none mb-4"
        />

        <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-2 uppercase tracking-[0.08em]">문의 내용</p>
        <TextArea
          value={content}
          onChange={setContent}
          placeholder="무엇을 도와드릴까요?"
          maxLength={1000}
          rows={5}
        />

        <div className="mt-5">
          <Button onClick={handleSubmit} disabled={!valid}>문의 접수하기</Button>
        </div>
      </div>
    </div>
  )
}
