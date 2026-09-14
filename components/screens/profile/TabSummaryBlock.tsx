'use client'

import { useState } from 'react'
import { Pencil, Sparkles } from 'lucide-react'
import { BottomSheet, Button, TextArea, showToast } from '@/components/ui'

const SUMMARY_MAX_LENGTH = 80

// AI 도구 정의 — MyFeloreBasicInfoScreen의 AI 성향 채우기와 동일한 "프롬프트 복사 → 외부 AI 실행 → 답변 붙여넣기" 패턴 (SCRUM-122)
const AI_TOOLS = [
  { id: 'chatgpt', name: 'ChatGPT', url: (p: string) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`, iconSrc: '/images/ai-tools/chatgpt.svg' },
  { id: 'claude', name: 'Claude', url: (p: string) => `https://claude.ai/new?q=${encodeURIComponent(p)}`, iconSrc: '/images/ai-tools/claude.png' },
  { id: 'perplexity', name: 'Perplexity', url: (p: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(p)}`, iconSrc: '/images/ai-tools/perplexity.png' },
  { id: 'gemini', name: 'Gemini', url: (p: string) => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`, iconSrc: '/images/ai-tools/gemini.png' },
]

function TabSummarySheet({
  open,
  onClose,
  promptText,
  initialValue,
  onApply,
}: {
  open: boolean
  onClose: () => void
  promptText: string
  initialValue: string
  onApply: (text: string) => void
}) {
  const [pastedText, setPastedText] = useState(initialValue)
  const [promptCopied, setPromptCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText).then(() => {
      setPromptCopied(true)
      showToast('프롬프트가 복사됐어요')
      setTimeout(() => setPromptCopied(false), 2000)
    }).catch(() => {
      showToast('복사하지 못했어요', 'error')
    })
  }

  const handleOpenTool = (tool: typeof AI_TOOLS[number]) => {
    navigator.clipboard.writeText(promptText).catch(() => {})
    window.open(tool.url(promptText), '_blank')
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setPastedText(text.slice(0, SUMMARY_MAX_LENGTH))
        showToast('붙여넣었어요')
      }
    } catch {
      showToast('클립보드를 읽지 못했어요. 직접 붙여넣어 주세요', 'error')
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-4 pb-6 flex flex-col gap-6">
        <div className="flex items-center gap-1">
          <Sparkles size={20} className="text-[var(--color-accent-dark)]" />
          <h3 className="text-[18px] font-bold text-[#0D0D0D]">한 줄 요약 만들기</h3>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <span className="flex-1 text-[14px] font-semibold text-[#0D0D0D]">프롬프트</span>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-[7px] border border-[#DEE4EC] bg-white px-3 py-1 text-[12px] font-semibold text-[#25313D]"
            >
              {promptCopied ? '복사됨' : '복사하기'}
            </button>
          </div>
          <div className="whitespace-pre-wrap rounded-[24px] border border-[#DEE4EC] bg-[#F5F6F7] px-4 py-3 text-[14px] leading-[1.5] text-[#6C7786]">
            {promptText}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-[#0D0D0D]">AI로 바로 열기</span>
          <div className="grid grid-cols-4 gap-2">
            {AI_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleOpenTool(tool)}
                className="flex flex-col items-center gap-1.5 rounded-[16px] border border-[#DEE4EC] py-3 transition-opacity active:opacity-70"
              >
                <span className="flex size-7 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tool.iconSrc} alt={tool.name} className="h-full w-full object-contain" />
                </span>
                <span className="text-[12px] font-medium text-[#25313D]">{tool.name}</span>
              </button>
            ))}
          </div>
          <p className="text-[12px] leading-[1.5] text-[#6C7786]">
            선택하면 프롬프트가 대화창에 자동 입력돼요. 답변을 받은 뒤 아래에 붙여넣으세요.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <span className="flex-1 text-[14px] font-semibold text-[#0D0D0D]">한 줄 요약</span>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="shrink-0 rounded-[7px] border border-[#DEE4EC] bg-white px-3 py-1 text-[12px] font-semibold text-[#25313D]"
            >
              붙여넣기
            </button>
          </div>
          <TextArea
            value={pastedText}
            onChange={(v) => setPastedText(v.slice(0, SUMMARY_MAX_LENGTH))}
            placeholder="AI 답변을 붙여넣거나 직접 작성하세요"
            maxLength={SUMMARY_MAX_LENGTH}
            rows={2}
          />
        </div>

        <Button onClick={() => onApply(pastedText.trim())} disabled={!pastedText.trim()}>
          저장하기
        </Button>
      </div>
    </BottomSheet>
  )
}

/**
 * ME/VIBE/PEOPLE 탭 상단 한 줄 요약 (SCRUM-122). LLM 초안 + 사용자 편집 하이브리드 —
 * 명시적으로 저장한 값만 노출되고, 재생성 전까지 그대로 유지된다.
 */
export function TabSummaryBlock({
  summary,
  isOwner,
  promptText,
  onSave,
}: {
  summary?: string
  isOwner: boolean
  promptText: string
  onSave: (text: string) => void
}) {
  const [sheetOpen, setSheetOpen] = useState(false)

  if (!summary && !isOwner) return null

  return (
    <div className="px-5 pt-4">
      {summary ? (
        <div className="flex items-start gap-2 rounded-[16px] bg-[#F5F6F7] px-4 py-3">
          <p className="flex-1 text-[14px] font-semibold leading-[1.5] text-[#0D0D0D]">{summary}</p>
          {isOwner && (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white"
              aria-label="한 줄 요약 수정"
            >
              <Pencil size={12} className="text-[#6C7786]" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-[16px] border-2 border-dashed border-[#DEE4EC] py-3 text-[13px] font-semibold text-[#6C7786]"
        >
          <Sparkles size={14} />
          AI로 한 줄 요약 만들기
        </button>
      )}

      <TabSummarySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        promptText={promptText}
        initialValue={summary ?? ''}
        onApply={(text) => {
          onSave(text)
          setSheetOpen(false)
          showToast('한 줄 요약이 저장됐어요')
        }}
      />
    </div>
  )
}
