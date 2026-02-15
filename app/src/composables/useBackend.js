/**
 * useBackend — handles all communication with the FastAPI backend.
 * In Planning Mode the backend is not required.
 * In Generation Mode the backend must be reachable.
 */
import { reactive, ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const state = reactive({
  mode: 'planning',          // 'planning' | 'generation'
  backendOnline: false,
  seedanceConfigured: false,
  llmConfigured: false,
  settings: {},              // masked key values from server
  checking: false,
})

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export function useBackend() {
  // --- Health & connection ---
  async function checkBackend() {
    state.checking = true
    try {
      await apiFetch('/health')
      state.backendOnline = true
      // Also check API key status
      const health = await apiFetch('/settings/health/check')
      state.seedanceConfigured = health.seedance_configured
      state.llmConfigured = health.llm_configured
      // Load masked settings
      const res = await apiFetch('/settings')
      state.settings = res.settings || {}
    } catch {
      state.backendOnline = false
      state.seedanceConfigured = false
      state.llmConfigured = false
    } finally {
      state.checking = false
    }
  }

  function setMode(mode) {
    state.mode = mode
    if (mode === 'generation') {
      checkBackend()
    }
  }

  const isGenMode = computed(() => state.mode === 'generation')

  // --- Settings ---
  async function saveSetting(key, value) {
    await apiFetch(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    })
    await checkBackend() // refresh status
  }

  async function deleteSetting(key) {
    await apiFetch(`/settings/${key}`, { method: 'DELETE' })
    await checkBackend()
  }

  // --- LLM prompt optimization ---
  async function optimizePrompt(prompt, context = '') {
    const res = await apiFetch('/llm/optimize', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    })
    return res.optimized
  }

  // --- Seedance generation ---
  async function submitGeneration(shotId, prompt, duration = 5, aspectRatio = '16:9', referenceImages = []) {
    return apiFetch('/generate/submit', {
      method: 'POST',
      body: JSON.stringify({
        shot_id: shotId,
        prompt,
        duration,
        aspect_ratio: aspectRatio,
        reference_images: referenceImages,
      }),
    })
  }

  async function pollGeneration(taskId) {
    return apiFetch(`/generate/poll/${taskId}`)
  }

  async function listTasks() {
    return apiFetch('/generate/tasks')
  }

  return {
    state,
    checkBackend,
    setMode,
    isGenMode,
    saveSetting,
    deleteSetting,
    optimizePrompt,
    submitGeneration,
    pollGeneration,
    listTasks,
  }
}
