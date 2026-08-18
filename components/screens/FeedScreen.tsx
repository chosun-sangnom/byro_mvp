'use client'

import { useRouter } from 'next/navigation'
import { BadgeCheck, ChevronRight, Flame, PartyPopper, ThumbsUp } from 'lucide-react'
import { Avatar, showToast } from '@/components/ui'

type FeedProfile = {
  linkId: string | null
  name: string
  title: string
  avatarImage?: string
  fallbackColor?: string
}

const FALLBACK_TEXT_COLOR = '#6C7786'

const NEW_PROFILES: FeedProfile[] = [
  { linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', avatarImage: '/images/jimin-profile-5x4.jpg' },
  { linkId: 'mk', name: '강명구', title: 'Byth CEO', avatarImage: '/images/MK_img.jpeg' },
  { linkId: null, name: '박서연', title: 'UX 디자이너', fallbackColor: '#F0F5FF' },
  { linkId: null, name: '최유진', title: 'AI 연구원', fallbackColor: '#F4F2FE' },
  { linkId: null, name: '한다은', title: '투자심사역', fallbackColor: '#EFF9FF' },
]

const ACTIVE_PROFILES: FeedProfile[] = [
  { linkId: 'gangminjun', name: '강민준', title: 'Product Owner', avatarImage: '/images/mj1.jpg' },
  { linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', avatarImage: '/images/jimin-profile-5x4.jpg' },
  { linkId: null, name: '백승우', title: 'PM', fallbackColor: '#FEF3EA' },
]

const RECOMMENDED_PROFILES: FeedProfile[] = [
  { linkId: 'mk', name: '강명구', title: 'Byth CEO', avatarImage: '/images/MK_img.jpeg' },
  { linkId: 'gangminjun', name: '강민준', title: 'B2B SaaS Product Owner · 스타트업 공동창업자', avatarImage: '/images/mj1.jpg' },
  { linkId: null, name: '김영선', title: 'CMO · 패션 이커머스', fallbackColor: '#F0F5FF' },
  { linkId: null, name: '이준혁', title: '변호사 · 스타트업 전문', fallbackColor: '#F4F2FE' },
]

function VerifiedBadge() {
  return <BadgeCheck size={12} className="shrink-0 fill-[#3B82F6] text-white" strokeWidth={2.5} />
}

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
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-10 px-4 pt-6 pb-2">

        {/* 새로 가입했어요 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            <PartyPopper size={18} className="text-[#0088FF]" />
            <h2 className="text-[17px] font-black tracking-[-0.03em] text-[#0088FF]">새로 가입했어요</h2>
          </div>
          <div className="flex gap-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {NEW_PROFILES.map((p, i) => (
              <button
                key={i}
                onClick={() => handleProfileClick(p.linkId)}
                className="flex-shrink-0 flex flex-col items-center gap-2.5"
                style={{ width: 74 }}
              >
                <Avatar src={p.avatarImage} name={p.name} color={p.fallbackColor} textColor={FALLBACK_TEXT_COLOR} size={56} />
                <div className="text-center w-full">
                  <div className="flex items-center justify-center gap-0.5">
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] whitespace-nowrap">{p.name}</p>
                    {p.avatarImage && <VerifiedBadge />}
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)] whitespace-nowrap">{p.title}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 활발하게 활동중 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            <Flame size={18} className="text-[#FF523E]" />
            <h2 className="text-[17px] font-black tracking-[-0.03em] text-[#FF523E]">활발하게 활동중</h2>
          </div>
          <div className="flex gap-2">
            {ACTIVE_PROFILES.map((p, i) => (
              <button
                key={i}
                onClick={() => handleProfileClick(p.linkId)}
                className="flex-1 min-w-0 flex flex-col items-start gap-2 text-left"
              >
                {p.avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatarImage}
                    alt={p.name}
                    className="w-full aspect-[3/4] rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className="w-full aspect-[3/4] rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: p.fallbackColor }}
                  >
                    <span className="text-[16px] font-semibold" style={{ color: FALLBACK_TEXT_COLOR }}>{p.name}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-0.5">
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    {p.avatarImage && <VerifiedBadge />}
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{p.title}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 추천 프로필 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            <ThumbsUp size={18} className="text-[#6155F5]" />
            <h2 className="text-[17px] font-black tracking-[-0.03em] text-[#6155F5]">추천 프로필</h2>
          </div>
          <div className="flex flex-col gap-5">
            {RECOMMENDED_PROFILES.map((p, i) => (
              <button
                key={i}
                onClick={() => handleProfileClick(p.linkId)}
                className="w-full flex items-center gap-2.5 text-left"
              >
                <Avatar src={p.avatarImage} name={p.name} color={p.fallbackColor} textColor={FALLBACK_TEXT_COLOR} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-0.5">
                    <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    {p.avatarImage && <VerifiedBadge />}
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{p.title}</p>
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>

      </div>

      {/* 랜딩 페이지 링크 */}
      <div className="px-4 pb-10 pt-2 border-t border-[var(--color-border-soft)]">
        <button
          onClick={() => router.push('/landing')}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <span>FELORE 서비스 소개 보기</span>
          <ChevronRight size={14} />
        </button>
      </div>

    </div>
  )
}
