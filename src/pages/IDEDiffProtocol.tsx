import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { FlowDiagram } from '../components/FlowDiagram';

export function IDEDiffProtocol() {
  const connectionFlow = {
    title: 'IDE 连接建立流程',
    nodes: [
      { id: 'start', label: 'CLI 启动\n/ide enable', type: 'start' as const },
      { id: 'detect', label: '检测 IDE\n进程树', type: 'process' as const },
      { id: 'read_port', label: '读取端口文件\n/tmp/qwen-code-ide-server-{ppid}.json', type: 'process' as const },
      { id: 'validate', label: '验证 Workspace\n路径匹配?', type: 'decision' as const },
      { id: 'mcp_connect', label: 'MCP Client\n建立 HTTP SSE', type: 'process' as const },
      { id: 'discover', label: '发现可用工具\nopenDiff/closeDiff', type: 'process' as const },
      { id: 'connected', label: 'IDEConnectionStatus\n= Connected', type: 'end' as const },
      { id: 'failed', label: '连接失败\n提示安装插件', type: 'end' as const },
    ],
    edges: [
      { from: 'start', to: 'detect' },
      { from: 'detect', to: 'read_port' },
      { from: 'read_port', to: 'validate' },
      { from: 'validate', to: 'failed', label: 'No' },
      { from: 'validate', to: 'mcp_connect', label: 'Yes' },
      { from: 'mcp_connect', to: 'discover' },
      { from: 'discover', to: 'connected' },
    ],
  };

  const diffFlow = {
    title: 'Diff View 交互流程',
    nodes: [
      { id: 'tool', label: 'AI 调用\nwrite_file/edit', type: 'start' as const },
      { id: 'check_ide', label: 'IDE 已连接\n且支持 Diff?', type: 'decision' as const },
      { id: 'acquire_mutex', label: '获取 diffMutex\n(单 Diff 锁)', type: 'process' as const },
      { id: 'send_open', label: 'MCP: openDiff\n{filePath, newContent}', type: 'process' as const },
      { id: 'vscode_diff', label: 'VS Code 渲染\n原生 Diff View', type: 'process' as const },
      { id: 'user_action', label: '用户操作', type: 'decision' as const },
      { id: 'accept', label: 'ide/diffAccepted\n通知', type: 'process' as const },
      { id: 'reject', label: 'ide/diffClosed\n通知', type: 'process' as const },
      { id: 'write', label: '写入磁盘', type: 'end' as const },
      { id: 'cancel', label: '取消修改', type: 'end' as const },
      { id: 'direct', label: '直接写入\n(非 IDE 模式)', type: 'end' as const },
    ],
    edges: [
      { from: 'tool', to: 'check_ide' },
      { from: 'check_ide', to: 'direct', label: 'No' },
      { from: 'check_ide', to: 'acquire_mutex', label: 'Yes' },
      { from: 'acquire_mutex', to: 'send_open' },
      { from: 'send_open', to: 'vscode_diff' },
      { from: 'vscode_diff', to: 'user_action' },
      { from: 'user_action', to: 'accept', label: 'Accept' },
      { from: 'user_action', to: 'reject', label: 'Cancel/Close' },
      { from: 'accept', to: 'write' },
      { from: 'reject', to: 'cancel' },
    ],
  };

  const architectureCode = `// IDE 集成架构图
// 来源: packages/vscode-ide-companion/ + packages/core/src/ide/

┌─────────────────────────────────────────────────────────────────────────────┐
│                              VS Code Extension                               │
│                     (packages/vscode-ide-companion/)                         │
│                                                                              │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  extension.ts │    │   ide-server.ts  │    │     diff-manager.ts      │   │
│  │              │    │                  │    │                          │   │
│  │ DIFF_SCHEME  │    │  MCP Server      │    │  DiffContentProvider     │   │
│  │ = 'innies-   │    │  (Express +      │    │  (TextDocumentContent    │   │
│  │    diff'     │    │   StreamableHTTP)│    │   Provider)              │   │
│  │              │    │                  │    │                          │   │
│  │ 注册 URI     │◄───│  Tools:          │◄───│  DiffManager             │   │
│  │ Provider     │    │  - openDiff      │    │  - showDiff()            │   │
│  │              │    │  - closeDiff     │    │  - acceptDiff()          │   │
│  └──────────────┘    │                  │    │  - cancelDiff()          │   │
│                      │  Notifications:  │    │                          │   │
│                      │  - ide/context   │    │  发送通知:               │   │
│                      │    Update        │───►│  - ide/diffAccepted      │   │
│                      │                  │    │  - ide/diffClosed        │   │
│                      └─────────────────┘    └──────────────────────────┘   │
│                              ▲                                              │
│                              │ HTTP SSE (:随机端口)                         │
│                              │ Auth: Bearer Token                          │
└──────────────────────────────┼──────────────────────────────────────────────┘
                               │
                               │ MCP Protocol (JSON-RPC 2.0)
                               │
┌──────────────────────────────┼──────────────────────────────────────────────┐
│                              ▼                              CLI              │
│                     (packages/core/src/ide/)                                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                           ide-client.ts                               │   │
│  │                                                                       │   │
│  │  class IdeClient {                                                   │   │
│  │    // 单例模式                                                        │   │
│  │    static getInstance(): Promise<IdeClient>                          │   │
│  │                                                                       │   │
│  │    // 连接管理                                                        │   │
│  │    connect(): Promise<void>                                          │   │
│  │    disconnect(): Promise<void>                                       │   │
│  │                                                                       │   │
│  │    // Diff 操作 (带 Mutex 锁)                                         │   │
│  │    openDiff(filePath, newContent): Promise<DiffUpdateResult>         │   │
│  │    closeDiff(filePath): Promise<string | undefined>                  │   │
│  │    resolveDiffFromCli(filePath, outcome): Promise<void>              │   │
│  │                                                                       │   │
│  │    // 状态查询                                                        │   │
│  │    isDiffingEnabled(): boolean                                       │   │
│  │    getConnectionStatus(): IDEConnectionState                         │   │
│  │  }                                                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘`;

  const diffSchemeCode = `// innies-diff:// 自定义 URI Scheme
// 来源: packages/vscode-ide-companion/src/extension.ts:20

export const DIFF_SCHEME = 'innies-diff';

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

  // 1. 创建 innies-diff:// URI (右侧 - 新内容)
  const rightDocUri = vscode.Uri.from({
    scheme: DIFF_SCHEME,  // 'innies-diff'
    path: filePath,
    query: \`rand=\${Math.random()}\`,  // cache busting
  });

  // 2. 设置新内容到 Provider
  this.diffContentProvider.setContent(rightDocUri, newContent);

  // 3. 处理左侧文档 (原始内容)
  let leftDocUri;
  try {
    await vscode.workspace.fs.stat(fileUri);
    leftDocUri = fileUri;  // 文件存在，用原文件
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
    leftDocUri,     // 左侧: 原始文件 (file://)
    rightDocUri,    // 右侧: AI 修改 (innies-diff://)
    \`\${path.basename(filePath)} ↔ Modified\`,  // 标题
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
    name: 'qwen-code-companion-mcp-server',
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
      return { content: [] };  // 结果通过 notification 异步返回
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
      resolver({ status: 'accepted', content });  // 用户接受
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
      resolver({ status: 'rejected', content: undefined });  // 用户取消
      this.diffResponses.delete(filePath);
    }
  },
);`;

  const portFileCode = `// 端口发现机制
// 来源: packages/vscode-ide-companion/src/ide-server.ts:51-95

// 1. Extension 启动时写入端口文件
async function writePortAndWorkspace({
  port, portFile, ppidPortFile, authToken, ...
}) {
  const content = JSON.stringify({
    port,           // 随机分配的端口号
    workspacePath,  // VS Code 打开的工作区路径
    ppid: process.ppid,  // 父进程 ID (用于匹配 CLI)
    authToken,      // Bearer Token
  });

  // 写入两个文件:
  // - /tmp/qwen-code-ide-server-{port}.json
  // - /tmp/qwen-code-ide-server-{ppid}.json
  await Promise.all([
    fs.writeFile(portFile, content).then(() => fs.chmod(portFile, 0o600)),
    fs.writeFile(ppidPortFile, content).then(() => fs.chmod(ppidPortFile, 0o600)),
  ]);
}

// 2. CLI 侧读取端口文件
// 来源: packages/core/src/ide/ide-client.ts:571-667

private async getConnectionConfigFromFile() {
  // 通过进程树找到 IDE 的 PID
  const portFile = path.join(
    os.tmpdir(),
    \`qwen-code-ide-server-\${this.ideProcessInfo.pid}.json\`
  );

  const portFileContents = await fs.promises.readFile(portFile, 'utf8');
  return JSON.parse(portFileContents);
  // { port: 54321, workspacePath: '/path/to/project', authToken: 'xxx' }
}`;

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
    //   openFiles: ['/path/to/file.ts', ...],
    //   activeFile: '/path/to/file.ts',
    //   selection: { start: { line: 10, character: 0 }, end: { ... } },
    //   workspaceState: { isTrusted: true }
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
      <h2 className="text-2xl text-cyan-400 mb-5">IDE Diff 协议与伴侣插件</h2>

      {/* 概述 */}
      <Layer title="核心概念" icon="🔌">
        <HighlightBox title="innies-diff:// 协议" icon="✨" variant="blue">
          <p className="text-sm">
            CLI 不直接覆写文件，而是通过 <code>innies-diff://</code> 自定义 URI Scheme
            将修改发送给 VS Code 插件，让 VS Code <strong>原生渲染 Diff View</strong>。
            用户点击 "Accept" 后，插件发送 <code>ide/diffAccepted</code> 通知，CLI 才真正写入磁盘。
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">🖥️ VS Code Extension</h4>
            <p className="text-sm text-gray-300">
              MCP Server + DiffManager<br/>
              监听 CLI 请求，渲染 Diff View
            </p>
          </div>

          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">📡 MCP Protocol</h4>
            <p className="text-sm text-gray-300">
              JSON-RPC 2.0 over HTTP SSE<br/>
              双向通信 (请求 + 通知)
            </p>
          </div>

          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">⌨️ CLI (IdeClient)</h4>
            <p className="text-sm text-gray-300">
              MCP Client + Mutex 锁<br/>
              发起 Diff 请求，等待用户确认
            </p>
          </div>
        </div>
      </Layer>

      {/* 架构图 */}
      <Layer title="整体架构" icon="🏗️">
        <CodeBlock code={architectureCode} title="IDE 集成双向通信架构" />
      </Layer>

      {/* 连接流程 */}
      <Layer title="连接建立流程" icon="🔗">
        <FlowDiagram {...connectionFlow} />

        <CodeBlock code={portFileCode} title="端口发现机制" />

        <HighlightBox title="Workspace 路径验证" icon="⚠️" variant="orange">
          <p className="text-sm">
            CLI 只会连接到 <strong>当前工作目录所属的 VS Code 窗口</strong>。
            如果 CLI 运行在 <code>/path/a</code>，而 VS Code 打开的是 <code>/path/b</code>，
            连接会被拒绝，提示 "Directory mismatch"。
          </p>
        </HighlightBox>
      </Layer>

      {/* Diff 流程 */}
      <Layer title="Diff View 交互流程" icon="📝">
        <FlowDiagram {...diffFlow} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <HighlightBox title="Mutex 锁机制" icon="🔒" variant="red">
            <p className="text-sm">
              <code>diffMutex</code> 确保同时只有一个 Diff View 打开。
              VS Code 不支持同时处理多个 Diff 视图，串行执行避免 UI 竞态。
            </p>
          </HighlightBox>

          <HighlightBox title="用户可编辑" icon="✏️" variant="green">
            <p className="text-sm">
              Diff View 右侧（新内容）是<strong>可编辑的</strong>。
              用户可以在接受前手动修改，最终内容通过 <code>ide/diffAccepted</code> 返回。
            </p>
          </HighlightBox>
        </div>
      </Layer>

      {/* innies-diff:// URI Scheme */}
      <Layer title="innies-diff:// URI Scheme" icon="🔗">
        <CodeBlock code={diffSchemeCode} title="DiffContentProvider 实现" />

        <div className="bg-black/30 rounded-lg p-4 mt-4">
          <h4 className="text-cyan-400 font-bold mb-2">URI 结构示例</h4>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-start gap-2">
              <span className="text-gray-400">左侧 (原始):</span>
              <code className="text-green-400">file:///Users/dev/project/src/app.ts</code>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400">右侧 (修改):</span>
              <code className="text-purple-400">innies-diff:///Users/dev/project/src/app.ts?rand=0.123</code>
            </div>
          </div>
        </div>
      </Layer>

      {/* showDiff 实现 */}
      <Layer title="VS Code Diff View 渲染" icon="🎨">
        <CodeBlock code={showDiffCode} title="showDiff() 实现" />

        <HighlightBox title="新文件处理" icon="📄" variant="blue">
          <p className="text-sm">
            当文件不存在时，左侧使用 <code>untitled:</code> scheme 创建空文档，
            让用户可以预览即将创建的新文件内容。
          </p>
        </HighlightBox>
      </Layer>

      {/* MCP Server */}
      <Layer title="MCP Server 工具注册" icon="🛠️">
        <CodeBlock code={mcpServerCode} title="openDiff / closeDiff 工具" />

        <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
          <h4 className="text-cyan-400 font-bold mb-3">MCP 通知类型</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-2">通知方法</th>
                <th className="text-left py-2">触发条件</th>
                <th className="text-left py-2">参数</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2"><code className="text-green-400">ide/diffAccepted</code></td>
                <td>用户点击 Accept</td>
                <td><code>{`{filePath, content}`}</code></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2"><code className="text-red-400">ide/diffClosed</code></td>
                <td>用户关闭 Diff View</td>
                <td><code>{`{filePath, content}`}</code></td>
              </tr>
              <tr>
                <td className="py-2"><code className="text-blue-400">ide/contextUpdate</code></td>
                <td>文件打开/切换/选择变化</td>
                <td><code>{`{openFiles, activeFile, selection}`}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* CLI Client */}
      <Layer title="CLI 侧 Diff 调用" icon="⌨️">
        <CodeBlock code={clientDiffCode} title="IdeClient.openDiff() 实现" />
      </Layer>

      {/* 上下文同步 */}
      <Layer title="IDE 上下文同步" icon="🔄">
        <CodeBlock code={contextSyncCode} title="双向上下文同步" />

        <HighlightBox title="信任状态同步" icon="🔐" variant="green">
          <p className="text-sm">
            VS Code 的工作区信任状态通过 <code>workspaceState.isTrusted</code> 同步到 CLI。
            当用户在 VS Code 中信任工作区时，CLI 会自动更新信任状态。
          </p>
        </HighlightBox>
      </Layer>

      {/* 命令参考 */}
      <Layer title="/ide 命令参考" icon="📋">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <code className="text-cyan-400">/ide enable</code>
            <p className="text-sm text-gray-400 mt-1">启用 IDE 集成，建立 MCP 连接</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <code className="text-cyan-400">/ide disable</code>
            <p className="text-sm text-gray-400 mt-1">禁用 IDE 集成，断开连接</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <code className="text-cyan-400">/ide install</code>
            <p className="text-sm text-gray-400 mt-1">打开 VS Code Marketplace 安装插件</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <code className="text-cyan-400">/ide status</code>
            <p className="text-sm text-gray-400 mt-1">显示当前 IDE 连接状态</p>
          </div>
        </div>
      </Layer>

      {/* 源码位置 */}
      <Layer title="源码位置" icon="📍">
        <div className="text-sm space-y-2">
          <SourceLink path="packages/vscode-ide-companion/src/extension.ts" desc="插件入口 + DIFF_SCHEME 定义" />
          <SourceLink path="packages/vscode-ide-companion/src/ide-server.ts" desc="MCP Server + 工具注册" />
          <SourceLink path="packages/vscode-ide-companion/src/diff-manager.ts" desc="DiffManager + DiffContentProvider" />
          <SourceLink path="packages/vscode-ide-companion/src/open-files-manager.ts" desc="打开文件跟踪" />
          <SourceLink path="packages/core/src/ide/ide-client.ts" desc="CLI 侧 MCP Client" />
          <SourceLink path="packages/core/src/ide/types.ts" desc="MCP 消息 Schema 定义" />
        </div>
      </Layer>
    </div>
  );
}

function SourceLink({ path, desc }: { path: string; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className="bg-black/30 px-2 py-1 rounded">{path}</code>
      <span className="text-gray-400">{desc}</span>
    </div>
  );
}
