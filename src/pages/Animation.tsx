import { useState, useEffect } from 'react';
import { JsonBlock } from '../components/JsonBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

// 介绍内容组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-6 bg-elevated rounded-lg overflow-hidden border border-edge">
 <button
 onClick={onToggle}
 className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface transition-colors"
 >
 <span className="text-lg font-semibold text-heading">📖 什么是核心交互循环？</span>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-4 pb-4 space-y-4 text-sm">
 {/* 核心概念 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">🎯 核心概念</h3>
 <p className="text-body">
 <strong>核心交互循环</strong>是 Gemini CLI 的心跳。当用户发送消息后，CLI 会与 AI 进行多轮交互，
 直到 AI 完成任务或需要用户输入。这个循环包括：消息发送 → AI 思考 → 工具调用 → 用户审批 → 执行 → 继续对话。
 </p>
 </div>

 {/* 为什么需要 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">❓ 为什么需要理解这个循环？</h3>
 <ul className="text-body space-y-1 list-disc list-inside">
 <li><strong>掌控全局</strong>：理解 CLI 每一步在做什么，不再黑箱操作</li>
 <li><strong>排查问题</strong>：当 CLI 卡住或行为异常时，知道从哪里入手</li>
 <li><strong>安全意识</strong>：理解工具审批机制，知道何时 CLI 会询问你</li>
 <li><strong>性能优化</strong>：理解 Continuation 机制，知道多轮对话的开销</li>
 </ul>
 </div>

 {/* 关键参与者 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">👥 关键参与者</h3>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">👤 用户</div>
 <div className="text-dim">发起请求、审批工具、接收结果</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">🖥️ CLI</div>
 <div className="text-dim">协调各方、执行工具、管理状态</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">☁️ AI API</div>
 <div className="text-dim">理解意图、生成回复、调用工具</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-amber-500">🔧 工具</div>
 <div className="text-dim">读写文件、执行命令、搜索代码</div>
 </div>
 </div>
 </div>

 {/* 源码位置 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">📁 核心源码</h3>
 <div className="bg-base p-2 rounded font-mono text-xs border border-edge">
 <div className="text-dim">// 主循环入口</div>
 <div>packages/core/src/core/geminiChat.ts</div>
 <div className="text-dim mt-1">// 工具调度</div>
 <div>packages/core/src/core/coreToolScheduler.ts</div>
 </div>
 </div>

 {/* 相关机制 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">🔗 相关机制</h3>
 <div className="flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">工具调度器</span>
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">流式解析</span>
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">权限审批</span>
 <span className="px-2 py-1 bg-amber-500/20 text-amber-500 rounded text-xs">上下文管理</span>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

interface AnimStepProps {
 visible: boolean;
 from: string;
 fromColor: string;
 to: string;
 message: string;
 messageColor: string;
 extra?: string;
}

function AnimStep({ visible, from, fromColor, to, message, messageColor, extra }: AnimStepProps) {
 if (!visible) return null;

 return (
 <div className="animate-fadeIn">
 <div className={`flex items-center p-4 ${messageColor} rounded-lg my-2 border border-edge`}>
 <div className={`w-28 text-center font-mono text-sm ${fromColor}`}>{from}</div>
 <div className="flex-1 text-center">
 <div className="bg-elevated text-heading px-5 py-2 rounded-full inline-block font-mono text-sm border border-edge">
 {message}
 </div>
 </div>
 <div className="w-28 text-center font-mono text-sm text-body">{to}</div>
 </div>
 {extra && <div className="mx-12 text-sm"><JsonBlock code={extra} /></div>}
 </div>
 );
}

// 动画步骤数据 - 对应 gemini-cli 实际流程
const animSteps = [
 {
 from: '👤 用户',
 fromColor: 'text-heading',
 to: '→ CLI',
 message: '"帮我读取 package.json"',
 messageColor: ' bg-elevated/10',
 },
 {
 from: '🖥️ CLI',
 fromColor: 'text-heading',
 to: '→ AI',
 message: 'generateContentStream + tools',
 messageColor: ' bg-elevated/10',
 extra: `{
 // Gemini SDK (GenerateContent) 请求结构（上游主线没有 OpenAI 兼容层转换）
 contents: [{ role: "user", parts: [...] }],
 tools: [{ functionDeclarations: [ /* FunctionDeclaration[] */ ] }]
}`,
 },
 {
 from: '← CLI',
 fromColor: 'text-dim',
 to: '☁️ AI',
 message: 'FunctionCall: read_file',
 messageColor: ' bg-elevated/10',
 extra: `{
 // SDK chunk 里可直接读取 functionCalls（由 candidates.parts 推导的 getter）
 functionCalls: [{
 name: "read_file",
 args: { file_path: "package.json" }
 }],
 finishReason: "TOOL_USE"
}`,
 },
 {
 from: '🖥️ CLI',
 fromColor: 'text-amber-500',
 to: '👤 用户',
 message: '请求确认执行工具',
 messageColor: 'bg-amber-500/10',
 extra: `{
 // shouldConfirmExecute() 判断是否需要审批
 tool: "read_file",
 path: "package.json",
 status: "AWAITING_APPROVAL"
}`,
 },
 {
 from: '👤 用户',
 fromColor: 'text-heading',
 to: '→ CLI',
 message: '✓ 批准执行',
 messageColor: ' bg-elevated/10',
 },
 {
 from: '🖥️ CLI',
 fromColor: 'text-heading',
 to: '🔧 工具',
 message: '执行 read_file 工具',
 messageColor: 'bg-amber-500/10',
 extra: `// tool.build(args) → invocation.execute()
