/**
 * GoogleAuthentication - Google OAuth2 认证详解（上游 gemini-cli）
 * 深入解析：Loopback 浏览器登录 + NO_BROWSER 手动授权码（PKCE）+ token 持久化
 *
 * 关键源码：
 * - gemini-cli/packages/core/src/code_assist/oauth2.ts
 * - gemini-cli/packages/core/src/code_assist/oauth-credential-storage.ts
 * - gemini-cli/packages/core/src/utils/browser.ts
 */

import { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { HighlightBox } from '../components/HighlightBox';
import { useNavigation } from '../contexts/NavigationContext';

export function GoogleAuthentication() {
  const [activeTab, setActiveTab] = useState<'flow' | 'pkce' | 'storage'>('flow');
  const { navigate } = useNavigation();

  return (
    <div className="max-w-4xl mx-auto">
      <h1>🔐 Google OAuth2 认证详解（上游 Gemini CLI）</h1>

      <HighlightBox title="📌 30秒速览" icon="🎯" variant="blue">
        <ul className="m-0 leading-relaxed text-sm">
          <li>• 默认走 <strong>浏览器登录</strong>：本地 loopback 回调 <code>http://localhost:{'{'}port{'}'}/oauth2callback</code></li>
          <li>• 无浏览器/远程环境：走 <strong>手动授权码</strong>（带 PKCE），粘贴 code 完成登录</li>
          <li>• token 刷新由 <code>google-auth-library</code> 处理，CLI 监听 <code>client.on('tokens')</code> 持久化</li>
          <li>• 支持更安全的 HybridTokenStorage，并兼容迁移 <code>~/.gemini/oauth_creds.json</code></li>
        </ul>
      </HighlightBox>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { key: 'flow', label: '🌐 登录流程' },
          { key: 'pkce', label: '🔒 PKCE（手动授权码）' },
          { key: 'storage', label: '💾 存储与事件' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all font-medium ${
              activeTab === tab.key
                ? 'border-2 border-[var(--terminal-green)] bg-[rgba(0,255,136,0.1)] text-[var(--terminal-green)]'
                : 'border border-white/10 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'flow' && (
        <section className="space-y-6">
          <h2>🌐 登录流程：Web（默认） + Manual（NO_BROWSER）</h2>

          <p className="text-[var(--text-primary)]">
            上游 Gemini CLI 的 Google OAuth 登录主要在 <code>gemini-cli/packages/core/src/code_assist/oauth2.ts</code>：
            默认尝试打开浏览器走 loopback 回调；如果浏览器被抑制（NO_BROWSER/CI/SSH 等），则回退为“手动粘贴授权码”。
          </p>

          <MermaidDiagram
            title="默认 Web 登录（Loopback 回调）"
            chart={`sequenceDiagram
    autonumber
    participant CLI as 🖥️ gemini
    participant Local as 🧩 localhost callback
    participant Browser as 🌍 Browser
    participant Google as 🌐 Google OAuth

    CLI->>Local: listen /oauth2callback
    CLI->>CLI: authUrl = generateAuthUrl(redirect_uri, state)
    CLI->>Browser: open(authUrl)

    Browser->>Google: 登录 + 授权
    Google-->>Browser: redirect ?code&state
    Browser->>Local: GET /oauth2callback
    Local-->>CLI: resolve(loginCompletePromise)

    CLI->>Google: getToken(code)
    Google-->>CLI: tokens (access/refresh/expiry)
    CLI->>CLI: client.on('tokens') 持久化
`}
          />

          <CodeBlock
            title="oauth2.ts：Web 登录入口（节选）"
            language="typescript"
            code={`// gemini-cli/packages/core/src/code_assist/oauth2.ts

if (config.isBrowserLaunchSuppressed()) {
  // 回退：手动授权码
  await authWithUserCode(client);
  return client;
}

const webLogin = await authWithWeb(client);
await Promise.race([webLogin.loginCompletePromise, timeoutPromise]);`}
          />

          <HighlightBox title="浏览器何时会被抑制？" icon="🧩" variant="yellow">
            <ul className="m-0 pl-5 list-disc text-sm space-y-1">
              <li><code>NO_BROWSER=true</code> 或设置项 <code>noBrowser</code></li>
              <li><code>CI</code> / <code>DEBIAN_FRONTEND=noninteractive</code></li>
              <li>SSH 远程会话且无 GUI（详见 <code>utils/browser.ts</code>）</li>
            </ul>
          </HighlightBox>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('oauth-device-flow-anim')}
              className="px-4 py-2 rounded-lg bg-[rgba(16,185,129,0.12)] text-[var(--terminal-green)] border border-[rgba(16,185,129,0.25)] hover:bg-[rgba(16,185,129,0.18)] transition-colors cursor-pointer"
            >
              去看：OAuth 登录动画
            </button>
          </div>
        </section>
      )}

      {activeTab === 'pkce' && (
        <section className="space-y-6">
          <h2>🔒 PKCE：保护“手动授权码”流程</h2>

          <p className="text-[var(--text-primary)]">
            当浏览器不可用时，Gemini CLI 会打印授权 URL，并让用户粘贴授权码。
            这条路径使用 PKCE（RFC 7636）增强安全：没有 <code>code_verifier</code> 就无法用 code 换 token。
          </p>

          <MermaidDiagram
            title="PKCE 核心机制"
            chart={`flowchart LR
  A[code_verifier\n(随机)] --> B[SHA-256]
  B --> C[base64url] --> D[code_challenge]
  D --> E[generateAuthUrl\n(code_challenge)]
  F[粘贴 code] --> G[getToken\n(code_verifier)]
  E --> G
`}
          />

          <CodeBlock
            title="oauth2.ts：手动授权码（节选）"
            language="typescript"
            code={`// gemini-cli/packages/core/src/code_assist/oauth2.ts
const redirectUri = 'https://codeassist.google.com/authcode';
const codeVerifier = await client.generateCodeVerifierAsync();

const authUrl = client.generateAuthUrl({
  redirect_uri: redirectUri,
  access_type: 'offline',
  scope: OAUTH_SCOPE,
  code_challenge_method: CodeChallengeMethod.S256,
  code_challenge: codeVerifier.codeChallenge,
  state,
});

// 用户在浏览器中授权后，粘贴 code
const { tokens } = await client.getToken({
  code,
  codeVerifier: codeVerifier.codeVerifier,
  redirect_uri: redirectUri,
});
client.setCredentials(tokens);`}
          />
        </section>
      )}

      {activeTab === 'storage' && (
        <section className="space-y-6">
          <h2>💾 Token 持久化与事件</h2>

          <HighlightBox title="关键点" icon="💡" variant="green">
            <ul className="m-0 pl-5 list-disc text-sm space-y-1">
              <li><strong>刷新</strong>：由 <code>google-auth-library</code> 自动处理（access_token 过期会用 refresh_token 刷新）</li>
              <li><strong>持久化</strong>：Gemini CLI 监听 <code>client.on('tokens')</code> 保存更新</li>
              <li><strong>安全存储</strong>：支持 HybridTokenStorage，并可迁移旧的文件存储</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            title="oauth2.ts：tokens 事件 → 保存"
            language="typescript"
            code={`// gemini-cli/packages/core/src/code_assist/oauth2.ts
client.on('tokens', async (tokens) => {
  if (process.env['GEMINI_FORCE_ENCRYPTED_FILE_STORAGE'] === 'true') {
    await OAuthCredentialStorage.saveCredentials(tokens);
  } else {
    await cacheCredentials(tokens);
  }
});`}
          />

          <CodeBlock
            title="oauth-credential-storage.ts：迁移旧文件"
            language="typescript"
            code={`// gemini-cli/packages/core/src/code_assist/oauth-credential-storage.ts
private static async migrateFromFileStorage(): Promise<Credentials | null> {
  const oldFilePath = path.join(os.homedir(), GEMINI_DIR, OAUTH_FILE);
  // 读取 ~/.gemini/oauth_creds.json → 写入 HybridTokenStorage → 删除旧文件
}`}
          />

          <CodeBlock
            title="storage.ts：关键路径"
            language="typescript"
            code={`// gemini-cli/packages/core/src/config/storage.ts
Storage.getGlobalGeminiDir()  // ~/.gemini
Storage.getOAuthCredsPath()   // ~/.gemini/oauth_creds.json`}
          />
        </section>
      )}
    </div>
  );
}

