import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'policy-engine', label: 'Policy 策略引擎', description: '安全决策系统' },
  { id: 'gemini-chat-core', label: 'Gemini Chat', description: 'AI 模型调用' },
  { id: 'subagent', label: '子代理系统', description: 'Agent 模型选择' },
  { id: 'config-system', label: '配置系统', description: '模型配置管理' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔀</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          {/* 一句话总结 */}
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--cyber-blue)] font-bold">一句话：</span>
              智能模型选择系统，通过责任链模式按优先级匹配策略，根据任务复杂度自动选择 Flash 或 Pro 模型
            </p>
          </div>

          {/* 关键数字 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">4</div>
              <div className="text-xs text-[var(--text-muted)]">路由策略</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">2</div>
              <div className="text-xs text-[var(--text-muted)]">模型层级</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">复杂度等级</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">1</div>
              <div className="text-xs text-[var(--text-muted)]">责任链模式</div>
            </div>
          </div>

          {/* 核心流程 */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">策略链执行顺序</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                Fallback
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                Override
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                Classifier
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                Default
              </span>
            </div>
          </div>

          {/* 源码入口 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
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

    style ROUTER fill:#1a1a2e,stroke:#00d4ff,stroke-width:2px
    style COMP fill:#2d1b4e,stroke:#a855f7,stroke-width:2px
    style CLASS fill:#1a2e1a,stroke:#4ade80,stroke-width:2px`;

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

    style B fill:#1a1a2e,stroke:#00d4ff,stroke-width:2px
    style C fill:#2d1b4e,stroke:#a855f7,stroke-width:2px
    style D fill:#1a2e1a,stroke:#4ade80,stroke-width:2px
    style E fill:#2e2a1a,stroke:#f59e0b,stroke-width:2px`;

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

    style LLM fill:#1a2e1a,stroke:#4ade80,stroke-width:2px
    style FLASH fill:#1a1a2e,stroke:#00d4ff,stroke-width:2px
    style PRO fill:#2d1b4e,stroke:#a855f7,stroke-width:2px`;

  const routingStrategyCode = `// 路由策略接口
export interface RoutingStrategy {
  route(
    context: RoutingContext
  ): Promise<RoutingDecision | undefined>;
}

// 终端策略 (链尾必须返回决策)
export interface TerminalStrategy {
  route(context: RoutingContext): Promise<RoutingDecision>;
}

// 路由上下文
export interface RoutingContext {
  history: CoreMessage[];   // 对话历史
  request: string;          // 当前请求
  signal: AbortSignal;      // 取消信号
}

// 路由决策
export interface RoutingDecision {
  model: string;            // 选定的模型
  metadata?: {              // 决策元数据
    strategy?: string;      // 决策策略名
    reason?: string;        // 决策原因
    complexity?: string;    // 复杂度等级
  };
}`;

  const compositeStrategyCode = `// 组合策略 - 责任链模式实现
export class CompositeStrategy implements TerminalStrategy {
  private strategies: RoutingStrategy[];
  private terminal: TerminalStrategy;

  constructor(
    strategies: RoutingStrategy[],
    terminal: TerminalStrategy
  ) {
    this.strategies = strategies;
    this.terminal = terminal;
  }

  async route(context: RoutingContext): Promise<RoutingDecision> {
    // 依次执行策略链
    for (const strategy of this.strategies) {
      const decision = await strategy.route(context);
      if (decision) {
        // 策略返回决策，终止链
        return decision;
      }
      // 策略返回 undefined，继续下一个
    }

    // 所有策略都未决策，使用终端策略
    return this.terminal.route(context);
  }
}`;

  const modelRouterServiceCode = `// ModelRouterService - 路由服务入口
export class ModelRouterService {
  private strategy: TerminalStrategy;

  constructor(
    private modelService: ModelService,
    private llmClient: LLMClient
  ) {
    // 构建策略链
    this.strategy = new CompositeStrategy(
      [
        new FallbackStrategy(modelService),     // 1. 检查模型可用性
        new OverrideStrategy(modelService),     // 2. 处理用户覆盖
        new ClassifierStrategy(llmClient),      // 3. 复杂度分类
      ],
      new DefaultStrategy(modelService)         // 终端: 默认模型
    );
  }

  async routeModel(context: RoutingContext): Promise<RoutingDecision> {
    return this.strategy.route(context);
  }
}`;

  const classifierStrategyCode = `// ClassifierStrategy - LLM 复杂度分类
export class ClassifierStrategy implements RoutingStrategy {
  private llmClient: LLMClient;

  // 分类 System Prompt
  private readonly CLASSIFIER_PROMPT = \`
You are a task complexity classifier.
Analyze the user's request and conversation history.

Output ONLY one word:
- SIMPLE: Quick tasks, 1-3 tool calls, single file operations
- COMPLEX: Multi-step planning, 4+ tool calls, multi-file coordination
- UNKNOWN: Cannot determine complexity
\`;

  async route(context: RoutingContext): Promise<RoutingDecision | undefined> {
    try {
      // 调用 LLM 进行复杂度评估
      const response = await this.llmClient.chat({
        model: 'gemini-2.0-flash',  // 使用轻量模型分类
        messages: [
          { role: 'system', content: this.CLASSIFIER_PROMPT },
          { role: 'user', content: this.buildClassifierInput(context) }
        ],
        signal: context.signal,
      });

      const complexity = response.trim().toUpperCase();

      switch (complexity) {
        case 'SIMPLE':
          return {
            model: 'gemini-2.0-flash',
            metadata: { strategy: 'classifier', complexity: 'simple' }
          };
        case 'COMPLEX':
          return {
            model: 'gemini-2.5-pro',
            metadata: { strategy: 'classifier', complexity: 'complex' }
          };
        default:
          return undefined;  // 传递给下一策略
      }
    } catch {
      return undefined;  // 出错时传递给下一策略
    }
  }
}`;

  const fallbackStrategyCode = `// FallbackStrategy - 模型可用性检查
export class FallbackStrategy implements RoutingStrategy {
  constructor(private modelService: ModelService) {}

  async route(context: RoutingContext): Promise<RoutingDecision | undefined> {
    // 检查首选模型是否可用
    const preferredModel = this.modelService.getPreferredModel();
    const isAvailable = await this.modelService.checkAvailability(
      preferredModel,
      context.signal
    );

    if (!isAvailable) {
      // 首选模型不可用，返回备用模型
      const fallbackModel = this.modelService.getFallbackModel();
      return {
        model: fallbackModel,
        metadata: {
          strategy: 'fallback',
          reason: \`\${preferredModel} unavailable\`
        }
      };
    }

    // 模型可用，传递给下一策略
    return undefined;
  }
}`;

  const overrideStrategyCode = `// OverrideStrategy - 用户模型覆盖
export class OverrideStrategy implements RoutingStrategy {
  constructor(private modelService: ModelService) {}

  async route(context: RoutingContext): Promise<RoutingDecision | undefined> {
    // 检查用户是否显式指定模型
    const userOverride = this.modelService.getUserModelOverride();

    if (userOverride) {
      // 用户指定了模型，直接使用
      return {
        model: userOverride,
        metadata: {
          strategy: 'override',
          reason: 'User explicit selection'
        }
      };
    }

    // 未指定，传递给下一策略
    return undefined;
  }
}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
          Model Routing 模型路由
        </h1>
        <p className="text-xl text-[var(--text-muted)]">
          智能模型选择系统 - 责任链模式的策略决策架构
        </p>
      </div>

      <QuickSummary
        isExpanded={isSummaryExpanded}
        onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
      />

      {/* 核心架构 */}
      <Layer title="核心架构">
        <p className="text-[var(--text-secondary)] mb-6">
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
              <li>• <strong>优先级</strong>: 最高 (第 1 个执行)</li>
              <li>• <strong>职责</strong>: 检查首选模型可用性</li>
              <li>• <strong>决策</strong>: 模型不可用时返回备用</li>
              <li>• <strong>传递</strong>: 模型可用时传递下一策略</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="OverrideStrategy" variant="purple">
            <ul className="text-sm space-y-1">
              <li>• <strong>优先级</strong>: 高 (第 2 个执行)</li>
              <li>• <strong>职责</strong>: 处理用户显式指定的模型</li>
              <li>• <strong>决策</strong>: 用户指定时直接返回</li>
              <li>• <strong>传递</strong>: 未指定时传递下一策略</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="ClassifierStrategy" variant="green">
            <ul className="text-sm space-y-1">
              <li>• <strong>优先级</strong>: 中 (第 3 个执行)</li>
              <li>• <strong>职责</strong>: LLM 分析任务复杂度</li>
              <li>• <strong>决策</strong>: 简单→Flash, 复杂→Pro</li>
              <li>• <strong>传递</strong>: 无法判断时传递下一策略</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="DefaultStrategy" variant="yellow">
            <ul className="text-sm space-y-1">
              <li>• <strong>优先级</strong>: 最低 (终端策略)</li>
              <li>• <strong>职责</strong>: 提供默认模型选择</li>
              <li>• <strong>决策</strong>: 必须返回决策 (TerminalStrategy)</li>
              <li>• <strong>传递</strong>: 不传递，链尾保底</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* 核心类型定义 */}
      <Layer title="核心类型定义">
        <p className="text-[var(--text-secondary)] mb-4">
          路由系统的核心接口定义：<code className="text-[var(--cyber-blue)]">RoutingStrategy</code>、
          <code className="text-[var(--cyber-blue)]">RoutingContext</code> 和
          <code className="text-[var(--cyber-blue)]">RoutingDecision</code>。
        </p>
        <CodeBlock code={routingStrategyCode} language="typescript" title="routingStrategy.ts" />

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-3">类型说明</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">类型</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">用途</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">关键字段</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--cyber-blue)]">RoutingStrategy</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">普通策略接口</td>
                  <td className="py-2 px-3 text-[var(--text-muted)]">route() 返回 Decision | undefined</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--purple)]">TerminalStrategy</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">终端策略接口</td>
                  <td className="py-2 px-3 text-[var(--text-muted)]">route() 必须返回 Decision</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--terminal-green)]">RoutingContext</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">路由请求上下文</td>
                  <td className="py-2 px-3 text-[var(--text-muted)]">history, request, signal</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--amber)]">RoutingDecision</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">路由决策结果</td>
                  <td className="py-2 px-3 text-[var(--text-muted)]">model, metadata?</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* CompositeStrategy 实现 */}
      <Layer title="CompositeStrategy 组合策略">
        <p className="text-[var(--text-secondary)] mb-4">
          <code className="text-[var(--cyber-blue)]">CompositeStrategy</code> 是责任链模式的核心实现。
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
        <p className="text-[var(--text-secondary)] mb-4">
          <code className="text-[var(--cyber-blue)]">ModelRouterService</code> 是路由系统的入口。
          它在构造时组装策略链，提供 <code>routeModel()</code> 方法供外部调用。
        </p>
        <CodeBlock code={modelRouterServiceCode} language="typescript" title="modelRouterService.ts" />
      </Layer>

      {/* ClassifierStrategy 详解 */}
      <Layer title="ClassifierStrategy 复杂度分类">
        <p className="text-[var(--text-secondary)] mb-4">
          <code className="text-[var(--cyber-blue)]">ClassifierStrategy</code> 使用轻量级 LLM
          分析任务复杂度，决定使用 Flash (快速/简单) 还是 Pro (强大/复杂) 模型。
        </p>

        <MermaidDiagram chart={classifierFlowChart} />

        <div className="mt-6">
          <CodeBlock code={classifierStrategyCode} language="typescript" title="classifierStrategy.ts" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="简单任务 → Flash" variant="blue">
            <ul className="text-sm space-y-1">
              <li>• 1-3 个工具调用</li>
              <li>• 单文件读写操作</li>
              <li>• 简单问答或解释</li>
              <li>• 格式转换或计算</li>
              <li>• 快速信息查询</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="复杂任务 → Pro" variant="purple">
            <ul className="text-sm space-y-1">
              <li>• 4+ 步骤规划</li>
              <li>• 多文件协调修改</li>
              <li>• 架构设计决策</li>
              <li>• 复杂调试分析</li>
              <li>• 跨模块重构</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* FallbackStrategy */}
      <Layer title="FallbackStrategy 可用性检查">
        <p className="text-[var(--text-secondary)] mb-4">
          <code className="text-[var(--cyber-blue)]">FallbackStrategy</code> 是策略链的第一道防线，
          确保在首选模型不可用时自动切换到备用模型，保证系统可用性。
        </p>
        <CodeBlock code={fallbackStrategyCode} language="typescript" title="fallbackStrategy.ts" />
      </Layer>

      {/* OverrideStrategy */}
      <Layer title="OverrideStrategy 用户覆盖">
        <p className="text-[var(--text-secondary)] mb-4">
          <code className="text-[var(--cyber-blue)]">OverrideStrategy</code> 处理用户的显式模型选择，
          当用户通过配置或命令行指定模型时，跳过自动路由逻辑。
        </p>
        <CodeBlock code={overrideStrategyCode} language="typescript" title="overrideStrategy.ts" />
      </Layer>

      {/* 策略优先级说明 */}
      <Layer title="策略优先级设计">
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            策略链的顺序经过精心设计，体现了不同决策因素的优先级：
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">顺序</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">策略</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">设计理由</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--cyber-blue)] font-bold">1</td>
                  <td className="py-2 px-3 text-[var(--text-primary)]">FallbackStrategy</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">
                    可用性优先：不可用的模型没有意义，首先确保选择可用的模型
                  </td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--purple)] font-bold">2</td>
                  <td className="py-2 px-3 text-[var(--text-primary)]">OverrideStrategy</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">
                    用户意图优先：用户显式指定的选择应该被尊重，跳过自动化逻辑
                  </td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--terminal-green)] font-bold">3</td>
                  <td className="py-2 px-3 text-[var(--text-primary)]">ClassifierStrategy</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">
                    智能选择：基于任务复杂度做最优选择，平衡性能和成本
                  </td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 text-[var(--amber)] font-bold">4</td>
                  <td className="py-2 px-3 text-[var(--text-primary)]">DefaultStrategy</td>
                  <td className="py-2 px-3 text-[var(--text-secondary)]">
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

          <HighlightBox title="与 Subagent 集成" variant="purple">
            <p className="text-sm">
              子代理系统使用 ModelRouterService 为不同类型的 Agent 选择合适的模型。
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

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
