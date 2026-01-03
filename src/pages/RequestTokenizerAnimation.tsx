import { useCallback, useMemo, useState } from 'react';
import { Layer } from '../components/Layer';
import { CodeBlock } from '../components/CodeBlock';

/**
 * RequestTokenizerAnimation
 *
 * 对齐上游 gemini-cli 的 token 预估实现：
 * - packages/core/src/utils/tokenCalculation.ts
 * - estimateTokenCountSync(): 文本 ASCII/CJK 启发式；非文本 part 走 JSON.length/4
 * - calculateRequestTokenCount(): 若包含媒体（inlineData/fileData）则优先 countTokens API，失败再 fallback 本地预估
 */

type Part =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { functionResponse: { id: string; name: string; response: Record<string, unknown> } }
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { mimeType: string; fileUri: string } };

const ASCII_TOKENS_PER_CHAR = 0.25;
const NON_ASCII_TOKENS_PER_CHAR = 1.3;

function estimateTokenCountSync(parts: Part[]): number {
  let total = 0;
  for (const part of parts) {
    if ('text' in part) {
      for (const char of part.text) {
        total += (char.codePointAt(0) ?? 0) <= 127 ? ASCII_TOKENS_PER_CHAR : NON_ASCII_TOKENS_PER_CHAR;
      }
      continue;
    }
    total += JSON.stringify(part).length / 4;
  }
  return Math.floor(total);
}

function hasMedia(parts: Part[]): boolean {
  return parts.some((p) => 'inlineData' in p || 'fileData' in p);
}

function formatPart(part: Part): string {
  if ('text' in part) return `text(${JSON.stringify(part.text)})`;
  if ('functionCall' in part) return `functionCall(${part.functionCall.name})`;
  if ('functionResponse' in part) return `functionResponse(${part.functionResponse.name})`;
  if ('inlineData' in part) return `inlineData(${part.inlineData.mimeType})`;
  return `fileData(${part.fileData.mimeType})`;
}

