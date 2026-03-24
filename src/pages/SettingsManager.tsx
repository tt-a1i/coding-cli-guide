import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



const relatedPages: RelatedPage[] = [
 { id: 'config', label: '配置系统', description: '配置加载基础' },
 { id: 'key-bindings', label: '键盘绑定', description: '快捷键配置' },
 { id: 'trusted-folders', label: '信任机制', description: '工作区信任' },
 { id: 'approval-mode', label: '审批模式', description: '权限配置' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-xl border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">⚙️</span>
 <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 多作用域配置管理系统，支持 4 层配置合并、V1→V2 自动迁移、环境变量解析
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">4</div>
 <div className="text-xs text-dim">配置作用域</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">50+</div>
 <div className="text-xs text-dim">迁移字段</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">V2</div>
 <div className="text-xs text-dim">当前版本</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">3</div>
 <div className="text-xs text-dim">合并策略</div>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">配置合并优先级</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-dim rounded-lg border border-edge-hover/30">
 SystemDefaults
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 User
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Workspace
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 System (强制)
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/cli/src/config/settings.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function SettingsManager() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const settingsMergeChart = `flowchart TD
 subgraph Sources["配置源"]
 SD["SystemDefaults<br/>/etc/gemini-cli/system-defaults.json"]
 SYS["System<br/>/etc/gemini-cli/settings.json"]
 USER["User<br/>~/.gemini/settings.json"]
 WS["Workspace<br/>.gemini/settings.json"]
 end

 subgraph Process["处理流程"]
 LOAD[loadSettings]
 MIGRATE{"需要迁移?"}
 V2[V1 → V2 迁移]
 ENV[环境变量解析]
 TRUST{"工作区信任?"}
 end

 subgraph Merge["合并层"]
 MERGE[customDeepMerge]
 STRAT["MergeStrategy<br/>replace/append/merge"]
 RESULT[LoadedSettings]
 end

 SD --> LOAD
 SYS --> LOAD
 USER --> LOAD
 WS --> LOAD

 LOAD --> MIGRATE
 MIGRATE -->|是| V2
 MIGRATE -->|否| ENV
 V2 --> ENV
 ENV --> TRUST
 TRUST -->|信任| MERGE
 TRUST -->|不信任| MERGE

 MERGE --> STRAT
 STRAT --> RESULT

 style SD stroke:#666
 style USER stroke:#00d4ff
 style WS stroke:#00ff88
 style SYS stroke:${getThemeColor("--color-danger", "#b91c1c")}
 style RESULT stroke:#a855f7`;

 const scopeEnum = `// 配置作用域枚举
export enum SettingScope {
 User = 'User', // 用户级 (~/.gemini/settings.json)
 Workspace = 'Workspace', // 项目级 (.gemini/settings.json)
 System = 'System', // 系统级 (/etc/gemini-cli/settings.json)
 SystemDefaults = 'SystemDefaults', // 系统默认值
 // 仅扩展使用（当前 settings dialog 不支持）
 Session = 'Session',
}

// 配置文件路径
export const USER_SETTINGS_PATH = Storage.getGlobalSettingsPath();
// → ~/.gemini/settings.json

function getSystemSettingsPath(): string {
 if (process.env['GEMINI_CLI_SYSTEM_SETTINGS_PATH']) {
 return process.env['GEMINI_CLI_SYSTEM_SETTINGS_PATH'];
 }
 if (platform() === 'darwin') {
 return '/Library/Application Support/GeminiCli/settings.json';
 } else if (platform() === 'win32') {
 return 'C:\\\\ProgramData\\\\gemini-cli\\\\settings.json';
 } else {
 return '/etc/gemini-cli/settings.json';
 }
}`;

 const migrationMapCode = `// V1 → V2 设置迁移映射（部分）
const MIGRATION_MAP: Record<string, string> = {
  // 旧路径 → 新路径
  'accessibility': 'ui.accessibility',
  'allowedTools': 'tools.allowed',
  'allowMCPServers': 'mcp.allowed',
  'autoAccept': 'tools.autoAccept',
  'chatCompression': 'model.compressionThreshold',
  'checkpointing': 'general.checkpointing',
  'customThemes': 'ui.customThemes',
  'enforcedAuthType': 'security.auth.enforcedType',
  'excludeTools': 'tools.exclude',
  'folderTrust': 'security.folderTrust.enabled',
  'hideFooter': 'ui.hideFooter',
  'mcpServers': 'mcpServers', // 保持顶层
  'model': 'model.name',
  'sandbox': 'tools.sandbox',
  'theme': 'ui.theme',
  'vimMode': 'general.vimMode',
  // ... 50+ 更多字段
};

// 说明：Gemini CLI 不依赖 "$version" 字段判断版本，
// 而是通过 needsMigration(...) 扫描是否存在需要搬迁的 v1 顶层 key。`;

 const loadedSettingsCode = `// LoadedSettings 类管理运行时配置
export class LoadedSettings {
  constructor(
  system: SettingsFile,
  systemDefaults: SettingsFile,
  user: SettingsFile,
  workspace: SettingsFile,
  isTrusted: boolean,
  migratedInMemoryScopes: Set<SettingScope>,
  errors: SettingsError[] = [],
  ) {
  this.system = system;
  this.systemDefaults = systemDefaults;
  this.user = user;
  this.workspace = workspace;
  this.isTrusted = isTrusted;
  this.migratedInMemoryScopes = migratedInMemoryScopes;
  this.errors = errors;
  this._merged = this.computeMergedSettings();
  }

  readonly system: SettingsFile;
  readonly systemDefaults: SettingsFile;
  readonly user: SettingsFile;
  readonly workspace: SettingsFile;
  readonly isTrusted: boolean;
  readonly migratedInMemoryScopes: Set<SettingScope>;
  readonly errors: SettingsError[];

  // 合并后的最终配置
  get merged(): Settings {
  return this._merged;
  }

  // 按作用域获取配置
  forScope(scope: LoadableSettingScope): SettingsFile {
  switch (scope) {
  case SettingScope.User: return this.user;
  case SettingScope.Workspace: return this.workspace;
  case SettingScope.System: return this.system;
  case SettingScope.SystemDefaults: return this.systemDefaults;
  default: throw new Error(\`Invalid scope: \${scope}\`);
  }
  }

  // 设置值并保存
  setValue(scope: LoadableSettingScope, key: string, value: unknown): void {
  const settingsFile = this.forScope(scope);
  setNestedProperty(settingsFile.settings, key, value);
  setNestedProperty(settingsFile.originalSettings, key, value);
  this._merged = this.computeMergedSettings();
  saveSettings(settingsFile);
  }

  private computeMergedSettings(): Settings {
  return mergeSettings(
  this.system.settings,
  this.systemDefaults.settings,
  this.user.settings,
  this.workspace.settings,
  this.isTrusted,
  );
  }
}`;

 const mergeSettingsCode = `// 配置合并函数 - 优先级从低到高
function mergeSettings(
  system: Settings,
  systemDefaults: Settings,
  user: Settings,
  workspace: Settings,
  isTrusted: boolean,
): Settings {
  // 不信任的工作区配置被忽略
  const safeWorkspace = isTrusted ? workspace : ({} as Settings);

  // 合并优先级 (后者覆盖前者):
  // 1. System Defaults (最低)
  // 2. User Settings
  // 3. Workspace Settings
  // 4. System Settings (最高 - 强制覆盖)
  return customDeepMerge(
  getMergeStrategyForPath,
  {},
  systemDefaults,
  user,
  safeWorkspace,
  system, // System 作为最后覆盖
  ) as Settings;
}

// 合并策略类型
type MergeStrategy = 'replace' | 'append' | 'merge';

// 根据路径获取合并策略
function getMergeStrategyForPath(path: string[]): MergeStrategy | undefined {
  // 例如: tools.allowed 使用 append
  // model.name 使用 replace
  // mcpServers 使用 merge
  ...
}`;

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-3xl font-bold text-heading mb-2">Settings Manager 设置管理器</h1>
 <p className="text-body text-lg">
 多作用域配置管理系统，支持 4 层配置合并、自动迁移和环境变量解析
 </p>
 </div>

 <QuickSummary isExpanded={isSummaryExpanded} onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)} />

 <Layer title="配置合并架构" defaultOpen={true}>
 <HighlightBox title="配置加载与合并流程" color="blue" className="mb-6">
 <MermaidDiagram chart={settingsMergeChart} />
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <div className="text-heading font-bold mb-2">配置文件位置</div>
 <ul className="text-sm text-body space-y-2">
 <li className="flex items-start gap-2">
 <span className="text-dim">User:</span>
 <code className="text-xs">~/.gemini/settings.json</code>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">Workspace:</span>
 <code className="text-xs">.gemini/settings.json</code>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">System:</span>
 <code className="text-xs">/etc/gemini-cli/settings.json</code>
 </li>
 </ul>
 </div>
 <div className="bg-surface p-4 rounded-lg border border-edge">
 <div className="text-heading font-bold mb-2">信任机制</div>
 <ul className="text-sm text-body space-y-1">
 <li>工作区配置需要信任才生效</li>
 <li>不信任时跳过 Workspace 配置</li>
 <li>System 配置始终强制应用</li>
 <li>环境变量在信任后才加载</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="作用域与路径" defaultOpen={true}>
 <CodeBlock code={scopeEnum} language="typescript" title="SettingScope 枚举与路径" />

 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-dim">作用域</th>
 <th className="text-left py-2 text-dim">路径 (Linux/macOS)</th>
 <th className="text-left py-2 text-dim">优先级</th>
 <th className="text-left py-2 text-dim">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge/30">
 <td className="py-2 text-dim">SystemDefaults</td>
 <td><code className="text-xs">/etc/gemini-cli/system-defaults.json</code></td>
 <td>最低</td>
 <td>企业默认值</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2 text-heading">User</td>
 <td><code className="text-xs">~/.gemini/settings.json</code></td>
 <td>中</td>
 <td>用户个人配置</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2 text-heading">Workspace</td>
 <td><code className="text-xs">.gemini/settings.json</code></td>
 <td>高</td>
 <td>项目特定配置</td>
 </tr>
 <tr className="border- border-edge/30">
 <td className="py-2 text-heading">System</td>
 <td><code className="text-xs">/etc/gemini-cli/settings.json</code></td>
 <td>最高</td>
 <td>企业强制覆盖</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 <Layer title="V1 → V2 迁移" defaultOpen={true}>
 <p className="text-body mb-4">
 设置系统自动检测旧版配置并迁移到新的嵌套结构：
 </p>

 <CodeBlock code={migrationMapCode} language="typescript" title="迁移映射表" />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="迁移前 (V1)" color="orange">
 <CodeBlock
 code={`{
 "theme": "dark",
 "vimMode": true,
 "autoAccept": true,
 "sandbox": true
}`}
 language="json"
 />
 </HighlightBox>
 <HighlightBox title="迁移后 (V2)" color="green">
 <CodeBlock
 code={`{
 "ui": { "theme": "dark" },
 "general": { "vimMode": true },
 "tools": {
 "autoAccept": true,
 "sandbox": true
 }
}`}
 language="json"
 />
 </HighlightBox>
 </div>

 <div className="mt-4 p-4 bg-base/50 rounded-lg border border-edge">
 <div className="text-sm">
 <strong className="text-heading">迁移行为：</strong>
 <ul className="mt-2 text-body space-y-1">
 <li>自动备份原文件为 <code>.orig</code></li>
 <li>写入迁移后的 V2 格式</li>
 <li>注：迁移写回会丢失 JSON 注释（读取时 strip-json-comments）</li>
 </ul>
 </div>
 </div>
 </Layer>

 <Layer title="LoadedSettings 类" defaultOpen={false}>
 <CodeBlock code={loadedSettingsCode} language="typescript" title="LoadedSettings 运行时管理" />
 </Layer>

 <Layer title="配置合并策略" defaultOpen={false}>
 <CodeBlock code={mergeSettingsCode} language="typescript" title="mergeSettings 合并逻辑" />

 <div className="mt-4">
 <HighlightBox title="合并策略类型" color="purple">
 <div className="grid grid-cols-3 gap-4 text-sm">
 <div>
 <div className="font-bold text-heading">replace</div>
 <p className="text-dim">完全覆盖，如 model.name</p>
 </div>
 <div>
 <div className="font-bold text-heading">append</div>
 <p className="text-dim">追加数组，如 tools.allowed</p>
 </div>
 <div>
 <div className="font-bold text-heading">merge</div>
 <p className="text-dim">深度合并，如 mcpServers</p>
 </div>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
