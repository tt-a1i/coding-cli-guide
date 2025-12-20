import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';

export function ConfigSystem() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">配置系统详解 (Settings v2)</h2>

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
              /etc/qwen-code/system-defaults.json (Linux)<br/>
              /Library/Application Support/QwenCode/system-defaults.json (macOS)
            </code>
            <p className="text-sm text-gray-300">
              系统级默认值，可被用户/项目覆盖
            </p>
          </div>

          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">🔒 System Settings (Override)</h4>
            <code className="text-xs text-gray-400 block mb-2">
              /etc/qwen-code/settings.json (Linux)<br/>
              /Library/Application Support/QwenCode/settings.json (macOS)
            </code>
            <p className="text-sm text-gray-300">
              系统管理员强制覆盖，优先级最高
            </p>
          </div>
        </div>
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
    "fileName": ["INNIES.md", "CONTEXT.md"],
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
      <Layer title="v1 → v2 字段映射" icon="🔄">
        <div className="overflow-x-auto">
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
          title="packages/cli/src/config/settings.ts:396-418"
          code={`// 四层合并核心函数
function mergeSettings(
  system: Settings,           // Layer 4: 系统覆盖（企业管控）
  systemDefaults: Settings,   // Layer 1: 系统默认值
  user: Settings,             // Layer 2: 用户配置
  workspace: Settings,        // Layer 3: 项目配置
  isTrusted: boolean,         // 工作区是否受信任
): Settings {
  // 非信任工作区 → workspace 配置被忽略
  const safeWorkspace = isTrusted ? workspace : ({} as Settings);

  // customDeepMerge: 后面的参数覆盖前面的
  // 合并顺序: {} ← systemDefaults ← user ← safeWorkspace ← system
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

      {/* 配置加载流程 */}
      <Layer title="配置加载完整流程" icon="⚙️">
        <CodeBlock
          title="packages/cli/src/config/settings.ts - LoadedSettings 类"
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
    this._merged = this.computeMergedSettings();  // 立即计算合并结果
  }

  get merged(): Settings {
    return this._merged;  // 对外暴露合并后的配置
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

  // 动态修改配置并重新计算合并结果
  setValue(scope: SettingScope, key: string, value: unknown): void {
    const settingsFile = this.forScope(scope);
    setNestedProperty(settingsFile.settings, key, value);
    this._merged = this.computeMergedSettings();  // 重算！
    saveSettings(settingsFile);
  }
}`}
        />
      </Layer>

      {/* 环境变量 */}
      <Layer title="环境变量" icon="🌍">
        <HighlightBox title="字符串值支持环境变量引用" icon="💡" variant="green">
          <p className="text-sm">
            settings.json 中的字符串值可以使用 <code>$VAR</code> 或 <code>{'${VAR}'}</code> 语法引用环境变量，
            加载时自动解析。例如：<code>"apiKey": "$MY_API_TOKEN"</code>
          </p>
        </HighlightBox>

        <CodeBlock
          code={`# 认证相关
OPENAI_API_KEY=sk-...          # OpenAI 兼容 API 密钥
OPENAI_BASE_URL=https://...    # 自定义 API 端点
OPENAI_MODEL=qwen-coder-plus   # 默认模型

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
QWEN_CODE_SYSTEM_DEFAULTS_PATH=/custom/path/defaults.json`}
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
      </Layer>

      {/* .innies 目录结构 */}
      <Layer title=".innies 目录结构" icon="📂">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2">~/.innies/ (用户级)</h4>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{`├── settings.json      # 用户配置
