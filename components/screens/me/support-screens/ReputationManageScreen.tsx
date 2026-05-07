'use client'

import { useState } from 'react'
import { useByroStore } from '@/store/useByroStore'
import { Button, Modal, showToast } from '@/components/ui'
import { KEYWORD_GROUPS, SAMPLE_PROFILE } from '@/lib/mockData'

export function ReputationManageScreen({
  currentKeywords,
  onBack,
}: {
  currentKeywords: string[]
  onBack: () => void
}) {
  const store = useByroStore()
  const [keywords, setKeywords] = useState<string[]>([...currentKeywords])
  const [confirmKeyword, setConfirmKeyword] = useState<string | null>(null)

  const getReputationCount = (keyword: string) =>
    SAMPLE_PROFILE.reputationKeywords.find((item) => item.keyword === keyword)?.count ?? 0

  const toggleKeyword = (keyword: string) => {
    if (keywords.includes(keyword)) {
      const count = getReputationCount(keyword)
      if (count > 0) {
        setConfirmKeyword(keyword)
        return
      }
      setKeywords((prev) => prev.filter((item) => item !== keyword))
      return
    }
    if (keywords.length >= 5) {
      showToast('최대 5개까지 선택할 수 있어요')
      return
    }
    setKeywords((prev) => [...prev, keyword])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">평판 키워드 편집</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-xs text-[var(--color-text-tertiary)] mb-4">선택된 키워드는 프로필 카드 안에 노출됩니다. 최대 5개까지 선택할 수 있어요.</div>
        <div className="space-y-4 mb-4">
          {KEYWORD_GROUPS.map((group) => (
            <div key={group.category}>
              <div className="text-xs font-bold text-[var(--color-text-secondary)] mb-2">{group.category}</div>
              <div className="flex flex-wrap gap-1.5">
                {group.keywords.map((keyword) => {
                  const selected = keywords.includes(keyword)
                  return (
                    <button
                      key={keyword}
                      onClick={() => toggleKeyword(keyword)}
                      className={['text-xs px-3 py-1.5 rounded-full border font-semibold', selected ? 'border-[var(--color-accent-dark)] text-white' : 'bg-[var(--color-bg-soft)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]'].join(' ')}
                      style={selected ? { backgroundColor: 'var(--color-accent-dark)' } : undefined}
                    >
                      {keyword}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-[var(--color-border-soft)]">
        <Button onClick={() => { store.updateUserKeywords(keywords); showToast('키워드가 저장됐어요!'); onBack() }}>저장</Button>
      </div>

      <Modal open={confirmKeyword !== null} onClose={() => setConfirmKeyword(null)}>
        <div className="text-center">
          <div className="text-xl mb-3">⚠️</div>
          <div className="text-sm font-black mb-2">누적 평판이 사라져요</div>
          <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
            <span className="font-bold">&ldquo;{confirmKeyword}&rdquo;</span> 키워드에 쌓인{' '}
            <span className="font-bold">{confirmKeyword ? getReputationCount(confirmKeyword) : 0}개</span>의 평판이 영구적으로 삭제돼요.
            <br />
            정말 해제하시겠어요?
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmKeyword(null)}>취소</Button>
            <Button
              onClick={() => {
                if (confirmKeyword) setKeywords((prev) => prev.filter((item) => item !== confirmKeyword))
                setConfirmKeyword(null)
              }}
            >
              해제하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
