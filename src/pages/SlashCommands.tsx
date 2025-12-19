import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function SlashCommands() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">斜杠命令系统 (Slash Commands)</h2>

      {/* 概述 */}
      <Layer title="什么是斜杠命令？" icon="/">
        <HighlightBox title="Slash Commands" icon="⚡" variant="blue">
          <p className="mb-2">
            斜杠命令是以 <code>/</code> 开头的特殊指令，用于控制 CLI 的行为，
            而不是发送给 AI 处理。例如 <code>/help</code>、<code>/clear</code>、<code>/quit</code>。
          </p>
          <p>
            命令支持参数和子命令，如 <code>/chat save "my-session"</code>。
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📦</div>
            <h4 className="text-cyan-400 font-bold">内置命令</h4>
            <p className="text-sm text-gray-400">BuiltinCommandLoader</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📂</div>
            <h4 className="text-cyan-400 font-bold">文件命令</h4>
            <p className="text-sm text-gray-400">FileCommandLoader</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🔌</div>
            <h4 className="text-cyan-400 font-bold">MCP 命令</h4>
            <p className="text-sm text-gray-400">McpPromptLoader</p>
          </div>
        </div>
      </Layer>

      {/* 命令加载架构 */}
      <Layer title="命令加载架构" icon="🏗️">
        <div className="bg-black/30 rounded-xl p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-cyan-400/20 border border-cyan-400 rounded-lg px-6 py-3 w-full max-w-lg text-center">
              <strong>CommandService</strong>
              <div className="text-xs text-gray-400">协调所有命令加载器</div>
            </div>

            <div className="text-cyan-400">↓</div>

            <div className="flex gap-4 flex-wrap justify-center">
              <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-4 py-2 text-center">
                <div className="text-sm text-blue-400">BuiltinCommandLoader</div>
                <div className="text-xs text-gray-400">内置命令</div>
              </div>
              <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-4 py-2 text-center">
                <div className="text-sm text-purple-400">FileCommandLoader</div>
                <div className="text-xs text-gray-400">用户/项目命令</div>
              </div>
              <div className="bg-green-400/20 border border-green-400 rounded-lg px-4 py-2 text-center">
                <div className="text-sm text-green-400">McpPromptLoader</div>
                <div className="text-xs text-gray-400">MCP 提示</div>
              </div>
            </div>

            <div className="text-cyan-400">↓</div>

            <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-6 py-3 w-full max-w-lg text-center">
              <strong>SlashCommand[]</strong>
              <div className="text-xs text-gray-400">统一的命令列表（去重后）</div>
            </div>
          </div>
        </div>

        <CodeBlock
          title="CommandService.create()"
          code={`// packages/cli/src/services/CommandService.ts

class CommandService {
    static async create(
        loaders: ICommandLoader[],
        signal: AbortSignal
    ): Promise<CommandService> {
        // 1. 并行加载所有命令
        const results = await Promise.allSettled(
            loaders.map(loader => loader.loadCommands(signal))
        );

        // 2. 收集所有命令
        const allCommands: SlashCommand[] = [];
        for (const result of results) {
            if (result.status === 'fulfilled') {
                allCommands.push(...result.value);
            }
        }

        // 3. 处理命名冲突
        const commandMap = new Map<string, SlashCommand>();
        for (const cmd of allCommands) {
            let finalName = cmd.name;

            // 扩展命令冲突时重命名为 extensionName.commandName
            if (cmd.extensionName && commandMap.has(cmd.name)) {
                finalName = \`\${cmd.extensionName}.\${cmd.name}\`;
            }

            commandMap.set(finalName, { ...cmd, name: finalName });
        }

        return new CommandService(Array.from(commandMap.values()));
    }
}`}
        />
      </Layer>

      {/* SlashCommand 接口 */}
      <Layer title="SlashCommand 接口" icon="📋">
        <CodeBlock
          title="packages/cli/src/ui/commands/types.ts"
          code={`interface SlashCommand {
    // 基本信息
    name: string;              // 命令名称（不含 /）
    description?: string;      // 命令描述
    aliases?: string[];        // 别名列表

    // 来源信息
    extensionName?: string;    // 扩展名称（如果来自扩展）
    source?: 'builtin' | 'user' | 'project' | 'mcp';

    // 执行
    action?: (context: CommandContext, args: string) => Promise<CommandResult | void>;

    // 子命令
    subCommands?: SlashCommand[];

    // 自动补全
    argCompletions?: (partial: string, context: CommandContext) =>
        Promise<string[]>;

    // 其他
    isHidden?: boolean;        // 是否在帮助中隐藏
    isExperimental?: boolean;  // 是否为实验性功能
}

// 命令执行上下文
interface CommandContext {
    services: {
        config: Config | null;
        settings: LoadedSettings;
        git?: GitService;
        logger: Logger;
    };
    ui: {
        addItem: (item: HistoryItemWithoutId, timestamp: number) => void;
        clear: () => void;
        loadHistory: (history: HistoryItem[]) => void;
        setDebugMessage: (message: string) => void;
        toggleVimEnabled: () => Promise<boolean>;
        reloadCommands: () => void;
        // ... 更多 UI 方法
    };
    session: {
        stats: SessionStats;
        sessionShellAllowlist: Set<string>;
    };
    invocation?: {
        raw: string;      // 原始输入
        name: string;     // 命令名
        args: string;     // 参数
    };
}`}
        />
      </Layer>

      {/* 命令结果类型 */}
      <Layer title="CommandResult 类型" icon="📤">
        <div className="space-y-3">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-bold mb-2">type: 'message'</h4>
            <p className="text-sm text-gray-300">显示消息（info 或 error）</p>
            <code className="text-xs text-gray-400 block mt-1">
              {`{ type: 'message', messageType: 'info', content: '操作成功' }`}
            </code>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">type: 'dialog'</h4>
            <p className="text-sm text-gray-300">打开对话框（auth、theme、settings 等）</p>
            <code className="text-xs text-gray-400 block mt-1">
              {`{ type: 'dialog', dialog: 'settings' }`}
            </code>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">type: 'tool'</h4>
            <p className="text-sm text-gray-300">调度工具执行</p>
            <code className="text-xs text-gray-400 block mt-1">
              {`{ type: 'tool', toolName: 'read_file', toolArgs: { path: '...' } }`}
            </code>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">type: 'submit_prompt'</h4>
            <p className="text-sm text-gray-300">提交提示给 AI 处理</p>
            <code className="text-xs text-gray-400 block mt-1">
              {`{ type: 'submit_prompt', content: '用户输入...' }`}
            </code>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">type: 'quit'</h4>
            <p className="text-sm text-gray-300">退出 CLI</p>
            <code className="text-xs text-gray-400 block mt-1">
              {`{ type: 'quit', messages: [...] }`}
            </code>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">type: 'confirm_action'</h4>
            <p className="text-sm text-gray-300">需要用户确认的操作</p>
            <code className="text-xs text-gray-400 block mt-1">
              {`{ type: 'confirm_action', prompt: <确认界面>, originalInvocation }`}
            </code>
          </div>
        </div>
      </Layer>

      {/* 常用内置命令 */}
      <Layer title="常用内置命令" icon="📚">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/help</code>
            <p className="text-sm text-gray-400">显示帮助信息</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/clear</code>
            <p className="text-sm text-gray-400">清空聊天历史</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/quit</code>
            <p className="text-sm text-gray-400">退出 CLI</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/model</code>
            <p className="text-sm text-gray-400">切换模型</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/auth</code>
            <p className="text-sm text-gray-400">管理认证</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/settings</code>
            <p className="text-sm text-gray-400">打开设置</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/theme</code>
            <p className="text-sm text-gray-400">切换主题</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/vim</code>
            <p className="text-sm text-gray-400">切换 Vim 模式</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/chat save &lt;tag&gt;</code>
            <p className="text-sm text-gray-400">保存会话</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/chat restore</code>
            <p className="text-sm text-gray-400">恢复会话</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/memory</code>
            <p className="text-sm text-gray-400">管理记忆</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/agents</code>
            <p className="text-sm text-gray-400">管理子代理</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/mcp</code>
            <p className="text-sm text-gray-400">管理 MCP 服务器</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/stats</code>
            <p className="text-sm text-gray-400">显示会话统计</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/compress</code>
            <p className="text-sm text-gray-400">手动压缩历史</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">/summary</code>
            <p className="text-sm text-gray-400">生成会话摘要</p>
          </div>
        </div>
      </Layer>

      {/* 命令处理流程 */}
      <Layer title="命令处理流程" icon="🔄">
        <CodeBlock
          title="useSlashCommandProcessor"
          code={`// packages/cli/src/ui/hooks/slashCommandProcessor.ts

const handleSlashCommand = async (rawQuery: string): Promise<Result> => {
    // 1. 检查是否为斜杠命令
    const trimmed = rawQuery.trim();
    if (!trimmed.startsWith('/') && !trimmed.startsWith('?')) {
        return false;  // 不是命令，交给 AI 处理
    }

    // 2. 添加用户消息到历史
    addItem({ type: MessageType.USER, text: trimmed }, timestamp);

    // 3. 解析命令
    const { commandToExecute, args, canonicalPath } =
        parseSlashCommand(trimmed, commands);

    // 4. 执行命令
    if (commandToExecute?.action) {
        const result = await commandToExecute.action(
            commandContext,
            args
        );

        // 5. 处理结果
        if (result) {
            switch (result.type) {
                case 'message':
                    addMessage({ type: result.messageType, content: result.content });
                    break;
                case 'dialog':
                    openDialog(result.dialog);
                    break;
                case 'tool':
                    return { type: 'schedule_tool', toolName, toolArgs };
                case 'submit_prompt':
                    return { type: 'submit_prompt', content: result.content };
                case 'quit':
                    actions.quit(result.messages);
                    break;
                // ... 其他类型
            }
        }
    } else {
        // 6. 未知命令
        addMessage({
            type: MessageType.ERROR,
            content: \`Unknown command: \${trimmed}\`
        });
    }

    return { type: 'handled' };
};`}
        />
      </Layer>

      {/* 自定义命令 */}
      <Layer title="自定义命令" icon="✏️">
        <HighlightBox title="命令位置" icon="📂" variant="green">
          <ul className="pl-5 list-disc space-y-1">
            <li><code>.innies/commands/</code> - 项目级命令</li>
            <li><code>~/.innies/commands/</code> - 用户级命令</li>
          </ul>
        </HighlightBox>

        <CodeBlock
          title="自定义命令文件示例"
          code={`# .innies/commands/deploy.md
---
name: deploy
description: 部署项目到生产环境
---

请执行以下部署步骤：
1. 运行测试确保代码质量
2. 构建生产版本
3. 部署到服务器

部署目标: production
分支: main`}
        />

        <p className="text-sm text-gray-400 mt-4">
          自定义命令使用 Markdown 格式，YAML frontmatter 定义命令元数据，
          Markdown 内容作为提示发送给 AI。
        </p>
      </Layer>

      {/* 命令补全 */}
      <Layer title="命令自动补全" icon="⌨️">
        <CodeBlock
          title="useSlashCompletion"
          code={`// packages/cli/src/ui/hooks/useSlashCompletion.ts

// 当用户输入 / 后，提供命令补全建议

function useSlashCompletion(commands: SlashCommand[]) {
    const getCompletions = useCallback((input: string) => {
        if (!input.startsWith('/')) return [];

        const partial = input.slice(1).toLowerCase();

        // 匹配命令名称和别名
        return commands
            .filter(cmd => {
                if (cmd.isHidden) return false;
                if (cmd.name.toLowerCase().startsWith(partial)) return true;
                if (cmd.aliases?.some(a => a.toLowerCase().startsWith(partial))) {
                    return true;
                }
                return false;
            })
            .map(cmd => ({
                value: \`/\${cmd.name}\`,
                label: cmd.name,
                description: cmd.description
            }));
    }, [commands]);

    return { getCompletions };
}`}
        />
      </Layer>
    </div>
  );
}
