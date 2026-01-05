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
    title: '创建 Agent Executor',
    description: 'LocalAgentExecutor.create() 工厂方法初始化执行环境',
    codeSnippet: `// local-executor.ts - 工厂方法创建
export class LocalAgentExecutor<TOutput> {
  // 创建执行器（推荐方式）
  static async create<TOutput>(
    definition: LocalAgentDefinition<TOutput>,
    runtimeContext: Config,
    onActivity?: ActivityCallback,
  ): Promise<LocalAgentExecutor<TOutput>> {
    // 创建隔离的工具注册表
    const agentToolRegistry = new ToolRegistry(
      runtimeContext,
      runtimeContext.getMessageBus(),
    );

    // 只注册 Agent 定义中声明的工具
    for (const toolName of definition.toolConfig?.tools ?? []) {
      const tool = getToolByName(toolName);
      if (tool) agentToolRegistry.registerTool(tool);
    }

    // 注入 complete_task 工具（必须）
    agentToolRegistry.registerTool(
      createCompleteTaskTool(definition.outputConfig)
    );

    return new LocalAgentExecutor(
      definition, runtimeContext, agentToolRegistry, onActivity
    );
  }
}`,
    visualData: { agentName: 'codebase_investigator', turnLimit: 15, tools: 5 },
    highlight: '工厂方法创建',
  },
  {
    phase: 'turn_start',
    group: 'turn',
    title: '执行循环开始',
    description: 'run() 方法启动执行循环，设置超时和检查终止条件',
    codeSnippet: `// local-executor.ts - 主执行循环
async run(inputs: AgentInputs, signal: AbortSignal): Promise<OutputObject> {
  const { max_time_minutes, max_turns } = this.definition.runConfig;
  const startTime = Date.now();

  // 设置超时
  const timeoutController = new AbortController();
  setTimeout(
    () => timeoutController.abort(),
    max_time_minutes * 60 * 1000
  );

  // 创建 Chat 对象
  const chat = await this.createChatObject(inputs);
  let currentMessage = { role: 'user', parts: [{ text: query }] };
  let turnCounter = 0;

  // 主循环
  while (true) {
    const reason = this.checkTermination(startTime, turnCounter, max_turns);
    if (reason) break;

    const result = await this.executeTurn(chat, currentMessage, turnCounter++);
    if (result.status === 'stop') break;

    currentMessage = result.nextMessage;
  }
}`,
    visualData: { turn: 1, maxTurns: 15, elapsed: '0s', maxTime: '5min' },
    highlight: 'Turn 1/15',
  },
  {
    phase: 'llm_call',
    group: 'turn',
    title: 'executeTurn 调用 LLM',
    description: 'Agent 调用模型获取下一步行动，同时发射活动事件',
    codeSnippet: `// local-executor.ts - 单轮执行
private async executeTurn(
  chat: Chat,
  message: Content,
  turnNumber: number
): Promise<TurnResult> {
  // 发送消息给 LLM
  const response = await chat.sendMessage(message);

  // 发射思考事件
  if (response.text) {
    this.emitActivity('THOUGHT_CHUNK', { text: response.text });
  }

  // 处理函数调用
  const functionCalls = response.functionCalls();
  if (!functionCalls || functionCalls.length === 0) {
    // 无函数调用 → ERROR_NO_COMPLETE_TASK_CALL
    return {
      status: 'stop',
      terminateReason: AgentTerminateMode.ERROR_NO_COMPLETE_TASK_CALL
    };
  }

  return this.processFunctionCalls(functionCalls);
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
    title: '检查 complete_task',
    description: '检查是否调用了 complete_task 工具',
    codeSnippet: `// local-executor.ts - 处理函数调用
private async processFunctionCalls(
  functionCalls: FunctionCall[]
): Promise<TurnResult> {
  const results: FunctionResponse[] = [];

  for (const call of functionCalls) {
    // 发射工具开始事件
    this.emitActivity('TOOL_CALL_START', {
      name: call.name,
      args: call.args
    });

    // 检查是否是 complete_task
    if (call.name === 'complete_task') {
      return this.handleCompleteTask(call);
    }

    // 执行其他工具
    const result = await this.executeTool(call);

    // 发射工具结束事件
    this.emitActivity('TOOL_CALL_END', {
      name: call.name,
      output: result
    });

    results.push({ name: call.name, response: result });
  }

  return { status: 'continue', nextMessage: results };
}`,
    visualData: { hasToolCalls: true, toolCount: 1, isComplete: false },
    highlight: '1 个工具调用',
  },
  {
    phase: 'tool_execute',
    group: 'tools',
    title: '执行工具',
    description: '执行 LLM 请求的工具，支持 Zod schema 验证',
    codeSnippet: `// local-executor.ts - 工具执行
private async executeTool(call: FunctionCall): Promise<string> {
  const tool = this.toolRegistry.get(call.name);
  if (!tool) {
    return JSON.stringify({ error: \`Tool '\${call.name}' not found\` });
  }

  try {
    const result = await tool.execute(call.args, this.signal);
    return typeof result === 'string'
      ? result
      : JSON.stringify(result);
  } catch (error) {
    this.emitActivity('ERROR', {
      error: error.message,
      context: 'tool_call'
    });
    return JSON.stringify({ error: error.message });
  }
}

// 工具执行结果添加到消息历史
// 继续下一轮...`,
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
    title: '继续循环',
    description: '工具结果作为下一轮输入，继续执行直到 complete_task',
    codeSnippet: `// 消息历史增长
// 1. system: Agent 系统提示词
// 2. user: objective 参数
// 3. model: "我需要先查看项目结构..."
//          + functionCalls: [Glob]
// 4. user: Glob 结果 (42 个文件)
// 5. model: "让我读取核心文件..."
//          + functionCalls: [Read]
// ...

// Turn 2, 3, 4... 继续
while (true) {
  const reason = this.checkTermination(startTime, turnCounter);
  if (reason) break;  // 超时或达到轮次上限

  const result = await this.executeTurn(chat, currentMessage, turnCounter++);
  if (result.status === 'stop') {
    // GOAL 或 ERROR
    break;
  }
  currentMessage = result.nextMessage;  // 工具结果
}`,
    visualData: { turn: 2, messageCount: 4, nextAction: '继续执行' },
    highlight: '继续 Turn 2',
  },
  {
    phase: 'complete_check',
    group: 'complete',
    title: 'complete_task 调用',
    description: 'LLM 调用 complete_task 时进行 Zod schema 验证',
    codeSnippet: `// local-executor.ts - 处理完成任务
private handleCompleteTask(call: FunctionCall): TurnResult {
  const { outputConfig } = this.definition;

  if (outputConfig) {
    // 有 outputConfig → 使用 Zod schema 验证
    const validation = outputConfig.schema.safeParse(
      call.args[outputConfig.outputName]
    );

    if (!validation.success) {
      // 验证失败 → 返回错误，让 Agent 重试
      return {
        status: 'continue',
        nextMessage: [{
          name: 'complete_task',
          response: JSON.stringify({
            error: 'Validation failed',
            details: validation.error.issues
          })
        }]
      };
    }

    // 验证成功 → 调用 processOutput
    const output = this.definition.processOutput?.(validation.data)
      ?? JSON.stringify(validation.data, null, 2);
    return { status: 'stop', terminateReason: 'GOAL', output };
  }

  // 无 outputConfig → 直接使用 result 参数
  return { status: 'stop', terminateReason: 'GOAL', output: call.args.result };
}`,
    visualData: {
      completeTask: true,
      result: '{ SummaryOfFindings: "...", RelevantLocations: [...] }'
    },
    highlight: 'Zod 验证通过',
  },
  {
    phase: 'final_warning',
    group: 'complete',
    title: '60秒恢复期',
    description: '超时/轮次上限时，给 Agent 最后机会调用 complete_task',
    codeSnippet: `// local-executor.ts - 恢复机制
private async executeFinalWarningTurn(
  chat: Chat,
  turnCounter: number
): Promise<TurnResult> {
  // 发送恢复警告
  const warningMessage = {
    role: 'user',
    parts: [{
      text: \`⚠️ CRITICAL: You have reached the time/turn limit.
      You MUST call complete_task NOW with your current findings.
      If you don't call complete_task, the task will fail.\`
    }]
  };

  // 60秒宽限期
  const graceController = new AbortController();
  setTimeout(() => graceController.abort(), 60000);

  try {
    const result = await this.executeTurn(
      chat, warningMessage, turnCounter, graceController.signal
    );
    return result;
  } catch (error) {
    // 宽限期内仍未完成
    return { status: 'stop', terminateReason: 'TIMEOUT' };
  }
}`,
    visualData: { warning: true, turnsLeft: 1, graceTimeout: '60s' },
    highlight: '60s 恢复期',
  },
  {
    phase: 'terminate',
    group: 'complete',
    title: '返回 OutputObject',
    description: 'Agent 终止，返回结果和终止原因',
    codeSnippet: `// agents/types.ts - 输出类型
export interface OutputObject {
  result: string | null;
  terminate_reason: AgentTerminateMode;
}

export enum AgentTerminateMode {
  GOAL = 'GOAL',                                // ✅ 成功完成
  TIMEOUT = 'TIMEOUT',                          // ⏱️ 超时
  MAX_TURNS = 'MAX_TURNS',                      // 🔄 轮次上限
  ABORTED = 'ABORTED',                          // 🛑 用户取消
  ERROR = 'ERROR',                              // ❌ 执行错误
  ERROR_NO_COMPLETE_TASK_CALL = 'ERROR_NO_COMPLETE_TASK_CALL'  // ⚠️ 未调用完成工具
}

// 最终结果示例
{
  result: JSON.stringify({
    SummaryOfFindings: "项目使用 TypeScript + React...",
    ExplorationTrace: ["Used Glob...", "Read src/..."],
    RelevantLocations: [{ FilePath: "src/core/...", ... }]
  }, null, 2),
  terminate_reason: 'GOAL'
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
