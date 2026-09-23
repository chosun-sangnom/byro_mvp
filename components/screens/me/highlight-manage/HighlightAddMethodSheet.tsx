import { ChevronRight, Mail, PenLine, Upload } from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import type { HighlightManageCategory } from './constants'

type VerifyMethod = 'ocr' | 'email'

interface MethodOption {
  key: string
  icon: React.ReactNode
  title: string
  description: string
  onSelect: () => void
}

interface HighlightAddMethodSheetProps {
  category: HighlightManageCategory | null
  open: boolean
  onClose: () => void
  onDirectInput: () => void
  onVerify: (method?: VerifyMethod) => void
}

export function HighlightAddMethodSheet({ category, open, onClose, onDirectInput, onVerify }: HighlightAddMethodSheetProps) {
  const verifyOptions: MethodOption[] =
    category?.id === 'career-role'
      ? [
          {
            key: 'nhis',
            // eslint-disable-next-line @next/next/no-img-element
            icon: <img src="/images/ai-tools/exp-security.svg" alt="" className="h-[18px] w-[15px]" />,
            title: '건강보험공단으로 불러오기',
            description: '직장 이력을 한 번에 불러오고 인증 표시가 붙어요',
            onSelect: () => onVerify(),
          },
        ]
      : category?.id === 'education-history'
        ? [
            {
              key: 'ocr',
              icon: <Upload size={18} className="text-[#0657FF]" />,
              title: '졸업증명서로 인증하기',
              description: '증명서 사진을 올리면 학교 정보가 채워지고 인증 표시가 붙어요',
              onSelect: () => onVerify('ocr'),
            },
            {
              key: 'email',
              icon: <Mail size={18} className="text-[#0657FF]" />,
              title: '학교 이메일로 인증하기',
              description: '학교 메일로 받은 코드를 입력하면 인증 표시가 붙어요',
              onSelect: () => onVerify('email'),
            },
          ]
        : []

  const options: MethodOption[] = [
    ...verifyOptions,
    {
      key: 'direct',
      icon: <PenLine size={18} className="text-[#25313D]" />,
      title: '직접 입력하기',
      description: '인증 없이 바로 입력해요',
      onSelect: onDirectInput,
    },
  ]

  return (
    <BottomSheet open={open} onClose={onClose}>
      {category && (
        <div className="px-5 pb-2 pt-1">
          <p className="mb-4 text-[18px] font-bold text-[#0D0D0D]">{category.label}을 어떻게 추가할까요?</p>
          <div className="flex flex-col gap-2.5">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={option.onSelect}
                className="flex w-full items-center gap-3 rounded-[16px] border border-[#DEE4EC] bg-white p-4 text-left active:bg-[#F7F8FA]"
              >
                <span
                  className={[
                    'flex size-10 shrink-0 items-center justify-center rounded-[12px]',
                    option.key === 'direct' ? 'bg-[#F2F4F7]' : 'bg-[#F0F5FF]',
                  ].join(' ')}
                >
                  {option.icon}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-bold text-[#0D0D0D]">{option.title}</span>
                  <span className="break-keep text-[12px] leading-[1.5] text-[#6C7786]">{option.description}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-[#A8B1BD]" />
              </button>
            ))}
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
