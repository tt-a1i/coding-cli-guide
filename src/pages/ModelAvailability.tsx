/**
 * ModelAvailability - 模型可用性系统详解
 * 描述 gemini-cli 的模型健康追踪和故障转移机制
 */

import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'model-routing', label: '模型路由', description: '策略链与模型选择' },
  { id: 'policy-engine', label: 'Policy 策略引擎', description: '安全决策系统' },
  { id: 'error-recovery-patterns', label: '错误恢复模式', description: '故障处理策略' },
  { id: 'config', label: '配置系统', description: '模型配置管理' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* 一句话总结 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--terminal-green)] font-bold">一句话：</span>
              模型健康状态追踪系统，通过故障分类和策略链实现自动故障转移，确保 AI 服务持续可用
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">2</div>
              <div className="text-xs text-[var(--text-muted)]">健康状态</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">4</div>
              <div className="text-xs text-[var(--text-muted)]">不可用原因</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">4</div>
              <div className="text-xs text-[var(--text-muted)]">故障类型</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">2</div>
              <div className="text-xs text-[var(--text-muted)]">降级动作</div>
            </div>
          </div>

          {/* 核心流程 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">故障转移流程</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                API 失败
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                故障分类
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                状态更新
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                选择备用
              </span>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/core/src/availability/modelAvailabilityService.ts
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function ModelAvailability() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const availabilityFlowChart = `flowchart TD
    subgraph Request["📤 API 请求"]
      REQ[模型调用请求]
    end

    subgraph Check["🔍 可用性检查"]
      SNAP[snapshot(model)]
      SNAP --> |检查| STATE{健康状态?}
    end

    REQ --> SNAP

    STATE --> |healthy| CALL[调用 API]
    STATE --> |terminal| SKIP1[跳过此模型]
    STATE --> |sticky_retry consumed| SKIP2[跳过此模型]
    STATE --> |sticky_retry available| CALL

    CALL --> RESULT{调用结果}

    RESULT --> |成功| HEALTHY[markHealthy]
    RESULT --> |配额用尽| TERMINAL[markTerminal: quota]
    RESULT --> |容量不足| TERMINAL2[markTerminal: capacity]
    RESULT --> |暂时失败| STICKY[markRetryOncePerTurn]

    SKIP1 --> NEXT[尝试下一模型]
    SKIP2 --> NEXT

    subgraph Fallback["🔄 故障转移"]
      NEXT --> |有备用| SNAP
      NEXT --> |无备用| LAST[使用 lastResort]
    end

    style HEALTHY fill:#1a2e1a,stroke:#4ade80,stroke-width:2px
    style TERMINAL fill:#2e1a1a,stroke:#f87171,stroke-width:2px
    style TERMINAL2 fill:#2e1a1a,stroke:#f87171,stroke-width:2px
    style STICKY fill:#2e2a1a,stroke:#f59e0b,stroke-width:2px`;

  const healthStateCode = `// packages/core/src/availability/modelAvailabilityService.ts

// 模型健康状态类型
export type ModelHealthStatus = 'terminal' | 'sticky_retry';

// 不可用原因
type TerminalUnavailabilityReason = 'quota' | 'capacity';
export type TurnUnavailabilityReason = 'retry_once_per_turn';

export type UnavailabilityReason =
  | TerminalUnavailabilityReason  // 'quota' | 'capacity'
  | TurnUnavailabilityReason      // 'retry_once_per_turn'
  | 'unknown';

// 健康状态结构
type HealthState =
  | { status: 'terminal'; reason: TerminalUnavailabilityReason }
  | { status: 'sticky_retry'; reason: TurnUnavailabilityReason; consumed: boolean };

// 可用性快照
export interface ModelAvailabilitySnapshot {
  available: boolean;
  reason?: UnavailabilityReason;
}`;

  const availabilityServiceCode = `// packages/core/src/availability/modelAvailabilityService.ts

export class ModelAvailabilityService {
  private readonly health = new Map<ModelId, HealthState>();

  // 标记为终端故障（不可恢复）
  markTerminal(model: ModelId, reason: TerminalUnavailabilityReason) {
    this.setState(model, { status: 'terminal', reason });
  }

  // 标记为健康
  markHealthy(model: ModelId) {
    this.clearState(model);
  }

  // 标记为每轮重试一次（可恢复）
  markRetryOncePerTurn(model: ModelId) {
    const currentState = this.health.get(model);
    // 不覆盖终端故障
    if (currentState?.status === 'terminal') return;

    let consumed = false;
    if (currentState?.status === 'sticky_retry') {
      consumed = currentState.consumed;  // 保持已消费状态
    }

    this.setState(model, {
      status: 'sticky_retry',
      reason: 'retry_once_per_turn',
      consumed,
    });
  }

  // 消费重试机会
  consumeStickyAttempt(model: ModelId) {
    const state = this.health.get(model);
    if (state?.status === 'sticky_retry') {
      this.setState(model, { ...state, consumed: true });
    }
  }

  // 获取模型可用性快照
  snapshot(model: ModelId): ModelAvailabilitySnapshot {
    const state = this.health.get(model);

    if (!state) return { available: true };

    if (state.status === 'terminal') {
      return { available: false, reason: state.reason };
    }

    if (state.status === 'sticky_retry' && state.consumed) {
      return { available: false, reason: state.reason };
    }

    return { available: true };
  }
}`;

  const failureClassificationCode = `// packages/core/src/availability/errorClassification.ts

// 故障类型
export type FailureKind = 'terminal' | 'transient' | 'not_found' | 'unknown';

// 故障分类函数
export function classifyFailureKind(error: unknown): FailureKind {
  if (error instanceof TerminalQuotaError) {
    return 'terminal';   // 配额用尽，不可恢复
  }
  if (error instanceof RetryableQuotaError) {
    return 'transient';  // 暂时性错误，可重试
  }
  if (error instanceof ModelNotFoundError) {
    return 'not_found'; // 模型不存在
  }
  return 'unknown';     // 未知错误
}`;

  const policyChainCode = `// packages/core/src/availability/policyCatalog.ts

// 降级动作
export type FallbackAction = 'silent' | 'prompt';

// 模型策略
export interface ModelPolicy {
  model: ModelId;
  actions: ModelPolicyActionMap;       // 故障 → 动作映射
  stateTransitions: ModelPolicyStateMap; // 故障 → 状态转换
  isLastResort?: boolean;              // 是否为最后手段
}

// 默认策略链: Pro → Flash
const DEFAULT_CHAIN: ModelPolicyChain = [
  definePolicy({ model: 'gemini-2.5-pro' }),
  definePolicy({ model: 'gemini-2.0-flash', isLastResort: true }),
];

// Preview 策略链
const PREVIEW_CHAIN: ModelPolicyChain = [
  definePolicy({ model: 'gemini-2.5-pro-preview' }),
  definePolicy({ model: 'gemini-2.0-flash-preview', isLastResort: true }),
];

// 验证策略链
export function validateModelPolicyChain(chain: ModelPolicyChain): void {
  if (chain.length === 0) {
    throw new Error('Must include at least one model.');
  }
  const lastResortCount = chain.filter(p => p.isLastResort).length;
  if (lastResortCount !== 1) {
    throw new Error('Must have exactly one isLastResort model.');
  }
}`;

  const stateTransitionChart = `stateDiagram-v2
    [*] --> Healthy: 初始状态

    Healthy --> Terminal: markTerminal(quota/capacity)
    Healthy --> StickyRetry: markRetryOncePerTurn()

    StickyRetry --> Healthy: markHealthy()
    StickyRetry --> StickyRetryConsumed: consumeStickyAttempt()
    StickyRetry --> Terminal: markTerminal()

    StickyRetryConsumed --> Healthy: markHealthy()
    StickyRetryConsumed --> Terminal: markTerminal()

    Terminal --> [*]: 不可恢复

    note right of Healthy
      available: true
    end note

    note right of StickyRetry
      available: true
      可重试一次
    end note

    note right of StickyRetryConsumed
      available: false
      重试机会已用
    end note

    note right of Terminal
      available: false
      配额/容量用尽
    end note`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
          Model Availability 模型可用性
        </h1>
        <p className="text-xl text-[var(--text-muted)]">
          模型健康追踪与故障转移系统 - 确保 AI 服务持续可用
        </p>
      </div>

      <QuickSummary
        isExpanded={isSummaryExpanded}
        onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
      />

      {/* 核心架构 */}
      <Layer title="核心架构">
        <p className="text-[var(--text-secondary)] mb-6">
          Model Availability 系统追踪每个模型的健康状态，在 API 调用失败时自动分类故障类型，
          并根据策略链选择备用模型，实现无感知的故障转移。
        </p>
        <MermaidDiagram chart={availabilityFlowChart} />
      </Layer>

      {/* 健康状态类型 */}
      <Layer title="健康状态类型">
        <CodeBlock code={healthStateCode} language="typescript" title="modelAvailabilityService.ts" />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="ModelHealthStatus (2种)" variant="blue">
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-mono">terminal</span>
                <span className="text-[var(--text-muted)]">- 终端故障，不可恢复</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-mono">sticky_retry</span>
                <span className="text-[var(--text-muted)]">- 粘性重试，每轮一次机会</span>
              </li>
            </ul>
          </HighlightBox>

          <HighlightBox title="UnavailabilityReason (4种)" variant="purple">
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-mono">quota</span>
                <span className="text-[var(--text-muted)]">- 配额用尽</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 font-mono">capacity</span>
                <span className="text-[var(--text-muted)]">- 容量不足</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-mono">retry_once_per_turn</span>
                <span className="text-[var(--text-muted)]">- 每轮重试一次</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400 font-mono">unknown</span>
                <span className="text-[var(--text-muted)]">- 未知原因</span>
              </li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* 状态转换 */}
      <Layer title="状态转换图">
        <MermaidDiagram chart={stateTransitionChart} />

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-3">状态转换规则</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">当前状态</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">事件</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">下一状态</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">available</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--terminal-green)]">Healthy</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">API 成功</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">Healthy</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">✓ true</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--terminal-green)]">Healthy</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">配额/容量用尽</td>
                  <td className="py-2 px-3 text-red-400">Terminal</td>
                  <td className="py-2 px-3 text-red-400">✗ false</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--terminal-green)]">Healthy</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">暂时性失败</td>
                  <td className="py-2 px-3 text-amber-400">StickyRetry</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">✓ true</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-amber-400">StickyRetry</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">消费重试机会</td>
                  <td className="py-2 px-3 text-orange-400">StickyRetry (consumed)</td>
                  <td className="py-2 px-3 text-red-400">✗ false</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-amber-400">StickyRetry</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">API 成功</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">Healthy</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">✓ true</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* ModelAvailabilityService */}
      <Layer title="ModelAvailabilityService 服务">
        <p className="text-[var(--text-secondary)] mb-4">
          <code className="text-[var(--cyber-blue)]">ModelAvailabilityService</code> 是模型健康状态的核心管理器，
          提供状态标记、查询和重试机会管理功能。
        </p>
        <CodeBlock code={availabilityServiceCode} language="typescript" title="modelAvailabilityService.ts" />
      </Layer>

      {/* 故障分类 */}
      <Layer title="故障分类 (FailureKind)">
        <CodeBlock code={failureClassificationCode} language="typescript" title="errorClassification.ts" />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="FailureKind (4种)" variant="yellow">
            <ul className="text-sm space-y-2">
              <li>
                <span className="text-red-400 font-mono font-bold">terminal</span>
                <span className="text-[var(--text-muted)]"> - 终端故障，配额用尽</span>
              </li>
              <li>
                <span className="text-amber-400 font-mono font-bold">transient</span>
                <span className="text-[var(--text-muted)]"> - 暂时性错误，可重试</span>
              </li>
              <li>
                <span className="text-purple-400 font-mono font-bold">not_found</span>
                <span className="text-[var(--text-muted)]"> - 模型不存在</span>
              </li>
              <li>
                <span className="text-gray-400 font-mono font-bold">unknown</span>
                <span className="text-[var(--text-muted)]"> - 未知错误</span>
              </li>
            </ul>
          </HighlightBox>

          <HighlightBox title="FallbackAction (2种)" variant="green">
            <ul className="text-sm space-y-2">
              <li>
                <span className="text-[var(--terminal-green)] font-mono font-bold">silent</span>
                <span className="text-[var(--text-muted)]"> - 静默切换到备用模型</span>
              </li>
              <li>
                <span className="text-amber-400 font-mono font-bold">prompt</span>
                <span className="text-[var(--text-muted)]"> - 提示用户后切换</span>
              </li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* 策略链 */}
      <Layer title="模型策略链 (PolicyChain)">
        <p className="text-[var(--text-secondary)] mb-4">
          策略链定义了模型的优先级和故障转移规则。默认链：Pro → Flash，确保至少有一个 lastResort 模型。
        </p>
        <CodeBlock code={policyChainCode} language="typescript" title="policyCatalog.ts" />

        <HighlightBox title="策略链验证规则" variant="blue" className="mt-4">
          <ul className="text-sm space-y-1">
            <li>• 策略链必须至少包含一个模型</li>
            <li>• 必须有且仅有一个 <code className="text-amber-400">isLastResort</code> 模型</li>
            <li>• lastResort 模型作为最后手段，即使不可用也会尝试</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 关键文件 */}
      <Layer title="关键文件与入口" icon="📁">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/availability/modelAvailabilityService.ts
            </code>
            <span className="text-gray-400">健康状态管理服务</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/availability/errorClassification.ts
            </code>
            <span className="text-gray-400">故障类型分类</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/availability/modelPolicy.ts
            </code>
            <span className="text-gray-400">模型策略定义</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/availability/policyCatalog.ts
            </code>
            <span className="text-gray-400">策略链目录</span>
          </div>
          <div className="flex items-start gap-2">
            <code className="bg-black/30 px-2 py-1 rounded text-xs whitespace-nowrap">
              packages/core/src/availability/policyHelpers.ts
            </code>
            <span className="text-gray-400">策略辅助函数</span>
          </div>
        </div>
      </Layer>

      {/* 设计决策 */}
      <Layer title="设计决策" icon="💡">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">为什么使用 Sticky Retry？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>决策：</strong>每轮只允许重试一次，而不是无限重试。</p>
              <p><strong>原因：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>防止无限循环</strong>：如果模型持续失败，不会陷入重试风暴</li>
                <li><strong>用户体验</strong>：快速切换到备用模型，而非长时间等待</li>
                <li><strong>资源保护</strong>：避免对已知有问题的模型重复请求</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">为什么需要 lastResort？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>决策：</strong>策略链必须有且仅有一个 lastResort 模型。</p>
              <p><strong>原因：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>保底策略</strong>：确保始终有模型可用，即使所有主力模型都失败</li>
                <li><strong>单一职责</strong>：只有一个最后手段，避免决策歧义</li>
                <li><strong>Flash 作为 lastResort</strong>：速度快、配额高，适合作为备用</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">Terminal vs Sticky 的选择？</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p><strong>决策：</strong>根据错误类型决定状态转换。</p>
              <p><strong>规则：</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>配额/容量用尽</strong> → Terminal（不可恢复，本会话内不再尝试）</li>
                <li><strong>暂时性错误</strong> → Sticky（可能恢复，给一次重试机会）</li>
                <li><strong>模型不存在</strong> → Terminal（配置错误，需要修复）</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
