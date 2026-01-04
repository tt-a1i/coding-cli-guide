import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * OAuth 登录流程动画（上游 gemini-cli）
 *
 * 对齐源码：
 * - gemini-cli/packages/core/src/code_assist/oauth2.ts
 * - gemini-cli/packages/core/src/utils/browser.ts
 *
 * 重点：上游主线是“浏览器登录 + loopback 回调”，不是 RFC8628 device_code 轮询。
 * 无浏览器环境（NO_BROWSER/CI/SSH 等）会回退为“手动粘贴授权码”（带 PKCE）。
 */

type Mode = 'web' | 'manual';

type Phase =
  | 'idle'
  | 'decide_mode'
  | 'web_start_server'
  | 'web_generate_auth_url'
  | 'web_open_browser'
  | 'web_wait_callback'
  | 'web_exchange_token'
  | 'manual_generate_pkce'
  | 'manual_print_auth_url'
  | 'manual_wait_code'
  | 'manual_exchange_token'
  | 'persist_tokens'
  | 'success';

type TokenBundle = {
  accessToken: string;
  refreshToken?: string;
  expiryDateMs: number;
};

function shortToken(token: string) {
  if (!token) return '';
  return token.length <= 18 ? token : `${token.slice(0, 8)}…${token.slice(-6)}`;
}

