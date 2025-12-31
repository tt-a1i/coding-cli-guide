// @ts-nocheck - visualData uses Record<string, unknown>
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--purple)]/10 to-[var(--amber)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button onClick={onToggle} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔀</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              模型路由系统采用策略链模式，根据任务复杂度和用户配置智能选择最合适的模型（Flash 快速 vs Pro 强大）。
            </p>
          </div>
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">⛓️ 5 种路由策略</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2 text-xs">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-red-400">Override</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-amber-400">Classifier</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-cyan-400">Fallback</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-purple-400">Composite</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-gray-400">Default</div>
            </div>
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
    description: '用户请求需要选择合适的模型执行',
    codeSnippet: `// modelRouterService.ts:30-50
interface RoutingRequest {
  userMessage: string;
  context: {
    sessionHistory: Message[];
    currentModel?: string;
    userPreference?: 'flash' | 'pro';
  };
}

async route(request: RoutingRequest): Promise<ModelChoice> {
  // 用户请求
  // "帮我分析这个复杂的分布式系统架构"
  return this.strategyChain.execute(request);
}`,
    visualData: { message: '帮我分析这个复杂的分布式系统架构' },
    highlight: '复杂任务请求',
  },
  {
    phase: 'override_check',
    group: 'override',
    title: '用户覆盖检查',
    description: 'OverrideStrategy 检查用户是否指定了模型',
    codeSnippet: `// strategies/overrideStrategy.ts:20-45
class OverrideStrategy implements RoutingStrategy {
  async execute(request: RoutingRequest): Promise<ModelChoice | null> {
    // 检查用户偏好
    if (request.context.userPreference) {
      return {
        model: request.context.userPreference,
        reason: 'User preference override',
        confidence: 1.0
      };
    }

    // 检查环境变量
    if (process.env.GEMINI_MODEL) {
      return {
        model: process.env.GEMINI_MODEL,
        reason: 'Environment variable override'
      };
    }

    return null; // 继续下一个策略
  }
}`,
    visualData: { userPreference: null, envVar: null, result: 'continue' },
    highlight: '无覆盖 → 继续',
  },
  {
    phase: 'classifier_analyze',
    group: 'classifier',
    title: '复杂度分析',
    description: 'ClassifierStrategy 使用 LLM 分析任务复杂度',
    codeSnippet: `// strategies/classifierStrategy.ts:30-70
class ClassifierStrategy implements RoutingStrategy {
  async execute(request: RoutingRequest): Promise<ModelChoice | null> {
    const analysis = await this.analyzeComplexity(request);

    return {
      model: analysis.complexity === 'high' ? 'pro' : 'flash',
      reason: analysis.reasoning,
      confidence: analysis.confidence
    };
  }

  private async analyzeComplexity(request: RoutingRequest) {
    const prompt = \`分析以下任务的复杂度:
    任务: \${request.userMessage}

    返回 JSON:
    {
      "complexity": "low" | "medium" | "high",
      "reasoning": "分析理由",
      "confidence": 0.0-1.0
    }\`;

    return await this.llm.analyze(prompt);
  }
}`,
    visualData: { analyzing: true, task: '分布式系统架构分析' },
    highlight: 'LLM 分析中',
  },
  {
    phase: 'classifier_decide',
    group: 'classifier',
    title: '分类结果',
    description: 'LLM 返回复杂度分析结果',
    codeSnippet: `// 分析结果
{
  "complexity": "high",
  "reasoning": "任务涉及分布式系统架构分析，需要理解：
    - 微服务通信模式
    - 数据一致性策略
    - 容错和扩展性
    这些需要深度推理能力",
  "confidence": 0.92
}

// 选择模型
complexity: "high" → model: "pro"`,
    visualData: {
      complexity: 'high',
      confidence: 0.92,
      model: 'pro',
      reasoning: '涉及分布式系统，需要深度推理'
    },
    highlight: 'high → Pro',
  },
  {
    phase: 'fallback_check',
    group: 'fallback',
    title: '故障转移检查',
    description: 'FallbackStrategy 检查选定模型是否可用',
    codeSnippet: `// strategies/fallbackStrategy.ts:20-50
class FallbackStrategy implements RoutingStrategy {
  async validate(choice: ModelChoice): Promise<ModelChoice> {
    const isAvailable = await this.checkModelHealth(choice.model);

    if (!isAvailable) {
      console.warn('[Router] Model', choice.model, 'unavailable');
      return {
        model: this.getFallbackModel(choice.model),
        reason: 'Fallback due to model unavailability',
        confidence: 0.8
      };
    }

    return choice;
  }

  private getFallbackModel(model: string): string {
    return model === 'pro' ? 'flash' : 'pro';
  }
}

// Pro 模型可用，无需故障转移`,
    visualData: { model: 'pro', available: true, fallback: false },
    highlight: 'Pro 可用',
  },
  {
    phase: 'model_select',
    group: 'output',
    title: '最终选择',
    description: '策略链完成，返回最终模型选择',
    codeSnippet: `// modelRouterService.ts:80-100
async route(request: RoutingRequest): Promise<ModelChoice> {
  // 1. Override → null (继续)
  // 2. Classifier → { model: 'pro', confidence: 0.92 }
  // 3. Fallback → 验证通过

  const choice: ModelChoice = {
    model: 'gemini-2.0-pro',
    reason: 'High complexity task requires Pro model',
    confidence: 0.92,
    strategy: 'ClassifierStrategy'
  };

  console.log('[Router] Selected:', choice.model);
  return choice;
}`,
    visualData: {
      finalChoice: {
        model: 'gemini-2.0-pro',
        confidence: 0.92,
        strategy: 'ClassifierStrategy'
      }
    },
    highlight: 'gemini-2.0-pro',
  },
  {
    phase: 'result',
    group: 'output',
    title: '执行请求',
    description: '使用选定模型处理用户请求',
    codeSnippet: `// core/geminiChat.ts:150-170
const modelChoice = await this.router.route(request);

const response = await this.llmClient.chat({
  model: modelChoice.model,  // 'gemini-2.0-pro'
  messages: request.messages,
  tools: request.tools
});

// 使用 Pro 模型处理复杂的系统架构分析
// → 高质量的深度分析结果`,
    visualData: { executing: true, model: 'gemini-2.0-pro' },
    highlight: '执行中',
  },
];

