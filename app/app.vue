<script setup lang="ts">
useTouchIngestion()
</script>

<template>
  <div class="h-screen w-screen bg-gray-200 overflow-hidden">
    <Card v-for="i in 100" :key="i" :class="{ 'text-red-400': touching }"> card {{ i }} </Card>
  </div>
</template>
