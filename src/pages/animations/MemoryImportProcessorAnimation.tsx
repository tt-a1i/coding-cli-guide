import { useState, useEffect, useCallback } from 'react';
import { Layer } from '../../components/Layer';
import { MermaidDiagram } from '../../components/MermaidDiagram';
import { HighlightBox } from '../../components/HighlightBox';
import { CodeBlock } from '../../components/CodeBlock';
import { getThemeColor } from '../../utils/theme';



interface ProcessingStep {
 id: number;
 action: string;
 file: string;
 detail: string;
 processedFiles: string[];
 currentDepth: number;
 result?: 'success' | 'circular' | 'max-depth' | 'error';
}

export function MemoryImportProcessorAnimation() {
 const [currentStep, setCurrentStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);
 const [speed, setSpeed] = useState(1500);

 // Simulated import tree
 const steps: ProcessingStep[] = [
 {
 id: 0,
 action: 'START',
 file: 'GEMINI.md',
 detail: '开始处理根文件，初始化 ImportState',
 processedFiles: [],
 currentDepth: 0,
 },
 {
 id: 1,
 action: 'FIND_IMPORTS',
 file: 'GEMINI.md',
 detail: '扫描 @imports，发现 3 个导入: @config.md, @prompts.md, @tools.md',
 processedFiles: ['GEMINI.md'],
 currentDepth: 0,
 },
 {
 id: 2,
 action: 'VALIDATE_PATH',
 file: 'config.md',
 detail: '验证路径安全性: 检查是否在 projectRoot 内，拒绝 URL 和路径遍历',
 processedFiles: ['GEMINI.md'],
 currentDepth: 0,
 },
 {
 id: 3,
 action: 'PROCESS_IMPORT',
 file: 'config.md',
 detail: '递归处理 config.md (depth: 1)',
 processedFiles: ['GEMINI.md', 'config.md'],
 currentDepth: 1,
 },
 {
 id: 4,
 action: 'FIND_IMPORTS',
 file: 'config.md',
 detail: '扫描 config.md，发现 1 个导入: @settings.md',
 processedFiles: ['GEMINI.md', 'config.md'],
 currentDepth: 1,
 },
 {
 id: 5,
 action: 'PROCESS_IMPORT',
 file: 'settings.md',
 detail: '递归处理 settings.md (depth: 2)',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md'],
 currentDepth: 2,
 },
 {
 id: 6,
 action: 'FIND_IMPORTS',
 file: 'settings.md',
 detail: '扫描 settings.md，发现导入: @GEMINI.md',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md'],
 currentDepth: 2,
 },
 {
 id: 7,
 action: 'CIRCULAR_DETECTED',
 file: 'GEMINI.md',
 detail: '🔄 检测到循环引用! GEMINI.md 已在 processedFiles 中',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md'],
 currentDepth: 2,
 result: 'circular',
 },
 {
 id: 8,
 action: 'BACKTRACK',
 file: 'config.md',
 detail: '回溯到 config.md，继续处理其他导入',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md'],
 currentDepth: 1,
 },
 {
 id: 9,
 action: 'PROCESS_IMPORT',
 file: 'prompts.md',
 detail: '处理 prompts.md (depth: 1)',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md', 'prompts.md'],
 currentDepth: 1,
 },
 {
 id: 10,
 action: 'FIND_IMPORTS',
 file: 'prompts.md',
 detail: '扫描 prompts.md，发现深层导入链',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md', 'prompts.md'],
 currentDepth: 1,
 },
 {
 id: 11,
 action: 'DEEP_RECURSION',
 file: 'deep/level4.md',
 detail: '递归到 depth: 4...',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md', 'prompts.md', 'deep/level2.md', 'deep/level3.md', 'deep/level4.md'],
 currentDepth: 4,
 },
 {
 id: 12,
 action: 'MAX_DEPTH_REACHED',
 file: 'deep/level5.md',
 detail: '⚠️ 达到最大深度限制 (maxDepth: 5)，停止处理',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md', 'prompts.md', 'deep/level2.md', 'deep/level3.md', 'deep/level4.md'],
 currentDepth: 5,
 result: 'max-depth',
 },
 {
 id: 13,
 action: 'PROCESS_IMPORT',
 file: 'tools.md',
 detail: '处理最后一个根级导入 tools.md',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md', 'prompts.md', 'deep/level2.md', 'deep/level3.md', 'deep/level4.md', 'tools.md'],
 currentDepth: 1,
 },
 {
 id: 14,
 action: 'BUILD_TREE',
 file: 'GEMINI.md',
 detail: '构建 MemoryFile 导入树',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md', 'prompts.md', 'deep/level2.md', 'deep/level3.md', 'deep/level4.md', 'tools.md'],
 currentDepth: 0,
 },
 {
 id: 15,
 action: 'COMPLETE',
 file: 'GEMINI.md',
 detail: '✅ 处理完成! 返回 ProcessImportsResult',
 processedFiles: ['GEMINI.md', 'config.md', 'settings.md', 'prompts.md', 'deep/level2.md', 'deep/level3.md', 'deep/level4.md', 'tools.md'],
 currentDepth: 0,
 result: 'success',
 },
 ];

 const step = steps[currentStep];

 useEffect(() => {
 if (!isPlaying) return;
 const timer = setTimeout(() => {
 if (currentStep < steps.length - 1) {
 setCurrentStep(prev => prev + 1);
 } else {
 setIsPlaying(false);
 }
 }, speed);
 return () => clearTimeout(timer);
 }, [isPlaying, currentStep, speed, steps.length]);

 const reset = useCallback(() => {
 setCurrentStep(0);
 setIsPlaying(false);
 }, []);

 const getActionColor = (action: string) => {
 switch (action) {
 case 'CIRCULAR_DETECTED': return 'text-heading';
 case 'MAX_DEPTH_REACHED': return 'text-heading';
 case 'COMPLETE': return 'text-heading';
 case 'PROCESS_IMPORT': return 'text-heading';
 case 'FIND_IMPORTS': return 'text-heading';
 case 'VALIDATE_PATH': return 'text-heading';
 default: return 'text-heading';
 }
 };

 const importStateDiagram = `
stateDiagram-v2
 [*] --> Pending: 发现 @import
 Pending --> Validating: 验证路径
 Validating --> Processing: 路径安全
 Validating --> Error: 路径不安全
 Processing --> FindImports: 读取文件内容
 FindImports --> Recursive: 发现子导入
 FindImports --> Processed: 无子导入
 Recursive --> CheckCircular: 检查循环
 CheckCircular --> CircularDetected: 文件已处理
 CheckCircular --> CheckDepth: 未处理
 CheckDepth --> MaxDepth: depth >= maxDepth
 CheckDepth --> Processing: 继续递归
 CircularDetected --> Processed: 跳过
 MaxDepth --> Processed: 停止
 Processed --> [*]
 Error --> [*]
`;

 const treeStructure = `
graph TD
 A["📄 GEMINI.md<br/>(root)"] --> B["📄 config.md"]
 A --> C["📄 prompts.md"]
 A --> D["📄 tools.md"]
 B --> E["📄 settings.md"]
 E -.->|"🔄 循环引用"| A
 C --> F["📁 deep/level2.md"]
 F --> G["📁 deep/level3.md"]
 G --> H["📁 deep/level4.md"]
 H -.->|"⚠️ 达到深度限制"| I["📁 deep/level5.md"]

 style A fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:#000
 style E fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:#fff
 style I fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:#000
`;

 return (
 <div className="space-y-8">
 {/* Header */}
 <div className="flex items-center gap-3 mb-6">
 <span className="text-3xl">🔗</span>
 <div>
 <h1 className="text-2xl font-bold text-heading">
 Memory Import Processor 动画
 </h1>
 <p className="text-body">
 循环依赖检测与深度限制处理
 </p>
 </div>
 </div>

 {/* Introduction */}
 <HighlightBox title="📚 机制介绍" variant="blue">
 <p className="mb-3">
 Memory Import Processor 处理 GEMINI.md 文件中的 <code>@path/to/file</code> 导入语法，
 递归解析所有引用的文件并合并内容。关键挑战是检测<strong>循环依赖</strong>和控制<strong>递归深度</strong>。
 </p>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
 <div className="bg-elevated p-3 rounded-lg">
 <div className="font-bold text-heading mb-1">ImportState</div>
 <div className="text-sm text-body">
 <code>processedFiles: Set&lt;string&gt;</code><br/>
 跟踪已处理文件，检测循环
 </div>
 </div>
 <div className="bg-elevated p-3 rounded-lg">
 <div className="font-bold text-heading mb-1">深度限制</div>
 <div className="text-sm text-body">
 <code>maxDepth: 5</code><br/>
 防止无限递归
 </div>
 </div>
 <div className="bg-elevated p-3 rounded-lg">
 <div className="font-bold text-heading mb-1">路径验证</div>
 <div className="text-sm text-body">
 <code>validateImportPath()</code><br/>
 防止路径遍历攻击
 </div>
 </div>
 </div>
 </HighlightBox>

 {/* Controls */}
 <div className="flex flex-wrap items-center gap-4 p-4 bg-surface rounded-lg border border-edge-hover">
 <button
 onClick={() => setIsPlaying(!isPlaying)}
 className="px-4 py-2 bg-elevated text-black font-bold rounded hover:opacity-80"
 >
 {isPlaying ? '⏸ 暂停' : '▶️ 播放'}
 </button>
 <button
 onClick={reset}
 className="px-4 py-2 bg-elevated text-heading rounded hover:opacity-80"
 >
 🔄 重置
 </button>
 <button
 onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
 disabled={currentStep === 0}
 className="px-3 py-2 bg-elevated text-heading rounded disabled:opacity-50"
 >
 ◀ 上一步
 </button>
 <button
 onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
 disabled={currentStep === steps.length - 1}
 className="px-3 py-2 bg-elevated text-heading rounded disabled:opacity-50"
 >
 下一步 ▶
 </button>
 <div className="flex items-center gap-2">
 <span className="text-body">速度:</span>
 <input
 type="range"
 min="500"
 max="3000"
 step="100"
 value={speed}
 onChange={(e) => setSpeed(Number(e.target.value))}
 className="w-24"
 />
 <span className="text-sm text-body">{speed}ms</span>
 </div>
 <div className="ml-auto text-body">
 步骤: {currentStep + 1} / {steps.length}
 </div>
 </div>

 {/* Current Step Visualization */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Left: Current Action */}
 <div className="bg-surface rounded-xl p-6 border border-edge-hover">
 <h3 className="text-lg font-bold text-heading mb-4">
 📍 当前操作
 </h3>

 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <span className={`font-mono font-bold ${getActionColor(step.action)}`}>
 {step.action}
 </span>
 {step.result === 'circular' && (
 <span className="px-2 py-1 bg-elevated text-heading text-sm rounded">
 循环检测
 </span>
 )}
 {step.result === 'max-depth' && (
 <span className="px-2 py-1 bg-elevated text-heading text-sm rounded">
 深度限制
 </span>
 )}
 {step.result === 'success' && (
 <span className="px-2 py-1 bg-elevated text-heading text-sm rounded">
 成功
 </span>
 )}
 </div>

 <div className="bg-base p-4 rounded-lg font-mono">
 <div className="text-body mb-2">文件:</div>
 <div className="text-heading text-lg">{step.file}</div>
 </div>

 <div className="text-body">
 {step.detail}
 </div>

 <div className="bg-base p-4 rounded-lg">
 <div className="text-sm text-body mb-2">
 ImportState:
 </div>
 <div className="font-mono text-sm space-y-1">
 <div>
 <span className="text-heading">currentDepth:</span>{' '}
 <span className="text-heading">{step.currentDepth}</span>
 <span className="text-body"> / 5 (max)</span>
 </div>
 <div>
 <span className="text-heading">processedFiles:</span>{' '}
 <span className="text-heading">[{step.processedFiles.length}]</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Right: Processed Files */}
 <div className="bg-surface rounded-xl p-6 border border-edge-hover">
 <h3 className="text-lg font-bold text-heading mb-4">
 📁 已处理文件 Set
 </h3>

 <div className="space-y-2 max-h-[400px] overflow-y-auto">
 {step.processedFiles.map((file, idx) => (
 <div
 key={file}
 className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
 file === step.file && step.action !== 'COMPLETE'
 ? ' bg-elevated/20 border border-edge'
 : ' bg-elevated'
 }`}
 >
 <span className="text-body font-mono text-sm w-6">
 {idx + 1}
 </span>
 <span className="text-heading">✓</span>
 <span className="font-mono">{file}</span>
 </div>
 ))}
 {step.processedFiles.length === 0 && (
 <div className="text-body italic p-4 text-center">
 Set 为空 - 尚未处理任何文件
 </div>
 )}
 </div>

 {/* Depth Indicator */}
 <div className="mt-4 pt-4 border-t border-edge-hover">
 <div className="text-sm text-body mb-2">递归深度:</div>
 <div className="flex gap-1">
 {[0, 1, 2, 3, 4, 5].map(d => (
 <div
 key={d}
 className={`h-8 flex-1 rounded flex items-center justify-center font-mono text-sm ${
 d === step.currentDepth
 ? d >= 5
 ? 'bg-[var(--color-danger)] text-heading'
 : ' bg-elevated text-black'
 : d < step.currentDepth
 ? ' bg-elevated/30 text-heading'
 : ' bg-elevated text-body'
 }`}
 >
 {d}
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* Import Tree Visualization */}
 <Layer title="📊 导入树结构" icon="🌲">
 <MermaidDiagram chart={treeStructure} />
 </Layer>

 {/* State Machine */}
 <Layer title="🔄 处理状态机" icon="⚙️">
 <MermaidDiagram chart={importStateDiagram} />
 </Layer>

 {/* Code Explanation */}
 <Layer title="💡 核心实现" icon="📝">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-base p-4 rounded-lg">
 <h4 className="text-heading font-bold mb-3">循环检测逻辑</h4>
 <CodeBlock
   language="typescript"
   title="循环检测逻辑"
   code={`interface ImportState {
  processedFiles: Set<string>;
  maxDepth: number;
  currentDepth: number;
  currentFile?: string;
}

// 检测循环
if (importState.processedFiles.has(fullPath)) {
  result += \`<!-- File already processed -->\`;
  continue; // 跳过已处理文件
}

// 标记为已处理
newImportState.processedFiles.add(fullPath);`}
 />
 </div>

 <div className="bg-base p-4 rounded-lg">
 <h4 className="text-heading font-bold mb-3">深度限制检查</h4>
 <CodeBlock
   language="typescript"
   title="深度限制检查"
   code={`// 深度检查
if (importState.currentDepth >= importState.maxDepth) {
  logger.warn(\`Maximum import depth reached\`);
  return {
    content,
    importTree: {
      path: importState.currentFile || 'unknown'
    },
  };
}

// 递归时增加深度
const newImportState: ImportState = {
  ...importState,
  currentDepth: importState.currentDepth + 1,
  currentFile: fullPath,
};`}
 />
 </div>
 </div>
 </Layer>

 {/* Design Rationale */}
 <HighlightBox title="🧠 设计考量" variant="green">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h4 className="font-bold text-heading mb-2">为什么用 Set 而不是数组?</h4>
 <p className="text-sm text-body">
 Set 的 <code>.has()</code> 操作是 O(1)，而数组的 <code>.includes()</code> 是 O(n)。
 在深度递归场景中，频繁检查会有性能差异。
 </p>
 </div>
 <div>
 <h4 className="font-bold text-heading mb-2">为什么深度限制是 5?</h4>
 <p className="text-sm text-body">
 5 层足够覆盖合理的文档结构，同时防止恶意或错误配置导致的无限递归。
 更深的嵌套通常意味着文档组织需要重构。
 </p>
 </div>
 </div>
 </HighlightBox>
 </div>
 );
}
