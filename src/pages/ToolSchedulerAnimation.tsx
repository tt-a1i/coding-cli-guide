import { useState, useEffect, useCallback, useMemo } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// ToolCall 状态类型
type ToolCallState =
  | 'idle'
  | 'validating'
  | 'awaiting_approval'
  | 'scheduled'
  | 'executing'
  | 'success'
  | 'error'
  | 'cancelled';

interface StateNodeProps {
  state: ToolCallState;
  currentState: ToolCallState;
  label: string;
  description: string;
  color: string;
  glowColor: string;
  x: number;
  y: number;
}

function StateNode({ state, currentState, label, description, color, glowColor, x, y }: StateNodeProps) {
  const isActive = currentState === state;
  const isPast = getStateOrder(currentState) > getStateOrder(state);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Glow effect when active */}
      {isActive && (
        <circle
          r="45"
          fill="none"
          stroke={glowColor}
          strokeWidth="2"
          opacity="0.6"
          className="animate-pulse"
        />
      )}
      {/* Main circle */}
      <circle
        r="35"
        fill={isActive ? color : isPast ? `${color}40` : 'var(--bg-elevated)'}
        stroke={isActive ? glowColor : isPast ? color : 'var(--border-subtle)'}
        strokeWidth={isActive ? 3 : 2}
        className="transition-all duration-300"
      />
      {/* State label */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isActive ? 'var(--bg-void)' : isPast ? color : 'var(--text-muted)'}
        fontSize="11"
        fontFamily="monospace"
        fontWeight={isActive ? 'bold' : 'normal'}
      >
        {label}
      </text>
      {/* Description below */}
      <text
        y="50"
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize="9"
        fontFamily="monospace"
      >
        {description}
      </text>
    </g>
  );
}

function getStateOrder(state: ToolCallState): number {
  const order: Record<ToolCallState, number> = {
    idle: 0,
    validating: 1,
    awaiting_approval: 2,
    scheduled: 3,
    executing: 4,
    success: 5,
    error: 5,
    cancelled: 5,
  };
  return order[state];
}

// 状态转换箭头
interface TransitionArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label: string;
  isActive: boolean;
  color: string;
  curved?: 'up' | 'down' | 'none';
}

