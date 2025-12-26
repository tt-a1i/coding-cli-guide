import { useState } from 'react';

interface GlossaryProps {
  onNavigate?: (tab: string) => void;
}

interface Term {
  term: string;
  definition: string;
  category: string;
  relatedPage?: string;
  example?: string;
}

const glossaryTerms: Term[] = [
  // Core Concepts
  {
    term: 'Turn',
    definition: '一次完整的交互循环：用户输入 → AI 响应 → 工具执行 → 结果反馈。每个 Turn 可能包含多次工具调用。系统设置最大 100 轮防止无限循环。',
    category: 'core',
    relatedPage: 'interaction-loop',
    example: '用户问"读取 config.json"，AI 调用 Read 工具，返回内容，算一个 Turn',
  },
  {
    term: 'Continuation',
    definition: 'AI 完成工具调用后自动继续对话的机制。当 finish_reason 不是 STOP 时，系统将工具结果反馈给 AI 继续处理。',
    category: 'core',
    relatedPage: 'gemini-chat',
    example: 'AI 读取文件后，需要继续分析内容，自动触发 Continuation',
  },
  {
    term: 'StreamingState',
    definition: '流式响应的状态机，包含三个状态：Idle（空闲）、Responding（响应中）、WaitingForConfirmation（等待确认）。',
    category: 'state',
    relatedPage: 'streaming-response-anim',
  },
  {
    term: 'finish_reason',
    definition: 'API 返回的终止原因。STOP 表示正常结束，TOOL_USE 表示需要执行工具，MAX_TOKENS 表示达到长度限制。',
    category: 'core',
    relatedPage: 'gemini-chat',
  },

  // Tool System
  {
    term: 'ToolKind',
    definition: '工具类型枚举：ReadOnly（只读）、WriteFiles（写文件）、Bash（执行命令）、Subagent（子代理）等，决定审批级别。',
    category: 'tool',
    relatedPage: 'tool-arch',
  },
  {
    term: 'ToolScheduler',
    definition: '工具调度器，负责管理工具执行队列、并发控制、权限检查和结果收集。',
    category: 'tool',
    relatedPage: 'tool-scheduler',
    example: '同时请求 3 个文件读取时，调度器并行执行',
  },
  {
    term: 'ToolCallRequest',
    definition: 'AI 发起的工具调用请求，包含工具名称、参数和调用 ID。需要经过审批后才能执行。',
    category: 'tool',
    relatedPage: 'tool-detail',
  },
  {
    term: 'FunctionResponse',
    definition: '工具执行后返回给 AI 的结果，包含输出内容、错误信息等，用于 Continuation。',
    category: 'tool',
    relatedPage: 'function-response-anim',
  },

  // Security
  {
    term: 'ApprovalMode',
    definition: '审批模式，控制工具执行前是否需要用户确认。Plan（最严格）→ Default → AutoEdit → YOLO（最宽松）。',
    category: 'security',
    relatedPage: 'approval-mode',
  },
  {
    term: 'TrustedFolder',
    definition: '信任文件夹机制，只有在信任目录下才能使用 AutoEdit/YOLO 等高权限模式。防止误操作系统文件。',
    category: 'security',
    relatedPage: 'trusted-folders',
  },
  {
    term: 'Checkpointing',
    definition: '基于 Git 的检查点恢复机制，在执行高危操作前自动创建 Git commit，支持一键回滚。',
    category: 'security',
    relatedPage: 'checkpointing',
  },
  {
    term: 'Sandbox',
    definition: '沙箱隔离环境，通过 Docker 容器或 macOS Seatbelt 限制 CLI 的文件系统和网络访问权限。',
    category: 'security',
    relatedPage: 'sandbox',
  },

  // Extension
  {
    term: 'MCP',
    definition: 'Model Context Protocol，Anthropic 提出的工具动态注册协议。允许外部服务以标准方式提供工具给 AI 使用。',
    category: 'extension',
    relatedPage: 'mcp',
  },
  {
    term: 'Subagent',
    definition: '子代理系统，将复杂任务委托给专门的 Agent 处理。支持 Task、Plan、Explore 等多种代理类型。',
    category: 'extension',
    relatedPage: 'subagent',
  },
  {
    term: 'Skill',
    definition: '技能系统，用户可定义的命令扩展。通过 /skill-name 调用，可以封装常用工作流。',
    category: 'extension',
    relatedPage: 'custom-cmd',
  },

  // UI & System
  {
    term: 'Ink',
    definition: 'React for CLI 的渲染库，允许使用 React 组件构建终端 UI。CLI 的所有界面都基于 Ink 实现。',
    category: 'ui',
    relatedPage: 'ui',
  },
  {
    term: 'PromptBuilder',
    definition: '系统提示词构建器，根据当前环境、工具列表、用户配置动态生成系统提示词。',
    category: 'prompt',
    relatedPage: 'system-prompt',
  },
  {
    term: 'Context Compression',
    definition: '上下文压缩机制，当对话历史过长时，自动摘要早期内容以节省 token。',
    category: 'core',
    relatedPage: 'context-compression-anim',
  },

  // Loop Detection
  {
    term: 'LoopDetection',
    definition: '循环检测服务，防止 AI 陷入重复操作的死循环。采用三层检测：工具调用哈希、内容流窗口、LLM 分析。',
    category: 'security',
    relatedPage: 'loop-detect',
  },

  // Token Management
  {
    term: 'TokenLimit',
    definition: '模型的上下文窗口大小限制。不同模型差异很大：Gemini 2M、Claude 200K、GPT-4o 128K。',
    category: 'core',
    relatedPage: 'token-limit-matcher-anim',
  },
  {
    term: 'TokenManager',
    definition: 'Token 计数和管理服务，实时跟踪输入输出的 token 使用量，触发压缩策略。',
    category: 'core',
    relatedPage: 'shared-token-manager-anim',
  },

  // Session
  {
    term: 'Session',
    definition: '会话，一次 CLI 运行期间的完整交互上下文。包含对话历史、工具状态、配置等。',
    category: 'core',
    relatedPage: 'session-state-anim',
  },
  {
    term: 'WelcomeBack',
    definition: '会话恢复功能，重新打开 CLI 时可以继续之前的对话，通过本地存储持久化。',
    category: 'core',
    relatedPage: 'welcome-back',
  },

  // Commands
  {
    term: 'SlashCommand',
    definition: '以 / 开头的内置命令，如 /help、/clear、/config。由 CLI 本地处理，不发送给 AI。',
    category: 'command',
    relatedPage: 'slash-cmd',
  },
  {
    term: 'AtCommand',
    definition: '以 @ 开头的上下文注入命令，如 @file.ts、@web:url。将外部内容注入到当前对话。',
    category: 'command',
    relatedPage: 'at-cmd',
  },
  {
    term: 'ShellMode',
    definition: '以 ! 开头直接执行 shell 命令，绕过 AI 直接在终端运行。如 !ls、!git status。',
    category: 'command',
    relatedPage: 'shell-modes',
  },

  // Content Generation
  {
    term: 'ContentGenerator',
    definition: 'AI 内容生成器，负责调用 AI API 并处理流式响应。是 CLI 与 AI 服务通信的核心组件。',
    category: 'core',
    relatedPage: 'content-gen',
    example: 'generateContentStream() 发起请求，通过 AsyncIterator 逐块返回响应',
  },
  {
    term: 'PromptPipeline',
    definition: '提示词处理管道，将系统提示、工具定义、对话历史、用户输入组装成完整的 API 请求。',
    category: 'prompt',
    relatedPage: 'prompt-pipeline-anim',
  },
  {
    term: 'MessageFormat',
    definition: '消息格式转换器，负责不同 AI 厂商格式之间的转换。如 Anthropic 的 content blocks 与 OpenAI 的 messages。',
    category: 'core',
    relatedPage: 'message-format-anim',
  },

  // File System
  {
    term: 'FileDiscovery',
    definition: '文件发现系统，基于 BFS 算法搜索文件，支持 .gitignore、.qwenignore 等 ignore 模式。',
    category: 'tool',
    relatedPage: 'bfs-file-search-anim',
    example: 'Glob 工具使用 FileDiscovery 查找匹配的文件',
  },
  {
    term: 'IgnorePattern',
    definition: '文件忽略模式，支持 .gitignore 语法。按优先级：.qwenignore > .gitignore > 内置默认。',
    category: 'tool',
    example: '*.log, node_modules/, .git/ 等默认忽略',
  },

  // Provider System
  {
    term: 'Provider',
    definition: 'AI 服务提供商抽象，如 QwenProvider、OpenAIProvider、AnthropicProvider。封装了各厂商的 API 差异。',
    category: 'core',
    relatedPage: 'multi-provider',
  },
  {
    term: 'ModelLimit',
    definition: '模型参数限制，包括 contextWindow（上下文窗口）、outputTokens（输出限制）等。不同模型差异巨大。',
    category: 'core',
    relatedPage: 'token-limit-matcher-anim',
    example: 'Gemini 2M tokens、Claude 200K、GPT-4o 128K',
  },

  // Internal Mechanisms
  {
    term: 'ChunkAssembly',
    definition: '流式响应的块组装机制，将零散的流式数据块组装成完整的消息或工具调用。',
    category: 'core',
    relatedPage: 'chunk-assembly-anim',
  },
  {
    term: 'StreamingParser',
    definition: '流式解析器，实时解析 AI 响应流，提取文本内容和工具调用请求。',
    category: 'core',
    relatedPage: 'streaming-parser-anim',
  },
  {
    term: 'LRUCache',
    definition: '最近最少使用缓存，用于缓存文件搜索结果、Token 计数等。提高重复操作效率。',
    category: 'tool',
    relatedPage: 'lru-cache-anim',
  },
  {
    term: 'ExponentialBackoff',
    definition: '指数退避重试策略，遇到暂时性错误时等待 1s、2s、4s... 递增时间后重试。',
    category: 'security',
    relatedPage: 'exponential-backoff-anim',
    example: '429 Rate Limit 错误时自动退避重试',
  },

  // PTY & Shell
  {
    term: 'PTY',
    definition: '伪终端（Pseudo-Terminal），用于运行 shell 命令并捕获输出。支持交互式命令。',
    category: 'tool',
    relatedPage: 'pty-lifecycle-anim',
  },
  {
    term: 'ShellInjection',
    definition: '命令注入检测，防止 AI 构造的命令包含危险操作。如检测 rm -rf、sudo 等。',
    category: 'security',
    relatedPage: 'shell-injection-anim',
  },

  // Memory & Context
  {
    term: 'MemoryImport',
    definition: '记忆导入机制，从 .claude/CLAUDE.md 等文件加载项目级指令。支持循环依赖检测。',
    category: 'core',
    relatedPage: 'memory-import-anim',
    example: '@import ./other-rules.md 支持递归导入',
  },
  {
    term: 'ContextSplit',
    definition: '上下文分割点计算，决定在哪里截断历史对话进行压缩。保留重要的工具调用结果。',
    category: 'core',
    relatedPage: 'chat-compression-anim',
  },

  // State Management
  {
    term: 'TurnState',
    definition: 'Turn 状态机的状态枚举：idle → preparing → streaming → tool_execution → completion。',
    category: 'state',
    relatedPage: 'turn-internal-anim',
  },
  {
    term: 'ToolCallStatus',
    definition: '工具调用状态：validating → scheduled → executing → awaiting_approval → success/error/cancelled。',
    category: 'tool',
    relatedPage: 'tool-confirmation-anim',
  },

  // OAuth & Auth
  {
    term: 'DeviceFlow',
    definition: 'OAuth 设备授权流程，用户在浏览器中授权，CLI 轮询获取 token。无需用户输入密码。',
    category: 'security',
    relatedPage: 'oauth-device-flow-anim',
  },

  // Editing
  {
    term: 'SmartEdit',
    definition: '智能编辑引擎，支持模糊匹配和自动修复。当 old_string 不完全匹配时尝试智能定位。',
    category: 'tool',
    relatedPage: 'smart-edit-anim',
  },
  {
    term: 'LLMEditFixer',
    definition: 'AI 辅助的编辑修复器，当 Edit 工具失败时调用 AI 分析并修复匹配问题。',
    category: 'tool',
    example: '处理缩进差异、空白字符不匹配等常见问题',
  },

  // Vim Integration
  {
    term: 'VimBuffer',
    definition: 'Vim 模式的文本缓冲区，支持 hjkl 移动、dd 删除、yy 复制等操作。',
    category: 'ui',
    relatedPage: 'vim-buffer-anim',
  },
];

