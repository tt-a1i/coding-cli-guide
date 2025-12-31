import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages } from '../components/RelatedPages';

function Introduction({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">
            错误处理导读
          </span>
        </div>
        <span
          className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">
              🎯 错误处理目标
            </h4>
            <p className="text-[var(--text-secondary)] text-sm">
              CLI 的错误处理系统旨在：<strong>分类错误</strong>（可恢复 vs 不可恢复）、
              <strong>尝试恢复</strong>（重试、回退）、<strong>优雅降级</strong>（用户通知、日志记录）。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">
              🔧 错误类型层次
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--terminal-green)]">CLIError</div>
                <div className="text-[10px] text-[var(--text-muted)]">基础类</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--cyber-blue)]">APIError</div>
                <div className="text-[10px] text-[var(--text-muted)]">网络错误</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--amber)]">ToolError</div>
                <div className="text-[10px] text-[var(--text-muted)]">工具失败</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--purple)]">AuthError</div>
                <div className="text-[10px] text-[var(--text-muted)]">认证失败</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">
              🔄 可恢复错误
            </h4>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1">
              <li>• <strong>429 Rate Limit</strong> - 等待后重试</li>
              <li>• <strong>500/502/503/504</strong> - 服务端临时错误，可重试</li>
              <li>• <strong>工具执行失败</strong> - 通常可重试或回退</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">📊 关键数字</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--terminal-green)]">6+</div>
                <div className="text-xs text-[var(--text-muted)]">错误类型</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--cyber-blue)]">3</div>
                <div className="text-xs text-[var(--text-muted)]">最大重试</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--amber)]">指数</div>
                <div className="text-xs text-[var(--text-muted)]">退避策略</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--purple)]">✓</div>
                <div className="text-xs text-[var(--text-muted)]">遥测集成</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorHandling() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);
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

  const errorRecoveryDecisionTree = `flowchart TD
    E["❌ 错误发生"]
    C1{"错误类型?"}

    %% API 错误分支
    API["API 错误"]
    API_CODE{"状态码?"}
    API_401["401/403"]
    API_429["429 限流"]
    API_5XX["5xx 服务端"]

    %% 网络错误分支
    NET["网络错误"]
    NET_RETRY{"重试次数 < 3?"}

    %% 工具错误分支
    TOOL["工具错误"]
    TOOL_AI["返回给 AI"]

    %% 配置错误分支
    CONFIG["配置错误"]

    %% 恢复动作
    REAUTH["🔐 提示重新认证"]
    BACKOFF["⏱️ 指数退避重试"]
    FALLBACK["🔄 模型回退"]
    RETRY["🔁 重试请求"]
    SHOW_ERR["📋 显示修复指南"]
    AI_DECIDE["🤖 AI 重新决策"]
    EXIT["🚪 保存状态退出"]

    E --> C1
    C1 -->|"APIError"| API
    C1 -->|"NetworkError"| NET
    C1 -->|"ToolError"| TOOL
    C1 -->|"ConfigError"| CONFIG
    C1 -->|"其他"| EXIT

    API --> API_CODE
    API_CODE -->|"401/403"| API_401
    API_CODE -->|"429"| API_429
    API_CODE -->|"5xx"| API_5XX

    API_401 --> REAUTH
    API_429 --> BACKOFF
    API_5XX --> FALLBACK

    NET --> NET_RETRY
    NET_RETRY -->|"是"| RETRY
    NET_RETRY -->|"否"| EXIT

    TOOL --> TOOL_AI
    TOOL_AI --> AI_DECIDE

    CONFIG --> SHOW_ERR

    BACKOFF -.->|"等待后"| RETRY
    FALLBACK -.->|"切换模型"| RETRY

    style E fill:#ef4444,color:#fff
    style REAUTH fill:#f59e0b,color:#000
    style BACKOFF fill:#22c55e,color:#000
    style FALLBACK fill:#3b82f6,color:#fff
    style RETRY fill:#22c55e,color:#000
    style AI_DECIDE fill:#8b5cf6,color:#fff
    style EXIT fill:#6b7280,color:#fff`;

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
      .gemini,
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
            https://github.com/google/generative-ai-cli/issues
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
      <Introduction
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
      />

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
├── ToolExecutionError  - 工具执行错误 (Shell、文件操作)
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

      {/* 失败场景速查表 */}
      <section className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">失败场景速查表</h3>
        <p className="text-gray-400 text-sm mb-4">
          常见失败场景的症状、原因和恢复策略一览：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700 text-gray-400">
                <th className="py-3 px-2 w-[15%]">场景</th>
                <th className="py-3 px-2 w-[20%]">症状</th>
                <th className="py-3 px-2 w-[25%]">可能原因</th>
                <th className="py-3 px-2 w-[25%]">恢复策略</th>
                <th className="py-3 px-2 w-[15%]">源码位置</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {/* API 错误 */}
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">401</span>
                  <div className="text-xs text-gray-500 mt-1">认证失败</div>
                </td>
                <td className="py-3 px-2 text-xs">Token 无效或过期</td>
                <td className="py-3 px-2 text-xs">API Key 错误、OAuth Token 过期、环境变量未设置</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-amber-400">重新登录</code>：
                  <code className="block mt-1 text-gray-400">gemini logout && gemini</code>
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/errors</td>
              </tr>

              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-xs">429</span>
                  <div className="text-xs text-gray-500 mt-1">限流</div>
                </td>
                <td className="py-3 px-2 text-xs">请求过于频繁</td>
                <td className="py-3 px-2 text-xs">超出 API 配额、短时间内请求过多</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-green-400">自动重试</code>：
                  指数退避等待 (1s, 2s, 4s...)
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/core/retry.ts</td>
              </tr>

              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs">500</span>
                  <div className="text-xs text-gray-500 mt-1">服务端错误</div>
                </td>
                <td className="py-3 px-2 text-xs">服务暂时不可用</td>
                <td className="py-3 px-2 text-xs">后端部署、负载过高、临时故障</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-green-400">自动重试</code>：
                  最多 3 次，可回退模型
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/core/fallback.ts</td>
              </tr>

              {/* 网络错误 */}
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">ETIMEDOUT</span>
                  <div className="text-xs text-gray-500 mt-1">连接超时</div>
                </td>
                <td className="py-3 px-2 text-xs">请求无响应</td>
                <td className="py-3 px-2 text-xs">网络不稳定、代理配置错误、DNS 解析失败</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-green-400">自动重试</code>：
                  检查网络设置
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/errors/network.ts</td>
              </tr>

              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">ECONNREFUSED</span>
                  <div className="text-xs text-gray-500 mt-1">连接拒绝</div>
                </td>
                <td className="py-3 px-2 text-xs">无法连接服务</td>
                <td className="py-3 px-2 text-xs">服务未启动、端口错误、防火墙阻止</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-amber-400">检查配置</code>：
                  验证 BASE_URL 设置
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/errors/network.ts</td>
              </tr>

              {/* 工具错误 */}
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">TOOL</span>
                  <div className="text-xs text-gray-500 mt-1">Bash 失败</div>
                </td>
                <td className="py-3 px-2 text-xs">命令执行返回非零</td>
                <td className="py-3 px-2 text-xs">命令不存在、权限不足、语法错误</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-green-400">AI 自动处理</code>：
                  错误返回给模型重新决策
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/tools/bash.ts</td>
              </tr>

              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">TOOL</span>
                  <div className="text-xs text-gray-500 mt-1">Read 失败</div>
                </td>
                <td className="py-3 px-2 text-xs">无法读取文件</td>
                <td className="py-3 px-2 text-xs">文件不存在、权限不足、路径错误</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-green-400">AI 自动处理</code>：
                  提示文件不存在
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/tools/read.ts</td>
              </tr>

              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">TOOL</span>
                  <div className="text-xs text-gray-500 mt-1">Edit 失败</div>
                </td>
                <td className="py-3 px-2 text-xs">old_string 未找到</td>
                <td className="py-3 px-2 text-xs">文件已被修改、匹配字符串错误、编码问题</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-green-400">AI 自动处理</code>：
                  重新读取文件后重试
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/tools/edit.ts</td>
              </tr>

              {/* 配置错误 */}
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">CONFIG</span>
                  <div className="text-xs text-gray-500 mt-1">配置无效</div>
                </td>
                <td className="py-3 px-2 text-xs">启动时报错</td>
                <td className="py-3 px-2 text-xs">settings.json 语法错误、无效的配置值</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-amber-400">手动修复</code>：
                  检查 ~/.gemini/settings.json
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">cli/src/config</td>
              </tr>

              {/* 上下文错误 */}
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-pink-900/30 text-pink-400 rounded text-xs">CONTEXT</span>
                  <div className="text-xs text-gray-500 mt-1">上下文溢出</div>
                </td>
                <td className="py-3 px-2 text-xs">消息被截断</td>
                <td className="py-3 px-2 text-xs">对话过长、文件内容过大</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-green-400">自动压缩</code>：
                  触发历史压缩，保留最近对话
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/core/compression.ts</td>
              </tr>

              {/* MCP 错误 */}
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-indigo-900/30 text-indigo-400 rounded text-xs">MCP</span>
                  <div className="text-xs text-gray-500 mt-1">服务启动失败</div>
                </td>
                <td className="py-3 px-2 text-xs">MCP 工具不可用</td>
                <td className="py-3 px-2 text-xs">命令不存在、依赖缺失、配置错误</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-amber-400">降级运行</code>：
                  禁用该 MCP 服务器继续
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/mcp</td>
              </tr>

              {/* IDE 错误 */}
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-teal-900/30 text-teal-400 rounded text-xs">IDE</span>
                  <div className="text-xs text-gray-500 mt-1">连接失败</div>
                </td>
                <td className="py-3 px-2 text-xs">无法使用 Native Diff</td>
                <td className="py-3 px-2 text-xs">扩展未安装、端口冲突、目录不匹配</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-amber-400">降级运行</code>：
                  使用 CLI 内置 Diff
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">cli/src/ide</td>
              </tr>

              {/* 沙箱错误 */}
              <tr>
                <td className="py-3 px-2">
                  <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">SANDBOX</span>
                  <div className="text-xs text-gray-500 mt-1">沙箱启动失败</div>
                </td>
                <td className="py-3 px-2 text-xs">容器无法创建</td>
                <td className="py-3 px-2 text-xs">Docker 未安装、权限不足、镜像拉取失败</td>
                <td className="py-3 px-2 text-xs">
                  <code className="text-amber-400">提示用户</code>：
                  检查 Docker 环境
                </td>
                <td className="py-3 px-2 text-xs font-mono text-cyan-400">core/src/sandbox</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">自动恢复</h4>
            <p className="text-xs text-gray-400">
              429、500、网络超时等可恢复错误，系统自动指数退避重试，最多 3 次。
            </p>
          </div>
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
            <h4 className="text-amber-400 font-semibold mb-2">优雅降级</h4>
            <p className="text-xs text-gray-400">
              MCP、IDE 等可选功能失败时，禁用该功能继续运行核心流程。
            </p>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">用户干预</h4>
            <p className="text-xs text-gray-400">
              401 认证、配置错误等需要用户修复后重试。
            </p>
          </div>
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

      {/* 为什么这样设计错误分类系统 */}
      <section className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">💡 为什么这样设计错误分类系统？</h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-2">1. 为什么使用自定义错误类而非原生 Error？</h4>
            <div className="bg-black/30 rounded-lg p-4 text-sm">
              <p className="text-gray-300 mb-3">
                原生 <code className="text-red-400">Error</code> 只有 <code>message</code> 和 <code>stack</code>，
                无法携带结构化的错误上下文。自定义错误类解决了以下问题：
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-red-400 font-semibold mb-1">原生 Error 的不足</div>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>• 无法区分错误类型（网络？认证？工具？）</li>
                    <li>• 无法判断是否可恢复</li>
                    <li>• 无法携带 HTTP 状态码等元数据</li>
                    <li>• 无法序列化为 JSON 用于遥测</li>
                  </ul>
                </div>
                <div>
                  <div className="text-green-400 font-semibold mb-1">CLIError 解决方案</div>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>• <code>code</code> 字段标识错误类型</li>
                    <li>• <code>recoverable</code> 布尔值判断恢复可能</li>
                    <li>• <code>metadata</code> 携带任意上下文</li>
                    <li>• <code>toJSON()</code> 支持遥测序列化</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-2">2. 为什么 API 错误默认判断可恢复性？</h4>
            <div className="bg-black/30 rounded-lg p-4 text-sm">
              <p className="text-gray-300 mb-2">
                <code className="text-cyan-400">APIError</code> 构造函数中根据状态码自动设置 <code>recoverable</code>：
              </p>
              <CodeBlock code={`// [429, 500, 502, 503, 504].includes(statusCode) → recoverable = true
// 其他状态码 → recoverable = false

// 为什么这些是可恢复的？
// 429: 限流 → 等待后重试即可
// 500: 服务端临时错误 → 可能短暂故障
// 502: 网关错误 → 上游服务可能恢复
// 503: 服务不可用 → 通常是维护或过载
// 504: 网关超时 → 网络波动导致

// 为什么 401/403 不可恢复？
// 401: 认证失败 → 需要重新登录，自动重试无意义
// 403: 权限不足 → 配置问题，需要人工处理`} language="typescript" />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-2">3. 为什么用 ErrorBoundary 包裹 UI？</h4>
            <div className="bg-black/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="mb-2">React/Ink 的渲染错误会导致整个应用崩溃。ErrorBoundary 提供了：</p>
              <ul className="space-y-1 text-gray-400">
                <li>• <strong className="text-white">隔离性</strong>：UI 错误不会影响核心逻辑</li>
                <li>• <strong className="text-white">优雅降级</strong>：显示回退 UI 而非白屏</li>
                <li>• <strong className="text-white">错误上报</strong>：通过 componentDidCatch 记录遥测</li>
                <li>• <strong className="text-white">可恢复性</strong>：用户可以继续使用其他功能</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-200 mb-2">4. 为什么需要全局错误处理器？</h4>
            <div className="bg-black/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="mb-2">即使有完善的 try-catch，仍有错误可能逃逸：</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="text-left py-2">场景</th>
                    <th className="text-left py-2">逃逸原因</th>
                    <th className="text-left py-2">全局处理器应对</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="py-2">unhandledRejection</td>
                    <td className="py-2">Promise 未 await 或缺少 .catch()</td>
                    <td className="py-2">记录遥测 + 优雅退出</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2">uncaughtException</td>
                    <td className="py-2">同步代码中未捕获的 throw</td>
                    <td className="py-2">记录遥测 + 立即退出</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2">SIGINT</td>
                    <td className="py-2">用户按 Ctrl+C</td>
                    <td className="py-2">保存状态 + 清理资源</td>
                  </tr>
                  <tr>
                    <td className="py-2">SIGTERM</td>
                    <td className="py-2">系统终止信号</td>
                    <td className="py-2">保存状态 + 清理资源</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 错误恢复决策树 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">错误恢复决策树</h3>
        <p className="text-gray-400 text-sm mb-4">
          当错误发生时，系统按照以下决策树选择恢复策略：
        </p>

        <MermaidDiagram chart={errorRecoveryDecisionTree} title="错误恢复决策流程" />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">1</span>
              自动重试路径
            </h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• 429/5xx 错误 → 指数退避重试</li>
              <li>• 网络超时 → 最多 3 次重试</li>
              <li>• 工具执行失败 → 返回给 AI 重新决策</li>
            </ul>
          </div>

          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
            <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">2</span>
              优雅降级路径
            </h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• MCP 服务器失败 → 禁用该服务器</li>
              <li>• IDE 连接失败 → 使用内置 Diff</li>
              <li>• 模型不可用 → 回退到备选模型</li>
            </ul>
          </div>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">3</span>
              用户干预路径
            </h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• 401 认证失败 → 提示重新登录</li>
              <li>• 配置错误 → 显示修复指南</li>
              <li>• 严重错误 → 保存状态后退出</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 实战调试场景 */}
      <section className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">🔧 实战调试场景</h3>
        <p className="text-gray-400 text-sm mb-4">
          以下是开发者可能遇到的典型错误场景及其排查步骤：
        </p>

        <div className="space-y-6">
          {/* 场景1：API 调用持续失败 */}
          <div className="bg-black/30 rounded-lg p-5 border-l-4 border-red-500">
            <h4 className="text-lg font-medium text-red-400 mb-3">场景 1：API 调用持续返回 500</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">症状：</span>
                <span className="text-gray-300 ml-2">每次请求都返回 500，自动重试也失败</span>
              </div>
              <div>
                <span className="text-yellow-400 font-medium">排查步骤：</span>
                <ol className="mt-2 ml-4 space-y-1 text-gray-300 list-decimal list-inside text-xs">
                  <li>检查 <code>DEBUG=1 gemini</code> 输出，查看完整请求/响应</li>
                  <li>确认 API 端点是否可达：<code>curl -I $OPENAI_BASE_URL/models</code></li>
                  <li>检查请求体是否过大（Token 超限）</li>
                  <li>查看 <code>~/.gemini/crash-reports/</code> 是否有错误报告</li>
                  <li>检查遥测日志 <code>~/.gemini/logs/</code></li>
                </ol>
              </div>
              <div>
                <span className="text-green-400 font-medium">解决方案：</span>
                <ul className="mt-2 ml-4 space-y-1 text-gray-300 list-disc list-inside text-xs">
                  <li>如果是模型过载，等待后重试或切换模型</li>
                  <li>如果是请求过大，启用上下文压缩或清理历史</li>
                  <li>如果是端点问题，检查 <code>OPENAI_BASE_URL</code> 配置</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 场景2：工具执行无限循环 */}
          <div className="bg-black/30 rounded-lg p-5 border-l-4 border-amber-500">
            <h4 className="text-lg font-medium text-amber-400 mb-3">场景 2：工具执行陷入无限循环</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">症状：</span>
                <span className="text-gray-300 ml-2">AI 反复调用同一工具，输出重复内容</span>
              </div>
              <div>
                <span className="text-yellow-400 font-medium">排查步骤：</span>
                <ol className="mt-2 ml-4 space-y-1 text-gray-300 list-decimal list-inside text-xs">
                  <li>观察循环检测是否触发（查看是否有 "Loop detected" 警告）</li>
                  <li>检查工具返回结果是否正常（是否返回了错误导致 AI 重试）</li>
                  <li>查看消息历史，分析 AI 的决策逻辑</li>
                  <li>检查 <code>model.skipLoopDetection</code> 是否被误设为 true</li>
                </ol>
              </div>
              <div>
                <span className="text-green-400 font-medium">解决方案：</span>
                <ul className="mt-2 ml-4 space-y-1 text-gray-300 list-disc list-inside text-xs">
                  <li>按 <code>Ctrl+C</code> 中断，然后调整 prompt 或清理上下文</li>
                  <li>确保 <code>model.skipLoopDetection: false</code></li>
                  <li>如果工具返回错误，修复工具实现</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 场景3：MCP 服务器启动失败 */}
          <div className="bg-black/30 rounded-lg p-5 border-l-4 border-purple-500">
            <h4 className="text-lg font-medium text-purple-400 mb-3">场景 3：MCP 服务器启动失败</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">症状：</span>
                <span className="text-gray-300 ml-2">CLI 启动时报错 "Failed to start MCP server: xxx"</span>
              </div>
              <div>
                <span className="text-yellow-400 font-medium">排查步骤：</span>
                <ol className="mt-2 ml-4 space-y-1 text-gray-300 list-decimal list-inside text-xs">
                  <li>检查 MCP 服务器命令是否存在：<code>which npx</code> 或 <code>which node</code></li>
                  <li>手动运行 MCP 命令确认能否启动</li>
                  <li>检查 <code>.gemini/mcp.json</code> 配置是否正确</li>
                  <li>查看 <code>mcp.excluded</code> 是否包含该服务器</li>
                </ol>
              </div>
              <div>
                <span className="text-green-400 font-medium">解决方案：</span>
                <ul className="mt-2 ml-4 space-y-1 text-gray-300 list-disc list-inside text-xs">
                  <li>安装缺失的依赖：<code>npm install -g @anthropic/mcp-server-xxx</code></li>
                  <li>修正 <code>mcp.json</code> 中的命令路径</li>
                  <li>临时禁用：添加到 <code>mcp.excluded</code> 继续工作</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 场景4：会话恢复失败 */}
          <div className="bg-black/30 rounded-lg p-5 border-l-4 border-cyan-500">
            <h4 className="text-lg font-medium text-cyan-400 mb-3">场景 4：会话恢复失败</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">症状：</span>
                <span className="text-gray-300 ml-2">"Welcome Back" 列表为空或选择后报错</span>
              </div>
              <div>
                <span className="text-yellow-400 font-medium">排查步骤：</span>
                <ol className="mt-2 ml-4 space-y-1 text-gray-300 list-decimal list-inside text-xs">
                  <li>检查会话文件是否存在：<code>ls ~/.gemini/tmp/*/chats/</code></li>
                  <li>验证会话 JSON 格式：<code>cat session-xxx.json | jq .</code></li>
                  <li>检查项目哈希是否匹配当前目录</li>
                  <li>确认 <code>ui.enableWelcomeBack: true</code></li>
                </ol>
              </div>
              <div>
                <span className="text-green-400 font-medium">解决方案：</span>
                <ul className="mt-2 ml-4 space-y-1 text-gray-300 list-disc list-inside text-xs">
                  <li>如果 JSON 损坏，删除该文件并创建新会话</li>
                  <li>如果哈希不匹配，在正确的项目目录下启动</li>
                  <li>手动指定会话文件：<code>gemini --resume path/to/session.json</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 错误码速查表 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">错误码速查表</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left text-gray-400">
                <th className="py-2 px-2">错误码</th>
                <th className="py-2 px-2">错误类</th>
                <th className="py-2 px-2">可恢复</th>
                <th className="py-2 px-2">恢复策略</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2"><code className="text-red-400">API_ERROR_401</code></td>
                <td className="py-2 px-2">APIError</td>
                <td className="py-2 px-2"><span className="text-red-400">否</span></td>
                <td className="py-2 px-2">提示用户重新认证</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2"><code className="text-orange-400">API_ERROR_429</code></td>
                <td className="py-2 px-2">APIError</td>
                <td className="py-2 px-2"><span className="text-green-400">是</span></td>
                <td className="py-2 px-2">指数退避重试</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2"><code className="text-yellow-400">API_ERROR_500</code></td>
                <td className="py-2 px-2">APIError</td>
                <td className="py-2 px-2"><span className="text-green-400">是</span></td>
                <td className="py-2 px-2">重试 + 模型回退</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2"><code className="text-cyan-400">NETWORK_ERROR</code></td>
                <td className="py-2 px-2">NetworkError</td>
                <td className="py-2 px-2"><span className="text-green-400">是</span></td>
                <td className="py-2 px-2">检查网络后重试</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2"><code className="text-purple-400">TIMEOUT_ERROR</code></td>
                <td className="py-2 px-2">TimeoutError</td>
                <td className="py-2 px-2"><span className="text-green-400">是</span></td>
                <td className="py-2 px-2">增加超时或重试</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2"><code className="text-blue-400">TOOL_ERROR</code></td>
                <td className="py-2 px-2">ToolExecutionError</td>
                <td className="py-2 px-2"><span className="text-green-400">是</span></td>
                <td className="py-2 px-2">返回给 AI 重新决策</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-2"><code className="text-gray-400">CONFIG_ERROR</code></td>
                <td className="py-2 px-2">ConfigurationError</td>
                <td className="py-2 px-2"><span className="text-red-400">否</span></td>
                <td className="py-2 px-2">提示用户修复配置</td>
              </tr>
              <tr>
                <td className="py-2 px-2"><code className="text-pink-400">AUTH_ERROR</code></td>
                <td className="py-2 px-2">AuthenticationError</td>
                <td className="py-2 px-2"><span className="text-red-400">否</span></td>
                <td className="py-2 px-2">执行 logout + 重新登录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 相关页面 */}
      <RelatedPages
        title="📚 相关阅读"
        pages={[
          { id: 'error-recovery-decision-tree', label: '错误恢复决策树', description: '可视化恢复流程' },
          { id: 'retry', label: '重试与回退', description: '指数退避和模型回退策略' },
          { id: 'loop-detect', label: '循环检测', description: '防止工具调用无限循环' },
          { id: 'telemetry', label: '遥测系统', description: '错误上报和监控' },
          { id: 'session-persistence', label: '会话持久化', description: '错误后的状态恢复' },
          { id: 'sandbox', label: '沙箱系统', description: '工具执行的安全边界' },
        ]}
      />
    </div>
  );
}
