import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 介绍内容组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-6 bg-[var(--bg-elevated)] rounded-lg overflow-hidden border border-[var(--border-subtle)]">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--bg-panel)] transition-colors"
      >
        <span className="text-lg font-semibold text-[var(--text-primary)]">📖 什么是 MCP 服务发现？</span>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 text-sm">
          {/* 核心概念 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">🎯 核心概念</h3>
            <p className="text-[var(--text-secondary)]">
              <strong>MCP (Model Context Protocol)</strong> 是一种扩展 AI 能力的协议。通过 MCP 服务器，
              CLI 可以连接外部工具（如数据库、API、文件系统）。服务发现流程负责找到、连接并注册这些扩展服务。
            </p>
          </div>

          {/* 为什么需要 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">❓ 为什么需要服务发现？</h3>
            <ul className="text-[var(--text-secondary)] space-y-1 list-disc list-inside">
              <li><strong>扩展能力</strong>：无需修改核心代码，插件式扩展功能</li>
              <li><strong>隔离错误</strong>：一个服务失败不影响其他服务</li>
              <li><strong>并行启动</strong>：多个服务同时连接，加快启动速度</li>
              <li><strong>动态工具</strong>：每个服务提供的工具自动注册到 AI</li>
            </ul>
          </div>

          {/* 发现阶段 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">📊 发现阶段</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-subtle)]">
                <div className="text-[var(--cyber-blue)]">1. 加载配置</div>
                <div className="text-[var(--text-muted)]">读取内置/用户/项目级配置</div>
              </div>
              <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-subtle)]">
                <div className="text-[var(--cyber-blue)]">2. 并行连接</div>
                <div className="text-[var(--text-muted)]">spawn 进程，建立 stdio 通道</div>
              </div>
              <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-subtle)]">
                <div className="text-[var(--amber)]">3. 能力协商</div>
                <div className="text-[var(--text-muted)]">交换版本和能力信息</div>
              </div>
              <div className="bg-[var(--bg-void)] p-2 rounded border border-[var(--border-subtle)]">
                <div className="text-[var(--terminal-green)]">4. 工具注册</div>
                <div className="text-[var(--text-muted)]">将工具列表合并到 AI 上下文</div>
              </div>
            </div>
          </div>

          {/* 源码位置 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">📁 源码位置</h3>
            <code className="text-xs bg-[var(--bg-void)] p-2 rounded block border border-[var(--border-subtle)]">
              packages/core/src/tools/mcp-client-manager.ts
            </code>
          </div>

          {/* 相关机制 */}
          <div>
            <h3 className="text-[var(--terminal-green)] font-semibold mb-2">🔗 相关机制</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded text-xs">工具系统</span>
              <span className="px-2 py-1 bg-[var(--purple)]/20 text-[var(--purple)] rounded text-xs">扩展系统</span>
              <span className="px-2 py-1 bg-[var(--amber)]/20 text-[var(--amber)] rounded text-xs">配置管理</span>
              <span className="px-2 py-1 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded text-xs">进程管理</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// MCP Server 状态
type ServerStatus = 'pending' | 'connecting' | 'negotiating' | 'ready' | 'error';

interface MCPServer {
  id: string;
  name: string;
  type: 'builtin' | 'user' | 'project';
  command: string;
  status: ServerStatus;
  tools: string[];
  error?: string;
}

// 模拟 MCP 服务器配置
const initialServers: MCPServer[] = [
  {
    id: 'filesystem',
    name: 'filesystem',
    type: 'builtin',
    command: 'npx @modelcontextprotocol/server-filesystem',
    status: 'pending',
    tools: ['read_file', 'write_file', 'list_directory'],
  },
  {
    id: 'memory',
    name: 'memory',
    type: 'builtin',
    command: 'npx @modelcontextprotocol/server-memory',
    status: 'pending',
    tools: ['store', 'retrieve', 'search'],
  },
  {
    id: 'github',
    name: 'github',
    type: 'user',
    command: 'npx @modelcontextprotocol/server-github',
    status: 'pending',
    tools: ['create_issue', 'list_prs', 'merge_pr'],
  },
  {
    id: 'custom-db',
    name: 'project-db',
    type: 'project',
    command: './scripts/db-server.js',
    status: 'pending',
    tools: ['query', 'insert', 'update'],
    error: 'ENOENT: server script not found',
  },
];

