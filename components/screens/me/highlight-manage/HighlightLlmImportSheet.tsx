'use client'

// [임시] OCR 목업 — 실제 구현 시 이미지를 FELORE OCR 모델에 전달하고 JSON 슬롯필링 결과를 받아야 함

import { useEffect, useRef, useState } from 'react'
import { ChevronRight, ImageOff, Check } from 'lucide-react'
import { BottomSheet, showToast } from '@/components/ui'
import type { OcrCareer, OcrEducation } from '@/types'
import { useFeloreStore } from '@/store/useFeloreStore'

type Step = 'upload' | 'analyzing' | 'failed' | 'preview'

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
  const store = useFeloreStore()
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
      // [임시] 실제 OCR 모델 연동 전까지, 실패 상태 UI 확인을 위해 30% 확률로 인식 실패를 시뮬레이션
      setTimeout(() => {
        if (Math.random() < 0.3) {
          setStep('failed')
        } else {
          setItems(MOCK_OCR_RESULT)
          setStep('preview')
        }
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
      showToast('Free 플랜은 하이라이트를 최대 3개까지 추가할 수 있어요', 'error')
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
        <h3 className="mb-10 text-[18px] font-bold leading-[1.35] tracking-[-0.03em] text-[#0D0D0D]">
          경력 · 학력 자동 채우기
        </h3>

        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />

        {/* 업로드 */}
        {step === 'upload' && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-[24px] bg-[#F5F6F7] px-2.5 py-12 transition-opacity active:opacity-70"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ai-tools/ocr-photo-upload.svg" alt="" className="h-6 w-[31px]" />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-[14px] font-bold text-[#475058]">스크린샷 선택</p>
                <p className="text-[14px] font-medium text-[#6C7786]">링크드인 · 리멤버 · 명함</p>
              </div>
            </button>

            <div className="mt-3 flex flex-col gap-1.5 rounded-[24px] bg-[#F0F5FF] py-3 pl-3 pr-4">
              <div className="flex items-start gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/ai-tools/ocr-info.svg" alt="" className="mt-1 h-4 w-4 shrink-0" />
                <p className="flex-1 text-[14px] font-bold leading-[1.35] text-[#25313D]">잘 찍힌 스크린샷이 정확도를 높여요</p>
              </div>
              <ul className="list-disc space-y-0 pl-[21px] text-[14px] font-medium leading-[1.5] text-[#475058]">
                <li>이름, 직함, 회사명이 화면에 모두 보이도록 캡쳐해주세요.</li>
                <li>경력 기간(입사·퇴사 연도)이 포함된 화면이면 더 좋아요.</li>
                <li>학력 정보도 함께 있으면 한 번에 입력할 수 있어요.</li>
              </ul>
            </div>
          </>
        )}

        {/* 분석 중 */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center gap-6 py-[60px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ai-tools/ocr-loading-spinner.svg" alt="" className="h-12 w-12 animate-spin" />
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-[14px] font-semibold text-[#475058]">분석 중이에요</p>
              <p className="text-[14px] font-medium text-[#6C7786]">이름 · 경력 · 학력을 인식하고 있어요.</p>
            </div>
          </div>
        )}

        {/* 인식 실패 */}
        {step === 'failed' && (
          <div className="flex flex-col items-center justify-center gap-6 py-[60px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F1]">
              <ImageOff size={22} className="text-[#FF4242]" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-[14px] font-semibold text-[#FF4242]">인식에 실패했어요</p>
              <p className="text-[14px] font-medium text-[#6C7786]">다른 스크린샷을 선택해주세요</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-[#DEE4EC] px-5 py-2.5 text-[13px] font-bold text-[#0D0D0D] transition-opacity active:opacity-70"
            >
              다시 선택하기
            </button>
          </div>
        )}

        {/* 결과 선택 */}
        {step === 'preview' && (
          <>
            <div className="mb-6 flex items-center gap-2.5">
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="분석된 스크린샷" className="h-11 w-11 rounded-[6px] object-cover" />
              )}
              <div className="flex flex-col gap-1">
                <p className="text-[14px] font-semibold text-[#0D0D0D]">분석 완료</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center text-[12px] font-semibold text-[#25313D]"
                >
                  다른 스크린샷 선택
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-2">
              {items.map((item, index) => {
                const isCareer = item.type === 'career'
                const c = isCareer ? item.data as OcrCareer : null
                const e = !isCareer ? item.data as OcrEducation : null
                const title = isCareer ? c!.company : e!.school
                const sub = isCareer ? c!.role : `${e!.major}${e!.degree ? ` · ${e!.degree}` : ''}`
                const period = isCareer
                  ? (c!.endYear ? `${c!.startYear} - ${c!.endYear}` : `${c!.startYear} - 현재`)
                  : (e!.status === '재학' ? `${e!.startYear} - 현재` : `${e!.startYear} - ${e!.endYear}`)
                const iconSrc = isCareer ? '/images/ai-tools/ocr-career-icon.svg' : '/images/ai-tools/ocr-education-icon.svg'
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleToggle(index)}
                    className={[
                      'flex w-full items-center gap-5 rounded-[24px] px-4 py-4 text-left',
                      item.selected ? 'border border-[#25313D] bg-[#F0F5FF]' : 'border border-[#DEE4EC]',
                    ].join(' ')}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={iconSrc} alt="" className="h-10 w-10 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-[#0D0D0D]">{title}</p>
                      {sub && <p className="mt-0.5 text-[12px] font-semibold text-[#475058]">{sub}</p>}
                      {period && <p className="mt-0.5 text-[12px] font-medium text-[#6C7786]">{period}</p>}
                    </div>
                    <span
                      className={[
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                        item.selected ? 'bg-[#25313D]' : 'bg-[#F5F6F7]',
                      ].join(' ')}
                    >
                      <Check size={9} strokeWidth={3.5} className={item.selected ? 'text-white' : 'text-[#A8B1BD]'} />
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={selectedCount === 0 || (!isPro && selectedCount > freeRemaining)}
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#0D0D0D] text-[16px] font-semibold text-white transition-opacity disabled:opacity-40"
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
