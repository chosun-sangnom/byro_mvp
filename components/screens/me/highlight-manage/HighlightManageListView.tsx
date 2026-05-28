import { useRef } from 'react'
import { BadgeCheck, ChevronRight, ScanLine } from 'lucide-react'
import { NavBar } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import type { HighlightIconId } from '@/types'
import type { HighlightCategoryCardGroup, HighlightManageCategory } from './constants'

interface HighlightManageListViewProps {
  groupedCategoryCards: HighlightCategoryCardGroup[]
  onBack: () => void
  onOpenCategory: (category: HighlightManageCategory) => void
  onOpenCertification: (categoryId: string) => void
  onOpenPicker: () => void
  // [임시] OCR 기능 — ANTHROPIC_API_KEY 설정 후 동작
  onFileSelected: (file: File) => void
  ocrLoading: boolean
}

export function HighlightManageListView({
  groupedCategoryCards,
  onBack,
  onOpenCategory,
  onOpenCertification,
  onOpenPicker,
  onFileSelected,
  ocrLoading,
}: HighlightManageListViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col h-full">
      <NavBar title="하이라이트 관리" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
        <div className="settings-shell mb-5 px-4 py-4">
          <div className="text-[17px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">하이라이트 관리</div>
          <div className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            카테고리별로 항목을 정리하고, 메인으로 보여줄 내용을 선택하세요.
          </div>

          {/* [임시] OCR 자동 입력 — ANTHROPIC_API_KEY 설정 후 동작 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileSelected(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={ocrLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] py-3 text-[13px] font-semibold transition-opacity disabled:opacity-50"
            style={{
              background: 'var(--color-accent-bg-subtle)',
              border: '1px solid var(--color-accent-border-soft)',
              color: 'var(--color-accent-dark)',
            }}
          >
            <ScanLine size={15} />
            {ocrLoading ? '스크린샷 분석 중...' : '링크드인 · 리멤버 스크린샷으로 자동 입력'}
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
                      onClick={() => {
                        if (entry.kind === 'verified') {
                          onOpenCertification(entry.category.id)
                          return
                        }
                        onOpenCategory(entry.category)
                      }}
                      className="settings-row-light flex w-full items-center gap-3 px-4 py-4 text-left"
                    >
                      <span className="flex h-11 w-8 shrink-0 items-center justify-center text-[var(--color-text-strong)]">
                        <HighlightIcon id={entry.category.icon as HighlightIconId} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{entry.category.label}</span>
                          {entry.kind === 'verified' && (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-state-success-text)]">
                              <BadgeCheck size={12} />
                            </span>
                          )}
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
      </div>
    </div>
  )
}
