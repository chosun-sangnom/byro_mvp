'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { ChevronRight, Pencil, BookmarkCheck, CreditCard } from 'lucide-react'
import { showToast } from '@/components/ui'

const MENU_ITEMS = [
  {
    id: 'edit',
    icon: Pencil,
    label: '바이로 편집',
    description: '프로필·하이라이트·라이프스타일 수정',
    href: '/me?edit=true',
  },
  {
    id: 'archive',
    icon: BookmarkCheck,
    label: '아카이브',
    description: '저장한 프로필과 최근 본 프로필',
    href: '/archive',
  },
  {
    id: 'billing',
    icon: CreditCard,
    label: '유료 결제',
    description: '프리미엄 플랜 및 결제 내역',
    href: null,
  },
]

export default function MyPageScreen() {
  const router = useRouter()
  const store = useByroStore()
  const user = store.user

  const initials = user?.name ? user.name.slice(0, 2) : 'BY'

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-page)]">

      {/* 프로필 요약 */}
      <button
        onClick={() => router.push('/me')}
        className="flex items-center gap-4 px-5 py-6 border-b border-[var(--color-border-soft)] hover:bg-[var(--color-bg-soft)] transition-colors text-left w-full"
      >
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
          {user?.avatarImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-[18px] font-bold"
              style={{ backgroundColor: user?.avatarColor ?? 'var(--color-accent-dark)' }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-black text-[var(--color-text-primary)] truncate">{user?.name}</p>
          <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">내 프로필 보기</p>
        </div>
        <ChevronRight size={18} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
      </button>

      {/* 메뉴 목록 */}
      <ul className="flex flex-col mt-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <button
                onClick={() => {
                  if (!item.href) { showToast('준비 중이에요'); return }
                  router.push(item.href)
                }}
                className="flex items-center gap-4 w-full px-5 py-4 hover:bg-[var(--color-bg-soft)] transition-colors text-left border-b border-[var(--color-border-soft)]"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-bg-muted)' }}
                >
                  <Icon size={18} className="text-[var(--color-text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{item.description}</p>
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
