import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'extension', label: '扩展系统', description: 'MCP 与扩展系统的关系' },
  { id: 'tool-arch', label: '工具架构', description: 'MCP 工具如何融入工具系统' },
  { id: 'ide-integration', label: 'IDE 集成', description: 'VS Code MCP 服务器详解' },
  { id: 'subagent', label: '子代理系统', description: '子代理如何使用 MCP 工具' },
  { id: 'approval-mode', label: '审批模式', description: 'MCP 工具的权限控制' },
  { id: 'design-tradeoffs', label: '设计权衡', description: 'MCP 集成的架构决策' },
];

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--purple)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔌</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              MCP (Model Context Protocol) 是 Anthropic 提出的开放协议，定义了 AI 应用与外部工具/服务的标准通信方式。
              通过 MCP，CLI 可以动态发现和调用外部服务提供的工具，无需硬编码集成。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🔧 为什么需要 MCP</h4>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1">
              <li>• <strong>标准化</strong>：统一的工具描述和调用格式，任何 MCP 服务器都可被任何客户端使用</li>
              <li>• <strong>可扩展</strong>：IDE 集成、数据库访问、API 调用等都可以通过 MCP 服务提供</li>
              <li>• <strong>安全隔离</strong>：每个 MCP 服务运行在独立进程，权限可控</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🏗️ MCP 通信流程</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--purple)]/30 text-center">
                <div className="text-[var(--purple)] font-semibold text-sm">1. 发现</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">list_tools</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--cyber-blue)]/30 text-center">
                <div className="text-[var(--cyber-blue)] font-semibold text-sm">2. 注册</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Schema 解析</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--terminal-green)]/30 text-center">
                <div className="text-[var(--terminal-green)] font-semibold text-sm">3. 调用</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">call_tool</div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--amber)]/30 text-center">
                <div className="text-[var(--amber)] font-semibold text-sm">4. 响应</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">结果返回</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--purple)]">JSON-RPC</div>
              <div className="text-xs text-[var(--text-muted)]">通信协议</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--terminal-green)]">stdio</div>
              <div className="text-xs text-[var(--text-muted)]">传输层</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--amber)]">∞</div>
              <div className="text-xs text-[var(--text-muted)]">服务器数量</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--cyber-blue)]">IDE</div>
              <div className="text-xs text-[var(--text-muted)]">典型应用</div>
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-2 rounded flex items-center gap-2">
            <span>📁</span>
            <code>packages/core/src/tools/mcp-*.ts</code>
          </div>
        </div>
      )}
    </div>
  );
}

