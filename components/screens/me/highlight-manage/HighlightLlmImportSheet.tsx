'use client'

// [임시] LLM 클립보드 브릿지 — API 없음
// 앱이 프롬프트를 생성 → 유저가 ChatGPT/Claude에 붙여넣기 → 응답을 다시 붙여넣기 → 슬롯 자동 채움

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, Circle, Briefcase, BookOpen, Copy, Check } from 'lucide-react'
import { BottomSheet, showToast } from '@/components/ui'
import type { OcrCareer, OcrEducation, OcrResult } from '@/types'
import { useByroStore } from '@/store/useByroStore'

const PROMPT_TEMPLATE = `내 경력과 학력 정보를 아래 JSON 형식으로 정리해줘. 모르는 값은 빈 문자열로 채워줘. JSON만 응답해줘.

{"careers":[{"company":"회사명","role":"직함","startYear":"YYYY","endYear":"YYYY또는빈값","status":"재직 중 또는 종료"}],"educations":[{"school":"학교명","major":"전공","degree":"학사 또는 석사 또는 박사 또는 빈값","schoolType":"대학교 또는 대학원 또는 고등학교 또는 기타","status":"졸업 또는 재학 또는 중퇴","startYear":"YYYY","endYear":"YYYY또는빈값"}]}

내 정보:
`

type Step = 'input' | 'preview'

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
  const [step, setStep] = useState<Step>('input')
  const [pasteValue, setPasteValue] = useState('')
  const [parseError, setParseError] = useState('')
  const [items, setItems] = useState<PreviewItem[]>([])
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 시트가 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setStep('input')
      setPasteValue('')
      setParseError('')
      setItems([])
      setCopied(false)
    }
  }, [open])

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATE).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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
        setParseError('경력이나 학력 정보를 찾지 못했어요. 내 정보를 포함해서 다시 시도해보세요.')
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
          subtitle: '경력 · LLM 자동 입력',
          description: '',
          year: c.endYear ? `${c.startYear} - ${c.endYear}` : `${c.startYear} - 현재`,
          metadata: {
            role: c.role,
            status: c.status,
            startYear: c.startYear,
            endYear: c.status === '종료' ? c.endYear : '',
          },
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
          metadata: {
            role: e.major,
            degree: e.degree,
            schoolType: e.schoolType,
            status: e.status,
            startYear: e.startYear,
            endYear: e.status === '재학' ? '' : e.endYear,
          },
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

        {step === 'input' ? (
          <>
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
                LLM으로 자동 입력
              </p>
              <h3 className="mt-1.5 text-[22px] font-black leading-[1.2]" style={{ color: 'var(--color-text-primary)' }}>
                경력 · 학력 자동 채우기
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.6]" style={{ color: 'var(--color-text-secondary)' }}>
                아래 프롬프트를 ChatGPT나 Claude에 복사하고, 내 정보를 입력한 뒤 응답을 붙여넣으세요.
              </p>
            </div>

            {/* ① 프롬프트 복사 */}
            <div className="mb-4 rounded-[18px] p-4" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>① 프롬프트 복사</span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all"
                  style={{
                    background: copied ? 'var(--color-state-success-bg)' : 'var(--color-accent-bg-subtle)',
                    color: copied ? 'var(--color-state-success-text)' : 'var(--color-accent-dark)',
                    border: `1px solid ${copied ? 'var(--color-state-success-border)' : 'var(--color-accent-border-soft)'}`,
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? '복사됨' : '복사'}
                </button>
              </div>
              <p className="font-mono text-[11px] leading-[1.6]" style={{ color: 'var(--color-text-tertiary)' }}>
                {PROMPT_TEMPLATE.split('\n')[0]}
                <br />
                {'{ "careers": [...], "educations": [...] }'}
                <br />
                {'내 정보: ___'}
              </p>
            </div>

            {/* ② 답변 붙여넣기 */}
            <div className="mb-4 rounded-[18px] p-4" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}>
              <p className="mb-2 text-[12px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>② LLM 응답 붙여넣기</p>
              <textarea
                ref={textareaRef}
                value={pasteValue}
                onChange={(e) => { setPasteValue(e.target.value); setParseError('') }}
                placeholder={'ChatGPT / Claude 응답을 여기에 붙여넣으세요'}
                rows={5}
                className="w-full resize-none rounded-[12px] px-3 py-3 text-[13px] leading-[1.6] outline-none"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)',
                }}
              />
              {parseError && (
                <p className="mt-2 text-[12px]" style={{ color: 'var(--color-state-error-text)' }}>{parseError}</p>
              )}
            </div>

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
        ) : (
          <>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="mb-3 text-[12px] font-semibold"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                ← 다시 붙여넣기
              </button>
              <h3 className="text-[22px] font-black leading-[1.2]" style={{ color: 'var(--color-text-primary)' }}>
                추가할 항목을 선택하세요
              </h3>
              <p className="mt-1 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                탭해서 선택/해제할 수 있어요
              </p>
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
