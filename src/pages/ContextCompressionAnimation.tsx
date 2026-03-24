import { useState, useEffect, useCallback, useMemo } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 介绍内容组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-6 bg-elevated rounded-lg overflow-hidden border border-edge">
 <button
 onClick={onToggle}
 className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface transition-colors"
 >
 <span className="text-lg font-semibold text-heading">什么是上下文压缩？</span>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-4 pb-4 space-y-4 text-sm">
 {/* 核心概念 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">核心概念</h3>
 <p className="text-body">
 <strong>上下文压缩</strong>是 CLI 保持长对话能力的关键机制。当对话历史超过 Token 限制时，
 系统会智能压缩旧消息，保留最重要的信息，让 AI 能够继续理解上下文。
 </p>
 </div>

 {/* 为什么需要 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">为什么需要压缩？</h3>
 <ul className="text-body space-y-1 list-disc list-inside">
 <li><strong>Token 限制</strong>：每个 AI 模型都有最大上下文长度限制</li>
 <li><strong>成本控制</strong>：Token 越多，API 调用成本越高</li>
 <li><strong>响应速度</strong>：更少的 Token 意味着更快的响应</li>
 <li><strong>信息密度</strong>：压缩保留关键信息，丢弃冗余内容</li>
 </ul>
 </div>

 {/* 压缩策略 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">压缩策略</h3>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">阈值触发</div>
 <div className="text-dim">Token 超过限制时自动触发</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">分割点选择</div>
 <div className="text-dim">寻找最佳压缩位置</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">AI 摘要</div>
 <div className="text-dim">用 AI 生成历史摘要</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">重建上下文</div>
 <div className="text-dim">摘要 + 最近消息组成新上下文</div>
 </div>
 </div>
 </div>

 {/* 源码位置 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">源码位置</h3>
 <code className="text-xs bg-base p-2 rounded block border border-edge">
 packages/core/src/core/chatHistory.ts
 </code>
 </div>

 {/* 相关机制 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">相关机制</h3>
 <div className="flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-elevated text-heading rounded text-xs">Token 计数</span>
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">消息格式</span>
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">会话管理</span>
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">记忆系统</span>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

// 消息类型
interface Message {
 id: number;
 role: 'user' | 'assistant' | 'system';
 content: string;
 tokens: number;
 isCompressed?: boolean;
}

// 初始消息历史
const initialMessages: Message[] = [
 { id: 1, role: 'system', content: 'You are a helpful coding assistant...', tokens: 150 },
 { id: 2, role: 'user', content: '帮我分析一下这个项目的结构', tokens: 45 },
 { id: 3, role: 'assistant', content: '好的，让我分析项目结构...这个项目使用了 monorepo 架构...', tokens: 380 },
 { id: 4, role: 'user', content: '具体看一下 core 包的实现', tokens: 35 },
 { id: 5, role: 'assistant', content: 'core 包主要包含以下模块：1. AI 集成层...2. 工具执行引擎...', tokens: 520 },
 { id: 6, role: 'user', content: '工具调度是怎么实现的？', tokens: 28 },
 { id: 7, role: 'assistant', content: '工具调度使用 CoreToolScheduler 状态机实现...包含验证、审批、执行等状态...', tokens: 650 },
 { id: 8, role: 'user', content: '流式解析呢？', tokens: 18 },
 { id: 9, role: 'assistant', content: 'StreamingToolCallParser 负责解析流式响应...使用深度计数追踪 JSON 结构...', tokens: 480 },
 { id: 10, role: 'user', content: '帮我写一个类似的解析器', tokens: 32 },
 { id: 11, role: 'assistant', content: '```typescript\nclass SimpleStreamParser {\n private depth = 0;\n ...\n}\n```', tokens: 890 },
 { id: 12, role: 'user', content: '再加一些错误处理', tokens: 25 },
];

// Token 阈值配置
const TOKEN_CONFIG = {
 maxContextTokens: 3000,
 compressionThreshold: 0.85, // 85% 触发压缩
 targetAfterCompression: 0.5, // 压缩后目标为 50%
 minMessagesToKeep: 4,
 systemMessageProtected: true,
};

// 压缩阶段
type CompressionPhase = 'normal' | 'threshold_reached' | 'finding_split' | 'summarizing' | 'completed';

// Token 使用量可视化
function TokenUsageBar({
 used,
 max,
 threshold,
 phase,
}: {
 used: number;
 max: number;
 threshold: number;
 phase: CompressionPhase;
}) {
 const percentage = (used / max) * 100;
 const thresholdPercentage = threshold * 100;
 const isOverThreshold = percentage >= thresholdPercentage;

 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-mono text-heading">Token 使用量</span>
 <span
 className={`text-sm font-mono font-bold ${
 isOverThreshold ? 'text-heading' : 'text-heading'
 }`}
 >
 {used.toLocaleString()} / {max.toLocaleString()}
 </span>
 </div>

 {/* Progress bar */}
 <div className="relative h-6 bg-base rounded-full overflow-hidden border border-edge">
 {/* Fill */}
 <div
 className={`absolute inset-y-0 left-0 transition-all duration-500 ${
 isOverThreshold
 ? ' bg-surface '
 : ' bg-surface '
 }`}
 style={{ width: `${Math.min(percentage, 100)}%` }}
 />

 {/* Threshold marker */}
 <div
 className="absolute inset-y-0 w-0.5 bg-[var(--color-warning)] z-10"
 style={{ left: `${thresholdPercentage}%` }}
 >
 <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-heading whitespace-nowrap">
 压缩阈值 {thresholdPercentage}%
 </div>
 </div>

 {/* Percentage text */}
 <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-heading">
 {percentage.toFixed(1)}%
 </div>
 </div>

 {/* Phase indicator */}
 <div className="mt-3 flex items-center gap-2">
 <span
 className={`w-2 h-2 rounded-full ${
 phase === 'normal'
 ? ' bg-elevated'
 : phase === 'threshold_reached'
 ? 'bg-[var(--color-danger)] animate-pulse'
 : phase === 'completed'
 ? ' bg-elevated'
 : 'bg-[var(--color-warning)] animate-pulse'
 }`}
 />
 <span className="text-xs font-mono text-dim">
 {phase === 'normal' && '正常运行'}
 {phase === 'threshold_reached' && '⚠ 达到压缩阈值！'}
 {phase === 'finding_split' && '查找安全分割点...'}
 {phase === 'summarizing' && '正在压缩历史...'}
 {phase === 'completed' && '✓ 压缩完成'}
 </span>
 </div>
 </div>
 );
}

