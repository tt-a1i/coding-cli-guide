import { HighlightBox } from '../components/HighlightBox';

interface StartHereProps {
  onNavigate: (tab: string) => void;
}

export function StartHere({ onNavigate }: StartHereProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">
          Innies CLI 架构深度解析
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          一个 AI Coding CLI 的完整架构拆解与源码导读
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">
            42+ 技术文档
          </span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
            源码行级引用
          </span>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
            Mermaid 可视化
          </span>
        </div>
      </section>

      {/* Why This Project */}
      <section className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">为什么分析这个项目？</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-2xl mb-2">🏗️</div>
            <h3 className="font-semibold text-cyan-400 mb-1">复杂系统设计</h3>
            <p className="text-gray-400">
              涵盖状态机、事件驱动、插件架构等现代系统设计模式
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-semibold text-cyan-400 mb-1">安全架构实践</h3>
            <p className="text-gray-400">
              沙箱隔离、审批机制、信任边界等企业级安全设计
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-2xl mb-2">🔌</div>
            <h3 className="font-semibold text-cyan-400 mb-1">可扩展架构</h3>
            <p className="text-gray-400">
              MCP 协议、子代理系统、自定义命令等扩展机制
            </p>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          选择你的学习路径
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 5-Minute Path */}
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 rounded-xl p-6 border border-green-500/30 hover:border-green-400/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚡</span>
              <div>
                <h3 className="text-lg font-bold text-green-400">5 分钟速览</h3>
                <p className="text-xs text-gray-400">适合快速了解</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              只看核心，快速理解 CLI 的整体架构和工作原理
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('overview')}
                className="w-full text-left px-3 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-sm text-green-300 transition-colors"
              >
                1. 架构概览 →
              </button>
              <button
                onClick={() => onNavigate('interaction-loop')}
                className="w-full text-left px-3 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-sm text-green-300 transition-colors"
              >
                2. 交互主循环 →
              </button>
              <button
                onClick={() => onNavigate('approval-mode')}
                className="w-full text-left px-3 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-sm text-green-300 transition-colors"
              >
                3. 审批模式 →
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <p className="text-xs text-gray-500">
                <strong className="text-green-400">你会了解：</strong>
                AI 如何接收指令、执行工具、确保安全
              </p>
            </div>
          </div>

          {/* 15-Minute Path */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📖</span>
              <div>
                <h3 className="text-lg font-bold text-blue-400">15 分钟精读</h3>
                <p className="text-xs text-gray-400">适合面试准备</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              深入核心模块，理解设计决策和实现细节
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('startup-chain')}
                className="w-full text-left px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-sm text-blue-300 transition-colors"
              >
                1. 启动链路 →
              </button>
              <button
                onClick={() => onNavigate('lifecycle')}
                className="w-full text-left px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-sm text-blue-300 transition-colors"
              >
                2. 请求生命周期 →
              </button>
              <button
                onClick={() => onNavigate('tool-scheduler')}
                className="w-full text-left px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-sm text-blue-300 transition-colors"
              >
                3. 工具调度系统 →
              </button>
              <button
                onClick={() => onNavigate('checkpointing')}
                className="w-full text-left px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-sm text-blue-300 transition-colors"
              >
                4. 检查点恢复 →
              </button>
              <button
                onClick={() => onNavigate('mcp')}
                className="w-full text-left px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-sm text-blue-300 transition-colors"
              >
                5. MCP 集成 →
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-500/20">
              <p className="text-xs text-gray-500">
                <strong className="text-blue-400">你会了解：</strong>
                完整的请求链路、安全机制、扩展架构
              </p>
            </div>
          </div>

          {/* Deep Dive Path */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔬</span>
              <div>
                <h3 className="text-lg font-bold text-purple-400">深度研究</h3>
                <p className="text-xs text-gray-400">适合源码学习</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              全量文档，逐模块深入源码实现
            </p>
            <div className="space-y-2 text-sm text-purple-300">
              <div className="px-3 py-2 bg-purple-500/10 rounded-lg">
                ⚙️ 核心机制 (8 篇)
              </div>
              <div className="px-3 py-2 bg-purple-500/10 rounded-lg">
                🔧 工具系统 (5 篇)
              </div>
              <div className="px-3 py-2 bg-purple-500/10 rounded-lg">
                💻 命令系统 (5 篇)
              </div>
              <div className="px-3 py-2 bg-purple-500/10 rounded-lg">
                🛡️ 安全可靠 (7 篇)
              </div>
              <div className="px-3 py-2 bg-purple-500/10 rounded-lg">
                📚 更多... (17 篇)
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-500/20">
              <p className="text-xs text-gray-500">
                <strong className="text-purple-400">适合：</strong>
                想要完整理解系统架构的开发者
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Insights */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">核心发现</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="🔄 消息驱动的事件循环" variant="blue">
            <p className="text-sm text-gray-300">
              CLI 的核心是一个 <code className="text-cyan-300">useGeminiStream</code> Hook，
              实现了 用户输入 → AI 思考 → 工具调用 → 结果反馈 的无限循环。
              这个循环通过 <code className="text-cyan-300">finish_reason</code> 控制是否继续。
            </p>
          </HighlightBox>

          <HighlightBox title="🛡️ 三层安全门禁" variant="green">
            <p className="text-sm text-gray-300">
              1. <strong>信任文件夹</strong> - 限制高权限模式的使用范围<br/>
              2. <strong>审批模式</strong> - 控制工具执行是否需要确认<br/>
              3. <strong>检查点恢复</strong> - 支持操作回滚
            </p>
          </HighlightBox>

          <HighlightBox title="🔌 MCP 协议扩展" variant="purple">
            <p className="text-sm text-gray-300">
              通过 Model Context Protocol 实现工具动态注册，
              支持 IDE 集成（VS Code Diff）、外部服务接入等扩展场景。
            </p>
          </HighlightBox>

          <HighlightBox title="⚠️ 已知设计权衡" variant="yellow">
            <p className="text-sm text-gray-300">
              Core 层工具名 <code className="text-yellow-300">edit</code> 与
              CLI 层 <code className="text-yellow-300">replace</code> 存在命名不一致，
              影响 AUTO_EDIT 和 Checkpointing 的触发判断。
            </p>
          </HighlightBox>
        </div>
      </section>

      {/* About */}
      <section className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 text-center">
        <h2 className="text-lg font-bold text-white mb-2">关于本文档</h2>
        <p className="text-sm text-gray-400 mb-4">
          基于 <a href="https://github.com/zhimanai/innies-cli" className="text-cyan-400 hover:underline">innies-cli</a> 源码分析，
          所有结论均附带源文件路径和行号引用。
        </p>
        <div className="flex justify-center gap-6 text-xs text-gray-500">
          <span>📄 42+ 页面</span>
          <span>📊 30+ 流程图</span>
          <span>🔗 源码行级引用</span>
        </div>
      </section>
    </div>
  );
}
