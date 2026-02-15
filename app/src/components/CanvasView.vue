<template>
  <div class="canvas-view flex-1 h-full flex flex-col relative bg-[#F5F5F7] overflow-hidden">
    <!-- Top Toolbar (Floating) -->
    <div class="absolute top-4 left-4 right-4 z-30 flex justify-between pointer-events-none">
      <div class="flex gap-2 pointer-events-auto bg-white/90 backdrop-blur shadow-sm border border-[#E5E5EA] rounded-lg px-3 py-1.5 items-center">
        <span class="text-xs font-semibold text-[#1D1D1F]">分镜画布</span>
        <div class="h-3 w-px bg-[#E5E5EA]"></div>
        <span class="text-[10px] font-mono text-[#86868B]">{{ formatTime(totalDuration) }}</span>
      </div>

      <div class="flex gap-2 pointer-events-auto">
        <div class="bg-white/90 backdrop-blur shadow-sm border border-[#E5E5EA] rounded-lg px-3 py-1.5 flex items-center gap-2">
          <button @click="fitToScreen" class="text-[10px] text-[#007AFF] hover:underline font-medium" title="适应屏幕">适应</button>
          <div class="h-3 w-px bg-[#E5E5EA]"></div>
          <button @click="scale = 1; translateX = 50; translateY = 60" class="text-[10px] text-[#86868B] hover:text-[#1D1D1F]" title="重置为100%">{{ Math.round(scale * 100) }}%</button>
        </div>
        <button
          @click="addShot"
          class="bg-[#007AFF] hover:bg-[#0051A8] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          + 添加分镜
        </button>
      </div>
    </div>

    <!-- Infinite Canvas Area -->
    <div
      ref="canvasRef"
      class="flex-1 w-full h-full cursor-default"
      :class="{ 'cursor-grab': isSpacePressed, 'cursor-grabbing': isDragging }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel="handleWheel"
    >
      <!-- World Transform Container -->
      <div
        class="origin-top-left will-change-transform"
        :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }"
      >
        <!-- Canvas Content -->
        <div ref="contentRef" class="p-10 min-w-max">
          <!-- Storyboard Section -->
          <div class="mb-4">
            <Storyboard />
          </div>

          <!-- Audio Section -->
          <div class="w-full">
            <AudioTracks />
          </div>
        </div>
      </div>
      
      <!-- Dot Grid Background -->
      <div 
        class="absolute inset-0 pointer-events-none -z-10" 
        :style="{ 
          backgroundImage: 'radial-gradient(#D1D1D6 1px, transparent 1px)', 
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          backgroundPosition: `${translateX}px ${translateY}px`
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useProject } from '../composables/useProject'
import Storyboard from './Storyboard.vue'
import AudioTracks from './AudioTracks.vue'

const { project, totalDuration, addShot } = useProject()

const canvasRef = ref(null)
const contentRef = ref(null)
const translateX = ref(50)
const translateY = ref(60)
const scale = ref(0.85)
const isDragging = ref(false)
const isSpacePressed = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

function fitToScreen() {
  if (!canvasRef.value || !contentRef.value) return
  const viewport = canvasRef.value.getBoundingClientRect()
  const content = contentRef.value.getBoundingClientRect()
  // Calculate content's natural size (un-scaled)
  const naturalW = content.width / scale.value
  const naturalH = content.height / scale.value
  if (naturalW === 0 || naturalH === 0) return
  // Fit with padding
  const padX = 40, padY = 80
  const fitScale = Math.min(
    (viewport.width - padX * 2) / naturalW,
    (viewport.height - padY * 2) / naturalH,
    1.0  // never zoom in beyond 100%
  )
  scale.value = Math.max(0.15, Math.round(fitScale * 100) / 100)
  translateX.value = padX
  translateY.value = padY
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Event Handlers
function handleMouseDown(e) {
  // Allow dragging if Space is pressed or Middle Mouse button
  if (isSpacePressed.value || e.button === 1) {
    isDragging.value = true
    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY
    e.preventDefault() // Prevent text selection
  }
}

function handleMouseMove(e) {
  if (isDragging.value) {
    // Only drag if no buttons are pressed (stuck drag) or if correct button is still held
    // e.buttons: 1=Left, 4=Middle
    if (e.buttons === 0 && !isSpacePressed.value) {
      isDragging.value = false;
      return;
    }

    const dx = e.clientX - lastMouseX.value
    const dy = e.clientY - lastMouseY.value
    translateX.value += dx
    translateY.value += dy
    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY
  }
}

function handleMouseUp() {
  isDragging.value = false
}

function handleWheel(e) {
  // Don't hijack scroll inside shot card editors
  if (isInsideInteractive(e.target)) return

  // Ctrl + Wheel to Zoom
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const zoomSensitivity = 0.001
    const delta = -e.deltaY * zoomSensitivity
    const newScale = Math.min(Math.max(0.1, scale.value + delta), 5)
    scale.value = newScale
  } else {
    e.preventDefault()
    translateX.value -= e.deltaX
    translateY.value -= e.deltaY
  }
}

function isInsideInteractive(el) {
  // Don't hijack events when user is inside a shot card editor or any form element
  while (el) {
    if (el.matches && el.matches('input, textarea, select, [contenteditable]')) return true
    if (el.classList && el.classList.contains('shot-card') && el.querySelector('[class*="space-y-6"]')) return true
    el = el.parentElement
  }
  return false
}

function handleKeyDown(e) {
  if (e.code === 'Space' && !e.repeat && !isInsideInteractive(e.target)) {
    isSpacePressed.value = true
    e.preventDefault()
  }
}

function handleKeyUp(e) {
  if (e.code === 'Space') {
    isSpacePressed.value = false
    isDragging.value = false
  }
}

let resizeObserver = null

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // Auto-fit on initial load after DOM settles
  nextTick(() => { setTimeout(fitToScreen, 100) })

  // Re-fit when canvas container resizes (window resize, sidebar toggle, etc.)
  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // Don't auto-fit if user has manually zoomed/panned
    })
    resizeObserver.observe(canvasRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  resizeObserver?.disconnect()
})
</script>
