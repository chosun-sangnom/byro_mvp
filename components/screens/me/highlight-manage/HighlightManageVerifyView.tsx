'use client'

import { useState, useEffect } from 'react'
import { BadgeCheck, Mail, ShieldCheck, Upload, Loader2, ChevronRight } from 'lucide-react'
import { Button, NavBar, showToast } from '@/components/ui'
import { useFeloreStore } from '@/store/useFeloreStore'
import type { Highlight, HighlightIconId } from '@/types'
import type { HighlightManageCategory } from './constants'

// [임시] 건강보험공단 직장 이력 모의 데이터 (직함 정보는 제공되지 않음)
const MOCK_NHIS_CAREERS = [
  { company: '위에이아이', startYear: '2023', endYear: '', status: '재직 중' as const },
  { company: '크래프톤', startYear: '2020', endYear: '2023', status: '종료' as const },
  { company: '카카오', startYear: '2017', endYear: '2020', status: '종료' as const },
]

const NHIS_INTRO_STEPS = [
  '실명 + 생년월일 확인',
  '건강보험공단 직장가입자 이력 자동 조회',
  '원하는 항목만 선택 후 경력에 추가',
]

// [임시] OCR 파싱 모의 데이터
const MOCK_OCR_EDUCATION = {
  school: '고려대학교',
  schoolType: '대학교' as const,
  major: '경영학과',
  degree: '학사',
  status: '졸업' as const,
  startYear: '2013',
  endYear: '2017',
}

// [임시] 이메일 인증 모의 코드
const MOCK_EMAIL_CODE = '123456'

interface VerifyViewProps {
  selectedCat: HighlightManageCategory
  existingHighlights: Highlight[]
  initialMethod?: 'ocr' | 'email'
  onBack: () => void
  onImportCareers: (items: Array<Omit<Highlight, 'id'>>) => void
  onVerifyHighlight: (id: string) => void
  onAddHighlight: (item: Omit<Highlight, 'id'>) => void
}

export function HighlightManageVerifyView(props: VerifyViewProps) {
  if (props.selectedCat.id === 'career-role') {
    return <CareerVerifyFlow {...props} />
  }
  return <EducationVerifyFlow {...props} />
}

// ── 경력 인증 플로우 ──────────────────────────────────────────────────────────

type CareerStep = 'identity' | 'loading' | 'select' | 'details' | 'done'

type CareerDetail = { role: string; desc: string }

