import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { Module } from '../components/Module';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



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
 <span className="text-2xl">🏛️</span>
 <span className="text-xl font-bold text-heading">
 服务层架构导读
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
 <h4 className="text-heading font-bold mb-2">什么是服务层？
 </h4>
 <p className="text-body text-sm">
 服务层是 Gemini CLI 的<strong>中间抽象层</strong>，位于 Core
 循环和底层系统之间。
 它封装了文件系统、Shell 执行、Git 操作等复杂逻辑，提供干净的
 API 供上层调用。
 可以理解为：<strong>Core 层说"做什么"，服务层负责"怎么做"</strong>
 。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">核心服务概览
 </h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">
 文件发现
 </div>
 <div className="text-[10px] text-dim">
 FileDiscovery
 </div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">
 Shell 执行
 </div>
 <div className="text-[10px] text-dim">
 ShellExecution
 </div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">对话记录</div>
 <div className="text-[10px] text-dim">
 ChatRecording
 </div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">循环检测</div>
 <div className="text-[10px] text-dim">
 LoopDetection
 </div>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">设计原则
 </h4>
 <ul className="text-body text-sm space-y-1">
 <li>
 • <strong>单一职责</strong>：每个服务专注一个领域
 </li>
 <li>
 • <strong>可替换性</strong>：通过接口定义，便于测试和 Mock
 </li>
 <li>
 • <strong>无状态优先</strong>：大多数服务是无状态的纯函数
 </li>
 <li>
 • <strong>管道模式</strong>：Prompt 处理器链式执行
 </li>
 </ul>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">关键数字</h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="text-center">
 <div className="text-xl font-bold text-heading">
 8+
 </div>
 <div className="text-xs text-dim">核心服务</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">
 4
 </div>
 <div className="text-xs text-dim">
 Prompt 处理器
 </div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">70%</div>
 <div className="text-xs text-dim">
 压缩阈值
 </div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">5</div>
 <div className="text-xs text-dim">
 循环检测阈值
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

// ===== Service Dependency Graph Animation =====
function ServiceDependencyGraph() {
 const [hoveredService, setHoveredService] = useState<string | null>(null);

 const services = [
 {
 id: 'command',
 name: 'CommandService',
 layer: 'cli',
 x: 50,
 y: 10,
 deps: ['builtin', 'fileLoader', 'mcpLoader'],
 },
 {
 id: 'builtin',
 name: 'BuiltinLoader',
 layer: 'cli',
 x: 15,
 y: 30,
 deps: [],
 },
 {
 id: 'fileLoader',
 name: 'FileLoader',
 layer: 'cli',
 x: 50,
 y: 30,
 deps: ['promptProcessors'],
 },
 {
 id: 'mcpLoader',
 name: 'McpLoader',
 layer: 'cli',
 x: 85,
 y: 30,
 deps: [],
 },
 {
 id: 'promptProcessors',
 name: 'PromptProcessors',
 layer: 'cli',
 x: 50,
 y: 50,
 deps: ['shell'],
 },
 {
 id: 'recording',
 name: 'ChatRecording',
 layer: 'core',
 x: 15,
 y: 70,
 deps: [],
 },
 {
 id: 'compression',
 name: 'Compression',
 layer: 'core',
 x: 35,
 y: 70,
 deps: [],
 },
 {
 id: 'shell',
 name: 'ShellExecution',
 layer: 'core',
 x: 55,
 y: 70,
 deps: [],
 },
 {
 id: 'loop',
 name: 'LoopDetection',
 layer: 'core',
 x: 75,
 y: 70,
 deps: [],
 },
 {
 id: 'discovery',
 name: 'FileDiscovery',
 layer: 'core',
 x: 25,
 y: 90,
 deps: [],
 },
 { id: 'git', name: 'GitService', layer: 'core', x: 50, y: 90, deps: [] },
 { id: 'fs', name: 'FileSystem', layer: 'core', x: 75, y: 90, deps: [] },
 ];

 const getServiceColor = (layer: string) => {
 return layer === 'cli' ? 'var(--color-primary)' : 'var(--color-primary)';
 };

 return (
 <div className="bg-surface rounded-lg p-6 border border-edge">
 <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 <span>🕸️</span> 服务依赖关系图
 </h3>

 <div className="flex gap-4 mb-4 text-sm">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-elevated"></div>
 <span className="text-dim">CLI 层服务</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 rounded-full bg-elevated"></div>
 <span className="text-dim">Core 层服务</span>
 </div>
 </div>

 <svg viewBox="0 0 100 100" className="w-full h-80">
 {/* Layer backgrounds */}
 <rect
 x="0"
 y="5"
 width="100"
 height="50"
 fill="var(--color-primary)"
 opacity="0.05"
 rx="2"
 />
 <rect
 x="0"
 y="55"
 width="100"
 height="45"
 fill="var(--color-primary)"
 opacity="0.05"
 rx="2"
 />

 {/* Layer labels */}
 <text
 x="3"
 y="12"
 fill="var(--color-primary)"
 fontSize="3"
 fontWeight="bold"
 >
 CLI 层
 </text>
 <text
 x="3"
 y="62"
 fill="var(--color-primary)"
 fontSize="3"
 fontWeight="bold"
 >
 CORE 层
 </text>

 {/* Draw dependency lines */}
 {services.map((service) =>
 service.deps.map((depId) => {
 const dep = services.find((s) => s.id === depId);
 if (!dep) return null;
 const isHighlighted =
 hoveredService === service.id || hoveredService === depId;
 return (
 <line
 key={`${service.id}-${depId}`}
 x1={service.x}
 y1={service.y + 3}
 x2={dep.x}
 y2={dep.y - 3}
 stroke={isHighlighted ? 'var(--color-warning)' : 'var(--color-bg-elevated)'}
 strokeWidth={isHighlighted ? '0.5' : '0.3'}
 strokeDasharray={isHighlighted ? '' : '1,1'}
 markerEnd="url(#arrowhead)"
 />
 );
 })
 )}

 {/* Arrow marker definition */}
 <defs>
 <marker
 id="arrowhead"
 markerWidth="4"
 markerHeight="3"
 refX="4"
 refY="1.5"
 orient="auto"
 >
 <polygon
 points="0 0, 4 1.5, 0 3"
 fill="var(--color-bg-elevated)"
 opacity="0.5"
 />
 </marker>
 </defs>

 {/* Draw service nodes */}
 {services.map((service) => {
 const isHovered = hoveredService === service.id;
 return (
 <g
 key={service.id}
 onMouseEnter={() => setHoveredService(service.id)}
 onMouseLeave={() => setHoveredService(null)}
 style={{ cursor: 'pointer' }}
 >
 <rect
 x={service.x - 10}
 y={service.y - 3}
 width="20"
 height="6"
 fill={
 isHovered ? getServiceColor(service.layer) : 'var(--color-bg-surface)'
 }
 stroke={getServiceColor(service.layer)}
 strokeWidth="0.3"
 rx="1"
 opacity={isHovered ? 1 : 0.9}
 />
 <text
 x={service.x}
 y={service.y + 1}
 fill={
 isHovered
 ? 'var(--color-bg)'
 : getServiceColor(service.layer)
 }
 fontSize="2"
 textAnchor="middle"
 fontWeight={isHovered ? 'bold' : 'normal'}
 >
 {service.name}
 </text>
 </g>
 );
 })}
 </svg>

 {hoveredService && (
 <div className="mt-4 p-3 bg-base rounded-lg border border-edge">
 <div className="text-sm text-heading font-mono">
 {services.find((s) => s.id === hoveredService)?.name}
 </div>
 <div className="text-xs text-dim mt-1">
 层级:{' '}
 {services.find((s) => s.id === hoveredService)?.layer === 'cli'
 ? 'CLI 层'
 : 'Core 层'}
 {services.find((s) => s.id === hoveredService)?.deps.length
 ? ` | 依赖: ${services.find((s) => s.id === hoveredService)?.deps.join(', ')}`
 : ' | 无依赖'}
 </div>
 </div>
 )}
 </div>
 );
}

