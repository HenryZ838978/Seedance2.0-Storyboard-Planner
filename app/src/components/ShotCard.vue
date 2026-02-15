<template>
  <div
    class="shot-card flex-shrink-0 rounded-2xl border bg-white shadow-sm transition-all duration-300 relative group overflow-visible"
    :class="{
      'border-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/5 shadow-xl scale-[1.02] z-20': expanded,
      'border-[var(--color-border-light)] hover:border-[var(--color-border)] hover:shadow-lg hover:-translate-y-1': !expanded,
      'border-red-500/50': shotWarnings.length > 0 && !expanded,
      'drop-active': dropActive,
    }"
    :style="{ width: expanded ? '460px' : '240px' }"
    @dragover.prevent="onDragOver"
    @dragleave="dropActive = false"
    @drop.prevent="onDrop"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-light)] cursor-pointer select-none bg-gray-50/30 rounded-t-2xl"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-3">
        <span class="text-xs font-bold font-mono text-[var(--color-text)] tracking-tight truncate max-w-[120px]" :title="shot.name">{{ shot.name }}</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-light)] text-[var(--color-text-dim)] font-mono shadow-sm">
          {{ shot.duration }}s
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="shotWarnings.length" class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium flex items-center gap-1 border border-amber-100">
          ⚠️ {{ shotWarnings.length }}
        </span>
        <!-- Expand/Collapse Icon -->
        <div class="w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
          <span class="text-[10px] text-[var(--color-text-tertiary)] transform transition-transform duration-300" :class="{ 'rotate-180': expanded }">▼</span>
        </div>
      </div>
    </div>

    <!-- Delete Button (Floating) -->
    <button
      v-if="!expanded"
      @click.stop="$emit('remove', shot.id)"
      class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-gray-400 border border-gray-200 shadow-md flex items-center justify-center hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10"
      title="删除分镜"
    >
      ✕
    </button>

    <!-- Compact View -->
    <div v-if="!expanded" class="p-4 cursor-pointer" @click="expanded = true">
      <div class="flex gap-2 mb-3">
        <div class="flex-1 aspect-video bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center text-[10px] text-[var(--color-text-tertiary)] border border-[var(--color-border-light)] relative group/frame">
          <img v-if="shot.firstFrameUrl" :src="shot.firstFrameUrl" class="w-full h-full object-cover" />
          <span v-else class="font-medium opacity-50">首帧</span>
        </div>
        <div class="flex items-center text-[var(--color-text-tertiary)] text-[10px]">➜</div>
        <div class="flex-1 aspect-video bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center text-[10px] text-[var(--color-text-tertiary)] border border-[var(--color-border-light)] relative group/frame">
          <img v-if="shot.lastFrameUrl" :src="shot.lastFrameUrl" class="w-full h-full object-cover" />
          <span v-else class="font-medium opacity-50">尾帧</span>
        </div>
      </div>
      
      <div v-if="shot.description" class="text-[11px] leading-relaxed text-[var(--color-text-dim)] line-clamp-2 min-h-[2.5em] mb-2 px-0.5">
        {{ shot.description }}
      </div>
      <div v-else class="text-[11px] text-[var(--color-text-tertiary)] italic mb-2 px-0.5 hover:text-[var(--color-accent)] transition-colors">
        点击此处编辑场景描述...
      </div>

      <!-- Tags Row -->
      <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        <div class="flex flex-wrap gap-1.5">
          <span v-for="cam in shot.cameraL1" :key="cam.id" class="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium border border-blue-100">
            {{ cam.label.split(' ')[0] }}
          </span>
          <span v-if="shot.shotType" class="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
            {{ shot.shotType.label }}
          </span>
        </div>
        <div v-if="shot.assignedAssets.length" class="flex items-center gap-1 text-[9px] text-[var(--color-text-dim)]" title="已关联素材">
          <span class="text-sm">📎</span> {{ shot.assignedAssets.length }}
        </div>
      </div>
    </div>

    <!-- Expanded Editor View -->
    <div v-if="expanded" class="p-5 space-y-6">
      <!-- 1. Keyframes & Duration Row -->
      <div class="flex gap-4">
        <div class="flex-1 space-y-2">
          <label class="section-label">关键帧</label>
          <div class="flex gap-2">
            <FrameUpload label="首帧" v-model="shot.firstFrameUrl" />
            <FrameUpload label="尾帧" v-model="shot.lastFrameUrl" />
          </div>
        </div>
        <div class="w-1/3 space-y-2">
          <div class="flex justify-between items-center">
            <label class="section-label">时长</label>
            <span class="text-[10px] font-mono font-bold text-[var(--color-text)]">{{ shot.duration }}s</span>
          </div>
          <input
            type="range" :min="4" :max="15" v-model.number="shot.duration"
            class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
          />
          <div class="flex justify-between text-[9px] text-[var(--color-text-tertiary)] font-medium">
            <span>4s</span><span>15s</span>
          </div>
        </div>
      </div>

      <!-- 2. Scene Description -->
      <div class="space-y-2">
        <label class="section-label">场景描述</label>
        <textarea
          v-model="shot.description"
          rows="3"
          placeholder="详细描述画面内容、人物动作、环境细节..."
          class="w-full text-xs bg-gray-50 border border-[var(--color-border-light)] rounded-xl px-3 py-2.5 text-[var(--color-text)] resize-none focus:bg-white focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-all placeholder:text-[var(--color-text-tertiary)]"
        />
      </div>

      <!-- 3. Camera & Composition -->
      <div class="space-y-4 p-4 bg-gray-50/50 rounded-xl border border-[var(--color-border-light)]">
        <!-- Shot Type -->
        <div>
          <label class="section-label mb-2 block">景别</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="st in SHOT_TYPES" :key="st.id"
              @click="shot.shotType = shot.shotType?.id === st.id ? null : st"
              class="chip-btn"
              :class="shot.shotType?.id === st.id ? 'chip-btn-active' : 'chip-btn-inactive'"
            >{{ st.label }}</button>
          </div>
        </div>

        <!-- Movement -->
        <div>
          <label class="section-label mb-2 block">
            运镜方式 <span class="font-normal opacity-50 ml-1 text-[9px]">(最多选3项)</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="m in L1_MOVEMENTS" :key="m.id"
              @click="toggleCamera(m)"
              class="chip-btn"
              :class="isCameraSelected(m.id) ? 'chip-btn-active' : 'chip-btn-inactive'"
              :disabled="shot.cameraL1.length >= 3 && !isCameraSelected(m.id)"
            >{{ m.icon }} {{ m.label.split(' ')[0] }}</button>
          </div>
        </div>

        <!-- Modifiers Grid -->
        <div class="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div class="space-y-1">
            <label class="text-[10px] text-[var(--color-text-dim)]">速度</label>
            <select v-model="shot.cameraSpeed" class="select-input">
              <option :value="null">默认</option>
              <option v-for="s in L2_SPEED" :key="s.id" :value="s">{{ s.label }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] text-[var(--color-text-dim)]">情绪</label>
            <select v-model="shot.cameraMood" class="select-input">
              <option :value="null">默认</option>
              <option v-for="m in L2_MOOD" :key="m.id" :value="m">{{ m.label }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] text-[var(--color-text-dim)]">风格</label>
            <select v-model="shot.cameraStyle" class="select-input">
              <option :value="null">默认</option>
              <option v-for="s in L2_STYLE" :key="s.id" :value="s">{{ s.label }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 4. Style & Lighting -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="section-label">光线</label>
          <input v-model="shot.lighting" placeholder="例如：侧逆光、黄昏柔光" class="text-input" />
        </div>
        <div class="space-y-1.5">
          <label class="section-label">美术风格</label>
          <input v-model="shot.style" placeholder="例如：赛博朋克、极简" class="text-input" />
        </div>
      </div>

      <!-- 5. Assets -->
      <div class="space-y-2">
        <label class="section-label flex justify-between">
          关联素材
          <span class="font-normal opacity-50 text-[9px]">从上方素材库拖入</span>
        </label>
        <div class="min-h-[60px] p-2 rounded-xl border-2 border-dashed border-gray-200 bg-white transition-colors"
             :class="{ 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]/20': dropActive }">
          
          <div v-if="shot.assignedAssets.length === 0" class="h-full flex flex-col items-center justify-center text-[10px] text-[var(--color-text-tertiary)] py-2">
            <span>拖拽图片/视频/音频到此处</span>
          </div>

          <div v-else class="flex flex-wrap gap-2">
            <div
              v-for="(aa, idx) in shot.assignedAssets" :key="idx"
              class="flex items-center gap-2 pl-2 pr-1 py-1 bg-white rounded-lg border border-gray-200 shadow-sm text-[10px]"
            >
              <span class="font-mono text-[var(--color-accent)] font-bold">{{ getAssetTag(aa.assetId) }}</span>
              <span class="text-[var(--color-text)] truncate max-w-[80px]">{{ getAssetName(aa.assetId) }}</span>
              <div class="h-3 w-px bg-gray-200 mx-1"></div>
              <select v-model="aa.role" class="bg-transparent border-none text-[var(--color-text-dim)] p-0 text-[10px] focus:ring-0 cursor-pointer hover:text-[var(--color-text)]">
                <option value="">选择角色...</option>
                <option v-for="r in getRolesForAsset(aa.assetId)" :key="r.id" :value="r.id">{{ r.label }}</option>
              </select>
              <button @click="removeAssignment(idx)" class="w-4 h-4 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex items-center justify-center">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. Transition -->
      <div class="space-y-2">
        <label class="section-label">转场衔接</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="t in TRANSITION_TYPES" :key="t.id"
            @click="shot.transitionType = shot.transitionType?.id === t.id ? null : t"
            class="chip-btn"
            :class="shot.transitionType?.id === t.id ? 'chip-btn-active' : 'chip-btn-inactive'"
          >{{ t.icon }} {{ t.label }}</button>
        </div>
      </div>

      <!-- 7. Generated Prompt -->
      <div class="space-y-2 pt-2 border-t border-gray-100">
        <div class="flex justify-between items-end">
          <label class="section-label">AI 提示词预览</label>
          <button
            v-if="generatedPrompt"
            @click="copyPrompt"
            class="text-[10px] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium flex items-center gap-1 transition-colors bg-blue-50 px-2 py-0.5 rounded-full"
          >
            <span>📋</span> 复制
          </button>
        </div>
        <div class="p-3 bg-gray-900 text-gray-300 rounded-xl text-[10px] font-mono whitespace-pre-wrap leading-relaxed select-text shadow-inner">
          {{ generatedPrompt || '完善分镜信息后自动生成...' }}
        </div>
      </div>

      <!-- Generation Mode Actions -->
      <div v-if="isGenMode" class="space-y-2 pt-2 border-t border-gray-100">
        <div class="flex gap-2">
          <button
            @click="handleOptimize"
            :disabled="optimizing || !shot.description"
            class="flex-1 px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all flex items-center justify-center gap-1"
            :class="optimizing
              ? 'bg-gray-100 text-gray-400 cursor-wait'
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'"
          >
            {{ optimizing ? '优化中...' : '🧠 AI 优化提示词' }}
          </button>
          <button
            @click="handleGenerate"
            :disabled="generating || !generatedPrompt"
            class="flex-1 px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all flex items-center justify-center gap-1"
            :class="generating
              ? 'bg-gray-100 text-gray-400 cursor-wait'
              : 'bg-[#007AFF] text-white hover:bg-[#0051A8]'"
          >
            {{ generating ? '生成中...' : '⚡ 生成视频' }}
          </button>
        </div>
        <div v-if="genStatus" class="text-[10px] px-2 py-1.5 rounded-lg" :class="genStatusClass">
          {{ genStatus }}
        </div>
        <div v-if="genResultUrl" class="rounded-xl overflow-hidden border border-[#E5E5EA]">
          <video :src="genResultUrl" controls class="w-full" />
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="pt-4 flex justify-end border-t border-[var(--color-border-light)]">
        <button 
          @click="$emit('remove', shot.id)" 
          class="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-1"
        >
          <span class="text-lg leading-none">🗑</span> 删除分镜
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProject } from '../composables/useProject'
import { useValidation } from '../composables/useValidation'
import { useBackend } from '../composables/useBackend'
import { L1_MOVEMENTS, L2_SPEED, L2_MOOD, L2_STYLE, SHOT_TYPES, TRANSITION_TYPES } from '../data/cameraMovements'
import { generatePrompt, ASSET_ROLES } from '../data/promptTemplates'
import FrameUpload from './FrameUpload.vue'

