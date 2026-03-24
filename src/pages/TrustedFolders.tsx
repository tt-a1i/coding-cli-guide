import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



export function TrustedFolders() {
 const relatedPages: RelatedPage[] = [
 { id: 'approval-mode', label: '审批模式', description: '权限控制' },
 { id: 'sandbox', label: '沙箱系统', description: '安全隔离' },
 { id: 'config', label: '配置系统', description: '设置管理' },
 { id: 'ide-integration', label: 'IDE 集成', description: 'IDE 信任信号' },
 { id: 'extension', label: '扩展系统', description: '扩展管理' },
 { id: 'startup', label: '启动流程', description: '初始化检查' },
 ];
 const trustDecisionFlowChart = `flowchart TD
 start([启动 CLI])
 check_enabled{检查 folderTrust<br/>是否启用}
 check_ide[检查 IDE<br/>信任信号]
 ide_trusted{IDE 信任?}
 check_file[检查<br/>trustedFolders.json]
 file_has_rule{有规则?}
 show_dialog[显示信任对话框]
 user_choice{用户选择}
 trusted([完全功能模式])
 untrusted([受限安全模式])
 skip([跳过检查<br/>功能未启用])

 start --> check_enabled
 check_enabled -->|No| skip
 check_enabled -->|Yes| check_ide
 check_ide --> ide_trusted
 ide_trusted -->|Yes| trusted
 ide_trusted -->|No/无连接| check_file
 check_file --> file_has_rule
 file_has_rule -->|已信任| trusted
 file_has_rule -->|已拒绝| untrusted
 file_has_rule -->|无记录| show_dialog
 show_dialog --> user_choice
 user_choice -->|信任| trusted
 user_choice -->|不信任| untrusted

 style start fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style trusted fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style untrusted fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:${getThemeColor("--color-text", "#1c1917")}
 style skip fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style check_enabled fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style ide_trusted fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style file_has_rule fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style user_choice fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const enableConfigCode = `// ~/.gemini/settings.json
// 启用 Trusted Folders 功能

{
  "security": {
  "folderTrust": {
  "enabled": true
  }
  }
}

// 注意：此功能默认关闭
// 需要手动启用才会进行信任检查`;

 const trustedFoldersJsonCode = `// ~/.gemini/trustedFolders.json
// 来源: packages/cli/src/config/trustedFolders.ts
// 格式: Record<string, TrustLevel> - 简单的 { 路径: 信任级别 } 对象

{
  "/Users/dev/my-project": "TRUST_FOLDER", // 直接信任该目录
  "/Users/dev/projects": "TRUST_PARENT", // 信任父目录 (即 /Users/dev)
  "/Users/dev/downloaded-repo": "DO_NOT_TRUST" // 明确不信任
}

// TrustLevel 枚举值:
// - TRUST_FOLDER: 信任该目录及其子目录
// - TRUST_PARENT: 信任该目录的父目录（及其所有子目录）
// - DO_NOT_TRUST: 明确不信任该目录

// 匹配规则:
// 1. TRUST_FOLDER/TRUST_PARENT: 使用 isWithinRoot() 检查路径包含
// 2. DO_NOT_TRUST: 使用 path.normalize() 精确匹配`;

 const restrictionsCode = `// 不可信工作区的限制
// packages/core/src/config/config.ts

// 1. 工作区设置被忽略
function loadProjectSettings(): Settings {
  if (!this.isTrustedFolder()) {
  // 不加载 .gemini/settings.json
  return {};
  }
  return loadFromFile('.gemini/settings.json');
}

// 2. 环境变量被忽略
function loadEnvFiles(): void {
  if (!this.isTrustedFolder()) {
  // 不加载项目 .env 文件
  return;
  }
  dotenv.config({ path: '.env' });
}

// 3. 审批模式限制
setApprovalMode(mode: ApprovalMode): void {
  if (!this.isTrustedFolder() &&
  mode !== ApprovalMode.DEFAULT) {
  throw new Error(
  'Cannot enable privileged approval modes in an untrusted folder.'
  );
  }
}

// 4. 扩展管理受限
async installExtension(name: string): Promise<void> {
  if (!this.isTrustedFolder()) {
  throw new Error('Extension management is disabled in untrusted folders.');
  }
}

// 5. 自动内存加载禁用
function loadAutoMemory(): void {
  if (!this.isTrustedFolder()) {
  // 不自动加载 settings 指定的文件
  return;
  }
}`;

 const permissionsCommandCode = `// /permissions 命令
// 在 CLI 中运行以修改当前文件夹的信任状态

> /permissions

┌─────────────────────────────────────────┐
│ Folder Trust Settings │
│ │
│ Current folder: /Users/dev/my-project │
│ Status: Untrusted │
│ │
│ ○ Trust this folder │
│ ○ Trust parent folder │
│ ○ Don't trust │
│ │
│ [Enter] Confirm [Esc] Cancel │
└─────────────────────────────────────────┘`;

 const ideIntegrationCode = `// IDE 信任信号集成
// packages/cli/src/ui/AppContainer.tsx

// 当连接到 IDE (如 VSCode) 时，
// CLI 会询问 IDE 当前工作区是否被信任

interface IDETrustResponse {
  isTrusted: boolean;
  workspacePath: string;
}

async function checkIDETrust(): Promise<boolean | null> {
  if (!isIDEConnected()) {
  return null; // 无 IDE 连接，使用本地规则
  }

  const response = await ide.send('workspace/isTrusted');
  return response.isTrusted;
}

// IDE 信任优先级最高
// 这允许在 IDE 中统一管理信任设置`;

 return (
 <div className="space-y-8">
 {/* 概述 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">Trusted Folders 信任机制</h2>
 <p className="text-body mb-4">
 Trusted Folders 是一个安全功能，让你控制哪些项目可以使用 CLI 的完整能力。
 它通过在加载任何项目特定配置之前要求用户批准，防止潜在的恶意代码运行。
 </p>

 <HighlightBox title="为什么需要信任机制？" variant="red">
 <p className="text-sm text-body">
 当你打开一个不熟悉的项目（如从网上下载的代码）时，该项目可能包含恶意的
 <code className="text-heading">.gemini/settings.json</code> 配置，
 例如自动执行危险命令、加载恶意扩展，或窃取敏感信息。
 信任机制确保这些配置在用户明确信任之前不会生效。
 </p>
 </HighlightBox>
 </section>

 {/* 启用功能 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">启用功能</h3>
 <HighlightBox title="默认关闭" variant="blue">
 <p className="text-sm text-body mb-2">
 Trusted Folders 功能<strong>默认关闭</strong>。
 需要在用户设置中手动启用。
 </p>
 </HighlightBox>

 <CodeBlock code={enableConfigCode} language="json" title="启用 Trusted Folders" />
 </section>

 {/* 信任决策流程 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">信任决策流程</h3>
 <MermaidDiagram chart={trustDecisionFlowChart} title="信任决策流程" />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">决策优先级（从高到低）</h4>
 <ol className="text-sm text-body space-y-2">
 <li className="flex items-start gap-2">
 <span className="text-heading font-bold">1.</span>
 <div>
 <strong className="text-heading">IDE 信任信号</strong>
 <span className="text-body"> - 如果连接到 IDE，优先使用 IDE 的信任状态</span>
 </div>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading font-bold">2.</span>
 <div>
 <strong className="text-heading">本地信任文件</strong>
 <span className="text-body"> - 检查 ~/.gemini/trustedFolders.json</span>
 </div>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading font-bold">3.</span>
 <div>
 <strong className="text-heading">用户对话框</strong>
 <span className="text-body"> - 首次访问时弹出信任选择对话框</span>
 </div>
 </li>
 </ol>
 </div>
 </section>

 {/* 信任对话框 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">信任对话框</h3>
 <p className="text-body mb-4">
 首次在某个文件夹运行 CLI 时，会显示信任对话框：
 </p>

 <div className="bg-base rounded-lg p-6 border border-edge">
 <div className="text-center mb-4">
 <span className="text-2xl">🔒</span>
 <h4 className="text-lg font-semibold text-heading mt-2">Do you trust this folder?</h4>
 <p className="text-body text-sm mt-1">/Users/dev/downloaded-project</p>
 </div>

 <div className="space-y-3 max-w-md mx-auto">
 <div className="flex items-center gap-3 p-3 bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg cursor-pointer hover:bg-elevated">
 <div className="w-4 h-4 rounded-full border-2 border-edge"></div>
 <div>
 <p className="text-heading font-medium">Trust folder</p>
 <p className="text-body text-xs">Grant full trust to this folder</p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-3 bg-elevated/20 border border-edge rounded-lg cursor-pointer hover:bg-elevated/30">
 <div className="w-4 h-4 rounded-full border-2 border-edge"></div>
 <div>
 <p className="text-heading font-medium">Trust parent folder</p>
 <p className="text-body text-xs">Trust /Users/dev and all subdirectories</p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-3 bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg cursor-pointer hover:bg-elevated">
 <div className="w-4 h-4 rounded-full border-2 border-edge"></div>
 <div>
 <p className="text-heading font-medium">Don't trust</p>
 <p className="text-body text-xs">Run in restricted safe mode</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* 不可信工作区限制 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">不可信工作区的限制</h3>
 <p className="text-body mb-4">
 当文件夹<strong>不被信任</strong>时，CLI 运行在受限的"安全模式"：
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <HighlightBox title="1. 工作区设置被忽略" variant="red">
 <p className="text-sm text-body">
 不加载项目的 <code>.gemini/settings.json</code>，
 防止加载自定义工具和潜在危险配置。
 </p>
 </HighlightBox>

 <HighlightBox title="2. 环境变量被忽略" variant="red">
 <p className="text-sm text-body">
 不加载项目的 <code>.env</code> 文件，
 防止恶意环境变量覆盖。
 </p>
 </HighlightBox>

 <HighlightBox title="3. 扩展管理受限" variant="red">
 <p className="text-sm text-body">
 无法安装、更新或卸载扩展，
 防止项目自动安装恶意扩展。
 </p>
 </HighlightBox>

 <HighlightBox title="4. 审批模式受限" variant="red">
 <p className="text-sm text-body">
 只能使用 <code>default</code> 模式，
 无法启用 <code>autoEdit</code> 或 <code>yolo</code>（会被强制降级或直接报错）。
 </p>
 </HighlightBox>

 <HighlightBox title="5. 项目级工具策略忽略" variant="red">
 <p className="text-sm text-body">
 不加载项目级 <code>.gemini/settings.json</code> 中的工具配置（如 <code>tools.allowed</code> / <code>tools.exclude</code>），
 防止仓库通过配置诱导你自动执行危险操作。
 </p>
 </HighlightBox>

 <HighlightBox title="6. 自动内存加载禁用" variant="red">
 <p className="text-sm text-body">
 不会自动加载本地设置指定的文件到上下文中。
 </p>
 </HighlightBox>
 </div>

 <CodeBlock code={restrictionsCode} language="typescript" title="限制实现代码" />
 </section>

 {/* 信任规则文件 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">信任规则存储</h3>
 <CodeBlock code={trustedFoldersJsonCode} language="json" title="~/.gemini/trustedFolders.json" />

 <HighlightBox title="TrustLevel 语义" variant="blue">
 <ul className="text-sm text-body space-y-1">
 <li><code className="text-heading">TRUST_FOLDER</code>: 信任该路径及其所有子目录</li>
 <li><code className="text-heading">TRUST_PARENT</code>: 信任该路径的<strong>父目录</strong>，
 例如对 <code>/dev/projects</code> 设置 TRUST_PARENT 会信任 <code>/dev</code></li>
 <li><code className="text-heading">DO_NOT_TRUST</code>: 精确匹配该路径，标记为不信任</li>
 </ul>
 </HighlightBox>
 </section>

 {/* 管理信任设置 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">管理信任设置</h3>
 <CodeBlock code={permissionsCommandCode} language="text" title="/permissions 命令" />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="font-semibold text-heading mb-3">管理方式</h4>
 <ul className="text-sm text-body space-y-2">
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <div>
 <strong>/permissions</strong> - 在 CLI 中运行，修改当前文件夹的信任状态
 </div>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <div>
 <strong>直接编辑</strong> - 打开 <code>~/.gemini/trustedFolders.json</code> 手动编辑
 </div>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-heading">•</span>
 <div>
 <strong>IDE 设置</strong> - 通过 VSCode 等 IDE 的工作区信任设置
 </div>
 </li>
 </ul>
 </div>
 </section>

 {/* IDE 集成 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">IDE 信任集成</h3>
 <CodeBlock code={ideIntegrationCode} language="typescript" title="IDE 信任信号" />

 <HighlightBox title="VSCode 集成" variant="green">
 <p className="text-sm text-body">
 当使用 VSCode IDE Companion 扩展时，CLI 会自动从 VSCode 获取工作区信任状态。
 这意味着你在 VSCode 中信任的工作区，CLI 也会自动信任。
 </p>
 </HighlightBox>
 </section>

 {/* 架构图 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">信任检查架构</h3>
 <div className="bg-surface rounded-lg p-6">
 <pre className="text-sm text-body overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│ CLI 启动 │
└──────────────────────────┬──────────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────────┐
│ FolderTrust 检查器 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ settings.security.folderTrust.enabled ? │ │
│ └────────────────────────┬────────────────────────────────┘ │
│ │ │
│ ┌──────────────┴──────────────┐ │
│ │ │ │
│ ▼ ▼ │
│ ┌────────────┐ ┌────────────┐ │
│ │ Disabled │ │ Enabled │ │
│ │ 跳过检查 │ │ 进行检查 │ │
│ └────────────┘ └─────┬──────┘ │
│ │ │
│ ┌────────────────────┼────────────────────┐ │
│ │ │ │ │
│ ▼ ▼ ▼ │
│ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│ │ IDE Signal │ │ Local File │ │ Dialog │ │
│ │ (Priority 1)│ │ (Priority 2)│ │(Fallback)│ │
│ └──────┬──────┘ └──────┬──────┘ └────┬─────┘ │
│ │ │ │ │
│ └──────────────────┼────────────────┘ │
│ │ │
│ ▼ │
│ ┌─────────────────────────────────┐ │
│ │ Trust Decision │ │
│ │ │ │
│ │ trusted │ untrusted │ │
│ └───────┬──────┴────────┬────────┘ │
│ │ │ │
└────────────────────────────┼───────────────┼───────────────────┘
 │ │
 ▼ ▼
 ┌──────────────────┐ ┌──────────────────┐
 │ Full Access │ │ Restricted Mode │
 │ │ │ │
 │ • Load settings │ │ • Ignore settings│
 │ • Load .env │ │ • Ignore .env │
 │ • All modes │ │ • default only │
 │ • Extensions OK │ │ • No extensions │
 │ • AuOK │ │ • default only │
 └──────────────────┘ └──────────────────┘`}
 </pre>
 </div>
 </section>

 {/* 最佳实践 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">最佳实践</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">推荐做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>✓ 启用 folderTrust 功能</li>
 <li>✓ 信任包含所有项目的父目录</li>
 <li>✓ 对下载的代码保持"不信任"</li>
 <li>✓ 使用 IDE 集成统一管理信任</li>
 <li>✓ 定期审查 trustedFolders.json</li>
 </ul>
 </div>
 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">避免做法</h4>
 <ul className="text-sm text-body space-y-1">
 <li>✗ 信任 /tmp 或下载目录</li>
 <li>✗ 信任包含不熟悉代码的仓库</li>
 <li>✗ 禁用功能后运行不可信代码</li>
 <li>✗ 忽略信任对话框直接全部信任</li>
 <li>✗ 在不信任的项目中强制绕过限制</li>
 </ul>
 </div>
 </div>
 </section>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
