import { useEffect, useRef } from 'react'
import {
  MIUIX_BG_FRAG,
  PRESETS,
  STATIC_UNIFORMS,
  colorsForCycleIndex,
  type BgPreset,
} from '../shaders/miuixBackground'

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  src: string
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[miuix-bg] shader 编译失败:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function currentTheme(): 'dark' | 'light' {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function MiuixBackground({
  onReady,
  onFail,
}: {
  onReady?: () => void
  onFail?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cbRef = useRef({ onReady, onFail })
  cbRef.current = { onReady, onFail }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })

    if (!gl) {
      console.warn('[miuix-bg] 当前环境不支持 WebGL2，回退 CSS 背景')
      cbRef.current.onFail?.()
      return
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, MIUIX_BG_FRAG)
    if (!vs || !fs) {
      cbRef.current.onFail?.()
      return
    }

    const prog = gl.createProgram()
    if (!prog) {
      cbRef.current.onFail?.()
      return
    }
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[miuix-bg] program 链接失败:', gl.getProgramInfoLog(prog))
      cbRef.current.onFail?.()
      return
    }
    gl.useProgram(prog)

    const U = (name: string) => gl.getUniformLocation(prog, name)
    const uni = {
      uResolution: U('uResolution'),
      uAnimTime: U('uAnimTime'),
      uBound: U('uBound'),
      uTranslateY: U('uTranslateY'),
      uPoints: U('uPoints'),
      uPointsAnim: U('uPointsAnim'),
      uColors: U('uColors'),
      uAlphaMulti: U('uAlphaMulti'),
      uNoiseScale: U('uNoiseScale'),
      uPointRadiusMulti: U('uPointRadiusMulti'),
      uSaturateOffset: U('uSaturateOffset'),
      uLightOffset: U('uLightOffset'),
    }

    let preset: BgPreset = PRESETS[currentTheme()]

    const pointsAnim = new Float32Array(8)
    const colorsBuf = new Float32Array(16)

    function applyPreset(next: BgPreset) {
      preset = next
      gl!.uniform3fv(uni.uPoints, new Float32Array(next.points))
      gl!.uniform1f(uni.uLightOffset, next.lightOffset)
      gl!.uniform1f(uni.uSaturateOffset, next.saturateOffset)
    }

    gl.uniform1f(uni.uTranslateY, STATIC_UNIFORMS.uTranslateY)
    gl.uniform1f(uni.uAlphaMulti, STATIC_UNIFORMS.uAlphaMulti)
    gl.uniform1f(uni.uNoiseScale, STATIC_UNIFORMS.uNoiseScale)
    gl.uniform1f(uni.uPointRadiusMulti, STATIC_UNIFORMS.uPointRadiusMulti)
    applyPreset(preset)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.max(1, Math.round(canvas!.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas!.clientHeight * dpr))
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
      }
      gl!.viewport(0, 0, w, h)
      gl!.uniform2f(uni.uResolution, w, h)

      // 对应 BgEffectPainter.updateBound：保持光点不被拉伸
      const cssW = canvas!.clientWidth
      const cssH = canvas!.clientHeight
      const aspect = cssW / cssH
      const bound =
        cssW <= cssH
          ? [0, 0, 1, 1]
          : [0, 0.5 - aspect / 2, 1, aspect]
      gl!.uniform4f(uni.uBound, bound[0], bound[1], bound[2], bound[3])
    }

    let stage = 0
    let stageTarget = 0
    let lastSwitch = 0
    const startedAt = performance.now()
    let raf = 0
    let alive = true

    function draw(elapsedMs: number) {
      const t = elapsedMs / 1000

      // 颜色组循环：每 colorInterpPeriod * 500ms 推进一格
      const periodMs = preset.colorInterpPeriod * 500
      if (elapsedMs - lastSwitch > periodMs) {
        stageTarget += 1
        lastSwitch = elapsedMs
      }
      stage += (stageTarget - stage) * 0.05

      const base = Math.floor(stage)
      const frac = stage - base
      const c1 = colorsForCycleIndex(preset, base)
      const c2 = colorsForCycleIndex(preset, base + 1)
      for (let i = 0; i < 16; i++) {
        colorsBuf[i] = c1[i] + (c2[i] - c1[i]) * frac
      }
      gl!.uniform4fv(uni.uColors, colorsBuf)

      // 光点摆动：animX = x + sin(t + y) * offset; animY = y + cos(t + animX) * offset
      for (let i = 0; i < 4; i++) {
        const sx = preset.points[i * 3]
        const sy = preset.points[i * 3 + 1]
        const ax = sx + Math.sin(t + sy) * preset.pointOffset
        const ay = sy + Math.cos(t + ax) * preset.pointOffset
        pointsAnim[i * 2] = ax
        pointsAnim[i * 2 + 1] = ay
      }
      gl!.uniform2fv(uni.uPointsAnim, pointsAnim)

      gl!.uniform1f(uni.uAnimTime, t)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    }

    function loop(now: number) {
      if (!alive) return
      draw(now - startedAt)
      raf = requestAnimationFrame(loop)
    }

    function start() {
      if (reduceMotion.matches) {
        draw(0)
        return
      }
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }

    function stop() {
      cancelAnimationFrame(raf)
    }

    resize()
    start()
    cbRef.current.onReady?.()

    const onResize = () => {
      resize()
      if (reduceMotion.matches) draw(0)
    }
    window.addEventListener('resize', onResize)

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onReduceChange = () => {
      stop()
      start()
    }
    reduceMotion.addEventListener('change', onReduceChange)

    // 亮暗切换：换一组 uniform，不重建 shader
    const observer = new MutationObserver(() => {
      applyPreset(PRESETS[currentTheme()])
      stage = 0
      stageTarget = 0
      lastSwitch = performance.now() - startedAt
      if (reduceMotion.matches) draw(0)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      alive = false
      stop()
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      reduceMotion.removeEventListener('change', onReduceChange)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      // 不调用 loseContext：React StrictMode 会立即重新挂载，
      // 丢失 context 后 canvas.getContext() 拿到的是废对象，会导致背景空白。
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  )
}
