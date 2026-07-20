#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

install_node() {
  echo "未检测到 npm，尝试安装 Node.js（含 npm）…"

  if command -v brew >/dev/null 2>&1; then
    brew install node
  elif command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y nodejs npm
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y nodejs npm
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y nodejs npm
  elif command -v pacman >/dev/null 2>&1; then
    sudo pacman -Sy --noconfirm nodejs npm
  else
    echo "无法自动安装。请先安装 Node.js（https://nodejs.org/），再重新运行本脚本。"
    exit 1
  fi
}

if ! command -v npm >/dev/null 2>&1; then
  if ! command -v node >/dev/null 2>&1; then
    install_node
  else
    echo "检测到 node，但未找到 npm。请安装完整的 Node.js 发行版后再试。"
    exit 1
  fi
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "安装后仍未找到 npm，请检查 PATH 后重试。"
  exit 1
fi

echo "Node: $(node -v)  npm: $(npm -v)"
echo "安装依赖…"
npm install

echo "启动开发服务器…"
npm run dev
