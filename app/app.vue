<template>
  <div class="h-screen w-screen bg-gray-200 overflow-hidden">
    <Card v-for="i in 100" :key="i"> card {{ i }} </Card>
  </div>
</template>
