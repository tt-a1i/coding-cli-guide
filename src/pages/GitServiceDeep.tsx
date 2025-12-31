import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

export function GitServiceDeep() {
  const shadowGitArchitecture = `
flowchart TB
    subgraph ProjectRoot["项目根目录"]
        UserGit[".git (用户仓库)"]
        UserFiles["项目文件"]
    end

    subgraph HistoryDir[".gemini/history/"]
        ShadowGit[".git (影子仓库)"]
        GitConfig[".gitconfig"]
        GitIgnore[".gitignore (同步)"]
    end

    GitService["GitService"]
    SimpleGit["simple-git 库"]

    GitService --> |初始化| HistoryDir
    GitService --> |env 覆盖| SimpleGit
    SimpleGit --> |GIT_DIR| ShadowGit
    SimpleGit --> |GIT_WORK_TREE| UserFiles

    UserGit -.->|"独立，不干扰"| ShadowGit

    style GitService fill:#22d3ee,color:#000
    style ShadowGit fill:#4ade80,color:#000
    style UserGit fill:#f59e0b,color:#000
`;

  const checkpointFlow = `
sequenceDiagram
    participant User as 用户操作
    participant CLI as CLI
    participant GS as GitService
    participant SG as Shadow Git
    participant FS as 文件系统

    Note over CLI,GS: 初始化阶段
    CLI->>GS: initialize()
    GS->>GS: verifyGitAvailability()
    GS->>FS: mkdir(.gemini/history)
    GS->>FS: write(.gitconfig)
    GS->>SG: git init
    GS->>SG: git commit --allow-empty

    Note over User,FS: 创建检查点
    User->>CLI: 执行工具操作
    CLI->>GS: createFileSnapshot("message")
    GS->>SG: git add .
    GS->>SG: git commit -m "message"
    GS-->>CLI: commitHash

    Note over User,FS: 恢复检查点
    User->>CLI: /undo 命令
    CLI->>GS: restoreProjectFromSnapshot(hash)
    GS->>SG: git restore --source hash .
    GS->>SG: git clean -fd
    GS-->>CLI: 恢复完成
`;

  const initializationStates = `
stateDiagram-v2
    [*] --> CheckGit: initialize()

    CheckGit --> GitMissing: git不可用
    CheckGit --> SetupShadow: git可用

    GitMissing --> [*]: 抛出错误

    SetupShadow --> CreateDir: mkdir
    CreateDir --> WriteConfig: 写入.gitconfig
    WriteConfig --> CheckRepo: 检查是否已初始化

    CheckRepo --> GitInit: 未初始化
    CheckRepo --> SyncIgnore: 已初始化

    GitInit --> InitialCommit: git init
    InitialCommit --> SyncIgnore: 空提交

    SyncIgnore --> Ready: 同步.gitignore
    Ready --> [*]: 初始化完成
`;

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-xl p-6 border border-green-500/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">📦</span>
          <h1 className="text-3xl font-bold text-white">GitService 深度解析</h1>
        </div>
        <p className="text-gray-300 text-lg">
          影子 Git 仓库管理、文件检查点创建与恢复的核心服务实现
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-green-500/30 rounded-full text-sm text-green-300">Shadow Git</span>
          <span className="px-3 py-1 bg-cyan-500/30 rounded-full text-sm text-cyan-300">Checkpointing</span>
          <span className="px-3 py-1 bg-purple-500/30 rounded-full text-sm text-purple-300">simple-git</span>
        </div>
      </div>

      {/* 核心概念 */}
      <Layer title="核心概念" icon="🎯">
        <div className="space-y-4">
          <p className="text-gray-300">
            GitService 是 Innies CLI 检查点系统的核心，它创建一个独立于用户仓库的「影子 Git 仓库」来跟踪文件变更。
            这种设计确保 CLI 的版本控制不会干扰用户的 Git 工作流。
          </p>

          <HighlightBox title="为什么需要影子仓库？" icon="💡" variant="blue">
            <ul className="space-y-2 text-sm">
              <li><strong>隔离性</strong>：不污染用户的 .git 历史和暂存区</li>
              <li><strong>独立配置</strong>：使用专用的 user.name/email，禁用 GPG 签名</li>
              <li><strong>自动化</strong>：每次工具操作自动创建快照，支持 /undo 恢复</li>
              <li><strong>透明性</strong>：用户无需关心底层实现，专注于开发工作</li>
            </ul>
          </HighlightBox>

          <MermaidDiagram chart={shadowGitArchitecture} title="影子 Git 架构" />
        </div>
      </Layer>

      {/* 初始化流程 */}
      <Layer title="初始化流程" icon="🚀">
        <div className="space-y-4">
          <p className="text-gray-300">
            GitService 在会话启动时初始化，创建影子仓库并配置独立的 Git 环境。
          </p>

          <CodeBlock
            title="初始化核心代码"
            code={`// packages/core/src/services/gitService.ts

export class GitService {
  private projectRoot: string;
  private storage: Storage;

  async initialize(): Promise<void> {
    // 1. 验证 Git 可用性
    const gitAvailable = await this.verifyGitAvailability();
    if (!gitAvailable) {
      throw new Error(
        'Checkpointing is enabled, but Git is not installed.'
      );
    }

    // 2. 设置影子仓库
    try {
      await this.setupShadowGitRepository();
    } catch (error) {
      throw new Error(\`Failed to initialize checkpointing: \${error.message}\`);
    }
  }

  async setupShadowGitRepository() {
    const repoDir = this.getHistoryDir(); // .gemini/history/
    const gitConfigPath = path.join(repoDir, '.gitconfig');

    // 创建目录
    await fs.mkdir(repoDir, { recursive: true });

    // 专用 gitconfig，避免继承用户配置
    const gitConfigContent = \`[user]
  name = Innies Cli
  email = gemini-code@google.com
[commit]
  gpgsign = false
\`;
    await fs.writeFile(gitConfigPath, gitConfigContent);

    // 初始化仓库
    const repo = simpleGit(repoDir);
    const isRepoDefined = await repo.checkIsRepo(CheckRepoActions.IS_REPO_ROOT);

    if (!isRepoDefined) {
      await repo.init(false, { '--initial-branch': 'main' });
      await repo.commit('Initial commit', { '--allow-empty': null });
    }

    // 同步用户的 .gitignore
    const userGitIgnorePath = path.join(this.projectRoot, '.gitignore');
    const shadowGitIgnorePath = path.join(repoDir, '.gitignore');

    let userGitIgnoreContent = '';
    try {
      userGitIgnoreContent = await fs.readFile(userGitIgnorePath, 'utf-8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    await fs.writeFile(shadowGitIgnorePath, userGitIgnoreContent);
  }
}`}
          />

          <MermaidDiagram chart={initializationStates} title="初始化状态机" />
        </div>
      </Layer>

      {/* 环境变量覆盖 */}
      <Layer title="环境变量覆盖机制" icon="🔧">
        <div className="space-y-4">
          <p className="text-gray-300">
            GitService 通过设置环境变量，让 simple-git 操作影子仓库而不是用户仓库。
          </p>

          <CodeBlock
            title="环境变量覆盖"
            code={`private get shadowGitRepository(): SimpleGit {
  const repoDir = this.getHistoryDir();

  return simpleGit(this.projectRoot).env({
    // 指向影子仓库的 .git 目录
    GIT_DIR: path.join(repoDir, '.git'),

    // 工作树仍然是项目根目录
    GIT_WORK_TREE: this.projectRoot,

    // 阻止读取用户的全局 git 配置
    HOME: repoDir,
    XDG_CONFIG_HOME: repoDir,
  });
}`}
          />

          <HighlightBox title="环境变量说明" icon="📝" variant="green">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-3">变量</th>
                    <th className="text-left py-2 px-3">作用</th>
                    <th className="text-left py-2 px-3">值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3 font-mono text-cyan-400">GIT_DIR</td>
                    <td className="py-2 px-3">指定 .git 目录位置</td>
                    <td className="py-2 px-3 font-mono">.gemini/history/.git</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3 font-mono text-cyan-400">GIT_WORK_TREE</td>
                    <td className="py-2 px-3">指定工作树位置</td>
                    <td className="py-2 px-3 font-mono">项目根目录</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3 font-mono text-cyan-400">HOME</td>
                    <td className="py-2 px-3">覆盖 HOME 目录</td>
                    <td className="py-2 px-3 font-mono">.gemini/history/</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-cyan-400">XDG_CONFIG_HOME</td>
                    <td className="py-2 px-3">覆盖 XDG 配置目录</td>
                    <td className="py-2 px-3 font-mono">.gemini/history/</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 检查点操作 */}
      <Layer title="检查点创建与恢复" icon="💾">
        <div className="space-y-4">
          <MermaidDiagram chart={checkpointFlow} title="检查点操作流程" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CodeBlock
              title="创建快照"
              code={`async createFileSnapshot(message: string): Promise<string> {
  try {
    const repo = this.shadowGitRepository;

    // 暂存所有文件
    await repo.add('.');

    // 创建提交
    const commitResult = await repo.commit(message);

    return commitResult.commit;
  } catch (error) {
    throw new Error(
      \`Failed to create checkpoint snapshot: \${error.message}\`
    );
  }
}`}
            />

            <CodeBlock
              title="恢复快照"
              code={`async restoreProjectFromSnapshot(
  commitHash: string
): Promise<void> {
  const repo = this.shadowGitRepository;

  // 从指定提交恢复所有文件
  await repo.raw([
    'restore',
    '--source', commitHash,
    '.'
  ]);

  // 清理新增的未跟踪文件
  await repo.clean('f', ['-d']);
}`}
            />
          </div>

          <HighlightBox title="恢复操作注意事项" icon="⚠️" variant="orange">
            <ul className="space-y-2 text-sm">
              <li><code className="text-cyan-400">git restore --source</code>：恢复跟踪文件到指定提交状态</li>
              <li><code className="text-cyan-400">git clean -fd</code>：删除快照后新增的未跟踪文件和目录</li>
              <li>恢复操作<strong>不可逆</strong>，执行前应确认当前状态已保存</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* Git 命令矩阵 */}
      <Layer title="Git 命令矩阵" icon="📋">
        <div className="space-y-4">
          <p className="text-gray-300">
            GitService 实际调用的 Git 命令及其语义、失败处理和重试策略：
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">命令</th>
                  <th className="text-left py-2 px-3">调用场景</th>
                  <th className="text-left py-2 px-3">失败后果</th>
                  <th className="text-left py-2 px-3">可重试</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">git --version</td>
                  <td className="py-2 px-3">verifyGitAvailability()</td>
                  <td className="py-2 px-3 text-red-400">禁用检查点功能</td>
                  <td className="py-2 px-3 text-red-400">✗ 环境问题</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">git init</td>
                  <td className="py-2 px-3">setupShadowGitRepository()</td>
                  <td className="py-2 px-3 text-red-400">初始化失败，抛错</td>
                  <td className="py-2 px-3 text-yellow-400">△ 清理后重试</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">git checkIsRepo</td>
                  <td className="py-2 px-3">检查仓库是否已初始化</td>
                  <td className="py-2 px-3">返回 false，触发 init</td>
                  <td className="py-2 px-3 text-green-400">✓ 幂等</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">git add .</td>
                  <td className="py-2 px-3">createFileSnapshot()</td>
                  <td className="py-2 px-3 text-orange-400">快照创建失败</td>
                  <td className="py-2 px-3 text-green-400">✓ 幂等</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">git commit</td>
                  <td className="py-2 px-3">createFileSnapshot()</td>
                  <td className="py-2 px-3 text-orange-400">快照创建失败</td>
                  <td className="py-2 px-3 text-yellow-400">△ 无变更时失败</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-cyan-400">git restore --source</td>
                  <td className="py-2 px-3">restoreProjectFromSnapshot()</td>
                  <td className="py-2 px-3 text-red-400">恢复失败，状态不一致</td>
                  <td className="py-2 px-3 text-green-400">✓ 幂等</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-cyan-400">git clean -fd</td>
                  <td className="py-2 px-3">restoreProjectFromSnapshot()</td>
                  <td className="py-2 px-3 text-orange-400">残留未跟踪文件</td>
                  <td className="py-2 px-3 text-green-400">✓ 幂等</td>
                </tr>
              </tbody>
            </table>
          </div>

          <HighlightBox title="重试策略说明" icon="🔄" variant="blue">
            <ul className="space-y-2 text-sm">
              <li><span className="text-green-400">✓ 幂等</span>：安全重试，多次执行结果一致</li>
              <li><span className="text-yellow-400">△ 条件重试</span>：需要检查前置条件或清理状态后重试</li>
              <li><span className="text-red-400">✗ 不可重试</span>：环境问题或需要用户介入</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            title="commit 无变更的边界处理"
            code={`// git commit 在无变更时会返回错误
// GitService 需要区分"真正失败"和"无变更"
async createFileSnapshot(message: string): Promise<string> {
  try {
    await repo.add('.');
    const commitResult = await repo.commit(message);
    return commitResult.commit;
  } catch (error) {
    // 检查是否为"nothing to commit"
    if (error.message.includes('nothing to commit')) {
      // 返回当前 HEAD，表示状态未变
      return await this.getCurrentCommitHash();
    }
    throw error; // 真正的错误
  }
}`}
          />
        </div>
      </Layer>

      {/* 冲突类型澄清 */}
      <Layer title="「冲突」的准确定义" icon="⚠️">
        <div className="space-y-4">
          <HighlightBox title="重要澄清" icon="🚨" variant="red">
            <p className="text-sm">
              GitService 处理的「冲突」是<strong>编辑/补丁应用冲突</strong>，而非 <code>git merge</code> 冲突。
              这两者有本质区别：
            </p>
          </HighlightBox>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">类型</th>
                  <th className="text-left py-2 px-3">发生场景</th>
                  <th className="text-left py-2 px-3">责任模块</th>
                  <th className="text-left py-2 px-3">处理方式</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-red-400">Merge Conflict</td>
                  <td className="py-2 px-3">git merge/rebase 操作</td>
                  <td className="py-2 px-3">用户的 Git 工作流</td>
                  <td className="py-2 px-3">GitService <strong>不处理</strong></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-orange-400">Apply Conflict</td>
                  <td className="py-2 px-3">Edit 工具应用 diff 时</td>
                  <td className="py-2 px-3">DiffApplyService / EditTool</td>
                  <td className="py-2 px-3">重新生成 diff 或报错</td>
                </tr>
              </tbody>
            </table>
          </div>

          <CodeBlock
            title="Apply Conflict 的典型场景"
            code={`// 场景：AI 生成了基于旧版本的 diff
// 用户在 AI 响应期间修改了同一文件

// 1. AI 读取文件 (版本 A)
const originalContent = await readFile('app.ts');

// 2. 用户同时编辑了 app.ts (版本 B)
// ... 用户在编辑器中保存了修改 ...

// 3. AI 尝试应用 diff (基于版本 A)
const diff = generateDiff(originalContent, newContent);

// 4. Apply 时发现文件已变更
// EditTool 检测到 old_string 不匹配
// 这是 Apply Conflict，不是 Git Merge Conflict

// 处理方式：
// - 向用户报告冲突
// - 建议重新读取文件后重试
// - GitService 的 checkpoint 可用于回滚`}
          />

          <HighlightBox title="GitService 在冲突中的角色" icon="📦" variant="green">
            <ul className="space-y-2 text-sm">
              <li><strong>提供回滚能力</strong>：/undo 可恢复到 diff 应用前的状态</li>
              <li><strong>不参与冲突检测</strong>：检测由 EditTool 的 old_string 匹配完成</li>
              <li><strong>不参与冲突解决</strong>：解决由 AI 重新生成 diff 或用户手动处理</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* 边界条件 */}
      <Layer title="边界条件深度解析" depth={1} defaultOpen={true}>
        <Layer title="1. Git 不可用场景" depth={2} defaultOpen={true}>
          <div className="space-y-4">
            <CodeBlock
              title="Git 可用性检测"
              code={`async verifyGitAvailability(): Promise<boolean> {
  try {
    await spawnAsync('git', ['--version']);
    return true;
  } catch (_error) {
    return false;
  }
}

// 检测失败时的错误处理
if (!gitAvailable) {
  throw new Error(
    'Checkpointing is enabled, but Git is not installed. ' +
    'Please install Git or disable checkpointing to continue.'
  );
}`}
            />

            <HighlightBox title="常见场景" icon="🔍" variant="blue">
              <ul className="space-y-2 text-sm">
                <li><strong>Docker 容器</strong>：部分镜像不包含 git</li>
                <li><strong>受限环境</strong>：企业环境可能限制 git 访问</li>
                <li><strong>路径问题</strong>：git 不在 PATH 中</li>
              </ul>
            </HighlightBox>
          </div>
        </Layer>

        <Layer title="2. 权限与文件系统边界" depth={2} defaultOpen={true}>
          <div className="space-y-4">
            <CodeBlock
              title="目录创建失败处理"
              code={`// 可能失败的场景
await fs.mkdir(repoDir, { recursive: true });

// 常见错误：
// - EACCES: 权限不足
// - EROFS: 只读文件系统
// - ENOSPC: 磁盘空间不足

// 错误会被上层捕获并转为用户友好消息
try {
  await this.setupShadowGitRepository();
} catch (error) {
  throw new Error(
    \`Failed to initialize checkpointing: \${error.message}. \` +
    'Please check that Git is working properly or disable checkpointing.'
  );
}`}
            />
          </div>
        </Layer>

        <Layer title="3. .gitignore 同步边界" depth={2} defaultOpen={true}>
          <div className="space-y-4">
            <p className="text-gray-300">
              影子仓库需要遵守用户项目的 .gitignore 规则，避免跟踪不必要的文件。
            </p>

            <CodeBlock
              title=".gitignore 同步逻辑"
              code={`// 读取用户的 .gitignore
let userGitIgnoreContent = '';
try {
  userGitIgnoreContent = await fs.readFile(userGitIgnorePath, 'utf-8');
} catch (error) {
  // 文件不存在是正常情况，忽略
  if (isNodeError(error) && error.code !== 'ENOENT') {
    throw error; // 其他错误需要抛出
  }
}

// 同步到影子仓库
await fs.writeFile(shadowGitIgnorePath, userGitIgnoreContent);`}
            />

            <HighlightBox title="边界情况" icon="⚠️" variant="orange">
              <ul className="space-y-2 text-sm">
                <li><strong>.gitignore 不存在</strong>：静默处理，使用空内容</li>
                <li><strong>权限错误</strong>：EACCES 等错误会被抛出</li>
                <li><strong>同步时机</strong>：仅在初始化时同步，运行时修改不会自动更新</li>
              </ul>
            </HighlightBox>
          </div>
        </Layer>

        <Layer title="4. 大文件与性能边界" depth={2} defaultOpen={true}>
          <div className="space-y-4">
            <HighlightBox title="性能考量" icon="⚡" variant="yellow">
              <ul className="space-y-2 text-sm">
                <li><strong>大型仓库</strong>：git add . 可能耗时较长</li>
                <li><strong>二进制文件</strong>：大型二进制文件会显著增加仓库体积</li>
                <li><strong>频繁快照</strong>：每次工具操作都创建快照可能导致历史膨胀</li>
              </ul>
            </HighlightBox>

            <CodeBlock
              title="建议的 .gitignore 配置"
              code={`# 建议在项目 .gitignore 中添加
node_modules/
dist/
*.log
.DS_Store
*.pyc
__pycache__/
.cache/
coverage/`}
            />
          </div>
        </Layer>
      </Layer>

      {/* 常见问题与调试 */}
      <Layer title="常见问题与调试技巧" depth={1} defaultOpen={true}>
        <Layer title="问题1: 检查点创建失败" depth={2} defaultOpen={true}>
          <div className="space-y-4">
            <HighlightBox title="诊断步骤" icon="🔧" variant="blue">
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>检查 .gemini/history/ 目录是否存在</li>
                <li>验证 .gemini/history/.git 是否为有效仓库</li>
                <li>检查磁盘空间是否充足</li>
                <li>确认文件权限正确</li>
              </ol>
            </HighlightBox>

            <CodeBlock
              title="手动诊断命令"
              language="bash"
              code={`# 检查影子仓库状态
cd .gemini/history
git status

# 查看提交历史
git log --oneline -10

# 检查仓库完整性
git fsck

# 查看工作树配置
git config --list | grep worktree`}
            />
          </div>
        </Layer>

        <Layer title="问题2: 恢复后文件状态异常" depth={2} defaultOpen={true}>
          <div className="space-y-4">
            <CodeBlock
              title="常见异常及原因"
              code={`// 异常1: 恢复后仍有未跟踪文件
// 原因: .gitignore 规则导致文件未被跟踪
// 解决: 检查 .gitignore 配置

// 异常2: 权限变更未恢复
// 原因: Git 只跟踪 +x 权限，其他权限不保存
// 解决: 手动恢复权限或使用 post-checkout hook

// 异常3: 符号链接行为异常
// 原因: Git 可能将符号链接转为文件
// 解决: 配置 core.symlinks = true`}
            />
          </div>
        </Layer>

        <Layer title="调试环境变量" depth={2} defaultOpen={true}>
          <div className="space-y-4">
            <CodeBlock
              title="调试配置"
              language="bash"
              code={`# 启用 Git 调试输出
export GIT_TRACE=1
export GIT_TRACE_PERFORMANCE=1

# 查看 Git 环境变量
git var -l

# 验证工作树配置
cd /your/project
GIT_DIR=.gemini/history/.git GIT_WORK_TREE=. git status`}
            />
          </div>
        </Layer>
      </Layer>

      {/* 工具执行与检查点时序 */}
      <Layer title="工具执行 → Checkpoint → Undo 完整时序" icon="⏱️">
        <div className="space-y-4">
          <p className="text-gray-300">
            从用户发起工具调用到检查点创建，再到 /undo 恢复的完整调用链：
          </p>

          <MermaidDiagram
            title="完整时序图"
            chart={`
sequenceDiagram
    participant User as 用户
    participant CLI as CLI (React UI)
    participant TS as ToolScheduler
    participant Tool as WriteTool/EditTool
    participant GS as GitService
    participant FS as 文件系统

    Note over User,FS: 阶段1: 工具执行前创建检查点
    User->>CLI: 发送消息 (含代码修改请求)
    CLI->>TS: scheduleToolExecution()
    TS->>GS: createFileSnapshot("Before tool execution")
    GS->>FS: git add . && git commit
    GS-->>TS: checkpointHash_before

    Note over User,FS: 阶段2: 执行工具
    TS->>Tool: execute(params)
    Tool->>FS: 写入/修改文件
    Tool-->>TS: ToolResult

    Note over User,FS: 阶段3: 工具执行后创建检查点
    TS->>GS: createFileSnapshot("After: tool description")
    GS->>FS: git add . && git commit
    GS-->>TS: checkpointHash_after

    TS-->>CLI: 执行结果 + checkpoints
    CLI-->>User: 显示结果

    Note over User,FS: 阶段4: 用户触发 /undo
    User->>CLI: /undo
    CLI->>GS: restoreProjectFromSnapshot(checkpointHash_before)
    GS->>FS: git restore --source=hash .
    GS->>FS: git clean -fd
    GS-->>CLI: 恢复完成
    CLI-->>User: 已撤销到执行前状态
`}
          />

          <HighlightBox title="关键调用点" icon="📍" variant="blue">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-3">时机</th>
                    <th className="text-left py-2 px-3">调用方</th>
                    <th className="text-left py-2 px-3">GitService 方法</th>
                    <th className="text-left py-2 px-3">目的</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3 text-orange-400">工具执行前</td>
                    <td className="py-2 px-3">ToolScheduler</td>
                    <td className="py-2 px-3 font-mono text-cyan-400">createFileSnapshot()</td>
                    <td className="py-2 px-3">保存回滚点</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3 text-green-400">工具执行后</td>
                    <td className="py-2 px-3">ToolScheduler</td>
                    <td className="py-2 px-3 font-mono text-cyan-400">createFileSnapshot()</td>
                    <td className="py-2 px-3">记录变更历史</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-red-400">/undo 触发</td>
                    <td className="py-2 px-3">UndoCommand</td>
                    <td className="py-2 px-3 font-mono text-cyan-400">restoreProjectFromSnapshot()</td>
                    <td className="py-2 px-3">恢复到执行前</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </HighlightBox>

          <CodeBlock
            title="ToolScheduler 中的检查点集成"
            code={`// packages/core/src/services/toolScheduler.ts (概念代码)

async executeToolWithCheckpoint(tool: Tool, params: ToolParams): Promise<ToolResult> {
  // 1. 执行前快照
  const beforeHash = await this.gitService.createFileSnapshot(
    \`Before: \${tool.name}\`
  );

  try {
    // 2. 执行工具
    const result = await tool.execute(params);

    // 3. 执行后快照
    const afterHash = await this.gitService.createFileSnapshot(
      \`After: \${tool.name} - \${params.file_path || 'multiple files'}\`
    );

    // 4. 记录检查点对，供 /undo 使用
    this.checkpointHistory.push({
      before: beforeHash,
      after: afterHash,
      tool: tool.name,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    // 工具执行失败，自动回滚
    await this.gitService.restoreProjectFromSnapshot(beforeHash);
    throw error;
  }
}`}
          />
        </div>
      </Layer>

      {/* 与其他模块的交互 */}
      <Layer title="与其他模块的交互关系" depth={1} defaultOpen={true}>
        <div className="space-y-4">
          <MermaidDiagram
            title="模块依赖关系"
            chart={`
flowchart LR
    subgraph Core["packages/core"]
        GitService["GitService"]
        Storage["Storage"]
        ShellUtils["shell-utils"]
    end

    subgraph CLI["packages/cli"]
        UndoCmd["/undo 命令"]
        SessionMgr["会话管理"]
    end

    subgraph External["外部依赖"]
        SimpleGit["simple-git"]
        NodeFS["node:fs"]
        NodePath["node:path"]
    end

    GitService --> Storage
    GitService --> ShellUtils
    GitService --> SimpleGit
    GitService --> NodeFS
    GitService --> NodePath

    UndoCmd --> GitService
    SessionMgr --> GitService

    style GitService fill:#22d3ee,color:#000
`}
          />

          <HighlightBox title="核心接口" icon="🔌" variant="purple">
            <div className="space-y-4">
              <CodeBlock
                title="GitService 接口定义"
                code={`interface GitServiceInterface {
  // 初始化检查点系统
  initialize(): Promise<void>;

  // 验证 git 是否可用
  verifyGitAvailability(): Promise<boolean>;

  // 获取当前提交哈希
  getCurrentCommitHash(): Promise<string>;

  // 创建文件快照
  createFileSnapshot(message: string): Promise<string>;

  // 恢复到指定快照
  restoreProjectFromSnapshot(commitHash: string): Promise<void>;
}`}
              />
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 相关页面 */}
      <RelatedPages
        pages={[
          { id: 'checkpointing', label: '检查点恢复' },
          { id: 'shadow-git-checkpoint-anim', label: '影子 Git 检查点动画' },
          { id: 'services-arch', label: '服务层架构' },
          { id: 'error', label: '错误处理' },
        ]}
      />
    </div>
  );
}
