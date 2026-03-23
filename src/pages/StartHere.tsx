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
 <div className="space-y-10 max-w-5xl mx-auto">
 {/* Hero Section */}
 <section className="text-center py-10">
 <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
 <span className="text-heading">Gemini CLI</span>
 <span className="text-heading"> 架构深度解析</span>
 </h1>
 <p className="text-lg text-body mb-8">
 一个 AI Coding CLI 的完整架构拆解与源码导读
 </p>
 <div className="flex flex-wrap justify-center gap-3 text-sm">
 <span className="px-4 py-2 bg-surface text-heading rounded-md border border-edge">
 100+ 页面
 </span>
 <span className="px-4 py-2 bg-surface text-heading rounded-md border border-edge">
 54 动画
 </span>
 <span className="px-4 py-2 bg-surface text-heading rounded-md border border-edge">
 行级引用
 </span>
 </div>
 </section>

 {/* Scope Declaration */}
 <section className="bg-surface/50 rounded-lg p-5 border border-edge">
 <h3 className="font-semibold text-heading mb-4">这份指南是什么</h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <div className="bg-emerald-400/5 rounded-lg p-4 border border-emerald-500/20">
 <h4 className="text-emerald-400 font-semibold mb-2 text-sm">本指南覆盖</h4>
 <ul className="text-sm text-body space-y-1">
 <li>- <strong className="text-heading">架构设计</strong> — 系统如何分层、模块如何协作</li>
 <li>- <strong className="text-heading">源码导读</strong> — 关键代码的实现细节与行级引用</li>
 <li>- <strong className="text-heading">设计决策</strong> — 为什么这样设计、有哪些权衡</li>
 <li>- <strong className="text-heading">内部机制</strong> — 状态机、调度器、格式转换等</li>
 </ul>
 </div>

 <div className="bg-amber-400/5 rounded-lg p-4 border border-amber-500/20">
 <h4 className="text-amber-400 font-semibold mb-2 text-sm">本指南不覆盖</h4>
 <ul className="text-sm text-body space-y-1">
 <li>- <strong className="text-heading">使用教程</strong> — 如何安装、配置、日常使用</li>
 <li>- <strong className="text-heading">命令手册</strong> — 完整的命令行参数说明</li>
 <li>- <strong className="text-heading">API 文档</strong> — 公开接口的调用方式</li>
 <li>- <strong className="text-heading">使用层 FAQ</strong> — "为什么报错""如何配置"等日常问答</li>
 </ul>
 </div>
 </div>

 <div className="bg-base rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-semibold mb-3 text-sm">相关资源</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
 <div className="flex items-center gap-2 text-body">
 <span>用户文档 → <code className="text-heading">/docs</code> 目录</span>
 </div>
 <div className="flex items-center gap-2 text-body">
 <span>版本记录 → <code className="text-heading">CHANGELOG.md</code></span>
 </div>
 </div>
 </div>

 <div className="mt-4 pt-4 border-t border-edge text-sm">
 <p className="text-dim">
 <strong className="text-body">关于本指南：</strong>
 本指南基于 Google Gemini CLI 源码分析，涵盖核心机制如
 <code className="text-heading bg-elevated px-1 rounded mx-1">GeminiChat</code>、
 <code className="text-heading bg-elevated px-1 rounded mx-1">Hook/Policy</code>、
 <code className="text-heading bg-elevated px-1 rounded mx-1">Agent 框架</code>
 等事件驱动架构。
 </p>
 </div>
 </section>

 {/* Learning Path Selection */}
 <section className="bg-surface/30 rounded-lg p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-2">
 选择你的学习路径
 </h2>
 <p className="text-sm text-dim mb-6">
 根据你的目标选择推荐的阅读顺序
 </p>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 {Object.entries(learningPaths).map(([key, path]) => (
 <button
 key={key}
 onClick={() => setSelectedPath(key as 'architect' | 'developer' | 'explorer')}
 className={`text-left bg-base rounded-lg p-5 border transition-colors ${
 selectedPath === key
 ? ' border-edge'
 : ' border-edge hover:border-edge-hover'
 }`}
 >
 <h3 className={`font-semibold mb-2 ${
 selectedPath === key ? 'text-heading' : 'text-heading'
 }`}>
 {path.title}
 </h3>
 <p className="text-sm text-body leading-relaxed">
 {path.description}
 </p>
 </button>
 ))}
 </div>

 {selectedPath && (
 <div className="bg-base rounded-lg p-6 border border-edge">
 <h4 className="font-semibold text-heading mb-4">
 {learningPaths[selectedPath].title} 推荐路线
 </h4>
 <div className="flex flex-wrap gap-2">
 {learningPaths[selectedPath].steps.map((step, index) => (
 <button
 key={step.id}
 onClick={() => onNavigate?.(step.id)}
 className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg border border-edge hover:border-edge transition-colors group"
 >
 <span className="text-xs text-dim font-mono">{index + 1}.</span>
 <span className="text-sm text-heading group-hover:text-heading">
 {step.label}
 </span>
 </button>
 ))}
 </div>
 </div>
 )}
 </section>

 {/* Core Concepts Quick Reference */}
 <section className="bg-surface/30 rounded-lg p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-2">
 核心概念速览
 </h2>
 <p className="text-sm text-dim mb-6">
 开始阅读前，了解这些关键术语
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {coreTerms.map((item) => (
 <div
 key={item.term}
 className="flex items-start gap-3 bg-base rounded-lg p-4 border border-edge"
 >
 <code className="shrink-0 px-2 py-1 bg-elevated text-heading rounded text-sm font-mono">
 {item.term}
 </code>
 <p className="text-sm text-body leading-relaxed">
 {item.definition}
 </p>
 </div>
 ))}
 </div>

 <button
 onClick={() => onNavigate?.('glossary')}
 className="mt-4 text-sm text-heading hover:underline flex items-center gap-1"
 >
 查看完整术语表 →
 </button>
 </section>

 {/* Why This Project */}
 <section className="bg-surface/30 rounded-lg p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-6">
 为什么分析这个项目
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
 <div className="bg-base rounded-lg p-5 border border-edge hover:border-edge transition-colors">
 <h3 className="font-semibold text-heading mb-2">复杂系统设计</h3>
 <p className="text-body leading-relaxed">
 涵盖状态机、事件驱动、插件架构等现代系统设计模式
 </p>
 </div>
 <div className="bg-base rounded-lg p-5 border border-edge hover:border-edge transition-colors">
 <h3 className="font-semibold text-heading mb-2">安全架构实践</h3>
 <p className="text-body leading-relaxed">
 沙箱隔离、审批机制、信任边界等企业级安全设计
 </p>
 </div>
 <div className="bg-base rounded-lg p-5 border border-edge hover:border-edge transition-colors">
 <h3 className="font-semibold text-heading mb-2">可扩展架构</h3>
 <p className="text-body leading-relaxed">
 MCP 协议、子代理系统、自定义命令等扩展机制
 </p>
 </div>
 </div>
 </section>

 {/* Design Philosophy */}
 <section className="bg-surface/30 rounded-lg p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-6">
 设计哲学
 </h2>
 <div className="space-y-4 text-sm">
 <div className="bg-base rounded-lg p-5 border-l-[3px] border-edge">
 <h3 className="font-semibold text-heading mb-2">「AI 是无状态的」</h3>
 <p className="text-body leading-relaxed">
 每次 AI 请求都是独立的 HTTP 调用。AI 不记得之前的对话，所有上下文必须在每次请求时重新发送。
 这个约束决定了整个系统的架构：CLI 必须管理对话历史、工具状态、会话持久化。
 </p>
 </div>

 <div className="bg-base rounded-lg p-5 border-l-[3px] border-edge">
 <h3 className="font-semibold text-heading mb-2">「工具在本地执行」</h3>
 <p className="text-body leading-relaxed">
 AI 只负责决策「调用什么工具」，实际执行发生在用户机器上。
 这意味着：用户对敏感操作有完全控制权，不需要将代码或数据发送到云端，
 同时也意味着 CLI 必须实现完整的权限控制和沙箱隔离。
 </p>
 </div>

 <div className="bg-base rounded-lg p-5 border-l-[3px] border-amber-400">
 <h3 className="font-semibold text-amber-400 mb-2">「Continuation 驱动循环」</h3>
 <p className="text-body leading-relaxed">
 上游 Gemini CLI 中，当模型需要工具时会在流中发出 <code className="bg-surface px-1 rounded">ToolCallRequest</code> 事件（来源于结构化 <code className="bg-surface px-1 rounded">functionCalls</code>）。
 CLI 执行工具后，将 <code className="bg-surface px-1 rounded">functionResponse</code> 作为 continuation 回注给模型继续对话。
 这个「请求→工具→反馈→请求」的循环，让 AI 能够自主完成多步骤任务。
 </p>
 </div>

 <div className="bg-base rounded-lg p-5 border-l-[3px] border-edge">
 <h3 className="font-semibold text-heading mb-2">「抽象层解耦」</h3>
 <p className="text-body leading-relaxed">
 CLI 层、Core 层、工具层、API 层各司其职。这种分层使得：
 切换 AI 厂商只需实现新的 API 适配器，添加新工具只需注册到工具系统，
 扩展功能通过 MCP 协议动态加载。代价是理解成本较高，但换来了极大的灵活性。
 </p>
 </div>
 </div>
 </section>

 {/* Key Insights */}
 <section>
 <h2 className="text-xl font-bold text-heading mb-6">
 核心发现
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="消息驱动的事件循环" variant="info">
 <p className="text-sm text-body leading-relaxed">
 CLI 的核心是一个 <code className="text-heading bg-elevated px-1 rounded">useGeminiStream</code> Hook，
 实现了 用户输入 → AI 思考 → 工具调用 → 结果反馈 的无限循环。
 是否继续主要取决于是否出现 <code className="text-heading bg-elevated px-1 rounded">ToolCallRequest</code> 并触发 continuation；
 本轮流的结束由 <code className="text-heading bg-elevated px-1 rounded">Finished</code>/<code className="text-heading bg-elevated px-1 rounded">finishReason</code> 标记。
 </p>
 </HighlightBox>

 <HighlightBox title="事件驱动架构" variant="tip">
 <p className="text-sm text-body leading-relaxed">
 <strong className="text-emerald-400">Hook System</strong> - 11 种事件拦截点<br/>
 <strong className="text-emerald-400">Policy Engine</strong> - 安全策略决策<br/>
 <strong className="text-emerald-400">MessageBus</strong> - 发布/订阅解耦通信
 </p>
 </HighlightBox>

 <HighlightBox title="多层安全门禁" variant="warning">
 <p className="text-sm text-body leading-relaxed">
 <strong className="text-amber-400">Policy Engine</strong> - ALLOW/DENY/ASK_USER 决策<br/>
 <strong className="text-amber-400">信任文件夹</strong> - 限制高权限模式范围<br/>
 <strong className="text-amber-400">沙箱隔离</strong> - 安全执行边界
 </p>
 </HighlightBox>

 <HighlightBox title="智能模型路由" variant="info">
 <p className="text-sm text-body leading-relaxed">
 <code className="text-heading bg-elevated px-1 rounded">CompositeStrategy</code> 策略链：
 Override → Classifier（LLM 复杂度分析）→ Fallback → Default，
 智能选择 Flash 或 Pro 模型。
 </p>
 </HighlightBox>
 </div>
 </section>

 {/* Architecture Overview */}
 <section className="bg-surface/30 rounded-lg p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-6">
 架构全景图
 </h2>
 <div className="bg-base rounded-lg p-6 border border-edge">
 <div className="grid grid-cols-5 gap-3 text-center text-xs font-mono">
 <div className="col-span-5 bg-elevated rounded-lg p-3 border border-edge">
 <div className="text-heading font-semibold mb-2">UI Layer</div>
 <div className="flex justify-center gap-4 text-dim">
 <span>Terminal</span>
 <span>·</span>
 <span>React/Ink</span>
 <span>·</span>
 <span>Prompt</span>
 </div>
 </div>

 <div className="col-span-5 bg-elevated rounded-lg p-3 border border-edge">
 <div className="text-heading font-semibold mb-2">Core Loop</div>
 <div className="flex justify-center gap-4 text-dim">
 <span>useGeminiStream</span>
 <span>→</span>
 <span>GeminiChat</span>
 <span>→</span>
 <span>ContentGenerator</span>
 </div>
 </div>

 <div className="col-span-5 bg-elevated rounded-lg p-3 border border-edge">
 <div className="text-heading font-semibold mb-2">Event-Driven Architecture</div>
 <div className="flex justify-center gap-4 text-dim">
 <span>Hook System</span>
 <span>·</span>
 <span>Policy Engine</span>
 <span>·</span>
 <span>MessageBus</span>
 <span>·</span>
 <span>Model Router</span>
 </div>
 </div>

 <div className="col-span-3 bg-surface rounded-lg p-3 border border-edge">
 <div className="text-heading font-semibold mb-2">Tool System</div>
 <div className="text-dim">
 Scheduler · Executor · 14 Tools (+ MCP)
 </div>
 </div>
 <div className="col-span-2 bg-surface rounded-lg p-3 border border-edge">
 <div className="text-heading font-semibold mb-2">Agent Framework</div>
 <div className="text-dim">
 Local · Remote · MCP
 </div>
 </div>

 <div className="col-span-5 bg-amber-400/5 rounded-lg p-3 border border-edge">
 <div className="text-amber-400 font-semibold mb-2">Security Layer</div>
 <div className="flex justify-center gap-4 text-dim">
 <span>Policy Rules</span>
 <span>·</span>
 <span>Sandbox</span>
 <span>·</span>
 <span>Trusted Folders</span>
 <span>·</span>
 <span>Checkpointing</span>
 </div>
 </div>
 </div>
 </div>
 <button
 onClick={() => onNavigate?.('overview')}
 className="mt-4 text-sm text-heading hover:underline flex items-center gap-1"
 >
 查看详细架构图 →
 </button>
 </section>

 {/* Reading Tips */}
 <section className="bg-surface/30 rounded-lg p-6 border border-edge">
 <h2 className="text-xl font-bold text-heading mb-6">
 阅读建议
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div className="flex items-start gap-3">
 <span className="shrink-0 w-6 h-6 rounded-full bg-elevated text-heading flex items-center justify-center text-xs border border-edge/30">1</span>
 <div>
 <strong className="text-heading">从宏观到微观</strong>
 <p className="text-body mt-1">先看架构概览理解全貌，再深入具体模块</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <span className="shrink-0 w-6 h-6 rounded-full bg-elevated text-heading flex items-center justify-center text-xs border border-edge/30">2</span>
 <div>
 <strong className="text-heading">结合动画理解</strong>
 <p className="text-body mt-1">51 个交互动画帮助可视化理解复杂流程</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <span className="shrink-0 w-6 h-6 rounded-full bg-elevated text-heading flex items-center justify-center text-xs border border-edge/30">3</span>
 <div>
 <strong className="text-heading">跟随源码引用</strong>
 <p className="text-body mt-1">每个关键点都有源文件路径和行号，方便对照</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <span className="shrink-0 w-6 h-6 rounded-full bg-elevated text-heading flex items-center justify-center text-xs border border-edge/30">4</span>
 <div>
 <strong className="text-heading">使用搜索功能</strong>
 <p className="text-body mt-1">按 <kbd className="px-1.5 py-0.5 bg-surface rounded text-xs border border-edge">⌘K</kbd> 快速跳转到任意页面</p>
 </div>
 </div>
 </div>
 </section>

 {/* About */}
 <section className="text-center py-6">
 <h2 className="text-lg font-bold text-heading mb-3">关于本文档</h2>
 <p className="text-sm text-body mb-6">
 基于 <a href="https://github.com/google-gemini/gemini-cli" className="text-heading hover:underline">gemini-cli</a> 源码分析，
 所有结论均附带源文件路径和行号引用。
 </p>
 <div className="flex justify-center gap-8 text-xs text-dim">
 <span>100+ 页面</span>
 <span>54 动画</span>
 <span>源码行级引用</span>
 </div>
 </section>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
