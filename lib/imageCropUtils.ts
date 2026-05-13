export const CROP_RATIO = 4 / 5
export const DEFAULT_CROP_FRAME = { width: 256, height: 320 }

export function getMaxCropFrameWidth(imageLayout: { width: number; height: number }) {
  return Math.min(imageLayout.width, imageLayout.height * CROP_RATIO)
}

export function getDefaultCropFrame(imageLayout: { width: number; height: number; left: number; top: number }) {
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

export function clampCropFrameWidth(width: number, imageLayout: { width: number; height: number }) {
  const minWidth = 180
  const maxWidth = getMaxCropFrameWidth(imageLayout)
  return Math.max(minWidth, Math.min(maxWidth, width))
}

export function clampCropFrameRect(
  frame: { x: number; y: number; width: number; height: number },
  imageLayout: { width: number; height: number; left: number; top: number },
) {
  return {
    ...frame,
    x: Math.max(imageLayout.left, Math.min(imageLayout.left + imageLayout.width - frame.width, frame.x)),
    y: Math.max(imageLayout.top, Math.min(imageLayout.top + imageLayout.height - frame.height, frame.y)),
  }
}

export function getResizedCropFrame(
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

export function getCropImageLayout(
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

export async function renderCroppedImage(
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
