import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'error', label: '错误处理', description: '错误处理机制详解' },
  { id: 'retry', label: '重试回退', description: '重试策略与回退机制' },
  { id: 'error-recovery-patterns', label: '错误恢复模式', description: '常见错误恢复模式' },
  { id: 'exponential-backoff-anim', label: '指数退避动画', description: '退避算法可视化演示' },
  { id: 'checkpointing', label: '检查点恢复', description: '状态检查点与恢复' },
  { id: 'loop-detect', label: '循环检测', description: '循环检测与中断机制' },
];

export function ErrorRecoveryDecisionTree() {
  const mainDecisionTree = `
flowchart TB
    Error["错误发生"] --> Classify{错误分类}

    Classify --> Network["网络错误"]
    Classify --> API["API 错误"]
    Classify --> Tool["工具执行错误"]
    Classify --> System["系统错误"]

    Network --> NetRetry{可重试?}
    NetRetry -->|是| NetBackoff["指数退避重试"]
    NetRetry -->|否| NetFallback["切换端点/提供商"]

    API --> APICode{HTTP 状态码}
    APICode -->|429| RateLimit["速率限制处理"]
    APICode -->|500-503| ServerError["服务器错误处理"]
    APICode -->|401/403| AuthError["认证错误处理"]
    APICode -->|400| ClientError["客户端错误处理"]

    Tool --> ToolType{错误类型}
    ToolType -->|超时| ToolTimeout["超时处理"]
    ToolType -->|权限| ToolPermission["权限错误处理"]
    ToolType -->|不存在| ToolNotFound["资源不存在处理"]

    System --> SysType{系统类型}
    SysType -->|OOM| Memory["内存溢出处理"]
    SysType -->|磁盘| Disk["磁盘空间处理"]
    SysType -->|进程| Process["进程错误处理"]

    NetBackoff --> Success{成功?}
    RateLimit --> Success
    ServerError --> Success
    ToolTimeout --> Success

    Success -->|是| Resume["恢复执行"]
    Success -->|否| Escalate["上报用户"]

    style Error fill:#ef4444,color:#fff
    style Resume fill:#22c55e,color:#fff
    style Escalate fill:#f59e0b,color:#000
`;

  const retryDecisionTree = `
flowchart TB
    Start["重试决策"] --> Check1{已重试次数}

    Check1 -->|< maxRetries| Check2{错误类型}
    Check1 -->|>= maxRetries| GiveUp["放弃重试"]

    Check2 -->|瞬态| Retry["执行重试"]
    Check2 -->|永久| GiveUp

    Retry --> Delay["计算延迟"]
    Delay --> Wait["等待"]
    Wait --> Execute["重新执行"]

    Execute --> Result{结果}
    Result -->|成功| Done["完成"]
    Result -->|失败| Start

    GiveUp --> Fallback{有降级方案?}
    Fallback -->|是| UseFallback["使用降级"]
    Fallback -->|否| Report["报告错误"]

    style Done fill:#22c55e,color:#fff
    style GiveUp fill:#ef4444,color:#fff
    style UseFallback fill:#f59e0b,color:#000
`;

  const apiErrorTree = `
flowchart TB
    APIError["API 错误"] --> Code{HTTP 状态码}

    Code -->|429| Rate["速率限制"]
    Rate --> RateAction["等待 Retry-After<br/>或指数退避"]

    Code -->|500| Server500["服务器错误"]
    Server500 --> Server500Action["立即重试 1 次<br/>然后指数退避"]

    Code -->|502/503| ServerDown["服务不可用"]
    ServerDown --> ServerDownAction["长间隔重试<br/>最多 3 次"]

    Code -->|504| Timeout["网关超时"]
    Timeout --> TimeoutAction["减少请求大小<br/>或切换模型"]

    Code -->|401| Auth["认证失败"]
    Auth --> AuthAction["刷新 Token<br/>重新登录"]

    Code -->|403| Forbidden["权限不足"]
    Forbidden --> ForbiddenAction["检查 API Key<br/>联系支持"]

    Code -->|400| BadRequest["请求错误"]
    BadRequest --> BadAction["检查请求格式<br/>不重试"]

    Code -->|其他| Unknown["未知错误"]
    Unknown --> UnknownAction["记录日志<br/>报告用户"]

    style Rate fill:#f59e0b,color:#000
    style Server500 fill:#ef4444,color:#fff
    style Auth fill:#8b5cf6,color:#fff
`;

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🌳</span>
          <h1 className="text-3xl font-bold text-white">Error Recovery 决策树</h1>
        </div>
        <p className="text-gray-300 text-lg">
          系统化的错误恢复决策流程，从错误分类到恢复策略的完整指南
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-red-500/30 rounded-full text-sm text-red-300">错误分类</span>
          <span className="px-3 py-1 bg-orange-500/30 rounded-full text-sm text-orange-300">重试策略</span>
          <span className="px-3 py-1 bg-yellow-500/30 rounded-full text-sm text-yellow-300">降级方案</span>
        </div>
      </div>

      {/* 主决策树 */}
      <Layer title="错误恢复主决策树" icon="🌳">
        <MermaidDiagram chart={mainDecisionTree} title="错误分类与处理流程" />
      </Layer>

      {/* 错误分类 */}
      <Layer title="错误分类详解" icon="📋">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="网络错误" icon="🌐" variant="blue">
            <ul className="space-y-1 text-sm">
              <li><code>ECONNREFUSED</code> - 连接被拒绝</li>
              <li><code>ETIMEDOUT</code> - 连接超时</li>
              <li><code>ENOTFOUND</code> - DNS 解析失败</li>
              <li><code>ECONNRESET</code> - 连接被重置</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="API 错误" icon="🔌" variant="purple">
            <ul className="space-y-1 text-sm">
              <li><code>429</code> - 速率限制</li>
              <li><code>500-503</code> - 服务器错误</li>
              <li><code>401/403</code> - 认证/授权错误</li>
              <li><code>400</code> - 请求格式错误</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="工具执行错误" icon="🔧" variant="orange">
            <ul className="space-y-1 text-sm">
              <li>命令超时</li>
              <li>权限不足</li>
              <li>资源不存在</li>
              <li>沙箱违规</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="系统错误" icon="💻" variant="red">
            <ul className="space-y-1 text-sm">
              <li>内存溢出 (OOM)</li>
              <li>磁盘空间不足</li>
              <li>进程崩溃</li>
              <li>文件句柄耗尽</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* 重试决策 */}
      <Layer title="重试决策树" icon="🔄">
        <MermaidDiagram chart={retryDecisionTree} title="重试策略决策" />

        <CodeBlock
          title="指数退避实现"
          code={`interface RetryConfig {
  maxRetries: number;      // 最大重试次数 (默认 3)
  baseDelay: number;       // 基础延迟 (默认 1000ms)
  maxDelay: number;        // 最大延迟 (默认 30000ms)
  backoffFactor: number;   // 退避因子 (默认 2)
  jitter: boolean;         // 是否添加抖动 (默认 true)
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  // 指数退避
  let delay = config.baseDelay * Math.pow(config.backoffFactor, attempt);

  // 限制最大延迟
  delay = Math.min(delay, config.maxDelay);

  // 添加随机抖动 (±25%)
  if (config.jitter) {
    const jitterRange = delay * 0.25;
    delay += (Math.random() - 0.5) * 2 * jitterRange;
  }

  return Math.floor(delay);
}

// 示例延迟序列: 1s, 2s, 4s, 8s, 16s (带抖动)`}
        />
      </Layer>

      {/* API 错误处理 */}
      <Layer title="API 错误处理决策树" icon="🔌">
        <MermaidDiagram chart={apiErrorTree} title="API 错误码处理" />
      </Layer>

      {/* 恢复策略表 */}
      <Layer title="恢复策略速查表" icon="📊">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 px-3">错误类型</th>
                <th className="text-left py-2 px-3">可重试</th>
                <th className="text-left py-2 px-3">重试策略</th>
                <th className="text-left py-2 px-3">降级方案</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">网络超时</td>
                <td className="py-2 px-3 text-green-400">✓</td>
                <td className="py-2 px-3">指数退避, 最多 3 次</td>
                <td className="py-2 px-3">切换网络/代理</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">429 速率限制</td>
                <td className="py-2 px-3 text-green-400">✓</td>
                <td className="py-2 px-3">遵守 Retry-After</td>
                <td className="py-2 px-3">切换 API Key</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">500 服务器错误</td>
                <td className="py-2 px-3 text-green-400">✓</td>
                <td className="py-2 px-3">立即重试 1 次</td>
                <td className="py-2 px-3">切换厂商</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">401 认证失败</td>
                <td className="py-2 px-3 text-yellow-400">△</td>
                <td className="py-2 px-3">刷新 Token 后重试</td>
                <td className="py-2 px-3">提示重新登录</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">400 请求错误</td>
                <td className="py-2 px-3 text-red-400">✗</td>
                <td className="py-2 px-3">不重试</td>
                <td className="py-2 px-3">修复请求后重试</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">工具超时</td>
                <td className="py-2 px-3 text-yellow-400">△</td>
                <td className="py-2 px-3">增加超时后重试</td>
                <td className="py-2 px-3">拆分任务</td>
              </tr>
              <tr>
                <td className="py-2 px-3">OOM</td>
                <td className="py-2 px-3 text-red-400">✗</td>
                <td className="py-2 px-3">不重试</td>
                <td className="py-2 px-3">压缩上下文</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 实现示例 */}
      <Layer title="错误恢复实现示例" icon="💻">
        <CodeBlock
          title="统一错误处理器"
          code={`class ErrorRecoveryHandler {
  async handleError(error: Error, context: ExecutionContext): Promise<RecoveryResult> {
    const classified = this.classifyError(error);

    switch (classified.category) {
      case 'network':
        return this.handleNetworkError(error, context);

      case 'api':
        return this.handleAPIError(error, context);

      case 'tool':
        return this.handleToolError(error, context);

      case 'system':
        return this.handleSystemError(error, context);

      default:
        return { action: 'escalate', reason: 'Unknown error type' };
    }
  }

  private async handleAPIError(error: APIError, context: ExecutionContext): Promise<RecoveryResult> {
    const { statusCode } = error;

    if (statusCode === 429) {
      const retryAfter = error.headers?.['retry-after'] ?? 60;
      return {
        action: 'retry',
        delay: retryAfter * 1000,
        reason: 'Rate limited',
      };
    }

    if (statusCode >= 500 && statusCode < 600) {
      if (context.retryCount < 3) {
        return {
          action: 'retry',
          delay: calculateBackoff(context.retryCount),
          reason: 'Server error',
        };
      }

      if (context.fallbackProvider) {
        return {
          action: 'fallback',
          provider: context.fallbackProvider,
          reason: 'Server unavailable',
        };
      }
    }

    return { action: 'escalate', reason: \`API error: \${statusCode}\` };
  }
}`}
        />
      </Layer>

      {/* 部分成功补偿模式 */}
      <Layer title="部分成功补偿模式" icon="🔧">
        <div className="space-y-4">
          <p className="text-gray-300">
            当操作「部分成功」时（部分步骤完成，部分失败），需要特殊的补偿策略：
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">场景</th>
                  <th className="text-left py-2 px-3">成功部分</th>
                  <th className="text-left py-2 px-3">失败部分</th>
                  <th className="text-left py-2 px-3">补偿策略</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-orange-400">多文件编辑</td>
                  <td className="py-2 px-3 text-green-400">file1.ts, file2.ts 已写入</td>
                  <td className="py-2 px-3 text-red-400">file3.ts 写入失败</td>
                  <td className="py-2 px-3">使用 GitService 回滚到 checkpoint</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-orange-400">工具+Diff</td>
                  <td className="py-2 px-3 text-green-400">命令执行成功</td>
                  <td className="py-2 px-3 text-red-400">Diff 应用失败</td>
                  <td className="py-2 px-3">保留命令结果，提示用户手动应用</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-orange-400">API+日志</td>
                  <td className="py-2 px-3 text-green-400">API 调用成功</td>
                  <td className="py-2 px-3 text-red-400">日志写入失败</td>
                  <td className="py-2 px-3">继续流程，异步重试日志</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-orange-400">写入+UI</td>
                  <td className="py-2 px-3 text-green-400">文件已写入</td>
                  <td className="py-2 px-3 text-red-400">UI 更新失败</td>
                  <td className="py-2 px-3">发送 refresh 事件，不回滚</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-orange-400">批量操作</td>
                  <td className="py-2 px-3 text-green-400">5/10 项成功</td>
                  <td className="py-2 px-3 text-red-400">5/10 项失败</td>
                  <td className="py-2 px-3">报告详细结果，允许选择性重试</td>
                </tr>
              </tbody>
            </table>
          </div>

          <MermaidDiagram
            title="部分成功决策树"
            chart={`
flowchart TB
    PartialSuccess[部分成功] --> Assess{评估影响}

    Assess -->|可回滚| Rollback{需要回滚?}
    Assess -->|不可回滚| Compensate[补偿处理]

    Rollback -->|是| UseCheckpoint[使用 GitService 回滚]
    Rollback -->|否| KeepPartial[保留已完成部分]

    UseCheckpoint --> ReportRollback[报告已回滚]
    KeepPartial --> ReportPartial[报告部分完成]
    Compensate --> ReportCompensate[报告补偿结果]

    ReportRollback --> UserDecision{用户决策}
    ReportPartial --> UserDecision
    ReportCompensate --> UserDecision

    UserDecision -->|重试| RetryFailed[仅重试失败部分]
    UserDecision -->|放弃| Abort[中止操作]
    UserDecision -->|继续| Continue[继续后续操作]

    style PartialSuccess fill:#f59e0b,color:#000
    style UserDecision fill:#22d3ee,color:#000
`}
          />

          <CodeBlock
            title="部分成功处理实现"
            code={`interface PartialSuccessResult {
  succeeded: OperationResult[];
  failed: OperationResult[];
  compensationApplied: boolean;
}

async function handlePartialSuccess(
  results: OperationResult[],
  context: ExecutionContext
): Promise<RecoveryAction> {
  const succeeded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  // 场景1: 文件操作 - 使用 checkpoint 回滚
  if (context.operationType === 'file_edit' && context.checkpoint) {
    await gitService.restoreProjectFromSnapshot(context.checkpoint);
    return {
      action: 'rollback_complete',
      message: \`已回滚 \${succeeded.length} 个成功的操作\`,
      retryable: true,
    };
  }

  // 场景2: 批量操作 - 保留成功部分
  if (context.operationType === 'batch') {
    return {
      action: 'partial_complete',
      succeeded: succeeded.map(r => r.target),
      failed: failed.map(r => ({ target: r.target, error: r.error })),
      retryable: true,
      retryScope: 'failed_only',
    };
  }

  // 场景3: 关键操作失败 - 全部回滚
  const criticalFailed = failed.some(r => r.critical);
  if (criticalFailed) {
    // 补偿已成功的操作
    for (const op of succeeded) {
      await compensate(op);
    }
    return {
      action: 'compensated',
      message: '关键操作失败，已补偿所有操作',
      retryable: false,
    };
  }

  // 默认：报告并等待用户决策
  return {
    action: 'user_decision_required',
    context: { succeeded, failed },
  };
}`}
          />
        </div>
      </Layer>

      {/* 重试判定标准 */}
      <Layer title="重试判定标准" icon="🔄">
        <div className="space-y-4">
          <p className="text-gray-300">
            判断操作是否可重试，需要考虑幂等性和副作用：
          </p>

          <HighlightBox title="核心判定原则" icon="⚖️" variant="blue">
            <div className="space-y-2 text-sm">
              <p><strong>可重试 = 幂等 ∧ (无副作用 ∨ 副作用可逆)</strong></p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong>幂等</strong>：多次执行结果相同</li>
                <li><strong>无副作用</strong>：不改变外部状态</li>
                <li><strong>副作用可逆</strong>：可以撤销/补偿</li>
              </ul>
            </div>
          </HighlightBox>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">操作类型</th>
                  <th className="text-left py-2 px-3">幂等性</th>
                  <th className="text-left py-2 px-3">副作用</th>
                  <th className="text-left py-2 px-3">可重试</th>
                  <th className="text-left py-2 px-3">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">read_file</td>
                  <td className="py-2 px-3 text-green-400">✓ 幂等</td>
                  <td className="py-2 px-3 text-green-400">无</td>
                  <td className="py-2 px-3 text-green-400">✓ 安全</td>
                  <td className="py-2 px-3">任意次数重试</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">write_file</td>
                  <td className="py-2 px-3 text-green-400">✓ 幂等</td>
                  <td className="py-2 px-3 text-yellow-400">可逆</td>
                  <td className="py-2 px-3 text-green-400">✓ 安全</td>
                  <td className="py-2 px-3">有 checkpoint 可回滚</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">replace</td>
                  <td className="py-2 px-3 text-yellow-400">△ 条件</td>
                  <td className="py-2 px-3 text-yellow-400">可逆</td>
                  <td className="py-2 px-3 text-yellow-400">△ 需验证</td>
                  <td className="py-2 px-3">需确认 old_string 仍匹配</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">run_shell_command（只读）</td>
                  <td className="py-2 px-3 text-green-400">✓ 幂等</td>
                  <td className="py-2 px-3 text-green-400">无</td>
                  <td className="py-2 px-3 text-green-400">✓ 安全</td>
                  <td className="py-2 px-3">如 ls, cat, grep</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">run_shell_command（写入）</td>
                  <td className="py-2 px-3 text-red-400">✗ 非幂等</td>
                  <td className="py-2 px-3 text-red-400">不可逆</td>
                  <td className="py-2 px-3 text-red-400">✗ 危险</td>
                  <td className="py-2 px-3">如 rm, mv, echo {'>>'}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">API 查询</td>
                  <td className="py-2 px-3 text-green-400">✓ 幂等</td>
                  <td className="py-2 px-3 text-green-400">无</td>
                  <td className="py-2 px-3 text-green-400">✓ 安全</td>
                  <td className="py-2 px-3">GET 请求</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">API 创建</td>
                  <td className="py-2 px-3 text-red-400">✗ 非幂等</td>
                  <td className="py-2 px-3 text-red-400">扣费</td>
                  <td className="py-2 px-3 text-red-400">✗ 危险</td>
                  <td className="py-2 px-3">POST 会创建重复资源</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">AI 生成</td>
                  <td className="py-2 px-3 text-yellow-400">△ 非确定</td>
                  <td className="py-2 px-3 text-orange-400">扣费</td>
                  <td className="py-2 px-3 text-yellow-400">△ 可重试</td>
                  <td className="py-2 px-3">结果可能不同，会扣费</td>
                </tr>
              </tbody>
            </table>
          </div>

          <CodeBlock
            title="重试判定实现"
            code={`interface RetryabilityCheck {
  retryable: boolean;
  reason: string;
  requiresConfirmation: boolean;
  sideEffects: SideEffect[];
}

function checkRetryability(operation: Operation): RetryabilityCheck {
  // 1. 检查幂等性
  const isIdempotent = checkIdempotency(operation);

  // 2. 检查副作用
  const sideEffects = detectSideEffects(operation);
  const hasIrreversibleEffects = sideEffects.some(e => !e.reversible);

  // 3. 检查是否会产生费用
  const hasCostImplication = operation.type === 'api_call' ||
                             operation.type === 'ai_generation';

  // 决策逻辑
  if (!isIdempotent && hasIrreversibleEffects) {
    return {
      retryable: false,
      reason: '非幂等操作且有不可逆副作用',
      requiresConfirmation: false,
      sideEffects,
    };
  }

  if (hasCostImplication) {
    return {
      retryable: true,
      reason: '可重试，但会产生额外费用',
      requiresConfirmation: true,
      sideEffects,
    };
  }

  if (!isIdempotent) {
    return {
      retryable: true,
      reason: '非幂等但可补偿',
      requiresConfirmation: true,
      sideEffects,
    };
  }

  return {
    retryable: true,
    reason: '幂等操作，安全重试',
    requiresConfirmation: false,
    sideEffects: [],
  };
}

// 副作用分类
type SideEffect = {
  type: 'file_write' | 'network' | 'process' | 'cost' | 'external_state';
  reversible: boolean;
  description: string;
};`}
          />

          <MermaidDiagram
            title="重试判定决策树"
            chart={`
flowchart TB
    Start[操作失败] --> Idempotent{幂等?}

    Idempotent -->|是| SideEffect1{有副作用?}
    Idempotent -->|否| Compensable{可补偿?}

    SideEffect1 -->|无| SafeRetry[安全重试]
    SideEffect1 -->|有| Reversible1{副作用可逆?}

    Reversible1 -->|是| SafeRetry
    Reversible1 -->|否| NoRetry[不可重试]

    Compensable -->|是| ConfirmRetry[确认后重试]
    Compensable -->|否| Cost{产生费用?}

    Cost -->|是| CostRetry[警告费用后重试]
    Cost -->|否| NoRetry

    SafeRetry --> Execute[执行重试]
    ConfirmRetry --> Execute
    CostRetry --> Execute
    NoRetry --> UserAction[等待用户处理]

    style SafeRetry fill:#4ade80,color:#000
    style NoRetry fill:#ef4444,color:#fff
    style ConfirmRetry fill:#f59e0b,color:#000
`}
          />
        </div>
      </Layer>

      {/* 相关页面 */}
      <RelatedPages pages={relatedPages} />
    </div>
  );
}
