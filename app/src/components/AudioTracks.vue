<template>
  <div class="audio-track-container mt-8 pt-4 border-t border-[#E5E5EA]">
    <div class="flex items-center justify-between mb-4 px-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-[#86868B]">缩放</span>
        <input 
          type="range" 
          min="10" 
          max="200" 
          v-model.number="pxPerSecond" 
          class="w-32 h-1 bg-[#E5E5EA] rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
        >
      </div>
    </div>

    <div class="relative min-w-full pb-6 overflow-x-auto" ref="scrollContainer">
      <div class="relative" :style="{ width: timelineWidth + 'px', minWidth: '100%' }">
        
        <!-- Time Ruler -->
        <div class="flex items-end h-6 border-b border-[#D1D1D6] mb-3 sticky left-0 right-0">
          <div
            v-for="(shot, idx) in project.shots" :key="shot.id"
            class="flex-shrink-0 border-r border-[#E5E5EA] relative group select-none"
            :style="{ width: getShotWidth(shot) + 'px' }"
          >
            <div class="absolute bottom-0 left-0 w-full h-[3px] bg-[#E5E5EA] group-odd:bg-[#D1D1D6]"></div>
            <span class="absolute -top-4 left-1 text-[9px] font-mono text-[#86868B] group-hover:text-[#1D1D1F] transition-colors truncate w-full">
              {{ shot.name }} ({{ shot.duration }}s)
            </span>
          </div>
        </div>

        <!-- BGM Track -->
        <div class="grid grid-cols-[60px_1fr] gap-3 mb-3 items-center">
          <div class="text-[10px] font-medium text-[#86868B] text-right uppercase tracking-wide select-none">BGM</div>
          <div 
            class="h-12 bg-white rounded-lg border border-[#E5E5EA] relative overflow-hidden shadow-sm group hover:border-[#D1D1D6] transition-colors"
            @dragover.prevent="dragOverBGM = true"
            @dragleave="dragOverBGM = false"
            @drop.prevent="onBGMDrop"
            :class="{ 'border-[#007AFF] bg-blue-50': dragOverBGM }"
          >
            <div v-if="bgmUrl" ref="waveformRef" class="w-full h-full opacity-80"></div>
            <div v-else class="w-full h-full flex items-center justify-center text-[10px] text-[#C7C7CC] bg-[#F5F5F7]/50 pointer-events-none select-none">
              <span class="group-hover:text-[#86868B] transition-colors">拖拽 BGM 到此处或点击右上角上传</span>
            </div>
          </div>
        </div>

        <!-- Voice Track -->
        <div class="grid grid-cols-[60px_1fr] gap-3 mb-3 items-center">
          <div class="text-[10px] font-medium text-[#86868B] text-right uppercase tracking-wide select-none">人声</div>
          <div
            class="h-10 bg-white rounded-lg border border-[#E5E5EA] relative cursor-pointer shadow-sm hover:border-[#D1D1D6] transition-colors overflow-hidden"
            @click="addVoiceMarker"
            @dragover.prevent
            @drop="onMarkerDrop($event, 'voice')"
          >
            <!-- Grid lines -->
            <div 
              class="absolute inset-0 pointer-events-none opacity-[0.15]"
              :style="{ 
                backgroundImage: `linear-gradient(90deg, transparent ${pxPerSecond - 1}px, var(--color-border-light) ${pxPerSecond}px)`,
                backgroundSize: `${pxPerSecond}px 100%`
              }"
            ></div>
            
            <div
              v-for="(marker, idx) in project.audioTracks.voice" :key="idx"
              class="absolute top-1 bottom-1 bg-blue-50 border border-blue-200 rounded-md flex items-center px-1.5 group/marker hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-grab active:cursor-grabbing z-10"
              :style="{ left: timeToPixel(marker.time) + 'px', width: Math.max(timeToPixel(marker.duration || 2), 40) + 'px' }"
              draggable="true"
              @dragstart="onMarkerDragStart($event, idx, 'voice')"
              @click.stop
            >
              <span class="text-[9px] text-[#007AFF] font-medium truncate w-full select-none pointer-events-none">{{ marker.text || '台词' }}</span>
              <button
                class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border border-red-100 text-[#FF3B30] shadow-sm text-[8px] flex items-center justify-center opacity-0 group-hover/marker:opacity-100 hover:bg-red-50 transition-all pointer-events-auto"
                @click.stop="project.audioTracks.voice.splice(idx, 1)"
              >✕</button>
              
              <!-- Resize Handle -->
              <div 
                class="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-200/50"
                @mousedown.stop="startResize($event, marker)"
              ></div>
            </div>
            
            <div v-if="!project.audioTracks.voice.length" class="w-full h-full flex items-center justify-center text-[10px] text-[#C7C7CC] bg-[#F5F5F7]/30 pointer-events-none select-none">
              点击添加人声标记
            </div>
          </div>
        </div>

        <!-- SFX Track -->
        <div class="grid grid-cols-[60px_1fr] gap-3 items-center">
          <div class="text-[10px] font-medium text-[#86868B] text-right uppercase tracking-wide select-none">音效</div>
          <div
            class="h-10 bg-white rounded-lg border border-[#E5E5EA] relative cursor-pointer shadow-sm hover:border-[#D1D1D6] transition-colors overflow-hidden"
            @click="addSfxMarker"
            @dragover.prevent
            @drop="onMarkerDrop($event, 'sfx')"
          >
            <!-- Grid lines -->
            <div 
              class="absolute inset-0 pointer-events-none opacity-[0.15]"
              :style="{ 
                backgroundImage: `linear-gradient(90deg, transparent ${pxPerSecond - 1}px, var(--color-border-light) ${pxPerSecond}px)`,
                backgroundSize: `${pxPerSecond}px 100%`
              }"
            ></div>

            <div
              v-for="(marker, idx) in project.audioTracks.sfx" :key="idx"
              class="absolute top-1 bottom-1 bg-amber-50 border border-amber-200 rounded-md flex items-center px-1.5 group/marker hover:bg-amber-100 hover:border-amber-300 transition-colors cursor-grab active:cursor-grabbing z-10"
              :style="{ left: timeToPixel(marker.time) + 'px', width: Math.max(timeToPixel(marker.duration || 0.5), 40) + 'px' }"
              draggable="true"
              @dragstart="onMarkerDragStart($event, idx, 'sfx')"
              @click.stop
            >
              <span class="text-[9px] text-[#FF9500] font-medium truncate w-full select-none pointer-events-none">{{ marker.label || '音效' }}</span>
              <button
                class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border border-red-100 text-[#FF3B30] shadow-sm text-[8px] flex items-center justify-center opacity-0 group-hover/marker:opacity-100 hover:bg-red-50 transition-all pointer-events-auto"
                @click.stop="project.audioTracks.sfx.splice(idx, 1)"
              >✕</button>
              
              <!-- Resize Handle -->
              <div 
                class="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-amber-200/50"
                @mousedown.stop="startResize($event, marker)"
              ></div>
            </div>
            
            <div v-if="!project.audioTracks.sfx.length" class="w-full h-full flex items-center justify-center text-[10px] text-[#C7C7CC] bg-[#F5F5F7]/30 pointer-events-none select-none">
              点击添加音效标记
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useProject } from '../composables/useProject'

