import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

type TabType = 'overview' | 'batch' | 'queue' | 'lock' | 'resilience';

export function ConcurrencyPatterns() {
 const [activeTab, setActiveTab] = useState<TabType>('overview');

 const relatedPages: RelatedPage[] = [
 { id: 'tool-scheduler', label: '工具调度详解', description: '工具队列调度' },
 { id: 'file-discovery', label: '文件发现系统', description: 'BFS 并行搜索' },
 { id: 'streaming-response-processing', label: '流式响应处理', description: '异步流处理' },
 { id: 'error-recovery-patterns', label: '错误恢复模式', description: '并发错误处理' },
 { id: 'bfs-file-search-anim', label: 'BFS 文件搜索动画', description: '批量并行可视化' },
 ];

 const tabs: { id: TabType; label: string; icon: string }[] = [
 { id: 'overview', label: '模式概览', icon: '🎯' },
 { id: 'batch', label: '批量并行', icon: '📦' },
 { id: 'queue', label: '请求队列', icon: '📋' },
 { id: 'lock', label: '分布式锁', icon: '🔐' },
 { id: 'resilience', label: '容错模式', icon: '🛡️' },
 ];

 return (
 <div className="max-w-4xl mx-auto">
 <h1 className="text-2xl font-bold mb-2 text-heading">
 ⚡ 并发模式详解
 </h1>
 <p className="text-body mb-6 text-sm">
 Gemini CLI 中的并行处理、队列调度与分布式同步策略
 </p>

 {/* Tab Navigation */}
 <div className="flex gap-2 mb-6 flex-wrap">
 {tabs.map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`px-4 py-2 rounded-lg border-none cursor-pointer text-sm font-medium transition-all ${
 activeTab === tab.id
 ? ' bg-elevated text-heading'
 : ' bg-elevated text-body hover:text-heading'
 }`}
 >
 {tab.icon} {tab.label}
 </button>
 ))}
 </div>

 {/* Tab Content */}
 {activeTab === 'overview' && <OverviewTab />}
 {activeTab === 'batch' && <BatchTab />}
 {activeTab === 'queue' && <QueueTab />}
 {activeTab === 'lock' && <LockTab />}
 {activeTab === 'resilience' && <ResilienceTab />}

 <RelatedPages pages={relatedPages} />
 </div>
 );
}

function OverviewTab() {
 return (
 <div className="flex flex-col gap-6">
 <Layer title="📐 并发策略矩阵">
 <MermaidDiagram chart={`
mindmap
 root((并发模式))
 批量并行
 Promise.all
 并发限制
 分批处理
 请求队列
 FIFO 顺序
 状态机
 去重
 分布式锁
 文件锁
 指数退避
 原子操作
 容错模式
 Promise.allSettled
 独立失败
 继续处理
`} />
 </Layer>

 {/* Pattern Summary Table */}
 <Layer title="🗂️ 核心并发模式">
 <div className="overflow-x-auto">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="border-b border-white/20">
 <th className="p-3 text-left text-heading">模式</th>
 <th className="p-3 text-left text-heading">技术</th>
 <th className="p-3 text-left text-heading">并发度</th>
 <th className="p-3 text-left text-heading">应用场景</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border-b border-white/10">
 <td className="p-3 text-heading font-semibold">批量并行</td>
 <td className="p-3 text-body">Promise.all + 分批</td>
 <td className="p-3 text-heading">15-20</td>
 <td className="p-3 text-body">目录遍历 / 文件读取</td>
 </tr>
 <tr className="border-b border-white/10">
 <td className="p-3 text-amber-500 font-semibold">请求队列</td>
 <td className="p-3 text-body">FIFO + 状态机</td>
 <td className="p-3 text-heading">1</td>
 <td className="p-3 text-body">工具调用执行</td>
 </tr>
 <tr className="border-b border-white/10">
 <td className="p-3 text-heading font-semibold">Promise 去重</td>
 <td className="p-3 text-body">Promise 缓存</td>
 <td className="p-3 text-heading">N→1</td>
 <td className="p-3 text-body">Token 刷新</td>
 </tr>
 <tr className="border-b border-white/10">
 <td className="p-3 text-heading font-semibold">分布式锁</td>
 <td className="p-3 text-body">文件锁 + 退避</td>
 <td className="p-3 text-heading">跨进程 1</td>
 <td className="p-3 text-body">凭证文件写入</td>
 </tr>
 <tr>
 <td className="p-3 text-red-500 font-semibold">容错并行</td>
 <td className="p-3 text-body">Promise.allSettled</td>
 <td className="p-3 text-heading">N</td>
 <td className="p-3 text-body">MCP 服务发现</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 {/* Design Insight */}
 <HighlightBox title="💡 设计洞察" variant="blue">
 <p className="text-sm">
 Gemini CLI 采用<strong className="text-heading">混合并发策略</strong>：
 I/O 密集型操作（文件读取）使用高并发批处理，
 而状态关键操作（工具执行）使用严格顺序队列。
 这种组合既保证了性能，又避免了状态竞争。
 </p>
 </HighlightBox>
 </div>
 );
}

