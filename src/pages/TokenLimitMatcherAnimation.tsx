import { useCallback, useMemo, useState } from 'react';

/**
 * TokenLimitMatcherAnimation
 *
 * 对齐上游 gemini-cli 的 tokenLimit(model)：
 * - packages/core/src/core/tokenLimits.ts
 * - 仅返回“上下文窗口 token limit”（无 output limit / 无 PATTERNS / 无 normalize）
 */

function sleep(ms: number) {
 return new Promise((resolve) => setTimeout(resolve, ms));
}

type MatchStep = 0 | 1 | 2 | 3 | 4;

const DEFAULT_TOKEN_LIMIT = 1_048_576;

const ONE_M_MODELS = [
 'gemini-1.5-flash',
 'gemini-2.5-pro-preview-05-06',
 'gemini-2.5-pro-preview-06-05',
 'gemini-2.5-pro',
 'gemini-2.5-flash-preview-05-20',
 'gemini-2.5-flash',
 'gemini-2.5-flash-lite',
 'gemini-2.0-flash',
];

export default function TokenLimitMatcherAnimation() {
 const [isIntroExpanded, setIsIntroExpanded] = useState(true);
 const [model, setModel] = useState('gemini-2.5-flash');
 const [step, setStep] = useState<MatchStep>(0);
 const [matched, setMatched] = useState<{ limit: number; matchedCase: string } | null>(null);
 const [isRunning, setIsRunning] = useState(false);

 const knownGroups = useMemo(
 () => [
 { title: "case 'gemini-1.5-pro'", limit: 2_097_152, models: ['gemini-1.5-pro'] },
 { title: 'case (1M group)', limit: 1_048_576, models: ONE_M_MODELS },
 {
 title: "case 'gemini-2.0-flash-preview-image-generation'",
 limit: 32_000,
 models: ['gemini-2.0-flash-preview-image-generation'],
 },
 { title: 'default', limit: DEFAULT_TOKEN_LIMIT, models: [] },
 ],
 [],
 );

 const run = useCallback(async () => {
 if (isRunning) return;
 setIsRunning(true);
 setMatched(null);
 setStep(0);

 // Step 1: exact match gemini-1.5-pro
 setStep(1);
 await sleep(450);
 if (model === 'gemini-1.5-pro') {
 setMatched({ limit: 2_097_152, matchedCase: model });
 setStep(0);
 setIsRunning(false);
 return;
 }

 // Step 2: 1M group
 setStep(2);
 await sleep(450);
 if (ONE_M_MODELS.includes(model)) {
 setMatched({ limit: 1_048_576, matchedCase: model });
 setStep(0);
 setIsRunning(false);
 return;
 }

 // Step 3: image-generation preview
 setStep(3);
 await sleep(450);
 if (model === 'gemini-2.0-flash-preview-image-generation') {
 setMatched({ limit: 32_000, matchedCase: model });
 setStep(0);
 setIsRunning(false);
 return;
 }

 // Step 4: default
 setStep(4);
 await sleep(450);
 setMatched({ limit: DEFAULT_TOKEN_LIMIT, matchedCase: 'default' });
 setStep(0);
 setIsRunning(false);
 }, [isRunning, model]);

 return (
 <div className="space-y-8 animate-fadeIn">
 {/* Intro */}
 <div className="mb-2 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={() => setIsIntroExpanded((v) => !v)}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">📊</span>
 <span className="text-xl font-bold text-heading">核心概念介绍</span>
 </div>
 <span
 className={`transform transition-transform text-dim ${
 isIntroExpanded ? 'rotate-180' : ''
 }`}
 >
 ▼
 </span>
 </button>

 {isIntroExpanded ? (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🎯 tokenLimit(model) 是什么？</h4>
 <p className="text-body text-sm">
 上游 gemini-cli 用 <code>tokenLimit(model)</code> 返回“上下文窗口 token 上限”。它是一个简单的{' '}
 <code>switch-case</code> 映射：已知模型返回固定值；未知模型走默认值{' '}
 <code>{DEFAULT_TOKEN_LIMIT.toLocaleString()}</code>。
 </p>
 </div>
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🔗 它会被用在什么地方？</h4>
 <p className="text-body text-sm">
 它会配合 token 预估（<code>tokenCalculation.ts</code>）决定是否触发{' '}
 <code>ContextWindowWillOverflow</code> 预警（例如 95% 阈值），提醒即将触顶需要压缩/截断上下文。
 </p>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">📍 源码:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/core/tokenLimits.ts
 </code>
 </div>
 </div>
 ) : null}
 </div>

 {/* Controls */}
 <div className="bg-surface rounded-lg border border-edge p-4">
 <div className="flex flex-col md:flex-row gap-3 md:items-center">
 <label className="text-sm text-body">
 model
 <input
 value={model}
 onChange={(e) => setModel(e.target.value)}
 className="mt-2 w-full md:w-[520px] px-3 py-2 rounded bg-base/30 border border-edge text-heading font-mono text-sm"
 placeholder="e.g. gemini-2.5-flash"
 spellCheck={false}
 />
 </label>

 <div className="flex gap-2">
 <button
 onClick={run}
 disabled={isRunning}
 className="px-4 py-2 rounded bg-elevated text-heading font-semibold disabled:opacity-50"
 >
 {isRunning ? 'Matching...' : 'Run'}
 </button>
 <button
 onClick={() => {
 setMatched(null);
 setStep(0);
 }}
 disabled={isRunning}
 className="px-4 py-2 rounded bg-elevated/10 text-heading border border-edge disabled:opacity-50"
 >
 Reset
 </button>
 </div>
 </div>

 <div className="mt-4 text-xs text-dim">
 试试：<code>gemini-1.5-pro</code> / <code>gemini-2.5-flash</code> /{' '}
 <code>gemini-2.0-flash-preview-image-generation</code> / <code>unknown-model</code>
 </div>
 </div>

 {/* Visualization */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface rounded-lg border border-edge p-4">
 <h3 className="text-lg font-bold text-heading mb-3">switch-case 匹配过程</h3>
 <div className="space-y-3">
 {knownGroups.map((g, idx) => {
 const active =
 (idx === 0 && step === 1) ||
 (idx === 1 && step === 2) ||
 (idx === 2 && step === 3) ||
 (idx === 3 && step === 4);
 const matchedCase = matched?.matchedCase;
 const isHit =
 matchedCase !== null &&
 matchedCase !== undefined &&
 matchedCase !== 'default' &&
 g.models.includes(matchedCase);
 const isDefaultHit = g.title === 'default' && matchedCase === 'default';

 return (
 <div
 key={g.title}
 className={`rounded border p-3 ${
 active ? ' border-edge bg-elevated/10' : ' border-edge bg-base/20'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="font-mono text-sm text-heading">{g.title}</div>
 <div className="text-xs text-dim">
 → <span className="text-heading font-mono">{g.limit.toLocaleString()}</span>
 </div>
 </div>
 {g.models.length > 0 ? (
 <div className="mt-2 text-xs text-dim font-mono">
 {g.models.slice(0, 4).join(' | ')}
 {g.models.length > 4 ? ` | ... (+${g.models.length - 4})` : ''}
 </div>
 ) : (
 <div className="mt-2 text-xs text-dim">（未匹配任何 case 时走 default）</div>
 )}

 {isHit || isDefaultHit ? (
 <div className="mt-2 text-xs text-heading font-semibold">MATCHED</div>
 ) : null}
 </div>
 );
 })}
 </div>
 </div>

 <div className="bg-surface rounded-lg border border-edge p-4">
 <h3 className="text-lg font-bold text-heading mb-3">结果</h3>

 <div className="rounded-lg border border-edge bg-base/20 p-4">
 <div className="text-xs text-dim mb-1">model</div>
 <div className="font-mono text-sm text-heading break-all">{model}</div>

 <div className="mt-4 text-xs text-dim mb-1">token limit</div>
 <div className="font-mono text-2xl text-heading">
 {matched ? matched.limit.toLocaleString() : '—'}
 </div>

 <div className="mt-2 text-xs text-dim">
 matched case: <span className="font-mono text-heading">{matched?.matchedCase ?? '—'}</span>
 </div>
 </div>

 <div className="mt-4 text-sm text-body">
 上游的 tokenLimit 只负责“上下文窗口上限”。是否溢出预警/如何压缩上下文，属于 <code>GeminiClient.processTurn()</code> 的策略层。
 </div>
 </div>
 </div>
 </div>
 );
}
