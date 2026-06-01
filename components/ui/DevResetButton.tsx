'use client'

// [임시] dev-only 목업 초기화 버튼 — 프로덕션 빌드에는 렌더링되지 않음
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useByroStore } from '@/store/useByroStore'

export default function DevResetButton() {
  const resetToMockDefaults = useByroStore((s) => s.resetToMockDefaults)
  const resetAll = useByroStore((s) => s.resetAll)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (process.env.NODE_ENV !== 'development' || !mounted) return null

  return createPortal(
    <div style={{ position: 'fixed', bottom: 24, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
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
    </div>,
    document.body
  )
}
