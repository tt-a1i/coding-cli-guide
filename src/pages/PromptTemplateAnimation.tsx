// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * Prompt 模板引擎动画
 *
 * 可视化 gemini-cli 的系统提示词构建流程
 * 源码: packages/core/src/core/prompts.ts
 *
 * 核心函数:
 * - getCoreSystemPrompt() - 主入口
 * - resolvePathFromEnv() - 环境变量解析
 * - getToolCallExamples() - 模型特定示例
 * - getSubagentSystemReminder() - 子代理提醒
 */

// 构建阶段定义
type BuildPhase =
  | 'idle'
  | 'env-resolve'      // 环境变量解析
  | 'base-template'    // 基础模板加载
  | 'dynamic-inject'   // 动态节注入
  | 'model-examples'   // 模型示例选择
  | 'memory-append'    // 用户记忆追加
  | 'final-assembly';  // 最终组装

interface PromptSection {
  id: string;
  name: string;
  category: 'core' | 'dynamic' | 'model' | 'memory';
  content: string;
  tokens: number;
  active: boolean;
  injected: boolean;
}

interface EnvResolution {
  envVar: string;
  value: string | null;
  isSwitch: boolean;
  isDisabled: boolean;
  resolved: boolean;
}

const INITIAL_SECTIONS: PromptSection[] = [
  { id: 'core-mandates', name: 'Core Mandates', category: 'core', content: 'IMPORTANT: Assist with authorized security testing...', tokens: 245, active: false, injected: false },
  { id: 'task-management', name: 'Task Management', category: 'core', content: 'You have access to TodoWrite tools...', tokens: 189, active: false, injected: false },
  { id: 'workflows', name: 'Workflows', category: 'core', content: 'The user will primarily request software engineering tasks...', tokens: 312, active: false, injected: false },
  { id: 'tool-policy', name: 'Tool Usage Policy', category: 'core', content: 'When doing file search, prefer Task tool...', tokens: 267, active: false, injected: false },
  { id: 'sandbox', name: 'Sandbox Section', category: 'dynamic', content: '# macOS Seatbelt Sandbox\nYou are running inside a restricted...', tokens: 156, active: false, injected: false },
  { id: 'git-repo', name: 'Git Repository', category: 'dynamic', content: 'gitStatus: Current branch: main\nStatus: clean...', tokens: 98, active: false, injected: false },
  { id: 'model-examples', name: 'Tool Call Examples', category: 'model', content: '## Gemini Examples\n<tool_call>{"name":"read_file"...', tokens: 423, active: false, injected: false },
  { id: 'user-memory', name: 'User Memory', category: 'memory', content: '# User Preferences\n- Preferred language: TypeScript...', tokens: 134, active: false, injected: false },
];

const ENV_VARS: EnvResolution[] = [
  { envVar: 'GEMINI_SYSTEM_MD', value: null, isSwitch: false, isDisabled: false, resolved: false },
  { envVar: 'GEMINI_WRITE_SYSTEM_MD', value: '/tmp/debug-prompt.md', isSwitch: false, isDisabled: false, resolved: false },
  { envVar: 'GEMINI_SANDBOX', value: 'true', isSwitch: true, isDisabled: false, resolved: false },
];

const MODEL_OPTIONS = [
  { id: 'gemini-1.5-flash', name: 'Gemini', pattern: 'gemini.*coder', selected: false },
  { id: 'gemini-vision', name: 'Gemini Vision', pattern: 'gemini.*vl', selected: false },
  { id: 'general', name: 'General', pattern: '*', selected: false },
];

