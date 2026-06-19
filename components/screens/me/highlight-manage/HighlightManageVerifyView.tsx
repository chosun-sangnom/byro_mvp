'use client'

import { useState, useEffect } from 'react'
import { BadgeCheck, Mail, ShieldCheck, Upload, Loader2, ChevronRight } from 'lucide-react'
import { Button, NavBar } from '@/components/ui'
import type { Highlight, HighlightIconId } from '@/types'
import type { HighlightManageCategory } from './constants'

// [임시] 건강보험공단 직장 이력 모의 데이터
const MOCK_NHIS_CAREERS = [
  { company: '위에이아이', role: '프로덕트 매니저', startYear: '2023', endYear: '', status: '재직 중' as const },
  { company: '크래프톤', role: '프로덕트 디자이너', startYear: '2020', endYear: '2023', status: '종료' as const },
  { company: '카카오', role: '서비스 기획자', startYear: '2017', endYear: '2020', status: '종료' as const },
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

type CareerStep = 'identity' | 'loading' | 'select' | 'done'

function CareerVerifyFlow({ selectedCat, onBack, onImportCareers }: VerifyViewProps) {
  const [step, setStep] = useState<CareerStep>('identity')
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 2]))
  const [importedCount, setImportedCount] = useState(0)

  useEffect(() => {
    if (step !== 'loading') return
    const t = setTimeout(() => setStep('select'), 1800)
    return () => clearTimeout(t)
  }, [step])

  const toggleItem = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) { next.delete(i) } else { next.add(i) }
      return next
    })

  const handleConfirm = () => {
    const items = MOCK_NHIS_CAREERS
      .filter((_, i) => selected.has(i))
      .map((c) => ({
        categoryId: 'career-role' as const,
        icon: selectedCat.icon as HighlightIconId,
        title: c.company,
        subtitle: `${selectedCat.label} · 건강보험공단 인증`,
        description: '',
        year: c.status === '재직 중' ? `${c.startYear} - 현재` : `${c.startYear} - ${c.endYear}`,
        verified: true,
        metadata: {
          role: c.role,
          status: c.status,
          startYear: c.startYear,
          endYear: c.endYear,
          isPrimary: false,
        },
      }))
    setImportedCount(items.length)
    onImportCareers(items)
    setStep('done')
  }

  if (step === 'identity') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="경력 인증" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-accent-bg-subtle)]">
              <ShieldCheck size={28} className="text-[var(--color-accent-dark)]" />
            </div>
            <div className="text-[17px] font-bold text-[var(--color-text-strong)]">건강보험공단 직장 이력 조회</div>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              카카오 본인인증으로 실명을 확인한 후<br />건강보험공단 직장가입자 이력을 자동 조회합니다.
            </p>
          </div>
          <div className="w-full surface-card rounded-[22px] px-4 py-4 space-y-3">
            {['실명 + 생년월일 확인 (카카오)', '건강보험공단 직장가입자 이력 자동 조회', '원하는 항목만 선택 후 경력에 추가'].map((label, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg-subtle)] text-[10px] font-bold text-[var(--color-accent-dark)]">
                  {i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>
          <div className="w-full surface-card rounded-[22px] px-4 py-3">
            <p className="text-[11px] leading-5 text-[var(--color-text-tertiary)]">
              건강보험공단에 가입되지 않은 경우(프리랜서 등)에는 이력이 조회되지 않을 수 있습니다. 수동 추가 후 인증 배지 없이 등록할 수 있어요.
            </p>
          </div>
        </div>
        <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
          <Button onClick={() => setStep('loading')}>카카오 본인인증 시작</Button>
        </div>
      </div>
    )
  }

  if (step === 'loading') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="경력 인증" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 size={36} className="animate-spin text-[var(--color-accent)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">건강보험공단 직장 이력 조회 중...</p>
        </div>
      </div>
    )
  }

  if (step === 'select') {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="경력 인증" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-4 text-[13px] text-[var(--color-text-secondary)]">
            조회된 직장 이력이에요. 경력에 추가할 항목을 선택하세요.
          </p>
          <div className="space-y-3">
            {MOCK_NHIS_CAREERS.map((c, i) => (
              <button
                key={i}
                onClick={() => toggleItem(i)}
                className={`w-full text-left surface-card rounded-[22px] px-4 py-4 flex items-center gap-3 transition-all ${selected.has(i) ? 'ring-2 ring-[var(--color-accent)]' : ''}`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    selected.has(i)
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                      : 'border-[var(--color-border-default)]'
                  }`}
                >
                  {selected.has(i) && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold text-[var(--color-text-strong)]">{c.company}</div>
                  <div className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
                    {c.role} · {c.status === '재직 중' ? `${c.startYear} - 현재` : `${c.startYear} - ${c.endYear}`}
                  </div>
                </div>
                {selected.has(i) && <BadgeCheck size={16} className="shrink-0 text-[var(--color-accent)]" />}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
          <Button onClick={handleConfirm} disabled={selected.size === 0}>
            선택한 {selected.size}개 경력 가져오기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar title="경력 인증" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-state-success-bg)]">
          <BadgeCheck size={28} className="text-[var(--color-state-success-text)]" />
        </div>
        <div className="text-center">
          <div className="text-[17px] font-bold text-[var(--color-text-strong)]">경력 인증 완료</div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {importedCount}개 경력이 인증 배지와 함께 추가됐어요.
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
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

function EducationVerifyFlow({ selectedCat, existingHighlights, onBack, onVerifyHighlight, onAddHighlight }: VerifyViewProps) {
  const [step, setStep] = useState<EducationStep>('method')
  const [method, setMethod] = useState<EducationMethod>('ocr')
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
        <NavBar title="학력 인증" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-accent-bg-subtle)]">
              <BadgeCheck size={28} className="text-[var(--color-accent-dark)]" />
            </div>
            <div className="text-[17px] font-bold text-[var(--color-text-strong)]">학력 인증 방법 선택</div>
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
        <NavBar title="학력 인증 · 졸업증명서" onBack={() => setStep('method')} />
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center justify-center gap-6">
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
        <NavBar title="학력 인증 · 졸업증명서" onBack={() => setStep('method')} />
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
        <NavBar title="학력 인증 · 졸업증명서" onBack={() => setStep('upload')} />
        <div className="flex-1 overflow-y-auto px-5 py-5">
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
        <NavBar title="학력 인증 · 이메일" onBack={() => setStep('method')} />
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
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
            {['학교 발급 이메일 주소 입력', '이메일로 6자리 인증코드 발송', '코드 입력 후 학력 인증 배지 부여'].map((label, i) => (
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
        <NavBar title="학력 인증 · 이메일" onBack={() => setStep('email-input')} />
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
        <NavBar title="학력 인증 · 이메일" onBack={() => setStep('email-input')} />
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
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
      <NavBar title="학력 인증" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-state-success-bg)]">
          <BadgeCheck size={28} className="text-[var(--color-state-success-text)]" />
        </div>
        <div className="text-center">
          <div className="text-[17px] font-bold text-[var(--color-text-strong)]">학력 인증 완료</div>
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
