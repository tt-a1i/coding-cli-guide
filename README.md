<div align="center">

<br/>

<img src="./public/favicon.svg" alt="Coding CLI Guide" width="80" />

<br/>

# Coding CLI Guide

**Interactive Architecture Guide for AI Coding CLIs**

Deeply dissect the internals of Gemini CLI — from startup chain to tool scheduling, from Agent Loop to security sandbox.

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-→_Try_it_now-2563eb?style=for-the-badge&logo=github-pages&logoColor=white)](https://tt-a1i.github.io/coding-cli-guide/)

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Mermaid](https://img.shields.io/badge/Mermaid-Diagrams-FF3670?style=flat-square&logo=mermaid&logoColor=white)
![Prism.js](https://img.shields.io/badge/Prism.js-Syntax-1a1a2e?style=flat-square)
![Pages](https://img.shields.io/badge/Pages-158+-22c55e?style=flat-square)
![Animations](https://img.shields.io/badge/Animations-120+-a855f7?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-GitHub_Pages-222?style=flat-square&logo=github&logoColor=white)

</div>

<br/>

---

## Why

Source code of AI Coding CLIs (Gemini CLI, Claude Code, Qwen Code, etc.) can be tens of thousands of lines. Reading them directly is overwhelming. This project distills the core architecture of **Gemini CLI** into **158 interactive pages** with **Mermaid flowcharts** and **120+ step-by-step animations**, so you can visually understand every internal mechanism right in the browser.

> Shareable · Searchable · Deep-linkable — every topic has its own URL for team sharing and discussion.

---

## Features

<table>
<tr>
<td width="50%">

### Panoramic Architecture Breakdown
From the first line of CLI startup to the full request lifecycle: user input → model invocation → tool execution → response rendering. Every step has a corresponding visual page.

</td>
<td width="50%">

### 120+ Step-by-step Animations
Not static docs — key processes (Agent Loop, tool scheduling, MCP handshake, token calculation, etc.) come with interactive step-through animation demos.

</td>
</tr>
<tr>
<td>

### Deep Dive into Tool System
Tool registration, schema definitions, parallel scheduling, permission approval, result caching — complete coverage from `ToolReference` to `ToolScheduler`.

</td>
<td>

### Security Mechanisms Explained
Approval mode, trusted folders, sandbox isolation (Docker / Seatbelt), Git checkpointing, loop detection, command injection detection — security boundaries at a glance.

</td>
</tr>
<tr>
<td>

### Extensions & Integrations
Agent framework, subagent system, MCP protocol, IDE extensions (VS Code / Cursor / Zed), prompt registry — how the CLI interacts with the outside world.

</td>
<td>

### Multiple Learning Paths
Quick start, end-to-end walkthrough, learning path guides — whether you want a quick overview or deep research, there's a reading route for you.

</td>
</tr>
</table>

---

## Content Map

```
Quick Start        Start Here · Learning Paths · Architecture Overview · E2E Walkthrough · Glossary
Core Mechanisms    Startup Flow · Request Lifecycle · Interaction Loop · Turn State Machine · Token System
                   Session Persistence · Service Layer · Prompt Building · Streaming · Multi-provider
Tool System        Tool Reference · Dev Guide · Scheduler · File Discovery · Architecture · Execution
Command System     Slash Commands · Custom Commands · @Commands · Shell Modes · Prompt Processor · Memory
Extensions         Agent Framework · Agent Skills · Subagent · MCP · IDE Integration · Zed ACP
Events & Policy    Hook System · Policy Engine · Message Bus · Model Router · Model Availability
Security           Approval Mode · Trust · Checkpointing · Sandbox · Loop Detection · Error Recovery
Run Modes          Non-interactive · Chat Compression · Output Format · Session Resume · Recording
UI & Observability Render Layer · State Management · Components · React Hooks · Keybindings · Theme · Telemetry
Animations         50+ Core Process Animations + 60+ Internal Mechanism Animations
Appendix           Config System · Auth Flow · Model Config · Design Tradeoffs · Concurrency · Error Patterns
```

---

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Run Locally

```bash
git clone https://github.com/tt-a1i/coding-cli-guide.git
cd coding-cli-guide
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Or Try Online

**https://tt-a1i.github.io/coding-cli-guide/**

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 (Hooks) |
| **Language** | TypeScript 5.9 |
| **Build** | Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **Diagrams** | Mermaid |
| **Syntax Highlighting** | Prism.js |
| **Deployment** | GitHub Pages (GitHub Actions) |

---

## Development

```bash
npm run dev       # Start dev server
npm run build     # Production build (with TypeScript type check)
npm run preview   # Preview production build
npm run lint      # Lint check
```

---

## Project Structure

```
src/
├── pages/              # 158 content pages (incl. 120+ animation pages)
│   └── animations/     # Animation helper components
├── components/         # Shared UI components
│   ├── MermaidDiagram  #   Mermaid diagram renderer
│   ├── CodeBlock       #   Code block + syntax highlighting
│   ├── FlowDiagram     #   Flow diagram component
│   ├── Tabs            #   Tab switcher
│   └── ...
├── contexts/           # React Context
├── nav.ts              # Navigation tree (13 groups · 160 entries)
├── types/              # TypeScript types
└── utils/              # Utilities
```

---

## Related Projects

| Project | Description |
|---------|-------------|
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Google's official Gemini CLI — the subject of this guide |
| [Qwen Code](https://github.com/QwenLM/qwen-code) | A derivative based on Gemini CLI, useful for comparison |

---

## Contributing

Issues and Pull Requests are welcome! Whether it's fixing errors, adding content, or improving animations — all contributions are appreciated.

---

## License

[MIT](./LICENSE.md)

<div align="center">
<br/>
<sub>Built with React · TypeScript · Tailwind CSS · Mermaid · Prism.js</sub>
<br/><br/>
</div>

---

<details>
<summary><strong>🇨🇳 中文版</strong></summary>

<br/>

<div align="center">

<img src="./public/favicon.svg" alt="Coding CLI Guide" width="80" />

<br/>

# Coding CLI Guide

**AI Coding CLI 架构交互式学习指南**

深入拆解 Gemini CLI 内部实现，从启动链路到工具调度，从 Agent Loop 到安全沙箱

<br/>

[![在线体验](https://img.shields.io/badge/在线体验-→_立即访问-2563eb?style=for-the-badge&logo=github-pages&logoColor=white)](https://tt-a1i.github.io/coding-cli-guide/)

</div>

<br/>

### 为什么做这个

AI Coding CLI（如 Gemini CLI、Claude Code、Qwen Code）的源码动辄数万行，直接阅读容易迷失。本项目将 **Gemini CLI** 的核心架构提炼为 **158 个交互式页面**，配合 **Mermaid 流程图** 和 **120+ 步进动画**，让你在浏览器中就能直观理解每一个内部机制。

> 可分享 · 可检索 · 可深链 — 每个知识点都有独立 URL，方便团队内传阅与讨论。

### 特性

| | |
|---|---|
| **全景式架构拆解** — 从 CLI 启动的第一行代码，到完整请求生命周期的可视化 | **120+ 步进动画** — Agent Loop、工具调度、MCP 握手等关键流程的交互式演示 |
| **深入工具系统** — 注册、Schema、并行调度、权限审批、结果缓存全覆盖 | **安全机制全解** — 审批模式、信任机制、沙箱隔离、循环检测一览无余 |
| **扩展与集成** — Agent 框架、Subagent、MCP 协议、IDE 扩展 | **多种学习路径** — 快速入门、端到端走读、学习路径指南 |

### 内容地图

```
快速入门        Start Here · 学习路径 · 架构概览 · 端到端走读 · 术语表
核心机制        启动链路 · 请求生命周期 · 交互主循环 · Turn 状态机 · Token 体系
                会话持久化 · 服务层架构 · Prompt 构建 · 流式响应 · 多厂商兼容层
工具系统        工具参考 · 开发指南 · 调度详解 · 文件发现 · 工具架构 · 执行流程
命令系统        斜杠命令 · 自定义命令 · @命令 · Shell 模式 · Prompt 处理器 · 记忆系统
扩展集成        Agent 框架 · Agent Skills · Subagent · MCP 集成 · IDE 集成 · Zed ACP
事件与策略      Hook 系统 · Policy 引擎 · 消息总线 · 模型路由 · 模型可用性
安全可靠        审批模式 · 信任机制 · 检查点恢复 · 沙箱系统 · 循环检测 · 错误恢复
运行模式        非交互模式 · 聊天压缩 · 输出格式化 · 会话恢复 · 会话录制
UI 与观测       渲染层 · 状态管理 · 组件库 · React Hooks · 键盘绑定 · 主题 · 遥测
动画演示        50+ 核心流程动画 + 60+ 内部机制动画
附录            配置系统 · 认证流程 · 模型配置 · 设计权衡 · 并发模式 · 错误恢复模式
```

### 本地运行

```bash
git clone https://github.com/tt-a1i/coding-cli-guide.git
cd coding-cli-guide
npm install
npm run dev
```

浏览器访问 **http://localhost:5173**

### 相关项目

| 项目 | 说明 |
|------|------|
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Google 官方 Gemini CLI — 本指南的分析对象 |
| [Qwen Code](https://github.com/QwenLM/qwen-code) | 基于 Gemini CLI 的衍生实现，可对照阅读 |

### 许可证

[MIT](./LICENSE.md)

</details>
