import { useState, useEffect, useCallback } from 'react';
import { Layer } from '../../components/Layer';
import { MermaidDiagram } from '../../components/MermaidDiagram';
import { HighlightBox } from '../../components/HighlightBox';

type ToolCallStatus =
  | 'validating'
  | 'scheduled'
  | 'executing'
  | 'awaiting_approval'
  | 'success'
  | 'error'
  | 'cancelled';

interface ToolCall {
  id: string;
  name: string;
  status: ToolCallStatus;
  args?: Record<string, unknown>;
  outcome?: 'ProceedOnce' | 'ProceedAlways' | 'Cancel' | 'ModifyWithEditor';
  durationMs?: number;
  liveOutput?: string;
}

interface ProcessingStep {
  id: number;
  phase: string;
  description: string;
  toolCalls: ToolCall[];
  currentAction?: string;
  isQueueProcessing?: boolean;
}

export function ToolConfirmationFlowAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);

  const steps: ProcessingStep[] = [
    {
      id: 0,
      phase: 'SCHEDULE',
      description: 'CoreToolScheduler.schedule() 接收工具调用请求',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'validating', args: { command: 'npm install' } },
        { id: 'call-2', name: 'write_file', status: 'validating', args: { file_path: '/app/file.ts', content: '...' } },
      ],
      currentAction: 'this.toolCalls = this.toolCalls.concat(newToolCalls)',
    },
    {
      id: 1,
      phase: 'VALIDATE',
      description: '验证工具是否存在于 ToolRegistry',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'validating', args: { command: 'npm install' } },
        { id: 'call-2', name: 'write_file', status: 'validating', args: { file_path: '/app/file.ts', content: '...' } },
      ],
      currentAction: 'const toolInstance = this.toolRegistry.getTool(reqInfo.name)',
    },
    {
      id: 2,
      phase: 'BUILD_INVOCATION',
      description: '构建工具调用实例 (invocation)',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'validating', args: { command: 'npm install' } },
        { id: 'call-2', name: 'write_file', status: 'validating', args: { file_path: '/app/file.ts', content: '...' } },
      ],
      currentAction: 'const invocation = tool.build(args)',
    },
    {
      id: 3,
      phase: 'CHECK_CONFIRMATION',
      description: '检查是否需要用户确认',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'validating', args: { command: 'npm install' } },
        { id: 'call-2', name: 'write_file', status: 'validating', args: { file_path: '/app/file.ts', content: '...' } },
      ],
      currentAction: 'const confirmationDetails = await invocation.shouldConfirmExecute(signal)',
    },
    {
      id: 4,
      phase: 'APPROVAL_CHECK',
      description: 'PolicyEngine 决策：shell=ASK_USER → awaiting_approval；write_file=ALLOW → scheduled',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'awaiting_approval', args: { command: 'npm install' } },
        { id: 'call-2', name: 'write_file', status: 'scheduled', args: { file_path: '/app/file.ts', content: '...' }, outcome: 'ProceedAlways' },
      ],
      currentAction: 'confirmationDetails? awaiting_approval : scheduled',
    },
    {
      id: 5,
      phase: 'ALLOWED_TOOLS_CHECK',
      description: 'write_file 可来自 tools.allowed / 已保存 policies（无需弹窗）',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'awaiting_approval', args: { command: 'npm install' } },
        { id: 'call-2', name: 'write_file', status: 'scheduled', args: { file_path: '/app/file.ts', content: '...' }, outcome: 'ProceedAlways' },
      ],
      currentAction: 'policy=ALLOW → shouldConfirmExecute() 返回 false',
    },
    {
      id: 6,
      phase: 'USER_DECISION',
      description: '⏳ 等待用户对 run_shell_command 的确认...',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'awaiting_approval', args: { command: 'npm install' } },
        { id: 'call-2', name: 'write_file', status: 'scheduled', args: { file_path: '/app/file.ts', content: '...' }, outcome: 'ProceedAlways' },
      ],
    },
    {
      id: 7,
      phase: 'USER_APPROVES',
      description: '✅ 用户选择 "ProceedOnce"',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'scheduled', args: { command: 'npm install' }, outcome: 'ProceedOnce' },
        { id: 'call-2', name: 'write_file', status: 'scheduled', args: { file_path: '/app/file.ts', content: '...' }, outcome: 'ProceedAlways' },
      ],
      currentAction: 'handleConfirmationResponse(callId, outcome)',
    },
    {
      id: 8,
      phase: 'ALL_SCHEDULED',
      description: '所有调用都已调度，开始执行',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'executing', args: { command: 'npm install' }, outcome: 'ProceedOnce' },
        { id: 'call-2', name: 'write_file', status: 'executing', args: { file_path: '/app/file.ts', content: '...' }, outcome: 'ProceedAlways' },
      ],
      currentAction: 'attemptExecutionOfScheduledCalls(signal)',
    },
    {
      id: 9,
      phase: 'LIVE_OUTPUT',
      description: 'run_shell_command 实时输出流',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'executing', args: { command: 'npm install' }, outcome: 'ProceedOnce', liveOutput: 'Installing dependencies...\nadded 123 packages' },
        { id: 'call-2', name: 'write_file', status: 'executing', args: { file_path: '/app/file.ts', content: '...' }, outcome: 'ProceedAlways' },
      ],
      currentAction: 'liveOutputCallback(outputChunk)',
    },
    {
      id: 10,
      phase: 'FIRST_COMPLETE',
      description: 'write_file 工具执行完成',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'executing', args: { command: 'npm install' }, outcome: 'ProceedOnce', liveOutput: 'Installing dependencies...\nadded 123 packages' },
        { id: 'call-2', name: 'write_file', status: 'success', args: { file_path: '/app/file.ts', content: '...' }, outcome: 'ProceedAlways', durationMs: 45 },
      ],
      currentAction: 'setStatusInternal(callId, "success", successResponse)',
    },
    {
      id: 11,
      phase: 'ALL_COMPLETE',
      description: '✅ 所有工具调用完成',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'success', args: { command: 'npm install' }, outcome: 'ProceedOnce', durationMs: 2340 },
        { id: 'call-2', name: 'write_file', status: 'success', args: { file_path: '/app/file.ts', content: '...' }, outcome: 'ProceedAlways', durationMs: 45 },
      ],
      currentAction: 'checkAndNotifyCompletion()',
    },
    {
      id: 12,
      phase: 'CALLBACK',
      description: '触发 onAllToolCallsComplete 回调',
      toolCalls: [
        { id: 'call-1', name: 'run_shell_command', status: 'success', args: { command: 'npm install' }, outcome: 'ProceedOnce', durationMs: 2340 },
        { id: 'call-2', name: 'write_file', status: 'success', args: { file_path: '/app/file.ts', content: '...' }, outcome: 'ProceedAlways', durationMs: 45 },
      ],
      currentAction: 'await this.onAllToolCallsComplete(completedCalls)',
    },
    {
      id: 13,
      phase: 'PROCESS_QUEUE',
      description: '处理队列中的下一批请求',
      toolCalls: [],
      isQueueProcessing: true,
      currentAction: 'if (this.requestQueue.length > 0) { next = this.requestQueue.shift() }',
    },
  ];

  const step = steps[currentStep];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, steps.length]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const getStatusColor = (status: ToolCallStatus) => {
    switch (status) {
      case 'validating': return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'executing': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500';
      case 'awaiting_approval': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getStatusIcon = (status: ToolCallStatus) => {
    switch (status) {
      case 'validating': return '🔍';
      case 'scheduled': return '📋';
      case 'executing': return '⚡';
      case 'awaiting_approval': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'cancelled': return '🚫';
      default: return '•';
    }
  };

  const stateMachineDiagram = `
stateDiagram-v2
    [*] --> validating: schedule()
    validating --> error: 工具不存在/参数无效
    validating --> scheduled: policy=ALLOW 或 isAutoApproved
    validating --> awaiting_approval: 需要用户确认

    awaiting_approval --> scheduled: ProceedOnce/ProceedAlways
    awaiting_approval --> cancelled: Cancel
    awaiting_approval --> awaiting_approval: ModifyWithEditor

    scheduled --> executing: attemptExecution()
    executing --> success: 执行成功
    executing --> error: 执行失败
    executing --> cancelled: signal.aborted

    success --> [*]
    error --> [*]
    cancelled --> [*]
`;

  const queueDiagram = `
flowchart LR
    subgraph Queue["请求队列"]
        Q1["Request 1"]
        Q2["Request 2"]
        Q3["Request 3"]
    end

    subgraph Processing["当前处理"]
        P["Tool Calls<br/>validating/executing"]
    end

    Q1 -.->|"shift()"| P
    P -->|"完成后"| Next["处理下一个"]
    Next -.-> Q2

    style P fill:#22c55e,color:#000
    style Queue fill:#3b82f6,color:#fff
`;

  const confirmationOutcomesDiagram = `
flowchart TD
    A["awaiting_approval"] --> B{用户选择}
    B -->|"ProceedOnce"| C["scheduled<br/>仅本次执行"]
    B -->|"ProceedAlways"| D["scheduled<br/>+ Session 动态规则"]
    B -->|"ProceedAlwaysAndSave"| H["scheduled<br/>+ 写入 auto-saved.toml"]
    B -->|"Cancel"| E["cancelled"]
    B -->|"ModifyWithEditor"| F["打开编辑器<br/>修改参数"]
    F --> G["更新 args"]
    G --> A

    style C fill:#22c55e,color:#000
    style D fill:#16a34a,color:#fff
    style E fill:#dc2626,color:#fff
    style F fill:#f59e0b,color:#000
`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">⚙️</span>
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)]">
            Tool Confirmation Flow 动画
          </h1>
          <p className="text-[var(--text-secondary)]">
            CoreToolScheduler 工具调用状态机
          </p>
        </div>
      </div>

      {/* Introduction */}
      <HighlightBox title="📚 机制介绍" variant="blue">
        <p className="mb-3">
          CoreToolScheduler 管理工具调用的完整生命周期。每个工具调用经历多个状态：
          验证 → 调度 → 执行 → 完成。当需要用户确认时，会进入 <code>awaiting_approval</code> 状态。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className={`p-2 rounded border text-center text-sm ${getStatusColor('validating')}`}>
            {getStatusIcon('validating')} validating
          </div>
          <div className={`p-2 rounded border text-center text-sm ${getStatusColor('awaiting_approval')}`}>
            {getStatusIcon('awaiting_approval')} awaiting_approval
          </div>
          <div className={`p-2 rounded border text-center text-sm ${getStatusColor('scheduled')}`}>
            {getStatusIcon('scheduled')} scheduled
          </div>
          <div className={`p-2 rounded border text-center text-sm ${getStatusColor('executing')}`}>
            {getStatusIcon('executing')} executing
          </div>
        </div>
      </HighlightBox>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-[var(--terminal-green)] text-black font-bold rounded hover:opacity-80"
        >
          {isPlaying ? '⏸ 暂停' : '▶️ 播放'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded hover:opacity-80"
        >
          🔄 重置
        </button>
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded disabled:opacity-50"
        >
          ◀ 上一步
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded disabled:opacity-50"
        >
          下一步 ▶
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)]">速度:</span>
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-[var(--text-secondary)]">{speed}ms</span>
        </div>
        <div className="ml-auto text-[var(--text-secondary)]">
          步骤: {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Current Step Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Current Phase */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-bold text-[var(--terminal-green)] mb-4">
            📍 当前阶段: {step.phase}
          </h3>

          <div className="bg-[var(--bg-terminal)] p-4 rounded-lg mb-4">
            <div className="text-[var(--text-primary)]">{step.description}</div>
            {step.currentAction && (
              <div className="mt-3 font-mono text-xs text-cyan-400 bg-[var(--bg-secondary)] p-2 rounded overflow-x-auto">
                {step.currentAction}
              </div>
            )}
          </div>

          {step.isQueueProcessing && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="text-blue-400 font-bold mb-2">🔄 队列处理模式</div>
              <div className="text-sm text-[var(--text-secondary)]">
                当有工具调用正在执行时，新请求会被加入队列。
                完成后自动处理队列中的下一批请求。
              </div>
            </div>
          )}
        </div>

        {/* Right: Tool Calls */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-bold text-purple-400 mb-4">
            🔧 工具调用状态
          </h3>

          <div className="space-y-4">
            {step.toolCalls.map((call) => (
              <div
                key={call.id}
                className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(call.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getStatusIcon(call.status)}</span>
                    <span className="font-bold">{call.name}</span>
                    <span className="text-xs opacity-60">({call.id})</span>
                  </div>
                  <span className="px-2 py-1 rounded text-xs bg-[var(--bg-tertiary)]">
                    {call.status}
                  </span>
                </div>

                {call.args && (
                  <div className="text-xs font-mono bg-[var(--bg-terminal)] p-2 rounded mb-2 overflow-x-auto">
                    {JSON.stringify(call.args, null, 0).slice(0, 60)}...
                  </div>
                )}

                <div className="flex flex-wrap gap-2 text-xs">
                  {call.outcome && (
                    <span className={`px-2 py-1 rounded ${
                      call.outcome === 'ProceedAlways' ? 'bg-green-500/30 text-green-400' :
                      call.outcome === 'ProceedOnce' ? 'bg-blue-500/30 text-blue-400' :
                      call.outcome === 'Cancel' ? 'bg-red-500/30 text-red-400' :
                      'bg-yellow-500/30 text-yellow-400'
                    }`}>
                      {call.outcome}
                    </span>
                  )}
                  {call.durationMs !== undefined && (
                    <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                      ⏱️ {call.durationMs}ms
                    </span>
                  )}
                </div>

                {call.liveOutput && (
                  <div className="mt-2 p-2 bg-[var(--bg-terminal)] rounded text-xs font-mono text-[var(--terminal-green)]">
                    <div className="text-[var(--text-secondary)] mb-1">Live Output:</div>
                    <pre className="whitespace-pre-wrap">{call.liveOutput}</pre>
                  </div>
                )}
              </div>
            ))}

            {step.toolCalls.length === 0 && (
              <div className="text-[var(--text-secondary)] italic p-4 text-center bg-[var(--bg-tertiary)] rounded-lg">
                无活跃工具调用 - 准备处理队列
              </div>
            )}
          </div>
        </div>
      </div>

      {/* State Machine */}
      <Layer title="🔄 状态机图" icon="⚙️">
        <MermaidDiagram chart={stateMachineDiagram} />
      </Layer>

      {/* Confirmation Outcomes */}
      <Layer title="🎯 用户确认选项" icon="👆">
        <MermaidDiagram chart={confirmationOutcomesDiagram} />
      </Layer>

      {/* Queue Diagram */}
      <Layer title="📋 请求队列机制" icon="🔀">
        <MermaidDiagram chart={queueDiagram} />
      </Layer>

      {/* Code Explanation */}
      <Layer title="💡 核心类型定义" icon="📝">
        <div className="bg-[var(--bg-terminal)] p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
{`// 工具调用状态类型
export type ToolCall =
  | ValidatingToolCall   // 验证中
  | ScheduledToolCall    // 已调度，等待执行
  | ExecutingToolCall    // 执行中
  | WaitingToolCall      // 等待用户确认
  | SuccessfulToolCall   // 成功
  | CancelledToolCall    // 已取消
  | ErroredToolCall;     // 错误

// 用户确认选项
export enum ToolConfirmationOutcome {
  ProceedOnce = 'proceed_once',      // 仅本次执行
  ProceedAlways = 'proceed_always',  // 始终允许此类操作
  Cancel = 'cancel',                 // 取消
  ModifyWithEditor = 'modify_with_editor', // 编辑器修改
}

// 调度器核心逻辑
class CoreToolScheduler {
  private toolCalls: ToolCall[] = [];
  private requestQueue: Array<{...}> = [];
  private isScheduling = false;

  schedule(request, signal): Promise<void> {
    if (this.isRunning() || this.isScheduling) {
      // 加入队列，等待当前批次完成
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ request, signal, resolve, reject });
      });
    }
    return this._schedule(request, signal);
  }
}`}
          </pre>
        </div>
      </Layer>

      {/* Design Rationale */}
      <HighlightBox title="🧠 设计考量" variant="green">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-[var(--terminal-green)] mb-2">为什么需要队列?</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              防止并发调用导致状态混乱。当有工具正在执行或等待确认时，
              新的请求必须排队，确保每批工具调用有序完成。
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[var(--terminal-green)] mb-2">ProceedAlways 如何工作?</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              当用户选择 ProceedAlways / ProceedAlwaysAndSave 时，工具会通过 MessageBus 发布 <code>UPDATE_POLICY</code>：
              先以“session 动态规则”立即生效；若选择 Save，则写入 <code>~/.gemini/policies/auto-saved.toml</code> 供下次启动复用。
            </p>
          </div>
        </div>
      </HighlightBox>

      {/* Terminal States */}
      <HighlightBox title="🏁 终态说明" variant="yellow">
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border ${getStatusColor('success')}`}>
            <div className="font-bold mb-1">{getStatusIcon('success')} success</div>
            <div className="text-xs opacity-80">工具正常执行完成，返回结果给 LLM</div>
          </div>
          <div className={`p-3 rounded-lg border ${getStatusColor('error')}`}>
            <div className="font-bold mb-1">{getStatusIcon('error')} error</div>
            <div className="text-xs opacity-80">工具不存在、参数无效或执行失败</div>
          </div>
          <div className={`p-3 rounded-lg border ${getStatusColor('cancelled')}`}>
            <div className="font-bold mb-1">{getStatusIcon('cancelled')} cancelled</div>
            <div className="text-xs opacity-80">用户取消或 AbortSignal 触发</div>
          </div>
        </div>
      </HighlightBox>
    </div>
  );
}
