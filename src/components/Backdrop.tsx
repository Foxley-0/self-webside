/**
 * 固定背景层：照片全程不动，滚动时内容浮在上面。
 * 入场动画（淡入 + 从 1.06 落定）走 CSS，不占 JS。
 */
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <img
        className="backdrop-img"
        src="/img/hero-desktop.webp"
        srcSet="/img/hero-mobile.webp 1080w, /img/hero-desktop.webp 1920w"
        sizes="100vw"
        alt=""
        decoding="async"
      />
    </div>
  )
}