const props = defineProps({ shot: Object })
const emit = defineEmits(['remove'])

const { project, assignAssetToShot } = useProject()
const { getShotWarnings } = useValidation()

const expanded = ref(false)
const dropActive = ref(false)

const shotWarnings = computed(() => getShotWarnings(props.shot.id))

const generatedPrompt = computed(() => {
  return generatePrompt(props.shot, project.assets)
})

function isCameraSelected(id) {
  return props.shot.cameraL1.some(m => m.id === id)
}

function toggleCamera(movement) {
  const idx = props.shot.cameraL1.findIndex(m => m.id === movement.id)
  if (idx >= 0) {
    props.shot.cameraL1.splice(idx, 1)
  } else if (props.shot.cameraL1.length < 3) {
    props.shot.cameraL1.push(movement)
  }
}

function getAssetTag(assetId) {
  const a = project.assets.find(x => x.id === assetId)
  if (!a) return '?'
  const prefix = a.type === 'image' ? 'Img' : a.type === 'video' ? 'Vid' : 'Aud'
  return `@${prefix}${a.tagIndex}`
}

function getAssetName(assetId) {
  return project.assets.find(x => x.id === assetId)?.name || '(已删除)'
}

function getRolesForAsset(assetId) {
  const a = project.assets.find(x => x.id === assetId)
  if (!a) return []
  return ASSET_ROLES[a.type] || []
}

