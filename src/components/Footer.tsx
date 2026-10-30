import type { MouseEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { profile } from '../data/profile'

function backToTop(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  window.scrollTo(0, 0)
}

export function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-grid">
        {profile.columns.map((col) => (
          <div className="footer-col" key={col.title}>
            <p className="footer-title">{col.title}</p>
            <ul className="footer-list">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    className="footer-link"
                    href={link.href}
                    onClick={link.href === '#top' ? backToTop : undefined}
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    <span>{link.label}</span>
                    {link.external && (
                      <ArrowUpRight size={12} strokeWidth={1.5} className="footer-arrow" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-base">
        <span>© 2026 {profile.name}</span>
        <span className="footer-credit">{profile.credit}</span>
      </div>
    </footer>
  )
}
