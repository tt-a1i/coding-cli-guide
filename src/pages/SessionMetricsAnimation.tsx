import { useState, useCallback } from 'react';

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
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
            会话指标聚合器
          </h1>
          <p className="text-indigo-300/70">SessionContext + computeStats - 实时统计与派生计算</p>
          <p className="text-sm text-slate-400 mt-2">
            源码: packages/cli/src/ui/contexts/SessionContext.tsx, packages/cli/src/ui/utils/computeStats.ts
          </p>
        </div>

        {/* Phase Indicator */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                phase === 'idle' ? 'bg-slate-500' :
                phase === 'receive_api_response' || phase === 'receive_tool_call' ? 'bg-yellow-500 animate-pulse' :
                phase === 'update_model_metrics' || phase === 'update_tool_stats' ? 'bg-blue-500 animate-pulse' :
                phase === 'compute_derived' ? 'bg-purple-500 animate-pulse' :
                'bg-green-500 animate-pulse'
              }`} />
              <span className="font-mono text-slate-200">{phase}</span>
            </div>
            <div className="text-sm text-slate-400">
              Prompt #{promptCount} | Last: {lastPromptTokenCount.toLocaleString()} tokens
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Model Metrics */}
          <div className={`bg-slate-800/50 rounded-xl p-6 border transition-all ${
            highlightedSection === 'api' ? 'border-yellow-500 ring-2 ring-yellow-500/30' : 'border-indigo-500/20'
          }`}>
            <h2 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <span className="text-xl">🤖</span> ModelMetrics
            </h2>

            {Object.keys(metrics.models).length === 0 ? (
              <div className="text-slate-500 text-sm">暂无模型数据...</div>
            ) : (
              <div className="space-y-4">
                {Object.values(metrics.models).map((model) => (
                  <div key={model.modelId} className="bg-slate-900/50 rounded-lg p-4">
                    <div className="font-mono text-sm text-cyan-400 mb-3">{model.modelId}</div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-xs text-slate-500">Requests</div>
                        <div className="text-lg font-bold text-slate-200">{model.api.totalRequests}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-xs text-slate-500">Errors</div>
                        <div className={`text-lg font-bold ${model.api.totalErrors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {model.api.totalErrors}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-xs text-slate-500">Avg Latency</div>
                        <div className="text-lg font-bold text-yellow-400">
                          {model.api.totalRequests > 0 ? Math.floor(model.api.totalLatencyMs / model.api.totalRequests) : 0}ms
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-xs text-slate-500">Cache Hit</div>
                        <div className="text-lg font-bold text-green-400">
                          {model.tokens.prompt > 0 ? ((model.tokens.cached / model.tokens.prompt) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between text-xs text-slate-400">
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
          <div className={`bg-slate-800/50 rounded-xl p-6 border transition-all ${
            highlightedSection === 'tools' ? 'border-yellow-500 ring-2 ring-yellow-500/30' : 'border-indigo-500/20'
          }`}>
            <h2 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <span className="text-xl">🔧</span> ToolCallStats
            </h2>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-slate-200">{metrics.tools.totalCalls}</div>
                <div className="text-xs text-slate-500">Total Calls</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{metrics.tools.totalSuccess}</div>
                <div className="text-xs text-slate-500">Success</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{metrics.tools.totalFail}</div>
                <div className="text-xs text-slate-500">Failed</div>
              </div>
            </div>

            {/* Per-tool breakdown */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {Object.values(metrics.tools.byName).map((tool) => (
                <div key={tool.name} className="bg-slate-900/50 rounded p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-cyan-400">{tool.name}</span>
                    <span className="text-xs text-slate-500">×{tool.count}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-400">{tool.success}✓</span>
                    <span className="text-red-400">{tool.fail}✗</span>
                    <span className="text-yellow-400">{tool.durationMs}ms</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Decisions */}
            <div className="mt-4 bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-2">Decisions</div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  Accept: {metrics.tools.totalDecisions.accept}
                </span>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                  Reject: {metrics.tools.totalDecisions.reject}
                </span>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                  Modify: {metrics.tools.totalDecisions.modify}
                </span>
              </div>
            </div>

            {/* File Metrics */}
            <div className="mt-4 bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-2">File Changes</div>
              <div className="flex gap-4">
                <span className="text-green-400">+{metrics.files.totalLinesAdded}</span>
                <span className="text-red-400">-{metrics.files.totalLinesRemoved}</span>
              </div>
            </div>
          </div>

          {/* Right: Computed Stats */}
          <div className={`bg-slate-800/50 rounded-xl p-6 border transition-all ${
            highlightedSection === 'computed' ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-indigo-500/20'
          }`}>
            <h2 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span> ComputedSessionStats
            </h2>

            <div className="space-y-4">
              {/* Time Distribution */}
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-xs text-slate-500 mb-2">Time Distribution</div>
                <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-blue-500"
                    style={{ width: `${computedStats.apiTimePercent}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 bg-green-500"
                    style={{ left: `${computedStats.apiTimePercent}%`, width: `${computedStats.toolTimePercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-blue-400">API: {computedStats.apiTimePercent.toFixed(1)}%</span>
                  <span className="text-green-400">Tool: {computedStats.toolTimePercent.toFixed(1)}%</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">Cache Efficiency</div>
                  <div className="text-2xl font-bold text-green-400">
                    {computedStats.cacheEfficiency.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">Success Rate</div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {computedStats.successRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">Agreement Rate</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {computedStats.agreementRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">Active Time</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {(computedStats.agentActiveTime / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>

              {/* Token Summary */}
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-xs text-slate-500 mb-2">Token Summary</div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-lg font-bold text-slate-200">
                      {computedStats.totalPromptTokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">Prompt Tokens</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {computedStats.totalCachedTokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">Cached</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="mt-6 bg-slate-900/80 rounded-xl p-4 border border-slate-600/30">
          <div className="text-sm text-slate-400 mb-2">事件日志</div>
          <div className="h-32 overflow-y-auto font-mono text-xs space-y-1">
            {eventLog.length === 0 ? (
              <div className="text-slate-600">等待模拟开始...</div>
            ) : (
              eventLog.map((log, idx) => (
                <div key={idx} className="text-slate-300">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* computeSessionStats Code */}
        <div className="mt-6 bg-slate-900/80 rounded-xl p-4 border border-slate-600/30">
          <div className="text-sm text-slate-400 mb-2">computeSessionStats() 实现</div>
          <pre className="text-xs text-green-400/80 overflow-x-auto">
{`const computeSessionStats = (metrics: SessionMetrics): ComputedSessionStats => {
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
          </pre>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isRunning
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-600 hover:to-cyan-600'
            }`}
          >
            {isRunning ? '模拟中...' : '运行模拟'}
          </button>
          <button
            onClick={() => { simulateApiResponse().then(computeDerivedStats).then(emitUpdate); }}
            disabled={isRunning}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            模拟 API 响应
          </button>
          <button
            onClick={() => { simulateToolCall().then(computeDerivedStats).then(emitUpdate); }}
            disabled={isRunning}
            className="px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
          >
            模拟工具调用
          </button>
          <button
            onClick={reset}
            disabled={isRunning}
            className="px-6 py-3 bg-slate-700 text-slate-200 rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            重置
          </button>
        </div>

        {/* Data Flow Diagram */}
        <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-indigo-500/20">
          <h3 className="text-lg font-semibold text-indigo-300 mb-4">数据流</h3>
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
                <div className={`px-3 py-2 rounded-lg ${step.highlight ? 'bg-indigo-500/30 border border-indigo-400' : 'bg-slate-700/50'}`}>
                  <span className="mr-2">{step.icon}</span>
                  <span className="text-sm text-slate-200">{step.label}</span>
                </div>
                {idx < arr.length - 1 && <span className="text-slate-500">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
