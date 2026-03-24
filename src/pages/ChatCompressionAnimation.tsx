// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

/**
 * 聊天压缩分割点算法动画
 *
 * 可视化 Chat Compression Service 的核心算法：
 * 1. Token 阈值检测（70% 触发压缩）
 * 2. 保留阈值计算（保留最近 30%）
 * 3. 安全分割点扫描（turn 边界、tool_result 后）
 * 4. 压缩区域确定和摘要生成
 *
 * 源码位置: packages/core/src/services/chatCompressionService.ts
 */

// 内容类型
type ContentRole = 'user' | 'model' | 'tool_use' | 'tool_result';

// 动画阶段
type AnimationPhase =
 | 'init'
 | 'check_threshold'
 | 'calculate_preserve'
 | 'scan_boundaries'
 | 'find_split_point'
 | 'mark_regions'
 | 'compress'
 | 'complete';

// 消息块
interface ContentBlock {
 id: number;
 role: ContentRole;
 tokens: number;
 preview: string;
 isSafeBoundary: boolean;
 isSplitPoint?: boolean;
 region?: 'compress' | 'preserve';
}

// 动画步骤
interface AnimationStep {
 phase: AnimationPhase;
 title: string;
 description: string;
 codeSnippet?: string;
 metrics?: {
 totalTokens: number;
 maxTokens: number;
 usagePercent: number;
 preserveThreshold: number;
 compressThreshold: number;
 splitPointIndex?: number;
 };
 highlightBlocks?: number[];
 scanningIndex?: number;
 duration: number;
}

// 模拟对话内容
const SAMPLE_CONTENTS: ContentBlock[] = [
 { id: 0, role: 'user', tokens: 150, preview: '请帮我分析这段代码...', isSafeBoundary: false },
 { id: 1, role: 'model', tokens: 800, preview: '好的，我来分析这段代码...', isSafeBoundary: true },
 { id: 2, role: 'user', tokens: 50, preview: '请执行这个命令', isSafeBoundary: false },
 { id: 3, role: 'tool_use', tokens: 100, preview: 'run_shell_command: npm run build', isSafeBoundary: false },
 { id: 4, role: 'tool_result', tokens: 500, preview: 'Build completed successfully...', isSafeBoundary: true },
 { id: 5, role: 'model', tokens: 400, preview: '构建成功，让我解释结果...', isSafeBoundary: true },
 { id: 6, role: 'user', tokens: 80, preview: '读取配置文件', isSafeBoundary: false },
 { id: 7, role: 'tool_use', tokens: 50, preview: 'read_file: config.json', isSafeBoundary: false },
 { id: 8, role: 'tool_result', tokens: 200, preview: '{ "name": "project"...', isSafeBoundary: true },
 { id: 9, role: 'model', tokens: 350, preview: '配置文件内容如下...', isSafeBoundary: true },
 { id: 10, role: 'user', tokens: 120, preview: '请修改这个函数...', isSafeBoundary: false },
 { id: 11, role: 'model', tokens: 600, preview: '我来修改这个函数...', isSafeBoundary: true },
];

const TOTAL_TOKENS = SAMPLE_CONTENTS.reduce((sum, c) => sum + c.tokens, 0);
const MAX_TOKENS = 4000;
const COMPRESSION_THRESHOLD = 0.7; // 70%
const PRESERVE_THRESHOLD = 0.3; // 30%

