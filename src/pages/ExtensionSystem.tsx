import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages } from '../components/RelatedPages';

export function ExtensionSystem() {
  const extensionFlow = `flowchart TD
    start["CLI 启动"]
    scan_local["扫描本地扩展<br/>.gemini/extensions/"]
    scan_global["扫描全局扩展<br/>~/.gemini/extensions/"]
    load_manifest["加载 manifest<br/>package.json"]
    validate{"验证扩展"}
    init_ext["初始化扩展<br/>执行 activate()"]
    register["注册扩展能力<br/>工具/命令/MCP"]
    ready["扩展就绪"]
    skip["跳过无效扩展"]

    start --> scan_local
    scan_local --> scan_global
    scan_global --> load_manifest
    load_manifest --> validate
    validate -->|有效| init_ext
    validate -->|无效| skip
    init_ext --> register
    register --> ready

    style start fill:#22d3ee,color:#000
    style ready fill:#22c55e,color:#000
    style skip fill:#22c55e,color:#000
    style validate fill:#f59e0b,color:#000`;

  const extensionLifecycleFlow = `stateDiagram-v2
    [*] --> Discovered: 扫描目录

    state "Discovered" as Discovered
    state "Validated" as Validated
    state "Pending" as Pending
    state "Active" as Active
    state "Failed" as Failed
    state "Deactivated" as Deactivated

    Discovered --> Validated: manifest 有效
    Discovered --> Failed: manifest 无效

    Validated --> Pending: 等待激活事件
    Validated --> Active: onStartup

    Pending --> Active: 事件触发
    note right of Pending: onCommand / workspaceContains / onTool

    Active --> Deactivated: deactivate()
    Active --> Failed: activate() 异常

    Deactivated --> Active: 重新激活
    Deactivated --> [*]: CLI 退出

    Failed --> [*]: 跳过该扩展`;

  const extensionManifestCode = `// 扩展清单文件
// package.json

{
  "name": "my-extension",
  "version": "1.0.0",
  "description": "My custom CLI extension",
  "main": "dist/index.js",

  // 扩展元数据
  "gemini": {
    // 扩展类型
    "type": "extension",

    // 激活事件
    "activationEvents": [
      "onCommand:myCommand",      // 当命令被调用时
      "onStartup",                // CLI 启动时
      "workspaceContains:**/*.py" // 工作区包含特定文件
    ],

    // 提供的能力
    "contributes": {
      // 斜杠命令
      "commands": [
        {
          "command": "myCommand",
          "title": "My Custom Command",
          "description": "执行自定义操作"
        }
      ],

      // 自定义工具
      "tools": [
        {
          "name": "myTool",
          "description": "自定义工具",
          "schema": "./schemas/myTool.json"
        }
      ],

      // MCP 服务器
      "mcpServers": [
        {
          "name": "myServer",
          "command": "node",
          "args": ["./mcp-server.js"]
        }
      ],

      // 配置项
      "configuration": {
        "type": "object",
        "properties": {
          "myExtension.enabled": {
            "type": "boolean",
            "default": true
          }
        }
      }
    },

    // 依赖的其他扩展
    "extensionDependencies": [
      "base-extension"
    ]
  }
}`;

  const extensionApiCode = `// 扩展 API
// packages/core/src/extensions/api.ts

// 扩展上下文
interface ExtensionContext {
  // 扩展存储 (持久化)
  globalState: Memento;
  workspaceState: Memento;

  // 路径信息
  extensionPath: string;
  extensionUri: URI;

  // 注册的资源 (自动清理)
  subscriptions: Disposable[];

  // 环境信息
  environmentVariableCollection: EnvironmentVariableCollection;

  // 日志
  logger: Logger;
}

// 扩展入口
interface Extension {
  // 扩展激活
  activate(context: ExtensionContext): Promise<void> | void;

  // 扩展停用
  deactivate?(): Promise<void> | void;

  // 导出的 API (供其他扩展使用)
  exports?: any;
}

// 示例扩展实现
export function activate(context: ExtensionContext): void {
  // 注册命令
  const command = registerCommand('myCommand', async () => {
    console.log('Command executed!');
  });
  context.subscriptions.push(command);

  // 注册工具
  const tool = registerTool({
    name: 'myTool',
    description: 'My custom tool',
    parameters: {
      type: 'object',
      properties: {
        input: { type: 'string' }
      }
    },
    execute: async (params) => {
      return { result: \`Processed: \${params.input}\` };
    }
  });
  context.subscriptions.push(tool);

  // 存储状态
  context.globalState.update('lastRun', Date.now());

  console.log('Extension activated!');
}

export function deactivate(): void {
  console.log('Extension deactivated!');
}`;

  const mcpExtensionCode = `// MCP 服务器扩展
// packages/cli/src/commands/extensions.ts

// 从 GitHub 安装扩展
export async function installExtension(
  source: string,
  options: InstallOptions = {}
): Promise<void> {
  // 解析来源
  const parsed = parseExtensionSource(source);

  if (parsed.type === 'github') {
    // GitHub 仓库安装
    await installFromGitHub(parsed.repo, options);
  } else if (parsed.type === 'npm') {
    // npm 包安装
    await installFromNpm(parsed.package, options);
  } else if (parsed.type === 'local') {
    // 本地路径安装
    await installFromLocal(parsed.path, options);
  }
}

// GitHub 安装流程
async function installFromGitHub(
  repo: string,
  options: InstallOptions
): Promise<void> {
  const { owner, name, ref } = parseGitHubRepo(repo);

  // 1. 下载仓库
  const tarball = await downloadGitHubTarball(owner, name, ref);

  // 2. 解压到扩展目录
  const extensionDir = path.join(
    options.global ? getGlobalExtensionsDir() : getLocalExtensionsDir(),
    name
  );
  await extractTarball(tarball, extensionDir);

  // 3. 安装依赖
  await execInDir(extensionDir, 'npm install --production');

  // 4. 构建 (如果需要)
  if (await hasScript(extensionDir, 'build')) {
    await execInDir(extensionDir, 'npm run build');
  }

  // 5. 验证扩展
  await validateExtension(extensionDir);

  console.log(\`Extension \${name} installed successfully!\`);
}

// 扩展命令
// gemini extensions install owner/repo
// gemini extensions uninstall extension-name
// gemini extensions list
// gemini extensions update [extension-name]`;

  const mcpServerConfigCode = `// MCP 服务器配置
// .gemini/mcp.json

{
  "mcpServers": {
    // 内置 MCP 服务器
    "filesystem": {
      "command": "node",
      "args": ["~/.gemini/mcp-servers/filesystem/index.js"],
      "env": {
        "ALLOWED_PATHS": "/home/user/projects"
      }
    },

    // 自定义 MCP 服务器
    "database": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "env": {
        "DB_CONNECTION": "postgresql://localhost/mydb"
      },
      "cwd": "/path/to/server"
    },

    // 从扩展加载的 MCP 服务器
    "extension:my-extension": {
      "fromExtension": "my-extension",
      "serverName": "myServer"
    }
  },

  // MCP 服务器选项
  "options": {
    // 启动超时
    "startupTimeout": 30000,

    // 重试配置
    "retryOnFailure": true,
    "maxRetries": 3,

    // 日志级别
    "logLevel": "info"
  }
}`;

  const extensionRegistryCode = `// 扩展注册表
// packages/core/src/extensions/registry.ts

interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  publisher?: string;
  path: string;
  isActive: boolean;
  activationTime?: number;
  contributes: {
    commands: CommandContribution[];
    tools: ToolContribution[];
    mcpServers: MCPServerContribution[];
  };
}

class ExtensionRegistry {
  private extensions: Map<string, ExtensionInfo> = new Map();
  private activeExtensions: Set<string> = new Set();

  // 注册扩展
  register(info: ExtensionInfo): void {
    this.extensions.set(info.id, info);
  }

  // 激活扩展
  async activate(id: string): Promise<void> {
    const info = this.extensions.get(id);
    if (!info || this.activeExtensions.has(id)) {
      return;
    }

    // 加载扩展模块
    const extensionModule = await import(info.path);

    // 创建上下文
    const context = this.createContext(info);

    // 调用 activate
    const startTime = Date.now();
    await extensionModule.activate(context);

    info.isActive = true;
    info.activationTime = Date.now() - startTime;
    this.activeExtensions.add(id);
  }

  // 停用扩展
  async deactivate(id: string): Promise<void> {
    const info = this.extensions.get(id);
    if (!info || !this.activeExtensions.has(id)) {
      return;
    }

    // 加载扩展模块
    const extensionModule = await import(info.path);

    // 调用 deactivate
    if (extensionModule.deactivate) {
      await extensionModule.deactivate();
    }

    info.isActive = false;
    this.activeExtensions.delete(id);
  }

  // 获取所有已注册的命令
  getCommands(): CommandContribution[] {
    const commands: CommandContribution[] = [];
    for (const info of this.extensions.values()) {
      commands.push(...info.contributes.commands);
    }
    return commands;
  }

  // 获取所有已注册的工具
  getTools(): ToolContribution[] {
    const tools: ToolContribution[] = [];
    for (const info of this.extensions.values()) {
      if (info.isActive) {
        tools.push(...info.contributes.tools);
      }
    }
    return tools;
  }
}`;

  const cliCommandsCode = `# 扩展管理命令

# 列出所有扩展
gemini extensions list
# 输出:
# ┌─────────────────┬─────────┬────────┬──────────┐
# │ Name            │ Version │ Active │ Type     │
# ├─────────────────┼─────────┼────────┼──────────┤
# │ python-tools    │ 1.2.0   │ Yes    │ local    │
# │ git-helpers     │ 0.5.0   │ Yes    │ global   │
# │ database-mcp    │ 2.0.0   │ No     │ global   │
# └─────────────────┴─────────┴────────┴──────────┘

# 安装扩展 (GitHub)
gemini extensions install username/repo
gemini extensions install username/repo@v1.0.0
gemini extensions install github:username/repo

# 安装扩展 (npm)
gemini extensions install npm:package-name

# 安装扩展 (本地)
gemini extensions install ./path/to/extension

# 卸载扩展
gemini extensions uninstall extension-name

# 更新扩展
gemini extensions update           # 更新所有
gemini extensions update ext-name  # 更新特定扩展

# 启用/禁用扩展
gemini extensions enable ext-name
gemini extensions disable ext-name

# 查看扩展详情
gemini extensions info ext-name
# 输出:
# Name: python-tools
# Version: 1.2.0
# Description: Python development tools for gemini
# Path: ~/.gemini/extensions/python-tools
#
# Contributes:
#   Commands:
#     - /pytest: Run pytest tests
#     - /pylint: Run pylint analysis
#   Tools:
#     - python_run: Execute Python code
#   MCP Servers:
#     - python-lsp: Python Language Server`;

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
    output.push('⚠️  This extension contains Hooks which can automatically execute commands.');
  }

  if (skills.length > 0) {
    output.push('Agent Skills:');
    output.push(SKILLS_WARNING_MESSAGE);
    for (const skill of skills) {
      output.push(\`  * \${skill.name}: \${skill.description}\`);
      output.push(\`    (Location: \${skill.location})\`);
    }
  }
}`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">扩展系统</h2>
        <p className="text-gray-300 mb-4">
          扩展系统允许用户和开发者通过插件扩展 CLI 的功能。支持自定义命令、工具、MCP 服务器等，
          可以从 GitHub、npm 或本地安装扩展。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HighlightBox title="自定义命令" color="blue">
            <p className="text-sm">添加新的斜杠命令</p>
            <code className="text-xs text-blue-400">/myCommand</code>
          </HighlightBox>

          <HighlightBox title="自定义工具" color="green">
            <p className="text-sm">注册新的 AI 工具</p>
            <code className="text-xs text-green-400">MyTool</code>
          </HighlightBox>

          <HighlightBox title="MCP 服务器" color="yellow">
            <p className="text-sm">集成 MCP 协议服务</p>
            <code className="text-xs text-yellow-400">mcp-server</code>
          </HighlightBox>

          <HighlightBox title="配置项" color="purple">
            <p className="text-sm">添加配置选项</p>
            <code className="text-xs text-purple-400">settings.json</code>
          </HighlightBox>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">安全披露（Consent）</h3>
        <p className="text-gray-300 mb-4">
          Gemini CLI 会在安装/更新扩展时展示“将要启用的能力清单”，并要求用户确认继续：包括 MCP servers、Hooks（可能自动执行命令）、以及 Agent
          skills（会把指令注入 system prompt）。这一步的目标是让用户在扩展生效前完成安全审阅。
        </p>
        <CodeBlock title="Consent 文本生成（节选）" language="typescript" code={consentCode} />
      </section>

      {/* 加载流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">扩展加载流程</h3>
        <MermaidDiagram chart={extensionFlow} title="扩展加载流程" />
      </section>

      {/* 扩展清单 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">扩展清单 (package.json)</h3>
        <CodeBlock code={extensionManifestCode} language="json" title="扩展配置" />
      </section>

      {/* 扩展 API */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">扩展 API</h3>
        <CodeBlock code={extensionApiCode} language="typescript" title="扩展实现" />

        <HighlightBox title="ExtensionContext 功能" color="blue" className="mt-4">
          <ul className="text-sm space-y-1">
            <li>• <strong>globalState</strong>: 全局持久化存储</li>
            <li>• <strong>workspaceState</strong>: 工作区级别存储</li>
            <li>• <strong>subscriptions</strong>: 资源订阅列表 (自动清理)</li>
            <li>• <strong>logger</strong>: 扩展专用日志记录器</li>
            <li>• <strong>extensionPath</strong>: 扩展安装路径</li>
          </ul>
        </HighlightBox>
      </section>

      {/* 扩展安装 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">扩展安装</h3>
        <CodeBlock code={mcpExtensionCode} language="typescript" title="安装流程" />
      </section>

      {/* MCP 服务器配置 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">MCP 服务器配置</h3>
        <CodeBlock code={mcpServerConfigCode} language="json" title="mcp.json" />
      </section>

      {/* 扩展注册表 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">扩展注册表</h3>
        <CodeBlock code={extensionRegistryCode} language="typescript" title="ExtensionRegistry" />
      </section>

      {/* CLI 命令 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">扩展管理命令</h3>
        <CodeBlock code={cliCommandsCode} language="bash" title="gemini extensions" />
      </section>

      {/* 扩展目录结构 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">扩展目录结构</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <pre className="text-sm text-gray-300">
{`~/.gemini/
├── extensions/                 # 全局扩展目录
│   ├── python-tools/
│   │   ├── package.json       # 扩展清单
│   │   ├── dist/
│   │   │   └── index.js       # 入口文件
│   │   └── schemas/
│   │       └── tools.json     # 工具 schema
│   └── git-helpers/
│       └── ...
│
├── mcp-servers/               # MCP 服务器
│   ├── filesystem/
│   └── database/
│
└── mcp.json                   # MCP 配置文件

project/
├── .gemini/
│   ├── extensions/            # 项目级扩展
│   │   └── local-extension/
│   └── mcp.json               # 项目 MCP 配置
└── ...`}
          </pre>
        </div>
      </section>

      {/* 架构图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">扩展系统架构</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────────┐
│                         Gemini CLI                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   Extension Manager                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │  │
│  │  │   Scanner    │  │   Loader     │  │  Validator   │     │  │
│  │  │              │  │              │  │              │     │  │
│  │  │ Local/Global │  │ package.json │  │ Schema Check │     │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │  │
│  │         └─────────────────┼─────────────────┘              │  │
│  │                           │                                │  │
│  └───────────────────────────┼────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼────────────────────────────────┐  │
│  │                  Extension Registry                        │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Extensions                                           │  │  │
│  │  │ ┌────────────┐ ┌────────────┐ ┌────────────┐        │  │  │
│  │  │ │ python-    │ │ git-       │ │ database-  │        │  │  │
│  │  │ │ tools      │ │ helpers    │ │ mcp        │        │  │  │
│  │  │ │ [active]   │ │ [active]   │ │ [inactive] │        │  │  │
│  │  │ └────────────┘ └────────────┘ └────────────┘        │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Contributions:                                            │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │  │
│  │  │  Commands   │ │   Tools     │ │ MCP Servers │          │  │
│  │  │ /pytest     │ │ python_run  │ │ python-lsp  │          │  │
│  │  │ /pylint     │ │ git_commit  │ │ database    │          │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Integration Points:                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ CommandSvc  │  │ ToolService │  │ MCPManager  │              │
│  │ ↑ commands  │  │ ↑ tools     │  │ ↑ servers   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* 开发扩展 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">开发自己的扩展</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">开发步骤</h4>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>创建 package.json 并添加 gemini 配置</li>
              <li>实现 activate() 和可选的 deactivate()</li>
              <li>注册命令、工具或 MCP 服务器</li>
              <li>测试: <code>gemini ext install ./</code></li>
              <li>发布到 GitHub 或 npm</li>
            </ol>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">最佳实践</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 使用 TypeScript 获得类型安全</li>
              <li>✓ 在 deactivate 中清理资源</li>
              <li>✓ 使用 context.subscriptions 自动清理</li>
              <li>✓ 提供完整的 schema 定义</li>
              <li>✓ 编写单元测试</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 扩展生命周期深入 */}
      <section className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🔄 扩展生命周期深入</h3>

        <MermaidDiagram chart={extensionLifecycleFlow} title="扩展完整生命周期" />

        <div className="mt-6 space-y-4">
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-200 mb-2">1. 发现阶段 (Discovery)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">扫描位置</div>
                <ul className="text-gray-300 space-y-1">
                  <li>• <code className="text-cyan-400">.gemini/extensions/</code> 项目级</li>
                  <li>• <code className="text-cyan-400">~/.gemini/extensions/</code> 全局级</li>
                </ul>
              </div>
              <div>
                <div className="text-gray-400 mb-1">扫描内容</div>
                <ul className="text-gray-300 space-y-1">
                  <li>• 查找 <code>package.json</code></li>
                  <li>• 验证 <code>gemini</code> 字段存在</li>
                  <li>• 检查 <code>main</code> 入口文件</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-200 mb-2">2. 验证阶段 (Validation)</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="text-left py-2">检查项</th>
                  <th className="text-left py-2">失败处理</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-2">package.json 格式</td>
                  <td className="py-2 text-red-400">跳过扩展，记录警告</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2">入口文件存在</td>
                  <td className="py-2 text-red-400">跳过扩展，记录错误</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2">依赖扩展已安装</td>
                  <td className="py-2 text-amber-400">延迟激活，等待依赖</td>
                </tr>
                <tr>
                  <td className="py-2">版本兼容性</td>
                  <td className="py-2 text-amber-400">警告并继续</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-200 mb-2">3. 激活阶段 (Activation)</h4>
            <CodeBlock code={`// 激活时机由 activationEvents 控制
"activationEvents": [
  "onStartup",                    // CLI 启动时立即激活
  "onCommand:myCommand",          // 用户调用 /myCommand 时激活
  "workspaceContains:**/*.py",    // 工作区包含 Python 文件时激活
  "onTool:myTool",                // AI 调用 myTool 时激活
]

// 激活流程
async function activateExtension(info: ExtensionInfo): Promise<void> {
  // 1. 创建扩展上下文
  const context = createExtensionContext(info);

  // 2. 加载扩展模块（动态 import）
  const module = await import(info.entryPoint);

  // 3. 调用 activate 函数
  const startTime = Date.now();
  await module.activate(context);

  // 4. 记录激活时间（用于性能监控）
  info.activationTime = Date.now() - startTime;
  info.isActive = true;
}`} language="typescript" />
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-200 mb-2">4. 停用阶段 (Deactivation)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">触发条件</div>
                <ul className="text-gray-300 space-y-1">
                  <li>• CLI 正常退出</li>
                  <li>• 用户禁用扩展</li>
                  <li>• 扩展卸载</li>
                  <li>• 扩展更新（先停用再激活）</li>
                </ul>
              </div>
              <div>
                <div className="text-gray-400 mb-1">清理责任</div>
                <ul className="text-gray-300 space-y-1">
                  <li>• <code>context.subscriptions</code> 自动清理</li>
                  <li>• <code>deactivate()</code> 中的自定义清理</li>
                  <li>• 文件句柄、网络连接关闭</li>
                  <li>• 定时器取消</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 安全边界 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">🔒 扩展安全边界</h3>

        <HighlightBox title="扩展的权限模型" color="red">
          <p className="text-sm mb-3">
            扩展运行在与 CLI 相同的 Node.js 进程中，因此<strong className="text-red-400">默认拥有完全权限</strong>。
            以下是当前的安全边界设计：
          </p>
        </HighlightBox>

        <div className="mt-4 space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-200 mb-3">权限层级</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-red-400 font-mono text-sm bg-red-900/30 px-2 py-1 rounded">HIGH</span>
                <div className="flex-1">
                  <div className="text-gray-200 font-medium">文件系统完全访问</div>
                  <p className="text-gray-400 text-xs">扩展可以读写任意文件，不受沙箱限制</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-400 font-mono text-sm bg-red-900/30 px-2 py-1 rounded">HIGH</span>
                <div className="flex-1">
                  <div className="text-gray-200 font-medium">进程执行权限</div>
                  <p className="text-gray-400 text-xs">扩展可以 spawn 任意子进程</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-mono text-sm bg-amber-900/30 px-2 py-1 rounded">MED</span>
                <div className="flex-1">
                  <div className="text-gray-200 font-medium">网络访问</div>
                  <p className="text-gray-400 text-xs">扩展可以发起任意网络请求</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-mono text-sm bg-green-900/30 px-2 py-1 rounded">LOW</span>
                <div className="flex-1">
                  <div className="text-gray-200 font-medium">CLI API 访问</div>
                  <p className="text-gray-400 text-xs">通过 ExtensionContext 提供的受限 API</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
            <h4 className="text-amber-400 font-semibold mb-2">⚠️ 安全建议</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <strong>仅安装可信来源的扩展</strong>：GitHub 官方仓库、知名作者</li>
              <li>• <strong>审查扩展代码</strong>：安装前检查 package.json 和入口文件</li>
              <li>• <strong>限制全局扩展</strong>：优先使用项目级扩展，便于隔离</li>
              <li>• <strong>定期更新</strong>：及时获取安全补丁</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-200 mb-2">MCP 服务器的特殊安全性</h4>
            <p className="text-sm text-gray-400 mb-3">
              通过扩展注册的 MCP 服务器有额外的安全机制：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-cyan-400 mb-1">隔离运行</div>
                <p className="text-gray-300">MCP 服务器在独立进程中运行，与 CLI 主进程隔离</p>
              </div>
              <div>
                <div className="text-cyan-400 mb-1">trust 标记</div>
                <p className="text-gray-300"><code>trust: false</code> 的服务器需要用户确认才能使用</p>
              </div>
              <div>
                <div className="text-cyan-400 mb-1">白名单机制</div>
                <p className="text-gray-300"><code>mcp.allowed</code> 控制允许启用的服务器</p>
              </div>
              <div>
                <div className="text-cyan-400 mb-1">黑名单机制</div>
                <p className="text-gray-300"><code>mcp.excluded</code> 强制禁用危险服务器</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 为什么这样设计 */}
      <section className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/30 p-6">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">💡 为什么这样设计？</h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-2">1. 为什么借鉴 VS Code 扩展模型？</h4>
            <div className="bg-black/30 rounded-lg p-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-green-400 font-medium mb-1">借鉴的设计</div>
                  <ul className="text-gray-300 space-y-1">
                    <li>• <code>package.json</code> 作为 manifest</li>
                    <li>• <code>activate()/deactivate()</code> 生命周期</li>
                    <li>• <code>contributes</code> 声明式能力注册</li>
                    <li>• <code>ExtensionContext</code> 上下文对象</li>
                  </ul>
                </div>
                <div>
                  <div className="text-cyan-400 font-medium mb-1">带来的好处</div>
                  <ul className="text-gray-300 space-y-1">
                    <li>• 开发者熟悉度高</li>
                    <li>• 成熟的设计模式</li>
                    <li>• 大量可参考的实现</li>
                    <li>• 降低学习成本</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-2">2. 为什么使用 activationEvents 而非立即加载？</h4>
            <div className="bg-black/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="mb-2">
                <strong className="text-white">问题</strong>：如果所有扩展在 CLI 启动时都加载，会显著增加启动时间。
              </p>
              <p className="mb-2">
                <strong className="text-white">解决</strong>：通过 activationEvents 实现按需激活：
              </p>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• <code>onStartup</code>：核心扩展，必须立即加载</li>
                <li>• <code>onCommand:xxx</code>：用户调用命令时才加载</li>
                <li>• <code>workspaceContains:**/*.py</code>：Python 项目才加载 Python 相关扩展</li>
              </ul>
              <p className="mt-2 text-cyan-400">
                效果：启动时间从 ~2s 降低到 ~200ms（无扩展场景）
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-2">3. 为什么 subscriptions 使用数组而非 Map？</h4>
            <div className="bg-black/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="mb-2">
                <code className="text-cyan-400">context.subscriptions</code> 是一个 <code>Disposable[]</code> 数组，
                扩展停用时自动调用每个元素的 <code>dispose()</code>。
              </p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-400 mb-1">数组的优势</div>
                  <ul className="text-gray-300 space-y-1">
                    <li>• 保持注册顺序</li>
                    <li>• 简单的 push 操作</li>
                    <li>• 反向遍历 dispose</li>
                  </ul>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">使用模式</div>
                  <CodeBlock code={`const cmd = registerCommand('myCmd', handler);
context.subscriptions.push(cmd);
// 停用时自动 cmd.dispose()`} language="typescript" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 扩展加载错误处理 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">⚠️ 扩展加载错误处理</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left text-gray-400">
                <th className="py-2 px-2">错误类型</th>
                <th className="py-2 px-2">触发条件</th>
                <th className="py-2 px-2">CLI 行为</th>
                <th className="py-2 px-2">用户可见信息</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2 text-red-400">ManifestError</td>
                <td className="py-2 px-2 text-xs">package.json 解析失败</td>
                <td className="py-2 px-2 text-xs">跳过该扩展</td>
                <td className="py-2 px-2 text-xs">启动日志警告</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2 text-red-400">EntryNotFound</td>
                <td className="py-2 px-2 text-xs">入口文件不存在</td>
                <td className="py-2 px-2 text-xs">跳过该扩展</td>
                <td className="py-2 px-2 text-xs">启动日志错误</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2 text-amber-400">ActivationError</td>
                <td className="py-2 px-2 text-xs">activate() 抛出异常</td>
                <td className="py-2 px-2 text-xs">标记为失败，不注册能力</td>
                <td className="py-2 px-2 text-xs">显示错误通知</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2 text-amber-400">DependencyMissing</td>
                <td className="py-2 px-2 text-xs">依赖的扩展未安装</td>
                <td className="py-2 px-2 text-xs">延迟激活</td>
                <td className="py-2 px-2 text-xs">提示安装依赖</td>
              </tr>
              <tr>
                <td className="py-2 px-2 text-cyan-400">Timeout</td>
                <td className="py-2 px-2 text-xs">activate() 超过 10s</td>
                <td className="py-2 px-2 text-xs">强制停止，标记失败</td>
                <td className="py-2 px-2 text-xs">显示超时警告</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-green-400 font-semibold mb-2">错误隔离设计</h4>
          <p className="text-sm text-gray-300">
            单个扩展的错误<strong className="text-white">不会影响其他扩展或 CLI 核心功能</strong>。
            每个扩展在独立的 try-catch 中加载，失败的扩展会被禁用，但 CLI 继续正常运行。
          </p>
        </div>
      </section>

      {/* 相关页面 */}
      <RelatedPages
        title="📚 相关阅读"
        pages={[
          { id: 'mcp', label: 'MCP 协议详解', description: '扩展如何注册 MCP 服务器' },
          { id: 'tool-arch', label: '工具系统架构', description: '扩展如何注册自定义工具' },
          { id: 'slash-cmd', label: '斜杠命令系统', description: '扩展如何添加新命令' },
          { id: 'config', label: '配置系统', description: '扩展配置项的注册和使用' },
          { id: 'sandbox', label: '沙箱系统', description: '工具执行的安全边界' },
          { id: 'design-tradeoffs', label: '设计权衡', description: '扩展系统的架构决策' },
        ]}
      />
    </div>
  );
}
