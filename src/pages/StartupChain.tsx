import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';

export function StartupChain() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-cyan-400">CLI 启动链路</h2>
        <p className="text-gray-400 mt-2">
          从执行 <code>innies</code> 命令到进入交互会话的完整流程
        </p>
      </div>

      {/* 启动时序图 */}
      <Layer title="启动时序总览" icon="🚀">
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-gray-300 whitespace-pre">{`
┌─────────────────────────────────────────────────────────────────────────┐
│                         INNIES CLI 启动流程                              │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │ index.ts     │  packages/cli/index.ts
  │  main()      │  全局入口 + 错误处理
  └──────┬───────┘
         │
         ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  Stage 1: Settings & Arguments Loading                           │
  │  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
  │  │ loadSettings() │→ │migrateDeprecated │→ │parseArguments() │   │
  │  │ settings.ts:583│  │     Settings()   │  │ config.ts:130   │   │
  │  └────────────────┘  └──────────────────┘  └─────────────────┘   │
  └──────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  Stage 2: Early Configuration                                    │
  │  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
  │  │ ConsolePatcher │→ │ DNS Resolution   │→ │ Theme Loading   │   │
  │  │ (debug mode)   │  │ Order Setup      │  │ (custom themes) │   │
  │  └────────────────┘  └──────────────────┘  └─────────────────┘   │
  └──────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  Stage 3: Sandbox Detection & Initialization                     │
  │  ┌────────────────────────────────────────────────────────┐      │
  │  │ process.env['SANDBOX'] set?                            │      │
  │  │   YES → Skip (already in sandbox)                      │      │
  │  │   NO  → Check GEMINI_SANDBOX / --sandbox / settings    │      │
  │  │         → Auto-detect: macOS seatbelt / docker / podman│      │
  │  │         → Launch sandbox & exit parent                 │      │
  │  └────────────────────────────────────────────────────────┘      │
  └──────────────────────────────────────────────────────────────────┘
         │ (if no sandbox or already in sandbox)
         ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  Stage 4: Full Initialization                                    │
  │  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
  │  │ loadExtensions │→ │ loadCliConfig()  │→ │ Merge MCP       │   │
  │  │ extension.ts   │  │ config.ts:522    │  │ Servers         │   │
  │  └────────────────┘  └──────────────────┘  └─────────────────┘   │
  └──────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  Stage 5: Input Mode Detection                                   │
  │  ┌────────────────────────────────────────────────────────┐      │
  │  │ TTY? → setRawMode(true) → Kitty Protocol Detection     │      │
  │  └────────────────────────────────────────────────────────┘      │
  └──────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  Stage 6: App Initialization                                     │
  │  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
  │  │performInitial  │→ │ validateTheme()  │→ │ IDE Client      │   │
  │  │    Auth()      │  │                  │  │ Connection      │   │
  │  └────────────────┘  └──────────────────┘  └─────────────────┘   │
  └──────────────────────────────────────────────────────────────────┘
         │
         ▼
  ┌─────────────────┬────────────────────┬──────────────────────────┐
  │ INTERACTIVE     │ NON-INTERACTIVE    │ ZED INTEGRATION          │
  │ (TTY + no query)│ (--prompt/-p)      │ (--experimental-acp)     │
  ├─────────────────┼────────────────────┼──────────────────────────┤
  │ React/Ink UI    │ runNonInteractive()│ runZedIntegration()      │
  │ render()        │ Single query flow  │ ACP Protocol             │
  └─────────────────┴────────────────────┴──────────────────────────┘
