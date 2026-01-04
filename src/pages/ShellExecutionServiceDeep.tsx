import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

export function ShellExecutionServiceDeep() {
  const executionArchitecture = `
flowchart TB
    subgraph Input["输入"]
        Cmd["命令字符串"]
        CWD["工作目录"]
        AbortSignal["AbortSignal"]
    end

    subgraph Decision["执行方式选择"]
        ShouldUsePty{shouldUseNodePty?}
        PtyAvailable{PTY可用?}
    end

    subgraph PtyExecution["PTY 执行"]
        NodePty["node-pty / lydell-node-pty"]
        HeadlessTerm["@xterm/headless"]
        PtyOutput["流式输出"]
    end

    subgraph FallbackExecution["Fallback 执行"]
        ChildProcess["child_process.spawn"]
        StdoutStderr["stdout/stderr"]
        CPOutput["输出收集"]
    end

    subgraph Output["输出处理"]
        BinaryCheck["二进制检测"]
        Encoding["编码检测"]
        Result["ShellExecutionResult"]
    end

    Cmd --> ShouldUsePty
    ShouldUsePty -->|是| PtyAvailable
    ShouldUsePty -->|否| ChildProcess

    PtyAvailable -->|可用| NodePty
    PtyAvailable -->|不可用| ChildProcess

    NodePty --> HeadlessTerm
    HeadlessTerm --> PtyOutput
    PtyOutput --> BinaryCheck

    ChildProcess --> StdoutStderr
    StdoutStderr --> CPOutput
    CPOutput --> BinaryCheck

    BinaryCheck --> Encoding
    Encoding --> Result

    AbortSignal -.->|中断| NodePty
    AbortSignal -.->|中断| ChildProcess

    style NodePty fill:#22d3ee,color:#000
    style ChildProcess fill:#f59e0b,color:#000
    style Result fill:#4ade80,color:#000
`;

  const ptyLifecycle = `
sequenceDiagram
    participant CLI as CLI
    participant SES as ShellExecutionService
    participant PTY as node-pty
    participant Term as Headless Terminal
    participant Proc as Shell Process

    CLI->>SES: execute(cmd, cwd, callback)
    SES->>SES: getPty()

    alt PTY 可用
        SES->>PTY: spawn(shell, args, options)
        PTY->>Proc: 创建进程
        SES->>Term: new Terminal(cols, rows)
        SES->>SES: activePtys.set(pid, {pty, term})

        loop 数据流
            Proc-->>PTY: 输出数据
            PTY-->>SES: onData(data)
            SES->>SES: 二进制检测
            SES->>Term: write(decoded)
            Term-->>SES: render callback
            SES-->>CLI: onOutputEvent({type:'data'})
        end

        Proc-->>PTY: 进程退出
        PTY-->>SES: onExit(code, signal)
        SES->>SES: activePtys.delete(pid)
        SES-->>CLI: resolve(ShellExecutionResult)

    else Fallback 到 child_process
        SES->>Proc: cpSpawn(cmd, options)
        loop 数据流
            Proc-->>SES: stdout.on('data')
            Proc-->>SES: stderr.on('data')
            SES-->>CLI: 缓冲输出
        end
        Proc-->>SES: exit event
        SES-->>CLI: resolve(ShellExecutionResult)
    end
`;

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🐚</span>
          <h1 className="text-3xl font-bold text-white">ShellExecutionService 深度解析</h1>
        </div>
        <p className="text-gray-300 text-lg">
          Shell 命令执行的核心服务，支持 PTY 和 child_process 双模式
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-orange-500/30 rounded-full text-sm text-orange-300">node-pty</span>
          <span className="px-3 py-1 bg-red-500/30 rounded-full text-sm text-red-300">child_process</span>
          <span className="px-3 py-1 bg-yellow-500/30 rounded-full text-sm text-yellow-300">xterm/headless</span>
        </div>
      </div>

      {/* 核心概念 */}
      <Layer title="核心概念" icon="🎯">
        <div className="space-y-4">
          <p className="text-gray-300">
            ShellExecutionService 是 CLI 执行 shell 命令的核心服务。它优先使用 PTY (伪终端) 提供完整的终端体验，
            当 PTY 不可用时降级到 child_process。
          </p>

          <HighlightBox title="为什么需要 PTY？" icon="💡" variant="blue">
            <ul className="space-y-2 text-sm">
              <li><strong>完整终端体验</strong>：支持颜色、光标移动、进度条等 ANSI 特性</li>
              <li><strong>交互式程序</strong>：支持需要 TTY 的程序（如 vim、less）</li>
              <li><strong>信号处理</strong>：正确处理 Ctrl+C 等信号</li>
              <li><strong>流式输出</strong>：实时显示命令输出，而非等待完成</li>
            </ul>
          </HighlightBox>

          <MermaidDiagram chart={executionArchitecture} title="执行架构" />
        </div>
      </Layer>

      {/* 执行方式对比 */}
      <Layer title="执行方式对比" icon="⚖️">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2 px-3">特性</th>
                <th className="text-left py-2 px-3">PTY (node-pty)</th>
                <th className="text-left py-2 px-3">child_process</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">ANSI 颜色</td>
                <td className="py-2 px-3 text-green-400">✓ 完整支持</td>
                <td className="py-2 px-3 text-yellow-400">△ 需要设置 TERM</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">交互式程序</td>
                <td className="py-2 px-3 text-green-400">✓ 支持</td>
                <td className="py-2 px-3 text-red-400">✗ 不支持</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">进度条渲染</td>
                <td className="py-2 px-3 text-green-400">✓ 实时更新</td>
                <td className="py-2 px-3 text-red-400">✗ 乱码</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">跨平台</td>
                <td className="py-2 px-3 text-yellow-400">△ 需要编译</td>
                <td className="py-2 px-3 text-green-400">✓ 内置</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-2 px-3">依赖复杂度</td>
                <td className="py-2 px-3 text-yellow-400">△ 需要原生模块</td>
                <td className="py-2 px-3 text-green-400">✓ 无依赖</td>
              </tr>
              <tr>
                <td className="py-2 px-3">执行方法标记</td>
                <td className="py-2 px-3 font-mono text-cyan-400">lydell-node-pty / node-pty</td>
                <td className="py-2 px-3 font-mono text-cyan-400">child_process</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      {/* 生命周期 */}
      <Layer title="执行生命周期" icon="🔄">
        <MermaidDiagram chart={ptyLifecycle} title="PTY 生命周期" />
      </Layer>

      {/* 核心代码 */}
      <Layer title="核心实现" icon="💻">
        <Layer title="execute 入口" depth={2} defaultOpen={true}>
          <CodeBlock
            title="执行入口方法"
            code={`static async execute(
  commandToExecute: string,
  cwd: string,
  onOutputEvent: (event: ShellOutputEvent) => void,
  abortSignal: AbortSignal,
  shouldUseNodePty: boolean,
  shellExecutionConfig: ShellExecutionConfig,
): Promise<ShellExecutionHandle> {

  // 优先尝试 PTY
  if (shouldUseNodePty) {
    const ptyInfo = await getPty();
    if (ptyInfo) {
      try {
        return this.executeWithPty(
          commandToExecute, cwd, onOutputEvent,
          abortSignal, shellExecutionConfig, ptyInfo,
        );
      } catch (_e) {
        // Fallback to child_process
      }
    }
  }

  // 降级到 child_process
  return this.childProcessFallback(
    commandToExecute, cwd, onOutputEvent, abortSignal,
  );
}`}
          />
        </Layer>

        <Layer title="PTY 执行" depth={2} defaultOpen={true}>
          <CodeBlock
            title="PTY 执行核心"
            code={`private static executeWithPty(...): ShellExecutionHandle {
  const cols = shellExecutionConfig.terminalWidth ?? 80;
  const rows = shellExecutionConfig.terminalHeight ?? 30;

  const ptyProcess = ptyInfo.module.spawn(shell, args, {
    cwd,
    name: 'xterm',
    cols,
    rows,
    env: {
      ...process.env,
      GEMINI_CLI: '1',
      TERM: 'xterm-256color',
      PAGER: shellExecutionConfig.pager ?? 'cat',
    },
    handleFlowControl: true,
  });

  // 无头终端用于解析 ANSI 序列
  const headlessTerminal = new Terminal({
    allowProposedApi: true,
    cols,
    rows,
  });

  // 注册活跃 PTY
  this.activePtys.set(ptyProcess.pid, { ptyProcess, headlessTerminal });

  // 数据处理
  ptyProcess.onData((data: string) => {
    const bufferData = Buffer.from(data, 'utf-8');
    handleOutput(bufferData);
  });

  // 退出处理
  ptyProcess.onExit(({ exitCode, signal }) => {
    this.activePtys.delete(ptyProcess.pid);
    resolve(result);
  });
}`}
          />
        </Layer>

        <Layer title="二进制检测" depth={2} defaultOpen={true}>
          <CodeBlock
            title="二进制内容检测"
            code={`// 二进制检测逻辑
const MAX_SNIFF_SIZE = 4096;
let sniffedBytes = 0;
let isStreamingRawContent = true;

const handleOutput = (data: Buffer) => {
  // 在前 4KB 内检测是否为二进制
  if (isStreamingRawContent && sniffedBytes < MAX_SNIFF_SIZE) {
    const sniffBuffer = Buffer.concat(outputChunks.slice(0, 20));
    sniffedBytes = sniffBuffer.length;

    if (isBinary(sniffBuffer)) {
      isStreamingRawContent = false;
      onOutputEvent({ type: 'binary_detected' });
    }
  }

  // 二进制内容只报告进度
  if (!isStreamingRawContent) {
    onOutputEvent({
      type: 'binary_progress',
      bytesReceived: totalBytes,
    });
  }
};`}
          />
        </Layer>
      </Layer>

      {/* 边界条件 */}
      <Layer title="边界条件深度解析" depth={1} defaultOpen={true}>
        <Layer title="1. PTY 不可用场景" depth={2} defaultOpen={true}>
          <HighlightBox title="常见不可用场景" icon="⚠️" variant="orange">
            <ul className="space-y-2 text-sm">
              <li><strong>Docker 容器</strong>：部分镜像缺少编译 node-pty 的依赖</li>
              <li><strong>Windows 环境</strong>：需要 Visual C++ Build Tools</li>
              <li><strong>ARM 架构</strong>：预编译二进制可能不存在</li>
              <li><strong>受限环境</strong>：无法安装原生模块</li>
            </ul>
          </HighlightBox>
        </Layer>

        <Layer title="2. 进程中断处理" depth={2} defaultOpen={true}>
          <CodeBlock
            title="中断处理逻辑"
            code={`const abortHandler = async () => {
  if (ptyProcess.pid && !exited) {
    if (os.platform() === 'win32') {
      // Windows: 使用 taskkill 终止进程树
      cpSpawn('taskkill', ['/pid', pid.toString(), '/f', '/t']);
    } else {
      try {
        // Unix: 先发送 SIGTERM
        process.kill(-ptyProcess.pid, 'SIGTERM');

        // 等待 200ms
        await new Promise(res => setTimeout(res, SIGKILL_TIMEOUT_MS));

        // 如果还没退出，强制 SIGKILL
        if (!exited) {
          process.kill(-ptyProcess.pid, 'SIGKILL');
        }
      } catch (_e) {
        // 进程组 kill 失败时降级到单进程 kill
        if (!exited) child.kill('SIGKILL');
      }
    }
  }
};

// 注册中断监听
abortSignal.addEventListener('abort', abortHandler, { once: true });`}
          />
        </Layer>

        <Layer title="3. 编码处理" depth={2} defaultOpen={true}>
          <CodeBlock
            title="动态编码检测"
            code={`import { getCachedEncodingForBuffer } from '../utils/systemEncoding.js';

const handleOutput = (data: Buffer) => {
  if (!decoder) {
    // 从输出内容推断编码
    const encoding = getCachedEncodingForBuffer(data);
    try {
      decoder = new TextDecoder(encoding);
    } catch {
      // 降级到 UTF-8
      decoder = new TextDecoder('utf-8');
    }
  }

  const decodedChunk = decoder.decode(data, { stream: true });
  // ...
};`}
          />
        </Layer>
      </Layer>

      {/* AbortSignal 语义边界 */}
      <Layer title="AbortSignal 语义边界" icon="🛑">
        <div className="space-y-4">
          <HighlightBox title="AbortSignal 保证什么？" icon="✅" variant="green">
            <ul className="space-y-2 text-sm">
              <li><strong>进程终止尝试</strong>：会发送 SIGTERM，然后 SIGKILL</li>
              <li><strong>Promise 解析</strong>：abort 后 execute() Promise 最终会 resolve/reject</li>
              <li><strong>资源清理</strong>：PTY 句柄和事件监听器会被清理</li>
              <li><strong>进程组终止</strong>：尝试终止整个进程组（子进程）</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="AbortSignal 不保证什么？" icon="❌" variant="red">
            <ul className="space-y-2 text-sm">
              <li><strong>立即终止</strong>：进程可能忽略 SIGTERM，需等待 SIGKILL</li>
              <li><strong>输出完整性</strong>：abort 时可能丢失未刷新的输出缓冲</li>
              <li><strong>原子性</strong>：正在写入的文件可能处于不一致状态</li>
              <li><strong>子进程孤儿</strong>：某些场景下子进程可能变成孤儿进程</li>
              <li><strong>网络连接</strong>：进程创建的网络连接可能不会立即关闭</li>
            </ul>
          </HighlightBox>

          <CodeBlock
            title="长期运行命令的超时处理"
            code={`// 场景：用户运行了一个长时间无输出的命令
// 例如: npm install (大型项目) 或 make (大型编译)

// ShellExecutionService 不主动超时
// 超时由上层调用方控制

// 调用方式：
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort(); // 触发中断
}, 120_000); // 2分钟超时

const result = await ShellExecutionService.execute(
  'npm install',
  cwd,
  onOutput,
  controller.signal, // 传入 AbortSignal
  shouldUsePty,
  config
);

clearTimeout(timeoutId);

// 注意事项：
// 1. 无输出 ≠ 无活动（可能正在下载/编译）
// 2. 用户可随时 Ctrl+C 触发 abort
// 3. abort 后需等待进程实际退出`}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">场景</th>
                  <th className="text-left py-2 px-3">abort 行为</th>
                  <th className="text-left py-2 px-3">风险</th>
                  <th className="text-left py-2 px-3">建议</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">npm install</td>
                  <td className="py-2 px-3 text-green-400">安全终止</td>
                  <td className="py-2 px-3">node_modules 不完整</td>
                  <td className="py-2 px-3">重新运行即可</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">git push</td>
                  <td className="py-2 px-3 text-yellow-400">可能不一致</td>
                  <td className="py-2 px-3">部分推送</td>
                  <td className="py-2 px-3">检查远程状态</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3">数据库迁移</td>
                  <td className="py-2 px-3 text-red-400">危险</td>
                  <td className="py-2 px-3">数据不一致</td>
                  <td className="py-2 px-3">避免中断</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">编译任务</td>
                  <td className="py-2 px-3 text-green-400">安全终止</td>
                  <td className="py-2 px-3">输出不完整</td>
                  <td className="py-2 px-3">清理后重试</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* 安全责任边界 */}
      <Layer title="安全责任边界澄清" icon="🔐">
        <div className="space-y-4">
          <HighlightBox title="重要澄清" icon="🚨" variant="red">
            <p className="text-sm">
              ShellExecutionService <strong>仅负责执行</strong>，以下安全职责由其他模块承担：
            </p>
          </HighlightBox>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">安全职责</th>
                  <th className="text-left py-2 px-3">责任模块</th>
                  <th className="text-left py-2 px-3">ShellExecutionService</th>
                  <th className="text-left py-2 px-3">链接</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-orange-400">命令注入检测</td>
                  <td className="py-2 px-3">BashTool / ToolScheduler</td>
                  <td className="py-2 px-3 text-red-400">✗ 不处理</td>
                  <td className="py-2 px-3 text-cyan-400">→ tool-detail</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-orange-400">只读模式策略</td>
                  <td className="py-2 px-3">Sandbox / Permission</td>
                  <td className="py-2 px-3 text-red-400">✗ 不处理</td>
                  <td className="py-2 px-3 text-cyan-400">→ sandbox</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-orange-400">危险命令拦截</td>
                  <td className="py-2 px-3">BashTool / Blocklist</td>
                  <td className="py-2 px-3 text-red-400">✗ 不处理</td>
                  <td className="py-2 px-3 text-cyan-400">→ permission</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono text-orange-400">工作目录限制</td>
                  <td className="py-2 px-3">Sandbox / Container</td>
                  <td className="py-2 px-3 text-red-400">✗ 不处理</td>
                  <td className="py-2 px-3 text-cyan-400">→ sandbox</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-green-400">进程终止</td>
                  <td className="py-2 px-3">ShellExecutionService</td>
                  <td className="py-2 px-3 text-green-400">✓ 处理</td>
                  <td className="py-2 px-3">本页</td>
                </tr>
              </tbody>
            </table>
          </div>

          <CodeBlock
            title="安全链路示意"
            code={`// 完整的命令执行安全链路

// 1. AI 生成命令
const command = "rm -rf /important";

// 2. BashTool 层：危险命令检测
if (isDangerousCommand(command)) {
  throw new Error("Blocked: destructive command");
}

// 3. Permission 层：用户确认
const approved = await requestPermission('bash', command);
if (!approved) throw new Error("User denied");

// 4. Sandbox 层：环境隔离
const sandboxedCommand = wrapWithSandbox(command, config);

// 5. ShellExecutionService 层：纯执行
// 这里已经假设命令是"安全的"
const result = await ShellExecutionService.execute(
  sandboxedCommand,
  cwd,
  onOutput,
  abortSignal,
  shouldUsePty,
  config
);`}
          />

          <HighlightBox title="设计原则" icon="💡" variant="blue">
            <p className="text-sm">
              ShellExecutionService 采用<strong>单一职责原则</strong>：只负责"如何执行"，
              不负责"是否应该执行"。这使得安全策略可以在上层灵活配置，而执行层保持简单可靠。
            </p>
          </HighlightBox>
        </div>
      </Layer>

      {/* 平台差异对照表 */}
      <Layer title="平台差异对照表" icon="🖥️">
        <div className="space-y-4">
          <p className="text-gray-300">
            不同平台对 PTY 和进程管理的支持存在显著差异：
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">特性</th>
                  <th className="text-left py-2 px-3">macOS</th>
                  <th className="text-left py-2 px-3">Linux</th>
                  <th className="text-left py-2 px-3">Windows</th>
                  <th className="text-left py-2 px-3">Docker</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">PTY 可用</td>
                  <td className="py-2 px-3 text-green-400">✓ 默认</td>
                  <td className="py-2 px-3 text-green-400">✓ 默认</td>
                  <td className="py-2 px-3 text-yellow-400">△ 需 VC++</td>
                  <td className="py-2 px-3 text-yellow-400">△ 需依赖</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">node-pty 模块</td>
                  <td className="py-2 px-3 text-cyan-400">lydell-node-pty</td>
                  <td className="py-2 px-3 text-cyan-400">node-pty</td>
                  <td className="py-2 px-3 text-cyan-400">node-pty</td>
                  <td className="py-2 px-3 text-cyan-400">取决于基础镜像</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">进程组终止</td>
                  <td className="py-2 px-3 text-green-400">kill(-pgid)</td>
                  <td className="py-2 px-3 text-green-400">kill(-pgid)</td>
                  <td className="py-2 px-3 text-orange-400">taskkill /t</td>
                  <td className="py-2 px-3 text-green-400">kill(-pgid)</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">SIGTERM 支持</td>
                  <td className="py-2 px-3 text-green-400">✓</td>
                  <td className="py-2 px-3 text-green-400">✓</td>
                  <td className="py-2 px-3 text-red-400">✗ 不支持</td>
                  <td className="py-2 px-3 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">默认 Shell</td>
                  <td className="py-2 px-3">/bin/zsh</td>
                  <td className="py-2 px-3">/bin/bash</td>
                  <td className="py-2 px-3">cmd.exe / pwsh</td>
                  <td className="py-2 px-3">/bin/sh</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-mono">颜色支持</td>
                  <td className="py-2 px-3 text-green-400">✓ 完整</td>
                  <td className="py-2 px-3 text-green-400">✓ 完整</td>
                  <td className="py-2 px-3 text-yellow-400">△ 需设置</td>
                  <td className="py-2 px-3 text-green-400">✓ 完整</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">Fallback 行为</td>
                  <td className="py-2 px-3">child_process</td>
                  <td className="py-2 px-3">child_process</td>
                  <td className="py-2 px-3">child_process</td>
                  <td className="py-2 px-3">child_process</td>
                </tr>
              </tbody>
            </table>
          </div>

          <HighlightBox title="Windows 特殊处理" icon="🪟" variant="orange">
            <CodeBlock
              title="Windows 进程终止"
              code={`// Windows 不支持 SIGTERM，使用 taskkill
if (os.platform() === 'win32') {
  // /f: 强制终止
  // /t: 终止进程树（子进程）
  cpSpawn('taskkill', ['/pid', pid.toString(), '/f', '/t']);
} else {
  // Unix: 先 SIGTERM，后 SIGKILL
  process.kill(-ptyProcess.pid, 'SIGTERM');
  setTimeout(() => {
    if (!exited) process.kill(-ptyProcess.pid, 'SIGKILL');
  }, 200);
}`}
            />
          </HighlightBox>

          <HighlightBox title="Docker 注意事项" icon="🐳" variant="blue">
            <ul className="space-y-2 text-sm">
              <li><strong>Alpine 镜像</strong>：缺少编译工具，node-pty 不可用</li>
              <li><strong>--init 参数</strong>：建议使用，确保信号正确传递</li>
              <li><strong>PID 1 问题</strong>：容器内主进程是 PID 1，信号处理不同</li>
              <li><strong>权限</strong>：部分操作可能需要 --privileged</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* 调试技巧 */}
      <Layer title="常见问题与调试技巧" depth={1} defaultOpen={true}>
        <Layer title="问题1: 输出乱码" depth={2} defaultOpen={true}>
          <HighlightBox title="诊断步骤" icon="🔧" variant="blue">
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>检查 executionMethod 字段确认执行方式</li>
              <li>检查是否被识别为二进制（binary_detected 事件）</li>
              <li>验证系统编码设置（LANG, LC_ALL）</li>
              <li>尝试设置 TERM=xterm-256color</li>
            </ol>
          </HighlightBox>
        </Layer>

        <Layer title="问题2: 命令无法中断" depth={2} defaultOpen={true}>
          <CodeBlock
            title="调试中断问题"
            language="bash"
            code={`# 检查进程树
ps -ef | grep <pid>

# 检查进程组
ps -o pid,pgid,comm -p <pid>

# 手动发送信号
kill -TERM -<pgid>  # 负号表示进程组`}
          />
        </Layer>
      </Layer>

      {/* 相关页面 */}
      <RelatedPages
        pages={[
          { id: 'shell-modes', label: 'Shell 模式' },
          { id: 'pty-lifecycle-anim', label: 'PTY 生命周期动画' },
          { id: 'tool-detail', label: '工具执行' },
          { id: 'sandbox', label: '沙箱系统' },
        ]}
      />
    </div>
  );
}
