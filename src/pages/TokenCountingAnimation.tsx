import { useCallback, useMemo, useState } from 'react';
import { Layer } from '../components/Layer';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

/**
 * TokenCountingAnimation
 *
 * 对齐上游 gemini-cli 的“溢出预警”主线：
 * - tokenLimit(model) - packages/core/src/core/tokenLimits.ts
 * - calculateRequestTokenCount(request) - packages/core/src/utils/tokenCalculation.ts
 * - GeminiClient.processTurn(): remaining = tokenLimit - lastPromptTokenCount; if estimate > remaining * 0.95 => ContextWindowWillOverflow
 */

type Part =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> } }
  | { inlineData: { mimeType: string; data: string } };

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

function tokenLimit(model: string): number {
  switch (model) {
    case 'gemini-1.5-pro':
      return 2_097_152;
    case 'gemini-1.5-flash':
    case 'gemini-2.5-pro-preview-05-06':
    case 'gemini-2.5-pro-preview-06-05':
    case 'gemini-2.5-pro':
    case 'gemini-2.5-flash-preview-05-20':
    case 'gemini-2.5-flash':
    case 'gemini-2.5-flash-lite':
    case 'gemini-2.0-flash':
      return 1_048_576;
    case 'gemini-2.0-flash-preview-image-generation':
      return 32_000;
    default:
      return 1_048_576;
  }
}

function hasMedia(parts: Part[]): boolean {
  return parts.some((p) => 'inlineData' in p);
}

