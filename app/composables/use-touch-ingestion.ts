declare global {
  interface Window {
    __touchIngestionRegistered?: boolean
  }
}

export const touching = ref(false)
export const moving = ref(false)
export const touchmoves = ref<TouchEvent[]>([])

// Lifecycle hooks for touch events
type TouchHook = (event: TouchEvent) => void

const afterTouchStartHooks: TouchHook[] = []
const afterTouchMoveHooks: TouchHook[] = []
const beforeTouchEndHooks: TouchHook[] = []
const afterTouchEndHooks: TouchHook[] = []
const beforeTouchCancelHooks: TouchHook[] = []

export function onAfterTouchStart(hook: TouchHook) {
  afterTouchStartHooks.push(hook)
}

export function onAfterTouchMove(hook: TouchHook) {
  afterTouchMoveHooks.push(hook)
}

/**
 * Register a hook to be called before touchend clears state
 */
export function onBeforeTouchEnd(hook: TouchHook) {
  beforeTouchEndHooks.push(hook)
}

/**
 * Register a hook to be called after touchend clears state
 */
export function onAfterTouchEnd(hook: TouchHook) {
  afterTouchEndHooks.push(hook)
}

/**
 * Register a hook to be called before touchcancel clears state
 */
export function onBeforeTouchCancel(hook: TouchHook) {
  beforeTouchCancelHooks.push(hook)
}

/**
 * This function registers touch event listeners to handle touch ingestion. It's the starting point to our touch
 * processing pipeline. From its starting point, it will call everything else registered in the pipeline, in
 * order, and allows each step to modify the event (or cancel it like preventDefault) as needed.
 */
export function useTouchIngestion() {
  if (import.meta.server) return // No need to run on server

  // No need to reregister if already registered
  if (window.__touchIngestionRegistered) return

  // Register touchstart listener
  window.addEventListener(
    "touchstart",
    (event) => {
      // Here you can add your touch processing logic
      touching.value = true
      // For example, you might want to call other functions in your touch processing pipeline
      afterTouchStartHooks.forEach((hook) => hook(event))
    },
    { passive: false } // Set to false if you plan to call preventDefault()
  )
  window.addEventListener("touchend", (event) => {
    // Call before hooks while state is still available
    beforeTouchEndHooks.forEach((hook) => hook(event))

    touching.value = false
    moving.value = false
    touchmoves.value = []

    // Call after hooks after state has been cleared
    afterTouchEndHooks.forEach((hook) => hook(event))
  })
  window.addEventListener("touchmove", (event) => {
    moving.value = true
    touchmoves.value.push(event)
    afterTouchMoveHooks.forEach((hook) => hook(event))
  })
  window.addEventListener("touchcancel", (event) => {
    // Call before hooks while state is still available
    beforeTouchCancelHooks.forEach((hook) => hook(event))

    touching.value = false
    moving.value = false
    touchmoves.value = []
  })

  window.__touchIngestionRegistered = true
}
