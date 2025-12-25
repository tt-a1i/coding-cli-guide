import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';

// 权限检查结果
type PermissionResult = 'allowed' | 'denied' | 'ask' | 'pending';

// 检查层级
type CheckLayer =
  | 'parse_command'
  | 'check_substitution'
  | 'check_blocklist'
  | 'check_wildcard_allow'
  | 'check_session_allowlist'
  | 'check_global_allowlist'
  | 'user_prompt'
  | 'decision_proceed_once'
  | 'decision_proceed_always'
  | 'decision_cancel';

// 权限状态
interface PermissionState {
  layer: CheckLayer;
  command: string;
  rootCommands: string[];
  sessionAllowlist: Set<string>;
  globalAllowlist: string[];
  blocklist: string[];
  result: PermissionResult;
  reason: string;
}

// 检查步骤定义
interface CheckStep {
  layer: CheckLayer;
  title: string;
  description: string;
  check: (state: PermissionState) => { pass: boolean; result?: PermissionResult; reason?: string };
  codeSnippet: string;
}

// 示例命令
const exampleCommands = [
  { cmd: 'ls -la', desc: '安全命令 (全局白名单)' },
  { cmd: 'rm -rf /', desc: '危险命令 (黑名单)' },
  { cmd: 'npm install axios', desc: '需要审批 (首次执行)' },
  { cmd: '$(cat /etc/passwd)', desc: '命令替换 (硬拒绝)' },
  { cmd: 'git status && git log', desc: '链式命令' },
];

