'use client'

import { useState } from 'react'
import { Pencil, Sparkles } from 'lucide-react'
import { BottomSheet, Button, TextArea, showToast } from '@/components/ui'
import { COVER_AI_GRADIENT, COVER_AI_TINT, useCoverTone } from '@/components/screens/profile/profileCoverTone'

const SUMMARY_MAX_LENGTH = 80

/**
 * ME/VIBE/PEOPLE 탭 상단 한 줄 요약 (SCRUM-122). 기본은 AI 자동 요약(autoSummary)을 보여주고,
 * 오너가 연필로 고친 문장(summary)이 있으면 그걸 우선 노출한다.
 */
export function TabSummaryBlock({
  summary,
  autoSummary,
  isOwner,
  onSave,
}: {
  summary?: string
  autoSummary?: string
  isOwner: boolean
  onSave: (text: string | undefined) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const text = summary ?? autoSummary
  const coverTone = useCoverTone()

  if (!text) return null

  const openEditor = () => {
    setDraft(text)
    setEditing(true)
  }

  const editButton = isOwner && (
    <button
      type="button"
      onClick={openEditor}
      aria-label="한 줄 요약 편집"
      className="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#A8B1BD] active:bg-[#F5F6F7]"
    >
      <Pencil size={13} />
    </button>
  )

  return (
    <div className="px-5 pt-4">
      {coverTone ? (
        // 탭 요약 카드 — AI 그라데이션을 옅게 깐 박스로 아래 섹션들과 구역을 나눈다
        <div
          className="rounded-[16px] border px-4 pb-3.5 pt-3"
          style={{ background: COVER_AI_TINT, borderColor: 'rgba(77,168,255,0.18)' }}
        >
          <div className="flex items-center gap-1">
            {/* ✦는 AI가 쓴 문장일 때만 — 오너가 직접 고친 문장은 아이콘 없이 라벨만 */}
            {summary ? (
              <span className="text-[12px] font-bold text-[#6C7786]">한 줄 요약</span>
            ) : (
              <>
                <Sparkles size={12} className="text-[#4DA8FF]" />
                <span
                  className="text-[12px] font-bold"
                  style={{ backgroundImage: COVER_AI_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  한 줄 요약
                </span>
              </>
            )}
            {/* 자동 요약 안내는 기존과 같이 오너에게만 */}
            {isOwner && !summary && <span className="ml-1 text-[11px] font-medium text-[#A8B1BD]">AI가 자동으로 요약했어요</span>}
            <span className="ml-auto">{editButton}</span>
          </div>
          <p className="mt-1.5 text-[15px] font-semibold leading-[1.5] tracking-[-0.01em] text-[#0D0D0D]" style={{ wordBreak: 'keep-all' }}>
            {text}
          </p>
        </div>
      ) : (
      <div className="rounded-[16px] border border-[#DEE4EC] bg-white px-4 py-3">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-[14px] font-semibold leading-[1.5] text-[#0D0D0D]">{text}</p>
          {editButton}
        </div>
        {isOwner && !summary && (
          <div className="mt-1.5 flex items-center gap-1">
            <span
              className="flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundImage: 'linear-gradient(110deg, #0088FF 0%, #34C759 100%)' }}
            >
              <Sparkles size={9} />AI
            </span>
            <span className="text-[11px] font-medium text-[#A8B1BD]">자동으로 요약했어요</span>
          </div>
        )}
      </div>
      )}

      <BottomSheet open={editing} onClose={() => setEditing(false)}>
        <div className="flex flex-col gap-4 px-5 pb-6">
          <div>
            <h3 className="text-[18px] font-bold text-[#0D0D0D]">한 줄 요약 편집</h3>
            <p className="mt-1 text-[13px] leading-[1.5] text-[#6C7786]">
              AI가 탭 내용을 바탕으로 요약해요. 직접 고치면 고친 문장이 노출돼요.
            </p>
          </div>
          <TextArea value={draft} onChange={setDraft} maxLength={SUMMARY_MAX_LENGTH} rows={2} />
          <Button
            disabled={!draft.trim()}
            onClick={() => {
              const value = draft.trim()
              onSave(value === autoSummary ? undefined : value)
              setEditing(false)
              showToast('한 줄 요약이 저장됐어요')
            }}
          >
            저장
          </Button>
          {summary && autoSummary && (
            <button
              type="button"
              onClick={() => {
                onSave(undefined)
                setEditing(false)
                showToast('AI 요약으로 되돌렸어요')
              }}
              className="flex items-center justify-center gap-1 text-[13px] font-semibold text-[#6C7786]"
            >
              <Sparkles size={12} />
              AI 요약으로 되돌리기
            </button>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
