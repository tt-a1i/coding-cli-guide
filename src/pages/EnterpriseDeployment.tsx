import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

function Introduction({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--purple)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏢</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">企业部署与离线</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">🎯 核心挑战</h4>
            <p className="text-[var(--text-secondary)] text-sm">
              将面向公网设计的 AI CLI 适配到企业内网环境：
              <strong className="text-[var(--terminal-green)]">网络受限</strong>、
              <strong className="text-[var(--amber)]">依赖可控</strong>、
              <strong className="text-[var(--cyber-blue)]">版本可追溯</strong>、
              <strong className="text-[var(--purple)]">离线可用</strong>。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--terminal-green)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">分发方式</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--amber)]">~70MB</div>
              <div className="text-xs text-[var(--text-muted)]">Portable 体积</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--cyber-blue)]">0</div>
              <div className="text-xs text-[var(--text-muted)]">运行时网络依赖</div>
            </div>
            <div className="bg-[var(--bg-card)] p-3 rounded border border-[var(--border-subtle)]">
              <div className="text-xl font-bold text-[var(--purple)]">2-3min</div>
              <div className="text-xs text-[var(--text-muted)]">构建时间</div>
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-2 rounded flex items-center gap-2">
            <span>📁</span>
            <code>scripts/build-portable.js</code>
            <span className="mx-2">|</span>
            <code>devdocs/DISABLE-AUTO-UPDATE.md</code>
          </div>
        </div>
      )}
    </div>
  );
}

const relatedPages: RelatedPage[] = [
  { id: 'auth', label: '认证流程', description: 'OAuth 与 Token 管理机制' },
  { id: 'google-authentication', label: 'Google OAuth 认证', description: 'Loopback 回调与 NO_BROWSER/PKCE' },
  { id: 'config', label: '配置系统', description: '环境变量与配置文件管理' },
  { id: 'sandbox', label: '沙箱系统', description: '容器化部署与安全隔离' },
  { id: 'non-interactive', label: '非交互模式', description: 'CI/CD 场景下的 CLI 使用' },
];