function BatchTab() {
 return (
 <div className="flex flex-col gap-6">
 <Layer title="📦 批量并行处理">
 <p className="text-body mb-4">
 BFS 文件搜索采用<strong className="text-heading">分批并行</strong>策略，
 平衡性能与资源消耗：
 </p>

 <CodeBlock language="typescript" code={`// packages/core/src/utils/bfsFileSearch.ts

const PARALLEL_BATCH_SIZE = 15; // 最佳并行批次大小

async function bfsFileSearch(startDir: string): Promise<string[]> {
 const queue: string[] = [startDir];
 let queueHead = 0; // O(1) 指针，避免 splice O(n)

 while (queueHead < queue.length && scannedDirCount < maxDirs) {
 // 收集当前批次
 const batchSize = Math.min(PARALLEL_BATCH_SIZE, maxDirs - scannedDirCount);
 const currentBatch: string[] = [];

 while (currentBatch.length < batchSize && queueHead < queue.length) {
 const dir = queue[queueHead++];
 if (!visitedDirs.has(dir)) {
 visitedDirs.add(dir);
 currentBatch.push(dir);
 }
 }

 // 批量并行读取目录
 const readPromises = currentBatch.map(async (currentDir) => {
 try {
 const entries = await fs.readdir(currentDir, { withFileTypes: true });
 return { currentDir, entries };
 } catch (error) {
 return { currentDir, entries: [] };
 }
 });

 const results = await Promise.all(readPromises);

 // 处理结果，子目录入队
 for (const { currentDir, entries } of results) {
 for (const entry of entries) {
 if (entry.isDirectory()) {
 const fullPath = path.join(currentDir, entry.name);
 queue.push(fullPath);
 }
 }
 }
 }
}`} />
 </Layer>

 {/* Why 15? */}
 <Layer title="🔢 为什么是 15？">
 <div className="grid grid-cols-3 gap-3 mb-4">
 <div className="p-4 bg-elevated rounded-lg text-center">
 <div className="text-red-500 text-2xl font-bold">EMFILE</div>
 <div className="text-body text-xs mt-1">避免文件句柄耗尽</div>
 </div>
 <div className="p-4 bg-elevated rounded-lg text-center">
 <div className="text-heading text-2xl font-bold">15x</div>
 <div className="text-body text-xs mt-1">相比串行的加速比</div>
 </div>
 <div className="p-4 bg-elevated rounded-lg text-center">
 <div className="text-heading text-2xl font-bold">~1ms</div>
 <div className="text-body text-xs mt-1">批次调度开销</div>
 </div>
 </div>

 <MermaidDiagram chart={`
xychart-beta
 title "并发度 vs 吞吐量（假设）"
 x-axis "并发度" [1, 5, 10, 15, 20, 30, 50]
 y-axis "吞吐量" 0 --> 100
 bar [10, 40, 70, 95, 90, 85, 60]
`} />

 <p className="text-body text-sm mt-3">
 并发度 15 是实验得出的平衡点：更高会触发 EMFILE，更低则浪费 I/O 等待时间。
 </p>
 </Layer>

 {/* Pointer-based Queue */}
 <Layer title="📍 指针式队列优化">
 <CodeBlock language="typescript" code={`// ❌ 低效：splice O(n)
while (queue.length > 0) {
 const item = queue.shift(); // O(n) 数组重排
 // 处理 item
}

// ✅ 高效：指针 O(1)
let queueHead = 0;
while (queueHead < queue.length) {
 const item = queue[queueHead++]; // O(1) 指针移动
 // 处理 item
}`} />

 <HighlightBox title="性能提升" variant="blue">
 <p className="text-sm">
 当队列长度 N = 10000 时，
 <code className="bg-elevated px-1.5 py-0.5 rounded text-xs">shift()</code>
 累计复杂度 O(N²)，而指针方式仅 O(N)。
 </p>
 </HighlightBox>
 </Layer>

 {/* Variable Concurrency */}
 <Layer title="🎛️ 可变并发度">
 <CodeBlock language="typescript" code={`// packages/core/src/utils/memoryDiscovery.ts

// 目录发现：较低并发（目录元数据更重）
const DIR_CONCURRENT_LIMIT = 10;

// 文件读取：较高并发（文件内容读取更轻量）
const FILE_CONCURRENT_LIMIT = 20;

// 分批处理目录
for (let i = 0; i < dirsArray.length; i += DIR_CONCURRENT_LIMIT) {
 const batch = dirsArray.slice(i, i + DIR_CONCURRENT_LIMIT);
 const batchResults = await Promise.allSettled(
 batch.map(dir => discoverFilesInDir(dir)),
 );
 // 处理结果
}

// 分批处理文件
for (let i = 0; i < filePaths.length; i += FILE_CONCURRENT_LIMIT) {
 const batch = filePaths.slice(i, i + FILE_CONCURRENT_LIMIT);
 const batchResults = await Promise.allSettled(
 batch.map(path => readFileContent(path)),
 );
 // 处理结果
}`} />

 <div className="grid grid-cols-2 gap-3 mt-4">
 <div className="p-3 bg-elevated rounded-lg">
 <div className="text-amber-500 font-semibold mb-1">目录发现</div>
 <div className="text-body text-sm">
 并发度 10：涉及元数据读取、权限检查，系统调用较重
 </div>
 </div>
 <div className="p-3 bg-elevated rounded-lg">
 <div className="text-heading font-semibold mb-1">文件读取</div>
 <div className="text-body text-sm">
 并发度 20：纯 I/O 操作，通常更快完成
 </div>
 </div>
 </div>
 </Layer>
 </div>
 );
}

