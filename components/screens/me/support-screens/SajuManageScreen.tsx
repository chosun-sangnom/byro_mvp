'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Button, CheckRow, InfoBox, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { useByroStore } from '@/store/useByroStore'
import type { PublicProfileWhoIAm, SajuProfileInput } from '@/types'

const SAJU_TYPES = ['갑목', '을목', '병화', '정화', '무토', '기토', '경금', '신금', '임수', '계수']

function deriveSajuType(profile: SajuProfileInput) {
  if (!profile.birthDate || !profile.birthPlace.trim()) return null
  const seed = `${profile.birthDate}${profile.birthTime}${profile.birthPlace}${profile.calendarType}`
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return SAJU_TYPES[seed % SAJU_TYPES.length]
}

export function SajuManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const baseWhoIAm: PublicProfileWhoIAm = store.user?.whoIAm ?? SAMPLE_PROFILE.whoIAm
  const initialSajuProfile: SajuProfileInput = store.user?.sajuProfile
    ?? SAMPLE_PROFILE.sajuProfile as SajuProfileInput
    ?? {
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      calendarType: 'solar',
      isBirthTimeUnknown: false,
    }
  const [sajuProfile, setSajuProfile] = useState<SajuProfileInput>(initialSajuProfile)

  const nextSajuType = useMemo(
    () => deriveSajuType(sajuProfile) ?? baseWhoIAm.sajuType,
    [baseWhoIAm.sajuType, sajuProfile],
  )

  const handleSave = () => {
    if (!sajuProfile.birthDate || !sajuProfile.birthPlace.trim()) {
      showToast('생년월일과 출생지는 입력해 주세요')
      return
    }
    if (!sajuProfile.isBirthTimeUnknown && !sajuProfile.birthTime) {
      showToast('태어난 시간을 모르시면 체크해 주세요')
      return
    }

    store.updateUserSajuProfile(sajuProfile)
    store.updateUserWhoIAm({
      ...baseWhoIAm,
      sajuType: nextSajuType,
    })
    showToast('사주 정보가 저장됐어요')
    onBack()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 flex-shrink-0 items-center border-b border-[var(--color-border-soft)] px-5">
        <button onClick={onBack} className="mr-3 text-xl leading-none text-[var(--color-text-secondary)]">‹</button>
        <span className="text-base font-black text-[var(--color-text-strong)]">사주 정보 추가</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <InfoBox variant="warn">
          입력한 원본 정보는 공개되지 않고, <span className="font-semibold">궁합 보기</span> 분석에만 사용됩니다.
        </InfoBox>

        <div className="mt-4 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">예상 사주 타입</div>
          <div className="mt-2 text-[20px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">{nextSajuType}</div>
          <p className="mt-1 text-[12px] leading-[1.6] text-[var(--color-text-secondary)]">
            저장하면 궁합 보기 리포트에서 이 값이 반영됩니다.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="생년월일">
            <input
              type="date"
              value={sajuProfile.birthDate}
              onChange={(event) => setSajuProfile((prev) => ({ ...prev, birthDate: event.target.value }))}
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none"
            />
          </Field>

          <Field label="양력 / 음력">
            <div className="flex gap-2">
              {[
                { id: 'solar', label: '양력' },
                { id: 'lunar', label: '음력' },
              ].map((option) => {
                const selected = option.id === sajuProfile.calendarType
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSajuProfile((prev) => ({ ...prev, calendarType: option.id as 'solar' | 'lunar' }))}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{
                      borderColor: selected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                      background: selected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                      color: selected ? '#ffffff' : 'var(--color-text-secondary)',
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </Field>

          <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3">
            <CheckRow
              label="태어난 시간을 모르겠어요"
              sublabel="시간을 모르면 시 정보 없이 계산합니다"
              checked={Boolean(sajuProfile.isBirthTimeUnknown)}
              onToggle={() => setSajuProfile((prev) => ({
                ...prev,
                isBirthTimeUnknown: !prev.isBirthTimeUnknown,
                birthTime: prev.isBirthTimeUnknown ? prev.birthTime : '',
              }))}
            />
          </div>

          <Field label="태어난 시간">
            <input
              type="time"
              value={sajuProfile.birthTime}
              onChange={(event) => setSajuProfile((prev) => ({ ...prev, birthTime: event.target.value }))}
              disabled={Boolean(sajuProfile.isBirthTimeUnknown)}
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none disabled:opacity-50"
            />
          </Field>

          <Field label="출생지">
            <input
              type="text"
              value={sajuProfile.birthPlace}
              onChange={(event) => setSajuProfile((prev) => ({ ...prev, birthPlace: event.target.value }))}
              placeholder="예: 서울, 부산, 대전"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
          </Field>
        </div>
      </div>

      <div className="border-t border-[var(--color-border-soft)] px-5 pb-5 pt-3">
        <Button onClick={handleSave}>저장</Button>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold text-[var(--color-text-secondary)]">{label}</div>
      {children}
    </div>
  )
}
