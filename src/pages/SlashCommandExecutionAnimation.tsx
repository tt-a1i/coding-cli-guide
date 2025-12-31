import { useState, useEffect, useCallback } from 'react';
import { CodeBlock } from '../components/CodeBlock';

// ===== Introduction Component =====
function Introduction({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              斜杠命令执行系统
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              CommandService 多源加载与执行管道
            </p>
          </div>
        </div>
        <span
          className={`text-[var(--text-secondary)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6">
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--terminal-green)]">
                🎯 核心概念
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>CommandService</strong>: 命令编排中心，协调多个加载器
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>三源加载</strong>: 内置命令、文件命令、MCP Prompt
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>两阶段匹配</strong>: 先匹配命令名，再匹配别名
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>七种结果类型</strong>: submit_prompt, message,
                    dialog, tool 等
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--amber)]">
                📂 核心文件
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    CommandService.ts
                  </code>
                  <span>命令编排中心</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    BuiltinCommandLoader.ts
                  </code>
                  <span>28+ 内置命令</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    FileCommandLoader.ts
                  </code>
                  <span>TOML 文件命令</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    slashCommandProcessor.ts
                  </code>
                  <span>交互模式执行</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[var(--bg-terminal)] rounded-lg">
            <h4 className="text-sm font-semibold text-[var(--purple)] mb-2">
              💡 设计亮点
            </h4>
            <div className="text-sm text-[var(--text-secondary)]">
              <p>
                采用 Provider 模式的加载器架构，所有命令源通过
                Promise.allSettled 并行加载，具有良好的容错性和扩展性。
              </p>
              <p className="mt-2">
                文件命令支持{' '}
                <code className="text-[var(--terminal-green)]">@{'{'}</code>{' '}
                文件注入和{' '}
                <code className="text-[var(--terminal-green)]">!{'{'}</code>{' '}
                Shell 执行，通过安全优先的处理顺序防止注入攻击。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Command Flow Animation =====
type FlowStep =
  | 'input'
  | 'validation'
  | 'load-builtin'
  | 'load-file'
  | 'load-mcp'
  | 'merge'
  | 'parse'
  | 'build-context'
  | 'execute'
  | 'result';

const flowSteps: {
  id: FlowStep;
  label: string;
  description: string;
  code?: string;
}[] = [
  {
    id: 'input',
    label: '用户输入',
    description: '检测是否为斜杠命令（排除代码注释）',
    code: `// isSlashCommand() 检测
if (input.startsWith('/') &&
    !input.startsWith('//') &&
    !input.startsWith('/*')) {
  return true;
}`,
  },
  {
    id: 'validation',
    label: '输入验证',
    description: '验证命令格式，提取命令路径',
  },
  {
    id: 'load-builtin',
    label: '加载内置命令',
    description: 'BuiltinCommandLoader 加载 28+ 预定义命令',
    code: `// 内置命令列表
const builtinCommands = [
  chatCommand,      // /chat
  memoryCommand,    // /memory
  configCommand,    // /config
  clearCommand,     // /clear
  aboutCommand,     // /about
  // ... 28+ 命令
];`,
  },
  {
    id: 'load-file',
    label: '加载文件命令',
    description: 'FileCommandLoader 扫描 TOML 文件',
    code: `// 搜索路径
const searchPaths = [
  '~/.gemini/commands/',      // 用户目录
  '.gemini/commands/',         // 项目目录
  '{extension}/commands/',     // 扩展目录
];

// 文件名 → 命令名
// foo/bar/baz.toml → /foo:bar:baz`,
  },
  {
    id: 'load-mcp',
    label: '加载 MCP Prompt',
    description: 'McpPromptLoader 从 MCP 服务器获取',
    code: `// 转换 MCP Prompt → SlashCommand
const mcpCommand: SlashCommand = {
  name: prompt.name,
  description: prompt.description,
  kind: 'MCP_PROMPT',
  action: async (ctx, args) => {
    // 调用 MCP 服务器执行
  }
};`,
  },
  {
    id: 'merge',
    label: '合并命令',
    description: 'Promise.allSettled 并行加载，合并去重',
    code: `// 并行加载所有命令源
const results = await Promise.allSettled([
  mcpLoader.loadCommands(),
  builtinLoader.loadCommands(),
  fileLoader.loadCommands(),
]);

// 合并命令，处理命名冲突
return mergeCommands(results);`,
  },
  {
    id: 'parse',
    label: '两阶段解析',
    description: '先匹配命令名，再匹配别名',
    code: `function parseSlashCommand(input, commands) {
  // 第一阶段：精确匹配命令名
  for (const cmd of commands) {
    if (input.startsWith('/' + cmd.name)) {
      return { command: cmd, args };
    }
  }

  // 第二阶段：匹配别名
  for (const cmd of commands) {
    for (const alias of cmd.altNames || []) {
      if (input.startsWith('/' + alias)) {
        return { command: cmd, args };
      }
    }
  }
}`,
  },
  {
    id: 'build-context',
    label: '构建上下文',
    description: '创建 CommandContext 包含所有服务',
    code: `const context: CommandContext = {
  services: {
    geminiClient,
    fileDiscovery,
    shellExecution,
    // ...
  },
  ui: {
    addMessage,
    showDialog,
    // ...
  },
  session: {
    history,
    config,
    // ...
  }
};`,
  },
  {
    id: 'execute',
    label: '执行命令',
    description: '调用 command.action(context, args)',
  },
  {
    id: 'result',
    label: '处理结果',
    description: '根据结果类型分发处理',
    code: `// 7 种结果类型
type CommandResult =
  | { type: 'submit_prompt'; prompt: string }
  | { type: 'message'; content: string }
  | { type: 'dialog'; component: ReactNode }
  | { type: 'tool'; toolCall: ToolCall }
  | { type: 'confirm_shell_commands'; cmds: string[] }
  | { type: 'confirm_action'; action: () => void }
  | { type: 'quit' };`,
  },
];

function CommandFlowAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= flowSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStepClick = useCallback((index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  }, []);

  const currentStepData = flowSteps[currentStep];

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-[var(--border-subtle)]" />
        <div className="flex justify-between relative">
          {flowSteps.map((step, index) => {
            const isActive = index === currentStep;
            const isPast = index < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className="relative flex flex-col items-center group"
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 border-[var(--border-subtle)] flex items-center justify-center text-xs font-bold z-10 transition-all duration-300 ${
                    isActive
                      ? 'scale-125 bg-[var(--terminal-green)]'
                      : isPast
                        ? 'bg-[var(--cyber-blue)]'
                        : 'bg-[var(--bg-card)]'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-xs mt-2 max-w-[80px] text-center ${
                    isActive
                      ? 'text-[var(--terminal-green)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setCurrentStep(0);
            setIsPlaying(false);
          }}
          className="px-4 py-2 bg-[var(--bg-terminal)] rounded-lg text-sm hover:bg-[var(--bg-card)] transition-colors"
        >
          ⏮ 重置
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-6 py-2 bg-[var(--terminal-green)] text-black rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          {isPlaying ? '⏸ 暂停' : '▶ 播放'}
        </button>
        <button
          onClick={() => {
            if (currentStep < flowSteps.length - 1) {
              setCurrentStep((prev) => prev + 1);
            }
          }}
          disabled={currentStep >= flowSteps.length - 1}
          className="px-4 py-2 bg-[var(--bg-terminal)] rounded-lg text-sm hover:bg-[var(--bg-card)] transition-colors disabled:opacity-50"
        >
          下一步 ⏭
        </button>
      </div>

      {/* Current Step Detail */}
      <div
        key={currentStep}
        className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] animate-fade-in"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-[var(--terminal-green)]/20 flex items-center justify-center text-2xl">
            {currentStep + 1}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {currentStepData.label}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {currentStepData.description}
            </p>
          </div>
        </div>

        {currentStepData.code && (
          <div className="mt-4">
            <CodeBlock
              title={`步骤 ${currentStep + 1}: ${currentStepData.label}`}
              language="typescript"
              code={currentStepData.code}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Command Loaders Comparison =====
function CommandLoadersComparison() {
  const loaders = [
    {
      name: 'BuiltinCommandLoader',
      icon: '🔧',
      color: 'var(--terminal-green)',
      features: [
        '28+ 预定义命令',
        '硬编码在应用中',
        '零延迟加载',
        '支持子命令层级',
      ],
      examples: ['/chat', '/memory', '/config', '/clear', '/about'],
    },
    {
      name: 'FileCommandLoader',
      icon: '📄',
      color: 'var(--cyber-blue)',
      features: [
        'TOML 文件定义',
        '多目录搜索',
        '@{} 文件注入',
        '!{} Shell 执行',
      ],
      examples: [
        '~/.gemini/commands/review.toml → /review',
        '.gemini/commands/deploy.toml → /deploy',
      ],
    },
    {
      name: 'McpPromptLoader',
      icon: '🔌',
      color: 'var(--purple)',
      features: [
        'MCP 服务器获取',
        '动态加载',
        '服务器命名空间',
        '参数自动映射',
      ],
      examples: ['context7:search → /context7:search', 'sequential:think → /sequential:think'],
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {loaders.map((loader) => (
        <div
          key={loader.name}
          className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{loader.icon}</span>
            <h3
              className="font-bold text-lg"
              style={{ color: loader.color }}
            >
              {loader.name}
            </h3>
          </div>

          <ul className="space-y-2 mb-4">
            {loader.features.map((feature, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
              >
                <span style={{ color: loader.color }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-secondary)] mb-2">示例:</p>
            {loader.examples.map((example, i) => (
              <code
                key={i}
                className="block text-xs bg-[var(--bg-terminal)] px-2 py-1 rounded mb-1"
              >
                {example}
              </code>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Result Types Animation =====
function ResultTypesAnimation() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const resultTypes = [
    {
      type: 'submit_prompt',
      icon: '💬',
      color: 'var(--terminal-green)',
      description: '将处理后的 prompt 发送给 LLM',
      example: '{ type: "submit_prompt", prompt: "分析这段代码..." }',
      flow: '命令执行 → 返回 prompt → 发送到 LLM → 流式响应',
    },
    {
      type: 'message',
      icon: '📝',
      color: 'var(--cyber-blue)',
      description: '显示信息或错误消息',
      example: '{ type: "message", content: "配置已更新" }',
      flow: '命令执行 → 返回消息 → 显示在 UI',
    },
    {
      type: 'dialog',
      icon: '🪟',
      color: 'var(--purple)',
      description: '打开 UI 对话框',
      example: '{ type: "dialog", component: <SettingsDialog /> }',
      flow: '命令执行 → 返回组件 → 渲染对话框',
    },
    {
      type: 'tool',
      icon: '🔧',
      color: 'var(--amber)',
      description: '调度工具执行',
      example: '{ type: "tool", toolCall: { name: "read", args: {...} } }',
      flow: '命令执行 → 返回工具调用 → 调度器执行',
    },
    {
      type: 'confirm_shell_commands',
      icon: '⚠️',
      color: 'var(--error)',
      description: '请求 Shell 命令确认',
      example: '{ type: "confirm_shell_commands", cmds: ["npm install"] }',
      flow: '命令执行 → 用户确认 → 重新调用命令',
    },
    {
      type: 'confirm_action',
      icon: '❓',
      color: 'var(--warning)',
      description: '请求操作确认',
      example: '{ type: "confirm_action", action: deleteFiles }',
      flow: '命令执行 → 用户确认 → 执行 action',
    },
    {
      type: 'quit',
      icon: '🚪',
      color: 'var(--text-secondary)',
      description: '退出应用程序',
      example: '{ type: "quit" }',
      flow: '命令执行 → 清理资源 → 退出进程',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {resultTypes.map((rt) => (
          <button
            key={rt.type}
            onClick={() =>
              setSelectedType(selectedType === rt.type ? null : rt.type)
            }
            className={`p-4 rounded-xl border transition-all hover:scale-105 ${
              selectedType === rt.type
                ? 'border-[var(--terminal-green)] bg-[var(--terminal-green)]/10'
                : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'
            }`}
          >
            <span className="text-2xl block mb-2">{rt.icon}</span>
            <span
              className="text-xs font-mono"
              style={{ color: rt.color }}
            >
              {rt.type}
            </span>
          </button>
        ))}
      </div>

      {selectedType && (
        <div className="animate-fade-in overflow-hidden">
          {(() => {
            const rt = resultTypes.find((r) => r.type === selectedType)!;
            return (
              <div className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{rt.icon}</span>
                  <div>
                    <h4
                      className="text-lg font-bold"
                      style={{ color: rt.color }}
                    >
                      {rt.type}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {rt.description}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                      返回示例:
                    </p>
                    <code className="block text-sm bg-[var(--bg-terminal)] p-3 rounded-lg">
                      {rt.example}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                      处理流程:
                    </p>
                    <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-terminal)] p-3 rounded-lg">
                      {rt.flow.split(' → ').map((step, i, arr) => (
                        <span key={i}>
                          <span className="text-[var(--terminal-green)]">
                            {step}
                          </span>
                          {i < arr.length - 1 && (
                            <span className="text-[var(--cyber-blue)]">
                              {' '}
                              →{' '}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ===== TOML Command Security Flow =====
function TomlSecurityFlow() {
  const [step, setStep] = useState(0);

  const securitySteps = [
    {
      title: '1. @File 处理器',
      description: '先处理文件注入，防止动态路径攻击',
      before: 'prompt = "分析 @{./code.ts} 运行 !{echo {{args}}}"',
      after: 'prompt = "分析 [文件内容] 运行 !{echo {{args}}}"',
      color: 'var(--terminal-green)',
    },
    {
      title: '2. Shell 处理器',
      description: '处理 Shell 命令，转义用户参数',
      before: 'prompt = "分析 [文件内容] 运行 !{echo {{args}}}"',
      after: 'prompt = "分析 [文件内容] 运行 [Shell输出]"',
      color: 'var(--cyber-blue)',
    },
    {
      title: '3. 参数处理器',
      description: '追加未使用的原始参数',
      before: 'prompt = "分析 [文件内容] 运行 [Shell输出]"',
      after: 'prompt = "分析 [文件内容] 运行 [Shell输出] [额外参数]"',
      color: 'var(--purple)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        {securitySteps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              step === i
                ? 'bg-[var(--terminal-green)] text-black'
                : 'bg-[var(--bg-terminal)]'
            }`}
          >
            步骤 {i + 1}
          </button>
        ))}
      </div>

      <div
        key={step}
        className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] animate-fade-in"
      >
        <h4
          className="text-lg font-bold mb-2"
          style={{ color: securitySteps[step].color }}
        >
          {securitySteps[step].title}
        </h4>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {securitySteps[step].description}
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-2">输入:</p>
            <code className="block text-sm bg-[var(--bg-terminal)] p-3 rounded-lg break-all">
              {securitySteps[step].before}
            </code>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-2">输出:</p>
            <code className="block text-sm bg-[var(--bg-terminal)] p-3 rounded-lg break-all">
              {securitySteps[step].after}
            </code>
          </div>
        </div>
      </div>

      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <h5 className="text-sm font-semibold text-red-400 mb-2">
          ⚠️ 安全设计要点
        </h5>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1">
          <li>• @File 必须在 !Shell 之前处理，防止路径注入</li>
          <li>
            • {'{{args}}'} 在 Shell 中会被转义，防止命令注入
          </li>
          <li>• 包含 !{'{}'} 的命令需要用户确认才能执行</li>
        </ul>
      </div>
    </div>
  );
}

// ===== Main Export =====
export default function SlashCommandExecutionAnimation() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  return (
    <div className="space-y-12">
      <Introduction
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
      />

      <section>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          命令执行流程动画
        </h2>
        <CommandFlowAnimation />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          命令加载器对比
        </h2>
        <CommandLoadersComparison />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          结果类型处理
        </h2>
        <ResultTypesAnimation />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          TOML 命令安全处理流程
        </h2>
        <TomlSecurityFlow />
      </section>

      <section>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          子命令层级
        </h2>
        <div className="mt-4">
          <CodeBlock
            title="子命令树遍历"
            language="typescript"
            code={`// 子命令支持嵌套层级
chatCommand.subCommands = [
  listCommand,    // /chat list
  saveCommand,    // /chat save <tag>
  resumeCommand,  // /chat resume <tag>
];

// 用法: /chat resume my-session
// 解析: 遍历树 → chatCommand → resumeCommand → args = ["my-session"]

function parseSubCommand(input: string, cmd: SlashCommand): ParseResult {
  const parts = input.split(' ');

  // 递归查找最深匹配的子命令
  if (cmd.subCommands) {
    for (const sub of cmd.subCommands) {
      if (parts[1] === sub.name) {
        return parseSubCommand(parts.slice(1).join(' '), sub);
      }
    }
  }

  return { command: cmd, args: parts.slice(1) };
}`}
          />
        </div>
      </section>
    </div>
  );
}
