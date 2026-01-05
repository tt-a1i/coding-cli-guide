// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * 循环检测引擎动画
 *
 * 可视化三层循环检测防护机制
 * 源码: packages/core/src/services/loopDetectionService.ts
 *
 * 检测层级:
 * - Layer 1: 工具调用重复检测 (SHA256 hash, threshold=5)
 * - Layer 2: 内容重复检测 (滑动窗口, chunk=50, threshold=10)
 * - Layer 3: LLM 智能检测 (自适应间隔 5-15 turns, confidence>0.9)
 */

interface ToolCall {
  id: string;
  name: string;
  args: string;
  hash: string;
  timestamp: number;
}

interface ContentChunk {
  id: string;
  content: string;
  hash: string;
  index: number;
  occurrences: number[];
}

interface LLMCheck {
  turn: number;
  confidence: number;
  reasoning: string;
  isLoop: boolean;
}

type DetectionLayer = 'tool' | 'content' | 'llm';

const SAMPLE_TOOL_CALLS: Omit<ToolCall, 'hash' | 'timestamp'>[] = [
  { id: 't1', name: 'read_file', args: '{"file_path": "src/app.ts"}' },
  { id: 't2', name: 'replace', args: '{"file_path": "src/app.ts", "old_string": "a", "new_string": "b"}' },
  { id: 't3', name: 'read_file', args: '{"file_path": "src/app.ts"}' },
  { id: 't4', name: 'replace', args: '{"file_path": "src/app.ts", "old_string": "a", "new_string": "b"}' },
  { id: 't5', name: 'read_file', args: '{"file_path": "src/app.ts"}' },
  { id: 't6', name: 'replace', args: '{"file_path": "src/app.ts", "old_string": "a", "new_string": "b"}' },
  { id: 't7', name: 'replace', args: '{"file_path": "src/app.ts", "old_string": "a", "new_string": "b"}' },
  { id: 't8', name: 'replace', args: '{"file_path": "src/app.ts", "old_string": "a", "new_string": "b"}' },
];

const SAMPLE_CONTENT = "The function calculates. The function calculates. The function calculates. The function calculates. The function calculates. The function calculates. The function calculates. The function calculates. The function calculates. The function calculates. The function calculates. ";

