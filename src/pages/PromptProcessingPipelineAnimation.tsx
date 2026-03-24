import { useState, useEffect } from 'react';

// ===== Introduction Component =====
function Introduction({
 isExpanded,
 onToggle,
}: {
 isExpanded: boolean;
 onToggle: () => void;
}) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">⛓️</span>
 <span className="text-xl font-bold text-heading">
 Prompt 处理管道导读
 </span>
 </div>
 <span
 className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}
 >
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">核心概念
 </h4>
 <p className="text-body text-sm">
 自定义命令（.toml 文件）中的 prompt 模板在发送给 AI
 之前，会经过<strong>一系列处理器</strong>的变换。
 每个处理器负责处理特定的占位符语法：@&#123;file&#125;、!&#123;cmd&#125;、&#123;&#123;args&#125;&#125;。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">处理顺序（安全优先）
 </h4>
 <div className="flex items-center gap-2 mt-2 text-sm">
 <div className="bg-surface px-3 py-1 rounded text-heading">
 @File
 </div>
 <span className="text-dim">→</span>
 <div className="bg-surface px-3 py-1 rounded text-heading">
 !Shell
 </div>
 <span className="text-dim">→</span>
 <div className="bg-surface px-3 py-1 rounded text-heading">
 &#123;&#123;args&#125;&#125;
 </div>
 <span className="text-dim">→</span>
 <div className="bg-surface px-3 py-1 rounded text-heading">
 AI
 </div>
 </div>
 <p className="text-xs text-dim mt-2">@File 在 Shell 之前处理，防止用户输入的路径被注入到 Shell 命令
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">关键数字</h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="text-center">
 <div className="text-xl font-bold text-heading">
 4
 </div>
 <div className="text-xs text-dim">处理器</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">
 3
 </div>
 <div className="text-xs text-dim">占位符语法</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">安全</div>
 <div className="text-xs text-dim">优先设计</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">链式</div>
 <div className="text-xs text-dim">执行模式</div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

