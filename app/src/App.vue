<template>
  <div class="app-layout flex flex-col h-screen bg-[#F5F5F7] text-[#1D1D1F]">
    <!-- Top Bar -->
    <header class="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-[#D1D1D6] bg-white z-50">
      <div class="flex items-center gap-3">
        <h1 class="text-sm font-bold tracking-tight flex items-center gap-2">
          <span class="text-[#007AFF]">SeeDance</span>
          <span class="opacity-50">2.0</span>
        </h1>
        <div class="h-4 w-px bg-[#E5E5EA]"></div>
        <ModeSwitch @open-settings="showSettings = true" />
        <div class="h-4 w-px bg-[#E5E5EA]"></div>
        <input
          v-model="project.name"
          class="bg-transparent text-xs font-medium text-[#1D1D1F] placeholder-[#86868B] outline-none min-w-[150px] transition-colors focus:text-[#007AFF]"
          placeholder="未命名项目"
        />
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model="project.aspectRatio"
          class="text-[10px] bg-[#F5F5F7] border border-[#E5E5EA] rounded px-2 py-1 text-[#1D1D1F] outline-none cursor-pointer"
        >
          <option v-for="ar in ASPECT_RATIOS" :key="ar.id" :value="ar.id">{{ ar.label }}</option>
        </select>

        <div class="h-4 w-px bg-[#E5E5EA]"></div>

        <button
          @click="saveProject"
          class="px-2 py-1 text-[10px] rounded border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#1D1D1F] transition-all"
        >
          💾 保存
        </button>

        <label
          class="px-2 py-1 text-[10px] rounded border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#1D1D1F] transition-all cursor-pointer"
        >
          📂 导入
          <input type="file" accept=".json" class="hidden" @change="importProject" />
        </label>

        <button
          @click="showExport = true"
          class="px-3 py-1 text-[10px] font-medium rounded bg-[#007AFF] text-white hover:bg-[#0051A8] transition-all"
        >
          📦 导出
        </button>

        <button
          @click="showSettings = true"
          class="px-2 py-1 text-[10px] rounded border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#1D1D1F] transition-all"
          title="设置 API Key"
        >
          ⚙️
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar: Assets -->
      <AssetLibrary />

      <!-- Right Area: Infinite Canvas -->
      <CanvasView />
    </div>

    <!-- Validator Bar (Floating) -->
    <ValidatorBar />

    <!-- Export Modal -->
    <ExportPanel :visible="showExport" @close="showExport = false" />

    <!-- Settings Modal -->
    <SettingsPanel :visible="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useProject } from './composables/useProject'
import { ASPECT_RATIOS } from './data/cameraMovements'
import AssetLibrary from './components/AssetLibrary.vue'
import CanvasView from './components/CanvasView.vue'
import ValidatorBar from './components/ValidatorBar.vue'
import ExportPanel from './components/ExportPanel.vue'
import ModeSwitch from './components/ModeSwitch.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const { project, saveProject } = useProject()
const showExport = ref(false)
const showSettings = ref(false)

function importProject(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      Object.assign(project, data)
      alert('项目导入成功')
    } catch (err) {
      alert('导入失败: ' + err.message)
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>
