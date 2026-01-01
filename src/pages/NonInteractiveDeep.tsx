import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'core-architecture', label: '核心架构', description: '系统设计' },
  { id: 'tool-system', label: 'Tool 系统', description: '工具执行' },
  { id: 'output-formatter', label: '输出格式化', description: 'JSON 输出' },
  { id: 'slash-commands', label: 'Slash 命令', description: '命令系统' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🖥️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--cyber-blue)] font-bold">一句话：</span>
              管道友好的非交互 CLI 模式，支持单次查询、工具调用循环、JSON 输出，适用于脚本和自动化
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">Pipe</div>
              <div className="text-xs text-[var(--text-muted)]">管道友好</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">JSON</div>
              <div className="text-xs text-[var(--text-muted)]">结构化输出</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">Multi</div>
              <div className="text-xs text-[var(--text-muted)]">多轮工具调用</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">YOLO</div>
              <div className="text-xs text-[var(--text-muted)]">无确认模式</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">使用场景</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                CI/CD 集成
              </span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                脚本自动化
              </span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                管道组合
              </span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                批量处理
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码位置:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/cli/src/nonInteractiveCli.ts
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function NonInteractiveDeep() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const executionFlowChart = `flowchart TD
    subgraph Input["输入处理"]
        STDIN["stdin 或参数"]
        SLASH{Slash 命令?}
        AT["@ 命令处理"]
    end

    subgraph Loop["执行循环"]
        TURN["turnCount++"]
        CHECK{超过 maxTurns?}
        SEND["sendMessageStream"]
        STREAM["流式响应"]
    end

    subgraph Response["响应处理"]
        CONTENT["Content 事件"]
        TOOL["ToolCallRequest"]
        EXEC["executeToolCall"]
        PARTS["toolResponseParts"]
    end

    subgraph Output["输出"]
        TEXT["Text 模式"]
        JSON["JSON 模式"]
        EXIT["退出"]
    end

    STDIN --> SLASH
    SLASH -->|Yes| AT
    SLASH -->|No| AT
    AT --> TURN
    TURN --> CHECK
    CHECK -->|Yes| EXIT
    CHECK -->|No| SEND
    SEND --> STREAM
    STREAM --> CONTENT
    STREAM --> TOOL
    CONTENT --> TEXT
    CONTENT --> JSON
    TOOL --> EXEC
    EXEC --> PARTS
    PARTS --> TURN
    TEXT --> EXIT
    JSON --> EXIT

    style Input fill:#1a1a2e,stroke:#00d4ff
    style Loop fill:#1a1a2e,stroke:#00ff88
    style Response fill:#1a1a2e,stroke:#f59e0b
    style Output fill:#2d1f3d,stroke:#a855f7`;

  const toolLoopDiagram = `sequenceDiagram
    participant User as 用户/脚本
    participant CLI as NonInteractive CLI
    participant Model as LLM
    participant Tool as Tool Executor

    User->>CLI: gemini -p "create test.txt"
    CLI->>Model: sendMessageStream
    Model-->>CLI: ToolCallRequest (Write)
    CLI->>Tool: executeToolCall
    Tool-->>CLI: toolResponseParts
    CLI->>Model: sendMessageStream (tool results)
    Model-->>CLI: Content (完成消息)
    CLI->>User: stdout 输出`;

  const mainCodeExample = `// runNonInteractive - 主入口函数
export async function runNonInteractive(
  config: Config,
  settings: LoadedSettings,
  input: string,
  prompt_id: string,
): Promise<void> {
  return promptIdContext.run(prompt_id, async () => {
    const consolePatcher = new ConsolePatcher({
      stderr: true,
      debugMode: config.getDebugMode(),
    });

    try {
      consolePatcher.patch();

      // 处理 EPIPE 错误（管道提前关闭）
      process.stdout.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EPIPE') {
          process.exit(0);  // 优雅退出
        }
      });

      const geminiClient = config.getGeminiClient();
      const abortController = new AbortController();

      let query: Part[] | undefined;

      // 1. 处理 Slash 命令
      if (isSlashCommand(input)) {
        const slashCommandResult = await handleSlashCommand(
          input, abortController, config, settings
        );
        if (slashCommandResult) {
          query = slashCommandResult as Part[];
        }
      }

      // 2. 处理 @ 命令（文件引用）
      if (!query) {
        const { processedQuery, shouldProceed } = await handleAtCommand({
          query: input,
          config,
          addItem: (_item, _timestamp) => 0,
          onDebugMessage: () => {},
          messageId: Date.now(),
          signal: abortController.signal,
        });

        if (!shouldProceed || !processedQuery) {
          throw new FatalInputError(
            'Exiting due to an error processing the @ command.'
          );
        }
        query = processedQuery as Part[];
      }

      // 3. 执行对话循环
      let currentMessages: Content[] = [{ role: 'user', parts: query }];
      let turnCount = 0;

      while (true) {
        turnCount++;
        // 检查最大轮次限制
        if (config.getMaxSessionTurns() >= 0 &&
            turnCount > config.getMaxSessionTurns()) {
          handleMaxTurnsExceededError(config);
        }

        // ... 发送消息和处理响应
      }
    } finally {
      consolePatcher.cleanup();
      if (isTelemetrySdkInitialized()) {
        await shutdownTelemetry(config);
      }
    }
  });
}`;

  const responseHandlingCode = `// 响应处理循环
const toolCallRequests: ToolCallRequestInfo[] = [];

const responseStream = geminiClient.sendMessageStream(
  currentMessages[0]?.parts || [],
  abortController.signal,
  prompt_id,
);

let responseText = '';
for await (const event of responseStream) {
  if (abortController.signal.aborted) {
    handleCancellationError(config);
  }

  if (event.type === GeminiEventType.Content) {
    // 文本内容
    if (config.getOutputFormat() === OutputFormat.JSON) {
      responseText += event.value;  // JSON 模式累积
    } else {
      process.stdout.write(event.value);  // Text 模式流式输出
    }
  } else if (event.type === GeminiEventType.ToolCallRequest) {
    // 工具调用请求
    toolCallRequests.push(event.value);
  }
}

// 处理工具调用
if (toolCallRequests.length > 0) {
  const toolResponseParts: Part[] = [];

  for (const requestInfo of toolCallRequests) {
    const toolResponse = await executeToolCall(
      config,
      requestInfo,
      abortController.signal,
    );

    if (toolResponse.error) {
      handleToolError(requestInfo.name, toolResponse.error, config, ...);
    }

    if (toolResponse.responseParts) {
      toolResponseParts.push(...toolResponse.responseParts);
    }
  }

  // 继续循环，发送工具结果
  currentMessages = [{ role: 'user', parts: toolResponseParts }];
} else {
  // 无工具调用，输出结果并退出
  if (config.getOutputFormat() === OutputFormat.JSON) {
    const formatter = new JsonFormatter();
    const stats = uiTelemetryService.getMetrics();
    process.stdout.write(formatter.format(responseText, stats));
  } else {
    process.stdout.write('\\n');
  }
  return;  // 退出循环
}`;

  const nonInteractiveUICode = `// 非交互 UI 上下文 - 所有方法为 no-op
export function createNonInteractiveUI(): CommandContext['ui'] {
  return {
    addItem: (_item, _timestamp) => 0,
    clear: () => {},
    setDebugMessage: (_message) => {},
    loadHistory: (_newHistory) => {},
    pendingItem: null,
    setPendingItem: (_item) => {},
    toggleCorgiMode: () => {},
    toggleVimEnabled: async () => false,
    setGeminiMdFileCount: (_count) => {},
    reloadCommands: () => {},
    extensionsUpdateState: new Map(),
    dispatchExtensionStateUpdate: (_action) => {},
    addConfirmUpdateExtensionRequest: (_request) => {},
  };
}

// 用于 Slash 命令上下文
const context: CommandContext = {
  services: {
    config,
    settings,
    git: undefined,
    logger,
  },
  ui: createNonInteractiveUI(),  // 注入 no-op UI
  session: {
    stats: sessionStats,
    sessionShellAllowlist: new Set(),
  },
  invocation: {
    raw: trimmed,
    name: commandToExecute.name,
    args,
  },
};`;

  const slashCommandCode = `// Slash 命令处理（非交互模式）
export const handleSlashCommand = async (
  rawQuery: string,
  abortController: AbortController,
  config: Config,
  settings: LoadedSettings,
): Promise<PartListUnion | undefined> => {
  const trimmed = rawQuery.trim();
  if (!trimmed.startsWith('/')) {
    return;
  }

  // 只支持自定义命令
  const loaders = [new FileCommandLoader(config)];
  const commandService = await CommandService.create(
    loaders,
    abortController.signal,
  );
  const commands = commandService.getCommands();

  const { commandToExecute, args } = parseSlashCommand(rawQuery, commands);

  if (commandToExecute?.action) {
    const result = await commandToExecute.action(context, args);

    if (result) {
      switch (result.type) {
        case 'submit_prompt':
          return result.content;  // 返回 prompt 继续执行

        case 'confirm_shell_commands':
          // 非交互模式不支持确认
          throw new FatalInputError(
            'Exiting due to a confirmation prompt requested by the command.'
          );

        default:
          throw new FatalInputError(
            'Exiting due to command result not supported in non-interactive mode.'
          );
      }
    }
  }

  return;
};`;

  const usageExamples = `# 基本用法
echo "explain this code" | gemini
gemini -p "what is 2+2"
cat file.txt | gemini -p "summarize this"

# JSON 输出模式
gemini -p "list all files" --output-format json

# 文件引用
gemini -p "review @src/main.ts"

# Slash 命令
gemini -p "/custom-command arg1 arg2"

# 管道组合
git diff | gemini -p "generate commit message" | git commit -m -

# 批量处理
find . -name "*.ts" | xargs -I{} gemini -p "add docs to {}"

# CI/CD 集成
gemini -p "check for security issues in @package.json" \\
  --output-format json | jq '.issues'`;

  const featuresData = [
    { feature: '管道输入', description: 'stdin 读取，支持 echo/cat/pipe', example: 'cat file.txt | gemini' },
    { feature: '-p 参数', description: '直接指定 prompt', example: 'gemini -p "hello"' },
    { feature: '@ 命令', description: '文件引用展开', example: 'gemini -p "@src/main.ts"' },
    { feature: 'Slash 命令', description: '自定义命令执行', example: 'gemini -p "/my-command"' },
    { feature: 'JSON 输出', description: '结构化输出，含统计', example: '--output-format json' },
    { feature: 'EPIPE 处理', description: '管道提前关闭时优雅退出', example: 'gemini | head -1' },
    { feature: '工具循环', description: '自动执行工具调用', example: '多轮 tool 调用' },
    { feature: 'Max Turns', description: '轮次限制防止无限循环', example: '--max-turns 10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">非交互 CLI 模式</h1>
        <p className="text-[var(--text-secondary)] text-lg">
          管道友好的非交互执行模式，支持脚本自动化、CI/CD 集成和批量处理
        </p>
      </div>

      <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

      <Layer title="执行流程" icon="🔄" defaultOpen={true}>
        <HighlightBox title="NonInteractive CLI 执行流程" color="blue" className="mb-6">
          <MermaidDiagram chart={executionFlowChart} />
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--cyber-blue)]/30">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">1️⃣ 输入</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• stdin 或 -p 参数</li>
              <li>• Slash 命令解析</li>
              <li>• @ 文件引用展开</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--terminal-green)]/30">
            <div className="text-[var(--terminal-green)] font-bold mb-2">2️⃣ 执行</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 流式发送消息</li>
              <li>• 处理响应事件</li>
              <li>• 轮次计数器</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--amber)]/30">
            <div className="text-[var(--amber)] font-bold mb-2">3️⃣ 工具</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 收集工具调用请求</li>
              <li>• 执行工具操作</li>
              <li>• 返回结果继续</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--purple)]/30">
            <div className="text-[var(--purple)] font-bold mb-2">4️⃣ 输出</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• Text: 流式 stdout</li>
              <li>• JSON: 结构化输出</li>
              <li>• 遥测数据关闭</li>
            </ul>
          </div>
        </div>
      </Layer>

      <Layer title="工具调用循环" icon="🔁" defaultOpen={true}>
        <MermaidDiagram chart={toolLoopDiagram} />

        <div className="mt-4 bg-[var(--bg-terminal)] p-4 rounded-lg">
          <h4 className="text-[var(--terminal-green)] font-bold mb-2">循环特点</h4>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            <li>• <strong>自动工具执行</strong>：无需用户确认（YOLO 模式）</li>
            <li>• <strong>多轮支持</strong>：工具结果返回后继续对话</li>
            <li>• <strong>轮次限制</strong>：防止无限循环（maxSessionTurns）</li>
            <li>• <strong>错误处理</strong>：工具错误不中断，记录后继续</li>
          </ul>
        </div>
      </Layer>

      <Layer title="功能特性" icon="📋" defaultOpen={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 text-[var(--text-muted)]">特性</th>
                <th className="text-left py-2 text-[var(--text-muted)]">说明</th>
                <th className="text-left py-2 text-[var(--text-muted)]">示例</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              {featuresData.map((row, idx) => (
                <tr key={idx} className="border-b border-[var(--border-subtle)]/30">
                  <td className="py-2 font-medium text-[var(--cyber-blue)]">{row.feature}</td>
                  <td className="py-2">{row.description}</td>
                  <td className="py-2"><code className="text-xs">{row.example}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Layer>

      <Layer title="主函数实现" icon="⚡" defaultOpen={false}>
        <CodeBlock code={mainCodeExample} language="typescript" title="runNonInteractive" />
      </Layer>

      <Layer title="响应处理" icon="📨" defaultOpen={false}>
        <CodeBlock code={responseHandlingCode} language="typescript" title="响应流处理" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="事件类型" color="blue">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <code>GeminiEventType.Content</code> - 文本内容</li>
              <li>• <code>GeminiEventType.ToolCallRequest</code> - 工具调用</li>
            </ul>
          </HighlightBox>
          <HighlightBox title="输出模式" color="green">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <strong>Text</strong>：流式 process.stdout.write</li>
              <li>• <strong>JSON</strong>：累积后 JsonFormatter 格式化</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="非交互 UI" icon="🎭" defaultOpen={false}>
        <CodeBlock code={nonInteractiveUICode} language="typescript" title="No-op UI Context" />

        <div className="mt-4 bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--purple)]/30">
          <h4 className="text-[var(--purple)] font-bold mb-2">为什么需要 No-op UI？</h4>
          <p className="text-sm text-[var(--text-secondary)]">
            非交互模式不使用 Ink/React 渲染，但 CommandContext 接口需要 UI 对象。
            createNonInteractiveUI() 提供所有方法的空实现，使命令可以正常执行而不依赖实际 UI。
          </p>
        </div>
      </Layer>

      <Layer title="Slash 命令处理" icon="/" defaultOpen={false}>
        <CodeBlock code={slashCommandCode} language="typescript" title="handleSlashCommand" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="支持的结果类型" color="green">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• <code>submit_prompt</code> - 返回 prompt 继续执行</li>
              <li>• 其他类型抛出 FatalInputError</li>
            </ul>
          </HighlightBox>
          <HighlightBox title="限制" color="orange">
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 不支持交互式确认</li>
              <li>• 只加载自定义文件命令</li>
              <li>• 某些内置命令不可用</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="使用示例" icon="💻" defaultOpen={false}>
        <CodeBlock code={usageExamples} language="bash" title="非交互模式示例" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--terminal-green)]/30">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">✅ 适用场景</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• CI/CD 流水线中的代码审查</li>
              <li>• 批量文件处理脚本</li>
              <li>• 自动化代码生成</li>
              <li>• 管道组合工作流</li>
              <li>• 定时任务和 cron</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--error)]/30">
            <h4 className="text-[var(--error)] font-bold mb-2">❌ 不适用场景</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 需要用户确认的操作</li>
              <li>• 复杂的多轮对话</li>
              <li>• 需要查看中间状态</li>
              <li>• 交互式调试</li>
              <li>• Vim 模式编辑</li>
            </ul>
          </div>
        </div>
      </Layer>

      <Layer title="错误处理" icon="⚠️" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="FatalInputError" color="orange">
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              输入处理失败时抛出，导致非零退出码：
            </p>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• @ 命令文件不存在</li>
              <li>• Slash 命令请求确认</li>
              <li>• 不支持的命令结果类型</li>
            </ul>
          </HighlightBox>
          <HighlightBox title="EPIPE 处理" color="blue">
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              管道提前关闭时优雅退出：
            </p>
            <CodeBlock
              code={`process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') {
    process.exit(0);  // 优雅退出
  }
});`}
              language="typescript"
            />
          </HighlightBox>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
