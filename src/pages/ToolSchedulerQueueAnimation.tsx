// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { CodeBlock } from '../components/CodeBlock';

/**
 * 工具调用队列动画
 *
 * 可视化 Scheduler 的调度流程
 * 源码: packages/core/src/core/coreToolScheduler.ts
 *
 * 状态流转:
 * validating → scheduled → executing → success/error/cancelled
 * validating → awaiting_approval → scheduled (需要确认)
 */

type ToolCallStatus =
 | 'validating'
 | 'scheduled'
 | 'awaiting_approval'
 | 'executing'
 | 'success'
 | 'error'
 | 'cancelled';

interface ToolCall {
 id: string;
 name: string;
 args: Record<string, unknown>;
 status: ToolCallStatus;
 startTime?: number;
 duration?: number;
 requiresApproval: boolean;
 error?: string;
}

const SAMPLE_TOOL_CALLS: Omit<ToolCall, 'status' | 'startTime' | 'duration'>[] = [
 { id: 'call_1', name: 'read_file', args: { file_path: 'src/app.ts' }, requiresApproval: false },
 { id: 'call_2', name: 'run_shell_command', args: { command: 'npm test' }, requiresApproval: true },
 { id: 'call_3', name: 'search_file_content', args: { pattern: 'TODO', dir_path: 'src' }, requiresApproval: false },
 { id: 'call_4', name: 'write_file', args: { file_path: 'src/new.ts', content: '...' }, requiresApproval: true },
];

