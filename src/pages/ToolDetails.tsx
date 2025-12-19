import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { JsonBlock } from '../components/JsonBlock';
import { CodeBlock } from '../components/CodeBlock';

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
    llmContent: "{ \\"name\\": \\"@innies/innies-cli\\", ... }",
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
    </div>
  );
}
