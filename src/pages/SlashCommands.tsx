import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

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
          <CommandCard name="/summary" desc="生成项目摘要到 .gemini/PROJECT_SUMMARY.md" />
          <CommandCard name="/compress" desc="手动压缩聊天历史，节省 Token" />
          <CommandCard name="/stats" desc="显示会话统计（Token 使用、时长等）" />
          <CommandCard name="/clear" desc="清空终端屏幕 (Ctrl+L)" />
        </div>

        {/* 上下文与记忆 */}
        <h4 className="text-lg text-cyan-400 font-bold mb-3">🧠 上下文与记忆</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <CommandCard name="/memory show" desc="显示已加载的层级上下文" />
          <CommandCard name="/memory refresh" desc="重新扫描并加载 GEMINI.md 文件" />
          <CommandCard name="/memory add <text>" desc="添加文本到记忆" />
          <CommandCard name="/init" desc="分析当前目录并创建 GEMINI.md" />
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
          <CommandCard name="/policies list" desc="列出当前生效的 Policy 规则" />
          <CommandCard name="/permissions trust [path]" desc="管理文件夹信任（未提供 path 时使用当前目录）" />
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
            通过 <code>!</code> 执行的命令会设置 <code>GEMINI_CLI=1</code> 环境变量，
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

      {/* 命令执行模式 */}
      <Layer title="命令执行模式详解" icon="⚙️">
        <p className="mb-4">
          斜杠命令有三种不同的执行模式，理解它们的区别对于选择正确的命令至关重要：
        </p>

        <MermaidDiagram chart={`
flowchart TB
    User["用户输入命令"] --> Parse["解析命令"]
    Parse --> Check{"命令类型"}

    Check -->|LOCAL| L["本地执行"]
    Check -->|AI_PROMPT| A["发送给 AI"]
    Check -->|HYBRID| H["本地 + AI"]

    L --> L1["直接执行 handler()"]
    L --> L2["不消耗 Token"]
    L --> L3["立即返回结果"]

    A --> A1["构建系统提示"]
    A --> A2["发送 API 请求"]
    A --> A3["消耗 Token"]

    H --> H1["先本地预处理"]
    H --> H2["结果发送 AI"]
    H --> H3["AI 处理后返回"]

    style L fill:#22c55e20,stroke:#22c55e
    style A fill:#3b82f620,stroke:#3b82f6
    style H fill:#a855f720,stroke:#a855f7
`} />

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">🟢 LOCAL 模式</h4>
            <p className="text-sm text-gray-300 mb-3">
              命令完全在本地执行，不涉及 AI
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>示例：</strong></p>
              <code className="block">/clear /stats /tools</code>
              <code className="block">/quit /theme /vim</code>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <strong>特点：</strong>快速、不消耗 Token、确定性结果
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">🔵 AI_PROMPT 模式</h4>
            <p className="text-sm text-gray-300 mb-3">
              命令内容作为特殊提示发送给 AI 处理
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>示例：</strong></p>
              <code className="block">/summary /init</code>
              <code className="block">/bug (生成报告)</code>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <strong>特点：</strong>消耗 Token、AI 驱动、结果可能变化
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2">🟣 HYBRID 模式</h4>
            <p className="text-sm text-gray-300 mb-3">
              本地预处理后发送给 AI 进一步处理
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>示例：</strong></p>
              <code className="block">/compress (分析后压缩)</code>
              <code className="block">/memory (读取后分析)</code>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <strong>特点：</strong>两阶段处理、优化 Token 使用
            </div>
          </div>
        </div>

        <HighlightBox title="执行模式对 Token 的影响" icon="📊" variant="yellow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-400">模式</th>
                  <th className="px-3 py-2 text-left text-gray-400">Token 消耗</th>
                  <th className="px-3 py-2 text-left text-gray-400">延迟</th>
                  <th className="px-3 py-2 text-left text-gray-400">典型场景</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                <tr>
                  <td className="px-3 py-2 text-green-400">LOCAL</td>
                  <td className="px-3 py-2 text-gray-300">0</td>
                  <td className="px-3 py-2 text-gray-400">{"<"} 100ms</td>
                  <td className="px-3 py-2 text-gray-500">配置、切换、查看状态</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-blue-400">AI_PROMPT</td>
                  <td className="px-3 py-2 text-gray-300">500 - 5000</td>
                  <td className="px-3 py-2 text-gray-400">1-10s</td>
                  <td className="px-3 py-2 text-gray-500">生成、分析、总结</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-purple-400">HYBRID</td>
                  <td className="px-3 py-2 text-gray-300">200 - 2000</td>
                  <td className="px-3 py-2 text-gray-400">500ms - 5s</td>
                  <td className="px-3 py-2 text-gray-500">压缩、优化、上下文处理</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HighlightBox>
      </Layer>

      {/* 场景对比：选择正确的命令 */}
      <Layer title="场景对比：选择正确的命令" icon="🎯">
        <p className="mb-4">
          不同场景下应该使用哪个命令？以下是常见场景的决策指南：
        </p>

        <div className="space-y-6">
          {/* 场景1：Token 管理 */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <h4 className="text-lg font-semibold text-yellow-400 mb-3">💰 Token 管理场景</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-400">我想要...</th>
                    <th className="px-3 py-2 text-left text-gray-400">使用命令</th>
                    <th className="px-3 py-2 text-left text-gray-400">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <tr>
                    <td className="px-3 py-2 text-gray-300">查看 Token 使用情况</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">/stats</td>
                    <td className="px-3 py-2 text-gray-500">显示当前会话的 Token 统计</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">立即减少上下文长度</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">/compress</td>
                    <td className="px-3 py-2 text-gray-500">AI 会总结历史，压缩上下文</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">保存当前状态以便恢复</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">/chat save mytag</td>
                    <td className="px-3 py-2 text-gray-500">保存检查点，可以随时恢复</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">从之前的状态继续</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">/chat resume mytag</td>
                    <td className="px-3 py-2 text-gray-500">恢复到保存的检查点</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 场景2：文件操作 */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <h4 className="text-lg font-semibold text-blue-400 mb-3">📁 文件操作场景</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-400">我想要...</th>
                    <th className="px-3 py-2 text-left text-gray-400">使用方式</th>
                    <th className="px-3 py-2 text-left text-gray-400">对比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <tr>
                    <td className="px-3 py-2 text-gray-300">让 AI 读取文件</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">@src/file.ts 解释这个</td>
                    <td className="px-3 py-2 text-gray-500">@ 命令注入文件内容到提示</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">自己执行命令查看</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">!cat src/file.ts</td>
                    <td className="px-3 py-2 text-gray-500">! 命令直接执行 shell</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">撤销 AI 的文件修改</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">/restore</td>
                    <td className="px-3 py-2 text-gray-500">列出检查点，选择恢复</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">添加新目录到工作区</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">/directory add ~/other</td>
                    <td className="px-3 py-2 text-gray-500">AI 可以访问这个目录</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 场景3：会话控制 */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <h4 className="text-lg font-semibold text-green-400 mb-3">🔄 会话控制场景</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-400">我想要...</th>
                    <th className="px-3 py-2 text-left text-gray-400">使用命令</th>
                    <th className="px-3 py-2 text-left text-gray-400">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <tr>
                    <td className="px-3 py-2 text-gray-300">清空屏幕（保留历史）</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">/clear 或 Ctrl+L</td>
                    <td className="px-3 py-2 text-gray-500">只清屏，不清历史</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">退出 CLI</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">/quit 或 /exit</td>
                    <td className="px-3 py-2 text-gray-500">立即退出，无确认</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">退出前保存/总结</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">Ctrl+C Ctrl+C</td>
                    <td className="px-3 py-2 text-gray-500">弹出对话框选择操作</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">切换审批模式</td>
                    <td className="px-3 py-2 text-cyan-400 font-mono">Shift+Tab / Ctrl+Y</td>
                    <td className="px-3 py-2 text-gray-500">Shift+Tab：default ↔ autoEdit；Ctrl+Y：default ↔ yolo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layer>

      {/* 命令 vs 自然语言 */}
      <Layer title="命令 vs 自然语言：什么时候用哪个？" icon="💬">
        <p className="mb-4">
          有时候用命令更好，有时候直接问 AI 更好。以下是决策指南：
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-5">
            <h4 className="text-cyan-400 font-semibold mb-3">✅ 用斜杠命令</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">→</span>
                <span className="text-gray-300"><strong>确定性操作</strong>：/stats、/clear、/quit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">→</span>
                <span className="text-gray-300"><strong>节省 Token</strong>：本地命令不消耗 API</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">→</span>
                <span className="text-gray-300"><strong>配置更改</strong>：/theme、/vim、/model</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">→</span>
                <span className="text-gray-300"><strong>快速操作</strong>：不需要等待 AI 响应</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5">
            <h4 className="text-purple-400 font-semibold mb-3">✅ 用自然语言</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span className="text-gray-300"><strong>复杂任务</strong>："帮我重构这个函数"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span className="text-gray-300"><strong>需要理解</strong>："为什么这个测试失败？"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span className="text-gray-300"><strong>创造性工作</strong>："写一个新的 API 端点"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span className="text-gray-300"><strong>上下文相关</strong>：需要理解之前的对话</span>
              </li>
            </ul>
          </div>
        </div>

        <HighlightBox title="组合使用的威力" icon="🔥" variant="green">
          <p className="mb-2">最佳实践是组合使用命令和自然语言：</p>
          <div className="bg-gray-900/50 rounded p-3 mt-2 space-y-2">
            <code className="block text-cyan-400 text-sm">@src/components/ 这些组件有什么问题？</code>
            <p className="text-xs text-gray-500">先用 @ 注入文件，再自然语言提问</p>
          </div>
          <div className="bg-gray-900/50 rounded p-3 mt-2 space-y-2">
            <code className="block text-cyan-400 text-sm">!npm test</code>
            <code className="block text-cyan-400 text-sm">帮我修复这些测试失败</code>
            <p className="text-xs text-gray-500">先用 ! 执行命令看结果，再让 AI 分析</p>
          </div>
        </HighlightBox>
      </Layer>

      {/* 自定义命令 */}
      <Layer title="创建自定义命令" icon="🛠️">
        <p className="mb-4">
          你可以创建自己的斜杠命令来自动化重复的工作流程：
        </p>

        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-green-400 font-semibold mb-2">1. 全局命令（所有项目可用）</h4>
            <code className="text-sm text-gray-400 block mb-2">~/.gemini/commands/review.md</code>
            <CodeBlock code={`---
description: 代码审查
---

请对我刚才修改的代码进行审查：
1. 检查潜在的 bug
2. 检查性能问题
3. 检查代码风格
4. 给出改进建议`} />
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-blue-400 font-semibold mb-2">2. 项目命令（当前项目专用）</h4>
            <code className="text-sm text-gray-400 block mb-2">.gemini/commands/deploy.md</code>
            <CodeBlock code={`---
description: 部署到测试环境
---

请执行以下部署步骤：
1. 运行 npm run build
2. 运行测试确保通过
3. 执行 ./scripts/deploy-staging.sh
4. 验证部署成功`} />
          </div>
        </div>

        <HighlightBox title="命令文件格式" icon="📝" variant="blue">
          <p className="mb-2">命令文件使用 Markdown 格式：</p>
          <ul className="pl-5 list-disc space-y-1 text-sm">
            <li><strong>文件名</strong>即为命令名（不含 .md 后缀）</li>
            <li><strong>Front Matter</strong>（可选）：description 字段显示在 /help 中</li>
            <li><strong>正文</strong>：发送给 AI 的提示内容</li>
            <li>支持<strong>变量替换</strong>：使用 {"{{arg}}"} 接收参数</li>
          </ul>
        </HighlightBox>

        <div className="mt-4">
          <h4 className="text-lg font-semibold text-white mb-3">命令加载优先级</h4>
          <MermaidDiagram chart={`
flowchart LR
    B["内置命令<br/>(最低)"] --> P["项目命令<br/>(.gemini/)"]
    P --> G["全局命令<br/>(~/.gemini/)"]
    G --> M["MCP 命令<br/>(最高)"]

    style B fill:#4b556320,stroke:#4b5563
    style P fill:#3b82f620,stroke:#3b82f6
    style G fill:#22c55e20,stroke:#22c55e
    style M fill:#a855f720,stroke:#a855f7
`} />
          <p className="text-sm text-gray-400 mt-2">
            同名命令时，后加载的会覆盖先加载的。MCP 命令冲突时会重命名为 <code className="bg-black/30 px-1 rounded">extension.command</code>。
          </p>
        </div>
      </Layer>

      {/* 常见问题 */}
      <Layer title="常见问题与解答" icon="❓">
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-cyan-400 font-semibold mb-2">Q: /compress 和 /chat save 有什么区别？</h4>
            <p className="text-gray-300 text-sm">
              <strong>/compress</strong> 会让 AI 总结并压缩历史，减少 Token 但可能丢失细节。
              <strong>/chat save</strong> 完整保存当前状态，可以精确恢复但不减少 Token。
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-cyan-400 font-semibold mb-2">Q: ! 和 让 AI 执行命令有什么区别？</h4>
            <p className="text-gray-300 text-sm">
              <strong>!command</strong> 你自己直接执行，结果不发给 AI，不消耗 Token。
              让 AI 执行会消耗 Token，但 AI 可以根据结果继续工作。
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-cyan-400 font-semibold mb-2">Q: @ 能注入任何文件吗？</h4>
            <p className="text-gray-300 text-sm">
              大多数文本文件可以。二进制文件会跳过。图片、PDF 会作为多模态输入。
              非常大的目录可能会被截断以避免 Token 溢出。
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-cyan-400 font-semibold mb-2">Q: 如何查看所有可用命令？</h4>
            <p className="text-gray-300 text-sm">
              输入 <code className="bg-black/30 px-1 rounded">/help</code> 或 <code className="bg-black/30 px-1 rounded">/?</code> 查看内置命令。
              输入 <code className="bg-black/30 px-1 rounded">/</code> 后按 Tab 可以自动补全。
            </p>
          </div>
        </div>
      </Layer>

      {/* 相关页面 */}
      <RelatedPages
        pages={[
          { id: 'at-cmd', label: '@ 命令详解', description: '文件和目录注入的完整用法' },
          { id: 'config', label: '配置系统', description: '自定义命令和设置' },
          { id: 'extension', label: '扩展系统', description: 'MCP 命令和扩展开发' },
          { id: 'session-persistence', label: '会话持久化', description: '保存和恢复会话' },
        ]}
      />
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
