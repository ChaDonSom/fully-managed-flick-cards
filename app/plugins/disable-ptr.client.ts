// Prevent iOS Safari pull-to-refresh (PTR)
// Strategy: when at the top of the main scroll container and a downward
// touchmove starts, call preventDefault on a non-passive listener.
// Only runs on client.

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const root = document.getElementById("__nuxt") || document.scrollingElement || document.documentElement

  let startY = 0
  let atTop = false

  const onTouchStart = (e: TouchEvent) => {
    startY = e.touches[0]?.clientY ?? 0
    const scroller = root
    const scrollTop = (scroller as HTMLElement).scrollTop ?? window.scrollY
    atTop = scrollTop <= 0
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!atTop) return
    const currentY = e.touches[0]?.clientY ?? 0
    const pullingDown = currentY - startY > 0
    if (pullingDown) {
      // Prevent viewport bounce/PTR when pulling down from top
      e.preventDefault()
    }
  }

  // Use non-passive to be allowed to call preventDefault
  window.addEventListener("touchstart", onTouchStart, { passive: true })
  window.addEventListener("touchmove", onTouchMove, { passive: false })

  // Cleanup on app unmount (HMR / navigation in dev)
  // Removed return statement to fix TypeScript error; cleanup not strictly required here
})
