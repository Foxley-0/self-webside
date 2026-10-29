import { motion } from 'motion/react'
import { Moon, Sun, Sunrise, Sunset, type LucideIcon } from 'lucide-react'
import { site } from '../data/links'
import { ThemeToggle, useClock } from './ThemeToggle'

function greetingFor(hour: number): { text: string; Icon: LucideIcon } {
  if (hour < 5) return { text: '夜深了', Icon: Moon }
  if (hour < 9) return { text: '早上好', Icon: Sunrise }
  if (hour < 12) return { text: '上午好', Icon: Sun }
  if (hour < 14) return { text: '中午好', Icon: Sun }
  if (hour < 18) return { text: '下午好', Icon: Sun }
  if (hour < 23) return { text: '晚上好', Icon: Sunset }
  return { text: '夜深了', Icon: Moon }
}

export function Hero() {
  const time = useClock()
  const { text: greeting, Icon } = greetingFor(new Date().getHours())

  return (
    <header className="mb-12 md:mb-16">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-[12px] tabular-nums"
          style={{ color: 'var(--text-faint)' }}
        >
          <span className="pulse-dot" />
          <span>{time}</span>
          <span aria-hidden="true" style={{ opacity: 0.5 }}>
            ·
          </span>
          <span className="flex items-center gap-1.5">
            <Icon size={12} strokeWidth={1.75} />
            {greeting}，欢迎回来
          </span>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-14 flex flex-col items-start gap-5 md:mt-20 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="art-glass"
        >
          <span className="art-text art-en">
            Welcome to Foxley&apos;s website.
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="art-glass"
        >
          <span className="art-text art-cn">万事胜意</span>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 text-[14px] md:mt-9 md:text-[15px]"
        style={{ color: 'var(--text-dim)' }}
      >
        {site.tagline}
      </motion.p>
    </header>
  )
}
