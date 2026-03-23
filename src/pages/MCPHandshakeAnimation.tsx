import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// MCP 服务器状态
type MCPServerStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// 握手阶段
type HandshakePhase =
 | 'init'
 | 'transport_select'
 | 'transport_create'
 | 'capability_register'
 | 'connection_attempt'
 | 'oauth_challenge'
 | 'oauth_flow'
 | 'oauth_retry'
 | 'tool_discovery'
 | 'tool_register'
 | 'complete';

// Transport 类型
type TransportType = 'stdio' | 'sse' | 'http';

// 握手状态
interface HandshakeState {
 phase: HandshakePhase;
 serverStatus: MCPServerStatus;
 transportType: TransportType | null;
 capabilities: string[];
 discoveredTools: string[];
 oauthToken: string | null;
 error: string | null;
}

// 握手步骤定义
interface HandshakeStep {
 phase: HandshakePhase;
 title: string;
 description: string;
 stateChange: Partial<HandshakeState>;
 codeSnippet: string;
}

// 完整握手流程
const handshakeSequence: HandshakeStep[] = [
 {
 phase: 'init',
 title: '初始化 MCP 客户端',
 description: '读取 MCP 服务器配置，准备建立连接',
 stateChange: {
 serverStatus: 'disconnected',
 transportType: null,
 capabilities: [],
 discoveredTools: [],
 },
 codeSnippet: `// mcp-client.ts:82-90
class McpClient {
 private status: MCPServerStatus = MCPServerStatus.DISCONNECTED;
 private transport: Transport | null = null;
 private client: Client;

 constructor(serverConfig: MCPServerConfig) {
 this.serverConfig = serverConfig;
 this.client = new Client({ name: 'gemini-cli' });
 }
}`,
 },
 {
 phase: 'transport_select',
 title: '选择 Transport 类型',
 description: '根据配置选择 stdio/sse/http 传输层',
 stateChange: {
 transportType: 'stdio',
 },
 codeSnippet: `// mcp-client.ts:1171-1200
async function createTransport(config: MCPServerConfig): Promise<Transport> {
 if (config.command) {
 // stdio: 本地进程通信
 return new StdioClientTransport({
 command: config.command,
 args: config.args,
 env: { ...process.env, ...config.env },
 });
 } else if (config.url) {
 // SSE or HTTP: 远程服务
 const url = new URL(config.url);
 if (url.protocol === 'sse:') {
 return new SSEClientTransport(url);
 }
 return new StreamableHTTPClientTransport(url);
 }
}`,
 },
 {
 phase: 'transport_create',
 title: '创建 Transport 实例',
 description: 'StdioClientTransport 初始化子进程通信管道',
 stateChange: {},
 codeSnippet: `// StdioClientTransport 内部
class StdioClientTransport implements Transport {
 private process: ChildProcess;
 private stdin: Writable;
 private stdout: Readable;

 constructor(options: StdioOptions) {
 this.process = spawn(options.command, options.args, {
 env: options.env,
 stdio: ['pipe', 'pipe', 'inherit'],
 });
 this.stdin = this.process.stdin;
 this.stdout = this.process.stdout;
 }
}`,
 },
 {
 phase: 'capability_register',
 title: '注册客户端能力',
 description: '声明 roots 能力，允许服务器访问工作目录',
 stateChange: {
 capabilities: ['roots/list'],
 serverStatus: 'connecting',
 },
 codeSnippet: `// mcp-client.ts:119-134
this.client.setRequestHandler(ListRootsRequestSchema, async () => {
 return {
 roots: [
 {
 uri: \`file://\${this.workspaceDir}\`,
 name: 'workspace',
 },
 ],
 };
});

// 注册能力
const capabilities = {
 roots: { listChanged: true },
};`,
 },
 {
 phase: 'connection_attempt',
 title: '尝试建立连接',
 description: '通过 Transport 发送 initialize 请求',
 stateChange: {},
 codeSnippet: `// mcp-client.ts:136-145
async connect(): Promise<void> {
 this.updateStatus(MCPServerStatus.CONNECTING);

 try {
 await this.client.connect(this.transport, {
 timeout: this.serverConfig.timeout ?? 30000,
 });
 this.updateStatus(MCPServerStatus.CONNECTED);
 } catch (error) {
 // 可能触发 OAuth 流程
 await this.handleConnectionError(error);
 }
}`,
 },
 {
 phase: 'oauth_challenge',
 title: '收到 401 认证挑战',
 description: '服务器返回 WWW-Authenticate 头，需要 OAuth',
 stateChange: {
 error: '401 Unauthorized',
 },
 codeSnippet: `// mcp-client.ts:822-850
async handleConnectionError(error: Error): Promise<void> {
 if (error.message.includes('401')) {
 const wwwAuth = error.headers?.get('www-authenticate');

 // 解析 OAuth 配置
 // Bearer realm="https://auth.example.com"
 const authUrl = this.parseWwwAuthenticate(wwwAuth);

 if (authUrl) {
 await this.performOAuthFlow(authUrl);
 }
 }
}`,
 },
 {
 phase: 'oauth_flow',
 title: 'OAuth 授权流程',
 description: '发现 OAuth 配置，获取 access_token',
 stateChange: {
 error: null,
 },
 codeSnippet: `// mcp-client.ts:900-980
async performOAuthFlow(authServerUrl: string): Promise<void> {
 // 1. 发现 OAuth 配置
 const config = await OAuthUtils.discoverOAuthConfig(authServerUrl);

 // 2. 生成 PKCE challenge
 const { codeVerifier, codeChallenge } = generatePKCE();

 // 3. 打开浏览器授权
 const authUrl = buildAuthorizationUrl(config, codeChallenge);
 await open(authUrl);

 // 4. 等待回调，交换 token
 const code = await waitForCallback();
 const tokens = await exchangeCodeForTokens(code, codeVerifier);

 this.accessToken = tokens.access_token;
}`,
 },
 {
 phase: 'oauth_retry',
 title: '使用 Token 重试连接',
 description: '创建带 Bearer 认证的 Transport，重新连接',
 stateChange: {
 oauthToken: 'eyJhbGciOiJSUzI1NiIs...',
 serverStatus: 'connecting',
 },
 codeSnippet: `// mcp-client.ts:990-1020
async retryWithToken(accessToken: string): Promise<void> {
 // 创建带认证的 Transport
 const authTransport = await createTransportWithOAuth(
 this.serverConfig,
 accessToken
 );

 // 注入 Authorization 头
 authTransport.setHeaders({
 'Authorization': \`Bearer \${accessToken}\`,
 });

 // 重试连接
 await this.client.connect(authTransport, {
 timeout: this.serverConfig.timeout,
 });

 this.updateStatus(MCPServerStatus.CONNECTED);
}`,
 },
 {
 phase: 'tool_discovery',
 title: '发现 MCP 工具',
 description: '调用 tools/list 获取服务器提供的工具',
 stateChange: {
 serverStatus: 'connected',
 },
 codeSnippet: `// mcp-client.ts:580-610
async discoverTools(cliConfig: Config): Promise<DiscoveredMCPTool[]> {
 const response = await this.client.request(
 { method: 'tools/list' },
 ListToolsResultSchema
 );

 const tools: DiscoveredMCPTool[] = [];

 for (const tool of response.tools) {
 // 检查工具是否启用
 if (this.isToolEnabled(tool.name, cliConfig)) {
 tools.push(new DiscoveredMCPTool({
 name: tool.name,
 description: tool.description,
 inputSchema: tool.inputSchema,
 mcpClient: this,
 }));
 }
 }

 return tools;
}`,
 },
 {
 phase: 'tool_register',
 title: '注册到工具仓库',
 description: '将发现的工具包装并注册到 ToolRegistry',
 stateChange: {
 discoveredTools: ['read_file', 'write_file', 'list_directory', 'search_code'],
 },
 codeSnippet: `// mcp-client.ts:150-165
async discover(cliConfig: Config): Promise<void> {
 // 发现 prompts (可选)
 const prompts = await this.discoverPrompts();

 // 发现 tools
 const tools = await this.discoverTools(cliConfig);

 // 注册到全局仓库
 for (const tool of tools) {
 this.toolRegistry.registerTool(tool);
 }

 console.log(\`Discovered \${tools.length} tools from \${this.serverName}\`);
}`,
 },
 {
 phase: 'complete',
 title: 'MCP 连接完成',
 description: '握手成功，工具可用，开始监听事件',
 stateChange: {},
 codeSnippet: `// mcp-client.ts:781-804
// 监听目录变化
this.client.on('notification', (notification) => {
 if (notification.method === 'roots/list_changed') {
 this.handleRootsChanged();
 }
});

// 监听连接关闭
this.transport.on('close', () => {
 this.updateStatus(MCPServerStatus.DISCONNECTED);
 this.scheduleReconnect();
});

// 握手完成，客户端就绪
this.emit('ready', {
 serverName: this.serverName,
 toolCount: this.discoveredTools.length,
});`,
 },
];

