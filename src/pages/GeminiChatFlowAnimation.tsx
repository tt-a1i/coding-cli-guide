import { useState, useCallback } from 'react';

/**
 * GeminiChat 流程动画
 *
 * 可视化 geminiChat.ts 的核心逻辑：
 * 1. sendMessageStream - 流式消息发送
 * 2. History 管理 (curated vs comprehensive)
 * 3. StreamEventType 处理 (chunk, retry)
 * 4. processStreamResponse - 响应收集与校验（InvalidStreamError）
 *
 * 源码位置: packages/core/src/core/geminiChat.ts
 */

interface Content {
  id: number;
  role: 'user' | 'model';
  text: string;
  hasFunctionCall?: boolean;
  hasFunctionResponse?: boolean;
  isValid: boolean;
  parts: string[];
}

interface StreamChunk {
  id: number;
  // geminiChat.ts: StreamEventType = 'chunk' | 'retry'
  type: 'chunk' | 'retry';
  // 下面是对 GenerateContentResponse chunk 的“摘要”，用于教学可视化
  thoughtText?: string;
  text?: string; // 非 thought 文本
  toolName?: string;
  toolArgs?: string;
  finishReason?: string;
  hasUsageMetadata?: boolean;
}

type Phase =
  | 'idle'
  | 'wait_previous'
  | 'create_user_content'
  | 'add_to_history'
  | 'get_curated_history'
  | 'make_api_call'
  | 'process_stream'
  | 'handle_chunk'
  | 'validate_response'
  | 'consolidate_parts'
  | 'add_model_response'
  | 'complete';

