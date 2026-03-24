import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

type ApprovalMode = 'default' | 'auto_edit' | 'yolo';
type ContextMode = 'custom_command_injection' | 'run_shell_command_tool';

type PermissionResult = 'allowed' | 'denied' | 'ask' | 'pending';

const SHELL_TOOL_NAMES = ['run_shell_command', 'ShellTool'] as const;

interface ExampleCommand {
 cmd: string;
 desc: string;
 parse:
 | { ok: true; segments: string[] }
 | { ok: false; reason: string };
}

const EXAMPLE_COMMANDS: ExampleCommand[] = [
 {
 cmd: 'git status',
 desc: '常见命令（用于演示 allow once/session）',
 parse: { ok: true, segments: ['git status'] },
 },
 {
 cmd: 'git status && git log',
 desc: '链式命令（每段都要覆盖）',
 parse: { ok: true, segments: ['git status', 'git log'] },
 },
 {
 cmd: 'npm install axios',
 desc: '典型命令（默认 deny 会触发确认）',
 parse: { ok: true, segments: ['npm install axios'] },
 },
 {
 cmd: 'rm -rf /',
 desc: '危险命令（tools.exclude 硬拒绝）',
 parse: { ok: true, segments: ['rm -rf /'] },
 },
 {
 cmd: '$(cat /etc/passwd)',
 desc: '无法安全解析（hard denial）',
 parse: {
 ok: false,
 reason: 'parseCommandDetails() 无法提取安全的 command 节点/根命令',
 },
 },
];

interface ConfigPreset {
 id: string;
 title: string;
 description: string;
 coreTools: string[];
 excludeTools: string[];
}

const CONFIG_PRESETS: ConfigPreset[] = [
 {
 id: 'default',
 title: '默认：仅配置 tools.exclude（推荐起步）',
 description:
 '不启用严格 allowlist；只用 tools.exclude 做硬拒绝（最高优先级）。',
 coreTools: [],
 excludeTools: ['run_shell_command(rm -rf)', 'run_shell_command(sudo)'],
 },
 {
 id: 'strict_allowlist',
 title: '严格 allowlist：tools.core 限定 shell 前缀',
 description:
 '当 tools.core 出现 run_shell_command(...) 模式时，direct tool invocation 会进入 strict allowlist。',
 coreTools: [
 'read_file',
 'search_file_content',
 'list_directory',
 'glob',
 'run_shell_command(git)',
 ],
 excludeTools: ['run_shell_command(rm -rf)', 'run_shell_command(sudo)'],
 },
 {
 id: 'disable_shell',
 title: '全局禁用 shell tool（硬拒绝）',
 description:
 'tools.exclude 包含 run_shell_command / ShellTool 时，checkCommandPermissions 会直接 hard deny。',
 coreTools: [],
 excludeTools: ['run_shell_command'],
 },
];

function normalize(command: string): string {
 return command.trim().replace(/\s+/g, ' ');
}

function parseShellPattern(pattern: string): { tool: string; arg?: string } | null {
 const openParen = pattern.indexOf('(');
 if (openParen === -1) {
 return { tool: pattern };
 }
 if (!pattern.endsWith(')')) {
 return null;
 }
 return {
 tool: pattern.substring(0, openParen),
 arg: pattern.substring(openParen + 1, pattern.length - 1),
 };
}

function matchesShellPatterns(command: string, patterns: string[]): boolean {
 for (const pattern of patterns) {
 const parsed = parseShellPattern(pattern);
 if (!parsed) {
 continue;
 }

 if (!SHELL_TOOL_NAMES.includes(parsed.tool as (typeof SHELL_TOOL_NAMES)[number])) {
 continue;
 }

 if (!parsed.arg) {
 // Wildcard tool match: run_shell_command / ShellTool
 return true;
 }

 if (command === parsed.arg || command.startsWith(parsed.arg + ' ')) {
 return true;
 }
 }
 return false;
}

interface CheckCommandPermissionsResult {
 allAllowed: boolean;
 disallowedCommands: string[];
 blockReason?: string;
 isHardDenial?: boolean;
 debug: {
 parseOk: boolean;
 parseReason?: string;
 commandsToValidate: string[];
 isWildcardBlocked: boolean;
 blockedByExclude?: { command: string };
 isWildcardAllowed: boolean;
 mode: 'default_deny' | 'default_allow';
 hasSpecificAllowedCommands: boolean;
 };
}

