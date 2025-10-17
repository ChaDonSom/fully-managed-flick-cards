export const decayingVelocity = ref<{ x: number; y: number }>({ x: 0, y: 0 })

export function useDecayingVelocityFromLastKnown({ decayRate = 0.6 }: { decayRate?: number } = {}) {
  const { lastKnownVelocity } = useLastKnownTouchVelocityAfterDone()

  watch(
    lastKnownVelocity,
    (newVelocity, oldVelocity) => {
      // Implement decay logic here
      decayingVelocity.value = { x: newVelocity.x * decayRate, y: newVelocity.y * decayRate }

      const decayInterval = setInterval(() => {
        requestAnimationFrame(() => {
          // Apply decay
          decayingVelocity.value.x *= decayRate
          decayingVelocity.value.y *= decayRate

          // If velocity is very small, stop the interval
          if (Math.abs(decayingVelocity.value.x) < 0.1 && Math.abs(decayingVelocity.value.y) < 0.1) {
            clearInterval(decayInterval)
            decayingVelocity.value = { x: 0, y: 0 }
          }

          // Here you can use decayingVelocity.value to update your scroll position or any other effect
        })
      }, 16) // roughly 60fps
    },
    { deep: true }
  )

  return {
    decayingVelocity,
  }
}
