import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function SlashCommands() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">斜杠命令完整参考</h2>

      {/* 概述 */}
      <Layer title="命令系统概述" icon="/">
        <HighlightBox title="三种命令前缀" icon="⚡" variant="blue">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="text-center">
              <div className="text-2xl mb-1 font-mono">/</div>
              <strong>斜杠命令</strong>
              <p className="text-xs text-gray-400">CLI 元控制命令</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1 font-mono">@</div>
              <strong>At 命令</strong>
              <p className="text-xs text-gray-400">文件/目录注入</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1 font-mono">!</div>
              <strong>Shell 命令</strong>
              <p className="text-xs text-gray-400">Shell 执行/模式切换</p>
            </div>
          </div>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📦</div>
            <h4 className="text-cyan-400 font-bold">BuiltinCommandLoader</h4>
            <p className="text-sm text-gray-400">内置命令（~25个）</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">📂</div>
            <h4 className="text-cyan-400 font-bold">FileCommandLoader</h4>
            <p className="text-sm text-gray-400">用户/项目自定义命令</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🔌</div>
            <h4 className="text-cyan-400 font-bold">McpPromptLoader</h4>
            <p className="text-sm text-gray-400">MCP 提示命令</p>
          </div>
        </div>
      </Layer>

      {/* 内置命令完整清单 */}
      <Layer title="内置命令完整清单" icon="📋">
        {/* 会话管理 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-4">🗂️ 会话管理</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/chat save <tag>" desc="保存会话到检查点" />
          <CommandCard name="/chat resume <tag>" desc="恢复已保存的会话" />
          <CommandCard name="/chat list" desc="列出可用的会话标签" />
          <CommandCard name="/chat delete <tag>" desc="删除已保存的会话" />
          <CommandCard name="/chat share [file]" desc="导出会话到 Markdown/JSON" />
          <CommandCard name="/summary" desc="生成项目摘要到 .qwen/PROJECT_SUMMARY.md" />
          <CommandCard name="/compress" desc="手动压缩聊天历史，节省 Token" />
          <CommandCard name="/stats" desc="显示会话统计（Token 使用、时长等）" />
          <CommandCard name="/clear" desc="清空终端屏幕 (Ctrl+L)" />
        </div>

        {/* 上下文与记忆 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3">🧠 上下文与记忆</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/memory show" desc="显示已加载的层级上下文" />
          <CommandCard name="/memory refresh" desc="重新扫描并加载 QWEN.md 文件" />
          <CommandCard name="/memory add <text>" desc="添加文本到记忆" />
          <CommandCard name="/init" desc="分析当前目录并创建 QWEN.md" />
        </div>

        {/* 文件检查点 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3">💾 文件检查点</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/restore [tool_call_id]" desc="恢复到工具执行前的状态" />
          <CommandCard name="/restore" desc="列出可用的检查点（无参数时）" />
        </div>

        {/* 工作区管理 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3">📁 工作区管理</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/directory add <path>" desc="添加目录到工作区（最多5个）" />
          <CommandCard name="/directory show" desc="显示已添加的工作区目录" />
          <CommandCard name="/dir" desc="/directory 的别名" />
        </div>

        {/* 工具与模式 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3">🛠️ 工具与模式</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/tools" desc="列出可用工具（只显示名称）" />
          <CommandCard name="/tools desc" desc="显示工具详细描述" />
          <CommandCard name="/tools nodesc" desc="隐藏工具描述" />
          <CommandCard name="/approval-mode [mode]" desc="更改审批模式 (plan|default|auto-edit|yolo)" />
          <CommandCard name="/approval-mode plan --project" desc="设置项目级审批模式" />
        </div>

        {/* MCP 与扩展 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3">🔌 MCP 与扩展</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/mcp" desc="列出 MCP 服务器状态和工具" />
          <CommandCard name="/mcp desc" desc="显示 MCP 工具描述" />
          <CommandCard name="/mcp schema" desc="显示 MCP 工具的 JSON Schema" />
          <CommandCard name="/extensions" desc="列出当前会话的活跃扩展" />
          <CommandCard name="/agents create" desc="交互式创建子代理" />
          <CommandCard name="/agents manage" desc="管理现有子代理" />
        </div>

        {/* 配置与偏好 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3">⚙️ 配置与偏好</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/settings" desc="打开设置编辑器" />
          <CommandCard name="/theme" desc="切换视觉主题" />
          <CommandCard name="/model" desc="切换当前会话的模型" />
          <CommandCard name="/auth" desc="更改认证方式" />
          <CommandCard name="/editor" desc="选择首选编辑器" />
          <CommandCard name="/vim" desc="切换 Vim 模式" />
        </div>

        {/* 帮助与信息 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3">ℹ️ 帮助与信息</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/help" desc="显示帮助信息" />
          <CommandCard name="/?" desc="/help 的别名" />
          <CommandCard name="/about" desc="显示版本信息（报 bug 时使用）" />
          <CommandCard name="/bug <title>" desc="提交 bug 报告到 GitHub" />
          <CommandCard name="/copy" desc="复制最后输出到剪贴板" />
        </div>

        {/* 退出 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3">🚪 退出</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/quit" desc="立即退出（无确认）" />
          <CommandCard name="/exit" desc="/quit 的别名" />
          <CommandCard name="/quit-confirm" desc="退出确认对话框（可保存/摘要）" />
        </div>
      </Layer>

      {/* @ 命令 */}
      <Layer title="@ 命令 (文件注入)" icon="@">
        <HighlightBox title="用法" icon="📄" variant="green">
          <p className="text-sm">
            <code>@path/to/file</code> 或 <code>@path/to/directory</code> —
            将文件/目录内容注入到提示中。内部使用 <code>read_many_files</code> 工具。
          </p>
        </HighlightBox>

        <div className="space-y-3 mt-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">@src/components/Button.tsx 解释这个组件</code>
            <p className="text-sm text-gray-400 mt-1">注入单个文件</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">@src/api/ 总结这个目录的功能</code>
            <p className="text-sm text-gray-400 mt-1">注入目录下所有文件（递归，尊重 .gitignore）</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">@My\ Documents/report.pdf 帮我分析</code>
            <p className="text-sm text-gray-400 mt-1">路径中的空格用反斜杠转义</p>
          </div>
        </div>

        <HighlightBox title="支持的文件类型" icon="📁" variant="blue">
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>文本文件：直接注入内容</li>
            <li>图片 (PNG, JPEG)：多模态输入</li>
            <li>PDF：提取文本和视觉内容</li>
            <li>音频/视频：编码为多模态输入</li>
            <li>二进制文件：跳过</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* ! 命令 */}
      <Layer title="! 命令 (Shell 模式)" icon="!">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">!command — 单次执行</h4>
            <p className="text-sm text-gray-300 mb-2">
              执行一条命令后返回 CLI
            </p>
            <code className="text-xs text-gray-400 block">!git status</code>
            <code className="text-xs text-gray-400 block">!npm test</code>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">! — Shell 模式切换</h4>
            <p className="text-sm text-gray-300 mb-2">
              输入 <code>!</code> 进入 Shell 模式，再次输入 <code>!</code> 退出
            </p>
            <code className="text-xs text-gray-400 block">UI 显示 Shell Mode 指示器</code>
            <code className="text-xs text-gray-400 block">所有输入直接作为 shell 命令执行</code>
          </div>
        </div>

        <HighlightBox title="环境变量" icon="🔧" variant="orange">
          <p className="text-sm">
            通过 <code>!</code> 执行的命令会设置 <code>QWEN_CODE=1</code> 环境变量，
            脚本可以据此检测是否在 CLI 中运行。
          </p>
        </HighlightBox>
      </Layer>

      {/* 命令加载架构 */}
      <Layer title="命令加载架构" icon="🏗️">
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
        // - 用户/项目命令：后加载的覆盖先加载的
        // - 扩展命令：冲突时重命名为 extensionName.commandName
        const commandMap = new Map<string, SlashCommand>();
        for (const cmd of allCommands) {
            let finalName = cmd.name;
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

      {/* 快捷键 */}
      <Layer title="快捷键" icon="⌨️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ShortcutCard keys="Ctrl+L" desc="清空屏幕 (等同 /clear)" />
          <ShortcutCard keys="Ctrl+T" desc="切换 MCP 工具描述显示" />
          <ShortcutCard keys="Ctrl+C (x2)" desc="触发退出确认对话框" />
          <ShortcutCard keys="Ctrl+Z" desc="撤销输入" />
          <ShortcutCard keys="Ctrl+Shift+Z" desc="重做输入" />
          <ShortcutCard keys="Ctrl+F" desc="聚焦到正在运行的 shell (pty 模式)" />
          <ShortcutCard keys="↑ / ↓" desc="浏览输入历史" />
          <ShortcutCard keys="Tab" desc="自动补全命令/文件路径" />
        </div>
      </Layer>

      {/* 源码位置 */}
      <Layer title="源码位置" icon="📍">
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/services/CommandService.ts</code>
            <span className="text-gray-400">命令服务（加载、冲突处理）</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/services/BuiltinCommandLoader.ts</code>
            <span className="text-gray-400">内置命令加载器</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/services/FileCommandLoader.ts</code>
            <span className="text-gray-400">自定义命令加载器</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/ui/commands/types.ts</code>
            <span className="text-gray-400">SlashCommand 接口定义</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">docs/cli/commands.md</code>
            <span className="text-gray-400">官方命令文档</span>
          </div>
        </div>
      </Layer>
    </div>
  );
}

// 辅助组件
function CommandCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
      <code className="text-cyan-400 text-sm">{name}</code>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
    </div>
  );
}

function ShortcutCard({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center gap-3">
      <kbd className="bg-gray-700 px-2 py-1 rounded text-sm font-mono text-cyan-400">{keys}</kbd>
      <span className="text-sm text-gray-300">{desc}</span>
    </div>
  );
}
