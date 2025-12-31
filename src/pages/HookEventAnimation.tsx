// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// Introduction component for context
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪝</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">核心概念介绍</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">🎯 核心概念</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              Hook 系统是 Gemini CLI 的事件驱动拦截机制。
              在工具执行前后、模型调用前后等关键节点，执行用户自定义脚本进行拦截和修改。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🏗️ 三层配置</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div className="bg-[var(--bg-card)] p-3 rounded border border-green-500/30">
                <div className="text-green-400 font-semibold text-sm">项目级</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  .gemini/settings.json<br/>
                  当前项目专用
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-blue-500/30">
                <div className="text-blue-400 font-semibold text-sm">用户级</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  ~/.gemini/settings.json<br/>
                  所有项目共享
                </div>
              </div>
              <div className="bg-[var(--bg-card)] p-3 rounded border border-purple-500/30">
                <div className="text-purple-400 font-semibold text-sm">系统级</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  内置默认配置<br/>
                  最低优先级
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">🔧 11 种事件类型</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-[var(--terminal-green)]">BeforeTool</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-[var(--terminal-green)]">AfterTool</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-[var(--cyber-blue)]">BeforeModel</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-[var(--cyber-blue)]">AfterModel</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-[var(--amber)]">SessionStart</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-[var(--amber)]">SessionEnd</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-[var(--purple)]">Shutdown</div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center text-[var(--purple)]">...</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">📍 源码:</span>
              <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
                packages/core/src/hooks/
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">🔗 相关:</span>
              <span className="text-[var(--cyber-blue)] text-xs">HookPlanner, HookRunner, HookAggregator</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook 执行阶段
type HookPhase =
  | 'event_trigger'
  | 'config_load'
  | 'config_merge'
  | 'planner_init'
  | 'planner_filter'
  | 'runner_prepare'
  | 'runner_execute'
  | 'runner_timeout'
  | 'aggregator_collect'
  | 'aggregator_merge'
  | 'result_apply';

// 阶段分组
type PhaseGroup = 'trigger' | 'config' | 'planner' | 'runner' | 'aggregator' | 'result';

// 执行步骤
interface HookStep {
  phase: HookPhase;
  group: PhaseGroup;
  title: string;
  description: string;
  codeSnippet: string;
  visualData?: Record<string, unknown>;
  highlight?: string;
}

