import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages } from '../components/RelatedPages';

export function TelemetrySystem() {
 const quickSummary = `🎯 30秒结论
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1) 两套系统：
 - Usage Statistics（Clearcut，默认开，可关闭）
 - Telemetry（OpenTelemetry，显式开启，用于调试/性能/自建后端）
2) 一个统一入口：telemetry/loggers.ts 负责把事件分发到 UI / Clearcut / OTel
3) 命名约定：
 - service.name = 'gemini-cli'
 - events/metrics prefix = 'gemini_cli.*'
4) 关键开关：
 - Telemetry：GEMINI_TELEMETRY_* 或 settings.telemetry.*
 - Usage Statistics：settings.privacy.usageStatisticsEnabled
5) 隐私：
 - prompt 内容默认不上传（需 GEMINI_TELEMETRY_LOG_PROMPTS=true）
 - sanitize.ts 统一脱敏/规范化`;

 const architectureChart = `flowchart TB
 subgraph Sources["事件源"]
 session["Session / Config"]
 prompt["User Prompt"]
 api["API Request/Response"]
 tool["Tool Call / File Ops"]
 ide["IDE / Extension"]
 end

 subgraph Aggregation["采集层（统一入口）"]
 loggers["telemetry/loggers.ts\\nlogUserPrompt / logToolCall / ..."]
 ui["uiTelemetryService\\n(本地 UI 状态)"]
 end

 subgraph Usage["Usage Statistics（默认）"]
 clearcut["ClearcutLogger\\nflush=60s\\nmax=1000"]
 clearcutBackend["Clearcut endpoint\\nplay.googleapis.com/log"]
 end

 subgraph Telemetry["Telemetry（可选）"]
 sdk["OpenTelemetry NodeSDK"]
 exporters["Exporters\\nOTLP / GCP / File / Console"]
 backends["Collector / GCP\\nLocal file / console"]
 end

 Sources --> loggers
 loggers --> ui
 loggers --> clearcut
 clearcut --> clearcutBackend
 loggers --> sdk
 sdk --> exporters
 exporters --> backends`;

 const resolveSettingsCode = `// gemini-cli/packages/core/src/telemetry/config.ts
export async function resolveTelemetrySettings({ argv, env, settings }) {
  // argv > env > settings
  const enabled =
  argv.telemetry ??
  parseBooleanEnvFlag(env['GEMINI_TELEMETRY_ENABLED']) ??
  settings.enabled;

  const rawTarget =
  argv.telemetryTarget ??
  env['GEMINI_TELEMETRY_TARGET'] ??
  settings.target;
  const target = parseTelemetryTargetValue(rawTarget); // 'local' | 'gcp'

  const otlpEndpoint =
  argv.telemetryOtlpEndpoint ??
  env['GEMINI_TELEMETRY_OTLP_ENDPOINT'] ??
  env['OTEL_EXPORTER_OTLP_ENDPOINT'] ??
  settings.otlpEndpoint;

  return { enabled, target, otlpEndpoint, ... };
}`;

 const clearcutCode = `// gemini-cli/packages/core/src/telemetry/clearcut-logger/clearcut-logger.ts
const CLEARCUT_URL = 'https://play.googleapis.com/log?format=json&hasfast=true';
const FLUSH_INTERVAL_MS = 1000 * 60;
const MAX_EVENTS = 1000;
const MAX_RETRY_EVENTS = 100;

static getInstance(config?: Config): ClearcutLogger | undefined {
  if (config === undefined || !config.getUsageStatisticsEnabled()) return undefined;
  return ClearcutLogger.instance ?? new ClearcutLogger(config);
}`;

 const sdkInitChart = `flowchart TD
 start([initializeTelemetry])
 enabled{telemetry.enabled?}
 defer{useCliAuth && no creds?}
 wait[等待 oauth post_auth]
 resource[resource: service.name + session.id]
 target{telemetry.target}
 local[local exporters]
 gcp[gcp exporters]
 done([NodeSDK.start + initializeMetrics])

 start --> enabled
 enabled -->|No| stop([return])
 enabled -->|Yes| defer
 defer -->|Yes| wait --> stop
 defer -->|No| resource --> target
 target -->|local| local --> done
 target -->|gcp| gcp --> done`;

 const sdkInitCode = `// gemini-cli/packages/core/src/telemetry/sdk.ts
export async function initializeTelemetry(config: Config, credentials?: JWTInput) {
  if (!config.getTelemetryEnabled()) return;

  // useCliAuth + no credentials -> defer init, wait for oauth post_auth
  if (config.getTelemetryUseCliAuth() && !credentials) {
  authEvents.on('post_auth', (creds) => initializeTelemetry(config, creds));
  return;
  }

  const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME, // 'gemini-cli'
  [SemanticResourceAttributes.SERVICE_VERSION]: process.version,
  'session.id': config.getSessionId(),
  });

  // choose exporters based on:
  // - GEMINI_TELEMETRY_TARGET (local/gcp)
  // - GEMINI_TELEMETRY_OTLP_ENDPOINT / outfile / useCollector
  const sdk = new NodeSDK({
  resource,
  instrumentations: [new HttpInstrumentation()],
  // ... span/log/metric exporters
  });

  await sdk.start();
  initializeMetrics(config);
}`;

 const loggerCode = `// gemini-cli/packages/core/src/telemetry/loggers.ts
export function logToolCall(config: Config, event: ToolCallEvent): void {
  // 1) UI 内存事件（用于 UI/调试）
  uiTelemetryService.addEvent({
  ...event,
  'event.name': EVENT_TOOL_CALL,
  'event.timestamp': new Date().toISOString(),
  });

  // 2) Usage Statistics（Clearcut）
  ClearcutLogger.getInstance(config)?.logToolCallEvent(event);

  // 3) Telemetry（OpenTelemetry Logs + Metrics）
  bufferTelemetryEvent(() => {
  const logger = logs.getLogger(SERVICE_NAME);
  logger.emit({
  body: event.toLogBody(),
  attributes: event.toOpenTelemetryAttributes(config),
  });
  });

  recordToolCallMetrics(config, event.duration_ms, {
  function_name: event.function_name,
  success: event.success,
  tool_type: event.tool_type,
  });
}`;

 const eventAndMetricNames = `// gemini-cli/packages/core/src/telemetry/types.ts
export const EVENT_TOOL_CALL = 'gemini_cli.tool_call';
export const EVENT_API_RESPONSE = 'gemini_cli.api_response';
export const EVENT_IDE_CONNECTION = 'gemini_cli.ide_connection';

// gemini-cli/packages/core/src/telemetry/metrics.ts
const TOOL_CALL_COUNT = 'gemini_cli.tool.call.count';
const API_REQUEST_LATENCY = 'gemini_cli.api.request.latency';
const TOKEN_USAGE = 'gemini_cli.token.usage';
const STARTUP_TIME = 'gemini_cli.startup.duration';

// OpenTelemetry GenAI semantic convention
const GEN_AI_CLIENT_TOKEN_USAGE = 'gen_ai.client.token.usage';`;

 const disableCode = `# 关闭 Telemetry（OpenTelemetry）
export GEMINI_TELEMETRY_ENABLED=false

# 关闭 Usage Statistics（Clearcut）：~/.gemini/settings.json
{
  "privacy": { "usageStatisticsEnabled": false },
  "telemetry": { "enabled": false }
}`;

 return (
 <div className="space-y-8">
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">遥测与使用统计</h2>
 <HighlightBox title="30秒速览" variant="blue">
 <pre className="text-sm whitespace-pre-wrap font-mono">{quickSummary}</pre>
 </HighlightBox>
 </section>

 <section>
 <p className="text-body mb-4">
 上游 <code>gemini-cli</code> 把“可观测性”拆成两条并行通道：
 <strong> Usage Statistics（Clearcut）</strong> 用于匿名使用统计（默认开，可在 settings 里关），
 <strong> Telemetry（OpenTelemetry）</strong> 用于调试/性能/自建后端（需要显式开启）。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <HighlightBox title="Usage Statistics" variant="yellow">
 <p className="text-sm">Clearcut 批量上报</p>
 <code className="text-xs text-heading">privacy.usageStatisticsEnabled</code>
 </HighlightBox>

 <HighlightBox title="Telemetry" variant="green">
 <p className="text-sm">OTel Logs/Metrics/Traces</p>
 <code className="text-xs text-heading">GEMINI_TELEMETRY_ENABLED</code>
 </HighlightBox>

 <HighlightBox title="统一采集点" variant="blue">
 <p className="text-sm">loggers.ts 统一入口</p>
 <code className="text-xs text-heading">bufferTelemetryEvent()</code>
 </HighlightBox>

 <HighlightBox title="隐私" variant="purple">
 <p className="text-sm">prompt 默认不记录</p>
 <code className="text-xs text-heading">GEMINI_TELEMETRY_LOG_PROMPTS</code>
 </HighlightBox>
 </div>
 </section>

 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">整体架构</h3>
 <MermaidDiagram chart={architectureChart} />
 </section>

 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">Telemetry 配置解析</h3>
 <p className="text-body mb-4">
 Telemetry 的配置通过 <code>argv → env → settings</code> 三层合并，入口在{' '}
 <code>gemini-cli/packages/core/src/telemetry/config.ts</code>。
 </p>
 <CodeBlock code={resolveSettingsCode} language="typescript" title="resolveTelemetrySettings()" />

 <div className="overflow-x-auto mt-4">
 <table className="w-full text-sm border-collapse border border-edge">
 <thead>
 <tr className="bg-surface">
 <th className="border border-edge p-2 text-left text-body">环境变量</th>
 <th className="border border-edge p-2 text-left text-body">含义</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr>
 <td className="border border-edge p-2 font-mono text-heading">GEMINI_TELEMETRY_ENABLED</td>
 <td className="border border-edge p-2">是否启用 OpenTelemetry</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-2 font-mono text-heading">GEMINI_TELEMETRY_TARGET</td>
 <td className="border border-edge p-2">
 <code>local</code> 或 <code>gcp</code>
 </td>
 </tr>
 <tr>
 <td className="border border-edge p-2 font-mono text-heading">GEMINI_TELEMETRY_OTLP_ENDPOINT</td>
 <td className="border border-edge p-2">
 OTLP Endpoint（也可用 <code>OTEL_EXPORTER_OTLP_ENDPOINT</code>）
 </td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-2 font-mono text-heading">GEMINI_TELEMETRY_OTLP_PROTOCOL</td>
 <td className="border border-edge p-2">
 <code>grpc</code> / <code>http</code>
 </td>
 </tr>
 <tr>
 <td className="border border-edge p-2 font-mono text-heading">GEMINI_TELEMETRY_OUTFILE</td>
 <td className="border border-edge p-2">输出到本地文件（用于离线调试）</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-2 font-mono text-heading">GEMINI_TELEMETRY_LOG_PROMPTS</td>
 <td className="border border-edge p-2">是否记录用户输入 prompt 内容（默认关闭）</td>
 </tr>
 <tr>
 <td className="border border-edge p-2 font-mono text-heading">GEMINI_TELEMETRY_USE_COLLECTOR</td>
 <td className="border border-edge p-2">是否通过 Collector 转发（影响 GCP 模式）</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-2 font-mono text-heading">GEMINI_TELEMETRY_USE_CLI_AUTH</td>
 <td className="border border-edge p-2">用 CLI 登录凭据初始化 Telemetry（无凭据时会 defer）</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">Telemetry 初始化（NodeSDK）</h3>
 <MermaidDiagram chart={sdkInitChart} />
 <CodeBlock code={sdkInitCode} language="typescript" title="sdk.ts - initializeTelemetry()" />
 <HighlightBox title="为什么要 bufferTelemetryEvent？" variant="blue" className="mt-4">
 <p className="text-sm text-body">
 CLI 启动早期（比如打印 banner / 初始化 auth）可能已经开始产生日志。为避免“先产生日志、后初始化 SDK”导致丢事件，上游用{' '}
 <code>bufferTelemetryEvent()</code> 把 emit 延后到 SDK 就绪后统一 flush。
 </p>
 </HighlightBox>
 </section>

 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">Usage Statistics（Clearcut）</h3>
 <p className="text-body mb-4">
 Usage Statistics 与 Telemetry 相互独立：它走 Clearcut 批量上报，受 <code>privacy.usageStatisticsEnabled</code>{' '}
 控制。
 </p>
 <CodeBlock code={clearcutCode} language="typescript" title="clearcut-logger.ts - 缓冲与刷新" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
 <HighlightBox title="刷新间隔" variant="blue">
 <p className="text-2xl font-bold">60s</p>
 <p className="text-xs text-body">FLUSH_INTERVAL_MS</p>
 </HighlightBox>
 <HighlightBox title="最大事件数" variant="green">
 <p className="text-2xl font-bold">1000</p>
 <p className="text-xs text-body">MAX_EVENTS（超出丢弃）</p>
 </HighlightBox>
 <HighlightBox title="重试队列" variant="yellow">
 <p className="text-2xl font-bold">100</p>
 <p className="text-xs text-body">MAX_RETRY_EVENTS</p>
 </HighlightBox>
 </div>
 </section>

 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">采集点（loggers.ts）</h3>
 <p className="text-body mb-4">
 所有核心事件都在 <code>loggers.ts</code> 里集中处理：先更新 UI 本地状态，再写 Usage Statistics，最后（可选）写 OTel，并同步记录 metrics。
 </p>
 <CodeBlock code={loggerCode} language="typescript" title="loggers.ts - 统一采集入口" />
 </section>

 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">事件/指标命名约定</h3>
 <CodeBlock code={eventAndMetricNames} language="typescript" title="types.ts / metrics.ts - 命名" />

 <div className="overflow-x-auto mt-4">
 <table className="w-full text-sm border-collapse border border-edge">
 <thead>
 <tr className="bg-surface">
 <th className="border border-edge p-2 text-left text-body">示例</th>
 <th className="border border-edge p-2 text-left text-body">类型</th>
 <th className="border border-edge p-2 text-left text-body">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr>
 <td className="border border-edge p-2 font-mono text-heading">gemini_cli.tool.call.count</td>
 <td className="border border-edge p-2">Counter</td>
 <td className="border border-edge p-2">工具调用总数（按 function_name / success 等打 tag）</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-2 font-mono text-heading">gemini_cli.api.request.latency</td>
 <td className="border border-edge p-2">Histogram</td>
 <td className="border border-edge p-2">API 请求延迟分布（按 model 打 tag）</td>
 </tr>
 <tr>
 <td className="border border-edge p-2 font-mono text-heading">gemini_cli.token.usage</td>
 <td className="border border-edge p-2">Counter</td>
 <td className="border border-edge p-2">Token 统计（input/output/cache/thought/tool）</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-2 font-mono text-heading">gemini_cli.startup.duration</td>
 <td className="border border-edge p-2">Histogram</td>
 <td className="border border-edge p-2">启动阶段耗时（用于性能回归）</td>
 </tr>
 <tr>
 <td className="border border-edge p-2 font-mono text-heading">gen_ai.client.token.usage</td>
 <td className="border border-edge p-2">Counter</td>
 <td className="border border-edge p-2">OTel GenAI 语义约定（跨产品对齐）</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">禁用与最小化采集</h3>
 <CodeBlock code={disableCode} language="bash" title="关闭开关示例" />

 <HighlightBox title="建议" variant="purple" className="mt-4">
 <ul className="text-sm text-body space-y-1">
 <li>只在需要调试/性能诊断时开启 Telemetry（OTel），并优先写到本地文件。</li>
 <li>
 • 如果要记录 prompt 内容，务必显式开启 <code>GEMINI_TELEMETRY_LOG_PROMPTS</code>，并理解其隐私影响。
 </li>
 <li>企业内网/合规场景可统一下发 system settings / system-defaults.json 来关闭 Usage Statistics。</li>
 </ul>
 </HighlightBox>
 </section>

 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">最佳实践</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">事件设计</h4>
 <ul className="text-sm text-body space-y-1">
 <li>✓ 统一入口：只在 loggers.ts 发事件</li>
 <li>✓ 统一命名：events/metrics 用 gemini_cli.* 前缀</li>
 <li>✓ 先保底再增强：bufferTelemetryEvent 避免启动早期丢数据</li>
 <li>✓ 可禁用：Telemetry 与 Usage Statistics 分开关</li>
 </ul>
 </div>
 <div className="bg-elevated/20 border border-edge rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">落地配置</h4>
 <ul className="text-sm text-body space-y-1">
 <li>
 → 本地调试：<code>GEMINI_TELEMETRY_OUTFILE</code> 输出到文件
 </li>
 <li>
 → 自建后端：配置 <code>GEMINI_TELEMETRY_OTLP_ENDPOINT</code>
 </li>
 <li>
 → GCP：<code>GEMINI_TELEMETRY_TARGET=gcp</code> + useCollector 策略
 </li>
 <li>→ 合规：关闭 usageStatistics 或至少关闭 logPrompts</li>
 </ul>
 </div>
 </div>
 </section>

 <RelatedPages
 title="🔗 相关页面"
 pages={[
 { id: 'config', label: '配置系统', description: 'Telemetry 与 Settings 合并' },
 { id: 'startup-chain', label: '启动链路', description: '初始化阶段与 bufferTelemetryEvent' },
 { id: 'tool-arch', label: '工具架构', description: 'ToolCall 指标与事件' },
 { id: 'memory', label: '上下文管理', description: '压缩事件与 token 指标' },
 { id: 'ide-integration', label: 'IDE 集成', description: 'IDE connection 事件' },
 { id: 'error-recovery-patterns', label: '错误恢复', description: 'ApiError/Retry/回退事件' },
 ]}
 />
 </div>
 );
}
