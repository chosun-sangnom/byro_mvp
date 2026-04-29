'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, ChevronDown, ChevronUp, Camera, Mail, MessageCircle, Phone } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, BottomSheet, Modal, YearPickerSheet, showToast, TextArea } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { CareerContinuityChart } from '@/components/highlights/CareerContinuityChart'
import { CorporateLongevityTimeline } from '@/components/highlights/CorporateLongevityTimeline'
import { RememberNetworkGraph } from '@/components/highlights/RememberNetworkGraph'
import { AirlineMileageSummary } from '@/components/highlights/AirlineMileageSummary'
import type { Highlight, ContactChannel, UserState, HighlightIconId } from '@/types'
import {
  SAMPLE_PROFILE, INSTAGRAM_PROFILE, LINKEDIN_PROFILE, getProfileAvatar,
  HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS, KEYWORD_GROUPS,
} from '@/lib/mockData'
import { getGroupedHighlightPreview, getHighlightDetailFootnote, getHighlightMetaParts, isPrimaryHighlight, sortHighlightsByPrimary } from '@/lib/highlightMeta'
import PublicProfile from '@/components/screens/profile/PublicProfile'

type Screen = 'preview' | 'manage' | 'editBasic' | 'editHighlight' | 'editSNS' | 'editReputation' | 'editContact' | 'editGuestbook'
type SectionKey = 'sns' | 'highlight' | 'reputation' | 'guestbook'

const SECTION_LABELS: Record<SectionKey, string> = {
  sns: 'SNS 연동',
  highlight: '하이라이트',
  reputation: '평판 키워드',
  guestbook: '방명록',
}

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
  const sectionOrder: SectionKey[] = ['reputation', 'guestbook', 'sns', 'highlight']

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
        sectionOrder={sectionOrder}
        store={store}
        instagramConnected={instagramConnected}
        linkedinConnected={linkedinConnected}
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

