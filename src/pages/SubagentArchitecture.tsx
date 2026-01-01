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
          🏗️ Agent 架构深度解析
        </h1>
        <p className="text-[var(--text-secondary)]">
          深入理解 Agent 类型系统、TOML 配置验证、执行循环和 Grace Period 机制
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] text-xs rounded">
            核心模块
          </span>
          <span className="px-2 py-1 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] text-xs rounded">
            packages/core/src/agents/
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
            <h3 className="text-[var(--terminal-green)] font-bold mb-3">类型系统层次</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[var(--amber)]">AgentDefinition</span>
                <span className="text-[var(--text-muted)]">← 联合类型</span>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <span className="text-[var(--terminal-green)]">LocalAgentDefinition</span>
                <span className="text-[var(--text-muted)]">← 本地执行</span>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <span className="text-[var(--cyber-blue)]">RemoteAgentDefinition</span>
                <span className="text-[var(--text-muted)]">← A2A 协议</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[var(--purple)]">AgentTerminateMode</span>
                <span className="text-[var(--text-muted)]">← 6 种终止原因</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--amber)]">SubagentActivityEvent</span>
                <span className="text-[var(--text-muted)]">← 4 种活动事件</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h3 className="text-[var(--cyber-blue)] font-bold mb-3">关键设计决策</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-[var(--terminal-green)]">✓</span>
                <span className="text-[var(--text-secondary)]">
                  <strong>TOML 配置</strong>：Zod 验证，比 YAML+MD 更严格
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--terminal-green)]">✓</span>
                <span className="text-[var(--text-secondary)]">
                  <strong>complete_task 工具</strong>：强制终止信号，非文本返回
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--terminal-green)]">✓</span>
                <span className="text-[var(--text-secondary)]">
                  <strong>Grace Period</strong>：60 秒恢复期，优雅降级
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--terminal-green)]">✓</span>
                <span className="text-[var(--text-secondary)]">
                  <strong>禁止嵌套委托</strong>：toml-loader 阻止循环
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-lg p-4">
          <h3 className="text-[var(--amber)] font-bold mb-3">源码位置速查</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">类型定义</span>
              <span className="text-[var(--cyber-blue)]">agents/types.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">注册中心</span>
              <span className="text-[var(--cyber-blue)]">agents/registry.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">本地执行器</span>
              <span className="text-[var(--cyber-blue)]">agents/local-executor.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">TOML 加载器</span>
              <span className="text-[var(--cyber-blue)]">agents/toml-loader.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">委托工具</span>
              <span className="text-[var(--cyber-blue)]">agents/delegate-to-agent-tool.ts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">工具包装器</span>
              <span className="text-[var(--cyber-blue)]">agents/subagent-tool-wrapper.ts</span>
            </div>
          </div>
        </div>
      </section>

      {/* 类型系统详解 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('types')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            📦 类型系统详解
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('types') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('types') && (
          <div className="space-y-6">
            <MermaidDiagram
              chart={`classDiagram
    class BaseAgentDefinition {
        +string name
        +string description
        +string? displayName
        +AgentInputConfig inputConfig
    }

    class LocalAgentDefinition {
        +kind: "local"
        +PromptConfig promptConfig
        +ModelConfig modelConfig
        +RunConfig runConfig
        +ToolConfig? toolConfig
    }

    class RemoteAgentDefinition {
        +kind: "remote"
        +string agentCardUrl
    }

    class AgentTerminateMode {
        <<enumeration>>
        ERROR
        TIMEOUT
        GOAL
        MAX_TURNS
        ABORTED
        ERROR_NO_COMPLETE_TASK_CALL
    }

    BaseAgentDefinition <|-- LocalAgentDefinition
    BaseAgentDefinition <|-- RemoteAgentDefinition`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
                <h4 className="text-[var(--terminal-green)] font-bold mb-2">LocalAgentDefinition</h4>
                <CodeBlock
                  language="typescript"
                  code={`// types.ts - 本地 Agent 定义
interface LocalAgentDefinition {
  kind: 'local';
  name: string;
  description: string;
  displayName?: string;

  promptConfig: {
    systemPrompt: string;  // 系统提示词
    query?: string;        // 可选的查询模板
  };

  modelConfig: {
    model: string;         // 模型名或 "inherit"
    temp: number;          // 温度 (默认 1)
    top_p: number;         // top_p (默认 0.95)
  };

  runConfig: {
    max_turns?: number;    // 最大轮次
    max_time_minutes: number; // 超时 (默认 5)
  };

  toolConfig?: {
    tools: string[];       // 工具白名单
  };

  inputConfig: {
    inputs: Record<string, AgentInputDefinition>;
  };
}`}
                />
              </div>

              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
                <h4 className="text-[var(--cyber-blue)] font-bold mb-2">RemoteAgentDefinition</h4>
                <CodeBlock
                  language="typescript"
                  code={`// types.ts - 远程 Agent 定义
interface RemoteAgentDefinition {
  kind: 'remote';
  name: string;
  description: string;
  displayName?: string;

  // A2A 协议端点
  agentCardUrl: string;

  inputConfig: {
    inputs: Record<string, AgentInputDefinition>;
  };
}

// 输入参数定义
interface AgentInputDefinition {
  type: 'string' | 'number' | 'boolean'
      | 'integer' | 'string[]' | 'number[]';
  description: string;
  required: boolean;
}`}
                />
              </div>
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--amber)] font-bold mb-3">AgentTerminateMode 枚举</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="py-2 text-left text-[var(--text-muted)]">模式</th>
                    <th className="py-2 text-left text-[var(--text-muted)]">触发条件</th>
                    <th className="py-2 text-left text-[var(--text-muted)]">处理方式</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <td className="py-2 text-[var(--terminal-green)] font-mono">GOAL</td>
                    <td className="py-2 text-[var(--text-secondary)]">调用 complete_task 工具</td>
                    <td className="py-2 text-[var(--text-secondary)]">正常完成</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <td className="py-2 text-[var(--amber)] font-mono">MAX_TURNS</td>
                    <td className="py-2 text-[var(--text-secondary)]">超过 runConfig.max_turns</td>
                    <td className="py-2 text-[var(--text-secondary)]">Grace Period → 强制终止</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <td className="py-2 text-[var(--amber)] font-mono">TIMEOUT</td>
                    <td className="py-2 text-[var(--text-secondary)]">超过 max_time_minutes</td>
                    <td className="py-2 text-[var(--text-secondary)]">Grace Period → 强制终止</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <td className="py-2 text-[var(--cyber-blue)] font-mono">ABORTED</td>
                    <td className="py-2 text-[var(--text-secondary)]">外部 AbortSignal 触发</td>
                    <td className="py-2 text-[var(--text-secondary)]">立即停止</td>
                  </tr>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <td className="py-2 text-red-400 font-mono">ERROR</td>
                    <td className="py-2 text-[var(--text-secondary)]">执行过程抛出异常</td>
                    <td className="py-2 text-[var(--text-secondary)]">错误处理</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-red-400 font-mono">ERROR_NO_COMPLETE_TASK_CALL</td>
                    <td className="py-2 text-[var(--text-secondary)]">Grace Period 结束仍未调用</td>
                    <td className="py-2 text-[var(--text-secondary)]">强制终止</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* TOML 配置与 Zod 验证 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('toml')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            📄 TOML 配置与 Zod 验证
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('toml') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('toml') && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--terminal-green)] font-bold mb-3">本地 Agent TOML 格式</h4>
              <CodeBlock
                language="toml"
                code={`# .gemini/agents/code-reviewer.toml
name = "code-reviewer"
description = "代码审查专家，专注于代码质量和最佳实践"
display_name = "Code Reviewer"  # 可选

# 工具白名单（可选，默认继承父级）
tools = ["Read", "Grep", "Glob"]

[prompts]
system_prompt = """
You are a code review expert. When reviewing code, focus on:
1. Code correctness and potential bugs
2. Performance implications
3. Security vulnerabilities
4. Code style and readability

Always provide specific line numbers and actionable suggestions.
"""
query = "Review the following code: \${task}"  # 可选

[model]
model = "inherit"     # 或具体模型名
temperature = 0.3     # 可选

[run]
max_turns = 50        # 可选
timeout_mins = 10     # 可选，默认 5`}
              />
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--cyber-blue)] font-bold mb-3">远程 Agent 批量配置</h4>
              <CodeBlock
                language="toml"
                code={`# ~/.gemini/agents/remote-agents.toml
# 单个文件可定义多个远程 Agent

[[remote_agents]]
name = "external-reviewer"
kind = "remote"
description = "External code review service via A2A"
agent_card_url = "https://review.example.com/.well-known/agent.json"

[[remote_agents]]
name = "security-scanner"
kind = "remote"
description = "Security vulnerability scanner"
display_name = "Security Scanner"
agent_card_url = "https://security.example.com/.well-known/agent.json"`}
              />
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--purple)] font-bold mb-3">Zod Schema 验证</h4>
              <CodeBlock
                language="typescript"
                code={`// toml-loader.ts - Zod 验证 Schema

// 名称必须是有效的 slug
const nameSchema = z
  .string()
  .regex(/^[a-z0-9-_]+$/, 'Name must be a valid slug');

const localAgentSchema = z.object({
  kind: z.literal('local').optional().default('local'),
  name: nameSchema,
  description: z.string().min(1),
  display_name: z.string().optional(),

  // 工具验证：必须是有效的工具名
  tools: z.array(
    z.string().refine((val) => isValidToolName(val), {
      message: 'Invalid tool name',
    }),
  ).optional(),

  prompts: z.object({
    system_prompt: z.string().min(1),
    query: z.string().optional(),
  }),

  model: z.object({
    model: z.string().optional(),
    temperature: z.number().optional(),
  }).optional(),

  run: z.object({
    max_turns: z.number().int().positive().optional(),
    timeout_mins: z.number().int().positive().optional(),
  }).optional(),
}).strict();  // strict() 禁止未知字段

const remoteAgentSchema = z.object({
  kind: z.literal('remote').optional().default('remote'),
  name: nameSchema,
  description: z.string().optional(),
  display_name: z.string().optional(),
  agent_card_url: z.string().url(),  // 必须是有效 URL
}).strict();`}
              />
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--amber)] font-bold mb-3">💡 禁止嵌套委托</h4>
              <CodeBlock
                language="typescript"
                code={`// toml-loader.ts:219-225 - 防止循环委托

// 子代理不能包含 delegate_to_agent 工具
if ('tools' in toml && toml.tools?.includes(DELEGATE_TO_AGENT_TOOL_NAME)) {
  throw new AgentLoadError(
    filePath,
    \`Validation failed: tools list cannot include '\${DELEGATE_TO_AGENT_TOOL_NAME}'. \` +
    \`Sub-agents cannot delegate to other agents.\`,
  );
}`}
              />
              <p className="text-xs text-[var(--text-muted)] mt-2">
                这防止了 A → B → A 的无限循环，与 Claude Code 的递归防护类似
              </p>
            </div>
          </div>
        )}
      </section>

      {/* LocalAgentExecutor 执行循环 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('executor')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            🔄 LocalAgentExecutor 执行循环
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('executor') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('executor') && (
          <div className="space-y-6">
            <MermaidDiagram
              chart={`stateDiagram-v2
    [*] --> Initialize: new LocalAgentExecutor()
    Initialize --> SendMessage: run(signal, updateOutput)

    state "执行循环" as Loop {
        SendMessage --> StreamResponse: 发送消息
        StreamResponse --> CheckTools: 检查响应

        CheckTools --> ExecuteTools: 有工具调用
        CheckTools --> CheckComplete: 无工具调用

        ExecuteTools --> SendMessage: 工具结果 → 继续

        CheckComplete --> GracePeriod: MAX_TURNS/TIMEOUT
        CheckComplete --> Goal: complete_task 调用
    }

    state "Grace Period" as GracePeriod {
        GP_Start --> GP_Wait: 60秒倒计时
        GP_Wait --> GP_Check: 检查 complete_task
        GP_Check --> Goal: 已调用
        GP_Check --> ForceTerminate: 未调用
    }

    GracePeriod --> GP_Start

    Goal --> [*]: GOAL 终止
    ForceTerminate --> [*]: ERROR_NO_COMPLETE_TASK_CALL`}
            />

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--terminal-green)] font-bold mb-3">核心执行循环</h4>
              <CodeBlock
                language="typescript"
                code={`// local-executor.ts - 简化的执行循环

class LocalAgentExecutor {
  private turnCount = 0;
  private completeTaskCalled = false;
  private isInGracePeriod = false;

  async run(
    signal: AbortSignal,
    updateOutput?: (output: string | AnsiOutput) => void,
  ): Promise<ToolResult> {

    // 注入 complete_task 工具
    const tools = this.injectCompleteTaskTool(this.definition.toolConfig?.tools);

    while (!signal.aborted) {
      this.turnCount++;

      // 检查 max_turns（非 Grace Period 时）
      if (!this.isInGracePeriod && this.turnCount > maxTurns) {
        return this.enterGracePeriod('MAX_TURNS');
      }

      // 发送消息并获取响应
      const response = await this.chat.sendMessage(messages, tools);

      // 处理工具调用
      if (response.functionCalls?.length) {
        for (const call of response.functionCalls) {
          if (call.name === 'complete_task') {
            this.completeTaskCalled = true;
            return { output: call.args.result };  // GOAL 终止
          }
          // 执行其他工具...
        }
        continue;  // 继续循环
      }

      // 无工具调用时提示使用 complete_task
      messages.push({
        role: 'user',
        content: 'Please use complete_task to provide final result.',
      });
    }

    return { output: 'Aborted' };  // ABORTED 终止
  }
}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
                <h4 className="text-[var(--amber)] font-bold mb-2">complete_task 工具</h4>
                <CodeBlock
                  language="typescript"
                  code={`// 自动注入的终止工具
const COMPLETE_TASK_TOOL = {
  name: 'complete_task',
  description: \`
Call this tool to complete the task.
Provide the final result or summary.
\`,
  parameters: {
    type: 'object',
    properties: {
      result: {
        type: 'string',
        description: 'The final result',
      },
    },
    required: ['result'],
  },
};`}
                />
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  与 Claude Code 的文本返回不同，gemini-cli 要求显式调用此工具
                </p>
              </div>

              <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
                <h4 className="text-[var(--purple)] font-bold mb-2">Grace Period 机制</h4>
                <CodeBlock
                  language="typescript"
                  code={`// local-executor.ts - Grace Period 常量
const GRACE_PERIOD_MS = 60 * 1000; // 60秒

async enterGracePeriod(reason: string) {
  this.isInGracePeriod = true;

  // 通知 Agent 必须调用 complete_task
  this.notify(TOOL_CALL_START, {
    message: \`⚠️ \${reason}: Must call complete_task within 60s\`,
  });

  // 等待 Grace Period
  await this.waitForCompleteTask(GRACE_PERIOD_MS);

  if (this.completeTaskCalled) {
    return { mode: AgentTerminateMode.GOAL };
  }

  return {
    mode: AgentTerminateMode.ERROR_NO_COMPLETE_TASK_CALL,
  };
}`}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* delegate_to_agent 工具 */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('delegate')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            🎯 delegate_to_agent 工具详解
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('delegate') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('delegate') && (
          <div className="space-y-6">
            <MermaidDiagram
              chart={`flowchart TB
    subgraph Schema["动态 Schema 生成"]
        R[AgentRegistry] --> D1["Agent 1 定义"]
        R --> D2["Agent 2 定义"]
        R --> D3["Agent N 定义"]

        D1 --> S1["{ agent_name: 'agent-1', ...inputs }"]
        D2 --> S2["{ agent_name: 'agent-2', ...inputs }"]
        D3 --> S3["{ agent_name: 'agent-n', ...inputs }"]

        S1 --> U["z.discriminatedUnion('agent_name', [...])"]
        S2 --> U
        S3 --> U
    end

    subgraph Dispatch["调用分发"]
        U --> Call["delegate_to_agent(params)"]
        Call --> Check{检查 agent_name}
        Check -->|local| LE["LocalAgentExecutor"]
        Check -->|remote| RA["RemoteAgentInvocation"]
    end

    style U fill:#22c55e,color:#000
    style LE fill:#3b82f6,color:#fff
    style RA fill:#f59e0b,color:#000`}
            />

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--terminal-green)] font-bold mb-3">动态 Schema 构建</h4>
              <CodeBlock
                language="typescript"
                code={`// delegate-to-agent-tool.ts - 动态 Schema 生成

export class DelegateToAgentTool extends BaseDeclarativeTool {
  constructor(registry: AgentRegistry, config: Config, messageBus?: MessageBus) {
    const definitions = registry.getAllDefinitions();

    // 为每个 Agent 生成独立的参数 Schema
    const agentSchemas = definitions.map((def) => {
      const inputShape: Record<string, z.ZodTypeAny> = {
        // 固定的 agent_name 作为判别器
        agent_name: z.literal(def.name).describe(def.description),
      };

      // 添加该 Agent 的输入参数
      for (const [key, inputDef] of Object.entries(def.inputConfig.inputs)) {
        // agent_name 是保留字段
        if (key === 'agent_name') {
          throw new Error(\`Agent '\${def.name}' cannot have input named 'agent_name'\`);
        }

        // 根据类型创建验证器
        let validator: z.ZodTypeAny;
        switch (inputDef.type) {
          case 'string': validator = z.string(); break;
          case 'number': validator = z.number(); break;
          case 'boolean': validator = z.boolean(); break;
          case 'integer': validator = z.number().int(); break;
          case 'string[]': validator = z.array(z.string()); break;
          case 'number[]': validator = z.array(z.number()); break;
        }

        if (!inputDef.required) validator = validator.optional();
        inputShape[key] = validator.describe(inputDef.description);
      }

      return z.object(inputShape);
    });

    // 使用 discriminatedUnion 组合
    const schema = z.discriminatedUnion('agent_name', agentSchemas);

    super(
      DELEGATE_TO_AGENT_TOOL_NAME,
      'Delegate to Agent',
      registry.getToolDescription(),
      Kind.Think,
      zodToJsonSchema(schema),
    );
  }
}`}
              />
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--cyber-blue)] font-bold mb-3">调用分发</h4>
              <CodeBlock
                language="typescript"
                code={`// delegate-to-agent-tool.ts - DelegateInvocation

class DelegateInvocation extends BaseToolInvocation {
  async execute(
    signal: AbortSignal,
    updateOutput?: (output: string | AnsiOutput) => void,
  ): Promise<ToolResult> {

    // 从 Registry 获取 Agent 定义
    const definition = this.registry.getDefinition(this.params.agent_name);
    if (!definition) {
      throw new Error(\`Agent '\${this.params.agent_name}' not found\`);
    }

    // 提取参数（排除 agent_name）
    const { agent_name, ...agentArgs } = this.params;

    // 使用 SubagentToolWrapper 处理 local/remote 分发
    const wrapper = new SubagentToolWrapper(
      definition,
      this.config,
      this.messageBus,
    );

    // build() 会根据 kind 返回不同的 Invocation
    const invocation = wrapper.build(agentArgs);

    return invocation.execute(signal, updateOutput);
  }
}`}
              />
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--purple)] font-bold mb-3">💡 为什么用 discriminatedUnion？</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--terminal-green)]">1.</span>
                  <span>
                    <strong>类型安全</strong>：每个 Agent 有独立的参数定义，
                    模型只能使用对应 Agent 的参数
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--terminal-green)]">2.</span>
                  <span>
                    <strong>自动验证</strong>：Zod 在调用时验证参数类型和必填性
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--terminal-green)]">3.</span>
                  <span>
                    <strong>动态扩展</strong>：Registry 中添加新 Agent 自动更新 Schema
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--terminal-green)]">4.</span>
                  <span>
                    <strong>更好的错误信息</strong>：discriminatedUnion 能精确指出哪个 Agent 的参数有问题
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* SubagentActivityEvent */}
      <section className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => toggleSection('events')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            📡 SubagentActivityEvent 事件系统
          </h2>
          <span className={`transform transition-transform ${expandedSections.has('events') ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expandedSections.has('events') && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--terminal-green)] font-bold mb-3">4 种活动事件</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: 'TOOL_CALL_START', desc: '工具调用开始', color: 'terminal-green' },
                  { name: 'TOOL_CALL_END', desc: '工具调用结束', color: 'cyber-blue' },
                  { name: 'THOUGHT_CHUNK', desc: '思考过程片段', color: 'amber' },
                  { name: 'ERROR', desc: '执行错误', color: 'red-400' },
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
              code={`// types.ts - SubagentActivityEvent 定义

export enum SubagentActivityEventType {
  TOOL_CALL_START = 'TOOL_CALL_START',
  TOOL_CALL_END = 'TOOL_CALL_END',
  THOUGHT_CHUNK = 'THOUGHT_CHUNK',
  ERROR = 'ERROR',
}

export interface SubagentActivityEvent {
  type: SubagentActivityEventType;
  agentName: string;
  timestamp: number;

  // TOOL_CALL_START/END 时填充
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: string;
  success?: boolean;

  // THOUGHT_CHUNK 时填充
  thought?: string;

  // ERROR 时填充
  error?: Error;
  message?: string;
}

// 事件通知回调
export type SubagentActivityNotifier = (
  event: SubagentActivityEvent
) => void;`}
            />

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
              <h4 className="text-[var(--cyber-blue)] font-bold mb-3">事件使用示例</h4>
              <CodeBlock
                language="typescript"
                code={`// UI 层监听 Agent 活动

const notifier: SubagentActivityNotifier = (event) => {
  switch (event.type) {
    case SubagentActivityEventType.TOOL_CALL_START:
      console.log(\`🔧 \${event.agentName} → \${event.toolName}(\${JSON.stringify(event.toolArgs)})\`);
      break;

    case SubagentActivityEventType.TOOL_CALL_END:
      const status = event.success ? '✅' : '❌';
      console.log(\`\${status} \${event.toolName} completed\`);
      break;

    case SubagentActivityEventType.THOUGHT_CHUNK:
      process.stdout.write(event.thought);  // 流式输出
      break;

    case SubagentActivityEventType.ERROR:
      console.error(\`❌ Error in \${event.agentName}: \${event.message}\`);
      break;
  }
};

// 传入 LocalAgentExecutor
const executor = new LocalAgentExecutor(definition, config, notifier);
await executor.run(signal, updateOutput);`}
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
              为什么用 TOML 而不是 YAML+Markdown？
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>严格验证</strong>：TOML + Zod 提供编译时类型检查</li>
              <li>• <strong>无歧义</strong>：TOML 语法比 YAML 更严格，避免缩进问题</li>
              <li>• <strong>多行字符串</strong>：TOML 的 """ 语法很适合 system_prompt</li>
              <li>• <strong>工具支持</strong>：更好的 IDE 支持和错误提示</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">
              为什么要求 complete_task 而不是文本返回？
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>明确信号</strong>：工具调用是显式的终止信号，避免歧义</li>
              <li>• <strong>结构化结果</strong>：result 参数可以包含结构化数据</li>
              <li>• <strong>统一处理</strong>：无论 Agent 任务如何，终止方式一致</li>
              <li>• <strong>Grace Period</strong>：可以明确检测是否调用了 complete_task</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h4 className="text-[var(--amber)] font-bold mb-2">
              为什么需要 Grace Period？
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>优雅降级</strong>：给 Agent 最后一次机会完成任务</li>
              <li>• <strong>避免数据丢失</strong>：Agent 可能正在生成重要结果</li>
              <li>• <strong>60 秒足够</strong>：一个额外轮次通常足够调用 complete_task</li>
              <li>• <strong>明确错误</strong>：ERROR_NO_COMPLETE_TASK_CALL 比 TIMEOUT 更清晰</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4">
            <h4 className="text-[var(--purple)] font-bold mb-2">
              local vs remote Agent 的选择？
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>local</strong>：需要访问本地工具（文件、Shell），低延迟</li>
              <li>• <strong>remote</strong>：外部服务、专有能力、隔离执行</li>
              <li>• <strong>A2A 协议</strong>：标准化的 Agent 互操作接口</li>
              <li>• <strong>统一接口</strong>：delegate_to_agent 透明处理两种类型</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 相关页面 */}
      <RelatedPages
        title="🔗 相关页面"
        pages={[
          { id: 'subagent', label: 'Agent 系统概览', description: '基础概念和快速入门' },
          { id: 'subagent-anim', label: 'Agent 执行动画', description: '可视化执行流程' },
          { id: 'subagent-resolution-anim', label: '优先级解析动画', description: '三级优先级可视化' },
        ]}
      />
    </div>
  );
}

export default SubagentArchitecture;
