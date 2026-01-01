import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

type TabType = 'overview' | 'retry' | 'fallback' | 'token' | 'timeout';

const relatedPages: RelatedPage[] = [
  { id: 'retry', label: '重试与降级', description: '指数退避与模型降级策略' },
  { id: 'error', label: '错误处理', description: '错误分类与处理策略' },
  { id: 'content-gen', label: 'ContentGenerator', description: 'API 调用层详解' },
  { id: 'exponential-backoff-anim', label: '指数退避动画', description: '可视化退避算法' },
  { id: 'concurrency-patterns', label: '并发模式', description: '异步操作与并发控制' },
];

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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">
        🛠️ 错误恢复模式
      </h1>
      <p className="text-[var(--text-secondary)] mb-6 text-sm">
        Gemini CLI 中的错误处理、重试机制与优雅降级策略
      </p>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg border-none cursor-pointer text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--cyber-blue)] text-white'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
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
    <div className="flex flex-col gap-6">
      <Layer title="📐 错误恢复架构">
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
      </Layer>

      {/* Pattern Summary Table */}
      <Layer title="🗂️ 核心恢复模式">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="p-3 text-left text-[var(--text-primary)]">模式</th>
                <th className="p-3 text-left text-[var(--text-primary)]">触发条件</th>
                <th className="p-3 text-left text-[var(--text-primary)]">核心机制</th>
                <th className="p-3 text-left text-[var(--text-primary)]">关键代码</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="p-3 text-[var(--terminal-green)] font-semibold">指数退避</td>
                <td className="p-3 text-[var(--text-secondary)]">429/5xx 错误</td>
                <td className="p-3 text-[var(--text-secondary)]">延迟 × 2 + 抖动</td>
                <td className="p-3 text-[var(--cyber-blue)] font-mono text-xs">retry.ts</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3 text-[var(--amber)] font-semibold">模型降级</td>
                <td className="p-3 text-[var(--text-secondary)]">Pro 配额耗尽</td>
                <td className="p-3 text-[var(--text-secondary)]">Pro → Flash</td>
                <td className="p-3 text-[var(--cyber-blue)] font-mono text-xs">fallback/handler.ts</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3 text-[var(--cyber-blue)] font-semibold">Token 刷新</td>
                <td className="p-3 text-[var(--text-secondary)]">401/403 认证失败</td>
                <td className="p-3 text-[var(--text-secondary)]">透明刷新重试</td>
                <td className="p-3 text-[var(--cyber-blue)] font-mono text-xs">sharedTokenManager.ts</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-3 text-[var(--error)] font-semibold">配额检测</td>
                <td className="p-3 text-[var(--text-secondary)]">Gemini 配额用尽</td>
                <td className="p-3 text-[var(--text-secondary)]">立即失败</td>
                <td className="p-3 text-[var(--cyber-blue)] font-mono text-xs">quotaErrorDetection.ts</td>
              </tr>
              <tr>
                <td className="p-3 text-[var(--purple)] font-semibold">MCP 隔离</td>
                <td className="p-3 text-[var(--text-secondary)]">单服务器失败</td>
                <td className="p-3 text-[var(--text-secondary)]">继续其他服务器</td>
                <td className="p-3 text-[var(--cyber-blue)] font-mono text-xs">mcp-client-manager.ts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* Design Philosophy */}
      <HighlightBox title="💡 设计哲学" variant="blue">
        <ul className="text-[var(--text-secondary)] text-sm space-y-1 list-disc list-inside">
          <li><strong className="text-[var(--text-primary)]">区分可恢复与不可恢复</strong>：限流可重试，配额耗尽需降级</li>
          <li><strong className="text-[var(--text-primary)]">透明恢复优先</strong>：用户无感知的自动重试</li>
          <li><strong className="text-[var(--text-primary)]">优雅降级兜底</strong>：无法恢复时提供有用的错误信息</li>
          <li><strong className="text-[var(--text-primary)]">进程安全</strong>：多进程场景下的锁和缓存一致性</li>
        </ul>
      </HighlightBox>
    </div>
  );
}

function RetryTab() {
  return (
    <div className="flex flex-col gap-6">
      <Layer title="🔄 指数退避重试">
        <p className="text-[var(--text-secondary)] mb-4">
          核心重试机制实现了<strong className="text-[var(--text-primary)]">指数退避 + 抖动</strong>，避免雷群效应：
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
      </Layer>

      {/* Delay Visualization */}
      <Layer title="📊 延迟曲线">
        <MermaidDiagram chart={`
xychart-beta
    title "指数退避延迟（毫秒）"
    x-axis [1, 2, 3, 4, 5, 6]
    y-axis "延迟 (ms)" 0 --> 35000
    bar [1000, 2000, 4000, 8000, 16000, 32000]
`} />

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
            <div className="text-[var(--terminal-green)] text-lg font-bold">1s</div>
            <div className="text-[var(--text-muted)] text-xs">初始延迟</div>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
            <div className="text-[var(--amber)] text-lg font-bold">×2</div>
            <div className="text-[var(--text-muted)] text-xs">指数增长</div>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
            <div className="text-[var(--error)] text-lg font-bold">32s</div>
            <div className="text-[var(--text-muted)] text-xs">最大延迟</div>
          </div>
        </div>
      </Layer>

      {/* Jitter Explanation */}
      <Layer title="🎲 抖动机制">
        <CodeBlock language="typescript" code={`// 抖动计算：±30% 随机偏移
const jitter = currentDelay * 0.3 * (Math.random() * 2 - 1);
const delayWithJitter = Math.max(0, currentDelay + jitter);

// 示例：当 currentDelay = 1000ms
// 抖动范围：-300ms 到 +300ms
// 实际延迟：700ms 到 1300ms`} />

        <HighlightBox title="为什么需要抖动？" variant="blue">
          <p className="text-sm">
            当多个客户端同时遇到错误，固定延迟会导致它们同时重试，
            形成"雷群效应"。抖动使重试时间分散，减轻服务器压力。
          </p>
        </HighlightBox>
      </Layer>

      {/* Retry-After Header */}
      <Layer title="📬 Retry-After 响应头">
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

        <p className="text-[var(--text-secondary)] text-sm mt-3">
          服务器返回的 <code className="text-[var(--cyber-blue)]">Retry-After</code> 头优先级高于本地计算的退避延迟。
        </p>
      </Layer>
    </div>
  );
}

