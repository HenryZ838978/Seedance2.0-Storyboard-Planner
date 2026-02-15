<template>
  <div class="storyboard-track flex gap-6 items-start pb-4">
    <!-- Empty State -->
    <div v-if="project.shots.length === 0" class="flex flex-col items-center justify-center w-[800px] h-[300px] border-2 border-dashed border-[#D1D1D6] rounded-2xl bg-white/50 mx-auto mt-10">
      <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm border border-[#E5E5EA]">
        <span class="text-3xl opacity-50">🎬</span>
      </div>
      <h3 class="text-sm font-semibold text-[#1D1D1F] mb-1">开始创作您的分镜</h3>
      <p class="text-xs text-[#86868B] max-w-[200px] text-center leading-relaxed">
        点击右上角“添加分镜”开始规划。<br>支持拖拽排序。
      </p>
      <button
        @click="addShot"
        class="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-white border border-[#E5E5EA] text-[#007AFF] shadow-sm hover:border-[#007AFF] transition-all"
      >
        创建第一个分镜
      </button>
    </div>

    <!-- Shot List -->
    <template v-else>
      <template v-for="(shot, idx) in project.shots" :key="shot.id">
        <!-- Shot Card Wrapper -->
        <div class="flex flex-col gap-3 group/shot-wrapper relative">
          <div class="flex items-center justify-between px-1">
            <div class="text-[10px] font-bold font-mono text-[#86868B] uppercase tracking-wider">
              SHOT {{ (idx + 1).toString().padStart(2, '0') }}
            </div>
            <!-- Quick Delete Action -->
            <button 
              @click.stop="removeShot(shot.id)"
              class="opacity-0 group-hover/shot-wrapper:opacity-100 text-[10px] text-[#FF3B30] hover:bg-red-50 px-1.5 py-0.5 rounded transition-all"
            >
              删除
            </button>
          </div>
          
          <ShotCard
            :shot="shot"
            @remove="removeShot"
          />
        </div>

        <!-- Transition Indicator -->
        <div
          v-if="idx < project.shots.length - 1"
          class="flex-shrink-0 flex flex-col items-center justify-center self-center gap-2 px-2 opacity-60 group hover:opacity-100 transition-opacity"
        >
          <div class="w-8 h-8 rounded-full bg-white border border-[#E5E5EA] flex items-center justify-center shadow-sm text-[#86868B] group-hover:border-[#007AFF] group-hover:text-[#007AFF] transition-colors cursor-pointer hover:scale-110 duration-200">
            {{ shot.transitionType?.icon || '→' }}
          </div>
          <div class="text-[9px] font-medium text-[#C7C7CC] text-center max-w-[60px] truncate group-hover:text-[#86868B] transition-colors">
            {{ shot.transitionType?.label || '硬切' }}
          </div>
        </div>
      </template>
      
      <!-- Add Button at end -->
      <button
        @click="addShot"
        class="flex-shrink-0 w-16 h-[200px] mt-[26px] rounded-2xl border-2 border-dashed border-[#E5E5EA] hover:border-[#007AFF] hover:bg-blue-50 text-[#C7C7CC] hover:text-[#007AFF] flex items-center justify-center transition-all group backdrop-blur-sm"
        title="添加分镜"
      >
        <span class="text-3xl group-hover:scale-110 transition-transform font-light">+</span>
      </button>
    </template>
  </div>
</template>

<script setup>
import { useProject } from '../composables/useProject'
import ShotCard from './ShotCard.vue'

const { project, addShot, removeShot } = useProject()
</script>
