import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



const relatedPages: RelatedPage[] = [
 { id: 'policy-engine', label: 'Policy 策略引擎', description: '安全决策系统' },
 { id: 'gemini-chat', label: 'Gemini Chat', description: 'AI 模型调用' },
 { id: 'agent-framework', label: 'Agent 框架', description: 'Agent 模型选择' },
 { id: 'config', label: '配置系统', description: '模型配置管理' },
 { id: 'multi-provider', label: '多厂商架构', description: '模型可用性' },
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
 智能模型选择系统，通过责任链模式按优先级匹配策略，根据任务复杂度自动选择 Flash 或 Pro 模型
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">4</div>
 <div className="text-xs text-dim">路由策略</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">模型层级</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">复杂度等级</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">1</div>
 <div className="text-xs text-dim">责任链模式</div>
 </div>
 </div>

 {/* 核心流程 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">策略链执行顺序</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Fallback
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Override
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Classifier
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 Default
 </span>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/routing/modelRouterService.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function ModelRouting() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const routingFlowChart = `flowchart TD
 subgraph Input["📥 路由请求"]
 REQ[RoutingContext]
 REQ --> |history, request, signal| ROUTER
 end

 subgraph ROUTER["🔀 ModelRouterService"]
 COMP[CompositeStrategy]
 end

 subgraph Strategies["📋 策略链 (Chain of Responsibility)"]
 FALL[FallbackStrategy]
 OVER[OverrideStrategy]
 CLASS[ClassifierStrategy]
 DEF[DefaultStrategy]

 FALL --> |next| OVER
 OVER --> |next| CLASS
 CLASS --> |next| DEF
 end

 COMP --> FALL

 subgraph Decision["🎯 路由决策"]
 DEC[RoutingDecision]
 DEC --> |model| MODEL[选定模型]
 DEC --> |metadata| META[决策元数据]
 end

 DEF --> DEC

 style ROUTER stroke:#00d4ff,stroke-width:2px
 style COMP stroke:#a855f7,stroke-width:2px
 style CLASS stroke:#4ade80,stroke-width:2px`;

 const strategyChainChart = `flowchart LR
 subgraph Chain["策略链执行流程"]
 direction LR
 A[请求进入] --> B{Fallback<br/>模型可用?}
 B --> |不可用| B1[返回备用模型]
 B --> |可用| C{Override<br/>用户指定?}
 C --> |是| C1[返回指定模型]
 C --> |否| D{Classifier<br/>复杂度分析}
 D --> |简单| D1[返回 Flash]
 D --> |复杂| D2[返回 Pro]
 D --> |无法判断| E[Default]
 E --> E1[返回默认模型]
 end

 style B stroke:#00d4ff,stroke-width:2px
 style C stroke:#a855f7,stroke-width:2px
 style D stroke:#4ade80,stroke-width:2px
 style E stroke:${getThemeColor("--color-warning", "#b45309")},stroke-width:2px`;

 const classifierFlowChart = `flowchart TD
 subgraph Classifier["🧠 ClassifierStrategy"]
 INPUT[用户请求 + 历史上下文]
 INPUT --> LLM[LLM 复杂度评估]

 LLM --> |分析| EVAL{复杂度判定}

 EVAL --> |SIMPLE| FLASH["⚡ Flash 模型"]
 EVAL --> |COMPLEX| PRO["🚀 Pro 模型"]
 EVAL --> |UNKNOWN| NEXT["➡️ 传递给下一策略"]

 subgraph Criteria["判定标准"]
 S1["简单: 1-3 工具调用"]
 S2["简单: 单文件操作"]
 S3["复杂: 4+ 步骤规划"]
 S4["复杂: 多文件协调"]
 end
 end

 style LLM stroke:#4ade80,stroke-width:2px
 style FLASH stroke:#00d4ff,stroke-width:2px
 style PRO stroke:#a855f7,stroke-width:2px`;

 const routingStrategyCode = `// packages/core/src/routing/routingStrategy.ts

// 路由决策输出
export interface RoutingDecision {
  model: string; // 选定模型 (如 'gemini-2.5-pro')
  metadata: {
  source: string; // 决策来源策略名
  latencyMs: number; // 决策耗时
  reasoning: string; // 决策原因
  error?: string; // 错误信息（可选）
  };
}

// 路由上下文
export interface RoutingContext {
  history: Content[]; // 对话历史
  request: PartListUnion; // 当前请求
  signal: AbortSignal; // 取消信号
}

// 路由策略接口
export interface RoutingStrategy {
  readonly name: string; // 策略名称
  route(
  context: RoutingContext,
  config: Config,
  baseLlmClient: BaseLlmClient,
  ): Promise<RoutingDecision | null>; // 返回 null 表示传递给下一策略
}

// 终端策略 - 必须返回决策，不能返回 null
export interface TerminalStrategy extends RoutingStrategy {
  route(...): Promise<RoutingDecision>; // 必须返回决策
}`;

 const compositeStrategyCode = `// packages/core/src/routing/strategies/compositeStrategy.ts

export class CompositeStrategy implements TerminalStrategy {
  readonly name: string;
  // 类型保证：最后一个必须是 TerminalStrategy
  private strategies: [...RoutingStrategy[], TerminalStrategy];

  constructor(
  strategies: [...RoutingStrategy[], TerminalStrategy],
  name: string = 'composite',
  ) {
  this.strategies = strategies;
  this.name = name;
  }

  async route(context, config, baseLlmClient): Promise<RoutingDecision> {
  const startTime = performance.now();

  // 分离非终端策略和终端策略
  const nonTerminal = this.strategies.slice(0, -1) as RoutingStrategy[];
  const terminal = this.strategies[this.strategies.length - 1] as TerminalStrategy;

  // 尝试非终端策略，允许优雅失败
  for (const strategy of nonTerminal) {
  try {
  const decision = await strategy.route(context, config, baseLlmClient);
  if (decision) {
  return this.finalizeDecision(decision, startTime);
  }
  } catch (error) {
  // 策略失败时继续下一个，不中断链
  debugLogger.warn(\`Strategy '\${strategy.name}' failed, continuing...\`);
  }
  }

  // 执行终端策略（保底）
  const decision = await terminal.route(context, config, baseLlmClient);
  return this.finalizeDecision(decision, startTime);
  }

  private finalizeDecision(decision: RoutingDecision, startTime: number) {
  const latency = decision.metadata.latencyMs || performance.now() - startTime;
  return {
  ...decision,
  metadata: {
  ...decision.metadata,
  source: \`\${this.name}/\${decision.metadata.source}\`,
  latencyMs: Math.round(latency),
  },
  };
  }
}`;

 const modelRouterServiceCode = `// packages/core/src/routing/modelRouterService.ts

export class ModelRouterService {
  private config: Config;
  private strategy: TerminalStrategy;

  constructor(config: Config) {
  this.config = config;
  this.strategy = this.initializeDefaultStrategy();
  }

  private initializeDefaultStrategy(): TerminalStrategy {
  // 按优先级顺序初始化策略链
  return new CompositeStrategy(
  [
  new FallbackStrategy(), // 1. 模型可用性检查
  new OverrideStrategy(), // 2. 用户显式覆盖
  new ClassifierStrategy(), // 3. LLM 复杂度分类
  new DefaultStrategy(), // 4. 默认模型（终端）
  ],
  'agent-router',
  );
  }

  async route(context: RoutingContext): Promise<RoutingDecision> {
  const startTime = Date.now();
  try {
  const decision = await this.strategy.route(
  context,
  this.config,
  this.config.getBaseLlmClient(),
  );

  // 遥测日志
  logModelRouting(this.config, new ModelRoutingEvent(
  decision.model,
  decision.metadata.source,
  decision.metadata.latencyMs,
  decision.metadata.reasoning,
  false,
  ));

  return decision;
  } catch (e) {
  // 异常时记录并重新抛出
  logModelRouting(this.config, new ModelRoutingEvent(..., true, e.message));
  throw e;
  }
  }
}`;

 const classifierStrategyCode = `// packages/core/src/routing/strategies/classifierStrategy.ts

const CLASSIFIER_SYSTEM_PROMPT = \`
You are a Task Routing AI. Classify complexity: \\\`flash\\\` (SIMPLE) or \\\`pro\\\` (COMPLEX).

<complexity_rubric>
COMPLEX (Choose pro) if ONE OR MORE:
1. High Operational Complexity (4+ Steps/Tool Calls)
2. Strategic Planning & Conceptual Design (asking "how" or "why")
3. High Ambiguity or Large Scope (extensive investigation)
4. Deep Debugging & Root Cause Analysis

SIMPLE (Choose flash) if:
- Highly specific, bounded, 1-3 tool calls
- Operational simplicity overrides strategic phrasing
</complexity_rubric>

Output JSON: { "reasoning": "...", "model_choice": "flash" | "pro" }
\`;

export class ClassifierStrategy implements RoutingStrategy {
  readonly name = 'classifier';

  async route(context, config, baseLlmClient): Promise<RoutingDecision | null> {
  const startTime = Date.now();
  try {
  // 取最近 4 轮历史（过滤工具调用）
  const cleanHistory = context.history
  .slice(-20)
  .filter(c => !isFunctionCall(c) && !isFunctionResponse(c))
  .slice(-4);

  const response = await baseLlmClient.generateJson({
  modelConfigKey: { model: 'classifier' },
  contents: [...cleanHistory, createUserContent(context.request)],
  schema: { /* reasoning, model_choice */ },
  systemInstruction: CLASSIFIER_SYSTEM_PROMPT,
  abortSignal: context.signal,
  });

  const { reasoning, model_choice } = ClassifierResponseSchema.parse(response);
  const selectedModel = resolveClassifierModel(config.getModel(), model_choice);

  return {
  model: selectedModel,
  metadata: {
  source: 'Classifier',
  latencyMs: Date.now() - startTime,
  reasoning,
  },
  };
  } catch (error) {
  debugLogger.warn('[Routing] ClassifierStrategy failed:', error);
  return null; // 传递给下一策略
  }
  }
}`;

 const fallbackStrategyCode = `// packages/core/src/routing/strategies/fallbackStrategy.ts

