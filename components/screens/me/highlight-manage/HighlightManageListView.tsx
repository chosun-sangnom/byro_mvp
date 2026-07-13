import { ChevronRight, Sparkles, Zap } from 'lucide-react'
import { NavBar } from '@/components/ui'
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

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
        <div className="settings-shell mb-5 px-4 py-4">
          <div className="text-[17px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">하이라이트 관리</div>
          <div className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            카테고리별로 항목을 정리하고, 메인으로 보여줄 내용을 선택하세요.
          </div>

          {/* [임시] OCR 자동 입력 버튼 */}
          <button
            type="button"
            onClick={onLlmImport}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] py-3 text-[13px] font-semibold"
            style={{
              background: 'var(--color-accent-bg-subtle)',
              border: '1px solid var(--color-accent-border-soft)',
              color: 'var(--color-accent-dark)',
            }}
          >
            <Sparkles size={14} />
            스크린샷으로 경력 · 학력 자동 채우기
          </button>
        </div>

        <div className="space-y-6">
          {groupedCategoryCards.map((group) => (
            <div key={group.id}>
              <div className="mb-3 flex items-center gap-3">
                <div className="text-sm font-bold text-[var(--color-text-tertiary)]">{group.label}</div>
                <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
              </div>
              {group.items.length > 0 ? (
                <div className="space-y-3">
                  {group.items.map((entry) => (
                    <button
                      key={`${entry.category.id}-${group.id}`}
                      onClick={() => onOpenCategory(entry.category)}
                      className="settings-row-light flex w-full items-center gap-3 px-4 py-4 text-left"
                    >
                      <span className="flex h-11 w-8 shrink-0 items-center justify-center text-[var(--color-text-strong)]">
                        <HighlightIcon id={entry.category.icon as HighlightIconId} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{entry.category.label}</span>
                        </div>
                        <div className="mt-1 text-[15px] font-bold text-[var(--color-text-strong)]">
                          {entry.title}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">{entry.meta}</span>
                          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{entry.countLabel}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--color-text-tertiary)" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-10 text-center text-sm text-[var(--color-text-tertiary)]">
                  아직 {group.label.toLowerCase()} 하이라이트가 없어요
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onOpenPicker}
          className="w-full border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] rounded-xl py-3 text-sm font-semibold text-[var(--color-text-primary)] mt-6"
        >
          + 하이라이트 추가하기
        </button>

        {!isPro && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--color-bg-soft)] px-4 py-3">
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
    </div>
  )
}
