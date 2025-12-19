import { Layer } from '../components/Layer';
import { HighlightBox } from '../components/HighlightBox';
import { JsonBlock } from '../components/JsonBlock';
import { CodeBlock } from '../components/CodeBlock';

export function AIToolInteraction() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">AI 工具交互机制详解</h2>

      {/* Function Calling 解释 */}
      <Layer title="什么是 Function Calling？" icon="🎯">
        <p className="mb-4">
          <strong>Function Calling</strong> 是 AI
          模型的一个能力，让 AI 可以"请求"调用外部函数/工具。 但{' '}
          <strong>AI 本身不能执行任何代码</strong>
          ，它只是告诉你"我想调用这个函数"。
        </p>

        <HighlightBox title="AI 能做的" icon="✅" variant="green">
          <ul className="pl-5 list-disc">
            <li>理解用户意图</li>
            <li>决定需要调用哪个工具</li>
            <li>生成工具调用的参数</li>
            <li>理解工具返回的结果</li>
            <li>生成最终回复</li>
          </ul>
        </HighlightBox>

        <HighlightBox title="AI 不能做的" icon="❌" variant="red">
          <ul className="pl-5 list-disc">
            <li>直接读取你的文件</li>
            <li>直接执行命令</li>
            <li>访问你的电脑</li>
            <li>记住之前的对话（除非 CLI 发送历史）</li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* 工具定义 */}
      <Layer title="第一步：告诉 AI 有哪些工具" icon="📋">
        <p className="mb-4">
          CLI 在发送请求时，会附带<strong>工具定义</strong>
          ，告诉 AI 有哪些工具可以用：
        </p>

        <JsonBlock code={`// CLI 发送给 AI 的请求
{
    "model": "qwen-coder-plus",
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
                "description": "读取文件内容",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "absolute_path": {
                            "type": "string"
                        }
                    }
                }
            }
        }
    ]
}`} />

        <HighlightBox title="关键点" icon="💡" variant="blue">
          <p>
            AI 根据 <code className="bg-black/30 px-1 rounded">description</code>{' '}
            来理解每个工具的用途，决定什么时候使用它。
          </p>
        </HighlightBox>
      </Layer>

      {/* AI 返回工具调用 */}
      <Layer title="第二步：AI 决定调用工具" icon="🤖">
        <p className="mb-4">
          AI 分析用户请求后，如果需要使用工具，会返回
          <strong>特殊格式</strong>的响应：
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
                        "id": "call_abc123",
                        "type": "function",
                        "function": {
                            "name": "read_file",
                            "arguments": "{\\"absolute_path\\": \\"...\\"}"
                        }
                    }
                ]
            },
            "finish_reason": "tool_calls"  // 表示需要调用工具
        }
    ]
}`} />

        <HighlightBox title="注意" icon="⚠️">
          <ul className="pl-5 list-disc">
            <li>
              <code className="bg-black/30 px-1 rounded">content</code> 是 null -
              AI 没有直接回答，而是要求调用工具
            </li>
            <li>
              <code className="bg-black/30 px-1 rounded">finish_reason</code> 是
              "tool_calls" - 表示这轮结束是因为要调用工具
            </li>
            <li>
              <code className="bg-black/30 px-1 rounded">arguments</code> 是 JSON
              字符串 - CLI 需要解析它
            </li>
          </ul>
        </HighlightBox>
      </Layer>

      {/* CLI 执行工具 */}
      <Layer title="第三步：CLI 执行工具" icon="⚙️">
        <p className="mb-4">
          CLI 收到 AI 的响应后，发现{' '}
          <code className="bg-black/30 px-1 rounded">tool_calls</code>，于是：
        </p>

        <CodeBlock title="core/coreToolScheduler.ts - 简化版" code={`// core/coreToolScheduler.ts - 简化版

async executeToolCall(toolCall) {
    // 1. 解析工具名称和参数
    const { name, arguments: argsJson } = toolCall.function;
    const params = JSON.parse(argsJson);

    // 2. 从注册表获取工具
    const tool = this.toolRegistry.getTool(name);

    // 3. 验证参数
    const error = tool.validateParams(params);
    if (error) throw new Error(error);

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
}`} />
        </HighlightBox>
      </Layer>

      {/* 结果返回给 AI */}
      <Layer title="第四步：把结果发给 AI" icon="📤">
        <p className="mb-4">
          CLI 执行完工具后，把结果作为新消息发给 AI（这是
          <strong>第二轮请求</strong>）：
        </p>

        <JsonBlock code={`// CLI 发送的第二轮请求
{
    "model": "qwen-coder-plus",
    "messages": [
        // 历史消息
        { "role": "user", ... },
        { "role": "assistant", "tool_calls": [...] },
        // 👇 新增的工具结果
        {
            "role": "tool",
            "tool_call_id": "call_abc123",
            "content": "{ \\"name\\": \\"@innies/innies-cli\\", ... }"
        }
    ]
}`} />

        <HighlightBox title="关键理解" icon="🔄" variant="purple">
          <p>
            AI <strong>没有记忆</strong>！每次请求都是独立的。所以 CLI 需要：
          </p>
          <ul className="pl-5 mt-2 list-disc">
            <li>保存所有历史消息</li>
            <li>每次请求都发送完整历史</li>
            <li>包括之前的工具调用和结果</li>
          </ul>
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
                "content": "package.json 的 name 字段是 @innies/innies-cli",
                "tool_calls": null  // 这次没有工具调用
            },
            "finish_reason": "stop"  // 正常结束
        }
    ]
}`} />

        <p className="mt-4">
          这次{' '}
          <code className="bg-black/30 px-1 rounded">finish_reason</code> 是
          "stop"，表示 AI 完成了回答，不需要再调用工具。
        </p>
      </Layer>
    </div>
  );
}