function QueueTab() {
 return (
 <div className="flex flex-col gap-6">
 <Layer title="📋 工具调用队列">
 <p className="text-body mb-4">
 CoreToolScheduler 使用<strong className="text-heading">FIFO 队列</strong>确保工具调用的顺序执行：
 </p>

 <MermaidDiagram chart={`
stateDiagram-v2
 [*] --> Idle
 Idle --> Scheduling: schedule()
 Scheduling --> Executing: 开始执行
 Executing --> Completing: 工具完成
 Completing --> DrainQueue: 检查队列

 DrainQueue --> Scheduling: 队列非空
 DrainQueue --> Idle: 队列为空

 Executing --> Cancelled: abort 信号

 state Executing {
 [*] --> validating
 validating --> scheduled
 scheduled --> executing
 executing --> success
 executing --> error
 }
`} />
 </Layer>

 {/* Queue Implementation */}
 <Layer title="📦 队列实现">
 <CodeBlock language="typescript" code={`// packages/core/src/core/coreToolScheduler.ts

export class CoreToolScheduler {
 private isScheduling = false;
 private requestQueue: Array<{
 request: ToolCallRequestInfo | ToolCallRequestInfo[];
 signal: AbortSignal;
 resolve: () => void;
 reject: (reason?: Error) => void;
 }> = [];

 schedule(
 request: ToolCallRequestInfo | ToolCallRequestInfo[],
 signal: AbortSignal,
 ): Promise<void> {
 // 如果正在执行，加入队列等待
 if (this.isRunning() || this.isScheduling) {
 return new Promise((resolve, reject) => {
 // 监听 abort 信号
 const abortHandler = () => {
 const index = this.requestQueue.findIndex(
 (item) => item.request === request,
 );
 if (index > -1) {
 this.requestQueue.splice(index, 1);
 reject(new Error('Tool call cancelled while in queue.'));
 }
 };

 signal.addEventListener('abort', abortHandler, { once: true });

 this.requestQueue.push({
 request,
 signal,
 resolve: () => {
 signal.removeEventListener('abort', abortHandler);
 resolve();
 },
 reject: (reason?: Error) => {
 signal.removeEventListener('abort', abortHandler);
 reject(reason);
 },
 });
 });
 }

 return this._schedule(request, signal);
 }
}`} />
 </Layer>

 {/* Queue Drain */}
 <Layer title="🚰 队列排空">
 <CodeBlock language="typescript" code={`private async checkAndNotifyCompletion(): Promise<void> {
 const allCallsAreTerminal = this.toolCalls.every(
 (call) =>
 call.status === 'success' ||
 call.status === 'error' ||
 call.status === 'cancelled',
 );

 if (this.toolCalls.length > 0 && allCallsAreTerminal) {
 const completedCalls = [...this.toolCalls];
 this.toolCalls = [];

 // 通知完成回调
 if (this.onAllToolCallsComplete) {
 this.isFinalizingToolCalls = true;
 await this.onAllToolCallsComplete(completedCalls);
 this.isFinalizingToolCalls = false;
 }

 // 处理队列中的下一个请求
 if (this.requestQueue.length > 0) {
 const next = this.requestQueue.shift()!;
 this._schedule(next.request, next.signal)
 .then(next.resolve)
 .catch(next.reject);
 }
 }
}`} />

 <HighlightBox title="为什么顺序执行？" variant="blue">
 <p className="text-sm">
 工具调用的结果需要被纳入 LLM 上下文，
 后续工具可能依赖前序结果。并行执行会导致不确定的状态。
 </p>
 </HighlightBox>
 </Layer>

 {/* Message Queue Hook */}
 <Layer title="💬 消息队列 Hook">
 <CodeBlock language="typescript" code={`// packages/cli/src/ui/hooks/useMessageQueue.ts

export function useMessageQueue({
 isConfigInitialized,
 streamingState,
 submitQuery,
}: UseMessageQueueOptions): UseMessageQueueReturn {
 const [messageQueue, setMessageQueue] = useState<string[]>([]);

 const addMessage = useCallback((message: string) => {
 const trimmedMessage = message.trim();
 if (trimmedMessage.length > 0) {
 setMessageQueue((prev) => [...prev, trimmedMessage]);
 }
 }, []);

 // 当流式状态变为 Idle 时处理排队消息
 useEffect(() => {
 if (
 isConfigInitialized &&
 streamingState === StreamingState.Idle &&
 messageQueue.length > 0
 ) {
 // 合并所有排队消息
 const combinedMessage = messageQueue.join('\\n\\n');
 setMessageQueue([]);
 submitQuery(combinedMessage);
 }
 }, [isConfigInitialized, streamingState, messageQueue, submitQuery]);
}`} />

 <p className="text-body text-sm mt-3">
 用户在流式响应期间输入的消息会被缓存，响应完成后批量提交。
 </p>
 </Layer>
 </div>
 );
}