const categories = [
  { id: 'all', label: '全部', icon: '📚' },
  { id: 'core', label: '核心概念', icon: '⚙️' },
  { id: 'tool', label: '工具系统', icon: '🔧' },
  { id: 'security', label: '安全机制', icon: '🛡️' },
  { id: 'extension', label: '扩展系统', icon: '🔌' },
  { id: 'command', label: '命令系统', icon: '💻' },
  { id: 'state', label: '状态管理', icon: '🔄' },
  { id: 'ui', label: 'UI/UX', icon: '🎨' },
  { id: 'prompt', label: 'Prompt', icon: '📝' },
];

export default function Glossary({ onNavigate }: GlossaryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filteredTerms = glossaryTerms.filter((term) => {
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'terminal-green';
      case 'tool': return 'amber';
      case 'security': return 'red-400';
      case 'extension': return 'purple';
      case 'command': return 'cyber-blue';
      case 'state': return 'orange-400';
      case 'ui': return 'pink-400';
      case 'prompt': return 'cyan-400';
      default: return 'text-muted';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <section className="text-center py-6">
        <h1 className="text-3xl font-bold font-mono mb-3">
          <span className="text-[var(--amber)]">📖</span>
          <span className="text-[var(--text-primary)] ml-3">术语表</span>
        </h1>
        <p className="text-[var(--text-secondary)] font-mono text-sm">
          // 核心概念和关键术语快速参考
        </p>
      </section>

      {/* Search and Filter */}
      <section className="terminal-panel">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索术语..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--bg-void)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[var(--terminal-green)]"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/50'
                  : 'bg-[var(--bg-void)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--border)]'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Terms Grid */}
      <section className="space-y-3">
        <div className="text-sm text-[var(--text-muted)] font-mono mb-4">
          找到 {filteredTerms.length} 个术语
        </div>

        {filteredTerms.map((item) => (
          <div
            key={item.term}
            className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden hover:border-[var(--border)] transition-colors"
          >
            <button
              onClick={() => setExpandedTerm(expandedTerm === item.term ? null : item.term)}
              className="w-full px-5 py-4 flex items-start gap-4 text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <code className={`px-2 py-1 bg-[var(--${getCategoryColor(item.category)})]/10 text-[var(--${getCategoryColor(item.category)})] rounded text-sm font-mono font-bold`}>
                    {item.term}
                  </code>
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-void)] px-2 py-0.5 rounded">
                    {categories.find((c) => c.id === item.category)?.label}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.definition}
                </p>
              </div>
              <span className={`text-[var(--text-muted)] transition-transform ${expandedTerm === item.term ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {expandedTerm === item.term && (
              <div className="px-5 pb-4 space-y-3 animate-fadeIn">
                {item.example && (
                  <div className="bg-[var(--bg-void)] rounded-lg p-3 border-l-2 border-[var(--amber)]">
                    <span className="text-xs text-[var(--amber)] font-mono">示例：</span>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{item.example}</p>
                  </div>
                )}
                {item.relatedPage && (
                  <button
                    onClick={() => onNavigate?.(item.relatedPage!)}
                    className="text-sm text-[var(--cyber-blue)] hover:underline font-mono flex items-center gap-1"
                  >
                    <span>查看详细文档</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Quick Stats */}
      <section className="terminal-panel">
        <h3 className="text-sm font-bold font-mono text-[var(--text-primary)] mb-4">术语分布</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.slice(1).map((cat) => {
            const count = glossaryTerms.filter((t) => t.category === cat.id).length;
            return (
              <div
                key={cat.id}
                className="bg-[var(--bg-void)] rounded-lg p-3 border border-[var(--border-subtle)] text-center"
              >
                <div className="text-lg mb-1">{cat.icon}</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{count}</div>
                <div className="text-xs text-[var(--text-muted)]">{cat.label}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
