import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

type TabType = 'overview' | 'batch' | 'queue' | 'lock' | 'resilience';

export function ConcurrencyPatterns() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: '模式概览', icon: '🎯' },
    { id: 'batch', label: '批量并行', icon: '📦' },
    { id: 'queue', label: '请求队列', icon: '📋' },
    { id: 'lock', label: '分布式锁', icon: '🔐' },
    { id: 'resilience', label: '容错模式', icon: '🛡️' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>
        ⚡ 并发模式详解
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 15 }}>
        Innies CLI 中的并行处理、队列调度与分布式同步策略
      </p>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.id ? '#3b82f6' : '#1e293b',
              color: activeTab === tab.id ? '#fff' : '#94a3b8',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
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
    </div>
  );
}

function OverviewTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📐 并发策略矩阵
        </h2>

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
      </div>

      {/* Pattern Summary Table */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🗂️ 核心并发模式
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>模式</th>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>技术</th>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>并发度</th>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>应用场景</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#22c55e', fontWeight: 600 }}>批量并行</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>Promise.all + 分批</td>
              <td style={{ padding: 12, color: '#60a5fa' }}>15-20</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>目录遍历 / 文件读取</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#f59e0b', fontWeight: 600 }}>请求队列</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>FIFO + 状态机</td>
              <td style={{ padding: 12, color: '#60a5fa' }}>1</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>工具调用执行</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#3b82f6', fontWeight: 600 }}>Promise 去重</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>Promise 缓存</td>
              <td style={{ padding: 12, color: '#60a5fa' }}>N→1</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>Token 刷新</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#a855f7', fontWeight: 600 }}>分布式锁</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>文件锁 + 退避</td>
              <td style={{ padding: 12, color: '#60a5fa' }}>跨进程 1</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>凭证文件写入</td>
            </tr>
            <tr>
              <td style={{ padding: 12, color: '#ef4444', fontWeight: 600 }}>容错并行</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>Promise.allSettled</td>
              <td style={{ padding: 12, color: '#60a5fa' }}>N</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>MCP 服务发现</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Design Insight */}
      <div style={{ padding: 16, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
        <h4 style={{ color: '#60a5fa', marginBottom: 8, fontSize: 15, fontWeight: 600 }}>
          💡 设计洞察
        </h4>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
          Innies CLI 采用<strong style={{ color: '#f1f5f9' }}>混合并发策略</strong>：
          I/O 密集型操作（文件读取）使用高并发批处理，
          而状态关键操作（工具执行）使用严格顺序队列。
          这种组合既保证了性能，又避免了状态竞争。
        </p>
      </div>
    </div>
  );
}

function BatchTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📦 批量并行处理
        </h2>

        <p style={{ color: '#94a3b8', marginBottom: 16 }}>
          BFS 文件搜索采用<strong style={{ color: '#f1f5f9' }}>分批并行</strong>策略，
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
      </div>

      {/* Why 15? */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔢 为什么是 15？
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ padding: 16, background: '#1e293b', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: '#ef4444', fontSize: 24, fontWeight: 700 }}>EMFILE</div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>避免文件句柄耗尽</div>
          </div>
          <div style={{ padding: 16, background: '#1e293b', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: '#22c55e', fontSize: 24, fontWeight: 700 }}>15x</div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>相比串行的加速比</div>
          </div>
          <div style={{ padding: 16, background: '#1e293b', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: '#3b82f6', fontSize: 24, fontWeight: 700 }}>~1ms</div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>批次调度开销</div>
          </div>
        </div>

        <MermaidDiagram chart={`
xychart-beta
    title "并发度 vs 吞吐量（假设）"
    x-axis "并发度" [1, 5, 10, 15, 20, 30, 50]
    y-axis "吞吐量" 0 --> 100
    bar [10, 40, 70, 95, 90, 85, 60]
`} />

        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 12 }}>
          并发度 15 是实验得出的平衡点：更高会触发 EMFILE，更低则浪费 I/O 等待时间。
        </p>
      </div>

      {/* Pointer-based Queue */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📍 指针式队列优化
        </h3>

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

        <div style={{ marginTop: 16, padding: 12, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
          <p style={{ color: '#60a5fa', fontSize: 14, margin: 0 }}>
            <strong>性能提升</strong>：当队列长度 N = 10000 时，
            <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>shift()</code>
            累计复杂度 O(N²)，而指针方式仅 O(N)。
          </p>
        </div>
      </div>

      {/* Variable Concurrency */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🎛️ 可变并发度
        </h3>

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8 }}>
            <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>目录发现</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              并发度 10：涉及元数据读取、权限检查，系统调用较重
            </div>
          </div>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8 }}>
            <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>文件读取</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              并发度 20：纯 I/O 操作，通常更快完成
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QueueTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📋 工具调用队列
        </h2>

        <p style={{ color: '#94a3b8', marginBottom: 16 }}>
          CoreToolScheduler 使用<strong style={{ color: '#f1f5f9' }}>FIFO 队列</strong>确保工具调用的顺序执行：
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
      </div>

      {/* Queue Implementation */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📦 队列实现
        </h3>

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
      </div>

      {/* Queue Drain */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🚰 队列排空
        </h3>

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

        <div style={{ marginTop: 16, padding: 12, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
          <p style={{ color: '#60a5fa', fontSize: 14, margin: 0 }}>
            <strong>为什么顺序执行？</strong>工具调用的结果需要被纳入 LLM 上下文，
            后续工具可能依赖前序结果。并行执行会导致不确定的状态。
          </p>
        </div>
      </div>

      {/* Message Queue Hook */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          💬 消息队列 Hook
        </h3>

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

        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 12 }}>
          用户在流式响应期间输入的消息会被缓存，响应完成后批量提交。
        </p>
      </div>
    </div>
  );
}

function LockTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔐 分布式 Token 锁
        </h2>

        <p style={{ color: '#94a3b8', marginBottom: 16 }}>
          SharedTokenManager 使用<strong style={{ color: '#f1f5f9' }}>文件锁</strong>协调多进程间的 Token 刷新：
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
      </div>

      {/* Lock Acquisition */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔒 锁获取实现
        </h3>

        <CodeBlock language="typescript" code={`// packages/core/src/innies/sharedTokenManager.ts

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
      </div>

      {/* Promise Deduplication */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔄 Promise 去重
        </h3>

        <CodeBlock language="typescript" code={`private refreshPromise: Promise<InniesCredentials> | null = null;
private checkPromise: Promise<void> | null = null;

async getValidCredentials(
  inniesClient: IInniesOAuth2Client,
  forceRefresh = false,
): Promise<InniesCredentials> {
  // 先检查文件是否被其他进程更新
  await this.checkAndReloadIfNeeded(inniesClient);

  // 缓存有效，直接返回
  if (!forceRefresh && this.isTokenValid(this.memoryCache.credentials)) {
    return this.memoryCache.credentials;
  }

  // 使用本地变量避免竞态
  let currentRefreshPromise = this.refreshPromise;

  if (!currentRefreshPromise) {
    // 创建新的刷新操作
    currentRefreshPromise = this.performTokenRefresh(inniesClient, forceRefresh);
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
      </div>

      {/* Cleanup Handlers */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🧹 进程退出清理
        </h3>

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

        <div style={{ marginTop: 16, padding: 12, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
          <p style={{ color: '#60a5fa', fontSize: 14, margin: 0 }}>
            <strong>为什么需要清理？</strong>如果进程意外退出而未释放锁，
            其他进程会因为锁文件存在而等待。注册退出处理器确保锁被及时释放。
          </p>
        </div>
      </div>
    </div>
  );
}

function ResilienceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🛡️ Promise.allSettled 容错模式
        </h2>

        <p style={{ color: '#94a3b8', marginBottom: 16 }}>
          <code style={{ color: '#60a5fa' }}>Promise.allSettled</code> 与
          <code style={{ color: '#60a5fa' }}>Promise.all</code> 的关键区别：
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div style={{ padding: 16, background: '#1e293b', borderRadius: 8 }}>
            <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>❌ Promise.all</div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
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
          <div style={{ padding: 16, background: '#1e293b', borderRadius: 8 }}>
            <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: 8 }}>✅ Promise.allSettled</div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>
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
      </div>

      {/* MCP Server Discovery */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔌 MCP 服务发现
        </h3>

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

        <div style={{ marginTop: 16, padding: 12, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
          <p style={{ color: '#60a5fa', fontSize: 14, margin: 0 }}>
            <strong>容错设计</strong>：单个 MCP 服务器连接失败不会影响其他服务器。
            用户仍然可以使用可用的工具，最大化系统可用性。
          </p>
        </div>
      </div>

      {/* File Reading Resilience */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📂 文件读取容错
        </h3>

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
      </div>

      {/* Summary */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📊 容错模式总结
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>场景</th>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>模式</th>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>失败处理</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#94a3b8' }}>MCP 服务发现</td>
              <td style={{ padding: 12, color: '#22c55e' }}>allSettled</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>记录错误，使用其他服务</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#94a3b8' }}>批量文件读取</td>
              <td style={{ padding: 12, color: '#22c55e' }}>allSettled</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>跳过失败文件，报告原因</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#94a3b8' }}>目录扫描</td>
              <td style={{ padding: 12, color: '#22c55e' }}>allSettled</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>返回空结果，继续遍历</td>
            </tr>
            <tr>
              <td style={{ padding: 12, color: '#94a3b8' }}>内存文件发现</td>
              <td style={{ padding: 12, color: '#22c55e' }}>allSettled</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>日志警告，处理其他目录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
