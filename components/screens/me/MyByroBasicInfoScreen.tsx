'use client'

import { useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import { Camera, ChevronDown, Copy, Check, Info, Sparkles } from 'lucide-react'
import { BottomSheet, Button, NavBar, showToast, TextArea } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { ProfileHeroCard } from '@/components/screens/profile/PublicProfileHeroSection'
import { DEFAULT_HERO_THEME, deriveAgeFromBirthDate } from '@/components/screens/profile/publicProfileData'
import { useByroStore } from '@/store/useByroStore'
import type { PublicProfileWhoIAm, UserState } from '@/types'

// ── AI 도구 정의 ─────────────────────────────────────────────────────────────
const AI_TOOLS = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: (p: string) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.62a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68V11.2l2.02 1.17v5.58a4.5 4.5 0 0 1-4.45 4.49zm-9.66-4.13a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33l-4.82 2.78a4.5 4.5 0 0 1-6.19-1.57zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97v5.69a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17-4.83-2.79A4.5 4.5 0 0 1 2.34 7.9zm16.1 3.86-5.84-3.37 2.02-1.17 4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.33-.67zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9l4.83-2.79a4.5 4.5 0 0 1 6.21 4.63zM8.31 12.86 6.29 11.7V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.79.79 0 0 0-.4.68v6.72zm1.1-2.37 2.6-1.5 2.61 1.5v3L11.99 15l-2.61-1.5.03-3.01z" />
      </svg>
    ),
  },
  {
    id: 'claude',
    name: 'Claude',
    url: (p: string) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M11.815 1.816 8.021 12.48.138 9.9l-.138.37 7.883 2.58L4.09 22.184l.37.138 3.905-9.75 3.777 10.612.37-.138-3.775-10.61 10.612 3.773.138-.37-10.61-3.773 3.773-9.497-.139-.37-3.771 9.495L.877 1.816l-.37.138 9.497 3.77L.138 14.22l.37.138 9.866-8.496 3.772 10.614.37-.138-3.77-10.612 9.497 3.773.138-.37-9.497-3.77 3.496-8.771-.37-.138-3.495 8.77-8.497-3.004-.138.37 8.497 3.004-3.496 8.77.37.138 3.496-8.77z" />
      </svg>
    ),
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    url: (p: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(p)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M22 12 12 2 2 12l10 10 10-10zM12 4.83 19.17 12 12 19.17 4.83 12 12 4.83zM12 8l-4 4 4 4 4-4-4-4zm0 2.83L13.17 12 12 13.17 10.83 12 12 10.83z" />
      </svg>
    ),
  },
  {
    id: 'gemini',
    name: 'Gemini',
    url: (p: string) => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 2C9.2 9.2 2 9.2 2 12s7.2 2.8 10 10c2.8-7.2 10-7.2 10-10S14.8 9.2 12 2z" />
      </svg>
    ),
  },
]

