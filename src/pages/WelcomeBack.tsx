import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function WelcomeBack() {
  const welcomeBackFlowChart = `flowchart TD
    start([启动 CLI])
    check_enabled{检查<br/>enableWelcomeBack}
    check_summary[检查<br/>PROJECT_SUMMARY.md]
    has_summary{存在摘要?}
    show_dialog[显示<br/>Welcome Back 对话框]
    user_choice{用户选择}
    load_context[加载摘要<br/>@.innies/PROJECT_SUMMARY.md]
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
    user_choice -->|继续| load_context
    load_context --> continue

    style start fill:#22d3ee,color:#000
    style check_enabled fill:#f59e0b,color:#000
    style has_summary fill:#f59e0b,color:#000
    style user_choice fill:#f59e0b,color:#000
    style new_session fill:#22c55e,color:#000
    style continue fill:#22c55e,color:#000`;

  const quitConfirmFlowChart = `flowchart TD
    start([触发退出<br/>Ctrl+C 或 /quit-confirm])
    show_dialog[显示退出<br/>确认对话框]
    choice{用户选择}
    quit_now([立即退出])
    gen_summary[生成摘要<br/>/summary]
    save_chat[保存对话<br/>/chat save]
    quit_after([退出])

    start --> show_dialog
    show_dialog --> choice
    choice -->|立即退出| quit_now
    choice -->|生成摘要| gen_summary
    choice -->|保存对话| save_chat
    gen_summary --> quit_after
    save_chat --> quit_after

    style start fill:#22d3ee,color:#000
    style choice fill:#f59e0b,color:#000
    style quit_now fill:#ef4444,color:#fff
    style quit_after fill:#22c55e,color:#000`;

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
- [TODO] 通知系统
- [TODO] 单元测试

---

## Summary Metadata

**Update time**: 2025-01-10T15:30:00.000Z`;

  const settingsConfigCode = `// 启用/禁用 Welcome Back 功能
// 来源: packages/cli/src/config/settings.ts:129

// settings.json - v2 配置格式
{
  "ui": {
    "enableWelcomeBack": true  // 默认: true
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
✓ 保存到 .innies/PROJECT_SUMMARY.md

项目摘要已生成！下次启动时将显示 Welcome Back 对话框。

// 摘要包含的内容：
// - Overall Goal: 高层目标
// - Key Knowledge: 技术决策、架构、约束
// - Recent Actions: 最近完成的工作
// - Current Plan: 任务状态 ([DONE], [IN PROGRESS], [TODO])`;

  const quitConfirmCode = `// /quit-confirm 命令 - 安全退出

> /quit-confirm

┌─────────────────────────────────────────┐
│           退出确认                       │
│                                         │
│  ○ Quit immediately                     │
│    立即退出，不保存任何内容               │
│                                         │
│  ○ Generate summary and quit            │
│    生成项目摘要后退出                    │
│    (下次启动时可继续)                    │
│                                         │
│  ○ Save conversation and quit           │
│    保存对话记录后退出                    │
│    (可通过 /chat resume 恢复)            │
│                                         │
│  [Enter] 确认  [Esc] 取消               │
└─────────────────────────────────────────┘

// 快捷键: Ctrl+C 连按两次也会触发此对话框`;

  const welcomeBackDialogCode = `// Welcome Back 对话框内容

┌──────────────────────────────────────────────────────────┐
│  👋 Welcome Back!                                        │
│                                                          │
│  Last updated: 2025-01-10 15:30                          │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Overall Goal:                                           │
│  构建一个响应式的用户仪表板，支持实时数据更新             │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Current Plan:                                           │
│  ✓ [DONE] 用户认证                                       │
│  ✓ [DONE] 仪表板布局                                     │
│  ⏳ [IN PROGRESS] 实时数据组件                           │
│  ○ [TODO] 通知系统                                       │
│  ○ [TODO] 单元测试                                       │
│                                                          │
│  Tasks: 5 total | 2 done | 1 in progress | 2 pending     │
│                                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  ○ Start new chat session                                │
│  ● Continue previous conversation                        │
│                                                          │
│  [Enter] 确认  [Esc] 开始新会话                          │
└──────────────────────────────────────────────────────────┘`;

  const fileStructureCode = `// Welcome Back 相关文件结构

your-project/
├── .innies/
│   ├── PROJECT_SUMMARY.md     # 项目摘要文件
│   ├── settings.json          # 项目设置
│   └── ...
└── ...

~/.innies/
├── settings.json              # 用户全局设置
├── tmp/
│   └── <project_hash>/
│       ├── chat_<tag>.json    # /chat save 保存的对话
│       └── ...
└── ...`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Welcome Back & 退出确认</h2>
        <p className="text-gray-300 mb-4">
          Welcome Back 功能帮助你无缝恢复工作，自动检测项目摘要并提供继续上次对话的选项。
          配合 /quit-confirm 的安全退出机制，确保工作不会意外丢失。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="Welcome Back" variant="green">
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 自动检测 PROJECT_SUMMARY.md</li>
              <li>• 显示上次的目标和进度</li>
              <li>• 一键继续上次对话</li>
              <li>• 保持工作连贯性</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="Quit Confirm" variant="blue">
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Ctrl+C 两次触发</li>
              <li>• 三种退出选项</li>
              <li>• 生成摘要或保存对话</li>
              <li>• 防止工作意外丢失</li>
            </ul>
          </HighlightBox>
        </div>
      </section>

      {/* Welcome Back 流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">Welcome Back 检测流程</h3>
        <MermaidDiagram chart={welcomeBackFlowChart} title="Welcome Back 检测流程" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-3">自动检测条件</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400">1.</span>
              <div>
                <strong>enableWelcomeBack 设置</strong>
                <span className="text-gray-400"> - 默认启用，可在 settings.json 中关闭</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">2.</span>
              <div>
                <strong>PROJECT_SUMMARY.md 存在</strong>
                <span className="text-gray-400"> - 检查 .innies/PROJECT_SUMMARY.md</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">3.</span>
              <div>
                <strong>有意义的对话历史</strong>
                <span className="text-gray-400"> - 确保摘要内容可用</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Welcome Back 对话框 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">Welcome Back 对话框</h3>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 font-mono text-sm">
          <pre className="text-gray-300 whitespace-pre overflow-x-auto">
{welcomeBackDialogCode}
          </pre>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <HighlightBox title="开始新会话" variant="blue">
            <p className="text-sm text-gray-300">
              关闭对话框，开始全新对话。不加载任何上次的上下文。
            </p>
          </HighlightBox>

          <HighlightBox title="继续上次对话" variant="green">
            <p className="text-sm text-gray-300">
              自动填充输入框：<br/>
              <code className="text-xs">@.innies/PROJECT_SUMMARY.md, Based on our previous conversation, Let's continue?</code>
            </p>
          </HighlightBox>
        </div>
      </section>

      {/* 项目摘要格式 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">PROJECT_SUMMARY.md 格式</h3>
        <CodeBlock code={projectSummaryFormat} language="markdown" title=".innies/PROJECT_SUMMARY.md" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-3">摘要段落说明</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="text-green-400 font-semibold">Overall Goal</h5>
              <p className="text-gray-400">单句描述高层目标</p>
            </div>
            <div>
              <h5 className="text-blue-400 font-semibold">Key Knowledge</h5>
              <p className="text-gray-400">技术决策、架构、约束条件</p>
            </div>
            <div>
              <h5 className="text-purple-400 font-semibold">Recent Actions</h5>
              <p className="text-gray-400">最近完成的工作和发现</p>
            </div>
            <div>
              <h5 className="text-yellow-400 font-semibold">Current Plan</h5>
              <p className="text-gray-400">任务列表，使用状态标记</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">[DONE]</span>
            <span className="text-gray-400">已完成</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">[IN PROGRESS]</span>
            <span className="text-gray-400">进行中</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">[TODO]</span>
            <span className="text-gray-400">待办</span>
          </div>
        </div>
      </section>

      {/* /summary 命令 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">/summary 命令</h3>
        <CodeBlock code={summaryCommandCode} language="text" title="生成项目摘要" />

        <HighlightBox title="使用提示" variant="blue">
          <p className="text-sm text-gray-300">
            <code>/summary</code> 需要至少 2 条消息的对话历史才能生成有意义的摘要。
            在对话中积累足够上下文后使用效果最佳。
          </p>
        </HighlightBox>
      </section>

      {/* 退出确认 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">/quit-confirm 退出确认</h3>
        <MermaidDiagram chart={quitConfirmFlowChart} title="/quit-confirm 退出流程" />
        <CodeBlock code={quitConfirmCode} language="text" title="退出确认对话框" />

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
            <h5 className="text-red-400 font-semibold">Quit immediately</h5>
            <p className="text-gray-400 text-xs mt-1">立即退出，不保存</p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
            <h5 className="text-green-400 font-semibold">Generate summary</h5>
            <p className="text-gray-400 text-xs mt-1">生成摘要后退出<br/>下次可继续</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
            <h5 className="text-blue-400 font-semibold">Save conversation</h5>
            <p className="text-gray-400 text-xs mt-1">保存对话后退出<br/>可 /chat resume</p>
          </div>
        </div>
      </section>

      {/* 配置 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">配置选项</h3>
        <CodeBlock code={settingsConfigCode} language="json" title="启用/禁用 Welcome Back" />
      </section>

      {/* 文件结构 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">文件结构</h3>
        <CodeBlock code={fileStructureCode} language="text" title="相关文件位置" />
      </section>

      {/* 工作流 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">推荐工作流</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold">1</div>
              <div>
                <h5 className="font-semibold text-white">开始工作</h5>
                <p className="text-gray-400 text-sm">启动 CLI，如果有 Welcome Back 提示，选择继续或新建</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold">2</div>
              <div>
                <h5 className="font-semibold text-white">进行开发</h5>
                <p className="text-gray-400 text-sm">与 AI 协作完成任务，积累对话上下文</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold">3</div>
              <div>
                <h5 className="font-semibold text-white">结束工作</h5>
                <p className="text-gray-400 text-sm">使用 <code>/quit-confirm</code> 或 Ctrl+C 两次，选择"生成摘要"</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 font-bold">4</div>
              <div>
                <h5 className="font-semibold text-white">下次继续</h5>
                <p className="text-gray-400 text-sm">重新启动时，Welcome Back 会显示上次的进度，一键继续</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">最佳实践</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">推荐做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 长期项目使用 /quit-confirm 退出</li>
              <li>✓ 定期运行 /summary 更新摘要</li>
              <li>✓ 保持摘要内容简洁有效</li>
              <li>✓ 利用任务状态跟踪进度</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">注意事项</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✗ 不要依赖摘要保存代码细节</li>
              <li>✗ 摘要只保存高层信息</li>
              <li>✗ 需要完整对话用 /chat save</li>
              <li>✗ 摘要不会自动更新</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
