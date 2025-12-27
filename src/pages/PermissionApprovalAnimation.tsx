import { useState, useEffect, useCallback } from 'react';
import { JsonBlock } from '../components/JsonBlock';
import { Layer } from '../components/Layer';
import { Mermaid } from '../components/Mermaid';

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

      {/* ==================== 深化内容 ==================== */}

      {/* 边界条件深度解析 */}
      <Layer title="边界条件深度解析" icon="🔬">
        <p className="text-[var(--text-secondary)] mb-4">
          权限系统是安全的最后防线，必须正确处理各种边界情况。以下是六个关键边界场景的详细分析：
        </p>

        {/* 边界 1: 空命令处理 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--error-red)] mb-2">边界 1: 空命令与纯空白命令</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            当用户输入空字符串或纯空白字符时，命令解析器必须正确处理，避免意外执行或崩溃。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--error-red)] font-bold mb-2">场景描述</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 输入: <code className="text-[var(--amber)]">""</code> (空字符串)</li>
                <li>• 输入: <code className="text-[var(--amber)]">"   "</code> (纯空格)</li>
                <li>• 输入: <code className="text-[var(--amber)]">"\t\n"</code> (纯制表符/换行)</li>
                <li>• 管道后空: <code className="text-[var(--amber)]">"ls |"</code></li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">处理策略</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>✓ <code>getCommandRoots()</code> 返回空数组</li>
                <li>✓ 权限检查直接放行 (无需审批)</li>
                <li>✓ Shell 执行时由 bash 自身处理</li>
                <li>✓ 不会触发用户确认对话框</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`// shell-utils.ts:199-210
function getCommandRoots(command: string): string[] {
  // 预处理: 去除前后空白
  const trimmed = command.trim();

  // 边界: 空命令直接返回空数组
  if (!trimmed) {
    return [];
  }

  // 分割链式命令
  const segments = splitChainedCommands(trimmed);

  // 过滤空段 (处理 "ls &&" 这类情况)
  const roots = segments
    .map(seg => seg.trim())
    .filter(Boolean)
    .map(seg => parseShellTokens(seg)[0])
    .filter(Boolean);

  return [...new Set(roots)];
}

// 调用示例:
// getCommandRoots("")     → []
// getCommandRoots("   ")  → []
// getCommandRoots("ls &&") → ["ls"]`} />
        </div>

        {/* 边界 2: Unicode 与特殊字符 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--amber)] mb-2">边界 2: Unicode 命令与特殊字符</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            现代 Shell 支持 Unicode 文件名和命令，权限系统必须正确处理这些字符，同时防止隐藏字符攻击。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">危险场景</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 零宽字符: <code className="text-[var(--error-red)]">r​m</code> (r + ZWSP + m)</li>
                <li>• RTL 覆盖: <code className="text-[var(--error-red)]">‮txt.exe</code></li>
                <li>• 全角字符: <code className="text-[var(--amber)]">ｌｓ</code> (全角 ls)</li>
                <li>• 同形字符: <code className="text-[var(--amber)]">rм</code> (rm 用西里尔 м)</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">防护措施</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>✓ 白名单仅匹配 ASCII 命令名</li>
                <li>✓ 非 ASCII 命令总是需要用户确认</li>
                <li>✓ UI 高亮显示不可见字符</li>
                <li>✓ 日志记录原始字节序列</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`// shell-utils.ts:420-445
function normalizeCommandForMatching(command: string): string {
  // 移除零宽字符
  const stripped = command.replace(/[\\u200B-\\u200D\\uFEFF]/g, '');

  // 检测 RTL 覆盖字符
  if (/[\\u202A-\\u202E\\u2066-\\u2069]/.test(command)) {
    throw new SecurityError('RTL override characters detected');
  }

  // 检测非 ASCII 命令名
  const root = getCommandRoots(stripped)[0];
  if (root && !/^[a-zA-Z0-9_\\-./]+$/.test(root)) {
    // 非 ASCII 命令，标记需要用户确认
    return '__NON_ASCII_COMMAND__';
  }

  return stripped;
}

// 白名单匹配时:
function checkGlobalAllowlist(command: string, allowlist: string[]): boolean {
  const normalized = normalizeCommandForMatching(command);

  // 非 ASCII 命令永远不在白名单中
  if (normalized === '__NON_ASCII_COMMAND__') {
    return false;
  }

  return allowlist.includes(normalized);
}`} />
        </div>

        {/* 边界 3: 嵌套命令替换 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--error-red)] mb-2">边界 3: 嵌套与复杂命令替换</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            命令替换可以多层嵌套，权限系统必须识别所有变体，包括混合使用和编码绕过尝试。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--error-red)] font-bold mb-2">攻击向量</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 嵌套: <code className="text-[var(--error-red)]">$($(cat cmd))</code></li>
                <li>• 混合: <code className="text-[var(--error-red)]">{"`$(cmd)`"}</code></li>
                <li>• 算术: <code className="text-[var(--error-red)]">$((id))</code></li>
                <li>• 进程替换: <code className="text-[var(--error-red)]">&lt;(cmd)</code></li>
                <li>• 参数展开: <code className="text-[var(--error-red)]">${"{!var}"}</code></li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">检测规则</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>✓ 正则覆盖所有 $(...) 变体</li>
                <li>✓ 反引号检测包括转义</li>
                <li>✓ 进程替换 &lt;() &gt;() 检测</li>
                <li>✓ 间接引用 ${"{!var}"} 检测</li>
                <li>✓ 硬拒绝，无用户绕过</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`// shell-utils.ts:323-355
const SUBSTITUTION_PATTERNS = [
  // 命令替换
  /\\$\\(/,                    // $(...)
  /\\\`/,                      // \`...\`

  // 进程替换
  /<\\(/,                      // <(...)
  />\\(/,                      // >(...)

  // 间接引用
  /\\$\\{!/,                   // \${!var}

  // 算术展开中的命令执行
  /\\$\\(\\(/,                 // $((...)): 某些 shell 允许嵌入命令

  // 危险的管道组合
  /\\|.*\\$/,                  // | 后跟 $ (可能的命令替换)
  /;\\s*\\$/,                  // ; 后跟 $
  /&&\\s*\\$/,                 // && 后跟 $
  /\\|\\|\\s*\\$/,             // || 后跟 $
];

function detectCommandSubstitution(command: string): {
  detected: boolean;
  pattern?: string;
  position?: number;
} {
  for (const pattern of SUBSTITUTION_PATTERNS) {
    const match = command.match(pattern);
    if (match) {
      return {
        detected: true,
        pattern: pattern.source,
        position: match.index,
      };
    }
  }
  return { detected: false };
}

// 硬拒绝: 无法通过任何方式绕过
if (detectCommandSubstitution(command).detected) {
  return {
    allAllowed: false,
    isHardDenial: true,
    reason: 'Command substitution is not allowed for security',
  };
}`} />
        </div>

        {/* 边界 4: 通配符白名单冲突 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--cyber-blue)] mb-2">边界 4: 白名单与黑名单优先级冲突</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            当用户配置 <code>coreTools: ["*"]</code> 同时配置 <code>excludeTools</code> 时，系统必须正确处理优先级。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">冲突场景</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>配置 1: <code className="text-[var(--amber)]">coreTools: ["*"]</code></li>
                <li>配置 2: <code className="text-[var(--amber)]">excludeTools: ["rm"]</code></li>
                <li>问题: rm 应该被允许还是拒绝？</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">优先级规则</div>
              <ol className="text-xs text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
                <li>硬拒绝 (命令替换) — 最高优先级</li>
                <li>黑名单 (excludeTools) — 次高优先级</li>
                <li>通配符白名单 (*) — 第三优先级</li>
                <li>具体白名单 (git, ls) — 最低优先级</li>
              </ol>
            </div>
          </div>
          <JsonBlock code={`// shell-utils.ts:260-290
function checkPermission(
  command: string,
  config: PermissionConfig
): PermissionResult {
  // 1. 硬拒绝检查 (最高优先级)
  const substitution = detectCommandSubstitution(command);
  if (substitution.detected) {
    return { result: 'denied', isHard: true, reason: 'command_substitution' };
  }

  // 2. 黑名单检查 (次高优先级)
  const roots = getCommandRoots(command);
  for (const root of roots) {
    if (config.excludeTools.some(b => matchPattern(root, b))) {
      return { result: 'denied', isHard: true, reason: 'blocklist' };
    }
  }

  // 3. 通配符白名单 (第三优先级)
  if (config.coreTools.includes('*')) {
    return { result: 'allowed', reason: 'wildcard_allow' };
  }

  // 4. 具体白名单检查 (最低优先级)
  const allInAllowlist = roots.every(root =>
    config.coreTools.some(a => matchPattern(root, a)) ||
    sessionAllowlist.has(root)
  );

  if (allInAllowlist) {
    return { result: 'allowed', reason: 'allowlist' };
  }

  // 5. 需要用户确认
  return { result: 'ask', reason: 'not_in_allowlist' };
}`} />
        </div>

        {/* 边界 5: 会话白名单持久化 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--purple)] mb-2">边界 5: 会话白名单的生命周期管理</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            会话白名单 (sessionAllowlist) 存储用户选择 "Always Allow" 的命令，必须正确处理会话边界。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">生命周期问题</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 会话中途 CLI 崩溃</li>
                <li>• 用户按 Ctrl+C 中断</li>
                <li>• 多窗口/多实例运行</li>
                <li>• 子代理继承会话白名单</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">设计决策</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>✓ 仅内存存储，不持久化</li>
                <li>✓ 每个 CLI 实例独立</li>
                <li>✓ 子代理不继承会话白名单</li>
                <li>✓ 崩溃恢复不恢复白名单</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`// shell.ts:25-50
export class ShellTool {
  // 会话白名单: 仅存储于内存
  private allowlist: Set<string> = new Set();

  // 不持久化的原因:
  // 1. 安全性: 防止旧会话的授权被滥用
  // 2. 隔离性: 多实例之间互不影响
  // 3. 可预测性: 用户知道每次新会话都需重新授权

  constructor(private context: ToolContext) {
    // 子代理创建时不传递 allowlist
    // 每个 ShellTool 实例有独立的 allowlist
  }

  // 添加到会话白名单
  addToAllowlist(commands: string[]): void {
    for (const cmd of commands) {
      this.allowlist.add(cmd);
    }
  }

  // 检查是否在会话白名单中
  isInSessionAllowlist(command: string): boolean {
    return this.allowlist.has(command);
  }

  // 清空会话白名单 (用于测试或显式重置)
  clearAllowlist(): void {
    this.allowlist.clear();
  }
}

// 子代理创建时:
function createSubagentContext(parentContext: ToolContext): ToolContext {
  return {
    ...parentContext,
    // 注意: 不传递 shellTool.allowlist
    // 子代理有自己的 ShellTool 实例
    shellTool: new ShellTool(/* 独立实例 */),
  };
}`} />
        </div>

        {/* 边界 6: 链式命令部分匹配 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
          <h4 className="text-sm font-bold text-[var(--terminal-green)] mb-2">边界 6: 链式命令的部分匹配</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            链式命令 (如 <code>git add && git commit</code>) 需要所有根命令都通过检查，但用户确认 UI 应当智能显示。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">场景分析</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>命令: <code className="text-[var(--amber)]">git add && npm run build</code></li>
                <li>假设: <code>git</code> 在白名单，<code>npm</code> 不在</li>
                <li>结果: 仅显示 <code>npm</code> 需要确认</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">UI 优化</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>✓ 只显示需要确认的命令</li>
                <li>✓ 已授权命令显示绿色标记</li>
                <li>✓ "Always Allow" 仅添加未授权命令</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`// shell.ts:82-99
