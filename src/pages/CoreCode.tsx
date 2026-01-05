import { useState } from 'react';
import { Layer } from '../components/Layer';
import { CodeBlock } from '../components/CodeBlock';
import { HighlightBox } from '../components/HighlightBox';
import { RelatedPages, type RelatedPage } from '../components/RelatedPages';

const relatedPages: RelatedPage[] = [
  { id: 'gemini-chat', label: '核心循环', description: 'GeminiChat 详细解析' },
  { id: 'turn-state-machine', label: 'Turn状态机', description: 'Turn 状态流转详解' },
  { id: 'content-gen', label: 'API调用层', description: 'ContentGenerator 深度解析' },
  { id: 'tool-arch', label: '工具架构', description: '工具系统架构全景' },
  { id: 'tool-scheduler', label: '工具调度详解', description: 'ToolScheduler 实现细节' },
  { id: 'streaming-tool-parser-anim', label: '流式工具解析', description: '流式工具调用解析动画' },
];

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
          packages/core/src/core/contentGenerator.ts
        </div>

        <p className="text-gray-300 mb-4">
          ContentGenerator 是与 Gemini API（或 Code Assist Server）交互的抽象层：上游主线直接使用 <code>@google/genai</code> 的
          <code>GoogleGenAI</code>，并用 <code>LoggingContentGenerator</code>/<code>RecordingContentGenerator</code> 做装饰增强。
        </p>

        <CodeBlock
          title="ContentGenerator 接口与创建（上游摘录）"
          language="typescript"
          code={`// packages/core/src/core/contentGenerator.ts
export interface ContentGenerator {
  generateContent(request: GenerateContentParameters, userPromptId: string): Promise<GenerateContentResponse>;
  generateContentStream(request: GenerateContentParameters, userPromptId: string): Promise<AsyncGenerator<GenerateContentResponse>>;
  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;
  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  const generator = await (async () => {
    if (config.authType === AuthType.LOGIN_WITH_GOOGLE || config.authType === AuthType.COMPUTE_ADC) {
      return new LoggingContentGenerator(
        await createCodeAssistContentGenerator(httpOptions, config.authType, gcConfig, sessionId),
        gcConfig,
      );
    }

    const googleGenAI = new GoogleGenAI({ apiKey: config.apiKey, vertexai: config.vertexai, httpOptions });
    return new LoggingContentGenerator(googleGenAI.models, gcConfig);
  })();

  return gcConfig.recordResponses ? new RecordingContentGenerator(generator, gcConfig.recordResponses) : generator;
}`}
        />

        <HighlightBox title="与 OpenAI/tool_calls 的差异" icon="🧭" variant="yellow">
          <p className="m-0 text-sm text-gray-300">
            上游 Gemini CLI 的主线不会解析 SSE 文本流或 OpenAI <code>tool_calls</code> 增量 JSON；它直接从 SDK 响应读取结构化
            <code>functionCalls</code>，并在 <code>Turn.run()</code> 里产出 <code>ToolCallRequest</code> 事件。
          </p>
        </HighlightBox>
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
    private allKnownTools = new Map<string, AnyDeclarativeTool>();

    constructor(
        private readonly config: Config,
        private readonly messageBus: MessageBus,
    ) {}

    // 注册工具
    registerTool(tool: AnyDeclarativeTool) {
        // 同名冲突：MCP 工具会升级为 fully-qualified（<server>__<tool>）
        // 其他情况默认覆盖并 warn
        this.allKnownTools.set(tool.name, tool);
    }

    // 获取工具
    getTool(name: string) {
        return this.allKnownTools.get(name);
    }

    // 获取所有工具定义（发送给模型，@google/genai FunctionDeclaration）
    getFunctionDeclarations(): FunctionDeclaration[] {
        return Array.from(this.allKnownTools.values()).map(tool => tool.schema);
    }
}

