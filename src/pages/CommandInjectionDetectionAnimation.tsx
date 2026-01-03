// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * 命令注入检测动画
 *
 * 可视化 Shell 命令的“权限 + 策略”安全决策流程
 * 源码: packages/core/src/utils/shell-permissions.ts + packages/core/src/policy/policy-engine.ts + shell-utils.ts
 *
 * 本动画聚焦:
 * - checkCommandPermissions(): tools.exclude / tools.core（allowlist+blocklist）与 sessionAllowlist（default deny）
 * - PolicyEngine.checkShellCommand(): redirection 检测（allowRedirection=false 时把 ALLOW 降级为 ASK_USER）
 * - shell-utils: splitCommands/hasRedirection/getCommandRoots（解析能力）
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

// 演示用配置（简化版）：模拟 settings.tools.exclude / settings.tools.core
const EXAMPLE_TOOLS_EXCLUDE = [
  'run_shell_command(rm -rf)',
  'run_shell_command(sudo)',
] as const;

const EXAMPLE_TOOLS_CORE = [
  'run_shell_command(git)',
  'run_shell_command(npm test)',
] as const;

// 演示：PolicyRule.allowRedirection=false 时，含重定向的命令会从 ALLOW 降级为 ASK_USER
const EXAMPLE_ALLOW_REDIRECTION = false;

