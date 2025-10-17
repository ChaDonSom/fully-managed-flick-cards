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
        <div class="flex flex-col gap-3 text-xs">
          <pre>card {{ i }}</pre>
          <pre>touches: {{ touchmoves.length }}</pre>
          <pre>deltas: {{ deltas.length }}</pre>
          <pre>velocity y: {{ Math.round(lastTenTouchVelocity.y * 100) / 100 }}</pre>
          <pre>last known velocity y: {{ Math.round(lastKnownVelocity.y * 100) / 100 }}</pre>
          <HistoBar :data="Math.abs(lastTenTouchVelocity.y)" class="w-64">Last 10 touches Y</HistoBar>
          <HistoBar :data="Math.abs(lastKnownVelocity.y)" class="w-64">Last known velocity Y</HistoBar>
          <HistoBar :data="Math.abs(decayingVelocity.y)" class="w-64">Decaying velocity Y</HistoBar>
        </div>
      </Card>
    </div>

    <!-- Console Overlay -->
    <ConsoleOverlay />
  </div>
</template>
