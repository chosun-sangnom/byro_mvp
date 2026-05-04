import { Button, TextArea, YearPickerSheet } from '@/components/ui'
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
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">{isEditing ? '하이라이트 수정하기' : '하이라이트 추가하기'}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {selectedCat && (
          <div className="surface-card mb-4 rounded-[26px] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-strong)]">
                <HighlightIcon id={selectedCat.icon as HighlightIconId} size={16} />
              </span>
              <div>
                <div className="text-[15px] font-bold text-[var(--color-text-strong)]">{selectedCat.label}</div>
                <div className="micro-text">프로필에 직접 입력한 경험으로 표시돼요</div>
              </div>
            </div>
          </div>
        )}
        <div className="surface-card rounded-[26px] p-4">
          <div className="space-y-3 mb-4">
            {isEducationHistory && (
              <div className="space-y-2">
                <div className="micro-text">학교 유형</div>
                <div className="grid grid-cols-3 gap-2">
                  {['고등학교', '대학교', '대학원'].map((schoolType) => (
                    <button
                      key={schoolType}
                      onClick={() => {
                        setHlSchoolType(schoolType)
                        setHlDegree('')
                        if (schoolType === '고등학교') setHlRole('')
                      }}
                      className="rounded-2xl border px-3 py-2.5 text-sm font-semibold"
                      style={{
                        borderColor: hlSchoolType === schoolType ? 'var(--color-accent-dark)' : '#E7E2DC',
                        backgroundColor: hlSchoolType === schoolType ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                        color: hlSchoolType === schoolType ? '#fff' : 'var(--color-text-secondary)',
                      }}
                    >
                      {schoolType}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isEducationHistory && educationNeedsDegree && (
              <div className="space-y-2">
                <div className="micro-text">세부 학위</div>
                <div className="grid grid-cols-2 gap-2">
                  {(hlSchoolType === '대학교' ? ['전문학사', '학사'] : ['석사', '박사']).map((degree) => (
                    <button
                      key={degree}
                      onClick={() => setHlDegree(degree)}
                      className="rounded-2xl border px-3 py-2.5 text-sm font-semibold"
                      style={{
                        borderColor: hlDegree === degree ? 'var(--color-accent-dark)' : '#E7E2DC',
                        backgroundColor: hlDegree === degree ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                        color: hlDegree === degree ? '#fff' : 'var(--color-text-secondary)',
                      }}
                    >
                      {degree}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input
              value={hlTitle}
              onChange={(event) => setHlTitle(event.target.value)}
              placeholder={isCareerRole ? '회사명' : isEducationHistory ? '학교명' : '제목'}
              className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none"
            />
            {(isPublish || isArticleInterview) && (
              <input
                value={hlSourceLabel}
                onChange={(event) => setHlSourceLabel(event.target.value)}
                placeholder={isPublish ? '출판사 또는 매체명' : '매체명'}
                className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none"
              />
            )}
            {isEducationHistory && educationNeedsMajor && (
              <input
                value={hlRole}
                onChange={(event) => setHlRole(event.target.value)}
                placeholder="전공"
                className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none"
              />
            )}
            {isCareerRole && (
              <input
                value={hlRole}
                onChange={(event) => setHlRole(event.target.value)}
                placeholder="직함"
                className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none"
              />
            )}
            {isCareerRole && (
              <div className="space-y-2">
                <div className="micro-text">현재 상태</div>
                <div className="grid grid-cols-2 gap-2">
                  {['재직 중', '종료'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setHlStatus(status)}
                      className="rounded-2xl border px-4 py-3 text-sm font-semibold"
                      style={{
                        borderColor: hlStatus === status ? 'var(--color-accent-dark)' : '#E7E2DC',
                        backgroundColor: hlStatus === status ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                        color: hlStatus === status ? '#fff' : 'var(--color-text-secondary)',
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isEducationHistory && (
              <div className="space-y-2">
                <div className="micro-text">현재 상태</div>
                <div className="grid grid-cols-3 gap-2">
                  {['졸업', '재학', '중퇴'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setHlStatus(status)}
                      className="rounded-2xl border px-3 py-2.5 text-sm font-semibold"
                      style={{
                        borderColor: hlStatus === status ? 'var(--color-accent-dark)' : '#E7E2DC',
                        backgroundColor: hlStatus === status ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                        color: hlStatus === status ? '#fff' : 'var(--color-text-secondary)',
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isCareerRole && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setYearPickerTarget('career-start')}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-left text-sm"
                  style={{ color: hlStartYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                >
                  {hlStartYear || '시작 연도'}
                </button>
                <button
                  onClick={() => {
                    if (hlStatus !== '종료') return
                    setYearPickerTarget('career-end')
                  }}
                  disabled={hlStatus !== '종료'}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-left text-sm disabled:opacity-40"
                  style={{ color: hlStatus === '재직 중' ? 'var(--color-text-tertiary)' : (hlEndYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)') }}
                >
                  {hlStatus === '재직 중' ? '현재' : (hlEndYear || '종료 연도')}
                </button>
              </div>
            )}
            {isEducationHistory && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setYearPickerTarget('education-start')}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-left text-sm"
                  style={{ color: hlEducationStartYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                >
                  {hlEducationStartYear || '입학 연도'}
                </button>
                <button
                  onClick={() => {
                    if (hlStatus === '재학') return
                    setYearPickerTarget('education-end')
                  }}
                  disabled={hlStatus === '재학'}
                  className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-left text-sm disabled:opacity-40"
                  style={{ color: hlStatus === '재학' ? 'var(--color-text-tertiary)' : (hlEducationEndYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)') }}
                >
                  {hlStatus === '재학' ? '현재' : (hlEducationEndYear || (hlStatus === '중퇴' ? '중퇴 연도' : '졸업 연도'))}
                </button>
              </div>
            )}
            {(isPublish || isArticleInterview) && !isEducationHistory && !isCareerRole && (
              <button
                onClick={() => setYearPickerTarget('education-year')}
                className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-left text-sm"
                style={{ color: hlEducationYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
              >
                {hlEducationYear || '연도 선택'}
              </button>
            )}
            {isArticleInterview && (
              <input
                value={hlLinkUrl}
                onChange={(event) => setHlLinkUrl(event.target.value)}
                placeholder="기사 URL"
                className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none"
              />
            )}
            {!isEducationHistory && (
              <TextArea
                value={hlDesc}
                onChange={setHlDesc}
                placeholder={isCareerRole ? '어떤 일을 했는지 적어주세요' : isPublish ? '어떤 출판 또는 기고인지 적어주세요' : isArticleInterview ? '기사나 인터뷰에 대한 설명을 적어주세요' : '어떤 경험인지 간단히 적어주세요'}
                maxLength={150}
                rows={4}
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>이전</Button>
            <Button onClick={onSave} disabled={saveDisabled}>{isEditing ? '수정하기' : '저장하기'}</Button>
          </div>
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
        options={yearOptions}
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
