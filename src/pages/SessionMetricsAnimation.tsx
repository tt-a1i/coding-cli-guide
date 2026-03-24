import { useState, useCallback } from 'react';
import { CodeBlock } from '../components/CodeBlock';

/**
 * 会话指标聚合动画
 *
 * 可视化 SessionContext.tsx + computeStats.ts 的核心逻辑：
 * 1. SessionMetrics 数据结构
 * 2. ModelMetrics 按模型聚合
 * 3. ToolCallStats 工具调用统计
 * 4. ComputedSessionStats 计算派生指标
 *
 * 源码位置:
 * - packages/cli/src/ui/contexts/SessionContext.tsx
 * - packages/cli/src/ui/utils/computeStats.ts
 */

interface ModelMetrics {
  modelId: string;
  api: {
    totalRequests: number;
    totalErrors: number;
    totalLatencyMs: number;
  };
  tokens: {
    prompt: number;
    candidates: number;
    cached: number;
    thoughts: number;
    tool: number;
    total: number;
  };
}

interface ToolCallStats {
  name: string;
  count: number;
  success: number;
  fail: number;
  durationMs: number;
  decisions: {
    accept: number;
    reject: number;
    modify: number;
    auto_accept: number;
  };
}

interface FileMetrics {
  totalLinesAdded: number;
  totalLinesRemoved: number;
}

interface SessionMetrics {
  models: Record<string, ModelMetrics>;
  tools: {
    totalCalls: number;
    totalSuccess: number;
    totalFail: number;
    totalDurationMs: number;
    totalDecisions: {
      accept: number;
      reject: number;
      modify: number;
    };
    byName: Record<string, ToolCallStats>;
  };
  files: FileMetrics;
}

interface ComputedStats {
  totalApiTime: number;
  totalToolTime: number;
  agentActiveTime: number;
  apiTimePercent: number;
  toolTimePercent: number;
  cacheEfficiency: number;
  successRate: number;
  agreementRate: number;
  totalCachedTokens: number;
  totalPromptTokens: number;
}

type AnimationPhase =
  | 'idle'
  | 'receive_api_response'
  | 'update_model_metrics'
  | 'receive_tool_call'
  | 'update_tool_stats'
  | 'compute_derived'
  | 'emit_update';