export default function LoopDetectionEngineAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLayer, setActiveLayer] = useState<DetectionLayer>('tool');
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [currentToolIndex, setCurrentToolIndex] = useState(-1);
  const [consecutiveCount, setConsecutiveCount] = useState(0);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [toolLoopDetected, setToolLoopDetected] = useState(false);

  const [contentChunks, setContentChunks] = useState<ContentChunk[]>([]);
  const [streamPosition, setStreamPosition] = useState(0);
  const [contentLoopDetected, setContentLoopDetected] = useState(false);

  const [llmChecks, setLlmChecks] = useState<LLMCheck[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [checkInterval, setCheckInterval] = useState(3);
  const [llmLoopDetected, setLlmLoopDetected] = useState(false);

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-12), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  const resetAnimation = useCallback(() => {
    setToolCalls([]);
    setCurrentToolIndex(-1);
    setConsecutiveCount(0);
    setLastHash(null);
    setToolLoopDetected(false);
    setContentChunks([]);
    setStreamPosition(0);
    setContentLoopDetected(false);
    setLlmChecks([]);
    setCurrentTurn(0);
    setCheckInterval(3);
    setLlmLoopDetected(false);
    setLogs([]);
    setIsPlaying(false);
  }, []);

  // Tool Call Detection Layer
  useEffect(() => {
    if (!isPlaying || activeLayer !== 'tool') return;
    if (toolLoopDetected) {
      addLog('🚨 LOOP DETECTED: CONSECUTIVE_IDENTICAL_TOOL_CALLS');
      setTimeout(() => setActiveLayer('content'), 1500);
      return;
    }
    if (currentToolIndex >= SAMPLE_TOOL_CALLS.length - 1) {
      addLog('✅ Layer 1 passed - no tool call loop');
      setTimeout(() => setActiveLayer('content'), 1000);
      return;
    }

    const timer = setTimeout(() => {
      const nextIndex = currentToolIndex + 1;
      const call = SAMPLE_TOOL_CALLS[nextIndex];
      const hash = simpleHash(`${call.name}:${call.args}`);

      const newCall: ToolCall = {
        ...call,
        hash,
        timestamp: Date.now(),
      };

      setToolCalls(prev => [...prev, newCall]);
      setCurrentToolIndex(nextIndex);

      if (hash === lastHash) {
        const newCount = consecutiveCount + 1;
        setConsecutiveCount(newCount);
        addLog(`  ⚠️ Consecutive: ${newCount}/5 (hash: ${hash.slice(0, 8)})`);
        if (newCount >= 5) {
          setToolLoopDetected(true);
        }
      } else {
        setLastHash(hash);
        setConsecutiveCount(1);
        addLog(`📥 Tool: ${call.name} (hash: ${hash.slice(0, 8)})`);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isPlaying, activeLayer, currentToolIndex, lastHash, consecutiveCount, toolLoopDetected, addLog]);

  // Content Detection Layer
  useEffect(() => {
    if (!isPlaying || activeLayer !== 'content') return;
    if (contentLoopDetected) {
      addLog('🚨 LOOP DETECTED: CHANTING_IDENTICAL_SENTENCES');
      setTimeout(() => setActiveLayer('llm'), 1500);
      return;
    }
    if (streamPosition >= SAMPLE_CONTENT.length - 50) {
      addLog('✅ Layer 2 passed - no content chanting');
      setTimeout(() => setActiveLayer('llm'), 1000);
      return;
    }

    const timer = setTimeout(() => {
      const chunk = SAMPLE_CONTENT.substring(streamPosition, streamPosition + 50);
      const hash = simpleHash(chunk);

      setContentChunks(prev => {
        const existing = prev.find(c => c.hash === hash);
        if (existing) {
          const updated = prev.map(c =>
            c.hash === hash
              ? { ...c, occurrences: [...c.occurrences, streamPosition] }
              : c
          );
          const updatedChunk = updated.find(c => c.hash === hash)!;
          if (updatedChunk.occurrences.length >= 10) {
            // Check average distance
            const recentOccurrences = updatedChunk.occurrences.slice(-10);
            const totalDistance = recentOccurrences[9] - recentOccurrences[0];
            const avgDistance = totalDistance / 9;
            if (avgDistance <= 75) { // 1.5 * 50
              setContentLoopDetected(true);
              addLog(`  🔄 Chunk repeated 10x, avg distance: ${avgDistance.toFixed(1)}`);
            }
          } else {
            addLog(`  📊 Hash ${hash.slice(0, 6)} seen ${updatedChunk.occurrences.length}x`);
          }
          return updated;
        } else {
          addLog(`📝 New chunk at ${streamPosition} (hash: ${hash.slice(0, 6)})`);
          return [...prev, {
            id: `c${prev.length}`,
            content: chunk.slice(0, 20) + '...',
            hash,
            index: streamPosition,
            occurrences: [streamPosition],
          }];
        }
      });

      setStreamPosition(prev => prev + 1);
    }, 100);

    return () => clearTimeout(timer);
  }, [isPlaying, activeLayer, streamPosition, contentLoopDetected, addLog]);

  // LLM Detection Layer
  useEffect(() => {
    if (!isPlaying || activeLayer !== 'llm') return;
    if (llmLoopDetected) {
      addLog('🚨 LOOP DETECTED: LLM_DETECTED_LOOP (confidence > 0.9)');
      setIsPlaying(false);
      return;
    }
    if (currentTurn >= 50) {
      addLog('✅ Layer 3 passed - LLM found no loop');
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const nextTurn = currentTurn + 1;
      setCurrentTurn(nextTurn);

      // Check if we should run LLM check
      if (nextTurn >= 30 && (nextTurn - (llmChecks.length > 0 ? llmChecks[llmChecks.length - 1].turn : 0)) >= checkInterval) {
        // Simulate LLM check with increasing confidence over time
        const baseConfidence = Math.min(0.3 + (nextTurn - 30) * 0.02, 0.95);
        const confidence = baseConfidence + (Math.random() * 0.1 - 0.05);
        const clampedConfidence = Math.max(0, Math.min(1, confidence));

        const check: LLMCheck = {
          turn: nextTurn,
          confidence: clampedConfidence,
          reasoning: clampedConfidence > 0.9
            ? 'Repetitive tool calls detected with no forward progress'
            : 'Some repetition but making incremental changes',
          isLoop: clampedConfidence > 0.9,
        };

        setLlmChecks(prev => [...prev, check]);

        // Adjust check interval based on confidence
        const newInterval = Math.round(5 + (15 - 5) * (1 - clampedConfidence));
        setCheckInterval(newInterval);

        addLog(`🧠 LLM Check @${nextTurn}: ${(clampedConfidence * 100).toFixed(0)}% confidence`);
        addLog(`  → Next check in ${newInterval} turns`);

        if (clampedConfidence > 0.9) {
          setLlmLoopDetected(true);
        }
      } else if (nextTurn < 30) {
        addLog(`⏳ Turn ${nextTurn}/30 (LLM check starts at 30)`);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isPlaying, activeLayer, currentTurn, checkInterval, llmChecks, llmLoopDetected, addLog]);

  const getLayerStatus = (layer: DetectionLayer) => {
    if (layer === 'tool') {
      if (toolLoopDetected) return 'detected';
      if (activeLayer === 'tool') return 'active';
      if (activeLayer === 'content' || activeLayer === 'llm') return 'passed';
      return 'pending';
    }
    if (layer === 'content') {
      if (contentLoopDetected) return 'detected';
      if (activeLayer === 'content') return 'active';
      if (activeLayer === 'llm') return 'passed';
      return 'pending';
    }
    if (layer === 'llm') {
      if (llmLoopDetected) return 'detected';
      if (activeLayer === 'llm') return 'active';
      return 'pending';
    }
    return 'pending';
  };

  const getLayerColor = (status: string) => {
    switch (status) {
      case 'detected': return '#ef4444';
      case 'active': return 'var(--cyber-blue)';
      case 'passed': return 'var(--terminal-green)';
      default: return 'var(--muted)';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            循环检测引擎
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            LoopDetectionService - 三层防护机制
          </p>
        </div>
        <button
          onClick={() => isPlaying ? resetAnimation() : (resetAnimation(), setTimeout(() => { setActiveLayer('tool'); setIsPlaying(true); }, 100))}
          className={`px-4 py-2 rounded font-mono text-sm transition-all ${
            isPlaying
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/30'
          }`}
        >
          {isPlaying ? '⏹ 停止' : '▶ 开始'}
        </button>
      </div>

      {/* 三层架构图 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 font-mono">
          三层检测架构
        </h3>
        <div className="flex gap-4">
          {[
            { layer: 'tool' as DetectionLayer, name: 'Layer 1: 工具调用检测', desc: 'SHA256 hash, threshold=5', icon: '🔧' },
            { layer: 'content' as DetectionLayer, name: 'Layer 2: 内容重复检测', desc: '滑动窗口, chunk=50', icon: '📝' },
            { layer: 'llm' as DetectionLayer, name: 'Layer 3: LLM 智能检测', desc: '自适应间隔 5-15 turns', icon: '🧠' },
          ].map((item, i) => {
            const status = getLayerStatus(item.layer);
            return (
              <div
                key={item.layer}
                className="flex-1 p-4 rounded-lg border-2 transition-all"
                style={{
                  borderColor: getLayerColor(status),
                  backgroundColor: status === 'active' ? `${getLayerColor(status)}15` : 'transparent',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-mono font-bold" style={{ color: getLayerColor(status) }}>
                    {item.name}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted)]">{item.desc}</div>
                <div className="mt-2 text-xs font-mono" style={{ color: getLayerColor(status) }}>
                  {status === 'detected' ? '🚨 LOOP DETECTED' :
                   status === 'active' ? '⏳ Checking...' :
                   status === 'passed' ? '✓ Passed' : '○ Pending'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Layer 1: Tool Call Detection */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
              🔧 Tool Call Tracking
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {toolCalls.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  等待工具调用...
                </div>
              ) : (
                toolCalls.map((call, i) => (
                  <div
                    key={call.id}
                    className={`p-2 rounded border text-xs font-mono transition-all ${
                      i === toolCalls.length - 1 && activeLayer === 'tool'
                        ? 'bg-[var(--cyber-blue)]/20 border-[var(--cyber-blue)]'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-primary)]">{call.name}</span>
                      <span className="text-[var(--muted)]">{call.hash.slice(0, 8)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {consecutiveCount > 0 && (
              <div className="mt-3 p-2 rounded bg-[var(--amber)]/10 border border-[var(--amber)]/30">
                <div className="text-xs font-mono text-[var(--amber)]">
                  Consecutive: {consecutiveCount}/5
                </div>
                <div className="mt-1 h-2 bg-[var(--bg-tertiary)] rounded overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(consecutiveCount / 5) * 100}%`,
                      backgroundColor: consecutiveCount >= 5 ? '#ef4444' : 'var(--amber)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Layer 2: Content Detection */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-3 font-mono">
              📝 Content Chunk Analysis
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {contentChunks.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  等待内容流...
                </div>
              ) : (
                contentChunks.slice(-8).map((chunk) => (
                  <div
                    key={chunk.id}
                    className={`p-2 rounded border text-xs font-mono transition-all ${
                      chunk.occurrences.length >= 5
                        ? 'bg-red-500/10 border-red-500/30'
                        : chunk.occurrences.length >= 3
                        ? 'bg-[var(--amber)]/10 border-[var(--amber)]/30'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[var(--muted)]">{chunk.hash.slice(0, 8)}</span>
                      <span className={chunk.occurrences.length >= 5 ? 'text-red-400' : 'text-[var(--text-secondary)]'}>
                        ×{chunk.occurrences.length}
                      </span>
                    </div>
                    <div className="text-[var(--text-secondary)] truncate">
                      "{chunk.content}"
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 text-xs text-[var(--muted)]">
              Stream position: {streamPosition}/{SAMPLE_CONTENT.length}
            </div>
          </div>
        </div>

        {/* Layer 3: LLM Detection */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--terminal-green)] mb-3 font-mono">
              🧠 LLM Loop Detection
            </h3>

            {/* Turn Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--muted)]">Turn Progress</span>
                <span className="text-[var(--text-secondary)]">{currentTurn}/50</span>
              </div>
              <div className="h-2 bg-[var(--bg-tertiary)] rounded overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(currentTurn / 50) * 100}%`,
                    backgroundColor: currentTurn >= 30 ? 'var(--terminal-green)' : 'var(--muted)',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
                <span>0</span>
                <span className="text-[var(--amber)]">30 (LLM starts)</span>
                <span>50</span>
              </div>
            </div>

            {/* Check Interval */}
            <div className="mb-3 p-2 rounded bg-[var(--bg-tertiary)]">
              <div className="text-xs text-[var(--muted)]">Check Interval (adaptive)</div>
              <div className="text-lg font-mono font-bold text-[var(--cyber-blue)]">
                {checkInterval} turns
              </div>
              <div className="text-xs text-[var(--muted)]">
                Range: 5 (high conf) - 15 (low conf)
              </div>
            </div>

            {/* LLM Checks */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {llmChecks.map((check, i) => (
                <div
                  key={i}
                  className={`p-2 rounded border text-xs ${
                    check.isLoop
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono">Turn {check.turn}</span>
                    <span
                      className="font-bold"
                      style={{ color: check.confidence > 0.9 ? '#ef4444' : check.confidence > 0.5 ? 'var(--amber)' : 'var(--terminal-green)' }}
                    >
                      {(check.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
              {llmChecks.length === 0 && currentTurn < 30 && (
                <div className="text-center text-[var(--muted)] py-4 text-sm">
                  LLM 检测将在 Turn 30 开始
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 日志 */}
      <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">Detection Log</h3>
        <div className="space-y-1 text-xs font-mono h-32 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-[var(--muted)]">等待开始...</div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`${
                  log.includes('🚨') ? 'text-red-400' :
                  log.includes('✅') ? 'text-[var(--terminal-green)]' :
                  log.includes('⚠️') ? 'text-[var(--amber)]' :
                  log.includes('🧠') ? 'text-[var(--cyber-blue)]' :
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
          源码: loopDetectionService.ts
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`class LoopDetectionService {
  // Layer 1: Tool Call Loop Detection
  private checkToolCallLoop(toolCall): boolean {
    const key = createHash('sha256').update(\`\${name}:\${args}\`).digest('hex');
    if (this.lastToolCallKey === key) {
      this.toolCallRepetitionCount++;
    }
    return this.toolCallRepetitionCount >= 5; // TOOL_CALL_LOOP_THRESHOLD
  }

  // Layer 2: Content Chanting Detection (sliding window)
  private analyzeContentChunksForLoop(): boolean {
    // 50-char chunks, SHA256 hash, detect 10+ occurrences within 75 chars
    const avgDistance = totalDistance / (CONTENT_LOOP_THRESHOLD - 1);
    return avgDistance <= CONTENT_CHUNK_SIZE * 1.5;
  }

  // Layer 3: LLM-based Loop Detection (adaptive interval)
  private async checkForLoopWithLLM(signal): Promise<boolean> {
    // Runs after turn 30, interval adjusts based on confidence (5-15)
    if (result.confidence > 0.9) return true; // Loop detected
    this.llmCheckInterval = 5 + (15 - 5) * (1 - confidence);
  }
}`}
        </pre>
      </div>
    </div>
  );
}