// Hook 事件流程
const hookSequence: HookStep[] = [
  {
    phase: 'event_trigger',
    group: 'trigger',
    title: '事件触发',
    description: '工具执行前触发 BeforeTool 事件，携带工具名称和参数',
    codeSnippet: `// hookSystem.ts:50-70
async function triggerHook(
  event: HookEventType,
  context: HookContext
): Promise<HookResult> {
  // BeforeTool 事件示例
  const hookEvent: HookEvent = {
    type: 'BeforeTool',
    toolName: 'Bash',
    toolInput: {
      command: 'npm run build',
      description: 'Build the project'
    },
    timestamp: Date.now(),
    sessionId: context.sessionId
  };

  return await this.hookOrchestrator.execute(hookEvent);
}`,
    visualData: {
      event: {
        type: 'BeforeTool',
        toolName: 'Bash',
        toolInput: { command: 'npm run build' }
      }
    },
    highlight: 'BeforeTool 事件',
  },
  {
    phase: 'config_load',
    group: 'config',
    title: '配置加载',
    description: '从三个层级加载 Hook 配置：项目级 → 用户级 → 系统级',
    codeSnippet: `// configLoader.ts:80-110
async function loadHookConfigs(): Promise<HookConfig[]> {
  const configs: HookConfig[] = [];

  // 1. 项目级配置 (最高优先级)
  const projectConfig = await loadFromPath(
    '.gemini/settings.json'
  );
  if (projectConfig?.hooks) {
    configs.push(...projectConfig.hooks);
  }

  // 2. 用户级配置
  const userConfig = await loadFromPath(
    '~/.gemini/settings.json'
  );
  if (userConfig?.hooks) {
    configs.push(...userConfig.hooks);
  }

  // 3. 系统默认配置
  configs.push(...getDefaultHooks());

  return configs;
}`,
    visualData: {
      sources: [
        { level: '项目级', path: '.gemini/settings.json', found: true, count: 2 },
        { level: '用户级', path: '~/.gemini/settings.json', found: true, count: 1 },
        { level: '系统级', path: 'built-in', found: true, count: 0 },
      ]
    },
    highlight: '3 层配置合并',
  },
  {
    phase: 'config_merge',
    group: 'config',
    title: '配置合并',
    description: '合并多层配置，项目级覆盖用户级，保留 ID 去重',
    codeSnippet: `// configMerger.ts:30-60
function mergeConfigs(configs: HookConfig[][]): HookConfig[] {
  const merged = new Map<string, HookConfig>();

  // 按优先级逆序处理（低优先级先，高优先级覆盖）
  for (const levelConfigs of configs.reverse()) {
    for (const config of levelConfigs) {
      // 使用 hookId 作为唯一标识
      merged.set(config.hookId, config);
    }
  }

  return Array.from(merged.values());
}

// 合并结果
[
  { hookId: 'lint-before-commit', ... },  // 项目级
  { hookId: 'log-all-tools', ... },       // 项目级
  { hookId: 'security-check', ... },      // 用户级
]`,
    visualData: {
      before: [
        { id: 'lint-before-commit', source: 'project' },
        { id: 'log-all-tools', source: 'project' },
        { id: 'security-check', source: 'user' },
        { id: 'log-all-tools', source: 'user' }, // 被覆盖
      ],
      after: [
        { id: 'lint-before-commit', source: 'project' },
        { id: 'log-all-tools', source: 'project' },
        { id: 'security-check', source: 'user' },
      ]
    },
    highlight: 'ID 去重合并',
  },
  {
    phase: 'planner_init',
    group: 'planner',
    title: 'Planner 初始化',
    description: 'HookPlanner 接收事件和配置，准备规划执行计划',
    codeSnippet: `// hookPlanner.ts:20-50
class HookPlanner {
  constructor(
    private configs: HookConfig[],
    private context: HookContext
  ) {}

  async plan(event: HookEvent): Promise<HookPlan> {
    // 1. 筛选匹配当前事件的 Hook
    const matchingHooks = this.filterByEvent(event);

    // 2. 检查条件表达式
    const applicableHooks = await this.evaluateConditions(
      matchingHooks,
      event
    );

    // 3. 生成执行计划
    return this.createPlan(applicableHooks);
  }
}`,
    visualData: {
      input: {
        event: 'BeforeTool',
        configs: 3
      }
    },
    highlight: 'HookPlanner',
  },
  {
    phase: 'planner_filter',
    group: 'planner',
    title: '事件匹配过滤',
    description: '根据事件类型和工具名称筛选适用的 Hook',
    codeSnippet: `// hookPlanner.ts:60-100
private filterByEvent(event: HookEvent): HookConfig[] {
  return this.configs.filter(config => {
    // 检查事件类型匹配
    if (config.event !== event.type) {
      return false;
    }

    // 检查工具名称匹配（支持通配符）
    if (config.toolPattern) {
      const pattern = new RegExp(
        config.toolPattern.replace('*', '.*')
      );
      if (!pattern.test(event.toolName)) {
        return false;
      }
    }

    return true;
  });
}

// 过滤结果
// 输入: 3 个 Hook 配置
// 事件: BeforeTool + Bash
// 输出: 2 个匹配的 Hook`,
    visualData: {
      input: [
        { id: 'lint-before-commit', event: 'BeforeTool', tool: 'Bash', match: true },
        { id: 'log-all-tools', event: 'BeforeTool', tool: '*', match: true },
        { id: 'security-check', event: 'AfterTool', tool: '*', match: false },
      ],
      matched: 2
    },
    highlight: '2 个 Hook 匹配',
  },
  {
    phase: 'runner_prepare',
    group: 'runner',
    title: 'Runner 准备执行',
    description: 'HookRunner 准备执行环境，设置超时和环境变量',
    codeSnippet: `// hookRunner.ts:30-70
class HookRunner {
  async prepare(hook: HookConfig): Promise<ExecutionContext> {
    // 1. 解析命令模板
    const command = this.parseTemplate(
      hook.command,
      this.context
    );

    // 2. 设置环境变量
    const env = {
      ...process.env,
      GEMINI_HOOK_EVENT: this.event.type,
      GEMINI_TOOL_NAME: this.event.toolName,
      GEMINI_TOOL_INPUT: JSON.stringify(this.event.toolInput),
      GEMINI_SESSION_ID: this.context.sessionId,
    };

    // 3. 配置超时
    const timeout = hook.timeout ?? 30000; // 默认 30s

    return { command, env, timeout };
  }
}`,
    visualData: {
      env: {
        GEMINI_HOOK_EVENT: 'BeforeTool',
        GEMINI_TOOL_NAME: 'Bash',
        GEMINI_TOOL_INPUT: '{"command":"npm run build"}'
      },
      timeout: 30000
    },
    highlight: '环境变量注入',
  },
  {
    phase: 'runner_execute',
    group: 'runner',
    title: '并行执行 Hook',
    description: '使用 Promise.allSettled 并行执行多个 Hook 脚本',
    codeSnippet: `// hookRunner.ts:80-120
async execute(
  hooks: HookConfig[]
): Promise<HookExecutionResult[]> {
  // 并行执行所有 Hook
  const results = await Promise.allSettled(
    hooks.map(async (hook) => {
      const ctx = await this.prepare(hook);

      return this.runCommand(
        ctx.command,
        ctx.env,
        ctx.timeout
      );
    })
  );

  // 收集执行结果
  return results.map((result, index) => ({
    hookId: hooks[index].hookId,
    status: result.status,
    output: result.status === 'fulfilled'
      ? result.value
      : null,
    error: result.status === 'rejected'
      ? result.reason
      : null
  }));
}`,
    visualData: {
      parallel: [
        { id: 'lint-before-commit', status: 'running', time: '0ms' },
        { id: 'log-all-tools', status: 'running', time: '0ms' },
      ]
    },
    highlight: 'Promise.allSettled',
  },
  {
    phase: 'runner_timeout',
    group: 'runner',
    title: '超时处理',
    description: '超时的 Hook 被强制终止，不影响其他 Hook 执行',
    codeSnippet: `// hookRunner.ts:130-160
private async runCommand(
  command: string,
  env: NodeJS.ProcessEnv,
  timeout: number
): Promise<CommandOutput> {
  return new Promise((resolve, reject) => {
    const proc = spawn('sh', ['-c', command], { env });

    // 设置超时
    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new HookTimeoutError(
        \`Hook timed out after \${timeout}ms\`
      ));
    }, timeout);

    proc.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new HookExitError(code));
      }
    });
  });
}`,
    visualData: {
      parallel: [
        { id: 'lint-before-commit', status: 'completed', time: '150ms', output: 'OK' },
        { id: 'log-all-tools', status: 'completed', time: '50ms', output: 'logged' },
      ]
    },
    highlight: '执行完成',
  },
  {
    phase: 'aggregator_collect',
    group: 'aggregator',
    title: 'Aggregator 收集结果',
    description: 'HookAggregator 收集所有 Hook 的执行结果',
    codeSnippet: `// hookAggregator.ts:20-50
class HookAggregator {
  private results: HookExecutionResult[] = [];

  collect(results: HookExecutionResult[]): void {
    for (const result of results) {
      this.results.push(result);

      // 记录执行日志
      if (result.status === 'fulfilled') {
        console.debug(
          \`[Hook] \${result.hookId} completed\`,
          result.output
        );
      } else {
        console.warn(
          \`[Hook] \${result.hookId} failed\`,
          result.error
        );
      }
    }
  }
}`,
    visualData: {
      collected: [
        { id: 'lint-before-commit', status: 'fulfilled', output: 'Lint passed' },
        { id: 'log-all-tools', status: 'fulfilled', output: 'Tool logged' },
      ]
    },
    highlight: '收集 2 个结果',
  },
  {
    phase: 'aggregator_merge',
    group: 'aggregator',
    title: '结果合并策略',
    description: '根据策略合并多个 Hook 的输出修改',
    codeSnippet: `// hookAggregator.ts:60-100
aggregate(): AggregatedResult {
  // 检查是否有 Hook 要求阻止操作
  const blocked = this.results.find(
    r => r.output?.action === 'block'
  );
  if (blocked) {
    return {
      action: 'block',
      reason: blocked.output.reason
    };
  }

  // 合并所有修改
  const modifications = this.results
    .filter(r => r.output?.modifications)
    .flatMap(r => r.output.modifications);

  // 检查冲突
  if (this.hasConflicts(modifications)) {
    console.warn('Hook modifications conflict');
    // 使用最后一个修改
  }

  return {
    action: 'continue',
    modifications
  };
}`,
    visualData: {
      strategy: 'merge',
      action: 'continue',
      modifications: []
    },
    highlight: 'action: continue',
  },
  {
    phase: 'result_apply',
    group: 'result',
    title: '应用结果',
    description: 'Hook 结果应用到原始操作，继续执行工具调用',
    codeSnippet: `// hookSystem.ts:100-130
async applyResult(
  result: AggregatedResult,
  originalInput: ToolInput
): Promise<ToolInput | null> {
  switch (result.action) {
    case 'block':
      // 阻止工具执行
      throw new HookBlockedError(result.reason);

    case 'modify':
      // 应用修改
      return applyModifications(
        originalInput,
        result.modifications
      );

    case 'continue':
    default:
      // 继续原始执行
      return originalInput;
  }
}

// 工具 Bash 继续执行
// command: "npm run build"`,
    visualData: {
      action: 'continue',
      toolExecuted: true
    },
    highlight: '工具继续执行',
  },
];

