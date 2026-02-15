# SeeDance 2.0 — Seedance 可视化工作流

为 Seedance 2.0 AI 视频生成打造的分镜规划与生成工具。

## 两种使用模式

**规划模式（离线）** — 无需任何 API，零依赖
- 素材库管理（拖拽上传、@编号自动分配、分辨率检测）
- 可视化分镜时间轴（镜头卡片、运镜组合器 L1/L2/L3）
- 音频三轨时间轴（BGM 波形、人声标记、音效标记）
- 提示词自动生成（基于万能模板 + 素材分配）
- 导出 ZIP 包（素材 + 提示词 + 分镜表），手动上传即梦平台

**生成模式（联网）** — 需要后端 + API Key
- AI 智能优化提示词（粗略描述 -> 专业镜头术语）
- 一键调用 Seedance API 生成视频
- 异步轮询 + 结果回显到分镜卡片
- 支持 100+ LLM 提供商（OpenAI / Claude / 豆包 / Ollama 等）

## 快速开始

### 方式一：一键启动（推荐）

```bash
git clone <repo-url>
cd SeeDance2.0
./start.sh
```

浏览器自动打开 `http://127.0.0.1:5210`

### 方式二：Docker

```bash
docker compose up
```

打开 `http://localhost:5210`

### 方式三：纯前端（仅规划模式）

双击 `SeeDance2.0.app`（macOS）或：

```bash
cd app && npm install && npm run dev
```

## 设置 API Key（生成模式）

1. 点击顶栏 ⚙️ 打开设置
2. 填入 Seedance API Key（从即梦/Dreamina 获取）
3. 填入 LLM API Key（可选，用于提示词优化）
4. 切换到"生成模式"即可使用

支持的 LLM 提供商：OpenAI / Claude / Google Gemini / 豆包 / Ollama / 任何 OpenAI 兼容端点

## 技术栈

- **前端**: Vue 3 + TailwindCSS + WaveSurfer.js
- **后端**: FastAPI + LiteLLM + SQLite
- **部署**: Docker Compose / macOS .app / 直接运行

## 项目结构

```
SeeDance2.0/
  app/                 # Vue3 前端
  backend/             # FastAPI 后端
    routers/           # API 路由 (settings, llm, generate)
    services/          # 业务逻辑 (seedance_client, prompt_optimizer)
  docker-compose.yml   # Docker 一键部署
  start.sh             # 本地一键启动
  SeeDance2.0.app/     # macOS 应用（仅规划模式）
```

## License

MIT
