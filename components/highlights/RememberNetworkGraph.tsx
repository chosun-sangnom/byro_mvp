'use client'

type IndustryNode = {
  name: string
  ratio: number
}

const NODE_POSITIONS = [
  { x: 100, y: 30, r: 22 },
  { x: 168, y: 78, r: 20 },
  { x: 136, y: 136, r: 18 },
  { x: 58, y: 134, r: 19 },
]

export function RememberNetworkGraph({
  total,
  industries,
}: {
  total: number
  industries: IndustryNode[]
}) {
  return (
    <div className="rounded-[22px] border border-[#E7E2DC] bg-white px-4 py-4">
      <div className="mb-4">
        <div className="text-sm font-bold text-[var(--color-text-strong)]">직업 네트워크 분포</div>
        <div className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
          리멤버 명함 기반으로 연결된 직업 네트워크를 보여줘요
        </div>
      </div>

      <svg viewBox="0 0 200 160" className="h-auto w-full">
        <defs>
          <radialGradient id="rememberGlow" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#F8F5F1" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="200" height="160" rx="20" fill="url(#rememberGlow)" />

        {industries.slice(0, 4).map((industry, index) => {
          const pos = NODE_POSITIONS[index]
          return (
            <g key={industry.name}>
              <line
                x1="100"
                y1="84"
                x2={pos.x}
                y2={pos.y}
                stroke="#D9D2CB"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx={pos.x} cy={pos.y} r={pos.r + 2} fill="#F7F4F0" />
              <circle cx={pos.x} cy={pos.y} r={pos.r} fill="#FFFFFF" stroke="#E7E2DC" strokeWidth="1.5" />
              <text
                x={pos.x}
                y={pos.y - 3}
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
                fill="#6F6B66"
              >
                {industry.name}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill="#111111"
              >
                {industry.ratio}%
              </text>
            </g>
          )
        })}

        <circle cx="100" cy="84" r="26" fill="#111111" />
        <circle cx="100" cy="84" r="29" fill="none" stroke="#EEE7DE" strokeWidth="2" />
        <text x="100" y="80" textAnchor="middle" fontSize="9" fontWeight="700" fill="#FFFFFF">나</text>
        <text x="100" y="92" textAnchor="middle" fontSize="7" fontWeight="600" fill="#D7D2CB">Byro</text>
      </svg>

      <div className="mt-4 flex items-center justify-between border-t border-[#F1ECE6] pt-3">
        <div className="text-[11px] text-[var(--color-text-tertiary)]">리멤버 명함 기준</div>
        <div className="text-[11px] font-semibold text-[var(--color-text-secondary)]">총 {total}명</div>
      </div>
    </div>
  )
}
