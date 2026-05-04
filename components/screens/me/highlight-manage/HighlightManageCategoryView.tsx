import { Button, showToast } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { getHighlightMetaParts, isPrimaryHighlight } from '@/lib/highlightMeta'
import type { Highlight, HighlightIconId } from '@/types'
import type { HighlightManageCategory } from './constants'

interface HighlightManageCategoryViewProps {
  selectedCat: HighlightManageCategory
  selectedCategoryHighlights: Highlight[]
  editableHighlightIds: Set<string>
  primaryHighlightId?: string
  onBack: () => void
  onSetPrimary: (highlightId: string) => void
  onEdit: (highlight: Highlight) => void
  onDelete: (highlight: Highlight) => void
  onAdd: () => void
}

export function HighlightManageCategoryView({
  selectedCat,
  selectedCategoryHighlights,
  editableHighlightIds,
  primaryHighlightId,
  onBack,
  onSetPrimary,
  onEdit,
  onDelete,
  onAdd,
}: HighlightManageCategoryViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">{selectedCat.label} 관리</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="surface-card mb-4 rounded-[26px] px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-strong)]">
              <HighlightIcon id={selectedCat.icon as HighlightIconId} size={16} />
            </span>
            <div>
              <div className="text-[15px] font-bold text-[var(--color-text-strong)]">{selectedCat.label}</div>
              <div className="micro-text">여러 항목을 추가하고 메인으로 보여줄 항목을 선택할 수 있어요</div>
            </div>
          </div>
        </div>

        {selectedCategoryHighlights.length > 0 ? (
          <div className="space-y-3">
            {selectedCategoryHighlights.map((item) => {
              const isEditable = editableHighlightIds.has(item.id)
              const metaParts = getHighlightMetaParts(item)

              return (
                <div key={item.id} className="surface-card rounded-[24px] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-bold text-[var(--color-text-strong)]">{item.title}</div>
                      {metaParts.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          {metaParts.map((part, partIndex) => (
                            <span
                              key={`${item.id}-group-meta-${partIndex}`}
                              className={`text-[11px] ${partIndex === 0 ? 'font-semibold text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'}`}
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.description?.trim() && (
                        <p className="mt-3 text-[14px] leading-7 text-[var(--color-text-secondary)]">{item.description}</p>
                      )}
                    </div>
                    {isPrimaryHighlight(item, primaryHighlightId) ? (
                      <span className="rounded-full bg-[#E8F5EC] px-2.5 py-1 text-[11px] font-semibold text-[#217A43]">메인 노출 중</span>
                    ) : (
                      <button
                        onClick={() => onSetPrimary(item.id)}
                        className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]"
                      >
                        메인으로 설정
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        if (isEditable) {
                          onEdit(item)
                          return
                        }
                        showToast('기본 목업 항목은 수정하지 않습니다')
                      }}
                      className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        if (isEditable) {
                          onDelete(item)
                          return
                        }
                        showToast('기본 목업 항목은 삭제하지 않습니다')
                      }}
                      className="rounded-lg border border-[#F2C7C5] px-3 py-1.5 text-xs font-medium text-[#C9473D]"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-10 text-center text-sm text-[var(--color-text-tertiary)]">
            아직 추가한 {selectedCat.label.toLowerCase()} 항목이 없어요
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
        <Button onClick={onAdd}>+ {selectedCat.label} 추가</Button>
      </div>
    </div>
  )
}
