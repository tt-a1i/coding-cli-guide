import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

export function MCPIntegration() {
  return (
    <div>
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
    </div>
  );
}
