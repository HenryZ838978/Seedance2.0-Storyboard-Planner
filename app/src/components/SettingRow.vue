<template>
  <div class="flex items-center gap-2">
    <label class="text-[10px] text-[#86868B] w-20 flex-shrink-0 text-right">{{ label }}</label>
    <div class="flex-1 relative">
      <input
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        class="w-full text-[11px] bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg px-2.5 py-1.5 text-[#1D1D1F] placeholder-[#C7C7CC] outline-none focus:border-[#007AFF] transition"
        @blur="save"
        @keyup.enter="save"
      />
    </div>
    <div class="w-5 flex-shrink-0 flex items-center justify-center">
      <span v-if="saving" class="text-[10px] text-[#86868B]">...</span>
      <span v-else-if="saved" class="text-[10px] text-green-500">✓</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBackend } from '../composables/useBackend'

const props = defineProps({
  label: String,
  settingKey: String,
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
})

const { state, saveSetting } = useBackend()
const inputValue = ref('')
const saving = ref(false)
const saved = ref(false)

onMounted(() => {
  // Pre-fill from masked settings if available
  if (state.settings[props.settingKey]) {
    inputValue.value = state.settings[props.settingKey]
  }
})

async function save() {
  const val = inputValue.value.trim()
  if (!val || val.includes('****')) return // don't save masked values
  saving.value = true
  saved.value = false
  try {
    await saveSetting(props.settingKey, val)
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } catch (e) {
    console.error('Save failed:', e)
  } finally {
    saving.value = false
  }
}
</script>
