import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { ComparisonTable } from '../components/ComparisonTable';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

// ============================================================
// 上游改造总览 - Innies CLI 企业化适配深度解析
// ============================================================

// 可折叠章节
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6 rounded-xl border border-gray-700/50 bg-gray-800/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700/20 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="text-lg font-semibold text-gray-200">{title}</span>
        </div>
        <span className={`text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-700/30">
          {children}
        </div>
      )}
    </div>
  );
}

// 设计原理卡片
function DesignCard({ title, why, how, benefit }: {
  title: string;
  why: string;
  how: string;
  benefit: string;
}) {
  return (
    <div className="my-4 p-5 rounded-xl bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/30">
      <h4 className="text-lg font-semibold text-cyan-300 mb-3">{title}</h4>
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-yellow-400 font-medium">为什么：</span>
          <span className="text-gray-300 ml-2">{why}</span>
        </div>
        <div>
          <span className="text-cyan-400 font-medium">如何实现：</span>
          <span className="text-gray-300 ml-2">{how}</span>
        </div>
        <div>
          <span className="text-green-400 font-medium">带来的好处：</span>
          <span className="text-gray-300 ml-2">{benefit}</span>
        </div>
      </div>
    </div>
  );
}

export function UpstreamDiffOverview() {
  // 架构对比图
  const archDiagram = `flowchart TB
    subgraph Upstream["上游 Gemini CLI"]
        UA["Google OAuth"]
        UB["Gemini API"]
        UC["公网 npm"]
        UD["单一模型"]
    end

    subgraph Innies["Innies CLI (企业化)"]
        IA["Google OAuth<br/>设备授权流程"]
        IB["多厂商 API<br/>Gemini/OpenAI/兼容"]
        IC["私有 Registry<br/>Nexus/Verdaccio"]
        ID["模型切换<br/>运行时可选"]
        IE["Token 共享<br/>多进程协调"]
        IF["Portable 分发<br/>内嵌运行时"]
    end

    UA -.->|替换| IA
    UB -.->|扩展| IB
    UC -.->|替换| IC
    UD -.->|扩展| ID

    style Innies fill:#1a3a3a,stroke:#00ffff,stroke-width:2px
    style Upstream fill:#2d2d4f,stroke:#8888ff,stroke-width:1px`;

  // 改造模块分布
  const moduleMap = `pie showData
    title 改造代码分布 (按模块)
    "认证系统" : 35
    "多厂商适配" : 25
    "构建发布" : 20
    "配置迁移" : 10
    "安全增强" : 10`;

  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-2">上游改造总览</h2>
      <p className="text-gray-400 mb-6">
        从 Gemini CLI 到 Innies CLI：企业化适配的设计决策与实现
      </p>

      {/* 30秒快速理解 */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-cyan-900/40 to-blue-900/30 border border-cyan-500/40">
        <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
          <span>⚡</span> 30 秒快速理解
        </h3>
        <div className="space-y-3 text-gray-300 text-sm">
          <p>
            <strong className="text-cyan-400">本质：</strong>
            Innies CLI 是基于 Google Gemini CLI 的企业级分支，核心改造目标是<strong className="text-green-400">「可控」</strong>——
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-yellow-400">认证可控</strong> — 对接企业 OAuth/SSO，Token 生命周期可管理</li>
            <li><strong className="text-yellow-400">依赖可控</strong> — 私有 npm Registry，离线可用</li>
            <li><strong className="text-yellow-400">分发可控</strong> — 多平台 Portable 包，解压即用</li>
            <li><strong className="text-yellow-400">模型可控</strong> — 多厂商 API 适配，运行时切换</li>
          </ul>
          <p className="mt-2">
            改造保持了上游的交互体验和工具能力，同时满足企业内网部署需求。
          </p>
        </div>
      </div>

      <Layer title="改造目标" icon="🎯">
        <HighlightBox title="一句话" variant="blue">
          <p className="text-sm text-gray-300">
            在不牺牲交互体验的前提下，把上游 AI Coding CLI 适配到企业内网：认证可控、依赖可控、发布可控、可离线部署。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="架构对比" icon="🏗️">
        <MermaidDiagram chart={archDiagram} />
        <p className="text-sm text-gray-500 mt-2 text-center">
          蓝色虚线表示替换/扩展关系
        </p>
      </Layer>

      <Layer title="上游 vs 企业化：核心差异" icon="🆚">
        <ComparisonTable
          headers={['维度', '上游默认', '企业化改造', '改造原因']}
          rows={[
            ['认证', 'Google OAuth', 'Google OAuth 设备授权', '企业内网无法访问 Google'],
            ['Token 管理', '单进程', '多进程共享 + 文件锁', '避免并发刷新冲突'],
            ['API 端点', 'Gemini API', '多厂商适配层', '支持 Gemini/OpenAI/DeepSeek 等'],
            ['依赖获取', 'npm install', '私有 Registry', '内网无法访问 npmjs.com'],
            ['分发方式', 'npm 全局安装', 'Portable + pkg 打包', 'Windows 用户免装 Node.js'],
            ['配置目录', '.gemini', '.gemini', '品牌隔离，避免冲突'],
            ['审批策略', '默认宽松', '可配置严格模式', '企业合规要求'],
          ]}
        />
      </Layer>

      <CollapsibleSection title="认证系统改造" icon="🔐" defaultOpen={true}>
        <div className="space-y-4">
          <DesignCard
            title="为什么不能用原生 Google OAuth？"
            why="企业内网无法访问 accounts.google.com，且需要对接企业统一认证"
            how="实现设备授权流程 (Device Authorization Grant)，用户在浏览器完成授权"
            benefit="CLI 无需嵌入浏览器，适合终端场景；可对接任意 OAuth2 Provider"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HighlightBox title="设备授权流程" variant="green">
              <ol className="text-sm text-gray-300 list-decimal pl-5 space-y-1">
                <li>CLI 请求设备码 (device_code)</li>
                <li>用户访问授权 URL，输入用户码</li>
                <li>CLI 轮询 Token 端点</li>
                <li>授权成功，获取 access_token</li>
                <li>Token 过期前自动刷新</li>
              </ol>
            </HighlightBox>
            <HighlightBox title="多进程 Token 共享" variant="purple">
              <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                <li>文件锁防止并发刷新</li>
                <li>mtime 检测其他进程更新</li>
                <li>指数退避避免锁竞争</li>
                <li>详见：<code className="text-cyan-400">SharedTokenManager</code></li>
              </ul>
            </HighlightBox>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 mt-4">
            <h5 className="text-cyan-400 font-semibold mb-2">源码位置</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li><code>packages/core/src/gemini/geminiOAuth2.ts</code> — OAuth2 客户端</li>
              <li><code>packages/core/src/gemini/sharedTokenManager.ts</code> — Token 共享</li>
              <li><code>packages/cli/src/config/auth.ts</code> — 认证配置</li>
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="多厂商 API 适配" icon="🔌" defaultOpen={true}>
        <div className="space-y-4">
          <DesignCard
            title="为什么需要多厂商适配？"
            why="不同企业使用不同的 LLM 服务（Gemini、Azure OpenAI、私有部署等）"
            how="抽象 ContentGenerator 接口，各厂商实现适配器"
            benefit="一套代码支持多个 LLM Provider，运行时通过配置切换"
          />

          <ComparisonTable
            headers={['厂商', '认证方式', 'API 格式', '特殊处理']}
            rows={[
              ['Gemini', 'OAuth2 Token', 'OpenAI 兼容', 'Token 共享管理'],
              ['OpenAI', 'API Key', '原生 OpenAI', '无需转换'],
              ['Azure OpenAI', 'API Key + Endpoint', 'OpenAI 兼容', 'Endpoint 路由'],
              ['DeepSeek', 'API Key', 'OpenAI 兼容', 'Beta 功能支持'],
              ['通用兼容', 'API Key', 'OpenAI 兼容', '自定义 base_url'],
            ]}
          />

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h5 className="text-cyan-400 font-semibold mb-2">配置示例</h5>
            <pre className="bg-gray-900/80 p-3 rounded text-sm text-gray-300 overflow-x-auto">
{`# 使用 Gemini (默认)
gemini

# 使用 OpenAI 兼容 API
OPENAI_API_KEY=sk-xxx \\
OPENAI_BASE_URL=https://api.example.com/v1 \\
OPENAI_MODEL=gpt-4 \\
gemini`}
            </pre>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="构建与分发" icon="📦" defaultOpen={true}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DesignCard
              title="Portable 包"
              why="Windows 企业用户可能无法安装 Node.js，或版本不受控"
              how="使用 pkg 打包，内嵌 Node.js 运行时和所有依赖"
              benefit="解压即用，无需任何前置安装"
            />
            <DesignCard
              title="私有 npm Registry"
              why="企业内网无法访问 npmjs.com"
              how="配置 Nexus/Verdaccio 作为私有 Registry"
              benefit="依赖可控、可审计、离线可用"
            />
          </div>

          <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <h5 className="text-yellow-400 font-semibold mb-2">原生依赖处理</h5>
            <p className="text-sm text-gray-300 mb-2">
              CLI 依赖 <code>node-pty</code> 等原生模块，需要特殊处理：
            </p>
            <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
              <li>预编译多平台二进制 (win32-x64, darwin-x64, darwin-arm64, linux-x64)</li>
              <li>可选依赖 <code>@lydell/node-pty-prebuilt-multiarch</code></li>
              <li>构建时检测并嵌入对应平台二进制</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h5 className="text-cyan-400 font-semibold mb-2">构建脚本</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li><code>scripts/build.js</code> — 主构建流程</li>
              <li><code>scripts/build-standalone-pkg.js</code> — Portable 打包</li>
              <li><code>scripts/build_sandbox.js</code> — 沙箱镜像构建</li>
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="配置与品牌迁移" icon="⚙️" defaultOpen={false}>
        <div className="space-y-4">
          <ComparisonTable
            headers={['项目', '上游', '企业化', '迁移策略']}
            rows={[
              ['配置目录', '~/.gemini', '~/.gemini', '完全隔离'],
              ['环境变量前缀', 'GEMINI_', 'INNIES_ / 兼容 GEMINI_', '双重检测'],
              ['CLI 命令', 'gemini', 'gemini', '别名可选'],
              ['日志目录', '.gemini/logs', '.gemini/logs', '隔离存储'],
              ['凭证文件', 'gemini_oauth_creds.json', 'gemini_oauth_creds.json', '格式兼容'],
            ]}
          />

          <DesignCard
            title="为什么要隔离配置目录？"
            why="避免与上游 Gemini CLI 冲突，支持并行安装"
            how="所有路径引用从硬编码改为可配置"
            benefit="用户可同时使用 gemini 和 gemini 命令"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="安全增强" icon="🛡️" defaultOpen={false}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightBox title="审批模式" variant="green">
              <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                <li>可配置严格审批</li>
                <li>危险操作需确认</li>
                <li>企业策略可定制</li>
              </ul>
            </HighlightBox>
            <HighlightBox title="沙箱隔离" variant="purple">
              <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                <li>macOS seatbelt</li>
                <li>Docker/Podman 容器</li>
                <li>限制文件系统访问</li>
              </ul>
            </HighlightBox>
            <HighlightBox title="信任边界" variant="blue">
              <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                <li>可信文件夹白名单</li>
                <li>敏感文件保护</li>
                <li>命令注入检测</li>
              </ul>
            </HighlightBox>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="改造代码分布" icon="📊" defaultOpen={false}>
        <MermaidDiagram chart={moduleMap} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
            <div className="text-cyan-400 font-semibold">认证系统 (35%)</div>
            <p className="text-gray-400">OAuth2 客户端、Token 共享、设备授权</p>
          </div>
          <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
            <div className="text-cyan-400 font-semibold">多厂商适配 (25%)</div>
            <p className="text-gray-400">内容生成器抽象、API 格式转换</p>
          </div>
          <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
            <div className="text-cyan-400 font-semibold">构建发布 (20%)</div>
            <p className="text-gray-400">Portable 打包、私有 Registry、CI/CD</p>
          </div>
          <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
            <div className="text-cyan-400 font-semibold">配置 + 安全 (20%)</div>
            <p className="text-gray-400">目录迁移、审批策略、沙箱增强</p>
          </div>
        </div>
      </CollapsibleSection>

      <Layer title="常见问题" icon="🧠">
        <div className="space-y-4 text-sm text-gray-300">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-cyan-300 font-semibold mb-2">Q：为什么要做多进程 Token 共享？</div>
            <div className="text-gray-400">
              A：同一台机器可能同时开多个终端/多个 CLI 实例；共享可避免重复登录、并发刷新导致互相覆盖或失效。
              详见 <code className="text-cyan-400">SharedTokenManager</code> 页面。
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-cyan-300 font-semibold mb-2">Q：Nexus 接入在工程上怎么落？</div>
            <div className="text-gray-400">
              A：在 <code>.npmrc</code> 配置 registry URL 和鉴权 token，CI 发布时使用 <code>npm publish --registry</code>。
              版本策略遵循 semver，支持回滚。
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-cyan-300 font-semibold mb-2">Q：Portable 包如何处理原生依赖/外部资源？</div>
            <div className="text-gray-400">
              A：原生模块 (node-pty) 在构建时预编译并嵌入；tiktoken 等资源文件随包分发或首次运行时下载到缓存目录。
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-cyan-300 font-semibold mb-2">Q：如何从上游同步新功能？</div>
            <div className="text-gray-400">
              A：定期 cherry-pick 上游提交，保持核心逻辑兼容。改造代码集中在 <code>packages/core/src/gemini/</code>，
              最小化与上游代码的耦合。
            </div>
          </div>
        </div>
      </Layer>

      {/* 相关页面 */}
      <RelatedPages
        title="🔗 相关页面"
        pages={[
          { id: 'enterprise-deployment', label: '企业部署', description: '部署指南' },
          { id: 'shared-token-manager', label: 'Token 共享机制', description: 'SharedTokenManager' },
          { id: 'auth', label: '认证流程', description: 'OAuth2 详解' },
          { id: 'multi-provider', label: '多厂商架构', description: 'API 适配' },
        ]}
      />
    </div>
  );
}
