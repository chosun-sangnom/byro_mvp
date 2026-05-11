'use client'

import { useState } from 'react'
import { Button, InfoBox, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { useByroStore } from '@/store/useByroStore'
import type { PublicProfileWhoIAm } from '@/types'

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

const BLOOD_OPTIONS = ['A형', 'B형', 'O형', 'AB형']
const RELATIONSHIP_OPTIONS = [
  '좋은 대화에 열려 있음',
  '자연스러운 연결 선호',
  '설레는 대화 환영',
  '천천히 알아가는 편',
]
const CHILD_OPTIONS = ['자녀 없음', '자녀 있음']
const RELIGION_OPTIONS = ['무교', '기독교', '천주교', '불교', '기타']

export function WhoIAmManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const [whoIAm, setWhoIAm] = useState<PublicProfileWhoIAm>(store.user?.whoIAm ?? SAMPLE_PROFILE.whoIAm)

  const handleSave = () => {
    store.updateUserWhoIAm(whoIAm)
    showToast('Who I am 정보가 저장됐어요')
    onBack()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 flex-shrink-0 items-center border-b border-[var(--color-border-soft)] px-5">
        <button onClick={onBack} className="mr-3 text-xl leading-none text-[var(--color-text-secondary)]">‹</button>
        <span className="text-base font-black text-[var(--color-text-strong)]">Who I am 편집</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <InfoBox variant="warn">
          사주 타입은 직접 쓰는 값이 아니라, <span className="font-semibold">사주 정보 추가</span>에서 계산되는 결과예요.
        </InfoBox>

        <div className="mt-4 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">사주 타입</div>
          <div className="mt-2 text-[18px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">{whoIAm.sajuType}</div>
          <p className="mt-1 text-[12px] leading-[1.6] text-[var(--color-text-secondary)]">
            프로필에는 이 값만 공개되고, 원본 출생 정보는 공개되지 않습니다.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <SelectionField
            label="MBTI"
            options={MBTI_OPTIONS}
            value={whoIAm.mbti}
            onSelect={(mbti) => setWhoIAm((prev) => ({ ...prev, mbti }))}
          />

          <SelectionField
            label="혈액형"
            options={BLOOD_OPTIONS}
            value={whoIAm.bloodType}
            onSelect={(bloodType) => setWhoIAm((prev) => ({ ...prev, bloodType }))}
          />

          <SelectionField
            label="연애상태"
            options={RELATIONSHIP_OPTIONS}
            value={whoIAm.relationshipStatus}
            onSelect={(relationshipStatus) => setWhoIAm((prev) => ({ ...prev, relationshipStatus }))}
          />

          <SelectionField
            label="자녀"
            options={CHILD_OPTIONS}
            value={whoIAm.children}
            onSelect={(children) => setWhoIAm((prev) => ({ ...prev, children }))}
          />

          <SelectionField
            label="종교"
            options={RELIGION_OPTIONS}
            value={whoIAm.religion}
            onSelect={(religion) => setWhoIAm((prev) => ({ ...prev, religion }))}
          />
        </div>
      </div>

      <div className="border-t border-[var(--color-border-soft)] px-5 pb-5 pt-3">
        <Button onClick={handleSave}>저장</Button>
      </div>
    </div>
  )
}

function SelectionField({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: string[]
  value: string
  onSelect: (value: string) => void
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold text-[var(--color-text-secondary)]">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option === value
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{
                borderColor: selected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                background: selected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                color: selected ? '#ffffff' : 'var(--color-text-secondary)',
              }}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
