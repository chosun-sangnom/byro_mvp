'use client'

import { motion, type Variants } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { AnimatedSection, SectionTitle } from '@/components/screens/profile/PublicProfileSections'

const snsListContainer: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } } }
// 온보딩 가이드 데모 전용(revealOnMount) — 카드가 먼저 드러난 뒤, 인스타그램 다음
// 링크드인이 0.5초 뒤에 올라오는 게 뚜렷이 보이도록 간격을 크게 벌림
const snsListContainerSlow: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.5, delayChildren: 0.45 } } }
const snsListItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

interface SnsItem {
  key: string
  icon: React.ReactNode
  title: string
  href: string
}

export function ProfileSnsSection({
  instagramConnected,
  linkedinConnected,
  youtubeConnected,
  tiktokConnected,
  instagram,
  linkedin,
  youtube,
  tiktok,
  revealOnMount,
  hideArrowIcon,
}: {
  instagramConnected: boolean
  linkedinConnected: boolean
  youtubeConnected?: boolean
  tiktokConnected?: boolean
  instagram: { username: string; profileUrl: string }
  linkedin: { profileUrl: string }
  youtube?: { channelName: string; channelUrl: string }
  tiktok?: { username: string; profileUrl: string }
  /** 온보딩 가이드 데모 전용 — 뷰포트 진입(whileInView) 대신 마운트 즉시, 0.5초 간격으로 재생 */
  revealOnMount?: boolean
  /** 온보딩 가이드 데모 전용 — 바로가기(외부 링크) 아이콘 숨김 */
  hideArrowIcon?: boolean
}) {
  const items: SnsItem[] = [
    instagramConnected && {
      key: 'instagram',
      icon: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/images/Instagram.svg" alt="Instagram" className="h-[18px] w-[18px]" />
      ),
      title: 'Instagram',
      href: instagram.profileUrl,
    },
    linkedinConnected && {
      key: 'linkedin',
      icon: (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/images/linkedin.png" alt="LinkedIn" className="h-[18px] w-[18px]" />
      ),
      title: 'LinkedIn',
      href: linkedin.profileUrl,
    },
    youtubeConnected && youtube && {
      key: 'youtube',
      icon: <YoutubeIcon />,
      title: 'YouTube',
      href: youtube.channelUrl,
    },
    tiktokConnected && tiktok && {
      key: 'tiktok',
      icon: <TiktokIcon />,
      title: 'TikTok',
      href: tiktok.profileUrl,
    },
  ].filter(Boolean) as SnsItem[]

  if (items.length === 0) return null

  return (
    <AnimatedSection className="px-5 pt-6 pb-2" revealOnMount={revealOnMount}>
      <SectionTitle title="SNS" />
      <motion.div
        className="divide-y divide-[var(--color-border-soft)]"
        variants={revealOnMount ? snsListContainerSlow : snsListContainer}
        initial="hidden"
        {...(revealOnMount ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '-40px' } })}
      >
        {items.map((item) => (
          <motion.a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 py-3.5"
            variants={snsListItem}
          >
            <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">
              {item.icon}
            </span>
            <p className="flex-1 text-[14px] font-semibold text-[var(--color-text-primary)]">{item.title}</p>
            {!hideArrowIcon && (
              <ArrowUpRight size={15} className="flex-shrink-0 text-[var(--color-text-tertiary)] opacity-40" />
            )}
          </motion.a>
        ))}
      </motion.div>
    </AnimatedSection>
  )
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} xmlns="http://www.w3.org/2000/svg">
      <rect width="18" height="18" rx="4" fill="#FF0000" />
      <polygon points="7,5.5 7,12.5 13,9" fill="white" />
    </svg>
  )
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} xmlns="http://www.w3.org/2000/svg">
      <rect width="18" height="18" rx="4" fill="#111111" />
      <text x="9" y="13" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white" fontFamily="sans-serif">TT</text>
    </svg>
  )
}