const SAMPLE_COMMANDS = [
  { cmd: 'git status', expected: 'safe' },
  { cmd: 'git status && git log', expected: 'safe' },
  { cmd: 'rm -rf /', expected: 'blocked' },
  { cmd: 'sudo rm -rf /', expected: 'blocked' },
  { cmd: 'npm test > output.log', expected: 'warning' },
  { cmd: 'python -c "print(1)"', expected: 'warning' },
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
    const segments = cmd
      .split(/\s*(?:&&|\|\||;|\|)\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    const rootCommand = segments[0]?.split(/\s+/)[0] || '';
    const checks: SecurityCheck[] = [];

    const hasBalancedQuotes = (value: string) => {
      const doubleQuotes = (value.match(/"/g) || []).length;
      const singleQuotes = (value.match(/'/g) || []).length;
      return doubleQuotes % 2 === 0 && singleQuotes % 2 === 0;
    };

    const parsePattern = (pattern: string): { tool: string; arg?: string } | null => {
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
    };

    const matchesPatterns = (command: string, patterns: readonly string[]) => {
      for (const pattern of patterns) {
        const parsed = parsePattern(pattern);
        if (!parsed) continue;
        if (parsed.tool !== 'run_shell_command' && parsed.tool !== 'ShellTool') continue;
        if (!parsed.arg) return true;
        if (command === parsed.arg || command.startsWith(parsed.arg + ' ')) return true;
      }
      return false;
    };

    // 1) 解析是否可控（上游用 shell parser；这里用“引号平衡”做近似演示）
    const parseOk = hasBalancedQuotes(cmd);
    checks.push({
      name: 'parseCommandDetails()',
      passed: parseOk,
      detail: parseOk ? 'Parsed (simulated) OK' : 'Parse failed (simulated): unbalanced quotes',
      severity: parseOk ? 'safe' : 'blocked',
    });

    // 2) tools.exclude（blocklist，优先级最高）
    const isWildcardBlocked = EXAMPLE_TOOLS_EXCLUDE.some(
      (p) => p === 'run_shell_command' || p === 'ShellTool',
    );
    const blockedSegment = isWildcardBlocked
      ? segments[0]
      : segments.find((seg) => matchesPatterns(seg, EXAMPLE_TOOLS_EXCLUDE));

    checks.push({
      name: 'checkCommandPermissions(): tools.exclude',
      passed: !blockedSegment,
      detail: blockedSegment ? `Blocked: ${JSON.stringify(blockedSegment)}` : 'Not blocked by tools.exclude',
      severity: blockedSegment ? 'blocked' : 'safe',
    });

    // 3) tools.core（strict allowlist：出现 run_shell_command(...) 时，未覆盖会变成 soft denial）
    const isWildcardAllowed = EXAMPLE_TOOLS_CORE.some(
      (p) => p === 'run_shell_command' || p === 'ShellTool',
    );
    const hasSpecificAllowed = EXAMPLE_TOOLS_CORE.some((p) => p.includes('('));

    const allowlistMiss =
      !isWildcardAllowed && hasSpecificAllowed
        ? segments.find((seg) => !matchesPatterns(seg, EXAMPLE_TOOLS_CORE))
        : undefined;

    checks.push({
      name: 'checkCommandPermissions(): tools.core',
      passed: !allowlistMiss,
      detail: allowlistMiss
        ? `Not allowlisted: ${JSON.stringify(allowlistMiss)} (strict allowlist active)`
        : isWildcardAllowed
          ? 'Wildcard allow for shell'
          : hasSpecificAllowed
            ? 'Covered by allowlist patterns'
            : 'No strict allowlist configured',
      severity: allowlistMiss ? 'warning' : 'safe',
    });

    // 4) PolicyEngine：含重定向时默认把 ALLOW 降级为 ASK_USER（除非 allowRedirection=true）
    const hasRedirection = /[><]/.test(cmd);
    const needsRedirectionConfirm = hasRedirection && !EXAMPLE_ALLOW_REDIRECTION;

    checks.push({
      name: 'PolicyEngine.checkShellCommand(): hasRedirection()',
      passed: !needsRedirectionConfirm,
      detail: needsRedirectionConfirm
        ? 'Found redirection; ALLOW → ASK_USER (allowRedirection=false)'
        : 'No redirection downgrade',
      severity: needsRedirectionConfirm ? 'warning' : 'safe',
    });

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
      addLog('🔒 checkCommandPermissions() + PolicyEngine.checkShellCommand() 开始扫描');
      setCurrentCommandIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      const { cmd } = SAMPLE_COMMANDS[currentCommandIndex];
      addLog(`📝 检测: "${cmd.slice(0, 40)}${cmd.length > 40 ? '...' : ''}"`);

      const analysis = analyzeCommand(cmd);
      setAnalyses(prev => [...prev, analysis]);

      if (analysis.isAllowed && !analysis.requiresPermission) {
        addLog(`  ✓ ALLOW（无需确认）`);
      } else if (analysis.requiresPermission) {
        addLog(`  ⚠️ ASK_USER（需要确认）`);
      } else {
        addLog(`  ✗ DENY（配置阻止）`);
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
            shell-permissions + policy-engine - Shell 安全决策流程
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

      {/* 示例配置 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--terminal-green)] mb-3 font-mono">
          Example Settings (tools.exclude / tools.core)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-[var(--muted)] mb-2 font-mono">tools.exclude</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TOOLS_EXCLUDE.map((p) => (
                <span
                  key={p}
                  className="text-xs font-mono px-2 py-1 rounded bg-red-500/10 text-red-300 border border-red-500/30"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--muted)] mb-2 font-mono">tools.core</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TOOLS_CORE.map((p) => (
                <span
                  key={p}
                  className="text-xs font-mono px-2 py-1 rounded bg-[var(--cyber-blue)]/10 text-[var(--cyber-blue)] border border-[var(--cyber-blue)]/30"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--muted)] mb-2 font-mono">PolicyRule.allowRedirection</div>
            <div className="text-xs font-mono px-2 py-1 rounded bg-[var(--amber)]/10 text-[var(--amber)] border border-[var(--amber)]/30 inline-block">
              {String(EXAMPLE_ALLOW_REDIRECTION)}
            </div>
          </div>
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
          源码: shell-permissions.ts + policy-engine.ts
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`// packages/core/src/utils/shell-permissions.ts（简化）
export function checkCommandPermissions(command, config, sessionAllowlist?) {
  // 1) parseCommandDetails(command) 失败 → Hard deny
  // 2) tools.exclude：匹配到 run_shell_command(...) → Hard deny
  // 3) tools.core：
  //    - 有 run_shell_command(...) → strict allowlist（未覆盖 → Soft deny）
  //    - 有 run_shell_command → wildcard allow
  // 4) sessionAllowlist 存在时 → default deny（用于自定义命令注入）
}

// packages/core/src/policy/policy-engine.ts（简化）
private async checkShellCommand(toolName, command, ruleDecision, ..., allowRedirection?) {
  // splitCommands(command) → 逐段递归 check()
  // 若含重定向且 allowRedirection=false：ALLOW → ASK_USER
}`}
        </pre>
      </div>
    </div>
  );
}
