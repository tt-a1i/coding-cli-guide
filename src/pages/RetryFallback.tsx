import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function RetryFallback() {
  const retryFlowChart = `flowchart TD
    start([API 请求])
    execute[执行请求]
    success{成功?}
    return_result([返回结果])
    check_retry{可重试错误?}
    check_attempts{尝试次数<5?}
    calc_delay[计算延迟<br/>指数退避+抖动]
    wait[等待延迟]
    fallback_check{尝试回退?}
    use_fallback[使用回退模型]
    throw_error([抛出错误])

    start --> execute
    execute --> success
    success -->|Yes| return_result
    success -->|No| check_retry
    check_retry -->|Yes| check_attempts
    check_retry -->|No| fallback_check
    check_attempts -->|Yes| calc_delay
    check_attempts -->|No| fallback_check
    calc_delay --> wait
    wait --> execute
    fallback_check -->|Yes| use_fallback
    fallback_check -->|No| throw_error
    use_fallback --> execute

    style start fill:#22d3ee,color:#000
    style return_result fill:#22c55e,color:#000
    style throw_error fill:#ef4444,color:#fff
    style success fill:#f59e0b,color:#000
    style check_retry fill:#f59e0b,color:#000
    style check_attempts fill:#f59e0b,color:#000
    style fallback_check fill:#f59e0b,color:#000
`;

  const fallbackFlowChart = `flowchart TD
    start([主模型请求失败])
    check_error[分析错误类型]
    is_recoverable{可恢复?}
    check_fallback{有回退模型?}
    switch_model[切换到<br/>回退模型]
    retry_request[重新请求]
    success{成功?}
    return_result([返回结果<br/>降级])
    fail([最终失败])

    start --> check_error
    check_error --> is_recoverable
    is_recoverable -->|Yes| check_fallback
    is_recoverable -->|No| fail
    check_fallback -->|Yes| switch_model
    check_fallback -->|No| fail
    switch_model --> retry_request
    retry_request --> success
    success -->|Yes| return_result
    success -->|No| fail

    style start fill:#22d3ee,color:#000
    style return_result fill:#22c55e,color:#000
    style fail fill:#ef4444,color:#fff
    style is_recoverable fill:#f59e0b,color:#000
    style check_fallback fill:#f59e0b,color:#000
    style success fill:#f59e0b,color:#000
`;

  const retryConfigCode = `// packages/core/src/utils/retry.ts

// 重试配置
interface RetryConfig {
  maxAttempts: number;       // 最大重试次数 (默认: 5)
  initialDelayMs: number;    // 初始延迟 (默认: 5000ms)
  maxDelayMs: number;        // 最大延迟 (默认: 30000ms)
  backoffMultiplier: number; // 退避乘数 (默认: 2)
  jitterFactor: number;      // 抖动因子 (默认: 0.1)
}

// 默认配置
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  initialDelayMs: 5000,      // 5 秒
  maxDelayMs: 30000,         // 30 秒
  backoffMultiplier: 2,
  jitterFactor: 0.1,
};

// 计算重试延迟 (指数退避 + 抖动)
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  // 基础延迟 = 初始延迟 * (乘数 ^ 尝试次数)
  const baseDelay = config.initialDelayMs *
    Math.pow(config.backoffMultiplier, attempt);

  // 限制最大延迟
  const cappedDelay = Math.min(baseDelay, config.maxDelayMs);

  // 添加抖动 (±10%)
  const jitter = cappedDelay * config.jitterFactor *
    (Math.random() * 2 - 1);

  return Math.max(0, cappedDelay + jitter);
}

/*
延迟计算示例 (默认配置):
─────────────────────────────────────────
尝试次数 │ 基础延迟   │ 带抖动延迟 (±10%)
─────────────────────────────────────────
   1     │  5,000 ms │  4,500 - 5,500 ms
   2     │ 10,000 ms │  9,000 - 11,000 ms
   3     │ 20,000 ms │ 18,000 - 22,000 ms
   4     │ 30,000 ms │ 27,000 - 33,000 ms (封顶)
   5     │ 30,000 ms │ 27,000 - 33,000 ms (封顶)
─────────────────────────────────────────
*/`;

  const retryableErrorsCode = `// 可重试错误判断
// packages/core/src/utils/retry.ts

// 可重试的错误类型
const RETRYABLE_STATUS_CODES = [
  429,  // Too Many Requests (速率限制)
  500,  // Internal Server Error
  502,  // Bad Gateway
  503,  // Service Unavailable
  504,  // Gateway Timeout
];

const RETRYABLE_ERROR_CODES = [
  'ECONNRESET',     // 连接重置
  'ETIMEDOUT',      // 连接超时
  'ECONNREFUSED',   // 连接被拒绝
  'ENOTFOUND',      // DNS 查询失败
  'EAI_AGAIN',      // 临时 DNS 失败
  'RATE_LIMIT',     // 自定义速率限制错误
  'OVERLOADED',     // 服务过载
];

function isRetryableError(error: Error): boolean {
  // HTTP 状态码检查
  if ('status' in error) {
    const status = (error as any).status;
    if (RETRYABLE_STATUS_CODES.includes(status)) {
      return true;
    }
  }

  // 错误代码检查
  if ('code' in error) {
    const code = (error as any).code;
    if (RETRYABLE_ERROR_CODES.includes(code)) {
      return true;
    }
  }

  // 错误消息模式匹配
  const retryablePatterns = [
    /rate limit/i,
    /too many requests/i,
    /temporarily unavailable/i,
    /service overloaded/i,
    /try again later/i,
  ];

  return retryablePatterns.some(p => p.test(error.message));
}

// 不可重试的错误 (立即失败)
const NON_RETRYABLE_ERRORS = [
  'INVALID_API_KEY',      // API 密钥无效
  'UNAUTHORIZED',         // 未授权
  'FORBIDDEN',            // 禁止访问
  'NOT_FOUND',            // 资源不存在
  'INVALID_REQUEST',      // 请求格式错误
  'CONTENT_FILTERED',     // 内容被过滤
];`;

  const retryImplementationCode = `// 重试执行器
// packages/core/src/utils/retry.ts

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < finalConfig.maxAttempts; attempt++) {
    try {
      // 执行操作
      return await operation();

    } catch (error) {
      lastError = error as Error;

      // 检查是否可重试
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // 检查是否还有重试机会
      if (attempt >= finalConfig.maxAttempts - 1) {
        break;
      }

      // 计算延迟
      const delay = calculateDelay(attempt, finalConfig);

      // 记录重试日志
      console.log(
        \`[Retry] 尝试 \${attempt + 1}/\${finalConfig.maxAttempts} 失败，\` +
        \`\${delay}ms 后重试: \${lastError.message}\`
      );

      // 等待后重试
      await sleep(delay);
    }
  }

  // 所有重试都失败
  throw new RetryExhaustedError(
    \`操作在 \${finalConfig.maxAttempts} 次尝试后失败\`,
    lastError!
  );
}

// 使用示例
const response = await withRetry(
  () => apiClient.generateContent(prompt),
  {
    maxAttempts: 3,
    initialDelayMs: 1000,
  }
);`;

  const fallbackConfigCode = `// packages/core/src/fallback/handler.ts

// 回退模型配置
interface FallbackConfig {
  enabled: boolean;
  fallbackModel: string;        // 回退模型名称
  triggerConditions: string[];  // 触发回退的条件
  preserveContext: boolean;     // 是否保留上下文
}

// 默认回退配置
const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  enabled: true,
  fallbackModel: 'gemini-1.5-flash',  // 回退到更快更稳定的模型
  triggerConditions: [
    'MODEL_OVERLOADED',
    'CONTEXT_LENGTH_EXCEEDED',
    'RATE_LIMIT_EXCEEDED',
    'TIMEOUT',
  ],
  preserveContext: true,
};

// 模型能力映射
const MODEL_CAPABILITIES = {
  'gemini-2.0-flash-exp': {
    contextWindow: 1000000,
    speed: 'fast',
    cost: 'low',
    reliability: 'experimental',
  },
  'gemini-1.5-flash': {
    contextWindow: 1000000,
    speed: 'very-fast',
    cost: 'very-low',
    reliability: 'stable',
  },
  'gemini-1.5-pro': {
    contextWindow: 2000000,
    speed: 'medium',
    cost: 'medium',
    reliability: 'stable',
  },
};`;

  const fallbackHandlerCode = `// 回退处理器实现
// packages/core/src/fallback/handler.ts

export class FallbackHandler {
  private config: FallbackConfig;
  private currentModel: string;
  private fallbackActive: boolean = false;

  constructor(config: Partial<FallbackConfig> = {}) {
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...config };
    this.currentModel = getDefaultModel();
  }

  // 处理请求，自动回退
  async handleRequest<T>(
    operation: (model: string) => Promise<T>
  ): Promise<T> {
    try {
      // 尝试主模型
      return await operation(this.currentModel);

    } catch (error) {
      // 检查是否应该回退
      if (this.shouldFallback(error as Error)) {
        return await this.executeFallback(operation, error as Error);
      }
      throw error;
    }
  }

  // 判断是否应该回退
  private shouldFallback(error: Error): boolean {
    if (!this.config.enabled) return false;
    if (this.fallbackActive) return false;  // 已经在回退模型上

    // 检查错误是否匹配触发条件
    const errorType = this.classifyError(error);
    return this.config.triggerConditions.includes(errorType);
  }

  // 分类错误
  private classifyError(error: Error): string {
    if (error.message.includes('overloaded')) return 'MODEL_OVERLOADED';
    if (error.message.includes('context length')) return 'CONTEXT_LENGTH_EXCEEDED';
    if (error.message.includes('rate limit')) return 'RATE_LIMIT_EXCEEDED';
    if (error.message.includes('timeout')) return 'TIMEOUT';
    return 'UNKNOWN';
  }

  // 执行回退
  private async executeFallback<T>(
    operation: (model: string) => Promise<T>,
    originalError: Error
  ): Promise<T> {
    console.log(
      \`[Fallback] 切换到回退模型: \${this.config.fallbackModel}\`
    );

    this.fallbackActive = true;

    try {
      // 使用回退模型重试
      const result = await operation(this.config.fallbackModel);

      // 标记结果来自回退模型
      if (typeof result === 'object' && result !== null) {
        (result as any).__fallbackUsed = true;
        (result as any).__originalError = originalError.message;
      }

      return result;

    } finally {
      // 重置回退状态 (下次请求尝试主模型)
      this.fallbackActive = false;
    }
  }
}`;

  const circuitBreakerCode = `// 熔断器模式
// 防止持续调用失败的服务

interface CircuitBreakerConfig {
  failureThreshold: number;     // 失败阈值 (默认: 5)
  resetTimeout: number;         // 重置超时 (默认: 60000ms)
  halfOpenRequests: number;     // 半开状态允许的请求数
}

enum CircuitState {
  CLOSED = 'closed',     // 正常状态，允许请求
  OPEN = 'open',         // 熔断状态，拒绝请求
  HALF_OPEN = 'half-open', // 半开状态，允许少量请求
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // 检查熔断器状态
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new CircuitOpenError('熔断器打开，请求被拒绝');
      }
    }

    try {
      const result = await operation();

      // 成功处理
      this.onSuccess();
      return result;

    } catch (error) {
      // 失败处理
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      // 连续成功达到阈值，关闭熔断器
      if (this.successCount >= this.config.halfOpenRequests) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    // 失败达到阈值，打开熔断器
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout;
  }
}`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">重试与回退机制</h2>
        <p className="text-gray-300 mb-4">
          重试和回退机制是 CLI 可靠性的关键组成部分。通过指数退避重试和智能模型回退，
          确保在网络波动、服务过载等情况下仍能完成任务。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HighlightBox title="最大重试" color="blue">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">5</div>
              <div className="text-sm text-gray-400">次尝试</div>
            </div>
          </HighlightBox>

          <HighlightBox title="初始延迟" color="green">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">5</div>
              <div className="text-sm text-gray-400">秒</div>
            </div>
          </HighlightBox>

          <HighlightBox title="最大延迟" color="yellow">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400">30</div>
              <div className="text-sm text-gray-400">秒</div>
            </div>
          </HighlightBox>

          <HighlightBox title="回退模型" color="purple">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">Flash</div>
              <div className="text-sm text-gray-400">gemini-1.5-flash</div>
            </div>
          </HighlightBox>
        </div>
      </section>

      {/* 重试流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">重试机制流程</h3>
        <MermaidDiagram chart={retryFlowChart} title="重试机制流程" />
      </section>

      {/* 重试配置 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">重试配置与延迟计算</h3>
        <CodeBlock code={retryConfigCode} language="typescript" title="指数退避配置" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">指数退避示意图</h4>
          <div className="relative h-32 mt-4">
            <div className="absolute bottom-0 left-0 w-full h-px bg-gray-600"></div>
            <div className="absolute bottom-0 left-0 h-full w-px bg-gray-600"></div>

            {/* 延迟柱状图 */}
            {[
              { attempt: 1, delay: 5, height: '17%' },
              { attempt: 2, delay: 10, height: '33%' },
              { attempt: 3, delay: 20, height: '67%' },
              { attempt: 4, delay: 30, height: '100%' },
              { attempt: 5, delay: 30, height: '100%' },
            ].map((item, i) => (
              <div
                key={i}
                className="absolute bottom-0 bg-cyan-500/70 rounded-t"
                style={{
                  left: `${15 + i * 18}%`,
                  width: '12%',
                  height: item.height,
                }}
              >
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-cyan-400">
                  {item.delay}s
                </span>
              </div>
            ))}

            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">
              尝试次数
            </span>
          </div>
        </div>
      </section>

      {/* 可重试错误 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">可重试错误判断</h3>
        <CodeBlock code={retryableErrorsCode} language="typescript" title="错误分类" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <HighlightBox title="可重试错误" color="green">
            <ul className="text-sm space-y-1">
              <li><code className="text-green-400">429</code> - 速率限制</li>
              <li><code className="text-green-400">500</code> - 服务器内部错误</li>
              <li><code className="text-green-400">502</code> - 网关错误</li>
              <li><code className="text-green-400">503</code> - 服务不可用</li>
              <li><code className="text-green-400">504</code> - 网关超时</li>
              <li><code className="text-green-400">ECONNRESET</code> - 连接重置</li>
              <li><code className="text-green-400">ETIMEDOUT</code> - 连接超时</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="不可重试错误" color="red">
            <ul className="text-sm space-y-1">
              <li><code className="text-red-400">401</code> - 未授权</li>
              <li><code className="text-red-400">403</code> - 禁止访问</li>
              <li><code className="text-red-400">404</code> - 资源不存在</li>
              <li><code className="text-red-400">INVALID_API_KEY</code> - 密钥无效</li>
              <li><code className="text-red-400">INVALID_REQUEST</code> - 请求格式错误</li>
              <li><code className="text-red-400">CONTENT_FILTERED</code> - 内容被过滤</li>
            </ul>
          </HighlightBox>
        </div>
      </section>

      {/* 重试实现 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">重试执行器实现</h3>
        <CodeBlock code={retryImplementationCode} language="typescript" title="withRetry 函数" />
      </section>

      {/* 回退流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">模型回退机制</h3>
        <MermaidDiagram chart={fallbackFlowChart} title="模型回退流程" />

        <div className="mt-4">
          <CodeBlock code={fallbackConfigCode} language="typescript" title="回退配置" />
        </div>
      </section>

      {/* 回退处理器 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">回退处理器实现</h3>
        <CodeBlock code={fallbackHandlerCode} language="typescript" title="FallbackHandler" />

        <HighlightBox title="回退触发条件" color="yellow" className="mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">MODEL_OVERLOADED</h5>
              <p className="text-gray-400">主模型过载，切换到更稳定的模型</p>
            </div>
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">CONTEXT_LENGTH_EXCEEDED</h5>
              <p className="text-gray-400">上下文超长，切换到更大窗口的模型</p>
            </div>
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">RATE_LIMIT_EXCEEDED</h5>
              <p className="text-gray-400">速率限制，切换到配额更高的模型</p>
            </div>
            <div>
              <h5 className="font-semibold text-yellow-300 mb-1">TIMEOUT</h5>
              <p className="text-gray-400">请求超时，切换到更快的模型</p>
            </div>
          </div>
        </HighlightBox>
      </section>

      {/* 熔断器 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">熔断器模式</h3>
        <CodeBlock code={circuitBreakerCode} language="typescript" title="CircuitBreaker" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">熔断器状态转换</h4>
          <pre className="text-sm text-gray-300">
{`┌─────────────────────────────────────────────────────────────┐
│                     熔断器状态机                             │
│                                                             │
│    ┌──────────┐   失败次数>=5   ┌──────────┐                │
│    │  CLOSED  │ ─────────────► │   OPEN   │                │
│    │ (正常)   │                │ (熔断)   │                │
│    └────┬─────┘                └────┬─────┘                │
│         │                          │                        │
│         │                          │ 60秒后                 │
│    请求成功                         │                        │
│         │                          ▼                        │
│         │                   ┌───────────┐                   │
│         │                   │ HALF-OPEN │                   │
│         │                   │ (半开)    │                   │
│         │                   └─────┬─────┘                   │
│         │                         │                         │
│         │         ┌───────────────┼───────────────┐         │
│         │         │               │               │         │
│         │    连续成功>=3      失败一次              │         │
│         │         │               │               │         │
│         ▼         ▼               ▼               │         │
│    ┌──────────┐          ┌──────────┐            │         │
│    │  CLOSED  │◄─────────│   OPEN   │◄───────────┘         │
│    └──────────┘          └──────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* 整体架构 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">重试回退整体架构</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────────┐
│                         API Client                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Request Handler                         │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                      │
│           ┌───────────────┼───────────────┐                      │
│           │               │               │                      │
│           ▼               ▼               ▼                      │
│  ┌────────────────┐ ┌──────────────┐ ┌────────────────┐         │
│  │ Circuit Breaker│ │    Retry     │ │    Fallback    │         │
│  │                │ │   Handler    │ │    Handler     │         │
│  │  状态: CLOSED  │ │              │ │                │         │
│  │  失败: 0/5     │ │  尝试: 1/5   │ │  主模型 ─┐    │         │
│  └───────┬────────┘ │  延迟: 5s    │ │          │    │         │
│          │          └──────┬───────┘ │          ▼    │         │
│          │                 │         │  回退模型     │         │
│          │                 │         └───────────────┘         │
│          │                 │                                    │
│          └─────────────────┴────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Error Classifier                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │  │
│  │  │ Retryable   │  │ Fallback    │  │ Fatal       │        │  │
│  │  │ 429, 500    │  │ Overload    │  │ 401, 403    │        │  │
│  │  │ 502, 503    │  │ Timeout     │  │ Invalid     │        │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      AI Model Service                            │
│                                                                  │
│  ┌─────────────────┐      ┌─────────────────┐                    │
│  │   Primary Model │      │  Fallback Model │                    │
│  │  gemini-2.0-exp │      │ gemini-1.5-flash│                    │
│  │                 │ ───► │                 │                    │
│  │  Fast, Latest   │      │ Stable, Reliable│                    │
│  └─────────────────┘      └─────────────────┘                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">最佳实践</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">推荐做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 始终使用指数退避，避免雪崩效应</li>
              <li>✓ 添加随机抖动，分散重试请求</li>
              <li>✓ 设置合理的最大重试次数</li>
              <li>✓ 记录重试和回退事件用于监控</li>
              <li>✓ 为不同操作配置不同的重试策略</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">避免做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✗ 立即重试，无延迟</li>
              <li>✗ 固定间隔重试</li>
              <li>✗ 无限重试</li>
              <li>✗ 对不可重试错误进行重试</li>
              <li>✗ 忽略熔断器状态</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
