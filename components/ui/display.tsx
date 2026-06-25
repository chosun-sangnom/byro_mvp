'use client'

export function Divider({ thick }: { thick?: boolean }) {
  if (thick) {
    return <div className="h-px bg-[var(--color-border-soft)] -mx-4 my-3" />
  }
  return <div className="h-px bg-[var(--color-border-soft)] my-3" />
}

export function Avatar({
  name,
  src,
  color,
  size = 40,
}: {
  name: string
  src?: string
  color?: string
  size?: number
}) {
  const fontSize = Math.round(size * 0.28)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: src ? undefined : (color ?? 'var(--color-bg-muted)'),
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ color: color ? '#fff' : 'var(--color-text-secondary)', fontSize, fontWeight: 700 }}>
          {name.slice(0, 2)}
        </span>
      )}
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
