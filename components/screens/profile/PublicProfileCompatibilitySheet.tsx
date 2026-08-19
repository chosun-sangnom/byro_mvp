'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Download, Share2, Sparkles } from 'lucide-react'
import { BottomSheet, showToast } from '@/components/ui'
import { useFeloreStore } from '@/store/useFeloreStore'
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

function LockedBlockOverlay({ missingItems }: { missingItems: string[] }) {
  const hint = missingItems.length > 0
    ? missingItems.join(' · ') + ' 채우면 열려요'
    : '프로필을 더 채우면 열려요'

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/kemi/locked-alert.svg" alt="" className="size-9" />
      <p className="text-center text-[14px] font-semibold leading-[1.35]" style={{ color: '#0D0D0D' }}>
        {hint}
      </p>
    </div>
  )
}

const BLOCK_META = [
  { index: 1, label: '공통점' },
  { index: 2, label: '대화 스타터' },
  { index: 3, label: '관계 흐름' },
  { index: 4, label: '협업방향' },
  { index: 5, label: '연결 가치' },
]

// ── 케미 리포트 카드 (인라인 표시 + html2canvas 캡처용) ─────────────────────────

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
          border: '0.66px solid rgba(255,255,255,0.85)',
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
      border: '0.66px solid rgba(255,255,255,0.85)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
        {name.charAt(0)}
      </span>
    </div>
  )
}

