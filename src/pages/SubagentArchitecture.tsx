import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

export function SubagentArchitecture() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['quickstart'])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          🏗️ Subagent 系统架构深度解析
        </h1>
        <p className="text-[var(--text-secondary)]">
          深入理解子代理的优先级解析、事件系统、Hooks 机制和统计监控
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] text-xs rounded">
            核心模块
          </span>
          <span className="px-2 py-1 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] text-xs rounded">
            packages/core/src/subagents/
          </span>
          <span className="px-2 py-1 bg-[var(--amber)]/20 text-[var(--amber)] text-xs rounded">
            深度解析
          </span>
        </div>
      </div>

      {/* 30秒速览 */}
      <section className="bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl p-6 border border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          ⚡ 30秒速览
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h3 className="text-[var(--terminal-green)] font-bold mb-3">核心类层次</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[var(--amber)]">SubagentManager</span>
                <span className="text-[var(--text-muted)]">← CRUD + 优先级解析</span>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <span className="text-[var(--cyber-blue)]">SubAgentScope</span>
                <span className="text-[var(--text-muted)]">← 执行环境</span>
              </div>
              <div className="flex items-center gap-2 pl-8">
                <span className="text-[var(--purple)]">SubAgentEventEmitter</span>
                <span className="text-[var(--text-muted)]">← 事件通知</span>
              </div>
              <div className="flex items-center gap-2 pl-8">
                <span className="text-[var(--terminal-green)]">SubagentStatistics</span>
                <span className="text-[var(--text-muted)]">← 性能统计</span>
              </div>
              <div className="flex items-center gap-2 pl-8">
                <span className="text-[var(--amber)]">SubagentHooks</span>
                <span className="text-[var(--text-muted)]">← 生命周期钩子</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h3 className="text-[var(--cyber-blue)] font-bold mb-3">关键设计决策</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-[var(--terminal-green)]">✓</span>
                <span className="text-[var(--text-secondary)]">
                  <strong>三级优先级</strong>：project → user → builtin，支持覆盖
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--terminal-green)]">✓</span>
                <span className="text-[var(--text-secondary)]">
                  <strong>非交互模式</strong>：不询问用户，自主完成任务
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--terminal-green)]">✓</span>
                <span className="text-[var(--text-secondary)]">
                  <strong>递归防护</strong>：自动移除 Task 工具避免无限嵌套
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--terminal-green)]">✓</span>
                <span className="text-[var(--text-secondary)]">
                  <strong>YAML+Markdown</strong>：配置与提示词分离，易于维护
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-lg p-4">
          <h3 className="text-[var(--amber)] font-bold mb-3">源码位置速查</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">管理器</span>
              <span className="text-[var(--cyber-blue)]">subagent-manager.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">执行作用域</span>
              <span className="text-[var(--cyber-blue)]">subagent.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">事件系统</span>
              <span className="text-[var(--cyber-blue)]">subagent-events.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">生命周期钩子</span>
              <span className="text-[var(--cyber-blue)]">subagent-hooks.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">统计系统</span>
              <span className="text-[var(--cyber-blue)]">subagent-statistics.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">内置代理</span>
              <span className="text-[var(--cyber-blue)]">builtin-agents.ts</span>
            </div>
          </div>
        </div>
      </section>

      {/* 优先级解析系统 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('priority')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            🔍 三级优先级解析系统
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('priority') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('priority') && (
          <div className="space-y-6">
            <MermaidDiagram
              chart={`flowchart LR
    subgraph Resolution["loadSubagent(name)"]
        A[请求 Agent] --> B{检查 Project 级}
        B -->|找到| C[返回 Project Agent]
        B -->|未找到| D{检查 User 级}
        D -->|找到| E[返回 User Agent]
        D -->|未找到| F{检查 Builtin}
        F -->|找到| G[返回 Builtin Agent]
        F -->|未找到| H[返回 null]
    end

    style C fill:#22c55e,color:#000
    style E fill:#3b82f6,color:#fff
    style G fill:#f59e0b,color:#000
    style H fill:#ef4444,color:#fff`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
                <h4 className="text-[var(--terminal-green)] font-bold mb-2">1. Project 级</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  项目根目录下的 <code className="text-[var(--amber)]">.innies/agents/*.md</code>
                </p>
                <div className="text-xs text-[var(--text-muted)]">
                  优先级最高，项目特定配置可覆盖全局设置
                </div>
              </div>

              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
                <h4 className="text-[var(--cyber-blue)] font-bold mb-2">2. User 级</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  用户主目录下的 <code className="text-[var(--amber)]">~/.innies/agents/*.md</code>
                </p>
                <div className="text-xs text-[var(--text-muted)]">
                  用户全局配置，跨项目共享
                </div>
              </div>

              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
                <h4 className="text-[var(--amber)] font-bold mb-2">3. Builtin</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  代码内置的 <code className="text-[var(--amber)]">BuiltinAgentRegistry</code>
                </p>
                <div className="text-xs text-[var(--text-muted)]">
                  默认代理，不可修改或删除
                </div>
              </div>
            </div>

            <CodeBlock
              language="typescript"
              code={`// subagent-manager.ts:134-161 - 优先级解析核心逻辑
async loadSubagent(
  name: string,
  level?: SubagentLevel,
): Promise<SubagentConfig | null> {
  if (level) {
    // 指定级别时只搜索该级别
    if (level === 'builtin') {
      return BuiltinAgentRegistry.getBuiltinAgent(name);
    }
    return this.findSubagentByNameAtLevel(name, level);
  }

  // 优先级搜索：project → user → builtin
  const projectConfig = await this.findSubagentByNameAtLevel(name, 'project');
  if (projectConfig) return projectConfig;  // Project 级优先

  const userConfig = await this.findSubagentByNameAtLevel(name, 'user');
  if (userConfig) return userConfig;  // User 级次之

  return BuiltinAgentRegistry.getBuiltinAgent(name);  // Builtin 兜底
}`}
            />

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--purple)] font-bold mb-3">💡 设计原因</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--terminal-green)]">1.</span>
                  <span>
                    <strong>项目隔离</strong>：不同项目可以有同名但不同配置的代理（如 code-reviewer），
                    项目级优先确保项目特定需求
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--terminal-green)]">2.</span>
                  <span>
                    <strong>渐进式覆盖</strong>：用户可以在 User 级创建个人偏好的代理配置，
                    然后在特定项目中进一步定制
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--terminal-green)]">3.</span>
                  <span>
                    <strong>安全默认</strong>：Builtin 代理不可修改，确保核心功能始终可用，
                    避免用户误删关键代理
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* 配置文件格式 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('config')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            📄 配置文件格式详解
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('config') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('config') && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--terminal-green)] font-bold mb-3">文件结构</h4>
              <CodeBlock
                language="markdown"
                code={`---
name: code-reviewer
description: 代码审查专家，专注于代码质量和最佳实践
tools:
  - Read
  - Grep
  - Glob
modelConfig:
  temp: 0.3        # 低温度，更确定性
  top_p: 0.9
runConfig:
  max_turns: 50    # 最大轮次
  max_time_minutes: 10  # 超时限制
color: "#22c55e"   # UI 显示颜色
---

You are a code review expert. When reviewing code, focus on:
1. Code correctness and potential bugs
2. Performance implications
3. Security vulnerabilities
4. Code style and readability

Always provide specific line numbers and actionable suggestions.`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
                <h4 className="text-[var(--cyber-blue)] font-bold mb-3">必填字段</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--amber)] font-mono">name</td>
                      <td className="py-2 text-[var(--text-secondary)]">代理唯一标识符</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--amber)] font-mono">description</td>
                      <td className="py-2 text-[var(--text-secondary)]">代理功能描述</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--amber)] font-mono">systemPrompt</td>
                      <td className="py-2 text-[var(--text-secondary)]">Markdown 正文部分</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
                <h4 className="text-[var(--purple)] font-bold mb-3">可选字段</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--amber)] font-mono">tools</td>
                      <td className="py-2 text-[var(--text-secondary)]">可用工具列表（默认全部）</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--amber)] font-mono">modelConfig</td>
                      <td className="py-2 text-[var(--text-secondary)]">模型参数配置</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--amber)] font-mono">runConfig</td>
                      <td className="py-2 text-[var(--text-secondary)]">运行时配置</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--amber)] font-mono">color</td>
                      <td className="py-2 text-[var(--text-secondary)]">UI 颜色标识</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <CodeBlock
              language="typescript"
              code={`// subagent-manager.ts:412-482 - 解析配置文件
parseSubagentContent(content: string, filePath: string, level: SubagentLevel): SubagentConfig {
  // 正则匹配 YAML frontmatter
  const frontmatterRegex = /^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid format: missing YAML frontmatter');
  }

  const [, frontmatterYaml, systemPrompt] = match;
  const frontmatter = parseYaml(frontmatterYaml);

  // 验证必填字段
  if (!frontmatter.name) throw new Error('Missing "name" in frontmatter');
  if (!frontmatter.description) throw new Error('Missing "description" in frontmatter');

  return {
    name: String(frontmatter.name),
    description: String(frontmatter.description),
    tools: frontmatter.tools,
    systemPrompt: systemPrompt.trim(),  // Markdown 正文作为 systemPrompt
    filePath,
    modelConfig: frontmatter.modelConfig,
    runConfig: frontmatter.runConfig,
    color: frontmatter.color,
    level,
  };
}`}
            />
          </div>
        )}
      </section>

      {/* 执行生命周期 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('lifecycle')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            🔄 执行生命周期详解
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('lifecycle') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('lifecycle') && (
          <div className="space-y-6">
            <MermaidDiagram
              chart={`stateDiagram-v2
    [*] --> Start: runNonInteractive()
    Start --> SendMessage: 发送初始任务
    SendMessage --> StreamResponse: 流式接收响应
    StreamResponse --> CheckFunctionCalls: 检查工具调用

    CheckFunctionCalls --> ExecuteTools: 有工具调用
    CheckFunctionCalls --> CheckText: 无工具调用

    ExecuteTools --> CollectResults: 并行执行工具
    CollectResults --> SendMessage: 继续对话

    CheckText --> FinalAnswer: 有文本内容
    CheckText --> Nudge: 无内容
    Nudge --> SendMessage: 请求最终结果

    FinalAnswer --> [*]: GOAL 终止

    note right of SendMessage : 检查 MAX_TURNS
    note right of StreamResponse : 检查 TIMEOUT`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
                <h4 className="text-[var(--terminal-green)] font-bold mb-3">终止条件</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="py-2 text-left text-[var(--text-muted)]">模式</th>
                      <th className="py-2 text-left text-[var(--text-muted)]">触发条件</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--terminal-green)] font-mono">GOAL</td>
                      <td className="py-2 text-[var(--text-secondary)]">模型返回文本（任务完成）</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--amber)] font-mono">MAX_TURNS</td>
                      <td className="py-2 text-[var(--text-secondary)]">超过 runConfig.max_turns</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--amber)] font-mono">TIMEOUT</td>
                      <td className="py-2 text-[var(--text-secondary)]">超过 max_time_minutes</td>
                    </tr>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 text-[var(--cyber-blue)] font-mono">CANCELLED</td>
                      <td className="py-2 text-[var(--text-secondary)]">外部 AbortSignal 触发</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-red-400 font-mono">ERROR</td>
                      <td className="py-2 text-[var(--text-secondary)]">执行过程抛出异常</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
                <h4 className="text-[var(--cyber-blue)] font-bold mb-3">递归防护机制</h4>
                <CodeBlock
                  language="typescript"
                  code={`// subagent.ts:296-313 - 移除 Task 工具
if (hasWildcard || asStrings.length === 0) {
  toolsList.push(
    ...toolRegistry
      .getFunctionDeclarations()
      // 关键：过滤掉 Task 工具
      .filter((t) => t.name !== TaskTool.Name),
  );
} else {
  toolsList.push(
    ...toolRegistry.getFunctionDeclarationsFiltered(asStrings),
  );
}`}
                />
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  自动移除 Task 工具，防止子代理创建子代理导致无限递归
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--purple)] font-bold mb-3">模板变量替换</h4>
              <CodeBlock
                language="typescript"
                code={`// subagent.ts:129-155 - 模板字符串处理
function templateString(template: string, context: ContextState): string {
  const placeholderRegex = /\\$\\{(\\w+)\\}/g;

  // 找出所有需要的占位符
  const requiredKeys = new Set(
    Array.from(template.matchAll(placeholderRegex), (match) => match[1]),
  );

  // 验证所有占位符都有对应值
  const contextKeys = new Set(context.get_keys());
  const missingKeys = Array.from(requiredKeys).filter(
    (key) => !contextKeys.has(key),
  );

  if (missingKeys.length > 0) {
    throw new Error(\`Missing context values: \${missingKeys.join(', ')}\`);
  }

  // 执行替换
  return template.replace(placeholderRegex, (_match, key) =>
    String(context.get(key)),
  );
}

// 使用示例：
// systemPrompt: "分析 \${task_prompt} 中提到的问题"
// context.set('task_prompt', '用户的具体任务描述')`}
              />
            </div>
          </div>
        )}
      </section>

      {/* 事件系统 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('events')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            📡 事件系统详解
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('events') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('events') && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--terminal-green)] font-bold mb-3">9 种事件类型</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'start', desc: '代理启动', color: 'terminal-green' },
                  { name: 'round_start', desc: '轮次开始', color: 'cyber-blue' },
                  { name: 'round_end', desc: '轮次结束', color: 'cyber-blue' },
                  { name: 'stream_text', desc: '流式文本', color: 'amber' },
                  { name: 'tool_call', desc: '工具调用', color: 'purple' },
                  { name: 'tool_result', desc: '工具结果', color: 'purple' },
                  { name: 'tool_waiting_approval', desc: '等待审批', color: 'amber' },
                  { name: 'finish', desc: '执行完成', color: 'terminal-green' },
                  { name: 'error', desc: '发生错误', color: 'red-400' },
                ].map((event) => (
                  <div
                    key={event.name}
                    className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border-subtle)]"
                  >
                    <div className={`text-[var(--${event.color})] font-mono text-sm`}>
                      {event.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{event.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <CodeBlock
              language="typescript"
              code={`// subagent-events.ts - 事件接口定义

export interface SubAgentStartEvent {
  subagentId: string;    // 唯一标识 "{name}-{random}"
  name: string;          // 代理名称
  model?: string;        // 使用的模型
  tools: string[];       // 可用工具列表
  timestamp: number;
}

export interface SubAgentToolCallEvent {
  subagentId: string;
  round: number;         // 当前轮次
  callId: string;        // 工具调用 ID
  name: string;          // 工具名称
  args: Record<string, unknown>;  // 调用参数
  description: string;   // 工具描述
  timestamp: number;
}

export interface SubAgentFinishEvent {
  subagentId: string;
  terminateReason: string;  // 终止原因
  timestamp: number;
  // 统计信息
  rounds?: number;
  totalDurationMs?: number;
  totalToolCalls?: number;
  successfulToolCalls?: number;
  failedToolCalls?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}`}
            />

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--cyber-blue)] font-bold mb-3">事件监听示例</h4>
              <CodeBlock
                language="typescript"
                code={`// 在 UI 层监听子代理事件
const eventEmitter = new SubAgentEventEmitter();

eventEmitter.on('start', (event: SubAgentStartEvent) => {
  console.log(\`🚀 子代理 \${event.name} 启动\`);
  console.log(\`   模型: \${event.model}\`);
  console.log(\`   工具: \${event.tools.join(', ')}\`);
});

eventEmitter.on('tool_call', (event: SubAgentToolCallEvent) => {
  console.log(\`🔧 Round \${event.round}: \${event.name}(\${JSON.stringify(event.args)})\`);
});

eventEmitter.on('finish', (event: SubAgentFinishEvent) => {
  console.log(\`✅ 执行完成 - \${event.terminateReason}\`);
  console.log(\`   轮次: \${event.rounds}, 耗时: \${event.totalDurationMs}ms\`);
  console.log(\`   工具调用: \${event.successfulToolCalls}/\${event.totalToolCalls} 成功\`);
});

// 传入 SubAgentScope 创建时
const scope = await SubAgentScope.create(name, config, ..., eventEmitter);`}
              />
            </div>
          </div>
        )}
      </section>

      {/* Hooks 系统 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('hooks')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            🪝 Hooks 生命周期系统
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('hooks') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('hooks') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
                <h4 className="text-[var(--terminal-green)] font-bold mb-2">preToolUse</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  工具调用前触发
                </p>
                <div className="text-xs text-[var(--text-muted)]">
                  可用于记录日志、验证参数
                </div>
              </div>

              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
                <h4 className="text-[var(--cyber-blue)] font-bold mb-2">postToolUse</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  工具调用后触发
                </p>
                <div className="text-xs text-[var(--text-muted)]">
                  可用于统计、错误处理
                </div>
              </div>

              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
                <h4 className="text-[var(--amber)] font-bold mb-2">onStop</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  执行结束时触发
                </p>
                <div className="text-xs text-[var(--text-muted)]">
                  可用于清理、汇总统计
                </div>
              </div>
            </div>

            <CodeBlock
              language="typescript"
              code={`// subagent-hooks.ts - Hooks 接口定义

export interface PreToolUsePayload {
  subagentId: string;
  name: string;       // subagent name
  toolName: string;
  args: Record<string, unknown>;
  timestamp: number;
}

export interface PostToolUsePayload extends PreToolUsePayload {
  success: boolean;
  durationMs: number;
  errorMessage?: string;
}

export interface SubagentStopPayload {
  subagentId: string;
  name: string;
  terminateReason: string;
  summary: Record<string, unknown>;
  timestamp: number;
}

export interface SubagentHooks {
  preToolUse?(payload: PreToolUsePayload): Promise<void> | void;
  postToolUse?(payload: PostToolUsePayload): Promise<void> | void;
  onStop?(payload: SubagentStopPayload): Promise<void> | void;
}`}
            />

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--purple)] font-bold mb-3">使用场景示例</h4>
              <CodeBlock
                language="typescript"
                code={`// 自定义 Hooks 实现
const hooks: SubagentHooks = {
  preToolUse: async (payload) => {
    // 记录审计日志
    await auditLog.record({
      action: 'tool_call_start',
      agent: payload.name,
      tool: payload.toolName,
      args: payload.args,
    });
  },

  postToolUse: async (payload) => {
    // 更新性能指标
    metrics.recordToolCall({
      tool: payload.toolName,
      duration: payload.durationMs,
      success: payload.success,
    });

    // 错误告警
    if (!payload.success) {
      await alerting.notify({
        level: 'warning',
        message: \`Tool \${payload.toolName} failed: \${payload.errorMessage}\`,
      });
    }
  },

  onStop: async (payload) => {
    // 发送执行报告
    await reporting.sendSubagentReport({
      agentId: payload.subagentId,
      reason: payload.terminateReason,
      summary: payload.summary,
    });
  },
};

// 创建带 Hooks 的 SubAgentScope
const scope = await manager.createSubagentScope(config, runtimeContext, {
  eventEmitter,
  hooks,
});`}
              />
            </div>
          </div>
        )}
      </section>

      {/* 统计系统 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('stats')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            📊 统计与监控系统
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('stats') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('stats') && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--terminal-green)] font-bold mb-3">SubagentStatistics 类</h4>
              <CodeBlock
                language="typescript"
                code={`// subagent-statistics.ts - 统计数据结构

export interface SubagentStatsSummary {
  rounds: number;              // 执行轮次
  totalDurationMs: number;     // 总耗时
  totalToolCalls: number;      // 工具调用总数
  successfulToolCalls: number; // 成功调用数
  failedToolCalls: number;     // 失败调用数
  successRate: number;         // 成功率 (%)
  inputTokens: number;         // 输入 Token
  outputTokens: number;        // 输出 Token
  totalTokens: number;         // 总 Token
  estimatedCost: number;       // 估算成本
  toolUsage: ToolUsageStats[]; // 工具使用详情
}

export interface ToolUsageStats {
  name: string;
  count: number;               // 调用次数
  success: number;             // 成功次数
  failure: number;             // 失败次数
  lastError?: string;          // 最后错误
  totalDurationMs: number;     // 总耗时
  averageDurationMs: number;   // 平均耗时
}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
                <h4 className="text-[var(--cyber-blue)] font-bold mb-3">紧凑格式输出</h4>
                <div className="bg-[var(--bg-card)] rounded-lg p-3 font-mono text-xs">
                  <div className="text-[var(--text-secondary)]">📋 Task Completed: 代码审查</div>
                  <div className="text-[var(--text-secondary)]">🔧 Tool Usage: 12 calls, 91.7% success</div>
                  <div className="text-[var(--text-secondary)]">⏱️ Duration: 45.2s | 🔁 Rounds: 5</div>
                  <div className="text-[var(--text-secondary)]">🔢 Tokens: 15,420 (in 8,200, out 7,220)</div>
                </div>
              </div>

              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
                <h4 className="text-[var(--purple)] font-bold mb-3">性能洞察生成</h4>
                <CodeBlock
                  language="typescript"
                  code={`// 自动生成性能建议
generatePerformanceTips(stats) {
  const tips = [];

  // 成功率过低
  if (successRate < 80)
    tips.push('Low success rate - review inputs');

  // 耗时过长
  if (totalDurationMs > 60_000)
    tips.push('Long execution - break down tasks');

  // Token 使用过高
  if (totalTokens > 100_000)
    tips.push('High token usage - optimize prompts');

  // 慢工具检测
  const slow = toolUsage.filter(t =>
    t.averageDurationMs > 10_000
  );
  if (slow.length)
    tips.push(\`Optimize \${slow[0].name}\`);

  return tips;
}`}
                />
              </div>
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--amber)] font-bold mb-3">成本估算</h4>
              <CodeBlock
                language="typescript"
                code={`// subagent-statistics.ts:89-90 - 成本计算
const estimatedCost = this.inputTokens * 3e-5 + this.outputTokens * 6e-5;

// 说明：
// - 输入 Token: $0.00003/token = $30/1M tokens
// - 输出 Token: $0.00006/token = $60/1M tokens
// 这是基于典型 LLM 定价的估算值`}
              />
            </div>
          </div>
        )}
      </section>

      {/* 设计权衡 */}
      <section className="bg-gradient-to-r from-[var(--purple)]/10 to-[var(--amber)]/10 rounded-xl p-6 border border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          ⚖️ 设计权衡与决策
        </h2>

        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">
              为什么用 YAML + Markdown 而不是纯 JSON？
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>可读性</strong>：System Prompt 通常很长，Markdown 格式更易编辑</li>
              <li>• <strong>分离关注点</strong>：配置（YAML）与内容（Markdown）分离</li>
              <li>• <strong>IDE 支持</strong>：Markdown 文件有更好的语法高亮和预览</li>
              <li>• <strong>版本控制</strong>：Markdown 差异更易于阅读</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">
              为什么自动移除 Task 工具？
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>防止无限递归</strong>：子代理调用 Task 创建新子代理</li>
              <li>• <strong>资源控制</strong>：嵌套深度难以预测和控制</li>
              <li>• <strong>调试困难</strong>：多层嵌套的错误难以追踪</li>
              <li>• <strong>替代方案</strong>：如需复杂分解，在顶层编排多个子代理</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h4 className="text-[var(--amber)] font-bold mb-2">
              为什么使用事件系统而不是回调？
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>解耦</strong>：执行逻辑与 UI 更新分离</li>
              <li>• <strong>多订阅者</strong>：多个组件可同时监听同一事件</li>
              <li>• <strong>可测试</strong>：事件更容易模拟和断言</li>
              <li>• <strong>可扩展</strong>：新增事件类型不影响现有代码</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h4 className="text-[var(--purple)] font-bold mb-2">
              为什么 Builtin 代理不可修改？
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>稳定性保证</strong>：核心功能始终可用</li>
              <li>• <strong>升级兼容</strong>：版本更新时内置代理自动更新</li>
              <li>• <strong>覆盖机制</strong>：用户可在 project/user 级创建同名代理覆盖</li>
              <li>• <strong>恢复能力</strong>：删除覆盖后自动回退到 Builtin</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 相关页面 */}
      <RelatedPages
        title="🔗 相关页面"
        pages={[
          { id: 'subagent', label: '子代理系统概览', description: '基础概念和快速入门' },
          { id: 'subagent-anim', label: '子代理执行动画', description: '可视化执行流程' },
          { id: 'subagent-resolution-anim', label: '优先级解析动画', description: '三级优先级可视化' },
        ]}
      />
    </div>
  );
}

export default SubagentArchitecture;
