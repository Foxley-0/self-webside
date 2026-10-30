/**
 * 全站文案与链接
 * ---------------------------------------------------------------
 * 改昵称、标题、链接，只动这个文件。
 */

export interface FooterLink {
  label: string
  href: string
  external?: boolean
  /** 导航里做成明显的按钮（后台这类常用入口） */
  emphasis?: boolean
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export const profile = {
  name: 'FOXLEY',
  avatar: '/img/avatar.webp',

  /** 首屏大标题 */
  title: '高山仰止.',

  /** 标题下方那行副标题 */
  note: '欢迎来到 Foxley 的主页',

  /** 顶部导航（右侧） */
  nav: [
    { label: 'GitHub', href: 'https://github.com/Foxley-0', external: true },
    {
      label: '后台',
      href: 'https://redirect.289025.xyz/',
      external: true,
      emphasis: true,
    },
  ] as FooterLink[],

  /** 页脚三列 */
  columns: [
    {
      title: '导航',
      links: [
        { label: '主页', href: '#top' },
        { label: 'GitHub', href: 'https://github.com/Foxley-0', external: true },
        { label: '后台', href: 'https://redirect.289025.xyz/', external: true },
      ],
    },
    {
      title: '联系',
      links: [
        { label: 'GitHub', href: 'https://github.com/Foxley-0', external: true },
        { label: '邮箱', href: 'mailto:Foxley888@gmail.com' },
      ],
    },
    {
      title: '友情链接',
      links: [{ label: 'maorx.cn', href: 'https://maorx.cn', external: true }],
    },
  ] as FooterColumn[],

  /** 页脚最下面那行声明 */
  credit: '版式参考 maorx.cn · 内容与代码原创',
}