export function TokenCountingAnimation() {
  const [model, setModel] = useState('gemini-2.5-flash');
  const [sample, setSample] = useState<'text' | 'tool' | 'media'>('text');
  const [lastPromptTokenCount, setLastPromptTokenCount] = useState(820_000);
  const [simulateCountTokensApiFailure, setSimulateCountTokensApiFailure] = useState(false);

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [method, setMethod] = useState<'heuristic' | 'countTokens' | null>(null);
  const [estimatedRequestTokenCount, setEstimatedRequestTokenCount] = useState<number | null>(null);
  const [willOverflow, setWillOverflow] = useState<boolean | null>(null);

  const requestParts = useMemo<Part[]>(() => {
    if (sample === 'text') {
      return [
        { text: 'System: You are a helpful coding assistant.\n' },
        { text: '用户：请总结一下这个仓库的结构与关键模块。' },
      ];
    }
    if (sample === 'tool') {
      return [
        { text: 'Find all TypeScript files under src.' },
        { functionCall: { name: 'glob', args: { pattern: 'src/**/*.ts' } } },
      ];
    }
    return [
      { text: 'Describe this image.' },
      { inlineData: { mimeType: 'image/png', data: '<base64 omitted>' } },
    ];
  }, [sample]);

  const localEstimate = useMemo(() => estimateTokenCountSync(requestParts), [requestParts]);
  const media = useMemo(() => hasMedia(requestParts), [requestParts]);

  const modelLimit = useMemo(() => tokenLimit(model), [model]);
  const remainingTokenCount = useMemo(() => Math.max(0, modelLimit - lastPromptTokenCount), [modelLimit, lastPromptTokenCount]);
  const overflowThreshold = useMemo(() => Math.floor(remainingTokenCount * 0.95), [remainingTokenCount]);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setPhase(0);
    setMethod(null);
    setEstimatedRequestTokenCount(null);
    setWillOverflow(null);

    // 1) 预估本次 request token
    setPhase(1);
    await new Promise((r) => setTimeout(r, 450));

    let estimate: number;
    if (media) {
      setMethod('countTokens');
      setPhase(2);
      await new Promise((r) => setTimeout(r, 450));
      if (!simulateCountTokensApiFailure) {
        // 模拟 countTokens API 结果：媒体 token 本地很难精确预估
        estimate = 1_200;
      } else {
        setMethod('heuristic');
        estimate = localEstimate;
      }
    } else {
      setMethod('heuristic');
      estimate = localEstimate;
    }
    setEstimatedRequestTokenCount(estimate);

    // 2) 计算 remaining = tokenLimit - lastPromptTokenCount
    setPhase(3);
    await new Promise((r) => setTimeout(r, 450));

    // 3) 95% 阈值溢出预警
    setPhase(4);
    await new Promise((r) => setTimeout(r, 450));
    setWillOverflow(estimate > remainingTokenCount * 0.95);

    setRunning(false);
    setPhase(0);
  }, [localEstimate, media, remainingTokenCount, running, simulateCountTokensApiFailure]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-cyan-400">Token 计数与溢出预警（上游 gemini-cli）</h2>

      <Layer title="输入" icon="📥">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/20 border border-[var(--border-subtle)] rounded p-4">
            <div className="text-sm text-[var(--text-secondary)] mb-2">model</div>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black/30 border border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              <option value="gemini-1.5-pro">gemini-1.5-pro (2,097,152)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (1,048,576)</option>
              <option value="gemini-2.0-flash-preview-image-generation">gemini-2.0-flash-preview-image-generation (32,000)</option>
            </select>

            <div className="mt-4 text-sm text-[var(--text-secondary)] mb-2">sample request</div>
            <select
              value={sample}
              onChange={(e) => setSample(e.target.value as 'text' | 'tool' | 'media')}
              className="w-full px-3 py-2 rounded bg-black/30 border border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              <option value="text">Text-only</option>
              <option value="tool">Text + functionCall</option>
              <option value="media">Text + inlineData (media)</option>
            </select>

            <label className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={simulateCountTokensApiFailure}
                onChange={(e) => setSimulateCountTokensApiFailure(e.target.checked)}
                disabled={sample !== 'media'}
              />
              模拟 countTokens API 失败（fallback 启发式）
            </label>
          </div>

          <div className="bg-black/20 border border-[var(--border-subtle)] rounded p-4">
            <div className="text-sm text-[var(--text-secondary)] mb-2">lastPromptTokenCount（来自上一次 usageMetadata）</div>
            <input
              type="number"
              value={lastPromptTokenCount}
              min={0}
              max={modelLimit}
              onChange={(e) => setLastPromptTokenCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded bg-black/30 border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono"
            />
            <div className="mt-3 text-xs text-[var(--text-muted)]">
              remaining = tokenLimit({model}) - lastPromptTokenCount
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={run}
                disabled={running}
                className="px-4 py-2 rounded bg-[var(--cyber-blue)] text-black font-semibold disabled:opacity-50"
              >
                {running ? 'Running...' : 'Run'}
              </button>
              <button
                onClick={() => {
                  setPhase(0);
                  setMethod(null);
                  setEstimatedRequestTokenCount(null);
                  setWillOverflow(null);
                }}
                disabled={running}
                className="px-4 py-2 rounded bg-white/10 text-[var(--text-primary)] border border-[var(--border-subtle)] disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </Layer>

      <Layer title="请求内容（parts）" icon="🧩">
        <JsonBlock code={JSON.stringify(requestParts, null, 2)} />
        <div className="mt-3 text-xs text-[var(--text-muted)]">
          hasMedia = {String(media)}；本地启发式估算 = {localEstimate.toLocaleString()}
        </div>
      </Layer>

      <Layer title="动画过程" icon="🎞️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/20 border border-[var(--border-subtle)] rounded p-4">
            <div className="text-sm text-[var(--text-secondary)] mb-3">阶段</div>
            <div className="space-y-2">
              <div className={`rounded border p-3 ${phase === 1 ? 'border-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10' : 'border-[var(--border-subtle)]'}`}>
                1) calculateRequestTokenCount(request)
              </div>
              <div className={`rounded border p-3 ${phase === 2 ? 'border-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10' : 'border-[var(--border-subtle)]'}`}>
                2) hasMedia ? countTokens API : estimateTokenCountSync()
              </div>
              <div className={`rounded border p-3 ${phase === 3 ? 'border-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10' : 'border-[var(--border-subtle)]'}`}>
                3) remaining = tokenLimit(model) - lastPromptTokenCount
              </div>
              <div className={`rounded border p-3 ${phase === 4 ? 'border-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10' : 'border-[var(--border-subtle)]'}`}>
                4) if estimate &gt; remaining * 0.95 → ContextWindowWillOverflow
              </div>
            </div>
          </div>

          <div className="bg-black/20 border border-[var(--border-subtle)] rounded p-4">
            <div className="text-sm text-[var(--text-secondary)] mb-3">关键数值</div>
            <div className="space-y-3">
              <div className="rounded border border-[var(--border-subtle)] bg-black/30 p-3">
                <div className="text-xs text-[var(--text-muted)]">tokenLimit(model)</div>
                <div className="font-mono text-xl text-[var(--terminal-green)]">{modelLimit.toLocaleString()}</div>
              </div>
              <div className="rounded border border-[var(--border-subtle)] bg-black/30 p-3">
                <div className="text-xs text-[var(--text-muted)]">remainingTokenCount</div>
                <div className="font-mono text-xl text-[var(--terminal-green)]">{remainingTokenCount.toLocaleString()}</div>
              </div>
              <div className="rounded border border-[var(--border-subtle)] bg-black/30 p-3">
                <div className="text-xs text-[var(--text-muted)]">overflow threshold (95%)</div>
                <div className="font-mono text-xl text-[var(--terminal-green)]">{overflowThreshold.toLocaleString()}</div>
              </div>
              <div className="rounded border border-[var(--border-subtle)] bg-black/30 p-3">
                <div className="text-xs text-[var(--text-muted)]">estimatedRequestTokenCount</div>
                <div className="font-mono text-xl text-[var(--terminal-green)]">{estimatedRequestTokenCount === null ? '—' : estimatedRequestTokenCount.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">method = {method ?? '—'}</div>
              </div>
              <div className="rounded border border-[var(--border-subtle)] bg-black/30 p-3">
                <div className="text-xs text-[var(--text-muted)]">ContextWindowWillOverflow ?</div>
                <div className="font-mono text-xl text-[var(--terminal-green)]">
                  {willOverflow === null ? '—' : String(willOverflow)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      <Layer title="上游源码（节选）" icon="🧾">
        <CodeBlock
          title="packages/core/src/core/client.ts (ContextWindowWillOverflow)"
          code={`const estimatedRequestTokenCount = await calculateRequestTokenCount(request, contentGenerator, modelForLimitCheck);
const remainingTokenCount = tokenLimit(modelForLimitCheck) - chat.getLastPromptTokenCount();

if (estimatedRequestTokenCount > remainingTokenCount * 0.95) {
  yield { type: GeminiEventType.ContextWindowWillOverflow, value: { estimatedRequestTokenCount, remainingTokenCount } };
  return turn;
}`}
        />
      </Layer>
    </div>
  );
}
