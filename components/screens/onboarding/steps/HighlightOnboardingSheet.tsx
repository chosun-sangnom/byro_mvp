'use client'

import { useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import { BottomSheet, Button, TextArea, YearPickerSheet, showToast } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { useByroStore } from '@/store/useByroStore'
import type { Highlight, HighlightIconId } from '@/types'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS } from '@/lib/mocks/highlights'
import { getHighlightMetaParts, isPrimaryHighlight, sortHighlightsByPrimary } from '@/lib/highlightMeta'

const CERTIFICATION_HIGHLIGHTS = [
  { categoryId: 'career-continuity', icon: 'briefcase', title: '커리어 지속성', automated: true },
  { categoryId: 'corporate-longevity', icon: 'building2', title: '법인 영속성', automated: true },
  { categoryId: 'remember-network', icon: 'users', title: '리멤버 직업 네트워크', automated: false, docLabel: '리멤버 명함 내보내기 파일' },
  { categoryId: 'airline-mileage', icon: 'plane', title: '항공 마일리지', automated: true },
] as const

interface HighlightOnboardingSheetProps {
  open: boolean
  onClose: () => void
}

export function HighlightOnboardingSheet({ open, onClose }: HighlightOnboardingSheetProps) {
  const store = useByroStore()
  const [sheetMode, setSheetMode] = useState<'picker' | 'group' | 'form' | 'cert'>('picker')
  const [selectedCert, setSelectedCert] = useState<(typeof CERTIFICATION_HIGHLIGHTS)[number] | null>(null)
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null)

  const [selectedCat, setSelectedCat] = useState<typeof HIGHLIGHT_CATEGORIES[0] | null>(null)
  const [hlTitle, setHlTitle] = useState('')
  const [hlRole, setHlRole] = useState('')
  const [hlSchoolType, setHlSchoolType] = useState('')
  const [hlDegree, setHlDegree] = useState('')
  const [hlStatus, setHlStatus] = useState('')
  const [hlStartYear, setHlStartYear] = useState('')
  const [hlEndYear, setHlEndYear] = useState('')
  const [hlEducationYear, setHlEducationYear] = useState('')
  const [hlEducationStartYear, setHlEducationStartYear] = useState('')
  const [hlEducationEndYear, setHlEducationEndYear] = useState('')
  const [hlDesc, setHlDesc] = useState('')
  const [yearPickerTarget, setYearPickerTarget] = useState<'career-start' | 'career-end' | 'education-start' | 'education-end' | 'education-year' | null>(null)

  const highlightLimitReached = store.highlights.length >= 5
  const isCareerRole = selectedCat?.id === 'career-role'
  const isEducationHistory = selectedCat?.id === 'education-history'
  const educationNeedsDegree = hlSchoolType === '대학교' || hlSchoolType === '대학원'
  const educationNeedsMajor = hlSchoolType !== '고등학교'
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index))
  const selectedCategoryHighlights = selectedCat
    ? sortHighlightsByPrimary(
        store.highlights.filter((item) => item.categoryId === selectedCat.id),
        store.primaryHighlightOverrides[selectedCat.id],
      )
    : []

  const resetForm = () => {
    setHlTitle('')
    setHlRole('')
    setHlSchoolType('')
    setHlDegree('')
    setHlStatus('')
    setHlStartYear('')
    setHlEndYear('')
    setHlEducationYear('')
    setHlEducationStartYear('')
    setHlEducationEndYear('')
    setHlDesc('')
    setEditingHighlightId(null)
    setYearPickerTarget(null)
  }

  const openFormForCategory = (category: typeof HIGHLIGHT_CATEGORIES[0]) => {
    setSelectedCat(category)
    resetForm()
    setSheetMode('form')
  }

  const openEditForm = (highlight: Highlight) => {
    const category = HIGHLIGHT_CATEGORIES.find((item) => item.id === highlight.categoryId)
    if (!category) return

    setSelectedCat(category)
    setEditingHighlightId(highlight.id)
    setHlTitle(highlight.title)
    setHlRole(typeof highlight.metadata?.role === 'string' ? highlight.metadata.role : '')
    setHlSchoolType(typeof highlight.metadata?.schoolType === 'string' ? highlight.metadata.schoolType : '')
    setHlDegree(typeof highlight.metadata?.degree === 'string' ? highlight.metadata.degree : '')
    setHlStatus(typeof highlight.metadata?.status === 'string' ? highlight.metadata.status : '')

    const [parsedStart = '', parsedEnd = ''] = highlight.year.split(' - ')
    setHlStartYear(typeof highlight.metadata?.startYear === 'string' ? highlight.metadata.startYear : parsedStart)
    setHlEndYear(typeof highlight.metadata?.endYear === 'string' ? highlight.metadata.endYear : (parsedEnd === '현재' ? '' : parsedEnd))
    setHlEducationYear(
      highlight.categoryId !== 'education-history' && highlight.categoryId !== 'career-role'
        ? highlight.year
        : '',
    )
    setHlEducationStartYear(
      highlight.categoryId === 'education-history'
        ? (typeof highlight.metadata?.startYear === 'string' ? highlight.metadata.startYear : parsedStart)
        : '',
    )
    setHlEducationEndYear(
      highlight.categoryId === 'education-history'
        ? (typeof highlight.metadata?.endYear === 'string'
          ? highlight.metadata.endYear
          : (parsedEnd === '현재' ? '' : parsedEnd))
        : '',
    )
    setHlDesc(highlight.description)
    setSheetMode('form')
  }

  const handleAddHighlight = () => {
    if (highlightLimitReached) {
      showToast('하이라이트는 최대 5개까지 추가할 수 있어요')
      return
    }
    if (!selectedCat || !hlTitle.trim()) {
      showToast('필수 항목을 입력해주세요')
      return
    }
    if (isCareerRole && !hlRole.trim()) {
      showToast('직함을 입력해주세요')
      return
    }
    if (isEducationHistory && !hlSchoolType) {
      showToast('학교 유형을 선택해주세요')
      return
    }
    if (isEducationHistory && educationNeedsDegree && !hlDegree) {
      showToast('세부 학위를 선택해주세요')
      return
    }
    if (isEducationHistory && educationNeedsMajor && !hlRole.trim()) {
      showToast('전공을 입력해주세요')
      return
    }
    if (isEducationHistory && !hlStatus) {
      showToast('상태를 선택해주세요')
      return
    }
    if (isEducationHistory && !hlEducationStartYear) {
      showToast('입학 연도를 선택해주세요')
      return
    }
    if (isEducationHistory && hlStatus !== '재학' && !hlEducationEndYear) {
      showToast(hlStatus === '중퇴' ? '중퇴 연도를 선택해주세요' : '졸업 연도를 선택해주세요')
      return
    }
    if (isCareerRole && !hlStatus) {
      showToast('상태를 선택해주세요')
      return
    }
    if (isCareerRole && !hlStartYear) {
      showToast('시작 연도를 선택해주세요')
      return
    }
    if (isCareerRole && hlStatus === '종료' && !hlEndYear) {
      showToast('종료 연도를 선택해주세요')
      return
    }

    let metadata: Record<string, string | boolean> | undefined
    if (isEducationHistory) {
      metadata = {
        status: hlStatus,
        role: hlRole,
        degree: hlDegree,
        schoolType: hlSchoolType,
        startYear: hlEducationStartYear,
        endYear: hlStatus === '재학' ? '' : hlEducationEndYear,
      }
    } else if (isCareerRole) {
      metadata = {
        status: hlStatus,
        role: hlRole,
        startYear: hlStartYear,
        endYear: hlStatus === '종료' ? hlEndYear : '',
      }
    }

    const payload = {
      categoryId: selectedCat.id,
      icon: selectedCat.icon as HighlightIconId,
      title: hlTitle,
      subtitle: isEducationHistory ? `${selectedCat.label} · ${hlSchoolType}` : `${selectedCat.label} · 직접 입력`,
      description: hlDesc,
      year: isCareerRole
        ? `${hlStartYear} - ${hlStatus === '재직 중' ? '현재' : hlEndYear}`
        : isEducationHistory
          ? `${hlEducationStartYear} - ${hlStatus === '재학' ? '현재' : hlEducationEndYear}`
          : hlEducationYear,
      metadata,
    }

    if (editingHighlightId) {
      store.updateHighlight(editingHighlightId, payload)
    } else {
      store.addHighlight(payload)
    }

    const preservedCategory = selectedCat
    resetForm()
    setSelectedCat(preservedCategory)
    setSheetMode('group')
    showToast(editingHighlightId ? '하이라이트를 수정했어요!' : '하이라이트가 추가됐어요!')
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose}>
        {sheetMode === 'picker' && (
          <div className="px-5 pb-6">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Highlight Picker</div>
            <div className="text-[22px] font-black tracking-[-0.03em] text-[var(--color-text-strong)] mb-1">경험 추가하기</div>
            <div className="text-sm leading-6 text-[var(--color-text-secondary)] mb-5">
              프로필에 보여줄 경험을 선택하세요.
            </div>

            <div className="space-y-6">
              {HIGHLIGHT_GROUPS.map((group, groupIndex) => (
                <div key={group.id} className={groupIndex > 0 ? 'border-t border-[var(--color-border-soft)] pt-5' : ''}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">{group.label}</div>
                    <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {HIGHLIGHT_CATEGORIES.filter((category) => category.group === group.id).map((category) => {
                      const certification = CERTIFICATION_HIGHLIGHTS.find((item) => item.categoryId === category.id)
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            if (category.certificationOnly && certification) {
                              setSelectedCert(certification)
                              setSheetMode('cert')
                              return
                            }
                            setSelectedCat(category)
                            setSheetMode('group')
                          }}
                          className="relative overflow-visible rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-3 py-4 text-center"
                        >
                          {category.certificationOnly && (
                            <span className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-state-success-text)]">
                              <BadgeCheck size={14} />
                            </span>
                          )}
                          <div className="mx-auto mb-2 flex items-center justify-center text-[var(--color-text-secondary)]">
                            <HighlightIcon id={category.icon as HighlightIconId} size={16} />
                          </div>
                          <div className="text-[12px] font-bold leading-[1.4] text-[var(--color-text-primary)] break-keep">{category.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sheetMode === 'group' && selectedCat && (
          <div className="px-5 pb-6">
            <div className="flex items-center mb-4">
              <button onClick={() => { resetForm(); setSelectedCat(null); setSheetMode('picker') }} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
              <div className="text-[18px] font-black text-[var(--color-text-strong)]">{selectedCat.label} 관리</div>
            </div>

            <div className="surface-card mb-4 rounded-[28px] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-strong)]">
                    <HighlightIcon id={selectedCat.icon as HighlightIconId} size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Collection</div>
                    <div className="mt-1 text-[15px] font-bold text-[var(--color-text-strong)]">{selectedCat.label}</div>
                    <div className="micro-text">여러 항목을 추가하고 메인으로 보여줄 항목을 고를 수 있어요</div>
                  </div>
                </div>
                <div className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                  {selectedCategoryHighlights.length}개
                </div>
              </div>
            </div>

            {selectedCategoryHighlights.length > 0 ? (
              <div className="space-y-3 mb-4">
                {selectedCategoryHighlights.map((item) => {
                  const metaParts = getHighlightMetaParts(item)
                  return (
                    <div key={item.id} className="surface-card rounded-[24px] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-[15px] font-bold text-[var(--color-text-strong)]">{item.title}</div>
                          {metaParts.length > 0 && (
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                              {metaParts.map((part, index) => (
                                <span
                                  key={`${item.id}-meta-${index}`}
                                  className={`text-[11px] ${index === 0 ? 'font-semibold text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'}`}
                                >
                                  {part}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.description?.trim() && (
                            <p className="mt-3 text-[14px] leading-7 text-[var(--color-text-secondary)]">{item.description}</p>
                          )}
                        </div>
                        {isPrimaryHighlight(item, store.primaryHighlightOverrides[selectedCat.id]) ? (
                          <span className="rounded-full bg-[var(--color-state-success-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-state-success-text)]">메인 노출 중</span>
                        ) : (
                          <button
                            onClick={() => {
                              store.setHighlightPrimary(selectedCat.id, item.id)
                              showToast('메인 항목으로 설정했어요')
                            }}
                            className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]"
                          >
                            메인으로 설정
                          </button>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => openEditForm(item)}
                          className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            store.removeHighlight(item.id)
                            showToast('삭제됐어요')
                          }}
                          className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-3 py-1.5 text-xs font-medium text-[var(--color-state-danger-text)]"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-10 text-center text-sm text-[var(--color-text-tertiary)] mb-4">
                아직 추가한 {selectedCat.label.toLowerCase()} 항목이 없어요
              </div>
            )}

            <Button
              onClick={() => {
                if (highlightLimitReached) {
                  showToast('하이라이트는 최대 5개까지 추가할 수 있어요')
                  return
                }
                openFormForCategory(selectedCat)
              }}
              disabled={highlightLimitReached}
            >
              + {selectedCat.label} 추가
            </Button>
          </div>
        )}

        {sheetMode === 'form' && (
          <div className="px-5 pb-6">
            <div className="flex items-center mb-4">
              <button onClick={() => setSheetMode(selectedCat ? 'group' : 'picker')} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
              <div className="text-[18px] font-black text-[var(--color-text-strong)]">{editingHighlightId ? '하이라이트 수정하기' : '직접 입력 하이라이트'}</div>
            </div>

            {selectedCat && (
              <div className="surface-card mb-4 rounded-[28px] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-strong)]">
                    <HighlightIcon id={selectedCat.icon as HighlightIconId} size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Entry Form</div>
                    <div className="mt-1 text-[15px] font-bold text-[var(--color-text-strong)]">{selectedCat.label}</div>
                    <div className="micro-text">직접 입력으로 바로 추가돼요</div>
                  </div>
                </div>
              </div>
            )}

            <div className="surface-card rounded-[26px] p-4">
              <div className="space-y-3">
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
                            borderColor: hlSchoolType === schoolType ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
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
                            borderColor: hlDegree === degree ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
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
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)' }}
                />
                {isEducationHistory && educationNeedsMajor && (
                  <input
                    value={hlRole}
                    onChange={(event) => setHlRole(event.target.value)}
                    placeholder="전공"
                    className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)' }}
                  />
                )}
                {isCareerRole && (
                  <input
                    value={hlRole}
                    onChange={(event) => setHlRole(event.target.value)}
                    placeholder="직함"
                    className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)' }}
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
                            borderColor: hlStatus === status ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
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
                            borderColor: hlStatus === status ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
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
                      className="rounded-2xl border px-4 py-3 text-left text-sm"
                      style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)', color: hlStartYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                    >
                      {hlStartYear || '시작 연도'}
                    </button>
                    <button
                      onClick={() => {
                        if (hlStatus !== '종료') return
                        setYearPickerTarget('career-end')
                      }}
                      disabled={hlStatus !== '종료'}
                      className="rounded-2xl border px-4 py-3 text-left text-sm disabled:opacity-40"
                      style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)', color: hlStatus === '재직 중' ? 'var(--color-text-tertiary)' : (hlEndYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)') }}
                    >
                      {hlStatus === '재직 중' ? '현재' : (hlEndYear || '종료 연도')}
                    </button>
                  </div>
                )}
                {isEducationHistory && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setYearPickerTarget('education-start')}
                      className="rounded-2xl border px-4 py-3 text-left text-sm"
                      style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)', color: hlEducationStartYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                    >
                      {hlEducationStartYear || '입학 연도'}
                    </button>
                    <button
                      onClick={() => {
                        if (hlStatus === '재학') return
                        setYearPickerTarget('education-end')
                      }}
                      disabled={hlStatus === '재학'}
                      className="rounded-2xl border px-4 py-3 text-left text-sm disabled:opacity-40"
                      style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)', color: hlStatus === '재학' ? 'var(--color-text-tertiary)' : (hlEducationEndYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)') }}
                    >
                      {hlStatus === '재학' ? '현재' : (hlEducationEndYear || (hlStatus === '중퇴' ? '중퇴 연도' : '졸업 연도'))}
                    </button>
                  </div>
                )}
                {!isEducationHistory && (
                  <TextArea
                    value={hlDesc}
                    onChange={setHlDesc}
                    placeholder={isCareerRole ? '어떤 일을 했는지 적어주세요' : '어떤 경험인지 간단히 적어주세요'}
                    maxLength={150}
                    rows={4}
                  />
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setSheetMode(selectedCat ? 'group' : 'picker')}>이전</Button>
                <Button
                  onClick={handleAddHighlight}
                  disabled={!selectedCat || !hlTitle.trim() || (isCareerRole && (!hlRole.trim() || !hlStatus || !hlStartYear || (hlStatus === '종료' && !hlEndYear))) || (isEducationHistory && (!hlSchoolType || (educationNeedsDegree && !hlDegree) || (educationNeedsMajor && !hlRole.trim()) || !hlStatus || !hlEducationStartYear || (hlStatus !== '재학' && !hlEducationEndYear)))}
                >
                  {editingHighlightId ? '수정하기' : '저장하기'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {sheetMode === 'cert' && selectedCert && (
          <div className="px-5 pb-6">
            <div className="flex items-center mb-4">
              <button onClick={() => setSheetMode('picker')} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
              <div className="text-[18px] font-black text-[var(--color-text-strong)]">{selectedCert.title} 인증</div>
            </div>

            <div className="surface-card rounded-[28px] p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
                <HighlightIcon id={selectedCert.icon as HighlightIconId} size={20} />
              </div>
              {selectedCert.automated ? (
                <>
                  <div className="mt-4 text-sm font-bold text-[var(--color-text-strong)]">진행 방식</div>
                  <div className="mt-2 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>1. 본인확인을 진행하면 필요한 정보를 자동으로 불러와요.</p>
                    <p>2. 확인이 끝나면 하이라이트에 바로 반영돼요.</p>
                  </div>
                  <div className="mt-5 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                    별도 파일을 보내지 않아도 돼요. 본인확인만 끝나면 자동으로 진행됩니다.
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-4 text-sm font-bold text-[var(--color-text-strong)]">진행 방식</div>
                  <div className="mt-2 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>1. 리멤버 앱에서 명함 내보내기 파일을 준비해주세요.</p>
                    <p>2. 아래 이메일 주소로 파일을 보내주시면 확인 후 반영돼요.</p>
                  </div>
                  <div className="mt-5 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
                    <div className="micro-text mb-2">인증 이메일 주소</div>
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1 truncate text-sm font-mono font-bold text-[var(--color-text-strong)]">
                        gangjunmin@data.byro.io
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('gangjunmin@data.byro.io').catch(() => {})
                          showToast('복사됐어요!')
                        }}
                        className="rounded-xl bg-[var(--color-accent-dark)] px-3 py-2 text-xs font-semibold text-white"
                      >
                        복사
                      </button>
                    </div>
                    <div className="micro-text mt-3">{selectedCert.docLabel}</div>
                  </div>
                </>
              )}

              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setSheetMode('picker')}>이전</Button>
                <Button onClick={() => { onClose(); setSheetMode('picker'); setSelectedCert(null) }}>확인</Button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

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
    </>
  )
}
