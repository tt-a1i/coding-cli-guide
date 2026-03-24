import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



const relatedPages: RelatedPage[] = [
 { id: 'ide-diff', label: 'IDE Diff 协议', description: '深入理解 gemini-diff:// 虚拟文档机制' },
 { id: 'ide-integration-overview', label: 'IDE 集成总览', description: 'IDE 集成的架构概述' },
 { id: 'zed-integration', label: 'Zed 集成', description: 'Zed 编辑器的集成方案' },
 { id: 'mcp', label: 'MCP 集成', description: 'MCP 协议在 IDE 集成中的应用' },
 { id: 'trusted-folders', label: '信任文件夹', description: 'IDE 信任状态与安全管理' },
 { id: 'extension', label: '扩展系统', description: 'CLI 扩展机制与 IDE 扩展的关系' },
];

export function IDEIntegration() {
 const connectionFlowChart = `flowchart TD
 start(["启动 CLI<br/>&#40;在 IDE 终端&#41;"])
 detect_env["检测环境变量<br/>GEMINI_CLI_IDE_*"]
 has_env{"有环境变量?"}
 check_ext["检查扩展<br/>是否安装"]
 ext_ok{"扩展可用?"}
 connect["建立连接<br/>HTTP/SSE"]
 check_workspace{"验证工作区<br/>路径匹配"}
 connected(["连接成功<br/>启用 IDE 功能"])
 show_nudge["提示安装<br/>扩展"]
 standalone(["独立模式<br/>&#40;无 IDE 功能&#41;"])

 start --> detect_env
 detect_env --> has_env
 has_env -->|No| standalone
 has_env -->|Yes| check_ext
 check_ext --> ext_ok
 ext_ok -->|No| show_nudge
 ext_ok -->|Yes| connect
 show_nudge --> standalone
 connect --> check_workspace
 check_workspace -->|Match| connected
 check_workspace -->|Mismatch| standalone

 classDef start fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 classDef success fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 classDef decision fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 classDef hint fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}

 class start start
 class connected,standalone success
 class has_env,ext_ok,check_workspace decision
 class show_nudge hint`;

 const diffFlowChart = `flowchart TD
 start(["AI 提议<br/>修改文件"])
 check_ide{"IDE 已连接?"}
 call_mcp["调用 MCP<br/>openDiff 工具"]
 cli_diff["在 CLI 中<br/>显示 Diff"]
 set_content["DiffContentProvider<br/>设置虚拟文档内容"]
 open_diff["vscode.diff<br/>打开对比视图"]
 user_action{用户操作}
 accept(["接受修改<br/>ide/diffAccepted"])
 reject(["拒绝修改<br/>ide/diffRejected"])

 start --> check_ide
 check_ide -->|No| cli_diff
 check_ide -->|Yes| call_mcp
 call_mcp --> set_content
 set_content --> open_diff
 open_diff --> user_action
 cli_diff --> user_action
 user_action -->|✓ / Cmd+S| accept
 user_action -->|✗ / 关闭| reject

 style start fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style accept fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style reject fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:${getThemeColor("--color-text", "#1c1917")}
 style check_ide fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style user_action fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}`;

 return (
 <div className="space-y-8">
 {/* 概述 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">IDE 集成</h2>
 <p className="text-body mb-4">
 CLI 可以与 IDE 集成，提供更无缝的开发体验。支持的 IDE 包括 Visual Studio Code
 及其兼容编辑器。通过 IDE Companion 扩展，可以获得原生 Diff 视图、工作区上下文等功能。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="工作区上下文" variant="blue">
 <ul className="text-sm text-body space-y-1">
 <li>最近访问的 10 个文件</li>
 <li>当前光标位置</li>
 <li>选中的文本 (最多 16KB)</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="原生 Diff" variant="green">
 <ul className="text-sm text-body space-y-1">
 <li>在 IDE 中查看修改</li>
 <li>支持编辑后接受</li>
 <li>熟悉的 Diff 界面</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="信任同步" variant="purple">
 <ul className="text-sm text-body space-y-1">
 <li>自动获取 IDE 信任状态</li>
 <li>统一的安全管理</li>
 <li>与 Trusted Folders 集成</li>
 </ul>
 </HighlightBox>
 </div>
 </section>

 {/* 集成边界：什么能做/不能做 */}
 <section className="bg-surface/30 rounded-lg border border-edge/50 p-6">
 <h3 className="text-xl font-semibold text-heading mb-4">集成边界：什么能做/不能做</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">IDE 集成能做</h4>
 <ul className="text-sm text-body space-y-2">
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <span><strong>原生 Diff 视图</strong> — 在 IDE 中查看/编辑/接受修改</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <span><strong>上下文同步</strong> — 获取打开的文件、光标位置、选中文本</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <span><strong>信任状态</strong> — 继承 IDE 工作区信任设置</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <span><strong>终端内启动</strong> — 在 IDE 集成终端直接运行</span>
 </li>
 </ul>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">IDE 集成不能做</h4>
 <ul className="text-sm text-body space-y-2">
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <span><strong>代码补全</strong> — 没有 inline completion provider</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <span><strong>实时诊断</strong> — 不提供 diagnostics/linting</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <span><strong>代码导航</strong> — 不实现 go-等</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <span><strong>重构工具</strong> — 没有 rename/extract method 等</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <span><strong>调试集成</strong> — 不与 debugger 交互</span>
 </li>
 </ul>
 </div>
 </div>
 <div className="mt-4 bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">设计哲学</h4>
 <p className="text-sm text-body">
 IDE 集成的定位是<strong>增强 CLI 体验</strong>，而非替代传统 IDE 插件。核心价值是
 <span className="text-heading mx-1">Native Diff</span>和
 <span className="text-heading mx-1">Context Sync</span>，让用户在熟悉的 IDE 环境中审查 AI 修改。
 代码补全、诊断等功能由专业语言服务器提供，不在 CLI 集成范围内。
 </p>
 </div>
 </section>

 {/* 支持的 IDE */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">IDE 支持矩阵</h3>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
 <div className="bg-elevated/20 border border-edge rounded-lg p-4 text-center">
 <span className="text-3xl">📘</span>
 <p className="text-heading font-semibold mt-2">VS Code</p>
 <p className="text-body text-xs">完全支持</p>
 <div className="mt-2 px-2 py-1 bg-elevated text-heading text-xs rounded">Official</div>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4 text-center">
 <span className="text-3xl">📗</span>
 <p className="text-heading font-semibold mt-2">VSCodium</p>
 <p className="text-body text-xs">通过 Open VSX</p>
 <div className="mt-2 px-2 py-1 bg-elevated text-heading text-xs rounded">Compatible</div>
 </div>
 <div className="bg-elevated border border-edge rounded-lg p-4 text-center">
 <span className="text-3xl">📕</span>
 <p className="text-heading font-semibold mt-2">Cursor</p>
 <p className="text-body text-xs">兼容 VSCode 扩展</p>
 <div className="mt-2 px-2 py-1 bg-elevated text-heading text-xs rounded">Compatible</div>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4 text-center">
 <span className="text-3xl">⚡</span>
 <p className="text-heading font-semibold mt-2">Zed</p>
 <p className="text-body text-xs">Terminal + Context</p>
 <div className="mt-2 px-2 py-1 bg-elevated text-heading text-xs rounded">Partial</div>
 </div>
 <div className="bg-surface border border-edge rounded-lg p-4 text-center">
 <span className="text-3xl">📓</span>
 <p className="text-body font-semibold mt-2">JetBrains</p>
 <p className="text-dim text-xs">需自定义集成</p>
 <div className="mt-2 px-2 py-1 bg-elevated/30 text-body text-xs rounded">Manual</div>
 </div>
 </div>
 </section>

 {/* Zed 集成详情 */}
 <Layer title="Zed 集成">
 <HighlightBox title="Zed 支持状态" variant="yellow">
 <p className="text-sm mb-2">
 <strong className="text-heading">Zed</strong> 是一款高性能的现代编辑器。
 Gemini CLI 可在 Zed 的集成终端中运行，但原生 Diff 功能需要额外配置。
 </p>
 </HighlightBox>

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">Zed 中可用</h4>
 <ul className="text-sm text-body space-y-1">
 <li>在集成终端中运行 CLI</li>
 <li>使用 CLI 内置 Diff 视图</li>
 <li>读取/写入文件</li>
 <li>执行 shell 命令</li>
 <li>使用 MCP 服务器 (通过 Zed MCP 支持)</li>
 </ul>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">Zed 限制</h4>
 <ul className="text-sm text-body space-y-1">
 <li>无 Companion 扩展 — Zed 扩展 API 不同</li>
 <li>无原生 Diff — 需使用 CLI 内置 Diff</li>
 <li>无上下文同步 — 无法获取打开文件列表</li>
 <li>无信任状态继承</li>
 </ul>
 </div>
 </div>

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">Zed 使用方式</h4>
 <CodeBlock
 title="在 Zed 中使用 Gemini CLI"
 language="bash"
 code={`# 1. 在 Zed 中打开项目
zed ~/my-project

# 2. 打开集成终端 (Cmd+J 或 Ctrl+J)
# 3. 运行 CLI
gemini

# 4. CLI 使用内置 Diff 视图 (自动检测到非 VSCode 环境)
# AI 修改会在终端内显示 Diff，而不是打开 IDE Diff 视图

# 5. (可选) 配置 Zed 的 MCP 支持
# 在 ~/.config/zed/settings.json 中配置 MCP 服务器
{
 "language_models": {
 "mcp_servers": {
 "gemini-context": {
 "command": "gemini",
 "args": ["mcp-server"]
 }
 }
 }
}`}
 />
 </div>

 <HighlightBox title="未来展望" variant="purple" className="mt-4">
 <p className="text-sm text-body">
 Zed 的扩展系统正在快速发展。当 Zed 支持类似 VS Code 的扩展 API 时，
 可以开发 Zed 专用的 Companion 扩展，提供原生 Diff 和上下文同步功能。
 目前建议 Zed 用户依赖 CLI 内置功能。
 </p>
 </HighlightBox>
 </Layer>

 {/* JetBrains 集成状态 */}
 <Layer title="JetBrains IDE 集成">
 <HighlightBox title="JetBrains 支持状态" variant="purple">
 <p className="text-sm mb-2">
 JetBrains IDE (IntelliJ IDEA, WebStorm, PyCharm 等) 使用不同的插件架构，
 目前没有官方 Companion 插件。CLI 可以在 JetBrains 终端中运行。
 </p>
 </HighlightBox>

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">可用功能</h4>
 <ul className="text-sm text-body space-y-1">
 <li>在终端工具窗口运行 CLI</li>
 <li>使用 CLI 内置 Diff</li>
 <li>文件读写操作</li>
 <li>所有 CLI 核心功能</li>
 </ul>
 </div>
 <div className="bg-surface border border-edge rounded-lg p-4">
 <h4 className="text-body font-semibold mb-2">社区贡献</h4>
 <p className="text-sm text-body">
 欢迎开发 JetBrains 插件！需要实现：
 </p>
 <ul className="text-xs text-body mt-2 space-y-1">
 <li>HTTP Server + MCP 协议</li>
 <li>Diff 工具接口</li>
 <li>工作区上下文 API</li>
 </ul>
 </div>
 </div>
 </Layer>

 {/* IDEServer 架构 */}
 <Layer title="IDEServer 架构">
 <div className="bg-surface rounded-lg p-6 mb-4">
 <h4 className="text-heading font-bold mb-3">核心组件</h4>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-elevated/10 border border-edge rounded-lg p-3">
 <h5 className="text-heading font-semibold mb-2">Express HTTP Server</h5>
 <p className="text-xs text-body">监听 127.0.0.1 随机端口，处理 HTTP/SSE 请求</p>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-3">
 <h5 className="text-heading font-semibold mb-2">MCP Server</h5>
 <p className="text-xs text-body">提供 openDiff 和 closeDiff 两个工具</p>
 </div>
 <div className="bg-elevated border border-edge rounded-lg p-3">
 <h5 className="text-heading font-semibold mb-2">DiffManager</h5>
 <p className="text-xs text-body">管理虚拟文档和 Diff 视图状态</p>
 </div>
 </div>
 </div>

 <CodeBlock
 title="IDEServer 启动流程"
 language="typescript"
 code={`class IDEServer {
 private server: HTTPServer;
 private authToken: string; // 随机 UUID

 async start(context: ExtensionContext) {
 this.authToken = randomUUID(); // 生成认证令牌

 const app = express();
 app.use(express.json({ limit: '10mb' }));

 // CORS 保护 - 仅允许非浏览器请求
 app.use(cors({
 origin: (origin, callback) => {
 if (!origin) return callback(null, true); // CLI 请求无 origin
 return callback(new Error('Denied'), false);
 },
 }));

 // Host 头验证
 app.use((req, res, next) => {
 const allowedHosts = ['localhost:' + port, '127.0.0.1:' + port];
 if (!allowedHosts.includes(req.headers.host)) {
 return res.status(403).send('Invalid Host');
 }
 next();
 });

 // Bearer Token 认证
 app.use((req, res, next) => {
 const token = req.headers.authorization?.split(' ')[1];
 if (token && token !== this.authToken) {
 return res.status(401).send('Unauthorized');
 }
 next();
 });

 // MCP 端点
 app.post('/mcp', async (req, res) => {
 await transport.handleRequest(req, res, req.body);
 });

 this.server = app.listen(0, '127.0.0.1');
 }
}`}
 />

 <HighlightBox title="三层安全认证" variant="green" className="mt-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
 <div>
 <h5 className="font-semibold text-heading">1. CORS 保护</h5>
 <p className="text-body text-xs">拒绝浏览器请求，仅接受 CLI 请求</p>
 </div>
 <div>
 <h5 className="font-semibold text-heading">2. Host 头验证</h5>
 <p className="text-body text-xs">仅允许 localhost/127.0.0.1</p>
 </div>
 <div>
 <h5 className="font-semibold text-heading">3. Bearer Token</h5>
 <p className="text-body text-xs">每次启动生成随机 UUID</p>
 </div>
 </div>
 </HighlightBox>
 </Layer>

 {/* gemini-diff scheme */}
 <Layer title="gemini-diff:// 虚拟文档机制">
 <HighlightBox title="技术原理" variant="blue">
 <p className="text-sm mb-2">
 VS Code 的 Diff 视图需要两个文档 URI：左侧（原始）和右侧（修改后）。
 <code className="text-heading mx-1">gemini-diff://</code> 是自定义的虚拟文档 scheme，
 用于提供 AI 提议的新内容，而无需实际写入文件。
 </p>
 </HighlightBox>

 <CodeBlock
 title="URI 构造规则"
 language="typescript"
 code={`// gemini-diff:// URI 构造
const DIFF_SCHEME = 'gemini-diff';

const rightDocUri = vscode.Uri.from({
 scheme: DIFF_SCHEME, // 'gemini-diff'
 path: filePath, // 原始文件的绝对路径
 query: \`rand=\${Math.random()}\` // 缓存清除
});

// 示例 URI:
// gemini-diff:///Users/dev/project/src/utils.ts?rand=0.123456`}
 />

 <CodeBlock
 title="DiffContentProvider 实现"
 language="typescript"
 code={`// 虚拟文档内容提供者
class DiffContentProvider implements TextDocumentContentProvider {
 private content = new Map<string, string>(); // URI → 内容
 private onDidChangeEmitter = new EventEmitter<Uri>();

 get onDidChange(): Event<Uri> {
 return this.onDidChangeEmitter.event;
 }

 // VS Code 请求文档内容时调用
 provideTextDocumentContent(uri: Uri): string {
 return this.content.get(uri.toString()) ?? '';
 }

 // 设置虚拟文档内容
 setContent(uri: Uri, content: string): void {
 this.content.set(uri.toString(), content);
 this.onDidChangeEmitter.fire(uri); // 通知内容变更
 }

 // 删除虚拟文档
 deleteContent(uri: Uri): void {
 this.content.delete(uri.toString());
 }
}`}
 />

 <div className="bg-base/30 rounded-lg p-6 mt-4">
 <h4 className="text-heading font-bold mb-4">Diff 视图打开流程</h4>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
 <div className="bg-elevated/10 border border-edge rounded-lg p-3">
 <h5 className="text-heading font-semibold mb-2">1. 构建 URI</h5>
 <pre className="text-xs text-body">
{`gemini-diff://
 /path/to/file.ts
 ?rand=0.xxx`}
 </pre>
 </div>
 <div className="bg-elevated border border-edge rounded-lg p-3">
 <h5 className="text-heading font-semibold mb-2">2. 设置内容</h5>
 <pre className="text-xs text-body">
{`provider.setContent(
 rightDocUri,
 newContent
);`}
 </pre>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-3">
 <h5 className="text-heading font-semibold mb-2">3. 打开 Diff</h5>
 <pre className="text-xs text-body">
{`vscode.commands
 .executeCommand(
 'vscode.diff',
 leftUri, rightUri
);`}
 </pre>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-3">
 <h5 className="text-heading font-semibold mb-2">4. 允许编辑</h5>
 <pre className="text-xs text-body">
{`executeCommand(
 'workbench.action
 .files.setActive
 EditorWriteable...'
);`}
 </pre>
 </div>
 </div>
 </div>

 <HighlightBox title="左侧文档选择策略" variant="purple" className="mt-4">
 <ul className="text-sm space-y-1">
 <li>如果文件存在：使用 <code>file://</code> 真实文件 URI</li>
 <li>如果是新文件：使用 <code>untitled:</code> scheme (空文档)</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* MCP 工具 */}
 <Layer title="MCP 工具接口">
 <CodeBlock
 title="openDiff / closeDiff 工具"
 language="typescript"
 code={`// MCP Server 注册工具
const mcpServer = new McpServer({
 name: 'gemini-cli-companion-mcp-server',
 version: '1.0.0',
});

// 工具 1: openDiff - 打开 Diff 视图
server.registerTool('openDiff', {
 description: '(IDE Tool) Open a diff view showing changes',
 inputSchema: {
 type: 'object',
 properties: {
 filePath: { type: 'string', description: '文件绝对路径' },
 newContent: { type: 'string', description: '新内容' },
 },
 required: ['filePath', 'newContent'],
 },
}, async ({ filePath, newContent }) => {
 await diffManager.showDiff(filePath, newContent);
 return { content: [] };
});

// 工具 2: closeDiff - 关闭 Diff 视图
server.registerTool('closeDiff', {
 description: '(IDE Tool) Close an open diff view',
 inputSchema: {
 type: 'object',
 properties: {
 filePath: { type: 'string' },
 suppressNotification: { type: 'boolean' },
 },
 required: ['filePath'],
 },
}, async ({ filePath, suppressNotification }) => {
 const content = await diffManager.closeDiff(filePath, suppressNotification);
 return { content: [{ type: 'text', text: JSON.stringify({ content }) }] };
});`}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">openDiff</h4>
 <ul className="text-sm space-y-1">
 <li><strong>输入</strong>: filePath, newContent</li>
 <li><strong>输出</strong>: 空 (异步等待用户操作)</li>
 <li><strong>通知</strong>: ide/diffAccepted 或 ide/diffRejected</li>
 </ul>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">closeDiff</h4>
 <ul className="text-sm space-y-1">
 <li><strong>输入</strong>: filePath, suppressNotification?</li>
 <li><strong>输出</strong>: 当前编辑器中的内容</li>
 <li><strong>用途</strong>: 强制关闭或获取编辑后内容</li>
 </ul>
 </div>
 </div>
 </Layer>

 {/* 连接流程 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">连接流程</h3>
 <MermaidDiagram chart={connectionFlowChart} title="IDE 连接流程" />
 </section>

 {/* 连接配置 */}
 <Layer title="连接配置与持久化">
 <CodeBlock
 title="临时文件位置"
 language="text"
 code={`# 主文件 (多窗口支持：ppid + port)
/tmp/gemini/ide/gemini-ide-server-{ppid}-{port}.json

# 兼容旧版本（落在 /tmp 根目录）
/tmp/gemini-ide-server-{pid}.json

# 文件内容
{
 "port": 54321,
 "workspacePath": "/path/to/project",
 "ppid": 12345,
 "authToken": "uuid-string"
}

# 权限: chmod 0o600 (仅当前用户可读)`}
 />

 <CodeBlock
 title="环境变量"
 language="text"
 code={`# 由 IDE Companion 扩展设置
GEMINI_CLI_IDE_SERVER_PORT=54321
GEMINI_CLI_IDE_WORKSPACE_PATH=/path/to/project

# 多工作区用 path.delimiter 分隔
GEMINI_CLI_IDE_WORKSPACE_PATH=/path1:/path2

# Stdio 模式 (替代 HTTP)
GEMINI_CLI_IDE_SERVER_STDIO_COMMAND=node
GEMINI_CLI_IDE_SERVER_STDIO_ARGS=["extension.js"]`}
 />

 <HighlightBox title="容器支持" variant="blue" className="mt-4">
 <p className="text-sm mb-2">
 在 Docker/Podman 容器中运行时，CLI 自动检测容器环境并使用
 <code className="mx-1 text-heading">host.docker.internal</code> 连接宿主机。
 </p>
 <CodeBlock
   language="typescript"
   title="getIdeServerHost"
   code={`function getIdeServerHost() {
  const isInContainer =
    fs.existsSync('/.dockerenv') ||
    fs.existsSync('/run/.containerenv');
  return isInContainer ? 'host.docker.internal' : '127.0.0.1';
}`}
 />
 </HighlightBox>
 </Layer>

 {/* 工作区上下文 */}
 <Layer title="工作区上下文同步">
 <CodeBlock
 title="OpenFilesManager 实现"
 language="typescript"
 code={`class OpenFilesManager {
 private openFiles: File[] = []; // 最多 10 个文件

 constructor(context: ExtensionContext) {
 // 监听编辑器活动
 vscode.window.onDidChangeActiveTextEditor((editor) => {
 if (editor) this.addOrMoveToFront(editor);
 });

 // 监听选区变更
 vscode.window.onDidChangeTextEditorSelection((event) => {
 this.updateActiveContext(event.textEditor);
 });

 // 监听文件关闭/删除/重命名
 vscode.workspace.onDidCloseTextDocument((doc) => this.remove(doc.uri));
 vscode.workspace.onDidDeleteFiles((e) => ...);
 vscode.workspace.onDidRenameFiles((e) => ...);
 }

 get state(): IDEContext {
 return {
 workspaceState: {
 openFiles: this.openFiles,
 isTrusted: vscode.workspace.isTrusted,
 }
 };
 }
}`}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div className="bg-elevated/10 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">File 数据结构</h4>
 <pre className="text-xs">
{`{
 path: string, // 绝对路径
 timestamp: number, // 最后聚焦时间
 isActive: boolean, // 是否为当前文件
 selectedText?: string, // 选中文本
 cursor?: {
 line: number, // 1-based
 character: number // 0-based
 }
}`}
 </pre>
 </div>
 <div className="bg-elevated border border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">限制与优化</h4>
 <ul className="text-sm space-y-1">
 <li>最多保留 <strong>10 个</strong>最近文件</li>
 <li>选中文本最多 <strong>16 KB</strong></li>
 <li>50ms 防抖，减少频繁更新</li>
 <li>按时间戳倒序排列</li>
 </ul>
 </div>
 </div>

 <HighlightBox title="上下文通知" variant="green" className="mt-4">
 <p className="text-sm mb-2">
 上下文变更通过 <code>ide/contextUpdate</code> 通知推送给 CLI：
 </p>
 <ul className="text-sm space-y-1">
 <li>新会话初始化时</li>
 <li>打开的文件列表变更时</li>
 <li>Diff 状态变更时</li>
 <li>工作区信任状态变更时</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* Native Diff */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">原生 Diff 视图</h3>
 <MermaidDiagram chart={diffFlowChart} title="Native Diff 工作流" />

 <div className="mt-4 bg-base rounded-lg p-4 border border-edge">
 <h4 className="text-heading font-semibold mb-3">Diff 视图示例</h4>
 <div className="grid grid-cols-2 gap-4 text-sm font-mono">
 <div className="bg-elevated p-3 rounded">
 <p className="text-body mb-2">// 原始文件 (file://)</p>
 <p className="text-heading">- function hello() {'{'}</p>
 <p className="text-heading">- console.log("Hello");</p>
 <p className="text-heading">- {'}'}</p>
 </div>
 <div className="bg-elevated p-3 rounded">
 <p className="text-body mb-2">// 修改后 (gemini-diff://)</p>
 <p className="text-heading">+ function hello(name: string) {'{'}</p>
 <p className="text-heading">+ console.log(`Hello, ${'{'}name{'}'}`)</p>
 <p className="text-heading">+ {'}'}</p>
 </div>
 </div>
 <div className="flex gap-4 mt-4 justify-center">
 <button className="px-4 py-2 bg-[var(--color-success)] text-heading rounded flex items-center gap-2">
 Accept (Cmd+S)
 </button>
 <button className="px-4 py-2 bg-[var(--color-danger)] text-heading rounded flex items-center gap-2">
 Reject
 </button>
 </div>
 </div>

 <HighlightBox title="用户可编辑" variant="blue" className="mt-4">
 <p className="text-sm">
 打开 Diff 后会自动执行 <code>setActiveEditorWriteableInSession</code>，
 允许用户直接在右侧编辑内容。接受时会保存用户编辑后的版本。
 </p>
 </HighlightBox>
 </section>

 {/* Diff 互斥锁 */}
 <Layer title="Diff 互斥锁机制">
 <CodeBlock
 title="Mutex 实现"
 language="typescript"
 code={`class IdeClient {
 private diffMutex = Promise.resolve();
 private diffResponses = new Map<string, (result) => void>();

 async openDiff(filePath: string, newContent: string): Promise<DiffResult> {
 // 获取互斥锁 - 确保一次仅一个 Diff
 const release = await this.acquireMutex();

 try {
 const promise = new Promise((resolve, reject) => {
 this.diffResponses.set(filePath, resolve);

 // 发送 MCP 工具调用
 this.client.request({
 method: 'tools/call',
 params: { name: 'openDiff', arguments: { filePath, newContent } },
 }, { timeout: 10 * 60 * 1000 }); // 10 分钟超时
 });

 return await promise;
 } finally {
 release(); // 释放锁
 }
 }

 private async acquireMutex(): Promise<() => void> {
 let release: () => void;
 const newMutex = new Promise<void>((resolve) => { release = resolve; });
 const oldMutex = this.diffMutex;
 this.diffMutex = newMutex;
 await oldMutex; // 等待前一个 Diff 完成
 return release!;
 }
}`}
 />

 <HighlightBox title="为什么需要互斥锁？" variant="yellow">
 <ul className="text-sm space-y-1">
 <li>避免多个 Diff 视图同时打开造成混乱</li>
 <li>确保用户按顺序处理每个修改建议</li>
 <li>防止 Promise 解析错乱</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* IDE 命令 */}
 <Layer title="IDE 命令">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">CLI 命令</h4>
 <table className="w-full text-sm">
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="p-2"><code>/ide install</code></td>
 <td className="p-2">安装 Companion 扩展</td>
 </tr>
 <tr className="border- border-edge">
 <td className="p-2"><code>/ide enable</code></td>
 <td className="p-2">启用 IDE 连接</td>
 </tr>
 <tr className="border- border-edge">
 <td className="p-2"><code>/ide disable</code></td>
 <td className="p-2">禁用 IDE 连接</td>
 </tr>
 <tr>
 <td className="p-2"><code>/ide status</code></td>
 <td className="p-2">查看连接状态和上下文</td>
 </tr>
 </tbody>
 </table>
 </div>

 <div className="bg-surface rounded-lg p-4 mt-4">
 <h4 className="font-semibold text-heading mb-3">VS Code 命令面板</h4>
 <table className="w-full text-sm">
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="p-2"><code>Gemini CLI: Run</code></td>
 <td className="p-2">启动新的 CLI 会话</td>
 </tr>
 <tr className="border- border-edge">
 <td className="p-2"><code>Gemini CLI: Accept Diff</code></td>
 <td className="p-2">接受当前 Diff 视图中的修改</td>
 </tr>
 <tr>
 <td className="p-2"><code>Gemini CLI: Close Diff Editor</code></td>
 <td className="p-2">拒绝修改并关闭 Diff 视图</td>
 </tr>
 </tbody>
 </table>
 </div>

 <HighlightBox title="快捷键: Ctrl+G" variant="blue" className="mt-4">
 <p className="text-sm text-body">
 按 <kbd className="px-2 py-1 bg-elevated rounded">Ctrl+G</kbd> 可快速查看 CLI 从 IDE 接收到的上下文信息。
 </p>
 </HighlightBox>
 </Layer>

 {/* 故障排查 */}
 <Layer title="故障排查">
 <div className="space-y-3 text-sm">
 <div className="p-3 bg-elevated rounded">
 <p className="text-heading font-mono">Failed to connect to IDE companion extension</p>
 <p className="text-body mt-1">
 → 确保扩展已安装且 IDE 已打开，在 IDE 集成终端中启动 CLI
 </p>
 </div>
 <div className="p-3 bg-elevated rounded">
 <p className="text-heading font-mono">Directory mismatch</p>
 <p className="text-body mt-1">
 → CLI 工作目录必须在 IDE 工作区内，使用 <code>cd</code> 切换到正确目录
 </p>
 </div>
 <div className="p-3 bg-elevated rounded">
 <p className="text-heading font-mono">To use this feature, please open a workspace</p>
 <p className="text-body mt-1">
 → 在 IDE 中打开项目文件夹，不是单个文件
 </p>
 </div>
 <div className="p-3 bg-elevated rounded">
 <p className="text-heading font-mono">容器中连接失败</p>
 <p className="text-body mt-1">
 → 确保容器可以访问 <code>host.docker.internal</code>，检查网络配置
 </p>
 </div>
 </div>
 </Layer>

 {/* 架构图 */}
 <Layer title="集成架构总览">
 <MermaidDiagram chart={`flowchart TD
 subgraph VSCode["Visual Studio Code"]
  subgraph Extension["IDE Companion Extension"]
   IDEServer["IDEServer<br/>Express HTTP<br/>+ MCP Server"]
   DiffManager["DiffManager<br/>gemini-diff://<br/>Provider"]
   OpenFiles["OpenFilesManager<br/>Context Sync"]
  end

  Terminal["Integrated Terminal<br/>$ gemini"]

  IDEServer -->|"HTTP/SSE"| Terminal
  DiffManager -->|"Diff Events"| Terminal
  OpenFiles -->|"Context"| Terminal
 end

 EnvVars["GEMINI_CLI_IDE_*<br/>Environment Vars<br/>/tmp/gemini/ide/gemini-ide-server-*<br/>Connection Files"]

 subgraph CLI["Gemini CLI"]
  subgraph Integration["IDE Integration"]
   IdeClient["IdeClient<br/>MCP Client<br/>HTTP/SSE Connection"]
   IdeContext["IdeContextStore<br/>Subscribe to updates"]
   DiffHandler["DiffHandler<br/>openDiff<br/>Mutex<br/>10min timeout"]
  end
 end

 Terminal --> EnvVars
 EnvVars --> CLI

 style VSCode fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style Extension fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style CLI fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style Integration fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style EnvVars fill:${getThemeColor("--mermaid-muted-fill", "#f4f4f2")},color:${getThemeColor("--color-text", "#1c1917")}
`} title="集成架构总览" />
 </Layer>

 {/* 最佳实践 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">最佳实践</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">推荐做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>在 IDE 集成终端中启动 CLI</li>
 <li>使用原生 Diff 查看修改</li>
 <li>利用 Ctrl+G 查看上下文</li>
 <li>在 Diff 中直接编辑后接受</li>
 <li>保持 IDE 和 CLI 目录一致</li>
 </ul>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">注意事项</h4>
 <ul className="text-sm text-body space-y-1">
 <li>不要在外部终端启动后尝试连接</li>
 <li>避免目录不匹配</li>
 <li>沙箱中注意网络配置</li>
 <li>大型选区会被截断 (16KB)</li>
 <li>只读工作区无法使用 Diff</li>
 </ul>
 </div>
 </div>
 </section>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
