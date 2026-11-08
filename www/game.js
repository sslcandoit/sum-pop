(() => {
const PALETTE = ['#FF9E8A','#FFC65C','#FFE27A','#B5E47E','#7FD8B9','#8CCBFF','#A9A6FF','#E0A2F5','#FF9FC6'];
const STAR = 'M12 2l3 6.9 7 .4-5.3 4.7 1.5 7L12 17.3 5.8 21l1.5-7L2 9.3l7-.4z';

/* ---------- 关卡列表：把 levels.js 里按等级分组的配置展开成一条 ----------
   world 是等级序号（1 起），no 是界面上显示的编号，比如 '2-3'，都按顺序自动算 */
const LEVELS = WORLDS.flatMap((w, wi) => w.levels.map((lv, li) =>
  ({ ...DEFAULTS, ...lv, world: wi + 1, no: `${wi + 1}-${li + 1}` })));

/* ---------- 存储（本机） ---------- */
const store = {
  get(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
// 存档按关卡的 key 记录（{ 'first-3': 2, ... }），和关卡在列表里的位置无关
const PROGRESS_KEY = 'ccs.progress.v4';   // 每关拿到的星星数
const BEST_KEY = 'ccs.best.v4';           // 每关历史最高组数
/* 旧存档迁移：v4 之前按位置编号（'1-3'）记录。下面的对照表冻结在 v3 时的关卡顺序，
   以后改关卡不用动它。旧数据留在原处不删，万一要回退版本还能用。 */
function legacyKey(id){
  const [w, n] = id.split('-').map(Number);
  if (w === 1) return `first-${n}`;
  if (w === 2) return `teens-${n + 10}`;
  if (w === 3) return `tens-${n * 10}`;
  return { '4-1':'neg-plusminus', '4-2':'neg-zero', '5-1':'dec-one', '5-2':'dec-five', '5-3':'dec-quarters' }[id];
}
function loadLegacy(v3Key, v2Key, shiftFlag){
  let obj = store.get(v3Key, null);
  if (!obj){   // v2：等级 1、2 还不存在，编号比 v3 少两个等级
    obj = {};
    const old = store.get(v2Key, {});
    Object.keys(old).forEach(id => { const [w, n] = id.split('-'); obj[`${+w + 2}-${n}`] = old[id]; });
  }
  if (!store.get(shiftFlag, false)){   // v3 早期：等级 1 还没有"凑 1"，1-n 要往后挪一关
    const out = {};
    Object.keys(obj).forEach(id => { const [w, n] = id.split('-'); out[w === '1' ? `1-${+n + 1}` : id] = obj[id]; });
    obj = out;
  }
  const out = {};
  Object.keys(obj).forEach(id => { const k = legacyKey(id); if (k) out[k] = obj[id]; });
  return out;
}
function loadRecords(key, ...legacy){
  let v = store.get(key, null);
  if (!v){ v = loadLegacy(...legacy); store.set(key, v); }
  return v;
}
let progress = loadRecords(PROGRESS_KEY, 'ccs.progress.v3', 'ccs.progress.v2', 'ccs.shift1.progress');
let best = loadRecords(BEST_KEY, 'ccs.best.v3', 'ccs.best', 'ccs.shift1.best');
let soundOn  = store.get('ccs.sound', true);
let unlockAll= store.get('ccs.unlockAll', false);
// 测试工具（"解锁全部关卡"按钮）平时对玩家隐藏：快速连点 5 下首页标题打开 / 关上；浏览器里也可以加 ?debug
let devTools = store.get('ccs.devTools', false) || new URLSearchParams(location.search).has('debug');
const sysLang = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();
let lang = store.get('ccs.lang', sysLang.startsWith('zh') ? 'zh' : 'en');
function t(key, ...args){ const v = I18N[lang][key] ?? I18N.en[key]; return typeof v === 'function' ? v(...args) : v; }
function tr(obj){ return obj[lang] ?? obj.en; }
function applyLang(){
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('appName');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  const lb = $('#langBtn'); lb.textContent = t('langSwitch'); lb.lang = lang === 'zh' ? 'en' : 'zh-CN';
}

const $ = s => document.querySelector(s);
const pick = a => a[Math.floor(Math.random()*a.length)];

/* ---------- 数字工具：内部全部用整数（放大 10^dec 倍），避免 0.1+0.2 的浮点误差 ---------- */
let L = null;   // 当前关卡（已换算）
let S = null;   // 当前局面状态
function prep(def, index){
  const dec = def.dec || 0, k = 10**dec, toInt = x => Math.round(x*k);
  const pools = def.pools.map(p => ({ min:toInt(p.min), max:toInt(p.max), step:p.step?toInt(p.step):1, w:p.w||1 }));
  return { ...def, index, dec, T:toInt(def.target), pools,
    allPos: pools.every(p => p.min >= 0), totalW: pools.reduce((a,p)=>a+p.w,0) };
}
function fmt(v, dec){
  let s = (Math.abs(v)/10**dec).toFixed(dec);
  if (dec) s = s.replace(/0+$/,'').replace(/\.$/,'');
  return (v<0 ? '−' : '') + s;
}
function equation(vals){
  return vals.map((v,i) => i>0 && v<0 ? `(${fmt(v,L.dec)})` : fmt(v,L.dec)).join(' + ');
}
// 默认不出现 0 和目标数本身；zero:true 的关卡两者都可以出现（0 + 目标 = 目标）
function allowed(v){ return L.zero || (v !== 0 && v !== L.T); }
function inDomain(v){
  return allowed(v) && L.pools.some(p => v>=p.min && v<=p.max && (v-p.min)%p.step===0);
}
function randVal(){
  for (let t=0; t<50; t++){
    let r = Math.random()*L.totalW, p = L.pools[0];
    for (const q of L.pools){ if (r < q.w){ p=q; break; } r -= q.w; }
    const n = Math.floor((p.max-p.min)/p.step)+1;
    const v = p.min + p.step*Math.floor(Math.random()*n);
    if (allowed(v)) return v;
  }
  return L.pools[0].max;
}

/* ---------- 棋盘 ---------- */
let nextId = 1;
const els = new Map();
function allTiles(){ const out=[]; S.grid.forEach(row=>row.forEach(t=>{ if(t) out.push(t); })); return out; }
function findPos(id){
  for (let r=0;r<L.rows;r++) for (let c=0;c<L.cols;c++){ const t=S.grid[r][c]; if (t && t.id===id) return {r,c,t}; }
  return null;
}
// 生成新数字：一定概率故意生成"能和场上某个数凑成目标"的数，保证手感
function genValue(){
  const pool = allTiles().filter(t => t.v !== null);
  if (pool.length && Math.random() < L.help){
    const a = pick(pool); const comp = L.T - a.v;
    if (L.maxPick>=3 && pool.length>1 && Math.random()<.4){
      const b = pick(pool.filter(x=>x!==a)); const c3 = comp - b.v;
      if (inDomain(c3)) return c3;
    }
    if (inDomain(comp)) return comp;
  }
  return randVal();
}
function fillFresh(fresh){ fresh.forEach(t => { t.v = genValue(); }); }
// 找一组解（给提示用，也用来保证棋盘永远有解）
function findSolution(){
  const cells = allTiles().sort(()=>Math.random()-.5);
  const T=L.T, K=L.maxPick, pos=L.allPos, chosen=[];
  (function dfs(start, sum){
    if (chosen.length>=2 && sum===T) return true;
    if (chosen.length===K) return false;
    for (let i=start;i<cells.length;i++){
      const s = sum + cells[i].v;
      if (pos && s > T) continue;
      chosen.push(cells[i]);
      if (dfs(i+1, s)) return true;
      chosen.pop();
    }
    return false;
  })(0, 0);
  return chosen.length>=2 && chosen.reduce((a,t)=>a+t.v,0)===T ? chosen : null;
}
function ensureSolvable(fresh){
  if (!fresh.length) return;
  for (let t=0; t<80 && !findSolution(); t++){
    const f = pick(fresh), a = pick(allTiles().filter(x=>x!==f));
    const comp = L.T - a.v;
    if (inDomain(comp)) f.v = comp;
  }
}
function collapse(){
  const fresh = [];
  for (let c=0;c<L.cols;c++){
    const col = [];
    for (let r=L.rows-1;r>=0;r--) if (S.grid[r][c]) col.push(S.grid[r][c]);
    const k = L.rows - col.length;
    for (let r=L.rows-1;r>=0;r--){
      const idx = L.rows-1-r;
      if (idx < col.length) S.grid[r][c] = col[idx];
      else { const t = { id:nextId++, v:null, spawn:r-k }; S.grid[r][c] = t; fresh.push(t); }
    }
  }
  fillFresh(fresh); ensureSolvable(fresh);
}

/* ---------- 渲染 ---------- */
const board = $('#board'), boardWrap = $('#boardWrap');
let cell = 60, GAP = 6; const PAD = 8;
// instant = true：尺寸变化（旋转屏幕等）时直接跳到新位置，不播放滑动动画
function layout(instant){
  if (!L) return;
  if (instant) board.classList.add('instant');
  const w = boardWrap.clientWidth, h = boardWrap.clientHeight - 24;
  cell = Math.floor(Math.min((w-2*PAD)/L.cols, (h-2*PAD)/L.rows, 112));
  GAP = cell < 56 ? 4 : 6;
  board.style.width  = (L.cols*cell + 2*PAD) + 'px';
  board.style.height = (L.rows*cell + 2*PAD) + 'px';
  els.forEach(el => sizeTile(el));
  render();
  if (instant) requestAnimationFrame(() => requestAnimationFrame(() => board.classList.remove('instant')));
}
function sizeTile(el){
  const s = cell - GAP; el.style.width = el.style.height = s + 'px';
  const len = el.textContent.length;
  el.firstChild.style.fontSize = (s * (len<=1?.58 : len===2?.48 : len===3?.38 : len===4?.31 : .26)) + 'px';
}
function place(el, r, c){ el.style.transform = `translate(${PAD + c*cell + GAP/2}px, ${PAD + r*cell + GAP/2}px)`; }
function makeTile(t){
  const el = document.createElement('div');
  el.className = 'tile' + (t.v<0 ? ' neg' : '');
  el.dataset.id = t.id;
  const face = document.createElement('div');
  face.className = 'face';
  face.textContent = fmt(t.v, L.dec);
  face.style.setProperty('--c', PALETTE[(Math.abs(t.v)+8) % PALETTE.length]);
  el.appendChild(face);
  sizeTile(el);
  return el;
}
function render(){
  for (let r=0;r<L.rows;r++) for (let c=0;c<L.cols;c++){
    const t = S.grid[r][c]; if (!t) continue;
    let el = els.get(t.id);
    if (!el){
      el = makeTile(t); place(el, t.spawn ?? r, c);
      board.appendChild(el); els.set(t.id, el); void el.offsetWidth; delete t.spawn;
    }
    place(el, r, c);
    el.classList.toggle('sel', S.sel.includes(t.id));
  }
}
function selVals(){ return S.sel.map(id => findPos(id).t.v); }

let flashT = null;
function instruction(){ return t('howTo', L.maxPick, fmt(L.T, L.dec)) + (L.allPos ? '' : t('ruleNeg')); }
function slotColor(v){ return PALETTE[(Math.abs(v)+8) % PALETTE.length]; }
function buildEqbar(){
  let h = '';
  for (let i=0; i<L.maxPick; i++) h += (i ? '<span class="op">+</span>' : '') + `<span class="slot${i>=2 ? ' opt' : ''}"></span>`;
  $('#eqbar').innerHTML = h + `<span class="op">=</span><span class="goalnum">${fmt(L.T, L.dec)}</span>`;
  $('#eqbar').className = 'eqbar num';
}
function fillSlots(vals, state){
  const bar = $('#eqbar');
  bar.querySelectorAll('.slot').forEach((sl, i) => {
    const v = vals[i];
    if (v === undefined){ sl.className = 'slot' + (i>=2 ? ' opt' : ''); sl.textContent = ''; delete sl.dataset.v; return; }
    if (sl.dataset.v !== String(v)){          // 新填进来的数：重新播放弹出动画
      sl.className = 'slot'; void sl.offsetWidth;
      sl.textContent = fmt(v, L.dec); sl.dataset.v = v;
      sl.className = 'slot filled' + (v<0 ? ' neg' : '') + (sl.textContent.length >= 5 ? ' long' : '');
      sl.style.setProperty('--c', slotColor(v));
    }
  });
  bar.classList.remove('good', 'bad', 'demo');
  if (state){ void bar.offsetWidth; bar.classList.add(state); }
}
/* 开始前的演示：格子里自动出现一组例子，比如 13 + 27 = 40，循环播放 */
let demoT = [];
function stopDemo(){ demoT.forEach(clearTimeout); demoT = []; }
function runDemo(){
  stopDemo();
  if (!S || S.started || S.over) return;
  let p = null;
  for (let k=0; k<30 && !p; k++){ const a = randVal(), b = L.T - a; if (inDomain(b)) p = [a, b]; }
  if (!p) return;
  const at = (ms, fn) => demoT.push(setTimeout(fn, ms));
  fillSlots([], 'demo');
  at(500,  () => fillSlots([p[0]], 'demo'));
  at(1100, () => fillSlots(p, 'demo'));
  at(1500, () => { fillSlots(p, 'good'); $('#eqbar').classList.add('demo'); });
  at(3100, () => fillSlots([], 'demo'));
  at(3500, runDemo);
}
function updateHUD(msg, tone){
  // 对/错的提示保留 1.5 秒，之后回到玩法说明
  if (msg){
    S.flash = { msg, tone, until: Date.now() + 1500 };
    clearTimeout(flashT); flashT = setTimeout(() => { if (S && !S.over) updateHUD(); }, 1550);
  }
  const f = S.flash && S.flash.until > Date.now() ? S.flash : null;
  const eq = $('#eqLine');
  eq.className = 'eq' + (f && f.tone ? ' ' + f.tone : '');
  eq.textContent = f ? f.msg : instruction();
  $('#startHint').hidden = S.started;
  // 等式格子：显示已经点的数；刚凑对时先保留那一组绿色等式
  if (S.started && !S.busy && (S.sel.length || !(f && f.tone === 'good'))) fillSlots(selVals(), '');
  $('#goalText').textContent = `${S.cleared} / ${L.goal}`;
  $('#goalFill').style.width = Math.min(S.cleared/L.stars[2], 1)*100 + '%';
  $('#goalBar').classList.toggle('passed', S.cleared >= L.goal);
  const bl = $('#bestLive'), prev = best[LEVELS[L.index].key] || 0;
  const beating = prev > 0 && S.cleared > prev;
  bl.textContent = beating ? t('newBest') : prev ? t('best', prev) : '';
  bl.classList.toggle('new', beating);
  $('#hintCount').textContent = S.hintsLeft;
  $('#hintBtn').disabled = S.hintsLeft<=0;
}

/* ---------- 声音 & 震动 ---------- */
let ac = null;
function unlockAudio(){
  if (!soundOn) return;
  try { if (!ac) ac = new (window.AudioContext||window.webkitAudioContext)(); if (ac.state==='suspended') ac.resume(); } catch(e){}
}
function tone(f, d, type='sine', vol=.08, when=0){
  if (!soundOn || !ac) return;
  try {
    const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t+d);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t+d+.02);
  } catch(e){}
}
function chime(combo){
  const base = 523 * Math.pow(2, Math.min(combo-1,7)*2/12);
  [0,4,7,12].forEach((s,i) => tone(base*Math.pow(2,s/12), .2, 'triangle', .08, i*.055));
}
// 震动：App 里用原生 Haptics（iPhone 的 Taptic Engine），浏览器里退回 navigator.vibrate
const Haptics = window.Capacitor?.Plugins?.Haptics;
function vib(kind){
  try {
    if (Haptics){
      if (kind==='error') Haptics.notification({ type:'ERROR' });
      else Haptics.impact({ style: kind==='tap' ? 'LIGHT' : 'MEDIUM' });
    } else if (navigator.vibrate){
      navigator.vibrate(kind==='error' ? 90 : kind==='tap' ? 8 : 25);
    }
  } catch(e){}
}

/* ---------- 玩法 ---------- */
board.addEventListener('pointerdown', e => {
  const el = e.target.closest('.tile');
  if (!el || !S || S.busy || S.over) return;
  e.preventDefault(); onTap(+el.dataset.id);
});
function onTap(id){
  unlockAudio(); resetIdle();
  if (!S.started){ S.started = true; S.start = Date.now(); lastTick = Date.now(); stopDemo(); fillSlots([], ''); }
  const i = S.sel.indexOf(id);
  if (i >= 0){ S.sel.splice(i,1); tone(330,.06); render(); updateHUD(); return; }
  S.sel.push(id); tone(420 + S.sel.length*90, .07, 'sine', .07); vib('tap');
  const sum = selVals().reduce((a,b)=>a+b,0);
  render(); updateHUD();
  if (S.sel.length>=2 && sum===L.T) return doClear();
  if (L.allPos && sum > L.T) return doMistake('tooBig');
  if (S.sel.length >= L.maxPick) return doMistake('notTarget');
}
function doMistake(why){
  S.busy = true; S.mistakes++;
  const ids = [...S.sel];
  ids.forEach(id => els.get(id)?.classList.add('shake'));
  updateHUD(t(why, `${equation(selVals())} = ${fmt(selVals().reduce((a,b)=>a+b,0),L.dec)}`, fmt(L.T,L.dec)), 'bad');
  fillSlots(selVals(), 'bad');
  tone(160,.2,'square',.04); vib('error');
  setTimeout(() => {
    ids.forEach(id => els.get(id)?.classList.remove('shake'));
    S.sel = []; S.busy = false; render(); updateHUD();
  }, 400);
}
function doClear(){
  S.busy = true;
  const vals = selVals(), ids = [...S.sel];
  const now = Date.now();
  S.combo = now - S.lastClear < 3500 ? S.combo+1 : 1; S.lastClear = now;
  let cx = 0, cy = 0;
  ids.forEach(id => {
    const p = findPos(id);
    cx += PAD + p.c*cell + cell/2; cy += PAD + p.r*cell + cell/2;
    S.grid[p.r][p.c] = null;
    const el = els.get(id); els.delete(id);
    el.classList.remove('sel'); el.classList.add('pop');
    setTimeout(() => el.remove(), 320);
  });
  floatText(`${equation(vals)} = ${fmt(L.T,L.dec)}`, cx/ids.length, cy/ids.length);
  const combo = $('#combo');
  combo.hidden = S.combo < 2; combo.textContent = t('combo', S.combo);
  chime(S.combo); vib('clear');
  S.sel = []; S.cleared++;
  fillSlots(vals, 'good');
  updateHUD(`${equation(vals)} = ${fmt(L.T,L.dec)} ✓`, 'good');
  setTimeout(() => {
    if (S.over) return;
    collapse(); render(); S.busy = false; updateHUD();
  }, 240);
}
function floatText(text, x, y){
  const f = document.createElement('div');
  f.className = 'float'; f.textContent = text;
  f.style.left = x + 'px'; f.style.top = y + 'px';
  board.appendChild(f); setTimeout(() => f.remove(), 1250);
}
function showHint(free){
  if (!S || S.busy || S.over) return;
  if (!free){ if (S.hintsLeft<=0) return; S.hintsLeft--; S.hints++; }
  const sol = findSolution(); if (!sol) return;
  S.sel = []; render(); updateHUD();
  sol.forEach(t => {
    const el = els.get(t.id); if (!el) return;
    el.classList.remove('hint'); void el.offsetWidth; el.classList.add('hint');
    setTimeout(() => el.classList.remove('hint'), 2200);
  });
}
let idleT = null;
function resetIdle(){
  clearTimeout(idleT);
  if (L && L.idleHint) idleT = setTimeout(() => { if (S && !S.over && !S.sel.length){ showHint(true); resetIdle(); } }, S && !S.started ? 4000 : 9000);
}

/* ---------- 计时 ---------- */
let tickT = null, lastTick = 0;
function startTimer(){
  clearInterval(tickT);
  const el = $('#timer'); el.hidden = !L.time;
  if (!L.time) return;
  lastTick = Date.now(); drawTimer();
  tickT = setInterval(() => {
    const now = Date.now(), dt = Math.min((now-lastTick)/1000, .5); lastTick = now;
    if (S.over || !S.started || document.hidden) return;
    S.timeLeft = Math.max(0, S.timeLeft - dt); drawTimer();
    if (S.timeLeft <= 0) timeUp();
  }, 200);
}
function drawTimer(){
  const s = Math.ceil(S.timeLeft), el = $('#timer');
  el.textContent = `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  el.classList.toggle('low', S.started && s <= 10);
}
function stopAll(){ clearInterval(tickT); clearTimeout(idleT); clearTimeout(flashT); stopDemo(); }
// 切到后台时暂停：回来后不把离开的时间算进去
document.addEventListener('visibilitychange', () => { lastTick = Date.now(); });

/* ---------- 关卡流程 ---------- */
// 已通过的最远一关之前的都算解锁，再加下一关：中间插入新关时，玩家已经打过的后面几关不会被重新锁上
function furthestPassed(){ let f = -1; LEVELS.forEach((lv, k) => { if (progress[lv.key] > 0) f = k; }); return f; }
function isUnlocked(i){ return (devTools && unlockAll) || i <= furthestPassed() + 1; }
function startLevel(i){
  stopAll(); hideOverlay();
  L = prep(LEVELS[i], i);
  L.stars = LEVELS[i].stars || [L.goal, Math.round(L.goal*1.25), Math.round(L.goal*1.5)];
  els.forEach(el => el.remove()); els.clear(); board.innerHTML = '';
  S = { grid:[], sel:[], cleared:0, mistakes:0, hints:0, hintsLeft:3, combo:0, lastClear:0,
        start:Date.now(), timeLeft:L.time||0, busy:false, over:false, started:false };
  const fresh = [];
  for (let r=0;r<L.rows;r++){
    const row = [];
    for (let c=0;c<L.cols;c++){ const t = { id:nextId++, v:null, spawn:r-L.rows }; row.push(t); fresh.push(t); }
    S.grid.push(row);
  }
  fillFresh(fresh); ensureSolvable(fresh);
  $('#lvlId').textContent = LEVELS[i].no;
  $('#lvlName').textContent = LEVELS[i].name ? tr(LEVELS[i].name) : t('levelTarget', fmt(L.T, L.dec));
  buildEqbar();
  $('#startHint').textContent = t('startHint', L.time, L.goal);
  const bar = $('#goalBar');
  bar.style.setProperty('--t1', L.stars[0]/L.stars[2]*100 + '%');
  bar.style.setProperty('--t2', L.stars[1]/L.stars[2]*100 + '%');
  $('#combo').hidden = true;
  $('#home').hidden = true; $('#game').hidden = false;
  requestAnimationFrame(() => { layout(); updateHUD(); });
  startTimer(); resetIdle(); runDemo();
}
function calcStars(){ return S.cleared >= L.stars[2] ? 3 : S.cleared >= L.stars[1] ? 2 : 1; }
function timeUp(){
  S.over = true; stopAll(); S.sel = []; render();
  const id = LEVELS[L.index].key;
  S.prevBest = best[id] || 0;
  S.newBest = S.cleared > S.prevBest;
  if (S.newBest){ best[id] = S.cleared; store.set(BEST_KEY, best); }
  if (S.cleared >= L.goal) win(); else lose();
}
function starsSvg(n, size, cls=''){
  return `<div class="stars ${cls}">` + [0,1,2].map(i =>
    `<svg class="star${i<n?' on':''}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`
  ).join('') + '</div>';
}
function win(){
  S.over = true; stopAll();
  const stars = calcStars(), id = LEVELS[L.index].key;
  if (stars > (progress[id]||0)){ progress[id] = stars; store.set(PROGRESS_KEY, progress); }
  const hasNext = L.index+1 < LEVELS.length;
  setTimeout(() => { showOverlay(t('winTitle', stars), stars,
    stars < 3 ? t('nextStar', L.stars[stars] - S.cleared) : '',
    [ [t('levels'), goHome], hasNext ? [t('next'), () => startLevel(L.index+1), true] : [t('again'), () => startLevel(L.index), true] ]);
    celebrate(stars);
  }, 450);
}
function lose(){
  S.over = true; stopAll(); tone(220,.35,'triangle',.07);
  showOverlay(t('loseTitle'), -1, t('loseText', S.cleared, L.goal),
    [ [t('levels'), goHome], [t('retry'), () => startLevel(L.index), true] ]);
}
function showOverlay(title, stars, text, actions){
  $('#mScore').hidden = false;
  const h = $('#mTitle');
  h.textContent = title;
  h.classList.remove('cheer'); void h.offsetWidth; h.classList.toggle('cheer', stars > 0);
  $('#mStars').innerHTML = stars >= 0 ? starsSvg(stars, 46) : '';
  $('#mText').textContent = text;
  $('#mText').hidden = !text;
  countUp($('#mCount'), S.cleared, 700);
  $('#mLabel').textContent = t('groupsIn', L.time);
  const mb = $('#mBest');
  mb.textContent = S.newBest ? t('newBest') : t('best', S.prevBest);
  mb.classList.toggle('new', S.newBest);
  const box = $('#mActions'); box.innerHTML = '';
  actions.forEach(([label, fn, primary]) => {
    const b = document.createElement('button'); b.textContent = label;
    if (primary) b.className = 'primary';
    b.onclick = fn; box.appendChild(b);
  });
  $('#overlay').hidden = false;
  box.lastChild.focus();
}
/* ---------- 过关庆祝：彩带 + 星星音效 + 震动 ---------- */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
function countUp(el, to, ms){
  if (reduceMotion.matches || to <= 0){ el.textContent = to; return; }
  const t0 = performance.now();
  (function step(now){
    const p = Math.max(0, Math.min((now - t0) / ms, 1));
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
function celebrate(stars){
  // 星星弹出的时间和 CSS 里的 animation-delay 对齐：0.3s / 0.55s / 0.8s
  [300, 550, 800].slice(0, stars).forEach((ms, i) => setTimeout(() => {
    tone(784 * Math.pow(2, i*4/12), .25, 'triangle', .09);
    tone(1568 * Math.pow(2, i*4/12), .15, 'sine', .03, .02);
    try { Haptics ? Haptics.impact({ style: i === 2 ? 'HEAVY' : 'MEDIUM' }) : null; } catch(e){}
  }, ms));
  setTimeout(() => chime(4), 80);
  try { Haptics && Haptics.notification({ type:'SUCCESS' }); } catch(e){}
  confetti(stars === 3 ? 2 : 1);
}
let fxRun = 0;
function confetti(waves){
  if (reduceMotion.matches) return;
  const c = $('#fx'), ctx = c.getContext('2d'), dpr = window.devicePixelRatio || 1;
  const W = innerWidth, H = innerHeight;
  c.width = W * dpr; c.height = H * dpr; c.hidden = false;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = [...PALETTE, '#FFC233', '#FFFFFF'];
  const parts = [];
  function shoot(){
    // 从左右两个下角往中间上方喷
    for (let i = 0; i < 90; i++){
      const side = i % 2, sp = 9 + Math.random() * 8, ang = (side ? 180 + 55 + Math.random()*25 : -55 - Math.random()*25) * Math.PI / 180;
      parts.push({
        x: side ? W + 10 : -10, y: H * 0.78,
        vx: Math.cos(ang) * sp * (side ? 1 : 1), vy: Math.sin(ang) * sp,
        w: 6 + Math.random() * 6, h: 9 + Math.random() * 8,
        r: Math.random() * 6.28, vr: (Math.random() - .5) * .35,
        wob: Math.random() * 6.28, col: colors[Math.floor(Math.random() * colors.length)],
        round: Math.random() < .25,
      });
    }
  }
  shoot();
  if (waves > 1) setTimeout(shoot, 450);
  const run = ++fxRun, t0 = performance.now();
  let last = t0;
  (function frame(now){
    if (run !== fxRun) return;
    const dt = Math.max(0, Math.min((now - last) / 16.7, 3)); last = now;
    ctx.clearRect(0, 0, W, H);
    for (const p of parts){
      p.vy += .32 * dt; p.vx *= Math.pow(.985, dt); p.vy *= Math.pow(.985, dt);
      p.x += (p.vx + Math.sin(p.wob) * .8) * dt; p.y += p.vy * dt;
      p.r += p.vr * dt; p.wob += .12 * dt;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.col;
      if (p.round){ ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 6.28); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2 * Math.abs(Math.cos(p.wob)), p.w, p.h * Math.abs(Math.cos(p.wob)));
      ctx.restore();
    }
    if (now - t0 < 3600) requestAnimationFrame(frame);
    else { ctx.clearRect(0, 0, W, H); c.hidden = true; }
  })(t0);
}
function stopConfetti(){ fxRun++; $('#fx').hidden = true; }
function hideOverlay(){ $('#overlay').hidden = true; stopConfetti(); }
function goHome(){
  stopAll(); hideOverlay(); if (S) S.over = true;
  $('#game').hidden = true; $('#home').hidden = false; renderHome();
}

/* ---------- 首页 ---------- */
const LOCK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const targetText = lv => fmt(Math.round(lv.target*10**(lv.dec||0)), lv.dec||0);
// 当前该玩的关：第一个解锁了但还没通过的；都通过了就是最后一个解锁的
function currentIndex(){
  const f = LEVELS.findIndex((lv, k) => isUnlocked(k) && !(progress[lv.key] > 0));
  if (f >= 0) return f;
  let i = 0; LEVELS.forEach((lv, k) => { if (isUnlocked(k)) i = k; }); return i;
}
function renderHome(){
  const cur = currentIndex();
  const wrap = $('#worlds'); wrap.innerHTML = '';
  WORLDS.forEach((w, wi) => {
    const no = wi + 1;   // 等级序号，按顺序算
    const idx = LEVELS.map((lv, i) => i).filter(i => LEVELS[i].world === no);
    const passed = idx.filter(i => progress[LEVELS[i].key] > 0).length;
    const sec = document.createElement('section'); sec.className = 'world';
    // 整个等级还没解锁：只显示一张卡片
    if (!isUnlocked(idx[0])){
      sec.innerHTML = `<div class="world-locked">${LOCK}<div><div class="world-no">${t('chapter', no)}</div>
        <div class="world-name">${tr(w.name)}</div><div class="world-desc">${t('worldLocked', no - 1)}</div></div></div>`;
      wrap.appendChild(sec); return;
    }
    sec.innerHTML = `<div class="world-head"><div><div class="world-no">${t('chapter', no)}</div><h2 class="world-name">${tr(w.name)}</h2></div>
      <span class="world-count num">${t('passedCount', passed, idx.length)}</span></div>
      <div class="world-bar"><i style="width:${passed/idx.length*100}%"></i></div>
      <p class="world-desc">${tr(w.desc)}</p><div class="stages"></div>`;
    const list = sec.querySelector('.stages');
    idx.forEach((i, n) => {
      const lv = LEVELS[i], open = isUnlocked(i), st = progress[lv.key] || 0, b = best[lv.key];
      const title = lv.name ? tr(lv.name) : t('levelTarget', targetText(lv));
      const btn = document.createElement('button');
      btn.className = 'stage' + (open ? '' : ' locked') + (i === cur ? ' current' : '');
      btn.disabled = !open;
      btn.style.setProperty('--c', PALETTE[n % PALETTE.length]);
      const sub = !open ? t('locked') : b ? t('bestGroups', b) : t('notPlayed');
      const end = !open ? LOCK : (i === cur && !st) ? `<span class="pill">${t('playShort')}</span>` : starsSvg(st, 18);
      btn.innerHTML = `<span class="badge num">${n + 1}</span><span class="info"><span class="title">${title}</span>
        <span class="sub num">${sub}</span></span><span class="end">${end}</span>`;
      btn.setAttribute('aria-label', `${lv.no} ${title}, ${sub}${st ? `, ${st}★` : ''}`);
      btn.onclick = () => startLevel(i);
      list.appendChild(btn);
    });
    wrap.appendChild(sec);
  });
  const total = LEVELS.reduce((a, lv) => a + (progress[lv.key] || 0), 0);
  $('#totalStars').innerHTML = `<svg class="star on" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>${total} / ${LEVELS.length*3}`;
  $('#continueBtn').textContent = t('playTarget', targetText(LEVELS[cur]));
  $('#soundBtn').setAttribute('aria-pressed', soundOn);
  $('#soundBtn').textContent = t(soundOn ? 'soundOn' : 'soundOff');
  $('#unlockBtn').hidden = !devTools;
  $('#unlockBtn').setAttribute('aria-pressed', unlockAll);
  // 让当前这关出现在屏幕里
  requestAnimationFrame(() => wrap.querySelector('.stage.current')?.scrollIntoView({ block:'nearest' }));
}
$('#continueBtn').onclick = () => startLevel(currentIndex());
$('#soundBtn').onclick = () => { soundOn = !soundOn; store.set('ccs.sound', soundOn); if (soundOn) unlockAudio(); renderHome(); };
$('#unlockBtn').onclick = () => { unlockAll = !unlockAll; store.set('ccs.unlockAll', unlockAll); renderHome(); };
let titleTaps = [];
$('.wordmark').addEventListener('click', () => {
  const now = Date.now();
  titleTaps = titleTaps.filter(t => now - t < 2000); titleTaps.push(now);
  if (titleTaps.length < 5) return;
  titleTaps = []; devTools = !devTools; store.set('ccs.devTools', devTools); vib('clear'); renderHome();
});
$('#langBtn').onclick = () => { lang = lang === 'zh' ? 'en' : 'zh'; store.set('ccs.lang', lang); applyLang(); renderHome(); };
// 清除进度要二次确认，防止误触
function confirmReset(){
  $('#mTitle').textContent = t('resetTitle'); $('#mTitle').classList.remove('cheer');
  $('#mStars').innerHTML = ''; $('#mScore').hidden = true;
  $('#mText').textContent = t('resetText'); $('#mText').hidden = false;
  const box = $('#mActions'); box.innerHTML = '';
  const cancel = document.createElement('button'); cancel.textContent = t('cancel'); cancel.onclick = hideOverlay;
  const ok = document.createElement('button'); ok.textContent = t('resetConfirm'); ok.className = 'danger';
  ok.onclick = () => { progress = {}; best = {}; store.set(PROGRESS_KEY, progress); store.set(BEST_KEY, best); hideOverlay(); renderHome(); };
  box.append(cancel, ok);
  $('#overlay').hidden = false; cancel.focus();
}
$('#resetBtn').onclick = confirmReset;
// 点弹窗外面的暗色区域 = 取消（只对"清除进度"确认框生效）
$('#overlay').addEventListener('click', e => { if (e.target.id === 'overlay' && $('#mScore').hidden) hideOverlay(); });
$('#backBtn').onclick = goHome;
$('#hintBtn').onclick = () => { unlockAudio(); showHint(false); resetIdle(); };
$('#clearBtn').onclick = () => { if (!S || S.busy || S.over) return; S.sel = []; render(); updateHUD(); resetIdle(); };
$('#restartBtn').onclick = () => { if (L) startLevel(L.index); };
window.addEventListener('resize', () => { if (!$('#game').hidden) layout(true); });

/* ---------- 关卡配置自检：每次启动都会跑，有问题打印在控制台；
   打开 index.html?check 会直接显示在页面上 ---------- */
const LEVEL_FIELDS = ['key','name','target','dec','pools','maxPick','cols','rows','time','goal','stars','help','idleHint','zero'];
function checkLevels(){
  const errs = [], seenW = new Set(), seenL = new Set();
  const isInt = x => Math.abs(x - Math.round(x)) < 1e-6;
  WORLDS.forEach((w, wi) => {
    const wn = `等级 ${wi + 1}`;
    if (!w.key) errs.push(`${wn}：没有 key`);
    else if (seenW.has(w.key)) errs.push(`${wn}：key "${w.key}" 重复了`);
    seenW.add(w.key);
    if (!w.name?.en) errs.push(`${wn}：缺少英文名 name.en`);
    if (!w.levels?.length) errs.push(`${wn}：一关都没有`);
  });
  LEVELS.forEach(lv => {
    const e = msg => errs.push(`${lv.no}（${lv.key ?? '没有 key'}）：${msg}`);
    if (!lv.key) e('没有 key');
    else if (seenL.has(lv.key)) e(`key "${lv.key}" 和前面的关重复了`);
    seenL.add(lv.key);
    Object.keys(lv).forEach(f => { if (!LEVEL_FIELDS.includes(f) && f !== 'world' && f !== 'no') e(`不认识的字段 "${f}"（拼错了？）`); });
    const dec = lv.dec || 0, k = 10 ** dec;
    if (!Number.isInteger(dec) || dec < 0) e('dec 必须是 0 或正整数');
    if (typeof lv.target !== 'number' || !isInt(lv.target * k)) e(`target ${lv.target} 和 dec ${dec} 对不上（小数位太多）`);
    if (!Number.isInteger(lv.maxPick) || lv.maxPick < 2) e('maxPick 至少是 2');
    if (!(lv.time > 0)) e('time 必须大于 0（结算只在时间到时发生）');
    if (!(lv.goal > 0)) e('goal 必须大于 0');
    if (!(lv.cols >= 2 && lv.rows >= 2)) e('cols / rows 至少是 2');
    if (lv.help !== undefined && !(lv.help >= 0 && lv.help <= 1)) e('help 要在 0 到 1 之间');
    if (lv.stars){
      const s = lv.stars;
      if (s.length !== 3 || !(s[0] <= s[1] && s[1] <= s[2])) e('stars 要写三个从小到大的数');
      else if (s[0] !== lv.goal) e(`stars 第一个数（${s[0]}）应该等于 goal（${lv.goal}），过关就是 1 星`);
    }
    if (!Array.isArray(lv.pools) || !lv.pools.length){ e('pools 不能为空'); return; }
    // 数字池能取到的所有值（放大成整数）；棋盘出数和开局演示都要求至少有一对 a + b = target
    const vals = new Set(), T = Math.round(lv.target * k);
    lv.pools.forEach((p, pi) => {
      const step = p.step ?? 1;
      if (!(p.min <= p.max)) return e(`pools[${pi}] 的 min 比 max 大`);
      if (!(step > 0)) return e(`pools[${pi}] 的 step 必须大于 0`);
      if (![p.min, p.max, step].every(x => isInt(x * k))) return e(`pools[${pi}] 的小数位比 dec ${dec} 多`);
      const lo = Math.round(p.min * k), hi = Math.round(p.max * k), st = Math.round(step * k);
      if ((hi - lo) / st > 20000) return e(`pools[${pi}] 范围太大`);
      for (let v = lo; v <= hi; v += st) if (lv.zero || (v !== 0 && v !== T)) vals.add(v);
    });
    if (!vals.size) e('数字池里一个能用的数都没有');
    else if (![...vals].some(a => vals.has(T - a))) e(`数字池里找不到两个数加起来等于 ${lv.target}，这关没法玩`);
  });
  return errs;
}

applyLang();
renderHome();
const params = new URLSearchParams(location.search);
const problems = checkLevels();
if (problems.length) console.warn('关卡配置有问题：\n' + problems.join('\n'));
if (params.has('check')){
  const box = document.createElement('pre');
  box.style.cssText = 'position:fixed;inset:auto 12px 12px;z-index:50;max-height:60vh;overflow:auto;margin:0;padding:14px;' +
    'border-radius:14px;background:var(--panel);box-shadow:0 6px 24px var(--shadow);font:600 13px/1.5 ui-monospace,monospace;white-space:pre-wrap;' +
    `border:3px solid ${problems.length ? 'var(--bad)' : 'var(--good)'}`;
  box.textContent = problems.length ? `关卡配置有 ${problems.length} 个问题：\n\n` + problems.join('\n')
                                    : `✓ ${WORLDS.length} 个等级、${LEVELS.length} 关，配置都没问题`;
  box.onclick = () => box.remove();
  document.body.appendChild(box);
}
// 设计调试：浏览器里打开 index.html?level=1-10（界面编号）或 ?level=first-10（key）直接进入这一关；
// 加 &result=25 直接看"凑出 25 组"时的结算画面
const jump = params.get('level');
if (jump){
  const i = LEVELS.findIndex(lv => lv.no === jump || lv.key === jump);
  if (i >= 0){
    startLevel(i);
    const r = params.get('result');
    if (r !== null) setTimeout(() => { S.cleared = +r; S.started = true; timeUp(); }, 300);
  }
}
})();
