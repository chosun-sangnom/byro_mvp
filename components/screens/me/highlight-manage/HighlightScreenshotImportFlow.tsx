'use client'

// [임시] OCR 목업 — 실제 구현 시 이미지들을 Felore OCR 모델에 전달하고 JSON 슬롯필링 결과를 받아야 함

import { useRef, useState } from 'react'
import { ImageOff, Plus, X } from 'lucide-react'
import { Button, NavBar, YearPickerSheet, showToast } from '@/components/ui'
import type { OcrEducation } from '@/types'
import { useFeloreStore } from '@/store/useFeloreStore'

const MAX_IMAGES = 5

type Step = 'upload' | 'analyzing' | 'failed' | 'select' | 'details'

type CareerDraft = {
  kind: 'career'
  key: string
  company: string
  role: string
  status: '재직 중' | '종료' | ''
  startYear: string
  endYear: string
}

type EducationDraft = {
  kind: 'education'
  key: string
  school: string
  schoolType: OcrEducation['schoolType']
  major: string
  degree: string
  status: '졸업' | '재학' | '중퇴' | ''
  startYear: string
  endYear: string
}

type Draft = CareerDraft | EducationDraft

// [임시] OCR 결과 목업 — 연도·상태가 인식되지 않은 경우도 함께 보여주기 위해 일부 값을 비워둠
const MOCK_OCR_RESULT: Draft[] = [
  { kind: 'career', key: 'c1', company: '라인플러스', role: '프로덕트 매니저', status: '재직 중', startYear: '2021', endYear: '' },
  { kind: 'career', key: 'c2', company: '쿠팡', role: '', status: '', startYear: '', endYear: '' },
  { kind: 'education', key: 'e1', school: '연세대학교', schoolType: '대학교', major: '경영학과', degree: '학사', status: '졸업', startYear: '2012', endYear: '2016' },
]

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index))

function periodLabel(draft: Draft) {
  if (!draft.startYear) return '기간이 인식되지 않았어요'
  const ongoing = draft.status === '재직 중' || draft.status === '재학'
  return `${draft.startYear} - ${ongoing || !draft.endYear ? '현재' : draft.endYear}`
}

function isDraftComplete(draft: Draft) {
  if (!draft.status || !draft.startYear) return false
  if (draft.kind === 'career') {
    return draft.role.trim().length > 0 && (draft.status === '재직 중' || Boolean(draft.endYear))
  }
  return (draft.schoolType === '고등학교' || draft.major.trim().length > 0) && (draft.status === '재학' || Boolean(draft.endYear))
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="mb-2 flex items-center gap-0.5">
      <span className="text-[14px] font-semibold text-[#0D0D0D]">{label}</span>
      {required && <span className="h-[3px] w-[3px] shrink-0 self-start rounded-full bg-[#FF4242]" />}
    </div>
  )
}

