import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { useNavigation } from '../contexts/NavigationContext';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-600 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold">
          <span>{icon}</span>
          <span>{title}</span>
        </span>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="p-4 bg-gray-900/50">{children}</div>}
    </div>
  );
}

export function AuthenticationFlow() {
  const { navigate } = useNavigation();

  const relatedPages: RelatedPage[] = [
    { id: 'shared-token-manager', label: 'Token 共享机制', description: 'SharedTokenManager 完整架构' },
    { id: 'google-authentication', label: 'Google OAuth 详解', description: '设备授权流程详解' },
    { id: 'startup-chain', label: '启动链路', description: '认证如何触发' },
    { id: 'config', label: '配置系统', description: '认证相关配置项' },
    { id: 'oauth-device-flow-anim', label: 'OAuth 设备授权动画', description: '可视化授权流程' },
    { id: 'error-recovery-patterns', label: '错误恢复模式', description: '认证错误处理策略' },
  ];

  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">认证流程详解</h2>

      {/* 30秒速览 */}
      <HighlightBox title="⏱️ 30秒速览" icon="🎯" variant="blue">
        <ul className="space-y-2 text-sm">
          <li>
            • <strong>默认方式</strong>: Google OAuth Device Code 流程，无需 API 密钥，每天 2000 请求
          </li>
          <li>
            • <strong>核心标准</strong>: RFC 8628 (Device Authorization Grant) + RFC 7636 (PKCE)
          </li>
          <li>
            • <strong>Token 管理</strong>: SharedTokenManager 单例处理跨进程同步和自动刷新
          </li>
          <li>
            • <strong>刷新策略</strong>: 提前 30 秒刷新，失败时触发重新认证
          </li>
        </ul>
      </HighlightBox>

      {/* 认证类型 */}
      <Layer title="支持的认证方式" icon="🔐">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">🌟 Google OAuth (默认)</h4>
            <p className="text-sm text-gray-300 mb-2">
              免费使用，每天 2000 请求配额
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Device Code 流程 (RFC 8628)</li>
              <li>• PKCE 增强安全 (RFC 7636)</li>
              <li>• 自动令牌刷新</li>
            </ul>
            <code className="text-xs block mt-2 text-purple-300">authType: "gemini_oauth"</code>
          </div>

          <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-bold mb-2">🔑 OpenAI 兼容 API</h4>
            <p className="text-sm text-gray-300 mb-2">
              支持任何 OpenAI 兼容的端点
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• OpenAI / Azure OpenAI</li>
              <li>• 本地模型 (Ollama, vLLM)</li>
              <li>• 其他兼容服务</li>
            </ul>
            <code className="text-xs block mt-2 text-blue-300">OPENAI_API_KEY + OPENAI_BASE_URL</code>
          </div>

          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">🌐 Google Gemini</h4>
            <p className="text-sm text-gray-300 mb-2">
              使用 Google Gemini API
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• API Key 认证</li>
              <li>• OAuth 浏览器流程</li>
              <li>• Cloud Shell ADC</li>
            </ul>
            <code className="text-xs block mt-2 text-green-300">authType: "use_gemini"</code>
          </div>

          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">☁️ Cloud Shell</h4>
            <p className="text-sm text-gray-300 mb-2">
              GCP Cloud Shell 自动认证
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 自动检测环境</li>
              <li>• 使用 ADC 凭据</li>
              <li>• 无需手动配置</li>
            </ul>
            <code className="text-xs block mt-2 text-orange-300">authType: "cloud_shell"</code>
          </div>
        </div>
      </Layer>

      {/* RFC 8628 Device Authorization Grant */}
      <Layer title="RFC 8628: Device Authorization Grant" icon="📜">
        <HighlightBox title="设备授权流程适用场景" icon="💡" variant="blue">
          <p className="text-sm">
            设备授权流程专为"输入受限设备"设计：没有浏览器的终端、智能电视、IoT 设备等。
            用户在另一设备（手机/电脑）上完成授权，终端通过轮询获取 Token。
          </p>
        </HighlightBox>

        <MermaidDiagram
          title="Device Authorization Grant 完整时序"
          chart={`sequenceDiagram
    autonumber
    participant CLI as Innies CLI
    participant Auth as 认证服务器
    participant Browser as 用户浏览器

    Note over CLI: 生成 PKCE code_verifier + code_challenge

    CLI->>Auth: POST /oauth2/device/code
    Note right of CLI: client_id, scope, code_challenge
    Auth-->>CLI: device_code, user_code, verification_uri

    CLI->>CLI: 显示验证 URL 和用户代码
    CLI->>Browser: 尝试打开浏览器

    Note over Browser: 用户访问 verification_uri
    Browser->>Auth: 输入 user_code
    Auth->>Auth: 验证用户身份
    Browser-->>Auth: 用户授权确认

    loop 每 2 秒轮询 (可能被要求 slow_down)
        CLI->>Auth: POST /oauth2/token
        Note right of CLI: grant_type=device_code, device_code, code_verifier
        alt 用户尚未授权
            Auth-->>CLI: 400 authorization_pending
        else 轮询过快
            Auth-->>CLI: 429 slow_down
            CLI->>CLI: 增加轮询间隔 1.5x
        else 设备码过期
            Auth-->>CLI: 400 expired_token
            CLI->>CLI: 终止流程，提示用户重试
        else 用户拒绝
            Auth-->>CLI: 400 access_denied
            CLI->>CLI: 终止流程，提示用户
        else 授权成功
            Auth-->>CLI: access_token, refresh_token, expires_in
        end
    end

    CLI->>CLI: 保存 Token 到 SharedTokenManager
    Note over CLI: 后续请求使用 access_token`}
        />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-cyan-400 font-semibold mb-2">请求设备码</h4>
            <CodeBlock
              code={`POST /api/v1/oauth2/device/code
Content-Type: application/x-www-form-urlencoded

client_id=f0304373b74a44d2b584a3fb70ca9e56
&scope=openid profile email model.completion
&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw
&code_challenge_method=S256`}
            />
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">响应</h4>
            <CodeBlock
              code={`{
  "device_code": "GmRhmhcxhwAzkoEqiMEg_DnyEysN...",
  "user_code": "WDJB-MJHT",
  "verification_uri": "https://accounts.google.com/device",
  "verification_uri_complete": "https://accounts.google.com/device?code=WDJB-MJHT",
  "expires_in": 900
}`}
            />
          </div>
        </div>
      </Layer>

      {/* PKCE 详解 */}
      <CollapsibleSection title="RFC 7636: PKCE 安全增强" icon="🔒">
        <HighlightBox title="为什么需要 PKCE？" icon="⚠️" variant="yellow">
          <p className="text-sm">
            PKCE (Proof Key for Code Exchange) 防止授权码拦截攻击。公共客户端（如 CLI）无法安全存储 client_secret，
            PKCE 通过动态生成的一次性密钥保护授权流程。
          </p>
        </HighlightBox>

        <MermaidDiagram
          title="PKCE 工作原理"
          chart={`flowchart LR
    subgraph 客户端
        A[生成随机 code_verifier] --> B[SHA256 哈希]
        B --> C[Base64URL 编码]
        C --> D[code_challenge]
    end

    subgraph 授权请求
        D --> E[发送 code_challenge]
        E --> F[服务器存储]
    end

    subgraph Token交换
        G[发送 code_verifier] --> H[服务器计算哈希]
        H --> I{匹配?}
        F --> I
        I -->|是| J[返回 Token]
        I -->|否| K[拒绝请求]
    end

    style A fill:#2d3748
    style D fill:#2d3748
    style J fill:#276749
    style K fill:#9b2c2c`}
        />

        <CodeBlock
          title="PKCE 实现代码"
          code={`// packages/core/src/gemini/geminiOAuth.ts:47-73

import crypto from 'crypto';

// 生成 43-128 字符的随机 code_verifier
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// 使用 SHA-256 生成 code_challenge
export function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(codeVerifier);
  return hash.digest('base64url');
}

// 生成配对
export function generatePKCEPair(): {
  code_verifier: string;
  code_challenge: string;
} {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  return { code_verifier: codeVerifier, code_challenge: codeChallenge };
}`}
        />
      </CollapsibleSection>

      {/* Token 生命周期 */}
      <Layer title="Token 生命周期管理" icon="🔄">
        <MermaidDiagram
          title="Token 状态机"
          chart={`stateDiagram-v2
    [*] --> NoToken: 初始状态

    NoToken --> Pending: 开始 Device Flow
    Pending --> Valid: 用户授权成功
    Pending --> NoToken: 超时/拒绝

    Valid --> Expiring: 距过期 < 30秒
    Valid --> Expired: 超过过期时间

    Expiring --> Refreshing: 触发刷新
    Refreshing --> Valid: 刷新成功
    Refreshing --> NoToken: 刷新失败 (需重新认证)

    Expired --> NoToken: 清除凭据

    note right of Valid: access_token 可用
    note right of Expiring: 提前 30秒开始刷新
    note right of Refreshing: 使用 refresh_token`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">Valid 状态</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• access_token 有效</li>
              <li>• 距过期 &gt; 30 秒</li>
              <li>• 可直接使用</li>
            </ul>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-bold mb-2">Expiring 状态</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 距过期 &lt; 30 秒</li>
              <li>• 触发后台刷新</li>
              <li>• 当前 token 仍可用</li>
            </ul>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">Expired 状态</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• access_token 已过期</li>
              <li>• 必须刷新或重新认证</li>
              <li>• 请求将被拒绝</li>
            </ul>
          </div>
        </div>

        <CodeBlock
          title="Token 有效性检查"
          code={`// packages/core/src/gemini/sharedTokenManager.ts:670-675

const TOKEN_REFRESH_BUFFER_MS = 30 * 1000; // 30 秒缓冲

private isTokenValid(credentials: GeminiCredentials): boolean {
  if (!credentials.expiry_date || !credentials.access_token) {
    return false;
  }
  // 提前 30 秒判定为无效，触发刷新
  return Date.now() < credentials.expiry_date - TOKEN_REFRESH_BUFFER_MS;
}`}
        />
      </Layer>

      {/* 轮询策略 */}
      <CollapsibleSection title="智能轮询策略" icon="⏱️">
        <HighlightBox title="轮询行为" icon="📊" variant="blue">
          <ul className="text-sm space-y-1">
            <li>• <strong>初始间隔</strong>: 2 秒</li>
            <li>• <strong>slow_down 响应</strong>: 间隔增加 1.5 倍，最大 10 秒</li>
            <li>• <strong>最大尝试</strong>: 根据 expires_in 计算</li>
            <li>• <strong>可取消</strong>: 支持用户中断</li>
          </ul>
        </HighlightBox>

        <CodeBlock
          title="轮询实现"
          code={`// packages/core/src/gemini/geminiOAuth.ts:638-750

let pollInterval = 2000; // 2 秒初始间隔
const maxAttempts = Math.ceil(deviceAuth.expires_in / (pollInterval / 1000));

for (let attempt = 0; attempt < maxAttempts; attempt++) {
  // 检查用户是否取消
  if (isCancelled) {
    return { success: false, reason: 'cancelled' };
  }

  const tokenResponse = await client.pollDeviceToken({
    device_code: deviceAuth.device_code,
    code_verifier,
  });

  if (isDeviceTokenSuccess(tokenResponse)) {
    // 成功获取 Token
    return { success: true };
  }

  if (isDeviceTokenPending(tokenResponse)) {
    // 处理 slow_down 信号
    if (tokenResponse.slowDown) {
      pollInterval = Math.min(pollInterval * 1.5, 10000); // 增加 50%，最大 10 秒
      console.debug(\`增加轮询间隔到 \${pollInterval}ms\`);
    }

    // 等待下一次轮询（支持中断）
    await interruptibleWait(pollInterval);
    continue;
  }
}`}
        />

        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <h4 className="text-cyan-400 font-semibold mb-3">轮询响应处理表</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-600">
                  <th className="py-2 px-3">HTTP 状态</th>
                  <th className="py-2 px-3">错误码</th>
                  <th className="py-2 px-3">含义</th>
                  <th className="py-2 px-3">处理方式</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">200</td>
                  <td className="py-2 px-3 text-green-400">-</td>
                  <td className="py-2 px-3">授权成功</td>
                  <td className="py-2 px-3">保存 Token，结束流程</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">400</td>
                  <td className="py-2 px-3 text-yellow-400">authorization_pending</td>
                  <td className="py-2 px-3">用户尚未授权</td>
                  <td className="py-2 px-3">继续轮询</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">429</td>
                  <td className="py-2 px-3 text-orange-400">slow_down</td>
                  <td className="py-2 px-3">轮询过快</td>
                  <td className="py-2 px-3">增加间隔 1.5x，继续轮询</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">400</td>
                  <td className="py-2 px-3 text-red-400">access_denied</td>
                  <td className="py-2 px-3">用户拒绝授权</td>
                  <td className="py-2 px-3">终止流程，提示用户</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">400</td>
                  <td className="py-2 px-3 text-red-400">expired_token</td>
                  <td className="py-2 px-3">设备码已过期</td>
                  <td className="py-2 px-3">终止流程，需重新开始</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">401</td>
                  <td className="py-2 px-3 text-red-400">invalid_client</td>
                  <td className="py-2 px-3">客户端无效</td>
                  <td className="py-2 px-3">终止流程，配置错误</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CollapsibleSection>

      {/* Token 刷新流程 */}
      <Layer title="Token 刷新机制" icon="🔃">
        <MermaidDiagram
          title="Token 刷新时序"
          chart={`sequenceDiagram
    autonumber
    participant Client as GeminiOAuth2Client
    participant Manager as SharedTokenManager
    participant File as 凭据文件
    participant Auth as 认证服务器

    Client->>Manager: getValidCredentials()
    Manager->>Manager: 检查内存缓存

    alt Token 有效 (距过期 > 30秒)
        Manager-->>Client: 返回缓存 Token
    else Token 即将过期或无效
        Manager->>Manager: acquireLock()
        Note over Manager: 文件锁防止并发刷新

        Manager->>File: 检查文件 mtime
        alt 文件已被其他进程更新
            File-->>Manager: 新 Token (其他进程已刷新)
            Manager->>Manager: 更新内存缓存
            Manager-->>Client: 返回新 Token
        else 需要刷新
            Manager->>Auth: POST /oauth2/token
            Note right of Manager: grant_type=refresh_token

            alt 刷新成功
                Auth-->>Manager: 新 access_token
                Manager->>File: 原子写入 (tmp + rename)
                Manager->>Manager: 更新内存缓存
                Manager-->>Client: 返回新 Token
            else 刷新失败 (400)
                Auth-->>Manager: error: invalid_grant
                Manager->>File: 清除凭据
                Manager->>Manager: 清除内存缓存
                Manager-->>Client: CredentialsClearRequiredError
            end
        end

        Manager->>Manager: releaseLock()
    end`}
        />

        <CodeBlock
          title="刷新 Token 实现"
          code={`// packages/core/src/gemini/geminiOAuth.ts:391-453

async refreshAccessToken(): Promise<TokenRefreshResponse> {
  if (!this.credentials.refresh_token) {
    throw new Error('No refresh token available');
  }

  const bodyData = {
    grant_type: 'refresh_token',
    refresh_token: this.credentials.refresh_token,
    client_id: QWEN_OAUTH_CLIENT_ID,
  };

  const response = await fetch(QWEN_OAUTH_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: objectToUrlEncoded(bodyData),
  });

  if (!response.ok) {
    // 400 错误表示 refresh_token 已失效
    if (response.status === 400) {
      await clearGeminiCredentials();
      throw new CredentialsClearRequiredError(
        "Refresh token expired. Please use '/auth' to re-authenticate."
      );
    }
    throw new Error(\`Token refresh failed: \${response.status}\`);
  }

  const tokenData = await response.json();

  // 更新凭据（保留原有 refresh_token 如果服务器未返回新的）
  const tokens: GeminiCredentials = {
    access_token: tokenData.access_token,
    token_type: tokenData.token_type,
    refresh_token: tokenData.refresh_token || this.credentials.refresh_token,
    expiry_date: Date.now() + tokenData.expires_in * 1000,
  };

  this.setCredentials(tokens);
  return tokenData;
}`}
        />
      </Layer>

      {/* SharedTokenManager 集成 */}
      <CollapsibleSection title="SharedTokenManager 跨进程同步" icon="🔗">
        <HighlightBox title="设计目标" icon="🎯" variant="green">
          <ul className="text-sm space-y-1">
            <li>• <strong>单例模式</strong>: 进程内唯一实例，避免重复刷新</li>
            <li>• <strong>文件锁</strong>: 跨进程互斥，防止并发刷新</li>
            <li>• <strong>mtime 检测</strong>: 发现其他进程的刷新结果</li>
            <li>• <strong>内存缓存</strong>: 减少文件 I/O</li>
          </ul>
        </HighlightBox>

        <MermaidDiagram
          title="多进程 Token 共享"
          chart={`flowchart TB
    subgraph Process1["进程 1"]
        A1[getValidCredentials]
        B1[检查内存缓存]
        C1[获取文件锁]
    end

    subgraph Process2["进程 2"]
        A2[getValidCredentials]
        B2[检查内存缓存]
        C2[等待文件锁...]
    end

    subgraph SharedFile["共享文件系统"]
        F[oauth_creds.json]
        L[oauth_creds.lock]
    end

    subgraph AuthServer["认证服务器"]
        AS[/oauth2/token]
    end

    A1 --> B1
    B1 -->|过期| C1
    C1 -->|获取成功| D1[刷新 Token]
    D1 --> AS
    AS --> E1[写入新 Token]
    E1 --> F
    E1 --> G1[释放锁]
    G1 --> L

    A2 --> B2
    B2 -->|过期| C2
    C2 -.->|等待| L
    L -.->|锁释放| H2[检查文件 mtime]
    H2 --> F
    F --> I2[读取新 Token]
    I2 --> J2[更新内存缓存]

    style F fill:#2d3748
    style L fill:#4a5568
    style AS fill:#276749`}
        />

        <CodeBlock
          title="文件锁获取 (指数退避)"
          code={`// packages/core/src/gemini/sharedTokenManager.ts:701-765

const DEFAULT_LOCK_CONFIG = {
  maxAttempts: 20,      // 最大尝试次数
  attemptInterval: 100, // 初始间隔 100ms
  maxInterval: 2000,    // 最大间隔 2 秒
};

private async acquireLock(lockPath: string): Promise<void> {
  const lockId = randomUUID(); // 安全的锁标识
  let currentInterval = attemptInterval;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // 原子创建锁文件 (exclusive mode)
      await fs.writeFile(lockPath, lockId, { flag: 'wx' });
      return; // 成功获取锁
    } catch (error) {
      if (error.code === 'EEXIST') {
        // 锁已存在，检查是否过期
        const stats = await fs.stat(lockPath);
        const lockAge = Date.now() - stats.mtimeMs;

        if (lockAge > LOCK_TIMEOUT_MS) { // 10 秒超时
          // 原子移除过期锁
          const tempPath = \`\${lockPath}.stale.\${randomUUID()}\`;
          await fs.rename(lockPath, tempPath);
          await fs.unlink(tempPath);
          continue; // 立即重试
        }

        // 等待后重试 (指数退避)
        await sleep(currentInterval);
        currentInterval = Math.min(currentInterval * 1.5, maxInterval);
      }
    }
  }
  throw new TokenManagerError(TokenError.LOCK_TIMEOUT, 'Lock acquisition timeout');
}`}
        />

        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-cyan-400 font-semibold mb-2">相关页面</h4>
          <p className="text-sm text-gray-300">
            详细的 SharedTokenManager 架构和实现请参考：
            <button onClick={() => navigate('shared-token-manager')} className="text-cyan-400 hover:underline ml-2 bg-transparent border-none cursor-pointer">
              → Token 共享机制
            </button>
          </p>
        </div>
      </CollapsibleSection>

      {/* OpenAI 兼容 API */}
      <Layer title="OpenAI 兼容 API 配置" icon="🔧">
        <CodeBlock
          code={`# 环境变量配置
export OPENAI_API_KEY="sk-your-api-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"  # 或自定义端点
export OPENAI_MODEL="gpt-4"  # 可选，默认使用 settings 中的模型

# 本地模型示例 (Ollama)
export OPENAI_API_KEY="ollama"
export OPENAI_BASE_URL="http://localhost:11434/v1"
export OPENAI_MODEL="llama2"

# Azure OpenAI 示例
export OPENAI_API_KEY="your-azure-key"
export OPENAI_BASE_URL="https://your-resource.openai.azure.com/openai/deployments/your-deployment"
export OPENAI_MODEL="gpt-4"`}
        />

        <HighlightBox title="认证优先级" icon="📊" variant="blue">
          <ol className="pl-5 list-decimal space-y-1">
            <li><strong>环境变量</strong> - OPENAI_API_KEY 等</li>
            <li><strong>项目配置</strong> - .gemini/settings.json</li>
            <li><strong>用户配置</strong> - ~/.gemini/settings.json</li>
            <li><strong>Google OAuth</strong> - 默认回退方式</li>
          </ol>
        </HighlightBox>
      </Layer>

      {/* Google OAuth */}
      <CollapsibleSection title="Google OAuth 流程" icon="🌐">
        <CodeBlock
          title="三种认证模式"
          code={`// packages/core/src/code_assist/oauth2.ts

// 模式 1: Cloud Shell ADC (自动)
if (isCloudShellEnvironment()) {
    const compute = new Compute();
    const token = await compute.getAccessToken();
    return token;
}

// 模式 2: 浏览器 Web 流程 (PKCE)
async function browserWebFlow(): Promise<Credentials> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // 启动本地 HTTP 服务器接收回调
    const server = createLocalServer(port);

    // 打开浏览器
    const authUrl = buildAuthUrl({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: \`http://localhost:\${port}/callback\`,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: SCOPES.join(' ')
    });
    await open(authUrl);

    // 等待回调（超时 5 分钟）
    const code = await waitForCallback(server, 300000);
    return exchangeCodeForTokens(code, codeVerifier);
}

// 模式 3: 用户代码流程 (无浏览器环境)
async function userCodeFlow(): Promise<Credentials> {
    const { user_code, verification_url } = await requestUserCode();
    console.log(\`请访问: \${verification_url}\`);
    console.log(\`输入代码: \${user_code}\`);
    return pollForToken();
}`}
        />
      </CollapsibleSection>

      {/* 认证错误处理 */}
      <Layer title="认证错误处理" icon="⚠️">
        <div className="space-y-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">FatalAuthenticationError</h4>
            <p className="text-sm text-gray-300 mb-2">认证完全失败，无法继续</p>
            <code className="text-xs text-gray-400">处理：退出程序，提示用户检查凭据</code>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">CredentialsClearRequiredError</h4>
            <p className="text-sm text-gray-300 mb-2">凭据过期或无效，需要清除并重新认证</p>
            <code className="text-xs text-gray-400">处理：清除缓存，重新触发 Device Flow</code>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-bold mb-2">TokenManagerError</h4>
            <p className="text-sm text-gray-300 mb-2">Token 管理操作失败（刷新、锁获取、文件访问）</p>
            <code className="text-xs text-gray-400">
              类型：REFRESH_FAILED | NO_REFRESH_TOKEN | LOCK_TIMEOUT | FILE_ACCESS_ERROR | NETWORK_ERROR
            </code>
          </div>
        </div>

        <CodeBlock
          title="错误恢复流程"
          code={`// packages/core/src/gemini/geminiOAuth.ts:490-558

try {
  const credentials = await sharedManager.getValidCredentials(client);
  client.setCredentials(credentials);
  return client;
} catch (error) {
  if (error instanceof TokenManagerError) {
    switch (error.type) {
      case TokenError.NO_REFRESH_TOKEN:
        console.debug('No refresh token, proceeding with device flow');
        break;
      case TokenError.REFRESH_FAILED:
        console.debug('Token refresh failed, proceeding with device flow');
        break;
      case TokenError.NETWORK_ERROR:
        console.warn('Network error, trying device flow');
        break;
    }
  }

  // 重新触发 Device Flow
  const result = await authWithGeminiDeviceFlow(client, config);
  if (!result.success) {
    switch (result.reason) {
      case 'timeout':
        throw new Error('Google OAuth authentication timed out');
      case 'cancelled':
        throw new Error('Authentication was cancelled by user');
      case 'rate_limit':
        throw new Error('Too many requests, please try again later');
      default:
        throw new Error('Authentication failed');
    }
  }
  return client;
}`}
        />
      </Layer>

      {/* Token 存储 */}
      <Layer title="Token 存储与安全" icon="💾">
        <HighlightBox title="存储位置" icon="📁" variant="green">
          <ul className="pl-5 list-disc space-y-1">
            <li><code>~/.gemini/oauth_creds.json</code> - Google OAuth Token</li>
            <li><code>~/.gemini/oauth_creds.lock</code> - 刷新锁文件</li>
            <li><code>~/.gemini/google_oauth_creds.json</code> - Google OAuth Token</li>
          </ul>
        </HighlightBox>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-cyan-400 font-semibold mb-2">文件权限</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 目录: <code>0o700</code> (仅所有者)</li>
              <li>• 文件: <code>0o600</code> (仅所有者读写)</li>
            </ul>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-cyan-400 font-semibold mb-2">原子写入</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 先写入临时文件 (.tmp.uuid)</li>
              <li>• 再原子 rename 到目标路径</li>
              <li>• 防止写入中断导致数据损坏</li>
            </ul>
          </div>
        </div>

        <CodeBlock
          title="凭据文件结构"
          code={`// ~/.gemini/oauth_creds.json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "token_type": "Bearer",
  "expiry_date": 1735200000000,
  "resource_url": "https://generativelanguage.googleapis.com"
}`}
        />
      </Layer>

      {/* 源码导航 */}
      <Layer title="源码导航" icon="📂">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-600">
                <th className="py-2 px-3">功能</th>
                <th className="py-2 px-3">文件路径</th>
                <th className="py-2 px-3">关键函数/类</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">Google OAuth 客户端</td>
                <td className="py-2 px-3"><code>packages/core/src/gemini/geminiOAuth.ts</code></td>
                <td className="py-2 px-3">GeminiOAuth2Client, authWithGeminiDeviceFlow</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">Token 共享管理</td>
                <td className="py-2 px-3"><code>packages/core/src/gemini/sharedTokenManager.ts</code></td>
                <td className="py-2 px-3">SharedTokenManager, acquireLock</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">PKCE 工具</td>
                <td className="py-2 px-3"><code>packages/core/src/gemini/geminiOAuth.ts:47-73</code></td>
                <td className="py-2 px-3">generatePKCEPair, generateCodeChallenge</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">Google OAuth</td>
                <td className="py-2 px-3"><code>packages/core/src/code_assist/oauth2.ts</code></td>
                <td className="py-2 px-3">browserWebFlow, userCodeFlow</td>
              </tr>
              <tr>
                <td className="py-2 px-3">OpenAI API 集成</td>
                <td className="py-2 px-3"><code>packages/core/src/openai/openAIContentGenerator.ts</code></td>
                <td className="py-2 px-3">OpenAIContentGenerator</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
