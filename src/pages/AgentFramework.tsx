import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'subagent', label: '子代理系统', description: 'Subagent 概述' },
  { id: 'policy-engine', label: 'Policy 策略引擎', description: '安全决策系统' },
  { id: 'model-routing', label: '模型路由', description: '智能模型选择' },
  { id: 'tool-arch', label: '工具架构', description: '工具系统基础' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* 一句话总结 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--cyber-blue)] font-bold">一句话：</span>
              可配置的子代理执行框架，通过 TOML 定义 Agent，支持本地执行和远程 A2A 调用
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">2</div>
              <div className="text-xs text-[var(--text-muted)]">Agent 类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">6</div>
              <div className="text-xs text-[var(--text-muted)]">终止模式</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">配置层级</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">2</div>
              <div className="text-xs text-[var(--text-muted)]">内置 Agent</div>
            </div>
          </div>

          {/* 核心流程 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Agent 执行流程</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                TOML 加载
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                Registry 注册
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                Executor 执行
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                complete_task
              </span>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/core/src/agents/
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function AgentFramework() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const architectureChart = `flowchart TD
    subgraph Config["📁 配置层"]
      TOML[TOML 文件]
      BUILTIN[内置 Agent]
    end

    subgraph Registry["📋 AgentRegistry"]
      REG[注册与管理]
      REG --> |用户级| USER["~/.gemini/agents/"]
      REG --> |项目级| PROJ[".gemini/agents/"]
      REG --> |内置| BUILT[CodebaseInvestigator<br/>IntrospectionAgent]
    end

    subgraph Execution["⚡ 执行层"]
      LOCAL[LocalAgentExecutor]
      REMOTE[A2AClientManager]
    end

    TOML --> REG
    BUILTIN --> REG
    REG --> |kind: local| LOCAL
    REG --> |kind: remote| REMOTE

    subgraph Output["📤 输出"]
      RESULT[OutputObject]
    end

    LOCAL --> RESULT
    REMOTE --> RESULT

    style Registry fill:#1a1a2e,stroke:#00d4ff,stroke-width:2px
    style LOCAL fill:#1a2e1a,stroke:#4ade80,stroke-width:2px
    style REMOTE fill:#2d1b4e,stroke:#a855f7,stroke-width:2px`;

  const executionLoopChart = `flowchart TD
    subgraph Loop["🔄 LocalAgentExecutor.run()"]
      START[开始执行] --> CHECK{检查终止条件}
      CHECK --> |继续| TURN[executeTurn]
      CHECK --> |超时/轮次| WARN[executeFinalWarningTurn]

      TURN --> MODEL[调用模型]
      MODEL --> TOOLS{有工具调用?}

      TOOLS --> |是| PROCESS[processFunctionCalls]
      TOOLS --> |否| ERROR[ERROR_NO_COMPLETE_TASK_CALL]

      PROCESS --> COMPLETE{complete_task?}
      COMPLETE --> |是| GOAL[✅ GOAL]
      COMPLETE --> |否| CHECK

      WARN --> RECOVER{恢复成功?}
      RECOVER --> |是| GOAL
      RECOVER --> |否| FAIL[❌ 终止]
    end

    style GOAL fill:#1a2e1a,stroke:#4ade80,stroke-width:2px
    style FAIL fill:#2e1a1a,stroke:#ef4444,stroke-width:2px
    style TURN fill:#1a1a2e,stroke:#00d4ff,stroke-width:2px`;

  const agentTypesCode = `// Agent 终止模式
export enum AgentTerminateMode {
  ERROR = 'ERROR',                           // 执行错误
  TIMEOUT = 'TIMEOUT',                       // 超时
  GOAL = 'GOAL',                             // 成功完成
  MAX_TURNS = 'MAX_TURNS',                   // 达到轮次上限
  ABORTED = 'ABORTED',                       // 被取消
  ERROR_NO_COMPLETE_TASK_CALL = 'ERROR_NO_COMPLETE_TASK_CALL',  // 未调用完成工具
}

// 基础 Agent 定义
export interface BaseAgentDefinition<TOutput> {
  name: string;                              // 唯一标识符
  displayName?: string;                      // 显示名称
  description: string;                       // 描述
  inputConfig: InputConfig;                  // 输入参数配置
  outputConfig?: OutputConfig<TOutput>;      // 输出配置 (Zod schema)
}

// 本地 Agent 定义
export interface LocalAgentDefinition<TOutput> extends BaseAgentDefinition<TOutput> {
  kind: 'local';
  promptConfig: PromptConfig;                // 提示词配置
  modelConfig: ModelConfig;                  // 模型配置
  runConfig: RunConfig;                      // 运行配置
  toolConfig?: ToolConfig;                   // 工具配置
  processOutput?: (output: TOutput) => string;  // 输出处理函数
}

// 远程 Agent 定义 (A2A)
export interface RemoteAgentDefinition<TOutput> extends BaseAgentDefinition<TOutput> {
  kind: 'remote';
  agentCardUrl: string;                      // A2A Agent Card URL
}`;

  const configTypesCode = `// 提示词配置
export interface PromptConfig {
  systemPrompt?: string;       // 系统提示词，支持 \${input_name} 模板
  initialMessages?: Content[]; // Few-shot 示例
  query?: string;              // 初始查询，触发执行循环
}

// 工具配置
export interface ToolConfig {
  tools: Array<string | FunctionDeclaration | AnyDeclarativeTool>;
}

// 输入配置
export interface InputConfig {
  inputs: Record<string, {
    description: string;
    type: 'string' | 'number' | 'boolean' | 'integer' | 'string[]' | 'number[]';
    required: boolean;
  }>;
}

// 模型配置
export interface ModelConfig {
  model: string;               // 模型名称，'inherit' 表示继承父级
  temp: number;                // 温度
  top_p: number;               // Top-P 采样
  thinkingBudget?: number;     // 思考预算
}

// 运行配置
export interface RunConfig {
  max_time_minutes: number;    // 最大执行时间（分钟）
  max_turns?: number;          // 最大对话轮次
}`;

  const registryCode = `// AgentRegistry - 管理 Agent 的发现、加载和注册
export class AgentRegistry {
  private readonly agents = new Map<string, AgentDefinition>();

  async initialize(): Promise<void> {
    // 1. 加载内置 Agent
    this.loadBuiltInAgents();

    // 2. 加载用户级 Agent (~/.gemini/agents/)
    const userAgentsDir = Storage.getUserAgentsDir();
    const userAgents = await loadAgentsFromDirectory(userAgentsDir);
    for (const agent of userAgents.agents) {
      await this.registerAgent(agent);
    }

    // 3. 加载项目级 Agent (.gemini/agents/)
    if (this.config.isTrustedFolder()) {
      const projectAgentsDir = this.config.storage.getProjectAgentsDir();
      const projectAgents = await loadAgentsFromDirectory(projectAgentsDir);
      for (const agent of projectAgents.agents) {
        await this.registerAgent(agent);
      }
    }
  }

  private loadBuiltInAgents(): void {
    // CodebaseInvestigator - 代码库探索
    if (this.config.getCodebaseInvestigatorSettings()?.enabled) {
      this.registerLocalAgent(CodebaseInvestigatorAgent);
    }

    // IntrospectionAgent - 自省分析
    if (this.config.getIntrospectionAgentSettings().enabled) {
      this.registerLocalAgent(IntrospectionAgent);
    }
  }

  // 获取 Agent 目录上下文（注入到系统提示词）
  getDirectoryContext(): string {
    let context = '## Available Sub-Agents\\n';
    context += 'Use \`delegate_to_agent\` for complex tasks.\\n\\n';
    for (const [name, def] of this.agents) {
      context += \`- **\${name}**: \${def.description}\\n\`;
    }
    return context;
  }
}`;

  const tomlConfigCode = `# ~/.gemini/agents/code-reviewer.toml

name = "code-reviewer"
display_name = "Code Reviewer"
description = "专业代码审查，检查最佳实践和潜在问题"

[prompts]
system_prompt = """
You are a senior code reviewer. Analyze the code for:
- Best practices and patterns
- Potential bugs and issues
- Performance considerations
- Security vulnerabilities

Current model: \${activeModel}
Today: \${today}
"""
query = "Review the following code: \${query}"

[model]
model = "inherit"        # 继承父级模型
temperature = 0.3        # 较低温度，更精确

[run]
max_turns = 10           # 最多 10 轮对话
timeout_mins = 5         # 5 分钟超时

# 可用工具列表
tools = [
  "Read",
  "Grep",
  "Glob",
  "LSP"
]`;

  const remoteAgentTomlCode = `# ~/.gemini/agents/remote-agents.toml

[[remote_agents]]
name = "external-analyzer"
agent_card_url = "https://example.com/.well-known/agent.json"

[[remote_agents]]
name = "cloud-processor"
agent_card_url = "https://api.example.com/agent-card"`;

  const executorCode = `// LocalAgentExecutor - 执行本地 Agent 的循环逻辑
export class LocalAgentExecutor<TOutput> {
  // 创建执行器（工厂方法）
  static async create<TOutput>(
    definition: LocalAgentDefinition<TOutput>,
    runtimeContext: Config,
    onActivity?: ActivityCallback,
  ): Promise<LocalAgentExecutor<TOutput>> {
    // 创建隔离的工具注册表
    const agentToolRegistry = new ToolRegistry(runtimeContext);
    // ... 注册 Agent 可用的工具
    return new LocalAgentExecutor(definition, runtimeContext, agentToolRegistry);
  }

  // 执行 Agent
  async run(inputs: AgentInputs, signal: AbortSignal): Promise<OutputObject> {
    const { max_time_minutes } = this.definition.runConfig;

    // 设置超时
    const timeoutController = new AbortController();
    setTimeout(() => timeoutController.abort(), max_time_minutes * 60 * 1000);

    // 创建 Chat 对象
    const chat = await this.createChatObject(inputs, tools);
    let currentMessage = { role: 'user', parts: [{ text: query }] };

    // 主执行循环
    while (true) {
      // 检查终止条件
      const reason = this.checkTermination(startTime, turnCounter);
      if (reason) break;

      // 执行一轮
      const turnResult = await this.executeTurn(chat, currentMessage, turnCounter++);

      if (turnResult.status === 'stop') {
        if (turnResult.terminateReason === AgentTerminateMode.GOAL) {
          return { result: turnResult.finalResult, terminate_reason: 'GOAL' };
        }
        break;
      }

      currentMessage = turnResult.nextMessage;
    }

    // 尝试恢复（给 Agent 最后机会）
    const recoveryResult = await this.executeFinalWarningTurn(chat, turnCounter);
    // ...
  }
}`;

  const completeTaskCode = `// complete_task 工具 - Agent 必须调用此工具来完成任务
const completeTool: FunctionDeclaration = {
  name: 'complete_task',
  description: outputConfig
    ? 'Call this tool to submit your final answer. This is the ONLY way to finish.'
    : 'Call this tool to submit your findings. This is the ONLY way to finish.',
  parameters: {
    type: 'OBJECT',
    properties: outputConfig
      ? { [outputConfig.outputName]: zodToJsonSchema(outputConfig.schema) }
      : { result: { type: 'STRING', description: 'Your final findings.' } },
    required: [outputConfig?.outputName ?? 'result'],
  },
};

// 处理 complete_task 调用
if (functionCall.name === 'complete_task') {
  const { outputConfig } = this.definition;

  if (outputConfig) {
    // 有输出配置 - 验证 Zod schema
    const validationResult = outputConfig.schema.safeParse(args[outputConfig.outputName]);
    if (!validationResult.success) {
      // 验证失败，要求重试
      return { error: 'Output validation failed: ...' };
    }
    submittedOutput = this.definition.processOutput?.(validationResult.data)
      ?? JSON.stringify(validationResult.data);
  } else {
    // 无输出配置 - 使用默认 result 参数
    submittedOutput = args['result'];
  }

  taskCompleted = true;
}`;

  const builtInAgentsCode = `// CodebaseInvestigatorAgent - 代码库探索 Agent
export const CodebaseInvestigatorAgent: LocalAgentDefinition = {
  kind: 'local',
  name: 'codebase-investigator',
  description: 'Explores and analyzes codebases to answer questions.',
  promptConfig: {
    systemPrompt: \`You are a codebase investigator...
Work systematically using available tools.
When done, call complete_task with your findings.\`,
  },
  modelConfig: {
    model: 'gemini-2.0-flash',  // 使用 Flash 模型
    temp: 1,
    top_p: 0.95,
    thinkingBudget: 1024,
  },
  runConfig: {
    max_time_minutes: 5,
    max_turns: 15,
  },
  toolConfig: {
    tools: ['Read', 'Glob', 'Grep', 'Bash', 'LSP'],
  },
  inputConfig: {
    inputs: {
      query: { type: 'string', description: 'The question to investigate', required: true },
    },
  },
};

// IntrospectionAgent - 自省分析 Agent
export const IntrospectionAgent: LocalAgentDefinition = {
  kind: 'local',
  name: 'introspection-agent',
  description: 'Analyzes and reflects on conversation history.',
  // ...
};`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
          Agent Framework 代理框架
        </h1>
        <p className="text-xl text-[var(--text-muted)]">
          可配置的子代理执行框架 - TOML 驱动的 Agent 定义与执行
        </p>
      </div>

      <QuickSummary
        isExpanded={isSummaryExpanded}
        onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
      />

      {/* 核心架构 */}
      <Layer title="核心架构">
        <p className="text-[var(--text-secondary)] mb-6">
          Agent Framework 提供了一套完整的子代理系统，支持通过 TOML 配置文件定义 Agent，
          并在隔离的执行环境中运行。支持本地执行和远程 A2A (Agent-to-Agent) 调用。
        </p>
        <MermaidDiagram chart={architectureChart} />
      </Layer>

      {/* Agent 类型 */}
      <Layer title="Agent 类型定义">
        <p className="text-[var(--text-secondary)] mb-4">
          Agent 分为 <strong>Local</strong> 和 <strong>Remote</strong> 两种类型，
          通过 <code className="text-[var(--cyber-blue)]">kind</code> 字段区分。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <HighlightBox title="Local Agent" variant="blue">
            <ul className="text-sm space-y-1">
              <li>• <strong>kind</strong>: 'local'</li>
              <li>• 在本地 CLI 进程中执行</li>
              <li>• 完整的配置控制 (prompt, model, run, tools)</li>
              <li>• 支持 Zod schema 输出验证</li>
              <li>• 使用 LocalAgentExecutor 执行</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="Remote Agent (A2A)" variant="purple">
            <ul className="text-sm space-y-1">
              <li>• <strong>kind</strong>: 'remote'</li>
              <li>• 通过 HTTP 调用外部 Agent 服务</li>
              <li>• 使用 Agent Card URL 发现能力</li>
              <li>• 符合 A2A (Agent-to-Agent) 协议</li>
              <li>• 使用 A2AClientManager 管理</li>
            </ul>
          </HighlightBox>
        </div>

        <CodeBlock code={agentTypesCode} language="typescript" title="types.ts - Agent 类型定义" />
      </Layer>

      {/* 配置结构 */}
      <Layer title="配置结构">
        <p className="text-[var(--text-secondary)] mb-4">
          LocalAgentDefinition 包含多个配置块，控制 Agent 的行为：
        </p>

        <CodeBlock code={configTypesCode} language="typescript" title="配置接口定义" />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">配置块</th>
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">用途</th>
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">关键字段</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-[var(--cyber-blue)]">PromptConfig</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">提示词配置</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">systemPrompt, query (支持模板)</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-[var(--purple)]">ModelConfig</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">模型参数</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">model, temp, top_p, thinkingBudget</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-[var(--terminal-green)]">RunConfig</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">执行约束</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">max_time_minutes, max_turns</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-[var(--amber)]">ToolConfig</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">可用工具</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">tools[] (字符串名称或声明)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* TOML 配置示例 */}
      <Layer title="TOML 配置示例">
        <p className="text-[var(--text-secondary)] mb-4">
          Agent 通过 TOML 文件定义，放置在 <code>~/.gemini/agents/</code> (用户级) 或
          <code>.gemini/agents/</code> (项目级) 目录下。
        </p>

        <CodeBlock code={tomlConfigCode} language="toml" title="本地 Agent 配置示例" />

        <div className="mt-6">
          <CodeBlock code={remoteAgentTomlCode} language="toml" title="远程 Agent 配置示例" />
        </div>

        <HighlightBox title="模板变量" variant="blue" className="mt-4">
          <p className="text-sm mb-2">系统提示词和查询支持以下模板变量：</p>
          <ul className="text-sm space-y-1">
            <li>• <code>${'${query}'}</code> - 用户输入的查询</li>
            <li>• <code>${'${activeModel}'}</code> - 当前活动模型</li>
            <li>• <code>${'${today}'}</code> - 今天的日期</li>
            <li>• <code>${'${cliVersion}'}</code> - CLI 版本</li>
            <li>• 自定义 inputs 中定义的参数</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* AgentRegistry */}
      <Layer title="AgentRegistry 注册表">
        <p className="text-[var(--text-secondary)] mb-4">
          <code className="text-[var(--cyber-blue)]">AgentRegistry</code> 负责 Agent 的发现、加载、验证和注册。
          它按优先级加载：内置 → 用户级 → 项目级。
        </p>

        <CodeBlock code={registryCode} language="typescript" title="registry.ts" />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="内置 Agent" variant="blue">
            <ul className="text-sm space-y-1">
              <li>• CodebaseInvestigator</li>
              <li>• IntrospectionAgent</li>
              <li>• 通过设置启用/禁用</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="用户级 Agent" variant="purple">
            <ul className="text-sm space-y-1">
              <li>• 位置: ~/.gemini/agents/</li>
              <li>• 全局可用</li>
              <li>• 优先级高于内置</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="项目级 Agent" variant="green">
            <ul className="text-sm space-y-1">
              <li>• 位置: .gemini/agents/</li>
              <li>• 需要信任文件夹</li>
              <li>• 优先级最高</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* 执行循环 */}
      <Layer title="执行循环">
        <p className="text-[var(--text-secondary)] mb-4">
          <code className="text-[var(--cyber-blue)]">LocalAgentExecutor</code> 实现 Agent 的执行循环，
          持续调用模型和工具直到 Agent 调用 <code>complete_task</code> 或达到终止条件。
        </p>

        <MermaidDiagram chart={executionLoopChart} />

        <div className="mt-6">
          <CodeBlock code={executorCode} language="typescript" title="local-executor.ts 核心逻辑" />
        </div>
      </Layer>

      {/* complete_task 工具 */}
      <Layer title="complete_task 完成工具">
        <p className="text-[var(--text-secondary)] mb-4">
          每个 Agent 必须调用 <code className="text-[var(--cyber-blue)]">complete_task</code> 工具来完成任务。
          这是 Agent 返回结果的唯一方式。
        </p>

        <CodeBlock code={completeTaskCode} language="typescript" title="complete_task 实现" />

        <HighlightBox title="关键规则" variant="yellow" className="mt-4">
          <ul className="text-sm space-y-1">
            <li>• Agent <strong>必须</strong> 调用 complete_task 来完成任务</li>
            <li>• 如果停止调用工具但未调用 complete_task → ERROR_NO_COMPLETE_TASK_CALL</li>
            <li>• 超时或达到轮次上限时，会给 Agent 一次恢复机会 (grace period)</li>
            <li>• 有 outputConfig 时，输出会经过 Zod schema 验证</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 内置 Agent */}
      <Layer title="内置 Agent">
        <p className="text-[var(--text-secondary)] mb-4">
          Gemini CLI 内置了两个常用 Agent，可通过设置启用：
        </p>

        <CodeBlock code={builtInAgentsCode} language="typescript" title="内置 Agent 定义" />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="CodebaseInvestigator" variant="blue">
            <p className="text-sm mb-2">代码库探索和分析 Agent</p>
            <ul className="text-sm space-y-1 text-[var(--text-muted)]">
              <li>• 探索代码结构和实现</li>
              <li>• 使用 Flash 模型（快速）</li>
              <li>• 工具: Read, Glob, Grep, Bash, LSP</li>
              <li>• 最多 15 轮，5 分钟超时</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="IntrospectionAgent" variant="purple">
            <p className="text-sm mb-2">自省和反思分析 Agent</p>
            <ul className="text-sm space-y-1 text-[var(--text-muted)]">
              <li>• 分析对话历史</li>
              <li>• 提供改进建议</li>
              <li>• 需要显式启用</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* 终止模式 */}
      <Layer title="终止模式">
        <p className="text-[var(--text-secondary)] mb-4">
          Agent 可能因以下原因终止执行：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">模式</th>
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">描述</th>
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">可恢复</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-[var(--terminal-green)] font-bold">GOAL</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">成功调用 complete_task</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">-</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-[var(--amber)] font-bold">TIMEOUT</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">超过 max_time_minutes</td>
                <td className="py-2 px-3 text-[var(--terminal-green)]">✓ 60秒恢复期</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-[var(--amber)] font-bold">MAX_TURNS</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">达到 max_turns 限制</td>
                <td className="py-2 px-3 text-[var(--terminal-green)]">✓ 60秒恢复期</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-red-400 font-bold">ERROR</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">执行过程中出错</td>
                <td className="py-2 px-3 text-red-400">✗</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-red-400 font-bold">ABORTED</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">用户取消 (AbortSignal)</td>
                <td className="py-2 px-3 text-red-400">✗</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 text-red-400 font-bold">ERROR_NO_COMPLETE_TASK_CALL</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">停止调用工具但未完成</td>
                <td className="py-2 px-3 text-[var(--terminal-green)]">✓ 60秒恢复期</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 与其他系统集成 */}
      <Layer title="系统集成">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="与 Policy 集成" variant="blue">
            <p className="text-sm">
              Agent 执行时使用 YOLO 模式 (ApprovalMode.YOLO)，工具调用不需要用户确认。
              但工具本身仍受 Policy 规则约束。
            </p>
          </HighlightBox>

          <HighlightBox title="与 Model Routing 集成" variant="purple">
            <p className="text-sm">
              每个 Agent 可以指定自己的模型配置，或使用 'inherit' 继承父级模型。
              支持独立的 temperature 和 thinkingBudget 设置。
            </p>
          </HighlightBox>

          <HighlightBox title="与 Tool Registry 集成" variant="green">
            <p className="text-sm">
              每个 Agent 有隔离的 ToolRegistry，只能访问 toolConfig 中声明的工具。
              防止 Agent 调用未授权的工具。
            </p>
          </HighlightBox>

          <HighlightBox title="与 Telemetry 集成" variant="yellow">
            <p className="text-sm">
              Agent 执行过程会记录 AgentStartEvent、AgentFinishEvent 和 RecoveryAttemptEvent，
              用于监控和分析。
            </p>
          </HighlightBox>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
