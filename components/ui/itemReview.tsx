'use client'

import { useState } from 'react'
import { MessageSquareText } from 'lucide-react'
import { TextArea } from './forms'

export const REVIEW_MAX_LENGTH = 200

/**
 * 바이브 항목(영화·책·음악 등)에 남기는 딥 감상 입력. 선택 입력이라 기본은
 * 접혀 있고, 값이 있거나 사용자가 펼치면 텍스트 영역을 보여준다. (SCRUM-122)
 */
export function ItemReviewField({
  value,
  onChange,
  placeholder = '왜 좋았는지, 뭘 느꼈는지 짧게 남겨보세요',
}: {
  value?: string
  onChange: (review: string | undefined) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(Boolean(value))

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-tertiary)]"
      >
        <MessageSquareText size={11} />
        감상 남기기 (선택)
      </button>
    )
  }

  return (
    <div className="mt-1.5">
      <TextArea
        value={value ?? ''}
        onChange={(v) => onChange(v || undefined)}
        placeholder={placeholder}
        maxLength={REVIEW_MAX_LENGTH}
        rows={2}
      />
      {!value && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-1 text-[10px] font-medium text-[var(--color-text-tertiary)]"
        >
          닫기
        </button>
      )}
    </div>
  )
}
