import { motion } from 'motion/react'
import {
  ArrowUpRight,
  Database,
  Folder,
  Code2,
  Globe,
  Mail,
  Server,
  Settings,
  SlidersHorizontal,
  Terminal,
  User,
  type LucideIcon,
} from 'lucide-react'
import type { IconName, LinkItem, SocialIcon } from '../data/links'
import {
  latencyColorVar,
  useLatency,
  type LatencyState,
} from '../hooks/useLatency'

const ICONS: Record<IconName, LucideIcon> = {
  server: Server,
  user: User,
  settings: Settings,
  sliders: SlidersHorizontal,
  globe: Globe,
  terminal: Terminal,
  database: Database,
  folder: Folder,
}

const SOCIAL_ICONS: Record<SocialIcon, LucideIcon> = {
  github: Code2,
  mail: Mail,
  globe: Globe,
}

const SPAN: Record<LinkItem['size'], string> = {
  server: 'col-span-1 md:col-span-1',
  wide: 'col-span-1 md:col-span-2 2xl:col-span-4 2xl:order-5',
  tool: 'col-span-1 md:col-span-1',
}

const MIN_H: Record<LinkItem['size'], string> = {
  server: 'min-h-[212px] 2xl:min-h-[244px]',
  wide: 'min-h-[132px] 2xl:min-h-[152px]',
  tool: 'min-h-[180px] 2xl:min-h-[244px]',
}

function hostOf(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function IconBox({ icon, big }: { icon: IconName; big?: boolean }) {
  const Icon = ICONS[icon] ?? Globe
  const size = big ? 'h-12 w-12 rounded-2xl' : 'h-10 w-10 rounded-xl'
  const iconSize = big ? 22 : 19
  return (
    <div
      className={`flex shrink-0 items-center justify-center ${size}`}
      style={{
        background: 'var(--icon-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'inset 0 1px 0 var(--glass-hi)',
        color: 'var(--accent)',
      }}
    >
      <Icon size={iconSize} strokeWidth={1.75} />
    </div>
  )
}

function Latency({ state }: { state: LatencyState }) {
  if (state.status === 'idle' || state.status === 'probing') {
    return (
      <span
        className="flex shrink-0 items-center gap-1.5 text-[11px] tabular-nums"
        style={{ color: 'var(--text-faint)' }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--lat-idle)' }}
        />
        检测中
      </span>
    )
  }

  if (state.status === 'fail') {
    return (
      <span
        className="flex shrink-0 items-center gap-1.5 text-[11px]"
        style={{ color: 'var(--text-faint)' }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--lat-idle)' }}
        />
        无响应
      </span>
    )
  }

  const color = latencyColorVar(state.ms)
  return (
    <span
      className="flex shrink-0 items-center gap-1.5 text-[11px] tabular-nums"
      style={{ color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 7px ${color}` }}
      />
      {state.ms} ms
    </span>
  )
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0) {
    return <div className="h-9 w-full" aria-hidden="true" />
  }

  return (
    <div className="flex h-9 w-full items-end gap-[3px]" aria-hidden="true">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[2px] transition-[height] duration-500"
          style={{
            height: `${Math.max(Math.min(v / 300, 1) * 100, 8)}%`,
            background: latencyColorVar(v),
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  )
}

function Arrow() {
  return (
    <ArrowUpRight
      size={17}
      strokeWidth={1.75}
      className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      style={{ color: 'var(--text-faint)' }}
    />
  )
}

function SocialRow({ socials }: { socials: NonNullable<LinkItem['socials']> }) {
  return (
    <div className="flex items-center gap-1.5">
      {socials.map((s) => {
        const Icon = SOCIAL_ICONS[s.icon] ?? Globe
        return (
          <span
            key={s.label}
            role="link"
            tabIndex={0}
            aria-label={s.label}
            title={s.label}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (s.url && s.url !== '#') {
                window.open(s.url, '_blank', 'noopener,noreferrer')
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && s.url && s.url !== '#') {
                e.preventDefault()
                e.stopPropagation()
                window.open(s.url, '_blank', 'noopener,noreferrer')
              }
            }}
            className="social-chip"
          >
            <Icon size={15} strokeWidth={1.75} />
          </span>
        )
      })}
    </div>
  )
}

export function GlassCard({ item, index }: { item: LinkItem; index: number }) {
  const isWide = item.size === 'wide'
  const isServer = item.size === 'server'
  const { state, history } = useLatency(item.url)

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMove}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.65,
        delay: 0.08 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`glass spotlight group flex flex-col overflow-hidden rounded-3xl p-6 ${
        isWide ? 'justify-center' : ''
      } ${item.accent ? 'glass-accent' : ''} ${SPAN[item.size]} ${
        MIN_H[item.size]
      }`}
    >
      {isWide ? (
        <div className="flex items-center gap-5">
          <IconBox icon={item.icon} big />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="card-title truncate text-[clamp(22px,2.4cqi,30px)]">{item.name}</h3>
              {item.badge && (
                <span
                  className="rounded-full px-2 py-[3px] text-[11px] leading-none"
                  style={{
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-faint)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <p
              className="mt-1 truncate text-[13px]"
              style={{ color: 'var(--text-dim)' }}
            >
              {item.desc}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {item.socials && <SocialRow socials={item.socials} />}
            <Latency state={state} />
            <Arrow />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <IconBox icon={item.icon} big={isServer} />
            <Latency state={state} />
          </div>

          <div className="mt-5">
            <h3
              className={`card-title truncate ${
                isServer
                  ? 'text-[clamp(26px,2.8cqi,34px)]'
                  : 'text-[clamp(19px,2.2cqi,26px)]'
              }`}
            >
              {item.name}
            </h3>
            <p
              className="mt-1 truncate font-mono text-[11px] tracking-tight"
              style={{ color: 'var(--text-faint)' }}
              title={item.url}
            >
              {hostOf(item.url)}
            </p>
          </div>

          {item.sparkline && (
            <div className="mt-3">
              <Sparkline data={history} />
            </div>
          )}

          <div
            className="mt-auto flex items-center justify-between gap-3 border-t pt-3"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <span
              className="truncate text-[12px]"
              style={{ color: 'var(--text-dim)' }}
            >
              {item.desc}
            </span>
            <Arrow />
          </div>
        </>
      )}
    </motion.a>
  )
}
