import { useState } from 'react';
import { Layer } from '../components/Layer';
import { CodeBlock } from '../components/CodeBlock';
import { HighlightBox } from '../components/HighlightBox';

// ===== Introduction Component =====
function Introduction({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[var(--terminal-green)]/10 to-[var(--cyber-blue)]/10 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">💻</span>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              核心代码剖析
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              深入理解 CLI 的关键代码实现
            </p>
          </div>
        </div>
        <span
          className={`text-[var(--text-secondary)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6">
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--terminal-green)]">
                🎯 核心模块
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>GeminiClient</strong>: 会话管理和主循环
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>ContentGenerator</strong>: API 调用和流式响应处理
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>Turn</strong>: 单次响应周期的状态管理
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--cyber-blue)]">•</span>
                  <span>
                    <strong>ToolRegistry</strong>: 工具注册和调度
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--amber)]">
                📂 核心文件
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    packages/core/src/core/client.ts
                  </code>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    packages/core/src/core/turn.ts
                  </code>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    packages/core/src/core/geminiChat.ts
                  </code>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-xs bg-[var(--bg-terminal)] px-1 rounded">
                    packages/core/src/tools/tool-registry.ts
                  </code>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[var(--bg-terminal)] rounded-lg">
            <h4 className="text-sm font-semibold text-[var(--purple)] mb-2">
              💡 阅读顺序建议
            </h4>
            <div className="text-sm text-[var(--text-secondary)]">
              <p>
                1. 先理解 <strong>GeminiClient.sendMessageStream</strong> 主循环
                → 2. 再看 <strong>Turn</strong> 如何管理单次响应
                → 3. 然后理解 <strong>ContentGenerator</strong> 的 API 调用
                → 4. 最后看 <strong>ToolRegistry</strong> 的工具系统
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Main Component =====
export function CoreCode() {
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  return (
    <div>
      <Introduction
        isExpanded={isIntroExpanded}
        onToggle={() => setIsIntroExpanded(!isIntroExpanded)}
      />

      <h2 className="text-2xl text-cyan-400 mb-5">核心代码剖析</h2>

      {/* GeminiClient */}
      <Layer title="GeminiClient - 循环核心" icon="🔑">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/core/client.ts
        </div>

        <p className="text-gray-300 mb-4">
          GeminiClient 是整个 CLI 的核心，负责管理会话状态和执行主循环：
        </p>

        <CodeBlock
          title="GeminiClient 类结构"
          language="typescript"
          code={`// GeminiClient 核心属性
class GeminiClient {
  private readonly config: Config;
  private readonly contentGenerator: ContentGenerator;
  private readonly toolScheduler: ToolScheduler;
  private readonly loopDetector: LoopDetectionService;

  private chat: GeminiChat;           // 对话历史管理
  private sessionTurnCount = 0;       // 会话轮次计数
  private totalInputTokens = 0;       // Token 统计
  private totalOutputTokens = 0;

  // 核心方法
  async *sendMessageStream(...): AsyncGenerator<ServerGeminiStreamEvent, Turn>;
  async countSessionTokens(): Promise<number>;
  async tryCompressHistory(): Promise<boolean>;
}`}
        />

        <div className="mt-6">
          <CodeBlock
            title="sendMessageStream - 主循环"
            language="typescript"
            code={`// 这是整个 CLI 的核心循环！
async *sendMessageStream(
    request: PartListUnion,
    signal: AbortSignal,
    prompt_id: string,
    turns: number = MAX_TURNS  // 默认 100
): AsyncGenerator<ServerGeminiStreamEvent, Turn> {

    // 1. 递增会话轮次
    this.sessionTurnCount++;

    // 2. 检查各种限制
    if (this.sessionTurnCount > this.config.get('maxSessionTurns')) {
        yield { type: GeminiEventType.MaxSessionTurns };
        return turn;
    }

    // 3. 尝试压缩历史
    const compressed = await this.tryCompressHistory();
    if (compressed) {
        yield { type: GeminiEventType.ChatCompressed };
    }

    // 4. 循环检测
    const loopDetected = await this.loopDetector.turnStarted(signal);
    if (loopDetected) {
        yield { type: GeminiEventType.LoopDetected };
        return turn;
    }

    // 5. 创建并执行 Turn
    const turn = new Turn(this.getChat(), prompt_id);
    for await (const event of turn.run(model, request, signal)) {
        // 实时循环检测
        if (this.loopDetector.addAndCheck(event)) {
            yield { type: GeminiEventType.LoopDetected };
            return turn;
        }
        yield event;
    }

    // 6. 检查 Next Speaker（是否需要继续）
    if (turn.pendingToolCalls.length === 0 && !signal.aborted) {
        const shouldContinue = await this.checkNextSpeaker();
        if (shouldContinue) {
            yield* this.sendMessageStream([{ text: '' }], signal, prompt_id, turns - 1);
        }
    }

    return turn;
}`}
          />
        </div>
      </Layer>

      {/* Turn */}
      <Layer title="Turn - 单次响应周期" icon="🎯">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/core/turn.ts
        </div>

        <p className="text-gray-300 mb-4">
          Turn 封装了一次完整的 AI 响应周期，管理工具调用收集和完成状态：
        </p>

        <CodeBlock
          title="Turn 类结构"
          language="typescript"
          code={`class Turn {
  readonly pendingToolCalls: ToolCallRequestInfo[] = [];  // 待执行的工具调用
  private debugResponses: GenerateContentResponse[] = []; // 调试用响应记录
  private pendingCitations = new Set<string>();           // 引用收集
  finishReason: FinishReason | undefined = undefined;     // 完成原因
  private currentResponseId?: string;                      // 当前响应 ID

  constructor(
    private readonly chat: GeminiChat,
    private readonly prompt_id: string,
  ) {}

  // 执行 Turn，返回事件流
  async *run(
    model: string,
    req: PartListUnion,
    signal: AbortSignal,
  ): AsyncGenerator<ServerGeminiStreamEvent>;
}`}
        />

        <div className="mt-6">
          <CodeBlock
            title="Turn.run() - 处理流式响应"
            language="typescript"
            code={`async *run(model, req, signal): AsyncGenerator<ServerGeminiStreamEvent> {
  // 发送请求并获取流
  const stream = this.chat.sendMessageStream(model, req, signal);

  for await (const response of stream) {
    // 保存响应用于调试
    this.debugResponses.push(response);

    // 处理候选响应
    for (const candidate of response.candidates || []) {
      // 处理内容部分
      for (const part of candidate.content?.parts || []) {
        // 文本内容
        if (part.text) {
          yield { type: GeminiEventType.Content, value: part.text };
        }

        // 工具调用
        if (part.functionCall) {
          const toolCall = this.handlePendingFunctionCall(part.functionCall);
          if (toolCall) {
            yield toolCall;  // ToolCallRequest 事件
          }
        }

        // 思考过程（如果模型支持）
        if (part.thought) {
          yield { type: GeminiEventType.Thought, value: part.thought };
        }
      }

      // 检查完成原因
      if (candidate.finishReason) {
        this.finishReason = candidate.finishReason;
        yield {
          type: GeminiEventType.Finished,
          value: { finishReason: this.finishReason, usage: response.usageMetadata }
        };
      }
    }
  }
}`}
          />
        </div>
      </Layer>

      {/* GeminiChat */}
      <Layer title="GeminiChat - 对话历史管理" icon="💬">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/core/geminiChat.ts
        </div>

        <p className="text-gray-300 mb-4">
          GeminiChat 管理对话历史，负责消息格式化和历史压缩：
        </p>

        <CodeBlock
          title="GeminiChat 核心结构"
          language="typescript"
          code={`class GeminiChat {
  private history: Content[] = [];  // 对话历史（Gemini 格式）
  private systemPrompt: Content[];  // 系统提示

  constructor(
    private readonly contentGenerator: ContentGenerator,
    private readonly config: Config,
  ) {}

  // 发送消息并获取流式响应
  async *sendMessageStream(
    model: string,
    request: PartListUnion,
    signal: AbortSignal
  ): AsyncGenerator<GenerateContentResponse> {
    // 构建完整请求（系统提示 + 历史 + 新消息）
    const contents = [
      ...this.systemPrompt,
      ...this.history,
      { role: 'user', parts: request }
    ];

    // 调用 ContentGenerator
    yield* this.contentGenerator.generateContentStream(contents, signal);

    // 将新消息加入历史
    this.history.push({ role: 'user', parts: request });
  }

  // 添加模型响应到历史
  addModelResponse(content: Content) {
    this.history.push(content);
  }

  // 添加工具响应
  addToolResponse(toolCallId: string, result: string) {
    this.history.push({
      role: 'user',  // 工具响应作为用户消息
      parts: [{ functionResponse: { id: toolCallId, response: { output: result } } }]
    });
  }

  // 获取历史（用于压缩或导出）
  getHistory(curated: boolean = false): Content[] {
    return structuredClone(this.history);
  }
}`}
        />
      </Layer>

      {/* ContentGenerator */}
      <Layer title="ContentGenerator - API 调用层" icon="📡">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/core/openaiContentGenerator/
        </div>

        <p className="text-gray-300 mb-4">
          ContentGenerator 是与 LLM API 交互的抽象层，支持多种 API 格式：
        </p>

        <CodeBlock
          title="ContentGenerator 接口"
          language="typescript"
          code={`// 内容生成器接口（支持多厂商）
interface ContentGenerator {
  // 生成流式响应
  generateContentStream(
    contents: Content[],
    signal: AbortSignal
  ): AsyncGenerator<GenerateContentResponse>;

  // 统计 Token
  countTokens(contents: Content[]): Promise<number>;
}

// OpenAI 兼容实现
class OpenAIContentGenerator implements ContentGenerator {
  private readonly client: OpenAI;
  private readonly converter: OpenAIContentConverter;

  async *generateContentStream(contents, signal) {
    // 1. 转换为 OpenAI 格式
    const messages = this.converter.toOpenAIMessages(contents);

    // 2. 调用 OpenAI API
    const stream = await this.client.chat.completions.create({
      model: this.modelId,
      messages,
      tools: this.getToolDefinitions(),
      stream: true
    });

    // 3. 转换响应为 Gemini 格式
    for await (const chunk of stream) {
      yield this.converter.convertOpenAIChunkToGemini(chunk);
    }
  }
}`}
        />

        <div className="mt-6">
          <CodeBlock
            title="流式工具调用解析"
            language="typescript"
            code={`// 处理 OpenAI 流式响应中的工具调用
class StreamingToolCallParser {
  private buffers: Map<number, string> = new Map();  // 每个工具调用的 JSON 缓冲
  private depths: Map<number, number> = new Map();   // JSON 嵌套深度

  addChunk(index: number, chunk: string, id?: string, name?: string) {
    // 累积 JSON 片段
    const buffer = (this.buffers.get(index) || '') + chunk;
    this.buffers.set(index, buffer);

    // 更新嵌套深度
    let depth = this.depths.get(index) || 0;
    for (const char of chunk) {
      if (char === '{' || char === '[') depth++;
      if (char === '}' || char === ']') depth--;
    }
    this.depths.set(index, depth);

    // 深度为 0 时尝试解析
    if (depth === 0 && buffer) {
      try {
        const args = JSON.parse(buffer);
        return { complete: true, value: args };
      } catch {
        return { complete: false };
      }
    }

    return { complete: false };
  }
}`}
          />
        </div>
      </Layer>

      {/* ToolRegistry */}
      <Layer title="ToolRegistry - 工具注册" icon="📚">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/tools/tool-registry.ts
        </div>

        <CodeBlock
          title="工具注册表"
          language="typescript"
          code={`// 工具注册表 - 管理所有可用工具
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

    // 获取所有工具定义（发送给 AI）
    getToolDefinitions(): ToolDefinition[] {
        return Array.from(this.tools.values()).map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }
        }));
    }
}

