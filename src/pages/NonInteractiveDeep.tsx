import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



const relatedPages: RelatedPage[] = [
 { id: 'core-architecture', label: '核心架构', description: '系统设计' },
 { id: 'tool-system', label: 'Tool 系统', description: '工具执行' },
 { id: 'output-formatter', label: '输出格式化', description: 'JSON 输出' },
 { id: 'slash-commands', label: 'Slash 命令', description: '命令系统' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">🖥️</span>
 <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 管道友好的非交互 CLI 模式，支持单次查询、工具调用循环、JSON 输出，适用于脚本和自动化
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Pipe</div>
 <div className="text-xs text-dim">管道友好</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">JSON</div>
 <div className="text-xs text-dim">结构化输出</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Multi</div>
 <div className="text-xs text-dim">多轮工具调用</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">Modes</div>
 <div className="text-xs text-dim">default/auto_edit/yolo</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">使用场景</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 CI/CD 集成
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 脚本自动化
 </span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 管道组合
 </span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 批量处理
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">📍 源码位置:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
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
 STDIN["stdin + prompt"]
 SLASH{Slash 命令?}
 AT["@ 命令处理"]
 end

 subgraph Loop["执行循环"]
 TURN["turnCount++"]
 CHECK{超过 maxSessionTurns?}
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

 style Input stroke:#00d4ff
 style Loop stroke:#00ff88
 style Response stroke:${getThemeColor("--color-warning", "#b45309")}
 style Output stroke:#a855f7`;

 const toolLoopDiagram = `sequenceDiagram
 participant User as 用户/脚本
 participant CLI as NonInteractive CLI
 participant Model as LLM
 participant Tool as Tool Executor

 User->>CLI: gemini "create test.txt"
 CLI->>Model: sendMessageStream
 Model-->>CLI: ToolCallRequest (write_file)
 CLI->>Tool: executeToolCall
 Tool-->>CLI: toolResponseParts
 CLI->>Model: sendMessageStream (tool results)
 Model-->>CLI: Content (完成消息)
 CLI->>User: stdout 输出`;

 const mainCodeExample = `// packages/cli/src/nonInteractiveCli.ts - runNonInteractive（节选）
interface RunNonInteractiveParams {
  config: Config;
  settings: LoadedSettings;
  input: string;
  prompt_id: string;
  hasDeprecatedPromptArg?: boolean;
  resumedSessionData?: ResumedSessionData;
}

export async function runNonInteractive({
  config,
  settings,
  input,
  prompt_id,
  hasDeprecatedPromptArg,
  resumedSessionData,
}: RunNonInteractiveParams): Promise<void> {
  return promptIdContext.run(prompt_id, async () => {
  const consolePatcher = new ConsolePatcher({
  stderr: true,
  debugMode: config.getDebugMode(),
  onNewMessage: (msg) => coreEvents.emitConsoleLog(msg.type, msg.content),
  });
  const { stdout: workingStdout } = createWorkingStdio();
  const textOutput = new TextOutput(workingStdout);
  const abortController = new AbortController();

  try {
  consolePatcher.patch();

  // Handle EPIPE when piping to a command that closes early.
  process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') process.exit(0);
  });

  const geminiClient = config.getGeminiClient();

  // Resume session (optional)
  if (resumedSessionData) {
  await geminiClient.resumeChat(...);
  }

  // 1) Slash 命令（可能返回 prompt）
  let query: Part[] | undefined;
  if (isSlashCommand(input)) {
  const slashResult = await handleSlashCommand(
  input,
  abortController,
  config,
  settings,
  );
  if (slashResult) query = slashResult as Part[];
  }

  // 2) @path 展开（文件引用）
  if (!query) {
  const { processedQuery, error } = await handleAtCommand({
  query: input,
  config,
  addItem: (_item, _timestamp) => 0,
  onDebugMessage: () => {},
  messageId: Date.now(),
  signal: abortController.signal,
  });

  if (error || !processedQuery) {
  throw new FatalInputError(
  error || 'Exiting due to an error processing the @ command.',
  );
  }

  query = processedQuery as Part[];
  }

  // 3) Tool loop：sendMessageStream → executeToolCall → continuation
  // 见下方“响应处理循环”代码块
  void hasDeprecatedPromptArg;
  } finally {
  consolePatcher.cleanup();
  }
  });
}`;

 const responseHandlingCode = `// packages/cli/src/nonInteractiveCli.ts - 响应处理循环（节选）
const streamFormatter =
  config.getOutputFormat() === OutputFormat.STREAM_JSON
  ? new StreamJsonFormatter()
  : null;

let currentMessages: Content[] = [{ role: 'user', parts: query }];
let turnCount = 0;

while (true) {
  turnCount++;
  if (
  config.getMaxSessionTurns() >= 0 &&
  turnCount > config.getMaxSessionTurns()
  ) {
  handleMaxTurnsExceededError(config);
  }

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
  if (streamFormatter) {
  streamFormatter.emitEvent({
  type: JsonStreamEventType.MESSAGE,
  timestamp: new Date().toISOString(),
  role: 'assistant',
  content: event.value,
  delta: true,
  });
  } else if (config.getOutputFormat() === OutputFormat.JSON) {
  responseText += event.value;
  } else {
  textOutput.write(event.value);
  }
  } else if (event.type === GeminiEventType.ToolCallRequest) {
  if (streamFormatter) {
  streamFormatter.emitEvent({
  type: JsonStreamEventType.TOOL_USE,
  timestamp: new Date().toISOString(),
  tool_name: event.value.name,
  tool_id: event.value.callId,
  parameters: event.value.args,
  });
  }
  toolCallRequests.push(event.value);
  } else if (event.type === GeminiEventType.Error) {
  throw event.value.error;
  }
  }

  if (toolCallRequests.length > 0) {
  textOutput.ensureTrailingNewline();
  const toolResponseParts: Part[] = [];

  for (const requestInfo of toolCallRequests) {
  const completedToolCall = await executeToolCall(
  config,
  requestInfo,
  abortController.signal,
  );
  const toolResponse = completedToolCall.response;

  if (streamFormatter) {
  streamFormatter.emitEvent({
  type: JsonStreamEventType.TOOL_RESULT,
  timestamp: new Date().toISOString(),
  tool_id: requestInfo.callId,
  status: toolResponse.error ? 'error' : 'success',
  output:
  typeof toolResponse.resultDisplay === 'string'
  ? toolResponse.resultDisplay
  : undefined,
  });
  }

  if (toolResponse.error) {
  handleToolError(
  requestInfo.name,
  toolResponse.error,
  config,
  toolResponse.errorType,
  typeof toolResponse.resultDisplay === 'string'
  ? toolResponse.resultDisplay
  : undefined,
  );
  }

  if (toolResponse.responseParts) {
  toolResponseParts.push(...toolResponse.responseParts);
  }
  }

  // Continuation：把工具结果作为下一轮 user message
  currentMessages = [{ role: 'user', parts: toolResponseParts }];
  continue;
  }

  // 无工具调用：输出最终结果并退出
  if (streamFormatter) {
  streamFormatter.emitEvent({
  type: JsonStreamEventType.RESULT,
  timestamp: new Date().toISOString(),
  status: 'success',
  });
  } else if (config.getOutputFormat() === OutputFormat.JSON) {
  const formatter = new JsonFormatter();
  const stats = uiTelemetryService.getMetrics();
  textOutput.write(
  formatter.format(config.getSessionId(), responseText, stats),
  );
  } else {
  textOutput.ensureTrailingNewline();
  }

  return;
}`;

 const nonInteractiveUICode = `// packages/cli/src/ui/noninteractive/nonInteractiveUi.ts
export function createNonInteractiveUI(): CommandContext['ui'] {
  return {
  addItem: (_item, _timestamp) => 0,
  clear: () => {},
  setDebugMessage: (_message) => {},
  loadHistory: (_newHistory) => {},
  pendingItem: null,
  setPendingItem: (_item) => {},
  toggleCorgiMode: () => {},
  toggleDebugProfiler: () => {},
  toggleVimEnabled: async () => false,
  reloadCommands: () => {},
  extensionsUpdateState: new Map(),
  dispatchExtensionStateUpdate: (_action) => {},
  addConfirmUpdateExtensionRequest: (_request) => {},
  removeComponent: () => {},
  };
}`;

 const slashCommandCode = `// packages/cli/src/nonInteractiveCliCommands.ts
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

  const commandService = await CommandService.create(
  [new McpPromptLoader(config), new FileCommandLoader(config)],
  abortController.signal,
  );
  const commands = commandService.getCommands();

  const { commandToExecute, args } = parseSlashCommand(rawQuery, commands);

  if (commandToExecute) {
  if (commandToExecute.action) {
  const sessionStats: SessionStatsState = {
  sessionId: config.getSessionId(),
  sessionStartTime: new Date(),
  metrics: uiTelemetryService.getMetrics(),
  lastPromptTokenCount: 0,
  promptCount: 1,
  };

  const logger = new Logger(config.getSessionId(), config.storage);

  const context: CommandContext = {
  services: { config, settings, git: undefined, logger },
  ui: createNonInteractiveUI(),
  session: {
  stats: sessionStats,
  sessionShellAllowlist: new Set(),
  },
  invocation: {
  raw: trimmed,
  name: commandToExecute.name,
  args,
  },
  };

  const result = await commandToExecute.action(context, args);

  if (result) {
  switch (result.type) {
  case 'submit_prompt':
  return result.content;
  case 'confirm_shell_commands':
  throw new FatalInputError(
  'Exiting due to a confirmation prompt requested by the command.',
  );
  default:
  throw new FatalInputError(
  'Exiting due to command result that is not supported in non-interactive mode.',
  );
  }
  }
  }
  }

  return;
};`;

 const usageExamples = `# 基本用法（positional prompt；-p/--prompt 已 deprecated）
echo "explain this code" | gemini
gemini "what is 2+2"
cat file.txt | gemini "summarize this"

# JSON 输出模式
gemini "list all files" --output-format json

# 文件引用（@path 会被展开）
gemini "review @src/main.ts"

# Slash 命令
gemini "/custom-command arg1 arg2"

# 管道组合（把 commit message 写入 stdin）
git diff | gemini "generate commit message" | git commit -F -

# 批量处理（注意：可能触发大量请求）
find . -name "*.ts" | xargs -I{} gemini "add docs to {}"

# CI/CD 集成
gemini "check for security issues in @package.json" \\
 --output-format json | jq '.issues'`;

 const featuresData = [
 { feature: '管道输入', description: 'stdin 读取（可单独使用，也可与 prompt 拼接）', example: 'cat file.txt | gemini "summarize"' },
 { feature: 'positional prompt', description: '推荐用 positional prompt（-p/--prompt deprecated）', example: 'gemini "hello"' },
 { feature: '@ 命令', description: '文件引用展开', example: 'gemini "review @src/main.ts"' },
 { feature: 'Slash 命令', description: '自定义命令 / MCP Prompt 执行', example: 'gemini "/my-command"' },
 { feature: '输出格式', description: 'text / json / stream-json', example: '--output-format stream-json' },
 { feature: 'EPIPE 处理', description: '管道提前关闭时优雅退出', example: 'gemini | head -1' },
 { feature: '工具循环', description: '自动执行工具调用', example: '多轮 tool 调用' },
 { feature: '轮次限制', description: '防止无限循环（settings.model.maxSessionTurns）', example: 'settings.json: { "model": { "maxSessionTurns": 8 } }' },
 ];

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">非交互 CLI 模式</h1>
 <p className="text-body text-lg">
 管道友好的非交互执行模式，支持脚本自动化、CI/CD 集成和批量处理
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 <Layer title="执行流程" icon="🔄" defaultOpen={true}>
 <HighlightBox title="NonInteractive CLI 执行流程" color="blue" className="mb-6">
 <MermaidDiagram chart={executionFlowChart} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">1️⃣ 输入</div>
 <ul className="text-sm text-body space-y-1">
 <li>stdin + prompt（positional；-p deprecated）</li>
 <li>Slash 命令解析</li>
 <li>@ 文件引用展开</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">2️⃣ 执行</div>
 <ul className="text-sm text-body space-y-1">
 <li>流式发送消息</li>
 <li>处理响应事件</li>
 <li>轮次计数器</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <div className="text-heading font-bold mb-2">3️⃣ 工具</div>
 <ul className="text-sm text-body space-y-1">
 <li>收集工具调用请求</li>
 <li>执行工具操作</li>
 <li>返回结果继续</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <div className="text-heading font-bold mb-2">4️⃣ 输出</div>
 <ul className="text-sm text-body space-y-1">
 <li>text: 默认流式 stdout</li>
 <li>json: 最终输出（含 stats）</li>
 <li>stream-json: 事件流（INIT/MESSAGE/TOOL/RESULT）</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="工具调用循环" icon="🔁" defaultOpen={true}>
 <MermaidDiagram chart={toolLoopDiagram} />

 <div className="mt-4 bg-base p-4 rounded-lg">
 <h4 className="text-heading font-bold mb-2">循环特点</h4>
 <ul className="text-sm text-body space-y-1">
 <li><strong>无确认 UI</strong>：非交互模式不会弹确认；默认会额外 exclude 需要确认的危险工具，或通过 <code>--approval-mode</code> 放开</li>
 <li><strong>多轮支持</strong>：工具结果返回后继续对话</li>
 <li><strong>轮次限制</strong>：防止无限循环（maxSessionTurns）</li>
 <li><strong>错误处理</strong>：非致命工具错误会记录并继续（模型可自修正）；致命错误会直接退出</li>
 </ul>
 </div>
 </Layer>

 <Layer title="功能特性" icon="📋" defaultOpen={true}>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">特性</th>
 <th className="text-left py-2 text-dim">说明</th>
 <th className="text-left py-2 text-dim">示例</th>
 </tr>
 </thead>
 <tbody className="text-body">
 {featuresData.map((row, idx) => (
 <tr key={idx} className="border- border-edge/30">
 <td className="py-2 font-medium text-heading">{row.feature}</td>
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
 <ul className="text-sm text-body space-y-1">
 <li><code>GeminiEventType.Content</code> - 文本内容</li>
 <li><code>GeminiEventType.ToolCallRequest</code> - 工具调用</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="输出模式" color="green">
 <ul className="text-sm text-body space-y-1">
 <li><strong>Text</strong>：流式 process.stdout.write</li>
 <li><strong>JSON</strong>：累积后 JsonFormatter 格式化</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="非交互 UI" icon="🎭" defaultOpen={false}>
 <CodeBlock code={nonInteractiveUICode} language="typescript" title="No-op UI Context" />

 <div className="mt-4 bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">为什么需要 No-op UI？</h4>
 <p className="text-sm text-body">
 非交互模式不使用 Ink/React 渲染，但 CommandContext 接口需要 UI 对象。
 createNonInteractiveUI() 提供所有方法的空实现，使命令可以正常执行而不依赖实际 UI。
 </p>
 </div>
 </Layer>

 <Layer title="Slash 命令处理" icon="/" defaultOpen={false}>
 <CodeBlock code={slashCommandCode} language="typescript" title="handleSlashCommand" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="支持的结果类型" color="green">
 <ul className="text-sm text-body space-y-1">
 <li><code>submit_prompt</code> - 返回 prompt 继续执行</li>
 <li>其他类型抛出 FatalInputError</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="限制" color="orange">
 <ul className="text-sm text-body space-y-1">
 <li>不支持交互式确认</li>
 <li>只加载自定义文件命令</li>
 <li>某些内置命令不可用</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 <Layer title="使用示例" icon="💻" defaultOpen={false}>
 <CodeBlock code={usageExamples} language="bash" title="非交互模式示例" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge/30">
 <h4 className="text-heading font-bold mb-2">✅ 适用场景</h4>
 <ul className="text-sm text-body space-y-1">
 <li>CI/CD 流水线中的代码审查</li>
 <li>批量文件处理脚本</li>
 <li>自动化代码生成</li>
 <li>管道组合工作流</li>
 <li>定时任务和 cron</li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border-l-2 border-l-edge-hover/30">
 <h4 className="text-heading font-bold mb-2">❌ 不适用场景</h4>
 <ul className="text-sm text-body space-y-1">
 <li>需要用户确认的操作</li>
 <li>复杂的多轮对话</li>
 <li>需要查看中间状态</li>
 <li>交互式调试</li>
 <li>Vim 模式编辑</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="错误处理" icon="⚠️" defaultOpen={false}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="FatalInputError" color="orange">
 <p className="text-sm text-body mb-2">
 输入处理失败时抛出，导致非零退出码：
 </p>
 <ul className="text-sm text-body space-y-1">
 <li>@ 命令文件不存在</li>
 <li>Slash 命令请求确认</li>
 <li>不支持的命令结果类型</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="EPIPE 处理" color="blue">
 <p className="text-sm text-body mb-2">
 管道提前关闭时优雅退出：
 </p>
 <CodeBlock
 code={`process.stdout.on('error', (err) => {
 if (err.code === 'EPIPE') {
 process.exit(0); // 优雅退出
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
