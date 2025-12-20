import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

export function StartupChain() {
  const startupFlowDiagram = `flowchart TD
    start([执行 innies 命令])
    main_entry[main 入口<br/>index.ts:14]
    load_settings[loadSettings<br/>settings.ts:583]
    parse_args[parseArguments<br/>config.ts:130]
    sandbox_check{是否需要<br/>启动沙箱?}
    sandbox_launch[启动沙箱<br/>gemini.tsx:251]
    sandbox_exit([父进程退出])
    load_config[loadCliConfig<br/>config.ts:522]
    init_app[initializeApp<br/>initializer.ts:32]
    mode_check{运行模式?}
    interactive[Interactive Mode<br/>React/Ink UI]
    non_interactive[Non-Interactive<br/>单次执行]
    zed[Zed Integration<br/>ACP Protocol]

    start --> main_entry
    main_entry --> load_settings
    load_settings --> parse_args
    parse_args --> sandbox_check
    sandbox_check -->|Yes + 未在沙箱内| sandbox_launch
    sandbox_launch --> sandbox_exit
    sandbox_check -->|No 或已在沙箱内| load_config
    load_config --> init_app
    init_app --> mode_check
    mode_check -->|TTY + 无 query| interactive
    mode_check -->|--prompt 或 stdin| non_interactive
    mode_check -->|--experimental-acp| zed

    style start fill:#22d3ee,color:#000
    style interactive fill:#22c55e,color:#000
    style non_interactive fill:#3b82f6,color:#fff
    style zed fill:#a855f7,color:#fff
    style sandbox_exit fill:#ef4444,color:#fff
    style sandbox_check fill:#f59e0b,color:#000
    style mode_check fill:#f59e0b,color:#000`;

  const sandboxDetectionDiagram = `flowchart TD
    start([沙箱检测开始])
    check_env{SANDBOX env<br/>已设置?}
    already_in[跳过沙箱启动<br/>已在沙箱内]
    check_gemini_env{GEMINI_SANDBOX<br/>env 设置?}
    check_cli_flag{--sandbox<br/>CLI 参数?}
    check_macos{macOS +<br/>sandbox-exec?}
    check_docker{docker 可用?}
    check_podman{podman 可用?}
    check_settings{settings.tools.<br/>sandbox 配置?}
    no_sandbox[无沙箱模式]
    use_seatbelt[使用 Seatbelt]
    use_docker[使用 Docker]
    use_podman[使用 Podman]

    start --> check_env
    check_env -->|Yes| already_in
    check_env -->|No| check_gemini_env
    check_gemini_env -->|设置| use_docker
    check_gemini_env -->|未设置| check_cli_flag
    check_cli_flag -->|设置| use_docker
    check_cli_flag -->|未设置| check_macos
    check_macos -->|Yes| use_seatbelt
    check_macos -->|No| check_docker
    check_docker -->|Yes| use_docker
    check_docker -->|No| check_podman
    check_podman -->|Yes| use_podman
    check_podman -->|No| check_settings
    check_settings -->|配置| use_docker
    check_settings -->|无配置| no_sandbox

    style start fill:#22d3ee,color:#000
    style already_in fill:#22c55e,color:#000
    style no_sandbox fill:#6b7280,color:#fff
    style use_seatbelt fill:#3b82f6,color:#fff
    style use_docker fill:#10b981,color:#000
    style use_podman fill:#8b5cf6,color:#fff`;

  const configMergeSequence = `sequenceDiagram
    participant Main as main()
    participant LS as loadSettings
    participant LA as parseArguments
    participant LC as loadCliConfig
    participant App as initializeApp

    Main->>LS: 加载配置文件
    Note right of LS: 1. systemDefaults.json<br/>2. ~/.innies/settings.json<br/>3. .innies/settings.json<br/>4. /etc/qwen-code/settings.json
    LS-->>Main: LoadedSettings

    Main->>LA: 解析命令行参数
    LA-->>Main: CLI 参数对象

    Main->>LC: 合并配置 + 加载扩展
    activate LC
    LC->>LC: loadExtensions()
    LC->>LC: loadHierarchicalGeminiMemory()
    LC->>LC: mergeMcpServers()
    LC->>LC: 确定 ApprovalMode
    LC->>LC: 构建 Config 对象
    deactivate LC
    LC-->>Main: Config

    Main->>App: 初始化应用
    activate App
    App->>App: performInitialAuth()
    App->>App: validateTheme()
    App->>App: IdeClient.connect()
    deactivate App
    App-->>Main: InitializationResult`;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-cyan-400">CLI 启动链路</h2>
        <p className="text-gray-400 mt-2">
          从执行 innies 命令到进入交互会话的完整流程分析
        </p>
      </div>

      {/* 目标 */}
      <Layer title="目标" icon="🎯">
        <div className="text-gray-300 space-y-3">
          <p>
            CLI 启动链路负责完成从用户执行 <code>innies</code> 命令到应用完全初始化的整个过程。
            主要目标包括：
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>加载和合并多层级配置（系统默认、用户、项目、系统覆盖）</li>
            <li>检测和启动沙箱环境（macOS Seatbelt、Docker、Podman）</li>
            <li>初始化认证系统（Qwen OAuth、OpenAI API、Google Login）</li>
            <li>加载扩展和 MCP 服务器配置</li>
            <li>根据运行环境选择正确的模式（交互式、非交互式、Zed 集成）</li>
          </ul>
        </div>
      </Layer>

      {/* 输入 */}
      <Layer title="输入" icon="📥">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="触发条件" icon="🚀" variant="blue">
            <ul className="text-sm space-y-1">
              <li>• 用户在终端执行 <code>innies</code> 命令</li>
              <li>• 可选的 CLI 参数（--model, --prompt, --sandbox 等）</li>
              <li>• 可选的 stdin 输入（管道或重定向）</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="环境依赖" icon="🌍" variant="green">
            <ul className="text-sm space-y-1">
              <li>• Node.js &gt;= 20 运行时</li>
              <li>• 配置文件（可选）：~/.innies/settings.json</li>
              <li>• 环境变量（可选）：OPENAI_API_KEY, GEMINI_SANDBOX 等</li>
              <li>• Git 可用（如启用 checkpointing）</li>
            </ul>
          </HighlightBox>
        </div>

        <HighlightBox title="CLI 参数优先级" icon="⚖️" variant="purple">
          <div className="text-sm space-y-2">
            <p className="font-semibold">命令行参数 &gt; 环境变量 &gt; 项目配置 &gt; 用户配置 &gt; 系统默认</p>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-cyan-400 font-mono mb-1">常用参数：</p>
                <ul className="space-y-1">
                  <li><code>-m, --model</code> 指定模型</li>
                  <li><code>-p, --prompt</code> 非交互模式</li>
                  <li><code>-s, --sandbox</code> 沙箱模式</li>
                  <li><code>-y, --yolo</code> 自动批准</li>
                </ul>
              </div>
              <div>
                <p className="text-cyan-400 font-mono mb-1">高级参数：</p>
                <ul className="space-y-1">
                  <li><code>--approval-mode</code> 审批模式</li>
                  <li><code>-c, --checkpointing</code> 检查点</li>
                  <li><code>--experimental-acp</code> Zed 集成</li>
                </ul>
              </div>
            </div>
          </div>
        </HighlightBox>
      </Layer>

      {/* 输出 */}
      <Layer title="输出" icon="📤">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">Interactive Mode</h4>
            <p className="text-sm text-gray-300 mb-2">React/Ink 渲染的终端 UI</p>
            <ul className="text-xs space-y-1 text-gray-400">
              <li>• 完整的对话界面</li>
              <li>• 实时工具执行反馈</li>
              <li>• 键盘交互支持</li>
              <li>• Kitty Protocol 支持</li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-bold mb-2">Non-Interactive Mode</h4>
            <p className="text-sm text-gray-300 mb-2">单次查询执行后退出</p>
            <ul className="text-xs space-y-1 text-gray-400">
              <li>• 执行单个 prompt</li>
              <li>• 输出结果到 stdout</li>
              <li>• 适合脚本集成</li>
              <li>• 自动退出</li>
            </ul>
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">Zed Integration</h4>
            <p className="text-sm text-gray-300 mb-2">ACP 协议通信</p>
            <ul className="text-xs space-y-1 text-gray-400">
              <li>• IDE 深度集成</li>
              <li>• 特殊通信协议</li>
              <li>• 实时编辑器交互</li>
            </ul>
          </div>
        </div>

        <HighlightBox title="状态变化" icon="🔄" variant="yellow">
          <div className="text-sm space-y-2">
            <p>启动完成后的系统状态：</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Config 对象完全初始化（包含所有配置、扩展、MCP 服务器）</li>
              <li>GeminiClient 已创建并通过认证</li>
              <li>如启用 IDE 模式，已连接到 IDE Server</li>
              <li>如启用沙箱，父进程已退出，子进程在沙箱内运行</li>
              <li>React Provider 树已建立（Settings, Keypress, SessionStats, VimMode）</li>
            </ul>
          </div>
        </HighlightBox>
      </Layer>

      {/* 关键文件与入口 */}
      <Layer title="关键文件与入口" icon="📁">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-3">核心启动文件</h4>
            <div className="text-xs font-mono space-y-2 text-gray-300">
              <div>
                <code className="text-green-400">packages/cli/index.ts:14</code>
                <p className="text-gray-500 ml-4">main() 全局入口 + 错误处理</p>
              </div>
              <div>
                <code className="text-green-400">packages/cli/src/gemini.tsx:131</code>
                <p className="text-gray-500 ml-4">主启动逻辑 + 模式分流</p>
              </div>
              <div>
                <code className="text-green-400">packages/cli/src/config/settings.ts:583</code>
                <p className="text-gray-500 ml-4">loadSettings() 配置加载</p>
              </div>
              <div>
                <code className="text-green-400">packages/cli/src/config/config.ts:130</code>
                <p className="text-gray-500 ml-4">parseArguments() 参数解析</p>
              </div>
              <div>
                <code className="text-green-400">packages/cli/src/config/config.ts:522</code>
                <p className="text-gray-500 ml-4">loadCliConfig() 完整初始化</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-3">专项模块</h4>
            <div className="text-xs font-mono space-y-2 text-gray-300">
              <div>
                <code className="text-blue-400">packages/cli/src/core/initializer.ts:32</code>
                <p className="text-gray-500 ml-4">initializeApp() 应用初始化</p>
              </div>
              <div>
                <code className="text-blue-400">packages/cli/src/config/sandboxConfig.ts</code>
                <p className="text-gray-500 ml-4">沙箱配置检测</p>
              </div>
              <div>
                <code className="text-blue-400">packages/cli/src/nonInteractiveCli.ts</code>
                <p className="text-gray-500 ml-4">非交互模式实现</p>
              </div>
              <div>
                <code className="text-blue-400">packages/cli/src/ui/components/AppContainer.tsx</code>
                <p className="text-gray-500 ml-4">React UI 根组件</p>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 流程图 */}
      <Layer title="流程图" icon="📊">
        <MermaidDiagram chart={startupFlowDiagram} title="CLI 启动主流程" />

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-cyan-400 mb-3">配置合并序列</h4>
          <MermaidDiagram chart={configMergeSequence} title="配置加载与合并时序" />
        </div>

        <CodeBlock
          title="settings.ts:411-418 - 配置合并策略"
          language="typescript"
          code={`// 配置文件优先级（从低到高）
return customDeepMerge(
  getMergeStrategyForPath,
  {},
  systemDefaults,      // 1. 基础默认值
  user,                // 2. 用户设置覆盖 (~/.innies/settings.json)
  safeWorkspace,       // 3. 工作区覆盖 (.innies/settings.json, 需信任)
  system,              // 4. 系统覆盖 (/etc/qwen-code/settings.json, 最高优先)
) as Settings;`}
        />
      </Layer>

      {/* 关键分支与边界条件 */}
      <Layer title="关键分支与边界条件" icon="⚡">
        <div className="space-y-4">
          <HighlightBox title="Stage 3: 沙箱检测分支" icon="🔀" variant="blue">
            <p className="text-sm text-gray-300 mb-3">
              沙箱检测是启动链路的关键分支点，决定是否需要重新启动进程：
            </p>
            <MermaidDiagram chart={sandboxDetectionDiagram} title="沙箱检测决策树" />
          </HighlightBox>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="macOS Seatbelt" icon="🍎" variant="green">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">
                  使用 <code>sandbox-exec</code> + profile 文件
                </p>
                <p className="text-xs text-gray-500">
                  Profiles: permissive-open, restrictive-closed
                </p>
                <p className="text-xs text-gray-500">
                  检测: macOS + sandbox-exec 命令可用
                </p>
              </div>
            </HighlightBox>

            <HighlightBox title="Docker/Podman" icon="🐳" variant="purple">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">容器化隔离</p>
                <p className="text-xs text-gray-500">
                  镜像: ghcr.io/zhimanai/innies-cli:VERSION
                </p>
                <p className="text-xs text-gray-500">
                  检测: docker/podman 命令可用
                </p>
              </div>
            </HighlightBox>

            <HighlightBox title="沙箱重启机制" icon="🔄" variant="yellow">
              <div className="text-sm space-y-2">
                <p className="text-gray-300">
                  检测到需要沙箱后，当前进程启动沙箱子进程并自身退出
                </p>
                <p className="text-xs text-gray-500">
                  环境变量 SANDBOX=true 标记已在沙箱内，避免无限递归
                </p>
              </div>
            </HighlightBox>
          </div>

          <CodeBlock
            title="gemini.tsx:251-314 - 沙箱启动流程"
            language="typescript"
            code={`// 沙箱启动完整流程
if (sandboxConfig) {
  // 1. 加载部分配置 (用于 auth 验证)
  const partialConfig = await loadCliConfig(settings.merged, [], ...);

  // 2. 验证认证 (沙箱会干扰 OAuth 重定向)
  if (settings.merged.security?.auth?.selectedType) {
    await partialConfig.refreshAuth(authType);
  }

  // 3. 读取 stdin (如果有)
  const stdinData = await readStdin();
  const sandboxArgs = injectStdinIntoArgs(process.argv, stdinData);

  // 4. 启动沙箱并等待
  await start_sandbox(sandboxConfig, memoryArgs, partialConfig, sandboxArgs);

  // 5. 父进程退出，子进程继续运行
  process.exit(0);
}`}
          />

          <HighlightBox title="Stage 4: 审批模式决策" icon="🔐" variant="red">
            <div className="text-sm space-y-3">
              <p className="font-semibold text-gray-200">审批模式优先级（从高到低）：</p>
              <ol className="space-y-2 ml-4">
                <li>1. <code className="text-cyan-400">--approval-mode</code> CLI 参数</li>
                <li>2. <code className="text-cyan-400">--yolo</code> 参数 → ApprovalMode.YOLO</li>
                <li>3. <code className="text-cyan-400">settings.tools.approvalMode</code> 配置</li>
                <li>4. <code className="text-cyan-400">ApprovalMode.DEFAULT</code> 默认值</li>
              </ol>
              <p className="text-xs text-gray-500 mt-2">
                非信任文件夹强制使用 DEFAULT 或 PLAN 模式，忽略 YOLO/AUTO_EDIT
              </p>
            </div>
          </HighlightBox>

          <HighlightBox title="Stage 7: 模式检测边界" icon="🚦" variant="green">
            <div className="text-sm space-y-2">
              <p className="font-semibold text-gray-200">运行模式检测逻辑：</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <code>--experimental-acp</code> 存在 → <strong>Zed Integration</strong>
                </li>
                <li>
                  <code>--prompt</code> 或 stdin 有输入 → <strong>Non-Interactive</strong>
                </li>
                <li>
                  <code>isTTY && !query</code> → <strong>Interactive</strong>
                </li>
              </ul>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* 失败与恢复 */}
      <Layer title="失败与恢复" icon="🔧">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <HighlightBox title="致命错误 (FatalError)" icon="🔴" variant="red">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">导致进程立即退出的错误：</p>
              <ul className="list-disc list-inside text-gray-400 text-xs space-y-1 ml-2">
                <li>配置文件语法错误（JSON 解析失败）</li>
                <li>无效的沙箱命令或缺少沙箱工具</li>
                <li>Telemetry 配置错误</li>
                <li>Git 不可用但 checkpointing 已启用</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                FatalError 带有自定义 exitCode，在 main() 中捕获并输出红色错误信息
              </p>
            </div>
          </HighlightBox>

          <HighlightBox title="可恢复错误" icon="🟡" variant="yellow">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">UI 中处理的错误：</p>
              <ul className="list-disc list-inside text-gray-400 text-xs space-y-1 ml-2">
                <li>认证失败 → 打开认证对话框</li>
                <li>主题不存在 → 警告并使用默认主题</li>
                <li>配置文件不存在 → 使用空设置</li>
                <li>扩展加载失败 → 跳过该扩展并记录警告</li>
                <li>MCP 服务器连接失败 → 降级到无 MCP 模式</li>
              </ul>
            </div>
          </HighlightBox>
        </div>

        <CodeBlock
          title="index.ts:14-30 - 顶级错误处理"
          language="typescript"
          code={`// 全局错误捕获
main().catch((error) => {
  if (error instanceof FatalError) {
    let errorMessage = error.message;
    if (!process.env['NO_COLOR']) {
      errorMessage = \`\\x1b[31m\${errorMessage}\\x1b[0m\`;  // 红色输出
    }
    console.error(errorMessage);
    process.exit(error.exitCode);
  }

  // 非预期的致命错误
  console.error('An unexpected critical error occurred:');
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});`}
        />

        <HighlightBox title="降级策略" icon="🛡️" variant="blue">
          <div className="text-sm space-y-2">
            <p className="font-semibold text-gray-200">启动过程中的降级机制：</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-300">
              <li>沙箱不可用 → 降级到无沙箱模式（记录警告）</li>
              <li>IDE Server 连接失败 → 降级到非 IDE 模式</li>
              <li>扩展加载失败 → 跳过该扩展，不影响其他扩展</li>
              <li>MCP 服务器启动失败 → 从可用服务器列表中移除</li>
              <li>主题加载失败 → 使用内置默认主题</li>
            </ul>
          </div>
        </HighlightBox>
      </Layer>

      {/* 相关配置项 */}
      <Layer title="相关配置项" icon="⚙️">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-cyan-400">环境变量</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-3 text-left text-gray-400">变量</th>
                  <th className="border border-gray-700 p-3 text-left text-gray-400">用途</th>
                  <th className="border border-gray-700 p-3 text-left text-gray-400">默认值</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr>
                  <td className="border border-gray-700 p-3 font-mono text-cyan-400">DEBUG</td>
                  <td className="border border-gray-700 p-3">启用调试模式，输出详细日志</td>
                  <td className="border border-gray-700 p-3 text-gray-500">false</td>
                </tr>
                <tr className="bg-gray-800/30">
                  <td className="border border-gray-700 p-3 font-mono text-cyan-400">SANDBOX</td>
                  <td className="border border-gray-700 p-3">内部标志，表示已在沙箱内运行</td>
                  <td className="border border-gray-700 p-3 text-gray-500">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 p-3 font-mono text-cyan-400">GEMINI_SANDBOX</td>
                  <td className="border border-gray-700 p-3">指定沙箱命令 (docker/podman/sandbox-exec)</td>
                  <td className="border border-gray-700 p-3 text-gray-500">auto-detect</td>
                </tr>
                <tr className="bg-gray-800/30">
                  <td className="border border-gray-700 p-3 font-mono text-cyan-400">OPENAI_API_KEY</td>
                  <td className="border border-gray-700 p-3">OpenAI 兼容 API 密钥</td>
                  <td className="border border-gray-700 p-3 text-gray-500">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 p-3 font-mono text-cyan-400">OPENAI_BASE_URL</td>
                  <td className="border border-gray-700 p-3">OpenAI 兼容 API 基础 URL</td>
                  <td className="border border-gray-700 p-3 text-gray-500">-</td>
                </tr>
                <tr className="bg-gray-800/30">
                  <td className="border border-gray-700 p-3 font-mono text-cyan-400">QWEN_MODEL</td>
                  <td className="border border-gray-700 p-3">Qwen 模型名称</td>
                  <td className="border border-gray-700 p-3 text-gray-500">-</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 p-3 font-mono text-cyan-400">NO_BROWSER</td>
                  <td className="border border-gray-700 p-3">禁用浏览器启动（OAuth 流程）</td>
                  <td className="border border-gray-700 p-3 text-gray-500">-</td>
                </tr>
                <tr className="bg-gray-800/30">
                  <td className="border border-gray-700 p-3 font-mono text-cyan-400">NO_COLOR</td>
                  <td className="border border-gray-700 p-3">禁用彩色输出</td>
                  <td className="border border-gray-700 p-3 text-gray-500">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="text-lg font-semibold text-cyan-400 mt-6">配置文件路径</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h5 className="font-semibold text-green-400 mb-2">系统级配置</h5>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>
                  <code className="text-yellow-300">/etc/qwen-code/settings.json</code>
                  <span className="text-gray-500 ml-2">(最高优先级)</span>
                </li>
                <li>
                  <code className="text-yellow-300">systemDefaults.json</code>
                  <span className="text-gray-500 ml-2">(内置默认)</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h5 className="font-semibold text-blue-400 mb-2">用户/项目级配置</h5>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>
                  <code className="text-cyan-300">~/.innies/settings.json</code>
                  <span className="text-gray-500 ml-2">(用户)</span>
                </li>
                <li>
                  <code className="text-green-300">.innies/settings.json</code>
                  <span className="text-gray-500 ml-2">(项目, 需信任)</span>
                </li>
              </ul>
            </div>
          </div>

          <h4 className="text-lg font-semibold text-cyan-400 mt-6">关键配置项示例</h4>
          <CodeBlock
            title="settings.json 配置示例"
            language="json"
            code={`{
  "general": {
    "checkpointing": {
      "enabled": false              // 启用检查点功能
    }
  },
  "security": {
    "auth": {
      "selectedType": "qwen-oauth"  // 认证类型: qwen-oauth | openai-api
    }
  },
  "tools": {
    "approvalMode": "DEFAULT",      // DEFAULT | YOLO | AUTO_EDIT | PLAN
    "sandbox": "docker",            // 沙箱类型
    "allowed": [                    // 工具白名单
      "read_file",
      "run_shell_command(git)"
    ]
  },
  "ide": {
    "enabled": false,               // IDE 集成模式
    "ideServerUri": "http://localhost:3000"
  },
  "mcpServers": {                   // MCP 服务器配置
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@sequentialread/mcp-server"],
      "disabled": false
    }
  }
}`}
          />
        </div>
      </Layer>

      {/* React UI 组件层次 */}
      <Layer title="Interactive Mode: React UI 架构" icon="⚛️">
        <p className="text-gray-300 mb-4">
          当进入 Interactive Mode 时，CLI 会启动 React/Ink 渲染的终端 UI。
          以下是完整的 Provider 层次和组件树：
        </p>

        <CodeBlock
          title="gemini.tsx:131-197 - React UI 组件层次"
          language="tsx"
          code={`// React Provider 嵌套结构
const AppWrapper = () => (
  <SettingsContext.Provider value={settings}>
    <KeypressProvider kittyProtocolEnabled={kittyProtocolEnabled}>
      <SessionStatsProvider>
        <VimModeProvider settings={settings}>
          <AppContainer
            config={config}
            settings={settings}
            startupWarnings={startupWarnings}
            version={version}
            initializationResult={initializationResult}
          />
        </VimModeProvider>
      </SessionStatsProvider>
    </KeypressProvider>
  </SettingsContext.Provider>
);

// 渲染到终端
render(<AppWrapper />, {
  exitOnCtrlC: false,
  isScreenReaderEnabled: ...
});`}
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h5 className="text-cyan-400 font-semibold mb-2">Context Providers</h5>
            <ul className="text-sm space-y-1 text-gray-300">
              <li><code className="text-green-400">SettingsContext</code> - 全局设置共享</li>
              <li><code className="text-green-400">KeypressProvider</code> - 键盘输入处理</li>
              <li><code className="text-green-400">SessionStatsProvider</code> - 会话统计</li>
              <li><code className="text-green-400">VimModeProvider</code> - Vim 模式支持</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h5 className="text-cyan-400 font-semibold mb-2">Kitty Protocol</h5>
            <p className="text-sm text-gray-300">
              启动时检测终端是否支持 Kitty Protocol，如支持则启用增强的键盘输入处理
              （支持修饰键组合、特殊键等）。
            </p>
          </div>
        </div>
      </Layer>
    </div>
  );
}
