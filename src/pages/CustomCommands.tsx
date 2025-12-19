import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function CustomCommands() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">自定义命令系统</h2>

      {/* 概述 */}
      <Layer title="自定义命令概述" icon="✏️">
        <HighlightBox title="什么是自定义命令？" icon="💡" variant="blue">
          <p className="text-sm">
            自定义命令允许你将常用的提示模板保存为斜杠命令。使用 <strong>TOML 格式</strong>定义，
            支持 <code>{'{{args}}'}</code> 参数替换、<code>{'!{...}'}</code> Shell 注入、
            <code>{'@{...}'}</code> 文件注入。
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">🏠 用户级命令</h4>
            <code className="text-xs text-gray-400 block mb-2">~/.innies/commands/</code>
            <p className="text-sm text-gray-300">
              跨所有项目可用的个人命令
            </p>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">📂 项目级命令</h4>
            <code className="text-xs text-gray-400 block mb-2">.innies/commands/</code>
            <p className="text-sm text-gray-300">
              项目特定命令，可提交到版本控制共享给团队
            </p>
          </div>
        </div>

        <HighlightBox title="优先级规则" icon="⚠️" variant="orange">
          <p className="text-sm">
            项目级命令 <strong>覆盖</strong> 同名的用户级命令。
            扩展命令冲突时会重命名为 <code>extensionName.commandName</code>。
          </p>
        </HighlightBox>
      </Layer>

      {/* 命名规则 */}
      <Layer title="命名与命名空间" icon="📛">
        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">~/.innies/commands/test.toml</code>
            <span className="text-gray-400 mx-2">→</span>
            <code className="text-green-400">/test</code>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">.innies/commands/git/commit.toml</code>
            <span className="text-gray-400 mx-2">→</span>
            <code className="text-green-400">/git:commit</code>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <code className="text-cyan-400">.innies/commands/refactor/pure.toml</code>
            <span className="text-gray-400 mx-2">→</span>
            <code className="text-green-400">/refactor:pure</code>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-3">
          子目录作为命名空间，路径分隔符 <code>/</code> 转换为 <code>:</code>
        </p>
      </Layer>

      {/* TOML 格式 */}
      <Layer title="TOML 文件格式" icon="📄">
        <CodeBlock
          title="命令定义 Schema"
          code={`# 必填字段
prompt = """
你的提示模板内容...
"""

# 可选字段
description = "命令描述（显示在 /help 中）"`}
        />

        <CodeBlock
          title="完整示例：git/commit.toml"
          code={`# .innies/commands/git/commit.toml
# 调用方式: /git:commit

description = "根据暂存的更改生成 Git 提交消息"

prompt = """
请根据以下 git diff 生成一个 Conventional Commit 风格的提交消息：

\`\`\`diff
!{git diff --staged}
\`\`\`
"""`}
        />
      </Layer>

      {/* 三大注入机制 */}
      <Layer title="三大注入机制" icon="🔧">
        {/* {{args}} */}
        <div className="mb-6">
          <h4 className="text-lg text-cyan-400 font-bold mb-3">1. {'{{args}}'} — 参数替换</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <h5 className="text-cyan-400 font-bold mb-2">原始替换（prompt 主体）</h5>
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
              <h5 className="text-purple-400 font-bold mb-2">Shell 转义（!{'{...}'} 内部）</h5>
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
          <h4 className="text-lg text-cyan-400 font-bold mb-3">2. !{'{...}'} — Shell 注入</h4>
          <HighlightBox title="执行流程" icon="🔄" variant="green">
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>解析 <code>!{'{command}'}</code> 块（支持嵌套花括号）</li>
              <li>替换 <code>{'{{args}}'}</code> 为转义后的参数</li>
              <li>安全检查：对比 allowlist/blocklist</li>
              <li><strong>非 YOLO 模式：弹出确认对话框</strong></li>
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

          <HighlightBox title="错误处理" icon="⚠️" variant="orange">
            <p className="text-sm">
              如果命令执行失败，输出会包含 stderr 和状态行：
              <code className="block mt-1">[Shell command 'xxx' exited with code 1]</code>
            </p>
          </HighlightBox>
        </div>

        {/* @{...} */}
        <div className="mb-6">
          <h4 className="text-lg text-cyan-400 font-bold mb-3">3. @{'{...}'} — 文件注入</h4>
          <p className="text-sm text-gray-300 mb-3">
            <code>@{'{path}'}</code> 将文件内容或目录列表注入到 prompt。
            处理顺序：<strong>@{'{}'} → !{'{}'} → {'{{args}}'}</strong>
          </p>

          <CodeBlock
            title="示例：代码审查命令"
            code={`# .innies/commands/review.toml

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
      </Layer>

      {/* 处理管线 */}
      <Layer title="Prompt 处理管线" icon="⚙️">
        <div className="bg-black/30 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-4 py-3 text-center">
              <div className="text-sm font-bold text-blue-400">1. AtFileProcessor</div>
              <div className="text-xs text-gray-400">处理 @{'{...}'}</div>
            </div>
            <div className="text-cyan-400 hidden md:block">→</div>
            <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-4 py-3 text-center">
              <div className="text-sm font-bold text-purple-400">2. ShellProcessor</div>
              <div className="text-xs text-gray-400">处理 !{'{...}'} + {'{{args}}'}</div>
            </div>
            <div className="text-cyan-400 hidden md:block">→</div>
            <div className="bg-green-400/20 border border-green-400 rounded-lg px-4 py-3 text-center">
              <div className="text-sm font-bold text-green-400">3. DefaultArgumentProcessor</div>
              <div className="text-xs text-gray-400">追加未使用的 args</div>
            </div>
          </div>
        </div>

        <CodeBlock
          title="处理器选择逻辑"
          code={`// FileCommandLoader.parseAndAdaptFile()

const processors: IPromptProcessor[] = [];

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

      {/* 安全机制 */}
      <Layer title="安全与确认机制" icon="🔐">
        <HighlightBox title="Shell 命令安全检查" icon="🛡️" variant="red">
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Allowlist 检查</strong>: 对比 <code>tools.allowed</code> 配置</li>
            <li><strong>Blocklist 检查</strong>: 匹配 blockedCommands 时拒绝执行</li>
            <li><strong>用户确认</strong>: 非 YOLO 模式下弹出确认对话框</li>
            <li><strong>参数转义</strong>: <code>{'{{args}}'}</code> 在 <code>!{'{}'}</code> 中自动转义</li>
          </ul>
        </HighlightBox>

        <CodeBlock
          title="安全检查流程"
          code={`// ShellProcessor.processString()

const { allAllowed, disallowedCommands, isHardDenial } =
    checkCommandPermissions(command, config, sessionAllowlist);

if (!allAllowed) {
    if (isHardDenial) {
        // 硬拒绝：blocklist 命令
        throw new Error(\`Blocked command: \${command}\`);
    }

    // 非 YOLO 模式需要确认
    if (config.getApprovalMode() !== ApprovalMode.YOLO) {
        throw new ConfirmationRequiredError(
            'Shell command confirmation required',
            disallowedCommands
        );
    }
}`}
        />
      </Layer>

      {/* 花括号平衡 */}
      <Layer title="花括号平衡规则" icon="⚠️">
        <HighlightBox title="解析器限制" icon="📌" variant="orange">
          <p className="text-sm mb-2">
            <code>!{'{...}'}</code> 和 <code>@{'{...}'}</code> 内部的内容必须<strong>花括号平衡</strong>。
          </p>
          <p className="text-sm">
            如果需要执行包含不平衡花括号的命令，请封装到外部脚本中调用。
          </p>
        </HighlightBox>

        <CodeBlock
          title="injectionParser.ts - 花括号计数"
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
      </Layer>

      {/* 信任限制 */}
      <Layer title="工作区信任限制" icon="🔒">
        <HighlightBox title="非信任工作区" icon="⚠️" variant="red">
          <p className="text-sm">
            当 <code>security.folderTrust.enabled: true</code> 且工作区未被信任时，
            <strong>项目级命令不会被加载</strong>。只有用户级命令和扩展命令可用。
          </p>
        </HighlightBox>

        <CodeBlock
          code={`// FileCommandLoader.loadCommands()

if (this.folderTrustEnabled && !this.folderTrust) {
    return [];  // 非信任目录，跳过项目命令
}`}
        />
      </Layer>

      {/* 源码位置 */}
      <Layer title="源码位置" icon="📍">
        <div className="text-sm space-y-2">
          <SourceLink path="packages/cli/src/services/FileCommandLoader.ts" desc="命令加载器" />
          <SourceLink path="packages/cli/src/services/prompt-processors/injectionParser.ts" desc="注入解析器" />
          <SourceLink path="packages/cli/src/services/prompt-processors/shellProcessor.ts" desc="Shell 处理器" />
          <SourceLink path="packages/cli/src/services/prompt-processors/atFileProcessor.ts" desc="文件处理器" />
          <SourceLink path="packages/cli/src/services/prompt-processors/argumentProcessor.ts" desc="参数处理器" />
          <SourceLink path="docs/cli/commands.md#custom-commands" desc="官方文档" />
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
