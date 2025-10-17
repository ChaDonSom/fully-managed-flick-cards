export function useTouchVelocity({ count = 10, ms = undefined }: { count?: number; ms?: number } = {}) {
  return computed(() => {
    const recentTouches = getRecentTouches({ count, ms })
    const firstTouch = recentTouches[0]
    const lastTouch = recentTouches[recentTouches.length - 1]
    if (!firstTouch || !lastTouch) return { x: 0, y: 0 }
    // Calculate velocity in pixels per second
    const deltaTime = (lastTouch.timeStamp - firstTouch.timeStamp) / 1000 || 1 // in seconds
    const deltaX = (lastTouch.touches[0]?.clientX || 0) - (firstTouch.touches[0]?.clientX || 0)
    const deltaY = (lastTouch.touches[0]?.clientY || 0) - (firstTouch.touches[0]?.clientY || 0)
    return {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime,
    }
  })
}

function getRecentTouches({ count = 10, ms = undefined }: { count?: number; ms?: number }) {
  // If both are defined, go with whichever has more events
  if (ms !== undefined) {
    const now = performance.now()
    const latestMoves = touchmoves.value.filter((t) => now - t.timeStamp <= ms)
    if (latestMoves.length >= count) {
      return latestMoves.slice(-count)
    } else {
      return latestMoves
    }
  } else {
    // If we don't have enough touches, return empty array. "Last 10 touches" means at LEAST 10 touches.
    if (touchmoves.value.length < count) {
      return []
    }
    return touchmoves.value.slice(-count)
  }
}
