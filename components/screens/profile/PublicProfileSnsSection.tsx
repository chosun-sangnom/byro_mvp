'use client'

import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Play } from 'lucide-react'
import { AnimatedSection, SectionTitle } from '@/components/screens/profile/PublicProfileSections'

type InstagramSectionData = {
  username: string
  profileUrl: string
  aiSummary: string
  posts: Array<{
    id: string
    imageUrl: string
    caption: string
  }>
}

type LinkedInSectionData = {
  profileUrl: string
  aiSummary: string
  previewImage: string
}

export function ProfileSnsSection({
  instagramConnected,
  linkedinConnected,
  instagram,
  linkedin,
  igOpen,
  liOpen,
  onToggleInstagram,
  onToggleLinkedIn,
}: {
  instagramConnected: boolean
  linkedinConnected: boolean
  instagram: InstagramSectionData
  linkedin: LinkedInSectionData
  igOpen: boolean
  liOpen: boolean
  onToggleInstagram: () => void
  onToggleLinkedIn: () => void
}) {
  return (
    <AnimatedSection className="px-5 pt-6 pb-2">
      <SectionTitle title="SNS" />
      <div className="divide-y divide-[var(--color-border-soft)]">
        <StaticSnsRow
          icon={<Play size={15} color="#FF0000" />}
          title="YouTube"
          subtitle="연결 정보 준비 중"
        />
        <StaticSnsRow
          icon={<span className="text-[13px] font-black text-black">T</span>}
          title="TikTok"
          subtitle="연결 정보 준비 중"
        />
        {instagramConnected ? (
          <div>
            <button onClick={onToggleInstagram} className="flex w-full items-center gap-3.5 py-3.5 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/Instagram.svg" alt="Instagram" className="h-[18px] w-[18px] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">Instagram</div>
                <a
                  href={instagram.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="mt-0.5 block text-[12px] text-[var(--color-accent-dark)] underline-offset-2 hover:underline"
                >
                  @{instagram.username}
                </a>
              </div>
              {igOpen ? <ChevronUp size={14} color="var(--color-text-tertiary)" /> : <ChevronDown size={14} color="var(--color-text-tertiary)" />}
            </button>
            <AnimatePresence initial={false}>
              {igOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pl-8">
                    <p className="mb-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{instagram.aiSummary}</p>
                    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-0.5">
                      {instagram.posts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => window.open(instagram.profileUrl, '_blank')}
                          className="h-[84px] w-[84px] flex-shrink-0 overflow-hidden rounded-[10px] bg-[var(--color-bg-soft)]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.imageUrl} alt={post.caption} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <StaticSnsRow
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/Instagram.svg" alt="Instagram" className="h-[18px] w-[18px]" />
            }
            title="Instagram"
            subtitle="연결된 계정이 없습니다"
          />
        )}
        {linkedinConnected ? (
          <div>
            <button onClick={onToggleLinkedIn} className="flex w-full items-center gap-3.5 py-3.5 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/linkedin.png" alt="LinkedIn" className="h-[18px] w-[18px] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">LinkedIn</div>
                <a
                  href={linkedin.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="mt-0.5 block truncate text-[12px] text-[var(--color-accent-dark)] underline-offset-2 hover:underline"
                >
                  {linkedin.profileUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
              {liOpen ? <ChevronUp size={14} color="var(--color-text-tertiary)" /> : <ChevronDown size={14} color="var(--color-text-tertiary)" />}
            </button>
            <AnimatePresence initial={false}>
              {liOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pl-8">
                    <p className="mb-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{linkedin.aiSummary}</p>
                    <div className="overflow-hidden rounded-[10px] border border-[var(--color-border-soft)]">
                      <div className="relative max-h-48 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={linkedin.previewImage} alt="LinkedIn 최근 게시물" className="w-full" />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-bg-page)] to-transparent" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <StaticSnsRow
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/linkedin.png" alt="LinkedIn" className="h-[18px] w-[18px]" />
            }
            title="LinkedIn"
            subtitle="연결된 계정이 없습니다"
          />
        )}
      </div>
    </AnimatedSection>
  )
}

function StaticSnsRow({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3.5 py-3.5">
      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">{title}</div>
        <div className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">{subtitle}</div>
      </div>
    </div>
  )
}
