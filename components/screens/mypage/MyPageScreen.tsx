'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { ChevronRight, Pencil, BookmarkCheck, CreditCard, Link2, Eye } from 'lucide-react'
import { showToast } from '@/components/ui'

type MenuItem = {
  id: string
  icon: React.ElementType
  label: string
  description?: string
  href?: string
  badge?: string
  locked?: boolean
}

type Section = {
  title: string
  items: MenuItem[]
}

export default function MyPageScreen() {
  const router = useRouter()
  const store = useByroStore()
  const user = store.user
  const initials = user?.name ? user.name.slice(0, 2) : 'BY'
  const isPaid = user?.isPaidUser ?? false
  const currentLinkId = user?.linkId ?? ''
  const tabVisibility = store.tabVisibility ?? { who: 'public', life: 'public', reputation: 'public' }

  const VISIBILITY_LABEL: Record<string, string> = { public: '전체공개', private: '비공개' }
  const visibilitySummary = `나 ${VISIBILITY_LABEL[tabVisibility.who]} · 라이프 ${VISIBILITY_LABEL[tabVisibility.life]} · 관계 ${VISIBILITY_LABEL[tabVisibility.reputation]}`

  const sections: Section[] = [
    {
      title: '내 바이로',
      items: [
        {
          id: 'edit',
          icon: Pencil,
          label: '바이로 편집',
          description: '프로필·하이라이트·라이프스타일',
          href: '/me?edit=true',
        },
        {
          id: 'visibility',
          icon: Eye,
          label: '공개 설정',
          description: visibilitySummary,
          href: '/me?section=visibility',
        },
        {
          id: 'archive',
          icon: BookmarkCheck,
          label: '아카이브',
          description: '저장한 프로필 · 최근 본',
          href: '/archive',
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          id: 'link',
          icon: Link2,
          label: '내 링크',
          description: `byro.io/${currentLinkId}`,
          href: isPaid ? '/me?edit=true' : undefined,
          badge: isPaid ? 'PRO' : undefined,
          locked: !isPaid,
        },
        {
          id: 'billing',
          icon: CreditCard,
          label: '유료 결제',
          description: '프리미엄 플랜 및 결제 내역',
          href: undefined,
        },
      ],
    },
  ]

  const handleItem = (item: MenuItem) => {
    if (item.locked) { showToast('유료 플랜에서 사용할 수 있는 기능이에요'); return }
    if (!item.href) { showToast('준비 중이에요'); return }
    router.push(item.href)
  }

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full pb-[env(safe-area-inset-bottom)]">

      {/* 프로필 카드 */}
      <button
        onClick={() => router.push('/me')}
        className="flex items-center gap-3.5 px-5 py-5 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-soft)] w-full text-left active:opacity-80 transition-opacity"
      >
        <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0">
          {user?.avatarImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-[17px] font-bold"
              style={{ backgroundColor: user?.avatarColor ?? 'var(--color-accent-dark)' }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-black text-[var(--color-text-primary)] truncate leading-snug">{user?.name}</p>
          <p className="text-[12px] text-[var(--color-accent-dark)] mt-0.5 font-medium">내 프로필 보기</p>
        </div>
        <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
      </button>

      {/* 메뉴 섹션 */}
      <div className="flex flex-col gap-6 pt-6 px-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)] px-1 mb-2">
              {section.title}
            </p>
            <div className="rounded-2xl overflow-hidden border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] divide-y divide-[var(--color-border-soft)]">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItem(item)}
                    className="flex items-center gap-3.5 w-full px-4 py-3.5 text-left active:bg-[var(--color-bg-muted)] transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--color-bg-muted)' }}
                    >
                      <Icon size={16} className="text-[var(--color-text-secondary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                        {item.badge && (
                          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                            style={{ background: 'var(--color-accent-bg-subtle)', color: 'var(--color-accent-dark)' }}>
                            {item.badge}
                          </span>
                        )}
                        {item.locked && (
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">🔒</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 truncate">{item.description}</p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0 opacity-50" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
