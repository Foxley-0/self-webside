import { Background } from './components/Background'
import { Hero } from './components/Hero'
import { GlassCard } from './components/GlassCard'
import { links, site } from './data/links'

export default function App() {
  return (
    <>
      <Background />
      <main className="mx-auto w-full max-w-[1180px] px-5 pt-10 pb-20 md:px-8 md:pt-16 2xl:max-w-[1440px] 3xl:max-w-[1680px] [container-type:inline-size]">
        <Hero />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {links.map((item, index) => (
            <GlassCard key={item.id} item={item} index={index} />
          ))}
        </section>

        <footer
          className="mt-16 flex items-center justify-between text-[12px]"
          style={{ color: 'var(--text-faint)' }}
        >
          <span>{site.footer}</span>
          <span className="tabular-nums">{links.length} 个入口</span>
        </footer>
      </main>
    </>
  )
}
