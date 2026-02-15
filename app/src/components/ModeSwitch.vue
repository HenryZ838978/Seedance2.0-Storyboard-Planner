<template>
  <div class="flex items-center gap-1 bg-[#F5F5F7] rounded-full p-0.5 border border-[#E5E5EA]">
    <button
      @click="setMode('planning')"
      class="px-3 py-1 text-[10px] font-medium rounded-full transition-all"
      :class="state.mode === 'planning'
        ? 'bg-white text-[#1D1D1F] shadow-sm'
        : 'text-[#86868B] hover:text-[#1D1D1F]'"
    >
      📋 规划模式
    </button>
    <button
      @click="switchToGeneration"
      class="px-3 py-1 text-[10px] font-medium rounded-full transition-all"
      :class="state.mode === 'generation'
        ? 'bg-[#007AFF] text-white shadow-sm'
        : 'text-[#86868B] hover:text-[#1D1D1F]'"
    >
      ⚡ 生成模式
    </button>
  </div>
</template>

<script setup>
import { useBackend } from '../composables/useBackend'

const emit = defineEmits(['open-settings'])
const { state, setMode, checkBackend } = useBackend()

async function switchToGeneration() {
  setMode('generation')
  await checkBackend()
  if (!state.backendOnline) {
    emit('open-settings')
  }
}
</script>
