/**
 * QwenAuthentication - Qwen OAuth2 认证详解
 * 深入解析 OAuth 2.0 Device Authorization Grant 和跨会话 Token 管理机制
 */

import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

export function QwenAuthentication() {
  const [activeTab, setActiveTab] = useState<'flow' | 'pkce' | 'manager' | 'events'>('flow');

  return (
    <div className="max-w-4xl mx-auto">
      <h1>🔐 Qwen OAuth2 认证详解</h1>

      <div className="info-box" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))',
        borderLeft: '4px solid var(--warning-color)',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--warning-color)' }}>📌 30秒速览</h3>
        <ul style={{ margin: 0, lineHeight: 1.8 }}>
          <li><strong>认证协议</strong>：OAuth 2.0 Device Authorization Grant (RFC 8628)</li>
          <li><strong>安全增强</strong>：PKCE (Proof Key for Code Exchange) 防止授权码拦截</li>
          <li><strong>Token 管理</strong>：SharedTokenManager 单例实现跨会话 Token 同步</li>
          <li><strong>存储位置</strong>：<code>~/.innies/oauth_creds.json</code> (权限 0600)</li>
          <li><strong>刷新策略</strong>：Token 过期前 30 秒自动刷新，分布式锁防止竞争</li>
        </ul>
      </div>

      {/* 导航标签 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'flow', label: '🔄 Device Flow', icon: '🔄' },
          { key: 'pkce', label: '🔒 PKCE 安全', icon: '🔒' },
          { key: 'manager', label: '📦 Token Manager', icon: '📦' },
          { key: 'events', label: '📡 事件系统', icon: '📡' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{
              padding: '0.75rem 1.5rem',
              border: activeTab === tab.key ? '2px solid var(--terminal-green)' : '1px solid var(--border-dim)',
              borderRadius: '8px',
              background: activeTab === tab.key ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              color: activeTab === tab.key ? 'var(--terminal-green)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Device Flow Tab */}
      {activeTab === 'flow' && (
        <section>
          <h2>🔄 Device Authorization Grant Flow</h2>

          <p>
            Qwen OAuth 使用 <strong>RFC 8628 Device Authorization Grant</strong>，适用于无法进行标准浏览器重定向的 CLI 环境。
            用户在浏览器中授权，CLI 通过轮询获取 Token。
          </p>

          <MermaidDiagram chart={`
sequenceDiagram
    participant CLI as 🖥️ Innies CLI
    participant Qwen as 🌐 Qwen OAuth Server
    participant Browser as 🌍 用户浏览器

    Note over CLI: 生成 PKCE code_verifier + code_challenge

    CLI->>Qwen: POST /api/v1/oauth2/device/code
    Note right of CLI: client_id, scope, code_challenge

    Qwen-->>CLI: device_code, user_code, verification_uri

    CLI->>Browser: 自动打开 verification_uri_complete
    Note over Browser: 用户看到授权页面

    Browser->>Qwen: 用户授权 (输入 user_code)
    Note over Browser: 用户点击"允许"

    loop 轮询 (每 2 秒)
        CLI->>Qwen: POST /api/v1/oauth2/token
        Note right of CLI: device_code, code_verifier

        alt 用户尚未授权
            Qwen-->>CLI: { error: "authorization_pending" }
        else 轮询过快
            Qwen-->>CLI: { error: "slow_down" }
            Note over CLI: 增加轮询间隔 ×1.5
        else 用户已授权
            Qwen-->>CLI: access_token, refresh_token, expires_in
        else 超时/拒绝
            Qwen-->>CLI: { error: "expired_token" | "access_denied" }
        end
    end

    CLI->>CLI: 缓存 credentials 到 ~/.innies/oauth_creds.json
`} />

          <h3>核心 API 端点</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--cyber-blue)', margin: '0 0 0.5rem 0' }}>📤 Device Code 请求</h4>
              <code style={{ fontSize: '0.8rem' }}>POST /api/v1/oauth2/device/code</code>
              <CodeBlock language="typescript" code={`// 请求体
{
  client_id: 'f0304373b74a44d2b584a3fb70ca9e56',
  scope: 'openid profile email model.completion',
  code_challenge: 'base64url(sha256(verifier))',
  code_challenge_method: 'S256'
}

// 响应
{
  device_code: 'xxxx-xxxx-xxxx',
  user_code: 'ABCD-1234',
  verification_uri: 'https://chat.qwen.ai/device',
  verification_uri_complete: 'https://chat.qwen.ai/device?code=ABCD-1234',
  expires_in: 900  // 15 分钟
}`} />
            </div>

            <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--terminal-green)', margin: '0 0 0.5rem 0' }}>🔑 Token 轮询</h4>
              <code style={{ fontSize: '0.8rem' }}>POST /api/v1/oauth2/token</code>
              <CodeBlock language="typescript" code={`// 请求体
{
  grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
  client_id: 'f0304373b74a44d2b584a3fb70ca9e56',
  device_code: 'xxxx-xxxx-xxxx',
  code_verifier: 'original_random_string'
}

// 成功响应
{
  access_token: 'eyJhbGciOi...',
  refresh_token: 'dGhpcyBpcyBh...',
  token_type: 'Bearer',
  expires_in: 3600,
  resource_url: 'https://api.qwen.ai/v1'
}`} />
            </div>
          </div>

          <h3>轮询状态处理</h3>
          <CodeBlock language="typescript" code={`// packages/core/src/qwen/qwenOAuth2.ts

async pollDeviceToken(options: { device_code: string; code_verifier: string }) {
  const response = await fetch(QWEN_OAUTH_TOKEN_ENDPOINT, { /* ... */ });

  if (!response.ok) {
    const errorData = await response.json();

    // RFC 8628 标准错误处理
    if (response.status === 400 && errorData.error === 'authorization_pending') {
      // 用户尚未在浏览器中授权，继续轮询
      return { status: 'pending' };
    }

    if (response.status === 429 && errorData.error === 'slow_down') {
      // 轮询过快，需要增加间隔
      return { status: 'pending', slowDown: true };
    }

    // 其他错误（access_denied, expired_token 等）
    throw new Error(errorData.error_description);
  }

  return await response.json();  // 成功获取 Token
}`} />

          <div className="info-box" style={{
            background: 'rgba(139, 92, 246, 0.1)',
            borderLeft: '4px solid var(--purple-accent)',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <h4 style={{ color: 'var(--purple-accent)', margin: '0 0 0.5rem 0' }}>💡 设计考量</h4>
            <ul style={{ margin: 0, fontSize: '0.9rem' }}>
              <li><strong>初始间隔</strong>：2 秒，收到 slow_down 后 ×1.5，最大 10 秒</li>
              <li><strong>取消支持</strong>：每 100ms 检查取消标志，用户可中断授权</li>
              <li><strong>浏览器降级</strong>：<code>open</code> 失败时显示 URL 供手动复制</li>
            </ul>
          </div>
        </section>
      )}

      {/* PKCE Tab */}
      {activeTab === 'pkce' && (
        <section>
          <h2>🔒 PKCE (Proof Key for Code Exchange)</h2>

          <p>
            PKCE (<strong>RFC 7636</strong>) 是 OAuth 2.0 的安全扩展，防止授权码被中间人拦截后重放使用。
            即使攻击者获取了 <code>device_code</code>，没有 <code>code_verifier</code> 也无法换取 Token。
          </p>

          <MermaidDiagram chart={`
graph LR
    subgraph 客户端生成
        V["code_verifier<br/>(随机 32 字节)"]
        C["code_challenge<br/>= base64url(sha256(verifier))"]
    end

    subgraph 授权请求
        REQ1["发送 code_challenge"]
    end

    subgraph Token 请求
        REQ2["发送 code_verifier"]
    end

    subgraph 服务器验证
        VERIFY["sha256(verifier) == challenge?"]
    end

    V --> C
    C --> REQ1
    V --> REQ2
    REQ1 --> VERIFY
    REQ2 --> VERIFY

    style V fill:#1a1a2e,stroke:#00ff88
    style C fill:#1a1a2e,stroke:#3b82f6
    style VERIFY fill:#1a1a2e,stroke:#f59e0b
`} />

          <h3>实现代码</h3>
          <CodeBlock language="typescript" code={`// packages/core/src/qwen/qwenOAuth2.ts

import crypto from 'crypto';

/**
 * 生成随机 code_verifier (RFC 7636 规范: 43-128 字符)
 */
export function generateCodeVerifier(): string {
  // 32 字节 = 256 位熵，base64url 编码后约 43 字符
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * 使用 SHA-256 生成 code_challenge
 */
export function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(codeVerifier);
  return hash.digest('base64url');
}

/**
 * 生成 PKCE 配对
 */
export function generatePKCEPair(): {
  code_verifier: string;
  code_challenge: string;
} {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  return { code_verifier: codeVerifier, code_challenge: codeChallenge };
}

// 使用示例
const { code_verifier, code_challenge } = generatePKCEPair();

// 步骤 1: 发送 code_challenge
await client.requestDeviceAuthorization({
  scope: 'openid profile email model.completion',
  code_challenge,
  code_challenge_method: 'S256',  // 必须是 S256
});

// 步骤 2: 发送 code_verifier 换取 Token
const token = await client.pollDeviceToken({
  device_code,
  code_verifier,  // 服务器会验证 sha256(verifier) == challenge
});`} />

          <h3>安全分析</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>❌ 无 PKCE 的风险</h4>
              <ol style={{ margin: 0, fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                <li>攻击者监听网络流量</li>
                <li>拦截 <code>device_code</code></li>
                <li>使用 device_code 换取 Token</li>
                <li>获得用户的 API 访问权限</li>
              </ol>
            </div>

            <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--terminal-green)', margin: '0 0 0.5rem 0' }}>✅ 有 PKCE 的保护</h4>
              <ol style={{ margin: 0, fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
                <li>攻击者即使拦截 device_code</li>
                <li>但 code_verifier 只存在于客户端内存</li>
                <li>无法通过 code_challenge 反推 verifier</li>
                <li>Token 请求被服务器拒绝</li>
              </ol>
            </div>
          </div>

          <div className="info-box" style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderLeft: '4px solid var(--warning-color)',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <h4 style={{ color: 'var(--warning-color)', margin: '0 0 0.5rem 0' }}>⚠️ 实现注意</h4>
            <ul style={{ margin: 0, fontSize: '0.9rem' }}>
              <li><strong>code_verifier</strong> 必须使用加密安全的随机数生成 (<code>crypto.randomBytes</code>)</li>
              <li><strong>code_challenge_method</strong> 必须是 "S256"，不要使用 "plain"</li>
              <li><strong>code_verifier</strong> 在整个流程中必须保持一致，不能重新生成</li>
            </ul>
          </div>
        </section>
      )}

      {/* Token Manager Tab */}
      {activeTab === 'manager' && (
        <section>
          <h2>📦 SharedTokenManager</h2>

          <p>
            <code>SharedTokenManager</code> 是一个单例服务，解决了多个 CLI 进程同时运行时的 Token 刷新竞争问题。
            它使用<strong>文件锁</strong>实现分布式同步，并通过<strong>内存缓存</strong>减少磁盘 I/O。
          </p>

          <MermaidDiagram chart={`
stateDiagram-v2
    [*] --> CheckCache: getValidCredentials()

    state CheckCache {
        [*] --> FileModCheck
        FileModCheck --> ReloadFromFile: 文件已更新
        FileModCheck --> UseMemoryCache: 文件未变化
        ReloadFromFile --> UseMemoryCache
    }

    CheckCache --> TokenValid: 检查 Token 有效性
    TokenValid --> ReturnToken: Token 有效 (未过期)
    TokenValid --> AcquireLock: Token 过期或即将过期

    state AcquireLock {
        [*] --> TryCreateLock
        TryCreateLock --> LockSuccess: 创建成功
        TryCreateLock --> CheckStaleLock: EEXIST

        CheckStaleLock --> RemoveStaleLock: lockAge > 10s
        CheckStaleLock --> WaitRetry: lockAge <= 10s

        RemoveStaleLock --> TryCreateLock
        WaitRetry --> TryCreateLock: 100ms 后重试

        LockSuccess --> [*]
    }

    AcquireLock --> DoubleCheck: 锁定成功
    DoubleCheck --> ReturnToken: 其他进程已刷新
    DoubleCheck --> RefreshToken: 确需刷新

    RefreshToken --> SaveToFile: 刷新成功
    SaveToFile --> UpdateCache
    UpdateCache --> ReleaseLock
    ReleaseLock --> ReturnToken

    ReturnToken --> [*]
`} />

          <h3>关键配置常量</h3>
          <CodeBlock language="typescript" code={`// packages/core/src/qwen/sharedTokenManager.ts

// Token 刷新缓冲区 - 在过期前 30 秒开始刷新
const TOKEN_REFRESH_BUFFER_MS = 30 * 1000;

// 文件锁超时 - 超过 10 秒认为是残留锁
const LOCK_TIMEOUT_MS = 10000;

// 缓存检查间隔 - 每 5 秒检查一次文件是否被其他进程更新
const CACHE_CHECK_INTERVAL_MS = 5000;

// 锁获取配置
const DEFAULT_LOCK_CONFIG = {
  maxAttempts: 20,       // 最多尝试 20 次
  attemptInterval: 100,  // 初始间隔 100ms
  maxInterval: 2000,     // 最大间隔 2 秒 (指数退避)
};`} />

          <h3>分布式锁实现</h3>
          <CodeBlock language="typescript" code={`// 文件锁获取算法
private async acquireLock(lockPath: string): Promise<void> {
  let currentInterval = 100;  // 初始间隔

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // 原子性创建锁文件 (flag: 'wx' = exclusive)
      await fs.writeFile(lockPath, randomUUID(), { flag: 'wx' });
      return;  // 成功获取锁
    } catch (error) {
      if (error.code === 'EEXIST') {
        // 检查是否是过期的锁
        const stats = await fs.stat(lockPath);
        const lockAge = Date.now() - stats.mtimeMs;

        if (lockAge > LOCK_TIMEOUT_MS) {
          // 原子性移除过期锁
          const tempPath = \`\${lockPath}.stale.\${randomUUID()}\`;
          await fs.rename(lockPath, tempPath);
          await fs.unlink(tempPath);
          continue;  // 立即重试
        }

        // 等待并指数退避
        await new Promise(r => setTimeout(r, currentInterval));
        currentInterval = Math.min(currentInterval * 1.5, 2000);
      } else {
        throw error;
      }
    }
  }

  throw new TokenManagerError(TokenError.LOCK_TIMEOUT, '获取锁超时');
}`} />

          <h3>内存缓存与文件同步</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--cyber-blue)', margin: '0 0 0.5rem 0' }}>📝 MemoryCache 结构</h4>
              <CodeBlock language="typescript" code={`interface MemoryCache {
  credentials: QwenCredentials | null;
  fileModTime: number;   // 上次读取的文件修改时间
  lastCheck: number;     // 上次检查时间戳
}`} />
            </div>

            <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--terminal-green)', margin: '0 0 0.5rem 0' }}>🔄 同步策略</h4>
              <ul style={{ margin: 0, fontSize: '0.9rem' }}>
                <li>每 5 秒检查文件 mtime</li>
                <li>mtime 变化则重新加载</li>
                <li>写入时使用原子重命名</li>
                <li>进程退出时清理锁文件</li>
              </ul>
            </div>
          </div>

          <h3>Token 错误类型</h3>
          <CodeBlock language="typescript" code={`// 错误分类便于上层精确处理
export enum TokenError {
  REFRESH_FAILED = 'REFRESH_FAILED',     // 刷新请求失败
  NO_REFRESH_TOKEN = 'NO_REFRESH_TOKEN', // 没有 refresh_token
  LOCK_TIMEOUT = 'LOCK_TIMEOUT',         // 获取锁超时
  FILE_ACCESS_ERROR = 'FILE_ACCESS_ERROR', // 文件读写错误
  NETWORK_ERROR = 'NETWORK_ERROR',       // 网络错误
}

// 使用示例
try {
  const creds = await sharedManager.getValidCredentials(client);
} catch (error) {
  if (error instanceof TokenManagerError) {
    switch (error.type) {
      case TokenError.NO_REFRESH_TOKEN:
        // 需要重新走 Device Flow
        break;
      case TokenError.NETWORK_ERROR:
        // 可以离线使用缓存的 Token（如果尚未过期）
        break;
    }
  }
}`} />

          <div className="info-box" style={{
            background: 'rgba(139, 92, 246, 0.1)',
            borderLeft: '4px solid var(--purple-accent)',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <h4 style={{ color: 'var(--purple-accent)', margin: '0 0 0.5rem 0' }}>💡 设计亮点</h4>
            <ul style={{ margin: 0, fontSize: '0.9rem' }}>
              <li><strong>Double-Check</strong>：获取锁后再次检查文件，避免重复刷新</li>
              <li><strong>原子写入</strong>：先写 .tmp 文件再 rename，防止写入中断</li>
              <li><strong>优雅降级</strong>：进程崩溃时通过 lockAge 检测清理残留锁</li>
              <li><strong>权限控制</strong>：credentials 文件权限 0600，目录权限 0700</li>
            </ul>
          </div>
        </section>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <section>
          <h2>📡 OAuth 事件系统</h2>

          <p>
            <code>qwenOAuth2Events</code> 是一个全局 EventEmitter，用于在认证流程中传递状态更新。
            UI 组件 (<code>useQwenAuth</code>) 监听这些事件来显示认证进度。
          </p>

          <MermaidDiagram chart={`
sequenceDiagram
    participant OAuth as 🔐 qwenOAuth2.ts
    participant Events as 📡 EventEmitter
    participant Hook as ⚛️ useQwenAuth
    participant UI as 🖥️ AuthDialog

    OAuth->>Events: emit(AuthUri, deviceAuth)
    Events-->>Hook: on(AuthUri)
    Hook->>UI: setDeviceAuth(...)
    Note over UI: 显示 user_code 和链接

    loop 轮询中
        OAuth->>Events: emit(AuthProgress, 'polling', message)
        Events-->>Hook: on(AuthProgress)
        Hook->>UI: setAuthStatus('polling')
        Note over UI: 显示 "等待授权..."
    end

    alt 授权成功
        OAuth->>Events: emit(AuthProgress, 'success', message)
        Hook->>UI: setAuthStatus('success')
    else 用户取消
        UI->>Events: emit(AuthCancel)
        Events-->>OAuth: once(AuthCancel)
        OAuth->>OAuth: isCancelled = true
        OAuth->>Events: emit(AuthProgress, 'error', message)
    else 超时
        OAuth->>Events: emit(AuthProgress, 'timeout', message)
    else 频率限制
        OAuth->>Events: emit(AuthProgress, 'rate_limit', message)
    end
`} />

          <h3>事件类型</h3>
          <CodeBlock language="typescript" code={`// packages/core/src/qwen/qwenOAuth2.ts

export enum QwenOAuth2Event {
  AuthUri = 'auth-uri',         // Device 授权信息就绪
  AuthProgress = 'auth-progress', // 认证进度更新
  AuthCancel = 'auth-cancel',   // 用户取消认证
}

// 事件数据类型
interface DeviceAuthorizationInfo {
  verification_uri: string;
  verification_uri_complete: string;
  user_code: string;
  expires_in: number;
}

type AuthStatus = 'idle' | 'polling' | 'success' | 'error' | 'timeout' | 'rate_limit';

// 全局事件发射器
export const qwenOAuth2Events = new EventEmitter();`} />

          <h3>UI Hook 实现</h3>
          <CodeBlock language="typescript" code={`// packages/cli/src/ui/hooks/useQwenAuth.ts

export const useQwenAuth = (settings: LoadedSettings, isAuthenticating: boolean) => {
  const [qwenAuthState, setQwenAuthState] = useState<QwenAuthState>({
    isQwenAuthenticating: false,
    deviceAuth: null,
    authStatus: 'idle',
    authMessage: null,
  });

  useEffect(() => {
    if (!isQwenAuth || !isAuthenticating) {
      setQwenAuthState({ /* reset */ });
      return;
    }

    // 监听 Device 授权信息
    const handleDeviceAuth = (deviceAuth: DeviceAuthorizationInfo) => {
      setQwenAuthState(prev => ({
        ...prev,
        deviceAuth: {
          verification_uri: deviceAuth.verification_uri,
          verification_uri_complete: deviceAuth.verification_uri_complete,
          user_code: deviceAuth.user_code,
          expires_in: deviceAuth.expires_in,
        },
        authStatus: 'polling',
      }));
    };

    // 监听认证进度
    const handleAuthProgress = (
      status: 'success' | 'error' | 'polling' | 'timeout' | 'rate_limit',
      message?: string
    ) => {
      setQwenAuthState(prev => ({
        ...prev,
        authStatus: status,
        authMessage: message || null,
      }));
    };

    qwenOAuth2Events.on(QwenOAuth2Event.AuthUri, handleDeviceAuth);
    qwenOAuth2Events.on(QwenOAuth2Event.AuthProgress, handleAuthProgress);

    return () => {
      qwenOAuth2Events.off(QwenOAuth2Event.AuthUri, handleDeviceAuth);
      qwenOAuth2Events.off(QwenOAuth2Event.AuthProgress, handleAuthProgress);
    };
  }, [isQwenAuth, isAuthenticating]);

  // 取消认证
  const cancelQwenAuth = useCallback(() => {
    qwenOAuth2Events.emit(QwenOAuth2Event.AuthCancel);
    setQwenAuthState({ /* reset */ });
  }, []);

  return { ...qwenAuthState, isQwenAuth, cancelQwenAuth };
};`} />

          <h3>取消机制</h3>

          <div className="card" style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--warning-color)', margin: '0 0 0.5rem 0' }}>🛑 响应式取消</h4>
            <p>用户点击"取消"后，轮询循环会在下一个 100ms 检查点退出：</p>
            <CodeBlock language="typescript" code={`// authWithQwenDeviceFlow 中的取消检测

let isCancelled = false;

// 注册取消监听器
qwenOAuth2Events.once(QwenOAuth2Event.AuthCancel, () => {
  isCancelled = true;
});

// 轮询等待时每 100ms 检查一次
await new Promise<void>((resolve) => {
  let elapsedTime = 0;
  const intervalId = setInterval(() => {
    elapsedTime += 100;

    if (isCancelled) {
      clearInterval(intervalId);
      resolve();
      return;
    }

    if (elapsedTime >= pollInterval) {
      clearInterval(intervalId);
      resolve();
    }
  }, 100);
});

// 检查取消标志
if (isCancelled) {
  return { success: false, reason: 'cancelled' };
}`} />
          </div>
        </section>
      )}

      {/* 文件存储 */}
      <section style={{ marginTop: '2rem' }}>
        <h2>💾 凭证存储</h2>

        <CodeBlock language="typescript" code={`// 存储路径
const QWEN_DIR = '.innies';
const QWEN_CREDENTIAL_FILENAME = 'oauth_creds.json';
const QWEN_LOCK_FILENAME = 'oauth_creds.lock';

// ~/.innies/oauth_creds.json 格式
interface QwenCredentials {
  access_token: string;     // JWT 格式的访问令牌
  refresh_token: string;    // 用于刷新的长期令牌
  token_type: 'Bearer';     // 令牌类型
  expiry_date: number;      // 过期时间戳 (毫秒)
  resource_url?: string;    // API 基础 URL
}

// 文件权限
await fs.mkdir(dirPath, { recursive: true, mode: 0o700 });  // 目录: rwx------
await fs.writeFile(filePath, content, { mode: 0o600 });     // 文件: rw-------`} />

        <div className="info-box" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '4px solid #ef4444',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          <h4 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>⚠️ 安全警告</h4>
          <ul style={{ margin: 0, fontSize: '0.9rem' }}>
            <li><strong>不要</strong>将 <code>~/.innies/oauth_creds.json</code> 提交到版本控制</li>
            <li><strong>不要</strong>分享你的 refresh_token</li>
            <li>如果怀疑凭证泄露，执行 <code>/auth logout</code> 重新认证</li>
          </ul>
        </div>
      </section>

      {/* 相关链接 */}
      <section style={{ marginTop: '2rem' }}>
        <h2>🔗 相关文档</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <a href="#auth" className="card" style={{
            padding: '1rem',
            textDecoration: 'none',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: 'var(--cyber-blue)', margin: '0 0 0.5rem 0' }}>🔑 认证流程</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>多认证方式概览</p>
          </a>

          <a href="#config" className="card" style={{
            padding: '1rem',
            textDecoration: 'none',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: 'var(--purple-accent)', margin: '0 0 0.5rem 0' }}>⚙️ 配置系统</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>设置和环境变量</p>
          </a>

          <a href="#shared-token-manager-anim" className="card" style={{
            padding: '1rem',
            textDecoration: 'none',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: 'var(--terminal-green)', margin: '0 0 0.5rem 0' }}>🎬 Token 管理器动画</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>可视化流程演示</p>
          </a>

          <a href="#oauth-device-flow-anim" className="card" style={{
            padding: '1rem',
            textDecoration: 'none',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: 'var(--warning-color)', margin: '0 0 0.5rem 0' }}>🎬 OAuth 设备授权动画</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Device Flow 演示</p>
          </a>
        </div>
      </section>
    </div>
  );
}
