import { Button, NavBar, YearPickerSheet } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import type { HighlightIconId } from '@/types'
import type { HighlightManageCategory, YearPickerTarget } from './constants'

interface HighlightFormValues {
  selectedCat: HighlightManageCategory | null
  isEditing: boolean
  hlTitle: string
  hlRole: string
  hlSchoolType: string
  hlDegree: string
  hlStatus: string
  hlStartYear: string
  hlEndYear: string
  hlEducationYear: string
  hlEducationStartYear: string
  hlEducationEndYear: string
  hlSourceLabel: string
  hlLinkUrl: string
  hlDesc: string
  isCareerRole: boolean
  isEducationHistory: boolean
  isPublish: boolean
  isArticleInterview: boolean
  educationNeedsDegree: boolean
  educationNeedsMajor: boolean
  yearPickerTarget: YearPickerTarget | null
  yearOptions: string[]
  saveDisabled: boolean
}

interface HighlightFormActions {
  onBack: () => void
  onSave: () => void
  setHlTitle: (value: string) => void
  setHlRole: (value: string) => void
  setHlSchoolType: (value: string) => void
  setHlDegree: (value: string) => void
  setHlStatus: (value: string) => void
  setHlStartYear: (value: string) => void
  setHlEndYear: (value: string) => void
  setHlEducationYear: (value: string) => void
  setHlEducationStartYear: (value: string) => void
  setHlEducationEndYear: (value: string) => void
  setHlSourceLabel: (value: string) => void
  setHlLinkUrl: (value: string) => void
  setHlDesc: (value: string) => void
  setYearPickerTarget: (value: YearPickerTarget | null) => void
}

interface HighlightManageFormViewProps {
  values: HighlightFormValues
  actions: HighlightFormActions
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="mb-2 flex items-center gap-0.5">
      <span className="text-[14px] font-semibold text-[#0D0D0D]">{label}</span>
      {required && <span className="h-[3px] w-[3px] shrink-0 self-start rounded-full bg-[#FF4242]" />}
    </div>
  )
}

function TextField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-full border border-[#DEE4EC] bg-white px-4 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
    />
  )
}

