import { useEffect } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { profile } from '../data/profile'

/** 头像点击回顶部。smooth 由 CSS 的 scroll-behavior 决定，reduced-motion 下自动变 auto */
function backToTop(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  window.scrollTo(0, 0)
}

export function Hero() {
  const chars = [...profile.title]

  /** 把滚动进度写进 --nav-progress，导航黑色层跟着连续加深，而不是到某个阈值突然变黑 */
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      document.documentElement.style.setProperty('--nav-progress', p.toFixed(3))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <header className="hero" id="top">
      <nav className="topbar anim-fade" style={{ animationDelay: '150ms' }}>
        <a className="brand" href="#top" onClick={backToTop} aria-label="回到顶部">
          <img className="avatar" src={profile.avatar} alt="" width={34} height={34} />
          <span className="brand-name">{profile.name}</span>
        </a>

        <div className="topnav">
          {profile.nav.map((item) => (
            <a
              key={item.label}
              className={`topnav-link${item.emphasis ? ' is-emphasis' : ''}`}
              href={item.href}
              {...(item.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {item.label}
              {!item.emphasis && (
                <ArrowUpRight size={13} strokeWidth={1.6} className="topnav-arrow" />
              )}
            </a>
          ))}
        </div>
      </nav>

      <div className="headline">
        <h1 className="headline-title" aria-label={profile.title}>
          {chars.map((char, i) => (
            <span
              key={`${char}-${i}`}
              aria-hidden="true"
              style={{ '--i': i } as CSSProperties}
            >
              {char}
            </span>
          ))}
        </h1>

        <span className="rule" />

        <p className="note anim-fade-up" style={{ animationDelay: '900ms' }}>
          <span className="note-mark">~</span>
          {profile.note}
        </p>
      </div>

      <a
        className="scroll-hint anim-fade"
        href="#footer"
        aria-label="向下滚动"
        style={{ animationDelay: '1200ms' }}
      >
        <span className="hint-bob">
          <ArrowDown size={20} strokeWidth={1.2} />
        </span>
      </a>
    </header>
  )
}