`}</pre>
        </div>
      </Layer>

      {/* Stage 1: 配置加载 */}
      <Layer title="Stage 1: Settings & Arguments Loading" icon="1️⃣">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <HighlightBox title="配置文件优先级" icon="📊" variant="blue">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">1.</span>
                <code className="text-gray-400">systemDefaults.json</code>
                <span className="text-gray-500 text-xs">(最低)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">2.</span>
                <code className="text-cyan-400">~/.innies/settings.json</code>
                <span className="text-gray-500 text-xs">(用户)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">3.</span>
                <code className="text-green-400">.innies/settings.json</code>
                <span className="text-gray-500 text-xs">(项目, 需信任)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">4.</span>
                <code className="text-orange-400">/etc/qwen-code/settings.json</code>
                <span className="text-gray-500 text-xs">(系统, 最高)</span>
              </div>
            </div>
          </HighlightBox>

          <HighlightBox title="主要 CLI 参数" icon="🔧" variant="purple">
            <div className="text-sm font-mono space-y-1">
              <div><code className="text-cyan-400">-m, --model</code> 指定模型</div>
              <div><code className="text-cyan-400">-p, --prompt</code> 非交互模式</div>
              <div><code className="text-cyan-400">-s, --sandbox</code> 沙箱模式</div>
              <div><code className="text-cyan-400">-y, --yolo</code> 自动批准</div>
              <div><code className="text-cyan-400">--approval-mode</code> 审批模式</div>
              <div><code className="text-cyan-400">-c, --checkpointing</code> 检查点</div>
            </div>
          </HighlightBox>
        </div>

        <CodeBlock
          title="settings.ts:411-418 - 配置合并策略"
          code={`return customDeepMerge(
  getMergeStrategyForPath,
  {},
  systemDefaults,      // 1. 基础默认值
  user,                // 2. 用户设置覆盖
  safeWorkspace,       // 3. 工作区覆盖 (需信任)
  system,              // 4. 系统覆盖 (最高优先)
) as Settings;`}
        />
      </Layer>

      {/* Stage 3: 沙箱检测 */}
      <Layer title="Stage 3: Sandbox Detection" icon="3️⃣">
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs mb-4">
          <pre className="text-gray-300 whitespace-pre">{`
沙箱命令检测优先级：

process.env['GEMINI_SANDBOX']     ← 环境变量 (最高优先)
        ↓ (未设置)
--sandbox CLI 参数                ← 命令行参数
        ↓ (未设置)
macOS && sandbox-exec 存在?       ← 自动检测 macOS Seatbelt
        ↓ (不满足)
docker 存在?                      ← 自动检测 Docker
        ↓ (不存在)
podman 存在?                      ← 自动检测 Podman
        ↓ (不存在)
settings.tools.sandbox            ← 配置文件设置
`}</pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="macOS Seatbelt" icon="🍎" variant="blue">
            <p className="text-sm text-gray-300">
              使用 <code>sandbox-exec</code> 配合 profile 文件限制进程权限
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Profiles: permissive-open, restrictive-closed
            </div>
          </HighlightBox>

          <HighlightBox title="Docker/Podman" icon="🐳" variant="green">
            <p className="text-sm text-gray-300">
              容器化隔离，镜像 URI 可配置
            </p>
            <div className="mt-2 text-xs text-gray-500">
              默认: ghcr.io/zhimanai/innies-cli:VERSION
            </div>
          </HighlightBox>

          <HighlightBox title="沙箱内重启" icon="🔄" variant="orange">
            <p className="text-sm text-gray-300">
              检测到沙箱配置后，当前进程会启动沙箱并自身退出
            </p>
            <div className="mt-2 text-xs text-gray-500">
              SANDBOX=true 标记已在沙箱内
            </div>
          </HighlightBox>
        </div>

        <CodeBlock
          title="gemini.tsx:251-314 - 沙箱启动流程"
          code={`if (sandboxConfig) {
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
  process.exit(0);  // 父进程退出
}`}
        />
      </Layer>

      {/* Stage 4: 完整初始化 */}
      <Layer title="Stage 4: Full Initialization (loadCliConfig)" icon="4️⃣">
        <p className="text-gray-300 mb-4">
          <code>loadCliConfig</code> 是最核心的初始化函数，负责组装完整的 Config 对象。
        </p>

        <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs mb-4">
          <pre className="text-gray-300 whitespace-pre">{`
loadCliConfig() 执行流程:
─────────────────────────────────────────────────────────────────────

1. 加载扩展 (loadExtensions)
   └─ 扫描 ~/.innies/extensions/ 和项目 .innies/extensions/

2. 加载 INNIES.md 记忆文件 (loadHierarchicalGeminiMemory)
   └─ 合并 ~/.innies/INNIES.md + .innies/INNIES.md

3. 合并 MCP 服务器配置 (mergeMcpServers)
   └─ settings + 扩展定义的 MCP 服务器

4. 确定审批模式 (ApprovalMode)
   └─ CLI --approval-mode > --yolo > settings > DEFAULT

5. 非信任文件夹检查
   └─ 非信任目录强制使用 DEFAULT 或 PLAN 模式

6. 确定交互模式
   └─ --prompt-interactive || (TTY && !query && !--prompt)

7. 工具排除列表合并
   └─ 扩展排除 + 设置排除 + 非交互模式额外排除

