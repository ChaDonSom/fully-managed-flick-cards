const MAX_TOP = 0

export function useScrollWhenTouching(element: Ref<HTMLElement | null>) {
  if (import.meta.server) return // No need to run on server

  if (element.value) {
    element.value.style.willChange = "transform, top"
    element.value.style.position = "relative"
    element.value.style.top = "0px"
  }

  const watcher = watch(
    computed(() => [touching.value && element.value && touchmoves.value.length >= 2, touchmoves.value]),
    () => {
      if (!element.value) return
      const lastTouch = touchmoves.value[touchmoves.value.length - 1]
      const prevTouch = touchmoves.value[touchmoves.value.length - 2]
      if (!lastTouch || !prevTouch) return
      const deltaY = (lastTouch.touches[0]?.clientY || 0) - (prevTouch.touches[0]?.clientY || 0)
      const currentTop = parseFloat(element.value.style.transform.replace(/[^\d.-]/g, "") || "0")
      const newTop = Math.min(currentTop + deltaY, MAX_TOP)
      element.value.style.transform = `translateY(${newTop}px)`
    },
    { deep: true }
  )

  const { decayingVelocity } = useDecayingVelocityFromLastKnown()
  const decayingVelocityWatcher = watch(
    decayingVelocity,
    (newVelocity) => {
      if (!element.value) return
      if (touching.value) return // Only scroll when not touching
      const currentTop = parseFloat(element.value.style.transform.replace(/[^\d.-]/g, "") || "0")
      // Convert velocity from pixels/second to pixels/frame (assuming 60fps = 16ms per frame)
      const velocityPerFrame = newVelocity.y / 60
      const newTop = Math.min(currentTop + velocityPerFrame, MAX_TOP)
      element.value.style.transform = `translateY(${newTop}px)`
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    watcher() // Stop watching
    decayingVelocityWatcher() // Stop watching
    if (element.value) {
      element.value.style.willChange = ""
      element.value.style.position = ""
      element.value.style.top = ""
    }
  })
}