export default function GeminiChatFlowAnimation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [history, setHistory] = useState<Content[]>([]);
  const [curatedHistory, setCuratedHistory] = useState<Content[]>([]);
  const [streamChunks, setStreamChunks] = useState<StreamChunk[]>([]);
  const [currentChunkIdx, setCurrentChunkIdx] = useState(-1);
  const [modelResponseParts, setModelResponseParts] = useState<string[]>([]);
  const [hasToolCall, setHasToolCall] = useState(false);
  const [hasFinishReason, setHasFinishReason] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userMessage, setUserMessage] = useState('请帮我分析这段代码的性能问题');

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // 生成模拟流数据
  const generateStreamChunks = (): StreamChunk[] => {
    const chunks: StreamChunk[] = [];
    let id = 0;

    // Attempt 1: 返回“只有 thought、没有 finishReason/工具/文本”的无效流（触发 InvalidStreamError）
    chunks.push({
      id: id++,
      type: 'chunk',
      thoughtText: '让我先快速分析一下…',
    });
    chunks.push({
      id: id++,
      type: 'chunk',
      thoughtText: '（这个 attempt 结尾没有 finishReason）',
    });

    // sendMessageStream 的下一个 attempt 会先 yield RETRY，提示 UI 丢弃上一轮 partial content
    chunks.push({ id: id++, type: 'retry' });

    // Attempt 2: 正常完成（包含文本 + finishReason + usageMetadata）
    chunks.push({
      id: id++,
      type: 'chunk',
      thoughtText: '我会按：定位瓶颈 → 复杂度分析 → 给出改法 的顺序来回答。',
    });

    const contentParts = [
      '我来帮你分析这段代码的性能问题。',
      '\n\n首先，我注意到这里有一个 O(n²) 的循环，',
      '可以通过缓存/哈希表把它优化为 O(n)。',
    ];

    for (const part of contentParts) {
      chunks.push({ id: id++, type: 'chunk', text: part });
    }

    // 结束块：finishReason + usageMetadata（真实实现里二者来自 GenerateContentResponse）
    chunks.push({
      id: id++,
      type: 'chunk',
      finishReason: 'STOP',
      hasUsageMetadata: true,
    });

    return chunks;
  };

  // extractCuratedHistory 逻辑
  const extractCuratedHistory = (comprehensiveHistory: Content[]): Content[] => {
    if (comprehensiveHistory.length === 0) return [];

    const curated: Content[] = [];
    let i = 0;

    while (i < comprehensiveHistory.length) {
      if (comprehensiveHistory[i].role === 'user') {
        curated.push(comprehensiveHistory[i]);
        i++;
      } else {
        const modelOutput: Content[] = [];
        let isValid = true;

        while (i < comprehensiveHistory.length && comprehensiveHistory[i].role === 'model') {
          modelOutput.push(comprehensiveHistory[i]);
          if (!comprehensiveHistory[i].isValid) {
            isValid = false;
          }
          i++;
        }

        if (isValid) {
          curated.push(...modelOutput);
        }
      }
    }

    return curated;
  };

  // 运行完整流程
  const runFlow = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStreamChunks([]);
    setModelResponseParts([]);
    setHasToolCall(false);
    setHasFinishReason(false);
    setCurrentChunkIdx(-1);
    setRetryCount(0);

    // Phase 1: Wait for previous
    setPhase('wait_previous');
    addLog('await this.sendPromise - 等待前一个消息完成');
    await new Promise(r => setTimeout(r, 600));

    // Phase 2: Create user content
    setPhase('create_user_content');
    addLog(`createUserContent("${userMessage.slice(0, 20)}...")`);
    await new Promise(r => setTimeout(r, 500));

    // Phase 3: Add to history
    setPhase('add_to_history');
    const newUserContent: Content = {
      id: Date.now(),
      role: 'user',
      text: userMessage,
      isValid: true,
      parts: [userMessage],
    };
    setHistory(prev => [...prev, newUserContent]);
    addLog('this.history.push(userContent)');
    await new Promise(r => setTimeout(r, 500));

    // Phase 4: Get curated history
    setPhase('get_curated_history');
    const allHistory = [...history, newUserContent];
    const curated = extractCuratedHistory(allHistory);
    setCuratedHistory(curated);
    addLog(`getHistory(true) - 获取 ${curated.length} 条有效历史`);
    await new Promise(r => setTimeout(r, 600));

    // Phase 5: Make API call
    setPhase('make_api_call');
    addLog('contentGenerator.generateContentStream(requestContents)');
    await new Promise(r => setTimeout(r, 800));

    // Generate stream chunks
    const chunks = generateStreamChunks();
    setStreamChunks(chunks);

    // Phase 6: Process stream
    setPhase('process_stream');
    addLog('开始处理流式响应...');
    await new Promise(r => setTimeout(r, 400));

    // Process each chunk
    const collectedParts: string[] = [];
    let foundToolCall = false;
    let finishReason: string | undefined;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      setCurrentChunkIdx(i);
      setPhase('handle_chunk');

      if (chunk.type === 'retry') {
        setRetryCount(prev => prev + 1);
        collectedParts.splice(0, collectedParts.length);
        foundToolCall = false;
        finishReason = undefined;
        setModelResponseParts([]);
        setHasToolCall(false);
        setHasFinishReason(false);
        addLog('收到 RETRY 事件：丢弃上一轮 partial content，并开始下一次 attempt');
      } else {
        // StreamEventType.CHUNK（GenerateContentResponse 的教学摘要）
        if (chunk.thoughtText) {
          addLog(`[Thought] ${chunk.thoughtText.slice(0, 30)}...`);
        }

        if (chunk.text) {
          collectedParts.push(chunk.text);
          setModelResponseParts([...collectedParts]);
          addLog(`[Content] "${chunk.text.slice(0, 20)}..."`);
        }

        if (chunk.toolName) {
          foundToolCall = true;
          setHasToolCall(true);
          addLog(`[FunctionCall] ${chunk.toolName} ${chunk.toolArgs ? chunk.toolArgs : ''}`.trim());
        }

        if (chunk.finishReason) {
          finishReason = chunk.finishReason;
          setHasFinishReason(true);
          addLog(`[Finish] reason=${chunk.finishReason}`);
        }

        if (chunk.hasUsageMetadata) {
          addLog('[Usage] usageMetadata recorded');
        }
      }

      await new Promise(r => setTimeout(r, 300));
    }

    // Phase 7: Validate response
    setPhase('validate_response');
    addLog('验证响应有效性...');
    await new Promise(r => setTimeout(r, 500));

    const responseText = collectedParts.join('').trim();
    let invalidReason: string | null = null;
    if (!foundToolCall) {
      if (!finishReason) {
        invalidReason = 'NO_FINISH_REASON';
      } else if (finishReason === 'MALFORMED_FUNCTION_CALL') {
        invalidReason = 'MALFORMED_FUNCTION_CALL';
      } else if (responseText.length === 0) {
        invalidReason = 'NO_RESPONSE_TEXT';
      }
    }

    const isValid = invalidReason === null;
    addLog(`hasToolCall=${foundToolCall}, finishReason=${finishReason ?? 'undefined'}, text.length=${responseText.length}`);
    addLog(isValid ? '✓ 响应有效' : `✗ 响应无效 (${invalidReason})`);
    await new Promise(r => setTimeout(r, 400));

    // Phase 8: Consolidate parts
    setPhase('consolidate_parts');
    addLog('合并连续文本 parts...');
    await new Promise(r => setTimeout(r, 400));

    // Phase 9: Add model response to history
    setPhase('add_model_response');
    const modelContent: Content = {
      id: Date.now() + 1,
      role: 'model',
      text: responseText,
      hasFunctionCall: foundToolCall,
      isValid,
      parts: collectedParts,
    };
    setHistory(prev => [...prev, modelContent]);
    addLog('this.history.push({ role: "model", parts: consolidatedParts })');
    await new Promise(r => setTimeout(r, 500));

    // Complete
    setPhase('complete');
    addLog('sendMessageStream 完成');
    setIsRunning(false);
  }, [isRunning, userMessage, history]);

  // 重置
  const reset = useCallback(() => {
    setPhase('idle');
    setHistory([]);
    setCuratedHistory([]);
    setStreamChunks([]);
    setCurrentChunkIdx(-1);
    setModelResponseParts([]);
    setHasToolCall(false);
    setHasFinishReason(false);
    setRetryCount(0);
    setLogs([]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
            GeminiChat 流程
          </h1>
          <p className="text-emerald-300/70">sendMessageStream - 流式对话管理</p>
          <p className="text-sm text-slate-400 mt-2">
            源码: packages/core/src/core/geminiChat.ts
          </p>
        </div>

        {/* Phase Progress */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-emerald-500/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {[
              { id: 'wait_previous', label: '等待前消息' },
              { id: 'create_user_content', label: '创建用户内容' },
              { id: 'add_to_history', label: '添加历史' },
              { id: 'get_curated_history', label: '获取有效历史' },
              { id: 'make_api_call', label: 'API 调用' },
              { id: 'process_stream', label: '处理流' },
              { id: 'validate_response', label: '验证响应' },
              { id: 'add_model_response', label: '保存响应' },
            ].map((step, idx, arr) => (
              <div key={step.id} className="flex items-center gap-1">
                <div className={`px-2 py-1 rounded text-xs ${
                  phase === step.id
                    ? 'bg-emerald-500 text-white'
                    : phase === 'complete' || arr.findIndex(s => s.id === phase) > idx
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'bg-slate-700 text-slate-400'
                }`}>
                  {step.label}
                </div>
                {idx < arr.length - 1 && <span className="text-slate-600">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: History Management */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-500/20">
            <h2 className="text-lg font-semibold text-emerald-300 mb-4">📚 History 管理</h2>

            <div className="space-y-4">
              {/* Comprehensive History */}
              <div>
                <div className="text-xs text-slate-400 mb-2">Comprehensive History ({history.length})</div>
                <div className="bg-slate-900/50 rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {history.length === 0 ? (
                    <div className="text-slate-600 text-sm">空</div>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded text-sm ${
                          item.role === 'user'
                            ? 'bg-blue-500/20 border-l-2 border-blue-400'
                            : item.isValid
                              ? 'bg-emerald-500/20 border-l-2 border-emerald-400'
                              : 'bg-red-500/20 border-l-2 border-red-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-mono ${
                            item.role === 'user' ? 'text-blue-400' : 'text-emerald-400'
                          }`}>{item.role}</span>
                          {!item.isValid && <span className="text-xs text-red-400">INVALID</span>}
                          {item.hasFunctionCall && <span className="text-xs text-yellow-400">FC</span>}
                        </div>
                        <div className="text-slate-300 truncate">{item.text.slice(0, 50)}...</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Curated History */}
              <div>
                <div className="text-xs text-slate-400 mb-2">Curated History ({curatedHistory.length})</div>
                <div className="bg-slate-900/50 rounded-lg p-3 max-h-[150px] overflow-y-auto">
                  {curatedHistory.length === 0 ? (
                    <div className="text-slate-600 text-sm">getHistory(true) 过滤无效内容</div>
                  ) : (
                    curatedHistory.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-xs py-1">
                        <span className={item.role === 'user' ? 'text-blue-400' : 'text-emerald-400'}>
                          {item.role}
                        </span>
                        <span className="text-slate-400 truncate">{item.text.slice(0, 30)}...</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* extractCuratedHistory code */}
              <div className="bg-slate-900/80 rounded p-3">
                <div className="text-xs text-slate-500 mb-1">extractCuratedHistory()</div>
                <pre className="text-[10px] text-emerald-400/70 overflow-x-auto">
{`// 过滤无效的 model 输出
while (i < history.length) {
  if (role === 'user') {
    curated.push(history[i]);
  } else {
    // 收集连续 model 输出
    if (allValid) curated.push(...modelOutput);
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Middle: Stream Processing */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-500/20">
            <h2 className="text-lg font-semibold text-emerald-300 mb-4">📡 Stream 处理</h2>

            {/* Stream chunks */}
            <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
              <div className="text-xs text-slate-400 mb-2">StreamEvent 序列</div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {streamChunks.map((chunk, idx) => (
                  <div
                    key={chunk.id}
                    className={`flex items-center gap-2 p-2 rounded text-sm transition-all ${
                      currentChunkIdx === idx
                        ? 'bg-yellow-500/30 ring-1 ring-yellow-400'
                        : currentChunkIdx > idx
                          ? 'bg-emerald-500/10'
                          : 'bg-slate-800/50'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                      chunk.type === 'retry'
                        ? 'bg-red-500/30 text-red-400'
                        : chunk.finishReason
                          ? 'bg-green-500/30 text-green-400'
                          : chunk.toolName
                            ? 'bg-yellow-500/30 text-yellow-400'
                            : chunk.text
                              ? 'bg-blue-500/30 text-blue-400'
                              : 'bg-purple-500/30 text-purple-400'
                    }`}>
                      {chunk.type === 'retry'
                        ? 'R'
                        : chunk.finishReason
                          ? '✓'
                          : chunk.toolName
                            ? '🔧'
                            : chunk.text
                              ? 'C'
                              : 'T'}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {chunk.type === 'retry'
                        ? 'retry'
                        : `chunk${chunk.finishReason ? ' (finish)' : chunk.toolName ? ' (functionCall)' : chunk.text ? ' (content)' : ' (thought)'}`}
                    </span>
                    <span className="text-xs text-slate-500 truncate flex-1">
                      {(chunk.finishReason ||
                        (chunk.toolName ? `${chunk.toolName} ${chunk.toolArgs ?? ''}`.trim() : undefined) ||
                        chunk.text ||
                        chunk.thoughtText ||
                        ''
                      ).slice(0, 25)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collected Parts */}
            <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
              <div className="text-xs text-slate-400 mb-2">modelResponseParts ({modelResponseParts.length})</div>
              <div className="text-sm text-slate-300 h-20 overflow-y-auto">
                {modelResponseParts.join('')}
              </div>
            </div>

            {/* Validation state */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${hasToolCall ? 'bg-yellow-500/20' : 'bg-slate-700/50'}`}>
                <div className="text-xs text-slate-400">hasToolCall</div>
                <div className={`text-lg font-bold ${hasToolCall ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {hasToolCall.toString()}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${hasFinishReason ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
                <div className="text-xs text-slate-400">hasFinishReason</div>
                <div className={`text-lg font-bold ${hasFinishReason ? 'text-green-400' : 'text-slate-500'}`}>
                  {hasFinishReason.toString()}
                </div>
              </div>
            </div>

            {retryCount > 0 && (
              <div className="mt-3 p-2 bg-red-500/20 rounded text-xs text-red-400">
                重试次数: {retryCount} (InvalidStreamError)
              </div>
            )}
          </div>

          {/* Right: Code & Logs */}
          <div className="space-y-6">
            {/* Input */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-500/20">
              <h2 className="text-lg font-semibold text-emerald-300 mb-4">💬 用户消息</h2>
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                disabled={isRunning}
                className="w-full bg-slate-900/50 border border-slate-600 rounded p-3 text-slate-200 text-sm resize-none"
                rows={3}
              />
            </div>

            {/* Key Code */}
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-600/30">
              <div className="text-xs text-slate-400 mb-2">sendMessageStream() 核心流程</div>
              <pre className="text-[10px] text-emerald-400/80 overflow-x-auto">
{`// packages/core/src/core/geminiChat.ts（简化）
async sendMessageStream(modelConfigKey, message, prompt_id, signal) {
  await this.sendPromise; // 串行化：等待上一条消息处理完成

  this.history.push(createUserContent(message)); // 只 push 一次（重试不重复 push）
  const requestContents = this.getHistory(true); // curated history

  return (async function* streamWithRetries() {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) yield { type: StreamEventType.RETRY }; // UI 丢弃上轮 partial content

      const stream = await makeApiCallAndProcessStream(
        attempt > 0 ? { ...modelConfigKey, isRetry: true } : modelConfigKey,
        requestContents,
        prompt_id,
        signal,
      );

      for await (const chunk of stream) {
        yield { type: StreamEventType.CHUNK, value: chunk };
      }
    }
  })();
}`}
              </pre>
            </div>

            {/* processStreamResponse */}
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-600/30">
              <div className="text-xs text-slate-400 mb-2">processStreamResponse() 验证</div>
              <pre className="text-[10px] text-emerald-400/80 overflow-x-auto">
{`// packages/core/src/core/geminiChat.ts（关键逻辑）
// A stream is successful if:
// 1) hasToolCall, OR
// 2) has finishReason (not MALFORMED_FUNCTION_CALL) AND non-empty responseText
if (!hasToolCall) {
  if (!finishReason) throw new InvalidStreamError('NO_FINISH_REASON');
  if (finishReason === FinishReason.MALFORMED_FUNCTION_CALL) {
    throw new InvalidStreamError('MALFORMED_FUNCTION_CALL');
  }
  if (!responseText) throw new InvalidStreamError('NO_RESPONSE_TEXT');
}

this.history.push({ role: 'model', parts: consolidatedParts });`}
              </pre>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="mt-6 bg-slate-900/80 rounded-xl p-4 border border-slate-600/30">
          <div className="text-sm text-slate-400 mb-2">执行日志</div>
          <div className="h-32 overflow-y-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <div className="text-slate-600">等待开始...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="text-slate-300">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={runFlow}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isRunning
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
            }`}
          >
            {isRunning ? '运行中...' : '发送消息'}
          </button>
          <button
            onClick={reset}
            disabled={isRunning}
            className="px-6 py-3 bg-slate-700 text-slate-200 rounded-lg font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            重置
          </button>
        </div>

        {/* InvalidStreamError + RETRY */}
        <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-emerald-500/20">
          <h3 className="text-lg font-semibold text-emerald-300 mb-4">🔁 InvalidStreamError 重试语义</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-slate-400 mb-2">作用</div>
              <p className="text-sm text-slate-300">
                当模型返回的流内容不符合“可继续对话”的最小条件时，
                <code className="text-emerald-200">processStreamResponse()</code> 会抛出
                <code className="text-emerald-200">InvalidStreamError</code>。
                在符合条件时（如 Gemini 2 模型的内容错误），
                <code className="text-emerald-200">sendMessageStream()</code> 会触发一次重试，
                并先 yield 一个 <code className="text-emerald-200">RETRY</code> 事件，提示 UI 丢弃上一轮 partial content。
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <pre className="text-xs text-emerald-400/80">
{`// packages/core/src/core/geminiChat.ts（简化）
for (let attempt = 0; attempt < maxAttempts; attempt++) {
  if (attempt > 0) yield { type: StreamEventType.RETRY };

  try {
    for await (const chunk of processStreamResponse(...)) {
      yield { type: StreamEventType.CHUNK, value: chunk };
    }
    break; // success
  } catch (e) {
    // InvalidStreamError / network retryable errors → retry (if attempts left)
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
