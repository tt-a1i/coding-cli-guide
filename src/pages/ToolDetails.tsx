import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { JsonBlock } from '../components/JsonBlock';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';
import { getThemeColor } from '../utils/theme';



interface ToolCardProps {
 icon: string;
 name: string;
 tools: string[];
 status: string;
 statusColor: string;
}

function ToolCard({ icon, name, tools, status, statusColor }: ToolCardProps) {
 return (
 <div className="bg-elevated/5 rounded-lg p-5 border border-edge/10 transition-all hover:border-edge">
 <div className="flex items-center gap-2 mb-4">
 <span className="text-3xl">{icon}</span>
 <span className="text-xl text-heading">{name}</span>
 </div>
 <ul className="pl-5 list-disc mb-3">
 {tools.map((tool) => (
 <li key={tool}>
 <strong>{tool.split(' - ')[0]}</strong>
 {tool.includes(' - ') && ` - ${tool.split(' - ')[1]}`}
 </li>
 ))}
 </ul>
 <p className={statusColor}>{status}</p>
 </div>
 );
}

const stepContents = [
 {
 title: 'AI 返回 functionCall',
 code: `{
 "role": "model",
 "parts": [
 {
 "functionCall": {
 "id": "call_abc123",
 "name": "read_file",
 "args": { "file_path": "package.json", "offset": 0, "limit": 50 }
 }
 }
 ]
}`,
 description: 'AI 决定要读取文件，通过 functionCall 请求工具调用。',
 isJson: true,
 },
 {
 title: '解析参数',
 code: `// coreToolScheduler.ts
const functionCall = content.parts.find((p) => p.functionCall)?.functionCall;
const toolName = functionCall?.name;
const callId = functionCall?.id ?? \`\${promptId}-0\`;
const params = functionCall?.args ?? {};

// params = { file_path: "package.json", offset: 0, limit: 50 }`,
 description: 'Gemini 的 functionCall.args 已经是对象结构，一般无需 JSON.parse。',
 isJson: false,
 },
 {
 title: '获取工具实例',
 code: `// 从注册表获取工具
const tool = this.toolRegistry.getTool("read_file");

// tool 是 ReadFileTool 的实例`,
 description: 'ToolRegistry 是一个 Map，存储了所有已注册的工具。',
 isJson: false,
 },
 {
 title: '验证参数',
 code: `// read-file.ts - validateToolParamValues
validateToolParamValues(params) {
 // 1. 路径不能为空
 if (params.file_path.trim() === '') {
 return "file_path 不能为空";
 }

 // 2. 解析到目标目录并做安全检查（必须在工作区/允许范围内）
 const resolvedPath = path.resolve(targetDir, params.file_path);
 if (!workspaceContext.isPathWithinWorkspace(resolvedPath)) {
 return "路径必须在工作区内";
 }

 return null; // 验证通过
}`,
 description: '验证失败会返回错误，不会执行工具。',
 isJson: false,
 },
 {
 title: '执行工具',
 code: `// 1. 创建调用实例
const invocation = tool.build(params); // BaseDeclarativeTool: schema 校验 + createInvocation()

// 2. （调度器）确认是否需要执行前审批
const confirmation = await invocation.shouldConfirmExecute(signal);
if (confirmation) await waitForUserDecision(confirmation);

// 3. 执行
const result = await invocation.execute(signal, updateOutput);

// ReadFileToolInvocation.execute() 内部：
async execute() {
 // 使用 Node.js fs 模块读取文件
 const content = await processSingleFileContent(
 this.resolvedPath,
 targetDir,
 fileSystemService,
 offset,
 limit
 );

 return {
 llmContent: content, // 发给 AI
 returnDisplay: '...' // 显示在终端
 };
}`,
 description: '',
 isJson: false,
 },
 {
 title: '结果返回',
 code: `// 工具返回的结果
{
 llmContent: "{ \\"name\\": \\"@google/gemini-cli\\", ... }",
 // 常见：成功且未截断时，为了减少噪音会留空
 returnDisplay: ""
}

// 若发生截断/分页（offset/limit）才会返回更详细的提示：
// returnDisplay: "Read lines 1-50 of 200 from package.json"

// llmContent 会被包装为 functionResponse，再加入历史发给模型
const responseParts = convertToFunctionResponse(
 toolName,
 callId,
 result.llmContent,
 model
);

this.history.push({
 role: "user",
 parts: responseParts
});

// returnDisplay 显示在终端给用户看`,
 description: '',
 isJson: false,
 },
];