├── INNIES.md          # 用户级记忆
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
├── INNIES.md          # 项目级记忆
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
          title="信任检查逻辑"
          code={`// packages/cli/src/config/trustedFolders.ts
function isWorkspaceTrusted(settings: Settings): TrustResult {
  // 1. 功能未启用 → 默认信任
  if (!settings.security?.folderTrust?.enabled) {
    return { isTrusted: true };
  }

  // 2. 检查信任列表
  const trustedFolders = loadTrustedFolders();
  const cwd = process.cwd();

  // 3. 匹配当前目录或父目录
  for (const trusted of trustedFolders) {
    if (cwd.startsWith(trusted)) {
      return { isTrusted: true };
    }
  }

  return { isTrusted: false, reason: 'Folder not in trust list' };
}`}
        />
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

    TrustCheck -->|受信任| LoadEnv[loadEnvFiles<br/>加载 .env]
    TrustCheck -->|不受信任| SkipEnv[跳过项目级 .env]

    LoadEnv --> LoadMemory[loadHierarchicalGeminiMemory<br/>加载 INNIES.md]
    SkipEnv --> LoadMemory

    LoadMemory --> MergeMcp[mergeMcpServers<br/>合并 MCP 服务器配置]

    MergeMcp --> ApprovalCheck{approvalMode<br/>校验}
    ApprovalCheck -->|不受信任 & yolo/auto-edit| ForceDefault[强制降级至 default]
    ApprovalCheck -->|合法| KeepMode[保持 approval mode]

    ForceDefault --> CreateConfig[new Config]
    KeepMode --> CreateConfig

    CreateConfig --> ToolRegistry[createToolRegistry<br/>工具集组装]

    ToolRegistry --> CoreTools[注册核心工具<br/>Read/Edit/Bash/...]
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
          title="packages/cli/src/config/config.ts:522-708 - loadCliConfig 核心流程"
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
  const activeExtensions = extensions.filter(
    (_, i) => allExtensions[i].isActive,
  );

  // 3️⃣ 设置上下文文件名（hack 方式）
  if (settings.context?.fileName) {
    setServerGeminiMdFilename(settings.context.fileName);
  }

  // 4️⃣ 加载层级记忆（INNIES.md）
  const { memoryContent, fileCount } = await loadHierarchicalGeminiMemory(
    cwd,
    settings.context?.loadMemoryFromIncludeDirectories
      ? includeDirectories
      : [],
    debugMode,
    fileService,
    settings,
    extensionContextFilePaths,
    trustedFolder,  // ⚠️ 受信任才加载项目级记忆
    memoryImportFormat,
    fileFiltering,
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
  if (
    !trustedFolder &&
    approvalMode !== ApprovalMode.DEFAULT &&
    approvalMode !== ApprovalMode.PLAN
  ) {
    logger.warn(
      'Approval mode overridden to "default" because the current folder is not trusted.',
    );
    approvalMode = ApprovalMode.DEFAULT;
  }

  // 8️⃣ 创建 Config 实例（后续调用 createToolRegistry）
  return new Config({
    sessionId,
    targetDir: cwd,
    includeDirectories,
    debugMode,
    approvalMode,
    mcpServers,
    userMemory: memoryContent,  // 传入加载的记忆
    toolDiscoveryCommand: settings.tools?.discoveryCommand,
    // ... 其他配置
  });
}`}
        />
      </Layer>

      {/* 信任门禁对配置的影响 */}
      <Layer title="信任门禁对配置的影响" icon="🔐">
        <HighlightBox title="isTrustedFolder 的影响范围" icon="⚠️" variant="red">
          <p className="text-sm mb-3">
            当 <code>security.folderTrust.enabled: true</code> 且工作区未受信任时，配置加载的多个环节会受到限制：
          </p>
        </HighlightBox>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
              <span>🚫</span>
              <span>Workspace Settings 被忽略</span>
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              源码位置: <code className="text-xs">packages/cli/src/config/settings.ts:403</code>
            </p>
            <CodeBlock
              code={`// mergeSettings() 中的安全检查
const safeWorkspace = isTrusted ? workspace : ({} as Settings);

// 非信任工作区 → workspace 配置被替换为空对象
return customDeepMerge(
  getMergeStrategyForPath,
  {},
  systemDefaults,
  user,
  safeWorkspace,  // ⚠️ 可能为空对象
  system,
);`}
            />
          </div>

          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
              <span>🚫</span>
              <span>.env 文件不加载</span>
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              源码位置: <code className="text-xs">packages/cli/src/config/settings.ts:540</code>
            </p>
            <CodeBlock
              code={`// loadEnvFiles() 中的信任检查
async function loadEnvFiles(
  cwd: string,
  isTrusted: boolean,
): Promise<void> {
  // 只在受信任目录加载项目级 .env
  if (isTrusted) {
    const workspaceEnvPath = path.join(cwd, '.env');
    if (fs.existsSync(workspaceEnvPath)) {
      dotenv.config({ path: workspaceEnvPath });
    }
  }

  // 用户级 ~/.innies/.env 始终加载
  const userEnvPath = path.join(homedir(), '.innies', '.env');
  if (fs.existsSync(userEnvPath)) {
    dotenv.config({ path: userEnvPath });
  }
}`}
            />
          </div>

          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
              <span>⬇️</span>
              <span>approvalMode 强制降级</span>
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              源码位置: <code className="text-xs">packages/cli/src/config/config.ts:605-615</code>
            </p>
            <CodeBlock
              code={`// loadCliConfig() 中的 approval mode 校验