export default function ToolSchedulerQueueAnimation() {
 const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
 const [isPlaying, setIsPlaying] = useState(false);
 const [phase, setPhase] = useState<'idle' | 'scheduling' | 'validating' | 'executing' | 'complete'>('idle');
 const [logs, setLogs] = useState<string[]>([]);
 const [approvalQueue, setApprovalQueue] = useState<string[]>([]);

 const addLog = useCallback((message: string) => {
 setLogs(prev => [...prev.slice(-15), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
 }, []);

 const resetAnimation = useCallback(() => {
 setToolCalls([]);
 setPhase('idle');
 setLogs([]);
 setApprovalQueue([]);
 setIsPlaying(false);
 }, []);

 const updateToolStatus = useCallback((id: string, status: ToolCallStatus, extra?: Partial<ToolCall>) => {
 setToolCalls(prev => prev.map(tc =>
 tc.id === id ? { ...tc, status, ...extra } : tc
 ));
 }, []);

 useEffect(() => {
 if (!isPlaying) return;

 const timers: NodeJS.Timeout[] = [];

 switch (phase) {
 case 'idle':
 addLog('📋 Scheduler.schedule() 开始');
 setPhase('scheduling');
 break;

 case 'scheduling':
 // 初始化所有工具调用
 const initialCalls = SAMPLE_TOOL_CALLS.map(tc => ({
 ...tc,
 status: 'validating' as ToolCallStatus,
 startTime: Date.now(),
 }));
 setToolCalls(initialCalls);
 addLog(` 接收 ${initialCalls.length} 个工具调用请求`);

 timers.push(setTimeout(() => {
 setPhase('validating');
 }, 600));
 break;

 case 'validating':
 addLog('🔍 验证阶段 - shouldConfirmExecute()');

 let delay = 0;
 toolCalls.forEach((tc, i) => {
 timers.push(setTimeout(() => {
 if (tc.requiresApproval) {
 updateToolStatus(tc.id, 'awaiting_approval');
 setApprovalQueue(prev => [...prev, tc.id]);
 addLog(` ⚠️ ${tc.name}: 需要用户确认`);
 } else {
 updateToolStatus(tc.id, 'scheduled');
 addLog(` ✓ ${tc.name}: 自动批准 → scheduled`);
 }
 }, delay));
 delay += 400;
 });

 timers.push(setTimeout(() => {
 // 自动批准等待中的工具
 approvalQueue.forEach((id, i) => {
 timers.push(setTimeout(() => {
 updateToolStatus(id, 'scheduled');
 const tc = toolCalls.find(t => t.id === id);
 addLog(` ✅ ${tc?.name}: 用户批准 → scheduled`);
 }, i * 300));
 });

 timers.push(setTimeout(() => {
 setApprovalQueue([]);
 setPhase('executing');
 }, approvalQueue.length * 300 + 500));
 }, delay + 800));
 break;

 case 'executing':
 addLog('⚡ 执行阶段 - attemptExecutionOfScheduledCalls()');
 addLog(' 并行执行所有 scheduled 工具');

 // 并行执行
 toolCalls.forEach((tc, i) => {
 if (tc.status !== 'scheduled') return;

 timers.push(setTimeout(() => {
 updateToolStatus(tc.id, 'executing');
 addLog(` ▶ ${tc.name}: executing`);
 }, i * 200));

 timers.push(setTimeout(() => {
 const success = Math.random() > 0.1; // 90% 成功率
 if (success) {
 updateToolStatus(tc.id, 'success', { duration: 200 + Math.random() * 500 });
 addLog(` ✓ ${tc.name}: success`);
 } else {
 updateToolStatus(tc.id, 'error', { error: 'Execution failed' });
 addLog(` ✗ ${tc.name}: error`);
 }
 }, i * 200 + 600 + Math.random() * 400));
 });

 timers.push(setTimeout(() => {
 setPhase('complete');
 }, toolCalls.length * 200 + 1200));
 break;

 case 'complete':
 addLog('📤 checkAndNotifyCompletion()');
 const successful = toolCalls.filter(tc => tc.status === 'success').length;
 const failed = toolCalls.filter(tc => tc.status === 'error').length;
 addLog(` 完成: ${successful} 成功, ${failed} 失败`);
 addLog('✅ 调度周期结束');
 setIsPlaying(false);
 break;
 }

 return () => timers.forEach(t => clearTimeout(t));
 }, [isPlaying, phase, toolCalls, approvalQueue, addLog, updateToolStatus]);

 const getStatusColor = (status: ToolCallStatus) => {
 switch (status) {
 case 'validating': return 'var(--color-text-muted)';
 case 'scheduled': return 'var(--color-primary)';
 case 'awaiting_approval': return 'var(--color-warning)';
 case 'executing': return 'var(--color-primary)';
 case 'success': return 'var(--color-primary)';
 case 'error': return 'var(--color-danger)';
 case 'cancelled': return '#6b7280';
 }
 };

 const getStatusIcon = (status: ToolCallStatus) => {
 switch (status) {
 case 'validating': return '🔍';
 case 'scheduled': return '📋';
 case 'awaiting_approval': return '⏳';
 case 'executing': return '⚡';
 case 'success': return '✅';
 case 'error': return '❌';
 case 'cancelled': return '🚫';
 }
 };

 return (
 <div className="p-6 space-y-6">
 {/* 标题区 */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-heading font-mono">
 工具调用队列
 </h1>
 <p className="text-dim text-sm mt-1">
 Scheduler - 并行调度与状态管理
 </p>
 </div>
 <button
 onClick={() => isPlaying ? resetAnimation() : (resetAnimation(), setTimeout(() => setIsPlaying(true), 100))}
 className={`px-4 py-2 rounded font-mono text-sm transition-all ${
 isPlaying
 ? 'bg-elevated text-heading border-l-2 border-l-edge-hover/30'
 : ' bg-elevated/20 text-heading border border-edge/30'
 }`}
 >
 {isPlaying ? '⏹ 停止' : '▶ 开始'}
 </button>
 </div>

 {/* 状态流转图 */}
 <div className="bg-surface rounded-lg p-4 border border-edge-hover">
 <h3 className="text-sm font-semibold text-heading mb-3 font-mono">
 状态流转
 </h3>
 <div className="flex items-center justify-center gap-2 text-xs font-mono flex-wrap">
 {['validating', 'scheduled', 'executing', 'success'].map((s, i, arr) => (
 <div key={s} className="flex items-center gap-2">
 <span
 className="px-2 py-1 rounded"
 style={{
 backgroundColor: `${getStatusColor(s as ToolCallStatus)}20`,
 color: getStatusColor(s as ToolCallStatus),
 border: `1px solid ${getStatusColor(s as ToolCallStatus)}40`
 }}
 >
 {s}
 </span>
 {i < arr.length - 1 && <span className="text-dim">→</span>}
 </div>
 ))}
 <span className="text-dim mx-2">|</span>
 <span
 className="px-2 py-1 rounded"
 style={{
 backgroundColor: `${getStatusColor('awaiting_approval')}20`,
 color: getStatusColor('awaiting_approval'),
 border: `1px solid ${getStatusColor('awaiting_approval')}40`
 }}
 >
 awaiting_approval
 </span>
 <span className="text-dim">/</span>
 <span
 className="px-2 py-1 rounded"
 style={{
 backgroundColor: `${getStatusColor('error')}20`,
 color: getStatusColor('error'),
 border: `1px solid ${getStatusColor('error')}40`
 }}
 >
 error
 </span>
 </div>
 </div>

 <div className="grid grid-cols-12 gap-6">
 {/* 工具调用队列 */}
 <div className="col-span-8">
 <div className="bg-surface rounded-lg p-4 border border-edge-hover">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-semibold text-heading font-mono">Tool Call Queue
 </h3>
 <span className="text-xs text-dim">
 {toolCalls.filter(tc => tc.status === 'success').length}/{toolCalls.length} completed
 </span>
 </div>

 <div className="space-y-3">
 {toolCalls.length === 0 ? (
 <div className="text-center text-dim py-12 text-sm">
 等待调度请求...
 </div>
 ) : (
 toolCalls.map((tc) => (
 <div
 key={tc.id}
 className={`p-4 rounded-lg border transition-all ${
 tc.status === 'executing' ? 'animate-pulse' : ''
 }`}
 style={{
 backgroundColor: `${getStatusColor(tc.status)}10`,
 borderColor: `${getStatusColor(tc.status)}40`,
 }}
 >
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <span className="text-lg">{getStatusIcon(tc.status)}</span>
 <span className="font-mono font-bold text-heading">
 {tc.name}
 </span>
 <span className="text-xs text-dim">{tc.id}</span>
 </div>
 <span
 className="text-xs font-mono px-2 py-0.5 rounded"
 style={{
 color: getStatusColor(tc.status),
 backgroundColor: `${getStatusColor(tc.status)}20`,
 }}
 >
 {tc.status}
 </span>
 </div>

 <div className="text-xs font-mono text-dim mb-2">
 {JSON.stringify(tc.args).slice(0, 60)}...
 </div>

 {/* 进度条 */}
 <div className="h-1 bg-elevated rounded overflow-hidden">
 <div
 className={`h-full transition-all duration-500 ${
 tc.status === 'executing' ? 'animate-pulse' : ''
 }`}
 style={{
 width: tc.status === 'success' || tc.status === 'error' ? '100%' :
 tc.status === 'executing' ? '70%' :
 tc.status === 'scheduled' ? '40%' :
 tc.status === 'awaiting_approval' ? '30%' : '10%',
 backgroundColor: getStatusColor(tc.status),
 }}
 />
 </div>

 {tc.duration && (
 <div className="text-xs text-dim mt-1">
 Duration: {tc.duration.toFixed(0)}ms
 </div>
 )}
 </div>
 ))
 )}
 </div>
 </div>
 </div>

 {/* 控制面板 + 日志 */}
 <div className="col-span-4 space-y-4">
 {/* 阶段指示 */}
 <div className="bg-surface rounded-lg p-4 border border-edge-hover">
 <h3 className="text-sm font-semibold text-heading mb-3 font-mono">Current Phase
 </h3>
 <div className="text-center">
 <span
 className="text-lg font-mono font-bold"
 style={{ color: phase === 'complete' ? 'var(--color-primary)' : 'var(--color-warning)' }}
 >
 {phase.toUpperCase()}
 </span>
 </div>
 <div className="mt-3 space-y-1 text-xs">
 {['scheduling', 'validating', 'executing', 'complete'].map((p) => (
 <div
 key={p}
 className={`flex items-center gap-2 ${
 phase === p ? 'text-heading' : 'text-dim'
 }`}
 >
 <span className={`w-2 h-2 rounded-full ${
 phase === p ? ' bg-elevated animate-pulse' : ' bg-elevated/30'
 }`} />
 {p}
 </div>
 ))}
 </div>
 </div>

 {/* 日志 */}
 <div className="bg-base/80 rounded-lg p-4 border border-edge-hover flex-1">
 <h3 className="text-xs font-semibold text-dim mb-2 font-mono">
 Scheduler Log
 </h3>
 <div className="space-y-1 text-xs font-mono h-48 overflow-y-auto">
 {logs.length === 0 ? (
 <div className="text-dim">等待开始...</div>
 ) : (
 logs.map((log, i) => (
 <div
 key={i}
 className={`${
 log.includes('✓') || log.includes('✅') ? 'text-heading' :
 log.includes('✗') || log.includes('❌') ? 'text-heading' :
 log.includes('⚠️') || log.includes('⏳') ? 'text-heading' :
 log.includes('📋') || log.includes('🔍') ? 'text-heading' :
 log.includes('⚡') ? 'text-heading' :
 'text-dim'
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
 <div className="bg-surface rounded-lg p-4 border border-edge-hover">
 <h3 className="text-sm font-semibold text-heading mb-3">
 源码: coreToolScheduler.ts
 </h3>
 <CodeBlock
   language="typescript"
   title="coreToolScheduler.ts"
   code={`class Scheduler {
  private toolCalls: ToolCall[] = [];
  private requestQueue: Array<{request, signal, resolve, reject}> = [];

  // 主调度入口
  schedule(request: ToolCallRequestInfo[], signal: AbortSignal): Promise<void> {
    // 1. 检查是否有正在运行的调用
    // 2. 初始化 toolCalls 为 'validating' 状态
    // 3. 对每个调用执行 shouldConfirmExecute()
    // 4. 根据结果设置 'scheduled' 或 'awaiting_approval'
    // 5. 调用 attemptExecutionOfScheduledCalls()
  }

  // 并行执行所有 scheduled 的工具
  private attemptExecutionOfScheduledCalls(signal: AbortSignal): void {
    const callsToExecute = this.toolCalls.filter(c => c.status === 'scheduled');
    callsToExecute.forEach(call => {
      call.invocation.execute(signal, liveOutputCallback)
        .then(result => this.setStatusInternal(callId, 'success', response))
        .catch(error => this.setStatusInternal(callId, 'error', errorResponse));
    });
  }
}`}
 />
 </div>
 </div>
 );
}
