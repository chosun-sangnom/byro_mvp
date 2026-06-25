import { showToast } from '@/components/ui'

export async function shareOrCopy({
  title,
  text,
  url,
}: {
  title: string
  text?: string
  url: string
}) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url })
      return
    }
    await navigator.clipboard.writeText(url)
    showToast('링크를 복사했어요')
  } catch {
    showToast('공유를 취소했어요')
  }
}
