'use client'

type IndustryNode = {
  name: string
  ratio: number
  count?: number
}

const formatNodeLines = (name: string) => {
  if (name.includes('/')) return name.split('/').slice(0, 2)
  if (name.length <= 6) return [name]
  const midpoint = Math.ceil(name.length / 2)
  return [name.slice(0, midpoint), name.slice(midpoint)]
}

const NODE_POSITIONS = [
  { x: 100, y: 30, r: 22 },
  { x: 168, y: 78, r: 20 },
  { x: 136, y: 136, r: 18 },
  { x: 58, y: 134, r: 19 },
  { x: 162, y: 138, r: 16 },
  { x: 28, y: 116, r: 16 },
  { x: 28, y: 60, r: 15 },
  { x: 166, y: 38, r: 15 },
]

export function RememberNetworkGraph({
  total,
  industries,
}: {
  total: number
  industries: IndustryNode[]
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
      <div className="mb-4">
        <div className="text-sm font-bold text-[var(--color-text-strong)]">직업 네트워크 분포</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
          리멤버 명함 기반으로 연결된 직업 네트워크를 보여줘요
        </div>
      </div>

      <svg viewBox="0 0 200 160" className="h-auto w-full">
        <rect x="0" y="0" width="200" height="160" rx="12" fill="#F2F3F5" />

        {industries.slice(0, 8).map((industry, index) => {
          const pos = NODE_POSITIONS[index]
          const labelLines = formatNodeLines(industry.name)
          const labelStartY = labelLines.length > 1 ? pos.y - 9 : pos.y - 5
          return (
            <g key={industry.name}>
              <line
                x1="100"
                y1="84"
                x2={pos.x}
                y2={pos.y}
                stroke="#E4E4E8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx={pos.x} cy={pos.y} r={pos.r + 2} fill="#FFFFFF" />
              <circle cx={pos.x} cy={pos.y} r={pos.r} fill="#F8F9FA" stroke="#E4E4E8" strokeWidth="1.5" />
              <text
                x={pos.x}
                y={labelStartY}
                textAnchor="middle"
                fontSize="6.4"
                fontWeight="700"
                fill="#98989D"
              >
                {labelLines.map((line, lineIndex) => (
                  <tspan key={line} x={pos.x} dy={lineIndex === 0 ? 0 : 6.8}>
                    {line}
                  </tspan>
                ))}
              </text>
              <text
                x={pos.x}
                y={labelLines.length > 1 ? pos.y + 7 : pos.y + 5}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill="#0F0F10"
              >
                {industry.ratio}%
              </text>
              {industry.count && (
                <text
                  x={pos.x}
                  y={labelLines.length > 1 ? pos.y + 17 : pos.y + 16}
                  textAnchor="middle"
                  fontSize="5.8"
                  fontWeight="600"
                  fill="#636366"
                >
                  {industry.count}명
                </text>
              )}
            </g>
          )
        })}

        <circle cx="100" cy="84" r="26" fill="#1DC8A0" />
        <circle cx="100" cy="84" r="29" fill="none" stroke="#0FA87F" strokeWidth="2" />
        <text x="100" y="80" textAnchor="middle" fontSize="9" fontWeight="700" fill="#FFFFFF">나</text>
        <text x="100" y="92" textAnchor="middle" fontSize="7" fontWeight="600" fill="rgba(255,255,255,0.7)">Byro</text>
      </svg>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-soft)] pt-3">
        <div className="text-[11px] text-[var(--color-text-tertiary)]">리멤버 명함 기준</div>
        <div className="text-[11px] font-semibold text-[var(--color-text-secondary)]">총 {total}명</div>
      </div>
    </div>
  )
}
