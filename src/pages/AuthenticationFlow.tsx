import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function AuthenticationFlow() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">认证流程详解</h2>

      {/* 认证类型 */}
      <Layer title="支持的认证方式" icon="🔐">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">🌟 Qwen OAuth (默认)</h4>
            <p className="text-sm text-gray-300 mb-2">
              免费使用，每天 2000 请求配额
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Device Code 流程</li>
              <li>• 无需 API 密钥</li>
              <li>• 自动令牌刷新</li>
            </ul>
            <code className="text-xs block mt-2 text-purple-300">authType: "qwen_oauth"</code>
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

      {/* Qwen OAuth 流程 */}
      <Layer title="Qwen OAuth 流程 (Device Code)" icon="📱">
        <div className="bg-black/30 rounded-xl p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-6 py-3 text-center">
              <strong>1. 请求 Device Code</strong>
              <div className="text-xs text-gray-400 mt-1">POST /oauth/device_code</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-6 py-3 text-center">
              <strong>2. 显示验证 URL</strong>
              <div className="text-xs text-gray-400 mt-1">用户访问 URL 并输入代码</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-green-400/20 border border-green-400 rounded-lg px-6 py-3 text-center">
              <strong>3. 轮询 Token</strong>
              <div className="text-xs text-gray-400 mt-1">POST /oauth/token (每隔 interval 秒)</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-6 py-3 text-center">
              <strong>4. 获取 Access Token</strong>
              <div className="text-xs text-gray-400 mt-1">保存到 SharedTokenManager</div>
            </div>
          </div>
        </div>

        <CodeBlock
          title="Qwen OAuth 实现"
          code={`// packages/core/src/qwen/qwenOAuth2.ts

const QWEN_OAUTH_DEVICE_CODE_ENDPOINT =
    'https://auth.zhimanai.cn/oauth/device_code';
const QWEN_OAUTH_TOKEN_ENDPOINT =
    'https://auth.zhimanai.cn/oauth/token';
const QWEN_OAUTH_CLIENT_ID = 'f0304373b74a44d2b584a3fb70ca9e56';

async function deviceCodeFlow(): Promise<OAuthToken> {
    // 1. 请求 device code
    const deviceResponse = await fetch(QWEN_OAUTH_DEVICE_CODE_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
            client_id: QWEN_OAUTH_CLIENT_ID,
            scope: 'openid profile'
        })
    });

    const { device_code, user_code, verification_uri, interval } =
        await deviceResponse.json();

    // 2. 显示给用户
    console.log(\`请访问: \${verification_uri}\`);
    console.log(\`输入代码: \${user_code}\`);

    // 3. 轮询等待用户完成
    while (true) {
        await sleep(interval * 1000);

        const tokenResponse = await fetch(QWEN_OAUTH_TOKEN_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify({
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                device_code: device_code,
                client_id: QWEN_OAUTH_CLIENT_ID
            })
        });

        const result = await tokenResponse.json();

        if (result.access_token) {
            return result;  // 成功！
        }

        if (result.error === 'authorization_pending') {
            continue;  // 继续等待
        }

        throw new Error(result.error);
    }
}`}
        />
      </Layer>

      {/* Token 管理 */}
      <Layer title="Token 管理 (SharedTokenManager)" icon="🎫">
        <CodeBlock
          title="packages/core/src/qwen/sharedTokenManager.ts"
          code={`class SharedTokenManager {
    private token: OAuthToken | null = null;
    private tokenPath: string;

    // 获取有效 Token
    async getValidToken(): Promise<string> {
        // 1. 检查内存缓存
        if (this.token && !this.isExpired(this.token)) {
            return this.token.access_token;
        }

        // 2. 尝试从磁盘加载
        const cached = await this.loadFromDisk();
        if (cached && !this.isExpired(cached)) {
            this.token = cached;
            return cached.access_token;
        }

        // 3. 尝试刷新
        if (cached?.refresh_token) {
            try {
                this.token = await this.refreshToken(cached.refresh_token);
                await this.saveToDisk(this.token);
                return this.token.access_token;
            } catch {
                // 刷新失败，需要重新认证
            }
        }

        // 4. 需要重新认证
        throw new CredentialsClearRequiredError();
    }

    // 检查是否过期（提前 5 分钟）
    private isExpired(token: OAuthToken): boolean {
        const expiresAt = token.created_at + token.expires_in - 300;
        return Date.now() / 1000 > expiresAt;
    }

    // 刷新 Token
    private async refreshToken(refreshToken: string): Promise<OAuthToken> {
        const response = await fetch(QWEN_OAUTH_TOKEN_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: QWEN_OAUTH_CLIENT_ID
            })
        });
        return response.json();
    }
}`}
        />

        <HighlightBox title="Token 存储位置" icon="💾" variant="green">
          <ul className="pl-5 list-disc space-y-1">
            <li><code>~/.innies/oauth_creds.json</code> - Qwen OAuth Token</li>
            <li><code>~/.innies/google_oauth_creds.json</code> - Google OAuth Token</li>
            <li>支持加密存储（设置 <code>FORCE_ENCRYPTED_FILE_ENV_VAR</code>）</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* Google OAuth */}
      <Layer title="Google OAuth 流程" icon="🌐">
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
    // 生成 PKCE 验证器
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

    // 交换 Token
    return exchangeCodeForTokens(code, codeVerifier);
}

// 模式 3: 用户代码流程 (无浏览器环境)
async function userCodeFlow(): Promise<Credentials> {
    // 获取用户代码
    const { user_code, verification_url } = await requestUserCode();

    console.log(\`请访问: \${verification_url}\`);
    console.log(\`输入代码: \${user_code}\`);

    // 轮询等待
    return pollForToken();
}`}
        />
      </Layer>

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
            <li><strong>项目配置</strong> - .innies/settings.json</li>
            <li><strong>用户配置</strong> - ~/.innies/settings.json</li>
            <li><strong>Qwen OAuth</strong> - 默认回退方式</li>
          </ol>
        </HighlightBox>
      </Layer>

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
            <p className="text-sm text-gray-300 mb-2">凭据过期或无效</p>
            <code className="text-xs text-gray-400">处理：清除缓存，重新触发认证流程</code>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-bold mb-2">TokenRefreshError</h4>
            <p className="text-sm text-gray-300 mb-2">Token 刷新失败</p>
            <code className="text-xs text-gray-400">处理：尝试重新认证或提示用户</code>
          </div>
        </div>

        <CodeBlock
          title="错误恢复流程"
          code={`try {
    const token = await tokenManager.getValidToken();
    // 使用 token...
} catch (error) {
    if (error instanceof CredentialsClearRequiredError) {
        // 清除缓存的凭据
        await clearCachedCredentials();

        // 重新触发认证
        await initiateAuthentication();
    } else if (error instanceof FatalAuthenticationError) {
        // 显示错误并退出
        console.error('认证失败:', error.message);
        process.exit(1);
    }
}`}
        />
      </Layer>
    </div>
  );
}
