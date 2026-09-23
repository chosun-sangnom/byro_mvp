import { useState } from 'react'
import { Mail, MoreHorizontal, Plus, Upload, Zap } from 'lucide-react'
import { BottomSheet, NavBar } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { getHighlightMetaParts } from '@/lib/highlightMeta'
import type { Highlight, HighlightIconId } from '@/types'
import type { HighlightCategorySection, HighlightManageCategory, HighlightVerifyMethod } from './constants'

const HIGHLIGHT_FREE_LIMIT = 3

const EMPTY_HINTS: Record<string, string> = {
  'career-role': '지금 다니는 회사나 거쳐온 회사를 남겨보세요.',
  'education-history': '다니고 있거나 졸업한 학교를 남겨보세요.',
  activity: '인터뷰나 기사, 강연처럼 밖으로 알려진 활동을 모아보세요.',
  achievement: '수상 경력이나 자격증, 출판물, 특허처럼 인정받은 결과를 보여주세요.',
}

interface HighlightManageListViewProps {
  categorySections: HighlightCategorySection[]
  editableHighlightIds: Set<string>
  onBack: () => void
  onAdd: (category: HighlightManageCategory) => void
  onEdit: (highlight: Highlight) => void
  onDelete: (highlight: Highlight) => void
  onSetPrimary: (category: HighlightManageCategory, highlightId: string) => void
  onVerify: (category: HighlightManageCategory, method?: HighlightVerifyMethod) => void
  // [임시] OCR 클립보드 브릿지 — 스크린샷으로 경력/학력 자동 입력
  onLlmImport: () => void
  onBlockedMockItem: (action: '수정' | '삭제') => void
  isPro: boolean
  freeRemaining: number
  onUpgrade: () => void
}

function VerifyChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-[#C9DAFF] bg-[#F0F5FF] px-3 py-1.5 text-[12px] font-bold text-[#0657FF]"
    >
      {icon}
      {label}
    </button>
  )
}

