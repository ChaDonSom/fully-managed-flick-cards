declare global {
  interface Window {
    __touchIngestionRegistered?: boolean
  }
}

export const touching = ref(false)
export const moving = ref(false)
export const touchmoves = ref<TouchEvent[]>([])
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
      console.log("Touch started", event)
      // For example, you might want to call other functions in your touch processing pipeline
    },
    { passive: false } // Set to false if you plan to call preventDefault()
  )
  window.addEventListener("touchend", (event) => {
    touching.value = false
    moving.value = false
    touchmoves.value = []
  })
  window.addEventListener("touchmove", (event) => {
    moving.value = true
    touchmoves.value.push(event)
  })
  window.addEventListener("touchcancel", (event) => {
    touching.value = false
    moving.value = false
    touchmoves.value = []
  })

  window.__touchIngestionRegistered = true
}
