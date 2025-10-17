export interface ConsoleMessage {
  id: string
  type: "log" | "error" | "warn"
  message: string
  timestamp: number
}

const messages = ref<ConsoleMessage[]>([])

export function useConsoleCapture(minLevel?: "log" | "warn" | "error") {
  const addMessage = (type: ConsoleMessage["type"], args: any[]) => {
    const message: ConsoleMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message: args
        .map((arg) => {
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg, null, 2)
            } catch {
              return String(arg)
            }
          }
          return String(arg)
        })
        .join(" "),
      timestamp: Date.now(),
    }

    messages.value.push(message)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const index = messages.value.findIndex((m) => m.id === message.id)
      if (index !== -1) {
        messages.value.splice(index, 1)
      }
    }, 5000)
  }

  const removeMessage = (id: string) => {
    const index = messages.value.findIndex((m) => m.id === id)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  const setupCapture = () => {
    if (process.client) {
      const originalLog = console.log
      const originalError = console.error
      const originalWarn = console.warn

      console.log = (...args: any[]) => {
        originalLog.apply(console, args)
        if (minLevel === "log" || minLevel === undefined) addMessage("log", args)
      }

      console.error = (...args: any[]) => {
        originalError.apply(console, args)
        if (minLevel === undefined || ["log", "warn", "error"].includes(minLevel)) addMessage("error", args)
      }
      ;``
      console.warn = (...args: any[]) => {
        originalWarn.apply(console, args)
        if (minLevel === undefined || ["log", "warn"].includes(minLevel)) addMessage("warn", args)
      }

      // Restore original methods on unmount
      onUnmounted(() => {
        console.log = originalLog
        console.error = originalError
        console.warn = originalWarn
      })
    }
  }

  return {
    messages: readonly(messages),
    removeMessage,
    setupCapture,
  }
}
