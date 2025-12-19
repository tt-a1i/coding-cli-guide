import { HighlightBox } from '../components/HighlightBox';
import { FlowDiagram } from '../components/FlowDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function Checkpointing() {
  const checkpointCreationFlow = {
    title: '检查点创建流程',
    nodes: [
      { id: 'start', label: '用户批准\n修改工具', type: 'start' as const },
      { id: 'check_enabled', label: '检查点功能\n是否启用?', type: 'decision' as const },
      { id: 'create_snapshot', label: '创建 Git\n快照', type: 'process' as const },
      { id: 'save_conversation', label: '保存对话\n历史', type: 'process' as const },
      { id: 'save_tool_call', label: '保存工具\n调用信息', type: 'process' as const },
      { id: 'execute_tool', label: '执行工具', type: 'process' as const },
      { id: 'end', label: '工具执行完成', type: 'end' as const },
      { id: 'skip', label: '直接执行\n(无检查点)', type: 'end' as const },
    ],
    edges: [
      { from: 'start', to: 'check_enabled' },
      { from: 'check_enabled', to: 'skip', label: 'No' },
      { from: 'check_enabled', to: 'create_snapshot', label: 'Yes' },
      { from: 'create_snapshot', to: 'save_conversation' },
      { from: 'save_conversation', to: 'save_tool_call' },
      { from: 'save_tool_call', to: 'execute_tool' },
      { from: 'execute_tool', to: 'end' },
    ],
  };

  const restoreFlow = {
    title: '/restore 恢复流程',
    nodes: [
      { id: 'start', label: '执行 /restore\n命令', type: 'start' as const },
      { id: 'list', label: '列出可用\n检查点', type: 'process' as const },
      { id: 'select', label: '用户选择\n检查点', type: 'process' as const },
      { id: 'revert_files', label: '恢复文件\n(git checkout)', type: 'process' as const },
      { id: 'restore_convo', label: '恢复对话\n历史', type: 'process' as const },
      { id: 'restore_tool', label: '重新提议\n工具调用', type: 'process' as const },
      { id: 'end', label: '恢复完成\n可重新执行', type: 'end' as const },
    ],
    edges: [
      { from: 'start', to: 'list' },
      { from: 'list', to: 'select' },
      { from: 'select', to: 'revert_files' },
      { from: 'revert_files', to: 'restore_convo' },
      { from: 'restore_convo', to: 'restore_tool' },
      { from: 'restore_tool', to: 'end' },
    ],
  };

  const enableConfigCode = `// 方式一：命令行参数启用
$ innies --checkpointing

// 方式二：settings.json 永久启用
// ~/.innies/settings.json
{
  "general": {
    "checkpointing": {
      "enabled": true
    }
  }
}`;

  const checkpointStorageCode = `// 检查点数据存储结构
// ~/.innies/

├── history/                    # Git 快照存储
│   └── <project_hash>/        # 每个项目一个影子仓库
│       ├── .git/              # Git 仓库数据
│       └── ...                # 项目文件快照
│
└── tmp/
    └── <project_hash>/
        └── checkpoints/        # 检查点元数据
            ├── 2025-06-22T10-00-00_000Z-app.ts-write_file.json
            ├── 2025-06-22T10-05-00_000Z-index.ts-edit.json
            └── ...

// 检查点 JSON 结构
interface Checkpoint {
  timestamp: string;           // ISO 时间戳
  gitCommitHash: string;       // 影子仓库的 commit SHA
  targetFile: string;          // 将被修改的文件
  toolName: string;            // 工具名称
  toolCall: ToolCallInfo;      // 完整的工具调用信息
  conversationHistory: Message[];  // 对话历史
}`;

  const shadowGitCode = `// 影子 Git 仓库机制
// 来源: packages/core/src/services/gitService.ts

class GitService {
  /**
   * 初始化 checkpointing - 检查 Git 是否可用
   * @throws 如果 Git 不可用或初始化失败
   */
  async initializeCheckpointing(): Promise<void> {
    const gitAvailable = await this.isGitAvailable();
    if (!gitAvailable) {
      throw new Error(
        'Checkpointing is enabled, but Git is not installed.'
      );
    }
    await this.setupShadowGitRepository();
  }

  /**
   * 在项目根目录创建隐藏的 git 仓库
   * 用于支持 checkpointing 功能
   */
  async setupShadowGitRepository(): Promise<void> {
    const hiddenGitDir = path.join(this.targetDir, '.innies', '.git');

    if (await exists(hiddenGitDir)) {
      return; // 已存在
    }

    // 初始化隐藏的 git 仓库
    await this.runGitCommand(['init'], {
      cwd: path.join(this.targetDir, '.innies'),
    });
  }

  /**
   * 创建检查点 - 在执行修改工具前调用
   */
  async createCheckpoint(message: string): Promise<string> {
    await this.runGitCommand(['add', '-A']);
    const result = await this.runGitCommand(['commit', '-m', message]);
    return this.getHeadCommitHash();
  }

  /**
   * 恢复到指定检查点
   */
  async restoreToCheckpoint(commitHash: string): Promise<void> {
    await this.runGitCommand(['checkout', commitHash, '--', '.']);
  }
}`;

  const restoreCommandCode = `// /restore 命令使用

// 列出所有检查点
> /restore

Available checkpoints:
┌────┬──────────────────────────────────────────────────────┐
│  # │ Checkpoint                                           │
├────┼──────────────────────────────────────────────────────┤
│  1 │ 2025-06-22T10-00-00 - app.ts (write_file)           │
│  2 │ 2025-06-22T10-05-00 - index.ts (edit)               │
│  3 │ 2025-06-22T10-10-00 - package.json (write_file)     │
└────┴──────────────────────────────────────────────────────┘

Select a checkpoint to restore (1-3) or press Esc to cancel: _

// 恢复指定检查点
> /restore 2025-06-22T10-00-00_000Z-app.ts-write_file

Restoring checkpoint...
✓ Files reverted to previous state
✓ Conversation history restored
✓ Tool call re-proposed

The following tool call is pending:
┌─────────────────────────────────────────────────────────┐
│ Tool: write_file                                        │
│ File: app.ts                                           │
│ ───────────────────────────────────────────────────────│
│ + import { newFeature } from './feature';              │
│ + newFeature();                                        │
│ ───────────────────────────────────────────────────────│
│ [y] 执行  [n] 取消  [e] 编辑                           │
└─────────────────────────────────────────────────────────┘`;

  const workflowExampleCode = `// 典型工作流示例

// 1. 启动带检查点的会话
$ innies --checkpointing

// 2. AI 提议修改文件
AI: 我将修改 app.ts 添加新功能...
[Tool: write_file] app.ts
[y] 批准

// 3. 检查点自动创建
✓ Checkpoint created: 2025-06-22T10-00-00_000Z-app.ts-write_file

// 4. 修改执行
✓ File written: app.ts

// 5. 发现问题，需要回滚
> 这个修改有问题，帮我恢复

// 或者直接使用命令
> /restore

// 6. 选择检查点恢复
Select: 1

// 7. 文件恢复，工具调用重新提议
✓ Restored to checkpoint
[Tool: write_file] app.ts
[y] 执行  [n] 取消  [e] 编辑

// 8. 可以选择重新执行、取消或编辑后执行`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Checkpointing 检查点系统</h2>
        <p className="text-gray-300 mb-4">
          Checkpointing 功能在任何文件修改操作之前自动保存项目状态快照。
          这让你可以安全地尝试 AI 的代码变更，随时可以恢复到修改前的状态。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="Git 快照" variant="blue">
            <p className="text-sm text-gray-300">
              使用独立的"影子" Git 仓库保存文件快照，不影响项目本身的 Git 历史。
            </p>
          </HighlightBox>

          <HighlightBox title="对话保存" variant="green">
            <p className="text-sm text-gray-300">
              保存完整的对话历史，恢复后可以继续之前的上下文。
            </p>
          </HighlightBox>

          <HighlightBox title="工具重提" variant="purple">
            <p className="text-sm text-gray-300">
              恢复后重新提议原始工具调用，可以重新执行、取消或编辑。
            </p>
          </HighlightBox>
        </div>
      </section>

      {/* 启用功能 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">启用 Checkpointing</h3>
        <HighlightBox title="默认关闭" variant="blue">
          <p className="text-sm text-gray-300 mb-2">
            Checkpointing 功能<strong>默认关闭</strong>。
            可以通过命令行参数或配置文件启用。
          </p>
        </HighlightBox>

        <CodeBlock code={enableConfigCode} language="bash" title="启用方式" />
      </section>

      {/* 检查点创建流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">检查点创建流程</h3>
        <FlowDiagram {...checkpointCreationFlow} />

        <HighlightBox title="检查点包含内容" variant="green">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-green-300 mb-1">1. Git 快照</h5>
              <p className="text-gray-400">项目文件的完整状态，存储在影子仓库中</p>
            </div>
            <div>
              <h5 className="font-semibold text-green-300 mb-1">2. 对话历史</h5>
              <p className="text-gray-400">到检查点为止的完整对话记录</p>
            </div>
            <div>
              <h5 className="font-semibold text-green-300 mb-1">3. 工具调用</h5>
              <p className="text-gray-400">即将执行的工具及其参数</p>
            </div>
          </div>
        </HighlightBox>
      </section>

      {/* 存储结构 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">存储结构</h3>
        <CodeBlock code={checkpointStorageCode} language="text" title="检查点数据结构" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-3">检查点命名规则</h4>
          <div className="text-sm text-gray-300">
            <code className="text-yellow-300">{`{timestamp}-{filename}-{toolname}`}</code>
            <div className="mt-2 space-y-1">
              <p><strong>timestamp</strong>: ISO 8601 格式时间戳</p>
              <p><strong>filename</strong>: 将被修改的目标文件名</p>
              <p><strong>toolname</strong>: 执行的工具名称 (write_file, edit 等)</p>
            </div>
            <p className="mt-2 text-gray-400">
              示例: <code>2025-06-22T10-00-00_000Z-app.ts-write_file</code>
            </p>
          </div>
        </div>
      </section>

      {/* 影子 Git 仓库 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">影子 Git 仓库机制</h3>
        <p className="text-gray-300 mb-4">
          检查点使用独立的 Git 仓库存储快照，这样不会影响项目本身的 Git 历史和工作流。
        </p>

        <CodeBlock code={shadowGitCode} language="typescript" title="影子仓库实现" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <HighlightBox title="为什么用影子仓库？" variant="blue">
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 不污染项目的 Git 历史</li>
              <li>• 不影响 git status / git diff</li>
              <li>• 支持非 Git 项目</li>
              <li>• 独立的版本控制</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="存储位置" variant="green">
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 路径: ~/.innies/history/&lt;hash&gt;</li>
              <li>• 每个项目一个独立仓库</li>
              <li>• hash 基于项目路径生成</li>
              <li>• 可手动删除清理空间</li>
            </ul>
          </HighlightBox>
        </div>
      </section>

      {/* 恢复流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">/restore 恢复流程</h3>
        <FlowDiagram {...restoreFlow} />
        <CodeBlock code={restoreCommandCode} language="text" title="/restore 命令使用" />
      </section>

      {/* 工作流示例 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">典型工作流</h3>
        <CodeBlock code={workflowExampleCode} language="bash" title="完整工作流示例" />
      </section>

      {/* 恢复后操作 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">恢复后的选项</h3>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">工具调用重新提议</h4>
          <p className="text-gray-400 text-sm mb-4">恢复检查点后，原始的工具调用会被重新提议：</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
              <kbd className="px-3 py-1 bg-gray-700 rounded text-green-400">y</kbd>
              <p className="text-green-400 font-medium mt-2">重新执行</p>
              <p className="text-gray-400 text-xs mt-1">再次尝试相同的修改</p>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
              <kbd className="px-3 py-1 bg-gray-700 rounded text-red-400">n</kbd>
              <p className="text-red-400 font-medium mt-2">取消执行</p>
              <p className="text-gray-400 text-xs mt-1">放弃这个修改</p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
              <kbd className="px-3 py-1 bg-gray-700 rounded text-yellow-400">e</kbd>
              <p className="text-yellow-400 font-medium mt-2">编辑后执行</p>
              <p className="text-gray-400 text-xs mt-1">修改工具参数后执行</p>
            </div>
          </div>
        </div>
      </section>

      {/* 架构图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">Checkpointing 架构</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                     用户批准工具执行                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CheckpointService                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 createCheckpoint()                       │    │
│  │                                                         │    │
│  │   1. 获取当前文件状态                                    │    │
│  │   2. 复制到影子仓库                                      │    │
│  │   3. Git commit                                         │    │
│  │   4. 保存对话历史                                        │    │
│  │   5. 保存工具调用信息                                    │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐
│ 影子 Git 仓库 │  │ 对话历史文件 │  │ 工具调用 JSON       │
│              │  │              │  │                      │
│ ~/.innies/   │  │ ~/.innies/   │  │ ~/.innies/tmp/       │
│ history/     │  │ tmp/<hash>/  │  │ <hash>/checkpoints/  │
│ <hash>/      │  │ checkpoints/ │  │ <timestamp>.json     │
│              │  │              │  │                      │
│ ┌──────────┐ │  │ conversation │  │ {                    │
│ │ commit 1 │ │  │ history      │  │   toolName,          │
│ │ commit 2 │ │  │              │  │   toolCall,          │
│ │ ...      │ │  │              │  │   targetFile         │
│ └──────────┘ │  │              │  │ }                    │
└──────────────┘  └──────────────┘  └──────────────────────┘

                      /restore 命令
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   restoreCheckpoint()                           │
│                                                                  │
│   1. 读取检查点 JSON                                            │
│   2. git checkout <commit> 在影子仓库                           │
│   3. 复制文件回项目目录                                         │
│   4. 恢复对话历史                                               │
│   5. 重新提议工具调用                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* 注意事项 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">注意事项</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="存储空间" variant="yellow">
            <p className="text-sm text-gray-300">
              检查点会占用磁盘空间。对于大型项目，影子仓库可能变得很大。
              可以定期清理 <code>~/.innies/history/</code> 目录。
            </p>
          </HighlightBox>

          <HighlightBox title="仅限修改工具" variant="blue">
            <p className="text-sm text-gray-300">
              检查点只在文件修改工具（write_file, edit 等）执行前创建，
              只读工具不会触发检查点。
            </p>
          </HighlightBox>

          <HighlightBox title="性能影响" variant="green">
            <p className="text-sm text-gray-300">
              创建检查点需要额外的 I/O 操作，可能略微增加工具执行前的延迟。
              对于大型项目影响更明显。
            </p>
          </HighlightBox>

          <HighlightBox title="非 Git 项目" variant="purple">
            <p className="text-sm text-gray-300">
              即使项目本身不使用 Git，检查点功能仍然可用。
              影子仓库是完全独立的。
            </p>
          </HighlightBox>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">最佳实践</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">推荐做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 尝试新功能时启用检查点</li>
              <li>✓ 重构代码时启用检查点</li>
              <li>✓ 定期清理旧检查点释放空间</li>
              <li>✓ 恢复前确认当前有未保存的更改</li>
              <li>✓ 使用配置文件永久启用</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">注意事项</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✗ 不要依赖检查点作为唯一备份</li>
              <li>✗ 大型项目注意磁盘空间</li>
              <li>✗ 恢复会覆盖当前文件状态</li>
              <li>✗ 检查点不包含非文件状态</li>
              <li>✗ 跨会话恢复可能有上下文问题</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