export default function SessionMetricsAnimation() {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);

  // Session metrics state
  const [metrics, setMetrics] = useState<SessionMetrics>({
    models: {},
    tools: {
      totalCalls: 0,
      totalSuccess: 0,
      totalFail: 0,
      totalDurationMs: 0,
      totalDecisions: { accept: 0, reject: 0, modify: 0 },
      byName: {},
    },
    files: { totalLinesAdded: 0, totalLinesRemoved: 0 },
  });

  const [computedStats, setComputedStats] = useState<ComputedStats>({
    totalApiTime: 0,
    totalToolTime: 0,
    agentActiveTime: 0,
    apiTimePercent: 0,
    toolTimePercent: 0,
    cacheEfficiency: 0,
    successRate: 0,
    agreementRate: 0,
    totalCachedTokens: 0,
    totalPromptTokens: 0,
  });

  const [lastPromptTokenCount, setLastPromptTokenCount] = useState(0);
  const [promptCount, setPromptCount] = useState(0);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  const addLog = (message: string) => {
    setEventLog(prev => [...prev.slice(-7), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // 模拟 API 响应
  const simulateApiResponse = useCallback(async () => {
    setPhase('receive_api_response');
    setHighlightedSection('api');
    addLog('收到 API 响应...');
    await new Promise(r => setTimeout(r, 800));

    const modelId = Math.random() > 0.3 ? 'gemini-1.5-pro' : 'gemini-1.5-pro-vision';
    const latency = 500 + Math.floor(Math.random() * 2000);
    const promptTokens = 1000 + Math.floor(Math.random() * 5000);
    const candidateTokens = 200 + Math.floor(Math.random() * 1500);
    const cachedTokens = Math.floor(promptTokens * 0.3 * Math.random());
    const hasError = Math.random() > 0.9;

    setPhase('update_model_metrics');
    addLog(`更新模型指标: ${modelId}`);
    await new Promise(r => setTimeout(r, 600));

    setMetrics(prev => {
      const existingModel = prev.models[modelId] || {
        modelId,
        api: { totalRequests: 0, totalErrors: 0, totalLatencyMs: 0 },
        tokens: { prompt: 0, candidates: 0, cached: 0, thoughts: 0, tool: 0, total: 0 },
      };

      return {
        ...prev,
        models: {
          ...prev.models,
          [modelId]: {
            ...existingModel,
            api: {
              totalRequests: existingModel.api.totalRequests + 1,
              totalErrors: existingModel.api.totalErrors + (hasError ? 1 : 0),
              totalLatencyMs: existingModel.api.totalLatencyMs + latency,
            },
            tokens: {
              ...existingModel.tokens,
              prompt: existingModel.tokens.prompt + promptTokens,
              candidates: existingModel.tokens.candidates + candidateTokens,
              cached: existingModel.tokens.cached + cachedTokens,
              total: existingModel.tokens.total + promptTokens + candidateTokens,
            },
          },
        },
      };
    });

    setLastPromptTokenCount(promptTokens);
    setPromptCount(prev => prev + 1);

    addLog(`  → 延迟: ${latency}ms, Tokens: ${promptTokens}+${candidateTokens}`);
  }, []);

  // 模拟工具调用
  const simulateToolCall = useCallback(async () => {
    setPhase('receive_tool_call');
    setHighlightedSection('tools');
    addLog('收到工具调用...');
    await new Promise(r => setTimeout(r, 800));

    const toolNames = [
      'read_file',
      'write_file',
      'run_shell_command',
      'search_file_content',
      'glob',
      'replace',
      'list_directory',
    ];
    const toolName = toolNames[Math.floor(Math.random() * toolNames.length)];
    const duration = 50 + Math.floor(Math.random() * 500);
    const success = Math.random() > 0.1;
    const decision = Math.random() > 0.7 ? 'accept' : Math.random() > 0.5 ? 'auto_accept' : 'reject';

    setPhase('update_tool_stats');
    addLog(`更新工具统计: ${toolName}`);
    await new Promise(r => setTimeout(r, 600));

    setMetrics(prev => {
      const existingTool = prev.tools.byName[toolName] || {
        name: toolName,
        count: 0,
        success: 0,
        fail: 0,
        durationMs: 0,
        decisions: { accept: 0, reject: 0, modify: 0, auto_accept: 0 },
      };

      const newDecisions = { ...existingTool.decisions };
      if (decision === 'accept' || decision === 'reject' || decision === 'auto_accept') {
        newDecisions[decision]++;
      }

      return {
        ...prev,
        tools: {
          ...prev.tools,
          totalCalls: prev.tools.totalCalls + 1,
          totalSuccess: prev.tools.totalSuccess + (success ? 1 : 0),
          totalFail: prev.tools.totalFail + (success ? 0 : 1),
          totalDurationMs: prev.tools.totalDurationMs + duration,
          totalDecisions: {
            accept: prev.tools.totalDecisions.accept + (decision === 'accept' ? 1 : 0),
            reject: prev.tools.totalDecisions.reject + (decision === 'reject' ? 1 : 0),
            modify: prev.tools.totalDecisions.modify,
          },
          byName: {
            ...prev.tools.byName,
            [toolName]: {
              ...existingTool,
              count: existingTool.count + 1,
              success: existingTool.success + (success ? 1 : 0),
              fail: existingTool.fail + (success ? 0 : 1),
              durationMs: existingTool.durationMs + duration,
              decisions: newDecisions,
            },
          },
        },
      };
    });

    // 模拟文件修改
    if (toolName === 'write_file' || toolName === 'replace') {
      const linesAdded = Math.floor(Math.random() * 50);
      const linesRemoved = Math.floor(Math.random() * 20);
      setMetrics(prev => ({
        ...prev,
        files: {
          totalLinesAdded: prev.files.totalLinesAdded + linesAdded,
          totalLinesRemoved: prev.files.totalLinesRemoved + linesRemoved,
        },
      }));
    }

    addLog(`  → ${toolName}: ${duration}ms, ${success ? '成功' : '失败'}`);
  }, []);

  // 计算派生指标
  const computeDerivedStats = useCallback(() => {
    setPhase('compute_derived');
    setHighlightedSection('computed');
    addLog('计算派生指标...');

    const totalApiTime = Object.values(metrics.models).reduce(
      (acc, model) => acc + model.api.totalLatencyMs,
      0
    );
    const totalToolTime = metrics.tools.totalDurationMs;
    const agentActiveTime = totalApiTime + totalToolTime;

    const totalCachedTokens = Object.values(metrics.models).reduce(
      (acc, model) => acc + model.tokens.cached,
      0
    );
    const totalPromptTokens = Object.values(metrics.models).reduce(
      (acc, model) => acc + model.tokens.prompt,
      0
    );

    const totalDecisions =
      metrics.tools.totalDecisions.accept +
      metrics.tools.totalDecisions.reject +
      metrics.tools.totalDecisions.modify;

    setComputedStats({
      totalApiTime,
      totalToolTime,
      agentActiveTime,
      apiTimePercent: agentActiveTime > 0 ? (totalApiTime / agentActiveTime) * 100 : 0,
      toolTimePercent: agentActiveTime > 0 ? (totalToolTime / agentActiveTime) * 100 : 0,
      cacheEfficiency: totalPromptTokens > 0 ? (totalCachedTokens / totalPromptTokens) * 100 : 0,
      successRate: metrics.tools.totalCalls > 0 ? (metrics.tools.totalSuccess / metrics.tools.totalCalls) * 100 : 0,
      agreementRate: totalDecisions > 0 ? (metrics.tools.totalDecisions.accept / totalDecisions) * 100 : 0,
      totalCachedTokens,
      totalPromptTokens,
    });
  }, [metrics]);

  // 发送更新事件
  const emitUpdate = useCallback(async () => {
    setPhase('emit_update');
    addLog('发送 UI 更新事件: uiTelemetryService.emit("update")');
    await new Promise(r => setTimeout(r, 400));
    setHighlightedSection(null);
    setPhase('idle');
  }, []);

  // 运行完整模拟
  const runSimulation = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);

    // 模拟多轮交互
    for (let i = 0; i < 3; i++) {
      await simulateApiResponse();
      await new Promise(r => setTimeout(r, 500));

      if (Math.random() > 0.3) {
        await simulateToolCall();
        await new Promise(r => setTimeout(r, 500));
      }

      computeDerivedStats();
      await emitUpdate();
      await new Promise(r => setTimeout(r, 800));
    }

    setIsRunning(false);
  }, [isRunning, simulateApiResponse, simulateToolCall, computeDerivedStats, emitUpdate]);

  // 重置
  const reset = useCallback(() => {
    setMetrics({
      models: {},
      tools: {
        totalCalls: 0,
        totalSuccess: 0,
        totalFail: 0,
        totalDurationMs: 0,
        totalDecisions: { accept: 0, reject: 0, modify: 0 },
        byName: {},
      },
      files: { totalLinesAdded: 0, totalLinesRemoved: 0 },
    });
    setComputedStats({
      totalApiTime: 0,
      totalToolTime: 0,
      agentActiveTime: 0,
      apiTimePercent: 0,
      toolTimePercent: 0,
      cacheEfficiency: 0,
      successRate: 0,
      agreementRate: 0,
      totalCachedTokens: 0,
      totalPromptTokens: 0,
    });
    setLastPromptTokenCount(0);
    setPromptCount(0);
    setEventLog([]);
    setPhase('idle');
    setHighlightedSection(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-heading mb-2">
            会话指标聚合器
          </h1>
          <p className="text-body">SessionContext + computeStats - 实时统计与派生计算</p>
          <p className="text-sm text-dim mt-2">
            源码: packages/cli/src/ui/contexts/SessionContext.tsx, packages/cli/src/ui/utils/computeStats.ts
          </p>
        </div>

        {/* Phase Indicator */}
        <div className="bg-surface rounded-xl p-4 mb-6 border border-edge">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                phase === 'idle' ? 'bg-dim' :
                phase === 'receive_api_response' || phase === 'receive_tool_call' ? 'bg-[var(--color-warning)] animate-pulse' :
                phase === 'update_model_metrics' || phase === 'update_tool_stats' ? 'bg-[var(--color-info)] animate-pulse' :
                phase === 'compute_derived' ? 'bg-accent animate-pulse' :
                'bg-[var(--color-success)] animate-pulse'
              }`} />
              <span className="font-mono text-heading">{phase}</span>
            </div>
            <div className="text-sm text-dim">
              Prompt #{promptCount} | Last: {lastPromptTokenCount.toLocaleString()} tokens
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Model Metrics */}
          <div className={`bg-surface rounded-xl p-6 border transition-all ${
            highlightedSection === 'api' ? 'border-edge ring-2 ring-[color:var(--color-warning-soft)]' : 'border-edge'
          }`}>
            <h2 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
              <span className="text-xl">🤖</span> ModelMetrics
            </h2>

            {Object.keys(metrics.models).length === 0 ? (
              <div className="text-dim text-sm">暂无模型数据...</div>
            ) : (
              <div className="space-y-4">
                {Object.values(metrics.models).map((model) => (
                  <div key={model.modelId} className="bg-base rounded-lg p-4 border border-edge/70">
                    <div className="font-mono text-sm text-accent mb-3">{model.modelId}</div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-elevated/60 rounded p-2">
                        <div className="text-xs text-dim">Requests</div>
                        <div className="text-lg font-bold text-heading">{model.api.totalRequests}</div>
                      </div>
                      <div className="bg-elevated/60 rounded p-2">
                        <div className="text-xs text-dim">Errors</div>
                        <div className={`text-lg font-bold ${model.api.totalErrors > 0 ? 'text-heading' : 'text-heading'}`}>
                          {model.api.totalErrors}
                        </div>
                      </div>
                      <div className="bg-elevated/60 rounded p-2">
                        <div className="text-xs text-dim">Avg Latency</div>
                        <div className="text-lg font-bold text-heading">
                          {model.api.totalRequests > 0 ? Math.floor(model.api.totalLatencyMs / model.api.totalRequests) : 0}ms
                        </div>
                      </div>
                      <div className="bg-elevated/60 rounded p-2">
                        <div className="text-xs text-dim">Cache Hit</div>
                        <div className="text-lg font-bold text-heading">
                          {model.tokens.prompt > 0 ? ((model.tokens.cached / model.tokens.prompt) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between text-xs text-dim">
                      <span>Prompt: {model.tokens.prompt.toLocaleString()}</span>
                      <span>Candidates: {model.tokens.candidates.toLocaleString()}</span>
                      <span>Cached: {model.tokens.cached.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Middle: Tool Stats */}
          <div className={`bg-surface rounded-xl p-6 border transition-all ${
            highlightedSection === 'tools' ? 'border-edge ring-2 ring-[color:var(--color-warning-soft)]' : 'border-edge'
          }`}>
            <h2 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
              <span className="text-xl">🔧</span> ToolCallStats
            </h2>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-base rounded-lg p-3 text-center border border-edge/70">
                <div className="text-2xl font-bold text-heading">{metrics.tools.totalCalls}</div>
                <div className="text-xs text-dim">Total Calls</div>
              </div>
              <div className="bg-base rounded-lg p-3 text-center border border-edge/70">
                <div className="text-2xl font-bold text-heading">{metrics.tools.totalSuccess}</div>
                <div className="text-xs text-dim">Success</div>
              </div>
              <div className="bg-base rounded-lg p-3 text-center border border-edge/70">
                <div className="text-2xl font-bold text-heading">{metrics.tools.totalFail}</div>
                <div className="text-xs text-dim">Failed</div>
              </div>
            </div>

            {/* Per-tool breakdown */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {Object.values(metrics.tools.byName).map((tool) => (
                <div key={tool.name} className="bg-base rounded p-3 flex items-center justify-between border border-edge/70">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-accent">{tool.name}</span>
                    <span className="text-xs text-dim">×{tool.count}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-heading">{tool.success}✓</span>
                    <span className="text-heading">{tool.fail}✗</span>
                    <span className="text-heading">{tool.durationMs}ms</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Decisions */}
            <div className="mt-4 bg-base rounded-lg p-3 border border-edge/70">
              <div className="text-xs text-dim mb-2">Decisions</div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-elevated text-heading rounded text-xs">
                  Accept: {metrics.tools.totalDecisions.accept}
                </span>
                <span className="px-2 py-1 bg-elevated text-heading rounded text-xs">
                  Reject: {metrics.tools.totalDecisions.reject}
                </span>
                <span className="px-2 py-1 bg-elevated text-heading rounded text-xs">
                  Modify: {metrics.tools.totalDecisions.modify}
                </span>
              </div>
            </div>

            {/* File Metrics */}
            <div className="mt-4 bg-base rounded-lg p-3 border border-edge/70">
              <div className="text-xs text-dim mb-2">File Changes</div>
              <div className="flex gap-4">
                <span className="text-heading">+{metrics.files.totalLinesAdded}</span>
                <span className="text-heading">-{metrics.files.totalLinesRemoved}</span>
              </div>
            </div>
          </div>

          {/* Right: Computed Stats */}
          <div className={`bg-surface rounded-xl p-6 border transition-all ${
            highlightedSection === 'computed' ? 'border-accent ring-2 ring-accent-light' : 'border-edge'
          }`}>
            <h2 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span> ComputedSessionStats
            </h2>

            <div className="space-y-4">
              {/* Time Distribution */}
              <div className="bg-base rounded-lg p-4 border border-edge/70">
                <div className="text-xs text-dim mb-2">Time Distribution</div>
                <div className="relative h-6 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[var(--color-info)]"
                    style={{ width: `${computedStats.apiTimePercent}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 bg-[var(--color-success)]"
                    style={{ left: `${computedStats.apiTimePercent}%`, width: `${computedStats.toolTimePercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-heading">API: {computedStats.apiTimePercent.toFixed(1)}%</span>
                  <span className="text-heading">Tool: {computedStats.toolTimePercent.toFixed(1)}%</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-base rounded-lg p-3 border border-edge/70">
                  <div className="text-xs text-dim">Cache Efficiency</div>
                  <div className="text-2xl font-bold text-heading">
                    {computedStats.cacheEfficiency.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-base rounded-lg p-3 border border-edge/70">
                  <div className="text-xs text-dim">Success Rate</div>
                  <div className="text-2xl font-bold text-heading">
                    {computedStats.successRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-base rounded-lg p-3 border border-edge/70">
                  <div className="text-xs text-dim">Agreement Rate</div>
                  <div className="text-2xl font-bold text-accent">
                    {computedStats.agreementRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-base rounded-lg p-3 border border-edge/70">
                  <div className="text-xs text-dim">Active Time</div>
                  <div className="text-2xl font-bold text-heading">
                    {(computedStats.agentActiveTime / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>

              {/* Token Summary */}
              <div className="bg-base rounded-lg p-4 border border-edge/70">
                <div className="text-xs text-dim mb-2">Token Summary</div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-lg font-bold text-heading">
                      {computedStats.totalPromptTokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-dim">Prompt Tokens</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-heading">
                      {computedStats.totalCachedTokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-dim">Cached</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="mt-6 bg-base rounded-xl p-4 border border-edge">
          <div className="text-sm text-dim mb-2">事件日志</div>
          <div className="h-32 overflow-y-auto font-mono text-xs space-y-1">
            {eventLog.length === 0 ? (
              <div className="text-dim">等待模拟开始...</div>
            ) : (
              eventLog.map((log, idx) => (
                <div key={idx} className="text-body">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* computeSessionStats Code */}
        <div className="mt-6 bg-base rounded-xl p-4 border border-edge">
          <div className="text-sm text-dim mb-2">computeSessionStats() 实现</div>
          <CodeBlock
            language="typescript"
            title="computeSessionStats"
            code={`const computeSessionStats = (metrics: SessionMetrics): ComputedSessionStats => {
  const totalApiTime = Object.values(models).reduce((acc, m) => acc + m.api.totalLatencyMs, 0);
  const totalToolTime = tools.totalDurationMs;
  const agentActiveTime = totalApiTime + totalToolTime;

  const totalCachedTokens = Object.values(models).reduce((acc, m) => acc + m.tokens.cached, 0);
  const totalPromptTokens = Object.values(models).reduce((acc, m) => acc + m.tokens.prompt, 0);
  const cacheEfficiency = totalPromptTokens > 0 ? (totalCachedTokens / totalPromptTokens) * 100 : 0;

  const totalDecisions = accept + reject + modify;
  const successRate = totalCalls > 0 ? (totalSuccess / totalCalls) * 100 : 0;
  const agreementRate = totalDecisions > 0 ? (accept / totalDecisions) * 100 : 0;

  return { totalApiTime, totalToolTime, cacheEfficiency, successRate, agreementRate, ... };
};`}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isRunning
                ? 'bg-elevated text-dim cursor-not-allowed'
                : 'bg-accent text-heading hover:bg-accent-hover'
            }`}
          >
            {isRunning ? '模拟中...' : '运行模拟'}
          </button>
          <button
            onClick={() => { simulateApiResponse().then(computeDerivedStats).then(emitUpdate); }}
            disabled={isRunning}
            className="px-6 py-3 bg-[var(--color-info)] text-heading rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            模拟 API 响应
          </button>
          <button
            onClick={() => { simulateToolCall().then(computeDerivedStats).then(emitUpdate); }}
            disabled={isRunning}
            className="px-6 py-3 bg-[var(--color-success)] text-heading rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            模拟工具调用
          </button>
          <button
            onClick={reset}
            disabled={isRunning}
            className="px-6 py-3 bg-elevated text-heading rounded-lg font-semibold hover:bg-surface transition-all disabled:opacity-50"
          >
            重置
          </button>
        </div>

        {/* Data Flow Diagram */}
        <div className="mt-8 bg-surface rounded-xl p-6 border border-edge">
          <h3 className="text-lg font-semibold text-heading mb-4">数据流</h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { label: 'API Response', icon: '📥' },
              { label: 'uiTelemetryService', icon: '📊', highlight: true },
              { label: 'SessionStatsProvider', icon: '🔄' },
              { label: 'areMetricsEqual()', icon: '⚖️' },
              { label: 'setStats()', icon: '💾' },
              { label: 'computeSessionStats()', icon: '🧮' },
              { label: 'UI Components', icon: '🖥️' },
            ].map((step, idx, arr) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`px-3 py-2 rounded-lg ${step.highlight ? 'bg-accent-light border border-accent/40' : 'bg-surface/80'}`}>
                  <span className="mr-2">{step.icon}</span>
                  <span className="text-sm text-heading">{step.label}</span>
                </div>
                {idx < arr.length - 1 && <span className="text-dim">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
