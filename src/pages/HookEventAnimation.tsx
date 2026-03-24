// @ts-nocheck - visualData uses Record<string, unknown> which causes strict type issues
import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// Introduction component for context
function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
  <span className="text-xl font-bold text-heading">核心概念介绍</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base p-4 border/50 rounded-lg-l-4 border-edge">
 <h4 className="text-heading font-bold mb-2">核心概念</h4>
 <p className="text-body text-sm">
 Hook 系统是 Gemini CLI 的事件驱动拦截机制。
 在工具执行前后、模型调用前后等关键节点，执行用户自定义脚本进行拦截和修改。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">四层配置</h4>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
 <div className="bg-surface p-3 rounded border-l-2 border-l-edge-hover/30">
 <div className="text-heading font-semibold text-sm">项目级</div>
 <div className="text-xs text-dim mt-1">
 .gemini/settings.json<br/>
 当前项目专用
 </div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-heading font-semibold text-sm">用户级</div>
 <div className="text-xs text-dim mt-1">
 ~/.gemini/settings.json<br/>
 所有项目共享
 </div>
 </div>
 <div className="bg-surface p-3 rounded border border-edge">
 <div className="text-heading font-semibold text-sm">系统级</div>
 <div className="text-xs text-dim mt-1">
 /etc/gemini-cli/settings.json<br/>
 管理员级覆盖
 </div>
 </div>
 <div className="bg-surface p-3 rounded border-l-2 border-l-edge-hover/30">
 <div className="text-heading font-semibold text-sm">扩展 (Extensions)</div>
 <div className="text-xs text-dim mt-1">
 extension 内置 hooks<br/>
 最低优先级
 </div>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">11 种事件类型</h4>
 <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2 text-xs">
 <div className="bg-surface p-2 rounded text-center text-heading">BeforeTool</div>
 <div className="bg-surface p-2 rounded text-center text-heading">AfterTool</div>
 <div className="bg-surface p-2 rounded text-center text-heading">BeforeAgent</div>
 <div className="bg-surface p-2 rounded text-center text-heading">AfterAgent</div>
 <div className="bg-surface p-2 rounded text-center text-heading">BeforeModel</div>
 <div className="bg-surface p-2 rounded text-center text-heading">AfterModel</div>
 <div className="bg-surface p-2 rounded text-center text-heading">SessionStart</div>
 <div className="bg-surface p-2 rounded text-center text-heading">SessionEnd</div>
 <div className="bg-surface p-2 rounded text-center text-heading">PreCompress</div>
 <div className="bg-surface p-2 rounded text-center text-heading">BeforeToolSelection</div>
 <div className="bg-surface p-2 rounded text-center text-heading">Notification</div>
 </div>
 </div>

 <div className="flex flex-wrap gap-4 text-sm">
 <div className="flex items-center gap-2">
 <span className="text-dim">源码:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/core/src/hooks/
 </code>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-dim">相关:</span>
 <span className="text-heading text-xs">HookPlanner, HookRunner, HookAggregator</span>
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
 codeSnippet: `// packages/core/src/core/coreToolHookTriggers.ts（简化）
await messageBus.request(
 {
 type: MessageBusType.HOOK_EXECUTION_REQUEST,
 eventName: 'BeforeTool',
 input: {
 tool_name: 'run_shell_command',
 tool_input: { command: 'npm run build' },
 },
 },
 MessageBusType.HOOK_EXECUTION_RESPONSE,
);`,
 visualData: {
 event: {
 type: 'BeforeTool',
 toolName: 'run_shell_command',
 toolInput: { command: 'npm run build' }
 }
 },
 highlight: 'BeforeTool 事件',
 },
 {
 phase: 'config_load',
 group: 'config',
 title: '配置加载',
 description: 'HookRegistry 初始化时收集 settings + extensions 的 hooks（并记录来源优先级）',
 codeSnippet: `// docs/hooks/index.md: Configuration layers (lower numbers run first)
// 1) Project: .gemini/settings.json
// 2) User: ~/.gemini/settings.json
// 3) System: /etc/gemini-cli/settings.json (or OS-specific path)
// 4) Extensions: installed extensions (lowest priority)

// packages/core/src/hooks/hookSystem.ts
await hookSystem.initialize(); // 内部会 hookRegistry.initialize()`,
 visualData: {
 sources: [
 { level: '项目级', path: '.gemini/settings.json', found: true, count: 2 },
 { level: '用户级', path: '~/.gemini/settings.json', found: true, count: 1 },
 { level: '系统级', path: '/etc/gemini-cli/settings.json', found: true, count: 0 },
 { level: '扩展', path: 'extensions/*/extension.json', found: true, count: 1 },
 ]
 },
 highlight: '4 层配置',
 },
 {
 phase: 'config_merge',
 group: 'config',
 title: '配置合并',
 description: 'HookPlanner 会对“同名 + 同 command”的 hooks 去重（高优先级层保留）',
 codeSnippet: `// packages/core/src/hooks/types.ts
export function getHookKey(hook: HookConfig): string {
 const name = hook.name || '';
 const command = hook.command || '';
 return \`\${name}:\${command}\`;
}

// packages/core/src/hooks/hookPlanner.ts（关键片段）
const entries = hookRegistry.getHooksForEvent(eventName); // 已按 source priority 排序
const matching = entries.filter((e) => matchesContext(e, context));
const deduped = deduplicateHooks(matching); // seen.add(getHookKey(e.config))
return { eventName, hookConfigs: deduped.map((e) => e.config) };`,
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
 highlight: 'name:command 去重',
 },
 {
 phase: 'planner_init',
 group: 'planner',
 title: 'Planner 初始化',
 description: 'HookPlanner 接收事件和配置，准备规划执行计划',
 codeSnippet: `// packages/core/src/hooks/hookPlanner.ts（简化）
createExecutionPlan(eventName, context?) {
 const hookEntries = hookRegistry.getHooksForEvent(eventName);
 const matchingEntries = hookEntries.filter((entry) => matchesContext(entry, context));
 const deduplicatedEntries = deduplicateHooks(matchingEntries); // key = name:command

 return {
 eventName,
 hookConfigs: deduplicatedEntries.map((entry) => entry.config),
 sequential: deduplicatedEntries.some((entry) => entry.sequential === true),
 };
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
 codeSnippet: `// packages/core/src/hooks/hookPlanner.ts（匹配逻辑）
// matcher 支持：空 / *（匹配全部）、正则（regex.test）、或精确字符串（regex 不合法时 fallback）
if (matcher === '' || matcher === '*') return true;
try { return new RegExp(matcher).test(toolName); } catch { return matcher === toolName; }

// 过滤结果（示例）
// 事件: BeforeTool + run_shell_command
// 输出: 2 个匹配的 hooks`,
 visualData: {
 input: [
 { id: 'lint-before-commit', event: 'BeforeTool', tool: 'run_shell_command', match: true },
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
 codeSnippet: `// packages/core/src/hooks/hookRunner.ts（关键片段）
const timeout = hookConfig.timeout ?? 60000;
const command = expandCommand(hookConfig.command, input, shellConfig.shell);

// env: 只注入项目目录（并保留 CLAUDE_PROJECT_DIR 兼容）
const env = {
 ...sanitizeEnvironment(process.env),
 GEMINI_PROJECT_DIR: input.cwd,
 CLAUDE_PROJECT_DIR: input.cwd,
};

// stdin: hook input 以 JSON 发送（tool_name / tool_input / session_id ...）
child.stdin.write(JSON.stringify(input));`,
 visualData: {
 env: {
 GEMINI_PROJECT_DIR: '/path/to/project',
 CLAUDE_PROJECT_DIR: '/path/to/project',
 },
 timeout: 60000
 },
 highlight: '环境变量注入',
 },
 {
 phase: 'runner_execute',
 group: 'runner',
 title: '并行执行 Hook',
 description: '并行模式：Promise.all 执行 hooks；顺序模式：逐个执行并可修改下一次输入',
 codeSnippet: `// packages/core/src/hooks/hookRunner.ts
async executeHooksParallel(hookConfigs, eventName, input) {
 return Promise.all(hookConfigs.map((cfg) => executeHook(cfg, eventName, input)));
}

async executeHooksSequential(hookConfigs, eventName, input) {
 let currentInput = input;
 const results = [];
 for (const cfg of hookConfigs) {
 const result = await executeHook(cfg, eventName, currentInput);
 results.push(result);
 if (result.success && result.output) {
 currentInput = applyHookOutputToInput(currentInput, result.output, eventName);
 }
 }
 return results;
}`,
 visualData: {
 parallel: [
 { id: 'lint-before-commit', status: 'running', time: '0ms' },
 { id: 'log-all-tools', status: 'running', time: '0ms' },
 ]
 },
 highlight: 'Promise.all / sequential',
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
 // 5s 后仍未退出则 SIGKILL（防止僵死）
 setTimeout(() => proc.kill('SIGKILL'), 5000);
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
 codeSnippet: `// packages/core/src/hooks/hookAggregator.ts（关键片段）
aggregateResults(results, eventName) {
 const allOutputs = [];
 const errors = [];
 let totalDuration = 0;

 for (const result of results) {
 totalDuration += result.duration;
 if (result.error) errors.push(result.error);
 if (result.output) allOutputs.push(result.output);
 }

 const mergedOutput = mergeOutputs(allOutputs, eventName);
 return { success: errors.length === 0, finalOutput: mergedOutput, allOutputs, errors, totalDuration };
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
 codeSnippet: `// packages/core/src/hooks/hookAggregator.ts（概览）
// 不同事件采用不同 merge 策略：
// - BeforeTool/AfterTool/BeforeAgent/AfterAgent/SessionStart: mergeWithOrDecision（任一 blocking 决策生效；否则默认 allow）
// - BeforeModel/AfterModel: mergeWithFieldReplacement（后者覆盖前者）
// - BeforeToolSelection: mergeToolSelectionOutputs（工具选择策略合并）
//
// 通用规则：reason/systemMessage/additionalContext 等会拼接；hookSpecificOutput 做对象合并`,
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
 codeSnippet: `// packages/core/src/core/coreToolHookTriggers.ts（BeforeTool 的关键行为）
const beforeOutput = await fireBeforeToolHook(messageBus, toolName, toolInput);

// 1) stop：立即终止 agent loop
if (beforeOutput?.shouldStopExecution()) {
 return { error: { type: 'STOP_EXECUTION', message: beforeOutput.getEffectiveReason() } };
}

// 2) block：阻止本次工具执行
const blockingError = beforeOutput?.getBlockingError();
if (blockingError?.blocked) {
 return { error: { type: 'EXECUTION_FAILED', message: blockingError.reason } };
}

// 3) modify tool_input：就地更新 params，并重新 build invocation（刷新派生状态）
if (beforeOutput instanceof BeforeToolHookOutput) {
 const modified = beforeOutput.getModifiedToolInput();
 if (modified) {
 Object.assign(invocation.params, modified);
 invocation = tool.build(invocation.params);
 }
}

// 未阻止：工具继续执行（run_shell_command / write_file / replace ...）`,
 visualData: {
 action: 'continue',
 toolExecuted: true
 },
 highlight: '工具继续执行',
 },
];

// 阶段组颜色
const groupColors: Record<PhaseGroup, string> = {
 trigger: 'var(--color-success)', // green
 config: 'var(--color-info)', // blue
 planner: 'var(--color-warning)', // amber
 runner: '#8b5cf6', // purple
 aggregator: '#ec4899', // pink
 result: '#10b981', // emerald
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
 <div className="mb-6 p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-3 font-mono">配置来源</div>
 <div className="space-y-2">
 {sources.map((source, i) => (
 <div
 key={i}
 className={`flex items-center justify-between p-3 rounded border ${
 source.found ? 'border-edge/30 bg-elevated' : ' border-edge bg-surface'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className={`w-2 h-2 rounded-full ${source.found ? 'bg-[var(--color-success)]' : ' bg-elevated'}`} />
 <div>
 <div className="text-sm text-heading">{source.level}</div>
 <div className="text-xs text-dim font-mono">{source.path}</div>
 </div>
 </div>
 <div className={`text-sm font-bold ${source.count > 0 ? 'text-heading' : 'text-dim'}`}>
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
 <div className="mb-6 p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-3 font-mono">Hook 匹配过滤</div>
 <div className="space-y-2">
 {input.map((hook, i) => (
 <div
 key={i}
 className={`flex items-center justify-between p-3 rounded border transition-all ${
 hook.match
 ? 'border-edge/40 bg-elevated'
 : 'border-edge/30 bg-elevated opacity-60'
 }`}
 >
 <div className="flex items-center gap-3">
 <span className={`text-lg ${hook.match ? 'text-heading' : 'text-heading'}`}>
 {hook.match ? '✓' : '✗'}
 </span>
 <div>
 <div className="text-sm text-heading font-mono">{hook.id}</div>
 <div className="text-xs text-dim">
 {hook.event} / {hook.tool}
 </div>
 </div>
 </div>
 <div className={`text-xs px-2 py-1 rounded ${
 hook.match ? 'bg-elevated text-heading' : 'bg-elevated text-heading'
 }`}>
 {hook.match ? 'MATCH' : 'SKIP'}
 </div>
 </div>
 ))}
 </div>
 <div className="mt-3 text-right text-sm text-body">
 匹配: <span className="text-heading font-bold">{matched}</span> / {input.length}
 </div>
 </div>
 );
}

// 并行执行可视化
function ParallelExecutionVisualizer({ parallel }: { parallel?: Array<{ id: string; status: string; time: string; output?: string }> }) {
 if (!parallel) return null;

 return (
 <div className="mb-6 p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-3 font-mono">并行执行状态</div>
 <div className="space-y-3">
 {parallel.map((hook, i) => {
 const isRunning = hook.status === 'running';
 const isCompleted = hook.status === 'completed';

 return (
 <div key={i} className="relative">
 <div className={`flex items-center gap-3 p-3 rounded border ${
 isCompleted ? 'border-edge/40 bg-elevated' :
 isRunning ? 'border-edge/40 bg-elevated' :
 ' border-edge bg-surface'
 }`}>
 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
 isCompleted ? 'bg-[var(--color-success)]' :
 isRunning ? 'bg-[var(--color-warning)] animate-pulse' :
 ' bg-elevated'
 }`}>
 {isCompleted ? '✓' : isRunning ? '⟳' : '○'}
 </div>
 <div className="flex-1">
 <div className="text-sm text-heading font-mono">{hook.id}</div>
 {hook.output && (
 <div className="text-xs text-body mt-1">→ {hook.output}</div>
 )}
 </div>
 <div className="text-xs text-dim">{hook.time}</div>
 </div>
 {isRunning && (
 <div className="absolute bottom-0 left-0 right-0 h-1 bg-elevated rounded-b overflow-hidden">
 <div className="h-full bg-[var(--color-warning)] animate-progress" style={{ width: '60%' }} />
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
 <div className="mb-6 p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-3 font-mono">注入的环境变量</div>
 <div className="space-y-2 font-mono text-sm">
 {Object.entries(env).map(([key, value]) => (
 <div key={key} className="flex">
 <span className="text-heading">{key}</span>
 <span className="text-dim">=</span>
 <span className="text-heading break-all">{value}</span>
 </div>
 ))}
 </div>
 {timeout && (
 <div className="mt-3 pt-3 border-t border-edge">
 <span className="text-dim">Timeout: </span>
 <span className="text-heading">{timeout}ms</span>
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
 <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="max-w-6xl mx-auto">
 <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />
 </div>

 {/* 标题 */}
 <div className="max-w-6xl mx-auto mb-8">
 <h1 className="text-3xl font-bold text-heading mb-2 font-mono">
 Hook 事件流
 </h1>
 <p className="text-body">
 从事件触发到结果应用的完整流程
 </p>
 <div className="text-xs text-dim mt-1 font-mono">
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
 <div className="flex justify-between mt-2 text-xs text-dim">
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
 className="rounded-lg p-6 border"
 style={{
 borderColor: `${groupColors[step.group]}50`,
 background: `linear-gradient(135deg, ${groupColors[step.group]}10, var(--color-bg))`
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
 <h2 className="text-xl font-bold text-heading">{step.title}</h2>
 <p className="text-sm text-body">{step.description}</p>
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
 <div className="mb-6 p-4 rounded-lg" className="bg-surface">
 <div className="text-xs text-dim mb-2 font-mono">触发事件</div>
 <pre className="text-sm text-heading overflow-x-auto">
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
 ? 'border-edge bg-elevated'
 : step.visualData.action === 'block'
 ? 'border-edge bg-elevated'
 : 'border-edge bg-elevated'
 }`}>
 <div className="flex items-center gap-2 mb-2">
 <span className={`text-lg ${
 step.visualData.action === 'continue' ? 'text-heading' :
 step.visualData.action === 'block' ? 'text-heading' : 'text-heading'
 }`}>
 {step.visualData.action === 'continue' ? '✓' : step.visualData.action === 'block' ? '✗' : '!'}
 </span>
 <span className="font-bold text-heading">
 Action: {step.visualData.action as string}
 </span>
 </div>
 {step.visualData.toolExecuted && (
 <div className="text-sm text-body">
 → 工具 run_shell_command 继续执行
 </div>
 )}
 </div>
 )}
 </div>

 {/* 右侧：代码 */}
 <div>
 <JsonBlock code={step.codeSnippet} title="hookSystem.ts — 源码实现" />
 </div>
 </div>

 {/* 控制按钮 */}
 <div className="max-w-6xl mx-auto mt-8 flex items-center justify-center gap-4">
 <button
 onClick={handleReset}
 className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated transition-colors"
 >
 重置
 </button>
 <button
 onClick={handlePrev}
 disabled={currentStep === 0}
 className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated transition-colors disabled:opacity-50"
 >
 上一步
 </button>
 <button
 onClick={() => setIsPlaying(!isPlaying)}
 className={`
 px-6 py-2 rounded-lg font-medium transition-colors
 ${isPlaying
 ? 'bg-[var(--color-warning)] text-heading hover:bg-[var(--color-warning)]'
 : ' bg-elevated text-heading hover:opacity-90'
 }
 `}
 >
 {isPlaying ? '暂停' : '自动播放'}
 </button>
 <button
 onClick={handleNext}
 disabled={currentStep === hookSequence.length - 1}
 className="px-4 py-2 rounded-lg bg-surface text-body hover:bg-elevated transition-colors disabled:opacity-50"
 >
 下一步
 </button>
 </div>

 {/* 流程总览 */}
 <div className="max-w-6xl mx-auto mt-8">
 <div
 className="rounded-lg p-6 border border-edge"
 className="bg-surface"
 >
 <h3 className="text-lg font-bold text-heading mb-4">Hook 事件流程总览</h3>
 <div className="flex items-center justify-between flex-wrap gap-2">
 {(Object.keys(groupNames) as PhaseGroup[]).map((group, i) => (
 <div key={group} className="flex items-center gap-2">
 <div
 className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
 style={{ backgroundColor: groupColors[group], color: 'white' }}
 >
 {i + 1}
 </div>
 <span className="text-sm text-body">{groupNames[group]}</span>
 {i < Object.keys(groupNames).length - 1 && (
 <span className="text-dim mx-2">→</span>
 )}
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
