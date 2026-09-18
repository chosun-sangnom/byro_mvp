import { ChevronRight } from 'lucide-react'
import { NavBar } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'
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
        <div className="overflow-hidden rounded-[24px] border border-[#DEE4EC] px-4">
          {HIGHLIGHT_CATEGORIES.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => onOpenCategory(cat)}
              className={[
                'flex w-full items-center gap-4 py-4 text-left',
                index < HIGHLIGHT_CATEGORIES.length - 1 ? 'border-b border-[#DEE4EC]' : '',
              ].join(' ')}
            >
              <span className="flex size-9 shrink-0 items-center justify-center text-[#25313D]">
                <HighlightIcon id={cat.icon as HighlightIconId} size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#0D0D0D]">{cat.label}</p>
                {cat.examples && (
                  <p className="mt-0.5 truncate text-[12px] text-[#A8B1BD]">{cat.examples}</p>
                )}
              </div>
              <ChevronRight size={20} className="shrink-0 text-[#A8B1BD]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
