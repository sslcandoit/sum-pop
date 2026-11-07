/* =====================================================================
   关卡配置 —— 以后设计新关卡，只需要改这个文件
   打开 index.html?check 可以检查这里的配置有没有写错。

   关卡按等级（world）分组，界面上的编号（1-3 = 等级 1 第 3 关）按顺序自动算，
   所以插入、删除、调换关卡都可以直接改，不影响玩家存档。

   key      每关（和每个等级）固定不变的名字，存档靠它记录星星和最高纪录。
            ⚠ 一旦发布就不要再改，改了玩家这一关的记录就丢了；新关卡起一个新名字即可。

   每一关都会先套用 DEFAULTS，关卡里写了的字段会覆盖默认值。
   name     关卡名（可选，游戏里显示），不写就显示"凑 N"
   target   目标和（可以是负数、小数）
   dec      小数位数（0 = 整数；1 = 一位小数 ...）
   pools    数字池，[{min,max,step,w}]，w 是权重，用来混合不同位数
   maxPick  一次最多选几个数（至少 2 个）
   cols/rows 棋盘几列几行
   time     限时（秒，必须 > 0）。时间到时凑出的组数 ≥ goal 就过关
   goal     过关需要凑出的组数
   stars    [1 星, 2 星, 3 星] 需要的组数，不写就按 goal、goal×1.25、goal×1.5
   help     生成新数字时"故意放一个能配对的数"的概率，越高越简单
   idleHint 发呆 9 秒自动提示（给小朋友）
   zero     棋盘上可以出现 0（比如 0 + 2 = 2），也会出现和目标一样大的数

   设计新关卡时注意（?check 查不出这些）：
   · 数字池要配平：平均值 ≈ target ÷ 每组个数。否则每凑一组，棋盘的平均值都会往一边漂，
     最后可能一组解都没有，玩家只能干等时间结束。负数池尤其要小心，可以用 w 多加一些正数。
   · maxPick 最多 3：等式栏的格子宽度固定，4 个格子在手机上放不下。
   · 数字尽量不超过 4 个字符（比如 −9.5、9.95），否则会超出等式栏的格子。
   ===================================================================== */
const DEFAULTS = { time:120, goal:20, cols:7, rows:9, maxPick:2 };

