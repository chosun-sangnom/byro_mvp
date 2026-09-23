import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Zap } from 'lucide-react'
import { NavBar } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { getHighlightMetaParts } from '@/lib/highlightMeta'
import type { Highlight, HighlightIconId } from '@/types'
import type { HighlightCategorySection, HighlightManageCategory } from './constants'

const HIGHLIGHT_FREE_LIMIT = 3
const COLLAPSED_ITEM_COUNT = 3

const SECTION_HELPERS: Record<string, string> = {
  'career-role': "회사명과 직함, 재직 기간을 적어주세요. 건강보험공단 인증으로 직장 이력을 한 번에 불러오면 '인증됨' 뱃지가 붙어요.",
  'education-history': "학교명과 전공, 입학과 졸업 연도를 적어주세요. 졸업증명서나 학교 이메일로 확인하면 '확인됨' 뱃지가 붙어요.",
  activity: '인터뷰나 기사, 강연, 방송처럼 밖으로 알려진 활동을 넣어주세요. 커뮤니티나 봉사 활동도 좋아요.',
  achievement: '수상 경력이나 자격증, 출판물, 특허처럼 인정받은 결과를 넣어주세요.',
}

interface HighlightManageListViewProps {
  categorySections: HighlightCategorySection[]
  onBack: () => void
  editableHighlightIds: Set<string>
  onAdd: (category: HighlightManageCategory) => void
  onEdit: (highlight: Highlight) => void
  onDelete: (highlight: Highlight) => void
  onSetPrimary: (category: HighlightManageCategory, highlightId: string) => void
  onBlockedMockItem: (action: '수정' | '삭제') => void
  // [임시] OCR 클립보드 브릿지 — 스크린샷으로 경력/학력 자동 입력
  onLlmImport: () => void
  isPro: boolean
  freeRemaining: number
  onUpgrade: () => void
}

