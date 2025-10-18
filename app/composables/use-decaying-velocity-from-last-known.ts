export const decayingVelocity = ref<{ x: number; y: number }>({ x: 0, y: 0 })

export function useDecayingVelocityFromLastKnown({ decayRate = 0.95 }: { decayRate?: number } = {}) {
  const { lastKnownVelocity } = useLastKnownTouchVelocityAfterDone()

  let rafId: number | null = null

  const step = () => {
    // Apply decay per frame
    decayingVelocity.value = {
      x: decayingVelocity.value.x * decayRate,
      y: decayingVelocity.value.y * decayRate,
    }

    if (Math.abs(decayingVelocity.value.x) < 0.1 && Math.abs(decayingVelocity.value.y) < 0.1) {
      decayingVelocity.value = { x: 0, y: 0 }
      rafId = null
      return
    }
    rafId = requestAnimationFrame(step)
  }

  const stop = watch(
    lastKnownVelocity,
    (newVelocity) => {
      // Seed the decaying value when last known changes
      decayingVelocity.value = { x: newVelocity.x, y: newVelocity.y }
      if (rafId == null) rafId = requestAnimationFrame(step)
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    if (rafId != null) cancelAnimationFrame(rafId)
    stop()
  })

  return { decayingVelocity }
}
