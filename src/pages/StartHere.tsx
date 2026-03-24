import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

interface StartHereProps {
 onNavigate?: (tab: string) => void;
}

export function StartHere({ onNavigate }: StartHereProps) {
 const [selectedPath, setSelectedPath] = useState<'architect' | 'developer' | 'explorer' | null>(null);

 const relatedPages: RelatedPage[] = [
 { id: 'overview', label: '架构概览', description: '系统整体架构鸟瞰' },
 { id: 'hook-system', label: 'Hook 系统', description: '事件拦截与扩展点' },
 { id: 'policy-engine', label: 'Policy 引擎', description: '安全策略决策系统' },
 { id: 'message-bus', label: '消息总线', description: '发布/订阅异步通信' },
 { id: 'model-routing', label: '模型路由', description: 'Flash/Pro 智能选择' },
 { id: 'agent-framework', label: 'Agent 框架', description: '子代理执行与编排' },
 { id: 'gemini-chat', label: 'GeminiChat 详解', description: '核心交互引擎' },
 { id: 'animation', label: '动画演示', description: '可视化流程理解' },
 ];

 const learningPaths = {
 architect: {
 title: '系统架构师',
 icon: '△',
 description: '理解整体架构设计、设计模式和系统边界',
 steps: [
 { id: 'overview', label: '架构概览', desc: '整体架构鸟瞰' },
 { id: 'hook-system', label: 'Hook 系统', desc: '事件拦截机制' },
 { id: 'policy-engine', label: 'Policy 引擎', desc: '安全策略决策' },
 { id: 'message-bus', label: '消息总线', desc: '发布/订阅通信' },
 { id: 'model-routing', label: '模型路由', desc: 'Flash/Pro 选择' },
 { id: 'design-tradeoffs', label: '设计权衡', desc: '架构决策分析' },
 ],
 },
 developer: {
 title: '功能开发者',
 icon: '◇',
 description: '快速上手开发新功能、扩展和工具',
 steps: [
 { id: 'startup-chain', label: '启动链路', desc: '入口点分析' },
 { id: 'tool-ref', label: '工具参考', desc: '内置工具列表' },
 { id: 'agent-framework', label: 'Agent 框架', desc: '子代理开发' },
 { id: 'extension', label: '扩展系统', desc: '插件开发' },
 { id: 'mcp', label: 'MCP集成', desc: '扩展协议' },
 { id: 'zed-integration', label: 'IDE 集成', desc: 'Zed ACP 协议' },
 ],
 },
 explorer: {
 title: '源码探索者',
 icon: '○',
 description: '深入内部机制、算法实现和细节',
 steps: [
 { id: 'gemini-chat', label: '核心循环', desc: 'GeminiChat 详解' },
 { id: 'interaction-loop', label: '交互循环', desc: 'Turn 状态机' },
 { id: 'routing-chain-anim', label: '路由策略链', desc: '模型选择动画' },
 { id: 'agent-loop-anim', label: 'Agent 循环', desc: '子代理执行动画' },
 { id: 'hook-event-anim', label: 'Hook 事件流', desc: '事件拦截动画' },
 { id: 'policy-decision-anim', label: 'Policy 决策', desc: '安全决策动画' },
 { id: 'animation', label: '更多动画', desc: '可视化流程' },
 ],
 },
 };

 const coreTerms = [
 { term: 'Turn', definition: '一次完整的 用户输入→AI响应→工具执行 循环' },
 { term: 'Continuation', definition: 'AI 完成工具调用后自动继续的机制' },
 { term: 'Hook', definition: '事件拦截系统 - 11 种事件类型、3 层配置优先级' },
 { term: 'Policy', definition: '安全策略引擎 - ALLOW/DENY/ASK_USER 三种决策' },
 { term: 'MessageBus', definition: '发布/订阅消息总线 - 解耦异步通信' },
 { term: 'ModelRouter', definition: '智能模型路由 - Flash/Pro 策略链选择' },
 { term: 'Agent', definition: '子代理框架 - Local（TOML 定义）/ Remote（A2A 协议）' },
 { term: 'ApprovalMode', definition: '审批级别：Default/AutoEdit/YOLO（3 种模式）' },
 { term: 'MCP', definition: 'Model Context Protocol - 工具动态注册协议' },
 ];

 return (
 <div className="space-y-16 max-w-5xl mx-auto">
 {/* Hero Section */}
 <section className="py-12">
 <div className="mb-8">
 <p className="text-xs font-mono text-dim uppercase tracking-widest mb-4">Architecture Deep Dive</p>
 <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-heading leading-tight">
 AI Agent CLI<br />
 <span className="text-body font-normal">架构深度解析</span>
 </h1>
 </div>
 <p className="text-base text-body max-w-lg mb-8 leading-relaxed">
 一个 AI Coding CLI 的完整架构拆解与源码导读。从启动流程到工具调度，从安全策略到扩展协议。
 </p>
 <div className="flex flex-wrap gap-4 text-xs text-dim font-mono">
 <span className="px-2.5 py-1 rounded-md border border-edge bg-surface/50">100+ 页面</span>
 <span className="px-2.5 py-1 rounded-md border border-edge bg-surface/50">54 个动画</span>
 <span className="px-2.5 py-1 rounded-md border border-edge bg-surface/50">行级引用</span>
 </div>
 </section>

 {/* Scope Declaration — minimal, no outer box */}
 <section>
 <h2 className="text-lg font-semibold text-heading mb-6">这份指南是什么</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
 <div>
 <h3 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
 本指南覆盖
 </h3>
 <ul className="text-sm text-body space-y-2">
 <li><strong className="text-heading">架构设计</strong> — 系统如何分层、模块如何协作</li>
 <li><strong className="text-heading">源码导读</strong> — 关键代码的实现细节与行级引用</li>
 <li><strong className="text-heading">设计决策</strong> — 为什么这样设计、有哪些权衡</li>
 <li><strong className="text-heading">内部机制</strong> — 状态机、调度器、格式转换等</li>
 </ul>
 </div>

 <div>
 <h3 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-dim" />
 本指南不覆盖
 </h3>
 <ul className="text-sm text-body space-y-2">
 <li><strong className="text-heading">使用教程</strong> — 如何安装、配置、日常使用</li>
 <li><strong className="text-heading">命令手册</strong> — 完整的命令行参数说明</li>
 <li><strong className="text-heading">API 文档</strong> — 公开接口的调用方式</li>
 <li><strong className="text-heading">使用层 FAQ</strong> — "为什么报错""如何配置"等日常问答</li>
 </ul>
 </div>
 </div>

 <p className="text-sm text-dim border-t border-edge pt-4">
 基于 AI Agent CLI 源码分析，涵盖
 <code>GeminiChat</code>、<code>Hook/Policy</code>、<code>Agent 框架</code>
 等事件驱动架构。
 </p>
 </section>

 {/* Learning Path Selection */}
 <section>
 <h2 className="text-lg font-semibold text-heading mb-1">
 选择你的学习路径
 </h2>
 <p className="text-sm text-dim mb-6">
 根据你的目标选择推荐的阅读顺序
 </p>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
 {Object.entries(learningPaths).map(([key, path]) => (
 <button
 key={key}
 onClick={() => setSelectedPath(key as 'architect' | 'developer' | 'explorer')}
 className={`text-left rounded-xl p-5 border transition-all duration-150 ${
 selectedPath === key
 ? 'border-accent/30 bg-accent-light'
 : 'border-edge hover:border-edge-hover'
 }`}
 >
 <div className="text-dim font-mono text-xs mb-3">{path.icon}</div>
 <h3 className={`font-semibold mb-1.5 ${selectedPath === key ? 'text-accent' : 'text-heading'}`}>
 {path.title}
 </h3>
 <p className="text-sm text-body leading-relaxed">
 {path.description}
 </p>
 </button>
 ))}
 </div>

 {selectedPath && (
 <div className="rounded-xl border border-edge p-5">
 <h4 className="text-sm font-semibold text-heading mb-4">
 {learningPaths[selectedPath].title} — 推荐路线
 </h4>
 <div className="flex flex-wrap gap-2">
 {learningPaths[selectedPath].steps.map((step, index) => (
 <button
 key={step.id}
 onClick={() => onNavigate?.(step.id)}
 className="flex items-center gap-2 px-3 py-2 rounded-lg border border-edge hover:border-edge-hover hover:bg-surface transition-all duration-150 group"
 >
 <span className="text-[10px] text-dim font-mono w-4">{index + 1}.</span>
 <span className="text-sm text-heading group-hover:text-accent transition-colors duration-150">
 {step.label}
 </span>
 </button>
 ))}
 </div>
 </div>
 )}
 </section>

 {/* Architecture Overview — visual diagram */}
 <section>
 <h2 className="text-lg font-semibold text-heading mb-6">
 架构全景图
 </h2>
 <div className="rounded-xl border border-edge overflow-hidden">
 <div className="grid grid-cols-5 gap-px bg-edge text-center text-xs font-mono">
 <div className="col-span-5 bg-base p-4">
 <div className="text-heading font-semibold text-sm mb-1">UI Layer</div>
 <div className="text-dim">Terminal · React/Ink · Prompt</div>
 </div>

 <div className="col-span-5 bg-base p-4">
 <div className="text-heading font-semibold text-sm mb-1">Core Loop</div>
 <div className="text-dim">useGeminiStream → GeminiChat → ContentGenerator</div>
 </div>

 <div className="col-span-5 bg-surface/80 p-4">
 <div className="text-heading font-semibold text-sm mb-1">Event-Driven Architecture</div>
 <div className="text-dim">Hook System · Policy Engine · MessageBus · Model Router</div>
 </div>

 <div className="col-span-3 bg-base p-4">
 <div className="text-heading font-semibold text-sm mb-1">Tool System</div>
 <div className="text-dim">Scheduler · Executor · 14 Tools + MCP</div>
 </div>
 <div className="col-span-2 bg-base p-4">
 <div className="text-heading font-semibold text-sm mb-1">Agent Framework</div>
 <div className="text-dim">Local · Remote · MCP</div>
 </div>

 <div className="col-span-5 bg-surface/80 p-4">
 <div className="text-heading font-semibold text-sm mb-1">Security Layer</div>
 <div className="text-dim">Policy Rules · Sandbox · Trusted Folders · Checkpointing</div>
 </div>
 </div>
 </div>
 <button
 onClick={() => onNavigate?.('overview')}
 className="mt-3 text-sm text-accent hover:text-accent-hover transition-colors duration-150 flex items-center gap-1"
 >
 查看详细架构图 →
 </button>
 </section>

 {/* Core Concepts — clean table-like layout */}
 <section>
 <h2 className="text-lg font-semibold text-heading mb-1">
 核心概念速览
 </h2>
 <p className="text-sm text-dim mb-6">
 开始阅读前，了解这些关键术语
 </p>

 <div className="rounded-xl border border-edge overflow-hidden divide-y divide-edge">
 {coreTerms.map((item) => (
 <div
 key={item.term}
 className="flex items-start gap-4 px-4 py-3 hover:bg-surface/50 transition-colors duration-150"
 >
 <code className="shrink-0 text-sm text-accent font-mono font-medium w-28">
 {item.term}
 </code>
 <p className="text-sm text-body">
 {item.definition}
 </p>
 </div>
 ))}
 </div>

 <button
 onClick={() => onNavigate?.('glossary')}
 className="mt-3 text-sm text-accent hover:text-accent-hover transition-colors duration-150 flex items-center gap-1"
 >
 查看完整术语表 →
 </button>
 </section>

 {/* Design Philosophy — no wrapper boxes */}
 <section>
 <h2 className="text-lg font-semibold text-heading mb-6">
 设计哲学
 </h2>
 <div className="space-y-6 text-sm">
 {[
 { title: '「AI 是无状态的」', body: '每次 AI 请求都是独立的 HTTP 调用。AI 不记得之前的对话，所有上下文必须在每次请求时重新发送。这个约束决定了整个系统的架构：CLI 必须管理对话历史、工具状态、会话持久化。' },
 { title: '「工具在本地执行」', body: 'AI 只负责决策「调用什么工具」，实际执行发生在用户机器上。用户对敏感操作有完全控制权，不需要将代码或数据发送到云端，同时也意味着 CLI 必须实现完整的权限控制和沙箱隔离。' },
 { title: '「Continuation 驱动循环」', body: '当模型需要工具时会在流中发出 ToolCallRequest 事件。CLI 执行工具后，将 functionResponse 作为 continuation 回注给模型继续对话。这个「请求→工具→反馈→请求」的循环，让 AI 能够自主完成多步骤任务。' },
 { title: '「抽象层解耦」', body: 'CLI 层、Core 层、工具层、API 层各司其职。切换 AI 厂商只需实现新的 API 适配器，添加新工具只需注册到工具系统，扩展功能通过 MCP 协议动态加载。代价是理解成本较高，但换来了极大的灵活性。' },
 ].map((item) => (
 <div key={item.title} className="border-l-2 border-edge pl-5">
 <h3 className="font-semibold text-heading mb-2">{item.title}</h3>
 <p className="text-body leading-relaxed">{item.body}</p>
 </div>
 ))}
 </div>
 </section>

 {/* Key Insights */}
 <section>
 <h2 className="text-lg font-semibold text-heading mb-6">
 核心发现
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="消息驱动的事件循环" variant="info">
 <p className="text-sm text-body leading-relaxed">
 CLI 的核心是一个 <code>useGeminiStream</code> Hook，
 实现了 用户输入 → AI 思考 → 工具调用 → 结果反馈 的无限循环。
 是否继续主要取决于是否出现 <code>ToolCallRequest</code> 并触发 continuation；
 本轮流的结束由 <code>Finished</code>/<code>finishReason</code> 标记。
 </p>
 </HighlightBox>

 <HighlightBox title="事件驱动架构" variant="tip">
 <p className="text-sm text-body leading-relaxed">
 <strong className="text-heading">Hook System</strong> - 11 种事件拦截点<br/>
 <strong className="text-heading">Policy Engine</strong> - 安全策略决策<br/>
 <strong className="text-heading">MessageBus</strong> - 发布/订阅解耦通信
 </p>
 </HighlightBox>

 <HighlightBox title="多层安全门禁" variant="warning">
 <p className="text-sm text-body leading-relaxed">
 <strong className="text-heading">Policy Engine</strong> - ALLOW/DENY/ASK_USER 决策<br/>
 <strong className="text-heading">信任文件夹</strong> - 限制高权限模式范围<br/>
 <strong className="text-heading">沙箱隔离</strong> - 安全执行边界
 </p>
 </HighlightBox>

 <HighlightBox title="智能模型路由" variant="info">
 <p className="text-sm text-body leading-relaxed">
 <code>CompositeStrategy</code> 策略链：
 Override → Classifier（LLM 复杂度分析）→ Fallback → Default，
 智能选择 Flash 或 Pro 模型。
 </p>
 </HighlightBox>
 </div>
 </section>

 {/* Why This Project — horizontal instead of cards */}
 <section>
 <h2 className="text-lg font-semibold text-heading mb-6">
 为什么分析这个项目
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
 <div>
 <h3 className="font-semibold text-heading mb-2">复杂系统设计</h3>
 <p className="text-body leading-relaxed">
 涵盖状态机、事件驱动、插件架构等现代系统设计模式
 </p>
 </div>
 <div>
 <h3 className="font-semibold text-heading mb-2">安全架构实践</h3>
 <p className="text-body leading-relaxed">
 沙箱隔离、审批机制、信任边界等企业级安全设计
 </p>
 </div>
 <div>
 <h3 className="font-semibold text-heading mb-2">可扩展架构</h3>
 <p className="text-body leading-relaxed">
 MCP 协议、子代理系统、自定义命令等扩展机制
 </p>
 </div>
 </div>
 </section>

 {/* Reading Tips — numbered list, no boxes */}
 <section>
 <h2 className="text-lg font-semibold text-heading mb-6">
 阅读建议
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
 {[
 { n: '01', title: '从宏观到微观', desc: '先看架构概览理解全貌，再深入具体模块' },
 { n: '02', title: '结合动画理解', desc: '51 个交互动画帮助可视化理解复杂流程' },
 { n: '03', title: '跟随源码引用', desc: '每个关键点都有源文件路径和行号，方便对照' },
 { n: '04', title: '使用搜索功能', desc: '按 ⌘K 快速跳转到任意页面' },
 ].map(tip => (
 <div key={tip.n} className="flex items-start gap-3">
 <span className="shrink-0 text-[11px] text-dim font-mono mt-0.5">{tip.n}</span>
 <div>
 <strong className="text-heading">{tip.title}</strong>
 <p className="text-body mt-0.5">{tip.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* Footer */}
 <section className="border-t border-edge pt-8 text-center">
 <p className="text-sm text-body mb-4">
 基于 <a href="https://github.com/google-gemini/gemini-cli" className="text-accent hover:text-accent-hover">gemini-cli</a> 源码分析，
 所有结论均附带源文件路径和行号引用。
 </p>
 </section>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
