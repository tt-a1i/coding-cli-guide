import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

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

      {/* 源码位置 */}
      <Layer title="源码位置" icon="📍">
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/config/settingsSchema.ts:51-60</code>
            <span className="text-gray-400">MergeStrategy 枚举定义</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/config/settings.ts:35-48</code>
            <span className="text-gray-400">getMergeStrategyForPath() 策略查找</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/config/settings.ts:396-418</code>
            <span className="text-gray-400">mergeSettings() 四层合并</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/config/settings.ts:421-484</code>
            <span className="text-gray-400">LoadedSettings 类</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/utils/deepMerge.ts</code>
            <span className="text-gray-400">customDeepMerge() 实现</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-black/30 px-2 py-1 rounded">packages/cli/src/config/trustedFolders.ts</code>
            <span className="text-gray-400">工作区信任机制</span>
          </div>
        </div>
      </Layer>
    </div>
  );
}
