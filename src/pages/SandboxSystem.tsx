import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { JsonBlock } from '../components/JsonBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
 { id: 'approval-mode', label: '审批模式', description: '沙箱与审批模式的协同' },
 { id: 'trusted-folders', label: '信任机制', description: '文件系统访问控制' },
 { id: 'shell-modes', label: 'Shell模式', description: '命令执行上下文' },
 { id: 'error', label: '错误处理', description: '沙箱执行错误处理' },
 { id: 'checkpointing', label: '检查点恢复', description: '沙箱操作的回滚' },
 { id: 'design-tradeoffs', label: '设计权衡', description: '沙箱架构决策' },
];

function Introduction({
 isExpanded,
 onToggle,
}: {
 isExpanded: boolean;
 onToggle: () => void;
}) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">📦</span>
 <span className="text-xl font-bold text-heading">
 沙箱系统导读
 </span>
 </div>
 <span
 className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}
 >
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 🎯 为什么需要沙箱？
 </h4>
 <p className="text-body text-sm">
 AI 可能执行<strong>危险命令</strong>（如 rm -rf、格式化磁盘）。
 沙箱通过<strong>隔离执行环境</strong>，限制命令能访问的文件和系统资源，
 保护用户的主机系统。
 </p>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-[var(--color-warning)] font-bold mb-2">
 🔧 沙箱类型
 </h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">Docker</div>
 <div className="text-[10px] text-dim">容器隔离</div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">Podman</div>
 <div className="text-[10px] text-dim">无守护进程</div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-[var(--color-warning)]">Seatbelt</div>
 <div className="text-[10px] text-dim">macOS 原生</div>
 </div>
 <div className="bg-surface p-2 rounded text-center">
 <div className="text-xs text-heading">None</div>
 <div className="text-[10px] text-dim">无沙箱</div>
 </div>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">
 🏗️ 沙箱策略
 </h4>
 <ul className="text-body text-sm space-y-1">
 <li>• <strong>permissive-open</strong> - 宽松模式，允许大多数操作</li>
 <li>• <strong>restrictive-closed</strong> - 严格模式，只读访问</li>
 <li>• <strong>自定义 Dockerfile</strong> - 项目专用沙箱环境</li>
 </ul>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">📊 关键配置</h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="text-center">
 <div className="text-xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">沙箱类型</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">Seatbelt 策略</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-[var(--color-warning)]">ENV</div>
 <div className="text-xs text-dim">GEMINI_SANDBOX</div>
 </div>
 <div className="text-center">
 <div className="text-xl font-bold text-heading">UID</div>
 <div className="text-xs text-dim">权限映射</div>
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

 style start stroke:#22d3ee
 style no_sandbox stroke:#22c55e
 style is_docker stroke:#f59e0b
 style is_podman stroke:#f59e0b
 style is_true stroke:#f59e0b
 style is_macos stroke:#f59e0b
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

 style start stroke:#22d3ee
 style return_result stroke:#22c55e
 style check_running stroke:#f59e0b
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
 image: string; // 默认: ghcr.io/google/generative-ai-cli:{version}
 dockerfile?: string; // 自定义: .gemini/sandbox.Dockerfile

 // 挂载配置
 workdir: string; // 工作目录挂载
 readOnly: boolean; // 是否只读挂载

 // 用户配置
 uid: number; // 宿主机 UID
 gid: number; // 宿主机 GID

 // 资源限制
 memory?: string; // 内存限制 (如 "2g")
 cpus?: number; // CPU 核心数

 // 网络配置
 network: 'none' | 'host' | 'bridge';
}