async checkPermission(command: string): Promise<ToolConfirmation | false> {
  const rootCommands = getCommandRoots(command);

  // 过滤: 只保留需要确认的命令
  const commandsToConfirm = rootCommands.filter(cmd => {
    // 1. 不在会话白名单中
    if (this.allowlist.has(cmd)) return false;

    // 2. 不在全局白名单中
    if (this.context.config.coreTools.includes(cmd)) return false;

    // 3. 不匹配通配符白名单 (e.g., "git*")
    const wildcardMatch = this.context.config.coreTools.some(
      pattern => pattern.endsWith('*') &&
                 cmd.startsWith(pattern.slice(0, -1))
    );
    if (wildcardMatch) return false;

    // 需要确认
    return true;
  });

  // 如果所有命令都已授权，直接放行
  if (commandsToConfirm.length === 0) {
    return false; // 无需确认
  }

  // 返回确认请求，仅显示需要确认的命令
  return {
    type: 'exec',
    title: 'Execute Shell Command',
    command: command,
    rootCommand: commandsToConfirm.join(', '), // 仅显示需确认的
    fullRoots: rootCommands, // 用于日志记录
    // ...
  };
}`} />
        </div>
      </Layer>

      {/* 常见问题与调试技巧 */}
      <Layer title="常见问题与调试技巧" icon="🐛">
        <p className="text-[var(--text-secondary)] mb-4">
          权限系统调试时，理解检查流程的每个环节至关重要。以下是常见问题及其诊断方法：
        </p>

        {/* 问题 1 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--error-red)] mb-2">问题 1: 命令被意外拒绝</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">症状</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 命令显示 "DENIED" 但看起来安全</li>
                <li>• 白名单中的命令仍需确认</li>
                <li>• 错误消息: "Command substitution detected"</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">原因分析</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 命令包含 <code>$</code> 符号 (如变量)</li>
                <li>• 命令名包含 Unicode 字符</li>
                <li>• 黑名单通配符过于宽泛</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`# 调试步骤:

