'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Camera, Mail, MessageCircle, Phone } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, BottomSheet, Modal, showToast, TextArea } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import type { Highlight, ContactChannel, UserState, HighlightIconId } from '@/types'
import {
  SAMPLE_PROFILE, INSTAGRAM_PROFILE, LINKEDIN_PROFILE,
  HIGHLIGHT_CATEGORIES, KEYWORD_GROUPS,
} from '@/lib/mockData'
import PublicProfile from '@/components/screens/profile/PublicProfile'

type Screen = 'preview' | 'manage' | 'editBasic' | 'editHighlight' | 'editSNS' | 'editReputation' | 'editContact' | 'editGuestbook'
type SectionKey = 'sns' | 'highlight' | 'reputation' | 'guestbook'

const SECTION_LABELS: Record<SectionKey, string> = {
  sns: 'SNS 연동',
  highlight: '하이라이트',
  reputation: '평판 키워드',
  guestbook: '방명록',
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
  const [title, setTitle] = useState(user.title)
  const [school, setSchool] = useState(user.school ?? '')
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
    store.updateUserInfo({ title, school, bio, avatarImage })
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

            {/* 직함/소속 */}
            <div>
              <label className="text-xs text-[#888] mb-1 block">직함 / 소속</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-[#ddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A]" />
            </div>

            {/* 학력/전공 */}
            <div>
              <label className="text-xs text-[#888] mb-1 block">학력 / 전공</label>
              <input value={school} onChange={(e) => setSchool(e.target.value)}
                className="w-full border border-[#ddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0A0A0A]" />
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
  const [mode, setMode] = useState<'list' | 'add' | 'cert'>('list')
  const [editingHl, setEditingHl] = useState<typeof SAMPLE_PROFILE.manualHighlights[0] | Highlight | null>(null)
  const [selectedCat, setSelectedCat] = useState<typeof HIGHLIGHT_CATEGORIES[0] | null>(null)
  const [hlTitle, setHlTitle] = useState('')
  const [hlYear, setHlYear] = useState('')
  const [hlDesc, setHlDesc] = useState('')
  const [certModalOpen, setCertModalOpen] = useState(false)

  const openEditSheet = (hl: typeof SAMPLE_PROFILE.manualHighlights[0]) => {
    const cat = HIGHLIGHT_CATEGORIES.find((c) => c.icon === hl.icon) ?? null
    setSelectedCat(cat)
    setHlTitle(hl.title)
    setHlYear(hl.year)
    setHlDesc(hl.description)
    setEditingHl(hl)
    setMode('add')
  }

  const handleSave = () => {
    if (!selectedCat || !hlTitle) { showToast('카테고리와 제목을 입력해주세요'); return }
    const payload = {
      icon: selectedCat.icon as HighlightIconId,
      title: hlTitle,
      subtitle: `${selectedCat.label} · 직접 입력`,
      description: hlDesc,
      year: hlYear,
    }
    if (editingHl && store.highlights.some((h) => h.id === editingHl.id)) {
      store.updateHighlight(editingHl.id, payload)
    } else {
      store.addHighlight(payload)
    }
    setMode('list')
    setEditingHl(null)
    resetAddForm()
    showToast(editingHl ? '수정됐어요!' : '추가됐어요!')
  }

  const certItems = [
    { icon: 'briefcase', title: '커리어 지속성', sub: '건강보험 공단 이메일 발송', verified: true },
    { icon: 'users', title: '리멤버 직업 네트워크', sub: '리멤버 앱 명함 내보내기', verified: false },
    { icon: 'building2', title: '법인 영속성', sub: '창업 5년차 · 정상 운영 중 · 폐업 이력 없음', verified: true },
    { icon: 'plane', title: '항공 마일리지', sub: '대한항공 모닝캄 · 아시아나 다이아몬드', verified: true, badge: '🌍 글로벌 비즈니스' },
  ]
  const [certOpen, setCertOpen] = useState<Record<string, boolean>>({})

  const toggleCert = (title: string) => setCertOpen((p) => ({ ...p, [title]: !p[title] }))

  const resetAddForm = () => {
    setSelectedCat(null)
    setHlTitle('')
    setHlYear('')
    setHlDesc('')
    setEditingHl(null)
  }

  if (mode === 'add') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
          <button onClick={() => { resetAddForm(); setMode('list') }} className="text-xl text-[#555] mr-3 leading-none">‹</button>
          <span className="text-base font-black">경험 추가하기</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {store.highlights.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-bold text-[#555] mb-2">내가 추가한 경험</div>
              <div className="space-y-2">
                {store.highlights.map((hl) => (
                  <div key={hl.id} className="border border-[#EBEBEB] rounded-xl p-3">
                    <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[var(--color-text-strong)]">
                      <HighlightIcon id={hl.icon as HighlightIconId} size={18} />
                    </span>
                      <div className="flex-1">
                        <div className="text-sm font-bold">{hl.title}</div>
                        <div className="text-xs text-[#888]">{hl.year} · {hl.subtitle}</div>
                        {hl.description && <div className="text-xs text-[#555] mt-1">{hl.description}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEditSheet(hl)}
                        className="text-xs border border-[#ddd] rounded-lg px-3 py-1.5">수정</button>
                      <button onClick={() => { store.removeHighlight(hl.id); showToast('삭제됐어요') }}
                        className="text-xs border border-[#E53935] text-[#E53935] rounded-lg px-3 py-1.5">삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {HIGHLIGHT_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCat(cat)}
                className={['flex flex-col items-center p-2 rounded-xl border text-center',
                  selectedCat?.id === cat.id
                    ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                    : 'border-[#EBEBEB] text-[#555]'].join(' ')}>
                <HighlightIcon id={cat.icon as HighlightIconId} size={18} className="mb-0.5" />
                <span className="text-[10px] font-semibold leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2 mb-4">
            <input value={hlTitle} onChange={(e) => setHlTitle(e.target.value)} placeholder="제목 (필수)"
              className="w-full border border-[#ddd] rounded-xl px-4 py-2.5 text-sm outline-none" />
            <input value={hlYear} onChange={(e) => setHlYear(e.target.value)} placeholder="연도 (예: 2023)" type="number"
              className="w-full border border-[#ddd] rounded-xl px-4 py-2.5 text-sm outline-none" />
            <TextArea value={hlDesc} onChange={setHlDesc} placeholder="설명 (선택, 150자)" maxLength={150} rows={3} />
          </div>
          <Button onClick={handleSave}>{editingHl ? '수정하기' : '저장'}</Button>
        </div>
      </div>
    )
  }

  if (mode === 'cert') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
          <button onClick={() => setMode('list')} className="text-xl text-[#555] mr-3 leading-none">‹</button>
          <span className="text-base font-black">인증 추가하기</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
          <div className="space-y-1">
            {certItems.map((item) => (
              <button
                key={item.title}
                onClick={() => setCertModalOpen(true)}
                className="flex items-center w-full py-3 border-b border-[#f5f5f5] text-left"
              >
                <span className="mr-3 text-[var(--color-text-strong)]">
                  <HighlightIcon id={item.icon as HighlightIconId} size={18} />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-bold">{item.title}</div>
                  <div className="text-xs text-[#888]">{item.sub}</div>
                </div>
                <span className="text-sm text-[#BBB]">›</span>
              </button>
            ))}
          </div>
        </div>

        <Modal open={certModalOpen} onClose={() => setCertModalOpen(false)}>
          <div className="text-center">
            <div className="text-xl mb-3">📧</div>
            <div className="text-sm font-black mb-2">하이라이트 인증</div>
            <div className="text-xs text-[#555] leading-relaxed mb-4">아래 이메일 주소로<br />인증 서류를 발송해주세요.</div>
            <div className="border-2 border-[#0A0A0A] rounded-xl px-3 py-2 mb-4">
              <div className="text-xs text-[#888] mb-1">나의 Byro 인증 이메일 주소</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold">{userLinkId}@data.byro.io</span>
                <button onClick={() => { navigator.clipboard.writeText(`${userLinkId}@data.byro.io`).catch(() => {}); showToast('복사됐어요!') }}
                  className="text-xs text-white bg-[#0A0A0A] rounded-lg px-2 py-1 ml-2">복사</button>
              </div>
            </div>
            <Button onClick={() => setCertModalOpen(false)}>확인</Button>
          </div>
        </Modal>
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
        <div className="text-xs text-[#888] mb-4">인증된 항목만 상단에 노출됩니다.</div>

        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-sm font-bold text-[#1A7A1A]">✓</span>
            <span className="text-sm font-bold">인증 항목</span>
          </div>
          <div className="space-y-1">
            {certItems.filter((item) => item.verified).map((item) => {
              const isOpen = certOpen[item.title]
              return (
                <div key={item.title} className="border-b border-[#f5f5f5]">
                  <div className="flex items-center py-2.5">
                    <span className="mr-3 text-[var(--color-text-strong)]">
                      <HighlightIcon id={item.icon as HighlightIconId} size={18} />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{item.title}</div>
                      <div className="text-xs text-[#888]">{item.sub}</div>
                    </div>
                    {item.verified ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-lg px-2 py-1">→ 인증됨</span>
                        <button onClick={() => toggleCert(item.title)} className="p-1">
                          {isOpen ? <ChevronUp size={15} color="#888" /> : <ChevronDown size={15} color="#888" />}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {isOpen && item.verified && (
                    <div className="bg-[#f9f9f9] rounded-xl p-3 mb-2">
                      {item.title === '커리어 지속성' && (
                        <>
                          <div className="text-xs text-[#888] mb-2">평균 재직 기간</div>
                          <div className="h-1.5 bg-[#e0e0e0] rounded-full mb-1.5">
                            <div className="h-full bg-[#0A0A0A] rounded-full" style={{ width: '72%' }} />
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-white border border-[#eee] rounded-xl p-2.5 text-center">
                              <div className="text-lg font-black">{SAMPLE_PROFILE.careerHighlight.avgYears}년</div>
                              <div className="text-xs text-[#888]">본인 평균</div>
                            </div>
                            <div className="bg-[#f5fff5] border border-[#c8e6c9] rounded-xl p-2.5 text-center">
                              <div className="text-lg font-black text-[#1A7A1A]">+{SAMPLE_PROFILE.careerHighlight.vsIndustryPercent}%</div>
                              <div className="text-xs text-[#888]">업계 평균 대비</div>
                            </div>
                          </div>
                          <div className="text-xs text-[#bbb] text-right mt-2">건강보험공단 기준 · 2026.04 인증</div>
                        </>
                      )}

                      {item.title === '리멤버 직업 네트워크' && (
                        <div className="text-xs text-[#555]">리멤버 명함 기반 네트워크가 인증되어 프로필에 공개됩니다.</div>
                      )}

                      {item.title === '법인 영속성' && (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white border border-[#eee] rounded-xl p-2.5 text-center">
                              <div className="text-lg font-black">{SAMPLE_PROFILE.corporateHighlight.companyCount}개</div>
                              <div className="text-xs text-[#888]">운영 법인</div>
                            </div>
                            <div className="bg-white border border-[#eee] rounded-xl p-2.5 text-center">
                              <div className="text-lg font-black">{SAMPLE_PROFILE.corporateHighlight.averageOperatingYears}년</div>
                              <div className="text-xs text-[#888]">평균 운영</div>
                            </div>
                            <div className="bg-[#f5fff5] border border-[#c8e6c9] rounded-xl p-2.5 text-center">
                              <div className="text-sm font-black text-[#1A7A1A]">정상 운영</div>
                              <div className="text-xs text-[#888]">폐업 이력 없음</div>
                            </div>
                          </div>
                          <div className="text-xs text-[#bbb] text-right mt-2">법인 등기 기준 · 2026.04 인증</div>
                        </>
                      )}

                      {item.title === '항공 마일리지' && (
                        <>
                          {item.badge && (
                            <div className="inline-flex items-center rounded-full bg-white border border-[#E5E5E5] px-2.5 py-1 text-[11px] font-semibold text-[#333] mb-2">
                              {item.badge}
                            </div>
                          )}
                          <div className="space-y-2">
                            {SAMPLE_PROFILE.airlineHighlight.airlines.map((airline) => (
                              <div key={airline.name} className="flex items-center justify-between rounded-xl border border-[#eee] bg-white px-3 py-2">
                                <div className="text-xs text-[#888]">{airline.name}</div>
                                <div className="text-sm font-bold">{airline.tier}</div>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-[#bbb] text-right mt-2">항공사 회원등급 기준 · 2026.04 인증</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setMode('cert')}
          className="w-full border border-[#D7D7D7] rounded-xl py-3 text-sm font-semibold text-[#111] mb-5"
        >
          + 인증 추가하기
        </button>

        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">✏️</span>
            <span className="text-sm font-bold">직접 입력 경험</span>
          </div>
          <div className="space-y-3">
            {[...SAMPLE_PROFILE.manualHighlights, ...store.highlights].map((hl) => (
              <div key={hl.id} className="border border-[#DCDCDC] rounded-xl px-3 py-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-[var(--color-text-strong)]">
                    <HighlightIcon id={hl.icon as HighlightIconId} size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{hl.title}</div>
                    <div className="text-[11px] text-[#888]">{hl.subtitle.split('·')[0].trim()} {hl.year ? `· ${hl.year}` : ''}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      if (store.highlights.some((item) => item.id === hl.id)) openEditSheet(hl)
                      else showToast('기본 목업 항목은 수정하지 않습니다')
                    }}
                    className="text-xs border border-[#BFBFBF] text-[#555] rounded-lg px-3 py-1"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => {
                      if (store.highlights.some((item) => item.id === hl.id)) {
                        store.removeHighlight(hl.id)
                        showToast('삭제됐어요')
                      } else {
                        showToast('기본 목업 항목은 삭제하지 않습니다')
                      }
                    }}
                    className="text-xs border border-[#FF6B6B] text-[#FF4D4F] rounded-lg px-3 py-1"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { resetAddForm(); setMode('add') }}
          className="w-full border border-[#D7D7D7] rounded-xl py-3 text-sm font-semibold text-[#111]"
        >
          + 경험 추가하기
        </button>
      </div>
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
                {entry.authorName === '이지민' ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/jimin-profile-5x4.jpg" alt={entry.authorName} className="w-full h-full object-cover" />
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
            onClick={() => { if (clickable) router.push('/jiminlee') }}
            className={['flex gap-2.5 py-2 border-b border-[#f5f5f5] last:border-0 w-full text-left',
              clickable ? 'cursor-pointer' : 'cursor-default'].join(' ')}
          >
            {entry.authorName === '이지민' ? (
              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/jimin-profile-5x4.jpg" alt={`${entry.authorName} 프로필 사진`} className="w-full h-full object-cover" />
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