// 多层检查流程
const checkSequence: CheckStep[] = [
  {
    layer: 'parse_command',
    title: '解析命令结构',
    description: '分割链式命令，提取根命令',
    check: () => ({ pass: true }),
    codeSnippet: `// shell-utils.ts:199-206
function getCommandRoots(command: string): string[] {
  // 分割链式命令 (&&, ||, ;)
  const segments = splitChainedCommands(command);

  // 提取每个段的根命令
  const roots = segments.map((seg) => {
    const tokens = parseShellTokens(seg);
    return tokens[0]; // 第一个 token 是根命令
  });

  return [...new Set(roots)]; // 去重
}

// 示例:
// "git add . && git commit -m 'msg'"
// → ["git", "git"] → ["git"]`,
  },
  {
    layer: 'check_substitution',
    title: '检测命令替换',
    description: '拒绝 $(), ``, 管道注入等危险模式',
    check: (state) => {
      const hasSubstitution = /\$\(|`|\|.*\$/.test(state.command);
      if (hasSubstitution) {
        return { pass: false, result: 'denied', reason: '检测到命令替换 (硬拒绝)' };
      }
      return { pass: true };
    },
    codeSnippet: `// shell-utils.ts:323-331
function detectCommandSubstitution(command: string): boolean {
  const dangerousPatterns = [
    /\\$\\(/,           // $(...)
    /\\\`/,             // \`...\`
    /\\|.*\\$/,         // | followed by $
    /;\\s*\\$/,         // ; followed by $
    /&&\\s*\\$/,        // && followed by $
  ];

  return dangerousPatterns.some((p) => p.test(command));
}

// 硬拒绝: 无法通过用户确认绕过
if (detectCommandSubstitution(command)) {
  return {
    allAllowed: false,
    isHardDenial: true,
    blockReason: 'Command substitution detected',
  };
}`,
  },
  {
    layer: 'check_blocklist',
    title: '检查黑名单',
    description: '匹配 excludeTools 配置的禁用命令',
    check: (state) => {
      const blocked = state.rootCommands.some((cmd) =>
        state.blocklist.some((b) => cmd === b || cmd.startsWith(b + ' '))
      );
      if (blocked) {
        return { pass: false, result: 'denied', reason: '命令在黑名单中 (硬拒绝)' };
      }
      return { pass: true };
    },
    codeSnippet: `// shell-utils.ts:339-366
function checkBlocklist(
  command: string,
  blocklist: string[]
): boolean {
  const roots = getCommandRoots(command);

  for (const root of roots) {
    // 精确匹配
    if (blocklist.includes(root)) {
      return true;
    }

    // 通配符匹配 (e.g., "rm -rf *")
    const patterns = blocklist.filter((b) => b.includes('*'));
    for (const pattern of patterns) {
      if (matchWildcard(root, pattern)) {
        return true;
      }
    }
  }

  return false;
}

// 黑名单示例 (settings.json):
// "excludeTools": ["rm -rf", "sudo", "chmod 777"]`,
  },
  {
    layer: 'check_wildcard_allow',
    title: '检查通配符允许',
    description: '如果 coreTools 包含 "*"，允许所有命令',
    check: (state) => {
      if (state.globalAllowlist.includes('*')) {
        return { pass: false, result: 'allowed', reason: '通配符允许所有命令' };
      }
      return { pass: true };
    },
    codeSnippet: `// shell-utils.ts:368-377
function checkWildcardAllow(allowlist: string[]): boolean {
  // 如果允许列表包含 "*"，放行所有
  if (allowlist.includes('*')) {
    return true;
  }

  // 继续细粒度检查
  return false;
}

// 配置示例 (YOLO 模式):
// "coreTools": ["*"]  // 允许所有 shell 命令`,
  },
  {
    layer: 'check_session_allowlist',
    title: '检查会话白名单',
    description: '用户之前选择 "Always Allow" 的命令',
    check: (state) => {
      const allInSession = state.rootCommands.every((cmd) =>
        state.sessionAllowlist.has(cmd)
      );
      if (allInSession) {
        return { pass: false, result: 'allowed', reason: '所有命令在会话白名单中' };
      }
      return { pass: true };
    },
    codeSnippet: `// shell.ts:87-89
const commandsToConfirm = rootCommands.filter(
  (command) => !this.allowlist.has(command)
);

if (commandsToConfirm.length === 0) {
  return false; // 无需确认，直接执行
}

// 会话白名单:
// - 用户选择 "Proceed Always" 时添加
// - 仅在当前会话有效
// - 重启后清空`,
  },
  {
    layer: 'check_global_allowlist',
    title: '检查全局白名单',
    description: '匹配 coreTools 配置的允许命令',
    check: (state) => {
      const allInGlobal = state.rootCommands.every((cmd) =>
        state.globalAllowlist.includes(cmd)
      );
      if (allInGlobal) {
        return { pass: false, result: 'allowed', reason: '所有命令在全局白名单中' };
      }
      return { pass: true };
    },
    codeSnippet: `// shell-utils.ts:381-407
function checkGlobalAllowlist(
  rootCommands: string[],
  globalAllowlist: string[]
): { allAllowed: boolean; disallowed: string[] } {
  const disallowed: string[] = [];

  for (const cmd of rootCommands) {
    // 精确匹配
    if (globalAllowlist.includes(cmd)) {
      continue;
    }

    // 前缀匹配 (e.g., "git*" matches "git")
    const prefixMatch = globalAllowlist.some(
      (allowed) => allowed.endsWith('*') &&
        cmd.startsWith(allowed.slice(0, -1))
    );

    if (!prefixMatch) {
      disallowed.push(cmd);
    }
  }

  return {
    allAllowed: disallowed.length === 0,
    disallowed,
  };
}

// 全局白名单 (settings.json):
// "coreTools": ["ls", "cat", "git*", "npm"]`,
  },
  {
    layer: 'user_prompt',
    title: '用户确认对话框',
    description: '显示命令详情，等待用户决策',
    check: () => ({ pass: false, result: 'ask', reason: '需要用户确认' }),
    codeSnippet: `// shell.ts:100-111
return {
  type: 'exec',
  title: 'Execute Shell Command',
  command: this.params.command,
  rootCommand: commandsToConfirm.join(', '),

  onConfirm: async (outcome: ToolConfirmationOutcome) => {
    switch (outcome) {
      case ToolConfirmationOutcome.ProceedOnce:
        // 仅执行一次，不记录
        break;
      case ToolConfirmationOutcome.ProceedAlways:
        // 添加到会话白名单
        commandsToConfirm.forEach((cmd) => this.allowlist.add(cmd));
        break;
      case ToolConfirmationOutcome.Cancel:
        throw new UserCancelledError();
    }
  },
};`,
  },
  {
    layer: 'decision_proceed_once',
    title: '用户选择: 仅执行一次',
    description: '执行命令但不记录到白名单',
    check: () => ({ pass: false, result: 'allowed', reason: '用户允许 (单次)' }),
    codeSnippet: `// ToolConfirmationOutcome.ProceedOnce
case ToolConfirmationOutcome.ProceedOnce:
  // 不修改白名单
  // 下次执行相同命令仍需确认
  break;`,
  },
  {
    layer: 'decision_proceed_always',
    title: '用户选择: 始终允许',
    description: '执行命令并添加到会话白名单',
    check: () => ({ pass: false, result: 'allowed', reason: '用户允许 (始终)' }),
    codeSnippet: `// ToolConfirmationOutcome.ProceedAlways
case ToolConfirmationOutcome.ProceedAlways:
  // 添加所有根命令到会话白名单
  commandsToConfirm.forEach((cmd) => {
    this.allowlist.add(cmd);
  });

  // 之后的相同命令将自动放行
  // (直到会话结束)
  break;`,
  },
  {
    layer: 'decision_cancel',
    title: '用户选择: 取消',
    description: '拒绝执行命令',
    check: () => ({ pass: false, result: 'denied', reason: '用户取消' }),
    codeSnippet: `// ToolConfirmationOutcome.Cancel
case ToolConfirmationOutcome.Cancel:
  throw new UserCancelledError(
    'User cancelled shell command execution'
  );`,
  },
];

// 决策树节点
function DecisionNode({
  title,
  isActive,
  isPassed,
  result,
}: {
  title: string;
  isActive: boolean;
  isPassed: boolean | null;
  result?: PermissionResult;
}) {
  const getColor = () => {
    if (!isActive && isPassed === null) return 'var(--text-muted)';
    if (result === 'allowed') return 'var(--terminal-green)';
    if (result === 'denied') return 'var(--error-red)';
    if (result === 'ask') return 'var(--amber)';
    if (isPassed) return 'var(--cyber-blue)';
    return 'var(--text-muted)';
  };

  const getIcon = () => {
    if (result === 'allowed') return '✓';
    if (result === 'denied') return '✕';
    if (result === 'ask') return '?';
    if (isActive) return '►';
    if (isPassed) return '○';
    return '·';
  };

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        transition-all duration-300
        ${isActive ? 'bg-[var(--bg-elevated)] ring-1 ring-[var(--border-active)]' : ''}
      `}
      style={{ opacity: isPassed === null && !isActive ? 0.4 : 1 }}
    >
      <span
        className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${isActive ? 'animate-pulse' : ''}`}
        style={{
          color: getColor(),
          backgroundColor: `${getColor()}20`,
        }}
      >
        {getIcon()}
      </span>
      <span
        className="text-sm font-mono"
        style={{ color: isActive ? 'var(--text-primary)' : getColor() }}
      >
        {title}
      </span>
    </div>
  );
}

// 命令解析可视化
function CommandParser({ command, rootCommands }: { command: string; rootCommands: string[] }) {
  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--cyber-blue)]">$</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">命令解析</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">原始命令:</div>
          <code className="block p-2 rounded bg-black/30 text-[var(--terminal-green)] font-mono text-sm">
            {command}
          </code>
        </div>

        <div>
          <div className="text-xs text-[var(--text-muted)] mb-1">提取的根命令:</div>
          <div className="flex flex-wrap gap-2">
            {rootCommands.map((cmd, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] font-mono text-sm"
              >
                {cmd}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 白名单状态
function AllowlistPanel({
  sessionAllowlist,
  globalAllowlist,
  blocklist,
}: {
  sessionAllowlist: Set<string>;
  globalAllowlist: string[];
  blocklist: string[];
}) {
  return (
    <div className="bg-[var(--bg-terminal)] rounded-lg p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--amber)]">📋</span>
        <span className="text-sm font-mono font-bold text-[var(--text-primary)]">权限配置</span>
      </div>

      <div className="space-y-3 text-xs font-mono">
        {/* 黑名单 */}
        <div>
          <div className="text-[var(--error-red)] mb-1">Blocklist (硬拒绝):</div>
          <div className="flex flex-wrap gap-1">
            {blocklist.map((cmd) => (
              <span key={cmd} className="px-2 py-0.5 rounded bg-[var(--error-red)]/20 text-[var(--error-red)]">
                {cmd}
              </span>
            ))}
          </div>
        </div>

        {/* 全局白名单 */}
        <div>
          <div className="text-[var(--terminal-green)] mb-1">Global Allowlist:</div>
          <div className="flex flex-wrap gap-1">
            {globalAllowlist.map((cmd) => (
              <span key={cmd} className="px-2 py-0.5 rounded bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]">
                {cmd}
              </span>
            ))}
          </div>
        </div>

        {/* 会话白名单 */}
        <div>
          <div className="text-[var(--purple)] mb-1">Session Allowlist:</div>
          <div className="flex flex-wrap gap-1">
            {sessionAllowlist.size > 0 ? (
              Array.from(sessionAllowlist).map((cmd) => (
                <span key={cmd} className="px-2 py-0.5 rounded bg-[var(--purple)]/20 text-[var(--purple)]">
                  {cmd}
                </span>
              ))
            ) : (
              <span className="text-[var(--text-muted)]">(空)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 主组件
export function PermissionApprovalAnimation() {
  const [selectedCommand, setSelectedCommand] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>({
    layer: 'parse_command',
    command: exampleCommands[0].cmd,
    rootCommands: ['ls'],
    sessionAllowlist: new Set(['git']),
    globalAllowlist: ['ls', 'cat', 'echo', 'pwd', 'git'],
    blocklist: ['rm -rf', 'sudo', 'chmod 777'],
    result: 'pending',
    reason: '',
  });

  const currentStepData = checkSequence[currentStep];

  // 更新命令
  const updateCommand = useCallback((index: number) => {
    const cmd = exampleCommands[index];
    const roots = cmd.cmd.split(/&&|\|\|/).map((s) => s.trim().split(' ')[0]);

    setSelectedCommand(index);
    setCurrentStep(0);
    setIsPlaying(false);
    setPermissionState((prev) => ({
      ...prev,
      command: cmd.cmd,
      rootCommands: [...new Set(roots)],
      result: 'pending',
      reason: '',
      layer: 'parse_command',
    }));
  }, []);

  // 执行检查步骤
  useEffect(() => {
    if (currentStepData) {
      const checkResult = currentStepData.check(permissionState);
      setPermissionState((prev) => ({
        ...prev,
        layer: currentStepData.layer,
        result: checkResult.result || prev.result,
        reason: checkResult.reason || prev.reason,
      }));
    }
  }, [currentStep, currentStepData, permissionState.command]);

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      const checkResult = currentStepData?.check(permissionState);

      if (!checkResult?.pass || currentStep >= checkSequence.length - 1) {
        setIsPlaying(false);
      } else {
        setCurrentStep((s) => s + 1);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, currentStepData, permissionState]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((s) => Math.min(checkSequence.length - 1, s + 1));
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setPermissionState((prev) => ({
      ...prev,
      result: 'pending',
      reason: '',
      layer: 'parse_command',
    }));
  }, []);

  // 计算每个步骤的状态
  const getStepStatus = (index: number) => {
    if (index > currentStep) return { isActive: false, isPassed: null, result: undefined };
    if (index === currentStep) {
      const result = currentStepData?.check(permissionState);
      return {
        isActive: true,
        isPassed: result?.pass ?? true,
        result: result?.result,
      };
    }
    // 已经过的步骤
    const step = checkSequence[index];
    const result = step.check(permissionState);
    return {
      isActive: false,
      isPassed: result.pass,
      result: result.result,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Permission 审批流动画
        </h1>
        <p className="text-[var(--text-secondary)]">
          展示 Shell 命令的多层安全检查流程：命令替换检测 → 黑名单 → 白名单 → 用户确认
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">
          核心代码: packages/core/src/tools/shell.ts:82-112, shell-utils.ts:312-407
        </p>
      </div>

      {/* 命令选择器 */}
      <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
        <div className="text-sm text-[var(--text-muted)] mb-2">选择测试命令:</div>
        <div className="flex flex-wrap gap-2">
          {exampleCommands.map((cmd, i) => (
            <button
              key={i}
              onClick={() => updateCommand(i)}
              className={`
                px-3 py-2 rounded-lg text-sm font-mono
                transition-all duration-200
                ${
                  selectedCommand === i
                    ? 'bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] ring-1 ring-[var(--cyber-blue)]'
                    : 'bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <code>{cmd.cmd}</code>
              <div className="text-xs text-[var(--text-muted)] mt-1">{cmd.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 控制栏 */}
      <div className="flex items-center justify-between bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm"
          >
            ↺ 重置
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm disabled:opacity-50"
          >
            ← 上一步
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-1.5 rounded text-sm font-medium ${
              isPlaying
                ? 'bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/50'
                : 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] border border-[var(--terminal-green)]/50'
            }`}
          >
            {isPlaying ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === checkSequence.length - 1}
            className="px-3 py-1.5 rounded bg-[var(--bg-terminal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-sm disabled:opacity-50"
          >
            下一步 →
          </button>
        </div>

        {/* 结果指示器 */}
        <div
          className={`
            px-4 py-1.5 rounded-lg text-sm font-bold
            ${permissionState.result === 'allowed' ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]' : ''}
            ${permissionState.result === 'denied' ? 'bg-[var(--error-red)]/20 text-[var(--error-red)]' : ''}
            ${permissionState.result === 'ask' ? 'bg-[var(--amber)]/20 text-[var(--amber)]' : ''}
            ${permissionState.result === 'pending' ? 'bg-[var(--bg-terminal)] text-[var(--text-muted)]' : ''}
          `}
        >
          {permissionState.result === 'allowed' && '✓ ALLOWED'}
          {permissionState.result === 'denied' && '✕ DENIED'}
          {permissionState.result === 'ask' && '? ASK USER'}
          {permissionState.result === 'pending' && '... CHECKING'}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：决策树 */}
        <div className="lg:col-span-1 space-y-1">
          <div className="text-sm font-bold text-[var(--text-primary)] mb-2">检查流程</div>
          {checkSequence.map((step, i) => {
            const status = getStepStatus(i);
            return (
              <DecisionNode
                key={step.layer}
                title={step.title}
                isActive={status.isActive}
                isPassed={status.isPassed}
                result={status.result}
              />
            );
          })}
        </div>

        {/* 右侧：详情 */}
        <div className="lg:col-span-2 space-y-4">
          <CommandParser
            command={permissionState.command}
            rootCommands={permissionState.rootCommands}
          />

          <AllowlistPanel
            sessionAllowlist={permissionState.sessionAllowlist}
            globalAllowlist={permissionState.globalAllowlist}
            blocklist={permissionState.blocklist}
          />

          {/* 当前步骤说明 */}
          <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">
              {currentStepData?.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              {currentStepData?.description}
            </p>
            {permissionState.reason && (
              <div
                className={`
                  text-sm px-3 py-2 rounded
                  ${permissionState.result === 'allowed' ? 'bg-[var(--terminal-green)]/10 text-[var(--terminal-green)]' : ''}
                  ${permissionState.result === 'denied' ? 'bg-[var(--error-red)]/10 text-[var(--error-red)]' : ''}
                  ${permissionState.result === 'ask' ? 'bg-[var(--amber)]/10 text-[var(--amber)]' : ''}
                `}
              >
                → {permissionState.reason}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 代码片段 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[var(--purple)]">📄</span>
          <span className="text-sm font-mono font-bold text-[var(--text-primary)]">源码实现</span>
        </div>
        <JsonBlock code={currentStepData?.codeSnippet || ''} />
      </div>

      {/* 架构说明 */}
      <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">安全层级</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded bg-[var(--error-red)]/10 border border-[var(--error-red)]/30">
            <div className="font-bold text-[var(--error-red)] mb-1">Layer 1: 硬拒绝</div>
            <div className="text-[var(--text-secondary)]">
              命令替换检测、黑名单匹配 — 无法通过用户确认绕过
            </div>
          </div>
          <div className="p-3 rounded bg-[var(--terminal-green)]/10 border border-[var(--terminal-green)]/30">
            <div className="font-bold text-[var(--terminal-green)] mb-1">Layer 2: 自动放行</div>
            <div className="text-[var(--text-secondary)]">
              通配符允许、全局/会话白名单 — 无需用户确认
            </div>
          </div>
          <div className="p-3 rounded bg-[var(--amber)]/10 border border-[var(--amber)]/30">
            <div className="font-bold text-[var(--amber)] mb-1">Layer 3: 用户确认</div>
            <div className="text-[var(--text-secondary)]">
              未知命令需要用户授权，可选择单次或始终允许
            </div>
          </div>
          <div className="p-3 rounded bg-[var(--purple)]/10 border border-[var(--purple)]/30">
            <div className="font-bold text-[var(--purple)] mb-1">会话学习</div>
            <div className="text-[var(--text-secondary)]">
              选择 "Always Allow" 添加到会话白名单，提升后续效率
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
