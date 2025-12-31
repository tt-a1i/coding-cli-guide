// @ts-nocheck - visualData uses Record<string, unknown>
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button onClick={onToggle} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              Agent 执行循环是 LocalAgentExecutor 的核心，通过迭代调用 LLM 和执行工具完成复杂任务，直到调用 complete_task 工具或达到终止条件。
            </p>
          </div>
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🔄 6 种终止模式</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-green-400">GOAL</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-amber-400">MAX_TURNS</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-red-400">TIMEOUT</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-red-400">ERROR</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-gray-400">ABORTED</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-purple-400">NO_COMPLETE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type AgentPhase = 'init' | 'turn_start' | 'llm_call' | 'tool_check' | 'tool_execute' | 'result_process' | 'complete_check' | 'final_warning' | 'terminate';
type PhaseGroup = 'setup' | 'turn' | 'tools' | 'complete';

interface AgentStep {
  phase: AgentPhase;
  group: PhaseGroup;
  title: string;
  description: string;
  codeSnippet: string;
  visualData?: Record<string, unknown>;
  highlight?: string;
}

const agentSequence: AgentStep[] = [
  {
    phase: 'init',
    group: 'setup',
    title: '初始化 Agent',
    description: 'LocalAgentExecutor 加载 Agent 配置并初始化执行环境',
    codeSnippet: `// local-executor.ts:30-60
class LocalAgentExecutor {
  private turnCount = 0;
  private startTime = Date.now();

  async run(query: string): Promise<AgentResult> {
    const agent = await this.registry.get(this.agentName);

    // 构建初始消息
    const messages: Message[] = [{
      role: 'system',
      content: this.buildSystemPrompt(agent)
    }, {
      role: 'user',
      content: query
    }];

    // 注入 complete_task 工具
    const tools = [...agent.tools, completeTaskTool];

    return this.executionLoop(messages, tools);
  }
}`,
    visualData: { agentName: 'CodebaseInvestigator', turnLimit: 10, tools: 5 },
    highlight: '加载配置',
  },
  {
    phase: 'turn_start',
    group: 'turn',
    title: 'Turn 开始',
    description: '检查终止条件后开始新一轮执行',
    codeSnippet: `// local-executor.ts:80-110
private async executionLoop(
  messages: Message[],
  tools: Tool[]
): Promise<AgentResult> {
  while (true) {
    this.turnCount++;

    // 检查 MAX_TURNS
    if (this.turnCount > this.config.maxTurns) {
      return this.terminate('MAX_TURNS');
    }

    // 检查 TIMEOUT
    const elapsed = Date.now() - this.startTime;
    if (elapsed > this.config.maxTimeMs) {
      return this.terminate('TIMEOUT');
    }

    // 执行一轮
    const result = await this.executeTurn(messages, tools);
    if (result.terminated) {
      return result;
    }
  }
}`,
    visualData: { turn: 1, maxTurns: 10, elapsed: '0s', maxTime: '300s' },
    highlight: 'Turn 1/10',
  },
  {
    phase: 'llm_call',
    group: 'turn',
    title: 'LLM 调用',
    description: 'Agent 调用 LLM 获取下一步行动',
    codeSnippet: `// local-executor.ts:120-150
private async executeTurn(
  messages: Message[],
  tools: Tool[]
): Promise<TurnResult> {
  const response = await this.llm.chat({
    model: this.config.model,
    messages,
    tools,
    toolChoice: 'auto'
  });

  // LLM 响应
  // {
  //   content: "我需要先查看项目结构...",
  //   toolCalls: [{
  //     name: "Glob",
  //     arguments: { pattern: "**/*.ts" }
  //   }]
  // }

  messages.push({ role: 'assistant', ...response });
  return this.processResponse(response, messages);
}`,
    visualData: {
      response: {
        content: '我需要先查看项目结构...',
        toolCalls: [{ name: 'Glob', args: { pattern: '**/*.ts' } }]
      }
    },
    highlight: 'LLM 响应',
  },
  {
    phase: 'tool_check',
    group: 'tools',
    title: '工具调用检查',
    description: '检查 LLM 是否请求工具调用',
    codeSnippet: `// local-executor.ts:160-190
private async processResponse(
  response: LLMResponse,
  messages: Message[]
): Promise<TurnResult> {
  // 检查是否有工具调用
  if (!response.toolCalls || response.toolCalls.length === 0) {
    // 无工具调用，检查是否应该结束
    console.warn('[Agent] No tool calls, may be stuck');
    return { terminated: false };
  }

  // 检查是否调用了 complete_task
  const completeCall = response.toolCalls.find(
    tc => tc.name === 'complete_task'
  );
  if (completeCall) {
    return this.handleComplete(completeCall);
  }

  // 执行其他工具
  return this.executeTools(response.toolCalls, messages);
}`,
    visualData: { hasToolCalls: true, toolCount: 1, isComplete: false },
    highlight: '1 个工具调用',
  },
  {
    phase: 'tool_execute',
    group: 'tools',
    title: '执行工具',
    description: '执行 LLM 请求的工具并收集结果',
    codeSnippet: `// local-executor.ts:200-240
private async executeTools(
  toolCalls: ToolCall[],
  messages: Message[]
): Promise<TurnResult> {
  const results: ToolResult[] = [];

  for (const call of toolCalls) {
    const tool = this.tools.get(call.name);
    if (!tool) {
      results.push({
        name: call.name,
        error: 'Tool not found'
      });
      continue;
    }

    const result = await tool.execute(call.arguments);
    results.push({
      name: call.name,
      output: result
    });
  }

  // 添加工具结果到消息
  messages.push({
    role: 'tool',
    content: results
  });

  return { terminated: false };
}`,
    visualData: {
      executing: 'Glob',
      pattern: '**/*.ts',
      result: '找到 42 个 TypeScript 文件'
    },
    highlight: '执行 Glob',
  },
  {
    phase: 'result_process',
    group: 'turn',
    title: '处理结果',
    description: '工具结果添加到消息历史，准备下一轮',
    codeSnippet: `// Turn 1 完成
// 消息历史:
// 1. system: Agent 系统提示
// 2. user: 原始查询
// 3. assistant: "我需要先查看项目结构..."
//              + toolCalls: [Glob]
// 4. tool: Glob 结果 (42 个文件)

// 继续下一轮...
this.turnCount++;  // turn = 2

// Turn 2: LLM 分析文件列表
// Turn 3: LLM 读取关键文件
// ...
// Turn N: LLM 调用 complete_task`,
    visualData: { turn: 2, messageCount: 4, nextAction: '继续执行' },
    highlight: '继续 Turn 2',
  },
  {
    phase: 'complete_check',
    group: 'complete',
    title: 'complete_task 调用',
    description: 'LLM 调用 complete_task 表示任务完成',
    codeSnippet: `// Turn 5: LLM 认为任务完成
// response.toolCalls:
{
  name: 'complete_task',
  arguments: {
    result: '项目分析完成。发现以下关键模块：\\n' +
            '1. core/ - 核心逻辑\\n' +
            '2. tools/ - 工具实现\\n' +
            '3. agents/ - Agent 框架'
  }
}

// handleComplete 处理
private handleComplete(call: ToolCall): TurnResult {
  return {
    terminated: true,
    mode: 'GOAL',
    result: call.arguments.result
  };
}`,
    visualData: {
      completeTask: true,
      result: '项目分析完成，发现 3 个核心模块'
    },
    highlight: 'complete_task',
  },
  {
    phase: 'final_warning',
    group: 'complete',
    title: '最终警告机制',
    description: '如果接近限制仍未完成，发送警告提示',
    codeSnippet: `// local-executor.ts:280-310
// 如果 turnCount >= maxTurns - 1 且未调用 complete_task
private async executeFinalWarningTurn(
  messages: Message[],
  tools: Tool[]
): Promise<TurnResult> {
  // 添加警告消息
  messages.push({
    role: 'user',
    content: \`警告：你只剩 1 轮机会。
    必须立即调用 complete_task 工具返回结果。
    如果不调用，任务将以 ERROR_NO_COMPLETE_TASK_CALL 终止。\`
  });

  // 给 Agent 60 秒宽限期
  const response = await this.llm.chat({
    messages,
    tools,
    timeout: 60000
  });

  return this.processResponse(response, messages);
}`,
    visualData: { warning: true, turnsLeft: 1, graceTimeout: '60s' },
    highlight: '60s 宽限期',
  },
  {
    phase: 'terminate',
    group: 'complete',
    title: '任务终止',
    description: 'Agent 正常完成，返回结果',
    codeSnippet: `// local-executor.ts:320-350
private terminate(mode: AgentTerminateMode): AgentResult {
  const elapsed = Date.now() - this.startTime;

  return {
    terminateMode: mode,
    result: mode === 'GOAL' ? this.result : null,
    turns: this.turnCount,
    elapsedMs: elapsed,
    success: mode === 'GOAL'
  };
}

// 最终结果
{
  terminateMode: 'GOAL',
  result: '项目分析完成...',
  turns: 5,
  elapsedMs: 12500,
  success: true
}`,
    visualData: {
      terminateMode: 'GOAL',
      turns: 5,
      elapsed: '12.5s',
      success: true
    },
    highlight: 'GOAL - 成功',
  },
];

