import { ChevronRight } from 'lucide-react'
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
        <div className="flex flex-col gap-6">
          {HIGHLIGHT_GROUPS.map((group) => {
            const categories = HIGHLIGHT_CATEGORIES.filter((cat) => cat.group === group.id)
            return (
              <div key={group.id}>
                <p className="mb-3 text-[16px] font-bold text-[#0D0D0D]">{group.label}</p>
                <div className="overflow-hidden rounded-[24px] border border-[#DEE4EC] px-4">
                  {categories.map((cat, index) => (
                    <button
                      key={cat.id}
                      onClick={() => onOpenCategory(cat)}
                      className={[
                        'flex w-full items-center gap-4 py-4 text-left',
                        index < categories.length - 1 ? 'border-b border-[#DEE4EC]' : '',
                      ].join(' ')}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center text-[#25313D]">
                        <HighlightIcon id={cat.icon as HighlightIconId} size={20} />
                      </span>
                      <span className="flex-1 text-[14px] font-semibold text-[#0D0D0D]">{cat.label}</span>
                      <ChevronRight size={20} className="shrink-0 text-[#A8B1BD]" />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