// 动画步骤序列
const animationSteps: AnimationStep[] = [
 {
 phase: 'init',
 title: '初始化压缩服务',
 description: '加载对话历史，准备进行上下文压缩分析',
 codeSnippet: `// 压缩服务配置
const COMPRESSION_TOKEN_THRESHOLD = 0.7; // 70% 触发压缩
const COMPRESSION_PRESERVE_THRESHOLD = 0.3; // 保留 30%

interface CompressionConfig {
 maxTokens: number;
 compressionThreshold: number;
 preserveThreshold: number;
}

class ChatCompressionService {
 private contents: ContentBlock[] = [];
 private tokenCount: number = 0;
}`,
 metrics: {
 totalTokens: TOTAL_TOKENS,
 maxTokens: MAX_TOKENS,
 usagePercent: (TOTAL_TOKENS / MAX_TOKENS) * 100,
 preserveThreshold: PRESERVE_THRESHOLD,
 compressThreshold: COMPRESSION_THRESHOLD
 },
 duration: 2000
 },
 {
 phase: 'check_threshold',
 title: '检查压缩阈值',
 description: `当前 Token 使用率 ${((TOTAL_TOKENS / MAX_TOKENS) * 100).toFixed(1)}%，超过 70% 阈值，触发压缩`,
 codeSnippet: `shouldCompress(tokenCount: number, maxTokens: number): boolean {
 const usage = tokenCount / maxTokens;

 // 当使用率超过 70% 时触发压缩
 if (usage >= COMPRESSION_TOKEN_THRESHOLD) {
 console.log(\`Token usage \${(usage * 100).toFixed(1)}% >= 70%, compressing...\`);
 return true;
 }

 return false;
}

// 当前状态
const tokenCount = ${TOTAL_TOKENS};
const maxTokens = ${MAX_TOKENS};
const usage = ${((TOTAL_TOKENS / MAX_TOKENS) * 100).toFixed(1)}%;
// 结果: 需要压缩 ✓`,
 metrics: {
 totalTokens: TOTAL_TOKENS,
 maxTokens: MAX_TOKENS,
 usagePercent: (TOTAL_TOKENS / MAX_TOKENS) * 100,
 preserveThreshold: PRESERVE_THRESHOLD,
 compressThreshold: COMPRESSION_THRESHOLD
 },
 duration: 2500
 },
 {
 phase: 'calculate_preserve',
 title: '计算保留区域',
 description: '计算需要保留的最近 30% Token，确保最新对话不被压缩',
 codeSnippet: `calculatePreserveTokens(
 totalTokens: number,
 preserveThreshold: number
): number {
 // 保留最近 30% 的 Token
 const preserveTokens = Math.floor(
 totalTokens * preserveThreshold
 );

 return preserveTokens;
}

// 计算结果
const totalTokens = ${TOTAL_TOKENS};
const preserveThreshold = ${PRESERVE_THRESHOLD};
const preserveTokens = ${Math.floor(TOTAL_TOKENS * PRESERVE_THRESHOLD)};
// 需要保留最近 ${Math.floor(TOTAL_TOKENS * PRESERVE_THRESHOLD)} tokens`,
 metrics: {
 totalTokens: TOTAL_TOKENS,
 maxTokens: MAX_TOKENS,
 usagePercent: (TOTAL_TOKENS / MAX_TOKENS) * 100,
 preserveThreshold: PRESERVE_THRESHOLD,
 compressThreshold: COMPRESSION_THRESHOLD
 },
 highlightBlocks: [9, 10, 11], // 最近的消息
 duration: 2500
 },
 {
 phase: 'scan_boundaries',
 title: '扫描安全边界',
 description: '识别所有安全分割点：tool_result 后、model 响应后',
 codeSnippet: `findSafeBoundaries(contents: ContentBlock[]): number[] {
 const safeBoundaries: number[] = [];

 for (let i = 0; i < contents.length; i++) {
 const content = contents[i];

 // tool_result 后是安全边界
 if (content.role === 'tool_result') {
 safeBoundaries.push(i);
 }

 // model 响应后是安全边界（完整 turn）
 if (content.role === 'model') {
 safeBoundaries.push(i);
 }
 }

 return safeBoundaries;
}

// 识别的安全边界: [1, 4, 5, 8, 9, 11]`,
 metrics: {
 totalTokens: TOTAL_TOKENS,
 maxTokens: MAX_TOKENS,
 usagePercent: (TOTAL_TOKENS / MAX_TOKENS) * 100,
 preserveThreshold: PRESERVE_THRESHOLD,
 compressThreshold: COMPRESSION_THRESHOLD
 },
 highlightBlocks: [1, 4, 5, 8, 9, 11], // 安全边界
 duration: 3000
 },
 {
 phase: 'find_split_point',
 title: '寻找最佳分割点',
 description: '从保留区域边界向前扫描，找到最近的安全分割点',
 codeSnippet: `findCompressSplitPoint(
 contents: ContentBlock[],
 preserveTokens: number
): number {
 let accumulatedTokens = 0;

 // 从后向前累积 tokens，找到保留边界
 for (let i = contents.length - 1; i >= 0; i--) {
 accumulatedTokens += contents[i].tokens;

 if (accumulatedTokens >= preserveTokens) {
 // 找到保留边界，向前找安全分割点
 for (let j = i; j >= 0; j--) {
 if (contents[j].isSafeBoundary) {
 return j + 1; // 分割点在安全边界之后
 }
 }
 return i; // 没有安全边界，直接在这里分割
 }
 }

 return 0; // 不需要压缩
}

// 分割点: 索引 6 之后`,
 metrics: {
 totalTokens: TOTAL_TOKENS,
 maxTokens: MAX_TOKENS,
 usagePercent: (TOTAL_TOKENS / MAX_TOKENS) * 100,
 preserveThreshold: PRESERVE_THRESHOLD,
 compressThreshold: COMPRESSION_THRESHOLD,
 splitPointIndex: 6
 },
 scanningIndex: 6,
 duration: 3500
 },
 {
 phase: 'mark_regions',
 title: '标记压缩区域',
 description: '分割点之前的内容将被压缩为摘要，之后的内容保留原样',
 codeSnippet: `markRegions(
 contents: ContentBlock[],
 splitPoint: number
): void {
 for (let i = 0; i < contents.length; i++) {
 if (i < splitPoint) {
 contents[i].region = 'compress';
 } else {
 contents[i].region = 'preserve';
 }
 }
}

// 区域划分结果:
// compress: [0-5] 共 ${SAMPLE_CONTENTS.slice(0, 6).reduce((s, c) => s + c.tokens, 0)} tokens
// preserve: [6-11] 共 ${SAMPLE_CONTENTS.slice(6).reduce((s, c) => s + c.tokens, 0)} tokens`,
 metrics: {
 totalTokens: TOTAL_TOKENS,
 maxTokens: MAX_TOKENS,
 usagePercent: (TOTAL_TOKENS / MAX_TOKENS) * 100,
 preserveThreshold: PRESERVE_THRESHOLD,
 compressThreshold: COMPRESSION_THRESHOLD,
 splitPointIndex: 6
 },
 duration: 2500
 },
 {
 phase: 'compress',
 title: '执行压缩',
 description: '将压缩区域内容替换为 AI 生成的摘要，大幅减少 Token 数量',
 codeSnippet: `async compressContents(
 toCompress: ContentBlock[]
): Promise<ContentBlock> {
 // 提取关键信息生成摘要
 const summary = await this.generateSummary(toCompress);

 // 原始: ${SAMPLE_CONTENTS.slice(0, 6).reduce((s, c) => s + c.tokens, 0)} tokens
 // 压缩后: ~200 tokens (预估)

 return {
 role: 'system',
 content: \`[压缩摘要] \${summary}\`,
 tokens: 200 // 压缩后的 token 数
 };
}

// 压缩效果:
// 压缩前: ${TOTAL_TOKENS} tokens
// 压缩后: ~${SAMPLE_CONTENTS.slice(6).reduce((s, c) => s + c.tokens, 0) + 200} tokens
// 节省: ~${SAMPLE_CONTENTS.slice(0, 6).reduce((s, c) => s + c.tokens, 0) - 200} tokens`,
 metrics: {
 totalTokens: TOTAL_TOKENS,
 maxTokens: MAX_TOKENS,
 usagePercent: (TOTAL_TOKENS / MAX_TOKENS) * 100,
 preserveThreshold: PRESERVE_THRESHOLD,
 compressThreshold: COMPRESSION_THRESHOLD,
 splitPointIndex: 6
 },
 duration: 3000
 },
 {
 phase: 'complete',
 title: '压缩完成',
 description: '上下文压缩成功，Token 使用率降至安全范围',
 codeSnippet: `// 压缩结果
const compressionResult = {
 success: true,
 originalTokens: ${TOTAL_TOKENS},
 compressedTokens: ${SAMPLE_CONTENTS.slice(6).reduce((s, c) => s + c.tokens, 0) + 200},
 savedTokens: ${SAMPLE_CONTENTS.slice(0, 6).reduce((s, c) => s + c.tokens, 0) - 200},
 compressionRatio: ${(1 - (SAMPLE_CONTENTS.slice(6).reduce((s, c) => s + c.tokens, 0) + 200) / TOTAL_TOKENS * 100).toFixed(1)}%,
 preservedContents: 6,
 compressedContents: 6,
 splitPointType: 'tool_result boundary'
};

// 新的 Token 使用率:
// ${((SAMPLE_CONTENTS.slice(6).reduce((s, c) => s + c.tokens, 0) + 200) / MAX_TOKENS * 100).toFixed(1)}% < 70% ✓`,
 metrics: {
 totalTokens: SAMPLE_CONTENTS.slice(6).reduce((s, c) => s + c.tokens, 0) + 200,
 maxTokens: MAX_TOKENS,
 usagePercent: ((SAMPLE_CONTENTS.slice(6).reduce((s, c) => s + c.tokens, 0) + 200) / MAX_TOKENS) * 100,
 preserveThreshold: PRESERVE_THRESHOLD,
 compressThreshold: COMPRESSION_THRESHOLD,
 splitPointIndex: 6
 },
 duration: 2000
 }
];