const groupColors: Record<PhaseGroup, string> = {
  setup: '#3b82f6',
  turn: '#8b5cf6',
  tools: '#f59e0b',
  complete: '#22c55e',
};

const groupNames: Record<PhaseGroup, string> = {
  setup: '初始化',
  turn: '执行轮次',
  tools: '工具调用',
  complete: '任务完成',
};

export function AgentLoopAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const step = agentSequence[currentStep];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (currentStep < agentSequence.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => setCurrentStep(prev => Math.max(0, prev - 1)), []);
  const handleNext = useCallback(() => setCurrentStep(prev => Math.min(agentSequence.length - 1, prev + 1)), []);
  const handleReset = useCallback(() => { setCurrentStep(0); setIsPlaying(false); }, []);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[var(--terminal-green)] mb-2 font-mono">Agent 执行循环</h1>
        <p className="text-gray-400">LocalAgentExecutor 的迭代执行流程</p>
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
          {agentSequence.map((s, i) => (
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

          {step.visualData?.response && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <div className="text-xs text-gray-500 mb-2 font-mono">LLM 响应</div>
              <div className="text-sm text-gray-300 mb-2">{(step.visualData.response as { content: string }).content}</div>
              {(step.visualData.response as { toolCalls?: Array<{ name: string; args: Record<string, string> }> }).toolCalls && (
                <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30">
                  <span className="text-amber-400 text-xs">Tool Call: </span>
                  <code className="text-amber-300">{(step.visualData.response as { toolCalls: Array<{ name: string }> }).toolCalls[0].name}</code>
                </div>
              )}
            </div>
          )}

          {step.visualData?.executing && (
            <div className="p-4 rounded-lg border-2 border-amber-500/50 bg-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-400 animate-spin">⟳</span>
                <span className="font-bold text-white">执行工具: {step.visualData.executing as string}</span>
              </div>
              <code className="text-xs text-gray-400">{step.visualData.pattern as string}</code>
              <div className="mt-2 text-sm text-green-400">{step.visualData.result as string}</div>
            </div>
          )}

          {step.visualData?.terminateMode && (
            <div className={`p-4 rounded-lg border-2 ${step.visualData.success ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold text-lg ${step.visualData.success ? 'text-green-400' : 'text-red-400'}`}>
                  {step.visualData.terminateMode as string}
                </span>
                <span className="text-gray-400 text-sm">{step.visualData.turns as number} turns / {step.visualData.elapsed as string}</span>
              </div>
              {step.visualData.success && (
                <div className="text-green-400 flex items-center gap-2">
                  <span>✓</span>
                  <span>任务成功完成</span>
                </div>
              )}
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
              <span className="text-xs text-gray-500 ml-2 font-mono">local-executor.ts</span>
            </div>
            <JsonBlock code={step.codeSnippet} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
        <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700">重置</button>
        <button onClick={handlePrev} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50">上一步</button>
        <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-lg font-medium ${isPlaying ? 'bg-amber-600 text-white' : 'bg-[var(--terminal-green)] text-black'}`}>{isPlaying ? '暂停' : '自动播放'}</button>
        <button onClick={handleNext} disabled={currentStep === agentSequence.length - 1} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-50">下一步</button>
      </div>
    </div>
  );
}
