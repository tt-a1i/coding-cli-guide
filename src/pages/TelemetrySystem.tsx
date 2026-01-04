import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages } from '../components/RelatedPages';

export function TelemetrySystem() {
  // 30秒速览
  const quickSummary = `🎯 核心要点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 双通道架构    OpenTelemetry (OTLP) + GeminiLogger (RUM)
⏱️ 刷新间隔      OTLP: 10秒  |  RUM: 60秒
📦 事件缓冲      最大 1000 事件，超出时 FIFO 淘汰
🔄 重试机制      最多 3 次，指数退避，最多保留 100 条失败事件
📈 指标类型      Counter (计数) / Histogram (分布) / Gauge (当前值)
🎭 事件分类      session / ai / tool / error / extension / misc
🔐 隐私保护      用户ID哈希 + 敏感字段过滤 + 内容脱敏`;

  // 双通道架构图
  const dualChannelArchChart = `flowchart TB
    subgraph sources["事件源"]
        session["会话事件"]
        api["API事件"]
        tool["工具事件"]
        error["错误事件"]
        ext["扩展事件"]
    end

    subgraph telemetry["遥测服务层"]
        direction TB
        loggers["loggers.ts"]

        subgraph otel["OpenTelemetry 通道"]
            sdk["NodeSDK"]
            span["BatchSpanProcessor"]
            log["BatchLogRecordProcessor"]
            metric["PeriodicExportingMetricReader"]
        end

        subgraph rum["GeminiLogger 通道"]
            queue["FixedDeque&lt;RumEvent&gt;"]
            flush["flushToRum()"]
            retry["retryWithBackoff"]
        end
    end

    subgraph backends["后端"]
        otlp["OTLP Endpoint<br/>gRPC / HTTP"]
        aliyun["Aliyun RUM<br/>gb4w8c3ygj-default-sea.rum.aliyuncs.com"]
        file["File Exporter<br/>本地文件"]
        console["Console Exporter<br/>调试输出"]
    end

    sources --> loggers
    loggers --> otel
    loggers --> rum

    otel --> otlp
    otel --> file
    otel --> console

    rum --> aliyun

    style sources fill:#3b82f6,color:#fff
    style otel fill:#22c55e,color:#fff
    style rum fill:#f59e0b,color:#000
    style backends fill:#8b5cf6,color:#fff`;

  // SDK 初始化流程图
  const sdkInitChart = `flowchart TD
    start([initializeTelemetry])
    check_init{已初始化?}
    check_enabled{遥测启用?}
    create_resource[创建 Resource<br/>SERVICE_NAME + session.id]

    check_endpoint{有 OTLP Endpoint?}
    check_outfile{有输出文件?}

    use_otlp[配置 OTLP Exporters<br/>gRPC / HTTP]
    use_file[配置 File Exporters]
    use_console[配置 Console Exporters]

    create_sdk[创建 NodeSDK<br/>spanProcessors<br/>logRecordProcessors<br/>metricReader]

    start_sdk[sdk.start]
    init_metrics[initializeMetrics]
    register_handlers[注册进程退出处理器<br/>SIGTERM / SIGINT / exit]

    done([初始化完成])
    skip([跳过])

    start --> check_init
    check_init -->|是| skip
    check_init -->|否| check_enabled
    check_enabled -->|否| skip
    check_enabled -->|是| create_resource
    create_resource --> check_endpoint

    check_endpoint -->|是| use_otlp
    check_endpoint -->|否| check_outfile
    check_outfile -->|是| use_file
    check_outfile -->|否| use_console

    use_otlp --> create_sdk
    use_file --> create_sdk
    use_console --> create_sdk

    create_sdk --> start_sdk
    start_sdk --> init_metrics
    init_metrics --> register_handlers
    register_handlers --> done

    style start fill:#22d3ee,color:#000
    style done fill:#22c55e,color:#fff
    style skip fill:#6b7280,color:#fff`;

  // 指标定义代码
  const metricsDefinitionCode = `// packages/core/src/telemetry/metrics.ts
// 服务名称前缀
const SERVICE_NAME = 'gemini-code';

// ═══════════════════════════════════════════════════════════════
// Counter 指标定义 (累计计数)
// ═══════════════════════════════════════════════════════════════

const COUNTER_DEFINITIONS = {
  // 工具调用计数
  [\`\${SERVICE_NAME}.tool.call.count\`]: {
    description: 'Counts tool calls, tagged by function name and success.',
    attributes: {
      function_name: string;     // 工具名称
      success: boolean;          // 是否成功
      decision?: 'accept' | 'reject' | 'modify' | 'auto_accept';
      tool_type?: 'native' | 'mcp';
    },
  },

  // API 请求计数
  [\`\${SERVICE_NAME}.api.request.count\`]: {
    description: 'Counts API requests, tagged by model and status.',
    attributes: {
      model: string;
      status_code?: number | string;
      error_type?: string;
    },
  },

  // Token 使用计数
  [\`\${SERVICE_NAME}.token.usage\`]: {
    description: 'Counts the total number of tokens used.',
    attributes: {
      model: string;
      type: 'input' | 'output' | 'thought' | 'cache' | 'tool';
    },
  },

  // 会话计数、文件操作计数、重试计数等...
  [\`\${SERVICE_NAME}.session.count\`]: { /* ... */ },
  [\`\${SERVICE_NAME}.file.operation.count\`]: { /* ... */ },
  [\`\${SERVICE_NAME}.chat.invalid_chunk.count\`]: { /* ... */ },
  [\`\${SERVICE_NAME}.chat.content_retry.count\`]: { /* ... */ },
  [\`\${SERVICE_NAME}.chat.content_retry_failure.count\`]: { /* ... */ },
  [\`\${SERVICE_NAME}.slash_command.model.call_count\`]: { /* ... */ },
  [\`\${SERVICE_NAME}.chat_compression\`]: { /* ... */ },
  [\`\${SERVICE_NAME}.subagent.execution.count\`]: { /* ... */ },
};

// ═══════════════════════════════════════════════════════════════
// Histogram 指标定义 (延迟分布)
// ═══════════════════════════════════════════════════════════════

const HISTOGRAM_DEFINITIONS = {
  // 工具调用延迟
  [\`\${SERVICE_NAME}.tool.call.latency\`]: {
    description: 'Latency of tool calls in milliseconds.',
    unit: 'ms',
    attributes: { function_name: string },
  },

  // API 请求延迟
  [\`\${SERVICE_NAME}.api.request.latency\`]: {
    description: 'Latency of API requests in milliseconds.',
    unit: 'ms',
    attributes: { model: string },
  },
};`;

  // 性能监控指标代码
  const performanceMetricsCode = `// packages/core/src/telemetry/metrics.ts
// 性能监控指标 (需要 telemetry 启用时自动激活)

const PERFORMANCE_HISTOGRAM_DEFINITIONS = {
  // 启动时间
  [\`\${SERVICE_NAME}.startup.duration\`]: {
    description: 'CLI startup time in milliseconds, broken down by initialization phase.',
    unit: 'ms',
    attributes: {
      phase: string;  // 'config_load' | 'auth_check' | 'mcp_init' | ...
      details?: Record<string, string | number | boolean>;
    },
  },

  // 内存使用
  [\`\${SERVICE_NAME}.memory.usage\`]: {
    description: 'Memory usage in bytes.',
    unit: 'bytes',
    attributes: {
      memory_type: MemoryMetricType;  // HEAP_USED | HEAP_TOTAL | EXTERNAL | RSS
      component?: string;
    },
  },

  // CPU 使用
  [\`\${SERVICE_NAME}.cpu.usage\`]: {
    description: 'CPU usage percentage.',
    unit: 'percent',
    attributes: { component?: string },
  },

  // 工具队列深度
  [\`\${SERVICE_NAME}.tool.queue.depth\`]: {
    description: 'Number of tools in execution queue.',
    unit: 'count',
  },

  // 工具执行分解
  [\`\${SERVICE_NAME}.tool.execution.breakdown\`]: {
    description: 'Tool execution time breakdown by phase.',
    unit: 'ms',
    attributes: {
      function_name: string;
      phase: ToolExecutionPhase;  // VALIDATION | PREPARATION | EXECUTION | RESULT_PROCESSING
    },
  },

  // Token 效率
  [\`\${SERVICE_NAME}.token.efficiency\`]: {
    description: 'Token efficiency metrics (tokens per operation, cache hit rate).',
    unit: 'ratio',
    attributes: {
      model: string;
      metric: string;
      context?: string;
    },
  },

  // API 请求分解
  [\`\${SERVICE_NAME}.api.request.breakdown\`]: {
    description: 'API request time breakdown by phase.',
    unit: 'ms',
    attributes: {
      model: string;
      phase: ApiRequestPhase;  // REQUEST_PREPARATION | NETWORK_LATENCY | RESPONSE_PROCESSING | TOKEN_PROCESSING
    },
  },

  // 性能回归检测
  [\`\${SERVICE_NAME}.performance.regression\`]: {
    description: 'Performance regression detection events.',
    attributes: {
      metric: string;
      severity: 'low' | 'medium' | 'high';
      current_value: number;
      baseline_value: number;
    },
  },
};

// 枚举定义
enum MemoryMetricType {
  HEAP_USED = 'heap_used',
  HEAP_TOTAL = 'heap_total',
  EXTERNAL = 'external',
  RSS = 'rss',
}

enum ToolExecutionPhase {
  VALIDATION = 'validation',
  PREPARATION = 'preparation',
  EXECUTION = 'execution',
  RESULT_PROCESSING = 'result_processing',
}

enum ApiRequestPhase {
  REQUEST_PREPARATION = 'request_preparation',
  NETWORK_LATENCY = 'network_latency',
  RESPONSE_PROCESSING = 'response_processing',
  TOKEN_PROCESSING = 'token_processing',
}`;

  // 事件类型定义
  const eventTypesCode = `// packages/core/src/telemetry/types.ts
// 遥测事件类型定义

// 基础事件接口
export interface BaseTelemetryEvent {
  'event.name': string;
  'event.timestamp': string;  // ISO 8601 格式
}

// ═══════════════════════════════════════════════════════════════
// 会话事件
// ═══════════════════════════════════════════════════════════════

export class StartSessionEvent implements BaseTelemetryEvent {
  'event.name': 'cli_config';
  model: string;                              // 使用的模型
  embedding_model: string;                    // 嵌入模型
  sandbox_enabled: boolean;                   // 沙箱状态
  core_tools_enabled: string;                 // 启用的核心工具
  approval_mode: string;                      // 审批模式
  mcp_servers: string;                        // MCP 服务器列表
  mcp_servers_count: number;                  // MCP 服务器数量
  mcp_tools_count?: number;                   // MCP 工具数量
  output_format: OutputFormat;                // 输出格式
  // ... 更多配置字段
}

export class EndSessionEvent implements BaseTelemetryEvent {
  'event.name': 'end_session';
  session_id?: string;
}

// ═══════════════════════════════════════════════════════════════
// API 事件
// ═══════════════════════════════════════════════════════════════

export class ApiResponseEvent implements BaseTelemetryEvent {
  'event.name': 'api_response';
  response_id: string;
  model: string;
  duration_ms: number;
  status_code?: number | string;

  // Token 统计 (关键!)
  input_token_count: number;           // 输入 token
  output_token_count: number;          // 输出 token
  cached_content_token_count: number;  // 缓存 token
  thoughts_token_count: number;        // 思考 token (thinking models)
  tool_token_count: number;            // 工具 token
  total_token_count: number;           // 总计

  prompt_id: string;
  auth_type?: string;
}

export class ApiErrorEvent implements BaseTelemetryEvent {
  'event.name': 'api_error';
  model: string;
  error: string;
  error_type?: string;
  status_code?: number | string;
  duration_ms: number;
  prompt_id: string;
}

// ═══════════════════════════════════════════════════════════════
// 工具事件
// ═══════════════════════════════════════════════════════════════

export class ToolCallEvent implements BaseTelemetryEvent {
  'event.name': 'tool_call';
  function_name: string;
  function_args: Record<string, unknown>;
  duration_ms: number;
  status: 'success' | 'error' | 'cancelled';
  success: boolean;
  decision?: ToolCallDecision;
  error?: string;
  error_type?: string;
  prompt_id: string;
  tool_type: 'native' | 'mcp';
  mcp_server_name?: string;

  // Diff 统计元数据
  metadata?: {
    model_added_lines: number;
    model_removed_lines: number;
    user_added_lines: number;
    user_removed_lines: number;
    // ...
  };
}

// ═══════════════════════════════════════════════════════════════
// 其他事件类型
// ═══════════════════════════════════════════════════════════════

export class ChatCompressionEvent { tokens_before: number; tokens_after: number; }
export class SubagentExecutionEvent { subagent_name: string; status: 'started' | 'completed' | 'failed' | 'cancelled'; }
export class LoopDetectedEvent { loop_type: LoopType; prompt_id: string; }
export class ExtensionInstallEvent { extension_name: string; extension_version: string; status: 'success' | 'error'; }
// ... 更多事件类型`;

  // GeminiLogger 实现代码
  const geminiLoggerCode = `// packages/core/src/telemetry/gemini-logger/gemini-logger.ts
// Gemini RUM 日志记录器

const USAGE_STATS_HOSTNAME = 'gb4w8c3ygj-default-sea.rum.aliyuncs.com';
const RUN_APP_ID = 'gb4w8c3ygj@851d5d500f08f92';

// ═══════════════════════════════════════════════════════════════
// 核心常量
// ═══════════════════════════════════════════════════════════════

const FLUSH_INTERVAL_MS = 1000 * 60;   // 60秒刷新间隔
const MAX_EVENTS = 1000;                // 最大事件数量
const MAX_RETRY_EVENTS = 100;           // 重试队列最大事件数

export class GeminiLogger {
  private static instance: GeminiLogger;

  // 事件队列 (固定大小双端队列)
  private readonly events: FixedDeque<RumEvent>;
  private lastFlushTime: number = Date.now();
  private isFlushInProgress: boolean = false;
  private pendingFlush: boolean = false;

  // ═══════════════════════════════════════════════════════════════
  // 事件入队 (FIFO 淘汰策略)
  // ═══════════════════════════════════════════════════════════════

  enqueueLogEvent(event: RumEvent): void {
    const wasAtCapacity = this.events.size >= MAX_EVENTS;

    if (wasAtCapacity) {
      this.events.shift();  // 淘汰最旧的事件
    }

    this.events.push(event);
  }

  // ═══════════════════════════════════════════════════════════════
  // 条件刷新
  // ═══════════════════════════════════════════════════════════════

  flushIfNeeded(): void {
    // 距离上次刷新不足 60 秒，跳过
    if (Date.now() - this.lastFlushTime < FLUSH_INTERVAL_MS) {
      return;
    }
    this.flushToRum();
  }

  // ═══════════════════════════════════════════════════════════════
  // 刷新到 RUM
  // ═══════════════════════════════════════════════════════════════

  async flushToRum(): Promise<LogResponse> {
    // 防止并发刷新
    if (this.isFlushInProgress) {
      this.pendingFlush = true;
      return {};
    }
    this.isFlushInProgress = true;

    const eventsToSend = this.events.toArray();
    this.events.clear();

    const rumPayload = await this.createRumPayload();
    rumPayload.events = eventsToSend;

    try {
      // 带重试的 HTTP POST
      await retryWithBackoff(
        () => this.sendToRum(rumPayload),
        {
          maxAttempts: 3,
          initialDelayMs: 200,
          shouldRetryOnError: (err) => {
            const status = (err as HttpError).status;
            // 仅重试 429 和 5xx 错误
            return status === 429 || (status >= 500 && status < 600);
          },
        }
      );
      this.lastFlushTime = Date.now();
    } catch (error) {
      // 失败时重新入队 (最多 MAX_RETRY_EVENTS 条)
      this.requeueFailedEvents(eventsToSend);
    } finally {
      this.isFlushInProgress = false;

      // 处理等待中的刷新请求
      if (this.pendingFlush) {
        this.pendingFlush = false;
        this.flushToRum();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 失败重试入队
  // ═══════════════════════════════════════════════════════════════

  private requeueFailedEvents(eventsToSend: RumEvent[]): void {
    // 只保留最近的 MAX_RETRY_EVENTS 条
    const eventsToRetry = eventsToSend.slice(-MAX_RETRY_EVENTS);

    // 计算可用空间
    const availableSpace = MAX_EVENTS - this.events.size;
    const numEventsToRequeue = Math.min(eventsToRetry.length, availableSpace);

    // 倒序插入到队列头部 (保持原始顺序)
    for (let i = numEventsToRequeue - 1; i >= 0; i--) {
      this.events.unshift(eventsToRetry[i]);
    }
  }
}`;

  // SDK 初始化代码
  const sdkInitCode = `// packages/core/src/telemetry/sdk.ts
// OpenTelemetry SDK 初始化

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

export function initializeTelemetry(config: Config): void {
  if (telemetryInitialized || !config.getTelemetryEnabled()) {
    return;
  }

  // 创建 Resource (服务元数据)
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'gemini-code',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.version,
    'session.id': config.getSessionId(),
  });

  // ═══════════════════════════════════════════════════════════════
  // 选择 Exporter (优先级: OTLP > File > Console)
  // ═══════════════════════════════════════════════════════════════

  const otlpEndpoint = config.getTelemetryOtlpEndpoint();
  const otlpProtocol = config.getTelemetryOtlpProtocol();  // 'grpc' | 'http'
  const telemetryOutfile = config.getTelemetryOutfile();

  let spanExporter, logExporter, metricReader;

  if (otlpEndpoint && !telemetryOutfile) {
    // 使用 OTLP Exporter
    if (otlpProtocol === 'http') {
      spanExporter = new OTLPTraceExporterHttp({ url: otlpEndpoint });
      logExporter = new OTLPLogExporterHttp({ url: otlpEndpoint });
      metricReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporterHttp({ url: otlpEndpoint }),
        exportIntervalMillis: 10000,  // 10 秒
      });
    } else {
      // gRPC (默认)
      spanExporter = new OTLPTraceExporter({
        url: otlpEndpoint,
        compression: CompressionAlgorithm.GZIP,
      });
      logExporter = new OTLPLogExporter({
        url: otlpEndpoint,
        compression: CompressionAlgorithm.GZIP,
      });
      metricReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: otlpEndpoint,
          compression: CompressionAlgorithm.GZIP,
        }),
        exportIntervalMillis: 10000,
      });
    }
  } else if (telemetryOutfile) {
    // 使用 File Exporter
    spanExporter = new FileSpanExporter(telemetryOutfile);
    logExporter = new FileLogExporter(telemetryOutfile);
    metricReader = new PeriodicExportingMetricReader({
      exporter: new FileMetricExporter(telemetryOutfile),
      exportIntervalMillis: 10000,
    });
  } else {
    // 使用 Console Exporter (调试)
    spanExporter = new ConsoleSpanExporter();
    logExporter = new ConsoleLogRecordExporter();
    metricReader = new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 10000,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 创建并启动 SDK
  // ═══════════════════════════════════════════════════════════════

  sdk = new NodeSDK({
    resource,
    spanProcessors: [new BatchSpanProcessor(spanExporter)],
    logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
    metricReader,
    instrumentations: [new HttpInstrumentation()],  // 自动 HTTP 追踪
  });

  sdk.start();
  initializeMetrics(config);  // 初始化指标

  // 注册优雅关闭
  process.on('SIGTERM', () => shutdownTelemetry(config));
  process.on('SIGINT', () => shutdownTelemetry(config));
  process.on('exit', () => shutdownTelemetry(config));
}`;

  // loggers.ts 采集点代码
  const loggersCode = `// packages/core/src/telemetry/loggers.ts
// 遥测日志记录函数 (采集点)

// 双通道记录：OpenTelemetry + GeminiLogger (RUM)

export function logToolCall(config: Config, event: ToolCallEvent): void {
  // 1. UI 遥测 (本地状态)
  const uiEvent = { ...event, 'event.name': EVENT_TOOL_CALL };
  uiTelemetryService.addEvent(uiEvent);

  // 2. GeminiLogger (RUM 通道)
  GeminiLogger.getInstance(config)?.logToolCallEvent(event);

  // 3. OpenTelemetry (OTLP 通道)
  if (!isTelemetrySdkInitialized()) return;

  const attributes: LogAttributes = {
    ...getCommonAttributes(config),
    ...event,
    'event.name': EVENT_TOOL_CALL,
    'event.timestamp': new Date().toISOString(),
    function_args: safeJsonStringify(event.function_args, 2),
  };

  const logger = logs.getLogger(SERVICE_NAME);
  logger.emit({
    body: \`Tool call: \${event.function_name}. Success: \${event.success}. Duration: \${event.duration_ms}ms.\`,
    attributes,
  });

  // 4. 指标记录
  recordToolCallMetrics(config, event.duration_ms, {
    function_name: event.function_name,
    success: event.success,
    decision: event.decision,
    tool_type: event.tool_type,
  });
}

export function logApiResponse(config: Config, event: ApiResponseEvent): void {
  // UI 遥测
  uiTelemetryService.addEvent({ ...event, 'event.name': EVENT_API_RESPONSE });

  // GeminiLogger
  GeminiLogger.getInstance(config)?.logApiResponseEvent(event);

  // OpenTelemetry
  if (!isTelemetrySdkInitialized()) return;

  // 记录日志
  const logger = logs.getLogger(SERVICE_NAME);
  logger.emit({
    body: \`API response from \${event.model}. Duration: \${event.duration_ms}ms.\`,
    attributes: { ...getCommonAttributes(config), ...event },
  });

  // 记录指标
  recordApiResponseMetrics(config, event.duration_ms, {
    model: event.model,
    status_code: event.status_code,
  });

  // Token 使用指标 (5 种类型)
  recordTokenUsageMetrics(config, event.input_token_count, { model: event.model, type: 'input' });
  recordTokenUsageMetrics(config, event.output_token_count, { model: event.model, type: 'output' });
  recordTokenUsageMetrics(config, event.cached_content_token_count, { model: event.model, type: 'cache' });
  recordTokenUsageMetrics(config, event.thoughts_token_count, { model: event.model, type: 'thought' });
  recordTokenUsageMetrics(config, event.tool_token_count, { model: event.model, type: 'tool' });
}

export function logChatCompression(config: Config, event: ChatCompressionEvent): void {
  GeminiLogger.getInstance(config)?.logChatCompressionEvent(event);

  const logger = logs.getLogger(SERVICE_NAME);
  logger.emit({
    body: \`Chat compression (Saved \${event.tokens_before - event.tokens_after} tokens)\`,
    attributes: { ...getCommonAttributes(config), ...event },
  });

  recordChatCompressionMetrics(config, {
    tokens_before: event.tokens_before,
    tokens_after: event.tokens_after,
  });
}`;

  // RUM 事件结构
  const rumEventStructureCode = `// packages/core/src/telemetry/gemini-logger/event-types.ts
// RUM 协议数据结构

export interface RumApp {
  id: string;           // 应用 ID: 'gb4w8c3ygj@851d5d500f08f92'
  env: string;          // 环境: 'dev' | 'prod'
  version: string;      // CLI 版本
  type: 'cli' | 'extension';
}

export interface RumUser {
  id: string;           // 用户 ID (基于 installationId 哈希)
}

export interface RumSession {
  id: string;           // 会话 ID
}

export interface RumEvent {
  timestamp?: number;
  event_type?: 'view' | 'action' | 'exception' | 'resource';
  type: string;         // 事件类型: 'session' | 'user' | 'tool' | 'api' | 'error'
  name: string;         // 事件名称
  snapshots?: string;   // JSON 字符串，附加数据
  properties?: Record<string, unknown>;
}

// 不同事件类型的扩展接口
export interface RumViewEvent extends RumEvent {
  view_type?: string;
  time_spent?: number;  // 当前视图停留时间 (ms)
}

export interface RumActionEvent extends RumEvent {
  target_name?: string;
  duration?: number;    // 动作持续时间 (ms)
}

export interface RumResourceEvent extends RumEvent {
  method?: string;      // HTTP 方法
  status_code?: string;
  url?: string;
  duration?: number;    // 资源加载时间 (ms)
  success?: number;     // 1: 成功, 0: 失败
  trace_id?: string;
}

export interface RumExceptionEvent extends RumEvent {
  source?: string;      // 错误来源
  subtype?: string;     // 错误子类型
  message?: string;
  stack?: string;
}

// 完整的 RUM Payload
export interface RumPayload {
  app: RumApp;
  user: RumUser;
  session: RumSession;
  view: RumView;
  events: RumEvent[];
  properties?: Record<string, unknown>;
  _v: string;           // 版本标识: 'gemini-code@x.y.z'
}`;

  // 事件常量定义
  const eventConstantsCode = `// packages/core/src/telemetry/constants.ts
// 事件名称常量

export const SERVICE_NAME = 'gemini-code';

// 用户事件
export const EVENT_USER_PROMPT = 'gemini-code.user_prompt';
export const EVENT_SLASH_COMMAND = 'gemini-code.slash_command';
export const EVENT_MODEL_SLASH_COMMAND = 'gemini-code.slash_command.model';

// API 事件
export const EVENT_API_REQUEST = 'gemini-code.api_request';
export const EVENT_API_RESPONSE = 'gemini-code.api_response';
export const EVENT_API_ERROR = 'gemini-code.api_error';
export const EVENT_API_CANCEL = 'gemini-code.api_cancel';

// 工具事件
export const EVENT_TOOL_CALL = 'gemini-code.tool_call';
export const EVENT_FILE_OPERATION = 'gemini-code.file_operation';
export const EVENT_SUBAGENT_EXECUTION = 'gemini-code.subagent_execution';

// 系统事件
export const EVENT_CLI_CONFIG = 'gemini-code.config';
export const EVENT_CHAT_COMPRESSION = 'gemini-code.chat_compression';
export const EVENT_CONVERSATION_FINISHED = 'gemini-code.conversation_finished';

// 错误事件
export const EVENT_INVALID_CHUNK = 'gemini-code.chat.invalid_chunk';
export const EVENT_CONTENT_RETRY = 'gemini-code.chat.content_retry';
export const EVENT_CONTENT_RETRY_FAILURE = 'gemini-code.chat.content_retry_failure';
export const EVENT_MALFORMED_JSON_RESPONSE = 'gemini-code.malformed_json_response';

// 扩展事件
export const EVENT_EXTENSION_INSTALL = 'gemini-code.extension_install';
export const EVENT_EXTENSION_UNINSTALL = 'gemini-code.extension_uninstall';
export const EVENT_EXTENSION_ENABLE = 'gemini-code.extension_enable';
export const EVENT_EXTENSION_DISABLE = 'gemini-code.extension_disable';

// IDE 事件
export const EVENT_IDE_CONNECTION = 'gemini-code.ide_connection';
export const EVENT_FLASH_FALLBACK = 'gemini-code.flash_fallback';
export const EVENT_RIPGREP_FALLBACK = 'gemini-code.ripgrep_fallback';

// 性能事件
export const EVENT_STARTUP_PERFORMANCE = 'gemini-code.startup.performance';
export const EVENT_MEMORY_USAGE = 'gemini-code.memory.usage';
export const EVENT_PERFORMANCE_BASELINE = 'gemini-code.performance.baseline';
export const EVENT_PERFORMANCE_REGRESSION = 'gemini-code.performance.regression';`;

  // 事件流转图
  const eventFlowChart = `sequenceDiagram
    participant User as 用户操作
    participant Core as Core 层
    participant Loggers as loggers.ts
    participant UI as uiTelemetry
    participant Google as GeminiLogger
    participant OTEL as OpenTelemetry
    participant RUM as Aliyun RUM
    participant OTLP as OTLP Backend

    User->>Core: 执行工具调用
    Core->>Loggers: logToolCall(config, event)

    par 并行记录
        Loggers->>UI: addEvent(uiEvent)
        Note over UI: 本地状态更新
    and
        Loggers->>Gemini: logToolCallEvent(event)
        Gemini->>Gemini: enqueueLogEvent()
        Note over Gemini: 加入缓冲队列
        Gemini->>Gemini: flushIfNeeded()
        alt 距上次刷新 >= 60s
            Gemini->>RUM: POST /
            Note over RUM: 批量发送
        end
    and
        Loggers->>OTEL: logger.emit(logRecord)
        Loggers->>OTEL: recordToolCallMetrics()
        OTEL->>OTEL: BatchSpanProcessor
        Note over OTEL: 批量处理
        OTEL->>OTLP: Export (10s interval)
    end`;

  return (
    <div className="space-y-8">
      {/* 30秒速览 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">遥测系统</h2>
        <HighlightBox title="30秒速览" variant="blue">
          <pre className="text-sm whitespace-pre-wrap font-mono">{quickSummary}</pre>
        </HighlightBox>
      </section>

      {/* 概述 */}
      <section>
        <p className="text-gray-300 mb-4">
          遥测系统采用<strong>双通道架构</strong>：OpenTelemetry (OTLP) 用于标准化可观测性数据，
          GeminiLogger (RUM) 用于发送用户行为分析数据到阿里云。两个通道独立运作，互不干扰。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HighlightBox title="OpenTelemetry" variant="green">
            <p className="text-sm">Traces + Metrics + Logs</p>
            <code className="text-xs text-green-400">OTLP gRPC/HTTP</code>
          </HighlightBox>

          <HighlightBox title="GeminiLogger" variant="yellow">
            <p className="text-sm">RUM 用户行为分析</p>
            <code className="text-xs text-yellow-400">Aliyun RUM</code>
          </HighlightBox>

          <HighlightBox title="指标类型" variant="blue">
            <p className="text-sm">Counter / Histogram / Gauge</p>
            <code className="text-xs text-blue-400">OpenTelemetry API</code>
          </HighlightBox>

          <HighlightBox title="隐私保护" variant="purple">
            <p className="text-sm">匿名化 + 脱敏 + 可禁用</p>
            <code className="text-xs text-purple-400">GEMINI_TELEMETRY_ENABLED=false</code>
          </HighlightBox>
        </div>
      </section>

      {/* 双通道架构 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">双通道架构</h3>
        <MermaidDiagram chart={dualChannelArchChart} />
      </section>

      {/* SDK 初始化流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">SDK 初始化流程</h3>
        <MermaidDiagram chart={sdkInitChart} />
        <CodeBlock code={sdkInitCode} language="typescript" title="sdk.ts - 初始化实现" />
      </section>

      {/* 指标定义 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">指标定义</h3>
        <CodeBlock code={metricsDefinitionCode} language="typescript" title="metrics.ts - Counter & Histogram" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">核心指标参考表</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left p-2">指标名</th>
                <th className="text-left p-2">类型</th>
                <th className="text-left p-2">单位</th>
                <th className="text-left p-2">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">gemini-code.tool.call.count</code></td>
                <td className="p-2">Counter</td>
                <td className="p-2">次</td>
                <td className="p-2">工具调用总数</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">gemini-code.tool.call.latency</code></td>
                <td className="p-2">Histogram</td>
                <td className="p-2">ms</td>
                <td className="p-2">工具调用延迟分布</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">gemini-code.api.request.count</code></td>
                <td className="p-2">Counter</td>
                <td className="p-2">次</td>
                <td className="p-2">API 请求总数</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">gemini-code.api.request.latency</code></td>
                <td className="p-2">Histogram</td>
                <td className="p-2">ms</td>
                <td className="p-2">API 请求延迟分布</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">gemini-code.token.usage</code></td>
                <td className="p-2">Counter</td>
                <td className="p-2">tokens</td>
                <td className="p-2">Token 使用量 (input/output/cache/thought/tool)</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">gemini-code.session.count</code></td>
                <td className="p-2">Counter</td>
                <td className="p-2">次</td>
                <td className="p-2">CLI 会话总数</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">gemini-code.chat_compression</code></td>
                <td className="p-2">Counter</td>
                <td className="p-2">次</td>
                <td className="p-2">上下文压缩事件</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">gemini-code.subagent.execution.count</code></td>
                <td className="p-2">Counter</td>
                <td className="p-2">次</td>
                <td className="p-2">子代理执行计数</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 性能监控指标 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">性能监控指标</h3>
        <CodeBlock code={performanceMetricsCode} language="typescript" title="metrics.ts - 性能监控" />
      </section>

      {/* 事件类型 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">事件类型定义</h3>
        <CodeBlock code={eventTypesCode} language="typescript" title="types.ts" />
      </section>

      {/* 事件常量 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">事件名称常量</h3>
        <CodeBlock code={eventConstantsCode} language="typescript" title="constants.ts" />
      </section>

      {/* GeminiLogger 实现 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">GeminiLogger 实现</h3>
        <CodeBlock code={geminiLoggerCode} language="typescript" title="gemini-logger.ts" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="刷新间隔" variant="blue">
            <p className="text-2xl font-bold">60s</p>
            <p className="text-xs text-gray-400">FLUSH_INTERVAL_MS</p>
          </HighlightBox>
          <HighlightBox title="最大事件数" variant="green">
            <p className="text-2xl font-bold">1000</p>
            <p className="text-xs text-gray-400">MAX_EVENTS (FIFO 淘汰)</p>
          </HighlightBox>
          <HighlightBox title="重试队列" variant="yellow">
            <p className="text-2xl font-bold">100</p>
            <p className="text-xs text-gray-400">MAX_RETRY_EVENTS</p>
          </HighlightBox>
        </div>
      </section>

      {/* RUM 事件结构 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">RUM 事件结构</h3>
        <CodeBlock code={rumEventStructureCode} language="typescript" title="event-types.ts" />
      </section>

      {/* 采集点实现 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">采集点实现</h3>
        <CodeBlock code={loggersCode} language="typescript" title="loggers.ts - 双通道记录" />
      </section>

      {/* 事件流转时序图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">事件流转时序</h3>
        <MermaidDiagram chart={eventFlowChart} />
      </section>

      {/* 禁用遥测 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">禁用遥测</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-300 space-y-3">
            <div>
              <p className="font-semibold text-yellow-400 mb-1">方法 1: 环境变量</p>
              <code className="bg-gray-900 px-2 py-1 rounded block">export GEMINI_TELEMETRY_ENABLED=false</code>
            </div>
            <div>
              <p className="font-semibold text-yellow-400 mb-1">方法 2: 配置文件 (~/.gemini/settings.json)</p>
              <code className="bg-gray-900 px-2 py-1 rounded block">
                {`{ "telemetry": { "enabled": false } }`}
              </code>
            </div>
            <div>
              <p className="font-semibold text-yellow-400 mb-1">方法 3: 禁用使用统计 (GeminiLogger)</p>
              <code className="bg-gray-900 px-2 py-1 rounded block">
                {`{ "usageStatistics": false }`}
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* 源码导航 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">源码导航</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left p-2">文件</th>
                <th className="text-left p-2">职责</th>
                <th className="text-left p-2">关键导出</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>telemetry/sdk.ts</code></td>
                <td className="p-2">SDK 初始化与关闭</td>
                <td className="p-2"><code>initializeTelemetry</code>, <code>shutdownTelemetry</code></td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>telemetry/metrics.ts</code></td>
                <td className="p-2">指标定义与记录</td>
                <td className="p-2"><code>initializeMetrics</code>, <code>recordToolCallMetrics</code>, ...</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>telemetry/types.ts</code></td>
                <td className="p-2">事件类型定义</td>
                <td className="p-2"><code>TelemetryEvent</code>, <code>*Event</code> classes</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>telemetry/constants.ts</code></td>
                <td className="p-2">事件名称常量</td>
                <td className="p-2"><code>EVENT_*</code>, <code>SERVICE_NAME</code></td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>telemetry/loggers.ts</code></td>
                <td className="p-2">采集点函数</td>
                <td className="p-2"><code>logToolCall</code>, <code>logApiResponse</code>, ...</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>telemetry/gemini-logger/gemini-logger.ts</code></td>
                <td className="p-2">RUM 日志记录器</td>
                <td className="p-2"><code>GeminiLogger</code> singleton</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>telemetry/gemini-logger/event-types.ts</code></td>
                <td className="p-2">RUM 事件结构</td>
                <td className="p-2"><code>RumEvent</code>, <code>RumPayload</code></td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>telemetry/uiTelemetry.ts</code></td>
                <td className="p-2">UI 遥测服务</td>
                <td className="p-2"><code>uiTelemetryService</code></td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code>telemetry/file-exporters.ts</code></td>
                <td className="p-2">文件导出器</td>
                <td className="p-2"><code>FileSpanExporter</code>, <code>FileLogExporter</code>, ...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">最佳实践</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">遥测设计原则</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 双通道独立运作，互不干扰</li>
              <li>✓ 批量发送减少网络开销</li>
              <li>✓ FIFO 淘汰防止内存泄漏</li>
              <li>✓ 指数退避重试网络错误</li>
              <li>✓ 默认启用，可完全禁用</li>
            </ul>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">关键配置</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>→ OTLP Endpoint: 配置自定义后端</li>
              <li>→ OTLP Protocol: grpc (默认) 或 http</li>
              <li>→ Telemetry Outfile: 输出到本地文件</li>
              <li>→ Log User Prompts: 是否记录用户输入</li>
              <li>→ Usage Statistics: RUM 数据收集开关</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 相关页面 */}
      <RelatedPages
        title="🔗 相关页面"
        pages={[
          { id: 'config', label: '配置系统', description: '遥测配置选项' },
          { id: 'memory', label: '上下文管理', description: '压缩事件记录' },
          { id: 'tool-arch', label: '工具架构', description: '工具调用指标' },
          { id: 'subagent', label: '子代理系统', description: '子代理执行指标' },
          { id: 'lifecycle', label: '请求生命周期', description: 'API 请求追踪' },
          { id: 'error-recovery-patterns', label: '错误恢复', description: '错误事件处理' },
        ]}
      />
    </div>
  );
}