const WORLDS = [
  {
    key:'first',
    name:{ en:'First Sums', zh:'小小加法' },
    desc:{ en:'Small numbers, with 0: make 1, 2, 3 … up to 10', zh:'小数字，有 0：从凑 1 开始，一直到凑 10' },
    // 凑 1 … 10，有 0（0 + 1 = 1），给小朋友，发呆会自动提示
    levels:[
      { key:'first-1',  target:1,  pools:[{min:0, max:1}],  help:0.3, zero:true, idleHint:true, time:45, goal:12 },
      { key:'first-2',  target:2,  pools:[{min:0, max:2}],  help:0.3, zero:true, idleHint:true, time:45, goal:12 },
      { key:'first-3',  target:3,  pools:[{min:0, max:3}],  help:0.3, zero:true, idleHint:true, time:45, goal:12 },
      { key:'first-4',  target:4,  pools:[{min:0, max:4}],  help:0.3, zero:true, idleHint:true, time:45, goal:12 },
      { key:'first-5',  target:5,  pools:[{min:0, max:5}],  help:0.3, zero:true, idleHint:true, time:45, goal:12 },
      { key:'first-6',  target:6,  pools:[{min:0, max:6}],  help:0.3, zero:true, idleHint:true, time:45, goal:12 },
      { key:'first-7',  target:7,  pools:[{min:0, max:7}],  help:0.3, zero:true, idleHint:true, time:45, goal:12 },
      { key:'first-8',  target:8,  pools:[{min:0, max:8}],  help:0.3, zero:true, idleHint:true, time:45, goal:12 },
      { key:'first-9',  target:9,  pools:[{min:0, max:9}],  help:0.3, zero:true, idleHint:true, time:45, goal:12 },
      { key:'first-10', target:10, pools:[{min:0, max:10}], help:0.3, zero:true, idleHint:true, time:45, goal:12 },
    ],
  },
  {
    key:'teens',
    name:{ en:'Teens', zh:'凑十几' },
    desc:{ en:'Make 11, 12, 13 … up to 20', zh:'从凑 11 开始，一直到凑 20' },
    levels:[
      { key:'teens-11', target:11, pools:[{min:1, max:10}], help:0.3 },
      { key:'teens-12', target:12, pools:[{min:1, max:11}], help:0.3 },
      { key:'teens-13', target:13, pools:[{min:1, max:12}], help:0.3 },
      { key:'teens-14', target:14, pools:[{min:1, max:13}], help:0.3 },
      { key:'teens-15', target:15, pools:[{min:1, max:14}], help:0.3 },
      { key:'teens-16', target:16, pools:[{min:1, max:15}], help:0.3 },
      { key:'teens-17', target:17, pools:[{min:1, max:16}], help:0.3 },
      { key:'teens-18', target:18, pools:[{min:1, max:17}], help:0.3 },
      { key:'teens-19', target:19, pools:[{min:1, max:18}], help:0.3 },
      { key:'teens-20', target:20, pools:[{min:1, max:19}], help:0.3 },
    ],
  },
  {
    key:'tens',
    name:{ en:'Make Tens', zh:'凑整十' },
    desc:{ en:'Make 10, then 20, 30 … all the way to 100', zh:'从凑 10 开始，每关加 10，一直到凑 100' },
    levels:[
      { key:'tens-10',  target:10,  pools:[{min:1, max:9}],  help:0.3 },
      { key:'tens-20',  target:20,  pools:[{min:1, max:19}], help:0.3 },
      { key:'tens-30',  target:30,  pools:[{min:1, max:29}], help:0.3 },
      { key:'tens-40',  target:40,  pools:[{min:1, max:39}], help:0.3 },
      { key:'tens-50',  target:50,  pools:[{min:1, max:49}], help:0.3 },
      { key:'tens-60',  target:60,  pools:[{min:1, max:59}], help:0.3 },
      { key:'tens-70',  target:70,  pools:[{min:1, max:69}], help:0.3 },
      { key:'tens-80',  target:80,  pools:[{min:1, max:79}], help:0.3 },
      { key:'tens-90',  target:90,  pools:[{min:1, max:89}], help:0.3 },
      { key:'tens-100', target:100, pools:[{min:1, max:99}], help:0.3 },
    ],
  },
  {
    key:'big',
    name:{ en:'Big Numbers', zh:'大数字' },
    desc:{ en:'Past 100: make 150, 200 … all the way to 1000', zh:'超过 100：从凑 150 一直到凑 1000' },
    levels:[
      { key:'big-150',  target:150,  pools:[{min:10, max:140, step:10}], help:0.3 },
      { key:'big-200',  target:200,  pools:[{min:10, max:190, step:10}], help:0.3 },
      { key:'big-250',  target:250,  pools:[{min:10, max:240, step:10}], help:0.3 },
      { key:'big-300',  target:300,  pools:[{min:10, max:290, step:10}], help:0.3 },
      { key:'big-400',  target:400,  pools:[{min:10, max:390, step:10}], help:0.3 },
      { key:'big-500',  target:500,  pools:[{min:10, max:490, step:10}], help:0.3 },
      { key:'big-600',  target:600,  pools:[{min:10, max:590, step:10}], help:0.3 },
      { key:'big-750',  target:750,  pools:[{min:10, max:740, step:10}], help:0.3 },
      { key:'big-900',  target:900,  pools:[{min:10, max:890, step:10}], help:0.3 },
      { key:'big-1000', target:1000, pools:[{min:10, max:990, step:10}], help:0.3 },
    ],
  },
  {
    // 主要靠三个数凑：小数占多数，平均值约等于 target ÷ 3
    key:'three',
    name:{ en:'Threes', zh:'三个一组' },
    desc:{ en:'Now you can tap 3 numbers. Most groups need all three', zh:'现在可以点 3 个数，大多数时候三个都要用上' },
    levels:[
      { key:'three-9',  target:9,  pools:[{min:1, max:4,  w:4}, {min:5,  max:8}],  maxPick:3, help:0.3 },
      { key:'three-12', target:12, pools:[{min:1, max:5,  w:4}, {min:6,  max:11}], maxPick:3, help:0.3 },
      { key:'three-15', target:15, pools:[{min:1, max:7,  w:4}, {min:8,  max:14}], maxPick:3, help:0.3 },
      { key:'three-18', target:18, pools:[{min:1, max:8,  w:4}, {min:9,  max:17}], maxPick:3, help:0.3 },
      { key:'three-20', target:20, pools:[{min:1, max:9,  w:4}, {min:10, max:19}], maxPick:3, help:0.3 },
      { key:'three-25', target:25, pools:[{min:1, max:11, w:4}, {min:12, max:24}], maxPick:3, help:0.3 },
      { key:'three-30', target:30, pools:[{min:1, max:14, w:4}, {min:15, max:29}], maxPick:3, help:0.3 },
      { key:'three-40', target:40, pools:[{min:1, max:19, w:4}, {min:20, max:39}], maxPick:3, help:0.25 },
      { key:'three-50', target:50, pools:[{min:1, max:24, w:4}, {min:25, max:49}], maxPick:3, help:0.25 },
      { key:'three-60', target:60, pools:[{min:1, max:29, w:4}, {min:30, max:59}], maxPick:3, help:0.25 },
    ],
  },
  {
    key:'tiny',
    name:{ en:'Tiny Boards', zh:'小棋盘' },
    desc:{ en:'Fewer tiles, fewer answers. Look carefully', zh:'数字变少，答案也变少，要看仔细' },
    levels:[
      { key:'tiny-10', target:10, pools:[{min:1, max:9}],  cols:5, rows:6, time:60, goal:15, help:0.3 },
      { key:'tiny-12', target:12, pools:[{min:1, max:11}], cols:5, rows:6, time:60, goal:15, help:0.3 },
      { key:'tiny-15', target:15, pools:[{min:1, max:14}], cols:5, rows:6, time:60, goal:15, help:0.3 },
      { key:'tiny-20', target:20, pools:[{min:1, max:19}], cols:4, rows:5, time:60, goal:12, help:0.3 },
      { key:'tiny-25', target:25, pools:[{min:1, max:24}], cols:4, rows:5, time:60, goal:10, help:0.3 },
      { key:'tiny-30', target:30, pools:[{min:1, max:29}], cols:4, rows:5, time:60, goal:10, help:0.3 },
      { key:'tiny-40', target:40, pools:[{min:1, max:39}], cols:4, rows:4, time:60, goal:8,  help:0.3 },
      { key:'tiny-50', target:50, pools:[{min:1, max:49}], cols:4, rows:4, time:60, goal:8,  help:0.3 },
    ],
  },
  {
    // 目标不是 0 的关：多加一些正数把平均值配平，否则棋盘越玩越负，最后会没有解
    key:'neg',
    name:{ en:'Negatives', zh:'负数登场' },
    desc:{ en:'Striped tiles are negative: they make the sum smaller', zh:'带斜纹的是负数，加上它会变小' },
    levels:[
      { key:'neg-opposites',    name:{ en:'Opposites',        zh:'相反数' },         target:0,  pools:[{min:-9,max:9}],   help:.3 },
      { key:'neg-plusminus',    name:{ en:'Plus and Minus',   zh:'有正有负' },       target:10, pools:[{min:-9,max:9}, {min:1,max:9,w:2}], maxPick:3, help:.15 },
      { key:'neg-5',  target:5,  pools:[{min:-9,max:9},   {min:1,max:9,w:2}],  maxPick:3, help:.15 },
      { key:'neg-15', target:15, pools:[{min:-9,max:9},   {min:1,max:19,w:2}], maxPick:3, help:.15 },
      { key:'neg-zero',         name:{ en:'Back to Zero',     zh:'归零' },           target:0,  pools:[{min:-20,max:20}], maxPick:3, help:.15 },
      { key:'neg-opposites-20', name:{ en:'Bigger Opposites', zh:'大一点的相反数' }, target:0,  pools:[{min:-20,max:20}], help:.25 },
      { key:'neg-20', target:20, pools:[{min:-20,max:20}, {min:1,max:25,w:2}], maxPick:3, help:.15 },
      { key:'neg-50', target:50, pools:[{min:-30,max:30}, {min:1,max:49,w:2}], maxPick:3, help:.15 },
      { key:'neg-zero-50', name:{ en:'Far from Zero', zh:'远离零点' }, target:0, pools:[{min:-50,max:50}], maxPick:3, help:.15 },
      { key:'neg-100', target:100, pools:[{min:-50,max:50}, {min:1,max:99,w:2}], maxPick:3, help:.15 },
    ],
  },
  {
    key:'below',
    name:{ en:'Below Zero', zh:'零下' },
    desc:{ en:'Now the target is negative too', zh:'这回连目标也是负数了' },
    levels:[
      { key:'below-5',  target:-5,  pools:[{min:-4,  max:-1}], help:.3 },
      { key:'below-10', target:-10, pools:[{min:-9,  max:-1}], help:.3 },
      { key:'below-mix-10', name:{ en:'Mixed −10', zh:'混合凑 −10' }, target:-10, pools:[{min:-9,max:9},   {min:-9,max:-1,w:2}],  maxPick:3, help:.15 },
      { key:'below-15', target:-15, pools:[{min:-14, max:-1}], help:.3 },
      { key:'below-20', target:-20, pools:[{min:-19, max:-1}], help:.3 },
      { key:'below-mix-15', name:{ en:'Mixed −15', zh:'混合凑 −15' }, target:-15, pools:[{min:-9,max:9},   {min:-19,max:-1,w:2}], maxPick:3, help:.15 },
      { key:'below-30', target:-30, pools:[{min:-29, max:-1}], help:.3 },
      { key:'below-mix-20', name:{ en:'Mixed −20', zh:'混合凑 −20' }, target:-20, pools:[{min:-20,max:20}, {min:-25,max:-1,w:2}], maxPick:3, help:.15 },
      { key:'below-mix-50', name:{ en:'Mixed −50', zh:'混合凑 −50' }, target:-50, pools:[{min:-30,max:30}, {min:-49,max:-1,w:2}], maxPick:3, help:.15 },
    ],
  },
  {
    key:'dec',
    name:{ en:'Decimals', zh:'小数点' },
    desc:{ en:'The numbers aren’t whole anymore', zh:'数字不再是整数' },
    levels:[
      { key:'dec-one',       name:{ en:'Make One',  zh:'凑一' },     target:1, dec:1, pools:[{min:.1,max:.9,step:.1}], help:.15 },
      { key:'dec-halves',    name:{ en:'Halves',    zh:'半个半个' }, target:5, dec:1, pools:[{min:.5,max:4.5,step:.5}], help:.3 },
      { key:'dec-sevenhalf', target:7.5,  dec:1, pools:[{min:.5,max:7,step:.5}],   help:.25 },
      { key:'dec-two',       target:2,    dec:1, pools:[{min:.1,max:1.9,step:.1}], help:.25 },
      { key:'dec-twohalf',   target:2.5,  dec:1, pools:[{min:.1,max:2.4,step:.1}], help:.25 },
      { key:'dec-three',     target:3,    dec:1, pools:[{min:.1,max:2.9,step:.1}], help:.25 },
      { key:'dec-threeq',    target:3.75, dec:2, pools:[{min:.25,max:3.5,step:.25}], help:.25 },
      { key:'dec-five',      name:{ en:'Make Five', zh:'凑五' },     target:5, dec:1, pools:[{min:.1,max:3.9,step:.1}], maxPick:3, help:.15 },
      { key:'dec-ten',       target:10,   dec:1, pools:[{min:.1,max:6.9,step:.1}], maxPick:3, help:.15 },
      { key:'dec-quarters',  name:{ en:'Quarters',  zh:'四分之几' }, target:1, dec:2, pools:[{min:-1.5,max:1.5,step:.25},{min:.25,max:1.5,step:.25}], maxPick:3, help:.15 },
    ],
  },
  {
    key:'coin',
    name:{ en:'Pocket Change', zh:'零钱' },
    desc:{ en:'Two decimal places, counted in fives', zh:'两位小数，五分五分地数' },
    levels:[
      { key:'coin-half',  target:.5,  dec:2, pools:[{min:.05,max:.45,step:.05}],  help:.3 },
      { key:'coin-1',     target:1,   dec:2, pools:[{min:.05,max:.95,step:.05}],  help:.3 },
      { key:'coin-1-5',   target:1.5, dec:2, pools:[{min:.05,max:1.45,step:.05}], help:.25 },
      { key:'coin-three', name:{ en:'Three Coins', zh:'三枚硬币' }, target:3, dec:2, pools:[{min:.05,max:2,step:.05}], maxPick:3, help:.15 },
      { key:'coin-2',     target:2,   dec:2, pools:[{min:.05,max:1.95,step:.05}], help:.25 },
      { key:'coin-2-5',   target:2.5, dec:2, pools:[{min:.05,max:2.45,step:.05}], help:.25 },
      { key:'coin-3',     target:3,   dec:2, pools:[{min:.05,max:2.95,step:.05}], help:.2 },
      { key:'coin-5',     target:5,   dec:2, pools:[{min:.05,max:4.95,step:.05}], help:.2 },
    ],
  },
  {
    key:'blitz',
    name:{ en:'Blitz', zh:'闪电战' },
    desc:{ en:'Only 30 seconds. Don’t stop to think', zh:'只有 30 秒，别停下来想' },
    levels:[
      { key:'blitz-10',  target:10,  pools:[{min:1,max:9}],  time:30, goal:12, help:.3 },
      { key:'blitz-15',  target:15,  pools:[{min:1,max:14}], time:30, goal:12, help:.3 },
      { key:'blitz-20',  target:20,  pools:[{min:1,max:19}], time:30, goal:11, help:.3 },
      { key:'blitz-zero', name:{ en:'Zero Blitz', zh:'归零闪电战' }, target:0, pools:[{min:-20,max:20}], time:30, goal:9, help:.3 },
      { key:'blitz-30',  target:30,  pools:[{min:1,max:29}], time:30, goal:10, help:.3 },
      { key:'blitz-40',  target:40,  pools:[{min:1,max:39}], time:30, goal:9,  help:.3 },
      { key:'blitz-50',  target:50,  pools:[{min:1,max:49}], time:30, goal:8,  help:.3 },
      { key:'blitz-100', target:100, pools:[{min:1,max:99}], time:30, goal:6,  help:.3 },
    ],
  },
  {
    key:'final',
    name:{ en:'Grand Finale', zh:'终极挑战' },
    desc:{ en:'Everything at once, with less time', zh:'所有花样一起来，时间还更少' },
    levels:[
      { key:'final-negdec',  name:{ en:'Negative Tenths', zh:'负的小数' },   target:-2.5, dec:1, pools:[{min:-5,max:5,step:.5},{min:-4.5,max:-.5,step:.5,w:2}], maxPick:3, time:60, goal:15, help:.15 },
      { key:'final-threes',  name:{ en:'Triple 75',       zh:'三数凑 75' },  target:75,   pools:[{min:1,max:37,w:4},{min:38,max:74}], maxPick:3, time:90, goal:15, help:.2 },
      { key:'final-100',     name:{ en:'Triple 100',      zh:'三数凑 100' }, target:100,  pools:[{min:1,max:49,w:4},{min:50,max:99}], maxPick:3, time:90, goal:15, help:.2 },
      { key:'final-mixneg',  name:{ en:'Up and Down',     zh:'忽上忽下' },   target:25,   pools:[{min:-25,max:25},{min:1,max:40,w:2}], maxPick:3, time:90, goal:15, help:.15 },
      { key:'final-below',   name:{ en:'Deep Below',      zh:'深入零下' },   target:-75,  pools:[{min:-30,max:30},{min:-70,max:-1,w:2}], maxPick:3, time:90, goal:15, help:.15 },
      { key:'final-tinyneg', name:{ en:'Tiny Zero',       zh:'小棋盘归零' }, target:0,    pools:[{min:-15,max:15}], cols:4, rows:5, time:60, goal:10, help:.25 },
      { key:'final-tinydec', name:{ en:'Tiny Decimals',   zh:'小棋盘小数' }, target:5,    dec:1, pools:[{min:.1,max:4.9,step:.1}], cols:4, rows:5, time:60, goal:10, help:.25 },
      { key:'final-coins',   name:{ en:'Big Change',      zh:'一大把零钱' }, target:7.5,  dec:1, pools:[{min:.1,max:7.4,step:.1}], time:90, goal:15, help:.2 },
      { key:'final-blitz',   name:{ en:'Final Blitz',     zh:'最后冲刺' },   target:100,  pools:[{min:1,max:99}], time:45, goal:8, help:.25 },
      { key:'final-boss',    name:{ en:'Last Stand',      zh:'最后一关' },   target:50,   pools:[{min:-50,max:50},{min:1,max:75,w:2}], maxPick:3, time:75, goal:15, help:.15 },
    ],
  },
];