// ===== Prompt Processor Pipeline Animation =====
function PromptProcessorPipeline() {
 const [activeStep, setActiveStep] = useState(0);

 const steps = [
 {
 name: 'AtFileProcessor',
 icon: '📄',
 color: 'var(--color-text)',
 input: '@{src/main.ts} 请分析这个文件',
 output: '```typescript\nconst app = ...```\n请分析这个文件',
 description: '注入文件内容 (@{path})',
 },
 {
 name: 'ShellProcessor',
 icon: '🔧',
 color: 'var(--color-text)',
 input: '当前分支是 !{git branch --show-current}',
 output: '当前分支是 main',
 description: '执行 Shell 命令 (!{cmd})',
 },
 {
 name: 'ArgumentProcessor',
 icon: '📝',
 color: 'var(--color-warning)',
 input: '用户输入: {{args}}',
 output: '用户输入: 帮我重构代码',
 description: '替换参数占位符',
 },
 {
 name: 'InjectionParser',
 icon: '🔍',
 color: 'var(--color-text)',
 input: '@{file} 和 !{cmd}',
 output: '[Injection("file"), Injection("cmd")]',
 description: '解析嵌套注入语法',
 },
 ];

 return (
 <div className="bg-surface rounded-lg p-6 border border-edge">
 <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 <span>⛓️</span> Prompt 处理管道
 </h3>

 <div className="flex justify-center gap-2 mb-6">
 {steps.map((step, index) => (
 <button
 key={step.name}
 onClick={() => setActiveStep(index)}
 className={`px-3 py-2 rounded-lg text-sm font-mono transition-all ${
 activeStep === index
 ? 'bg-base border-2'
 : ' bg-surface border border-edge hover:border-edge-hover'
 }`}
 style={{
 borderColor:
 activeStep === index ? step.color : 'var(--color-bg-elevated)',
 color: activeStep === index ? step.color : 'var(--color-text-muted)',
 }}
 >
 <span className="mr-1">{step.icon}</span>
 {step.name.replace('Processor', '')}
 </button>
 ))}
 </div>

 <div
 className="bg-base rounded-lg p-4 border-l-2"
 style={{ borderColor: steps[activeStep].color }}
 >
 <div className="flex items-center gap-2 mb-3">
 <span className="text-2xl">{steps[activeStep].icon}</span>
 <span
 className="font-bold"
 style={{ color: steps[activeStep].color }}
 >
 {steps[activeStep].name}
 </span>
 </div>

 <p className="text-sm text-body mb-4">
 {steps[activeStep].description}
 </p>

 <div className="space-y-3">
 <div>
 <div className="text-xs text-dim mb-1">输入:</div>
 <div className="bg-base/30 rounded px-3 py-2 font-mono text-sm text-body">
 {steps[activeStep].input}
 </div>
 </div>
 <div className="text-center text-dim">↓</div>
 <div>
 <div className="text-xs text-dim mb-1">输出:</div>
 <div
 className="bg-base/30 rounded px-3 py-2 font-mono text-sm"
 style={{ color: steps[activeStep].color }}
 >
 {steps[activeStep].output}
 </div>
 </div>
 </div>
 </div>

 <div className="mt-4 p-3 bg-surface rounded-lg">
 <div className="text-xs text-dim">
 <strong>处理顺序</strong>：@File → Shell → Argument → 发送给 AI
 </div>
 <div className="text-xs text-heading mt-1">安全设计：@File 在 Shell 之前处理，防止路径注入攻击
 </div>
 </div>
 </div>
 );
}

