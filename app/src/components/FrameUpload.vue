<template>
  <label
    class="flex-1 aspect-video bg-black/30 rounded overflow-hidden flex items-center justify-center cursor-pointer border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition relative"
  >
    <img v-if="modelValue" :src="modelValue" class="w-full h-full object-cover" />
    <span v-else class="text-[10px] text-[var(--color-text-dim)]">{{ label }}</span>
    <input type="file" accept="image/*" class="hidden" @change="handleFile" />
    <button
      v-if="modelValue"
      class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500/80 text-white text-[8px] flex items-center justify-center"
      @click.prevent.stop="$emit('update:modelValue', '')"
    >✕</button>
  </label>
</template>

<script setup>
const props = defineProps({ label: String, modelValue: String })
const emit = defineEmits(['update:modelValue'])

function handleFile(e) {
  const file = e.target.files[0]
  if (file) {
    const url = URL.createObjectURL(file)
    emit('update:modelValue', url)
  }
  e.target.value = ''
}
</script>