function ChipToggle({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            'rounded-[8px] px-3.5 py-1.5 text-[14px] font-bold transition-colors',
            value === option ? 'bg-[#0D0D0D] text-white' : 'bg-[#F5F6F7] text-[#A8B1BD]',
          ].join(' ')}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function YearButton({ value, disabled, onClick }: { value: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2.5 rounded-full border border-[#DEE4EC] bg-white px-4 py-3 text-left disabled:opacity-50"
    >
      <span className={['flex-1 text-[14px]', value ? 'text-[#0D0D0D]' : 'text-[#A8B1BD]'].join(' ')}>{value || 'YYYY.'}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/ai-tools/form-calendar-icon.svg" alt="" className="h-4 w-4 shrink-0" />
    </button>
  )
}

/**
 * 스크린샷(최대 5장) → OCR → 인식된 직장·학교 선택 → 항목별 세부 입력 → 하이라이트 추가.
 * 건강보험공단 경력 인증과 같은 선택 → 세부 입력 흐름을 따른다. 인식 결과는 인증이 아니므로 뱃지는 붙지 않는다.
 */
export function HighlightScreenshotImportFlow({
  isPro,
  freeRemaining,
  onClose,
}: {
  isPro: boolean
  freeRemaining: number
  onClose: () => void
}) {
  const store = useFeloreStore()
  const [step, setStep] = useState<Step>('upload')
  const [images, setImages] = useState<string[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [unrecognizedPeriodKeys, setUnrecognizedPeriodKeys] = useState<Set<string>>(new Set())
  const [yearPicker, setYearPicker] = useState<{ key: string; field: 'startYear' | 'endYear' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return
    const room = MAX_IMAGES - images.length
    if (files.length > room) showToast(`스크린샷은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요`, 'error')
    files.slice(0, room).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setImages((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, dataUrl]))
      }
      reader.readAsDataURL(file)
    })
  }

  const startAnalyze = () => {
    setStep('analyzing')
    // [임시] 실제 OCR 모델 연동 전까지, 실패 상태 UI 확인을 위해 20% 확률로 인식 실패를 시뮬레이션
    setTimeout(() => {
      if (Math.random() < 0.2) {
        setStep('failed')
        return
      }
      setDrafts(MOCK_OCR_RESULT)
      setUnrecognizedPeriodKeys(new Set(MOCK_OCR_RESULT.filter((draft) => !draft.startYear).map((draft) => draft.key)))
      setSelectedKeys(new Set())
      setStep('select')
    }, 1800)
  }

  const toggleSelected = (key: string) =>
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const updateDraft = (key: string, patch: Record<string, string>) =>
    setDrafts((prev) => prev.map((draft) => (draft.key === key ? ({ ...draft, ...patch } as Draft) : draft)))

  const selectedDrafts = drafts.filter((draft) => selectedKeys.has(draft.key))
  const allComplete = selectedDrafts.every(isDraftComplete)
  const overFreeLimit = !isPro && selectedDrafts.length > freeRemaining

  const goToDetails = () => {
    if (selectedDrafts.length === 0) {
      showToast('추가할 항목을 선택해주세요', 'error')
      return
    }
    if (overFreeLimit) {
      showToast(`Free 플랜은 ${freeRemaining}개까지 더 추가할 수 있어요`, 'error')
      return
    }
    setStep('details')
  }

  const handleSave = () => {
    if (!allComplete) return
    selectedDrafts.forEach((draft) => {
      if (draft.kind === 'career') {
        const ongoing = draft.status === '재직 중'
        store.addHighlight({
          categoryId: 'career-role',
          icon: 'briefcase',
          title: draft.company,
          subtitle: '경력 · 스크린샷 자동 입력',
          description: '',
          year: `${draft.startYear} - ${ongoing ? '현재' : draft.endYear}`,
          metadata: { role: draft.role.trim(), status: draft.status, startYear: draft.startYear, endYear: ongoing ? '' : draft.endYear },
        })
      } else {
        const ongoing = draft.status === '재학'
        store.addHighlight({
          categoryId: 'education-history',
          icon: 'book-open',
          title: draft.school,
          subtitle: `학력 · ${draft.schoolType}`,
          description: '',
          year: `${draft.startYear} - ${ongoing ? '현재' : draft.endYear}`,
          metadata: {
            role: draft.major.trim(),
            degree: draft.degree,
            schoolType: draft.schoolType,
            status: draft.status,
            startYear: draft.startYear,
            endYear: ongoing ? '' : draft.endYear,
          },
        })
      }
    })
    showToast(`${selectedDrafts.length}개 하이라이트에 추가됐어요`)
    onClose()
  }

  const shell = (onBack: () => void, body: React.ReactNode, footer?: React.ReactNode) => (
    <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
      <NavBar title="" onBack={onBack} onClose={onClose} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-6 pt-2">{body}</div>
      {footer && <div className="px-5 pb-6">{footer}</div>}
    </div>
  )

  const heading = (title: string, description: string) => (
    <div className="pb-5">
      <h1 className="text-[22px] font-bold text-[#0D0D0D]">{title}</h1>
      <p className="mt-2 break-keep text-[16px] font-medium leading-[1.5] text-[#475058]">{description}</p>
    </div>
  )

  if (step === 'analyzing') {
    return shell(
      () => setStep('upload'),
      <>
        {heading('스크린샷 분석 중', `${images.length}장의 스크린샷에서 경력과 학력을 찾고 있어요.`)}
        <div className="flex flex-col items-center justify-center gap-6 py-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ai-tools/ocr-loading-spinner.svg" alt="" className="h-12 w-12 animate-spin" />
          <p className="text-[14px] font-semibold text-[#475058]">회사명과 학교명을 인식하고 있어요</p>
        </div>
      </>,
    )
  }

  if (step === 'failed') {
    return shell(
      () => setStep('upload'),
      <div className="flex flex-col items-center justify-center gap-6 py-24">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F1]">
          <ImageOff size={22} className="text-[#FF4242]" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-[16px] font-semibold text-[#FF4242]">경력과 학력을 찾지 못했어요</p>
          <p className="text-[14px] font-medium text-[#6C7786]">다른 스크린샷으로 다시 시도해주세요</p>
        </div>
      </div>,
      <Button onClick={() => setStep('upload')}>스크린샷 다시 고르기</Button>,
    )
  }

  if (step === 'select') {
    const groups: Array<{ label: string; items: Draft[] }> = [
      { label: '경력', items: drafts.filter((draft) => draft.kind === 'career') },
      { label: '학력', items: drafts.filter((draft) => draft.kind === 'education') },
    ].filter((group) => group.items.length > 0)
    return shell(
      () => setStep('upload'),
      <>
        {heading('인식된 경력과 학력', '스크린샷에서 찾은 항목이에요. 하이라이트에 추가할 항목을 선택하세요.')}
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-3">
              <p className="text-[14px] font-bold text-[#475058]">{group.label}</p>
              {group.items.map((draft) => {
                const selected = selectedKeys.has(draft.key)
                return (
                  <button
                    key={draft.key}
                    type="button"
                    onClick={() => toggleSelected(draft.key)}
                    className={[
                      'flex w-full items-center gap-4 rounded-[24px] px-4 py-4 text-left',
                      selected ? 'border border-[#25313D]' : 'border border-[#DEE4EC]',
                    ].join(' ')}
                  >
                    {selected ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/images/ai-tools/verify-radio-selected.svg" alt="" className="h-[18px] w-[18px] shrink-0" />
                    ) : (
                      <span className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-[#DEE4EC]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-[#0D0D0D]">
                        {draft.kind === 'career' ? draft.company : draft.school}
                      </p>
                      <p className={['mt-0.5 text-[12px] font-semibold', draft.startYear ? 'text-[#6C7786]' : 'text-[#A8B1BD]'].join(' ')}>
                        {periodLabel(draft)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </>,
      <Button onClick={goToDetails} disabled={selectedDrafts.length === 0}>
        {selectedDrafts.length === 0 ? '항목을 선택해주세요' : `선택한 ${selectedDrafts.length}개 다음`}
      </Button>,
    )
  }

  if (step === 'details') {
    const pickerDraft = yearPicker ? drafts.find((draft) => draft.key === yearPicker.key) : undefined
    return (
      <>
        {shell(
          () => setStep('select'),
          <>
            {heading('세부 정보 입력', '인식된 내용을 확인하고 비어 있는 부분을 채워주세요.')}
            <div className="flex flex-col gap-3">
              {selectedDrafts.map((draft) => {
                const isCareer = draft.kind === 'career'
                const ongoing = draft.status === '재직 중' || draft.status === '재학'
                const missingPeriod = unrecognizedPeriodKeys.has(draft.key)
                return (
                  <div key={draft.key} className="flex flex-col gap-4 rounded-[24px] border border-[#DEE4EC] p-4">
                    <div>
                      <p className="text-[16px] font-bold text-[#0D0D0D]">{isCareer ? draft.company : draft.school}</p>
                      <p className="mt-0.5 text-[12px] font-semibold text-[#6C7786]">
                        스크린샷에서 인식한 {isCareer ? '경력' : '학력'}
                      </p>
                    </div>

                    {isCareer ? (
                      <div>
                        <FieldLabel label="직함" required />
                        <input
                          value={draft.role}
                          onChange={(event) => updateDraft(draft.key, { role: event.target.value })}
                          placeholder="직함"
                          maxLength={20}
                          className="w-full rounded-full border border-[#DEE4EC] px-4 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                        />
                      </div>
                    ) : (
                      draft.schoolType !== '고등학교' && (
                        <div>
                          <FieldLabel label="전공" required />
                          <input
                            value={draft.major}
                            onChange={(event) => updateDraft(draft.key, { major: event.target.value })}
                            placeholder="전공"
                            maxLength={30}
                            className="w-full rounded-full border border-[#DEE4EC] px-4 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                          />
                        </div>
                      )
                    )}

                    <div>
                      <FieldLabel label="현재 상태" required />
                      <ChipToggle
                        options={isCareer ? ['재직 중', '종료'] : ['졸업', '재학', '중퇴']}
                        value={draft.status}
                        onChange={(status) => updateDraft(draft.key, { status })}
                      />
                    </div>

                    <div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <FieldLabel label={isCareer ? '시작 연도' : '입학 연도'} required />
                          <YearButton value={draft.startYear} onClick={() => setYearPicker({ key: draft.key, field: 'startYear' })} />
                        </div>
                        <div>
                          <FieldLabel
                            label={isCareer ? '종료 연도' : draft.status === '중퇴' ? '중퇴 연도' : '졸업 연도'}
                            required={!ongoing}
                          />
                          <YearButton
                            value={ongoing ? '현재' : draft.endYear}
                            disabled={ongoing}
                            onClick={() => setYearPicker({ key: draft.key, field: 'endYear' })}
                          />
                        </div>
                      </div>
                      {missingPeriod && (
                        <p className="mt-2 ml-1 text-[12px] font-medium text-[#6C7786]">기간이 인식되지 않았어요. 직접 선택해주세요.</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>,
          <Button onClick={handleSave} disabled={!allComplete}>
            {allComplete ? `${selectedDrafts.length}개 하이라이트에 추가` : '필수 항목을 입력해주세요'}
          </Button>,
        )}
        <YearPickerSheet
          open={yearPicker !== null}
          onClose={() => setYearPicker(null)}
          title={yearPicker?.field === 'startYear' ? '시작 연도 선택' : '종료 연도 선택'}
          value={pickerDraft && yearPicker ? pickerDraft[yearPicker.field] : ''}
          options={YEAR_OPTIONS}
          onSelect={(year) => {
            if (yearPicker) updateDraft(yearPicker.key, { [yearPicker.field]: year })
            setYearPicker(null)
          }}
        />
      </>
    )
  }

  return shell(
    onClose,
    <>
      {heading('스크린샷으로 한 번에 채우기', `이력서나 링크드인 화면을 최대 ${MAX_IMAGES}장까지 올려주세요. 여러 장에 나뉜 경력과 학력도 한 번에 찾아드려요.`)}
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={handleFilesChange} />

      <div className="grid grid-cols-3 gap-2">
        {images.map((src, index) => (
          <div key={index} className="relative aspect-square overflow-hidden rounded-[16px] bg-[#F5F6F7]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`스크린샷 ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label={`스크린샷 ${index + 1} 삭제`}
              onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[16px] border border-dashed border-[#C8D0DA] bg-[#F5F6F7] text-[#6C7786] active:opacity-70"
          >
            <Plus size={20} />
            <span className="text-[12px] font-semibold">
              {images.length}/{MAX_IMAGES}
            </span>
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-1.5 rounded-[24px] bg-[#F0F5FF] py-3 pl-3 pr-4">
        <div className="flex items-start gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ai-tools/ocr-info.svg" alt="" className="mt-1 h-4 w-4 shrink-0" />
          <p className="flex-1 text-[14px] font-bold leading-[1.35] text-[#25313D]">잘 찍힌 스크린샷이 정확도를 높여요</p>
        </div>
        <ul className="list-disc space-y-0 pl-[21px] text-[14px] font-medium leading-[1.5] text-[#475058]">
          <li>회사명과 학교명이 화면에 잘 보이도록 캡처해주세요.</li>
          <li>입사와 퇴사 연도가 함께 보이면 기간까지 채워드려요.</li>
          <li>인식된 내용은 추가하기 전에 확인하고 고칠 수 있어요.</li>
        </ul>
      </div>
    </>,
    <Button onClick={startAnalyze} disabled={images.length === 0}>
      {images.length === 0 ? '스크린샷을 올려주세요' : `${images.length}장 분석 시작`}
    </Button>,
  )
}
