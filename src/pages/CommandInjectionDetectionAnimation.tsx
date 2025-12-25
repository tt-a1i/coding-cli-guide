// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * 命令注入检测动画
 *
 * 可视化 Shell 命令安全检测流程
 * 源码: packages/core/src/utils/shellReadOnlyChecker.ts + shell-utils.ts
 *
 * 检测项目:
 * - 只读命令白名单 (READ_ONLY_ROOT_COMMANDS)
 * - 命令替换检测 ($(), ``, <(), >())
 * - 写重定向检测 (>)
 * - Git 子命令检查
 * - find/sed 危险参数检测
 */

interface SecurityCheck {
  name: string;
  passed: boolean;
  detail: string;
  severity: 'safe' | 'warning' | 'blocked';
}

interface CommandAnalysis {
  command: string;
  rootCommand: string;
  segments: string[];
  checks: SecurityCheck[];
  isAllowed: boolean;
  requiresPermission: boolean;
}

const READ_ONLY_COMMANDS = new Set([
  'awk', 'cat', 'cd', 'cut', 'df', 'du', 'echo', 'env', 'find',
  'git', 'grep', 'head', 'less', 'ls', 'more', 'printenv', 'printf',
  'ps', 'pwd', 'rg', 'sed', 'sort', 'stat', 'tail', 'tree', 'uniq', 'wc', 'which'
]);

const SAMPLE_COMMANDS = [
  { cmd: 'ls -la /tmp', expected: 'safe' },
  { cmd: 'cat /etc/passwd', expected: 'safe' },
  { cmd: 'git status && git log', expected: 'safe' },
  { cmd: 'rm -rf /', expected: 'blocked' },
  { cmd: 'echo $(cat /etc/shadow)', expected: 'blocked' },
  { cmd: 'find / -exec rm {} \\;', expected: 'blocked' },
  { cmd: 'npm test > output.log', expected: 'warning' },
  { cmd: 'git push origin main', expected: 'warning' },
];

