import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



export function NonInteractiveMode() {
 const relatedPages: RelatedPage[] = [
 { id: 'startup-chain', label: '启动链', description: '模式选择' },
 { id: 'gemini-chat', label: 'GeminiChatCore', description: 'AI 核心' },
 { id: 'tool-arch', label: '工具系统', description: '工具调用' },
 { id: 'streaming-response-processing', label: '流式处理', description: '输出流' },
 { id: 'error', label: '错误处理', description: '错误码' },
 { id: 'config', label: '配置系统', description: '命令行参数' },
 ];

 const nonInteractiveFlow = `
flowchart TD
 start["命令行启动<br/>gemini &quot;prompt&quot; (positional)"]
 parse_args["parseArguments / loadCliConfig"]
 check_stdin{"stdin 是否为 TTY?"}
 read_stdin["readStdin()<br/>stdin 前置到 input"]
 process_at["handleAtCommand<br/>展开 @path"]
 run_cli["runNonInteractive()"]
 stream["geminiClient.sendMessageStream()"]
 collect["收集 Content / ToolCallRequest"]
 has_tools{"有 ToolCallRequest?"}
 exec_tools["executeToolCall (n 次)"]
 continue["currentMessages = toolResponseParts"]
 output["输出到 stdout<br/>(text/json/stream-json)"]
 exit["退出<br/>(ExitCodes)"]

 start --> parse_args
 parse_args --> check_stdin
 check_stdin -->|"No (piped)"| read_stdin
 check_stdin -->|Yes| process_at
 read_stdin --> process_at
 process_at --> run_cli
 run_cli --> stream
 stream --> collect
 collect --> has_tools
 has_tools -->|Yes| exec_tools
 exec_tools --> continue
 continue --> stream
 has_tools -->|No| output
 output --> exit

 style start fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style exit fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style check_stdin fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style has_tools fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
`;

 const nonInteractiveArchChart = `flowchart TD
 cmd["Command Line<br/>git diff | gemini review<br/>--output-format json > out.json"]
 parse["parseArguments / loadCliConfig<br/>--approval-mode / --allowed-tools / --output-format"]
 input["Input Assembly<br/>stdin prepend if piped<br/>handleAtCommand: @path -> file content"]
 run["runNonInteractive<br/>loop: sendMessageStream -> ToolCallRequest? -> executeToolCall<br/>output: text / json / stream-json"]
 exit(["ExitCodes: 0 / 41 / 42 / 52 / 130"])

 cmd --> parse --> input --> run --> exit

 style cmd fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style exit fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
`;

 const cliOptionsCode = `// packages/cli/src/config/config.ts - CliArgs (节选)

export interface CliArgs {
  // prompt 输入（positional prompt 会被路由到 --prompt / --prompt-interactive）
  query: string | undefined; // positional prompt (query..)
  prompt: string | undefined; // -p/--prompt（deprecated）
  promptInteractive: string | undefined; // -i/--prompt-interactive（先执行后进入交互 UI）

  // 输出
  outputFormat: string | undefined; // -o/--output-format: text|json|stream-json

  // 审批与自动化
  approvalMode: string | undefined; // --approval-mode: default|auto_edit|yolo
  yolo: boolean | undefined; // -y/--yolo（= approval-mode yolo）
  allowedTools: string[] | undefined; // --allowed-tools（也会写入 tools.allowed）
  allowedMcpServerNames: string[] | undefined; // --allowed-mcp-server-names

  // 运行环境
  includeDirectories: string[] | undefined; // --include-directories
  extensions: string[] | undefined; // -e/--extensions
  resume: string | "latest" | undefined; // -r/--resume
  sandbox: boolean | string | undefined; // -s/--sandbox
  debug: boolean | undefined; // -d/--debug
}`;

 const usageExamplesCode = `# 非交互模式使用示例

# 基本用法：单次请求（推荐 positional prompt；-p/--prompt 已 deprecated）
gemini "解释这段代码的作用" @src/main.ts

# 从 stdin 读取输入（stdin 会被前置到 prompt）
cat error.log | gemini "分析这个错误日志"
git diff | gemini "为这些更改写一个提交信息"

# 输出到文件：使用 shell 重定向（gemini-cli 无 --output 文件参数）
gemini "生成 API 文档" @src/api.ts > docs/api.md

# JSON 结构化输出
gemini "列出所有 TODO 项" --output-format json > todos.json

# 流式 JSON（便于程序实时消费）
gemini "分析大型代码库" --output-format stream-json | jq -c '.'

# 进入交互模式（先执行一次 prompt，再进入 UI）
gemini -i "重构这个函数 @func.ts"

# 非交互自动批准：yolo / auto_edit
gemini "修复所有 lint 错误" --approval-mode yolo
gemini "批量修改文件" --approval-mode auto_edit

# 恢复之前的会话
gemini "继续之前的任务" --resume latest

# 允许特定工具（默认非交互会额外排除 run_shell_command / replace / write_file / web_fetch 等）
gemini "只分析代码，不要修改" --allowed-tools "read_file,read_many_files,search_file_content,glob,list_directory"

# 允许 shell 的安全子集：只放行 git 前缀（legacy ShellTool(...) 也兼容）
gemini "查看工作区状态" --allowed-tools "run_shell_command(git status)"

# 使用沙箱执行
gemini "运行测试" --sandbox

# 管道链式调用
gemini "提取函数列表" @src/*.ts --output-format json | \\
  jq '.functions[]' | \\
  gemini "为每个函数生成测试"`;

 const implementationCode = `// packages/cli/src/gemini.tsx - 进入非交互模式（节选）
let input = config.getQuestion();

// stdin 被 pipe 进来时：把 stdin 内容前置到 input
if (!process.stdin.isTTY) {
  const stdinData = await readStdin();
  if (stdinData) {
  input = stdinData + \"\\n\\n\" + input;
  }
}

if (!input) {
  process.exit(ExitCodes.FATAL_INPUT_ERROR);
}

const prompt_id = Math.random().toString(16).slice(2);

await runNonInteractive({
  config,
  settings,
  input,
  prompt_id,
  hasDeprecatedPromptArg,
  resumedSessionData,
});`;

 const outputHandlingCode = `// packages/core/src/output/types.ts
export enum OutputFormat {
  TEXT = 'text',
  JSON = 'json',
  STREAM_JSON = 'stream-json',
}

export enum JsonStreamEventType {
  INIT = 'init',
  MESSAGE = 'message',
  TOOL_USE = 'tool_use',
  TOOL_RESULT = 'tool_result',
  ERROR = 'error',
  RESULT = 'result',
}

// packages/cli/src/nonInteractiveCli.ts - 输出分支（节选）
const streamFormatter =
  config.getOutputFormat() === OutputFormat.STREAM_JSON
  ? new StreamJsonFormatter()
  : null;

// JSON 模式：累积 responseText，最后一次性输出结构化 JSON
if (config.getOutputFormat() === OutputFormat.JSON) {
  const formatter = new JsonFormatter();
  const stats = uiTelemetryService.getMetrics();
  textOutput.write(
  formatter.format(config.getSessionId(), responseText, stats),
  );
}`;

 const multiTurnCode = `// packages/cli/src/nonInteractiveCli.ts - Continuation Tool Loop（节选）
let currentMessages: Content[] = [{ role: 'user', parts: query }];
let turnCount = 0;

while (true) {
  turnCount++;

  // 安全阈值：防止无限 tool loop（由配置控制）
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

  for await (const event of responseStream) {
  if (event.type === GeminiEventType.ToolCallRequest) {
  toolCallRequests.push(event.value);
  }
  // Content / LoopDetected / MaxSessionTurns / Error ...
  }

  if (toolCallRequests.length === 0) {
  break; // 无工具 → 生成结束
  }

  const toolResponseParts: Part[] = [];
  for (const requestInfo of toolCallRequests) {
  const completedToolCall = await executeToolCall(
  config,
  requestInfo,
  abortController.signal,
  );

  if (completedToolCall.response.responseParts) {
  toolResponseParts.push(...completedToolCall.response.responseParts);
  }
  }

  // 把工具结果作为下一轮 user message（Continuation）
  currentMessages = [{ role: 'user', parts: toolResponseParts }];
}`;

 const exitCodesCode = `// packages/core/src/utils/exitCodes.ts
export const ExitCodes = {
  SUCCESS: 0,
  FATAL_AUTHENTICATION_ERROR: 41,
  FATAL_INPUT_ERROR: 42,
  FATAL_CONFIG_ERROR: 52,
  FATAL_CANCELLATION_ERROR: 130,
} as const;

// 在脚本/CI 中使用退出码
// $ gemini \"check\" && echo \"success\" || echo \"failed\"
// $ if gemini \"review\"; then deploy; fi`;

 const ciIntegrationCode = `# CI/CD 集成示例（gemini-cli）

# GitHub Actions
name: Code Review
on: [pull_request]
jobs:
  review:
  runs-on: ubuntu-latest
  steps:
  - uses: actions/checkout@v4

  - name: AI Code Review (JSON)
  run: |
  git diff origin/main...HEAD | \\
  gemini "审查这些代码更改，指出潜在问题" \\
  --output-format json > review.json

  - name: Check Review Result
  run: |
  jq -e '.error? | not' review.json >/dev/null
  # 根据你的 schema 自定义判定逻辑（例如 issues 是否为空）

# GitLab CI
code-review:
  script:
  - |
  git diff origin/main...HEAD | \\
  gemini "总结变更并指出风险点" --output-format text

# Jenkins Pipeline（写入文件用重定向）
pipeline {
  stages {
  stage('AI Analysis') {
  steps {
  sh '''
  cat coverage/lcov.info | \\
  gemini "分析测试覆盖率并建议改进" > reports/ai-analysis.md
  '''
  }
  }
  }
}

# 本地 Git Hook (pre-commit)
#!/bin/bash
# .git/hooks/pre-commit

staged_files=$(git diff --cached --name-only --diff-filter=ACM)
if [ -n "$staged_files" ]; then
  printf "%s\\n" "$staged_files" | gemini "快速检查这些文件列表，并提示潜在问题"
fi`;

 return (
 <div className="space-y-8">
 {/* 概述 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">非交互模式</h2>
 <p className="text-body mb-4">
 非交互模式允许 CLI 在无需用户实时输入的情况下运行，适用于脚本自动化、CI/CD 集成、
 管道处理等场景。支持 stdin 输入、<code>@path</code> 引用展开、JSON/stream-json 输出，以及工具调用的 Continuation 循环。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <HighlightBox title="单次请求" color="blue">
 <code className="text-sm">gemini "prompt"</code>
 <p className="text-xs text-body mt-1">执行一次请求后退出</p>
 </HighlightBox>

 <HighlightBox title="管道输入" color="green">
 <code className="text-sm">cat file | gemini "prompt"</code>
 <p className="text-xs text-body mt-1">从 stdin 读取内容</p>
 </HighlightBox>

 <HighlightBox title="结构化输出" color="yellow">
 <code className="text-sm">gemini "..." --output-format json</code>
 <p className="text-xs text-body mt-1">适合程序解析</p>
 </HighlightBox>

 <HighlightBox title="流式 JSON" color="purple">
 <code className="text-sm">gemini "..." --output-format stream-json</code>
 <p className="text-xs text-body mt-1">事件流输出（INIT/MESSAGE/TOOL/RESULT）</p>
 </HighlightBox>
 </div>
 </section>

 {/* 执行流程 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">执行流程</h3>
 <MermaidDiagram chart={nonInteractiveFlow} title="非交互模式执行流程" />
 </section>

 {/* 命令行参数 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">命令行参数</h3>
 <CodeBlock code={cliOptionsCode} language="typescript" title="参数定义" />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-2">常用参数速查</h4>
 <table className="w-full text-sm">
 <thead>
 <tr className="text-body">
 <th className="text-left p-2">参数</th>
 <th className="text-left p-2">简写</th>
 <th className="text-left p-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border-t border-edge">
 <td className="p-2"><code>--prompt</code></td>
 <td className="p-2"><code>-p</code></td>
 <td className="p-2">提示词（已 deprecated；推荐使用 positional prompt）</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code>--prompt-interactive</code></td>
 <td className="p-2"><code>-i</code></td>
 <td className="p-2">先执行一次 prompt，再进入交互 UI</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code>--output-format</code></td>
 <td className="p-2"><code>-o</code></td>
 <td className="p-2">输出格式：text / json / stream-json</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code>--approval-mode</code></td>
 <td className="p-2">-</td>
 <td className="p-2">审批模式：default / auto_edit / yolo</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code>--yolo</code></td>
 <td className="p-2"><code>-y</code></td>
 <td className="p-2">快捷设置 approval-mode=yolo（自动批准）</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code>--allowed-tools</code></td>
 <td className="p-2">-</td>
 <td className="p-2">工具白名单（也会写入 tools.allowed；非交互下用于解除默认排除）</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code>--allowed-mcp-server-names</code></td>
 <td className="p-2">-</td>
 <td className="p-2">允许的 MCP 服务器白名单</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code>--resume</code></td>
 <td className="p-2"><code>-r</code></td>
 <td className="p-2">恢复会话（latest 或 index）</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code>--sandbox</code></td>
 <td className="p-2"><code>-s</code></td>
 <td className="p-2">启用 sandbox 执行环境</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code>--debug</code></td>
 <td className="p-2"><code>-d</code></td>
 <td className="p-2">Debug 日志</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* 使用示例 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">使用示例</h3>
 <CodeBlock code={usageExamplesCode} language="bash" title="命令行示例" />
 </section>

 {/* 实现代码 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">实现逻辑</h3>
 <CodeBlock code={implementationCode} language="typescript" title="主函数" />
 </section>

 {/* 输出处理 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">输出处理</h3>
 <CodeBlock code={outputHandlingCode} language="typescript" title="输出格式化" />

 <div className="mt-4 grid grid-cols-3 gap-4">
 <HighlightBox title="text" color="blue">
 <p className="text-sm">纯文本输出，默认格式</p>
 <p className="text-xs text-body mt-1">适合人类阅读</p>
 </HighlightBox>

 <HighlightBox title="json" color="green">
 <p className="text-sm">JSON 结构化输出</p>
 <p className="text-xs text-body mt-1">适合程序解析</p>
 </HighlightBox>

 <HighlightBox title="stream-json" color="purple">
 <p className="text-sm">Streaming JSON 事件流</p>
 <p className="text-xs text-body mt-1">适合实时消费与观测</p>
 </HighlightBox>
 </div>
 </section>

 {/* 多轮对话 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">Continuation 工具循环</h3>
 <CodeBlock code={multiTurnCode} language="typescript" title="Tool Loop（非交互多轮）" />
 </section>

 {/* 退出码 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">退出码</h3>
 <CodeBlock code={exitCodesCode} language="typescript" title="退出码定义" />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-2">退出码参考</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <table className="w-full">
 <tbody className="text-body">
 <tr>
 <td className="py-1"><code className="text-heading">0</code></td>
 <td className="py-1">成功</td>
 </tr>
 <tr>
 <td className="py-1"><code className="text-heading">41</code></td>
 <td className="py-1">认证错误</td>
 </tr>
 <tr>
 <td className="py-1"><code className="text-heading">42</code></td>
 <td className="py-1">输入错误</td>
 </tr>
 </tbody>
 </table>
 </div>
 <div>
 <table className="w-full">
 <tbody className="text-body">
 <tr>
 <td className="py-1"><code className="text-heading">52</code></td>
 <td className="py-1">配置错误</td>
 </tr>
 <tr>
 <td className="py-1"><code className="text-heading">130</code></td>
 <td className="py-1">取消 (Ctrl+C)</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </section>

 {/* CI/CD 集成 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">CI/CD 集成</h3>
 <CodeBlock code={ciIntegrationCode} language="yaml" title="CI/CD 配置示例" />
 </section>

 {/* 架构图 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">非交互模式架构</h3>
 <MermaidDiagram chart={nonInteractiveArchChart} title="非交互模式架构" />
 </section>

 {/* 最佳实践 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">最佳实践</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">推荐做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>用 <code>--output-format json</code> / <code>--output-format stream-json</code> 做自动化消费</li>
 <li>需要自动改动时优先用 <code>--approval-mode auto_edit</code>（而非全量 yolo）</li>
 <li>用 <code>--allowed-tools</code> 只放行必要工具（Shell 用 <code>run_shell_command(git ...)</code> 前缀）</li>
 <li>检查退出码（0 / 41 / 42 / 52 / 130）并处理失败分支</li>
 <li>敏感操作配合 <code>--sandbox</code> 隔离执行</li>
 </ul>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">注意事项</h4>
 <ul className="text-sm text-body space-y-1">
 <li>确保 API 密钥在环境变量中</li>
 <li>大文件通过 <code>@path</code> 传递</li>
 <li>敏感操作启用 <code>--sandbox</code></li>
 <li>日志输出到 stderr，结果到 stdout</li>
 <li>非交互模式无法弹确认：确保 <code>tools.allowed</code> / <code>--allowed-tools</code> 覆盖必需的危险操作</li>
 </ul>
 </div>
 </div>
 </section>

 {/* 设计决策 */}
 <Layer title="为什么这样设计非交互模式" defaultOpen={false}>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <HighlightBox title="为什么需要独立的非交互模式?" color="blue">
 <p className="text-sm text-body">
 交互模式依赖终端 UI 和用户输入循环，不适合自动化场景。非交互模式提供确定性的输入输出流程，
 支持单次执行语义，便于脚本编排和 CI/CD 集成。两种模式的执行路径和资源管理策略完全不同。
 </p>
 </HighlightBox>

 <HighlightBox title="为什么使用标准输出而非 Ink UI?" color="green">
 <p className="text-sm text-body">
 Ink UI 的 React 渲染模型会产生 ANSI 转义序列和光标控制，破坏管道输出的可解析性。
 非交互模式直接写入 stdout/stderr，确保输出是纯文本或结构化 JSON，可被 jq、grep 等工具处理。
 </p>
 </HighlightBox>

 <HighlightBox title="为什么支持管道输入?" color="yellow">
 <p className="text-sm text-body">
 Unix 哲学强调组合性，通过检测 stdin.isTTY 自动识别管道输入，使 CLI 成为管道链的一部分。
 支持 <code>cat file | gemini</code> 和 <code>gemini | jq</code> 模式，实现与现有工具链的无缝集成。
 </p>
 </HighlightBox>

 <HighlightBox title="为什么返回退出码?" color="purple">
 <p className="text-sm text-body">
 Shell 脚本和 CI 系统依赖退出码判断命令成功与否。细分的退出码（0 / 41 / 42 / 52 / 130）让调用方能区分
 成功、认证失败、输入错误、配置错误、取消等情况，支持 <code>&&</code>、<code>||</code>、<code>set -e</code> 等流程控制。
 </p>
 </HighlightBox>

 <HighlightBox title="为什么限制交互式工具?" color="orange">
 <p className="text-sm text-body">
 非交互模式无法弹出确认 UI，因此默认会额外排除需要确认的危险工具；通过 <code>--approval-mode</code>（default/auto_edit/yolo）
 与 <code>tools.allowed</code> / <code>--allowed-tools</code>（Shell 支持前缀匹配）在安全性与自动化之间取得平衡。
 </p>
 </HighlightBox>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
