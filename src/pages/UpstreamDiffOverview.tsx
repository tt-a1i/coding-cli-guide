import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { ComparisonTable } from '../components/ComparisonTable';

export function UpstreamDiffOverview() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">Innies 改造总览</h2>

      <Layer title="改造目标" icon="🎯">
        <HighlightBox title="一句话" variant="blue">
          <p className="text-sm text-gray-300">
            在不牺牲交互体验的前提下，把上游 AI Coding CLI 适配到企业内网：认证可控、依赖可控、发布可控、可离线部署。
          </p>
        </HighlightBox>
      </Layer>

      <Layer title="上游 vs 企业化：如何理解差异" icon="🆚">
        <ComparisonTable
          headers={['维度', '上游默认', '企业化改造关注点']}
          rows={[
            ['认证', '公共 OAuth / API Key', '对接企业 OAuth / SSO，Token 生命周期与并发刷新稳定性'],
            ['网络/依赖', '默认可联网拉依赖', '内网镜像/私有 Registry（如 Nexus），离线可用'],
            ['分发', 'npm 安装为主', '多平台分发 + Windows Portable（内嵌运行时）'],
            ['配置/品牌', '默认配置目录与命名', '目录/提示词/文案迁移，必要时保兼容'],
            ['安全', '默认审批策略', '更严格的审批/沙箱/信任边界，适配企业合规'],
          ]}
        />
      </Layer>

      <Layer title="关键改造点" icon="✨">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightBox title="认证与稳定性" variant="green">
            <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
              <li>设备码/浏览器授权流程，适配 CLI 场景</li>
              <li>Token 刷新策略与失败重试（退避/抖动）</li>
              <li>多进程 Token 共享/互斥，避免并发竞态</li>
            </ul>
          </HighlightBox>
          <HighlightBox title="构建发布与离线" variant="purple">
            <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
              <li>Windows Portable：内嵌运行时，解压即用</li>
              <li>私有 NPM Registry（Nexus）+ CI/CD 发布链路</li>
              <li>可选关闭自动更新，适配内网环境</li>
            </ul>
          </HighlightBox>
        </div>
      </Layer>

      <Layer title="常见问题" icon="🧠">
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <div className="text-cyan-300 font-semibold">Q：为什么要做多进程 Token 共享？</div>
            <div className="text-gray-400">
              A：同一台机器可能同时开多个终端/多个 CLI 实例；共享可避免重复登录、并发刷新导致互相覆盖或失效。
            </div>
          </div>
          <div>
            <div className="text-cyan-300 font-semibold">Q：Nexus 接入在工程上怎么落？</div>
            <div className="text-gray-400">
              A：配置 npm registry、鉴权 token、CI 发布权限与版本策略，保证内部包可追溯且可回滚。
            </div>
          </div>
          <div>
            <div className="text-cyan-300 font-semibold">Q：Portable 包如何处理原生依赖/外部资源？</div>
            <div className="text-gray-400">
              A：提前梳理运行期依赖（如动态库、模型/编码器文件），在打包阶段随包分发或提供可控下载路径。
            </div>
          </div>
        </div>
      </Layer>
    </div>
  );
}
