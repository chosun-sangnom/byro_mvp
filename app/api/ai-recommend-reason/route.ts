import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

// SCRUM-125 홈 "오늘의 추천" AI 추천 근거 설명.
// 추천 대상 선정·매칭 신호 계산은 규칙 기반으로 끝낸 뒤, 그 결과를 사람이 읽기 좋은 2~3문장으로만 풀어 쓴다.
// TODO(real API): 서버 추천 파이프라인에서 생성·캐싱(오늘의 추천 레코드에 함께 저장)으로 이동

export interface RecommendReasonPayload {
  viewer: { school?: string; roles: string[]; vibeLabels: string[] } | null
  target: {
    name: string
    title?: string
    headline?: string
    school?: string
    roles: string[]
    vibeLabels: string[]
    reputationKeywords: string[]
    feedbackCount: number
    isVerified: boolean
  }
  signals: {
    sentence: string
    chips: Array<{ signal: 'school' | 'work' | 'vibe' | 'active'; label: string }>
    isFallback: boolean
  }
}

const SYSTEM_PROMPT = `너는 비즈니스 프로필 SNS "펠로어"의 추천 설명 작성자야.
이미 계산된 추천 결과(signals)와 두 사람의 공개 정보만 보고, 왜 이 사람을 추천했는지 한국어 해요체 2~3문장(최대 150자)으로 설명해.

규칙:
- 주어진 정보에 없는 사실(경력, 성격, 만남 이력 등)은 절대 지어내지 마.
- 점수·가중치·알고리즘 같은 내부 표현은 쓰지 마.
- signals.sentence를 그대로 반복하지 말고, 겹치는 점이 대화나 협업에 어떻게 이어질 수 있는지 구체적으로 풀어줘.
- signals.isFallback이 true면 공통점이 아니라 상대가 요즘 활발한 이유(받은 피드백 키워드, 인증, 프로필 내용)를 근거로 설명해.
- 이모지, 따옴표 강조, 과장 표현은 쓰지 마.

반드시 JSON으로만 답해: {"explanation":"..."}`

/** 마지막 글자 받침 유무로 조사 선택 (한글이 아니면 받침 없음으로 처리) */
function josa(word: string, withBatchim: string, withoutBatchim: string): string {
  const code = word.trim().charCodeAt(word.trim().length - 1) - 0xac00
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0
  return hasBatchim ? withBatchim : withoutBatchim
}

// [임시] OPENAI_API_KEY 미설정·실패 시 규칙 기반 설명
function fallbackExplanation({ target, signals }: RecommendReasonPayload): string {
  if (signals.isFallback) {
    const keyword = target.reputationKeywords[0]
    const parts = [`${target.name}님은 최근 프로필을 꾸준히 업데이트하고 있어요.`]
    if (keyword) parts.push(`받은 피드백에서 "${keyword}"라는 평을 가장 많이 들었어요.`)
    if (target.title) parts.push(`${target.title} 분야가 궁금하다면 먼저 둘러보기 좋은 프로필이에요.`)
    return parts.join(' ')
  }
  const labels = (signal: string) => signals.chips.filter((c) => c.signal === signal).map((c) => c.label)
  const parts: string[] = []
  const vibe = labels('vibe')
  if (vibe.length) {
    const last = vibe[vibe.length - 1]
    parts.push(`둘 다 ${vibe.map((l) => `「${l}」`).join('·')}${josa(last, '을', '를')} 좋아해서 좋아하는 이유를 나누며 가볍게 대화를 시작하기 좋아요.`)
  }
  const school = labels('school')
  if (school.length) parts.push(`같은 ${school[0]} 출신이라 학교 시절 이야기로 금방 가까워질 수 있어요.`)
  const work = labels('work')
  if (work.length) parts.push(`${work[0]} 일을 하고 있어 일하는 방식이나 요즘 고민을 나누기 좋아요.`)
  if (target.headline) parts.push(`${target.name}님은 스스로를 "${target.headline}"${josa(target.headline, '이라고', '라고')} 소개하고 있어요.`)
  return parts.slice(0, 3).join(' ')
}

export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as RecommendReasonPayload | null
  if (!payload?.target?.name || !payload.signals) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ explanation: fallbackExplanation(payload), source: 'fallback' })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-6-astra',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 300,
    })
    const parsed = JSON.parse(completion.choices[0].message.content ?? '{}') as { explanation?: unknown }
    const explanation = typeof parsed.explanation === 'string' ? parsed.explanation.trim() : ''
    if (!explanation) throw new Error('empty_explanation')
    return NextResponse.json({ explanation: explanation.slice(0, 200), source: 'openai' })
  } catch {
    return NextResponse.json({ explanation: fallbackExplanation(payload), source: 'fallback' })
  }
}
