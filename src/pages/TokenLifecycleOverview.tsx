import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

export function TokenLifecycleOverview() {
  const tokenLifecycle = `
flowchart TB
    subgraph Input["用户输入"]
        UserMsg["用户消息"]
        AtFiles["@文件"]
        Images["图片"]
    end

    subgraph Estimation["Token 估算"]
        InputTokenizer["输入 Tokenizer"]
        ImageTokenizer["图像 Token 计算"]
        FileTokenizer["文件 Token 计算"]
    end

    subgraph Budget["预算管理"]
        TokenBudget["Token 预算分配"]
        ContextWindow["上下文窗口"]
        Reserved["保留空间"]
    end

    subgraph History["历史管理"]
        Compression["历史压缩"]
        Truncation["截断策略"]
        Summarization["摘要生成"]
    end

    subgraph API["API 调用"]
        Request["请求构建"]
        Streaming["流式响应"]
        Response["响应解析"]
    end

    subgraph Accounting["Token 计费"]
        UsageTracking["使用量追踪"]
        CostCalculation["成本计算"]
        Metrics["指标聚合"]
    end

    UserMsg --> InputTokenizer
    AtFiles --> FileTokenizer
    Images --> ImageTokenizer

    InputTokenizer --> TokenBudget
    FileTokenizer --> TokenBudget
    ImageTokenizer --> TokenBudget

    TokenBudget --> ContextWindow
    ContextWindow --> Reserved

    Reserved --> Compression
    Compression --> Truncation
    Truncation --> Summarization

    Summarization --> Request
    Request --> Streaming
    Streaming --> Response

    Response --> UsageTracking
    UsageTracking --> CostCalculation
    CostCalculation --> Metrics

    style TokenBudget fill:#22d3ee,color:#000
    style Compression fill:#f59e0b,color:#000
    style Metrics fill:#4ade80,color:#000
`;

  const tokenFlow = `
sequenceDiagram
    participant User as 用户
    participant CLI as CLI
    participant TM as TokenManager
    participant API as API Provider
    participant Acc as Accounting

    User->>CLI: 发送消息
    CLI->>TM: 估算输入 Token

    TM->>TM: 检查上下文窗口
    alt 超出预算
        TM->>TM: 触发历史压缩
        TM->>TM: 截断/摘要
    end

    TM-->>CLI: 返回可用预算

    CLI->>API: 发送请求
    API-->>CLI: 流式响应

    CLI->>Acc: 记录实际使用量
    Acc->>Acc: 累加到会话总量
    Acc-->>CLI: 返回计费信息

    CLI-->>User: 显示响应
`;

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🎫</span>
          <h1 className="text-3xl font-bold text-white">Token 生命周期全景</h1>
        </div>
        <p className="text-gray-300 text-lg">
          从输入估算到计费统计，Token 在系统中的完整流转路径
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-cyan-500/30 rounded-full text-sm text-cyan-300">估算</span>
          <span className="px-3 py-1 bg-blue-500/30 rounded-full text-sm text-blue-300">预算</span>
          <span className="px-3 py-1 bg-green-500/30 rounded-full text-sm text-green-300">压缩</span>
          <span className="px-3 py-1 bg-purple-500/30 rounded-full text-sm text-purple-300">计费</span>
        </div>
      </div>

      {/* 全景图 */}
      <Layer title="Token 生命周期全景" icon="🗺️">
        <MermaidDiagram chart={tokenLifecycle} title="Token 全流程" />
      </Layer>

      {/* 阶段详解 */}
      <Layer title="阶段详解" icon="📖">
        <Layer title="1. 输入估算阶段" depth={2} defaultOpen={true}>
          <div className="space-y-4">
            <p className="text-gray-300">
              在发送请求前，系统需要估算各类输入的 Token 消耗。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HighlightBox title="文本 Token" icon="📝" variant="blue">
                <ul className="space-y-1 text-sm">
                  <li>使用 tiktoken 编码</li>
                  <li>支持多种模型编码</li>
                  <li>缓存编码结果</li>
                </ul>
              </HighlightBox>

              <HighlightBox title="图像 Token" icon="🖼️" variant="green">
                <ul className="space-y-1 text-sm">
                  <li>基于图像尺寸计算</li>
                  <li>考虑 tile 分割</li>
                  <li>高/低分辨率模式</li>
                </ul>
              </HighlightBox>

              <HighlightBox title="文件 Token" icon="📄" variant="purple">
                <ul className="space-y-1 text-sm">
                  <li>文件内容 Token 化</li>
                  <li>路径和元数据开销</li>
                  <li>大文件截断策略</li>
                </ul>
              </HighlightBox>
            </div>

            <CodeBlock
              title="Token 估算示例"
              code={`// 文本 Token 估算
const textTokens = tiktoken.encode(message).length;

// 图像 Token 估算 (GPT-4V 模式)
function calculateImageTokens(width: number, height: number): number {
  const BASE_TOKENS = 85;
  const TILE_TOKENS = 170;
  const TILE_SIZE = 512;

  const tiles = Math.ceil(width / TILE_SIZE) * Math.ceil(height / TILE_SIZE);
  return BASE_TOKENS + tiles * TILE_TOKENS;
}

// 总估算
const totalInputTokens = textTokens + imageTokens + fileTokens;`}
            />
          </div>
        </Layer>

        <Layer title="2. 预算分配阶段" depth={2} defaultOpen={true}>
          <div className="space-y-4">
            <CodeBlock
              title="预算分配策略"
              code={`interface TokenBudget {
  contextWindow: number;      // 模型上下文窗口 (如 128K)
  reservedForOutput: number;  // 为输出保留的 Token
  systemPrompt: number;       // 系统提示词消耗
  tools: number;              // 工具定义消耗
  history: number;            // 历史消息消耗
  available: number;          // 当前可用于新输入

  // 计算可用空间
  available = contextWindow - reservedForOutput
              - systemPrompt - tools - history;
}`}
            />

            <HighlightBox title="预算超支处理" icon="⚠️" variant="orange">
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>触发历史压缩（移除工具调用细节）</li>
                <li>截断早期消息</li>
                <li>生成摘要替代详细历史</li>
                <li>最终强制截断确保不超限</li>
              </ol>
            </HighlightBox>
          </div>
        </Layer>

        <Layer title="3. 历史压缩阶段" depth={2} defaultOpen={true}>
          <MermaidDiagram
            title="压缩决策流程"
            chart={`
flowchart TD
    Check{历史超出预算?}
    Check -->|否| Done[保持原样]
    Check -->|是| Step1[移除工具响应详情]

    Step1 --> Check2{仍超出?}
    Check2 -->|否| Done
    Check2 -->|是| Step2[截断早期消息]

    Step2 --> Check3{仍超出?}
    Check3 -->|否| Done
    Check3 -->|是| Step3[生成摘要]

    Step3 --> Check4{仍超出?}
    Check4 -->|否| Done
    Check4 -->|是| Step4[强制截断]

    Step4 --> Done

    style Done fill:#4ade80,color:#000
`}
          />
        </Layer>

        <Layer title="4. 计费统计阶段" depth={2} defaultOpen={true}>
          <CodeBlock
            title="计费数据结构"
            code={`interface TokenUsage {
  // 单次请求
  promptTokens: number;      // 输入 Token
  completionTokens: number;  // 输出 Token
  totalTokens: number;       // 总计

  // 会话累计
  sessionPromptTokens: number;
  sessionCompletionTokens: number;
  sessionTotalTokens: number;

  // 成本计算 (示例)
  estimatedCost: {
    input: number;   // $0.01 / 1K tokens
    output: number;  // $0.03 / 1K tokens
    total: number;
  };
}`}
          />
        </Layer>
      </Layer>

      {/* 时序流程 */}
      <Layer title="请求时序流程" icon="⏱️">
        <MermaidDiagram chart={tokenFlow} title="Token 流转时序" />
      </Layer>

      {/* 关键指标 */}
      <Layer title="关键指标与监控" icon="📊">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 px-3">指标</th>
                <th className="text-left py-2 px-3">说明</th>
                <th className="text-left py-2 px-3">告警阈值</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3 font-mono text-cyan-400">context_utilization</td>
                <td className="py-2 px-3">上下文窗口使用率</td>
                <td className="py-2 px-3">&gt; 90%</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3 font-mono text-cyan-400">compression_rate</td>
                <td className="py-2 px-3">历史压缩触发率</td>
                <td className="py-2 px-3">&gt; 50%</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3 font-mono text-cyan-400">estimation_accuracy</td>
                <td className="py-2 px-3">估算准确度</td>
                <td className="py-2 px-3">&lt; 95%</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-cyan-400">cost_per_session</td>
                <td className="py-2 px-3">单次会话成本</td>
                <td className="py-2 px-3">自定义</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 流式响应对账机制 */}
      <Layer title="流式响应动态计数与对账" icon="📡">
        <div className="space-y-4">
          <p className="text-gray-300">
            流式响应中，Token 计数分为「估算」和「实际」两个阶段，最终需要对账：
          </p>

          <MermaidDiagram
            title="流式响应 Token 对账流程"
            chart={`
sequenceDiagram
    participant CLI as CLI
    participant TM as TokenManager
    participant API as API Provider
    participant Acc as Accounting

    Note over CLI,Acc: 阶段1: 请求前估算
    CLI->>TM: estimateInputTokens(messages)
    TM-->>CLI: inputEstimate = 2500

    Note over CLI,Acc: 阶段2: 流式响应中动态计数
    CLI->>API: 发送请求 (stream: true)
    loop 流式输出
        API-->>CLI: chunk (delta content)
        CLI->>TM: countStreamingTokens(chunk)
        TM->>TM: runningOutputCount += chunkTokens
    end

    Note over CLI,Acc: 阶段3: 响应结束，获取 Provider 实际值
    API-->>CLI: usage: {prompt_tokens, completion_tokens}
    CLI->>Acc: reconcile(estimate, actual)

    alt 差异 < 5%
        Acc->>Acc: 使用 actual，标记 accurate
    else 差异 >= 5%
        Acc->>Acc: 使用 actual，记录 deviation
        Acc->>TM: 调整估算参数
    end

    Acc->>Acc: updateSessionTotals()
    Acc-->>CLI: finalUsage
`}
          />

          <CodeBlock
            title="对账逻辑实现"
            code={`interface StreamingTokenState {
  // 估算值 (请求前)
  inputEstimate: number;
  outputEstimate: number;  // 基于 max_tokens

  // 流式计数 (响应中)
  streamingOutputCount: number;

  // 实际值 (响应结束后，来自 Provider)
  actualInput?: number;
  actualOutput?: number;
}

function reconcileTokenUsage(state: StreamingTokenState): TokenUsage {
  const actualInput = state.actualInput ?? state.inputEstimate;
  const actualOutput = state.actualOutput ?? state.streamingOutputCount;

  // 计算估算偏差
  const inputDeviation = Math.abs(actualInput - state.inputEstimate) / actualInput;
  const outputDeviation = Math.abs(actualOutput - state.streamingOutputCount) / actualOutput;

  // 记录偏差用于改进估算
  if (inputDeviation > 0.05) {
    telemetry.recordMetric('token_estimation_deviation', {
      type: 'input',
      deviation: inputDeviation,
    });
  }

  return {
    promptTokens: actualInput,
    completionTokens: actualOutput,
    totalTokens: actualInput + actualOutput,
    source: state.actualInput ? 'provider' : 'estimated',
  };
}`}
          />

          <HighlightBox title="关键时机" icon="⏰" variant="blue">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-3">时机</th>
                    <th className="text-left py-2 px-3">数据来源</th>
                    <th className="text-left py-2 px-3">更新内容</th>
                    <th className="text-left py-2 px-3">精度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3">请求发送前</td>
                    <td className="py-2 px-3">tiktoken 估算</td>
                    <td className="py-2 px-3">inputEstimate</td>
                    <td className="py-2 px-3 text-yellow-400">~95%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3">每个 chunk</td>
                    <td className="py-2 px-3">流式内容长度</td>
                    <td className="py-2 px-3">streamingOutputCount</td>
                    <td className="py-2 px-3 text-yellow-400">~90%</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3">响应结束</td>
                    <td className="py-2 px-3">Provider usage 字段</td>
                    <td className="py-2 px-3">actualInput/Output</td>
                    <td className="py-2 px-3 text-green-400">100%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">会话账本更新</td>
                    <td className="py-2 px-3">对账后的实际值</td>
                    <td className="py-2 px-3">sessionTotals</td>
                    <td className="py-2 px-3 text-green-400">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 超限降级策略 */}
      <Layer title="超限降级策略表" icon="⚠️">
        <div className="space-y-4">
          <p className="text-gray-300">
            当 Token 使用超出预算时，系统采取分级降级策略：
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">触发条件</th>
                  <th className="text-left py-2 px-3">降级动作</th>
                  <th className="text-left py-2 px-3">用户感知</th>
                  <th className="text-left py-2 px-3">恢复方式</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">
                    <span className="text-yellow-400">上下文 &gt; 80%</span>
                  </td>
                  <td className="py-2 px-3">压缩工具调用历史</td>
                  <td className="py-2 px-3 text-green-400">无感知</td>
                  <td className="py-2 px-3">自动</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">
                    <span className="text-orange-400">上下文 &gt; 90%</span>
                  </td>
                  <td className="py-2 px-3">截断早期消息</td>
                  <td className="py-2 px-3 text-yellow-400">轻微 - 可能遗忘早期上下文</td>
                  <td className="py-2 px-3">自动</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">
                    <span className="text-red-400">上下文 &gt; 95%</span>
                  </td>
                  <td className="py-2 px-3">生成历史摘要替代详细内容</td>
                  <td className="py-2 px-3 text-orange-400">中等 - 细节丢失</td>
                  <td className="py-2 px-3">自动 + 提示</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">
                    <span className="text-red-400">上下文 = 100%</span>
                  </td>
                  <td className="py-2 px-3">强制截断 + 切换小模型</td>
                  <td className="py-2 px-3 text-red-400">明显 - 质量下降</td>
                  <td className="py-2 px-3">需用户确认</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">
                    <span className="text-purple-400">成本超限</span>
                  </td>
                  <td className="py-2 px-3">切换到更便宜模型</td>
                  <td className="py-2 px-3 text-yellow-400">中等 - 能力变化</td>
                  <td className="py-2 px-3">需用户确认</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">
                    <span className="text-red-400">配额耗尽</span>
                  </td>
                  <td className="py-2 px-3">拒绝请求</td>
                  <td className="py-2 px-3 text-red-400">完全阻塞</td>
                  <td className="py-2 px-3">等待配额恢复/充值</td>
                </tr>
              </tbody>
            </table>
          </div>

          <CodeBlock
            title="降级策略实现"
            code={`interface DegradationConfig {
  compressionThreshold: 0.80;    // 开始压缩
  truncationThreshold: 0.90;     // 开始截断
  summarizationThreshold: 0.95;  // 生成摘要
  forceTruncateThreshold: 1.00;  // 强制截断
}

async function applyDegradation(
  usage: ContextUsage,
  config: DegradationConfig
): Promise<DegradationResult> {
  const ratio = usage.current / usage.limit;

  if (ratio <= config.compressionThreshold) {
    return { action: 'none' };
  }

  if (ratio <= config.truncationThreshold) {
    return {
      action: 'compress',
      target: 'tool_results',
      expectedSavings: estimateCompressionSavings(usage),
    };
  }

  if (ratio <= config.summarizationThreshold) {
    return {
      action: 'truncate',
      target: 'early_messages',
      keepLastN: 10,
      expectedSavings: estimateTruncationSavings(usage),
    };
  }

  if (ratio <= config.forceTruncateThreshold) {
    return {
      action: 'summarize',
      target: 'conversation_history',
      requiresApiCall: true,
      expectedSavings: estimateSummarizationSavings(usage),
    };
  }

  // 最后手段
  return {
    action: 'force_truncate_and_switch_model',
    targetModel: 'qwen-coder-fast',
    requiresConfirmation: true,
  };
}`}
          />

          <HighlightBox title="模型切换成本对比" icon="💰" variant="purple">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-3">模型</th>
                    <th className="text-left py-2 px-3">上下文窗口</th>
                    <th className="text-left py-2 px-3">输入成本</th>
                    <th className="text-left py-2 px-3">输出成本</th>
                    <th className="text-left py-2 px-3">适用场景</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3 font-mono text-cyan-400">qwen-coder-plus</td>
                    <td className="py-2 px-3">128K</td>
                    <td className="py-2 px-3">$0.01/1K</td>
                    <td className="py-2 px-3">$0.03/1K</td>
                    <td className="py-2 px-3">复杂任务、长上下文</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-3 font-mono text-green-400">qwen-coder</td>
                    <td className="py-2 px-3">64K</td>
                    <td className="py-2 px-3">$0.005/1K</td>
                    <td className="py-2 px-3">$0.015/1K</td>
                    <td className="py-2 px-3">日常开发、中等任务</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-yellow-400">qwen-coder-fast</td>
                    <td className="py-2 px-3">32K</td>
                    <td className="py-2 px-3">$0.001/1K</td>
                    <td className="py-2 px-3">$0.003/1K</td>
                    <td className="py-2 px-3">简单任务、成本敏感</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 相关页面 */}
      <RelatedPages
        pages={[
          { id: 'token-accounting', label: 'Token 计费系统' },
          { id: 'token-management-strategy', label: 'Token 计算策略' },
          { id: 'shared-token-manager', label: 'Token 共享机制' },
          { id: 'memory', label: '上下文管理' },
          { id: 'history-compression-anim', label: '历史压缩动画' },
        ]}
      />
    </div>
  );
}
