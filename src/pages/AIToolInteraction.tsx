import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { JsonBlock } from '../components/JsonBlock';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { RelatedPages } from '../components/RelatedPages';

export function AIToolInteraction() {
  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🔧</span>
          <h1 className="text-3xl font-bold text-white">AI 工具交互机制详解</h1>
        </div>
        <p className="text-gray-300 text-lg">
          Function Calling 的完整生命周期：从工具定义到执行结果，深入理解 AI 与工具系统的协作机制
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-purple-500/30 rounded-full text-sm text-purple-300">Function Calling</span>
          <span className="px-3 py-1 bg-blue-500/30 rounded-full text-sm text-blue-300">Tool Execution</span>
          <span className="px-3 py-1 bg-green-500/30 rounded-full text-sm text-green-300">Multi-turn</span>
        </div>
      </div>

      <HighlightBox title="🧭 术语对齐（上游 Gemini CLI）" icon="⚠️" variant="yellow">
        <p className="m-0 text-sm text-gray-200">
          上游 Gemini CLI 的主线使用 <code>functionCall</code>/<code>functionResponse</code>（结构化参数）并在 <code>Turn.run()</code> 中产出 <code>ToolCallRequest</code> 事件；
          <code>tool_calls</code>/<code>role=tool</code>/<code>finish_reason</code> 属于 OpenAI-compatible 兼容层术语（fork-only）。
        </p>
      </HighlightBox>

      {/* 核心概念总览 */}
      <Layer title="交互流程全景图" icon="🗺️" defaultOpen>
        <p className="mb-4">
          在深入细节之前，先理解整体交互流程。Function Calling 本质上是一个<strong>请求-响应-执行-反馈</strong>的循环：
        </p>

        <MermaidDiagram chart={`
sequenceDiagram
    participant U as 用户
    participant CLI as CLI 客户端
    participant AI as AI 模型
    participant Tool as 工具系统

    U->>CLI: "帮我读取 package.json"
    CLI->>AI: 发送消息 + 工具定义

    Note over AI: 分析意图<br/>选择工具<br/>生成参数

    AI-->>CLI: functionCall: read_file({file_path:"package.json"})

    Note over CLI: 解析工具调用<br/>验证参数

    CLI->>Tool: 执行 read_file
    Tool-->>CLI: 文件内容

    CLI->>AI: functionResponse: read_file_result(...)

    Note over AI: 理解结果<br/>生成回复

    AI-->>CLI: "package.json 包含..."
    CLI->>U: 显示回复
`} />

        <HighlightBox title="关键理解" icon="💡" variant="blue">
          <p className="mb-2">这个流程揭示了几个重要事实：</p>
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>AI 是决策者，不是执行者</strong>：AI 只负责"说"要做什么，不负责"做"</li>
            <li><strong>CLI 是中间人和执行者</strong>：解析 AI 的请求，真正执行操作</li>
            <li><strong>多轮对话是必要的</strong>：一次工具调用至少需要两轮 API 请求</li>
            <li><strong>历史消息必须完整</strong>：AI 没有记忆，每次都需要完整上下文</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* Function Calling 解释 */}
      <Layer title="什么是 Function Calling？" icon="🎯">
        <p className="mb-4">
          <strong>Function Calling</strong> 是 AI
          模型的一个能力，让 AI 可以"请求"调用外部函数/工具。 但{' '}
          <strong>AI 本身不能执行任何代码</strong>
          ，它只是告诉你"我想调用这个函数"。
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <HighlightBox title="AI 能做的" icon="✅" variant="green">
            <ul className="pl-5 list-disc space-y-1">
              <li><strong>理解用户意图</strong>：从自然语言中提取真正的需求</li>
              <li><strong>决定调用哪个工具</strong>：根据工具描述选择最合适的</li>
              <li><strong>生成调用参数</strong>：构造符合 schema 的 JSON 参数</li>
              <li><strong>理解执行结果</strong>：解析工具返回的内容</li>
              <li><strong>生成最终回复</strong>：整合结果给用户有意义的答案</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="AI 不能做的" icon="❌" variant="red">
            <ul className="pl-5 list-disc space-y-1">
              <li><strong>直接读取文件</strong>：必须通过 CLI 执行 read_file 工具</li>
              <li><strong>直接执行命令</strong>：必须通过 CLI 执行 shell 工具</li>
              <li><strong>访问你的电脑</strong>：AI 运行在云端，无法触及本地</li>
              <li><strong>记住对话历史</strong>：每次请求都是独立的，无状态</li>
              <li><strong>验证执行结果</strong>：它只能"相信"CLI 返回的内容</li>
            </ul>
          </HighlightBox>
        </div>

        <HighlightBox title="为什么要这样设计？" icon="🤔" variant="purple">
          <p className="mb-3">这种"AI 决策 + 客户端执行"的分离设计有深刻的原因：</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-400 font-bold">安全性</span>
              <span className="text-gray-300">：AI 无法直接操作你的系统，所有操作都需要你的客户端"同意"执行</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">可控性</span>
              <span className="text-gray-300">：客户端可以拦截、审批、限制任何工具调用</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">可扩展性</span>
              <span className="text-gray-300">：可以自定义工具，AI 不需要"学习"新能力</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">透明性</span>
              <span className="text-gray-300">：所有操作都有明确的调用记录，可审计</span>
            </div>
          </div>
        </HighlightBox>
      </Layer>

      {/* 工具定义 */}
      <Layer title="第一步：告诉 AI 有哪些工具" icon="📋">
        <p className="mb-4">
          CLI 在发送请求时，会附带<strong>工具定义</strong>
          ，告诉 AI 有哪些工具可以用。这是整个 Function Calling 机制的基础：
        </p>

        <JsonBlock code={`// CLI 发送给 AI 的请求
{
    "model": "gemini-1.5-pro",
    "messages": [
        {
            "role": "user",
            "content": "帮我读取 package.json"
        }
    ],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "read_file",
                "description": "读取文件内容。用于查看代码、配置文件、文档等。",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "absolute_path": {
                            "type": "string",
                            "description": "文件的绝对路径，如 /home/user/project/package.json"
                        }
                    },
                    "required": ["absolute_path"]
                }
            }
        }
    ]
}`} />

        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-white">工具定义的关键字段解析</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">字段</th>
                  <th className="px-4 py-2 text-left text-gray-300">作用</th>
                  <th className="px-4 py-2 text-left text-gray-300">AI 如何使用</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 font-mono text-blue-400">name</td>
                  <td className="px-4 py-2 text-gray-300">工具的唯一标识符</td>
                  <td className="px-4 py-2 text-gray-400">AI 在 tool_calls 中引用此名称</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 font-mono text-blue-400">description</td>
                  <td className="px-4 py-2 text-gray-300">工具功能的自然语言描述</td>
                  <td className="px-4 py-2 text-gray-400">AI 据此判断何时使用该工具</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 font-mono text-blue-400">parameters</td>
                  <td className="px-4 py-2 text-gray-300">JSON Schema 定义参数结构</td>
                  <td className="px-4 py-2 text-gray-400">AI 据此生成合法的参数 JSON</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 font-mono text-blue-400">required</td>
                  <td className="px-4 py-2 text-gray-300">必填参数列表</td>
                  <td className="px-4 py-2 text-gray-400">AI 确保这些参数一定存在</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <HighlightBox title="description 的重要性" icon="⚠️" variant="yellow">
          <p className="mb-2">
            <code className="bg-black/30 px-1 rounded">description</code> 是 AI 理解工具的<strong>唯一依据</strong>。
            写得好，AI 就知道什么时候该用这个工具；写得差，AI 可能误用或忽略它。
          </p>
          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
              <p className="text-red-400 font-semibold mb-1">❌ 差的描述</p>
              <code className="text-xs text-gray-400">"读取文件"</code>
              <p className="text-xs text-gray-500 mt-1">AI 不知道什么时候该用它</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
              <p className="text-green-400 font-semibold mb-1">✅ 好的描述</p>
              <code className="text-xs text-gray-400">"读取文件内容。用于查看源代码、配置文件、文档等。返回文件的完整文本内容。"</code>
              <p className="text-xs text-gray-500 mt-1">清晰说明用途和返回值</p>
            </div>
          </div>
        </HighlightBox>

        <HighlightBox title="参数 Schema 的作用" icon="📐" variant="blue">
          <p className="mb-2">参数定义使用 JSON Schema 格式，AI 会严格按照这个格式生成参数：</p>
          <ul className="pl-5 list-disc space-y-1 text-sm">
            <li><code className="bg-black/30 px-1 rounded">type: "string"</code> → AI 生成字符串值</li>
            <li><code className="bg-black/30 px-1 rounded">type: "number"</code> → AI 生成数字值</li>
            <li><code className="bg-black/30 px-1 rounded">type: "boolean"</code> → AI 生成 true/false</li>
            <li><code className="bg-black/30 px-1 rounded">type: "array"</code> → AI 生成数组</li>
            <li><code className="bg-black/30 px-1 rounded">enum: ["a", "b"]</code> → AI 只从给定选项中选择</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* AI 返回工具调用 */}
      <Layer title="第二步：AI 决定调用工具" icon="🤖">
        <p className="mb-4">
          AI 分析用户请求后，如果需要使用工具，会返回
          <strong>特殊格式</strong>的响应。理解这个响应结构是关键：
        </p>

        <JsonBlock code={`// AI 返回的响应
{
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": null,  // 没有文本内容！
                "tool_calls": [
                    {
                        "id": "call_abc123",           // 唯一标识，用于关联结果
                        "type": "function",
                        "function": {
                            "name": "read_file",       // 要调用的工具名
                            "arguments": "{\\"absolute_path\\": \\"/project/package.json\\"}"
                        }
                    }
                ]
            },
            "finish_reason": "tool_calls"  // 表示需要调用工具
        }
    ]
}`} />

        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-white">finish_reason 详解</h4>
          <p className="text-gray-300">
            <code className="bg-black/30 px-1 rounded">finish_reason</code> 告诉 CLI 为什么 AI 停止生成：
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">值</th>
                  <th className="px-4 py-2 text-left text-gray-300">含义</th>
                  <th className="px-4 py-2 text-left text-gray-300">CLI 应该做什么</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 font-mono text-green-400">stop</td>
                  <td className="px-4 py-2 text-gray-300">AI 正常完成回答</td>
                  <td className="px-4 py-2 text-gray-400">显示 content，对话可结束</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 font-mono text-blue-400">tool_calls</td>
                  <td className="px-4 py-2 text-gray-300">AI 请求调用工具</td>
                  <td className="px-4 py-2 text-gray-400">执行工具，把结果发回 AI</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 font-mono text-yellow-400">length</td>
                  <td className="px-4 py-2 text-gray-300">达到 token 上限</td>
                  <td className="px-4 py-2 text-gray-400">显示部分内容，提示用户继续</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 font-mono text-red-400">content_filter</td>
                  <td className="px-4 py-2 text-gray-300">内容被安全过滤</td>
                  <td className="px-4 py-2 text-gray-400">提示用户修改请求</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <HighlightBox title="tool_calls 数组" icon="📦" variant="blue">
          <p className="mb-2">
            <code className="bg-black/30 px-1 rounded">tool_calls</code> 是数组，意味着 AI 可以<strong>一次请求多个工具</strong>：
          </p>
          <JsonBlock code={`// AI 可能同时请求多个工具
"tool_calls": [
    { "id": "call_1", "function": { "name": "read_file", "arguments": "..." } },
    { "id": "call_2", "function": { "name": "read_file", "arguments": "..." } },
    { "id": "call_3", "function": { "name": "list_dir", "arguments": "..." } }
]`} />
          <p className="mt-2 text-sm text-gray-400">
            CLI 可以并行执行这些工具调用，提高效率。但要注意每个结果必须对应正确的 <code className="bg-black/30 px-1 rounded">tool_call_id</code>。
          </p>
        </HighlightBox>

        <HighlightBox title="arguments 是 JSON 字符串" icon="⚠️" variant="yellow">
          <p className="mb-2">
            注意 <code className="bg-black/30 px-1 rounded">arguments</code> 是<strong>字符串</strong>，不是对象！
          </p>
          <CodeBlock code={`// ❌ 错误：直接使用
const path = toolCall.function.arguments.absolute_path;
// TypeError: Cannot read property 'absolute_path' of string

// ✅ 正确：先解析 JSON
const args = JSON.parse(toolCall.function.arguments);
const path = args.absolute_path;`} />
        </HighlightBox>

        <HighlightBox title="content 可能不为 null" icon="💡" variant="purple">
          <p>
            某些情况下，<code className="bg-black/30 px-1 rounded">content</code> 和{' '}
            <code className="bg-black/30 px-1 rounded">tool_calls</code> 可能同时存在。
            AI 可能先说一句话，再请求工具：
          </p>
          <JsonBlock code={`{
    "content": "让我来读取一下这个文件...",
    "tool_calls": [...]
}`} />
          <p className="mt-2 text-sm text-gray-400">
            CLI 应该先显示 content，再执行 tool_calls。
          </p>
        </HighlightBox>
      </Layer>

      {/* CLI 执行工具 */}
      <Layer title="第三步：CLI 执行工具" icon="⚙️">
        <p className="mb-4">
          CLI 收到 AI 的响应后，发现{' '}
          <code className="bg-black/30 px-1 rounded">tool_calls</code>，开始执行。这个过程涉及多个关键步骤：
        </p>

        <MermaidDiagram chart={`
flowchart TB
    A[收到 tool_calls] --> B{解析 arguments}
    B -->|解析成功| C[查找工具注册表]
    B -->|JSON 无效| E1[返回解析错误]

    C -->|找到工具| D[验证参数]
    C -->|工具不存在| E2[返回工具未知错误]

    D -->|验证通过| F[检查权限]
    D -->|验证失败| E3[返回参数错误]

    F -->|有权限| G[执行工具]
    F -->|需要授权| H[请求用户确认]

    H -->|用户同意| G
    H -->|用户拒绝| E4[返回权限拒绝]

    G -->|执行成功| I[格式化结果]
    G -->|执行失败| E5[返回执行错误]

    I --> J[返回 tool message]

    E1 --> J
    E2 --> J
    E3 --> J
    E4 --> J
    E5 --> J

    style E1 fill:#991b1b
    style E2 fill:#991b1b
    style E3 fill:#991b1b
    style E4 fill:#991b1b
    style E5 fill:#991b1b
    style J fill:#065f46
`} />

        <CodeBlock title="core/coreToolScheduler.ts - 简化版" code={`// core/coreToolScheduler.ts - 简化版

async executeToolCall(toolCall) {
    // 1. 解析工具名称和参数
    const { name, arguments: argsJson } = toolCall.function;

    // ⚠️ 这里可能失败：AI 生成的 JSON 可能无效
    let params;
    try {
        params = JSON.parse(argsJson);
    } catch (e) {
        return { tool_call_id: toolCall.id, content: "参数解析失败: " + e.message };
    }

    // 2. 从注册表获取工具
    const tool = this.toolRegistry.getTool(name);
    if (!tool) {
        return { tool_call_id: toolCall.id, content: "未知工具: " + name };
    }

    // 3. 验证参数
    const error = tool.validateParams(params);
    if (error) {
        return { tool_call_id: toolCall.id, content: "参数无效: " + error };
    }

    // 4. 创建调用实例并执行
    const invocation = tool.createInvocation(params);
    const result = await invocation.execute();

    // 5. 返回结果
    return {
        tool_call_id: toolCall.id,
        content: result.llmContent
    };
}`} />

        <HighlightBox title="ReadFileTool.execute() 做了什么？" icon="🔧" variant="green">
          <CodeBlock code={`// tools/read-file.ts - 简化版

async execute(): Promise<TResult> {
    try {
        // 1. 使用 Node.js 读取文件
        const content = await fs.readFile(
            this.params.absolute_path,
            'utf-8'
        );

        // 2. 返回给 AI
        return {
            llmContent: content,  // 这个会发给 AI
            returnDisplay: '...'  // 这个显示在终端
        };
    } catch (err) {
        // 3. 错误也要返回给 AI，让它理解发生了什么
        return {
            llmContent: \`读取文件失败: \${err.message}\`,
            returnDisplay: '读取失败'
        };
    }
}`} />
        </HighlightBox>

        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-white">执行过程中的关键决策</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">阶段</th>
                  <th className="px-4 py-2 text-left text-gray-300">可能的问题</th>
                  <th className="px-4 py-2 text-left text-gray-300">处理策略</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-gray-300">解析 arguments</td>
                  <td className="px-4 py-2 text-gray-400">JSON 语法错误</td>
                  <td className="px-4 py-2 text-gray-400">返回错误信息，让 AI 重试</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-300">查找工具</td>
                  <td className="px-4 py-2 text-gray-400">AI 请求不存在的工具</td>
                  <td className="px-4 py-2 text-gray-400">返回可用工具列表</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-gray-300">验证参数</td>
                  <td className="px-4 py-2 text-gray-400">缺少必填参数 / 类型错误</td>
                  <td className="px-4 py-2 text-gray-400">返回具体错误，引导 AI 修正</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-300">权限检查</td>
                  <td className="px-4 py-2 text-gray-400">敏感操作需要确认</td>
                  <td className="px-4 py-2 text-gray-400">暂停执行，请求用户授权</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-gray-300">执行工具</td>
                  <td className="px-4 py-2 text-gray-400">文件不存在 / 网络超时等</td>
                  <td className="px-4 py-2 text-gray-400">捕获错误，返回给 AI 处理</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <HighlightBox title="错误也是信息" icon="💡" variant="purple">
          <p className="mb-2">
            工具执行失败时，<strong>必须把错误信息返回给 AI</strong>。这样 AI 才能：
          </p>
          <ul className="pl-5 list-disc space-y-1">
            <li>理解发生了什么问题</li>
            <li>决定是否重试（用不同参数）</li>
            <li>尝试其他方案</li>
            <li>向用户解释情况</li>
          </ul>
          <p className="mt-2 text-sm text-gray-400">
            如果吞掉错误不返回，AI 会"失忆"——不知道发生了什么，可能反复尝试同样的失败操作。
          </p>
        </HighlightBox>
      </Layer>

      {/* 结果返回给 AI */}
      <Layer title="第四步：把结果发给 AI" icon="📤">
        <p className="mb-4">
          CLI 执行完工具后，把结果作为新消息发给 AI（这是
          <strong>第二轮请求</strong>）。这一步的正确性至关重要：
        </p>

        <JsonBlock code={`// CLI 发送的第二轮请求
{
    "model": "gemini-1.5-pro",
    "messages": [
        // 1. 原始用户消息
        {
            "role": "user",
            "content": "帮我读取 package.json"
        },
        // 2. AI 的工具调用请求（必须原样保留）
        {
            "role": "assistant",
            "content": null,
            "tool_calls": [
                {
                    "id": "call_abc123",
                    "type": "function",
                    "function": {
                        "name": "read_file",
                        "arguments": "{\\"absolute_path\\": \\"/project/package.json\\"}"
                    }
                }
            ]
        },
        // 3. 工具执行结果（新增的）
        {
            "role": "tool",
            "tool_call_id": "call_abc123",  // 必须匹配上面的 id
            "content": "{ \\"name\\": \\"@gemini/gemini-cli\\", \\"version\\": \\"1.0.0\\" }"
        }
    ]
}`} />

        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-white">消息构造规则</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">规则</th>
                  <th className="px-4 py-2 text-left text-gray-300">说明</th>
                  <th className="px-4 py-2 text-left text-gray-300">违反后果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-gray-300">必须保留完整历史</td>
                  <td className="px-4 py-2 text-gray-400">user → assistant (tool_calls) → tool</td>
                  <td className="px-4 py-2 text-red-400">AI 不理解上下文</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-300">tool_call_id 必须匹配</td>
                  <td className="px-4 py-2 text-gray-400">tool 消息的 id 必须对应 assistant 的 tool_calls.id</td>
                  <td className="px-4 py-2 text-red-400">API 返回错误</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-gray-300">每个 tool_call 都要回复</td>
                  <td className="px-4 py-2 text-gray-400">AI 请求了 3 个工具，就要返回 3 个 tool 消息</td>
                  <td className="px-4 py-2 text-red-400">AI 等待缺失的结果</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-300">content 必须是字符串</td>
                  <td className="px-4 py-2 text-gray-400">即使是 JSON 对象，也要序列化为字符串</td>
                  <td className="px-4 py-2 text-red-400">API 返回类型错误</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <HighlightBox title="为什么 AI 没有记忆？" icon="🧠" variant="blue">
          <p className="mb-2">
            这是 <strong>设计决策</strong>，不是技术限制。无状态设计带来：
          </p>
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>可扩展性</strong>：任何服务器都能处理任何请求</li>
            <li><strong>一致性</strong>：没有会话状态需要同步</li>
            <li><strong>可靠性</strong>：服务器重启不会丢失"记忆"</li>
            <li><strong>透明性</strong>：你完全控制 AI 看到什么</li>
          </ul>
          <p className="mt-2 text-sm text-gray-400">
            代价是每次请求都要发送完整历史，消耗更多 token。CLI 会通过压缩、摘要等策略优化。
          </p>
        </HighlightBox>

        <HighlightBox title="多工具调用的结果顺序" icon="📋" variant="yellow">
          <p className="mb-2">
            如果 AI 一次请求多个工具，结果消息的<strong>顺序不重要</strong>，但<strong>ID 匹配是必须的</strong>：
          </p>
          <JsonBlock code={`// AI 请求了 3 个工具
"tool_calls": [
    { "id": "call_1", ... },
    { "id": "call_2", ... },
    { "id": "call_3", ... }
]

// 结果可以是任意顺序
"messages": [
    { "role": "tool", "tool_call_id": "call_3", "content": "..." },
    { "role": "tool", "tool_call_id": "call_1", "content": "..." },
    { "role": "tool", "tool_call_id": "call_2", "content": "..." }
]`} />
        </HighlightBox>
      </Layer>

      {/* AI 生成最终回复 */}
      <Layer title="第五步：AI 生成最终回复" icon="✅">
        <p className="mb-4">AI 看到工具结果后，生成最终回复：</p>

        <JsonBlock code={`// AI 的第二轮响应
{
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "package.json 的 name 字段是 @gemini/gemini-cli，版本是 1.0.0",
                "tool_calls": null  // 这次没有工具调用
            },
            "finish_reason": "stop"  // 正常结束
        }
    ]
}`} />

        <p className="mt-4 mb-4">
          这次{' '}
          <code className="bg-black/30 px-1 rounded">finish_reason</code> 是
          "stop"，表示 AI 完成了回答，不需要再调用工具。
        </p>

        <HighlightBox title="但这不一定是结束！" icon="🔄" variant="yellow">
          <p className="mb-2">
            AI 可能在看到工具结果后，决定<strong>再调用其他工具</strong>。例如：
          </p>
          <ul className="pl-5 list-disc space-y-1 mb-3">
            <li>用户：<em>"帮我更新 package.json 的版本号"</em></li>
            <li>AI 第一轮：调用 read_file 读取当前内容</li>
            <li>AI 第二轮：看到内容后，调用 write_file 写入新版本</li>
            <li>AI 第三轮：finish_reason 才是 "stop"</li>
          </ul>
          <p className="text-sm text-gray-400">
            这就是为什么叫"多轮对话"——工具调用可能触发更多工具调用。
          </p>
        </HighlightBox>

        <MermaidDiagram chart={`
stateDiagram-v2
    [*] --> 用户输入
    用户输入 --> AI响应

    AI响应 --> 检查finish_reason
    检查finish_reason --> 工具调用: tool_calls
    检查finish_reason --> 显示回复: stop
    检查finish_reason --> 处理异常: length/content_filter

    工具调用 --> 执行工具
    执行工具 --> AI响应: 发送结果

    显示回复 --> 等待下一轮
    等待下一轮 --> 用户输入: 用户继续提问
    等待下一轮 --> [*]: 对话结束

    处理异常 --> 显示回复: 部分内容
`} />
      </Layer>

      {/* 边界情况与异常处理 */}
      <Layer title="边界情况与异常处理" icon="⚠️">
        <p className="mb-4">
          真实世界的工具调用远比理想情况复杂。以下是常见的边界情况及其处理策略：
        </p>

        <div className="space-y-6">
          {/* 情况1: AI 生成无效 JSON */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-semibold text-red-400 mb-2">情况 1：AI 生成无效的 arguments JSON</h4>
            <p className="text-gray-300 mb-3">
              AI 不是完美的，有时会生成格式错误的 JSON：
            </p>
            <JsonBlock code={`// AI 生成了这样的 arguments
"{\\"path\\": /home/user/file}"  // 缺少引号！

// JSON.parse() 会抛出 SyntaxError`} />
            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded p-3">
              <p className="text-green-400 font-semibold mb-1">处理策略</p>
              <ul className="pl-5 list-disc text-sm text-gray-300">
                <li>捕获解析错误，返回详细错误信息给 AI</li>
                <li>包含原始 arguments 字符串，帮助 AI 理解问题</li>
                <li>AI 通常会自我修正，重新生成正确的 JSON</li>
              </ul>
            </div>
          </div>

          {/* 情况2: AI 调用不存在的工具 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-semibold text-red-400 mb-2">情况 2：AI 调用不存在的工具</h4>
            <p className="text-gray-300 mb-3">
              AI 可能"幻觉"出不存在的工具名称：
            </p>
            <JsonBlock code={`// AI 请求了 "execute_python"，但我们只有 "run_shell"
{
    "name": "execute_python",  // 不存在！
    "arguments": "..."
}`} />
            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded p-3">
              <p className="text-green-400 font-semibold mb-1">处理策略</p>
              <ul className="pl-5 list-disc text-sm text-gray-300">
                <li>返回错误信息，列出可用的工具名称</li>
                <li>AI 会从可用列表中选择正确的工具</li>
                <li>考虑在 system prompt 中强调可用工具</li>
              </ul>
            </div>
          </div>

          {/* 情况3: 工具执行中途失败 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-semibold text-red-400 mb-2">情况 3：工具执行中途失败</h4>
            <p className="text-gray-300 mb-3">
              文件不存在、网络超时、权限不足等运行时错误：
            </p>
            <CodeBlock code={`// read_file 执行时文件不存在
Error: ENOENT: no such file or directory, open '/path/to/missing.txt'

// 应该返回给 AI 的内容
{
    "role": "tool",
    "tool_call_id": "call_xxx",
    "content": "错误: 文件不存在 /path/to/missing.txt。请检查路径是否正确。"
}`} />
            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded p-3">
              <p className="text-green-400 font-semibold mb-1">处理策略</p>
              <ul className="pl-5 list-disc text-sm text-gray-300">
                <li><strong>绝不吞掉错误</strong>——必须返回给 AI</li>
                <li>提供足够的上下文（路径、错误类型、可能的原因）</li>
                <li>AI 可能会尝试修正路径或提出替代方案</li>
              </ul>
            </div>
          </div>

          {/* 情况4: 工具执行超时 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-semibold text-red-400 mb-2">情况 4：工具执行超时</h4>
            <p className="text-gray-300 mb-3">
              长时间运行的命令可能超过预设时限：
            </p>
            <CodeBlock code={`// run_shell 执行 "npm install" 超过 60 秒
// 设置超时机制
const result = await Promise.race([
    toolInvocation.execute(),
    new Promise((_, reject) =>
        setTimeout(() => reject(new Error('执行超时')), 60000)
    )
]);`} />
            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded p-3">
              <p className="text-green-400 font-semibold mb-1">处理策略</p>
              <ul className="pl-5 list-disc text-sm text-gray-300">
                <li>设置合理的超时时间（根据工具类型调整）</li>
                <li>返回"执行超时"错误，包含已产生的部分输出</li>
                <li>让 AI 决定是否重试或采取其他措施</li>
              </ul>
            </div>
          </div>

          {/* 情况5: 用户拒绝授权 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-semibold text-yellow-400 mb-2">情况 5：用户拒绝授权敏感操作</h4>
            <p className="text-gray-300 mb-3">
              删除文件、执行危险命令等需要用户确认：
            </p>
            <CodeBlock code={`// AI 请求删除文件
// CLI 弹出确认对话框
// 用户选择"拒绝"

// 返回给 AI
{
    "role": "tool",
    "tool_call_id": "call_xxx",
    "content": "用户拒绝了此操作。文件未被删除。请询问用户是否需要其他帮助。"
}`} />
            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded p-3">
              <p className="text-green-400 font-semibold mb-1">处理策略</p>
              <ul className="pl-5 list-disc text-sm text-gray-300">
                <li>明确告诉 AI 操作被用户拒绝</li>
                <li>AI 应该尊重用户决定，不再尝试同样的操作</li>
                <li>提示 AI 询问是否有替代方案</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      {/* 调试与排查指南 */}
      <Layer title="调试与排查指南" icon="🔍">
        <p className="mb-4">
          当工具调用出现问题时，按照以下步骤排查：
        </p>

        <MermaidDiagram chart={`
flowchart TD
    A[工具调用失败] --> B{问题类型}

    B -->|AI 不调用工具| C[检查工具定义]
    B -->|参数错误| D[检查 arguments]
    B -->|执行失败| E[检查工具实现]
    B -->|结果丢失| F[检查消息构造]

    C --> C1[description 是否清晰？]
    C --> C2[tools 是否发送？]
    C --> C3[tool_choice 设置？]

    D --> D1[JSON 是否有效？]
    D --> D2[参数类型是否正确？]
    D --> D3[必填参数是否存在？]

    E --> E1[查看错误日志]
    E --> E2[检查权限和路径]
    E --> E3[验证网络连接]

    F --> F1[tool_call_id 匹配？]
    F --> F2[历史消息完整？]
    F --> F3[content 是字符串？]
`} />

        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-semibold text-white">常见问题排查表</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">症状</th>
                  <th className="px-4 py-2 text-left text-gray-300">可能原因</th>
                  <th className="px-4 py-2 text-left text-gray-300">排查方法</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-gray-300">AI 从不调用工具</td>
                  <td className="px-4 py-2 text-gray-400">tools 未正确发送 / description 不清晰</td>
                  <td className="px-4 py-2 text-gray-400">打印请求 payload，检查 tools 字段</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-300">AI 调用错误的工具</td>
                  <td className="px-4 py-2 text-gray-400">工具描述有歧义 / 工具太多</td>
                  <td className="px-4 py-2 text-gray-400">优化 description，减少工具数量</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-gray-300">参数总是错误</td>
                  <td className="px-4 py-2 text-gray-400">参数 schema 不够详细</td>
                  <td className="px-4 py-2 text-gray-400">添加参数 description 和示例</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-300">AI 忽略工具结果</td>
                  <td className="px-4 py-2 text-gray-400">tool 消息未正确添加到历史</td>
                  <td className="px-4 py-2 text-gray-400">检查消息数组，确认 role: "tool"</td>
                </tr>
                <tr className="bg-gray-900/50">
                  <td className="px-4 py-2 text-gray-300">AI 重复调用同一工具</td>
                  <td className="px-4 py-2 text-gray-400">结果格式 AI 无法理解</td>
                  <td className="px-4 py-2 text-gray-400">优化结果格式，添加状态标识</td>
                </tr>
                <tr className="bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-300">API 返回错误</td>
                  <td className="px-4 py-2 text-gray-400">tool_call_id 不匹配</td>
                  <td className="px-4 py-2 text-gray-400">检查 ID 是否完全一致（区分大小写）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <HighlightBox title="调试技巧：记录完整请求" icon="💡" variant="blue">
          <p className="mb-2">开发调试时，记录每次 API 请求的完整 payload：</p>
          <CodeBlock code={`// 在发送请求前记录
console.log('=== API Request ===');
console.log(JSON.stringify({
    model: requestBody.model,
    messages: requestBody.messages,
    tools: requestBody.tools
}, null, 2));

// 在收到响应后记录
console.log('=== API Response ===');
console.log(JSON.stringify(response.data, null, 2));`} />
          <p className="mt-2 text-sm text-gray-400">
            这样可以完整追踪每一轮对话的内容，快速定位问题。
          </p>
        </HighlightBox>

        <HighlightBox title="生产环境日志策略" icon="📊" variant="purple">
          <p className="mb-2">生产环境需要平衡调试需求和隐私保护：</p>
          <ul className="pl-5 list-disc space-y-1 text-sm">
            <li><strong>记录元信息</strong>：工具名称、调用 ID、执行时间、成功/失败</li>
            <li><strong>脱敏处理</strong>：对参数和结果中的敏感信息进行脱敏</li>
            <li><strong>采样记录</strong>：只记录一定比例的完整请求用于分析</li>
            <li><strong>错误优先</strong>：失败的调用总是记录完整信息</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 实战案例分析 */}
      <Layer title="实战案例：完整的多轮工具调用" icon="📚">
        <p className="mb-4">
          让我们看一个完整的实际案例：用户要求"帮我在 src/utils 目录下创建一个 format.ts 文件"。
        </p>

        <div className="space-y-6">
          {/* 第一轮 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/30">
            <h4 className="text-blue-400 font-semibold mb-2">第一轮：用户输入</h4>
            <JsonBlock code={`// CLI 发送给 AI
{
    "messages": [
        {
            "role": "user",
            "content": "帮我在 src/utils 目录下创建一个 format.ts 文件"
        }
    ],
    "tools": [...]
}`} />
          </div>

          {/* AI 第一次响应 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-purple-400 font-semibold mb-2">AI 响应：先检查目录是否存在</h4>
            <JsonBlock code={`// AI 返回
{
    "message": {
        "content": "让我先检查 src/utils 目录是否存在...",
        "tool_calls": [
            {
                "id": "call_1",
                "function": {
                    "name": "list_dir",
                    "arguments": "{\\"path\\": \\"src\\"}"
                }
            }
        ]
    },
    "finish_reason": "tool_calls"
}`} />
            <p className="mt-2 text-sm text-gray-400">
              注意：AI 选择先检查，而不是直接创建。这是谨慎的做法。
            </p>
          </div>

          {/* CLI 执行 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/30">
            <h4 className="text-green-400 font-semibold mb-2">CLI 执行 list_dir 并返回结果</h4>
            <JsonBlock code={`// 添加到消息历史
{
    "role": "tool",
    "tool_call_id": "call_1",
    "content": "目录内容:\\n- components/\\n- pages/\\n- index.ts\\n\\n(没有 utils 目录)"
}`} />
          </div>

          {/* AI 第二次响应 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-purple-400 font-semibold mb-2">AI 响应：创建目录并写入文件</h4>
            <JsonBlock code={`// AI 决定先创建目录
{
    "message": {
        "content": "src/utils 目录不存在，我来创建它并写入文件...",
        "tool_calls": [
            {
                "id": "call_2",
                "function": {
                    "name": "run_shell",
                    "arguments": "{\\"command\\": \\"mkdir -p src/utils\\"}"
                }
            },
            {
                "id": "call_3",
                "function": {
                    "name": "write_file",
                    "arguments": "{\\"path\\": \\"src/utils/format.ts\\", \\"content\\": \\"// Format utilities\\\\n\\\\nexport function formatDate(date: Date): string {\\\\n  return date.toISOString();\\\\n}\\\\n\\"}"
                }
            }
        ]
    },
    "finish_reason": "tool_calls"
}`} />
            <p className="mt-2 text-sm text-gray-400">
              AI 一次请求了两个工具，CLI 可以按顺序执行（因为 write_file 依赖 mkdir 的结果）。
            </p>
          </div>

          {/* CLI 执行两个工具 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/30">
            <h4 className="text-green-400 font-semibold mb-2">CLI 执行两个工具并返回结果</h4>
            <JsonBlock code={`// 两个工具的结果
[
    {
        "role": "tool",
        "tool_call_id": "call_2",
        "content": "目录创建成功"
    },
    {
        "role": "tool",
        "tool_call_id": "call_3",
        "content": "文件已写入 src/utils/format.ts (58 字节)"
    }
]`} />
          </div>

          {/* AI 最终响应 */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-purple-400 font-semibold mb-2">AI 最终响应</h4>
            <JsonBlock code={`{
    "message": {
        "content": "已完成！我创建了 src/utils/format.ts 文件，包含一个基础的 formatDate 函数。你可以根据需要添加更多格式化工具。",
        "tool_calls": null
    },
    "finish_reason": "stop"
}`} />
          </div>
        </div>

        <HighlightBox title="案例总结" icon="📝" variant="blue">
          <p className="mb-2">这个案例展示了几个关键点：</p>
          <ul className="pl-5 list-disc space-y-1">
            <li><strong>AI 会主动规划</strong>：先检查目录，再创建，体现了"思考"过程</li>
            <li><strong>批量工具调用</strong>：AI 可以一次请求多个相关工具</li>
            <li><strong>结果驱动决策</strong>：AI 根据 list_dir 结果决定是否需要 mkdir</li>
            <li><strong>多轮交互</strong>：完成一个任务可能需要多轮 API 调用</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 相关页面 */}
      <RelatedPages
        pages={[
          { id: 'tool-detail', label: '工具系统详解', description: '深入了解各个工具的实现细节' },
          { id: 'error', label: '错误处理机制', description: '完整的错误处理策略' },
          { id: 'session-persistence', label: '会话持久化', description: '了解消息历史如何管理' },
          { id: 'overview', label: '系统总览', description: '回到整体架构视图' },
        ]}
      />
    </div>
  );
}
