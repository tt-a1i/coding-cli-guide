import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



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
 <div className="border- border-edge pb-6">
 <h1 className="text-3xl font-bold text-heading mb-2">
 🏗️ Agent 架构深度解析
 </h1>
 <p className="text-body">
 深入理解 Agent 类型系统、Markdown frontmatter 配置验证、执行循环和终止模式
 </p>
 <div className="mt-4 flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-elevated/20 text-heading text-xs rounded">
 核心模块
 </span>
 <span className="px-2 py-1 bg-elevated/20 text-heading text-xs rounded">
 packages/core/src/agents/
 </span>
 <span className="px-2 py-1 bg-elevated text-heading text-xs rounded">
 深度解析
 </span>
 </div>
 </div>

 {/* 30秒速览 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
 ⚡ 30秒速览
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
 <div className="bg-base/50 rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3">类型系统层次</h3>
 <div className="space-y-2 text-sm font-mono">
 <div className="flex items-center gap-2">
 <span className="text-heading">AgentDefinition</span>
 <span className="text-dim">← 联合类型</span>
 </div>
 <div className="flex items-center gap-2 pl-4">
 <span className="text-heading">LocalAgentDefinition</span>
 <span className="text-dim">← 本地执行</span>
 </div>
 <div className="flex items-center gap-2 pl-4">
 <span className="text-heading">RemoteAgentDefinition</span>
 <span className="text-dim">← A2A 协议</span>
 </div>
 <div className="flex items-center gap-2 mt-3">
 <span className="text-heading">AgentTerminateMode</span>
 <span className="text-dim">← 6 种终止原因</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-heading">SubagentActivityEvent</span>
 <span className="text-dim">← 4 种活动事件</span>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3">关键设计决策</h3>
 <div className="space-y-2 text-sm">
 <div className="flex items-start gap-2">
 <span className="text-heading">✓</span>
 <span className="text-body">
 <strong>Markdown frontmatter</strong>：结构化配置 + 系统提示词
 </span>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading">✓</span>
 <span className="text-body">
 <strong>complete_task 工具</strong>：强制终止信号，非文本返回
 </span>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading">✓</span>
 <span className="text-body">
 <strong>6 种终止模式</strong>：GOAL/ERROR/TIMEOUT/MAX_TURNS/ABORTED/ERROR_NO_COMPLETE_TASK_CALL
 </span>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading">✓</span>
 <span className="text-body">
 <strong>禁止嵌套委托</strong>：agentLoader 验证阻止循环
 </span>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h3 className="text-heading font-bold mb-3">源码位置速查</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
 <div className="flex justify-between">
 <span className="text-dim">类型定义</span>
 <span className="text-heading">agents/types.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">注册中心</span>
 <span className="text-heading">agents/registry.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">本地执行器</span>
 <span className="text-heading">agents/local-executor.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">Agent Loader</span>
 <span className="text-heading">agents/agentLoader.ts</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">委托工具</span>
 <span className="text-heading">agents/delegate-</span>
 </div>
 <div className="flex justify-between">
 <span className="text-dim">工具包装器</span>
 <span className="text-heading">agents/subagent-tool-wrapper.ts</span>
 </div>
 </div>
 </div>
 </section>

 {/* 类型系统详解 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('types')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
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
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">LocalAgentDefinition</h4>
 <CodeBlock
 language="typescript"
 code={`// types.ts - 本地 Agent 定义
interface LocalAgentDefinition {
 kind: 'local';
 name: string;
 description: string;
 displayName?: string;

 promptConfig: {
 systemPrompt: string; // 系统提示词
 query?: string; // 可选的查询模板
 };

 modelConfig: {
 model: string; // 模型名或 "inherit"
 temp: number; // 温度 (默认 1)
 top_p: number; // top_p (默认 0.95)
 };

 runConfig: {
 max_turns?: number; // 最大轮次
 max_time_minutes: number; // 超时 (默认 5)
 };

 toolConfig?: {
 tools: string[]; // 工具白名单
 };

 inputConfig: {
 inputs: Record<string, AgentInputDefinition>;
 };
}`}
 />
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">RemoteAgentDefinition</h4>
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

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">AgentTerminateMode 枚举</h4>
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="py-2 text-left text-dim">模式</th>
 <th className="py-2 text-left text-dim">触发条件</th>
 <th className="py-2 text-left text-dim">处理方式</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border- border-edge">
 <td className="py-2 text-heading font-mono">GOAL</td>
 <td className="py-2 text-body">Agent 成功完成所有目标</td>
 <td className="py-2 text-body">正常完成</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 text-heading font-mono">MAX_TURNS</td>
 <td className="py-2 text-body">超过 runConfig.max_turns</td>
 <td className="py-2 text-body">强制终止</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 text-heading font-mono">TIMEOUT</td>
 <td className="py-2 text-body">超过 max_time_minutes</td>
 <td className="py-2 text-body">强制终止</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 text-heading font-mono">ABORTED</td>
 <td className="py-2 text-body">外部 AbortSignal 触发</td>
 <td className="py-2 text-body">立即停止</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 text-heading font-mono">ERROR</td>
 <td className="py-2 text-body">执行过程发生不可恢复错误</td>
 <td className="py-2 text-body">错误处理</td>
 </tr>
 <tr>
 <td className="py-2 text-heading font-mono">ERROR_NO_COMPLETE_TASK_CALL</td>
 <td className="py-2 text-body">模型停止但未调用 complete_task</td>
 <td className="py-2 text-body">60秒恢复期</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 )}
 </section>

 {/* Markdown 配置与验证 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('markdown')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
 📄 Markdown 配置与验证
 </h2>
 <span className={`transform transition-transform ${expandedSections.has('markdown') ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {expandedSections.has('markdown') && (
 <div className="space-y-6">
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">本地 Agent Markdown 格式</h4>
 <CodeBlock
 language="markdown"
 code={`---
kind: local
name: code-reviewer
description: 代码审查专家，专注于代码质量和最佳实践
tools:
 - read_file
 - search_file_content
 - glob
 - list_directory
# 内置工具使用 tool name（如 read_file）；MCP 工具用 server__tool 格式
model: gemini-2.5-flash
temperature: 0.3
max_turns: 50
timeout_mins: 10
---
You are a code review expert. When reviewing code, focus on:
1. Code correctness and potential bugs
2. Performance implications
3. Security vulnerabilities
4. Code style and readability

Always provide specific line numbers and actionable suggestions.`}
 />
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">配置字段说明</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <h5 className="text-heading font-bold mb-2">必需字段</h5>
 <ul className="space-y-1 text-body">
 <li><code>name</code> - 唯一标识符 (slug 格式)</li>
 <li><code>description</code> - Agent 用途说明</li>
 <li><code>Markdown Body</code> - 系统提示词</li>
 </ul>
 </div>
 <div>
 <h5 className="text-heading font-bold mb-2">可选字段</h5>
 <ul className="space-y-1 text-body">
 <li><code>tools</code> - 可用工具列表</li>
 <li><code>model</code> / <code>temperature</code> - 模型配置</li>
 <li><code>max_turns</code> / <code>timeout_mins</code> - 运行时配置</li>
 <li><code>display_name</code> - 显示名称</li>
 <li><code>kind</code> / <code>agent_card_url</code> - 远程 Agent</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">Zod Schema 验证</h4>
 <CodeBlock
 language="typescript"
 code={`// agentLoader.ts - Zod 验证 Schema

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

 model: z.string().optional(),
 temperature: z.number().optional(),
 max_turns: z.number().int().positive().optional(),
 timeout_mins: z.number().int().positive().optional(),
}).strict(); // strict() 禁止未知字段

const remoteAgentSchema = z.object({
 kind: z.literal('remote').optional().default('remote'),
 name: nameSchema,
 description: z.string().optional(),
 display_name: z.string().optional(),
 agent_card_url: z.string().url(), // 必须是有效 URL
}).strict();`}
 />
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">💡 禁止嵌套委托</h4>
 <CodeBlock
 language="typescript"
 code={`// agentLoader.ts - 防止循环委托

// 子代理不能包含 delegate_to_agent 工具
if (
 frontmatter.tools &&
 frontmatter.tools.includes(DELEGATE_TO_AGENT_TOOL_NAME)
) {
 throw new AgentLoadError(
 filePath,
 \`Validation failed: tools list cannot include '\${DELEGATE_TO_AGENT_TOOL_NAME}'. \` +
 \`Sub-agents cannot delegate to other agents.\`,
 );
}`}
 />
 <p className="text-xs text-dim mt-2">
 这防止了 A → B → A 的无限循环，与 Claude Code 的递归防护类似
 </p>
 </div>
 </div>
 )}
 </section>

 {/* LocalAgentExecutor 执行循环 */}
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('executor')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
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

 CheckComplete --> Goal: 有文本结果
 CheckComplete --> Nudge: 无结果

 Nudge --> SendMessage: 提示模型输出结果
 }

 Goal --> [*]: GOAL 终止
 MaxTurns --> [*]: MAX_TURNS 终止
 Timeout --> [*]: TIMEOUT 终止`}
 />

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">核心执行循环</h4>
 <CodeBlock
 language="typescript"
 code={`// subagent.ts - 简化的执行循环

