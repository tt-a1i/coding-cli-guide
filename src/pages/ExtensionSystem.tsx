import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';




export function ExtensionSystem() {
 const extensionFlow = `flowchart TD
 start["CLI 启动"]
 scan["扫描 <home>/.gemini/extensions/*"]
 meta["读取 .gemini-extension-install.json（可选）"]
 resolve["link 安装 → effectiveExtensionPath"]
 load["读取 gemini-extension.json"]
 hydrate["变量替换<br/>\${extensionPath} / \${workspacePath} / \${/}"]
 env["读取扩展 .env + settings（可选）"]
 assemble["构建 GeminiCLIExtension"]
 enabled{"workspace 作用域是否启用？<br/>extension-enablement.json / -e overrides"}
 inactive["isActive=false<br/>仅记录元信息"]
 active["isActive=true<br/>maybeStartExtension()"]
 done["扩展列表就绪"]

 start --> scan --> meta --> resolve --> load --> hydrate --> env --> assemble --> enabled
 enabled -->|No| inactive --> done
 enabled -->|Yes| active --> done

 style start fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style active fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style inactive fill:${getThemeColor("--mermaid-muted-fill", "#f4f4f2")},color:${getThemeColor("--color-text", "#1c1917")}
 style enabled fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const extensionLifecycleFlow = `stateDiagram-v2
 [*] --> Installed: install / link
 Installed --> Loaded: CLI startup (loadExtensions)

 Loaded --> Active: enabled for workspace
 Loaded --> Inactive: disabled for workspace

 Active --> Inactive: extensions disable
 Inactive --> Active: extensions enable

 Active --> Updated: extensions update
 Updated --> Loaded: restart / reload

 Loaded --> [*]: CLI exit`;

 const extensionManifestCode = `// 扩展清单文件
// gemini-extension.json

{
  "name": "my-first-extension",
  "version": "1.0.0",

  // 1) MCP Servers：通过 MCP 暴露新工具（进程在 CLI 外部运行）
  "mcpServers": {
  "nodeServer": {
  "command": "node",
  "args": ["\${extensionPath}\${/}dist\${/}example.js"],
  "cwd": "\${extensionPath}"
  }
  },

  // 2) Context：扩展可携带一个或多个 context 文件（默认会尝试 GEMINI.md）
  "contextFileName": ["GEMINI.md"],

  // 3) Exclude Tools：限制模型可用的核心工具（支持 run_shell_command(...) 形式的细粒度限制）
  "excludeTools": ["run_shell_command", "run_shell_command(rm -rf)"],

  // 4) Settings：声明需要的环境变量；CLI 会提示用户填写并写入扩展目录的 .env
  "settings": [
  {
  "name": "my-first-extension.apiKey",
  "description": "API key for this extension",
  "envVar": "MY_FIRST_EXTENSION_API_KEY",
  "sensitive": true
  }
  ]
}`;

 const extensionTypesCode = `// packages/cli/src/config/extension.ts
export interface ExtensionConfig {
  name: string;
  version: string;
  mcpServers?: Record<string, MCPServerConfig>;
  contextFileName?: string | string[];
  excludeTools?: string[];
  settings?: ExtensionSetting[];
}

// packages/core/src/config/config.ts
export interface GeminiCLIExtension {
  name: string;
  version: string;
  isActive: boolean;
  path: string;
  id: string;

  mcpServers?: Record<string, MCPServerConfig>;
  contextFiles: string[];
  excludeTools?: string[];

  hooks?: { [K in HookEventName]?: HookDefinition[] };
  skills?: SkillDefinition[];

  settings?: ExtensionSetting[];
  resolvedSettings?: ResolvedExtensionSetting[];
}`;

 const extensionLoadingCode = `// packages/cli/src/config/extension-manager.ts（节选）

// 1) 读取并 hydrate gemini-extension.json（支持 \${extensionPath}/\${workspacePath} 等变量）
const configFilePath = path.join(extensionDir, 'gemini-extension.json');
const rawConfig = JSON.parse(await fs.promises.readFile(configFilePath, 'utf-8'));
const config = recursivelyHydrateStrings(rawConfig, {
  extensionPath: extensionDir,
  workspacePath: this.workspaceDir,
  '/': path.sep,
  pathSeparator: path.sep,
});

// 2) 加载可选能力：context / hooks / skills
const contextFiles = getContextFileNames(config)
  .map((name) => path.join(effectiveExtensionPath, name))
  .filter((p) => fs.existsSync(p));

const hooks = this.settings.tools?.enableHooks
  ? await this.loadExtensionHooks(effectiveExtensionPath, { extensionPath: effectiveExtensionPath, workspacePath: this.workspaceDir })
  : undefined;

const skills = await loadSkillsFromDir(path.join(effectiveExtensionPath, 'skills'));

// 3) 构建 GeminiCLIExtension 并按 enablement 决定 isActive
const extension: GeminiCLIExtension = {
  name: config.name,
  version: config.version,
  path: effectiveExtensionPath,
  contextFiles,
  mcpServers: config.mcpServers,
  excludeTools: config.excludeTools,
  hooks,
  skills,
  isActive: this.extensionEnablementManager.isEnabled(config.name, this.workspaceDir),
  id: getExtensionId(config, installMetadata),
};

await this.maybeStartExtension(extension);`;

 const extensionEnablementCode = `// ~/.gemini/extensions/extension-enablement.json（示例）
{
  "my-first-extension": {
  "overrides": [
  "!/Users/me/work/secret-project/*",
  "/Users/me/work/*"
  ]
  }
}

// packages/cli/src/config/extensions/extensionEnablement.ts（节选）
// 最后一个匹配规则生效；默认 enabled=true
isEnabled(extensionName: string, currentPath: string): boolean {
  const config = this.readConfig();
  const overrides = config[extensionName]?.overrides ?? [];
  let enabled = true;
  for (const rule of overrides) {
  const override = Override.fromFileRule(rule);
  if (override.matchesPath(ensureLeadingAndTrailingSlash(currentPath))) {
  enabled = !override.isDisable;
  }
  }
  return enabled;
}`;

 const mcpServerConfigCode = `// MCP 服务器配置来自 settings.json 的 mcpServers（以及扩展的 gemini-extension.json）

// ~/.gemini/settings.json（节选）
{
  "mcp": {
  "allowed": ["my-trusted-server"],
  "excluded": ["experimental-server"]
  },
  "mcpServers": {
  "my-trusted-server": {
  "command": "node",
  "args": ["./mcp-server.js"],
  "cwd": "/path/to/server"
  },
  "remote-sse": {
  "url": "https://example.com/sse",
  "type": "sse"
  }
  }
}`;

 const cliCommandsCode = `# 扩展管理（非交互命令行）

# 列表 / 详情（需要重启 CLI 会话生效）
gemini extensions list
gemini extensions info <name>

# 安装（GitHub URL 或本地目录）
gemini extensions install <source> [--ref <ref>] [--au[--pre-release] [--consent]
gemini extensions uninstall <name...>

# 更新
gemini extensions update <name>
gemini extensions update --all

# 启用/禁用（scope=user|workspace）
gemini extensions disable <name> [--scope <scope>]
gemini extensions enable <name> [--scope <scope>]

# 创建模板工程（context / custom-commands / exclude-tools / mcp-server）
gemini extensions new <path> [template]

# 本地开发：link（省去频繁 update）
gemini extensions link <path>

# 交互模式内仅支持查看：
/extensions list`;

 const consentCode = `// 安全披露 / Consent（安装或更新扩展时显示）
// packages/cli/src/config/extensions/consent.ts（节选）

export const INSTALL_WARNING_MESSAGE = chalk.yellow(
  'The extension you are about to install may have been created by a third-party developer...'
);

export const SKILLS_WARNING_MESSAGE = chalk.yellow(
  "Agent skills inject specialized instructions and domain-specific knowledge into the agent's system prompt..."
);

async function extensionConsentString(extensionConfig, hasHooks, skills = []) {
  output.push(\`Installing extension "\${extensionConfig.name}".\`);
  output.push(INSTALL_WARNING_MESSAGE);

  if (hasHooks) {
  output.push('⚠️ This extension contains Hooks which can automatically execute commands.');
  }

  if (skills.length > 0) {
  output.push('Agent Skills:');
  output.push(SKILLS_WARNING_MESSAGE);
  for (const skill of skills) {
  output.push(\` * \${skill.name}: \${skill.description}\`);
  output.push(\` (Location: \${skill.location})\`);
  }
  }
}`;

 return (
 <div className="space-y-8">
 {/* 概述 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">扩展系统</h2>
 <p className="text-body mb-4">
 Gemini CLI 的扩展本质是<strong>一组可安装的“配置 + 资源”</strong>：通过
 <code className="text-heading"> gemini-extension.json</code> 声明 MCP servers、context、excludeTools、settings，
 并可携带 commands / hooks / skills 等目录，让 CLI 在启动时发现并加载这些能力。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <HighlightBox title="Custom Commands" color="blue">
 <p className="text-sm">扩展内的 commands/*.toml</p>
 <code className="text-xs text-heading">/group:cmd</code>
 </HighlightBox>

 <HighlightBox title="MCP Tools" color="green">
 <p className="text-sm">通过 MCP server 暴露工具</p>
 <code className="text-xs text-heading">mcpServers</code>
 </HighlightBox>

 <HighlightBox title="Context Files" color="yellow">
 <p className="text-sm">注入扩展上下文</p>
 <code className="text-xs text-heading">GEMINI.md</code>
 </HighlightBox>

 <HighlightBox title="Governance" color="purple">
 <p className="text-sm">excludeTools / hooks / skills</p>
 <code className="text-xs text-heading">consent</code>
 </HighlightBox>
 </div>
 </section>

 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">安全披露（Consent）</h3>
 <p className="text-body mb-4">
 Gemini CLI 会在安装/更新扩展时展示“将要启用的能力清单”，并要求用户确认继续：包括 MCP servers、Hooks（可能自动执行命令）、以及 Agent
 skills（会把指令注入 system prompt）。这一步的目标是让用户在扩展生效前完成安全审阅。
 </p>
 <CodeBlock title="Consent 文本生成（节选）" language="typescript" code={consentCode} />
 </section>

 {/* 加载流程 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">扩展加载流程</h3>
 <MermaidDiagram chart={extensionFlow} title="扩展加载流程" />
 </section>

 {/* 扩展清单 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">扩展清单 (gemini-extension.json)</h3>
 <CodeBlock code={extensionManifestCode} language="json" title="扩展配置文件" />
 </section>

 {/* 扩展模型 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">扩展模型：ExtensionConfig → GeminiCLIExtension</h3>
 <CodeBlock code={extensionTypesCode} language="typescript" title="核心类型（节选）" />

 <HighlightBox title="关键点" color="blue" className="mt-4">
 <ul className="text-sm space-y-1">
 <li>扩展不是“在 CLI 进程里运行的插件代码”，而是<strong>声明式配置</strong> + 外部进程（MCP server）</li>
 <li>安装目录固定在 <code>~/.gemini/extensions/&lt;name&gt;</code>，启动时扫描加载</li>
 <li>作用域启用/禁用由 <code>extension-enablement.json</code> 按路径规则控制</li>
 </ul>
 </HighlightBox>
 </section>

 {/* 加载实现 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">加载实现（ExtensionManager）</h3>
 <CodeBlock code={extensionLoadingCode} language="typescript" title="loadExtension / loadExtensionConfig（节选）" />
 </section>

 {/* MCP 服务器配置 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">MCP 服务器配置</h3>
 <CodeBlock code={mcpServerConfigCode} language="json" title="settings.json（节选）" />
 </section>

 {/* Enablement */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">启用/禁用（按路径的 Enablement）</h3>
 <CodeBlock code={extensionEnablementCode} language="typescript" title="extension-enablement.json + isEnabled（节选）" />
 </section>

 {/* CLI 命令 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">扩展管理命令</h3>
 <CodeBlock code={cliCommandsCode} language="bash" title="gemini extensions" />
 </section>

 {/* 扩展目录结构 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">扩展目录结构</h3>
 <div className="bg-surface rounded-lg p-4">
 <pre className="text-sm text-body">
{`~/.gemini/
├── settings.json
├── extensions/
│ ├── extension-enablement.json # 启用/禁用规则（按路径）
│ └── my-first-extension/
│ ├── gemini-extension.json # 扩展清单
│ ├── .gemini-extension-install.json # 安装来源/类型（git/local/link/github-release，可选）
│ ├── .env # 扩展 settings 对应的 env（可选）
│ ├── GEMINI.md # 扩展 context（可选；未配置时也会尝试默认文件名）
│ ├── commands/ # 扩展 custom commands（可选）
│ │ └── fs/
│ │ └── grep-code.toml
│ ├── hooks/ # 扩展 hooks（可选，需 enableHooks）
│ │ └── hooks.json
│ ├── skills/ # 扩展 skills（可选，需 experimental.skills）
│ │ └── my-skill/
│ │ └── SKILL.md
│ └── dist/ # MCP server 构建产物（如果扩展包含 server 代码）
└── policies/
 └── ...`}
 </pre>
 </div>
 </section>

 {/* 架构图 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">扩展系统架构</h3>
 <div className="bg-surface rounded-lg p-6">
 <pre className="text-sm text-body overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────────┐
│ Gemini CLI (process) │
│ │
│ ┌──────────────────────── ExtensionManager ───────────────────┐ │
│ │ scan ~/.gemini/extensions/* │ │
│ │ load gemini-extension.json (+ hooks/skills/.env) │ │
│ │ apply enablement rules → GeminiCLIExtension{isActive,...} │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌───────────────────────────── Config ──────────────────────────┐ │
│ │ extensions[] (active/inactive) │ │
│ └───────────────────────────────────────────────────────────────┘ │
│ │ │ │ │ │
│ │ │ │ │ │
│ ▼ ▼ ▼ ▼ │
│ FileCommandLoader Prompt Builder HookSystem McpClientManager
│ - user commands - ext.contextFiles - ext.hooks - startExtension(ext)
│ - project cmds - merged w/ user - policy mediated - connect/discover tools
│ - ext.path/commands (MessageBus) - register tools/resources
│ │
│ SkillManager (experimental.skills): ext.skills → system prompt │
└──────────────────────────────────────────────────────────────────┘`}
 </pre>
 </div>
 </section>

 {/* 开发扩展 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">开发自己的扩展</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated/20 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">开发步骤</h4>
 <ol className="text-sm text-body space-y-1 list-decimal list-inside">
 <li>生成模板：<code>gemini extensions new my-ext mcp-server</code></li>
 <li>构建 MCP server（如果需要）：<code>npm install</code> → <code>npm run build</code></li>
 <li>本地开发：<code>gemini extensions link .</code></li>
 <li>按需添加：<code>commands/</code>、<code>GEMINI.md</code>、<code>hooks/</code>、<code>skills/</code></li>
 <li>发布与安装：推送到 GitHub → <code>gemini extensions install &lt;repo-url&gt;</code></li>
 </ol>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">最佳实践</h4>
 <ul className="text-sm text-body space-y-1">
 <li>✓ 扩展名与目录名保持一致（小写+短横线）</li>
 <li>
 ✓ manifest 使用 <code>{'${extensionPath}'}</code> 等变量，保证可移植
 </li>
 <li>✓ settings 使用 envVar，敏感信息标记 <code>sensitive: true</code></li>
 <li>✓ hooks 与 skills 都属于高影响能力：保持最小化并充分审阅</li>
 <li>✓ 给扩展提供清晰的 README 与使用示例</li>
 </ul>
 </div>
 </div>
 </section>

 {/* 扩展生命周期深入 */}
 <section className="bg-surface rounded-lg border border-edge p-6">
 <h3 className="text-xl font-semibold text-heading mb-4">🔄 扩展生命周期深入</h3>

 <MermaidDiagram chart={extensionLifecycleFlow} title="扩展完整生命周期" />

 <div className="mt-6 space-y-4">
 <div className="bg-base/30 rounded-lg p-4">
 <h4 className="text-lg font-medium text-heading mb-2">1. 发现与路径解析</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div>
 <div className="text-body mb-1">扫描位置</div>
 <ul className="text-body space-y-1">
 <li>
 • <code className="text-heading">~/.gemini/extensions/*</code>
 </li>
 </ul>
 </div>
 <div>
 <div className="text-body mb-1">link 安装</div>
 <p className="text-body">
 如果安装元数据里 <code>type=link</code>，CLI 会把 <code>source</code> 当作
 <strong>effectiveExtensionPath</strong>，从开发目录读取 <code>gemini-extension.json</code>。
 </p>
 </div>
 </div>
 </div>

 <div className="bg-base/30 rounded-lg p-4">
 <h4 className="text-lg font-medium text-heading mb-2">2. Manifest 加载与变量替换</h4>
 <ul className="text-sm text-body space-y-1 list-disc list-inside">
 <li>
 读取 <code>gemini-extension.json</code>，校验 <code>name</code>/<code>version</code> 与命名规则（字母/数字/-）
 </li>
 <li>
 递归 hydrate 字符串变量：<code>{'${extensionPath}'}</code>、<code>{'${workspacePath}'}</code>、<code>{'${/}'}</code>
 </li>
 <li>
 MCP 配置会过滤掉 <code>trust</code>（扩展不能静默把 server 标记为 trusted）
 </li>
 </ul>
 </div>

 <div className="bg-base/30 rounded-lg p-4">
 <h4 className="text-lg font-medium text-heading mb-2">3. Enablement：按路径启用/禁用</h4>
 <ul className="text-sm text-body space-y-1 list-disc list-inside">
 <li>
 扩展默认启用；用户可通过 <code>gemini extensions disable</code> 在 user/workspace scope 禁用
 </li>
 <li>
 底层是 <code>extension-enablement.json</code> 的 overrides（最后匹配规则生效）
 </li>
 <li>
 <code>-e</code> 参数可在当前会话强制启用/禁用（session override）
 </li>
 </ul>
 </div>

 <div className="bg-base/30 rounded-lg p-4">
 <h4 className="text-lg font-medium text-heading mb-2">4. Active Extension 的生效点</h4>
 <ul className="text-sm text-body space-y-1 list-disc list-inside">
 <li>
 <strong>commands</strong>：<code>FileCommandLoader</code> 加载 <code>{'ext.path/commands'}</code>，用于 <code>/group:cmd</code>
 </li>
 <li>
 <strong>contextFiles</strong>：读取扩展目录内的 <code>GEMINI.md</code>（或 contextFileName 指定的文件）并注入 prompt
 </li>
 <li>
 <strong>hooks</strong>：读取 <code>hooks/hooks.json</code>，执行会被 PolicyEngine/MessageBus 约束
 </li>
 <li>
 <strong>skills</strong>：扫描 <code>skills/**/SKILL.md</code>，在 experimental.skills 启用时加入 system prompt
 </li>
 <li>
 <strong>mcpServers</strong>：启动/连接 MCP server，发现 tools/resources 并注册到 ToolRegistry
 </li>
 </ul>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <div className="text-heading font-semibold mb-2">重启提示</div>
 <p className="text-sm text-body">
 官方文档建议：扩展的 install/update/enable/disable 一般需要<strong>重启当前 CLI 会话</strong>才会完整生效。
 </p>
 </div>
 </div>
 </section>

 {/* 安全边界 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">🔒 扩展安全边界</h3>

 <HighlightBox title="风险面不是“扩展 API”，而是“扩展带来的能力”" color="red">
 <ul className="text-sm space-y-1 text-body list-disc list-inside">
 <li>
 <strong>供应链</strong>：从 git/GitHub 安装第三方扩展，本质是把对方的目录复制进 <code>~/.gemini/extensions</code>
 </li>
 <li>
 <strong>MCP Servers</strong>：扩展可声明要启动的本地进程或连接远端服务，等同于运行/信任第三方代码
 </li>
 <li>
 <strong>Hooks</strong>：可自动执行命令（高风险），需要 enableHooks 且会在 consent 中单独提示
 </li>
 <li>
 <strong>Agent Skills / Context</strong>：注入 system prompt，改变模型行为（易被滥用为“隐形规则”）
 </li>
 </ul>
 </HighlightBox>

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-lg font-medium text-heading mb-2">内置防护</h4>
 <ul className="text-sm text-body space-y-1 list-disc list-inside">
 <li>
 <strong>Consent</strong>：安装/更新时展示 MCP servers / hooks / skills 等清单并要求确认
 </li>
 <li>
 <strong>blockGitExtensions</strong>：可禁用从远端 git 安装扩展
 </li>
 <li>
 <strong>Enablement</strong>：按 user/workspace scope 禁用扩展，避免“全局污染”
 </li>
 <li>
 <strong>MCP allow/exclude</strong>：<code>mcp.allowed</code>/<code>mcp.excluded</code> 控制可连接的 server 名称
 </li>
 <li>
 <strong>Trust 字段过滤</strong>：扩展的 mcpServers 不允许设置 <code>trust</code>（会被过滤）
 </li>
 </ul>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">实践建议</h4>
 <ul className="text-sm text-body space-y-1 list-disc list-inside">
 <li>只安装可审阅来源（固定 tag/release，避免跟随 main 漂移）</li>
 <li>优先使用 <code>extensions link</code> 做本地开发，发布前再走 install/update 流程</li>
 <li>把 hooks 与 skills 视为“需要安全评审”的能力，默认保持最小化</li>
 <li>必要时用 <code>excludeTools</code> 为扩展/工作区设置“安全阈值”</li>
 </ul>
 </div>
 </div>
 </section>

 {/* 为什么这样设计 */}
 <section className="bg-surface rounded-lg border border-edge p-6">
 <h3 className="text-xl font-semibold text-heading mb-4">💡 为什么这样设计？</h3>

 <div className="space-y-6">
 <div>
 <h4 className="text-lg font-medium text-heading mb-2">1. 为什么是 gemini-extension.json（而不是可执行插件）？</h4>
 <div className="bg-base/30 rounded-lg p-4 text-sm text-body space-y-2">
 <p>
 <strong className="text-heading">决策</strong>：扩展是声明式配置（manifest + 目录约定），复杂逻辑放到 MCP server（外部进程）。
 </p>
 <ul className="list-disc list-inside space-y-1 text-body">
 <li>更容易做 consent 披露与安全审阅（“这次会启动哪些进程/注入哪些内容”）</li>
 <li>减少主进程插件 API 的兼容性与升级成本</li>
 <li>跨平台更稳定：CLI 只负责加载配置与管理生命周期</li>
 </ul>
 <p className="text-body">
 <strong>权衡</strong>：扩展本身不提供任意代码执行接口；需要自定义逻辑时，用 MCP server 来承载。
 </p>
 </div>
 </div>

 <div>
 <h4 className="text-lg font-medium text-heading mb-2">2. 为什么 install 会“复制”扩展目录？</h4>
 <div className="bg-base/30 rounded-lg p-4 text-sm text-body space-y-2">
 <p>
 <strong className="text-heading">决策</strong>：安装时把扩展复制到 <code>~/.gemini/extensions/&lt;name&gt;</code>，从而提供稳定的加载位置。
 </p>
 <ul className="list-disc list-inside space-y-1">
 <li>本地路径扩展改动不会“偷偷生效”，需要显式 <code>extensions update</code></li>
 <li>需要热更新体验时，用 <code>extensions link</code> 把安装目录指向开发目录</li>
 </ul>
 </div>
 </div>

 <div>
 <h4 className="text-lg font-medium text-heading mb-2">3. 为什么 extension commands 最后加载？</h4>
 <div className="bg-base/30 rounded-lg p-4 text-sm text-body space-y-2">
 <p>
 <strong className="text-heading">决策</strong>：commands 的加载顺序是 <strong>User → Project → Extension</strong>。
 </p>
 <ul className="list-disc list-inside space-y-1">
 <li>project commands 可以覆盖 user commands（更贴近当前仓库）</li>
 <li>extension commands 最后加载，便于检测与用户/项目命令的冲突并做命名处理</li>
 </ul>
 </div>
 </div>
 </div>
 </section>

 {/* 扩展加载错误处理 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">⚠️ 扩展加载错误处理</h3>

 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-left text-body">
 <th className="py-2 px-2">错误类型</th>
 <th className="py-2 px-2">触发条件</th>
 <th className="py-2 px-2">CLI 行为</th>
 <th className="py-2 px-2">用户可见信息</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">MissingConfig</td>
 <td className="py-2 px-2 text-xs">缺少 gemini-extension.json</td>
 <td className="py-2 px-2 text-xs">跳过该扩展目录</td>
 <td className="py-2 px-2 text-xs">Warning: Skipping extension…</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">InvalidConfig</td>
 <td className="py-2 px-2 text-xs">JSON 解析失败 / 缺少 name/version</td>
 <td className="py-2 px-2 text-xs">跳过该扩展目录</td>
 <td className="py-2 px-2 text-xs">Warning: Skipping extension…</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">InvalidName</td>
 <td className="py-2 px-2 text-xs">扩展名不合法（非字母/数字/-）</td>
 <td className="py-2 px-2 text-xs">跳过该扩展目录</td>
 <td className="py-2 px-2 text-xs">Warning: Skipping extension…</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">HooksConfigInvalid</td>
 <td className="py-2 px-2 text-xs">hooks/hooks.json 非法或 hydrate 失败</td>
 <td className="py-2 px-2 text-xs">忽略 hooks，继续加载</td>
 <td className="py-2 px-2 text-xs">warn（不影响其他能力）</td>
 </tr>
 <tr>
 <td className="py-2 px-2 text-heading">MCPDiscoveryError</td>
 <td className="py-2 px-2 text-xs">某个 MCP server 启动/握手/发现失败</td>
 <td className="py-2 px-2 text-xs">记录错误，其他 server 继续</td>
 <td className="py-2 px-2 text-xs">UI/日志提示该 server 不可用</td>
 </tr>
 </tbody>
 </table>
 </div>

 <div className="mt-4 bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">错误隔离设计</h4>
 <p className="text-sm text-body">
 单个扩展的错误<strong className="text-heading">不会影响其他扩展或 CLI 核心功能</strong>。
 每个扩展在独立的 try-catch 中加载，失败的扩展会被禁用，但 CLI 继续正常运行。
 </p>
 </div>
 </section>

 {/* 相关页面 */}
 <RelatedPages
 title="📚 相关阅读"
 pages={[
 { id: 'mcp', label: 'MCP 协议详解', description: '扩展如何注册 MCP 服务器' },
 { id: 'tool-arch', label: '工具系统架构', description: '扩展如何通过 MCP 提供工具' },
 { id: 'slash-cmd', label: '斜杠命令系统', description: '扩展如何添加新命令' },
 { id: 'config', label: '配置系统', description: '扩展配置项的注册和使用' },
 { id: 'sandbox', label: '沙箱系统', description: '工具执行的安全边界' },
 { id: 'design-tradeoffs', label: '设计权衡', description: '扩展系统的架构决策' },
 ]}
 />
 </div>
 );
}
