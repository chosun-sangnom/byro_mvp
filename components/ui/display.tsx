'use client'

export function Divider({ thick }: { thick?: boolean }) {
  if (thick) {
    return <div className="h-px bg-[var(--color-border-soft)] -mx-4 my-3" />
  }
  return <div className="h-px bg-[var(--color-border-soft)] my-3" />
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const char = name.charAt(0)
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-base'
  return (
    <div className={`${sizeClass} rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center font-bold text-[var(--color-text-secondary)] flex-shrink-0`}>
      {char}
    </div>
  )
}

export function AiBounce() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2 h-2 rounded-full bg-[var(--color-text-strong)]"
          style={{
            animation: `bounceDot 1s ${index * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