function LockTab() {
 return (
 <div className="flex flex-col gap-6">
 <Layer title="🔐 分布式 Token 锁">
 <p className="text-body mb-4">
 Token 管理器使用<strong className="text-heading">文件锁</strong>协调多进程间的 Token 刷新：
 </p>

 <MermaidDiagram chart={`
sequenceDiagram
 participant P1 as 进程 1
 participant P2 as 进程 2
 participant Lock as 锁文件
 participant Creds as 凭证文件

 P1->>Lock: 创建锁 (wx 独占)
 Lock-->>P1: 成功
 P1->>Creds: 刷新 Token

 P2->>Lock: 创建锁 (wx 独占)
 Lock-->>P2: EEXIST 失败
 Note over P2: 等待 100ms
 P2->>Lock: 重试
 Lock-->>P2: EEXIST 失败
 Note over P2: 等待 150ms (×1.5)

 Creds-->>P1: 写入成功
 P1->>Lock: 删除锁

 P2->>Lock: 创建锁
 Lock-->>P2: 成功
 P2->>Creds: 读取
 Note over P2: 发现已更新
 P2-->>P2: 使用新凭证
 P2->>Lock: 删除锁
`} />
 </Layer>

 {/* Lock Acquisition */}
 <Layer title="🔒 锁获取实现">
 <CodeBlock language="typescript" code={`// packages/core/src/gemini/sharedTokenManager.ts

private async acquireLock(lockPath: string): Promise<void> {
 const { maxAttempts, attemptInterval, maxInterval } = this.lockConfig;
 let currentInterval = attemptInterval; // 初始 100ms

 for (let attempt = 0; attempt < maxAttempts; attempt++) {
 try {
 // 原子独占创建锁文件
 await fs.writeFile(lockPath, randomUUID(), { flag: 'wx' });
 return; // 成功获取锁
 } catch (error: unknown) {
 if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
 // 锁已存在，检查是否过期
 const stats = await fs.stat(lockPath);
 const lockAge = Date.now() - stats.mtimeMs;

 // 过期锁：尝试清理
 if (lockAge > LOCK_TIMEOUT_MS) {
 const tempPath = \`\${lockPath}.stale.\${randomUUID()}\`;
 try {
 // 原子重命名避免竞态
 await fs.rename(lockPath, tempPath);
 await fs.unlink(tempPath);
 continue; // 立即重试
 } catch {
 // 其他进程可能已清理，继续尝试
 }
 }

 // 指数退避等待
 await new Promise(r => setTimeout(r, currentInterval));
 currentInterval = Math.min(currentInterval * 1.5, maxInterval);
 }
 }
 }

 throw new TokenManagerError(
 TokenError.LOCK_TIMEOUT,
 'Failed to acquire file lock: timeout exceeded',
 );
}`} />
 </Layer>

 {/* Promise Deduplication */}
 <Layer title="🔄 Promise 去重">
 <CodeBlock language="typescript" code={`private refreshPromise: Promise<Credentials> | null = null;
private checkPromise: Promise<void> | null = null;

async getValidCredentials(
 geminiClient: IGoogleOAuth2Client,
 forceRefresh = false,
): Promise<Credentials> {
 // 先检查文件是否被其他进程更新
 await this.checkAndReloadIfNeeded(geminiClient);

 // 缓存有效，直接返回
 if (!forceRefresh && this.isTokenValid(this.memoryCache.credentials)) {
 return this.memoryCache.credentials;
 }

 // 使用本地变量避免竞态
 let currentRefreshPromise = this.refreshPromise;

 if (!currentRefreshPromise) {
 // 创建新的刷新操作
 currentRefreshPromise = this.performTokenRefresh(geminiClient, forceRefresh);
 this.refreshPromise = currentRefreshPromise;
 }

 try {
 // 所有并发请求共享同一个 Promise
 return await currentRefreshPromise;
 } finally {
 // 只有创建者清理
 if (this.refreshPromise === currentRefreshPromise) {
 this.refreshPromise = null;
 }
 }
}`} />

 <MermaidDiagram chart={`
sequenceDiagram
 participant R1 as 请求 1
 participant R2 as 请求 2
 participant R3 as 请求 3
 participant M as TokenManager
 participant API as OAuth API

 R1->>M: getValidCredentials()
 M->>M: refreshPromise = null
 M->>API: 开始刷新

 R2->>M: getValidCredentials()
 M->>M: 发现 refreshPromise 存在
 R2-->>M: 等待同一 Promise

 R3->>M: getValidCredentials()
 R3-->>M: 等待同一 Promise

 API-->>M: 返回新 Token
 M-->>R1: 新凭证
 M-->>R2: 新凭证
 M-->>R3: 新凭证

 Note over M: 3 个请求<br/>只触发 1 次 API 调用
`} />
 </Layer>

 {/* Cleanup Handlers */}
 <Layer title="🧹 进程退出清理">
 <CodeBlock language="typescript" code={`private registerCleanupHandlers(): void {
 process.on('exit', this.cleanupFunction);
 process.on('SIGINT', this.cleanupFunction);
 process.on('SIGTERM', this.cleanupFunction);
 process.on('uncaughtException', this.cleanupFunction);
 process.on('unhandledRejection', this.cleanupFunction);
}

private cleanupFunction = (): void => {
 if (this.lockFileDescriptor) {
 try {
 fs.closeSync(this.lockFileDescriptor);
 fs.unlinkSync(this.lockFilePath);
 } catch {
 // 忽略清理错误
 }
 }
};`} />

 <HighlightBox title="为什么需要清理？" variant="blue">
 <p className="text-sm">
 如果进程意外退出而未释放锁，其他进程会因为锁文件存在而等待。
 注册退出处理器确保锁被及时释放。
 </p>
 </HighlightBox>
 </Layer>
 </div>
 );
}