if (
  !trustedFolder &&
  approvalMode !== ApprovalMode.DEFAULT &&
  approvalMode !== ApprovalMode.PLAN
) {
  logger.warn(
    'Approval mode overridden to "default" ' +
    'because the current folder is not trusted.',
  );
  approvalMode = ApprovalMode.DEFAULT;
}

// ⚠️ yolo 和 auto-edit 在不受信任目录强制降级为 default`}
            />
          </div>

          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
              <span>🚫</span>
              <span>MCP 服务器发现受限</span>
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              项目级 <code>.innies/settings.json</code> 中定义的 MCP 服务器在非信任目录不会被加载
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <div>✅ 用户级 <code>~/.innies/settings.json</code> MCP 配置：始终生效</div>
              <div>✅ 扩展提供的 MCP 配置：始终生效</div>
              <div>❌ 项目级 <code>.innies/settings.json</code> MCP 配置：仅受信任时生效</div>
            </div>
          </div>
        </div>

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
                <strong>loadEnvFiles() 阶段</strong> - 决定是否加载项目级 .env
                <div className="text-xs text-gray-400 mt-1">
                  位置: <code>packages/cli/src/config/settings.ts:540</code>
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
                <strong>loadHierarchicalGeminiMemory() 阶段</strong> - 决定是否加载项目级 INNIES.md
                <div className="text-xs text-gray-400 mt-1">
                  位置: <code>packages/core/src/utils/memoryDiscovery.ts:359</code>
                </div>
              </div>
            </div>
          </div>
        </HighlightBox>
      </Layer>

      {/* userMemory 构建 */}
      <Layer title="userMemory 构建机制" icon="🧠">
        <HighlightBox title="INNIES.md 层级发现" icon="🔍" variant="green">
          <p className="text-sm mb-2">
            <code>loadHierarchicalGeminiMemory()</code> 函数负责发现并合并多层级的 INNIES.md 文件，
            构建成 <code>userMemory</code> 字符串传递给 AI 模型。
          </p>
          <p className="text-sm text-gray-400">
            源码位置: <code>packages/core/src/utils/memoryDiscovery.ts:359</code>
          </p>
        </HighlightBox>

        <MermaidDiagram
          title="INNIES.md 发现与合并流程"
          chart={`flowchart TB
    Start([开始加载记忆]) --> GetPaths[getGeminiMdFilePathsInternal<br/>获取所有 INNIES.md 路径]

    GetPaths --> GlobalCheck{检查全局级}
    GlobalCheck -->|存在| AddGlobal[添加 ~/.innies/INNIES.md]
    GlobalCheck -->|不存在| CheckProject
    AddGlobal --> CheckProject

    CheckProject{检查项目级}
    CheckProject -->|受信任| AddProject[添加 .innies/INNIES.md]
    CheckProject -->|不受信任| SkipProject[跳过项目级]

    AddProject --> CheckInclude
    SkipProject --> CheckInclude

    CheckInclude{includeDirectories?}
    CheckInclude -->|有| AddInclude[添加各 includeDirectory<br/>下的 INNIES.md]
    CheckInclude -->|无| CheckExtensions
    AddInclude --> CheckExtensions

    CheckExtensions{扩展 contextFiles?}
    CheckExtensions -->|有| AddExtensions[添加扩展提供的<br/>context 文件]
    CheckExtensions -->|无| ReadFiles
    AddExtensions --> ReadFiles

    ReadFiles[readGeminiMdFiles<br/>读取所有文件内容]

    ReadFiles --> Concatenate[concatenateInstructions<br/>拼接成单一字符串]

    Concatenate --> Result([userMemory: string])

    style Start fill:#22d3ee,stroke:#0891b2,color:#000
    style Result fill:#4ade80,stroke:#16a34a,color:#000
    style CheckProject fill:#f59e0b,stroke:#d97706,color:#000
    style SkipProject fill:#ef4444,stroke:#dc2626,color:#fff
    style AddGlobal fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style AddProject fill:#8b5cf6,stroke:#7c3aed,color:#fff`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">层级合并（全局 → 项目）</h4>
            <CodeBlock
              code={`// 1. 全局级（始终加载）
~/.innies/INNIES.md

// 2. 项目级（受信任时加载）
/path/to/project/.innies/INNIES.md

// 3. includeDirectories（若启用）
/include/dir1/.innies/INNIES.md
/include/dir2/.innies/INNIES.md

// 4. 扩展提供的 context files
/extension/context/file1.md
/extension/context/file2.md

// 最终拼接成单一字符串
userMemory = concatenate(所有文件内容)`}
            />
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2">importFormat 控制</h4>
            <p className="text-sm text-gray-300 mb-2">
              <code>context.importFormat</code> 配置项控制如何展示文件来源：
            </p>
            <div className="space-y-2 text-xs">
              <div className="bg-black/30 rounded p-2">
                <div className="text-cyan-400 font-bold mb-1">tree 格式（默认）</div>
                <pre className="text-gray-400">{`# Codebase and user instructions
...
Contents of ~/.innies/INNIES.md:
[global content]

Contents of /project/.innies/INNIES.md:
[project content]`}</pre>
              </div>
              <div className="bg-black/30 rounded p-2">
                <div className="text-orange-400 font-bold mb-1">flat 格式</div>
                <pre className="text-gray-400">{`# claudeMd
[concatenated content without file paths]`}</pre>
              </div>
            </div>
          </div>
        </div>

        <CodeBlock
          title="packages/core/src/utils/memoryDiscovery.ts:359-415 - 核心实现"
          code={`export async function loadServerHierarchicalMemory(
  currentWorkingDirectory: string,
  includeDirectoriesToReadGemini: readonly string[],
  debugMode: boolean,
  fileService: FileDiscoveryService,
  extensionContextFilePaths: string[] = [],
  folderTrust: boolean,  // ⚠️ 信任标志
  importFormat: 'flat' | 'tree' = 'tree',
  fileFilteringOptions?: FileFilteringOptions,
  maxDirs: number = 200,
): Promise<LoadServerHierarchicalMemoryResponse> {
  // 1. 获取所有 INNIES.md 文件路径
  const filePaths = await getGeminiMdFilePathsInternal(
    currentWorkingDirectory,
    includeDirectoriesToReadGemini,
    userHomePath,
    debugMode,
    fileService,
    extensionContextFilePaths,
    folderTrust,  // ⚠️ 传递信任状态
    fileFilteringOptions || DEFAULT_MEMORY_FILE_FILTERING_OPTIONS,
    maxDirs,
  );

  if (filePaths.length === 0) {
    return { memoryContent: '', fileCount: 0 };
  }

  // 2. 读取所有文件内容
  const contentsWithPaths = await readGeminiMdFiles(
    filePaths,
    debugMode,
    importFormat,
  );

  // 3. 拼接成单一指令字符串
  const combinedInstructions = concatenateInstructions(
    contentsWithPaths,
    currentWorkingDirectory,
  );

  return {
    memoryContent: combinedInstructions,
    fileCount: contentsWithPaths.length,
  };
}`}
        />

        <HighlightBox title="Context Files 处理" icon="📄" variant="blue">
          <p className="text-sm mb-2">
            扩展可以通过 <code>extension.contextFiles</code> 提供额外的上下文文件，
            这些文件会与 INNIES.md 一起被加载并拼接到 <code>userMemory</code> 中。
          </p>
          <CodeBlock
            code={`// 扩展定义示例（extension.ts）
export const myExtension: Extension = {
  name: 'my-extension',
  contextFiles: [
    '/path/to/extension/context.md',
    '/path/to/extension/rules.md',
  ],
  // ...
};

// 这些文件会在 loadHierarchicalGeminiMemory 中被包含
const extensionContextFilePaths = activeExtensions.flatMap(
  (e) => e.contextFiles,
);`}
          />
        </HighlightBox>
      </Layer>

      {/* 工具集组装 */}
      <Layer title="工具集组装：三路合流" icon="🛠️">
        <HighlightBox title="createToolRegistry() 工具来源" icon="⚙️" variant="purple">
          <p className="text-sm mb-2">
            <code>Config.createToolRegistry()</code> 负责组装最终的工具集，
            工具来源于三个渠道，按优先级合流：
          </p>
        </HighlightBox>

        <MermaidDiagram
          title="工具集三路合流"
          chart={`flowchart LR
    subgraph Source1[核心工具]
      Core[Core 内置工具<br/>Read/Edit/Bash/Grep/...]
      CoreFilter{coreTools<br/>白名单?}
      Core --> CoreFilter
      CoreFilter -->|过滤| CoreEnabled[启用的核心工具]
    end

    subgraph Source2[发现工具]
      Discovery[discoveryCommand<br/>外部工具发现]
      DiscoveryExec[执行发现命令<br/>获取工具定义]
      Discovery --> DiscoveryExec
      DiscoveryExec --> DiscoveryTools[外部工具列表]
    end

    subgraph Source3[MCP 工具]
      McpServers[MCP 服务器配置]
      McpConnect[连接 MCP 服务器<br/>获取工具列表]
      McpServers --> McpConnect
      McpConnect --> McpTools[MCP 工具列表]
    end

    CoreEnabled --> Registry[ToolRegistry]
    DiscoveryTools --> Registry
    McpTools --> Registry

    Registry --> ExcludeFilter{excludeTools<br/>黑名单?}
    ExcludeFilter -->|过滤| FinalToolset([最终工具集])

    style Source1 fill:#22d3ee20,stroke:#22d3ee
    style Source2 fill:#8b5cf620,stroke:#8b5cf6
    style Source3 fill:#f59e0b20,stroke:#f59e0b
    style FinalToolset fill:#4ade80,stroke:#16a34a,color:#000`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-cyan-500/10 border-2 border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
              <span>1️⃣</span>
              <span>Core 内置工具</span>
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              源码: <code className="text-xs">packages/core/src/config/config.ts:1092-1200</code>
            </p>
            <div className="text-xs space-y-1 text-gray-400">
              <div>✅ TaskTool - 子任务委托</div>
              <div>✅ LSTool - 列出文件</div>
              <div>✅ ReadFileTool - 读取文件</div>
              <div>✅ GrepTool - 搜索内容</div>
              <div>✅ EditTool - 编辑文件</div>
              <div>✅ WriteFileTool - 写入文件</div>
              <div>✅ ShellTool - 执行命令</div>
              <div>✅ WebSearchTool - 网络搜索</div>
              <div>... 等 20+ 工具</div>
            </div>
          </div>

          <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
              <span>2️⃣</span>
              <span>Discovery 发现工具</span>
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              通过 <code>tools.discoveryCommand</code> 发现外部工具
            </p>
            <CodeBlock
              code={`// settings.json 配置
{
  "tools": {
    "discoveryCommand": "./discover-tools.sh"
  }
}

// 发现命令输出格式（JSON）
[
  {
    "name": "custom_tool",
    "description": "My custom tool",
    "parameters": {...}
  }
]`}
            />
          </div>

          <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2">
              <span>3️⃣</span>
              <span>MCP 工具</span>
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              从 MCP 服务器获取工具定义
            </p>
            <div className="text-xs space-y-1 text-gray-400">
              <div>🔌 连接到配置的 MCP 服务器</div>
              <div>📋 调用 tools/list 获取工具列表</div>
              <div>🔄 动态注册工具到 Registry</div>
              <div>⚙️ 工具调用通过 MCP 协议代理</div>
            </div>
          </div>
        </div>

        <CodeBlock
          title="packages/core/src/config/config.ts:1092-1200 - createToolRegistry 实现"
          code={`async createToolRegistry(): Promise<ToolRegistry> {
  const registry = new ToolRegistry(this, this.eventEmitter);

  // Helper: 注册核心工具（带 coreTools/excludeTools 过滤）
  const registerCoreTool = (ToolClass: any, ...args: unknown[]) => {
    const toolName = ToolClass.Name || ToolClass.name;
    const coreTools = this.getCoreTools();  // tools.core 白名单
    const excludeTools = this.getExcludeTools() || [];  // tools.exclude 黑名单

    let isEnabled = true;

    // 1️⃣ coreTools 白名单过滤
    if (coreTools) {
      isEnabled = coreTools.some(
        (tool) =>
          tool === toolName ||
          tool.startsWith(\`\${toolName}(\`),
      );
    }

    // 2️⃣ excludeTools 黑名单过滤
    const isExcluded = excludeTools.some(
      (tool) => tool === toolName,
    );

    if (isExcluded) {
      isEnabled = false;
    }

    // 3️⃣ 只注册启用的工具
    if (isEnabled) {
      registry.registerTool(new ToolClass(...args));
    }
  };

  // 注册所有核心工具
  registerCoreTool(TaskTool, this);
  registerCoreTool(LSTool, this);
  registerCoreTool(ReadFileTool, this);
  registerCoreTool(GrepTool, this);
  registerCoreTool(EditTool, this);
  registerCoreTool(WriteFileTool, this);
  registerCoreTool(ShellTool, this);
  registerCoreTool(WebSearchTool, this);
  // ... 更多核心工具

  // 4️⃣ 发现外部工具（如果配置了 discoveryCommand）
  if (this.getToolDiscoveryCommand()) {
    await registry.discoverTools(this.getToolDiscoveryCommand());
  }

  // 5️⃣ 注册 MCP 工具（通过 MCP 服务器连接获取）
  await registry.registerMcpTools(this.getMcpServers());

  return registry;
}`}
        />

        <HighlightBox title="工具过滤优先级" icon="🎯" variant="orange">
          <div className="text-sm space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-red-400 font-bold">1.</span>
              <div>
                <strong className="text-red-400">excludeTools 黑名单</strong> - 优先级最高，直接排除
                <div className="text-xs text-gray-400 mt-1">
                  <code>tools.exclude: ["web_search"]</code> → 无论如何都排除
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">2.</span>
              <div>
                <strong className="text-cyan-400">coreTools 白名单</strong> - 若配置则只启用列表中的工具
                <div className="text-xs text-gray-400 mt-1">
                  <code>tools.core: ["read_file", "edit"]</code> → 只启用这两个核心工具
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">3.</span>
              <div>
                <strong className="text-green-400">默认全启用</strong> - 若无配置则所有核心工具默认启用
                <div className="text-xs text-gray-400 mt-1">
                  未配置 <code>tools.core</code> 时的行为
                </div>
              </div>
            </div>
          </div>
        </HighlightBox>
      </Layer>

      {/* 源码位置 */}
      <Layer title="源码位置" icon="📍">
        <HighlightBox title="配置系统核心源码" icon="📁" variant="blue">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-cyan-400 font-bold mb-2">配置加载与合并</h5>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/settings.ts:35-48</code>
                  <span className="text-gray-400 text-xs">getMergeStrategyForPath() 策略查找</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/settings.ts:396-418</code>
                  <span className="text-gray-400 text-xs">mergeSettings() 四层合并</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/settings.ts:421-484</code>
                  <span className="text-gray-400 text-xs">LoadedSettings 类</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/settings.ts:540</code>
                  <span className="text-gray-400 text-xs">loadEnvFiles() 环境变量加载</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/utils/deepMerge.ts</code>
                  <span className="text-gray-400 text-xs">customDeepMerge() 实现</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-purple-400 font-bold mb-2">完整加载链路</h5>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/config.ts:522-708</code>
                  <span className="text-gray-400 text-xs">loadCliConfig() 主入口</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/config.ts:605-615</code>
                  <span className="text-gray-400 text-xs">approvalMode 安全降级</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/core/src/utils/memoryDiscovery.ts:359-415</code>
                  <span className="text-gray-400 text-xs">loadServerHierarchicalMemory()</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/core/src/config/config.ts:1092-1200</code>
                  <span className="text-gray-400 text-xs">createToolRegistry() 工具组装</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-red-400 font-bold mb-2">信任与安全</h5>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/trustedFolders.ts</code>
                  <span className="text-gray-400 text-xs">工作区信任机制</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/settings.ts:403</code>
                  <span className="text-gray-400 text-xs">workspace 配置信任检查</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/settings.ts:540</code>
                  <span className="text-gray-400 text-xs">.env 文件信任检查</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-green-400 font-bold mb-2">Schema 与定义</h5>
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/settingsSchema.ts:51-60</code>
                  <span className="text-gray-400 text-xs">MergeStrategy 枚举定义</span>
                </div>
                <div className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">packages/cli/src/config/settingsSchema.ts</code>
                  <span className="text-gray-400 text-xs">完整 Settings Schema 定义</span>
                </div>
              </div>
            </div>
          </div>
        </HighlightBox>
      </Layer>
    </div>
  );
}