// ===== Chat Compression Visualization =====
function CompressionVisualization() {
 const [isCompressing, setIsCompressing] = useState(false);

 const handleCompress = () => {
 setIsCompressing(true);
 setTimeout(() => setIsCompressing(false), 2000);
 };

 return (
 <div className="bg-surface rounded-lg p-6 border border-edge">
 <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 对话压缩机制
 </h3>

 <div className="flex flex-col md:flex-row gap-4">
 {/* Before compression */}
 <div className="flex-1">
 <div className="text-sm text-dim mb-2">压缩前</div>
 <div className="bg-base rounded-lg p-3 h-48 overflow-hidden relative">
 <div
 className={`space-y-2 transition-all duration-500 ${isCompressing ? 'opacity-50 scale-95' : ''}`}
 >
 {[...Array(8)].map((_, i) => (
 <div
 key={i}
 className={`h-4 rounded ${i < 5 ? 'bg-elevated' : ' bg-elevated/30'}`}
 style={{ width: `${60 + Math.random() * 40}%` }}
 />
 ))}
 </div>
 <div className="absolute bottom-2 left-3 right-3 flex justify-between text-xs">
 <span className="text-heading">旧消息 (70%)</span>
 <span className="text-heading">新消息 (30%)</span>
 </div>
 </div>
 </div>

 {/* Arrow */}
 <div className="flex items-center justify-center">
 <button
 onClick={handleCompress}
 disabled={isCompressing}
 className="px-4 py-2 bg-[var(--color-warning)] text-heading rounded-lg font-bold hover:opacity-80 disabled:opacity-50"
 >
 {isCompressing ? '压缩中...' : '压缩 →'}
 </button>
 </div>

 {/* After compression */}
 <div className="flex-1">
 <div className="text-sm text-dim mb-2">压缩后</div>
 <div className="bg-base rounded-lg p-3 h-48 overflow-hidden">
 <div
 className={`space-y-2 transition-all duration-500 ${isCompressing ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-80'}`}
 >
 <div className="h-8 rounded bg-elevated/30 flex items-center justify-center text-xs text-heading">LLM 生成的摘要
 </div>
 <div className="h-4 rounded bg-elevated/20 flex items-center justify-center text-xs text-dim">
 AI 确认: "收到历史摘要"
 </div>
 {[...Array(3)].map((_, i) => (
 <div
 key={i}
 className="h-4 rounded bg-elevated/30"
 style={{ width: `${60 + Math.random() * 40}%` }}
 />
 ))}
 </div>
 <div className="absolute bottom-2 left-3 text-xs text-heading">
 保留最新 30% 对话
 </div>
 </div>
 </div>
 </div>

 <div className="mt-4 grid grid-cols-3 gap-4 text-center">
 <div className="bg-surface rounded-lg p-3">
 <div className="text-xl font-bold text-heading">70%</div>
 <div className="text-xs text-dim">压缩阈值</div>
 </div>
 <div className="bg-surface rounded-lg p-3">
 <div className="text-xl font-bold text-heading">
 30%
 </div>
 <div className="text-xs text-dim">保留比例</div>
 </div>
 <div className="bg-surface rounded-lg p-3">
 <div className="text-xl font-bold text-heading">LLM</div>
 <div className="text-xs text-dim">摘要生成</div>
 </div>
 </div>
 </div>
 );
}

// ===== Loop Detection Visualization =====
function LoopDetectionVisualization() {
 const [detectionType, setDetectionType] = useState<
 'tool' | 'content' | 'llm'
 >('tool');

 const detections = {
 tool: {
 title: '工具调用循环',
 threshold: '5 次相同调用',
 icon: '🔧',
 example: [
 { call: 'ReadFile(a.ts)', ok: true },
 { call: 'ReadFile(a.ts)', ok: true },
 { call: 'ReadFile(a.ts)', ok: true },
 { call: 'ReadFile(a.ts)', ok: true },
 { call: 'ReadFile(a.ts)', ok: false },
 ],
 },
 content: {
 title: '内容重复循环',
 threshold: '10 次相同片段',
 icon: '📝',
 example: [
 { call: '"let me try..."', ok: true },
 { call: '"let me try..."', ok: true },
 { call: '... (重复)', ok: true },
 { call: '"let me try..."', ok: false },
 ],
 },
 llm: {
 title: 'LLM 认知循环',
 threshold: '30 轮后检测',
 icon: '🧠',
 example: [
 { call: 'Turn 30: 检查循环', ok: true },
 { call: 'LLM 分析对话模式', ok: true },
 { call: '发现认知困境', ok: false },
 ],
 },
 };

 const current = detections[detectionType];

 return (
 <div className="bg-surface rounded-lg p-6 border border-edge">
 <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 循环检测机制
 </h3>

 <div className="flex gap-2 mb-4">
 {(['tool', 'content', 'llm'] as const).map((type) => (
 <button
 key={type}
 onClick={() => setDetectionType(type)}
 className={`px-3 py-1 rounded text-sm transition-colors ${
 detectionType === type
 ? 'bg-[var(--color-warning)] text-heading'
 : ' bg-surface text-dim hover:text-heading'
 }`}
 >
 {detections[type].icon} {detections[type].title}
 </button>
 ))}
 </div>

 <div className="bg-base rounded-lg p-4">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-2xl">{current.icon}</span>
 <span className="text-heading font-bold">{current.title}</span>
 <span className="text-xs text-dim">
 阈值: {current.threshold}
 </span>
 </div>

 <div className="space-y-2">
 {current.example.map((item, i) => (
 <div
 key={i}
 className={`flex items-center gap-2 px-3 py-2 rounded ${
 item.ok
 ? ' bg-elevated/10'
 : 'bg-elevated border-l-2 border-l-edge-hover/50'
 }`}
 >
 <span>{item.ok ? '✓' : '⚠️'}</span>
 <span
 className={`font-mono text-sm ${item.ok ? 'text-body' : 'text-heading'}`}
 >
 {item.call}
 </span>
 {!item.ok && (
 <span className="ml-auto text-xs text-heading">检测到循环!</span>
 )}
 </div>
 ))}
 </div>
 </div>

 <div className="mt-4 p-3 bg-surface rounded-lg text-xs text-dim">
 <strong>智能排除</strong>：代码块内的重复模式会被忽略（如
 import 语句、常见模板）
 </div>
 </div>
 );
}

