import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

interface FlowStepProps {
  step: number;
  title: string;
  description: string;
  code?: string;
  file?: string;
}

function FlowStep({ step, title, description, code, file }: FlowStepProps) {
  return (
    <div className="relative pl-8 pb-8 border-l-2 border-cyan-400/30 last:border-l-0">
      <div className="absolute -left-3 top-0 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
        {step}
      </div>
      <div className="bg-white/5 rounded-lg p-4 ml-4">
        <h4 className="text-cyan-400 font-bold mb-2">{title}</h4>
        {file && (
          <div className="text-xs text-gray-500 font-mono mb-2">{file}</div>
        )}
        <p className="text-gray-300 text-sm mb-3">{description}</p>
        {code && <CodeBlock code={code} />}
      </div>
    </div>
  );
}

const relatedPages: RelatedPage[] = [
  { id: 'startup-chain', label: '启动链', description: '启动流程概述' },
  { id: 'config', label: '配置系统', description: '配置加载' },
  { id: 'sandbox', label: '沙箱系统', description: '沙箱启动' },
  { id: 'services-arch', label: '服务架构', description: '服务初始化' },
  { id: 'gemini-chat', label: 'GeminiChatCore', description: 'AI 核心初始化' },
  { id: 'interaction-loop', label: '交互循环', description: '主循环入口' },
];