export default function CommandInjectionDetectionAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(-1);
  const [analyses, setAnalyses] = useState<CommandAnalysis[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [customCommand, setCustomCommand] = useState('');

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setCurrentCommandIndex(-1);
    setAnalyses([]);
    setLogs([]);
    setIsPlaying(false);
  }, []);

  // 模拟安全检测
  const analyzeCommand = useCallback((cmd: string): CommandAnalysis => {
    const segments = cmd.split(/\s*&&\s*|\s*\|\|\s*|\s*;\s*/);
    const rootCommand = cmd.trim().split(/\s+/)[0] || '';
    const checks: SecurityCheck[] = [];

    // 1. 只读命令检查
    const isReadOnlyCommand = READ_ONLY_COMMANDS.has(rootCommand.toLowerCase());
    checks.push({
      name: 'READ_ONLY_ROOT_COMMANDS',
      passed: isReadOnlyCommand,
      detail: isReadOnlyCommand ? `"${rootCommand}" is whitelisted` : `"${rootCommand}" not in whitelist`,
      severity: isReadOnlyCommand ? 'safe' : 'warning',
    });

    // 2. 命令替换检测
    const hasCommandSubstitution = /\$\(|\`|<\(|>\(/.test(cmd);
    checks.push({
      name: 'detectCommandSubstitution()',
      passed: !hasCommandSubstitution,
      detail: hasCommandSubstitution ? 'Found: $() or `` or <() or >()' : 'No command substitution',
      severity: hasCommandSubstitution ? 'blocked' : 'safe',
    });

    // 3. 写重定向检测
    const hasWriteRedirection = />(?!>)/.test(cmd) && !/>>/.test(cmd);
    checks.push({
      name: 'containsWriteRedirection()',
      passed: !hasWriteRedirection,
      detail: hasWriteRedirection ? 'Found: > (write redirection)' : 'No write redirection',
      severity: hasWriteRedirection ? 'warning' : 'safe',
    });

    // 4. 危险命令检测
    const dangerousCommands = ['rm', 'sudo', 'chmod', 'chown', 'mkfs', 'dd'];
    const hasDangerous = dangerousCommands.some(dc => cmd.toLowerCase().includes(dc));
    checks.push({
      name: 'Dangerous Command Check',
      passed: !hasDangerous,
      detail: hasDangerous ? `Found dangerous command` : 'No dangerous commands',
      severity: hasDangerous ? 'blocked' : 'safe',
    });

    // 5. Git 子命令检查
    if (rootCommand === 'git') {
      const gitArgs = cmd.split(/\s+/).slice(1);
      const subcommand = gitArgs[0] || '';
      const readOnlyGitSubcommands = ['status', 'log', 'diff', 'branch', 'remote', 'show', 'blame'];
      const isReadOnlyGit = readOnlyGitSubcommands.includes(subcommand);
      checks.push({
        name: 'READ_ONLY_GIT_SUBCOMMANDS',
        passed: isReadOnlyGit,
        detail: isReadOnlyGit ? `"git ${subcommand}" is read-only` : `"git ${subcommand}" may modify repo`,
        severity: isReadOnlyGit ? 'safe' : 'warning',
      });
    }

    // 6. find 危险参数检测
    if (rootCommand === 'find') {
      const hasDangerousFind = /-exec|-delete|-fprint/.test(cmd);
      checks.push({
        name: 'BLOCKED_FIND_FLAGS',
        passed: !hasDangerousFind,
        detail: hasDangerousFind ? 'Found: -exec or -delete' : 'Safe find usage',
        severity: hasDangerousFind ? 'blocked' : 'safe',
      });
    }

    const hasBlocked = checks.some(c => c.severity === 'blocked');
    const hasWarning = checks.some(c => c.severity === 'warning');

    return {
      command: cmd,
      rootCommand,
      segments,
      checks,
      isAllowed: !hasBlocked,
      requiresPermission: hasWarning && !hasBlocked,
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    if (currentCommandIndex >= SAMPLE_COMMANDS.length) {
      addLog('✅ 安全扫描完成');
      setIsPlaying(false);
      return;
    }

    if (currentCommandIndex === -1) {
      addLog('🔒 isShellCommandReadOnly() 开始扫描');
      setCurrentCommandIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      const { cmd } = SAMPLE_COMMANDS[currentCommandIndex];
      addLog(`📝 检测: "${cmd.slice(0, 40)}${cmd.length > 40 ? '...' : ''}"`);

      const analysis = analyzeCommand(cmd);
      setAnalyses(prev => [...prev, analysis]);

      if (analysis.isAllowed && !analysis.requiresPermission) {
        addLog(`  ✓ 允许执行 (只读)`);
      } else if (analysis.requiresPermission) {
        addLog(`  ⚠️ 需要用户确认`);
      } else {
        addLog(`  ✗ 已阻止 (安全策略)`);
      }

      setCurrentCommandIndex(prev => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [isPlaying, currentCommandIndex, addLog, analyzeCommand]);

  const handleTestCustomCommand = () => {
    if (!customCommand.trim()) return;
    const analysis = analyzeCommand(customCommand);
    setAnalyses(prev => [...prev, analysis]);
    addLog(`📝 自定义检测: "${customCommand.slice(0, 30)}..."`);
    if (analysis.isAllowed && !analysis.requiresPermission) {
      addLog(`  ✓ 允许执行`);
    } else if (analysis.requiresPermission) {
      addLog(`  ⚠️ 需要确认`);
    } else {
      addLog(`  ✗ 已阻止`);
    }
    setCustomCommand('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'safe': return 'var(--terminal-green)';
      case 'warning': return 'var(--amber)';
      case 'blocked': return '#ef4444';
      default: return 'var(--muted)';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            命令注入检测
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            shellReadOnlyChecker - 命令安全验证流程
          </p>
        </div>
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

      {/* 只读命令白名单 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--terminal-green)] mb-3 font-mono">
          READ_ONLY_ROOT_COMMANDS
        </h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(READ_ONLY_COMMANDS).slice(0, 20).map((cmd) => (
            <span
              key={cmd}
              className="text-xs font-mono px-2 py-1 rounded bg-[var(--terminal-green)]/10 text-[var(--terminal-green)] border border-[var(--terminal-green)]/30"
            >
              {cmd}
            </span>
          ))}
          <span className="text-xs text-[var(--muted)]">+{READ_ONLY_COMMANDS.size - 20} more</span>
        </div>
      </div>

      {/* 自定义命令测试 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
          🧪 Test Custom Command
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customCommand}
            onChange={(e) => setCustomCommand(e.target.value)}
            placeholder="Enter command to test..."
            className="flex-1 bg-black/40 border border-[var(--border)] rounded px-3 py-2 text-sm font-mono text-[var(--text-primary)]"
            onKeyDown={(e) => e.key === 'Enter' && handleTestCustomCommand()}
          />
          <button
            onClick={handleTestCustomCommand}
            className="px-4 py-2 rounded bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] border border-[var(--cyber-blue)]/30 font-mono text-sm"
          >
            Test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 检测结果 */}
        <div className="col-span-8">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-3 font-mono">
              🔍 Security Analysis
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analyses.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-12 text-sm">
                  等待分析...
                </div>
              ) : (
                analyses.map((analysis, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border transition-all ${
                      !analysis.isAllowed
                        ? 'bg-red-500/10 border-red-500/30'
                        : analysis.requiresPermission
                        ? 'bg-[var(--amber)]/10 border-[var(--amber)]/30'
                        : 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono text-[var(--text-primary)]">
                        $ {analysis.command}
                      </code>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${getSeverityColor(analysis.isAllowed ? (analysis.requiresPermission ? 'warning' : 'safe') : 'blocked')}20`,
                          color: getSeverityColor(analysis.isAllowed ? (analysis.requiresPermission ? 'warning' : 'safe') : 'blocked'),
                        }}
                      >
                        {!analysis.isAllowed ? 'BLOCKED' : analysis.requiresPermission ? 'CONFIRM' : 'ALLOWED'}
                      </span>
                    </div>

                    <div className="space-y-1 mt-3">
                      {analysis.checks.map((check, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span style={{ color: getSeverityColor(check.severity) }}>
                            {check.passed ? '✓' : '✗'}
                          </span>
                          <span className="font-mono text-[var(--muted)]">{check.name}:</span>
                          <span className="text-[var(--text-secondary)]">{check.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 日志 */}
        <div className="col-span-4">
          <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)] h-full">
            <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">
              Security Log
            </h3>
            <div className="space-y-1 text-xs font-mono h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-[var(--muted)]">等待开始...</div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('✓') || log.includes('✅') ? 'text-[var(--terminal-green)]' :
                      log.includes('✗') ? 'text-red-400' :
                      log.includes('⚠️') ? 'text-[var(--amber)]' :
                      log.includes('🔒') || log.includes('📝') ? 'text-[var(--cyber-blue)]' :
                      'text-[var(--muted)]'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 源码说明 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          源码: shellReadOnlyChecker.ts
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`export function isShellCommandReadOnly(command: string): boolean {
  // 1. Split command into segments (&&, ||, ;)
  const segments = splitCommands(command);

  for (const segment of segments) {
    // 2. Check for command substitution $(), \`\`, <(), >()
    if (detectCommandSubstitution(stripped)) return false;

    // 3. Check for write redirection >
    if (containsWriteRedirection(stripped)) return false;

    // 4. Normalize and get root command
    const { root, args } = skipEnvironmentAssignments(tokens);

    // 5. Check against READ_ONLY_ROOT_COMMANDS whitelist
    if (!READ_ONLY_ROOT_COMMANDS.has(normalizedRoot)) return false;

    // 6. Special handling for find, sed, git
    if (normalizedRoot === 'find') return evaluateFindCommand([root, ...args]);
    if (normalizedRoot === 'git') return evaluateGitCommand([root, ...args]);
  }

  return true; // All segments passed
}`}
        </pre>
      </div>
    </div>
  );
}
