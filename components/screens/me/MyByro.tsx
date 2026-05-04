'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, Camera, ChevronRight } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, YearPickerSheet, showToast, TextArea } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import type { Highlight, HighlightIconId } from '@/types'
import {
  SAMPLE_PROFILE,
  HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS,
} from '@/lib/mockData'
import { getGroupedHighlightPreview, getHighlightMetaParts, isPrimaryHighlight, sortHighlightsByPrimary } from '@/lib/highlightMeta'
import PublicProfile from '@/components/screens/profile/PublicProfile'
import {
  ContactManageScreen,
  GuestbookManageScreen,
  ManageByroScreen,
  ReputationManageScreen,
  SNSManageScreen,
} from '@/components/screens/me/MyByroSupportScreens'

type Screen = 'preview' | 'manage' | 'editBasic' | 'editHighlight' | 'editSNS' | 'editReputation' | 'editContact' | 'editGuestbook'

const CERTIFICATION_ITEMS = [
  {
    categoryId: 'career-continuity',
    icon: 'briefcase',
    title: '커리어 지속성',
    summary: '본인확인 후 자동으로 재직 이력을 불러와요',
    pickerDescription: '본인확인 후 건강보험공단 기준 장기 재직 이력을 자동으로 불러와요',
    automated: true,
  },
  {
    categoryId: 'corporate-longevity',
    icon: 'building2',
    title: '법인 영속성',
    summary: '본인확인 후 법인 운영 정보를 자동으로 불러와요',
    pickerDescription: '본인확인 후 법인 운영 기간과 정상 운영 여부를 자동으로 불러와요',
    automated: true,
  },
  {
    categoryId: 'remember-network',
    icon: 'users',
    title: '리멤버 직업 네트워크',
    summary: '리멤버 명함 파일과 이메일로 직업 네트워크를 인증해요',
    pickerDescription: '리멤버 명함 파일을 메일로 보내면 직업 네트워크를 인증해요',
    automated: false,
    emailLabel: '리멤버 명함 내보내기 파일',
  },
  {
    categoryId: 'airline-mileage',
    icon: 'plane',
    title: '항공 마일리지',
    summary: '본인확인 후 항공사 등급 정보를 자동으로 불러와요',
    pickerDescription: '본인확인 후 항공사 회원 등급을 자동으로 불러와요',
    automated: true,
  },
] as const

const sampleTopRememberIndustry = [...SAMPLE_PROFILE.rememberHighlight.industries].sort((a, b) => b.ratio - a.ratio)[0]

