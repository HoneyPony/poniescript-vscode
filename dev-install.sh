TARGET_DIR="$HOME/.vscode-server/extensions/poniescript-vscode"

npm run compile

rm -rf "$TARGET_DIR"
cp -a . "$TARGET_DIR"