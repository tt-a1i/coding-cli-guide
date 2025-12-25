// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * React 工具调度器动画
 *
 * 可视化 useReactToolScheduler 工具调用生命周期
 * 源码: packages/cli/src/ui/hooks/useReactToolScheduler.ts
 *
 * 工具状态流转:
 * scheduled → validating → awaiting_approval → executing → success/error/cancelled
 *
 * 核心概念:
 * - TrackedToolCall: 带 UI 跟踪状态的工具调用
 * - CoreToolScheduler: 核心调度逻辑
 * - responseSubmittedToGemini: 标记响应是否已提交
 */

type ToolStatus =
  | 'scheduled'
  | 'validating'
  | 'awaiting_approval'
  | 'executing'
  | 'success'
  | 'error'
  | 'cancelled';

interface TrackedToolCall {
  callId: string;
  name: string;
  args: string;
  status: ToolStatus;
  liveOutput?: string;
  resultDisplay?: string;
  responseSubmittedToGemini: boolean;
}

const SAMPLE_TOOLS: Omit<TrackedToolCall, 'status' | 'responseSubmittedToGemini' | 'liveOutput' | 'resultDisplay'>[] = [
  { callId: 'tc-001', name: 'read_file', args: '{ path: "src/app.ts" }' },
  { callId: 'tc-002', name: 'run_shell_command', args: '{ cmd: "npm test" }' },
  { callId: 'tc-003', name: 'write_file', args: '{ path: "output.json" }' },
];

const STATUS_FLOW: ToolStatus[] = ['scheduled', 'validating', 'awaiting_approval', 'executing', 'success'];