// 角色颜色
const roleColors: Record<ContentRole, string> = {
 user: 'var(--color-primary)',
 model: 'var(--color-primary)',
 tool_use: 'var(--color-warning)',
 tool_result: 'var(--color-primary)'
};

// 角色图标
const roleIcons: Record<ContentRole, string> = {
 user: '👤',
 model: '🤖',
 tool_use: '🔧',
 tool_result: '📋'
};

// Token 使用率仪表盘
function TokenGauge({
 current,
 max,
 threshold,
 preserveThreshold
}: {
 current: number;
 max: number;
 threshold: number;
 preserveThreshold: number;
}) {
 const usage = (current / max) * 100;
 const thresholdPercent = threshold * 100;
 const preservePercent = preserveThreshold * 100;

 return (
 <div className="bg-base/40 rounded-lg p-4">
 <div className="flex justify-between text-xs text-body mb-2">
 <span>Token 使用率</span>
 <span>{current.toLocaleString()} / {max.toLocaleString()}</span>
 </div>

 <div className="relative h-6 bg-base/60 rounded-full overflow-hidden">
 {/* 压缩阈值线 */}
 <div
 className="absolute top-0 bottom-0 w-0.5 bg-[var(--color-danger)] z-20"
 style={{ left: `${thresholdPercent}%` }}
 />

 {/* 保留阈值指示 */}
 <div
 className="absolute top-0 bottom-0 bg-elevated/20 z-5"
 style={{
 right: 0,
 width: `${preservePercent}%`
 }}
 />

 {/* 当前使用率 */}
 <div
 className={`
 absolute top-0 bottom-0 left-0 transition-all duration-500
 ${usage >= thresholdPercent
 ? ' bg-surface '
 : ' bg-surface '
 }
 `}
 style={{ width: `${Math.min(usage, 100)}%` }}
 />

 {/* 百分比标签 */}
 <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-heading">
 {usage.toFixed(1)}%
 </div>
 </div>

 <div className="flex justify-between text-xs mt-2">
 <span className="text-heading">压缩阈值 {thresholdPercent}%</span>
 <span className="text-heading">保留区 {preservePercent}%</span>
 </div>
 </div>
 );
}

