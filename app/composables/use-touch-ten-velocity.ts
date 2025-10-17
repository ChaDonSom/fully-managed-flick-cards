export function useTouchTenVelocity() {
  return computed(() => {
    if (touchmoves.value.length < 10) return { x: 0, y: 0 }
    const recentTouches = touchmoves.value.slice(-10)
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
