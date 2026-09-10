'use client'

import { Plus } from 'lucide-react'

/**
 * 오너 뷰에서 섹션이 완전히 비어 있을 때(섹션 0개) 노출하는 "탭하여 추가" 블록.
 * 방문자에게는 렌더하지 않는다 — 빈 섹션은 그대로 숨긴다.
 * 박스 전체가 탭 타깃. 점선 테두리 + 흰 배경 + 한 줄 안내.
 */
export function ProfileEmptyAddBlock({
  label,
  onAdd,
}: {
  /** 예: "성향 정보가" / "하이라이트가" — "아직 {label} 없어요"로 조합 */
  label: string
  onAdd: () => void
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-[#CBD3DE] bg-white px-4 py-3.5 text-[13px] transition-colors active:bg-[#F5F6F7]"
    >
      <Plus size={14} strokeWidth={2.5} className="shrink-0 text-[#A8B1BD]" />
      <span className="text-[#6C7786]">아직 {label} 없어요</span>
      <span className="text-[#A8B1BD]">· 탭하여 추가해보세요</span>
    </button>
  )
}
