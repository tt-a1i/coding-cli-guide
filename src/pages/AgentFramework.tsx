import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



const relatedPages: RelatedPage[] = [
 { id: 'subagent', label: '子代理系统', description: 'Subagent 概述' },
 { id: 'policy-engine', label: 'Policy 策略引擎', description: '安全决策系统' },
 { id: 'model-routing', label: '模型路由', description: '智能模型选择' },
 { id: 'tool-arch', label: '工具架构', description: '工具系统基础' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">🤖</span>
 <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 {/* 一句话总结 */}
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 可配置的子代理执行框架，通过 Markdown + YAML frontmatter 定义 Agent，支持本地执行和远程 A2A 调用
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">Agent 类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">6</div>
 <div className="text-xs text-dim">终止模式</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">配置层级</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">内置 Agent</div>
 </div>
 </div>

 {/* 核心流程 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">Agent 执行流程</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Markdown frontmatter 加载
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Registry 注册
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Executor 执行
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 complete_task
 </span>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">📍 源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
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
 TOML[Markdown 配置文件]
 BUILTIN[内置 Agent]
 end

 subgraph Registry["📋 AgentRegistry"]
 REG[注册与管理]
 REG --> |用户级| USER["~/.gemini/agents/"]
 REG --> |项目级| PROJ[".gemini/agents/"]
 REG --> |内置| BUILT[codebase_investigator\ncli_help\ngeneralist]
 end

 subgraph Execution["⚡ 执行层"]
 LOCAL[SubAgentScope]
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

 style Registry stroke:#00d4ff,stroke-width:2px
 style LOCAL stroke:#4ade80,stroke-width:2px
 style REMOTE stroke:#a855f7,stroke-width:2px`;

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

 style GOAL stroke:#4ade80,stroke-width:2px
 style FAIL stroke:${getThemeColor("--color-danger", "#b91c1c")},stroke-width:2px
 style TURN stroke:#00d4ff,stroke-width:2px`;

 const agentTypesCode = `// Agent 终止模式
// packages/core/src/agents/types.ts
export enum AgentTerminateMode {
  ERROR = 'ERROR', // 执行错误
  TIMEOUT = 'TIMEOUT', // 超时
  GOAL = 'GOAL', // 成功完成
  MAX_TURNS = 'MAX_TURNS', // 达到轮次上限
  ABORTED = 'ABORTED', // 外部中止信号
  ERROR_NO_COMPLETE_TASK_CALL = 'ERROR_NO_COMPLETE_TASK_CALL', // 未调用 complete_task
}

// 基础 Agent 定义
export interface BaseAgentDefinition<TOutput> {
  name: string; // 唯一标识符
  displayName?: string; // 显示名称
  description: string; // 描述
  inputConfig: InputConfig; // 输入参数配置
  outputConfig?: OutputConfig<TOutput>; // 输出配置 (Zod schema)
}

// 本地 Agent 定义
export interface LocalAgentDefinition<TOutput> extends BaseAgentDefinition<TOutput> {
  kind: 'local';
  promptConfig: PromptConfig; // 提示词配置
  modelConfig: ModelConfig; // 模型配置
  runConfig: RunConfig; // 运行配置
  toolConfig?: ToolConfig; // 工具配置
  processOutput?: (output: TOutput) => string; // 输出处理函数
}

// 远程 Agent 定义 (A2A)
export interface RemoteAgentDefinition<TOutput> extends BaseAgentDefinition<TOutput> {
  kind: 'remote';
  agentCardUrl: string; // A2A Agent Card URL
}`;

 const configTypesCode = `// 提示词配置
export interface PromptConfig {
  systemPrompt?: string; // 系统提示词，支持 \${input_name} 模板
  initialMessages?: Content[]; // Few-shot 示例
  query?: string; // 初始查询，触发执行循环
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
  model: string; // 模型名称，'inherit' 表示继承父级
  temp: number; // 温度
  top_p: number; // Top-P 采样
  thinkingBudget?: number; // 思考预算
}

// 运行配置
export interface RunConfig {
  max_time_minutes: number; // 最大执行时间（分钟）
  max_turns?: number; // 最大对话轮次
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
  const investigatorSettings = this.config.getCodebaseInvestigatorSettings();
  const cliHelpSettings = this.config.getCliHelpAgentSettings();
  const agentsOverrides = this.config.getAgentsSettings().overrides ?? {};

  // CodebaseInvestigator - 代码库探索
  if (
  investigatorSettings?.enabled &&
  agentsOverrides[CodebaseInvestigatorAgent.name]?.enabled !== false
  ) {
  this.registerLocalAgent(CodebaseInvestigatorAgent);
  }

  // CLI Help - 文档问答
  if (
  cliHelpSettings.enabled &&
  agentsOverrides[CliHelpAgent.name]?.enabled !== false
  ) {
  this.registerLocalAgent(CliHelpAgent(this.config));
  }

  // Generalist - 通用代理（实验特性）
  this.registerLocalAgent(GeneralistAgent(this.config));
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

 const markdownConfigCode = `---
kind: local
name: code-reviewer
description: 专业代码审查，检查最佳实践和潜在问题
display_name: Code Reviewer
tools:
  - read_file
  - search_file_content
  - glob
  - list_directory
# 说明：内置工具使用 tool name（如 read_file）；MCP 工具用 server__tool 格式
model: gemini-2.5-flash
temperature: 0.3
max_turns: 10
timeout_mins: 5
---
You are a senior code reviewer. Analyze the code for:
- Best practices and patterns
- Potential bugs and issues
- Performance considerations
- Security vulnerabilities

Current model: \${activeModel}
Today: \${today}

When asked to review code, focus on actionable feedback.`;

 const remoteAgentNote = `注意：远程 Agent 通过 A2A (Agent-) 协议调用，
配置需要提供 agent_card_url 指向远程 Agent 的描述文件。
详情参见 A2A 协议文档。`;

 const executorCode = `// LocalAgentExecutor - 执行本地 Agent 的循环逻辑
export class LocalAgentExecutor<TOutput> {
  // 创建执行器（工厂方法）
  static async create<TOutput>(
  definition: LocalAgentDefinition<TOutput>,
  runtimeContext: Config,
  onActivity?: ActivityCallback,
  ): Promise<LocalAgentExecutor<TOutput>> {
  // 创建隔离的工具注册表
  const agentToolRegistry = new ToolRegistry(
  runtimeContext,
  runtimeContext.getMessageBus(),
  );
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

 const builtInAgentsCode = `// CodebaseInvestigatorAgent - 使用 Zod schema 定义结构化输出
const CodebaseInvestigationReportSchema = z.object({
  SummaryOfFindings: z.string()
  .describe("Investigation conclusions and insights for the main agent."),
  ExplorationTrace: z.array(z.string())
  .describe("Step-by-step list of actions and tools used."),
  RelevantLocations: z.array(z.object({
  FilePath: z.string(),
  Reasoning: z.string(),
  KeySymbols: z.array(z.string()),
  })).describe("Relevant files and key symbols within them."),
});

export const CodebaseInvestigatorAgent: LocalAgentDefinition<
  typeof CodebaseInvestigationReportSchema
> = {
  kind: 'local',
  name: 'codebase_investigator',
  displayName: 'Codebase Investigator Agent',
  description: \`The specialized tool for codebase analysis, architectural mapping,
  and understanding system-wide dependencies. Invoke for vague requests,
  bug root-cause analysis, or comprehensive feature implementation.\`,

  // 输入配置
  inputConfig: {
  inputs: {
  objective: {
  description: "Comprehensive description of user's goal with context.",
  type: 'string',
  required: true,
  },
  },
  },

  // 结构化输出配置（使用 Zod schema）
  outputConfig: {
  outputName: 'report',
  description: 'The final investigation report as a JSON object.',
  schema: CodebaseInvestigationReportSchema,
  },

  // 输出处理函数
  processOutput: (output) => JSON.stringify(output, null, 2),

  // 模型配置
  modelConfig: {
  model: DEFAULT_GEMINI_MODEL, // 根据主模型选择 Flash/Pro
  temp: 0.1, // 低温度，更精确
  top_p: 0.95,
  thinkingBudget: -1, // 无限制
  },

  // 运行配置
  runConfig: {
  max_time_minutes: 5,
  max_turns: 15,
  },

  // 工具配置 - 仅只读工具
  toolConfig: {
  tools: [LS_TOOL_NAME, READ_FILE_TOOL_NAME, GLOB_TOOL_NAME, GREP_TOOL_NAME],
  },

  // 提示词配置
  promptConfig: {
  query: \`Your task is to do a deep investigation of the codebase...
<objective>\${objective}</objective>\`,
  systemPrompt: \`You are **Codebase Investigator**, a hyper-specialized AI agent...
Your **SOLE PURPOSE** is to build a complete mental model of the code.
- **DO:** Find key modules, classes, and functions
- **DO:** Understand *why* the code is written the way it is
- **DO NOT:** Write the final implementation code yourself
When finished, call \\\`complete_task\\\` with your structured report.\`,
  },
};`;

 const delegateToolCode = `// DelegateToAgentTool - 父 Agent 委托任务给子 Agent
export class DelegateToAgentTool extends BaseDeclarativeTool<DelegateParams, ToolResult> {
  constructor(
  private readonly registry: AgentRegistry,
  private readonly config: Config,
  messageBus: MessageBus,
  ) {
  const definitions = registry.getAllDefinitions();

  // 动态生成 discriminated union schema
  const agentSchemas = definitions.map((def) => {
  const inputShape: Record<string, z.ZodTypeAny> = {
  agent_name: z.literal(def.name).describe(def.description),
  };
  // 添加 Agent 定义的输入参数
  for (const [key, inputDef] of Object.entries(def.inputConfig.inputs)) {
  inputShape[key] = mapTypeToZod(inputDef.type);
  }
  return z.object(inputShape);
  });

  const schema = z.discriminatedUnion('agent_name', agentSchemas);

  super(
  'delegate_to_agent',
  'Delegate to Agent',
  registry.getToolDescription(), // 动态描述包含所有可用 Agent
  Kind.Think,
  zodToJsonSchema(schema),
  messageBus,
  true, // isOutputMarkdown
  true, // canUpdateOutput（子代理执行过程可流式输出）
  );
  }
}

// 执行委托
class DelegateInvocation extends BaseToolInvocation<DelegateParams, ToolResult> {
  async execute(signal: AbortSignal): Promise<ToolResult> {
  const definition = this.registry.getDefinition(this.params.agent_name);

  // 使用 SubagentToolWrapper 创建实际执行
  const wrapper = new SubagentToolWrapper(definition, this.config, this.messageBus);
  const { agent_name, ...agentArgs } = this.params;
  const invocation = wrapper.build(agentArgs);

  return invocation.execute(signal);
  }
}`;

 const activityEventCode = `// SubagentActivityEvent - Agent 执行过程中的活动事件
export interface SubagentActivityEvent {
  isSubagentActivityEvent: true;
  agentName: string;
  type: 'TOOL_CALL_START' | 'TOOL_CALL_END' | 'THOUGHT_CHUNK' | 'ERROR';
  data: Record<string, unknown>;
}

// 在 LocalAgentExecutor 中发射事件
private emitActivity(
  type: SubagentActivityEvent['type'],
  data: Record<string, unknown>,
): void {
  if (this.onActivity) {
  const event: SubagentActivityEvent = {
  isSubagentActivityEvent: true,
  agentName: this.definition.name,
  type,
  data,
  };
  this.onActivity(event);
  }
}

// 使用示例
this.emitActivity('TOOL_CALL_START', { name: functionCall.name, args });
this.emitActivity('THOUGHT_CHUNK', { text: subject });
this.emitActivity('TOOL_CALL_END', { name: functionCall.name, output: result });
this.emitActivity('ERROR', { error: errorMessage, context: 'tool_call' });`;

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-4xl font-bold text-heading mb-3">
 Agent Framework 代理框架
 </h1>
 <p className="text-xl text-dim">
 可配置的子代理执行框架 - Markdown frontmatter 驱动的 Agent 定义与执行
 </p>
 </div>

 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 核心架构 */}
 <Layer title="核心架构">
 <p className="text-body mb-6">
 Agent Framework 提供了一套完整的子代理系统，支持通过 Markdown + YAML frontmatter 定义 Agent，
 并在隔离的执行环境中运行。支持本地执行和远程 A2A (Agent-) 调用。
 </p>
 <MermaidDiagram chart={architectureChart} />
 </Layer>

 {/* Agent 类型 */}
 <Layer title="Agent 类型定义">
 <p className="text-body mb-4">
 Agent 分为 <strong>Local</strong> 和 <strong>Remote</strong> 两种类型，
 通过 <code className="text-heading">kind</code> 字段区分。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
 <HighlightBox title="Local Agent" variant="blue">
 <ul className="text-sm space-y-1">
 <li><strong>kind</strong>: 'local'</li>
 <li>在本地 CLI 进程中执行</li>
 <li>完整的配置控制 (prompt, model, run, tools)</li>
 <li>支持 Zod schema 输出验证</li>
 <li>使用 LocalAgentExecutor 执行</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="Remote Agent (A2A)" variant="purple">
 <ul className="text-sm space-y-1">
 <li><strong>kind</strong>: 'remote'</li>
 <li>通过 HTTP 调用外部 Agent 服务</li>
 <li>使用 Agent Card URL 发现能力</li>
 <li>符合 A2A (Agent-) 协议</li>
 <li>使用 A2AClientManager 管理</li>
 </ul>
 </HighlightBox>
 </div>

 <CodeBlock code={agentTypesCode} language="typescript" title="types.ts - Agent 类型定义" />
 </Layer>

 {/* 配置结构 */}
 <Layer title="配置结构">
 <p className="text-body mb-4">
 LocalAgentDefinition 包含多个配置块，控制 Agent 的行为：
 </p>

 <CodeBlock code={configTypesCode} language="typescript" title="配置接口定义" />

 <div className="mt-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">配置块</th>
 <th className="text-left py-2 px-3 text-dim">用途</th>
 <th className="text-left py-2 px-3 text-dim">关键字段</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">PromptConfig</td>
 <td className="py-2 px-3 text-body">提示词配置</td>
 <td className="py-2 px-3 text-dim">systemPrompt, query (支持模板)</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">ModelConfig</td>
 <td className="py-2 px-3 text-body">模型参数</td>
 <td className="py-2 px-3 text-dim">model, temp, top_p, thinkingBudget</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">RunConfig</td>
 <td className="py-2 px-3 text-body">执行约束</td>
 <td className="py-2 px-3 text-dim">max_time_minutes, max_turns</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">ToolConfig</td>
 <td className="py-2 px-3 text-body">可用工具</td>
 <td className="py-2 px-3 text-dim">tools[] (字符串名称或声明)</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 {/* Markdown 配置示例 */}
 <Layer title="Markdown 配置示例">
 <p className="text-body mb-4">
 Agent 通过 Markdown 文件 + YAML frontmatter 定义（文件必须以 <code>---</code> 开头），放置在
 <code>~/.gemini/agents/</code> (用户级) 或 <code>.gemini/agents/</code> (项目级) 目录下（仅加载 <code>.md</code>）。
 </p>

 <CodeBlock code={markdownConfigCode} language="markdown" title="本地 Agent 配置示例" />

 <div className="mt-6 pl-5 border-l-2 border-l-edge-hover border-l-edge-hover/30">
 <h4 className="text-heading font-bold mb-2">关于远程 Agent</h4>
 <p className="text-sm text-body">{remoteAgentNote}</p>
 </div>

 <HighlightBox title="模板变量" variant="blue" className="mt-4">
 <p className="text-sm mb-2">系统提示词和查询支持以下模板变量：</p>
 <ul className="text-sm space-y-1">
 <li><code>${'${query}'}</code> - 用户输入的查询</li>
 <li><code>${'${activeModel}'}</code> - 当前活动模型</li>
 <li><code>${'${today}'}</code> - 今天的日期</li>
 <li><code>${'${cliVersion}'}</code> - CLI 版本</li>
 <li>自定义 inputs 中定义的参数</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* AgentRegistry */}
 <Layer title="AgentRegistry 注册表">
 <p className="text-body mb-4">
 <code className="text-heading">AgentRegistry</code> 负责 Agent 的发现、加载、验证和注册。
 它按优先级加载：内置 → 用户级 → 项目级。
 </p>

 <CodeBlock code={registryCode} language="typescript" title="registry.ts" />

 <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="内置 Agent (3个)" variant="blue">
 <ul className="text-sm space-y-1">
 <li><strong>codebase_investigator</strong> - 代码库探索</li>
 <li><strong>cli_help</strong> - CLI 文档问答</li>
 <li><strong>generalist</strong> - 通用代理（实验）</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="用户级 Agent" variant="purple">
 <ul className="text-sm space-y-1">
 <li>位置: ~/.gemini/agents/</li>
 <li>全局可用</li>
 <li>优先级高于内置</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="项目级 Agent" variant="green">
 <ul className="text-sm space-y-1">
 <li>位置: .gemini/agents/</li>
 <li>需要信任文件夹</li>
 <li>优先级最高</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 {/* 执行循环 */}
 <Layer title="执行循环">
 <p className="text-body mb-4">
 <code className="text-heading">LocalAgentExecutor</code> 实现 Agent 的执行循环，
 持续调用模型和工具直到 Agent 调用 <code>complete_task</code> 或达到终止条件。
 </p>

 <MermaidDiagram chart={executionLoopChart} />

 <div className="mt-6">
 <CodeBlock code={executorCode} language="typescript" title="local-executor.ts 核心逻辑" />
 </div>
 </Layer>

 {/* complete_task 工具 */}
 <Layer title="complete_task 完成工具">
 <p className="text-body mb-4">
 每个 Agent 必须调用 <code className="text-heading">complete_task</code> 工具来完成任务。
 这是 Agent 返回结果的唯一方式。
 </p>

 <CodeBlock code={completeTaskCode} language="typescript" title="complete_task 实现" />

 <HighlightBox title="关键规则" variant="yellow" className="mt-4">
 <ul className="text-sm space-y-1">
 <li>Agent <strong>必须</strong> 调用 complete_task 来完成任务</li>
 <li>如果停止调用工具但未调用 complete_task → ERROR_NO_COMPLETE_TASK_CALL</li>
 <li>超时或达到轮次上限时，会给 Agent 一次恢复机会 (grace period)</li>
 <li>有 outputConfig 时，输出会经过 Zod schema 验证</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* 内置 Agent */}
 <Layer title="内置 Agent">
 <p className="text-body mb-4">
 Gemini CLI 内置了两个常用 Agent，可通过设置启用。
 注意 CodebaseInvestigator 使用 <strong>Zod schema</strong> 定义结构化输出：
 </p>

 <CodeBlock code={builtInAgentsCode} language="typescript" title="codebase-investigator.ts - 使用 Zod Schema" />

 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="CodebaseInvestigator" variant="blue">
 <p className="text-sm mb-2">代码库探索和分析 Agent</p>
 <ul className="text-sm space-y-1 text-dim">
 <li><strong>结构化输出</strong>: Zod schema 验证</li>
 <li><strong>只读/搜索工具</strong>: list_directory, read_file, glob, search_file_content</li>
 <li><strong>Scratchpad</strong>: 系统化探索方法</li>
 <li>最多 15 轮，5 分钟超时</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="IntrospectionAgent" variant="purple">
 <p className="text-sm mb-2">自省和反思分析 Agent</p>
 <ul className="text-sm space-y-1 text-dim">
 <li>分析对话历史</li>
 <li>提供改进建议</li>
 <li>需要显式启用</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 {/* delegate_to_agent 工具 */}
 <Layer title="delegate_to_agent 委托工具">
 <p className="text-body mb-4">
 父 Agent 通过 <code className="text-heading">delegate_to_agent</code> 工具
 将任务委托给子 Agent。该工具动态生成 <strong>discriminated union schema</strong>，
 根据 agent_name 参数路由到不同的 Agent。
 </p>

 <CodeBlock code={delegateToolCode} language="typescript" title="delegate-" />

 <HighlightBox title="工作原理" variant="blue" className="mt-4">
 <ol className="text-sm space-y-2 list-decimal list-inside">
 <li>从 AgentRegistry 获取所有已注册的 Agent 定义</li>
 <li>为每个 Agent 生成 Zod schema（包含 agent_name 和其 inputConfig）</li>
 <li>使用 <code>z.discriminatedUnion</code> 合并为统一的工具 schema</li>
 <li>执行时根据 agent_name 查找定义，通过 SubagentToolWrapper 创建执行</li>
 </ol>
 </HighlightBox>
 </Layer>

 {/* 活动事件 */}
 <Layer title="SubagentActivityEvent 活动事件">
 <p className="text-body mb-4">
 Agent 执行过程中会发射活动事件，用于 UI 展示和监控。支持 4 种事件类型：
 </p>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge/30">
 <div className="text-lg font-bold text-heading">TOOL_CALL_START</div>
 <div className="text-xs text-dim">工具调用开始</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge/30">
 <div className="text-lg font-bold text-heading">TOOL_CALL_END</div>
 <div className="text-xs text-dim">工具调用结束</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge/30">
 <div className="text-lg font-bold text-heading">THOUGHT_CHUNK</div>
 <div className="text-xs text-dim">思考片段</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border-l-2 border-l-edge-hover/30">
 <div className="text-lg font-bold text-heading">ERROR</div>
 <div className="text-xs text-dim">错误事件</div>
 </div>
 </div>

 <CodeBlock code={activityEventCode} language="typescript" title="types.ts - 活动事件" />
 </Layer>

 {/* 终止模式 */}
 <Layer title="终止模式">
 <p className="text-body mb-4">
 Agent 可能因以下原因终止执行：
 </p>

 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">模式</th>
 <th className="text-left py-2 px-3 text-dim">描述</th>
 <th className="text-left py-2 px-3 text-dim">可恢复</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">GOAL</td>
 <td className="py-2 px-3 text-body">成功调用 complete_task</td>
 <td className="py-2 px-3 text-dim">-</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">TIMEOUT</td>
 <td className="py-2 px-3 text-body">超过 max_time_minutes</td>
 <td className="py-2 px-3 text-heading">✓ 60秒恢复期</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">MAX_TURNS</td>
 <td className="py-2 px-3 text-body">达到 max_turns 限制</td>
 <td className="py-2 px-3 text-heading">✓ 60秒恢复期</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">ERROR</td>
 <td className="py-2 px-3 text-body">执行过程中出错</td>
 <td className="py-2 px-3 text-heading">✗</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">ABORTED</td>
 <td className="py-2 px-3 text-body">外部中止信号 (AbortSignal)</td>
 <td className="py-2 px-3 text-heading">✗</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">ERROR_NO_COMPLETE_TASK_CALL</td>
 <td className="py-2 px-3 text-body">停止调用工具但未调用 complete_task</td>
 <td className="py-2 px-3 text-heading">✗</td>
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

 {/* 关键文件与入口 */}
 <Layer title="关键文件与入口">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">文件</th>
 <th className="text-left py-2 px-3 text-dim">职责</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/types.ts</td>
 <td className="py-2 px-3 text-body">核心类型定义：AgentTerminateMode、BaseAgentDefinition、LocalAgentDefinition、RemoteAgentDefinition</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/registry.ts</td>
 <td className="py-2 px-3 text-body">AgentRegistry - Agent 注册、发现和管理</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/local-executor.ts</td>
 <td className="py-2 px-3 text-body">LocalAgentExecutor - 本地 Agent 执行循环</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/agentLoader.ts</td>
 <td className="py-2 px-3 text-body">Markdown frontmatter 解析与验证</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/delegate-</td>
 <td className="py-2 px-3 text-body">DelegateToAgentTool - 委托工具实现</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/subagent-tool-wrapper.ts</td>
 <td className="py-2 px-3 text-body">SubagentToolWrapper - 统一 Local/Remote 调用</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/codebase-investigator.ts</td>
 <td className="py-2 px-3 text-body">CodebaseInvestigatorAgent 内置定义</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/cli-help-agent.ts</td>
 <td className="py-2 px-3 text-body">CliHelpAgent 内置定义</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/generalist-agent.ts</td>
 <td className="py-2 px-3 text-body">GeneralistAgent 内置定义（experimental）</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading text-xs">agents/a2a-client-manager.ts</td>
 <td className="py-2 px-3 text-body">A2AClientManager - 远程 Agent 通信</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 {/* 设计决策 */}
 <Layer title="设计决策">
 <div className="space-y-4">
 <HighlightBox title="为什么使用 Zod Schema?" variant="blue">
 <p className="text-sm">
 <strong>结构化输出验证</strong>：Agent 返回的结果通过 Zod schema 验证，
 确保输出符合预期格式。如果验证失败，Agent 会被要求重试，
 避免返回格式错误的结果给父 Agent。
 </p>
 </HighlightBox>

 <HighlightBox title="为什么 Agent 不能调用 delegate_to_agent?" variant="purple">
 <p className="text-sm">
 <strong>防止递归和复杂性</strong>：agentLoader 会验证 tools 配置，
 拒绝包含 delegate_to_agent 的 Agent 定义。这防止了 Agent 之间的递归调用，
 简化了执行模型和调试。
 </p>
 </HighlightBox>

 <HighlightBox title="为什么有 60 秒恢复期?" variant="green">
 <p className="text-sm">
 <strong>优雅降级</strong>：当 Agent 因超时或达到轮次上限时，
 给予 60 秒的恢复期让它调用 complete_task。这比直接终止更友好，
 允许 Agent 返回部分结果而不是完全失败。
 </p>
 </HighlightBox>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
