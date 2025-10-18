const MAX_TOP = 0

export function useScrollWhenTouching(element: Ref<HTMLElement | null>) {
  if (import.meta.server) return // No need to run on server

  if (element.value) {
    element.value.style.willChange = "transform, top"
    element.value.style.position = "relative"
    element.value.style.top = "0px"
  }

  let rafId: number | null = null
  let pendingDeltaY = 0
  const flush = () => {
    if (!element.value) return
    const el = element.value
    const match = el.style.transform.match(/translateY\(([-\d.]+)px\)/)
    const currentTop = match && match[1] != null ? parseFloat(match[1] as string) : 0
    const newTop = Math.min(currentTop + pendingDeltaY, MAX_TOP)
    el.style.transform = `translateY(${newTop}px)`
    pendingDeltaY = 0
    rafId = null
  }

  // Watch the identity of the last touch event to react to every move, even when array length is capped
  const watcher = watch(
    () => touchmoves.value[touchmoves.value.length - 1],
    () => {
      if (!element.value) return
      const len = touchmoves.value.length
      if (len < 2) return
      const lastTouch = touchmoves.value[len - 1]
      const prevTouch = touchmoves.value[len - 2]
      if (!lastTouch || !prevTouch) return
      const deltaY = (lastTouch.touches[0]?.clientY || 0) - (prevTouch.touches[0]?.clientY || 0)
      pendingDeltaY += deltaY
      if (rafId == null) rafId = requestAnimationFrame(flush)
    }
  )

  const { decayingVelocity } = useDecayingVelocityFromLastKnown()
  const decayingVelocityWatcher = watch(decayingVelocity, (newVelocity) => {
    if (!element.value) return
    if (touching.value) return // Only scroll when not touching
    const el = element.value
    const match = el.style.transform.match(/translateY\(([-\d.]+)px\)/)
    const currentTop = match && match[1] != null ? parseFloat(match[1] as string) : 0
    // Convert velocity from pixels/second to pixels/frame (assuming 60fps = 16ms per frame)
    const velocityPerFrame = newVelocity.y / 60
    const newTop = Math.min(currentTop + velocityPerFrame, MAX_TOP)
    el.style.transform = `translateY(${newTop}px)`
  })

  onBeforeUnmount(() => {
    watcher() // Stop watching
    decayingVelocityWatcher() // Stop watching
    if (rafId != null) cancelAnimationFrame(rafId)
    if (element.value) {
      element.value.style.willChange = ""
      element.value.style.position = ""
      element.value.style.top = ""
    }
  })
}
