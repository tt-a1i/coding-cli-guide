import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

type TabType = 'overview' | 'retry' | 'fallback' | 'token' | 'timeout';

export function ErrorRecoveryPatterns() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: '模式概览', icon: '🎯' },
    { id: 'retry', label: '指数退避', icon: '🔄' },
    { id: 'fallback', label: '模型降级', icon: '📉' },
    { id: 'token', label: 'Token 刷新', icon: '🔑' },
    { id: 'timeout', label: '超时处理', icon: '⏱️' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' }}>
        🛠️ 错误恢复模式
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 15 }}>
        Innies CLI 中的错误处理、重试机制与优雅降级策略
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
      {activeTab === 'retry' && <RetryTab />}
      {activeTab === 'fallback' && <FallbackTab />}
      {activeTab === 'token' && <TokenTab />}
      {activeTab === 'timeout' && <TimeoutTab />}
    </div>
  );
}

function OverviewTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📐 错误恢复架构
        </h2>

        <MermaidDiagram chart={`
flowchart TD
    subgraph "错误类型"
        E1[网络超时]
        E2[429 限流]
        E3[401/403 认证]
        E4[配额耗尽]
        E5[服务器错误]
    end

    subgraph "恢复策略"
        R1[指数退避重试]
        R2[模型降级]
        R3[Token 刷新]
        R4[优雅失败]
    end

    E1 --> R1
    E2 --> R1
    E3 --> R3
    E4 --> R2
    E5 --> R1

    R1 -->|成功| OK((成功))
    R2 -->|成功| OK
    R3 -->|成功| OK

    R1 -->|失败| R4
    R2 -->|失败| R4
    R3 -->|失败| R4

    R4 --> FAIL((优雅失败))

    style OK fill:#22c55e,stroke:#16a34a,color:#fff
    style FAIL fill:#ef4444,stroke:#dc2626,color:#fff
`} />
      </div>

      {/* Pattern Summary Table */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🗂️ 核心恢复模式
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>模式</th>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>触发条件</th>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>核心机制</th>
              <th style={{ padding: 12, textAlign: 'left', color: '#f1f5f9' }}>关键代码</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#22c55e', fontWeight: 600 }}>指数退避</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>429/5xx 错误</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>延迟 × 2 + 抖动</td>
              <td style={{ padding: 12, color: '#60a5fa', fontFamily: 'monospace', fontSize: 12 }}>retry.ts</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#f59e0b', fontWeight: 600 }}>模型降级</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>Pro 配额耗尽</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>Pro → Flash</td>
              <td style={{ padding: 12, color: '#60a5fa', fontFamily: 'monospace', fontSize: 12 }}>fallback/handler.ts</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#3b82f6', fontWeight: 600 }}>Token 刷新</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>401/403 认证失败</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>透明刷新重试</td>
              <td style={{ padding: 12, color: '#60a5fa', fontFamily: 'monospace', fontSize: 12 }}>sharedTokenManager.ts</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, color: '#ef4444', fontWeight: 600 }}>配额检测</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>Qwen 免费额度用尽</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>立即失败</td>
              <td style={{ padding: 12, color: '#60a5fa', fontFamily: 'monospace', fontSize: 12 }}>quotaErrorDetection.ts</td>
            </tr>
            <tr>
              <td style={{ padding: 12, color: '#a855f7', fontWeight: 600 }}>MCP 隔离</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>单服务器失败</td>
              <td style={{ padding: 12, color: '#94a3b8' }}>继续其他服务器</td>
              <td style={{ padding: 12, color: '#60a5fa', fontFamily: 'monospace', fontSize: 12 }}>mcp-client-manager.ts</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Design Philosophy */}
      <div style={{ padding: 16, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
        <h4 style={{ color: '#60a5fa', marginBottom: 8, fontSize: 15, fontWeight: 600 }}>
          💡 设计哲学
        </h4>
        <ul style={{ color: '#94a3b8', fontSize: 14, margin: 0, paddingLeft: 20 }}>
          <li><strong style={{ color: '#f1f5f9' }}>区分可恢复与不可恢复</strong>：限流可重试，配额耗尽需降级</li>
          <li><strong style={{ color: '#f1f5f9' }}>透明恢复优先</strong>：用户无感知的自动重试</li>
          <li><strong style={{ color: '#f1f5f9' }}>优雅降级兜底</strong>：无法恢复时提供有用的错误信息</li>
          <li><strong style={{ color: '#f1f5f9' }}>进程安全</strong>：多进程场景下的锁和缓存一致性</li>
        </ul>
      </div>
    </div>
  );
}

function RetryTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔄 指数退避重试
        </h2>

        <p style={{ color: '#94a3b8', marginBottom: 16 }}>
          核心重试机制实现了<strong style={{ color: '#f1f5f9' }}>指数退避 + 抖动</strong>，避免雷群效应：
        </p>

        <CodeBlock language="typescript" code={`// packages/core/src/utils/retry.ts

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 32000,
    shouldRetry = defaultShouldRetry,
    shouldRetryOnContent,
    onPersistent429,
  } = options ?? {};

  let attempt = 0;
  let currentDelay = initialDelayMs;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const result = await fn();

      // 内容级别的重试判断（如空响应）
      if (shouldRetryOnContent && shouldRetryOnContent(result)) {
        // 抖动：±30% 随机偏移
        const jitter = currentDelay * 0.3 * (Math.random() * 2 - 1);
        const delayWithJitter = Math.max(0, currentDelay + jitter);

        await delay(delayWithJitter);
        currentDelay = Math.min(maxDelayMs, currentDelay * 2);
        continue;
      }

      return result;
    } catch (error) {
      const errorStatus = getErrorStatus(error);

      // 429 配额耗尽：触发模型降级
      if (errorStatus === 429 && isProQuotaExceededError(error)) {
        await onPersistent429?.(authType, error);
        attempt = 0; // 重置计数器，使用新模型
        continue;
      }

      // 尊重 Retry-After 响应头
      const retryAfter = getRetryAfterMs(error);
      if (retryAfter > 0) {
        await delay(retryAfter);
      } else {
        // 指数退避 + 抖动
        const jitter = currentDelay * 0.3 * (Math.random() * 2 - 1);
        await delay(Math.max(0, currentDelay + jitter));
        currentDelay = Math.min(maxDelayMs, currentDelay * 2);
      }
    }
  }

  throw lastError;
}`} />
      </div>

      {/* Delay Visualization */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📊 延迟曲线
        </h3>

        <MermaidDiagram chart={`
xychart-beta
    title "指数退避延迟（毫秒）"
    x-axis [1, 2, 3, 4, 5, 6]
    y-axis "延迟 (ms)" 0 --> 35000
    bar [1000, 2000, 4000, 8000, 16000, 32000]
`} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: '#22c55e', fontSize: 18, fontWeight: 700 }}>1s</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>初始延迟</div>
          </div>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: '#f59e0b', fontSize: 18, fontWeight: 700 }}>×2</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>指数增长</div>
          </div>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: '#ef4444', fontSize: 18, fontWeight: 700 }}>32s</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>最大延迟</div>
          </div>
        </div>
      </div>

      {/* Jitter Explanation */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🎲 抖动机制
        </h3>

        <CodeBlock language="typescript" code={`// 抖动计算：±30% 随机偏移
const jitter = currentDelay * 0.3 * (Math.random() * 2 - 1);
const delayWithJitter = Math.max(0, currentDelay + jitter);

// 示例：当 currentDelay = 1000ms
// 抖动范围：-300ms 到 +300ms
// 实际延迟：700ms 到 1300ms`} />

        <div style={{ marginTop: 16, padding: 12, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
          <p style={{ color: '#60a5fa', fontSize: 14, margin: 0 }}>
            <strong>为什么需要抖动？</strong>当多个客户端同时遇到错误，固定延迟会导致它们同时重试，
            形成"雷群效应"。抖动使重试时间分散，减轻服务器压力。
          </p>
        </div>
      </div>

      {/* Retry-After Header */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📬 Retry-After 响应头
        </h3>

        <CodeBlock language="typescript" code={`function getRetryAfterMs(error: unknown): number {
  // 从 429 响应中提取 Retry-After 头
  const headers = getErrorHeaders(error);
  const retryAfter = headers?.['retry-after'];

  if (!retryAfter) return 0;

  // 秒数格式：Retry-After: 120
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }

  // HTTP 日期格式：Retry-After: Wed, 21 Oct 2024 07:28:00 GMT
  const date = Date.parse(retryAfter);
  if (!isNaN(date)) {
    return Math.max(0, date - Date.now());
  }

  return 0;
}`} />

        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 12 }}>
          服务器返回的 <code style={{ color: '#60a5fa' }}>Retry-After</code> 头优先级高于本地计算的退避延迟。
        </p>
      </div>
    </div>
  );
}

function FallbackTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📉 模型降级策略
        </h2>

        <MermaidDiagram chart={`
flowchart TD
    subgraph "配额检测"
        Q1[Gemini Pro 配额]
        Q2[Qwen 免费配额]
        Q3[通用配额错误]
    end

    subgraph "处理策略"
        F1[降级到 Flash]
        F2[立即失败]
        F3[重试]
    end

    Q1 -->|可恢复| F1
    Q2 -->|不可恢复| F2
    Q3 -->|可恢复| F3

    F1 --> UI[询问用户意图]
    UI -->|retry| CONTINUE[继续执行]
    UI -->|stop| STOP[停止当前]
    UI -->|auth| REAUTH[重新认证]

    style F1 fill:#f59e0b,stroke:#d97706,color:#fff
    style F2 fill:#ef4444,stroke:#dc2626,color:#fff
    style CONTINUE fill:#22c55e,stroke:#16a34a,color:#fff
`} />
      </div>

      {/* Quota Detection */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔍 配额错误检测
        </h3>

        <CodeBlock language="typescript" code={`// packages/core/src/utils/quotaErrorDetection.ts

// Gemini Pro 配额耗尽（可降级）
export function isProQuotaExceededError(error: unknown): boolean {
  const checkMessage = (message: string): boolean =>
    message.includes("Quota exceeded for quota metric 'Gemini") &&
    message.includes("Pro Requests'");

  // 检查多种错误结构
  if (typeof error === 'string') return checkMessage(error);
  if (error instanceof StructuredError) return checkMessage(error.message);
  if (error instanceof ApiError) return checkMessage(error.message);
  // ...
}

// Qwen 免费配额耗尽（不可恢复）
export function isQwenFreeQuotaExhausted(error: unknown): boolean {
  const checkMessage = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return (
      lowerMessage.includes('free quota') ||
      lowerMessage.includes('quota exhausted') ||
      lowerMessage.includes('每日免费额度')
    );
  };
  // ...
}

// Qwen 限流（可重试）
export function isQwenThrottlingError(error: unknown): boolean {
  const checkMessage = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return (
      lowerMessage.includes('throttling') ||
      lowerMessage.includes('rate limit') ||
      lowerMessage.includes('too many requests')
    );
  };
  // ...
}`} />
      </div>

      {/* Fallback Handler */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔄 降级处理器
        </h3>

        <CodeBlock language="typescript" code={`// packages/core/src/fallback/handler.ts

export async function handleFallback(
  config: Config,
  failedModel: string,
  authType?: string,
  error?: unknown,
): Promise<string | boolean | null> {
  const fallbackModel = DEFAULT_GEMINI_FLASH_MODEL;

  // 已经是降级模型，无法继续降级
  if (failedModel === fallbackModel) {
    return null;
  }

  const fallbackModelHandler = config.fallbackModelHandler;
  if (typeof fallbackModelHandler !== 'function') {
    return null;
  }

  try {
    // 询问用户意图
    const intent = await fallbackModelHandler(
      failedModel,
      fallbackModel,
      error,
    );

    switch (intent) {
      case 'retry':
        // 激活降级模式并继续
        activateFallbackMode(config, authType);
        return true;

      case 'stop':
        // 激活降级模式但停止当前操作
        activateFallbackMode(config, authType);
        return false;

      case 'auth':
        // 需要重新认证
        return false;
    }
  } catch (handlerError) {
    console.error('Fallback UI handler failed:', handlerError);
    return null;
  }
}`} />

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>retry</div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>切换模型并继续</div>
          </div>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>stop</div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>切换模型但停止</div>
          </div>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>auth</div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>需要重新认证</div>
          </div>
        </div>
      </div>

      {/* Model Fallback Chain */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔗 降级链路
        </h3>

        <MermaidDiagram chart={`
flowchart LR
    A[Gemini Pro] -->|配额耗尽| B[Gemini Flash]
    B -->|配额耗尽| C((失败))

    A -->|Google OAuth| D{用户选择}
    D -->|retry| B
    D -->|stop| E[停止]
    D -->|auth| F[重新登录]

    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style B fill:#f59e0b,stroke:#d97706,color:#fff
    style C fill:#ef4444,stroke:#dc2626,color:#fff
`} />

        <div style={{ marginTop: 16, padding: 12, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
          <p style={{ color: '#60a5fa', fontSize: 14, margin: 0 }}>
            <strong>Qwen OAuth 特殊处理</strong>：Qwen 免费配额耗尽是不可恢复的，
            不会尝试降级，而是直接提示用户升级付费计划。
          </p>
        </div>
      </div>
    </div>
  );
}

function TokenTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔑 分布式 Token 刷新
        </h2>

        <p style={{ color: '#94a3b8', marginBottom: 16 }}>
          多进程安全的 Token 管理，支持<strong style={{ color: '#f1f5f9' }}>文件锁</strong>和<strong style={{ color: '#f1f5f9' }}>缓存一致性</strong>：
        </p>

        <MermaidDiagram chart={`
sequenceDiagram
    participant P1 as 进程 1
    participant P2 as 进程 2
    participant Lock as 文件锁
    participant Cache as 凭证文件
    participant API as OAuth API

    P1->>Lock: 尝试获取锁
    Lock-->>P1: 获取成功
    P1->>Cache: 读取凭证
    P1->>API: 刷新 Token

    Note over P2: P2 同时需要刷新
    P2->>Lock: 尝试获取锁
    Lock-->>P2: 等待...

    API-->>P1: 新 Token
    P1->>Cache: 写入新凭证
    P1->>Lock: 释放锁

    Lock-->>P2: 获取成功
    P2->>Cache: 读取凭证
    Note over P2: 发现已更新
    P2-->>P2: 使用新凭证
    P2->>Lock: 释放锁
`} />
      </div>

      {/* Token Manager Implementation */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          📦 SharedTokenManager 实现
        </h3>

        <CodeBlock language="typescript" code={`// packages/core/src/qwen/sharedTokenManager.ts

export class SharedTokenManager {
  private memoryCache: { credentials: QwenCredentials | null; mtime: number };
  private refreshPromise: Promise<QwenCredentials> | null = null;

  async getValidCredentials(
    qwenClient: IQwenOAuth2Client,
    forceRefresh = false,
  ): Promise<QwenCredentials> {
    // 1. 检查其他进程是否更新了凭证文件
    await this.checkAndReloadIfNeeded(qwenClient);

    // 2. 缓存有效且未过期，直接返回
    if (!forceRefresh && this.memoryCache.credentials &&
        this.isTokenValid(this.memoryCache.credentials)) {
      return this.memoryCache.credentials;
    }

    // 3. 使用 Promise 链防止并发刷新
    let currentRefreshPromise = this.refreshPromise;
    if (!currentRefreshPromise) {
      currentRefreshPromise = this.performTokenRefresh(qwenClient, forceRefresh);
      this.refreshPromise = currentRefreshPromise;
    }

    try {
      return await currentRefreshPromise;
    } finally {
      // 4. 清理 Promise 引用
      if (this.refreshPromise === currentRefreshPromise) {
        this.refreshPromise = null;
      }
    }
  }

  private async checkAndReloadIfNeeded(qwenClient: IQwenOAuth2Client): Promise<void> {
    const currentMtime = await this.getFileMtime();

    // 文件被其他进程修改
    if (currentMtime > this.memoryCache.mtime) {
      this.memoryCache.credentials = await this.loadFromFile();
      this.memoryCache.mtime = currentMtime;
    }
  }
}`} />
      </div>

      {/* Transparent Retry */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔄 透明认证重试
        </h3>

        <CodeBlock language="typescript" code={`// packages/core/src/qwen/qwenContentGenerator.ts

private async executeWithCredentialManagement<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const attemptOperation = async (): Promise<T> => {
    // 每次请求前更新凭证
    const { token, endpoint } = await this.getValidToken();
    this.pipeline.client.apiKey = token;
    this.pipeline.client.baseURL = endpoint;
    return await operation();
  };

  try {
    return await attemptOperation();
  } catch (error) {
    // 认证错误：强制刷新后重试
    if (this.isAuthError(error)) {
      await this.sharedManager.getValidCredentials(this.qwenClient, true);
      return await attemptOperation();
    }
    throw error;
  }
}

private isAuthError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 401 || status === 403) return true;

  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('unauthorized') ||
    message.includes('token expired') ||
    message.includes('authentication')
  );
}`} />

        <div style={{ marginTop: 16, padding: 12, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
          <p style={{ color: '#60a5fa', fontSize: 14, margin: 0 }}>
            <strong>单次重试策略</strong>：认证错误只重试一次。如果强制刷新后仍然失败，
            说明是真正的认证问题（如 refresh token 过期），需要用户重新登录。
          </p>
        </div>
      </div>

      {/* Process Cleanup */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🧹 进程退出清理
        </h3>

        <CodeBlock language="typescript" code={`// 注册清理处理器
private registerCleanupHandlers(): void {
  process.on('exit', this.cleanupFunction);
  process.on('SIGINT', this.cleanupFunction);
  process.on('SIGTERM', this.cleanupFunction);
  process.on('uncaughtException', this.cleanupFunction);
  process.on('unhandledRejection', this.cleanupFunction);
}

private cleanupFunction = (): void => {
  // 释放文件锁
  if (this.lockFileDescriptor) {
    try {
      fs.closeSync(this.lockFileDescriptor);
      fs.unlinkSync(this.lockFilePath);
    } catch {
      // 忽略清理错误
    }
  }
};`} />
      </div>
    </div>
  );
}

function TimeoutTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          ⏱️ 超时处理
        </h2>

        <CodeBlock language="typescript" code={`// packages/core/src/utils/fetch.ts

export async function fetchWithTimeout(
  url: string,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    // 超时导致的取消
    if (isNodeError(error) && error.code === 'ABORT_ERR') {
      throw new FetchError(
        \`Request timed out after \${timeout}ms\`,
        'ETIMEDOUT',
      );
    }
    throw new FetchError(getErrorMessage(error));
  } finally {
    // 确保清理定时器
    clearTimeout(timeoutId);
  }
}`} />
      </div>

      {/* Timeout Detection */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔍 超时错误检测
        </h3>

        <CodeBlock language="typescript" code={`// packages/core/src/core/openaiContentGenerator/errorHandler.ts

private isTimeoutError(error: unknown): boolean {
  const errorMessage = error instanceof Error
    ? error.message.toLowerCase()
    : String(error).toLowerCase();
  const errorCode = (error as any)?.code;
  const errorType = (error as any)?.type;

  return (
    // 消息模式
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorMessage.includes('connection timeout') ||
    errorMessage.includes('deadline exceeded') ||

    // 错误码模式
    errorCode === 'ETIMEDOUT' ||
    errorCode === 'ESOCKETTIMEDOUT' ||

    // 类型模式
    errorType === 'timeout'
  );
}`} />

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8 }}>
            <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>消息模式</div>
            <ul style={{ color: '#94a3b8', fontSize: 12, margin: 0, paddingLeft: 16 }}>
              <li>timeout</li>
              <li>timed out</li>
              <li>deadline exceeded</li>
            </ul>
          </div>
          <div style={{ padding: 12, background: '#1e293b', borderRadius: 8 }}>
            <div style={{ color: '#3b82f6', fontWeight: 600, marginBottom: 4 }}>错误码模式</div>
            <ul style={{ color: '#94a3b8', fontSize: 12, margin: 0, paddingLeft: 16 }}>
              <li>ETIMEDOUT</li>
              <li>ESOCKETTIMEDOUT</li>
              <li>ABORT_ERR</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          💡 用户友好的错误提示
        </h3>

        <CodeBlock language="typescript" code={`private getTimeoutTroubleshootingTips(context: RequestContext): string {
  const baseTips = [
    '- 减少输入长度或复杂度',
    '- 在配置中增加超时时间: contentGenerator.timeout',
    '- 检查网络连接',
  ];

  // 流式请求特定提示
  const streamingSpecificTips = context.isStreaming
    ? ['- 检查流式连接的网络稳定性']
    : ['- 考虑使用流式模式处理长响应'];

  return [
    '⏱️ 请求超时',
    '',
    '可能的解决方案:',
    ...baseTips,
    ...streamingSpecificTips,
  ].join('\\n');
}`} />

        <div style={{ marginTop: 16, padding: 16, background: '#1e293b', borderRadius: 8, border: '1px solid #334155' }}>
          <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: 8 }}>⏱️ 请求超时</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>
            可能的解决方案：
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>减少输入长度或复杂度</li>
              <li>在配置中增加超时时间: contentGenerator.timeout</li>
              <li>检查网络连接</li>
              <li>考虑使用流式模式处理长响应</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MCP Connection Recovery */}
      <div style={{ padding: 20, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#f1f5f9' }}>
          🔌 MCP 服务器隔离
        </h3>

        <CodeBlock language="typescript" code={`// packages/core/src/tools/mcp-client-manager.ts

// 并行发现，单服务器失败不阻塞其他
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

const results = await Promise.all(discoveryPromises);

// 只使用成功连接的服务器
const connectedServers = results
  .filter(r => r.success)
  .map(r => r.client!);`} />

        <div style={{ marginTop: 16, padding: 12, background: '#1e3a5f', borderRadius: 8, border: '1px solid #3b82f6' }}>
          <p style={{ color: '#60a5fa', fontSize: 14, margin: 0 }}>
            <strong>容错设计</strong>：单个 MCP 服务器连接失败不会影响其他服务器的发现和使用。
            系统会继续使用可用的服务器，提供最大程度的功能可用性。
          </p>
        </div>
      </div>
    </div>
  );
}
