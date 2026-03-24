// @ts-nocheck - visualData uses Record<string, unknown>
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--purple)]/10 to-[var(--amber)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button onClick={onToggle} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              模型路由系统采用策略链模式，根据任务复杂度和用户配置智能选择最合适的模型（Flash 快速 vs Pro 强大）。
            </p>
          </div>
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">策略链执行顺序</h4>
            <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-accent border border-accent/30">Composite</div>
              <span className="text-dim">→</span>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-accent border border-accent/30">Fallback</div>
              <span className="text-dim">→</span>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-heading border-l-2 border-l-edge-hover/30">Override</div>
              <span className="text-dim">→</span>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-heading border-l-2 border-l-edge-hover/30">Classifier</div>
              <span className="text-dim">→</span>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-dim border border-edge/60">Default</div>
            </div>
            <p className="text-xs text-dim mt-2">Chain of Responsibility 模式：每个策略返回 null 则继续下一个</p>
          </div>
        </div>
      )}
    </div>
  );
}

type RoutingPhase = 'request' | 'override_check' | 'classifier_analyze' | 'classifier_decide' | 'fallback_check' | 'model_select' | 'result';
type PhaseGroup = 'input' | 'override' | 'classifier' | 'fallback' | 'output';

interface RoutingStep {
  phase: RoutingPhase;
  group: PhaseGroup;
  title: string;
  description: string;
  codeSnippet: string;
  visualData?: Record<string, unknown>;
  highlight?: string;
}

