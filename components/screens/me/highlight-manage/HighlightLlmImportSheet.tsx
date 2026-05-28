'use client'

// [임시] OCR 클립보드 브릿지 — API 없음
// 유저가 스크린샷을 앱에서 선택 → ChatGPT/Claude에 이미지 첨부 후 경력/학력 JSON 요청 → 응답 붙여넣기 → 슬롯 자동 채움

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, Circle, Briefcase, BookOpen, ImagePlus } from 'lucide-react'
import { BottomSheet, showToast } from '@/components/ui'
import type { OcrCareer, OcrEducation, OcrResult } from '@/types'
import { useByroStore } from '@/store/useByroStore'

type Step = 'upload' | 'paste' | 'preview'

type CareerItem = { type: 'career'; data: OcrCareer; selected: boolean }
type EducationItem = { type: 'education'; data: OcrEducation; selected: boolean }
type PreviewItem = CareerItem | EducationItem

export function HighlightLlmImportSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const store = useByroStore()
  const [step, setStep] = useState<Step>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [pasteValue, setPasteValue] = useState('')
  const [parseError, setParseError] = useState('')
  const [items, setItems] = useState<PreviewItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setStep('upload')
      setImagePreview(null)
      setPasteValue('')
      setParseError('')
      setItems([])
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
      setStep('paste')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleParse = () => {
    setParseError('')
    const jsonMatch = pasteValue.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      setParseError('JSON 형식을 찾지 못했어요. LLM 응답 전체를 그대로 붙여넣어 주세요.')
      return
    }
    try {
      const result = JSON.parse(jsonMatch[0]) as OcrResult
      const parsed: PreviewItem[] = [
        ...(result.careers ?? []).map((c): CareerItem => ({ type: 'career', data: c, selected: true })),
        ...(result.educations ?? []).map((e): EducationItem => ({ type: 'education', data: e, selected: true })),
      ]
      if (parsed.length === 0) {
        setParseError('경력이나 학력 정보를 찾지 못했어요. 다시 시도해보세요.')
        return
      }
      setItems(parsed)
      setStep('preview')
    } catch {
      setParseError('JSON 파싱에 실패했어요. LLM 응답을 그대로 붙여넣어 주세요.')
    }
  }

  const handleToggle = (index: number) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item))
  }

  const handleSave = () => {
    const selected = items.filter((i) => i.selected)
    if (selected.length === 0) return

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

        {step === 'upload' && (
          <>
            {/* 이미지 업로드 영역 */}
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
                <p className="mt-1 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>링크드인 · 리멤버 프로필 화면</p>
              </div>
            </button>

            {/* 헬퍼 텍스트 */}
            <div className="mt-4 rounded-[16px] px-4 py-3.5" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-soft)' }}>
              <p className="text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
                스크린샷을 선택한 후 <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>ChatGPT나 Claude에 이미지를 첨부</span>해서
                경력/학력 정보를 JSON으로 추출해달라고 하세요. 응답을 붙여넣으면 자동으로 입력돼요.
              </p>
            </div>
          </>
        )}

        {step === 'paste' && (
          <>
            {/* 선택된 이미지 썸네일 */}
            {imagePreview && (
              <div className="mb-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="선택된 스크린샷" className="h-14 w-10 rounded-lg object-cover" style={{ border: '1px solid var(--color-border-default)' }} />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>스크린샷 선택됨</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[12px]"
                    style={{ color: 'var(--color-accent-dark)' }}
                  >
                    다시 선택
                  </button>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />

            {/* 헬퍼 텍스트 */}
            <div className="mb-4 rounded-[16px] px-4 py-3.5" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-soft)' }}>
              <p className="text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-secondary)' }}>
                이 이미지를 <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>ChatGPT나 Claude에 첨부</span>하고
                "경력과 학력 정보를 JSON으로 추출해줘"라고 요청한 뒤, 응답을 아래에 붙여넣으세요.
              </p>
            </div>

            {/* 응답 붙여넣기 */}
            <textarea
              value={pasteValue}
              onChange={(e) => { setPasteValue(e.target.value); setParseError('') }}
              placeholder="LLM 응답을 여기에 붙여넣으세요"
              rows={5}
              className="mb-3 w-full resize-none rounded-[16px] px-4 py-3 text-[13px] leading-[1.6] outline-none"
              style={{
                background: 'var(--color-bg-soft)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
              }}
            />
            {parseError && (
              <p className="mb-3 text-[12px]" style={{ color: 'var(--color-state-danger-text)' }}>{parseError}</p>
            )}
            <button
              type="button"
              onClick={handleParse}
              disabled={!pasteValue.trim()}
              className="w-full rounded-full py-3.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent-dark))' }}
            >
              하이라이트 항목 추출하기
            </button>
          </>
        )}

        {step === 'preview' && (
          <>
            <div className="mb-4">
              <button type="button" onClick={() => setStep('paste')} className="mb-3 text-[12px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                ← 다시 붙여넣기
              </button>
              <h3 className="text-[20px] font-black" style={{ color: 'var(--color-text-primary)' }}>추가할 항목을 선택하세요</h3>
            </div>
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
              disabled={selectedCount === 0}
              className="w-full rounded-full py-3.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent-dark))' }}
            >
              {selectedCount > 0 ? `${selectedCount}개 하이라이트에 추가` : '항목을 선택해주세요'}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