function ManageByroScreen({
  allHighlights,
  connectedSnsCount,
  totalReputationCount,
  sectionOrder,
  store,
  instagramConnected,
  linkedinConnected,
  onBack,
  onEditBasic,
  onEditHighlight,
  onEditSNS,
  onEditReputation,
  onEditContact,
  onEditGuestbook,
  user,
}: {
  allHighlights: Highlight[]
  connectedSnsCount: number
  totalReputationCount: number
  sectionOrder: SectionKey[]
  store: {
    logout: () => void
    hlOpenStates: Record<string, boolean>
    toggleHlOpen: (id: string) => void
  }
  instagramConnected: boolean
  linkedinConnected: boolean
  onBack: () => void
  onEditBasic: () => void
  onEditHighlight: () => void
  onEditSNS: () => void
  onEditReputation: () => void
  onEditContact: () => void
  onEditGuestbook: () => void
  user: UserState
}) {
  const activeContactCount = user.contactChannels?.filter((channel) => channel.enabled && channel.value.trim()).length ?? 0
  const completionChecks = [
    { label: '프로필 사진', done: Boolean(user.avatarImage) },
    { label: '자기소개', done: user.bio.trim().length >= 20 },
    { label: '연락 수단', done: activeContactCount > 0 },
    { label: 'SNS 연동', done: connectedSnsCount > 0 },
    { label: '하이라이트', done: allHighlights.length > 0 },
  ]
  const completionPercent = Math.round((completionChecks.filter((item) => item.done).length / completionChecks.length) * 100)
  const remainingItems = completionChecks.filter((item) => !item.done).slice(0, 3)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[#555] mr-3 leading-none">‹</button>
        <span className="text-base font-black flex-1">Byro 편집</span>
        <button onClick={() => store.logout()} className="text-xs text-[#888]">로그아웃</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-5 py-4">
          <div className="surface-card mb-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-[var(--color-text-strong)]">프로필 완성도 {completionPercent}%</div>
                <div className="meta-text mt-1">
                  {remainingItems.length > 0
                    ? `${remainingItems.map((item) => item.label).join(', ')} 항목을 채우면 더 좋아져요.`
                    : '기본 프로필 구성이 완료됐어요.'}
                </div>
              </div>
              <div className="rounded-full bg-[var(--color-bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                {completionChecks.filter((item) => item.done).length}/{completionChecks.length}
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
              <div className="h-full rounded-full bg-[var(--color-accent-dark)]" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>

          <div className="surface-card-soft p-4">
            <div className="text-sm font-black text-[var(--color-text-strong)] mb-1">공개 프로필 관리</div>
            <div className="meta-text mb-4 leading-relaxed">내 Byro와 공개 프로필은 같은 화면을 사용합니다. 아래에서 노출 정보와 연결 수단을 관리하세요.</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onEditBasic} className="rounded-[18px] border bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]" style={{ borderColor: 'var(--color-border-default)' }}>기본정보 편집</button>
              <button onClick={onEditContact} className="rounded-[18px] px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-accent-dark)' }}>연락 수단 관리</button>
            </div>
          </div>
        </div>

        <div className="px-5 pt-1">
          {sectionOrder.map((key) => (
            <div key={key} className="mb-1">
              <div className="flex items-center py-2.5 border-b border-[#f5f5f5]">
                <span className="mr-2">
                  {key === 'sns' && '📱'}
                  {key === 'highlight' && '✨'}
                  {key === 'reputation' && '✏️'}
                  {key === 'guestbook' && '🗣️'}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-bold">{SECTION_LABELS[key]}</div>
                  <div className="text-[11px] text-[#888]">
                    {key === 'sns' && `${connectedSnsCount}개 연동됨`}
                    {key === 'highlight' && `인증 4개 · 직접 입력 ${allHighlights.length}개`}
                    {key === 'reputation' && `방문자가 남긴 키워드 ${totalReputationCount}회`}
                    {key === 'guestbook' && `최근 메시지 ${SAMPLE_PROFILE.guestbook.length}개`}
                  </div>
                </div>
                {(key === 'sns' || key === 'highlight' || key === 'reputation') && (
                  <button
                    onClick={() => {
                      if (key === 'sns') onEditSNS()
                      if (key === 'highlight') onEditHighlight()
                      if (key === 'reputation') onEditReputation()
                    }}
                    className="text-xs border border-[#90CAF9] text-[#0D47A1] rounded-full px-2.5 py-1"
                  >
                    관리
                  </button>
                )}
              </div>

              <div className="py-3">
                {key === 'sns' && (
                  <SectionSNS instagramConnected={instagramConnected} linkedinConnected={linkedinConnected} />
                )}
                {key === 'highlight' && (
                  <div className="space-y-1.5 mb-2">
                    <ExpandablePreviewRow
                      icon="briefcase"
                      title="커리어 지속성"
                      subtitle="건강보험공단 기준 · 2026.04 인증"
                      badge="인증됨"
                      badgeTone="verified"
                      open={store.hlOpenStates.career_main ?? false}
                      onToggle={() => store.toggleHlOpen('career_main')}
                      detail={<div className="text-[11px] text-[#666] mt-2">평균 재직 {SAMPLE_PROFILE.careerHighlight.avgYears}년 · 업계 대비 +{SAMPLE_PROFILE.careerHighlight.vsIndustryPercent}%</div>}
                    />
                    <ExpandablePreviewRow
                      icon="users"
                      title="리멤버 직업 네트워크"
                      subtitle="스타트업·마케팅 중심 인맥"
                      badge="인증됨"
                      badgeTone="verified"
                      open={store.hlOpenStates.remember_main ?? false}
                      onToggle={() => store.toggleHlOpen('remember_main')}
                      detail={<div className="text-[11px] text-[#666] mt-2">스타트업 38% · 마케팅 24% · IT 22% · 투자 16%</div>}
                    />
                    {allHighlights.slice(0, 2).map((h) => (
                      <ExpandablePreviewRow
                        key={h.id}
                        icon={h.icon}
                        title={h.title}
                        subtitle={[h.year, h.subtitle].filter(Boolean).join(' · ')}
                        badge="직접 입력"
                        badgeTone="draft"
                        open={store.hlOpenStates[`main_${h.id}`] ?? false}
                        onToggle={() => store.toggleHlOpen(`main_${h.id}`)}
                        detail={h.description ? <div className="text-[11px] text-[#666] mt-2">{h.description}</div> : undefined}
                      />
                    ))}
                    {allHighlights.length > 2 && <div className="text-xs text-[#AAA]">외 {allHighlights.length - 2}개 더 있음</div>}
                  </div>
                )}
                {key === 'reputation' && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {SAMPLE_PROFILE.reputationKeywords.map((item) => (
                      <div key={item.keyword} className="bg-[#0A0A0A] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        {item.keyword} <span className="opacity-60">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
                {key === 'guestbook' && (
                  <>
                    <SectionGuestbook entries={SAMPLE_PROFILE.guestbook.slice(0, 3)} />
                    <button
                      onClick={onEditGuestbook}
                      className="mt-2 w-full rounded-[14px] border border-[#E5E5E5] px-3 py-2 text-xs font-semibold text-[#555]"
                    >
                      방명록 관리
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ExpandablePreviewRow({
  icon,
  title,
  subtitle,
  badge,
  badgeTone,
  open,
  onToggle,
  detail,
}: {
  icon: HighlightIconId
  title: string
  subtitle: string
  badge: string
  badgeTone: 'verified' | 'draft'
  open: boolean
  onToggle: () => void
  detail?: React.ReactNode
}) {
  return (
    <button onClick={onToggle} className="w-full text-left">
      <div className="flex items-start gap-2 py-1.5">
        <span className="mt-0.5 text-[var(--color-text-strong)]">
          <HighlightIcon id={icon} size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="text-sm font-semibold text-[#111] truncate">{title}</div>
            <span
              className={[
                'text-[10px] font-bold rounded-full px-2 py-0.5',
                badgeTone === 'verified'
                  ? 'text-[#1A7A1A] bg-[#E6F5E6]'
                  : 'text-[#666] bg-[#EFEFEF]',
              ].join(' ')}
            >
              {badge}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[11px] text-[#888] leading-relaxed flex-1">{subtitle}</div>
            {open ? <ChevronUp size={14} color="#888" /> : <ChevronDown size={14} color="#888" />}
          </div>
          {open && detail}
        </div>
      </div>
    </button>
  )
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
      <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[#555] mr-3 leading-none">‹</button>
        <span className="text-base font-black">프로필 편집</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5">
          {/* 아바타 */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-[#555] mb-2 bg-[#E8DED7] overflow-hidden">
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
              className="flex cursor-pointer items-center gap-1 text-xs text-[#555]"
            >
              <Camera size={12} /> 사진 변경
            </label>
            <div className="text-[11px] text-[#AAA] mt-1">직사각형 메인 카드와 원형 프로필 이미지에 같이 사용됩니다.</div>
          </div>

          {/* 폼 */}
          <div className="space-y-4 mb-5">
            {/* 이름 — 변경 불가 */}
            <div>
              <label className="text-xs text-[#888] mb-1 block">이름</label>
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
                <label className="text-xs text-[#888]">자기소개</label>
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
  const [hlDesc, setHlDesc] = useState('')
  const [yearPickerTarget, setYearPickerTarget] = useState<'career-start' | 'career-end' | 'education-year' | null>(null)
  const [selectedCert, setSelectedCert] = useState<(typeof CERTIFICATION_ITEMS)[number] | null>(null)
  const isCareerRole = selectedCat?.id === 'career-role'
  const isEducationHistory = selectedCat?.id === 'education-history'
  const educationNeedsDegree = hlSchoolType === '대학교' || hlSchoolType === '대학원'
  const educationNeedsMajor = hlSchoolType !== '고등학교'
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index))
  const allManualHighlights = [...SAMPLE_PROFILE.manualHighlights, ...store.highlights]
  const selectedCategoryHighlights = selectedCat
    ? sortHighlightsByPrimary(allManualHighlights.filter((item) => item.categoryId === selectedCat.id))
    : []
  const groupedHighlights = HIGHLIGHT_GROUPS.map((group) => {
    const verifiedItems = CERTIFICATION_ITEMS.filter((item) => {
      const category = HIGHLIGHT_CATEGORIES.find((cat) => cat.id === item.categoryId)
      return category?.group === group.id
    }).map((item) => ({ kind: 'verified' as const, item }))

    const manualItems = allManualHighlights.filter(
      (item) => HIGHLIGHT_CATEGORIES.find((cat) => cat.id === item.categoryId)?.group === group.id,
    )

    const manualGroups = Array.from(new Map(
      manualItems.map((item) => [item.categoryId, sortHighlightsByPrimary(manualItems.filter((manual) => manual.categoryId === item.categoryId))]),
    ).entries()).map(([categoryId, items]) => ({
      kind: 'manual-group' as const,
      categoryId,
      items,
    }))

    return {
      ...group,
      items: [...verifiedItems, ...manualGroups],
    }
  })

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
    setHlEducationYear(hl.categoryId === 'education-history' ? hl.year : '')
    setHlDesc(hl.description)
    setEditingHl(hl)
    setMode('form')
  }

  const handleSave = (continueAdding = false) => {
    if (!selectedCat || !hlTitle.trim()) { showToast('필수 항목을 입력해주세요'); return }
    if (isCareerRole && !hlRole.trim()) { showToast('직함을 입력해주세요'); return }
    if (isCareerRole && !hlStatus) { showToast('상태를 선택해주세요'); return }
    if (isCareerRole && !hlStartYear) { showToast('시작 연도를 선택해주세요'); return }
    if (isCareerRole && hlStatus === '종료' && !hlEndYear) { showToast('종료 연도를 선택해주세요'); return }
    if (isEducationHistory && !hlSchoolType) { showToast('학교 유형을 선택해주세요'); return }
    if (isEducationHistory && educationNeedsDegree && !hlDegree) { showToast('세부 학위를 선택해주세요'); return }
    if (isEducationHistory && educationNeedsMajor && !hlRole.trim()) { showToast('전공을 입력해주세요'); return }
    if (isEducationHistory && !hlStatus) { showToast('상태를 선택해주세요'); return }
    let metadata: Record<string, string | boolean> | undefined
    if (isEducationHistory) {
      metadata = { status: hlStatus, role: hlRole, degree: hlDegree, schoolType: hlSchoolType }
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
        : hlEducationYear,
      metadata,
    }
    if (editingHl && store.highlights.some((h) => h.id === editingHl.id)) {
      store.updateHighlight(editingHl.id, payload)
    } else {
      store.addHighlight(payload)
    }
    setEditingHl(null)
    if (continueAdding && !editingHl) {
      const preservedCategory = selectedCat
      resetAddForm()
      setSelectedCat(preservedCategory)
      setMode('form')
      showToast('추가됐어요. 같은 항목을 계속 입력할 수 있어요!')
      return
    }
    setMode('group')
    resetAddForm()
    showToast(editingHl ? '수정됐어요!' : '추가됐어요!')
  }

  const [certOpen, setCertOpen] = useState<Record<string, boolean>>({})

  const toggleCert = (title: string) => setCertOpen((p) => ({ ...p, [title]: !p[title] }))

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
    setHlDesc('')
    setEditingHl(null)
    setYearPickerTarget(null)
  }

  if (mode === 'cert' && selectedCert) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
          <button onClick={() => { setSelectedCert(null); setMode('picker') }} className="text-xl text-[#555] mr-3 leading-none">‹</button>
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
                <div className="mt-5 rounded-[22px] border border-[#E7E2DC] bg-[var(--color-bg-soft)] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                  별도 파일을 보내지 않아도 돼요. 본인확인만 완료되면 자동으로 진행됩니다.
                </div>
              </>
            ) : (
              <>
                <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <p>1. 리멤버 앱에서 명함 내보내기 파일을 준비해주세요.</p>
                  <p>2. 아래 이메일 주소로 파일을 보내주시면 확인 후 반영돼요.</p>
                </div>
                <div className="mt-5 rounded-[22px] border border-[#E7E2DC] bg-[var(--color-bg-soft)] px-4 py-4">
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
        <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
          <button onClick={() => { resetAddForm(); setMode('picker') }} className="text-xl text-[#555] mr-3 leading-none">‹</button>
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
                <div className="micro-text">여러 항목을 추가하고 대표로 보여줄 항목을 선택할 수 있어요</div>
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
                      {isPrimaryHighlight(item) ? (
                        <span className="rounded-full bg-[#E8F5EC] px-2.5 py-1 text-[11px] font-semibold text-[#217A43]">대표</span>
                      ) : isEditable ? (
                        <button
                          onClick={() => {
                            store.setHighlightPrimary(item.id)
                            showToast('대표 항목으로 설정했어요')
                          }}
                          className="rounded-full border border-[#D7D0C8] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]"
                        >
                          대표로 설정
                        </button>
                      ) : (
                        <span className="rounded-full bg-[#F6F3EF] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-tertiary)]">기본</span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          if (isEditable) openEditSheet(item)
                          else showToast('기본 목업 항목은 수정하지 않습니다')
                        }}
                        className="rounded-lg border border-[#CFC7BF] px-3 py-1.5 text-xs font-medium text-[#555]"
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
            <div className="rounded-[22px] border border-dashed border-[#E7E2DC] bg-white px-4 py-10 text-center text-sm text-[#A29B93]">
              아직 추가한 {selectedCat.label.toLowerCase()} 항목이 없어요
            </div>
          )}
        </div>

        <div className="border-t border-[#EBEBEB] px-5 py-4">
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
        <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
          <button onClick={() => { resetAddForm(); setMode(selectedCat ? 'group' : 'picker') }} className="text-xl text-[#555] mr-3 leading-none">‹</button>
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
                className="w-full rounded-2xl border border-[#E7E2DC] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none" />
              {isEducationHistory && educationNeedsMajor && (
                <input value={hlRole} onChange={(e) => setHlRole(e.target.value)} placeholder="전공"
                  className="w-full rounded-2xl border border-[#E7E2DC] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none" />
              )}
              {isCareerRole && (
                <input value={hlRole} onChange={(e) => setHlRole(e.target.value)} placeholder="직함"
                  className="w-full rounded-2xl border border-[#E7E2DC] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none" />
              )}
              {isCareerRole && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setYearPickerTarget('career-start')}
                    className="rounded-2xl border border-[#E7E2DC] bg-[var(--color-bg-soft)] px-4 py-3 text-left text-sm"
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
                    className="rounded-2xl border border-[#E7E2DC] bg-[var(--color-bg-soft)] px-4 py-3 text-left text-sm disabled:opacity-40"
                    style={{ color: hlStatus === '재직 중' ? 'var(--color-text-tertiary)' : (hlEndYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)') }}
                  >
                    {hlStatus === '재직 중' ? '현재' : (hlEndYear || '종료 연도')}
                  </button>
                </div>
              )}
              {isEducationHistory && (
                <button
                  onClick={() => setYearPickerTarget('education-year')}
                  className="w-full rounded-2xl border border-[#E7E2DC] bg-[var(--color-bg-soft)] px-4 py-3 text-left text-sm"
                  style={{ color: hlEducationYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                >
                  {hlEducationYear || '연도 선택'}
                </button>
              )}
              {isCareerRole && (
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
              {!isEducationHistory && (
                <TextArea value={hlDesc} onChange={setHlDesc} placeholder={isCareerRole ? '어떤 일을 했는지 적어주세요' : '어떤 경험인지 간단히 적어주세요'} maxLength={150} rows={4} />
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode(selectedCat ? 'group' : 'picker')}>이전</Button>
              <Button onClick={() => handleSave(false)} disabled={!selectedCat || !hlTitle.trim() || (isCareerRole && (!hlRole.trim() || !hlStatus || !hlStartYear || (hlStatus === '종료' && !hlEndYear))) || (isEducationHistory && (!hlSchoolType || (educationNeedsDegree && !hlDegree) || (educationNeedsMajor && !hlRole.trim()) || !hlStatus))}>{editingHl ? '수정하기' : '저장하기'}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'picker') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
          <button onClick={() => setMode('list')} className="text-xl text-[#555] mr-3 leading-none">‹</button>
          <span className="text-base font-black">하이라이트 추가</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 pb-8">
          <div className="space-y-6">
            {HIGHLIGHT_GROUPS.map((group, groupIndex) => (
              <div key={group.id} className={groupIndex > 0 ? 'border-t border-[var(--color-border-soft)] pt-5' : ''}>
                <div className="mb-3 text-sm font-bold text-[var(--color-text-secondary)]">{group.label}</div>
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
                      className="relative overflow-visible rounded-[20px] border border-[var(--color-border-default)] bg-white px-3 py-4 text-center shadow-[0_4px_14px_rgba(17,17,17,0.03)]"
                    >
                      {cat.certificationOnly && (
                        <span className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#217A43] shadow-[0_4px_12px_rgba(17,17,17,0.10)]">
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
      <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[#555] mr-3 leading-none">‹</button>
        <span className="text-base font-black">하이라이트 관리</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
        <div className="rounded-[18px] bg-[#EEF8F0] px-4 py-3 text-sm font-semibold text-[#3F7B54] mb-6">
          표시 항목은 인증 연동이 가능해요
        </div>

        <div className="space-y-6">
          {groupedHighlights.map((group) => (
            <div key={group.id}>
              <div className="mb-3 text-sm font-bold text-[#7E766E]">{group.label}</div>
              {group.items.length > 0 ? (
                <div className="space-y-3">
                  {group.items.map((entry) => {
                    if (entry.kind === 'verified') {
                      const isOpen = certOpen[entry.item.title]
                      return (
                        <div key={entry.item.categoryId} className="overflow-hidden rounded-[22px] border border-[#E7E2DC] bg-white">
                          <button onClick={() => toggleCert(entry.item.title)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
                            <span className="flex h-11 w-8 items-center justify-center text-[var(--color-text-strong)]">
                              <HighlightIcon id={entry.item.icon as HighlightIconId} size={18} />
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{entry.item.title}</span>
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#217A43] shadow-[0_2px_8px_rgba(17,17,17,0.08)]">
                                  <BadgeCheck size={12} />
                                </span>
                              </div>
                              <div className="mt-1 text-[15px] font-bold text-[var(--color-text-strong)]">
                                {VERIFIED_HIGHLIGHT_SUMMARIES[entry.item.categoryId] ?? entry.item.summary}
                              </div>
                            </div>
                            {isOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                          </button>
                          {isOpen && (
                            <div className="border-t border-[#F1ECE6] bg-[#FBFAF8] px-4 py-4">
                              {entry.item.categoryId === 'career-continuity' && (
                                <CareerContinuityChart
                                  avgYears={SAMPLE_PROFILE.careerHighlight.avgYears}
                                  vsIndustryPercent={SAMPLE_PROFILE.careerHighlight.vsIndustryPercent}
                                />
                              )}
                              {entry.item.categoryId === 'corporate-longevity' && (
                                <CorporateLongevityTimeline
                                  summary={SAMPLE_PROFILE.corporateHighlight.summary}
                                  companies={SAMPLE_PROFILE.corporateHighlight.companies}
                                />
                              )}
                              {entry.item.categoryId === 'remember-network' && (
                                <RememberNetworkGraph
                                  total={SAMPLE_PROFILE.rememberHighlight.total}
                                  industries={SAMPLE_PROFILE.rememberHighlight.industries}
                                />
                              )}
                              {entry.item.categoryId === 'airline-mileage' && (
                                <AirlineMileageSummary
                                  badgeLabel="글로벌 비즈니스"
                                  tierSummary={SAMPLE_PROFILE.airlineHighlight.tierSummary}
                                  airlines={SAMPLE_PROFILE.airlineHighlight.airlines}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )
                    }

                    return (
                      <div key={`${entry.categoryId}-${group.id}`} className="overflow-hidden rounded-[22px] border border-[#E7E2DC] bg-white">
                        <div className="flex gap-3 px-4 py-2.5">
                          <span className="flex h-11 w-8 shrink-0 items-center justify-center self-start pt-[18px] text-[var(--color-text-strong)]">
                            <HighlightIcon id={(entry.items[0]?.icon ?? 'briefcase') as HighlightIconId} size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            {(() => {
                              const categoryLabel = HIGHLIGHT_CATEGORIES.find((categoryItem) => categoryItem.id === entry.categoryId)?.label ?? '직접 입력'
                              const isGroupOpen = certOpen[entry.categoryId]
                              const preview = getGroupedHighlightPreview(entry.items)
                              return (
                                <>
                                  <button onClick={() => toggleCert(entry.categoryId)} className="flex w-full items-center gap-3 text-left">
                                    <div className="min-w-0 flex-1">
                                      <div className="mb-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                                        {categoryLabel}
                                      </div>
                                      <div className="text-[15px] font-bold text-[var(--color-text-strong)]">
                                        {preview.title}
                                      </div>
                                      {preview.meta && (
                                        <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">{preview.meta}</div>
                                      )}
                                    </div>
                                    {isGroupOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                                  </button>
                                  {isGroupOpen && (
                                    <div className="pt-3 pb-3 pr-4 space-y-3">
                                        {entry.items.map((item) => {
                                          const isEditable = store.highlights.some((highlight) => highlight.id === item.id)
                                          const metaParts = getHighlightMetaParts(item)
                                          return (
                                            <div key={item.id} className="rounded-[18px] border border-[#F0ECE7] bg-[#FBFAF8] px-3.5 py-3">
                                              <div className="text-[15px] font-bold text-[var(--color-text-strong)]">{item.title}</div>
                                              {metaParts.length > 0 && (
                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                  {metaParts.map((part, partIndex) => (
                                                    <span
                                                      key={`${item.id}-meta-${partIndex}`}
                                                      className={`text-[11px] ${partIndex === 0 ? 'font-semibold text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'}`}
                                                    >
                                                      {part}
                                                    </span>
                                                  ))}
                                                </div>
                                              )}
                                              {(item.description?.trim() || item.linkUrl) && (
                                                <div className="mt-3 space-y-3">
                                                  {item.description?.trim() && (
                                                    <p className="text-[14px] leading-7 text-[var(--color-text-secondary)]">
                                                      {item.description}
                                                    </p>
                                                  )}
                                                  <div className="micro-text">
                                                    {getHighlightDetailFootnote(item, categoryLabel)}
                                                  </div>
                                                </div>
                                              )}
                                              <div className="mt-3 flex gap-2 pt-0.5">
                                                <button
                                                  onClick={() => {
                                                    if (isEditable) openEditSheet(item)
                                                    else showToast('기본 목업 항목은 수정하지 않습니다')
                                                  }}
                                                  className="rounded-lg border border-[#CFC7BF] px-3 py-1.5 text-xs font-medium text-[#555]"
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
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#E7E2DC] bg-white px-4 py-10 text-center text-sm text-[#A29B93]">
                  아직 {group.label.toLowerCase()} 하이라이트가 없어요
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => { resetAddForm(); setMode('picker') }}
          className="w-full border border-[#D7D7D7] rounded-xl py-3 text-sm font-semibold text-[#111] mt-6"
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
              : '연도 선택'
        }
        value={
          yearPickerTarget === 'career-start' ? hlStartYear
            : yearPickerTarget === 'career-end' ? hlEndYear
              : hlEducationYear
        }
        options={yearOptions}
        onSelect={(value) => {
          if (yearPickerTarget === 'career-start') setHlStartYear(value)
          if (yearPickerTarget === 'career-end') setHlEndYear(value)
          if (yearPickerTarget === 'education-year') setHlEducationYear(value)
        }}
      />
    </div>
  )
}

function SNSManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedSns, setSelectedSns] = useState<'instagram' | 'linkedin' | null>(null)
  const [inputValue, setInputValue] = useState('')

  const openSheet = (sns: 'instagram' | 'linkedin') => {
    setSelectedSns(sns)
    setInputValue(sns === 'instagram' ? INSTAGRAM_PROFILE.username : 'myongkoo-kang')
    setSheetOpen(true)
  }

  const handleConnect = () => {
    if (selectedSns === 'instagram') store.connectInstagram()
    if (selectedSns === 'linkedin') store.connectLinkedIn()
    setSheetOpen(false)
    showToast('SNS 연동이 완료됐어요!')
  }

  const connected = selectedSns === 'instagram'
    ? store.instagramConnected
    : selectedSns === 'linkedin'
      ? store.linkedinConnected
      : false

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[#555] mr-3 leading-none">‹</button>
        <span className="text-base font-black">SNS 연동 관리</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-xs text-[#888] mb-5">연동하면 AI 요약과 게시물 미리보기를 확인할 수 있어요.</div>
        <div className="space-y-0.5">
          <SnsManageRow
            icon={<SnsIcon label="ig" bg="#C13584" />}
            title="Instagram"
            subtitle="instagram.com/sss_uuo · AI 요약 완료"
            onClick={() => openSheet('instagram')}
          />
          <SnsManageRow
            icon={<SnsIcon label="in" bg="#0A66C2" />}
            title="LinkedIn"
            subtitle="myongkoo-kang · 링크드인 연동하기"
            onClick={() => openSheet('linkedin')}
          />
          <SnsManageRow
            icon={<SnsIcon label="X" bg="#9F9F9F" />}
            title="X (Twitter)"
            subtitle="준비중"
            disabled
          />
          <SnsManageRow
            icon={<SnsIcon label="@" bg="#B2B2B2" />}
            title="Threads"
            subtitle="준비중"
            disabled
          />
          <SnsManageRow
            icon={<SnsIcon label="f" bg="#9FC3F7" />}
            title="Facebook"
            subtitle="준비중"
            disabled
          />
        </div>

        <div className="mt-5 rounded-xl bg-[#F7F7F7] px-4 py-3 text-[11px] text-[#888] leading-relaxed">
          연동된 정보는 시안용 더미 데이터와 함께 표시됩니다.
          연동 해제는 하단 바텀시트에서만 가능합니다.
        </div>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3 mb-4">
            {selectedSns === 'instagram' && <SnsIcon label="ig" bg="#C13584" />}
            {selectedSns === 'linkedin' && <SnsIcon label="in" bg="#0A66C2" />}
            <div>
              <div className="text-sm font-black">{selectedSns === 'instagram' ? 'Instagram 연동하기' : 'LinkedIn 연동하기'}</div>
              <div className="text-xs text-[#888]">
                {selectedSns === 'instagram' ? '아이디만 입력하면 연동됩니다' : '프로필 URL 또는 아이디를 입력해주세요'}
              </div>
            </div>
          </div>
          <div className="text-xs text-[#555] mb-1">{selectedSns === 'instagram' ? 'Instagram 아이디' : 'LinkedIn 아이디'}</div>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={selectedSns === 'instagram' ? 'sss_uuo' : 'myongkoo-kang'}
            className="w-full border border-[#D9D9D9] rounded-xl px-4 py-3 text-sm outline-none mb-2"
          />
          <div className="text-[11px] text-[#AAA] mb-4">
            {selectedSns === 'instagram' ? '예: instagram.com/' : '예: linkedin.com/in/'}{inputValue || (selectedSns === 'instagram' ? 'sss_uuo' : 'myongkoo-kang')}
          </div>
          <div className="space-y-2">
            <Button onClick={handleConnect}>연동하기</Button>
            <Button
              variant="outline"
              disabled={!connected}
              onClick={() => {
                if (selectedSns === 'instagram') store.disconnectInstagram()
                if (selectedSns === 'linkedin') store.disconnectLinkedIn()
                setSheetOpen(false)
                showToast('SNS 연동이 해제됐어요')
              }}
            >
              연동 해제
            </Button>
            <Button variant="ghost" onClick={() => setSheetOpen(false)}>취소</Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

function ContactManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const initialChannels: ContactChannel[] = (store.user?.contactChannels ?? SAMPLE_PROFILE.contactChannels) as ContactChannel[]
  const [channels, setChannels] = useState<ContactChannel[]>(initialChannels)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<ContactChannel | null>(null)
  const [inputValue, setInputValue] = useState('')

  const openSheet = (channel: ContactChannel) => {
    setSelectedChannel(channel)
    setInputValue(channel.value)
    setSheetOpen(true)
  }

  const updateChannel = (id: ContactChannel['id'], patch: Partial<ContactChannel>) => {
    setChannels((prev) => prev.map((channel) => (channel.id === id ? { ...channel, ...patch } : channel)))
  }

  const handleSaveChannel = () => {
    if (!selectedChannel) return
    const trimmed = inputValue.trim()
    updateChannel(selectedChannel.id, {
      value: trimmed,
      enabled: trimmed.length > 0,
      href: buildContactHref(selectedChannel.id, trimmed),
    })
    setSheetOpen(false)
    showToast('연락 수단이 저장됐어요')
  }

  const handleDisableChannel = () => {
    if (!selectedChannel) return
    updateChannel(selectedChannel.id, { enabled: false })
    setSheetOpen(false)
    showToast('비활성화됐어요')
  }

  const handleApply = () => {
    store.updateUserContactChannels(channels)
    showToast('연락 수단 설정이 반영됐어요')
    onBack()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[#555] mr-3 leading-none">‹</button>
        <span className="text-base font-black">연락 수단 관리</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-xs text-[#888] mb-5">공개 프로필 상단 버튼에 노출될 연락 수단을 켜고 끌 수 있어요.</div>
        <div className="space-y-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => openSheet(channel)}
              className="flex items-center w-full py-3 border-b border-[#F1F1F1] text-left"
            >
              <div className="mr-3">
                <ContactTypeIcon channelId={channel.id} enabled={channel.enabled} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-[#111]">{channel.label}</div>
                <div className="text-xs text-[#888]">
                  {channel.enabled ? channel.value || '연결됨' : '비활성화됨'}
                </div>
              </div>
              <span className={['text-[11px] font-semibold rounded-full px-2 py-1', channel.enabled ? 'bg-[#E6F5E6] text-[#1A7A1A]' : 'bg-[#F2F2F2] text-[#999]'].join(' ')}>
                {channel.enabled ? '활성' : '비활성'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-[#EBEBEB]">
        <Button onClick={handleApply}>적용하기</Button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3 mb-4">
            {selectedChannel && <ContactTypeIcon channelId={selectedChannel.id} enabled={selectedChannel.enabled} />}
            <div>
              <div className="text-sm font-black">{selectedChannel?.label} 연동</div>
              <div className="text-xs text-[#888]">값이 있으면 활성화되고, 비우면 버튼만 비활성화됩니다.</div>
            </div>
          </div>
          <div className="text-xs text-[#555] mb-1">{selectedChannel?.label}</div>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={contactPlaceholder(selectedChannel?.id)}
            className="w-full border border-[#D9D9D9] rounded-xl px-4 py-3 text-sm outline-none mb-2"
          />
          <div className="text-[11px] text-[#AAA] mb-4">{contactPreview(selectedChannel?.id, inputValue)}</div>
          <div className="space-y-2">
            <Button onClick={handleSaveChannel}>저장하기</Button>
            <Button variant="outline" onClick={handleDisableChannel}>비활성화</Button>
            <Button variant="ghost" onClick={() => setSheetOpen(false)}>취소</Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

function SnsIcon({ label, bg }: { label: string; bg: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: bg }}>
      {label}
    </div>
  )
}

function SnsManageRow({
  icon,
  title,
  subtitle,
  disabled,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center w-full py-3 border-b border-[#F1F1F1] text-left disabled:opacity-45"
    >
      <div className="mr-3">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-bold text-[#111]">{title}</div>
        <div className="text-xs text-[#888]">{subtitle}</div>
      </div>
      <span className="text-sm text-[#BBB]">{disabled ? '준비중' : '›'}</span>
    </button>
  )
}

function ContactTypeIcon({
  channelId,
  enabled,
}: {
  channelId: ContactChannel['id']
  enabled: boolean
}) {
  const iconMap = {
    phone: Phone,
    email: Mail,
    kakao: MessageCircle,
  }
  const Icon = iconMap[channelId] ?? MessageCircle

  return (
    <div className={[
      'w-10 h-10 rounded-xl flex items-center justify-center',
      enabled ? 'bg-[#111] text-white' : 'bg-[#F1F1F1] text-[#AAA]',
    ].join(' ')}>
      <Icon size={16} />
    </div>
  )
}

function buildContactHref(id: ContactChannel['id'], value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (id === 'phone') return `tel:${trimmed.replace(/[^0-9+]/g, '')}`
  if (id === 'email') return `mailto:${trimmed}`
  if (id === 'kakao') return trimmed.startsWith('http') ? trimmed : `https://open.kakao.com/o/${trimmed}`
  return ''
}

function contactPlaceholder(id?: ContactChannel['id']) {
  if (id === 'phone') return '010-1234-5678'
  if (id === 'email') return 'name@byro.io'
  if (id === 'kakao') return 'openchat 코드 또는 URL'
  return ''
}

function contactPreview(id?: ContactChannel['id'], value?: string) {
  if (!id) return ''
  if (!value?.trim()) return '값을 비우면 비활성화 상태로 저장할 수 있어요.'
  return buildContactHref(id, value)
}

function ReputationManageScreen({
  currentKeywords,
  onBack,
}: {
  currentKeywords: string[]
  onBack: () => void
}) {
  const store = useByroStore()
  const [keywords, setKeywords] = useState<string[]>([...currentKeywords])
  const [confirmKeyword, setConfirmKeyword] = useState<string | null>(null)

  const getReputationCount = (kw: string) =>
    SAMPLE_PROFILE.reputationKeywords.find((r) => r.keyword === kw)?.count ?? 0

  const toggleKeyword = (kw: string) => {
    if (keywords.includes(kw)) {
      const count = getReputationCount(kw)
      if (count > 0) {
        setConfirmKeyword(kw)
        return
      }
      setKeywords((prev) => prev.filter((item) => item !== kw))
      return
    }
    if (keywords.length >= 5) {
      showToast('최대 5개까지 선택할 수 있어요')
      return
    }
    setKeywords((prev) => [...prev, kw])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[#555] mr-3 leading-none">‹</button>
        <span className="text-base font-black">평판 키워드 편집</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-xs text-[#888] mb-4">선택된 키워드는 프로필 카드 안에 노출됩니다. 최대 5개까지 선택할 수 있어요.</div>
        <div className="space-y-4 mb-4">
          {KEYWORD_GROUPS.map((group) => (
            <div key={group.category}>
              <div className="text-xs font-bold text-[#555] mb-2">{group.category}</div>
              <div className="flex flex-wrap gap-1.5">
                {group.keywords.map((kw) => {
                  const selected = keywords.includes(kw)
                  return (
                    <button key={kw} onClick={() => toggleKeyword(kw)}
                      className={['text-xs px-3 py-1.5 rounded-full border font-semibold',
                        selected ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white text-[#555] border-[#ddd]'].join(' ')}>
                      {kw}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-[#EBEBEB]">
        <Button onClick={() => { store.updateUserKeywords(keywords); showToast('키워드가 저장됐어요!'); onBack() }}>저장</Button>
      </div>

      <Modal open={confirmKeyword !== null} onClose={() => setConfirmKeyword(null)}>
        <div className="text-center">
          <div className="text-xl mb-3">⚠️</div>
          <div className="text-sm font-black mb-2">누적 평판이 사라져요</div>
          <div className="text-xs text-[#555] leading-relaxed mb-4">
            <span className="font-bold">&ldquo;{confirmKeyword}&rdquo;</span> 키워드에 쌓인{' '}
            <span className="font-bold">{confirmKeyword ? getReputationCount(confirmKeyword) : 0}개</span>의 평판이
            {' '}영구적으로 삭제돼요.<br />정말 해제하시겠어요?
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmKeyword(null)}>취소</Button>
            <Button onClick={() => {
              if (confirmKeyword) setKeywords((prev) => prev.filter((item) => item !== confirmKeyword))
              setConfirmKeyword(null)
            }}>해제하기</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SNS 섹션
// ─────────────────────────────────────────────────────────────────────────────
function SectionSNS({ instagramConnected, linkedinConnected }: {
  instagramConnected: boolean
  linkedinConnected: boolean
}) {
  const store = useByroStore()
  const [igOpen, setIgOpen] = useState(false)
  const [liOpen, setLiOpen] = useState(false)

  return (
    <div>
      {/* Instagram */}
      <div className="border-b border-[#f0f0f0]">
        <div className="flex items-center py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Instagram.svg" alt="Instagram" className="w-5 h-5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-bold">Instagram
              {instagramConnected && <span className="ml-1.5 text-xs font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded px-1 py-0.5">✓ 연동됨</span>}
            </div>
            {instagramConnected
              ? <a href={INSTAGRAM_PROFILE.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0D47A1]">instagram.com/{INSTAGRAM_PROFILE.username}</a>
              : <div className="text-xs text-[#888]">미연동</div>}
          </div>
          {instagramConnected ? (
            <button onClick={() => setIgOpen(!igOpen)} className="p-1">
              {igOpen ? <ChevronUp size={15} color="#888" /> : <ChevronDown size={15} color="#888" />}
            </button>
          ) : (
            <button onClick={() => { window.open(INSTAGRAM_PROFILE.profileUrl, '_blank'); store.connectInstagram(); showToast('Instagram 연동이 완료됐어요!') }}
              className="text-xs text-white bg-[#0A0A0A] rounded-lg px-2.5 py-1.5">연동하기</button>
          )}
        </div>
        {igOpen && instagramConnected && (
          <div className="pb-3">
            <p className="text-xs text-[#555] mb-3 leading-relaxed">{INSTAGRAM_PROFILE.aiSummary}</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {INSTAGRAM_PROFILE.posts.map((post) => (
                <button key={post.id} onClick={() => window.open(INSTAGRAM_PROFILE.profileUrl, '_blank')}
                  className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[#e8e8e8]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LinkedIn */}
      <div>
        <div className="flex items-center py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/linkedin.png" alt="LinkedIn" className="w-5 h-5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-bold">LinkedIn
              {linkedinConnected && <span className="ml-1.5 text-xs font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded px-1 py-0.5">✓ 연동됨</span>}
            </div>
            {linkedinConnected
              ? <a href={LINKEDIN_PROFILE.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0D47A1]">linkedin.com/in/myongkoo-kang</a>
              : <div className="text-xs text-[#888]">연동하면 AI 요약이 생성돼요</div>}
          </div>
          {linkedinConnected ? (
            <button onClick={() => setLiOpen(!liOpen)} className="p-1">
              {liOpen ? <ChevronUp size={15} color="#888" /> : <ChevronDown size={15} color="#888" />}
            </button>
          ) : (
            <button onClick={() => { window.open(LINKEDIN_PROFILE.profileUrl, '_blank'); store.connectLinkedIn(); showToast('LinkedIn 연동이 완료됐어요!') }}
              className="text-xs text-white bg-[#0A0A0A] rounded-lg px-2.5 py-1.5">연동하기</button>
          )}
        </div>
        {liOpen && linkedinConnected && (
          <div className="pb-3">
            <p className="text-xs text-[#555] mb-3 leading-relaxed">{LINKEDIN_PROFILE.aiSummary}</p>
            {LINKEDIN_PROFILE.recentPosts.map((post) => (
              <div key={post.id} className="bg-[#f9f9f9] rounded-xl px-3 py-2.5 mb-2">
                <p className="text-xs text-[#333] leading-relaxed line-clamp-2">{post.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-[#888]">👍 {post.likes}</span>
                  <span className="text-[10px] text-[#bbb]">{post.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 방명록 관리 화면
// ─────────────────────────────────────────────────────────────────────────────
function GuestbookManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const entries = SAMPLE_PROFILE.guestbook.filter(
    (e) => !store.deletedGuestbookIds.includes(e.id)
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[#555] mr-3 leading-none">‹</button>
        <span className="text-base font-black">방명록 관리</span>
        <span className="ml-2 text-xs text-[#AAA]">{entries.length}개</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {entries.length === 0 ? (
          <div className="text-center text-sm text-[#AAA] mt-16">받은 방명록이 없어요</div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5 rounded-[18px] border border-[#F0F0F0] bg-[#FCFCFC] px-3 py-3">
                {getProfileAvatar(entry.linkId) ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getProfileAvatar(entry.linkId)} alt={entry.authorName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-xs font-bold text-[#555] flex-shrink-0">
                    {entry.authorName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-[#222]">{entry.authorName}</div>
                    <div className="text-[10px] text-[#BBB]">{entry.date}</div>
                  </div>
                  <div className="text-xs text-[#666] mt-0.5">{entry.message}</div>
                </div>
                <button
                  onClick={() => { store.deleteGuestbookEntry(entry.id); showToast('방명록을 삭제했어요') }}
                  className="flex-shrink-0 text-[#CCC] hover:text-[#E53935] transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 방명록 섹션
// ─────────────────────────────────────────────────────────────────────────────
function SectionGuestbook({ entries }: {
  entries: { id: string; linkId: string; authorName: string; message: string; date: string }[]
}) {
  const router = useRouter()
  return (
    <div>
      {entries.map((entry) => {
        const clickable = !!entry.linkId
        return (
          <button
            key={entry.id}
            onClick={() => { if (clickable) router.push(`/${entry.linkId}`) }}
            className={['flex gap-2.5 py-2 border-b border-[#f5f5f5] last:border-0 w-full text-left',
              clickable ? 'cursor-pointer' : 'cursor-default'].join(' ')}
          >
            {getProfileAvatar(entry.linkId) ? (
              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getProfileAvatar(entry.linkId)} alt={`${entry.authorName} 프로필 사진`} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-xs font-bold text-[#555] flex-shrink-0">
                {entry.authorName.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className={['text-xs font-bold', clickable ? 'text-[#0D47A1]' : ''].join(' ')}>
                {entry.authorName}
              </div>
              <div className="text-xs text-[#555]">{entry.message}</div>
              <div className="text-[10px] text-[#bbb] mt-0.5">{entry.date}</div>
            </div>
          </button>
        )
      })}
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
