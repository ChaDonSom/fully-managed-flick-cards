<script setup lang="ts">
useTouchIngestion()
const lastTenTouchVelocity = useTouchVelocity()
const scrollElement = ref<HTMLElement | null>(null)
useScrollWhenTouching(scrollElement)

// Setup console capture
const { setupCapture } = useConsoleCapture("warn")
setupCapture()
</script>

<template>
  <div class="h-screen w-screen bg-gray-200 overflow-hidden">
    <div ref="scrollElement" class="flex flex-col gap-2 p-2">
      <Card v-for="i in 100" :key="i" :class="{ 'text-red-400': touching }">
        <div class="flex flex-col gap-3">
          <pre>card {{ i }}</pre>
          <HistoBar :data="Math.abs(lastTenTouchVelocity.y)" class="w-64">Last 10 touches Y</HistoBar>
          <HistoBar :data="Math.abs(lastKnownVelocity.y)" class="w-64">Last known velocity Y</HistoBar>
          <HistoBar :data="Math.abs(last50TouchVelocity.x)" class="w-64">Last 50 touches X</HistoBar>
          <HistoBar :data="Math.abs(last50TouchVelocity.y)" class="w-64">Last 50 touches Y</HistoBar>
          <HistoBar :data="Math.abs(last100msTouchVelocity.x)" class="w-64">Last 100 ms X</HistoBar>
          <HistoBar :data="Math.abs(last100msTouchVelocity.y)" class="w-64">Last 100 ms Y</HistoBar>
          <HistoBar :data="Math.abs(last500msTouchVelocity.x)" class="w-64">Last 500 ms X</HistoBar>
          <HistoBar :data="Math.abs(last500msTouchVelocity.y)" class="w-64">Last 500 ms Y</HistoBar>
        </div>
      </Card>
    </div>

    <!-- Console Overlay -->
    <ConsoleOverlay />
  </div>
</template>
