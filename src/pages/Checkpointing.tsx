import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function Checkpointing() {
  const checkpointFlowChart = `flowchart TD
    start([用户批准<br/>修改工具])
    check_enabled{检查点功能<br/>是否启用?}
    create_snapshot[创建 Git<br/>快照]
    save_conversation[保存对话<br/>历史]
    save_tool_call[保存工具<br/>调用信息]
    execute_tool[执行工具]
    end([工具执行完成])
    skip([直接执行<br/>无检查点])

    start --> check_enabled
    check_enabled -->|No| skip
    check_enabled -->|Yes| create_snapshot
    create_snapshot --> save_conversation
    save_conversation --> save_tool_call
    save_tool_call --> execute_tool
    execute_tool --> end

    style start fill:#22d3ee,color:#000
    style end fill:#22c55e,color:#000
    style skip fill:#22c55e,color:#000
    style check_enabled fill:#f59e0b,color:#000`;

  const restoreFlowChart = `flowchart TD
    start([执行 /restore<br/>命令])
    list[列出可用<br/>检查点]
    select[用户选择<br/>检查点]
    revert_files[恢复文件<br/>git checkout]
    restore_convo[恢复对话<br/>历史]
    restore_tool[重新提议<br/>工具调用]
    end([恢复完成<br/>可重新执行])

    start --> list
    list --> select
    select --> revert_files
    revert_files --> restore_convo
    restore_convo --> restore_tool
    restore_tool --> end

    style start fill:#22d3ee,color:#000
    style end fill:#22c55e,color:#000`;

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
        <MermaidDiagram chart={checkpointFlowChart} title="检查点创建流程" />

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

      {/* 快照触发点详解 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">快照生成触发时机</h3>
        <p className="text-gray-300 mb-4">
          检查点快照在 Agent Loop 的特定阶段自动触发，由 useGeminiStream hook 管理。
        </p>

        <CodeBlock
          code={`// 源码: packages/cli/src/ui/hooks/useGeminiStream.ts:1124
//
// 在 useEffect 中监听工具调用状态变化
useEffect(() => {
  const saveRestorableToolCalls = async () => {
    if (!config.getCheckpointingEnabled()) {
      return; // 检查点功能未启用则跳过
    }

    // 筛选出等待批准的编辑工具调用
    const restorableToolCalls = toolCalls.filter(
      (toolCall) =>
        EDIT_TOOL_NAMES.has(toolCall.request.name) &&  // 仅编辑工具
        toolCall.status === 'awaiting_approval',        // 等待用户批准
    );

    if (restorableToolCalls.length > 0) {
      const checkpointDir = storage.getProjectTempCheckpointsDir();

      for (const toolCall of restorableToolCalls) {
        const filePath = toolCall.request.args['file_path'] as string;

        // 1. 创建 Git 快照
        let commitHash: string | undefined;
        try {
          commitHash = await gitService.createFileSnapshot(
            \`Snapshot for \${toolCall.request.name}\`,
          );
        } catch (error) {
          onDebugMessage(\`Failed to create snapshot: \${error}\`);
        }

        // 2. 生成检查点文件名
        const timestamp = new Date()
          .toISOString()
          .replace(/:/g, '-')
          .replace(/\\./g, '_');
        const toolName = toolCall.request.name;
        const fileName = path.basename(filePath);
        const checkpointFileName = \`\${timestamp}-\${fileName}-\${toolName}.json\`;

        // 3. 保存检查点元数据
        const clientHistory = await geminiClient?.getHistory();
        await fs.writeFile(
          path.join(checkpointDir, checkpointFileName),
          JSON.stringify({
            history,              // UI 对话历史
            clientHistory,        // Gemini 客户端历史
            toolCall: {
              name: toolCall.request.name,
              args: toolCall.request.args,
            },
            commitHash,           // Git commit SHA
            filePath,             // 目标文件路径
          }, null, 2),
        );
      }
    }
  };

  saveRestorableToolCalls();
}, [toolCalls]);  // 当工具调用状态变化时触发`}
          language="typescript"
          title="快照触发机制实现"
        />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-3">触发条件总结</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p className="font-semibold text-green-300 mb-2">必须满足的条件：</p>
              <ul className="space-y-1">
                <li>• Checkpointing 功能已启用</li>
                <li>• 工具调用是编辑类工具（Write, Edit 等）</li>
                <li>• 工具调用状态为 'awaiting_approval'</li>
                <li>• 工具调用参数中包含 file_path</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-blue-300 mb-2">触发时间点：</p>
              <ul className="space-y-1">
                <li>• AI 生成工具调用后</li>
                <li>• 用户批准工具调用前</li>
                <li>• 在工具实际执行之前</li>
                <li>• 每个编辑工具调用独立触发</li>
              </ul>
            </div>
          </div>
        </div>
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

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-cyan-400 mb-4">影子仓库详细实现</h4>
          <CodeBlock
            code={`// 源码: packages/core/src/services/gitService.ts:57
//
// 影子仓库设置 - 使用独立的 .git 目录和工作树
async setupShadowGitRepository() {
  const repoDir = this.getHistoryDir();  // ~/.innies/history/<hash>
  const gitConfigPath = path.join(repoDir, '.gitconfig');

  await fs.mkdir(repoDir, { recursive: true });

  // 创建专用 Git 配置，避免继承用户全局配置
  const gitConfigContent =
    '[user]\\n  name = Innies Cli\\n  email = qwen-code@qwen.ai\\n[commit]\\n  gpgsign = false\\n';
  await fs.writeFile(gitConfigPath, gitConfigContent);

  // 初始化 Git 仓库
  const repo = simpleGit(repoDir);
  const isRepoDefined = await repo.checkIsRepo(CheckRepoActions.IS_REPO_ROOT);

  if (!isRepoDefined) {
    await repo.init(false, {
      '--initial-branch': 'main',
    });
    await repo.commit('Initial commit', { '--allow-empty': null });
  }

  // 同步用户项目的 .gitignore 到影子仓库
  const userGitIgnorePath = path.join(this.projectRoot, '.gitignore');
  const shadowGitIgnorePath = path.join(repoDir, '.gitignore');

  let userGitIgnoreContent = '';
  try {
    userGitIgnoreContent = await fs.readFile(userGitIgnorePath, 'utf-8');
  } catch (error) {
    // 项目没有 .gitignore 也可以
  }

  await fs.writeFile(shadowGitIgnorePath, userGitIgnoreContent);
}

// 配置影子仓库的环境变量
private get shadowGitRepository(): SimpleGit {
  const repoDir = this.getHistoryDir();
  return simpleGit(this.projectRoot).env({
    GIT_DIR: path.join(repoDir, '.git'),       // Git 元数据在影子目录
    GIT_WORK_TREE: this.projectRoot,           // 工作树指向项目目录
    HOME: repoDir,                             // 隔离用户全局配置
    XDG_CONFIG_HOME: repoDir,                  // 隔离用户全局配置
  });
}

// 创建快照 - 提交项目当前状态
async createFileSnapshot(message: string): Promise<string> {
  const repo = this.shadowGitRepository;
  await repo.add('.');                    // 添加所有变更
  const commitResult = await repo.commit(message);
  return commitResult.commit;             // 返回 commit SHA
}

// 恢复快照 - checkout 到指定 commit
async restoreProjectFromSnapshot(commitHash: string): Promise<void> {
  const repo = this.shadowGitRepository;
  await repo.raw(['restore', '--source', commitHash, '.']);
  await repo.clean('f', ['-d']);  // 清理快照后新增的未跟踪文件
}`}
            language="typescript"
            title="影子仓库完整实现"
          />

          <div className="mt-4 bg-gray-800/50 rounded-lg p-6">
            <h5 className="font-semibold text-cyan-400 mb-3">关键技术细节</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h6 className="font-semibold text-green-300 mb-2">环境变量隔离</h6>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>
                    <code className="text-yellow-300">GIT_DIR</code>:
                    <span className="text-gray-400"> 指定 .git 元数据位置，与项目 .git 分离</span>
                  </li>
                  <li>
                    <code className="text-yellow-300">GIT_WORK_TREE</code>:
                    <span className="text-gray-400"> 工作树指向项目目录，直接操作项目文件</span>
                  </li>
                  <li>
                    <code className="text-yellow-300">HOME / XDG_CONFIG_HOME</code>:
                    <span className="text-gray-400"> 隔离用户全局配置，避免继承 GPG 签名等设置</span>
                  </li>
                </ul>
              </div>

              <div>
                <h6 className="font-semibold text-blue-300 mb-2">操作流程</h6>
                <ol className="text-sm text-gray-300 space-y-2">
                  <li>1. 初始化影子仓库（首次使用）</li>
                  <li>2. 同步项目 .gitignore 规则</li>
                  <li>3. 创建快照时 git add . + commit</li>
                  <li>4. 恢复时 git restore 到指定 commit</li>
                  <li>5. 清理恢复后新增的未跟踪文件</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

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
        <MermaidDiagram chart={restoreFlowChart} title="/restore 恢复流程" />
        <CodeBlock code={restoreCommandCode} language="text" title="/restore 命令使用" />

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-cyan-400 mb-4">/restore 命令实现详解</h4>
          <CodeBlock
            code={`// 源码: packages/cli/src/ui/commands/restoreCommand.ts:17
//
async function restoreAction(
  context: CommandContext,
  args: string,
): Promise<void | SlashCommandActionReturn> {
  const { services, ui } = context;
  const { config, git: gitService } = services;
  const { addItem, loadHistory } = ui;

  const checkpointDir = config?.storage.getProjectTempCheckpointsDir();

  // 1. 列出所有可用检查点（无参数调用）
  if (!args) {
    const files = await fs.readdir(checkpointDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      return {
        type: 'message',
        messageType: 'info',
        content: 'No restorable tool calls found.',
      };
    }

    // 展示检查点列表（去除 .json 扩展名）
    const truncatedFiles = jsonFiles.map((file) => {
      const components = file.split('.');
      components.pop();
      return components.join('.');
    });

    return {
      type: 'message',
      messageType: 'info',
      content: \`Available tool calls to restore:\\n\\n\${truncatedFiles.join('\\n')}\`,
    };
  }

  // 2. 恢复指定检查点（带参数调用）
  const selectedFile = args.endsWith('.json') ? args : \`\${args}.json\`;
  const filePath = path.join(checkpointDir, selectedFile);

  // 读取检查点数据
  const data = await fs.readFile(filePath, 'utf-8');
  const toolCallData = JSON.parse(data);

  // 3. 恢复 UI 对话历史
  if (toolCallData.history) {
    loadHistory(toolCallData.history);
  }

  // 4. 恢复 Gemini 客户端历史
  if (toolCallData.clientHistory) {
    await config?.getGeminiClient()?.setHistory(toolCallData.clientHistory);
  }

  // 5. 恢复文件状态（git checkout）
  if (toolCallData.commitHash) {
    await gitService?.restoreProjectFromSnapshot(toolCallData.commitHash);
    addItem(
      {
        type: 'info',
        text: 'Restored project to the state before the tool call.',
      },
      Date.now(),
    );
  }

  // 6. 重新提议工具调用
  return {
    type: 'tool',
    toolName: toolCallData.toolCall.name,
    toolArgs: toolCallData.toolCall.args,
  };
}`}
            language="typescript"
            title="/restore 命令核心实现"
          />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="命令解析" variant="blue">
              <p className="text-sm text-gray-300">
                支持两种模式：无参数列出检查点，带参数恢复指定检查点。
                参数可以省略 .json 扩展名。
              </p>
            </HighlightBox>

            <HighlightBox title="检查点读取" variant="green">
              <p className="text-sm text-gray-300">
                从 JSON 文件读取完整的检查点数据，包括对话历史、
                Git commit hash 和工具调用信息。
              </p>
            </HighlightBox>

            <HighlightBox title="状态恢复" variant="purple">
              <p className="text-sm text-gray-300">
                依次恢复 UI 历史、客户端历史、文件状态，
                最后重新提议原始工具调用供用户决策。
              </p>
            </HighlightBox>
          </div>
        </div>
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

      {/* 完整闭环流程图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">完整闭环流程</h3>
        <p className="text-gray-300 mb-4">
          以下序列图展示从用户批准工具到创建检查点，再到恢复检查点的完整流程。
        </p>

        <MermaidDiagram
          chart={`sequenceDiagram
    participant User as 用户
    participant CLI as CLI (useGeminiStream)
    participant CS as CheckpointService
    participant GS as GitService
    participant FS as 文件系统

    Note over User,FS: 📸 创建检查点流程

    User->>CLI: 批准工具调用 (y)
    CLI->>CLI: 检测到 awaiting_approval<br/>编辑工具调用
    CLI->>CS: saveRestorableToolCalls()

    CS->>GS: createFileSnapshot(message)
    GS->>GS: git add .
    GS->>GS: git commit
    GS-->>CS: commitHash

    CS->>FS: 写入检查点 JSON
    Note right of FS: ~/.innies/tmp/<hash>/<br/>checkpoints/<timestamp>.json<br/>{history, clientHistory,<br/>toolCall, commitHash}

    CS-->>CLI: 检查点创建完成
    CLI->>User: 执行工具调用

    Note over User,FS: 🔄 恢复检查点流程

    User->>CLI: /restore [checkpoint]
    CLI->>CS: restoreAction(checkpointId)

    CS->>FS: 读取检查点 JSON
    FS-->>CS: {history, clientHistory,<br/>toolCall, commitHash}

    CS->>GS: restoreProjectFromSnapshot(commitHash)
    GS->>GS: git restore --source <hash> .
    GS->>GS: git clean -f -d
    GS-->>CS: 文件已恢复

    CS->>CLI: loadHistory(history)
    CS->>CLI: setHistory(clientHistory)
    CS-->>CLI: 返回工具调用

    CLI->>User: 重新提议工具调用<br/>[y] 执行 [n] 取消 [e] 编辑`}
          title="检查点创建与恢复完整流程"
        />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="创建流程关键步骤" variant="green">
            <ol className="text-sm text-gray-300 space-y-1">
              <li>1. 用户批准工具 → useGeminiStream 监听</li>
              <li>2. 调用 GitService 创建快照 (git commit)</li>
              <li>3. 保存检查点元数据到 JSON 文件</li>
              <li>4. 继续执行工具调用</li>
            </ol>
          </HighlightBox>

          <HighlightBox title="恢复流程关键步骤" variant="blue">
            <ol className="text-sm text-gray-300 space-y-1">
              <li>1. /restore 命令读取检查点 JSON</li>
              <li>2. GitService 恢复文件 (git restore)</li>
              <li>3. 恢复 UI 和客户端对话历史</li>
              <li>4. 重新提议工具调用供用户决策</li>
            </ol>
          </HighlightBox>
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
