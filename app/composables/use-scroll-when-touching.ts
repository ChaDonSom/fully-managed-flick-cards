export function useScrollWhenTouching(element: Ref<HTMLElement | null>) {
  if (import.meta.server) return // No need to run on server

  if (element.value) {
    element.value.style.willChange = "top"
  }

  if (touching.value) {
    if (element.value) {
      element.value.style.top = `${touchmoves.value.slice(-1)[0]?.touches[0]?.clientY}px`
    }
  }

  onBeforeUnmount(() => {
    if (element.value) {
      element.value.style.willChange = ""
    }
  })
}