export function RequestTokenizerAnimation() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);
  const [selectedSample, setSelectedSample] = useState<'text' | 'tool' | 'media'>('text');
  const [simulateApiFailure, setSimulateApiFailure] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [method, setMethod] = useState<'heuristic' | 'countTokens' | null>(null);
  const [resultTokens, setResultTokens] = useState<number | null>(null);

  const samples = useMemo(() => {
    const textOnly: Part[] = [
      { text: 'Hello world!\n' },
      { text: '你好，世界。' },
    ];

    const withTool: Part[] = [
      { text: 'List TypeScript files under src.' },
      { functionCall: { name: 'glob', args: { pattern: 'src/**/*.ts' } } },
    ];

    const withMedia: Part[] = [
      { text: 'Describe this image and extract key details.' },
      { inlineData: { mimeType: 'image/png', data: '<base64 omitted>' } },
    ];

    return { text: textOnly, tool: withTool, media: withMedia };
  }, []);

  const parts = samples[selectedSample];

  const run = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStage(0);
    setMethod(null);
    setResultTokens(null);

    // Stage 1: normalize parts
    setStage(1);
    await new Promise((r) => setTimeout(r, 450));

    // Stage 2: detect media
    setStage(2);
    await new Promise((r) => setTimeout(r, 450));

    const media = hasMedia(parts);
    if (media) {
      // Stage 3: choose countTokens API (simulated)
      setMethod('countTokens');
      setStage(3);
      await new Promise((r) => setTimeout(r, 450));

      if (!simulateApiFailure) {
        // 模拟 countTokens API：媒体 token 很难本地准确估计
        setResultTokens(640);
      } else {
        // API 失败：fallback 本地启发式
        setMethod('heuristic');
        setResultTokens(estimateTokenCountSync(parts));
      }
    } else {
      setMethod('heuristic');
      setStage(3);
      await new Promise((r) => setTimeout(r, 450));
      setResultTokens(estimateTokenCountSync(parts));
    }

    setIsRunning(false);
    setStage(0);
  }, [isRunning, parts, simulateApiFailure]);

  const localEstimate = useMemo(() => estimateTokenCountSync(parts), [parts]);
  const mediaFlag = useMemo(() => hasMedia(parts), [parts]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="mb-2 bg-gradient-to-r from-[var(--amber)]/10 to-[var(--terminal-green)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        <button
          onClick={() => setIsIntroExpanded((v) => !v)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧮</span>
            <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
          </div>
          <span
            className={`transform transition-transform text-[var(--text-muted)] ${
              isIntroExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>

        {isIntroExpanded ? (
          <div className="px-6 pb-6 space-y-4">
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
              <h4 className="text-[var(--amber)] font-bold mb-2">🎯 上游为什么不用 tiktoken？</h4>
              <p className="text-[var(--text-secondary)] text-sm">
                上游 gemini-cli 不依赖 OpenAI 的 tokenizer。它用 ASCII/CJK 启发式对文本做 token 预估；遇到媒体（图片/文件）时优先调用{' '}
                <code>countTokens</code> API，失败再回退本地预估。
              </p>
            </div>
            <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
              <h4 className="text-[var(--terminal-green)] font-bold mb-2">🔗 源码位置</h4>
              <p className="text-[var(--text-secondary)] text-sm">
                <code>packages/core/src/utils/tokenCalculation.ts</code>（estimateTokenCountSync / calculateRequestTokenCount）
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <Layer title="输入样例" icon="📥">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <label className="text-sm text-[var(--text-secondary)]">
            sample
            <select
              value={selectedSample}
              onChange={(e) => setSelectedSample(e.target.value as 'text' | 'tool' | 'media')}
              className="mt-2 w-full md:w-[320px] px-3 py-2 rounded bg-black/30 border border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              <option value="text">Text-only（ASCII + 中文）</option>
              <option value="tool">Text + functionCall（非文本 part）</option>
              <option value="media">Text + inlineData（媒体）</option>
            </select>
          </label>

          <label className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mt-4 md:mt-7">
            <input
              type="checkbox"
              checked={simulateApiFailure}
              onChange={(e) => setSimulateApiFailure(e.target.checked)}
              disabled={selectedSample !== 'media'}
            />
            模拟 countTokens API 失败（fallback 到启发式）
          </label>

          <div className="flex gap-2 md:ml-auto mt-2 md:mt-7">
            <button
              onClick={run}
              disabled={isRunning}
              className="px-4 py-2 rounded bg-[var(--cyber-blue)] text-black font-semibold disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={() => {
                setStage(0);
                setMethod(null);
                setResultTokens(null);
              }}
              disabled={isRunning}
              className="px-4 py-2 rounded bg-white/10 text-[var(--text-primary)] border border-[var(--border-subtle)] disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 bg-black/20 border border-[var(--border-subtle)] rounded p-3">
          <div className="text-xs text-[var(--text-muted)] mb-2">parts</div>
          <div className="font-mono text-sm text-[var(--text-primary)] space-y-1">
            {parts.map((p, i) => (
              <div key={i}>
                <span className="text-[var(--text-muted)]">{String(i).padStart(2, '0')} </span>
                {formatPart(p)}
              </div>
            ))}
          </div>
        </div>
      </Layer>

      <Layer title="过程动画" icon="🎞️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/20 border border-[var(--border-subtle)] rounded p-4">
            <div className="text-sm text-[var(--text-secondary)] mb-3">阶段</div>
            <div className="space-y-2">
              <div className={`rounded border p-3 ${stage === 1 ? 'border-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10' : 'border-[var(--border-subtle)]'}`}>
                <div className="font-mono text-sm">1) parts → Part[]（统一结构）</div>
              </div>
              <div className={`rounded border p-3 ${stage === 2 ? 'border-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10' : 'border-[var(--border-subtle)]'}`}>
                <div className="font-mono text-sm">2) hasMedia = inlineData/fileData ?</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">hasMedia = {String(mediaFlag)}</div>
              </div>
              <div className={`rounded border p-3 ${stage === 3 ? 'border-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10' : 'border-[var(--border-subtle)]'}`}>
                <div className="font-mono text-sm">3) 选择策略并计算 token</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  method = <span className="font-mono text-[var(--text-primary)]">{method ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 border border-[var(--border-subtle)] rounded p-4">
            <div className="text-sm text-[var(--text-secondary)] mb-3">输出</div>
            <div className="rounded border border-[var(--border-subtle)] bg-black/30 p-4">
              <div className="text-xs text-[var(--text-muted)]">local heuristic estimate</div>
              <div className="font-mono text-xl text-[var(--terminal-green)]">{localEstimate.toLocaleString()}</div>

              <div className="mt-4 text-xs text-[var(--text-muted)]">animation result</div>
              <div className="font-mono text-2xl text-[var(--terminal-green)]">
                {resultTokens === null ? '—' : resultTokens.toLocaleString()}
              </div>
            </div>

            <div className="mt-4 text-sm text-[var(--text-secondary)]">
              这一步是“预估”。真实 token 使用量会在响应里的 <code>usageMetadata</code> 中返回，并被写入 <code>lastPromptTokenCount</code> 用于后续策略判断。
            </div>
          </div>
        </div>
      </Layer>

      <Layer title="核心源码（节选）" icon="🧾">
        <CodeBlock
          title="packages/core/src/utils/tokenCalculation.ts"
          code={`const ASCII_TOKENS_PER_CHAR = 0.25;
const NON_ASCII_TOKENS_PER_CHAR = 1.3;

export function estimateTokenCountSync(parts: Part[]): number {
  let totalTokens = 0;
  for (const part of parts) {
    if (typeof part.text === 'string') {
      for (const char of part.text) {
        totalTokens += char.codePointAt(0)! <= 127 ? ASCII_TOKENS_PER_CHAR : NON_ASCII_TOKENS_PER_CHAR;
      }
    } else {
      totalTokens += JSON.stringify(part).length / 4;
    }
  }
  return Math.floor(totalTokens);
}

export async function calculateRequestTokenCount(request, contentGenerator, model) {
  // hasMedia => countTokens API; catch => fallback heuristic
}`}
        />
      </Layer>
    </div>
  );
}
