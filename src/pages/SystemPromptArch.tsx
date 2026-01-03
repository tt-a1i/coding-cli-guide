import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 via-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--terminal-green)]/30 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📜</span>
          <div>
            <h3 className="text-lg font-bold text-[var(--terminal-green)]">System Prompt 动态构建机制</h3>
            <p className="text-sm text-gray-400">理解 AI 的"灵魂"是如何根据上下文动态生成的</p>
          </div>
        </div>
        <span className={`text-xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-white/10 mt-2 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4 border border-[var(--terminal-green)]/20">
              <h4 className="font-semibold text-[var(--terminal-green)] mb-2">🎯 核心概念</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>System Prompt</strong>: AI 的行为指令和人格定义</li>
                <li>• <strong>动态注入</strong>: 根据环境实时组装 Prompt 内容</li>
                <li>• <strong>Context Injection</strong>: Git/Sandbox/Memory 上下文</li>
                <li>• <strong>Tool Examples</strong>: 模型特定的工具调用示例</li>
                <li>• <strong>System Reminder</strong>: 运行时状态提醒注入</li>
              </ul>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-[var(--cyber-blue)]/20">
              <h4 className="font-semibold text-[var(--cyber-blue)] mb-2">📁 关键文件</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <code>packages/core/src/core/prompts.ts</code></li>
                <li className="text-xs text-gray-500 ml-4">getCoreSystemPrompt, getCompressionPrompt</li>
                <li>• <code>packages/core/src/tools/tool-names.ts</code></li>
                <li className="text-xs text-gray-500 ml-4">工具名称常量定义</li>
                <li>• <code>.gemini/system.md</code></li>
                <li className="text-xs text-gray-500 ml-4">用户自定义 System Prompt 覆盖</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--purple)]/10 rounded-lg p-4 border border-[var(--purple)]/30">
            <h4 className="font-semibold text-[var(--purple)] mb-2">💡 设计理念</h4>
            <p className="text-sm text-gray-300">
              System Prompt 不是静态文本，而是一个<strong>动态组装的指令集</strong>。
              它根据当前环境（是否在 Git 仓库、是否启用沙箱）、用户记忆（GEMINI.md）、
              以及目标模型（Gemini/Gemini Vision）实时拼接不同的内容块。
              这种设计让同一个 CLI 工具能够适配多种场景，同时保持行为的一致性。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SystemPromptArch() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);
  const relatedPages: RelatedPage[] = [
    { id: 'gemini-chat', label: 'GeminiChatCore', description: 'AI 核心逻辑' },
    { id: 'memory', label: '内存管理', description: '记忆与上下文' },
    { id: 'tool-arch', label: '工具架构', description: '工具调用系统' },
    { id: 'sandbox', label: '沙箱系统', description: '安全执行环境' },
    { id: 'model-configuration', label: '模型配置', description: '模型选择' },
    { id: 'multi-provider', label: '多供应商', description: '适配不同模型' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <Introduction
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
      />

      <Layer title="构建流水线总览 (Pipeline Overview)" icon="🏭">
        <p className="text-gray-300 mb-4">
          <code>getCoreSystemPrompt()</code> 函数负责组装完整的 System Prompt。
          整个流水线按顺序执行以下步骤：
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</div>
            <div className="flex-1 bg-blue-500/10 rounded-lg p-3 border-l-2 border-blue-500">
              <div className="font-semibold text-blue-300">加载基础 Prompt (Base Prompt)</div>
              <p className="text-sm text-gray-400">检查 GEMINI_SYSTEM_MD 环境变量，决定使用默认内置 Prompt 还是从文件加载</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">2</div>
            <div className="flex-1 bg-orange-500/10 rounded-lg p-3 border-l-2 border-orange-500">
              <div className="font-semibold text-orange-300">环境上下文注入 (Environment Injection)</div>
              <p className="text-sm text-gray-400">检测 Sandbox 模式、Git 仓库状态，注入相应的行为指令</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">3</div>
            <div className="flex-1 bg-purple-500/10 rounded-lg p-3 border-l-2 border-purple-500">
              <div className="font-semibold text-purple-300">工具调用示例注入 (Tool Examples)</div>
              <p className="text-sm text-gray-400">根据目标模型选择适配的工具调用格式示例</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">4</div>
            <div className="flex-1 bg-green-500/10 rounded-lg p-3 border-l-2 border-green-500">
              <div className="font-semibold text-green-300">用户记忆追加 (User Memory)</div>
              <p className="text-sm text-gray-400">将 GEMINI.md 中的用户偏好和知识追加到 Prompt 末尾</p>
            </div>
          </div>
        </div>
      </Layer>

      <Layer title="基础 Prompt 加载逻辑" icon="📄">
        <p className="text-gray-300 mb-4">
          系统支持两种 Prompt 来源：内置默认值或用户自定义文件。通过环境变量 <code>GEMINI_SYSTEM_MD</code> 控制：
        </p>

        <CodeBlock
          title="prompts.ts - Base Prompt Loading"
          code={`export function getCoreSystemPrompt(
  config: Config,
  userMemory?: string,
): string {
  // 默认路径：.gemini/system.md
  let systemMdPath = path.resolve(path.join(GEMINI_DIR, 'system.md'));

  // 解析环境变量
  const systemMdResolution = resolvePathFromEnv(process.env['GEMINI_SYSTEM_MD']);

  // GEMINI_SYSTEM_MD 可以是：
  // - "true" / "1"    → 启用，使用默认路径
  // - "/custom/path"  → 启用，使用自定义路径
  // - "false" / "0"   → 禁用，使用内置 Prompt
  if (systemMdResolution.value && !systemMdResolution.isDisabled) {
    systemMdEnabled = true;
    if (!systemMdResolution.isSwitch) {
      systemMdPath = systemMdResolution.value;  // 自定义路径
    }
    // 文件必须存在
    if (!fs.existsSync(systemMdPath)) {
      throw new Error(\`missing system prompt file '\${systemMdPath}'\`);
    }
  }

  const basePrompt = systemMdEnabled
    ? fs.readFileSync(systemMdPath, 'utf8')  // 从文件加载
    : \`You are Gemini CLI, an interactive CLI agent...\`;  // 内置默认
}`}
        />

        <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-gray-300">
          <strong className="text-amber-400">补充：</strong>本页默认以 <code>gemini-cli</code> 上游实现为准（<code>GEMINI_*</code> 环境变量）。
          若你阅读的是 Innies/Qwen fork，可能会看到以 <code>QWEN_*</code> 为前缀的同类开关，语义相同但命名不同。
        </div>

        <HighlightBox title="设计考量" icon="🎯" variant="blue">
          <p className="text-sm text-gray-300">
            <strong>为什么支持自定义 System Prompt？</strong><br/>
            不同团队可能有特定的代码规范、安全要求或工作流程。
            通过 <code>.gemini/system.md</code> 文件，团队可以定制 AI 的行为，
            比如强制要求某种注释风格、禁止使用某些命令等。
            这个文件可以提交到 Git 仓库，让整个团队共享相同的 AI 行为配置。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="内置 Base Prompt 结构" icon="📋">
        <p className="text-gray-300 mb-4">
          内置的默认 System Prompt 包含以下核心部分：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-cyan-400 mb-2">🎭 身份定义</h4>
            <div className="text-sm text-gray-300 font-mono bg-black/30 p-2 rounded">
              "You are Gemini CLI, an interactive CLI agent developed by Google, specializing in software engineering tasks..."
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-yellow-400 mb-2">📜 Core Mandates</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 遵循项目现有代码规范</li>
              <li>• 验证库/框架的使用是否合理</li>
              <li>• 模仿现有代码风格和结构</li>
              <li>• 注释只说"为什么"不说"什么"</li>
              <li>• 使用绝对路径访问文件</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-green-400 mb-2">✅ Task Management</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 强制使用 write_todos 工具</li>
              <li>• 计划阶段分解任务</li>
              <li>• 完成即标记 completed</li>
              <li>• 防止 AI "迷路"</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-purple-400 mb-2">🔧 Primary Workflows</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Plan → Implement → Adapt → Verify</li>
              <li>• 软件工程任务流程</li>
              <li>• 新应用开发流程</li>
              <li>• 测试和验证规范</li>
            </ul>
          </div>
        </div>

        <CodeBlock
          title="Base Prompt 核心片段"
          code={`# Core Mandates

- **Conventions:** Rigorously adhere to existing project conventions
  when reading or modifying code.
- **Libraries/Frameworks:** NEVER assume a library/framework is available.
  Verify its established usage within the project first.
- **Path Construction:** Always use absolute paths with file system tools.
- **Do Not revert changes:** Do not revert changes unless asked.

# Task Management
You have access to the write_todos tool. Use these tools VERY frequently.
If you do not use this tool when planning, you may forget important
tasks - and that is unacceptable.

# Operational Guidelines
## Tone and Style (CLI Interaction)
- **Concise & Direct:** Professional, direct, and concise tone.
- **Minimal Output:** Aim for fewer than 3 lines of text output.
- **No Chitchat:** Avoid conversational filler, preambles.`}
        />
      </Layer>

      <Layer title="环境上下文注入 (Dynamic Injections)" icon="🌍">
        <p className="text-gray-300 mb-4">
          根据运行时环境，动态注入不同的指令块。这些是通过 IIFE (立即执行函数) 实现的：
        </p>

        <div className="space-y-4">
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-orange-400 mb-2">🛡️ Sandbox 模式检测</h4>
            <CodeBlock
              title="Sandbox Injection Logic"
              code={`\${(function () {
  const isSandboxExec = process.env['SANDBOX'] === 'sandbox-exec';
  const isGenericSandbox = !!process.env['SANDBOX'];

  if (isSandboxExec) {
    return \`
# macOS Seatbelt
You are running under macos seatbelt with limited access to files
outside the project directory or system temp directory...
\`;
  } else if (isGenericSandbox) {
    return \`
# Sandbox
You are running in a sandbox container with limited access...
\`;
  } else {
    return \`
# Outside of Sandbox
You are running outside of a sandbox container, directly on the
user's system. For critical commands, remind the user to consider
enabling sandboxing.
\`;
  }
})()}`}
            />
            <p className="text-sm text-gray-400 mt-2">
              <strong>三种模式</strong>: macOS Seatbelt (sandbox-exec)、Docker/Podman 容器、无沙箱直接运行
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">📁 Git 仓库检测</h4>
            <CodeBlock
              title="Git Repository Injection"
              code={`\${(function () {
  if (isGitRepository(process.cwd())) {
    return \`
# Git Repository
- The current working directory is being managed by a git repository.
- When asked to commit changes:
  - \\\`git status\\\` to check file states
  - \\\`git diff HEAD\\\` to review all changes
  - \\\`git log -n 3\\\` to match commit message style
- Always propose a draft commit message.
- Never push changes without explicit user request.
\`;
  }
  return '';
})()}`}
            />
            <p className="text-sm text-gray-400 mt-2">
              <strong>注入条件</strong>: 使用 <code>isGitRepository()</code> 检测 .git 目录是否存在
            </p>
          </div>
        </div>

        <HighlightBox title="为什么使用动态注入？" icon="💡" variant="purple">
          <p className="text-sm text-gray-300">
            <strong>Token 优化</strong>: 如果不在 Git 仓库中，就没必要让 AI 知道 Git 相关指令。
            动态注入避免了发送无关内容，节省了 Token 消耗。<br/><br/>
            <strong>上下文相关性</strong>: AI 接收到的指令与当前环境完全匹配，减少了误解和错误行为的可能性。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="模型特定工具调用示例" icon="🔧">
        <p className="text-gray-300 mb-4">
          不同模型使用不同的工具调用格式。通过 <code>getToolCallExamples(model)</code> 函数选择适配的示例：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/30">
            <h4 className="font-semibold text-cyan-400 mb-2">General (OpenAI 兼容)</h4>
            <div className="text-xs font-mono bg-black/40 p-2 rounded text-gray-300">
              [tool_call: Bash for 'npm run build']
            </div>
            <p className="text-xs text-gray-500 mt-2">适用于大多数模型</p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/30">
            <h4 className="font-semibold text-green-400 mb-2">Gemini 格式</h4>
            <div className="text-xs font-mono bg-black/40 p-2 rounded text-gray-300">
              {'<tool_call>'}<br/>
              {'<function=Bash>'}<br/>
              {'<parameter=command>'}<br/>
              npm run build<br/>
              {'</parameter>'}<br/>
              {'</function>'}<br/>
              {'</tool_call>'}
            </div>
            <p className="text-xs text-gray-500 mt-2">匹配 /gemini.*-coder/i</p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/30">
            <h4 className="font-semibold text-purple-400 mb-2">Gemini Vision 格式</h4>
            <div className="text-xs font-mono bg-black/40 p-2 rounded text-gray-300">
              {'<tool_call>'}<br/>
              {'{"name": "Bash", "arguments": {"command": "npm run build"}}'}<br/>
              {'</tool_call>'}
            </div>
            <p className="text-xs text-gray-500 mt-2">匹配 /gemini.*-vl/i</p>
          </div>
        </div>

        <CodeBlock
          title="getToolCallExamples() - Model Detection"
          code={`function getToolCallExamples(model?: string): string {
  // 1. 先检查环境变量覆盖
  const toolCallStyle = process.env['QWEN_CODE_TOOL_CALL_STYLE'];
  if (toolCallStyle) {
    switch (toolCallStyle.toLowerCase()) {
      case 'gemini-1.5-flash': return geminiCoderToolCallExamples;
      case 'gemini-vision':    return geminiVisionToolCallExamples;
      case 'general':    return generalToolCallExamples;
    }
  }

  // 2. 基于模型名称的正则匹配
  if (model && model.length < 100) {
    // gemini-1.5-coder, gemini-1.0-coder, etc.
    if (/gemini[^-]*-coder/i.test(model)) {
      return geminiCoderToolCallExamples;
    }
    // gemini-vision, gemini-1.0-vl, gemini-1.5-vl, etc.
    if (/gemini[^-]*-vl/i.test(model)) {
      return geminiVisionToolCallExamples;
    }
  }

  return generalToolCallExamples;
}`}
        />

        <HighlightBox title="环境变量覆盖" icon="⚙️" variant="orange">
          <p className="text-sm text-gray-300">
            <strong>注意：</strong>这一段属于 Innies/Qwen 的多厂商兼容层（通过 prompt 注入 tool-call examples）。
            上游 <code>gemini-cli</code> 主要依赖 API 级别的 tools schema + <code>functionCall/functionResponse</code>，不需要此环境变量。
            如需兼容层行为，可通过 <code>QWEN_CODE_TOOL_CALL_STYLE</code> 强制指定示例格式（用于调试/自定义模型）。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="用户记忆注入 (User Memory)" icon="🧠">
        <p className="text-gray-300 mb-4">
          用户记忆（来自 GEMINI.md 文件）会被追加到 System Prompt 的末尾：
        </p>

        <CodeBlock
          title="Memory Injection"
          code={`// 在 getCoreSystemPrompt 函数末尾
const memorySuffix =
  userMemory && userMemory.trim().length > 0
    ? \`\\n\\n---\\n\\n\${userMemory.trim()}\`
    : '';

return \`\${basePrompt}\${memorySuffix}\`;

// 最终格式：
// [Base Prompt Content]
// ---
// [User Memory from GEMINI.md]`}
        />

        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-purple-400 mb-2">📝 GEMINI.md 示例内容</h4>
          <div className="text-sm font-mono bg-black/30 p-3 rounded text-gray-300">
            <div className="text-purple-300"># 用户偏好</div>
            - 使用 TypeScript 而非 JavaScript<br/>
            - 使用 pnpm 作为包管理器<br/>
            - 偏好函数式编程风格<br/>
            <br/>
            <div className="text-purple-300"># 项目规范</div>
            - 所有组件使用 React Hooks<br/>
            - 测试文件使用 .test.tsx 后缀<br/>
            - 提交信息使用 Conventional Commits
          </div>
        </div>
      </Layer>

      <Layer title="运行时上下文注入" icon="⚡">
        <p className="text-gray-300 mb-4">
          除了初始的 System Prompt，在运行过程中还会动态注入上下文信息：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-400 mb-2">🌍 环境上下文</h4>
            <p className="text-xs text-gray-400 mb-2">会话开始时注入的环境信息：</p>
            <CodeBlock
              title="getEnvironmentContext()"
              code={`This is the Gemini CLI. Setting up context...
Today's date is Monday, January 6, 2025
My operating system is: darwin
The project's temp directory is: /tmp/...
I'm currently working in: /Users/dev/project

Here is the folder structure:
📁 src/
  📄 index.ts
  📁 components/
    📄 App.tsx`}
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">🤖 Agent 目录上下文</h4>
            <p className="text-xs text-gray-400 mb-2">当有可用的专业代理时注入系统提示：</p>
            <CodeBlock
              title="registry.getDirectoryContext()"
              code={`## Available Sub-Agents
Use \`delegate_to_agent\` for complex tasks
requiring specialized analysis.

- **codebase_investigator**: Explore codebase
- **introspection_agent**: Self-analysis
- **custom_agent**: Your custom agent`}
            />
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2">🧩 Agent Skills</h4>
            <p className="text-xs text-gray-400 mb-2">当启用 skills 且存在可用技能时注入：</p>
            <CodeBlock
              title="Available Agent Skills (prompts.ts)"
              code={`# Available Agent Skills
You have access to the following specialized skills...
To activate a skill, call \`activate_skill\` with the skill's name.

<available_skills>
  <skill>...</skill>
</available_skills>

- Skill Guidance: treat <INSTRUCTIONS> as expert rules`}
            />
          </div>
        </div>

        <HighlightBox title="静态 vs 动态上下文" icon="📌" variant="blue">
          <p className="text-sm text-gray-300">
            <strong>System Prompt</strong> 在会话开始时设置，定义 AI 的基本人格和规则。<br/>
            <strong>Environment Context</strong> 在初始历史中注入，包含日期、平台、工作目录等环境信息。<br/>
            <strong>Agent Directory</strong> 通过 <code>registry.getDirectoryContext()</code> 动态生成可用代理列表。<br/>
            <strong>Agent Skills</strong> 则列出可激活的技能元信息；激活后会把技能指令以 <code>&lt;ACTIVATED_SKILL&gt;</code> 注入到上下文中。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="历史压缩 Prompt" icon="📦">
        <p className="text-gray-300 mb-4">
          当对话历史过长时，系统会使用专门的 Prompt 来压缩历史。
          <code>getCompressionPrompt()</code> 定义了压缩输出的结构：
        </p>

        <CodeBlock
          title="getCompressionPrompt() - State Snapshot Structure"
          code={`<state_snapshot>
    <overall_goal>
        <!-- 用户的高层目标，一句话总结 -->
        例: "Refactor the authentication service to use JWT"
    </overall_goal>

    <key_knowledge>
        <!-- 关键事实、约定、约束 -->
        - Build Command: \`npm run build\`
        - Testing: \`npm test\`, test files end in \`.test.ts\`
        - API Endpoint: https://api.example.com/v2
    </key_knowledge>

    <file_system_state>
        <!-- 文件操作记录 -->
        - CWD: \`/home/user/project/src\`
        - READ: \`package.json\` - Confirmed 'axios' dependency
        - MODIFIED: \`services/auth.ts\` - Replaced JWT library
        - CREATED: \`tests/new-feature.test.ts\`
    </file_system_state>

    <recent_actions>
        <!-- 最近的重要操作及结果 -->
        - Ran \`grep 'old_function'\` → 3 results in 2 files
        - Ran \`npm run test\` → failed snapshot mismatch
    </recent_actions>

    <current_plan>
        <!-- 当前计划和进度 -->
        1. [DONE] Identify deprecated API files
        2. [IN PROGRESS] Refactor UserProfile.tsx
        3. [PENDING] Update remaining 2 files
        4. [PENDING] Run test suite
    </current_plan>
</state_snapshot>`}
        />

        <HighlightBox title="为什么需要结构化压缩？" icon="💡" variant="green">
          <p className="text-sm text-gray-300">
            AI 需要在有限的上下文窗口中保持对整个会话的理解。
            结构化的 XML 格式确保：<br/>
            • <strong>信息密度</strong>: 移除闲聊，保留关键事实<br/>
            • <strong>可恢复性</strong>: AI 可以从快照中恢复工作状态<br/>
            • <strong>优先级</strong>: 最近的操作和当前计划位于明显位置
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="完整流程图" icon="🔄">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="font-mono text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">getCoreSystemPrompt(config, userMemory)</span>
            </div>
            <div className="pl-4 text-gray-400">│</div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-yellow-400">├──</span>
              <span className="text-gray-300">检查 GEMINI_SYSTEM_MD 环境变量</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-yellow-400">│   ├──</span>
              <span className="text-gray-500">true/path → 从文件加载 basePrompt</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-yellow-400">│   └──</span>
              <span className="text-gray-500">false/undefined → 使用内置默认</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-orange-400">├──</span>
              <span className="text-gray-300">basePrompt 内部包含动态 IIFE:</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-orange-400">│   ├──</span>
              <span className="text-gray-500">Sandbox 检测注入</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-orange-400">│   ├──</span>
              <span className="text-gray-500">Git 仓库检测注入</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-orange-400">│   └──</span>
              <span className="text-gray-500">getToolCallExamples(model) 注入</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-green-400">├──</span>
              <span className="text-gray-300">可选: 写入 GEMINI_WRITE_SYSTEM_MD</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-purple-400">├──</span>
              <span className="text-gray-300">追加 userMemory (GEMINI.md)</span>
            </div>
            <div className="pl-4 flex items-center gap-2">
              <span className="text-cyan-400">└──</span>
              <span className="text-gray-300">返回完整 System Prompt</span>
            </div>
          </div>
        </div>
      </Layer>

      <Layer title="设计总结与关键要点" icon="📝">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 rounded-lg p-4 border border-blue-500/30">
            <h4 className="font-semibold text-blue-400 mb-3">🎯 设计原则</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span><strong>动态组装</strong>: 根据环境实时生成，而非静态模板</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span><strong>Token 效率</strong>: 只注入相关内容，避免浪费</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span><strong>可扩展性</strong>: 支持用户自定义覆盖</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span><strong>模型适配</strong>: 不同模型使用不同格式</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-lg p-4 border border-purple-500/30">
            <h4 className="font-semibold text-purple-400 mb-3">🔑 关键环境变量</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <code className="text-purple-400">GEMINI_SYSTEM_MD</code>
                <span>自定义 System Prompt 文件路径</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="text-purple-400">GEMINI_WRITE_SYSTEM_MD</code>
                <span>导出当前 Prompt 到文件</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="text-purple-400">GEMINI_PROMPT_*</code>
                <span>按段开关 Prompt 片段（可选）</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="text-purple-400">SANDBOX</code>
                <span>沙箱模式指示器</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-[var(--terminal-green)]/10 rounded-lg border border-[var(--terminal-green)]/30">
          <p className="text-sm text-gray-300">
            <span className="text-[var(--terminal-green)] font-bold">💡 实践提示</span>:
            调试 System Prompt 时，可以设置 <code>GEMINI_WRITE_SYSTEM_MD=./debug-prompt.md</code>，
            这会将完整的 System Prompt 写入文件，方便检查最终生成的内容。
          </p>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