function TransitionArrow({ from, to, label, isActive, color, curved = 'none' }: TransitionArrowProps) {
  const offset = 40; // 节点半径偏移

  // 计算起点和终点（考虑节点半径）
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len;
  const ny = dy / len;

  const startX = from.x + nx * offset;
  const startY = from.y + ny * offset;
  const endX = to.x - nx * offset;
  const endY = to.y - ny * offset;

  // 计算曲线控制点
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const curveOffset = curved === 'up' ? -40 : curved === 'down' ? 40 : 0;

  const path = curved === 'none'
    ? `M ${startX} ${startY} L ${endX} ${endY}`
    : `M ${startX} ${startY} Q ${midX} ${midY + curveOffset} ${endX} ${endY}`;

  return (
    <g opacity={isActive ? 1 : 0.3} className="transition-opacity duration-300">
      {/* 路径 */}
      <path
        d={path}
        fill="none"
        stroke={isActive ? color : 'var(--border-subtle)'}
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray={isActive ? 'none' : '4,4'}
        markerEnd={`url(#arrow-${isActive ? 'active' : 'inactive'})`}
      />
      {/* 标签 */}
      <text
        x={midX}
        y={midY + curveOffset * 0.6 - 8}
        textAnchor="middle"
        fill={isActive ? color : 'var(--text-muted)'}
        fontSize="9"
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}

// 动画步骤数据
const animationSteps = [
  {
    state: 'idle' as ToolCallState,
    title: '初始状态',
    description: 'AI 响应中检测到工具调用请求',
    code: `// geminiChat.ts - 检测到工具调用
const response = await generateContentStream(contents);
if (response.functionCalls?.length > 0) {
  // 进入工具调度流程
  for (const call of response.functionCalls) {
    await coreToolScheduler.schedule(call);
  }
}`,
  },
  {
    state: 'validating' as ToolCallState,
    title: '验证阶段',
    description: '检查工具名称、参数格式、权限',
    code: `// coreToolScheduler.ts - scheduleToolCall()
private async scheduleToolCall(call: FunctionCall): Promise<void> {
  // 1. 查找工具定义
  const toolDef = this.toolRegistry.get(call.name);
  if (!toolDef) {
    return this.transitionToError(call, "Unknown tool");
  }

  // 2. 验证参数 schema
  const validation = validateArgs(call.args, toolDef.schema);
  if (!validation.valid) {
    return this.transitionToError(call, validation.error);
  }

  // 3. 检查执行权限
  const hasPermission = await this.checkPermission(call);
  // ...
}`,
  },
  {
    state: 'awaiting_approval' as ToolCallState,
    title: '等待审批',
    description: '敏感操作需要用户确认',
    code: `// coreToolScheduler.ts - shouldConfirmExecute()
private shouldConfirmExecute(toolCall: ToolCall): boolean {
  const tool = this.toolRegistry.get(toolCall.name);

  // 检查是否需要审批
  if (tool.requiresApproval) return true;
  if (this.isDestructiveOperation(toolCall)) return true;
  if (this.exceedsThreshold(toolCall)) return true;

  // 检查用户的 yolo 模式设置
  if (this.config.autoApprove === 'all') return false;
  if (this.config.autoApprove === 'safe' && tool.isSafe) return false;

  return true;
}

// 状态转换为 WaitingToolCall
this.state = { type: 'awaiting_approval', toolCall, reason };`,
  },
  {
    state: 'scheduled' as ToolCallState,
    title: '已调度',
    description: '验证通过，进入执行队列',
    code: `// coreToolScheduler.ts - 调度成功
private transitionToScheduled(call: ValidatingToolCall): ScheduledToolCall {
  return {
    type: 'scheduled',
    id: call.id,
    name: call.name,
    args: call.args,
    scheduledAt: Date.now(),
    priority: this.calculatePriority(call),
    retryCount: 0,
  };
}

// 添加到执行队列
this.executionQueue.push(scheduledCall);
this.processQueue(); // 开始处理队列`,
  },
  {
    state: 'executing' as ToolCallState,
    title: '执行中',
    description: '调用具体工具实现',
    code: `// coreToolScheduler.ts - executeToolCall()
private async executeToolCall(call: ScheduledToolCall): Promise<void> {
  this.transitionToExecuting(call);

  try {
    // 获取工具实例
    const tool = this.toolRegistry.get(call.name);

    // 创建执行上下文
    const context = this.createExecutionContext(call);

    // 执行工具
    const result = await tool.execute(call.args, context);

    // 转换为成功状态
    this.transitionToSuccess(call, result);
  } catch (error) {
    this.transitionToError(call, error);
  }
}`,
  },
  {
    state: 'success' as ToolCallState,
    title: '执行成功',
    description: '结果返回给 AI 继续对话',
    code: `// coreToolScheduler.ts - 成功处理
private transitionToSuccess(call: ExecutingToolCall, result: ToolResult): void {
  const successCall: SuccessfulToolCall = {
    type: 'success',
    id: call.id,
    name: call.name,
    args: call.args,
    result: {
      llmContent: result.llmContent,  // 发给 AI 的内容
      displayContent: result.display,  // 显示给用户的内容
    },
    executionTime: Date.now() - call.startedAt,
  };

  // 触发 continuation - 将结果发回 AI
  this.emit('toolComplete', successCall);
}`,
  },
];

// 错误和取消的额外步骤
const errorStep = {
  state: 'error' as ToolCallState,
  title: '执行失败',
  description: '工具执行出错，可能重试',
  code: `// coreToolScheduler.ts - 错误处理
private transitionToError(call: ToolCall, error: Error): void {
  const errorCall: ErroredToolCall = {
    type: 'error',
    id: call.id,
    name: call.name,
    error: {
      message: error.message,
      code: error.code,
      retryable: this.isRetryable(error),
    },
  };

  // 判断是否重试
  if (errorCall.error.retryable && call.retryCount < 3) {
    this.scheduleRetry(call);
  } else {
    this.emit('toolError', errorCall);
  }
}`,
};

const cancelStep = {
  state: 'cancelled' as ToolCallState,
  title: '用户取消',
  description: '用户拒绝执行敏感操作',
  code: `// coreToolScheduler.ts - 取消处理
public cancelToolCall(callId: string, reason: string): void {
  const call = this.pendingCalls.get(callId);
  if (!call) return;

  const cancelledCall: CancelledToolCall = {
    type: 'cancelled',
    id: call.id,
    name: call.name,
    reason: reason,
    cancelledAt: Date.now(),
  };

  // 通知 AI 工具被取消
  this.emit('toolCancelled', cancelledCall);

  // 清理资源
  this.pendingCalls.delete(callId);
}`,
};

export function ToolSchedulerAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const allSteps = useMemo(() => {
    if (showError) {
      return [...animationSteps.slice(0, 5), errorStep];
    }
    if (showCancel) {
      return [...animationSteps.slice(0, 3), cancelStep];
    }
    return animationSteps;
  }, [showError, showCancel]);

  const currentState = allSteps[currentStep]?.state || 'idle';

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= allSteps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, allSteps.length]);

  const play = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(true);
  }, []);

  const stepForward = useCallback(() => {
    if (currentStep < allSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setCurrentStep(0);
    }
  }, [currentStep, allSteps.length]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setShowError(false);
    setShowCancel(false);
  }, []);

  const toggleError = useCallback(() => {
    setShowError((e) => !e);
    setShowCancel(false);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const toggleCancel = useCallback(() => {
    setShowCancel((c) => !c);
    setShowError(false);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  // 状态节点位置
  const nodes = {
    idle: { x: 80, y: 120 },
    validating: { x: 220, y: 120 },
    awaiting_approval: { x: 360, y: 60 },
    scheduled: { x: 360, y: 180 },
    executing: { x: 500, y: 120 },
    success: { x: 640, y: 60 },
    error: { x: 640, y: 180 },
    cancelled: { x: 500, y: 60 },
  };

  const currentStepData = allSteps[currentStep];

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl p-8 border border-[var(--border-subtle)] relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--amber)] via-[var(--terminal-green)] to-[var(--cyber-blue)]" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[var(--amber)]">⚙️</span>
        <h2 className="text-2xl font-mono font-bold text-[var(--text-primary)]">
          CoreToolScheduler 状态机
        </h2>
      </div>

      <p className="text-sm text-[var(--text-muted)] font-mono mb-6">
        // 展示工具调用从接收到执行完成的完整状态流转过程
        <br />
        // 源码位置: packages/core/src/core/coreToolScheduler.ts
      </p>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={play}
          className="px-5 py-2.5 bg-[var(--terminal-green)] text-[var(--bg-void)] rounded-md font-mono font-bold hover:shadow-[0_0_15px_var(--terminal-green-glow)] transition-all cursor-pointer"
        >
          ▶ 播放流程
        </button>
        <button
          onClick={stepForward}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--terminal-green-dim)] hover:text-[var(--terminal-green)] transition-all cursor-pointer"
        >
          ⏭ 单步
        </button>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--amber)] rounded-md font-mono font-bold border border-[var(--border-subtle)] hover:border-[var(--amber-dim)] transition-all cursor-pointer"
        >
          ↺ 重置
        </button>
        <div className="flex-1" />
        <button
          onClick={toggleError}
          className={`px-4 py-2 rounded-md font-mono text-sm border transition-all cursor-pointer ${
            showError
              ? 'bg-[var(--error)]/20 border-[var(--error)] text-[var(--error)]'
              : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--error-dim)]'
          }`}
        >
          {showError ? '✓ 错误路径' : '○ 错误路径'}
        </button>
        <button
          onClick={toggleCancel}
          className={`px-4 py-2 rounded-md font-mono text-sm border transition-all cursor-pointer ${
            showCancel
              ? 'bg-[var(--purple)]/20 border-[var(--purple)] text-[var(--purple)]'
              : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--purple-dim)]'
          }`}
        >
          {showCancel ? '✓ 取消路径' : '○ 取消路径'}
        </button>
      </div>

      {/* State Machine Diagram */}
      <div className="bg-[var(--bg-void)] rounded-xl p-4 border border-[var(--border-subtle)] mb-6">
        <svg viewBox="0 0 720 240" className="w-full h-auto">
          {/* Arrow markers */}
          <defs>
            <marker
              id="arrow-active"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--terminal-green)" />
            </marker>
            <marker
              id="arrow-inactive"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--border-subtle)" />
            </marker>
            <marker
              id="arrow-error"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--error)" />
            </marker>
            <marker
              id="arrow-cancel"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--purple)" />
            </marker>
          </defs>

          {/* Transitions - Main flow */}
          <TransitionArrow
            from={nodes.idle}
            to={nodes.validating}
            label="schedule()"
            isActive={currentState === 'validating'}
            color="var(--terminal-green)"
          />
          <TransitionArrow
            from={nodes.validating}
            to={nodes.awaiting_approval}
            label="需审批"
            isActive={currentState === 'awaiting_approval'}
            color="var(--amber)"
            curved="up"
          />
          <TransitionArrow
            from={nodes.validating}
            to={nodes.scheduled}
            label="自动批准"
            isActive={currentState === 'scheduled' && !showCancel}
            color="var(--terminal-green)"
            curved="down"
          />
          <TransitionArrow
            from={nodes.awaiting_approval}
            to={nodes.scheduled}
            label="用户批准"
            isActive={currentState === 'scheduled' && getStateOrder(allSteps[Math.max(0, currentStep - 1)]?.state || 'idle') === 2}
            color="var(--terminal-green)"
          />
          <TransitionArrow
            from={nodes.scheduled}
            to={nodes.executing}
            label="execute()"
            isActive={currentState === 'executing'}
            color="var(--cyber-blue)"
          />
          <TransitionArrow
            from={nodes.executing}
            to={nodes.success}
            label="完成"
            isActive={currentState === 'success'}
            color="var(--terminal-green)"
            curved="up"
          />

          {/* Error path */}
          <TransitionArrow
            from={nodes.executing}
            to={nodes.error}
            label="失败"
            isActive={currentState === 'error'}
            color="var(--error)"
            curved="down"
          />

          {/* Cancel path */}
          {showCancel && (
            <TransitionArrow
              from={nodes.awaiting_approval}
              to={nodes.cancelled}
              label="用户拒绝"
              isActive={currentState === 'cancelled'}
              color="var(--purple)"
            />
          )}

          {/* State Nodes */}
          <StateNode
            state="idle"
            currentState={currentState}
            label="IDLE"
            description="等待调用"
            color="var(--text-muted)"
            glowColor="var(--text-muted)"
            {...nodes.idle}
          />
          <StateNode
            state="validating"
            currentState={currentState}
            label="VALIDATING"
            description="验证中"
            color="var(--cyber-blue)"
            glowColor="var(--cyber-blue)"
            {...nodes.validating}
          />
          <StateNode
            state="awaiting_approval"
            currentState={currentState}
            label="AWAITING"
            description="等待审批"
            color="var(--amber)"
            glowColor="var(--amber-glow)"
            {...nodes.awaiting_approval}
          />
          <StateNode
            state="scheduled"
            currentState={currentState}
            label="SCHEDULED"
            description="已调度"
            color="var(--terminal-green)"
            glowColor="var(--terminal-green-glow)"
            {...nodes.scheduled}
          />
          <StateNode
            state="executing"
            currentState={currentState}
            label="EXECUTING"
            description="执行中"
            color="var(--cyber-blue)"
            glowColor="var(--cyber-blue)"
            {...nodes.executing}
          />
          <StateNode
            state="success"
            currentState={currentState}
            label="SUCCESS"
            description="成功"
            color="var(--terminal-green)"
            glowColor="var(--terminal-green-glow)"
            {...nodes.success}
          />
          <StateNode
            state="error"
            currentState={currentState}
            label="ERROR"
            description="失败"
            color="var(--error)"
            glowColor="var(--error)"
            {...nodes.error}
          />
          {showCancel && (
            <StateNode
              state="cancelled"
              currentState={currentState}
              label="CANCELLED"
              description="已取消"
              color="var(--purple)"
              glowColor="var(--purple)"
              {...nodes.cancelled}
            />
          )}
        </svg>
      </div>

      {/* Current Step Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step Info */}
        <div className="bg-[var(--bg-void)] rounded-xl p-5 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <span className={`w-3 h-3 rounded-full ${
              currentState === 'success' ? 'bg-[var(--terminal-green)]' :
              currentState === 'error' ? 'bg-[var(--error)]' :
              currentState === 'cancelled' ? 'bg-[var(--purple)]' :
              currentState === 'executing' ? 'bg-[var(--cyber-blue)] animate-pulse' :
              currentState === 'awaiting_approval' ? 'bg-[var(--amber)] animate-pulse' :
              'bg-[var(--text-muted)]'
            }`} />
            <h3 className="text-lg font-mono font-bold text-[var(--text-primary)]">
              {currentStepData?.title}
            </h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-mono mb-4">
            {currentStepData?.description}
          </p>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span>步骤</span>
            <span className="text-[var(--terminal-green)] font-bold">{currentStep + 1}</span>
            <span>/</span>
            <span>{allSteps.length}</span>
            {isPlaying && (
              <span className="ml-2 text-[var(--amber)] animate-pulse">● 播放中</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--terminal-green)] to-[var(--cyber-blue)] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / allSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Code Block */}
        <div className="bg-[var(--bg-void)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] flex items-center gap-2">
            <span className="text-[var(--terminal-green)]">$</span>
            <span className="text-xs font-mono text-[var(--text-muted)]">源码片段</span>
          </div>
          <div className="p-4 max-h-[300px] overflow-y-auto">
            <JsonBlock code={currentStepData?.code || ''} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-[var(--bg-void)] rounded-lg border border-[var(--border-subtle)]">
        <div className="flex flex-wrap gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">等待</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--cyber-blue)]" />
            <span className="text-[var(--text-muted)]">处理中</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--amber)]" />
            <span className="text-[var(--text-muted)]">需审批</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--terminal-green)]" />
            <span className="text-[var(--text-muted)]">成功</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--error)]" />
            <span className="text-[var(--text-muted)]">错误</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--purple)]" />
            <span className="text-[var(--text-muted)]">取消</span>
          </div>
        </div>
      </div>
    </div>
  );
}
