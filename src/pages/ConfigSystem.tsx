import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

export function ConfigSystem() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">配置系统详解 (Settings v2)</h2>

      {/* 30秒速览 */}
      <Layer title="30秒速览" icon="⚡">
        <HighlightBox title="配置系统核心要点" icon="🎯" variant="purple">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">📁</span>
                <div>
                  <strong>四层配置</strong>
                  <div className="text-xs text-gray-400">systemDefaults → user → workspace → system</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">🔀</span>
                <div>
                  <strong>4种合并策略</strong>
                  <div className="text-xs text-gray-400">REPLACE | CONCAT | UNION | SHALLOW_MERGE</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">🔐</span>
                <div>
                  <strong>信任门禁</strong>
                  <div className="text-xs text-gray-400">非信任目录 → workspace 配置被忽略</div>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">🌍</span>
                <div>
                  <strong>环境变量解析</strong>
                  <div className="text-xs text-gray-400">$VAR 和 {'${VAR}'} 语法支持</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-bold">🔄</span>
                <div>
                  <strong>自动迁移</strong>
                  <div className="text-xs text-gray-400">v1 扁平结构 → v2 嵌套结构</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">🛠️</span>
                <div>
                  <strong>工具集组装</strong>
                  <div className="text-xs text-gray-400">Core + Discovery + MCP 三路合流</div>
                </div>
              </div>
            </div>
          </div>
        </HighlightBox>

        <div className="mt-4 bg-black/30 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <div className="text-gray-500 mb-2">// 核心常量 - packages/cli/src/config/settings.ts</div>
          <div><span className="text-purple-400">SETTINGS_VERSION</span> = <span className="text-yellow-400">2</span>  <span className="text-gray-500">// 当前配置版本</span></div>
          <div><span className="text-purple-400">SETTINGS_VERSION_KEY</span> = <span className="text-green-400">"$version"</span>  <span className="text-gray-500">// 版本标记字段</span></div>
          <div><span className="text-purple-400">SETTINGS_DIRECTORY_NAME</span> = <span className="text-green-400">".innies"</span>  <span className="text-gray-500">// 配置目录名</span></div>
          <div><span className="text-purple-400">DEFAULT_EXCLUDED_ENV_VARS</span> = [<span className="text-green-400">"DEBUG"</span>, <span className="text-green-400">"DEBUG_MODE"</span>]</div>
          <div className="mt-2 text-gray-500">// 合并策略枚举 - packages/cli/src/config/settingsSchema.ts:51-60</div>
          <div><span className="text-cyan-400">MergeStrategy.REPLACE</span> = <span className="text-green-400">"replace"</span>  <span className="text-gray-500">// 直接覆盖（默认）</span></div>
          <div><span className="text-cyan-400">MergeStrategy.CONCAT</span> = <span className="text-green-400">"concat"</span>  <span className="text-gray-500">// 数组拼接</span></div>
          <div><span className="text-cyan-400">MergeStrategy.UNION</span> = <span className="text-green-400">"union"</span>  <span className="text-gray-500">// 数组去重合并</span></div>
          <div><span className="text-cyan-400">MergeStrategy.SHALLOW_MERGE</span> = <span className="text-green-400">"shallow_merge"</span>  <span className="text-gray-500">// 对象浅合并</span></div>
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
    LS->>LS: 读取 ~/.innies/settings.json
    LS->>LS: 读取 .innies/settings.json
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

    LCC->>Memory: 8. 加载 QWEN.md 记忆
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
            <li><strong>User Settings</strong> - 用户级配置 <code>~/.innies/settings.json</code></li>
            <li><strong>Workspace Settings</strong> - 项目级配置 <code>.innies/settings.json</code></li>
            <li><strong>System Settings</strong> - 系统级覆盖配置（企业管控）</li>
            <li><strong>环境变量</strong> - <code>.env</code> 文件或 shell 环境</li>
            <li><strong>命令行参数</strong> - 启动时传入的参数</li>
          </ol>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">🏠 用户级配置</h4>
            <code className="text-xs text-gray-400 block mb-2">~/.innies/settings.json</code>
            <p className="text-sm text-gray-300">
              跨所有项目的全局配置，如 UI 偏好、默认模型等
            </p>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">📂 项目级配置</h4>
            <code className="text-xs text-gray-400 block mb-2">.innies/settings.json</code>
            <p className="text-sm text-gray-300">
              项目特定配置，覆盖用户级设置<br/>
              <span className="text-orange-400 text-xs">⚠️ 非信任目录时被忽略</span>
            </p>
          </div>

          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">🏢 System Defaults</h4>
            <code className="text-xs text-gray-400 block mb-2">
              /etc/innies-code/system-defaults.json (Linux)<br/>
              /Library/Application Support/InniesCode/system-defaults.json (macOS)
            </code>
            <p className="text-sm text-gray-300">
              系统级默认值，可被用户/项目覆盖
            </p>
          </div>

          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">🔒 System Settings (Override)</h4>
            <code className="text-xs text-gray-400 block mb-2">
              /etc/innies-code/settings.json (Linux)<br/>
              /Library/Application Support/InniesCode/settings.json (macOS)
            </code>
            <p className="text-sm text-gray-300">
              系统管理员强制覆盖，优先级最高
            </p>
          </div>
        </div>

        <CodeBlock
          title="packages/cli/src/config/settings.ts:140-161 - 系统配置路径"
          code={`// 获取系统级覆盖配置路径
export function getSystemSettingsPath(): string {
  // 环境变量覆盖
  if (process.env['QWEN_CODE_SYSTEM_SETTINGS_PATH']) {
    return process.env['QWEN_CODE_SYSTEM_SETTINGS_PATH'];
  }
  // 平台特定路径
  if (platform() === 'darwin') {
    return '/Library/Application Support/QwenCode/settings.json';
  } else if (platform() === 'win32') {
    return 'C:\\\\ProgramData\\\\qwen-code\\\\settings.json';
  } else {
    return '/etc/qwen-code/settings.json';
  }
}

// 获取系统级默认配置路径
export function getSystemDefaultsPath(): string {
  if (process.env['QWEN_CODE_SYSTEM_DEFAULTS_PATH']) {
    return process.env['QWEN_CODE_SYSTEM_DEFAULTS_PATH'];
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
            版本标记：<code>"$version": 2</code>
          </p>
        </HighlightBox>

        <JsonBlock
          code={`// Settings v2 完整结构示例
{
  "$version": 2,

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
    "name": "qwen-coder-plus",
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
    "approvalMode": "default",  // plan | default | auto-edit | yolo
    "autoAccept": false,
    "sandbox": false,           // boolean | "docker" | "podman"
    "useRipgrep": true,
    "useBuiltinRipgrep": true,
    "core": null,               // 限制核心工具：["read_file", "edit", ...]
    "allowed": [                // 跳过确认的工具
      "run_shell_command(git status)",
      "run_shell_command(npm test)"
    ],
    "exclude": ["web_search"],  // 排除的工具
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
    "fileName": ["QWEN.md", "CONTEXT.md"],
    "importFormat": "tree",     // tree | flat
    "discoveryMaxDirs": 200,
    "includeDirectories": [],
    "loadMemoryFromIncludeDirectories": false,
    "fileFiltering": {
      "respectGitIgnore": true,
      "respectInniesIgnore": true,
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
      "selectedType": "qwen_oauth",  // qwen_oauth | api_key | ...
      "enforcedType": null,
      "useExternal": false,
      "apiKey": null,
      "baseUrl": null
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
          <p className="text-xs text-gray-400">
            源码位置: <code>packages/cli/src/config/settings.ts:253-321</code>
          </p>
        </HighlightBox>

        <CodeBlock
          title="packages/cli/src/config/settings.ts:63-138 - 迁移映射表"
          code={`// v1 字段 → v2 路径的完整映射表
const MIGRATION_MAP: Record<string, string> = {
  // General
  vimMode: 'general.vimMode',
  preferredEditor: 'general.preferredEditor',
  disableAutoUpdate: 'general.disableAutoUpdate',
  checkpointing: 'general.checkpointing',
  enablePromptCompletion: 'general.enablePromptCompletion',

  // UI
  theme: 'ui.theme',
  hideBanner: 'ui.hideBanner',
  hideTips: 'ui.hideTips',
  hideFooter: 'ui.hideFooter',
  hideWindowTitle: 'ui.hideWindowTitle',
  showMemoryUsage: 'ui.showMemoryUsage',
  showLineNumbers: 'ui.showLineNumbers',
  hideCWD: 'ui.footer.hideCWD',
  hideSandboxStatus: 'ui.footer.hideSandboxStatus',
  accessibility: 'ui.accessibility',
  customWittyPhrases: 'ui.customWittyPhrases',
  enableWelcomeBack: 'ui.enableWelcomeBack',

  // Model
  model: 'model.name',                    // ⚠️ string → model.name
  maxSessionTurns: 'model.maxSessionTurns',
  sessionTokenLimit: 'model.sessionTokenLimit',
  skipNextSpeakerCheck: 'model.skipNextSpeakerCheck',
  chatCompression: 'model.chatCompression',
  summarizeToolOutput: 'model.summarizeToolOutput',
  contentGenerator: 'model.generationConfig',

  // Tools
  allowedTools: 'tools.allowed',
  excludeTools: 'tools.exclude',
  coreTools: 'tools.core',
  autoAccept: 'tools.autoAccept',
  approvalMode: 'tools.approvalMode',
  sandbox: 'tools.sandbox',
  shouldUseNodePtyShell: 'tools.shell.enableInteractiveShell',
  shellPager: 'tools.shell.pager',
  toolDiscoveryCommand: 'tools.discoveryCommand',
  toolCallCommand: 'tools.callCommand',

  // Security
  selectedAuthType: 'security.auth.selectedType',
  enforcedAuthType: 'security.auth.enforcedType',
  useExternalAuth: 'security.auth.useExternal',
  folderTrust: 'security.folderTrust.enabled',

  // MCP
  mcpServers: 'mcpServers',               // ⚠️ 保持顶层
  allowMCPServers: 'mcp.allowed',
  excludeMCPServers: 'mcp.excluded',
  mcpServerCommand: 'mcp.serverCommand',

  // Context
  contextFileName: 'context.fileName',
  includeDirectories: 'context.includeDirectories',
  memoryImportFormat: 'context.importFormat',
  memoryDiscoveryMaxDirs: 'context.discoveryMaxDirs',
  fileFiltering: 'context.fileFiltering',
};`}
        />

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-red-400">v1 (旧)</th>
                <th className="text-left py-2 text-green-400">v2 (新)</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800"><td className="py-1"><code>vimMode</code></td><td><code>general.vimMode</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>theme</code></td><td><code>ui.theme</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>hideBanner</code></td><td><code>ui.hideBanner</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>model</code> (string)</td><td><code>model.name</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>allowedTools</code></td><td><code>tools.allowed</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>excludeTools</code></td><td><code>tools.exclude</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>coreTools</code></td><td><code>tools.core</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>autoAccept</code></td><td><code>tools.autoAccept</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>approvalMode</code></td><td><code>tools.approvalMode</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>sandbox</code></td><td><code>tools.sandbox</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>shouldUseNodePtyShell</code></td><td><code>tools.shell.enableInteractiveShell</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>selectedAuthType</code></td><td><code>security.auth.selectedType</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>enforcedAuthType</code></td><td><code>security.auth.enforcedType</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>mcpServers</code></td><td><code>mcpServers</code> (保持顶层)</td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>allowMCPServers</code></td><td><code>mcp.allowed</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>excludeMCPServers</code></td><td><code>mcp.excluded</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>contextFileName</code></td><td><code>context.fileName</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>includeDirectories</code></td><td><code>context.includeDirectories</code></td></tr>
              <tr className="border-b border-gray-800"><td className="py-1"><code>folderTrust</code></td><td><code>security.folderTrust.enabled</code></td></tr>
              <tr><td className="py-1"><code>tavilyApiKey</code></td><td><code>advanced.tavilyApiKey</code> (deprecated)</td></tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          title="packages/cli/src/config/settings.ts:222-251 - 迁移检测逻辑"
          code={`// 检查配置是否需要迁移
export function needsMigration(settings: Record<string, unknown>): boolean {
  // 1. 检查版本字段 - 如果存在且 >= 当前版本，无需迁移
  if (SETTINGS_VERSION_KEY in settings) {
    const version = settings[SETTINGS_VERSION_KEY];
    if (typeof version === 'number' && version >= SETTINGS_VERSION) {
      return false;
    }
  }

  // 2. 回退检测：检查是否存在 v1 的顶层 key
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
              <div className="bg-gray-700/50 border border-gray-600 rounded px-3 py-2 text-center">
                <div className="text-xs text-gray-400">Layer 1</div>
                <div className="text-green-400 font-mono text-sm">systemDefaults</div>
                <div className="text-xs text-gray-500">最低优先级</div>
              </div>
              <span className="text-cyan-400">→</span>
              <div className="bg-cyan-700/30 border border-cyan-500/50 rounded px-3 py-2 text-center">
                <div className="text-xs text-gray-400">Layer 2</div>
                <div className="text-cyan-400 font-mono text-sm">user</div>
                <div className="text-xs text-gray-500">~/.innies/</div>
              </div>
              <span className="text-cyan-400">→</span>
              <div className="bg-purple-700/30 border border-purple-500/50 rounded px-3 py-2 text-center relative">
                <div className="text-xs text-gray-400">Layer 3</div>
                <div className="text-purple-400 font-mono text-sm">workspace</div>
                <div className="text-xs text-orange-400">⚠️ 需信任</div>
              </div>
              <span className="text-cyan-400">→</span>
              <div className="bg-red-700/30 border border-red-500/50 rounded px-3 py-2 text-center">
                <div className="text-xs text-gray-400">Layer 4</div>
                <div className="text-red-400 font-mono text-sm">system</div>
                <div className="text-xs text-gray-500">最高优先级</div>
              </div>
            </div>
          </div>
        </HighlightBox>

        <CodeBlock
          title="packages/cli/src/config/settings.ts:396-419 - 四层合并核心函数"
          code={`// 四层配置合并
function mergeSettings(
  system: Settings,           // Layer 4: 系统覆盖（企业管控）
  systemDefaults: Settings,   // Layer 1: 系统默认值
  user: Settings,             // Layer 2: 用户配置
  workspace: Settings,        // Layer 3: 项目配置
  isTrusted: boolean,         // 工作区是否受信任
): Settings {
  // ⚠️ 非信任工作区 → workspace 配置被替换为空对象
  const safeWorkspace = isTrusted ? workspace : ({} as Settings);

  // Settings are merged with the following precedence (last one wins):
  // 1. System Defaults (最低)
  // 2. User Settings
  // 3. Workspace Settings
  // 4. System Settings (最高)
  return customDeepMerge(
    getMergeStrategyForPath,  // 根据字段路径决定合并策略
    {},                        // 空对象作为基础
    systemDefaults,            // 1. 系统默认
    user,                      // 2. 用户配置
    safeWorkspace,             // 3. 项目配置（可能为空）
    system,                    // 4. 系统覆盖（最高优先级）
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
            <div className="bg-black/30 rounded p-3">
              <div className="text-cyan-400 font-bold text-sm mb-1">REPLACE (默认)</div>
              <p className="text-xs text-gray-400 mb-2">高优先级的值直接替换低优先级</p>
              <div className="text-xs font-mono">
                <span className="text-gray-500">user:</span> <span className="text-green-400">"dark"</span>
                <span className="text-gray-500 mx-1">+</span>
                <span className="text-gray-500">workspace:</span> <span className="text-purple-400">"light"</span>
                <span className="text-gray-500 mx-1">=</span>
                <span className="text-yellow-400">"light"</span>
              </div>
            </div>
            <div className="bg-black/30 rounded p-3">
              <div className="text-orange-400 font-bold text-sm mb-1">CONCAT</div>
              <p className="text-xs text-gray-400 mb-2">数组按顺序拼接（可能重复）</p>
              <div className="text-xs font-mono">
                <span className="text-green-400">["a"]</span>
                <span className="text-gray-500 mx-1">+</span>
                <span className="text-purple-400">["b"]</span>
                <span className="text-gray-500 mx-1">=</span>
                <span className="text-yellow-400">["a","b"]</span>
              </div>
            </div>
            <div className="bg-black/30 rounded p-3">
              <div className="text-green-400 font-bold text-sm mb-1">UNION</div>
              <p className="text-xs text-gray-400 mb-2">数组合并并去重</p>
              <div className="text-xs font-mono">
                <span className="text-green-400">["a","b"]</span>
                <span className="text-gray-500 mx-1">+</span>
                <span className="text-purple-400">["b","c"]</span>
                <span className="text-gray-500 mx-1">=</span>
                <span className="text-yellow-400">["a","b","c"]</span>
              </div>
            </div>
            <div className="bg-black/30 rounded p-3">
              <div className="text-purple-400 font-bold text-sm mb-1">SHALLOW_MERGE</div>
              <p className="text-xs text-gray-400 mb-2">对象浅合并（顶层 key 合并）</p>
              <div className="text-xs font-mono">
                <span className="text-green-400">{'{a:1}'}</span>
                <span className="text-gray-500 mx-1">+</span>
                <span className="text-purple-400">{'{b:2}'}</span>
                <span className="text-gray-500 mx-1">=</span>
                <span className="text-yellow-400">{'{a:1,b:2}'}</span>
              </div>
            </div>
          </div>
        </HighlightBox>

        {/* 字段策略映射表 */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">字段路径</th>
                <th className="text-left py-2 text-cyan-400">合并策略</th>
                <th className="text-left py-2 text-gray-400">说明</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-1"><code>mcpServers</code></td>
                <td className="text-purple-400">SHALLOW_MERGE</td>
                <td className="text-xs">多层定义的 MCP 服务器按 key 合并</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-1"><code>context.includeDirectories</code></td>
                <td className="text-orange-400">CONCAT</td>
                <td className="text-xs">用户级 + 项目级目录拼接</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-1"><code>tools.exclude</code></td>
                <td className="text-green-400">UNION</td>
                <td className="text-xs">排除工具列表去重合并</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-1"><code>advanced.excludedEnvVars</code></td>
                <td className="text-green-400">UNION</td>
                <td className="text-xs">排除的环境变量去重</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-1"><code>extensions.disabled</code></td>
                <td className="text-green-400">UNION</td>
                <td className="text-xs">禁用扩展列表去重</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-1"><code>ui.theme</code></td>
                <td className="text-cyan-400">REPLACE</td>
                <td className="text-xs">高优先级直接覆盖</td>
              </tr>
              <tr>
                <td className="py-1"><code>其他字段</code></td>
                <td className="text-cyan-400">REPLACE</td>
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
      return undefined;  // 未定义 → 使用默认 REPLACE
    }
    current = currentSchema[key];
    currentSchema = current.properties;  // 进入嵌套
  }

  return current?.mergeStrategy;  // 返回定义的策略或 undefined
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
  const envVarRegex = /\\$(?:(\\w+)|{([^}]+)})/g;  // 匹配 $VAR 或 \${VAR}

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
      return [...obj] as unknown as T;  // 防止循环
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
      return { ...obj } as T;  // 防止循环
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
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">解析示例</h4>
            <div className="text-xs space-y-2 font-mono">
              <div>
                <span className="text-gray-400">输入:</span> <span className="text-green-400">"$API_KEY"</span><br/>
                <span className="text-gray-400">输出:</span> <span className="text-yellow-400">"sk-xxxx"</span>
              </div>
              <div>
                <span className="text-gray-400">输入:</span> <span className="text-green-400">"{'${BASE_URL}'}/api"</span><br/>
                <span className="text-gray-400">输出:</span> <span className="text-yellow-400">"https://example.com/api"</span>
              </div>
              <div>
                <span className="text-gray-400">输入:</span> <span className="text-green-400">"$UNDEFINED_VAR"</span><br/>
                <span className="text-gray-400">输出:</span> <span className="text-red-400">"$UNDEFINED_VAR"</span> (保留)
              </div>
            </div>
          </div>

          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">解析时机</h4>
            <p className="text-sm text-gray-300 mb-2">
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
OPENAI_API_KEY=sk-...          # OpenAI 兼容 API 密钥
OPENAI_BASE_URL=https://...    # 自定义 API 端点
OPENAI_MODEL=qwen-coder-plus   # 默认模型
QWEN_MODEL=qwen-coder-plus     # Qwen 模型（优先级高于 OPENAI_MODEL）

# 沙箱
GEMINI_SANDBOX=true            # 启用沙箱 (true|docker|podman)
SEATBELT_PROFILE=permissive-open  # macOS 沙箱 profile

# 遥测
GEMINI_TELEMETRY_ENABLED=true
GEMINI_TELEMETRY_TARGET=local  # local | gcp
GEMINI_TELEMETRY_OTLP_ENDPOINT=http://localhost:4317

# 调试
DEBUG=1                        # 调试模式
NO_COLOR=1                     # 禁用颜色输出

# Web 搜索
TAVILY_API_KEY=tvly-...        # Tavily API 密钥

# IDE
QWEN_CODE_IDE_PORT=3000        # IDE MCP 端口

# 系统配置路径覆盖
QWEN_CODE_SYSTEM_SETTINGS_PATH=/custom/path/settings.json
QWEN_CODE_SYSTEM_DEFAULTS_PATH=/custom/path/defaults.json

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
          <p className="text-xs text-gray-400">
            源码位置: <code>packages/cli/src/config/settings.ts:537-577</code>
          </p>
        </HighlightBox>

        <CodeBlock
          title="packages/cli/src/config/settings.ts:486-513 - .env 文件发现"
          code={`// 向上遍历查找 .env 文件
function findEnvFile(startDir: string): string | null {
  let currentDir = path.resolve(startDir);

  while (true) {
    // 1. 优先查找 .innies/.env（项目特定）
    const geminiEnvPath = path.join(currentDir, QWEN_DIR, '.env');
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
      const homeGeminiEnvPath = path.join(homedir(), QWEN_DIR, '.env');
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
      const isProjectEnvFile = !envFilePath.includes(QWEN_DIR);

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
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-400 font-bold mb-2">.env 搜索优先级</h4>
            <ol className="text-sm space-y-1 list-decimal pl-4 text-gray-300">
              <li><code>.innies/.env</code> (当前目录)</li>
              <li><code>.env</code> (当前目录)</li>
              <li>向上遍历父目录重复 1-2</li>
              <li><code>~/.innies/.env</code> (home)</li>
              <li><code>~/.env</code> (home)</li>
            </ol>
          </div>

          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">排除的环境变量</h4>
            <p className="text-sm text-gray-300 mb-2">
              项目级 .env 中的这些变量不会被加载：
            </p>
            <div className="text-xs font-mono space-y-1">
              <div><code className="text-orange-400">DEBUG</code> - 调试模式</div>
              <div><code className="text-orange-400">DEBUG_MODE</code> - 调试模式</div>
              <div className="text-gray-400 mt-2">可通过 <code>advanced.excludedEnvVars</code> 自定义</div>
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
    system: SettingsFile,         // 系统覆盖配置
    systemDefaults: SettingsFile, // 系统默认配置
    user: SettingsFile,           // 用户配置
    workspace: SettingsFile,      // 工作区配置
    isTrusted: boolean,           // 是否受信任
    migratedInMemorScopes: Set<SettingScope>,
  ) {
    this.system = system;
    this.systemDefaults = systemDefaults;
    this.user = user;
    this.workspace = workspace;
    this.isTrusted = isTrusted;
    this.migratedInMemorScopes = migratedInMemorScopes;
    this._merged = this.computeMergedSettings();  // 立即计算合并结果
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
    this._merged = this.computeMergedSettings();  // 重算！
    saveSettings(settingsFile);  // 持久化到文件
  }
}`}
        />
      </Layer>

      {/* 命令行参数 */}
      <Layer title="命令行参数" icon="💻">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--model, -m</code>
              <span className="text-gray-400 ml-2">指定模型</span>
            </div>
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--approval-mode</code>
              <span className="text-gray-400 ml-2">plan|default|auto-edit|yolo</span>
            </div>
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--yolo</code>
              <span className="text-gray-400 ml-2">自动批准所有工具调用</span>
            </div>
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--sandbox, -s</code>
              <span className="text-gray-400 ml-2">启用沙箱</span>
            </div>
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--allowed-tools</code>
              <span className="text-gray-400 ml-2">跳过确认的工具</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--prompt, -p</code>
              <span className="text-gray-400 ml-2">非交互模式</span>
            </div>
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--output-format</code>
              <span className="text-gray-400 ml-2">text|json</span>
            </div>
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--include-directories</code>
              <span className="text-gray-400 ml-2">多工作区目录</span>
            </div>
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--checkpointing</code>
              <span className="text-gray-400 ml-2">启用检查点</span>
            </div>
            <div className="bg-white/5 rounded p-2">
              <code className="text-cyan-400">--screen-reader</code>
              <span className="text-gray-400 ml-2">屏幕阅读器模式</span>
            </div>
          </div>
        </div>

        <CodeBlock
          title="packages/cli/src/config/config.ts:72-88 - approvalMode 解析"
          code={`const VALID_APPROVAL_MODE_VALUES = ['plan', 'default', 'auto-edit', 'yolo'] as const;

function parseApprovalModeValue(value: string): ApprovalMode {
  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case 'plan':
      return ApprovalMode.PLAN;
    case 'default':
      return ApprovalMode.DEFAULT;
    case 'yolo':
      return ApprovalMode.YOLO;
    case 'auto_edit':
    case 'autoedit':
    case 'auto-edit':
      return ApprovalMode.AUTO_EDIT;
    default:
      throw new Error(\`Invalid approval mode: \${value}\`);
  }
}`}
        />
      </Layer>

      {/* .innies 目录结构 */}
      <Layer title=".innies 目录结构" icon="📂">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">~/.innies/ (用户级)</h4>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{`├── settings.json      # 用户配置
├── QWEN.md            # 用户级记忆
├── oauth_creds.json   # OAuth 凭据
├── mcp-oauth-tokens.json  # MCP OAuth tokens
├── agents/            # 用户级子代理
├── commands/          # 用户级自定义命令
├── extensions/        # 用户级扩展
├── themes/            # 主题文件
└── tmp/               # 临时文件
    └── <project_hash>/
        ├── chats/         # 聊天记录
        ├── checkpoints/   # 检查点
        └── shell_history  # Shell 历史`}</pre>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">.innies/ (项目级)</h4>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{`├── settings.json      # 项目配置
├── QWEN.md            # 项目级记忆
├── agents/            # 项目级子代理
├── commands/          # 项目级自定义命令
├── extensions/        # 项目级扩展
├── sandbox.Dockerfile # 自定义沙箱镜像
├── sandbox.bashrc     # 沙箱 shell 配置
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
            <li>项目级 <code>.innies/settings.json</code> <strong>被忽略</strong></li>
            <li>项目级 <code>.innies/commands/</code> <strong>不加载</strong></li>
            <li>项目级 <code>.innies/extensions/</code> <strong>不加载</strong></li>
            <li>项目级 <code>.env</code> 文件 <strong>不加载</strong></li>
            <li><code>tools.approvalMode</code> 受限，不能使用 <code>yolo</code></li>
          </ul>
        </HighlightBox>

        <CodeBlock
          title="packages/cli/src/config/config.ts:605-615 - approvalMode 强制降级"
          code={`// loadCliConfig() 中的 approval mode 校验
if (
  !trustedFolder &&
  approvalMode !== ApprovalMode.DEFAULT &&
  approvalMode !== ApprovalMode.PLAN
) {
  logger.warn(
    \`Approval mode overridden to "default" because the current folder is not trusted.\`,
  );
  approvalMode = ApprovalMode.DEFAULT;
}

// ⚠️ yolo 和 auto-edit 在不受信任目录强制降级为 default`}
        />

        <HighlightBox title="信任检查触发时机" icon="⏱️" variant="purple">
          <div className="text-sm space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">1.</span>
              <div>
                <strong>loadSettings() 阶段</strong> - 决定是否加载 workspace settings
                <div className="text-xs text-gray-400 mt-1">
                  位置: <code>packages/cli/src/config/settings.ts:396-418</code>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">2.</span>
              <div>
                <strong>loadEnvironment() 阶段</strong> - 决定是否加载项目级 .env
                <div className="text-xs text-gray-400 mt-1">
                  位置: <code>packages/cli/src/config/settings.ts:537-541</code>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">3.</span>
              <div>
                <strong>loadCliConfig() 阶段</strong> - 校验和降级 approvalMode
                <div className="text-xs text-gray-400 mt-1">
                  位置: <code>packages/cli/src/config/config.ts:605-615</code>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">4.</span>
              <div>
                <strong>loadHierarchicalGeminiMemory() 阶段</strong> - 决定是否加载项目级 QWEN.md
                <div className="text-xs text-gray-400 mt-1">
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
          <p className="text-sm text-gray-400">
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

    LoadEnv --> LoadMemory[loadHierarchicalGeminiMemory<br/>加载 QWEN.md]
    SkipEnv --> LoadMemory

    LoadMemory --> MergeMcp[mergeMcpServers<br/>合并 MCP 服务器配置]

    MergeMcp --> ApprovalCheck{approvalMode<br/>校验}
    ApprovalCheck -->|不受信任 & yolo/auto-edit| ForceDefault[强制降级至 default]
    ApprovalCheck -->|合法| KeepMode[保持 approval mode]

    ForceDefault --> CreateConfig[new Config]
    KeepMode --> CreateConfig

    CreateConfig --> ToolRegistry[createToolRegistry<br/>工具集组装]

    ToolRegistry --> CoreTools[注册核心工具<br/>Read/Edit/Shell/...]
    ToolRegistry --> DiscoveryTools[discoveryCommand<br/>发现外部工具]
    ToolRegistry --> McpTools[MCP 工具<br/>从 MCP 服务器]

    CoreTools --> FinalConfig([Config 实例])
    DiscoveryTools --> FinalConfig
    McpTools --> FinalConfig

    style Start fill:#22d3ee,stroke:#0891b2,color:#000
    style FinalConfig fill:#4ade80,stroke:#16a34a,color:#000
    style TrustCheck fill:#f59e0b,stroke:#d97706,color:#000
    style ApprovalCheck fill:#f59e0b,stroke:#d97706,color:#000
    style ForceDefault fill:#ef4444,stroke:#dc2626,color:#fff
    style LoadMemory fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style ToolRegistry fill:#06b6d4,stroke:#0891b2,color:#000`}
        />

        <CodeBlock
          title="packages/cli/src/config/config.ts:522-805 - loadCliConfig 核心流程"
          code={`export async function loadCliConfig(
  settings: Settings,       // 已合并的 Settings 对象
  extensions: Extension[],  // 加载的扩展列表
  extensionEnablementManager: ExtensionEnablementManager,
  sessionId: string,
  argv: CliArgs,           // 命令行参数
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

  // 4️⃣ 加载层级记忆（QWEN.md）
  const { memoryContent, fileCount } = await loadHierarchicalGeminiMemory(
    cwd,
    settings.context?.loadMemoryFromIncludeDirectories ? includeDirectories : [],
    debugMode, fileService, settings, extensionContextFilePaths,
    trustedFolder,  // ⚠️ 受信任才加载项目级记忆
    memoryImportFormat, fileFiltering,
  );

  // 5️⃣ 合并 MCP 服务器配置
  let mcpServers = mergeMcpServers(settings, activeExtensions);

  // 6️⃣ 确定 approval mode（带后向兼容）
  let approvalMode: ApprovalMode;
  if (argv.approvalMode) {
    approvalMode = parseApprovalModeValue(argv.approvalMode);
  } else if (argv.yolo) {
    approvalMode = ApprovalMode.YOLO;
  } else if (settings.tools?.approvalMode) {
    approvalMode = parseApprovalModeValue(settings.tools.approvalMode);
  } else {
    approvalMode = ApprovalMode.DEFAULT;
  }

  // 7️⃣ 🔐 强制安全降级：不受信任 → 降级至 default
  if (!trustedFolder && approvalMode !== ApprovalMode.DEFAULT && approvalMode !== ApprovalMode.PLAN) {
    logger.warn('Approval mode overridden to "default" because the current folder is not trusted.');
    approvalMode = ApprovalMode.DEFAULT;
  }

  // 8️⃣ 模型解析优先级：CLI > 环境变量 > settings
  const resolvedModel =
    argv.model ||
    process.env['OPENAI_MODEL'] ||
    process.env['QWEN_MODEL'] ||
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
          <p className="text-xs text-gray-400">
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
      blockedMcpServers,  // 记录被阻止的服务器
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
    case ApprovalMode.PLAN:
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
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-cyan-400">文件</th>
                  <th className="text-left py-2 text-gray-400">行号</th>
                  <th className="text-left py-2 text-gray-400">功能</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-1"><code>packages/cli/src/config/settings.ts</code></td>
                  <td>35-48</td>
                  <td className="text-xs">getMergeStrategyForPath() 策略查找</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settings.ts</code></td>
                  <td>63-138</td>
                  <td className="text-xs">MIGRATION_MAP v1→v2 映射表</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settings.ts</code></td>
                  <td>222-251</td>
                  <td className="text-xs">needsMigration() 迁移检测</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settings.ts</code></td>
                  <td>253-321</td>
                  <td className="text-xs">migrateSettingsToV2() 迁移实现</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settings.ts</code></td>
                  <td>396-419</td>
                  <td className="text-xs">mergeSettings() 四层合并</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settings.ts</code></td>
                  <td>421-484</td>
                  <td className="text-xs">LoadedSettings 类</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settings.ts</code></td>
                  <td>486-513</td>
                  <td className="text-xs">findEnvFile() .env 发现</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settings.ts</code></td>
                  <td>537-577</td>
                  <td className="text-xs">loadEnvironment() 环境变量加载</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settings.ts</code></td>
                  <td>583-792</td>
                  <td className="text-xs">loadSettings() 主入口</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settingsSchema.ts</code></td>
                  <td>51-60</td>
                  <td className="text-xs">MergeStrategy 枚举定义</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/settingsSchema.ts</code></td>
                  <td>91-1188</td>
                  <td className="text-xs">SETTINGS_SCHEMA 完整定义</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/utils/deepMerge.ts</code></td>
                  <td>24-90</td>
                  <td className="text-xs">customDeepMerge() 策略感知合并</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/utils/envVarResolver.ts</code></td>
                  <td>20-112</td>
                  <td className="text-xs">环境变量解析实现</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td><code>packages/cli/src/config/config.ts</code></td>
                  <td>522-805</td>
                  <td className="text-xs">loadCliConfig() 完整加载链路</td>
                </tr>
                <tr className="border-b border-gray-800">
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
    </div>
  );
}
