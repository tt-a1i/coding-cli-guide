import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

export function ErrorHandling() {
  const errorFlowChart = `flowchart TD
    start["错误发生"]
    capture["错误捕获<br/>Error Boundary"]
    classify["错误分类"]
    is_recoverable{"可恢复?"}
    recovery["尝试恢复<br/>重试/回退"]
    recovered{"恢复成功?"}
    continue["继续执行"]
    report["错误报告<br/>用户通知"]
    log["日志记录<br/>遥测上报"]
    endNode["优雅退出"]

    start --> capture
    capture --> classify
    classify --> is_recoverable
    is_recoverable -->|Yes| recovery
    is_recoverable -->|No| report
    recovery --> recovered
    recovered -->|Yes| continue
    recovered -->|No| report
    report --> log
    log --> endNode

    style start fill:#22d3ee,color:#000
    style continue fill:#22c55e,color:#000
    style endNode fill:#22c55e,color:#000
    style is_recoverable fill:#f59e0b,color:#000
    style recovered fill:#f59e0b,color:#000`;

  const errorTypesCode = `// packages/core/src/errors/types.ts

// 基础错误类
export class CLIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = false,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CLIError';
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      recoverable: this.recoverable,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}

// API 相关错误
export class APIError extends CLIError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: unknown
  ) {
    super(
      message,
      \`API_ERROR_\${statusCode}\`,
      [429, 500, 502, 503, 504].includes(statusCode)
    );
    this.name = 'APIError';
  }
}

// 认证错误
export class AuthenticationError extends CLIError {
  constructor(message: string = '认证失败') {
    super(message, 'AUTH_ERROR', false);
    this.name = 'AuthenticationError';
  }
}

// 工具执行错误
export class ToolExecutionError extends CLIError {
  constructor(
    public readonly toolName: string,
    message: string,
    public readonly exitCode?: number
  ) {
    super(message, 'TOOL_ERROR', true, { toolName, exitCode });
    this.name = 'ToolExecutionError';
  }
}

// 配置错误
export class ConfigurationError extends CLIError {
  constructor(message: string, public readonly configKey?: string) {
    super(message, 'CONFIG_ERROR', false, { configKey });
    this.name = 'ConfigurationError';
  }
}

// 网络错误
export class NetworkError extends CLIError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message, 'NETWORK_ERROR', true);
    this.name = 'NetworkError';
  }
}

// 超时错误
export class TimeoutError extends CLIError {
  constructor(
    public readonly operation: string,
    public readonly timeoutMs: number
  ) {
    super(
      \`操作 "\${operation}" 超时 (\${timeoutMs}ms)\`,
      'TIMEOUT_ERROR',
      true
    );
    this.name = 'TimeoutError';
  }
}`;

  const errorClassifierCode = `// 错误分类器
// packages/core/src/errors/classifier.ts

interface ErrorClassification {
  category: ErrorCategory;
  severity: ErrorSeverity;
  recoverable: boolean;
  suggestedAction: SuggestedAction;
  userMessage: string;
}

enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  NETWORK = 'network',
  API = 'api',
  TOOL = 'tool',
  CONFIGURATION = 'configuration',
  USER_INPUT = 'user_input',
  INTERNAL = 'internal',
  UNKNOWN = 'unknown',
}

enum ErrorSeverity {
  LOW = 'low',           // 可忽略，自动恢复
  MEDIUM = 'medium',     // 需要重试或用户确认
  HIGH = 'high',         // 需要用户干预
  CRITICAL = 'critical', // 需要立即停止
}

enum SuggestedAction {
  RETRY = 'retry',
  REAUTHENTICATE = 'reauthenticate',
  CHECK_CONFIG = 'check_config',
  CONTACT_SUPPORT = 'contact_support',
  WAIT_AND_RETRY = 'wait_and_retry',
  USER_CONFIRM = 'user_confirm',
  ABORT = 'abort',
}

export function classifyError(error: Error): ErrorClassification {
  // API 错误分类
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 401:
        return {
          category: ErrorCategory.AUTHENTICATION,
          severity: ErrorSeverity.HIGH,
          recoverable: false,
          suggestedAction: SuggestedAction.REAUTHENTICATE,
          userMessage: '认证失败，请重新登录',
        };

      case 403:
        return {
          category: ErrorCategory.AUTHORIZATION,
          severity: ErrorSeverity.HIGH,
          recoverable: false,
          suggestedAction: SuggestedAction.CHECK_CONFIG,
          userMessage: '没有访问权限',
        };

      case 429:
        return {
          category: ErrorCategory.RATE_LIMIT,
          severity: ErrorSeverity.MEDIUM,
          recoverable: true,
          suggestedAction: SuggestedAction.WAIT_AND_RETRY,
          userMessage: '请求过于频繁，稍后自动重试',
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          recoverable: true,
          suggestedAction: SuggestedAction.RETRY,
          userMessage: '服务暂时不可用，正在重试',
        };
    }
  }

  // 网络错误
  if (error instanceof NetworkError ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT')) {
    return {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      suggestedAction: SuggestedAction.RETRY,
      userMessage: '网络连接失败，正在重试',
    };
  }

  // 默认分类
  return {
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.HIGH,
    recoverable: false,
    suggestedAction: SuggestedAction.CONTACT_SUPPORT,
    userMessage: \`发生未知错误: \${error.message}\`,
  };
}`;

  const errorBoundaryCode = `// 错误边界 (Error Boundary)
// packages/cli/src/ui/components/ErrorBoundary.tsx

import { Component, ReactNode } from 'react';
import { Box, Text } from 'ink';

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误
    console.error('UI Error Boundary caught:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // 通知父组件
    this.props.onError?.(error);

    // 上报遥测
    telemetry.recordError({
      type: 'ui_error',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // 渲染回退 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box flexDirection="column" padding={1}>
          <Text color="red" bold>发生错误</Text>
          <Text color="gray">{this.state.error?.message}</Text>
          <Text color="yellow">
            请尝试重新启动或报告此问题
          </Text>
        </Box>
      );
    }

    return this.props.children;
  }
}`;

  const globalHandlerCode = `// 全局错误处理
// packages/cli/src/errors/globalHandler.ts

export function setupGlobalErrorHandlers(): void {
  // 未捕获的 Promise 拒绝
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);

    // 记录到遥测
    telemetry.recordError({
      type: 'unhandled_rejection',
      reason: String(reason),
    });

    // 尝试优雅退出
    gracefulShutdown(1);
  });

  // 未捕获的异常
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);

    // 记录到遥测
    telemetry.recordError({
      type: 'uncaught_exception',
      error: error.message,
      stack: error.stack,
    });

    // 立即退出 (uncaughtException 后继续运行不安全)
    process.exit(1);
  });

  // SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\\n收到中断信号，正在退出...');
    gracefulShutdown(0);
  });

  // SIGTERM
  process.on('SIGTERM', () => {
    console.log('收到终止信号，正在退出...');
    gracefulShutdown(0);
  });
}

async function gracefulShutdown(exitCode: number): Promise<void> {
  try {
    // 保存当前状态
    await saveSessionState();

    // 清理资源
    await cleanupResources();

    // 发送待处理的遥测数据
    await telemetry.flush();

  } catch (error) {
    console.error('Shutdown error:', error);
  } finally {
    process.exit(exitCode);
  }
}`;

  const errorReportingCode = `// 错误报告与用户反馈
// packages/cli/src/errors/reporter.ts

interface ErrorReport {
  timestamp: string;
  error: {
    name: string;
    code: string;
    message: string;
    stack?: string;
  };
  context: {
    command: string;
    arguments: string[];
    workingDirectory: string;
    nodeVersion: string;
    cliVersion: string;
    platform: string;
  };
  sessionInfo: {
    sessionId: string;
    turnCount: number;
    duration: number;
  };
}

export class ErrorReporter {
  // 生成错误报告
  generateReport(error: CLIError): ErrorReport {
    return {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack,
      },
      context: {
        command: process.argv[1],
        arguments: process.argv.slice(2),
        workingDirectory: process.cwd(),
        nodeVersion: process.version,
        cliVersion: getVersion(),
        platform: process.platform,
      },
      sessionInfo: {
        sessionId: getCurrentSessionId(),
        turnCount: getCurrentTurnCount(),
        duration: getSessionDuration(),
      },
    };
  }

  // 保存错误报告到文件
  async saveToFile(report: ErrorReport): Promise<string> {
    const filename = \`error-\${Date.now()}.json\`;
    const filepath = path.join(
      os.homedir(),
      '.innies',
      'crash-reports',
      filename
    );

    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));

    return filepath;
  }

  // 显示用户友好的错误信息
  displayToUser(error: CLIError, classification: ErrorClassification): void {
    const ui = getUIRenderer();

    ui.render(
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>
          {classification.severity === 'critical' ? '严重错误' : '错误'}
        </Text>

        <Text>{classification.userMessage}</Text>

        {classification.recoverable && (
          <Text color="yellow">
            系统将尝试自动恢复...
          </Text>
        )}

        {!classification.recoverable && (
          <Text color="gray">
            错误代码: {error.code}
          </Text>
        )}

        {classification.suggestedAction === 'contact_support' && (
          <Text color="cyan">
            如需帮助，请提交 issue:
            https://github.com/zhimanai/innies-cli/issues
          </Text>
        )}
      </Box>
    );
  }
}`;

  const jsonErrorParsingCode = `// JSON 错误解析
// packages/core/src/utils/jsonParser.ts

interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  partial?: Partial<T>;
}

export function safeParseJSON<T>(
  input: string,
  schema?: JSONSchema
): ParseResult<T> {
  // 预处理：移除可能的 markdown 代码块标记
  const cleaned = input
    .replace(/^\`\`\`json?\\n?/i, '')
    .replace(/\\n?\`\`\`$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    // 可选的 schema 验证
    if (schema) {
      const validation = validateSchema(parsed, schema);
      if (!validation.valid) {
        return {
          success: false,
          error: \`Schema validation failed: \${validation.errors.join(', ')}\`,
          partial: parsed,
        };
      }
    }

    return { success: true, data: parsed as T };

  } catch (e) {
    const error = e as SyntaxError;

    // 尝试修复常见的 JSON 错误
    const fixed = attemptJSONFix(cleaned, error);
    if (fixed.success) {
      return safeParseJSON<T>(fixed.result, schema);
    }

    return {
      success: false,
      error: \`JSON parse error: \${error.message}\`,
      partial: extractPartialJSON(cleaned),
    };
  }
}

// 尝试修复常见的 JSON 格式问题
function attemptJSONFix(
  input: string,
  error: SyntaxError
): { success: boolean; result: string } {
  let result = input;

  // 修复尾部逗号
  result = result.replace(/,\\s*([}\\]])/g, '$1');

  // 修复单引号
  result = result.replace(/'/g, '"');

  // 修复未引用的键
  result = result.replace(
    /([{,]\\s*)(\\w+)(\\s*:)/g,
    '$1"$2"$3'
  );

  // 如果修复后与原始不同，尝试解析
  if (result !== input) {
    try {
      JSON.parse(result);
      return { success: true, result };
    } catch {
      // 修复无效
    }
  }

  return { success: false, result: input };
}`;

  return (
    <div className="space-y-8">
      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">错误处理系统</h2>
        <p className="text-gray-300 mb-4">
          完善的错误处理系统是 CLI 稳定性和用户体验的基础。系统实现了错误捕获、分类、恢复、
          报告的完整链路，确保在各种异常情况下都能优雅地处理和反馈。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HighlightBox title="错误捕获" color="blue">
            <ul className="text-sm space-y-1">
              <li>• try-catch 块</li>
              <li>• Error Boundary</li>
              <li>• 全局处理器</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="错误分类" color="green">
            <ul className="text-sm space-y-1">
              <li>• 类型识别</li>
              <li>• 严重度评估</li>
              <li>• 恢复可能性</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="错误恢复" color="yellow">
            <ul className="text-sm space-y-1">
              <li>• 自动重试</li>
              <li>• 模型回退</li>
              <li>• 状态恢复</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="错误报告" color="purple">
            <ul className="text-sm space-y-1">
              <li>• 用户通知</li>
              <li>• 日志记录</li>
              <li>• 遥测上报</li>
            </ul>
          </HighlightBox>
        </div>
      </section>

      {/* 错误处理流程 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">错误处理流程</h3>
        <MermaidDiagram chart={errorFlowChart} title="错误处理流程" />
      </section>

      {/* 错误类型 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">错误类型定义</h3>
        <CodeBlock code={errorTypesCode} language="typescript" title="自定义错误类" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-400 mb-2">错误类型层级</h4>
          <pre className="text-sm text-gray-300">
{`CLIError (基类)
├── APIError           - API 调用错误 (状态码、响应)
├── AuthenticationError - 认证错误 (登录失败)
├── ToolExecutionError  - 工具执行错误 (Bash、文件操作)
├── ConfigurationError  - 配置错误 (无效配置)
├── NetworkError        - 网络错误 (连接失败)
└── TimeoutError        - 超时错误 (操作超时)`}
          </pre>
        </div>
      </section>

      {/* 错误分类器 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">错误分类器</h3>
        <CodeBlock code={errorClassifierCode} language="typescript" title="错误分类逻辑" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-400 mb-2">错误类别</h4>
            <table className="w-full text-sm">
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-1"><code className="text-red-400">AUTHENTICATION</code></td>
                  <td className="py-1">认证相关</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-1"><code className="text-orange-400">RATE_LIMIT</code></td>
                  <td className="py-1">速率限制</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-1"><code className="text-yellow-400">NETWORK</code></td>
                  <td className="py-1">网络问题</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-1"><code className="text-blue-400">API</code></td>
                  <td className="py-1">API 错误</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-1"><code className="text-green-400">TOOL</code></td>
                  <td className="py-1">工具执行</td>
                </tr>
                <tr>
                  <td className="py-1"><code className="text-purple-400">CONFIGURATION</code></td>
                  <td className="py-1">配置问题</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-400 mb-2">严重程度</h4>
            <table className="w-full text-sm">
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <code>LOW</code>
                  </td>
                  <td className="py-1">可忽略，自动恢复</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    <code>MEDIUM</code>
                  </td>
                  <td className="py-1">需要重试或确认</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                    <code>HIGH</code>
                  </td>
                  <td className="py-1">需要用户干预</td>
                </tr>
                <tr>
                  <td className="py-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <code>CRITICAL</code>
                  </td>
                  <td className="py-1">需要立即停止</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Error Boundary */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">UI 错误边界</h3>
        <CodeBlock code={errorBoundaryCode} language="typescript" title="React Error Boundary" />
      </section>

      {/* 全局处理器 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">全局错误处理</h3>
        <CodeBlock code={globalHandlerCode} language="typescript" title="全局错误处理器" />

        <HighlightBox title="处理的全局事件" color="yellow" className="mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <code className="text-yellow-300">unhandledRejection</code>
              <p className="text-gray-400">未处理的 Promise 拒绝</p>
            </div>
            <div>
              <code className="text-yellow-300">uncaughtException</code>
              <p className="text-gray-400">未捕获的同步异常</p>
            </div>
            <div>
              <code className="text-yellow-300">SIGINT</code>
              <p className="text-gray-400">Ctrl+C 中断信号</p>
            </div>
            <div>
              <code className="text-yellow-300">SIGTERM</code>
              <p className="text-gray-400">终止信号</p>
            </div>
          </div>
        </HighlightBox>
      </section>

      {/* 错误报告 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">错误报告系统</h3>
        <CodeBlock code={errorReportingCode} language="typescript" title="ErrorReporter" />
      </section>

      {/* JSON 解析 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">JSON 错误解析</h3>
        <CodeBlock code={jsonErrorParsingCode} language="typescript" title="安全 JSON 解析" />

        <HighlightBox title="自动修复的 JSON 问题" color="green" className="mt-4">
          <ul className="text-sm space-y-1">
            <li>• <strong>尾部逗号</strong>: <code>{`{"a": 1,}`}</code> → <code>{`{"a": 1}`}</code></li>
            <li>• <strong>单引号</strong>: <code>{`{'key': 'value'}`}</code> → <code>{`{"key": "value"}`}</code></li>
            <li>• <strong>未引用的键</strong>: <code>{`{key: "value"}`}</code> → <code>{`{"key": "value"}`}</code></li>
            <li>• <strong>Markdown 包装</strong>: 自动移除 <code>```json</code> 标记</li>
          </ul>
        </HighlightBox>
      </section>

      {/* 架构图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">错误处理架构</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────────┐
│                        Error Sources                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │   API   │  │  Tool   │  │ Network │  │   UI    │             │
│  │  Calls  │  │ Execute │  │ Request │  │ Render  │             │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘             │
│       │            │            │            │                   │
└───────┼────────────┼────────────┼────────────┼───────────────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Error Capture Layer                           │
│  ┌───────────────────┐  ┌───────────────────┐                    │
│  │   Try-Catch       │  │   Error Boundary  │                    │
│  │   (Sync/Async)    │  │   (React UI)      │                    │
│  └─────────┬─────────┘  └─────────┬─────────┘                    │
│            │                      │                              │
│            └──────────┬───────────┘                              │
│                       │                                          │
│  ┌────────────────────▼──────────────────────┐                   │
│  │           Global Error Handler            │                   │
│  │  unhandledRejection | uncaughtException   │                   │
│  └────────────────────┬──────────────────────┘                   │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Error Classification                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Error Classifier                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │ Category │  │ Severity │  │Recoverable│ │ Action   │  │   │
│  │  │  API     │  │  MEDIUM  │  │   true    │ │  RETRY   │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└───────────────────────┬──────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────────┐         ┌───────────────────┐
│ Recovery Handler  │         │  Error Reporter   │
│ ┌───────────────┐ │         │ ┌───────────────┐ │
│ │ Retry Logic   │ │         │ │ User Display  │ │
│ │ Fallback      │ │         │ │ File Logging  │ │
│ │ State Reset   │ │         │ │ Telemetry     │ │
│ └───────────────┘ │         │ └───────────────┘ │
└───────────────────┘         └───────────────────┘`}
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
              <li>✓ 使用自定义错误类携带上下文</li>
              <li>✓ 始终分类错误并评估严重性</li>
              <li>✓ 为用户提供有意义的错误消息</li>
              <li>✓ 记录完整的错误堆栈用于调试</li>
              <li>✓ 实现优雅的降级和恢复策略</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">避免做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✗ 忽略或吞掉错误</li>
              <li>✗ 向用户暴露技术细节</li>
              <li>✗ 使用 catch 而不处理</li>
              <li>✗ 不区分错误类型统一处理</li>
              <li>✗ 在 uncaughtException 后继续运行</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