const groupColors: Record<PhaseGroup, string> = {
  input: '#3b82f6',
  override: '#ef4444',
  classifier: '#f59e0b',
  fallback: '#22c55e',
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
        <p className="text-gray-400">责任链模式的智能模型选择</p>
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
          <div className="rounded-xl p-6 border" style={{ borderColor: `${groupColors[step.group]}50`, background: `linear-gradient(135deg, ${groupColors[step.group]}10, rgba(0,0,0,0.8))` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: groupColors[step.group], color: 'white' }}>{currentStep + 1}</div>
              <div>
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>
            {step.highlight && (
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${groupColors[step.group]}20`, color: groupColors[step.group] }}>{step.highlight}</div>
            )}
          </div>

          {step.visualData?.complexity && (
            <div className="p-4 rounded-lg border-2" style={{ borderColor: step.visualData.complexity === 'high' ? '#f59e0b' : '#22c55e', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">复杂度分析</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${step.visualData.complexity === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                  {step.visualData.complexity as string}
                </span>
              </div>
              <div className="text-sm text-gray-300 mt-2">{step.visualData.reasoning as string}</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-gray-500 text-xs">置信度:</span>
                <div className="flex-1 h-2 rounded-full bg-gray-700">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${(step.visualData.confidence as number) * 100}%` }} />
                </div>
                <span className="text-amber-400 text-xs">{Math.round((step.visualData.confidence as number) * 100)}%</span>
              </div>
            </div>
          )}

          {step.visualData?.finalChoice && (
            <div className="p-4 rounded-lg border-2 border-purple-500 bg-purple-500/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400 text-lg">🎯</span>
                <span className="font-bold text-white">最终选择</span>
              </div>
              <code className="text-lg text-purple-400">{(step.visualData.finalChoice as { model: string }).model}</code>
              <div className="text-xs text-gray-400 mt-1">Strategy: {(step.visualData.finalChoice as { strategy: string }).strategy}</div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 font-mono">源码实现</h3>
          <div className="rounded-xl overflow-hidden border border-gray-800" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="p-1 border-b border-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-gray-500 ml-2 font-mono">modelRouterService.ts</span>
            </div>
            <JsonBlock code={step.codeSnippet} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
        <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700">重置</button>
        <button onClick={handlePrev} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50">上一步</button>
        <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-lg font-medium ${isPlaying ? 'bg-amber-600 text-white' : 'bg-[var(--purple)] text-white'}`}>{isPlaying ? '暂停' : '自动播放'}</button>
        <button onClick={handleNext} disabled={currentStep === routingSequence.length - 1} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50">下一步</button>
      </div>
    </div>
  );
}
