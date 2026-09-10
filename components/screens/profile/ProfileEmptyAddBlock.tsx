'use client'

import { Plus } from 'lucide-react'

/**
 * 오너 뷰에서 섹션이 완전히 비어 있을 때(섹션 0개) 노출하는 "추가하기" 블록.
 * 방문자에게는 렌더하지 않는다 — 빈 섹션은 그대로 숨긴다.
 * 기존 빈 상태(점선 박스 + 회색 안내 문구) 톤을 유지하고 버튼만 얹는다.
 */
export function ProfileEmptyAddBlock({
  label,
  onAdd,
}: {
  label: string
  onAdd: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[16px] border border-dashed border-[#DEE4EC] bg-[var(--color-bg-soft)] px-4 py-8 text-center">
      <p className="text-[13px] text-[#A8B1BD]">{label}</p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1 rounded-full bg-[#0D0D0D] px-3.5 py-2 text-[13px] font-semibold text-white active:opacity-80"
      >
        <Plus size={14} strokeWidth={2.5} />
        추가하기
      </button>
    </div>
  )
}
