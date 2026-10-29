import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'dark' | 'light'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const t = document.documentElement.dataset.theme
    return t === 'light' ? 'light' : 'dark'
  })

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* 隐私模式下忽略 */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
      className="btn-glass flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px]"
      style={{ color: 'var(--text-dim)' }}
    >
      {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
      <span>{theme === 'dark' ? '暗色' : '亮色'}</span>
    </button>
  )
}

export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
