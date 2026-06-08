'use client'

import { X, UserPlus, BookOpen, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

// [임시] 방명록·피드백 알림은 목업 데이터 사용 — API 연동 후 교체
const MOCK_GUESTBOOK_NOTIFS = SAMPLE_PROFILE.guestbook.slice(0, 3).map((g) => ({
  id: `gb-${g.id}`,
  type: 'guestbook' as const,
  name: g.authorName,
  linkId: g.linkId,
  text: g.message,
  date: g.date,
}))

const MOCK_FEEDBACK_NOTIFS = [
  { id: 'fb-1', type: 'feedback' as const, name: '이지민', linkId: 'jiminlee', text: '전문성이 느껴져요 외 2개', date: '1일 전' },
  { id: 'fb-2', type: 'feedback' as const, name: '강명구', linkId: 'mk', text: '어려울 때 생각나는 사람이에요', date: '3일 전' },
]

type NotifType = 'connection' | 'guestbook' | 'feedback'

interface NotifItem {
  id: string
  type: NotifType
  name: string
  linkId: string
  text: string
  date: string
}

const TYPE_META: Record<NotifType, { icon: React.ReactNode; label: string }> = {
  connection: {
    icon: <UserPlus size={14} />,
    label: '연결 요청',
  },
  guestbook: {
    icon: <BookOpen size={14} />,
    label: '방명록',
  },
  feedback: {
    icon: <Star size={14} />,
    label: '피드백',
  },
}

function buildMessage(item: NotifItem) {
  if (item.type === 'connection') return `${item.name} 님이 연결 요청을 보냈어요`
  if (item.type === 'guestbook') return `${item.name} 님이 방명록을 남겼어요`
  return `${item.name} 님이 피드백을 남겼어요`
}

interface Props {
  onClose: () => void
}

export default function NotificationModal({ onClose }: Props) {
  const router = useRouter()
  const { connectionRequests } = useByroStore()

  const connectionNotifs: NotifItem[] = connectionRequests.map((r) => ({
    id: `conn-${r.id}`,
    type: 'connection',
    name: r.name,
    linkId: r.linkId,
    text: r.message ?? '',
    date: r.requestedAt,
  }))

  const all: NotifItem[] = [
    ...connectionNotifs,
    ...MOCK_GUESTBOOK_NOTIFS,
    ...MOCK_FEEDBACK_NOTIFS,
  ]

  const handleTap = (item: NotifItem) => {
    onClose()
    if (item.type === 'connection') router.push('/archive')
    else router.push(`/${item.linkId}`)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[var(--color-bg-page)]">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <span className="text-[16px] font-bold text-[var(--color-text-primary)]">알림</span>
        <button
          onClick={onClose}
          className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="닫기"
        >
          <X size={20} />
        </button>
      </div>

      {/* 목록 */}
      {all.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center px-6">
          <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">새 알림이 없어요</p>
          <p className="text-[13px] text-[var(--color-text-secondary)]">연결 요청이나 방명록이 오면 여기에 표시돼요</p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto py-2">
          {all.map((item) => {
            const meta = TYPE_META[item.type]
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTap(item)}
                  className="w-full flex items-start gap-3 px-5 py-4 hover:bg-[var(--color-bg-soft)] transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent-dark)] flex-shrink-0 mt-0.5">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-semibold text-[var(--color-accent-dark)]">{meta.label}</span>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">· {item.date}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
                      {buildMessage(item)}
                    </p>
                    {item.text ? (
                      <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    ) : null}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
