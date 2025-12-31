import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'slash-cmd', label: '斜杠命令', description: '内置命令系统概览' },
  { id: 'at-cmd', label: '@命令', description: '@{} 文件注入语法详解' },
  { id: 'shell-modes', label: 'Shell模式', description: 'Shell 命令执行安全机制' },
  { id: 'trusted-folders', label: '信任机制', description: '工作区信任与命令加载' },
  { id: 'shell-injection-anim', label: 'Shell注入处理', description: 'Shell 注入安全检查动画' },
  { id: 'injection-parser-anim', label: 'Injection解析器', description: '注入语法解析动画' },
];

export function CustomCommands() {
  // 命令加载流程
  const commandLoadingFlow = `flowchart TD
    start([CLI 启动])
    loader_init[FileCommandLoader 初始化]
    check_trust{工作区是否受信任?}
    load_user[加载用户级命令<br/>~/.gemini/commands/]
    load_project[加载项目级命令<br/>.gemini/commands/]
    skip_project[跳过项目级命令]
    load_ext[加载扩展命令]
    merge[合并命令列表]
    resolve_conflict{命名冲突?}
    rename[重命名为 ext.cmd]
    register[注册到 CommandRegistry]
    ready([命令就绪])

    start --> loader_init
    loader_init --> check_trust
    check_trust -->|security.folderTrust.enabled<br/>+ 已信任| load_user
    check_trust -->|未信任| load_user
    load_user --> load_project
    load_project --> load_ext
    check_trust -->|security.folderTrust.enabled<br/>+ 未信任| skip_project
    skip_project --> load_ext
    load_ext --> merge
    merge --> resolve_conflict
    resolve_conflict -->|有冲突| rename
    resolve_conflict -->|无冲突| register
    rename --> register
    register --> ready

    style start fill:#22d3ee,color:#000
    style ready fill:#22c55e,color:#000
    style check_trust fill:#a855f7,color:#fff
    style resolve_conflict fill:#a855f7,color:#fff
    style skip_project fill:#ef4444,color:#fff
    style load_user fill:#3b82f6,color:#fff
    style load_project fill:#8b5cf6,color:#fff`;

  // Prompt 处理流程
  const promptProcessingFlow = `flowchart TD
    start([用户调用 /custom-cmd args])
    get_template[获取命令的 prompt 模板]
    atfile_check{包含 @&#123;...&#125; ?}
    atfile_proc[AtFileProcessor<br/>读取文件内容注入]
    shell_check{包含 !&#123;...&#125; ?}
    shell_proc[ShellProcessor<br/>执行命令注入]
    args_check{包含 &#123;&#123;args&#125;&#125; ?}
    args_replace[替换 &#123;&#123;args&#125;&#125;<br/>为用户参数]
    default_args[DefaultArgumentProcessor<br/>追加未使用的 args]
    final_prompt[最终 prompt]
    send_ai([发送给 AI 模型])

    start --> get_template
    get_template --> atfile_check
    atfile_check -->|Yes| atfile_proc
    atfile_check -->|No| shell_check
    atfile_proc --> shell_check
    shell_check -->|Yes| shell_proc
    shell_check -->|No| args_check
    shell_proc --> args_check
    args_check -->|Yes| args_replace
    args_check -->|No| default_args
    args_replace --> final_prompt
    default_args --> final_prompt
    final_prompt --> send_ai

    classDef start_node fill:#22d3ee,color:#000
    classDef terminal_node fill:#22c55e,color:#000
    classDef decision_node fill:#a855f7,color:#fff
    classDef processor_node fill:#3b82f6,color:#fff
    classDef shell_node fill:#f59e0b,color:#fff

    class start start_node
    class send_ai terminal_node
    class atfile_check,shell_check,args_check decision_node
    class atfile_proc processor_node
    class shell_proc shell_node`;

  // Shell 注入安全流程
  const shellInjectionSafetyFlow = `flowchart TD
    start([检测到 !&#123;command&#125; ])
    parse[解析命令内容<br/>平衡花括号]
    replace_args[替换 &#123;&#123;args&#125;&#125;<br/>为转义后的参数]
    check_allow[checkCommandPermissions]
    is_blocklist{在 tools.exclude?}
    hard_deny[硬拒绝<br/>抛出错误]
    is_core_wildcard{tools.core 包含<br/>run_shell_command?}
    auto_allow[自动允许]
    is_global_allowlist{在 tools.core<br/>run_shell_command 列表?}
    is_session_allowlist{在 sessionShellAllowlist?}
    is_yolo{YOLO 模式?}
    confirm_dialog[弹出确认对话框]
    user_approve{用户批准?}
    add_session[添加到 sessionShellAllowlist]
    execute[执行 Shell 命令]
    inject([注入输出到 prompt])
    user_cancel[抛出取消错误]

    start --> parse
    parse --> replace_args
    replace_args --> check_allow
    check_allow --> is_blocklist
    is_blocklist -->|Yes| hard_deny
    is_blocklist -->|No| is_core_wildcard
    is_core_wildcard -->|Yes| auto_allow
    is_core_wildcard -->|No| is_global_allowlist
    is_global_allowlist -->|Yes| execute
    is_global_allowlist -->|No| is_session_allowlist
    is_session_allowlist -->|Yes| execute
    is_session_allowlist -->|No| is_yolo
    is_yolo -->|Yes| execute
    is_yolo -->|No| confirm_dialog
    confirm_dialog --> user_approve
    user_approve -->|Yes| add_session
    user_approve -->|No| user_cancel
    auto_allow --> execute
    add_session --> execute
    execute --> inject

    classDef start fill:#22d3ee,color:#000
    classDef success fill:#22c55e,color:#000
    classDef error fill:#ef4444,color:#fff
    classDef decision fill:#a855f7,color:#fff
    classDef warn fill:#f59e0b,color:#fff
    classDef approve fill:#22c55e,color:#fff

    class start start
    class inject success
    class hard_deny,user_cancel error
    class is_blocklist,is_core_wildcard,is_global_allowlist,is_session_allowlist,is_yolo,user_approve decision
    class confirm_dialog warn
    class auto_allow approve`;

  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">自定义命令系统</h2>

      {/* 目标 */}
      <Layer title="目标" icon="🎯">
        <p className="text-gray-300 mb-4">
          自定义命令系统允许用户将常用的 AI 提示模板保存为可重用的斜杠命令，支持参数替换、
          Shell 命令注入和文件内容注入，实现高效的工作流自动化。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="提示模板化" variant="blue">
            <p className="text-sm text-gray-300">
              将重复的 AI 提示保存为 TOML 文件，通过 <code>/命令名</code> 快速调用
            </p>
          </HighlightBox>

          <HighlightBox title="动态内容注入" variant="purple">
            <p className="text-sm text-gray-300">
              支持文件内容注入、Shell 命令输出注入和参数替换
            </p>
          </HighlightBox>

          <HighlightBox title="安全可控" variant="green">
            <p className="text-sm text-gray-300">
              内置 Shell 命令白名单/黑名单机制，防止恶意代码执行
            </p>
          </HighlightBox>
        </div>
      </Layer>

      {/* 输入 */}
      <Layer title="输入" icon="📥">
        <h4 className="text-lg text-cyan-400 font-bold mb-3">触发条件</h4>
        <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1 mb-4">
          <li>用户在 CLI 中输入斜杠命令（如 <code>/test</code>）</li>
          <li>命令文件存在于用户级或项目级命令目录中</li>
          <li>工作区信任状态允许加载项目级命令</li>
        </ul>

        <h4 className="text-lg text-cyan-400 font-bold mb-3">命令文件结构</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h5 className="text-cyan-400 font-bold mb-2">🏠 用户级命令</h5>
            <code className="text-xs text-gray-400 block mb-2">~/.gemini/commands/*.toml</code>
            <p className="text-sm text-gray-300">
              跨所有项目可用的个人命令
            </p>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h5 className="text-purple-400 font-bold mb-2">📂 项目级命令</h5>
            <code className="text-xs text-gray-400 block mb-2">.gemini/commands/*.toml</code>
            <p className="text-sm text-gray-300">
              项目特定命令，可提交到版本控制共享给团队
            </p>
          </div>
        </div>

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-5">TOML 文件格式</h4>
        <CodeBlock
          title="命令定义 Schema"
          code={`# 必填字段
prompt = """
你的提示模板内容...
"""

# 可选字段
description = "命令描述（显示在 /help 中）"`}
        />
      </Layer>

      {/* 输出 */}
      <Layer title="输出" icon="📤">
        <h4 className="text-lg text-cyan-400 font-bold mb-3">处理后的 Prompt</h4>
        <p className="text-sm text-gray-300 mb-3">
          经过处理器链处理后的最终 prompt 文本，所有注入机制已完成替换
        </p>

        <h4 className="text-lg text-cyan-400 font-bold mb-3">状态变化</h4>
        <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
          <li>命令注册到 <code>CommandRegistry</code>，可通过 <code>/help</code> 查看</li>
          <li>Shell 命令执行记录保存到日志</li>
          <li>文件读取操作可能触发缓存更新</li>
        </ul>

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-4">副作用</h4>
        <HighlightBox title="Shell 命令执行" icon="⚠️" variant="orange">
          <p className="text-sm text-gray-300">
            <code>!{'{'} ... {'}'}</code> 注入会在用户确认后执行实际的 Shell 命令，可能修改文件系统或执行其他操作
          </p>
        </HighlightBox>
      </Layer>

      {/* 关键文件与入口 */}
      <Layer title="关键文件与入口" icon="📁">
        <div className="text-sm space-y-2">
          <SourceLink
            path="packages/cli/src/services/FileCommandLoader.ts:145"
            desc="loadCommands() - 命令加载主入口"
          />
          <SourceLink
            path="packages/cli/src/services/FileCommandLoader.ts:245"
            desc="parseAndAdaptFile() - TOML 解析和处理器选择"
          />
          <SourceLink
            path="packages/cli/src/services/prompt-processors/injectionParser.ts:28"
            desc="extractInjections() - 注入语法解析"
          />
          <SourceLink
            path="packages/cli/src/services/prompt-processors/atFileProcessor.ts:41"
            desc="AtFileProcessor.processString() - 文件注入处理"
          />
          <SourceLink
            path="packages/cli/src/services/prompt-processors/shellProcessor.ts:67"
            desc="ShellProcessor.processString() - Shell 注入处理"
          />
          <SourceLink
            path="packages/cli/src/services/prompt-processors/argumentProcessor.ts:12"
            desc="DefaultArgumentProcessor - 参数追加处理"
          />
          <SourceLink
            path="packages/core/src/utils/shell-utils.ts"
            desc="checkCommandPermissions() - Shell 命令安全检查"
          />
        </div>
      </Layer>

      {/* 流程图 */}
      <Layer title="流程图" icon="📊">
        <h4 className="text-lg text-cyan-400 font-bold mb-3">命令加载流程</h4>
        <MermaidDiagram chart={commandLoadingFlow} title="FileCommandLoader 加载流程" />

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-6">Prompt 处理流程</h4>
        <MermaidDiagram chart={promptProcessingFlow} title="处理器链执行顺序" />

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-6">Shell 注入安全流程</h4>
        <MermaidDiagram chart={shellInjectionSafetyFlow} title="ShellProcessor 安全检查" />
      </Layer>

      {/* 关键分支与边界条件 */}
      <Layer title="关键分支与边界条件" icon="⚡">
        <h4 className="text-lg text-cyan-400 font-bold mb-3">命名空间冲突</h4>
        <HighlightBox title="优先级规则" icon="📌" variant="blue">
          <p className="text-sm text-gray-300 mb-2">
            <strong>项目级命令</strong> 覆盖同名的 <strong>用户级命令</strong>
          </p>
          <p className="text-sm text-gray-300">
            扩展命令冲突时会重命名为 <code>extensionName.commandName</code>
          </p>
        </HighlightBox>

        <CodeBlock
          title="命名规则示例"
          code={`# 文件路径 → 命令名称
~/.gemini/commands/test.toml          → /test
.gemini/commands/git/commit.toml      → /git:commit
.gemini/commands/refactor/pure.toml   → /refactor:pure

# 子目录作为命名空间，路径分隔符 / 转换为 :`}
        />

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-5">工作区信任限制</h4>
        <HighlightBox title="非信任工作区" icon="🔒" variant="red">
          <p className="text-sm text-gray-300 mb-2">
            当 <code>security.folderTrust.enabled: true</code> 且工作区未被信任时，
            <strong>项目级命令不会被加载</strong>。
          </p>
          <p className="text-sm text-gray-300">
            只有用户级命令和扩展命令可用。
          </p>
        </HighlightBox>

        <CodeBlock
          code={`// FileCommandLoader.loadCommands() - Line 145
if (this.folderTrustEnabled && !this.folderTrust) {
    return [];  // 非信任目录，跳过项目命令
}`}
          language="typescript"
          title="信任检查代码"
        />

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-5">花括号平衡</h4>
        <HighlightBox title="解析器限制" icon="⚠️" variant="orange">
          <p className="text-sm text-gray-300 mb-2">
            <code>!{'{'} ... {'}'}</code> 和 <code>@{'{'} ... {'}'}</code> 内部的内容必须<strong>花括号平衡</strong>。
          </p>
          <p className="text-sm text-gray-300">
            如果需要执行包含不平衡花括号的命令，请封装到外部脚本中调用。
          </p>
        </HighlightBox>

        <CodeBlock
          title="injectionParser.ts - 花括号计数"
          language="typescript"
          code={`// extractInjections() 核心逻辑
while (currentIndex < prompt.length) {
    const char = prompt[currentIndex];

    if (char === '{') {
        braceCount++;
    } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
            // 找到匹配的闭合花括号
            injections.push({
                content: prompt.substring(startIndex + trigger.length, currentIndex),
                startIndex,
                endIndex: currentIndex + 1
            });
            break;
        }
    }
    currentIndex++;
}

// 未找到闭合花括号 → 抛出错误
if (!foundEnd) {
    throw new Error(\`Unclosed injection at index \${startIndex}\`);
}`}
        />

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-5">处理器选择逻辑</h4>
        <CodeBlock
          title="FileCommandLoader.parseAndAdaptFile() - 处理器链构建"
          language="typescript"
          code={`const processors: IPromptProcessor[] = [];

// 1. 文件注入（安全优先，防止动态生成恶意路径）
if (prompt.includes('@{')) {
    processors.push(new AtFileProcessor(commandName));
}

// 2. Shell 注入 + 参数替换
if (prompt.includes('!{') || prompt.includes('{{args}}')) {
    processors.push(new ShellProcessor(commandName));
}

// 3. 默认参数处理（如果没有 {{args}}）
if (!prompt.includes('{{args}}')) {
    processors.push(new DefaultArgumentProcessor());
}`}
        />
      </Layer>

      {/* 失败与恢复 */}
      <Layer title="失败与恢复" icon="🔧">
        <h4 className="text-lg text-cyan-400 font-bold mb-3">错误处理机制</h4>

        <div className="space-y-4">
          <div>
            <h5 className="text-md text-purple-400 font-semibold mb-2">1. TOML 解析失败</h5>
            <HighlightBox variant="red">
              <p className="text-sm text-gray-300 mb-2">
                <strong>错误场景：</strong>TOML 语法错误、缺少 <code>prompt</code> 字段
              </p>
              <p className="text-sm text-gray-300">
                <strong>恢复策略：</strong>跳过该命令文件，记录警告日志，继续加载其他命令
              </p>
            </HighlightBox>
          </div>

          <div>
            <h5 className="text-md text-purple-400 font-semibold mb-2">2. Shell 命令执行失败</h5>
            <HighlightBox variant="orange">
              <p className="text-sm text-gray-300 mb-2">
                <strong>错误场景：</strong>命令不存在、权限不足、执行超时
              </p>
              <p className="text-sm text-gray-300">
                <strong>恢复策略：</strong>将 stderr 和退出码注入到 prompt，让 AI 处理错误信息
              </p>
            </HighlightBox>
            <CodeBlock
              code={`// Shell 命令失败时的输出格式
[Shell command 'git status' exited with code 128]

stderr:
fatal: not a git repository (or any of the parent directories): .git`}
              title="错误输出示例"
            />
          </div>

          <div>
            <h5 className="text-md text-purple-400 font-semibold mb-2">3. 文件注入失败</h5>
            <HighlightBox variant="yellow">
              <p className="text-sm text-gray-300 mb-2">
                <strong>错误场景：</strong>文件不存在、无读取权限、路径超出工作区
              </p>
              <p className="text-sm text-gray-300">
                <strong>恢复策略：</strong>注入错误消息到 prompt，提示用户检查路径
              </p>
            </HighlightBox>
          </div>

          <div>
            <h5 className="text-md text-purple-400 font-semibold mb-2">4. Blocklist 命令</h5>
            <HighlightBox variant="red">
              <p className="text-sm text-gray-300 mb-2">
                <strong>错误场景：</strong>Shell 命令匹配 <code>tools.exclude</code> 列表
              </p>
              <p className="text-sm text-gray-300">
                <strong>恢复策略：</strong>硬拒绝，抛出错误，阻止命令执行
              </p>
            </HighlightBox>
            <CodeBlock
              code={`// ShellProcessor.processString()
const { allAllowed, disallowedCommands, isHardDenial } =
    checkCommandPermissions(command, config, sessionAllowlist);

if (!allAllowed && isHardDenial) {
    throw new Error(\`Blocked command: \${command}\`);
}`}
              language="typescript"
              title="Blocklist 检查代码"
            />
          </div>

          <div>
            <h5 className="text-md text-purple-400 font-semibold mb-2">5. 用户取消确认</h5>
            <HighlightBox variant="blue">
              <p className="text-sm text-gray-300 mb-2">
                <strong>错误场景：</strong>用户在确认对话框中选择取消
              </p>
              <p className="text-sm text-gray-300">
                <strong>恢复策略：</strong>抛出 <code>ConfirmationRequiredError</code>，中止命令处理
              </p>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 相关配置项 */}
      <Layer title="相关配置项" icon="⚙️">
        <h4 className="text-lg text-cyan-400 font-bold mb-3">Shell 命令权限检查机制</h4>
        <HighlightBox title="权限检查流程" icon="🔒" variant="purple">
          <p className="text-sm text-gray-300 mb-3">
            Shell 命令注入通过三层安全机制保护：<code>tools.exclude</code>（全局阻止列表）、
            <code>tools.core</code>（全局允许列表）、<code>sessionShellAllowlist</code>（会话允许列表）
          </p>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
              <strong className="text-red-400">1. tools.exclude（最高优先级）</strong>
              <p className="mt-1">包含 <code>run_shell_command(pattern)</code> 形式的阻止规则，匹配的命令<strong>硬拒绝</strong>，无法通过确认对话框绕过</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
              <strong className="text-green-400">2. tools.core（全局允许列表）</strong>
              <p className="mt-1">
                包含 <code>run_shell_command</code> 或 <code>run_shell_command(pattern)</code> 形式的允许规则：
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li><code>run_shell_command</code> 通配符：允许所有 Shell 命令（自动通过）</li>
                <li>具体模式：如 <code>run_shell_command(git *)</code> 允许所有 git 命令</li>
              </ul>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
              <strong className="text-cyan-400">3. sessionShellAllowlist（会话允许列表）</strong>
              <p className="mt-1">运行时动态维护，用户通过确认对话框批准的命令会添加到此列表，会话期间无需重复确认</p>
            </div>
          </div>
        </HighlightBox>

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-5">安全配置</h4>
        <CodeBlock
          title="~/.gemini/config.toml"
          code={`# 工作区信任
[security.folderTrust]
enabled = true  # 启用工作区信任检查

# Shell 命令安全
[tools]
# 全局允许列表 (支持通配符和具体命令)
core = [
    "run_shell_command",           # 允许所有 Shell 命令 (通配符)
    "run_shell_command(git *)",    # 允许所有 git 命令
    "run_shell_command(npm test)", # 允许特定命令
    "run_shell_command(ls *)"      # 允许 ls 及其参数
]

# 全局阻止列表 (硬拒绝)
exclude = [
    "run_shell_command(rm -rf *)", # 阻止危险删除
    "run_shell_command(dd *)",     # 阻止磁盘操作
    "run_shell_command(mkfs *)"    # 阻止格式化
]

[approvalMode]
mode = "DEFAULT"  # DEFAULT | YOLO | AUTO_EDIT | PLAN`}
        />

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-5">三大注入机制详解</h4>

        {/* {{args}} */}
        <div className="mb-6">
          <h5 className="text-md text-cyan-400 font-semibold mb-3">1. {'{{args}}'} — 参数替换</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <h6 className="text-cyan-400 font-bold mb-2">原始替换（prompt 主体）</h6>
              <p className="text-sm text-gray-300 mb-2">
                在 prompt 主体中，<code>{'{{args}}'}</code> 被原样替换
              </p>
              <CodeBlock
                code={`prompt = "请修复这个问题: {{args}}"

# /fix "按钮错位"
# → "请修复这个问题: 按钮错位"`}
              />
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h6 className="text-purple-400 font-bold mb-2">Shell 转义（!{'{...}'} 内部）</h6>
              <p className="text-sm text-gray-300 mb-2">
                在 <code>!{'{...}'}</code> 内部，<code>{'{{args}}'}</code> 自动 shell 转义
              </p>
              <CodeBlock
                code={`prompt = """
搜索结果:
!{grep -r {{args}} .}
"""

# /grep "It's complicated"
# → grep -r "It's complicated" .`}
              />
            </div>
          </div>
        </div>

        {/* !{...} */}
        <div className="mb-6">
          <h5 className="text-md text-cyan-400 font-semibold mb-3">2. !{'{...}'} — Shell 注入</h5>
          <HighlightBox title="执行流程" icon="🔄" variant="green">
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>解析 <code>!{'{command}'}</code> 块（支持嵌套花括号）</li>
              <li>替换 <code>{'{{args}}'}</code> 为转义后的参数</li>
              <li>安全检查：检查 <code>tools.exclude</code>（阻止列表）、<code>tools.core</code>（全局允许列表）、<code>sessionShellAllowlist</code>（会话允许列表）</li>
              <li><strong>非 YOLO 模式且未在允许列表：弹出确认对话框，批准后添加到会话允许列表</strong></li>
              <li>执行命令，将输出注入到 prompt</li>
            </ol>
          </HighlightBox>

          <CodeBlock
            title="示例：获取 Git 状态"
            code={`prompt = """
当前 Git 状态:
!{git status --short}

请根据以上状态建议下一步操作。
"""`}
          />
        </div>

        {/* @{...} */}
        <div className="mb-6">
          <h5 className="text-md text-cyan-400 font-semibold mb-3">3. @{'{...}'} — 文件注入</h5>
          <p className="text-sm text-gray-300 mb-3">
            <code>@{'{path}'}</code> 将文件内容或目录列表注入到 prompt。
            处理顺序：<strong>@{'{}'} → !{'{}'} → {'{{args}}'}</strong>
          </p>

          <CodeBlock
            title="示例：代码审查命令"
            code={`# .gemini/commands/review.toml

description = "使用最佳实践指南审查代码"

prompt = """
你是一位专业的代码审查员。

请审查以下内容: {{args}}

请参考这份最佳实践指南:
@{docs/best-practices.md}
"""`}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <code className="text-cyan-400 text-sm">@{'{src/utils.ts}'}</code>
              <p className="text-xs text-gray-400 mt-1">注入单个文件内容</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <code className="text-cyan-400 text-sm">@{'{src/components/}'}</code>
              <p className="text-xs text-gray-400 mt-1">递归注入目录（尊重 .gitignore）</p>
            </div>
          </div>
        </div>

        <h4 className="text-lg text-cyan-400 font-bold mb-3 mt-5">完整示例</h4>
        <CodeBlock
          title=".gemini/commands/git/commit.toml"
          code={`# 调用方式: /git:commit

description = "根据暂存的更改生成 Git 提交消息"

prompt = """
请根据以下 git diff 生成一个 Conventional Commit 风格的提交消息：

\`\`\`diff
!{git diff --staged}
\`\`\`

提交消息格式要求:
@{.gemini/commit-template.md}

额外说明: {{args}}
"""`}
        />
      </Layer>

      {/* 为什么这样设计 */}
      <Layer title="为什么这样设计？" icon="💡">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">为什么用 TOML 而不是 JSON/YAML？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：命令定义文件使用 TOML 格式。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>多行字符串</strong>：TOML 的 <code>"""</code> 语法非常适合长 prompt</li>
                <li><strong>注释友好</strong>：支持 # 注释，方便说明 prompt 用途</li>
                <li><strong>简洁明了</strong>：比 JSON 少引号，比 YAML 少缩进问题</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">为什么需要三层允许列表机制？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：Shell 命令安全使用 blocklist → allowlist → session 三层检查。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>安全优先</strong>：blocklist 最先检查，危险命令一票否决</li>
                <li><strong>灵活配置</strong>：allowlist 允许信任特定命令，减少确认弹窗</li>
                <li><strong>会话缓存</strong>：session 列表避免同一命令反复确认</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">为什么处理器链顺序是 @{} → !{} → args？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：先处理文件注入，再处理 Shell，最后处理参数。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>安全隔离</strong>：文件内容先注入，避免通过 Shell 动态构造恶意路径</li>
                <li><strong>args 在 Shell 中可用</strong>：Shell 命令可以使用 <code>{`{{args}}`}</code>，需要先完成替换</li>
                <li><strong>默认追加</strong>：如果没用 <code>{`{{args}}`}</code>，最后追加到 prompt 末尾</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">为什么项目命令优先于用户命令？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：同名命令时，项目级覆盖用户级。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>项目定制</strong>：团队可能需要覆盖用户的个人习惯</li>
                <li><strong>一致性</strong>：确保团队成员使用相同的命令行为</li>
                <li><strong>版本控制</strong>：项目命令可提交 Git，团队共享和迭代</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="text-red-400 font-bold mb-2">为什么非信任工作区不加载项目命令？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：未信任的工作区只加载用户级命令。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>防止攻击</strong>：恶意仓库可能包含执行危险操作的命令</li>
                <li><strong>显式信任</strong>：用户必须明确信任工作区才能执行其命令</li>
                <li><strong>与 VS Code 一致</strong>：遵循 IDE 的工作区信任安全模型</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}

function SourceLink({ path, desc }: { path: string; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className="bg-black/30 px-2 py-1 rounded text-xs">{path}</code>
      <span className="text-gray-400">{desc}</span>
    </div>
  );
}
