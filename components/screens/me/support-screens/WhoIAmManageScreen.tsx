'use client'

import { useState } from 'react'
import { Button, InfoBox, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { useByroStore } from '@/store/useByroStore'
import type { PublicProfileLife, PublicProfileWhoIAm } from '@/types'

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

const PET_OPTIONS = ['없음', '강아지', '고양이', '기타']

export function WhoIAmManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const baseWhoIAm: PublicProfileWhoIAm = store.user?.whoIAm ?? SAMPLE_PROFILE.whoIAm
  const baseLife: PublicProfileLife = store.user?.life ?? SAMPLE_PROFILE.life
  const [mbti, setMbti] = useState(baseWhoIAm.mbti)
  const [pet, setPet] = useState(baseLife.daily.pet)
  const [petName, setPetName] = useState(baseLife.daily.petName ?? '')

  const handleSave = () => {
    store.updateUserWhoIAm({
      ...baseWhoIAm,
      mbti,
    })
    store.updateUserLife({
      ...baseLife,
      daily: {
        ...baseLife.daily,
        pet,
        petName: pet === '없음' ? undefined : petName.trim() || undefined,
      },
    })
    showToast('나 정보가 저장됐어요')
    onBack()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 flex-shrink-0 items-center border-b border-[var(--color-border-soft)] px-5">
        <button onClick={onBack} className="mr-3 text-xl leading-none text-[var(--color-text-secondary)]">‹</button>
        <span className="text-base font-black text-[var(--color-text-strong)]">나 편집</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <InfoBox variant="warn">
          MBTI와 반려동물은 공개 프로필의 <span className="font-semibold">나</span> 탭에 노출됩니다.
          궁합과 사주 해석에 쓰는 생년월일, 생시, 출생지는 <span className="font-semibold">기본정보</span>에서 함께 관리합니다.
        </InfoBox>

        <div className="mt-5 space-y-5">
          <SelectionField
            label="MBTI"
            options={MBTI_OPTIONS}
            value={mbti}
            onSelect={setMbti}
          />

          <SelectionField
            label="반려동물"
            options={PET_OPTIONS}
            value={pet}
            onSelect={setPet}
          />

          {pet !== '없음' && (
            <div>
              <div className="mb-2 text-xs font-bold text-[var(--color-text-secondary)]">반려동물 이름</div>
              <input
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                placeholder="예: 몽이"
                className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
              />
            </div>
          )}
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