export function HighlightManageListView({
  categorySections,
  onBack,
  editableHighlightIds,
  onAdd,
  onEdit,
  onDelete,
  onSetPrimary,
  onBlockedMockItem,
  onLlmImport,
  isPro,
  freeRemaining,
  onUpgrade,
}: HighlightManageListViewProps) {
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set())
  const toggleExpanded = (categoryId: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const runOnEditable = (item: Highlight, action: '수정' | '삭제', run: () => void) => {
    if (editableHighlightIds.has(item.id)) run()
    else onBlockedMockItem(action)
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar title="하이라이트 관리" onBack={onBack} />

      {!isPro && (
        <div className="mx-5 mt-3 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-4 py-2.5">
          <span
            className="text-[12px] font-semibold"
            style={freeRemaining > 0 ? { color: 'var(--color-text-secondary)' } : { color: 'var(--color-state-danger-text, #ef4444)' }}
          >
            {freeRemaining > 0 ? (
              <>
                슬롯 {freeRemaining}개 남음
                <span className="ml-1.5 font-normal text-[var(--color-text-tertiary)]">· Free 플랜</span>
              </>
            ) : (
              '슬롯이 모두 찼어요'
            )}
          </span>
          <p className="mt-1.5 text-[11px] text-[var(--color-text-tertiary)]">
            Free는 최대 3개, Pro는 무제한이에요
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 rounded-[24px] border border-[#DEE4EC] p-4">
            <div className="flex flex-col gap-1">
              <p className="text-[16px] font-bold text-[#0D0D0D]">스크린샷으로 한 번에 채우기</p>
              <p className="break-keep text-[14px] leading-[1.5] text-[#475058]">
                이력서나 링크드인 화면을 캡처해서 올리면 경력과 학력이 자동으로 입력돼요.
              </p>
            </div>

            {/* [임시] OCR 자동 입력 버튼 */}
            <button
              type="button"
              onClick={onLlmImport}
              className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-white py-3 pl-3 pr-4"
              style={{
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(90deg, #00ADFF, #0657FF)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ai-tools/sparkle-highlight-btn.svg" alt="" className="h-5 w-5" />
              <span className="text-[14px] font-bold text-[#0D0D0D]">스크린샷 올리기</span>
            </button>
          </div>

          {categorySections.map((section) => {
            const isCollapsible = section.items.length > COLLAPSED_ITEM_COUNT
            const isExpanded = expandedCategoryIds.has(section.category.id)
            const visibleItems = isCollapsible && !isExpanded ? section.items.slice(0, COLLAPSED_ITEM_COUNT) : section.items
            return (
              <section key={section.category.id} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="flex items-center gap-1.5 text-[16px] font-bold text-[#0D0D0D]">
                    <span className="text-[#25313D]">
                      <HighlightIcon id={section.category.icon as HighlightIconId} size={18} />
                    </span>
                    {section.category.label}
                  </h2>
                  <p className="break-keep text-[13px] leading-[1.5] text-[#6C7786]">{SECTION_HELPERS[section.category.id]}</p>
                </div>
                <div className="overflow-hidden rounded-[24px] border border-[#DEE4EC] px-4">
                  {section.items.length === 0 ? (
                    <p className="border-b border-[#DEE4EC] py-4 text-[13px] text-[#A8B1BD]">아직 추가한 {section.category.label} 항목이 없어요</p>
                  ) : (
                    visibleItems.map((item) => {
                      const isPrimary = item.id === section.primaryId
                      const metaParts = getHighlightMetaParts(item)
                      return (
                        <div key={item.id} className="flex flex-col gap-3 border-b border-[#DEE4EC] py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <p className="truncate text-[14px] font-semibold text-[#0D0D0D]">{item.title}</p>
                              {item.verified && (
                                <span className="flex shrink-0 items-center gap-0.5">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src="/images/ai-tools/exp-verified-badge.svg" alt="" className="h-3 w-3" />
                                  <span className="text-[11px] font-bold text-[#25313D]">
                                    {item.categoryId === 'career-role' ? '인증됨' : '확인됨'}
                                  </span>
                                </span>
                              )}
                            </div>
                            {metaParts.length > 0 && <p className="text-[12px] font-semibold text-[#6C7786]">{metaParts.join(' · ')}</p>}
                            {item.description?.trim() && (
                              <p className="mt-1 text-[13px] leading-[1.6] text-[#475058]">{item.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {isPrimary ? (
                              <span className="rounded-[6px] bg-[#F0F5FF] px-3 py-1.5 text-[12px] font-bold text-[#25313D]">메인 노출 중</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onSetPrimary(section.category, item.id)}
                                className="rounded-[6px] border border-[#DEE4EC] bg-white px-3 py-1.5 text-[12px] font-medium text-[#25313D]"
                              >
                                메인으로 설정
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => runOnEditable(item, '수정', () => onEdit(item))}
                              className="rounded-[6px] border border-[#DEE4EC] bg-white px-3 py-1.5 text-[12px] font-bold text-[#25313D]"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => runOnEditable(item, '삭제', () => onDelete(item))}
                              className="rounded-[6px] border border-[#DEE4EC] bg-white px-3 py-1.5 text-[12px] font-bold text-[#FF4242]"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                  {isCollapsible && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(section.category.id)}
                      className="flex w-full items-center justify-center gap-1 border-b border-[#DEE4EC] py-3 text-[13px] font-semibold text-[#6C7786]"
                    >
                      {isExpanded ? (
                        <>
                          접기
                          <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          전체보기 {section.items.length}개
                          <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onAdd(section.category)}
                    className="flex w-full items-center justify-center gap-1 py-3.5 text-[14px] font-semibold text-[#25313D]"
                  >
                    <Plus size={16} />
                    {section.category.label} 추가
                  </button>
                </div>
              </section>
            )
          })}
        </div>

        {!isPro && (
          <div className="mt-6 flex items-center justify-between rounded-xl bg-[var(--color-bg-soft)] px-4 py-3">
            <div>
              <p className="text-[12px] font-semibold text-[var(--color-text-secondary)]">Free · {HIGHLIGHT_FREE_LIMIT}개 슬롯</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">최대 {HIGHLIGHT_FREE_LIMIT}개까지 하이라이트를 추가할 수 있어요</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">Pro는 무제한</p>
            </div>
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ background: 'var(--color-accent-dark)' }}
            >
              <Zap size={11} />
              업그레이드
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
