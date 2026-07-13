'use client'

// [임시] OCR 목업 — 실제 구현 시 이미지를 Byro OCR 모델에 전달하고 JSON 슬롯필링 결과를 받아야 함

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, Circle, Briefcase, BookOpen, ImagePlus, ScanLine } from 'lucide-react'
import { BottomSheet, showToast } from '@/components/ui'
import type { OcrCareer, OcrEducation } from '@/types'
import { useByroStore } from '@/store/useByroStore'

type Step = 'upload' | 'analyzing' | 'preview'

type CareerItem = { type: 'career'; data: OcrCareer; selected: boolean }
type EducationItem = { type: 'education'; data: OcrEducation; selected: boolean }
type PreviewItem = CareerItem | EducationItem

// [임시] OCR 결과 목업 — 실제 구현 시 서버 OCR API 응답으로 교체
const MOCK_OCR_RESULT: PreviewItem[] = [
  {
    type: 'career',
    selected: true,
    data: { company: '(인식된 회사명)', role: '(인식된 직함)', startYear: '2022', endYear: '', status: '재직 중' },
  },
  {
    type: 'education',
    selected: true,
    data: { school: '(인식된 학교명)', major: '(인식된 전공)', degree: '학사', schoolType: '대학교', status: '졸업', startYear: '2016', endYear: '2022' },
  },
]

