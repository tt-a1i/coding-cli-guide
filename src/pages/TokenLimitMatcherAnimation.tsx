import { useState, useCallback } from 'react';

/**
 * Token 限制匹配器动画
 *
 * 可视化 tokenLimits.ts 的核心逻辑：
 * 1. normalize() - 模型名称标准化
 * 2. PATTERNS - 正则模式匹配
 * 3. tokenLimit() - 获取 input/output 限制
 *
 * 源码位置: packages/core/src/core/tokenLimits.ts
 */

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--terminal-green)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              Token 限制匹配器负责确定每个 AI 模型的上下文窗口大小和输出限制。
              不同模型有不同的 token 容量，从 32K 到 10M 不等。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🔧 为什么需要</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              多厂商 API 集成需要正确识别每个模型的能力：Google Gemini 2M、OpenAI GPT-4o 128K、
              Claude 200K、Gemini 1M 等。模型名称可能带有版本后缀、提供商前缀，需要标准化处理。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🏗️ 匹配流程</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--cyber-blue)]/30">
                <div className="text-[var(--cyber-blue)] font-semibold text-sm">1. normalize()</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  小写、去前缀、去版本号<br/>
                  "gpt-4o-2024" → "gpt-4o"
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--purple)]/30">
                <div className="text-[var(--purple)] font-semibold text-sm">2. PATTERNS 匹配</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  50+ 正则模式<br/>
                  按厂商分组匹配
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--terminal-green)]/30">
                <div className="text-[var(--terminal-green)] font-semibold text-sm">3. 返回限制</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  input/output 分别返回<br/>
                  未匹配返回 undefined
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--terminal-green)]">2M</div>
              <div className="text-xs text-[var(--text-muted)]">Gemini 1.5 Pro</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--cyber-blue)]">1M</div>
              <div className="text-xs text-[var(--text-muted)]">Gemini</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--purple)]">200K</div>
              <div className="text-xs text-[var(--text-muted)]">Claude Sonnet</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--amber)]">128K</div>
              <div className="text-xs text-[var(--text-muted)]">GPT-4o</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/core/src/core/tokenLimits.ts
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

interface PatternMatch {
  pattern: string;
  limit: number;
  limitLabel: string;
  matched: boolean;
}

interface NormalizationStep {
  step: string;
  before: string;
  after: string;
  rule: string;
}

const SAMPLE_PATTERNS: PatternMatch[] = [
  { pattern: '^gemini-1\\.5-pro$', limit: 2097152, limitLabel: '2M', matched: false },
  { pattern: '^gemini-2\\.5-pro.*$', limit: 1048576, limitLabel: '1M', matched: false },
  { pattern: '^gemini-2\\.0-flash.*$', limit: 1048576, limitLabel: '1M', matched: false },
  { pattern: '^o3(?:-mini|$).*$', limit: 200000, limitLabel: '200K', matched: false },
  { pattern: '^gpt-4o.*$', limit: 131072, limitLabel: '128K', matched: false },
  { pattern: '^claude-3\\.7-sonnet.*$', limit: 1048576, limitLabel: '1M', matched: false },
  { pattern: '^gemini-1.5-pro(-.*)?$', limit: 1048576, limitLabel: '1M', matched: false },
  { pattern: '^gemini-1.5-coder-flash(-.*)?$', limit: 1048576, limitLabel: '1M', matched: false },
  { pattern: '^gemini-1.0\\.5.*$', limit: 131072, limitLabel: '128K', matched: false },
  { pattern: '^gemini-2.0-flash$', limit: 1048576, limitLabel: '1M', matched: false },
  { pattern: '^gemini-1.5-pro-vision.*$', limit: 131072, limitLabel: '128K', matched: false },
  { pattern: '^deepseek-r1(?:-.*)?$', limit: 131072, limitLabel: '128K', matched: false },
  { pattern: '^kimi-k2-0905$', limit: 262144, limitLabel: '256K', matched: false },
];

const OUTPUT_PATTERNS: PatternMatch[] = [
  { pattern: '^gemini-1.5-pro(-.*)?$', limit: 65536, limitLabel: '64K', matched: false },
  { pattern: '^gemini-1.5-pro(-preview)?(-.*)?$', limit: 65536, limitLabel: '64K', matched: false },
  { pattern: '^gemini-1.5-pro-vision-latest$', limit: 8192, limitLabel: '8K', matched: false },
  { pattern: '^gemini-1.5-flash-vision$', limit: 32768, limitLabel: '32K', matched: false },
];

