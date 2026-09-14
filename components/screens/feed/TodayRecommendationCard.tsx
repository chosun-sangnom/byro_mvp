'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Briefcase, Flame, RefreshCw, Sparkles, ThumbsUp } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useFeloreStore } from '@/store/useFeloreStore'
import {
  buildReasonPayload,
  DAILY_SKIP_LIMIT,
  hasMatchableInfo,
  rankRecommendations,
  readCachedReason,
  todayKst,
  writeCachedReason,
  resolveTodayRecommendation,
  skipTodayRecommendation,
  type RecommendationSignal,
  type TodayRecommendation,
} from '@/lib/homeRecommendation'
import { VerifiedBadge } from '@/components/screens/FeedScreen'

const CHIP_ICON: Record<RecommendationSignal, typeof BookOpen> = {
  school: BookOpen,
  work: Briefcase,
  vibe: Sparkles,
  active: Flame,
}

/**
 * SCRUM-125 — 홈 "오늘의 추천" 1명 + 추천 사유(한 문장 + 신호 칩).
 * 매칭(학교·업계/직무·바이브)이 없거나 내 정보가 없으면 가장 활발히 활동 중인 사람으로 대체.
 */
export function TodayRecommendationCard({ onPicked }: { onPicked?: (linkId: string | null) => void }) {
  const router = useRouter()
  const { isLoggedIn, user } = useAuth()
  const highlights = useFeloreStore((s) => s.highlights)
  const [state, setState] = useState<{ recommendation: TodayRecommendation | null; skipsLeft: number } | null>(null)
  const viewerKey = isLoggedIn && user ? user.linkId : 'guest'
  const [reason, setReason] = useState<{ cacheId: string; text: string | null }>({ cacheId: '', text: null })

  const refresh = () => {
    const ranked = rankRecommendations(isLoggedIn && user ? { ...user, highlights } : null)
    const next = resolveTodayRecommendation(viewerKey, ranked)
    setState(next)
    onPicked?.(next.recommendation?.profile.linkId ?? null)
  }

  // 로그인 상태·내 정보가 바뀌면 다시 계산 (하루 고정 픽은 localStorage가 유지)
  useEffect(refresh, [viewerKey, user?.school, user?.title, user?.life, highlights]) // eslint-disable-line react-hooks/exhaustive-deps

  // 추천이 정해지면 AI 추천 근거를 붙인다 (하루·추천 단위 캐시)
  useEffect(() => {
    const current = state?.recommendation
    if (!current) return
    // 같은 사람이라도 근거(매칭 신호/활동량 대체)가 바뀌면 다시 생성
    const signature = current.isFallback ? 'active' : current.chips.map((c) => `${c.signal}:${c.label}`).join(',')
    const cacheId = `${todayKst()}:${viewerKey}:${current.profile.linkId}:${signature}`
    const cached = readCachedReason(cacheId)
    if (cached) {
      setReason({ cacheId, text: cached })
      return
    }
    setReason({ cacheId, text: null })
    let cancelled = false
    fetch('/api/ai-recommend-reason', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildReasonPayload(current, isLoggedIn && user ? { ...user, highlights } : null)),
    })
      .then((res) => res.json())
      .then((data: { explanation?: string }) => {
        if (cancelled || !data.explanation) return
        writeCachedReason(cacheId, data.explanation)
        setReason({ cacheId, text: data.explanation })
      })
      .catch(() => {
        // 실패 시 근거 블록만 숨긴다
        if (!cancelled) setReason({ cacheId, text: '' })
      })
    return () => {
      cancelled = true
    }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) return null
  const rec = state.recommendation
  const viewerMissingInfo = Boolean(isLoggedIn && user && !hasMatchableInfo({ ...user, highlights }))
  const profile = rec?.profile

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ThumbsUp size={18} className="text-[#6155F5]" />
          <h2 className="text-[17px] font-black tracking-[-0.03em] text-[#6155F5]">오늘의 추천</h2>
        </div>
        <button
          type="button"
          onClick={() => router.push('/recommended')}
          className="text-[12px] font-medium text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
        >
          더보기
        </button>
      </div>

      {!rec || !profile ? (
        <p className="text-[13px] text-[var(--color-text-secondary)]">오늘은 추천할 분이 없어요. 내일 다시 확인해보세요.</p>
      ) : (
        <div className="surface-card flex flex-col gap-4 rounded-[22px] px-4 py-4">
          <button
            type="button"
            onClick={() => router.push(`/${profile.linkId}`)}
            className="flex items-center gap-3 text-left"
          >
            <Avatar
              src={profile.avatarImage ?? profile.profileImages?.[0]}
              name={profile.name}
              color={profile.avatarColor}
              size={64}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[16px] font-bold text-[var(--color-text-primary)]">{profile.name}</p>
                {profile.isVerified && <VerifiedBadge />}
              </div>
              <p className="line-clamp-2 text-[12px] leading-[1.5] text-[var(--color-text-secondary)]">{profile.title}</p>
            </div>
          </button>

          <div className="flex flex-col gap-2.5">
            <p className="break-keep text-[15px] font-bold leading-[1.45] text-[#0D0D0D]">{rec.sentence}</p>
            {rec.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {rec.chips.map((chip) => {
                  const Icon = CHIP_ICON[chip.signal]
                  return (
                    <span
                      key={`${chip.signal}-${chip.label}`}
                      className="flex items-center gap-1 rounded-full bg-[#F4F2FE] px-2.5 py-1 text-[12px] font-semibold text-[#6155F5]"
                    >
                      <Icon size={12} />
                      {chip.label}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {reason.text !== '' && (
            <div className="rounded-[14px] bg-[#F7F6FE] px-3.5 py-3">
              <p className="flex items-center gap-1 text-[11px] font-bold text-[#6155F5]">
                <Sparkles size={11} />
                AI 추천 근거
              </p>
              {reason.text ? (
                <p className="mt-1.5 break-keep text-[13px] leading-[1.6] text-[#25313D]">{reason.text}</p>
              ) : (
                <div className="mt-2 space-y-1.5" aria-label="추천 근거를 분석하는 중">
                  <div className="h-3 w-full animate-pulse rounded-full bg-[#E9E6FB]" />
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-[#E9E6FB]" />
                </div>
              )}
            </div>
          )}

          {viewerMissingInfo && (
            <button
              type="button"
              onClick={() => router.push('/me?edit=true')}
              className="break-keep rounded-[12px] bg-[#F5F6F7] px-3 py-2.5 text-left text-[12px] font-medium leading-[1.5] text-[#475058]"
            >
              학교·직무·바이브를 채우면 나와 통하는 사람을 찾아드려요 <span className="whitespace-nowrap font-bold text-[#0D0D0D]">채우러 가기</span>
            </button>
          )}

          <div className="flex flex-col items-center gap-2">
            <Button onClick={() => router.push(`/${profile.linkId}`)}>프로필 보기</Button>
            {isLoggedIn && (
              state.skipsLeft > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    skipTodayRecommendation(viewerKey, profile.linkId)
                    refresh()
                  }}
                  className="flex items-center gap-1 py-1 text-[13px] font-semibold text-[#6C7786]"
                >
                  <RefreshCw size={13} />
                  다른 추천 보기
                  <span className="font-medium text-[#A8B1BD]">
                    {state.skipsLeft}/{DAILY_SKIP_LIMIT}
                  </span>
                </button>
              ) : (
                <p className="py-1 text-[12px] text-[#A8B1BD]">내일 새로운 추천을 드릴게요</p>
              )
            )}
          </div>
        </div>
      )}
    </section>
  )
}