// 状态指示器组件
function StatusIndicator({ status }: { status: MCPServerStatus }) {
 const statusConfig = {
 disconnected: { color: 'var(--color-text-muted)', icon: '○', label: 'Disconnected' },
 connecting: { color: 'var(--color-warning)', icon: '◐', label: 'Connecting' },
 connected: { color: 'var(--color-success)', icon: '●', label: 'Connected' },
 error: { color: 'var(--color-danger)', icon: '✕', label: 'Error' },
 };

 const config = statusConfig[status];

 return (
 <div className="flex items-center gap-2">
 <span
 className={`text-lg ${status === 'connecting' ? 'animate-pulse' : ''}`}
 style={{ color: config.color }}
 >
 {config.icon}
 </span>
 <span className="text-xs font-mono" style={{ color: config.color }}>
 {config.label}
 </span>
 </div>
 );
}

// 连接时序图
function ConnectionTimeline({ currentPhase }: { currentPhase: HandshakePhase }) {
 const phases: { id: HandshakePhase; label: string; group: string }[] = [
 { id: 'init', label: 'Init', group: 'setup' },
 { id: 'transport_select', label: 'Select', group: 'setup' },
 { id: 'transport_create', label: 'Create', group: 'setup' },
 { id: 'capability_register', label: 'Caps', group: 'connect' },
 { id: 'connection_attempt', label: 'Connect', group: 'connect' },
 { id: 'oauth_challenge', label: '401', group: 'oauth' },
 { id: 'oauth_flow', label: 'OAuth', group: 'oauth' },
 { id: 'oauth_retry', label: 'Retry', group: 'oauth' },
 { id: 'tool_discovery', label: 'Discover', group: 'tools' },
 { id: 'tool_register', label: 'Register', group: 'tools' },
 { id: 'complete', label: 'Ready', group: 'tools' },
 ];

 const currentIndex = phases.findIndex((p) => p.id === currentPhase);

 const groupColors: Record<string, string> = {
 setup: 'var(--color-info)',
 connect: 'var(--color-warning)',
 oauth: 'var(--color-accent)',
 tools: 'var(--color-success)',
 };

 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-heading">📡</span>
 <span className="text-sm font-mono font-bold text-heading">连接时序</span>
 </div>
 <div className="flex flex-wrap gap-1">
 {phases.map((phase, i) => {
 const isActive = i === currentIndex;
 const isPast = i < currentIndex;
 const color = groupColors[phase.group];

 return (
 <div
 key={phase.id}
 className={`
 px-2 py-1 rounded text-xs font-mono
 transition-all duration-300
 ${isActive ? 'ring-2 ring-offset-1 ring-offset-base' : ''}
 `}
 style={{
 backgroundColor: isPast || isActive ? `${color}20` : 'var(--color-bg-elevated)',
 color: isPast || isActive ? color : 'var(--color-text-muted)',
 borderColor: isActive ? color : 'transparent',
 }}
 >
 {phase.label}
 </div>
 );
 })}
 </div>

 {/* 分组图例 */}
 <div className="flex gap-4 mt-3 pt-3 border-t border-edge">
 {Object.entries(groupColors).map(([group, color]) => (
 <div key={group} className="flex items-center gap-1">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
 <span className="text-xs text-dim capitalize">{group}</span>
 </div>
 ))}
 </div>
 </div>
 );
}

