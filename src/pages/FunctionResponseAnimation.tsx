import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 构建阶段
type BuildPhase =
 | 'tool_complete'
 | 'classify_result'
 | 'build_response_part'
 | 'handle_binary'
 | 'handle_error'
 | 'inject_history'
 | 'continuation_ready';

interface BuildStep {
 phase: BuildPhase;
 title: string;
 description: string;
 code: string;
}

const buildSteps: BuildStep[] = [
 {
 phase: 'tool_complete',
 title: '工具执行完成',
 description: '接收工具执行返回的原始结果',
 code: `// coreToolScheduler.ts - 工具执行完成回调
async onToolComplete(
 request: ToolCallRequestInfo,
 result: ToolResult
): Promise<void> {
 // ToolResult 结构:
 interface ToolResult {
 llmContent: PartListUnion; // 发给 AI 的内容
 displayContent?: string; // 显示给用户的内容
 error?: Error; // 如果有错误
 }

 // PartListUnion 可能是:
 // - string: 简单文本结果
 // - Part[]: 多个结构化部分
 // - Part: 单个部分 (可能是 binary)

 // 开始构建 FunctionResponse
 const responseParts = await this.convertToFunctionResponse(
 request.name,
 request.callId,
 result.llmContent
 );
}`,
 },
 {
 phase: 'classify_result',
 title: '结果类型分类',
 description: '判断结果类型以选择构建策略',
 code: `// coreToolScheduler.ts:162 - convertToFunctionResponse()
async convertToFunctionResponse(
 toolName: string,
 callId: string,
 llmContent: PartListUnion
): Promise<Part[]> {

 // 类型判断
 if (typeof llmContent === 'string') {
 // Case 1: 简单字符串结果
 return this.buildFromString(callId, toolName, llmContent);
 }

 if (Array.isArray(llmContent)) {
 // Case 2: Part[] 数组
 return this.buildFromParts(callId, toolName, llmContent);
 }

 if (this.isPart(llmContent)) {
 // Case 3: 单个 Part
 return this.buildFromSinglePart(callId, toolName, llmContent);
 }

 // Case 4: 未知类型，降级处理
 return this.buildFromString(
 callId,
 toolName,
 "Tool execution completed successfully."
 );
}`,
 },
 {
 phase: 'build_response_part',
 title: '构建 FunctionResponse Part',
 description: '创建标准的 functionResponse 结构',
 code: `// coreToolScheduler.ts:180 - createFunctionResponsePart()
private createFunctionResponsePart(
 callId: string,
 toolName: string,
 output: string
): Part {
 return {
 functionResponse: {
 id: callId, // 必须匹配原 functionCall.id
 name: toolName, // 工具名称
 response: {
 output: output // 工具输出内容
 }
 }
 };
}

// buildFromString()
private buildFromString(
 callId: string,
 toolName: string,
 content: string
): Part[] {
 return [
 this.createFunctionResponsePart(callId, toolName, content)
 ];
}

// 示例输出:
{
 functionResponse: {
 id: "call_abc123",
 name: "read_file",
 response: {
 output: "{\\"name\\": \\"gemini-cli\\", \\"version\\": \\"1.0.0\\"}"
 }
 }
}`,
 },
 {
 phase: 'handle_binary',
 title: '处理二进制内容',
 description: '图像等二进制数据需特殊处理',
 code: `// coreToolScheduler.ts:195 - buildFromSinglePart()
private buildFromSinglePart(
 callId: string,
 toolName: string,
 part: Part
): Part[] {
 // 检查是否是二进制内容 (图像、音频等)
 if (part.inlineData || part.fileData) {
 const mimeType = part.inlineData?.mimeType ||
 part.fileData?.mimeType ||
 'unknown';

 // 二进制内容作为额外 Part 附加
 return [
 this.createFunctionResponsePart(
 callId,
 toolName,
 \`Binary content of type: \${mimeType}\`
 ),
 part // 原始二进制 Part
 ];
 }

 // 如果是 functionResponse，可能是嵌套的
 if (part.functionResponse) {
 const nestedContent = this.extractNestedContent(part);
 return [
 this.createFunctionResponsePart(callId, toolName, nestedContent)
 ];
 }

 // 文本内容
 if (part.text) {
 return [
 this.createFunctionResponsePart(callId, toolName, part.text)
 ];
 }

 // 降级
 return [
 this.createFunctionResponsePart(
 callId,
 toolName,
 "Tool execution succeeded."
 )
 ];
}`,
 },
 {
 phase: 'handle_error',
 title: '错误响应构建',
 description: '工具执行失败时的响应格式',
 code: `// coreToolScheduler.ts:240 - createErrorResponse()
private createErrorResponse(
 request: ToolCallRequestInfo,
 error: Error,
 errorType: ToolErrorType | undefined
): ToolCallResponseInfo {
 return {
 callId: request.callId,
 error,
 errorType,
 responseParts: [
 {
 functionResponse: {
 id: request.callId,
 name: request.name,
 response: {
 // 错误信息放在 response.error 字段
 error: error.message
 }
 }
 }
 ],
 resultDisplay: \`Error: \${error.message}\`
 };
}

// 错误类型枚举:
enum ToolErrorType {
 INVALID_TOOL_PARAMS = 'invalid_tool_params',
 FILE_NOT_FOUND = 'file_not_found',
 EXECUTION_FAILED = 'execution_failed',
 UNHANDLED_EXCEPTION = 'unhandled_exception',
 // Hook 触发：立刻停止整个 agent 执行
 STOP_EXECUTION = 'stop_execution',
 // ...（上游还有很多更细的错误类型）
}`,
 },
 {
 phase: 'inject_history',
 title: '注入对话历史',
 description: '将 FunctionResponse 添加到对话上下文',
 code: `// geminiChat.ts - sendMessageStream() 中工具结果处理
async processToolResponse(
 toolCallInfo: ToolCallRequestInfo,
 responseParts: Part[]
): Promise<void> {

 // 构建包含 FunctionResponse 的 Content
 const toolResultContent: Content = {
 role: 'user', // 工具响应作为 user 角色消息
 parts: responseParts
 };

 // 添加到对话历史
 this.history.push(toolResultContent);

 // 对话历史现在包含:
 // [...之前的消息,
 // { role: 'model', parts: [{ functionCall: {...} }] },
 // { role: 'user', parts: [{ functionResponse: {...} }] }]

 // 下一个 turn 会将完整历史发送给模型
}`,
 },
 {
 phase: 'continuation_ready',
 title: 'Continuation 就绪',
 description: '准备发起继续对话请求',
 code: `// geminiChat.ts - 发起 continuation
async *continuation(): AsyncGenerator<GeminiEvent> {
 // 获取包含工具结果的历史
 const contents = this.getHistory(true); // curated

 // 发起新的 turn
 const turn = new Turn(
 this,
 this.config,
 true // isContinuation = true
 );

 // 执行 turn
 for await (const event of turn.run()) {
 yield event;
 }
}

// continuation 请求的 contents 结构:
{
 contents: [
 // 用户原始请求
 { role: "user", parts: [{ text: "读取 package.json" }] },

 // 模型的工具调用
 { role: "model", parts: [{
 functionCall: { id: "call_abc", name: "read_file", args: {...} }
 }]},

 // 工具执行结果 (新增的)
 { role: "user", parts: [{
 functionResponse: {
 id: "call_abc",
 name: "read_file",
 response: { output: "{\\"name\\": ...}" }
 }
 }]}
 ]
}

// 模型收到工具结果后，会生成最终回复`,
 },
];

