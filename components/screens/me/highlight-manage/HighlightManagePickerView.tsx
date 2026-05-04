import { BadgeCheck } from 'lucide-react'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mockData'
import type { HighlightIconId } from '@/types'
import type { HighlightManageCategory } from './constants'

interface HighlightManagePickerViewProps {
  onBack: () => void
  onOpenCategory: (category: HighlightManageCategory) => void
  onOpenCertification: (categoryId: string) => void
}

export function HighlightManagePickerView({
  onBack,
  onOpenCategory,
  onOpenCertification,
}: HighlightManagePickerViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">하이라이트 추가</span>
      </div>

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
                    onClick={() => {
                      if (cat.certificationOnly) {
                        onOpenCertification(cat.id)
                        return
                      }
                      onOpenCategory(cat)
                    }}
                    className="settings-row-light relative overflow-visible px-3 py-4 text-center"
                  >
                    {cat.certificationOnly && (
                      <span className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-state-success-text)]">
                        <BadgeCheck size={14} />
                      </span>
                    )}
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