export function StartupFlow() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">CLI 启动流程详解</h2>

      {/* 入口点 */}
      <Layer title="入口点" icon="🚀">
        <HighlightBox title="CLI 入口文件" icon="📁" variant="blue">
          <p>
            CLI 的入口是 <code className="bg-black/30 px-1 rounded">packages/cli/index.ts</code>，
            它作为 npm bin 脚本被调用，然后启动主程序。
          </p>
        </HighlightBox>

        <CodeBlock
          title="packages/cli/index.ts"
          code={`#!/usr/bin/env node
import { main } from './src/gemini.tsx';

// 启动主程序
main();`}
        />
      </Layer>

      {/* 启动流程 */}
      <Layer title="启动流程步骤" icon="📋">
        <div className="space-y-2">
          <FlowStep
            step={1}
            title="错误处理器初始化"
            description="设置全局未捕获异常处理器，确保错误被正确记录和处理。"
            file="packages/cli/src/gemini.tsx"
            code={`setupUnhandledRejectionHandler();
// 捕获 Promise rejection 和未处理异常
// 记录错误日志，优雅退出`}
          />

          <FlowStep
            step={2}
            title="内存管理"
            description="检测是否需要更多内存，如果需要则重新启动进程。"
            code={`const memoryArgs = getNodeMemoryArgs(isDebugMode);
if (memoryArgs.length > 0) {
    // 重新启动进程，获得更大的堆内存
    relaunchAppInChildProcess(memoryArgs);
    return;
}`}
          />

          <FlowStep
            step={3}
            title="配置加载"
            description="解析命令行参数，加载用户配置文件。"
            code={`// 解析命令行参数 (yargs)
const config = loadCliConfig(process.argv);

// 加载用户设置 (~/.gemini/settings.json)
const settings = loadSettings(config.getProjectRoot());

// 配置项包括：
// - 模型选择
// - API 密钥
// - 沙箱设置
// - 主题配置
// - 工具权限`}
          />

          <FlowStep
            step={4}
            title="认证验证"
            description="验证 API 密钥或 OAuth 令牌是否有效。"
            code={`// 支持多种认证方式
const authResult = await validateAuthMethod({
    // 1. Google OAuth (默认，免费 2000 请求/天)
    // 2. OpenAI API Key (OPENAI_API_KEY)
    // 3. Google API Key (GEMINI_API_KEY)
    // 4. 自定义 API (OPENAI_BASE_URL)
});

if (!authResult.valid) {
    // 显示认证错误，引导用户配置
    showAuthError(authResult.error);
}`}
          />

          <FlowStep
            step={5}
            title="应用初始化"
            description="初始化核心服务：认证、主题、IDE 连接、MCP 服务器。"
            code={`const initResult = await initializeApp(config, settings);

// 初始化内容：
// - 认证服务 (AuthService)
// - 主题管理 (ThemeManager)
// - IDE 连接 (VS Code / Zed)
// - MCP 客户端 (MCPClientManager)
// - 遥测服务 (TelemetryService)
// - 文件系统服务 (FileSystemService)`}
          />

          <FlowStep
            step={6}
            title="启动 UI"
            description="根据模式启动交互式 UI 或非交互模式。"
            code={`if (config.nonInteractive) {
    // 非交互模式：执行单个命令
    await runNonInteractive(config, settings);
} else {
    // 交互模式：启动 React + Ink UI
    await startInteractiveUI(
        config,
        settings,
        warnings,
        workspaceRoot,
        initResult
    );
}`}
          />
        </div>
      </Layer>

      {/* 交互模式启动 */}
      <Layer title="交互模式 UI 启动" icon="🖥️">
        <CodeBlock
          title="startInteractiveUI()"
          code={`async function startInteractiveUI(...) {
    // 1. 创建 Ink 实例
    const { waitUntilExit } = render(
        <App
            config={config}
            settings={settings}
            initResult={initResult}
        />,
        { exitOnCtrlC: false }  // 自定义 Ctrl+C 处理
    );

    // 2. 等待用户退出
    await waitUntilExit();

    // 3. 清理资源
    await cleanup();
}`}
        />

        <HighlightBox title="React + Ink" icon="⚛️" variant="green">
          <p>
            CLI 使用 <strong>React</strong> 和 <strong>Ink</strong> 来渲染终端 UI。
            Ink 是一个将 React 组件渲染到终端的库，支持 Flexbox 布局。
          </p>
        </HighlightBox>
      </Layer>

      {/* 配置文件 */}
      <Layer title="配置文件结构" icon="⚙️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-cyan-400 font-bold mb-2">全局配置</h4>
            <code className="text-sm text-gray-400">~/.gemini/</code>
            <ul className="mt-2 text-sm space-y-1">
              <li>├── settings.json (用户设置)</li>
              <li>├── auth.json (认证信息)</li>
              <li>├── themes/ (主题文件)</li>
              <li>└── mcp/ (MCP 配置)</li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-cyan-400 font-bold mb-2">项目配置</h4>
            <code className="text-sm text-gray-400">.gemini/</code>
            <ul className="mt-2 text-sm space-y-1">
              <li>├── settings.json (项目设置)</li>
              <li>├── GEMINI.md (项目说明)</li>
              <li>├── chats/ (聊天记录)</li>
              <li>└── sandbox.Dockerfile (沙箱配置)</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* 命令行参数 */}
      <Layer title="命令行参数" icon="💻">
        <CodeBlock
          code={`gemini [options] [prompt]

选项：
  --model, -m      指定模型名称
  --resume, -r     恢复上次会话
  --print, -p      打印模式（非交互）
  --yolo           跳过所有确认
  --sandbox        启用沙箱模式
  --verbose        详细输出
  --debug          调试模式
  --version        显示版本

示例：
  gemini "帮我写一个 React 组件"
  gemini -m gemini-1.5-pro --resume
  gemini --print "列出当前目录文件"`}
        />
      </Layer>

      {/* ==================== 深化内容开始 ==================== */}

      {/* 边界条件深度解析 */}
      <Layer title="边界条件深度解析" depth={1} defaultOpen={true}>
        <p className="text-gray-300 mb-6">
          CLI 启动过程涉及多个系统交互，需要正确处理各种边界情况以确保稳定性和良好的用户体验。
        </p>

        {/* Node.js 版本兼容性 */}
        <Layer title="1. Node.js 版本与环境检测" depth={2} defaultOpen={true}>
          <p className="text-gray-300 mb-4">
            CLI 要求 Node.js &gt;= 20，开发环境推荐 ~20.19.0。启动时进行严格的版本检查。
          </p>

          <CodeBlock
            code={`// Node.js 版本检测
// packages/cli/src/utils/nodeVersion.ts

const MIN_NODE_VERSION = 20;
const RECOMMENDED_VERSION = '20.19.0';

interface VersionCheckResult {
  compatible: boolean;
  currentVersion: string;
  message?: string;
  severity: 'error' | 'warning' | 'info';
}

function checkNodeVersion(): VersionCheckResult {
  const currentVersion = process.versions.node;
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  // 版本过低，无法运行
  if (major < MIN_NODE_VERSION) {
    return {
      compatible: false,
      currentVersion,
      message: \`Node.js 版本过低: \${currentVersion}。需要 >= \${MIN_NODE_VERSION}。
请升级 Node.js: https://nodejs.org/\`,
      severity: 'error'
    };
  }

  // 版本过新，可能有兼容性问题
  if (major > 22) {
    return {
      compatible: true,
      currentVersion,
      message: \`使用较新的 Node.js 版本 \${currentVersion}，可能存在未测试的兼容性问题\`,
      severity: 'warning'
    };
  }

  // 检查已知问题版本
  if (major === 20 && minor < 10) {
    return {
      compatible: true,
      currentVersion,
      message: \`Node.js \${currentVersion} 存在已知的 ESM 加载问题，建议升级到 >= 20.10.0\`,
      severity: 'warning'
    };
  }

  return {
    compatible: true,
    currentVersion,
    severity: 'info'
  };
}

// 环境变量检测
function detectEnvironment(): EnvironmentInfo {
  return {
    platform: process.platform,           // 'darwin' | 'win32' | 'linux'
    arch: process.arch,                   // 'x64' | 'arm64'
    shell: process.env.SHELL || 'unknown',
    terminal: process.env.TERM || 'unknown',
    isCI: Boolean(process.env.CI),
    isTTY: process.stdout.isTTY ?? false,
    colorSupport: detectColorSupport(),
    unicodeSupport: detectUnicodeSupport(),
    locale: process.env.LANG || process.env.LC_ALL || 'en_US.UTF-8'
  };
}

// 颜色支持检测
function detectColorSupport(): ColorLevel {
  // 明确禁用颜色
  if (process.env.NO_COLOR || process.env.FORCE_COLOR === '0') {
    return 0;  // 无颜色
  }

  // 强制启用颜色
  if (process.env.FORCE_COLOR) {
    return parseInt(process.env.FORCE_COLOR, 10) || 3;
  }

  // 非 TTY 默认无颜色
  if (!process.stdout.isTTY) {
    return 0;
  }

  // 检查终端类型
  const term = process.env.TERM || '';
  const colorterm = process.env.COLORTERM || '';

  if (colorterm === 'truecolor' || colorterm === '24bit') {
    return 3;  // 24-bit 真彩色
  }

  if (term.includes('256color')) {
    return 2;  // 256 色
  }

  if (term.includes('color') || term.includes('ansi')) {
    return 1;  // 16 色
  }

  return 1;  // 默认基本颜色
}

/*
环境兼容性矩阵：

┌─────────────────┬──────────┬───────────────────────────────────────┐
│ 平台            │ 状态     │ 注意事项                               │
├─────────────────┼──────────┼───────────────────────────────────────┤
│ macOS x64       │ ✅ 完全  │ 沙箱使用 sandbox-exec                  │
│ macOS arm64     │ ✅ 完全  │ 原生 ARM 支持                          │
│ Linux x64       │ ✅ 完全  │ Docker 沙箱                            │
│ Linux arm64     │ ✅ 完全  │ Docker/Podman 沙箱                     │
│ Windows x64     │ ⚠️ 部分  │ WSL 推荐，原生支持有限                  │
│ Windows arm64   │ ⚠️ 部分  │ WSL 推荐                               │
│ FreeBSD         │ ⚠️ 部分  │ 基本功能可用，沙箱不支持                │
└─────────────────┴──────────┴───────────────────────────────────────┘
*/`}
            language="typescript"
            title="版本与环境检测"
          />
        </Layer>

        {/* 内存管理边界 */}
        <Layer title="2. 内存分配与进程重启" depth={2} defaultOpen={true}>
          <p className="text-gray-300 mb-4">
            处理大型代码库或长对话时需要更多内存。CLI 会检测并在需要时自动重启进程获取更大堆内存。
          </p>

          <CodeBlock
            code={`// 内存管理策略
// packages/cli/src/utils/memory.ts

const DEFAULT_MAX_OLD_SPACE_SIZE = 4096;  // 4GB
const DEBUG_MAX_OLD_SPACE_SIZE = 8192;    // 8GB（调试模式）

interface MemoryConfig {
  maxOldSpaceSize: number;
  maxSemiSpaceSize?: number;
  needsRelaunch: boolean;
  currentHeapLimit: number;
}

function getNodeMemoryArgs(isDebugMode: boolean): string[] {
  // 检查当前堆限制
  const currentLimit = v8.getHeapStatistics().heap_size_limit;
  const targetLimit = isDebugMode ? DEBUG_MAX_OLD_SPACE_SIZE : DEFAULT_MAX_OLD_SPACE_SIZE;
  const targetBytes = targetLimit * 1024 * 1024;

  // 如果当前限制已足够，无需重启
  if (currentLimit >= targetBytes * 0.9) {
    return [];
  }

  // 检查是否已经在子进程中运行（避免无限重启）
  if (process.env.INNIES_MEMORY_CONFIGURED === 'true') {
    console.warn('内存已配置但仍不足，继续使用当前设置');
    return [];
  }

  // 需要重新启动以获得更大内存
  return [
    \`--max-old-space-size=\${targetLimit}\`,
    '--max-semi-space-size=64'  // 优化 GC 性能
  ];
}

// 进程重启逻辑
async function relaunchAppInChildProcess(memoryArgs: string[]): Promise<void> {
  const { spawn } = await import('child_process');

  // 构建子进程参数
  const args = [
    ...memoryArgs,
    ...process.execArgv,  // 保留原有 Node 参数
    ...process.argv.slice(1)  // 保留原有 CLI 参数
  ];

  // 设置环境变量标记已配置
  const env = {
    ...process.env,
    INNIES_MEMORY_CONFIGURED: 'true'
  };

  // 启动子进程
  const child = spawn(process.execPath, args, {
    stdio: 'inherit',
    env
  });

  // 传递信号到子进程
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
    process.on(signal, () => child.kill(signal));
  }

  // 等待子进程退出并使用相同的退出码
  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  // 处理子进程错误
  child.on('error', (err) => {
    console.error('启动子进程失败:', err);
    process.exit(1);
  });
}

/*
内存重启流程：

┌─────────────────────────────────────────────────────────────────┐
│ 原始进程 (默认堆限制 ~2GB)                                       │
├─────────────────────────────────────────────────────────────────┤
│  1. 检查当前堆限制                                              │
│  2. 堆限制 < 4GB * 0.9 ?                                        │
│     ├─ 否 → 继续执行                                            │
│     └─ 是 → 需要重启                                            │
│  3. 检查 INNIES_MEMORY_CONFIGURED                               │
│     ├─ 已设置 → 警告并继续（避免无限循环）                       │
│     └─ 未设置 → 启动子进程                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 子进程 (4GB 堆限制)                                              │
├─────────────────────────────────────────────────────────────────┤
│  INNIES_MEMORY_CONFIGURED=true                                   │
│  --max-old-space-size=4096                                      │
│  正常执行 CLI 逻辑                                               │
└─────────────────────────────────────────────────────────────────┘

注意事项：
- 父进程在子进程运行期间会阻塞
- 信号会正确传递到子进程
- 退出码会正确返回
*/`}
            language="typescript"
            title="内存管理与进程重启"
          />
        </Layer>

        {/* 配置文件加载顺序 */}
        <Layer title="3. 配置文件加载顺序与合并" depth={2} defaultOpen={true}>
          <p className="text-gray-300 mb-4">
            配置从多个来源加载并按优先级合并，确保用户可以灵活覆盖默认设置。
          </p>

          <CodeBlock
            code={`// 配置加载顺序
// packages/cli/src/config/configLoader.ts

interface ConfigSource {
  source: string;
  priority: number;  // 越高优先级越高
  config: Partial<CliConfig>;
}

async function loadAllConfigs(projectRoot: string): Promise<CliConfig> {
  const sources: ConfigSource[] = [];

  // 1. 默认配置（最低优先级）
  sources.push({
    source: 'defaults',
    priority: 0,
    config: getDefaultConfig()
  });

  // 2. 全局配置 (~/.gemini/settings.json)
  const globalConfig = await loadJsonSafe(
    path.join(os.homedir(), '.gemini', 'settings.json')
  );
  if (globalConfig) {
    sources.push({
      source: '~/.gemini/settings.json',
      priority: 10,
      config: globalConfig
    });
  }

  // 3. 项目配置 (.gemini/settings.json)
  const projectConfig = await loadJsonSafe(
    path.join(projectRoot, '.gemini', 'settings.json')
  );
  if (projectConfig) {
    sources.push({
      source: '.gemini/settings.json',
      priority: 20,
      config: projectConfig
    });
  }

  // 4. 环境变量
  const envConfig = loadEnvConfig();
  if (Object.keys(envConfig).length > 0) {
    sources.push({
      source: 'environment',
      priority: 30,
      config: envConfig
    });
  }

  // 5. 命令行参数（最高优先级）
  const cliConfig = parseCliArgs();
  sources.push({
    source: 'cli-args',
    priority: 40,
    config: cliConfig
  });

  // 按优先级排序并合并
  sources.sort((a, b) => a.priority - b.priority);

  let mergedConfig = {} as CliConfig;
  for (const source of sources) {
    mergedConfig = deepMerge(mergedConfig, source.config);
  }

  // 验证最终配置
  validateConfig(mergedConfig);

  return mergedConfig;
}

// 安全加载 JSON
async function loadJsonSafe(filePath: string): Promise<any | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      // 文件不存在是正常的
      return null;
    }

    if (err instanceof SyntaxError) {
      // JSON 语法错误
      console.warn(\`配置文件格式错误: \${filePath}\`);
      console.warn(\`错误详情: \${err.message}\`);
      return null;
    }

    // 其他错误（权限等）
    console.warn(\`无法读取配置文件: \${filePath}\`);
    return null;
  }
}

// 环境变量映射
function loadEnvConfig(): Partial<CliConfig> {
  const mapping: Record<string, keyof CliConfig> = {
    'INNIES_MODEL': 'model',
    'INNIES_SANDBOX': 'sandbox',
    'INNIES_THEME': 'theme',
    'OPENAI_API_KEY': 'apiKey',
    'OPENAI_BASE_URL': 'baseUrl',
    'OPENAI_MODEL': 'model',
    'GEMINI_API_KEY': 'geminiApiKey',
    'GEMINI_SANDBOX': 'sandbox',
    'DEBUG': 'debug',
    'NO_COLOR': 'noColor'
  };

  const config: Partial<CliConfig> = {};

  for (const [envVar, configKey] of Object.entries(mapping)) {
    const value = process.env[envVar];
    if (value !== undefined) {
      // 类型转换
      if (configKey === 'sandbox' || configKey === 'debug') {
        config[configKey] = value === 'true' || value === '1';
      } else {
        config[configKey] = value;
      }
    }
  }

  return config;
}

/*
配置合并优先级（从低到高）：

┌───────────────────────────────────────────────────────────────┐
│  优先级 40: 命令行参数 (--model, --sandbox)                    │
├───────────────────────────────────────────────────────────────┤
│  优先级 30: 环境变量 (OPENAI_API_KEY, INNIES_MODEL)           │
├───────────────────────────────────────────────────────────────┤
│  优先级 20: 项目配置 (.gemini/settings.json)                    │
├───────────────────────────────────────────────────────────────┤
│  优先级 10: 全局配置 (~/.gemini/settings.json)                  │
├───────────────────────────────────────────────────────────────┤
│  优先级 0:  默认配置 (内置默认值)                              │
└───────────────────────────────────────────────────────────────┘

示例：
- 默认 model = "gemini-1.5-flash"
- 全局配置 model = "gemini-1.5-pro"
- 项目配置 model = "gpt-4"
- 环境变量 无
- 命令行 --model claude-3

最终 model = "claude-3" (命令行覆盖所有)
*/`}
            language="typescript"
            title="配置加载与合并"
          />

          <MermaidDiagram chart={`
flowchart TD
    subgraph "配置加载流程"
        D[默认配置<br/>优先级: 0] --> M[合并器]
        G[全局配置<br/>~/.gemini/settings.json<br/>优先级: 10] --> M
        P[项目配置<br/>.gemini/settings.json<br/>优先级: 20] --> M
        E[环境变量<br/>OPENAI_API_KEY 等<br/>优先级: 30] --> M
        C[命令行参数<br/>--model 等<br/>优先级: 40] --> M
    end

    M --> V{验证配置}
    V -->|有效| F[最终配置]
    V -->|无效| ERR[显示错误<br/>使用默认值]
    ERR --> F

    style C fill:#22d3ee,color:#000
    style F fill:#22c55e,color:#000
    style ERR fill:#ef4444,color:#fff
          `} />
        </Layer>

        {/* 认证流程边界 */}
        <Layer title="4. 认证流程与回退策略" depth={2} defaultOpen={true}>
          <p className="text-gray-300 mb-4">
            认证支持多种方式，按优先级尝试，确保用户能顺利使用服务。
          </p>

          <CodeBlock
            code={`// 认证策略链
// packages/cli/src/auth/authChain.ts

interface AuthProvider {
  name: string;
  priority: number;
  isConfigured(): boolean;
  validate(): Promise<AuthResult>;
  getCredentials(): Credentials;
}

// 认证提供者实现
const authProviders: AuthProvider[] = [
  // 1. OpenAI API Key（最高优先级，因为明确配置）
  {
    name: 'openai-api-key',
    priority: 100,
    isConfigured: () => Boolean(process.env.OPENAI_API_KEY),
    async validate() {
      const apiKey = process.env.OPENAI_API_KEY!;
      const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

      try {
        // 验证 API Key 有效性
        const response = await fetch(\`\${baseUrl}/models\`, {
          headers: { 'Authorization': \`Bearer \${apiKey}\` }
        });

        if (response.status === 401) {
          return { valid: false, error: 'API Key 无效' };
        }

        if (response.status === 403) {
          return { valid: false, error: 'API Key 权限不足' };
        }

        return {
          valid: true,
          provider: 'openai',
          capabilities: await this.detectCapabilities(response)
        };
      } catch (err) {
        return {
          valid: false,
          error: \`无法连接 API: \${(err as Error).message}\`
        };
      }
    },
    getCredentials() {
      return {
        type: 'bearer',
        token: process.env.OPENAI_API_KEY!,
        baseUrl: process.env.OPENAI_BASE_URL
      };
    }
  },

  // 2. Gemini API Key
  {
    name: 'gemini-api-key',
    priority: 90,
    isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
    async validate() {
      // Gemini API 验证逻辑
      const apiKey = process.env.GEMINI_API_KEY!;
      try {
        const response = await fetch(
          \`https://generativelanguage.googleapis.com/v1beta/models?key=\${apiKey}\`
        );

        if (!response.ok) {
          return { valid: false, error: 'Gemini API Key 无效' };
        }

        return { valid: true, provider: 'gemini' };
      } catch (err) {
        return { valid: false, error: '无法验证 Gemini API Key' };
      }
    },
    getCredentials() {
      return {
        type: 'api-key',
        token: process.env.GEMINI_API_KEY!,
        baseUrl: 'https://generativelanguage.googleapis.com'
      };
    }
  },

  // 3. Google OAuth（默认免费方式）
  {
    name: 'google-oauth',
    priority: 50,
    isConfigured: () => {
      // 检查是否有缓存的 OAuth 令牌
      const tokenPath = path.join(os.homedir(), '.gemini', 'auth.json');
      try {
        const auth = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
        return Boolean(auth.accessToken);
      } catch {
        return false;
      }
    },
    async validate() {
      const tokenPath = path.join(os.homedir(), '.gemini', 'auth.json');

      try {
        const auth = JSON.parse(await fs.readFile(tokenPath, 'utf-8'));

        // 检查令牌是否过期
        if (auth.expiresAt && Date.now() > auth.expiresAt) {
          // 尝试刷新令牌
          const refreshed = await this.refreshToken(auth.refreshToken);
          if (!refreshed.valid) {
            return { valid: false, error: '令牌已过期，请重新登录' };
          }
          return refreshed;
        }

        return { valid: true, provider: 'google-oauth' };
      } catch {
        return { valid: false, error: '未登录 Google OAuth' };
      }
    },
    getCredentials() {
      const tokenPath = path.join(os.homedir(), '.gemini', 'auth.json');
      const auth = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
      return {
        type: 'oauth',
        token: auth.accessToken,
        refreshToken: auth.refreshToken
      };
    }
  }
];

// 执行认证链
async function authenticateUser(): Promise<AuthResult> {
  // 按优先级排序
  const sortedProviders = [...authProviders]
    .filter(p => p.isConfigured())
    .sort((a, b) => b.priority - a.priority);

  if (sortedProviders.length === 0) {
    // 没有配置任何认证方式，引导用户设置
    return {
      valid: false,
      error: '未配置认证方式',
      suggestion: \`请选择以下方式之一：
1. 设置 OPENAI_API_KEY 环境变量
2. 运行 gemini auth 登录 Google OAuth（免费）
3. 设置 GEMINI_API_KEY 使用 Google API\`
    };
  }

  // 尝试每个已配置的提供者
  for (const provider of sortedProviders) {
    const result = await provider.validate();

    if (result.valid) {
      return {
        ...result,
        providerName: provider.name,
        credentials: provider.getCredentials()
      };
    }

    // 记录失败原因但继续尝试下一个
    console.debug(\`认证提供者 \${provider.name} 验证失败: \${result.error}\`);
  }

  // 所有提供者都失败
  return {
    valid: false,
    error: '所有配置的认证方式都无效',
    suggestion: '请检查 API Key 或重新登录'
  };
}

/*
认证回退链：

┌─────────────────────────────────────────────────────────────────┐
│  尝试 1: OpenAI API Key (OPENAI_API_KEY)                        │
│  ├─ 成功 → 使用 OpenAI 认证                                     │
│  └─ 失败 → 继续尝试                                             │
├─────────────────────────────────────────────────────────────────┤
│  尝试 2: Gemini API Key (GEMINI_API_KEY)                        │
│  ├─ 成功 → 使用 Gemini 认证                                     │
│  └─ 失败 → 继续尝试                                             │
├─────────────────────────────────────────────────────────────────┤
│  尝试 3: Google OAuth (缓存令牌)                                   │
│  ├─ 成功 → 使用 Google OAuth                                      │
│  ├─ 过期 → 尝试刷新令牌                                         │
│  └─ 失败 → 无可用认证                                           │
├─────────────────────────────────────────────────────────────────┤
│  回退: 显示认证引导                                              │
│  - 引导用户配置 API Key                                         │
│  - 或运行 gemini auth 登录                                        │
└─────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="认证链与回退策略"
          />
        </Layer>

        {/* 优雅退出处理 */}
        <Layer title="5. 信号处理与优雅退出" depth={2} defaultOpen={true}>
          <p className="text-gray-300 mb-4">
            CLI 需要正确处理各种退出信号，确保资源正确释放和数据保存。
          </p>

          <CodeBlock
            code={`// 信号处理
// packages/cli/src/utils/shutdown.ts

type ShutdownHandler = () => Promise<void> | void;

class GracefulShutdown {
  private handlers: Map<string, ShutdownHandler> = new Map();
  private isShuttingDown = false;
  private shutdownTimeout = 5000;  // 5秒超时

  constructor() {
    this.setupSignalHandlers();
  }

  // 注册清理处理器
  register(name: string, handler: ShutdownHandler): void {
    this.handlers.set(name, handler);
  }

  // 注销处理器
  unregister(name: string): void {
    this.handlers.delete(name);
  }

  private setupSignalHandlers(): void {
    // 处理 Ctrl+C
    process.on('SIGINT', () => this.handleSignal('SIGINT'));

    // 处理终止信号
    process.on('SIGTERM', () => this.handleSignal('SIGTERM'));

    // 处理挂起信号（终端关闭）
    process.on('SIGHUP', () => this.handleSignal('SIGHUP'));

    // 处理未捕获异常
    process.on('uncaughtException', (err) => {
      console.error('未捕获异常:', err);
      this.handleSignal('uncaughtException', 1);
    });

    // 处理未处理的 Promise rejection
    process.on('unhandledRejection', (reason) => {
      console.error('未处理的 Promise rejection:', reason);
      // 不立即退出，仅记录
    });
  }

  private async handleSignal(signal: string, exitCode = 0): Promise<void> {
    // 防止重复处理
    if (this.isShuttingDown) {
      console.log('\\n强制退出...');
      process.exit(exitCode);
    }

    this.isShuttingDown = true;
    console.log(\`\\n收到 \${signal} 信号，正在清理...\`);

    // 创建超时保护
    const timeoutId = setTimeout(() => {
      console.error('清理超时，强制退出');
      process.exit(exitCode);
    }, this.shutdownTimeout);

    try {
      // 按注册顺序的逆序执行清理
      const handlersArray = Array.from(this.handlers.entries()).reverse();

      for (const [name, handler] of handlersArray) {
        try {
          await handler();
          console.debug(\`已清理: \${name}\`);
        } catch (err) {
          console.error(\`清理 \${name} 失败:\`, err);
        }
      }

      clearTimeout(timeoutId);
      process.exit(exitCode);
    } catch (err) {
      console.error('清理过程出错:', err);
      clearTimeout(timeoutId);
      process.exit(1);
    }
  }
}

// 全局实例
export const shutdown = new GracefulShutdown();

// 注册各模块的清理处理器
function registerCleanupHandlers(): void {
  // MCP 服务器清理
  shutdown.register('mcp-servers', async () => {
    await mcpManager.disconnectAll();
  });

  // 聊天会话保存
  shutdown.register('chat-session', async () => {
    await chatSession.saveIfNeeded();
  });

  // 遥测数据刷新
  shutdown.register('telemetry', async () => {
    await telemetry.flush();
  });

  // 沙箱容器清理
  shutdown.register('sandbox', async () => {
    await sandboxManager.cleanup();
  });

  // 临时文件清理
  shutdown.register('temp-files', async () => {
    await tempFileManager.cleanupAll();
  });

  // IDE 连接关闭
  shutdown.register('ide-connection', async () => {
    await ideConnection.disconnect();
  });
}

/*
清理顺序（后注册先执行）：

┌─────────────────────────────────────────────────────────────────┐
│  1. IDE 连接关闭（最后注册，最先清理）                           │
│     - 断开 VS Code / Zed 连接                                   │
├─────────────────────────────────────────────────────────────────┤
│  2. 临时文件清理                                                 │
│     - 删除临时目录                                              │
├─────────────────────────────────────────────────────────────────┤
│  3. 沙箱容器清理                                                 │
│     - 停止运行的容器                                            │
│     - 清理容器网络                                              │
├─────────────────────────────────────────────────────────────────┤
│  4. 遥测数据刷新                                                 │
│     - 发送待发送的遥测数据                                       │
├─────────────────────────────────────────────────────────────────┤
│  5. 聊天会话保存                                                 │
│     - 保存当前会话状态                                          │
├─────────────────────────────────────────────────────────────────┤
│  6. MCP 服务器清理（最先注册，最后清理）                         │
│     - 断开所有 MCP 连接                                         │
│     - 等待 pending 请求完成                                      │
└─────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="优雅退出处理"
          />
        </Layer>
      </Layer>

      {/* 常见问题与调试技巧 */}
      <Layer title="常见问题与调试技巧" depth={1} defaultOpen={true}>
        <p className="text-gray-300 mb-6">
          启动过程中可能遇到各种问题，以下是常见问题的诊断和解决方法。
        </p>

        {/* 问题1: 启动失败 */}
        <Layer title="问题1: CLI 无法启动" depth={2} defaultOpen={true}>
          <HighlightBox title="常见症状" color="red">
            <ul className="text-sm space-y-1">
              <li>• 执行 <code>gemini</code> 命令无响应或立即退出</li>
              <li>• 显示 "command not found" 错误</li>
              <li>• Node.js 版本错误</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            code={`# 诊断步骤

# 1. 检查 Node.js 版本
node --version
# 要求: >= 20.0.0

# 2. 检查 npm 全局安装路径
npm config get prefix
# 确保该路径在 PATH 中

# 3. 检查 gemini 命令位置
which gemini || where gemini
# 应该指向正确的安装位置

# 4. 检查权限
ls -la $(which gemini)
# 应该有执行权限

# 5. 直接运行检查错误
node $(which gemini) 2>&1

# 6. 启用调试模式
DEBUG=1 gemini

# 常见解决方案

# 方案 A: Node.js 版本过低
# 使用 nvm 升级
nvm install 20
nvm use 20

# 方案 B: PATH 问题
# 添加到 ~/.bashrc 或 ~/.zshrc
export PATH="$(npm config get prefix)/bin:$PATH"

# 方案 C: 权限问题
# 修复全局安装权限
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# 方案 D: 重新安装
npm uninstall -g @anthropics/gemini-cli
npm install -g @anthropics/gemini-cli`}
            language="bash"
            title="启动问题诊断"
          />
        </Layer>

        {/* 问题2: 认证错误 */}
        <Layer title="问题2: 认证失败" depth={2} defaultOpen={true}>
          <HighlightBox title="常见症状" color="red">
            <ul className="text-sm space-y-1">
              <li>• "API Key 无效" 错误</li>
              <li>• "未配置认证方式" 提示</li>
              <li>• OAuth 登录失败</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            code={`# 认证问题诊断

# 1. 检查环境变量是否设置
echo $OPENAI_API_KEY
echo $GEMINI_API_KEY

# 2. 验证 API Key 格式
# OpenAI: sk-... (以 sk- 开头)
# Gemini: AIza... (以 AIza 开头)

# 3. 测试 API 连接
# OpenAI
curl https://api.openai.com/v1/models \\
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 4. 检查 OAuth 令牌
cat ~/.gemini/auth.json

# 5. 清除并重新登录
rm ~/.gemini/auth.json
gemini auth login

# 调试认证过程
DEBUG_AUTH=1 gemini

# 常见解决方案

# 方案 A: 环境变量未生效
# 检查 shell 配置文件是否正确
source ~/.bashrc  # 或 ~/.zshrc

# 方案 B: .env 文件位置错误
# 项目根目录应该有 .env 文件
# 或全局 ~/.env

# 方案 C: API Key 权限不足
# OpenAI Dashboard 检查 Key 权限
# 确保有 API 调用权限

# 方案 D: OAuth 令牌过期
gemini auth refresh
# 如果失败则重新登录
gemini auth login`}
            language="bash"
            title="认证问题诊断"
          />
        </Layer>

        {/* 问题3: 配置加载错误 */}
        <Layer title="问题3: 配置加载问题" depth={2} defaultOpen={true}>
          <HighlightBox title="常见症状" color="red">
            <ul className="text-sm space-y-1">
              <li>• 设置未生效</li>
              <li>• JSON 解析错误</li>
              <li>• 配置文件被忽略</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            code={`# 配置问题诊断

# 1. 检查配置文件是否存在
ls -la ~/.gemini/settings.json
ls -la .gemini/settings.json

# 2. 验证 JSON 语法
# 使用 jq 检查
cat ~/.gemini/settings.json | jq .
cat .gemini/settings.json | jq .

# 3. 查看合并后的配置
gemini config show

# 4. 检查特定配置项
gemini config get model
gemini config get sandbox

# 5. 检查配置来源
DEBUG_CONFIG=1 gemini

# 输出示例：
# [config] Loading from defaults
# [config] Loading from ~/.gemini/settings.json
# [config] Loading from .gemini/settings.json
# [config] Loading from environment
# [config] Loading from cli args
# [config] Final config: {...}

# 常见问题修复

# 问题: JSON 语法错误
# 使用在线验证器检查 JSON
# https://jsonlint.com/

# 问题: 配置未生效
# 检查优先级
# 命令行 > 环境变量 > 项目配置 > 全局配置 > 默认

# 问题: 权限错误
chmod 600 ~/.gemini/settings.json
chmod 600 ~/.gemini/auth.json

# 重置为默认配置
rm ~/.gemini/settings.json
gemini config reset`}
            language="bash"
            title="配置问题诊断"
          />
        </Layer>

        {/* 问题4: 内存不足 */}
        <Layer title="问题4: 内存相关问题" depth={2} defaultOpen={true}>
          <HighlightBox title="常见症状" color="red">
            <ul className="text-sm space-y-1">
              <li>• "JavaScript heap out of memory" 错误</li>
              <li>• CLI 响应变慢</li>
              <li>• 频繁崩溃</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            code={`# 内存问题诊断

# 1. 检查当前内存限制
node -e "console.log(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024 + ' MB')"

# 2. 监控运行时内存
gemini --debug 2>&1 | grep memory

# 3. 手动增加内存限制
NODE_OPTIONS="--max-old-space-size=8192" gemini

# 4. 检查内存泄漏
# 使用 --expose-gc 启动
node --expose-gc $(which gemini) --debug

# 5. 分析内存快照
node --inspect $(which gemini)
# 然后在 Chrome DevTools 中分析

# 解决方案

# 方案 A: 临时增加内存
export NODE_OPTIONS="--max-old-space-size=8192"

# 方案 B: 永久配置
# 在 ~/.bashrc 或 ~/.zshrc 中添加
export NODE_OPTIONS="--max-old-space-size=8192"

# 方案 C: 减少上下文
# 使用 --resume 时清理旧会话
gemini --new-session

# 方案 D: 关闭长时间运行的会话
# 定期重启 CLI，不要让会话运行太久

# 内存使用参考：
# - 小型对话: ~200MB
# - 中型项目: ~500MB
# - 大型代码库: ~1-2GB
# - 极大项目: 4GB+`}
            language="bash"
            title="内存问题诊断"
          />
        </Layer>

        {/* 调试模式详解 */}
        <Layer title="调试模式与日志" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// 调试模式选项
// packages/cli/src/debug/debugMode.ts

interface DebugOptions {
  // 主调试开关
  DEBUG: boolean;           // 环境变量 DEBUG=1

  // 模块级调试
  DEBUG_AUTH: boolean;      // 认证流程
  DEBUG_CONFIG: boolean;    // 配置加载
  DEBUG_MCP: boolean;       // MCP 通信
  DEBUG_TOOLS: boolean;     // 工具调用
  DEBUG_STREAM: boolean;    // 流式响应
  DEBUG_LOOP: boolean;      // 循环检测

  // 详细日志
  VERBOSE: boolean;         // 详细输出
  TRACE: boolean;           // 函数调用追踪

  // 性能分析
  PROFILE: boolean;         // 性能分析
  MEMORY: boolean;          // 内存追踪
}

// 使用示例
DEBUG=1 gemini                        # 全部调试
DEBUG_AUTH=1 gemini                   # 仅认证调试
DEBUG_MCP=1 DEBUG_TOOLS=1 gemini      # MCP 和工具调试

// 日志输出位置
const logLocations = {
  // 标准输出
  stdout: '常规日志和响应',

  // 标准错误
  stderr: '错误和调试信息',

  // 日志文件
  logFile: '~/.gemini/logs/gemini.log',

  // 调试日志
  debugFile: '~/.gemini/logs/debug.log',

  // 会话日志
  sessionLog: '.gemini/logs/session-{id}.log'
};

// 日志级别
enum LogLevel {
  ERROR = 0,   // 仅错误
  WARN = 1,    // 警告和错误
  INFO = 2,    // 信息、警告、错误
  DEBUG = 3,   // 调试信息
  TRACE = 4    // 详细追踪
}

// 配置日志级别
process.env.LOG_LEVEL = 'debug';

/*
日志输出示例：

[2024-01-15T10:30:00.123Z] [INFO] Starting Innies CLI v1.2.3
[2024-01-15T10:30:00.150Z] [DEBUG] Loading config from ~/.gemini/settings.json
[2024-01-15T10:30:00.175Z] [DEBUG] Merged config: { model: "gemini-1.5-pro", ... }
[2024-01-15T10:30:00.200Z] [INFO] Authenticating with google-oauth
[2024-01-15T10:30:00.500Z] [DEBUG] OAuth token validated
[2024-01-15T10:30:00.520Z] [INFO] Connecting to MCP servers...
[2024-01-15T10:30:01.000Z] [DEBUG] MCP server 'filesystem' connected
[2024-01-15T10:30:01.050Z] [INFO] CLI ready

调试建议：
1. 首先使用 DEBUG=1 获取全面信息
2. 根据问题类型使用特定调试标志
3. 检查 ~/.gemini/logs/ 目录的日志文件
4. 使用 --verbose 获取更多输出
*/`}
            language="typescript"
            title="调试模式详解"
          />
        </Layer>
      </Layer>

      {/* 性能优化建议 */}
      <Layer title="性能优化建议" depth={1} defaultOpen={true}>
        <p className="text-gray-300 mb-6">
          CLI 启动性能直接影响用户体验，以下是优化启动速度的策略。
        </p>

        {/* 启动时间分析 */}
        <Layer title="1. 启动时间分析与基准" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// 启动时间测量
// packages/cli/src/perf/startupMetrics.ts

interface StartupMetrics {
  total: number;         // 总启动时间
  phases: PhaseMetric[]; // 各阶段时间
}

interface PhaseMetric {
  name: string;
  duration: number;
  percentage: number;
}

class StartupProfiler {
  private marks: Map<string, number> = new Map();
  private startTime: number;

  start(): void {
    this.startTime = performance.now();
    this.marks.set('start', this.startTime);
  }

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  getMetrics(): StartupMetrics {
    const total = performance.now() - this.startTime;
    const phases: PhaseMetric[] = [];

    const markNames = Array.from(this.marks.keys());
    for (let i = 1; i < markNames.length; i++) {
      const prev = markNames[i - 1];
      const curr = markNames[i];
      const duration = this.marks.get(curr)! - this.marks.get(prev)!;

      phases.push({
        name: curr,
        duration,
        percentage: (duration / total) * 100
      });
    }

    return { total, phases };
  }

  report(): void {
    const metrics = this.getMetrics();

    console.log('\\n=== 启动性能报告 ===');
    console.log(\`总时间: \${metrics.total.toFixed(2)}ms\\n\`);

    for (const phase of metrics.phases) {
      const bar = '█'.repeat(Math.floor(phase.percentage / 2));
      console.log(
        \`\${phase.name.padEnd(25)} \${phase.duration.toFixed(2).padStart(8)}ms \${phase.percentage.toFixed(1).padStart(5)}% \${bar}\`
      );
    }
  }
}

// 使用示例
const profiler = new StartupProfiler();
profiler.start();

// ... 各阶段执行
profiler.mark('node-init');
profiler.mark('config-load');
profiler.mark('auth-validate');
profiler.mark('mcp-connect');
profiler.mark('ui-render');
profiler.mark('ready');

profiler.report();

/*
典型启动性能报告：

=== 启动性能报告 ===
总时间: 1250.00ms

node-init                      50.00ms   4.0% ██
config-load                   100.00ms   8.0% ████
auth-validate                 300.00ms  24.0% ████████████
mcp-connect                   600.00ms  48.0% ████████████████████████
ui-render                     150.00ms  12.0% ██████
ready                          50.00ms   4.0% ██

瓶颈分析：
- MCP 连接占 48%（网络 I/O）
- 认证验证占 24%（API 调用）
- 其他阶段相对较快

优化重点：
1. MCP 连接并行化
2. 认证缓存
3. 延迟加载非必需模块
*/`}
            language="typescript"
            title="启动时间分析"
          />

          <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-cyan-400 font-semibold mb-2">启动时间基准</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2">场景</th>
                    <th className="text-right py-2">冷启动</th>
                    <th className="text-right py-2">热启动</th>
                    <th className="text-right py-2">目标</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="py-2">基础启动</td>
                    <td className="text-right py-2">800-1200ms</td>
                    <td className="text-right py-2">400-600ms</td>
                    <td className="text-right py-2">&lt;500ms</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2">带 MCP 服务器</td>
                    <td className="text-right py-2">1500-2500ms</td>
                    <td className="text-right py-2">800-1200ms</td>
                    <td className="text-right py-2">&lt;1000ms</td>
                  </tr>
                  <tr>
                    <td className="py-2">完整功能</td>
                    <td className="text-right py-2">2000-3000ms</td>
                    <td className="text-right py-2">1000-1500ms</td>
                    <td className="text-right py-2">&lt;1500ms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Layer>

        {/* 延迟加载策略 */}
        <Layer title="2. 延迟加载策略" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// 延迟加载模块管理
// packages/cli/src/utils/lazyLoader.ts

type ModuleFactory<T> = () => Promise<T>;

class LazyModule<T> {
  private module: T | null = null;
  private loading: Promise<T> | null = null;

  constructor(
    private factory: ModuleFactory<T>,
    private name: string
  ) {}

  async get(): Promise<T> {
    // 已加载直接返回
    if (this.module) return this.module;

    // 正在加载，等待完成
    if (this.loading) return this.loading;

    // 开始加载
    this.loading = this.load();
    this.module = await this.loading;
    this.loading = null;

    return this.module;
  }

  private async load(): Promise<T> {
    const start = performance.now();
    const mod = await this.factory();
    const duration = performance.now() - start;

    console.debug(\`[LazyLoad] \${this.name} loaded in \${duration.toFixed(2)}ms\`);
    return mod;
  }

  isLoaded(): boolean {
    return this.module !== null;
  }
}

// 延迟加载的模块定义
const lazyModules = {
  // MCP 客户端 - 仅在需要时加载
  mcpClient: new LazyModule(
    () => import('./mcp/mcpClient.js').then(m => m.MCPClient),
    'MCPClient'
  ),

  // 沙箱管理器 - 仅在沙箱模式加载
  sandboxManager: new LazyModule(
    () => import('./sandbox/sandboxManager.js').then(m => m.SandboxManager),
    'SandboxManager'
  ),

  // 语法高亮 - 仅在显示代码时加载
  highlighter: new LazyModule(
    () => import('shiki').then(m => m.getHighlighter({ theme: 'nord' })),
    'Shiki'
  ),

  // Markdown 渲染器 - 仅在渲染时加载
  markdown: new LazyModule(
    () => import('marked').then(m => m.marked),
    'Marked'
  ),

  // 代码编辑器 - 仅在编辑模式加载
  editor: new LazyModule(
    () => import('./editor/codeEditor.js').then(m => m.CodeEditor),
    'CodeEditor'
  )
};

// 预加载策略
async function preloadIfNeeded(config: CliConfig): Promise<void> {
  const preloadTasks: Promise<unknown>[] = [];

  // 根据配置预加载可能需要的模块
  if (config.sandbox) {
    preloadTasks.push(lazyModules.sandboxManager.get());
  }

  if (config.mcpServers?.length > 0) {
    preloadTasks.push(lazyModules.mcpClient.get());
  }

  // 并行预加载
  await Promise.all(preloadTasks);
}

/*
延迟加载效果：

未优化启动：
- 加载所有模块: 1500ms
- 初始化所有服务: 500ms
- 总启动时间: 2000ms

优化后启动：
- 加载核心模块: 400ms
- 初始化核心服务: 200ms
- 总启动时间: 600ms
- 模块按需加载: 用户无感知

加载时机：
┌─────────────────────────────────────────────────────────────────┐
│ 启动时加载（必需）                                               │
│ - 配置加载器                                                    │
│ - 认证服务                                                      │
│ - 核心 UI 组件                                                  │
├─────────────────────────────────────────────────────────────────┤
│ 首次使用时加载（延迟）                                           │
│ - MCP 客户端（首次工具调用时）                                   │
│ - 沙箱管理器（首次命令执行时）                                   │
│ - 语法高亮（首次显示代码时）                                     │
├─────────────────────────────────────────────────────────────────┤
│ 后台预加载（空闲时）                                             │
│ - 常用工具定义                                                  │
│ - 主题资源                                                      │
│ - 帮助文档                                                      │
└─────────────────────────────────────────────────────────────────┘
*/`}
            language="typescript"
            title="延迟加载策略"
          />
        </Layer>

        {/* MCP 连接优化 */}
        <Layer title="3. MCP 服务器连接优化" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// MCP 连接优化
// packages/cli/src/mcp/connectionOptimizer.ts

interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  priority: 'high' | 'medium' | 'low';
  lazy: boolean;  // 是否延迟连接
}

class OptimizedMCPManager {
  private connections = new Map<string, MCPConnection>();
  private pending = new Map<string, Promise<MCPConnection>>();

  // 并行连接高优先级服务器
  async connectAll(configs: MCPServerConfig[]): Promise<void> {
    // 分组
    const highPriority = configs.filter(c => c.priority === 'high' && !c.lazy);
    const mediumPriority = configs.filter(c => c.priority === 'medium' && !c.lazy);
    const lowPriority = configs.filter(c => c.priority === 'low' && !c.lazy);
    const lazyServers = configs.filter(c => c.lazy);

    // 阶段 1: 并行连接高优先级（阻塞）
    await Promise.all(
      highPriority.map(config => this.connect(config))
    );

    // 阶段 2: 后台连接中优先级（不阻塞）
    Promise.all(
      mediumPriority.map(config => this.connect(config))
    ).catch(err => console.warn('中优先级 MCP 连接失败:', err));

    // 阶段 3: 空闲时连接低优先级
    setTimeout(() => {
      Promise.all(
        lowPriority.map(config => this.connect(config))
      ).catch(err => console.warn('低优先级 MCP 连接失败:', err));
    }, 1000);

    // 延迟服务器将在首次使用时连接
    for (const config of lazyServers) {
      this.registerLazy(config);
    }
  }

  // 带超时的连接
  private async connect(
    config: MCPServerConfig,
    timeout = 5000
  ): Promise<MCPConnection> {
    // 检查是否已连接或正在连接
    if (this.connections.has(config.name)) {
      return this.connections.get(config.name)!;
    }

    if (this.pending.has(config.name)) {
      return this.pending.get(config.name)!;
    }

    const connectionPromise = this.createConnection(config, timeout);
    this.pending.set(config.name, connectionPromise);

    try {
      const connection = await connectionPromise;
      this.connections.set(config.name, connection);
      return connection;
    } finally {
      this.pending.delete(config.name);
    }
  }

  private async createConnection(
    config: MCPServerConfig,
    timeout: number
  ): Promise<MCPConnection> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const connection = new MCPConnection(config);
      await connection.initialize({ signal: controller.signal });
      clearTimeout(timeoutId);
      return connection;
    } catch (err) {
      clearTimeout(timeoutId);

      if ((err as Error).name === 'AbortError') {
        throw new Error(\`MCP 服务器 \${config.name} 连接超时 (\${timeout}ms)\`);
      }

      throw err;
    }
  }

  // 延迟连接注册
  private registerLazy(config: MCPServerConfig): void {
    // 使用 Proxy 实现透明的延迟连接
    const lazyProxy = new Proxy({} as MCPConnection, {
      get: (target, prop) => {
        // 首次访问时触发连接
        if (!this.connections.has(config.name)) {
          console.debug(\`[MCP] Lazy connecting to \${config.name}\`);
          this.connect(config);
        }

        const connection = this.connections.get(config.name);
        if (connection && prop in connection) {
          return (connection as any)[prop];
        }

        // 连接未完成时返回 pending Promise
        return async (...args: any[]) => {
          await this.connect(config);
          const conn = this.connections.get(config.name)!;
          return (conn as any)[prop](...args);
        };
      }
    });

    this.connections.set(config.name, lazyProxy as MCPConnection);
  }
}

/*
MCP 连接时序优化：

优化前（串行）：
Server A: |████████████████████| 500ms
Server B:                       |████████████████████| 500ms
Server C:                                             |████████████████████| 500ms
                                                                            总计: 1500ms

优化后（并行 + 分阶段）：
Server A (high):  |████████████████████| 500ms  ← 阻塞
Server B (med):   |████████████████████| 500ms  ← 后台
Server C (low):              延迟 1s → |████████████████████| 500ms
Server D (lazy):                        首次使用时连接
                  └─────────────────────┘
                  用户感知: 500ms (只等待高优先级)

优先级设置建议：
- high: 文件系统、Git (几乎每次都用)
- medium: 搜索、代码分析 (经常使用)
- low: 特定领域工具 (偶尔使用)
- lazy: 可选功能 (很少使用)
*/`}
            language="typescript"
            title="MCP 连接优化"
          />
        </Layer>

        {/* 缓存策略 */}
        <Layer title="4. 启动缓存策略" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// 启动缓存管理
// packages/cli/src/cache/startupCache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

class StartupCache {
  private cacheDir: string;
  private appVersion: string;

  constructor() {
    this.cacheDir = path.join(os.homedir(), '.gemini', 'cache');
    this.appVersion = packageJson.version;
  }

  // 缓存认证状态
  async getCachedAuth(): Promise<AuthResult | null> {
    const entry = await this.get<AuthResult>('auth');

    if (!entry) return null;

    // 检查是否过期（5分钟）
    if (Date.now() - entry.timestamp > 5 * 60 * 1000) {
      return null;
    }

    return entry.data;
  }

  async cacheAuth(auth: AuthResult): Promise<void> {
    await this.set('auth', auth, 5 * 60 * 1000);
  }

  // 缓存配置
  async getCachedConfig(): Promise<CliConfig | null> {
    const entry = await this.get<CliConfig>('config');

    if (!entry) return null;

    // 检查配置文件是否有更新
    const configMtime = await this.getConfigMtime();
    if (configMtime > entry.timestamp) {
      return null;  // 配置已更新，需要重新加载
    }

    return entry.data;
  }

  // 缓存 MCP 服务器能力
  async getCachedMCPCapabilities(
    serverName: string
  ): Promise<MCPCapabilities | null> {
    const entry = await this.get<MCPCapabilities>(\`mcp-\${serverName}\`);

    if (!entry) return null;

    // MCP 能力缓存 1 小时
    if (Date.now() - entry.timestamp > 60 * 60 * 1000) {
      return null;
    }

    return entry.data;
  }

  // 通用缓存方法
  private async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const filePath = path.join(this.cacheDir, \`\${key}.json\`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(content);

      // 版本不匹配则失效
      if (entry.version !== this.appVersion) {
        await fs.unlink(filePath).catch(() => {});
        return null;
      }

      return entry;
    } catch {
      return null;
    }
  }

  private async set<T>(
    key: string,
    data: T,
    ttl: number
  ): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.appVersion
    };

    const filePath = path.join(this.cacheDir, \`\${key}.json\`);
    await fs.writeFile(filePath, JSON.stringify(entry));
  }

  // 清理过期缓存
  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);

      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const entry = JSON.parse(content);

        const isExpired = Date.now() - entry.timestamp > entry.ttl;
        const isOldVersion = entry.version !== this.appVersion;

        if (isExpired || isOldVersion) {
          await fs.unlink(filePath);
        }
      }
    } catch {
      // 忽略清理错误
    }
  }
}

/*
缓存策略：

┌─────────────────────────────────────────────────────────────────┐
│ 缓存类型          │ TTL       │ 失效条件                        │
├─────────────────────────────────────────────────────────────────┤
│ 认证状态          │ 5 分钟    │ 时间过期                        │
│ 配置              │ 永久      │ 配置文件修改时间更新            │
│ MCP 能力          │ 1 小时    │ 时间过期                        │
│ 工具定义          │ 24 小时   │ 版本升级                        │
└─────────────────────────────────────────────────────────────────┘

缓存文件位置：~/.gemini/cache/
- auth.json
- config.json
- mcp-filesystem.json
- mcp-git.json
- tools.json

缓存效果：
- 首次启动: 1200ms
- 缓存命中: 400ms (减少 66%)
*/`}
            language="typescript"
            title="启动缓存策略"
          />
        </Layer>
      </Layer>

      {/* 与其他模块的交互关系 */}
      <Layer title="与其他模块的交互关系" depth={1} defaultOpen={true}>
        <p className="text-gray-300 mb-6">
          启动流程是整个系统的入口点，需要协调多个核心模块的初始化。
        </p>

        {/* 模块初始化顺序 */}
        <Layer title="模块初始化依赖图" depth={2} defaultOpen={true}>
          <MermaidDiagram chart={`
flowchart TD
    subgraph "启动阶段"
        E[Entry Point<br/>index.ts]
        M[Memory Check<br/>内存检测]
        C[Config Loader<br/>配置加载]
        A[Auth Service<br/>认证服务]
    end

    subgraph "核心初始化"
        TS[Telemetry<br/>遥测服务]
        FS[FileSystem<br/>文件服务]
        TH[Theme Manager<br/>主题管理]
        IDE[IDE Connection<br/>IDE 连接]
    end

    subgraph "服务初始化"
        MCP[MCP Manager<br/>MCP 管理器]
        SB[Sandbox<br/>沙箱管理]
        TOOL[Tool Registry<br/>工具注册]
    end

    subgraph "UI 初始化"
        INK[Ink Renderer<br/>UI 渲染器]
        APP[App Component<br/>应用组件]
        CHAT[Chat Interface<br/>聊天界面]
    end

    E --> M
    M --> C
    C --> A
    A --> TS
    A --> FS

    TS --> TH
    FS --> TH
    TH --> IDE

    IDE --> MCP
    C --> SB
    MCP --> TOOL
    SB --> TOOL

    TOOL --> INK
    TH --> INK
    INK --> APP
    APP --> CHAT

    style E fill:#22d3ee,color:#000
    style CHAT fill:#22c55e,color:#000
    style A fill:#f59e0b,color:#000
    style MCP fill:#a855f7,color:#fff
          `} />

          <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-cyan-400 font-semibold mb-2">初始化依赖说明</h5>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>
                <strong className="text-blue-400">配置 → 认证：</strong>
                认证方式由配置决定
              </li>
              <li>
                <strong className="text-green-400">认证 → 遥测：</strong>
                遥测需要知道用户身份
              </li>
              <li>
                <strong className="text-yellow-400">主题 → UI：</strong>
                UI 渲染依赖主题设置
              </li>
              <li>
                <strong className="text-purple-400">MCP → 工具：</strong>
                外部工具通过 MCP 注册
              </li>
            </ul>
          </div>
        </Layer>

        {/* 数据流 */}
        <Layer title="启动数据流" depth={2} defaultOpen={true}>
          <MermaidDiagram chart={`
sequenceDiagram
    participant User as 用户
    participant CLI as CLI Entry
    participant Mem as Memory
    participant Cfg as Config
    participant Auth as Auth
    participant MCP as MCP Manager
    participant UI as UI

    User->>CLI: gemini [prompt]
    CLI->>Mem: 检查内存需求

    alt 内存不足
        Mem->>CLI: 需要更多内存
        CLI->>CLI: 重启进程
    end

    CLI->>Cfg: 加载配置
    Cfg->>Cfg: 合并配置源
    Cfg-->>CLI: CliConfig

    CLI->>Auth: 验证认证
    Auth->>Auth: 尝试认证链

    alt 认证失败
        Auth-->>CLI: 认证错误
        CLI-->>User: 显示认证引导
    end

    Auth-->>CLI: AuthResult

    par 并行初始化
        CLI->>MCP: 连接服务器
        CLI->>UI: 准备渲染
    end

    MCP-->>CLI: 连接完成
    UI-->>CLI: 渲染就绪

    CLI->>UI: 启动交互界面
    UI-->>User: 显示欢迎信息

    alt 有初始 prompt
        CLI->>UI: 处理初始消息
    end
          `} />
        </Layer>

        {/* 错误处理链 */}
        <Layer title="启动错误处理链" depth={2} defaultOpen={true}>
          <CodeBlock
            code={`// 启动错误处理
// packages/cli/src/startup/errorHandler.ts

// 错误类型枚举
enum StartupErrorType {
  NODE_VERSION = 'NODE_VERSION',
  MEMORY = 'MEMORY',
  CONFIG = 'CONFIG',
  AUTH = 'AUTH',
  MCP = 'MCP',
  UI = 'UI',
  UNKNOWN = 'UNKNOWN'
}

// 错误处理策略
interface ErrorHandlerStrategy {
  canHandle(error: Error): boolean;
  handle(error: Error): Promise<RecoveryResult>;
}

const errorHandlers: ErrorHandlerStrategy[] = [
  // Node.js 版本错误
  {
    canHandle: (err) => err.message.includes('Node.js version'),
    handle: async (err) => ({
      recovered: false,
      action: 'exit',
      message: \`请升级 Node.js 到 >= 20.0.0
当前版本: \${process.version}
下载地址: https://nodejs.org/\`
    })
  },

  // 配置错误
  {
    canHandle: (err) => err instanceof ConfigError,
    handle: async (err) => {
      // 尝试使用默认配置
      console.warn('配置加载失败，使用默认配置:', err.message);
      return {
        recovered: true,
        action: 'continue',
        fallbackConfig: getDefaultConfig()
      };
    }
  },

  // 认证错误
  {
    canHandle: (err) => err instanceof AuthError,
    handle: async (err) => {
      // 引导用户配置认证
      console.error('认证失败:', err.message);
      return {
        recovered: false,
        action: 'prompt-auth',
        message: '请配置认证方式以继续使用'
      };
    }
  },

  // MCP 连接错误
  {
    canHandle: (err) => err instanceof MCPConnectionError,
    handle: async (err) => {
      // MCP 失败可以继续，功能降级
      console.warn('MCP 服务器连接失败:', err.message);
      console.warn('将以受限功能模式运行');
      return {
        recovered: true,
        action: 'continue-degraded',
        disabledFeatures: ['mcp-tools']
      };
    }
  },

  // UI 渲染错误
  {
    canHandle: (err) => err instanceof UIRenderError,
    handle: async (err) => {
      // 尝试回退到简单模式
      console.warn('交互界面启动失败，尝试简单模式');
      return {
        recovered: true,
        action: 'fallback-ui',
        uiMode: 'simple'
      };
    }
  }
];

// 错误处理主逻辑
async function handleStartupError(error: Error): Promise<void> {
  const handler = errorHandlers.find(h => h.canHandle(error));

  if (!handler) {
    // 未知错误
    console.error('启动时发生未知错误:', error);
    console.error('请尝试: gemini --debug 获取更多信息');
    process.exit(1);
  }

  const result = await handler.handle(error);

  switch (result.action) {
    case 'exit':
      console.error(result.message);
      process.exit(1);
      break;

    case 'continue':
      // 使用回退值继续
      break;

    case 'continue-degraded':
      // 记录降级状态
      globalState.degradedMode = true;
      globalState.disabledFeatures = result.disabledFeatures;
      break;

    case 'prompt-auth':
      // 启动认证引导
      await showAuthGuide();
      break;

    case 'fallback-ui':
      // 切换到简单 UI
      globalState.uiMode = result.uiMode;
      break;
  }
}

/*
错误处理流程：

                      ┌─────────────────┐
                      │   启动错误发生   │
                      └────────┬────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │ 匹配错误处理器   │
                      └────────┬────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │ 可恢复错误    │   │ 可降级错误    │   │ 致命错误      │
    │              │   │              │   │              │
    │ - 配置错误   │   │ - MCP 失败   │   │ - 版本不兼容  │
    │ - 主题加载   │   │ - IDE 连接   │   │ - 认证失败    │
    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
           │                   │                   │
           ▼                   ▼                   ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │ 使用默认值    │   │ 功能降级继续  │   │ 显示错误并退出│
    │ 继续启动     │   │              │   │              │
    └──────────────┘   └──────────────┘   └──────────────┘
*/`}
            language="typescript"
            title="错误处理链"
          />
        </Layer>

        {/* 状态机 */}
        <Layer title="启动状态机" depth={2} defaultOpen={true}>
          <MermaidDiagram chart={`
stateDiagram-v2
    [*] --> Initializing: 启动

    Initializing --> MemoryCheck: 开始
    MemoryCheck --> NeedRestart: 内存不足
    MemoryCheck --> ConfigLoading: 内存充足
    NeedRestart --> [*]: 重启进程

    ConfigLoading --> ConfigError: 加载失败
    ConfigLoading --> Authenticating: 加载成功
    ConfigError --> Authenticating: 使用默认配置

    Authenticating --> AuthFailed: 认证失败
    Authenticating --> ServicesInit: 认证成功
    AuthFailed --> AuthGuide: 显示引导
    AuthGuide --> Authenticating: 重试

    ServicesInit --> ServiceError: 部分失败
    ServicesInit --> UIStarting: 全部成功
    ServiceError --> UIStarting: 降级继续

    UIStarting --> UIError: 渲染失败
    UIStarting --> Ready: 渲染成功
    UIError --> SimpleModeUI: 回退简单模式
    SimpleModeUI --> Ready: 启动完成

    Ready --> Running: 用户交互
    Running --> Shutdown: 退出信号
    Shutdown --> Cleanup: 开始清理
    Cleanup --> [*]: 清理完成
          `} />

          <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
            <h5 className="text-cyan-400 font-semibold mb-2">状态转换说明</h5>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h6 className="text-green-400 font-semibold mb-1">正常路径</h6>
                <p>Initializing → MemoryCheck → ConfigLoading → Authenticating → ServicesInit → UIStarting → Ready</p>
              </div>
              <div>
                <h6 className="text-yellow-400 font-semibold mb-1">降级路径</h6>
                <p>任何阶段失败都尝试恢复或降级，最大程度保证可用性</p>
              </div>
            </div>
          </div>
        </Layer>
      </Layer>

      {/* ==================== 深化内容结束 ==================== */}

      {/* 为什么这样设计启动流程 */}
      <Layer title="为什么这样设计启动流程" icon="🤔" defaultOpen={false}>
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">📊 为什么使用分阶段启动？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：将启动过程划分为多个明确的阶段（内存检测 → 配置加载 → 认证 → 服务初始化 → UI 启动）。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>故障隔离</strong>：每个阶段独立，可以精确定位启动失败的原因</li>
                <li><strong>渐进式加载</strong>：按需加载模块，减少启动时间和内存占用</li>
                <li><strong>优雅降级</strong>：某阶段失败可以选择跳过或回退，而非整体崩溃</li>
              </ul>
              <p><strong>权衡</strong>：增加了代码复杂度，但换来了更好的可维护性和用户体验。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">⚙️ 为什么配置优先级是 CLI &gt; 环境变量 &gt; 文件？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：配置合并遵循 CLI 参数 &gt; 环境变量 &gt; 项目配置 &gt; 全局配置 &gt; 默认值 的优先级。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>即时性</strong>：CLI 参数是用户当前会话的明确意图，应该最优先</li>
                <li><strong>灵活性</strong>：环境变量便于 CI/CD 集成和临时覆盖</li>
                <li><strong>持久性</strong>：配置文件提供持久化的默认设置</li>
                <li><strong>层级隔离</strong>：项目配置不污染全局设置，全局设置提供统一默认</li>
              </ul>
              <p><strong>行业标准</strong>：这与 Git、Docker 等工具的配置优先级设计一致。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">🛡️ 为什么沙箱检测在主逻辑前？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：沙箱环境检测和初始化在认证和服务加载之前完成。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>安全边界</strong>：确保后续所有操作都在正确的安全上下文中执行</li>
                <li><strong>失败快速</strong>：沙箱不可用时尽早告知用户，避免浪费时间加载其他服务</li>
                <li><strong>资源隔离</strong>：某些服务（如 MCP）可能需要在沙箱内运行</li>
              </ul>
              <p><strong>风险</strong>：如果沙箱检测本身不安全，可能导致逃逸。通过最小权限检测逻辑缓解。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">⚡ 为什么使用异步初始化？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：几乎所有初始化操作都是异步的，支持并行执行。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>性能</strong>：认证验证、MCP 连接等 I/O 操作可以并行，显著减少启动时间</li>
                <li><strong>响应性</strong>：UI 可以在其他服务初始化时就开始渲染</li>
                <li><strong>超时控制</strong>：每个异步操作可以设置独立超时，避免整体卡死</li>
              </ul>
              <p><strong>复杂度</strong>：需要正确处理竞态条件和错误传播，使用 Promise.allSettled 等模式。</p>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--red)]">
            <h4 className="text-[var(--red)] font-bold mb-2">🔀 为什么分离 Interactive 和 Non-Interactive 入口？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：交互模式和非交互模式（--print 或管道输入）使用不同的代码路径。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>资源优化</strong>：非交互模式无需加载 React、Ink 等 UI 框架，启动更快</li>
                <li><strong>输出格式</strong>：管道模式输出纯文本，交互模式支持丰富的终端格式</li>
                <li><strong>错误处理</strong>：交互模式可以询问用户，非交互模式必须立即失败或使用默认值</li>
              </ul>
              <p><strong>设计原则</strong>：遵循 Unix 哲学 - 工具应该同时支持交互和脚本使用。</p>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
