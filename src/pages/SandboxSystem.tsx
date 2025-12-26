import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';

function Introduction({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">
            沙箱系统导读
          </span>
        </div>
        <span
          className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">
              🎯 为什么需要沙箱？
            </h4>
            <p className="text-[var(--text-secondary)] text-sm">
              AI 可能执行<strong>危险命令</strong>（如 rm -rf、格式化磁盘）。
              沙箱通过<strong>隔离执行环境</strong>，限制命令能访问的文件和系统资源，
              保护用户的主机系统。
            </p>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">
              🔧 沙箱类型
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--terminal-green)]">Docker</div>
                <div className="text-[10px] text-[var(--text-muted)]">容器隔离</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--cyber-blue)]">Podman</div>
                <div className="text-[10px] text-[var(--text-muted)]">无守护进程</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--amber)]">Seatbelt</div>
                <div className="text-[10px] text-[var(--text-muted)]">macOS 原生</div>
              </div>
              <div className="bg-[var(--bg-card)] p-2 rounded text-center">
                <div className="text-xs text-[var(--purple)]">None</div>
                <div className="text-[10px] text-[var(--text-muted)]">无沙箱</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">
              🏗️ 沙箱策略
            </h4>
            <ul className="text-[var(--text-secondary)] text-sm space-y-1">
              <li>• <strong>permissive-open</strong> - 宽松模式，允许大多数操作</li>
              <li>• <strong>restrictive-closed</strong> - 严格模式，只读访问</li>
              <li>• <strong>自定义 Dockerfile</strong> - 项目专用沙箱环境</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">📊 关键配置</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--terminal-green)]">3</div>
                <div className="text-xs text-[var(--text-muted)]">沙箱类型</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--cyber-blue)]">2</div>
                <div className="text-xs text-[var(--text-muted)]">Seatbelt 策略</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--amber)]">ENV</div>
                <div className="text-xs text-[var(--text-muted)]">GEMINI_SANDBOX</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--purple)]">UID</div>
                <div className="text-xs text-[var(--text-muted)]">权限映射</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SandboxSystem() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);
  const sandboxDecisionFlow = `flowchart TD
    start[启动 run_shell_command]
    check_env[检查 GEMINI_SANDBOX<br/>环境变量]
    is_docker{sandbox=docker?}
    is_podman{sandbox=podman?}
    is_true{sandbox=true?}
    check_platform[检测操作系统]
    is_macos{macOS?}
    docker_exec[Docker 容器<br/>沙箱]
    podman_exec[Podman 容器<br/>沙箱]
    seatbelt_exec[macOS Seatbelt<br/>sandbox-exec]
    no_sandbox[无沙箱<br/>直接执行]

    start --> check_env
    check_env --> is_docker
    is_docker -->|Yes| docker_exec
    is_docker -->|No| is_podman
    is_podman -->|Yes| podman_exec
    is_podman -->|No| is_true
    is_true -->|Yes| check_platform
    is_true -->|No| no_sandbox
    check_platform --> is_macos
    is_macos -->|Yes| seatbelt_exec
    is_macos -->|No<br/>默认Docker| docker_exec

    style start fill:#22d3ee,color:#000
    style no_sandbox fill:#22c55e,color:#000
    style is_docker fill:#f59e0b,color:#000
    style is_podman fill:#f59e0b,color:#000
    style is_true fill:#f59e0b,color:#000
    style is_macos fill:#f59e0b,color:#000
`;

  const containerStartupFlow = `flowchart TD
    start[请求沙箱执行]
    check_running{检查容器<br/>是否运行}
    build_image[构建镜像<br/>如果需要]
    create_container[创建容器<br/>挂载工作目录]
    start_container[启动容器]
    exec_command[执行命令<br/>docker exec]
    capture_output[捕获输出<br/>stdout/stderr]
    return_result[返回结果]

    start --> check_running
    check_running -->|已运行| exec_command
    check_running -->|未运行| build_image
    build_image --> create_container
    create_container --> start_container
    start_container --> exec_command
    exec_command --> capture_output
    capture_output --> return_result

    style start fill:#22d3ee,color:#000
    style return_result fill:#22c55e,color:#000
    style check_running fill:#f59e0b,color:#000
`;

  const sandboxTypeCode = `// packages/cli/src/utils/sandbox.ts
export type SandboxType = 'docker' | 'podman' | 'seatbelt' | 'none';

export function getSandboxType(): SandboxType {
  const sandboxEnv = process.env.GEMINI_SANDBOX?.toLowerCase();

  if (sandboxEnv === 'docker') return 'docker';
  if (sandboxEnv === 'podman') return 'podman';
  if (sandboxEnv === 'true') {
    // macOS 优先使用 seatbelt，其他平台使用 docker
    return process.platform === 'darwin' ? 'seatbelt' : 'docker';
  }

  return 'none';
}`;

  const dockerConfigCode = `// Docker 容器配置
interface DockerSandboxConfig {
  // 镜像配置
  image: string;           // 默认: ghcr.io/zhimanai/qwen-cli:{version}
  dockerfile?: string;     // 自定义: .qwen/sandbox.Dockerfile

  // 挂载配置
  workdir: string;         // 工作目录挂载
  readOnly: boolean;       // 是否只读挂载

  // 用户配置
  uid: number;             // 宿主机 UID
  gid: number;             // 宿主机 GID

  // 资源限制
  memory?: string;         // 内存限制 (如 "2g")
  cpus?: number;           // CPU 核心数

  // 网络配置
  network: 'none' | 'host' | 'bridge';
}

// 容器启动命令
const dockerRunArgs = [
  'run',
  '--rm',                           // 退出后删除容器
  '-d',                             // 后台运行
  '--name', containerName,          // 容器名称
  '-v', \`\${workdir}:/workspace\`,   // 挂载工作目录
  '-w', '/workspace',               // 设置工作目录
  '-u', \`\${uid}:\${gid}\`,           // 用户映射
  '--network', 'none',              // 默认无网络
  image,
  'sleep', 'infinity'               // 保持容器运行
];`;

  const seatbeltCode = `// macOS Seatbelt (sandbox-exec) 配置
// packages/cli/src/utils/sandbox.ts

export type SeatbeltProfile =
  | 'permissive-open'      // 宽松模式：允许大部分操作
  | 'permissive-closed'    // 半宽松：限制网络和某些系统调用
  | 'restrictive-open'     // 半严格：允许网络但限制文件访问
  | 'restrictive-closed';  // 严格模式：最大限制

// Seatbelt 执行命令
function executeSeatbelt(
  command: string,
  profile: SeatbeltProfile = 'permissive-closed'
): Promise<ExecutionResult> {
  const profilePath = getProfilePath(profile);

  // sandbox-exec 是 macOS 内置的沙箱工具
  return spawn('sandbox-exec', [
    '-f', profilePath,    // 沙箱配置文件
    '/bin/bash',
    '-c',
    command
  ]);
}

// 沙箱配置文件示例 (.sb 格式)
/*
(version 1)
(deny default)

; 允许读取和执行
(allow file-read*)
(allow process-exec)
(allow process-fork)

; 限制写入到工作目录
(allow file-write*
  (subpath "/workspace"))

; 禁止网络访问
(deny network*)

; 允许系统调用
(allow sysctl-read)
(allow mach-lookup)
*/`;

  const customSandboxCode = `// 自定义沙箱配置
// .qwen/sandbox.Dockerfile

FROM node:20-slim

# 安装开发工具
RUN apt-get update && apt-get install -y \\
    git \\
    curl \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# 创建工作目录
WORKDIR /workspace

# 设置非 root 用户
ARG UID=1000
ARG GID=1000
RUN groupadd -g \${GID} developer && \\
    useradd -u \${UID} -g \${GID} -m developer
USER developer

# .qwen/sandbox.bashrc
# 容器启动时执行的初始化脚本
export PATH="$PATH:/workspace/node_modules/.bin"
alias ll='ls -la'

# 项目检测到这些文件时会使用自定义沙箱
// packages/cli/src/utils/sandbox.ts
function getCustomDockerfile(): string | null {
  const customPath = path.join(process.cwd(), '.qwen', 'sandbox.Dockerfile');
  if (fs.existsSync(customPath)) {
    return customPath;
  }
  return null;
}`;

  const securityFeaturesCode = `// 安全特性实现
// packages/cli/src/utils/sandbox.ts

interface SecurityFeatures {
  // 文件系统隔离
  filesystem: {
    readOnly: boolean;           // 只读模式
    allowedPaths: string[];      // 允许访问的路径
    deniedPaths: string[];       // 禁止访问的路径
  };

  // 网络隔离
  network: {
    enabled: boolean;            // 是否允许网络
    allowedHosts?: string[];     // 允许的主机
    allowedPorts?: number[];     // 允许的端口
  };

  // 进程隔离
  process: {
    maxProcesses: number;        // 最大进程数
    allowFork: boolean;          // 是否允许 fork
    allowExec: boolean;          // 是否允许 exec
  };

  // 资源限制
  resources: {
    maxMemory: string;           // 最大内存
    maxCpu: number;              // 最大 CPU
    timeout: number;             // 执行超时 (ms)
  };
}

// 验证命令安全性
function validateCommand(command: string): boolean {
  const dangerousPatterns = [
    /rm\\s+-rf\\s+\\/(?!\\s)/,    // rm -rf /
    /mkfs/,                       // 格式化磁盘
    /dd\\s+if=/,                  // 低级磁盘操作
    /:(){ :|:& };:/,             // Fork 炸弹
  ];

  return !dangerousPatterns.some(p => p.test(command));
}`;

  const uidMappingCode = `// UID/GID 映射机制
// 确保容器内文件权限与宿主机一致

function getUidGid(): { uid: number; gid: number } {
  // Unix 系统获取当前用户 UID/GID
  if (process.platform !== 'win32') {
    return {
      uid: process.getuid?.() ?? 1000,
      gid: process.getgid?.() ?? 1000,
    };
  }

  // Windows 使用默认值
  return { uid: 1000, gid: 1000 };
}

// 容器启动时映射用户
async function startContainer(config: DockerSandboxConfig) {
  const { uid, gid } = getUidGid();

  // 创建容器时指定用户
  await exec('docker', [
    'run',
    '-u', \`\${uid}:\${gid}\`,    // 用户映射
    ...otherArgs
  ]);

  // 这样容器内创建的文件，宿主机也有正确的所有权
}

/*
为什么需要 UID 映射？
┌─────────────────────────────────────────────────────┐
│ 宿主机 (UID: 501)                                    │
│   └── project/                                       │
│       └── src/  (owner: 501)                        │
└─────────────────────────────────────────────────────┘
                    │ 挂载
                    ▼
┌─────────────────────────────────────────────────────┐
│ 容器 (运行用户: root/1000)                           │
│   └── /workspace/                                   │
│       └── src/  (owner: ???)                        │
│                                                     │
│  如果不映射 UID:                                    │
│  - 容器创建的文件宿主机无法访问                      │
│  - 权限错误导致 git 操作失败                        │
│                                                     │
│  映射 UID 后 (-u 501:501):                          │
│  - 容器以宿主机用户身份运行                         │
│  - 文件权限完全一致                                 │
└─────────────────────────────────────────────────────┘
*/`;

  return (
    <div className="space-y-8">
      <Introduction
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
      />

      {/* 概述 */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">沙箱安全系统</h2>
        <p className="text-gray-300 mb-4">
          沙箱系统是 CLI 的安全核心，通过隔离命令执行环境来防止恶意代码或意外操作对系统造成破坏。
          支持 Docker、Podman 容器沙箱和 macOS 原生的 Seatbelt (sandbox-exec) 机制。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HighlightBox title="Docker/Podman" color="blue">
            <ul className="text-sm space-y-1">
              <li>完整的容器隔离</li>
              <li>自定义 Dockerfile 支持</li>
              <li>跨平台兼容</li>
              <li>资源限制和网络隔离</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="macOS Seatbelt" color="green">
            <ul className="text-sm space-y-1">
              <li>原生沙箱机制</li>
              <li>轻量级、启动快</li>
              <li>细粒度权限控制</li>
              <li>多种预置配置文件</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="安全特性" color="purple">
            <ul className="text-sm space-y-1">
              <li>文件系统隔离</li>
              <li>网络访问控制</li>
              <li>进程隔离</li>
              <li>UID/GID 映射</li>
            </ul>
          </HighlightBox>
        </div>
      </section>

      {/* 沙箱类型选择 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">沙箱类型选择</h3>
        <MermaidDiagram chart={sandboxDecisionFlow} title="沙箱类型选择流程" />

        <div className="mt-4">
          <CodeBlock code={sandboxTypeCode} language="typescript" title="沙箱类型检测" />
        </div>

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-400 mb-2">环境变量配置</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left p-2">GEMINI_SANDBOX</th>
                <th className="text-left p-2">效果</th>
                <th className="text-left p-2">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">docker</code></td>
                <td className="p-2">Docker 容器沙箱</td>
                <td className="p-2">需要安装 Docker</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">podman</code></td>
                <td className="p-2">Podman 容器沙箱</td>
                <td className="p-2">Docker 的无守护进程替代</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-green-400">true</code></td>
                <td className="p-2">自动选择</td>
                <td className="p-2">macOS 用 Seatbelt，其他用 Docker</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2"><code className="text-gray-400">未设置/false</code></td>
                <td className="p-2">无沙箱</td>
                <td className="p-2">直接在宿主机执行命令</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 容器沙箱 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">Docker/Podman 容器沙箱</h3>
        <MermaidDiagram chart={containerStartupFlow} title="容器启动流程" />

        <div className="mt-4">
          <CodeBlock code={dockerConfigCode} language="typescript" title="容器配置" />
        </div>

        <HighlightBox title="容器沙箱特点" color="blue" className="mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-blue-300 mb-1">优势</h5>
              <ul className="space-y-1">
                <li>• 完整的进程和文件系统隔离</li>
                <li>• 可自定义开发环境</li>
                <li>• 支持复杂的网络配置</li>
                <li>• 跨平台一致性</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-blue-300 mb-1">注意事项</h5>
              <ul className="space-y-1">
                <li>• 需要安装 Docker/Podman</li>
                <li>• 首次启动较慢（构建镜像）</li>
                <li>• 占用更多系统资源</li>
                <li>• 需要正确配置 UID 映射</li>
              </ul>
            </div>
          </div>
        </HighlightBox>
      </section>

      {/* macOS Seatbelt */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">macOS Seatbelt 沙箱</h3>
        <CodeBlock code={seatbeltCode} language="typescript" title="Seatbelt 实现" />

        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-green-400 mb-2">Seatbelt 配置文件级别</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="bg-green-900/30 rounded p-2">
                <span className="font-semibold text-green-300">permissive-open</span>
                <p className="text-gray-400 mt-1">最宽松：允许大部分操作，适合开发调试</p>
              </div>
              <div className="bg-yellow-900/30 rounded p-2">
                <span className="font-semibold text-yellow-300">permissive-closed</span>
                <p className="text-gray-400 mt-1">半宽松：限制网络和某些系统调用</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-orange-900/30 rounded p-2">
                <span className="font-semibold text-orange-300">restrictive-open</span>
                <p className="text-gray-400 mt-1">半严格：允许网络但限制文件访问</p>
              </div>
              <div className="bg-red-900/30 rounded p-2">
                <span className="font-semibold text-red-300">restrictive-closed</span>
                <p className="text-gray-400 mt-1">最严格：最大限制，适合不信任的代码</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 自定义沙箱 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">自定义沙箱配置</h3>
        <CodeBlock code={customSandboxCode} language="dockerfile" title="自定义 Dockerfile" />

        <HighlightBox title="自定义沙箱文件" color="yellow" className="mt-4">
          <div className="text-sm space-y-2">
            <p><code className="text-yellow-300">.qwen/sandbox.Dockerfile</code> - 自定义容器镜像</p>
            <p><code className="text-yellow-300">.qwen/sandbox.bashrc</code> - 容器初始化脚本</p>
            <p className="text-gray-400 mt-2">
              当项目根目录存在这些文件时，CLI 会自动使用自定义沙箱配置而不是默认镜像。
            </p>
          </div>
        </HighlightBox>
      </section>

      {/* UID 映射 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">UID/GID 映射机制</h3>
        <CodeBlock code={uidMappingCode} language="typescript" title="用户映射" />
      </section>

      {/* 安全特性 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">安全特性</h3>
        <CodeBlock code={securityFeaturesCode} language="typescript" title="安全配置" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <HighlightBox title="防护的威胁" color="red">
            <ul className="text-sm space-y-1">
              <li>• 恶意文件删除 (rm -rf /)</li>
              <li>• 系统文件篡改</li>
              <li>• 网络攻击和数据泄露</li>
              <li>• Fork 炸弹和资源耗尽</li>
              <li>• 权限提升攻击</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="隔离层级" color="green">
            <ul className="text-sm space-y-1">
              <li>• <strong>L1</strong>: 命令验证和过滤</li>
              <li>• <strong>L2</strong>: 文件系统隔离</li>
              <li>• <strong>L3</strong>: 网络隔离</li>
              <li>• <strong>L4</strong>: 进程隔离</li>
              <li>• <strong>L5</strong>: 资源限制</li>
            </ul>
          </HighlightBox>
        </div>
      </section>

      {/* 架构图 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">沙箱架构概览</h3>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────┐
│                        Qwen CLI                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   Shell Tool                           │  │
│  │  runShellCommand(command, options)                     │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               Sandbox Decision Layer                   │  │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐            │  │
│  │  │ Docker   │  │ Podman    │  │ Seatbelt │            │  │
│  │  │ Handler  │  │ Handler   │  │ Handler  │            │  │
│  │  └────┬─────┘  └─────┬─────┘  └────┬─────┘            │  │
│  └───────┼──────────────┼─────────────┼──────────────────┘  │
│          │              │             │                      │
└──────────┼──────────────┼─────────────┼──────────────────────┘
           │              │             │
           ▼              ▼             ▼
┌──────────────────┐ ┌─────────────┐ ┌──────────────────┐
│  Docker Engine   │ │   Podman    │ │  macOS Sandbox   │
│  ┌────────────┐  │ │             │ │  (sandbox-exec)  │
│  │ Container  │  │ │ Rootless   │ │                  │
│  │ ┌────────┐ │  │ │ Container  │ │  .sb Profile     │
│  │ │Workdir │ │  │ │             │ │  ├─ deny default│
│  │ │ Mount  │ │  │ │ UID/GID    │ │  ├─ allow read  │
│  │ └────────┘ │  │ │ Mapping    │ │  └─ deny network│
│  └────────────┘  │ │             │ │                  │
└──────────────────┘ └─────────────┘ └──────────────────┘
           │              │             │
           └──────────────┴─────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Isolated Command    │
              │      Execution        │
              │                       │
              │  stdout/stderr ──────►│──► Result
              └───────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* 最佳实践 */}
      <section>
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">最佳实践</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">推荐做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 生产环境始终启用沙箱</li>
              <li>✓ 使用自定义 Dockerfile 控制环境</li>
              <li>✓ 配置适当的资源限制</li>
              <li>✓ 定期更新沙箱镜像</li>
              <li>✓ 禁用不必要的网络访问</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">避免做法</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✗ 在沙箱中运行特权容器</li>
              <li>✗ 挂载敏感目录到容器</li>
              <li>✗ 使用过时的沙箱镜像</li>
              <li>✗ 禁用所有安全检查</li>
              <li>✗ 在不信任环境中禁用沙箱</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
