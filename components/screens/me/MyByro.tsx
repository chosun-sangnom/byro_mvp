'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Camera, Mail, MessageCircle, Phone, Plus, Send, X } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, BottomSheet, Modal, showToast, TextArea } from '@/components/ui'
import type { Highlight } from '@/types'
import {
  SAMPLE_PROFILE, INSTAGRAM_PROFILE, LINKEDIN_PROFILE,
  HIGHLIGHT_CATEGORIES, KEYWORD_GROUPS,
} from '@/lib/mockData'

type Screen = 'main' | 'editBasic' | 'editHighlight' | 'editSNS' | 'editReputation'
type SectionKey = 'sns' | 'highlight' | 'reputation' | 'guestbook'

const SECTION_LABELS: Record<SectionKey, string> = {
  sns: 'SNS 연동',
  highlight: '하이라이트',
  reputation: '평판 키워드',
  guestbook: '방명록',
}

const AVATAR_COLORS = ['#e0e0e0', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#FFF9C4']

// ─────────────────────────────────────────────────────────────────────────────
export default function MyByro() {
  const router = useRouter()
  const store = useByroStore()

  useEffect(() => {
    if (!store.isLoggedIn) router.replace('/onboarding')
  }, [store.isLoggedIn, router])

  const [screen, setScreen] = useState<Screen>('main')
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(['reputation', 'guestbook', 'sns', 'highlight'])
  const dragItem = useRef<SectionKey | null>(null)
  const dragOver = useRef<SectionKey | null>(null)
  const sectionRefs = useRef<Map<SectionKey, HTMLElement>>(new Map())

  if (!store.isLoggedIn) return null
  const user = store.user!

  const instagramConnected = store.instagramConnected || SAMPLE_PROFILE.instagramConnected
  const linkedinConnected = store.linkedinConnected || SAMPLE_PROFILE.linkedinConnected
  const currentKeywords = user.selectedKeywords ?? SAMPLE_PROFILE.selectedKeywords
  const avatarColor = user.avatarColor ?? AVATAR_COLORS[0]
  const avatarImage = user.avatarImage
  const allHighlights = [...SAMPLE_PROFILE.manualHighlights, ...store.highlights]
  const connectedSnsCount = Number(instagramConnected) + Number(linkedinConnected)
  const totalReputationCount = SAMPLE_PROFILE.reputationKeywords.reduce((sum, item) => sum + item.count, 0)

  const handleDragStart = (key: SectionKey) => { dragItem.current = key }
  const handleDragEnter = (key: SectionKey) => { dragOver.current = key }
  const handleDragEnd = () => {
    if (!dragItem.current || !dragOver.current || dragItem.current === dragOver.current) return
    const nextOrder = [...sectionOrder]
    const from = nextOrder.indexOf(dragItem.current)
    const to = nextOrder.indexOf(dragOver.current)
    nextOrder.splice(from, 1)
    nextOrder.splice(to, 0, dragItem.current)
    setSectionOrder(nextOrder)
    dragItem.current = null
    dragOver.current = null
    showToast('블럭 순서가 변경됐어요')
  }
  const handleTouchStart = (key: SectionKey) => {
    dragItem.current = key
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    for (const [sectionKey, el] of Array.from(sectionRefs.current.entries())) {
      const rect = el.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        dragOver.current = sectionKey
        break
      }
    }
  }
  const handleTouchEnd = () => {
    if (!dragItem.current || !dragOver.current || dragItem.current === dragOver.current) {
      dragItem.current = null
      dragOver.current = null
      return
    }
    const nextOrder = [...sectionOrder]
    const from = nextOrder.indexOf(dragItem.current)
    const to = nextOrder.indexOf(dragOver.current)
    nextOrder.splice(from, 1)
    nextOrder.splice(to, 0, dragItem.current)
    setSectionOrder(nextOrder)
    dragItem.current = null
    dragOver.current = null
    showToast('블럭 순서가 변경됐어요')
  }

  const moveSection = (key: SectionKey, direction: 'up' | 'down') => {
    const nextOrder = [...sectionOrder]
    const from = nextOrder.indexOf(key)
    const to = direction === 'up' ? from - 1 : from + 1
    if (from < 0 || to < 0 || to >= nextOrder.length) return
    const [item] = nextOrder.splice(from, 1)
    nextOrder.splice(to, 0, item)
    setSectionOrder(nextOrder)
    showToast('블럭 순서가 변경됐어요')
  }
  // ── 화면 분기 ──────────────────────────────────────────────
  if (screen === 'editBasic') {
    return <BasicInfoEditScreen user={user} avatarColor={avatarColor} currentKeywords={currentKeywords} onBack={() => setScreen('main')} />
  }

  if (screen === 'editHighlight') {
    return (
      <HighlightManageScreen
        userLinkId={user.linkId}
        onBack={() => setScreen('main')}
      />
    )
  }

  if (screen === 'editSNS') {
    return <SNSManageScreen onBack={() => setScreen('main')} />
  }

  if (screen === 'editReputation') {
    return <ReputationManageScreen currentKeywords={currentKeywords} onBack={() => setScreen('main')} />
  }

  // ── 메인 화면 ──────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* 네비 */}
      <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
        <span className="text-sm text-[#888] flex-1 text-center">byro.io/@{user.linkId}</span>
        <button onClick={() => store.logout()} className="text-xs text-[#888]">로그아웃</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-5 pt-4 pb-3">
          <div className="rounded-[34px] bg-[#F7F4F1] p-[7px] shadow-[0_16px_36px_rgba(0,0,0,0.08)]">
            <div className="relative h-[452px] overflow-hidden rounded-[30px] text-white ring-1 ring-black/4">
              {avatarImage ? (
                <>
                  <img src={avatarImage} alt={`${user.name} 프로필 사진`} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_24%,rgba(0,0,0,0.10)_58%,rgba(0,0,0,0.74)_100%)]" />
                </>
              ) : (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-b ${SAMPLE_PROFILE.heroTheme.cover}`} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.24),rgba(255,255,255,0)_36%),linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_24%,rgba(0,0,0,0.08)_56%,rgba(0,0,0,0.76)_100%)]" />
                  <div className="absolute left-1/2 top-[16%] h-[196px] w-[196px] -translate-x-1/2 overflow-hidden rounded-[40px] border border-white/22 bg-gradient-to-br from-white/18 to-white/3 shadow-[0_28px_72px_rgba(0,0,0,0.18)] backdrop-blur-[6px]">
                    <div
                      className={`h-full w-full bg-gradient-to-br ${SAMPLE_PROFILE.heroTheme.avatar}`}
                      style={{ backgroundColor: avatarColor }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[72px] font-black text-[#4E3B32]/55">
                      {user.name.charAt(0)}
                    </div>
                  </div>
                </>
              )}

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center gap-1.5">
                  <div className="text-[29px] font-black tracking-[-0.04em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.24)]">{user.name}</div>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#43C07A] text-[10px] font-black text-white shadow-[0_8px_20px_rgba(67,192,122,0.35)]">✓</span>
                </div>
                <div className="mt-1 text-[15px] font-medium text-white/72">{user.title}</div>
                <div className="mt-4 max-w-[318px] rounded-[18px] border border-white/12 bg-white/10 px-4 py-3 text-[15px] leading-[1.52] text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[8px]">
                  {user.bio || SAMPLE_PROFILE.headline}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {SAMPLE_PROFILE.contactChannels.map((channel) => (
                <ProfileActionButton
                  key={channel.id}
                  channel={channel}
                  onClick={() => {
                    if (!channel.href) {
                      showToast('연결 정보를 준비 중이에요')
                      return
                    }
                    window.open(channel.href, channel.href.startsWith('http') ? '_blank' : '_self')
                  }}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {currentKeywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-[#E4E4E4] bg-[#F6F6F6] px-2.5 py-1 text-[11px] text-[#555]">
                  {keyword}
                </span>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setScreen('editBasic')}
                className="flex-1 rounded-[18px] border border-[#D8D8D8] bg-white px-4 py-3 text-sm font-semibold text-[#555]"
              >
                기본정보 편집
              </button>
              <button
                onClick={() => router.push(`/${user.linkId}`)}
                className="flex-1 rounded-[18px] bg-[#111] px-4 py-3 text-sm font-semibold text-white"
              >
                프로필 미리보기
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pt-3">
          {sectionOrder.map((key) => (
            <div
              key={key}
              ref={(el) => { if (el) sectionRefs.current.set(key, el) }}
              className="mb-1"
              draggable
              onDragStart={() => handleDragStart(key)}
              onDragEnter={() => handleDragEnter(key)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex items-center py-2.5 border-b border-[#f5f5f5]">
                <span
                  className="mr-2 text-[#BBB] cursor-grab select-none"
                  style={{ touchAction: 'none' }}
                  onTouchStart={() => handleTouchStart(key)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >≡</span>
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
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => moveSection(key, 'up')}
                    disabled={sectionOrder.indexOf(key) === 0}
                    className="w-6 h-6 text-[10px] border border-[#DDD] rounded text-[#777] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSection(key, 'down')}
                    disabled={sectionOrder.indexOf(key) === sectionOrder.length - 1}
                    className="w-6 h-6 text-[10px] border border-[#DDD] rounded text-[#777] disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
                {(key === 'sns' || key === 'highlight' || key === 'reputation') && (
                  <button
                    onClick={() => {
                      if (key === 'sns') setScreen('editSNS')
                      if (key === 'highlight') setScreen('editHighlight')
                      if (key === 'reputation') setScreen('editReputation')
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
                  <div>
                    <div className="space-y-1.5 mb-2">
                      <ExpandablePreviewRow
                        icon="💼"
                        title="커리어 지속성"
                        subtitle="건강보험공단 기준 · 2026.04 인증"
                        badge="인증됨"
                        badgeTone="verified"
                        open={store.hlOpenStates.career_main ?? false}
                        onToggle={() => store.toggleHlOpen('career_main')}
                        detail={(
                          <div className="text-[11px] text-[#666] mt-2">
                            평균 재직 {SAMPLE_PROFILE.careerHighlight.avgYears}년 · 업계 대비 +{SAMPLE_PROFILE.careerHighlight.vsIndustryPercent}%
                          </div>
                        )}
                      />
                      <ExpandablePreviewRow
                        icon="🤝"
                        title="리멤버 직업 네트워크"
                        subtitle="스타트업·마케팅 중심 인맥"
                        badge="인증됨"
                        badgeTone="verified"
                        open={store.hlOpenStates.remember_main ?? false}
                        onToggle={() => store.toggleHlOpen('remember_main')}
                        detail={(
                          <div className="text-[11px] text-[#666] mt-2">
                            스타트업 38% · 마케팅 24% · IT 22% · 투자 16%
                          </div>
                        )}
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
                      {allHighlights.length > 2 && (
                        <div className="text-xs text-[#AAA]">외 {allHighlights.length - 2}개 더 있음</div>
                      )}
                    </div>
                  </div>
                )}
                {key === 'reputation' && (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {SAMPLE_PROFILE.reputationKeywords.map((item) => (
                        <div
                          key={item.keyword}
                          className="bg-[#0A0A0A] text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                        >
                          {item.keyword} <span className="opacity-60">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {key === 'guestbook' && (
                  <SectionGuestbook entries={SAMPLE_PROFILE.guestbook} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 바 */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-2 px-4 py-3 border-t border-[#EBEBEB] bg-white">
        <Button variant="outline" onClick={() => router.push('/archive')}>아카이브</Button>
        <Button onClick={() => router.push(`/${user.linkId}`)}>프로필 미리보기</Button>
      </div>

    </div>
  )
}

function ProfileActionButton({
  channel,
  onClick,
}: {
  channel: { id: string; label: string; value: string; href?: string }
  onClick: () => void
}) {
  const iconMap = {
    phone: Phone,
    email: Mail,
    kakao: MessageCircle,
    telegram: Send,
  }
  const Icon = iconMap[channel.id as keyof typeof iconMap] ?? MessageCircle

  return (
    <button
      onClick={onClick}
      className="rounded-[18px] border border-[#E7E7E7] bg-[#F8F8F8] px-2 py-2.5 text-center text-[#222] transition-colors active:bg-[#EFEFEF]"
    >
      <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
        <Icon size={16} />
      </div>
      <div className="text-[11px] font-semibold">{channel.label}</div>
    </button>
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
  icon: string
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
        <span className="text-base leading-none mt-0.5">{icon}</span>
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
  user, avatarColor, currentKeywords, onBack,
}: {
  user: { name: string; linkId: string; title: string; school: string; bio: string; selectedKeywords?: string[]; avatarColor?: string; avatarImage?: string }
  avatarColor: string
  currentKeywords: string[]
  onBack: () => void
}) {
  const store = useByroStore()
  const [title, setTitle] = useState(user.title)
  const [school, setSchool] = useState(user.school ?? '')
  const [bio, setBio] = useState(user.bio)
  const [keywords, setKeywords] = useState<string[]>([...currentKeywords])
  const [color, setColor] = useState(avatarColor)
  const [avatarImage, setAvatarImage] = useState(user.avatarImage ?? '')
  const [kwPickerOpen, setKwPickerOpen] = useState(false)
  const [pickerTempKw, setPickerTempKw] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const removeKw = (kw: string) => setKeywords((prev) => prev.filter((k) => k !== kw))

  const togglePickerKw = (kw: string) => {
    if (pickerTempKw.includes(kw)) {
      setPickerTempKw((prev) => prev.filter((k) => k !== kw))
    } else {
      if (keywords.length + pickerTempKw.filter((k) => !keywords.includes(k)).length >= 10) {
        showToast('최대 10개까지 선택할 수 있어요'); return
      }
      setPickerTempKw((prev) => [...prev, kw])
    }
  }

  const handleOpenPicker = () => {
    setPickerTempKw([...keywords])
    setKwPickerOpen(true)
  }

  const handleConfirmPicker = () => {
    setKeywords(pickerTempKw)
    setKwPickerOpen(false)
  }

  const handleSave = () => {
    store.updateUserInfo({ title, school, bio, avatarColor: color, avatarImage })
    store.updateUserKeywords(keywords)
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
        setAvatarImage(reader.result)
        showToast('사진이 적용됐어요')
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
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
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-[#555] mb-2"
              style={{ backgroundColor: color }}>
              {avatarImage ? (
                <img src={avatarImage} alt={`${user.name} 프로필 사진`} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="flex gap-2 mb-2">
              {AVATAR_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2"
                  style={{ backgroundColor: c, borderColor: color === c ? '#0A0A0A' : 'transparent' }} />
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-[#555]"
            >
              <Camera size={12} /> 사진 변경
            </button>
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

            {/* 평판 키워드 */}
            <div>
              <label className="text-xs text-[#888] mb-2 block">평판 키워드</label>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <div key={kw} className="flex items-center gap-1 bg-[#f0f0f0] rounded-full px-3 py-1.5">
                    <span className="text-xs text-[#333]">{kw}</span>
                    <button onClick={() => removeKw(kw)} className="ml-0.5">
                      <X size={10} color="#888" />
                    </button>
                  </div>
                ))}
                <button onClick={handleOpenPicker}
                  className="flex items-center gap-1 text-xs text-[#555] border border-dashed border-[#ccc] rounded-full px-3 py-1.5">
                  <Plus size={10} /> 추가
                </button>
              </div>
            </div>
          </div>

          <Button onClick={handleSave}>저장</Button>
        </div>
      </div>

      {/* 키워드 피커 */}
      <BottomSheet open={kwPickerOpen} onClose={() => setKwPickerOpen(false)}>
        <div className="px-5 pb-6">
          <div className="text-sm font-black mb-4">키워드 선택 (최대 10개)</div>
          <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
            {KEYWORD_GROUPS.map((group) => (
              <div key={group.category}>
                <div className="text-xs font-bold text-[#555] mb-2">{group.category}</div>
                <div className="flex flex-wrap gap-1.5">
                  {group.keywords.map((kw) => {
                    const sel = pickerTempKw.includes(kw)
                    return (
                      <button key={kw} onClick={() => togglePickerKw(kw)}
                        className={['text-xs px-3 py-1.5 rounded-full border font-semibold',
                          sel ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white text-[#555] border-[#ddd]'].join(' ')}>
                        {kw}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-[#888] mb-3">선택: {pickerTempKw.length} / 10</div>
          <Button onClick={handleConfirmPicker}>확인</Button>
        </div>
      </BottomSheet>
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
      icon: selectedCat.icon,
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
    { icon: '💼', title: '커리어 지속성', sub: '건강보험 공단 이메일 발송', verified: true },
    { icon: '🤝', title: '리멤버 직업 네트워크', sub: '리멤버 앱 명함 내보내기', verified: false },
    { icon: '🏢', title: '법인 영속성', sub: '창업 5년차 · 정상 운영 중 · 폐업 이력 없음', verified: true },
    { icon: '✈️', title: '항공 마일리지', sub: '대한항공 모닝캄 · 아시아나 다이아몬드', verified: true, badge: '🌍 글로벌 비즈니스' },
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
                      <span className="text-lg mt-0.5">{hl.icon}</span>
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
                <span className="text-lg mb-0.5">{cat.icon}</span>
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
                <span className="text-lg mr-3">{item.icon}</span>
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
                    <span className="text-lg mr-3">{item.icon}</span>
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
                  <span className="text-base mt-0.5">{hl.icon}</span>
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

function ReputationManageScreen({
  currentKeywords,
  onBack,
}: {
  currentKeywords: string[]
  onBack: () => void
}) {
  const store = useByroStore()
  const [keywords, setKeywords] = useState<string[]>([...currentKeywords])

  const toggleKeyword = (kw: string) => {
    if (keywords.includes(kw)) {
      setKeywords((prev) => prev.filter((item) => item !== kw))
      return
    }
    if (keywords.length >= 10) {
      showToast('최대 10개까지 선택할 수 있어요')
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
        <div className="text-xs text-[#888] mb-4">선택된 키워드는 공개 프로필 상단에 노출됩니다.</div>
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
          <span className="text-lg mr-2">📸</span>
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
          <span className="text-lg mr-2">💼</span>
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
            onClick={() => { if (clickable) router.push('/' + entry.linkId) }}
            className={['flex gap-2.5 py-2 border-b border-[#f5f5f5] last:border-0 w-full text-left',
              clickable ? 'cursor-pointer' : 'cursor-default'].join(' ')}
          >
            <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-xs font-bold text-[#555] flex-shrink-0">
              {entry.authorName.charAt(0)}
            </div>
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
