// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';

/**
 * OAuth 设备授权流动画
 *
 * 可视化 inniesOAuth2.ts 设备授权流程
 * 源码: packages/core/src/innies/inniesOAuth2.ts
 *
 * 核心流程:
 * 1. requestDeviceAuthorization() - 获取 deviceCode
 * 2. 打开浏览器验证页面
 * 3. pollDeviceToken() - 轮询等待用户授权
 * 4. 获取 access_token + refresh_token
 * 5. cacheInniesCredentials() - 缓存凭证
 */

type AuthPhase =
  | 'idle'
  | 'requesting_device_code'
  | 'waiting_for_user'
  | 'polling'
  | 'polling_slow_down'
  | 'success'
  | 'timeout'
  | 'error';

interface PollAttempt {
  attempt: number;
  result: 'pending' | 'slow_down' | 'success' | 'error';
  interval: number;
}

const OAUTH_ENDPOINTS = {
  deviceCode: '/api/v1/authn/device/code',
  token: '/api/v1/authn/device/token',
  refresh: '/api/v1/authn/token',
};

export default function OAuthDeviceFlowAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<AuthPhase>('idle');
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [pollAttempts, setPollAttempts] = useState<PollAttempt[]>([]);
  const [currentPollInterval, setCurrentPollInterval] = useState(2000);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [userAuthorized, setUserAuthorized] = useState(false);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toISOString().slice(11, 19)}] ${message}`]);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsPlaying(false);
    setPhase('idle');
    setDeviceCode(null);
    setVerificationUrl(null);
    setPollAttempts([]);
    setCurrentPollInterval(2000);
    setAccessToken(null);
    setRefreshToken(null);
    setExpiryDate(null);
    setLogs([]);
    setUserAuthorized(false);
  }, []);

  // Phase machine
  useEffect(() => {
    if (!isPlaying) return;

    let timer: NodeJS.Timeout;

    switch (phase) {
      case 'idle':
        addLog('🔐 getInniesOAuthClient() 开始');
        setPhase('requesting_device_code');
        break;

      case 'requesting_device_code':
        addLog('📤 requestDeviceAuthorization()');
        addLog(`  → POST ${OAUTH_ENDPOINTS.deviceCode}`);
        timer = setTimeout(() => {
          const code = 'ABCD-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          setDeviceCode(code);
          setVerificationUrl(`http://aikb.yuwei.com/login?device_code=${code}`);
          addLog(`  ✓ deviceCode: ${code}`);
          setPhase('waiting_for_user');
        }, 800);
        break;

      case 'waiting_for_user':
        addLog('🌐 open(verificationUrl)');
        addLog('⏳ 等待用户在浏览器中授权...');
        timer = setTimeout(() => {
          setPhase('polling');
        }, 1500);
        break;

      case 'polling':
        if (userAuthorized) {
          // User clicked authorize
          addLog(`📥 pollDeviceToken() → 成功!`);
          setPollAttempts(prev => [...prev, {
            attempt: prev.length + 1,
            result: 'success',
            interval: currentPollInterval
          }]);
          const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.' + Math.random().toString(36).substring(2, 20);
          const refresh = 'refresh_' + Math.random().toString(36).substring(2, 15);
          setAccessToken(token);
          setRefreshToken(refresh);
          setExpiryDate(Date.now() + 3600 * 1000);
          setPhase('success');
        } else {
          // Continue polling
          const attempt = pollAttempts.length + 1;
          addLog(`📥 pollDeviceToken() 第 ${attempt} 次`);
          addLog(`  → POST ${OAUTH_ENDPOINTS.token}`);

          timer = setTimeout(() => {
            // Simulate slow_down after 3 attempts
            if (attempt === 3) {
              addLog(`  ⚠️ 429 slow_down`);
              setCurrentPollInterval(prev => Math.min(prev * 1.5, 10000));
              setPollAttempts(prev => [...prev, { attempt, result: 'slow_down', interval: currentPollInterval }]);
              setPhase('polling_slow_down');
            } else {
              addLog(`  ⏳ authorization_pending`);
              setPollAttempts(prev => [...prev, { attempt, result: 'pending', interval: currentPollInterval }]);
              // Re-trigger polling after interval
              timer = setTimeout(() => setPhase('polling'), currentPollInterval / 3);
            }
          }, 600);
        }
        break;

      case 'polling_slow_down':
        addLog(`⏱️ 增加轮询间隔到 ${currentPollInterval}ms`);
        timer = setTimeout(() => {
          setPhase('polling');
        }, 800);
        break;

      case 'success':
        addLog('✅ 认证成功!');
        addLog('💾 cacheInniesCredentials()');
        timer = setTimeout(() => {
          addLog('🔒 凭证已安全存储');
          setIsPlaying(false);
        }, 1000);
        break;

      default:
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, phase, pollAttempts, currentPollInterval, userAuthorized, addLog]);

  const handleUserAuthorize = () => {
    if (phase === 'polling' || phase === 'polling_slow_down') {
      setUserAuthorized(true);
      setPhase('polling');
    }
  };

  const getPhaseColor = (p: AuthPhase) => {
    switch (p) {
      case 'idle': return 'var(--muted)';
      case 'requesting_device_code': return 'var(--cyber-blue)';
      case 'waiting_for_user': return 'var(--amber)';
      case 'polling':
      case 'polling_slow_down': return 'var(--purple)';
      case 'success': return 'var(--terminal-green)';
      case 'timeout':
      case 'error': return '#ef4444';
      default: return 'var(--muted)';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">
            OAuth 设备授权流
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            inniesOAuth2 - Device Code Grant Flow (RFC 8628)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">Phase:</span>
            <span
              className="px-2 py-0.5 rounded text-xs font-mono"
              style={{
                backgroundColor: `${getPhaseColor(phase)}20`,
                color: getPhaseColor(phase),
                border: `1px solid ${getPhaseColor(phase)}30`
              }}
            >
              {phase}
            </span>
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
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧: 流程图 */}
        <div className="col-span-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--cyber-blue)] mb-4 font-mono">
              Device Code Flow
            </h3>

            <div className="space-y-4">
              {/* Step 1: Request Device Code */}
              <div className={`relative p-3 rounded-lg border transition-all ${
                phase === 'requesting_device_code'
                  ? 'bg-[var(--cyber-blue)]/20 border-[var(--cyber-blue)]/50 animate-pulse'
                  : deviceCode
                  ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                  : 'bg-black/20 border-[var(--border)]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--cyber-blue)]/20 flex items-center justify-center text-xs text-[var(--cyber-blue)]">1</span>
                  <span className="text-sm font-mono text-[var(--text-primary)]">Request Device Code</span>
                </div>
                <code className="text-xs text-[var(--muted)] block">
                  POST /device/code
                </code>
                {deviceCode && (
                  <div className="mt-2 p-2 bg-black/30 rounded text-xs font-mono">
                    <span className="text-[var(--muted)]">deviceCode: </span>
                    <span className="text-[var(--terminal-green)]">{deviceCode}</span>
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <span className="text-[var(--muted)]">↓</span>
              </div>

              {/* Step 2: User Authorization */}
              <div className={`relative p-3 rounded-lg border transition-all ${
                phase === 'waiting_for_user'
                  ? 'bg-[var(--amber)]/20 border-[var(--amber)]/50 animate-pulse'
                  : userAuthorized
                  ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                  : 'bg-black/20 border-[var(--border)]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--amber)]/20 flex items-center justify-center text-xs text-[var(--amber)]">2</span>
                  <span className="text-sm font-mono text-[var(--text-primary)]">User Authorization</span>
                </div>
                {verificationUrl && (
                  <div className="mt-2 space-y-2">
                    <code className="text-xs text-[var(--muted)] block truncate">
                      {verificationUrl}
                    </code>
                    {(phase === 'polling' || phase === 'polling_slow_down' || phase === 'waiting_for_user') && !userAuthorized && (
                      <button
                        onClick={handleUserAuthorize}
                        className="w-full py-2 rounded bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/30 text-xs font-mono hover:bg-[var(--amber)]/30 transition-all"
                      >
                        🔓 模拟用户授权
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <span className="text-[var(--muted)]">↓</span>
              </div>

              {/* Step 3: Poll for Token */}
              <div className={`relative p-3 rounded-lg border transition-all ${
                phase === 'polling' || phase === 'polling_slow_down'
                  ? 'bg-purple-500/20 border-purple-500/50 animate-pulse'
                  : accessToken
                  ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                  : 'bg-black/20 border-[var(--border)]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400">3</span>
                  <span className="text-sm font-mono text-[var(--text-primary)]">Poll for Token</span>
                </div>
                <code className="text-xs text-[var(--muted)] block">
                  POST /device/token (每 {currentPollInterval}ms)
                </code>
                {pollAttempts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pollAttempts.map((pa, i) => (
                      <span
                        key={i}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          pa.result === 'success'
                            ? 'bg-[var(--terminal-green)]/20 text-[var(--terminal-green)]'
                            : pa.result === 'slow_down'
                            ? 'bg-[var(--amber)]/20 text-[var(--amber)]'
                            : 'bg-[var(--muted)]/20 text-[var(--muted)]'
                        }`}
                      >
                        #{pa.attempt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <span className="text-[var(--muted)]">↓</span>
              </div>

              {/* Step 4: Token Received */}
              <div className={`relative p-3 rounded-lg border transition-all ${
                phase === 'success'
                  ? 'bg-[var(--terminal-green)]/20 border-[var(--terminal-green)]/50'
                  : accessToken
                  ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/30'
                  : 'bg-black/20 border-[var(--border)]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--terminal-green)]/20 flex items-center justify-center text-xs text-[var(--terminal-green)]">4</span>
                  <span className="text-sm font-mono text-[var(--text-primary)]">Token Received</span>
                </div>
                {accessToken && (
                  <div className="mt-2 space-y-1 text-xs font-mono">
                    <div className="p-1.5 bg-black/30 rounded truncate">
                      <span className="text-[var(--muted)]">access_token: </span>
                      <span className="text-[var(--terminal-green)]">{accessToken.slice(0, 30)}...</span>
                    </div>
                    <div className="p-1.5 bg-black/30 rounded">
                      <span className="text-[var(--muted)]">refresh_token: </span>
                      <span className="text-[var(--cyber-blue)]">{refreshToken}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 中间: 状态详情 */}
        <div className="col-span-5">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)] h-full">
            <h3 className="text-sm font-semibold text-[var(--amber)] mb-4 font-mono">
              InniesCredentials
            </h3>

            <div className="space-y-4">
              {/* Credential Fields */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'access_token', value: accessToken, color: 'var(--terminal-green)' },
                  { key: 'refresh_token', value: refreshToken, color: 'var(--cyber-blue)' },
                  { key: 'token_type', value: accessToken ? 'Bearer' : null, color: 'var(--muted)' },
                  { key: 'expiry_date', value: expiryDate ? new Date(expiryDate).toISOString() : null, color: 'var(--amber)' },
                ].map(({ key, value, color }) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border ${
                      value
                        ? 'bg-black/30 border-[var(--border)]'
                        : 'bg-black/10 border-[var(--border)] opacity-50'
                    }`}
                  >
                    <div className="text-xs text-[var(--muted)] font-mono mb-1">{key}</div>
                    <div
                      className="text-sm font-mono truncate"
                      style={{ color: value ? color : 'var(--muted)' }}
                    >
                      {value ? (key === 'access_token' ? value.slice(0, 20) + '...' : value) : 'null'}
                    </div>
                  </div>
                ))}
              </div>

              {/* OAuth Config */}
              <div className="p-3 bg-black/30 rounded-lg border border-[var(--border)]">
                <h4 className="text-xs font-mono text-[var(--muted)] mb-2">OAuth 配置</h4>
                <div className="space-y-1 text-xs font-mono">
                  <div><span className="text-[var(--muted)]">baseUrl:</span> <span className="text-[var(--text-secondary)]">http://aikb.yuwei.com</span></div>
                  <div><span className="text-[var(--muted)]">clientId:</span> <span className="text-[var(--text-secondary)]">security-admin-console</span></div>
                  <div><span className="text-[var(--muted)]">grantType:</span> <span className="text-[var(--cyber-blue)]">urn:ietf:params:oauth:grant-type:device_code</span></div>
                </div>
              </div>

              {/* Poll Interval Visualization */}
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <h4 className="text-xs font-mono text-purple-400 mb-2">轮询间隔</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${Math.min(currentPollInterval / 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-purple-400">{currentPollInterval}ms</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-2">
                  收到 429 slow_down 时自动增加间隔 (最大 10s)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧: 日志 */}
        <div className="col-span-3">
          <div className="bg-black/80 rounded-lg p-4 border border-[var(--border)] h-full">
            <h3 className="text-xs font-semibold text-[var(--muted)] mb-2 font-mono">
              Auth Log
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
                      log.includes('⚠️') ? 'text-[var(--amber)]' :
                      log.includes('📤') || log.includes('📥') ? 'text-[var(--cyber-blue)]' :
                      log.includes('⏳') ? 'text-purple-400' :
                      log.includes('🔐') || log.includes('💾') ? 'text-[var(--amber)]' :
                      'text-[var(--text-secondary)]'
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
          源码: inniesOAuth2.ts
        </h3>
        <pre className="text-xs font-mono text-[var(--text-secondary)] bg-black/30 p-3 rounded overflow-x-auto">
{`async function authWithInniesDeviceFlow(client, config): Promise<AuthResult> {
  // 1. 请求设备授权码
  const deviceAuth = await client.requestDeviceAuthorization();
  const verificationUrl = \`\${BASE_URL}/login?device_code=\${deviceAuth.deviceCode}\`;

  // 2. 打开浏览器
  if (!config.isBrowserLaunchSuppressed()) {
    await open(verificationUrl);
  }

  // 3. 轮询等待用户授权
  let pollInterval = 2000;
  const maxAttempts = 150;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const tokenResponse = await client.pollDeviceToken({ deviceCode });

    if (isDeviceTokenSuccess(tokenResponse)) {
      // 4. 成功获取 token
      const credentials = {
        access_token: tokenResponse.accessToken,
        refresh_token: tokenResponse.refreshToken,
        expiry_date: Date.now() + tokenResponse.expiresIn * 1000,
      };
      client.setCredentials(credentials);
      await cacheInniesCredentials(credentials);
      return { success: true };
    }

    if (isDeviceTokenPending(tokenResponse)) {
      if (tokenResponse.slowDown) {
        pollInterval = Math.min(pollInterval * 1.5, 10000);
      }
      await sleep(pollInterval);
    }
  }

  return { success: false, reason: 'timeout' };
}`}
        </pre>
      </div>
    </div>
  );
}
