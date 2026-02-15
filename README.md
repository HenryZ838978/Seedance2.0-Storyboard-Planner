<p align="center">
  <img src="https://img.shields.io/badge/SeeDance-2.0-007AFF?style=for-the-badge&labelColor=1D1D1F" />
  <img src="https://img.shields.io/badge/Seedance_2.0-Workflow-8B5CF6?style=for-the-badge&labelColor=1D1D1F" />
  <img src="https://img.shields.io/badge/Vue_3-TailwindCSS-06B6D4?style=for-the-badge&labelColor=1D1D1F" />
  <img src="https://img.shields.io/badge/FastAPI-LiteLLM-009688?style=for-the-badge&labelColor=1D1D1F" />
</p>

<h1 align="center">SeeDance 2.0</h1>

<p align="center">
  <b>Seedance 2.0 可视化分镜工作流</b><br/>
  从创意规划到视频生成的一站式前期制作工具
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> ·
  <a href="#功能特性">功能特性</a> ·
  <a href="#双模式设计">双模式</a> ·
  <a href="#技术架构">技术架构</a> ·
  <a href="#部署方式">部署</a>
</p>

---

## 为什么需要这个工具？

Seedance 2.0 的多模态参考系统非常强大（@图片 + @视频 + @音频 + 文本），但使用门槛很高：

- 每次生成最多 12 个文件、9 张图 / 3 个视频 / 3 个音频，需要**精确规划素材分配**
- 提示词需要专业的**镜头术语**（Pan / Dolly / Crane / Orbit...），大多数人不会写
- 每段视频最长 15 秒，长内容需要**分镜拼接策略**（尾帧接力 / 接着拍 / 硬切）
- 多镜头项目需要跟踪**角色一致性**、运镜连续性、音频衔接

**SeeDance 2.0 解决这些问题。** 它把你变成导演，而不是提示词工程师。

---

## 功能特性

### 素材库（A区）
- 拖拽上传图片 / 视频 / 音频
- 自动分配 `@Image1` `@Video1` `@Audio1` 标签编号
- 分辨率检测（低于 2K 自动警告）
- 角色标注（主角 / 配角 / 场景 / 道具 / 风格参考）

### 分镜画布（B区）
- 无限画布，Space + 拖拽平移，Ctrl + 滚轮缩放
- 每个镜头卡片包含：
  - 首帧 / 尾帧预览
  - 时长滑块（4-15s）
  - 景别选择（大全景 → 极端特写）
  - **运镜组合器**：L1 基础运动（13种）+ L2 修饰词（速度/情绪/风格）+ L3 经典组合
  - 素材拖拽分配 + @角色指定
  - 转场衔接方式（接着拍 / 尾帧接力 / 硬切 / 交叉溶解 / 闪白 / 甩镜转场）
- **提示词自动生成**：基于万能模板实时拼装 Seedance 提示词

### 音频轨道（C区）
- BGM 波形可视化（WaveSurfer.js）
- 人声标记轨 + 音效标记轨
- 三轨与分镜时间轴对齐

### 实时校验
- 12 文件上限 / 9 图 / 3 视频 / 3 音频
- 时长范围 4-15s
- 运镜组合不超过 3 种
- 角色一致性检查

### 导出
- 一键导出 ZIP（素材文件夹 + 每镜头提示词 + 分镜表 Markdown + 音频后期计划）
- 项目 JSON 导入 / 导出 + localStorage 自动保存

---

## 双模式设计

参考 TRAE IDE 的模式切换思路：

### 📋 规划模式（离线，零依赖）
- 无需任何 API Key，无需后端
- 全部分镜规划功能可用
- 导出 ZIP → 手动上传即梦平台