export function HighlightLlmImportSheet({
  open,
  onClose,
  isPro,
  freeRemaining,
}: {
  open: boolean
  onClose: () => void
  isPro: boolean
  freeRemaining: number
}) {
  const store = useByroStore()
  const [step, setStep] = useState<Step>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [items, setItems] = useState<PreviewItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setStep('upload')
      setImagePreview(null)
      setItems([])
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
      setStep('analyzing')
      // [임시] 실제 OCR 모델 호출 대신 1.5초 딜레이 후 목업 결과 표시
      setTimeout(() => {
        setItems(MOCK_OCR_RESULT)
        setStep('preview')
      }, 1500)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleToggle = (index: number) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item))
  }

  const handleSave = () => {
    const selected = items.filter((i) => i.selected)
    if (selected.length === 0) return
    if (!isPro && selected.length > freeRemaining) {
      showToast('Free 플랜은 하이라이트를 최대 3개까지 추가할 수 있어요')
      return
    }

    selected.forEach((item) => {
      if (item.type === 'career') {
        const c = item.data
        store.addHighlight({
          categoryId: 'career-role',
          icon: 'briefcase',
          title: c.company,
          subtitle: '경력 · OCR 자동 입력',
          description: '',
          year: c.endYear ? `${c.startYear} - ${c.endYear}` : `${c.startYear} - 현재`,
          metadata: { role: c.role, status: c.status, startYear: c.startYear, endYear: c.status === '종료' ? c.endYear : '' },
        })
      } else {
        const e = item.data
        store.addHighlight({
          categoryId: 'education-history',
          icon: 'book-open',
          title: e.school,
          subtitle: `학력 · ${e.schoolType}`,
          description: '',
          year: e.status === '재학' ? `${e.startYear} - 현재` : `${e.startYear} - ${e.endYear}`,
          metadata: { role: e.major, degree: e.degree, schoolType: e.schoolType, status: e.status, startYear: e.startYear, endYear: e.status === '재학' ? '' : e.endYear },
        })
      }
    })

    showToast(`${selected.length}개 하이라이트에 추가됐어요!`)
    onClose()
  }

  const selectedCount = items.filter((i) => i.selected).length

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
          스크린샷 OCR
        </p>
        <h3 className="mt-1.5 mb-5 text-[22px] font-black leading-[1.2]" style={{ color: 'var(--color-text-primary)' }}>
          경력 · 학력 자동 채우기
        </h3>

        {/* 업로드 */}
        {step === 'upload' && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-[22px] py-10 transition-opacity active:opacity-70"
              style={{ background: 'var(--color-bg-soft)', border: '2px dashed var(--color-border-default)' }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}
              >
                <ImagePlus size={22} />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>스크린샷 선택</p>
                <p className="mt-1 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>링크드인 · 리멤버 · 명함</p>
              </div>
            </button>

            {/* 헬퍼텍스트 */}
            <div className="mt-4 rounded-[16px] px-4 py-3.5" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-soft)' }}>
              <p className="mb-1.5 text-[12px] font-bold" style={{ color: 'var(--color-text-primary)' }}>잘 찍힌 스크린샷이 정확도를 높여요</p>
              <ul className="space-y-1">
                {[
                  '이름, 직함, 회사명이 화면에 모두 보이도록 캡처해주세요',
                  '경력 기간(입사·퇴사 연도)이 포함된 화면이면 더 좋아요',
                  '학력 정보도 함께 있으면 한 번에 입력할 수 있어요',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-1.5 text-[12px] leading-[1.6]" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="mt-[3px] shrink-0 text-[10px]" style={{ color: 'var(--color-accent-dark)' }}>•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* 분석 중 */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}
            >
              <ScanLine size={26} className="animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>분석 중이에요</p>
              <p className="mt-1 text-[13px]" style={{ color: 'var(--color-text-tertiary)' }}>이름 · 경력 · 학력을 인식하고 있어요</p>
            </div>
          </div>
        )}

        {/* 결과 선택 */}
        {step === 'preview' && (
          <>
            <div className="mb-4 flex items-center gap-3">
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="분석된 스크린샷" className="h-14 w-10 rounded-lg object-cover" style={{ border: '1px solid var(--color-border-default)' }} />
              )}
              <div>
                <p className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>분석 완료</p>
                <button type="button" onClick={() => { setStep('upload'); setImagePreview(null) }} className="text-[12px]" style={{ color: 'var(--color-accent-dark)' }}>
                  다른 스크린샷 선택
                </button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />

            <div className="mb-5 space-y-3">
              {items.map((item, index) => {
                const isCareer = item.type === 'career'
                const c = isCareer ? item.data as OcrCareer : null
                const e = !isCareer ? item.data as OcrEducation : null
                const title = isCareer ? c!.company : e!.school
                const sub = isCareer ? c!.role : `${e!.major}${e!.degree ? ` · ${e!.degree}` : ''}`
                const period = isCareer
                  ? (c!.endYear ? `${c!.startYear} - ${c!.endYear}` : `${c!.startYear} - 현재`)
                  : (e!.status === '재학' ? `${e!.startYear} - 현재` : `${e!.startYear} - ${e!.endYear}`)
                const Icon = isCareer ? Briefcase : BookOpen
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleToggle(index)}
                    className="flex w-full items-start gap-3 rounded-[20px] px-4 py-4 text-left"
                    style={{
                      background: item.selected ? 'var(--color-accent-bg-subtle)' : 'var(--color-bg-soft)',
                      border: `1px solid ${item.selected ? 'var(--color-accent-border)' : 'var(--color-border-default)'}`,
                    }}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-bg-surface)' }}>
                      <Icon size={15} style={{ color: 'var(--color-text-secondary)' }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
                      {sub && <p className="mt-0.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{sub}</p>}
                      {period && <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>{period}</p>}
                    </div>
                    {item.selected
                      ? <CheckCircle size={18} style={{ color: 'var(--color-accent-dark)', flexShrink: 0, marginTop: 2 }} />
                      : <Circle size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0, marginTop: 2 }} />}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={selectedCount === 0 || (!isPro && selectedCount > freeRemaining)}
              className="w-full rounded-full py-3.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent-dark))' }}
            >
              {selectedCount === 0
                ? '항목을 선택해주세요'
                : !isPro && selectedCount > freeRemaining
                  ? `Free 플랜은 최대 ${freeRemaining}개까지 선택할 수 있어요`
                  : `${selectedCount}개 하이라이트에 추가`}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