export function ToolDetails() {
 const [activeStep, setActiveStep] = useState(0);
 const step = stepContents[activeStep];

 return (
 <div>
 <h2 className="text-2xl text-heading mb-5">工具执行细节</h2>

 <HighlightBox title="范围提示" variant="orange">
 <p className="text-sm text-body">
 本页以 Gemini CLI 的 <code className="bg-base/30 px-1 rounded">functionCall / functionResponse</code> 机制为准。
 Innies/Qwen CLI 的 OpenAI 兼容模式会出现 <code className="bg-base/30 px-1 rounded">tool_calls</code> 与 <code className="bg-base/30 px-1 rounded">role=tool</code> 等结构，属于额外兼容层。
 </p>
 </HighlightBox>

 {/* 工具生命周期 */}
 <Layer title="工具调用的完整生命周期">
 {/* Step indicator */}
 <div className="flex justify-center gap-2 my-5 flex-wrap">
 {stepContents.map((_, i) => (
 <button
 key={i}
 onClick={() => setActiveStep(i)}
 className={`
 w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer
 transition-all
 ${
 activeStep === i
 ? 'bg-accent text-heading'
 : i < activeStep
 ? 'bg-[var(--color-success)] text-heading'
 : ' bg-elevated/10 text-heading'
 }
 `}
 >
 {i + 1}
 </button>
 ))}
 </div>

 {/* Step content */}
 <div className="animate-fadeIn">
 <h3 className="text-heading mb-4 text-lg">
 步骤 {activeStep + 1}：{step.title}
 </h3>
 {step.isJson ? (
 <JsonBlock code={step.code} />
 ) : (
 <CodeBlock code={step.code} />
 )}
 {step.description && <p className="mt-4">{step.description}</p>}
 {activeStep === 5 && (
 <>
 <p className="mt-4">
 <code className="bg-base/30 px-1 rounded">llmContent</code> 和{' '}
 <code className="bg-base/30 px-1 rounded">returnDisplay</code>{' '}
 是分开的，因为：
 </p>
 <ul className="pl-5 mt-2 list-disc">
 <li>发给 AI 的可能很长（完整文件内容）</li>
 <li>显示给用户的应该简洁（"读取了 50 行"）</li>
 </ul>
 </>
 )}
 </div>
 </Layer>

 {/* 工具分类 */}
 <Layer title="工具分类">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
 <ToolCard

 name="读取类"
 tools={['read_file - 读取文件', 'glob - 文件模式匹配', 'search_file_content - 内容搜索']}
 status="✅ 安全，不修改文件"
 statusColor="text-heading"
 />
 <ToolCard

 name="写入类"
 tools={['write_file - 写入文件', 'replace - 编辑文件']}
 status="⚠️ 需要用户确认"
 statusColor="text-heading"
 />
 <ToolCard

 name="执行类"
 tools={['run_shell_command - 执行命令']}
 status="🔒 危险，可能需要沙箱"
 statusColor="text-heading"
 />
 <ToolCard

 name="网络类"
 tools={['web_fetch - 获取网页', 'google_web_search - 搜索']}
 status="🌍 访问互联网"
 statusColor="text-accent"
 />
 </div>
 </Layer>

 {/* 用户确认机制 */}
 <Layer title="用户确认机制">
 <p className="mb-4">某些危险操作需要用户确认才能执行：</p>

 <CodeBlock code={`// 工具执行前检查是否需要确认
if (tool.requiresConfirmation) {
 // 暂停执行，显示确认对话框
 const confirmed = await this.showConfirmDialog({
 tool: tool.name,
 params: params,
 description: "将执行: rm -rf node_modules"
 });

 if (!confirmed) {
 return { error: "用户拒绝执行" };
 }
}

// 用户确认后才执行
const result = await tool.execute(params);`} />

 <HighlightBox title="安全设计" variant="green">
 <ul className="pl-5 list-disc">
 <li>读取操作通常自动执行</li>
 <li>写入/删除操作需要确认</li>
 <li>某些命令会进入"沙箱"执行</li>
 <li>可以配置自动确认规则</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* 参数验证的深层原因 */}
 <Layer title="为什么需要参数验证？">
 <p className="mb-4">
 参数验证不是"可选的好习惯"，而是<strong>安全的必要防线</strong>。AI 生成的参数可能是错误的、恶意的、或超出预期的。
 </p>

 <MermaidDiagram chart={`
flowchart LR
 AI["AI 生成参数"] --> V{"参数验证"}
 V -->|通过| E["执行工具"]
 V -->|失败| R["返回错误给 AI"]

 subgraph "验证层防护"
 V1["类型检查"]
 V2["边界检查"]
 V3["安全检查"]
 V4["权限检查"]
 end

 V --> V1
 V --> V2
 V --> V3
 V --> V4

 style V fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},stroke:${getThemeColor("--color-warning", "#b45309")}
 style E fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},stroke:${getThemeColor("--color-success", "#15803d")}
 style R fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},stroke:${getThemeColor("--color-danger", "#b91c1c")}
`} />

 <div className="mt-6 space-y-4">
 <h4 className="text-lg font-semibold text-heading">验证的四个层次</h4>

 <div className="overflow-x-auto">
 <table className="w-full text-sm border border-edge rounded-lg overflow-hidden">
 <thead className="bg-surface">
 <tr>
 <th className="px-4 py-2 text-left text-body">验证层</th>
 <th className="px-4 py-2 text-left text-body">检查内容</th>
 <th className="px-4 py-2 text-left text-body">防护目标</th>
 <th className="px-4 py-2 text-left text-body">示例</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-edge">
 <tr className="bg-surface">
 <td className="px-4 py-2 text-heading font-semibold">类型检查</td>
 <td className="px-4 py-2 text-body">参数类型是否正确</td>
 <td className="px-4 py-2 text-body">防止类型错误导致崩溃</td>
 <td className="px-4 py-2 text-dim">path 必须是 string，不能是 number</td>
 </tr>
 <tr className="bg-base/30">
 <td className="px-4 py-2 text-heading font-semibold">边界检查</td>
 <td className="px-4 py-2 text-body">参数值是否在合理范围</td>
 <td className="px-4 py-2 text-body">防止资源耗尽</td>
 <td className="px-4 py-2 text-dim">limit 最大 10000 行</td>
 </tr>
 <tr className="bg-surface">
 <td className="px-4 py-2 text-heading font-semibold">安全检查</td>
 <td className="px-4 py-2 text-body">参数是否包含危险内容</td>
 <td className="px-4 py-2 text-body">防止注入攻击</td>
 <td className="px-4 py-2 text-dim">命令不能包含 ; rm -rf /</td>
 </tr>
 <tr className="bg-base/30">
 <td className="px-4 py-2 text-heading font-semibold">权限检查</td>
 <td className="px-4 py-2 text-body">操作是否在允许范围内</td>
 <td className="px-4 py-2 text-body">防止越权访问</td>
 <td className="px-4 py-2 text-dim">路径必须在工作区内</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <HighlightBox title="AI 可能生成的问题参数" variant="red">
 <p className="mb-3">以下是 AI 可能生成的有问题参数，验证层必须拦截：</p>
 <div className="grid md:grid-cols-2 gap-4">
 <div className="bg-surface rounded p-3">
 <p className="text-heading font-semibold text-sm mb-1">路径遍历攻击</p>
 <code className="text-xs text-body block">{"{ \"file_path\": \"../../etc/passwd\" }"}</code>
 <p className="text-xs text-dim mt-1">试图读取系统敏感文件</p>
 </div>
 <div className="bg-surface rounded p-3">
 <p className="text-heading font-semibold text-sm mb-1">命令注入</p>
 <code className="text-xs text-body block">{"{ \"command\": \"ls; rm -rf /\" }"}</code>
 <p className="text-xs text-dim mt-1">在命令中注入危险操作</p>
 </div>
 <div className="bg-surface rounded p-3">
 <p className="text-heading font-semibold text-sm mb-1">资源耗尽</p>
 <code className="text-xs text-body block">{"{ \"limit\": 999999999 }"}</code>
 <p className="text-xs text-dim mt-1">请求过大导致内存溢出</p>
 </div>
 <div className="bg-surface rounded p-3">
 <p className="text-heading font-semibold text-sm mb-1">无效 JSON</p>
 <code className="text-xs text-body block">{"{ file_path: /home/user }"}</code>
 <p className="text-xs text-dim mt-1">格式错误导致解析失败</p>
 </div>
 </div>
 </HighlightBox>
 </Layer>

 {/* 各工具的边界情况 */}
 <Layer title="各工具的边界情况">
 <p className="mb-4">
 每个工具都有其特有的边界情况，了解这些可以帮助你理解为什么工具会失败：
 </p>

 <div className="space-y-6">
 {/* read_file 边界情况 */}
 <div className="bg-surface rounded-lg p-5 border border-edge">
 <div className="flex items-center gap-3 mb-3">
  <h4 className="text-lg font-semibold text-heading">read_file 边界情况</h4>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-surface">
 <tr>
 <th className="px-3 py-2 text-left text-body">情况</th>
 <th className="px-3 py-2 text-left text-body">行为</th>
 <th className="px-3 py-2 text-left text-body">返回给 AI</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-edge/60">
 <tr>
 <td className="px-3 py-2 text-body">文件不存在</td>
 <td className="px-3 py-2 text-body">返回错误</td>
 <td className="px-3 py-2 text-dim">"ENOENT: 文件不存在"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">二进制文件</td>
 <td className="px-3 py-2 text-body">检测并拒绝</td>
 <td className="px-3 py-2 text-dim">"文件是二进制格式，无法读取"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">超大文件 ({'>'}10MB)</td>
 <td className="px-3 py-2 text-body">截断读取</td>
 <td className="px-3 py-2 text-dim">"文件太大，只返回前 N 行"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">无读取权限</td>
 <td className="px-3 py-2 text-body">返回错误</td>
 <td className="px-3 py-2 text-dim">"EACCES: 权限不足"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">是目录不是文件</td>
 <td className="px-3 py-2 text-body">返回错误</td>
 <td className="px-3 py-2 text-dim">"EISDIR: 路径是目录"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">符号链接指向外部</td>
 <td className="px-3 py-2 text-body">拒绝访问</td>
 <td className="px-3 py-2 text-dim">"链接指向工作区外"</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 {/* write_file 边界情况 */}
 <div className="pl-5 border-l-2 border-l-edge-hover border-l-edge-hover/30">
 <div className="flex items-center gap-3 mb-3">
 <span className="text-2xl">✏️</span>
 <h4 className="text-lg font-semibold text-heading">write_file 边界情况</h4>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-surface">
 <tr>
 <th className="px-3 py-2 text-left text-body">情况</th>
 <th className="px-3 py-2 text-left text-body">行为</th>
 <th className="px-3 py-2 text-left text-body">返回给 AI</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-edge/60">
 <tr>
 <td className="px-3 py-2 text-body">父目录不存在</td>
 <td className="px-3 py-2 text-body">自动创建目录</td>
 <td className="px-3 py-2 text-dim">"创建目录 + 写入成功"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">文件已存在</td>
 <td className="px-3 py-2 text-body">覆盖（需确认）</td>
 <td className="px-3 py-2 text-dim">"文件已更新"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">磁盘空间不足</td>
 <td className="px-3 py-2 text-body">返回错误</td>
 <td className="px-3 py-2 text-dim">"ENOSPC: 磁盘空间不足"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">无写入权限</td>
 <td className="px-3 py-2 text-body">返回错误</td>
 <td className="px-3 py-2 text-dim">"EACCES: 权限不足"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">用户拒绝确认</td>
 <td className="px-3 py-2 text-body">不执行</td>
 <td className="px-3 py-2 text-dim">"用户拒绝写入操作"</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 {/* run_shell_command 边界情况 */}
 <div className="pl-5 border-l-2 border-l-edge-hover border-l-edge-hover/30">
 <div className="flex items-center gap-3 mb-3">
  <h4 className="text-lg font-semibold text-heading">run_shell_command 边界情况</h4>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-surface">
 <tr>
 <th className="px-3 py-2 text-left text-body">情况</th>
 <th className="px-3 py-2 text-left text-body">行为</th>
 <th className="px-3 py-2 text-left text-body">返回给 AI</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-edge/60">
 <tr>
 <td className="px-3 py-2 text-body">命令不存在</td>
 <td className="px-3 py-2 text-body">返回错误</td>
 <td className="px-3 py-2 text-dim">"command not found: xyz"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">执行超时 ({'>'}60s)</td>
 <td className="px-3 py-2 text-body">强制终止</td>
 <td className="px-3 py-2 text-dim">"命令执行超时，已终止"</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">需要交互式输入</td>
 <td className="px-3 py-2 text-body">可能卡住</td>
 <td className="px-3 py-2 text-dim">建议使用非交互模式</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">输出过大 ({'>'}1MB)</td>
 <td className="px-3 py-2 text-body">截断输出</td>
 <td className="px-3 py-2 text-dim">"输出已截断..."</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">非零退出码</td>
 <td className="px-3 py-2 text-body">返回 stderr</td>
 <td className="px-3 py-2 text-dim">"Exit code: 1, stderr: ..."</td>
 </tr>
 <tr>
 <td className="px-3 py-2 text-body">危险命令 (rm -rf)</td>
 <td className="px-3 py-2 text-body">需要沙箱/确认</td>
 <td className="px-3 py-2 text-dim">取决于审批模式</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>

 <HighlightBox title="边界处理的设计原则" variant="blue">
 <p className="mb-2">工具边界处理遵循以下原则：</p>
 <ul className="pl-5 list-disc space-y-1">
 <li><strong>Fail Loud</strong>：错误必须返回给 AI，不能静默失败</li>
 <li><strong>Fail Safe</strong>：失败时不应该造成部分状态变更</li>
 <li><strong>Fail Informative</strong>：错误信息要足够详细，帮助 AI 理解问题</li>
 <li><strong>Fail Recoverable</strong>：尽可能提供恢复建议</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* 工具安全边界 */}
 <Layer title="工具安全边界">
 <p className="mb-4">
 理解工具的安全边界对于正确配置和使用 CLI 至关重要：
 </p>

 <MermaidDiagram chart={`
graph TB
 subgraph "安全区域划分"
 Safe["🟢 安全区<br/>只读操作"]
 Moderate["🟡 中等风险<br/>文件修改"]
 High["🔴 高风险<br/>命令执行"]
 end

 subgraph "安全措施"
 S1["自动执行"]
 S2["用户确认"]
 S3["沙箱隔离"]
 end

 Safe --> S1
 Moderate --> S2
 High --> S3

 subgraph "工具分类"
 T1["read_file, glob, search_file_content"]
 T2["write_file, replace"]
 T3["run_shell_command, web_fetch"]
 end

 T1 --> Safe
 T2 --> Moderate
 T3 --> High

 style Safe fill:${getThemeColor("--mermaid-success-fill", "#dcfce7")},stroke:${getThemeColor("--color-success", "#15803d")}
 style Moderate fill:${getThemeColor("--mermaid-warning-fill", "#fef3c7")},stroke:${getThemeColor("--color-warning", "#b45309")}
 style High fill:${getThemeColor("--mermaid-danger-fill", "#fee2e2")},stroke:${getThemeColor("--color-danger", "#b91c1c")}
`} />

 <div className="mt-6 space-y-4">
 <h4 className="text-lg font-semibold text-heading">审批模式与工具权限</h4>

 <div className="overflow-x-auto">
 <table className="w-full text-sm border border-edge rounded-lg overflow-hidden">
 <thead className="bg-surface">
 <tr>
 <th className="px-4 py-2 text-left text-body">审批模式</th>
 <th className="px-4 py-2 text-left text-body">read_file</th>
 <th className="px-4 py-2 text-left text-body">write_file/replace</th>
 <th className="px-4 py-2 text-left text-body">run_shell_command</th>
 <th className="px-4 py-2 text-left text-body">适用场景</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-edge">
 <tr className="bg-surface">
 <td className="px-4 py-2 text-heading font-semibold">default</td>
 <td className="px-4 py-2 text-body">自动</td>
 <td className="px-4 py-2 text-body">需确认</td>
 <td className="px-4 py-2 text-body">需确认</td>
 <td className="px-4 py-2 text-dim">新手/敏感环境</td>
 </tr>
 <tr className="bg-base/30">
 <td className="px-4 py-2 text-heading font-semibold">autoEdit</td>
 <td className="px-4 py-2 text-body">自动</td>
 <td className="px-4 py-2 text-body">自动</td>
 <td className="px-4 py-2 text-body">需确认</td>
 <td className="px-4 py-2 text-dim">日常开发</td>
 </tr>
 <tr className="bg-base/30">
 <td className="px-4 py-2 text-heading font-semibold">yolo</td>
 <td className="px-4 py-2 text-body">自动</td>
 <td className="px-4 py-2 text-body">自动</td>
 <td className="px-4 py-2 text-body">自动（仍建议沙箱）</td>
 <td className="px-4 py-2 text-dim">仅限测试环境</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <HighlightBox title="沙箱执行" variant="purple">
 <p className="mb-2">
 对于 Shell 工具，沙箱提供额外的隔离层：
 </p>
 <ul className="pl-5 list-disc space-y-1">
 <li><strong>macOS Seatbelt</strong>：限制文件系统和网络访问</li>
 <li><strong>Docker/Podman</strong>：在容器中执行命令</li>
 <li><strong>自定义配置</strong>：项目可以定义 .gemini/sandbox.Dockerfile</li>
 </ul>
 <CodeBlock code={`# 启用沙箱
export GEMINI_SANDBOX=true # 或 docker, podman

# 项目自定义沙箱
.gemini/sandbox.Dockerfile
.gemini/sandbox.bashrc`} />
 </HighlightBox>
 </Layer>

 {/* 工具结果格式化 */}
 <Layer title="工具结果的双重格式化">
 <p className="mb-4">
 每个工具都返回两种格式的结果，服务于不同的目的：
 </p>

 <div className="grid md:grid-cols-2 gap-6">
 <div className="bg-elevated/10 border border-edge rounded-lg p-5">
 <h4 className="text-heading font-semibold mb-3">llmContent - 发给 AI</h4>
 <ul className="pl-5 list-disc text-sm text-body space-y-1">
 <li>完整、详细、结构化</li>
 <li>可能很长（完整文件内容）</li>
 <li>机器可读格式优先</li>
 <li>包含所有必要信息让 AI 理解</li>
 </ul>
 <CodeBlock code={`// llmContent 示例
{
 "status": "success",
 "file": "/src/index.ts",
 "content": "import {...}\\n...",
 "lines": 150,
 "encoding": "utf-8"
}`} />
 </div>

 <div className="bg-elevated border-l-2 border-l-edge-hover/30 rounded-lg p-5">
 <h4 className="text-heading font-semibold mb-3">returnDisplay - 显示给用户</h4>
 <ul className="pl-5 list-disc text-sm text-body space-y-1">
 <li>简洁、人类可读</li>
 <li>一两行概述</li>
 <li>友好的格式化</li>
 <li>省略不必要的细节</li>
 </ul>
 <CodeBlock code={`// returnDisplay 示例
"📖 Read lines 1-150 of 300 from src/index.ts"

// 或者
"✏️ Updated 3 files (45 insertions, 12 deletions)"`} />
 </div>
 </div>

 <HighlightBox title="为什么要分开？" variant="yellow">
 <p className="mb-2">
 分离 llmContent 和 returnDisplay 有几个重要原因：
 </p>
 <ul className="pl-5 list-disc space-y-1 text-sm">
 <li><strong>Token 可见性</strong>：用户不需要在终端看到 10000 行文件内容</li>
 <li><strong>安全性</strong>：可以对 returnDisplay 脱敏，但保持 llmContent 完整</li>
 <li><strong>用户体验</strong>：终端显示应该简洁，AI 理解需要详细</li>
 <li><strong>调试便利</strong>：可以分别调整两种输出的格式</li>
 </ul>
 </HighlightBox>
 </Layer>

 {/* 相关页面 */}
 <RelatedPages
 pages={[
 { id: 'ai-tool', label: 'AI 工具交互机制', description: 'Function Calling 的完整生命周期' },
 { id: 'error', label: '错误处理机制', description: '工具错误如何传递给 AI' },
 { id: 'shell-execution-service-deep', label: 'Shell 执行深度解析', description: 'Shell 工具的内部实现' },
 { id: 'permission-approval-anim', label: '权限与审批', description: '审批模式的详细说明' },
 ]}
 />
 </div>
 );
}