const routingSequence: RoutingStep[] = [
  {
    phase: 'request',
    group: 'input',
    title: '接收路由请求',
    description: 'ModelRouterService 接收路由上下文，包含历史消息和当前请求',
    codeSnippet: `// routing/routingStrategy.ts - 核心类型定义
export interface RoutingContext {
  history: Content[];      // 对话历史
  request: PartListUnion;  // 当前请求
  signal: AbortSignal;     // 取消信号
}

export interface RoutingDecision {
  model: string;           // 选择的模型
  metadata: {
    source: string;        // 决策来源策略
    latencyMs: number;     // 决策耗时
    reasoning: string;     // 决策理由
    error?: string;        // 错误信息（如有）
  };
}

// RoutingStrategy: 可以返回 null 继续链
// TerminalStrategy: 必须返回决策（链终结者）`,
    visualData: { message: '帮我分析这个复杂的分布式系统架构' },
    highlight: '复杂任务请求',
  },
  {
    phase: 'override_check',
    group: 'override',
    title: 'CompositeStrategy 协调',
    description: 'CompositeStrategy 作为协调者，按顺序尝试每个策略',
    codeSnippet: `// strategies/compositeStrategy.ts - 责任链协调器
export class CompositeStrategy implements TerminalStrategy {
  constructor(private readonly strategies: RoutingStrategy[]) {}

  async route(context: RoutingContext): Promise<RoutingDecision> {
    const start = Date.now();

    // 依次尝试每个策略
    for (const strategy of this.strategies) {
      try {
        const decision = await strategy.route(context);
        if (decision !== null) {
          return this.finalizeDecision(decision, start);
        }
      } catch (error) {
        // 策略失败不中断链，继续尝试
        console.warn('[Router] Strategy failed:', error);
      }
    }

    // 不应该到达这里（DefaultStrategy 是终结者）
    throw new Error('No strategy returned a decision');
  }

  private finalizeDecision(decision: RoutingDecision, start: number) {
    decision.metadata.latencyMs = Date.now() - start;
    return decision;
  }
}`,
    visualData: { strategies: ['Fallback', 'Override', 'Classifier', 'Default'], current: 0 },
    highlight: '链式调用开始',
  },
  {
    phase: 'classifier_analyze',
    group: 'classifier',
    title: 'ClassifierStrategy 分析',
    description: 'ClassifierStrategy 使用 LLM 分析任务复杂度，决定使用 Flash 还是 Pro',
    codeSnippet: `// strategies/classifierStrategy.ts - 复杂度分类器
const COMPLEXITY_RUBRIC = \`
## COMPLEX Task Indicators (Pro model):
- Requires 4+ distinct tool operations
- Involves strategic planning or multi-step decisions
- Contains ambiguity requiring clarification
- Needs debugging or root cause analysis

## SIMPLE Task Indicators (Flash model):
- Can complete in 1-3 tool calls
- Has clear, unambiguous instructions
- Is routine/mechanical in nature
\`;

export class ClassifierStrategy implements RoutingStrategy {
  async route(context: RoutingContext): Promise<RoutingDecision | null> {
    // 清理历史（移除 FunctionCall/Response）
    const cleanedHistory = this.filterHistory(context.history);
    // 取最后 4 轮
    const recentTurns = cleanedHistory.slice(-4);

    const classification = await this.classify(recentTurns, context.request);

    return {
      model: classification === 'COMPLEX' ? PRO_MODEL : FLASH_MODEL,
      metadata: {
        source: 'ClassifierStrategy',
        reasoning: \`Task classified as \${classification}\`,
        latencyMs: 0
      }
    };
  }
}`,
    visualData: { analyzing: true, task: '分布式系统架构分析' },
    highlight: 'LLM 分类中',
  },
  {
    phase: 'classifier_decide',
    group: 'classifier',
    title: '分类结果',
    description: 'LLM 返回 COMPLEX/SIMPLE 分类结果',
    codeSnippet: `// 分类结果示例
// 任务: "帮我分析这个复杂的分布式系统架构"

LLM 分析:
- 需要理解微服务通信模式 ✓
- 涉及数据一致性策略 ✓
- 需要考虑容错和扩展性 ✓
- 属于战略规划类任务 ✓

分类结果: COMPLEX

// RoutingDecision
{
  model: 'gemini-2.0-flash-thinking-exp',  // Pro model
  metadata: {
    source: 'ClassifierStrategy',
    reasoning: 'Task classified as COMPLEX',
    latencyMs: 0  // 由 CompositeStrategy 填充
  }
}`,
    visualData: {
      complexity: 'COMPLEX',
      confidence: 0.92,
      model: 'gemini-2.0-flash-thinking-exp',
      reasoning: '涉及分布式系统，需要深度推理'
    },
    highlight: 'COMPLEX → Pro',
  },
  {
    phase: 'fallback_check',
    group: 'fallback',
    title: 'FallbackStrategy 检查',
    description: 'FallbackStrategy 在链首位，检查模型可用性',
    codeSnippet: `// strategies/fallbackStrategy.ts - 故障转移策略
export class FallbackStrategy implements RoutingStrategy {
  async route(context: RoutingContext): Promise<RoutingDecision | null> {
    // 检查主模型是否可用
    const primaryAvailable = await this.checkModelAvailability(
      this.primaryModel
    );

    if (!primaryAvailable) {
      // 主模型不可用，直接返回备用模型
      return {
        model: this.fallbackModel,
        metadata: {
          source: 'FallbackStrategy',
          reasoning: 'Primary model unavailable, using fallback',
          latencyMs: 0
        }
      };
    }

    // 主模型可用，继续链中下一个策略
    return null;
  }
}

// 本例中: 模型可用 → 返回 null → 继续链`,
    visualData: { model: 'pro', available: true, fallback: false },
    highlight: '模型可用',
  },
  {
    phase: 'model_select',
    group: 'output',
    title: '最终决策',
    description: 'CompositeStrategy 收到非 null 决策，添加耗时并返回',
    codeSnippet: `// compositeStrategy.ts - 最终处理
private finalizeDecision(
  decision: RoutingDecision,
  start: number
): RoutingDecision {
  // 填充最终耗时
  decision.metadata.latencyMs = Date.now() - start;
  return decision;
}

// 最终 RoutingDecision
{
  model: 'gemini-2.0-flash-thinking-exp',
  metadata: {
    source: 'ClassifierStrategy',
    reasoning: 'Task classified as COMPLEX',
    latencyMs: 127  // 总决策耗时
  }
}

// Telemetry 记录
telemetry.log('routing_decision', decision);`,
    visualData: {
      finalChoice: {
        model: 'gemini-2.0-flash-thinking-exp',
        latencyMs: 127,
        source: 'ClassifierStrategy'
      }
    },
    highlight: 'Pro Model',
  },
  {
    phase: 'result',
    group: 'output',
    title: '模型调用',
    description: '使用选定模型执行请求',
    codeSnippet: `// modelRouterService.ts - 执行路由
export class ModelRouterService {
  private readonly strategy: TerminalStrategy;

  constructor(config: Config, telemetry: Telemetry) {
    // 初始化策略链
    this.strategy = new CompositeStrategy([
      new FallbackStrategy(config),
      new OverrideStrategy(config),
      new ClassifierStrategy(config),
      new DefaultStrategy(config),  // 终结者
    ]);
  }

  async route(context: RoutingContext): Promise<RoutingDecision> {
    const decision = await this.strategy.route(context);
    this.telemetry.recordRoutingDecision(decision);
    return decision;
  }
}

// 使用 Pro 模型处理复杂架构分析 ✓`,
    visualData: { executing: true, model: 'gemini-2.0-flash-thinking-exp' },
    highlight: '执行中',
  },
];

