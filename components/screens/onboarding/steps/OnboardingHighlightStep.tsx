'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { InfoBox, showToast } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { useByroStore } from '@/store/useByroStore'
import { StepFooter, StepIntro } from '@/components/screens/onboarding/OnboardingShared'
import type { HighlightIconId } from '@/types'
import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'
import { getHighlightMetaParts } from '@/lib/highlightMeta'
import { HighlightOnboardingSheet } from '@/components/screens/onboarding/steps/HighlightOnboardingSheet'

export function Step7Highlight() {
  const store = useByroStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const highlightLimitReached = store.highlights.length >= 5

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIntro
          eyebrow="Highlight"
          title={'커리어 하이라이트를\n추가해보세요'}
          description={'인증한 정보와 직접 추가한 경험을\n프로필에 함께 보여줄 수 있어요.'}
        />

        <div className="mb-5">
          <InfoBox>표시 항목은 인증 연동이 가능해요</InfoBox>
        </div>

        {store.highlights.length > 0 && (
          <div className="space-y-2 mb-4">
            {store.highlights.map((highlight) => (
              <div key={highlight.id} className="surface-card flex items-start rounded-[22px] p-3">
                <span className="mr-2 mt-0.5 text-[var(--color-text-strong)]">
                  <HighlightIcon id={highlight.icon as HighlightIconId} size={18} />
                </span>
                <div className="flex-1">
                  <div className="micro-text">
                    {HIGHLIGHT_CATEGORIES.find((item) => item.id === highlight.categoryId)?.label ?? highlight.subtitle}
                  </div>
                  <div className="mt-0.5 text-sm font-bold">{highlight.title}</div>
                  {getHighlightMetaParts(highlight).length > 0 && (
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      {getHighlightMetaParts(highlight).map((part, index) => (
                        <span
                          key={`${highlight.id}-meta-${index}`}
                          className={`text-[11px] ${index === 0 ? 'font-semibold text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'}`}
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => store.removeHighlight(highlight.id)} className="ml-2 mt-0.5 text-[var(--color-state-danger-text)]">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            if (highlightLimitReached) {
              showToast('하이라이트는 최대 5개까지 추가할 수 있어요')
              return
            }
            setSheetOpen(true)
          }}
          disabled={highlightLimitReached}
          className="w-full border border-dashed rounded-xl py-3 text-sm font-medium disabled:opacity-45"
          style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}
        >
          {highlightLimitReached ? '하이라이트 5개를 모두 추가했어요' : '+ 하이라이트 추가하기'}
        </button>
        <div className="micro-text mt-2 text-center">{store.highlights.length}/5</div>
      </div>

      <StepFooter
        canNext={store.highlights.length > 0}
        onNext={() => store.nextStep()}
        onPrev={() => store.prevStep()}
        onSkip={() => store.nextStep()}
        skipLabel="건너뛰기"
      />

      <HighlightOnboardingSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
