import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function ShellModes() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">Shell 命令两条路径对照</h2>

      {/* 核心区别 */}
      <Layer title="核心区别" icon="⚡">
        <HighlightBox title="两种 ! 用法，实现完全不同" icon="⚠️" variant="orange">
          <p className="text-sm">
            虽然用户看起来都是用 <code>!</code> 执行 shell 命令，但背后走的是完全不同的代码路径，
            权限检查、确认机制、输出处理都不同。
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* 交互式 */}
          <div className="bg-cyan-500/10 border-2 border-cyan-500 rounded-lg p-5">
            <h3 className="text-xl text-cyan-400 font-bold mb-3 flex items-center gap-2">
              <span className="bg-cyan-500 text-black px-2 py-1 rounded text-sm">路径 A</span>
              交互式 Shell
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">触发方式：</span>
                <code className="text-cyan-400 ml-2">!command</code> 或 <code className="text-cyan-400">!</code> 切换模式
              </div>
              <div>
                <span className="text-gray-400">代码路径：</span>
                <code className="text-xs text-gray-300 block mt-1">UI shell handling → ShellExecutionService</code>
              </div>
              <div>
                <span className="text-gray-400">权限检查：</span>
                <span className="text-green-400 ml-2">无</span>（用户直接操作）
              </div>
              <div>
                <span className="text-gray-400">确认机制：</span>
                <span className="text-green-400 ml-2">无</span>（即时执行）
              </div>
              <div>
                <span className="text-gray-400">输出显示：</span>
                <span className="text-gray-300 ml-2">直接输出到终端</span>
              </div>
              <div>
                <span className="text-gray-400">环境变量：</span>
                <code className="text-cyan-400 ml-2">QWEN_CODE=1</code>
              </div>
            </div>
          </div>

          {/* 注入式 */}
          <div className="bg-purple-500/10 border-2 border-purple-500 rounded-lg p-5">
            <h3 className="text-xl text-purple-400 font-bold mb-3 flex items-center gap-2">
              <span className="bg-purple-500 text-black px-2 py-1 rounded text-sm">路径 B</span>
              自定义命令注入
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">触发方式：</span>
                <code className="text-purple-400 ml-2">!{'{command}'}</code> 在 TOML prompt 中
              </div>
              <div>
                <span className="text-gray-400">代码路径：</span>
                <code className="text-xs text-gray-300 block mt-1">FileCommandLoader → ShellProcessor</code>
              </div>
              <div>
                <span className="text-gray-400">权限检查：</span>
                <span className="text-orange-400 ml-2">完整检查</span>（allowlist/blocklist）
              </div>
              <div>
                <span className="text-gray-400">确认机制：</span>
                <span className="text-orange-400 ml-2">非 YOLO 需确认</span>
              </div>
              <div>
                <span className="text-gray-400">输出处理：</span>
                <span className="text-gray-300 ml-2">注入到 prompt 发送给 AI</span>
              </div>
              <div>
                <span className="text-gray-400">参数转义：</span>
                <code className="text-purple-400 ml-2">{'{{args}}'}</code> 自动 shell 转义
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 对照表 */}
      <Layer title="详细对照表" icon="📊">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">特性</th>
                <th className="text-left py-2 text-cyan-400">!command (交互式)</th>
                <th className="text-left py-2 text-purple-400">!{'{command}'} (注入式)</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">使用场景</td>
                <td>用户直接在 CLI 输入</td>
                <td>自定义命令 TOML 中的 prompt</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">执行时机</td>
                <td>即时执行</td>
                <td>调用自定义命令时</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">权限模型</td>
                <td>用户权限（等同直接 terminal）</td>
                <td>受 tools.allowed/blocklist 限制</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">用户确认</td>
                <td>❌ 不需要</td>
                <td>✅ 非 YOLO 模式需确认</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">输出目的地</td>
                <td>终端显示</td>
                <td>注入 prompt → 发送给 AI</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">参数支持</td>
                <td>手动输入</td>
                <td><code>{'{{args}}'}</code> 自动转义替换</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">错误处理</td>
                <td>直接显示错误输出</td>
                <td>添加 <code>[exited with code X]</code> 标记</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-gray-400">PTY 支持</td>
                <td>✅ 支持交互式 shell</td>
                <td>❌ 仅捕获输出</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-400">核心代码</td>
                <td><code>shellCommandProcessor</code></td>
                <td><code>shellProcessor</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 路径 A: 交互式 */}
      <Layer title="路径 A: 交互式 Shell 详解" icon="💻">
        <CodeBlock
          title="shellCommandProcessor.ts - Shell 处理"
          code={`// packages/cli/src/ui/hooks/shellCommandProcessor.ts
// 来源: 实际的 shell 命令处理器

export const useShellCommandProcessor = (
    addItemToHistory,
    setPendingHistoryItem,
    onExec,
    onDebugMessage,
    config,
    geminiClient,
    setShellInputFocused,
    terminalWidth?,
    terminalHeight?
) => {
    const handleShellCommand = useCallback(
        (rawQuery: PartListUnion, abortSignal: AbortSignal): boolean => {
            if (typeof rawQuery !== 'string' || rawQuery.trim() === '') {
                return false;
            }

            // 添加到历史记录
            addItemToHistory(
                { type: 'user_shell', text: rawQuery },
                Date.now()
            );

            // 执行 shell 命令
            await ShellExecutionService.execute(
                commandToExecute,
                targetDir,
                onOutput,
                abortSignal,
                useNodePty,
                config
            );

            return true;
        },
        [...]
    );
    return { handleShellCommand, activeShellPtyId };
};`}
        />

        <CodeBlock
          title="ShellExecutionService - 执行"
          code={`// packages/core/src/services/shellExecution.ts

static async execute(
    command: string,
    cwd: string,
    onOutput: (output: string) => void,
    signal: AbortSignal,
    useNodePty: boolean,
    config: ShellExecutionConfig
): Promise<ShellExecutionResult> {
    // 设置环境变量
    const env = {
        ...process.env,
        QWEN_CODE: '1',  // 标记在 CLI 中运行
    };

    if (useNodePty) {
        // 交互式 PTY 模式
        return this.executeWithPty(command, cwd, env, onOutput, signal);
    } else {
        // 非交互式 child_process
        return this.executeWithChildProcess(command, cwd, env, onOutput, signal);
    }
}`}
        />

        <HighlightBox title="PTY 模式特性" icon="🖥️" variant="blue">
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>支持交互式命令（如 <code>vim</code>、<code>less</code>）</li>
            <li>支持颜色输出和光标控制</li>
            <li>可用 <code>Ctrl+F</code> 聚焦到运行中的 shell</li>
            <li>通过 <code>tools.shell.enableInteractiveShell</code> 启用</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 路径 B: 注入式 */}
      <Layer title="路径 B: 自定义命令注入详解" icon="📝">
        <CodeBlock
          title="ShellProcessor - 完整流程"
          code={`// packages/cli/src/services/prompt-processors/shellProcessor.ts

async processString(prompt: string, context: CommandContext): Promise<string> {
    // 1. 提取所有 !{...} 注入点
    const injections = extractInjections(prompt, '!{', this.commandName);

    // 2. 替换 {{args}} 为转义后的参数
    const userArgsEscaped = escapeShellArg(context.invocation?.args || '', shell);
    for (const injection of injections) {
        injection.resolvedCommand = injection.content
            .replaceAll('{{args}}', userArgsEscaped);
    }

    // 3. 安全检查每个命令
    for (const injection of injections) {
        const { allAllowed, isHardDenial, disallowedCommands } =
            checkCommandPermissions(injection.resolvedCommand, config);

        if (!allAllowed) {
            if (isHardDenial) {
                throw new Error(\`Blocked: \${injection.resolvedCommand}\`);
            }
            // 非 YOLO 需要确认
            if (config.getApprovalMode() !== ApprovalMode.YOLO) {
                throw new ConfirmationRequiredError(disallowedCommands);
            }
        }
    }

    // 4. 执行命令，注入输出
    let result = '';
    for (const injection of injections) {
        const { output, exitCode } = await ShellExecutionService.execute(
            injection.resolvedCommand, ...
        );
        result += output;
        if (exitCode !== 0) {
            result += \`\\n[Shell command exited with code \${exitCode}]\`;
        }
    }

    return result;
}`}
        />

        <HighlightBox title="安全确认对话框" icon="🔐" variant="red">
          <p className="text-sm mb-2">
            当 <code>!{'{command}'}</code> 中的命令不在 allowlist 中且不是 YOLO 模式时，
            会抛出 <code>ConfirmationRequiredError</code>，UI 层捕获后弹出确认对话框。
          </p>
          <p className="text-sm text-gray-400">
            用户确认后，命令被添加到 <code>sessionShellAllowlist</code>，本次会话内不再询问。
          </p>
        </HighlightBox>
      </Layer>

      {/* 安全差异 */}
      <Layer title="安全模型差异" icon="🛡️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">交互式 (路径 A)</h4>
            <p className="text-sm text-gray-300 mb-2">
              <strong>无额外安全检查</strong> — 用户直接输入命令，等同于在终端执行。
              CLI 信任用户知道自己在做什么。
            </p>
            <div className="text-xs text-gray-400">
              风险责任：用户
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">注入式 (路径 B)</h4>
            <p className="text-sm text-gray-300 mb-2">
              <strong>完整安全检查</strong> — 命令来自自定义命令文件，可能由其他人编写。
              需要 allowlist/blocklist 检查和用户确认。
            </p>
            <div className="text-xs text-gray-400">
              风险责任：CLI + 用户确认
            </div>
          </div>
        </div>

        <CodeBlock
          title="权限检查逻辑"
          code={`// packages/core/src/tools/shell.ts - checkCommandPermissions()

function checkCommandPermissions(
    command: string,
    config: Config,
    sessionAllowlist: Set<string>
): PermissionResult {
    // 1. 检查 blocklist (最高优先级)
    for (const blocked of config.getBlockedCommands()) {
        if (matchesPattern(command, blocked)) {
            return { allAllowed: false, isHardDenial: true };
        }
    }

    // 2. 检查 session allowlist (用户本次确认过的)
    if (sessionAllowlist.has(command)) {
        return { allAllowed: true };
    }

    // 3. 检查 settings allowlist
    for (const allowed of config.getAllowedCommands()) {
        if (matchesPattern(command, allowed)) {
            return { allAllowed: true };
        }
    }

    // 4. 未匹配 → 需要确认
    return { allAllowed: false, isHardDenial: false };
}`}
        />
      </Layer>

      {/* 常见误解 */}
      <Layer title="常见误解澄清" icon="❓">
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-cyan-400 font-bold mb-2">❌ 误解：两者都需要确认</h4>
            <p className="text-sm text-gray-300">
              ✅ 正确：<code>!command</code> 不需要确认，<code>!{'{command}'}</code> 在非 YOLO 模式需要确认。
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-cyan-400 font-bold mb-2">❌ 误解：两者输出都显示在终端</h4>
            <p className="text-sm text-gray-300">
              ✅ 正确：<code>!command</code> 输出到终端，<code>!{'{}'}</code> 输出注入到 prompt 发给 AI。
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-cyan-400 font-bold mb-2">❌ 误解：两者安全模型相同</h4>
            <p className="text-sm text-gray-300">
              ✅ 正确：<code>!command</code> 无安全检查，<code>!{'{}'}</code> 受 allowlist/blocklist 限制。
            </p>
          </div>
        </div>
      </Layer>

      {/* 源码位置 */}
      <Layer title="源码位置" icon="📍">
        <div className="text-sm space-y-2">
          <SourceLink path="packages/cli/src/ui/hooks/shellCommandProcessor.ts" desc="交互式 shell 处理" />
          <SourceLink path="packages/core/src/services/shellExecution.ts" desc="Shell 执行服务" />
          <SourceLink path="packages/cli/src/services/prompt-processors/shellProcessor.ts" desc="注入式 shell 处理" />
          <SourceLink path="packages/core/src/tools/shell.ts" desc="权限检查 (checkCommandPermissions)" />
          <SourceLink path="docs/cli/commands.md#shell-mode--passthrough-commands-" desc="官方文档" />
        </div>
      </Layer>
    </div>
  );
}

function SourceLink({ path, desc }: { path: string; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className="bg-black/30 px-2 py-1 rounded">{path}</code>
      <span className="text-gray-400">{desc}</span>
    </div>
  );
}
