import { useState } from 'react';
import { HighlightBox } from '../components/HighlightBox';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CodeBlock } from '../components/CodeBlock';
import { Layer } from '../components/Layer';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';




const relatedPages: RelatedPage[] = [
 { id: 'slash-cmd', label: '斜杠命令', description: '命令使用指南' },
 { id: 'custom-cmd', label: '自定义命令', description: 'TOML 命令定义' },
 { id: 'extension', label: '扩展系统', description: '扩展命令来源' },
 { id: 'prompt-processors', label: 'Prompt处理器', description: '命令预处理' },
 { id: 'policy-engine', label: 'Policy引擎', description: '命令权限检查' },
];

function QuickSummary({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
 return (
 <div className="mb-8 bg-surface rounded-lg border border-edge overflow-hidden">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-elevated transition-colors"
 >
 <div className="flex items-center gap-3">
 <span className="text-2xl">📦</span>
 <span className="text-xl font-bold text-heading">30秒快速理解</span>
 </div>
 <span className={`transform transition-transform text-dim ${isExpanded ? 'rotate-180' : ''}`}>
 ▼
 </span>
 </button>

 {isExpanded && (
 <div className="px-6 pb-6 space-y-5">
 {/* 一句话总结 */}
 <div className="bg-base/50 rounded-lg p-4 ">
 <p className="text-heading font-medium">
 <span className="text-heading font-bold">一句话：</span>
 多源命令加载器链，从内置代码、用户目录、项目目录、扩展加载斜杠命令，自动解决命名冲突
 </p>
 </div>

 {/* 关键数字 */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">2</div>
 <div className="text-xs text-dim">加载器类型</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">4</div>
 <div className="text-xs text-dim">命令来源</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">30+</div>
 <div className="text-xs text-dim">内置命令</div>
 </div>
 <div className="bg-surface rounded-lg p-3 text-center border border-edge">
 <div className="text-2xl font-bold text-heading">TOML</div>
 <div className="text-xs text-dim">文件格式</div>
 </div>
 </div>

 {/* 核心流程 */}
 <div>
 <h4 className="text-sm font-semibold text-dim mb-2">加载优先级（后者覆盖前者）</h4>
 <div className="flex items-center gap-2 flex-wrap text-sm">
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Built-in
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 User ~/.config
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 text-heading pl-3 border-l-2 border-l-edge-hover/30">
 Project .gemini
 </span>
 <span className="text-dim">→</span>
 <span className="px-3 py-1.5 bg-elevated/20 text-heading rounded-lg border border-edge/30">
 Extensions
 </span>
 </div>
 </div>

 {/* 源码入口 */}
 <div className="flex items-center gap-2 text-sm">
 <span className="text-dim">📍 源码入口:</span>
 <code className="px-2 py-1 bg-base rounded text-heading text-xs">
 packages/cli/src/services/CommandService.ts
 </code>
 </div>
 </div>
 )}
 </div>
 );
}

export function CommandLoading() {
 const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

 const loadingFlowChart = `flowchart TD
 subgraph Loaders["加载器"]
 BL[BuiltinCommandLoader]
 FL[FileCommandLoader]
 end

 subgraph Sources["命令来源"]
 builtin[(内置命令<br/>30+)]
 user[(用户目录<br/>~/.config/gemini/commands)]
 project[(项目目录<br/>.gemini/commands)]
 ext[(扩展目录<br/>extensions/*/commands)]
 end

 subgraph Service["CommandService"]
 parallel[并行加载]
 merge[合并命令]
 resolve[冲突解决]
 freeze[冻结结果]
 end

 output([readonly SlashCommand[]])

 BL --> builtin
 FL --> user
 FL --> project
 FL --> ext

 builtin --> parallel
 user --> parallel
 project --> parallel
 ext --> parallel

 parallel --> merge
 merge --> resolve
 resolve --> freeze
 freeze --> output

 style BL fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style FL fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style resolve fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style output fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}`;

 const commandServiceCode = `// packages/cli/src/services/CommandService.ts

export class CommandService {
  private constructor(private readonly commands: readonly SlashCommand[]) {}

  /**
  * 工厂方法：并行加载所有命令并解决冲突
  */
  static async create(
  loaders: ICommandLoader[],
  signal: AbortSignal,
  ): Promise<CommandService> {
  // 1. 并行执行所有加载器
  const results = await Promise.allSettled(
  loaders.map((loader) => loader.loadCommands(signal)),
  );

  // 2. 收集所有命令
  const allCommands: SlashCommand[] = [];
  for (const result of results) {
  if (result.status === 'fulfilled') {
  allCommands.push(...result.value);
  } else {
  console.debug('A command loader failed:', result.reason);
  }
  }

  // 3. 解决命名冲突
  const commandMap = new Map<string, SlashCommand>();
  for (const cmd of allCommands) {
  let finalName = cmd.name;

  // 扩展命令冲突时重命名
  if (cmd.extensionName && commandMap.has(cmd.name)) {
  let renamedName = \`\${cmd.extensionName}.\${cmd.name}\`;
  let suffix = 1;
  while (commandMap.has(renamedName)) {
  renamedName = \`\${cmd.extensionName}.\${cmd.name}\${suffix}\`;
  suffix++;
  }
  finalName = renamedName;
  }

  commandMap.set(finalName, { ...cmd, name: finalName });
  }

  // 4. 冻结并返回
  const finalCommands = Object.freeze(Array.from(commandMap.values()));
  return new CommandService(finalCommands);
  }

  getCommands(): readonly SlashCommand[] {
  return this.commands;
  }
}`;

 const builtinLoaderCode = `// packages/cli/src/services/BuiltinCommandLoader.ts

export class BuiltinCommandLoader implements ICommandLoader {
  constructor(private config: Config | null) {}

  async loadCommands(_signal: AbortSignal): Promise<SlashCommand[]> {
  const allDefinitions: Array<SlashCommand | null> = [
  aboutCommand,
  agentsCommand,
  approvalModeCommand,
  authCommand,
  bugCommand,
  chatCommand,
  clearCommand,
  compressCommand,
  copyCommand,
  corgiCommand,
  docsCommand,
  directoryCommand,
  editorCommand,
  extensionsCommand,
  helpCommand,
  await ideCommand(),
  initCommand,
  mcpCommand,
  memoryCommand,
  modelCommand,
  // 条件命令
  ...(this.config?.getFolderTrust() ? [permissionsCommand] : []),
  quitCommand,
  quitConfirmCommand,
  restoreCommand(this.config),
  statsCommand,
  summaryCommand,
  themeCommand,
  toolsCommand,
  settingsCommand,
  vimCommand,
  setupGithubCommand,
  terminalSetupCommand,
  ];

  return allDefinitions.filter((cmd): cmd is SlashCommand => cmd !== null);
  }
}`;

 const fileLoaderCode = `// packages/cli/src/services/FileCommandLoader.ts

export class FileCommandLoader implements ICommandLoader {
  private readonly projectRoot: string;
  private readonly folderTrust: boolean;

  constructor(private readonly config: Config | null) {
  this.folderTrust = !!config?.getFolderTrust();
  this.projectRoot = config?.getProjectRoot() || process.cwd();
  }

  async loadCommands(signal: AbortSignal): Promise<SlashCommand[]> {
  // 不信任的文件夹不加载文件命令
  if (this.folderTrustEnabled && !this.folderTrust) {
  return [];
  }

  const allCommands: SlashCommand[] = [];
  const commandDirs = this.getCommandDirectories();

  for (const dirInfo of commandDirs) {
  const files = await glob('**/*.toml', { cwd: dirInfo.path, signal });
  const commands = await Promise.all(
  files.map((file) => this.parseAndAdaptFile(
  path.join(dirInfo.path, file),
  dirInfo.path,
  dirInfo.extensionName,
  ))
  );
  allCommands.push(...commands.filter(Boolean));
  }

  return allCommands;
  }

  private getCommandDirectories(): CommandDirectory[] {
  return [
  { path: Storage.getUserCommandsDir() }, // 用户级
  { path: storage.getProjectCommandsDir() }, // 项目级
  ...this.getExtensionCommandDirs(), // 扩展级
  ];
  }
}`;

 const tomlParsingCode = `// TOML 命令文件解析

const TomlCommandDefSchema = z.object({
  prompt: z.string({ required_error: "The 'prompt' field is required." }),
  description: z.string().optional(),
});

private async parseAndAdaptFile(
  filePath: string,
  baseDir: string,
  extensionName?: string,
): Promise<SlashCommand | null> {
  // 1. 读取文件
  const fileContent = await fs.readFile(filePath, 'utf-8');

  // 2. 解析 TOML
  const parsed = toml.parse(fileContent);

  // 3. 验证 Schema
  const validationResult = TomlCommandDefSchema.safeParse(parsed);
  if (!validationResult.success) {
  console.error(\`Skipping invalid command file: \${filePath}\`);
  return null;
  }

  // 4. 生成命令名（路径转换）
  // examples/test.toml → examples:test
  const relativePath = path.relative(baseDir, filePath);
  const commandName = relativePath
  .slice(0, -5) // 移除 .toml
  .split(path.sep)
  .map((s) => s.replaceAll(':', '_'))
  .join(':');

  // 5. 构建处理器链
  const processors: IPromptProcessor[] = [];
  if (usesAtFileInjection) processors.push(new AtFileProcessor());
  if (usesShellInjection) processors.push(new ShellProcessor());
  if (!usesArgs) processors.push(new DefaultArgumentProcessor());

  // 6. 返回命令定义
  return {
  name: commandName,
  description: validDef.description || \`Custom command\`,
  kind: CommandKind.FILE,
  extensionName,
  action: async (context, args) => {
  let content = [{ text: validDef.prompt }];
  for (const processor of processors) {
  content = await processor.process(content, context);
  }
  return { type: 'submit_prompt', content };
  },
  };
}`;

 const conflictResolutionCode = `// 冲突解决策略

/**
  * 命令冲突解决规则：
  *
  * 1. 非扩展命令（内置/用户/项目）：后者覆盖前者
  * - 加载顺序：Builtin → User → Project
  * - 项目命令可以覆盖用户命令和内置命令
  *
  * 2. 扩展命令：冲突时重命名
  * - 不覆盖已有命令
  * - 重命名为 extensionName.commandName
  * - 多次冲突时添加数字后缀
  */

// 冲突处理示例
const commandMap = new Map<string, SlashCommand>();

for (const cmd of allCommands) {
  if (cmd.extensionName && commandMap.has(cmd.name)) {
  // 扩展命令冲突 → 重命名
  // "help" → "my-ext.help"
  let newName = \`\${cmd.extensionName}.\${cmd.name}\`;
  while (commandMap.has(newName)) {
  newName = \`\${cmd.extensionName}.\${cmd.name}\${suffix++}\`;
  }
  commandMap.set(newName, { ...cmd, name: newName });
  } else {
  // 非扩展命令 → 直接覆盖
  commandMap.set(cmd.name, cmd);
  }
}`;

 return (
 <div className="space-y-8">
 <QuickSummary
 isExpanded={isSummaryExpanded}
 onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
 />

 {/* 页面标题 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">命令加载系统</h2>
 <p className="text-body mb-4">
 命令加载系统通过多个加载器从不同来源（内置代码、用户目录、项目目录、扩展）
 并行加载斜杠命令，统一管理命名冲突，最终提供一个只读的命令列表供 CLI 使用。
 </p>
 </section>

 {/* 1. 架构概览 */}
 <Layer title="架构概览" icon="🏗️">
 <div className="space-y-4">
 <MermaidDiagram chart={loadingFlowChart} title="命令加载流程" />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HighlightBox title="BuiltinCommandLoader" variant="blue">
 <div className="text-sm space-y-2">
 <p className="text-body">内置命令加载器</p>
 <ul className="text-body space-y-1">
 <li>硬编码的核心命令</li>
 <li>30+ 内置命令</li>
 <li>同步加载，无 IO</li>
 <li>条件命令支持</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="FileCommandLoader" variant="purple">
 <div className="text-sm space-y-2">
 <p className="text-body">文件命令加载器</p>
 <ul className="text-body space-y-1">
 <li>扫描 TOML 文件</li>
 <li>支持递归目录</li>
 <li>Zod Schema 验证</li>
 <li>处理器链构建</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </div>
 </Layer>

 {/* 2. CommandService */}
 <Layer title="CommandService 协调器" icon="🎛️">
 <div className="space-y-4">
 <CodeBlock code={commandServiceCode} language="typescript" title="CommandService 实现" />

 <HighlightBox title="设计要点" variant="green">
 <div className="text-sm space-y-2 text-body">
 <ul className="space-y-2">
 <li>
 <strong>工厂模式：</strong>
 <span className="text-body">使用 static create() 确保初始化完成后才能使用</span>
 </li>
 <li>
 <strong>并行加载：</strong>
 <span className="text-body">Promise.allSettled 并行执行所有加载器</span>
 </li>
 <li>
 <strong>容错处理：</strong>
 <span className="text-body">单个加载器失败不影响其他</span>
 </li>
 <li>
 <strong>不可变结果：</strong>
 <span className="text-body">Object.freeze 防止运行时修改</span>
 </li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 3. BuiltinCommandLoader */}
 <Layer title="内置命令加载" icon="📦">
 <div className="space-y-4">
 <CodeBlock code={builtinLoaderCode} language="typescript" title="BuiltinCommandLoader" />

 <div className="overflow-x-auto">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="bg-surface">
 <th className="border border-edge p-3 text-left text-body">类别</th>
 <th className="border border-edge p-3 text-left text-body">命令示例</th>
 <th className="border border-edge p-3 text-left text-body">说明</th>
 </tr>
 </thead>
 <tbody className="text-body">
 <tr>
 <td className="border border-edge p-3">系统</td>
 <td className="border border-edge p-3"><code>/help</code>, <code>/about</code>, <code>/quit</code></td>
 <td className="border border-edge p-3">基础系统命令</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3">会话</td>
 <td className="border border-edge p-3"><code>/clear</code>, <code>/compress</code>, <code>/restore</code></td>
 <td className="border border-edge p-3">会话管理</td>
 </tr>
 <tr>
 <td className="border border-edge p-3">配置</td>
 <td className="border border-edge p-3"><code>/auth</code>, <code>/model</code>, <code>/settings</code></td>
 <td className="border border-edge p-3">配置管理</td>
 </tr>
 <tr className="bg-surface/30">
 <td className="border border-edge p-3">扩展</td>
 <td className="border border-edge p-3"><code>/mcp</code>, <code>/extensions</code>, <code>/agents</code></td>
 <td className="border border-edge p-3">扩展集成</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </Layer>

 {/* 4. FileCommandLoader */}
 <Layer title="文件命令加载" icon="📄">
 <div className="space-y-4">
 <CodeBlock code={fileLoaderCode} language="typescript" title="FileCommandLoader" />
 <CodeBlock code={tomlParsingCode} language="typescript" title="TOML 解析与命令构建" />
 </div>
 </Layer>

 {/* 5. 冲突解决 */}
 <Layer title="命名冲突解决" icon="⚠️">
 <div className="space-y-4">
 <CodeBlock code={conflictResolutionCode} language="typescript" title="冲突解决策略" />

 <MermaidDiagram chart={`sequenceDiagram
 participant BL as BuiltinLoader
 participant UL as User TOML
 participant PL as Project TOML
 participant EL as Extension TOML
 participant CS as CommandService

 BL->>CS: /help (builtin)
 Note over CS: Map.set("help", builtin)

 UL->>CS: /help (user)
 Note over CS: Map.set("help", user) 覆盖

 PL->>CS: /help (project)
 Note over CS: Map.set("help", project) 覆盖

 EL->>CS: /help (ext: my-ext)
 Note over CS: 冲突! 重命名为 "my-ext.help"
 Note over CS: Map.set("my-ext.help", ext)`} title="冲突解决时序" />
 </div>
 </Layer>

 {/* 6. 安全考量 */}
 <Layer title="安全考量" icon="🔒">
 <div className="space-y-4">
 <HighlightBox title="文件夹信任检查" variant="red">
 <div className="text-sm space-y-2 text-body">
 <p><strong>风险：</strong>项目目录的 TOML 命令可能包含恶意代码。</p>
 <p><strong>保护：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li>启用 <code className="bg-base/30 px-1 rounded">folderTrust</code> 时才加载项目命令</li>
 <li>不信任的文件夹：FileCommandLoader 返回空数组</li>
 <li>Shell 注入需要 Policy 检查</li>
 </ul>
 </div>
 </HighlightBox>

 <HighlightBox title="AbortSignal 支持" variant="yellow">
 <div className="text-sm space-y-2 text-body">
 <p><strong>场景：</strong>用户快速退出时取消加载。</p>
 <p><strong>实现：</strong></p>
 <ul className="list-disc pl-5 space-y-1">
 <li>glob 支持 signal 参数</li>
 <li>AbortError 被静默处理</li>
 <li>不影响其他加载器</li>
 </ul>
 </div>
 </HighlightBox>
 </div>
 </Layer>

 {/* 7. 关键文件 */}
 <Layer title="关键文件与入口" icon="📁">
 <div className="grid grid-cols-1 gap-2 text-sm">
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/cli/src/services/CommandService.ts
 </code>
 <span className="text-body">命令服务协调器</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/cli/src/services/BuiltinCommandLoader.ts
 </code>
 <span className="text-body">内置命令加载器</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/cli/src/services/FileCommandLoader.ts
 </code>
 <span className="text-body">文件命令加载器</span>
 </div>
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-xs whitespace-nowrap">
 packages/cli/src/services/types.ts
 </code>
 <span className="text-body">ICommandLoader 接口</span>
 </div>
 </div>
 </Layer>

 <RelatedPages pages={relatedPages} />
 </div>
 );
}
