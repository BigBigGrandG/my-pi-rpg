# My Pi RPG

一个使用 Electron、Phaser 和 TypeScript 构建的俯视角 RPG 原型。

## 当前 MVP

当前版本验证桌面运行链路和可探索地图切片：Electron 打开固定的 960×540 窗口，Phaser 显示一个 60×40 格、1920×1280 像素的程序化乡村道路地图。三条横路和三条竖路组成九个交叉口，玩家从西南交叉口出生，只能在道路上移动；镜头会平滑跟随玩家并限制在世界边界内。角色可使用方向键或 WASD 以 160 px/s 进行四向、斜向移动；纯 TypeScript 游戏领域层通过统一的世界状态转换计算位置、朝向、实际移动状态和道路碰撞，Phaser 只负责传入输入并呈现返回状态。Pi SDK 尚未集成。

## 环境要求

- Node.js 24 LTS（版本基线记录在 `.nvmrc` 和 `package.json`）
- npm
- Windows（当前构建验证平台）

## 开始使用

```bash
npm ci
npm run dev
```

`npm run dev` 会启动 Electron 窗口。使用方向键或 WASD 移动角色，角色会从西南路口沿道路探索；窗口失去焦点时活动输入会被清除。

## 验证命令

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run build` 生成 Windows 应用文件，不生成安装程序。

地图冒烟检查：运行 `npm run dev`，确认玩家从西南路口出现，方向键和 WASD 能沿道路移动，草地边缘会阻挡玩家，镜头会跟随移动，并且世界边界不会显示地图之外的区域。

## 架构边界

- Electron main 进程负责桌面窗口和受保护的运行时边界。
- Electron renderer 负责 Phaser 场景、键盘输入转换和显示层。
- preload 当前为空，不暴露 IPC 或其他特权 API。
- Game Domain 的 `advanceWorld` 负责与框架无关的世界状态转换；它接收当前世界状态、输入快照、帧时间和静态移动规则，并返回新的权威状态。
- `src/domain/road-map.ts` 保存道路范围、世界尺寸、出生点、脚底碰撞区域和静态移动规则；领域层使用脚底区域判定道路可行走性，并用小步进防止大帧穿越草地。
- 当前世界状态包含玩家位置、朝向、实际移动状态，以及为后续互动和对话保留的状态槽位；Phaser 只读取输入并渲染领域层返回的位置。
- Pi Agent Runtime 将在未来通过受限的游戏工具接入，不直接拥有游戏状态或系统权限。

## 当前范围之外

Pi、NPC、建筑和正式地图素材、战斗、对话、存档、音频、安装程序和跨平台构建均不属于当前 MVP。