// ── AI 성향 채우기 바텀시트 ──────────────────────────────────────────────────
function AiPersonalitySheet({
  open,
  onClose,
  mbti,
  user,
  promptCopied,
  setPromptCopied,
  pastedText,
  setPastedText,
  onApply,
}: {
  open: boolean
  onClose: () => void
  mbti: string | undefined
  user: Pick<import('@/types').UserState, 'whoIAm' | 'life'>
  promptCopied: boolean
  setPromptCopied: (v: boolean) => void
  pastedText: string
  setPastedText: (v: string) => void
  onApply: (text: string) => void
}) {
  const life = user.life
  const music = life?.tastes.music[0]
  const exercise = life?.daily.exercise[0]
  const cafe = life?.tastes.cafes[0]

  const promptLines = [
    '내 성향을 2-3문장으로 솔직하게 표현해줘.',
    '관계 맺는 방식, 에너지 쓰는 방향, 일하는 스타일 중 하나 이상 포함해줘.',
    '딱딱하지 않게 자연스러운 말투로.',
    '',
    '참고 정보:',
  ]
  if (mbti) promptLines.push(`- MBTI: ${mbti}`)
  if (exercise) promptLines.push(`- 즐겨 하는 것: ${exercise.label}`)
  if (music) promptLines.push(`- 자주 듣는 음악: ${music.sublabel ?? music.label}`)
  if (cafe) promptLines.push(`- 자주 찾는 곳: ${cafe.label}`)
  const promptText = promptLines.join('\n')

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText).then(() => {
      setPromptCopied(true)
      setTimeout(() => setPromptCopied(false), 2000)
    })
  }

  const handleOpenTool = (tool: typeof AI_TOOLS[number]) => {
    navigator.clipboard.writeText(promptText).catch(() => {})
    window.open(tool.url(promptText), '_blank')
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6 space-y-5">
        {/* 헤더 */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
            AI 도움받기
          </p>
          <h3 className="mt-1.5 text-[22px] font-black leading-[1.2]" style={{ color: 'var(--color-text-primary)' }}>
            AI로 성향 채우기
          </h3>
        </div>

        {/* 프롬프트 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>프롬프트</p>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all"
              style={{
                background: promptCopied ? 'var(--color-state-success-bg)' : 'var(--color-accent-bg-subtle)',
                color: promptCopied ? 'var(--color-state-success-text)' : 'var(--color-accent-dark)',
                border: `1px solid ${promptCopied ? 'var(--color-state-success-border)' : 'var(--color-accent-border-soft)'}`,
              }}
            >
              {promptCopied ? <Check size={11} /> : <Copy size={11} />}
              {promptCopied ? '복사됨' : '복사'}
            </button>
          </div>
          <div
            className="rounded-[14px] px-4 py-3.5 text-[12px] leading-[1.8] font-mono whitespace-pre-wrap"
            style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-secondary)' }}
          >
            {promptText}
          </div>
        </div>

        {/* AI 도구 선택 */}
        <div>
          <p className="mb-3 text-[12px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
            AI로 바로 열기
          </p>
          <div className="grid grid-cols-4 gap-2">
            {AI_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleOpenTool(tool)}
                className="flex flex-col items-center gap-1.5 rounded-[16px] py-3.5 transition-opacity active:opacity-70"
                style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}
              >
                <span style={{ color: 'var(--color-text-primary)' }}>{tool.icon}</span>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  {tool.name}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-[1.6]" style={{ color: 'var(--color-text-tertiary)' }}>
            선택하면 프롬프트가 대화창에 자동 입력돼요. 답변을 받은 뒤 아래에 붙여넣으세요.
          </p>
        </div>

        {/* 붙여넣기 입력창 */}
        <div>
          <p className="mb-2 text-[12px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>
            AI 답변 붙여넣기
          </p>
          <TextArea
            value={pastedText}
            onChange={setPastedText}
            placeholder="AI가 생성한 성향 문장을 여기에 붙여넣으세요"
            rows={4}
          />
        </div>

        {/* 적용 버튼 */}
        <Button
          onClick={() => onApply(pastedText.trim())}
          disabled={!pastedText.trim()}
        >
          이걸로 채우기
        </Button>
      </div>
    </BottomSheet>
  )
}

