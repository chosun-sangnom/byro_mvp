import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

// ─── AI 검색 폴백 엔드포인트 ──────────────────────────────────────────────────
//
// 각 카테고리 전용 API 연동 전까지, 또는 전용 API가 없는 경우(공연·연극)의 검색.
// OpenAI gpt-4o-mini를 사용해 부분 입력을 구조화된 결과로 변환.
//
// TODO(real API): 우선순위 연동 목록 — 연동 후 이 라우트는 진짜 폴백으로만 사용
//   영화  → TMDB  GET /3/search/movie?language=ko-KR
//   음악  → Spotify GET /v1/search?type=track&market=KR
//   책    → 알라딘 Open API (무료 5,000건/일)
//   장소  → Kakao Local API (무료 300,000건/일) GET /v2/local/search/keyword.json
//   공연  → 전용 공개 API 없음 → 이 AI 검색 계속 사용
// ─────────────────────────────────────────────────────────────────────────────

export interface AiSearchItem {
  id: string
  title: string
  subtitle: string
  detail: string
  posterUrl: string | null
}

const SYSTEM_PROMPTS: Record<string, string> = {
  movie: `You are a Korean movie search assistant. Given a partial or full query (may be in Korean), return the 5 most relevant movies.
Respond ONLY with valid JSON: {"items":[{"id":"tmdb-123","title":"한국어제목","subtitle":"감독","detail":"개봉연도","posterUrl":null}]}
Use the Korean release title. If you know the TMDB numeric ID, use "tmdb-{id}" format.`,

  book: `You are a book search assistant fluent in Korean. Given a query, return the 5 most relevant books.
Respond ONLY with valid JSON: {"items":[{"id":"book-1","title":"제목","subtitle":"저자","detail":"출판사","posterUrl":null}]}`,

  play: `You are a Korean musical and theater search assistant. Given a query, return the 5 most relevant musicals or plays staged in Korea.
Respond ONLY with valid JSON: {"items":[{"id":"play-1","title":"공연명","subtitle":"공연장","detail":"초연연도 또는 공연기간","posterUrl":null}]}`,

  music: `You are a music search assistant. Given a query (may be Korean song title or artist name), return the 5 most relevant songs.
Respond ONLY with valid JSON: {"items":[{"id":"track-1","title":"곡명","subtitle":"아티스트","detail":"앨범","posterUrl":null}]}`,

  restaurant: `You are a Korean restaurant search assistant. Given a query (restaurant name or neighborhood), return 5 relevant restaurants in Korea.
Respond ONLY with valid JSON: {"items":[{"id":"r-1","title":"식당명","subtitle":"동네 또는 주소","detail":"음식 종류","posterUrl":null}]}`,

  cafe: `You are a Korean cafe search assistant. Given a query, return 5 relevant cafes in Korea.
Respond ONLY with valid JSON: {"items":[{"id":"c-1","title":"카페명","subtitle":"동네 또는 주소","detail":"특징","posterUrl":null}]}`,

  travel: `You are a travel destination search assistant. Given a partial query (may be Korean), return 5 relevant travel destinations.
Respond ONLY with valid JSON: {"items":[{"id":"city-1","title":"도시명(한국어)","subtitle":"국가","detail":"지역","posterUrl":null}]}`,
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const type = req.nextUrl.searchParams.get('type') ?? 'movie'

  if (!q.trim()) return NextResponse.json({ items: [] })

  const systemPrompt = SYSTEM_PROMPTS[type]
  if (!systemPrompt) return NextResponse.json({ items: [] })

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ items: [], error: 'OPENAI_API_KEY not configured' }, { status: 503 })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: q },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 600,
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(raw)
    const items: AiSearchItem[] = Array.isArray(parsed.items) ? parsed.items : []

    return NextResponse.json({ items })
  } catch (err) {
    console.error('[ai-search]', err)
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
