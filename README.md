# Coding CLI Guide

Qwen CLI 架构交互式学习指南，帮助开发者深入理解 CLI 的内部实现与 AI 工具交互模式。

## 预览

```bash
npm install
npm run dev
```

访问 http://localhost:5173

## 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Mermaid（流程图渲染）

## 内容模块

### 核心架构
- **启动流程** - CLI 初始化与启动链
- **请求生命周期** - 用户输入到响应的完整流程
- **交互循环** - Agent Loop 核心机制
- **内存管理** - 上下文窗口与对话历史

### AI 交互
- **Gemini Chat 核心** - LLM 调用与响应处理
- **System Prompt 架构** - 系统提示词构建
- **内容生成器** - 流式输出与 Tool Call 解析
- **VLM 切换** - 视觉模型自动切换逻辑

### 工具系统
- **工具参考** - 内置工具一览
- **工具调度器** - 并行执行与依赖管理
- **工具架构** - Tool Schema 与执行流程
- **MCP 集成** - Model Context Protocol 服务器

### 命令系统
- **斜杠命令** - /help, /clear 等内置命令
- **自定义命令** - 用户自定义 Slash Commands
- **@ 命令** - @file, @web 等上下文注入
- **Shell 模式** - 交互式与非交互式 Shell

### 安全与扩展
- **审批模式** - 工具执行权限控制
- **可信文件夹** - 目录级别权限管理
- **沙箱系统** - Docker/Seatbelt 隔离执行
- **Checkpointing** - Git 快照与回滚

### 其他
- **IDE 集成** - VS Code / Cursor 扩展
- **Subagent 系统** - 子代理任务委派
- **遥测系统** - OpenTelemetry 集成
- **主题系统** - 终端主题配置

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview

# Lint
npm run lint
```

## 相关项目

- [Qwen CLI](https://github.com/zhimanai/qwen-cli) - 主项目