function simulateCheckCommandPermissions(params: {
 command: string;
 parse: ExampleCommand['parse'];
 coreTools: string[];
 excludeTools: string[];
 sessionAllowlist?: Set<string>;
}): CheckCommandPermissionsResult {
 const { command, parse, coreTools, excludeTools, sessionAllowlist } = params;

 if (!parse.ok) {
 return {
 allAllowed: false,
 disallowedCommands: [command],
 blockReason: 'Command rejected because it could not be parsed safely',
 isHardDenial: true,
 debug: {
 parseOk: false,
 parseReason: parse.reason,
 commandsToValidate: [],
 isWildcardBlocked: false,
 isWildcardAllowed: false,
 mode: sessionAllowlist ? 'default_deny' : 'default_allow',
 hasSpecificAllowedCommands: false,
 },
 };
 }

 const commandsToValidate = parse.segments.map(normalize).filter(Boolean);

 const excludeSet = new Set(excludeTools);
 const isWildcardBlocked = SHELL_TOOL_NAMES.some((name) => excludeSet.has(name));
 if (isWildcardBlocked) {
 return {
 allAllowed: false,
 disallowedCommands: commandsToValidate,
 blockReason: 'Shell tool is globally disabled in configuration',
 isHardDenial: true,
 debug: {
 parseOk: true,
 commandsToValidate,
 isWildcardBlocked: true,
 isWildcardAllowed: false,
 mode: sessionAllowlist ? 'default_deny' : 'default_allow',
 hasSpecificAllowedCommands: false,
 },
 };
 }

 for (const cmd of commandsToValidate) {
 if (matchesShellPatterns(cmd, [...excludeSet])) {
 return {
 allAllowed: false,
 disallowedCommands: [cmd],
 blockReason: `Command '${cmd}' is blocked by configuration`,
 isHardDenial: true,
 debug: {
 parseOk: true,
 commandsToValidate,
 isWildcardBlocked: false,
 blockedByExclude: { command: cmd },
 isWildcardAllowed: false,
 mode: sessionAllowlist ? 'default_deny' : 'default_allow',
 hasSpecificAllowedCommands: false,
 },
 };
 }
 }

 const isWildcardAllowed = SHELL_TOOL_NAMES.some((name) => coreTools.includes(name));
 if (isWildcardAllowed) {
 return {
 allAllowed: true,
 disallowedCommands: [],
 debug: {
 parseOk: true,
 commandsToValidate,
 isWildcardBlocked: false,
 isWildcardAllowed: true,
 mode: sessionAllowlist ? 'default_deny' : 'default_allow',
 hasSpecificAllowedCommands: false,
 },
 };
 }

 const disallowedCommands: string[] = [];

 if (sessionAllowlist) {
 const normalizedSessionAllowlist = new Set(
 [...sessionAllowlist].flatMap((cmd) =>
 SHELL_TOOL_NAMES.map((name) => `${name}(${normalize(cmd)})`),
 ),
 );

 for (const cmd of commandsToValidate) {
 const isSessionAllowed = matchesShellPatterns(cmd, [...normalizedSessionAllowlist]);
 if (isSessionAllowed) continue;

 const isGloballyAllowed = matchesShellPatterns(cmd, coreTools);
 if (isGloballyAllowed) continue;

 disallowedCommands.push(cmd);
 }

 if (disallowedCommands.length > 0) {
 return {
 allAllowed: false,
 disallowedCommands,
 blockReason: `Command(s) not on the global or session allowlist. Disallowed commands: ${disallowedCommands
 .map((c) => JSON.stringify(c))
 .join(', ')}`,
 isHardDenial: false,
 debug: {
 parseOk: true,
 commandsToValidate,
 isWildcardBlocked: false,
 isWildcardAllowed: false,
 mode: 'default_deny',
 hasSpecificAllowedCommands: false,
 },
 };
 }

 return {
 allAllowed: true,
 disallowedCommands: [],
 debug: {
 parseOk: true,
 commandsToValidate,
 isWildcardBlocked: false,
 isWildcardAllowed: false,
 mode: 'default_deny',
 hasSpecificAllowedCommands: false,
 },
 };
 }

 const hasSpecificAllowedCommands = coreTools.some((tool) =>
 SHELL_TOOL_NAMES.some((name) => tool.startsWith(`${name}(`)),
 );

 if (hasSpecificAllowedCommands) {
 for (const cmd of commandsToValidate) {
 const isGloballyAllowed = matchesShellPatterns(cmd, coreTools);
 if (!isGloballyAllowed) {
 disallowedCommands.push(cmd);
 }
 }
 if (disallowedCommands.length > 0) {
 return {
 allAllowed: false,
 disallowedCommands,
 blockReason: `Command(s) not in the allowed commands list. Disallowed commands: ${disallowedCommands
 .map((c) => JSON.stringify(c))
 .join(', ')}`,
 isHardDenial: false,
 debug: {
 parseOk: true,
 commandsToValidate,
 isWildcardBlocked: false,
 isWildcardAllowed: false,
 mode: 'default_allow',
 hasSpecificAllowedCommands: true,
 },
 };
 }
 }

 return {
 allAllowed: true,
 disallowedCommands: [],
 debug: {
 parseOk: true,
 commandsToValidate,
 isWildcardBlocked: false,
 isWildcardAllowed: false,
 mode: 'default_allow',
 hasSpecificAllowedCommands,
 },
 };
}

