import { HighlightBox } from '../components/HighlightBox';
import { FlowDiagram } from '../components/FlowDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function TelemetrySystem() {
  const telemetryFlow = {
    title: '遥测数据流',
    nodes: [
      { id: 'start', label: '事件发生', type: 'start' as const },
      { id: 'collect', label: '收集事件数据', type: 'process' as const },
      { id: 'enrich', label: '丰富上下文\n添加元数据', type: 'process' as const },
      { id: 'check_consent', label: '用户同意?', type: 'decision' as const },
      { id: 'buffer', label: '缓冲事件', type: 'process' as const },
      { id: 'batch_ready', label: '批次就绪?', type: 'decision' as const },
      { id: 'send', label: '发送到后端\nOpenTelemetry', type: 'process' as const },
      { id: 'drop', label: '丢弃数据', type: 'end' as const },
      { id: 'stored', label: '存储/分析', type: 'end' as const },
    ],
    edges: [
      { from: 'start', to: 'collect' },
      { from: 'collect', to: 'enrich' },
      { from: 'enrich', to: 'check_consent' },
      { from: 'check_consent', to: 'buffer', label: 'Yes' },
      { from: 'check_consent', to: 'drop', label: 'No' },
      { from: 'buffer', to: 'batch_ready' },
      { from: 'batch_ready', to: 'send', label: 'Yes' },
      { from: 'batch_ready', to: 'buffer', label: 'No' },
      { from: 'send', to: 'stored' },
    ],
  };

  const telemetryConfigCode = `// 遥测配置
// packages/core/src/telemetry/config.ts

interface TelemetryConfig {
  // 基本配置
  enabled: boolean;              // 是否启用遥测
  endpoint: string;              // 遥测后端地址
  serviceName: string;           // 服务名称

  // 采样配置
  sampleRate: number;            // 采样率 (0-1)
  tracesSampleRate: number;      // 追踪采样率
  profilesSampleRate: number;    // 性能分析采样率

  // 批处理配置
  batchSize: number;             // 批次大小
  flushInterval: number;         // 刷新间隔 (ms)
  maxQueueSize: number;          // 最大队列大小

  // 隐私配置
  anonymizeUserId: boolean;      // 匿名化用户 ID
  excludePersonalData: boolean;  // 排除个人数据
  excludeContentData: boolean;   // 排除内容数据
}

// 默认配置
const DEFAULT_TELEMETRY_CONFIG: TelemetryConfig = {
  enabled: true,
  endpoint: 'https://telemetry.innies.dev',
  serviceName: 'innies-cli',

  sampleRate: 1.0,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.01,

  batchSize: 100,
  flushInterval: 30000,  // 30 秒
  maxQueueSize: 1000,

  anonymizeUserId: true,
  excludePersonalData: true,
  excludeContentData: true,
};`;

  const eventTypesCode = `// 遥测事件类型
// packages/core/src/telemetry/events.ts

// 事件类别
enum TelemetryEventCategory {
  SESSION = 'session',       // 会话事件
  AI = 'ai',                 // AI 交互
  TOOL = 'tool',             // 工具执行
  ERROR = 'error',           // 错误事件
  PERFORMANCE = 'perf',      // 性能指标
  USER = 'user',             // 用户行为
}

// 会话事件
interface SessionEvents {
  'session.start': {
    sessionId: string;
    cliVersion: string;
    platform: string;
    nodeVersion: string;
  };
  'session.end': {
    sessionId: string;
    duration: number;
    turnCount: number;
    exitCode: number;
  };
  'session.resume': {
    sessionId: string;
    previousDuration: number;
  };
}

// AI 交互事件
interface AIEvents {
  'ai.request': {
    model: string;
    promptTokens: number;
    maxTokens: number;
  };
  'ai.response': {
    model: string;
    responseTokens: number;
    latency: number;
    finishReason: string;
  };
  'ai.tool_call': {
    toolName: string;
    model: string;
  };
  'ai.fallback': {
    fromModel: string;
    toModel: string;
    reason: string;
  };
}

// 工具事件
interface ToolEvents {
  'tool.execute': {
    toolName: string;
    duration: number;
    success: boolean;
    exitCode?: number;
  };
  'tool.permission': {
    toolName: string;
    action: 'granted' | 'denied' | 'auto';
  };
  'tool.timeout': {
    toolName: string;
    timeoutMs: number;
  };
}

// 错误事件
interface ErrorEvents {
  'error.api': {
    statusCode: number;
    errorCode: string;
    retryCount: number;
  };
  'error.tool': {
    toolName: string;
    errorType: string;
  };
  'error.unhandled': {
    errorType: string;
    stack?: string;
  };
}

// 性能事件
interface PerformanceEvents {
  'perf.startup': {
    totalTime: number;
    configLoadTime: number;
    authCheckTime: number;
    mcpInitTime: number;
  };
  'perf.memory': {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  'perf.context_window': {
    tokensUsed: number;
    contextLimit: number;
    summarizationTriggered: boolean;
  };
}`;

  const openTelemetryCode = `// OpenTelemetry 集成
// packages/core/src/telemetry/opentelemetry.ts

import {
  trace,
  metrics,
  SpanStatusCode,
  context,
} from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

// 初始化 OpenTelemetry SDK
export function initTelemetry(config: TelemetryConfig): void {
  const sdk = new NodeSDK({
    serviceName: config.serviceName,
    traceExporter: new OTLPTraceExporter({
      url: \`\${config.endpoint}/v1/traces\`,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: \`\${config.endpoint}/v1/metrics\`,
      }),
      exportIntervalMillis: config.flushInterval,
    }),
    sampler: new TraceIdRatioBasedSampler(config.tracesSampleRate),
  });

  sdk.start();

  // 优雅关闭
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Telemetry shutdown complete'))
      .catch(console.error);
  });
}

// 追踪器
const tracer = trace.getTracer('innies-cli');

// 创建 Span
export function createSpan(name: string) {
  return tracer.startSpan(name);
}

// 使用示例
async function executeToolWithTracing(tool: Tool, args: any) {
  const span = tracer.startSpan(\`tool.\${tool.name}\`);

  try {
    span.setAttributes({
      'tool.name': tool.name,
      'tool.args_size': JSON.stringify(args).length,
    });

    const result = await tool.execute(args);

    span.setStatus({ code: SpanStatusCode.OK });
    return result;

  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (error as Error).message,
    });
    span.recordException(error as Error);
    throw error;

  } finally {
    span.end();
  }
}`;

  const metricsCode = `// 指标收集
// packages/core/src/telemetry/metrics.ts

import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('innies-cli');

// 计数器
const requestCounter = meter.createCounter('ai_requests_total', {
  description: 'Total number of AI requests',
});

const toolExecutionCounter = meter.createCounter('tool_executions_total', {
  description: 'Total number of tool executions',
});

const errorCounter = meter.createCounter('errors_total', {
  description: 'Total number of errors',
});

// 直方图 (延迟分布)
const aiLatencyHistogram = meter.createHistogram('ai_request_latency_ms', {
  description: 'AI request latency in milliseconds',
  unit: 'ms',
});

const toolLatencyHistogram = meter.createHistogram('tool_execution_latency_ms', {
  description: 'Tool execution latency in milliseconds',
  unit: 'ms',
});

// 仪表 (当前值)
const activeSessionsGauge = meter.createObservableGauge('active_sessions', {
  description: 'Number of active sessions',
});

const contextTokensGauge = meter.createObservableGauge('context_tokens', {
  description: 'Current context window token usage',
});

// 记录指标
export function recordAIRequest(model: string, latency: number): void {
  requestCounter.add(1, { model });
  aiLatencyHistogram.record(latency, { model });
}

export function recordToolExecution(
  toolName: string,
  latency: number,
  success: boolean
): void {
  toolExecutionCounter.add(1, { tool: toolName, success: String(success) });
  toolLatencyHistogram.record(latency, { tool: toolName });
}

export function recordError(errorType: string, category: string): void {
  errorCounter.add(1, { type: errorType, category });
}`;

  const privacyCode = `// 隐私保护
// packages/core/src/telemetry/privacy.ts

// 隐私敏感字段
const SENSITIVE_FIELDS = [
  'api_key',
  'token',
  'password',
  'secret',
  'credential',
  'authorization',
  'email',
  'phone',
  'address',
];

// 数据清洗器
export class TelemetrySanitizer {
  private config: TelemetryConfig;

  // 清洗事件数据
  sanitize(event: TelemetryEvent): TelemetryEvent {
    const sanitized = { ...event };

    // 匿名化用户 ID
    if (this.config.anonymizeUserId && sanitized.userId) {
      sanitized.userId = this.hashUserId(sanitized.userId);
    }

    // 移除敏感字段
    if (this.config.excludePersonalData) {
      sanitized.data = this.removeSensitiveFields(sanitized.data);
    }

    // 移除内容数据
    if (this.config.excludeContentData) {
      sanitized.data = this.removeContentFields(sanitized.data);
    }

    return sanitized;
  }

  // 哈希用户 ID
  private hashUserId(userId: string): string {
    return crypto
      .createHash('sha256')
      .update(userId + 'innies-salt')
      .digest('hex')
      .substring(0, 16);
  }

  // 移除敏感字段
  private removeSensitiveFields(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const cleaned: any = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // 跳过敏感字段
      if (SENSITIVE_FIELDS.some(f => lowerKey.includes(f))) {
        cleaned[key] = '[REDACTED]';
        continue;
      }

      // 递归处理嵌套对象
      cleaned[key] = this.removeSensitiveFields(value);
    }

    return cleaned;
  }

  // 移除内容字段 (prompt, response 等)
  private removeContentFields(data: any): any {
    const contentFields = ['prompt', 'content', 'message', 'response', 'text'];

    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const cleaned: any = { ...data };

    for (const field of contentFields) {
      if (field in cleaned) {
        // 保留长度信息但移除实际内容
        cleaned[field] = {
          length: String(cleaned[field]).length,
          redacted: true,
        };
      }
    }

    return cleaned;
  }
}

// 用户同意管理
export class ConsentManager {
  private consentGiven: boolean | null = null;

  async checkConsent(): Promise<boolean> {
    if (this.consentGiven !== null) {
      return this.consentGiven;
    }

    // 从配置读取
    const config = await loadConfig();

    // 环境变量覆盖
    if (process.env.INNIES_TELEMETRY === 'false') {
      this.consentGiven = false;
      return false;
    }

    this.consentGiven = config.telemetry?.enabled ?? true;
    return this.consentGiven;
  }

  async setConsent(consent: boolean): Promise<void> {
    this.consentGiven = consent;
    await saveConfig({ telemetry: { enabled: consent } });
  }
}`;

  const telemetryServiceCode = `// 遥测服务
// packages/core/src/telemetry/service.ts

export class TelemetryService {
  private config: TelemetryConfig;
  private sanitizer: TelemetrySanitizer;
  private consentManager: ConsentManager;
  private eventBuffer: TelemetryEvent[] = [];
  private flushTimer: NodeJS.Timer | null = null;

  constructor(config: TelemetryConfig) {
    this.config = config;
    this.sanitizer = new TelemetrySanitizer(config);
    this.consentManager = new ConsentManager();

    // 初始化 OpenTelemetry
    if (config.enabled) {
      initTelemetry(config);
    }

    // 设置定时刷新
    this.startFlushTimer();
  }

  // 记录事件
  async record(event: TelemetryEvent): Promise<void> {
    // 检查用户同意
    if (!(await this.consentManager.checkConsent())) {
      return;
    }

    // 采样
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    // 清洗数据
    const sanitized = this.sanitizer.sanitize(event);

    // 添加到缓冲区
    this.eventBuffer.push(sanitized);

    // 检查是否需要立即刷新
    if (this.eventBuffer.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  // 刷新缓冲区
  async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      await this.sendEvents(events);
    } catch (error) {
      // 发送失败，将事件放回缓冲区
      this.eventBuffer.unshift(...events);

      // 限制队列大小
      if (this.eventBuffer.length > this.config.maxQueueSize) {
        this.eventBuffer = this.eventBuffer.slice(-this.config.maxQueueSize);
      }
    }
  }

  // 便捷方法
  recordSessionStart(): void {
    this.record({
      category: 'session',
      event: 'session.start',
      data: {
        sessionId: getSessionId(),
        cliVersion: getVersion(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    });
  }

  recordAIRequest(model: string, tokens: number): void {
    this.record({
      category: 'ai',
      event: 'ai.request',
      data: { model, promptTokens: tokens },
    });
  }

  recordToolExecution(toolName: string, duration: number, success: boolean): void {
    this.record({
      category: 'tool',
      event: 'tool.execute',
      data: { toolName, duration, success },
    });
    recordToolExecution(toolName, duration, success);  // 也记录指标
  }

  recordError(error: Error, context?: any): void {
    this.record({
      category: 'error',
      event: 'error.unhandled',
      data: {
        errorType: error.name,
        message: error.message,
        stack: error.stack,
        context,
      },
    });
    recordError(error.name, 'unhandled');  // 也记录指标
  }
}`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">遥测系统</h2>
        <p className="text-gray-300 mb-4">
          遥测系统用于收集匿名化的使用数据和性能指标，帮助改进 CLI 的质量和用户体验。
          基于 OpenTelemetry 标准，支持追踪、指标和日志的统一收集。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HighlightBox title="事件追踪" color="blue">
            <p className="text-sm">会话、请求、工具执行</p>
            <code className="text-xs text-blue-400">Traces</code>
          </HighlightBox>

          <HighlightBox title="性能指标" color="green">
            <p className="text-sm">延迟、吞吐量、资源使用</p>
            <code className="text-xs text-green-400">Metrics</code>
          </HighlightBox>

          <HighlightBox title="错误报告" color="red">
            <p className="text-sm">异常、失败、超时</p>
            <code className="text-xs text-red-400">Errors</code>
          </HighlightBox>

          <HighlightBox title="隐私保护" color="purple">
            <p className="text-sm">匿名化、数据清洗</p>
            <code className="text-xs text-purple-400">Privacy</code>
          </HighlightBox>
        </div>
      </section>

      {/* 数据流 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">遥测数据流</h3>
        <FlowDiagram {...telemetryFlow} />
      </section>

      {/* 配置 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">遥测配置</h3>
        <CodeBlock code={telemetryConfigCode} language="typescript" title="配置选项" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-400 mb-2">禁用遥测</h4>
          <div className="text-sm text-gray-300 space-y-2">
            <p>通过环境变量禁用:</p>
            <code className="bg-gray-900 px-2 py-1 rounded">export INNIES_TELEMETRY=false</code>
            <p className="mt-2">通过配置文件禁用 (~/.innies/settings.json):</p>
            <code className="bg-gray-900 px-2 py-1 rounded block mt-1">
              {`{ "telemetry": { "enabled": false } }`}
            </code>
          </div>
        </div>
      </section>

      {/* 事件类型 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">事件类型</h3>
        <CodeBlock code={eventTypesCode} language="typescript" title="事件定义" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-400 mb-2">收集的事件</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 会话开始/结束</li>
              <li>• AI 请求和响应</li>
              <li>• 工具执行统计</li>
              <li>• 错误和异常</li>
              <li>• 性能指标</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-400 mb-2">不收集的数据</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 用户提示词内容</li>
              <li>• AI 响应内容</li>
              <li>• 文件内容</li>
              <li>• 个人身份信息</li>
              <li>• API 密钥和凭证</li>
            </ul>
          </div>
        </div>
      </section>

      {/* OpenTelemetry */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">OpenTelemetry 集成</h3>
        <CodeBlock code={openTelemetryCode} language="typescript" title="追踪实现" />
      </section>

      {/* 指标 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">指标收集</h3>
        <CodeBlock code={metricsCode} language="typescript" title="Metrics" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">关键指标</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left p-2">指标名</th>
                <th className="text-left p-2">类型</th>
                <th className="text-left p-2">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>ai_requests_total</code></td>
                <td className="p-2">Counter</td>
                <td className="p-2">AI 请求总数</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>ai_request_latency_ms</code></td>
                <td className="p-2">Histogram</td>
                <td className="p-2">AI 请求延迟分布</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>tool_executions_total</code></td>
                <td className="p-2">Counter</td>
                <td className="p-2">工具执行总数</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>errors_total</code></td>
                <td className="p-2">Counter</td>
                <td className="p-2">错误总数</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>context_tokens</code></td>
                <td className="p-2">Gauge</td>
                <td className="p-2">当前上下文 Token 数</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 隐私保护 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">隐私保护</h3>
        <CodeBlock code={privacyCode} language="typescript" title="数据清洗" />

        <HighlightBox title="隐私保护措施" color="green" className="mt-4">
          <ul className="text-sm space-y-1">
            <li>• <strong>用户 ID 哈希</strong>: 使用 SHA-256 单向哈希</li>
            <li>• <strong>敏感字段过滤</strong>: 自动检测并移除密钥、密码等</li>
            <li>• <strong>内容脱敏</strong>: 只保留长度信息，移除实际内容</li>
            <li>• <strong>用户同意</strong>: 尊重用户的禁用选择</li>
            <li>• <strong>本地采样</strong>: 在客户端进行采样，减少数据量</li>
          </ul>
        </HighlightBox>
      </section>

      {/* 遥测服务 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">遥测服务</h3>
        <CodeBlock code={telemetryServiceCode} language="typescript" title="TelemetryService" />
      </section>

      {/* 架构图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">遥测系统架构</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────────┐
│                         Innies CLI                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Event Sources                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │
│  │  │ Session  │  │    AI    │  │  Tools   │  │  Errors  │    │ │
│  │  │  Events  │  │  Events  │  │  Events  │  │  Events  │    │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │ │
│  │       └─────────────┴─────────────┴─────────────┘           │ │
│  │                              │                              │ │
│  └──────────────────────────────┼──────────────────────────────┘ │
│                                 │                                │
│  ┌──────────────────────────────▼──────────────────────────────┐ │
│  │                   Telemetry Service                         │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │ │
│  │  │    Consent    │  │   Sanitizer   │  │    Sampler    │   │ │
│  │  │    Manager    │  │               │  │               │   │ │
│  │  │               │  │  Remove PII   │  │  Rate: 1.0    │   │ │
│  │  │  Check: ✓     │  │  Hash UserID  │  │  Traces: 0.1  │   │ │
│  │  └───────────────┘  └───────────────┘  └───────────────┘   │ │
│  │                                                             │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │                    Event Buffer                        │ │ │
│  │  │  [event1] [event2] [event3] ... [eventN]              │ │ │
│  │  │           Batch Size: 100 | Flush: 30s                │ │ │
│  │  └───────────────────────┬────────────────────────────────┘ │ │
│  │                          │                                  │ │
│  └──────────────────────────┼──────────────────────────────────┘ │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                     OpenTelemetry SDK                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ Trace Exporter │  │ Metric Exporter│  │  Log Exporter  │     │
│  │     OTLP       │  │     OTLP       │  │     OTLP       │     │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘     │
│          └───────────────────┼───────────────────┘               │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Telemetry Backend                             │
│             https://telemetry.innies.dev                         │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Collector  │  │  Processor  │  │   Storage   │              │
│  │    OTLP     │→ │  Aggregate  │→ │   Analyze   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
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
            <h4 className="text-green-400 font-semibold mb-2">遥测设计原则</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 始终获得用户同意</li>
              <li>✓ 最小化收集原则</li>
              <li>✓ 默认匿名化</li>
              <li>✓ 提供禁用选项</li>
              <li>✓ 透明的数据使用说明</li>
            </ul>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">实现建议</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>→ 使用批量发送减少网络开销</li>
              <li>→ 本地采样减少数据量</li>
              <li>→ 优雅降级，不影响主功能</li>
              <li>→ 异步发送，不阻塞主流程</li>
              <li>→ 定期清理本地缓存</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