// 消息列表可视化
function MessageList({
 messages,
 splitPoint,
 phase,
}: {
 messages: Message[];
 splitPoint: number | null;
 phase: CompressionPhase;
}) {
 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-heading">💬</span>
 <span className="text-sm font-mono font-bold text-heading">消息历史</span>
 </div>

 <div className="space-y-2 max-h-[300px] overflow-y-auto">
 {messages.map((msg, index) => {
 const isInCompressedRange = splitPoint !== null && index > 0 && index < splitPoint;
 const isSplitPoint = splitPoint !== null && index === splitPoint;
 const isCompressed = msg.isCompressed;

 const roleColors = {
 system: 'var(--color-primary)',
 user: 'var(--color-primary)',
 assistant: 'var(--color-primary)',
 };

 return (
 <div key={msg.id}>
 {isSplitPoint && (
 <div className="flex items-center gap-2 py-2">
 <div className="flex-1 h-px bg-[var(--color-warning)]" />
 <span className="text-xs font-mono text-heading">安全分割点</span>
 <div className="flex-1 h-px bg-[var(--color-warning)]" />
 </div>
 )}
 <div
 className={`p-2 rounded border transition-all duration-300 ${
 isCompressed
 ? ' bg-elevated/10 border-edge'
 : isInCompressedRange
 ? phase === 'finding_split' || phase === 'summarizing'
 ? 'bg-elevated border-edge/60 opacity-60'
 : 'bg-base border-edge'
 : 'bg-base border-edge'
 }`}
 >
 <div className="flex items-center gap-2 mb-1">
 <span
 className="text-xs font-mono font-bold"
 style={{ color: roleColors[msg.role] }}
 >
 {msg.role}
 </span>
 <span className="text-xs font-mono text-dim">
 {msg.tokens} tokens
 </span>
 {isCompressed && (
 <span className="text-xs font-mono text-heading">压缩摘要
 </span>
 )}
 {isInCompressedRange && phase === 'summarizing' && (
 <span className="text-xs font-mono text-heading animate-pulse">
 正在压缩...
 </span>
 )}
 </div>
 <div className="text-xs font-mono text-body truncate">
 {msg.content}
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}

// 压缩步骤代码
const phaseCode = {
 normal: `// chatCompressionService.ts - Token 计数
async checkTokenUsage(): Promise<CompressionNeeded> {
 const totalTokens = this.calculateTotalTokens();
 const threshold = this.config.maxTokens * this.config.threshold;

 if (totalTokens < threshold) {
 return { needed: false, currentUsage: totalTokens };
 }

 return {
 needed: true,
 currentUsage: totalTokens,
 triggerReason: 'threshold_exceeded',
 };
}`,
 threshold_reached: `// chatCompressionService.ts - 触发压缩
async triggerCompression(): Promise<void> {
 console.log('⚠ Token 使用量达到阈值，开始压缩...');

 // 计算需要压缩的 token 数量
 const currentTokens = this.calculateTotalTokens();
 const targetTokens = this.config.maxTokens * this.config.targetRatio;
 const tokensToRemove = currentTokens - targetTokens;

 await this.compress(tokensToRemove);
}`,
 finding_split: `// chatCompressionService.ts - 查找安全分割点
findSafeSplitPoint(messages: Message[]): number {
 // 安全分割点必须在 user 消息边界
 // 这样可以保持对话的完整性

 let tokenCount = 0;
 let splitIndex = -1;

 for (let i = messages.length - 1; i >= 0; i--) {
 const msg = messages[i];

 // 系统消息始终保留
 if (msg.role === 'system') continue;

 // 只在 user 消息处分割
 if (msg.role === 'user') {
 if (tokenCount >= this.tokensToRemove) {
 splitIndex = i;
 break;
 }
 }

 tokenCount += msg.tokens;
 }

 return splitIndex;
}`,
 summarizing: `// chatCompressionService.ts - 生成压缩摘要
async summarizeHistory(messages: Message[]): Promise<Message> {
 // 调用 AI 生成摘要
 const prompt = \`请简洁总结以下对话历史的关键信息：
\${messages.map(m => \`\${m.role}: \${m.content}\`).join('\\n')}\`;

 const summary = await this.ai.generateSummary(prompt);

 return {
 role: 'assistant',
 content: \`[对话历史摘要] \${summary}\`,
 tokens: this.countTokens(summary),
 isCompressed: true,
 };
}`,
 completed: `// 压缩完成后的消息结构
{
 messages: [
 { role: "system", content: "...", tokens: 150 }, // 保留
 { role: "assistant", content: "[摘要]...", tokens: 180 }, // 新增摘要
 { role: "user", content: "再加一些错误处理", tokens: 25 }, // 保留最近
 // ...最近的消息保留
 ],
 compression: {
 originalTokens: 3253,
 compressedTokens: 1580,
 savedTokens: 1673,
 savedPercentage: "51.4%"
 }
}`,
};

export function ContextCompressionAnimation() {
 const [phase, setPhase] = useState<CompressionPhase>('normal');
 const [messages, setMessages] = useState<Message[]>(initialMessages);
 const [splitPoint, setSplitPoint] = useState<number | null>(null);
 const [isPlaying, setIsPlaying] = useState(false);
 const [currentStep, setCurrentStep] = useState(0);
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);

 const totalTokens = useMemo(
 () => messages.reduce((sum, m) => sum + m.tokens, 0),
 [messages]
 );

 const phaseSequence: CompressionPhase[] = [
 'normal',
 'threshold_reached',
 'finding_split',
 'summarizing',
 'completed',
 ];

 useEffect(() => {
 if (!isPlaying) return;
 if (currentStep >= phaseSequence.length - 1) {
 setIsPlaying(false);
 return;
 }

 const timer = setTimeout(() => {
 const nextStep = currentStep + 1;
 setCurrentStep(nextStep);
 const nextPhase = phaseSequence[nextStep];
 setPhase(nextPhase);

 // 更新状态
 switch (nextPhase) {
 case 'finding_split':
 setSplitPoint(6); // 在第6条消息处分割
 break;
 case 'completed':
 // 压缩消息
 setMessages([
 initialMessages[0], // system
 {
 id: 99,
 role: 'assistant',
 content: '[对话历史摘要] 用户询问了项目结构、core 包实现、工具调度机制和流式解析，我提供了详细解释并帮助编写了一个简单的流式解析器...',
 tokens: 180,
 isCompressed: true,
 },
 ...initialMessages.slice(-2), // 保留最后2条
 ]);
 setSplitPoint(null);
 break;
 }
 }, 2500);

 return () => clearTimeout(timer);
 }, [isPlaying, currentStep]);

 const play = useCallback(() => {
 setPhase('normal');
 setMessages(initialMessages);
 setSplitPoint(null);
 setCurrentStep(0);
 setIsPlaying(true);
 }, []);

 const stepForward = useCallback(() => {
 if (currentStep < phaseSequence.length - 1) {
 const nextStep = currentStep + 1;
 setCurrentStep(nextStep);
 const nextPhase = phaseSequence[nextStep];
 setPhase(nextPhase);

 switch (nextPhase) {
 case 'finding_split':
 setSplitPoint(6);
 break;
 case 'completed':
 setMessages([
 initialMessages[0],
 {
 id: 99,
 role: 'assistant',
 content: '[对话历史摘要] 用户询问了项目结构、core 包实现、工具调度机制和流式解析，我提供了详细解释并帮助编写了一个简单的流式解析器...',
 tokens: 180,
 isCompressed: true,
 },
 ...initialMessages.slice(-2),
 ]);
 setSplitPoint(null);
 break;
 }
 } else {
 // Reset
 setPhase('normal');
 setMessages(initialMessages);
 setSplitPoint(null);
 setCurrentStep(0);
 }
 }, [currentStep]);

 const reset = useCallback(() => {
 setPhase('normal');
 setMessages(initialMessages);
 setSplitPoint(null);
 setCurrentStep(0);
 setIsPlaying(false);
 }, []);

 return (
 <div className="bg-surface rounded-xl p-8 border border-edge relative overflow-hidden">
 {/* Decorative gradient */}
 <div className="absolute top-0 left-0 right-0 h-[3px] bg-surface " />

 {/* Header */}
 <div className="flex items-center gap-3 mb-6">
 <span className="text-heading">📦</span>
 <h2 className="text-2xl font-mono font-bold text-heading">
 上下文压缩机制
 </h2>
 </div>

 <p className="text-sm text-dim font-mono mb-6">
 // 当 Token 使用量超过阈值时，自动压缩历史消息以释放空间
 </p>

 {/* 介绍部分 */}
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

 {/* Controls */}
 <div className="flex gap-3 mb-6 flex-wrap">
 <button
 onClick={play}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all cursor-pointer"
 >
 ▶ 播放压缩流程
 </button>
 <button
 onClick={stepForward}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge-hover hover:text-heading transition-all cursor-pointer"
 >
 ⏭ 下一步
 </button>
 <button
 onClick={reset}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge/60 transition-all cursor-pointer"
 >
 ↺ 重置
 </button>
 </div>

 {/* Token usage bar */}
 <div className="mb-6">
 <TokenUsageBar
 used={totalTokens}
 max={TOKEN_CONFIG.maxContextTokens}
 threshold={TOKEN_CONFIG.compressionThreshold}
 phase={phase}
 />
 </div>

 {/* Main content */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
 {/* Message list */}
 <MessageList messages={messages} splitPoint={splitPoint} phase={phase} />

 {/* Code panel */}
 <div className="bg-base rounded-xl border border-edge overflow-hidden">
 <div className="px-4 py-2 bg-elevated border- border-edge flex items-center gap-2">
 <span className="text-heading">$</span>
 <span className="text-xs font-mono text-dim">
 {phase === 'normal' && 'Token 计数'}
 {phase === 'threshold_reached' && '触发压缩'}
 {phase === 'finding_split' && '查找分割点'}
 {phase === 'summarizing' && '生成摘要'}
 {phase === 'completed' && '压缩结果'}
 </span>
 </div>
 <div className="p-4 max-h-[350px] overflow-y-auto">
 <JsonBlock code={phaseCode[phase]} />
 </div>
 </div>
 </div>

 {/* Status bar */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-4 mb-2">
 <span className="text-heading font-mono">$</span>
 <span className="text-body font-mono">
 阶段：
 <span className="text-heading font-bold">{currentStep + 1}</span>
 /{phaseSequence.length}
 </span>
 {isPlaying && (
 <span className="text-heading font-mono text-sm animate-pulse">
 ● 处理中...
 </span>
 )}
 </div>

 {/* Progress bar */}
 <div className="mt-3 h-1 bg-elevated rounded-full overflow-hidden">
 <div
 className="h-full bg-surface transition-all duration-300"
 style={{ width: `${((currentStep + 1) / phaseSequence.length) * 100}%` }}
 />
 </div>
 </div>

 {/* Key points */}
 <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-heading">🔒</span>
 <span className="text-sm font-mono font-bold text-heading">安全分割</span>
 </div>
 <p className="text-xs font-mono text-dim">
 只在 user 消息边界分割，保持对话完整性
 </p>
 </div>
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-heading">🛡️</span>
 <span className="text-sm font-mono font-bold text-heading">系统消息保护</span>
 </div>
 <p className="text-xs font-mono text-dim">
 系统消息永远不会被压缩或移除
 </p>
 </div>
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-heading">📝</span>
 <span className="text-sm font-mono font-bold text-heading">智能摘要</span>
 </div>
 <p className="text-xs font-mono text-dim">
 使用 AI 生成历史摘要，保留关键上下文
 </p>
 </div>
 </div>
 </div>
 );
}
