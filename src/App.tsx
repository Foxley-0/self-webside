import { useEffect } from 'react'
import { Backdrop } from './components/Backdrop'
import { Hero } from './components/Hero'
import { Footer } from './components/Footer'

export default function App() {
  /**
   * 用 JS 读真实视口高度写进 --vh。
   * CSS 的 100vh 在浏览器 UI 变化 / 页面缩放时会算偏（实测差过 25px），
   * window.innerHeight 永远准。
   */
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
    }
    setVh()
    window.addEventListener('resize', setVh)
    window.addEventListener('orientationchange', setVh)
    return () => {
      window.removeEventListener('resize', setVh)
      window.removeEventListener('orientationchange', setVh)
    }
  }, [])

  return (
    <>
      <Backdrop />
      <main>
        <Hero />
        <Footer />
      </main>
    </>
  )
}
