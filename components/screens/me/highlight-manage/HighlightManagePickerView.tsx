import { ChevronRight } from 'lucide-react'
import { NavBar } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'
import type { HighlightIconId } from '@/types'
import type { HighlightManageCategory } from './constants'

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'career-role': '지금 다니는 회사나 거쳐온 회사를 남겨보세요. 맡았던 역할과 기간도 함께 보여줄 수 있어요.',
  'education-history': '다니고 있거나 졸업한 학교를 남겨보세요. 전공과 학위도 함께 적을 수 있어요.',
  activity: '인터뷰나 기사, 강연처럼 밖으로 알려진 활동을 모아보세요. 커뮤니티나 봉사 활동도 좋아요.',
  achievement: '수상 경력이나 자격증, 출판물, 특허처럼 인정받은 결과를 보여주세요.',
}

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
        <p className="mb-4 text-[18px] font-bold leading-[1.4] text-[#0D0D0D]">어떤 하이라이트를 추가할까요?</p>

        <div className="flex flex-col gap-3">
          {HIGHLIGHT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onOpenCategory(cat)}
              className="flex w-full items-center gap-4 rounded-[20px] border border-[#DEE4EC] bg-white p-4 text-left transition-colors active:bg-[#F7F8FA]"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-[16px] bg-[#F2F4F7] text-[#25313D]">
                <HighlightIcon id={cat.icon as HighlightIconId} size={28} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[16px] font-bold text-[#0D0D0D]">{cat.label}</span>
                <span className="break-keep text-[13px] leading-[1.5] text-[#6C7786]">{CATEGORY_DESCRIPTIONS[cat.id]}</span>
              </span>
              <ChevronRight size={20} className="shrink-0 text-[#A8B1BD]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