class SubAgentScope {
 private terminateMode = SubagentTerminateMode.ERROR;
 private finalText = '';

 async run(abortController: AbortController): Promise<void> {
 const startTime = Date.now();
 let turnCounter = 0;

 while (true) {
 // 检查终止条件
 if (this.runConfig.max_turns && turnCounter >= this.runConfig.max_turns) {
 this.terminateMode = SubagentTerminateMode.MAX_TURNS;
 break;
 }

 const durationMin = (Date.now() - startTime) / (1000 * 60);
 if (this.runConfig.max_time_minutes && durationMin >= this.runConfig.max_time_minutes) {
 this.terminateMode = SubagentTerminateMode.TIMEOUT;
 break;
 }

 turnCounter++;

 // 发送消息并流式获取响应
 const responseStream = await chat.sendMessageStream(model, messageParams);

 for await (const streamEvent of responseStream) {
 if (abortController.signal.aborted) {
 this.terminateMode = AgentTerminateMode.ABORTED;
 return;
 }
 // 处理流式响应...
 }

 // 处理工具调用
 if (functionCalls.length > 0) {
 currentMessages = await this.processFunctionCalls(functionCalls);
 } else {
 // 无工具调用 — 作为最终答案
 if (roundText && roundText.trim().length > 0) {
 this.finalText = roundText.trim();
 this.terminateMode = SubagentTerminateMode.GOAL;
 break;
 }
 // 否则，提示模型提供最终结果
 currentMessages = [{
 role: 'user',
 parts: [{ text: 'Please provide the final result now.' }],
 }];
 }
 }
 }
}`}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">文本响应终止</h4>
 <CodeBlock
 language="typescript"
 code={`// 处理工具调用
