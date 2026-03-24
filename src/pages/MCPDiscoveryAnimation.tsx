import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 介绍内容组件
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-6 bg-elevated rounded-lg overflow-hidden border border-edge">
 <button
 onClick={onToggle}
 className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface transition-colors"
 >
 <span className="text-lg font-semibold text-heading">什么是 MCP 服务发现？</span>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-4 pb-4 space-y-4 text-sm">
 {/* 核心概念 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">核心概念</h3>
 <p className="text-body">
 <strong>MCP (Model Context Protocol)</strong> 是一种扩展 AI 能力的协议。通过 MCP 服务器，
 CLI 可以连接外部工具（如数据库、API、文件系统）。服务发现流程负责找到、连接并注册这些扩展服务。
 </p>
 </div>

 {/* 为什么需要 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">为什么需要服务发现？</h3>
 <ul className="text-body space-y-1 list-disc list-inside">
 <li><strong>扩展能力</strong>：无需修改核心代码，插件式扩展功能</li>
 <li><strong>隔离错误</strong>：一个服务失败不影响其他服务</li>
 <li><strong>并行启动</strong>：多个服务同时连接，加快启动速度</li>
 <li><strong>动态工具</strong>：每个服务提供的工具自动注册到 AI</li>
 </ul>
 </div>

 {/* 发现阶段 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">发现阶段</h3>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">1. 加载配置</div>
 <div className="text-dim">读取 settings.json + active extensions</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">2. 并行连接</div>
 <div className="text-dim">spawn 进程，建立 stdio 通道</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">3. 能力协商</div>
 <div className="text-dim">交换版本和能力信息</div>
 </div>
 <div className="bg-base p-2 rounded border border-edge">
 <div className="text-heading">4. 工具注册</div>
 <div className="text-dim">将工具列表合并到 AI 上下文</div>
 </div>
 </div>
 </div>

 {/* 源码位置 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">源码位置</h3>
 <code className="text-xs bg-base p-2 rounded block border border-edge">
 packages/core/src/tools/mcp-client-manager.ts
 </code>
 </div>

 {/* 相关机制 */}
 <div>
 <h3 className="text-heading font-semibold mb-2">相关机制</h3>
 <div className="flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">工具系统</span>
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">扩展系统</span>
 <span className="px-2 py-1 bg-elevated text-heading rounded text-xs">配置管理</span>
 <span className="px-2 py-1 bg-elevated/20 text-heading rounded text-xs">进程管理</span>
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
 type: 'settings' | 'extension';
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
 type: 'settings',
 command: 'npx @modelcontextprotocol/server-filesystem',
 status: 'pending',
 tools: ['read_file', 'write_file', 'list_directory'],
 },
 {
 id: 'github',
 name: 'github',
 type: 'settings',
 command: 'npx @modelcontextprotocol/server-github',
 status: 'pending',
 tools: ['create_issue', 'list_prs', 'merge_pr'],
 },
 {
 id: 'ext-posts',
 name: 'fetch_posts',
 type: 'extension',
 command: 'node ${extensionPath}/dist/example.js',
 status: 'pending',
 tools: ['fetch_posts'],
 },
 {
 id: 'custom-db',
 name: 'experimental-db',
 type: 'settings',
 command: './scripts/db-server.js',
 status: 'pending',
 tools: ['query', 'insert', 'update'],
 error: 'ENOENT: server script not found',
 },
];

