import { useState, useCallback } from 'react';

/**
 * ShellProcessor 动画
 *
 * 可视化 shellProcessor.ts 的核心逻辑：
 * 1. Shell 注入语法解析 (!{...})
 * 2. 参数占位符替换 ({{args}})
 * 3. 参数转义处理
 * 4. 权限检查流程
 * 5. 命令执行与结果注入
 *
 * 源码位置:
 * - packages/cli/src/services/prompt-processors/shellProcessor.ts
 */

interface ParsedInjection {
  startIndex: number;
  endIndex: number;
  content: string;
  resolvedCommand: string;
}

interface ProcessStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
  detail?: string;
}

interface AnimationState {
  rawPrompt: string;
  userArgs: string;
  escapedArgs: string;
  injections: ParsedInjection[];
  currentStep: number;
  steps: ProcessStep[];
  finalPrompt: string;
  executionOutput: string;
  permissionStatus: 'pending' | 'allowed' | 'denied' | 'confirm_required';
  message: string;
}

type DemoApprovalMode = 'default' | 'yolo';

const normalizeShellCommand = (cmd: string) => cmd.trim().replace(/\s+/g, ' ');

// 近似模拟 packages/core/src/utils/shell-permissions.ts 的“硬拒绝/软拒绝”决策形态（用于动画演示）
const checkCommandPermissionsDemo = (
  command: string,
  opts: { sessionAllowlist: Set<string> },
): {
  allAllowed: boolean;
  disallowedCommands: string[];
  blockReason?: string;
  isHardDenial?: boolean;
} => {
  const normalized = normalizeShellCommand(command);

  // 简化的“解析失败”判定：以连接符结尾（&&/||/|/;），视作无法安全解析 → 硬拒绝
  if (/(&&|\|\||\||;)\s*$/.test(normalized)) {
    return {
      allAllowed: false,
      disallowedCommands: [normalized],
      blockReason: 'Command rejected because it could not be parsed safely',
      isHardDenial: true,
    };
  }

  // 简化拆分：把复合命令拆成若干子命令（真实实现使用更严格的 shell parser）
  const parts = normalized
    .split(/\s*(?:&&|\|\||\||;)\s*/)
    .map(normalizeShellCommand)
    .filter(Boolean);

  // 演示用 allowlist：可理解为 settings.json 的 coreTools/run_shell_command(...) 允许项
  const isGloballyAllowlisted = (cmd: string) => /^(git|find)\b/.test(cmd);

  // custom commands 的 shell 注入属于 “default deny”：必须命中 allowlist 才能自动通过
  const disallowed: string[] = [];
  for (const part of parts) {
    const normalizedPart = normalizeShellCommand(part);
    if (opts.sessionAllowlist.has(normalizedPart)) continue;
    if (isGloballyAllowlisted(normalizedPart)) continue;
    disallowed.push(normalizedPart);
  }

  if (disallowed.length > 0) {
    return {
      allAllowed: false,
      disallowedCommands: disallowed,
      blockReason: `Command(s) not on the global or session allowlist. Disallowed commands: ${disallowed
        .map((c) => JSON.stringify(c))
        .join(', ')}`,
      isHardDenial: false,
    };
  }

  return { allAllowed: true, disallowedCommands: [] };
};

const EXAMPLES = [
  {
    name: '基础命令注入',
    prompt: '当前 Git 状态:\n!{git status}',
    args: '',
  },
  {
    name: '带参数的命令',
    prompt: '搜索文件 {{args}}:\n!{find . -name "{{args}}"}',
    args: '*.ts',
  },
  {
    name: '多个注入点',
    prompt: '分支信息:\n!{git branch -a}\n\n最近提交:\n!{git log --oneline -5}',
    args: '',
  },
  {
    name: '危险命令 (需确认)',
    prompt: '删除文件:\n!{rm -rf {{args}}}',
    args: 'temp/',
  },
  {
    name: '解析失败 (硬拒绝)',
    prompt: '无法安全解析:\n!{git status &&}',
    args: '',
  },
];