// 消息交换可视化
function MessageExchange({ phase }: { phase: HandshakePhase }) {
 const messages: Record<HandshakePhase, { client: string; server: string }[]> = {
 init: [],
 transport_select: [],
 transport_create: [
 { client: 'spawn("npx", ["-y", "@mcp/server"])', server: 'Process started (PID: 12345)' },
 ],
 capability_register: [
 { client: '→ capabilities: { roots: { listChanged: true } }', server: '' },
 ],
 connection_attempt: [
 { client: '→ initialize { protocolVersion: "2024-11-05" }', server: '← initialized { capabilities: {...} }' },
 ],
 oauth_challenge: [
 { client: '→ tools/list', server: '← 401 Unauthorized\nWWW-Authenticate: Bearer realm="..."' },
 ],
 oauth_flow: [
 { client: '→ GET /.well-known/oauth-authorization-server', server: '← { authorization_endpoint, token_endpoint }' },
 { client: '→ Browser: authorize?code_challenge=...', server: '← Redirect: callback?code=abc123' },
 { client: '→ POST /token { code, code_verifier }', server: '← { access_token: "eyJ..." }' },
 ],
 oauth_retry: [
 { client: '→ initialize (with Bearer token)', server: '← initialized { capabilities }' },
 ],
 tool_discovery: [
 { client: '→ tools/list', server: '← { tools: [{ name: "read_file", ... }, ...] }' },
 ],
 tool_register: [],
 complete: [
 { client: '→ notifications/initialized', server: '← (listening for events)' },
 ],
 };

 const currentMessages = messages[phase] || [];

 if (currentMessages.length === 0) return null;

 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-[var(--color-warning)]">💬</span>
 <span className="text-sm font-mono font-bold text-heading">消息交换</span>
 </div>
 <div className="space-y-2">
 {currentMessages.map((msg, i) => (
 <div key={i} className="grid grid-cols-2 gap-4 text-xs font-mono">
 {msg.client && (
 <div className="p-2 rounded bg-elevated/10 text-heading">
 <div className="text-[10px] text-dim mb-1">CLIENT</div>
 <pre className="whitespace-pre-wrap">{msg.client}</pre>
 </div>
 )}
 {msg.server && (
 <div className="p-2 rounded bg-elevated/10 text-heading">
 <div className="text-[10px] text-dim mb-1">SERVER</div>
 <pre className="whitespace-pre-wrap">{msg.server}</pre>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 );
}

// 状态面板
function StatePanel({ state }: { state: HandshakeState }) {
 return (
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <span className="text-heading">🔌</span>
 <span className="text-sm font-mono font-bold text-heading">连接状态</span>
 </div>
 <StatusIndicator status={state.serverStatus} />
 </div>

 <div className="space-y-3 text-xs font-mono">
 {/* Transport */}
 <div className="flex justify-between">
 <span className="text-dim">Transport:</span>
 <span className="text-heading">
 {state.transportType || '—'}
 </span>
 </div>

 {/* Capabilities */}
 <div>
 <div className="text-dim mb-1">Capabilities:</div>
 <div className="flex flex-wrap gap-1">
 {state.capabilities.length > 0 ? (
 state.capabilities.map((cap) => (
 <span
 key={cap}
 className="px-2 py-0.5 rounded bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
 >
 {cap}
 </span>
 ))
 ) : (
 <span className="text-dim">—</span>
 )}
 </div>
 </div>

 {/* OAuth Token */}
 {state.oauthToken && (
 <div className="flex justify-between">
 <span className="text-dim">OAuth Token:</span>
 <span className="text-heading">
 {state.oauthToken.slice(0, 20)}...
 </span>
 </div>
 )}

 {/* Error */}
 {state.error && (
 <div className="p-2 rounded bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
 {state.error}
 </div>
 )}

 {/* Discovered Tools */}
 <div>
 <div className="text-dim mb-1">
 Discovered Tools ({state.discoveredTools.length}):
 </div>
 <div className="flex flex-wrap gap-1">
 {state.discoveredTools.length > 0 ? (
 state.discoveredTools.map((tool) => (
 <span
 key={tool}
 className="px-2 py-0.5 rounded bg-elevated/20 text-heading"
 >
 {tool}
 </span>
 ))
 ) : (
 <span className="text-dim">—</span>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}

// 主组件
export function MCPHandshakeAnimation() {
 const [currentStep, setCurrentStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);
 const [handshakeState, setHandshakeState] = useState<HandshakeState>({
 phase: 'init',
 serverStatus: 'disconnected',
 transportType: null,
 capabilities: [],
 discoveredTools: [],
 oauthToken: null,
 error: null,
 });

 const currentStepData = handshakeSequence[currentStep];

 // 应用状态变化
 useEffect(() => {
 if (currentStepData) {
 setHandshakeState((prev) => ({
 ...prev,
 phase: currentStepData.phase,
 ...currentStepData.stateChange,
 }));
 }
 }, [currentStep, currentStepData]);

 // 自动播放
 useEffect(() => {
 if (!isPlaying) return;

 const timer = setTimeout(() => {
 if (currentStep < handshakeSequence.length - 1) {
 setCurrentStep((s) => s + 1);
 } else {
 setIsPlaying(false);
 }
 }, 2500);

 return () => clearTimeout(timer);
 }, [isPlaying, currentStep]);

 const handlePrev = useCallback(() => {
 setCurrentStep((s) => Math.max(0, s - 1));
 setIsPlaying(false);
 }, []);

 const handleNext = useCallback(() => {
 setCurrentStep((s) => Math.min(handshakeSequence.length - 1, s + 1));
 setIsPlaying(false);
 }, []);

 const handleReset = useCallback(() => {
 setCurrentStep(0);
 setIsPlaying(false);
 setHandshakeState({
 phase: 'init',
 serverStatus: 'disconnected',
 transportType: null,
 capabilities: [],
 discoveredTools: [],
 oauthToken: null,
 error: null,
 });
 }, []);

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="border- border-edge pb-4">
 <h1 className="text-2xl font-bold text-heading mb-2">
 MCP 协议握手动画
 </h1>
 <p className="text-body">
 展示 MCP 客户端与服务器的完整握手流程，包括 Transport 选择、能力注册、OAuth 认证和工具发现
 </p>
 <p className="text-xs text-dim mt-2 font-mono">
 核心代码: packages/core/src/tools/mcp-client.ts:82-1168
 </p>
 </div>

 {/* 控制栏 */}
 <div className="flex items-center justify-between bg-elevated rounded-lg p-3 border border-edge">
 <div className="flex items-center gap-2">
 <button
 onClick={handleReset}
 className="px-3 py-1.5 rounded bg-base text-body hover:text-heading border border-edge text-sm"
 >
 ↺ 重置
 </button>
 <button
 onClick={handlePrev}
 disabled={currentStep === 0}
 className="px-3 py-1.5 rounded bg-base text-body hover:text-heading border border-edge text-sm disabled:opacity-50"
 >
 ← 上一步
 </button>
 <button
 onClick={() => setIsPlaying(!isPlaying)}
 className={`px-4 py-1.5 rounded text-sm font-medium ${
 isPlaying
 ? 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]'
 : ' bg-elevated/20 text-heading border border-edge-hover'
 }`}
 >
 {isPlaying ? '⏸ 暂停' : '▶ 播放'}
 </button>
 <button
 onClick={handleNext}
 disabled={currentStep === handshakeSequence.length - 1}
 className="px-3 py-1.5 rounded bg-base text-body hover:text-heading border border-edge text-sm disabled:opacity-50"
 >
 下一步 →
 </button>
 </div>
 <div className="text-sm text-dim font-mono">
 {currentStep + 1} / {handshakeSequence.length}
 </div>
 </div>

 {/* 当前步骤标题 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-full bg-elevated/20 flex items-center justify-center text-heading font-bold">
 {currentStep + 1}
 </div>
 <div>
 <h2 className="text-lg font-bold text-heading">
 {currentStepData?.title}
 </h2>
 <p className="text-sm text-body mt-1">
 {currentStepData?.description}
 </p>
 </div>
 </div>
 </div>

 {/* 主内容区 */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* 左侧：时序图和消息 */}
 <div className="space-y-4">
 <ConnectionTimeline currentPhase={handshakeState.phase} />
 <MessageExchange phase={handshakeState.phase} />
 </div>

 {/* 右侧：状态面板 */}
 <StatePanel state={handshakeState} />
 </div>

 {/* 代码片段 */}
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className="text-heading">📄</span>
 <span className="text-sm font-mono font-bold text-heading">源码实现</span>
 </div>
 <JsonBlock code={currentStepData?.codeSnippet || ''} />
 </div>

 {/* 架构说明 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge">
 <h3 className="text-sm font-bold text-heading mb-3">架构说明</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
 <div className="p-3 rounded bg-elevated/10 border border-edge/30">
 <div className="font-bold text-heading mb-1">Transport Layer</div>
 <div className="text-body">
 支持 stdio (本地进程)、SSE (Server-Sent Events)、HTTP (Streamable) 三种传输方式
 </div>
 </div>
 <div className="p-3 rounded bg-elevated/10 border border-edge/30">
 <div className="font-bold text-heading mb-1">OAuth 自动恢复</div>
 <div className="text-body">
 遇到 401 时自动发现 OAuth 配置，完成 PKCE 流程后重试连接
 </div>
 </div>
 <div className="p-3 rounded bg-elevated/10 border border-edge/30">
 <div className="font-bold text-heading mb-1">动态工具注册</div>
 <div className="text-body">
 握手成功后调用 tools/list 发现服务器工具，注册到全局 ToolRegistry
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
