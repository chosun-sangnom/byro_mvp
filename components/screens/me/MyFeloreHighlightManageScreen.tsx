'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui'
import { useFeloreStore } from '@/store/useFeloreStore'
import type { Highlight, HighlightIconId } from '@/types'
import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { isPrimaryHighlight } from '@/lib/highlightMeta'
import { HighlightManageFormView } from '@/components/screens/me/highlight-manage/HighlightManageFormView'
import { HighlightManageListView } from '@/components/screens/me/highlight-manage/HighlightManageListView'
import { HighlightAddMethodSheet } from '@/components/screens/me/highlight-manage/HighlightAddMethodSheet'
import { HighlightManageVerifyView } from '@/components/screens/me/highlight-manage/HighlightManageVerifyView'
import { HighlightScreenshotImportFlow } from '@/components/screens/me/highlight-manage/HighlightScreenshotImportFlow'
import {
  type HighlightCategorySection,
  type HighlightManageCategory,
  type HighlightManageMode,
  type YearPickerTarget,
} from '@/components/screens/me/highlight-manage/constants'

const HIGHLIGHT_FREE_LIMIT = 3
const VERIFIABLE_CATEGORY_IDS = ['career-role', 'education-history']

// 한글 마지막 음절의 받침 유무에 따라 '이'/'가' 조사를 고른다.
function pickIGa(label: string): '이' | '가' {
  const lastChar = label.trim().slice(-1)
  const code = lastChar.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return '가'
  const hasBatchim = (code - 0xac00) % 28 !== 0
  return hasBatchim ? '이' : '가'
}

interface HighlightManageScreenProps {
  onBack: () => void
}

