'use client'

// [임시] /v2 목업과 기존 프로필 화면이 같이 쓰는 틀: 맨 위 상태 줄, 하단 탭 3개, 플로팅 버튼.
// 프로필 화면에 들어가도 같은 탭과 버튼이 그대로 보이게 한다.

import type { ReactNode } from 'react'
import { Plus, Sparkles, User, Users, X } from 'lucide-react'
import { V2_MODES, type V2Mode, type V2Tab } from '@/lib/v2Flow'

/** 기획 확인용. 맨 위에 붙어 상태를 바꾼다 */
export function V2ModeBar({ mode, onChange, children }: { mode: V2Mode; onChange: (m: V2Mode) => void; children?: ReactNode }) {
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex h-9 w-full max-w-[430px] items-center gap-1.5 overflow-x-auto px-3 text-[11px]">
        <span className="shrink-0 font-semibold text-amber-700">임시 상태</span>
        {V2_MODES.map(([m, l]) => (
          <button key={m} onClick={() => onChange(m)} className={`shrink-0 rounded-full px-2.5 py-1 ${mode === m ? 'bg-[#25313D] font-semibold text-white' : 'bg-white text-neutral-600'}`}>{l}</button>
        ))}
        {children}
      </div>
    </div>
  )
}

const TABS: { id: V2Tab; label: string; icon: ReactNode }[] = [
  { id: 'today', label: '오늘의 제안', icon: <Sparkles size={22} /> },
  { id: 'people', label: '내 사람들', icon: <Users size={22} /> },
  { id: 'me', label: '마이페이지', icon: <User size={22} /> },
]

/** 하단 탭과 그 위에 떠 있는 플로팅 버튼. fixed면 화면 아래에 붙는다(기존 프로필 화면용) */
export function V2TabBar({ active, onTab, onFab, fabOpen, fixed }: { active: V2Tab | null; onTab: (t: V2Tab) => void; onFab?: () => void; fabOpen?: boolean; fixed?: boolean }) {
  const nav = (
    <nav className="pointer-events-auto flex items-center justify-around border-t border-[var(--color-border-soft)] bg-[var(--color-bg-page)] pb-[max(env(safe-area-inset-bottom),14px)] pt-2">
      {TABS.map((t) => (
        <button key={t.id} onClick={() => onTab(t.id)} className={`flex w-20 flex-col items-center gap-0.5 text-[11px] ${active === t.id ? 'font-semibold text-[var(--color-text-strong)]' : 'text-neutral-400'}`}>
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  )
  const fab = onFab && (
    <button
      onClick={onFab}
      className="pointer-events-auto absolute bottom-[84px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0D0D0D] text-white shadow-xl"
      aria-label="기록하고 말하기"
    >
      {fabOpen ? <X size={24} /> : <Plus size={26} />}
    </button>
  )
  if (fixed) {
    return (
      <div className="pointer-events-none fixed bottom-0 left-1/2 z-[70] w-full max-w-[430px] -translate-x-1/2">
        {fab}
        {nav}
      </div>
    )
  }
  return <>{fab}<div className="shrink-0">{nav}</div></>
}