function ResilienceTab() {
 return (
 <div className="flex flex-col gap-6">
 <Layer title="🛡️ Promise.allSettled 容错模式">
 <p className="text-body mb-4">
 <code className="text-heading">Promise.allSettled</code> 与
 <code className="text-heading">Promise.all</code> 的关键区别：
 </p>

 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 bg-elevated rounded-lg">
 <div className="text-red-500 font-semibold mb-2">Promise.all</div>
 <div className="text-body text-sm mb-2">
 任意一个 Promise reject，整体 reject
 </div>
 <CodeBlock language="typescript" code={`// 一个失败，全部失败
try {
 await Promise.all([
 fetchA(), // 成功
 fetchB(), // 失败 ❌
 fetchC(), // 成功
 ]);
} catch (e) {
 // 只拿到 fetchB 的错误
 // fetchA 和 fetchC 的结果丢失
}`} />
 </div>
 <div className="p-4 bg-elevated rounded-lg">
 <div className="text-heading font-semibold mb-2">Promise.allSettled</div>
 <div className="text-body text-sm mb-2">
 所有 Promise 都会完成，各自报告状态
 </div>
 <CodeBlock language="typescript" code={`// 独立处理每个结果
const results = await Promise.allSettled([
 fetchA(), // fulfilled
 fetchB(), // rejected
 fetchC(), // fulfilled
]);

for (const result of results) {
 if (result.status === 'fulfilled') {
 // 处理成功
 } else {
 // 记录失败，继续处理
 }
}`} />
 </div>
 </div>
 </Layer>

 {/* MCP Server Discovery */}
 <Layer title="🔌 MCP 服务发现">
 <CodeBlock language="typescript" code={`// packages/core/src/tools/mcp-client-manager.ts

async discoverAll(servers: Record<string, ServerConfig>): Promise<MCPClient[]> {
 // 并行发现所有服务器
 const discoveryPromises = Object.entries(servers).map(
 async ([name, config]) => {
 const client = new MCPClient(name, config);

 try {
 await client.connect();
 await client.discover(cliConfig);
 return { name, client, success: true };
 } catch (error) {
 // 记录错误但不阻塞
 console.error(
 \`MCP 服务器 '\${name}' 发现失败: \${getErrorMessage(error)}\`,
 );
 return { name, client: null, success: false };
 }
 },
 );

 const results = await Promise.allSettled(discoveryPromises);

 // 只返回成功连接的服务器
 return results
 .filter(r => r.status === 'fulfilled' && r.value.success)
 .map(r => (r as PromiseFulfilledResult<any>).value.client);
}`} />

 <HighlightBox title="容错设计" variant="blue">
 <p className="text-sm">
 单个 MCP 服务器连接失败不会影响其他服务器。
 用户仍然可以使用可用的工具，最大化系统可用性。
 </p>
 </HighlightBox>
 </Layer>

 {/* File Reading Resilience */}
 <Layer title="📂 文件读取容错">
 <CodeBlock language="typescript" code={`// packages/core/src/tools/read-many-files.ts

const fileProcessingPromises = sortedFiles.map(
 async (filePath): Promise<FileProcessingResult> => {
 try {
 const fileType = await detectFileType(filePath);

 // 跳过非显式请求的资源文件
 if ((fileType === 'image' || fileType === 'pdf') && !requestedExplicitly) {
 return {
 success: false,
 filePath,
 reason: 'asset file not explicitly requested',
 };
 }

 const content = await readFileContent(filePath);
 return { success: true, filePath, content };
 } catch (error) {
 return {
 success: false,
 filePath,
 reason: \`Read error: \${error.message}\`,
 };
 }
 },
);

const results = await Promise.allSettled(fileProcessingPromises);

const successfulReads: FileContent[] = [];
const skippedFiles: SkippedFile[] = [];

for (const result of results) {
 if (result.status === 'fulfilled') {
 if (result.value.success) {
 successfulReads.push(result.value);
 } else {
 skippedFiles.push({
 path: result.value.filePath,
 reason: result.value.reason,
 });
 }
 } else {
 // Promise 本身 reject
 skippedFiles.push({
 path: 'unknown',
 reason: \`Unexpected: \${result.reason}\`,
 });
 }
}`} />
 </Layer>

 {/* Summary */}
 <Layer title="📊 容错模式总结">
 <div className="overflow-x-auto">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="border-b border-white/20">
 <th className="p-3 text-left text-heading">场景</th>
 <th className="p-3 text-left text-heading">模式</th>
 <th className="p-3 text-left text-heading">失败处理</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border-b border-white/10">
 <td className="p-3 text-body">MCP 服务发现</td>
 <td className="p-3 text-heading">allSettled</td>
 <td className="p-3 text-body">记录错误，使用其他服务</td>
 </tr>
 <tr className="border-b border-white/10">
 <td className="p-3 text-body">批量文件读取</td>
 <td className="p-3 text-heading">allSettled</td>
 <td className="p-3 text-body">跳过失败文件，报告原因</td>
 </tr>
 <tr className="border-b border-white/10">
 <td className="p-3 text-body">目录扫描</td>
 <td className="p-3 text-heading">allSettled</td>
 <td className="p-3 text-body">返回空结果，继续遍历</td>
 </tr>
 <tr>
 <td className="p-3 text-body">内存文件发现</td>
 <td className="p-3 text-heading">allSettled</td>
 <td className="p-3 text-body">日志警告，处理其他目录</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>
 </div>
 );
}