const { project, totalDuration } = useProject()

const pxPerSecond = ref(40)
const waveformRef = ref(null)
const bgmUrl = ref('')
const dragOverBGM = ref(false)
const scrollContainer = ref(null)
let wavesurfer = null

// Marker Drag & Resize State
let draggedMarker = null
let resizingMarker = null
let startResizeX = 0
let startResizeDuration = 0

const timelineWidth = computed(() => Math.max(totalDuration.value * pxPerSecond.value, 0))

function getShotWidth(shot) {
  return shot.duration * pxPerSecond.value
}

function timeToPixel(time) {
  return time * pxPerSecond.value
}

function pixelToTime(px) {
  return px / pxPerSecond.value
}

function onBGMDrop(e) {
  dragOverBGM.value = false
  try {
    const data = JSON.parse(e.dataTransfer.getData('application/json'))
    if (data.type === 'asset' && data.assetType === 'audio') {
      const asset = project.assets.find(a => a.id === data.assetId)
      if (asset) {
        setBGM(asset)
      }
    }
  } catch (_) {}
}

async function setBGM(asset) {
  bgmUrl.value = asset.url
  project.audioTracks.bgm = { name: asset.name, file: asset.file }
  await nextTick()
  initWaveSurfer()
}

async function loadBGM(e) {
  const file = e.target.files[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  bgmUrl.value = url
  project.audioTracks.bgm = { name: file.name, file }
  
  await nextTick()
  initWaveSurfer()
  e.target.value = ''
}

async function initWaveSurfer() {
  if (!waveformRef.value || !bgmUrl.value) return

  const WaveSurfer = (await import('wavesurfer.js')).default
  if (wavesurfer) wavesurfer.destroy()

  wavesurfer = WaveSurfer.create({
    container: waveformRef.value,
    waveColor: '#007AFF',
    progressColor: '#0051A8',
    cursorColor: '#1D1D1F',
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    height: 46,
    normalize: true,
    responsive: true,
    interact: false,
  })
  wavesurfer.load(bgmUrl.value)
}

function addVoiceMarker(e) {
  if (e.target.closest('.group\\/marker')) return // Prevent adding when clicking existing marker
  
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left + (scrollContainer.value?.scrollLeft || 0)
  const time = pixelToTime(x)
  const text = prompt('输入台词内容:', '')
  if (text !== null) {
    project.audioTracks.voice.push({ time: Math.max(0, time), duration: 2, text })
  }
}

function addSfxMarker(e) {
  if (e.target.closest('.group\\/marker')) return
  
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left + (scrollContainer.value?.scrollLeft || 0)
  const time = pixelToTime(x)
  const label = prompt('音效描述:', '脚步声')
  if (label !== null) {
    project.audioTracks.sfx.push({ time: Math.max(0, time), duration: 0.5, label })
  }
}

// Marker Dragging
function onMarkerDragStart(e, idx, type) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', JSON.stringify({ idx, type }))
  e.dataTransfer.setDragImage(new Image(), 0, 0) // Hide default drag image
}

function onMarkerDrop(e, targetType) {
  try {
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    if (data.type === targetType) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newTime = Math.max(0, pixelToTime(x))
      
      const track = project.audioTracks[targetType]
      if (track[data.idx]) {
        track[data.idx].time = newTime
      }
    }
  } catch (_) {}
}

// Marker Resizing
function startResize(e, marker) {
  resizingMarker = marker
  startResizeX = e.clientX
  startResizeDuration = marker.duration || 2 // Default duration
  
  window.addEventListener('mousemove', handleResizeMove)
  window.addEventListener('mouseup', stopResize)
}

function handleResizeMove(e) {
  if (!resizingMarker) return
  
  const dx = e.clientX - startResizeX
  const dt = pixelToTime(dx)
  const newDuration = Math.max(0.5, startResizeDuration + dt) // Min duration 0.5s
  
  resizingMarker.duration = newDuration
}

function stopResize() {
  resizingMarker = null
  window.removeEventListener('mousemove', handleResizeMove)
  window.removeEventListener('mouseup', stopResize)
}

// Watch for zoom changes to update Scroll/UI
watch(pxPerSecond, () => {
  // Optional: keep view centered or handle complex zoom logic
})
</script>