export class FallbackStrategy implements RoutingStrategy {
  readonly name = 'fallback';

  async route(_context, config, _baseLlmClient): Promise<RoutingDecision | null> {
  const requestedModel = config.getModel();
  const resolvedModel = resolveModel(requestedModel, config.getPreviewFeatures());

  // 检查模型可用性
  const service = config.getModelAvailabilityService();
  const snapshot = service.snapshot(resolvedModel);

  if (snapshot.available) {
  return null; // 模型可用，传递给下一策略
  }

  // 模型不可用，选择备用模型
  const selection = selectModelForAvailability(config, requestedModel);

  if (selection?.selectedModel && selection.selectedModel !== requestedModel) {
  return {
  model: selection.selectedModel,
  metadata: {
  source: this.name,
  latencyMs: 0,
  reasoning: \`Model \${requestedModel} unavailable (\${snapshot.reason}). Using fallback: \${selection.selectedModel}\`,
  },
  };
  }

  return null;
  }
}`;

 const overrideStrategyCode = `// packages/core/src/routing/strategies/overrideStrategy.ts

export class OverrideStrategy implements RoutingStrategy {
  readonly name = 'override';

  async route(_context, config, _baseLlmClient): Promise<RoutingDecision | null> {
  const overrideModel = config.getModel();

  // 如果是 'auto' 模式（au/ au），传递给下一策略
  if (overrideModel === DEFAULT_GEMINI_MODEL_AUTO ||
  overrideModel === PREVIEW_GEMINI_MODEL_AUTO) {
  return null;
  }

  // 用户显式指定了模型，直接返回
  return {
  model: resolveModel(overrideModel, config.getPreviewFeatures()),
  metadata: {
  source: this.name,
  latencyMs: 0,
  reasoning: \`Routing bypassed by forced model directive. Using: \${overrideModel}\`,
  },
  };
  }
}

// DefaultStrategy - 终端策略，保底返回默认模型
export class DefaultStrategy implements TerminalStrategy {
  readonly name = 'default';

  async route(_context, _config, _baseLlmClient): Promise<RoutingDecision> {
  return {
  model: DEFAULT_GEMINI_MODEL, // 如 'gemini-2.5-pro'
  metadata: {
  source: this.name,
  latencyMs: 0,
  reasoning: \`Routing to default model: \${DEFAULT_GEMINI_MODEL}\`,
  },
  };
  }
}`;

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-4xl font-bold text-heading mb-3">
 Model Routing 模型路由
 </h1>
 <p className="text-xl text-dim">
 智能模型选择系统 - 责任链模式的策略决策架构
 </p>
 </div>

 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 核心架构 */}
 <Layer title="核心架构">
 <p className="text-body mb-6">
 Model Routing 使用 <strong>责任链模式 (Chain of Responsibility)</strong> 实现智能模型选择。
 每个策略按优先级顺序执行，首个返回决策的策略终止链条。
 </p>
 <MermaidDiagram chart={routingFlowChart} />
 </Layer>

 {/* 策略链详解 */}
 <Layer title="策略链执行流程">
 <MermaidDiagram chart={strategyChainChart} />

 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="FallbackStrategy" variant="blue">
 <ul className="text-sm space-y-1">
 <li><strong>优先级</strong>: 最高 (第 1 个执行)</li>
 <li><strong>职责</strong>: 检查首选模型可用性</li>
 <li><strong>决策</strong>: 模型不可用时返回备用</li>
 <li><strong>传递</strong>: 模型可用时传递下一策略</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="OverrideStrategy" variant="purple">
 <ul className="text-sm space-y-1">
 <li><strong>优先级</strong>: 高 (第 2 个执行)</li>
 <li><strong>职责</strong>: 处理用户显式指定的模型</li>
 <li><strong>决策</strong>: 用户指定时直接返回</li>
 <li><strong>传递</strong>: 未指定时传递下一策略</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="ClassifierStrategy" variant="green">
 <ul className="text-sm space-y-1">
 <li><strong>优先级</strong>: 中 (第 3 个执行)</li>
 <li><strong>职责</strong>: LLM 分析任务复杂度</li>
 <li><strong>决策</strong>: 简单→Flash, 复杂→Pro</li>
 <li><strong>传递</strong>: 无法判断时传递下一策略</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="DefaultStrategy" variant="yellow">
 <ul className="text-sm space-y-1">
 <li><strong>优先级</strong>: 最低 (终端策略)</li>
 <li><strong>职责</strong>: 提供默认模型选择</li>
 <li><strong>决策</strong>: 必须返回决策 (TerminalStrategy)</li>
 <li><strong>传递</strong>: 不传递，链尾保底</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 {/* 核心类型定义 */}
 <Layer title="核心类型定义">
 <p className="text-body mb-4">
 路由系统的核心接口定义：<code className="text-heading">RoutingStrategy</code>、
 <code className="text-heading">RoutingContext</code> 和
 <code className="text-heading">RoutingDecision</code>。
 </p>
 <CodeBlock code={routingStrategyCode} language="typescript" title="routingStrategy.ts" />

 <div className="mt-6">
 <h4 className="text-lg font-semibold text-heading mb-3">类型说明</h4>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">类型</th>
 <th className="text-left py-2 px-3 text-dim">用途</th>
 <th className="text-left py-2 px-3 text-dim">关键字段</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">RoutingStrategy</td>
 <td className="py-2 px-3 text-body">普通策略接口</td>
 <td className="py-2 px-3 text-dim">route() 返回 Decision | undefined</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">TerminalStrategy</td>
 <td className="py-2 px-3 text-body">终端策略接口</td>
 <td className="py-2 px-3 text-dim">route() 必须返回 Decision</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">RoutingContext</td>
 <td className="py-2 px-3 text-body">路由请求上下文</td>
 <td className="py-2 px-3 text-dim">history, request, signal</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading">RoutingDecision</td>
 <td className="py-2 px-3 text-body">路由决策结果</td>
 <td className="py-2 px-3 text-dim">model, metadata?</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* CompositeStrategy 实现 */}
 <Layer title="CompositeStrategy 组合策略">
 <p className="text-body mb-4">
 <code className="text-heading">CompositeStrategy</code> 是责任链模式的核心实现。
 它按顺序执行策略列表，首个返回决策的策略终止链条；所有策略都未决策时，使用终端策略保底。
 </p>
 <CodeBlock code={compositeStrategyCode} language="typescript" title="compositeStrategy.ts" />

 <HighlightBox title="设计模式" variant="blue" className="mt-4">
 <p className="text-sm">
 <strong>责任链模式 (Chain of Responsibility)</strong>：每个策略处理请求或传递给下一个。
 这种设计使得策略可以独立开发、测试和组合，新增策略只需插入链条即可。
 </p>
 </HighlightBox>
 </Layer>

 {/* ModelRouterService */}
 <Layer title="ModelRouterService 路由服务">
 <p className="text-body mb-4">
 <code className="text-heading">ModelRouterService</code> 是路由系统的入口。
 它在构造时组装策略链，提供 <code>routeModel()</code> 方法供外部调用。
 </p>
 <CodeBlock code={modelRouterServiceCode} language="typescript" title="modelRouterService.ts" />
 </Layer>

 {/* ClassifierStrategy 详解 */}
 <Layer title="ClassifierStrategy 复杂度分类">
 <p className="text-body mb-4">
 <code className="text-heading">ClassifierStrategy</code> 使用轻量级 LLM
 分析任务复杂度，决定使用 Flash (快速/简单) 还是 Pro (强大/复杂) 模型。
 </p>

 <MermaidDiagram chart={classifierFlowChart} />

 <div className="mt-6">
 <CodeBlock code={classifierStrategyCode} language="typescript" title="classifierStrategy.ts" />
 </div>

 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="简单任务 → Flash" variant="blue">
 <ul className="text-sm space-y-1">
 <li>1-3 个工具调用</li>
 <li>单文件读写操作</li>
 <li>简单问答或解释</li>
 <li>格式转换或计算</li>
 <li>快速信息查询</li>
 </ul>
 </HighlightBox>

 <HighlightBox title="复杂任务 → Pro" variant="purple">
 <ul className="text-sm space-y-1">
 <li>4+ 步骤规划</li>
 <li>多文件协调修改</li>
 <li>架构设计决策</li>
 <li>复杂调试分析</li>
 <li>跨模块重构</li>
 </ul>
 </HighlightBox>
 </div>
 </Layer>

 {/* FallbackStrategy */}
 <Layer title="FallbackStrategy 可用性检查">
 <p className="text-body mb-4">
 <code className="text-heading">FallbackStrategy</code> 是策略链的第一道防线，
 确保在首选模型不可用时自动切换到备用模型，保证系统可用性。
 </p>
 <CodeBlock code={fallbackStrategyCode} language="typescript" title="fallbackStrategy.ts" />
 </Layer>

 {/* OverrideStrategy */}
 <Layer title="OverrideStrategy 用户覆盖">
 <p className="text-body mb-4">
 <code className="text-heading">OverrideStrategy</code> 处理用户的显式模型选择，
 当用户通过配置或命令行指定模型时，跳过自动路由逻辑。
 </p>
 <CodeBlock code={overrideStrategyCode} language="typescript" title="overrideStrategy.ts" />
 </Layer>

 {/* 策略优先级说明 */}
 <Layer title="策略优先级设计">
 <div className="space-y-4">
 <p className="text-body">
 策略链的顺序经过精心设计，体现了不同决策因素的优先级：
 </p>

 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">顺序</th>
 <th className="text-left py-2 px-3 text-dim">策略</th>
 <th className="text-left py-2 px-3 text-dim">设计理由</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">1</td>
 <td className="py-2 px-3 text-heading">FallbackStrategy</td>
 <td className="py-2 px-3 text-body">
 可用性优先：不可用的模型没有意义，首先确保选择可用的模型
 </td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">2</td>
 <td className="py-2 px-3 text-heading">OverrideStrategy</td>
 <td className="py-2 px-3 text-body">
 用户意图优先：用户显式指定的选择应该被尊重，跳过自动化逻辑
 </td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">3</td>
 <td className="py-2 px-3 text-heading">ClassifierStrategy</td>
 <td className="py-2 px-3 text-body">
 智能选择：基于任务复杂度做最优选择，平衡性能和成本
 </td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 text-heading font-bold">4</td>
 <td className="py-2 px-3 text-heading">DefaultStrategy</td>
 <td className="py-2 px-3 text-body">
 保底选择：确保总有一个决策返回，防止路由失败
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* 与其他系统集成 */}
 <Layer title="系统集成">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="与 Policy 集成" variant="blue">
 <p className="text-sm">
 Policy 引擎可以限制特定操作只能使用某些模型。路由决策会参考 Policy 规则，
 确保模型选择符合安全策略。
 </p>
 </HighlightBox>

 <HighlightBox title="与 Agent 集成" variant="purple">
 <p className="text-sm">
 Agent 框架使用 ModelRouterService 为不同类型的 Agent 选择合适的模型。
 探索型 Agent 可能使用 Flash，深度分析 Agent 使用 Pro。
 </p>
 </HighlightBox>

 <HighlightBox title="与 Config 集成" variant="green">
 <p className="text-sm">
 用户可以通过配置文件或环境变量设置模型偏好。OverrideStrategy 读取这些配置，
 实现用户级别的模型控制。
 </p>
 </HighlightBox>

 <HighlightBox title="与 Telemetry 集成" variant="yellow">
 <p className="text-sm">
 路由决策的 metadata 字段用于遥测和调试。可以追踪哪个策略做出决策、
 复杂度判断结果等信息。
 </p>
 </HighlightBox>
 </div>
 </Layer>

 {/* 关键文件 */}
 <Layer title="关键文件与入口">
 <div className="grid grid-cols-1 gap-2 text-sm">
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/routing/routingStrategy.ts
 </code>
 <span className="text-body">RoutingStrategy、RoutingDecision 等类型定义</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/routing/modelRouterService.ts
 </code>
 <span className="text-body">ModelRouterService 入口</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/routing/strategies/compositeStrategy.ts
 </code>
 <span className="text-body">责任链模式组合策略</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/routing/strategies/classifierStrategy.ts
 </code>
 <span className="text-body">LLM 复杂度分类策略</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/routing/strategies/fallbackStrategy.ts
 </code>
 <span className="text-body">模型可用性检查策略</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/routing/strategies/overrideStrategy.ts
 </code>
 <span className="text-body">用户覆盖策略</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/core/src/routing/strategies/defaultStrategy.ts
 </code>
 <span className="text-body">默认模型终端策略</span>
 </div>
 </div>
 </Layer>

 {/* 设计决策 */}
 <Layer title="设计决策">
 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么使用责任链模式？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>使用 CompositeStrategy 实现责任链模式。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>解耦</strong>：每个策略独立开发、测试</li>
 <li><strong>可扩展</strong>：新增策略只需插入链条</li>
 <li><strong>优雅降级</strong>：策略失败时自动跳过，不中断整链</li>
 <li><strong>类型安全</strong>：TerminalStrategy 保证链尾必有决策</li>
 </ul>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么 Classifier 使用 Flash 模型？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>ClassifierStrategy 使用轻量级模型进行复杂度评估。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>低延迟</strong>：分类本身不应成为瓶颈</li>
 <li><strong>成本效益</strong>：简单分类任务无需 Pro 模型</li>
 <li><strong>减少递归</strong>：避免分类器调用自身</li>
 </ul>
 <p><strong>权衡：</strong>分类准确性略有牺牲，但通过 rubric 设计弥补。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">为什么过滤工具调用历史？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策：</strong>ClassifierStrategy 过滤 FunctionCall/FunctionResponse。</p>
 <p><strong>原因：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>减少噪声</strong>：工具调用细节对复杂度判断干扰大</li>
 <li><strong>聚焦意图</strong>：用户消息更能反映任务复杂度</li>
 <li><strong>Token 效率</strong>：减少分类请求的 token 消耗</li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