// 初始化时注册所有工具
function createToolRegistry(config: Config) {
    const registry = new ToolRegistry();

    // 文件操作工具
    registry.register(new ReadFileTool(config));
    registry.register(new WriteFileTool(config));
    registry.register(new EditTool(config));

    // 搜索工具
    registry.register(new GlobTool(config));
    registry.register(new GrepTool(config));

    // 执行工具
    registry.register(new BashTool(config));

    // 特殊工具
    registry.register(new TaskTool(config));     // 子代理
    registry.register(new WebSearchTool(config)); // 网页搜索

    return registry;
}`}
        />
      </Layer>

      {/* BaseDeclarativeTool */}
      <Layer title="BaseDeclarativeTool - 工具基类" icon="🔧">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/tools/tools.ts
        </div>

        <CodeBlock
          title="工具基类实现"
          language="typescript"
          code={`// 所有工具都继承这个基类
abstract class BaseDeclarativeTool<TParams, TResult> {
    readonly name: string;          // 工具名称，如 "read_file"
    readonly description: string;   // 描述，告诉 AI 这个工具做什么
    readonly parameters: Schema;    // JSON Schema 参数定义
    readonly kind: Kind;            // 类型：Read, Write, Execute

    // 验证参数（子类实现）
    protected abstract validateToolParamValues(
        params: TParams
    ): string | null;

