'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Lock, MessageCircle, Share2, Sparkles, Star, Users, Handshake } from 'lucide-react'
import { BottomSheet, showToast } from '@/components/ui'
import { useByroStore } from '@/store/useByroStore'
import type { KemiData, PublicProfileLife, PublicProfileWhoIAm } from '@/types'
import {
  getLifestyleSignals,
  getMbtiTraits,
  getTasteHook,
} from '@/components/screens/profile/profileAnalysis'

// [임시] MBTI + 라이프 데이터 기반 목업 분석. 실제 구현 시 서버사이드 LLM 호출로 교체
type CompatibilityReport = {
  summary: string
  opener: string
  chemistry: string
  fit: string
  caution: string
}

function buildCompatibilityReport(
  profileName: string,
  whoIAm: PublicProfileWhoIAm,
  life: PublicProfileLife | undefined,
): CompatibilityReport {
  const { extrovert, intuitive, thinking, judging } = getMbtiTraits(whoIAm.mbti)
  const { neighborhood, exercise } = getLifestyleSignals(life)
  const tasteHook = getTasteHook(life)

  const topicStyle = intuitive ? '맥락과 방향을 함께 이야기할 수 있는' : '생활 루틴과 현실 감각이 자연스럽게 맞는'
  const decisionStyle = thinking ? '기준과 판단이 분명한' : '감정 표현과 배려가 자연스러운'
  const paceStyle = extrovert ? '초반부터 대화가 자연스럽게 열리는' : '과한 텐션 없이 천천히 가까워지는'

  return {
    summary: `${profileName}님은 ${topicStyle} 대화를 좋아하고, ${decisionStyle} 상대와 관계가 오래 남는 편이에요.${neighborhood ? ` ${neighborhood}를 중심으로 움직이며` : ''} ${tasteHook ? `${tasteHook} 같은 취향 접점이 하나만 보여도 대화가 잘 이어집니다.` : '공통 취향이 보이면 빠르게 가까워지는 편입니다.'}`,
    opener: neighborhood && tasteHook
      ? `${neighborhood}나 ${tasteHook}처럼 실제 생활 반경과 맞닿아 있는 소재로 먼저 말을 꺼내면 반응이 좋습니다.`
      : extrovert
        ? '공통점 하나를 바로 꺼내서 분위기를 여는 방식이 잘 먹힙니다.'
        : '가벼운 공통점 뒤에 바로 취향이나 가치관 질문으로 넘어가면 반응이 좋습니다.',
    chemistry: `${neighborhood ? `${neighborhood}` : '생활 반경'}과 ${exercise ? `${exercise}` : '일상 리듬'}이 겹치는 사람과 자연스럽게 연결돼요. ${tasteHook ? `${tasteHook} 같은 취향 접점이 다음 만남으로 이어지기 좋습니다.` : '공통으로 즐길 수 있는 활동이나 장소가 보이면 관계가 더 빠르게 가까워져요.'}`,
    fit: `${topicStyle} 사람이 잘 맞아요. ${decisionStyle} 태도를 가진 상대일수록 편하고, ${tasteHook ? `${tasteHook} 같은 취향이 겹치면` : '공통 취향이 하나만 보여도'} 관계가 빨리 붙습니다. ${judging ? '약속과 계획이 분명한 사람과 함께할 때 신뢰가 쌓여요.' : '유연하게 흐름을 타는 사람과 편하게 어울려요.'}`,
    caution: `${paceStyle} 관계가 장기적으로 이어지는 경향이 있어요. ${extrovert ? '반응이 너무 느리거나 리듬이 자주 끊기면 흥미가 빨리 꺼질 수 있어요.' : '처음부터 너무 가까워지려 하면 오히려 거리감이 남을 수 있어요.'} ${thinking ? '감정 신호가 없는 관계보다 솔직하게 표현하는 사람과 더 잘 맞아요.' : '일방적인 논리나 비교 위주의 대화는 피로하게 읽혀요.'}`,
  }
}

function LockedBlockOverlay({ missingTasteCount }: { missingTasteCount: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[22px] backdrop-blur-[2px]">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: 'var(--color-bg-muted)', border: '1px solid var(--color-border-default)' }}
      >
        <Lock size={14} style={{ color: 'var(--color-text-tertiary)' }} />
      </div>
      <p className="text-center text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
        취향 {missingTasteCount}개 더 채우면 열려요
      </p>
    </div>
  )
}

const BLOCK_META = [
  { index: 1, label: '공통점', Icon: Sparkles },
  { index: 2, label: '대화스타터', Icon: MessageCircle },
  { index: 3, label: '관계흐름', Icon: Users },
  { index: 4, label: '협업결', Icon: Handshake },
  { index: 5, label: '연결가치', Icon: Star },
]

