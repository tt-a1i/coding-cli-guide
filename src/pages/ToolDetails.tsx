import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { JsonBlock } from '../components/JsonBlock';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

interface ToolCardProps {
  icon: string;
  name: string;
  tools: string[];
  status: string;
  statusColor: string;
}

function ToolCard({ icon, name, tools, status, statusColor }: ToolCardProps) {
  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10 transition-all hover:border-cyan-400 hover:-translate-y-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-xl text-cyan-400">{name}</span>
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
    title: 'AI 返回 tool_calls',
    code: `{
    "tool_calls": [
        {
            "id": "call_abc123",
            "function": {
                "name": "read_file",
                "arguments": "{\\"absolute_path\\": \\"/path/to/file.txt\\"}"
            }
        }
    ]
}`,
    description: 'AI 决定要读取文件，返回工具调用请求。',
    isJson: true,
  },
  {
    title: '解析参数',
    code: `// coreToolScheduler.ts
const { name, arguments: argsJson } = toolCall.function;
const params = JSON.parse(argsJson);

// params = { absolute_path: "/path/to/file.txt" }`,
    description: 'CLI 解析 JSON 字符串，提取参数。',
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
    if (params.absolute_path.trim() === '') {
        return "路径不能为空";
    }

    // 2. 必须是绝对路径
    if (!path.isAbsolute(params.absolute_path)) {
        return "必须是绝对路径";
    }

    // 3. 必须在工作区内（安全检查）
    if (!workspaceContext.isPathWithinWorkspace(params.absolute_path)) {
        return "路径必须在工作区内";
    }

    return null;  // 验证通过
}`,
    description: '验证失败会返回错误，不会执行工具。',
    isJson: false,
  },
  {
    title: '执行工具',
    code: `// 1. 创建调用实例
const invocation = tool.createInvocation(params);

// 2. 执行
const result = await invocation.execute();

