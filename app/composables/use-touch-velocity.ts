import {
  touching,
  onAfterTouchMove,
  onAfterTouchEnd,
  onBeforeTouchCancel,
  onAfterTouchStart,
  touchmoves,
} from "./use-touch-ingestion"

export const deltas = ref<{ x: number; y: number; timeStamp: number }[]>([])
const MAX_DELTAS = 120

const SLOWDOWN_THRESHOLD_MS = 50 // If no touchmove for 50ms, assume slowing down

export function useTouchVelocity({ count = 10, ms = undefined }: { count?: number; ms?: number } = {}) {
  let slowdownRaf: number | null = null
  onAfterTouchMove(() => {
    if (touchmoves.value.length < 2) {
      deltas.value = []
      return
    }
    // Get the latest delta and add it to the deltas array
    const recentTouches = getRecentTouches({ count: 2 })
    const firstTouch = recentTouches[0]
    const lastTouch = recentTouches[recentTouches.length - 1]
    if (!firstTouch || !lastTouch) return
    // @ts-expect-error
    if (lastTouch.__deltaProcessed) return // Prevent double-processing
    const deltaTime = (lastTouch.timeStamp - firstTouch.timeStamp) / 1000 || 1 // in seconds
    const deltaX = (lastTouch.touches[0]?.clientX || 0) - (firstTouch.touches[0]?.clientX || 0)
    const deltaY = (lastTouch.touches[0]?.clientY || 0) - (firstTouch.touches[0]?.clientY || 0)
    deltas.value.push({ x: deltaX / deltaTime, y: deltaY / deltaTime, timeStamp: lastTouch.timeStamp })
    if (deltas.value.length > MAX_DELTAS) {
      deltas.value = deltas.value.slice(-MAX_DELTAS)
    }
    // @ts-expect-error
    lastTouch.__deltaProcessed = true
  })

  // Clear any existing slowdown timer and start a new one
  const startSlowdownLoop = () => {
    const loop = () => {
      // If we're still touching but haven't gotten a touchmove in a while,
      // inject a synthetic "slowdown" delta periodically
      if (touching.value) {
        const now = performance.now()
        const last = deltas.value[deltas.value.length - 1]
        if (!last || now - last.timeStamp >= SLOWDOWN_THRESHOLD_MS) {
          deltas.value.push({ x: 0, y: 0, timeStamp: now })
          if (deltas.value.length > MAX_DELTAS) {
            deltas.value = deltas.value.slice(-MAX_DELTAS)
          }
        }
      }
      slowdownRaf = requestAnimationFrame(loop)
    }
    slowdownRaf = requestAnimationFrame(loop)
  }

  onAfterTouchStart(() => {
    if (slowdownRaf == null) startSlowdownLoop()
  })

  // Clear the slowdown timer when touch ends
  onAfterTouchEnd(() => {
    if (slowdownRaf != null) {
      cancelAnimationFrame(slowdownRaf)
      slowdownRaf = null
    }
  })

  onBeforeTouchCancel(() => {
    if (slowdownRaf != null) {
      cancelAnimationFrame(slowdownRaf)
      slowdownRaf = null
    }
  })

  // Clip deltas to within standard deviation of the last 10
  const clipped = computed(() => {
    const recentDeltas = getRecentDeltas({ count: 10 })
    if (recentDeltas.length === 0) {
      return deltas.value
    }
    const meanX = recentDeltas.reduce((acc, delta) => acc + delta.x, 0) / recentDeltas.length
    const meanY = recentDeltas.reduce((acc, delta) => acc + delta.y, 0) / recentDeltas.length
    const stdDevX = Math.sqrt(
      recentDeltas.reduce((acc, delta) => acc + (delta.x - meanX) ** 2, 0) / recentDeltas.length
    )
    const stdDevY = Math.sqrt(
      recentDeltas.reduce((acc, delta) => acc + (delta.y - meanY) ** 2, 0) / recentDeltas.length
    )
    return deltas.value.filter(
      (delta) => Math.abs(delta.x - meanX) <= stdDevX * 2 && Math.abs(delta.y - meanY) <= stdDevY * 2
    )
  })

  // Average out the deltas to get a smoother velocity
  const averaged = computed(() => {
    const recentDeltas = clipped.value
    if (recentDeltas.length === 0) {
      return { x: 0, y: 0 }
    }
    const total = recentDeltas.reduce(
      (acc, delta) => {
        acc.x += delta.x
        acc.y += delta.y
        return acc
      },
      { x: 0, y: 0 }
    )
    return {
      x: total.x / recentDeltas.length,
      y: total.y / recentDeltas.length,
    }
  })

  return averaged
}

function getRecent<T extends { timeStamp: number }>(
  items: T[],
  { count = 10, ms = undefined }: { count?: number; ms?: number }
) {
  // If both are defined, go with whichever has more events
  if (ms !== undefined) {
    const now = performance.now()
    const latestItems = items.filter((t) => now - t.timeStamp <= ms)
    if (latestItems.length >= count) {
      return latestItems.slice(-count)
    } else {
      return latestItems
    }
  } else {
    // "Last 10 items" means at MOST 10 items.
    if (items.length > count) {
      return items.slice(-count)
    } else {
      return items
    }
  }
}

function getRecentTouches({ count = 10, ms = undefined }: { count?: number; ms?: number }) {
  return getRecent(touchmoves.value, { count, ms })
}

function getRecentDeltas({ count = 10, ms = undefined }: { count?: number; ms?: number }) {
  return getRecent(deltas.value, { count, ms })
}