### ⚡ 生成模式（联网，需 API Key）
- **AI 优化提示词**：粗略描述 → LLM 自动补充专业镜头术语
- **一键生成视频**：调用 Seedance API，异步轮询，结果回显到卡片
- 支持 100+ LLM 提供商（通过 LiteLLM 统一网关）：
  - OpenAI / Claude / Google Gemini / 豆包 / DeepSeek
  - Ollama（本地部署）/ 任何 OpenAI 兼容端点

---

## 快速开始

### 方式一：一键启动（推荐）

```bash
git clone https://github.com/YOUR_USERNAME/SeeDance2.0.git
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

```bash
cd app
npm install
npm run dev
```

### 方式四：macOS 双击启动（仅规划模式）

双击 `SeeDance2.0.app` 即可

---

## 设置 API Key

1. 点击顶栏 ⚙️ 打开设置
2. 填入 **Seedance API Key**（从 [即梦](https://jimeng.jianying.com) / [Dreamina](https://dreamina.capcut.com) 获取）
3. 填入 **LLM API Key**（可选，用于提示词优化）
4. 切换到"⚡ 生成模式"

API Key 使用 Fernet 对称加密存储在本地 SQLite 中，不上传任何服务器。

---

## 技术架构

```
┌─────────────────────────────────────────────┐
│  Vue 3 + TailwindCSS + WaveSurfer.js        │  ← 前端
│  ModeSwitch / Storyboard / AudioTracks      │
├─────────────────────────────────────────────┤
│  FastAPI + LiteLLM + SQLite                 │  ← 后端
│  /api/settings  /api/llm  /api/generate     │
├─────────────────────────────────────────────┤
│  Seedance API    LLM API (100+ providers)   │  ← 外部服务
└─────────────────────────────────────────────┘
```

### 项目结构

```
SeeDance2.0/
├── app/                    # Vue 3 前端
│   ├── src/
│   │   ├── components/     # UI 组件
│   │   ├── composables/    # 状态管理 (useProject, useBackend, useValidation)
│   │   └── data/           # 镜头运动数据库 + 提示词模板引擎
│   └── Dockerfile
├── backend/                # FastAPI 后端
│   ├── routers/            # API 路由 (settings, llm, generate)
│   ├── services/           # 业务逻辑 (seedance_client, prompt_optimizer)
│   └── Dockerfile
├── docker-compose.yml      # 一键 Docker 部署
├── start.sh                # 本地一键启动
└── SeeDance2.0.app/        # macOS 应用包（仅规划模式）
```

---

## 运镜知识库

内置完整的 Seedance 2.0 镜头运动系统：

| 层级 | 内容 | 数量 |
|------|------|------|
| L1 基础运动 | Pan / Tilt / Zoom / Dolly / Truck / Crane / Orbit / Arc / Tracking / Static / Push / Pull / Pedestal | 13 种 |
| L2 速度修饰 | Slow / Fast / Subtle / Gradual / Sudden / Smooth | 6 种 |
| L2 情绪修饰 | Cinematic / Aggressive / Dreamy / Intimate / Epic / Dynamic | 6 种 |
| L2 风格修饰 | Handheld / Aerial / Dutch Angle / Gimbal / POV / Steadicam | 6 种 |
| L3 经典组合 | Orbit+Zoom / Crane+Pan / Dolly Zoom / Track+Handheld / Hyperlapse+Orbit / Push+Tilt | 6 种 |

---

## Roadmap

- [x] v1.0 — 纯前端 MVP（分镜规划 + 提示词生成 + ZIP 导出）
- [x] v2.0 — 双模式架构（FastAPI 后端 + LiteLLM + Seedance API 对接）
- [ ] v2.1 — 接入即梦官方 API（2026.02 下旬开放）
- [ ] v2.2 — 多项目管理 + 协作功能
- [ ] v3.0 — 全链路 Agent（自动分镜 + 自动生成 + 自动拼接 + 音频后期）

---

## License

MIT

---

<p align="center">
  <sub>Built for creators who think in shots, not prompts.</sub>
</p>