// ── WhoIAmEditScreen (기본정보: MBTI + 성향) ──────────────────────────────────
export function WhoIAmEditScreen({
  user,
  onBack,
}: {
  user: Pick<UserState, 'whoIAm' | 'life'>
  onBack: () => void
}) {
  const store = useByroStore()
  const initialWhoIAm: PublicProfileWhoIAm = user.whoIAm ?? SAMPLE_PROFILE.whoIAm
  const [mbti, setMbti] = useState(initialWhoIAm.mbti)
  const [personality, setPersonality] = useState(initialWhoIAm.personality ?? '')
  const [aiSheetOpen, setAiSheetOpen] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)
  const [pastedText, setPastedText] = useState('')

  const handleSave = () => {
    store.updateUserWhoIAm({ ...initialWhoIAm, mbti, personality: personality.trim() || undefined })
    showToast('저장됐어요!')
    onBack()
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar title="기본정보" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-5">

          {/* MBTI */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <label className="text-xs text-[var(--color-text-tertiary)]">MBTI</label>
                <div className="group relative">
                  <Info size={12} className="text-[var(--color-text-tertiary)] opacity-50 cursor-default" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-3 py-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Myers-Briggs 성격 유형 검사.<br />
                    E/I · N/S · T/F · J/P 4가지 기준으로 16가지 성격 유형을 분류해요.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--color-border-soft)]" />
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-[var(--color-text-primary)]">{mbti || '—'}</span>
            </div>
            <div className="space-y-2">
              {MBTI_DIMS.map((dim, dimIndex) => {
                const selectedLetter = mbti?.[dimIndex] ?? ''
                return (
                  <div key={dimIndex} className="flex rounded-xl overflow-hidden border border-[var(--color-border-default)]">
                    {dim.options.map((letter, optIndex) => {
                      const isSelected = selectedLetter === letter
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => {
                            const parts = (mbti || '????').split('')
                            parts[dimIndex] = letter
                            setMbti(parts.join(''))
                          }}
                          className="flex-1 py-2.5 text-left px-4 transition-colors"
                          style={{
                            background: isSelected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                            borderRight: optIndex === 0 ? '1px solid var(--color-border-default)' : undefined,
                          }}
                        >
                          <span className={`text-[13px] font-black ${isSelected ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>{letter}</span>
                          <span className={`ml-1.5 text-[11px] ${isSelected ? 'text-white/80' : 'text-[var(--color-text-tertiary)]'}`}>{dim.labels[optIndex]}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 성향 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--color-text-tertiary)]">성향</label>
              <button
                type="button"
                onClick={() => { setPastedText(''); setAiSheetOpen(true) }}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: 'var(--color-accent-bg-subtle)',
                  color: 'var(--color-accent-dark)',
                  border: '1px solid var(--color-accent-border-soft)',
                }}
              >
                <Sparkles size={11} />
                AI로 채우기
              </button>
            </div>
            <TextArea
              value={personality}
              onChange={setPersonality}
              placeholder="느슨하게 관계를 맺으며 천천히 신뢰를 쌓는 편이에요."
              rows={3}
            />
          </div>

          {/* AI 성향 채우기 바텀시트 */}
          <AiPersonalitySheet
            open={aiSheetOpen}
            onClose={() => setAiSheetOpen(false)}
            mbti={mbti}
            user={user}
            promptCopied={promptCopied}
            setPromptCopied={setPromptCopied}
            pastedText={pastedText}
            setPastedText={setPastedText}
            onApply={(text) => {
              setPersonality(text)
              setAiSheetOpen(false)
              showToast('성향이 채워졌어요!')
            }}
          />

        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={handleSave}>저장</Button>
      </div>
    </div>
  )
}
import {
  DEFAULT_CROP_FRAME,
  clampCropFrameRect,
  getCropImageLayout,
  getDefaultCropFrame,
  getMaxCropFrameWidth,
  getResizedCropFrame,
  renderCroppedImage,
} from '@/lib/imageCropUtils'

interface BasicInfoEditScreenProps {
  user: Pick<UserState, 'name' | 'realName' | 'activityName' | 'activityNameChangedAt' | 'linkId' | 'title' | 'headline' | 'school' | 'bio' | 'avatarImage' | 'profileImages' | 'birthDate' | 'birthTime' | 'calendarType' | 'showAge' | 'isPaidUser'>
  onBack: () => void
}

const EMPTY_PROFILE_IMAGES = ['', '', '', '']

const MBTI_DIMS = [
  { options: ['E', 'I'] as const, labels: ['외향', '내향'] },
  { options: ['N', 'S'] as const, labels: ['직관', '감각'] },
  { options: ['T', 'F'] as const, labels: ['사고', '감정'] },
  { options: ['J', 'P'] as const, labels: ['판단', '인식'] },
]

function normalizeProfileImages(images?: string[], avatarImage?: string) {
  const merged = [...(images ?? [])]

  if (!merged[0] && avatarImage) {
    merged[0] = avatarImage
  }

  return EMPTY_PROFILE_IMAGES.map((_, index) => merged[index] ?? '')
}

function PhotoSlot({
  image,
  label,
  compact = false,
  onClick,
}: {
  image?: string
  label: string
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-full w-full overflow-hidden rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)]"
    >
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={label} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-active:scale-[1.02]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.10)_100%)]" />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-text-tertiary)]">
          <Camera size={compact ? 18 : 22} />
          <span className="text-[11px] font-semibold">{label}</span>
        </div>
      )}

      <div className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[10px] font-semibold text-white/92 backdrop-blur-sm">
        {label}
      </div>

      {image && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.42)_100%)] px-3 py-2 text-[11px] font-semibold text-white/92">
          눌러서 변경
        </div>
      )}
    </button>
  )
}

export function BasicInfoEditScreen({
  user,
  onBack,
}: BasicInfoEditScreenProps) {
  const store = useByroStore()
  const [bio, setBio] = useState(user.bio)

  const [useActivityName, setUseActivityName] = useState(!!user.activityName)
  const [activityName, setActivityName] = useState(user.activityName ?? '')
  const activityNameChangedAt = user.activityNameChangedAt ? new Date(user.activityNameChangedAt) : null
  const daysSinceChange = activityNameChangedAt
    ? Math.floor((Date.now() - activityNameChangedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const isActivityNameLocked = daysSinceChange !== null && daysSinceChange < 30
  const activityNameDaysRemaining = isActivityNameLocked ? 30 - daysSinceChange! : 0

  const [birthDate, setBirthDate] = useState(user.birthDate ?? SAMPLE_PROFILE.birthDate ?? '')
  const [birthTime, setBirthTime] = useState(user.birthTime ?? SAMPLE_PROFILE.birthTime ?? '')
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(user.calendarType ?? SAMPLE_PROFILE.calendarType ?? 'solar')
  const [showAge, setShowAge] = useState(user.showAge ?? SAMPLE_PROFILE.showAge ?? true)
  const [profileImages, setProfileImages] = useState(() => normalizeProfileImages(user.profileImages, user.avatarImage))
  const [previewOpen, setPreviewOpen] = useState(true)
  const [cropSource, setCropSource] = useState('')
  const [cropOpen, setCropOpen] = useState(false)
  const [cropFrame, setCropFrame] = useState({ x: 44, y: 74, width: DEFAULT_CROP_FRAME.width, height: DEFAULT_CROP_FRAME.height })
  const [cropNaturalSize, setCropNaturalSize] = useState({ width: 1, height: 1 })
  const mainPhotoInputRef = useRef<HTMLInputElement>(null)
  const subPhotoInputRef = useRef<HTMLInputElement>(null)
  const pendingSubIndexRef = useRef<number | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; frameX: number; frameY: number } | null>(null)
  const resizeStartRef = useRef<{
    x: number
    y: number
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    frame: { x: number; y: number; width: number; height: number }
  } | null>(null)

  const cropStage = {
    width: 344,
    height: 468,
  }
  const cropImageLayout = getCropImageLayout(cropNaturalSize.width, cropNaturalSize.height, cropStage)

  const handleSave = () => {
    const newActivityName = useActivityName ? activityName.trim() : ''
    const activityNameChanged = newActivityName !== (user.activityName ?? '')
    const realName = user.realName ?? user.name

    store.updateUserInfo({
      headline: user.headline,
      bio,
      avatarImage: profileImages[0] || '',
      profileImages: profileImages.filter(Boolean),
      name: newActivityName || realName,
      activityName: newActivityName || undefined,
      activityNameChangedAt: activityNameChanged && newActivityName
        ? new Date().toISOString()
        : user.activityNameChangedAt,
    })
    store.updateUserInfo({ birthDate, birthTime, calendarType, showAge })
    showToast('저장됐어요!')
    onBack()
  }

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleSubPhotoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const targetIndex = pendingSubIndexRef.current

    if (!file || targetIndex === null) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요')
      event.target.value = ''
      pendingSubIndexRef.current = null
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileImages((prev) => {
          const next = [...prev]
          next[targetIndex] = reader.result as string
          return next
        })
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
    pendingSubIndexRef.current = null
  }

  const handleCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      frameX: cropFrame.x,
      frameY: cropFrame.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
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
    event: PointerEvent<HTMLButtonElement>,
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
    setProfileImages((prev) => {
      const next = [...prev]
      next[0] = cropped
      return next
    })
    setCropOpen(false)
    showToast('사진이 적용됐어요')
  }

  const previewProfileImages = profileImages.filter(Boolean)
  const previewName = (useActivityName ? activityName.trim() : '') || (user.realName ?? user.name)

  return (
    <div className="flex flex-col h-full">
      <NavBar title="프로필카드 편집" onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setPreviewOpen((prev) => !prev)}
              className="mb-3 flex w-full items-center justify-between"
            >
              <span className="text-[13px] font-bold text-[var(--color-text-secondary)]">미리보기</span>
              <ChevronDown
                size={16}
                className="text-[var(--color-text-tertiary)] transition-transform"
                style={{ transform: previewOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>
            {previewOpen && (
              <ProfileHeroCard
                profile={{
                  name: previewName,
                  linkId: user.linkId,
                  age: deriveAgeFromBirthDate(birthDate),
                  birthDate,
                  showAge,
                  avatarImage: previewProfileImages[0],
                  profileImages: previewProfileImages,
                  isPaidUser: user.isPaidUser,
                }}
                heroTheme={DEFAULT_HERO_THEME}
                activeImage={previewProfileImages[0]}
                isOwner
              />
            )}
          </div>

          <div className="mb-7">
            <div className="mb-1 text-[24px] font-black tracking-[-0.03em] text-[var(--color-text-primary)]">프로필 사진</div>
            <div className="text-[13px] text-[var(--color-text-secondary)]">
              얼굴이 나온 대표 사진 1장과 분위기를 보여주는 서브 사진 3장을 넣어주세요.
            </div>
            <input
              ref={mainPhotoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarFileChange}
            />
            <input
              ref={subPhotoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleSubPhotoFileChange}
            />

            <div className="mt-4 grid h-[336px] grid-cols-[minmax(0,1fr)_86px] items-stretch gap-3">
              <PhotoSlot
                image={profileImages[0]}
                label="메인"
                onClick={() => mainPhotoInputRef.current?.click()}
              />
              <div className="grid h-full grid-rows-3 gap-3">
                {[1, 2, 3].map((index) => (
                  <PhotoSlot
                    key={index}
                    image={profileImages[index]}
                    label={`서브 ${index}`}
                    compact
                    onClick={() => {
                      pendingSubIndexRef.current = index
                      subPhotoInputRef.current?.click()
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">이름</label>
              <input
                value={user.realName ?? user.name}
                disabled
                className="w-full border border-[var(--color-border-soft)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)]"
              />
            </div>

            {/* 활동명 */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (isActivityNameLocked) return
                  setUseActivityName((prev) => !prev)
                  if (useActivityName) setActivityName('')
                }}
                className="flex items-center gap-2 mb-2.5"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${useActivityName ? 'border-[var(--color-accent-dark)] bg-[var(--color-accent-dark)]' : 'border-[var(--color-border-default)] bg-[var(--color-bg-soft)]'}`}>
                  {useActivityName && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-[13px] font-medium text-[var(--color-text-primary)]">활동명 사용</span>
              </button>

              {useActivityName && (
                <div>
                  <input
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    disabled={isActivityNameLocked}
                    placeholder="예: 크리에이터K, Alex, 디에디트"
                    maxLength={30}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
                      isActivityNameLocked
                        ? 'border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)]'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] focus:border-[var(--color-accent-dark)]'
                    }`}
                  />
                  {isActivityNameLocked ? (
                    <p className="mt-1.5 text-[11px] text-[var(--color-state-warning-text)]">
                      활동명은 변경 후 30일간 수정할 수 없어요. ({activityNameDaysRemaining}일 후 변경 가능)
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-[var(--color-text-tertiary)]">
                      변경 후 30일간 재변경이 불가해요.
                    </p>
                  )}
                </div>
              )}

              {!useActivityName && (
                <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
                  유튜버·크리에이터 등 활동명으로 활동하시는 분들을 위한 선택 기능이에요. 활동명을 설정하면 실명 대신 활동명으로 프로필에 노출돼요.
                </p>
              )}
            </div>

            <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--color-text-tertiary)]">생년월일</label>
                  <button
                    type="button"
                    onClick={() => setShowAge((prev) => !prev)}
                    className="flex items-center gap-1.5"
                  >
                    <div className={`relative w-7 h-4 rounded-full transition-colors ${showAge ? 'bg-[var(--color-accent-dark)]' : 'bg-[var(--color-border-default)]'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${showAge ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">나이 공개</span>
                  </button>
                </div>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                  className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--color-text-tertiary)] mb-2 block">생시</label>
                <select
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none appearance-none"
                >
                  <option value="">모름</option>
                  <option value="23:00">23:00 ~ 01:00</option>
                  <option value="01:00">01:00 ~ 03:00</option>
                  <option value="03:00">03:00 ~ 05:00</option>
                  <option value="05:00">05:00 ~ 07:00</option>
                  <option value="07:00">07:00 ~ 09:00</option>
                  <option value="09:00">09:00 ~ 11:00</option>
                  <option value="11:00">11:00 ~ 13:00</option>
                  <option value="13:00">13:00 ~ 15:00</option>
                  <option value="15:00">15:00 ~ 17:00</option>
                  <option value="17:00">17:00 ~ 19:00</option>
                  <option value="19:00">19:00 ~ 21:00</option>
                  <option value="21:00">21:00 ~ 23:00</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-2 block">양력 / 음력</label>
              <div className="flex gap-2">
                {(['solar', 'lunar'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCalendarType(type)}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{
                      borderColor: calendarType === type ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                      background: calendarType === type ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                      color: calendarType === type ? '#ffffff' : 'var(--color-text-secondary)',
                    }}
                  >
                    {type === 'solar' ? '양력' : '음력'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-xs text-[var(--color-text-tertiary)]">자기소개</label>
                <button
                  onClick={() => showToast('AI 자기소개 생성 중...')}
                  className="text-xs text-[var(--color-accent-dark)] font-bold"
                >
                  → AI로 채우기
                </button>
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
