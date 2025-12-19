import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

export function ConfigSystem() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">配置系统详解</h2>

      {/* 配置层次 */}
      <Layer title="配置层次结构" icon="📁">
        <HighlightBox title="三层配置优先级" icon="🏗️" variant="blue">
          <p>配置按优先级从高到低加载：<strong>项目级 → 用户级 → 默认值</strong></p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">🏠 用户级配置</h4>
            <code className="text-xs text-gray-400 block mb-2">~/.innies/</code>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{`├── settings.json      # 全局设置
├── INNIES.md          # 用户级记忆
├── oauth_creds.json   # OAuth 凭据
├── agents/            # 用户级子代理
├── mcp/               # MCP 配置
├── themes/            # 主题文件
└── tmp/               # 临时文件
    └── <project_hash>/
        ├── chats/     # 聊天记录
        └── checkpoints/`}</pre>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">📂 项目级配置</h4>
            <code className="text-xs text-gray-400 block mb-2">.innies/</code>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{`├── settings.json      # 项目设置
├── INNIES.md          # 项目级记忆
├── agents/            # 项目级子代理
├── commands/          # 自定义命令
├── extensions/        # 扩展
├── sandbox.Dockerfile # 沙箱配置
└── sandbox.bashrc     # 沙箱 shell`}</pre>
          </div>
        </div>
      </Layer>

      {/* settings.json 结构 */}
      <Layer title="settings.json 配置结构" icon="⚙️">
        <JsonBlock
          code={`{
    // 模型配置
    "model": "qwen-coder-plus",
    "customModels": [
        {
            "name": "my-model",
            "baseUrl": "http://localhost:11434/v1",
            "apiKey": "ollama"
        }
    ],

    // 认证配置
    "authType": "qwen_oauth",  // qwen_oauth | use_gemini | api_key

    // 工具配置
    "allowedTools": ["read_file", "edit", "bash"],
    "excludeTools": ["web_search"],
    "coreTools": true,

    // 沙箱配置
    "sandbox": {
        "command": "docker",
        "image": "ghcr.io/zhimanai/innies-cli:latest"
    },

    // UI 配置
    "theme": "default",
    "vimMode": false,
    "compactMode": false,

    // 遥测配置
    "telemetry": {
        "enabled": false,
        "target": "console"
    },

    // MCP 服务器
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@anthropic/mcp-server-filesystem"]
        }
    }
}`}
        />
      </Layer>

      {/* Config 类 */}
      <Layer title="Config 类核心结构" icon="🔧">
        <CodeBlock
          title="packages/core/src/config/config.ts"
          code={`class Config {
    // 核心属性
    private sessionId: string;
    private targetDir: string;
    private debugMode: boolean;

    // 服务实例
    private fileDiscoveryService: FileDiscoveryService;
    private gitService: GitService;
    private toolRegistry: ToolRegistry;
    private subagentManager: SubagentManager;
    private contentGenerator: ContentGenerator;
    private geminiClient: GeminiClient;

    // 初始化流程
    async initialize(): Promise<void> {
        // 1. 创建文件发现服务
        this.fileDiscoveryService = new FileDiscoveryService(this);

        // 2. 创建 Git 服务
        this.gitService = new GitService(this.targetDir);

        // 3. 创建工具注册表
        this.toolRegistry = await createToolRegistry(this);

        // 4. 创建子代理管理器
        this.subagentManager = new SubagentManager(this);

        // 5. 初始化认证
        await this.refreshAuth();
    }

    // 刷新认证
    async refreshAuth(): Promise<void> {
        // 根据 authType 创建 ContentGenerator
        this.contentGenerator = await createContentGenerator(this);

        // 创建 GeminiClient
        this.geminiClient = new GeminiClient(this);
    }
}`}
        />
      </Layer>

      {/* 配置参数 */}
      <Layer title="主要配置参数" icon="📋">
        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-cyan-400 font-bold mb-2">模型配置</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <code>model</code><span className="text-gray-400">默认模型名称</span>
              <code>customModels</code><span className="text-gray-400">自定义模型列表</span>
              <code>temperature</code><span className="text-gray-400">温度参数 (0-2)</span>
              <code>maxTokens</code><span className="text-gray-400">最大输出 token</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-orange-400 font-bold mb-2">工具配置</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <code>coreTools</code><span className="text-gray-400">启用核心工具</span>
              <code>allowedTools</code><span className="text-gray-400">允许的工具列表</span>
              <code>excludeTools</code><span className="text-gray-400">排除的工具</span>
              <code>toolDiscoveryCommand</code><span className="text-gray-400">工具发现命令</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-green-400 font-bold mb-2">安全配置</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <code>sandbox</code><span className="text-gray-400">沙箱配置对象</span>
              <code>yolo</code><span className="text-gray-400">跳过所有确认</span>
              <code>trustWorkspace</code><span className="text-gray-400">信任工作区</span>
            </div>
          </div>
        </div>
      </Layer>

      {/* 配置加载流程 */}
      <Layer title="配置加载流程" icon="🔄">
        <div className="bg-black/30 rounded-xl p-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-blue-400/20 border border-blue-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>1. 命令行参数</strong>
              <div className="text-xs text-gray-400">yargs 解析 process.argv</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-purple-400/20 border border-purple-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>2. 环境变量</strong>
              <div className="text-xs text-gray-400">OPENAI_API_KEY, GEMINI_SANDBOX 等</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-green-400/20 border border-green-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>3. 项目配置</strong>
              <div className="text-xs text-gray-400">.innies/settings.json</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-orange-400/20 border border-orange-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>4. 用户配置</strong>
              <div className="text-xs text-gray-400">~/.innies/settings.json</div>
            </div>
            <div className="text-cyan-400">↓</div>

            <div className="bg-cyan-400/20 border border-cyan-400 rounded-lg px-4 py-2 text-center w-full max-w-md">
              <strong>5. 默认值</strong>
              <div className="text-xs text-gray-400">代码中的默认配置</div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 环境变量 */}
      <Layer title="重要环境变量" icon="🌍">
        <CodeBlock
          code={`# 认证
OPENAI_API_KEY=sk-...          # OpenAI API 密钥
OPENAI_BASE_URL=https://...    # 自定义 API 端点
OPENAI_MODEL=gpt-4             # 模型名称
GEMINI_API_KEY=...             # Google Gemini API 密钥

# 沙箱
GEMINI_SANDBOX=true            # 启用沙箱
GEMINI_SANDBOX=docker          # 使用 Docker
GEMINI_SANDBOX=podman          # 使用 Podman

# 调试
DEBUG=1                        # 调试模式
DEV=true                       # 开发模式 (React DevTools)

# IDE
QWEN_CODE_IDE_PORT=3000        # IDE MCP 端口
IDE_AUTH_TOKEN=...             # IDE 认证令牌

# 遥测
OTEL_EXPORTER_OTLP_ENDPOINT=   # OpenTelemetry 端点`}
        />
      </Layer>
    </div>
  );
}
