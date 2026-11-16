# 待办

做完一项就把 `[ ]` 改成 `[x]`。

## 现在：1.0 审核

- [x] 第一次提交被要求补充信息（Guideline 2.1），已补录屏和说明，2026-11-16 重新提交
- [ ] 审核通过后，在 App Store Connect 点"发布此版本"（选的是手动发布）
- [ ] 拿到 App Store 链接（`https://apps.apple.com/app/id` + App 信息里的 Apple ID），在 README 加上"Download on the App Store"按钮

## 下一个 App Store 版本（1.1）

这些都要改原生代码，**热更新做不了**，要打新版本提交审核。版本号改成 1.1，Build 改成 2。

- [ ] **进度改存原生存储**
  - 用 `@capacitor/preferences`（存在 iOS 的 UserDefaults），系统不会在存储空间紧张时清掉；现在的 localStorage 有可能被清
  - 第一次启动时把 localStorage 里已有的进度搬过去，存储名（`ccs.progress.v4` 等）不变，老玩家进度不能丢
  - 浏览器版继续用 localStorage
- [ ] **Game Center 排行榜**（不用自己做登录和用户资料）
  - [ ] 先决定排哪几个榜。建议：总星星数、闪电战（30 秒）最高组数、每周榜（每周清零）
  - [ ] App Store Connect：开启 Game Center，建排行榜，记下每个榜的 ID
  - [ ] Xcode：App 加上 Game Center 能力（Capability）
  - [ ] 代码：加原生插件（现成的 Capacitor Game Center 插件，或自己写一个小插件），游戏里加"排行榜"按钮，过关后提交分数
  - [ ] 浏览器版没有 Game Center，按钮要隐藏
  - [ ] 对照苹果当时的说明，重新确认 App 隐私问卷能不能继续选"不收集数据"，需要的话改 PRIVACY.md
- [ ] 提交前：更新审核备注（说明新增的 Game Center），重新截图（如果界面有变化）

## 以后可以考虑

- [ ] **iCloud 同步进度**：同一个 Apple ID 的多台设备进度互通，删掉重装也能恢复
- [ ] **第 1 级的难度**：改成 45 秒后过关要求还是 20 组，平均 2 秒多一组，对小朋友可能太难。可以给第 1 级加 `goal`（比如 8 或 10），热更新就能改
- [ ] **测试热更新的"失败自动退回"**：上线前只测了正常更新，没测过新版本启动失败自动退回旧版本的情况。可以在模拟器上用一个本地的坏版本测
- [ ] **中国大陆上架**：游戏需要版号，App 需要 ICP 备案，暂不考虑
