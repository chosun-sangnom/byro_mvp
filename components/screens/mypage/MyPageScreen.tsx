'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { ChevronRight, Link, Lock, Pencil, BookmarkCheck, CreditCard, Eye } from 'lucide-react'
import { NavBar, BottomSheet, showToast } from '@/components/ui'

const CUSTOM_LINK_ID_REGEX = /^[a-z0-9_]{2,20}$/

type Screen = 'main' | 'billing'

type MenuItem = {
  id: string
  icon: React.ElementType
  label: string
  description?: string
  href?: string
  onClick?: () => void
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
  const randomLinkId = user?.randomLinkId ?? user?.linkId ?? ''
  const tabVisibility = store.tabVisibility ?? { who: 'public', life: 'public', reputation: 'public' }

  const [screen, setScreen] = useState<Screen>('main')
  const [linkIdSheetOpen, setLinkIdSheetOpen] = useState(false)
  const [customLinkInput, setCustomLinkInput] = useState(user?.customLinkId ?? '')

  const handleSaveCustomLinkId = () => {
    const trimmed = customLinkInput.trim().toLowerCase()
    if (trimmed && !CUSTOM_LINK_ID_REGEX.test(trimmed)) {
      showToast('영문 소문자·숫자·_만 사용할 수 있어요 (2~20자)')
      return
    }
    store.setCustomLinkId(trimmed || null)
    setLinkIdSheetOpen(false)
    showToast(trimmed ? '링크가 변경됐어요!' : '기본 링크로 복원했어요')
  }

  const VISIBILITY_LABEL: Record<string, string> = { public: '전체공개', private: '비공개' }
  const visibilitySummary = `WHO ${VISIBILITY_LABEL[tabVisibility.who]} · VIBE ${VISIBILITY_LABEL[tabVisibility.vibe]} · NETWORK ${VISIBILITY_LABEL[tabVisibility.network]}`

  // ── 유료결제 서브스크린 ──────────────────────────────────────────
  if (screen === 'billing') {
    return (
      <div className="flex h-full flex-col bg-[var(--color-bg-page)]">
        <NavBar title="유료 결제" onBack={() => setScreen('main')} />

        <div className="flex-1 overflow-y-auto">
          {/* 플랜 상태 카드 */}
          <div className="mx-4 mt-5 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-5 py-5">
            {isPaid ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent-dark)]">PRO</span>
                  <p className="text-[15px] font-black text-[var(--color-text-primary)]">프리미엄 이용 중</p>
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)]">내 링크 커스터마이징 등 PRO 기능을 이용할 수 있어요.</p>
              </>
            ) : (
              <>
                <p className="text-[15px] font-black text-[var(--color-text-primary)] mb-1">무료 플랜</p>
                <p className="text-[12px] text-[var(--color-text-secondary)] mb-4">PRO로 업그레이드하면 내 링크 커스터마이징 등 프리미엄 기능을 쓸 수 있어요.</p>
                <button
                  onClick={() => showToast('준비 중이에요')}
                  className="w-full rounded-full py-3 text-[13px] font-semibold text-white whitespace-nowrap"
                  style={{ backgroundColor: 'var(--color-accent-dark)' }}
                >
                  PRO 업그레이드
                </button>
              </>
            )}
          </div>

          {/* 내 링크 항목 */}
          <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]">
            <button
              onClick={() => isPaid ? setLinkIdSheetOpen(true) : showToast('유료 플랜에서 사용할 수 있는 기능이에요')}
              className="flex w-full items-center gap-3.5 px-4 py-4 text-left active:bg-[var(--color-bg-muted)] transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-bg-muted)' }}
              >
                <Link size={16} className="text-[var(--color-text-secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">내 링크</p>
                  {!isPaid && <Lock size={11} className="text-[var(--color-text-tertiary)]" />}
                  {isPaid && (
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent-dark)]">PRO</span>
                  )}
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">byro.io/{currentLinkId}</p>
                {!isPaid && (
                  <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">유료 플랜으로 나만의 링크를 설정할 수 있어요</p>
                )}
              </div>
              <ChevronRight size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0 opacity-50" />
            </button>
          </div>
        </div>

        {/* 내 링크 편집 BottomSheet */}
        <BottomSheet open={linkIdSheetOpen} onClose={() => setLinkIdSheetOpen(false)}>
          <div className="px-5 pb-6">
            <p className="text-[18px] font-black text-[var(--color-text-strong)] mb-1">내 링크 설정</p>
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
              나만의 링크를 설정하면 <span className="font-semibold">byro.io/내이름</span> 형태로 프로필을 공유할 수 있어요. 유료 이용 종료 시 기본 링크로 자동 복원돼요.
            </p>

            <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-[0.08em]">기본 링크 (변경 불가)</p>
            <div className="flex items-center gap-1.5 mb-4 px-4 py-2.5 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]">
              <span className="text-[13px] text-[var(--color-text-tertiary)]">byro.io/</span>
              <span className="text-[13px] font-semibold text-[var(--color-text-tertiary)]">{randomLinkId}</span>
            </div>

            <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-[0.08em]">커스텀 링크</p>
            <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] mb-1.5">
              <span className="text-[13px] text-[var(--color-text-tertiary)] flex-shrink-0">byro.io/</span>
              <input
                type="text"
                value={customLinkInput}
                onChange={(e) => setCustomLinkInput(e.target.value.toLowerCase())}
                placeholder="예: gangminjun"
                maxLength={20}
                className="flex-1 bg-transparent text-[13px] font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] placeholder:font-normal"
              />
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mb-5">영문 소문자·숫자·_만 사용, 2~20자</p>

            <button
              onClick={handleSaveCustomLinkId}
              className="w-full rounded-full py-3.5 text-[14px] font-semibold text-white whitespace-nowrap"
              style={{ backgroundColor: 'var(--color-accent-dark)' }}
            >
              저장
            </button>
            {user?.customLinkId && (
              <button
                onClick={() => { store.setCustomLinkId(null); setCustomLinkInput(''); setLinkIdSheetOpen(false); showToast('기본 링크로 복원했어요') }}
                className="w-full mt-2 py-3 text-[13px] font-medium text-[var(--color-text-tertiary)]"
              >
                기본 링크로 복원
              </button>
            )}
          </div>
        </BottomSheet>
      </div>
    )
  }

  // ── 메인 화면 ────────────────────────────────────────────────────
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
          id: 'billing',
          icon: CreditCard,
          label: '유료 결제',
          description: isPaid ? 'PRO · 프리미엄 기능 이용 중' : '내 링크 커스터마이징 · 프리미엄 기능',
          onClick: () => setScreen('billing'),
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">

      {/* 프로필 카드 */}
      <button
        onClick={() => router.push('/me')}
        className="flex items-center gap-4 mx-4 mt-6 mb-2 px-4 py-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-soft)] w-[calc(100%-2rem)] text-left active:opacity-80 transition-opacity"
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
          <p className="text-[16px] font-black text-[var(--color-text-primary)] truncate">{user?.name}</p>
          <p className="text-[12px] text-[var(--color-accent-dark)] mt-0.5 font-medium">내 프로필 보기 →</p>
        </div>
      </button>

      {/* 메뉴 섹션 */}
      <div className="flex flex-col gap-5 px-4 mt-4 pb-[calc(env(safe-area-inset-bottom)+32px)]">
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
                    onClick={() => {
                      if (item.onClick) { item.onClick(); return }
                      if (!item.href) { showToast('준비 중이에요'); return }
                      router.push(item.href)
                    }}
                    className="flex items-center gap-3.5 w-full px-4 py-4 text-left active:bg-[var(--color-bg-muted)] transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--color-bg-muted)' }}
                    >
                      <Icon size={16} className="text-[var(--color-text-secondary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
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
