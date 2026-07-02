#!/bin/zsh
# Node.js가 시스템에 없을 때 ~/.local/node 를 사용합니다.
export PATH="$HOME/.local/node/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js가 없습니다. 먼저 아래 명령을 실행하세요:"
  echo "  curl -fsSL https://nodejs.org/dist/v22.16.0/node-v22.16.0-darwin-arm64.tar.xz | tar -xJ -C ~/.local"
  echo "  ln -sfn ~/.local/node-v22.16.0-darwin-arm64 ~/.local/node"
  exit 1
fi

cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "의존성 설치 중..."
  npm install
fi

npm run dev
