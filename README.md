# My Pi RPG

一个使用 Electron、Phaser 和 TypeScript 构建的俯视角 RPG 原型。

## 当前 MVP

当前版本验证桌面运行链路和最小可玩场景：Electron 打开固定的 960×540 窗口，Phaser 显示深绿色场地、蓝色占位角色和操作提示。角色可使用方向键或 WASD 进行四向、斜向移动，移动规则由纯 TypeScript 游戏领域层负责；Pi SDK 尚未集成。

## 环境要求

- Node.js 24 LTS（版本基线记录在 `.nvmrc` 和 `package.json`）
- npm
- Windows（当前构建验证平台）

## 开始使用

```bash
npm ci
npm run dev
```

`npm run dev` 会启动 Electron 窗口。使用方向键或 WASD 移动角色，角色会保持在游戏场地内；窗口失去焦点时活动输入会被清除。

## 验证命令

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run build` 生成 Windows 应用文件，不生成安装程序。

## 架构边界

- Electron main 进程负责桌面窗口和受保护的运行时边界。
- Electron renderer 负责 Phaser 场景、键盘输入转换和显示层。
- preload 当前为空，不暴露 IPC 或其他特权 API。
- Game Domain 负责与框架无关的玩家移动规则；Phaser 只读取输入并渲染领域层返回的位置。
- Pi Agent Runtime 将在未来通过受限的游戏工具接入，不直接拥有游戏状态或系统权限。

## 当前范围之外

Pi、NPC、地图素材、障碍碰撞、战斗、对话、存档、音频、安装程序和跨平台构建均不属于当前 MVP。