// 容器启动命令
const dockerRunArgs = [
 'run',
 '--rm', // 退出后删除容器
 '-d', // 后台运行
 '--name', containerName, // 容器名称
 '-v', \`\${workdir}:/workspace\`, // 挂载工作目录
 '-w', '/workspace', // 设置工作目录
 '-u', \`\${uid}:\${gid}\`, // 用户映射
 '--network', 'none', // 默认无网络
 image,
 'sleep', 'infinity' // 保持容器运行
];`;

 const seatbeltCode = `// macOS Seatbelt (sandbox-exec) 配置
// packages/cli/src/utils/sandbox.ts

export type SeatbeltProfile =
 | 'permissive-open' // 宽松模式：允许大部分操作
 | 'permissive-closed' // 半宽松：限制网络和某些系统调用
 | 'restrictive-open' // 半严格：允许网络但限制文件访问
 | 'restrictive-closed'; // 严格模式：最大限制

// Seatbelt 执行命令
function executeSeatbelt(
 command: string,
 profile: SeatbeltProfile = 'permissive-closed'
): Promise<ExecutionResult> {
 const profilePath = getProfilePath(profile);

 // sandbox-exec 是 macOS 内置的沙箱工具
 return spawn('sandbox-exec', [
 '-f', profilePath, // 沙箱配置文件
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
// .gemini/sandbox.Dockerfile

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

# .gemini/sandbox.bashrc
# 容器启动时执行的初始化脚本
export PATH="$PATH:/workspace/node_modules/.bin"
alias ll='ls -la'

# 项目检测到这些文件时会使用自定义沙箱
// packages/cli/src/utils/sandbox.ts
function getCustomDockerfile(): string | null {
 const customPath = path.join(process.cwd(), '.gemini', 'sandbox.Dockerfile');
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
 readOnly: boolean; // 只读模式
 allowedPaths: string[]; // 允许访问的路径
 deniedPaths: string[]; // 禁止访问的路径
 };

 // 网络隔离
 network: {
 enabled: boolean; // 是否允许网络
 allowedHosts?: string[]; // 允许的主机
 allowedPorts?: number[]; // 允许的端口
 };

 // 进程隔离
 process: {
 maxProcesses: number; // 最大进程数
 allowFork: boolean; // 是否允许 fork
 allowExec: boolean; // 是否允许 exec
 };

 // 资源限制
 resources: {
 maxMemory: string; // 最大内存
 maxCpu: number; // 最大 CPU
 timeout: number; // 执行超时 (ms)
 };
}

// 验证命令安全性
function validateCommand(command: string): boolean {
 const dangerousPatterns = [
 /rm\\s+-rf\\s+\\/(?!\\s)/, // rm -rf /
 /mkfs/, // 格式化磁盘
 /dd\\s+if=/, // 低级磁盘操作
 /:(){ :|:& };:/, // Fork 炸弹
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
 '-u', \`\${uid}:\${gid}\`, // 用户映射
 ...otherArgs
 ]);

 // 这样容器内创建的文件，宿主机也有正确的所有权
}

/*
为什么需要 UID 映射？
┌─────────────────────────────────────────────────────┐
│ 宿主机 (UID: 501) │
│ └── project/ │
│ └── src/ (owner: 501) │
└─────────────────────────────────────────────────────┘
 │ 挂载
 ▼
┌─────────────────────────────────────────────────────┐
│ 容器 (运行用户: root/1000) │
│ └── /workspace/ │
│ └── src/ (owner: ???) │
│ │
│ 如果不映射 UID: │
│ - 容器创建的文件宿主机无法访问 │
│ - 权限错误导致 git 操作失败 │
│ │
│ 映射 UID 后 (-u 501:501): │
│ - 容器以宿主机用户身份运行 │
│ - 文件权限完全一致 │
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
 <h2 className="text-2xl font-bold text-heading mb-4">沙箱安全系统</h2>
 <p className="text-body mb-4">
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
 <h3 className="text-xl font-semibold text-heading mb-4">沙箱类型选择</h3>
 <MermaidDiagram chart={sandboxDecisionFlow} title="沙箱类型选择流程" />

 <div className="mt-4">
 <CodeBlock code={sandboxTypeCode} language="typescript" title="沙箱类型检测" />
 </div>

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-[var(--color-warning)] mb-2">环境变量配置</h4>
 <table className="w-full text-sm">
 <thead>
 <tr className="text-body">
 <th className="text-left p-2">GEMINI_SANDBOX</th>
 <th className="text-left p-2">效果</th>
 <th className="text-left p-2">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border-t border-edge">
 <td className="p-2"><code className="text-[var(--color-success)]">docker</code></td>
 <td className="p-2">Docker 容器沙箱</td>
 <td className="p-2">需要安装 Docker</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code className="text-[var(--color-success)]">podman</code></td>
 <td className="p-2">Podman 容器沙箱</td>
 <td className="p-2">Docker 的无守护进程替代</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code className="text-[var(--color-success)]">true</code></td>
 <td className="p-2">自动选择</td>
 <td className="p-2">macOS 用 Seatbelt，其他用 Docker</td>
 </tr>
 <tr className="border-t border-edge">
 <td className="p-2"><code className="text-body">未设置/false</code></td>
 <td className="p-2">无沙箱</td>
 <td className="p-2">直接在宿主机执行命令</td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 {/* 容器沙箱 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">Docker/Podman 容器沙箱</h3>
 <MermaidDiagram chart={containerStartupFlow} title="容器启动流程" />

 <div className="mt-4">
 <CodeBlock code={dockerConfigCode} language="typescript" title="容器配置" />
 </div>

 <HighlightBox title="容器沙箱特点" color="blue" className="mt-4">
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <h5 className="font-semibold text-heading mb-1">优势</h5>
 <ul className="space-y-1">
 <li>• 完整的进程和文件系统隔离</li>
 <li>• 可自定义开发环境</li>
 <li>• 支持复杂的网络配置</li>
 <li>• 跨平台一致性</li>
 </ul>
 </div>
 <div>
 <h5 className="font-semibold text-heading mb-1">注意事项</h5>
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
 <h3 className="text-xl font-semibold text-heading mb-4">macOS Seatbelt 沙箱</h3>
 <CodeBlock code={seatbeltCode} language="typescript" title="Seatbelt 实现" />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-[var(--color-success)] mb-2">Seatbelt 配置文件级别</h4>
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div className="space-y-2">
 <div className="bg-green-900/30 rounded p-2">
 <span className="font-semibold text-[var(--color-success)]">permissive-open</span>
 <p className="text-body mt-1">最宽松：允许大部分操作，适合开发调试</p>
 </div>
 <div className="bg-yellow-900/30 rounded p-2">
 <span className="font-semibold text-[var(--color-warning)]">permissive-closed</span>
 <p className="text-body mt-1">半宽松：限制网络和某些系统调用</p>
 </div>
 </div>
 <div className="space-y-2">
 <div className="bg-orange-900/30 rounded p-2">
 <span className="font-semibold text-heading">restrictive-open</span>
 <p className="text-body mt-1">半严格：允许网络但限制文件访问</p>
 </div>
 <div className="bg-red-900/30 rounded p-2">
 <span className="font-semibold text-[var(--color-danger)]">restrictive-closed</span>
 <p className="text-body mt-1">最严格：最大限制，适合不信任的代码</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* 自定义沙箱 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">自定义沙箱配置</h3>
 <CodeBlock code={customSandboxCode} language="dockerfile" title="自定义 Dockerfile" />

 <HighlightBox title="自定义沙箱文件" color="yellow" className="mt-4">
 <div className="text-sm space-y-2">
 <p><code className="text-[var(--color-warning)]">.gemini/sandbox.Dockerfile</code> - 自定义容器镜像</p>
 <p><code className="text-[var(--color-warning)]">.gemini/sandbox.bashrc</code> - 容器初始化脚本</p>
 <p className="text-body mt-2">
 当项目根目录存在这些文件时，CLI 会自动使用自定义沙箱配置而不是默认镜像。
 </p>
 </div>
 </HighlightBox>
 </section>

 {/* UID 映射 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">UID/GID 映射机制</h3>
 <CodeBlock code={uidMappingCode} language="typescript" title="用户映射" />
 </section>

 {/* 安全特性 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">安全特性</h3>
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
 <h3 className="text-xl font-semibold text-heading mb-4">沙箱架构概览</h3>
 <div className="bg-surface rounded-lg p-6">
 <pre className="text-sm text-body overflow-x-auto">
{`┌──────────────────────────────────────────────────────────────┐
│ Gemini CLI │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Shell Tool │ │
│ │ runShellCommand(command, options) │ │
│ └───────────────────────┬────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Sandbox Decision Layer │ │
│ │ ┌──────────┐ ┌───────────┐ ┌──────────┐ │ │
│ │ │ Docker │ │ Podman │ │ Seatbelt │ │ │
│ │ │ Handler │ │ Handler │ │ Handler │ │ │
│ │ └────┬─────┘ └─────┬─────┘ └────┬─────┘ │ │
│ └───────┼──────────────┼─────────────┼──────────────────┘ │
│ │ │ │ │
└──────────┼──────────────┼─────────────┼──────────────────────┘
 │ │ │
 ▼ ▼ ▼
┌──────────────────┐ ┌─────────────┐ ┌──────────────────┐
│ Docker Engine │ │ Podman │ │ macOS Sandbox │
│ ┌────────────┐ │ │ │ │ (sandbox-exec) │
│ │ Container │ │ │ Rootless │ │ │
│ │ ┌────────┐ │ │ │ Container │ │ .sb Profile │
│ │ │Workdir │ │ │ │ │ │ ├─ deny default│
│ │ │ Mount │ │ │ │ UID/GID │ │ ├─ allow read │
│ │ └────────┘ │ │ │ Mapping │ │ └─ deny network│
│ └────────────┘ │ │ │ │ │
└──────────────────┘ └─────────────┘ └──────────────────┘
 │ │ │
 └──────────────┴─────────────┘
 │
 ▼
 ┌───────────────────────┐
 │ Isolated Command │
 │ Execution │
 │ │
 │ stdout/stderr ──────►│──► Result
 └───────────────────────┘`}
 </pre>
 </div>
 </section>

 {/* 最佳实践 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">最佳实践</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-[var(--color-success-soft)] border border-[var(--color-success)] rounded-lg p-4">
 <h4 className="text-[var(--color-success)] font-semibold mb-2">推荐做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>✓ 生产环境始终启用沙箱</li>
 <li>✓ 使用自定义 Dockerfile 控制环境</li>
 <li>✓ 配置适当的资源限制</li>
 <li>✓ 定期更新沙箱镜像</li>
 <li>✓ 禁用不必要的网络访问</li>
 </ul>
 </div>
 <div className="bg-[var(--color-danger-soft)] border border-[var(--color-danger)] rounded-lg p-4">
 <h4 className="text-[var(--color-danger)] font-semibold mb-2">避免做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>✗ 在沙箱中运行特权容器</li>
 <li>✗ 挂载敏感目录到容器</li>
 <li>✗ 使用过时的沙箱镜像</li>
 <li>✗ 禁用所有安全检查</li>
 <li>✗ 在不信任环境中禁用沙箱</li>
 </ul>
 </div>
 </div>
 </section>

 {/* ==================== 深化内容 ==================== */}

 {/* 边界条件深度解析 */}
 <Layer title="边界条件深度解析" icon="🔬">
 <p className="text-body mb-4">
 沙箱系统作为安全边界，必须正确处理各种边界情况。以下是六个关键边界场景的详细分析：
 </p>

 {/* 边界 1: Docker 不可用 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-red-500 mb-2">边界 1: Docker/Podman 不可用时的降级策略</h4>
 <p className="text-body text-sm mb-3">
 当用户配置了容器沙箱但 Docker/Podman 未安装或未运行时，系统必须安全地处理这种情况。
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-red-500 font-bold mb-2">失败场景</div>
 <ul className="text-xs text-body space-y-1">
 <li>• Docker Desktop 未启动</li>
 <li>• docker.sock 权限不足</li>
 <li>• 磁盘空间不足无法创建容器</li>
 <li>• 镜像拉取失败 (网络问题)</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">处理策略</div>
 <ul className="text-xs text-body space-y-1">
 <li>✓ 检测 Docker 可用性再执行</li>
 <li>✓ 提示用户启动 Docker</li>
 <li>✓ macOS 自动降级到 Seatbelt</li>
 <li>✓ 拒绝执行而非无沙箱执行</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`// packages/cli/src/utils/sandbox.ts
async function ensureSandboxAvailable(
 type: SandboxType
): Promise<{ available: boolean; fallback?: SandboxType; error?: string }> {

 if (type === 'docker') {
 try {
 // 检查 Docker 是否可用
 await exec('docker', ['info'], { timeout: 5000 });
 return { available: true };
 } catch (error) {
 // macOS 可以降级到 Seatbelt
 if (process.platform === 'darwin') {
 return {
 available: false,
 fallback: 'seatbelt',
 error: 'Docker not available, falling back to Seatbelt',
 };
 }

 // 其他平台: 拒绝执行
 return {
 available: false,
 error: 'Docker is required but not available. Please start Docker.',
 };
 }
 }

 if (type === 'seatbelt') {
 // Seatbelt 是 macOS 内置的，总是可用
 if (process.platform !== 'darwin') {
 return {
 available: false,
 error: 'Seatbelt is only available on macOS',
 };
 }
 return { available: true };
 }

 return { available: true }; // 'none' 总是可用
}

// 使用示例:
const { available, fallback, error } = await ensureSandboxAvailable(sandboxType);
if (!available) {
 if (fallback) {
 console.warn(\`[sandbox] \${error}\`);
 sandboxType = fallback;
 } else {
 throw new SandboxUnavailableError(error);
 }
}`} />
 </div>

 {/* 边界 2: 容器启动超时 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-[var(--color-warning)] mb-2">边界 2: 容器启动超时与健康检查</h4>
 <p className="text-body text-sm mb-3">
 容器首次启动需要构建镜像，可能耗时较长。系统需要区分正常启动和启动失败。
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-[var(--color-warning)] font-bold mb-2">超时场景</div>
 <ul className="text-xs text-body space-y-1">
 <li>• 首次拉取基础镜像 (可能 10+ 分钟)</li>
 <li>• 自定义 Dockerfile 构建</li>
 <li>• 容器内 npm install 等初始化</li>
 <li>• 网络缓慢导致依赖下载超时</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">处理策略</div>
 <ul className="text-xs text-body space-y-1">
 <li>✓ 分阶段超时: 构建 10min, 启动 30s</li>
 <li>✓ 进度反馈: 显示构建日志</li>
 <li>✓ 健康检查: 确认容器就绪</li>
 <li>✓ 重试机制: 自动重试 2 次</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`// 容器启动超时处理
interface ContainerStartupConfig {
 buildTimeout: number; // 镜像构建超时 (默认 600s)
 startTimeout: number; // 容器启动超时 (默认 30s)
 healthCheckInterval: number; // 健康检查间隔 (默认 1s)
 maxRetries: number; // 最大重试次数 (默认 2)
}

async function startContainerWithRetry(
 config: DockerSandboxConfig,
 startup: ContainerStartupConfig
): Promise<ContainerId> {
 let lastError: Error | undefined;

 for (let attempt = 0; attempt <= startup.maxRetries; attempt++) {
 try {
 // 1. 构建镜像 (如果需要)
 if (config.dockerfile) {
 await buildImage(config.dockerfile, {
 timeout: startup.buildTimeout * 1000,
 onProgress: (line) => console.log(\`[build] \${line}\`),
 });
 }

 // 2. 创建并启动容器
 const containerId = await createContainer(config);
 await startContainer(containerId, {
 timeout: startup.startTimeout * 1000,
 });

 // 3. 健康检查
 await waitForHealthy(containerId, {
 interval: startup.healthCheckInterval * 1000,
 timeout: startup.startTimeout * 1000,
 });

 return containerId;

 } catch (error) {
 lastError = error;
 console.warn(\`[sandbox] Attempt \${attempt + 1} failed: \${error.message}\`);

 // 清理失败的容器
 await cleanupContainer(containerId).catch(() => {});

 if (attempt < startup.maxRetries) {
 await sleep(2000); // 等待 2 秒后重试
 }
 }
 }

 throw new ContainerStartupError(
 \`Failed to start container after \${startup.maxRetries + 1} attempts\`,
 lastError
 );
}

// 健康检查实现
async function waitForHealthy(
 containerId: string,
 options: { interval: number; timeout: number }
): Promise<void> {
 const startTime = Date.now();

 while (Date.now() - startTime < options.timeout) {
 const status = await getContainerStatus(containerId);

 if (status === 'running') {
 // 验证容器可以执行命令
 try {
 await exec('docker', ['exec', containerId, 'echo', 'ready'], {
 timeout: 5000,
 });
 return; // 健康
 } catch {
 // 继续等待
 }
 }

 await sleep(options.interval);
 }

 throw new Error('Container health check timeout');
}`} />
 </div>

 {/* 边界 3: 挂载路径冲突 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-2">边界 3: 挂载路径与符号链接处理</h4>
 <p className="text-body text-sm mb-3">
 工作目录可能包含符号链接，或者路径中包含特殊字符，沙箱必须正确处理这些情况。
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-[var(--color-warning)] font-bold mb-2">问题场景</div>
 <ul className="text-xs text-body space-y-1">
 <li>• 工作目录是符号链接</li>
 <li>• 路径包含空格: <code>/My Projects/app</code></li>
 <li>• 路径包含 Unicode: <code>/项目/测试</code></li>
 <li>• 相对路径 vs 绝对路径</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">处理策略</div>
 <ul className="text-xs text-body space-y-1">
 <li>✓ 解析符号链接获取真实路径</li>
 <li>✓ 正确转义路径中的特殊字符</li>
 <li>✓ 始终使用绝对路径</li>
 <li>✓ 验证路径存在且可访问</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`// 路径规范化处理
import * as path from 'path';
import * as fs from 'fs';

function normalizeWorkdir(workdir: string): {
 hostPath: string;
 containerPath: string;
 isSymlink: boolean;
} {
 // 1. 转换为绝对路径
 const absolutePath = path.resolve(workdir);

 // 2. 解析符号链接
 let realPath: string;
 let isSymlink = false;
 try {
 realPath = fs.realpathSync(absolutePath);
 isSymlink = realPath !== absolutePath;
 } catch (error) {
 throw new Error(\`Workdir does not exist: \${absolutePath}\`);
 }

 // 3. 验证是目录
 const stat = fs.statSync(realPath);
 if (!stat.isDirectory()) {
 throw new Error(\`Workdir is not a directory: \${realPath}\`);
 }

 // 4. 检查路径中的特殊字符
 if (/[\\x00-\\x1f]/.test(realPath)) {
 throw new Error('Workdir path contains invalid characters');
 }

 return {
 hostPath: realPath,
 containerPath: '/workspace',
 isSymlink,
 };
}

// Docker 挂载时的路径处理
function buildMountArg(hostPath: string, containerPath: string): string {
 // Windows 路径需要特殊处理
 if (process.platform === 'win32') {
 // C:\\Users\\... -> /c/Users/...
 hostPath = hostPath
 .replace(/^([A-Z]):\\\\/, (_, drive) => \`/\${drive.toLowerCase()}/\`)
 .replace(/\\\\/g, '/');
 }

 // 转义路径中的特殊字符
 const escapedHost = hostPath.replace(/"/g, '\\\\"');
 const escapedContainer = containerPath.replace(/"/g, '\\\\"');

 return \`"\${escapedHost}":"\${escapedContainer}"\`;
}

// 使用示例:
const { hostPath, containerPath, isSymlink } = normalizeWorkdir(process.cwd());
if (isSymlink) {
 console.log(\`[sandbox] Workdir is a symlink, using real path: \${hostPath}\`);
}

const mountArg = buildMountArg(hostPath, containerPath);
// 结果: "-v /Users/dev/project:/workspace"`} />
 </div>

 {/* 边界 4: Seatbelt 权限冲突 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-2">边界 4: Seatbelt 配置与系统权限冲突</h4>
 <p className="text-body text-sm mb-3">
 Seatbelt 沙箱可能与 macOS 的某些系统功能冲突，如 Keychain 访问、通知推送等。
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-red-500 font-bold mb-2">常见冲突</div>
 <ul className="text-xs text-body space-y-1">
 <li>• git credential helper 无法访问 Keychain</li>
 <li>• npm login 需要网络但被禁止</li>
 <li>• 某些 CLI 工具依赖 /tmp 目录</li>
 <li>• 代码签名验证失败</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">解决方案</div>
 <ul className="text-xs text-body space-y-1">
 <li>✓ 动态调整沙箱配置</li>
 <li>✓ 预检测命令所需权限</li>
 <li>✓ 提供配置文件级别选择</li>
 <li>✓ 允许用户自定义规则</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`// Seatbelt 动态配置
// packages/cli/src/sandbox/seatbelt-profiles.ts

// 根据命令类型选择合适的配置
function selectSeatbeltProfile(command: string): SeatbeltProfile {
 // 需要网络的命令
 const networkCommands = [
 /^npm\\s+(install|publish|login)/,
 /^yarn\\s+(add|install)/,
 /^git\\s+(clone|fetch|push|pull)/,
 /^curl|wget|http/,
 ];

 // 需要 Keychain 的命令
 const keychainCommands = [
 /^git\\s+(push|pull|fetch)/, // credential helper
 /^npm\\s+login/,
 /^security\\s/,
 ];

 // 检查命令需求
 const needsNetwork = networkCommands.some(p => p.test(command));
 const needsKeychain = keychainCommands.some(p => p.test(command));

 if (needsKeychain) {
 // 需要 Keychain 时使用最宽松配置
 return 'permissive-open';
 }

 if (needsNetwork) {
 // 需要网络但不需要 Keychain
 return 'restrictive-open';
 }

 // 默认使用半宽松配置
 return 'permissive-closed';
}

// 生成动态沙箱配置
function generateSeatbeltProfile(
 baseProfile: SeatbeltProfile,
 customRules: string[]
): string {
 const baseRules = loadBaseProfile(baseProfile);

 return \`
(version 1)
\${baseRules}

; Custom rules
\${customRules.join('\\n')}
\`;
}

// 使用示例:
const profile = selectSeatbeltProfile('git push origin main');
// 返回: 'permissive-open' (因为需要 Keychain 访问 credential helper)`} />
 </div>

 {/* 边界 5: 资源限制边界 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-2">边界 5: 资源限制与 OOM 处理</h4>
 <p className="text-body text-sm mb-3">
 容器内存限制可能导致进程被 OOM Killer 终止，系统需要正确识别并报告这种情况。
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-[var(--color-warning)] font-bold mb-2">资源问题</div>
 <ul className="text-xs text-body space-y-1">
 <li>• 内存不足导致 OOM Kill</li>
 <li>• CPU 限制导致命令超时</li>
 <li>• 磁盘空间用尽</li>
 <li>• 进程数超限</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">检测与恢复</div>
 <ul className="text-xs text-body space-y-1">
 <li>✓ 检测 exit code 137 (OOM)</li>
 <li>✓ 监控容器资源使用</li>
 <li>✓ 自动清理临时文件</li>
 <li>✓ 动态调整资源限制</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`// 资源限制与 OOM 处理
interface ResourceLimits {
 memory: string; // "2g", "512m"
 memorySwap: string; // 总内存+swap
 cpus: number; // CPU 核心数
 pids: number; // 最大进程数
}

const DEFAULT_LIMITS: ResourceLimits = {
 memory: '2g',
 memorySwap: '4g',
 cpus: 2,
 pids: 100,
};

// 执行命令并检测资源问题
async function executeInContainer(
 containerId: string,
 command: string,
 limits: ResourceLimits
): Promise<ExecutionResult> {
 const result = await exec('docker', [
 'exec',
 '--memory', limits.memory,
 '--cpus', limits.cpus.toString(),
 '--pids-limit', limits.pids.toString(),
 containerId,
 '/bin/bash', '-c', command,
 ]);

 // 检测 OOM Kill
 if (result.exitCode === 137) {
 // 获取容器内存统计
 const stats = await getContainerStats(containerId);

 throw new ResourceExhaustedError({
 type: 'oom',
 message: 'Command was killed due to out of memory',
 memoryUsed: stats.memoryUsage,
 memoryLimit: limits.memory,
 suggestion: 'Try increasing memory limit or optimizing the command',
 });
 }

 // 检测磁盘空间问题
 if (result.stderr?.includes('No space left on device')) {
 await cleanupContainerDisk(containerId);

 throw new ResourceExhaustedError({
 type: 'disk',
 message: 'Disk space exhausted in container',
 suggestion: 'Temporary files have been cleaned up, please retry',
 });
 }

 return result;
}

// 监控容器资源使用
async function monitorContainerResources(containerId: string): Promise<void> {
 const interval = setInterval(async () => {
 const stats = await getContainerStats(containerId);

 // 内存使用超过 80% 时警告
 if (stats.memoryPercent > 80) {
 console.warn(\`[sandbox] High memory usage: \${stats.memoryPercent}%\`);
 }

 // CPU 使用持续超过 90% 时警告
 if (stats.cpuPercent > 90) {
 console.warn(\`[sandbox] High CPU usage: \${stats.cpuPercent}%\`);
 }
 }, 5000); // 每 5 秒检查一次

 // 返回清理函数
 return () => clearInterval(interval);
}`} />
 </div>

 {/* 边界 6: 容器残留清理 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge">
 <h4 className="text-sm font-bold text-heading mb-2">边界 6: 容器残留与异常退出清理</h4>
 <p className="text-body text-sm mb-3">
 CLI 意外退出 (Ctrl+C、崩溃) 可能留下孤立容器，需要自动清理机制。
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-[var(--color-warning)] font-bold mb-2">残留场景</div>
 <ul className="text-xs text-body space-y-1">
 <li>• 用户按 Ctrl+C 中断</li>
 <li>• CLI 进程崩溃</li>
 <li>• 系统重启</li>
 <li>• Docker daemon 重启</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">清理策略</div>
 <ul className="text-xs text-body space-y-1">
 <li>✓ 注册 SIGINT/SIGTERM 处理器</li>
 <li>✓ 使用 --rm 自动删除</li>
 <li>✓ 启动时清理旧容器</li>
 <li>✓ 容器命名包含时间戳</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`// 容器生命周期管理
const CONTAINER_PREFIX = 'gemini-sandbox';

// 生成唯一容器名
function generateContainerName(): string {
 const timestamp = Date.now();
 const random = Math.random().toString(36).substring(2, 8);
 return \`\${CONTAINER_PREFIX}-\${timestamp}-\${random}\`;
}

// 清理旧容器
async function cleanupStaleContainers(): Promise<void> {
 try {
 // 查找所有以 gemini-sandbox 开头的容器
 const result = await exec('docker', [
 'ps', '-a',
 '--filter', \`name=\${CONTAINER_PREFIX}\`,
 '--format', '{{.ID}}:{{.CreatedAt}}:{{.State}}',
 ]);

 const containers = result.stdout.trim().split('\\n').filter(Boolean);

 for (const line of containers) {
 const [id, createdAt, state] = line.split(':');

 // 删除超过 24 小时的非运行容器
 const age = Date.now() - new Date(createdAt).getTime();
 const isOld = age > 24 * 60 * 60 * 1000;

 if (isOld || state === 'exited') {
 console.log(\`[sandbox] Cleaning up stale container: \${id}\`);
 await exec('docker', ['rm', '-f', id]).catch(() => {});
 }
 }
 } catch (error) {
 // Docker 不可用时忽略
 console.debug('[sandbox] Could not clean up containers:', error.message);
 }
}

// 注册退出处理器
function registerCleanupHandler(containerId: string): void {
 const cleanup = async () => {
 console.log('\\n[sandbox] Cleaning up container...');
 try {
 await exec('docker', ['stop', '-t', '5', containerId]);
 await exec('docker', ['rm', '-f', containerId]);
 } catch {
 // 忽略清理失败
 }
 process.exit(0);
 };

 // 处理各种退出信号
 process.on('SIGINT', cleanup);
 process.on('SIGTERM', cleanup);
 process.on('SIGHUP', cleanup);

 // 处理未捕获异常
 process.on('uncaughtException', async (error) => {
 console.error('[sandbox] Uncaught exception:', error);
 await cleanup();
 });

 // 正常退出时也清理
 process.on('exit', () => {
 // 同步清理 (exit 事件中不能用 async)
 try {
 require('child_process').execSync(
 \`docker rm -f \${containerId}\`,
 { stdio: 'ignore' }
 );
 } catch {
 // 忽略
 }
 });
}`} />
 </div>
 </Layer>

 {/* 常见问题与调试技巧 */}
 <Layer title="常见问题与调试技巧" icon="🐛">
 <p className="text-body mb-4">
 沙箱系统涉及容器、权限、路径等多个复杂层面，以下是常见问题及其诊断方法：
 </p>

 {/* 问题 1 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-red-500 mb-2">问题 1: 容器内文件权限错误</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-[var(--color-warning)] font-bold mb-2">症状</div>
 <ul className="text-xs text-body space-y-1">
 <li>• 容器内无法写入文件</li>
 <li>• git 报告 "dubious ownership"</li>
 <li>• npm install 创建的文件宿主机无法删除</li>
 <li>• Permission denied 错误</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">原因分析</div>
 <ul className="text-xs text-body space-y-1">
 <li>• UID/GID 映射不正确</li>
 <li>• 容器以 root 用户运行</li>
 <li>• 挂载目录权限不足</li>
 <li>• SELinux/AppArmor 限制</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`# 调试步骤:

# 1. 检查宿主机当前用户的 UID/GID
id
# 输出: uid=501(user) gid=20(staff) ...

# 2. 检查容器内运行用户
docker exec <container> id
# 应该与宿主机一致: uid=501 gid=20

# 3. 检查挂载目录权限
docker exec <container> ls -la /workspace

# 4. 如果 UID 不匹配，手动指定
docker run -u $(id -u):$(id -g) ...

# 5. 检查 git safe.directory 配置
docker exec <container> git config --global --add safe.directory /workspace

# 6. Linux 特有: 检查 SELinux 标签
ls -laZ /path/to/project
# 如需要，添加 :z 或 :Z 标志到挂载参数
docker run -v /path:/workspace:z ...`} />
 </div>

 {/* 问题 2 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-[var(--color-warning)] mb-2">问题 2: Seatbelt 拒绝合法操作</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-[var(--color-warning)] font-bold mb-2">症状</div>
 <ul className="text-xs text-body space-y-1">
 <li>• 命令返回 "Operation not permitted"</li>
 <li>• git push 失败 (无法访问凭证)</li>
 <li>• 某些目录无法访问</li>
 <li>• 网络请求被拒绝</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">诊断方法</div>
 <ul className="text-xs text-body space-y-1">
 <li>✓ 查看系统日志中的沙箱拒绝</li>
 <li>✓ 尝试更宽松的配置文件</li>
 <li>✓ 检查命令所需的系统调用</li>
 <li>✓ 使用 dtruss 追踪系统调用</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`# 调试 Seatbelt 问题:

# 1. 查看沙箱拒绝日志
log show --predicate 'subsystem == "com.apple.sandbox"' --last 5m

# 2. 详细追踪命令执行
sudo dtruss -f sandbox-exec -f profile.sb /bin/bash -c "git push"

# 3. 尝试不同的配置文件
# permissive-open: 最宽松
# permissive-closed: 限制网络 (默认)
# restrictive-open: 限制文件，允许网络
# restrictive-closed: 最严格

# 4. 临时禁用沙箱进行对比测试
GEMINI_SANDBOX=false gemini "git push"

# 5. 自定义沙箱规则
# 创建 ~/.gemini/sandbox.sb 文件:
(version 1)
(allow default)
(deny network*) ; 仅禁止网络

# 6. 检查 Keychain 访问
security list-keychains
security find-generic-password -s "github.com" -w`} />
 </div>

 {/* 问题 3 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-2">问题 3: 容器启动缓慢或失败</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-[var(--color-warning)] font-bold mb-2">症状</div>
 <ul className="text-xs text-body space-y-1">
 <li>• 首次执行命令等待很长时间</li>
 <li>• "Cannot connect to Docker daemon"</li>
 <li>• 镜像拉取超时</li>
 <li>• 容器一直处于 "Created" 状态</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">解决方案</div>
 <ul className="text-xs text-body space-y-1">
 <li>✓ 预先拉取沙箱镜像</li>
 <li>✓ 检查 Docker Desktop 状态</li>
 <li>✓ 使用国内镜像加速器</li>
 <li>✓ 增加启动超时时间</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`# 诊断容器启动问题:

# 1. 检查 Docker 是否运行
docker info
# 如果报错，启动 Docker Desktop 或 dockerd

# 2. 检查磁盘空间
docker system df
# 清理未使用的资源
docker system prune -f

# 3. 预先拉取沙箱镜像
docker pull ghcr.io/google/generative-ai-cli:latest

# 4. 使用镜像加速器 (中国大陆)
# 编辑 ~/.docker/daemon.json:
{
 "registry-mirrors": [
 "https://mirror.ccs.tencentyun.com",
 "https://docker.mirrors.ustc.edu.cn"
 ]
}

# 5. 手动测试容器启动
docker run --rm -it ghcr.io/google/generative-ai-cli:latest echo "Hello"

# 6. 检查容器日志
docker logs <container_id>

# 7. 增加启动超时
export GEMINI_SANDBOX_TIMEOUT=120 # 秒`} />
 </div>

 {/* 问题 4 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-2">问题 4: 容器内命令找不到</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-[var(--color-warning)] font-bold mb-2">症状</div>
 <ul className="text-xs text-body space-y-1">
 <li>• "command not found: python"</li>
 <li>• node 版本与预期不符</li>
 <li>• 项目依赖的工具未安装</li>
 <li>• PATH 环境变量不正确</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">解决方案</div>
 <ul className="text-xs text-body space-y-1">
 <li>✓ 使用自定义 Dockerfile</li>
 <li>✓ 配置 sandbox.bashrc</li>
 <li>✓ 使用项目级别的 .tool-versions</li>
 <li>✓ 在 Dockerfile 中安装依赖</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`# 解决命令找不到问题:

# 1. 检查容器内可用命令
docker exec <container> which python node npm

# 2. 创建自定义 Dockerfile
# .gemini/sandbox.Dockerfile
FROM ghcr.io/google/generative-ai-cli:latest

# 安装 Python
RUN apt-get update && apt-get install -y python3 python3-pip

# 安装项目需要的 Node 版本
RUN npm install -g n && n 18

# 安装全局工具
RUN npm install -g typescript ts-node

# 3. 创建初始化脚本
# .gemini/sandbox.bashrc
export PATH="$PATH:/workspace/node_modules/.bin"
export PATH="$PATH:$HOME/.local/bin"

# 加载 nvm (如果使用)
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# 4. 重建沙箱镜像
docker build -t gemini-sandbox-custom -f .gemini/sandbox.Dockerfile .

# 5. 使用自定义镜像
# CLI 会自动检测并使用 .gemini/sandbox.Dockerfile`} />
 </div>

 {/* 调试参考表 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge">
 <h4 className="text-sm font-bold text-heading mb-3">调试参考表</h4>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">问题类型</th>
 <th className="text-left py-2 px-3 text-dim">调试命令</th>
 <th className="text-left py-2 px-3 text-dim">检查点</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-red-500">权限错误</td>
 <td className="py-2 px-3"><code>docker exec &lt;id&gt; id</code></td>
 <td className="py-2 px-3">UID/GID 是否与宿主机一致</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-[var(--color-warning)]">Seatbelt 拒绝</td>
 <td className="py-2 px-3"><code>log show --predicate 'subsystem == "com.apple.sandbox"'</code></td>
 <td className="py-2 px-3">查看具体被拒绝的操作</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">容器不启动</td>
 <td className="py-2 px-3"><code>docker logs &lt;id&gt;</code></td>
 <td className="py-2 px-3">检查启动日志和错误</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">命令找不到</td>
 <td className="py-2 px-3"><code>docker exec &lt;id&gt; echo $PATH</code></td>
 <td className="py-2 px-3">检查 PATH 环境变量</td>
 </tr>
 <tr>
 <td className="py-2 px-3 font-mono text-heading">网络问题</td>
 <td className="py-2 px-3"><code>docker inspect &lt;id&gt; | grep NetworkMode</code></td>
 <td className="py-2 px-3">检查网络模式配置</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* 性能优化建议 */}
 <Layer title="性能优化建议" icon="⚡">
 <p className="text-body mb-4">
 沙箱执行会引入额外开销，以下是四个关键优化策略：
 </p>

 {/* 优化 1: 容器复用 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-2">优化 1: 容器复用与持久化</h4>
 <p className="text-body text-sm mb-3">
 每次命令都创建新容器开销很大。复用容器可以显著减少启动时间。
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-red-500 font-bold mb-2">不复用</div>
 <ul className="text-xs text-body space-y-1">
 <li>• 每条命令: 创建 → 启动 → 执行 → 销毁</li>
 <li>• 启动开销: ~2-5 秒/次</li>
 <li>• 无法保留会话状态</li>
 </ul>
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">复用容器</div>
 <ul className="text-xs text-body space-y-1">
 <li>• 首次: 创建 → 启动</li>
 <li>• 后续: docker exec (直接执行)</li>
 <li>• 启动开销: ~50-100ms</li>
 </ul>
 </div>
 </div>
 <JsonBlock code={`// 容器复用池
class ContainerPool {
 private containers: Map<string, ContainerInstance> = new Map();

 async getContainer(projectDir: string): Promise<ContainerInstance> {
 // 使用项目目录作为 key
 const key = this.getProjectKey(projectDir);

 // 检查是否有可复用的容器
 const existing = this.containers.get(key);
 if (existing && await this.isHealthy(existing)) {
 existing.lastUsed = Date.now();
 return existing;
 }

 // 创建新容器
 const container = await this.createContainer(projectDir);
 this.containers.set(key, container);

 // 启动清理定时器
 this.scheduleCleanup();

 return container;
 }

 private scheduleCleanup(): void {
 // 每 5 分钟清理空闲容器
 setInterval(() => {
 const now = Date.now();
 const idleTimeout = 5 * 60 * 1000; // 5 分钟

 for (const [key, container] of this.containers) {
 if (now - container.lastUsed > idleTimeout) {
 this.destroyContainer(container);
 this.containers.delete(key);
 }
 }
 }, 60 * 1000);
 }
}

// 性能对比:
// 场景: 执行 10 条 shell 命令
// 不复用: 10 × 3s = 30s
// 复用: 3s + 9 × 0.1s = 3.9s
// 提升: ~7.7x`} />
 </div>

 {/* 优化 2: 镜像缓存 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-2">优化 2: 镜像层缓存优化</h4>
 <p className="text-body text-sm mb-3">
 合理组织 Dockerfile 可以最大化利用 Docker 的层缓存，加速镜像构建。
 </p>
 <JsonBlock code={`# 优化后的 Dockerfile
# .gemini/sandbox.Dockerfile

# 使用特定版本标签而非 latest
FROM ghcr.io/google/generative-ai-cli:1.0.0

# 1. 首先复制不经常变化的依赖定义
COPY package.json package-lock.json ./

# 2. 安装依赖 (这一层会被缓存)
RUN npm ci --production

# 3. 最后复制经常变化的代码
COPY . .

# 错误示例 (每次代码变化都会重新安装依赖):
# COPY . .
# RUN npm ci

# 构建时使用缓存
docker build \\
 --cache-from ghcr.io/google/generative-ai-cli:latest \\
 -t my-sandbox \\
 -f .gemini/sandbox.Dockerfile .

# 多阶段构建减少镜像大小
FROM node:20 AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /workspace
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules

# 镜像大小对比:
# 单阶段: ~1.2GB
# 多阶段: ~200MB`} />
 </div>

 {/* 优化 3: 选择合适的沙箱类型 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-[var(--color-warning)] mb-2">优化 3: 根据场景选择沙箱类型</h4>
 <p className="text-body text-sm mb-3">
 不同沙箱类型有不同的性能特点，根据实际需求选择最合适的类型。
 </p>
 <div className="overflow-x-auto mb-3">
 <table className="w-full text-xs">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">沙箱类型</th>
 <th className="text-left py-2 px-3 text-dim">启动时间</th>
 <th className="text-left py-2 px-3 text-dim">命令执行</th>
 <th className="text-left py-2 px-3 text-dim">隔离级别</th>
 <th className="text-left py-2 px-3 text-dim">适用场景</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-[var(--color-warning)]">Seatbelt</td>
 <td className="py-2 px-3 text-heading">~10ms</td>
 <td className="py-2 px-3 text-heading">原生速度</td>
 <td className="py-2 px-3">中等</td>
 <td className="py-2 px-3">macOS 日常开发</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">Docker (复用)</td>
 <td className="py-2 px-3 text-heading">~100ms</td>
 <td className="py-2 px-3 text-[var(--color-warning)]">~1.1x 原生</td>
 <td className="py-2 px-3">高</td>
 <td className="py-2 px-3">需要完整隔离</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">Docker (新建)</td>
 <td className="py-2 px-3 text-red-500">~3s</td>
 <td className="py-2 px-3 text-[var(--color-warning)]">~1.1x 原生</td>
 <td className="py-2 px-3">高</td>
 <td className="py-2 px-3">一次性任务</td>
 </tr>
 <tr>
 <td className="py-2 px-3 font-mono text-heading">None</td>
 <td className="py-2 px-3 text-heading">0ms</td>
 <td className="py-2 px-3 text-heading">原生速度</td>
 <td className="py-2 px-3">无</td>
 <td className="py-2 px-3">信任环境/调试</td>
 </tr>
 </tbody>
 </table>
 </div>
 <JsonBlock code={`// 智能沙箱选择
function selectOptimalSandbox(context: ExecutionContext): SandboxType {
 const { command, projectTrust, previousCommands } = context;

 // 1. 信任的项目可以使用轻量沙箱
 if (projectTrust === 'trusted') {
 if (process.platform === 'darwin') {
 return 'seatbelt';
 }
 return 'none'; // Linux 上暂无轻量沙箱
 }

 // 2. 只读命令使用轻量沙箱
 const readOnlyPatterns = [/^ls\\b/, /^cat\\b/, /^grep\\b/, /^find\\b/];
 if (readOnlyPatterns.some(p => p.test(command))) {
 return process.platform === 'darwin' ? 'seatbelt' : 'docker';
 }

 // 3. 需要网络的命令
 const networkPatterns = [/^npm\\s+(install|publish)/, /^git\\s+(clone|push)/];
 if (networkPatterns.some(p => p.test(command))) {
 // 需要网络时 Seatbelt 可能有问题
 return 'docker';
 }

 // 4. 高频命令序列使用容器复用
 if (previousCommands.length > 3) {
 return 'docker'; // 容器复用效率更高
 }

 // 5. 默认: macOS 用 Seatbelt，其他用 Docker
 return process.platform === 'darwin' ? 'seatbelt' : 'docker';
}`} />
 </div>

 {/* 优化 4: 并行执行 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-2">优化 4: 独立命令并行执行</h4>
 <p className="text-body text-sm mb-3">
 当多个命令之间没有依赖时，可以在多个容器中并行执行。
 </p>
 <JsonBlock code={`// 并行沙箱执行
async function executeParallel(
 commands: string[],
 config: SandboxConfig
): Promise<ExecutionResult[]> {
 // 分析命令依赖关系
 const { independent, dependent } = analyzeCommandDependencies(commands);

 // 并行执行独立命令
 const independentResults = await Promise.all(
 independent.map(cmd => executeInSandbox(cmd, config))
 );

 // 顺序执行有依赖的命令
 const dependentResults: ExecutionResult[] = [];
 for (const cmd of dependent) {
 const result = await executeInSandbox(cmd, config);
 dependentResults.push(result);
 }

 return [...independentResults, ...dependentResults];
}

// 命令依赖分析
function analyzeCommandDependencies(commands: string[]): {
 independent: string[];
 dependent: string[];
} {
 const fileOutputs = new Map<string, number>(); // 文件 -> 命令索引
 const independent: string[] = [];
 const dependent: string[] = [];

 for (let i = 0; i < commands.length; i++) {
 const cmd = commands[i];

 // 检测写入的文件
 const outputs = detectOutputFiles(cmd);

 // 检测读取的文件
 const inputs = detectInputFiles(cmd);

 // 如果读取了之前命令的输出，则有依赖
 const hasDependency = inputs.some(f => fileOutputs.has(f));

 if (hasDependency) {
 dependent.push(cmd);
 } else {
 independent.push(cmd);
 }

 // 记录输出文件
 for (const file of outputs) {
 fileOutputs.set(file, i);
 }
 }

 return { independent, dependent };
}

// 使用示例:
const commands = [
 'npm run lint', // 独立
 'npm run typecheck', // 独立
 'npm run test', // 独立
 'npm run build', // 可能依赖前面的结果
];

// 并行执行前 3 个，串行执行最后 1 个
// 总时间: max(lint, typecheck, test) + build
// 而非: lint + typecheck + test + build`} />
 </div>

 {/* 性能基准测试 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge">
 <h4 className="text-sm font-bold text-heading mb-3">性能基准测试</h4>
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">场景</th>
 <th className="text-left py-2 px-3 text-dim">无沙箱</th>
 <th className="text-left py-2 px-3 text-dim">Seatbelt</th>
 <th className="text-left py-2 px-3 text-dim">Docker</th>
 <th className="text-left py-2 px-3 text-dim">Docker (复用)</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/50">
 <td className="py-2 px-3">简单命令 (echo)</td>
 <td className="py-2 px-3 text-heading">5ms</td>
 <td className="py-2 px-3 text-heading">15ms</td>
 <td className="py-2 px-3 text-red-500">3.2s</td>
 <td className="py-2 px-3 text-heading">120ms</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3">npm install</td>
 <td className="py-2 px-3 text-heading">8.5s</td>
 <td className="py-2 px-3 text-heading">8.6s</td>
 <td className="py-2 px-3 text-[var(--color-warning)]">12.1s</td>
 <td className="py-2 px-3 text-[var(--color-warning)]">9.2s</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3">10 条顺序命令</td>
 <td className="py-2 px-3 text-heading">2.1s</td>
 <td className="py-2 px-3 text-heading">2.3s</td>
 <td className="py-2 px-3 text-red-500">35s</td>
 <td className="py-2 px-3 text-heading">3.5s</td>
 </tr>
 <tr>
 <td className="py-2 px-3">5 条并行命令</td>
 <td className="py-2 px-3 text-heading">1.8s</td>
 <td className="py-2 px-3 text-heading">2.0s</td>
 <td className="py-2 px-3 text-[var(--color-warning)]">5.2s</td>
 <td className="py-2 px-3 text-heading">2.5s</td>
 </tr>
 </tbody>
 </table>
 </div>
 <p className="text-xs text-dim mt-3">
 * 测试环境: M1 MacBook Pro, Docker Desktop 4.25, Node.js v20
 </p>
 </div>
 </Layer>

 {/* 与其他模块的交互关系 */}
 <Layer title="与其他模块的交互关系" icon="🔗">
 <p className="text-body mb-4">
 沙箱系统与 Shell 工具、权限系统、配置系统等紧密协作。以下是其依赖关系：
 </p>

 {/* 依赖关系图 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-3">模块依赖关系图</h4>
 <MermaidDiagram chart={`graph TB
 subgraph "工具层"
 Shell[Shell Tool]
 RunShell[run_shell_command]
 end

 subgraph "沙箱系统 (Sandbox)"
 Detector[Sandbox Detector<br/>类型检测]
 Docker[Docker Handler<br/>容器沙箱]
 Seatbelt[Seatbelt Handler<br/>macOS 沙箱]
 Pool[Container Pool<br/>容器复用池]
 end

 subgraph "基础设施"
 Config[Config System]
 Env[Environment Variables]
 FS[File System]
 end

 subgraph "安全层"
 Permission[Permission System]
 Validator[Command Validator]
 end

 %% 工具层调用沙箱
 Shell --> Detector
 RunShell --> Detector

 %% 沙箱类型分发
 Detector --> Docker
 Detector --> Seatbelt
 Detector -->|none| FS

 %% 容器复用
 Docker --> Pool

 %% 配置读取
 Config --> Detector
 Env --> Detector

 %% 安全检查
 Permission --> Shell
 Validator --> Shell

 %% 样式
 classDef sandbox stroke:#4f46e5
 classDef tool stroke:#059669
 classDef infra stroke:#d97706
 classDef security stroke:#dc2626

 class Detector,Docker,Seatbelt,Pool sandbox
 class Shell,RunShell tool
 class Config,Env,FS infra
 class Permission,Validator security`} />
 </div>

 {/* 核心接口 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-3">核心接口定义</h4>
 <JsonBlock code={`// packages/cli/src/utils/sandbox.ts

/**
 * 沙箱类型
 */
export type SandboxType = 'docker' | 'podman' | 'seatbelt' | 'none';

/**
 * 沙箱执行结果
 */
export interface SandboxExecutionResult {
 stdout: string;
 stderr: string;
 exitCode: number;
 duration: number;
 sandboxType: SandboxType;
}

/**
 * 沙箱配置
 */
export interface SandboxConfig {
 type: SandboxType;
 workdir: string;
 timeout: number;
 env?: Record<string, string>;

 // Docker 特有配置
 docker?: {
 image?: string;
 dockerfile?: string;
 network?: 'none' | 'host' | 'bridge';
 memory?: string;
 cpus?: number;
 };

 // Seatbelt 特有配置
 seatbelt?: {
 profile: SeatbeltProfile;
 customRules?: string[];
 };
}

/**
 * 沙箱执行器接口
 */
export interface SandboxExecutor {
 /**
 * 检查沙箱是否可用
 */
 isAvailable(): Promise<boolean>;

 /**
 * 执行命令
 */
 execute(command: string, config: SandboxConfig): Promise<SandboxExecutionResult>;

 /**
 * 清理资源
 */
 cleanup(): Promise<void>;
}

/**
 * 获取沙箱执行器
 */
export function getSandboxExecutor(type: SandboxType): SandboxExecutor {
 switch (type) {
 case 'docker':
 return new DockerExecutor();
 case 'podman':
 return new PodmanExecutor();
 case 'seatbelt':
 return new SeatbeltExecutor();
 case 'none':
 return new DirectExecutor();
 }
}`} />
 </div>

 {/* 数据流 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge mb-4">
 <h4 className="text-sm font-bold text-heading mb-3">命令执行数据流</h4>
 <MermaidDiagram chart={`sequenceDiagram
 participant AI as AI Model
 participant Shell as Shell Tool
 participant Perm as Permission
 participant Sandbox as Sandbox System
 participant Docker as Docker/Seatbelt
 participant FS as File System

 AI->>Shell: execute("npm install")
 Shell->>Perm: checkPermission()
 Perm-->>Shell: allowed

 Shell->>Sandbox: getSandboxType()
 Sandbox-->>Shell: "docker"

 Shell->>Sandbox: execute(command, config)

 alt Docker 沙箱
 Sandbox->>Docker: ensureContainerRunning()
 Docker-->>Sandbox: containerId
 Sandbox->>Docker: docker exec containerId command
 Docker->>FS: 在隔离环境执行
 FS-->>Docker: stdout/stderr
 Docker-->>Sandbox: result
 else Seatbelt 沙箱
 Sandbox->>Docker: sandbox-exec -f profile command
 Docker->>FS: 在沙箱中执行
 FS-->>Docker: stdout/stderr
 Docker-->>Sandbox: result
 else 无沙箱
 Sandbox->>FS: 直接执行
 FS-->>Sandbox: stdout/stderr
 end

 Sandbox-->>Shell: SandboxExecutionResult
 Shell-->>AI: 执行结果`} />
 </div>

 {/* 扩展点 */}
 <div className="bg-elevated rounded-lg p-4 border border-edge">
 <h4 className="text-sm font-bold text-[var(--color-warning)] mb-3">扩展点与自定义</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-base rounded p-3">
 <div className="text-xs text-[var(--color-warning)] font-bold mb-2">自定义沙箱实现</div>
 <JsonBlock code={`// 实现自定义沙箱
class FirejailExecutor implements SandboxExecutor {
 async execute(command: string, config: SandboxConfig) {
 // 使用 Firejail 作为 Linux 沙箱
 return spawn('firejail', [
 '--private',
 '--net=none',
 '/bin/bash', '-c', command,
 ]);
 }
}

// 注册自定义沙箱
registerSandboxExecutor('firejail', FirejailExecutor);`} />
 </div>
 <div className="bg-base rounded p-3">
 <div className="text-xs text-heading font-bold mb-2">项目级配置</div>
 <JsonBlock code={`// .gemini/sandbox.json
{
 "type": "docker",
 "docker": {
 "dockerfile": ".gemini/sandbox.Dockerfile",
 "network": "bridge",
 "memory": "4g",
 "env": {
 "NODE_ENV": "development"
 }
 },
 "seatbelt": {
 "profile": "permissive-open",
 "customRules": [
 "(allow network-outbound)"
 ]
 }
}`} />
 </div>
 </div>
 </div>
 </Layer>

 {/* 为什么这样设计沙箱系统 */}
 <Layer title="为什么这样设计沙箱系统？" icon="💡">
 <div className="space-y-4">
 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🍎 为什么 macOS 优先使用 Seatbelt？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：macOS 上 <code className="bg-base/30 px-1 rounded">GEMINI_SANDBOX=true</code> 默认使用 Seatbelt 而非 Docker。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>零配置</strong>：Seatbelt (sandbox-exec) 是 macOS 内置功能，无需安装任何软件</li>
 <li><strong>轻量级</strong>：进程级隔离，启动开销几乎为零（vs Docker 的容器启动时间）</li>
 <li><strong>原生集成</strong>：与 macOS 权限系统（如钥匙串访问）更好地协同</li>
 </ul>
 <p><strong>权衡</strong>：Seatbelt 的隔离能力不如 Docker 强（共享内核），但对于开发场景足够安全。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🔄 为什么保持容器持久运行？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：Docker/Podman 容器在会话期间保持运行，而非每次命令都重建。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>性能</strong>：容器启动需要 2-5 秒，每次命令都启动会严重影响体验</li>
 <li><strong>状态保持</strong>：允许命令之间保持环境变量、工作目录等状态</li>
 <li><strong>资源复用</strong>：避免重复拉取镜像和创建文件系统</li>
 </ul>
 <p><strong>风险</strong>：容器内的恶意操作可能影响后续命令，通过检查点恢复来缓解。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-[var(--color-warning)] font-bold mb-2">📂 为什么工作目录使用读写挂载？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：项目工作目录默认以读写模式挂载到容器中。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>实用性</strong>：AI 的主要任务是修改代码，只读挂载会使 CLI 无法完成工作</li>
 <li><strong>开发体验</strong>：用户期望 AI 能直接修改项目文件</li>
 <li><strong>检查点保护</strong>：通过 Git 检查点实现文件操作的可回滚</li>
 </ul>
 <p><strong>替代方案</strong>：<code className="bg-base/30 px-1 rounded">restrictive-closed</code> 策略提供只读模式供安全审计场景使用。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-heading font-bold mb-2">🆔 为什么需要 UID/GID 映射？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：容器内用户的 UID/GID 映射为宿主机当前用户。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>权限一致</strong>：容器内创建的文件在宿主机上具有正确的所有权</li>
 <li><strong>避免 root 问题</strong>：防止容器以 root 运行导致创建的文件宿主机无法编辑</li>
 <li><strong>无缝集成</strong>：用户无需手动 chown 文件</li>
 </ul>
 <p><strong>实现</strong>：通过 <code className="bg-base/30 px-1 rounded">--user $(id -u):$(id -g)</code> 传递当前用户身份。</p>
 </div>
 </div>

 <div className="bg-base/50 rounded-lg p-4 ">
 <h4 className="text-red-500 font-bold mb-2">🌐 为什么默认禁用网络？</h4>
 <div className="text-sm text-body space-y-2">
 <p><strong>决策</strong>：<code className="bg-base/30 px-1 rounded">restrictive-closed</code> 策略默认禁用网络访问。</p>
 <p><strong>原因</strong>：</p>
 <ul className="list-disc pl-5 space-y-1">
 <li><strong>数据泄露防护</strong>：防止恶意命令将敏感代码发送到外部服务器</li>
 <li><strong>依赖隔离</strong>：确保构建过程不依赖网络，提高可重复性</li>
 <li><strong>攻击面缩小</strong>：阻止潜在的反向 Shell 等网络攻击</li>
 </ul>
 <p><strong>灵活性</strong>：通过 <code className="bg-base/30 px-1 rounded">permissive-open</code> 或自定义规则可启用网络。</p>
 </div>
 </div>
 </div>
 </Layer>

 {/* 沙箱错误处理速查表 */}
 <Layer title="沙箱错误处理速查表" icon="⚠️">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 px-3 text-dim">错误场景</th>
 <th className="text-left py-2 px-3 text-dim">错误信息</th>
 <th className="text-left py-2 px-3 text-dim">原因</th>
 <th className="text-left py-2 px-3 text-dim">解决方案</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-red-500">Docker 未运行</td>
 <td className="py-2 px-3 text-xs">Cannot connect to Docker daemon</td>
 <td className="py-2 px-3">Docker Desktop 未启动</td>
 <td className="py-2 px-3">启动 Docker Desktop 或设置 GEMINI_SANDBOX=false</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-[var(--color-warning)]">镜像拉取失败</td>
 <td className="py-2 px-3 text-xs">manifest unknown</td>
 <td className="py-2 px-3">网络问题或镜像不存在</td>
 <td className="py-2 px-3">检查网络或使用自定义 Dockerfile</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-[var(--color-warning)]">权限拒绝</td>
 <td className="py-2 px-3 text-xs">Permission denied</td>
 <td className="py-2 px-3">Seatbelt 策略阻止了操作</td>
 <td className="py-2 px-3">切换到 permissive-open 或调整自定义规则</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">挂载失败</td>
 <td className="py-2 px-3 text-xs">Mounts denied</td>
 <td className="py-2 px-3">Docker 文件共享未配置</td>
 <td className="py-2 px-3">在 Docker Desktop 中添加共享目录</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">容器超时</td>
 <td className="py-2 px-3 text-xs">Container start timeout</td>
 <td className="py-2 px-3">资源不足或镜像过大</td>
 <td className="py-2 px-3">增加资源限制或优化 Dockerfile</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="py-2 px-3 font-mono text-heading">Seatbelt 不可用</td>
 <td className="py-2 px-3 text-xs">sandbox-exec not found</td>
 <td className="py-2 px-3">非 macOS 系统</td>
 <td className="py-2 px-3">使用 Docker 或禁用沙箱</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
