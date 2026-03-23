import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

// ============================================================
// 端到端走读 - 一次完整请求的全流程解析
// ============================================================

// 可折叠章节
function CollapsibleSection({
 title,
 icon,
 children,
 defaultOpen = false,
 highlight = false
}: {
 title: string;
 icon: string;
 children: React.ReactNode;
 defaultOpen?: boolean;
 highlight?: boolean;
}) {
 const [isOpen, setIsOpen] = useState(defaultOpen);

 return (
 <div className={`mb-6 rounded-lg border ${highlight ? ' border-edge bg-elevated/10' : ' border-edge/50 bg-surface/30'}`}>
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-elevated/20 transition-colors rounded-lg"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">{icon}</span>
 <span className={`text-lg font-semibold ${highlight ? 'text-heading' : 'text-heading'}`}>{title}</span>
 </div>
 <span className={`text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>
 {isOpen && (
 <div className="px-6 pb-6 border-t border-edge/30">
 {children}
 </div>
 )}
 </div>
 );
}

// 阶段卡片
function StageCard({ number, title, duration, description, keyPoints, sourceFiles }: {
 number: number;
 title: string;
 duration: string;
 description: string;
 keyPoints: string[];
 sourceFiles: { path: string; function: string }[];
}) {
 const colors = [
 '',
 '',
 '',
 '',
 '',
 '',
 ];

 return (
 <div className="my-4 rounded-lg border border-edge/50 overflow-hidden">
 <div className={` bg-surface ${colors[number % colors.length]} px-4 py-3 flex items-center gap-3`}>
 <div className="w-8 h-8 rounded-full bg-elevated/20 flex items-center justify-center text-heading font-bold">
 {number}
 </div>
 <div className="flex-1">
 <h4 className="text-heading font-semibold">{title}</h4>
 <span className="text-heading/70 text-xs">{duration}</span>
 </div>
 </div>
 <div className="p-4 bg-surface">
 <p className="text-body text-sm mb-3">{description}</p>
 <div className="mb-3">
 <h5 className="text-heading text-xs font-semibold mb-2">关键操作：</h5>
 <ul className="text-body text-xs space-y-1">
 {keyPoints.map((point, i) => (
 <li key={i} className="flex items-start gap-2">
 <span className="text-green-400">•</span>
 <span>{point}</span>
 </li>
 ))}
 </ul>
 </div>
 <div>
 <h5 className="text-heading text-xs font-semibold mb-2">源码位置：</h5>
 <div className="space-y-1">
 {sourceFiles.map((file, i) => (
 <div key={i} className="text-xs bg-surface rounded px-2 py-1">
 <code className="text-yellow-400">{file.path}</code>
 <span className="text-dim mx-2">→</span>
 <code className="text-heading">{file.function}</code>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}

export function EndToEndWalkthrough() {
 // 主流程图
 const e2eFlow = `flowchart TD
 start(["用户输入<br/>gemini 或交互式"])
 preprocess["消息预处理<br/>@file/@memory/@url"]
 buildReq["构建请求<br/>history + tools + system prompt"]
 stream["流式响应<br/>token/parts"]
 hasFc{"parts[].functionCall ?"}
 toolCalls["functionCall<br/>解析 + 校验"]
 approval["审批/沙箱/可信文件夹"]
 exec["执行工具"]
 addResult["结果入历史"]
 nextRound["下一轮请求"]
 final["最终输出"]
 persist["持久化<br/>日志/统计/记忆"]

 start --> preprocess --> buildReq --> stream --> hasFc
 hasFc -->|Yes| toolCalls --> approval --> exec --> addResult --> nextRound --> buildReq
 hasFc -->|No| final --> persist

 style start fill:#4a9eff,stroke:#2563eb,stroke-width:2px
 style final fill:#22c55e,stroke:#16a34a,stroke-width:2px
 style approval fill:#f59e0b,stroke:#d97706,stroke-width:2px`;

 // 详细时序图
 const sequenceDiagram = `sequenceDiagram
 participant User as 用户
 participant CLI as CLI 主进程
 participant Preproc as 预处理器
 participant API as LLM API
 participant Scheduler as 工具调度器
 participant Tool as 工具执行

 User->>CLI: 输入消息
 CLI->>Preproc: 解析 @file/@memory
 Preproc-->>CLI: 扩展后的消息

 CLI->>API: 流式请求
 loop 流式响应
 API-->>CLI: token chunk
 CLI-->>User: 实时渲染
 end

 alt parts[].functionCall 存在
 CLI->>Scheduler: 解析 functionCall
 Scheduler->>Scheduler: 参数校验
 Scheduler->>Scheduler: 审批检查
 Scheduler->>Tool: 执行工具
 Tool-->>Scheduler: 工具结果
 Scheduler-->>CLI: 结果入历史
 CLI->>API: 下一轮请求
 else 无 functionCall（文本输出）
 CLI-->>User: 最终输出
 CLI->>CLI: 持久化会话
 end`;

 return (
 <div>
 <h2 className="text-2xl text-heading mb-2">端到端走读</h2>
 <p className="text-body mb-6">
 一次完整请求从输入到输出的全流程深度解析
 </p>

 {/* 30秒快速理解 */}
 <div className="mb-8 p-6 rounded-lg bg-surface border border-edge">
 <h3 className="text-xl font-bold text-heading mb-4 flex items-center gap-2">
 <span>⚡</span> 30 秒快速理解
 </h3>
 <div className="space-y-3 text-body text-sm">
 <p>
 <strong className="text-heading">一句话主线：</strong>
 输入 → 预处理 → API 请求 → 流式响应 → 工具调用（循环）→ 最终输出 → 持久化
 </p>
 <ol className="list-decimal pl-5 space-y-1">
 <li>CLI 接收用户输入，先做 <code className="text-yellow-400">@file/@memory/@url</code> 等预处理</li>
 <li>把历史对话 + 系统提示词 + 工具定义组装成一次 API 请求，走<strong className="text-green-400">流式输出</strong></li>
 <li>如果响应中包含 <code className="text-yellow-400">functionCall</code>（<code>parts[].functionCall</code>），CLI 进入工具调度：校验参数 → 走审批/沙箱 → 执行工具</li>
 <li>工具结果以 <code className="text-yellow-400">functionResponse</code> 写回历史，再发起下一轮请求，直到不再出现 functionCall，输出最终答案</li>
 </ol>
 <div className="mt-3 text-xs text-body">
 注：Innies/Qwen 的 OpenAI 兼容层可能出现 <code>tool_calls</code>/<code>finish_reason=tool_calls</code>；上游 Gemini CLI 的核心链路以 <code>functionCall/functionResponse</code> 为准。
 </div>
 </div>
 </div>

 <Layer title="端到端流程图" icon="🗺️">
 <MermaidDiagram chart={e2eFlow} />
 <p className="text-sm text-dim mt-2 text-center">
 蓝色起点 → 黄色审批关卡 → 绿色终点
 </p>
 </Layer>

 <Layer title="详细时序图" icon="📊">
 <MermaidDiagram chart={sequenceDiagram} />
 </Layer>

 <CollapsibleSection title="阶段 1：用户输入与启动" icon="1️⃣" defaultOpen={true} highlight>
 <StageCard
 number={1}
 title="用户输入与启动"
 duration="~10ms"
 description="CLI 接收用户输入，可以是交互式输入或命令行参数。确定运行模式（交互/非交互）并初始化会话。"
 keyPoints={[
 '解析命令行参数 (yargs)',
 '加载配置文件 (~/.gemini/settings.json)',
 '初始化认证状态 (OAuth Token)',
 '恢复或创建新会话',
 ]}
 sourceFiles={[
 { path: 'packages/cli/index.ts', function: 'main()' },
 { path: 'packages/cli/src/nonInteractiveCli.ts', function: 'runNonInteractiveMode()' },
 { path: 'packages/cli/src/ui/hooks/useGeminiStream.ts', function: 'useGeminiStream()' },
 ]}
 />
 </CollapsibleSection>

 <CollapsibleSection title="阶段 2：消息预处理" icon="2️⃣" defaultOpen={true} highlight>
 <StageCard
 number={2}
 title="消息预处理"
 duration="~50-500ms"
 description="解析消息中的特殊引用（@file、@memory、@url），将其扩展为实际内容。这一步可能涉及文件读取、网络请求等 I/O 操作。"
 keyPoints={[
 '@file：读取文件内容并内联',
 '@memory：检索相关记忆片段',
 '@url：抓取网页内容',
 '图片/PDF 转换为 base64',
 '内容截断（超长文件只取部分）',
 ]}
 sourceFiles={[
 { path: 'packages/cli/src/services/promptProcessorService.ts', function: 'processPrompt()' },
 { path: 'packages/core/src/services/fileDiscoveryService.ts', function: 'discoverFiles()' },
 { path: 'packages/core/src/tools/read.ts', function: 'readFile()' },
 ]}
 />

 <div className="mt-4 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
 <h5 className="text-yellow-400 font-semibold mb-2">边界情况</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• <strong>文件不存在</strong>：报错但不中断，提示用户检查路径</li>
 <li>• <strong>二进制文件</strong>：跳过或提示不支持</li>
 <li>• <strong>超大文件</strong>：自动截断到配置限制（默认 10k 行）</li>
 <li>• <strong>循环引用</strong>：检测并阻止</li>
 </ul>
 </div>
 </CollapsibleSection>

 <CollapsibleSection title="阶段 3：构建 API 请求" icon="3️⃣" defaultOpen={true}>
 <StageCard
 number={3}
 title="构建 API 请求"
 duration="~5-20ms"
 description="将历史对话、系统提示词、工具定义组装成符合 API 规范的请求体。这一步涉及 Token 计算和上下文压缩。"
 keyPoints={[
 '组装 messages 数组（history + current）',
 '添加系统提示词（角色设定 + 工具说明）',
 '注入工具定义（tools schema）',
 'Token 计数与压缩（超限时裁剪历史）',
 '设置模型参数（temperature、max_tokens 等）',
 ]}
 sourceFiles={[
 { path: 'packages/core/src/core/geminiChat.ts', function: 'chat()' },
 { path: 'packages/core/src/core/contentGenerator.ts', function: 'generateContent()' },
 { path: 'packages/core/src/services/chatCompressionService.ts', function: 'compressIfNeeded()' },
 ]}
 />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="请求结构" variant="blue">
 <pre className="text-xs text-body overflow-x-auto">
{`{
 model: "gemini-1.5-pro",
 messages: [
 { role: "system", content: "..." },
 { role: "user", content: "..." },
 { role: "assistant", content: "..." },
 // ... 历史对话
 ],
 tools: [ /* 工具定义 */ ],
 stream: true,
 max_tokens: 8192
}`}
 </pre>
 </HighlightBox>
 <HighlightBox title="Token 预算分配" variant="green">
 <ul className="text-xs text-body space-y-1">
 <li>• 系统提示词：~2000 tokens (固定)</li>
 <li>• 工具定义：~1500 tokens (动态)</li>
 <li>• 历史对话：剩余空间 - 输出预留</li>
 <li>• 输出预留：max_tokens 配置值</li>
 </ul>
 </HighlightBox>
 </div>
 </CollapsibleSection>

 <CollapsibleSection title="阶段 4：流式响应处理" icon="4️⃣" defaultOpen={true}>
 <StageCard
 number={4}
 title="流式响应处理"
 duration="~1-60s（取决于响应长度）"
 description="接收 API 的流式响应，实时解析并渲染到终端。同时检测工具调用标记。"
 keyPoints={[
 '迭代读取 GenAI stream chunk',
 '增量 token 渲染到终端',
 '工具调用检测（parts[].functionCall）',
 'chunk 合并（text/parts 聚合）',
 '错误检测与重试触发',
 ]}
 sourceFiles={[
 { path: 'packages/core/src/core/contentGenerator.ts', function: 'streamContent()' },
 { path: 'packages/cli/src/ui/hooks/useGeminiStream.ts', function: 'processChunk()' },
 { path: 'packages/core/src/utils/streamingJsonParser.ts', function: 'parseIncremental()' },
 ]}
 />

 <div className="mt-4 p-4 bg-surface rounded-lg border border-edge">
 <h5 className="text-heading font-semibold mb-2">流式响应格式</h5>
 <pre className="text-xs text-body overflow-x-auto">
{`chunk: { candidates: [{ content: { parts: [{ text: "Hello" }] } }] }
chunk: { candidates: [{ content: { parts: [{ text: " world" }] } }] }
chunk: { candidates: [{ content: { parts: [{ functionCall: { name: "read_file", args: {...} } }] } }] }
chunk: { candidates: [{ finishReason: "STOP" }] }`}
 </pre>
 <div className="mt-2 text-xs text-dim">
 注：示例为概念化结构；上游以 <code>parts[].functionCall</code> 判定是否进入工具回合。
 </div>
 </div>
 </CollapsibleSection>

 <CollapsibleSection title="阶段 5：工具调用与执行" icon="5️⃣" defaultOpen={true}>
 <StageCard
 number={5}
 title="工具调用与执行"
 duration="~10ms - 数分钟（取决于工具）"
 description="解析模型返回的工具调用，进行参数校验、审批检查，然后执行工具并收集结果。"
 keyPoints={[
 '解析 parts[].functionCall',
 '参数类型校验（zod schema）',
 '审批模式检查（需要用户确认？）',
 '沙箱隔离执行（如启用）',
 '结果格式化与 Token 截断',
 ]}
 sourceFiles={[
 { path: 'packages/core/src/core/coreToolScheduler.ts', function: 'processToolCall()' },
 { path: 'packages/core/src/tools/*.ts', function: '各工具实现' },
 { path: 'packages/core/src/confirmation-bus/message-bus.ts', function: 'shouldConfirmExecute()' },
 ]}
 />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="常用工具" variant="blue">
 <ul className="text-xs text-body space-y-1">
 <li>• <code>read_file</code> - 读取文件</li>
 <li>• <code>write_file</code> - 写入文件</li>
 <li>• <code>replace</code> - 局部替换编辑</li>
 <li>• <code>run_shell_command</code> - 执行命令</li>
 <li>• <code>glob</code> - 文件搜索</li>
 <li>• <code>search_file_content</code> - 内容搜索</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="审批触发条件" variant="purple">
 <ul className="text-xs text-body space-y-1">
 <li>• 写入/删除文件</li>
 <li>• 执行 shell 命令</li>
 <li>• 访问敏感目录</li>
 <li>• 网络请求</li>
 <li>• 新增工具首次使用</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="沙箱保护" variant="green">
 <ul className="text-xs text-body space-y-1">
 <li>• macOS seatbelt</li>
 <li>• Docker 容器</li>
 <li>• 文件系统隔离</li>
 <li>• 网络限制</li>
 <li>• 资源配额</li>
 </ul>
 </HighlightBox>
 </div>
 </CollapsibleSection>

 <CollapsibleSection title="阶段 6：循环与终止" icon="6️⃣" defaultOpen={true}>
 <StageCard
 number={6}
 title="循环与终止"
 duration="循环直到无 functionCall"
 description="工具结果写入历史后，判断是否继续循环。如果下一次响应仍包含 functionCall，则继续下一轮；否则输出最终文本并结束。"
 keyPoints={[
 '工具结果格式化为 functionResponse',
 '追加到 messages 历史',
 '检查循环次数限制（防无限循环）',
 '检测重复模式（循环检测）',
 '决定继续或终止',
 ]}
 sourceFiles={[
 { path: 'packages/core/src/core/geminiChat.ts', function: 'chatLoop()' },
 { path: 'packages/core/src/services/loopDetectionService.ts', function: 'detectLoop()' },
 ]}
 />

 <div className="mt-4 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
 <h5 className="text-red-400 font-semibold mb-2">循环保护机制</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• <strong>最大轮次</strong>：默认 50 轮，可配置</li>
 <li>• <strong>重复检测</strong>：连续 3 次相同工具调用触发警告</li>
 <li>• <strong>Token 限制</strong>：单次会话总 Token 上限</li>
 <li>• <strong>超时保护</strong>：单工具执行超时 5 分钟</li>
 </ul>
 </div>
 </CollapsibleSection>

 <CollapsibleSection title="阶段 7：最终输出与持久化" icon="7️⃣" defaultOpen={true}>
 <StageCard
 number={7}
 title="最终输出与持久化"
 duration="~50-200ms"
 description="当响应不再包含 functionCall 时，渲染最终输出并持久化会话状态，以便下次恢复。"
 keyPoints={[
 '渲染最终 Markdown 输出',
 '保存会话历史到磁盘',
 '更新统计信息（Token 用量）',
 '记录遥测数据（如启用）',
 '清理临时资源',
 ]}
 sourceFiles={[
 { path: 'packages/core/src/services/chatRecordingService.ts', function: 'saveSession()' },
 { path: 'packages/core/src/telemetry/telemetryService.ts', function: 'recordUsage()' },
 { path: 'packages/cli/src/ui/components/MessageRenderer.tsx', function: 'render()' },
 ]}
 />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="持久化内容" variant="blue">
 <ul className="text-xs text-body space-y-1">
 <li>• 完整对话历史</li>
 <li>• 工具调用记录</li>
 <li>• Token 使用统计</li>
 <li>• 会话元数据（时间、模型）</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="存储位置" variant="green">
 <ul className="text-xs text-body space-y-1">
 <li>• <code>~/.gemini/history/&lt;project-hash&gt;/</code></li>
 <li>• <code>~/.gemini/memory.md</code>（全局）</li>
 <li>• <code>.gemini/settings.json</code>（项目级）</li>
 </ul>
 </HighlightBox>
 </div>
 </CollapsibleSection>

 <Layer title="关键入口（建议打开的源码点）" icon="🔍">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="CLI 交互主循环" variant="green">
 <div className="text-sm text-body">
 关注：输入 → 流式输出 → functionCall → 下一轮
 <div className="mt-2 text-xs text-dim">
 <code>packages/cli/src/ui/hooks/useGeminiStream.ts</code>
 </div>
 </div>
 </HighlightBox>
 <HighlightBox title="工具调度与执行" variant="purple">
 <div className="text-sm text-body">
 关注：并发、依赖、审批、安全边界
 <div className="mt-2 text-xs text-dim">
 <code>packages/core/src/core/coreToolScheduler.ts</code>
 </div>
 </div>
 </HighlightBox>
 </div>

 <div className="mt-4 p-4 bg-surface rounded-lg border border-edge">
 <h5 className="text-heading font-semibold mb-2">建议你打开的核心文件</h5>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
 <div className="bg-surface rounded px-3 py-2">
 <code className="text-yellow-400">packages/cli/src/ui/hooks/useGeminiStream.ts</code>
 <div className="text-dim mt-1">CLI 流式交互核心</div>
 </div>
 <div className="bg-surface rounded px-3 py-2">
 <code className="text-yellow-400">packages/core/src/core/geminiChat.ts</code>
 <div className="text-dim mt-1">聊天主循环</div>
 </div>
 <div className="bg-surface rounded px-3 py-2">
 <code className="text-yellow-400">packages/core/src/core/coreToolScheduler.ts</code>
 <div className="text-dim mt-1">工具调度器</div>
 </div>
 <div className="bg-surface rounded px-3 py-2">
 <code className="text-yellow-400">packages/core/src/core/contentGenerator.ts</code>
 <div className="text-dim mt-1">API 调用层</div>
 </div>
 </div>
 </div>
 </Layer>

 <Layer title="常见问题" icon="💬">
 <div className="space-y-3 text-sm text-body">
 <div className="p-4 bg-surface rounded-lg border border-edge">
 <div className="text-heading font-semibold">Q：为什么需要"审批/沙箱"？</div>
 <div className="text-body mt-1">
 A：模型不可信，工具具备副作用；审批/沙箱/信任边界是防止越权与误操作的关键门禁。
 详见「审批模式」「沙箱系统」页面。
 </div>
 </div>
 <div className="p-4 bg-surface rounded-lg border border-edge">
 <div className="text-heading font-semibold">Q：functionCall 出错怎么兜底？</div>
 <div className="text-body mt-1">
 A：参数校验 + 重试/回退策略 + 将错误结果入历史，让模型可自我修正下一轮调用。
 详见「错误处理」「重试回退」页面。
 </div>
 </div>
 <div className="p-4 bg-surface rounded-lg border border-edge">
 <div className="text-heading font-semibold">Q：上下文窗口怎么处理？</div>
 <div className="text-body mt-1">
 A：通过裁剪/摘要/记忆检索等手段控制 token，占位符与文件引用要可追踪、可回溯。
 详见「Token 计费系统」「上下文管理」页面。
 </div>
 </div>
 <div className="p-4 bg-surface rounded-lg border border-edge">
 <div className="text-heading font-semibold">Q：如何调试整个流程？</div>
 <div className="text-body mt-1">
 A：设置 <code className="text-yellow-400">DEBUG=1</code> 环境变量可输出详细日志；
 <code className="text-yellow-400">GEMINI_LOG_LEVEL=debug</code> 可控制日志级别。
 </div>
 </div>
 </div>
 </Layer>

 {/* 相关页面 */}
 <RelatedPages
 title="📚 细节页建议配合阅读"
 pages={[
 { id: 'lifecycle', label: '请求生命周期', description: '详细流程' },
 { id: 'interaction-loop', label: '交互主循环', description: '核心循环' },
 { id: 'tool-scheduler', label: '工具调度详解', description: '调度逻辑' },
 { id: 'approval-mode', label: '审批模式', description: '安全门禁' },
 { id: 'sandbox', label: '沙箱系统', description: '隔离执行' },
 { id: 'token-accounting', label: 'Token 计费', description: '成本控制' },
 { id: 'loop-detect', label: '循环检测', description: '防死循环' },
 { id: 'session-persistence', label: '会话持久化', description: '状态保存' },
 ]}
 />
 </div>
 );
}
