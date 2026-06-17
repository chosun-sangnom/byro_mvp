import { NavBar } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'
import type { HighlightIconId } from '@/types'
import type { HighlightManageCategory } from './constants'

interface HighlightManagePickerViewProps {
  onBack: () => void
  onOpenCategory: (category: HighlightManageCategory) => void
}

export function HighlightManagePickerView({
  onBack,
  onOpenCategory,
}: HighlightManagePickerViewProps) {
  return (
    <div className="flex flex-col h-full">
      <NavBar title="하이라이트 추가" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-8">
        <div className="space-y-6">
          {HIGHLIGHT_GROUPS.map((group, groupIndex) => (
            <div key={group.id} className={groupIndex > 0 ? 'border-t border-[var(--color-border-soft)] pt-5' : ''}>
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-full bg-[var(--color-bg-muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">{group.label}</div>
                <div className="text-[10px] font-semibold text-[var(--color-text-tertiary)]">
                  {HIGHLIGHT_CATEGORIES.filter((cat) => cat.group === group.id).length}개 항목
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {HIGHLIGHT_CATEGORIES.filter((cat) => cat.group === group.id).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onOpenCategory(cat)}
                    className="settings-row-light relative overflow-visible px-3 py-4 text-center"
                  >
                    <div className="mx-auto mb-2 flex items-center justify-center text-[var(--color-text-secondary)]">
                      <HighlightIcon id={cat.icon as HighlightIconId} size={16} />
                    </div>
                    <div className="text-[12px] font-bold leading-[1.4] text-[var(--color-text-primary)] break-keep">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
