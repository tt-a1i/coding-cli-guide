import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function ExtensionSystem() {
  const extensionFlow = `flowchart TD
    start["CLI 启动"]
    scan_local["扫描本地扩展<br/>.qwen/extensions/"]
    scan_global["扫描全局扩展<br/>~/.qwen/extensions/"]
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

  const extensionManifestCode = `// 扩展清单文件
// package.json

{
  "name": "my-extension",
  "version": "1.0.0",
  "description": "My custom CLI extension",
  "main": "dist/index.js",

  // 扩展元数据
  "qwen": {
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
// qwen extensions install owner/repo
// qwen extensions uninstall extension-name
// qwen extensions list
// qwen extensions update [extension-name]`;

  const mcpServerConfigCode = `// MCP 服务器配置
// .qwen/mcp.json

{
  "mcpServers": {
    // 内置 MCP 服务器
    "filesystem": {
      "command": "node",
      "args": ["~/.qwen/mcp-servers/filesystem/index.js"],
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
qwen extensions list
# 输出:
# ┌─────────────────┬─────────┬────────┬──────────┐
# │ Name            │ Version │ Active │ Type     │
# ├─────────────────┼─────────┼────────┼──────────┤
# │ python-tools    │ 1.2.0   │ Yes    │ local    │
# │ git-helpers     │ 0.5.0   │ Yes    │ global   │
# │ database-mcp    │ 2.0.0   │ No     │ global   │
# └─────────────────┴─────────┴────────┴──────────┘

# 安装扩展 (GitHub)
qwen extensions install username/repo
qwen extensions install username/repo@v1.0.0
qwen extensions install github:username/repo

# 安装扩展 (npm)
qwen extensions install npm:package-name

# 安装扩展 (本地)
qwen extensions install ./path/to/extension

# 卸载扩展
qwen extensions uninstall extension-name

# 更新扩展
qwen extensions update           # 更新所有
qwen extensions update ext-name  # 更新特定扩展

# 启用/禁用扩展
qwen extensions enable ext-name
qwen extensions disable ext-name

# 查看扩展详情
qwen extensions info ext-name
# 输出:
# Name: python-tools
# Version: 1.2.0
# Description: Python development tools for qwen
# Path: ~/.qwen/extensions/python-tools
#
# Contributes:
#   Commands:
#     - /pytest: Run pytest tests
#     - /pylint: Run pylint analysis
#   Tools:
#     - python_run: Execute Python code
#   MCP Servers:
#     - python-lsp: Python Language Server`;

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
        <CodeBlock code={cliCommandsCode} language="bash" title="qwen extensions" />
      </section>

      {/* 扩展目录结构 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">扩展目录结构</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <pre className="text-sm text-gray-300">
{`~/.qwen/
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
├── .qwen/
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
│                         Qwen CLI                               │
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
              <li>创建 package.json 并添加 qwen 配置</li>
              <li>实现 activate() 和可选的 deactivate()</li>
              <li>注册命令、工具或 MCP 服务器</li>
              <li>测试: <code>qwen ext install ./</code></li>
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
    </div>
  );
}
