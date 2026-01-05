// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * 内容生成管道动画
 *
 * 可视化 Gemini ↔ OpenAI 双向转换和流式处理（Innies/Qwen 的兼容层）
 * 源码: packages/core/src/core/openaiContentGenerator/pipeline.ts（fork-only）
 *
 * 管道阶段:
 * 1. Gemini Request → OpenAI Request 转换
 * 2. OpenAI API 调用 (流式/非流式)
 * 3. OpenAI Response → Gemini Response 转换
 * 4. Chunk 合并 (finishReason + usageMetadata)
 * 5. 遥测日志记录
 */

interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'complete';
  data?: unknown;
  duration?: number;
}

interface StreamChunk {
  id: string;
  type: 'content' | 'tool_call' | 'finish' | 'usage';
  content?: string;
  toolName?: string;
  finishReason?: string;
  usage?: { input: number; output: number };
  merged?: boolean;
}

interface ConversionStep {
  from: string;
  to: string;
  field: string;
}

const CONVERSION_STEPS: ConversionStep[] = [
  { from: 'contents', to: 'messages', field: 'Message Array' },
  { from: 'role: model', to: 'role: assistant', field: 'Role Mapping' },
  { from: 'parts[]', to: 'content', field: 'Content Parts' },
  { from: 'functionCall', to: 'tool_calls', field: 'Tool Calls' },
  { from: 'functionResponse', to: 'tool message', field: 'Tool Results' },
  { from: 'systemInstruction', to: 'system message', field: 'System Prompt' },
];

const SAMPLE_CHUNKS: StreamChunk[] = [
  { id: 'c1', type: 'content', content: 'I will help you ' },
  { id: 'c2', type: 'content', content: 'read the file.' },
  { id: 'c3', type: 'tool_call', toolName: 'read_file', content: '{"file_path": "src/app.ts"}' },
  { id: 'c4', type: 'finish', finishReason: 'tool_calls' },
  { id: 'c5', type: 'usage', usage: { input: 1250, output: 89 } },
];

