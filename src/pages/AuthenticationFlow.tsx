import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
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
  const relatedPages: RelatedPage[] = [
    { id: 'google-authentication', label: 'Google OAuth 详解', description: 'Loopback/手动授权码两条路径' },
    { id: 'startup-chain', label: '启动链路', description: '认证如何触发' },
    { id: 'config', label: '配置系统', description: 'security.auth 设置项' },
    { id: 'oauth-device-flow-anim', label: 'OAuth 登录动画', description: '可视化浏览器登录回调' },
    { id: 'error-recovery-patterns', label: '错误恢复模式', description: '认证失败后的回退策略' },
  ];

  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">认证流程详解（上游 Gemini CLI）</h2>

      <HighlightBox title="⏱️ 30秒速览" icon="🎯" variant="blue">
        <ul className="space-y-2 text-sm">
          <li>• <strong>默认方式</strong>：Login with Google（OAuth 浏览器登录）60 req/min &amp; 1000 req/day</li>
          <li>• <strong>无浏览器回退</strong>：NO_BROWSER/CI/SSH 等环境触发“手动粘贴授权码”（带 PKCE）</li>
          <li>• <strong>其他方式</strong>：Gemini API Key（<code>GEMINI_API_KEY</code>）/ Vertex AI（<code>GOOGLE_CLOUD_PROJECT</code> 等）</li>
          <li>• <strong>凭据持久化</strong>：优先安全存储（HybridTokenStorage/Keychain），并兼容 <code>~/.gemini/oauth_creds.json</code> 迁移</li>
        </ul>
      </HighlightBox>

      <Layer title="支持的认证方式" icon="🔐">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">🌟 Login with Google（默认）</h4>
            <p className="text-sm text-gray-300 mb-2">个人账号免费：60 req/min &amp; 1000 req/day</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 浏览器登录：Loopback 回调（本地 HTTP server）</li>
              <li>• 无浏览器：手动授权码（PKCE）</li>
              <li>• 自动刷新并持久化 tokens</li>
            </ul>
            <code className="text-xs block mt-2 text-purple-300">AuthType: &quot;oauth-personal&quot;</code>
          </div>

          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">🔑 Gemini API Key</h4>
            <p className="text-sm text-gray-300 mb-2">适合需要精确控制模型/计费的场景</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 通过 <code>GEMINI_API_KEY</code> 提供密钥</li>
              <li>• 可配合 <code>GEMINI_MODEL</code> 指定默认模型</li>
            </ul>
            <code className="text-xs block mt-2 text-green-300">AuthType: &quot;gemini-api-key&quot;</code>
          </div>

          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">🏢 Vertex AI</h4>
            <p className="text-sm text-gray-300 mb-2">企业/生产环境：项目 + 区域 + 计费</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• <code>GOOGLE_CLOUD_PROJECT</code> + <code>GOOGLE_CLOUD_LOCATION</code></li>
              <li>• 或 <code>GOOGLE_API_KEY</code></li>
            </ul>
            <code className="text-xs block mt-2 text-cyan-300">AuthType: &quot;vertex-ai&quot;</code>
          </div>

          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">☁️ Compute ADC / Cloud Shell</h4>
            <p className="text-sm text-gray-300 mb-2">在支持的 GCP 环境中可非交互使用</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 通过 metadata server 获取 token</li>
              <li>• 常见于 Cloud Shell / GCE</li>
            </ul>
            <code className="text-xs block mt-2 text-orange-300">AuthType: &quot;compute-default-credentials&quot;</code>
          </div>
        </div>

        <HighlightBox title="📌 AuthType 的真实来源（上游）" icon="🧾" variant="yellow">
          <p className="text-sm">
            枚举定义在 <code>gemini-cli/packages/core/src/core/contentGenerator.ts</code>。
            设置项落在 <code>security.auth.selectedType</code>（<code>gemini-cli/packages/cli/src/config/settingsSchema.ts</code>）。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="启动时的认证决策" icon="🧠">
        <MermaidDiagram
          title="settings → refreshAuth 的关键链路"
          chart={`flowchart TD
    A[加载 settings\n~/.gemini/settings.json + .gemini/settings.json] --> B{security.auth.selectedType ?}
    B -- 有 --> C[config.refreshAuth(selectedType)]
    B -- 无 --> D[UI 引导选择登录方式]
    D --> C

    C --> E{AuthType}
    E -->|oauth-personal| F[getOauthClient()\n(code_assist/oauth2.ts)]
    E -->|gemini-api-key| G[loadApiKey()\n(GEMINI_API_KEY)]
    E -->|vertex-ai| H[Vertex/Project/Location\n(GOOGLE_CLOUD_*)]
    E -->|compute-default-credentials| I[Compute ADC\n(metadata server)]
    `}
        />
      </Layer>

      <Layer title="OAuth 浏览器登录（默认）" icon="🌐">
        <p className="text-sm text-gray-300 mb-3">
          上游实现不是 RFC8628 的 device_code 轮询，而是 <strong>Authorization Code + Loopback 回调</strong>：
          CLI 启动本地 HTTP Server（<code>localhost:{'{'}port{'}'}</code>），打开浏览器登录，并在回调中交换 token。
        </p>

        <MermaidDiagram
          title="Loopback OAuth 时序（核心）"
          chart={`sequenceDiagram
    autonumber
    participant CLI as Gemini CLI
    participant Local as Local HTTP Server
    participant Browser as Browser
    participant Google as Google OAuth

    CLI->>Local: listen http://localhost:{port}/oauth2callback
    CLI->>CLI: authUrl = OAuth2Client.generateAuthUrl(state, redirect_uri)
    CLI->>Browser: open(authUrl)

    Browser->>Google: 登录 + 授权
    Google-->>Browser: redirect ?code=...&state=...
    Browser->>Local: GET /oauth2callback
    Local-->>CLI: resolve(loginCompletePromise)

    CLI->>Google: OAuth2Client.getToken(code)
    Google-->>CLI: access_token + refresh_token + expiry_date
    CLI->>CLI: client.on('tokens') 持久化 + post_auth 回调
    `}
        />

        <CodeBlock
          title="packages/core/src/code_assist/oauth2.ts（节选）"
          code={`// authWithWeb(): 本地回调 + open()
const port = await getAvailablePort();
const redirectUri = \`http://localhost:\${port}/oauth2callback\`;
const state = crypto.randomBytes(32).toString('hex');
const authUrl = client.generateAuthUrl({
  redirect_uri: redirectUri,
  access_type: 'offline',
  scope: OAUTH_SCOPE,
  state,
});

await open(authUrl);
await Promise.race([webLogin.loginCompletePromise, timeoutPromise]);

// callback: exchange code -> tokens
const { tokens } = await client.getToken({ code: qs.get('code')!, redirect_uri: redirectUri });
client.setCredentials(tokens);`}
        />

        <HighlightBox title="什么时候不会自动打开浏览器？" icon="🧩" variant="blue">
          <ul className="pl-5 list-disc text-sm space-y-1">
            <li><code>NO_BROWSER=true</code> 或 config.noBrowser</li>
            <li><code>CI=true</code>、<code>DEBIAN_FRONTEND=noninteractive</code></li>
            <li>SSH 远程会话（非 Linux 或无 display）</li>
            <li><code>BROWSER=www-browser</code>（blocklist）</li>
          </ul>
          <p className="text-xs text-gray-400 mt-2">
            真实判断在 <code>gemini-cli/packages/core/src/utils/browser.ts</code>。
          </p>
        </HighlightBox>
      </Layer>

      <CollapsibleSection title="无浏览器：手动授权码（带 PKCE）" icon="🔒">
        <p className="text-sm text-gray-300 mb-3">
          当浏览器启动被抑制时，上游会打印一个授权 URL，并提示用户粘贴浏览器页面给出的 authorization code。
          该路径使用 <code>google-auth-library</code> 的 PKCE 辅助（<code>generateCodeVerifierAsync()</code>）。
        </p>

        <MermaidDiagram
          title="手动授权码时序（NO_BROWSER）"
          chart={`sequenceDiagram
    autonumber
    participant CLI as Gemini CLI
    participant Browser as Browser
    participant Google as Google OAuth

    CLI->>CLI: codeVerifier = generateCodeVerifierAsync()
    CLI->>CLI: authUrl = generateAuthUrl(code_challenge, redirect_uri=codeassist.google.com/authcode)
    CLI-->>Browser: 用户复制打开 authUrl
    Browser->>Google: 登录 + 授权
    Google-->>Browser: 显示 authorization code
    Browser-->>CLI: 用户粘贴 code
    CLI->>Google: getToken(code, codeVerifier)
    Google-->>CLI: tokens
    `}
        />

        <CodeBlock
          title="packages/core/src/code_assist/oauth2.ts（节选）"
          code={`const redirectUri = 'https://codeassist.google.com/authcode';
const codeVerifier = await client.generateCodeVerifierAsync();

const authUrl = client.generateAuthUrl({
  redirect_uri: redirectUri,
  access_type: 'offline',
  scope: OAUTH_SCOPE,
  code_challenge_method: CodeChallengeMethod.S256,
  code_challenge: codeVerifier.codeChallenge,
  state,
});

// ...prompt user to paste code...
const { tokens } = await client.getToken({
  code,
  codeVerifier: codeVerifier.codeVerifier,
  redirect_uri: redirectUri,
});
client.setCredentials(tokens);`}
        />
      </CollapsibleSection>

      <Layer title="凭据存储与刷新" icon="💾">
        <HighlightBox title="存储策略" icon="📁" variant="green">
          <ul className="pl-5 list-disc text-sm space-y-1">
            <li>token 更新由 <code>google-auth-library</code> 管理（自动刷新）</li>
            <li>Gemini CLI 监听 <code>client.on('tokens')</code> 并持久化更新</li>
            <li>支持将旧的 <code>~/.gemini/oauth_creds.json</code> 迁移到更安全的存储</li>
          </ul>
        </HighlightBox>

        <CodeBlock
          title="packages/core/src/code_assist/oauth2.ts（节选）"
          code={`client.on('tokens', async (tokens: Credentials) => {
  // 持久化更新的 token（HybridTokenStorage / file fallback）
  if (process.env['GEMINI_FORCE_ENCRYPTED_FILE_STORAGE'] === 'true') {
    await OAuthCredentialStorage.saveCredentials(tokens);
  } else {
    await cacheCredentials(tokens);
  }
});`}
        />

        <CodeBlock
          title="packages/core/src/config/storage.ts（路径）"
          code={`export const GEMINI_DIR = '.gemini';
export const OAUTH_FILE = 'oauth_creds.json';

Storage.getGlobalGeminiDir()   // -> ~/.gemini
Storage.getOAuthCredsPath()    // -> ~/.gemini/oauth_creds.json`}
        />
      </Layer>

      <CollapsibleSection title="fork-only：OpenAI-compatible 认证" icon="🧭">
        <HighlightBox title="⚠️ 不属于上游 Gemini CLI" icon="⚠️" variant="yellow">
          <p className="text-sm">
            如果你阅读的是基于 Gemini CLI 的 fork（例如接入 OpenAI-compatible 端点），可能会出现
            <code>OPENAI_API_KEY</code>/<code>OPENAI_BASE_URL</code> 等环境变量与额外的认证/兼容层。
            上游主线仅覆盖 Google OAuth / Gemini API Key / Vertex AI / Compute ADC。
          </p>
        </HighlightBox>
      </CollapsibleSection>

      <Layer title="源码导航" icon="📂">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-600">
                <th className="py-2 px-3">功能</th>
                <th className="py-2 px-3">文件路径</th>
                <th className="py-2 px-3">关键点</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">AuthType 枚举</td>
                <td className="py-2 px-3"><code>gemini-cli/packages/core/src/core/contentGenerator.ts</code></td>
                <td className="py-2 px-3">LOGIN_WITH_GOOGLE / USE_GEMINI / USE_VERTEX_AI / COMPUTE_ADC</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">OAuth 实现</td>
                <td className="py-2 px-3"><code>gemini-cli/packages/core/src/code_assist/oauth2.ts</code></td>
                <td className="py-2 px-3">authWithWeb / authWithUserCode / shouldAttemptBrowserLaunch</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">安全存储/迁移</td>
                <td className="py-2 px-3"><code>gemini-cli/packages/core/src/code_assist/oauth-credential-storage.ts</code></td>
                <td className="py-2 px-3">HybridTokenStorage + migrateFromFileStorage</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">路径/配置目录</td>
                <td className="py-2 px-3"><code>gemini-cli/packages/core/src/config/storage.ts</code></td>
                <td className="py-2 px-3">~/.gemini/* 的统一入口</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Zed 认证方法列表</td>
                <td className="py-2 px-3"><code>gemini-cli/packages/cli/src/zed-integration/zedIntegration.ts</code></td>
                <td className="py-2 px-3">authMethods id=AuthType.*</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