export function HighlightManageListView({
  categorySections,
  editableHighlightIds,
  onBack,
  onAdd,
  onEdit,
  onDelete,
  onSetPrimary,
  onVerify,
  onLlmImport,
  onBlockedMockItem,
  isPro,
  freeRemaining,
  onUpgrade,
}: HighlightManageListViewProps) {
  const [actionTarget, setActionTarget] = useState<{ category: HighlightManageCategory; item: Highlight; isPrimary: boolean } | null>(null)

  const runOnEditable = (item: Highlight, action: '수정' | '삭제', run: () => void) => {
    if (editableHighlightIds.has(item.id)) run()
    else onBlockedMockItem(action)
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar title="하이라이트 관리" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
        {!isPro && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[var(--color-bg-soft)] px-4 py-3">
            <div>
              <p
                className="text-[12px] font-semibold"
                style={freeRemaining > 0 ? { color: 'var(--color-text-secondary)' } : { color: 'var(--color-state-danger-text, #ef4444)' }}
              >
                {freeRemaining > 0 ? `슬롯 ${freeRemaining}개 남음` : '슬롯이 모두 찼어요'}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                Free는 최대 {HIGHLIGHT_FREE_LIMIT}개, Pro는 무제한이에요
              </p>
            </div>
            <button
              type="button"
              onClick={onUpgrade}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ background: 'var(--color-accent-dark)' }}
            >
              <Zap size={11} />
              업그레이드
            </button>
          </div>
        )}

        {/* [임시] OCR 자동 입력 — 경력과 학력을 한 번에 채우는 최상위 진입점 */}
        <button
          type="button"
          onClick={onLlmImport}
          className="flex w-full items-center gap-3 rounded-[20px] p-4 text-left"
          style={{
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(90deg, #00ADFF, #0657FF)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#F0F5FF]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ai-tools/sparkle-highlight-btn.svg" alt="" className="h-6 w-6" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[15px] font-bold text-[#0D0D0D]">스크린샷으로 한 번에 채우기</span>
            <span className="break-keep text-[12px] leading-[1.5] text-[#6C7786]">
              이력서나 링크드인 화면을 올리면 경력과 학력이 자동으로 입력돼요
            </span>
          </span>
        </button>

        <div className="mt-6 flex flex-col gap-4">
          {categorySections.map(({ category, items, primaryId }) => {
            const isCareer = category.id === 'career-role'
            const isEducation = category.id === 'education-history'
            return (
              <section key={category.id} className="rounded-[24px] border border-[#DEE4EC] px-4 pb-2 pt-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F4F7] text-[#25313D]">
                    <HighlightIcon id={category.icon as HighlightIconId} size={18} />
                  </span>
                  <h2 className="text-[16px] font-bold text-[#0D0D0D]">{category.label}</h2>
                  {items.length > 0 && <span className="text-[14px] font-semibold text-[#A8B1BD]">{items.length}</span>}
                </div>

                {(isCareer || isEducation) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {isCareer && (
                      <VerifyChip
                        onClick={() => onVerify(category)}
                        // eslint-disable-next-line @next/next/no-img-element
                        icon={<img src="/images/ai-tools/exp-security.svg" alt="" className="h-3.5 w-[11px]" />}
                        label="건강보험으로 인증"
                      />
                    )}
                    {isEducation && (
                      <>
                        <VerifyChip onClick={() => onVerify(category, 'ocr')} icon={<Upload size={13} />} label="졸업증명서로 인증" />
                        <VerifyChip onClick={() => onVerify(category, 'email')} icon={<Mail size={13} />} label="학교 이메일로 인증" />
                      </>
                    )}
                  </div>
                )}

                {items.length === 0 ? (
                  <p className="mt-3 break-keep text-[13px] leading-[1.5] text-[#6C7786]">{EMPTY_HINTS[category.id]}</p>
                ) : (
                  <ul className="mt-2">
                    {items.map((item) => {
                      const isPrimary = item.id === primaryId
                      const meta = getHighlightMetaParts(item).join(' · ')
                      return (
                        <li key={item.id} className="flex items-center gap-2 border-b border-[#EEF1F5] py-3 last:border-b-0">
                          <button
                            type="button"
                            onClick={() => runOnEditable(item, '수정', () => onEdit(item))}
                            className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
                          >
                            <span className="flex min-w-0 items-center gap-1.5">
                              <span className="truncate text-[14px] font-semibold text-[#0D0D0D]">{item.title}</span>
                              {item.verified && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src="/images/ai-tools/exp-verified-badge.svg" alt="인증됨" className="h-3 w-3 shrink-0" />
                              )}
                              {isPrimary && items.length > 1 && (
                                <span className="shrink-0 rounded-[4px] bg-[#25313D] px-1.5 py-[1px] text-[10px] font-bold text-white">
                                  메인
                                </span>
                              )}
                            </span>
                            {meta && <span className="truncate text-[12px] text-[#6C7786]">{meta}</span>}
                          </button>
                          <button
                            type="button"
                            aria-label={`${item.title} 더보기`}
                            onClick={() => setActionTarget({ category, item, isPrimary })}
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#A8B1BD]"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => onAdd(category)}
                  className="mb-2 mt-2 flex w-full items-center justify-center gap-1 rounded-[12px] border border-dashed border-[#C8D0DA] py-2.5 text-[13px] font-semibold text-[#475058]"
                >
                  <Plus size={15} />
                  {category.label} 추가
                </button>
              </section>
            )
          })}
        </div>
      </div>

      <BottomSheet open={actionTarget !== null} onClose={() => setActionTarget(null)}>
        {actionTarget && (
          <div className="flex flex-col px-5 pb-2">
            <p className="truncate pb-2 pt-1 text-[15px] font-bold text-[#0D0D0D]">{actionTarget.item.title}</p>
            {!actionTarget.isPrimary && (
              <button
                type="button"
                onClick={() => {
                  onSetPrimary(actionTarget.category, actionTarget.item.id)
                  setActionTarget(null)
                }}
                className="py-3.5 text-left text-[15px] font-semibold text-[#0D0D0D]"
              >
                메인으로 설정
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const { item } = actionTarget
                setActionTarget(null)
                runOnEditable(item, '수정', () => onEdit(item))
              }}
              className="py-3.5 text-left text-[15px] font-semibold text-[#0D0D0D]"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => {
                const { item } = actionTarget
                setActionTarget(null)
                runOnEditable(item, '삭제', () => onDelete(item))
              }}
              className="py-3.5 text-left text-[15px] font-semibold text-[#FF4242]"
            >
              삭제
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