// ===== Pipeline Animation =====
function PipelineAnimation() {
 const [step, setStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);

 const stages = [
 {
 name: '原始模板',
 processor: null,
 color: 'var(--color-text-muted)',
 content: `分析文件 @{src/main.ts}
当前分支: !{git branch --show-current}
用户需求: {{args}}`,
 highlights: [],
 },
 {
 name: 'AtFileProcessor',
 processor: '@{...}',
 color: 'var(--color-text)',
 content: `分析文件 \`\`\`typescript
import { app } from './app';
app.listen(3000);
\`\`\`
当前分支: !{git branch --show-current}
用户需求: {{args}}`,
 highlights: ['@{src/main.ts}', '文件内容已注入'],
 },
 {
 name: 'ShellProcessor',
 processor: '!{...}',
 color: 'var(--color-text)',
 content: `分析文件 \`\`\`typescript
import { app } from './app';
app.listen(3000);
\`\`\`
当前分支: main
用户需求: {{args}}`,
 highlights: ['!{git branch...}', '命令已执行'],
 },
 {
 name: 'ArgumentProcessor',
 processor: '{{args}}',
 color: 'var(--color-warning)',
 content: `分析文件 \`\`\`typescript
import { app } from './app';
app.listen(3000);
\`\`\`
当前分支: main
用户需求: 请帮我优化这段代码`,
 highlights: ['{{args}}', '用户输入已替换'],
 },
 {
 name: '发送给 AI',
 processor: null,
 color: 'var(--color-text)',
 content: `分析文件 \`\`\`typescript
import { app } from './app';
app.listen(3000);
\`\`\`
当前分支: main
用户需求: 请帮我优化这段代码`,
 highlights: ['完整 Prompt', '准备发送'],
 },
 ];

 useEffect(() => {
 if (!isPlaying) return;
 const timer = setInterval(() => {
 setStep((prev) => {
 if (prev >= stages.length - 1) {
 setIsPlaying(false);
 return prev;
 }
 return prev + 1;
 });
 }, 1500);
 return () => clearInterval(timer);
 }, [isPlaying, stages.length]);

 const current = stages[step];

 return (
 <div className="bg-surface rounded-lg p-6 border border-edge">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-bold text-heading">处理管道动画
 </h3>
 <div className="flex gap-2">
 <button
 onClick={() => {
 setStep(0);
 setIsPlaying(true);
 }}
 className="px-3 py-1 rounded bg-elevated text-heading text-sm font-bold"
 >
 ▶ 播放
 </button>
 <button
 onClick={() => setIsPlaying(false)}
 className="px-3 py-1 rounded bg-surface text-dim text-sm"
 >
 ⏸ 暂停
 </button>
 </div>
 </div>

 {/* Progress bar */}
 <div className="flex gap-1 mb-4">
 {stages.map((stage, i) => (
 <div
 key={i}
 className={`flex-1 h-2 rounded-full transition-all ${
 i <= step ? 'opacity-100' : 'opacity-30'
 }`}
 style={{
 backgroundColor: i <= step ? stage.color : 'var(--color-bg-elevated)',
 }}
 />
 ))}
 </div>

 {/* Stage info */}
 <div
 className="text-center mb-4 p-3 rounded-lg border-2"
 style={{ borderColor: current.color }}
 >
 <div className="text-lg font-bold" style={{ color: current.color }}>
 {current.name}
 </div>
 {current.processor && (
 <div className="text-sm text-dim font-mono">
 处理: {current.processor}
 </div>
 )}
 </div>

 {/* Content display */}
 <div className="bg-base rounded-lg p-4 font-mono text-sm">
 <pre className="whitespace-pre-wrap text-body">
 {current.content}
 </pre>
 </div>

 {/* Highlights */}
 {current.highlights.length > 0 && (
 <div className="mt-3 flex gap-2">
 {current.highlights.map((h, i) => (
 <span
 key={i}
 className="px-2 py-1 rounded text-xs"
 style={{
 backgroundColor: `color-mix(in srgb, ${current.color} 20%, transparent)`,
 color: current.color,
 }}
 >
 {h}
 </span>
 ))}
 </div>
 )}

 {/* Step buttons */}
 <div className="flex justify-center gap-2 mt-4">
 {stages.map((stage, i) => (
 <button
 key={i}
 onClick={() => {
 setStep(i);
 setIsPlaying(false);
 }}
 className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
 step === i ? 'scale-110' : 'opacity-60 hover:opacity-100'
 }`}
 style={{
 backgroundColor: step === i ? stage.color : 'var(--color-bg-surface)',
 color: step === i ? 'var(--color-bg)' : 'var(--color-text-muted)',
 }}
 >
 {i + 1}
 </button>
 ))}
 </div>
 </div>
 );
}

// ===== Processor Detail Cards =====
function ProcessorCards() {
 const processors = [
 {
 name: 'AtFileProcessor',
 syntax: '@{path}',
 icon: '📄',
 color: 'var(--color-text)',
 description: '读取文件内容并注入到 Prompt',
 example: {
 input: '@{src/main.ts}',
 output: '```typescript\\nimport ...\\n```',
 },
 features: [
 '支持相对/绝对路径',
 '尊重 .gitignore/.geminiignore',
 '支持图片等多模态内容',
 '文件不存在时保留原文',
 ],
 },
 {
 name: 'ShellProcessor',
 syntax: '!{command}',
 icon: '🔧',
 color: 'var(--color-text)',
 description: '执行 Shell 命令并注入输出',
 example: {
 input: '!{git branch --show-current}',
 output: 'main',
 },
 features: [
 '执行任意 Shell 命令',
 '包含退出码/信号信息',
 '需要权限审批（非 YOLO 模式）',
 '参数正确转义',
 ],
 },
 {
 name: 'ArgumentProcessor',
 syntax: '{{args}}',
 icon: '📝',
 color: 'var(--color-warning)',
 description: '替换用户输入的参数',
 example: {
 input: '{{args}}',
 output: '用户实际输入的内容',
 },
 features: [
 '替换为命令调用参数',
 '无占位符时追加到末尾',
 '向后兼容的默认行为',
 ],
 },
 {
 name: 'InjectionParser',
 syntax: '@{} / !{}',
 icon: '🔍',
 color: 'var(--color-text)',
 description: '解析嵌套的注入语法',
 example: {
 input: '@{path} and !{cmd}',
 output: '[Injection("path"), Injection("cmd")]',
 },
 features: [
 '支持嵌套大括号',
 '严格验证未闭合括号',
 '返回 Injection 对象数组',
 ],
 },
 ];

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {processors.map((proc) => (
 <div
 key={proc.name}
 className="bg-surface rounded-lg p-5 border"
 style={{
 borderColor: `color-mix(in srgb, ${proc.color} 25%, var(--color-border))`,
 }}
 >
 <div className="flex items-center gap-3 mb-3">
 <span className="text-2xl">{proc.icon}</span>
 <div>
 <div className="font-bold" style={{ color: proc.color }}>
 {proc.name}
 </div>
 <code className="text-xs text-dim">
 {proc.syntax}
 </code>
 </div>
 </div>

 <p className="text-sm text-body mb-3">
 {proc.description}
 </p>

 <div className="bg-base rounded-lg p-3 mb-3">
 <div className="text-xs text-dim mb-1">输入:</div>
 <code className="text-sm text-heading">
 {proc.example.input}
 </code>
 <div className="text-xs text-dim mt-2 mb-1">
 输出:
 </div>
 <code className="text-sm" style={{ color: proc.color }}>
 {proc.example.output}
 </code>
 </div>

 <ul className="text-xs text-dim space-y-1">
 {proc.features.map((f, i) => (
 <li key={i} className="flex items-start gap-1">
 <span style={{ color: proc.color }}>•</span>
 {f}
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 );
}

// ===== Security Design Section =====
function SecurityDesign() {
 return (
 <div className="bg-surface rounded-lg p-6 border border-[color:var(--color-warning-soft)]">
 <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 安全设计
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base rounded-lg p-4">
 <div className="text-heading font-bold mb-2">正确顺序
 </div>
 <div className="text-sm text-body space-y-2">
 <div>
 1. <code className="text-heading">@File</code>{' '}
 先处理
 </div>
 <div>
 2. <code className="text-heading">!Shell</code>{' '}
 后处理
 </div>
 <div className="text-xs text-dim mt-2">
 用户输入的 @&#123;path&#125; 在 Shell 执行前已被替换为文件内容
 </div>
 </div>
 </div>

 <div className="bg-base rounded-lg p-4">
 <div className="text-heading font-bold mb-2">危险顺序</div>
 <div className="text-sm text-body space-y-2">
 <div>
 1. <code className="text-heading">!Shell</code>{' '}
 先处理
 </div>
 <div>
 2. <code className="text-heading">@File</code>{' '}
 后处理
 </div>
 <div className="text-xs text-heading mt-2">
 用户可能注入恶意命令: @&#123;; rm -rf /&#125;
 </div>
 </div>
 </div>
 </div>

 <div className="mt-4 p-3 bg-elevated rounded-lg text-sm text-heading">
 <strong>关键原则</strong>：用户可控的输入（@File 路径、{'{{args}}'}）
 必须在不可信的操作（Shell 执行）之前处理，防止注入攻击。
 </div>
 </div>
 );
}

// ===== Main Export =====
export default function PromptProcessingPipelineAnimation() {
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);

 return (
 <div className="space-y-8">
 <Introduction
 isExpanded={isIntroExpanded}
 onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
 />

 <h2 className="text-2xl font-bold text-heading">
 Prompt 处理管道动画
 </h2>

 <PipelineAnimation />

 <h3 className="text-xl font-bold text-heading mt-8">
 处理器详解
 </h3>
 <ProcessorCards />

 <SecurityDesign />
 </div>
 );
}
