'use client'

import { useState } from 'react'
import { showToast } from '@/components/ui'
import { useByroStore } from '@/store/useByroStore'
import type { Highlight, HighlightIconId } from '@/types'
import { HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS, SAMPLE_PROFILE } from '@/lib/mockData'
import { getGroupedHighlightPreview, sortHighlightsByPrimary } from '@/lib/highlightMeta'
import { HighlightManageCategoryView } from '@/components/screens/me/highlight-manage/HighlightManageCategoryView'
import { HighlightManageCertificationView } from '@/components/screens/me/highlight-manage/HighlightManageCertificationView'
import { HighlightManageFormView } from '@/components/screens/me/highlight-manage/HighlightManageFormView'
import { HighlightManageListView } from '@/components/screens/me/highlight-manage/HighlightManageListView'
import { HighlightManagePickerView } from '@/components/screens/me/highlight-manage/HighlightManagePickerView'
import {
  CERTIFICATION_ITEMS,
  type CertificationItem,
  type HighlightCategoryCardGroup,
  type HighlightManageCategory,
  type HighlightManageMode,
  VERIFIED_HIGHLIGHT_SUMMARIES,
  type YearPickerTarget,
} from '@/components/screens/me/highlight-manage/constants'

interface HighlightManageScreenProps {
  userLinkId: string
  onBack: () => void
}

export function HighlightManageScreen({
  userLinkId,
  onBack,
}: HighlightManageScreenProps) {
  const store = useByroStore()
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
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null)

  const isCareerRole = selectedCat?.id === 'career-role'
  const isEducationHistory = selectedCat?.id === 'education-history'
  const isPublish = selectedCat?.id === 'publish'
  const isArticleInterview = selectedCat?.id === 'article-interview'
  const educationNeedsDegree = hlSchoolType === '대학교' || hlSchoolType === '대학원'
  const educationNeedsMajor = hlSchoolType !== '고등학교'
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index))
  const allManualHighlights = [...SAMPLE_PROFILE.manualHighlights, ...store.highlights]
  const editableHighlightIds = new Set(store.highlights.map((highlight) => highlight.id))
  const selectedCategoryHighlights = selectedCat
    ? sortHighlightsByPrimary(
        allManualHighlights.filter((item) => item.categoryId === selectedCat.id),
        store.primaryHighlightOverrides[selectedCat.id],
      )
    : []
  const groupedCategoryCards = buildGroupedCategoryCards(allManualHighlights, store.primaryHighlightOverrides)
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

  const resetAll = () => {
    resetFormFields()
    setSelectedCat(null)
    setSelectedCert(null)
  }

  const openCertification = (categoryId: string) => {
    const certItem = CERTIFICATION_ITEMS.find((item) => item.categoryId === categoryId)
    if (!certItem) return
    setSelectedCert(certItem)
    setMode('cert')
  }

  const openCategory = (category: HighlightManageCategory) => {
    setSelectedCat(category)
    setSelectedCert(null)
    setMode('group')
  }

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
      showToast('필수 항목을 입력해주세요')
      return
    }
    if (isCareerRole && !hlRole.trim()) {
      showToast('직함을 입력해주세요')
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
      sourceLabel: isPublish || isArticleInterview ? hlSourceLabel.trim() : undefined,
      linkUrl: isArticleInterview && hlLinkUrl.trim() ? hlLinkUrl.trim() : undefined,
    }

    if (editingHl && store.highlights.some((highlight) => highlight.id === editingHl.id)) {
      store.updateHighlight(editingHl.id, payload)
    } else {
      store.addHighlight(payload)
    }

    resetFormFields()
    setMode('group')
    showToast(editingHl ? '수정됐어요!' : '추가됐어요!')
  }

  if (mode === 'cert' && selectedCert) {
    return (
      <HighlightManageCertificationView
        selectedCert={selectedCert}
        userLinkId={userLinkId}
        onBack={() => {
          setSelectedCert(null)
          setMode('picker')
        }}
        onCopyEmail={() => {
          navigator.clipboard.writeText(`${userLinkId}@data.byro.io`).catch(() => {})
          showToast('복사됐어요!')
        }}
        onConfirm={() => {
          setSelectedCert(null)
          setMode('list')
          showToast('인증 메일 발송 후 반영을 기다려주세요')
        }}
      />
    )
  }

  if (mode === 'group' && selectedCat) {
    return (
      <HighlightManageCategoryView
        selectedCat={selectedCat}
        selectedCategoryHighlights={selectedCategoryHighlights}
        editableHighlightIds={editableHighlightIds}
        primaryHighlightId={store.primaryHighlightOverrides[selectedCat.id]}
        onBack={() => {
          resetAll()
          setMode('list')
        }}
        onSetPrimary={(highlightId) => {
          store.setHighlightPrimary(selectedCat.id, highlightId)
          showToast('메인 항목으로 설정했어요')
        }}
        onEdit={openEditSheet}
        onDelete={(highlight) => {
          store.removeHighlight(highlight.id)
          showToast('삭제됐어요')
        }}
        onAdd={() => {
          resetFormFields()
          setMode('form')
        }}
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
          isPublish,
          isArticleInterview,
          educationNeedsDegree,
          educationNeedsMajor,
          yearPickerTarget,
          yearOptions,
          saveDisabled,
        }}
        actions={{
          onBack: () => {
            resetFormFields()
            setMode(selectedCat ? 'group' : 'picker')
          },
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

  if (mode === 'picker') {
    return (
      <HighlightManagePickerView
        onBack={() => setMode('list')}
        onOpenCategory={openCategory}
        onOpenCertification={openCertification}
      />
    )
  }

  return (
    <HighlightManageListView
      groupedCategoryCards={groupedCategoryCards}
      onBack={onBack}
      onOpenCategory={openCategory}
      onOpenCertification={openCertification}
      onOpenPicker={() => {
        resetAll()
        setMode('picker')
      }}
    />
  )
}

function buildGroupedCategoryCards(
  allManualHighlights: Highlight[],
  primaryHighlightOverrides: Record<string, string>,
): HighlightCategoryCardGroup[] {
  return HIGHLIGHT_GROUPS.map((group) => ({
    ...group,
    items: HIGHLIGHT_CATEGORIES
      .filter((category) => category.group === group.id)
      .map((category) => {
        if (category.certificationOnly) {
          const certItem = CERTIFICATION_ITEMS.find((item) => item.categoryId === category.id)
          return {
            kind: 'verified' as const,
            category,
            title: VERIFIED_HIGHLIGHT_SUMMARIES[category.id] ?? certItem?.summary ?? '',
            meta: certItem?.automated ? '본인 확인 후 자동 연동' : '명함 파일 제출 후 확인',
            countLabel: '인증 항목',
          }
        }

        const items = sortHighlightsByPrimary(
          allManualHighlights.filter((item) => item.categoryId === category.id),
          primaryHighlightOverrides[category.id],
        )
        const preview = getGroupedHighlightPreview(items, primaryHighlightOverrides[category.id])
        return {
          kind: 'manual' as const,
          category,
          title: preview.title || `${category.label} 항목 추가`,
          meta: preview.meta || '아직 추가된 항목이 없어요',
          countLabel: items.length > 0 ? `${items.length}개 항목` : '0개 항목',
        }
      }),
  }))
}
