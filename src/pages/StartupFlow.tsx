import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

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

// 加载用户设置 (~/.qwen/settings.json)
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
    // 1. Qwen OAuth (默认，免费 2000 请求/天)
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
            <code className="text-sm text-gray-400">~/.qwen/</code>
            <ul className="mt-2 text-sm space-y-1">
              <li>├── settings.json (用户设置)</li>
              <li>├── auth.json (认证信息)</li>
              <li>├── themes/ (主题文件)</li>
              <li>└── mcp/ (MCP 配置)</li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-cyan-400 font-bold mb-2">项目配置</h4>
            <code className="text-sm text-gray-400">.qwen/</code>
            <ul className="mt-2 text-sm space-y-1">
              <li>├── settings.json (项目设置)</li>
              <li>├── QWEN.md (项目说明)</li>
              <li>├── chats/ (聊天记录)</li>
              <li>└── sandbox.Dockerfile (沙箱配置)</li>
            </ul>
          </div>
        </div>
      </Layer>

      {/* 命令行参数 */}
      <Layer title="命令行参数" icon="💻">
        <CodeBlock
          code={`qwen [options] [prompt]

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
  qwen "帮我写一个 React 组件"
  qwen -m qwen-coder-plus --resume
  qwen --print "列出当前目录文件"`}
        />
      </Layer>
    </div>
  );
}