function removeAssignment(idx) {
  props.shot.assignedAssets.splice(idx, 1)
}

function onDragOver(e) {
  try {
    dropActive.value = true
  } catch (_) {}
}

function onDrop(e) {
  dropActive.value = false
  try {
    const data = JSON.parse(e.dataTransfer.getData('application/json'))
    if (data.type === 'asset') {
      const asset = project.assets.find(a => a.id === data.assetId)
      if (!asset) return

      // Logic to auto-populate frames for images
      if (asset.type === 'image') {
        if (!props.shot.firstFrameUrl) {
          props.shot.firstFrameUrl = asset.url
        } else if (!props.shot.lastFrameUrl) {
          props.shot.lastFrameUrl = asset.url
        }
      }

      // Add to assigned assets if not already there
      const exists = props.shot.assignedAssets.find(a => a.assetId === data.assetId)
      if (!exists) {
        props.shot.assignedAssets.push({ assetId: data.assetId, role: '' })
      }
      
      // Auto-expand if dropping (visual feedback)
      expanded.value = true
    }
  } catch (_) {}
}

function copyPrompt() {
  navigator.clipboard.writeText(generatedPrompt.value)
}

// --- Generation Mode ---
const { isGenMode, optimizePrompt, submitGeneration, pollGeneration } = useBackend()
const optimizing = ref(false)
const generating = ref(false)
const genStatus = ref('')
const genResultUrl = ref('')
const genStatusClass = computed(() => {
  if (genStatus.value.includes('失败') || genStatus.value.includes('错误')) return 'bg-red-50 text-red-600'
  if (genStatus.value.includes('完成')) return 'bg-green-50 text-green-600'
  return 'bg-blue-50 text-blue-600'
})

