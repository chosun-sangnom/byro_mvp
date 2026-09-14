// 사진을 data URL로 읽되 긴 변을 줄여 저장한다 — 원본 폰 사진을 그대로 넣으면 localStorage 용량을 넘긴다.
// TODO(real API): 오브젝트 스토리지 업로드 후 URL만 저장하도록 교체
export function readImageFileAsDataUrl(file: File, maxSize = 1080): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('이미지를 읽지 못했어요'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('이미지를 처리하지 못했어요'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