export default function ContentGenerationPipelineAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: 'convert-req', name: 'Gemini → OpenAI 转换', status: 'pending' },
    { id: 'api-call', name: 'OpenAI API 调用', status: 'pending' },
    { id: 'convert-res', name: 'OpenAI → Gemini 转换', status: 'pending' },
    { id: 'merge', name: 'Chunk 合并', status: 'pending' },
    { id: 'telemetry', name: '遥测记录', status: 'pending' },
  ]);
  const [currentStage, setCurrentStage] = useState(-1);
  const [conversionSteps, setConversionSteps] = useState<number>(-1);
  const [streamChunks, setStreamChunks] = useState<StreamChunk[]>([]);
  const [currentChunk, setCurrentChunk] = useState(-1);
  const [mergedResponse, setMergedResponse] = useState<{
    content: string;
    toolCalls: string[];
    finishReason?: string;
    usage?: { input: number; output: number };
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setStages(prev => prev.map(s => ({ ...s, status: 'pending' })));
    setCurrentStage(-1);
    setConversionSteps(-1);
    setStreamChunks([]);
    setCurrentChunk(-1);
    setMergedResponse(null);
    setLogs([]);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timers: NodeJS.Timeout[] = [];

    if (currentStage === -1) {
      addLog('🚀 ContentGenerationPipeline.execute()');
      setCurrentStage(0);
      return;
    }

    // Stage 0: Convert Gemini to OpenAI
    if (currentStage === 0) {
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'active' } : s));
      addLog('📤 Converting Gemini request to OpenAI format...');

      CONVERSION_STEPS.forEach((step, i) => {
        timers.push(setTimeout(() => {
          setConversionSteps(i);
          addLog(`  → ${step.field}: ${step.from} → ${step.to}`);
        }, 400 * (i + 1)));
      });

      timers.push(setTimeout(() => {
        setStages(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'complete', duration: 120 } : s));
        addLog('✅ Request conversion complete');
        setCurrentStage(1);
      }, 400 * CONVERSION_STEPS.length + 500));
    }

    // Stage 1: API Call
    if (currentStage === 1) {
      setStages(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'active' } : s));
      addLog(`📡 Calling OpenAI API (${isStreaming ? 'streaming' : 'non-streaming'})...`);

      if (isStreaming) {
        // Stream chunks one by one
        SAMPLE_CHUNKS.forEach((chunk, i) => {
          timers.push(setTimeout(() => {
            setCurrentChunk(i);
            setStreamChunks(prev => [...prev, chunk]);

            if (chunk.type === 'content') {
              addLog(`  📥 Chunk: "${chunk.content}"`);
            } else if (chunk.type === 'tool_call') {
              addLog(`  🔧 Tool Call: ${chunk.toolName}`);
            } else if (chunk.type === 'finish') {
              addLog(`  🏁 Finish: ${chunk.finishReason}`);
            } else if (chunk.type === 'usage') {
              addLog(`  📊 Usage: ${chunk.usage?.input}→${chunk.usage?.output} tokens`);
            }
          }, 300 * (i + 1)));
        });

        timers.push(setTimeout(() => {
          setStages(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'complete', duration: 850 } : s));
          addLog('✅ Stream complete');
          setCurrentStage(2);
        }, 300 * SAMPLE_CHUNKS.length + 500));
      } else {
        // Non-streaming: single response
        timers.push(setTimeout(() => {
          setStreamChunks(SAMPLE_CHUNKS);
          setStages(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'complete', duration: 650 } : s));
          addLog('✅ Response received');
          setCurrentStage(2);
        }, 800));
      }
    }

    // Stage 2: Convert OpenAI to Gemini
    if (currentStage === 2) {
      setStages(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'active' } : s));
      addLog('📥 Converting OpenAI response to Gemini format...');

      timers.push(setTimeout(() => {
        addLog('  → role: assistant → role: model');
        addLog('  → content → parts[]');
        addLog('  → tool_calls → functionCall');
      }, 300));

      timers.push(setTimeout(() => {
        setStages(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'complete', duration: 45 } : s));
        addLog('✅ Response conversion complete');
        setCurrentStage(3);
      }, 800));
    }

    // Stage 3: Chunk Merging
    if (currentStage === 3) {
      setStages(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'active' } : s));
      addLog('🔗 Merging chunks (finishReason + usageMetadata)...');

      timers.push(setTimeout(() => {
        const content = SAMPLE_CHUNKS
          .filter(c => c.type === 'content')
          .map(c => c.content)
          .join('');
        const toolCalls = SAMPLE_CHUNKS
          .filter(c => c.type === 'tool_call')
          .map(c => c.toolName!);
        const finish = SAMPLE_CHUNKS.find(c => c.type === 'finish');
        const usage = SAMPLE_CHUNKS.find(c => c.type === 'usage');

        setMergedResponse({
          content,
          toolCalls,
          finishReason: finish?.finishReason,
          usage: usage?.usage,
        });

        addLog('  → Content chunks merged');
        addLog('  → Tool calls extracted');
        addLog('  → finishReason + usage attached');
      }, 400));

      timers.push(setTimeout(() => {
        setStages(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'complete', duration: 12 } : s));
        addLog('✅ Chunk merging complete');
        setCurrentStage(4);
      }, 900));
    }

    // Stage 4: Telemetry
    if (currentStage === 4) {
      setStages(prev => prev.map((s, i) => i === 4 ? { ...s, status: 'active' } : s));
      addLog('📊 Logging to telemetry service...');

      timers.push(setTimeout(() => {
        addLog('  → Request context logged');
        addLog('  → Token usage recorded');
        addLog('  → Duration metrics captured');
      }, 300));

      timers.push(setTimeout(() => {
        setStages(prev => prev.map((s, i) => i === 4 ? { ...s, status: 'complete', duration: 8 } : s));
        addLog('✅ Pipeline complete!');
        setIsPlaying(false);
      }, 700));
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, [isPlaying, currentStage, isStreaming, addLog]);

  const getStageColor = (status: string) => {
    switch (status) {
      case 'complete': return 'var(--terminal-green)';
      case 'active': return 'var(--cyber-blue)';
      default: return 'var(--muted)';
    }
  };

  const getChunkColor = (type: string) => {
    switch (type) {
      case 'content': return 'var(--terminal-green)';
      case 'tool_call': return 'var(--amber)';
      case 'finish': return 'var(--cyber-blue)';
      case 'usage': return '#a855f7';
      default: return 'var(--muted)';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            内容生成管道
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            ContentGenerationPipeline - Gemini ↔ OpenAI 双向转换（fork-only）
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isStreaming}
              onChange={(e) => setIsStreaming(e.target.checked)}
              disabled={isPlaying}
              className="rounded"
            />
            <span className="text-[var(--text-secondary)]">Streaming Mode</span>
          </label>
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
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-gray-300">
        <strong className="text-amber-400">注意：</strong>本页展示的是 Innies/Qwen CLI 为了对接 OpenAI 兼容 API 而引入的内容生成管道；
        上游 Gemini CLI 的核心链路不需要进行 Gemini ↔ OpenAI 的消息/工具格式互转。
      </div>

      {/* 管道阶段 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 font-mono">
          Pipeline Stages
        </h3>
        <div className="flex items-center gap-2">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center">
              <div
                className="px-4 py-3 rounded-lg border-2 transition-all min-w-[140px]"
                style={{
                  borderColor: getStageColor(stage.status),
                  backgroundColor: stage.status === 'active' ? `${getStageColor(stage.status)}15` : 'transparent',
                }}
              >
                <div className="text-xs font-mono" style={{ color: getStageColor(stage.status) }}>
                  {stage.status === 'complete' ? '✓' : stage.status === 'active' ? '⏳' : '○'} Stage {i + 1}
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)] mt-1">
                  {stage.name}
                </div>
                {stage.duration && (
                  <div className="text-xs text-[var(--muted)] mt-1">
                    {stage.duration}ms
                  </div>
                )}
              </div>
              {i < stages.length - 1 && (
                <div
                  className="w-8 h-0.5 mx-1"
                  style={{ backgroundColor: stages[i + 1].status !== 'pending' ? 'var(--terminal-green)' : 'var(--border)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 格式转换 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
              🔄 Format Conversion
            </h3>
            <div className="space-y-2">
              {CONVERSION_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`p-2 rounded border text-xs transition-all ${
                    i <= conversionSteps
                      ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border)] opacity-50'
                  }`}
                >
                  <div className="font-mono text-[var(--text-primary)] mb-1">{step.field}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--muted)]">{step.from}</span>
                    <span className="text-[var(--terminal-green)]">→</span>
                    <span className="text-[var(--cyber-blue)]">{step.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 流式块 */}
        <div className="col-span-4">
          <div className="bg-black/60 rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-3 font-mono">
              📡 Stream Chunks
            </h3>
            <div className="space-y-2 min-h-[200px]">
              {streamChunks.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  等待 API 响应...
                </div>
              ) : (
                streamChunks.map((chunk, i) => (
                  <div
                    key={chunk.id}
                    className={`p-2 rounded border text-xs font-mono transition-all ${
                      i === currentChunk
                        ? 'animate-pulse'
                        : ''
                    }`}
                    style={{
                      backgroundColor: `${getChunkColor(chunk.type)}15`,
                      borderColor: `${getChunkColor(chunk.type)}50`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: `${getChunkColor(chunk.type)}30`,
                          color: getChunkColor(chunk.type),
                        }}
                      >
                        {chunk.type}
                      </span>
                    </div>
                    <div className="text-[var(--text-secondary)]">
                      {chunk.type === 'content' && `"${chunk.content}"`}
                      {chunk.type === 'tool_call' && `${chunk.toolName}: ${chunk.content}`}
                      {chunk.type === 'finish' && `reason: ${chunk.finishReason}`}
                      {chunk.type === 'usage' && `${chunk.usage?.input} → ${chunk.usage?.output} tokens`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 合并结果 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--terminal-green)] mb-3 font-mono">
              ✅ Merged Response
            </h3>
            {mergedResponse ? (
              <div className="space-y-3">
                <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                  <div className="text-xs text-[var(--muted)] mb-1">Content</div>
                  <div className="text-sm text-[var(--text-primary)] font-mono">
                    "{mergedResponse.content}"
                  </div>
                </div>

                <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                  <div className="text-xs text-[var(--muted)] mb-1">Tool Calls</div>
                  <div className="flex gap-2">
                    {mergedResponse.toolCalls.map((tool, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded text-xs font-mono bg-[var(--amber)]/20 text-[var(--amber)]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                    <div className="text-xs text-[var(--muted)]">Finish Reason</div>
                    <div className="text-sm font-mono text-[var(--cyber-blue)]">
                      {mergedResponse.finishReason}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                    <div className="text-xs text-[var(--muted)]">Usage</div>
                    <div className="text-sm font-mono text-purple-400">
                      {mergedResponse.usage?.input}→{mergedResponse.usage?.output}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-[var(--muted)] py-12 text-sm">
                等待合并...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 日志 */}
      <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">Pipeline Log</h3>
        <div className="space-y-1 text-xs font-mono h-32 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-[var(--muted)]">等待开始...</div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`${
                  log.includes('✅') ? 'text-[var(--terminal-green)]' :
                  log.includes('🚀') ? 'text-[var(--cyber-blue)]' :
                  log.includes('📡') ? 'text-[var(--amber)]' :
                  log.includes('→') ? 'text-[var(--text-secondary)]' :
                  'text-[var(--muted)]'
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 源码说明 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          源码: pipeline.ts
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`class ContentGenerationPipeline {
  async executeStream(request: GenerateContentParameters): AsyncGenerator<GenerateContentResponse> {
    // Stage 1: Convert Gemini → OpenAI
    const openaiRequest = await this.buildRequest(request, userPromptId, true);

    // Stage 2: Call OpenAI API
    const stream = await this.client.chat.completions.create(openaiRequest);

    // Stage 3: Process stream with conversion
    for await (const chunk of stream) {
      const response = this.converter.convertOpenAIChunkToGemini(chunk);

      // Stage 4: Handle chunk merging (finishReason + usageMetadata)
      const shouldYield = this.handleChunkMerging(response, collected, setPending);
      if (shouldYield) yield response;
    }

    // Stage 5: Telemetry logging
    await this.config.telemetryService.logStreamingSuccess(context, responses);
  }
}`}
        </pre>
      </div>
    </div>
  );
}
