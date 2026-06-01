'use client'

// [임시] dev-only 목업 초기화 버튼 — 프로덕션 빌드에는 렌더링되지 않음
import { useByroStore } from '@/store/useByroStore'

export default function DevResetButton() {
  const resetToMockDefaults = useByroStore((s) => s.resetToMockDefaults)
  const resetAll = useByroStore((s) => s.resetAll)

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 items-end">
      <button
        onClick={resetToMockDefaults}
        className="bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:bg-amber-600 active:scale-95 transition-all"
      >
        목업 초기화
      </button>
      <button
        onClick={resetAll}
        className="bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:bg-red-600 active:scale-95 transition-all"
      >
        전체 리셋
      </button>
    </div>
  )
}
