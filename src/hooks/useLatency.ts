import { useEffect, useState } from 'react'

export type LatencyState =
  | { status: 'idle' }
  | { status: 'probing' }
  | { status: 'ok'; ms: number }
  | { status: 'fail' }

/**
 * 单次探测：用 no-cors 请求量往返时间。
 * no-cors 拿不到响应内容，只能计时 —— 但测延迟正好够用。
 */
async function probeOnce(url: string, timeoutMs: number): Promise<number | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  // 加时间戳绕开缓存，否则第二次一定是 0ms
  const sep = url.includes('?') ? '&' : '?'
  const target = `${url}${sep}_probe=${Date.now()}`

  const start = performance.now()
  try {
    await fetch(target, {
      mode: 'no-cors',
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    })
    return Math.round(performance.now() - start)
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

/** 测两次取较小值：首次请求含 DNS + TCP + TLS 握手，会明显偏高 */
async function measure(url: string, timeoutMs: number): Promise<number | null> {
  const first = await probeOnce(url, timeoutMs)
  if (first === null) return null
  const second = await probeOnce(url, timeoutMs)
  return second === null ? first : Math.min(first, second)
}

const WARMUP_SAMPLES = 6
const WARMUP_GAP = 700
const HISTORY_LEN = 20

export function useLatency(url: string, intervalMs = 60_000) {
  const [state, setState] = useState<LatencyState>({ status: 'idle' })
  const [history, setHistory] = useState<number[]>([])

  useEffect(() => {
    let alive = true
    let timer: number | undefined
    let count = 0

    async function run() {
      if (!alive) return
      setState({ status: 'probing' })
      const ms = await measure(url, 6000)
      if (!alive) return

      if (ms === null) {
        setState({ status: 'fail' })
      } else {
        setState({ status: 'ok', ms })
        setHistory((prev) => [...prev, ms].slice(-HISTORY_LEN))
      }

      count += 1
      // 启动阶段快速采样几次，让曲线尽快有形状
      const next = count < WARMUP_SAMPLES ? WARMUP_GAP : intervalMs
      timer = window.setTimeout(run, next)
    }

    run()

    return () => {
      alive = false
      if (timer) window.clearTimeout(timer)
    }
  }, [url, intervalMs])

  return { state, history }
}

export function latencyTone(ms: number): 'good' | 'fair' | 'bad' {
  if (ms < 150) return 'good'
  if (ms < 380) return 'fair'
  return 'bad'
}

export function latencyColorVar(ms: number): string {
  const tone = latencyTone(ms)
  return tone === 'good'
    ? 'var(--lat-good)'
    : tone === 'fair'
      ? 'var(--lat-fair)'
      : 'var(--lat-bad)'
}
