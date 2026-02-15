<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[520px] max-h-[85vh] overflow-hidden flex flex-col transform transition-all scale-100">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 class="text-base font-semibold text-[var(--color-text)] tracking-tight">导出项目</h3>
        <button 
          @click="$emit('close')" 
          class="w-7 h-7 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 flex items-center justify-center text-xs transition-colors"
        >✕</button>
      </div>

      <div class="flex-1 overflow-y-auto p-5">
        <!-- Validation Summary -->
        <div v-if="hasErrors" class="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <div class="flex items-center gap-2 text-xs font-semibold text-red-600 mb-1.5">
            <span class="text-sm">🛑</span> 存在错误
          </div>
          <ul class="list-disc list-inside space-y-0.5">
            <li v-for="err in errors" :key="err.msg" class="text-[11px] text-red-500">{{ err.msg }}</li>
          </ul>
        </div>

        <div v-if="warnings.filter(w => w.level === 'warn').length" class="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <div class="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1.5">
            <span class="text-sm">⚠️</span> 警告
          </div>
          <ul class="list-disc list-inside space-y-0.5">
            <li v-for="w in warnings.filter(w => w.level === 'warn')" :key="w.msg" class="text-[11px] text-amber-600">{{ w.msg }}</li>
          </ul>
        </div>

        <!-- Export Preview -->
        <div class="space-y-2">
          <div class="text-xs font-medium text-[var(--color-text-dim)] uppercase tracking-wide">包内容预览</div>

          <div class="bg-gray-50 rounded-lg border border-gray-200 p-4 text-[11px] font-mono text-[var(--color-text)]">
            <div class="flex items-center gap-2 mb-2 font-semibold">
              <span class="text-lg">📦</span> {{ project.name || 'Project' }}.zip
            </div>
            
            <div class="pl-6 space-y-1.5 border-l border-gray-200 ml-2">
              <div class="flex items-start gap-2">
                <span class="opacity-50">📁</span> 
                <span>assets/</span>
                <span class="text-[var(--color-text-dim)] text-[10px]">({{ project.assets.length }} 个文件)</span>
              </div>
              
              <div class="flex items-start gap-2">
                <span class="opacity-50">📁</span> 
                <span>prompts/</span>
                <span class="text-[var(--color-text-dim)] text-[10px]">({{ project.shots.length }} 个文本文件)</span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="opacity-50">📄</span> 
                <span>project.json</span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="opacity-50">📄</span> 
                <span>storyboard.md</span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="opacity-50">📄</span> 
                <span>audio_plan.md</span>
              </div>
            </div>
          </div>

          <!-- Storyboard Preview -->
          <div class="pt-2">
            <details class="group">
              <summary class="cursor-pointer text-xs font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1 transition-colors select-none">
                <span class="transform transition-transform group-open:rotate-90">▸</span> 预览分镜表 Markdown
              </summary>
              <div class="mt-2 relative">
                <pre class="p-3 bg-gray-800 text-gray-200 rounded-lg text-[10px] overflow-x-auto whitespace-pre-wrap max-h-[200px] border border-gray-700 shadow-inner scrollbar-dark">{{ storyboardMarkdown }}</pre>
              </div>
            </details>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3">
        <button
          @click="exportZip"
          class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg bg-[var(--color-accent)] text-white shadow-sm hover:bg-[var(--color-accent-hover)] hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          :disabled="exporting"
          :class="{ 'opacity-70 cursor-wait': exporting }"
        >
          <span v-if="exporting" class="animate-spin text-lg">◌</span>
          <span v-else class="text-base">📦</span>
          {{ exporting ? '正在打包...' : '下载 ZIP 压缩包' }}
        </button>
        
        <button
          @click="exportJSON"
          class="py-2.5 px-4 text-sm font-medium rounded-lg bg-white border border-gray-200 text-[var(--color-text)] shadow-sm hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <span class="text-base">💾</span> 保存 JSON
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProject } from '../composables/useProject'
import { useValidation } from '../composables/useValidation'
import { generatePrompt } from '../data/promptTemplates'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])

const { project, exportProjectJSON } = useProject()
const { warnings, errors, hasErrors } = useValidation()

const exporting = ref(false)

function getAssetFileName(asset) {
  const prefix = asset.type === 'image' ? 'Img' : asset.type === 'video' ? 'Vid' : 'Aud'
  const ext = asset.name.split('.').pop()
  return `@${prefix}${asset.tagIndex}_${asset.role || 'untagged'}.${ext}`
}