if (functionCalls.length > 0) {
 currentMessages = await this.processFunctionCalls(functionCalls);
} else {
 // 无工具调用 — 作为最终答案
 if (roundText && roundText.trim().length > 0) {
 this.finalText = roundText.trim();
 this.terminateMode = SubagentTerminateMode.GOAL;
 break;
 }
 // 否则，提示模型提供最终结果
 currentMessages = [{
 role: 'user',
 parts: [{ text: 'Please provide the final result now.' }],
 }];
}`}
 />
 <p className="text-xs text-dim mt-2">
 模型不调用工具时的文本输出被视为最终答案，触发 GOAL 终止
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">Nudge 提示机制</h4>
 <CodeBlock
 language="typescript"
 code={`// 当模型响应为空时，发送提示消息
// 引导模型输出最终结果

if (!roundText || roundText.trim().length === 0) {
 currentMessages = [{
 role: 'user',
 parts: [{
 text: 'Please provide the final result now and stop calling tools.',
 }],
 }];
}

// 这会消耗一个 turn，直到：
// 1. 模型输出文本 → GOAL 终止
// 2. 达到 max_turns → MAX_TURNS 终止
// 3. 超时 → TIMEOUT 终止`}
 />
 </div>
 </div>
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

 style U fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style LE fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style RA fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}`}
 />

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">动态 Schema 构建</h4>
 <CodeBlock
 language="typescript"
 code={`// delegate-- 动态 Schema 生成

