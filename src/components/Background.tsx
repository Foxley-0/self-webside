import { useCallback, useState } from 'react'
import { MiuixBackground } from './MiuixBackground'

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Background() {
  const [glReady, setGlReady] = useState(false)
  const onReady = useCallback(() => setGlReady(true), [])
  const onFail = useCallback(() => setGlReady(false), [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <MiuixBackground onReady={onReady} onFail={onFail} />

      {/* CSS 光斑兜底：WebGL 就绪后淡出 */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          glReady ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className="drift-a absolute -left-[16%] top-[0%] h-[980px] w-[980px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--glow-1) 0%, transparent 58%)",
            filter: "blur(30px)",
          }}
        />
        <div
          className="drift-b absolute -right-[20%] top-[22%] h-[900px] w-[900px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--glow-2) 0%, transparent 60%)",
            filter: "blur(30px)",
          }}
        />
        <div
          className="drift-c absolute bottom-[-20%] left-[16%] h-[720px] w-[1000px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--glow-3) 0%, transparent 62%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--grid) 1px, transparent 1px), linear-gradient(to bottom, var(--grid) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 90% 75% at 50% 30%, #000 25%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 75% at 50% 30%, #000 25%, transparent 100%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE,
          opacity: "var(--noise-op)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}
