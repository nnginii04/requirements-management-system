#!/bin/zsh
export PATH="$HOME/.local/node/bin:$PATH"
cd "$(dirname "$0")"
[ ! -d node_modules ] && npm install
npm run dev:all
