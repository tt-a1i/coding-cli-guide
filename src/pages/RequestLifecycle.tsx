import { useState } from 'react';
import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { CodeBlock } from '../components/CodeBlock';
import { JsonBlock } from '../components/JsonBlock';

interface LifecycleStepProps {
  step: number;
  title: string;
  description: string;
  icon: string;
  details: string;
  active: boolean;
  onClick: () => void;
}

function LifecycleStep({ step, title, description, icon, details, active, onClick }: LifecycleStepProps) {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer transition-all p-4 rounded-lg border-2
        ${active
          ? 'bg-cyan-400/20 border-cyan-400'
          : 'bg-white/5 border-white/10 hover:border-cyan-400/50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${active ? 'bg-cyan-400 text-gray-900' : 'bg-white/10 text-white'}
        `}>
          {step}
        </div>
        <div className="text-2xl">{icon}</div>
        <div>
          <h4 className={`font-bold ${active ? 'text-cyan-400' : 'text-white'}`}>
            {title}
          </h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      {active && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg text-sm">
          <pre className="whitespace-pre-wrap text-gray-300">{details}</pre>
        </div>
      )}
    </div>
  );
}

const lifecycleSteps = [
  {
    title: '用户输入',
    description: '用户在终端输入请求',
    icon: '👤',
    details: `用户: "列出 src 目录中的所有 TypeScript 文件"

触发流程：
1. InputPrompt 组件捕获输入
2. 调用 onSubmit(text) 回调
3. 检查是否为斜杠命令 (/help, /clear 等)
4. 如果不是命令，进入消息发送流程`
  },
  {
    title: '消息预处理',
    description: '处理 @ 命令和注入',
    icon: '⚙️',
    details: `预处理步骤：
1. 解析 @file 引用，读取文件内容
2. 解析 @memory 引用，获取记忆
3. 解析 @url 引用，获取网页内容
4. 应用系统提示词
5. 创建 Content 对象

示例：
@package.json 你好
→ 转换为包含文件内容的完整消息`
  },
  {
    title: '添加到历史',
    description: 'userMessage → history.push()',
    icon: '📝',
    details: `// 创建用户消息
const userContent: Content = {
    role: 'user',
    parts: [
        { text: "列出 src 目录中的所有 TypeScript 文件" }
    ]
};

// 添加到历史
this.history.push(userContent);

// 同时记录到聊天日志
chatRecordingService.recordMessage(userContent);`
  },
  {
    title: 'API 请求',
    description: 'generateContentStream()',
    icon: '📡',
    details: `// 构建请求
const request = {
    model: "qwen-coder-plus",
    contents: this.history,  // 完整历史
    tools: toolRegistry.getAllToolDefinitions(),
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
    }
};

// 调用 ContentGenerator
const stream = contentGenerator.generateContentStream(request);`
  },
  {
    title: '流式响应',
    description: '实时处理 AI 返回',
    icon: '🌊',
    details: `for await (const chunk of stream) {
    // 文本内容 → 实时显示
    if (chunk.text) {
        yield { type: 'text', content: chunk.text };
        // UI 立即更新
    }

    // 工具调用 → 进入工具执行
    if (chunk.functionCall) {
        yield { type: 'tool_call', call: chunk.functionCall };
        // 触发工具调度器
    }
}

// 检查 finish_reason
// "stop" → 结束
// "tool_calls" → 继续循环`
  },
  {
    title: '工具调度',
    description: 'CoreToolScheduler 管理',
    icon: '🔧',
    details: `// AI 返回的工具调用
{
    "name": "glob",
    "args": { "pattern": "src/**/*.ts" }
}

工具调度流程：
1. validating: 验证参数
2. scheduled: 加入执行队列
3. awaiting_approval: 等待用户确认（如需要）
4. executing: 执行中
5. success/error: 完成`
  },
  {
    title: '工具执行',
    description: 'tool.invoke(params)',
    icon: '⚡',
    details: `// GlobTool 执行
const tool = toolRegistry.getTool("glob");
const invocation = tool.build({ pattern: "src/**/*.ts" });

// 执行
const result = await invocation.execute();

// 返回结果
{
    llmContent: "src/index.ts\\nsrc/app.ts\\n...",
    returnDisplay: "Found 15 files matching pattern"
}`
  },
  {
    title: '结果入历史',
    description: 'functionResponse → history',
    icon: '📥',
    details: `// 工具结果作为 user 角色消息
const toolResult: Content = {
    role: 'user',
    parts: [{
        functionResponse: {
            name: 'glob',
            response: {
                content: "src/index.ts\\nsrc/app.ts\\n..."
            }
        }
    }]
};

// 添加到历史
this.history.push(toolResult);

// 继续下一轮循环...`
  },
  {
    title: '第二轮 API',
    description: '包含工具结果的请求',
    icon: '🔄',
    details: `// 第二轮请求包含完整历史
contents: [
    { role: "user", parts: [{ text: "列出..." }] },
    { role: "model", parts: [{ functionCall: {...} }] },
    { role: "user", parts: [{ functionResponse: {...} }] }  // 新增
]

// AI 看到工具结果后生成最终回复
// 这次 finish_reason 应该是 "stop"`
  },
  {
    title: '最终响应',
    description: 'finish_reason: "stop"',
    icon: '✅',
    details: `AI 最终回复：
"src 目录中共有 15 个 TypeScript 文件：

1. src/index.ts
2. src/app.ts
3. src/config.ts
...

主要分布在 src/ui、src/core 和 src/tools 子目录中。"

finish_reason: "stop" → 循环结束`
  },
  {
    title: '持久化',
    description: '记录和统计',
    icon: '💾',
    details: `完成后的处理：
1. 添加模型响应到历史
2. 记录到聊天日志文件
3. 更新 token 统计
4. 更新 UI 状态
5. 准备接收下一个用户输入

统计信息：
- 输入 tokens: 1,234
- 输出 tokens: 567
- 工具调用: 1 次
- 总耗时: 2.3s`
  }
];

