<!--
  This component takes a value and compares its current value to the max its value has ever been during its lifetime.
-->
<script lang="ts" setup>
import { ref, watch, computed } from "vue"

interface Props {
  data: number
}

const props = defineProps<Props>()

const max = ref(0)

watch(
  () => props.data,
  (newData) => {
    const currentMax = Math.max(newData, max.value)
    if (currentMax > max.value) {
      max.value = currentMax
    }
  },
  { immediate: true }
)
</script>

<template>
  <!-- A simple horizontal bar that fills proportionally to the data value -->
  <div class="bg-gray-300 rounded p-1">
    <slot />
    <div class="h-2 bg-blue-500 rounded" :style="{ width: max ? (props.data / max) * 100 + '%' : '0%' }"></div>
  </div>
</template>
