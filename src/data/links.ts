/**
 * 站点信息 + 所有跳转链接
 * ---------------------------------------------------------------
 * 要改地址、加卡片，只动这个文件，组件不用碰。
 * url 写完整地址（https:// 开头），点击会在新标签页打开。
 */

export const site = {
  name: '主站 · Foxley',
  tagline: '所有入口，一处抵达',
  footer: 'Built with React · Tailwind',
}

export type LinkSize = 'server' | 'wide' | 'tool'

export type IconName =
  | 'server'
  | 'user'
  | 'settings'
  | 'sliders'
  | 'globe'
  | 'terminal'
  | 'database'
  | 'folder'

export type SocialIcon = 'github' | 'mail' | 'globe'

export interface SocialLink {
  icon: SocialIcon
  url: string
  label: string
}

export interface LinkItem {
  id: string
  name: string
  desc: string
  url: string
  icon: IconName
  size: LinkSize
  /** 用强调色描边，适合放门面类链接 */
  accent?: boolean
  /** 卡片右上角的小角标 */
  badge?: string
  /** 是否显示延迟曲线 */
  sparkline?: boolean
  /** 宽卡右侧的社交图标 */
  socials?: SocialLink[]
}

export const links: LinkItem[] = [
  {
    id: 'azure-ws',
    name: 'Azure-ws',
    desc: '控制面板',
    url: 'https://panel-a.289025.xyz/dc8cfb6585',
    icon: 'server',
    size: 'server',
    sparkline: true,
  },
  {
    id: 'azure-aa',
    name: 'Azure-aa',
    desc: '控制面板',
    url: 'https://panel-b.289025.xyz/744c9dfc17',
    icon: 'server',
    size: 'server',
    sparkline: true,
  },
  {
    id: 'homepage',
    name: 'Foxley',
    desc: '关于我',
    url: 'https://foxley.289025.xyz',
    icon: 'user',
    size: 'wide',
    accent: true,
    badge: '对外',
    socials: [
      { icon: 'github', url: '#', label: 'GitHub' },
      { icon: 'globe', url: '#', label: '博客' },
      { icon: 'mail', url: '#', label: '邮箱' },
    ],
  },
  {
    id: 'astrbot',
    name: 'AstrBot',
    desc: 'Bot 管理面板',
    url: 'https://bot-panel-b.289025.xyz/',
    icon: 'terminal',
    size: 'tool',
  },
  {
    id: 'snowluma',
    name: 'SnowLuma',
    desc: '服务面板',
    url: 'https://luma-panel-b.289025.xyz/',
    icon: 'sliders',
    size: 'tool',
  },
]
