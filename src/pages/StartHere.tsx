import { HighlightBox } from '../components/HighlightBox';

interface StartHereProps {
  onNavigate?: (tab: string) => void;
}

export function StartHere(_props: StartHereProps) {
  return (
    <div className="space-y-10 max-w-4xl mx-auto animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center py-10 relative">
        {/* Decorative background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-[var(--terminal-green)]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-full text-sm font-mono text-[var(--text-muted)] mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--terminal-green)] animate-pulse shadow-[0_0_6px_var(--terminal-green-glow)]" />
            <span>$ ./qwen-cli --deep-dive</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4 tracking-tight">
            <span className="text-[var(--terminal-green)]">Qwen CLI</span>
            <span className="text-[var(--text-primary)]"> 架构深度解析</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] mb-8 font-mono">
            // 一个 AI Coding CLI 的完整架构拆解与源码导读
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-4 py-2 bg-[var(--terminal-green)]/10 text-[var(--terminal-green)] rounded-md font-mono border border-[var(--terminal-green)]/20">
              <span className="opacity-60 mr-1">$</span> 42+ docs
            </span>
            <span className="px-4 py-2 bg-[var(--amber)]/10 text-[var(--amber)] rounded-md font-mono border border-[var(--amber)]/20">
              <span className="opacity-60 mr-1">#</span> line-refs
            </span>
            <span className="px-4 py-2 bg-[var(--cyber-blue)]/10 text-[var(--cyber-blue)] rounded-md font-mono border border-[var(--cyber-blue)]/20">
              <span className="opacity-60 mr-1">~</span> mermaid
            </span>
          </div>
        </div>
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

          <HighlightBox title="🛡️ 三层安全门禁" variant="green">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              1. <strong className="text-[var(--terminal-green)]">信任文件夹</strong> - 限制高权限模式的使用范围<br/>
              2. <strong className="text-[var(--terminal-green)]">审批模式</strong> - 控制工具执行是否需要确认<br/>
              3. <strong className="text-[var(--terminal-green)]">检查点恢复</strong> - 支持操作回滚
            </p>
          </HighlightBox>

          <HighlightBox title="🔌 MCP 协议扩展" variant="purple">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              通过 Model Context Protocol 实现工具动态注册，
              支持 IDE 集成（VS Code Diff）、外部服务接入等扩展场景。
            </p>
          </HighlightBox>

          <HighlightBox title="⚠️ 已知设计权衡" variant="yellow">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Core 层工具名 <code className="text-[var(--amber)] bg-[var(--amber)]/10 px-1 rounded">edit</code> 与
              CLI 层 <code className="text-[var(--amber)] bg-[var(--amber)]/10 px-1 rounded">replace</code> 存在命名不一致，
              影响 AUTO_EDIT 和 Checkpointing 的触发判断。
            </p>
          </HighlightBox>
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
          基于 <a href="https://github.com/zhimanai/qwen-cli" className="text-[var(--terminal-green)] hover:underline hover:text-[var(--terminal-green)] transition-colors">qwen-cli</a> 源码分析，
          所有结论均附带源文件路径和行号引用。
        </p>
        <div className="flex justify-center gap-8 text-xs font-mono text-[var(--text-muted)]">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--terminal-green)]" />
            42+ 页面
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
            30+ 流程图
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyber-blue)]" />
            源码行级引用
          </span>
        </div>
      </section>
    </div>
  );
}