export function EnterpriseDeployment() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  const deploymentFlowChart = `flowchart TD
    subgraph Build["构建阶段"]
      src[源码] --> bundle[esbuild 打包]
      bundle --> dist[dist/cli.js]
    end

    subgraph Package["分发方式"]
      dist --> npm[npm 包]
      dist --> portable[Portable 便携版]
      dist --> standalone[Standalone 单文件]
    end

    subgraph Deploy["部署目标"]
      npm --> registry[私有 Registry]
      portable --> share[文件共享/内网下载]
      standalone --> exe[Windows exe]
    end

    subgraph Runtime["运行时"]
      registry --> install[npm install]
      share --> unzip[解压即用]
      exe --> run[直接运行]
    end

    style Build fill:#1a1a2e,stroke:#22d3ee
    style Package fill:#1a1a2e,stroke:#a855f7
    style Deploy fill:#1a1a2e,stroke:#22c55e
    style Runtime fill:#1a1a2e,stroke:#f59e0b`;

  const offlineResourceChart = `flowchart LR
    subgraph Bundled["随包分发"]
      rg[ripgrep 二进制]
      sb[沙箱配置 .sb]
      cli[cli.js 主程序]
    end

    subgraph External["外部资源"]
      tiktoken[tiktoken 编码器]
      node[Node.js 运行时]
      vendor[vendor 工具]
    end

    subgraph Strategy["离线策略"]
      bundled_s[内嵌到 app/]
      download_s[构建时下载]
      mirror_s[使用国内镜像]
    end

    rg --> bundled_s
    sb --> bundled_s
    cli --> bundled_s
    tiktoken --> download_s
    node --> mirror_s
    vendor --> bundled_s

    style Bundled fill:#22c55e20,stroke:#22c55e
    style External fill:#f59e0b20,stroke:#f59e0b
    style Strategy fill:#a855f720,stroke:#a855f7`;

  return (
    <div>
      <Introduction isExpanded={isIntroExpanded} onToggle={() => setIsIntroExpanded(!isIntroExpanded)} />

      <h2 className="text-2xl text-[var(--purple)] mb-5">企业部署与离线指南</h2>

      {/* 为什么需要企业化部署 */}
      <Layer title="为什么需要企业化部署" icon="💡">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[var(--amber)]/10 to-transparent rounded-xl p-5 border border-[var(--amber)]/30">
            <h4 className="text-[var(--amber)] font-bold mb-3">🎯 核心问题</h4>
            <p className="text-[var(--text-secondary)] text-sm mb-3">
              上游 CLI 默认假设用户能访问公网，但企业内网环境通常：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--red)]/30">
                <div className="text-[var(--red)] font-semibold text-sm mb-1">❌ 网络受限</div>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 无法访问 npm registry</li>
                  <li>• 无法访问 GitHub releases</li>
                  <li>• 防火墙阻断外部请求</li>
                </ul>
              </div>
              <div className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--red)]/30">
                <div className="text-[var(--red)] font-semibold text-sm mb-1">❌ 依赖不可控</div>
                <ul className="text-xs text-[var(--text-muted)] space-y-1">
                  <li>• 版本更新需审批</li>
                  <li>• 安全扫描要求</li>
                  <li>• 可追溯性要求</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="解决：私有 Registry" icon="📦" variant="green">
              <p className="text-sm">Nexus/Verdaccio 托管内部包，npm install 走内网</p>
            </HighlightBox>
            <HighlightBox title="解决：Portable 分发" icon="📁" variant="blue">
              <p className="text-sm">内嵌 Node.js 运行时，解压即用，无需安装</p>
            </HighlightBox>
            <HighlightBox title="解决：关闭自动更新" icon="🔒" variant="purple">
              <p className="text-sm">版本锁定，手动控制升级节奏</p>
            </HighlightBox>
          </div>
        </div>
      </Layer>

      {/* 部署流程图 */}
      <Layer title="部署流程总览" icon="🔄">
        <MermaidDiagram chart={deploymentFlowChart} title="从源码到运行时的完整链路" />
      </Layer>

      {/* 分发方式对比 */}
      <Layer title="分发方式对比" icon="📊">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--bg-panel)]">
                <th className="border border-[var(--border-subtle)] p-3 text-left text-[var(--text-muted)]">方式</th>
                <th className="border border-[var(--border-subtle)] p-3 text-left text-[var(--terminal-green)]">npm 包</th>
                <th className="border border-[var(--border-subtle)] p-3 text-left text-[var(--purple)]">Portable 便携版</th>
                <th className="border border-[var(--border-subtle)] p-3 text-left text-[var(--amber)]">Standalone 单文件</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr>
                <td className="border border-[var(--border-subtle)] p-3 font-semibold">构建命令</td>
                <td className="border border-[var(--border-subtle)] p-3"><code className="text-[var(--terminal-green)]">npm run build</code></td>
                <td className="border border-[var(--border-subtle)] p-3"><code className="text-[var(--purple)]">npm run build:portable</code></td>
                <td className="border border-[var(--border-subtle)] p-3"><code className="text-[var(--amber)]">npm run build:standalone</code></td>
              </tr>
              <tr className="bg-[var(--bg-card)]/30">
                <td className="border border-[var(--border-subtle)] p-3 font-semibold">产物体积</td>
                <td className="border border-[var(--border-subtle)] p-3">~15MB</td>
                <td className="border border-[var(--border-subtle)] p-3">~70MB</td>
                <td className="border border-[var(--border-subtle)] p-3">~80MB</td>
              </tr>
              <tr>
                <td className="border border-[var(--border-subtle)] p-3 font-semibold">需要 Node.js</td>
                <td className="border border-[var(--border-subtle)] p-3">✅ 是</td>
                <td className="border border-[var(--border-subtle)] p-3">❌ 否（内嵌）</td>
                <td className="border border-[var(--border-subtle)] p-3">❌ 否（内嵌）</td>
              </tr>
              <tr className="bg-[var(--bg-card)]/30">
                <td className="border border-[var(--border-subtle)] p-3 font-semibold">网络依赖</td>
                <td className="border border-[var(--border-subtle)] p-3">需要 Registry</td>
                <td className="border border-[var(--border-subtle)] p-3">构建时需要</td>
                <td className="border border-[var(--border-subtle)] p-3">构建时需要 GitHub</td>
              </tr>
              <tr>
                <td className="border border-[var(--border-subtle)] p-3 font-semibold">中国大陆友好</td>
                <td className="border border-[var(--border-subtle)] p-3">⚠️ 需镜像</td>
                <td className="border border-[var(--border-subtle)] p-3">✅ 使用 npmmirror</td>
                <td className="border border-[var(--border-subtle)] p-3">❌ 需要 GitHub</td>
              </tr>
              <tr className="bg-[var(--bg-card)]/30">
                <td className="border border-[var(--border-subtle)] p-3 font-semibold">推荐场景</td>
                <td className="border border-[var(--border-subtle)] p-3">有私有 Registry</td>
                <td className="border border-[var(--border-subtle)] p-3 text-[var(--terminal-green)] font-semibold">✅ 企业内网首选</td>
                <td className="border border-[var(--border-subtle)] p-3">单文件分发需求</td>
              </tr>
            </tbody>
          </table>
        </div>

        <HighlightBox title="🎯 推荐：Portable 便携版" variant="green" className="mt-4">
          <p className="text-sm">
            对于企业内网环境，<strong>Portable 便携版</strong>是最可靠的选择：
            使用国内镜像下载 Node.js，无需 pkg 工具，构建过程完全可控。
          </p>
        </HighlightBox>
      </Layer>

      {/* Portable 构建详解 */}
      <Layer title="Portable 便携版构建" icon="📦">
        <div className="space-y-4">
          <CodeBlock
            title="构建命令"
            code={`# 1. 安装依赖
npm install

# 2. 构建便携版（推荐）
npm run build:portable

# 构建产物位于 dist/portable-win-x64/`}
          />

          <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-subtle)]">
            <h4 className="text-[var(--text-primary)] font-semibold mb-3">📂 产物结构</h4>
            <pre className="text-sm text-[var(--text-secondary)] font-mono">
{`portable-win-x64/
├── node/              # Node.js 运行时 (v20.19.0)
│   └── node.exe
├── app/               # 应用代码
│   ├── cli.js         # esbuild 打包的主程序
│   ├── vendor/        # 内置工具 (ripgrep 等)
│   └── *.sb           # 沙箱配置文件
├── gemini.bat         # Windows 启动器
├── gemini.ps1         # PowerShell 启动器
├── install.bat        # 自动安装脚本
└── INSTALL.md         # 用户说明`}
            </pre>
          </div>

          <CodeBlock
            title="scripts/build-portable.js 核心逻辑"
            code={`// 使用国内镜像下载 Node.js
const NODE_VERSION = '20.19.0';
const NODE_DIST_URL_MIRROR =
  \`https://registry.npmmirror.com/-/binary/node/v\${NODE_VERSION}/node-v\${NODE_VERSION}-win-x64.zip\`;

// 构建步骤
// 1. npm run bundle → esbuild 打包
// 2. 下载 Node.js portable（带进度条）
// 3. 解压并整合文件结构
// 4. 生成启动脚本 (gemini.bat)
// 5. 生成安装脚本 (install.bat)`}
          />
        </div>
      </Layer>

      {/* 私有 Registry 配置 */}
      <Layer title="私有 Registry 配置" icon="🏛️">
        <div className="space-y-4">
          <HighlightBox title="为什么需要私有 Registry" variant="blue">
            <ul className="text-sm space-y-1">
              <li>• <strong>版本可控</strong>：内部审批后才能发布新版本</li>
              <li>• <strong>可追溯</strong>：每个版本都有审计记录</li>
              <li>• <strong>可回滚</strong>：问题版本可快速撤回</li>
              <li>• <strong>离线可用</strong>：断网也能安装</li>
            </ul>
          </HighlightBox>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-subtle)]">
              <h5 className="text-[var(--terminal-green)] font-semibold mb-2">Nexus Repository</h5>
              <CodeBlock
                code={`# .npmrc 配置
registry=https://nexus.company.com/repository/npm-group/
//nexus.company.com/repository/npm-hosted/:_authToken=\${NPM_TOKEN}

# 发布
npm publish --registry=https://nexus.company.com/repository/npm-hosted/`}
              />
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--border-subtle)]">
              <h5 className="text-[var(--purple)] font-semibold mb-2">Verdaccio (轻量)</h5>
              <CodeBlock
                code={`# 启动 Verdaccio
docker run -d -p 4873:4873 verdaccio/verdaccio

# .npmrc 配置
registry=http://localhost:4873/

# 发布
npm publish --registry=http://localhost:4873/`}
              />
            </div>
          </div>

          <HighlightBox title="⚠️ CI/CD 注意事项" variant="yellow">
            <ul className="text-sm space-y-1">
              <li>• 使用 <code>NPM_TOKEN</code> 环境变量，不要硬编码</li>
              <li>• 配置 <code>publishConfig</code> 指定发布目标</li>
              <li>• 版本号遵循语义化，配合 CHANGELOG</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      {/* 关闭自动更新 */}
      <Layer title="关闭自动更新" icon="🔒">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[var(--amber)]/10 to-transparent rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">为什么要关闭？</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• 企业环境版本升级需要审批流程</li>
              <li>• 避免启动时的网络请求（内网可能超时）</li>
              <li>• 减少启动延迟，提升用户体验</li>
            </ul>
          </div>

          <CodeBlock
            title="packages/cli/src/ui/utils/updateCheck.ts"
            code={`// 修改后：直接返回 null，跳过版本检查
export async function checkForUpdates(): Promise<UpdateObject | null> {
  // Auto-update is disabled for enterprise deployment
  return null;
}

// 修改前会：
// 1. 请求 npm registry 获取最新版本
// 2. 比较版本号
// 3. 显示更新提示`}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[var(--terminal-green)]/10 rounded-lg p-3 border border-[var(--terminal-green)]/30 text-center">
              <div className="text-[var(--terminal-green)] font-bold">✅ 不检查更新</div>
              <div className="text-xs text-[var(--text-muted)]">启动时无网络请求</div>
            </div>
            <div className="bg-[var(--terminal-green)]/10 rounded-lg p-3 border border-[var(--terminal-green)]/30 text-center">
              <div className="text-[var(--terminal-green)] font-bold">✅ 不显示提示</div>
              <div className="text-xs text-[var(--text-muted)]">无"有新版本"干扰</div>
            </div>
            <div className="bg-[var(--terminal-green)]/10 rounded-lg p-3 border border-[var(--terminal-green)]/30 text-center">
              <div className="text-[var(--terminal-green)] font-bold">✅ 启动更快</div>
              <div className="text-xs text-[var(--text-muted)]">移除网络等待</div>
            </div>
          </div>

          <HighlightBox title="手动更新方法" variant="blue">
            <CodeBlock
              code={`# npm 全局安装
npm update -g @google/gemini-cli

# 或安装指定版本
npm install -g @google/gemini-cli@1.2.3

# Portable 版：替换 app/ 目录即可
cp -r new-version/app/* portable-win-x64/app/`}
            />
          </HighlightBox>
        </div>
      </Layer>

      {/* 离线资源管理 */}
      <Layer title="离线资源管理" icon="📥">
        <MermaidDiagram chart={offlineResourceChart} title="资源分类与离线策略" />

        <div className="mt-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--bg-panel)]">
                  <th className="border border-[var(--border-subtle)] p-3 text-left">资源</th>
                  <th className="border border-[var(--border-subtle)] p-3 text-left">位置</th>
                  <th className="border border-[var(--border-subtle)] p-3 text-left">离线策略</th>
                  <th className="border border-[var(--border-subtle)] p-3 text-left">备注</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr>
                  <td className="border border-[var(--border-subtle)] p-3">ripgrep</td>
                  <td className="border border-[var(--border-subtle)] p-3"><code>app/vendor/rg</code></td>
                  <td className="border border-[var(--border-subtle)] p-3 text-[var(--terminal-green)]">随包分发</td>
                  <td className="border border-[var(--border-subtle)] p-3">Grep 工具依赖</td>
                </tr>
                <tr className="bg-[var(--bg-card)]/30">
                  <td className="border border-[var(--border-subtle)] p-3">tiktoken 编码器</td>
                  <td className="border border-[var(--border-subtle)] p-3"><code>node_modules/tiktoken/</code></td>
                  <td className="border border-[var(--border-subtle)] p-3 text-[var(--amber)]">npm install 时下载</td>
                  <td className="border border-[var(--border-subtle)] p-3">Token 计数依赖</td>
                </tr>
                <tr>
                  <td className="border border-[var(--border-subtle)] p-3">Node.js 运行时</td>
                  <td className="border border-[var(--border-subtle)] p-3"><code>node/node.exe</code></td>
                  <td className="border border-[var(--border-subtle)] p-3 text-[var(--purple)]">构建时下载（镜像）</td>
                  <td className="border border-[var(--border-subtle)] p-3">仅 Portable 需要</td>
                </tr>
                <tr className="bg-[var(--bg-card)]/30">
                  <td className="border border-[var(--border-subtle)] p-3">沙箱配置 .sb</td>
                  <td className="border border-[var(--border-subtle)] p-3"><code>app/*.sb</code></td>
                  <td className="border border-[var(--border-subtle)] p-3 text-[var(--terminal-green)]">随包分发</td>
                  <td className="border border-[var(--border-subtle)] p-3">macOS Seatbelt</td>
                </tr>
              </tbody>
            </table>
          </div>

          <HighlightBox title="💡 离线环境完整方案" variant="purple">
            <ol className="text-sm space-y-2 list-decimal pl-4">
              <li><strong>构建时</strong>：在有网络的机器上执行 <code>npm run build:portable</code></li>
              <li><strong>分发时</strong>：将 <code>dist/portable-win-x64/</code> 打包成 zip/tar.gz</li>
              <li><strong>部署时</strong>：用户解压到任意目录，运行 <code>install.bat</code> 或直接 <code>gemini.bat</code></li>
              <li><strong>更新时</strong>：只需替换 <code>app/</code> 目录，Node.js 运行时无需重新下载</li>
            </ol>
          </HighlightBox>
        </div>
      </Layer>

      {/* 常见坑与解决方案 */}
      <Layer title="常见坑与解决方案" icon="⚠️">
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--red)]/30">
            <div className="flex items-start gap-3">
              <span className="text-[var(--red)] text-xl">❌</span>
              <div className="flex-1">
                <h5 className="text-[var(--red)] font-semibold mb-1">构建时下载 Node.js 超时</h5>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  即使使用 npmmirror，大文件下载仍可能失败。
                </p>
                <div className="bg-[var(--terminal-green)]/10 rounded p-2 text-sm">
                  <strong className="text-[var(--terminal-green)]">✅ 解决：</strong>
                  <span className="text-[var(--text-secondary)]"> 手动下载 Node.js zip 到 </span>
                  <code>dist/portable-win-x64/node/</code>
                  <span className="text-[var(--text-secondary)]">，然后重新运行构建脚本。</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--red)]/30">
            <div className="flex items-start gap-3">
              <span className="text-[var(--red)] text-xl">❌</span>
              <div className="flex-1">
                <h5 className="text-[var(--red)] font-semibold mb-1">用户无 PATH 修改权限</h5>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  企业机器可能限制环境变量修改。
                </p>
                <div className="bg-[var(--terminal-green)]/10 rounded p-2 text-sm">
                  <strong className="text-[var(--terminal-green)]">✅ 解决：</strong>
                  <span className="text-[var(--text-secondary)]"> 直接使用 </span>
                  <code>gemini.bat</code>
                  <span className="text-[var(--text-secondary)]">，或创建桌面快捷方式。</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--red)]/30">
            <div className="flex items-start gap-3">
              <span className="text-[var(--red)] text-xl">❌</span>
              <div className="flex-1">
                <h5 className="text-[var(--red)] font-semibold mb-1">多进程 Token 共享竞态</h5>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  多个终端同时刷新 Token 导致互相覆盖。
                </p>
                <div className="bg-[var(--terminal-green)]/10 rounded p-2 text-sm">
                  <strong className="text-[var(--terminal-green)]">✅ 解决：</strong>
                  <span className="text-[var(--text-secondary)]"> 使用文件锁确保只有一个进程刷新 Token。</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-lg p-4 border border-[var(--red)]/30">
            <div className="flex items-start gap-3">
              <span className="text-[var(--red)] text-xl">❌</span>
              <div className="flex-1">
                <h5 className="text-[var(--red)] font-semibold mb-1">Standalone (pkg) 构建失败</h5>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  pkg 需要从 GitHub 下载 Node.js 基础二进制，中国大陆网络不稳定。
                </p>
                <div className="bg-[var(--terminal-green)]/10 rounded p-2 text-sm">
                  <strong className="text-[var(--terminal-green)]">✅ 解决：</strong>
                  <span className="text-[var(--text-secondary)]"> 放弃 Standalone，使用 </span>
                  <code>build:portable</code>
                  <span className="text-[var(--text-secondary)]"> 方案。</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layer>

      {/* 设计考量 */}
      <Layer title="设计考量" icon="🧠">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[var(--purple)]/10 to-transparent rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">为什么选择 Portable 而非 pkg？</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[var(--terminal-green)] font-semibold">Portable 优势</div>
                <ul className="text-[var(--text-muted)] space-y-1 mt-1">
                  <li>• 使用国内镜像，构建可靠</li>
                  <li>• 无需 pkg 工具链</li>
                  <li>• 更新时只替换 app/</li>
                  <li>• 调试方便，结构透明</li>
                </ul>
              </div>
              <div>
                <div className="text-[var(--red)] font-semibold">pkg 劣势</div>
                <ul className="text-[var(--text-muted)] space-y-1 mt-1">
                  <li>• 依赖 GitHub 下载</li>
                  <li>• 黑盒打包，调试困难</li>
                  <li>• 原生模块兼容问题</li>
                  <li>• 构建经常失败</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-2 text-[var(--text-muted)]">决策点</th>
                  <th className="text-left py-2 text-[var(--terminal-green)]">选择</th>
                  <th className="text-left py-2 text-[var(--amber)]">代价</th>
                  <th className="text-left py-2 text-[var(--cyber-blue)]">收益</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2">分发格式</td>
                  <td className="py-2 text-[var(--terminal-green)]">目录而非单文件</td>
                  <td className="py-2 text-[var(--amber)]">体积稍大</td>
                  <td className="py-2 text-[var(--cyber-blue)]">增量更新、调试方便</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2">运行时下载</td>
                  <td className="py-2 text-[var(--terminal-green)]">构建时内嵌</td>
                  <td className="py-2 text-[var(--amber)]">首次构建慢</td>
                  <td className="py-2 text-[var(--cyber-blue)]">运行时零网络依赖</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]/50">
                  <td className="py-2">版本检查</td>
                  <td className="py-2 text-[var(--terminal-green)]">完全禁用</td>
                  <td className="py-2 text-[var(--amber)]">手动更新</td>
                  <td className="py-2 text-[var(--cyber-blue)]">启动快、内网友好</td>
                </tr>
                <tr>
                  <td className="py-2">镜像策略</td>
                  <td className="py-2 text-[var(--terminal-green)]">npmmirror 优先</td>
                  <td className="py-2 text-[var(--amber)]">镜像同步延迟</td>
                  <td className="py-2 text-[var(--cyber-blue)]">中国大陆可用</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layer>

      {/* 源码位置 */}
      <Layer title="相关源码" icon="📁">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="text-[var(--text-primary)] font-semibold">构建脚本</h4>
            <div className="space-y-1">
              <code className="block text-[var(--cyber-blue)]">scripts/build-portable.js</code>
              <code className="block text-[var(--text-muted)]">scripts/build-standalone-pkg.js</code>
              <code className="block text-[var(--text-muted)]">scripts/build-standalone-pkg-cn.js</code>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-[var(--text-primary)] font-semibold">更新检查</h4>
            <div className="space-y-1">
              <code className="block text-[var(--cyber-blue)]">packages/cli/src/ui/utils/updateCheck.ts</code>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-[var(--text-primary)] font-semibold">文档</h4>
            <div className="space-y-1">
              <code className="block text-[var(--amber)]">docs/build-portable-windows.md</code>
              <code className="block text-[var(--amber)]">devdocs/DISABLE-AUTO-UPDATE.md</code>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-[var(--text-primary)] font-semibold">Token 管理</h4>
            <div className="space-y-1">
              <code className="block text-[var(--purple)]">packages/core/src/gemini/sharedTokenManager.ts</code>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