const invocation = readFileTool.build({ file_path: "package.json" });
await invocation.execute(signal);`,
 },
 {
 from: '← CLI',
 fromColor: 'text-dim',
 to: '🔧 工具',
 message: '返回 ToolResult',
 messageColor: 'bg-amber-500/10',
 extra: `{
 llmContent: "{\\"name\\": \\"@google/gemini-cli\\", ...}",
 returnDisplay: "package.json (1.2KB)"
}`,
 },
 {
 from: '🖥️ CLI',
 fromColor: 'text-heading',
 to: '→ AI',
 message: 'Continuation (含 FunctionResponse)',
 messageColor: ' bg-elevated/10',
 extra: `{
 // isContinuation = true
 contents: [
 { role: "user", parts: [...] },
 { role: "model", parts: [{ functionCall: {...} }] },
 { role: "user", parts: [{ functionResponse: {...} }] }
 ]
}`,
 },
 {
 from: '← CLI',
 fromColor: 'text-dim',
 to: '☁️ AI',
 message: '最终回复 (finishReason: STOP)',
 messageColor: ' bg-elevated/10',
 extra: `{
 content: "package.json 的 name 是 @google/gemini-cli",
 finishReason: "STOP" // 无更多工具调用
}`,
 },
 {
 from: '👤 用户',
 fromColor: 'text-heading',
 to: '← CLI',
 message: '看到回复，流程完成',
 messageColor: ' bg-elevated/10',
 },
];

const stepDescriptions = [
 '$ 点击播放开始演示',
 '> 用户输入问题：帮我读取 package.json',
 '> CLI 调用 generateContentStream，发送用户消息和工具定义',
 '< AI 返回 FunctionCall（functionCalls getter 可直接读取）',
 '? CLI 检查 shouldConfirmExecute()，需要用户确认',
 '✓ 用户批准执行工具',
 '> CLI 调用 ReadFileToolInvocation.execute()',
 '< 工具返回 ToolResult，包含文件内容',
 '> CLI 发送 Continuation 请求，包含 FunctionResponse',
 '< AI 生成最终回复，finishReason=STOP',
 '✓ 用户看到回复，对话循环完成！',
];

export function Animation() {
 const [step, setStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);
 const maxSteps = animSteps.length;
 const relatedPages: RelatedPage[] = [
 { id: 'interaction-loop', label: '交互循环', description: '核心交互机制' },
 { id: 'lifecycle', label: '请求生命周期', description: '请求处理流程' },
 { id: 'tool-scheduler', label: '工具调度器', description: '工具执行调度' },
 { id: 'approval-mode', label: '审批模式', description: '权限审批机制' },
 { id: 'streaming-response-processing', label: '流式响应', description: '流式解析' },
 { id: 'gemini-chat', label: 'GeminiChatCore', description: 'AI 核心' },
 ];

 useEffect(() => {
 if (!isPlaying) return;
 if (step >= maxSteps) return;

 const timer = setTimeout(() => {
 setStep((currentStep) => {
 const nextStep = currentStep + 1;
 if (nextStep >= maxSteps) {
 setIsPlaying(false);
 return maxSteps;
 }
 return nextStep;
 });
 }, 1800);

 return () => clearTimeout(timer);
 }, [isPlaying, step, maxSteps]);

 const play = () => {
 setStep(0);
 setIsPlaying(true);
 };

 const stepOnce = () => {
 if (step >= maxSteps) {
 setStep(1);
 } else {
 setStep((s) => s + 1);
 }
 };

 const reset = () => {
 setStep(0);
 setIsPlaying(false);
 };

 return (
 <div className="bg-surface rounded-xl p-8 border border-edge relative overflow-hidden">
 {/* Decorative top gradient */}
 <div className="absolute top-0 left-0 right-0 h-[3px] bg-surface " />

 <div className="flex items-center gap-3 mb-6">
 <span className="text-heading">▶</span>
 <h2 className="text-2xl font-mono font-bold text-heading">完整流程动画演示</h2>
 </div>

 <p className="text-sm text-dim font-mono mb-6">
 // 展示 gemini-cli 的核心交互循环：用户输入 → AI 思考 → 工具审批 → 执行 → Continuation
 </p>

 {/* 介绍部分 */}
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

 {/* Controls */}
 <div className="flex gap-3 mb-6 flex-wrap">
 <button
 onClick={play}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all cursor-pointer"
 >
 ▶ 播放完整流程
 </button>
 <button
 onClick={stepOnce}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge-hover hover:text-heading transition-all cursor-pointer"
 >
 ⏭ 单步执行
 </button>
 <button
 onClick={reset}
 className="px-5 py-2.5 bg-elevated text-amber-500 rounded-md font-mono font-bold border border-edge hover:border-amber-600 hover:shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
 >
 ↺ 重置
 </button>
 </div>

 {/* Stage */}
 <div className="relative min-h-[700px] bg-base rounded-xl overflow-hidden p-5 border border-edge">
 {/* Participants header */}
 <div className="flex justify-around mb-5 pb-4 border- border-edge">
 <div className="text-center">
 <div className="text-3xl mb-1">👤</div>
 <div className="font-mono text-sm text-heading">用户</div>
 </div>
 <div className="text-center">
 <div className="text-3xl mb-1">🖥️</div>
 <div className="font-mono text-sm text-heading">CLI</div>
 </div>
 <div className="text-center">
 <div className="text-3xl mb-1">☁️</div>
 <div className="font-mono text-sm text-heading">AI API</div>
 </div>
 <div className="text-center">
 <div className="text-3xl mb-1">🔧</div>
 <div className="font-mono text-sm text-amber-500">工具</div>
 </div>
 </div>

 {/* Animation steps */}
 <div className="space-y-1">
 {animSteps.map((s, i) => (
 <AnimStep
 key={i}
 visible={step > i}
 from={s.from}
 fromColor={s.fromColor}
 to={s.to}
 message={s.message}
 messageColor={s.messageColor}
 extra={s.extra}
 />
 ))}
 </div>
 </div>

 {/* Status bar */}
 <div className="mt-5 p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-4 mb-2">
 <span className="text-heading font-mono">$</span>
 <span className="text-body font-mono">
 当前步骤：<span className="text-heading font-bold">{step}</span>/{maxSteps}
 </span>
 {isPlaying && (
 <span className="text-amber-500 font-mono text-sm animate-pulse">
 ● 播放中...
 </span>
 )}
 </div>
 <div className="font-mono text-sm text-heading pl-6">
 {stepDescriptions[step]}
 </div>

 {/* Progress bar */}
 <div className="mt-3 h-1 bg-elevated rounded-full overflow-hidden">
 <div
 className="h-full bg-surface transition-all duration-300"
 style={{ width: `${(step / maxSteps) * 100}%` }}
 />
 </div>
 </div>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
