#!/bin/bash

# SeeDance 2.0 一键重新打包脚本
# 用法: ./rebuild.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$SCRIPT_DIR/app"
APP_BUNDLE="$SCRIPT_DIR/SeeDance2.0.app"

echo "=== SeeDance 2.0 重新打包 ==="

# 1. 构建前端
echo "[1/4] 构建前端..."
cd "$APP_DIR"
npx vite build

# 2. 更新 dist 到 .app
echo "[2/4] 更新 .app 资源..."
rm -rf "$APP_BUNDLE/Contents/Resources/dist"
cp -R "$APP_DIR/dist" "$APP_BUNDLE/Contents/Resources/dist"

# 3. 重新签名
echo "[3/4] 重新签名..."
codesign --force --deep -s - "$APP_BUNDLE"

# 4. 完成
echo "[4/4] 完成!"
echo ""
echo "应用位置: $APP_BUNDLE"
echo "双击即可启动，或运行: open \"$APP_BUNDLE\""
echo ""
APP_SIZE=$(du -sh "$APP_BUNDLE" | cut -f1)
echo "应用大小: $APP_SIZE"
