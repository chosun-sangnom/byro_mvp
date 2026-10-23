'use client'

import { createContext, useContext } from 'react'

/**
 * [임시] UI 개편 시안(SCRUM-270) — ?layout=cover 일 때만 탭 콘텐츠를 커버 톤(박스 없는
 * 에디토리얼 구성)으로 그린다. 기본 레이아웃과 온보딩 가이드 데모는 같은 컴포넌트를 쓰므로
 * Provider 밖에서는 기존 모양 그대로.
 */
export const ProfileCoverToneContext = createContext(false)

export function useCoverTone() {
  return useContext(ProfileCoverToneContext)
}

/** 커버의 AI 페르소나 줄과 같은 그라데이션 — 탭 안 AI 표시도 이 색으로 맞춘다 */
export const COVER_AI_GRADIENT = 'linear-gradient(100deg, #4DA8FF 0%, #5EDB86 100%)'

/** 같은 그라데이션을 아주 옅게 — AI가 만든 내용을 담는 박스 배경 */
export const COVER_AI_TINT = 'linear-gradient(100deg, rgba(77,168,255,0.07) 0%, rgba(94,219,134,0.07) 100%)'