export default function OAuthDeviceFlowAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [mode, setMode] = useState<Mode>('web');

  // Environment signals (simulated)
  const [noBrowserEnv, setNoBrowserEnv] = useState(false);
  const [ciEnv, setCiEnv] = useState(false);
  const [sshEnv, setSshEnv] = useState(false);
  const [hasDisplay, setHasDisplay] = useState(true);
  const [browserBlocklisted, setBrowserBlocklisted] = useState(false);

  const [port, setPort] = useState<number | null>(null);
  const [state, setStateValue] = useState<string | null>(null);
  const [redirectUri, setRedirectUri] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState<string | null>(null);

  const [pkce, setPkce] = useState<{ verifier: string; challenge: string } | null>(null);
  const [tokens, setTokens] = useState<TokenBundle | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const shouldAttemptBrowserLaunch = useMemo(() => {
    if (noBrowserEnv) return false;
    if (ciEnv) return false;
    if (browserBlocklisted) return false;
    if (sshEnv && !hasDisplay) return false;
    return true;
  }, [browserBlocklisted, ciEnv, hasDisplay, noBrowserEnv, sshEnv]);

  const addLog = useCallback((message: string) => {
    const ts = new Date().toISOString().slice(11, 19);
    setLogs((prev) => [...prev.slice(-14), `[${ts}] ${message}`]);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setPhase('idle');
    setMode('web');
    setPort(null);
    setStateValue(null);
    setRedirectUri(null);
    setAuthUrl(null);
    setAuthCode(null);
    setPkce(null);
    setTokens(null);
    setLogs([]);
  }, []);

  const start = useCallback(() => {
    reset();
    setTimeout(() => {
      setIsPlaying(true);
      setPhase('decide_mode');
    }, 50);
  }, [reset]);

  const simulateCallback = useCallback(() => {
    if (phase !== 'web_wait_callback') return;
    const code = `code_${Math.random().toString(36).slice(2, 10)}`;
    setAuthCode(code);
    addLog(`收到回调：/oauth2callback?code=${code}&state=${state ?? '…'}`);
    setPhase('web_exchange_token');
  }, [addLog, phase, state]);

  const simulatePasteCode = useCallback(() => {
    if (phase !== 'manual_wait_code') return;
    const code = `code_${Math.random().toString(36).slice(2, 10)}`;
    setAuthCode(code);
    addLog(`用户粘贴授权码：${code}`);
    setPhase('manual_exchange_token');
  }, [addLog, phase]);

  useEffect(() => {
    if (!isPlaying) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    switch (phase) {
      case 'decide_mode': {
        const m: Mode = shouldAttemptBrowserLaunch ? 'web' : 'manual';
        setMode(m);
        addLog(`browser policy: shouldAttemptBrowserLaunch=${String(shouldAttemptBrowserLaunch)}`);
        addLog(m === 'web' ? '选择：Web 登录（loopback 回调）' : '选择：手动授权码（NO_BROWSER）');
        timer = setTimeout(() => {
          setPhase(m === 'web' ? 'web_start_server' : 'manual_generate_pkce');
        }, 400);
        break;
      }

      case 'web_start_server': {
        addLog('启动本地回调服务器：listen localhost:{port}/oauth2callback');
        setPort(43127);
        timer = setTimeout(() => setPhase('web_generate_auth_url'), 600);
        break;
      }

      case 'web_generate_auth_url': {
        const p = port ?? 43127;
        const s = Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
        const ru = `http://localhost:${p}/oauth2callback`;
        setStateValue(s);
        setRedirectUri(ru);
        setAuthUrl(`https://accounts.google.com/o/oauth2/v2/auth?...&redirect_uri=${encodeURIComponent(ru)}&state=${s}`);
        addLog('生成 authUrl（state + redirect_uri），准备 open(authUrl)');
        timer = setTimeout(() => setPhase('web_open_browser'), 600);
        break;
      }

      case 'web_open_browser': {
        addLog('open(authUrl)：尝试打开浏览器');
        timer = setTimeout(() => setPhase('web_wait_callback'), 500);
        break;
      }

      case 'web_wait_callback': {
        addLog('等待浏览器回调…（超时保护 5 分钟）');
        timer = setTimeout(() => {
          const code = `code_${Math.random().toString(36).slice(2, 10)}`;
          setAuthCode(code);
          addLog(`收到回调：/oauth2callback?code=${code}&state=${state ?? '…'}`);
          setPhase('web_exchange_token');
        }, 2200);
        break;
      }

      case 'web_exchange_token': {
        addLog(`getToken(code) → tokens (access/refresh/expiry)`);
        setTokens({
          accessToken: `ya29.${Math.random().toString(36).slice(2)}`,
          refreshToken: `1//0g${Math.random().toString(36).slice(2)}`,
          expiryDateMs: Date.now() + 60 * 60 * 1000,
        });
        timer = setTimeout(() => setPhase('persist_tokens'), 700);
        break;
      }

      case 'manual_generate_pkce': {
        const verifier = Math.random().toString(36).repeat(3).slice(2, 50);
        const challenge = `S256(${verifier.slice(0, 10)}…)`;
        setPkce({ verifier, challenge });
        addLog('生成 PKCE：code_verifier + code_challenge');
        timer = setTimeout(() => setPhase('manual_print_auth_url'), 600);
        break;
      }

      case 'manual_print_auth_url': {
        const s = Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
        setStateValue(s);
        setRedirectUri('https://codeassist.google.com/authcode');
        setAuthUrl(
          `https://accounts.google.com/o/oauth2/v2/auth?...&redirect_uri=${encodeURIComponent(
            'https://codeassist.google.com/authcode',
          )}&code_challenge=${encodeURIComponent(pkce?.challenge ?? '...')}&state=${s}`,
        );
        addLog('打印授权 URL：请在浏览器中打开并复制 authorization code');
        timer = setTimeout(() => setPhase('manual_wait_code'), 600);
        break;
      }

      case 'manual_wait_code': {
        addLog('等待用户粘贴授权码…');
        timer = setTimeout(() => {
          const code = `code_${Math.random().toString(36).slice(2, 10)}`;
          setAuthCode(code);
          addLog(`用户粘贴授权码：${code}`);
          setPhase('manual_exchange_token');
        }, 2600);
        break;
      }

      case 'manual_exchange_token': {
        addLog('getToken(code, codeVerifier) → tokens');
        setTokens({
          accessToken: `ya29.${Math.random().toString(36).slice(2)}`,
          refreshToken: `1//0g${Math.random().toString(36).slice(2)}`,
          expiryDateMs: Date.now() + 60 * 60 * 1000,
        });
        timer = setTimeout(() => setPhase('persist_tokens'), 800);
        break;
      }

      case 'persist_tokens': {
        addLog(`client.on('tokens')：保存 token（HybridTokenStorage / ~/.gemini/oauth_creds.json 迁移）`);
        timer = setTimeout(() => setPhase('success'), 700);
        break;
      }

      case 'success': {
        addLog('✅ 登录完成');
        setIsPlaying(false);
        break;
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, phase]);

  const phaseBadgeColor = (p: Phase) => {
    switch (p) {
      case 'idle':
        return 'var(--text-muted)';
      case 'decide_mode':
        return 'var(--amber)';
      case 'success':
        return 'var(--terminal-green)';
      default:
        return 'var(--cyber-blue)';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--terminal-green)] font-mono">OAuth 登录流程（上游 gemini-cli）</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Web loopback 回调 + NO_BROWSER 手动授权码（PKCE）
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">Phase:</span>
          <span
            className="px-2 py-0.5 rounded text-xs font-mono"
            style={{
              backgroundColor: `${phaseBadgeColor(phase)}20`,
              color: phaseBadgeColor(phase),
              border: `1px solid ${phaseBadgeColor(phase)}30`,
            }}
          >
            {phase}
          </span>
          <button
            onClick={() => (isPlaying ? reset() : start())}
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

      {/* Environment toggles */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm font-mono text-[var(--terminal-green)]">Env Signals（模拟）</div>
          <div className="text-xs text-[var(--text-muted)] font-mono">
            shouldAttemptBrowserLaunch={String(shouldAttemptBrowserLaunch)} → mode={mode}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
          {[
            { id: 'NO_BROWSER', v: noBrowserEnv, set: setNoBrowserEnv },
            { id: 'CI', v: ciEnv, set: setCiEnv },
            { id: 'SSH_CONNECTION', v: sshEnv, set: setSshEnv },
            { id: 'DISPLAY/GUI', v: hasDisplay, set: setHasDisplay },
            { id: 'BROWSER=www-browser', v: browserBlocklisted, set: setBrowserBlocklisted },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => t.set(!t.v)}
              className={`px-3 py-2 rounded-lg border font-mono transition-colors ${
                t.v
                  ? 'bg-[var(--terminal-green)]/10 border-[var(--terminal-green)]/40 text-[var(--terminal-green)]'
                  : 'bg-[var(--bg-void)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              disabled={isPlaying}
              title={isPlaying ? '停止后可调整' : '点击切换'}
            >
              {t.id}
              <span className="ml-2 opacity-60">{t.v ? 'ON' : 'OFF'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: flow summary */}
        <div className="col-span-12 md:col-span-5">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3">
            <div className="text-sm font-mono text-[var(--cyber-blue)]">Flow Snapshot</div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[var(--text-secondary)]">redirectUri</span>
                <span className="font-mono text-[var(--text-primary)] truncate">{redirectUri ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[var(--text-secondary)]">state</span>
                <span className="font-mono text-[var(--text-primary)] truncate">{state ? shortToken(state) : '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[var(--text-secondary)]">authUrl</span>
                <span className="font-mono text-[var(--text-primary)] truncate">{authUrl ? shortToken(authUrl) : '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[var(--text-secondary)]">authCode</span>
                <span className="font-mono text-[var(--text-primary)] truncate">{authCode ?? '-'}</span>
              </div>
            </div>

            {mode === 'web' && (
              <button
                onClick={simulateCallback}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-[var(--cyber-blue)]/30 bg-[var(--cyber-blue)]/10 text-[var(--cyber-blue)] font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isPlaying || phase !== 'web_wait_callback'}
              >
                模拟回调（/oauth2callback）
              </button>
            )}

            {mode === 'manual' && (
              <button
                onClick={simulatePasteCode}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-[var(--amber)]/30 bg-[var(--amber)]/10 text-[var(--amber)] font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isPlaying || phase !== 'manual_wait_code'}
              >
                模拟粘贴授权码
              </button>
            )}
          </div>
        </div>

        {/* Right: tokens + logs */}
        <div className="col-span-12 md:col-span-7 space-y-6">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-4">
            <div className="text-sm font-mono text-[var(--terminal-green)] mb-3">Tokens</div>
            {tokens ? (
              <div className="space-y-2 text-sm font-mono">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--text-secondary)]">access_token</span>
                  <span className="text-[var(--text-primary)]">{shortToken(tokens.accessToken)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--text-secondary)]">refresh_token</span>
                  <span className="text-[var(--text-primary)]">{tokens.refreshToken ? shortToken(tokens.refreshToken) : '-'}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--text-secondary)]">expiry_date</span>
                  <span className="text-[var(--text-primary)]">{new Date(tokens.expiryDateMs).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--text-muted)] font-mono">尚未获取 tokens</div>
            )}
          </div>

          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-4">
            <div className="text-sm font-mono text-[var(--cyber-blue)] mb-3">Logs</div>
            <div className="bg-[var(--bg-void)] border border-[var(--border-subtle)] rounded p-3 max-h-[240px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-sm text-[var(--text-muted)] font-mono">点击“开始”运行动画</div>
              ) : (
                <pre className="text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap m-0">
                  {logs.join('\n')}
                </pre>
              )}
            </div>
          </div>

          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-4">
            <div className="text-sm font-mono text-[var(--text-muted)] mb-2">Source anchors（上游）</div>
            <ul className="text-xs text-[var(--text-secondary)] font-mono space-y-1 m-0 pl-5 list-disc">
              <li><code>gemini-cli/packages/core/src/utils/browser.ts</code>：shouldAttemptBrowserLaunch()</li>
              <li><code>gemini-cli/packages/core/src/code_assist/oauth2.ts</code>：authWithWeb()/authWithUserCode()</li>
              <li><code>gemini-cli/packages/core/src/code_assist/oauth-credential-storage.ts</code>：HybridTokenStorage + migrate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