async function handleOptimize() {
  optimizing.value = true
  try {
    const context = [
      props.shot.shotType?.label,
      `${props.shot.duration}s`,
      props.shot.cameraL1?.map(c => c.label).join('+'),
    ].filter(Boolean).join(', ')
    const result = await optimizePrompt(props.shot.description || generatedPrompt.value, context)
    props.shot.description = result
  } catch (e) {
    genStatus.value = `优化失败: ${e.message}`
  } finally {
    optimizing.value = false
  }
}

async function handleGenerate() {
  generating.value = true
  genStatus.value = '提交生成任务...'
  genResultUrl.value = ''
  try {
    const res = await submitGeneration(
      props.shot.id,
      generatedPrompt.value,
      props.shot.duration,
      project.aspectRatio || '16:9',
    )
    const taskId = res.task_id
    genStatus.value = `已提交，任务ID: ${taskId}，轮询中...`

    // Poll every 5s, max 60 times (5 min)
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000))
      const poll = await pollGeneration(taskId)
      if (poll.status === 'completed' || poll.status === 'succeeded') {
        genResultUrl.value = poll.result_url || ''
        genStatus.value = '生成完成!'
        return
      } else if (poll.status === 'failed') {
        genStatus.value = `生成失败: ${poll.error || '未知错误'}`
        return
      }
      genStatus.value = `状态: ${poll.status}... (${i + 1}/60)`
    }
    genStatus.value = '超时，请在即梦平台查看结果'
  } catch (e) {
    genStatus.value = `错误: ${e.message}`
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-dim);
  letter-spacing: 0.01em;
}

.text-input {
  width: 100%;
  font-size: 11px;
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--color-text);
  transition: all 0.2s;
}
.text-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-subtle);
  outline: none;
}

.select-input {
  width: 100%;
  font-size: 11px;
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  padding: 5px 8px;
  color: var(--color-text);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.select-input:hover {
  border-color: var(--color-border);
}

.chip-btn {
  font-size: 10px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.chip-btn-inactive {
  background: white;
  border-color: var(--color-border-light);
  color: var(--color-text-dim);
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.chip-btn-inactive:hover {
  border-color: var(--color-border);
  color: var(--color-text);
  transform: translateY(-1px);
}
.chip-btn-active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.chip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E5EA;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #D1D1D6;
}
</style>