// 上游入口：Config.createToolRegistry()
async function createToolRegistry(config: Config) {
    const registry = new ToolRegistry(config, config.getMessageBus());

    // 文件操作工具
    registry.registerTool(new ReadFileTool(config, config.getMessageBus()));    // read_file
    registry.registerTool(new WriteFileTool(config, config.getMessageBus()));   // write_file
    registry.registerTool(new SmartEditTool(config, config.getMessageBus()));   // replace

    // 搜索工具
    registry.registerTool(new LSTool(config, config.getMessageBus()));          // list_directory
    registry.registerTool(new GlobTool(config, config.getMessageBus()));        // glob
    registry.registerTool(new GrepTool(config, config.getMessageBus()));        // search_file_content (或 RipGrepTool)
    registry.registerTool(new WebSearchTool(config, config.getMessageBus()));   // google_web_search

    // 执行工具
    registry.registerTool(new ShellTool(config, config.getMessageBus()));       // run_shell_command

    // 特殊工具
    registry.registerTool(new MemoryTool(config.getMessageBus()));              // save_memory
    registry.registerTool(new WebFetchTool(config, config.getMessageBus()));    // web_fetch
    registry.registerTool(new ActivateSkillTool(config, config.getMessageBus()));// activate_skill
    // 条件注册：write_todos / delegate_to_agent（agents enabled + allowedTools）

    await registry.discoverAllTools(); // discovered_tool_*
    registry.sortTools();
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
          code={`// packages/core/src/tools/tools.ts（上游结构，节选）
export enum Kind {
  Read = 'read',
  Edit = 'edit',
  Delete = 'delete',
  Move = 'move',
  Search = 'search',
  Execute = 'execute',
  Think = 'think',
  Fetch = 'fetch',
  Other = 'other',
}

export interface ToolInvocation<TParams extends object, TResult extends ToolResult> {
  params: TParams;
  getDescription(): string;
  toolLocations(): ToolLocation[];
  shouldConfirmExecute(abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
  execute(
    signal: AbortSignal,
    updateOutput?: (output: string | AnsiOutput) => void,
    shellExecutionConfig?: ShellExecutionConfig,
  ): Promise<TResult>;
}

export abstract class DeclarativeTool<TParams extends object, TResult extends ToolResult> {
  constructor(
    readonly name: string,
    readonly displayName: string,
    readonly description: string,
    readonly kind: Kind,
    readonly parameterSchema: unknown,
    readonly messageBus: MessageBus,
    readonly isOutputMarkdown: boolean = true,
    readonly canUpdateOutput: boolean = false,
  ) {}

  get schema(): FunctionDeclaration {
    return { name: this.name, description: this.description, parametersJsonSchema: this.parameterSchema };
  }

  abstract build(params: TParams): ToolInvocation<TParams, TResult>;
}

export abstract class BaseDeclarativeTool<TParams extends object, TResult extends ToolResult>
  extends DeclarativeTool<TParams, TResult> {
  build(params: TParams): ToolInvocation<TParams, TResult> {
    const errors = SchemaValidator.validate(this.schema.parametersJsonSchema, params);
    if (errors) throw new Error(errors);
    return this.createInvocation(params, this.messageBus, this.name, this.displayName);
  }

  protected abstract createInvocation(
    params: TParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ): ToolInvocation<TParams, TResult>;
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
          code={`// packages/core/src/core/coreToolScheduler.ts（概念化伪代码，贴近上游结构）
type Status =
  | 'validating'
  | 'scheduled'
  | 'awaiting_approval'
  | 'executing'
  | 'success'
  | 'cancelled'
  | 'error';

class CoreToolScheduler {
  constructor(private readonly toolRegistry: ToolRegistry) {}

  async schedule(request: ToolCallRequestInfo, signal: AbortSignal): Promise<ToolCallResponseInfo> {
    // 1) 找到工具（name 必须匹配 ToolRegistry）
    const tool = this.toolRegistry.getTool(request.name);
    if (!tool) return createErrorResponse(request, new Error(\`Tool not found: \${request.name}\`));

    // 2) schema 校验 + build -> ToolInvocation
    const invocation = tool.build(request.args);

    // 3) PolicyEngine / MessageBus 决策是否需要确认
    const confirmation = await invocation.shouldConfirmExecute(signal);
    if (confirmation) {
      // UI 渲染 confirmationDetails，并在用户确认后继续
      await waitForUserDecision(confirmation);
    }

    // 4) 执行工具（可选 updateOutput 用于流式输出）
    const result = await invocation.execute(signal, updateOutput);

    // 5) ToolResult -> functionResponse parts（continuation 回注给模型）
    return convertToFunctionResponse(request, result);
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

      {/* 为什么这样设计 */}
      <Layer title="为什么这样设计？" icon="💡">
        <div className="space-y-4">
          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--terminal-green)]">
            <h4 className="text-[var(--terminal-green)] font-bold mb-2">为什么用 AsyncGenerator 实现流式处理？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：核心 API 使用 <code>AsyncGenerator&lt;Event, Turn&gt;</code> 返回事件流。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>实时反馈</strong>：用户看到 AI 逐字输出，体验更好</li>
                <li><strong>内存效率</strong>：不需要等待完整响应，边接收边处理</li>
                <li><strong>可组合性</strong>：上层可以 yield* 委托，形成流式管道</li>
                <li><strong>取消友好</strong>：配合 AbortSignal 可随时中断流</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--cyber-blue)]">
            <h4 className="text-[var(--cyber-blue)] font-bold mb-2">为什么 Turn 和 GeminiClient 分开？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：Turn 管理单次响应，GeminiClient 管理整个会话。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>职责清晰</strong>：Turn 专注单轮逻辑，Client 专注跨轮协调</li>
                <li><strong>状态隔离</strong>：每个 Turn 有独立的工具调用收集和完成状态</li>
                <li><strong>便于测试</strong>：可以独立测试单轮逻辑，不需要完整会话</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--purple)]">
            <h4 className="text-[var(--purple)] font-bold mb-2">为什么工具调用使用状态机模式？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：ToolScheduler 使用状态机管理工具调用生命周期。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>复杂状态</strong>：工具调用有验证、等待、执行、完成多种状态</li>
                <li><strong>并发安全</strong>：状态转换有明确规则，避免竞态条件</li>
                <li><strong>可观测性</strong>：每个状态转换都可以触发 UI 更新和日志</li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--bg-terminal)]/50 rounded-lg p-4 border-l-4 border-[var(--amber)]">
            <h4 className="text-[var(--amber)] font-bold mb-2">为什么 ContentGenerator 要抽象为接口？</h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>决策</strong>：ContentGenerator 是接口，有多个厂商实现。</p>
              <p><strong>原因</strong>：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>多厂商支持</strong>：OpenAI、Gemini 等 API 格式不同</li>
                <li><strong>统一内部格式</strong>：Core 层使用 Gemini 格式，Generator 负责转换</li>
                <li><strong>易于扩展</strong>：添加新厂商只需实现接口，不改核心逻辑</li>
              </ul>
            </div>
          </div>
        </div>
      </Layer>

      <RelatedPages pages={relatedPages} />
    </div>
  );
}