// 阶段组颜色
const groupColors: Record<PhaseGroup, string> = {
  trigger: '#22c55e',   // green
  config: '#3b82f6',    // blue
  planner: '#f59e0b',   // amber
  runner: '#8b5cf6',    // purple
  aggregator: '#ec4899', // pink
  result: '#10b981',    // emerald
};

// 阶段组名称
const groupNames: Record<PhaseGroup, string> = {
  trigger: '事件触发',
  config: '配置加载',
  planner: '执行规划',
  runner: '脚本执行',
  aggregator: '结果聚合',
  result: '结果应用',
};

// 配置来源可视化
function ConfigSourcesVisualizer({ sources }: { sources?: Array<{ level: string; path: string; found: boolean; count: number }> }) {
  if (!sources) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">配置来源</div>
      <div className="space-y-2">
        {sources.map((source, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded border ${
              source.found ? 'border-green-500/30 bg-green-500/10' : 'border-gray-700 bg-gray-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${source.found ? 'bg-green-500' : 'bg-gray-600'}`} />
              <div>
                <div className="text-sm text-white">{source.level}</div>
                <div className="text-xs text-gray-500 font-mono">{source.path}</div>
              </div>
            </div>
            <div className={`text-sm font-bold ${source.count > 0 ? 'text-green-400' : 'text-gray-500'}`}>
              {source.count} hooks
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook 匹配可视化
function HookMatchVisualizer({ input, matched }: { input?: Array<{ id: string; event: string; tool: string; match: boolean }>; matched?: number }) {
  if (!input) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">Hook 匹配过滤</div>
      <div className="space-y-2">
        {input.map((hook, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-3 rounded border transition-all ${
              hook.match
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-red-500/30 bg-red-500/10 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg ${hook.match ? 'text-green-400' : 'text-red-400'}`}>
                {hook.match ? '✓' : '✗'}
              </span>
              <div>
                <div className="text-sm text-white font-mono">{hook.id}</div>
                <div className="text-xs text-gray-500">
                  {hook.event} / {hook.tool}
                </div>
              </div>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              hook.match ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {hook.match ? 'MATCH' : 'SKIP'}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-right text-sm text-gray-400">
        匹配: <span className="text-green-400 font-bold">{matched}</span> / {input.length}
      </div>
    </div>
  );
}

// 并行执行可视化
function ParallelExecutionVisualizer({ parallel }: { parallel?: Array<{ id: string; status: string; time: string; output?: string }> }) {
  if (!parallel) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">并行执行状态</div>
      <div className="space-y-3">
        {parallel.map((hook, i) => {
          const isRunning = hook.status === 'running';
          const isCompleted = hook.status === 'completed';

          return (
            <div key={i} className="relative">
              <div className={`flex items-center gap-3 p-3 rounded border ${
                isCompleted ? 'border-green-500/50 bg-green-500/10' :
                isRunning ? 'border-amber-500/50 bg-amber-500/10' :
                'border-gray-700 bg-gray-800/50'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' :
                  isRunning ? 'bg-amber-500 animate-pulse' :
                  'bg-gray-600'
                }`}>
                  {isCompleted ? '✓' : isRunning ? '⟳' : '○'}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white font-mono">{hook.id}</div>
                  {hook.output && (
                    <div className="text-xs text-gray-400 mt-1">→ {hook.output}</div>
                  )}
                </div>
                <div className="text-xs text-gray-500">{hook.time}</div>
              </div>
              {isRunning && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/30 rounded-b overflow-hidden">
                  <div className="h-full bg-amber-500 animate-progress" style={{ width: '60%' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 环境变量可视化
function EnvVarsVisualizer({ env, timeout }: { env?: Record<string, string>; timeout?: number }) {
  if (!env) return null;

  return (
    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="text-xs text-gray-500 mb-3 font-mono">注入的环境变量</div>
      <div className="space-y-2 font-mono text-sm">
        {Object.entries(env).map(([key, value]) => (
          <div key={key} className="flex">
            <span className="text-purple-400">{key}</span>
            <span className="text-gray-600">=</span>
            <span className="text-green-400 break-all">{value}</span>
          </div>
        ))}
      </div>
      {timeout && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <span className="text-gray-500">Timeout: </span>
          <span className="text-amber-400">{timeout}ms</span>
        </div>
      )}
    </div>
  );
}

export function HookEventAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const step = hookSequence[currentStep];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < hookSequence.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(prev => Math.min(hookSequence.length - 1, prev + 1));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />
      </div>

      {/* 标题 */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-[var(--terminal-green)] mb-2 font-mono">
          Hook 事件流
        </h1>
        <p className="text-gray-400">
          从事件触发到结果应用的完整流程
        </p>
        <div className="text-xs text-gray-600 mt-1 font-mono">
          核心文件: packages/core/src/hooks/hookSystem.ts
        </div>
      </div>

      {/* 阶段组指示器 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(groupNames) as PhaseGroup[]).map((group) => {
            const isActive = step.group === group;
            return (
              <div
                key={group}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive ? 'shadow-lg' : 'opacity-50'
                }`}
                style={{
                  backgroundColor: isActive ? `${groupColors[group]}20` : 'transparent',
                  color: groupColors[group],
                  border: `1px solid ${isActive ? groupColors[group] : 'transparent'}`
                }}
              >
                {groupNames[group]}
              </div>
            );
          })}
        </div>
      </div>

      {/* 进度条 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-1">
          {hookSequence.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className="flex-1 h-2 rounded-full transition-all cursor-pointer"
              style={{
                backgroundColor:
                  i === currentStep
                    ? groupColors[s.group]
                    : i < currentStep
                      ? `${groupColors[s.group]}80`
                      : '#374151'
              }}
              title={s.title}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>步骤 {currentStep + 1} / {hookSequence.length}</span>
          <span
            className="px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${groupColors[step.group]}20`,
              color: groupColors[step.group]
            }}
          >
            {groupNames[step.group]}
          </span>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：可视化 */}
        <div className="space-y-6">
          {/* 当前步骤 */}
          <div
            className="rounded-xl p-6 border"
            style={{
              borderColor: `${groupColors[step.group]}50`,
              background: `linear-gradient(135deg, ${groupColors[step.group]}10, rgba(0,0,0,0.8))`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: groupColors[step.group], color: 'white' }}
              >
                {currentStep + 1}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{step.title}</h2>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>

            {step.highlight && (
              <div
                className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${groupColors[step.group]}20`,
                  color: groupColors[step.group]
                }}
              >
                {step.highlight}
              </div>
            )}
          </div>

          {/* 事件数据可视化 */}
          {step.visualData?.event && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <div className="text-xs text-gray-500 mb-2 font-mono">触发事件</div>
              <pre className="text-sm text-[var(--terminal-green)] overflow-x-auto">
                {JSON.stringify(step.visualData.event, null, 2)}
              </pre>
            </div>
          )}

          {/* 配置来源可视化 */}
          {step.visualData?.sources && (
            <ConfigSourcesVisualizer sources={step.visualData.sources as Array<{ level: string; path: string; found: boolean; count: number }>} />
          )}

          {/* Hook 匹配可视化 */}
          {step.visualData?.input && step.visualData?.matched !== undefined && (
            <HookMatchVisualizer
              input={step.visualData.input as Array<{ id: string; event: string; tool: string; match: boolean }>}
              matched={step.visualData.matched as number}
            />
          )}

          {/* 环境变量可视化 */}
          {step.visualData?.env && (
            <EnvVarsVisualizer
              env={step.visualData.env as Record<string, string>}
              timeout={step.visualData.timeout as number}
            />
          )}

          {/* 并行执行可视化 */}
          {step.visualData?.parallel && (
            <ParallelExecutionVisualizer parallel={step.visualData.parallel as Array<{ id: string; status: string; time: string; output?: string }>} />
          )}

          {/* 结果操作 */}
          {step.visualData?.action && (
            <div className={`p-4 rounded-lg border-2 ${
              step.visualData.action === 'continue'
                ? 'border-green-500 bg-green-500/10'
                : step.visualData.action === 'block'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-amber-500 bg-amber-500/10'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${
                  step.visualData.action === 'continue' ? 'text-green-400' :
                  step.visualData.action === 'block' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {step.visualData.action === 'continue' ? '✓' : step.visualData.action === 'block' ? '✗' : '!'}
                </span>
                <span className="font-bold text-white">
                  Action: {step.visualData.action as string}
                </span>
              </div>
              {step.visualData.toolExecuted && (
                <div className="text-sm text-gray-300">
                  → 工具 Bash 继续执行
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧：代码 */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 font-mono">源码实现</h3>
          <div
            className="rounded-xl overflow-hidden border border-gray-800"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <div className="p-1 border-b border-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-gray-500 ml-2 font-mono">
                hookSystem.ts
              </span>
            </div>
            <JsonBlock code={step.codeSnippet} />
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          重置
        </button>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          上一步
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${isPlaying
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : 'bg-[var(--terminal-green)] text-black hover:opacity-90'
            }
          `}
        >
          {isPlaying ? '暂停' : '自动播放'}
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === hookSequence.length - 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          下一步
        </button>
      </div>

      {/* 流程总览 */}
      <div className="max-w-6xl mx-auto mt-8">
        <div
          className="rounded-xl p-6 border border-gray-800"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Hook 事件流程总览</h3>
          <div className="flex items-center justify-between flex-wrap gap-2">
            {(Object.keys(groupNames) as PhaseGroup[]).map((group, i) => (
              <div key={group} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: groupColors[group], color: 'white' }}
                >
                  {i + 1}
                </div>
                <span className="text-sm text-gray-300">{groupNames[group]}</span>
                {i < Object.keys(groupNames).length - 1 && (
                  <span className="text-gray-600 mx-2">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