const storyboardMarkdown = computed(() => {
  let md = `# ${project.name} - 分镜表\n\n`
  md += `画幅: ${project.aspectRatio} | 总时长: ${project.shots.reduce((s, sh) => s + sh.duration, 0)}s | 镜头数: ${project.shots.length}\n\n`
  md += `---\n\n`

  for (const shot of project.shots) {
    md += `## ${shot.name} (${shot.duration}s)\n\n`
    if (shot.shotType) md += `**景别:** ${shot.shotType.label}\n`
    if (shot.description) md += `**场景:** ${shot.description}\n`
    if (shot.cameraL1.length) md += `**运镜:** ${shot.cameraL1.map(c => c.label).join(' + ')}\n`
    if (shot.cameraSpeed) md += `**速度:** ${shot.cameraSpeed.label}\n`
    if (shot.cameraMood) md += `**情绪:** ${shot.cameraMood.label}\n`
    if (shot.cameraStyle) md += `**风格:** ${shot.cameraStyle.label}\n`
    if (shot.lighting) md += `**光线:** ${shot.lighting}\n`
    if (shot.transitionType) md += `**衔接:** ${shot.transitionType.label} - ${shot.transitionType.desc}\n`

    const prompt = generatePrompt(shot, project.assets)
    if (prompt) md += `\n**提示词:**\n\`\`\`\n${prompt}\n\`\`\`\n`

    md += `\n---\n\n`
  }
  return md
})

async function exportZip() {
  exporting.value = true
  try {
    const JSZip = (await import('jszip')).default
    const { saveAs } = await import('file-saver')
    const zip = new JSZip()

    // Assets folder
    const assetsFolder = zip.folder('assets')
    for (const asset of project.assets) {
      if (asset.file) {
        const fileName = getAssetFileName(asset)
        assetsFolder.file(fileName, asset.file)
      }
    }

    // Prompts folder
    const promptsFolder = zip.folder('prompts')
    for (const shot of project.shots) {
      const prompt = generatePrompt(shot, project.assets)
      promptsFolder.file(`shot_${shot.index + 1}_prompt.txt`, prompt || '(Empty)')
    }

    // Project JSON
    zip.file('project.json', exportProjectJSON())

    // Storyboard markdown
    zip.file('storyboard.md', storyboardMarkdown.value)

    // Audio plan
    zip.file('audio_plan.md', generateAudioPlan())

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `${project.name || 'seedance-project'}.zip`)
  } catch (e) {
    console.error('Export failed:', e)
    alert('Export failed: ' + e.message)
  } finally {
    exporting.value = false
  }
}

function exportJSON() {
  const blob = new Blob([exportProjectJSON()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name || 'seedance-project'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function generateAudioPlan() {
  let md = `# 音频后期计划\n\n`
  md += `**策略:** ${project.audioStrategy === 'split' ? '视音分离 (推荐)' : '原生音频'}\n\n`

  if (project.audioTracks.bgm) {
    md += `## BGM\n- 文件: ${project.audioTracks.bgm.name}\n- 处理: 全程铺底，不随镜头中断\n\n`
  } else {
    md += `## BGM\n- 待定: 需生成或选择 BGM (推荐: Suno/Udio)\n\n`
  }

  md += `## 人声标记\n`
  if (project.audioTracks.voice.length === 0) {
    md += `- 无人声标记\n\n`
  } else {
    for (const v of project.audioTracks.voice) {
      md += `- [${v.time.toFixed(1)}s] "${v.text}"\n`
    }
    md += `\n`
  }

  md += `## 音效标记\n`
  if (project.audioTracks.sfx.length === 0) {
    md += `- 无音效标记\n\n`
  } else {
    for (const s of project.audioTracks.sfx) {
      md += `- [${s.time.toFixed(1)}s] ${s.label}\n`
    }
    md += `\n`
  }

  md += `## 推荐工具\n`
  md += `- 人声: ElevenLabs / ChatTTS\n`
  md += `- BGM: Suno / Udio / 版权音乐库\n`
  md += `- 音效: ElevenLabs SFX / Freesound\n`
  md += `- 混音: 剪映 / 达芬奇 / Adobe Premiere\n`
  return md
}
</script>

<style scoped>
.scrollbar-dark::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.scrollbar-dark::-webkit-scrollbar-track {
  background: #374151;
}
.scrollbar-dark::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}
.cursor-wait {
  cursor: wait;
}
</style>