export function HighlightManageScreen({
  onBack,
}: HighlightManageScreenProps) {
  const router = useRouter()
  const store = useFeloreStore()
  const isPro = store.user?.isPaidUser ?? false
  const [mode, setMode] = useState<HighlightManageMode>('list')
  const [editingHl, setEditingHl] = useState<Highlight | null>(null)
  const [selectedCat, setSelectedCat] = useState<HighlightManageCategory | null>(null)
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
  const [hlSourceLabel, setHlSourceLabel] = useState('')
  const [hlLinkUrl, setHlLinkUrl] = useState('')
  const [hlDesc, setHlDesc] = useState('')
  const [yearPickerTarget, setYearPickerTarget] = useState<YearPickerTarget | null>(null)
  const [verifyMethod, setVerifyMethod] = useState<'ocr' | 'email' | undefined>(undefined)
  // [임시] LLM 임포트 시트 상태
  const [llmImportOpen, setLlmImportOpen] = useState(false)
  const [addMethodOpen, setAddMethodOpen] = useState(false)

  const isCareerRole = selectedCat?.id === 'career-role'
  const isEducationHistory = selectedCat?.id === 'education-history'
  const isActivity = selectedCat?.id === 'activity'
  const isAchievement = selectedCat?.id === 'achievement'
  const educationNeedsDegree = hlSchoolType === '대학교' || hlSchoolType === '대학원'
  const educationNeedsMajor = hlSchoolType !== '고등학교'
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index))
  // store.highlightsInitialized 이후 store.highlights가 단일 진실의 원천 (CRUD 가능)
  const allManualHighlights = store.highlightsInitialized
    ? store.highlights
    : [...SAMPLE_PROFILE.manualHighlights, ...store.highlights]
  const editableHighlightIds = new Set(allManualHighlights.map((h) => h.id))
  const selectedCategoryHighlights = selectedCat
    ? allManualHighlights.filter((item) => item.categoryId === selectedCat.id)
    : []
  const categorySections = buildCategorySections(allManualHighlights, store.primaryHighlightOverrides)
  const freeRemaining = Math.max(0, HIGHLIGHT_FREE_LIMIT - allManualHighlights.length)
  const saveDisabled = !selectedCat
    || !hlTitle.trim()
    || (isCareerRole && (!hlRole.trim() || !hlStatus || !hlStartYear || (hlStatus === '종료' && !hlEndYear)))
    || (isEducationHistory && (
      !hlSchoolType
      || (educationNeedsDegree && !hlDegree)
      || (educationNeedsMajor && !hlRole.trim())
      || !hlStatus
      || !hlEducationStartYear
      || (hlStatus !== '재학' && !hlEducationEndYear)
    ))

  const resetFormFields = () => {
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
    setHlSourceLabel('')
    setHlLinkUrl('')
    setHlDesc('')
    setEditingHl(null)
    setYearPickerTarget(null)
  }

  const backToList = () => {
    resetFormFields()
    setSelectedCat(null)
    setMode('list')
  }

  const handleUpgrade = () => {
    router.push('/settings?screen=upgrade')
  }

  const openAddForm = () => {
    if (!isPro && freeRemaining <= 0) {
      showToast('Free 플랜은 하이라이트를 최대 3개까지 추가할 수 있어요', 'error')
      return
    }
    resetFormFields()
    setMode('form')
  }

  const startAdd = (category: HighlightManageCategory) => {
    setSelectedCat(category)
    if (VERIFIABLE_CATEGORY_IDS.includes(category.id)) {
      setAddMethodOpen(true)
      return
    }
    openAddForm()
  }

  const addMethodSheet = (
    <HighlightAddMethodSheet
      category={selectedCat}
      open={addMethodOpen}
      onClose={() => setAddMethodOpen(false)}
      onDirectInput={() => {
        setAddMethodOpen(false)
        openAddForm()
      }}
      onVerify={(method) => {
        setAddMethodOpen(false)
        setVerifyMethod(method)
        setMode('verify')
      }}
    />
  )

  const openEditSheet = (highlight: Highlight) => {
    const category = HIGHLIGHT_CATEGORIES.find((item) => item.id === highlight.categoryId) ?? null
    setSelectedCat(category)
    setHlTitle(highlight.title)
    setHlRole(typeof highlight.metadata?.role === 'string' ? highlight.metadata.role : '')
    setHlSchoolType(typeof highlight.metadata?.schoolType === 'string' ? highlight.metadata.schoolType : '')
    setHlDegree(typeof highlight.metadata?.degree === 'string' ? highlight.metadata.degree : '')
    setHlStatus(typeof highlight.metadata?.status === 'string' ? highlight.metadata.status : '')
    const [parsedStart = '', parsedEnd = ''] = highlight.year.split(' - ')
    setHlStartYear(typeof highlight.metadata?.startYear === 'string' ? highlight.metadata.startYear : parsedStart)
    setHlEndYear(typeof highlight.metadata?.endYear === 'string' ? highlight.metadata.endYear : (parsedEnd === '현재' ? '' : parsedEnd))
    setHlEducationYear(highlight.categoryId !== 'career-role' && highlight.categoryId !== 'education-history' ? highlight.year : '')
    setHlEducationStartYear(
      highlight.categoryId === 'education-history'
        ? (typeof highlight.metadata?.startYear === 'string' ? highlight.metadata.startYear : parsedStart)
        : '',
    )
    setHlEducationEndYear(
      highlight.categoryId === 'education-history'
        ? (typeof highlight.metadata?.endYear === 'string' ? highlight.metadata.endYear : (parsedEnd === '현재' ? '' : parsedEnd))
        : '',
    )
    setHlSourceLabel(highlight.sourceLabel ?? '')
    setHlLinkUrl(highlight.linkUrl ?? '')
    setHlDesc(highlight.description)
    setEditingHl(highlight)
    setMode('form')
  }

  const handleSave = () => {
    if (!selectedCat || !hlTitle.trim()) {
      showToast('필수 항목을 입력해주세요', 'error')
      return
    }
    if (isCareerRole && !hlRole.trim()) {
      showToast('직함을 입력해주세요', 'error')
      return
    }
    if (isCareerRole && !hlStatus) {
      showToast('상태를 선택해주세요', 'error')
      return
    }
    if (isCareerRole && !hlStartYear) {
      showToast('시작 연도를 선택해주세요', 'error')
      return
    }
    if (isCareerRole && hlStatus === '종료' && !hlEndYear) {
      showToast('종료 연도를 선택해주세요', 'error')
      return
    }
    if (isEducationHistory && !hlSchoolType) {
      showToast('학교 유형을 선택해주세요', 'error')
      return
    }
    if (isEducationHistory && educationNeedsDegree && !hlDegree) {
      showToast('세부 학위를 선택해주세요', 'error')
      return
    }
    if (isEducationHistory && educationNeedsMajor && !hlRole.trim()) {
      showToast('전공을 입력해주세요', 'error')
      return
    }
    if (isEducationHistory && !hlStatus) {
      showToast('상태를 선택해주세요', 'error')
      return
    }
    if (isEducationHistory && !hlEducationStartYear) {
      showToast('입학 연도를 선택해주세요', 'error')
      return
    }
    if (isEducationHistory && hlStatus !== '재학' && !hlEducationEndYear) {
      showToast(hlStatus === '중퇴' ? '중퇴 연도를 선택해주세요' : '졸업 연도를 선택해주세요', 'error')
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

    const isNewPrimary = !editingHl && !store.highlights.some((item) => item.categoryId === selectedCat.id)
    if (isNewPrimary) {
      metadata = { ...metadata, isPrimary: true }
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
      sourceLabel: (isActivity || isAchievement) ? hlSourceLabel.trim() : undefined,
      linkUrl: (isActivity || isAchievement) && hlLinkUrl.trim() ? hlLinkUrl.trim() : undefined,
    }

    if (editingHl && store.highlights.some((highlight) => highlight.id === editingHl.id)) {
      store.updateHighlight(editingHl.id, payload)
    } else {
      store.addHighlight(payload)
    }

    backToList()
    showToast(`${selectedCat.label}${pickIGa(selectedCat.label)} 저장되었어요`)
  }

  if (mode === 'verify' && selectedCat) {
    return (
      <HighlightManageVerifyView
        selectedCat={selectedCat}
        existingHighlights={selectedCategoryHighlights}
        initialMethod={verifyMethod}
        onBack={backToList}
        onImportCareers={(items) => items.forEach((item) => store.addHighlight(item))}
        onVerifyHighlight={(id) => store.verifyHighlight(id)}
        onAddHighlight={(item) => store.addHighlight(item)}
      />
    )
  }

  if (mode === 'form') {
    return (
      <HighlightManageFormView
        values={{
          selectedCat,
          isEditing: Boolean(editingHl),
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
          isActivity,
          isAchievement,
          educationNeedsDegree,
          educationNeedsMajor,
          yearPickerTarget,
          yearOptions,
          saveDisabled,
        }}
        actions={{
          onBack: backToList,
          onSave: handleSave,
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
        }}
      />
    )
  }

  return (
    <>
      <HighlightManageListView
        categorySections={categorySections}
        onBack={onBack}
        editableHighlightIds={editableHighlightIds}
        onAdd={startAdd}
        onEdit={openEditSheet}
        onDelete={(highlight) => {
          store.removeHighlight(highlight.id)
          showToast('삭제됐어요')
        }}
        onSetPrimary={(category, highlightId) => {
          store.setHighlightPrimary(category.id, highlightId)
          showToast('메인 항목으로 설정했어요')
        }}
        onBlockedMockItem={(action) => showToast(`기본 목업 항목은 ${action}하지 않습니다`, 'error')}
        onLlmImport={() => setLlmImportOpen(true)}
        isPro={isPro}
        freeRemaining={freeRemaining}
        onUpgrade={handleUpgrade}
      />
      {/* [임시] 스크린샷 OCR 자동 채우기 */}
      {llmImportOpen && (
        <HighlightScreenshotImportFlow
          isPro={isPro}
          freeRemaining={freeRemaining}
          onClose={() => setLlmImportOpen(false)}
        />
      )}
      {addMethodSheet}
    </>
  )
}

function buildCategorySections(
  allManualHighlights: Highlight[],
  primaryHighlightOverrides: Record<string, string>,
): HighlightCategorySection[] {
  return HIGHLIGHT_CATEGORIES.map((category) => {
    // 메인으로 설정해도 항목 순서는 그대로 두고, 메인 표시만 옮긴다
    const items = allManualHighlights.filter((item) => item.categoryId === category.id)
    const primaryId = primaryHighlightOverrides[category.id]
      ?? items.find((item) => isPrimaryHighlight(item))?.id
      ?? items[0]?.id
    return { category, items, primaryId }
  })
}