// 服务器状态卡片
function ServerCard({ server, isActive }: { server: MCPServer; isActive: boolean }) {
 const statusColors: Record<ServerStatus, string> = {
 pending: 'var(--color-text-muted)',
 connecting: 'var(--color-primary)',
 negotiating: 'var(--color-warning)',
 ready: 'var(--color-primary)',
 error: 'var(--color-danger)',
 };

 const typeColors = {
 settings: 'var(--color-primary)',
 extension: 'var(--color-primary)',
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
 ? ' bg-elevated border-edge shadow-[0_0_15px_rgba(0,212,255,0.2)]'
 : server.status === 'ready'
 ? 'bg-base border-edge'
 : server.status === 'error'
 ? 'bg-base border-edge/60'
 : 'bg-base border-edge'
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
 <div className="font-mono font-bold text-heading">{server.name}</div>
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
 <div className="text-xs font-mono text-dim mb-3 p-2 bg-base rounded overflow-x-auto">
 $ {server.command}
 </div>

 {/* Tools or Error */}
 {server.status === 'error' ? (
 <div className="text-xs font-mono text-heading p-2 bg-elevated rounded">{server.error}
 </div>
 ) : server.status === 'ready' ? (
 <div className="flex flex-wrap gap-1">
 {server.tools.map((tool) => (
 <span
 key={tool}
 className="px-2 py-0.5 text-xs font-mono bg-elevated/10 text-heading rounded"
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
 ? ' bg-elevated text-heading font-bold shadow-[0_0_10px_var(--color-primary)]'
 : isPast
 ? ' bg-elevated/20 text-heading'
 : ' bg-elevated text-dim'
 }`}
 >
 {isPast && '✓ '}
 {phase}
 </div>
 {i < phases.length - 1 && (
 <span className={`text-xs ${isPast ? 'text-heading' : 'text-dim'}`}>
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
 '从 settings.json 合并后的 mcpServers 加载服务器定义（扩展的 mcpServers 会在 extension active 时追加）',
 '使用 Promise.all() 并行连接：本地 stdio / 远端 SSE/HTTP',
 '与每个服务器进行 MCP 协议握手，交换能力信息',
 '将发现的工具注册到工具注册表，供 AI 调用',
 'MCP 服务发现完成，工具已就绪',
];

const phaseCode = [
 `// packages/core/src/tools/mcp-client-manager.ts（节选）
// settings.json 的 mcpServers 由 Config 合并后提供；扩展的 mcpServers 通过 startExtension() 追加

async startConfiguredMcpServers(): Promise<void> {
 const servers = populateMcpServerCommand(
 this.cliConfig.getMcpServers() || {},
 this.cliConfig.getMcpServerCommand(),
 );

 await Promise.all(
 Object.entries(servers).map(([name, config]) =>
 this.maybeDiscoverMcpServer(name, config),
 ),
 );
}

async startExtension(extension: GeminiCLIExtension) {
 await Promise.all(
 Object.entries(extension.mcpServers ?? {}).map(([name, config]) =>
 this.maybeDiscoverMcpServer(name, { ...config, extension }),
 ),
 );
}`,
 `// mcp-client-manager.ts - 并行连接 + 发现（简化）
await Promise.all(
 Object.entries(servers).map(async ([name, config]) => {
 const client = new McpClient(name, config, toolRegistry, ...);
 await client.connect(); // stdio / sse / http
 await client.discover(cliConfig); // tools/resources/prompts
 })
);`,
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
 name: 'gemini-cli',
 version: VERSION,
 },
 });

 // 保存服务器能力
 this.serverCapabilities = initResponse.capabilities;

 // 确认初始化
 await this.sendNotification('initialized', {});

 return this.serverCapabilities;
}`,
 `// mcp-client.ts / discoverTools() - 工具发现 + 注册
async discover(): Promise<void> {
 const tools = await discoverTools(
 serverName,
 serverConfig,
 mcpClient,
 cliConfig,
 );

 for (const tool of tools) {
 // 注意：MCP 工具默认使用 toolDef.name（会做字符合法化）
 // 如果与已有工具重名，会自动升级为 <serverName>__<toolName>
 toolRegistry.registerTool(tool);
 }
 toolRegistry.sortTools();
}`,
 `// 发现完成后的工具注册表状态（示例）
{
 tools: {
 "read_file": { source: "builtin" },
 "write_file": { source: "builtin" },

 // 与内置工具同名 -> 自动加 serverName__ 前缀
 "filesystem__read_file": { source: "mcp", server: "filesystem", policyName: "filesystem__read_file" },
 "filesystem__write_file": { source: "mcp", server: "filesystem", policyName: "filesystem__write_file" },

 // 无冲突 -> LLM 可见名称可能不带前缀，但策略仍用 serverName__toolName
 "store": { source: "mcp", server: "memory", policyName: "memory__store" },
 "create_issue": { source: "mcp", server: "github", policyName: "github__create_issue" }
 },
 totalTools: 9,
 mcpServers: 3, // 1 个服务器启动失败
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
 status: s.error ? 'error' : 'connecting',
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
 if (currentPhase >= discoveryPhases.length - 1) return;

 const timer = setTimeout(() => {
 const nextPhase = currentPhase + 1;
 setCurrentPhase(nextPhase);
 updateServersForPhase(nextPhase);

 if (nextPhase >= discoveryPhases.length - 1) {
 setIsPlaying(false);
 }

 // 模拟处理每个服务器
 if (nextPhase === 1 || nextPhase === 2) {
 const serverIds = servers.filter((s) => s.status !== 'error').map((s) => s.id);
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
 <div className="bg-surface rounded-xl p-8 border border-edge relative overflow-hidden">
 {/* Decorative gradient */}
 <div className="absolute top-0 left-0 right-0 h-[3px] bg-surface " />

 {/* Header */}
 <div className="flex items-center gap-3 mb-6">
 <span className="text-heading">🔌</span>
 <h2 className="text-2xl font-mono font-bold text-heading">
 MCP 服务发现流程
 </h2>
 </div>

 <p className="text-sm text-dim font-mono mb-6">
 // Model Context Protocol 服务器的并行发现与工具注册
 </p>

 {/* 介绍部分 */}
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

 {/* Controls */}
 <div className="flex gap-3 mb-6 flex-wrap">
 <button
 onClick={play}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold hover:shadow-[0_0_15px_rgba(56, 189, 248, 0.25)] transition-all cursor-pointer"
 >
 ▶ 播放发现流程
 </button>
 <button
 onClick={stepForward}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge-hover hover:text-heading transition-all cursor-pointer"
 >
 ⏭ 下一阶段
 </button>
 <button
 onClick={reset}
 className="px-5 py-2.5 bg-elevated text-heading rounded-md font-mono font-bold border border-edge hover:border-edge/60 transition-all cursor-pointer"
 >
 ↺ 重置
 </button>
 </div>

 {/* Phase indicator */}
 <div className="mb-6 p-4 bg-base rounded-lg border border-edge">
 <PhaseIndicator phases={discoveryPhases} currentPhase={currentPhase} />
 </div>

 {/* Main content */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
 {/* Server cards */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-heading">📦</span>
 <span className="text-sm font-mono font-bold text-heading">MCP 服务器</span>
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
 <div className="bg-base rounded-xl border border-edge overflow-hidden">
 <div className="px-4 py-2 bg-elevated border- border-edge flex items-center gap-2">
 <span className="text-heading">$</span>
 <span className="text-xs font-mono text-dim">
 {currentPhase >= 0 ? discoveryPhases[currentPhase] : '等待开始'}
 </span>
 </div>
 <div className="p-4 max-h-[400px] overflow-y-auto">
 <JsonBlock code={currentPhase >= 0 ? phaseCode[currentPhase] : '// 点击播放开始演示'} />
 </div>
 </div>
 </div>

 {/* Status bar */}
 <div className="p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-4 mb-2">
 <span className="text-heading font-mono">$</span>
 <span className="text-body font-mono">
 阶段：
 <span className="text-heading font-bold">
 {currentPhase + 1}
 </span>
 /{discoveryPhases.length}
 </span>
 {isPlaying && (
 <span className="text-heading font-mono text-sm animate-pulse">
 ● 发现中...
 </span>
 )}
 </div>
 <div className="font-mono text-sm text-heading pl-6">
 {currentPhase >= 0 ? phaseDescriptions[currentPhase] : '$ 点击播放开始 MCP 服务发现演示'}
 </div>

 {/* Progress bar */}
 <div className="mt-3 h-1 bg-elevated rounded-full overflow-hidden">
 <div
 className="h-full bg-surface transition-all duration-300"
 style={{ width: `${((currentPhase + 1) / discoveryPhases.length) * 100}%` }}
 />
 </div>
 </div>

 {/* Architecture diagram */}
 <div className="mt-6 p-4 bg-base rounded-lg border border-edge">
 <div className="flex items-center gap-2 mb-4">
 <span className="text-heading">🏗️</span>
 <span className="text-sm font-mono font-bold text-heading">配置来源与优先级</span>
 </div>
 <div className="flex flex-wrap gap-4 justify-center">
 <div className="flex items-center gap-4">
 <div className="p-3 rounded-lg bg-elevated/10 border border-edge">
 <div className="text-center">
 <div className="text-2xl mb-1">⚙️</div>
 <div className="text-xs font-mono text-heading">settings</div>
 <div className="text-xs font-mono text-dim">settings.json（多层合并）</div>
 </div>
 </div>
 <span className="text-dim">→</span>
 <div className="p-3 rounded-lg bg-elevated/10 border border-edge/30">
 <div className="text-center">
 <div className="text-2xl mb-1">🧩</div>
 <div className="text-xs font-mono text-heading">extensions</div>
 <div className="text-xs font-mono text-dim">gemini-extension.json（active）</div>
 </div>
 </div>
 <span className="text-dim">→</span>
 <div className="p-3 rounded-lg bg-elevated/10 border border-edge">
 <div className="text-center">
 <div className="text-2xl mb-1">🔀</div>
 <div className="text-xs font-mono text-heading">merged</div>
 <div className="text-xs font-mono text-dim">最终连接列表</div>
 </div>
 </div>
 </div>
 </div>
 <div className="text-center mt-3 text-xs font-mono text-dim">
 同名 server 优先级：settings.json &gt; extension（扩展不能设置 trust）
 </div>
 </div>
 </div>
 );
}
