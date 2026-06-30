'use client'

import { useRouter } from 'next/navigation'
import { Search, ChevronRight } from 'lucide-react'
import { Avatar, ToastSingleton, showToast } from '@/components/ui'
import AppHeader from '@/components/layout/AppHeader'

type FeedProfile = {
  linkId: string | null
  name: string
  title: string
  avatarImage?: string
  avatarColor?: string
}

const NEW_PROFILES: FeedProfile[] = [
  { linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', avatarImage: '/images/jimin-profile-5x4.jpg', avatarColor: '#D8C4B2' },
  { linkId: 'mk', name: '강명구', title: 'Byth CEO', avatarImage: '/images/MK_img.jpeg', avatarColor: '#D4CABF' },
  { linkId: null, name: '박서연', title: 'UX 디자이너', avatarColor: '#9BADD0' },
  { linkId: null, name: '최유진', title: 'AI 연구원', avatarColor: '#8BA89B' },
  { linkId: null, name: '한다은', title: '투자심사역', avatarColor: '#C4A8C0' },
]

const ACTIVE_PROFILES: FeedProfile[] = [
  { linkId: 'gangminjun', name: '강민준', title: 'Product Owner', avatarImage: '/images/mj1.jpg', avatarColor: '#DCC5B6' },
  { linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', avatarImage: '/images/jimin-profile-5x4.jpg', avatarColor: '#D8C4B2' },
  { linkId: null, name: '홍준표', title: 'VC 파트너', avatarColor: '#A8B8A0' },
  { linkId: null, name: '백승우', title: 'PM', avatarColor: '#C4B89A' },
]

const RECOMMENDED_PROFILES: FeedProfile[] = [
  { linkId: 'mk', name: '강명구', title: 'Byth CEO', avatarImage: '/images/MK_img.jpeg', avatarColor: '#D4CABF' },
  { linkId: 'gangminjun', name: '강민준', title: 'B2B SaaS Product Owner · 스타트업 공동창업자', avatarImage: '/images/mj1.jpg', avatarColor: '#DCC5B6' },
  { linkId: null, name: '김영선', title: 'CMO · 패션 이커머스', avatarColor: '#C4A89A' },
  { linkId: null, name: '이준혁', title: '변호사 · 스타트업 전문', avatarColor: '#9AACC4' },
]


export default function FeedScreen() {
  const router = useRouter()

  const handleProfileClick = (linkId: string | null) => {
    if (!linkId) {
      showToast('아직 준비 중인 프로필이에요')
      return
    }
    router.push(`/${linkId}`)
  }

  return (
    <ToastSingleton>
      <div className="relative mx-auto w-full max-w-[430px] min-h-dvh flex flex-col bg-[var(--color-bg-page)]">

        <AppHeader />

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-[var(--color-border-soft)]">
          <button
            onClick={() => router.push('/search')}
            className="w-full flex items-center gap-2.5 px-4 h-11 rounded-2xl bg-[var(--color-bg-soft)] text-left"
          >
            <Search size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
            <span className="text-[14px] text-[var(--color-text-tertiary)]">이름, 직함, 회사로 검색</span>
          </button>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto">

          {/* 새로 가입했어요 */}
          <section className="pt-5 pb-4">
            <h2 className="px-5 text-[15px] font-black text-[var(--color-text-strong)] mb-3">새로 가입했어요</h2>
            <div className="flex gap-4 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {NEW_PROFILES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleProfileClick(p.linkId)}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                  style={{ width: 72 }}
                >
                  <Avatar src={p.avatarImage} name={p.name} color={p.avatarColor} size={60} />
                  <div className="text-center w-full">
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">{p.title.split(' · ')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="h-px mx-5 bg-[var(--color-border-soft)]" />

          {/* 활발하게 활동 중 */}
          <section className="pt-5 pb-4">
            <h2 className="px-5 text-[15px] font-black text-[var(--color-text-strong)] mb-3">활발하게 활동 중</h2>
            <div className="flex gap-4 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {ACTIVE_PROFILES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleProfileClick(p.linkId)}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                  style={{ width: 72 }}
                >
                  <Avatar src={p.avatarImage} name={p.name} color={p.avatarColor} size={60} />
                  <div className="text-center w-full">
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">{p.title.split(' · ')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="h-px mx-5 bg-[var(--color-border-soft)]" />

          {/* 추천 프로필 */}
          <section className="pt-5 pb-8">
            <h2 className="px-5 text-[15px] font-black text-[var(--color-text-strong)] mb-1">추천 프로필</h2>
            {RECOMMENDED_PROFILES.map((p, i) => (
              <button
                key={i}
                onClick={() => handleProfileClick(p.linkId)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-bg-soft)] transition-colors text-left"
              >
                <Avatar src={p.avatarImage} name={p.name} color={p.avatarColor} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{p.title}</p>
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              </button>
            ))}
          </section>

          {/* 랜딩 페이지 링크 */}
          <div className="px-5 pb-10 pt-2 border-t border-[var(--color-border-soft)]">
            <button
              onClick={() => router.push('/landing')}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              <span>Byro 서비스 소개 보기</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </ToastSingleton>
  )
}