// ── 폴라로이드 카드 (인라인 표시 + html2canvas 캡처용) ─────────────────────────

function AvatarCircle({
  src,
  name,
  size,
  fontSize,
}: {
  src?: string
  name: string
  size: number
  fontSize: number
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '3px solid #FFFFFF',
          boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #BFDBFE, #2563EB)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '3px solid #FFFFFF',
      boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
        {name.charAt(0)}
      </span>
    </div>
  )
}

// [임시] 폴라로이드 카드 — html2canvas 캡처용. CSS 변수 미사용(캡처 시 미지원)
function PolaroidCard({
  cardRef,
  viewerName,
  viewerAvatar,
  profileName,
  profileAvatar,
  chemistryScore,
  matchItems,
}: {
  cardRef: React.RefObject<HTMLDivElement>
  viewerName: string
  viewerAvatar?: string
  profileName: string
  profileAvatar?: string
  chemistryScore: number
  matchItems: { label: string; category: string }[]
}) {
  const filledDots = Math.round(chemistryScore / 10)

  return (
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '320px',
        background: '#FFFFFF',
        borderRadius: '18px',
        paddingBottom: '32px',
        fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* 상단 그라디언트 배너 */}
      <div style={{
        background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
        padding: '24px 24px 28px',
      }}>
        {/* 브랜딩 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
          <div style={{
            width: '20px', height: '20px',
            background: 'rgba(255,255,255,0.25)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: 900, lineHeight: 1 }}>B</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.06em' }}>byro</span>
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Kemi Report</span>
        </div>

        {/* 양쪽 아바타 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0px' }}>
          <AvatarCircle src={viewerAvatar} name={viewerName} size={72} fontSize={26} />
          {/* 스파크 배지 */}
          <div style={{
            width: '32px', height: '32px',
            background: '#FFFFFF',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 -8px',
            zIndex: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '14px', lineHeight: 1 }}>✦</span>
          </div>
          <AvatarCircle src={profileAvatar} name={profileName} size={72} fontSize={26} />
        </div>

        {/* 이름 */}
        <p style={{
          marginTop: '14px',
          textAlign: 'center',
          fontSize: '15px',
          fontWeight: 800,
          color: '#FFFFFF',
          lineHeight: 1.3,
        }}>
          {viewerName} × {profileName}
        </p>
      </div>

      {/* 하단 흰색 영역 */}
      <div style={{ padding: '20px 22px 0' }}>
        {/* 케미 점수 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#636366', letterSpacing: '0.06em', textTransform: 'uppercase' }}>케미 점수</span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#2563EB' }}>{chemistryScore}%</span>
          </div>
          {/* 도트 바 */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: '6px', borderRadius: '3px',
                  background: i < filledDots
                    ? `linear-gradient(90deg, #2563EB ${(i / 10) * 100}%, #7C3AED 100%)`
                    : '#E5E7EB',
                }}
              />
            ))}
          </div>
        </div>

        {/* 공통점 태그 */}
        {matchItems.length > 0 && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#636366', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
              공통점
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {matchItems.slice(0, 6).map((item) => (
                <span key={item.label} style={{
                  background: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid rgba(37,99,235,0.18)',
                  borderRadius: '9999px',
                  padding: '4px 11px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  {item.label}
                </span>
              ))}
              {matchItems.length > 6 && (
                <span style={{
                  background: '#F3F4F6',
                  color: '#6B7280',
                  borderRadius: '9999px',
                  padding: '4px 11px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  +{matchItems.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 구분선 + 하단 CTA */}
        <div style={{
          marginTop: '18px',
          paddingTop: '14px',
          borderTop: '1px solid #F0F0F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '11px', color: '#98989D' }}>byro.app에서 나도 확인하기</span>
          <div style={{ background: '#EFF6FF', borderRadius: '8px', padding: '4px 10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB' }}>→</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 화면에 보이는 폴라로이드 미리보기 카드 ────────────────────────────────────

function PolaroidPreviewCard({
  viewerName,
  viewerAvatar,
  profileName,
  profileAvatar,
  chemistryScore,
  matchItems,
}: {
  viewerName: string
  viewerAvatar?: string
  profileName: string
  profileAvatar?: string
  chemistryScore: number
  matchItems: { label: string; category: string }[]
}) {
  const filledDots = Math.round(chemistryScore / 10)

  return (
    <div
      className="overflow-hidden rounded-[18px]"
      style={{ border: '1px solid var(--color-border-default)', background: 'var(--color-bg-surface)', boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}
    >
      {/* 그라디언트 배너 */}
      <div style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)', padding: '20px 20px 24px' }}>
        {/* 브랜딩 */}
        <div className="mb-4 flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-white/25">
            <span className="text-[10px] font-black leading-none text-white">B</span>
          </div>
          <span className="text-[12px] font-bold tracking-[0.06em] text-white/90">byro</span>
          <span className="ml-auto text-[10px] uppercase tracking-[0.08em] text-white/50">Kemi Report</span>
        </div>

        {/* 양쪽 아바타 */}
        <div className="flex items-center justify-center">
          {/* 내 아바타 */}
          <div className="relative">
            {viewerAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viewerAvatar} alt={viewerName} className="h-[68px] w-[68px] rounded-full object-cover" style={{ border: '3px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.14)' }} />
            ) : (
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full text-[24px] font-black text-white" style={{ background: 'linear-gradient(135deg, #93C5FD, #1D4ED8)', border: '3px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.14)' }}>
                {viewerName.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>나</div>
          </div>

          {/* 중앙 스파크 */}
          <div className="z-10 mx-[-6px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[14px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            ✦
          </div>

          {/* 상대 아바타 */}
          <div className="relative">
            {profileAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileAvatar} alt={profileName} className="h-[68px] w-[68px] rounded-full object-cover" style={{ border: '3px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.14)' }} />
            ) : (
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full text-[24px] font-black text-white" style={{ background: 'linear-gradient(135deg, #C4B5FD, #7C3AED)', border: '3px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.14)' }}>
                {profileName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* 이름 */}
        <p className="mt-3 text-center text-[14px] font-black text-white">
          {viewerName} × {profileName}
        </p>
      </div>

      {/* 하단 흰색 영역 */}
      <div className="px-5 py-4">
        {/* 케미 점수 */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--color-text-tertiary)' }}>케미 점수</span>
            <span className="text-[18px] font-black" style={{ color: 'var(--color-accent-dark)' }}>{chemistryScore}%</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all"
                style={{
                  background: i < filledDots
                    ? 'linear-gradient(90deg, #2563EB, #7C3AED)'
                    : 'var(--color-border-default)',
                }}
              />
            ))}
          </div>
        </div>

        {/* 공통점 태그 */}
        {matchItems.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--color-text-tertiary)' }}>공통점</p>
            <div className="flex flex-wrap gap-1.5">
              {matchItems.slice(0, 6).map((item) => (
                <span key={item.label} className="chip-metric">{item.label}</span>
              ))}
              {matchItems.length > 6 && (
                <span className="chip-metric">+{matchItems.length - 6}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export function PublicProfileCompatibilitySheet({
  open,
  onClose,
  profileName,
  profileAvatar,
  whoIAm,
  life,
  kemi,
}: {
  open: boolean
  onClose: () => void
  profileName: string
  profileAvatar?: string
  whoIAm: PublicProfileWhoIAm
  life?: PublicProfileLife
  kemi?: KemiData
}) {
  const store = useByroStore()
  const viewerName = store.user?.name ?? '나'
  const viewerAvatar = store.user?.profileImages?.[0] ?? store.user?.avatarImage

  const polaroidRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)
  const [cardGenerating, setCardGenerating] = useState(false)
  const [cardGenerated, setCardGenerated] = useState(false)

  useEffect(() => {
    if (!open) {
      setCardGenerating(false)
      setCardGenerated(false)
    }
  }, [open])

  const handleGenerateCard = () => {
    setCardGenerating(true)
    setTimeout(() => {
      setCardGenerating(false)
      setCardGenerated(true)
    }, 1600)
  }

  const report = buildCompatibilityReport(profileName, whoIAm, life)
  const lockedBlocks = kemi?.lockedBlocks ?? []
  const completenessPercent = kemi?.completenessPercent ?? 100
  const missingTasteCount = kemi?.missingTasteCount ?? 0
  const matchItems = kemi?.matchItems ?? []

  // 케미 점수: matchItems 수 기반 목업 계산
  const chemistryScore = Math.min(52 + matchItems.length * 7 + Math.round(completenessPercent / 8), 98)

  // [임시] 폴라로이드 이미지 캡처 후 공유 (html2canvas + Web Share API)
  const handleShare = async () => {
    if (!polaroidRef.current || sharing) return
    setSharing(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(polaroidRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        useCORS: true,
        logging: false,
      })
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { reject(new Error('캡처 실패')); return }
          const file = new File([blob], `byro-kemi-${profileName}.png`, { type: 'image/png' })
          try {
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `${profileName}님과의 케미 리포트`,
                text: `byro에서 ${profileName}님과의 공통점을 발견했어요!`,
              })
            } else {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `byro-kemi-${profileName}.png`
              a.click()
              URL.revokeObjectURL(url)
              showToast('이미지가 저장됐어요')
            }
            resolve()
          } catch {
            resolve()
          }
        }, 'image/png')
      })
    } catch {
      showToast('공유에 실패했어요')
    } finally {
      setSharing(false)
    }
  }

  const blocks = [
    {
      index: 1,
      content: (
        <>
          {/* 요약 텍스트 */}
          <p className="mb-3 text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
            {report.summary}
          </p>

          {/* 공통점 태그 */}
          {matchItems.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {matchItems.map((item) => (
                <span key={item.label} className="chip-metric">{item.label}</span>
              ))}
            </div>
          )}

          {/* 케미카드 만들기 버튼 */}
          {!cardGenerated && !cardGenerating && (
            <button
              type="button"
              onClick={handleGenerateCard}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] py-3 text-[13px] font-bold transition-opacity active:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
                color: '#fff',
              }}
            >
              <Sparkles size={14} />
              케미카드 만들기
            </button>
          )}

          {/* 생성 중 */}
          {cardGenerating && (
            <div
              className="flex w-full items-center justify-center gap-2.5 rounded-[14px] py-3"
              style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}
            >
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--color-accent-dark)] border-t-transparent" />
              <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>케미카드 생성 중…</span>
            </div>
          )}

          {/* 생성된 카드 */}
          {cardGenerated && (
            <>
              <PolaroidPreviewCard
                viewerName={viewerName}
                viewerAvatar={viewerAvatar}
                profileName={profileName}
                profileAvatar={profileAvatar}
                chemistryScore={chemistryScore}
                matchItems={matchItems}
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
                  style={{
                    background: 'var(--color-accent-bg-subtle)',
                    border: '1px solid var(--color-accent-border-soft)',
                    color: 'var(--color-accent-dark)',
                  }}
                >
                  <Download size={13} />
                  {sharing ? '저장 중…' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] py-2.5 text-[13px] font-semibold text-white transition-opacity active:opacity-70 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)' }}
                >
                  <Share2 size={13} />
                  {sharing ? '공유 중…' : '공유'}
                </button>
              </div>
            </>
          )}
        </>
      ),
    },
    {
      index: 2,
      content: (
        <p className="text-[14px] font-semibold leading-[1.6]" style={{ color: 'var(--color-text-primary)' }}>
          {report.opener}
        </p>
      ),
    },
    {
      index: 3,
      content: (
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
          {report.chemistry}
        </p>
      ),
    },
    {
      index: 4,
      content: (
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
          {report.fit}
        </p>
      ),
    },
    {
      index: 5,
      content: (
        <p className="text-[13px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
          {report.caution}
        </p>
      ),
    },
  ]

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">

        {/* 헤더 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
            <Sparkles size={14} />
            <span>Compatibility Report</span>
          </div>
          <h3 className="mt-2 text-[24px] font-black leading-[1.2]" style={{ color: 'var(--color-text-primary)' }}>
            케미 리포트
          </h3>
        </div>

        {/* 정확도 프로그레스바 */}
        <div className="mb-5 rounded-[16px] px-4 py-3" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              케미 분석됨
            </span>
            <span className="text-[13px] font-black" style={{ color: 'var(--color-accent-dark)' }}>
              {completenessPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-border-default)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completenessPercent}%`,
                background: 'linear-gradient(90deg, var(--color-accent-light), var(--color-accent-dark))',
              }}
            />
          </div>
          {lockedBlocks.length > 0 && (
            <p className="mt-2 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
              취향 {missingTasteCount}개를 더 채우면 전체 리포트가 열려요
            </p>
          )}
        </div>

        {/* 5개 블록 */}
        <div className="space-y-3">
          {blocks.map(({ index, content }) => {
            const meta = BLOCK_META[index - 1]
            const isLocked = lockedBlocks.includes(index)
            const Icon = meta.Icon

            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-[22px] px-4 py-4"
                style={{ border: '1px solid var(--color-border-default)', background: 'var(--color-bg-surface)' }}
              >
                <div
                  className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <Icon size={12} />
                  <span>{meta.label}</span>
                </div>
                <div style={isLocked ? { filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' } : {}}>
                  {content}
                </div>
                {isLocked && <LockedBlockOverlay missingTasteCount={missingTasteCount} />}
              </div>
            )
          })}
        </div>

        {/* [임시] 폴라로이드 캡처용 오프스크린 카드 */}
        <PolaroidCard
          cardRef={polaroidRef}
          viewerName={viewerName}
          viewerAvatar={viewerAvatar}
          profileName={profileName}
          profileAvatar={profileAvatar}
          chemistryScore={chemistryScore}
          matchItems={matchItems}
        />
      </div>
    </BottomSheet>
  )
}
