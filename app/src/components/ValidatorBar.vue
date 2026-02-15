<template>
  <div
    v-if="warnings.length > 0"
    class="validator-bar fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-3 z-50 transition-all duration-300 animate-slide-up"
    :class="hasErrors 
      ? 'bg-red-50/90 border-red-200 text-red-700' 
      : 'bg-amber-50/90 border-amber-200 text-amber-700'"
  >
    <div class="flex items-center gap-2 font-medium text-xs">
      <span class="text-base leading-none">{{ hasErrors ? '🛑' : '⚠️' }}</span>
      <span>{{ errors.length }} 错误 · {{ warnings.length - errors.length }} 警告</span>
    </div>
    
    <div class="h-3 w-px bg-current opacity-20"></div>
    
    <div class="flex items-center gap-2 text-[10px] font-medium opacity-90 max-w-[400px] overflow-hidden whitespace-nowrap mask-gradient-right">
      <span v-for="(w, i) in warnings.slice(0, 3)" :key="i" class="flex items-center gap-1">
        <span class="w-1 h-1 rounded-full bg-current opacity-50"></span>
        {{ w.msg }}
      </span>
      <span v-if="warnings.length > 3" class="opacity-70 italic">
        +{{ warnings.length - 3 }} 更多
      </span>
    </div>
  </div>
</template>

<script setup>
import { useValidation } from '../composables/useValidation'
const { warnings, errors, hasErrors } = useValidation()
</script>

<style scoped>
@keyframes slide-up {
  from { transform: translate(-50%, 20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.mask-gradient-right {
  mask-image: linear-gradient(to right, black 90%, transparent 100%);
}
</style>
