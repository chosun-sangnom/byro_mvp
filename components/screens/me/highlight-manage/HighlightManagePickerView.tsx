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
          {HIGHLIGHT_GROUPS.map((group, groupIndex) => (
            <div key={group.id}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[18px] font-bold text-[#0D0D0D]">{group.label}</p>
                <p className="text-[14px] font-medium text-[#6C7786]">
                  {HIGHLIGHT_CATEGORIES.filter((cat) => cat.group === group.id).length}개 항목
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {HIGHLIGHT_CATEGORIES.filter((cat) => cat.group === group.id).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onOpenCategory(cat)}
                    className="flex h-[84px] flex-col items-center justify-center gap-1.5 rounded-[16px] border border-[#DEE4EC] px-2 text-center"
                  >
                    <span className="flex items-center justify-center text-[#25313D]">
                      <HighlightIcon id={cat.icon as HighlightIconId} size={20} />
                    </span>
                    <span className="text-[12px] font-medium leading-[1.4] text-[#25313D] break-keep">{cat.label}</span>
                  </button>
                ))}
              </div>
              {groupIndex < HIGHLIGHT_GROUPS.length - 1 && <div className="mt-6 h-px bg-[#DEE4EC]" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
