<script setup lang="ts">
const { messages, removeMessage } = useConsoleCapture()

const getTypeColor = (type: string) => {
  switch (type) {
    case "error":
      return "bg-red-500 border-red-600"
    case "warn":
      return "bg-yellow-500 border-yellow-600"
    case "log":
    default:
      return "bg-blue-500 border-blue-600"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "error":
      return "❌"
    case "warn":
      return "⚠️"
    case "log":
    default:
      return "ℹ️"
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
    <TransitionGroup name="console">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['pointer-events-auto rounded-lg border-2 shadow-lg p-3 text-white', getTypeColor(msg.type)]"
      >
        <div class="flex items-start gap-2">
          <span class="text-lg">{{ getTypeIcon(msg.type) }}</span>
          <div class="flex-1 min-w-0">
            <div class="font-bold uppercase text-xs mb-1">{{ msg.type }}</div>
            <div class="text-sm break-words whitespace-pre-wrap">{{ msg.message }}</div>
          </div>
          <button @click="removeMessage(msg.id)" class="text-white hover:text-gray-200 ml-2 text-xl leading-none">
            ×
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.console-enter-active,
.console-leave-active {
  transition: all 0.3s ease;
}

.console-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.console-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.console-move {
  transition: transform 0.3s ease;
}
</style>
