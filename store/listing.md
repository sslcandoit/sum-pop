# App Store 上架资料

在 App Store Connect 里逐项复制粘贴。截图有两套尺寸，内容相同，看 App Store Connect 的截图标签页要哪个尺寸就用哪套，按文件名顺序上传：

| 截图标签页 | 尺寸 | 文件夹 |
|---|---|---|
| iPhone 6.9" Display | 1320 × 2868 | [`screenshots/en`](screenshots/en)、[`screenshots/zh`](screenshots/zh) |
| iPhone 6.1" / 6.3" Display | 1206 × 2622 | [`screenshots-6.3/en`](screenshots-6.3/en)、[`screenshots-6.3/zh`](screenshots-6.3/zh) |

横版宣传图（可选，上传到 App Store Connect 里要求这两个尺寸的地方，比如 Header / Search Results）：

| 尺寸 | 英文 | 中文 |
|---|---|---|
| 5244 × 2950 | [`promo/en/promo-5244x2950.png`](promo/en/promo-5244x2950.png) | [`promo/zh/promo-5244x2950.png`](promo/zh/promo-5244x2950.png) |
| 3840 × 1646 | [`promo/en/promo-3840x1646.png`](promo/en/promo-3840x1646.png) | [`promo/zh/promo-3840x1646.png`](promo/zh/promo-3840x1646.png) |

---

## 所有语言通用（App 信息 / 定价 / 隐私）

| 字段 | 填写 |
|---|---|
| 主要类别 | 游戏 → 子类别：益智（Puzzle）、家庭（Family） |
| 次要类别 | 教育（Education） |
| 价格 | 免费 |
| 隐私政策网址 | `https://github.com/sslcandoit/sum-pop/blob/main/PRIVACY.md` |
| 技术支持网址 | `https://github.com/sslcandoit/sum-pop/issues` |
| 营销网址（可不填） | `https://github.com/sslcandoit/sum-pop` |
| 版权 | `2026 Shanshan Li` |
| App 隐私（问卷） | **不收集数据**（Data Not Collected） |
| 年龄分级 | 问卷全部选"无 / 否"，结果是 **4+** |
| 儿童类别（Made for Kids） | **不要勾选**。适合小朋友玩，但放进儿童类别审核规则更严 |
| 内容版权 | 不包含第三方内容（字体 Baloo 2 是 SIL 开源字体，允许商用） |
| 加密 | 已在 App 里声明不使用加密，不会再问 |

### 给审核人员的备注（App Review Information → Notes）

第一次提交被要求补充信息（Guideline 2.1 - Information Needed）后改成了下面这版，逐条回答了审核提出的 1–6 项。录屏作为附件上传到同一页的 Attachment。

```
1. SCREEN RECORDING
Attached in the Attachment field below: recorded on an iPhone 15 Plus running the latest iOS, starting from launching the app and showing the typical flow (home screen, playing a stage, a wrong answer, a hint, finishing a stage, the results screen, moving to the next stage, and the settings). The app has no account registration or login, no user-generated content, and no paid content or in-app purchases.

2. PURPOSE AND AUDIENCE
Sum Pop is a casual math puzzle game. The player taps numbers on a board that add up to a target number; each correct group disappears and new numbers fall in. Clearing enough groups before the timer ends passes the stage and earns up to three stars. There are 113 stages in 12 levels, from adding small numbers (with automatic hints, for young children) up to larger numbers, negative numbers and decimals.
It is for children learning addition and for adults who enjoy quick number puzzles. It turns mental-arithmetic practice into short, game-like rounds, so it feels like play rather than homework.

3. HOW TO USE THE MAIN FEATURES
No login, credentials or setup are needed. Open the app and tap "Play" at the bottom of the home screen to start the current stage. Tap two numbers (in later levels up to three) that add up to the target shown at the top. The timer starts on the first tap. "Hint" highlights a valid group, "Clear" deselects, "Restart" starts the stage over. When time runs out, the results screen shows stars and the best score, and the next stage unlocks. The home screen also has buttons to switch language (English/Chinese), turn sound on or off, and reset progress.
Stages unlock in order. To review later stages quickly: tap the "Sum Pop" title on the home screen 5 times quickly; an "Unlock all levels (testing)" button appears below.

4. EXTERNAL SERVICES
The game itself runs entirely on the device and works offline. The only external service is GitHub (github.com / raw.githubusercontent.com), used to deliver content updates: on launch the app reads a small JSON file from our public repository (github.com/sslcandoit/sum-pop) and, if newer game content (levels, layout, fixes as HTML/JS/CSS) is available, downloads it from GitHub Releases. This content runs only in the system WKWebView and does not change the app's purpose or features (guideline 3.3.1(B)). The update mechanism uses the open-source Capacitor Updater plugin, self-hosted; no third-party update server is used and its statistics reporting is disabled. No user data is sent anywhere. There are no data providers, authentication services, payment processors, analytics, advertising or AI services.

5. REGIONAL DIFFERENCES
None. The app works the same in all regions where it is available. The interface language follows the device language (English or Simplified Chinese) and can be switched in the app; the gameplay and content are identical in both languages.

6. REGULATED INDUSTRY / THIRD-PARTY MATERIAL
Not applicable. The app is not in a regulated industry and contains no protected third-party material. All game content and artwork are our own; the only third-party asset is the "Baloo 2" font, licensed under the SIL Open Font License, which allows use in commercial apps.
```

