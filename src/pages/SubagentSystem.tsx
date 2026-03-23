import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

export function SubagentSystem() {
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
 <div className="border- border-edge pb-6">
 <h1 className="text-3xl font-bold text-heading mb-2">
 🤖 Agent 子代理系统
 </h1>
 <p className="text-body">
 基于 Markdown + YAML frontmatter 配置的可扩展子代理框架，支持本地执行和远程 A2A 协议
 </p>
 <div className="mt-4 flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-elevated/20 text-heading text-xs rounded">
 核心模块
 </span>
 <span className="px-2 py-1 bg-elevated/20 text-heading text-xs rounded">
 packages/core/src/agents/
 </span>
 <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded">
 Markdown frontmatter 驱动
 </span>
 </div>
 </div>

 {/* 30秒速览 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
 ⚡ 30秒速览
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <div className="bg-base/50 rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3">两种 Agent 类型</h3>
 <div className="space-y-2 text-sm">
 <div className="flex items-center gap-2">
 <span className="text-heading font-mono">local</span>
 <span className="text-dim">← 本地执行</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-amber-500 font-mono">remote</span>
 <span className="text-dim">← A2A 远程调用</span>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3">配置层级</h3>
 <div className="space-y-2 text-sm">
 <div className="flex items-center gap-2">
 <span className="text-heading">1.</span>
 <span className="text-body">
 <code className="text-amber-500">.gemini/agents/</code> 项目级
 </span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-heading">2.</span>
 <span className="text-body">
 <code className="text-amber-500">~/.gemini/agents/</code> 用户级
 </span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-heading">3.</span>
 <span className="text-body">内置 Agent（不可修改）</span>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h3 className="text-amber-500 font-bold mb-3">终止模式 (6种)</h3>
 <div className="space-y-1 text-xs font-mono">
 <div className="text-heading">GOAL ← 调用 complete_task</div>
 <div className="text-amber-500">MAX_TURNS ← 超过轮次限制</div>
 <div className="text-amber-500">TIMEOUT ← 超时</div>
 <div className="text-red-400">ERROR ← 执行异常</div>
 <div className="text-dim">ABORTED ← 外部取消</div>
 <div className="text-red-400">ERROR_NO_COMPLETE_TASK_CALL</div>
 </div>
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3">核心源文件</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
 <div className="flex justify-between">
 <span className="text-dim">类型定义</span>
 <span className="text-heading">types.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">注册表</span>
 <span className="text-heading">registry.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">本地执行器</span>
 <span className="text-heading">local-executor.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">配置加载</span>
 <span className="text-heading">agentLoader.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">委托工具</span>
 <span className="text-heading">delegate-</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">远程调用</span>
 <span className="text-heading">a2a-client-manager.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">CLI Help</span>
 <span className="text-heading">cli-help-agent.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">Generalist</span>
 <span className="text-heading">generalist-agent.ts</span>
 </div>
 </div>
 </div>
 </section>

 {/* 架构概览 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
 🏗️ 架构概览
 </h2>

 <MermaidDiagram
 chart={`flowchart TB
 subgraph Core["Agent 核心"]
 Registry["AgentRegistry<br/>发现、加载、验证"]
 LocalExec["LocalAgentExecutor<br/>本地执行循环"]
 RemoteInvoke["RemoteInvocation<br/>A2A 远程调用"]
 end

 subgraph Config["配置层"]
 AgentLoader["AgentLoader<br/>Markdown frontmatter"]
 Builtin["Built-in Agents<br/>内置代理"]
 end

 subgraph Tools["工具层"]
 Delegate["delegate_to_agent<br/>委托工具"]
 Complete["complete_task<br/>终止工具"]
 ToolReg["ToolRegistry<br/>隔离工具集"]
 end

 subgraph Execution["执行环境"]
 GeminiChat["GeminiChat<br/>模型交互"]
 Compress["ChatCompression<br/>上下文压缩"]
 Activity["ActivityCallback<br/>事件通知"]
 end

 AgentLoader --> Registry
 Builtin --> Registry
 Registry --> LocalExec
 Registry --> RemoteInvoke
 Delegate --> Registry
 LocalExec --> ToolReg
 LocalExec --> GeminiChat
 LocalExec --> Compress
 LocalExec --> Complete
 LocalExec --> Activity

 style Registry fill:#22c55e,color:#000
 style LocalExec fill:#3b82f6,color:#fff
 style Delegate fill:#f59e0b,color:#000`}
 />
 </section>

 {/* Agent 定义类型 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('types')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
 📋 Agent 定义类型
 </h2>
 <span className={`transform transition-transform ${expandedSections.has('types') ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {expandedSections.has('types') && (
 <div className="space-y-6">
 <CodeBlock
 language="typescript"
 code={`// types.ts - Agent 定义核心接口

// 终止模式枚举
export enum AgentTerminateMode {
 ERROR = 'ERROR',
 TIMEOUT = 'TIMEOUT',
 GOAL = 'GOAL', // 正常完成
 MAX_TURNS = 'MAX_TURNS',
 ABORTED = 'ABORTED',
 ERROR_NO_COMPLETE_TASK_CALL = 'ERROR_NO_COMPLETE_TASK_CALL',
}

// 基础定义（本地和远程共享）
export interface BaseAgentDefinition<TOutput extends z.ZodTypeAny> {
 name: string; // 唯一标识符
 displayName?: string; // 显示名称
 description: string; // 功能描述
 inputConfig: InputConfig; // 输入参数配置
 outputConfig?: OutputConfig<TOutput>; // 输出结构配置
}

// 本地 Agent 定义
export interface LocalAgentDefinition<TOutput> extends BaseAgentDefinition<TOutput> {
 kind: 'local';
 promptConfig: PromptConfig; // 提示词配置
 modelConfig: ModelConfig; // 模型参数
 runConfig: RunConfig; // 运行时配置
 toolConfig?: ToolConfig; // 可用工具
 processOutput?: (output: z.infer<TOutput>) => string; // 输出处理器
}

// 远程 Agent 定义（A2A 协议）
export interface RemoteAgentDefinition<TOutput> extends BaseAgentDefinition<TOutput> {
 kind: 'remote';
 agentCardUrl: string; // Agent Card URL
}`}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">PromptConfig</h4>
 <CodeBlock
 language="typescript"
 code={`interface PromptConfig {
 // 系统提示词，支持 \${input_name} 模板
 systemPrompt?: string;

 // Few-shot 示例对话
 initialMessages?: Content[];

 // 触发查询（如果不提供，使用 "Get Started!"）
 query?: string;
}`}
 />
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">ModelConfig & RunConfig</h4>
 <CodeBlock
 language="typescript"
 code={`interface ModelConfig {
 model: string; // 模型名称或 'inherit'
 temp: number; // 温度 (0-2)
 top_p: number; // Top-P 采样
 thinkingBudget?: number; // 思考预算
}

interface RunConfig {
 max_time_minutes: number; // 超时限制
 max_turns?: number; // 最大轮次
}`}
 />
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-amber-500 font-bold mb-3">InputConfig & OutputConfig</h4>
 <CodeBlock
 language="typescript"
 code={`// 输入参数配置
interface InputConfig {
 inputs: Record<string, {
 description: string;
 type: 'string' | 'number' | 'boolean' | 'integer' | 'string[]' | 'number[]';
 required: boolean;
 }>;
}

// 输出结构配置（使用 Zod 验证）
interface OutputConfig<T extends z.ZodTypeAny> {
 outputName: string; // 输出参数名（如 "report"）
 description: string; // 输出描述
 schema: T; // Zod schema 用于验证
}`}
 />
 </div>
 </div>
 )}
 </section>

 {/* Markdown 配置格式 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('markdown')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
 📄 Markdown 配置格式
 </h2>
 <span className={`transform transition-transform ${expandedSections.has('markdown') ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {expandedSections.has('markdown') && (
 <div className="space-y-6">
 <div className="bg-elevated/10 rounded-lg p-4 border border-edge/30 mb-4">
 <p className="text-sm text-body">
 Agent 配置使用 <strong>Markdown + YAML frontmatter</strong>。
 文件扩展名为 <code className="text-heading">.md</code>，存放在
 <code className="text-heading"> ~/.gemini/agents/</code> (用户级) 或
 <code className="text-heading"> .gemini/agents/</code> (项目级) 目录下。
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">本地 Agent 配置</h4>
 <CodeBlock
 language="markdown"
 code={`---
kind: local
name: code-reviewer
description: 代码审查专家，专注于代码质量和最佳实践
display_name: Code Reviewer

# 可用工具列表
tools:
 - read_file
 - glob
 - search_file_content

# 模型配置 (可选)
model: gemini-2.5-flash
temperature: 0.3

# 运行配置 (可选)
max_turns: 20
timeout_mins: 5
---
You are a code review expert.
Focus on correctness, security, and performance.

When reviewing code:
1. Check for potential bugs
2. Evaluate security concerns
3. Suggest performance improvements`}
 />
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-amber-500 font-bold mb-3">配置字段说明</h4>
 <div className="text-sm space-y-2 text-body">
 <div className="flex gap-2">
 <code className="text-heading">name</code>
 <span>唯一标识符 slug 格式 (必需)</span>
 </div>
 <div className="flex gap-2">
 <code className="text-heading">description</code>
 <span>Agent 用途说明 (必需)</span>
 </div>
 <div className="flex gap-2">
 <code className="text-heading">kind</code>
 <span>local 或 remote (可选，默认 local)</span>
 </div>
 <div className="flex gap-2">
 <code className="text-heading">display_name</code>
 <span>显示名称 (可选)</span>
 </div>
 <div className="flex gap-2">
 <code className="text-heading">tools</code>
 <span>可用工具名称列表 (可选)</span>
 </div>
 <div className="flex gap-2">
 <code className="text-heading">Markdown Body</code>
 <span>系统提示词 (必需)</span>
 </div>
 <div className="flex gap-2">
 <code className="text-heading">model</code>
 <span>模型参数 (可选，默认继承)</span>
 </div>
 <div className="flex gap-2">
 <code className="text-heading">max_turns / timeout_mins</code>
 <span>运行时限制 (可选)</span>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">配置加载流程</h4>
 <CodeBlock
 language="typescript"
 code={`// agentLoader.ts - 配置文件解析

// 使用 Zod 进行严格验证
const localAgentSchema = z.object({
 kind: z.literal('local').optional().default('local'),
 name: z.string().regex(/^[a-z0-9-_]+$/), // slug 格式
 description: z.string().min(1),
 display_name: z.string().optional(),
 tools: z.array(z.string()).optional(),
 model: z.string().optional(),
 temperature: z.number().optional(),
 max_turns: z.number().int().positive().optional(),
 timeout_mins: z.number().int().positive().optional(),
}).strict();

// 解析 Markdown + frontmatter
async function parseAgentMarkdown(filePath: string): Promise<AgentDefinition[]> {
 const content = await fs.readFile(filePath, 'utf-8');
 const match = content.match(FRONTMATTER_REGEX);
 if (!match) {
 throw new AgentLoadError(filePath, 'Missing YAML frontmatter');
 }
 const raw = yaml.load(match[1]);
 const body = match[2] || '';

 // 使用 Zod 验证
 const result = localAgentSchema.safeParse(raw);
 if (!result.success) {
 throw new AgentLoadError(filePath, formatZodError(result.error));
 }

 return [{ ...result.data, system_prompt: body.trim() }];
}

// 从目录加载所有 Agent
async function loadAgentsFromDirectory(dir: string): Promise<AgentLoadResult> {
 const files = await fs.readdir(dir, { withFileTypes: true });
 const mdFiles = files.filter(f =>
 f.isFile() && f.name.endsWith('.md') && !f.name.startsWith('_')
 );

 for (const file of mdFiles) {
 const agents = await parseAgentMarkdown(path.join(dir, file.name));
 result.agents.push(...agents);
 }
 return result;
}`}
 />
 </div>

 <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
 <h4 className="text-amber-500 font-bold mb-2">⚠️ 安全限制</h4>
 <p className="text-sm text-body">
 子 Agent 不能使用 <code className="text-heading">delegate_to_agent</code> 工具，
 防止无限递归和复杂的嵌套调用链。配置时 tools 列表中包含该工具会导致加载失败。
 </p>
 </div>
 </div>
 )}
 </section>

 {/* AgentRegistry */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('registry')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
 📚 AgentRegistry 注册表
 </h2>
 <span className={`transform transition-transform ${expandedSections.has('registry') ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {expandedSections.has('registry') && (
 <div className="space-y-6">
 <MermaidDiagram
 chart={`flowchart LR
 subgraph Init["initialize()"]
 A[加载 Builtin] --> B[监听 ModelChanged]
 B --> C{Agents 启用?}
 C -->|是| D[加载 User 级]
 D --> E{信任文件夹?}
 E -->|是| F[加载 Project 级]
 E -->|否| G[跳过 Project 级]
 end

 style A fill:#f59e0b,color:#000
 style D fill:#3b82f6,color:#fff
 style F fill:#22c55e,color:#000`}
 />

 <CodeBlock
 language="typescript"
 code={`// registry.ts - Agent 注册表

export class AgentRegistry {
 private readonly agents = new Map<string, AgentDefinition>();

 async initialize(): Promise<void> {
 // 1. 加载内置 Agent
 this.loadBuiltInAgents();

 // 2. 监听模型变更事件
 coreEvents.on(CoreEvent.ModelChanged, () => this.refreshAgents());

 if (!this.config.isAgentsEnabled()) return;

 // 3. 加载用户级 Agent: ~/.gemini/agents/
 const userAgents = await loadAgentsFromDirectory(
 Storage.getUserAgentsDir()
 );
 await Promise.allSettled(
 userAgents.agents.map(agent => this.registerAgent(agent))
 );

 // 4. 加载项目级 Agent（需要信任文件夹）
 if (!this.config.getFolderTrust() || this.config.isTrustedFolder()) {
 const projectAgents = await loadAgentsFromDirectory(
 this.config.storage.getProjectAgentsDir()
 );
 await Promise.allSettled(
 projectAgents.agents.map(agent => this.registerAgent(agent))
 );
 }
 }

 private loadBuiltInAgents(): void {
 const cliHelpSettings = this.config.getCliHelpAgentSettings();
 const agentsOverrides = this.config.getAgentsSettings().overrides ?? {};

 // CodebaseInvestigator - 代码库分析专家
 if (
 investigatorSettings?.enabled &&
 agentsOverrides[CodebaseInvestigatorAgent.name]?.enabled !== false
 ) {
 this.registerLocalAgent({
 ...CodebaseInvestigatorAgent,
 modelConfig: { ...CodebaseInvestigatorAgent.modelConfig, model },
 });
 }

 // CLI Help Agent - 文档问答
 if (
 cliHelpSettings.enabled &&
 agentsOverrides[CliHelpAgent.name]?.enabled !== false
 ) {
 this.registerLocalAgent(CliHelpAgent(this.config));
 }

 // Generalist Agent - 通用代理
 this.registerLocalAgent(GeneralistAgent(this.config));
 }
}`}
 />

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">模型配置别名注册</h4>
 <CodeBlock
 language="typescript"
 code={`// 为每个 Agent 注册独立的模型配置
protected registerLocalAgent(definition: AgentDefinition): void {
 this.agents.set(definition.name, definition);

 // 处理 'inherit' 模型
 let model = definition.modelConfig.model;
 if (model === 'inherit') {
 model = this.config.getModel(); // 继承父级模型
 }

 // 注册运行时模型配置别名
 const runtimeAlias: ModelConfigAlias = {
 modelConfig: {
 model,
 generateContentConfig: {
 temperature: modelConfig.temp,
 topP: modelConfig.top_p,
 thinkingConfig: {
 includeThoughts: true,
 thinkingBudget: modelConfig.thinkingBudget ?? -1,
 },
 },
 },
 };

 this.config.modelConfigService.registerRuntimeModelConfig(
 \`\${definition.name}-config\`, // 别名格式
 runtimeAlias,
 );
}`}
 />
 </div>
 </div>
 )}
 </section>

 {/* LocalAgentExecutor */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('executor')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
 ▶️ LocalAgentExecutor 执行器
 </h2>
 <span className={`transform transition-transform ${expandedSections.has('executor') ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {expandedSections.has('executor') && (
 <div className="space-y-6">
 <MermaidDiagram
 chart={`stateDiagram-v2
 [*] --> Run: run(inputs, signal)
 Run --> CreateChat: 创建 GeminiChat
 CreateChat --> SendQuery: 发送初始查询
 SendQuery --> ExecuteTurn: executeTurn()

 ExecuteTurn --> CallModel: 调用模型
 CallModel --> CheckCalls: 检查工具调用

 CheckCalls --> ProcessTools: 有工具调用
 ProcessTools --> SendResponse: 执行工具
 SendResponse --> CheckTermination: 检查终止条件
 CheckTermination --> ExecuteTurn: 继续

 CheckCalls --> ProtocolError: 无工具调用且无 complete_task
 CheckTermination --> Recovery: 超时/超轮次
 Recovery --> GracePeriod: 1分钟恢复期

 ProcessTools --> Success: complete_task 调用成功
 Success --> [*]: GOAL
 GracePeriod --> Success: 恢复成功
 GracePeriod --> Failure: 恢复失败
 Failure --> [*]: TIMEOUT/MAX_TURNS`}
 />

 <CodeBlock
 language="typescript"
 code={`// local-executor.ts - 核心执行循环

const TASK_COMPLETE_TOOL_NAME = 'complete_task';
const GRACE_PERIOD_MS = 60 * 1000; // 1分钟恢复期

export class LocalAgentExecutor<TOutput extends z.ZodTypeAny> {

 async run(inputs: AgentInputs, signal: AbortSignal): Promise<OutputObject> {
 const startTime = Date.now();
 let turnCounter = 0;

 // 设置超时控制器
 const timeoutController = new AbortController();
 setTimeout(
 () => timeoutController.abort(),
 max_time_minutes * 60 * 1000
 );
 const combinedSignal = AbortSignal.any([signal, timeoutController.signal]);

 // 创建 Chat 和工具列表
 const tools = this.prepareToolsList();
 const chat = await this.createChatObject(inputs, tools);
 let currentMessage = { role: 'user', parts: [{ text: query }] };

 while (true) {
 // 检查终止条件
 const reason = this.checkTermination(startTime, turnCounter);
 if (reason || combinedSignal.aborted) break;

 // 执行单轮
 const turnResult = await this.executeTurn(
 chat, currentMessage, turnCounter++, combinedSignal
 );

 if (turnResult.status === 'stop') {
 terminateReason = turnResult.terminateReason;
 if (turnResult.finalResult) finalResult = turnResult.finalResult;
 break;
 }

 currentMessage = turnResult.nextMessage;
 }

 // 恢复尝试（针对 TIMEOUT/MAX_TURNS）
 if (terminateReason !== AgentTerminateMode.GOAL) {
 const recoveryResult = await this.executeFinalWarningTurn(
 chat, turnCounter, terminateReason, signal
 );
 if (recoveryResult) {
 terminateReason = AgentTerminateMode.GOAL;
 finalResult = recoveryResult;
 }
 }

 return { result: finalResult, terminate_reason: terminateReason };
 }
}`}
 />

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-amber-500 font-bold mb-3">complete_task 工具</h4>
 <CodeBlock
 language="typescript"
 code={`// 动态生成 complete_task 工具
private prepareToolsList(): FunctionDeclaration[] {
 const toolsList = [...this.toolRegistry.getFunctionDeclarations()];

 // 始终注入 complete_task 工具
 const completeTool: FunctionDeclaration = {
 name: TASK_COMPLETE_TOOL_NAME,
 description: outputConfig
 ? 'Call this tool to submit your final answer. This is the ONLY way to finish.'
 : 'Call this tool to complete the task with your findings.',
 parameters: {
 type: Type.OBJECT,
 properties: {},
 required: [],
 },
 };

 if (outputConfig) {
 // 使用 Zod schema 定义输出结构
 const jsonSchema = zodToJsonSchema(outputConfig.schema);
 completeTool.parameters.properties[outputConfig.outputName] = jsonSchema;
 completeTool.parameters.required.push(outputConfig.outputName);
 } else {
 // 默认使用 'result' 字符串参数
 completeTool.parameters.properties['result'] = {
 type: Type.STRING,
 description: 'Your final results or findings.',
 };
 completeTool.parameters.required.push('result');
 }

 toolsList.push(completeTool);
 return toolsList;
}`}
 />
 </div>
 </div>
 )}
 </section>

 {/* 内置 Agent */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('builtin')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
 🔧 内置 Agent
 </h2>
 <span className={`transform transition-transform ${expandedSections.has('builtin') ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {expandedSections.has('builtin') && (
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">codebase_investigator</h4>
 <p className="text-sm text-body mb-3">
 代码库分析专家，用于架构映射、依赖分析和系统理解
 </p>
 <div className="text-xs space-y-1">
 <div className="flex justify-between">
 <span className="text-dim">工具</span>
 <span className="text-heading font-mono">list_directory, read_file, glob, search_file_content</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">超时</span>
 <span className="text-amber-500">5 分钟</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">轮次</span>
 <span className="text-amber-500">15</span>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">cli_help</h4>
 <p className="text-sm text-body mb-3">
 CLI 帮助代理，基于内部文档与运行时状态回答使用问题
 </p>
 <div className="text-xs space-y-1">
 <div className="flex justify-between">
 <span className="text-dim">工具</span>
 <span className="text-heading font-mono">get_internal_docs</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">模型</span>
 <span className="text-amber-500">flash</span>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">generalist</h4>
 <p className="text-sm text-body mb-3">
 通用代理，继承主系统提示词并开放全部工具
 </p>
 <div className="text-xs space-y-1">
 <div className="flex justify-between">
 <span className="text-dim">状态</span>
 <span className="text-amber-500">experimental 默认禁用</span>
 </div>
 </div>
 </div>
 </div>

 <CodeBlock
 language="typescript"
 code={`// codebase-investigator.ts - 结构化输出示例

const CodebaseInvestigationReportSchema = z.object({
 SummaryOfFindings: z.string().describe(
 "A summary of the investigation's conclusions."
 ),
 ExplorationTrace: z.array(z.string()).describe(
 'A step-by-step list of actions during investigation.'
 ),
 RelevantLocations: z.array(z.object({
 FilePath: z.string(),
 Reasoning: z.string(),
 KeySymbols: z.array(z.string()),
 })).describe('Relevant files and key symbols within them.'),
});

export const CodebaseInvestigatorAgent: LocalAgentDefinition = {
 name: 'codebase_investigator',
 kind: 'local',
 description: 'Specialized for codebase analysis and architectural mapping.',

 outputConfig: {
 outputName: 'report',
 description: 'The final investigation report as JSON.',
 schema: CodebaseInvestigationReportSchema,
 },

 processOutput: (output) => JSON.stringify(output, null, 2),

 toolConfig: {
 tools: [LS_TOOL_NAME, READ_FILE_TOOL_NAME, GLOB_TOOL_NAME, GREP_TOOL_NAME],
 },
 // ...
};`}
 />
 </div>
 )}
 </section>

 {/* delegate_to_agent 工具 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('delegate')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
 🎯 delegate_to_agent 工具
 </h2>
 <span className={`transform transition-transform ${expandedSections.has('delegate') ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {expandedSections.has('delegate') && (
 <div className="space-y-6">
 <div className="bg-base/50 rounded-lg p-4">
 <p className="text-sm text-body mb-4">
 <code className="text-amber-500">delegate_to_agent</code> 是主 Agent 委托任务给子 Agent 的核心工具。
 它动态生成 discriminated union schema，根据可用 Agent 自动构建参数验证。
 </p>
 </div>

 <CodeBlock
 language="typescript"
 code={`// delegate-
export class DelegateToAgentTool extends BaseDeclarativeTool {
 constructor(registry: AgentRegistry, config: Config) {
 const definitions = registry.getAllDefinitions();

 // 动态构建 discriminated union schema
 const agentSchemas = definitions.map(def => {
 const inputShape = {
 agent_name: z.literal(def.name).describe(def.description),
 };

 // 添加每个 Agent 的输入参数
 for (const [key, inputDef] of Object.entries(def.inputConfig.inputs)) {
 let validator;
 switch (inputDef.type) {
 case 'string': validator = z.string(); break;
 case 'number': validator = z.number(); break;
 case 'boolean': validator = z.boolean(); break;
 case 'string[]': validator = z.array(z.string()); break;
 // ...
 }
 if (!inputDef.required) validator = validator.optional();
 inputShape[key] = validator.describe(inputDef.description);
 }

 return z.object(inputShape);
 });

 const schema = z.discriminatedUnion('agent_name', agentSchemas);

 super(
 DELEGATE_TO_AGENT_TOOL_NAME,
 'Delegate to Agent',
 registry.getToolDescription(),
 Kind.Think,
 zodToJsonSchema(schema),
 );
 }
}

// 执行委托
async execute(signal: AbortSignal): Promise<ToolResult> {
 const definition = this.registry.getDefinition(this.params.agent_name);
 const { agent_name, ...agentArgs } = this.params;

 // 使用 SubagentToolWrapper 处理本地/远程分发
 const wrapper = new SubagentToolWrapper(definition, this.config);
 const invocation = wrapper.build(agentArgs);
 return invocation.execute(signal);
}`}
 />

 <div className="bg-elevated/10 rounded-lg p-4 border border-edge/30">
 <h4 className="text-heading font-bold mb-2">💡 使用示例</h4>
 <CodeBlock
 language="json"
 code={`// 模型生成的工具调用
{
 "name": "delegate_to_agent",
 "args": {
 "agent_name": "codebase_investigator",
 "objective": "分析认证模块的架构和依赖关系"
 }
}`}
 />
 </div>
 </div>
 )}
 </section>

 {/* 事件系统 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('events')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
 📡 事件与活动通知
 </h2>
 <span className={`transform transition-transform ${expandedSections.has('events') ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {expandedSections.has('events') && (
 <div className="space-y-6">
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">SubagentActivityEvent</h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { name: 'TOOL_CALL_START', desc: '工具调用开始', color: 'text-heading' },
 { name: 'TOOL_CALL_END', desc: '工具调用结束', color: 'text-heading' },
 { name: 'THOUGHT_CHUNK', desc: '思考片段', color: 'text-amber-500' },
 { name: 'ERROR', desc: '发生错误', color: 'text-red-400' },
 ].map((event) => (
 <div
 key={event.name}
 className="bg-surface rounded-lg p-3 border border-edge"
 >
 <div className={`${event.color} font-mono text-xs`}>
 {event.name}
 </div>
 <div className="text-xs text-dim">{event.desc}</div>
 </div>
 ))}
 </div>
 </div>

 <CodeBlock
 language="typescript"
 code={`// types.ts - 事件结构

export interface SubagentActivityEvent {
 isSubagentActivityEvent: true;
 agentName: string;
 type: 'TOOL_CALL_START' | 'TOOL_CALL_END' | 'THOUGHT_CHUNK' | 'ERROR';
 data: Record<string, unknown>;
}

// 活动回调
export type ActivityCallback = (activity: SubagentActivityEvent) => void;

// 执行器中发送事件
private emitActivity(type: SubagentActivityEvent['type'], data: Record<string, unknown>) {
 if (this.onActivity) {
 this.onActivity({
 isSubagentActivityEvent: true,
 agentName: this.definition.name,
 type,
 data,
 });
 }
}

// 工具调用时
this.emitActivity('TOOL_CALL_START', { name: functionCall.name, args });
// 工具完成时
this.emitActivity('TOOL_CALL_END', { name: functionCall.name, output: result });
// 思考时
this.emitActivity('THOUGHT_CHUNK', { text: subject });`}
 />
 </div>
 )}
 </section>

 {/* 相关页面 */}
 <RelatedPages
 title="🔗 相关页面"
 pages={[
 { id: 'subagent-architecture', label: 'Agent 架构深度', description: '类型系统、配置验证、终止模式' },
 { id: 'agent-framework', label: 'Agent 框架', description: 'LocalAgentExecutor 与 complete_task' },
 { id: 'agent-loop-anim', label: 'Agent 执行循环动画', description: '可视化 Turn 循环与终止' },
 { id: 'hook-system', label: 'Hook 事件系统', description: '与 Hook 集成' },
 { id: 'policy-engine', label: 'Policy 引擎', description: 'Agent 工具的权限控制' },
 ]}
 />
 </div>
 );
}

export default SubagentSystem;
