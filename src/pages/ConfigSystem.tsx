import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

export function ConfigSystem() {
 return (
 <div>
 <h2 className="text-2xl text-heading mb-5">配置系统详解 (Settings v2)</h2>

 {/* 30秒速览 */}
 <Layer title="30秒速览" icon="⚡">
 <HighlightBox title="配置系统核心要点" icon="🎯" variant="purple">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2 text-sm">
 <div className="flex items-start gap-2">
 <span className="text-heading font-bold">📁</span>
 <div>
 <strong>四层配置</strong>
 <div className="text-xs text-body">systemDefaults → user → workspace → system</div>
 </div>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading font-bold">🔀</span>
 <div>
 <strong>4种合并策略</strong>
 <div className="text-xs text-body">REPLACE | CONCAT | UNION | SHALLOW_MERGE</div>
 </div>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading font-bold">🔐</span>
 <div>
 <strong>信任门禁</strong>
 <div className="text-xs text-body">非信任目录 → workspace 配置被忽略</div>
 </div>
 </div>
 </div>
 <div className="space-y-2 text-sm">
 <div className="flex items-start gap-2">
 <span className="text-heading font-bold">🌍</span>
 <div>
 <strong>环境变量解析</strong>
 <div className="text-xs text-body">$VAR 和 {'${VAR}'} 语法支持</div>
 </div>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-[var(--color-success)] font-bold">🔄</span>
 <div>
 <strong>自动迁移</strong>
 <div className="text-xs text-body">v1 扁平结构 → v2 嵌套结构</div>
 </div>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading font-bold">🛠️</span>
 <div>
 <strong>工具集组装</strong>
 <div className="text-xs text-body">Core + Discovery + MCP 三路合流</div>
 </div>
 </div>
 </div>
 </div>
 </HighlightBox>

 <div className="mt-4 bg-base/30 rounded-lg p-4 font-mono text-xs overflow-x-auto">
 <div className="text-dim mb-2">// 核心常量 - packages/cli/src/config/settings.ts</div>
 <div><span className="text-heading">USER_SETTINGS_PATH</span> = <span className="text-[var(--color-success)]">"~/.gemini/settings.json"</span> <span className="text-dim">// 用户配置</span></div>
 <div><span className="text-heading">WORKSPACE_SETTINGS_PATH</span> = <span className="text-[var(--color-success)]">".gemini/settings.json"</span> <span className="text-dim">// 项目配置</span></div>
 <div><span className="text-heading">GEMINI_DIR</span> = <span className="text-[var(--color-success)]">".gemini"</span> <span className="text-dim">// 配置目录名</span></div>
 <div><span className="text-heading">DEFAULT_EXCLUDED_ENV_VARS</span> = [<span className="text-[var(--color-success)]">"DEBUG"</span>, <span className="text-[var(--color-success)]">"DEBUG_MODE"</span>]</div>
 <div><span className="text-heading">MIGRATE_V2_OVERWRITE</span> = <span className="text-[var(--color-warning)]">true</span> <span className="text-dim">// 迁移写回 settings.json，并备份 .orig</span></div>
 <div className="mt-2 text-dim">// 合并策略枚举 - packages/cli/src/config/settingsSchema.ts:51-60</div>
 <div><span className="text-heading">MergeStrategy.REPLACE</span> = <span className="text-[var(--color-success)]">"replace"</span> <span className="text-dim">// 直接覆盖（默认）</span></div>
 <div><span className="text-heading">MergeStrategy.CONCAT</span> = <span className="text-[var(--color-success)]">"concat"</span> <span className="text-dim">// 数组拼接</span></div>
 <div><span className="text-heading">MergeStrategy.UNION</span> = <span className="text-[var(--color-success)]">"union"</span> <span className="text-dim">// 数组去重合并</span></div>
 <div><span className="text-heading">MergeStrategy.SHALLOW_MERGE</span> = <span className="text-[var(--color-success)]">"shallow_merge"</span> <span className="text-dim">// 对象浅合并</span></div>
 </div>
 </Layer>

 {/* 完整加载序列图 */}
 <Layer title="配置加载完整序列" icon="📊">
 <MermaidDiagram
 title="从 CLI 启动到 Config 实例创建的完整流程"
 chart={`sequenceDiagram
 participant CLI as CLI启动
 participant LS as loadSettings()
 participant Migrate as migrateSettingsToV2()
 participant Trust as isWorkspaceTrusted()
 participant Env as loadEnvironment()
 participant Merge as mergeSettings()
 participant LCC as loadCliConfig()
 participant Memory as loadHierarchicalGeminiMemory()
 participant Config as Config实例

 CLI->>LS: 1. 加载四层配置文件
 LS->>LS: 读取 system-defaults.json
 LS->>LS: 读取 ~/.gemini/settings.json
 LS->>LS: 读取 .gemini/settings.json
 LS->>LS: 读取 /etc/.../settings.json

 LS->>Migrate: 2. 检查并迁移 v1 → v2
 Migrate-->>LS: 返回迁移后的配置

 LS->>LS: 3. resolveEnvVarsInObject()
 Note right of LS: 解析 $VAR 和 \${VAR}

 LS->>Trust: 4. 初始信任检查
 Trust-->>LS: isTrusted: boolean

 LS->>Merge: 5. customDeepMerge()
 Note right of Merge: systemDefaults → user → workspace → system
 Merge-->>LS: 合并后的 Settings

 LS->>Env: 6. loadEnvironment()
 Note right of Env: 仅受信任目录加载项目 .env
 Env-->>LS: 环境变量已加载

 LS-->>CLI: 返回 LoadedSettings

 CLI->>LCC: 7. loadCliConfig()

 LCC->>Memory: 8. 加载 GEMINI.md 记忆
 Memory-->>LCC: userMemory: string

 LCC->>LCC: 9. mergeMcpServers()
 Note right of LCC: 合并 settings + extensions 的 MCP

 LCC->>LCC: 10. 确定 approvalMode
 Note right of LCC: CLI > settings > 默认

 LCC->>Trust: 11. 二次信任检查
 Trust-->>LCC: 不受信任 → 强制降级 approvalMode

 LCC->>Config: 12. new Config({...})
 Config-->>CLI: 返回完整 Config 实例`}
 />
 </Layer>

 {/* 配置层次 */}
 <Layer title="配置层次与优先级" icon="📁">
 <HighlightBox title="七层配置优先级（从低到高）" icon="🏗️" variant="blue">
 <p className="mb-2">配置按优先级从低到高合并，高优先级覆盖低优先级：</p>
 <ol className="list-decimal pl-5 space-y-1 text-sm">
 <li><strong>默认值</strong> - 代码中的硬编码默认</li>
 <li><strong>System Defaults</strong> - 系统级默认配置文件</li>
 <li><strong>User Settings</strong> - 用户级配置 <code>~/.gemini/settings.json</code></li>
 <li><strong>Workspace Settings</strong> - 项目级配置 <code>.gemini/settings.json</code></li>
 <li><strong>System Settings</strong> - 系统级覆盖配置（企业管控）</li>
 <li><strong>环境变量</strong> - <code>.env</code> 文件或 shell 环境</li>
 <li><strong>命令行参数</strong> - 启动时传入的参数</li>
 </ol>
 </HighlightBox>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div className="bg-elevated/10 border-2 border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">🏠 用户级配置</h4>
 <code className="text-xs text-body block mb-2">~/.gemini/settings.json</code>
 <p className="text-sm text-body">
 跨所有项目的全局配置，如 UI 偏好、默认模型等
 </p>
 </div>

 <div className="bg-elevated border-2 border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">📂 项目级配置</h4>
 <code className="text-xs text-body block mb-2">.gemini/settings.json</code>
 <p className="text-sm text-body">
 项目特定配置，覆盖用户级设置<br/>
 <span className="text-heading text-xs">⚠️ 非信任目录时被忽略</span>
 </p>
 </div>

 <div className="bg-[var(--color-success-soft)] border-2 border-[var(--color-success)] rounded-lg p-4">
 <h4 className="text-[var(--color-success)] font-bold mb-2">🏢 System Defaults</h4>
 <code className="text-xs text-body block mb-2">
 /etc/gemini-cli/system-defaults.json (Linux)<br/>
 /Library/Application Support/GeminiCli/system-defaults.json (macOS)
 </code>
 <p className="text-sm text-body">
 系统级默认值，可被用户/项目覆盖
 </p>
 </div>

 <div className="bg-[var(--color-danger-soft)] border-2 border-[var(--color-danger)] rounded-lg p-4">
 <h4 className="text-[var(--color-danger)] font-bold mb-2">🔒 System Settings (Override)</h4>
 <code className="text-xs text-body block mb-2">
 /etc/gemini-cli/settings.json (Linux)<br/>
 /Library/Application Support/GeminiCli/settings.json (macOS)
 </code>
 <p className="text-sm text-body">
 系统管理员强制覆盖，优先级最高
 </p>
 </div>
 </div>

 <CodeBlock
 title="packages/cli/src/config/settings.ts:140-161 - 系统配置路径"
 code={`// 获取系统级覆盖配置路径
export function getSystemSettingsPath(): string {
 // 环境变量覆盖
 if (process.env['GEMINI_CLI_SYSTEM_SETTINGS_PATH']) {
 return process.env['GEMINI_CLI_SYSTEM_SETTINGS_PATH'];
 }
 // 平台特定路径
 if (platform() === 'darwin') {
 return '/Library/Application Support/GeminiCli/settings.json';
 } else if (platform() === 'win32') {
 return 'C:\\\\ProgramData\\\\gemini-cli\\\\settings.json';
 } else {
 return '/etc/gemini-cli/settings.json';
 }
}

// 获取系统级默认配置路径
export function getSystemDefaultsPath(): string {
 if (process.env['GEMINI_CLI_SYSTEM_DEFAULTS_PATH']) {
 return process.env['GEMINI_CLI_SYSTEM_DEFAULTS_PATH'];
 }
 return path.join(
 path.dirname(getSystemSettingsPath()),
 'system-defaults.json',
 );
}`}
 />
 </Layer>

 {/* v2 结构 */}
 <Layer title="Settings v2 嵌套结构" icon="🆕">
 <HighlightBox title="v1 → v2 迁移" icon="⚠️" variant="orange">
 <p className="text-sm">
 v0.3.0 起采用嵌套结构。旧版 v1 扁平结构会自动迁移，原文件备份为 <code>settings.json.orig</code>。
 迁移判定不依赖版本字段，而是用 <code>needsMigration()</code> 扫描是否存在需要搬迁的 v1 顶层 key。
 </p>
 </HighlightBox>

 <JsonBlock
 code={`// Settings v2 完整结构示例
{
 // ═══════════════════════════════════════════
 // 顶层：MCP 服务器配置（特殊，保持顶层）
 // ═══════════════════════════════════════════
 "mcpServers": {
 "filesystem": {
 "command": "npx",
 "args": ["-y", "@anthropic/mcp-server-filesystem"],
 "trust": false
 }
 },

 // ═══════════════════════════════════════════
 // general - 通用设置
 // ═══════════════════════════════════════════
 "general": {
 "vimMode": false,
 "preferredEditor": "code",
 "disableAutoUpdate": false,
 "disableUpdateNag": false,
 "enablePromptCompletion": false,
 "checkpointing": {
 "enabled": false
 }
 },

 // ═══════════════════════════════════════════
 // ui - 界面设置
 // ═══════════════════════════════════════════
 "ui": {
 "theme": "GitHub",
 "hideBanner": false,
 "hideTips": false,
 "hideFooter": false,
 "hideWindowTitle": false,
 "showStatusInTitle": false,
 "showMemoryUsage": false,
 "showLineNumbers": false,
 "showCitations": true,
 "enableWelcomeBack": true,
 "customWittyPhrases": [],
 "footer": {
 "hideCWD": false,
 "hideSandboxStatus": false,
 "hideModelInfo": false
 },
 "accessibility": {
 "disableLoadingPhrases": false,
 "screenReader": false
 }
 },

 // ═══════════════════════════════════════════
 // model - 模型设置
 // ═══════════════════════════════════════════
 "model": {
 "name": "gemini-1.5-pro",
 "maxSessionTurns": -1,
 "sessionTokenLimit": null,
 "skipNextSpeakerCheck": true,
 "skipLoopDetection": false,
 "enableOpenAILogging": false,
 "openAILoggingDir": null,
 "chatCompression": {
 "contextPercentageThreshold": 0.7
 },
 "summarizeToolOutput": {
 "run_shell_command": { "tokenBudget": 2000 }
 },
 "generationConfig": {
 "timeout": 120000,
 "maxRetries": 3
 }
 },

 // ═══════════════════════════════════════════
 // tools - 工具设置
 // ═══════════════════════════════════════════
 "tools": {
 "autoAccept": false,
 "sandbox": false, // boolean | string（sandbox profile path）
 "useRipgrep": true,
 "useBuiltinRipgrep": true,
 "core": null, // 限制核心工具：["read_file", "edit", ...]
 "allowed": [ // 跳过确认的工具
 "run_shell_command(git status)",
 "run_shell_command(npm test)"
 ],
 "exclude": ["google_web_search"], // 排除的工具
 "discoveryCommand": null,
 "callCommand": null,
 "shell": {
 "enableInteractiveShell": false,
 "pager": "cat",
 "showColor": false
 }
 },

 // ═══════════════════════════════════════════
 // context - 上下文设置
 // ═══════════════════════════════════════════
 "context": {
 "fileName": ["GEMINI.md", "CONTEXT.md"],
 "importFormat": "tree", // tree | flat
 "discoveryMaxDirs": 200,
 "includeDirectories": [],
 "loadMemoryFromIncludeDirectories": false,
 "fileFiltering": {
 "respectGitIgnore": true,
 "respectGeminiIgnore": true,
 "enableRecursiveFileSearch": true,
 "disableFuzzySearch": false
 }
 },

 // ═══════════════════════════════════════════
 // mcp - MCP 设置
 // ═══════════════════════════════════════════
 "mcp": {
 "serverCommand": null,
 "allowed": ["filesystem"],
 "excluded": ["dangerous-server"]
 },

 // ═══════════════════════════════════════════
 // security - 安全设置
 // ═══════════════════════════════════════════
 "security": {
 "folderTrust": {
 "enabled": false
 },
 "auth": {
 "selectedType": "oauth-personal", // oauth-personal | gemini-api-key | vertex-ai | compute-default-credentials | cloud-shell
 "enforcedType": null,
 "useExternal": false,
 }
 },

 // ═══════════════════════════════════════════
 // 其他分类
 // ═══════════════════════════════════════════
 "ide": { "enabled": false },
 "privacy": { "usageStatisticsEnabled": true },
 "telemetry": { "enabled": false, "target": "local" },
 "output": { "format": "text" },
 "advanced": {
 "autoConfigureMemory": false,
 "excludedEnvVars": ["DEBUG", "DEBUG_MODE"],
 "tavilyApiKey": null
 },
 "webSearch": {
 "provider": [{ "type": "tavily", "apiKey": "$TAVILY_API_KEY" }],
 "default": "tavily"
 },
 "experimental": {
 "extensionManagement": true,
 "visionModelPreview": true,
 "vlmSwitchMode": null
 },
 "extensions": {
 "disabled": []
 }
}`}
 />
 </Layer>

 {/* v1 → v2 迁移映射 */}
 <Layer title="v1 → v2 字段映射与迁移" icon="🔄">
 <HighlightBox title="迁移逻辑详解" icon="⚙️" variant="purple">
 <p className="text-sm mb-2">
 <code>migrateSettingsToV2()</code> 函数负责将 v1 扁平结构迁移到 v2 嵌套结构。
 迁移时会备份原文件为 <code>.orig</code>。
 </p>
 <p className="text-xs text-body">
 源码位置: <code>packages/cli/src/config/settings.ts:253-321</code>
 </p>
 </HighlightBox>

 <CodeBlock
 title="packages/cli/src/config/settings.ts:71-139 - 迁移映射表"
 code={`// v1 字段 → v2 路径的完整映射表
const MIGRATION_MAP: Record<string, string> = {
 accessibility: 'ui.accessibility',
 allowedTools: 'tools.allowed',
 allowMCPServers: 'mcp.allowed',
 autoAccept: 'tools.autoAccept',
 autoConfigureMaxOldSpaceSize: 'advanced.autoConfigureMemory',
 bugCommand: 'advanced.bugCommand',
 chatCompression: 'model.compressionThreshold',
 checkpointing: 'general.checkpointing',
 coreTools: 'tools.core',
 contextFileName: 'context.fileName',
 customThemes: 'ui.customThemes',
 customWittyPhrases: 'ui.customWittyPhrases',
 debugKeystrokeLogging: 'general.debugKeystrokeLogging',
 disableAutoUpdate: 'general.disableAutoUpdate',
 disableUpdateNag: 'general.disableUpdateNag',
 dnsResolutionOrder: 'advanced.dnsResolutionOrder',
 enableHooks: 'tools.enableHooks',
 enablePromptCompletion: 'general.enablePromptCompletion',
 enforcedAuthType: 'security.auth.enforcedType',
 excludeTools: 'tools.exclude',
 excludeMCPServers: 'mcp.excluded',
 excludedProjectEnvVars: 'advanced.excludedEnvVars',
 extensionManagement: 'experimental.extensionManagement',
 extensions: 'extensions',
 fileFiltering: 'context.fileFiltering',
 folderTrustFeature: 'security.folderTrust.featureEnabled',
 folderTrust: 'security.folderTrust.enabled',
 hasSeenIdeIntegrationNudge: 'ide.hasSeenNudge',
 hideWindowTitle: 'ui.hideWindowTitle',
 showStatusInTitle: 'ui.showStatusInTitle',
 hideTips: 'ui.hideTips',
 hideBanner: 'ui.hideBanner',
 hideFooter: 'ui.hideFooter',
 hideCWD: 'ui.footer.hideCWD',
 hideSandboxStatus: 'ui.footer.hideSandboxStatus',
 hideModelInfo: 'ui.footer.hideModelInfo',
 hideContextSummary: 'ui.hideContextSummary',
 showMemoryUsage: 'ui.showMemoryUsage',
 showLineNumbers: 'ui.showLineNumbers',
 showCitations: 'ui.showCitations',
 ideMode: 'ide.enabled',
 includeDirectories: 'context.includeDirectories',
 loadMemoryFromIncludeDirectories: 'context.loadFromIncludeDirectories',
 maxSessionTurns: 'model.maxSessionTurns',
 mcpServers: 'mcpServers',
 mcpServerCommand: 'mcp.serverCommand',
 memoryImportFormat: 'context.importFormat',
 memoryDiscoveryMaxDirs: 'context.discoveryMaxDirs',
 model: 'model.name',
 preferredEditor: 'general.preferredEditor',
 retryFetchErrors: 'general.retryFetchErrors',
 sandbox: 'tools.sandbox',
 selectedAuthType: 'security.auth.selectedType',
 enableInteractiveShell: 'tools.shell.enableInteractiveShell',
 shellPager: 'tools.shell.pager',
 shellShowColor: 'tools.shell.showColor',
 shellInactivityTimeout: 'tools.shell.inactivityTimeout',
 skipNextSpeakerCheck: 'model.skipNextSpeakerCheck',
 summarizeToolOutput: 'model.summarizeToolOutput',
 telemetry: 'telemetry',
 theme: 'ui.theme',
 toolDiscoveryCommand: 'tools.discoveryCommand',
 toolCallCommand: 'tools.callCommand',
 usageStatisticsEnabled: 'privacy.usageStatisticsEnabled',
 useExternalAuth: 'security.auth.useExternal',
 useRipgrep: 'tools.useRipgrep',
 vimMode: 'general.vimMode',
};`}
 />

 <div className="overflow-x-auto mt-4">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-[var(--color-danger)]">v1 (旧)</th>
 <th className="text-left py-2 text-[var(--color-success)]">v2 (新)</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge"><td className="py-1"><code>vimMode</code></td><td><code>general.vimMode</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>theme</code></td><td><code>ui.theme</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>hideBanner</code></td><td><code>ui.hideBanner</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>model</code> (string)</td><td><code>model.name</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>allowedTools</code></td><td><code>tools.allowed</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>excludeTools</code></td><td><code>tools.exclude</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>coreTools</code></td><td><code>tools.core</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>autoAccept</code></td><td><code>tools.autoAccept</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>sandbox</code></td><td><code>tools.sandbox</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>shouldUseNodePtyShell</code></td><td><code>tools.shell.enableInteractiveShell</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>selectedAuthType</code></td><td><code>security.auth.selectedType</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>enforcedAuthType</code></td><td><code>security.auth.enforcedType</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>mcpServers</code></td><td><code>mcpServers</code> (保持顶层)</td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>allowMCPServers</code></td><td><code>mcp.allowed</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>excludeMCPServers</code></td><td><code>mcp.excluded</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>contextFileName</code></td><td><code>context.fileName</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>includeDirectories</code></td><td><code>context.includeDirectories</code></td></tr>
 <tr className="border- border-edge"><td className="py-1"><code>folderTrust</code></td><td><code>security.folderTrust.enabled</code></td></tr>
 <tr><td className="py-1"><code>tavilyApiKey</code></td><td><code>advanced.tavilyApiKey</code> (deprecated)</td></tr>
 </tbody>
 </table>
 </div>

 <CodeBlock
 title="packages/cli/src/config/settings.ts - needsMigration()（节选）"
 code={`// 检查配置是否需要迁移
export function needsMigration(settings: Record<string, unknown>): boolean {
 const hasV1Keys = Object.entries(MIGRATION_MAP).some(([v1Key, v2Path]) => {
 // 跳过路径相同的（如 mcpServers）
 if (v1Key === v2Path || !(v1Key in settings)) {
 return false;
 }

 // 特殊处理：如果是 v2 容器（如 'model'）且值是对象，
 // 则认为已经是 v2 格式
 if (
 KNOWN_V2_CONTAINERS.has(v1Key) &&
 typeof settings[v1Key] === 'object' &&
 settings[v1Key] !== null
 ) {
 return false;
 }
 return true;
 });

 return hasV1Keys;
}`}
 />
 </Layer>

 {/* 四层合并策略可视化 */}
 <Layer title="四层合并策略 (核心机制)" icon="🔀">
 <HighlightBox title="customDeepMerge 合并顺序" icon="⚡" variant="purple">
 <p className="text-sm mb-3">
 配置通过 <code>customDeepMerge</code> 按优先级顺序合并，后面的层覆盖前面的层：
 </p>
 <div className="flex flex-col gap-2">
 {/* 可视化合并流程 */}
 <div className="flex items-center gap-2 flex-wrap">
 <div className="bg-elevated border border-edge rounded px-3 py-2 text-center">
 <div className="text-xs text-body">Layer 1</div>
 <div className="text-[var(--color-success)] font-mono text-sm">systemDefaults</div>
 <div className="text-xs text-dim">最低优先级</div>
 </div>
 <span className="text-heading">→</span>
 <div className="bg-elevated/30 border border-edge rounded px-3 py-2 text-center">
 <div className="text-xs text-body">Layer 2</div>
 <div className="text-heading font-mono text-sm">user</div>
 <div className="text-xs text-dim">~/.gemini/</div>
 </div>
 <span className="text-heading">→</span>
 <div className="bg-elevated border border-edge rounded px-3 py-2 text-center relative">
 <div className="text-xs text-body">Layer 3</div>
 <div className="text-heading font-mono text-sm">workspace</div>
 <div className="text-xs text-heading">⚠️ 需信任</div>
 </div>
 <span className="text-heading">→</span>
 <div className="bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/50 rounded px-3 py-2 text-center">
 <div className="text-xs text-body">Layer 4</div>
 <div className="text-[var(--color-danger)] font-mono text-sm">system</div>
 <div className="text-xs text-dim">最高优先级</div>
 </div>
 </div>
 </div>
 </HighlightBox>

 <CodeBlock
 title="packages/cli/src/config/settings.ts:396-419 - 四层合并核心函数"
 code={`// 四层配置合并
function mergeSettings(
 system: Settings, // Layer 4: 系统覆盖（企业管控）
 systemDefaults: Settings, // Layer 1: 系统默认值
 user: Settings, // Layer 2: 用户配置
 workspace: Settings, // Layer 3: 项目配置
 isTrusted: boolean, // 工作区是否受信任
): Settings {
 // ⚠️ 非信任工作区 → workspace 配置被替换为空对象
 const safeWorkspace = isTrusted ? workspace : ({} as Settings);

 // Settings are merged with the following precedence (last one wins):
 // 1. System Defaults (最低)
 // 2. User Settings
 // 3. Workspace Settings
 // 4. System Settings (最高)
 return customDeepMerge(
 getMergeStrategyForPath, // 根据字段路径决定合并策略
 {}, // 空对象作为基础
 systemDefaults, // 1. 系统默认
 user, // 2. 用户配置
 safeWorkspace, // 3. 项目配置（可能为空）
 system, // 4. 系统覆盖（最高优先级）
 ) as Settings;
}`}
 />

 <CodeBlock
 title="packages/cli/src/utils/deepMerge.ts - customDeepMerge 实现"
 code={`// 策略感知的深度合并实现
function mergeRecursively(
 target: MergeableObject,
 source: MergeableObject,
 getMergeStrategyForPath: (path: string[]) => MergeStrategy | undefined,
 path: string[] = [],
) {
 for (const key of Object.keys(source)) {
 // 防止原型链污染
 if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
 continue;
 }

 const newPath = [...path, key];
 const srcValue = source[key];
 const objValue = target[key];
 const mergeStrategy = getMergeStrategyForPath(newPath);

 // 1️⃣ SHALLOW_MERGE: 对象浅合并
 if (mergeStrategy === MergeStrategy.SHALLOW_MERGE && objValue && srcValue) {
 const obj1 = typeof objValue === 'object' && objValue !== null ? objValue : {};
 const obj2 = typeof srcValue === 'object' && srcValue !== null ? srcValue : {};
 target[key] = { ...obj1, ...obj2 };
 continue;
 }

 // 2️⃣ 数组合并策略
 if (Array.isArray(objValue)) {
 const srcArray = Array.isArray(srcValue) ? srcValue : [srcValue];

 if (mergeStrategy === MergeStrategy.CONCAT) {
 // CONCAT: 直接拼接数组
 target[key] = objValue.concat(srcArray);
 continue;
 }
 if (mergeStrategy === MergeStrategy.UNION) {
 // UNION: 去重合并
 target[key] = [...new Set(objValue.concat(srcArray))];
 continue;
 }
 }

 // 3️⃣ 对象递归合并
 if (isPlainObject(objValue) && isPlainObject(srcValue)) {
 mergeRecursively(objValue, srcValue, getMergeStrategyForPath, newPath);
 } else if (isPlainObject(srcValue)) {
 target[key] = {};
 mergeRecursively(target[key] as MergeableObject, srcValue, getMergeStrategyForPath, newPath);
 } else {
 // 4️⃣ REPLACE（默认）: 直接覆盖
 target[key] = srcValue;
 }
 }
 return target;
}

// 主入口函数
export function customDeepMerge(
 getMergeStrategyForPath: (path: string[]) => MergeStrategy | undefined,
 ...sources: MergeableObject[]
): MergeableObject {
 const result: MergeableObject = {};
 for (const source of sources) {
 if (source) {
 mergeRecursively(result, source, getMergeStrategyForPath);
 }
 }
 return result;
}`}
 />

 {/* 合并策略类型 */}
 <HighlightBox title="MergeStrategy 枚举" icon="🎯" variant="blue">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div className="bg-base/30 rounded p-3">
 <div className="text-heading font-bold text-sm mb-1">REPLACE (默认)</div>
 <p className="text-xs text-body mb-2">高优先级的值直接替换低优先级</p>
 <div className="text-xs font-mono">
 <span className="text-dim">user:</span> <span className="text-[var(--color-success)]">"dark"</span>
 <span className="text-dim mx-1">+</span>
 <span className="text-dim">workspace:</span> <span className="text-heading">"light"</span>
 <span className="text-dim mx-1">=</span>
 <span className="text-[var(--color-warning)]">"light"</span>
 </div>
 </div>
 <div className="bg-base/30 rounded p-3">
 <div className="text-heading font-bold text-sm mb-1">CONCAT</div>
 <p className="text-xs text-body mb-2">数组按顺序拼接（可能重复）</p>
 <div className="text-xs font-mono">
 <span className="text-[var(--color-success)]">["a"]</span>
 <span className="text-dim mx-1">+</span>
 <span className="text-heading">["b"]</span>
 <span className="text-dim mx-1">=</span>
 <span className="text-[var(--color-warning)]">["a","b"]</span>
 </div>
 </div>
 <div className="bg-base/30 rounded p-3">
 <div className="text-[var(--color-success)] font-bold text-sm mb-1">UNION</div>
 <p className="text-xs text-body mb-2">数组合并并去重</p>
 <div className="text-xs font-mono">
 <span className="text-[var(--color-success)]">["a","b"]</span>
 <span className="text-dim mx-1">+</span>
 <span className="text-heading">["b","c"]</span>
 <span className="text-dim mx-1">=</span>
 <span className="text-[var(--color-warning)]">["a","b","c"]</span>
 </div>
 </div>
 <div className="bg-base/30 rounded p-3">
 <div className="text-heading font-bold text-sm mb-1">SHALLOW_MERGE</div>
 <p className="text-xs text-body mb-2">对象浅合并（顶层 key 合并）</p>
 <div className="text-xs font-mono">
 <span className="text-[var(--color-success)]">{'{a:1}'}</span>
 <span className="text-dim mx-1">+</span>
 <span className="text-heading">{'{b:2}'}</span>
 <span className="text-dim mx-1">=</span>
 <span className="text-[var(--color-warning)]">{'{a:1,b:2}'}</span>
 </div>
 </div>
 </div>
 </HighlightBox>

 {/* 字段策略映射表 */}
 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-body">字段路径</th>
 <th className="text-left py-2 text-heading">合并策略</th>
 <th className="text-left py-2 text-body">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-1"><code>mcpServers</code></td>
 <td className="text-heading">SHALLOW_MERGE</td>
 <td className="text-xs">多层定义的 MCP 服务器按 key 合并</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1"><code>context.includeDirectories</code></td>
 <td className="text-heading">CONCAT</td>
 <td className="text-xs">用户级 + 项目级目录拼接</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1"><code>tools.exclude</code></td>
 <td className="text-[var(--color-success)]">UNION</td>
 <td className="text-xs">排除工具列表去重合并</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1"><code>advanced.excludedEnvVars</code></td>
 <td className="text-[var(--color-success)]">UNION</td>
 <td className="text-xs">排除的环境变量去重</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1"><code>extensions.disabled</code></td>
 <td className="text-[var(--color-success)]">UNION</td>
 <td className="text-xs">禁用扩展列表去重</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-1"><code>ui.theme</code></td>
 <td className="text-heading">REPLACE</td>
 <td className="text-xs">高优先级直接覆盖</td>
 </tr>
 <tr>
 <td className="py-1"><code>其他字段</code></td>
 <td className="text-heading">REPLACE</td>
 <td className="text-xs">默认策略：后覆盖前</td>
 </tr>
 </tbody>
 </table>
 </div>

 <CodeBlock
 title="packages/cli/src/config/settings.ts:35-48 - 策略查找逻辑"
 code={`// 根据字段路径查找合并策略
function getMergeStrategyForPath(path: string[]): MergeStrategy | undefined {
 let current: SettingDefinition | undefined = undefined;
 let currentSchema: SettingsSchema | undefined = getSettingsSchema();

 // 遍历路径层级，查找 schema 定义
 for (const key of path) {
 if (!currentSchema || !currentSchema[key]) {
 return undefined; // 未定义 → 使用默认 REPLACE
 }
 current = currentSchema[key];
 currentSchema = current.properties; // 进入嵌套
 }

 return current?.mergeStrategy; // 返回定义的策略或 undefined
}`}
 />
 </Layer>

 {/* 环境变量解析 */}
 <Layer title="环境变量解析机制" icon="🌍">
 <HighlightBox title="$VAR 和 \${VAR} 语法支持" icon="💡" variant="green">
 <p className="text-sm">
 settings.json 中的字符串值可以使用 <code>$VAR</code> 或 <code>{'${VAR}'}</code> 语法引用环境变量，
 加载时自动解析。例如：<code>"apiKey": "$MY_API_TOKEN"</code>
 </p>
 </HighlightBox>

 <CodeBlock
 title="packages/cli/src/utils/envVarResolver.ts - 环境变量解析实现"
 code={`/**
 * 解析字符串中的环境变量
 * 支持 $VAR_NAME 和 \${VAR_NAME} 两种语法
 */
export function resolveEnvVarsInString(value: string): string {
 const envVarRegex = /\\$(?:(\\w+)|{([^}]+)})/g; // 匹配 $VAR 或 \${VAR}

 return value.replace(envVarRegex, (match, varName1, varName2) => {
 const varName = varName1 || varName2;
 // 如果环境变量存在，替换为其值
 if (process && process.env && typeof process.env[varName] === 'string') {
 return process.env[varName]!;
 }
 // 不存在则保留原始占位符
 return match;
 });
}

/**
 * 递归解析对象中的所有字符串值
 * 使用 WeakSet 防止循环引用
 */
export function resolveEnvVarsInObject<T>(obj: T): T {
 return resolveEnvVarsInObjectInternal(obj, new WeakSet());
}

function resolveEnvVarsInObjectInternal<T>(
 obj: T,
 visited: WeakSet<object>,
): T {
 // 基本类型直接返回
 if (obj === null || obj === undefined ||
 typeof obj === 'boolean' || typeof obj === 'number') {
 return obj;
 }

 // 字符串：解析环境变量
 if (typeof obj === 'string') {
 return resolveEnvVarsInString(obj) as unknown as T;
 }

 // 数组：递归处理每个元素
 if (Array.isArray(obj)) {
 if (visited.has(obj)) {
 return [...obj] as unknown as T; // 防止循环
 }
 visited.add(obj);
 const result = obj.map((item) =>
 resolveEnvVarsInObjectInternal(item, visited),
 ) as unknown as T;
 visited.delete(obj);
 return result;
 }

 // 对象：递归处理每个属性
 if (typeof obj === 'object') {
 if (visited.has(obj as object)) {
 return { ...obj } as T; // 防止循环
 }
 visited.add(obj as object);
 const newObj = { ...obj } as T;
 for (const key in newObj) {
 if (Object.prototype.hasOwnProperty.call(newObj, key)) {
 newObj[key] = resolveEnvVarsInObjectInternal(newObj[key], visited);
 }
 }
 visited.delete(obj as object);
 return newObj;
 }

 return obj;
}`}
 />

 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-[var(--color-success-soft)] border-2 border-[var(--color-success)] rounded-lg p-4">
 <h4 className="text-[var(--color-success)] font-bold mb-2">解析示例</h4>
 <div className="text-xs space-y-2 font-mono">
 <div>
 <span className="text-body">输入:</span> <span className="text-[var(--color-success)]">"$API_KEY"</span><br/>
 <span className="text-body">输出:</span> <span className="text-[var(--color-warning)]">"sk-xxxx"</span>
 </div>
 <div>
 <span className="text-body">输入:</span> <span className="text-[var(--color-success)]">"{'${BASE_URL}'}/api"</span><br/>
 <span className="text-body">输出:</span> <span className="text-[var(--color-warning)]">"https://example.com/api"</span>
 </div>
 <div>
 <span className="text-body">输入:</span> <span className="text-[var(--color-success)]">"$UNDEFINED_VAR"</span><br/>
 <span className="text-body">输出:</span> <span className="text-[var(--color-danger)]">"$UNDEFINED_VAR"</span> (保留)
 </div>
 </div>
 </div>

 <div className="bg-elevated/10 border-2 border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">解析时机</h4>
 <p className="text-sm text-body mb-2">
 环境变量在 <code>loadSettings()</code> 中、配置合并前解析：
 </p>
 <CodeBlock
 code={`// settings.ts:712-716
systemSettings = resolveEnvVarsInObject(systemResult.settings);
systemDefaultSettings = resolveEnvVarsInObject(systemDefaultsResult.settings);
userSettings = resolveEnvVarsInObject(userResult.settings);
workspaceSettings = resolveEnvVarsInObject(workspaceResult.settings);`}
 />
 </div>
 </div>

 <CodeBlock
 title="常用环境变量"
 code={`# 认证相关
GEMINI_API_KEY=... # Gemini API Key（AuthType=gemini-api-key）
GOOGLE_API_KEY=... # Vertex AI API key（可选）
GOOGLE_CLOUD_PROJECT=... # Vertex AI project
GOOGLE_CLOUD_LOCATION=... # Vertex AI location

# 默认模型
GEMINI_MODEL=gemini-2.5-pro # 覆盖默认模型选择

# 沙箱
GEMINI_SANDBOX=true # 启用沙箱 (true|docker|podman)
SEATBELT_PROFILE=permissive-open # macOS 沙箱 profile

# 遥测
GEMINI_TELEMETRY_ENABLED=true
GEMINI_TELEMETRY_TARGET=local # local | gcp
GEMINI_TELEMETRY_OTLP_ENDPOINT=http://localhost:4317

# OAuth/存储
GEMINI_FORCE_ENCRYPTED_FILE_STORAGE=true # 强制使用更安全的 token 存储
NO_BROWSER=true # 禁止自动打开浏览器（改用手动授权码）

# Prompt 调试
GEMINI_SYSTEM_MD=./GEMINI.md
GEMINI_WRITE_SYSTEM_MD=/tmp/system.md

# 调试
DEBUG=1 # 调试模式
NO_COLOR=1 # 禁用颜色输出

# Web 搜索
TAVILY_API_KEY=tvly-... # Tavily API 密钥

# IDE
GEMINI_CLI_IDE_SERVER_PORT=54321
GEMINI_CLI_IDE_WORKSPACE_PATH=/path/to/project

# 系统配置路径覆盖
GEMINI_CLI_SYSTEM_SETTINGS_PATH=/custom/path/settings.json
GEMINI_CLI_SYSTEM_DEFAULTS_PATH=/custom/path/system-defaults.json

# 代理
HTTPS_PROXY=http://proxy:8080
HTTP_PROXY=http://proxy:8080`}
 />
 </Layer>

 {/* .env 文件加载 */}
 <Layer title=".env 文件加载机制" icon="📄">
 <HighlightBox title="loadEnvironment() 加载逻辑" icon="⚙️" variant="blue">
 <p className="text-sm mb-2">
 <code>loadEnvironment()</code> 负责发现和加载 .env 文件，受信任检查影响。
 </p>
 <p className="text-xs text-body">
 源码位置: <code>packages/cli/src/config/settings.ts:537-577</code>
 </p>
 </HighlightBox>

 <CodeBlock
 title="packages/cli/src/config/settings.ts:486-513 - .env 文件发现"
 code={`// 向上遍历查找 .env 文件
function findEnvFile(startDir: string): string | null {
 let currentDir = path.resolve(startDir);

 while (true) {
 // 1. 优先查找 .gemini/.env（项目特定）
 const geminiEnvPath = path.join(currentDir, GEMINI_DIR, '.env');
 if (fs.existsSync(geminiEnvPath)) {
 return geminiEnvPath;
 }

 // 2. 回退到项目根目录的 .env
 const envPath = path.join(currentDir, '.env');
 if (fs.existsSync(envPath)) {
 return envPath;
 }

 // 3. 向上遍历父目录
 const parentDir = path.dirname(currentDir);
 if (parentDir === currentDir || !parentDir) {
 // 到达根目录，检查 home 目录
 const homeGeminiEnvPath = path.join(homedir(), GEMINI_DIR, '.env');
 if (fs.existsSync(homeGeminiEnvPath)) {
 return homeGeminiEnvPath;
 }
 const homeEnvPath = path.join(homedir(), '.env');
 if (fs.existsSync(homeEnvPath)) {
 return homeEnvPath;
 }
 return null;
 }
 currentDir = parentDir;
 }
}`}
 />

 <CodeBlock
 title="packages/cli/src/config/settings.ts:537-577 - .env 加载与信任检查"
 code={`export function loadEnvironment(settings: Settings): void {
 const envFilePath = findEnvFile(process.cwd());

 // ⚠️ 关键：非信任目录不加载项目级 .env
 if (!isWorkspaceTrusted(settings).isTrusted) {
 return;
 }

 // Cloud Shell 特殊处理
 if (process.env['CLOUD_SHELL'] === 'true') {
 setUpCloudShellEnvironment(envFilePath);
 }

 if (envFilePath) {
 try {
 const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
 const parsedEnv = dotenv.parse(envFileContent);

 // 获取排除列表
 const excludedVars = settings?.advanced?.excludedEnvVars || DEFAULT_EXCLUDED_ENV_VARS;
 const isProjectEnvFile = !envFilePath.includes(GEMINI_DIR);

 for (const key in parsedEnv) {
 if (Object.hasOwn(parsedEnv, key)) {
 // 项目级 .env：跳过排除的变量（如 DEBUG）
 if (isProjectEnvFile && excludedVars.includes(key)) {
 continue;
 }

 // 只加载尚未设置的环境变量（不覆盖 shell 环境）
 if (!Object.hasOwn(process.env, key)) {
 process.env[key] = parsedEnv[key];
 }
 }
 }
 } catch (_e) {
 // 静默忽略错误
 }
 }
}`}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div className="bg-[var(--color-success-soft)] border-2 border-[var(--color-success)] rounded-lg p-4">
 <h4 className="text-[var(--color-success)] font-bold mb-2">.env 搜索优先级</h4>
 <ol className="text-sm space-y-1 list-decimal pl-4 text-body">
 <li><code>.gemini/.env</code> (当前目录)</li>
 <li><code>.env</code> (当前目录)</li>
 <li>向上遍历父目录重复 1-2</li>
 <li><code>~/.gemini/.env</code> (home)</li>
 <li><code>~/.env</code> (home)</li>
 </ol>
 </div>

 <div className="bg-[var(--color-danger-soft)] border-2 border-[var(--color-danger)] rounded-lg p-4">
 <h4 className="text-[var(--color-danger)] font-bold mb-2">排除的环境变量</h4>
 <p className="text-sm text-body mb-2">
 项目级 .env 中的这些变量不会被加载：
 </p>
 <div className="text-xs font-mono space-y-1">
 <div><code className="text-heading">DEBUG</code> - 调试模式</div>
 <div><code className="text-heading">DEBUG_MODE</code> - 调试模式</div>
 <div className="text-body mt-2">可通过 <code>advanced.excludedEnvVars</code> 自定义</div>
 </div>
 </div>
 </div>
 </Layer>

 {/* 配置加载流程 */}
 <Layer title="loadSettings() 完整实现" icon="⚙️">
 <CodeBlock
 title="packages/cli/src/config/settings.ts:583-792 - loadSettings 核心实现"
 code={`export function loadSettings(
 workspaceDir: string = process.cwd(),
): LoadedSettings {
 let systemSettings: Settings = {};
 let systemDefaultSettings: Settings = {};
 let userSettings: Settings = {};
 let workspaceSettings: Settings = {};
 const settingsErrors: SettingsError[] = [];
 const migratedInMemorScopes = new Set<SettingScope>();

 // 解析符号链接，获取真实路径
 const resolvedWorkspaceDir = path.resolve(workspaceDir);
 const resolvedHomeDir = path.resolve(homedir());
 let realWorkspaceDir = resolvedWorkspaceDir;
 try {
 realWorkspaceDir = fs.realpathSync(resolvedWorkspaceDir);
 } catch (_e) { /* 目录可能不存在 */ }
 const realHomeDir = fs.realpathSync(resolvedHomeDir);

 const workspaceSettingsPath = new Storage(workspaceDir).getWorkspaceSettingsPath();

 // ═══════════════════════════════════════════
 // 1. 加载并迁移各层配置文件
 // ═══════════════════════════════════════════
 const loadAndMigrate = (filePath: string, scope: SettingScope) => {
 try {
 if (fs.existsSync(filePath)) {
 const content = fs.readFileSync(filePath, 'utf-8');
 const rawSettings = JSON.parse(stripJsonComments(content));

 // 验证是否为有效 JSON 对象
 if (typeof rawSettings !== 'object' || rawSettings === null || Array.isArray(rawSettings)) {
 settingsErrors.push({ message: 'Settings file is not a valid JSON object.', path: filePath });
 return { settings: {} };
 }

 let settingsObject = rawSettings;

 // v1 → v2 迁移
 if (needsMigration(settingsObject)) {
 const migratedSettings = migrateSettingsToV2(settingsObject);
 if (migratedSettings) {
 // 备份原文件并写入迁移后的配置
 fs.renameSync(filePath, \`\${filePath}.orig\`);
 fs.writeFileSync(filePath, JSON.stringify(migratedSettings, null, 2), 'utf-8');
 settingsObject = migratedSettings;
 }
 }

 return { settings: settingsObject, rawJson: content };
 }
 } catch (error) {
 settingsErrors.push({ message: getErrorMessage(error), path: filePath });
 }
 return { settings: {} };
 };

 // 加载四层配置
 const systemResult = loadAndMigrate(getSystemSettingsPath(), SettingScope.System);
 const systemDefaultsResult = loadAndMigrate(getSystemDefaultsPath(), SettingScope.SystemDefaults);
 const userResult = loadAndMigrate(USER_SETTINGS_PATH, SettingScope.User);

 // ⚠️ 特殊处理：如果工作区是 home 目录，跳过 workspace 配置
 let workspaceResult = { settings: {} as Settings, rawJson: undefined };
 if (realWorkspaceDir !== realHomeDir) {
 workspaceResult = loadAndMigrate(workspaceSettingsPath, SettingScope.Workspace);
 }

 // ═══════════════════════════════════════════
 // 2. 保存原始配置（用于后续保存）
 // ═══════════════════════════════════════════
 const systemOriginalSettings = structuredClone(systemResult.settings);
 const userOriginalSettings = structuredClone(userResult.settings);
 const workspaceOriginalSettings = structuredClone(workspaceResult.settings);

 // ═══════════════════════════════════════════
 // 3. 解析环境变量
 // ═══════════════════════════════════════════
 systemSettings = resolveEnvVarsInObject(systemResult.settings);
 systemDefaultSettings = resolveEnvVarsInObject(systemDefaultsResult.settings);
 userSettings = resolveEnvVarsInObject(userResult.settings);
 workspaceSettings = resolveEnvVarsInObject(workspaceResult.settings);

 // ═══════════════════════════════════════════
 // 4. 主题名称兼容性处理
 // ═══════════════════════════════════════════
 if (userSettings.ui?.theme === 'VS') {
 userSettings.ui.theme = DefaultLight.name;
 } else if (userSettings.ui?.theme === 'VS2015') {
 userSettings.ui.theme = DefaultDark.name;
 }

 // ═══════════════════════════════════════════
 // 5. 初始信任检查（只用 user + system）
 // ═══════════════════════════════════════════
 const initialTrustCheckSettings = customDeepMerge(
 getMergeStrategyForPath, {}, systemSettings, userSettings,
 );
 const isTrusted = isWorkspaceTrusted(initialTrustCheckSettings as Settings).isTrusted ?? true;

 // ═══════════════════════════════════════════
 // 6. 临时合并并加载环境变量
 // ═══════════════════════════════════════════
 const tempMergedSettings = mergeSettings(
 systemSettings, systemDefaultSettings, userSettings, workspaceSettings, isTrusted,
 );
 loadEnvironment(tempMergedSettings);

 // 错误处理
 if (settingsErrors.length > 0) {
 throw new FatalConfigError(settingsErrors.map(
 (e) => \`Error in \${e.path}: \${e.message}\`
 ).join('\\n'));
 }

 // ═══════════════════════════════════════════
 // 7. 返回 LoadedSettings 实例
 // ═══════════════════════════════════════════
 return new LoadedSettings(
 { path: getSystemSettingsPath(), settings: systemSettings, originalSettings: systemOriginalSettings },
 { path: getSystemDefaultsPath(), settings: systemDefaultSettings, originalSettings: systemDefaultsOriginalSettings },
 { path: USER_SETTINGS_PATH, settings: userSettings, originalSettings: userOriginalSettings },
 { path: workspaceSettingsPath, settings: workspaceSettings, originalSettings: workspaceOriginalSettings },
 isTrusted,
 migratedInMemorScopes,
 );
}`}
 />

 <CodeBlock
 title="packages/cli/src/config/settings.ts:421-484 - LoadedSettings 类"
 code={`// LoadedSettings 封装四层配置
export class LoadedSettings {
 constructor(
 system: SettingsFile, // 系统覆盖配置
 systemDefaults: SettingsFile, // 系统默认配置
 user: SettingsFile, // 用户配置
 workspace: SettingsFile, // 工作区配置
 isTrusted: boolean, // 是否受信任
 migratedInMemorScopes: Set<SettingScope>,
 ) {
 this.system = system;
 this.systemDefaults = systemDefaults;
 this.user = user;
 this.workspace = workspace;
 this.isTrusted = isTrusted;
 this.migratedInMemorScopes = migratedInMemorScopes;
 this._merged = this.computeMergedSettings(); // 立即计算合并结果
 }

 readonly system: SettingsFile;
 readonly systemDefaults: SettingsFile;
 readonly user: SettingsFile;
 readonly workspace: SettingsFile;
 readonly isTrusted: boolean;

 private _merged: Settings;

 // 对外暴露合并后的配置
 get merged(): Settings {
 return this._merged;
 }

 // 计算合并结果
 private computeMergedSettings(): Settings {
 return mergeSettings(
 this.system.settings,
 this.systemDefaults.settings,
 this.user.settings,
 this.workspace.settings,
 this.isTrusted,
 );
 }

 // 根据 scope 获取对应配置文件
 forScope(scope: SettingScope): SettingsFile {
 switch (scope) {
 case SettingScope.User: return this.user;
 case SettingScope.Workspace: return this.workspace;
 case SettingScope.System: return this.system;
 case SettingScope.SystemDefaults: return this.systemDefaults;
 }
 }

 // 动态修改配置并重新计算合并结果
 setValue(scope: SettingScope, key: string, value: unknown): void {
 const settingsFile = this.forScope(scope);
 setNestedProperty(settingsFile.settings, key, value);
 setNestedProperty(settingsFile.originalSettings, key, value);
 this._merged = this.computeMergedSettings(); // 重算！
 saveSettings(settingsFile); // 持久化到文件
 }
}`}
 />
 </Layer>

 {/* 命令行参数 */}
 <Layer title="命令行参数" icon="💻">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2 text-sm">
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--model, -m</code>
 <span className="text-body ml-2">指定模型</span>
 </div>
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--approval-mode</code>
 <span className="text-body ml-2">default|auto_edit|yolo</span>
 </div>
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--yolo</code>
 <span className="text-body ml-2">自动批准所有工具调用</span>
 </div>
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--sandbox, -s</code>
 <span className="text-body ml-2">启用沙箱</span>
 </div>
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--allowed-tools</code>
 <span className="text-body ml-2">跳过确认的工具</span>
 </div>
 </div>
 <div className="space-y-2 text-sm">
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--prompt, -p</code>
 <span className="text-body ml-2">非交互模式</span>
 </div>
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--output-format</code>
 <span className="text-body ml-2">text|json</span>
 </div>
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--include-directories</code>
 <span className="text-body ml-2">多工作区目录</span>
 </div>
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--checkpointing</code>
 <span className="text-body ml-2">启用检查点</span>
 </div>
 <div className="bg-elevated/5 rounded p-2">
 <code className="text-heading">--screen-reader</code>
 <span className="text-body ml-2">屏幕阅读器模式</span>
 </div>
 </div>
 </div>

 <CodeBlock
 title="packages/cli/src/config/config.ts:477-519 - approvalMode 解析"
 code={`// Determine approval mode with backward compatibility
let approvalMode: ApprovalMode;
if (argv.approvalMode) {
 // New --approval-mode flag takes precedence
 switch (argv.approvalMode) {
 case 'yolo':
 approvalMode = ApprovalMode.YOLO;
 break;
 case 'auto_edit':
 approvalMode = ApprovalMode.AUTO_EDIT;
 break;
 case 'default':
 approvalMode = ApprovalMode.DEFAULT;
 break;
 default:
 throw new Error(
 \`Invalid approval mode: \${argv.approvalMode}. Valid values are: yolo, auto_edit, default\`,
 );
 }
} else {
 // Legacy --yolo flag
 approvalMode = argv.yolo || false ? ApprovalMode.YOLO : ApprovalMode.DEFAULT;
}

// Force approval mode to default if the folder is not trusted.
if (!trustedFolder && approvalMode !== ApprovalMode.DEFAULT) {
 approvalMode = ApprovalMode.DEFAULT;
}`}
 />
 </Layer>

 {/* .gemini 目录结构 */}
 <Layer title=".gemini 目录结构" icon="📂">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated/10 border-2 border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">~/.gemini/ (用户级)</h4>
 <pre className="text-sm text-body whitespace-pre-wrap">{`├── settings.json # 用户配置
├── GEMINI.md # 用户级记忆
├── oauth_creds.json # OAuth 凭据
├── mcp-oauth-tokens.json # MCP OAuth tokens
├── agents/ # 用户级子代理
├── commands/ # 用户级自定义命令
├── extensions/ # 用户级扩展
├── themes/ # 主题文件
└── tmp/ # 临时文件
 └── <project_hash>/
 ├── chats/ # 聊天记录
 ├── checkpoints/ # 检查点
 └── shell_history # Shell 历史`}</pre>
 </div>

 <div className="bg-elevated border-2 border-edge rounded-lg p-4">
 <h4 className="text-heading font-bold mb-2">.gemini/ (项目级)</h4>
 <pre className="text-sm text-body whitespace-pre-wrap">{`├── settings.json # 项目配置
├── GEMINI.md # 项目级记忆
├── agents/ # 项目级子代理
├── commands/ # 项目级自定义命令
├── extensions/ # 项目级扩展
├── sandbox.Dockerfile # 自定义沙箱镜像
├── sandbox.bashrc # 沙箱 shell 配置
└── sandbox-macos-*.sb # macOS 沙箱 profile`}</pre>
 </div>
 </div>
 </Layer>

 {/* 信任机制 */}
 <Layer title="工作区信任与配置安全" icon="🔐">
 <HighlightBox title="非信任工作区限制" icon="⚠️" variant="red">
 <p className="text-sm mb-2">
 当 <code>security.folderTrust.enabled: true</code> 且工作区未被信任时：
 </p>
 <ul className="list-disc pl-5 text-sm space-y-1">
 <li>项目级 <code>.gemini/settings.json</code> <strong>被忽略</strong></li>
 <li>项目级 <code>.gemini/commands/</code> <strong>不加载</strong></li>
 <li>项目级 <code>.gemini/extensions/</code> <strong>不加载</strong></li>
 <li>项目级 <code>.env</code> 文件 <strong>不加载</strong></li>
 <li>approvalMode 被强制降级为 <code>default</code>（无法启用 <code>auto_edit</code>/<code>yolo</code>）</li>
 </ul>
 </HighlightBox>

 <CodeBlock
 title="packages/cli/src/config/config.ts:605-615 - approvalMode 强制降级"
 code={`// loadCliConfig() 中的 approval mode 校验
if (
 !trustedFolder &&
 approvalMode !== ApprovalMode.DEFAULT
) {
 logger.warn(
 \`Approval mode overridden to "default" because the current folder is not trusted.\`,
 );
 approvalMode = ApprovalMode.DEFAULT;
}

// ⚠️ yolo 和 auto_edit 在不受信任目录强制降级为 default`}
 />

 <HighlightBox title="信任检查触发时机" icon="⏱️" variant="purple">
 <div className="text-sm space-y-2">
 <div className="flex items-start gap-2">
 <span className="text-heading">1.</span>
 <div>
 <strong>loadSettings() 阶段</strong> - 决定是否加载 workspace settings
 <div className="text-xs text-body mt-1">
 位置: <code>packages/cli/src/config/settings.ts:396-418</code>
 </div>
 </div>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading">2.</span>
 <div>
 <strong>loadEnvironment() 阶段</strong> - 决定是否加载项目级 .env
 <div className="text-xs text-body mt-1">
 位置: <code>packages/cli/src/config/settings.ts:537-541</code>
 </div>
 </div>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading">3.</span>
 <div>
 <strong>loadCliConfig() 阶段</strong> - 校验和降级 approvalMode
 <div className="text-xs text-body mt-1">
 位置: <code>packages/cli/src/config/config.ts:605-615</code>
 </div>
 </div>
 </div>
 <div className="flex items-start gap-2">
 <span className="text-heading">4.</span>
 <div>
 <strong>loadHierarchicalGeminiMemory() 阶段</strong> - 决定是否加载项目级 GEMINI.md
 <div className="text-xs text-body mt-1">
 位置: <code>packages/core/src/utils/memoryDiscovery.ts:359</code>
 </div>
 </div>
 </div>
 </div>
 </HighlightBox>
 </Layer>

 {/* loadCliConfig() 完整链路 */}
 <Layer title="loadCliConfig() 完整链路" icon="🔄">
 <HighlightBox title="配置加载入口函数" icon="🚀" variant="blue">
 <p className="text-sm mb-2">
 <code>loadCliConfig()</code> 是 CLI 启动时的核心配置加载函数，位于 <code>packages/cli/src/config/config.ts:522</code>
 </p>
 <p className="text-sm text-body">
 该函数负责：配置合并、环境变量解析、记忆加载、工具注册、MCP 服务器发现、审批模式校验等完整初始化流程
 </p>
 </HighlightBox>

 <MermaidDiagram
 title="loadCliConfig() 数据流向图"
 chart={`flowchart TB
 Start([CLI 启动]) --> LoadSettings[loadSettings<br/>四层配置加载]
 LoadSettings --> MergeSettings[mergeSettings<br/>配置合并]
 MergeSettings --> TrustCheck{folderTrust<br/>检查}

 TrustCheck -->|受信任| LoadEnv[loadEnvironment<br/>加载 .env]
 TrustCheck -->|不受信任| SkipEnv[跳过项目级 .env]

 LoadEnv --> LoadMemory[loadHierarchicalGeminiMemory<br/>加载 GEMINI.md]
 SkipEnv --> LoadMemory

 LoadMemory --> MergeMcp[mergeMcpServers<br/>合并 MCP 服务器配置]

 MergeMcp --> ApprovalCheck{approvalMode<br/>校验}
 ApprovalCheck -->|不受信任 & yolo/auto_edit| ForceDefault[强制降级至 default]
 ApprovalCheck -->|合法| KeepMode[保持 approval mode]

 ForceDefault --> CreateConfig[new Config]
 KeepMode --> CreateConfig

 CreateConfig --> ToolRegistry[createToolRegistry<br/>工具集组装]

 ToolRegistry --> CoreTools[注册核心工具<br/>read_file/replace/run_shell_command/...]
 ToolRegistry --> DiscoveryTools[discoveryCommand<br/>发现外部工具]
 ToolRegistry --> McpTools[MCP 工具<br/>从 MCP 服务器]

 CoreTools --> FinalConfig([Config 实例])
 DiscoveryTools --> FinalConfig
 McpTools --> FinalConfig

 style Start stroke:#0891b2
 style FinalConfig stroke:#16a34a
 style TrustCheck stroke:#d97706
 style ApprovalCheck stroke:#d97706
 style ForceDefault stroke:#dc2626
 style LoadMemory stroke:#7c3aed
 style ToolRegistry stroke:#0891b2`}
 />

 <CodeBlock
 title="packages/cli/src/config/config.ts:522-805 - loadCliConfig 核心流程"
 code={`export async function loadCliConfig(
 settings: Settings, // 已合并的 Settings 对象
 extensions: Extension[], // 加载的扩展列表
 extensionEnablementManager: ExtensionEnablementManager,
 sessionId: string,
 argv: CliArgs, // 命令行参数
 cwd: string = process.cwd(),
): Promise<Config> {
 // 1️⃣ 基础准备
 const debugMode = isDebugMode(argv);
 const folderTrust = settings.security?.folderTrust?.enabled ?? false;
 const trustedFolder = isWorkspaceTrusted(settings)?.isTrusted ?? true;

 // 2️⃣ 激活扩展筛选
 const allExtensions = annotateActiveExtensions(extensions, cwd, extensionEnablementManager);
 const activeExtensions = extensions.filter((_, i) => allExtensions[i].isActive);

 // 3️⃣ 设置上下文文件名
 if (settings.context?.fileName) {
 setServerGeminiMdFilename(settings.context.fileName);
 }

 // 4️⃣ 加载层级记忆（GEMINI.md）
 const { memoryContent, fileCount } = await loadHierarchicalGeminiMemory(
 cwd,
 settings.context?.loadMemoryFromIncludeDirectories ? includeDirectories : [],
 debugMode, fileService, settings, extensionContextFilePaths,
 trustedFolder, // ⚠️ 受信任才加载项目级记忆
 memoryImportFormat, fileFiltering,
 );

 // 5️⃣ 合并 MCP 服务器配置
 let mcpServers = mergeMcpServers(settings, activeExtensions);

 // 6️⃣ 确定 approval mode（带后向兼容）
 let approvalMode: ApprovalMode;
 if (argv.approvalMode) {
 // New --approval-mode flag takes precedence
 switch (argv.approvalMode) {
 case 'yolo':
 approvalMode = ApprovalMode.YOLO;
 break;
 case 'auto_edit':
 approvalMode = ApprovalMode.AUTO_EDIT;
 break;
 case 'default':
 approvalMode = ApprovalMode.DEFAULT;
 break;
 default:
 throw new Error(
 \`Invalid approval mode: \${argv.approvalMode}. Valid values are: yolo, auto_edit, default\`,
 );
 }
 } else {
 // Legacy --yolo flag
 approvalMode = argv.yolo || false ? ApprovalMode.YOLO : ApprovalMode.DEFAULT;
 }

 // 7️⃣ YOLO 可被 settings 禁用（禁用时强制降级）
 if (settings.security?.disableYoloMode && approvalMode === ApprovalMode.YOLO) {
 approvalMode = ApprovalMode.DEFAULT;
 }

 // 8️⃣ 🔐 强制安全降级：不受信任 → 降级至 default
 if (!trustedFolder && approvalMode !== ApprovalMode.DEFAULT) {
 logger.warn('Approval mode overridden to "default" because the current folder is not trusted.');
 approvalMode = ApprovalMode.DEFAULT;
 }

 // 8️⃣ 模型解析优先级：CLI > 环境变量 > settings
 const resolvedModel =
 argv.model ||
 process.env['OPENAI_MODEL'] ||
 process.env['GEMINI_MODEL'] ||
 settings.model?.name;

 // 9️⃣ 创建 Config 实例
 return new Config({
 sessionId,
 targetDir: cwd,
 includeDirectories,
 debugMode,
 approvalMode,
 mcpServers,
 userMemory: memoryContent,
 model: resolvedModel,
 generationConfig: {
 ...(settings.model?.generationConfig || {}),
 model: resolvedModel,
 apiKey: argv.openaiApiKey || process.env['OPENAI_API_KEY'] || settings.security?.auth?.apiKey,
 baseUrl: argv.openaiBaseUrl || process.env['OPENAI_BASE_URL'] || settings.security?.auth?.baseUrl,
 },
 // ... 其他配置
 });
}`}
 />
 </Layer>

 {/* MCP 服务器合并 */}
 <Layer title="MCP 服务器配置合并" icon="🔌">
 <HighlightBox title="mergeMcpServers() 合并逻辑" icon="⚙️" variant="purple">
 <p className="text-sm mb-2">
 MCP 服务器配置来源于 <code>settings.mcpServers</code> 和扩展定义，
 按 key 去重合并（settings 优先）。
 </p>
 <p className="text-xs text-body">
 源码位置: <code>packages/cli/src/config/config.ts:838-857</code>
 </p>
 </HighlightBox>

 <CodeBlock
 title="packages/cli/src/config/config.ts:838-857 - MCP 服务器合并"
 code={`function mergeMcpServers(settings: Settings, extensions: Extension[]) {
 // 1. 从 settings 复制 MCP 服务器配置
 const mcpServers = { ...(settings.mcpServers || {}) };

 // 2. 合并扩展提供的 MCP 服务器
 for (const extension of extensions) {
 Object.entries(extension.config.mcpServers || {}).forEach(([key, server]) => {
 // ⚠️ 冲突检测：settings 中已存在同名服务器则跳过
 if (mcpServers[key]) {
 logger.warn(
 \`Skipping extension MCP config for server with key "\${key}" as it already exists.\`,
 );
 return;
 }

 // 记录扩展来源
 mcpServers[key] = {
 ...server,
 extensionName: extension.config.name,
 };
 });
 }

 return mcpServers;
}`}
 />

 <CodeBlock
 title="packages/cli/src/config/config.ts:666-693 - MCP 白名单/黑名单过滤"
 code={`// 应用 mcp.allowed 白名单
if (!argv.allowedMcpServerNames) {
 if (settings.mcp?.allowed) {
 mcpServers = allowedMcpServers(
 mcpServers,
 settings.mcp.allowed,
 blockedMcpServers, // 记录被阻止的服务器
 );
 }

 // 应用 mcp.excluded 黑名单
 if (settings.mcp?.excluded) {
 const excludedNames = new Set(settings.mcp.excluded.filter(Boolean));
 if (excludedNames.size > 0) {
 mcpServers = Object.fromEntries(
 Object.entries(mcpServers).filter(([key]) => !excludedNames.has(key)),
 );
 }
 }
}

// CLI 参数 --allowed-mcp-server-names 优先级最高
if (argv.allowedMcpServerNames) {
 mcpServers = allowedMcpServers(mcpServers, argv.allowedMcpServerNames, blockedMcpServers);
}`}
 />
 </Layer>

 {/* 工具排除合并 */}
 <Layer title="工具排除列表合并" icon="🛠️">
 <CodeBlock
 title="packages/cli/src/config/config.ts:859-874 - mergeExcludeTools"
 code={`function mergeExcludeTools(
 settings: Settings,
 extensions: Extension[],
 extraExcludes?: string[] | undefined,
): string[] {
 // 1. 从 settings 和额外排除列表开始
 const allExcludeTools = new Set([
 ...(settings.tools?.exclude || []),
 ...(extraExcludes || []),
 ]);

 // 2. 合并扩展定义的排除工具
 for (const extension of extensions) {
 for (const tool of extension.config.excludeTools || []) {
 allExcludeTools.add(tool);
 }
 }

 // 3. 去重返回
 return [...allExcludeTools];
}`}
 />

 <HighlightBox title="非交互模式的额外排除" icon="⚠️" variant="orange">
 <p className="text-sm mb-2">
 在非交互模式下，根据 approvalMode 自动排除需要用户确认的工具：
 </p>
 <CodeBlock
 code={`// config.ts:640-658
if (!interactive && !argv.experimentalAcp) {
 switch (approvalMode) {
 case ApprovalMode.DEFAULT:
 // 排除所有需要审批的工具
 extraExcludes.push(ShellTool.Name, EditTool.Name, WriteFileTool.Name);
 break;
 case ApprovalMode.AUTO_EDIT:
 // 只排除 Shell（仍需审批）
 extraExcludes.push(ShellTool.Name);
 break;
 case ApprovalMode.YOLO:
 // 不排除任何工具
 break;
 }
}`}
 />
 </HighlightBox>
 </Layer>

 {/* 源码位置 */}
 <Layer title="源码导航" icon="📍">
 <HighlightBox title="配置系统核心源码" icon="📁" variant="blue">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge">
 <th className="text-left py-2 text-heading">文件</th>
 <th className="text-left py-2 text-body">行号</th>
 <th className="text-left py-2 text-body">功能</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-1"><code>packages/cli/src/config/settings.ts</code></td>
 <td>35-48</td>
 <td className="text-xs">getMergeStrategyForPath() 策略查找</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settings.ts</code></td>
 <td>63-138</td>
 <td className="text-xs">MIGRATION_MAP v1→v2 映射表</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settings.ts</code></td>
 <td>222-251</td>
 <td className="text-xs">needsMigration() 迁移检测</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settings.ts</code></td>
 <td>253-321</td>
 <td className="text-xs">migrateSettingsToV2() 迁移实现</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settings.ts</code></td>
 <td>396-419</td>
 <td className="text-xs">mergeSettings() 四层合并</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settings.ts</code></td>
 <td>421-484</td>
 <td className="text-xs">LoadedSettings 类</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settings.ts</code></td>
 <td>486-513</td>
 <td className="text-xs">findEnvFile() .env 发现</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settings.ts</code></td>
 <td>537-577</td>
 <td className="text-xs">loadEnvironment() 环境变量加载</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settings.ts</code></td>
 <td>583-792</td>
 <td className="text-xs">loadSettings() 主入口</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settingsSchema.ts</code></td>
 <td>51-60</td>
 <td className="text-xs">MergeStrategy 枚举定义</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/settingsSchema.ts</code></td>
 <td>91-1188</td>
 <td className="text-xs">SETTINGS_SCHEMA 完整定义</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/utils/deepMerge.ts</code></td>
 <td>24-90</td>
 <td className="text-xs">customDeepMerge() 策略感知合并</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/utils/envVarResolver.ts</code></td>
 <td>20-112</td>
 <td className="text-xs">环境变量解析实现</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/config.ts</code></td>
 <td>522-805</td>
 <td className="text-xs">loadCliConfig() 完整加载链路</td>
 </tr>
 <tr className="border- border-edge">
 <td><code>packages/cli/src/config/config.ts</code></td>
 <td>838-857</td>
 <td className="text-xs">mergeMcpServers() MCP 合并</td>
 </tr>
 <tr>
 <td><code>packages/cli/src/config/config.ts</code></td>
 <td>859-874</td>
 <td className="text-xs">mergeExcludeTools() 工具排除合并</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>
 </Layer>

 {/* ==================== 深化内容 ==================== */}

 {/* 边界条件深度解析 */}
 <Layer title="边界条件深度解析" icon="🔬">
 <p className="text-body mb-4">
 配置系统在加载和合并过程中会遇到各种边界情况。理解这些边界有助于诊断配置问题。
 </p>

 {/* 边界 1: 循环引用符号链接 */}
 <div className="bg-surface rounded-lg p-5 mb-4 ">
 <h4 className="text-lg font-semibold text-[var(--color-warning)] mb-3">边界 1: 工作区目录是符号链接</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">场景描述</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 工作区通过符号链接访问</li>
 <li>• 符号链接指向 home 目录</li>
 <li>• 符号链接循环引用</li>
 </ul>
 </div>
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">处理方式</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 使用 <code className="text-heading">fs.realpathSync()</code> 解析真实路径</li>
 <li>• 如果解析后等于 home 目录，跳过 workspace 配置</li>
 <li>• 解析失败时使用原始路径</li>
 </ul>
 </div>
 </div>
 <CodeBlock
 code={`// settings.ts:594-600
let realWorkspaceDir = resolvedWorkspaceDir;
try {
 realWorkspaceDir = fs.realpathSync(resolvedWorkspaceDir);
} catch (_e) {
 // 目录可能不存在，使用原始路径
}

// 如果工作区就是 home 目录，跳过 workspace 配置
if (realWorkspaceDir !== realHomeDir) {
 workspaceResult = loadAndMigrate(workspaceSettingsPath, SettingScope.Workspace);
}`}
 />
 </div>

 {/* 边界 2: JSON 解析失败 */}
 <div className="bg-surface rounded-lg p-5 mb-4 ">
 <h4 className="text-lg font-semibold text-[var(--color-danger)] mb-3">边界 2: 配置文件 JSON 解析失败</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">触发条件</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• JSON 语法错误（缺少逗号、引号不匹配）</li>
 <li>• 文件内容为数组而非对象</li>
 <li>• 文件内容为 null 或非 JSON</li>
 <li>• 编码问题（BOM、非 UTF-8）</li>
 </ul>
 </div>
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">处理方式</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 记录错误到 <code className="text-heading">settingsErrors</code> 数组</li>
 <li>• 该层配置视为空对象 <code className="text-heading">{'{}'}</code></li>
 <li>• 继续加载其他层配置</li>
 <li>• 最终合并时不受影响</li>
 </ul>
 </div>
 </div>
 <div className="mt-4 p-3 bg-[var(--color-danger-soft)] rounded-lg border border-[var(--color-danger)]">
 <h5 className="text-[var(--color-danger)] font-semibold mb-2">⚠️ 注意</h5>
 <p className="text-sm text-body">
 配置解析失败不会阻止 CLI 启动，但可能导致期望的配置未生效。
 错误信息会在启动日志中显示。
 </p>
 </div>
 </div>

 {/* 边界 3: 环境变量解析边界 */}
 <div className="bg-surface rounded-lg p-5 mb-4 ">
 <h4 className="text-lg font-semibold text-heading mb-3">边界 3: 环境变量解析边界</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">特殊情况</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• <code className="text-heading">$VAR</code> 未定义 → 保留原值</li>
 <li>• <code className="text-heading">{'${VAR:-default}'}</code> → 不支持默认值语法</li>
 <li>• 嵌套解析 <code className="text-heading">${'${$VAR}'}</code> → 不支持</li>
 <li>• <code className="text-heading">$$VAR</code> → 解析为 <code>$值</code></li>
 </ul>
 </div>
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">解析规则</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 只解析字符串类型的值</li>
 <li>• 深度递归处理嵌套对象和数组</li>
 <li>• 解析发生在合并之前</li>
 <li>• 每层配置独立解析</li>
 </ul>
 </div>
 </div>
 <div className="mt-4 overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-body">
 <th className="text-left p-2">输入</th>
 <th className="text-left p-2">环境变量</th>
 <th className="text-left p-2">输出</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono text-xs">
 <tr className="border- border-edge/50">
 <td className="p-2 text-[var(--color-success)]">"$API_KEY"</td>
 <td className="p-2">API_KEY=sk-xxx</td>
 <td className="p-2">"sk-xxx"</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2 text-[var(--color-success)]">"{'${BASE_URL}'}/api"</td>
 <td className="p-2">BASE_URL=https://a.com</td>
 <td className="p-2">"https://a.com/api"</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2 text-[var(--color-success)]">"$UNDEFINED"</td>
 <td className="p-2 text-dim">未定义</td>
 <td className="p-2 text-[var(--color-warning)]">"$UNDEFINED"</td>
 </tr>
 <tr>
 <td className="p-2 text-[var(--color-success)]">"$$ESCAPE"</td>
 <td className="p-2">ESCAPE=value</td>
 <td className="p-2">"$value"</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 {/* 边界 4: 迁移失败 */}
 <div className="bg-surface rounded-lg p-5 mb-4 ">
 <h4 className="text-lg font-semibold text-heading mb-3">边界 4: v1 → v2 迁移失败</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">失败场景</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 文件写入权限不足</li>
 <li>• 磁盘空间不足</li>
 <li>• 文件被其他进程锁定</li>
 <li>• 配置包含无法迁移的自定义字段</li>
 </ul>
 </div>
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">容错机制</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 迁移失败不阻止启动</li>
 <li>• 使用内存中的迁移结果</li>
 <li>• 下次启动重新尝试迁移</li>
 <li>• 原文件不被修改</li>
 </ul>
 </div>
 </div>
 <CodeBlock
 code={`// settings.ts:618-630 - 迁移写入逻辑
if (needsMigration(settingsObject)) {
 const migratedSettings = migrateSettingsToV2(settingsObject);
 if (migratedSettings) {
 try {
 // 备份原文件
 fs.renameSync(filePath, \`\${filePath}.orig\`);
 // 写入迁移后的配置
 fs.writeFileSync(filePath, JSON.stringify(migratedSettings, null, 2));
 settingsObject = migratedSettings;
 migratedScopes.add(scope);
 } catch (e) {
 // 写入失败，仍使用内存中的迁移结果
 settingsObject = migratedSettings;
 migratedInMemoryScopes.add(scope);
 }
 }
}`}
 />
 </div>

 {/* 边界 5: 信任状态边界 */}
 <div className="bg-surface rounded-lg p-5 ">
 <h4 className="text-lg font-semibold text-[var(--color-success)] mb-3">边界 5: 信任状态的级联影响</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">非信任状态触发</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• <code className="text-heading">security.folderTrust.enabled = true</code></li>
 <li>• 当前目录不在信任列表中</li>
 <li>• 无法获取用户交互确认</li>
 </ul>
 </div>
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">级联影响</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• workspace 配置被忽略</li>
 <li>• 项目 .env 不加载</li>
 <li>• approvalMode 强制降级为 DEFAULT</li>
 <li>• MCP Server 不启动</li>
 </ul>
 </div>
 </div>
 <div className="mt-4 p-3 bg-[var(--color-success-soft)] rounded-lg border border-[var(--color-success)]">
 <h5 className="text-[var(--color-success)] font-semibold mb-2">✅ 安全设计</h5>
 <p className="text-sm text-body">
 信任检查分两次进行：第一次仅用 user+system 配置（排除 workspace），
 决定是否加载 workspace 配置；第二次使用完整合并后的配置，决定功能降级。
 </p>
 </div>
 </div>
 </Layer>

 {/* 常见问题与调试技巧 */}
 <Layer title="常见问题与调试技巧" icon="🐛">
 <p className="text-body mb-4">
 配置问题通常表现为：设置不生效、意外行为、权限问题等。以下是常见问题的诊断方法。
 </p>

 {/* 问题 1 */}
 <div className="bg-surface rounded-lg p-5 mb-4">
 <div className="flex items-start gap-4">
 <span className="text-3xl">🔴</span>
 <div className="flex-1">
 <h4 className="text-lg font-semibold text-[var(--color-danger)] mb-2">问题：配置修改后不生效</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">症状</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 修改了 settings.json</li>
 <li>• 重启 CLI 后设置未生效</li>
 <li>• 或者部分设置生效部分不生效</li>
 </ul>
 </div>
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">可能原因</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 1. 更高优先级的配置覆盖了</li>
 <li>• 2. JSON 语法错误导致整个文件未加载</li>
 <li>• 3. 目录不受信任，workspace 配置被忽略</li>
 <li>• 4. 配置路径错误（v1 vs v2 结构）</li>
 </ul>
 </div>
 </div>
 <CodeBlock
 code={`# 调试方法 1: 查看实际加载的配置
DEBUG=gemini:config gemini

# 调试方法 2: 检查配置文件语法
cat ~/.gemini/settings.json | jq .

# 调试方法 3: 查看信任状态
gemini --help # 观察是否有信任提示

# 调试方法 4: 查看配置合并结果
# 在代码中添加日志
console.log(JSON.stringify(mergedSettings, null, 2));`}
 />
 </div>
 </div>
 </div>

 {/* 问题 2 */}
 <div className="bg-surface rounded-lg p-5 mb-4">
 <div className="flex items-start gap-4">
 <span className="text-3xl">🟡</span>
 <div className="flex-1">
 <h4 className="text-lg font-semibold text-[var(--color-warning)] mb-2">问题：环境变量在配置中不解析</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">症状</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 配置中写了 "$API_KEY"</li>
 <li>• 但实际值仍是字符串 "$API_KEY"</li>
 <li>• API 调用失败</li>
 </ul>
 </div>
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">可能原因</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 1. 环境变量未设置</li>
 <li>• 2. 配置解析时环境变量未加载</li>
 <li>• 3. 使用了不支持的语法（如 {'${VAR:-default}'}）</li>
 <li>• 4. 配置值不是字符串类型</li>
 </ul>
 </div>
 </div>
 <CodeBlock
 code={`# 调试方法 1: 确认环境变量已设置
echo $API_KEY

# 调试方法 2: 在 .env 中设置（会被自动加载）
echo "API_KEY=sk-xxx" >> ~/.gemini/.env

# 调试方法 3: 检查配置值类型
# 环境变量只解析字符串值，数字/布尔不会解析
{
 "security": {
 "auth": {
 "apiKey": "$API_KEY" // ✓ 字符串，会解析
 }
 },
 "model": {
 "maxRetries": "$MAX_RETRIES" // ✗ 期望数字，不会解析
 }
}`}
 />
 </div>
 </div>
 </div>

 {/* 问题 3 */}
 <div className="bg-surface rounded-lg p-5 mb-4">
 <div className="flex items-start gap-4">
 <span className="text-3xl">🟠</span>
 <div className="flex-1">
 <h4 className="text-lg font-semibold text-heading mb-2">问题：v1 → v2 迁移后配置丢失</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">症状</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 升级后某些配置失效</li>
 <li>• settings.json 结构变了</li>
 <li>• 出现 settings.json.orig 备份</li>
 </ul>
 </div>
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">解决方案</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 1. 检查 .orig 备份中的原始配置</li>
 <li>• 2. 对照 MIGRATION_MAP 手动迁移缺失项</li>
 <li>• 3. 自定义字段需要手动移动</li>
 <li>• 4. 注意 model 字段变为 model.name</li>
 </ul>
 </div>
 </div>
 <CodeBlock
 code={`# 查看原始备份
cat ~/.gemini/settings.json.orig

# 常见迁移错误
# v1: "model": "gemini-1.5-pro"
# v2: "model": { "name": "gemini-1.5-pro" }

# v1: "allowedTools": [...]
# v2: "tools": { "allowed": [...] }

# 自定义字段不会自动迁移
# 需要手动添加到新配置中`}
 />
 </div>
 </div>
 </div>

 {/* 问题 4 */}
 <div className="bg-surface rounded-lg p-5 mb-4">
 <div className="flex items-start gap-4">
 <span className="text-3xl">🔵</span>
 <div className="flex-1">
 <h4 className="text-lg font-semibold text-heading mb-2">问题：MCP Server 配置不生效</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">症状</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 配置了 mcpServers</li>
 <li>• 但 MCP 工具不可用</li>
 <li>• 或者连接失败</li>
 </ul>
 </div>
 <div>
 <h5 className="text-sm font-semibold text-body mb-2">可能原因</h5>
 <ul className="text-sm text-body space-y-1">
 <li>• 1. MCP Server 在 mcp.excluded 列表中</li>
 <li>• 2. 目录不受信任，MCP 不启动</li>
 <li>• 3. command/args 配置错误</li>
 <li>• 4. 依赖未安装（如 npx 找不到包）</li>
 </ul>
 </div>
 </div>
 <CodeBlock
 code={`# 调试 MCP 连接
DEBUG=gemini:mcp gemini

# 检查 MCP 排除列表
jq '.mcp.excluded' ~/.gemini/settings.json

# 手动测试 MCP Server 命令
npx -y @anthropic/mcp-server-filesystem

# 检查信任状态（非信任目录不启动 MCP）
gemini config --show | grep trust`}
 />
 </div>
 </div>
 </div>

 {/* 调试工具速查 */}
 <HighlightBox title="调试工具速查表" icon="🔧" variant="blue">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-body">
 <th className="text-left p-2">场景</th>
 <th className="text-left p-2">命令 / 方法</th>
 <th className="text-left p-2">输出内容</th>
 </tr>
 </thead>
 <tbody className="text-body font-mono text-xs">
 <tr className="border- border-edge/50">
 <td className="p-2">配置加载过程</td>
 <td className="p-2 text-heading">DEBUG=gemini:config gemini</td>
 <td>各层配置加载和合并详情</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">环境变量解析</td>
 <td className="p-2 text-heading">DEBUG=gemini:env gemini</td>
 <td>.env 文件加载和变量解析</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">信任状态</td>
 <td className="p-2 text-heading">DEBUG=gemini:trust gemini</td>
 <td>信任检查过程和结果</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">JSON 语法检查</td>
 <td className="p-2 text-heading">cat file.json | jq .</td>
 <td>格式化输出或语法错误</td>
 </tr>
 <tr>
 <td className="p-2">查看最终配置</td>
 <td className="p-2 text-heading">gemini config --show</td>
 <td>合并后的最终配置</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>
 </Layer>

 {/* 性能优化建议 */}
 <Layer title="性能优化建议" icon="⚡">
 <p className="text-body mb-4">
 配置加载发生在 CLI 启动时，优化配置加载可以减少启动延迟。
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* 优化 1 */}
 <div className="bg-surface rounded-lg p-5 border border-[var(--color-success)]">
 <div className="flex items-center gap-3 mb-4">
 <span className="text-2xl">📁</span>
 <h4 className="text-lg font-semibold text-[var(--color-success)]">减少配置文件数量</h4>
 </div>
 <p className="text-sm text-body mb-3">
 每个配置文件都需要磁盘 I/O 和 JSON 解析。
 </p>
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">合并用户级和项目级配置</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">删除空的配置文件</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">避免创建不必要的层级</span>
 </div>
 </div>
 <div className="mt-4 p-3 bg-surface rounded-lg">
 <div className="text-xs text-dim">性能数据</div>
 <div className="text-sm text-body mt-1">
 每个配置文件: <span className="text-[var(--color-warning)]">~2-5ms</span><br/>
 4 层全加载: <span className="text-[var(--color-warning)]">~10-20ms</span>
 </div>
 </div>
 </div>

 {/* 优化 2 */}
 <div className="bg-surface rounded-lg p-5 border border-edge">
 <div className="flex items-center gap-3 mb-4">
 <span className="text-2xl">🔄</span>
 <h4 className="text-lg font-semibold text-heading">避免复杂的环境变量</h4>
 </div>
 <p className="text-sm text-body mb-3">
 环境变量解析需要递归遍历整个配置树。
 </p>
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">只在必要时使用环境变量</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">避免在数组中使用环境变量</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">敏感值用 .env 而非配置文件</span>
 </div>
 </div>
 <div className="mt-4 p-3 bg-surface rounded-lg">
 <div className="text-xs text-dim">性能数据</div>
 <div className="text-sm text-body mt-1">
 环境变量解析: <span className="text-[var(--color-success)]">&lt; 1ms</span><br/>
 深度嵌套: <span className="text-[var(--color-warning)]">~2-3ms</span>
 </div>
 </div>
 </div>

 {/* 优化 3 */}
 <div className="bg-surface rounded-lg p-5 border border-[var(--color-warning)]">
 <div className="flex items-center gap-3 mb-4">
 <span className="text-2xl">📄</span>
 <h4 className="text-lg font-semibold text-[var(--color-warning)]">.env 文件位置优化</h4>
 </div>
 <p className="text-sm text-body mb-3">
 .env 文件搜索会向上遍历目录树。
 </p>
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">将 .env 放在项目根目录</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">或使用 .gemini/.env 精确匹配</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-warning)]">△</span>
 <span className="text-body">避免深层嵌套目录启动 CLI</span>
 </div>
 </div>
 <div className="mt-4 p-3 bg-surface rounded-lg">
 <div className="text-xs text-dim">性能影响</div>
 <div className="text-sm text-body mt-1">
 每级目录遍历: <span className="text-[var(--color-success)]">~0.5ms</span><br/>
 10 层深度: <span className="text-[var(--color-warning)]">~5ms</span>
 </div>
 </div>
 </div>

 {/* 优化 4 */}
 <div className="bg-surface rounded-lg p-5 border border-edge">
 <div className="flex items-center gap-3 mb-4">
 <span className="text-2xl">🚀</span>
 <h4 className="text-lg font-semibold text-heading">启动配置缓存</h4>
 </div>
 <p className="text-sm text-body mb-3">
 对于长期运行的场景，配置可以缓存。
 </p>
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">Config 实例是单例</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-success)]">✓</span>
 <span className="text-body">LoadedSettings 支持保存</span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <span className="text-[var(--color-warning)]">△</span>
 <span className="text-body">热重载时需重新加载</span>
 </div>
 </div>
 <div className="mt-4 p-3 bg-surface rounded-lg">
 <div className="text-xs text-dim">缓存效果</div>
 <div className="text-sm text-body mt-1">
 首次加载: <span className="text-[var(--color-warning)]">~30-50ms</span><br/>
 缓存命中: <span className="text-[var(--color-success)]">&lt; 1ms</span>
 </div>
 </div>
 </div>
 </div>

 {/* 性能基准 */}
 <HighlightBox title="配置加载性能基准" icon="📊" variant="purple">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-body">
 <th className="text-left p-2">阶段</th>
 <th className="text-left p-2">典型耗时</th>
 <th className="text-left p-2">影响因素</th>
 </tr>
 </thead>
 <tbody className="text-body text-xs">
 <tr className="border- border-edge/50">
 <td className="p-2">文件读取 (4 层)</td>
 <td className="p-2 text-[var(--color-success)]">5-15ms</td>
 <td className="text-dim">磁盘类型、文件大小</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">JSON 解析</td>
 <td className="p-2 text-[var(--color-success)]">1-3ms</td>
 <td className="text-dim">配置复杂度</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">v1→v2 迁移</td>
 <td className="p-2 text-[var(--color-warning)]">5-20ms</td>
 <td className="text-dim">仅首次、配置大小</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">环境变量解析</td>
 <td className="p-2 text-[var(--color-success)]">&lt; 1ms</td>
 <td className="text-dim">变量数量</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">配置合并</td>
 <td className="p-2 text-[var(--color-success)]">1-3ms</td>
 <td className="text-dim">嵌套深度</td>
 </tr>
 <tr className="border- border-edge/50">
 <td className="p-2">.env 搜索</td>
 <td className="p-2 text-[var(--color-success)]">1-5ms</td>
 <td className="text-dim">目录深度</td>
 </tr>
 <tr>
 <td className="p-2 font-semibold">总计</td>
 <td className="p-2 text-[var(--color-warning)]">15-50ms</td>
 <td className="text-dim">典型启动</td>
 </tr>
 </tbody>
 </table>
 </div>
 </HighlightBox>
 </Layer>

 {/* 与其他模块的交互关系 */}
 <Layer title="与其他模块的交互关系" icon="🔗">
 <p className="text-body mb-4">
 配置系统是 CLI 的基础设施，被几乎所有模块依赖。
 </p>

 <MermaidDiagram
 title="配置系统依赖关系"
 chart={`flowchart TB
 subgraph Entry["入口层"]
 CLI[CLI 启动]
 ARGV[命令行参数]
 end

 subgraph ConfigLayer["配置层"]
 LoadSettings[loadSettings]
 LoadEnv[loadEnvironment]
 LoadCliConfig[loadCliConfig]
 Config[Config 实例]
 end

 subgraph Consumers["消费者层"]
 GeminiChat[GeminiChat]
 ToolScheduler[ToolScheduler]
 MCP[MCP Client]
 Auth[Auth Manager]
 UI[UI Components]
 Memory[Memory Manager]
 end

 subgraph Sources["配置来源"]
 SysDefaults[system-defaults.json]
 UserSettings[~/.gemini/settings.json]
 WorkspaceSettings[.gemini/settings.json]
 SysSettings[/etc/.../settings.json]
 EnvFile[.env 文件]
 ShellEnv[Shell 环境变量]
 end

 CLI --> LoadSettings
 ARGV --> LoadCliConfig

 SysDefaults --> LoadSettings
 UserSettings --> LoadSettings
 WorkspaceSettings --> LoadSettings
 SysSettings --> LoadSettings

 LoadSettings --> LoadEnv
 EnvFile --> LoadEnv
 ShellEnv --> LoadEnv

 LoadSettings --> LoadCliConfig
 LoadEnv --> LoadCliConfig
 LoadCliConfig --> Config

 Config --> GeminiChat
 Config --> ToolScheduler
 Config --> MCP
 Config --> Auth
 Config --> UI
 Config --> Memory

style Config stroke:#22d3ee
style LoadSettings stroke:#a855f7
style LoadCliConfig stroke:#22c55e`}
 />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
 {/* 上游 */}
 <div className="bg-surface rounded-lg p-5">
 <h4 className="text-lg font-semibold text-heading mb-4">配置来源</h4>
 <div className="space-y-3">
 <div className="pl-3">
 <h5 className="font-semibold text-heading">文件系统</h5>
 <p className="text-xs text-body mt-1">
 四层配置文件 + .env 文件
 </p>
 </div>
 <div className="border-l-2 border-[var(--color-success)] pl-3">
 <h5 className="font-semibold text-[var(--color-success)]">Shell 环境</h5>
 <p className="text-xs text-body mt-1">
 process.env 中的环境变量
 </p>
 </div>
 <div className="border-l-2 border-[var(--color-warning)] pl-3">
 <h5 className="font-semibold text-[var(--color-warning)]">命令行参数</h5>
 <p className="text-xs text-body mt-1">
 argv 解析后的 CLI 参数
 </p>
 </div>
 <div className="pl-3">
 <h5 className="font-semibold text-heading">扩展包</h5>
 <p className="text-xs text-body mt-1">
 扩展包中的 MCP 服务器配置
 </p>
 </div>
 </div>
 </div>

 {/* 下游 */}
 <div className="bg-surface rounded-lg p-5">
 <h4 className="text-lg font-semibold text-heading mb-4">消费者模块</h4>
 <div className="space-y-3">
 <div className="pl-3">
 <h5 className="font-semibold text-heading">GeminiChat</h5>
 <p className="text-xs text-body mt-1">
 模型选择、Token 限制、生成配置
 </p>
 </div>
 <div className="border-l-2 border-[var(--color-warning)] pl-3">
 <h5 className="font-semibold text-heading">ToolScheduler</h5>
 <p className="text-xs text-body mt-1">
 approvalMode、allowedTools、sandbox
 </p>
 </div>
 <div className="border-l-2 border-[var(--color-danger)] pl-3">
 <h5 className="font-semibold text-[var(--color-danger)]">Auth Manager</h5>
 <p className="text-xs text-body mt-1">
 认证类型、API 密钥、Base URL
 </p>
 </div>
 <div className="pl-3">
 <h5 className="font-semibold text-heading">MCP Client</h5>
 <p className="text-xs text-body mt-1">
 mcpServers 配置、允许/排除列表
 </p>
 </div>
 <div className="border-l-2 border-[var(--color-success)] pl-3">
 <h5 className="font-semibold text-[var(--color-success)]">UI Components</h5>
 <p className="text-xs text-body mt-1">
 主题、显示选项、无障碍设置
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* 关键接口 */}
 <HighlightBox title="关键公开接口" icon="📡" variant="green">
 <CodeBlock
 code={`// 配置加载主入口
function loadSettings(workspaceDir?: string): LoadedSettings;

// 完整 CLI 配置加载
async function loadCliConfig(
 argv: CliArgv,
 loadedSettings: LoadedSettings,
 interactive: boolean,
): Promise<Config>;

// Config 类的关键方法
class Config {
 getApprovalMode(): ApprovalMode;
 getModel(): string;
 getMcpServers(): Record<string, McpServerConfig>;
 getToolsToExclude(): string[];
 getAllowedTools(): string[];
 isSandboxEnabled(): boolean | 'docker' | 'podman';
 getTheme(): Theme;
 getUserMemory(): string;
 // ...更多
}

// 配置保存
class LoadedSettings {
 save(scope: SettingScope, path: string, value: unknown): void;
 saveSystemSetting(path: string, value: unknown): void;
 saveUserSetting(path: string, value: unknown): void;
 saveWorkspaceSetting(path: string, value: unknown): void;
}`}
 />
 </HighlightBox>

 {/* 扩展点 */}
 <HighlightBox title="扩展点" icon="🔧" variant="purple">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div className="space-y-2">
 <h5 className="text-body font-semibold">添加新配置项</h5>
 <p className="text-body">
 1. 在 <code className="text-heading">settingsSchema.ts</code> 添加 Schema<br/>
 2. 在 <code className="text-heading">settings.ts</code> 添加迁移映射<br/>
 3. 在 <code className="text-heading">Config</code> 类添加 getter
 </p>
 </div>
 <div className="space-y-2">
 <h5 className="text-body font-semibold">自定义合并策略</h5>
 <p className="text-body">
 在 <code className="text-heading">getMergeStrategyForPath()</code> 中
 添加路径到策略的映射。
 </p>
 </div>
 <div className="space-y-2">
 <h5 className="text-body font-semibold">环境变量覆盖</h5>
 <p className="text-body">
 使用 <code className="text-heading">GEMINI_CLI_SYSTEM_SETTINGS_PATH</code>
 等环境变量覆盖默认路径。
 </p>
 </div>
 <div className="space-y-2">
 <h5 className="text-body font-semibold">企业管控</h5>
 <p className="text-body">
 通过系统级 settings.json 强制覆盖用户配置，
 实现企业统一策略。
 </p>
 </div>
 </div>
 </HighlightBox>
 </Layer>

 {/* 为什么这样设计配置系统 */}
 <Layer title="💡 为什么这样设计配置系统？" icon="🤔">
 <div className="space-y-6">
 <div className="bg-base/30 rounded-lg p-5">
 <h4 className="text-lg font-medium text-heading mb-3">1. 为什么采用四层配置而非两层？</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div>
 <div className="text-[var(--color-danger)] font-medium mb-1">两层模型（用户 + 项目）的不足</div>
 <ul className="text-body space-y-1">
 <li>• 无法满足企业管控需求</li>
 <li>• 无法提供系统级默认值</li>
 <li>• IT 无法统一配置策略</li>
 </ul>
 </div>
 <div>
 <div className="text-[var(--color-success)] font-medium mb-1">四层模型的优势</div>
 <ul className="text-body space-y-1">
 <li>• <strong>systemDefaults</strong>: 企业可预设默认值</li>
 <li>• <strong>user</strong>: 个人偏好</li>
 <li>• <strong>workspace</strong>: 项目需求</li>
 <li>• <strong>system</strong>: IT 强制策略</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-base/30 rounded-lg p-5">
 <h4 className="text-lg font-medium text-heading mb-3">2. 为什么 v2 采用嵌套结构而非 v1 扁平结构？</h4>
 <CodeBlock code={`// v1 扁平结构的问题
{
 "vimMode": true,
 "hideBanner": true,
 "model": "gemini-1.5-flash",
 "allowedTools": [...],
 "mcpServers": {...}
}
// 100+ 个顶层字段，难以管理和扩展

// v2 嵌套结构的优势
{
 "general": { "vimMode": true },
 "ui": { "hideBanner": true },
 "model": { "name": "gemini-1.5-flash" },
 "tools": { "allowed": [...] }
}
// 分类清晰，易于扩展新领域`} language="json" />
 </div>

 <div className="bg-base/30 rounded-lg p-5">
 <h4 className="text-lg font-medium text-heading mb-3">3. 为什么需要策略感知合并？</h4>
 <div className="text-sm text-body space-y-2">
 <p>不同字段需要不同的合并语义：</p>
 <table className="w-full text-xs">
 <thead>
 <tr className="border- border-edge text-body">
 <th className="text-left py-2">字段</th>
 <th className="text-left py-2">如果用 REPLACE</th>
 <th className="text-left py-2">正确策略</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2"><code>mcpServers</code></td>
 <td className="py-2 text-[var(--color-danger)]">项目配置完全覆盖用户服务器</td>
 <td className="py-2 text-[var(--color-success)]">SHALLOW_MERGE: 按 key 合并</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2"><code>tools.exclude</code></td>
 <td className="py-2 text-[var(--color-danger)]">项目排除列表覆盖用户列表</td>
 <td className="py-2 text-[var(--color-success)]">UNION: 去重合并</td>
 </tr>
 <tr>
 <td className="py-2"><code>context.includeDirectories</code></td>
 <td className="py-2 text-[var(--color-danger)]">项目目录覆盖用户目录</td>
 <td className="py-2 text-[var(--color-success)]">CONCAT: 拼接保留全部</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <div className="bg-base/30 rounded-lg p-5">
 <h4 className="text-lg font-medium text-heading mb-3">4. 为什么工作区配置需要信任检查？</h4>
 <div className="text-sm text-body">
 <p className="mb-2"><strong className="text-[var(--color-danger)]">安全风险</strong>：恶意仓库可能包含危险配置</p>
 <ul className="text-body space-y-1 text-xs">
 <li>• <code>mcpServers</code> - 启动恶意 MCP 服务器</li>
 <li>• <code>tools.allowed</code> - 跳过危险操作确认</li>
 </ul>
 <p className="mt-3 text-heading">
 解决方案：非信任工作区的 workspace 配置被替换为空对象
 </p>
 </div>
 </div>
 </div>
 </Layer>

 {/* 配置边界情况 */}
 <Layer title="⚠️ 配置加载边界情况" icon="🔧">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border- border-edge text-left text-body">
 <th className="py-2 px-2">场景</th>
 <th className="py-2 px-2">触发条件</th>
 <th className="py-2 px-2">系统行为</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-[var(--color-danger)]">JSON 语法错误</td>
 <td className="py-2 px-2 text-xs">settings.json 包含无效 JSON</td>
 <td className="py-2 px-2 text-xs">跳过该文件，使用默认值，输出警告</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-[var(--color-warning)]">迁移冲突</td>
 <td className="py-2 px-2 text-xs">v1 字段与 v2 容器同名</td>
 <td className="py-2 px-2 text-xs">检测 v2 容器类型，跳过迁移</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-[var(--color-warning)]">环境变量未定义</td>
 <td className="py-2 px-2 text-xs">$VAR 引用不存在的变量</td>
 <td className="py-2 px-2 text-xs">保留原始字符串 "$VAR"</td>
 </tr>
 <tr className="border- border-edge">
 <td className="py-2 px-2 text-heading">循环引用</td>
 <td className="py-2 px-2 text-xs">对象自引用</td>
 <td className="py-2 px-2 text-xs">WeakSet 检测，返回浅拷贝</td>
 </tr>
 <tr>
 <td className="py-2 px-2 text-heading">权限不足</td>
 <td className="py-2 px-2 text-xs">无法读取系统配置文件</td>
 <td className="py-2 px-2 text-xs">静默跳过，仅使用可访问的配置</td>
 </tr>
 </tbody>
 </table>
 </div>
 </Layer>

 {/* 相关页面 */}
 <RelatedPages
 title="📚 相关阅读"
 pages={[
 { id: 'approval-mode', label: '审批模式系统', description: '工具执行权限控制' },
 { id: 'mcp', label: 'MCP 协议', description: 'mcpServers 配置详解' },
 { id: 'extension', label: '扩展系统', description: '扩展配置项注册' },
 { id: 'session-persistence', label: '会话持久化', description: '会话配置和存储' },
 { id: 'design-tradeoffs', label: '设计权衡', description: '配置系统的架构决策' },
 { id: 'sandbox', label: '沙箱系统', description: 'sandbox 配置详解' },
 ]}
 />
 </div>
 );
}