    // 创建执行实例（子类实现）
    protected abstract createInvocation(
        params: TParams
    ): ToolInvocation<TParams, TResult>;

    // 调用工具的入口
    async invoke(params: TParams): Promise<TResult> {
        // 1. 验证参数
        const error = this.validateToolParamValues(params);
        if (error) throw new ToolValidationError(error);

        // 2. 创建调用实例
        const invocation = this.createInvocation(params);

        // 3. 执行并返回结果
        return invocation.execute();
    }
}

// 具体工具示例：Read 工具
class ReadFileTool extends BaseDeclarativeTool<ReadParams, string> {
    name = 'Read';
    description = 'Reads a file from the local filesystem...';
    kind = Kind.Read;

    validateToolParamValues(params: ReadParams) {
        if (!params.file_path) return 'file_path is required';
        if (!path.isAbsolute(params.file_path)) return 'file_path must be absolute';
        return null;
    }

    createInvocation(params: ReadParams) {
        return new ReadFileInvocation(params, this.config);
    }
}`}
        />
      </Layer>

      {/* 工具调度器 */}
      <Layer title="ToolScheduler - 工具调度" icon="⚡">
        <div className="text-sm text-gray-400 font-mono mb-4">
          packages/core/src/core/coreToolScheduler.ts
        </div>

        <p className="text-gray-300 mb-4">
          工具调度器管理工具的执行生命周期，支持并行执行和状态追踪：
        </p>

        <CodeBlock
          title="工具调度器核心"
          language="typescript"
          code={`// 工具调用状态