function ChipToggle({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = value === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={[
              'rounded-[8px] px-3.5 py-1.5 text-[14px] font-bold transition-colors',
              selected ? 'bg-[#0D0D0D] text-white' : 'bg-[#F5F6F7] text-[#A8B1BD]',
            ].join(' ')}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function YearField({
  value,
  placeholder,
  disabled,
  onClick,
}: {
  value: string
  placeholder: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2.5 rounded-full border border-[#DEE4EC] bg-white px-4 py-3 text-left disabled:opacity-50"
    >
      <span className={['flex-1 text-[14px]', value ? 'text-[#0D0D0D]' : 'text-[#A8B1BD]'].join(' ')}>
        {value || placeholder}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/ai-tools/form-calendar-icon.svg" alt="" className="h-4 w-4 shrink-0" />
    </button>
  )
}

export function HighlightManageFormView({
  values,
  actions,
}: HighlightManageFormViewProps) {
  const {
    selectedCat,
    isEditing,
    hlTitle,
    hlRole,
    hlSchoolType,
    hlDegree,
    hlStatus,
    hlStartYear,
    hlEndYear,
    hlEducationYear,
    hlEducationStartYear,
    hlEducationEndYear,
    hlSourceLabel,
    hlLinkUrl,
    hlDesc,
    isCareerRole,
    isEducationHistory,
    isPublish,
    isArticleInterview,
    educationNeedsDegree,
    educationNeedsMajor,
    yearPickerTarget,
    yearOptions,
    saveDisabled,
  } = values

  const filteredYearOptions = (() => {
    if (yearPickerTarget === 'career-end' && hlStartYear) {
      return yearOptions.filter((year) => Number(year) >= Number(hlStartYear))
    }
    if (yearPickerTarget === 'career-start' && hlEndYear) {
      return yearOptions.filter((year) => Number(year) <= Number(hlEndYear))
    }
    if (yearPickerTarget === 'education-end' && hlEducationStartYear) {
      return yearOptions.filter((year) => Number(year) >= Number(hlEducationStartYear))
    }
    if (yearPickerTarget === 'education-start' && hlEducationEndYear) {
      return yearOptions.filter((year) => Number(year) <= Number(hlEducationEndYear))
    }
    return yearOptions
  })()

  const {
    onBack,
    onSave,
    setHlTitle,
    setHlRole,
    setHlSchoolType,
    setHlDegree,
    setHlStatus,
    setHlStartYear,
    setHlEndYear,
    setHlEducationYear,
    setHlEducationStartYear,
    setHlEducationEndYear,
    setHlSourceLabel,
    setHlLinkUrl,
    setHlDesc,
    setYearPickerTarget,
  } = actions

  return (
    <div className="flex flex-col h-full">
      <NavBar title={isEditing ? '하이라이트 수정하기' : '하이라이트 추가하기'} onBack={onBack} />

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5">
        {selectedCat && (
          <div className="mb-6 flex items-start gap-3 rounded-[24px] border border-[#DEE4EC] p-4">
            <span className="flex size-10 shrink-0 items-center justify-center text-[#25313D]">
              <HighlightIcon id={selectedCat.icon as HighlightIconId} size={24} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#0D0D0D]">{selectedCat.label}</p>
              <p className="mt-1 text-[12px] font-medium text-[#475058]">프로필에 직접 입력한 경험으로 표시돼요</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {isEducationHistory && (
            <div>
              <FieldLabel label="학교 유형" required />
              <ChipToggle
                options={['고등학교', '대학교', '대학원']}
                value={hlSchoolType}
                onChange={(schoolType) => {
                  setHlSchoolType(schoolType)
                  setHlDegree('')
                  if (schoolType === '고등학교') setHlRole('')
                }}
              />
            </div>
          )}

          {isEducationHistory && educationNeedsDegree && (
            <div>
              <FieldLabel label="세부 학위" required />
              <ChipToggle
                options={hlSchoolType === '대학교' ? ['전문학사', '학사'] : ['석사', '박사']}
                value={hlDegree}
                onChange={setHlDegree}
              />
            </div>
          )}

          <div>
            <FieldLabel label={isCareerRole ? '회사명' : isEducationHistory ? '학교명' : '제목'} required />
            <TextField
              value={hlTitle}
              onChange={setHlTitle}
              placeholder={isCareerRole ? '회사명' : isEducationHistory ? '학교명' : '제목'}
            />
          </div>

          {(isPublish || isArticleInterview) && (
            <div>
              <FieldLabel label={isPublish ? '출판사 또는 매체명' : '매체명'} />
              <TextField value={hlSourceLabel} onChange={setHlSourceLabel} placeholder={isPublish ? '출판사 또는 매체명' : '매체명'} />
            </div>
          )}

          {isEducationHistory && educationNeedsMajor && (
            <div>
              <FieldLabel label="전공" required />
              <TextField value={hlRole} onChange={setHlRole} placeholder="전공" />
            </div>
          )}

          {isCareerRole && (
            <div>
              <FieldLabel label="직함" required />
              <TextField value={hlRole} onChange={setHlRole} placeholder="직함" />
            </div>
          )}

          {isCareerRole && (
            <div>
              <FieldLabel label="현재 상태" required />
              <ChipToggle options={['재직 중', '종료']} value={hlStatus} onChange={setHlStatus} />
            </div>
          )}

          {isEducationHistory && (
            <div>
              <FieldLabel label="현재 상태" required />
              <ChipToggle options={['졸업', '재학', '중퇴']} value={hlStatus} onChange={setHlStatus} />
            </div>
          )}

          {isCareerRole && (
            <div className="flex gap-2">
              <div className="flex-1">
                <FieldLabel label="시작 연도" required />
                <YearField value={hlStartYear} placeholder="YYYY." onClick={() => setYearPickerTarget('career-start')} />
              </div>
              <div className="flex-1">
                <FieldLabel label="종료 연도" required />
                <YearField
                  value={hlStatus === '재직 중' ? '현재' : hlEndYear}
                  placeholder="YYYY."
                  disabled={hlStatus !== '종료'}
                  onClick={() => setYearPickerTarget('career-end')}
                />
              </div>
            </div>
          )}

          {isEducationHistory && (
            <div className="flex gap-2">
              <div className="flex-1">
                <FieldLabel label="입학 연도" required />
                <YearField value={hlEducationStartYear} placeholder="YYYY." onClick={() => setYearPickerTarget('education-start')} />
              </div>
              <div className="flex-1">
                <FieldLabel label={hlStatus === '중퇴' ? '중퇴 연도' : '졸업 연도'} required />
                <YearField
                  value={hlStatus === '재학' ? '현재' : hlEducationEndYear}
                  placeholder="YYYY."
                  disabled={hlStatus === '재학'}
                  onClick={() => setYearPickerTarget('education-end')}
                />
              </div>
            </div>
          )}

          {(isPublish || isArticleInterview) && !isEducationHistory && !isCareerRole && (
            <div>
              <FieldLabel label="연도" required />
              <YearField value={hlEducationYear} placeholder="YYYY." onClick={() => setYearPickerTarget('education-year')} />
            </div>
          )}

          {isArticleInterview && (
            <div>
              <FieldLabel label="기사 URL" />
              <TextField value={hlLinkUrl} onChange={setHlLinkUrl} placeholder="기사 URL" />
            </div>
          )}

          {!isEducationHistory && (
            <div>
              <FieldLabel label="설명" />
              <div className="relative rounded-[24px] border border-[#DEE4EC]">
                <textarea
                  value={hlDesc}
                  onChange={(event) => setHlDesc(event.target.value)}
                  placeholder={
                    isCareerRole
                      ? '어떤 일을 했는지 적어주세요.'
                      : isPublish
                        ? '어떤 출판 또는 기고인지 적어주세요.'
                        : isArticleInterview
                          ? '기사나 인터뷰에 대한 설명을 적어주세요.'
                          : '어떤 경험인지 간단히 적어주세요.'
                  }
                  maxLength={150}
                  rows={4}
                  className="w-full resize-none rounded-[24px] bg-transparent px-4 pb-7 pt-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                />
                <span className="pointer-events-none absolute bottom-3 right-4 text-[12px] font-medium text-[#6C7786]">
                  {hlDesc.length}/150
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-2 pb-2">
          <Button
            variant="outline"
            onClick={onBack}
            style={{ borderRadius: 9999, borderColor: '#DEE4EC', color: '#25313D', backgroundColor: '#fff' }}
          >
            이전
          </Button>
          <Button
            onClick={onSave}
            disabled={saveDisabled}
            style={{ backgroundColor: saveDisabled ? 'rgba(0,0,0,0.5)' : '#0D0D0D' }}
          >
            {isEditing ? '수정하기' : '저장하기'}
          </Button>
        </div>
      </div>

      <YearPickerSheet
        open={yearPickerTarget !== null}
        onClose={() => setYearPickerTarget(null)}
        title={
          yearPickerTarget === 'career-start' ? '시작 연도 선택'
            : yearPickerTarget === 'career-end' ? '종료 연도 선택'
              : yearPickerTarget === 'education-start' ? '입학 연도 선택'
                : yearPickerTarget === 'education-end' ? (hlStatus === '중퇴' ? '중퇴 연도 선택' : '졸업 연도 선택')
                  : '연도 선택'
        }
        value={
          yearPickerTarget === 'career-start' ? hlStartYear
            : yearPickerTarget === 'career-end' ? hlEndYear
              : yearPickerTarget === 'education-start' ? hlEducationStartYear
                : yearPickerTarget === 'education-end' ? hlEducationEndYear
                  : hlEducationYear
        }
        options={filteredYearOptions}
        onSelect={(value) => {
          if (yearPickerTarget === 'career-start') setHlStartYear(value)
          if (yearPickerTarget === 'career-end') setHlEndYear(value)
          if (yearPickerTarget === 'education-start') setHlEducationStartYear(value)
          if (yearPickerTarget === 'education-end') setHlEducationEndYear(value)
          if (yearPickerTarget === 'education-year') setHlEducationYear(value)
        }}
      />
    </div>
  )
}
