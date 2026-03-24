import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { getThemeColor } from '../utils/theme';



export function ShellModes() {
 // 核心流程图：两条执行路径对比
 const shellModesFlowChart = `flowchart TD
 user_input[用户输入]

 subgraph interactive["路径 A: 交互式 Shell"]
 direction TB
 ui_shell_input["UI: 用户输入 !command"]
 shell_processor["shellCommandProcessor.ts<br/>useShellCommandProcessor()"]
 add_history["添加到历史记录"]
 shell_exec_service["ShellExecutionService.execute()"]
 pty_check{"启用 PTY?"}
 pty_mode["executeWithPty()<br/>支持交互式命令"]
 child_process["childProcessFallback()<br/>仅捕获输出"]
 direct_output["直接输出到终端"]
 end

 subgraph injection["路径 B: 自定义命令注入"]
 direction TB
 toml_shell_input["TOML: prompt 中 !{command}"]
 shell_injector["shellProcessor.ts<br/>ShellProcessor.process()"]
 arg_substitution["参数替换:<br/>{{args}} → shell-escaped"]
 permission_check["checkCommandPermissions()<br/>(default deny)"]
 hard_denial{"Hard denial?"}
 blocked_error["Error: hard denial<br/>无法确认绕过"]
 needs_confirm{"需要确认?"}
 confirm_dialog["ShellConfirmationDialog<br/>Allow once / session / cancel"]
 allow_once["Allow once<br/>one-time allowlist"]
 allow_session["Allow for session<br/>update sessionShellAllowlist"]
 rerun["重新执行 slash command"]
 inject_exec["ShellExecutionService.execute()"]
 inject_prompt["输出注入到 prompt"]
 send_to_ai["发送给 AI Model"]
 end

 user_input --> ui_shell_input
 user_input --> toml_shell_input

 ui_shell_input --> shell_processor
 shell_processor --> add_history
 add_history --> shell_exec_service
 shell_exec_service --> pty_check
 pty_check -->|Yes| pty_mode
 pty_check -->|No| child_process
 pty_mode --> direct_output
 child_process --> direct_output

 toml_shell_input --> shell_injector
 shell_injector --> arg_substitution
 arg_substitution --> permission_check
 permission_check --> hard_denial
 hard_denial -->|Yes| blocked_error
 hard_denial -->|No| needs_confirm
 needs_confirm -->|"No (YOLO/allowlisted)"| inject_exec
 needs_confirm -->|Yes| confirm_dialog
 confirm_dialog -->|Allow once| allow_once
 confirm_dialog -->|Allow session| allow_session
 allow_once --> rerun
 allow_session --> rerun
 rerun --> inject_exec
 inject_exec --> inject_prompt
 inject_prompt --> send_to_ai

 style interactive stroke:#0e7490
 style injection stroke:#7c3aed
 style ui_shell_input stroke:#22d3ee
 style toml_shell_input stroke:#a78bfa
 style pty_mode stroke:#10b981
 style confirm_dialog stroke:${getThemeColor("--color-warning", "#b45309")}
 style blocked_error stroke:${getThemeColor("--color-danger", "#b91c1c")}
 style direct_output stroke:${getThemeColor("--color-success", "#15803d")}
 style send_to_ai stroke:#8b5cf6`;

 // PTY vs 子进程执行对比
 const executionMethodChart = `flowchart LR
 shell_exec["ShellExecutionService.execute()"]
 pty_enabled{"enableInteractiveShell<br/>+ node-pty 可用?"}

 subgraph pty["PTY 模式"]
 direction TB
 pty_spawn["spawn(shell, args)<br/>创建伪终端"]
 pty_terminal["Headless Terminal<br/>ANSI 解析"]
 pty_interact["支持交互式命令<br/>(vim, less, 颜色)"]
 pty_output["AnsiOutput 对象"]
 end

 subgraph child["子进程模式"]
 direction TB
 cp_spawn["child_process.spawn()"]
 cp_capture["捕获 stdout + stderr"]
 cp_decode["TextDecoder 解码"]
 cp_text["纯文本输出"]
 end

 shell_exec --> pty_enabled
 pty_enabled -->|Yes| pty_spawn
 pty_enabled -->|No| cp_spawn
 pty_spawn --> pty_terminal
 pty_terminal --> pty_interact
 pty_interact --> pty_output
 cp_spawn --> cp_capture
 cp_capture --> cp_decode
 cp_decode --> cp_text

 style pty stroke:#10b981
 style child stroke:${getThemeColor("--color-info", "#2457a6")}
 style pty_interact stroke:${getThemeColor("--color-success", "#15803d")}`;

 // 权限检查流程
 const permissionCheckChart = `flowchart TD
 start(["checkCommandPermissions(command, config, sessionAllowlist?)"])
 parse["parseCommandDetails(command)<br/>Bash(tree-sitter) / PowerShell parser"]
 parse_ok{"parse ok?"}
 hard_parse(["Hard deny<br/>无法安全解析"])

 wildcard_block{"tools.exclude includes<br/>run_shell_command/ShellTool?"}
 hard_shell_disabled(["Hard deny<br/>shell tool disabled"])
 exclude_match{"any segment matches<br/>tools.exclude patterns?"}
 hard_exclude(["Hard deny<br/>blocked by configuration"])

 wildcard_allow{"tools.core includes<br/>run_shell_command/ShellTool?"}
 allow_all(["Allowed<br/>wildcard allow"])

 mode{"sessionAllowlist provided?"}

 default_deny["Default deny mode<br/>(custom command injection)"]
 deny_check{"each segment allowed<br/>by sessionAllowlist OR tools.core?"}
 soft_deny(["Soft deny<br/>needs user confirmation"])

 default_allow["Default allow mode<br/>(direct tool invocation)"]
 strict{"tools.core has any<br/>run_shell_command(...) patterns?"}
 allow_check{"each segment matches<br/>tools.core?"}
 soft_deny2(["Soft deny<br/>blocked by strict allowlist"])

 allow_default([Allowed])

 start --> parse --> parse_ok
 parse_ok -->|No| hard_parse
 parse_ok -->|Yes| wildcard_block
 wildcard_block -->|Yes| hard_shell_disabled
 wildcard_block -->|No| exclude_match
 exclude_match -->|Yes| hard_exclude
 exclude_match -->|No| wildcard_allow
 wildcard_allow -->|Yes| allow_all
 wildcard_allow -->|No| mode

 mode -->|Yes| default_deny --> deny_check
 deny_check -->|All allowed| allow_default
 deny_check -->|Disallowed| soft_deny

 mode -->|No| default_allow --> strict
 strict -->|No| allow_default
 strict -->|Yes| allow_check
 allow_check -->|All allowed| allow_default
 allow_check -->|Disallowed| soft_deny2

 style hard_parse stroke:${getThemeColor("--color-danger", "#b91c1c")}
 style hard_shell_disabled stroke:${getThemeColor("--color-danger", "#b91c1c")}
 style hard_exclude stroke:${getThemeColor("--color-danger", "#b91c1c")}
 style soft_deny stroke:${getThemeColor("--color-warning", "#b45309")}
 style soft_deny2 stroke:${getThemeColor("--color-warning", "#b45309")}
 style allow_all stroke:${getThemeColor("--color-success", "#15803d")}
 style allow_default stroke:${getThemeColor("--color-success", "#15803d")}
 style default_deny stroke:#a78bfa
 style default_allow stroke:#22d3ee`;

 return (
 <div className="space-y-8">
 {/* 目标 */}
 <Layer title="目标">
 <p className="text-body mb-4">
 Shell 模式系统为用户和 AI
 提供安全、灵活的命令执行能力，通过两条独立的执行路径满足不同的使用场景：
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="交互式 Shell (路径 A)" variant="blue">
 <div className="text-sm space-y-2">
 <p>
 <strong>目标：</strong>为用户提供直接的终端访问
 </p>
 <ul className="list-disc pl-5 space-y-1 text-body">
 <li>即时执行用户输入的命令</li>
 <li>支持交互式工具（vim, less, 颜色输出）</li>
 <li>保持工作目录状态</li>
 <li>无额外安全检查（用户直接操作）</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="自定义命令注入 (路径 B)" variant="purple">
 <div className="text-sm space-y-2">
 <p>
 <strong>目标：</strong>安全地执行 TOML 定义的命令
 </p>
 <ul className="list-disc pl-5 space-y-1 text-body">
 <li>在 prompt 中注入命令输出</li>
 <li>自动参数转义和替换</li>
 <li>完整的权限检查和用户确认</li>
 <li>输出传递给 AI Model</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 输入 */}
 <Layer title="输入">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-body w-1/6">特性</th>
 <th className="text-left py-2 text-heading w-5/12">
 交互式 Shell (!command)
 </th>
 <th className="text-left py-2 text-heading w-5/12">
 自定义命令注入 (!{'{command}'})
 </th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2 font-semibold text-body">触发方式</td>
 <td>
 <code className="text-heading">!command</code> 或进入 Shell
 模式后直接输入
 </td>
 <td>
 TOML 文件的 <code>prompt</code> 字段中使用{' '}
 <code>!{'{command}'}</code>
 </td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 font-semibold text-body">使用场景</td>
 <td>用户在 CLI 中直接输入命令</td>
 <td>自定义命令定义文件（可能由他人编写）</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 font-semibold text-body">参数传递</td>
 <td>手动输入命令参数</td>
 <td>
 <code>{'{{args}}'}</code> 自动替换为转义后的用户参数
 </td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 font-semibold text-body">权限模型</td>
 <td>用户权限（等同直接在 terminal 执行）</td>
 <td>
 默认 <code>deny</code>（需确认/会话白名单）；同时受{' '}
 <code>tools.exclude</code>（硬拒绝）与 <code>tools.core</code>
 （全局允许）影响
 </td>
 </tr>
 <tr>
 <td className="py-2 font-semibold text-body">示例</td>
 <td>
 <code className="text-heading">!git status</code>
 </td>
 <td>
 <code className="text-heading">
 !{'{git log --oneline -n 10}'}
 </code>
 </td>
 </tr>
 </tbody>
 </table>
 </div>

 <HighlightBox title="触发条件" variant="yellow" className="mt-4">
 <div className="text-sm space-y-2">
 <div>
 <strong className="text-heading">交互式 Shell:</strong>
 <ul className="list-disc pl-5 mt-1 text-body">
 <li>
 用户在 CLI 输入以 <code>!</code> 开头的命令
 </li>
 <li>
 用户切换到 Shell 模式 (输入 <code>!</code> 后直接输入命令)
 </li>
 <li>工作目录状态通过临时文件跟踪</li>
 </ul>
 </div>
 <div>
 <strong className="text-heading">自定义命令注入:</strong>
 <ul className="list-disc pl-5 mt-1 text-body">
 <li>
 用户调用包含 <code>!{'{...}'}</code> 的自定义命令
 </li>
 <li>
 在 <code>FileCommandLoader</code> 加载时进行{' '}
 <code>ShellProcessor</code> 处理
 </li>
 <li>支持嵌套大括号和参数替换</li>
 </ul>
 </div>
 </div>
 </HighlightBox>
 </Layer>

 {/* 输出 */}
 <Layer title="输出">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated/10 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">
 交互式 Shell 输出
 </h4>
 <div className="text-sm space-y-2 text-body">
 <div>
 <strong>输出目的地:</strong>
 <p>直接显示在终端 UI</p>
 </div>
 <div>
 <strong>输出格式:</strong>
 <ul className="list-disc pl-5 space-y-1">
 <li>
 PTY 模式: <code className="text-heading">AnsiOutput</code>{' '}
 对象（保留颜色和格式）
 </li>
 <li>子进程模式: 纯文本字符串</li>
 </ul>
 </div>
 <div>
 <strong>错误处理:</strong>
 <p>错误输出直接显示，包含退出码</p>
 </div>
 <div>
 <strong>AI 上下文:</strong>
 <ul className="list-disc pl-5 space-y-1">
 <li>命令和输出会写入 LLM 对话历史</li>
 <li>用于保持 AI 对执行上下文的理解</li>
 </ul>
 </div>
 <div>
 <strong>特殊行为:</strong>
 <ul className="list-disc pl-5 space-y-1">
 <li>
 执行 <code>cd</code> 命令后会显示"工作目录变更不持久"警告
 </li>
 <li>提醒用户交互式 Shell 的目录变更不会影响后续命令</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-elevated border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">
 自定义命令注入输出
 </h4>
 <div className="text-sm space-y-2 text-body">
 <div>
 <strong>输出目的地:</strong>
 <p>注入到 prompt，发送给 AI Model</p>
 </div>
 <div>
 <strong>输出格式:</strong>
 <ul className="list-disc pl-5 space-y-1">
 <li>纯文本字符串（去除 ANSI 控制符）</li>
 <li>可能包含多个命令的拼接输出</li>
 </ul>
 </div>
 <div>
 <strong>错误处理:</strong>
 <p>
 添加 <code>[Shell command exited with code X]</code> 标记
 </p>
 </div>
 <div>
 <strong>状态变化:</strong>
 <p>
 确认后命令添加到 <code>sessionShellAllowlist</code>
 </p>
 </div>
 </div>
 </div>
 </div>

 <HighlightBox title="环境变量" variant="green" className="mt-4">
 <div className="text-sm">
 <p className="mb-2">两种模式都会设置以下环境变量：</p>
 <ul className="list-disc pl-5 space-y-1 text-body">
 <li>
 <code className="text-heading">GEMINI_CLI=1</code> -
 标记命令在 Gemini CLI 中运行
 </li>
 <li>
 <code className="text-heading">TERM=xterm-256color</code> -
 提供基础终端能力
 </li>
 <li>
 <code className="text-heading">PAGER</code> /{' '}
 <code className="text-heading">GIT_PAGER</code> - 默认{' '}
 <code>cat</code> 或使用 <code>tools.shell.pager</code>
 </li>
 <li>其他继承自父进程的环境变量</li>
 </ul>
 </div>
 </HighlightBox>
 </Layer>

 {/* 关键文件与入口 */}
 <Layer title="关键文件与入口">
 <div className="space-y-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">
 交互式 Shell 路径
 </h4>
 <div className="text-sm space-y-2">
 <SourceLink
 path="gemini-cli/packages/cli/src/ui/hooks/shellCommandProcessor.ts:66"
 desc="useShellCommandProcessor - Shell 命令处理主入口"
 />
 <SourceLink
 path="gemini-cli/packages/cli/src/ui/hooks/shellCommandProcessor.ts:33"
 desc="addShellCommandToGeminiHistory - 将执行结果写入模型历史"
 />
 <SourceLink
 path="gemini-cli/packages/cli/src/ui/hooks/shellCommandProcessor.ts:154"
 desc="ShellExecutionService.execute() - 调用执行服务"
 />
 <SourceLink
 path="gemini-cli/packages/core/src/services/shellExecutionService.ts:174"
 desc="ShellExecutionService.execute() - 执行入口"
 />
 <SourceLink
 path="gemini-cli/packages/core/src/services/shellExecutionService.ts:448"
 desc="executeWithPty() - PTY 模式执行"
 />
 <SourceLink
 path="gemini-cli/packages/core/src/services/shellExecutionService.ts:239"
 desc="childProcessFallback() - 子进程模式执行"
 />
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">
 自定义命令注入路径
 </h4>
 <div className="text-sm space-y-2">
 <SourceLink
 path="gemini-cli/packages/cli/src/services/prompt-processors/shellProcessor.ts:54"
 desc="ShellProcessor class - 注入处理器"
 />
 <SourceLink
 path="gemini-cli/packages/cli/src/services/prompt-processors/shellProcessor.ts:66"
 desc="processString() - 处理 prompt 中的 !{} 注入"
 />
 <SourceLink
 path="gemini-cli/packages/cli/src/services/prompt-processors/injectionParser.ts:31"
 desc="extractInjections() - 提取所有注入点"
 />
 <SourceLink
 path="gemini-cli/packages/cli/src/services/prompt-processors/shellProcessor.ts:100"
 desc="参数转义: {{args}} → escapeShellArg()"
 />
 <SourceLink
 path="gemini-cli/packages/cli/src/services/prompt-processors/shellProcessor.ts:25"
 desc="ConfirmationRequiredError - 确认异常类"
 />
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">
 run_shell_command (AI 使用)
 </h4>
 <div className="text-sm space-y-2">
 <SourceLink
 path="gemini-cli/packages/core/src/tools/shell.ts:58"
 desc="ShellToolInvocation class - Shell 工具实现"
 />
 <SourceLink
 path="gemini-cli/packages/core/src/tools/shell.ts:106"
 desc="getConfirmationDetails() - 生成确认对话框与会话 allowlist"
 />
 <SourceLink
 path="gemini-cli/packages/core/src/tools/shell.ts:153"
 desc="execute() - Shell 工具执行入口"
 />
 <SourceLink
 path="gemini-cli/packages/core/src/policy/toml-loader.ts"
 desc="checkCommandPermissions() - Shell 命令限制检查"
 />
 </div>
 </div>
 </div>
 </Layer>

 {/* 流程图 */}
 <Layer title="流程图">
 <h3 className="text-xl font-semibold text-heading mb-4">
 完整执行路径对比
 </h3>
 <MermaidDiagram
 chart={shellModesFlowChart}
 title="Shell 模式两条执行路径"
 />

 <h3 className="text-xl font-semibold text-heading mb-4 mt-8">
 执行方法选择
 </h3>
 <MermaidDiagram
 chart={executionMethodChart}
 title="PTY vs 子进程执行模式"
 />

 <h3 className="text-xl font-semibold text-heading mb-4 mt-8">
 权限检查流程
 </h3>
 <MermaidDiagram
 chart={permissionCheckChart}
 title="命令权限检查决策树"
 />
 </Layer>

 {/* 关键分支与边界条件 */}
 <Layer title="关键分支与边界条件">
 <div className="space-y-4">
 <div className="bg-elevated/10 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">
 PTY vs 子进程选择
 </h4>
 <CodeBlock
 code={`// gemini-cli/packages/core/src/services/shellExecutionService.ts:174
static async execute(
 commandToExecute: string,
 cwd: string,
 onOutputEvent: (event: ShellOutputEvent) => void,
 abortSignal: AbortSignal,
 shouldUseNodePty: boolean, // 关键参数
 shellExecutionConfig: ShellExecutionConfig,
): Promise<ShellExecutionHandle> {
 if (shouldUseNodePty) {
 const ptyInfo = await getPty();
 if (ptyInfo) {
 try {
 return this.executeWithPty(...); // PTY 模式
 } catch (_e) {
 // Fallback to child_process
 }
 }
 }

 return this.childProcessFallback(...); // 子进程模式
}`}
 language="typescript"
 title="执行方法选择逻辑"
 />
 <div className="mt-3 text-sm text-body">
 <strong>关键条件:</strong>
 <ul className="list-disc pl-5 mt-1 space-y-1">
 <li>
 <code>shouldUseNodePty</code> 由配置{' '}
 <code>tools.shell.enableInteractiveShell</code> 决定
 </li>
 <li>
 <code>node-pty</code> 必须成功加载（可选依赖）
 </li>
 <li>PTY 创建失败时自动降级到子进程模式</li>
 </ul>
 </div>
 </div>

 <div className="bg-elevated border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">安全确认决策</h4>
 <CodeBlock
 code={`// gemini-cli/packages/cli/src/services/prompt-processors/shellProcessor.ts:118
const { sessionShellAllowlist } = context.session;
const commandsToConfirm = new Set<string>();

for (const injection of resolvedInjections) {
 const command = injection.resolvedCommand;
 if (!command) continue;

 const { allAllowed, disallowedCommands, blockReason, isHardDenial } =
 checkCommandPermissions(command, config, sessionShellAllowlist);

 if (!allAllowed) {
 if (isHardDenial) {
 // 硬拒绝：配置阻止/无法安全解析
 throw new Error(\`Blocked command: "\${command}". Reason: \${blockReason}\`);
 }

 // 软拒绝：仅在非 YOLO 时触发确认
 if (config.getApprovalMode() !== ApprovalMode.YOLO) {
 disallowedCommands.forEach((uc) => commandsToConfirm.add(uc));
 }
 }
}

if (commandsToConfirm.size > 0) {
 throw new ConfirmationRequiredError(
 'Shell command confirmation required',
 Array.from(commandsToConfirm),
 );
}`}
 language="typescript"
 title="确认决策逻辑"
 />
 <div className="mt-3 text-sm text-body">
 <strong>决策分支:</strong>
 <ul className="list-disc pl-5 mt-1 space-y-1">
 <li>
 <strong>硬拒绝:</strong> 命令无法安全解析，或命中{' '}
 <code>tools.exclude</code> → 直接抛错
 </li>
 <li>
 <strong>自动批准:</strong> 命令在{' '}
 <code>sessionShellAllowlist</code> 或 <code>tools.core</code>{' '}
 → 执行
 </li>
 <li>
 <strong>YOLO 模式:</strong> 对软拒绝不再弹确认 →
 直接执行（仍无法绕过硬拒绝）
 </li>
 <li>
 <strong>需要确认:</strong> 软拒绝且非 YOLO → 抛出{' '}
 <code>ConfirmationRequiredError</code>
 </li>
 </ul>
 </div>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">
 二进制输出检测
 </h4>
 <CodeBlock
 code={`// gemini-cli/packages/core/src/tools/shell.ts:220
(event: ShellOutputEvent) => {
 switch (event.type) {
 case 'data':
 if (isBinaryStream) break; // 已检测到二进制，停止处理
 cumulativeOutput = event.chunk;
 shouldUpdate = true;
 break;
 case 'binary_detected':
 isBinaryStream = true;
 cumulativeOutput = '[Binary output detected. Halting stream...]';
 shouldUpdate = true;
 break;
 case 'binary_progress':
 isBinaryStream = true;
 cumulativeOutput = \`[Receiving binary output... \${formatMemoryUsage(
 event.bytesReceived,
 )} received]\`;
 if (Date.now() - lastUpdateTime > OUTPUT_UPDATE_INTERVAL_MS) {
 shouldUpdate = true;
 }
 break;
 }
}`}
 language="typescript"
 title="二进制输出处理"
 />
 <div className="mt-3 text-sm text-body">
 <strong>边界情况:</strong>
 <ul className="list-disc pl-5 mt-1 space-y-1">
 <li>检测到二进制输出时停止流式更新</li>
 <li>显示接收的字节数而非实际内容</li>
 <li>
 限制更新频率为 1 秒/次（<code>OUTPUT_UPDATE_INTERVAL_MS</code>
 ）
 </li>
 </ul>
 </div>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">参数转义边界</h4>
 <CodeBlock
 code={`// gemini-cli/packages/cli/src/services/prompt-processors/shellProcessor.ts:99
const { shell } = getShellConfiguration();
const userArgsEscaped = escapeShellArg(userArgsRaw, shell);

// 替换 {{args}} 为转义后的参数
for (const injection of injections) {
 injection.resolvedCommand = injection.content
 .replaceAll('{{args}}', userArgsEscaped);
}`}
 language="typescript"
 title="参数转义实现"
 />
 <div className="mt-3 text-sm text-body">
 <strong>特殊情况:</strong>
 <ul className="list-disc pl-5 mt-1 space-y-1">
 <li>空字符串参数 → 转义为空字符串</li>
 <li>包含特殊字符 → 使用 shell 特定转义规则</li>
 <li>Windows vs Unix shell 转义逻辑不同</li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 {/* 失败与恢复 */}
 <Layer title="失败与恢复">
 <div className="space-y-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">PTY 降级机制</h4>
 <div className="text-sm space-y-2 text-body">
 <div>
 <strong>失败场景:</strong>
 <ul className="list-disc pl-5 mt-1">
 <li>
 <code>node-pty</code> 未安装或加载失败
 </li>
 <li>PTY 创建异常（权限、系统限制）</li>
 <li>平台不支持伪终端</li>
 </ul>
 </div>
 <div>
 <strong>恢复策略:</strong>
 <p>
 自动降级到 <code>child_process.spawn()</code> 模式
 </p>
 </div>
 <div>
 <strong>影响:</strong>
 <ul className="list-disc pl-5 mt-1">
 <li>失去交互式命令支持</li>
 <li>ANSI 颜色代码被保留但不解析</li>
 <li>仍能正常执行和捕获输出</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">权限拒绝处理</h4>
 <div className="text-sm space-y-2 text-body">
 <div>
 <strong>失败场景:</strong>
 <ul className="list-disc pl-5 mt-1">
 <li>命令无法安全解析（硬拒绝）</li>
 <li>
 命令命中 <code>tools.exclude</code>（硬拒绝）
 </li>
 <li>用户在 ShellConfirmationDialog 选择 No / Esc（取消）</li>
 </ul>
 </div>
 <div>
 <strong>恢复策略:</strong>
 <ul className="list-disc pl-5 mt-1">
 <li>
 <strong>硬拒绝:</strong> 直接返回错误，不执行
 </li>
 <li>
 <strong>用户拒绝:</strong> 取消执行，不影响后续命令
 </li>
 <li>
 <strong>YOLO 模式:</strong>{' '}
 跳过软拒绝确认，但仍无法绕过硬拒绝
 </li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-elevated/10 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">命令执行超时</h4>
 <div className="text-sm space-y-2 text-body">
 <div>
 <strong>失败场景:</strong>
 <ul className="list-disc pl-5 mt-1">
 <li>命令长时间无响应</li>
 <li>用户主动中止 (AbortSignal)</li>
 <li>后台进程需要强制终止</li>
 </ul>
 </div>
 <div>
 <strong>恢复策略:</strong>
 <CodeBlock
 code={`// AbortSignal 监听
signal.addEventListener('abort', () => {
 if (ptyProcess) {
 ptyProcess.kill('SIGTERM');
 setTimeout(() => {
 if (!ptyProcess.killed) {
 ptyProcess.kill('SIGKILL'); // 强制终止
 }
 }, SIGKILL_TIMEOUT_MS);
 }
});`}
 language="typescript"
 title="超时终止逻辑"
 />
 </div>
 <div>
 <strong>清理机制:</strong>
 <ul className="list-disc pl-5 mt-1">
 <li>先发送 SIGTERM (优雅终止)</li>
 <li>200ms 后未响应则发送 SIGKILL (强制终止)</li>
 <li>清理临时文件和 PTY 资源</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">
 工作目录跟踪失败
 </h4>
 <div className="text-sm space-y-2 text-body">
 <div>
 <strong>失败场景:</strong>
 <ul className="list-disc pl-5 mt-1">
 <li>临时文件写入失败</li>
 <li>
 <code>pwd</code> 命令不可用
 </li>
 <li>Windows 平台（不支持 pwd 跟踪）</li>
 </ul>
 </div>
 <div>
 <strong>降级行为:</strong>
 <p>
 继续使用当前配置的工作目录，不更新 <code>targetDir</code>
 </p>
 </div>
 <div>
 <strong>影响:</strong>
 <p>后续相对路径命令可能在错误的目录执行</p>
 </div>
 </div>
 </div>
 </div>

 <HighlightBox title="错误日志" variant="red" className="mt-4">
 <div className="text-sm space-y-2">
 <p>所有关键错误都会记录到以下位置：</p>
 <ul className="list-disc pl-5 text-body">
 <li>
 <strong>执行错误:</strong> 通过{' '}
 <code>ShellExecutionResult.error</code> 返回
 </li>
 <li>
 <strong>权限错误:</strong> 通过{' '}
 <code>ConfirmationRequiredError</code> 异常抛出
 </li>
 <li>
 <strong>系统错误:</strong> 记录到 console.error 和 debug 日志
 </li>
 </ul>
 </div>
 </HighlightBox>
 </Layer>

 {/* 相关配置项 */}
 <Layer title="相关配置项">
 <div className="space-y-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">Shell 执行配置</h4>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left p-2 text-body">配置项</th>
 <th className="text-left p-2 text-body">类型</th>
 <th className="text-left p-2 text-body">默认值</th>
 <th className="text-left p-2 text-body">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">
 tools.shell.enableInteractiveShell
 </code>
 </td>
 <td className="p-2">boolean</td>
 <td className="p-2">
 <code>true</code>
 </td>
 <td className="p-2">启用 PTY 交互式 shell</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">tools.shell.pager</code>
 </td>
 <td className="p-2">string</td>
 <td className="p-2">
 <code>"cat"</code>
 </td>
 <td className="p-2">PAGER 环境变量值</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">
 tools.shell.showColor
 </code>
 </td>
 <td className="p-2">boolean</td>
 <td className="p-2">
 <code>true</code>
 </td>
 <td className="p-2">启用 ANSI 颜色输出</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">terminalWidth</code>
 </td>
 <td className="p-2">number</td>
 <td className="p-2">自动检测</td>
 <td className="p-2">终端宽度（列数）</td>
 </tr>
 <tr>
 <td className="p-2">
 <code className="text-heading">terminalHeight</code>
 </td>
 <td className="p-2">number</td>
 <td className="p-2">自动检测</td>
 <td className="p-2">终端高度（行数）</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">权限控制配置</h4>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left p-2 text-body">配置项</th>
 <th className="text-left p-2 text-body">类型</th>
 <th className="text-left p-2 text-body">默认值</th>
 <th className="text-left p-2 text-body">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">tools.allowed</code>
 </td>
 <td className="p-2">string[]</td>
 <td className="p-2">
 <code>[]</code>
 </td>
 <td className="p-2">
 工具调用自动批准（跳过确认对话框）；支持{' '}
 <code>run_shell_command(git)</code> 这类前缀匹配
 </td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">tools.exclude</code>
 </td>
 <td className="p-2">string[]</td>
 <td className="p-2">
 <code>[]</code>
 </td>
 <td className="p-2">
 工具/命令硬拒绝（最高优先级）；例如{' '}
 <code>run_shell_command(rm -rf)</code>
 </td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">--approval-mode</code>
 </td>
 <td className="p-2">enum</td>
 <td className="p-2">
 <code>default</code>
 </td>
 <td className="p-2">
 确认模式（default / auto_edit / yolo；未信任目录会强制
 default）
 </td>
 </tr>
 <tr>
 <td className="p-2">
 <code className="text-heading">
 sessionShellAllowlist
 </code>
 </td>
 <td className="p-2">Set&lt;string&gt;</td>
 <td className="p-2">运行时</td>
 <td className="p-2">
 自定义命令注入的会话白名单（Allow for this session
 会写入）
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">环境变量</h4>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left p-2 text-body">变量名</th>
 <th className="text-left p-2 text-body">来源</th>
 <th className="text-left p-2 text-body">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">GEMINI_CLI</code>
 </td>
 <td className="p-2">ShellExecutionService</td>
 <td className="p-2">
 标记命令在 Gemini CLI 环境中运行，值为 "1"
 </td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">TERM</code>
 </td>
 <td className="p-2">ShellExecutionService</td>
 <td className="p-2">
 强制设置为 <code>xterm-256color</code>
 </td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">PAGER</code>
 </td>
 <td className="p-2">ShellExecutionService</td>
 <td className="p-2">
 默认 <code>cat</code>，或使用{' '}
 <code>tools.shell.pager</code>
 </td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">
 <code className="text-heading">GIT_PAGER</code>
 </td>
 <td className="p-2">ShellExecutionService</td>
 <td className="p-2">
 与 <code>PAGER</code> 同步，避免 git 进入交互分页
 </td>
 </tr>
 <tr>
 <td className="p-2">
 <code className="text-heading">PATH</code>
 </td>
 <td className="p-2">继承（可能被净化）</td>
 <td className="p-2">命令搜索路径</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <HighlightBox title="配置示例" variant="yellow">
 <CodeBlock
 code={`// .gemini/settings.json
{
 "tools": {
 "shell": {
 "enableInteractiveShell": true,
 "pager": "cat",
 "showColor": true
 },
 "allowed": [
 "run_shell_command(git)",
 "run_shell_command(npm test)"
 ],
 "exclude": [
 "run_shell_command(rm -rf)",
 "run_shell_command(sudo)"
 ]
 }
}

// 自定义命令 TOML
# commands/analyze.toml
[command]
prompt = """
检查仓库状态:
!{git status --short}

最近 10 次提交:
!{git log --oneline -n 10}

分析以上信息...
"""`}
 language="typescript"
 title="完整配置示例"
 />
 </HighlightBox>
 </div>
 </Layer>

 {/* 常见误解澄清 */}
 <Layer title="常见误解澄清">
 <div className="space-y-4">
 <div className="bg-elevated/5 rounded-lg p-4 border border-edge/40">
 <h4 className="text-heading font-bold mb-2">误解：两者都需要用户确认
 </h4>
 <p className="text-sm text-body mb-2">
 <strong>正确：</strong>
 </p>
 <ul className="text-sm text-body list-disc pl-5 space-y-1">
 <li>
 <code>!command</code> (交互式) 不需要确认，直接执行
 </li>
 <li>
 <code>!{'{command}'}</code> (注入式) 在非 YOLO
 模式且命令不在白名单时需要确认
 </li>
 </ul>
 </div>

 <div className="bg-elevated/5 rounded-lg p-4 border border-edge/40">
 <h4 className="text-heading font-bold mb-2">误解：两者输出都显示在终端
 </h4>
 <p className="text-sm text-body mb-2">
 <strong>正确：</strong>
 </p>
 <ul className="text-sm text-body list-disc pl-5 space-y-1">
 <li>
 <code>!command</code> 输出直接显示在终端 UI
 </li>
 <li>
 <code>!{'{command}'}</code> 输出注入到 prompt，发送给 AI Model
 </li>
 </ul>
 </div>

 <div className="bg-elevated/5 rounded-lg p-4 border border-edge/40">
 <h4 className="text-heading font-bold mb-2">误解：两者安全模型相同
 </h4>
 <p className="text-sm text-body mb-2">
 <strong>正确：</strong>
 </p>
 <ul className="text-sm text-body list-disc pl-5 space-y-1">
 <li>
 <code>!command</code> 无安全检查，用户直接操作
 </li>
 <li>
 <code>!{'{command}'}</code> 默认 deny +
 ShellConfirmationDialog；命中 <code>tools.exclude</code>{' '}
 或无法安全解析会被硬拒绝
 </li>
 </ul>
 </div>

 <div className="bg-elevated/5 rounded-lg p-4 border border-edge/40">
 <h4 className="text-heading font-bold mb-2">误解：PTY 模式总是可用
 </h4>
 <p className="text-sm text-body mb-2">
 <strong>正确：</strong>
 </p>
 <ul className="text-sm text-body list-disc pl-5 space-y-1">
 <li>
 需要 <code>node-pty</code> 可选依赖成功加载
 </li>
 <li>
 需要配置 <code>enableInteractiveShell: true</code>
 </li>
 <li>失败时自动降级到子进程模式</li>
 </ul>
 </div>

 <div className="bg-elevated/5 rounded-lg p-4 border border-edge/40">
 <h4 className="text-heading font-bold mb-2">误解：run_shell_command 和交互式 Shell 是同一个
 </h4>
 <p className="text-sm text-body mb-2">
 <strong>正确：</strong>
 </p>
 <ul className="text-sm text-body list-disc pl-5 space-y-1">
 <li>
 <strong>交互式 Shell:</strong> 用户直接输入{' '}
 <code>!command</code>
 </li>
 <li>
 <strong>run_shell_command:</strong> AI Model
 通过工具调用系统执行命令
 </li>
 <li>
 <strong>自定义命令注入:</strong> TOML 定义的{' '}
 <code>!{'{command}'}</code>
 </li>
 <li>
 三者都使用 <code>ShellExecutionService</code>{' '}
 但调用路径和权限模型不同
 </li>
 </ul>
 </div>
 </div>
 </Layer>
 </div>
 );
}

function SourceLink({ path, desc }: { path: string; desc: string }) {
 return (
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs flex-shrink-0">
 {path}
 </code>
 <span className="text-body">{desc}</span>
 </div>
 );
}