// ReadFileToolInvocation.execute() 内部：
async execute() {
    // 使用 Node.js fs 模块读取文件
    const content = await processSingleFileContent(
        this.params.absolute_path,
        targetDir,
        fileSystemService,
        offset,
        limit
    );

    return {
        llmContent: content,      // 发给 AI
        returnDisplay: '...'      // 显示在终端
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
    returnDisplay: "Read 50 lines from package.json"
}

// llmContent 被加入消息历史，发给 AI
this.conversationHistory.push({
    role: "tool",
    tool_call_id: "call_abc123",
    content: result.llmContent
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
      <h2 className="text-2xl text-cyan-400 mb-5">工具执行细节</h2>

      {/* 工具生命周期 */}
      <Layer title="工具调用的完整生命周期" icon="🔄">
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
                    ? 'bg-cyan-400 text-gray-900'
                    : i < activeStep
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-white'
                }
              `}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="animate-fadeIn">
          <h3 className="text-orange-500 mb-4 text-lg">
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
                <code className="bg-black/30 px-1 rounded">llmContent</code> 和{' '}
                <code className="bg-black/30 px-1 rounded">returnDisplay</code>{' '}
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
      <Layer title="工具分类" icon="📚">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <ToolCard
            icon="📖"
            name="读取类"
            tools={['ReadFile - 读取文件', 'Glob - 文件模式匹配', 'Grep - 内容搜索']}
            status="✅ 安全，不修改文件"
            statusColor="text-green-500"
          />
          <ToolCard
            icon="✏️"
            name="写入类"
            tools={['WriteFile - 写入文件', 'Edit - 编辑文件']}
            status="⚠️ 需要用户确认"
            statusColor="text-orange-500"
          />
          <ToolCard
            icon="💻"
            name="执行类"
            tools={['Shell - 执行命令']}
            status="🔒 危险，可能需要沙箱"
            statusColor="text-red-500"
          />
          <ToolCard
            icon="🌐"
            name="网络类"
            tools={['WebFetch - 获取网页', 'WebSearch - 搜索']}
            status="🌍 访问互联网"
            statusColor="text-blue-500"
          />
        </div>
      </Layer>

      {/* 用户确认机制 */}
      <Layer title="用户确认机制" icon="✋">
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

        <HighlightBox title="安全设计" icon="🛡️" variant="green">
          <ul className="pl-5 list-disc">
            <li>读取操作通常自动执行</li>
            <li>写入/删除操作需要确认</li>
            <li>某些命令会进入"沙箱"执行</li>
            <li>可以配置自动确认规则</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 参数验证的深层原因 */}
      <Layer title="为什么需要参数验证？" icon="🔐">
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

    style V fill:#eab30820,stroke:#eab308
    style E fill:#22c55e20,stroke:#22c55e
    style R fill:#ef444420,stroke:#ef4444
`} />

        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-white">验证的四个层次</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">验证层</th>
                  <th className="px-4 py-2 text-left text-gray-300">检查内容</th>
                  <th className="px-4 py-2 text-left text-gray-300">防护目标</th>
                  <th className="px-4 py-2 text-left text-gray-300">示例</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-blue-400 font-semibold">类型检查</td>
                  <td className="px-4 py-2 text-gray-300">参数类型是否正确</td>
                  <td className="px-4 py-2 text-gray-400">防止类型错误导致崩溃</td>
                  <td className="px-4 py-2 text-gray-500">path 必须是 string，不能是 number</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-green-400 font-semibold">边界检查</td>
                  <td className="px-4 py-2 text-gray-300">参数值是否在合理范围</td>
                  <td className="px-4 py-2 text-gray-400">防止资源耗尽</td>
                  <td className="px-4 py-2 text-gray-500">limit 最大 10000 行</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-yellow-400 font-semibold">安全检查</td>
                  <td className="px-4 py-2 text-gray-300">参数是否包含危险内容</td>
                  <td className="px-4 py-2 text-gray-400">防止注入攻击</td>
                  <td className="px-4 py-2 text-gray-500">命令不能包含 ; rm -rf /</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-purple-400 font-semibold">权限检查</td>
                  <td className="px-4 py-2 text-gray-300">操作是否在允许范围内</td>
                  <td className="px-4 py-2 text-gray-400">防止越权访问</td>
                  <td className="px-4 py-2 text-gray-500">路径必须在工作区内</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <HighlightBox title="AI 可能生成的问题参数" icon="⚠️" variant="red">
          <p className="mb-3">以下是 AI 可能生成的有问题参数，验证层必须拦截：</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded p-3">
              <p className="text-red-400 font-semibold text-sm mb-1">路径遍历攻击</p>
              <code className="text-xs text-gray-400 block">{"{ \"path\": \"../../etc/passwd\" }"}</code>
              <p className="text-xs text-gray-500 mt-1">试图读取系统敏感文件</p>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <p className="text-red-400 font-semibold text-sm mb-1">命令注入</p>
              <code className="text-xs text-gray-400 block">{"{ \"command\": \"ls; rm -rf /\" }"}</code>
              <p className="text-xs text-gray-500 mt-1">在命令中注入危险操作</p>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <p className="text-red-400 font-semibold text-sm mb-1">资源耗尽</p>
              <code className="text-xs text-gray-400 block">{"{ \"limit\": 999999999 }"}</code>
              <p className="text-xs text-gray-500 mt-1">请求过大导致内存溢出</p>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <p className="text-red-400 font-semibold text-sm mb-1">无效 JSON</p>
              <code className="text-xs text-gray-400 block">{"{ path: /home/user }"}</code>
              <p className="text-xs text-gray-500 mt-1">格式错误导致解析失败</p>
            </div>
          </div>
        </HighlightBox>
      </Layer>

      {/* 各工具的边界情况 */}
      <Layer title="各工具的边界情况" icon="🎯">
        <p className="mb-4">
          每个工具都有其特有的边界情况，了解这些可以帮助你理解为什么工具会失败：
        </p>

        <div className="space-y-6">
          {/* ReadFile 边界情况 */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📖</span>
              <h4 className="text-lg font-semibold text-blue-400">ReadFile 边界情况</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-400">情况</th>
                    <th className="px-3 py-2 text-left text-gray-400">行为</th>
                    <th className="px-3 py-2 text-left text-gray-400">返回给 AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <tr>
                    <td className="px-3 py-2 text-gray-300">文件不存在</td>
                    <td className="px-3 py-2 text-gray-400">返回错误</td>
                    <td className="px-3 py-2 text-gray-500">"ENOENT: 文件不存在"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">二进制文件</td>
                    <td className="px-3 py-2 text-gray-400">检测并拒绝</td>
                    <td className="px-3 py-2 text-gray-500">"文件是二进制格式，无法读取"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">超大文件 ({'>'}10MB)</td>
                    <td className="px-3 py-2 text-gray-400">截断读取</td>
                    <td className="px-3 py-2 text-gray-500">"文件太大，只返回前 N 行"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">无读取权限</td>
                    <td className="px-3 py-2 text-gray-400">返回错误</td>
                    <td className="px-3 py-2 text-gray-500">"EACCES: 权限不足"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">是目录不是文件</td>
                    <td className="px-3 py-2 text-gray-400">返回错误</td>
                    <td className="px-3 py-2 text-gray-500">"EISDIR: 路径是目录"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">符号链接指向外部</td>
                    <td className="px-3 py-2 text-gray-400">拒绝访问</td>
                    <td className="px-3 py-2 text-gray-500">"链接指向工作区外"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* WriteFile 边界情况 */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-green-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">✏️</span>
              <h4 className="text-lg font-semibold text-green-400">WriteFile 边界情况</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-400">情况</th>
                    <th className="px-3 py-2 text-left text-gray-400">行为</th>
                    <th className="px-3 py-2 text-left text-gray-400">返回给 AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <tr>
                    <td className="px-3 py-2 text-gray-300">父目录不存在</td>
                    <td className="px-3 py-2 text-gray-400">自动创建目录</td>
                    <td className="px-3 py-2 text-gray-500">"创建目录 + 写入成功"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">文件已存在</td>
                    <td className="px-3 py-2 text-gray-400">覆盖（需确认）</td>
                    <td className="px-3 py-2 text-gray-500">"文件已更新"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">磁盘空间不足</td>
                    <td className="px-3 py-2 text-gray-400">返回错误</td>
                    <td className="px-3 py-2 text-gray-500">"ENOSPC: 磁盘空间不足"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">无写入权限</td>
                    <td className="px-3 py-2 text-gray-400">返回错误</td>
                    <td className="px-3 py-2 text-gray-500">"EACCES: 权限不足"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">用户拒绝确认</td>
                    <td className="px-3 py-2 text-gray-400">不执行</td>
                    <td className="px-3 py-2 text-gray-500">"用户拒绝写入操作"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Shell 边界情况 */}
          <div className="bg-gray-800/50 rounded-lg p-5 border border-red-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">💻</span>
              <h4 className="text-lg font-semibold text-red-400">Shell 边界情况</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-400">情况</th>
                    <th className="px-3 py-2 text-left text-gray-400">行为</th>
                    <th className="px-3 py-2 text-left text-gray-400">返回给 AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <tr>
                    <td className="px-3 py-2 text-gray-300">命令不存在</td>
                    <td className="px-3 py-2 text-gray-400">返回错误</td>
                    <td className="px-3 py-2 text-gray-500">"command not found: xyz"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">执行超时 ({'>'}60s)</td>
                    <td className="px-3 py-2 text-gray-400">强制终止</td>
                    <td className="px-3 py-2 text-gray-500">"命令执行超时，已终止"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">需要交互式输入</td>
                    <td className="px-3 py-2 text-gray-400">可能卡住</td>
                    <td className="px-3 py-2 text-gray-500">建议使用非交互模式</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">输出过大 ({'>'}1MB)</td>
                    <td className="px-3 py-2 text-gray-400">截断输出</td>
                    <td className="px-3 py-2 text-gray-500">"输出已截断..."</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">非零退出码</td>
                    <td className="px-3 py-2 text-gray-400">返回 stderr</td>
                    <td className="px-3 py-2 text-gray-500">"Exit code: 1, stderr: ..."</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-gray-300">危险命令 (rm -rf)</td>
                    <td className="px-3 py-2 text-gray-400">需要沙箱/确认</td>
                    <td className="px-3 py-2 text-gray-500">取决于审批模式</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <HighlightBox title="边界处理的设计原则" icon="💡" variant="blue">
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
      <Layer title="工具安全边界" icon="🔒">
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
        T1["ReadFile, Glob, Grep"]
        T2["WriteFile, Edit"]
        T3["Shell, WebFetch"]
    end

    T1 --> Safe
    T2 --> Moderate
    T3 --> High

    style Safe fill:#22c55e20,stroke:#22c55e
    style Moderate fill:#eab30820,stroke:#eab308
    style High fill:#ef444420,stroke:#ef4444
`} />

        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-white">审批模式与工具权限</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">审批模式</th>
                  <th className="px-4 py-2 text-left text-gray-300">ReadFile</th>
                  <th className="px-4 py-2 text-left text-gray-300">WriteFile</th>
                  <th className="px-4 py-2 text-left text-gray-300">Shell</th>
                  <th className="px-4 py-2 text-left text-gray-300">适用场景</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-amber-400 font-semibold">default</td>
                  <td className="px-4 py-2 text-gray-400">自动</td>
                  <td className="px-4 py-2 text-gray-400">需确认</td>
                  <td className="px-4 py-2 text-gray-400">需确认</td>
                  <td className="px-4 py-2 text-gray-500">新手/敏感环境</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-blue-400 font-semibold">autoEdit</td>
                  <td className="px-4 py-2 text-gray-400">自动</td>
                  <td className="px-4 py-2 text-gray-400">自动</td>
                  <td className="px-4 py-2 text-gray-400">需确认</td>
                  <td className="px-4 py-2 text-gray-500">日常开发</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-red-400 font-semibold">yolo</td>
                  <td className="px-4 py-2 text-gray-400">自动</td>
                  <td className="px-4 py-2 text-gray-400">自动</td>
                  <td className="px-4 py-2 text-gray-400">自动（仍建议沙箱）</td>
                  <td className="px-4 py-2 text-gray-500">仅限测试环境</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <HighlightBox title="沙箱执行" icon="📦" variant="purple">
          <p className="mb-2">
            对于 Shell 工具，沙箱提供额外的隔离层：
          </p>
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>macOS Seatbelt</strong>：限制文件系统和网络访问</li>
            <li><strong>Docker/Podman</strong>：在容器中执行命令</li>
            <li><strong>自定义配置</strong>：项目可以定义 .gemini/sandbox.Dockerfile</li>
          </ul>
          <CodeBlock code={`# 启用沙箱
export GEMINI_SANDBOX=true  # 或 docker, podman

# 项目自定义沙箱
.gemini/sandbox.Dockerfile
.gemini/sandbox.bashrc`} />
        </HighlightBox>
      </Layer>

      {/* 工具结果格式化 */}
      <Layer title="工具结果的双重格式化" icon="📝">
        <p className="mb-4">
          每个工具都返回两种格式的结果，服务于不同的目的：
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
            <h4 className="text-blue-400 font-semibold mb-3">llmContent - 发给 AI</h4>
            <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
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

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
            <h4 className="text-green-400 font-semibold mb-3">returnDisplay - 显示给用户</h4>
            <ul className="pl-5 list-disc text-sm text-gray-400 space-y-1">
              <li>简洁、人类可读</li>
              <li>一两行概述</li>
              <li>友好的格式化</li>
              <li>省略不必要的细节</li>
            </ul>
            <CodeBlock code={`// returnDisplay 示例
"📖 Read 150 lines from src/index.ts"

// 或者
"✏️ Updated 3 files (45 insertions, 12 deletions)"`} />
          </div>
        </div>

        <HighlightBox title="为什么要分开？" icon="🤔" variant="yellow">
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
