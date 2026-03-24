import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { getThemeColor } from '../utils/theme';



export function MemorySystemSplit() {
 // 记忆系统架构图
 const memoryArchitectureChart = `flowchart TD
 user_input([用户输入])
 ai_trigger([AI 识别需求])
 memory_cmd[&#47;memory 命令]
 save_memory[save_memory 工具]
 gemini_file[("GEMINI.md" 文件)]
 discovery["memoryDiscovery<br/>层级发现"]
 read_files[读取所有 GEMINI.md]
 concatenate[拼接内容]
 system_prompt[注入 System Prompt]
 write_section[写入 ## Gemini Added Memories]
 user_confirm[用户确认]

 user_input --> memory_cmd
 ai_trigger --> save_memory
 memory_cmd --> discovery
 discovery --> read_files
 read_files --> gemini_file
 gemini_file --> concatenate
 concatenate --> system_prompt
 save_memory --> user_confirm
 user_confirm --> write_section
 write_section --> gemini_file

 classDef input fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 classDef ai fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 classDef file fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 classDef output fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 classDef confirm fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}

 class user_input,memory_cmd input
 class ai_trigger,save_memory ai
 class gemini_file file
 class system_prompt output
 class user_confirm confirm`;

 // 层级发现流程
 const hierarchyDiscoveryChart = `flowchart TD
 start([开始层级发现])
 global["检查全局记忆<br/>~/.gemini/GEMINI.md"]
 project_root["向上查找项目根<br/>包含 .git 的目录"]
 current["当前工作目录<br/>./GEMINI.md"]
 bfs["BFS 向下搜索<br/>子目录 GEMINI.md"]

 trust_check{"folderTrust?"}
 stop_global([只返回全局记忆])

 read_all[读取所有发现的文件]
 process_import["处理 @import 指令"]
 concatenate[按层级拼接内容]
 result([返回 memoryContent])

 start --> global
 global --> trust_check
 trust_check -->|false| stop_global
 trust_check -->|true| project_root
 project_root --> current
 current --> bfs
 bfs --> read_all
 read_all --> process_import
 process_import --> concatenate
 concatenate --> result

 style start fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style trust_check fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style stop_global fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:${getThemeColor("--color-text", "#1c1917")}
 style result fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style global fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style project_root fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style current fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style bfs fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}`;

 // save_memory 工具流程
 const saveMemoryFlowChart = `flowchart TD
 start([AI 调用 save_memory])
 has_scope{"指定了 scope?"}
 show_selector["显示选择对话框<br/>GLOBAL vs PROJECT"]
 user_select[用户选择 scope]

 determine_file[确定目标文件路径]
 read_current[读取当前文件内容]

 has_section{"存在 ## Gemini<br/>Added Memories?"}
 append_section[在现有区段追加]
 create_section[文件末尾创建新区段]

 compute_diff[计算文件 diff]
 show_preview[显示差异预览]
 user_confirm{"用户确认?"}

 write_file[写入文件]
 success([保存成功])
 cancel([取消操作])

 start --> has_scope
 has_scope -->|No| show_selector
 has_scope -->|Yes| determine_file
 show_selector --> user_select
 user_select --> determine_file
 determine_file --> read_current
 read_current --> has_section
 has_section -->|Yes| append_section
 has_section -->|No| create_section
 append_section --> compute_diff
 create_section --> compute_diff
 compute_diff --> show_preview
 show_preview --> user_confirm
 user_confirm -->|Yes| write_file
 user_confirm -->|No| cancel
 write_file --> success

 style start fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style has_scope fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style has_section fill:${getThemeColor("--mermaid-purple-fill", "#ede9fe")},color:${getThemeColor("--color-text", "#1c1917")}
 style user_confirm fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},color:${getThemeColor("--color-text", "#1c1917")}
 style success fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},color:${getThemeColor("--color-text", "#1c1917")}
 style cancel fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},color:${getThemeColor("--color-text", "#1c1917")}
 style show_selector fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}
 style show_preview fill:${getThemeColor("--mermaid-info-fill", "#dbeafe")},color:${getThemeColor("--color-text", "#1c1917")}`;

 return (
 <div className="space-y-8">
 {/* 标题 */}
 <section>
 <h2 className="text-2xl font-bold text-heading mb-4">记忆系统：GEMINI.md 层级上下文机制</h2>
 <p className="text-body mb-4">
 Gemini CLI 的记忆系统通过 <code className="text-heading">GEMINI.md</code> 文件实现层级化的上下文管理。
 它包含两套机制：用户主动管理的 <code className="text-heading">/memory</code> 命令和 AI 自动调用的{' '}
 <code className="text-heading">save_memory</code> 工具。这两者互补协作，共同维护项目和用户的长期记忆。
 </p>

 <HighlightBox title="核心区别" variant="orange">
 <div className="text-sm">
 <p className="mb-2">
 <strong className="text-heading">/memory 命令</strong>：用户手动管理指令上下文的读取和刷新
 </p>
 <p>
 <strong className="text-heading">save_memory 工具</strong>：AI 自动保存事实到记忆文件的特定区段
 </p>
 </div>
 </HighlightBox>
 </section>

 {/* 目标 */}
 <Layer title="目标">
 <div className="space-y-3 text-sm">
 <div>
 <h4 className="text-heading font-semibold mb-1">解决的问题</h4>
 <ul className="space-y-1 text-body">
 <li><strong>上下文持久化</strong> - 跨会话保留项目规范、编码风格、架构决策</li>
 <li><strong>层级化管理</strong> - 全局偏好、项目规范、目录特定指令分层生效</li>
 <li><strong>自动化记忆</strong> - AI 自动识别并保存用户偏好和重要信息</li>
 <li><strong>安全隔离</strong> - 通过 folderTrust 机制防止恶意项目注入指令</li>
 </ul>
 </div>

 <div>
 <h4 className="text-heading font-semibold mb-1">设计目标</h4>
 <ul className="space-y-1 text-body">
 <li>提供灵活的指令层级体系（全局 → 项目 → 目录）</li>
 <li>支持 AI 自动学习和记忆用户习惯</li>
 <li>确保记忆内容的可审查性和可编辑性</li>
 <li>避免上下文污染和安全风险</li>
 </ul>
 </div>
 </div>
 </Layer>

 {/* 输入 */}
 <Layer title="输入">
 <div className="space-y-3 text-sm">
 <div>
 <h4 className="text-heading font-semibold mb-1">/memory 命令触发条件</h4>
 <ul className="space-y-1 text-body">
 <li>用户手动输入 <code className="text-heading">/memory add &lt;text&gt;</code></li>
 <li>用户输入 <code className="text-heading">/memory refresh</code> 刷新层级记忆</li>
 <li>用户输入 <code className="text-heading">/memory show</code> 查看当前上下文</li>
 <li>CLI 启动时自动调用 <code>loadServerHierarchicalMemory()</code></li>
 </ul>
 </div>

 <div>
 <h4 className="text-heading font-semibold mb-1">save_memory 工具触发条件</h4>
 <ul className="space-y-1 text-body">
 <li>用户明确表达"记住这个"、"下次使用..."等记忆意图</li>
 <li>AI 识别到值得长期保存的用户偏好（如"我喜欢用 TypeScript"）</li>
 <li>用户提供项目特定的重要信息（如"这个项目使用 pnpm"）</li>
 <li>AI 判断信息具有跨会话价值</li>
 </ul>
 </div>

 <div>
 <h4 className="text-body font-semibold mb-1">前置依赖</h4>
 <ul className="space-y-1 text-body">
 <li>
 • <code>currentWorkingDirectory</code> - 当前工作目录
 </li>
 <li>
 • <code>folderTrust</code> - 文件夹信任状态（影响是否加载项目记忆）
 </li>
 <li>
 • <code>contextFileName</code> - 配置的记忆文件名（默认 <code>GEMINI.md</code>）
 </li>
 </ul>
 </div>
 </div>
 </Layer>

 {/* 输出 */}
 <Layer title="输出">
 <div className="space-y-3 text-sm">
 <div>
 <h4 className="text-heading font-semibold mb-1">/memory 系统产出</h4>
 <ul className="space-y-1 text-body">
 <li>
 • <code>memoryContent: string</code> - 拼接后的所有层级记忆内容
 </li>
 <li>
 • <code>fileCount: number</code> - 加载的文件数量
 </li>
 <li>System Prompt 注入 - 所有记忆内容被注入到 AI 的上下文中</li>
 <li>层级标记 - 每个文件的内容用 <code>--- Context from: ... ---</code> 包裹</li>
 </ul>
 </div>

 <div>
 <h4 className="text-heading font-semibold mb-1">save_memory 工具产出</h4>
 <ul className="space-y-1 text-body">
 <li>
 • 修改后的 <code>GEMINI.md</code> 文件（新增或追加记忆条目）
 </li>
 <li>
 • <code>## Gemini Added Memories</code> 区段中的新列表项
 </li>
 <li>文件 diff 预览（用户确认前展示）</li>
 <li>成功/失败状态反馈</li>
 </ul>
 </div>

 <div>
 <h4 className="text-body font-semibold mb-1">副作用</h4>
 <ul className="space-y-1 text-body">
 <li>文件系统修改 - <code>save_memory</code> 会修改磁盘上的 GEMINI.md 文件</li>
 <li>System Prompt 更新 - <code>/memory refresh</code> 会重新加载并更新上下文</li>
 <li>Token 消耗 - 所有记忆内容都会占用上下文 Token</li>
 </ul>
 </div>
 </div>
 </Layer>

 {/* 关键文件与入口 */}
 <Layer title="关键文件与入口">
 <div className="text-sm space-y-2">
 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-heading shrink-0">
 packages/core/src/utils/memoryDiscovery.ts
 </code>
 <div className="text-body">
 <p className="font-semibold">层级记忆发现核心模块</p>
 <ul className="mt-1 space-y-0.5 text-xs">
 <li>
 • <code>loadServerHierarchicalMemory()</code> - 主入口函数
 </li>
 <li>
 • <code>getGeminiMdFilePathsInternal()</code> - 发现所有 GEMINI.md 文件
 </li>
 <li>
 • <code>readGeminiMdFiles()</code> - 读取并处理文件内容
 </li>
 <li>
 • <code>concatenateInstructions()</code> - 拼接所有层级内容
 </li>
 </ul>
 </div>
 </div>

 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-heading shrink-0">
 packages/core/src/tools/memoryTool.ts
 </code>
 <div className="text-body">
 <p className="font-semibold">save_memory 工具实现</p>
 <ul className="mt-1 space-y-0.5 text-xs">
 <li>
 • <code>MemoryToolInvocation</code> - 工具调用类
 </li>
 <li>
 • <code>computeNewContent()</code> - 计算新文件内容
 </li>
 <li>
 • <code>MEMORY_SECTION_HEADER</code> - "## Gemini Added Memories" 常量
 </li>
 <li>
 • <code>shouldConfirmExecute()</code> - 确认对话框逻辑
 </li>
 </ul>
 </div>
 </div>

 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-body shrink-0">
 packages/core/src/utils/memoryImportProcessor.ts
 </code>
 <div className="text-body">
 <p className="font-semibold">@import 指令处理器</p>
 <ul className="mt-1 space-y-0.5 text-xs">
 <li>
 • <code>processImportDirectives()</code> - 解析和执行 @import
 </li>
 <li>支持相对路径和绝对路径导入</li>
 <li>循环导入检测</li>
 </ul>
 </div>
 </div>

 <div className="flex items-start gap-2">
 <code className="bg-base/30 px-2 py-1 rounded text-body shrink-0">
 packages/cli/src/commands/memoryCommand.ts
 </code>
 <div className="text-body">
 <p className="font-semibold">/memory 命令处理器（可能存在）</p>
 <ul className="mt-1 space-y-0.5 text-xs">
 <li>处理 <code>add</code>、<code>show</code>、<code>refresh</code> 子命令</li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 {/* 流程图 */}
 <Layer title="流程图">
 <div className="space-y-6">
 <div>
 <h4 className="text-heading font-semibold mb-3">记忆系统整体架构</h4>
 <MermaidDiagram chart={memoryArchitectureChart} title="记忆系统数据流向" />
 </div>

 <div>
 <h4 className="text-heading font-semibold mb-3">层级发现流程</h4>
 <MermaidDiagram chart={hierarchyDiscoveryChart} title="GEMINI.md 文件发现顺序" />
 </div>

 <div>
 <h4 className="text-heading font-semibold mb-3">save_memory 工具执行流程</h4>
 <MermaidDiagram chart={saveMemoryFlowChart} title="AI 保存记忆的完整流程" />
 </div>
 </div>
 </Layer>

 {/* 关键分支与边界条件 */}
 <Layer title="关键分支与边界条件">
 <div className="space-y-4">
 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">folderTrust 安全机制</h4>
 <div className="text-sm text-body space-y-2">
 <div>
 <span className="text-heading font-semibold">folderTrust = true</span>
 <ul className="mt-1 space-y-0.5 ml-4">
 <li>加载全局记忆 + 项目根记忆 + 当前目录记忆 + 子目录记忆</li>
 <li>完整的层级上下文可用</li>
 </ul>
 </div>
 <div>
 <span className="text-heading font-semibold">folderTrust = false</span>
 <ul className="mt-1 space-y-0.5 ml-4">
 <li><strong>只加载全局记忆</strong> (~/.gemini/GEMINI.md)</li>
 <li>跳过所有项目相关的 GEMINI.md 文件</li>
 <li>防止恶意项目注入指令</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">save_memory scope 选择</h4>
 <div className="text-sm text-body space-y-2">
 <div>
 <span className="text-heading font-semibold">scope = "global"</span>
 <ul className="mt-1 space-y-0.5 ml-4">
 <li>
 • 目标文件：<code className="text-heading">~/.gemini/GEMINI.md</code>
 </li>
 <li>适用场景：用户全局偏好（如编码风格、工具选择）</li>
 </ul>
 </div>
 <div>
 <span className="text-heading font-semibold">scope = "project"</span>
 <ul className="mt-1 space-y-0.5 ml-4">
 <li>
 • 目标文件：<code className="text-heading">&lt;project-root&gt;/GEMINI.md</code>
 </li>
 <li>适用场景：项目特定信息（如技术栈、架构决策）</li>
 </ul>
 </div>
 <div>
 <span className="text-heading font-semibold">scope = undefined</span>
 <ul className="mt-1 space-y-0.5 ml-4">
 <li>显示选择对话框，由用户决定保存位置</li>
 <li>用户可在外部编辑器中修改 scope 参数</li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">## Gemini Added Memories 区段处理</h4>
 <div className="text-sm text-body space-y-2">
 <div>
 <span className="text-heading font-semibold">区段存在</span>
 <ul className="mt-1 space-y-0.5 ml-4">
 <li>在现有列表末尾追加新条目</li>
 <li>保留所有现有记忆</li>
 </ul>
 </div>
 <div>
 <span className="text-heading font-semibold">区段不存在</span>
 <ul className="mt-1 space-y-0.5 ml-4">
 <li>在文件末尾创建新区段</li>
 <li>格式：<code className="text-heading">## Gemini Added Memories\n- &lt;fact&gt;</code></li>
 </ul>
 </div>
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">BFS 子目录搜索限制</h4>
 <div className="text-sm text-body space-y-1">
 <li>
 • 最大搜索目录数：<code className="text-heading">maxDirs = 200</code>
 </li>
 <li>防止在大型项目中过度搜索</li>
 <li>广度优先搜索（BFS）确保优先发现浅层目录</li>
 </div>
 </div>

 <div className="bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">文件名配置</h4>
 <div className="text-sm text-body space-y-1">
 <li>
 • 默认文件名：<code className="text-heading">GEMINI.md</code>
 </li>
 <li>
 • 可通过 <code>settings.json</code> 配置为数组，同时读取多个文件
 </li>
 <li>
 • 示例：<code className="text-heading">["GEMINI.md", "CLAUDE.md", "CURSOR.md"]</code>
 </li>
 </div>
 </div>
 </div>
 </Layer>

 {/* 失败与恢复 */}
 <Layer title="失败与恢复">
 <div className="space-y-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">文件读取失败</h4>
 <div className="text-sm text-body space-y-1">
 <li>
 <strong>原因</strong>：文件不存在、权限不足、文件损坏
 </li>
 <li>
 <strong>处理</strong>：跳过该文件，继续读取其他层级的文件
 </li>
 <li>
 <strong>降级</strong>：至少加载全局记忆（如果可用）
 </li>
 </div>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">@import 循环依赖</h4>
 <div className="text-sm text-body space-y-1">
 <li>
 <strong>检测</strong>：<code>processImportDirectives()</code> 维护导入路径栈
 </li>
 <li>
 <strong>处理</strong>：检测到循环时中断导入，避免无限递归
 </li>
 <li>
 <strong>日志</strong>：记录循环导入警告信息
 </li>
 </div>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">save_memory 写入冲突</h4>
 <div className="text-sm text-body space-y-1">
 <li>
 <strong>场景</strong>：文件在读取后被外部修改
 </li>
 <li>
 <strong>检测</strong>：文件内容哈希不匹配（如果实现）
 </li>
 <li>
 <strong>恢复</strong>：提示用户刷新或手动合并
 </li>
 </div>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">用户取消 save_memory</h4>
 <div className="text-sm text-body space-y-1">
 <li>
 <strong>触发</strong>：用户在差异预览中拒绝确认
 </li>
 <li>
 <strong>行为</strong>：不修改文件，返回取消状态
 </li>
 <li>
 <strong>AI 反馈</strong>：工具调用返回 "User cancelled operation"
 </li>
 </div>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-2">Token 超限警告</h4>
 <div className="text-sm text-body space-y-1">
 <li>
 <strong>问题</strong>：过多的层级记忆导致 System Prompt 超长
 </li>
 <li>
 <strong>检测</strong>：计算总 Token 数（如果实现）
 </li>
 <li>
 <strong>建议</strong>：提示用户精简记忆内容或分层组织
 </li>
 </div>
 </div>
 </div>
 </Layer>

 {/* 相关配置项 */}
 <Layer title="相关配置项">
 <CodeBlock
 title="settings.json 配置示例"
 language="json"
 code={`{
 "context": {
 // 记忆文件名配置
 "contextFileName": "GEMINI.md", // 单个文件
 // 或
 "contextFileName": ["GEMINI.md", "CLAUDE.md", "CURSOR.md"] // 多个文件
 },

 // 文件夹信任设置（影响记忆加载范围）
 "folder": {
 "trust": true // true = 加载项目记忆, false = 仅全局记忆
 },

 // @import 处理配置
 "import": {
 "format": "tree", // "tree" 或 "flat"
 "maxDepth": 10 // 最大嵌套深度
 },

 // 文件过滤配置
 "fileFiltering": {
 "excludePatterns": [
 "**/node_modules/**",
 "**/.git/**",
 "**/dist/**"
 ]
 }
}`}
 />

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">环境变量</h4>
 <div className="text-sm text-body space-y-1">
 <li>
 <code className="text-heading">HOME</code> 或 <code className="text-heading">USERPROFILE</code> -
 用于确定全局记忆路径 (~/.gemini/GEMINI.md)
 </li>
 <li>
 <code className="text-heading">DEBUG</code> - 启用调试日志，查看记忆发现和加载详情
 </li>
 </div>
 </div>

 <div className="mt-4 bg-surface rounded-lg p-4">
 <h4 className="text-heading font-semibold mb-3">运行时参数</h4>
 <div className="text-sm text-body space-y-2">
 <div>
 <code className="text-heading">loadServerHierarchicalMemory()</code> 参数：
 <ul className="mt-1 space-y-0.5 ml-4">
 <li>
 • <code>currentWorkingDirectory</code> - 当前工作目录
 </li>
 <li>
 • <code>includeDirectoriesToReadGemini</code> - 额外包含的目录
 </li>
 <li>
 • <code>debugMode</code> - 调试模式开关
 </li>
 <li>
 • <code>folderTrust</code> - 文件夹信任状态
 </li>
 <li>
 • <code>importFormat</code> - "flat" 或 "tree"
 </li>
 <li>
 • <code>maxDirs</code> - BFS 最大搜索目录数（默认 200）
 </li>
 </ul>
 </div>
 </div>
 </div>
 </Layer>

 {/* 核心代码实现 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">核心代码实现</h3>

 <div className="space-y-6">
 <div>
 <h4 className="text-heading font-semibold mb-3">层级记忆加载</h4>
 <CodeBlock
 language="typescript"
 title="memoryDiscovery.ts - loadServerHierarchicalMemory()"
 code={`// packages/core/src/utils/memoryDiscovery.ts

export async function loadServerHierarchicalMemory(
 currentWorkingDirectory: string,
 includeDirectoriesToReadGemini: readonly string[],
 debugMode: boolean,
 fileService: FileDiscoveryService,
 extensionContextFilePaths: string[] = [],
 folderTrust: boolean,
 importFormat: 'flat' | 'tree' = 'tree',
 fileFilteringOptions?: FileFilteringOptions,
 maxDirs: number = 200,
): Promise<LoadServerHierarchicalMemoryResponse> {
 // 1. 发现所有 GEMINI.md 文件路径
 const filePaths = await getGeminiMdFilePathsInternal(
 currentWorkingDirectory,
 includeDirectoriesToReadGemini,
 debugMode,
 fileService,
 extensionContextFilePaths,
 folderTrust,
 fileFilteringOptions,
 maxDirs,
 );

 // 2. 读取文件内容并处理 @import
 const contentsWithPaths = await readGeminiMdFiles(
 filePaths,
 debugMode,
 importFormat,
 );

 // 3. 拼接所有内容
 const combinedInstructions = concatenateInstructions(
 contentsWithPaths,
 currentWorkingDirectory,
 );

 return {
 memoryContent: combinedInstructions,
 fileCount: contentsWithPaths.length,
 };
}

// 拼接格式
function concatenateInstructions(
 contents: GeminiFileContent[],
 cwd: string,
): string {
 return contents
 .filter(item => item.content)
 .map(item => {
 const displayPath = path.relative(cwd, item.filePath);
 return \`--- Context from: \${displayPath} ---
\${item.content.trim()}
--- End of Context from: \${displayPath} ---\`;
 })
 .join('\\n\\n');
}`}
 />
 </div>

 <div>
 <h4 className="text-heading font-semibold mb-3">save_memory 工具实现</h4>
 <JsonBlock
 code={`// 工具 Schema
{
 "name": "save_memory",
 "description": "Saves a specific piece of information or fact to your long-term memory...",
 "parametersJsonSchema": {
 "type": "object",
 "properties": {
 "fact": {
 "type": "string",
 "description": "The specific fact or piece of information to remember."
 },
 "scope": {
 "type": "string",
 "description": "Where to save: 'global' or 'project'",
 "enum": ["global", "project"]
 }
 },
 "required": ["fact"]
 }
}`}
 />

 <CodeBlock
 language="typescript"
 title="memoryTool.ts - computeNewContent()"
 code={`// packages/core/src/tools/memoryTool.ts

export const MEMORY_SECTION_HEADER = '## Gemini Added Memories';

function computeNewContent(currentContent: string, fact: string): string {
 const newMemoryItem = \`- \${fact.trim()}\`;

 const headerIndex = currentContent.indexOf(MEMORY_SECTION_HEADER);

 if (headerIndex === -1) {
 // 如果没有 Memories 区段，在文件末尾添加
 return currentContent + \`\\n\\n\${MEMORY_SECTION_HEADER}\\n\${newMemoryItem}\\n\`;
 } else {
 // 在现有区段中追加
 const beforeHeader = currentContent.substring(
 0,
 headerIndex + MEMORY_SECTION_HEADER.length,
 );
 const afterHeader = currentContent.substring(
 headerIndex + MEMORY_SECTION_HEADER.length,
 );

 // 找到区段结束位置（下一个 ## 或文件末尾）
 let endOfSection = afterHeader.indexOf('\\n## ');
 if (endOfSection === -1) endOfSection = afterHeader.length;

 const sectionContent = afterHeader.substring(0, endOfSection).trimEnd();
 const remaining = afterHeader.substring(endOfSection);

 return beforeHeader + sectionContent + \`\\n\${newMemoryItem}\` + remaining;
 }
}`}
 />
 </div>

 <div>
 <h4 className="text-heading font-semibold mb-3">文件发现顺序</h4>
 <div className="bg-base/30 rounded-lg p-4">
 <div className="space-y-2 text-sm">
 <div className="flex items-center gap-2">
 <span className="bg-elevated/20 px-2 py-1 rounded text-heading font-mono">1</span>
 <code className="text-body">~/.gemini/GEMINI.md</code>
 <span className="text-dim">全局记忆</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="bg-elevated/20 px-2 py-1 rounded text-heading font-mono">2</span>
 <code className="text-body">/path/to/project-root/GEMINI.md</code>
 <span className="text-dim">项目根目录（向上搜索到 .git）</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="bg-elevated/20 px-2 py-1 rounded text-heading font-mono">3</span>
 <code className="text-body">./GEMINI.md</code>
 <span className="text-dim">当前工作目录</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="bg-elevated/20 px-2 py-1 rounded text-heading font-mono">4</span>
 <code className="text-body">./subdir/GEMINI.md</code>
 <span className="text-dim">BFS 向下搜索（最多 maxDirs=200）</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* 使用示例 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">使用示例</h3>

 <div className="space-y-6">
 <div>
 <h4 className="text-heading font-semibold mb-3">GEMINI.md 文件结构示例</h4>
 <CodeBlock
 language="markdown"
 title="典型的 GEMINI.md 文件"
 code={`# Project Context

这是一个 React + TypeScript 项目...

## 技术栈
- React 18
- TypeScript 5
- Tailwind CSS

## 架构决策
- 使用 Context 管理全局状态
- 组件按功能模块组织

## 编码规范
- 使用函数式组件
- 优先使用 hooks

## Gemini Added Memories
- 用户偏好使用 pnpm 而不是 npm
- 测试框架是 Vitest
- 部署平台是 Vercel`}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h5 className="text-heading font-bold mb-2">适合使用 save_memory</h5>
 <ul className="text-sm text-body space-y-1">
 <li>"记住我喜欢用 TypeScript"</li>
 <li>"我的猫叫 Whiskers"</li>
 <li>"这个项目使用 pnpm"</li>
 <li>"部署时需要设置环境变量 API_KEY"</li>
 </ul>
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg p-4">
 <h5 className="text-heading font-bold mb-2">不适合使用 save_memory</h5>
 <ul className="text-sm text-body space-y-1">
 <li>只对当前会话有用的信息</li>
 <li>长篇复杂的文本（应手动写入 GEMINI.md）</li>
 <li>不确定是否值得长期记住的信息</li>
 <li>频繁变化的临时数据</li>
 </ul>
 </div>
 </div>
 </div>
 </section>

 {/* 两者的交互关系 */}
 <section>
 <h3 className="text-xl font-semibold text-heading mb-4">两套系统的交互关系</h3>

 <div className="bg-base/30 rounded-lg p-6">
 <h4 className="text-heading font-bold mb-4 text-center">数据流向</h4>
 <div className="flex flex-col gap-4">
 {/* save_memory 写入 */}
 <div className="flex items-center gap-3">
 <div className="bg-elevated border border-edge rounded-lg px-3 py-2 text-sm text-center">
 <div className="text-heading font-bold">AI 调用</div>
 <div className="text-xs text-body">save_memory</div>
 </div>
 <div className="text-heading">→</div>
 <div className="bg-elevated border border-edge-hover rounded-lg px-3 py-2 text-sm text-center flex-1">
 <code className="text-heading">GEMINI.md</code>
 <div className="text-xs text-body">## Gemini Added Memories 区段</div>
 </div>
 </div>

 {/* /memory 读取 */}
 <div className="flex items-center gap-3">
 <div className="bg-elevated/20 border border-edge rounded-lg px-3 py-2 text-sm text-center">
 <div className="text-heading font-bold">用户调用</div>
 <div className="text-xs text-body">/memory refresh</div>
 </div>
 <div className="text-heading">→</div>
 <div className="bg-elevated border border-edge-hover rounded-lg px-3 py-2 text-sm text-center flex-1">
 <code className="text-heading">GEMINI.md</code>
 <div className="text-xs text-body">整个文件（包括 Added Memories）</div>
 </div>
 <div className="text-heading">→</div>
 <div className="bg-elevated border-l-2 border-l-edge-hover rounded-lg px-3 py-2 text-sm text-center">
 <div className="text-heading font-bold">System Prompt</div>
 <div className="text-xs text-body">注入到上下文</div>
 </div>
 </div>
 </div>
 </div>

 <HighlightBox title="关键理解" variant="green">
 <p className="text-sm">
 <code className="text-heading">save_memory</code> 写入的内容最终会通过{' '}
 <code className="text-heading">/memory</code> 系统被读取并注入到 System Prompt。两者是
 <strong>写入 vs 读取</strong>的关系，而不是独立的两套记忆系统。
 </p>
 </HighlightBox>
 </section>
 </div>
 );
}
