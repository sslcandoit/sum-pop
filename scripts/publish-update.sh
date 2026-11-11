#!/bin/bash
# 发布热更新：把 www/ 打包成一个新版本，传到 GitHub Releases，再更新 updates/latest.json。
# 已经装了 App 的手机下次打开时会在后台下载，再下次打开时用上新版本，不用经过 App Store 审核。
#
# 用法：npm run publish-update -- "这次更新了什么"
# 先把 www/ 的改动提交（commit）好，并在浏览器里打开 www/index.html?check 确认关卡配置没问题。
#
# 可选：MIN_NATIVE=1.1 npm run publish-update -- "..."
#   这次的网页代码需要新版 App（比如加了新的原生插件）时用，旧版 App 就不会下载它。
#   不写就沿用上一次的设置。
set -euo pipefail
cd "$(dirname "$0")/.."

NOTES="${1:-}"
REPO="sslcandoit/sum-pop"
MANIFEST="updates/latest.json"

# ---------- 检查 ----------
command -v gh >/dev/null || { echo "需要 GitHub CLI：brew install gh，然后 gh auth login"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "GitHub 还没登录：gh auth login"; exit 1; }
[ "$(git branch --show-current)" = main ] || { echo "请在 main 分支上发布"; exit 1; }
if [ -n "$(git status --porcelain)" ]; then
  echo "还有没提交的改动，请先 commit："; git status --short; exit 1
fi
git pull --ff-only -q

# ---------- 新版本号 ----------
CUR=$(sed -nE 's/^const WEB_VERSION = ([0-9]+);/\1/p' www/version.js)
[ -n "$CUR" ] || { echo "www/version.js 里找不到 WEB_VERSION"; exit 1; }
NEW=$((CUR + 1))
TAG="web-$NEW"
MIN_NATIVE="${MIN_NATIVE:-$(python3 -c "import json;print(json.load(open('$MANIFEST')).get('minNative','1.0'))" 2>/dev/null || echo 1.0)}"
echo "发布网页版本 $NEW（上一版 $CUR），需要 App 版本 ≥ $MIN_NATIVE"

sed -i '' -E "s/^const WEB_VERSION = [0-9]+;/const WEB_VERSION = $NEW;/" www/version.js
git commit -q -m "Web update $NEW${NOTES:+: $NOTES}" -- www/version.js
git push -q

# ---------- 打包：index.html 要在压缩包的最外层 ----------
mkdir -p build
ZIP="build/www-$NEW.zip"
rm -f "$ZIP"
(cd www && zip -q -r -X "../$ZIP" . -x '.DS_Store' '*/.DS_Store')
SHA=$(shasum -a 256 "$ZIP" | cut -d' ' -f1)

gh release create "$TAG" "$ZIP" --repo "$REPO" --target main \
  --title "Web update $NEW" --notes "${NOTES:-Web content update $NEW}" >/dev/null
URL="https://github.com/$REPO/releases/download/$TAG/www-$NEW.zip"

# ---------- 最后才更新 latest.json：压缩包已经传好，手机读到新版本号时一定能下载到 ----------
python3 - "$MANIFEST" "$NEW" "$URL" "$SHA" "$MIN_NATIVE" "$NOTES" <<'EOF'
import json, sys, datetime
path, ver, url, sha, min_native, notes = sys.argv[1:]
json.dump({ 'version': int(ver), 'url': url, 'sha256': sha, 'minNative': min_native,
            'notes': notes, 'published': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ') },
          open(path, 'w'), indent=2, ensure_ascii=False)
open(path, 'a').write('\n')
EOF
git commit -q -m "Point $MANIFEST at web update $NEW" -- "$MANIFEST"
git push -q

echo "✓ 已发布网页版本 $NEW：$URL"
echo "  手机打开 App 后会在后台下载，下次打开时生效（GitHub 的缓存可能让手机晚几分钟才看到）。"