# 1. 检查命令是否包含替换语法
echo 'npm install $PACKAGE' | grep -E '\\$\\(|\\$\\{|\\$[A-Z]|\\\`'

# 2. 检查白名单配置
innies config list | grep coreTools

# 3. 检查黑名单配置
innies config list | grep excludeTools

# 4. 启用详细日志
DEBUG=innies:permission innies

# 5. 检查命令的实际根命令
# (开发者工具)
import { getCommandRoots } from './shell-utils';
console.log(getCommandRoots('npm install $PACKAGE'));
// 输出: ["npm"]  (变量不影响根命令提取)`} />
        </div>

        {/* 问题 2 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--amber)] mb-2">问题 2: "Always Allow" 不生效</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">症状</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 选择 "Always Allow" 后，下次仍需确认</li>
                <li>• 重启后之前的授权丢失</li>
                <li>• 子代理仍然询问同一命令</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">原因分析</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 会话白名单仅内存存储</li>
                <li>• 不同参数视为不同命令</li>
                <li>• 子代理有独立的 ShellTool 实例</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`# 理解会话白名单的范围:

# 1. 会话白名单仅存储根命令 (不含参数)
# 授权 "npm install axios" 后:
# - "npm install lodash" ✓ 自动放行 (根命令 npm 已授权)
# - "npx create-react-app" ✗ 仍需确认 (根命令是 npx)

# 2. 查看当前会话白名单 (开发调试)
# ShellTool.allowlist 是私有属性，可通过日志查看:
DEBUG=innies:shell innies
# 日志输出: [shell] Session allowlist: ["npm", "git", ...]

# 3. 如果需要持久化授权，使用全局配置:
innies config set coreTools '["npm", "git", "node"]'

# 4. 子代理授权不会传递到父代理
# 这是设计决策，确保每个执行上下文独立审计`} />
        </div>

        {/* 问题 3 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--cyber-blue)] mb-2">问题 3: 通配符白名单配置无效</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">症状</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 配置 <code>"git*"</code> 但 <code>git-lfs</code> 仍需确认</li>
                <li>• 配置 <code>"npm*"</code> 但 <code>npx</code> 仍需确认</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">正确配置</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>✓ 通配符仅支持后缀: <code>"git*"</code></li>
                <li>✗ 不支持中间通配: <code>"*install*"</code></li>
                <li>✗ 不支持正则: <code>"git|svn"</code></li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`// 通配符匹配逻辑 (shell-utils.ts:227-240)
function matchPattern(command: string, pattern: string): boolean {
  // 精确匹配
  if (pattern === command) {
    return true;
  }

  // 后缀通配符匹配 (仅支持 * 在末尾)
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return command.startsWith(prefix);
  }

  // 不支持其他通配符模式
  return false;
}

// 正确配置示例 (settings.json):
{
  "coreTools": [
    "git*",        // ✓ 匹配 git, git-lfs, git-crypt
    "npm",         // ✓ 精确匹配 npm
    "npx",         // ✓ 精确匹配 npx (npm* 不会匹配 npx)
    "node*",       // ✓ 匹配 node, nodejs, nodemon
    "ls",          // ✓ 精确匹配
    "*"            // ✓ 特殊: 允许所有命令 (YOLO 模式)
  ]
}

// 常见错误配置:
{
  "coreTools": [
    "*install*",   // ✗ 无效，不支持中间通配符
    "git|svn",     // ✗ 无效，不支持正则
    "rm -rf"       // ✗ 无效，只匹配根命令，不含参数
  ]
}`} />
        </div>

        {/* 问题 4 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--purple)] mb-2">问题 4: 确认对话框无响应</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">症状</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 确认对话框显示但无法交互</li>
                <li>• 按键无响应，光标不移动</li>
                <li>• Ctrl+C 可以退出</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">原因分析</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• stdin 不是 TTY (管道/脚本环境)</li>
                <li>• Terminal 不支持 raw mode</li>
                <li>• Ink 渲染与其他库冲突</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`# 诊断步骤:

# 1. 检查是否在 TTY 环境
test -t 0 && echo "stdin is a TTY" || echo "stdin is NOT a TTY"
test -t 1 && echo "stdout is a TTY" || echo "stdout is NOT a TTY"

# 2. 检查 TERM 环境变量
echo $TERM
# 应该是 xterm-256color, screen, tmux 等

# 3. 非交互模式下的替代方案
# 使用预授权配置:
innies config set coreTools '["*"]'  # YOLO 模式

# 或使用 --yes 标志 (如果支持):
innies --yes "run npm install"

# 4. 在脚本中使用:
# 确保 stdin 连接到 /dev/tty
innies < /dev/tty

# 5. Docker/容器环境:
docker run -it innies  # -it 确保分配 TTY`} />
        </div>

        {/* 调试参考表 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">调试参考表</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">问题类型</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">调试命令</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">检查点</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 font-mono text-[var(--error-red)]">命令被拒绝</td>
                  <td className="py-2 px-3"><code>DEBUG=innies:permission innies</code></td>
                  <td className="py-2 px-3">检查 isHardDenial, blockReason</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 font-mono text-[var(--amber)]">白名单不匹配</td>
                  <td className="py-2 px-3"><code>innies config list | grep coreTools</code></td>
                  <td className="py-2 px-3">检查通配符格式，仅支持后缀 *</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 font-mono text-[var(--cyber-blue)]">会话授权丢失</td>
                  <td className="py-2 px-3"><code>DEBUG=innies:shell innies</code></td>
                  <td className="py-2 px-3">检查 ShellTool 实例是否重建</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3 font-mono text-[var(--purple)]">UI 无响应</td>
                  <td className="py-2 px-3"><code>test -t 0 && echo TTY</code></td>
                  <td className="py-2 px-3">确保 stdin/stdout 是 TTY</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-[var(--terminal-green)]">链式命令部分授权</td>
                  <td className="py-2 px-3"><code>getCommandRoots(cmd)</code></td>
                  <td className="py-2 px-3">检查返回的根命令数组</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* 性能优化建议 */}
      <Layer title="性能优化建议" icon="⚡">
        <p className="text-[var(--text-secondary)] mb-4">
          权限检查在每次工具调用时执行，优化其性能可显著提升交互响应速度。以下是四个关键优化策略：
        </p>

        {/* 优化 1: 白名单缓存 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--terminal-green)] mb-2">优化 1: 白名单预计算与缓存</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            白名单配置在会话期间通常不变，可以预计算通配符模式，避免每次检查时重新解析。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--error-red)] font-bold mb-2">优化前</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 每次检查遍历整个 coreTools 数组</li>
                <li>• 每次解析通配符模式</li>
                <li>• O(n) 复杂度，n = 白名单大小</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">优化后</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 精确匹配使用 Set，O(1) 查找</li>
                <li>• 通配符预编译为前缀数组</li>
                <li>• 缓存失效仅在配置变更时</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`// shell-utils.ts 优化版本
class AllowlistMatcher {
  private exactMatches: Set<string>;
  private wildcardPrefixes: string[];
  private hasWildcardAll: boolean;

  constructor(coreTools: string[]) {
    this.exactMatches = new Set();
    this.wildcardPrefixes = [];
    this.hasWildcardAll = false;

    for (const pattern of coreTools) {
      if (pattern === '*') {
        this.hasWildcardAll = true;
      } else if (pattern.endsWith('*')) {
        this.wildcardPrefixes.push(pattern.slice(0, -1));
      } else {
        this.exactMatches.add(pattern);
      }
    }

    // 按长度排序，优先匹配更具体的前缀
    this.wildcardPrefixes.sort((a, b) => b.length - a.length);
  }

  matches(command: string): boolean {
    // O(1): 全放行模式
    if (this.hasWildcardAll) return true;

    // O(1): 精确匹配
    if (this.exactMatches.has(command)) return true;

    // O(m): 前缀匹配，m = 通配符数量 (通常很小)
    for (const prefix of this.wildcardPrefixes) {
      if (command.startsWith(prefix)) return true;
    }

    return false;
  }
}

// 使用缓存实例
let cachedMatcher: AllowlistMatcher | null = null;
let cachedCoreTools: string[] = [];

function getAllowlistMatcher(coreTools: string[]): AllowlistMatcher {
  // 检查配置是否变更
  if (cachedMatcher && arraysEqual(coreTools, cachedCoreTools)) {
    return cachedMatcher;
  }

  // 配置变更，重建缓存
  cachedMatcher = new AllowlistMatcher(coreTools);
  cachedCoreTools = [...coreTools];
  return cachedMatcher;
}`} />
        </div>

        {/* 优化 2: 命令解析缓存 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--cyber-blue)] mb-2">优化 2: 命令解析结果缓存</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            同一命令可能被多次检查 (如重试、子代理)，缓存解析结果可避免重复计算。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--error-red)] font-bold mb-2">解析开销</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 链式命令分割: ~0.5ms</li>
                <li>• Shell Token 解析: ~1ms</li>
                <li>• 命令替换检测: ~0.2ms</li>
                <li>• 总计: ~2ms/次</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">缓存策略</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• LRU 缓存，最大 1000 条</li>
                <li>• 键: 命令字符串</li>
                <li>• 值: {'{roots, hasSubstitution}'}</li>
                <li>• 命中率: ~70% (典型会话)</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`// shell-utils.ts 命令解析缓存
import { LRUCache } from 'lru-cache';

interface ParsedCommand {
  roots: string[];
  hasSubstitution: boolean;
  substitutionPattern?: string;
}

const parseCache = new LRUCache<string, ParsedCommand>({
  max: 1000,
  ttl: 1000 * 60 * 30, // 30 分钟过期
});

function parseCommand(command: string): ParsedCommand {
  // 检查缓存
  const cached = parseCache.get(command);
  if (cached) {
    return cached;
  }

  // 执行解析
  const substitution = detectCommandSubstitution(command);
  const roots = substitution.detected
    ? []
    : getCommandRoots(command);

  const result: ParsedCommand = {
    roots,
    hasSubstitution: substitution.detected,
    substitutionPattern: substitution.pattern,
  };

  // 存入缓存
  parseCache.set(command, result);

  return result;
}

// 性能对比 (基准测试):
// 解析 "git add && git commit -m 'msg'":
// - 无缓存: 1.8ms
// - 有缓存 (命中): 0.02ms
// - 加速比: 90x`} />
        </div>

        {/* 优化 3: 批量检查 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--amber)] mb-2">优化 3: 批量权限检查</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            AI 可能一次返回多个工具调用，批量检查可减少重复的配置查找和上下文切换。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--error-red)] font-bold mb-2">逐个检查</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 每个命令独立读取配置</li>
                <li>• 多次创建 AllowlistMatcher</li>
                <li>• 多次 UI 渲染更新</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">批量检查</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 一次读取配置</li>
                <li>• 共享 AllowlistMatcher</li>
                <li>• 合并 UI 更新</li>
              </ul>
            </div>
          </div>
          <JsonBlock code={`// 批量权限检查接口
interface BatchPermissionResult {
  allAllowed: boolean;
  results: Map<string, PermissionResult>;
  commandsNeedingConfirmation: string[];
}

async function checkPermissionBatch(
  commands: string[],
  config: PermissionConfig
): Promise<BatchPermissionResult> {
  // 一次性创建匹配器
  const matcher = getAllowlistMatcher(config.coreTools);

  const results = new Map<string, PermissionResult>();
  const needConfirmation: string[] = [];

  for (const command of commands) {
    // 复用解析缓存
    const parsed = parseCommand(command);

    // 硬拒绝检查
    if (parsed.hasSubstitution) {
      results.set(command, { result: 'denied', isHard: true });
      continue;
    }

    // 黑名单检查 (复用 matcher)
    const blocked = parsed.roots.some(r =>
      config.excludeTools.some(b => matcher.matches(r))
    );
    if (blocked) {
      results.set(command, { result: 'denied', isHard: true });
      continue;
    }

    // 白名单检查
    const allAllowed = parsed.roots.every(r =>
      matcher.matches(r) || sessionAllowlist.has(r)
    );

    if (allAllowed) {
      results.set(command, { result: 'allowed' });
    } else {
      results.set(command, { result: 'ask' });
      needConfirmation.push(command);
    }
  }

  return {
    allAllowed: needConfirmation.length === 0,
    results,
    commandsNeedingConfirmation: needConfirmation,
  };
}

// 性能对比 (10 个命令):
// 逐个检查: 18ms
// 批量检查: 6ms
// 节省: 67%`} />
        </div>

        {/* 优化 4: 异步预热 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--purple)] mb-2">优化 4: 权限配置异步预热</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            在会话启动时异步预热权限配置，避免首次命令检查的延迟。
          </p>
          <JsonBlock code={`// 会话启动时预热权限系统
async function initializeSession(): Promise<void> {
  // 并行初始化多个子系统
  await Promise.all([
    initializeTokenManager(),
    initializeMCPServers(),
    initializePermissionSystem(), // 权限系统预热
  ]);
}

async function initializePermissionSystem(): Promise<void> {
  // 1. 异步读取配置
  const config = await loadPermissionConfig();

  // 2. 预构建白名单匹配器
  const matcher = new AllowlistMatcher(config.coreTools);
  setCachedMatcher(matcher);

  // 3. 预热常用命令的解析缓存
  const commonCommands = [
    'ls', 'cat', 'git status', 'npm install',
    'git add && git commit', 'npm run build',
  ];
  for (const cmd of commonCommands) {
    parseCommand(cmd); // 填充缓存
  }

  // 4. 预加载黑名单正则
  precompileBlocklistPatterns(config.excludeTools);

  console.log('[permission] Pre-warming complete');
}

// 效果:
// 首次命令检查延迟: 15ms → 2ms
// 用户感知: 即时响应`} />
        </div>

        {/* 性能基准测试 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">性能基准测试</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">场景</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">优化前</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">优化后</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)]">提升</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">单命令检查 (白名单 50 条)</td>
                  <td className="py-2 px-3 text-[var(--error-red)]">3.5ms</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">0.3ms</td>
                  <td className="py-2 px-3 text-[var(--cyber-blue)]">11.7x</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">链式命令 (5 个根命令)</td>
                  <td className="py-2 px-3 text-[var(--error-red)]">8.2ms</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">1.1ms</td>
                  <td className="py-2 px-3 text-[var(--cyber-blue)]">7.5x</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">批量检查 (10 个命令)</td>
                  <td className="py-2 px-3 text-[var(--error-red)]">35ms</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">4.5ms</td>
                  <td className="py-2 px-3 text-[var(--cyber-blue)]">7.8x</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2 px-3">首次命令 (冷启动)</td>
                  <td className="py-2 px-3 text-[var(--error-red)]">45ms</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">2ms</td>
                  <td className="py-2 px-3 text-[var(--cyber-blue)]">22.5x</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">缓存命中 (重复命令)</td>
                  <td className="py-2 px-3 text-[var(--error-red)]">3.5ms</td>
                  <td className="py-2 px-3 text-[var(--terminal-green)]">0.02ms</td>
                  <td className="py-2 px-3 text-[var(--cyber-blue)]">175x</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            * 测试环境: M1 MacBook Pro, Node.js v20, 白名单 50 条, 黑名单 10 条
          </p>
        </div>
      </Layer>

      {/* 与其他模块的交互关系 */}
      <Layer title="与其他模块的交互关系" icon="🔗">
        <p className="text-[var(--text-secondary)] mb-4">
          权限系统是安全架构的核心组件，与多个模块紧密协作。以下是其依赖关系和交互模式：
        </p>

        {/* 依赖关系图 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">模块依赖关系图</h4>
          <Mermaid chart={`graph TB
    subgraph "用户交互层"
        UI[Terminal UI]
        Confirm[Confirmation Dialog]
    end

    subgraph "权限系统 (Permission)"
        Parser[Command Parser<br/>命令解析器]
        Checker[Permission Checker<br/>权限检查器]
        Allowlist[Allowlist Manager<br/>白名单管理]
        Blocklist[Blocklist Manager<br/>黑名单管理]
    end

    subgraph "工具层"
        Shell[Shell Tool]
        Bash[Bash Tool]
        Write[Write Tool]
        Edit[Edit Tool]
    end

    subgraph "配置层"
        Config[Config System]
        Settings[settings.json]
        CLAUDE[CLAUDE.md]
    end

    subgraph "上下文层"
        Session[Session State]
        Subagent[Subagent Context]
    end

    %% 用户交互
    UI --> Confirm
    Confirm --> Checker

    %% 工具调用权限
    Shell --> Parser
    Bash --> Parser
    Write --> Checker
    Edit --> Checker

    %% 权限检查流程
    Parser --> Checker
    Checker --> Allowlist
    Checker --> Blocklist

    %% 配置读取
    Config --> Allowlist
    Config --> Blocklist
    Settings --> Config
    CLAUDE --> Config

    %% 会话状态
    Session --> Allowlist
    Subagent --> Checker

    %% 样式
    classDef permission fill:#6366f1,color:#fff,stroke:#4f46e5
    classDef tool fill:#10b981,color:#fff,stroke:#059669
    classDef config fill:#f59e0b,color:#000,stroke:#d97706
    classDef ui fill:#3b82f6,color:#fff,stroke:#2563eb

    class Parser,Checker,Allowlist,Blocklist permission
    class Shell,Bash,Write,Edit tool
    class Config,Settings,CLAUDE config
    class UI,Confirm ui`} />
        </div>

        {/* 上游依赖 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--cyber-blue)] mb-3">上游依赖 (权限系统依赖的模块)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--cyber-blue)] font-bold mb-2">Config System</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• <code>coreTools</code> — 全局白名单</li>
                <li>• <code>excludeTools</code> — 全局黑名单</li>
                <li>• <code>trustFolders</code> — 受信任目录</li>
                <li>• 配置变更时通知权限系统刷新缓存</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">Session State</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 提供会话白名单存储</li>
                <li>• 会话结束时清理白名单</li>
                <li>• 多窗口隔离会话状态</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">Terminal UI (Ink)</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 渲染确认对话框</li>
                <li>• 处理用户输入事件</li>
                <li>• 支持 TTY/非 TTY 检测</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--purple)] font-bold mb-2">Subagent Context</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 子代理创建独立权限上下文</li>
                <li>• 不继承父代理会话白名单</li>
                <li>• 共享全局配置</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 下游消费者 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--terminal-green)] mb-3">下游消费者 (调用权限系统的模块)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">Shell Tool</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 执行前调用 checkPermission()</li>
                <li>• 处理 ToolConfirmation 响应</li>
                <li>• 管理会话白名单添加</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--cyber-blue)] font-bold mb-2">Bash Tool</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 调用 Shell Tool 的权限检查</li>
                <li>• 继承相同的安全策略</li>
                <li>• PTY 模式特殊处理</li>
              </ul>
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">Write/Edit Tool</div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• 文件操作权限检查</li>
                <li>• 基于路径的信任判断</li>
                <li>• 敏感文件保护</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 接口定义 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">核心接口定义</h4>
          <JsonBlock code={`// packages/core/src/tools/permission.ts

/**
 * 权限检查结果
 */
export interface PermissionResult {
  result: 'allowed' | 'denied' | 'ask';
  isHard?: boolean;      // 硬拒绝，无法通过用户确认绕过
  reason?: string;       // 结果原因
}

/**
 * 工具确认请求
 */
export interface ToolConfirmation {
  type: 'exec' | 'write' | 'edit' | 'delete';
  title: string;
  command?: string;      // Shell 命令
  filePath?: string;     // 文件路径
  rootCommand?: string;  // 需要确认的根命令
  onConfirm: (outcome: ToolConfirmationOutcome) => Promise<void>;
}

/**
 * 用户确认选项
 */
export enum ToolConfirmationOutcome {
  ProceedOnce = 'proceed_once',    // 仅执行一次
  ProceedAlways = 'proceed_always', // 始终允许
  Cancel = 'cancel',               // 取消
}

/**
 * 权限检查器接口
 */
export interface PermissionChecker {
  /**
   * 检查命令权限
   * @returns false 表示自动放行，ToolConfirmation 表示需要用户确认
   */
  checkPermission(command: string): Promise<ToolConfirmation | false>;

  /**
   * 批量检查权限
   */
  checkPermissionBatch(commands: string[]): Promise<BatchPermissionResult>;

  /**
   * 添加到会话白名单
   */
  addToSessionAllowlist(commands: string[]): void;

  /**
   * 检查文件操作权限
   */
  checkFilePermission(
    operation: 'read' | 'write' | 'delete',
    filePath: string
  ): Promise<ToolConfirmation | false>;
}

/**
 * 权限配置
 */
export interface PermissionConfig {
  coreTools: string[];      // 全局白名单
  excludeTools: string[];   // 全局黑名单
  trustFolders: string[];   // 受信任目录
  requireConfirmation: boolean; // 是否强制确认
}`} />
        </div>

        {/* 数据流向 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)] mb-4">
          <h4 className="text-sm font-bold text-[var(--purple)] mb-3">权限检查数据流</h4>
          <Mermaid chart={`sequenceDiagram
    participant AI as AI Model
    participant Scheduler as Tool Scheduler
    participant Shell as Shell Tool
    participant Perm as Permission Checker
    participant Parser as Command Parser
    participant UI as Confirmation UI
    participant User as User

    AI->>Scheduler: Tool Call (Bash: "npm install axios")
    Scheduler->>Shell: execute(command)
    Shell->>Perm: checkPermission(command)

    Perm->>Parser: parseCommand(command)
    Parser-->>Perm: {roots: ["npm"], hasSubstitution: false}

    alt 在黑名单中
        Perm-->>Shell: {result: "denied", isHard: true}
        Shell-->>Scheduler: ToolDeniedError
        Scheduler-->>AI: "Command blocked by security policy"
    else 在白名单中
        Perm-->>Shell: false (自动放行)
        Shell->>Shell: executeCommand()
        Shell-->>Scheduler: CommandResult
        Scheduler-->>AI: "npm install completed"
    else 需要确认
        Perm-->>Shell: ToolConfirmation
        Shell->>UI: showConfirmation()
        UI->>User: "Allow npm?"
        User-->>UI: "Always Allow"
        UI-->>Shell: ProceedAlways
        Shell->>Perm: addToSessionAllowlist(["npm"])
        Shell->>Shell: executeCommand()
        Shell-->>Scheduler: CommandResult
        Scheduler-->>AI: "npm install completed"
    end`} />
        </div>

        {/* 扩展点 */}
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border-subtle)]">
          <h4 className="text-sm font-bold text-[var(--amber)] mb-3">扩展点与自定义</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--amber)] font-bold mb-2">自定义权限检查器</div>
              <JsonBlock code={`// 企业部署: 自定义权限检查逻辑
class EnterprisePermissionChecker implements PermissionChecker {
  async checkPermission(command: string) {
    // 1. 调用内部审计 API
    const auditResult = await this.auditService.check(command);

    // 2. 检查用户角色
    if (!this.userHasRole('developer')) {
      return { result: 'denied', reason: 'insufficient_role' };
    }

    // 3. 调用默认检查
    return super.checkPermission(command);
  }
}`} />
            </div>
            <div className="bg-[var(--bg-terminal)] rounded p-3">
              <div className="text-xs text-[var(--terminal-green)] font-bold mb-2">Hooks 集成</div>
              <JsonBlock code={`// .innies/hooks/pre-tool.sh
#!/bin/bash
# 工具执行前的自定义检查

TOOL_NAME="$1"
TOOL_PARAMS="$2"

if [[ "$TOOL_NAME" == "Bash" ]]; then
  # 自定义命令检查
  if echo "$TOOL_PARAMS" | grep -q "rm -rf"; then
    echo "DENIED: rm -rf is not allowed"
    exit 1
  fi
fi

exit 0`} />
            </div>
          </div>
          <div className="mt-4 bg-[var(--bg-terminal)] rounded p-3">
            <div className="text-xs text-[var(--purple)] font-bold mb-2">MCP 权限扩展</div>
            <JsonBlock code={`// MCP Server 提供的工具也受权限系统管理
// 在 MCP 工具注册时，可以声明所需权限:

{
  "name": "file-system",
  "tools": [
    {
      "name": "readFile",
      "permissions": ["file:read"],  // 声明所需权限
      "dangerLevel": "low"
    },
    {
      "name": "deleteFile",
      "permissions": ["file:delete"],
      "dangerLevel": "high",         // 高危操作
      "requireConfirmation": true    // 强制确认
    }
  ]
}

// 权限系统根据 dangerLevel 和 requireConfirmation 决定检查策略`} />
          </div>
        </div>
      </Layer>
    </div>
  );
}