// 内容块可视化
function ContentBlocksVisualizer({
 contents,
 highlightBlocks,
 scanningIndex,
 splitPointIndex
}: {
 contents: ContentBlock[];
 highlightBlocks?: number[];
 scanningIndex?: number;
 splitPointIndex?: number;
}) {
 return (
 <div className="bg-base/40 rounded-lg p-4">
 <div className="text-xs text-body mb-3">
 对话内容块
 </div>

 <div className="space-y-2">
 {contents.map((block, idx) => {
 const isHighlighted = highlightBlocks?.includes(idx);
 const isScanning = scanningIndex === idx;
 const isSplitPoint = splitPointIndex !== undefined && idx === splitPointIndex;
 const isCompress = splitPointIndex !== undefined && idx < splitPointIndex;
 const isPreserve = splitPointIndex !== undefined && idx >= splitPointIndex;

 return (
 <div key={block.id}>
 {/* 分割点指示器 */}
 {isSplitPoint && (
 <div className="flex items-center gap-2 py-1 text-heading">
 <div className="flex-1 border-t-2 border-dashed border-edge" />
 <span className="text-xs font-bold">分割点</span>
 <div className="flex-1 border-t-2 border-dashed border-edge" />
 </div>
 )}

 <div
 className={`
 flex items-center gap-3 p-2 rounded transition-all duration-300
 ${isScanning ? 'ring-2 ring-[var(--color-warning)] animate-pulse' : ''}
 ${isHighlighted ? ' bg-elevated/20' : 'bg-base/30'}
 ${isCompress ? 'opacity-50 bg-elevated' : ''}
 ${isPreserve ? ' bg-elevated/10' : ''}
 `}
 >
 {/* 索引 */}
 <span className="text-xs text-dim w-6">
 {idx}
 </span>

 {/* 角色图标 */}
 <span className="text-lg">{roleIcons[block.role]}</span>

 {/* 角色标签 */}
 <span
 className="text-xs px-2 py-0.5 rounded"
 style={{
 backgroundColor: `${roleColors[block.role]}20`,
 color: roleColors[block.role]
 }}
 >
 {block.role}
 </span>

 {/* 预览 */}
 <span className="flex-1 text-sm text-body truncate">
 {block.preview}
 </span>

 {/* Token 数 */}
 <span className="text-xs text-dim">
 {block.tokens} tok
 </span>

 {/* 安全边界标记 */}
 {block.isSafeBoundary && (
 <span className="text-xs text-heading" title="安全边界"></span>
 )}

 {/* 区域标记 */}
 {isCompress && (
 <span className="text-xs text-heading">压缩</span>
 )}
 {isPreserve && (
 <span className="text-xs text-heading">保留</span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}

// 压缩统计
function CompressionStats({
 metrics,
 phase
}: {
 metrics: AnimationStep['metrics'];
 phase: AnimationPhase;
}) {
 if (!metrics) return null;

 const compressTokens = SAMPLE_CONTENTS.slice(0, 6).reduce((s, c) => s + c.tokens, 0);
 const preserveTokens = SAMPLE_CONTENTS.slice(6).reduce((s, c) => s + c.tokens, 0);

 return (
 <div className="bg-base/40 rounded-lg p-4">
 <div className="text-xs text-body mb-3">
 压缩统计
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="p-2 bg-base/30 rounded">
 <div className="text-xs text-dim">总 Token</div>
 <div className="text-lg font-bold text-heading">
 {metrics.totalTokens.toLocaleString()}
 </div>
 </div>

 <div className="p-2 bg-base/30 rounded">
 <div className="text-xs text-dim">最大容量</div>
 <div className="text-lg font-bold text-heading">
 {metrics.maxTokens.toLocaleString()}
 </div>
 </div>

 {phase !== 'init' && phase !== 'check_threshold' && (
 <>
 <div className="p-2 bg-elevated rounded border-l-2 border-l-edge-hover/30">
 <div className="text-xs text-heading">压缩区域</div>
 <div className="text-lg font-bold text-heading">
 {compressTokens.toLocaleString()}
 </div>
 </div>

 <div className="p-2 bg-elevated/10 rounded border border-edge/30">
 <div className="text-xs text-heading">保留区域</div>
 <div className="text-lg font-bold text-heading">
 {preserveTokens.toLocaleString()}
 </div>
 </div>
 </>
 )}

 {phase === 'complete' && (
 <div className="col-span-2 p-3 bg-elevated/10 rounded border border-edge/30">
 <div className="flex justify-between items-center">
 <div>
 <div className="text-xs text-heading">压缩效果</div>
 <div className="text-2xl font-bold text-heading">
 -{((1 - metrics.totalTokens / TOTAL_TOKENS) * 100).toFixed(0)}%
 </div>
 </div>
 <div className="text-right">
 <div className="text-xs text-body">节省 Token</div>
 <div className="text-lg font-bold text-heading">
 {(TOTAL_TOKENS - metrics.totalTokens).toLocaleString()}
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}

// 算法流程图
function AlgorithmFlow({ phase }: { phase: AnimationPhase }) {
 const steps = [
 { id: 'check_threshold', label: '检查阈值', icon: '📊' },
 { id: 'calculate_preserve', label: '计算保留', icon: '📐' },
 { id: 'scan_boundaries', label: '扫描边界', icon: '🔍' },
 { id: 'find_split_point', label: '寻找分割点', icon: '✂️' },
 { id: 'mark_regions', label: '标记区域', icon: '🏷️' },
 { id: 'compress', label: '执行压缩', icon: '📦' },
 ];

 const currentIndex = steps.findIndex(s => s.id === phase);

 return (
 <div className="bg-base/40 rounded-lg p-4">
 <div className="text-xs text-body mb-3">
 算法流程
 </div>

 <div className="flex items-center justify-between">
 {steps.map((step, idx) => {
 const isActive = step.id === phase;
 const isPassed = currentIndex > idx;

 return (
 <div key={step.id} className="flex items-center">
 <div
 className={`
 flex flex-col items-center gap-1 transition-all duration-300
 ${isActive ? 'scale-110' : ''}
 `}
 >
 <div
 className={`
 w-8 h-8 rounded-full flex items-center justify-center text-lg
 ${isActive
 ? ' bg-elevated animate-pulse'
 : isPassed
 ? ' bg-elevated/50'
 : ' bg-elevated/10'
 }
 `}
 >
 {step.icon}
 </div>
 <span
 className={`
 text-[10px] text-center max-w-[60px]
 ${isActive ? 'text-heading' : 'text-dim'}
 `}
 >
 {step.label}
 </span>
 </div>

 {idx < steps.length - 1 && (
 <div
 className={`
 w-4 h-0.5 mx-1
 ${isPassed ? ' bg-elevated' : ' bg-elevated/20'}
 `}
 />
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
}

export function ChatCompressionAnimation() {
 const [currentStep, setCurrentStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);

 const step = animationSteps[currentStep];

 // 自动播放
 useEffect(() => {
 if (!isPlaying) return;

 const timer = setTimeout(() => {
 if (currentStep < animationSteps.length - 1) {
 setCurrentStep(prev => prev + 1);
 } else {
 setIsPlaying(false);
 }
 }, step.duration);

 return () => clearTimeout(timer);
 }, [isPlaying, currentStep, step.duration]);

 const handleStepChange = useCallback((newStep: number) => {
 setCurrentStep(newStep);
 setIsPlaying(false);
 }, []);

 const togglePlay = useCallback(() => {
 if (currentStep >= animationSteps.length - 1) {
 setCurrentStep(0);
 }
 setIsPlaying(prev => !prev);
 }, [currentStep]);

 return (
 <div className="p-6 min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 {/* 标题 */}
 <div className="mb-8">
 <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
 聊天压缩分割点算法
 </h1>
 <p className="text-body">
 智能识别安全边界，平衡上下文保留与 Token 节省
 </p>
 <div className="mt-2 text-sm text-dim">
 源码: packages/core/src/services/chatCompressionService.ts
 </div>
 </div>

 {/* 控制栏 */}
 <div className="flex items-center gap-4 mb-6">
 <button
 onClick={togglePlay}
 className="px-4 py-2 rounded text-sm font-medium transition-colors"
 style={{
 backgroundColor: isPlaying ? 'var(--color-bg-elevated)' : 'var(--color-bg-elevated)',
 color: isPlaying ? 'var(--color-danger)' : 'var(--color-success)',
 border: `1px solid ${isPlaying ? 'var(--color-danger)' : 'var(--color-success)'}`
 }}
 >
 {isPlaying ? '⏸ 暂停' : '▶ 播放'}
 </button>
 <button
 onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
 disabled={currentStep === 0}
 className="px-3 py-2 rounded text-sm disabled:opacity-30"
 style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text)' }}
 >
 ← 上一步
 </button>
 <button
 onClick={() => handleStepChange(Math.min(animationSteps.length - 1, currentStep + 1))}
 disabled={currentStep === animationSteps.length - 1}
 className="px-3 py-2 rounded text-sm disabled:opacity-30"
 style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text)' }}
 >
 下一步 →
 </button>
 <button
 onClick={() => handleStepChange(0)}
 className="px-3 py-2 rounded text-sm"
 style={{ backgroundColor: 'var(--color-bg-surface)', color: 'var(--color-text-muted)' }}
 >
 ↺ 重置
 </button>
 <span className="text-dim text-sm ml-auto">
 步骤 {currentStep + 1} / {animationSteps.length}
 </span>
 </div>

 {/* 当前步骤标题 */}
 <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
 <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
 {step.title}
 </h2>
 <p className="text-body">{step.description}</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* 左侧：内容块可视化 */}
 <div className="space-y-4">
 {step.metrics && (
 <TokenGauge
 current={step.metrics.totalTokens}
 max={step.metrics.maxTokens}
 threshold={step.metrics.compressThreshold}
 preserveThreshold={step.metrics.preserveThreshold}
 />
 )}

 <ContentBlocksVisualizer
 contents={SAMPLE_CONTENTS}
 highlightBlocks={step.highlightBlocks}
 scanningIndex={step.scanningIndex}
 splitPointIndex={step.metrics?.splitPointIndex}
 />
 </div>

 {/* 右侧：代码和统计 */}
 <div className="space-y-4">
 <AlgorithmFlow phase={step.phase} />

 {step.codeSnippet && (
 <div className="bg-base/40 rounded-lg p-4">
 <div className="text-xs text-body mb-2">
 源码实现
 </div>
 <JsonBlock code={step.codeSnippet} />
 </div>
 )}

 <CompressionStats metrics={step.metrics} phase={step.phase} />
 </div>
 </div>

 {/* 阶段指示器 */}
 <div className="mt-8">
 <div className="flex gap-1">
 {animationSteps.map((s, idx) => (
 <button
 key={idx}
 onClick={() => handleStepChange(idx)}
 className={`flex-1 h-2 rounded-full transition-all ${
 idx === currentStep
 ? ' bg-elevated'
 : idx < currentStep
 ? ' bg-elevated/50'
 : ' bg-elevated'
 }`}
 title={s.title}
 />
 ))}
 </div>
 <div className="flex justify-between mt-2 text-xs text-dim">
 <span>检测阈值</span>
 <span>扫描边界</span>
 <span>执行压缩</span>
 </div>
 </div>
 </div>
 );
}
