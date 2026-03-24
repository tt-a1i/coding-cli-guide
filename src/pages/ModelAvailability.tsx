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
import { getThemeColor } from '../utils/theme';

const relatedPages: RelatedPage[] = [
 { id: 'model-routing', label: '模型路由', description: '策略链与模型选择' },
 { id: 'policy-engine', label: 'Policy 策略引擎', description: '安全决策系统' },
 { id: 'error-recovery-patterns', label: '错误恢复模式', description: '故障处理策略' },
 { id: 'config', label: '配置系统', description: '模型配置管理' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 {/* 一句话总结 */}
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 模型健康状态追踪系统，通过故障分类和策略链实现自动故障转移，确保 AI 服务持续可用
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">健康状态</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">4</div>
 <div className="text-xs text-dim">不可用原因</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">4</div>
 <div className="text-xs text-dim">故障类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">降级动作</div>
 </div>
 </div>

 {/* 核心流程 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">故障转移流程</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 API 失败
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 故障分类
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 状态更新
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 选择备用
 </span>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
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
 STATE --> |"sticky_retry consumed"| SKIP2[跳过此模型]
 STATE --> |"sticky_retry available"| CALL

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

 style HEALTHY stroke:#4ade80,stroke-width:2px
 style TERMINAL stroke:#f87171,stroke-width:2px
 style TERMINAL2 stroke:#f87171,stroke-width:2px
 style STICKY stroke:${getThemeColor("--color-warning", "#b45309")},stroke-width:2px`;

 const healthStateCode = `// packages/core/src/availability/modelAvailabilityService.ts

// 模型健康状态类型
export type ModelHealthStatus = 'terminal' | 'sticky_retry';

// 不可用原因
type TerminalUnavailabilityReason = 'quota' | 'capacity';
export type TurnUnavailabilityReason = 'retry_once_per_turn';

export type UnavailabilityReason =
  | TerminalUnavailabilityReason // 'quota' | 'capacity'
  | TurnUnavailabilityReason // 'retry_once_per_turn'
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
  consumed = currentState.consumed; // 保持已消费状态
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
  return 'terminal'; // 配额用尽，不可恢复
  }
  if (error instanceof RetryableQuotaError) {
  return 'transient'; // 暂时性错误，可重试
  }
  if (error instanceof ModelNotFoundError) {
  return 'not_found'; // 模型不存在
  }
  return 'unknown'; // 未知错误
}`;

 const policyChainCode = `// packages/core/src/availability/policyCatalog.ts

import {



  DEFAULT_GEMINI_MODEL,
  DEFAULT_GEMINI_FLASH_MODEL,
  PREVIEW_GEMINI_MODEL,
  PREVIEW_GEMINI_FLASH_MODEL,
} from '../config/models.js';

// 降级动作
export type FallbackAction = 'silent' | 'prompt';

// 模型策略
export interface ModelPolicy {
  model: ModelId;
  actions: ModelPolicyActionMap; // 故障 → 动作映射
  stateTransitions: ModelPolicyStateMap; // 故障 → 状态转换
  isLastResort?: boolean; // 是否为最后手段
}

// 默认策略链: Pro → Flash
const DEFAULT_CHAIN: ModelPolicyChain = [
  definePolicy({ model: DEFAULT_GEMINI_MODEL }),
  definePolicy({ model: DEFAULT_GEMINI_FLASH_MODEL, isLastResort: true }),
];

// Preview 策略链
const PREVIEW_CHAIN: ModelPolicyChain = [
  definePolicy({ model: PREVIEW_GEMINI_MODEL }),
  definePolicy({ model: PREVIEW_GEMINI_FLASH_MODEL, isLastResort: true }),
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
 <h1 className="text-4xl font-bold text-heading mb-3">
 Model Availability 模型可用性
 </h1>
 <p className="text-xl text-dim">
 模型健康追踪与故障转移系统 - 确保 AI 服务持续可用
 </p>
 </div>

 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 核心架构 */}
 <Layer title="核心架构">
 <p className="text-body mb-6">
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
 <span className="text-heading font-mono">terminal</span>
 <span className="text-dim">- 终端故障，不可恢复</span>
 </li>
 <li className="flex items-center gap-2">
 <span className="text-heading font-mono">sticky_retry</span>
 <span className="text-dim">- 粘性重试，每轮一次机会</span>
 </li>
 </ul>
 </HighlightBox>

 <HighlightBox title="UnavailabilityReason (4种)" variant="purple">
 <ul className="text-sm space-y-2">
 <li className="flex items-center gap-2">
 <span className="text-heading font-mono">quota</span>
 <span className="text-dim">- 配额用尽</span>
 </li>
 <li className="flex items-center gap-2">
 <span className="text-heading font-mono">capacity</span>
 <span className="text-dim">- 容量不足</span>
 </li>
 <li className="flex items-center gap-2">
 <span className="text-heading font-mono">retry_once_per_turn</span>
 <span className="text-dim">- 每轮重试一次</span>
 </li>
 <li className="flex items-center gap-2">
 <span className="text-body font-mono">unknown</span>
 <span className="text-dim">- 未知原因</span>
 </li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 {/* 状态转换 */}
 <Layer title="状态转换图">
 <MermaidDiagram chart={stateTransitionChart} />

 <div className="mt-6">
 <h4 className="text-lg font-semibold text-heading mb-3">状态转换规则</h4>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">当前状态</th>
 <th className="text-left py-2 px-3 text-dim">事件</th>
 <th className="text-left py-2 px-3 text-dim">下一状态</th>
 <th className="text-left py-2 px-3 text-dim">available</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">Healthy</td>
 <td className="py-2 px-3 text-body">API 成功</td>
 <td className="py-2 px-3 text-heading">Healthy</td>
 <td className="py-2 px-3 text-heading">true</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">Healthy</td>
 <td className="py-2 px-3 text-body">配额/容量用尽</td>
 <td className="py-2 px-3 text-heading">Terminal</td>
 <td className="py-2 px-3 text-heading">false</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">Healthy</td>
 <td className="py-2 px-3 text-body">暂时性失败</td>
 <td className="py-2 px-3 text-heading">StickyRetry</td>
 <td className="py-2 px-3 text-heading">true</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">StickyRetry</td>
 <td className="py-2 px-3 text-body">消费重试机会</td>
 <td className="py-2 px-3 text-heading">StickyRetry (consumed)</td>
 <td className="py-2 px-3 text-heading">false</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">StickyRetry</td>
 <td className="py-2 px-3 text-body">API 成功</td>
 <td className="py-2 px-3 text-heading">Healthy</td>
 <td className="py-2 px-3 text-heading">true</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* ModelAvailabilityService */}
 <Layer title="ModelAvailabilityService 服务">
 <p className="text-body mb-4">
 <code className="text-heading">ModelAvailabilityService</code> 是模型健康状态的核心管理器，
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
 <span className="text-heading font-mono font-bold">terminal</span>
 <span className="text-dim"> - 终端故障，配额用尽</span>
 </li>
 <li>
 <span className="text-heading font-mono font-bold">transient</span>
 <span className="text-dim"> - 暂时性错误，可重试</span>
 </li>
 <li>
 <span className="text-heading font-mono font-bold">not_found</span>
 <span className="text-dim"> - 模型不存在</span>
 </li>
 <li>
 <span className="text-body font-mono font-bold">unknown</span>
 <span className="text-dim"> - 未知错误</span>
 </li>
 </ul>
 </HighlightBox>

 <HighlightBox title="FallbackAction (2种)" variant="green">
 <ul className="text-sm space-y-2">
 <li>
 <span className="text-heading font-mono font-bold">silent</span>
 <span className="text-dim"> - 静默切换到备用模型</span>
 </li>
 <li>
 <span className="text-heading font-mono font-bold">prompt</span>
 <span className="text-dim"> - 提示用户后切换</span>
 </li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 {/* 策略链 */}
 <Layer title="模型策略链 (PolicyChain)">
 <p className="text-body mb-4">
 策略链定义了模型的优先级和故障转移规则。默认链：Pro → Flash，确保至少有一个 lastResort 模型。
 </p>
 <CodeBlock code={policyChainCode} language="typescript" title="policyCatalog.ts" />
 <p className="text-dim text-sm mt-3">
 Preview 模式启用时，策略链会切换到 Gemini 3 的 preview 模型（Pro/Flash）。
 </p>

 <HighlightBox title="策略链验证规则" variant="blue" className="mt-4">
 <ul className="text-sm space-y-1">
 <li>策略链必须至少包含一个模型</li>
 <li>必须有且仅有一个 <code className="text-heading">isLastResort</code> 模型</li>
 <li>lastResort 模型作为最后手段，即使不可用也会尝试</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* 关键文件 */}
 <Layer title="关键文件与入口">
 <div className="grid grid-cols-1 gap-2 text-sm">
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/availability/modelAvailabilityService.ts
 </code>
 <span className="text-body">健康状态管理服务</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/availability/errorClassification.ts
 </code>
 <span className="text-body">故障类型分类</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/availability/modelPolicy.ts
 </code>
 <span className="text-body">模型策略定义</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/availability/policyCatalog.ts
 </code>
 <span className="text-body">策略链目录</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/availability/policyHelpers.ts
 </code>
 <span className="text-body">策略辅助函数</span>
 </div>
 </div>
 </Layer>

 {/* 设计决策 */}
 <Layer title="设计决策">
 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么使用 Sticky Retry？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>每轮只允许重试一次，而不是无限重试。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>防止无限循环</strong>：如果模型持续失败，不会陷入重试风暴</li>
 <li><strong>用户体验</strong>：快速切换到备用模型，而非长时间等待</li>
 <li><strong>资源保护</strong>：避免对已知有问题的模型重复请求</li>
 </ul>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么需要 lastResort？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>策略链必须有且仅有一个 lastResort 模型。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>保底策略</strong>：确保始终有模型可用，即使所有主力模型都失败</li>
 <li><strong>单一职责</strong>：只有一个最后手段，避免决策歧义</li>
 <li><strong>Flash 作为 lastResort</strong>：速度快、配额高，适合作为备用</li>
 </ul>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">Terminal vs Sticky 的选择？</h4>
 <div className="text-sm text-body space-y-2">
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
