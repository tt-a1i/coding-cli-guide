import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'auth', label: '认证流程', description: 'OAuth 认证' },
  { id: 'google-authentication', label: 'Google OAuth', description: 'Google 认证详解' },
  { id: 'config', label: '配置系统', description: '配置管理' },
  { id: 'ide-integration', label: 'IDE 集成', description: 'VS Code 集成' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--cyber-blue)]/10 to-[var(--purple)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">☁️</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">30秒快速理解</span>
        </div>
        <span className={`transform transition-transform text-[var(--text-muted)] ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-5">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <p className="text-[var(--text-primary)] font-medium">
              <span className="text-[var(--cyber-blue)] font-bold">一句话：</span>
              Google Cloud Code Assist 集成系统，管理用户 Tier 订阅、隐私声明和项目配置
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--cyber-blue)]">3</div>
              <div className="text-xs text-[var(--text-muted)]">用户 Tier</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--terminal-green)]">OAuth2</div>
              <div className="text-xs text-[var(--text-muted)]">认证方式</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--amber)]">7</div>
              <div className="text-xs text-[var(--text-muted)]">不合格原因</div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center border border-[var(--border-subtle)]">
              <div className="text-2xl font-bold text-[var(--purple)]">LRO</div>
              <div className="text-xs text-[var(--text-muted)]">长时操作</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">核心流程</h4>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="px-3 py-1.5 bg-[var(--cyber-blue)]/20 text-[var(--cyber-blue)] rounded-lg border border-[var(--cyber-blue)]/30">
                LoadCodeAssist
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--purple)]/20 text-[var(--purple)] rounded-lg border border-[var(--purple)]/30">
                获取 Tier 列表
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--terminal-green)]/20 text-[var(--terminal-green)] rounded-lg border border-[var(--terminal-green)]/30">
                OnboardUser
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="px-3 py-1.5 bg-[var(--amber)]/20 text-[var(--amber)] rounded-lg border border-[var(--amber)]/30">
                配置项目
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)]">📍 源码入口:</span>
            <code className="px-2 py-1 bg-[var(--bg-terminal)] rounded text-[var(--terminal-green)] text-xs">
              packages/core/src/code_assist/
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

export function CodeAssist() {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const codeAssistFlowChart = `flowchart TD
    subgraph Auth["认证层"]
        OAUTH[OAuth2 认证]
        TOKEN[Access Token]
    end

    subgraph Load["加载层"]
        LOAD[LoadCodeAssist API]
        TIERS[可用 Tier 列表]
        INELIG[不合格 Tier]
    end

    subgraph Onboard["注册层"]
        SELECT[选择 Tier]
        ONBOARD[OnboardUser API]
        LRO[Long Running Operation]
        PROJECT[cloudaicompanionProject]
    end

    subgraph Config["配置层"]
        SETTINGS[全局设置]
        PRIVACY[隐私声明]
    end

    OAUTH --> TOKEN
    TOKEN --> LOAD
    LOAD --> TIERS
    LOAD --> INELIG
    TIERS --> SELECT
    SELECT --> ONBOARD
    ONBOARD --> LRO
    LRO --> PROJECT
    PROJECT --> SETTINGS
    PROJECT --> PRIVACY

    style OAUTH fill:#1a1a2e,stroke:#00d4ff
    style LRO fill:#2d1f3d,stroke:#a855f7
    style PROJECT fill:#1a1a2e,stroke:#00ff88`;

  const userTierCode = `// 用户 Tier 类型定义
export enum UserTierId {
  FREE = 'free-tier',       // 免费层级
  LEGACY = 'legacy-tier',   // 旧版层级
  STANDARD = 'standard-tier', // 标准层级
}

// Tier 详细信息
export interface GeminiUserTier {
  id: UserTierId;
  name?: string;           // 显示名称
  description?: string;    // 描述

  // 是否需要用户配置项目
  userDefinedCloudaicompanionProject?: boolean | null;

  isDefault?: boolean;     // 是否默认
  privacyNotice?: PrivacyNotice; // 隐私声明
  hasAcceptedTos?: boolean;      // 是否已接受 ToS
  hasOnboardedPreviously?: boolean; // 是否曾经注册
}

// 隐私声明
export interface PrivacyNotice {
  showNotice: boolean;
  noticeText?: string;
}`;

  const ineligibleTierCode = `// 不合格 Tier 原因码
export enum IneligibleTierReasonCode {
  DASHER_USER = 'DASHER_USER',           // Dasher 用户
  INELIGIBLE_ACCOUNT = 'INELIGIBLE_ACCOUNT', // 不合格账户
  NON_USER_ACCOUNT = 'NON_USER_ACCOUNT', // 非用户账户
  RESTRICTED_AGE = 'RESTRICTED_AGE',     // 年龄限制
  RESTRICTED_NETWORK = 'RESTRICTED_NETWORK', // 网络限制
  UNKNOWN = 'UNKNOWN',                   // 未知原因
  UNKNOWN_LOCATION = 'UNKNOWN_LOCATION', // 未知位置
  UNSUPPORTED_LOCATION = 'UNSUPPORTED_LOCATION', // 不支持的地区
}

// 不合格 Tier 信息
export interface IneligibleTier {
  reasonCode: IneligibleTierReasonCode;
  reasonMessage: string; // 显示给用户的消息
  tierId: UserTierId;
  tierName: string;
}`;

  const loadCodeAssistCode = `// LoadCodeAssist 请求/响应
export interface ClientMetadata {
  ideType?: ClientMetadataIdeType; // IDE 类型
  ideVersion?: string;             // IDE 版本
  pluginVersion?: string;          // 插件版本
  platform?: ClientMetadataPlatform; // 平台
  updateChannel?: string;
  duetProject?: string;
  pluginType?: ClientMetadataPluginType;
  ideName?: string;
}

export interface LoadCodeAssistRequest {
  cloudaicompanionProject?: string;
  metadata: ClientMetadata;
}

export interface LoadCodeAssistResponse {
  currentTier?: GeminiUserTier | null;  // 当前 Tier
  allowedTiers?: GeminiUserTier[] | null; // 可用 Tier 列表
  ineligibleTiers?: IneligibleTier[] | null; // 不合格 Tier
  cloudaicompanionProject?: string | null; // 项目 ID
}`;

  const onboardUserCode = `// OnboardUser 注册流程
export interface OnboardUserRequest {
  tierId: string | undefined;
  cloudaicompanionProject: string | undefined;
  metadata: ClientMetadata | undefined;
}

// Long Running Operation 响应
export interface LongRunningOperationResponse {
  name: string;    // 操作名称
  done?: boolean;  // 是否完成
  response?: OnboardUserResponse; // 完成后的响应
}

export interface OnboardUserResponse {
  cloudaicompanionProject?: {
    id: string;
    name: string;
  };
}

// 注册状态码
export enum OnboardUserStatusCode {
  Default = 'DEFAULT',
  Notice = 'NOTICE',   // 提示信息
  Warning = 'WARNING', // 警告
  Error = 'ERROR',     // 错误
}

export interface OnboardUserStatus {
  statusCode: OnboardUserStatusCode;
  displayMessage: string;
  helpLink: HelpLinkUrl | undefined;
}`;

  const platformTypesCode = `// IDE 类型
export type ClientMetadataIdeType =
  | 'IDE_UNSPECIFIED'
  | 'VSCODE'
  | 'INTELLIJ'
  | 'VSCODE_CLOUD_WORKSTATION'
  | 'INTELLIJ_CLOUD_WORKSTATION'
  | 'CLOUD_SHELL';

// 平台类型
export type ClientMetadataPlatform =
  | 'PLATFORM_UNSPECIFIED'
  | 'DARWIN_AMD64'
  | 'DARWIN_ARM64'
  | 'LINUX_AMD64'
  | 'LINUX_ARM64'
  | 'WINDOWS_AMD64';

// 插件类型
export type ClientMetadataPluginType =
  | 'PLUGIN_UNSPECIFIED'
  | 'CLOUD_CODE'
  | 'GEMINI'
  | 'AIPLUGIN_INTELLIJ'
  | 'AIPLUGIN_STUDIO';`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Code Assist 集成系统</h1>
        <p className="text-[var(--text-secondary)] text-lg">
          Google Cloud Code Assist 集成，管理用户订阅层级、隐私声明和项目配置
        </p>
      </div>

      <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

      <Layer title="系统架构" icon="🏗️" defaultOpen={true}>
        <HighlightBox title="Code Assist 集成流程" color="blue" className="mb-6">
          <MermaidDiagram chart={codeAssistFlowChart} />
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
            <div className="text-[var(--cyber-blue)] font-bold mb-2">☁️ Cloud Code Assist</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• Google Cloud 服务</li>
              <li>• 管理 Gemini 访问权限</li>
              <li>• 处理订阅和配额</li>
            </ul>
          </div>
          <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-subtle)]">
            <div className="text-[var(--terminal-green)] font-bold mb-2">🔗 集成方式</div>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>• OAuth2 认证获取 Token</li>
              <li>• REST API 调用</li>
              <li>• 长时操作 (LRO) 支持</li>
            </ul>
          </div>
        </div>
      </Layer>

      <Layer title="用户 Tier" icon="👤" defaultOpen={true}>
        <CodeBlock code={userTierCode} language="typescript" title="UserTier 类型定义" />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-2 text-[var(--text-muted)]">Tier ID</th>
                <th className="text-left py-2 text-[var(--text-muted)]">名称</th>
                <th className="text-left py-2 text-[var(--text-muted)]">特点</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border-subtle)]/30">
                <td className="py-2 text-[var(--terminal-green)]">free-tier</td>
                <td>免费版</td>
                <td>基础功能，有使用限制</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/30">
                <td className="py-2 text-[var(--amber)]">legacy-tier</td>
                <td>旧版</td>
                <td>历史用户迁移</td>
              </tr>
              <tr className="border-b border-[var(--border-subtle)]/30">
                <td className="py-2 text-[var(--cyber-blue)]">standard-tier</td>
                <td>标准版</td>
                <td>完整功能，需订阅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Layer>

      <Layer title="不合格原因" icon="⚠️" defaultOpen={true}>
        <CodeBlock code={ineligibleTierCode} language="typescript" title="IneligibleTier 原因码" />

        <HighlightBox title="常见不合格原因" color="orange" className="mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--error)]">RESTRICTED_AGE</span>
              <p className="text-[var(--text-muted)]">年龄限制，需满足最低年龄要求</p>
            </div>
            <div>
              <span className="text-[var(--error)]">UNSUPPORTED_LOCATION</span>
              <p className="text-[var(--text-muted)]">地区不支持该服务</p>
            </div>
            <div>
              <span className="text-[var(--error)]">INELIGIBLE_ACCOUNT</span>
              <p className="text-[var(--text-muted)]">账户类型不符合要求</p>
            </div>
            <div>
              <span className="text-[var(--error)]">RESTRICTED_NETWORK</span>
              <p className="text-[var(--text-muted)]">网络环境受限</p>
            </div>
          </div>
        </HighlightBox>
      </Layer>

      <Layer title="LoadCodeAssist API" icon="📥" defaultOpen={false}>
        <CodeBlock code={loadCodeAssistCode} language="typescript" title="LoadCodeAssist 请求/响应" />
      </Layer>

      <Layer title="OnboardUser 注册" icon="✅" defaultOpen={false}>
        <CodeBlock code={onboardUserCode} language="typescript" title="OnboardUser 注册流程" />

        <div className="mt-4 p-4 bg-[var(--bg-terminal)]/50 rounded-lg border border-[var(--border-subtle)]">
          <div className="text-sm">
            <strong className="text-[var(--text-primary)]">💡 Long Running Operation (LRO)：</strong>
            <p className="text-[var(--text-secondary)] mt-2">
              OnboardUser 是一个长时操作，需要轮询检查 <code>done</code> 状态直到完成。
              完成后返回 <code>cloudaicompanionProject</code> 用于后续 API 调用。
            </p>
          </div>
        </div>
      </Layer>

      <Layer title="平台与 IDE 类型" icon="💻" defaultOpen={false}>
        <CodeBlock code={platformTypesCode} language="typescript" title="平台与 IDE 类型枚举" />
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
