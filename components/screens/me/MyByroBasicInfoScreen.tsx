'use client'

import { useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import { Camera } from 'lucide-react'
import { Button, NavBar, showToast, TextArea } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { useByroStore } from '@/store/useByroStore'
import type { PublicProfileLife, PublicProfileWhoIAm, SajuProfileInput, UserState } from '@/types'
import {
  CROP_RATIO,
  DEFAULT_CROP_FRAME,
  clampCropFrameRect,
  getCropImageLayout,
  getDefaultCropFrame,
  getMaxCropFrameWidth,
  getResizedCropFrame,
  renderCroppedImage,
} from '@/lib/imageCropUtils'

interface BasicInfoEditScreenProps {
  user: Pick<UserState, 'name' | 'linkId' | 'title' | 'headline' | 'school' | 'bio' | 'avatarImage' | 'headerMeta' | 'sajuProfile' | 'whoIAm' | 'life'>
  onBack: () => void
}


const MBTI_DIMS = [
  { options: ['E', 'I'] as const, labels: ['외향', '내향'] },
  { options: ['N', 'S'] as const, labels: ['직관', '감각'] },
  { options: ['T', 'F'] as const, labels: ['사고', '감정'] },
  { options: ['J', 'P'] as const, labels: ['판단', '인식'] },
]
const PET_OPTIONS = ['없음', '강아지', '고양이', '기타']

export function BasicInfoEditScreen({
  user,
  onBack,
}: BasicInfoEditScreenProps) {
  const store = useByroStore()
  const [bio, setBio] = useState(user.bio)
  const initialWhoIAm: PublicProfileWhoIAm = user.whoIAm ?? SAMPLE_PROFILE.whoIAm
  const initialLife: PublicProfileLife = user.life ?? SAMPLE_PROFILE.life
  const initialSajuProfile: SajuProfileInput = user.sajuProfile ?? (SAMPLE_PROFILE.sajuProfile as SajuProfileInput)
  const [mbti, setMbti] = useState(initialWhoIAm.mbti)
  const [pet, setPet] = useState(initialLife.daily.pet)
  const [petName, setPetName] = useState(initialLife.daily.petName ?? '')
  const [petImage, setPetImage] = useState(initialLife.daily.petImage ?? '')
  const petFileInputRef = useRef<HTMLInputElement>(null)
  const [birthDate, setBirthDate] = useState(initialSajuProfile.birthDate)
  const [birthTime, setBirthTime] = useState(initialSajuProfile.birthTime)
  const [birthPlace, setBirthPlace] = useState(initialSajuProfile.birthPlace)
  const [calendarType, setCalendarType] = useState<SajuProfileInput['calendarType']>(initialSajuProfile.calendarType)
  const [showAge, setShowAge] = useState(initialSajuProfile.showAge ?? true)
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

  const cropStage = {
    width: 344,
    height: 468,
  }
  const cropImageLayout = getCropImageLayout(cropNaturalSize.width, cropNaturalSize.height, cropStage)

  const handleSave = () => {
    store.updateUserInfo({
      headline: user.headline,
      bio,
      avatarImage,
      headerMeta: {
        residence: user.headerMeta?.residence ?? SAMPLE_PROFILE.headerMeta.residence,
        mood: user.headerMeta?.mood ?? SAMPLE_PROFILE.headerMeta.mood,
        availability: user.headerMeta?.availability ?? SAMPLE_PROFILE.headerMeta.availability,
      },
    })
    store.updateUserSajuProfile({
      ...initialSajuProfile,
      birthDate,
      birthTime,
      birthPlace,
      calendarType,
      isBirthTimeUnknown: !birthTime,
      showAge,
    })
    store.updateUserWhoIAm({
      ...initialWhoIAm,
      mbti,
    })
    store.updateUserLife({
      ...initialLife,
      daily: {
        ...initialLife.daily,
        pet,
        petName: pet === '없음' ? undefined : petName.trim() || undefined,
        petImage: pet === '없음' ? undefined : petImage || undefined,
      },
    })
    showToast('저장됐어요!')
    onBack()
  }

  const handlePetFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setPetImage(reader.result)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
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
    setAvatarImage(cropped)
    setCropOpen(false)
    showToast('사진이 적용됐어요')
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar title="기본정보 편집" onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5">
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
            <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">직사각형 메인 카드와 원형 프로필 이미지에 같이 사용됩니다.</div>
          </div>

          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">이름</label>
              <input
                value={user.name}
                disabled
                placeholder="변경 불가"
                className="w-full border border-[var(--color-border-soft)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-[var(--color-text-tertiary)]">MBTI</label>
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

            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-2 block">반려동물</label>
              <div className="flex flex-wrap gap-2">
                {PET_OPTIONS.map((option) => {
                  const selected = option === pet
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPet(option)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                      style={{
                        borderColor: selected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                        background: selected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                        color: selected ? '#ffffff' : 'var(--color-text-secondary)',
                      }}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>

            {pet !== '없음' && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => petFileInputRef.current?.click()}
                  className="relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] flex items-center justify-center"
                >
                  {petImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={petImage} alt="반려동물 사진" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={18} className="text-[var(--color-text-tertiary)]" />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-1 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-semibold">변경</span>
                  </div>
                </button>
                <input
                  ref={petFileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePetFileChange}
                />
                <div className="flex-1">
                  <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">반려동물 이름</label>
                  <input
                    value={petName}
                    onChange={(event) => setPetName(event.target.value)}
                    placeholder="예: 몽이"
                    className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
                  />
                </div>
              </div>
            )}

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
                <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">생시</label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(event) => setBirthTime(event.target.value)}
                  className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-2 block">양력 / 음력</label>
              <div className="flex gap-2">
                {[
                  { id: 'solar', label: '양력' },
                  { id: 'lunar', label: '음력' },
                ].map((option) => {
                  const selected = option.id === calendarType
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setCalendarType(option.id as SajuProfileInput['calendarType'])}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                      style={{
                        borderColor: selected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                        background: selected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                        color: selected ? '#ffffff' : 'var(--color-text-secondary)',
                      }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">출생지</label>
              <input
                value={birthPlace}
                onChange={(event) => setBirthPlace(event.target.value)}
                placeholder="예: 서울, 부산, 대전"
                className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
              />
              <div className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
                생년월일 아래에 생시와 출생지를 함께 입력하면 사주 해석 정확도를 높일 수 있어요.
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