export class DelegateToAgentTool extends BaseDeclarativeTool {
 constructor(registry: AgentRegistry, config: Config, messageBus: MessageBus) {
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
 messageBus,
 true, // isOutputMarkdown
 true, // canUpdateOutput（子代理执行过程可流式输出）
 );
 }
}`}
 />
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">调用分发</h4>
 <CodeBlock
 language="typescript"
 code={`// delegate-- DelegateInvocation

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

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">💡 为什么用 discriminatedUnion？</h4>
 <ul className="space-y-2 text-sm text-body">
 <li className="flex items-start gap-2">
 <span className="text-heading">1.</span>
 <span>
 <strong>类型安全</strong>：每个 Agent 有独立的参数定义，
 模型只能使用对应 Agent 的参数
 </span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">2.</span>
 <span>
 <strong>自动验证</strong>：Zod 在调用时验证参数类型和必填性
 </span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">3.</span>
 <span>
 <strong>动态扩展</strong>：Registry 中添加新 Agent 自动更新 Schema
 </span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">4.</span>
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
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <button
 onClick={() => toggleSection('events')}
 className="w-full flex items-center justify-between mb-4"
 >
 <h2 className="text-xl font-bold text-heading flex items-center gap-2">
 📡 SubagentActivityEvent 事件系统
 </h2>
 <span className={`transform transition-transform ${expandedSections.has('events') ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {expandedSections.has('events') && (
 <div className="space-y-6">
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">4 种活动事件</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {[
 { name: 'TOOL_CALL_START', desc: '工具调用开始', color: 'text-heading' },
 { name: 'TOOL_CALL_END', desc: '工具调用结束', color: 'text-heading' },
 { name: 'THOUGHT_CHUNK', desc: '思考过程片段', color: 'text-heading' },
 { name: 'ERROR', desc: '执行错误', color: 'text-heading' },
 ].map((event) => (
 <div
 key={event.name}
 className="bg-surface rounded-lg p-3 border border-edge"
 >
 <div className={`${event.color} font-mono text-sm`}>
 {event.name}
 </div>
 <div className="text-xs text-dim">{event.desc}</div>
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

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">事件使用示例</h4>
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
 process.stdout.write(event.thought); // 流式输出
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
 <section className="bg-surface rounded-xl p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
 ⚖️ 设计权衡与决策
 </h2>

 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">
 为什么用 Markdown frontmatter？
 </h4>
 <ul className="text-sm text-body space-y-1">
 <li><strong>统一格式</strong>：与 Skill 的 frontmatter 结构一致</li>
 <li><strong>配置 + 提示词分离</strong>：YAML 承载元信息，正文直接作为 system prompt</li>
 <li><strong>兼容远程 Agent</strong>：frontmatter 可用数组声明多个 remote agent</li>
 <li><strong>Zod 验证</strong>：运行时进行严格类型校验</li>
 </ul>
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">
 为什么用文本响应作为终止信号？
 </h4>
 <ul className="text-sm text-body space-y-1">
 <li><strong>自然流程</strong>：模型完成工具调用后自然输出总结</li>
 <li><strong>简化实现</strong>：无需注入特殊工具</li>
 <li><strong>防止空转</strong>：Nudge 机制确保最终输出</li>
 <li><strong>灵活性</strong>：支持任意格式的最终结果</li>
 </ul>
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">
 什么是 Nudge 提示机制？
 </h4>
 <ul className="text-sm text-body space-y-1">
 <li><strong>空响应处理</strong>：当模型不输出文本也不调用工具时触发</li>
 <li><strong>引导输出</strong>：发送提示消息让模型提供最终结果</li>
 <li><strong>消耗 Turn</strong>：每次 Nudge 消耗一个 turn 配额</li>
 <li><strong>终止保障</strong>：最终会触发 GOAL、MAX_TURNS 或 TIMEOUT</li>
 </ul>
 </div>

 <div className="bg-base/50 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">
 local vs remote Agent 的选择？
 </h4>
 <ul className="text-sm text-body space-y-1">
 <li><strong>local</strong>：需要访问本地工具（文件、Shell），低延迟</li>
 <li><strong>remote</strong>：外部服务、专有能力、隔离执行</li>
 <li><strong>A2A 协议</strong>：标准化的 Agent 互操作接口</li>
 <li><strong>统一接口</strong>：delegate_to_agent 透明处理两种类型</li>
 </ul>
 </div>
 </div>
 </section>

 {/* 相关页面 */}
 <RelatedPages
 title="🔗 相关页面"
 pages={[
 { id: 'subagent', label: 'Agent 系统概览', description: '基础概念和快速入门' },
 { id: 'agent-framework', label: 'Agent 框架', description: 'SubAgentScope 执行循环' },
 { id: 'agent-loop-anim', label: 'Agent 执行循环动画', description: '可视化 Turn 循环与终止' },
 { id: 'routing-chain-anim', label: '路由策略链动画', description: '模型选择可视化' },
 { id: 'model-routing', label: '模型路由', description: 'Flash/Pro 策略链' },
 ]}
 />
 </div>
 );
}

export default SubagentArchitecture;
