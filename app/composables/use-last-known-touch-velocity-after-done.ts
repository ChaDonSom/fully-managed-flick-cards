export function useLastKnownTouchVelocityAfterDone() {
  const velocity = useTouchVelocity({ ms: 100 })
  const lastKnownVelocity = ref({ x: 0, y: 0 })

  // Watch for when touching stops to capture the last known velocity
  watch(velocity, (oldVelocity, newVelocity) => {
    if (oldVelocity.x !== 0 && oldVelocity.y !== 0 && newVelocity.x === 0 && newVelocity.y === 0) {
      lastKnownVelocity.value = oldVelocity
      console.log("Touch velocity has settled to zero", { oldVelocity, newVelocity })
      // Here you can trigger any action you want when the touch velocity settles to zero
    }
  })

  return { lastKnownVelocity }
}

// You might do useScrollWhenZombie in app.vue similar to useScrollWhenTouching

// Zombie would need a repeating loop to keep it triggering the scroll, though. Or I guess the useScrollWhenZombie
// would set that loop up itself. It would just keep going forever, if it has no decay mechanism.

// OR: Use another separate computed. Zombie is perpetual - the last known velocity. Make a new computed that, whenever
// zombieVelocity changes, sets itself to zombie and then decays over time.

// So you have:
// - touch velocity (while touching)
// - zombie velocity (last known touch velocity when touch ends)
// - decayed zombie velocity (starts at zombie velocity, then decays over time)

// Step 1: scroll when zombie: no decay.

// Step 2: Set up a decay mechanism, so it slows down over time. Maybe a simple linear decay, or exponential decay.
// Probably a configurable decay rate, configurable by cubic bezier curve. Because this is what will inform the
// "feel" of the scrolling after touch. Might be how the paper feels to land, at first, until I make that a separate
// thing.
