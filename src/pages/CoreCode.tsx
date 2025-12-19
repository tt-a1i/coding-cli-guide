import { Layer } from '../components/Layer';
import { CodeBlock } from '../components/CodeBlock';

export function CoreCode() {
  return (
    <div>
      <h2 className="text-2xl text-cyan-400 mb-5">核心代码剖析</h2>

      {/* GeminiClient */}
      <Layer title="GeminiClient - 循环核心" icon="🔑">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/core/client.ts
        </div>

        <CodeBlock code={`// 这是整个 CLI 的核心循环！

async *sendMessageStream(
    request: PartListUnion,
    signal: AbortSignal,
    prompt_id: string,
    turns: number = MAX_TURNS  // 默认 100
): AsyncGenerator<ServerGeminiStreamEvent, Turn> {

    // 🔄 这是核心循环
    while (turns > 0) {
        turns--;

        // 📤 1. 发送请求给 AI
        for await (const event of this.contentGenerator.generateContentStream(...)) {

            // 📺 2. yield 事件给 UI 显示
            yield event;

            // 🔧 3. 检查是否有工具调用
            if (event.toolCall) {
                // 4. 执行工具
                const result = await this.executeToolCall(event.toolCall);

                // 5. 工具结果加入历史
                this.addToolResult(event.toolCall.id, result);
            }
        }

        // ✅ 6. 检查是否完成
        if (this.lastFinishReason === 'stop') {
            break;  // 退出循环
        }

        // 🔄 否则继续循环（发送下一轮请求）
    }
}`} />
      </Layer>

      {/* ContentGenerator */}
      <Layer title="ContentGenerator - API 调用" icon="📡">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/core/openaiContentGenerator/
        </div>

        <CodeBlock code={`// OpenAI 兼容的内容生成器

async *generateContentStream(request) {
    // 构建 API 请求
    const response = await this.client.chat.completions.create({
        model: this.modelId,
        messages: this.conversationHistory,  // 完整历史
        tools: this.getToolDefinitions(),     // 工具定义
        stream: true                           // 流式响应
    });

    // 处理流式响应
    for await (const chunk of response) {
        const delta = chunk.choices[0].delta;

        if (delta.content) {
            // 文本内容
            yield { type: 'text', content: delta.content };
        }

        if (delta.tool_calls) {
            // 工具调用
            yield { type: 'tool_call', toolCall: delta.tool_calls[0] };
        }
    }
}

// 获取所有工具的定义
getToolDefinitions() {
    return this.toolRegistry.getAllTools().map(tool => ({
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        }
    }));
}`} />
      </Layer>

      {/* ToolRegistry */}
      <Layer title="ToolRegistry - 工具注册" icon="📚">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/tools/tool-registry.ts
        </div>

        <CodeBlock code={`// 工具注册表 - 管理所有可用工具

class ToolRegistry {
    private tools = new Map<string, Tool>();

    // 注册工具
    register(tool: Tool) {
        this.tools.set(tool.name, tool);
    }

    // 获取工具
    getTool(name: string) {
        return this.tools.get(name);
    }

    // 获取所有工具
    getAllTools() {
        return Array.from(this.tools.values());
    }
}

// 初始化时注册所有工具
function createToolRegistry(config: Config) {
    const registry = new ToolRegistry();

    registry.register(new ReadFileTool(config));
    registry.register(new WriteFileTool(config));
    registry.register(new EditTool(config));
    registry.register(new ShellTool(config));
    registry.register(new GlobTool(config));
    registry.register(new GrepTool(config));
    // ... 更多工具

    return registry;
}`} />
      </Layer>

      {/* BaseDeclarativeTool */}
      <Layer title="BaseDeclarativeTool - 工具基类" icon="🔧">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/tools/tools.ts
        </div>

        <CodeBlock code={`// 所有工具都继承这个基类

abstract class BaseDeclarativeTool<TParams, TResult> {
    readonly name: string;          // 工具名称，如 "read_file"
    readonly description: string;   // 描述，告诉 AI 这个工具做什么
    readonly parameters: Schema;    // JSON Schema 参数定义
    readonly kind: Kind;            // 类型：Read, Write, Execute

    // 验证参数
    protected abstract validateToolParamValues(
        params: TParams
    ): string | null;

    // 创建执行实例
    protected abstract createInvocation(
        params: TParams
    ): ToolInvocation<TParams, TResult>;

    // 调用工具的入口
    async invoke(params: TParams): Promise<TResult> {
        // 1. 验证参数
        const error = this.validateToolParamValues(params);
        if (error) throw new Error(error);

        // 2. 创建调用实例
        const invocation = this.createInvocation(params);

        // 3. 执行
        return invocation.execute();
    }
}

// 工具调用实例
abstract class BaseToolInvocation<TParams, TResult> {
    abstract execute(): Promise<TResult>;
    abstract getDescription(): string;
}`} />
      </Layer>
    </div>
  );
}