// ===== Main Export =====
export function ServicesArchitecture() {
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);

 const relatedPages: RelatedPage[] = [
 { id: 'startup-chain', label: '启动链', description: '服务初始化流程' },
 { id: 'gemini-chat', label: 'GeminiChatCore', description: 'AI 核心服务' },
 { id: 'tool-arch', label: '工具系统', description: '工具服务' },
 { id: 'mcp', label: 'MCP集成', description: 'MCP 服务' },
 { id: 'config', label: '配置系统', description: '配置服务' },
 { id: 'memory', label: '上下文管理', description: '上下文服务' },
 ];

 return (
 <div>
 <Introduction
 isExpanded={isIntroExpanded}
 onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
 />

 {/* Core Services Overview */}
 <Layer title="Core 层服务">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <Module

 name="FileDiscoveryService"
 path="packages/core/src/services"
 description="基于 .gitignore 和 .geminiignore 过滤文件"
 />
 <Module

 name="ShellExecutionService"
 path="packages/core/src/services"
 description="跨平台 Shell 执行，支持 PTY"
 />
 <Module

 name="ChatRecordingService"
 path="packages/core/src/services"
 description="对话历史持久化存储"
 />
 <Module

 name="ChatCompressionService"
 path="packages/core/src/services"
 description="超长对话自动压缩"
 />
 <Module

 name="LoopDetectionService"
 path="packages/core/src/services"
 description="检测并阻止 AI 响应循环"
 />
 <Module

 name="GitService"
 path="packages/core/src/services"
 description="影子 Git 仓库管理快照"
 />
 </div>

 <HighlightBox title="设计特点" variant="blue" className="mt-4">
 <ul className="space-y-1">
 <li>
 • <strong>无状态设计</strong>：大多数服务是纯函数，易于测试
 </li>
 <li>
 • <strong>接口抽象</strong>：FileSystemService
 使用接口定义，支持 Mock
 </li>
 <li>
 • <strong>单例模式</strong>：ChatRecordingService 保持会话状态
 </li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* CLI Services */}
 <Layer title="CLI 层服务">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Module

 name="CommandService"
 path="packages/cli/src/services"
 description="斜杠命令发现与加载编排"
 />
 <Module

 name="BuiltinCommandLoader"
 path="packages/cli/src/services"
 description="加载 30+ 内置命令"
 />
 <Module

 name="FileCommandLoader"
 path="packages/cli/src/services"
 description="从 .toml 文件加载自定义命令"
 />
 <Module

 name="McpPromptLoader"
 path="packages/cli/src/services"
 description="从 MCP 服务器加载 Prompt"
 />
 </div>

 <div className="mt-4">
 <CodeBlock
 title="命令加载顺序 (FileCommandLoader)"
 language="typescript"
 code={`// 加载优先级（后加载覆盖前面）
const loadOrder = [
 "~/.gemini/commands/", // 1. 用户命令（最低优先级）
 ".gemini/commands/", // 2. 项目命令
 "<extension>/commands/" // 3. 扩展命令（按字母排序）
];

// 冲突处理：扩展命令重命名为 extensionName.commandName`}
 />
 </div>
 </Layer>

 {/* Service Dependency Graph */}
 <Layer title="服务依赖关系">
 <ServiceDependencyGraph />

 {/* Comprehensive Architecture Diagram */}
 <div className="mt-6 bg-surface rounded-lg p-6 border border-edge">
 <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 <span>🏗️</span> 服务架构全景图
 </h3>

 <MermaidDiagram chart={`
graph TB
 subgraph CLI["📱 CLI 层 (packages/cli)"]
 subgraph Commands["命令系统"]
 CS[CommandService]
 BCL[BuiltinCommandLoader]
 FCL[FileCommandLoader]
 MPL[McpPromptLoader]
 end

 subgraph Processors["处理器链"]
 AFP[AtFileProcessor]
 SP[ShellProcessor]
 AP[ArgumentProcessor]
 end

 subgraph UI["UI 组件"]
 SCP[SlashCommandProcessor]
 HM[HistoryManager]
 SC[SessionContext]
 end
 end

 subgraph Core["⚙️ Core 层 (packages/core)"]
 subgraph Generation["内容生成"]
 CGP[ContentGenerationPipeline]
 TSR[ToolSchedulerRunner]
 RT[RequestTokenizer]
 end

 subgraph Services["核心服务"]
 FDS[FileDiscoveryService]
 SES[ShellExecutionService]
 CRS[ChatRecordingService]
 CCS[ChatCompressionService]
 LDS[LoopDetectionService]
 GS[GitService]
 end

 subgraph MCP["MCP 集成"]
 MCPClient[MCPClient]
 MCPServer[MCPServer]
 end

 subgraph Tokenizer["Token 计算"]
 IT[ImageTokenizer]
 TT[TextTokenizer]
 end
 end

 subgraph External["🌐 外部依赖"]
 AI[AI API]
 FS[文件系统]
 PTY[PTY/Shell]
 Git[Git]
 end

 %% 命令系统依赖
 CS --> BCL
 CS --> FCL
 CS --> MPL
 FCL --> AFP
 FCL --> SP
 FCL --> AP

 %% UI 层依赖
 SCP --> CS
 SCP --> HM
 SCP --> SC

 %% 处理器依赖核心服务
 SP --> SES

 %% 内容生成依赖
 CGP --> TSR
 CGP --> RT
 CGP --> LDS
 TSR --> CRS

 %% Token 计算
 RT --> IT
 RT --> TT

 %% 核心服务依赖外部
 SES --> PTY
 FDS --> FS
 GS --> Git
 CGP --> AI

 %% MCP 集成
 MPL --> MCPClient
 TSR --> MCPServer

 style CLI stroke:${getThemeColor("--color-info", "#2457a6")}
 style Core stroke:#00ff88
 style External stroke:${getThemeColor("--color-warning", "#b45309")}
`} />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-elevated/10 rounded-lg p-4 border border-edge/30">
 <h4 className="font-bold text-heading mb-2">CLI 层职责</h4>
 <ul className="text-sm text-body space-y-1">
 <li>命令发现与加载编排</li>
 <li>用户输入预处理</li>
 <li>UI 状态管理</li>
 <li>会话生命周期</li>
 </ul>
 </div>
 <div className="bg-elevated/10 rounded-lg p-4 border border-edge/30">
 <h4 className="font-bold text-heading mb-2">Core 层职责</h4>
 <ul className="text-sm text-body space-y-1">
 <li>AI 交互与内容生成</li>
 <li>工具执行调度</li>
 <li>Token 计算与优化</li>
 <li>底层服务封装</li>
 </ul>
 </div>
 <div className="pl-5 border-l-2 border-l-edge-hover border-l-edge-hover">
 <h4 className="font-bold text-heading mb-2">外部依赖</h4>
 <ul className="text-sm text-body space-y-1">
 <li>AI API (Gemini/OpenAI)</li>
 <li>文件系统操作</li>
 <li>PTY/Shell 执行</li>
 <li>Git 版本控制</li>
 </ul>
 </div>
 </div>
 </div>

 {/* Data Flow Diagram */}
 <div className="mt-6 bg-surface rounded-lg p-6 border border-edge">
 <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 服务间数据流
 </h3>

 <MermaidDiagram chart={`
sequenceDiagram
 participant User as 👤 用户
 participant CLI as 📱 CLI 层
 participant Cmd as 📋 CommandService
 participant Proc as ⚙️ PromptProcessor
 participant Core as 🧠 Core 层
 participant Tool as 🔧 工具服务
 participant AI as 🤖 AI API

 User->>CLI: /review @src/main.ts
 CLI->>Cmd: parseSlashCommand()
 Cmd->>Cmd: 匹配 FileCommandLoader 命令
 Cmd->>Proc: process(prompt, context)

 rect rgb(230, 230, 250)
 Note over Proc: 处理器链执行
 Proc->>Proc: AtFileProcessor: 读取文件
 Proc->>Proc: ShellProcessor: 执行命令
 Proc->>Proc: ArgumentProcessor: 替换占位符
 end

 Proc-->>Cmd: 处理后的 prompt
 Cmd-->>CLI: { type: 'submit_prompt', content }
 CLI->>Core: submitToAI(content)

 rect rgb(230, 250, 230)
 Note over Core,AI: 内容生成循环
 Core->>AI: 发送请求
 AI-->>Core: 响应 (可能含工具调用)
 Core->>Tool: 执行工具
 Tool-->>Core: 工具结果
 Core->>AI: 发送工具结果
 end

 AI-->>Core: 最终响应
 Core-->>CLI: 显示结果
 CLI-->>User: 渲染输出
`} />
 </div>

 {/* Package Dependency Matrix */}
 <div className="mt-6 bg-surface rounded-lg p-6 border border-edge">
 <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 包依赖矩阵
 </h3>

 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">服务</th>
 <th className="text-center py-2 px-3 text-dim">所在包</th>
 <th className="text-center py-2 px-3 text-dim">依赖服务</th>
 <th className="text-center py-2 px-3 text-dim">被依赖</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">CommandService</td>
 <td className="py-2 px-3 text-center text-heading">cli</td>
 <td className="py-2 px-3 text-center">Loaders × 3</td>
 <td className="py-2 px-3 text-center">SlashCommandProcessor</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">FileCommandLoader</td>
 <td className="py-2 px-3 text-center text-heading">cli</td>
 <td className="py-2 px-3 text-center">PromptProcessors</td>
 <td className="py-2 px-3 text-center">CommandService</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">ContentGenerationPipeline</td>
 <td className="py-2 px-3 text-center text-heading">core</td>
 <td className="py-2 px-3 text-center">Tokenizer, LoopDetection</td>
 <td className="py-2 px-3 text-center">GeminiChat</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">ToolSchedulerRunner</td>
 <td className="py-2 px-3 text-center text-heading">core</td>
 <td className="py-2 px-3 text-center">ChatRecording, MCP</td>
 <td className="py-2 px-3 text-center">Pipeline</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">ShellExecutionService</td>
 <td className="py-2 px-3 text-center text-heading">core</td>
 <td className="py-2 px-3 text-center">node-pty, xterm</td>
 <td className="py-2 px-3 text-center">BashTool, ShellProcessor</td>
 </tr>
 <tr>
 <td className="py-2 px-3 font-mono text-heading">GitService</td>
 <td className="py-2 px-3 text-center text-heading">core</td>
 <td className="py-2 px-3 text-center">simple-git</td>
 <td className="py-2 px-3 text-center">RestoreCommand, Checkpointing</td>
 </tr>
 </tbody>
 </table>
 </div>

 <div className="mt-4 p-3 bg-surface rounded-lg text-xs text-dim">
 <strong>设计原则</strong>：Core 层服务不依赖 CLI 层，保证核心逻辑可独立测试和复用。
 CLI 层单向依赖 Core 层，形成清晰的层次结构。
 </div>
 </div>
 </Layer>

 {/* Prompt Processor Pipeline */}
 <Layer title="Prompt 处理管道">
 <PromptProcessorPipeline />

 <div className="mt-4">
 <CodeBlock
 title="处理器管道示例"
 language="typescript"
 code={`// 自定义命令 .toml 示例
prompt = """
当前分支: !{git branch --show-current}
文件内容: @{{{args}}}
请分析上述代码
"""

// 处理流程:
// 1. AtFileProcessor: @{file} → 读取文件内容
// 2. ShellProcessor: !{cmd} → 执行 git 命令
// 3. ArgumentProcessor: {{args}} → 替换用户输入`}
 />
 </div>
 </Layer>

 {/* Chat Compression */}
 <Layer title="对话压缩服务">
 <CompressionVisualization />

 <div className="mt-4">
 <CodeBlock
 title="压缩策略"
 language="typescript"
 code={`const COMPRESSION_TOKEN_THRESHOLD = 0.7; // 使用 70% 上下文时触发
const COMPRESSION_PRESERVE_THRESHOLD = 0.3; // 保留最新 30%

// 压缩流程:
// 1. 找到安全分割点（用户消息，无待处理的函数响应）
// 2. 用 LLM 生成旧对话摘要
// 3. 替换旧内容: [摘要] + [AI确认] + [最新对话]
// 4. 验证压缩效果后应用`}
 />
 </div>
 </Layer>

 {/* Loop Detection */}
 <Layer title="循环检测服务">
 <LoopDetectionVisualization />

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
 <div className="bg-surface rounded-lg p-4 border border-edge">
 <div className="text-heading font-bold mb-2">
 工具调用循环
 </div>
 <div className="text-sm text-body">
 检测连续 <strong>5 次</strong> 完全相同的工具调用
 </div>
 </div>
 <div className="bg-surface rounded-lg p-4 border border-edge">
 <div className="text-heading font-bold mb-2">
 内容重复循环
 </div>
 <div className="text-sm text-body">
 检测 <strong>10 次</strong> 50 字符相同片段
 </div>
 </div>
 <div className="bg-surface rounded-lg p-4 border border-edge">
 <div className="text-heading font-bold mb-2">
 LLM 认知循环
 </div>
 <div className="text-sm text-body">
 <strong>30 轮</strong> 后用 LLM 分析对话模式
 </div>
 </div>
 </div>
 </Layer>

 {/* Shell Execution Details */}
 <Layer title="Shell 执行服务">
 <HighlightBox title="执行方式降级链" variant="green">
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <span className="text-heading">1.</span>
 <span>
 <strong>lydell-node-pty</strong> - 首选，完整 PTY
 支持（调整大小、滚动）
 </span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-heading">2.</span>
 <span>
 <strong>node-pty</strong> - 备选 PTY 实现
 </span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-heading">3.</span>
 <span>
 <strong>child_process</strong> - 最后降级，无 PTY 支持
 </span>
 </div>
 </div>
 </HighlightBox>

 <div className="mt-4">
 <CodeBlock
 title="跨平台命令执行"
 language="typescript"
 code={`// 平台适配
const shell = process.platform === 'win32'
 ? 'cmd.exe'
 : 'bash';

// 特性支持
- 实时输出流 (onOutputEvent 回调)
- 二进制内容检测 (检查前 4KB)
- 信号处理: SIGTERM → 等待 → SIGKILL
- ANSI 颜色: 使用 @xterm/headless 终端仿真
- 窗口调整: writeToPty / resizePty / scrollPty`}
 />
 </div>
 </Layer>

 {/* GitService Details */}
 <Layer title="Git 服务">
 <HighlightBox title="影子仓库设计" variant="purple">
 <p className="mb-2">
 GitService 创建一个<strong>隔离的影子 Git 仓库</strong>
 用于快照和回滚，不影响用户的主仓库。
 </p>
 <ul className="space-y-1 text-sm">
 <li>
 • 存储位置: <code>.gemini/git/</code>
 </li>
 <li>隔离用户配置（name、email、GPG 签名）</li>
 <li>自动复制 .gitignore 规则</li>
 <li>使用 GIT_DIR 和 GIT_WORK_TREE 环境变量</li>
 </ul>
 </HighlightBox>

 <div className="mt-4">
 <CodeBlock
 title="快照操作"
 language="typescript"
 code={`// 创建快照
await gitService.createFileSnapshot("Aubefore edit");

// 恢复到指定快照
await gitService.restoreProjectFromSnapshot(commitHash);

// 获取当前状态
const currentHash = await gitService.getCurrentCommitHash();`}
 />
 </div>
 </Layer>

 {/* Design Patterns Summary */}
 <Layer title="设计模式总结">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <div className="bg-surface rounded-lg p-4 border border-edge/30">
 <div className="text-heading font-bold mb-2">
 工厂模式
 </div>
 <div className="text-sm text-dim">
 CommandService.create()
 <br />
 异步初始化 + 资源管理
 </div>
 </div>
 <div className="bg-surface rounded-lg p-4 border border-edge/30">
 <div className="text-heading font-bold mb-2">
 策略模式
 </div>
 <div className="text-sm text-dim">
 FileSystemService 接口
 <br />
 IPromptProcessor 接口
 </div>
 </div>
 <div className="pl-5 border-l-2 border-l-edge-hover border-l-edge-hover">
 <div className="text-heading font-bold mb-2">管道模式</div>
 <div className="text-sm text-dim">
 Prompt Processors
 <br />
 @File → Shell → Args
 </div>
 </div>
 <div className="bg-surface rounded-lg p-4 border border-edge/30">
 <div className="text-heading font-bold mb-2">外观模式</div>
 <div className="text-sm text-dim">
 FileDiscoveryService
 <br />
 封装多个 Parser
 </div>
 </div>
 <div className="pl-5 border-l-2 border-l-edge-hover border-l-edge-hover/30">
 <div className="text-heading font-bold mb-2">包装器模式</div>
 <div className="text-sm text-dim">
 GitService
 <br />
 封装 simple-git 库
 </div>
 </div>
 <div className="bg-surface rounded-lg p-4 border border-[var(--purple)]/30">
 <div className="text-heading font-bold mb-2">单例模式</div>
 <div className="text-sm text-dim">
 ChatRecordingService
 <br />
 会话级状态管理
 </div>
 </div>
 </div>
 </Layer>

 {/* Design Rationale Deep Dive */}
 <Layer title="设计原理深度解析">
 <div className="space-y-6">
 {/* FileSystemService Rationale */}
 <div className="bg-surface rounded-lg p-6 border border-edge/30">
 <h4 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 FileSystemService 接口设计
 </h4>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">为什么需要接口？
 </div>
 <p className="text-sm text-body">
 测试时需要 Mock 文件系统操作，避免真实 I/O。接口使得可以注入
 MockFileSystemService 进行隔离测试。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">如何实现？
 </div>
 <p className="text-sm text-body">
 定义 readTextFile / writeTextFile / findFiles 三个核心方法。
 StandardFileSystemService 实现实际操作，测试时替换为 Mock。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">带来的好处
 </div>
 <p className="text-sm text-body">
 单元测试无需触碰真实文件系统，测试速度快 10 倍以上。可模拟各种边界情况（权限错误、文件不存在等）。
 </p>
 </div>
 </div>

 <CodeBlock
 title="FileSystemService 接口定义"
 language="typescript"
 code={`interface FileSystemService {
 // 读取文本文件 - 返回 Promise 支持异步
 readTextFile(filePath: string): Promise<string>;

 // 写入文本文件 - 原子操作语义
 writeTextFile(filePath: string, content: string): Promise<void>;

 // 查找文件 - 使用 glob 模式匹配
 findFiles(fileName: string, searchPaths: readonly string[]): string[];
}

// 真实实现 - 生产环境使用
class StandardFileSystemService implements FileSystemService {
 async readTextFile(filePath: string) {
 return fs.readFile(filePath, 'utf-8');
 }
 // ...
}

// Mock 实现 - 测试环境使用
class MockFileSystemService implements FileSystemService {
 private files = new Map<string, string>();

 async readTextFile(filePath: string) {
 if (!this.files.has(filePath)) {
 throw new Error(\`File not found: \${filePath}\`);
 }
 return this.files.get(filePath)!;
 }
 // ...
}`}
 />
 </div>

 {/* Loop Detection Rationale */}
 <div className="bg-surface rounded-lg p-6 border-l-2 border-l-edge-hover">
 <h4 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 LoopDetectionService 阈值设计
 </h4>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">为什么是 5 次工具调用？
 </div>
 <p className="text-sm text-body">
 低于 5 次可能误判（如连续读取多个类似文件）。高于 5 次会浪费资源。5
 次是实验得出的平衡点。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">为什么是 10 次内容重复？
 </div>
 <p className="text-sm text-body">
 代码中常有重复结构（import 语句、模板代码）。10 次 + 50 字符阈值能区分正常重复和真正的循环。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">为什么 30 轮后 LLM 检测？
 </div>
 <p className="text-sm text-body">
 30 轮足够积累模式识别数据，同时避免频繁调用 LLM。使用 LLM
 能检测"思维循环"这类高级模式。
 </p>
 </div>
 </div>

 <CodeBlock
 title="循环检测三层策略"
 language="typescript"
 code={`// 阈值常量 - 经过实验调优
const TOOL_CALL_LOOP_THRESHOLD = 5; // 工具调用循环
const CONTENT_LOOP_THRESHOLD = 10; // 内容重复循环
const CONTENT_SIMILARITY_LENGTH = 50; // 相似性检测字符数
const LLM_CHECK_AFTER_TURNS = 30; // LLM 检测触发点

// 层级检测策略
// Level 1: 快速检测 (O(1)) - 检查是否连续调用完全相同的工具
function checkToolCallLoop(history: ToolCall[]): boolean {
 const recent = history.slice(-TOOL_CALL_LOOP_THRESHOLD);
 if (recent.length < TOOL_CALL_LOOP_THRESHOLD) return false;
 return recent.every(call =>
 call.name === recent[0].name &&
 JSON.stringify(call.args) === JSON.stringify(recent[0].args)
 );
}

// Level 2: 中速检测 (O(n)) - 检查内容重复模式
function checkContentLoop(responses: string[]): boolean {
 const chunks = extractChunks(responses, CONTENT_SIMILARITY_LENGTH);
 return countOccurrences(chunks) >= CONTENT_LOOP_THRESHOLD;
}

// Level 3: 深度检测 (LLM) - 检测高级思维循环
async function checkCognitiveLoop(context: Context): Promise<boolean> {
 if (context.turnCount < LLM_CHECK_AFTER_TURNS) return false;
 return await askLLM("分析以下对话是否陷入认知循环", context);
}`}
 />
 </div>

 {/* Shell Execution Rationale */}
 <div className="bg-surface rounded-lg p-6 border border-edge/30">
 <h4 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 ShellExecutionService 降级策略
 </h4>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">为什么需要 PTY？
 </div>
 <p className="text-sm text-body">
 PTY 提供真实终端体验：ANSI 颜色、窗口调整、信号处理。不使用
 PTY 时，交互式程序（如 vim、top）无法正常工作。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">降级链如何工作？
 </div>
 <p className="text-sm text-body">
 首选 lydell-node-pty（最完整），失败则尝试
 node-pty，最后降级到 child_process（无 PTY 支持）。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">xterm/headless 的作用
 </div>
 <p className="text-sm text-body">
 使用 @xterm/headless 终端仿真器处理 ANSI 转义序列。可以正确渲染颜色输出，同时保持 CLI 轻量。
 </p>
 </div>
 </div>

 <CodeBlock
 title="PTY 执行与降级"
 language="typescript"
 code={`// PTY 执行服务 - 分层降级策略
async function executeWithPty(command: string, options: PtyOptions) {
 // 尝试 1: lydell-node-pty (最完整的功能支持)
 try {
 const lydellPty = await import('@lydell/node-pty');
 return createPtyProcess(lydellPty, command, options);
 } catch {
 console.debug('lydell-node-pty not available');
 }

 // 尝试 2: node-pty (备选实现)
 try {
 const nodePty = await import('node-pty');
 return createPtyProcess(nodePty, command, options);
 } catch {
 console.debug('node-pty not available');
 }

 // 尝试 3: child_process (最后降级，无 PTY)
 console.warn('Falling back to child_process, PTY features disabled');
 return executeWithChildProcess(command, options);
}

// ANSI 处理 - 使用 xterm 终端仿真器
function processOutput(data: string): string {
 const terminal = new Terminal({ cols: 120, rows: 24 });
 terminal.write(data);

 // 序列化终端缓冲区，保留颜色信息
 return serializeTerminalBuffer(terminal.buffer);
}`}
 />
 </div>

 {/* Git Service Rationale */}
 <div className="bg-surface rounded-lg p-6 border border-edge/30">
 <h4 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 GitService 影子仓库设计
 </h4>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">为什么用影子仓库？
 </div>
 <p className="text-sm text-body">
 直接操作用户仓库会污染 git history。影子仓库完全隔离，用户的
 commit、branch 不受影响，可安全回滚。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">隔离如何实现？
 </div>
 <p className="text-sm text-body">
 使用 GIT_DIR 指向 .gemini/git/，GIT_WORK_TREE
 指向项目根目录。还覆盖 user.name/email 防止泄露用户信息。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">快照的价值
 </div>
 <p className="text-sm text-body">
 每次危险操作前自动快照。用户可随时回滚到任意快照点。比文件备份更高效（只存储差异）。
 </p>
 </div>
 </div>

 <CodeBlock
 title="影子 Git 仓库实现"
 language="typescript"
 code={`// GitService - 影子仓库管理
class GitService {
 private shadowGitDir: string; // .gemini/git/
 private workTree: string; // 项目根目录

 constructor(projectRoot: string) {
 this.shadowGitDir = path.join(projectRoot, '.gemini', 'git');
 this.workTree = projectRoot;
 }

 // 初始化影子仓库
 async initialize() {
 // 创建隔离的 git 目录
 await fs.mkdir(this.shadowGitDir, { recursive: true });

 // 初始化 bare 仓库
 await this.git('init', '--bare');

 // 设置隔离的用户配置（不影响用户全局配置）
 await this.git('config', 'user.name', 'Gemini CLI');
 await this.git('config', 'user.email', 'noreply@gemini.local');

 // 禁用 GPG 签名
 await this.git('config', 'commit.gpgSign', 'false');

 // 复制项目的 .gitignore
 await this.copyGitignore();
 }

 // 创建快照
 async createSnapshot(message: string): Promise<string> {
 await this.git('add', '-A');
 const result = await this.git('commit', '-m', message);
 return this.getCurrentHash();
 }

 // 恢复到快照
 async restoreSnapshot(hash: string) {
 await this.git('checkout', hash, '--', '.');
 }

 // 执行 git 命令（使用环境变量隔离）
 private async git(...args: string[]) {
 return execFile('git', args, {
 env: {
 ...process.env,
 GIT_DIR: this.shadowGitDir, // 使用影子目录
 GIT_WORK_TREE: this.workTree, // 指向项目
 GIT_CONFIG_NOSYSTEM: '1', // 忽略系统配置
 },
 });
 }
}`}
 />
 </div>

 {/* Compression Service Rationale */}
 <div className="bg-surface rounded-lg p-6 border-l-2 border-l-edge-hover">
 <h4 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
 ChatCompressionService 压缩策略
 </h4>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">为什么是 70% 触发？
 </div>
 <p className="text-sm text-body">
 70% 留有 30% 余量应对峰值。太早压缩浪费上下文；太晚压缩可能无法完成（LLM
 需要生成摘要的空间）。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">为什么保留 30%？
 </div>
 <p className="text-sm text-body">
 30% 保留最近的上下文，包括当前任务的关键信息。少于 30%
 可能丢失重要工具调用结果。
 </p>
 </div>
 <div className="bg-base rounded-lg p-4">
 <div className="text-xs text-heading font-bold mb-2">分割点如何选择？
 </div>
 <p className="text-sm text-body">
 必须在用户消息边界分割，不能切断 AI 的工具调用链（否则会丢失上下文）。使用
 findCompressSplitPoint 算法。
 </p>
 </div>
 </div>

 <CodeBlock
 title="压缩分割点算法"
 language="typescript"
 code={`// 找到安全的压缩分割点
function findCompressSplitPoint(
 messages: Message[],
 targetPercentage: number // 通常是 0.7
): number {
 const totalTokens = countTotalTokens(messages);
 const targetTokens = totalTokens * targetPercentage;

 let tokenCount = 0;
 let lastSafeIndex = 0;

 for (let i = 0; i < messages.length; i++) {
 const msg = messages[i];
 tokenCount += msg.tokenCount;

 // 安全点条件:
 // 1. 是用户消息 (role === 'user')
 // 2. 不在工具调用链中间 (没有待处理的 function_call)
 // 3. 不是系统消息 (role !== 'system')
 if (isSafeSplitPoint(msg, messages, i)) {
 lastSafeIndex = i;
 }

 // 超过目标 token 数后，返回最后一个安全点
 if (tokenCount >= targetTokens) {
 return lastSafeIndex;
 }
 }

 return lastSafeIndex;
}

// 判断是否是安全分割点
function isSafeSplitPoint(
 msg: Message,
 allMessages: Message[],
 index: number
): boolean {
 // 必须是用户消息
 if (msg.role !== 'user') return false;

 // 检查后续消息是否有待处理的工具响应
 const nextMsg = allMessages[index + 1];
 if (nextMsg?.role === 'assistant' && nextMsg.function_call) {
 return false; // 不能在工具调用之前分割
 }

 return true;
}`}
 />
 </div>
 </div>
 </Layer>

 {/* Service Dependency Injection Pattern */}
 <Layer title="服务依赖注入模式">
 <HighlightBox title="Config 对象模式" variant="blue">
 <p className="mb-3 text-sm">
 Gemini CLI 使用 <strong>Config 对象</strong> 作为依赖注入的载体，而非传统的 DI 容器。
 这种轻量级方案减少了复杂度，同时保持了可测试性。
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <div className="text-xs text-heading font-bold mb-2">
 优点
 </div>
 <ul className="text-sm text-body space-y-1">
 <li>无需 DI 框架，减少依赖</li>
 <li>类型安全，IDE 支持好</li>
 <li>测试时可轻松替换 Mock</li>
 </ul>
 </div>
 <div>
 <div className="text-xs text-heading font-bold mb-2">
 权衡
 </div>
 <ul className="text-sm text-body space-y-1">
 <li>Config 对象可能变得臃肿</li>
 <li>需要手动传递依赖</li>
 <li>不支持自动生命周期管理</li>
 </ul>
 </div>
 </div>
 </HighlightBox>

 <div className="mt-4">
 <CodeBlock
 title="Config 对象依赖注入示例"
 language="typescript"
 code={`// Config 对象定义 (packages/core/src/config/config.ts)
export interface Config {
 // 核心服务
 fileSystem: FileSystemService;
 chatRecording: ChatRecordingService;
 loopDetection: LoopDetectionService;

 // 配置值
 model: string;
 timeout: number;
 sandbox: SandboxConfig;

 // 可选服务（延迟加载）
 git?: GitService;
}

// 创建生产环境 Config
function createProductionConfig(): Config {
 return {
 fileSystem: new StandardFileSystemService(),
 chatRecording: new ChatRecordingService(),
 loopDetection: new LoopDetectionService(),
 model: 'gemini-1.5-flash',
 timeout: 30000,
 sandbox: loadSandboxConfig(),
 };
}

// 创建测试环境 Config
function createTestConfig(overrides?: Partial<Config>): Config {
 return {
 fileSystem: new MockFileSystemService(),
 chatRecording: new MockChatRecordingService(),
 loopDetection: new MockLoopDetectionService(),
 model: 'test-model',
 timeout: 1000,
 sandbox: { enabled: false },
 ...overrides, // 允许覆盖特定服务
 };
}

// 在工具中使用 Config
async function executeTool(
 tool: Tool,
 config: Config // 通过参数注入
): Promise<ToolResult> {
 // 使用 config 中的服务
 const content = await config.fileSystem.readTextFile(tool.path);

 // 检测循环
 if (config.loopDetection.isLooping(tool)) {
 throw new LoopError('Tool execution loop detected');
 }

 return { success: true, content };
}`}
 />
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