function FallbackTab() {
  return (
    <div className="flex flex-col gap-6">
      <Layer title="📉 模型降级策略">
        <MermaidDiagram chart={`
flowchart TD
    subgraph "配额检测"
        Q1[Gemini Pro 配额]
        Q2[Gemini 配额]
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
      </Layer>

      {/* Quota Detection */}
      <Layer title="🔍 配额错误检测">
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

// Gemini 配额耗尽（不可恢复）
export function isGeminiQuotaExhausted(error: unknown): boolean {
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

// Gemini 限流（可重试）
export function isGeminiThrottlingError(error: unknown): boolean {
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
      </Layer>

      {/* Fallback Handler */}
      <Layer title="🔄 降级处理器">
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

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
            <div className="text-[var(--terminal-green)] font-semibold mb-1">retry</div>
            <div className="text-[var(--text-secondary)] text-xs">切换模型并继续</div>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
            <div className="text-[var(--amber)] font-semibold mb-1">stop</div>
            <div className="text-[var(--text-secondary)] text-xs">切换模型但停止</div>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
            <div className="text-[var(--error)] font-semibold mb-1">auth</div>
            <div className="text-[var(--text-secondary)] text-xs">需要重新认证</div>
          </div>
        </div>
      </Layer>

      {/* Model Fallback Chain */}
      <Layer title="🔗 降级链路">
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

        <HighlightBox title="Google OAuth 特殊处理" variant="blue">
          <p className="text-sm">
            Gemini 配额耗尽是不可恢复的，不会尝试降级，而是直接提示用户升级付费计划。
          </p>
        </HighlightBox>
      </Layer>
    </div>
  );
}

function TokenTab() {
  return (
    <div className="flex flex-col gap-6">
      <Layer title="🔑 分布式 Token 刷新">
        <p className="text-[var(--text-secondary)] mb-4">
          多进程安全的 Token 管理，支持<strong className="text-[var(--text-primary)]">文件锁</strong>和<strong className="text-[var(--text-primary)]">缓存一致性</strong>：
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
      </Layer>

      {/* Transparent Retry */}
      <Layer title="🔄 透明认证重试">
        <CodeBlock language="typescript" code={`// packages/core/src/gemini/geminiContentGenerator.ts

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
      await this.tokenManager.getValidCredentials(this.oauthClient, true);
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

        <HighlightBox title="单次重试策略" variant="blue">
          <p className="text-sm">
            认证错误只重试一次。如果强制刷新后仍然失败，
            说明是真正的认证问题（如 refresh token 过期），需要用户重新登录。
          </p>
        </HighlightBox>
      </Layer>

      {/* Process Cleanup */}
      <Layer title="🧹 进程退出清理">
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
      </Layer>
    </div>
  );
}

function TimeoutTab() {
  return (
    <div className="flex flex-col gap-6">
      <Layer title="⏱️ 超时处理">
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
      </Layer>

      {/* Timeout Detection */}
      <Layer title="🔍 超时错误检测">
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

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
            <div className="text-[var(--amber)] font-semibold mb-1">消息模式</div>
            <ul className="text-[var(--text-secondary)] text-xs space-y-1 list-disc list-inside">
              <li>timeout</li>
              <li>timed out</li>
              <li>deadline exceeded</li>
            </ul>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-lg">
            <div className="text-[var(--cyber-blue)] font-semibold mb-1">错误码模式</div>
            <ul className="text-[var(--text-secondary)] text-xs space-y-1 list-disc list-inside">
              <li>ETIMEDOUT</li>
              <li>ESOCKETTIMEDOUT</li>
              <li>ABORT_ERR</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* Troubleshooting Tips */}
      <Layer title="💡 用户友好的错误提示">
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

        <div className="mt-4 p-4 bg-[var(--bg-elevated)] rounded-lg border border-white/10">
          <div className="text-[var(--amber)] font-semibold mb-2">⏱️ 请求超时</div>
          <div className="text-[var(--text-secondary)] text-sm">
            可能的解决方案：
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>减少输入长度或复杂度</li>
              <li>在配置中增加超时时间: contentGenerator.timeout</li>
              <li>检查网络连接</li>
              <li>考虑使用流式模式处理长响应</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* MCP Connection Recovery */}
      <Layer title="🔌 MCP 服务器隔离">
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

        <HighlightBox title="容错设计" variant="blue">
          <p className="text-sm">
            单个 MCP 服务器连接失败不会影响其他服务器的发现和使用。
            系统会继续使用可用的服务器，提供最大程度的功能可用性。
          </p>
        </HighlightBox>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