type CheckLayer =
 | 'parse'
 | 'exclude_tool_disabled'
 | 'exclude_pattern'
 | 'core_wildcard'
 | 'mode'
 | 'allowlist_check'
 | 'confirm_dialog';

interface CheckStep {
 layer: CheckLayer;
 title: string;
 description: string;
 codeSnippet: string;
 check: (state: {
 evaluation: CheckCommandPermissionsResult;
 contextMode: ContextMode;
 approvalMode: ApprovalMode;
 }) => { pass: boolean; result?: PermissionResult; reason?: string };
}

function StepBadge({
 result,
 isActive,
}: {
 result?: PermissionResult;
 isActive: boolean;
}) {
 const color =
 result === 'allowed'
 ? 'var(--color-primary)'
 : result === 'denied'
 ? 'var(--color-danger)'
 : result === 'ask'
 ? 'var(--color-warning)'
 : isActive
 ? 'var(--color-primary)'
 : 'var(--color-text-muted)';

 const label =
 result === 'allowed'
 ? '✓'
 : result === 'denied'
 ? '✕'
 : result === 'ask'
 ? '?'
 : isActive
 ? '►'
 : '·';

 return (
 <span
 className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${isActive ? 'animate-pulse' : ''}`}
 style={{ color, backgroundColor: `${color}20` }}
 >
 {label}
 </span>
 );
}

export function PermissionApprovalAnimation() {
 const [contextMode, setContextMode] = useState<ContextMode>('custom_command_injection');
 const [approvalMode, setApprovalMode] = useState<ApprovalMode>('default');
 const [presetId, setPresetId] = useState(CONFIG_PRESETS[0].id);
 const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

 const [sessionAllowlist, setSessionAllowlist] = useState<Set<string>>(
 () => new Set<string>(),
 );
 const [oneTimeAllowlist, setOneTimeAllowlist] = useState<Set<string> | null>(
 null,
 );

 const [currentStep, setCurrentStep] = useState(0);
 const [isPlaying, setIsPlaying] = useState(false);
 const [uiResult, setUiResult] = useState<PermissionResult>('pending');
 const [uiReason, setUiReason] = useState('');

 const preset = useMemo(
 () => CONFIG_PRESETS.find((p) => p.id === presetId) ?? CONFIG_PRESETS[0],
 [presetId],
 );

 const selected = EXAMPLE_COMMANDS[selectedCommandIndex] ?? EXAMPLE_COMMANDS[0];

 const effectiveSessionAllowlist = useMemo(() => {
 if (contextMode !== 'custom_command_injection') {
 return undefined;
 }

 if (!oneTimeAllowlist || oneTimeAllowlist.size === 0) {
 return new Set(sessionAllowlist);
 }

 return new Set([...sessionAllowlist, ...oneTimeAllowlist]);
 }, [contextMode, oneTimeAllowlist, sessionAllowlist]);

 const evaluation = useMemo(() => {
 return simulateCheckCommandPermissions({
 command: selected.cmd,
 parse: selected.parse,
 coreTools: preset.coreTools,
 excludeTools: preset.excludeTools,
 sessionAllowlist: effectiveSessionAllowlist,
 });
 }, [effectiveSessionAllowlist, preset.coreTools, preset.excludeTools, selected.cmd, selected.parse]);

 const steps: CheckStep[] = useMemo(() => {
 const base: CheckStep[] = [
 {
 layer: 'parse',
 title: '解析命令',
 description: '用 parseCommandDetails() 将命令拆成可验证的 segment；失败则 hard deny。',
 codeSnippet: `// gemini-cli/packages/core/src/utils/shell-permissions.ts:40
const parseResult = parseCommandDetails(command);
if (!parseResult || parseResult.hasError) {
 return {
 allAllowed: false,
 disallowedCommands: [command],
 blockReason: 'Command rejected because it could not be parsed safely',
 isHardDenial: true,
 };
}`,
 check: ({ evaluation: e }) => {
 if (!e.debug.parseOk) {
 return { pass: false, result: 'denied', reason: e.blockReason };
 }
 return { pass: true };
 },
 },
 {
 layer: 'exclude_tool_disabled',
 title: '全局禁用检查',
 description:
 '如果 tools.exclude 直接禁用了 run_shell_command/ShellTool，则所有 shell 命令 hard deny。',
 codeSnippet: `// gemini-cli/packages/core/src/utils/shell-permissions.ts:73
const excludeTools = config.getExcludeTools() || new Set([]);
const isWildcardBlocked = SHELL_TOOL_NAMES.some((name) => excludeTools.has(name));
if (isWildcardBlocked) {
 return {
 allAllowed: false,
 disallowedCommands: commandsToValidate,
 blockReason: 'Shell tool is globally disabled in configuration',
 isHardDenial: true,
 };
}`,
 check: ({ evaluation: e }) => {
 if (e.debug.isWildcardBlocked) {
 return { pass: false, result: 'denied', reason: e.blockReason };
 }
 return { pass: true };
 },
 },
 {
 layer: 'exclude_pattern',
 title: 'tools.exclude 匹配',
 description:
 '逐段匹配 tools.exclude 的 run_shell_command(...) 前缀模式；命中则 hard deny。',
 codeSnippet: `// gemini-cli/packages/core/src/utils/shell-permissions.ts:89
for (const cmd of commandsToValidate) {
 invocation.params['command'] = cmd;
 if (doesToolInvocationMatch('run_shell_command', invocation, [...excludeTools])) {
 return {
 allAllowed: false,
 disallowedCommands: [cmd],
 blockReason: \`Command '\${cmd}' is blocked by configuration\`,
 isHardDenial: true,
 };
 }
}`,
 check: ({ evaluation: e }) => {
 if (e.debug.blockedByExclude) {
 return { pass: false, result: 'denied', reason: e.blockReason };
 }
 return { pass: true };
 },
 },
 {
 layer: 'core_wildcard',
 title: 'tools.core 通配允许',
 description:
 '如果 tools.core 包含 run_shell_command/ShellTool（通配），则通过 blocklist 后全部允许。',
 codeSnippet: `// gemini-cli/packages/core/src/utils/shell-permissions.ts:109
const coreTools = config.getCoreTools() || [];
const isWildcardAllowed = SHELL_TOOL_NAMES.some((name) => coreTools.includes(name));
if (isWildcardAllowed) {
 return { allAllowed: true, disallowedCommands: [] };
}`,
 check: ({ evaluation: e }) => {
 if (e.debug.isWildcardAllowed) {
 return { pass: false, result: 'allowed' };
 }
 return { pass: true };
 },
 },
 {
 layer: 'mode',
 title: '选择模式',
 description:
 '是否提供 sessionAllowlist 决定 default deny / default allow 两种模式。',
 codeSnippet: `// gemini-cli/packages/core/src/utils/shell-permissions.ts:124
if (sessionAllowlist) {
 // DEFAULT DENY MODE
} else {
 // DEFAULT ALLOW MODE
}`,
 check: () => ({ pass: true }),
 },
 {
 layer: 'allowlist_check',
 title: 'Allowlist 判定',
 description:
 'default deny：每段必须在 sessionAllowlist 或 tools.core；default allow：仅当 tools.core 出现 run_shell_command(...) 才启用严格 allowlist。',
 codeSnippet: `// default deny: gemini-cli/packages/core/src/utils/shell-permissions.ts:129
const normalizedSessionAllowlist = new Set(
 [...sessionAllowlist].flatMap((cmd) =>
 SHELL_TOOL_NAMES.map((name) => \`\${name}(\${cmd})\`),
 ),
);

// default allow (strict only if coreTools has run_shell_command(...)):
const hasSpecificAllowedCommands = coreTools.filter((tool) =>
 SHELL_TOOL_NAMES.some((name) => tool.startsWith(\`\${name}(\`)),
).length > 0;`,
 check: ({ evaluation: e, contextMode: mode, approvalMode: approval }) => {
 if (e.allAllowed) {
 return { pass: false, result: 'allowed' };
 }
 if (e.isHardDenial) {
 return { pass: false, result: 'denied', reason: e.blockReason };
 }

 if (mode === 'custom_command_injection') {
 if (approval === 'yolo') {
 return {
 pass: false,
 result: 'allowed',
 reason: 'YOLO：对软拒绝不弹确认（仍无法绕过硬拒绝）',
 };
 }
 return {
 pass: true,
 result: 'ask',
 reason: '软拒绝：需要 ShellConfirmationDialog（Allow once / session）',
 };
 }

 return {
 pass: false,
 result: 'denied',
 reason:
 e.blockReason ||
 'Soft denial in default allow mode: adjust tools.core allowlist.',
 };
 },
 },
 ];

 if (contextMode === 'custom_command_injection') {
 base.push({
 layer: 'confirm_dialog',
 title: 'ShellConfirmationDialog',
 description:
 '仅用于自定义命令注入：Allow once → one-time allowlist；Allow for session → 写入 sessionShellAllowlist。',
 codeSnippet: `// gemini-cli/packages/cli/src/ui/components/ShellConfirmationDialog.tsx:33
const options = [
 { label: 'Allow once', value: ToolConfirmationOutcome.ProceedOnce },
 { label: 'Allow for this session', value: ToolConfirmationOutcome.ProceedAlways },
 { label: 'No (esc)', value: ToolConfirmationOutcome.Cancel },
];`,
 check: ({ evaluation: e, approvalMode: approval }) => {
 if (e.allAllowed || e.isHardDenial || approval === 'yolo') {
 return { pass: false };
 }
 return { pass: false, result: 'ask', reason: '等待用户选择…' };
 },
 });
 }

 return base;
 }, [contextMode]);

 const resetPlayhead = useCallback(() => {
 setIsPlaying(false);
 setCurrentStep(0);
 setUiResult('pending');
 setUiReason('');
 }, []);

 const updateAllResultsForStep = useCallback(() => {
 const step = steps[currentStep];
 if (!step) return;

 const r = step.check({ evaluation, contextMode, approvalMode });
 setUiResult(r.result ?? 'pending');
 setUiReason(r.reason ?? '');
 }, [approvalMode, contextMode, currentStep, evaluation, steps]);

 useEffect(() => {
 updateAllResultsForStep();
 }, [updateAllResultsForStep]);

 useEffect(() => {
 if (!isPlaying) return;

 const timer = setTimeout(() => {
 const step = steps[currentStep];
 if (!step) {
 setIsPlaying(false);
 return;
 }

 const r = step.check({ evaluation, contextMode, approvalMode });
 setUiResult(r.result ?? 'pending');
 setUiReason(r.reason ?? '');

 if (!r.pass || currentStep >= steps.length - 1) {
 setIsPlaying(false);
 return;
 }

 setCurrentStep((s) => s + 1);
 }, 1300);

 return () => clearTimeout(timer);
 }, [approvalMode, contextMode, currentStep, evaluation, isPlaying, steps]);

 const handleSelectCommand = useCallback((index: number) => {
 setSelectedCommandIndex(index);
 setOneTimeAllowlist(null);
 resetPlayhead();
 }, [resetPlayhead]);

 const handleChangePreset = useCallback((nextId: string) => {
 setPresetId(nextId);
 setSessionAllowlist(new Set());
 setOneTimeAllowlist(null);
 resetPlayhead();
 }, [resetPlayhead]);

 const confirmationVisible = useMemo(() => {
 if (contextMode !== 'custom_command_injection') return false;
 if (approvalMode === 'yolo') return false;
 if (evaluation.allAllowed) return false;
 if (evaluation.isHardDenial) return false;
 return true;
 }, [approvalMode, contextMode, evaluation.allAllowed, evaluation.isHardDenial]);

 const handleAllowOnce = useCallback(() => {
 if (!confirmationVisible) return;
 setOneTimeAllowlist(new Set(evaluation.disallowedCommands));
 resetPlayhead();
 }, [confirmationVisible, evaluation.disallowedCommands, resetPlayhead]);

 const handleAllowSession = useCallback(() => {
 if (!confirmationVisible) return;
 setSessionAllowlist((prev) => new Set([...prev, ...evaluation.disallowedCommands]));
 setOneTimeAllowlist(null);
 resetPlayhead();
 }, [confirmationVisible, evaluation.disallowedCommands, resetPlayhead]);

 const handleCancel = useCallback(() => {
 setOneTimeAllowlist(null);
 setIsPlaying(false);
 setUiResult('denied');
 setUiReason('User selected No / Esc');
 }, []);

 const currentStepData = steps[currentStep];

 return (
 <div className="space-y-8">
 <Layer title="目标">
 <div className="space-y-4 text-sm text-body">
 <p>
 这一页把 Gemini CLI 的 shell “权限/审批”拆成两个层次：
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="层 1：命令限制（checkCommandPermissions）" variant="yellow">
 <ul className="list-disc pl-5 space-y-1">
 <li>基于 <code>tools.exclude</code> 做 hard deny（最高优先级）</li>
 <li>根据是否传入 <code>sessionAllowlist</code>，切换 default deny / default allow</li>
 <li>把链式命令拆成多个 segment，逐段匹配</li>
 </ul>
 </HighlightBox>
 <HighlightBox title="层 2：用户确认（仅限自定义命令注入）" variant="purple">
 <ul className="list-disc pl-5 space-y-1">
 <li>软拒绝（soft denial）在非 YOLO 下弹 <code>ShellConfirmationDialog</code></li>
 <li>Allow once：只对这次调用生效（one-time allowlist）</li>
 <li>Allow for session：写入 <code>sessionShellAllowlist</code></li>
 </ul>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 <Layer title="交互面板">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="bg-elevated rounded-lg p-4 border border-edge space-y-3">
 <div className="text-sm font-bold text-heading">场景</div>
 <div className="flex gap-2">
 <button
 onClick={() => {
 setContextMode('custom_command_injection');
 resetPlayhead();
 }}
 className={`px-3 py-2 rounded text-sm border ${contextMode === 'custom_command_injection'
 ? ' bg-elevated/15 text-heading border-edge/40'
 : 'bg-base text-body border-edge'
 }`}
 >
 自定义命令注入
 </button>
 <button
 onClick={() => {
 setContextMode('run_shell_command_tool');
 resetPlayhead();
 }}
 className={`px-3 py-2 rounded text-sm border ${contextMode === 'run_shell_command_tool'
 ? ' bg-elevated/15 text-heading border-edge/40'
 : 'bg-base text-body border-edge'
 }`}
 >
 run_shell_command tool
 </button>
 </div>

 <div className="text-sm font-bold text-heading mt-2">approval mode</div>
 <div className="flex gap-2">
 {(['default', 'auto_edit', 'yolo'] as const).map((m) => (
 <button
 key={m}
 onClick={() => {
 setApprovalMode(m);
 resetPlayhead();
 }}
 className={`px-3 py-2 rounded text-sm border ${approvalMode === m
 ? 'bg-elevated text-heading border-edge/40'
 : 'bg-base text-body border-edge'
 }`}
 >
 {m}
 </button>
 ))}
 </div>
 <div className="text-xs text-dim">
 注：对自定义命令注入而言，只有 <code>yolo</code> 会跳过软拒绝确认；hard deny 仍不可绕过。
 </div>
 </div>

 <div className="bg-elevated rounded-lg p-4 border border-edge space-y-3">
 <div className="text-sm font-bold text-heading">配置预设</div>
 <div className="space-y-2">
 {CONFIG_PRESETS.map((p) => (
 <button
 key={p.id}
 onClick={() => handleChangePreset(p.id)}
 className={`w-full text-left px-3 py-2 rounded border ${presetId === p.id
 ? ' bg-elevated/10 text-heading border-edge/40'
 : 'bg-base text-body border-edge'
 }`}
 >
 <div className="text-sm font-mono">{p.title}</div>
 <div className="text-xs text-dim mt-1">{p.description}</div>
 </button>
 ))}
 </div>
 </div>

 <div className="bg-elevated rounded-lg p-4 border border-edge space-y-3">
 <div className="text-sm font-bold text-heading">当前状态</div>
 <div className="text-xs font-mono space-y-2">
 <div>
 <div className="text-dim mb-1">tools.exclude</div>
 <div className="flex flex-wrap gap-1">
 {preset.excludeTools.length > 0 ? (
 preset.excludeTools.map((t) => (
 <span key={t} className="px-2 py-0.5 rounded bg-[var(--color-danger)]/15 text-heading">
 {t}
 </span>
 ))
 ) : (
 <span className="text-dim">(empty)</span>
 )}
 </div>
 </div>
 <div>
 <div className="text-dim mb-1">tools.core</div>
 <div className="flex flex-wrap gap-1">
 {preset.coreTools.length > 0 ? (
 preset.coreTools.map((t) => (
 <span key={t} className="px-2 py-0.5 rounded bg-elevated/15 text-heading">
 {t}
 </span>
 ))
 ) : (
 <span className="text-dim">(unset)</span>
 )}
 </div>
 </div>
 <div>
 <div className="text-dim mb-1">sessionShellAllowlist</div>
 <div className="flex flex-wrap gap-1">
 {contextMode !== 'custom_command_injection' ? (
 <span className="text-dim">(not used)</span>
 ) : sessionAllowlist.size > 0 ? (
 [...sessionAllowlist].map((t) => (
 <span key={t} className="px-2 py-0.5 rounded bg-elevated/15 text-heading">
 {t}
 </span>
 ))
 ) : (
 <span className="text-dim">(empty)</span>
 )}
 </div>
 </div>
 {oneTimeAllowlist && oneTimeAllowlist.size > 0 && (
 <div>
 <div className="text-dim mb-1">oneTimeShellAllowlist</div>
 <div className="flex flex-wrap gap-1">
 {[...oneTimeAllowlist].map((t) => (
 <span key={t} className="px-2 py-0.5 rounded bg-elevated text-heading">
 {t}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </Layer>

 <Layer title="命令选择">
 <div className="flex flex-wrap gap-2">
 {EXAMPLE_COMMANDS.map((c, i) => (
 <button
 key={c.cmd}
 onClick={() => handleSelectCommand(i)}
 className={`px-3 py-2 rounded-lg text-sm font-mono transition-all duration-200 border ${selectedCommandIndex === i
 ? ' bg-elevated/15 text-heading border-edge/40'
 : 'bg-base text-body border-edge'
 }`}
 >
 <code>{c.cmd}</code>
 <div className="text-xs text-dim mt-1">{c.desc}</div>
 </button>
 ))}
 </div>
 </Layer>

 <Layer title="动画">
 <div className="flex items-center justify-between bg-elevated rounded-lg p-3 border border-edge mb-4">
 <div className="flex items-center gap-2">
 <button
 onClick={resetPlayhead}
 className="px-3 py-1.5 rounded bg-base text-body hover:text-heading border border-edge text-sm"
 >
 ↺ 重置
 </button>
 <button
 onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
 disabled={currentStep === 0}
 className="px-3 py-1.5 rounded bg-base text-body hover:text-heading border border-edge text-sm disabled:opacity-50"
 >
 ← 上一步
 </button>
 <button
 onClick={() => setIsPlaying((p) => !p)}
 className={`px-4 py-1.5 rounded text-sm font-medium border ${isPlaying
 ? 'bg-elevated text-heading border-edge/40'
 : ' bg-elevated/20 text-heading border-edge-hover'
 }`}
 >
 {isPlaying ? '⏸ 暂停' : '▶ 播放'}
 </button>
 <button
 onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
 disabled={currentStep === steps.length - 1}
 className="px-3 py-1.5 rounded bg-base text-body hover:text-heading border border-edge text-sm disabled:opacity-50"
 >
 下一步 →
 </button>
 </div>

 <div
 className={`
 px-4 py-1.5 rounded-lg text-sm font-bold
 ${uiResult === 'allowed' ? ' bg-elevated/20 text-heading' : ''}
 ${uiResult === 'denied' ? 'bg-elevated text-heading' : ''}
 ${uiResult === 'ask' ? 'bg-elevated text-heading' : ''}
 ${uiResult === 'pending' ? 'bg-base text-dim' : ''}
 `}
 >
 {uiResult === 'allowed' && '✓ ALLOWED'}
 {uiResult === 'denied' && '✕ DENIED'}
 {uiResult === 'ask' && '? ASK USER'}
 {uiResult === 'pending' && '…'}
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="text-sm font-bold text-heading mb-3">检查步骤</div>
 <div className="space-y-2">
 {steps.map((s, i) => {
 const isActive = i === currentStep;
 const isPast = i < currentStep;
 const stepResult = isActive
 ? s.check({ evaluation, contextMode, approvalMode }).result
 : isPast
 ? undefined
 : undefined;

 return (
 <div
 key={s.layer}
 className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${isActive
 ? ' bg-elevated border-edge-hover'
 : 'bg-base/20 border-transparent'
 }`}
 style={{ opacity: isPast ? 0.7 : 1 }}
 >
 <StepBadge result={stepResult} isActive={isActive} />
 <div className="min-w-0">
 <div className="text-sm font-mono text-heading">{s.title}</div>
 <div className="text-xs text-dim mt-1">{s.description}</div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 <div className="space-y-4">
 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="text-sm font-bold text-heading mb-3">当前步骤源码</div>
 <CodeBlock
 code={currentStepData?.codeSnippet || ''}
 language="typescript"
 title={currentStepData?.title || ''}
 />
 </div>

 <div className="bg-base rounded-lg p-4 border border-edge">
 <div className="text-sm font-bold text-heading mb-3">本次评估结果</div>
 <JsonBlock
 code={JSON.stringify(
 {
 command: selected.cmd,
 contextMode,
 approvalMode,
 commandsToValidate: evaluation.debug.commandsToValidate,
 mode: evaluation.debug.mode,
 allAllowed: evaluation.allAllowed,
 isHardDenial: evaluation.isHardDenial,
 disallowedCommands: evaluation.disallowedCommands,
 blockReason: evaluation.blockReason,
 },
 null,
 2,
 )}
 />
 {uiReason && (
 <div className="text-xs text-dim mt-2">
 reason: <span className="text-body">{uiReason}</span>
 </div>
 )}
 </div>
 </div>
 </div>

 {confirmationVisible && (
 <div className="mt-4 bg-elevated rounded-lg p-4 border border-edge">
 <div className="text-sm font-bold text-heading mb-2">
 ShellConfirmationDialog（模拟）
 </div>
 <div className="text-xs text-dim mb-3">
 disallowedCommands: <code className="px-1 bg-base/30 rounded">{evaluation.disallowedCommands.join(', ')}</code>
 </div>
 <div className="flex flex-wrap gap-2">
 <button
 onClick={handleAllowOnce}
 className="px-3 py-2 rounded border bg-elevated text-heading border-edge/40 text-sm"
 >
 Allow once
 </button>
 <button
 onClick={handleAllowSession}
 className="px-3 py-2 rounded border bg-elevated/10 text-heading border-edge/40 text-sm"
 >
 Allow for this session
 </button>
 <button
 onClick={handleCancel}
 className="px-3 py-2 rounded border bg-elevated text-heading border-edge/40 text-sm"
 >
 No (esc)
 </button>
 </div>
 </div>
 )}
 </Layer>

 <Layer title="关键结论">
 <div className="text-sm text-body space-y-2">
 <ul className="list-disc pl-5 space-y-1">
 <li><code>tools.exclude</code> 优先级最高：命中即 hard deny（无法通过确认绕过）</li>
 <li>
 自定义命令注入传入 <code>sessionAllowlist</code> → default deny：每个 segment 都必须被 allowlist 覆盖
 </li>
 <li>
 direct tool invocation 不传 <code>sessionAllowlist</code> → default allow；但当 <code>tools.core</code> 出现 <code>run_shell_command(...)</code> 模式时会进入 strict allowlist
 </li>
 <li>
 ShellConfirmationDialog 只用于自定义命令注入的软拒绝；<code>run_shell_command</code> 工具调用是否需要确认由工具审批/策略引擎决定
 </li>
 </ul>
 </div>
 </Layer>
 </div>
 );
}

