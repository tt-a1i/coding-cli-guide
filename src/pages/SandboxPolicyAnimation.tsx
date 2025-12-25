// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * 沙箱策略解析器动画
 *
 * 可视化沙箱类型检测和策略应用
 * 源码: packages/core/src/config/config.ts, packages/core/src/core/prompts.ts
 *
 * 沙箱类型:
 * - macOS Seatbelt (sandbox-exec)
 * - Docker/Podman Container
 * - Generic/None
 */

type SandboxType = 'seatbelt' | 'docker' | 'podman' | 'none';
type SandboxProfile = 'permissive-open' | 'restrictive-closed' | 'custom';

interface SandboxConfig {
  type: SandboxType;
  enabled: boolean;
  profile?: SandboxProfile;
  allowedPaths: string[];
  deniedOperations: string[];
}

interface DetectionStep {
  check: string;
  result: boolean;
  detail: string;
}

const SEATBELT_OPERATIONS = {
  allowed: [
    'file-read-data (subpath "/Users/*/code")',
    'file-write-data (subpath "/tmp")',
    'process-exec (literal "/bin/bash")',
    'network-outbound (remote tcp "*:443")',
  ],
  denied: [
    'file-write-data (subpath "/System")',
    'file-write-data (subpath "/usr")',
    'process-exec (literal "/bin/rm")',
    'mach-lookup (global-name "com.apple.*")',
  ],
};