const groupColors: Record<PhaseGroup, string> = {
  input: 'var(--color-info)',
  override: 'var(--color-danger)',
  classifier: 'var(--color-warning)',
  fallback: 'var(--color-success)',
  output: '#8b5cf6',
};

const groupNames: Record<PhaseGroup, string> = {
  input: '请求输入',
  override: '覆盖检查',
  classifier: '复杂度分类',
  fallback: '故障转移',
  output: '模型输出',
};

export function RoutingChainAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const step = routingSequence[currentStep];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (currentStep < routingSequence.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => setCurrentStep(prev => Math.max(0, prev - 1)), []);
  const handleNext = useCallback(() => setCurrentStep(prev => Math.min(routingSequence.length - 1, prev + 1)), []);
  const handleReset = useCallback(() => { setCurrentStep(0); setIsPlaying(false); }, []);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[var(--purple)] mb-2 font-mono">路由策略链</h1>
        <p className="text-dim">责任链模式的智能模型选择</p>
      </div>

      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(groupNames) as PhaseGroup[]).map((group) => (
            <div key={group} className={`px-3 py-1 rounded-full text-xs font-medium ${step.group === group ? 'shadow-lg' : 'opacity-50'}`}
              style={{ backgroundColor: step.group === group ? `${groupColors[group]}20` : 'transparent', color: groupColors[group], border: `1px solid ${step.group === group ? groupColors[group] : 'transparent'}` }}>
              {groupNames[group]}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-1">
          {routingSequence.map((s, i) => (
            <button key={i} onClick={() => setCurrentStep(i)} className="flex-1 h-2 rounded-full transition-all cursor-pointer"
              style={{ backgroundColor: i === currentStep ? groupColors[s.group] : i < currentStep ? `${groupColors[s.group]}80` : '#374151' }} title={s.title} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="rounded-xl p-6 border" style={{ borderColor: `${groupColors[step.group]}50`, background: `linear-gradient(135deg, ${groupColors[step.group]}10, var(--color-bg))` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: groupColors[step.group], color: 'white' }}>{currentStep + 1}</div>
              <div>
                <h2 className="text-xl font-bold text-heading">{step.title}</h2>
                <p className="text-sm text-dim">{step.description}</p>
              </div>
            </div>
            {step.highlight && (
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${groupColors[step.group]}20`, color: groupColors[step.group] }}>{step.highlight}</div>
            )}
          </div>

          {step.visualData?.complexity && (
            <div className="p-4 rounded-lg border-2 bg-surface" style={{ borderColor: step.visualData.complexity === 'high' ? 'var(--color-warning)' : 'var(--color-success)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-dim">复杂度分析</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${step.visualData.complexity === 'high' ? 'bg-elevated text-heading' : 'bg-elevated text-heading'}`}>
                  {step.visualData.complexity as string}
                </span>
              </div>
              <div className="text-sm text-body mt-2">{step.visualData.reasoning as string}</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-dim text-xs">置信度:</span>
                <div className="flex-1 h-2 rounded-full bg-elevated">
                  <div className="h-full rounded-full bg-[var(--color-warning)]" style={{ width: `${(step.visualData.confidence as number) * 100}%` }} />
                </div>
                <span className="text-heading text-xs">{Math.round((step.visualData.confidence as number) * 100)}%</span>
              </div>
            </div>
          )}

          {step.visualData?.finalChoice && (
            <div className="p-4 rounded-lg border-2 border-accent bg-accent-light">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-accent text-lg">🎯</span>
                <span className="font-bold text-heading">最终选择</span>
              </div>
              <code className="text-lg text-accent">{(step.visualData.finalChoice as { model: string }).model}</code>
              <div className="text-xs text-dim mt-1">Strategy: {(step.visualData.finalChoice as { strategy: string }).strategy}</div>
            </div>
          )}
        </div>

        <div>
          <JsonBlock code={step.codeSnippet} title="modelRouterService.ts" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
        <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated">重置</button>
        <button onClick={handlePrev} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-surface text-body disabled:opacity-50">上一步</button>
        <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-lg font-medium ${isPlaying ? 'bg-[var(--color-warning)] text-heading' : 'bg-[var(--purple)] text-heading'}`}>{isPlaying ? '暂停' : '自动播放'}</button>
        <button onClick={handleNext} disabled={currentStep === routingSequence.length - 1} className="px-4 py-2 rounded-lg bg-surface text-body disabled:opacity-50">下一步</button>
      </div>
    </div>
  );
}