export default function PromptTemplateAnimation() {
  const [phase, setPhase] = useState<BuildPhase>('idle');
  const [sections, setSections] = useState<PromptSection[]>(INITIAL_SECTIONS);
  const [envVars, setEnvVars] = useState<EnvResolution[]>(ENV_VARS);
  const [modelOptions, setModelOptions] = useState(MODEL_OPTIONS);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [finalPrompt, setFinalPrompt] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setPhase('idle');
    setSections(INITIAL_SECTIONS);
    setEnvVars(ENV_VARS);
    setModelOptions(MODEL_OPTIONS);
    setCurrentStep(0);
    setTotalTokens(0);
    setLogs([]);
    setFinalPrompt([]);
    setIsPlaying(false);
  }, []);

  // 动画主循环
  useEffect(() => {
    if (!isPlaying) return;

    const phases: BuildPhase[] = [
      'env-resolve',
      'base-template',
      'dynamic-inject',
      'model-examples',
      'memory-append',
      'final-assembly'
    ];

    const phaseIndex = phases.indexOf(phase);
    if (phaseIndex === -1) {
      setPhase('env-resolve');
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    switch (phase) {
      case 'env-resolve':
        addLog('📋 resolvePathFromEnv() - 解析环境变量');
        envVars.forEach((env, i) => {
          timers.push(setTimeout(() => {
            setEnvVars(prev => prev.map((e, idx) =>
              idx === i ? { ...e, resolved: true } : e
            ));
            addLog(`  ✓ ${env.envVar} = ${env.value || '(undefined)'}`);
          }, 400 * (i + 1)));
        });
        timers.push(setTimeout(() => {
          setPhase('base-template');
        }, 400 * (envVars.length + 1)));
        break;

      case 'base-template':
        addLog('📦 加载基础模板 - Core Sections');
        const coreSections = sections.filter(s => s.category === 'core');
        coreSections.forEach((section, i) => {
          timers.push(setTimeout(() => {
            setSections(prev => prev.map(s =>
              s.id === section.id ? { ...s, active: true, injected: true } : s
            ));
            setTotalTokens(prev => prev + section.tokens);
            addLog(`  + ${section.name} (+${section.tokens} tokens)`);
          }, 350 * (i + 1)));
        });
        timers.push(setTimeout(() => {
          setPhase('dynamic-inject');
        }, 350 * (coreSections.length + 2)));
        break;

      case 'dynamic-inject':
        addLog('🔧 动态节注入 - Sandbox & Git Detection');
        const dynamicSections = sections.filter(s => s.category === 'dynamic');

        // 检测 sandbox
        timers.push(setTimeout(() => {
          addLog('  🔍 detectSandboxType() → macOS Seatbelt');
        }, 300));

        // 检测 git
        timers.push(setTimeout(() => {
          addLog('  🔍 isGitRepository() → true');
        }, 600));

        dynamicSections.forEach((section, i) => {
          timers.push(setTimeout(() => {
            setSections(prev => prev.map(s =>
              s.id === section.id ? { ...s, active: true, injected: true } : s
            ));
            setTotalTokens(prev => prev + section.tokens);
            addLog(`  + ${section.name} (+${section.tokens} tokens)`);
          }, 900 + 400 * i));
        });

        timers.push(setTimeout(() => {
          setPhase('model-examples');
        }, 900 + 400 * (dynamicSections.length + 1)));
        break;

      case 'model-examples':
        addLog('🤖 getToolCallExamples() - 模型特定示例选择');
        addLog(`  Model: ${selectedModel}`);

        // 模型匹配动画
        modelOptions.forEach((opt, i) => {
          timers.push(setTimeout(() => {
            const isMatch = selectedModel.toLowerCase().includes(opt.id.replace('-', ''));
            setModelOptions(prev => prev.map((o, idx) =>
              idx === i ? { ...o, selected: isMatch } : o
            ));
            if (isMatch) {
              addLog(`  ✓ Pattern "${opt.pattern}" matched → ${opt.name}`);
              // 注入模型示例
              setSections(prev => prev.map(s =>
                s.id === 'model-examples' ? { ...s, active: true, injected: true, name: `${opt.name} Examples` } : s
              ));
              const modelSection = sections.find(s => s.id === 'model-examples');
              if (modelSection) {
                setTotalTokens(prev => prev + modelSection.tokens);
              }
            }
          }, 400 * (i + 1)));
        });

        timers.push(setTimeout(() => {
          setPhase('memory-append');
        }, 400 * (modelOptions.length + 2)));
        break;

      case 'memory-append':
        addLog('💾 追加用户记忆 - User Memory Suffix');
        timers.push(setTimeout(() => {
          addLog('  📂 Loading ~/.config/gemini/CLAUDE.md');
        }, 300));

        timers.push(setTimeout(() => {
          const memorySection = sections.find(s => s.id === 'user-memory');
          if (memorySection) {
            setSections(prev => prev.map(s =>
              s.id === 'user-memory' ? { ...s, active: true, injected: true } : s
            ));
            setTotalTokens(prev => prev + memorySection.tokens);
            addLog(`  + User Memory (+${memorySection.tokens} tokens)`);
          }
        }, 700));

        timers.push(setTimeout(() => {
          setPhase('final-assembly');
        }, 1200));
        break;

      case 'final-assembly':
        addLog('🔨 Final Assembly - 组装完成');

        // 生成最终 prompt 预览
        timers.push(setTimeout(() => {
          const injectedSections = sections.filter(s => s.injected);
          setFinalPrompt(injectedSections.map(s => s.name));
          addLog(`  ✅ System prompt assembled (${totalTokens} tokens)`);
        }, 400));

        timers.push(setTimeout(() => {
          addLog('  📤 getCoreSystemPrompt() → string');
          setIsPlaying(false);
        }, 800));
        break;
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, [phase, isPlaying, sections, envVars, modelOptions, selectedModel, totalTokens, addLog]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'var(--terminal-green)';
      case 'dynamic': return 'var(--cyber-blue)';
      case 'model': return 'var(--amber)';
      case 'memory': return '#a855f7';
      default: return '#6b7280';
    }
  };

  const getPhaseLabel = (p: BuildPhase) => {
    switch (p) {
      case 'idle': return '等待开始';
      case 'env-resolve': return '环境变量解析';
      case 'base-template': return '基础模板加载';
      case 'dynamic-inject': return '动态节注入';
      case 'model-examples': return '模型示例选择';
      case 'memory-append': return '用户记忆追加';
      case 'final-assembly': return '最终组装';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            Prompt 模板引擎
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            getCoreSystemPrompt() - 系统提示词构建流程
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isPlaying}
            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-1.5 text-sm font-mono text-[var(--text-primary)]"
          >
            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
            <option value="gemini-1.5-pro-vision">gemini-1.5-pro-vision</option>
            <option value="gpt-4o">gpt-4o</option>
          </select>
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

      {/* 阶段进度条 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--muted)]">构建阶段</span>
          <span className="text-sm font-mono text-[var(--terminal-green)]">{getPhaseLabel(phase)}</span>
        </div>
        <div className="flex gap-1">
          {['env-resolve', 'base-template', 'dynamic-inject', 'model-examples', 'memory-append', 'final-assembly'].map((p, i) => {
            const phases = ['env-resolve', 'base-template', 'dynamic-inject', 'model-examples', 'memory-append', 'final-assembly'];
            const currentIndex = phases.indexOf(phase);
            const isActive = phases.indexOf(p) <= currentIndex && phase !== 'idle';
            const isCurrent = p === phase;
            return (
              <div
                key={p}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  isCurrent ? 'bg-[var(--terminal-green)] animate-pulse' :
                  isActive ? 'bg-[var(--terminal-green)]/60' : 'bg-[var(--bg-tertiary)]'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧: 环境变量 + 模型选择 */}
        <div className="col-span-4 space-y-4">
          {/* 环境变量解析 */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
              📋 resolvePathFromEnv()
            </h3>
            <div className="space-y-2">
              {envVars.map((env, i) => (
                <div
                  key={env.envVar}
                  className={`p-2 rounded border transition-all duration-300 ${
                    env.resolved
                      ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <code className="text-xs text-[var(--amber)]">{env.envVar}</code>
                    {env.resolved && (
                      <span className="text-[var(--terminal-green)] text-xs">✓</span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-mono">
                    {env.value || '(undefined)'}
                    {env.isSwitch && <span className="text-[var(--cyber-blue)] ml-2">[switch]</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 模型匹配 */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-3 font-mono">
              🤖 getToolCallExamples()
            </h3>
            <div className="text-xs text-[var(--muted)] mb-3 font-mono">
              model = "{selectedModel}"
            </div>
            <div className="space-y-2">
              {modelOptions.map((opt) => (
                <div
                  key={opt.id}
                  className={`p-2 rounded border transition-all duration-300 ${
                    opt.selected
                      ? 'bg-[var(--amber)]/10 border-[var(--amber)]/30'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{opt.name}</span>
                    {opt.selected && (
                      <span className="text-[var(--amber)] text-xs">✓ matched</span>
                    )}
                  </div>
                  <code className="text-xs text-[var(--muted)]">/{opt.pattern}/</code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中间: Prompt 节组装 */}
        <div className="col-span-5">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)] h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--terminal-green)] font-mono">
                📦 Prompt Sections
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--terminal-green)]"></span>
                  Core
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--cyber-blue)]"></span>
                  Dynamic
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--amber)]"></span>
                  Model
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Memory
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border transition-all duration-500 ${
                    section.injected
                      ? 'border-l-2 translate-x-0 opacity-100'
                      : 'opacity-40 translate-x-2'
                  }`}
                  style={{
                    borderLeftColor: section.injected ? getCategoryColor(section.category) : 'transparent',
                    backgroundColor: section.injected ? `${getCategoryColor(section.category)}10` : 'var(--bg-tertiary)',
                    borderColor: section.injected ? `${getCategoryColor(section.category)}30` : 'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(section.category) }}
                      />
                      <span className="text-sm font-medium">{section.name}</span>
                    </div>
                    <span className="text-xs text-[var(--muted)] font-mono">
                      {section.tokens} tokens
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)] font-mono truncate">
                    {section.content.slice(0, 50)}...
                  </div>
                </div>
              ))}
            </div>

            {/* Token 计数 */}
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Total Tokens</span>
                <span className="text-lg font-bold text-[var(--terminal-green)] font-mono">
                  {totalTokens.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--terminal-green)] to-[var(--cyber-blue)] transition-all duration-500"
                  style={{ width: `${Math.min((totalTokens / 2000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧: 日志 + 输出 */}
        <div className="col-span-3 space-y-4">
          {/* 构建日志 */}
          <div className="bg-black/80 rounded-lg p-3 border border-[var(--border)] h-64 overflow-hidden">
            <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">
              Build Log
            </h3>
            <div className="space-y-1 text-xs font-mono overflow-y-auto h-52">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes('✓') ? 'text-[var(--terminal-green)]' :
                    log.includes('✅') ? 'text-[var(--terminal-green)]' :
                    log.includes('📋') || log.includes('📦') || log.includes('🔧') || log.includes('🤖') || log.includes('💾') || log.includes('🔨')
                      ? 'text-[var(--cyber-blue)]' :
                    log.includes('🔍') ? 'text-[var(--amber)]' :
                    'text-[var(--muted)]'
                  }`}
                >
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-[var(--muted)]">等待开始...</div>
              )}
            </div>
          </div>

          {/* 最终输出预览 */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
            <h3 className="text-xs font-semibold text-[var(--terminal-green)] mb-2 font-mono">
              Final Prompt Structure
            </h3>
            {finalPrompt.length > 0 ? (
              <div className="space-y-1">
                {finalPrompt.map((section, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2"
                  >
                    <span className="text-[var(--muted)]">{i + 1}.</span>
                    <span>{section}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[var(--muted)] font-mono">
                运行动画查看输出结构
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 源码说明 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          源码解析: packages/core/src/core/prompts.ts
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-2">
            <div className="text-[var(--terminal-green)]">// 主入口函数</div>
            <pre className="text-[var(--text-secondary)] bg-black/30 p-2 rounded overflow-x-auto">
{`export function getCoreSystemPrompt(
  userMemory?: string,
  model?: string,
): string {
  // 1. Check GEMINI_SYSTEM_MD override
  // 2. Build base prompt sections
  // 3. Inject dynamic sections
  // 4. Select model-specific examples
  // 5. Append user memory
  return finalPrompt;
}`}
            </pre>
          </div>
          <div className="space-y-2">
            <div className="text-[var(--cyber-blue)]">// 环境变量解析</div>
            <pre className="text-[var(--text-secondary)] bg-black/30 p-2 rounded overflow-x-auto">
{`export function resolvePathFromEnv(
  envVar?: string
): {
  isSwitch: boolean;
  value: string | null;
  isDisabled: boolean;
} {
  // Handle: undefined, "off", path
  // Returns resolution result
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