// [임시] 리포트 카드 — html2canvas 캡처용. CSS 변수·blend-mode 미사용(캡처 시 미지원)
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
  return (
    <div
      ref={cardRef}
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '328px',
        background: '#FFFFFF',
        borderRadius: '12px',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* 상단 그라디언트 배너 */}
      <div style={{
        position: 'relative',
        background: 'radial-gradient(circle at 28% 8%, #73B9FF 0%, #57ABFF 22%, #3A9DFF 38%, #1D8EFF 52%, #0E87FF 62%, #0080FF 72%, #0657FF 100%)',
        padding: '24px',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0,
          background: '#FFFFFF', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px',
          padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '2px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#25313D' }}>Kemi Report</span>
        </div>

        {/* 양쪽 아바타 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <AvatarCircle src={viewerAvatar} name={viewerName} size={64} fontSize={22} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{viewerName}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <AvatarCircle src={profileAvatar} name={profileName} size={64} fontSize={22} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{profileName}</span>
          </div>
        </div>
      </div>

      {/* 하단 흰색 영역 */}
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 케미 점수 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6C7786' }}>케미 점수</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0D0D0D' }}>{chemistryScore}%</span>
          </div>
          <div style={{ height: '4px', borderRadius: '100px', background: '#DEE4EC', width: '100%' }}>
            <div style={{ height: '100%', borderRadius: '100px', background: '#25313D', width: `${chemistryScore}%` }} />
          </div>
        </div>

        {/* 공통점 태그 */}
        {matchItems.length > 0 && (
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#6C7786', marginBottom: '12px' }}>
              공통점
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {matchItems.slice(0, 6).map((item) => (
                <span key={item.label} style={{
                  background: '#F0F5FF',
                  color: '#25313D',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '14px',
                  fontWeight: 700,
                }}>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 화면에 보이는 리포트 미리보기 카드 ────────────────────────────────────

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
  return (
    <div
      className="overflow-hidden rounded-[12px]"
      style={{ border: '0.66px solid #DEE4EC' }}
    >
      {/* 그라디언트 배너 */}
      <div
        className="relative px-6 pb-6 pt-4"
        style={{
          background: 'radial-gradient(circle at 28% 8%, #73B9FF 0%, #57ABFF 22%, #3A9DFF 38%, #1D8EFF 52%, #0E87FF 62%, #0080FF 72%, #0657FF 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/kemi/report-card-texture.png"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
          style={{ mixBlendMode: 'color-dodge' }}
        />
        <div className="absolute left-0 top-0 flex items-center gap-0.5 rounded-bl-[6px] rounded-br-[6px] bg-white px-1.5 py-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/kemi/report-badge-icon.svg" alt="" className="size-3" />
          <span className="text-[12px] font-bold" style={{ color: '#25313D' }}>Kemi Report</span>
        </div>

        {/* 양쪽 아바타 */}
        <div className="relative mt-3 flex items-start justify-center gap-4">
          <div className="flex flex-col items-center gap-2.5">
            <AvatarCircle src={viewerAvatar} name={viewerName} size={64} fontSize={22} />
            <span className="text-[12px] font-bold text-white">{viewerName}</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <AvatarCircle src={profileAvatar} name={profileName} size={64} fontSize={22} />
            <span className="text-[12px] font-bold text-white">{profileName}</span>
          </div>
        </div>
      </div>

      {/* 하단 흰색 영역 */}
      <div className="flex flex-col gap-5 px-5 pb-5 pt-4">
        {/* 케미 점수 */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] font-bold" style={{ color: '#6C7786' }}>케미 점수</span>
            <span className="text-[18px] font-bold" style={{ color: '#0D0D0D' }}>{chemistryScore}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: '#DEE4EC' }}>
            <div className="h-full rounded-full" style={{ width: `${chemistryScore}%`, background: '#25313D' }} />
          </div>
        </div>

        {/* 공통점 태그 */}
        {matchItems.length > 0 && (
          <div>
            <p className="mb-3 text-[12px] font-bold" style={{ color: '#6C7786' }}>공통점</p>
            <div className="flex flex-wrap gap-1.5">
              {matchItems.slice(0, 6).map((item) => (
                <span
                  key={item.label}
                  className="rounded-[8px] px-2.5 py-1.5 text-[14px] font-bold"
                  style={{ background: '#F0F5FF', color: '#25313D' }}
                >
                  {item.label}
                </span>
              ))}
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
  whoIAm?: PublicProfileWhoIAm
  life?: PublicProfileLife
  kemi?: KemiData
}) {
  const store = useFeloreStore()
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

  // whoIAm(MBTI)이 아예 없으면 문장을 만들 근거가 없으므로 리포트를 생성하지 않는다.
  const report = whoIAm ? buildCompatibilityReport(profileName, whoIAm, life) : null
  const lockedBlocks = kemi?.lockedBlocks ?? []
  const completenessPercent = kemi?.completenessPercent ?? 100
  const missingItems = kemi?.missingItems ?? []
  const matchItems = kemi?.matchItems ?? []
  const lockedBlockMap = Object.fromEntries(lockedBlocks.map((b) => [b.index, b.missingItems]))

  // 케미 점수: matchItems 수 기반 목업 계산
  const chemistryScore = Math.min(52 + matchItems.length * 7 + Math.round(completenessPercent / 8), 98)

  // [임시] 카드 이미지 캡처 후 공유 (html2canvas + Web Share API)
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
          const file = new File([blob], `felore-kemi-${profileName}.png`, { type: 'image/png' })
          try {
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `${profileName}님과의 케미 리포트`,
                text: `felore에서 ${profileName}님과의 공통점을 발견했어요!`,
              })
            } else {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `felore-kemi-${profileName}.png`
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
      showToast('공유에 실패했어요', 'error')
    } finally {
      setSharing(false)
    }
  }

  const blocks = report ? [
    {
      index: 1,
      content: (
        <>
          <p className="text-[14px] font-medium leading-[1.5]" style={{ color: '#25313D' }}>
            {report.summary}
          </p>

          {/* 공통점 태그 */}
          {matchItems.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {matchItems.map((item) => (
                <span
                  key={item.label}
                  className="rounded-[8px] border px-2.5 py-1.5 text-[14px] font-medium"
                  style={{ borderColor: '#DEE4EC', background: '#fff', color: '#25313D' }}
                >
                  {item.label}
                </span>
              ))}
            </div>
          )}

          {/* 케미카드 만들기 버튼 */}
          {!cardGenerated && !cardGenerating && (
            <button
              type="button"
              onClick={handleGenerateCard}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full py-3 pl-3 pr-4 text-[14px] font-bold transition-opacity active:opacity-70"
              style={{ background: '#F5F6F7', color: '#0D0D0D' }}
            >
              <Sparkles size={16} style={{ color: '#25313D' }} />
              케미카드 만들기
            </button>
          )}

          {/* 생성 중 */}
          {cardGenerating && (
            <div
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-full py-3"
              style={{ background: '#F5F6F7' }}
            >
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#25313D] border-t-transparent" />
              <span className="text-[14px] font-bold" style={{ color: '#0D0D0D' }}>케미카드 생성 중…</span>
            </div>
          )}

          {/* 생성된 카드 */}
          {cardGenerated && (
            <div className="mt-4 flex flex-col gap-2">
              <PolaroidPreviewCard
                viewerName={viewerName}
                viewerAvatar={viewerAvatar}
                profileName={profileName}
                profileAvatar={profileAvatar}
                chemistryScore={chemistryScore}
                matchItems={matchItems}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border py-3 text-[14px] font-bold transition-opacity active:opacity-70 disabled:opacity-50"
                  style={{ borderColor: '#DEE4EC', color: '#25313D' }}
                >
                  <Download size={16} />
                  {sharing ? '저장 중…' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-black py-3 text-[14px] font-bold text-white transition-opacity active:opacity-70 disabled:opacity-50"
                >
                  <Share2 size={16} />
                  {sharing ? '공유 중…' : '공유'}
                </button>
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      index: 2,
      content: (
        <p className="text-[14px] font-medium leading-[1.5]" style={{ color: '#25313D' }}>
          {report.opener}
        </p>
      ),
    },
    {
      index: 3,
      content: (
        <p className="text-[14px] font-medium leading-[1.5]" style={{ color: '#25313D' }}>
          {report.chemistry}
        </p>
      ),
    },
    {
      index: 4,
      content: (
        <p className="text-[14px] font-medium leading-[1.5]" style={{ color: '#25313D' }}>
          {report.fit}
        </p>
      ),
    },
    {
      index: 5,
      content: (
        <p className="text-[14px] font-medium leading-[1.5]" style={{ color: '#25313D' }}>
          {report.caution}
        </p>
      ),
    },
  ] : []

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-4 pb-6">

        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-1">
          <button type="button" onClick={onClose} className="-ml-1 flex items-center justify-center p-1" style={{ color: '#0D0D0D' }}>
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-[22px] font-bold tracking-[-0.03em]" style={{ color: '#0D0D0D' }}>
            케미 리포트
          </h3>
        </div>

        {/* 분석 완성도 */}
        <div className="mb-6 rounded-[12px] p-4" style={{ background: '#F0F5FF', border: '1px solid #CCDDFF' }}>
          <p className="text-[14px] font-bold" style={{ color: '#0D0D0D' }}>
            캐미가 <span style={{ color: '#25313D' }}>{completenessPercent}%</span> 분석됐어요
          </p>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full" style={{ background: completenessPercent > 0 ? '#DEE4EC' : '#CCDDFF' }}>
            {completenessPercent > 0 && (
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${completenessPercent}%`, background: '#25313D' }}
              />
            )}
          </div>
          {report && missingItems.length > 0 && (
            <>
              <p className="mt-4 text-[14px] font-medium leading-[1.5]" style={{ color: '#25313D' }}>
                아래 정보가 부족해서 일부 케미를 분석하지 못했어요. 채우면 더 정확한 결과를 볼 수 있어요.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {missingItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-[8px] border px-2.5 py-1.5 text-[14px] font-medium"
                    style={{ background: '#fff', borderColor: '#DEE4EC', color: '#25313D' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 5개 블록 — 분석 근거(whoIAm)가 아예 없으면 단일 안내로 대체 */}
        {report ? (
          <div className="space-y-3">
            {blocks.map(({ index, content }) => {
              const meta = BLOCK_META[index - 1]
              const blockMissing = lockedBlockMap[index]
              const isLocked = blockMissing !== undefined

              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-[12px] px-4"
                  style={{ border: '0.66px solid #DEE4EC' }}
                >
                  <div className="py-4" style={isLocked ? { filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none' } : undefined}>
                    <div className="mb-1 flex items-center gap-1">
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-[4px] text-[10px] font-semibold"
                        style={{ background: '#F0F5FF', color: '#25313D' }}
                      >
                        {index}
                      </span>
                      <span className="text-[14px] font-bold" style={{ color: '#0D0D0D' }}>{meta.label}</span>
                    </div>
                    {content}
                  </div>
                  {isLocked && <LockedBlockOverlay missingItems={blockMissing} />}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kemi/empty-state-icon.svg" alt="" className="size-12" />
            <p className="text-center text-[14px] font-semibold leading-[1.35]" style={{ color: '#6C7786' }}>
              {profileName}님의 프로필 정보가 아직 부족해서<br />케미를 분석할 수 없어요
            </p>
          </div>
        )}

        {/* [임시] 카드 캡처용 오프스크린 카드 */}
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
