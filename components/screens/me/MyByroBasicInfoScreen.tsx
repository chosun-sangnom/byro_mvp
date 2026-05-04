'use client'

import { useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import { Camera } from 'lucide-react'
import { Button, showToast, TextArea } from '@/components/ui'
import { useByroStore } from '@/store/useByroStore'
import type { UserState } from '@/types'

interface BasicInfoEditScreenProps {
  user: Pick<UserState, 'name' | 'linkId' | 'bio' | 'avatarImage'>
  onBack: () => void
}

const CROP_RATIO = 4 / 5
const DEFAULT_CROP_FRAME = { width: 256, height: 320 }

export function BasicInfoEditScreen({
  user,
  onBack,
}: BasicInfoEditScreenProps) {
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

  const cropStage = {
    width: 344,
    height: 468,
  }
  const cropImageLayout = getCropImageLayout(cropNaturalSize.width, cropNaturalSize.height, cropStage)

  const handleSave = () => {
    store.updateUserInfo({ bio, avatarImage })
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
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.85)] backdrop-blur-md flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">프로필 편집</span>
      </div>

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
            <div className="text-[11px] text-[#AAA] mt-1">직사각형 메인 카드와 원형 프로필 이미지에 같이 사용됩니다.</div>
          </div>

          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">이름</label>
              <input
                value={user.name}
                disabled
                placeholder="변경 불가"
                className="w-full border border-[#eee] rounded-xl px-4 py-2.5 text-sm bg-[#f9f9f9] text-[#aaa]"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-xs text-[var(--color-text-tertiary)]">자기소개</label>
                <button
                  onClick={() => showToast('AI 자기소개 생성 중...')}
                  className="text-xs text-[#E8A000] font-bold"
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
