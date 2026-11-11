/* =====================================================================
   热更新：不用重新提交 App Store，就能更新 www/ 里的内容（关卡、玩法、界面、文字）。

   App 每次启动时到 GitHub 读 updates/latest.json，里面写着最新的网页版本号。
   比手机上的新，就在后台下载新版本的压缩包；等下次重新打开 App（冷启动）时，
   在首页出来之前切换过去。玩的过程中绝不切换，不会打断游戏。

   新版本启动失败（10 秒内没走到 notifyAppReady），插件会自动退回原来的版本，
   这里会把这个版本号记下来，以后不再下载它。

   发布新版本：npm run publish-update（见 scripts/publish-update.sh）
   只在 iOS App 里运行，浏览器里什么都不做。
   ===================================================================== */
(() => {
const MANIFEST_URL = 'https://raw.githubusercontent.com/sslcandoit/sum-pop/main/updates/latest.json';
const PENDING_KEY  = 'ccs.update.pending';    // 已下载好、等下次启动再切换的版本 { id, version }
const APPLYING_KEY = 'ccs.update.applying';   // 正在切换过去的版本号，启动后用来判断切换成功没有
const BAD_KEY      = 'ccs.update.bad';        // 启动失败、被退回的版本号，不再下载

const Updater = window.Capacitor?.Plugins?.CapacitorUpdater;
if (!Updater || !window.Capacitor.isNativePlatform?.()) return;

// 告诉插件"这个版本能正常启动"。要尽早调用，不能放在网络请求后面
Updater.notifyAppReady();

const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } };
const set = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };

// 上次启动时切换去了新版本：现在跑的如果还是旧版本，说明新版本启动失败、被插件退回了
const applying = get(APPLYING_KEY, null);
if (applying != null){
  if (WEB_VERSION < applying) set(BAD_KEY, [...new Set([...get(BAD_KEY, []), applying])]);
  set(APPLYING_KEY, null);
}

// 冷启动：上次已经下载好了新版本，趁首页还没出来切换过去
const pending = get(PENDING_KEY, null);
set(PENDING_KEY, null);
if (pending && pending.version > WEB_VERSION && !get(BAD_KEY, []).includes(pending.version)){
  document.documentElement.style.visibility = 'hidden';   // 切换前不闪一下旧页面
  set(APPLYING_KEY, pending.version);
  Updater.set({ id: pending.id }).catch(() => {             // 切换失败就照常用现在的版本
    set(APPLYING_KEY, null);
    document.documentElement.style.visibility = '';
  });
  return;
}

// "1.10" 和 "1.9" 这种版本号按数字比较
function cmpVersion(a, b){
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++){ const d = (x[i] || 0) - (y[i] || 0); if (d) return d; }
  return 0;
}

async function check(){
  try {
    const res = await fetch(MANIFEST_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return;
    const m = await res.json();
    if (!(m.version > WEB_VERSION) || get(BAD_KEY, []).includes(m.version)) return;
    // 这个网页版本要求更新的 App 本身（比如用到了新的原生插件），旧 App 就不下载
    const { native } = await Updater.current();
    if (m.minNative && cmpVersion(native, m.minNative) < 0) return;
    // 已经下载过（下载完还没重启）就不重复下载
    const { bundles } = await Updater.list();
    let b = bundles.find(x => x.version === String(m.version) && (x.status === 'pending' || x.status === 'success'));
    if (!b) b = await Updater.download({ url: m.url, version: String(m.version), checksum: m.sha256 });
    set(PENDING_KEY, { id: b.id, version: m.version });
  } catch(e){
    console.warn('[update] check failed', e);
  }
}
check();
})();