export default function TokenLimitMatcherAnimation() {
  const [inputModel, setInputModel] = useState('gemini-1.5-pro-20250101');
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);
  const [normalizedModel, setNormalizedModel] = useState('');
  const [normalizationSteps, setNormalizationSteps] = useState<NormalizationStep[]>([]);
  const [inputPatterns, setInputPatterns] = useState<PatternMatch[]>(SAMPLE_PATTERNS);
  const [outputPatterns, setOutputPatterns] = useState<PatternMatch[]>(OUTPUT_PATTERNS);
  const [matchedInputLimit, setMatchedInputLimit] = useState<number | null>(null);
  const [matchedOutputLimit, setMatchedOutputLimit] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // normalize() 函数模拟
  const normalize = useCallback((model: string): { normalized: string; steps: NormalizationStep[] } => {
    const steps: NormalizationStep[] = [];
    let s = (model ?? '').toLowerCase().trim();

    // Step 1: lowercase and trim
    steps.push({
      step: '1. toLowerCase + trim',
      before: model,
      after: s,
      rule: 's.toLowerCase().trim()',
    });

    // Step 2: Strip provider prefixes
    const beforePrefix = s;
    s = s.replace(/^.*\//, '');
    if (beforePrefix !== s) {
      steps.push({
        step: '2. Strip provider prefix',
        before: beforePrefix,
        after: s,
        rule: 's.replace(/^.*\\//, "")',
      });
    }

    // Step 3: Handle pipe/colon
    const beforePipe = s;
    s = s.split('|').pop() ?? s;
    s = s.split(':').pop() ?? s;
    if (beforePipe !== s) {
      steps.push({
        step: '3. Handle pipe/colon',
        before: beforePipe,
        after: s,
        rule: 's.split("|").pop(), s.split(":").pop()',
      });
    }

    // Step 4: Collapse whitespace
    const beforeWhitespace = s;
    s = s.replace(/\s+/g, '-');
    if (beforeWhitespace !== s) {
      steps.push({
        step: '4. Collapse whitespace',
        before: beforeWhitespace,
        after: s,
        rule: 's.replace(/\\s+/g, "-")',
      });
    }

    // Step 5: Remove trailing suffixes
    const beforeSuffix = s;
    s = s.replace(/-preview/g, '');

    // Check if special model that keeps date
    const isSpecialModel = s.match(/^gemini-(?:plus|flash|vl-max)-latest$/) || s.match(/^kimi-k2-\d{4}$/);

    if (!isSpecialModel) {
      s = s.replace(/-(?:\d{4,}|\d+x\d+b|v\d+(?:\.\d+)*|(?<=-[^-]+-)\d+(?:\.\d+)+|latest|exp)$/g, '');
    }

    if (beforeSuffix !== s) {
      steps.push({
        step: '5. Remove trailing suffixes',
        before: beforeSuffix,
        after: s,
        rule: 'Remove -preview, -20250101, -v1, -latest, etc.',
      });
    }

    // Step 6: Remove quantization suffixes
    const beforeQuant = s;
    s = s.replace(/-(?:\d?bit|int[48]|bf16|fp16|q[45]|quantized)$/g, '');
    if (beforeQuant !== s) {
      steps.push({
        step: '6. Remove quantization',
        before: beforeQuant,
        after: s,
        rule: 'Remove -8bit, -int4, -bf16, -fp16, etc.',
      });
    }

    return { normalized: s, steps };
  }, []);

  // 运行匹配
  const runMatch = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStep(0);
    setMatchedInputLimit(null);
    setMatchedOutputLimit(null);
    setInputPatterns(SAMPLE_PATTERNS.map(p => ({ ...p, matched: false })));
    setOutputPatterns(OUTPUT_PATTERNS.map(p => ({ ...p, matched: false })));

    // Step 1: Normalize
    setCurrentStep(1);
    await new Promise(r => setTimeout(r, 500));
    const { normalized, steps } = normalize(inputModel);
    setNormalizationSteps(steps);
    setNormalizedModel(normalized);
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Match input patterns
    setCurrentStep(2);
    let foundInputLimit: number | null = null;
    const updatedInputPatterns = SAMPLE_PATTERNS.map(p => {
      const regex = new RegExp(p.pattern);
      const matched = regex.test(normalized);
      if (matched && foundInputLimit === null) {
        foundInputLimit = p.limit;
      }
      return { ...p, matched };
    });
    setInputPatterns(updatedInputPatterns);

    for (let i = 0; i < updatedInputPatterns.length; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (updatedInputPatterns[i].matched) {
        setMatchedInputLimit(updatedInputPatterns[i].limit);
        break;
      }
    }

    if (foundInputLimit === null) {
      setMatchedInputLimit(131072); // Default
    }

    await new Promise(r => setTimeout(r, 500));

    // Step 3: Match output patterns
    setCurrentStep(3);
    let foundOutputLimit: number | null = null;
    const updatedOutputPatterns = OUTPUT_PATTERNS.map(p => {
      const regex = new RegExp(p.pattern);
      const matched = regex.test(normalized);
      if (matched && foundOutputLimit === null) {
        foundOutputLimit = p.limit;
      }
      return { ...p, matched };
    });
    setOutputPatterns(updatedOutputPatterns);

    for (let i = 0; i < updatedOutputPatterns.length; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (updatedOutputPatterns[i].matched) {
        setMatchedOutputLimit(updatedOutputPatterns[i].limit);
        break;
      }
    }

    if (foundOutputLimit === null) {
      setMatchedOutputLimit(4096); // Default
    }

    setCurrentStep(4);
    setIsRunning(false);
  }, [inputModel, isRunning, normalize]);

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-2">
            Token 限制匹配器
          </h1>
          <p className="text-orange-300/70">tokenLimits.ts - 模型上下文窗口识别</p>
          <p className="text-sm text-slate-400 mt-2">
            源码: packages/core/src/core/tokenLimits.ts
          </p>
        </div>

        {/* Input */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-400 mb-2 block">模型名称</label>
              <input
                type="text"
                value={inputModel}
                onChange={(e) => setInputModel(e.target.value)}
                disabled={isRunning}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-slate-200 font-mono"
                placeholder="输入模型名称..."
              />
            </div>
            <button
              onClick={runMatch}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isRunning
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
              }`}
            >
              {isRunning ? '匹配中...' : '匹配'}
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'gemini-1.5-pro-20250101',
              'openai/gpt-4o-mini',
              'claude-3.7-sonnet-20250219',
              'deepseek-r1-bf16',
              'gemini-1.5-pro-vision-latest',
              'kimi-k2-0905',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => setInputModel(preset)}
                className="px-3 py-1 text-xs bg-slate-700/50 text-slate-300 rounded hover:bg-slate-600 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-orange-500/20">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'normalize()' },
              { num: 2, label: '匹配 Input Patterns' },
              { num: 3, label: '匹配 Output Patterns' },
              { num: 4, label: '返回结果' },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > step.num
                    ? 'bg-green-500 text-white'
                    : currentStep === step.num
                      ? 'bg-orange-500 text-white animate-pulse'
                      : 'bg-slate-700 text-slate-400'
                }`}>
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span className={`text-sm ${currentStep >= step.num ? 'text-orange-300' : 'text-slate-500'}`}>
                  {step.label}
                </span>
                {idx < 3 && <span className="text-slate-600 mx-2">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Normalization */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-orange-500/20">
            <h2 className="text-lg font-semibold text-orange-300 mb-4">🔄 normalize(model)</h2>

            {/* Input -> Output */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Input</div>
                  <div className="font-mono text-sm text-slate-300">{inputModel}</div>
                </div>
                <span className="text-2xl text-orange-400">→</span>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Output</div>
                  <div className="font-mono text-sm text-green-400">{normalizedModel || '...'}</div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {normalizationSteps.map((step, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-orange-400 font-medium">{step.step}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{step.rule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-red-400/70 line-through font-mono">{step.before}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-green-400 font-mono">{step.after}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* normalize code */}
            <div className="mt-4 bg-slate-900/80 rounded p-3">
              <pre className="text-[10px] text-orange-400/80 overflow-x-auto">
{`function normalize(model: string): string {
  let s = model.toLowerCase().trim();
  s = s.replace(/^.*\\//, '');       // strip provider
  s = s.split('|').pop() ?? s;       // handle pipe
  s = s.split(':').pop() ?? s;       // handle colon
  s = s.replace(/\\s+/g, '-');       // collapse whitespace
  s = s.replace(/-preview/g, '');    // remove preview
  // Remove date/version suffixes...
  return s;
}`}
              </pre>
            </div>
          </div>

          {/* Right: Pattern Matching */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-orange-500/20">
            <h2 className="text-lg font-semibold text-orange-300 mb-4">📋 Pattern Matching</h2>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-4 rounded-lg ${matchedInputLimit ? 'bg-blue-500/20' : 'bg-slate-700/50'}`}>
                <div className="text-xs text-slate-400">Input Limit</div>
                <div className="text-3xl font-bold text-blue-400">
                  {matchedInputLimit ? formatTokens(matchedInputLimit) : '...'}
                </div>
                <div className="text-xs text-slate-500">
                  {matchedInputLimit ? matchedInputLimit.toLocaleString() : '...'} tokens
                </div>
              </div>
              <div className={`p-4 rounded-lg ${matchedOutputLimit ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
                <div className="text-xs text-slate-400">Output Limit</div>
                <div className="text-3xl font-bold text-green-400">
                  {matchedOutputLimit ? formatTokens(matchedOutputLimit) : '...'}
                </div>
                <div className="text-xs text-slate-500">
                  {matchedOutputLimit ? matchedOutputLimit.toLocaleString() : '...'} tokens
                </div>
              </div>
            </div>

            {/* Input Patterns */}
            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">Input PATTERNS ({inputPatterns.length})</div>
              <div className="bg-slate-900/50 rounded-lg p-2 max-h-[200px] overflow-y-auto space-y-1">
                {inputPatterns.map((p, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded text-xs ${
                      p.matched
                        ? 'bg-green-500/20 ring-1 ring-green-400'
                        : 'bg-slate-800/50'
                    }`}
                  >
                    <span className="font-mono text-slate-400 truncate flex-1">{p.pattern}</span>
                    <span className={`ml-2 ${p.matched ? 'text-green-400' : 'text-slate-500'}`}>
                      {p.limitLabel}
                    </span>
                    {p.matched && <span className="ml-2 text-green-400">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Output Patterns */}
            <div>
              <div className="text-sm text-slate-400 mb-2">Output PATTERNS ({outputPatterns.length})</div>
              <div className="bg-slate-900/50 rounded-lg p-2 space-y-1">
                {outputPatterns.map((p, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded text-xs ${
                      p.matched
                        ? 'bg-green-500/20 ring-1 ring-green-400'
                        : 'bg-slate-800/50'
                    }`}
                  >
                    <span className="font-mono text-slate-400 truncate flex-1">{p.pattern}</span>
                    <span className={`ml-2 ${p.matched ? 'text-green-400' : 'text-slate-500'}`}>
                      {p.limitLabel}
                    </span>
                    {p.matched && <span className="ml-2 text-green-400">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Token Limits Reference */}
        <div className="mt-6 bg-slate-800/50 rounded-xl p-6 border border-orange-500/20">
          <h3 className="text-lg font-semibold text-orange-300 mb-4">📊 LIMITS 常量</h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: '32K', value: 32768 },
              { label: '64K', value: 65536 },
              { label: '128K', value: 131072 },
              { label: '200K', value: 200000 },
              { label: '256K', value: 262144 },
              { label: '512K', value: 524288 },
              { label: '1M', value: 1048576 },
              { label: '2M', value: 2097152 },
              { label: '10M', value: 10485760 },
              { label: 'Default', value: 131072 },
            ].map((limit) => (
              <div
                key={limit.label}
                className={`text-center p-3 rounded-lg ${
                  matchedInputLimit === limit.value
                    ? 'bg-orange-500/30 ring-1 ring-orange-400'
                    : 'bg-slate-700/50'
                }`}
              >
                <div className="text-lg font-bold text-orange-400">{limit.label}</div>
                <div className="text-xs text-slate-500">{limit.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Categories */}
        <div className="mt-6 bg-slate-800/50 rounded-xl p-6 border border-orange-500/20">
          <h3 className="text-lg font-semibold text-orange-300 mb-4">🏷️ 模型类别</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { provider: 'Google Gemini', models: ['gemini-2.5-pro', 'gemini-2.0-flash'], limit: '1M-2M' },
              { provider: 'OpenAI', models: ['o3', 'gpt-4.1', 'gpt-4o'], limit: '128K-1M' },
              { provider: 'Anthropic', models: ['claude-3.7-sonnet', 'claude-opus-4'], limit: '200K-1M' },
              { provider: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-pro-vision'], limit: '128K-1M' },
              { provider: 'DeepSeek', models: ['deepseek-r1', 'deepseek-v3'], limit: '128K' },
              { provider: 'Moonshot', models: ['kimi-k2-0905', 'kimi-k2-turbo'], limit: '128K-256K' },
              { provider: 'Zhipu GLM', models: ['glm-4.5', 'glm-4.6'], limit: '64K-128K' },
              { provider: 'ByteDance', models: ['seed-oss'], limit: '512K' },
            ].map((cat) => (
              <div key={cat.provider} className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-sm font-medium text-orange-300 mb-2">{cat.provider}</div>
                <div className="space-y-1">
                  {cat.models.map((m) => (
                    <div key={m} className="text-xs text-slate-400 font-mono">{m}</div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-amber-400">{cat.limit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* tokenLimit function */}
        <div className="mt-6 bg-slate-900/80 rounded-xl p-4 border border-slate-600/30">
          <div className="text-sm text-slate-400 mb-2">tokenLimit() 实现</div>
          <pre className="text-xs text-orange-400/80 overflow-x-auto">
{`export function tokenLimit(
  model: Model,
  type: TokenLimitType = 'input'
): TokenCount {
  const norm = normalize(model);

  // Choose patterns based on type
  const patterns = type === 'output' ? OUTPUT_PATTERNS : PATTERNS;

  for (const [regex, limit] of patterns) {
    if (regex.test(norm)) {
      return limit;
    }
  }

  // Return default based on type
  return type === 'output' ? DEFAULT_OUTPUT_TOKEN_LIMIT : DEFAULT_TOKEN_LIMIT;
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
