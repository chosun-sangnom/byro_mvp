'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BookOpen, Search, Star, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

// [임시] 방명록·피드백 알림 목업 — API 연동 후 교체
const MOCK_NOTIFS = [
  ...SAMPLE_PROFILE.guestbook.slice(0, 2).map((g) => ({
    id: `gb-${g.id}`, type: 'guestbook' as const,
    name: g.authorName, linkId: g.linkId, body: g.message, date: g.date,
  })),
  { id: 'fb-1', type: 'feedback' as const, name: '이지민', linkId: 'jiminlee', body: '전문성이 느껴져요 외 2개', date: '1일 전' },
  { id: 'fb-2', type: 'feedback' as const, name: '강명구', linkId: 'mk', body: '어려울 때 생각나는 사람이에요', date: '3일 전' },
]

const NOTIF_META = {
  guestbook: { icon: <BookOpen size={14} />, label: '방명록', msg: (n: string) => `${n} 님이 방명록을 남겼어요` },
  feedback:  { icon: <Star size={14} />,     label: '피드백', msg: (n: string) => `${n} 님이 피드백을 남겼어요` },
}

export default function AppHeader() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuth()
  const [notiOpen, setNotiOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const hasUnread = MOCK_NOTIFS.length > 0

  const allNotifs = MOCK_NOTIFS

  return (
    <>
      <header className="flex items-center justify-between px-5 h-14 bg-[var(--color-bg-page)] border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="text-[18px] font-black tracking-tight text-[var(--color-text-strong)]"
        >
          Byro
        </button>

        <div className="flex items-center gap-1">
          {/* 검색 — 페이지 이동 */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => router.push('/search')}
            className="p-2 text-[var(--color-text-secondary)]"
            aria-label="검색"
          >
            <Search size={20} />
          </motion.button>

          {/* 알림 — 로그인 시에만 표시 */}
          {isLoggedIn && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setNotiOpen((o) => !o)}
              className="relative p-2 text-[var(--color-text-secondary)]"
              aria-label="알림"
            >
              <Bell size={20} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </motion.button>
          )}

          {/* 아바타 */}
          {isLoggedIn ? (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setProfileOpen((o) => !o)}
              className="ml-1"
              aria-label="프로필 메뉴"
            >
              <Avatar src={user?.avatarImage} name={user?.name ?? ''} color={user?.avatarColor ?? 'var(--color-accent-dark)'} size={32} />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => router.push('/signup')}
              className="ml-1 px-3.5 py-1.5 rounded-full text-[12px] font-bold text-white"
              style={{ backgroundColor: 'var(--color-accent-dark)' }}
              aria-label="로그인"
            >
              로그인
            </motion.button>
          )}
        </div>
      </header>

      {/* 프로필 패널 */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              key="profile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 top-14 z-30"
              onClick={() => setProfileOpen(false)}
            />
            <motion.div
              key="profile-panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 top-14 z-40 w-56 bg-[var(--color-bg-page)] border border-[var(--color-border-soft)] rounded-xl shadow-xl mx-3 overflow-hidden"
            >
              {/* 프로필 정보 — 사진 클릭 시 내 프로필 보기 */}
              <button
                onClick={() => { setProfileOpen(false); router.push('/me') }}
                className="flex flex-col items-center gap-2 px-5 pt-5 pb-4 w-full hover:bg-[var(--color-bg-soft)] transition-colors"
              >
                <Avatar src={user?.avatarImage} name={user?.name ?? ''} color={user?.avatarColor ?? 'var(--color-accent-dark)'} size={64} />
                <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">{user?.name}</span>
              </button>

              {/* 버튼 */}
              <div className="flex border-t border-[var(--color-border-soft)]">
                <button
                  onClick={() => { setProfileOpen(false); router.push('/mypage') }}
                  className="flex-1 py-3 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-soft)] transition-colors border-r border-[var(--color-border-soft)]"
                >
                  마이페이지
                </button>
                <button
                  onClick={() => { setProfileOpen(false); logout() }}
                  className="flex-1 py-3 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 알림 드롭다운 */}
      <AnimatePresence>
        {notiOpen && (
          <>
            <motion.div
              key="noti-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 top-14 z-30"
              onClick={() => setNotiOpen(false)}
            />
            <motion.div
              key="noti-panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-14 z-40 bg-[var(--color-bg-page)] border-b border-[var(--color-border-soft)] shadow-xl max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-soft)]">
                <span className="text-[14px] font-bold text-[var(--color-text-primary)]">알림</span>
                <button onClick={() => setNotiOpen(false)} className="p-1 text-[var(--color-text-secondary)]">
                  <X size={16} />
                </button>
              </div>

              {allNotifs.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[13px] text-[var(--color-text-secondary)]">새 알림이 없어요</p>
                </div>
              ) : (
                <ul className="py-1">
                  {allNotifs.map((item, i) => {
                    const meta = NOTIF_META[item.type]
                    return (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.15 }}
                      >
                        <button
                          onClick={() => {
                            setNotiOpen(false)
                            router.push(`/${item.linkId}`)
                          }}
                          className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--color-bg-soft)] transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent-dark)] flex-shrink-0 mt-0.5">
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[11px] font-semibold text-[var(--color-accent-dark)]">{meta.label}</span>
                              <span className="text-[11px] text-[var(--color-text-tertiary)]">· {item.date}</span>
                            </div>
                            <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{meta.msg(item.name)}</p>
                            {item.body && (
                              <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">&ldquo;{item.body}&rdquo;</p>
                            )}
                          </div>
                        </button>
                      </motion.li>
                    )
                  })}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
