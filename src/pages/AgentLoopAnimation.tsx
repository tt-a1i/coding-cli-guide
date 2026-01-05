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
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-purple-400">ERROR_NO_COMPLETE_TASK_CALL</div>
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
    codeSnippet: `// agents/local-executor.ts - 工厂方法创建（简化版）
export class LocalAgentExecutor<TOutput extends z.ZodTypeAny> {
  static async create<TOutput extends z.ZodTypeAny>(
    definition: LocalAgentDefinition<TOutput>,
    runtimeContext: Config,
    onActivity?: ActivityCallback,
  ): Promise<LocalAgentExecutor<TOutput>> {
    // 为每个 Agent 创建隔离 ToolRegistry（避免“继承全部工具”）
    const agentToolRegistry = new ToolRegistry(
      runtimeContext,
      runtimeContext.getMessageBus(),
    );
    const parentToolRegistry = runtimeContext.getToolRegistry();

    // 只注册 agent definition 声明的工具（字符串引用从 parent registry 获取）
    if (definition.toolConfig) {
      for (const toolRef of definition.toolConfig.tools) {
        if (typeof toolRef === 'string') {
          const toolFromParent = parentToolRegistry.getTool(toolRef);
          if (toolFromParent) agentToolRegistry.registerTool(toolFromParent);
        } else if (
          typeof toolRef === 'object' &&
          'name' in toolRef &&
          'build' in toolRef
        ) {
          agentToolRegistry.registerTool(toolRef);
        }
        // 注意：FunctionDeclaration 只用于 schema，不需要注册
      }
      agentToolRegistry.sortTools();
    }

    const parentPromptId = promptIdContext.getStore();
    return new LocalAgentExecutor(
      definition,
      runtimeContext,
      agentToolRegistry,
      parentPromptId,
      onActivity,
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
    codeSnippet: `// agents/local-executor.ts - 主执行循环（关键结构）
async run(inputs: AgentInputs, signal: AbortSignal): Promise<OutputObject> {
  const startTime = Date.now();
  let turnCounter = 0;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(new Error('Agent timed out.')),
    this.definition.runConfig.max_time_minutes * 60 * 1000,
  );

  const combinedSignal = AbortSignal.any([signal, timeoutController.signal]);

  const augmentedInputs = {
    ...inputs,
    cliVersion: await getVersion(),
    activeModel: this.runtimeContext.getActiveModel(),
    today: new Date().toLocaleDateString(),
  };

  const tools = this.prepareToolsList(); // ✅ 总是注入 complete_task
  const chat = await this.createChatObject(augmentedInputs, tools);

  const query = templateString(this.definition.promptConfig.query, augmentedInputs);
  let currentMessage: Content = { role: 'user', parts: [{ text: query }] };

  while (true) {
    const reason = this.checkTermination(startTime, turnCounter);
    if (reason || combinedSignal.aborted) break;

    const turn = await this.executeTurn(
      chat,
      currentMessage,
      turnCounter++,
      combinedSignal,
      timeoutController.signal,
    );

    if (turn.status === 'stop') break;
    currentMessage = turn.nextMessage;
  }

  // 统一恢复：TIMEOUT / MAX_TURNS / ERROR_NO_COMPLETE_TASK_CALL → 60s grace turn
  clearTimeout(timeoutId);
}`,
    visualData: { turn: 1, maxTurns: 15, elapsed: '0s', maxTime: '5min' },
    highlight: 'Turn 1/15',
  },
  {
    phase: 'llm_call',
    group: 'turn',
    title: 'executeTurn 调用 LLM',
    description: 'Agent 调用模型获取下一步行动，同时发射活动事件',
    codeSnippet: `// agents/local-executor.ts - 单轮执行（关键路径）
private async executeTurn(
  chat: GeminiChat,
  currentMessage: Content,
  turnCounter: number,
  combinedSignal: AbortSignal,
  timeoutSignal: AbortSignal,
): Promise<AgentTurnResult> {
  const promptId = this.agentId + '#' + turnCounter;

  await this.tryCompressChat(chat, promptId);

  const { functionCalls } = await promptIdContext.run(promptId, async () =>
    this.callModel(chat, currentMessage, combinedSignal, promptId),
  );

  if (combinedSignal.aborted) {
    const terminateReason = timeoutSignal.aborted
      ? AgentTerminateMode.TIMEOUT
      : AgentTerminateMode.ABORTED;
    return { status: 'stop', terminateReason, finalResult: null };
  }

  // 协议约束：必须通过 complete_task 结束
  if (functionCalls.length === 0) {
    return {
      status: 'stop',
      terminateReason: AgentTerminateMode.ERROR_NO_COMPLETE_TASK_CALL,
      finalResult: null,
    };
  }

  const { nextMessage, submittedOutput, taskCompleted } =
    await this.processFunctionCalls(functionCalls, combinedSignal, promptId);

  if (taskCompleted) {
    return {
      status: 'stop',
      terminateReason: AgentTerminateMode.GOAL,
      finalResult: submittedOutput ?? 'Task completed successfully.',
    };
  }

  return { status: 'continue', nextMessage };
}`,
    visualData: {
      response: {
        content: '我需要先查看项目结构...',
        toolCalls: [{ name: 'glob', args: { pattern: '**/*.ts' } }]
      }
    },
    highlight: 'LLM 响应',
  },
  {
    phase: 'tool_check',
    group: 'tools',
    title: '检查 complete_task',
    description: '检查是否调用了 complete_task 工具',
    codeSnippet: `// agents/local-executor.ts - 处理函数调用（精简版）