// 数据流可视化
function DataFlowVisual({ currentPhase }: { currentPhase: BuildPhase }) {
 const phases = [
 { id: 'tool_complete', label: 'ToolResult', icon: '📦' },
 { id: 'classify_result', label: '类型判断', icon: '🔍' },
 { id: 'build_response_part', label: '构建 Part', icon: '🔧' },
 { id: 'inject_history', label: '注入历史', icon: '📝' },
 { id: 'continuation_ready', label: 'Continuation', icon: '🔄' },
 ];

 const currentIndex = phases.findIndex((p) => p.id === currentPhase);

 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center gap-2 mb-4">
 <span className="text-heading">🔀</span>
 <span className="text-sm font-mono font-bold text-heading">数据流</span>
 </div>

 <div className="flex items-center justify-between">
 {phases.map((phase, i) => {
 const isActive = phase.id === currentPhase;
 const isPast = i < currentIndex;

 return (
 <div key={phase.id} className="flex items-center">
 <div
 className={`flex flex-col items-center transition-all duration-300 ${
 isActive ? 'scale-110' : ''
 }`}
 >
 <div
 className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl border-2 transition-all ${
 isActive
 ? ' bg-elevated border-edge shadow-[0_0_15px_rgba(56,189,248,0.5)]'
 : isPast
 ? ' bg-elevated/20 border-edge'
 : 'bg-base border-edge'
 }`}
 >
 {isPast ? '✓' : phase.icon}
 </div>
 <span
 className={`text-xs font-mono mt-1 ${
 isActive
 ? 'text-heading'
 : isPast
 ? 'text-heading'
 : 'text-dim'
 }`}
 >
 {phase.label}
 </span>
 </div>
 {i < phases.length - 1 && (
 <div
 className={`w-8 h-0.5 mx-1 ${
 i < currentIndex ? ' bg-elevated' : ' bg-elevated'
 }`}
 />
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
}

// FunctionResponse 结构可视化
function ResponseStructure({ phase }: { phase: BuildPhase }) {
 const showResponse = ['build_response_part', 'handle_binary', 'handle_error', 'inject_history', 'continuation_ready'].includes(phase);
 const isError = phase === 'handle_error';

 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-heading">📋</span>
 <span className="text-sm font-mono font-bold text-heading">FunctionResponse 结构</span>
 </div>

 {showResponse ? (
 <div className="space-y-2 text-xs font-mono">
 <div className="p-2 bg-base rounded border border-edge">
 <span className="text-heading">functionResponse</span>
 <span className="text-dim">: {'{'}</span>
 </div>
 <div className="pl-4 space-y-1">
 <div className="p-1.5 bg-elevated/10 rounded">
 <span className="text-heading">id</span>
 <span className="text-dim">: </span>
 <span className="text-amber-500">"call_abc123"</span>
 </div>
 <div className="p-1.5 bg-elevated/10 rounded">
 <span className="text-heading">name</span>
 <span className="text-dim">: </span>
 <span className="text-amber-500">"read_file"</span>
 </div>
 <div className="p-1.5 bg-elevated/10 rounded">
 <span className="text-heading">response</span>
 <span className="text-dim">: {'{'}</span>
 <div className="pl-4 mt-1">
 {isError ? (
 <span className="text-red-400">
 error: "ENOENT: file not found"
 </span>
 ) : (
 <span className="text-heading">
 output: "{'{'}\"name\": \"gemini-cli\"...{'}'}"
 </span>
 )}
 </div>
 <span className="text-dim">{'}'}</span>
 </div>
 </div>
 <div className="p-2 bg-base rounded border border-edge">
 <span className="text-dim">{'}'}</span>
 </div>
 </div>
 ) : (
 <div className="text-center text-dim py-8">
 等待构建...
 </div>
 )}
 </div>
 );
}

// 历史注入可视化
function HistoryInjection({ phase }: { phase: BuildPhase }) {
 const showInjection = ['inject_history', 'continuation_ready'].includes(phase);

 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-amber-500">📚</span>
 <span className="text-sm font-mono font-bold text-heading">对话历史</span>
 </div>

 <div className="space-y-2 text-xs font-mono">
 {/* User message */}
 <div className="p-2 bg-elevated/10 rounded border border-edge">
 <div className="text-heading mb-1">role: "user"</div>
 <div className="text-dim">读取 package.json</div>
 </div>

 {/* Model functionCall */}
 <div className="p-2 bg-elevated/10 rounded border border-edge">
 <div className="text-heading mb-1">role: "model"</div>
 <div className="text-dim">
 functionCall: read_file({'{'}file_path: "/package.json"{'}'})
 </div>
 </div>

 {/* FunctionResponse - highlighted when injecting */}
 <div
 className={`p-2 rounded border transition-all duration-500 ${
 showInjection
 ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
 : 'bg-base border-edge opacity-30'
 }`}
 >
 <div className="text-amber-500 mb-1">
 role: "user" {showInjection && <span className="animate-pulse">← NEW</span>}
 </div>
 <div className="text-dim">
 functionResponse: {'{'}output: "..."{'}'}
 </div>
 </div>

 {/* Continuation arrow */}
 {phase === 'continuation_ready' && (
 <div className="text-center py-2">
 <span className="text-heading animate-bounce inline-block">↓</span>
 <div className="text-heading text-xs">发送 Continuation</div>
 </div>
 )}
 </div>
 </div>
 );
}

export function FunctionResponseAnimation() {
 const [currentStep, setCurrentStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);

 const step = buildSteps[currentStep];

 useEffect(() => {
 if (!isPlaying) return;
 if (currentStep >= buildSteps.length - 1) {
 setIsPlaying(false);
 return;
 }

 const timer = setTimeout(() => {
 setCurrentStep((s) => s + 1);
 }, 2500);

 return () => clearTimeout(timer);
 }, [isPlaying, currentStep]);

 const play = useCallback(() => {
 setCurrentStep(0);
 setIsPlaying(true);
 }, []);

 const stepForward = useCallback(() => {
 if (currentStep < buildSteps.length - 1) {
 setCurrentStep((s) => s + 1);
 } else {
 setCurrentStep(0);
 }
 }, [currentStep]);

 const reset = useCallback(() => {
 setCurrentStep(0);
 setIsPlaying(false);
 }, []);

 return (
 <div className="bg-surface rounded-xl p-8 border border-edge relative overflow-hidden">
 <div className="absolute top-0 left-0 right-0 h-[3px] bg-surface " />

 <div className="flex items-center gap-3 mb-6">
 <span className="text-amber-500">⚡</span>
 <h2 className="text-2xl font-mono font-bold text-heading">
 FunctionResponse 构建
 </h2>
 </div>

 <p className="text-sm text-dim font-mono mb-6">
 // 工具执行结果如何转换为 API 格式并注入对话
 <br />
 // 源码位置: packages/core/src/core/coreToolScheduler.ts (convertToFunctionResponse)
 </p>

 {/* Controls */}
 <div className="flex gap-3 mb-6 flex-wrap">
 <button
 onClick={play}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all cursor-pointer"
 >
 ▶ 播放构建过程
 </button>
 <button
 onClick={stepForward}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge-hover hover:text-heading transition-all cursor-pointer"
 >
 ⏭ 下一步
 </button>
 <button
 onClick={reset}
 className="px-5 py-2.5 bg-elevated text-amber-500 rounded-md font-mono font-bold border border-edge hover:border-amber-600 transition-all cursor-pointer"
 >
 ↺ 重置
 </button>
 </div>

 {/* Data flow */}
 <div className="mb-6">
 <DataFlowVisual currentPhase={step.phase} />
 </div>

 {/* Main content */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
 {/* Response structure */}
 <ResponseStructure phase={step.phase} />

 {/* History injection */}
 <HistoryInjection phase={step.phase} />

 {/* Code panel */}
 <div className="bg-base rounded-xl border border-edge overflow-hidden">
 <div className="px-4 py-2 bg-elevated border- border-edge flex items-center gap-2">
 <span className="text-heading">$</span>
 <span className="text-xs font-mono text-dim">{step.title}</span>
 </div>
 <div className="p-4 max-h-[320px] overflow-y-auto">
 <JsonBlock code={step.code} />
 </div>
 </div>
 </div>

 {/* Status bar */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-4 mb-2">
 <span className="text-heading font-mono">$</span>
 <span className="text-body font-mono">
 步骤：<span className="text-heading font-bold">{currentStep + 1}</span>/{buildSteps.length}
 </span>
 {isPlaying && (
 <span className="text-amber-500 font-mono text-sm animate-pulse">● 构建中</span>
 )}
 </div>
 <div className="font-mono text-sm text-heading pl-6">
 {step.description}
 </div>
 <div className="mt-3 h-1 bg-elevated rounded-full overflow-hidden">
 <div
 className="h-full bg-surface transition-all duration-300"
 style={{ width: `${((currentStep + 1) / buildSteps.length) * 100}%` }}
 />
 </div>
 </div>

 {/* Key concepts */}
 <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-1">ID 匹配</div>
 <div className="text-xs font-mono text-dim">
 functionResponse.id 必须等于 functionCall.id
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-1">user 角色</div>
 <div className="text-xs font-mono text-dim">
 工具响应作为 user 消息添加到历史
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-amber-600">
 <div className="text-xs font-mono text-amber-500 font-bold mb-1">二进制处理</div>
 <div className="text-xs font-mono text-dim">
 图像等附加为额外 Part
 </div>
 </div>
 <div className="p-3 bg-base rounded-lg border border-edge">
 <div className="text-xs font-mono text-heading font-bold mb-1">Continuation</div>
 <div className="text-xs font-mono text-dim">
 带工具结果的请求触发新 turn
 </div>
 </div>
 </div>
 </div>
 );
}
