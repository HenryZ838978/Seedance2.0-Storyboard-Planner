<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl border border-[#E5E5EA] w-[520px] max-h-[80vh] overflow-y-auto shadow-2xl">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-[#E5E5EA] flex items-center justify-between">
        <h3 class="text-sm font-bold text-[#1D1D1F]">设置</h3>
        <button @click="$emit('close')" class="text-[#86868B] hover:text-[#1D1D1F] text-lg">&times;</button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Connection Status -->
        <div class="flex items-center gap-3 p-3 rounded-xl" :class="state.backendOnline ? 'bg-green-50' : 'bg-orange-50'">
          <div class="w-2.5 h-2.5 rounded-full" :class="state.backendOnline ? 'bg-green-500' : 'bg-orange-500'"></div>
          <div>
            <div class="text-xs font-semibold" :class="state.backendOnline ? 'text-green-700' : 'text-orange-700'">
              {{ state.backendOnline ? '后端已连接' : '后端未连接' }}
            </div>
            <div v-if="!state.backendOnline" class="text-[10px] text-orange-600 mt-0.5">
              请启动后端服务: python backend/main.py 或 docker compose up
            </div>
          </div>
          <button @click="checkBackend" class="ml-auto text-[10px] px-2 py-1 rounded border border-[#E5E5EA] hover:bg-[#F5F5F7]">
            {{ state.checking ? '检查中...' : '刷新' }}
          </button>
        </div>

        <!-- Seedance API -->
        <section>
          <h4 class="text-xs font-bold text-[#1D1D1F] mb-2 flex items-center gap-2">
            🎬 Seedance API
            <span v-if="state.seedanceConfigured" class="text-[10px] font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded">已配置</span>
          </h4>
          <div class="space-y-2">
            <SettingRow label="API Key" setting-key="seedance_api_key" type="password" placeholder="sk-..." />
            <SettingRow label="API 地址 (可选)" setting-key="seedance_base_url" placeholder="https://api.dreamina.capcut.com" />
          </div>
        </section>

        <!-- LLM API -->
        <section>
          <h4 class="text-xs font-bold text-[#1D1D1F] mb-2 flex items-center gap-2">
            🧠 LLM 提示词优化
            <span v-if="state.llmConfigured" class="text-[10px] font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded">已配置</span>
          </h4>
          <div class="space-y-2">
            <SettingRow label="API Key" setting-key="llm_api_key" type="password" placeholder="sk-..." />
            <div class="grid grid-cols-2 gap-2">
              <SettingRow label="提供商" setting-key="llm_provider" placeholder="openai" />
              <SettingRow label="模型" setting-key="llm_model" placeholder="gpt-4o-mini" />
            </div>
            <SettingRow label="自定义端点 (可选)" setting-key="llm_base_url" placeholder="http://localhost:11434" />
          </div>
        </section>

        <!-- Help -->
        <section class="text-[10px] text-[#86868B] space-y-1 pt-2 border-t border-[#E5E5EA]">
          <p><strong>规划模式</strong> — 无需 API，离线使用全部分镜规划功能，导出 ZIP 手动上传即梦。</p>
          <p><strong>生成模式</strong> — 需要后端运行 + API Key，支持一键优化提示词和直接生成视频。</p>
          <p>支持的 LLM 提供商：OpenAI / Claude / 豆包 / Gemini / Ollama（本地）/ 任何 OpenAI 兼容端点。</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBackend } from '../composables/useBackend'
import SettingRow from './SettingRow.vue'

defineProps({ visible: Boolean })
defineEmits(['close'])

const { state, checkBackend } = useBackend()
</script>