const VERIFIED_HIGHLIGHT_SUMMARIES: Record<string, string> = {
  'career-continuity': `평균 ${SAMPLE_PROFILE.careerHighlight.avgYears}년 재직`,
  'corporate-longevity': SAMPLE_PROFILE.corporateHighlight.summary,
  'remember-network': sampleTopRememberIndustry ? `${sampleTopRememberIndustry.name} 네트워크 다수, ${sampleTopRememberIndustry.ratio}%` : '리멤버 명함 기반 직업 네트워크',
  'airline-mileage': SAMPLE_PROFILE.airlineHighlight.tierSummary,
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MyByro() {
  const router = useRouter()
  const store = useByroStore()

  useEffect(() => {
    if (!store.isLoggedIn) router.replace('/onboarding')
  }, [store.isLoggedIn, router])

  const [screen, setScreen] = useState<Screen>('preview')

  if (!store.isLoggedIn) return null
  const user = store.user!

  const instagramConnected = store.instagramConnected || SAMPLE_PROFILE.instagramConnected
  const linkedinConnected = store.linkedinConnected || SAMPLE_PROFILE.linkedinConnected
  const allHighlights = [...SAMPLE_PROFILE.manualHighlights, ...store.highlights]
  const connectedSnsCount = Number(instagramConnected) + Number(linkedinConnected)
  const totalReputationCount = SAMPLE_PROFILE.reputationKeywords.reduce((sum, item) => sum + item.count, 0)
  // ── 화면 분기 ──────────────────────────────────────────────
  if (screen === 'preview') {
    return (
      <PublicProfile
        username={user.linkId}
        mode="owner"
        onOpenArchive={() => router.push('/archive')}
        onOpenManage={() => setScreen('manage')}
      />
    )
  }

  if (screen === 'manage') {
    return (
      <ManageByroScreen
        allHighlights={allHighlights}
        connectedSnsCount={connectedSnsCount}
        totalReputationCount={totalReputationCount}
        onLogout={() => store.logout()}
        onBack={() => setScreen('preview')}
        onEditBasic={() => setScreen('editBasic')}
        onEditHighlight={() => setScreen('editHighlight')}
        onEditSNS={() => setScreen('editSNS')}
        onEditReputation={() => setScreen('editReputation')}
        onEditContact={() => setScreen('editContact')}
        onEditGuestbook={() => setScreen('editGuestbook')}
        user={user}
      />
    )
  }

  if (screen === 'editBasic') {
    return <BasicInfoEditScreen user={user} onBack={() => setScreen('manage')} />
  }

  if (screen === 'editHighlight') {
    return (
      <HighlightManageScreen
        userLinkId={user.linkId}
        onBack={() => setScreen('manage')}
      />
    )
  }

  if (screen === 'editSNS') {
    return <SNSManageScreen onBack={() => setScreen('manage')} />
  }

  if (screen === 'editReputation') {
    return <ReputationManageScreen currentKeywords={user.selectedKeywords ?? SAMPLE_PROFILE.selectedKeywords} onBack={() => setScreen('manage')} />
  }

  if (screen === 'editContact') {
    return <ContactManageScreen onBack={() => setScreen('manage')} />
  }

  if (screen === 'editGuestbook') {
    return <GuestbookManageScreen onBack={() => setScreen('manage')} />
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// 기본정보 편집 화면
// ─────────────────────────────────────────────────────────────────────────────
function BasicInfoEditScreen({
  user, onBack,
}: {
  user: { name: string; linkId: string; title: string; school: string; bio: string; selectedKeywords?: string[]; avatarColor?: string; avatarImage?: string }
  onBack: () => void
}) {
  const store = useByroStore()
  const [bio, setBio] = useState(user.bio)
  const [avatarImage, setAvatarImage] = useState(user.avatarImage ?? '')
  const [cropSource, setCropSource] = useState('')
  const [cropOpen, setCropOpen] = useState(false)
  const [cropFrame, setCropFrame] = useState({ x: 44, y: 74, width: DEFAULT_CROP_FRAME.width, height: DEFAULT_CROP_FRAME.height })
  const [cropNaturalSize, setCropNaturalSize] = useState({ width: 1, height: 1 })
  const fileInputId = `profile-photo-input-${user.linkId}`
  const dragStartRef = useRef<{ x: number; y: number; frameX: number; frameY: number } | null>(null)
  const resizeStartRef = useRef<{
    x: number
    y: number
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    frame: { x: number; y: number; width: number; height: number }
  } | null>(null)

  const handleSave = () => {
    store.updateUserInfo({ bio, avatarImage })
    showToast('저장됐어요!')
    onBack()
  }

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image()
        img.onload = () => {
          setCropNaturalSize({ width: img.width, height: img.height })
          const initialLayout = getCropImageLayout(img.width, img.height, cropStage)
          setCropSource(reader.result as string)
          setCropFrame(getDefaultCropFrame(initialLayout))
          setCropOpen(true)
        }
        img.src = reader.result
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const cropStage = {
    width: 344,
    height: 468,
  }
  const cropImageLayout = getCropImageLayout(cropNaturalSize.width, cropNaturalSize.height, cropStage)

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      frameX: cropFrame.x,
      frameY: cropFrame.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (resizeStartRef.current) {
      const deltaX = event.clientX - resizeStartRef.current.x
      const deltaY = event.clientY - resizeStartRef.current.y
      setCropFrame(getResizedCropFrame(resizeStartRef.current.frame, resizeStartRef.current.corner, deltaX, deltaY, cropImageLayout))
      return
    }

    if (dragStartRef.current) {
      const deltaX = event.clientX - dragStartRef.current.x
      const deltaY = event.clientY - dragStartRef.current.y
      setCropFrame((prev) => clampCropFrameRect({
        ...prev,
        x: dragStartRef.current!.frameX + deltaX,
        y: dragStartRef.current!.frameY + deltaY,
      }, cropImageLayout))
    }
  }

  const handleCropPointerEnd = () => {
    dragStartRef.current = null
    resizeStartRef.current = null
  }

  const handleFrameResizeStart = (
    event: React.PointerEvent<HTMLButtonElement>,
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  ) => {
    resizeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      corner,
      frame: cropFrame,
    }
    event.stopPropagation()
  }

  const handleApplyCrop = async () => {
    if (!cropSource) return
    const cropped = await renderCroppedImage(cropSource, cropNaturalSize, cropImageLayout, cropFrame)
    setAvatarImage(cropped)
    setCropOpen(false)
    showToast('사진이 적용됐어요')
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.85)] backdrop-blur-md flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">프로필 편집</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5">
          {/* 아바타 */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-[var(--color-text-secondary)] mb-2 bg-[var(--color-bg-muted)] overflow-hidden">
              {avatarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarImage} alt={`${user.name} 프로필 사진`} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarFileChange}
            />
            <label
              htmlFor={fileInputId}
              className="flex cursor-pointer items-center gap-1 text-xs text-[var(--color-text-secondary)]"
            >
              <Camera size={12} /> 사진 변경
            </label>
            <div className="text-[11px] text-[#AAA] mt-1">직사각형 메인 카드와 원형 프로필 이미지에 같이 사용됩니다.</div>
          </div>

          {/* 폼 */}
          <div className="space-y-4 mb-5">
            {/* 이름 — 변경 불가 */}
            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">이름</label>
              <input
                value={user.name}
                disabled
                placeholder="변경 불가"
                className="w-full border border-[#eee] rounded-xl px-4 py-2.5 text-sm bg-[#f9f9f9] text-[#aaa]"
              />
            </div>

            {/* 자기소개 */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-xs text-[var(--color-text-tertiary)]">자기소개</label>
                <button onClick={() => showToast('AI 자기소개 생성 중...')}
                  className="text-xs text-[#E8A000] font-bold">→ AI로 채우기</button>
              </div>
              <TextArea value={bio} onChange={setBio} rows={4} maxLength={300} />
            </div>
          </div>

          <Button onClick={handleSave}>저장</Button>
        </div>
      </div>

      {cropOpen && (
        <div className="absolute inset-0 z-50 bg-black text-white">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <button onClick={() => setCropOpen(false)} className="text-3xl leading-none text-white/86">×</button>
              <div className="text-sm font-semibold text-white/70">사진 자르기</div>
              <button onClick={handleApplyCrop} className="text-2xl leading-none text-white">✓</button>
            </div>

            <div className="flex-1 flex items-center justify-center px-5">
              <div
                className="relative overflow-hidden touch-none select-none"
                style={{ width: `${cropStage.width}px`, height: `${cropStage.height}px` }}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerEnd}
                onPointerCancel={handleCropPointerEnd}
                onPointerLeave={handleCropPointerEnd}
              >
                {cropSource && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cropSource}
                    alt="자르기 미리보기"
                    className="absolute max-w-none object-cover"
                    style={{
                      width: `${cropImageLayout.width}px`,
                      height: `${cropImageLayout.height}px`,
                      left: `${cropImageLayout.left}px`,
                      top: `${cropImageLayout.top}px`,
                    }}
                  />
                )}

                <div
                  className="absolute overflow-hidden pointer-events-none"
                  style={{
                    left: `${cropImageLayout.left}px`,
                    top: `${cropImageLayout.top}px`,
                    width: `${cropImageLayout.width}px`,
                    height: `${cropImageLayout.height}px`,
                  }}
                >
                  <div
                    className="absolute border border-white/16"
                    style={{
                      left: `${cropFrame.x - cropImageLayout.left}px`,
                      top: `${cropFrame.y - cropImageLayout.top}px`,
                      width: `${cropFrame.width}px`,
                      height: `${cropFrame.height}px`,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.52)',
                    }}
                  />
                </div>

                <div
                  className="absolute cursor-move"
                  style={{
                    left: `${cropFrame.x}px`,
                    top: `${cropFrame.y}px`,
                    width: `${cropFrame.width}px`,
                    height: `${cropFrame.height}px`,
                  }}
                  onPointerDown={handleCropPointerDown}
                >
                  <div className="absolute left-0 top-0 h-5 w-5 border-l-[3px] border-t-[3px] border-white/92" />
                  <div className="absolute right-0 top-0 h-5 w-5 border-r-[3px] border-t-[3px] border-white/92" />
                  <div className="absolute left-0 bottom-0 h-5 w-5 border-l-[3px] border-b-[3px] border-white/92" />
                  <div className="absolute right-0 bottom-0 h-5 w-5 border-r-[3px] border-b-[3px] border-white/92" />
                  <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full border border-white/78 bg-white/5"
                    style={{
                      width: `${Math.min(getMaxCropFrameWidth(cropImageLayout) - 48, cropFrame.width - 48)}px`,
                      height: `${Math.min(getMaxCropFrameWidth(cropImageLayout) - 48, cropFrame.width - 48)}px`,
                      top: `${Math.max(28, cropFrame.height * 0.18)}px`,
                    }}
                  />
                </div>

                <button
                  onPointerDown={(event) => handleFrameResizeStart(event, 'top-left')}
                  className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-transparent"
                  style={{
                    left: `${cropFrame.x}px`,
                    top: `${cropFrame.y}px`,
                  }}
                  aria-label="프레임 좌상단 조절"
                />
                <button
                  onPointerDown={(event) => handleFrameResizeStart(event, 'top-right')}
                  className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-transparent"
                  style={{
                    left: `${cropFrame.x + cropFrame.width}px`,
                    top: `${cropFrame.y}px`,
                  }}
                  aria-label="프레임 우상단 조절"
                />
                <button
                  onPointerDown={(event) => handleFrameResizeStart(event, 'bottom-left')}
                  className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-transparent"
                  style={{
                    left: `${cropFrame.x}px`,
                    top: `${cropFrame.y + cropFrame.height}px`,
                  }}
                  aria-label="프레임 좌하단 조절"
                />
                <button
                  onPointerDown={(event) => handleFrameResizeStart(event, 'bottom-right')}
                  className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-transparent"
                  style={{
                    left: `${cropFrame.x + cropFrame.width}px`,
                    top: `${cropFrame.y + cropFrame.height}px`,
                  }}
                  aria-label="프레임 우하단 조절"
                />
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="text-[11px] text-white/68 text-center mb-4">
                프레임을 드래그해 위치를 잡고, 코너 ㄴ 핸들로 잘릴 범위를 조절하세요. 정원형 가이드는 방명록 프로필 사진으로 보이는 영역입니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 하이라이트 관리 화면
