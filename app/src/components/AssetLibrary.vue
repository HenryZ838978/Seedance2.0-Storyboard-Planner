<template>
  <div class="asset-library h-full flex flex-col bg-[#F5F5F7] border-r border-[#D1D1D6] w-64 flex-shrink-0 z-20">
    <div class="flex items-center justify-between px-4 py-3 border-b border-[#E5E5EA] bg-[#F5F5F7]">
      <h2 class="text-xs font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-2">
        素材库
        <span class="px-2 py-0.5 rounded-full bg-white text-[#1D1D1F] border border-[#E5E5EA] text-[10px] shadow-sm">
          {{ project.assets.length }}
        </span>
      </h2>
      <label
        class="cursor-pointer px-2 py-1 text-xs font-medium rounded-md bg-white border border-[#E5E5EA] text-[#007AFF] shadow-sm hover:border-[#007AFF] active:scale-95 transition-all flex items-center gap-1"
        title="添加素材"
      >
        <span class="text-base leading-none">+</span>
        <input type="file" multiple accept="image/*,video/*,audio/*" class="hidden" @change="handleFileSelect" />
      </label>
    </div>

    <!-- Drop zone -->
    <div
      class="flex-1 overflow-y-auto overflow-x-hidden p-3 transition-all duration-200"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="handleDrop"
      :class="{ 'bg-blue-50 box-shadow-inner': dragOver }"
    >
      <div v-if="project.assets.length === 0" class="h-32 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E5EA] rounded-xl bg-white/50 text-[#86868B] mt-4">
        <div class="text-2xl mb-2 opacity-50">📁</div>
        <div class="text-xs font-medium">拖拽文件到这里</div>
        <div class="text-[10px] mt-1 opacity-60">图片/视频/音频</div>
      </div>

      <div v-else class="grid grid-cols-2 gap-3">
        <div
          v-for="asset in project.assets"
          :key="asset.id"
          class="asset-card relative group cursor-grab hover:shadow-md transition-all duration-200 rounded-lg bg-white border border-[#E5E5EA] overflow-hidden"
          draggable="true"
          @dragstart="onAssetDragStart($event, asset)"
        >
          <!-- Thumbnail -->
          <div class="aspect-square bg-gray-100 relative overflow-hidden group-hover:opacity-95 transition-opacity">
            <img
              v-if="asset.type === 'image'"
              :src="asset.url"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <video
              v-else-if="asset.type === 'video'"
              :src="asset.url"
              class="w-full h-full object-cover"
              muted
              preload="metadata"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-2xl text-[#C7C7CC] bg-gray-50">🎵</div>

            <!-- Type badge -->
            <span class="absolute top-1 left-1 text-[8px] px-1 py-0.5 rounded-full font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm"
              :class="{
                'bg-blue-100 text-blue-700': asset.type === 'image',
                'bg-purple-100 text-purple-700': asset.type === 'video',
                'bg-green-100 text-green-700': asset.type === 'audio',
              }"
            >
              {{ asset.type === 'image' ? '图' : asset.type === 'video' ? '影' : '音' }}
            </span>

            <!-- Delete button -->
            <button
              class="absolute top-1 right-1 w-4 h-4 rounded-full bg-white text-[#FF3B30] text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm border border-black/5 hover:scale-110 transition-all z-10"
              @click.stop="removeAsset(asset.id)"
            >✕</button>
          </div>

          <!-- Info -->
          <div class="p-2 border-t border-[#E5E5EA]">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-mono text-[#007AFF] font-bold bg-blue-50 px-1 rounded">
                @{{ getAssetTagCode(asset) }}
              </span>
              <span v-if="asset.width" class="text-[8px] text-[#FF9500] font-medium" title="低分辨率警告">
                {{ asset.width < 1920 ? '⚠️' : '' }}
              </span>
            </div>
            <div class="text-[10px] truncate font-medium text-[#1D1D1F] mb-1.5" :title="asset.name">{{ asset.name }}</div>
            <select
              v-model="asset.role"
              class="w-full text-[9px] bg-[#F5F5F7] border border-[#E5E5EA] rounded px-1 py-0.5 text-[#1D1D1F] focus:border-[#007AFF] outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="" class="text-[#86868B]">选择角色...</option>
              <option value="protagonist">主角</option>
              <option value="supporting">配角</option>
              <option value="scene">场景</option>
              <option value="prop">道具</option>
              <option value="style_ref">风格参考</option>
              <option value="camera_ref">运镜参考</option>
              <option value="bgm">BGM</option>
              <option value="sfx">音效</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useProject } from '../composables/useProject'

const { project, addAsset, removeAsset } = useProject()
const dragOver = ref(false)

function getAssetTagCode(asset) {
  const prefix = asset.type === 'image' ? 'Img' : asset.type === 'video' ? 'Vid' : 'Aud'
  return `${prefix}${asset.tagIndex}`
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  files.forEach(f => addAsset(f))
  e.target.value = ''
}

function handleDrop(e) {
  dragOver.value = false
  const files = Array.from(e.dataTransfer.files)
  files.forEach(f => addAsset(f))
}

function onAssetDragStart(e, asset) {
  e.dataTransfer.setData('application/json', JSON.stringify({
    type: 'asset',
    assetId: asset.id,
    assetType: asset.type,
  }))
  e.dataTransfer.effectAllowed = 'copy'
}
</script>
