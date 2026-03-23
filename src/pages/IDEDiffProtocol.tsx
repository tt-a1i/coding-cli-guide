import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

export function IDEDiffProtocol() {
 // IDE 连接建立流程
 const connectionFlowChart = `flowchart TD
 start([CLI 启动<br/>/ide enable])
 detect[检测 IDE<br/>进程树]
 try_compat[兼容读取<br/>/tmp/gemini-ide-server-{idePid}.json]
 compat_ok{读取成功?}
 scan_dir[扫描目录<br/>/tmp/gemini/ide/]
 pick_file[筛选文件<br/>gemini-ide-server-{idePid}-*.json]
 read_port[读取端口配置<br/>{ port, workspacePath, authToken }]
 validate{验证 Workspace<br/>路径匹配?}
 mcp_connect[MCP Client<br/>建立 HTTP SSE]
 discover[发现可用工具<br/>openDiff/closeDiff]
 connected([IDEConnectionStatus<br/>= Connected])
 failed([连接失败<br/>提示安装插件])

 start --> detect
 detect --> try_compat
 try_compat --> compat_ok
 compat_ok -->|Yes| read_port
 compat_ok -->|No| scan_dir
 scan_dir --> pick_file
 pick_file --> read_port
 read_port --> validate
 validate -->|No| failed
 validate -->|Yes| mcp_connect
 mcp_connect --> discover
 discover --> connected

 style start fill:#22d3ee,color:#000
 style connected fill:#22c55e,color:#000
 style failed fill:#ef4444,color:#fff
 style validate fill:#f59e0b,color:#000
 style compat_ok fill:#f59e0b,color:#000`;

 // Diff View 完整交互流程
 const diffFlowChart = `flowchart TD
 tool([AI 调用<br/>write_file/replace])
 check_ide{IDE 已连接<br/>且支持 Diff?}
 acquire_mutex[获取 diffMutex<br/>单 Diff 锁]
 send_open[MCP: openDiff<br/>filePath, newContent]
 vscode_diff[VS Code 渲染<br/>原生 Diff View]
 user_action{用户操作}
 accept[ide/diffAccepted<br/>通知]
 reject[ide/diffClosed<br/>通知]
 write([写入磁盘])
 cancel([取消修改])
 direct([直接写入<br/>非 IDE 模式])

 tool --> check_ide
 check_ide -->|No| direct
 check_ide -->|Yes| acquire_mutex
 acquire_mutex --> send_open
 send_open --> vscode_diff
 vscode_diff --> user_action
 user_action -->|Accept| accept
 user_action -->|Cancel/Close| reject
 accept --> write
 reject --> cancel

 style tool fill:#22d3ee,color:#000
 style write fill:#22c55e,color:#000
 style cancel fill:#ef4444,color:#fff
 style direct fill:#6b7280,color:#fff
 style check_ide fill:#f59e0b,color:#000
 style user_action fill:#f59e0b,color:#000`;

 const architectureCode = `// IDE 集成架构图
// 来源: packages/vscode-ide-companion/ + packages/core/src/ide/

┌─────────────────────────────────────────────────────────────────────────────┐
│ VS Code Extension │
│ (packages/vscode-ide-companion/) │
│ │
│ ┌──────────────┐ ┌─────────────────┐ ┌──────────────────────────┐ │
│ │ extension.ts │ │ ide-server.ts │ │ diff-manager.ts │ │
│ │ │ │ │ │ │ │
│ │ DIFF_SCHEME │ │ MCP Server │ │ DiffContentProvider │ │
│ │ = 'gemini- │ │ (Express + │ │ (TextDocumentContent │ │
│ │ diff' │ │ StreamableHTTP)│ │ Provider) │ │
│ │ │ │ │ │ │ │
│ │ 注册 URI │◄───│ Tools: │◄───│ DiffManager │ │
│ │ Provider │ │ - openDiff │ │ - showDiff() │ │
│ │ │ │ - closeDiff │ │ - acceptDiff() │ │
│ └──────────────┘ │ │ │ - cancelDiff() │ │
│ │ Notifications: │ │ │ │
│ │ - ide/context │ │ 发送通知: │ │
│ │ Update │───►│ - ide/diffAccepted │ │
│ │ │ │ - ide/diffClosed │ │
│ └─────────────────┘ └──────────────────────────┘ │
│ ▲ │
│ │ HTTP SSE (:随机端口) │
│ │ Auth: Bearer Token │
└──────────────────────────────┼──────────────────────────────────────────────┘
 │
 │ MCP Protocol (JSON-RPC 2.0)
 │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│ ▼ CLI │
│ (packages/core/src/ide/) │
│ │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ ide-client.ts │ │
│ │ │ │
│ │ class IdeClient { │ │
│ │ // 单例模式 │ │
│ │ static getInstance(): Promise<IdeClient> │ │
│ │ │ │
│ │ // 连接管理 │ │
│ │ connect(): Promise<void> │ │
│ │ disconnect(): Promise<void> │ │
│ │ │ │
│ │ // Diff 操作 (带 Mutex 锁) │ │
│ │ openDiff(filePath, newContent): Promise<DiffUpdateResult> │ │
│ │ closeDiff(filePath): Promise<string | undefined> │ │
│ │ resolveDiffFromCli(filePath, outcome): Promise<void> │ │
│ │ │ │
│ │ // 状态查询 │ │
│ │ isDiffingEnabled(): boolean │ │
│ │ getConnectionStatus(): IDEConnectionState │ │
│ │ } │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘`;

 const diffSchemeCode = `// gemini-diff:// 自定义 URI Scheme
// 来源: packages/vscode-ide-companion/src/extension.ts:20

export const DIFF_SCHEME = 'gemini-diff';

// 在 activate() 中注册
context.subscriptions.push(
 vscode.workspace.registerTextDocumentContentProvider(
 DIFF_SCHEME,
 diffContentProvider
 )
);

// DiffContentProvider 实现
// 来源: packages/vscode-ide-companion/src/diff-manager.ts:16-40

export class DiffContentProvider
 implements vscode.TextDocumentContentProvider {
 private content = new Map<string, string>();

 provideTextDocumentContent(uri: vscode.Uri): string {
 // 返回 AI 生成的新内容
 return this.content.get(uri.toString()) ?? '';
 }

 setContent(uri: vscode.Uri, content: string): void {
 this.content.set(uri.toString(), content);
 this.onDidChangeEmitter.fire(uri); // 触发更新
 }
}`;

 const showDiffCode = `// showDiff 实现 - 打开 VS Code 原生 Diff View
// 来源: packages/vscode-ide-companion/src/diff-manager.ts:80-130

async showDiff(filePath: string, newContent: string) {
 const fileUri = vscode.Uri.file(filePath);

 // 1. 创建 gemini-diff:// URI (右侧 - 新内容)
 const rightDocUri = vscode.Uri.from({
 scheme: DIFF_SCHEME, // 'gemini-diff'
 path: filePath,
 query: \`rand=\${Math.random()}\`, // cache busting
 });

 // 2. 设置新内容到 Provider
 this.diffContentProvider.setContent(rightDocUri, newContent);

 // 3. 处理左侧文档 (原始内容)
 let leftDocUri;
 try {
 await vscode.workspace.fs.stat(fileUri);
 leftDocUri = fileUri; // 文件存在，用原文件
 } catch {
 // 文件不存在，用空的 untitled 文档
 leftDocUri = vscode.Uri.from({
 scheme: 'untitled',
 path: filePath,
 });
 }

 // 4. 调用 VS Code 原生 Diff 命令
 await vscode.commands.executeCommand(
 'vscode.diff',
 leftDocUri, // 左侧: 原始文件 (file://)
 rightDocUri, // 右侧: AI 修改 (gemini-diff://)
 \`\${path.basename(filePath)} ↔ Modified\`, // 标题
 { preview: false, preserveFocus: true }
 );

 // 5. 允许编辑右侧内容
 await vscode.commands.executeCommand(
 'workbench.action.files.setActiveEditorWriteableInSession'
 );
}`;

 const mcpServerCode = `// MCP Server 注册 Diff 工具
// 来源: packages/vscode-ide-companion/src/ide-server.ts:424-470

const createMcpServer = (diffManager: DiffManager) => {
 const server = new McpServer({
 name: 'gemini-cli-companion-mcp-server',
 version: '1.0.0',
 }, { capabilities: { logging: {} } });

 // openDiff 工具 - CLI 调用以打开 Diff View
 server.registerTool(
 'openDiff',
 {
 description: '(IDE Tool) Open a diff view to create or modify a file.',
 inputSchema: OpenDiffRequestSchema.shape,
 },
 async ({ filePath, newContent }) => {
 await diffManager.showDiff(filePath, newContent);
 return { content: [] }; // 结果通过 notification 异步返回
 },
 );

 // closeDiff 工具 - CLI 调用以关闭 Diff View
 server.registerTool(
 'closeDiff',
 {
 description: '(IDE Tool) Close an open diff view for a specific file.',
 inputSchema: CloseDiffRequestSchema.shape,
 },
 async ({ filePath, suppressNotification }) => {
 const content = await diffManager.closeDiff(filePath, suppressNotification);
 return {
 content: [{ type: 'text', text: JSON.stringify({ content }) }],
 };
 },
 );

 return server;
};`;

 const clientDiffCode = `// CLI 侧 Diff 调用 (带 Mutex 锁)
// 来源: packages/core/src/ide/ide-client.ts:229-282

async openDiff(
 filePath: string,
 newContent: string,
): Promise<DiffUpdateResult> {
 // 1. 获取互斥锁 - 确保同时只有一个 Diff 打开
 const release = await this.acquireMutex();

 const promise = new Promise<DiffUpdateResult>((resolve, reject) => {
 // 2. 注册 resolver 等待通知
 this.diffResponses.set(filePath, resolve);

 // 3. 发送 MCP 请求
 this.client.request({
 method: 'tools/call',
 params: {
 name: 'openDiff',
 arguments: { filePath, newContent },
 },
 }, CallToolResultSchema, { timeout: IDE_REQUEST_TIMEOUT_MS })
 .catch((err) => {
 this.diffResponses.delete(filePath);
 reject(err);
 });
 });

 // 4. 完成后释放锁
 promise.finally(release);
 return promise;
}

// 通知处理器
// 来源: packages/core/src/ide/ide-client.ts:730-756

this.client.setNotificationHandler(
 IdeDiffAcceptedNotificationSchema,
 (notification) => {
 const { filePath, content } = notification.params;
 const resolver = this.diffResponses.get(filePath);
 if (resolver) {
 resolver({ status: 'accepted', content }); // 用户接受
 this.diffResponses.delete(filePath);
 }
 },
);

this.client.setNotificationHandler(
 IdeDiffClosedNotificationSchema,
 (notification) => {
 const { filePath } = notification.params;
 const resolver = this.diffResponses.get(filePath);
 if (resolver) {
 resolver({ status: 'rejected', content: undefined }); // 用户取消
 this.diffResponses.delete(filePath);
 }
 },
);`;

 const portFileCode = `// 端口发现机制（上游 gemini-cli）
// Extension 侧：gemini-cli/packages/vscode-ide-companion/src/ide-server.ts
//
// 写入目录：/tmp/gemini/ide/
// 文件名： gemini-ide-server-{idePid}-{port}.json
// 其中 idePid = process.ppid（VS Code 进程 ID），port 为随机监听端口

const portDir = path.join(os.tmpdir(), 'gemini', 'ide');
await fs.mkdir(portDir, { recursive: true });

const portFile = path.join(
 portDir,
 \`gemini-ide-server-\${process.ppid}-\${port}.json\`,
);

await fs.writeFile(
 portFile,
 JSON.stringify({
 port,
 workspacePath,
 ppid: process.ppid,
 authToken,
 }),
 { mode: 0o600 },
);

// CLI 侧：gemini-cli/packages/core/src/ide/ide-client.ts
//
// 1) 兼容旧版本：先尝试读取 /tmp/gemini-ide-server-{idePid}.json
// 2) 新版本：扫描 /tmp/gemini/ide/ 下所有 gemini-ide-server-{idePid}-*.json
// 3) workspacePath 必须匹配当前 cwd（防止连错窗口）
// 4) 多窗口时，可用 GEMINI_CLI_IDE_SERVER_PORT 指定端口进行选择`;

 const contextSyncCode = `// IDE 上下文同步
// 来源: packages/vscode-ide-companion/src/ide-server.ts:97-118

function sendIdeContextUpdateNotification(
 transport: StreamableHTTPServerTransport,
 openFilesManager: OpenFilesManager,
) {
 const ideContext = openFilesManager.state;

 // 发送 ide/contextUpdate 通知
 transport.send(IdeContextNotificationSchema.parse({
 jsonrpc: '2.0',
 method: 'ide/contextUpdate',
 params: ideContext,
 // {
 // openFiles: ['/path/to/file.ts', ...],
 // activeFile: '/path/to/file.ts',
 // selection: { start: { line: 10, character: 0 }, end: { ... } },
 // workspaceState: { isTrusted: true }
 // }
 }));
}

// CLI 侧接收并存储上下文
// 来源: packages/core/src/ide/ide-client.ts:703-714

this.client.setNotificationHandler(
 IdeContextNotificationSchema,
 (notification) => {
 ideContextStore.set(notification.params);

 // 同步工作区信任状态
 const isTrusted = notification.params.workspaceState?.isTrusted;
 if (isTrusted !== undefined) {
 for (const listener of this.trustChangeListeners) {
 listener(isTrusted);
 }
 }
 },
);`;

 return (
 <div>
 <h2 className="text-2xl text-heading mb-5">IDE Diff 协议与伴侣插件</h2>

 {/* 1. 目标 */}
 <Layer title="目标" icon="🎯">
 <HighlightBox title="IDE Diff 协议要解决什么问题" icon="💡" variant="blue">
 <div className="text-sm space-y-2">
 <p>
 <strong>核心目标：</strong>让 AI 修改文件前，用户能在熟悉的 IDE 中预览变更，
 并通过原生 Diff View 进行审查和编辑，而非盲目接受 AI 的修改。
 </p>
 <ul className="space-y-1 text-body">
 <li>• <strong>用户控制权</strong>：AI 不直接覆写文件，用户通过 IDE 批准后才写入</li>
 <li>• <strong>可视化对比</strong>：使用 VS Code 原生 Diff View 高亮显示变更</li>
 <li>• <strong>可编辑性</strong>：用户可在接受前修改 AI 生成的内容</li>
 <li>• <strong>无缝集成</strong>：CLI 与 IDE 双向通信，无需切换上下文</li>
 </ul>
 </div>
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
 <div className="bg-elevated border-2 border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">🖥️ VS Code Extension</h4>
 <p className="text-sm text-body">
 MCP Server + DiffManager<br/>
 监听 CLI 请求，渲染 Diff View
 </p>
 </div>

 <div className="bg-elevated/10 border-2 border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">📡 MCP Protocol</h4>
 <p className="text-sm text-body">
 JSON-RPC 2.0 over HTTP SSE<br/>
 双向通信 (请求 + 通知)
 </p>
 </div>

 <div className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
 <h4 className="text-green-400 font-bold mb-2">⌨️ CLI (IdeClient)</h4>
 <p className="text-sm text-body">
 MCP Client + Mutex 锁<br/>
 发起 Diff 请求，等待用户确认
 </p>
 </div>
 </div>
 </Layer>

 {/* 2. 输入 */}
 <Layer title="输入" icon="📥">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">触发条件</h4>
 <ul className="text-sm text-body space-y-1">
 <li>• AI 调用 <code className="text-heading">write_file</code> 或 <code className="text-heading">replace</code> 工具</li>
 <li>• IDE 集成已启用（<code className="text-heading">/ide enable</code>）</li>
 <li>• VS Code 插件已安装并连接成功</li>
 <li>• 工作区路径匹配 CLI 运行目录</li>
 </ul>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">输入参数</h4>
 <ul className="text-sm text-body space-y-1">
 <li>• <code className="text-heading">filePath</code>: 要修改的文件绝对路径</li>
 <li>• <code className="text-heading">newContent</code>: AI 生成的新文件内容</li>
 <li>• <code className="text-heading">callId</code>: 工具调用唯一标识符</li>
 </ul>
 </div>
 </div>

 <HighlightBox title="前置依赖" icon="⚠️" variant="orange">
 <ul className="text-sm text-body space-y-1">
 <li>• VS Code 已打开当前项目工作区</li>
 <li>• VS Code 插件已启动 MCP Server（端口文件存在）</li>
 <li>• CLI 通过进程树检测到 IDE 进程</li>
 <li>• MCP 连接已建立（HTTP SSE 握手成功）</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* 3. 输出 */}
 <Layer title="输出" icon="📤">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-green-400 mb-3">成功输出（用户接受）</h4>
 <ul className="text-sm text-body space-y-1">
 <li>• <code className="text-green-300">DiffUpdateResult</code>: <code>{`{ status: 'accepted', content: string }`}</code></li>
 <li>• 文件内容写入磁盘（可能包含用户编辑）</li>
 <li>• Diff View 自动关闭</li>
 <li>• 释放 <code className="text-heading">diffMutex</code> 锁</li>
 </ul>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-red-400 mb-3">失败输出（用户取消）</h4>
 <ul className="text-sm text-body space-y-1">
 <li>• <code className="text-red-300">DiffUpdateResult</code>: <code>{`{ status: 'rejected', content: undefined }`}</code></li>
 <li>• 文件不被修改，保持原状</li>
 <li>• Diff View 关闭</li>
 <li>• 释放 <code className="text-heading">diffMutex</code> 锁</li>
 </ul>
 </div>
 </div>

 <HighlightBox title="副作用" icon="🔄" variant="purple">
 <ul className="text-sm text-body space-y-1">
 <li>• <strong>MCP 通知</strong>：发送 <code>ide/diffAccepted</code> 或 <code>ide/diffClosed</code></li>
 <li>• <strong>VS Code UI</strong>：打开 Diff Editor Tab，占用编辑器空间</li>
 <li>• <strong>临时 URI</strong>：创建 <code>gemini-diff://</code> scheme 的虚拟文档</li>
 <li>• <strong>工作区状态</strong>：文件可能被修改（如果用户接受）</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* 4. 关键文件与入口 */}
 <Layer title="关键文件与入口" icon="📁">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">VS Code Extension 侧</h4>
 <div className="text-sm space-y-2">
 <SourceLink
 path="packages/vscode-ide-companion/src/extension.ts:20"
 desc="DIFF_SCHEME 常量定义"
 />
 <SourceLink
 path="packages/vscode-ide-companion/src/diff-manager.ts:16-40"
 desc="DiffContentProvider 实现"
 />
 <SourceLink
 path="packages/vscode-ide-companion/src/diff-manager.ts:80-130"
 desc="showDiff() 核心逻辑"
 />
 <SourceLink
 path="packages/vscode-ide-companion/src/ide-server.ts:424-470"
 desc="MCP Server 工具注册"
 />
 <SourceLink
 path="packages/vscode-ide-companion/src/ide-server.ts:51-95"
 desc="端口文件写入逻辑"
 />
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">CLI 侧</h4>
 <div className="text-sm space-y-2">
 <SourceLink
 path="packages/core/src/ide/ide-client.ts:229-282"
 desc="IdeClient.openDiff() 实现"
 />
 <SourceLink
 path="packages/core/src/ide/ide-client.ts:571-667"
 desc="端口文件读取和连接建立"
 />
 <SourceLink
 path="packages/core/src/ide/ide-client.ts:730-756"
 desc="MCP 通知处理器"
 />
 <SourceLink
 path="packages/core/src/ide/ide-client.ts:703-714"
 desc="IDE 上下文同步"
 />
 <SourceLink
 path="packages/core/src/ide/types.ts"
 desc="MCP 消息 Schema 定义"
 />
 </div>
 </div>
 </div>

 <CodeBlock code={architectureCode} title="IDE 集成双向通信架构" />
 </Layer>

 {/* 5. 流程图 */}
 <Layer title="流程图" icon="📊">
 <div className="space-y-6">
 <div>
 <h4 className="text-lg font-semibold text-heading mb-3">连接建立流程</h4>
 <MermaidDiagram chart={connectionFlowChart} title="IDE 连接建立流程" />
 <CodeBlock code={portFileCode} title="端口发现机制实现" />
 </div>

 <div>
 <h4 className="text-lg font-semibold text-heading mb-3">Diff View 交互流程</h4>
 <MermaidDiagram chart={diffFlowChart} title="完整 Diff 交互流程" />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <CodeBlock code={clientDiffCode} title="CLI 侧 openDiff() 调用" />
 <CodeBlock code={showDiffCode} title="VS Code 侧 showDiff() 实现" />
 </div>
 </div>
 </div>
 </Layer>

 {/* 6. 关键分支与边界条件 */}
 <Layer title="关键分支与边界条件" icon="⚡">
 <div className="space-y-4">
 <HighlightBox title="Workspace 路径验证" icon="🔍" variant="orange">
 <div className="text-sm">
 <p className="mb-2">
 CLI 只会连接到 <strong>当前工作目录所属的 VS Code 窗口</strong>。
 路径验证确保安全性，防止跨项目的意外修改。
 </p>
 <ul className="space-y-1 text-body">
 <li>• <strong>匹配条件</strong>：CLI 当前目录是 VS Code 工作区的子目录</li>
 <li>• <strong>验证位置</strong>：<code>packages/core/src/ide/ide-client.ts:571-667</code></li>
 <li>• <strong>失败行为</strong>：返回 "Directory mismatch" 错误，提示安装插件</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="Mutex 锁机制" icon="🔒" variant="red">
 <div className="text-sm">
 <p className="mb-2">
 <code>diffMutex</code> 确保同时只有一个 Diff View 打开，避免 UI 竞态和用户混淆。
 </p>
 <ul className="space-y-1 text-body">
 <li>• <strong>获取锁</strong>：<code>await this.acquireMutex()</code> 在发送 MCP 请求前</li>
 <li>• <strong>释放锁</strong>：<code>promise.finally(release)</code> 在用户确认后</li>
 <li>• <strong>阻塞行为</strong>：后续请求必须等待前一个 Diff 完成</li>
 <li>• <strong>实现位置</strong>：<code>packages/core/src/ide/ide-client.ts:229-282</code></li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="新文件处理" icon="📄" variant="blue">
 <div className="text-sm">
 <p className="mb-2">
 当目标文件不存在时，左侧使用 <code>untitled:</code> URI 创建空文档。
 </p>
 <ul className="space-y-1 text-body">
 <li>• <strong>检测逻辑</strong>：<code>await vscode.workspace.fs.stat(fileUri)</code> 抛出异常</li>
 <li>• <strong>Fallback</strong>：创建 <code>untitled:</code> scheme 的临时文档</li>
 <li>• <strong>用户体验</strong>：Diff View 左侧显示空白，右侧显示完整新内容</li>
 <li>• <strong>实现位置</strong>：<code>packages/vscode-ide-companion/src/diff-manager.ts:80-130</code></li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="用户可编辑右侧内容" icon="✏️" variant="green">
 <div className="text-sm">
 <p className="mb-2">
 Diff View 右侧（AI 生成内容）是可编辑的，用户可在接受前修改。
 </p>
 <ul className="space-y-1 text-body">
 <li>• <strong>启用编辑</strong>：<code>workbench.action.files.setActiveEditorWriteableInSession</code></li>
 <li>• <strong>内容追踪</strong>：DiffContentProvider 通过 <code>onDidChange</code> 监听变化</li>
 <li>• <strong>最终内容</strong>：<code>ide/diffAccepted</code> 通知携带用户编辑后的内容</li>
 <li>• <strong>实现位置</strong>：<code>packages/vscode-ide-companion/src/diff-manager.ts:189-193</code></li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 7. 失败与恢复 */}
 <Layer title="失败与恢复" icon="🔧">
 <div className="space-y-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-red-400 mb-3">连接失败场景</h4>
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-body">
 <th className="text-left py-2">失败原因</th>
 <th className="text-left py-2">检测位置</th>
 <th className="text-left py-2">恢复策略</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2">VS Code 未安装插件</td>
 <td className="py-2">端口文件不存在</td>
 <td className="py-2">提示 <code>/ide install</code> 安装插件</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">Workspace 路径不匹配</td>
 <td className="py-2">连接验证阶段</td>
 <td className="py-2">返回 "Directory mismatch" 错误</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">MCP Server 未响应</td>
 <td className="py-2">HTTP 连接超时</td>
 <td className="py-2">降级到直接文件写入模式</td>
 </tr>
 <tr>
 <td className="py-2">进程树检测失败</td>
 <td className="py-2">IDE 进程查找</td>
 <td className="py-2">提示用户在 VS Code 中打开项目</td>
 </tr>
 </tbody>
 </table>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-yellow-400 mb-3">Diff 操作失败场景</h4>
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-body">
 <th className="text-left py-2">失败原因</th>
 <th className="text-left py-2">错误处理</th>
 <th className="text-left py-2">恢复策略</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2">用户取消 Diff</td>
 <td className="py-2"><code>ide/diffClosed</code> 通知</td>
 <td className="py-2">返回 rejected 状态，不修改文件</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">Mutex 锁等待超时</td>
 <td className="py-2">AbortSignal 触发</td>
 <td className="py-2">从队列移除，返回取消错误</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2">文件写入权限不足</td>
 <td className="py-2">文件系统错误</td>
 <td className="py-2">显示错误消息，提示检查权限</td>
 </tr>
 <tr>
 <td className="py-2">MCP 通知丢失</td>
 <td className="py-2">Promise 永久挂起</td>
 <td className="py-2">超时机制或用户手动 closeDiff</td>
 </tr>
 </tbody>
 </table>
 </div>

 <HighlightBox title="降级策略" icon="🛡️" variant="purple">
 <div className="text-sm">
 <p className="mb-2">
 当 IDE 集成不可用时，CLI 会自动降级到 <strong>直接文件写入模式</strong>：
 </p>
 <ul className="space-y-1 text-body">
 <li>• <strong>检测逻辑</strong>：<code>isDiffingEnabled()</code> 返回 false</li>
 <li>• <strong>Fallback 路径</strong>：直接调用 <code>fs.writeFile()</code> 写入内容</li>
 <li>• <strong>用户体验</strong>：失去可视化预览，但不影响核心功能</li>
 <li>• <strong>通知用户</strong>：在首次降级时提示 IDE 集成不可用</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 8. 相关配置项 */}
 <Layer title="相关配置项" icon="⚙️">
 <div className="space-y-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">环境变量</h4>
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-body">
 <th className="text-left py-2">变量名</th>
 <th className="text-left py-2">作用</th>
 <th className="text-left py-2">默认值</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-heading">GEMINI_CLI_IDE_SERVER_PORT</code></td>
 <td className="py-2">IDE Companion 端口（由扩展注入/写入）</td>
 <td className="py-2"><code>（由扩展设置）</code></td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-heading">GEMINI_CLI_IDE_WORKSPACE_PATH</code></td>
 <td className="py-2">IDE Workspace 路径（用于校验 cwd 是否在 workspace 内）</td>
 <td className="py-2"><code>（由扩展设置）</code></td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-heading">GEMINI_CLI_IDE_AUTH_TOKEN</code></td>
 <td className="py-2">IDE Companion 的鉴权 Token</td>
 <td className="py-2"><code>（由扩展设置）</code></td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-heading">GEMINI_CLI_IDE_SERVER_STDIO_COMMAND</code></td>
 <td className="py-2">Stdio 模式：命令（替代 HTTP/SSE）</td>
 <td className="py-2"><code>（可选）</code></td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-heading">GEMINI_CLI_IDE_SERVER_STDIO_ARGS</code></td>
 <td className="py-2">Stdio 模式：参数（JSON 数组字符串）</td>
 <td className="py-2"><code>[]</code></td>
 </tr>
 <tr>
 <td className="py-2"><code className="text-heading">TMPDIR</code></td>
 <td className="py-2">端口文件存储目录</td>
 <td className="py-2"><code>/tmp</code></td>
 </tr>
 </tbody>
 </table>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">CLI 命令</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated/5 rounded-lg p-3 border border-white/10">
 <code className="text-heading">/ide enable</code>
 <p className="text-sm text-body mt-1">启用 IDE 集成，建立 MCP 连接</p>
 </div>
 <div className="bg-elevated/5 rounded-lg p-3 border border-white/10">
 <code className="text-heading">/ide disable</code>
 <p className="text-sm text-body mt-1">禁用 IDE 集成，断开连接</p>
 </div>
 <div className="bg-elevated/5 rounded-lg p-3 border border-white/10">
 <code className="text-heading">/ide install</code>
 <p className="text-sm text-body mt-1">打开 VS Code Marketplace 安装插件</p>
 </div>
 <div className="bg-elevated/5 rounded-lg p-3 border border-white/10">
 <code className="text-heading">/ide status</code>
 <p className="text-sm text-body mt-1">显示当前 IDE 连接状态</p>
 </div>
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">VS Code 插件配置</h4>
 <ul className="text-sm text-body space-y-2">
 <li>
 <strong className="text-heading">gemini.enableDiffMode</strong>
 <p className="text-body mt-1">启用/禁用 Diff View 功能（默认：true）</p>
 </li>
 <li>
 <strong className="text-heading">gemini.autoAcceptDiff</strong>
 <p className="text-body mt-1">自动接受所有 Diff（不推荐，默认：false）</p>
 </li>
 <li>
 <strong className="text-heading">gemini.diffTimeout</strong>
 <p className="text-body mt-1">Diff View 超时自动关闭时间（秒，默认：300）</p>
 </li>
 </ul>
 </div>
 </div>

 <HighlightBox title="端口文件格式" icon="📄" variant="blue">
 <div className="text-sm">
 <p className="mb-2">
 端口文件位于 <code>/tmp/gemini/ide/gemini-ide-server-&lt;idePid&gt;-&lt;port&gt;.json</code>（兼容旧版：
 <code className="ml-1">/tmp/gemini-ide-server-&lt;idePid&gt;.json</code>）：
 </p>
 <CodeBlock
 code={`{
 "port": 54321,
 "workspacePath": "/Users/dev/project",
 "ppid": 12345,
 "authToken": "bearer-token-xxx"
}`}
 language="json"
 title="端口文件内容示例"
 />
 </div>
 </HighlightBox>
 </Layer>

 {/* 技术细节补充 */}
 <Layer title="技术细节补充" icon="🔍">
 <div className="space-y-4">
 <CodeBlock code={diffSchemeCode} title="gemini-diff:// URI Scheme 实现" />

 <div className="bg-base/30 rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">URI 结构示例</h4>
 <div className="space-y-2 text-sm font-mono">
 <div className="flex items-start gap-2">
 <span className="text-body">左侧 (原始):</span>
 <code className="text-green-400">file:///Users/dev/project/src/app.ts</code>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-body">右侧 (修改):</span>
 <code className="text-heading">gemini-diff:///Users/dev/project/src/app.ts?rand=0.123</code>
 </div>
 </div>
 </div>

 <CodeBlock code={mcpServerCode} title="MCP Server 工具注册" />

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-bold mb-3">MCP 通知类型</h4>
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-body">
 <th className="text-left py-2">通知方法</th>
 <th className="text-left py-2">触发条件</th>
 <th className="text-left py-2">参数</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-green-400">ide/diffAccepted</code></td>
 <td>用户点击 Accept</td>
 <td><code>{`{filePath, content}`}</code></td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2"><code className="text-red-400">ide/diffClosed</code></td>
 <td>用户关闭 Diff View</td>
 <td><code>{`{filePath, content}`}</code></td>
 </tr>
 <tr>
 <td className="py-2"><code className="text-heading">ide/contextUpdate</code></td>
 <td>文件打开/切换/选择变化</td>
 <td><code>{`{openFiles, activeFile, selection}`}</code></td>
 </tr>
 </tbody>
 </table>
 </div>

 <CodeBlock code={contextSyncCode} title="IDE 上下文双向同步" />

 <HighlightBox title="工作区信任状态同步" icon="🔐" variant="green">
 <p className="text-sm">
 VS Code 的工作区信任状态通过 <code>workspaceState.isTrusted</code> 同步到 CLI。
 当用户在 VS Code 中信任工作区时，CLI 会自动更新信任状态，影响工具执行权限。
 </p>
 </HighlightBox>
 </div>
 </Layer>
 </div>
 );
}

function SourceLink({ path, desc }: { path: string; desc: string }) {
 return (
 <div className="flex items-center gap-2">
 <code className="bg-base/30 px-2 py-1 rounded">{path}</code>
 <span className="text-body">{desc}</span>
 </div>
 );
}
