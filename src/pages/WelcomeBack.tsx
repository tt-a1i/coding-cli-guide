import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { getThemeColor } from '../utils/theme';



export function WelcomeBack() {
 const welcomeBackFlowChart = `flowchart TD
 start([启动 CLI])
 check_enabled{"检查<br/>settings.ui.enableWelcomeBack"}
 check_summary["检查<br/>PROJECT_SUMMARY.md"]
 has_summary{"存在摘要?"}
 show_dialog["显示<br/>Welcome Back 对话框"]
 user_choice{用户选择}
 prefill_input["预填充输入框<br/>用户需按回车确认"]
 new_session([新会话])
 continue([继续对话])

 start --> check_enabled
 check_enabled -->|No| new_session
 check_enabled -->|Yes| check_summary
 check_summary --> has_summary
 has_summary -->|No| new_session
 has_summary -->|Yes| show_dialog
 show_dialog --> user_choice
 user_choice -->|新会话| new_session
 user_choice -->|继续| prefill_input
 prefill_input --> continue

 style start fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style check_enabled fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style has_summary fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style user_choice fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style new_session fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style continue fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const quitConfirmFlowChart = `flowchart TD
 start(["触发退出<br/>Ctrl+C 或 /quit-confirm"])
 show_dialog["显示退出<br/>确认对话框"]
 choice{用户选择}
 quit_now([立即退出])
 gen_summary["生成摘要<br/>/summary"]
 save_chat["保存对话<br/>/chat save"]
 quit_after([退出])

 start --> show_dialog
 show_dialog --> choice
 choice -->|立即退出| quit_now
 choice -->|生成摘要| gen_summary
 choice -->|保存对话| save_chat
 gen_summary --> quit_after
 save_chat --> quit_after

 style start fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style choice fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style quit_now fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:${getThemeColor("--color-text", "#1c1917")}
 style quit_after fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const welcomeBackDialogChart = `flowchart TD
 title_bar["Welcome Back!<br/>Last updated: 2025-01-10 15:30"]
 goal["Overall Goal:<br/>构建一个响应式的用户仪表板，支持实时数据更新"]
 plan["Current Plan:<br/>DONE 用户认证<br/>DONE 仪表板布局<br/>IN PROGRESS 实时数据组件<br/>PENDING 通知系统<br/>PENDING 单元测试"]
 stats["Tasks: 5 total | 2 done | 1 in progress | 2 pending"]
 choice{"用户选择"}
 new_session(["Start new chat session<br/>Esc 开始新会话"])
 continue(["Continue previous conversation<br/>Enter 确认"])

 title_bar --> goal --> plan --> stats --> choice
 choice -->|新会话| new_session
 choice -->|继续| continue

 style title_bar fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style choice fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style new_session fill:${getThemeColor("--mermaid-muted-fill", "#f4f4f2")},color:${getThemeColor("--color-text", "#1c1917")}
 style continue fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
`;

 const projectSummaryFormat = `# Project Summary

## Overall Goal

<!-- 单句描述高层目标 -->
构建一个响应式的用户仪表板，支持实时数据更新。

## Key Knowledge

<!-- 关键技术决策和约束 -->
- 使用 React 18 + TypeScript
- 状态管理采用 Zustand
- API 使用 GraphQL 订阅实现实时更新
- 遵循 Airbnb 代码风格

## Recent Actions

<!-- 最近完成的工作 -->
- 完成了用户认证模块
- 实现了仪表板布局框架
- 集成了 GraphQL 客户端

## Current Plan

<!-- 当前开发计划 -->
- [DONE] 用户认证
- [DONE] 仪表板布局
- [IN PROGRESS] 实时数据组件
- [PENDING] 通知系统
- [PENDING] 单元测试

---

## Summary Metadata

**Update time**: 2025-01-10T15:30:00.000Z`;

 const settingsConfigCode = `// 启用/禁用 Welcome Back 功能
// 来源: packages/cli/src/config/settings.ts:129

// settings.json - v2 配置格式
{
  "ui": {
  "enableWelcomeBack": true // 默认: true
  }
}

// 或通过 /settings 命令交互式设置
> /settings
> 找到 "Enable Welcome Back" 选项
> 切换开关`;

 const summaryCommandCode = `// /summary 命令 - 生成项目摘要

> /summary

生成项目摘要中...
✓ 分析对话历史
✓ 提取关键信息
✓ 保存到 .gemini/PROJECT_SUMMARY.md

项目摘要已生成！下次启动时将显示 Welcome Back 对话框。

// 摘要包含的内容：
// - Overall Goal: 高层目标
// - Key Knowledge: 技术决策、架构、约束
// - Recent Actions: 最近完成的工作
// - Current Plan: 任务状态 ([DONE], [IN PROGRESS], [PENDING])`;

 const quitConfirmCode = `// /quit-confirm 命令 - 安全退出

> /quit-confirm

┌─────────────────────────────────────────┐
│ 退出确认 │
│ │
│ ○ Quit immediately │
│ 立即退出，不保存任何内容 │
│ │
│ ○ Generate summary and quit │
│ 生成项目摘要后退出 │
│ (下次启动时可继续) │
│ │
│ ○ Save conversation and quit │
│ 保存对话记录后退出 │
│ (可通过 /chat resume 恢复) │
│ │
│ [Enter] 确认 [Esc] 取消 │
└─────────────────────────────────────────┘

// 快捷键: Ctrl+C 连按两次也会触发此对话框`;

 const fileStructureCode = `// Welcome Back 相关文件结构

your-project/
├── .gemini/
│ ├── PROJECT_SUMMARY.md # 项目摘要文件
│ ├── settings.json # 项目设置
│ └── ...
└── ...

~/.gemini/
├── settings.json # 用户全局设置
├── tmp/
│ └── <project_hash>/
│ ├── chat_<tag>.json # /chat save 保存的对话
│ └── ...
└── ...`;

 return (
 <div className="space-y-8">
 {/* 概述 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">Welcome Back & 退出确认</h2>
 <p className="text-body mb-4">
 Welcome Back 功能帮助你无缝恢复工作，自动检测项目摘要并提供继续上次对话的选项。
 配合 /quit-confirm 的安全退出机制，确保工作不会意外丢失。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="Welcome Back" variant="green">
 <ul className="text-sm text-body space-y-1">
 <li>自动检测 PROJECT_SUMMARY.md</li>
 <li>显示上次的目标和进度</li>
 <li>快速继续上次对话</li>
 <li>保持工作连贯性</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="Quit Confirm" variant="blue">
 <ul className="text-sm text-body space-y-1">
 <li>Ctrl+C 两次触发</li>
 <li>三种退出选项</li>
 <li>生成摘要或保存对话</li>
 <li>防止工作意外丢失</li>
 </ul>
 </HighlightBox>
 </div>
 </section>

 {/* Welcome Back 流程 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">Welcome Back 检测流程</h3>
 <MermaidDiagram chart={welcomeBackFlowChart} title="Welcome Back 检测流程" />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">自动检测条件</h4>
 <ul className="text-sm text-body space-y-2">
 <li className="flex items-start gap-2">
 <span className="text-heading">1.</span>
 <div>
 <strong>settings.ui.enableWelcomeBack 设置</strong>
 <span className="text-body"> - 默认启用，可在 settings.json 中关闭</span>
 </div>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">2.</span>
 <div>
 <strong>PROJECT_SUMMARY.md 存在</strong>
 <span className="text-body"> - 检查 .gemini/PROJECT_SUMMARY.md</span>
 </div>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">3.</span>
 <div>
 <strong>有意义的对话历史</strong>
 <span className="text-body"> - 确保摘要内容可用</span>
 </div>
 </li>
 </ul>
 </div>
 </section>

 {/* Welcome Back 对话框 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">Welcome Back 对话框</h3>
 <MermaidDiagram chart={welcomeBackDialogChart} title="Welcome Back 对话框" />

 <div className="mt-4 grid grid-cols-2 gap-4">
 <HighlightBox title="开始新会话" variant="blue">
 <p className="text-sm text-body">
 关闭对话框，开始全新对话。不加载任何上次的上下文。
 </p>
 </HighlightBox>

 <HighlightBox title="继续上次对话" variant="green">
 <p className="text-sm text-body">
 预填充输入框内容，用户需按回车确认发送：<br/>
 <code className="text-xs">@.gemini/PROJECT_SUMMARY.md, Based on our previous conversation, Let's continue?</code>
 </p>
 </HighlightBox>
 </div>
 </section>

 {/* 项目摘要格式 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">PROJECT_SUMMARY.md 格式</h3>
 <CodeBlock code={projectSummaryFormat} language="markdown" title=".gemini/PROJECT_SUMMARY.md" />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">摘要段落说明</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <h5 className="text-heading font-semibold">Overall Goal</h5>
 <p className="text-body">单句描述高层目标</p>
 </div>
 <div>
 <h5 className="text-heading font-semibold">Key Knowledge</h5>
 <p className="text-body">技术决策、架构、约束条件</p>
 </div>
 <div>
 <h5 className="text-heading font-semibold">Recent Actions</h5>
 <p className="text-body">最近完成的工作和发现</p>
 </div>
 <div>
 <h5 className="text-heading font-semibold">Current Plan</h5>
 <p className="text-body">任务列表，使用状态标记</p>
 </div>
 </div>
 </div>

 <div className="mt-4 flex gap-4 text-sm">
 <div className="flex items-center gap-2">
 <span className="text-heading">[DONE]</span>
 <span className="text-body">已完成</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-heading">[IN PROGRESS]</span>
 <span className="text-body">进行中</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-body">[PENDING]</span>
 <span className="text-body">待办</span>
 </div>
 </div>
 </section>

 {/* /summary 命令 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">/summary 命令</h3>
 <CodeBlock code={summaryCommandCode} language="text" title="生成项目摘要" />

 <HighlightBox title="使用提示" variant="blue">
 <p className="text-sm text-body">
 <code>/summary</code> 需要至少 2 条消息的对话历史才能生成有意义的摘要。
 在对话中积累足够上下文后使用效果最佳。
 </p>
 </HighlightBox>
 </section>

 {/* 退出确认 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">/quit-confirm 退出确认</h3>
 <MermaidDiagram chart={quitConfirmFlowChart} title="/quit-confirm 退出流程" />
 <CodeBlock code={quitConfirmCode} language="text" title="退出确认对话框" />

 <div className="mt-4 grid grid-cols-3 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4 text-center">
 <h5 className="text-heading font-semibold">Quit immediately</h5>
 <p className="text-body text-xs mt-1">立即退出，不保存</p>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4 text-center">
 <h5 className="text-heading font-semibold">Generate summary</h5>
 <p className="text-body text-xs mt-1">生成摘要后退出<br/>下次可继续</p>
 </div>
 <div className="bg-elevated/20 border border-edge rounded-lg p-4 text-center">
 <h5 className="text-heading font-semibold">Save conversation</h5>
 <p className="text-body text-xs mt-1">保存对话后退出<br/>可 /chat resume</p>
 </div>
 </div>
 </section>

 {/* 配置 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">配置选项</h3>
 <CodeBlock code={settingsConfigCode} language="json" title="启用/禁用 Welcome Back" />
 </section>

 {/* 文件结构 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">文件结构</h3>
 <CodeBlock code={fileStructureCode} language="text" title="相关文件位置" />
 </section>

 {/* 工作流 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">推荐工作流</h3>
 <div className="bg-surface rounded-lg p-6">
 <div className="space-y-4">
 <div className="flex items-start gap-4">
 <div className="w-8 h-8 rounded-full bg-elevated/20 border border-edge flex items-center justify-center text-heading font-bold">1</div>
 <div>
 <h5 className="font-semibold text-heading">开始工作</h5>
 <p className="text-body text-sm">启动 CLI，如果有 Welcome Back 提示，选择继续或新建</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="w-8 h-8 rounded-full bg-elevated/20 border border-edge flex items-center justify-center text-heading font-bold">2</div>
 <div>
 <h5 className="font-semibold text-heading">进行开发</h5>
 <p className="text-body text-sm">与 AI 协作完成任务，积累对话上下文</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="w-8 h-8 rounded-full bg-elevated/20 border border-edge flex items-center justify-center text-heading font-bold">3</div>
 <div>
 <h5 className="font-semibold text-heading">结束工作</h5>
 <p className="text-body text-sm">使用 <code>/quit-confirm</code> 或 Ctrl+C 两次，选择"生成摘要"</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="w-8 h-8 rounded-full bg-elevated border-l-2 border-l-edge-hover flex items-center justify-center text-heading font-bold">4</div>
 <div>
 <h5 className="font-semibold text-heading">下次继续</h5>
 <p className="text-body text-sm">重新启动时，Welcome Back 会显示上次的进度，快速继续工作</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* 最佳实践 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">最佳实践</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">推荐做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>长期项目使用 /quit-confirm 退出</li>
 <li>定期运行 /summary 更新摘要</li>
 <li>保持摘要内容简洁有效</li>
 <li>利用任务状态跟踪进度</li>
 </ul>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">注意事项</h4>
 <ul className="text-sm text-body space-y-1">
 <li>不要依赖摘要保存代码细节</li>
 <li>摘要只保存高层信息</li>
 <li>需要完整对话用 /chat save</li>
 <li>摘要不会自动更新</li>
 </ul>
 </div>
 </div>
 </section>
 </div>
 );
}
