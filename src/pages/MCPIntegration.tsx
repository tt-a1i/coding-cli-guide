import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

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
            <code>packages/core/src/mcp/</code>
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
              <strong>MCPClientManager</strong>
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

      {/* MCPClientManager */}
      <Layer title="MCPClientManager" icon="🔧">
        <CodeBlock
          title="packages/core/src/mcp/mcp-client-manager.ts"
          code={`class MCPClientManager {
    private clients: Map<string, MCPClient> = new Map();
    private discoveredTools: Map<string, DiscoveredMCPTool> = new Map();

    // 连接并发现工具
    async connectAndDiscover(serverConfig: MCPServerConfig) {
        // 1. 创建 MCP 客户端
        const client = new MCPClient(serverConfig);

        // 2. 连接服务器
        await client.connect();

        // 3. 发现可用工具
        const tools = await client.listTools();

        // 4. 注册工具
        for (const tool of tools) {
            const wrappedTool = new DiscoveredMCPTool(tool, client);
            this.discoveredTools.set(tool.name, wrappedTool);
        }

        this.clients.set(serverConfig.name, client);
    }

    // 获取所有发现的工具
    getAllDiscoveredTools(): DiscoveredMCPTool[] {
        return Array.from(this.discoveredTools.values());
    }

    // 调用工具
    async callTool(name: string, args: object): Promise<any> {
        const tool = this.discoveredTools.get(name);
        if (!tool) throw new Error(\`Tool not found: \${name}\`);

        return tool.invoke(args);
    }
}`}
        />
      </Layer>

      {/* MCP 配置 */}
      <Layer title="MCP 服务器配置" icon="⚙️">
        <JsonBlock
          code={`// ~/.qwen/mcp/servers.json
{
    "servers": [
        {
            "name": "filesystem",
            "command": "npx",
            "args": ["-y", "@anthropic/mcp-server-filesystem"],
            "env": {
                "ALLOWED_PATHS": "/home/user/projects"
            }
        },
        {
            "name": "github",
            "command": "npx",
            "args": ["-y", "@anthropic/mcp-server-github"],
            "env": {
                "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
            }
        },
        {
            "name": "custom-api",
            "url": "http://localhost:3000/mcp",
            "auth": {
                "type": "bearer",
                "token": "\${API_TOKEN}"
            }
        }
    ]
}`}
        />

        <HighlightBox title="配置选项" icon="📋" variant="green">
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>command + args</strong>: 本地进程方式启动 MCP 服务器</li>
            <li><strong>url</strong>: HTTP/WebSocket 远程连接</li>
            <li><strong>env</strong>: 传递给服务器的环境变量</li>
            <li><strong>auth</strong>: 认证配置（bearer、basic、oauth）</li>
          </ul>
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
          code={`// 1. AI 决定调用工具
{
    "tool_calls": [{
        "name": "mcp_filesystem_read_file",
        "arguments": { "path": "/home/user/file.txt" }
    }]
}

// 2. CLI 识别这是 MCP 工具
const isMCPTool = name.startsWith('mcp_');

// 3. 解析服务器和工具名
const [_, serverName, toolName] = name.split('_');
// serverName = "filesystem", toolName = "read_file"

// 4. 调用 MCP 服务器
const result = await mcpClient.request({
    method: 'tools/call',
    params: {
        name: toolName,
        arguments: args
    }
});

// 5. 返回结果
{
    "content": [
        {
            "type": "text",
            "text": "文件内容..."
        }
    ]
}`}
        />
      </Layer>

      {/* MCPTool 包装 */}
      <Layer title="MCPTool 包装类" icon="📦">
        <CodeBlock
          title="DiscoveredMCPTool"
          code={`class DiscoveredMCPTool extends BaseDeclarativeTool {
    private mcpClient: MCPClient;
    private mcpToolDef: MCPToolDefinition;

    constructor(toolDef: MCPToolDefinition, client: MCPClient) {
        super();
        this.mcpToolDef = toolDef;
        this.mcpClient = client;
    }

    // 工具元数据
    get name() {
        return \`mcp_\${this.mcpClient.serverName}_\${this.mcpToolDef.name}\`;
    }

    get description() {
        return this.mcpToolDef.description;
    }

    get schema(): FunctionDeclaration {
        return {
            name: this.name,
            description: this.description,
            parameters: this.mcpToolDef.inputSchema
        };
    }

    // 执行工具
    async execute(params: object): Promise<ToolResult> {
        const response = await this.mcpClient.request({
            method: 'tools/call',
            params: {
                name: this.mcpToolDef.name,
                arguments: params
            }
        });

        return {
            llmContent: this.formatResponse(response),
            returnDisplay: \`MCP: \${this.mcpToolDef.name} completed\`
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
                  <li>• MCP 工具名与内置工具名冲突（如 MCP 服务器提供 `Bash` 工具）</li>
                  <li>• 同一服务器重复注册导致名称冲突</li>
                </ul>
              </div>
              <CodeBlock
                title="命名空间隔离机制"
                code={`// MCP 工具的命名规则
// 格式: mcp_{serverName}_{toolName}

// 服务器 A 的 read_file → mcp_filesystem_read_file
// 服务器 B 的 read_file → mcp_github_read_file

// 这样即使工具名相同，全局名称也不会冲突
get name() {
  return \`mcp_\${this.serverName}_\${this.originalToolName}\`;
}

// 但如果服务器名称也相同呢？
// MCPClientManager 使用 Map 存储，后注册的会覆盖先注册的
class MCPClientManager {
  private clients: Map<string, MCPClient> = new Map();

  async connectServer(config: MCPServerConfig) {
    // 问题：如果 config.name 重复，会静默覆盖
    // 正确做法：检查并报错
    if (this.clients.has(config.name)) {
      throw new Error(\`MCP server '\${config.name}' already registered\`);
    }
    // ...
  }
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
DEBUG=mcp:* innies`}
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
innies mcp list

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
# 在 VS Code 中：View -> Output -> 选择 "Innies IDE Companion"

# 2. 查看扩展日志
# 在 VS Code 中：Help -> Toggle Developer Tools -> Console

# 3. 手动测试连接
curl http://localhost:9876/health

# 4. 检查端口
lsof -i :9876

# 5. 在 CLI 中强制重连
innies mcp reconnect vscode`}
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
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">DEBUG=mcp:* innies</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">输出所有 MCP 相关日志</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">查看 MCP 状态</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">innies mcp status</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">显示所有服务器连接状态</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">列出已发现工具</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">innies mcp list</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">列出所有 MCP 工具</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">重连服务器</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">innies mcp reconnect [name]</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">断开并重新连接指定服务器</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">测试工具调用</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">innies mcp call [tool] [args]</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">手动调用 MCP 工具</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">查看配置</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">innies mcp config</code></td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">显示当前 MCP 配置</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] px-3 py-2">JSON-RPC 跟踪</td>
                  <td className="border border-[var(--border-subtle)] px-3 py-2"><code className="text-xs bg-black/30 px-1 rounded">DEBUG=jsonrpc:* innies</code></td>
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

          {/* 优化 2: 懒加载与按需连接 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
            <div className="bg-purple-500/10 px-4 py-2 border-b border-[var(--border-subtle)]">
              <h4 className="text-purple-400 font-bold">优化 2: 懒加载与按需连接</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                不要在启动时连接所有 MCP 服务器，而是在首次使用时才建立连接。
              </p>
              <CodeBlock
                title="懒加载实现"
                code={`// 启动时只加载配置，不建立连接
class MCPClientManager {
  private configs: Map<string, MCPServerConfig> = new Map();
  private clients: Map<string, MCPClient> = new Map();

  constructor(configs: MCPServerConfig[]) {
    // 只存储配置
    for (const config of configs) {
      this.configs.set(config.name, config);
    }
    // 不立即连接！
  }

  // 工具列表：返回所有可能的工具（包括未连接的）
  async getAvailableTools(): Promise<ToolInfo[]> {
    const tools: ToolInfo[] = [];

    for (const [name, config] of this.configs) {
      if (this.clients.has(name)) {
        // 已连接，返回实际工具
        tools.push(...this.clients.get(name)!.getTools());
      } else {
        // 未连接，返回占位符
        tools.push({
          name: \`mcp_\${name}_*\`,
          description: \`[Lazy] Tools from \${name} server\`,
          lazyLoad: true,
          serverName: name
        });
      }
    }

    return tools;
  }

  // 首次调用时才连接
  async callTool(fullName: string, args: object) {
    const [, serverName] = fullName.match(/^mcp_(.+?)_/) || [];

    if (!this.clients.has(serverName)) {
      // 按需连接
      await this.connect(serverName);
    }

    return this.clients.get(serverName)!.callTool(/*...*/);
  }
}`}
              />
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <h5 className="text-amber-400 text-sm font-semibold mb-1">⚠️ 权衡</h5>
                <p className="text-xs text-[var(--text-muted)]">
                  懒加载会导致首次工具调用延迟增加，但显著减少 CLI 启动时间。
                  对于不常用的 MCP 服务器，懒加载收益更大。
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
  { name: 'mcp_fs_read_file', args: { path: '/a.txt' } },
  { name: 'mcp_fs_read_file', args: { path: '/b.txt' } },
  { name: 'mcp_github_get_issue', args: { issue: 123 } }
];

// 并行执行：fs 的两个调用 + github 的一个调用
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

    AI->>Scheduler: 请求调用 mcp_fs_read_file
    Scheduler->>Scheduler: 检查是否需要确认
    Scheduler->>Manager: callTool("mcp_fs_read_file", args)
    Manager->>Manager: 解析服务器名 "fs"
    Manager->>Client: getClient("fs")

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
    </div>
  );
}
