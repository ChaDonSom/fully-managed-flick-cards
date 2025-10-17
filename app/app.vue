<script setup lang="ts">
useTouchIngestion()
const lastTenTouchVelocity = useTouchTenVelocity()
</script>

<template>
  <div class="h-screen w-screen bg-gray-200 overflow-hidden">
    <Card v-for="i in 100" :key="i" :class="{ 'text-red-400': touching }">
      <pre>card {{ i }}</pre>
      <pre>Last 10 touchmoves velocity: {{ lastTenTouchVelocity }}</pre>
    </Card>
  </div>
</template>
