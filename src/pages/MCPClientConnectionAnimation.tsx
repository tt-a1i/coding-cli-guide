// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * MCP 客户端连接动画
 *
 * 可视化 mcp-client.ts 连接流程
 * 源码: packages/core/src/tools/mcp-client.ts
 *
 * 核心流程:
 * 1. createTransport() - 创建传输层 (Stdio/SSE/HTTP)
 * 2. connectToMcpServer() - 建立连接
 * 3. discoverTools() - 发现工具
 * 4. discoverPrompts() - 发现提示
 * 5. registerTool() - 注册到工具注册表
 */

type MCPServerStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
type TransportType = 'stdio' | 'sse' | 'http';

interface MCPServer {
  name: string;
  transport: TransportType;
  status: MCPServerStatus;
  tools: string[];
  prompts: string[];
  error?: string;
}

interface ConnectionPhase {
  name: string;
  description: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

const SAMPLE_SERVERS: Omit<MCPServer, 'status' | 'tools' | 'prompts'>[] = [
  { name: 'filesystem', transport: 'stdio' },
  { name: 'context7', transport: 'http' },
  { name: 'custom-api', transport: 'sse' },
];

const CONNECTION_PHASES: ConnectionPhase[] = [
  { name: 'createTransport', description: '创建传输层', status: 'pending' },
  { name: 'connect', description: '建立连接', status: 'pending' },
  { name: 'registerCapabilities', description: '注册能力', status: 'pending' },
  { name: 'discoverTools', description: '发现工具', status: 'pending' },
  { name: 'discoverPrompts', description: '发现提示', status: 'pending' },
  { name: 'registerTool', description: '注册工具', status: 'pending' },
];

const TOOL_SAMPLES: Record<string, string[]> = {
  filesystem: ['read_file', 'write_file', 'list_directory', 'search_files'],
  context7: ['get_documentation', 'search_code', 'explain_code'],
  'custom-api': ['query_database', 'execute_action'],
};

export default function MCPClientConnectionAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [currentServerIndex, setCurrentServerIndex] = useState(-1);
  const [phases, setPhases] = useState<ConnectionPhase[]>(CONNECTION_PHASES);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(-1);
  const [discoveryState, setDiscoveryState] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('NOT_STARTED');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-18), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsPlaying(false);
    setServers([]);
    setCurrentServerIndex(-1);
    setPhases(CONNECTION_PHASES.map(p => ({ ...p, status: 'pending' })));
    setCurrentPhaseIndex(-1);
    setDiscoveryState('NOT_STARTED');
    setLogs([]);
  }, []);

  // Main animation loop
  useEffect(() => {
    if (!isPlaying) return;

    let timer: NodeJS.Timeout;

    // Initialize servers
    if (servers.length === 0) {
      setServers(SAMPLE_SERVERS.map(s => ({
        ...s,
        status: 'DISCONNECTED',
        tools: [],
        prompts: [],
      })));
      setDiscoveryState('IN_PROGRESS');
      addLog('🔌 discoverMcpTools() 开始');
      addLog('📋 发现 3 个 MCP 服务器配置');
      setCurrentServerIndex(0);
      return;
    }

    // All servers done
    if (currentServerIndex >= SAMPLE_SERVERS.length) {
      setDiscoveryState('COMPLETED');
      addLog('✅ 所有 MCP 服务器连接完成');
      setIsPlaying(false);
      return;
    }

    const server = servers[currentServerIndex];

    // Connection phases
    if (currentPhaseIndex === -1) {
      // Start connecting this server
      addLog(`\n🔗 connectAndDiscover("${server.name}")`);
      setServers(prev => prev.map((s, i) =>
        i === currentServerIndex ? { ...s, status: 'CONNECTING' } : s
      ));
      setCurrentPhaseIndex(0);
      return;
    }

    if (currentPhaseIndex >= phases.length) {
      // Server connection complete
      setServers(prev => prev.map((s, i) =>
        i === currentServerIndex ? { ...s, status: 'CONNECTED' } : s
      ));
      addLog(`  ✓ "${server.name}" 连接成功`);

      // Move to next server
      setPhases(CONNECTION_PHASES.map(p => ({ ...p, status: 'pending' })));
      setCurrentPhaseIndex(-1);
      setCurrentServerIndex(prev => prev + 1);
      return;
    }

    const phase = phases[currentPhaseIndex];

    timer = setTimeout(() => {
      // Mark phase as active
      setPhases(prev => prev.map((p, i) => ({
        ...p,
        status: i === currentPhaseIndex ? 'active' : i < currentPhaseIndex ? 'complete' : 'pending'
      })));

      addLog(`  → ${phase.name}()`);

      // Process phase
      setTimeout(() => {
        // Phase-specific logic
        if (phase.name === 'createTransport') {
          addLog(`    ${server.transport.toUpperCase()}ClientTransport`);
        } else if (phase.name === 'discoverTools') {
          const tools = TOOL_SAMPLES[server.name] || [];
          setServers(prev => prev.map((s, i) =>
            i === currentServerIndex ? { ...s, tools } : s
          ));
          addLog(`    发现 ${tools.length} 个工具`);
        } else if (phase.name === 'discoverPrompts') {
          setServers(prev => prev.map((s, i) =>
            i === currentServerIndex ? { ...s, prompts: ['default'] } : s
          ));
        } else if (phase.name === 'registerTool') {
          const tools = TOOL_SAMPLES[server.name] || [];
          tools.forEach(tool => {
            addLog(`    toolRegistry.registerTool("${tool}")`);
          });
        }

        // Mark phase complete
        setPhases(prev => prev.map((p, i) => ({
          ...p,
          status: i === currentPhaseIndex ? 'complete' : p.status
        })));

        setCurrentPhaseIndex(prev => prev + 1);
      }, 300);
    }, 400);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, servers, currentServerIndex, currentPhaseIndex, phases, addLog]);

  const getStatusColor = (status: MCPServerStatus) => {
    switch (status) {
      case 'DISCONNECTED': return 'var(--muted)';
      case 'CONNECTING': return 'var(--amber)';
      case 'CONNECTED': return 'var(--terminal-green)';
    }
  };

  const getTransportIcon = (transport: TransportType) => {
    switch (transport) {
      case 'stdio': return '⚡';
      case 'sse': return '🌊';
      case 'http': return '🌐';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            MCP 客户端连接
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            mcp-client - 服务发现与连接管理
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">DiscoveryState:</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono ${
                discoveryState === 'NOT_STARTED'
                  ? 'bg-[var(--muted)]/20 text-[var(--muted)]'
                  : discoveryState === 'IN_PROGRESS'
                  ? 'bg-[var(--amber)]/20 text-[var(--amber)] animate-pulse'
                  : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]'
              }`}
            >
              {discoveryState}
            </span>
          </div>
          <button
            onClick={() => isPlaying ? resetAnimation() : (resetAnimation(), setTimeout(() => setIsPlaying(true), 100))}
            className={`px-4 py-2 rounded font-mono text-sm transition-all ${
              isPlaying
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/30'
            }`}
          >
            {isPlaying ? '⏹ 停止' : '▶ 开始'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧: 服务器列表 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
              MCP Servers
            </h3>
            <div className="space-y-3">
              {servers.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  等待发现...
                </div>
              ) : (
                servers.map((server, index) => (
                  <div
                    key={server.name}
                    className={`p-4 rounded-lg border transition-all ${
                      index === currentServerIndex && isPlaying
                        ? 'bg-[var(--amber)]/10 border-[var(--amber)]/50'
                        : server.status === 'CONNECTED'
                        ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                        : 'bg-black/20 border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{getTransportIcon(server.transport)}</span>
                        <span className="text-sm font-mono text-[var(--text-primary)]">
                          {server.name}
                        </span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-mono"
                        style={{
                          backgroundColor: `${getStatusColor(server.status)}20`,
                          color: getStatusColor(server.status),
                        }}
                      >
                        {server.status}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--muted)] mb-2">
                      Transport: {server.transport.toUpperCase()}
                    </div>

                    {server.tools.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-[var(--muted)] mb-1">Tools:</div>
                        <div className="flex flex-wrap gap-1">
                          {server.tools.map(tool => (
                            <span
                              key={tool}
                              className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--cyber-blue)]/10 text-[var(--cyber-blue)]"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transport Types */}
          <div className="mt-4 bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 font-mono">
              Transport Types
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="font-mono text-[var(--text-secondary)]">StdioClientTransport</span>
                <span className="text-[var(--muted)]">- 本地进程</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌊</span>
                <span className="font-mono text-[var(--text-secondary)]">SSEClientTransport</span>
                <span className="text-[var(--muted)]">- Server-Sent Events</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌐</span>
                <span className="font-mono text-[var(--text-secondary)]">StreamableHTTPClientTransport</span>
                <span className="text-[var(--muted)]">- HTTP 流</span>
              </div>
            </div>
          </div>
        </div>

        {/* 中间: 连接阶段 */}
        <div className="col-span-5">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)] h-full">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-4 font-mono">
              Connection Pipeline
            </h3>

            <div className="space-y-3">
              {phases.map((phase, index) => (
                <div
                  key={phase.name}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                    phase.status === 'active'
                      ? 'bg-[var(--amber)]/10 border-[var(--amber)]/50 animate-pulse'
                      : phase.status === 'complete'
                      ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                      : 'bg-black/20 border-[var(--border)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
                    phase.status === 'active'
                      ? 'bg-[var(--amber)]/20 text-[var(--amber)]'
                      : phase.status === 'complete'
                      ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]'
                      : 'bg-[var(--muted)]/20 text-[var(--muted)]'
                  }`}>
                    {phase.status === 'complete' ? '✓' : index + 1}
                  </div>

                  <div className="flex-1">
                    <div className={`text-sm font-mono ${
                      phase.status === 'active' ? 'text-[var(--amber)]' :
                      phase.status === 'complete' ? 'text-[var(--terminal-green)]' :
                      'text-[var(--text-secondary)]'
                    }`}>
                      {phase.name}()
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {phase.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* McpClient Instance */}
            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-[var(--border)]">
              <h4 className="text-xs font-mono text-[var(--muted)] mb-2">McpClient</h4>
              <pre className="text-xs font-mono text-[var(--text-secondary)]">
{`{
  name: "gemini-cli-mcp-client-${currentServerIndex >= 0 && servers[currentServerIndex] ? servers[currentServerIndex].name : '...'}",
  version: "0.0.1",
  capabilities: {
    roots: { listChanged: true }
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* 右侧: 日志 */}
        <div className="col-span-3">
          <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)] h-full">
            <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">
              Connection Log
            </h3>
            <div className="space-y-1 text-xs font-mono h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-[var(--muted)]">等待开始...</div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('✓') || log.includes('✅') ? 'text-[var(--terminal-green)]' :
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('🔗') || log.includes('🔌') ? 'text-[var(--cyber-blue)]' :
                      log.includes('→') ? 'text-[var(--amber)]' :
                      log.includes('📋') ? 'text-purple-400' :
                      'text-[var(--text-secondary)]'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 源码说明 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          源码: mcp-client.ts
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`// 创建传输层
async function createTransport(serverName, config, debugMode): Promise<Transport> {
  // 1. Service Account Impersonation
  if (config.authProviderType === AuthProviderType.SERVICE_ACCOUNT_IMPERSONATION) {
    return new StreamableHTTPClientTransport(new URL(config.httpUrl), { authProvider });
  }

  // 2. Google Credentials
  if (config.authProviderType === AuthProviderType.GOOGLE_CREDENTIALS) {
    return new SSEClientTransport(new URL(config.url), { authProvider });
  }

  // 3. HTTP Transport
  if (config.httpUrl) {
    return new StreamableHTTPClientTransport(new URL(config.httpUrl), transportOptions);
  }

  // 4. SSE Transport
  if (config.url) {
    return new SSEClientTransport(new URL(config.url), transportOptions);
  }

  // 5. Stdio Transport (本地进程)
  if (config.command) {
    return new StdioClientTransport({
      command: config.command,
      args: config.args || [],
      env: { ...process.env, ...(config.env || {}) },
    });
  }
}

// 连接并发现
async function connectAndDiscover(serverName, config, toolRegistry, ...): Promise<void> {
  updateMCPServerStatus(serverName, MCPServerStatus.CONNECTING);

  const mcpClient = await connectToMcpServer(serverName, config, debugMode, workspaceContext);

  const prompts = await discoverPrompts(serverName, mcpClient, promptRegistry);
  const tools = await discoverTools(serverName, config, mcpClient, cliConfig);

  updateMCPServerStatus(serverName, MCPServerStatus.CONNECTED);

  for (const tool of tools) {
    toolRegistry.registerTool(tool);
  }
}`}
        </pre>
      </div>
    </div>
  );
}