// ─────────────────────────────────────────────────────────────────────────────
function HighlightManageScreen({
  userLinkId, onBack,
}: {
  userLinkId: string
  onBack: () => void
}) {
  const store = useByroStore()
  const [mode, setMode] = useState<'list' | 'picker' | 'group' | 'form' | 'cert'>('list')
  const [editingHl, setEditingHl] = useState<typeof SAMPLE_PROFILE.manualHighlights[0] | Highlight | null>(null)
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
  const [hlSourceLabel, setHlSourceLabel] = useState('')
  const [hlLinkUrl, setHlLinkUrl] = useState('')
  const [hlDesc, setHlDesc] = useState('')
  const [yearPickerTarget, setYearPickerTarget] = useState<'career-start' | 'career-end' | 'education-start' | 'education-end' | 'education-year' | null>(null)
  const [selectedCert, setSelectedCert] = useState<(typeof CERTIFICATION_ITEMS)[number] | null>(null)
  const isCareerRole = selectedCat?.id === 'career-role'
  const isEducationHistory = selectedCat?.id === 'education-history'
  const isPublish = selectedCat?.id === 'publish'
  const isArticleInterview = selectedCat?.id === 'article-interview'
  const educationNeedsDegree = hlSchoolType === '대학교' || hlSchoolType === '대학원'
  const educationNeedsMajor = hlSchoolType !== '고등학교'
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index))
  const allManualHighlights = [...SAMPLE_PROFILE.manualHighlights, ...store.highlights]
  const selectedCategoryHighlights = selectedCat
    ? sortHighlightsByPrimary(allManualHighlights.filter((item) => item.categoryId === selectedCat.id), store.primaryHighlightOverrides[selectedCat.id])
    : []
  const groupedCategoryCards = HIGHLIGHT_GROUPS.map((group) => ({
    ...group,
    items: HIGHLIGHT_CATEGORIES
      .filter((cat) => cat.group === group.id)
      .map((cat) => {
        if (cat.certificationOnly) {
          const certItem = CERTIFICATION_ITEMS.find((item) => item.categoryId === cat.id)
          return {
            kind: 'verified' as const,
            category: cat,
            title: VERIFIED_HIGHLIGHT_SUMMARIES[cat.id] ?? certItem?.summary ?? '',
            meta: certItem?.automated ? '본인 확인 후 자동 연동' : '명함 파일 제출 후 확인',
            countLabel: '인증 항목',
          }
        }

        const items = sortHighlightsByPrimary(
          allManualHighlights.filter((item) => item.categoryId === cat.id),
          store.primaryHighlightOverrides[cat.id],
        )
        const preview = getGroupedHighlightPreview(items, store.primaryHighlightOverrides[cat.id])
        return {
          kind: 'manual' as const,
          category: cat,
          title: preview.title || `${cat.label} 항목 추가`,
          meta: preview.meta || '아직 추가된 항목이 없어요',
          countLabel: items.length > 0 ? `${items.length}개 항목` : '0개 항목',
        }
      }),
  }))

  const openEditSheet = (hl: Highlight) => {
    const cat = HIGHLIGHT_CATEGORIES.find((c) => c.id === hl.categoryId) ?? null
    setSelectedCat(cat)
    setHlTitle(hl.title)
    setHlRole(typeof hl.metadata?.role === 'string' ? hl.metadata.role : '')
    setHlSchoolType(typeof hl.metadata?.schoolType === 'string' ? hl.metadata.schoolType : '')
    setHlDegree(typeof hl.metadata?.degree === 'string' ? hl.metadata.degree : '')
    setHlStatus(typeof hl.metadata?.status === 'string' ? hl.metadata.status : '')
    const [parsedStart = '', parsedEnd = ''] = hl.year.split(' - ')
    setHlStartYear(typeof hl.metadata?.startYear === 'string' ? hl.metadata.startYear : parsedStart)
    setHlEndYear(typeof hl.metadata?.endYear === 'string' ? hl.metadata.endYear : (parsedEnd === '현재' ? '' : parsedEnd))
    setHlEducationYear(hl.categoryId !== 'career-role' && hl.categoryId !== 'education-history' ? hl.year : '')
    setHlEducationStartYear(
      hl.categoryId === 'education-history'
        ? (typeof hl.metadata?.startYear === 'string' ? hl.metadata.startYear : parsedStart)
        : '',
    )
    setHlEducationEndYear(
      hl.categoryId === 'education-history'
        ? (typeof hl.metadata?.endYear === 'string' ? hl.metadata.endYear : (parsedEnd === '현재' ? '' : parsedEnd))
        : '',
    )
    setHlSourceLabel(hl.sourceLabel ?? '')
    setHlLinkUrl(hl.linkUrl ?? '')
    setHlDesc(hl.description)
    setEditingHl(hl)
    setMode('form')
  }

  const handleSave = () => {
    if (!selectedCat || !hlTitle.trim()) { showToast('필수 항목을 입력해주세요'); return }
    if (isCareerRole && !hlRole.trim()) { showToast('직함을 입력해주세요'); return }
    if (isCareerRole && !hlStatus) { showToast('상태를 선택해주세요'); return }
    if (isCareerRole && !hlStartYear) { showToast('시작 연도를 선택해주세요'); return }
    if (isCareerRole && hlStatus === '종료' && !hlEndYear) { showToast('종료 연도를 선택해주세요'); return }
    if (isEducationHistory && !hlSchoolType) { showToast('학교 유형을 선택해주세요'); return }
    if (isEducationHistory && educationNeedsDegree && !hlDegree) { showToast('세부 학위를 선택해주세요'); return }
    if (isEducationHistory && educationNeedsMajor && !hlRole.trim()) { showToast('전공을 입력해주세요'); return }
    if (isEducationHistory && !hlStatus) { showToast('상태를 선택해주세요'); return }
    if (isEducationHistory && !hlEducationStartYear) { showToast('입학 연도를 선택해주세요'); return }
    if (isEducationHistory && hlStatus !== '재학' && !hlEducationEndYear) { showToast(hlStatus === '중퇴' ? '중퇴 연도를 선택해주세요' : '졸업 연도를 선택해주세요'); return }
    let metadata: Record<string, string | boolean> | undefined
    if (isEducationHistory) {
      metadata = { status: hlStatus, role: hlRole, degree: hlDegree, schoolType: hlSchoolType, startYear: hlEducationStartYear, endYear: hlStatus === '재학' ? '' : hlEducationEndYear }
    } else if (isCareerRole) {
      metadata = { status: hlStatus, role: hlRole, startYear: hlStartYear, endYear: hlStatus === '종료' ? hlEndYear : '' }
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
    if (editingHl && store.highlights.some((h) => h.id === editingHl.id)) {
      store.updateHighlight(editingHl.id, payload)
    } else {
      store.addHighlight(payload)
    }
    const preservedCategory = selectedCat
    setMode('group')
    resetAddForm()
    setSelectedCat(preservedCategory)
    showToast(editingHl ? '수정됐어요!' : '추가됐어요!')
  }

  const resetAddForm = () => {
    setSelectedCat(null)
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

  if (mode === 'cert' && selectedCert) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
          <button onClick={() => { setSelectedCert(null); setMode('picker') }} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
          <span className="text-base font-black">{selectedCert.title} 인증</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="surface-card rounded-[28px] p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
              <HighlightIcon id={selectedCert.icon as HighlightIconId} size={20} />
            </div>
            <div className="mt-4 text-[22px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">{selectedCert.title}</div>
            <div className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {selectedCert.summary}
            </div>
          </div>

          <div className="surface-card mt-4 rounded-[28px] p-5">
            <div className="text-sm font-bold text-[var(--color-text-strong)]">인증 방법</div>
            {selectedCert.automated ? (
              <>
                <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <p>1. 본인확인을 진행하면 필요한 정보를 자동으로 불러와요.</p>
                  <p>2. 확인이 끝나면 하이라이트에 인증 항목으로 바로 반영돼요.</p>
                </div>
                <div className="mt-5 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                  별도 파일을 보내지 않아도 돼요. 본인확인만 완료되면 자동으로 진행됩니다.
                </div>
              </>
            ) : (
              <>
                <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <p>1. 리멤버 앱에서 명함 내보내기 파일을 준비해주세요.</p>
                  <p>2. 아래 이메일 주소로 파일을 보내주시면 확인 후 반영돼요.</p>
                </div>
                <div className="mt-5 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
                  <div className="micro-text mb-2">나의 Byro 인증 이메일 주소</div>
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 truncate text-sm font-mono font-bold text-[var(--color-text-strong)]">
                      {userLinkId}@data.byro.io
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${userLinkId}@data.byro.io`).catch(() => {})
                        showToast('복사됐어요!')
                      }}
                      className="rounded-xl bg-[var(--color-accent-dark)] px-3 py-2 text-xs font-semibold text-white"
                    >
                      복사
                    </button>
                  </div>
                  <div className="micro-text mt-3">{selectedCert.emailLabel}</div>
                </div>
              </>
            )}

            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={() => { setSelectedCert(null); setMode('picker') }}>이전</Button>
              <Button onClick={() => { setSelectedCert(null); setMode('list'); showToast('인증 메일 발송 후 반영을 기다려주세요') }}>확인</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'group' && selectedCat) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
          <button onClick={() => { resetAddForm(); setMode('list') }} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
          <span className="text-base font-black">{selectedCat.label} 관리</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="surface-card mb-4 rounded-[26px] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-strong)]">
                <HighlightIcon id={selectedCat.icon as HighlightIconId} size={16} />
              </span>
              <div>
                <div className="text-[15px] font-bold text-[var(--color-text-strong)]">{selectedCat.label}</div>
                <div className="micro-text">여러 항목을 추가하고 메인으로 보여줄 항목을 선택할 수 있어요</div>
              </div>
            </div>
          </div>

          {selectedCategoryHighlights.length > 0 ? (
            <div className="space-y-3">
              {selectedCategoryHighlights.map((item) => {
                const isEditable = store.highlights.some((highlight) => highlight.id === item.id)
                const metaParts = getHighlightMetaParts(item)
                return (
                  <div key={item.id} className="surface-card rounded-[24px] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-bold text-[var(--color-text-strong)]">{item.title}</div>
                        {metaParts.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            {metaParts.map((part, partIndex) => (
                              <span
                                key={`${item.id}-group-meta-${partIndex}`}
                                className={`text-[11px] ${partIndex === 0 ? 'font-semibold text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'}`}
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
                        <span className="rounded-full bg-[#E8F5EC] px-2.5 py-1 text-[11px] font-semibold text-[#217A43]">메인 노출 중</span>
                      ) : (
                        <button
                          onClick={() => {
                            store.setHighlightPrimary(selectedCat.id, item.id)
                            showToast('메인 항목으로 설정했어요')
                          }}
                          className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]"
                        >
                          메인으로 설정
                        </button>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          if (isEditable) openEditSheet(item)
                          else showToast('기본 목업 항목은 수정하지 않습니다')
                        }}
                        className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {
                          if (isEditable) {
                            store.removeHighlight(item.id)
                            showToast('삭제됐어요')
                            return
                          }
                          showToast('기본 목업 항목은 삭제하지 않습니다')
                        }}
                        className="rounded-lg border border-[#F2C7C5] px-3 py-1.5 text-xs font-medium text-[#C9473D]"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-10 text-center text-sm text-[var(--color-text-tertiary)]">
              아직 추가한 {selectedCat.label.toLowerCase()} 항목이 없어요
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border-soft)] px-5 py-4">
          <Button
            onClick={() => {
              setEditingHl(null)
              setHlTitle('')
              setHlRole('')
              setHlSchoolType('')
              setHlDegree('')
              setHlStatus('')
              setHlStartYear('')
              setHlEndYear('')
              setHlEducationYear('')
              setHlSourceLabel('')
              setHlLinkUrl('')
              setHlDesc('')
              setYearPickerTarget(null)
              setMode('form')
            }}
          >
            + {selectedCat.label} 추가
          </Button>
        </div>
      </div>
    )
  }

  if (mode === 'form') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
          <button onClick={() => { resetAddForm(); setMode(selectedCat ? 'group' : 'picker') }} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
          <span className="text-base font-black">{editingHl ? '하이라이트 수정하기' : '하이라이트 추가하기'}</span>
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
              <input value={hlTitle} onChange={(e) => setHlTitle(e.target.value)} placeholder={isCareerRole ? '회사명' : isEducationHistory ? '학교명' : '제목'}
                className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none" />
              {(isPublish || isArticleInterview) && (
                <input
                  value={hlSourceLabel}
                  onChange={(e) => setHlSourceLabel(e.target.value)}
                  placeholder={isPublish ? '출판사 또는 매체명' : '매체명'}
                  className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none"
                />
              )}
              {isEducationHistory && educationNeedsMajor && (
                <input value={hlRole} onChange={(e) => setHlRole(e.target.value)} placeholder="전공"
                  className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none" />
              )}
              {isCareerRole && (
                <input value={hlRole} onChange={(e) => setHlRole(e.target.value)} placeholder="직함"
                  className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none" />
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
                  onChange={(e) => setHlLinkUrl(e.target.value)}
                  placeholder="기사 URL"
                  className="w-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none"
                />
              )}
              {!isEducationHistory && (
                <TextArea value={hlDesc} onChange={setHlDesc} placeholder={isCareerRole ? '어떤 일을 했는지 적어주세요' : isPublish ? '어떤 출판 또는 기고인지 적어주세요' : isArticleInterview ? '기사나 인터뷰에 대한 설명을 적어주세요' : '어떤 경험인지 간단히 적어주세요'} maxLength={150} rows={4} />
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode(selectedCat ? 'group' : 'picker')}>이전</Button>
              <Button onClick={handleSave} disabled={!selectedCat || !hlTitle.trim() || (isCareerRole && (!hlRole.trim() || !hlStatus || !hlStartYear || (hlStatus === '종료' && !hlEndYear))) || (isEducationHistory && (!hlSchoolType || (educationNeedsDegree && !hlDegree) || (educationNeedsMajor && !hlRole.trim()) || !hlStatus || !hlEducationStartYear || (hlStatus !== '재학' && !hlEducationEndYear)))}>{editingHl ? '수정하기' : '저장하기'}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'picker') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
          <button onClick={() => setMode('list')} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
          <span className="text-base font-black">하이라이트 추가</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 pb-8">
          <div className="space-y-6">
            {HIGHLIGHT_GROUPS.map((group, groupIndex) => (
              <div key={group.id} className={groupIndex > 0 ? 'border-t border-[var(--color-border-soft)] pt-5' : ''}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="rounded-full bg-[var(--color-bg-muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">{group.label}</div>
                  <div className="text-[10px] font-semibold text-[var(--color-text-tertiary)]">
                    {HIGHLIGHT_CATEGORIES.filter((cat) => cat.group === group.id).length}개 항목
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {HIGHLIGHT_CATEGORIES.filter((cat) => cat.group === group.id).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (cat.certificationOnly) {
                          const certItem = CERTIFICATION_ITEMS.find((item) => item.categoryId === cat.id)
                          if (certItem) {
                            setSelectedCert(certItem)
                            setMode('cert')
                          }
                          return
                        }
                        setSelectedCat(cat)
                        setMode('group')
                      }}
                      className="settings-row-light relative overflow-visible px-3 py-4 text-center"
                    >
                      {cat.certificationOnly && (
                        <span className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-state-success-text)]">
                          <BadgeCheck size={14} />
                        </span>
                      )}
                      <div className="mx-auto mb-2 flex items-center justify-center text-[var(--color-text-secondary)]">
                        <HighlightIcon id={cat.icon as HighlightIconId} size={16} />
                      </div>
                      <div className="text-[12px] font-bold leading-[1.4] text-[var(--color-text-primary)] break-keep">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">하이라이트 관리</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
        <div className="settings-shell mb-5 px-4 py-4">
          <div className="text-[17px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">하이라이트 관리</div>
          <div className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            카테고리별로 항목을 정리하고, 메인으로 보여줄 내용을 선택하세요.
          </div>
        </div>

        <div className="space-y-6">
          {groupedCategoryCards.map((group) => (
            <div key={group.id}>
              <div className="mb-3 flex items-center gap-3">
                <div className="text-sm font-bold text-[#7E766E]">{group.label}</div>
                <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
              </div>
              {group.items.length > 0 ? (
                <div className="space-y-3">
                  {group.items.map((entry) => {
                    return (
                      <button
                        key={`${entry.category.id}-${group.id}`}
                        onClick={() => {
                          if (entry.kind === 'verified') {
                            const certItem = CERTIFICATION_ITEMS.find((item) => item.categoryId === entry.category.id)
                            if (certItem) {
                              setSelectedCert(certItem)
                              setMode('cert')
                            }
                            return
                          }
                          setSelectedCat(entry.category)
                          setMode('group')
                        }}
                      className="settings-row-light flex w-full items-center gap-3 px-4 py-4 text-left"
                      >
                        <span className="flex h-11 w-8 shrink-0 items-center justify-center text-[var(--color-text-strong)]">
                          <HighlightIcon id={entry.category.icon as HighlightIconId} size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{entry.category.label}</span>
                            {entry.kind === 'verified' && (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-state-success-text)]">
                                <BadgeCheck size={12} />
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-[15px] font-bold text-[var(--color-text-strong)]">
                            {entry.title}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[11px] text-[var(--color-text-tertiary)]">{entry.meta}</span>
                            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{entry.countLabel}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} color="#888" />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-10 text-center text-sm text-[var(--color-text-tertiary)]">
                  아직 {group.label.toLowerCase()} 하이라이트가 없어요
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => { resetAddForm(); setMode('picker') }}
          className="w-full border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] rounded-xl py-3 text-sm font-semibold text-[var(--color-text-primary)] mt-6"
        >
          + 하이라이트 추가하기
        </button>
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

const CROP_RATIO = 4 / 5
const DEFAULT_CROP_FRAME = { width: 256, height: 320 }

function getMaxCropFrameWidth(imageLayout: { width: number; height: number }) {
  return Math.min(imageLayout.width, imageLayout.height * CROP_RATIO)
}

function getDefaultCropFrame(imageLayout: { width: number; height: number; left: number; top: number }) {
  const width = Math.max(DEFAULT_CROP_FRAME.width, getMaxCropFrameWidth(imageLayout))
  const clampedWidth = Math.min(width, getMaxCropFrameWidth(imageLayout))
  const height = clampedWidth / CROP_RATIO
  return {
    x: imageLayout.left + (imageLayout.width - clampedWidth) / 2,
    y: imageLayout.top + (imageLayout.height - height) / 2,
    width: clampedWidth,
    height,
  }
}

function clampCropFrameWidth(width: number, imageLayout: { width: number; height: number }) {
  const minWidth = 180
  const maxWidth = getMaxCropFrameWidth(imageLayout)
  return Math.max(minWidth, Math.min(maxWidth, width))
}

function clampCropFrameRect(
  frame: { x: number; y: number; width: number; height: number },
  imageLayout: { width: number; height: number; left: number; top: number },
) {
  return {
    ...frame,
    x: Math.max(imageLayout.left, Math.min(imageLayout.left + imageLayout.width - frame.width, frame.x)),
    y: Math.max(imageLayout.top, Math.min(imageLayout.top + imageLayout.height - frame.height, frame.y)),
  }
}

function getResizedCropFrame(
  frame: { x: number; y: number; width: number; height: number },
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  deltaX: number,
  deltaY: number,
  imageLayout: { width: number; height: number; left: number; top: number },
) {
  const directionX = corner.includes('left') ? -1 : 1
  const directionY = corner.includes('top') ? -1 : 1
  const primaryDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX * directionX : deltaY * directionY * CROP_RATIO
  const nextWidth = clampCropFrameWidth(frame.width + primaryDelta, imageLayout)
  const nextHeight = nextWidth / CROP_RATIO

  let nextX = frame.x
  let nextY = frame.y

  if (corner.includes('left')) nextX = frame.x + (frame.width - nextWidth)
  if (corner.includes('top')) nextY = frame.y + (frame.height - nextHeight)

  return clampCropFrameRect({
    x: nextX,
    y: nextY,
    width: nextWidth,
    height: nextHeight,
  }, imageLayout)
}

function getCropImageLayout(
  imageWidth: number,
  imageHeight: number,
  stage: { width: number; height: number },
) {
  const scale = Math.max(stage.width / imageWidth, stage.height / imageHeight)
  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
    left: (stage.width - imageWidth * scale) / 2,
    top: (stage.height - imageHeight * scale) / 2,
  }
}

async function renderCroppedImage(
  src: string,
  naturalSize: { width: number; height: number },
  imageLayout: { width: number; height: number; left: number; top: number },
  frame: { x: number; y: number; width: number; height: number },
) {
  const image = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(frame.width)
  canvas.height = Math.round(frame.height)
  const context = canvas.getContext('2d')
  if (!context) return src

  const scaleX = naturalSize.width / imageLayout.width
  const scaleY = naturalSize.height / imageLayout.height
  const sourceX = Math.max(0, (frame.x - imageLayout.left) * scaleX)
  const sourceY = Math.max(0, (frame.y - imageLayout.top) * scaleY)
  const sourceWidth = Math.min(naturalSize.width - sourceX, frame.width * scaleX)
  const sourceHeight = Math.min(naturalSize.height - sourceY, frame.height * scaleY)

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    frame.width,
    frame.height,
  )

  return canvas.toDataURL('image/jpeg', 0.92)
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}