export default function ReactToolSchedulerAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [toolCalls, setToolCalls] = useState<TrackedToolCall[]>([]);
  const [currentToolIndex, setCurrentToolIndex] = useState(-1);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [allToolsCompleted, setAllToolsCompleted] = useState(false);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsPlaying(false);
    setToolCalls([]);
    setCurrentToolIndex(-1);
    setCurrentStatusIndex(-1);
    setLogs([]);
    setAllToolsCompleted(false);
  }, []);

  // Initialize tools
  useEffect(() => {
    if (!isPlaying) return;

    if (toolCalls.length === 0) {
      addLog('🔧 scheduleToolCalls() 调用');
      addLog(`  接收 ${SAMPLE_TOOLS.length} 个工具调用请求`);

      setToolCalls(SAMPLE_TOOLS.map(t => ({
        ...t,
        status: 'scheduled',
        responseSubmittedToGemini: false,
      })));
      setCurrentToolIndex(0);
      setCurrentStatusIndex(0);
      return;
    }
  }, [isPlaying, toolCalls, addLog]);

  // Status transition animation
  useEffect(() => {
    if (!isPlaying || toolCalls.length === 0 || currentToolIndex < 0) return;

    // All tools done
    if (currentToolIndex >= toolCalls.length) {
      if (!allToolsCompleted) {
        setAllToolsCompleted(true);
        addLog('✅ onAllToolCallsComplete() 触发');
        addLog('📤 准备提交响应到 Gemini');

        // Mark all as submitted
        setTimeout(() => {
          setToolCalls(prev => prev.map(tc => ({
            ...tc,
            responseSubmittedToGemini: true
          })));
          addLog('✓ markToolsAsSubmitted() 完成');
          setIsPlaying(false);
        }, 800);
      }
      return;
    }

    const currentTool = toolCalls[currentToolIndex];
    const nextStatus = STATUS_FLOW[currentStatusIndex];

    // Current tool done, move to next
    if (currentStatusIndex >= STATUS_FLOW.length) {
      setCurrentToolIndex(prev => prev + 1);
      setCurrentStatusIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      // Update status
      setToolCalls(prev => prev.map((tc, i) => {
        if (i !== currentToolIndex) return tc;

        const updated: TrackedToolCall = { ...tc, status: nextStatus };

        // Add live output for executing status
        if (nextStatus === 'executing') {
          updated.liveOutput = '正在执行...';
        }

        // Add result for success
        if (nextStatus === 'success') {
          updated.resultDisplay = tc.name === 'read_file'
            ? 'export const app = ...'
            : tc.name === 'run_shell_command'
            ? '✓ All tests passed'
            : '{ "status": "ok" }';
          updated.liveOutput = undefined;
        }

        return updated;
      }));

      // Log status transition
      const statusEmoji = {
        scheduled: '📋',
        validating: '🔍',
        awaiting_approval: '⏳',
        executing: '⚡',
        success: '✅',
        error: '❌',
        cancelled: '🚫',
      };

      addLog(`${statusEmoji[nextStatus]} ${currentTool.name}: ${nextStatus}`);

      // Special handling for awaiting_approval
      if (nextStatus === 'awaiting_approval') {
        addLog('  → 等待用户确认...');
        // Auto-approve after delay
        setTimeout(() => {
          addLog('  → 用户批准执行');
          setCurrentStatusIndex(prev => prev + 1);
        }, 600);
      } else {
        setCurrentStatusIndex(prev => prev + 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isPlaying, toolCalls, currentToolIndex, currentStatusIndex, allToolsCompleted, addLog]);

  const getStatusColor = (status: ToolStatus) => {
    switch (status) {
      case 'scheduled': return 'var(--muted)';
      case 'validating': return 'var(--purple)';
      case 'awaiting_approval': return 'var(--amber)';
      case 'executing': return 'var(--cyber-blue)';
      case 'success': return 'var(--terminal-green)';
      case 'error': return '#ef4444';
      case 'cancelled': return 'var(--muted)';
    }
  };

  const getDisplayStatus = (status: ToolStatus) => {
    switch (status) {
      case 'scheduled': return 'Pending';
      case 'validating': return 'Executing';
      case 'awaiting_approval': return 'Confirming';
      case 'executing': return 'Executing';
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'cancelled': return 'Cancelled';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            React 工具调度器
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            useReactToolScheduler - 工具调用生命周期管理
          </p>
        </div>
        <button
          onClick={() => isPlaying ? resetAnimation() : (resetAnimation(), setTimeout(() => setIsPlaying(true), 100))}
          className={`px-4 py-2 rounded font-mono text-sm transition-all ${
            isPlaying
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/30'
          }`}
        >
          {isPlaying ? '⏹ 停止' : '▶ 开始'}
        </button>
      </div>

      {/* 状态流图 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 font-mono">
          Tool Status State Machine
        </h3>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {STATUS_FLOW.map((status, index) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className={`px-3 py-2 rounded-lg border font-mono text-xs transition-all ${
                  currentStatusIndex === index && currentToolIndex < toolCalls.length
                    ? 'animate-pulse'
                    : ''
                }`}
                style={{
                  backgroundColor: `${getStatusColor(status)}20`,
                  borderColor: `${getStatusColor(status)}50`,
                  color: getStatusColor(status),
                }}
              >
                {status}
              </div>
              {index < STATUS_FLOW.length - 1 && (
                <span className="text-[var(--muted)]">→</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-6 text-xs text-[var(--muted)]">
          <span>分支: success | error | cancelled</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧: 工具调用列表 */}
        <div className="col-span-5">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
              TrackedToolCall[]
            </h3>
            <div className="space-y-3">
              {toolCalls.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  等待工具调用...
                </div>
              ) : (
                toolCalls.map((tc, index) => (
                  <div
                    key={tc.callId}
                    className={`p-4 rounded-lg border transition-all ${
                      index === currentToolIndex && isPlaying
                        ? 'bg-[var(--cyber-blue)]/10 border-[var(--cyber-blue)]/50'
                        : tc.status === 'success'
                        ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                        : 'bg-black/20 border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-[var(--text-primary)]">
                          {tc.name}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          {tc.callId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-mono"
                          style={{
                            backgroundColor: `${getStatusColor(tc.status)}20`,
                            color: getStatusColor(tc.status),
                          }}
                        >
                          {getDisplayStatus(tc.status)}
                        </span>
                        {tc.responseSubmittedToGemini && (
                          <span className="text-xs text-[var(--terminal-green)]" title="Response submitted to Gemini">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>

                    <code className="text-xs text-[var(--muted)] block mb-2">
                      {tc.args}
                    </code>

                    {tc.liveOutput && (
                      <div className="p-2 bg-black/30 rounded text-xs font-mono text-[var(--cyber-blue)] animate-pulse">
                        {tc.liveOutput}
                      </div>
                    )}

                    {tc.resultDisplay && (
                      <div className="p-2 bg-black/30 rounded text-xs font-mono text-[var(--terminal-green)]">
                        {tc.resultDisplay}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 中间: 调度器状态 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)] h-full">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-4 font-mono">
              CoreToolScheduler
            </h3>

            <div className="space-y-4">
              {/* Handlers */}
              <div className="p-3 bg-black/30 rounded-lg border border-[var(--border)]">
                <h4 className="text-xs font-mono text-[var(--muted)] mb-2">Handlers</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className={`p-2 rounded ${
                    currentStatusIndex === 3 ? 'bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    outputUpdateHandler
                    <span className="text-[var(--muted)] ml-2">// 实时输出</span>
                  </div>
                  <div className={`p-2 rounded ${
                    allToolsCompleted ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    onAllToolCallsComplete
                    <span className="text-[var(--muted)] ml-2">// 全部完成</span>
                  </div>
                  <div className={`p-2 rounded ${
                    currentStatusIndex >= 0 ? 'bg-[var(--amber)]/20 text-[var(--amber)]' : 'text-[var(--text-secondary)]'
                  }`}>
                    onToolCallsUpdate
                    <span className="text-[var(--muted)] ml-2">// 状态更新</span>
                  </div>
                </div>
              </div>

              {/* Status Mapping */}
              <div className="p-3 bg-black/30 rounded-lg border border-[var(--border)]">
                <h4 className="text-xs font-mono text-[var(--muted)] mb-2">
                  mapCoreStatusToDisplayStatus()
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    ['scheduled', 'Pending'],
                    ['validating', 'Executing'],
                    ['awaiting_approval', 'Confirming'],
                    ['executing', 'Executing'],
                    ['success', 'Success'],
                    ['error', 'Error'],
                    ['cancelled', 'Cancelled'],
                  ].map(([core, display]) => (
                    <div key={core} className="flex items-center gap-2">
                      <span className="text-[var(--muted)]">{core}</span>
                      <span className="text-[var(--text-secondary)]">→</span>
                      <span className="text-[var(--text-primary)]">{display}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Tracking */}
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <h4 className="text-xs font-mono text-purple-400 mb-2">
                  responseSubmittedToGemini
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  跟踪工具响应是否已提交回 Gemini API，
                  防止重复提交，确保对话流程正确性。
                </p>
                <div className="mt-2 flex gap-2">
                  {toolCalls.map(tc => (
                    <span
                      key={tc.callId}
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        tc.responseSubmittedToGemini
                          ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]'
                          : 'bg-[var(--muted)]/20 text-[var(--muted)]'
                      }`}
                    >
                      {tc.responseSubmittedToGemini ? '✓' : '○'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧: 日志 */}
        <div className="col-span-3">
          <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)] h-full">
            <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">
              Scheduler Log
            </h3>
            <div className="space-y-1 text-xs font-mono h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-[var(--muted)]">等待开始...</div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('✓') || log.includes('✅') ? 'text-[var(--terminal-green)]' :
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('🔧') || log.includes('📤') ? 'text-[var(--cyber-blue)]' :
                      log.includes('⏳') || log.includes('→') ? 'text-[var(--amber)]' :
                      log.includes('⚡') ? 'text-[var(--cyber-blue)]' :
                      log.includes('📋') ? 'text-[var(--muted)]' :
                      'text-[var(--text-secondary)]'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 源码说明 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          源码: useReactToolScheduler.ts
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`export function useReactToolScheduler(
  onComplete: (tools: CompletedToolCall[]) => Promise<void>,
  config: Config,
  getPreferredEditor: () => EditorType | undefined,
  onEditorClose: () => void,
): [TrackedToolCall[], ScheduleFn, MarkToolsAsSubmittedFn] {

  const [toolCallsForDisplay, setToolCallsForDisplay] = useState<TrackedToolCall[]>([]);

  // 实时输出更新
  const outputUpdateHandler: OutputUpdateHandler = useCallback((toolCallId, outputChunk) => {
    setToolCallsForDisplay(prevCalls =>
      prevCalls.map(tc => {
        if (tc.request.callId === toolCallId && tc.status === 'executing') {
          return { ...tc, liveOutput: outputChunk };
        }
        return tc;
      })
    );
  }, []);

  // 工具状态更新
  const toolCallsUpdateHandler: ToolCallsUpdateHandler = useCallback((updatedCoreToolCalls) => {
    setToolCallsForDisplay(prevTrackedCalls =>
      updatedCoreToolCalls.map(coreTc => {
        const existing = prevTrackedCalls.find(ptc => ptc.request.callId === coreTc.request.callId);
        return {
          ...coreTc,
          responseSubmittedToGemini: existing?.responseSubmittedToGemini ?? false,
          liveOutput: coreTc.status === 'executing' ? existing?.liveOutput : undefined,
          pid: coreTc.status === 'executing' ? coreTc.pid : undefined,
        };
      })
    );
  }, []);

  // 标记为已提交
  const markToolsAsSubmitted: MarkToolsAsSubmittedFn = useCallback((callIds) => {
    setToolCallsForDisplay(prevCalls =>
      prevCalls.map(tc =>
        callIds.includes(tc.request.callId)
          ? { ...tc, responseSubmittedToGemini: true }
          : tc
      )
    );
  }, []);

  return [toolCallsForDisplay, schedule, markToolsAsSubmitted];
}`}
        </pre>
      </div>
    </div>
  );
}
