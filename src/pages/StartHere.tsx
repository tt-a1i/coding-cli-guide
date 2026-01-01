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
      icon: '🏗️',
      color: 'terminal-green',
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
      icon: '💻',
      color: 'cyber-blue',
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
      icon: '🔬',
      color: 'amber',
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
    { term: 'Turn', definition: '一次完整的 用户输入→AI响应→工具执行 循环', category: 'core' },
    { term: 'Continuation', definition: 'AI 完成工具调用后自动继续的机制', category: 'core' },
    { term: 'Hook', definition: '事件拦截系统 - 11 种事件类型、3 层配置优先级', category: 'event' },
    { term: 'Policy', definition: '安全策略引擎 - ALLOW/DENY/ASK_USER 三种决策', category: 'security' },
    { term: 'MessageBus', definition: '发布/订阅消息总线 - 解耦异步通信', category: 'event' },
    { term: 'ModelRouter', definition: '智能模型路由 - Flash/Pro 策略链选择', category: 'routing' },
    { term: 'Agent', definition: '子代理框架 - Local（TOML 定义）/ Remote（A2A 协议）', category: 'agent' },
    { term: 'ApprovalMode', definition: '审批级别：Plan/Default/AutoEdit/YOLO', category: 'security' },
    { term: 'MCP', definition: 'Model Context Protocol - 工具动态注册协议', category: 'extension' },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center py-10 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-[var(--terminal-green)]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-full text-sm font-mono text-[var(--text-muted)] mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--terminal-green)] animate-pulse shadow-[0_0_6px_var(--terminal-green-glow)]" />
            <span>$ gemini --deep-dive</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 tracking-tight">
            <span className="text-[var(--terminal-green)]">Gemini CLI</span>
            <span className="text-[var(--text-primary)]"> 架构深度解析</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] mb-8 font-mono">
            // 一个 AI Coding CLI 的完整架构拆解与源码导读
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-4 py-2 bg-[var(--terminal-green)]/10 text-[var(--terminal-green)] rounded-md font-mono border border-[var(--terminal-green)]/20">
              <span className="opacity-60 mr-1">$</span> 100+ 页面
            </span>
            <span className="px-4 py-2 bg-[var(--amber)]/10 text-[var(--amber)] rounded-md font-mono border border-[var(--amber)]/20">
              <span className="opacity-60 mr-1">#</span> 54 动画
            </span>
            <span className="px-4 py-2 bg-[var(--cyber-blue)]/10 text-[var(--cyber-blue)] rounded-md font-mono border border-[var(--cyber-blue)]/20">
              <span className="opacity-60 mr-1">~</span> 行级引用
            </span>
          </div>
        </div>
      </section>

      {/* Scope Declaration */}
      <section className="bg-[var(--bg-panel)]/50 rounded-lg p-5 border border-[var(--border-subtle)]">
        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <span className="text-[var(--terminal-green)]">📖</span>
          这份指南是什么
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* What this IS */}
          <div className="bg-[var(--terminal-green)]/5 rounded-lg p-4 border border-[var(--terminal-green)]/20">
            <h4 className="text-[var(--terminal-green)] font-semibold mb-2 text-sm flex items-center gap-2">
              <span>✓</span> 本指南覆盖
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>架构设计</strong> — 系统如何分层、模块如何协作</li>
              <li>• <strong>源码导读</strong> — 关键代码的实现细节与行级引用</li>
              <li>• <strong>设计决策</strong> — 为什么这样设计、有哪些权衡</li>
              <li>• <strong>内部机制</strong> — 状态机、调度器、格式转换等</li>
            </ul>
          </div>

          {/* What this is NOT */}
          <div className="bg-[var(--red)]/5 rounded-lg p-4 border border-[var(--red)]/20">
            <h4 className="text-[var(--red)] font-semibold mb-2 text-sm flex items-center gap-2">
              <span>✗</span> 本指南不覆盖
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>使用教程</strong> — 如何安装、配置、日常使用</li>
              <li>• <strong>命令手册</strong> — 完整的命令行参数说明</li>
              <li>• <strong>API 文档</strong> — 公开接口的调用方式</li>
              <li>• <strong>使用层 FAQ</strong> — "为什么报错""如何配置"等日常问答</li>
            </ul>
          </div>
        </div>

        {/* Where to go */}
        <div className="bg-[var(--bg-void)] rounded-lg p-4 border border-[var(--border-subtle)]">
          <h4 className="text-[var(--text-primary)] font-semibold mb-3 text-sm">🔗 相关资源</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="text-[var(--cyber-blue)]">📘</span>
              <span><strong>用户文档</strong> → <code className="text-[var(--cyber-blue)]">/docs</code> 目录</span>
            </div>
            <button
              onClick={() => onNavigate?.('upstream-diff')}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--amber)] transition-colors text-left"
            >
              <span className="text-[var(--amber)]">🔀</span>
              <span><strong>上游改造</strong> → <code className="text-[var(--amber)] hover:underline">查看详情</code></span>
            </button>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="text-[var(--purple)]">🏢</span>
              <span><strong>版本记录</strong> → <code className="text-[var(--purple)]">CHANGELOG.md</code></span>
            </div>
          </div>
        </div>

        {/* Naming note - simplified */}
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-sm">
          <div className="flex items-start gap-2">
            <span className="text-[var(--amber)]">💡</span>
            <p className="text-[var(--text-muted)]">
              <strong className="text-[var(--text-secondary)]">关于本指南：</strong>
              本指南基于 Google Gemini CLI 源码分析，涵盖核心机制如
              <code className="text-[var(--amber)] bg-[var(--amber)]/10 px-1 rounded mx-1">GeminiChat</code>、
              <code className="text-[var(--amber)] bg-[var(--amber)]/10 px-1 rounded mx-1">Hook/Policy</code>、
              <code className="text-[var(--amber)] bg-[var(--amber)]/10 px-1 rounded mx-1">Agent 框架</code>
              等事件驱动架构。
            </p>
          </div>
        </div>
      </section>

      {/* Learning Path Selection */}
      <section className="terminal-panel">
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <span className="text-[var(--cyber-blue)]">→</span>
          <span>选择你的学习路径</span>
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 font-mono">
          // 根据你的目标选择推荐的阅读顺序
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(learningPaths).map(([key, path]) => (
            <button
              key={key}
              onClick={() => setSelectedPath(key as 'architect' | 'developer' | 'explorer')}
              className={`text-left bg-[var(--bg-void)] rounded-lg p-5 border transition-all group ${
                selectedPath === key
                  ? `border-[var(--${path.color})] bg-[var(--${path.color})]/5`
                  : 'border-[var(--border-subtle)] hover:border-[var(--border)]'
              }`}
            >
              <div className="text-2xl mb-3">{path.icon}</div>
              <h3 className={`font-semibold font-mono mb-2 ${
                selectedPath === key ? `text-[var(--${path.color})]` : 'text-[var(--text-primary)]'
              }`}>
                {path.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {path.description}
              </p>
            </button>
          ))}
        </div>

        {/* Selected Path Details */}
        {selectedPath && (
          <div className="bg-[var(--bg-void)] rounded-lg p-6 border border-[var(--border-subtle)] animate-fadeIn">
            <h4 className="font-semibold font-mono text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span>{learningPaths[selectedPath].icon}</span>
              <span>{learningPaths[selectedPath].title} 推荐路线</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {learningPaths[selectedPath].steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => onNavigate?.(step.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--terminal-green)] transition-colors group"
                >
                  <span className="text-xs text-[var(--text-muted)] font-mono">{index + 1}.</span>
                  <span className="text-sm font-mono text-[var(--text-primary)] group-hover:text-[var(--terminal-green)]">
                    {step.label}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">→</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4 font-mono">
              💡 点击任意步骤跳转到对应页面
            </p>
          </div>
        )}
      </section>

      {/* Core Concepts Quick Reference */}
      <section className="terminal-panel">
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <span className="text-[var(--amber)]">📖</span>
          <span>核心概念速览</span>
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 font-mono">
          // 开始阅读前，了解这些关键术语
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coreTerms.map((item) => (
            <div
              key={item.term}
              className="flex items-start gap-3 bg-[var(--bg-void)] rounded-lg p-4 border border-[var(--border-subtle)]"
            >
              <code className="shrink-0 px-2 py-1 bg-[var(--terminal-green)]/10 text-[var(--terminal-green)] rounded text-sm font-mono">
                {item.term}
              </code>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {item.definition}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigate?.('glossary')}
          className="mt-4 text-sm text-[var(--cyber-blue)] hover:underline font-mono flex items-center gap-1"
        >
          <span>查看完整术语表</span>
          <span>→</span>
        </button>
      </section>

      {/* Why This Project */}
      <section className="terminal-panel">
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <span className="text-[var(--amber)]">?</span>
          <span>为什么分析这个项目</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-[var(--bg-void)] rounded-lg p-5 border border-[var(--border-subtle)] hover:border-[var(--terminal-green-dim)] transition-colors group">
            <div className="text-2xl mb-3 opacity-80 group-hover:opacity-100 transition-opacity">🏗️</div>
            <h3 className="font-semibold font-mono text-[var(--terminal-green)] mb-2">复杂系统设计</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              涵盖状态机、事件驱动、插件架构等现代系统设计模式
            </p>
          </div>
          <div className="bg-[var(--bg-void)] rounded-lg p-5 border border-[var(--border-subtle)] hover:border-[var(--amber-dim)] transition-colors group">
            <div className="text-2xl mb-3 opacity-80 group-hover:opacity-100 transition-opacity">🔐</div>
            <h3 className="font-semibold font-mono text-[var(--amber)] mb-2">安全架构实践</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              沙箱隔离、审批机制、信任边界等企业级安全设计
            </p>
          </div>
          <div className="bg-[var(--bg-void)] rounded-lg p-5 border border-[var(--border-subtle)] hover:border-[var(--cyber-blue-dim)] transition-colors group">
            <div className="text-2xl mb-3 opacity-80 group-hover:opacity-100 transition-opacity">🔌</div>
            <h3 className="font-semibold font-mono text-[var(--cyber-blue)] mb-2">可扩展架构</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              MCP 协议、子代理系统、自定义命令等扩展机制
            </p>
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="terminal-panel">
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <span className="text-[var(--purple)]">💭</span>
          <span>设计哲学</span>
        </h2>
        <div className="space-y-4 text-sm">
          <div className="bg-[var(--bg-void)] rounded-lg p-5 border-l-4 border-[var(--terminal-green)]">
            <h3 className="font-semibold text-[var(--terminal-green)] mb-2">「AI 是无状态的」</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              每次 AI 请求都是独立的 HTTP 调用。AI 不记得之前的对话，所有上下文必须在每次请求时重新发送。
              这个约束决定了整个系统的架构：CLI 必须管理对话历史、工具状态、会话持久化。
            </p>
          </div>

          <div className="bg-[var(--bg-void)] rounded-lg p-5 border-l-4 border-[var(--cyber-blue)]">
            <h3 className="font-semibold text-[var(--cyber-blue)] mb-2">「工具在本地执行」</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              AI 只负责决策「调用什么工具」，实际执行发生在用户机器上。
              这意味着：用户对敏感操作有完全控制权，不需要将代码或数据发送到云端，
              同时也意味着 CLI 必须实现完整的权限控制和沙箱隔离。
            </p>
          </div>

          <div className="bg-[var(--bg-void)] rounded-lg p-5 border-l-4 border-[var(--amber)]">
            <h3 className="font-semibold text-[var(--amber)] mb-2">「Continuation 驱动循环」</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              当 AI 需要工具时，它返回特殊的 finish_reason。CLI 执行工具后，
              将结果反馈给 AI 继续对话。这个「请求→工具→反馈→请求」的循环，
              使 AI 能够自主完成多步骤任务，而不需要用户每一步都参与。
            </p>
          </div>

          <div className="bg-[var(--bg-void)] rounded-lg p-5 border-l-4 border-[var(--purple)]">
            <h3 className="font-semibold text-[var(--purple)] mb-2">「抽象层解耦」</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              CLI 层、Core 层、工具层、API 层各司其职。这种分层使得：
              切换 AI 厂商只需实现新的 API 适配器，添加新工具只需注册到工具系统，
              扩展功能通过 MCP 协议动态加载。代价是理解成本较高，但换来了极大的灵活性。
            </p>
          </div>
        </div>
      </section>

      {/* Key Insights */}
      <section>
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <span className="text-[var(--terminal-green)]">!</span>
          <span>核心发现</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="🔄 消息驱动的事件循环" variant="blue">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              CLI 的核心是一个 <code className="text-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10 px-1 rounded">useGeminiStream</code> Hook，
              实现了 用户输入 → AI 思考 → 工具调用 → 结果反馈 的无限循环。
              这个循环通过 <code className="text-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10 px-1 rounded">finish_reason</code> 控制是否继续。
            </p>
          </HighlightBox>

          <HighlightBox title="🎯 事件驱动架构" variant="green">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--terminal-green)]">Hook System</strong> - 11 种事件拦截点<br/>
              <strong className="text-[var(--terminal-green)]">Policy Engine</strong> - 安全策略决策<br/>
              <strong className="text-[var(--terminal-green)]">MessageBus</strong> - 发布/订阅解耦通信
            </p>
          </HighlightBox>

          <HighlightBox title="🛡️ 多层安全门禁" variant="purple">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--purple)]">Policy Engine</strong> - ALLOW/DENY/ASK_USER 决策<br/>
              <strong className="text-[var(--purple)]">信任文件夹</strong> - 限制高权限模式范围<br/>
              <strong className="text-[var(--purple)]">沙箱隔离</strong> - 安全执行边界
            </p>
          </HighlightBox>

          <HighlightBox title="🔀 智能模型路由" variant="yellow">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              <code className="text-[var(--amber)] bg-[var(--amber)]/10 px-1 rounded">CompositeStrategy</code> 策略链：
              Override → Classifier（LLM 复杂度分析）→ Fallback → Default，
              智能选择 Flash 或 Pro 模型。
            </p>
          </HighlightBox>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="terminal-panel">
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <span className="text-[var(--purple)]">◈</span>
          <span>架构全景图</span>
        </h2>
        <div className="bg-[var(--bg-void)] rounded-lg p-6 border border-[var(--border-subtle)]">
          <div className="grid grid-cols-5 gap-3 text-center text-xs font-mono">
            {/* Layer 1: User Interface */}
            <div className="col-span-5 bg-[var(--terminal-green)]/10 rounded-lg p-3 border border-[var(--terminal-green)]/30">
              <div className="text-[var(--terminal-green)] font-semibold mb-2">UI Layer</div>
              <div className="flex justify-center gap-4 text-[var(--text-muted)]">
                <span>Terminal</span>
                <span>•</span>
                <span>React/Ink</span>
                <span>•</span>
                <span>Prompt</span>
              </div>
            </div>

            {/* Layer 2: Core Loop */}
            <div className="col-span-5 bg-[var(--cyber-blue)]/10 rounded-lg p-3 border border-[var(--cyber-blue)]/30">
              <div className="text-[var(--cyber-blue)] font-semibold mb-2">Core Loop</div>
              <div className="flex justify-center gap-4 text-[var(--text-muted)]">
                <span>useGeminiStream</span>
                <span>→</span>
                <span>GeminiChat</span>
                <span>→</span>
                <span>ContentGenerator</span>
              </div>
            </div>

            {/* Layer 3: Event-Driven Architecture */}
            <div className="col-span-5 bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30">
              <div className="text-cyan-400 font-semibold mb-2">Event-Driven Architecture</div>
              <div className="flex justify-center gap-4 text-[var(--text-muted)]">
                <span>Hook System</span>
                <span>•</span>
                <span>Policy Engine</span>
                <span>•</span>
                <span>MessageBus</span>
                <span>•</span>
                <span>Model Router</span>
              </div>
            </div>

            {/* Layer 4: Tool & Extension */}
            <div className="col-span-3 bg-[var(--amber)]/10 rounded-lg p-3 border border-[var(--amber)]/30">
              <div className="text-[var(--amber)] font-semibold mb-2">Tool System</div>
              <div className="text-[var(--text-muted)]">
                Scheduler • Executor • 20+ Tools
              </div>
            </div>
            <div className="col-span-2 bg-[var(--purple)]/10 rounded-lg p-3 border border-[var(--purple)]/30">
              <div className="text-[var(--purple)] font-semibold mb-2">Agent Framework</div>
              <div className="text-[var(--text-muted)]">
                Local • Remote • MCP
              </div>
            </div>

            {/* Layer 5: Security */}
            <div className="col-span-5 bg-red-500/10 rounded-lg p-3 border border-red-500/30">
              <div className="text-red-400 font-semibold mb-2">Security Layer</div>
              <div className="flex justify-center gap-4 text-[var(--text-muted)]">
                <span>Policy Rules</span>
                <span>•</span>
                <span>Sandbox</span>
                <span>•</span>
                <span>Trusted Folders</span>
                <span>•</span>
                <span>Checkpointing</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate?.('overview')}
          className="mt-4 text-sm text-[var(--cyber-blue)] hover:underline font-mono flex items-center gap-1"
        >
          <span>查看详细架构图</span>
          <span>→</span>
        </button>
      </section>

      {/* Reading Tips */}
      <section className="terminal-panel">
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <span className="text-[var(--terminal-green)]">💡</span>
          <span>阅读建议</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] flex items-center justify-center text-xs">1</span>
            <div>
              <strong className="text-[var(--text-primary)]">从宏观到微观</strong>
              <p className="text-[var(--text-secondary)] mt-1">先看架构概览理解全貌，再深入具体模块</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] flex items-center justify-center text-xs">2</span>
            <div>
              <strong className="text-[var(--text-primary)]">结合动画理解</strong>
              <p className="text-[var(--text-secondary)] mt-1">51 个交互动画帮助可视化理解复杂流程</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] flex items-center justify-center text-xs">3</span>
            <div>
              <strong className="text-[var(--text-primary)]">跟随源码引用</strong>
              <p className="text-[var(--text-secondary)] mt-1">每个关键点都有源文件路径和行号，方便对照</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] flex items-center justify-center text-xs">4</span>
            <div>
              <strong className="text-[var(--text-primary)]">使用搜索功能</strong>
              <p className="text-[var(--text-secondary)] mt-1">按 <kbd className="px-1.5 py-0.5 bg-[var(--bg-void)] rounded text-xs border border-[var(--border-subtle)]">⌘K</kbd> 快速跳转到任意页面</p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="terminal-panel text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-void)] border border-[var(--border-subtle)] rounded-full text-xs font-mono text-[var(--text-muted)] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--terminal-green)]" />
          <span>README.md</span>
        </div>
        <h2 className="text-lg font-bold font-mono text-[var(--text-primary)] mb-3">关于本文档</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 font-mono">
          基于 <a href="https://github.com/anthropics/gemini-cli" className="text-[var(--terminal-green)] hover:underline hover:text-[var(--terminal-green)] transition-colors">gemini-cli</a> 源码分析，
          所有结论均附带源文件路径和行号引用。
        </p>
        <div className="flex justify-center gap-8 text-xs font-mono text-[var(--text-muted)]">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--terminal-green)]" />
            100+ 页面
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
            54 动画
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyber-blue)]" />
            源码行级引用
          </span>
        </div>
      </section>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