export function MCPIntegration() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  return (
    <div>
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      <h2 className="text-2xl text-cyan-400 mb-5">MCP (Model Context Protocol) 集成</h2>

      {/* MCP 概述 */}
      <Layer title="什么是 MCP？" icon="🌐">
        <HighlightBox title="Model Context Protocol" icon="📡" variant="blue">
          <p className="mb-2">
            <strong>MCP</strong> 是一个开放协议，允许 AI 应用与外部工具和数据源进行标准化通信。
            它定义了一套标准的 JSON-RPC 接口。
          </p>
          <p>
            通过 MCP，CLI 可以动态发现和使用外部服务提供的工具，而无需硬编码集成。
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🔌</div>
            <h4 className="text-cyan-400 font-bold">标准接口</h4>
            <p className="text-sm text-gray-400">统一的工具发现和调用协议</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h4 className="text-cyan-400 font-bold">动态发现</h4>
            <p className="text-sm text-gray-400">运行时发现可用工具</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
            <div className="text-3xl mb-2">🔐</div>
            <h4 className="text-cyan-400 font-bold">安全认证</h4>
            <p className="text-sm text-gray-400">支持多种认证方式</p>
          </div>
        </div>
      </Layer>

      {/* MCP 架构 */}
      <Layer title="MCP 架构" icon="🏗️">
        <div className="bg-black/30 rounded-xl p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-cyan-400/20 border border-cyan-400 rounded-lg px-6 py-3 w-full max-w-md text-center">
              <strong>CLI (MCP Client)</strong>
              <div className="text-xs text-gray-400">发起工具调用请求</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-cyan-400">↓</div>
              <span className="text-xs text-gray-400">JSON-RPC</span>
              <div className="text-cyan-400">↓</div>
            </div>

            <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-6 py-3 w-full max-w-md text-center">
              <strong>McpClientManager</strong>
              <div className="text-xs text-gray-400">管理多个 MCP 服务器连接</div>
            </div>

            <div className="text-cyan-400">↓</div>

            <div className="flex gap-4 flex-wrap justify-center">
              <div className="bg-green-400/20 border border-green-400 rounded-lg px-4 py-2 text-center">
                <div className="text-sm text-green-400">MCP Server 1</div>
                <div className="text-xs text-gray-400">文件系统</div>
              </div>
              <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-4 py-2 text-center">
                <div className="text-sm text-blue-400">MCP Server 2</div>
                <div className="text-xs text-gray-400">数据库</div>
              </div>
              <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-4 py-2 text-center">
                <div className="text-sm text-orange-400">MCP Server 3</div>
                <div className="text-xs text-gray-400">Web API</div>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* McpClientManager */}
      <Layer title="McpClientManager" icon="🔧">
        <CodeBlock
          title="packages/core/src/tools/mcp-client-manager.ts"
          code={`// 管理多个 MCP 客户端的生命周期
export class McpClientManager {
    private clients: Map<string, McpClient> = new Map();
    private readonly toolRegistry: ToolRegistry;
    private readonly cliConfig: Config;
    private discoveryState: MCPDiscoveryState = MCPDiscoveryState.NOT_STARTED;

    constructor(
        toolRegistry: ToolRegistry,
        cliConfig: Config,
        eventEmitter?: EventEmitter,
    ) { ... }

    // 启动扩展的 MCP 服务器
    async startExtension(extension: GeminiCLIExtension) {
        await Promise.all(
            Object.entries(extension.mcpServers ?? {}).map(([name, config]) =>
                this.maybeDiscoverMcpServer(name, { ...config, extension }),
            ),
        );
    }

    // 发现 MCP 服务器的工具
    async maybeDiscoverMcpServer(name: string, config: MCPServerConfig) {
        const client = new McpClient(name, config, ...);
        await client.connect();
        // 工具自动注册到 toolRegistry
        this.clients.set(name, client);
    }

    // 获取客户端
    getClient(serverName: string): McpClient | undefined {
        return this.clients.get(serverName);
    }
}`}
        />

        <HighlightBox title="MCPDiscoveryState 状态" icon="📊" variant="blue">
          <ul className="pl-5 list-disc space-y-1 text-sm">
            <li><code className="text-cyan-400">NOT_STARTED</code> - 发现尚未开始</li>
            <li><code className="text-yellow-400">IN_PROGRESS</code> - 发现进行中</li>
            <li><code className="text-green-400">COMPLETED</code> - 发现已完成</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* MCP 配置 */}
      <Layer title="MCP 服务器配置" icon="⚙️">
        <JsonBlock
          code={`// ~/.gemini/settings.json (或项目级 .gemini/settings.json)
{
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem"],
            "env": {
                "ALLOWED_PATHS": "/home/user/projects"
            }
        },
        "github": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-github"],
            "env": {
                "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
            }
        },
        "remote-api": {
            "url": "http://localhost:3000/mcp",
            "type": "sse"
        }
    }
}`}
        />

        <HighlightBox title="MCPServerConfig 配置选项" icon="📋" variant="green">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-green-400 mb-2">传输方式</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• <code className="text-cyan-400">command + args</code>: stdio 本地进程</li>
                <li>• <code className="text-cyan-400">url + type:'sse'</code>: SSE 远程连接</li>
                <li>• <code className="text-cyan-400">url + type:'http'</code>: HTTP 流式传输</li>
                <li>• <code className="text-cyan-400">tcp</code>: WebSocket 连接</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-green-400 mb-2">通用配置</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• <code className="text-cyan-400">env</code>: 环境变量</li>
                <li>• <code className="text-cyan-400">timeout</code>: 超时时间</li>
                <li>• <code className="text-cyan-400">trust</code>: 信任模式</li>
                <li>• <code className="text-cyan-400">includeTools/excludeTools</code>: 工具过滤</li>
              </ul>
            </div>
          </div>
        </HighlightBox>
      </Layer>

      {/* MCP 工具发现 */}
      <Layer title="工具发现流程" icon="🔍">
        <CodeBlock
          title="工具发现"
          code={`// 1. 发送 tools/list 请求
const response = await client.request({
    method: 'tools/list',
    params: {}
});

// 2. 响应包含工具列表
{
    "tools": [
        {
            "name": "read_file",
            "description": "读取文件内容",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "文件路径"
                    }
                },
                "required": ["path"]
            }
        },
        {
            "name": "write_file",
            "description": "写入文件",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "path": { "type": "string" },
                    "content": { "type": "string" }
                },
                "required": ["path", "content"]
            }
        }
    ]
}`}
        />
      </Layer>

      {/* MCP 工具调用 */}
      <Layer title="工具调用流程" icon="⚡">
        <CodeBlock
          title="调用 MCP 工具"
          code={`// 1) 模型返回 functionCall（Gemini / GenAI SDK）
// 注意：工具名来自 ToolRegistry 暴露给模型的 FunctionDeclaration.name
{
  role: "model",
  parts: [{
    functionCall: {
      name: "filesystem__read_file",       // 发生命名冲突时会自动加 serverName__ 前缀
      args: { path: "/home/user/file.txt" } // 参数形状来自 MCP server 的 inputSchema
    }
  }]
}

// 2) ToolScheduler 路由到 DiscoveredMCPTool（无需通过前缀做字符串判断）
const tool = toolRegistry.getToolByName("filesystem__read_file");
if (tool instanceof DiscoveredMCPTool) {
  // 3) 由 DiscoveredMCPToolInvocation 负责把调用转发给 MCP server
  // - 对策略检查使用 composite name: "<serverName>__<serverToolName>"
  // - 对 MCP server 调用使用原始 tool 名（serverToolName）
  const result = await tool.execute({ path: "/home/user/file.txt" }, signal);
}

// 4) MCP 返回 CallToolResult（content blocks）
{
  content: [{ type: "text", text: "文件内容..." }]
}`}
        />
      </Layer>

      {/* MCPTool 包装 */}
      <Layer title="MCPTool 包装类" icon="📦">
        <CodeBlock
          title="DiscoveredMCPTool"
          code={`// packages/core/src/tools/mcp-tool.ts（关键片段）
class DiscoveredMCPTool extends BaseDeclarativeTool {
  constructor(
    private readonly mcpTool: CallableTool,
    readonly serverName: string,
    readonly serverToolName: string,
    description: string,
    readonly parameterSchema: unknown,
    messageBus: MessageBus,
    readonly trust?: boolean,
    nameOverride?: string,
    private readonly cliConfig?: Config,
  ) {
    super(
      nameOverride ?? generateValidName(serverToolName), // LLM 可见名称
      \`\${serverToolName} (\${serverName} MCP Server)\`,
      description,
      Kind.Other,
      parameterSchema,
      messageBus,
      true,  // isOutputMarkdown
      false, // canUpdateOutput
    );
  }

  // 当工具名发生冲突时，ToolRegistry 会把 MCP 工具升级为 fully-qualified 名称
  // 形如：<serverName>__<serverToolName>
  asFullyQualifiedTool(): DiscoveredMCPTool {
    return new DiscoveredMCPTool(
      this.mcpTool,
      this.serverName,
      this.serverToolName,
      this.description,
      this.parameterSchema,
      this.messageBus,
      this.trust,
      \`\${this.serverName}__\${this.serverToolName}\`,
      this.cliConfig,
    );
  }

  protected createInvocation(
    params: ToolParams,
    messageBus: MessageBus,
    _toolName?: string,
    _displayName?: string,
  ): ToolInvocation {
    return new DiscoveredMCPToolInvocation(
      this.mcpTool,
      this.serverName,
      this.serverToolName,
      _displayName ?? this.displayName,
      messageBus,
      this.trust,
      params ?? {},
      this.cliConfig,
    );
  }
}

class DiscoveredMCPToolInvocation extends BaseToolInvocation {
  constructor(
    private readonly mcpTool: CallableTool,
    private readonly serverName: string,
    private readonly serverToolName: string,
    displayName: string,
    messageBus: MessageBus,
    trust: boolean | undefined,
    params: Record<string, unknown> = {},
    private readonly cliConfig?: Config,
  ) {
    // 策略检查使用 composite 名称：<serverName>__<serverToolName>
    super(params, messageBus, \`\${serverName}__\${serverToolName}\`, displayName, serverName);
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    // MCP server 调用仍使用原始 tool 名（serverToolName）
    const functionCalls = [{ name: this.serverToolName, args: this.params }];
    const rawParts = await this.mcpTool.callTool(functionCalls);
    return {
      llmContent: transformMcpContentToParts(rawParts),
      returnDisplay: getStringifiedResultForDisplay(rawParts),
    };
  }
}`}
        />
      </Layer>

      {/* 认证提供者 */}
      <Layer title="认证提供者" icon="🔐">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-cyan-400 font-bold mb-2">Google OAuth</h4>
            <code className="text-xs text-gray-400 block mb-2">
              google-auth-provider.ts
            </code>
            <p className="text-sm text-gray-300">
              使用 Google OAuth2 认证，适用于 Google 服务
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-purple-400 font-bold mb-2">通用 OAuth</h4>
            <code className="text-xs text-gray-400 block mb-2">
              oauth-provider.ts
            </code>
            <p className="text-sm text-gray-300">
              支持标准 OAuth2 流程，适用于第三方服务
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-green-400 font-bold mb-2">服务账户</h4>
            <code className="text-xs text-gray-400 block mb-2">
              sa-impersonation-provider.ts
            </code>
            <p className="text-sm text-gray-300">
              服务账户模拟，适用于服务器端场景
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-orange-400 font-bold mb-2">Token 存储</h4>
            <code className="text-xs text-gray-400 block mb-2">
              token-storage/
            </code>
            <p className="text-sm text-gray-300">
              安全存储令牌（Keychain、文件系统、混合）
            </p>
          </div>
        </div>
      </Layer>

      {/* IDE 集成 */}
      <Layer title="IDE 集成 (VS Code MCP)" icon="💻">
        <HighlightBox title="VS Code IDE Companion" icon="🔗" variant="purple">
          <p className="mb-2">
            <code className="bg-black/30 px-1 rounded">packages/vscode-ide-companion/</code>
            是一个 VS Code 扩展，它提供了一个 MCP 服务器，让 CLI 可以访问 VS Code 的工作区。
          </p>
        </HighlightBox>

        <CodeBlock
          title="VS Code MCP 提供的工具"
          code={`// VS Code IDE Companion 提供的工具

1. vscode_get_open_files
   - 获取当前打开的文件列表

2. vscode_get_active_file
   - 获取当前活动文件内容

3. vscode_get_selection
   - 获取当前选中的文本

4. vscode_get_diagnostics
   - 获取诊断信息（错误、警告）

5. vscode_execute_command
   - 执行 VS Code 命令`}
        />
      </Layer>

      {/* MCP 生态系统 */}
      <Layer title="MCP 生态系统" icon="🌍">
        <div className="space-y-3">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-bold mb-2">官方 MCP 服务器</h4>
            <ul className="text-sm space-y-1">
              <li>• <strong>@anthropic/mcp-server-filesystem</strong> - 文件系统操作</li>
              <li>• <strong>@anthropic/mcp-server-github</strong> - GitHub API</li>
              <li>• <strong>@anthropic/mcp-server-postgres</strong> - PostgreSQL 查询</li>
              <li>• <strong>@anthropic/mcp-server-brave-search</strong> - Brave 搜索</li>
            </ul>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">社区 MCP 服务器</h4>
            <ul className="text-sm space-y-1">
              <li>• 数据库工具（MySQL、MongoDB、Redis）</li>
              <li>• 云服务集成（AWS、GCP、Azure）</li>
              <li>• 开发工具（Docker、Kubernetes）</li>
              <li>• 自定义业务工具</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* ==================== 深化内容 ==================== */}

      {/* 边界条件深度解析 */}
      <Layer title="边界条件深度解析" icon="🔬">
        <div className="space-y-6">
          {/* 边界 1: MCP 服务器启动超时 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-red-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-red-400 font-bold">边界 1: MCP 服务器启动超时</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• MCP 服务器进程启动缓慢（如需要下载依赖的 npx 命令）</li>
                  <li>• 服务器初始化时执行耗时操作（数据库连接、大量文件扫描）</li>
                  <li>• 系统资源紧张导致进程调度延迟</li>
                </ul>
              </div>
              <CodeBlock
                title="超时处理源码"
                code={`// packages/core/src/mcp/mcp-client.ts
const CONNECTION_TIMEOUT = 30_000; // 30秒默认超时

async connect(): Promise<void> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('MCP server connection timeout')),
               CONNECTION_TIMEOUT);
  });

  try {
    await Promise.race([
      this.establishConnection(),
      timeoutPromise
    ]);
  } catch (error) {
    // 超时时需要清理已启动的进程
    if (this.process) {
      this.process.kill('SIGTERM');
      await this.waitForProcessExit();
    }
    throw error;
  }
}`}
              />
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <h5 className="text-amber-400 text-sm font-semibold mb-1">⚠️ 潜在问题</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 僵尸进程：如果 SIGTERM 后进程未退出，可能留下孤儿进程</li>
                  <li>• 资源泄漏：子进程的 stdio 管道可能未正确关闭</li>
                  <li>• 状态不一致：discoveredTools Map 可能包含部分无效条目</li>
                </ul>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                <h5 className="text-green-400 text-sm font-semibold mb-1">✅ 正确处理</h5>
                <CodeBlock
                  code={`// 完整的超时清理流程
async cleanupOnTimeout() {
  if (this.process) {
    // 1. 先发送 SIGTERM 允许优雅退出
    this.process.kill('SIGTERM');

    // 2. 等待一段时间
    const exited = await Promise.race([
      this.waitForProcessExit(),
      sleep(5000).then(() => false)
    ]);

    // 3. 如果还没退出，强制 SIGKILL
    if (!exited && this.process.exitCode === null) {
      this.process.kill('SIGKILL');
    }

    // 4. 关闭所有管道
    this.process.stdin?.destroy();
    this.process.stdout?.destroy();
    this.process.stderr?.destroy();
  }

  // 5. 清理内部状态
  this.connected = false;
  this.pendingRequests.clear();
}`}
                />
              </div>
            </div>
          </div>

          {/* 边界 2: 工具名称冲突 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-amber-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-amber-400 font-bold">边界 2: 工具名称冲突</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 两个 MCP 服务器提供同名工具（如都有 `read_file`）</li>
                  <li>• MCP 工具名与内置工具名冲突（如 MCP 服务器提供 `run_shell_command` 工具）</li>
                  <li>• 同一服务器重复注册导致名称冲突</li>
                </ul>
              </div>
              <CodeBlock
                title="命名空间隔离机制"
                code={`// ToolRegistry：当 MCP 工具名与现有工具冲突时，自动加命名空间
// 格式：<serverName>__<serverToolName>
// 例：filesystem 的 read_file 与内置 read_file 冲突 → filesystem__read_file

// packages/core/src/tools/tool-registry.ts（关键片段）
registerTool(tool: AnyDeclarativeTool): void {
  if (this.allKnownTools.has(tool.name)) {
    if (tool instanceof DiscoveredMCPTool) {
      tool = tool.asFullyQualifiedTool(); // <serverName>__<serverToolName>
    } else {
      debugLogger.warn(\`Tool "\${tool.name}" already registered. Overwriting.\`);
    }
  }
  this.allKnownTools.set(tool.name, tool);
}

// McpClientManager：同名 server 的配置不会“静默合并”，会被跳过并提示
// packages/core/src/tools/mcp-client-manager.ts（关键片段）
if (existing && existing.getServerConfig().extension !== config.extension) {
  debugLogger.warn(\`Skipping MCP config for server "\${name}" as it already exists.\`);
  return;
}`}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                  <h5 className="text-red-400 text-sm font-semibold mb-1">❌ 冲突情况</h5>
                  <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">{`servers.json:
[
  { "name": "fs", "command": "..." },
  { "name": "fs", "command": "..." }
]
// 第二个会覆盖第一个！`}</pre>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <h5 className="text-green-400 text-sm font-semibold mb-1">✅ 正确配置</h5>
                  <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">{`servers.json:
[
  { "name": "fs-local", "command": "..." },
  { "name": "fs-remote", "command": "..." }
]
// 不同名称，各自独立`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* 边界 3: JSON-RPC 消息解析失败 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-purple-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-purple-400 font-bold">边界 3: JSON-RPC 消息解析失败</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• MCP 服务器向 stderr 输出调试信息混入 stdout</li>
                  <li>• 服务器发送了非 JSON 格式的响应（如错误堆栈）</li>
                  <li>• 消息被截断（缓冲区溢出或管道断开）</li>
                  <li>• 服务器使用了不兼容的 JSON-RPC 版本</li>
                </ul>
              </div>
              <CodeBlock
                title="消息解析与错误处理"
                code={`// packages/core/src/mcp/json-rpc-transport.ts

class JsonRpcTransport {
  private buffer = '';

  onData(chunk: string) {
    this.buffer += chunk;

    // 尝试解析完整的 JSON-RPC 消息
    while (true) {
      const newlineIndex = this.buffer.indexOf('\\n');
      if (newlineIndex === -1) break;

      const line = this.buffer.slice(0, newlineIndex);
      this.buffer = this.buffer.slice(newlineIndex + 1);

      if (!line.trim()) continue;

      try {
        const message = JSON.parse(line);
        this.handleMessage(message);
      } catch (error) {
        // 解析失败的处理策略
        if (this.isLikelyDebugOutput(line)) {
          // 调试输出，记录但不中断
          console.debug('[MCP Debug]', line);
        } else if (this.isPartialJson(line)) {
          // 可能是不完整的 JSON，放回缓冲区
          this.buffer = line + '\\n' + this.buffer;
          break;
        } else {
          // 真正的解析错误
          this.emit('parseError', { line, error });
        }
      }
    }
  }

  private isLikelyDebugOutput(line: string): boolean {
    // 常见的调试输出模式
    return /^\\[DEBUG\\]|^\\[INFO\\]|^\\[WARN\\]|^#/.test(line);
  }
}`}
              />
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-3">
                <h5 className="text-cyan-400 text-sm font-semibold mb-1">💡 调试技巧</h5>
                <p className="text-xs text-[var(--text-muted)]">
                  设置 <code className="bg-black/30 px-1 rounded">DEBUG=mcp:*</code> 环境变量可以看到原始的 JSON-RPC 消息流，
                  帮助诊断解析问题。
                </p>
              </div>
            </div>
          </div>

          {/* 边界 4: 连接断开与重连 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-cyan-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-cyan-400 font-bold">边界 4: 连接断开与重连</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• MCP 服务器进程崩溃</li>
                  <li>• 远程 HTTP/WebSocket 连接断开</li>
                  <li>• 服务器主动关闭连接（如空闲超时）</li>
                  <li>• 系统休眠后唤醒</li>
                </ul>
              </div>
              <CodeBlock
                title="重连机制"
                code={`// packages/core/src/mcp/mcp-client.ts

class MCPClient {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000; // 初始 1 秒

  onDisconnect() {
    this.connected = false;

    // 通知所有等待中的请求
    for (const [id, pending] of this.pendingRequests) {
      pending.reject(new Error('Connection lost'));
    }
    this.pendingRequests.clear();

    // 尝试重连
    this.attemptReconnect();
  }

  private async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnectFailed', {
        attempts: this.reconnectAttempts,
        server: this.serverName
      });
      return;
    }

    this.reconnectAttempts++;

    // 指数退避
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    await sleep(delay);

    try {
      await this.connect();
      this.reconnectAttempts = 0; // 重置计数
      this.emit('reconnected', { server: this.serverName });

      // 重新发现工具（服务器重启后工具可能变化）
      await this.refreshTools();
    } catch (error) {
      this.attemptReconnect(); // 继续尝试
    }
  }
}`}
              />
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-2xl font-bold text-cyan-400">3</div>
                  <div className="text-xs text-[var(--text-muted)]">最大重连次数</div>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-2xl font-bold text-amber-400">1-4s</div>
                  <div className="text-xs text-[var(--text-muted)]">指数退避延迟</div>
                </div>
              </div>
            </div>
          </div>

          {/* 边界 5: 环境变量解析 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-green-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-green-400 font-bold">边界 5: 环境变量解析与安全</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 配置中使用 <code className="bg-black/30 px-1 rounded">${'${ENV_VAR}'}</code> 语法引用未定义的环境变量</li>
                  <li>• 环境变量包含特殊字符（空格、引号、换行）</li>
                  <li>• 敏感信息意外暴露在日志中</li>
                </ul>
              </div>
              <CodeBlock
                title="环境变量解析"
                code={`// packages/core/src/mcp/config-loader.ts

function resolveEnvVariables(config: MCPServerConfig): MCPServerConfig {
  const env: Record<string, string> = {};

  for (const [key, value] of Object.entries(config.env || {})) {
    // 匹配 \${VAR_NAME} 模式
    const resolved = value.replace(/\\$\\{([^}]+)\\}/g, (_, varName) => {
      const envValue = process.env[varName];

      if (envValue === undefined) {
        // 未定义的环境变量处理
        console.warn(\`[MCP Config] Environment variable '\${varName}' is not defined\`);
        return ''; // 返回空字符串而非保留原样
      }

      return envValue;
    });

    env[key] = resolved;
  }

  return { ...config, env };
}

// 安全考虑：日志中隐藏敏感信息
function sanitizeForLogging(config: MCPServerConfig): MCPServerConfig {
  const sensitiveKeys = ['TOKEN', 'KEY', 'SECRET', 'PASSWORD', 'CREDENTIAL'];
  const sanitized = { ...config, env: { ...config.env } };

  for (const key of Object.keys(sanitized.env || {})) {
    if (sensitiveKeys.some(s => key.toUpperCase().includes(s))) {
      sanitized.env[key] = '[REDACTED]';
    }
  }

  return sanitized;
}`}
              />
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                <h5 className="text-red-400 text-sm font-semibold mb-1">🔐 安全警告</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 永远不要在配置文件中硬编码敏感信息</li>
                  <li>• 使用环境变量或密钥管理服务</li>
                  <li>• 检查 MCP 服务器的安全性（是否泄露 token）</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 边界 6: Schema 验证失败 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-orange-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-orange-400 font-bold">边界 6: 工具 Schema 验证失败</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-[var(--bg-card)] p-3 rounded">
                <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🎯 触发场景</h5>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• MCP 服务器返回的工具 schema 不符合 JSON Schema 规范</li>
                  <li>• AI 模型传入的参数不符合工具定义的 schema</li>
                  <li>• Schema 中使用了 CLI 不支持的高级特性（$ref、allOf 等）</li>
                </ul>
              </div>
              <CodeBlock
                title="Schema 验证流程"
                code={`// packages/core/src/mcp/schema-validator.ts

import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,      // 收集所有错误而非第一个
  strict: false,        // 允许某些不严格的 schema
  validateFormats: true // 验证格式（email、uri 等）
});

function validateToolInput(tool: MCPTool, input: unknown): ValidationResult {
  const schema = tool.inputSchema;

  // 1. 检查 schema 本身是否有效
  if (!ajv.validateSchema(schema)) {
    return {
      valid: false,
      error: 'Invalid tool schema: ' + ajv.errorsText(ajv.errors)
    };
  }

  // 2. 编译并缓存验证器
  let validate = ajv.getSchema(tool.name);
  if (!validate) {
    validate = ajv.compile(schema);
  }

  // 3. 验证输入
  if (!validate(input)) {
    return {
      valid: false,
      error: ajv.errorsText(validate.errors),
      details: validate.errors
    };
  }

  return { valid: true };
}

// 处理验证失败
if (!result.valid) {
  // 不直接失败，而是让 AI 知道参数有问题
  return {
    llmContent: \`Tool call failed: \${result.error}. Please check the parameters.\`,
    isError: true
  };
}`}
              />
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <h5 className="text-amber-400 text-sm font-semibold mb-1">💡 最佳实践</h5>
                <p className="text-xs text-[var(--text-muted)]">
                  Schema 验证失败时，将错误信息反馈给 AI 模型而非直接抛出异常，让 AI 有机会修正参数重试。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 常见问题与调试技巧 */}
      <Layer title="常见问题与调试技巧" icon="🐛">
        <div className="space-y-6">
          {/* 问题 1 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-red-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-red-400 font-bold">问题 1: MCP 服务器无法启动</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🔍 常见原因</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>• 命令或路径不存在</li>
                    <li>• 缺少必要的环境变量</li>
                    <li>• npx 需要先下载包</li>
                    <li>• 端口被占用（HTTP 模式）</li>
                    <li>• 权限不足</li>
                  </ul>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🛠️ 排查步骤</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>1. 手动运行启动命令测试</li>
                    <li>2. 检查 stderr 输出</li>
                    <li>3. 验证环境变量已设置</li>
                    <li>4. 检查网络连接</li>
                    <li>5. 查看进程是否存在</li>
                  </ul>
                </div>
              </div>
              <CodeBlock
                title="手动测试 MCP 服务器"
                code={`# 1. 手动运行命令，观察输出
npx -y @anthropic/mcp-server-filesystem

# 2. 检查进程
ps aux | grep mcp

# 3. 测试 stdio 通信
echo '{"jsonrpc":"2.0","method":"initialize","id":1,"params":{}}' | npx -y @anthropic/mcp-server-filesystem

# 4. 检查端口占用（HTTP 模式）
lsof -i :3000

# 5. 查看详细日志
DEBUG=mcp:* gemini`}
              />
            </div>
          </div>

          {/* 问题 2 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-amber-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-amber-400 font-bold">问题 2: 工具调用总是失败</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🔍 常见原因</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>• 参数格式不正确</li>
                    <li>• 工具需要的资源不存在</li>
                    <li>• 认证失效或权限不足</li>
                    <li>• 服务器内部错误</li>
                    <li>• 超时设置过短</li>
                  </ul>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🛠️ 排查步骤</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>1. 检查完整错误消息</li>
                    <li>2. 验证参数是否符合 schema</li>
                    <li>3. 手动测试相同操作</li>
                    <li>4. 检查认证状态</li>
                    <li>5. 增加超时时间测试</li>
                  </ul>
                </div>
              </div>
              <CodeBlock
                title="调试工具调用"
                code={`// 在代码中启用详细日志
process.env.DEBUG = 'mcp:*';

// 或者在 MCPClient 中添加拦截器
class MCPClient {
  async callTool(name: string, args: object) {
    console.log('[MCP] Calling tool:', name);
    console.log('[MCP] Arguments:', JSON.stringify(args, null, 2));

    try {
      const result = await this._callTool(name, args);
      console.log('[MCP] Result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('[MCP] Error:', error);
      throw error;
    }
  }
}`}
              />
            </div>
          </div>

          {/* 问题 3 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-purple-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-purple-400 font-bold">问题 3: 工具发现不完整</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🔍 常见原因</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>• 服务器的 tools/list 实现不完整</li>
                    <li>• 工具需要认证后才可见</li>
                    <li>• 动态工具未完成初始化</li>
                    <li>• Schema 解析失败导致跳过</li>
                  </ul>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🛠️ 排查步骤</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>1. 直接调用 tools/list 检查响应</li>
                    <li>2. 查看 CLI 的工具注册日志</li>
                    <li>3. 验证认证状态</li>
                    <li>4. 等待服务器完全初始化</li>
                  </ul>
                </div>
              </div>
              <CodeBlock
                title="检查已发现的工具"
                code={`# 在 CLI 中查看已注册的 MCP 工具
gemini mcp list

# 输出示例:
# MCP Servers:
#   - filesystem (connected)
#     Tools: read_file, write_file, list_directory
#   - github (connected)
#     Tools: search_repos, get_issue, create_pr
#   - custom (error: connection failed)

# 手动调用 tools/list
echo '{"jsonrpc":"2.0","method":"tools/list","id":1,"params":{}}' \\
  | npx -y @anthropic/mcp-server-filesystem`}
              />
            </div>
          </div>

          {/* 问题 4 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-cyan-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-cyan-400 font-bold">问题 4: VS Code IDE Companion 连接失败</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🔍 常见原因</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>• VS Code 扩展未安装或未启用</li>
                    <li>• 扩展版本与 CLI 不兼容</li>
                    <li>• VS Code 窗口已关闭</li>
                    <li>• 端口被其他进程占用</li>
                    <li>• 防火墙阻止本地连接</li>
                  </ul>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded">
                  <h5 className="text-[var(--text-secondary)] text-sm font-semibold mb-2">🛠️ 排查步骤</h5>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    <li>1. 检查扩展是否已安装并启用</li>
                    <li>2. 在 VS Code 中查看扩展输出</li>
                    <li>3. 确认版本兼容性</li>
                    <li>4. 重启 VS Code</li>
                    <li>5. 检查本地网络设置</li>
                  </ul>
                </div>
              </div>
              <CodeBlock
                title="VS Code IDE Companion 调试"
                code={`# 1. 检查扩展状态
# 在 VS Code 中：View -> Output -> 选择 "Gemini IDE Companion"

# 2. 查看扩展日志
# 在 VS Code 中：Help -> Toggle Developer Tools -> Console

# 3. 手动测试连接
curl http://localhost:9876/health

# 4. 检查端口
lsof -i :9876

# 5. 在 CLI 中强制重连
gemini mcp reconnect vscode`}
              />
            </div>
          </div>

          {/* 调试工具参考表 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--bg-card)]">
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">调试场景</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">命令/方法</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">说明</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">启用调试日志</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">DEBUG=mcp:* gemini</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">输出所有 MCP 相关日志</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">查看 MCP 状态</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">gemini mcp status</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">显示所有服务器连接状态</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">列出已发现工具</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">gemini mcp list</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">列出所有 MCP 工具</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">重连服务器</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">gemini mcp reconnect [name]</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">断开并重新连接指定服务器</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">测试工具调用</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">gemini mcp call [tool] [args]</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">手动调用 MCP 工具</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">查看配置</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">gemini mcp config</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">显示当前 MCP 配置</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">JSON-RPC 跟踪</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">DEBUG=jsonrpc:* gemini</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">显示原始 JSON-RPC 消息</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* 性能优化建议 */}
      <Layer title="性能优化建议" icon="⚡">
        <div className="space-y-6">
          {/* 优化 1: 连接池与复用 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-cyan-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-cyan-400 font-bold">优化 1: 连接池与复用</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                MCP 连接的建立开销较大（进程启动、握手、工具发现），应尽量复用现有连接。
              </p>
              <CodeBlock
                title="连接池实现"
                code={`// packages/core/src/mcp/connection-pool.ts

class MCPConnectionPool {
  private pool: Map<string, MCPClient> = new Map();
  private lastActivity: Map<string, number> = new Map();
  private idleTimeout = 5 * 60 * 1000; // 5分钟空闲超时

  async getConnection(serverName: string): Promise<MCPClient> {
    // 1. 检查现有连接
    const existing = this.pool.get(serverName);
    if (existing?.isConnected) {
      this.lastActivity.set(serverName, Date.now());
      return existing;
    }

    // 2. 创建新连接
    const client = await this.createConnection(serverName);
    this.pool.set(serverName, client);
    this.lastActivity.set(serverName, Date.now());

    return client;
  }

  // 定期清理空闲连接
  private cleanupIdleConnections() {
    const now = Date.now();
    for (const [name, lastTime] of this.lastActivity) {
      if (now - lastTime > this.idleTimeout) {
        this.pool.get(name)?.disconnect();
        this.pool.delete(name);
        this.lastActivity.delete(name);
      }
    }
  }
}`}
              />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-xl font-bold text-red-400">~500ms</div>
                  <div className="text-xs text-[var(--text-muted)]">新建连接耗时</div>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-xl font-bold text-green-400">~10ms</div>
                  <div className="text-xs text-[var(--text-muted)]">复用连接耗时</div>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-xl font-bold text-cyan-400">50x</div>
                  <div className="text-xs text-[var(--text-muted)]">性能提升</div>
                </div>
              </div>
            </div>
          </div>

          {/* 策略 2: Trusted Folder gate + 发现队列 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-purple-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-purple-400 font-bold">策略 2: Trusted Folder gate + 发现队列</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                上游实现不会在“非可信文件夹”里自动连接/发现 MCP 服务器；在可信文件夹内则会按队列串行触发发现，避免并发重复发现造成状态竞争。
              </p>
              <CodeBlock
                title="上游实现（关键片段）"
                code={`// packages/core/src/tools/mcp-client-manager.ts（关键片段）
maybeDiscoverMcpServer(name: string, config: MCPServerConfig) {
  // 1) allow/blocked 名单过滤（settings.mcp.allowed / settings.mcp.excluded）
  if (!this.isAllowedMcpServer(name)) return;

  // 2) 非可信文件夹：直接跳过 MCP discovery
  if (!this.cliConfig.isTrustedFolder()) return;

  // 3) 扩展未启用：跳过
  if (config.extension && !config.extension.isActive) return;

  // 4) 同名 server 冲突：跳过并提示（避免覆盖）
  const existing = this.clients.get(name);
  if (existing && existing.getServerConfig().extension !== config.extension) {
    debugLogger.warn(\`Skipping MCP config for server "\${name}" as it already exists.\`);
    return;
  }

  // 5) 串行发现队列：上一轮 discovery 完成后再开始下一轮
  const currentDiscovery = (async () => {
    const client = existing ?? new McpClient(name, config, toolRegistry, ...);
    if (!existing) this.clients.set(name, client);

    await client.connect();
    await client.discover(this.cliConfig);
  })();

  this.discoveryPromise = this.discoveryPromise
    ? this.discoveryPromise.catch(() => {}).then(() => currentDiscovery)
    : currentDiscovery;
}`}
              />
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <h5 className="text-amber-400 text-sm font-semibold mb-1">⚠️ 权衡</h5>
                <p className="text-xs text-[var(--text-muted)]">
                  Trusted Folder gate 会让“未信任目录”下的 MCP 能力不可用，但能显著降低风险并减少不必要的外部进程/网络连接。
                </p>
              </div>
            </div>
          </div>

          {/* 优化 3: 批量工具调用 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-green-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-green-400 font-bold">优化 3: 批量工具调用</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                当 AI 请求多个 MCP 工具调用时，可以并行执行以减少总等待时间。
              </p>
              <CodeBlock
                title="并行调用实现"
                code={`// packages/core/src/mcp/batch-executor.ts

async function executeMCPToolsBatch(
  calls: ToolCall[],
  manager: MCPClientManager
): Promise<ToolResult[]> {
  // 按服务器分组
  const byServer = groupBy(calls, c => c.serverName);

  // 并行执行每个服务器的调用
  const results = await Promise.all(
    Object.entries(byServer).map(async ([server, serverCalls]) => {
      // 同一服务器内也可以并行（如果服务器支持）
      const client = manager.getClient(server);

      if (client.supportsBatchCalls) {
        // 服务器支持批量调用
        return client.batchCall(serverCalls);
      } else {
        // 顺序执行（避免并发问题）
        const results = [];
        for (const call of serverCalls) {
          results.push(await client.callTool(call));
        }
        return results;
      }
    })
  );

  return results.flat();
}

// 使用示例
const toolCalls = [
  { name: 'filesystem__read_file', args: { path: '/a.txt' } },
  { name: 'filesystem__read_file', args: { path: '/b.txt' } },
  { name: 'github__get_issue', args: { issue: 123 } }
];

// 并行执行：filesystem 的两个调用 + github 的一个调用
const results = await executeMCPToolsBatch(toolCalls, manager);`}
              />
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-xl font-bold text-red-400">300ms</div>
                  <div className="text-xs text-[var(--text-muted)]">串行: 3×100ms</div>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
                  <div className="text-xl font-bold text-green-400">~100ms</div>
                  <div className="text-xs text-[var(--text-muted)]">并行: max(100ms)</div>
                </div>
              </div>
            </div>
          </div>

          {/* 优化 4: Schema 缓存 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-amber-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-amber-400 font-bold">优化 4: Schema 缓存与预编译</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                工具 Schema 的解析和验证器编译是 CPU 密集型操作，应该缓存结果。
              </p>
              <CodeBlock
                title="Schema 缓存"
                code={`// packages/core/src/mcp/schema-cache.ts

class SchemaCache {
  private validators: Map<string, ValidateFunction> = new Map();
  private ajv = new Ajv();

  getValidator(toolName: string, schema: object): ValidateFunction {
    // 检查缓存
    const cached = this.validators.get(toolName);
    if (cached) {
      return cached;
    }

    // 编译并缓存
    const validator = this.ajv.compile(schema);
    this.validators.set(toolName, validator);

    return validator;
  }

  // 预热：启动时编译所有已知 schema
  async warmup(tools: MCPTool[]) {
    for (const tool of tools) {
      this.getValidator(tool.name, tool.inputSchema);
    }
  }

  // 内存优化：LRU 淘汰不常用的验证器
  private pruneIfNeeded() {
    if (this.validators.size > 1000) {
      // 删除最早添加的条目
      const firstKey = this.validators.keys().next().value;
      this.validators.delete(firstKey);
    }
  }
}`}
              />
            </div>
          </div>

          {/* 性能基准表 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--bg-card)]">
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">操作</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">未优化</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">优化后</th>
                  <th className="border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-primary)]">提升</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">CLI 启动（5 MCP 服务器）</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~2500ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~300ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">8.3x</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">工具调用（复用连接）</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~500ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~10ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">50x</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">3 个工具并行调用</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~300ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~100ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">3x</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">Schema 验证（缓存）</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~5ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~0.1ms</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">50x</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">空闲内存占用（5 服务器）</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-red-400">~150MB</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-green-400">~30MB</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2 text-cyan-400">5x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* 与其他模块的交互关系 */}
      <Layer title="与其他模块的交互关系" icon="🔗">
        <div className="space-y-6">
          {/* 依赖关系图 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">📊 MCP 系统依赖关系图</h4>
            <CodeBlock
              title="Mermaid 依赖图"
              code={`graph TB
    subgraph CLI["CLI 层"]
        REPL["REPL / 命令处理"]
        MCPCmd["mcp 命令"]
    end

    subgraph Core["Core 层"]
        Manager["MCPClientManager"]
        Client["MCPClient"]
        Transport["JsonRpcTransport"]
        ToolReg["Tool Registry"]
        Scheduler["Tool Scheduler"]
    end

    subgraph External["外部系统"]
        Server1["MCP Server 1"]
        Server2["MCP Server 2"]
        VSCode["VS Code Extension"]
    end

    subgraph Config["配置层"]
        Settings["Settings v2"]
        EnvLoader[".env 加载器"]
    end

    REPL --> Manager
    MCPCmd --> Manager
    Manager --> Client
    Client --> Transport
    Transport --> Server1
    Transport --> Server2
    Transport --> VSCode

    Manager --> ToolReg
    ToolReg --> Scheduler

    Settings --> Manager
    EnvLoader --> Client

    style Manager fill:#9333ea,color:#fff
    style Client fill:#3b82f6,color:#fff
    style ToolReg fill:#10b981,color:#fff`}
            />
          </div>

          {/* 上下游模块说明 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
              <h4 className="text-[var(--purple)] font-bold mb-3">⬆️ 上游依赖（MCP 依赖的模块）</h4>
              <div className="space-y-2">
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-purple-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">Settings v2</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    提供 MCP 服务器配置（servers.json 的加载与合并）
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-purple-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">.env 加载器</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    解析配置中的环境变量引用（如 ${'{GITHUB_TOKEN}'}）
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-purple-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">认证提供者</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    OAuth、Token 管理等认证机制
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
              <h4 className="text-[var(--terminal-green)] font-bold mb-3">⬇️ 下游消费者（依赖 MCP 的模块）</h4>
              <div className="space-y-2">
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-green-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">Tool Registry</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    将 MCP 发现的工具注册到全局工具注册表
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-green-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">Tool Scheduler</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    调度 MCP 工具的执行，处理确认流程
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-green-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">AI 交互层</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    将 MCP 工具 schema 提供给 AI 模型
                  </p>
                </div>
                <div className="bg-[var(--bg-card)] p-3 rounded border-l-4 border-green-500">
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">Subagent 系统</h5>
                  <p className="text-xs text-[var(--text-muted)]">
                    子代理可以使用 MCP 工具完成专门任务
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 关键接口 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">🔌 关键接口定义</h4>
            <CodeBlock
              title="MCP 模块导出接口"
              code={`// packages/core/src/mcp/index.ts

// 核心类
export { MCPClientManager } from './mcp-client-manager';
export { MCPClient } from './mcp-client';
export { DiscoveredMCPTool } from './discovered-mcp-tool';

// 类型定义
export interface MCPServerConfig {
  name: string;                    // 服务器唯一标识
  command?: string;                // 本地进程启动命令
  args?: string[];                 // 命令参数
  env?: Record<string, string>;    // 环境变量
  url?: string;                    // 远程服务器 URL
  auth?: MCPAuthConfig;            // 认证配置
  timeout?: number;                // 连接超时（毫秒）
}

export interface MCPToolDefinition {
  name: string;                    // 工具名称
  description: string;             // 工具描述
  inputSchema: JSONSchema;         // 参数 schema
}

export interface MCPToolResult {
  content: MCPContent[];           // 返回内容
  isError?: boolean;               // 是否为错误
}

export type MCPContent =
  | { type: 'text'; text: string }
  | { type: 'image'; data: string; mimeType: string }
  | { type: 'resource'; uri: string };

// 事件
export interface MCPEvents {
  'connected': { server: string };
  'disconnected': { server: string; reason: string };
  'toolDiscovered': { server: string; tool: MCPToolDefinition };
  'error': { server: string; error: Error };
}`}
            />
          </div>

          {/* 数据流 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">🔄 MCP 工具调用数据流</h4>
            <CodeBlock
              title="完整调用流程"
              code={`sequenceDiagram
    participant AI as AI 模型
    participant Scheduler as Tool Scheduler
    participant Manager as MCPClientManager
    participant Client as MCPClient
    participant Server as MCP Server

    AI->>Scheduler: 请求调用 filesystem__read_file
    Scheduler->>Scheduler: 检查是否需要确认
    Scheduler->>Manager: callTool("filesystem__read_file", args)
    Manager->>Manager: 解析服务器名 "filesystem"
    Manager->>Client: getClient("filesystem")

    alt 连接不存在
        Client->>Server: 建立连接
        Server-->>Client: 连接确认
        Client->>Server: tools/list
        Server-->>Client: 工具列表
    end

    Client->>Client: 验证参数 schema
    Client->>Server: tools/call {name, args}
    Server-->>Client: 执行结果
    Client-->>Manager: ToolResult
    Manager-->>Scheduler: ToolResult
    Scheduler-->>AI: 格式化结果`}
            />
          </div>

          {/* 扩展点 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-bold mb-3">🧩 扩展点</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border-subtle)]">
                <h5 className="text-[var(--cyber-blue)] font-semibold mb-2">自定义传输层</h5>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  除了 stdio 和 HTTP，可以实现自定义传输协议：
                </p>
                <CodeBlock
                  code={`interface Transport {
  connect(): Promise<void>;
  send(message: JsonRpcMessage): void;
  onMessage(handler: (msg: JsonRpcMessage) => void): void;
  close(): void;
}

// 示例：WebSocket 传输
class WebSocketTransport implements Transport {
  private ws: WebSocket;
  // ...
}`}
                />
              </div>

              <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border-subtle)]">
                <h5 className="text-[var(--amber)] font-semibold mb-2">工具结果转换器</h5>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  自定义 MCP 结果到 AI 消息的转换逻辑：
                </p>
                <CodeBlock
                  code={`interface ResultTransformer {
  canHandle(result: MCPToolResult): boolean;
  transform(result: MCPToolResult): LLMContent;
}

// 示例：图片结果转换
class ImageResultTransformer implements ResultTransformer {
  canHandle(result) {
    return result.content.some(c => c.type === 'image');
  }
  transform(result) {
    // 将图片内容转换为 AI 可理解的格式
  }
}`}
                />
              </div>

              <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border-subtle)]">
                <h5 className="text-[var(--terminal-green)] font-semibold mb-2">认证扩展</h5>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  实现自定义认证方式：
                </p>
                <CodeBlock
                  code={`interface AuthProvider {
  type: string;
  getHeaders(): Promise<Record<string, string>>;
  refresh(): Promise<void>;
}

// 示例：API Key 认证
class ApiKeyAuthProvider implements AuthProvider {
  type = 'api-key';
  async getHeaders() {
    return { 'X-API-Key': this.apiKey };
  }
}`}
                />
              </div>

              <div className="bg-[var(--bg-card)] p-4 rounded border border-[var(--border-subtle)]">
                <h5 className="text-[var(--purple)] font-semibold mb-2">中间件/拦截器</h5>
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  在工具调用前后添加处理逻辑：
                </p>
                <CodeBlock
                  code={`interface MCPMiddleware {
  beforeCall?(ctx: CallContext): Promise<void>;
  afterCall?(ctx: CallContext, result: ToolResult): Promise<ToolResult>;
  onError?(ctx: CallContext, error: Error): Promise<void>;
}

// 示例：日志中间件
class LoggingMiddleware implements MCPMiddleware {
  async beforeCall(ctx) {
    console.log('Calling:', ctx.toolName, ctx.args);
  }
  async afterCall(ctx, result) {
    console.log('Result:', result);
    return result;
  }
}`}
                />
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 为什么这样设计 MCP 集成 */}
      <Layer title="为什么这样设计 MCP 集成？" icon="💡">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">🔌 为什么选择 JSON-RPC over stdio？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：采用 JSON-RPC 2.0 作为消息格式，stdio 作为默认传输层。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>简单性</strong>：stdio 无需网络配置，进程直接通信，减少配置复杂度</li>
                <li><strong>安全性</strong>：本地进程通信避免网络暴露，不需要额外的认证机制</li>
                <li><strong>可调试</strong>：JSON 格式人类可读，便于开发和调试</li>
                <li><strong>跨平台</strong>：stdio 在所有操作系统上都有良好支持</li>
              </ul>
              <p><strong>权衡</strong>：牺牲了远程调用的便利性，但通过支持 HTTP/WebSocket 作为可选传输层来弥补。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🏷️ 为什么用 serverName__ 前缀命名工具？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p>
                <strong>决策</strong>：当 MCP 工具名与现有工具发生冲突时，ToolRegistry 会将其升级为{' '}
                <code className="bg-black/30 px-1 rounded">{'{serverName}'}__{'{toolName}'}</code>（fully-qualified）格式。
              </p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>命名空间隔离</strong>：避免与内置工具/其他扩展工具重名（冲突时才需要命名空间）</li>
                <li><strong>来源可追溯</strong>：当名称被升级后，模型与用户都能直观看到来源 server</li>
                <li><strong>策略表达力</strong>：Policy 支持 <code>{'{serverName}'}__*</code> 通配符，便于按 server 统一授权/拒绝</li>
              </ul>
              <p><strong>补充</strong>：执行/审批时不会依赖字符串前缀来“猜测来源”，而是通过工具对象本身（serverName 等元数据）做路由与展示。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🔄 为什么采用懒连接策略？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：MCP 服务器在首次需要时才启动连接，而非 CLI 启动时全部连接。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>启动速度</strong>：避免启动时等待所有服务器初始化，用户体验更好</li>
                <li><strong>资源效率</strong>：很多会话可能不会用到某些 MCP 服务器，避免浪费</li>
                <li><strong>容错性</strong>：单个服务器失败不影响其他功能</li>
              </ul>
              <p><strong>权衡</strong>：首次调用某服务器的工具时会有延迟，通过预热机制缓解。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🔐 为什么 MCP 工具需要单独授权？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：MCP 工具默认需要用户确认，不能像内置工具那样自动批准。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>安全边界</strong>：MCP 服务器是第三方代码，需要更严格的信任模型</li>
                <li><strong>能力未知</strong>：MCP 工具的能力由服务器定义，CLI 无法静态分析其影响</li>
                <li><strong>权限隔离</strong>：用户可以对不同服务器设置不同的信任级别</li>
              </ul>
              <p><strong>实现</strong>：通过 <code className="bg-black/30 px-1 rounded">trustedMcpServers</code> 配置允许信任的服务器自动执行。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--red)]">
            <h4 className="text-[var(--red)] font-bold mb-2">⚡ 为什么不支持并行 MCP 调用？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：对同一 MCP 服务器的工具调用串行执行，不并行。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>服务器限制</strong>：大多数 MCP 服务器实现不支持并发请求</li>
                <li><strong>状态一致性</strong>：避免服务器内部状态竞争（如文件操作）</li>
                <li><strong>简化调试</strong>：串行执行更容易追踪问题</li>
              </ul>
              <p><strong>优化</strong>：不同服务器的调用可以并行，只是同一服务器内串行。</p>
            </div>
          </div>
        </div>
      </Layer>

      {/* MCP 协议版本兼容性 */}
      <Layer title="协议版本与兼容性" icon="📋">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">协议版本</th>
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">支持状态</th>
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">新增能力</th>
                <th className="text-left py-2 px-3 text-[var(--text-muted)]">兼容性处理</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 font-mono text-[var(--terminal-green)]">2024-11-05</td>
                <td className="py-2 px-3">✅ 完全支持</td>
                <td className="py-2 px-3">基础工具调用、资源访问</td>
                <td className="py-2 px-3">-</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">2025-01-01</td>
                <td className="py-2 px-3">✅ 完全支持</td>
                <td className="py-2 px-3">流式响应、采样支持</td>
                <td className="py-2 px-3">旧服务器自动降级</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/50">
                <td className="py-2 px-3 font-mono text-[var(--amber)]">未来版本</td>
                <td className="py-2 px-3">🔄 前向兼容</td>
                <td className="py-2 px-3">未知新特性</td>
                <td className="py-2 px-3">忽略未知字段</td>
              </tr>
            </tbody>
          </table>
        </div>

        <HighlightBox title="版本协商机制" icon="🤝" variant="blue">
          <CodeBlock
            code={`// 初始化握手时的版本协商
const initResult = await client.request({
  method: 'initialize',
  params: {
    protocolVersion: '2025-01-01',  // 客户端支持的最新版本
    capabilities: {
      tools: { listChanged: true },
      sampling: {},  // 新能力
    }
  }
});

// 服务器返回实际支持的版本
// { protocolVersion: '2024-11-05', capabilities: { tools: {} } }
// 客户端根据返回的版本调整行为`}
          />
        </HighlightBox>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
