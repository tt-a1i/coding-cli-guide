import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { Module } from '../components/Module';
import { ComparisonTable } from '../components/ComparisonTable';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏗️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">架构设计理念</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🎯 核心设计原则</h4>
            <ul className="text-[var(--text-secondary)] text-sm space-y-2">
              <li>• <strong>请求-响应模式</strong>：AI 不是持续运行的服务，每次交互都是独立的 API 调用</li>
              <li>• <strong>CLI 为中心</strong>：所有工具执行发生在本地，AI 只负责决策</li>
              <li>• <strong>流式处理</strong>：实时处理 AI 响应，提供即时反馈</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🔧 为什么这样设计</h4>
            <div className="text-[var(--text-secondary)] text-sm space-y-2">
              <p><strong>安全性</strong>：工具在本地执行意味着用户完全控制权限，不需要将敏感数据发送到云端</p>
              <p><strong>灵活性</strong>：CLI 层和 Core 层分离，便于适配不同 AI 提供商（Gemini/OpenAI）</p>
              <p><strong>可扩展性</strong>：通过 MCP 协议支持动态工具注册，无需修改核心代码</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🏗️ 分层架构</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--terminal-green)]/30 text-center">
                <div className="text-[var(--terminal-green)] font-semibold text-sm">UI Layer</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">React/Ink<br/>用户交互</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--cyber-blue)]/30 text-center">
                <div className="text-[var(--cyber-blue)] font-semibold text-sm">Core Layer</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">GeminiChat<br/>核心循环</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--amber)]/30 text-center">
                <div className="text-[var(--amber)] font-semibold text-sm">Tool Layer</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">20+ 工具<br/>本地执行</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--purple)]/30 text-center">
                <div className="text-[var(--purple)] font-semibold text-sm">API Layer</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">多厂商<br/>统一抽象</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">⚖️ 设计权衡</h4>
            <div className="text-[var(--text-secondary)] text-sm space-y-2">
              <p><strong>复杂性 vs 灵活性</strong>：多层架构增加了代码复杂度，但提供了极大的扩展能力</p>
              <p><strong>安全 vs 便利</strong>：审批机制可能降低效率，但保护了用户免受误操作</p>
              <p><strong>通用 vs 专用</strong>：支持多 AI 厂商需要抽象层，但增加了维护成本</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Overview() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  return (
    <div>
      {/* 版本提示 */}
      <div className="mb-6 px-4 py-3 bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">📦</span>
          <div>
            <span className="text-[var(--text-secondary)] text-sm">本文档基于 </span>
            <code className="px-2 py-0.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded text-sm font-mono">
              gemini-cli v0.24.0-nightly
            </code>
          </div>
        </div>
        <a
          href="https://github.com/google-gemini/gemini-cli"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--cyber-blue)] transition-colors flex items-center gap-1"
        >
          <span>查看源码</span>
          <span>↗</span>
        </a>
      </div>

      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      <Layer title="整体架构" icon="🏗️">
        <HighlightBox title="核心理解" icon="💡" variant="blue">
          <p>
            <strong>AI 不是一直运行的！</strong> 每次 AI
            请求都是独立的 HTTP 调用。CLI 负责：
          </p>
          <ul className="mt-2 pl-5 list-disc">
            <li>发送请求给 AI</li>
            <li>接收 AI 的响应</li>
            <li>如果 AI 说"我要调用工具"，CLI 执行工具</li>
            <li>把工具结果发给 AI，继续下一轮</li>
          </ul>
        </HighlightBox>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-5">
          <Module icon="👤" name="用户" description="在终端输入问题" />
          <Module
            icon="🖥️"
            name="CLI 层"
            path="packages/cli"
            description="UI 渲染、用户交互"
          />
          <Module
            icon="⚙️"
            name="Core 层"
            path="packages/core"
            description="AI 客户端、工具调度"
          />
          <Module
            icon="🔧"
            name="工具层"
            path="packages/core/src/tools"
            description="ReadFile、Edit、Shell 等"
          />
          <Module
            icon="☁️"
            name="AI API"
            description="Gemini / OpenAI"
          />
        </div>

        {/* 新增：事件驱动架构模块 */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            事件驱动架构
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Module
              icon="🪝"
              name="Hook 系统"
              path="packages/core/src/hooks"
              description="事件拦截与扩展点"
            />
            <Module
              icon="🛡️"
              name="Policy 引擎"
              path="packages/core/src/policy"
              description="安全策略与权限决策"
            />
            <Module
              icon="📡"
              name="消息总线"
              path="packages/core/src/confirmation-bus"
              description="发布/订阅异步通信"
            />
          </div>
        </div>

        {/* 新增：智能路由与代理模块 */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="text-xl">🧠</span>
            智能路由与代理
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Module
              icon="🔀"
              name="模型路由"
              path="packages/core/src/routing"
              description="Flash/Pro 智能选择"
            />
            <Module
              icon="🤖"
              name="Agent 框架"
              path="packages/core/src/agents"
              description="子代理执行与编排"
            />
          </div>
        </div>
      </Layer>

      {/* 核心流程 */}
      <Layer title="核心交互流程" icon="🔄">
        <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--terminal-green)]/20 flex items-center justify-center text-2xl border-2 border-[var(--terminal-green)]">
                👤
              </div>
              <div className="mt-2 text-sm font-mono text-[var(--terminal-green)]">用户输入</div>
            </div>
            <div className="text-[var(--text-muted)] text-2xl">→</div>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--cyber-blue)]/20 flex items-center justify-center text-2xl border-2 border-[var(--cyber-blue)]">
                🤖
              </div>
              <div className="mt-2 text-sm font-mono text-[var(--cyber-blue)]">AI 思考</div>
            </div>
            <div className="text-[var(--text-muted)] text-2xl">→</div>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--amber)]/20 flex items-center justify-center text-2xl border-2 border-[var(--amber)]">
                🔧
              </div>
              <div className="mt-2 text-sm font-mono text-[var(--amber)]">工具执行</div>
            </div>
            <div className="text-[var(--text-muted)] text-2xl">→</div>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--purple)]/20 flex items-center justify-center text-2xl border-2 border-[var(--purple)]">
                📝
              </div>
              <div className="mt-2 text-sm font-mono text-[var(--purple)]">结果反馈</div>
            </div>
            <div className="text-[var(--text-muted)] text-2xl hidden md:block">↻</div>
          </div>
          <p className="text-center text-sm text-[var(--text-muted)] mt-4 font-mono">
            这个循环持续进行，直到 AI 返回 finish_reason: STOP
          </p>
        </div>
      </Layer>

      {/* 数据流详解 */}
      <Layer title="数据流详解" icon="🌊">
        <p className="mb-4">
          理解数据在系统中如何流动是掌握架构的关键。下图展示了一次完整交互中数据的流向：
        </p>

        <MermaidDiagram chart={`
sequenceDiagram
    participant User as 用户终端
    participant UI as UI Layer<br/>(React/Ink)
    participant Core as Core Layer<br/>(GeminiChat)
    participant Policy as Policy Engine
    participant Hook as Hook System
    participant Tool as Tool Layer<br/>(Scheduler)
    participant API as AI API<br/>(Cloud)

    User->>UI: 输入 "帮我读取 package.json"
    Note over UI: 渲染输入框<br/>捕获用户输入

    UI->>Core: sendMessage(userInput)
    Note over Core: 构建消息历史<br/>附加工具定义

    Core->>API: POST /chat/completions
    Note over API: 流式返回<br/>SSE 格式

    API-->>Core: data: {"delta": "让我读取..."}
    Core-->>UI: onChunk(text)
    UI-->>User: 实时显示文字

    API-->>Core: data: {"tool_calls": [...]}
    Note over Core: finish_reason: tool_calls

    Core->>Hook: beforeToolExecution
    Hook-->>Core: hook result (env vars)

    Core->>Policy: checkPermission(tool, params)
    Policy-->>Core: ALLOW / DENY / ASK_USER

    alt ASK_USER
        Policy->>UI: 请求用户确认
        UI-->>Policy: 用户决定
    end

    Core->>Tool: executeToolCall(read_file, params)
    Note over Tool: 验证参数<br/>执行操作

    Tool->>Tool: fs.readFile(path)
    Tool-->>Core: { llmContent: "..." }

    Core->>Hook: afterToolExecution
    Hook-->>Core: hook result

    Core->>API: POST (with tool result)
    API-->>Core: data: {"content": "文件内容是..."}
    Note over Core: finish_reason: stop

    Core-->>UI: onComplete(response)
    UI-->>User: 显示最终回复
`} />

        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-white">数据流的关键节点</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">节点</th>
                  <th className="px-4 py-2 text-left text-gray-300">输入</th>
                  <th className="px-4 py-2 text-left text-gray-300">处理</th>
                  <th className="px-4 py-2 text-left text-gray-300">输出</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-green-400 font-semibold">UI Layer</td>
                  <td className="px-4 py-2 text-gray-300">用户按键事件</td>
                  <td className="px-4 py-2 text-gray-400">解析输入、处理快捷键、渲染 UI</td>
                  <td className="px-4 py-2 text-gray-300">结构化用户消息</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-blue-400 font-semibold">Core Layer</td>
                  <td className="px-4 py-2 text-gray-300">用户消息 + 历史</td>
                  <td className="px-4 py-2 text-gray-400">构建 API 请求、管理上下文、处理流</td>
                  <td className="px-4 py-2 text-gray-300">API 请求 / 工具调用指令</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-cyan-400 font-semibold">Hook System</td>
                  <td className="px-4 py-2 text-gray-300">事件触发 + 上下文</td>
                  <td className="px-4 py-2 text-gray-400">执行钩子脚本、注入环境变量</td>
                  <td className="px-4 py-2 text-gray-300">修改后的上下文 / 环境变量</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-orange-400 font-semibold">Policy Engine</td>
                  <td className="px-4 py-2 text-gray-300">工具调用请求</td>
                  <td className="px-4 py-2 text-gray-400">规则匹配、安全检查、权限决策</td>
                  <td className="px-4 py-2 text-gray-300">ALLOW / DENY / ASK_USER</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-yellow-400 font-semibold">Tool Layer</td>
                  <td className="px-4 py-2 text-gray-300">工具名 + 参数</td>
                  <td className="px-4 py-2 text-gray-400">验证参数、执行操作</td>
                  <td className="px-4 py-2 text-gray-300">执行结果 / 错误信息</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-purple-400 font-semibold">API Layer</td>
                  <td className="px-4 py-2 text-gray-300">HTTP 请求体</td>
                  <td className="px-4 py-2 text-gray-400">AI 推理（云端黑盒）</td>
                  <td className="px-4 py-2 text-gray-300">SSE 流式响应</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <HighlightBox title="流式处理的意义" icon="⚡" variant="green">
          <p className="mb-2">
            为什么要用流式（SSE）而不是等完整响应？
          </p>
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>用户体验</strong>：用户能立即看到 AI 在"思考"，不用盯着空白等待</li>
            <li><strong>早期中断</strong>：用户可以随时按 Ctrl+C 中断，不用等到完成</li>
            <li><strong>Token 节省</strong>：如果发现 AI 跑偏，可以早停，避免浪费 token</li>
            <li><strong>实时反馈</strong>：工具调用可以在响应中途识别，更早开始执行</li>
          </ul>
        </HighlightBox>
      </Layer>

      <Layer title="常见问题" icon="❓">
        <ComparisonTable
          headers={['问题', '答案']}
          rows={[
            [
              'AI 是一直运行的吗？',
              <span key="1">
                <strong>不是！</strong> AI 是云端服务，每次对话都是独立的 HTTP 请求
              </span>,
            ],
            [
              'AI 怎么知道有哪些工具？',
              <span key="2">
                CLI 在每次请求时，把<strong>工具定义</strong>
                （名称、描述、参数）发给 AI
              </span>,
            ],
            [
              'AI 怎么调用工具？',
              <span key="3">
                AI 在响应中返回<strong>特殊格式</strong>，说"我要调用 xxx 工具"
              </span>,
            ],
            [
              '谁执行工具？',
              <span key="4">
                <strong>CLI 执行！</strong> 不是 AI。AI 只是告诉 CLI 要调用什么
              </span>,
            ],
            [
              '为什么能持续工作？',
              <span key="5">
                CLI 有一个<strong>循环</strong>：请求 → 响应 → 执行工具 →
                再请求...
              </span>,
            ],
            [
              '什么是 Continuation？',
              <span key="6">
                当 AI 返回 <code className="bg-black/30 px-1 rounded">finish_reason != STOP</code> 时，
                CLI 自动将工具结果反馈给 AI <strong>继续对话</strong>
              </span>,
            ],
          ]}
        />
      </Layer>

      {/* 关键数字 */}
      <Layer title="关键数字" icon="📊">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-[var(--terminal-green)]">20+</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">内置工具</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-[var(--cyber-blue)]">100</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">最大轮次</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-[var(--amber)]">4</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">审批模式</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-[var(--purple)]">3</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">AI 厂商</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-red-400">2M</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">最大 Token</div>
          </div>
          <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-[var(--border-subtle)] text-center">
            <div className="text-2xl font-bold text-pink-400">∞</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">MCP 扩展</div>
          </div>
        </div>

        {/* 新增：事件驱动架构数字 */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-3">事件驱动架构</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-cyan-500/30 text-center">
              <div className="text-2xl font-bold text-cyan-400">11</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Hook 事件类型</div>
            </div>
            <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-orange-500/30 text-center">
              <div className="text-2xl font-bold text-orange-400">3</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Policy 决策类型</div>
            </div>
            <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-indigo-500/30 text-center">
              <div className="text-2xl font-bold text-indigo-400">9</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">消息总线类型</div>
            </div>
            <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-emerald-500/30 text-center">
              <div className="text-2xl font-bold text-emerald-400">4</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">路由策略</div>
            </div>
            <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-rose-500/30 text-center">
              <div className="text-2xl font-bold text-rose-400">2</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Agent 类型</div>
            </div>
            <div className="bg-[var(--bg-panel)] rounded-lg p-4 border border-violet-500/30 text-center">
              <div className="text-2xl font-bold text-violet-400">3</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">配置层级</div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 分层架构的深层原因 */}
      <Layer title="为什么要分层？" icon="🏛️">
        <p className="mb-4">
          分层架构不是"为了整洁"，而是解决了真实的工程问题。每一层都有其存在的必要性：
        </p>

        <div className="space-y-6">
          {/* UI Layer */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-green-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🖥️</span>
              <h4 className="text-lg font-semibold text-green-400">UI Layer（CLI 层）</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300 mb-2"><strong>解决的问题：</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>终端 UI 渲染（React + Ink）</li>
                  <li>用户输入处理（快捷键、多行编辑）</li>
                  <li>主题和样式管理</li>
                  <li>屏幕阅读器无障碍支持</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-300 mb-2"><strong>为什么独立？</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>UI 框架可能更换（Ink → 其他）</li>
                  <li>可以开发 Web 版、桌面版</li>
                  <li>测试时可以 mock UI 层</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Core Layer */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⚙️</span>
              <h4 className="text-lg font-semibold text-blue-400">Core Layer（核心层）</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300 mb-2"><strong>解决的问题：</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>AI 客户端抽象（多厂商支持）</li>
                  <li>对话循环管理</li>
                  <li>消息历史维护</li>
                  <li>Token 计数与压缩</li>
                  <li>工具调度协调</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-300 mb-2"><strong>为什么独立？</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>AI 厂商 API 差异巨大</li>
                  <li>可以作为 SDK 给其他项目用</li>
                  <li>核心逻辑与 UI 完全解耦</li>
                  <li>方便单元测试</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tool Layer */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🔧</span>
              <h4 className="text-lg font-semibold text-yellow-400">Tool Layer（工具层）</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300 mb-2"><strong>解决的问题：</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>工具注册与发现</li>
                  <li>参数验证</li>
                  <li>权限控制</li>
                  <li>执行隔离（沙箱）</li>
                  <li>结果格式化</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-300 mb-2"><strong>为什么独立？</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>工具可以独立开发和测试</li>
                  <li>支持 MCP 动态注册</li>
                  <li>安全边界清晰</li>
                  <li>可以按需加载</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <HighlightBox title="分层的代价" icon="⚖️" variant="yellow">
          <p className="mb-2">分层也有成本，需要权衡：</p>
          <div className="grid md:grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-green-400 font-semibold mb-1">收益</p>
              <ul className="pl-5 list-disc text-sm text-gray-400">
                <li>关注点分离，易于理解</li>
                <li>各层可独立测试</li>
                <li>方便替换实现</li>
                <li>团队可并行开发</li>
              </ul>
            </div>
            <div>
              <p className="text-red-400 font-semibold mb-1">代价</p>
              <ul className="pl-5 list-disc text-sm text-gray-400">
                <li>更多文件和目录</li>
                <li>层间通信开销</li>
                <li>调试时需要跨层追踪</li>
                <li>初学者理解曲线陡峭</li>
              </ul>
            </div>
          </div>
        </HighlightBox>

        <MermaidDiagram chart={`
graph TB
    subgraph "依赖方向（只能向下依赖）"
        CLI["CLI Layer"]
        Core["Core Layer"]
        Tool["Tool Layer"]

        CLI --> Core
        Core --> Tool
    end

    subgraph "禁止的依赖"
        X1["Tool ❌→ Core"]
        X2["Core ❌→ CLI"]
    end

    style CLI fill:#22c55e20,stroke:#22c55e
    style Core fill:#3b82f620,stroke:#3b82f6
    style Tool fill:#eab30820,stroke:#eab308
    style X1 fill:#ef444420,stroke:#ef4444
    style X2 fill:#ef444420,stroke:#ef4444
`} />
      </Layer>

      {/* 事件驱动架构 */}
      <Layer title="事件驱动架构" icon="🎯">
        <p className="mb-4">
          Gemini CLI 采用事件驱动架构实现松耦合的组件通信。核心是 Hook System、Policy Engine 和 MessageBus 的协作：
        </p>

        <div className="space-y-6">
          {/* Hook System */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🪝</span>
              <h4 className="text-lg font-semibold text-cyan-400">Hook System</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">事件拦截</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300 mb-2"><strong>核心能力：</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>11 种事件类型（BeforeTool, AfterTool, BeforeModel...）</li>
                  <li>3 层配置优先级（Project {'>'} User {'>'} System）</li>
                  <li>并行执行多个钩子脚本</li>
                  <li>环境变量注入与结果聚合</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-300 mb-2"><strong>典型场景：</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>工具执行前注入环境变量</li>
                  <li>模型调用后记录日志</li>
                  <li>会话开始时加载配置</li>
                  <li>自定义安全检查</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Policy Engine */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-orange-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🛡️</span>
              <h4 className="text-lg font-semibold text-orange-400">Policy Engine</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">权限决策</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300 mb-2"><strong>决策类型：</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li><code className="text-green-400">ALLOW</code> - 直接允许执行</li>
                  <li><code className="text-red-400">DENY</code> - 直接拒绝执行</li>
                  <li><code className="text-amber-400">ASK_USER</code> - 请求用户确认</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-300 mb-2"><strong>规则来源：</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>TOML 配置文件定义规则</li>
                  <li>Approval Mode 全局设置</li>
                  <li>Safety Checker 内置检查</li>
                  <li>用户会话内决定</li>
                </ul>
              </div>
            </div>
          </div>

          {/* MessageBus */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-indigo-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📡</span>
              <h4 className="text-lg font-semibold text-indigo-400">MessageBus</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">发布/订阅</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300 mb-2"><strong>消息类型：</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>TOOL_CONFIRMATION_REQUEST/RESPONSE</li>
                  <li>HOOK_EXECUTION_REQUEST/RESPONSE</li>
                  <li>SESSION_EVENT / TELEMETRY_EVENT</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-300 mb-2"><strong>设计优势：</strong></p>
                <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
                  <li>解耦 Policy、Hook 和 UI 层</li>
                  <li>支持异步消息传递</li>
                  <li>便于扩展新的订阅者</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <MermaidDiagram chart={`
graph LR
    subgraph "事件驱动协作"
        Tool[工具调用] --> Hook[Hook System]
        Hook --> Policy[Policy Engine]
        Policy --> Bus[MessageBus]
        Bus --> UI[UI Layer]
        UI --> Bus
        Bus --> Policy
        Policy --> Tool
    end

    style Hook fill:#0891b220,stroke:#0891b2
    style Policy fill:#ea580c20,stroke:#ea580c
    style Bus fill:#6366f120,stroke:#6366f1
    style Tool fill:#eab30820,stroke:#eab308
    style UI fill:#22c55e20,stroke:#22c55e
`} />

        <HighlightBox title="为什么用事件驱动？" icon="💡" variant="blue">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-green-400 font-semibold mb-1">优势</p>
              <ul className="pl-5 list-disc text-sm text-gray-400">
                <li>组件间松耦合，易于测试</li>
                <li>新功能可通过订阅事件扩展</li>
                <li>异步处理提高响应性</li>
                <li>清晰的责任边界</li>
              </ul>
            </div>
            <div>
              <p className="text-amber-400 font-semibold mb-1">权衡</p>
              <ul className="pl-5 list-disc text-sm text-gray-400">
                <li>事件流追踪较复杂</li>
                <li>需要理解订阅关系</li>
                <li>调试需要更多工具支持</li>
              </ul>
            </div>
          </div>
        </HighlightBox>
      </Layer>

      {/* 常见故障模式 */}
      <Layer title="常见故障模式与应对" icon="🚨">
        <p className="mb-4">
          了解系统可能出现的故障模式，可以帮助你更快地定位和解决问题：
        </p>

        <div className="space-y-4">
          {/* 故障1 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔴</span>
              <div className="flex-1">
                <h4 className="font-semibold text-red-400 mb-2">API 连接失败</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1"><strong>症状：</strong></p>
                    <p className="text-gray-500">请求超时、Connection refused、SSL 错误</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>原因：</strong></p>
                    <p className="text-gray-500">网络问题、API Key 无效、服务商宕机</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>应对：</strong></p>
                    <p className="text-gray-500">检查网络、验证 Key、查看服务商状态页</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 故障2 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <span className="text-xl">🟡</span>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-400 mb-2">Token 超限</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1"><strong>症状：</strong></p>
                    <p className="text-gray-500">400 错误、"context length exceeded"</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>原因：</strong></p>
                    <p className="text-gray-500">对话太长、文件内容太大、工具结果过多</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>应对：</strong></p>
                    <p className="text-gray-500">压缩历史、截断大文件、开启 /compact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 故障3 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔵</span>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-400 mb-2">工具执行失败</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1"><strong>症状：</strong></p>
                    <p className="text-gray-500">ENOENT、Permission denied、Command not found</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>原因：</strong></p>
                    <p className="text-gray-500">路径错误、权限不足、命令不存在</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>应对：</strong></p>
                    <p className="text-gray-500">检查路径、调整权限、安装依赖</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 故障4 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-purple-500">
            <div className="flex items-start gap-3">
              <span className="text-xl">🟣</span>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-400 mb-2">AI 进入死循环</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1"><strong>症状：</strong></p>
                    <p className="text-gray-500">反复调用同一工具、无限重试</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>原因：</strong></p>
                    <p className="text-gray-500">工具结果不清晰、AI 不理解错误信息</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>应对：</strong></p>
                    <p className="text-gray-500">按 Ctrl+C 中断、优化工具返回格式</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 故障5 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <span className="text-xl">🟢</span>
              <div className="flex-1">
                <h4 className="font-semibold text-green-400 mb-2">响应速度慢</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1"><strong>症状：</strong></p>
                    <p className="text-gray-500">等待时间长、首 token 延迟高</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>原因：</strong></p>
                    <p className="text-gray-500">上下文太长、服务器负载高、网络延迟</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"><strong>应对：</strong></p>
                    <p className="text-gray-500">压缩上下文、选择更快的模型、使用代理</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <HighlightBox title="故障恢复决策树" icon="🌳" variant="blue">
          <MermaidDiagram chart={`
flowchart TD
    A[出现问题] --> B{能看到错误信息吗？}

    B -->|是| C{错误类型}
    B -->|否| D[检查终端输出/日志]

    C -->|网络错误| E[检查网络和 API Key]
    C -->|Token 错误| F[使用 /compact 压缩]
    C -->|工具错误| G[检查文件路径和权限]
    C -->|循环| H[Ctrl+C 中断]

    E --> I{解决了吗？}
    F --> I
    G --> I
    H --> I

    I -->|是| J[继续使用]
    I -->|否| K[查看详细文档或提 Issue]
`} />
        </HighlightBox>
      </Layer>

      {/* 进阶阅读 */}
      <Layer title="进阶阅读路线" icon="📚">
        <p className="mb-4">
          根据你的学习目标，选择合适的深入方向：
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 border border-green-500/30">
            <h4 className="text-green-400 font-semibold mb-2">🔧 工具开发者</h4>
            <p className="text-sm text-gray-400 mb-3">想要开发自定义工具</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>→ 工具系统详解</li>
              <li>→ MCP 协议</li>
              <li>→ 工具验证与安全</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 border border-blue-500/30">
            <h4 className="text-blue-400 font-semibold mb-2">🤖 AI 交互理解</h4>
            <p className="text-sm text-gray-400 mb-3">想要理解 AI 如何工作</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>→ AI 工具交互机制</li>
              <li>→ Token 生命周期</li>
              <li>→ 会话持久化</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-purple-400 font-semibold mb-2">🔍 问题排查</h4>
            <p className="text-sm text-gray-400 mb-3">想要快速定位问题</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>→ 错误恢复决策树</li>
              <li>→ 错误处理机制</li>
              <li>→ 调试技巧</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-lg p-4 border border-yellow-500/30">
            <h4 className="text-yellow-400 font-semibold mb-2">⚙️ 系统配置</h4>
            <p className="text-sm text-gray-400 mb-3">想要定制 CLI 行为</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>→ 配置系统</li>
              <li>→ 斜杠命令</li>
              <li>→ 主题定制</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg p-4 border border-red-500/30">
            <h4 className="text-red-400 font-semibold mb-2">🛡️ 安全专家</h4>
            <p className="text-sm text-gray-400 mb-3">想要理解安全机制</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>→ 权限与审批</li>
              <li>→ 沙箱执行</li>
              <li>→ 安全边界</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-lg p-4 border border-pink-500/30">
            <h4 className="text-pink-400 font-semibold mb-2">🔌 扩展开发</h4>
            <p className="text-sm text-gray-400 mb-3">想要扩展 CLI 能力</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>→ 扩展系统</li>
              <li>→ IDE 集成</li>
              <li>→ MCP 服务器</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* 相关页面 */}
      <RelatedPages
        pages={[
          { id: 'ai-tool', label: 'AI 工具交互机制', description: 'Function Calling 的完整生命周期' },
          { id: 'hook-system', label: 'Hook 事件系统', description: '事件拦截与扩展点机制' },
          { id: 'policy-engine', label: 'Policy 策略引擎', description: '安全策略与权限决策系统' },
          { id: 'message-bus', label: '消息总线', description: '发布/订阅异步通信机制' },
          { id: 'model-routing', label: '模型路由', description: 'Flash/Pro 智能选择策略' },
          { id: 'agent-framework', label: 'Agent 框架', description: '子代理执行与编排系统' },
          { id: 'tool-detail', label: '工具系统详解', description: '深入了解各个工具的实现' },
          { id: 'config', label: '配置系统', description: '了解如何定制 CLI 行为' },
        ]}
      />
    </div>
  );
}
