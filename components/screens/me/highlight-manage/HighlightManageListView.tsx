import { ChevronRight, Zap } from 'lucide-react'
import { NavBar, Button } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import type { HighlightIconId } from '@/types'
import type { HighlightCategoryCardGroup, HighlightManageCategory } from './constants'

const HIGHLIGHT_FREE_LIMIT = 3

interface HighlightManageListViewProps {
  groupedCategoryCards: HighlightCategoryCardGroup[]
  onBack: () => void
  onOpenCategory: (category: HighlightManageCategory) => void
  onOpenPicker: () => void
  // [임시] OCR 클립보드 브릿지 — 스크린샷으로 경력/학력 자동 입력
  onLlmImport: () => void
  isPro: boolean
  freeRemaining: number
  onUpgrade: () => void
}

export function HighlightManageListView({
  groupedCategoryCards,
  onBack,
  onOpenCategory,
  onOpenPicker,
  onLlmImport,
  isPro,
  freeRemaining,
  onUpgrade,
}: HighlightManageListViewProps) {
  return (
    <div className="flex flex-col h-full">
      <NavBar title="하이라이트 관리" onBack={onBack} />

      {!isPro && (
        <div className="mx-5 mt-3 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-4 py-2.5">
          <span
            className="text-[12px] font-semibold"
            style={freeRemaining > 0 ? { color: 'var(--color-text-secondary)' } : { color: 'var(--color-state-danger-text, #ef4444)' }}
          >
            {freeRemaining > 0 ? (
              <>
                슬롯 {freeRemaining}개 남음
                <span className="ml-1.5 font-normal text-[var(--color-text-tertiary)]">· Free 플랜</span>
              </>
            ) : (
              '슬롯이 모두 찼어요'
            )}
          </span>
          <p className="mt-1.5 text-[11px] text-[var(--color-text-tertiary)]">
            Free는 최대 3개, Pro는 무제한이에요
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-4">
        <div className="flex flex-col gap-9">
          <div className="flex flex-col gap-5 rounded-[24px] border border-[#DEE4EC] p-4">
            <div className="flex flex-col gap-1">
              <p className="text-[16px] font-bold text-[#0D0D0D]">하이라이트 관리</p>
              <p className="text-[14px] leading-[1.5] text-[#475058]">
                카테고리별로 항목을 정리하고, 메인으로 보여줄 내용을 선택하세요.
              </p>
            </div>

            {/* [임시] OCR 자동 입력 버튼 */}
            <button
              type="button"
              onClick={onLlmImport}
              className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-white py-3 pl-3 pr-4"
              style={{
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(90deg, #00ADFF, #0657FF)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ai-tools/sparkle-highlight-btn.svg" alt="" className="h-5 w-5" />
              <span className="text-[14px] font-bold text-[#0D0D0D]">스크린샷으로 경력 · 학력 자동 채우기</span>
            </button>
          </div>

          {groupedCategoryCards.map((group) => (
            <div key={group.id} className="flex flex-col gap-3">
              <p className="text-[16px] font-bold text-[#0D0D0D]">{group.label}</p>
              {group.items.length > 0 ? (
                <div className="overflow-hidden rounded-[24px] border border-[#DEE4EC] px-4">
                  {group.items.map((entry, index) => (
                    <button
                      key={`${entry.category.id}-${group.id}`}
                      onClick={() => onOpenCategory(entry.category)}
                      className={[
                        'flex w-full items-center gap-5 py-4 text-left',
                        index < group.items.length - 1 ? 'border-b border-[#DEE4EC]' : '',
                      ].join(' ')}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center text-[#0D0D0D]">
                        <HighlightIcon id={entry.category.icon as HighlightIconId} size={22} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-[#475058]">{entry.category.label}</p>
                        <p className="mt-0.5 truncate text-[14px] font-semibold text-[#0D0D0D]">{entry.title}</p>
                        <p className="mt-0.5 text-[12px] leading-[1.5] text-[#6C7786]">
                          {entry.meta} <span className="font-semibold text-[#25313D]">{entry.countLabel}</span>
                        </p>
                      </div>
                      <ChevronRight size={24} className="shrink-0 text-[#A8B1BD]" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#DEE4EC] px-4 py-10 text-center text-[13px] text-[#A8B1BD]">
                  아직 {group.label.toLowerCase()} 하이라이트가 없어요
                </div>
              )}
            </div>
          ))}
        </div>

        {!isPro && (
          <div className="mt-6 flex items-center justify-between rounded-xl bg-[var(--color-bg-soft)] px-4 py-3">
            <div>
              <p className="text-[12px] font-semibold text-[var(--color-text-secondary)]">Free · {HIGHLIGHT_FREE_LIMIT}개 슬롯</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">최대 {HIGHLIGHT_FREE_LIMIT}개까지 하이라이트를 추가할 수 있어요</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">Pro는 무제한</p>
            </div>
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ background: 'var(--color-accent-dark)' }}
            >
              <Zap size={11} />
              업그레이드
            </button>
          </div>
        )}
      </div>

      <div className="px-5 pb-6">
        <Button onClick={onOpenPicker}>+ 하이라이트 추가하기</Button>
      </div>
    </div>
  )
}
