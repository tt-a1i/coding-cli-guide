import { useState } from 'react';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

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
    definition: '审批模式，控制工具执行前是否需要用户确认。Default → AutoEdit → YOLO（由严格到宽松）。',
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
    term: 'JSON-RPC 2.0',
    definition: 'MCP 协议底层使用的远程过程调用协议。通过 JSON 格式传输请求和响应，支持批量调用和通知。',
    category: 'extension',
    relatedPage: 'mcp-handshake-anim',
    example: '{"jsonrpc":"2.0","method":"tools/list","id":1}',
  },
  {
    term: 'ACP',
    definition: 'Agent Connection Protocol，IDE 与 CLI 之间的通信协议。用于 Zed/VS Code 等编辑器集成，支持文件操作、诊断信息等。',
    category: 'extension',
    relatedPage: 'zed-integration',
  },
  {
    term: 'Subagent',
    definition: '子代理系统，将复杂任务委托给专门的 Agent 处理。支持 Task、Plan、Explore 等多种代理类型。',
    category: 'extension',
    relatedPage: 'subagent',
  },
  {
    term: 'Skill',
    definition:
      'Agent Skills（技能系统）：启用 experimental.skills 后，CLI 会从 ~/.gemini/skills 与 .gemini/skills 扫描 */SKILL.md；模型可通过 activate_skill 激活技能并获得 <ACTIVATED_SKILL> 指令注入；用户可用 /skills 列表/启用/禁用。',
    category: 'extension',
    relatedPage: 'agent-skills',
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
    relatedPage: 'token-accounting',
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
    definition: '文件发现系统，基于 BFS 算法搜索文件，支持 .gitignore、.geminiignore 等 ignore 模式。',
    category: 'tool',
    relatedPage: 'bfs-file-search-anim',
    example: 'Glob 工具使用 FileDiscovery 查找匹配的文件',
  },
  {
    term: 'IgnorePattern',
    definition: '文件忽略模式，支持 .gitignore 语法。按优先级：.geminiignore > .gitignore > 内置默认。',
    category: 'tool',
    example: '*.log, node_modules/, .git/ 等默认忽略',
  },
  {
    term: 'mtime',
    definition: '文件修改时间戳（modification time），用于检测文件变化和缓存失效判断。',
    category: 'tool',
    relatedPage: 'file-discovery',
    example: '文件 mtime 变化 → 缓存失效 → 重新读取',
  },
  {
    term: 'FileLock',
    definition: '文件锁机制，防止多进程同时写入同一文件导致数据损坏。CLI 在写文件前获取锁。',
    category: 'tool',
    example: 'Write 工具先获取锁 → 写入内容 → 释放锁',
  },

  // Provider System
  {
    term: 'Provider',
    definition: 'AI 服务提供商抽象，如 GeminiProvider、OpenAIProvider、AnthropicProvider。封装了各厂商的 API 差异。',
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
    term: 'ChunkMerging',
    definition: '流式响应块合并策略，将同一工具调用的多个 delta 块合并为完整参数。处理网络分片和部分 JSON。',
    category: 'core',
    relatedPage: 'streaming-json-parser-anim',
  },
  {
    term: 'IndexCollision',
    definition: '流式工具调用时多个调用使用相同索引的冲突情况。解析器通过 ID 映射和自动分配新索引解决。',
    category: 'core',
    relatedPage: 'streaming-json-parser-anim',
    example: 'call_1 和 call_2 都用 index:0 → 解析器为 call_2 分配 index:1',
  },
  {
    term: 'safeJsonParse',
    definition: '安全 JSON 解析函数，自动修复不完整的流式 JSON（如未闭合的引号、缺失的括号）。',
    category: 'core',
    relatedPage: 'streaming-json-parser-anim',
    example: '输入 `{"content":"hello` 时自动补全闭合引号和括号 → `{"content":"hello"}`',
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
  {
    term: 'Jitter',
    definition: '重试时添加的随机延迟，防止多个客户端同时重试导致"惊群效应"。通常为 0-30% 的随机偏移。',
    category: 'security',
    relatedPage: 'error-recovery-patterns',
    example: 'delay = baseDelay * 2^attempt + random(0, baseDelay * 0.3)',
  },
  {
    term: 'RetryBudget',
    definition: '重试预算，限制单位时间内的最大重试次数。防止失败请求消耗过多资源。',
    category: 'security',
    relatedPage: 'error-recovery-patterns',
    example: '每分钟最多 10 次重试，超过则直接失败',
  },
  {
    term: 'FallbackModel',
    definition: '降级模型策略，当主模型不可用时自动切换到备选模型。保证服务可用性。',
    category: 'core',
    relatedPage: 'error-recovery-patterns',
    example: 'gemini-1.5-pro 失败 → 降级到 gemini-1.5-flash',
  },
  {
    term: 'CircuitBreaker',
    definition: '熔断器模式，当错误率超过阈值时暂时停止请求，避免雪崩效应。一段时间后自动恢复。',
    category: 'security',
    relatedPage: 'error-recovery-patterns',
    example: '连续 5 次失败 → 熔断 30s → 半开状态尝试恢复',
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
  {
    term: 'PKCE',
    definition: 'Proof Key for Code Exchange，OAuth 2.0 安全扩展。通过 code_verifier 和 code_challenge 防止授权码拦截攻击，CLI 等公开客户端必须使用。',
    category: 'security',
    relatedPage: 'google-authentication',
    example: '生成随机 code_verifier → SHA256 哈希得到 code_challenge → 授权时验证',
  },
  {
    term: 'device_code',
    definition: 'OAuth 设备流中的设备标识码，CLI 用于轮询授权状态。与 user_code（用户在浏览器输入的短码）配对使用。',
    category: 'security',
    relatedPage: 'oauth-device-flow-anim',
  },
  {
    term: 'authorization_pending',
    definition: 'OAuth 设备流轮询状态，表示用户尚未完成授权。CLI 应继续按 interval 间隔轮询。',
    category: 'security',
    example: '轮询返回 authorization_pending → 等待 5s → 继续轮询',
  },
  {
    term: 'slow_down',
    definition: 'OAuth 设备流轮询错误，表示轮询过快。CLI 应增加轮询间隔（通常 +5s）后重试。',
    category: 'security',
    example: '收到 slow_down → interval = interval + 5 → 继续轮询',
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
    relatedPage: 'smart-edit-anim',
    example: '处理缩进差异、空白字符不匹配等常见问题',
  },
  {
    term: 'TodoWrite',
    definition: 'TODO_WRITE 工具名的别名。用于创建和管理任务列表，帮助 AI 跟踪复杂任务的进度。',
    category: 'tool',
    relatedPage: 'tool-ref',
    example: 'TODO_WRITE { todos: [{ content: "修复 Bug", status: "in_progress" }] }',
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

const relatedPages: RelatedPage[] = [
  { id: 'start', label: 'Start Here', description: '快速入门指南' },
  { id: 'overview', label: '架构概览', description: '系统架构全景图' },
  { id: 'learning-path', label: '学习路径', description: '系统性学习路线' },
  { id: 'tool-ref', label: '工具参考', description: '内置工具详解' },
  { id: 'interaction-loop', label: '核心循环', description: 'interactionLoop 详解' },
  { id: 'gemini-chat', label: 'GeminiChat', description: '核心引擎架构' },
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

      {/* 为什么这样设计 */}
      <Layer title="为什么这样设计" icon="💡">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-lg p-5 border border-[var(--terminal-green)]/30">
            <h4 className="text-[var(--terminal-green)] font-bold font-mono mb-3">术语统一命名</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              CLI 项目涉及多个技术领域（AI、编辑器、Shell、网络协议等），每个领域都有自己的术语体系。
              统一的术语表确保团队成员和贡献者使用相同的语言描述相同的概念，减少沟通成本和理解偏差。
            </p>
          </div>

          <div className="bg-gradient-to-r from-[var(--amber)]/10 to-[var(--purple)]/10 rounded-lg p-5 border border-[var(--amber)]/30">
            <h4 className="text-[var(--amber)] font-bold font-mono mb-3">分类组织</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              按功能领域分类（核心概念、工具系统、安全机制等）而非字母排序，
              帮助读者建立概念间的关联。相关术语聚集在一起，更容易形成系统性理解。
            </p>
          </div>

          <div className="bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--terminal-green)]/10 rounded-lg p-5 border border-[var(--cyber-blue)]/30">
            <h4 className="text-[var(--cyber-blue)] font-bold font-mono mb-3">关联导航</h4>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              每个术语都链接到详细文档页面。术语表作为索引入口，
              让读者可以快速定位感兴趣的主题，然后深入阅读完整内容。
            </p>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