export default function ShellInjectionProcessorAnimation() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [selectedApprovalMode, setSelectedApprovalMode] = useState<DemoApprovalMode>('default');
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState<AnimationState>({
    rawPrompt: EXAMPLES[0].prompt,
    userArgs: EXAMPLES[0].args,
    escapedArgs: '',
    injections: [],
    currentStep: -1,
    steps: [
      { id: 'detect', label: '检测注入语法', status: 'pending' },
      { id: 'escape', label: '转义用户参数', status: 'pending' },
      { id: 'resolve', label: '解析注入内容', status: 'pending' },
      { id: 'permission', label: '权限检查', status: 'pending' },
      { id: 'execute', label: '执行命令', status: 'pending' },
      { id: 'assemble', label: '组装结果', status: 'pending' },
    ],
    finalPrompt: '',
    executionOutput: '',
    permissionStatus: 'pending',
    message: '选择示例后点击开始',
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const escapeShellArg = (arg: string): string => {
    // 简化的 shell 参数转义
    if (arg === '') return "''";
    if (!/[^a-zA-Z0-9,._+:@%/-]/.test(arg)) return arg;
    return `'${arg.replace(/'/g, "'\\''")}'`;
  };

  const extractInjections = (text: string, trigger: string): ParsedInjection[] => {
    const results: ParsedInjection[] = [];
    let i = 0;

    while (i < text.length) {
      const triggerIndex = text.indexOf(trigger, i);
      if (triggerIndex === -1) break;

      const start = triggerIndex + trigger.length;
      let depth = 1;
      let j = start;

      while (j < text.length && depth > 0) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}') depth--;
        j++;
      }

      if (depth === 0) {
        const content = text.substring(start, j - 1);
        results.push({
          startIndex: triggerIndex,
          endIndex: j,
          content,
          resolvedCommand: content,
        });
      }

      i = j;
    }

    return results;
  };

  const runAnimation = useCallback(async () => {
    setIsRunning(true);
    const example = EXAMPLES[selectedExample];
    const rawPrompt = example.prompt;
    const userArgs = example.args;

    // 重置状态
    setState(s => ({
      ...s,
      rawPrompt,
      userArgs,
      escapedArgs: '',
      injections: [],
      currentStep: 0,
      steps: s.steps.map(step => ({ ...step, status: 'pending' })),
      finalPrompt: '',
      executionOutput: '',
      permissionStatus: 'pending',
      message: '开始处理...',
    }));
    await sleep(500);

    // 步骤1: 检测注入语法
    setState(s => ({
      ...s,
      steps: s.steps.map((step, i) => i === 0 ? { ...step, status: 'active' } : step),
      message: '检测 !{...} 注入语法',
    }));
    await sleep(800);

    const injections = extractInjections(rawPrompt, '!{');

    if (injections.length === 0) {
      setState(s => ({
        ...s,
        steps: s.steps.map((step, i) => i === 0 ? { ...step, status: 'done', detail: '未找到注入点' } : step),
        finalPrompt: rawPrompt.replace(/\{\{args\}\}/g, userArgs),
        currentStep: 5,
        message: '无注入点，直接替换 {{args}} 并返回',
      }));
      setIsRunning(false);
      return;
    }

    setState(s => ({
      ...s,
      steps: s.steps.map((step, i) => i === 0 ? { ...step, status: 'done', detail: `找到 ${injections.length} 个注入点` } : step),
      injections,
      message: `发现 ${injections.length} 个 !{...} 注入点`,
    }));
    await sleep(800);

    // 步骤2: 转义用户参数
    setState(s => ({
      ...s,
      currentStep: 1,
      steps: s.steps.map((step, i) => i === 1 ? { ...step, status: 'active' } : step),
      message: '转义用户参数以防止命令注入',
    }));
    await sleep(600);

    const escapedArgs = escapeShellArg(userArgs);
    setState(s => ({
      ...s,
      escapedArgs,
      steps: s.steps.map((step, i) => i === 1 ? { ...step, status: 'done', detail: `"${userArgs}" → ${escapedArgs}` } : step),
      message: `转义完成: "${userArgs}" → ${escapedArgs}`,
    }));
    await sleep(800);

    // 步骤3: 解析注入内容
    setState(s => ({
      ...s,
      currentStep: 2,
      steps: s.steps.map((step, i) => i === 2 ? { ...step, status: 'active' } : step),
      message: '替换命令中的 {{args}} 占位符',
    }));
    await sleep(600);

    const resolvedInjections = injections.map(inj => ({
      ...inj,
      resolvedCommand: inj.content.replace(/\{\{args\}\}/g, escapedArgs),
    }));

    setState(s => ({
      ...s,
      injections: resolvedInjections,
      steps: s.steps.map((step, i) => i === 2 ? { ...step, status: 'done' } : step),
      message: '命令解析完成',
    }));
    await sleep(600);

    // 步骤4: 权限检查
    setState(s => ({
      ...s,
      currentStep: 3,
      steps: s.steps.map((step, i) => i === 3 ? { ...step, status: 'active' } : step),
      message: '检查命令权限...',
    }));
    await sleep(800);

    // 演示：假设本会话已经 allowlist 了一些常用命令（否则默认模式下也会要求确认）
    const sessionAllowlist = new Set<string>(
      [
        'git status',
        'git branch -a',
        'git log --oneline -5',
        'find . -name "*.ts"',
      ].map(normalizeShellCommand),
    );

    const commandsToConfirm = new Set<string>();

    for (const inj of resolvedInjections) {
      const command = inj.resolvedCommand?.trim();
      if (!command) continue;

      const { allAllowed, disallowedCommands, blockReason, isHardDenial } =
        checkCommandPermissionsDemo(command, { sessionAllowlist });

      if (!allAllowed) {
        if (isHardDenial) {
          setState(s => ({
            ...s,
            permissionStatus: 'denied',
            steps: s.steps.map((step, i) => {
              if (i === 3) return { ...step, status: 'error', detail: '硬拒绝（DENY）' };
              if (i > 3) return { ...step, status: 'pending' };
              return step;
            }),
            message: `❌ 硬拒绝：${blockReason ?? 'Blocked by configuration'}`,
            finalPrompt: `❌ 命令被拒绝\n\n${blockReason ?? ''}\n\nCommand: ${command}`.trim(),
            currentStep: 5,
          }));
          setIsRunning(false);
          return;
        }

        // YOLO 模式会自动批准软拒绝；默认模式下会抛 ConfirmationRequiredError
        if (selectedApprovalMode !== 'yolo') {
          disallowedCommands.forEach((c) => commandsToConfirm.add(c));
        }
      }
    }

    if (commandsToConfirm.size > 0) {
      const list = Array.from(commandsToConfirm).join('\n');
      setState(s => ({
        ...s,
        permissionStatus: 'confirm_required',
        steps: s.steps.map((step, i) => {
          if (i === 3) return { ...step, status: 'error', detail: '需要用户确认' };
          if (i > 3) return { ...step, status: 'pending' };
          return step;
        }),
        message: '⚠️ checkCommandPermissions: 命令不在 allowlist，需要用户确认（ConfirmationRequiredError）',
        finalPrompt: `❌ 命令执行被暂停（待确认）\n\n需要确认的子命令:\n${list}`,
        currentStep: 5,
      }));
      setIsRunning(false);
      return;
    }

    setState(s => ({
      ...s,
      permissionStatus: 'allowed',
      steps: s.steps.map((step, i) =>
        i === 3
          ? {
              ...step,
              status: 'done',
              detail:
                selectedApprovalMode === 'yolo'
                  ? 'YOLO：软拒绝自动放行'
                  : '权限检查通过',
            }
          : step,
      ),
      message:
        selectedApprovalMode === 'yolo'
          ? '✅ YOLO 模式：软拒绝自动放行，继续执行'
          : '✅ 权限检查通过',
    }));
    await sleep(600);

    // 步骤5: 执行命令
    setState(s => ({
      ...s,
      currentStep: 4,
      steps: s.steps.map((step, i) => i === 4 ? { ...step, status: 'active' } : step),
      message: '执行 Shell 命令...',
    }));
    await sleep(1000);

    // 模拟命令输出
    const mockOutputs: Record<string, string> = {
      'git status': 'On branch main\nYour branch is up to date.\n\nnothing to commit, working tree clean',
      'git branch -a': '* main\n  remotes/origin/main\n  remotes/origin/feature/auth',
      'git log --oneline -5': 'a1b2c3d feat: add new feature\ne4f5g6h fix: resolve bug\ni7j8k9l docs: update README',
      'find . -name "*.ts"': './src/index.ts\n./src/app.ts\n./src/utils/helper.ts',
    };

    let executionOutput = '';
    for (const inj of resolvedInjections) {
      const output = mockOutputs[inj.resolvedCommand] ||
        mockOutputs[inj.content] ||
        `[执行: ${inj.resolvedCommand}]\n(模拟输出)`;
      executionOutput += output + '\n';
    }

    setState(s => ({
      ...s,
      executionOutput: executionOutput.trim(),
      steps: s.steps.map((step, i) => i === 4 ? { ...step, status: 'done' } : step),
      message: '命令执行完成',
    }));
    await sleep(800);

    // 步骤6: 组装最终结果
    setState(s => ({
      ...s,
      currentStep: 5,
      steps: s.steps.map((step, i) => i === 5 ? { ...step, status: 'active' } : step),
      message: '组装最终 Prompt...',
    }));
    await sleep(600);

    // 构建最终输出
    let finalPrompt = '';
    let lastIndex = 0;
    let outputIndex = 0;
    const outputs = executionOutput.split('\n\n');

    for (const inj of resolvedInjections) {
      // 添加注入点之前的文本，替换 {{args}} 为原始参数
      const segment = rawPrompt.substring(lastIndex, inj.startIndex);
      finalPrompt += segment.replace(/\{\{args\}\}/g, userArgs);

      // 添加命令输出
      finalPrompt += mockOutputs[inj.resolvedCommand] || mockOutputs[inj.content] || outputs[outputIndex] || '';
      outputIndex++;
      lastIndex = inj.endIndex;
    }

    // 添加剩余文本
    finalPrompt += rawPrompt.substring(lastIndex).replace(/\{\{args\}\}/g, userArgs);

    setState(s => ({
      ...s,
      finalPrompt,
      steps: s.steps.map((step, i) => i === 5 ? { ...step, status: 'done' } : step),
      message: '✅ 处理完成！',
    }));

    setIsRunning(false);
  }, [selectedApprovalMode, selectedExample]);

  const handleExampleChange = (index: number) => {
    setSelectedExample(index);
    const example = EXAMPLES[index];
    setState(s => ({
      ...s,
      rawPrompt: example.prompt,
      userArgs: example.args,
      escapedArgs: '',
      injections: [],
      currentStep: -1,
      steps: s.steps.map(step => ({ ...step, status: 'pending', detail: undefined })),
      finalPrompt: '',
      executionOutput: '',
      permissionStatus: 'pending',
      message: '选择示例后点击开始',
    }));
  };

  const panelClassName = 'rounded-lg border border-edge bg-base p-4';
  const insetClassName = 'rounded-lg border border-edge bg-elevated p-3';
  const inputClassName =
    'rounded border border-edge bg-base px-3 py-1 text-sm text-body transition-colors focus:border-accent focus:outline-none';
  const statusCardClassName = (status: ProcessStep['status']) => {
    switch (status) {
      case 'active':
        return 'border-[var(--color-info)] bg-[var(--color-info-soft)] scale-105';
      case 'done':
        return 'border-[var(--color-success)] bg-[var(--color-success-soft)]';
      case 'error':
        return 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]';
      default:
        return 'border-edge bg-elevated/70';
    }
  };
  const statusBadgeClassName = (status: ProcessStep['status']) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--color-info)] text-black';
      case 'done':
        return 'bg-[var(--color-success)] text-black';
      case 'error':
        return 'bg-[var(--color-danger)] text-white';
      default:
        return 'bg-muted text-dim';
    }
  };
  const permissionStateClassName = {
    allowed: 'border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]',
    denied: 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
    confirm_required:
      'border-[var(--color-warning)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
    pending: 'border-edge bg-elevated/70 text-dim',
  } as const;

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="border-b border-edge pb-4">
        <h1 className="mb-2 text-2xl font-bold text-heading">Shell 命令注入处理器动画</h1>
        <p className="text-sm text-body">
          可视化 ShellProcessor: !&#123;...&#125; 语法解析、参数转义、权限检查、命令执行
        </p>
        <p className="mt-1 text-xs text-dim">
          源码: packages/cli/src/services/prompt-processors/shellProcessor.ts
        </p>
      </div>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-body">示例:</span>
          <select
            value={selectedExample}
            onChange={(e) => handleExampleChange(Number(e.target.value))}
            disabled={isRunning}
            className={inputClassName}
          >
            {EXAMPLES.map((ex, i) => (
              <option key={i} value={i}>{ex.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-body">审批:</span>
          <select
            value={selectedApprovalMode}
            onChange={(e) => setSelectedApprovalMode(e.target.value as DemoApprovalMode)}
            disabled={isRunning}
            className={inputClassName}
          >
            <option value="default">default</option>
            <option value="yolo">yolo</option>
          </select>
        </div>
        <button
          onClick={runAnimation}
          disabled={isRunning}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isRunning
              ? 'cursor-not-allowed bg-muted text-dim'
              : 'bg-accent text-black hover:opacity-90'
          }`}
        >
          {isRunning ? '处理中...' : '开始演示'}
        </button>
      </div>

      {/* 处理步骤 */}
      <div className={panelClassName}>
        <h3 className="mb-4 font-semibold text-heading">处理流程</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {state.steps.map((step, i) => (
            <div
              key={step.id}
              className={`rounded-lg border p-3 transition-all duration-300 ${statusCardClassName(step.status)}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${statusBadgeClassName(step.status)}`}
                >
                  {i + 1}
                </span>
                <span className="truncate text-sm text-heading">{step.label}</span>
              </div>
              {step.detail && (
                <div className="mt-1 truncate text-xs text-dim">{step.detail}</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm font-mono text-[var(--color-info)]">{state.message}</div>
      </div>

      {/* 输入输出对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧: 原始 Prompt */}
        <div className="space-y-4">
          <div className={panelClassName}>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-heading">
              <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]"></span>
              原始 Prompt
            </h3>
            <pre className={`${insetClassName} overflow-x-auto whitespace-pre-wrap text-sm`}>
              {state.rawPrompt.split(/(!{[^}]*}|\{\{args\}\})/g).map((part, i) => {
                if (part.startsWith('!{')) {
                  return (
                    <span
                      key={i}
                      className="rounded px-1 text-accent"
                      style={{ backgroundColor: 'var(--color-accent-soft)' }}
                    >
                      {part}
                    </span>
                  );
                }
                if (part === '{{args}}') {
                  return (
                    <span
                      key={i}
                      className="rounded px-1 text-[var(--color-info)]"
                      style={{ backgroundColor: 'var(--color-info-soft)' }}
                    >
                      {part}
                    </span>
                  );
                }
                return <span key={i} className="text-body">{part}</span>;
              })}
            </pre>
          </div>

          {/* 用户参数 */}
          <div className={panelClassName}>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-heading">
              <span className="h-2 w-2 rounded-full bg-[var(--color-info)]"></span>
              用户参数
            </h3>
            <div className="space-y-2 font-mono text-sm">
              <div className={`${insetClassName} flex items-center justify-between p-2`}>
                <span className="text-dim">原始:</span>
                <span className="text-[var(--color-info)]">"{state.userArgs}"</span>
              </div>
              {state.escapedArgs && (
                <div className={`${insetClassName} flex items-center justify-between p-2`}>
                  <span className="text-dim">转义后:</span>
                  <span className="text-[var(--color-success)]">{state.escapedArgs}</span>
                </div>
              )}
            </div>
          </div>

          {/* 解析的注入点 */}
          {state.injections.length > 0 && (
            <div className={panelClassName}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-heading">
                <span className="h-2 w-2 rounded-full bg-accent"></span>
                解析的注入点 ({state.injections.length})
              </h3>
              <div className="space-y-2">
                {state.injections.map((inj, i) => (
                  <div key={i} className={`${insetClassName} text-sm font-mono`}>
                    <div className="mb-1 text-xs text-dim">位置: [{inj.startIndex}, {inj.endIndex}]</div>
                    <div className="text-accent">原始: {inj.content}</div>
                    {inj.content !== inj.resolvedCommand && (
                      <div className="mt-1 text-[var(--color-success)]">解析: {inj.resolvedCommand}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧: 处理结果 */}
        <div className="space-y-4">
          {/* 权限状态 */}
          <div className={panelClassName}>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-heading">
              <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]"></span>
              权限检查
            </h3>
            <div className={`rounded border p-3 ${permissionStateClassName[state.permissionStatus]}`}>
              <div className="flex items-center gap-2">
                {state.permissionStatus === 'allowed' && <span>✅ 允许执行</span>}
                {state.permissionStatus === 'denied' && <span>❌ 拒绝执行</span>}
                {state.permissionStatus === 'confirm_required' && <span>⚠️ 需要确认</span>}
                {state.permissionStatus === 'pending' && <span>⏳ 待检查</span>}
              </div>
            </div>
          </div>

          {/* 命令输出 */}
          {state.executionOutput && (
            <div className={panelClassName}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-heading">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]"></span>
                命令输出
              </h3>
              <pre
                className={`${insetClassName} overflow-x-auto whitespace-pre-wrap text-sm text-[var(--color-success)]`}
              >
                {state.executionOutput}
              </pre>
            </div>
          )}

          {/* 最终 Prompt */}
          {state.finalPrompt && (
            <div className={panelClassName}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-heading">
                <span className="h-2 w-2 rounded-full bg-accent"></span>
                最终 Prompt
              </h3>
              <pre className={`${insetClassName} overflow-x-auto whitespace-pre-wrap text-sm text-body`}>
                {state.finalPrompt}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 语法说明 */}
      <div className={panelClassName}>
        <h3 className="mb-3 font-semibold text-heading">Shell 注入语法</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className={insetClassName}>
            <div className="mb-2 font-mono text-accent">!&#123;command&#125;</div>
            <div className="text-body">
              Shell 注入触发器。花括号内的内容会作为 Shell 命令执行，输出替换到 Prompt 中。
            </div>
          </div>
          <div className={insetClassName}>
            <div className="mb-2 font-mono text-[var(--color-info)]">&#123;&#123;args&#125;&#125;</div>
            <div className="text-body">
              参数占位符。在 !&#123;&#125; 内部会被转义后的参数替换，外部则使用原始参数。
            </div>
          </div>
        </div>
      </div>

      {/* 安全说明 */}
      <div className={panelClassName}>
        <h3 className="mb-3 font-semibold text-heading">安全机制</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-[var(--color-success)]">✓</span>
            <div>
              <span className="text-heading">参数转义</span>
              <span className="ml-2 text-body">用户参数在 Shell 命令中会被 escapeShellArg() 转义，防止命令注入</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[var(--color-success)]">✓</span>
            <div>
              <span className="text-heading">权限检查</span>
              <span className="ml-2 text-body">checkCommandPermissions() 检查命令是否在白名单中</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[var(--color-success)]">✓</span>
            <div>
              <span className="text-heading">确认机制</span>
              <span className="ml-2 text-body">危险命令需要用户确认，抛出 ConfirmationRequiredError</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[var(--color-success)]">✓</span>
            <div>
              <span className="text-heading">YOLO 模式</span>
              <span className="ml-2 text-body">ApprovalMode.YOLO 时跳过确认，但硬拒绝命令仍然被阻止</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