function CareerVerifyFlow({ selectedCat, onBack, onImportCareers }: VerifyViewProps) {
  const storeUser = useFeloreStore().user
  const [step, setStep] = useState<CareerStep>('identity')
  const [foundCareers, setFoundCareers] = useState<typeof MOCK_NHIS_CAREERS>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [details, setDetails] = useState<Record<number, CareerDetail>>({})
  const [importedCount, setImportedCount] = useState(0)
  const [authMethod, setAuthMethod] = useState<'kakao' | 'pass'>('kakao')
  const [realName, setRealName] = useState(storeUser?.realName ?? '')
  const [birthDateInput, setBirthDateInput] = useState((storeUser?.birthDate ?? '').replace(/\D/g, ''))
  const [phoneInput, setPhoneInput] = useState(
    (storeUser?.contactChannels?.find((c) => c.id === 'phone')?.value ?? '').replace(/\D/g, ''),
  )

  useEffect(() => {
    if (step !== 'loading') return
    const t = setTimeout(() => {
      // [임시] 실제 API 연동 전까지, 빈 결과 상태 UI 확인을 위해 20% 확률로 조회 결과 없음을 시뮬레이션
      setFoundCareers(Math.random() < 0.2 ? [] : MOCK_NHIS_CAREERS)
      setSelected(new Set())
      setStep('select')
    }, 1800)
    return () => clearTimeout(t)
  }, [step])

  const toggleItem = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) { next.delete(i) } else { next.add(i) }
      return next
    })

  const setDetail = (i: number, patch: Partial<CareerDetail>) =>
    setDetails((prev) => ({ ...prev, [i]: { ...(prev[i] ?? { role: '', desc: '' }), ...patch } }))

  const goToDetails = () => {
    if (selected.size === 0) {
      showToast('경력에 추가할 항목을 선택해주세요.', 'error')
      return
    }
    setStep('details')
  }

  const selectedItems = foundCareers.map((c, i) => ({ c, i })).filter(({ i }) => selected.has(i))
  const detailsValid = selectedItems.every(({ i }) => (details[i]?.role ?? '').trim().length > 0)

  const handleConfirm = () => {
    if (!detailsValid) return
    const items = selectedItems.map(({ c, i }) => {
      const detail = details[i] ?? { role: '', desc: '' }
      return {
        categoryId: 'career-role' as const,
        icon: selectedCat.icon as HighlightIconId,
        title: c.company,
        subtitle: `${selectedCat.label} · 건강보험공단 인증`,
        description: detail.desc,
        year: c.status === '재직 중' ? `${c.startYear} - 현재` : `${c.startYear} - ${c.endYear}`,
        verified: true,
        metadata: {
          role: detail.role,
          status: c.status,
          startYear: c.startYear,
          endYear: c.endYear,
          isPrimary: false,
        },
      }
    })
    setImportedCount(items.length)
    onImportCareers(items)
    setStep('done')
  }

  if (step === 'identity') {
    return (
      <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
        <NavBar title="" onBack={onBack} onClose={onBack} />
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-6">
          <div className="mb-10 flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ai-tools/verify-intro-icon.svg" alt="" className="h-9 w-9" />
            <h1 className="text-[22px] font-bold leading-[1.35] text-[#0D0D0D]">건강보험공단 직장 이력 조회</h1>
            <p className="text-[16px] font-medium leading-[1.5] text-[#475058]">
              본인인증으로 실명을 확인한 후<br />건강보험공단 직장가입자 이력을 자동 조회합니다.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 rounded-[24px] border border-[#DEE4EC] p-4">
              {NHIS_INTRO_STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D0D0D] text-[12.5px] font-semibold text-white">
                    {i + 1}
                  </span>
                  <p className="text-[14px] font-medium text-[#475058]">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 rounded-[24px] bg-[#F0F5FF] py-3 pl-3 pr-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ai-tools/ocr-info.svg" alt="" className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 text-[14px] font-medium leading-[1.5] text-[#25313D]">
                건강보험공단에 가입되지 않은 경우(프리랜서 등)에는 이력이 조회되지 않을 수 있습니다. 수동 추가 후 인증 배지 없이 등록할 수 있어요.
              </p>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <p className="text-[14px] font-semibold text-[#0D0D0D]">인증 수단</p>
              <div className="grid grid-cols-2 gap-2">
                {(['kakao', 'pass'] as const).map((method) => {
                  const isSelected = authMethod === method
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setAuthMethod(method)}
                      className={[
                        'flex flex-col items-start gap-2 rounded-[16px] p-3 text-left transition-colors',
                        isSelected ? 'border border-[#0D0D0D] bg-white' : 'border border-transparent bg-[#F5F6F7]',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-7 w-7 items-center justify-center rounded-full',
                          method === 'kakao' ? 'bg-[#FFE400]' : 'bg-[#FF4B4B]',
                        ].join(' ')}
                      >
                        {method === 'kakao' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src="/images/ai-tools/verify-kakao.svg" alt="" className="h-[13px] w-[14px]" />
                        ) : (
                          <ShieldCheck size={14} className="text-white" />
                        )}
                      </span>
                      <div>
                        <p className="text-[14px] font-bold text-[#0D0D0D]">{method === 'kakao' ? '카카오 간편인증' : '통신사 PASS'}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-[#6C7786]">
                          {method === 'kakao' ? '카카오톡으로 본인인증' : 'PASS 앱으로 본인인증'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-[14px] font-semibold text-[#0D0D0D]">실명</p>
                  <input
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="실명"
                    className="w-full rounded-full border border-[#DEE4EC] bg-white px-4 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                  />
                </div>
                <div>
                  <p className="mb-2 text-[14px] font-semibold text-[#0D0D0D]">생년월일</p>
                  <input
                    value={birthDateInput}
                    onChange={(e) => setBirthDateInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    inputMode="numeric"
                    placeholder="19940101"
                    className="w-full rounded-full border border-[#DEE4EC] bg-white px-4 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                  />
                </div>
                <div>
                  <p className="mb-2 text-[14px] font-semibold text-[#0D0D0D]">휴대폰번호</p>
                  <input
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    inputMode="numeric"
                    placeholder="01000000000"
                    className="w-full rounded-full border border-[#DEE4EC] bg-white px-4 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 pb-6">
          <Button onClick={() => setStep('loading')}>인증 시작</Button>
        </div>
      </div>
    )
  }

  if (step === 'loading') {
    return (
      <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
        <NavBar title="" onBack={onBack} onClose={onBack} />
        <div className="px-5 pt-2">
          <h1 className="text-[22px] font-bold text-[#0D0D0D]">경력 인증</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ai-tools/ocr-loading-spinner.svg" alt="" className="h-12 w-12 animate-spin" />
          <p className="text-[14px] font-semibold text-[#475058]">건강보험공단 직장 이력 조회 중...</p>
        </div>
      </div>
    )
  }

  if (step === 'select') {
    return (
      <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
        <NavBar title="" onBack={() => setStep('identity')} onClose={onBack} />
        <div className="px-5 pt-2 pb-5">
          <h1 className="text-[22px] font-bold text-[#0D0D0D]">경력 인증</h1>
          <p className="mt-2 text-[16px] font-medium leading-[1.5] text-[#475058]">
            조회된 직장 이력이에요. 경력에 추가할 항목을 선택하세요.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5">
          {foundCareers.length === 0 ? (
            <div className="flex flex-col items-center gap-6 py-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ai-tools/exp-empty-icon.svg" alt="" className="h-12 w-12" />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-[14px] font-semibold text-[#475058]">조회된 직장 이력이 없습니다</p>
                <p className="text-[14px] font-medium text-[#6C7786]">경력 추가하기로 직접 경력을 추가할 수 있어요.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {foundCareers.map((c, i) => (
                <button
                  key={c.company}
                  type="button"
                  onClick={() => toggleItem(i)}
                  className={[
                    'flex w-full items-center gap-4 rounded-[24px] px-4 py-4 text-left',
                    selected.has(i) ? 'border border-[#25313D]' : 'border border-[#DEE4EC]',
                  ].join(' ')}
                >
                  {selected.has(i) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/images/ai-tools/verify-radio-selected.svg" alt="" className="h-[18px] w-[18px] shrink-0" />
                  ) : (
                    <span className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-[#DEE4EC]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-[14px] font-semibold text-[#0D0D0D]">{c.company}</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/ai-tools/exp-verified-badge.svg" alt="" className="h-3 w-3 shrink-0" />
                    </div>
                    <p className="mt-0.5 text-[12px] font-semibold text-[#6C7786]">
                      {c.status === '재직 중' ? `${c.startYear} - 현재` : `${c.startYear} - ${c.endYear}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 pb-6">
          <Button onClick={foundCareers.length === 0 ? onBack : goToDetails}>
            {foundCareers.length === 0 ? '확인' : `선택한 ${selected.size}개 경력 가져오기`}
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'details') {
    return (
      <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
        <NavBar title="" onBack={() => setStep('select')} onClose={onBack} />
        <div className="px-5 pt-2 pb-5">
          <h1 className="text-[22px] font-bold text-[#0D0D0D]">경력 인증</h1>
          <p className="mt-2 text-[16px] font-medium leading-[1.5] text-[#475058]">
            건강보험공단 이력에는 직함 정보가 없어요. 각 경력에 직함과 담당 업무를 입력해주세요.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5">
          <div className="flex flex-col gap-3">
            {selectedItems.map(({ c, i }) => {
              const detail = details[i] ?? { role: '', desc: '' }
              return (
                <div key={c.company} className="flex flex-col gap-4 rounded-[24px] border border-[#DEE4EC] p-4">
                  <div>
                    <p className="text-[16px] font-bold text-[#0D0D0D]">{c.company}</p>
                    <p className="mt-0.5 text-[12px] font-semibold text-[#6C7786]">
                      {c.status === '재직 중' ? `${c.startYear} - 현재` : `${c.startYear} - ${c.endYear}`} · 건강보험공단 조회 결과 (수정 불가)
                    </p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center">
                      <span className="text-[14px] font-semibold text-[#0D0D0D]">직함</span>
                      <span className="ml-0.5 mt-0.5 h-[3px] w-[3px] shrink-0 rounded-full bg-[#FF4242]" />
                    </div>
                    <input
                      value={detail.role}
                      onChange={(e) => setDetail(i, { role: e.target.value })}
                      placeholder="직함"
                      className="w-full rounded-full border border-[#DEE4EC] px-4 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-[14px] font-semibold text-[#0D0D0D]">설명</p>
                    <div className="relative rounded-[20px] border border-[#DEE4EC]">
                      <textarea
                        value={detail.desc}
                        onChange={(e) => setDetail(i, { desc: e.target.value })}
                        placeholder="어떤 일을 했는지 적어주세요."
                        maxLength={150}
                        rows={3}
                        className="w-full resize-none rounded-[20px] bg-transparent px-4 pb-6 pt-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                      />
                      <span className="pointer-events-none absolute bottom-2.5 right-4 text-[11px] text-[#A8B1BD]">
                        {detail.desc.length}/150
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="px-5 pb-6">
          <Button onClick={handleConfirm} disabled={!detailsValid}>
            선택한 {selected.size}개 경력 가져오기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
      <NavBar title="" onBack={onBack} onClose={onBack} />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/ai-tools/verify-done-icon.svg" alt="" className="h-12 w-12" />
        <div className="flex flex-col gap-2">
          <p className="text-[22px] font-bold text-[#0D0D0D]">경력 인증이 완료되었어요</p>
          <p className="text-[16px] font-medium text-[#475058]">{importedCount}개 경력이 인증 배지와 함께 추가됐어요.</p>
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onBack}>확인</Button>
      </div>
    </div>
  )
}

// ── 학력 인증 플로우 ──────────────────────────────────────────────────────────

type EducationMethod = 'ocr' | 'email'
type EducationStep =
  | 'method'
  | 'upload' | 'loading-ocr' | 'result'
  | 'email-input' | 'email-sending' | 'email-verify'
  | 'done'

function EducationVerifyFlow({ selectedCat, existingHighlights, initialMethod, onBack, onVerifyHighlight, onAddHighlight }: VerifyViewProps) {
  const [step, setStep] = useState<EducationStep>(initialMethod === 'email' ? 'email-input' : initialMethod === 'ocr' ? 'upload' : 'method')
  const [method, setMethod] = useState<EducationMethod>(initialMethod ?? 'ocr')
  const [emailInput, setEmailInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const ocrResult = MOCK_OCR_EDUCATION

  useEffect(() => {
    if (step !== 'loading-ocr') return
    const t = setTimeout(() => setStep('result'), 2000)
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    if (step !== 'email-sending') return
    const t = setTimeout(() => setStep('email-verify'), 1500)
    return () => clearTimeout(t)
  }, [step])

  const addVerifiedHighlight = (school: string, schoolData: typeof MOCK_OCR_EDUCATION) => {
    const matched = existingHighlights.find((h) => h.title === school)
    if (matched) {
      onVerifyHighlight(matched.id)
    } else {
      onAddHighlight({
        categoryId: 'education-history',
        icon: selectedCat.icon as HighlightIconId,
        title: school,
        subtitle: `학력 · ${schoolData.schoolType}`,
        description: '',
        year: `${schoolData.startYear} - ${schoolData.endYear}`,
        verified: true,
        metadata: {
          role: schoolData.major,
          degree: schoolData.degree,
          schoolType: schoolData.schoolType,
          status: schoolData.status,
          startYear: schoolData.startYear,
          endYear: schoolData.endYear,
          isPrimary: false,
        },
      })
    }
    setStep('done')
  }

  const handleOcrConfirm = () => addVerifiedHighlight(ocrResult.school, ocrResult)

  const handleCodeVerify = () => {
    if (codeInput.trim() === MOCK_EMAIL_CODE) {
      addVerifiedHighlight(ocrResult.school, ocrResult)
    } else {
      setCodeError(true)
    }
  }

  // ── 방법 선택 ──────────────────────────────────────────────────────────────

  if (step === 'method') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="학력 확인" onBack={onBack} />
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-6 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-accent-bg-subtle)]">
              <BadgeCheck size={28} className="text-[var(--color-accent-dark)]" />
            </div>
            <div className="text-[17px] font-bold text-[var(--color-text-strong)]">학력 확인 방법 선택</div>
            <p className="text-sm text-[var(--color-text-secondary)]">편한 방법으로 학력을 인증하세요.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => { setMethod('ocr'); setStep('upload') }}
              className="w-full text-left surface-card rounded-[22px] px-5 py-4 flex items-center gap-4 active:opacity-80"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-bg-subtle)]">
                <Upload size={20} className="text-[var(--color-accent-dark)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[var(--color-text-strong)]">졸업증명서 업로드</p>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">PDF · JPG · PNG 파일 / OCR 자동 파싱</p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-[var(--color-text-tertiary)] opacity-40" />
            </button>

            <button
              onClick={() => { setMethod('email'); setStep('email-input') }}
              className="w-full text-left surface-card rounded-[22px] px-5 py-4 flex items-center gap-4 active:opacity-80"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent-bg-subtle)]">
                <Mail size={20} className="text-[var(--color-accent-dark)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[var(--color-text-strong)]">학교 이메일 인증</p>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">학교 발급 이메일로 인증코드 수신</p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-[var(--color-text-tertiary)] opacity-40" />
            </button>
          </div>

          <p className="text-center text-[11px] leading-5 text-[var(--color-text-tertiary)]">
            인증은 대학교·대학원에 한해 가능하며,<br />
            고등학교는 졸업증명서 업로드만 지원합니다.
          </p>
        </div>
      </div>
    )
  }

  // ── OCR: 업로드 ─────────────────────────────────────────────────────────────

  if (step === 'upload') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="학력 확인 · 졸업증명서" onBack={() => setStep('method')} />
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-6 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-accent-bg-subtle)]">
              <Upload size={28} className="text-[var(--color-accent-dark)]" />
            </div>
            <div className="text-[17px] font-bold text-[var(--color-text-strong)]">졸업증명서 OCR 인증</div>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              대학·대학원 졸업증명서 PDF 또는<br />이미지 파일을 업로드하세요.
            </p>
          </div>
          <div className="w-full surface-card rounded-[22px] px-4 py-4 space-y-3">
            {['졸업증명서 업로드 (PDF / JPG / PNG)', 'OCR로 학교명·전공·졸업연도 자동 파싱', '가입 시 실명·생년월일과 대조 후 인증 배지 부여'].map((label, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg-subtle)] text-[10px] font-bold text-[var(--color-accent-dark)]">
                  {i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>
          <div
            className="w-full rounded-[18px] flex flex-col items-center justify-center gap-2 py-10"
            style={{ border: '2px dashed var(--color-border-default)', background: 'var(--color-bg-soft)' }}
          >
            <Upload size={22} className="text-[var(--color-text-tertiary)]" />
            <p className="text-sm text-[var(--color-text-tertiary)]">PDF / JPG / PNG</p>
          </div>
        </div>
        <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
          <Button onClick={() => setStep('loading-ocr')}>파일 업로드 및 인증 시작</Button>
        </div>
      </div>
    )
  }

  // ── OCR: 로딩 ───────────────────────────────────────────────────────────────

  if (step === 'loading-ocr') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="학력 확인 · 졸업증명서" onBack={() => setStep('method')} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 size={36} className="animate-spin text-[var(--color-accent)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">졸업증명서 OCR 파싱 중...</p>
        </div>
      </div>
    )
  }

  // ── OCR: 결과 확인 ──────────────────────────────────────────────────────────

  if (step === 'result') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="학력 확인 · 졸업증명서" onBack={() => setStep('upload')} />
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5">
          <p className="mb-4 text-[13px] text-[var(--color-text-secondary)]">
            졸업증명서에서 아래 정보를 확인했어요. 맞으면 인증을 완료하세요.
          </p>
          <div className="surface-card rounded-[22px] px-4 py-5 space-y-4">
            {[
              { label: '학교명', value: ocrResult.school },
              { label: '학교 유형', value: ocrResult.schoolType },
              { label: '전공', value: ocrResult.major },
              { label: '학위', value: ocrResult.degree },
              { label: '상태', value: ocrResult.status },
              { label: '재학 기간', value: `${ocrResult.startYear} — ${ocrResult.endYear}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--color-text-tertiary)]">{label}</span>
                <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[var(--color-text-tertiary)]">
            정보가 다를 경우 OCR 파싱 오류일 수 있습니다. 운영자 수동 검토를 요청하세요.
          </p>
        </div>
        <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
          <Button onClick={handleOcrConfirm}>인증 완료</Button>
        </div>
      </div>
    )
  }

  // ── 이메일: 입력 ────────────────────────────────────────────────────────────

  if (step === 'email-input') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="학력 확인 · 이메일" onBack={() => setStep('method')} />
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-6 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-accent-bg-subtle)]">
              <Mail size={28} className="text-[var(--color-accent-dark)]" />
            </div>
            <div className="text-[17px] font-bold text-[var(--color-text-strong)]">학교 이메일 인증</div>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              재학 또는 졸업 후 발급된 학교 이메일로<br />인증코드를 받아 학력을 확인합니다.
            </p>
          </div>

          <div className="w-full surface-card rounded-[22px] px-4 py-4 space-y-3">
            {['학교 발급 이메일 주소 입력', '이메일로 6자리 인증코드 발송', '코드 입력 후 학력 확인 배지 부여'].map((label, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg-subtle)] text-[10px] font-bold text-[var(--color-accent-dark)]">
                  {i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-[var(--color-text-secondary)]">학교 이메일</p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="예: hong@korea.ac.kr"
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)]"
            />
            <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">
              학교에서 발급한 공식 이메일(@university.ac.kr 등)만 사용할 수 있어요.
            </p>
          </div>
        </div>
        <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
          <Button
            onClick={() => setStep('email-sending')}
            disabled={!emailInput.trim() || !emailInput.includes('@')}
          >
            인증코드 발송
          </Button>
        </div>
      </div>
    )
  }

  // ── 이메일: 발송 중 ─────────────────────────────────────────────────────────

  if (step === 'email-sending') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="학력 확인 · 이메일" onBack={() => setStep('email-input')} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 size={36} className="animate-spin text-[var(--color-accent)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">인증코드 발송 중...</p>
        </div>
      </div>
    )
  }

  // ── 이메일: 코드 입력 ───────────────────────────────────────────────────────

  if (step === 'email-verify') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="학력 확인 · 이메일" onBack={() => setStep('email-input')} />
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-6 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-accent-bg-subtle)]">
              <Mail size={28} className="text-[var(--color-accent-dark)]" />
            </div>
            <div className="text-[17px] font-bold text-[var(--color-text-strong)]">인증코드 입력</div>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              <span className="font-semibold text-[var(--color-text-primary)]">{emailInput}</span>로<br />
              발송된 6자리 코드를 입력하세요.
            </p>
          </div>

          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value.replace(/\D/g, '')); setCodeError(false) }}
              placeholder="000000"
              className={`w-full rounded-xl border px-4 py-3 text-center text-[22px] font-bold tracking-[0.35em] outline-none transition-colors ${
                codeError
                  ? 'border-[var(--color-state-danger-text)] bg-[var(--color-state-danger-bg)]'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-soft)] focus:border-[var(--color-accent)]'
              }`}
            />
            {codeError && (
              <p className="mt-2 text-center text-[12px] text-[var(--color-state-danger-text)]">
                코드가 올바르지 않아요. 다시 확인해주세요.
              </p>
            )}
          </div>

          <button
            onClick={() => { setCodeInput(''); setStep('email-sending') }}
            className="text-center text-[13px] font-semibold text-[var(--color-text-tertiary)]"
          >
            코드를 받지 못했나요? 재발송
          </button>

          {/* [임시] 개발용 힌트 */}
          <p className="text-center text-[11px] text-[var(--color-text-tertiary)] opacity-50">
            [임시] 테스트 코드: {MOCK_EMAIL_CODE}
          </p>
        </div>
        <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
          <Button onClick={handleCodeVerify} disabled={codeInput.length !== 6}>
            인증 완료
          </Button>
        </div>
      </div>
    )
  }

  // ── 완료 ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <NavBar title="학력 확인" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-state-success-bg)]">
          <BadgeCheck size={28} className="text-[var(--color-state-success-text)]" />
        </div>
        <div className="text-center">
          <div className="text-[17px] font-bold text-[var(--color-text-strong)]">학력 확인 완료</div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {method === 'email'
              ? `${emailInput} 이메일로 학력이 인증됐어요.`
              : `${ocrResult.school} 학력에 인증 배지가 부여됐어요.`
            }
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
        <Button onClick={onBack}>확인</Button>
      </div>
    </div>
  )
}