type ToolCallState =
  | 'validating'      // 验证参数中
  | 'scheduled'       // 已调度，等待执行
  | 'waiting'         // 等待用户审批
  | 'executing'       // 执行中
  | 'success'         // 成功完成
  | 'cancelled'       // 用户取消
  | 'errored';        // 执行出错

class CoreToolScheduler {
  private toolCalls: Map<string, ToolCall> = new Map();

  // 调度工具执行
  async schedule(request: ToolCallRequestInfo): Promise<void> {
    const toolCall: ToolCall = {
      id: request.callId,
      state: 'validating',
      request,
      startTime: Date.now(),
    };

    this.toolCalls.set(request.callId, toolCall);

    // 验证工具是否存在
    const tool = this.toolRegistry.getTool(request.name);
    if (!tool) {
      this.updateState(request.callId, 'errored', 'Tool not found');
      return;
    }

    // 检查是否需要用户审批
    if (this.requiresApproval(tool, request.args)) {
      this.updateState(request.callId, 'waiting');
      return;  // 等待用户操作
    }

    // 执行工具
    await this.execute(request.callId);
  }

  // 执行工具
  async execute(callId: string): Promise<void> {
    const toolCall = this.toolCalls.get(callId);
    this.updateState(callId, 'executing');

    try {
      const tool = this.toolRegistry.getTool(toolCall.request.name);
      const result = await tool.invoke(toolCall.request.args);

      this.updateState(callId, 'success', result);
    } catch (error) {
      this.updateState(callId, 'errored', error.message);
    }
  }
}`}
        />
      </Layer>

      {/* 设计总结 */}
      <Layer title="架构设计总结" icon="🎨">
        <div className="grid md:grid-cols-2 gap-4">
          <HighlightBox title="分层设计" icon="📊" variant="blue">
            <ul className="text-sm space-y-1">
              <li>• <strong>GeminiClient</strong>: 最高层，管理整体流程</li>
              <li>• <strong>Turn</strong>: 中间层，管理单次响应</li>
              <li>• <strong>GeminiChat</strong>: 历史管理和消息格式</li>
              <li>• <strong>ContentGenerator</strong>: API 调用抽象</li>
              <li>• <strong>ToolScheduler</strong>: 工具执行管理</li>
            </ul>
          </HighlightBox>

          <HighlightBox title="关键模式" icon="🔑" variant="purple">
            <ul className="text-sm space-y-1">
              <li>• <strong>AsyncGenerator</strong>: 流式处理</li>
              <li>• <strong>Provider Pattern</strong>: 多厂商支持</li>
              <li>• <strong>State Machine</strong>: 工具调用状态</li>
              <li>• <strong>Decorator Pattern</strong>: 工具能力扩展</li>
            </ul>
          </HighlightBox>
        </div>

        <div className="mt-6 p-4 bg-[var(--bg-terminal)] rounded-lg">
          <h4 className="font-semibold text-[var(--terminal-green)] mb-2">🔗 代码阅读路径</h4>
          <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
            <li>入口: <code>packages/cli/src/ui/hooks/useGeminiStream.ts</code> → submitQuery</li>
            <li>核心: <code>packages/core/src/core/client.ts</code> → sendMessageStream</li>
            <li>Turn: <code>packages/core/src/core/turn.ts</code> → run</li>
            <li>API: <code>packages/core/src/core/openaiContentGenerator/pipeline.ts</code></li>
            <li>工具: <code>packages/core/src/tools/</code> 目录下的各工具实现</li>
          </ol>
        </div>
      </Layer>
    </div>
  );
}
