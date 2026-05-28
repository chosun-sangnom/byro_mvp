// [임시] OCR API — Claude Vision(Haiku)으로 링크드인/리멤버 스크린샷에서 경력·학력 추출
// 실제 운영 시 요청 인증, 이미지 크기 제한, rate limit 추가 필요

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { OcrResult } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const EXTRACTION_PROMPT = `이 스크린샷에서 경력(직장 경험)과 학력 정보만 추출해서 아래 JSON 형식으로만 응답해주세요. 다른 설명은 하지 마세요.

{
  "source": "linkedin" 또는 "remember" 또는 "unknown",
  "careers": [
    {
      "company": "회사명",
      "role": "직함/포지션",
      "startYear": "YYYY",
      "endYear": "YYYY 또는 빈 문자열(현재 재직 중)",
      "status": "재직 중" 또는 "종료"
    }
  ],
  "educations": [
    {
      "school": "학교명",
      "major": "전공 (없으면 빈 문자열)",
      "degree": "학사" 또는 "석사" 또는 "박사" 또는 빈 문자열,
      "schoolType": "대학교" 또는 "대학원" 또는 "고등학교" 또는 "기타",
      "status": "졸업" 또는 "재학" 또는 "중퇴",
      "startYear": "YYYY 또는 빈 문자열",
      "endYear": "YYYY 또는 빈 문자열(재학 중)"
    }
  ]
}

추출할 수 없는 필드는 빈 문자열로, 경력/학력이 없으면 빈 배열로 응답하세요.`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const formData = await req.formData()
  const file = formData.get('image') as File | null

  if (!file) {
    return NextResponse.json({ error: 'image field is required' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          { type: 'text', text: EXTRACTION_PROMPT },
        ],
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  // JSON 블록만 추출 (```json ... ``` 감싸져 있을 수 있음)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Failed to parse OCR result', raw }, { status: 422 })
  }

  const result = JSON.parse(jsonMatch[0]) as OcrResult
  return NextResponse.json(result)
}
