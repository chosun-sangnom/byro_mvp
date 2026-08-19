import { Mail, Plus, Upload } from 'lucide-react'
import { Button, NavBar, showToast } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { getHighlightMetaParts, isPrimaryHighlight } from '@/lib/highlightMeta'
import type { Highlight, HighlightIconId } from '@/types'
import type { HighlightManageCategory } from './constants'

const VERIFIABLE_CATEGORIES = new Set(['career-role', 'education-history'])

function VerifyButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-[10px] bg-white py-3 pl-3 pr-4"
      style={{
        border: '1px solid transparent',
        backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(90deg, #00ADFF, #0657FF)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      {icon}
      <span className="text-[14px] font-bold text-[#0D0D0D]">{label}</span>
    </button>
  )
}

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
  onVerify?: (method?: 'ocr' | 'email') => void
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
  onVerify,
}: HighlightManageCategoryViewProps) {
  const isVerifiable = VERIFIABLE_CATEGORIES.has(selectedCat.id)

  return (
    <div className="flex flex-col h-full">
      <NavBar title={`${selectedCat.label} 관리`} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-6 flex flex-col gap-5 rounded-[24px] border border-[#DEE4EC] p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center text-[#25313D]">
              <HighlightIcon id={selectedCat.icon as HighlightIconId} size={24} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#0D0D0D]">{selectedCat.label}</p>
              <p className="mt-1 text-[12px] font-medium text-[#475058]">여러 항목을 추가하고 메인으로 보여줄 항목을 선택할 수 있어요.</p>
            </div>
          </div>
          {isVerifiable && onVerify && selectedCat.id === 'career-role' && (
            <VerifyButton
              onClick={() => onVerify()}
              icon={<img src="/images/ai-tools/exp-security.svg" alt="" className="h-4 w-[13px]" />}
              label="건강보험 공단으로 경력 인증"
            />
          )}
          {isVerifiable && onVerify && selectedCat.id === 'education-history' && (
            <div className="flex flex-col gap-2">
              <VerifyButton onClick={() => onVerify('ocr')} icon={<Upload size={16} className="text-[#0657FF]" />} label="졸업증명서로 학력 확인" />
              <VerifyButton onClick={() => onVerify('email')} icon={<Mail size={16} className="text-[#0657FF]" />} label="학교 이메일로 학력 확인" />
            </div>
          )}
        </div>

        <p className="mb-3 text-[16px] font-bold text-[#0D0D0D]">전체 {selectedCat.label}</p>

        {selectedCategoryHighlights.length > 0 ? (
          <div className="rounded-[24px] border border-[#DEE4EC] px-4">
            {selectedCategoryHighlights.map((item, index) => {
              const isEditable = editableHighlightIds.has(item.id)
              const metaParts = getHighlightMetaParts(item)
              const isPrimary = isPrimaryHighlight(item, primaryHighlightId)

              return (
                <div
                  key={item.id}
                  className={[
                    'flex flex-col gap-3 py-4',
                    index < selectedCategoryHighlights.length - 1 ? 'border-b border-[#DEE4EC]' : '',
                  ].join(' ')}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1">
                        <p className="truncate text-[14px] font-semibold text-[#0D0D0D]">{item.title}</p>
                        {item.verified && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src="/images/ai-tools/exp-verified-badge.svg" alt="" className="h-3 w-3 shrink-0" />
                        )}
                      </div>
                      {isPrimary ? (
                        <span className="shrink-0 rounded-[6px] bg-[#F0F5FF] px-1.5 py-1 text-[12px] font-bold text-[#25313D]">메인 노출 중</span>
                      ) : (
                        <button
                          onClick={() => onSetPrimary(item.id)}
                          className="shrink-0 rounded-[6px] border border-[#DEE4EC] bg-white px-1.5 py-1 text-[12px] font-medium text-[#25313D]"
                        >
                          메인으로 설정
                        </button>
                      )}
                    </div>
                    {metaParts.length > 0 && <p className="text-[12px] font-semibold text-[#6C7786]">{metaParts.join(' · ')}</p>}
                    {item.description?.trim() && (
                      <p className="mt-1 text-[14px] leading-[1.6] text-[#475058]">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        if (isEditable) {
                          onEdit(item)
                          return
                        }
                        showToast('기본 목업 항목은 수정하지 않습니다', 'error')
                      }}
                      className="rounded-[6px] border border-[#DEE4EC] bg-white px-3 py-1.5 text-[12px] font-bold text-[#25313D]"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        if (isEditable) {
                          onDelete(item)
                          return
                        }
                        showToast('기본 목업 항목은 삭제하지 않습니다', 'error')
                      }}
                      className="rounded-[6px] border border-[#DEE4EC] bg-white px-3 py-1.5 text-[12px] font-bold text-[#FF4242]"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 rounded-[24px] py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ai-tools/exp-empty-icon.svg" alt="" className="h-12 w-12" />
            <p className="text-[14px] font-semibold text-[#6C7786]">아직 등록된 {selectedCat.label} 항목이 없어요</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-6">
        <Button onClick={onAdd}>
          <span className="flex items-center justify-center gap-1.5">
            <Plus size={18} />
            {selectedCat.label} 추가
          </span>
        </Button>
      </div>
    </div>
  )
}