export default function SandboxPolicyAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'detecting' | 'configuring' | 'applying' | 'complete'>('idle');
  const [detectionSteps, setDetectionSteps] = useState<DetectionStep[]>([]);
  const [sandboxConfig, setSandboxConfig] = useState<SandboxConfig | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<SandboxType>('seatbelt');
  const [activePolicy, setActivePolicy] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setPhase('idle');
    setDetectionSteps([]);
    setSandboxConfig(null);
    setLogs([]);
    setActivePolicy([]);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timers: NodeJS.Timeout[] = [];

    switch (phase) {
      case 'idle':
        addLog('🔍 开始沙箱检测');
        setPhase('detecting');
        break;

      case 'detecting':
        const steps: DetectionStep[] = [
          { check: 'process.platform === "darwin"', result: selectedType === 'seatbelt', detail: selectedType === 'seatbelt' ? 'macOS detected' : 'Not macOS' },
          { check: 'GEMINI_SANDBOX env var', result: true, detail: 'GEMINI_SANDBOX=true' },
          { check: 'sandbox-exec available', result: selectedType === 'seatbelt', detail: selectedType === 'seatbelt' ? '/usr/bin/sandbox-exec found' : 'Not found' },
          { check: 'Docker/Podman check', result: selectedType === 'docker' || selectedType === 'podman', detail: selectedType === 'docker' ? 'Docker available' : selectedType === 'podman' ? 'Podman available' : 'Container runtime not found' },
        ];

        steps.forEach((step, i) => {
          timers.push(setTimeout(() => {
            setDetectionSteps(prev => [...prev, step]);
            addLog(`  ${step.result ? '✓' : '✗'} ${step.check}`);
          }, 400 * (i + 1)));
        });

        timers.push(setTimeout(() => {
          addLog(`📋 检测结果: ${selectedType.toUpperCase()}`);
          setPhase('configuring');
        }, 400 * steps.length + 500));
        break;

      case 'configuring':
        addLog('⚙️ 加载沙箱配置');

        timers.push(setTimeout(() => {
          const config: SandboxConfig = {
            type: selectedType,
            enabled: selectedType !== 'none',
            profile: selectedType === 'seatbelt' ? 'permissive-open' : undefined,
            allowedPaths: ['/Users/*/code', '/tmp', '/var/folders'],
            deniedOperations: ['rm -rf /', 'sudo', 'chmod 777'],
          };
          setSandboxConfig(config);
          addLog(`  Profile: ${config.profile || 'default'}`);
          addLog(`  Allowed paths: ${config.allowedPaths.length} rules`);
        }, 600));

        timers.push(setTimeout(() => {
          setPhase('applying');
        }, 1200));
        break;

      case 'applying':
        addLog('🛡️ 应用沙箱策略');

        const policies = selectedType === 'seatbelt' ? SEATBELT_OPERATIONS.allowed : [];

        policies.forEach((policy, i) => {
          timers.push(setTimeout(() => {
            setActivePolicy(prev => [...prev, policy]);
            addLog(`  + ${policy.slice(0, 40)}...`);
          }, 200 * (i + 1)));
        });

        timers.push(setTimeout(() => {
          addLog('✅ 沙箱策略已激活');
          setPhase('complete');
          setIsPlaying(false);
        }, 200 * policies.length + 600));
        break;
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, [isPlaying, phase, selectedType, addLog]);

  const getTypeColor = (type: SandboxType) => {
    switch (type) {
      case 'seatbelt': return '#4285f4';
      case 'docker': return '#2496ed';
      case 'podman': return '#892ca0';
      case 'none': return '#6b7280';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            沙箱策略解析器
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Sandbox Detection & Policy Application
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as SandboxType)}
            disabled={isPlaying}
            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-1.5 text-sm font-mono text-[var(--text-primary)]"
          >
            <option value="seatbelt">macOS Seatbelt</option>
            <option value="docker">Docker</option>
            <option value="podman">Podman</option>
            <option value="none">None</option>
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

      {/* 沙箱类型图例 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 font-mono">
          Sandbox Types
        </h3>
        <div className="flex gap-4">
          {(['seatbelt', 'docker', 'podman', 'none'] as SandboxType[]).map((type) => (
            <div
              key={type}
              className={`flex items-center gap-2 px-3 py-2 rounded border transition-all ${
                selectedType === type ? 'border-[var(--terminal-green)]' : 'border-[var(--border)]'
              }`}
              style={{
                backgroundColor: selectedType === type ? `${getTypeColor(type)}20` : 'transparent',
              }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTypeColor(type) }}
              />
              <span className="text-sm font-mono">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 检测步骤 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-3 font-mono">
              🔍 Detection Steps
            </h3>
            <div className="space-y-2">
              {detectionSteps.length === 0 ? (
                <div className="text-center text-[var(--muted)] py-8 text-sm">
                  等待检测...
                </div>
              ) : (
                detectionSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded border transition-all ${
                      step.result
                        ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={step.result ? 'text-[var(--terminal-green)]' : 'text-red-400'}>
                        {step.result ? '✓' : '✗'}
                      </span>
                      <code className="text-xs text-[var(--text-secondary)]">
                        {step.check}
                      </code>
                    </div>
                    <div className="text-xs text-[var(--muted)] ml-5">
                      {step.detail}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 沙箱配置 */}
        <div className="col-span-4">
          <div className="bg-black/60 rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-3 font-mono">
              ⚙️ Sandbox Config
            </h3>
            {sandboxConfig ? (
              <div className="space-y-3">
                <div className="p-2 rounded bg-[var(--bg-secondary)]">
                  <div className="text-xs text-[var(--muted)]">Type</div>
                  <div
                    className="text-sm font-mono font-bold"
                    style={{ color: getTypeColor(sandboxConfig.type) }}
                  >
                    {sandboxConfig.type.toUpperCase()}
                  </div>
                </div>

                <div className="p-2 rounded bg-[var(--bg-secondary)]">
                  <div className="text-xs text-[var(--muted)]">Profile</div>
                  <div className="text-sm font-mono text-[var(--text-secondary)]">
                    {sandboxConfig.profile || 'default'}
                  </div>
                </div>

                <div className="p-2 rounded bg-[var(--bg-secondary)]">
                  <div className="text-xs text-[var(--muted)] mb-1">Allowed Paths</div>
                  <div className="space-y-1">
                    {sandboxConfig.allowedPaths.map((path, i) => (
                      <div key={i} className="text-xs font-mono text-[var(--terminal-green)]">
                        + {path}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2 rounded bg-[var(--bg-secondary)]">
                  <div className="text-xs text-[var(--muted)] mb-1">Denied Operations</div>
                  <div className="space-y-1">
                    {sandboxConfig.deniedOperations.map((op, i) => (
                      <div key={i} className="text-xs font-mono text-red-400">
                        - {op}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-[var(--muted)] py-12 text-sm">
                等待配置加载...
              </div>
            )}
          </div>
        </div>

        {/* 活动策略 + 日志 */}
        <div className="col-span-4 space-y-4">
          {/* Seatbelt 策略 */}
          {selectedType === 'seatbelt' && (
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
              <h3 className="text-xs font-semibold text-[var(--terminal-green)] mb-2 font-mono">
                🛡️ Seatbelt Rules
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {activePolicy.map((policy, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono text-[var(--terminal-green)] p-1 rounded bg-[var(--terminal-green)]/10"
                  >
                    (allow {policy})
                  </div>
                ))}
                {activePolicy.length === 0 && (
                  <div className="text-xs text-[var(--muted)]">等待策略应用...</div>
                )}
              </div>
            </div>
          )}

          {/* 日志 */}
          <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">
              Sandbox Log
            </h3>
            <div className="space-y-1 text-xs font-mono h-40 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-[var(--muted)]">等待开始...</div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('✓') || log.includes('✅') ? 'text-[var(--terminal-green)]' :
                      log.includes('✗') ? 'text-red-400' :
                      log.includes('🔍') || log.includes('📋') ? 'text-[var(--cyber-blue)]' :
                      log.includes('⚙️') ? 'text-[var(--amber)]' :
                      log.includes('🛡️') ? 'text-[var(--terminal-green)]' :
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
          源码: config.ts + prompts.ts
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <pre className="text-[var(--text-secondary)] bg-black/30 p-2 rounded overflow-x-auto">
{`// config.ts
getSandboxType(): SandboxType {
  if (process.platform === 'darwin') {
    return 'seatbelt';
  }
  if (process.env.GEMINI_SANDBOX) {
    // Check docker/podman
    return detectContainerRuntime();
  }
  return 'none';
}`}
          </pre>
          <pre className="text-[var(--text-secondary)] bg-black/30 p-2 rounded overflow-x-auto">
{`// prompts.ts - 沙箱提示注入
const sandboxSection = \`
# macOS Seatbelt Sandbox
You are running inside a restricted
sandbox environment. Some operations
may be blocked by security policy.

Allowed: file-read-data, process-exec
Denied: file-write-system, mach-lookup
\`;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
