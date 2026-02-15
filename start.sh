#!/bin/bash
# SeeDance 2.0 一键启动脚本（无需 Docker）
# 用法: ./start.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo "  SeeDance 2.0 可视化工作流"
echo "========================================"

# --- 检查 Python ---
if ! command -v python3 &>/dev/null; then
    echo "错误: 未找到 python3，请先安装 Python 3.10+"
    exit 1
fi

# --- 后端 ---
echo "[1/3] 准备后端..."
cd "$SCRIPT_DIR/backend"
if [ ! -d "venv" ]; then
    echo "  创建虚拟环境..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null

echo "[2/3] 启动后端 (端口 5211)..."
uvicorn main:app --host 127.0.0.1 --port 5211 &
BACKEND_PID=$!
sleep 2

# --- 前端 ---
echo "[3/3] 启动前端 (端口 5210)..."
cd "$SCRIPT_DIR/app"
if [ -d "dist" ]; then
    # 使用已构建的 dist
    cd dist
    python3 -m http.server 5210 --bind 127.0.0.1 &
    FRONTEND_PID=$!
else
    echo "  前端未构建，尝试 npm run dev..."
    npm run dev -- --port 5210 &
    FRONTEND_PID=$!
fi

sleep 1
open "http://127.0.0.1:5210"

echo ""
echo "========================================"
echo "  前端: http://127.0.0.1:5210"
echo "  后端: http://127.0.0.1:5211/docs"
echo ""
echo "  规划模式: 无需 API，离线使用"
echo "  生成模式: 点击 ⚙️ 设置 API Key"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo "========================================"

# Cleanup on exit
cleanup() {
    echo ""
    echo "正在关闭..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup EXIT INT TERM
wait