联系人信息（姓名、电话、邮箱）填你自己的。

---

## English (U.S.)

**Name** (30)
```
Sum Pop: Number Puzzle
```

**Subtitle** (30)
```
Tap numbers that hit the sum
```

**Promotional Text** (170, can be changed any time without review)
```
113 stages across 12 levels: from "make 10" to negatives and decimals. Quick, colorful math practice for kids and grown-ups. No ads, no account, works offline.
```

**Keywords** (100, comma-separated; words already in the name don't need repeating)
```
math,addition,add,mental math,arithmetic,kids,brain,make ten,decimals,negative,learn,school,logic
```

**Description**
```
Tap numbers that add up to the target. Each correct group pops off the board, and new numbers fall in. Make enough groups before the timer runs out to pass the stage, and make more to earn up to three stars.

Sum Pop starts gently and keeps growing with you:

• First Sums: make 1 to 10 with small numbers, a 45-second timer and automatic hints. Perfect for young kids.
• Teens and Make Tens: make 11 to 20, then 10, 20, 30… all the way to 100.
• Big Numbers: targets from 150 up to 1000.
• Threes: some groups need three numbers.
• Tiny Boards: fewer tiles, fewer answers, less time.
• Negatives and Below Zero: striped tiles are negative, and some targets are too.
• Decimals and Pocket Change: tenths, halves, quarters and two decimal places.
• Blitz: 30 seconds on the clock.
• Grand Finale: everything at once.

113 stages in 12 levels in total.

Why you'll like it:
• Short rounds that fit into any break
• Builds quick mental addition without feeling like homework
• Combos, stars and personal bests to chase
• Clean, colorful design with satisfying haptics on iPhone
• English and Chinese
• No ads, no in-app purchases, no account, and no data collected
• Works offline
```

---

## 简体中文（Chinese, Simplified）

在 App Store Connect 右上角的语言菜单里添加"简体中文"，再填下面这些。中文名字如果被占用，可以试"凑凑数：数字消除"。

**名称**（30）
```
凑凑数
```

**副标题**（30）
```
点几个数，正好凑出目标
```

**推广文本**（170，随时可改，不用审核）
```
12 个等级、113 关：从凑 10 到负数、小数。好玩的口算练习，小朋友和大人都适合。无广告、无需注册、离线可玩。
```

**关键词**（100，用英文逗号分隔）
```
数学,加法,口算,心算,速算,凑十,儿童,小学,益智,数字游戏,脑力,小数,负数,算术
```

**描述**
```
点几个数，让它们加起来正好等于目标数。凑对一组就消掉，新的数字落下来。限时内凑够组数就过关，凑得越多，星星越多，最多三颗。

凑凑数从简单开始，难度一步步往上走：

• 小小加法：用小数字凑 1 到 10，每关 45 秒，还会自动提示，适合小朋友。
• 凑十几、凑整十：凑 11 到 20，再凑 10、20、30……一直到 100。
• 大数字：目标从 150 到 1000。
• 三个一组：有些组要点三个数才能凑出来。
• 小棋盘：数字更少、答案更少、时间更短。
• 负数登场、零下：带斜纹的是负数，有的目标也是负数。
• 小数点、零钱：十分之几、二分之一、四分之一和两位小数。
• 闪电战：只有 30 秒。
• 终极挑战：全部混在一起。

一共 12 个等级、113 关。

为什么好玩：
• 一局很短，随时随地玩一把
• 不知不觉练快口算，不像做作业
• 连击、星星和个人最高纪录，越玩越想破纪录
• 清爽多彩的画面，iPhone 上有震动反馈
• 支持中文和英文
• 无广告、无内购、无需注册、不收集任何数据
• 没有网络也能玩
```