8. 构造 Config 对象 (50+ 配置项)
`}</pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="审批模式优先级" icon="🔐" variant="red">
            <div className="text-sm space-y-1">
              <div><code>--approval-mode</code> CLI 参数</div>
              <div className="text-gray-500">↓</div>
              <div><code>--yolo</code> → YOLO 模式</div>
              <div className="text-gray-500">↓</div>
              <div><code>settings.tools.approvalMode</code></div>
              <div className="text-gray-500">↓</div>
              <div><code>ApprovalMode.DEFAULT</code></div>
            </div>
          </HighlightBox>

          <HighlightBox title="非交互模式工具限制" icon="🚫" variant="yellow">
            <div className="text-sm space-y-1">
              <div className="text-gray-300">PLAN / DEFAULT 模式:</div>
              <div className="text-red-400 ml-2">排除: Shell, Edit, WriteFile</div>
              <div className="text-gray-300 mt-2">AUTO_EDIT 模式:</div>
              <div className="text-orange-400 ml-2">排除: Shell</div>
              <div className="text-gray-300 mt-2">YOLO 模式:</div>
              <div className="text-green-400 ml-2">无限制</div>
            </div>
          </HighlightBox>
        </div>
      </Layer>

      {/* Stage 6: 应用初始化 */}
      <Layer title="Stage 6: App Initialization" icon="6️⃣">
        <CodeBlock
          title="initializer.ts:32-57 - initializeApp"
          code={`export async function initializeApp(
  config: Config,
  settings: LoadedSettings,
): Promise<InitializationResult> {
  // 1. 执行初始认证
  const authError = await performInitialAuth(
    config,
    settings.merged.security?.auth?.selectedType,
  );

  // 2. 验证主题
  const themeError = validateTheme(settings);

  // 3. 决定是否打开认证对话框
  const shouldOpenAuthDialog =
    settings.merged.security?.auth?.selectedType === undefined
    || !!authError;

  // 4. 如果启用 IDE 模式，连接 IDE 客户端
  if (config.getIdeMode()) {
    const ideClient = await IdeClient.getInstance();
    await ideClient.connect();
  }

  return { authError, themeError, shouldOpenAuthDialog, ... };
}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <HighlightBox title="认证类型" icon="🔑" variant="blue">
            <div className="text-sm space-y-1">
              <div><code className="text-cyan-400">Qwen OAuth</code> - 默认，2000次/天免费</div>
              <div><code className="text-green-400">OpenAI API</code> - OPENAI_API_KEY</div>
              <div><code className="text-purple-400">Google Login</code> - OAuth 2.0</div>
            </div>
          </HighlightBox>

          <HighlightBox title="IDE 模式" icon="💻" variant="green">
            <p className="text-sm text-gray-300">
              当 <code>settings.ide.enabled = true</code> 时，
              自动连接 VS Code IDE Server 获取工作区上下文。
            </p>
          </HighlightBox>
        </div>
      </Layer>

      {/* Stage 7: 模式分流 */}
      <Layer title="Stage 7: Mode-Specific Paths" icon="7️⃣">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">Interactive Mode</h4>
            <p className="text-sm text-gray-300 mb-3">
              条件: <code>TTY + 无 query + 无 --prompt</code>
            </p>
            <div className="text-xs font-mono text-gray-400 space-y-1">
              <div>→ Kitty Protocol Detection</div>
              <div>→ React/Ink render()</div>
              <div>→ AppContainer 组件树</div>
              <div>→ 异步更新检查</div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-bold mb-2">Non-Interactive Mode</h4>
            <p className="text-sm text-gray-300 mb-3">
              条件: <code>--prompt 或 stdin 输入</code>
            </p>
            <div className="text-xs font-mono text-gray-400 space-y-1">
              <div>→ 读取 stdin (如有)</div>
              <div>→ 验证认证</div>
              <div>→ runNonInteractive()</div>
              <div>→ 输出结果并退出</div>
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">Zed Integration</h4>
            <p className="text-sm text-gray-300 mb-3">
              条件: <code>--experimental-acp</code>
            </p>
            <div className="text-xs font-mono text-gray-400 space-y-1">
              <div>→ ACP Protocol</div>
              <div>→ IDE 集成流程</div>
              <div>→ 特殊通信通道</div>
            </div>
          </div>
        </div>

        <CodeBlock
          title="gemini.tsx:131-197 - React UI 组件层次"
          code={`const AppWrapper = () => (
  <SettingsContext.Provider value={settings}>
    <KeypressProvider kittyProtocolEnabled={...}>
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

render(<AppWrapper />, { exitOnCtrlC: false, isScreenReaderEnabled: ... });`}
        />
      </Layer>

      {/* 环境变量 */}
      <Layer title="核心环境变量" icon="🌍">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="py-2 px-3">变量</th>
                <th className="py-2 px-3">用途</th>
                <th className="py-2 px-3">默认值</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">DEBUG</td>
                <td className="py-2 px-3">启用调试模式</td>
                <td className="py-2 px-3 text-gray-500">false</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">SANDBOX</td>
                <td className="py-2 px-3">内部标志，表示已在沙箱内</td>
                <td className="py-2 px-3 text-gray-500">-</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">GEMINI_SANDBOX</td>
                <td className="py-2 px-3">沙箱命令 (docker/podman/sandbox-exec)</td>
                <td className="py-2 px-3 text-gray-500">auto-detect</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">OPENAI_API_KEY</td>
                <td className="py-2 px-3">OpenAI 兼容 API 密钥</td>
                <td className="py-2 px-3 text-gray-500">-</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">OPENAI_BASE_URL</td>
                <td className="py-2 px-3">OpenAI 兼容 API 基础 URL</td>
                <td className="py-2 px-3 text-gray-500">-</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">QWEN_MODEL</td>
                <td className="py-2 px-3">Qwen 模型名称</td>
                <td className="py-2 px-3 text-gray-500">-</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3 font-mono text-cyan-400">NO_BROWSER</td>
                <td className="py-2 px-3">禁用浏览器启动 (OAuth)</td>
                <td className="py-2 px-3 text-gray-500">-</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-cyan-400">NO_COLOR</td>
                <td className="py-2 px-3">禁用彩色输出</td>
                <td className="py-2 px-3 text-gray-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 错误处理 */}
      <Layer title="错误处理机制" icon="⚠️">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="致命错误 (FatalError)" icon="🔴" variant="red">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">导致进程立即退出的错误：</p>
              <ul className="list-disc list-inside text-gray-400 text-xs space-y-1">
                <li>配置文件语法错误</li>
                <li>无效的沙箱命令</li>
                <li>缺少必要的沙箱工具</li>
                <li>Telemetry 配置错误</li>
              </ul>
            </div>
          </HighlightBox>

          <HighlightBox title="可恢复错误" icon="🟡" variant="yellow">
            <div className="text-sm space-y-2">
              <p className="text-gray-300">UI 中处理的错误：</p>
              <ul className="list-disc list-inside text-gray-400 text-xs space-y-1">
                <li>认证失败 → 打开认证对话框</li>
                <li>主题不存在 → 警告并使用默认</li>
                <li>配置文件不存在 → 使用空设置</li>
                <li>扩展加载失败 → 跳过该扩展</li>
              </ul>
            </div>
          </HighlightBox>
        </div>

        <CodeBlock
          title="index.ts:14-30 - 顶级错误处理"
          code={`main().catch((error) => {
  if (error instanceof FatalError) {
    let errorMessage = error.message;
    if (!process.env['NO_COLOR']) {
      errorMessage = \`\\x1b[31m\${errorMessage}\\x1b[0m\`;  // 红色输出
    }
    console.error(errorMessage);
    process.exit(error.exitCode);
  }
  console.error('An unexpected critical error occurred:');
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});`}
        />
      </Layer>

      {/* 关键文件参考 */}
      <Layer title="关键文件参考" icon="📁">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">packages/cli/</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div>index.ts <span className="text-gray-600">- 全局入口</span></div>
              <div>src/gemini.tsx <span className="text-gray-600">- 主启动逻辑</span></div>
              <div>src/config/config.ts <span className="text-gray-600">- 参数解析</span></div>
              <div>src/config/settings.ts <span className="text-gray-600">- 设置加载</span></div>
              <div>src/config/sandboxConfig.ts <span className="text-gray-600">- 沙箱配置</span></div>
              <div>src/core/initializer.ts <span className="text-gray-600">- 应用初始化</span></div>
              <div>src/nonInteractiveCli.ts <span className="text-gray-600">- 非交互模式</span></div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">Context 提供器</h4>
            <div className="text-xs font-mono space-y-1 text-gray-400">
              <div>SettingsContext <span className="text-gray-600">- 全局设置</span></div>
              <div>KeypressProvider <span className="text-gray-600">- 键盘输入</span></div>
              <div>SessionStatsProvider <span className="text-gray-600">- 会话统计</span></div>
              <div>VimModeProvider <span className="text-gray-600">- Vim 模式</span></div>
            </div>
          </div>
        </div>
      </Layer>
    </div>
  );
}