// 服务器状态卡片
function ServerCard({ server, isActive }: { server: MCPServer; isActive: boolean }) {
  const statusColors: Record<ServerStatus, string> = {
    pending: 'var(--text-muted)',
    connecting: 'var(--cyber-blue)',
    negotiating: 'var(--amber)',
    ready: 'var(--terminal-green)',
    error: 'var(--error)',
  };

  const typeColors = {
    builtin: 'var(--terminal-green)',
    user: 'var(--cyber-blue)',
    project: 'var(--amber)',
  };

  const statusIcons: Record<ServerStatus, string> = {
    pending: '○',
    connecting: '◐',
    negotiating: '◑',
    ready: '●',
    error: '✕',
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-300 ${
        isActive
          ? 'bg-[var(--bg-elevated)] border-[var(--cyber-blue)] shadow-[0_0_15px_rgba(0,212,255,0.2)]'
          : server.status === 'ready'
          ? 'bg-[var(--bg-void)] border-[var(--terminal-green-dim)]'
          : server.status === 'error'
          ? 'bg-[var(--bg-void)] border-[var(--error-dim)]'
          : 'bg-[var(--bg-void)] border-[var(--border-subtle)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`text-lg ${isActive ? 'animate-pulse' : ''}`}
          style={{ color: statusColors[server.status] }}
        >
          {statusIcons[server.status]}
        </span>
        <div className="flex-1">
          <div className="font-mono font-bold text-[var(--text-primary)]">{server.name}</div>
          <div
            className="text-xs font-mono"
            style={{ color: typeColors[server.type] }}
          >
            {server.type}
          </div>
        </div>
        <span
          className="px-2 py-1 text-xs font-mono rounded"
          style={{
            backgroundColor: `${statusColors[server.status]}20`,
            color: statusColors[server.status],
          }}
        >
          {server.status}
        </span>
      </div>

      {/* Command */}
      <div className="text-xs font-mono text-[var(--text-muted)] mb-3 p-2 bg-[var(--bg-terminal)] rounded overflow-x-auto">
        $ {server.command}
      </div>

      {/* Tools or Error */}
      {server.status === 'error' ? (
        <div className="text-xs font-mono text-[var(--error)] p-2 bg-[var(--error)]/10 rounded">
          ⚠ {server.error}
        </div>
      ) : server.status === 'ready' ? (
        <div className="flex flex-wrap gap-1">
          {server.tools.map((tool) => (
            <span
              key={tool}
              className="px-2 py-0.5 text-xs font-mono bg-[var(--terminal-green)]/10 text-[var(--terminal-green)] rounded"
            >
              {tool}
            </span>
          ))}
        </div>
      ) : (
        <div className="h-6" /> // Placeholder for consistent height
      )}
    </div>
  );
}

// 发现阶段指示器
function PhaseIndicator({ phases, currentPhase }: { phases: string[]; currentPhase: number }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {phases.map((phase, i) => {
        const isActive = i === currentPhase;
        const isPast = i < currentPhase;

        return (
          <div key={phase} className="flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-md font-mono text-sm transition-all duration-300 ${
                isActive
                  ? 'bg-[var(--cyber-blue)] text-[var(--bg-void)] font-bold shadow-[0_0_10px_var(--cyber-blue)]'
                  : isPast
                  ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
              }`}
            >
              {isPast && '✓ '}
              {phase}
            </div>
            {i < phases.length - 1 && (
              <span className={`text-xs ${isPast ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`}>
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 动画步骤
const discoveryPhases = [
  '加载配置',
  '并行连接',
  '能力协商',
  '工具注册',
  '完成',
];

const phaseDescriptions = [
  '从 .innies/mcp.json 和用户配置加载服务器定义',
  '使用 Promise.all() 并行启动所有服务器进程',
  '与每个服务器进行 MCP 协议握手，交换能力信息',
  '将发现的工具注册到工具注册表，供 AI 调用',
  'MCP 服务发现完成，工具已就绪',
];

const phaseCode = [
  `// mcp-client-manager.ts - 加载配置
async loadServerConfigs(): Promise<MCPServerConfig[]> {
  const configs: MCPServerConfig[] = [];

  // 1. 内置服务器
  configs.push(...BUILTIN_SERVERS);

  // 2. 用户全局配置 ~/.innies/mcp.json
  const userConfig = await this.loadUserConfig();
  configs.push(...userConfig.mcpServers);

  // 3. 项目配置 .innies/mcp.json
  const projectConfig = await this.loadProjectConfig();
  configs.push(...projectConfig.mcpServers);

  return this.deduplicateConfigs(configs);
}`,
  `// mcp-client-manager.ts - 并行连接
async connectAll(): Promise<void> {
  const configs = await this.loadServerConfigs();

  // 并行启动所有服务器
  const results = await Promise.all(
    configs.map(async (config) => {
      try {
        const client = new MCPClient(config);
        await client.connect();
        return { config, client, success: true };
      } catch (error) {
        return { config, error, success: false };
      }
    })
  );

  // 处理结果
  for (const result of results) {
    if (result.success) {
      this.clients.set(result.config.name, result.client);
    } else {
      this.logError(result.config.name, result.error);
    }
  }
}`,
  `// mcp-client.ts - 能力协商
async negotiate(): Promise<ServerCapabilities> {
  // 发送初始化请求
  const initResponse = await this.sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {
      roots: { listChanged: true },
      sampling: {},
    },
    clientInfo: {
      name: 'innies-cli',
      version: VERSION,
    },
  });

  // 保存服务器能力
  this.serverCapabilities = initResponse.capabilities;

  // 确认初始化
  await this.sendNotification('initialized', {});

  return this.serverCapabilities;
}`,
  `// mcp-tool.ts - 工具注册
registerTools(client: MCPClient): void {
  const tools = client.getAvailableTools();

  for (const tool of tools) {
    // 创建工具包装器
    const wrappedTool: Tool = {
      name: \`mcp_\${client.name}_\${tool.name}\`,
      description: tool.description,
      parameters: tool.inputSchema,
      execute: async (args) => {
        return await client.callTool(tool.name, args);
      },
    };

    // 注册到全局工具注册表
    this.toolRegistry.register(wrappedTool);
  }
}`,
  `// 发现完成后的工具注册表状态
{
  tools: {
    "mcp_filesystem_read_file": { source: "mcp", server: "filesystem" },
    "mcp_filesystem_write_file": { source: "mcp", server: "filesystem" },
    "mcp_memory_store": { source: "mcp", server: "memory" },
    "mcp_github_create_issue": { source: "mcp", server: "github" },
    // ...更多工具
  },
  totalTools: 9,
  mcpServers: 3,  // 1 个服务器启动失败
  status: "ready"
}`,
];

export function MCPDiscoveryAnimation() {
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [servers, setServers] = useState<MCPServer[]>(initialServers);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  // 模拟服务器状态更新
  const updateServersForPhase = useCallback((phase: number) => {
    switch (phase) {
      case 0: // 加载配置
        setServers(initialServers);
        break;
      case 1: // 并行连接
        setServers((prev) =>
          prev.map((s) => ({
            ...s,
            status: s.type === 'project' ? 'error' : 'connecting',
          }))
        );
        break;
      case 2: // 能力协商
        setServers((prev) =>
          prev.map((s) => ({
            ...s,
            status: s.status === 'error' ? 'error' : 'negotiating',
          }))
        );
        break;
      case 3: // 工具注册
      case 4: // 完成
        setServers((prev) =>
          prev.map((s) => ({
            ...s,
            status: s.status === 'error' ? 'error' : 'ready',
          }))
        );
        break;
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentPhase >= discoveryPhases.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const nextPhase = currentPhase + 1;
      setCurrentPhase(nextPhase);
      updateServersForPhase(nextPhase);

      // 模拟处理每个服务器
      if (nextPhase === 1 || nextPhase === 2) {
        const serverIds = servers.filter((s) => s.type !== 'project').map((s) => s.id);
        serverIds.forEach((id, i) => {
          setTimeout(() => setActiveServerId(id), i * 400);
        });
        setTimeout(() => setActiveServerId(null), serverIds.length * 400 + 200);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentPhase, servers, updateServersForPhase]);

  const play = useCallback(() => {
    setCurrentPhase(-1);
    setServers(initialServers.map((s) => ({ ...s, status: 'pending' as ServerStatus })));
    setActiveServerId(null);
    setTimeout(() => {
      setCurrentPhase(0);
      setIsPlaying(true);
    }, 100);
  }, []);

  const stepForward = useCallback(() => {
    if (currentPhase < discoveryPhases.length - 1) {
      const nextPhase = currentPhase + 1;
      setCurrentPhase(nextPhase);
      updateServersForPhase(nextPhase);
    } else {
      setCurrentPhase(-1);
      setServers(initialServers.map((s) => ({ ...s, status: 'pending' as ServerStatus })));
    }
  }, [currentPhase, updateServersForPhase]);

  const reset = useCallback(() => {
    setCurrentPhase(-1);
    setIsPlaying(false);
    setServers(initialServers.map((s) => ({ ...s, status: 'pending' as ServerStatus })));
    setActiveServerId(null);
  }, []);

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl p-8 border border-[var(--border-subtle)] relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--terminal-green)] via-[var(--cyber-blue)] to-[var(--amber)]" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[var(--terminal-green)]">🔌</span>
        <h2 className="text-2xl font-mono font-bold text-[var(--text-primary)]">
          MCP 服务发现流程
        </h2>
      </div>

      <p className="text-sm text-[var(--text-muted)] font-mono mb-6">
        // Model Context Protocol 服务器的并行发现与工具注册
      </p>

      {/* 介绍部分 */}
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={play}
          className="px-5 py-2.5 bg-[var(--terminal-green)] text-[var(--bg-void)] rounded-md font-mono font-bold hover:shadow-[0_0_15px_var(--terminal-green-glow)] transition-all cursor-pointer"
        >
          ▶ 播放发现流程
        </button>
        <button
          onClick={stepForward}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--terminal-green-dim)] hover:text-[var(--terminal-green)] transition-all cursor-pointer"
        >
          ⏭ 下一阶段
        </button>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--amber)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--amber-dim)] transition-all cursor-pointer"
        >
          ↺ 重置
        </button>
      </div>

      {/* Phase indicator */}
      <div className="mb-6 p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)]">
        <PhaseIndicator phases={discoveryPhases} currentPhase={currentPhase} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Server cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--cyber-blue)]">📦</span>
            <span className="text-sm font-mono font-bold text-[var(--text-primary)]">MCP 服务器</span>
          </div>
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              isActive={activeServerId === server.id}
            />
          ))}
        </div>

        {/* Code panel */}
        <div className="bg-[var(--bg-void)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center gap-2">
            <span className="text-[var(--terminal-green)]">$</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {currentPhase >= 0 ? discoveryPhases[currentPhase] : '等待开始'}
            </span>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            <JsonBlock code={currentPhase >= 0 ? phaseCode[currentPhase] : '// 点击播放开始演示'} />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)]">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[var(--terminal-green)] font-mono">$</span>
          <span className="text-[var(--text-secondary)] font-mono">
            阶段：
            <span className="text-[var(--terminal-green)] font-bold">
              {currentPhase + 1}
            </span>
            /{discoveryPhases.length}
          </span>
          {isPlaying && (
            <span className="text-[var(--amber)] font-mono text-sm animate-pulse">
              ● 发现中...
            </span>
          )}
        </div>
        <div className="font-mono text-sm text-[var(--text-primary)] pl-6">
          {currentPhase >= 0 ? phaseDescriptions[currentPhase] : '$ 点击播放开始 MCP 服务发现演示'}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--terminal-green)] via-[var(--cyber-blue)] to-[var(--amber)] transition-all duration-300"
            style={{ width: `${((currentPhase + 1) / discoveryPhases.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="mt-6 p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[var(--purple)]">🏗️</span>
          <span className="text-sm font-mono font-bold text-[var(--text-primary)]">三层配置层级</span>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[var(--terminal-green)]/10 border border-[var(--terminal-green-dim)]">
              <div className="text-center">
                <div className="text-2xl mb-1">📦</div>
                <div className="text-xs font-mono text-[var(--terminal-green)]">builtin</div>
                <div className="text-xs font-mono text-[var(--text-muted)]">内置服务</div>
              </div>
            </div>
            <span className="text-[var(--text-muted)]">→</span>
            <div className="p-3 rounded-lg bg-[var(--cyber-blue)]/10 border border-[var(--cyber-blue-dim)]">
              <div className="text-center">
                <div className="text-2xl mb-1">👤</div>
                <div className="text-xs font-mono text-[var(--cyber-blue)]">user</div>
                <div className="text-xs font-mono text-[var(--text-muted)]">~/.innies/</div>
              </div>
            </div>
            <span className="text-[var(--text-muted)]">→</span>
            <div className="p-3 rounded-lg bg-[var(--amber)]/10 border border-[var(--amber-dim)]">
              <div className="text-center">
                <div className="text-2xl mb-1">📁</div>
                <div className="text-xs font-mono text-[var(--amber)]">project</div>
                <div className="text-xs font-mono text-[var(--text-muted)]">.innies/</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-3 text-xs font-mono text-[var(--text-muted)]">
          后加载的配置可以覆盖先前配置 (project &gt; user &gt; builtin)
        </div>
      </div>
    </div>
  );
}