export function RequestLifecycle() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">请求完整生命周期</h2>

      {/* 概述 */}
      <Layer title="生命周期概述" icon="🔄">
        <HighlightBox title="一个请求的完整旅程" icon="🗺️" variant="blue">
          <p>
            从用户输入到最终响应，一个请求会经历多个阶段。
            如果涉及工具调用，会形成多轮循环。点击下方步骤查看详情。
          </p>
        </HighlightBox>
      </Layer>

      {/* 交互式步骤 */}
      <Layer title="详细步骤" icon="📋">
        <div className="space-y-3">
          {lifecycleSteps.map((step, index) => (
            <LifecycleStep
              key={index}
              step={index + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
              details={step.details}
              active={activeStep === index}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>
      </Layer>

      {/* 时序图 */}
      <Layer title="时序图" icon="📊">
        <div className="bg-black/30 rounded-xl p-6 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300">
{`用户        CLI         AI API       工具
 │           │            │            │
 │──输入────▶│            │            │
 │           │──请求─────▶│            │
 │           │◀──流式────│            │
 │           │   tool_call            │
 │           │───────────────────────▶│
 │           │◀──────────────result───│
 │           │──请求+结果─▶│            │
 │           │◀──最终响应─│            │
 │◀──显示───│            │            │
 │           │            │            │`}
          </pre>
        </div>
      </Layer>

      {/* 多工具调用 */}
      <Layer title="多工具调用场景" icon="🔗">
        <CodeBlock
          title="示例：复杂任务需要多个工具"
          code={`用户: "读取 package.json 并更新版本号为 2.0.0"

第 1 轮:
├─ AI: tool_call { name: "read_file", args: { path: "package.json" } }
├─ CLI: 执行 ReadFileTool
└─ 结果: { content: "{\\"version\\": \\"1.0.0\\"...}" }

第 2 轮:
├─ AI: tool_call { name: "edit", args: {
│      path: "package.json",
│      old_str: "\\"version\\": \\"1.0.0\\"",
│      new_str: "\\"version\\": \\"2.0.0\\""
│  }}
├─ CLI: 执行 EditTool
└─ 结果: { success: true, diff: "..." }

第 3 轮:
├─ AI: "已将 package.json 的版本号从 1.0.0 更新为 2.0.0"
└─ finish_reason: "stop"`}
        />
      </Layer>

      {/* 并行工具调用 */}
      <Layer title="并行工具调用" icon="⚡">
        <HighlightBox title="AI 可以并行请求多个工具" icon="🚀" variant="green">
          <p>
            在一次响应中，AI 可以同时请求多个独立的工具调用，CLI 会并行执行它们以提高效率。
          </p>
        </HighlightBox>

        <JsonBlock
          code={`// AI 返回多个 tool_calls
{
    "tool_calls": [
        {
            "id": "call_1",
            "name": "read_file",
            "args": { "path": "src/a.ts" }
        },
        {
            "id": "call_2",
            "name": "read_file",
            "args": { "path": "src/b.ts" }
        },
        {
            "id": "call_3",
            "name": "read_file",
            "args": { "path": "src/c.ts" }
        }
    ]
}

// CLI 并行执行
await Promise.all([
    executeToolCall(call_1),
    executeToolCall(call_2),
    executeToolCall(call_3)
]);`}
        />
      </Layer>

      {/* 错误处理 */}
      <Layer title="错误处理流程" icon="⚠️">
        <div className="space-y-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-bold mb-2">工具执行失败</h4>
            <p className="text-sm text-gray-300 mb-2">
              工具返回错误时，错误信息会作为 functionResponse 发送给 AI
            </p>
            <code className="text-xs text-gray-400">
              AI 可能会尝试其他方法或报告错误
            </code>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-bold mb-2">API 调用失败</h4>
            <p className="text-sm text-gray-300 mb-2">
              网络错误或 API 错误会触发重试机制
            </p>
            <code className="text-xs text-gray-400">
              最多重试 3 次，使用指数退避
            </code>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-bold mb-2">用户取消</h4>
            <p className="text-sm text-gray-300 mb-2">
              Ctrl+C 触发 AbortController，优雅终止当前操作
            </p>
            <code className="text-xs text-gray-400">
              保留历史记录，可以继续对话
            </code>
          </div>
        </div>
      </Layer>
    </div>
  );
}