private async processFunctionCalls(
  functionCalls: FunctionCall[],
  signal: AbortSignal,
  promptId: string,
): Promise<{
  nextMessage: Content;
  submittedOutput: string | null;
  taskCompleted: boolean;
}> {
  const allowedToolNames = new Set(this.toolRegistry.getAllToolNames());
  allowedToolNames.add('complete_task'); // completion tool 总是允许

  let submittedOutput: string | null = null;
  let taskCompleted = false;

  const toolExecutionPromises: Array<Promise<Part[] | void>> = [];
  const syncResponseParts: Part[] = [];

  for (const [index, functionCall] of functionCalls.entries()) {
    const callId = functionCall.id ?? promptId + '-' + index;
    const args = functionCall.args ?? {};

    this.emitActivity('TOOL_CALL_START', { name: functionCall.name, args });

    // 1) 协议终点：complete_task
    if (functionCall.name === 'complete_task') {
      // …校验 result / output schema，成功则 taskCompleted=true，并写入 syncResponseParts
      continue;
    }

    // 2) 工具白名单：隔离 registry + 显式允许列表
    if (!allowedToolNames.has(functionCall.name as string)) {
      syncResponseParts.push({
        functionResponse: {
          name: functionCall.name as string,
          id: callId,
          response: { error: 'Unauthorized tool call' },
        },
      });
      continue;
    }

    // 3) 标准工具：并行执行（toolExecutionPromises）
  }

  // 组合 sync + async parts → nextMessage 进入下一轮
  return { nextMessage: { role: 'user', parts: [] }, submittedOutput, taskCompleted };
}`,
    visualData: { hasToolCalls: true, toolCount: 1, isComplete: false },
    highlight: '1 个工具调用',
  },
  {
    phase: 'tool_execute',
    group: 'tools',
    title: '执行工具',
    description: '执行 LLM 请求的工具，支持 Zod schema 验证',
    codeSnippet: `// agents/local-executor.ts - 工具执行（核心逻辑）
const requestInfo: ToolCallRequestInfo = {
  callId,
  name: functionCall.name as string,
  args,
  isClientInitiated: true,
  prompt_id: promptId,
};

const executionPromise = (async () => {
  // 为 agent 构造“隔离运行时”：
  // - tool registry: 只暴露 agent 允许的工具
  // - approval mode: 非交互模式下强制 YOLO（不弹确认）
  const agentContext = Object.create(this.runtimeContext);
  agentContext.getToolRegistry = () => this.toolRegistry;
  agentContext.getApprovalMode = () => ApprovalMode.YOLO;

  const { response: toolResponse } = await executeToolCall(
    agentContext,
    requestInfo,
    signal,
  );

  return toolResponse.responseParts; // Part[] → 下一轮 user message
})();

toolExecutionPromises.push(executionPromise);`,
    visualData: {
      executing: 'glob',
      pattern: '**/*.ts',
      result: '找到 42 个 TypeScript 文件'
    },
    highlight: '执行 glob',
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
//          + functionCalls: [glob]
// 4. user: glob 结果 (42 个文件)
// 5. model: "让我读取核心文件..."
//          + functionCalls: [read_file]
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
    codeSnippet: `// agents/local-executor.ts - complete_task 校验与提交（节选）
if (functionCall.name === 'complete_task') {
  const { outputConfig } = this.definition;
  taskCompleted = true;

  if (outputConfig) {
    const outputName = outputConfig.outputName;
    const outputValue = args[outputName];

    const validation = outputConfig.schema.safeParse(outputValue);
    if (!validation.success) {
      taskCompleted = false;
      syncResponseParts.push({
        functionResponse: {
          name: 'complete_task',
          id: callId,
          response: { error: 'Output validation failed: ...' },
        },
      });
      continue;
    }

    submittedOutput = this.definition.processOutput
      ? this.definition.processOutput(validation.data)
      : JSON.stringify(validation.data, null, 2);
  } else {
    const resultArg = args.result;
    if (!resultArg) {
      taskCompleted = false;
      syncResponseParts.push({
        functionResponse: {
          name: 'complete_task',
          id: callId,
          response: { error: 'Missing required \"result\" argument.' },
        },
      });
      continue;
    }
    submittedOutput =
      typeof resultArg === 'string'
        ? resultArg
        : JSON.stringify(resultArg, null, 2);
  }

  syncResponseParts.push({
    functionResponse: {
      name: 'complete_task',
      id: callId,
      response: { status: 'Result submitted and task completed.' },
    },
  });
  continue;
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
    codeSnippet: `// agents/local-executor.ts - 60s Grace Period（节选）
private async executeFinalWarningTurn(
  chat: GeminiChat,
  turnCounter: number,
  reason:
    | AgentTerminateMode.TIMEOUT
    | AgentTerminateMode.MAX_TURNS
    | AgentTerminateMode.ERROR_NO_COMPLETE_TASK_CALL,
  externalSignal: AbortSignal,
): Promise<string | null> {
  const graceTimeoutController = new AbortController();
  const graceTimeoutId = setTimeout(
    () => graceTimeoutController.abort(new Error('Grace period timed out.')),
    60 * 1000,
  );

  try {
    const recoveryMessage: Content = {
      role: 'user',
      parts: [{ text: this.getFinalWarningMessage(reason) }],
    };

    const combinedSignal = AbortSignal.any([
      externalSignal,
      graceTimeoutController.signal,
    ]);

    const turn = await this.executeTurn(
      chat,
      recoveryMessage,
      turnCounter,
      combinedSignal,
      graceTimeoutController.signal,
    );

    if (turn.status === 'stop' && turn.terminateReason === AgentTerminateMode.GOAL) {
      return turn.finalResult ?? 'Task completed during grace period.';
    }

    return null;
  } finally {
    clearTimeout(graceTimeoutId);
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
    ExplorationTrace: ["Used glob...", "read_file src/..."],
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
